import {
  countLine,
  createMarketRound,
  createMemoryRound,
  feedbackCopy,
  formatDuration,
  formatWhen,
  marketAccuracy,
  marketBrief,
  marketResultCopy,
  marketSummary,
  memoryBrief,
  memoryResultCopy,
  memorySummary,
  planDifficulty,
  scoreSelection,
  shuffle,
  suggestion,
  todayCount,
} from "./logic.js";
import { houseFront, itemIcon, marketFront, shopFront, townPoster } from "./icons.js";

const STORAGE_KEY = "time-town-v1";
const DRAFT_KEY = "time-town-draft";
const PLAYING = new Set([
  "intro", "memorize", "pick", "assist", "list", "shop", "assist-shop",
  "total", "assist-total", "change", "assist-change",
]);

const state = {
  voice: true,
  font: "large",
  sessions: [],
  persistError: false,
  screen: "welcome",
  game: null,
  plan: null,
  round: null,
  result: null,
  dialog: null,
  draft: null,
  toast: "",
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (typeof data.voice === "boolean") state.voice = data.voice;
    if (data.font === "large" || data.font === "xlarge") state.font = data.font;
    if (Array.isArray(data.sessions)) {
      state.sessions = data.sessions.map(sanitizeSession).filter(Boolean).slice(-40);
    }
  } catch {
    state.persistError = true;
  }
}

function sanitizeSession(session) {
  if (!session || (session.game !== "memory" && session.game !== "market")) return null;
  if (!["easy", "medium", "hard"].includes(session.level)) return null;
  if (typeof session.accuracy !== "number") return null;
  return {
    id: String(session.id || crypto.randomUUID()),
    game: session.game,
    level: session.level,
    accuracy: Math.min(1, Math.max(0, session.accuracy)),
    hints: Number(session.hints) || 0,
    assisted: Boolean(session.assisted),
    completed: session.completed !== false,
    durationMs: Number(session.durationMs) || 0,
    summary: String(session.summary || ""),
    at: Number(session.at) || Date.now(),
  };
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      voice: state.voice,
      font: state.font,
      sessions: state.sessions.slice(-40),
    }));
    state.persistError = false;
  } catch {
    state.persistError = true;
  }
}

function readDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !PLAYING.has(data.screen) || !data.plan || !data.game) return null;
    if (Date.now() - Number(data.savedAt) > 12 * 60 * 60 * 1000) return null;
    if (data.screen !== "intro" && (!data.round || !Array.isArray(data.round.targets))) return null;
    return data;
  } catch {
    return null;
  }
}

function persistDraft() {
  if (!PLAYING.has(state.screen)) return;
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
      screen: state.screen,
      game: state.game,
      plan: state.plan,
      round: state.round,
      savedAt: Date.now(),
    }));
  } catch {
    // 繼續遊玩比保存草稿重要。
  }
}

function clearDraft() {
  state.draft = null;
  try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* 沒有草稿也可以玩 */ }
}

function applyFont() {
  document.documentElement.dataset.font = state.font;
}

function speak(text) {
  if (!state.voice || !text || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "zh-TW";
  utter.rate = 0.9;
  const voices = synth.getVoices();
  const voice = voices.find((item) => /zh[-_]TW/i.test(item.lang))
    || voices.find((item) => item.lang.toLowerCase().startsWith("zh"));
  if (voice) utter.voice = voice;
  synth.speak(utter);
}

function nameOf(round, id) {
  return [...round.targets, ...round.choices].find((item) => item.id === id)?.name || "";
}

function itemById(round, id) {
  return [...round.targets, ...round.choices].find((item) => item.id === id);
}

function snapshot(score, targetCount) {
  return {
    hits: [...score.hits],
    extras: [...score.extras],
    missing: [...score.missing],
    targetCount,
    accuracy: score.accuracy,
    perfect: score.perfect,
  };
}

function speechFor() {
  const round = state.round;
  switch (state.screen) {
    case "welcome":
      return "歡迎來到時光小鎮。你可以去雜貨店記商品，或去菜市場買菜算錢。沒有時間限制。";
    case "map": {
      const done = todayCount(state.sessions);
      const today = done > 0 ? `今天已完成 ${done} 件事。` : "今天做一件事就可以。";
      return `${today}${suggestion(state.sessions).text}`;
    }
    case "intro":
      return state.game === "memory"
        ? `雜貨店。${memoryBrief(state.plan.level)}${state.plan.reason}`
        : `菜市場。${marketBrief(state.plan.level)}${state.plan.reason}`;
    case "memorize":
      return `請記住：${round.targets.map((item) => item.name).join("、")}。`;
    case "pick":
      return `找出剛才的商品。${countLine(round.selected.length, round.targets.length)}`;
    case "assist":
      return round.showAnswer
        ? `要找的是：${round.targets.map((item) => item.name).join("、")}。`
        : feedbackCopy(scoreSelection(round.targets, round.selected), (id) => nameOf(round, id));
    case "list":
      return `今天要買：${round.targets.map((item) => `${item.name} ${item.price} 元`).join("、")}。`;
    case "shop":
      return `選出清單裡的菜。${countLine(round.selected.length, round.targets.length)}`;
    case "assist-shop":
      return round.showAnswer
        ? `清單是：${round.targets.map((item) => item.name).join("、")}。接著算錢。`
        : feedbackCopy(scoreSelection(round.targets, round.selected), (id) => nameOf(round, id));
    case "total":
      return totalSpeech(round);
    case "assist-total":
      return round.showTotalAnswer ? `一共是 ${round.bill.total} 元。` : "金額可以再選一次。";
    case "change":
      return changeSpeech(round);
    case "assist-change":
      return round.showChangeAnswer ? `找回 ${round.bill.correct} 元。` : "找零可以再選一次。";
    case "result": {
      const next = planDifficulty(state.result.game, state.sessions);
      return `${state.result.headline}。${state.result.detail}用了 ${state.result.hints} 次提示，時間 ${formatDuration(state.result.durationMs)}。下次：${next.reason}`;
    }
    case "house":
      return "這裡看遊戲紀錄。紀錄只留在這台手機，不能用來判斷健康。";
    default:
      return "時光小鎮";
  }
}

function totalSpeech(round) {
  if (round.totalHint >= 3 || round.showTotalAnswer) return `一共是 ${round.bill.total} 元。`;
  if (round.totalHint >= 2) return `價錢加起來是 ${round.bill.total} 元。`;
  if (round.totalHint >= 1) return "先把每樣的價錢加起來。";
  return "這些菜一共多少元？";
}

function changeSpeech(round) {
  if (round.changeHint >= 3 || round.showChangeAnswer) return `找回 ${round.bill.correct} 元。`;
  if (round.changeHint >= 2) return `${round.bill.pay} 減 ${round.bill.total}。`;
  if (round.changeHint >= 1) return "用拿出的錢，減去一共的金額。";
  return `一共 ${round.bill.total} 元，你拿出 ${round.bill.pay} 元。要找回多少？`;
}

function render(options = {}) {
  const y = options.keepScroll ? window.scrollY : 0;
  const app = document.getElementById("app");
  try {
    app.innerHTML = view();
    app.dataset.screen = state.screen;
  } catch (error) {
    console.error(error);
    app.innerHTML = `<main class="screen"><h1>畫面沒有順利打開</h1><p>${esc(error.message)}</p><button class="btn btn-primary" type="button" data-action="go-welcome">回首頁</button></main>`;
    return;
  }
  const heading = document.querySelector("h1")?.textContent || "時光小鎮";
  document.title = state.screen === "welcome" ? "時光小鎮" : `時光小鎮｜${heading}`;
  applyFont();
  document.body.classList.toggle("modal-open", Boolean(state.dialog));
  window.scrollTo(0, options.keepScroll ? y : 0);
  if (state.dialog) document.querySelector(".dialog .btn")?.focus();
  else if (options.focusKey) {
    document.querySelector(`[data-focus-key="${CSS.escape(options.focusKey)}"]`)?.focus({ preventScroll: true });
  }
  persistDraft();
}

function show(screen) {
  state.toast = "";
  state.screen = screen;
  render();
  speak(speechFor());
}

function button(label, action, variant = "primary", attrs = {}) {
  const extra = Object.entries(attrs).map(([key, value]) => `${key}="${esc(value)}"`).join(" ");
  return `<button class="btn btn-${variant}" type="button" data-action="${esc(action)}" ${extra}>${esc(label)}</button>`;
}

function voiceButton() {
  return `<button class="btn btn-small btn-quiet" type="button" data-action="toggle-voice" aria-pressed="${state.voice ? "true" : "false"}">${state.voice ? "語音：開" : "語音：關"}</button>`;
}

function header(mode) {
  const left = mode === "game"
    ? `<button class="btn btn-small btn-quiet" type="button" data-action="ask-leave">離開</button>`
    : mode === "back"
      ? `<button class="btn btn-small btn-quiet" type="button" data-action="go-map">回小鎮</button>`
      : `<span class="brand">時光小鎮</span>`;
  return `<header class="topbar"><div class="topbar-row">${left}${voiceButton()}</div></header>`;
}

function shell({ mode, body, dock = [] }) {
  return `${header(mode)}
    <main class="screen${dock.length ? ` has-dock dock-${Math.min(dock.length, 3)}` : ""}">
      ${state.toast ? `<p class="toast" role="status">${esc(state.toast)}</p>` : ""}
      ${body}
    </main>
    ${dock.length ? `<div class="dock">${dock.join("")}</div>` : ""}
    ${dialogHtml()}`;
}

function dialogHtml() {
  if (!state.dialog) return "";
  const dialog = state.dialog;
  return `<div class="overlay"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <h2 id="dialog-title">${esc(dialog.title)}</h2>
    <p>${esc(dialog.body)}</p>
    ${button(dialog.yes, dialog.yesAction, "primary")}
    ${button(dialog.no, "close-dialog", "secondary")}
  </div></div>`;
}

function staticCard(item, withPrice = false) {
  return `<div class="static-card">${itemIcon(item)}<span class="item-name">${esc(item.name)}</span>${withPrice ? `<span class="item-price">${item.price} 元</span>` : ""}</div>`;
}

function choiceButton(item, round, withPrice = false) {
  const pressed = round.selected.includes(item.id);
  const locked = round.locked.includes(item.id);
  const classes = ["item"];
  if (round.highlightId === item.id) classes.push("is-hint");
  if (locked) classes.push("is-locked");
  return `<button class="${classes.join(" ")}" type="button" data-action="toggle" data-id="${esc(item.id)}" data-focus-key="${esc(item.id)}" aria-pressed="${pressed ? "true" : "false"}" aria-label="${esc(item.name)}${pressed ? "，已選" : "，未選"}">
    ${itemIcon(item)}
    <span class="item-name">${esc(item.name)}</span>
    ${withPrice ? `<span class="item-price">${item.price} 元</span>` : ""}
    ${pressed ? `<span class="badge">${locked ? "找到了" : "已選"}</span>` : ""}
  </button>`;
}

function moneyButton(amount, chosen, action) {
  const pressed = chosen === amount;
  return `<button class="money" type="button" data-action="${action}" data-amount="${amount}" data-focus-key="${action}-${amount}" aria-pressed="${pressed ? "true" : "false"}">${amount} 元</button>`;
}

function hintBanner(round) {
  if (!round.highlightId || !round.hintLabel) return "";
  const item = itemById(round, round.highlightId);
  const text = round.hintMode === "extra" ? `可以放下：${round.hintLabel}` : `圖片提示：${round.hintLabel}`;
  return `<div class="hint-banner">${item ? itemIcon(item) : ""}<p>${esc(text)}</p></div>`;
}

function billList(items) {
  return `<ul class="bill">${items.map((item) => `<li>${itemIcon(item)}<span class="item-name">${esc(item.name)}</span><span>${item.price} 元</span></li>`).join("")}</ul>`;
}

function equationHtml(parts) {
  return `<p class="equation">${parts.map((part) => `<span>${esc(part)}</span>`).join("")}</p>`;
}

function sumParts(items) {
  const parts = [];
  items.forEach((item, index) => {
    if (index) parts.push("+");
    parts.push(String(item.price));
  });
  parts.push("=");
  parts.push(String(items.reduce((sum, item) => sum + item.price, 0)));
  return parts;
}

function viewWelcome() {
  return `<main class="screen welcome">
    <div class="hero">
      ${townPoster()}
      <div class="signboard">
        <p class="eyebrow">每天一件小事</p>
        <h1>時光小鎮</h1>
      </div>
    </div>
    <p class="lead">去雜貨店記商品，或去菜市場買菜、算錢。沒有考試，也沒有時間限制。</p>
    ${state.toast ? `<p class="toast" role="status">${esc(state.toast)}</p>` : ""}
    ${state.draft ? button("繼續上次的活動", "resume", "primary") : ""}
    ${button("進入小鎮", "enter", state.draft ? "secondary" : "primary")}
    ${button("聽說明", "replay", "secondary")}
    <details class="install">
      <summary>放在 iPhone 主畫面</summary>
      <ol class="steps">
        <li>用 Safari 打開這個頁面。</li>
        <li>點下方的分享按鈕。</li>
        <li>往下點「加入主畫面」。</li>
      </ol>
    </details>
  </main>${dialogHtml()}`;
}

function storeButton(game, name, desc, art, suggested) {
  return `<button class="store" type="button" data-action="open-place" data-game="${game}">
    ${art}
    <span class="store-copy">
      ${suggested ? `<span class="ribbon">今天建議</span>` : ""}
      <span class="store-name">${name}</span>
      <span class="store-desc">${desc}</span>
    </span>
  </button>`;
}

function viewMap() {
  const tip = suggestion(state.sessions);
  const done = todayCount(state.sessions);
  return shell({
    mode: "brand",
    body: `<h1>今天去哪裡？</h1>
      <p class="lead">${esc(done ? `今天已完成 ${done} 件事，可以休息，也可以再去一處。` : "做完一件事就可以休息。")}</p>
      <p class="suggest">${esc(tip.text)}</p>
      <div class="street">
        ${storeButton("memory", "雜貨店", "記住商品，再找出來", shopFront(), tip.game === "memory")}
        ${storeButton("market", "菜市場", "買菜、算錢、找零", marketFront(), tip.game === "market")}
        <button class="store" type="button" data-action="go-house">
          ${houseFront()}
          <span class="store-copy"><span class="store-name">我家</span><span class="store-desc">看紀錄與文字大小</span></span>
        </button>
      </div>
      ${button("再聽一次", "replay", "quiet")}`,
  });
}

function viewIntro() {
  const memory = state.game === "memory";
  return shell({
    mode: "back",
    body: `<div class="place-hero">${memory ? shopFront() : marketFront()}</div>
      <p class="eyebrow">${memory ? "雜貨店" : "菜市場"}</p>
      <h1>${memory ? "記住商品" : "買菜算錢"}</h1>
      <p class="lead">${esc(memory ? memoryBrief(state.plan.level) : marketBrief(state.plan.level))}</p>
      <section class="note"><h2>這次為什麼這樣安排</h2><p>${esc(state.plan.reason)}</p></section>`,
    dock: [button("開始", "start", "primary"), button("再聽一次", "replay", "quiet")],
  });
}

function viewMemorize() {
  const round = state.round;
  return shell({
    mode: "game",
    body: `<p class="eyebrow">雜貨店</p><h1>請記住這 ${round.targets.length} 樣</h1>
      <p class="lead">看完後按我記住了。沒有時間限制。</p>
      ${button("念給我聽", "replay", "quiet")}
      <div class="grid">${round.targets.map((item) => staticCard(item)).join("")}</div>`,
    dock: [button("我記住了", "ready-memory", "primary")],
  });
}

function viewPick() {
  const round = state.round;
  return shell({
    mode: "game",
    body: `<p class="eyebrow">雜貨店</p><h1>找出剛才的商品</h1>
      <p class="lead">${esc(countLine(round.selected.length, round.targets.length))}</p>
      ${hintBanner(round)}
      ${button("請給我提示", "hint", "quiet")}
      <div class="grid">${round.choices.map((item) => choiceButton(item, round)).join("")}</div>`,
    dock: [button("我選好了", "submit-memory", "primary")],
  });
}

function viewAssist() {
  const round = state.round;
  if (round.showAnswer) {
    return shell({
      mode: "game",
      body: `<p class="eyebrow">雜貨店</p><h1>要找的是這些</h1>
        <div class="grid">${round.targets.map((item) => staticCard(item)).join("")}</div>`,
      dock: [button("完成", "finish-memory", "primary"), button("再聽一次", "replay", "quiet")],
    });
  }
  const score = scoreSelection(round.targets, round.selected);
  return shell({
    mode: "game",
    body: `<p class="eyebrow">雜貨店</p><h1>沒關係，可以再試</h1>
      <p class="lead">${esc(feedbackCopy(score, (id) => nameOf(round, id)))}</p>
      ${button("再找一次", "retry-memory", "primary")}
      ${button("請給我提示", "hint", "quiet")}
      ${button("請告訴我", "reveal-memory", "secondary")}`,
  });
}

function viewList() {
  const round = state.round;
  return shell({
    mode: "game",
    body: `<p class="eyebrow">菜市場</p><h1>今天的清單</h1>
      <p class="lead">先看要買什麼。等一下清單還會留在畫面上。</p>
      ${billList(round.targets)}
      ${button("念給我聽", "replay", "quiet")}`,
    dock: [button("開始選菜", "ready-shop", "primary")],
  });
}

function viewShop() {
  const round = state.round;
  return shell({
    mode: "game",
    body: `<p class="eyebrow">菜市場</p><h1>選出清單裡的菜</h1>
      <p class="basket">今天要買：${esc(round.targets.map((item) => item.name).join("、"))}</p>
      <p class="lead">${esc(countLine(round.selected.length, round.targets.length))}</p>
      ${hintBanner(round)}
      ${button("請給我提示", "hint", "quiet")}
      <div class="grid">${round.choices.map((item) => choiceButton(item, round, true)).join("")}</div>`,
    dock: [button("我選好了", "submit-shop", "primary")],
  });
}

function viewAssistShop() {
  const round = state.round;
  if (round.showAnswer) {
    return shell({
      mode: "game",
      body: `<p class="eyebrow">菜市場</p><h1>清單是這些</h1>
        <div class="grid">${round.targets.map((item) => staticCard(item, true)).join("")}</div>`,
      dock: [button("繼續算錢", "continue-money", "primary"), button("再聽一次", "replay", "quiet")],
    });
  }
  const score = scoreSelection(round.targets, round.selected);
  return shell({
    mode: "game",
    body: `<p class="eyebrow">菜市場</p><h1>沒關係，可以再試</h1>
      <p class="lead">${esc(feedbackCopy(score, (id) => nameOf(round, id)))}</p>
      ${button("再找一次", "retry-shop", "primary")}
      ${button("請給我提示", "hint", "quiet")}
      ${button("請告訴我", "reveal-shop", "secondary")}`,
  });
}

function viewTotal() {
  const round = state.round;
  const work = round.totalHint >= 2 ? equationHtml(sumParts(round.targets)) : "";
  const hint = round.totalHint === 1 ? `<p class="suggest">先把每樣的價錢加起來。</p>` : "";
  return shell({
    mode: "game",
    body: `<p class="eyebrow">算金額</p><h1>一共多少元？</h1>
      ${billList(round.targets)}
      ${hint}
      ${work}
      ${button("請給我提示", "hint-total", "quiet")}
      <div class="grid">${round.totalOptions.map((amount) => moneyButton(amount, round.totalChoice, "choose-total")).join("")}</div>`,
    dock: [button("就選這個", "submit-total", "primary")],
  });
}

function viewAssistTotal() {
  const round = state.round;
  if (round.showTotalAnswer) {
    return shell({
      mode: "game",
      body: `<p class="eyebrow">算金額</p><h1>一共 ${round.bill.total} 元</h1>
        ${equationHtml(sumParts(round.targets))}`,
      dock: [button("繼續算找零", "continue-change", "primary")],
    });
  }
  const chosen = round.totalChoice == null ? "可以再選一個金額。" : `你選了 ${round.totalChoice} 元。我們再看一次價錢。`;
  return shell({
    mode: "game",
    body: `<p class="eyebrow">算金額</p><h1>我們再看一次</h1><p class="lead">${esc(chosen)}</p>
      ${button("再選一次", "retry-total", "primary")}
      ${button("請給我提示", "hint-total", "quiet")}
      ${button("請告訴我", "reveal-total", "secondary")}`,
  });
}

function viewChange() {
  const round = state.round;
  let work = "";
  if (round.changeHint >= 3) work = equationHtml([String(round.bill.pay), "−", String(round.bill.total), "=", String(round.bill.correct)]);
  else if (round.changeHint >= 2) work = equationHtml([String(round.bill.pay), "−", String(round.bill.total), "=", "？"]);
  else if (round.changeHint >= 1) work = `<p class="suggest">用拿出的錢，減去一共的金額。</p>`;
  return shell({
    mode: "game",
    body: `<p class="eyebrow">算找零</p><h1>要找回多少？</h1>
      <p class="pay-note">一共 ${round.bill.total} 元</p>
      <p class="pay-note">你拿出 ${round.bill.pay} 元</p>
      ${work}
      ${button("請給我提示", "hint-change", "quiet")}
      <div class="grid">${round.bill.options.map((amount) => moneyButton(amount, round.changeChoice, "choose-change")).join("")}</div>`,
    dock: [button("就選這個", "submit-change", "primary")],
  });
}

function viewAssistChange() {
  const round = state.round;
  if (round.showChangeAnswer) {
    return shell({
      mode: "game",
      body: `<p class="eyebrow">算找零</p><h1>找回 ${round.bill.correct} 元</h1>
        ${equationHtml([String(round.bill.pay), "−", String(round.bill.total), "=", String(round.bill.correct)])}`,
      dock: [button("完成", "finish-market", "primary"), button("再聽一次", "replay", "quiet")],
    });
  }
  const chosen = round.changeChoice == null ? "可以再選一個金額。" : `你選了 ${round.changeChoice} 元。我們再算一次。`;
  return shell({
    mode: "game",
    body: `<p class="eyebrow">算找零</p><h1>我們再看一次</h1><p class="lead">${esc(chosen)}</p>
      ${button("再選一次", "retry-change", "primary")}
      ${button("請給我提示", "hint-change", "quiet")}
      ${button("請告訴我", "reveal-change", "secondary")}`,
  });
}

function viewResult() {
  const result = state.result;
  const next = planDifficulty(result.game, state.sessions);
  const done = todayCount(state.sessions);
  return shell({
    mode: "brand",
    body: `<p class="eyebrow">${esc(result.gameName)}</p>
      <p class="stamp" aria-hidden="true">${esc(result.headline)}</p>
      <h1>${esc(result.headline)}</h1>
      <p class="lead">${esc(result.detail)}</p>
      <p class="lead">${done === 1 ? "今天的一件事完成了。" : `今天已完成 ${done} 件事。`}</p>
      <dl class="stats"><div><dt>提示</dt><dd>${result.hints} 次</dd></div><div><dt>時間</dt><dd>${esc(formatDuration(result.durationMs))}</dd></div></dl>
      <section class="note"><h2>下次會這樣安排</h2><p>${esc(next.reason)}</p></section>
      ${button("再玩一次", "play-again", "primary")}
      ${button("回小鎮", "go-map", "secondary")}
      ${button("再聽一次", "replay", "quiet")}`,
  });
}

function viewHouse() {
  const memory = planDifficulty("memory", state.sessions);
  const market = planDifficulty("market", state.sessions);
  const recent = [...state.sessions].reverse().slice(0, 6);
  const log = recent.length
    ? `<ul class="log">${recent.map((session) => `<li>
        <span class="log-when">${esc(formatWhen(session.at))}</span>
        <span class="log-place">${session.game === "memory" ? "雜貨店" : "菜市場"}</span>
        <span class="log-summary">${esc(session.summary)}</span>
        <span class="log-meta">提示 ${session.hints} 次・${esc(formatDuration(session.durationMs))}</span>
      </li>`).join("")}</ul>`
    : `<p class="empty">還沒有紀錄。先去雜貨店走走吧。</p>`;
  return shell({
    mode: "back",
    body: `<p class="eyebrow">我家</p><h1>最近的紀錄</h1>
      ${state.persistError ? `<p class="warn">這台手機沒有保存紀錄。請用 Safari 一般模式開啟。</p>` : ""}
      <p class="lead">紀錄只留在這台手機，不會上傳，也不能用來判斷健康。</p>
      ${button("再聽一次", "replay", "quiet")}
      ${log}
      <section class="note">
        <h2>下次雜貨店</h2><p>${esc(memory.reason)}</p>
        <h2>下次菜市場</h2><p>${esc(market.reason)}</p>
      </section>
      <section class="note">
        <h2>難度怎麼調整</h2>
        <ul>
          <li>第一次玩，項目比較少。</li>
          <li>用了兩次以上提示、正確不到七成，或需要看答案，下次會減少項目。</li>
          <li>連續兩次都很順利，下次才多一項。</li>
          <li>其他情況維持原來的分量。</li>
        </ul>
      </section>
      <h2>文字大小</h2>
      <div class="segment">
        ${button("大字", "font-large", "secondary", { "aria-pressed": state.font === "large" ? "true" : "false" })}
        ${button("特大字", "font-xlarge", "secondary", { "aria-pressed": state.font === "xlarge" ? "true" : "false" })}
      </div>
      <h2>放在 iPhone 主畫面</h2>
      <ol class="steps">
        <li>用 Safari 打開這個頁面。</li>
        <li>點下方的分享按鈕。</li>
        <li>往下點「加入主畫面」。</li>
      </ol>
      ${button("清除紀錄", "ask-clear", "secondary")}`,
  });
}

function view() {
  switch (state.screen) {
    case "welcome": return viewWelcome();
    case "map": return viewMap();
    case "intro": return viewIntro();
    case "memorize": return viewMemorize();
    case "pick": return viewPick();
    case "assist": return viewAssist();
    case "list": return viewList();
    case "shop": return viewShop();
    case "assist-shop": return viewAssistShop();
    case "total": return viewTotal();
    case "assist-total": return viewAssistTotal();
    case "change": return viewChange();
    case "assist-change": return viewAssistChange();
    case "result": return viewResult();
    case "house": return viewHouse();
    default: return viewWelcome();
  }
}

function blankRound(kind, level, made) {
  return {
    kind,
    level,
    targets: made.targets,
    choices: made.choices,
    selected: [],
    locked: [],
    hints: 0,
    assisted: false,
    showAnswer: false,
    highlightId: null,
    hintLabel: "",
    hintMode: "",
    hintCursor: 0,
    selectionScore: null,
    totalOptions: made.totalOptions ? shuffle(made.totalOptions) : [],
    totalChoice: null,
    totalHint: 0,
    showTotalAnswer: false,
    firstTotalCorrect: null,
    bill: made.bill ? { ...made.bill, options: shuffle(made.bill.options) } : null,
    changeChoice: null,
    changeHint: 0,
    showChangeAnswer: false,
    firstChangeCorrect: null,
    startedAt: Date.now(),
    saved: false,
  };
}

function applyHint(round) {
  const score = scoreSelection(round.targets, round.selected);
  round.hints += 1;
  const pool = score.missing.length ? score.missing : score.extras;
  if (!pool.length) {
    round.highlightId = null;
    round.hintLabel = "";
    return "都選好了，可以按我選好了。";
  }
  const id = pool[round.hintCursor % pool.length];
  round.hintCursor += 1;
  round.highlightId = id;
  round.hintMode = score.missing.length ? "missing" : "extra";
  round.hintLabel = nameOf(round, id);
  return round.hintMode === "missing" ? `圖片提示：${round.hintLabel}。` : `${round.hintLabel}可以先放下。`;
}

function soften(copy, hints) {
  if (hints >= 2 && copy.headline === "做得好") {
    return { headline: "你完成了", detail: `${copy.detail}提示有幫上忙。` };
  }
  return copy;
}

function saveSession(partial) {
  state.sessions.push({
    id: crypto.randomUUID(),
    at: Date.now(),
    completed: true,
    ...partial,
  });
  if (state.sessions.length > 40) state.sessions = state.sessions.slice(-40);
  save();
}

function finishMemory() {
  const round = state.round;
  if (!round || round.saved) return;
  round.saved = true;
  if (!round.selectionScore) {
    round.selectionScore = snapshot(scoreSelection(round.targets, round.selected), round.targets.length);
  }
  const durationMs = Date.now() - round.startedAt;
  const copy = soften(memoryResultCopy(round.selectionScore, round.assisted), round.hints);
  saveSession({
    game: "memory",
    level: round.level,
    accuracy: round.selectionScore.accuracy,
    hints: round.hints,
    assisted: round.assisted,
    durationMs,
    summary: memorySummary(round.selectionScore),
  });
  state.result = { game: "memory", gameName: "雜貨店", ...copy, hints: round.hints, durationMs };
  clearDraft();
  state.round = null;
  show("result");
}

function finishMarket() {
  const round = state.round;
  if (!round || round.saved) return;
  round.saved = true;
  if (!round.selectionScore) {
    round.selectionScore = snapshot(scoreSelection(round.targets, round.selected), round.targets.length);
  }
  if (round.firstTotalCorrect == null) round.firstTotalCorrect = false;
  if (round.firstChangeCorrect == null) round.firstChangeCorrect = false;
  const durationMs = Date.now() - round.startedAt;
  const copy = soften(marketResultCopy({
    targetCount: round.targets.length,
    hitCount: round.selectionScore.hits.length,
    totalCorrect: round.firstTotalCorrect,
    changeCorrect: round.firstChangeCorrect,
    assisted: round.assisted,
  }), round.hints);
  saveSession({
    game: "market",
    level: round.level,
    accuracy: marketAccuracy(round.selectionScore.accuracy, round.firstTotalCorrect, round.firstChangeCorrect),
    hints: round.hints,
    assisted: round.assisted,
    durationMs,
    summary: marketSummary({
      hitCount: round.selectionScore.hits.length,
      targetCount: round.targets.length,
      totalCorrect: round.firstTotalCorrect,
      changeCorrect: round.firstChangeCorrect,
    }),
  });
  state.result = { game: "market", gameName: "菜市場", ...copy, hints: round.hints, durationMs };
  clearDraft();
  state.round = null;
  show("result");
}

const actions = {
  enter() {
    clearDraft();
    show("map");
  },
  resume() {
    const draft = state.draft || readDraft();
    if (!draft) return show("map");
    state.game = draft.game;
    state.plan = draft.plan;
    state.round = draft.round;
    state.draft = null;
    show(draft.screen);
  },
  replay() {
    if (!state.voice) {
      state.toast = "語音目前是關的。要聽的內容，畫面上都有。";
      render({ keepScroll: true });
      return;
    }
    state.toast = "";
    speak(speechFor());
  },
  "toggle-voice"() {
    state.voice = !state.voice;
    if (!state.voice) window.speechSynthesis?.cancel();
    save();
    render({ keepScroll: true });
    if (state.voice) speak("語音已開啟");
  },
  "open-place"(target) {
    state.game = target.dataset.game;
    state.plan = planDifficulty(state.game, state.sessions);
    state.round = null;
    show("intro");
  },
  start() {
    const level = state.plan.level;
    if (state.game === "memory") {
      state.round = blankRound("memory", level, createMemoryRound(level));
      show("memorize");
    } else {
      state.round = blankRound("market", level, createMarketRound(level));
      show("list");
    }
  },
  "ready-memory"() { show("pick"); },
  "ready-shop"() { show("shop"); },
  toggle(target) {
    const round = state.round;
    const id = target.dataset.id;
    if (round.locked.includes(id)) {
      speak("這項已經找到了");
      return;
    }
    round.selected = round.selected.includes(id)
      ? round.selected.filter((item) => item !== id)
      : [...round.selected, id];
    render({ keepScroll: true, focusKey: id });
    speak(`${nameOf(round, id)}，${round.selected.includes(id) ? "已選" : "取消"}`);
  },
  "submit-memory"() {
    const round = state.round;
    if (!round.selected.length) {
      speak("先點一個商品");
      return;
    }
    const score = scoreSelection(round.targets, round.selected);
    if (!round.selectionScore) round.selectionScore = snapshot(score, round.targets.length);
    if (score.perfect) finishMemory();
    else show("assist");
  },
  "retry-memory"() {
    const round = state.round;
    const score = scoreSelection(round.targets, round.selected);
    round.locked = [...score.hits];
    round.selected = [...score.hits];
    round.highlightId = null;
    round.hintLabel = "";
    show("pick");
  },
  "reveal-memory"() {
    const round = state.round;
    if (!round.selectionScore) {
      round.selectionScore = snapshot(scoreSelection(round.targets, round.selected), round.targets.length);
    }
    round.assisted = true;
    round.showAnswer = true;
    show("assist");
  },
  "finish-memory": finishMemory,
  hint() {
    const round = state.round;
    const line = applyHint(round);
    state.screen = round.kind === "memory" ? "pick" : "shop";
    render();
    speak(line);
  },
  "submit-shop"() {
    const round = state.round;
    if (!round.selected.length) {
      speak("先點一樣菜");
      return;
    }
    const score = scoreSelection(round.targets, round.selected);
    if (!round.selectionScore) round.selectionScore = snapshot(score, round.targets.length);
    if (score.perfect) show("total");
    else show("assist-shop");
  },
  "retry-shop"() {
    const round = state.round;
    const score = scoreSelection(round.targets, round.selected);
    round.locked = [...score.hits];
    round.selected = [...score.hits];
    round.highlightId = null;
    round.hintLabel = "";
    show("shop");
  },
  "reveal-shop"() {
    const round = state.round;
    if (!round.selectionScore) {
      round.selectionScore = snapshot(scoreSelection(round.targets, round.selected), round.targets.length);
    }
    round.assisted = true;
    round.showAnswer = true;
    show("assist-shop");
  },
  "continue-money"() {
    state.round.selected = state.round.targets.map((item) => item.id);
    state.round.showAnswer = false;
    show("total");
  },
  "choose-total"(target) {
    state.round.totalChoice = Number(target.dataset.amount);
    render({ keepScroll: true, focusKey: `choose-total-${state.round.totalChoice}` });
    speak(`${state.round.totalChoice} 元`);
  },
  "submit-total"() {
    const round = state.round;
    if (round.totalChoice == null) {
      speak("先點一個金額");
      return;
    }
    const right = round.totalChoice === round.bill.total;
    if (round.firstTotalCorrect == null) round.firstTotalCorrect = right;
    if (right) show("change");
    else show("assist-total");
  },
  "hint-total"() {
    const round = state.round;
    round.hints += 1;
    round.totalHint = Math.min(3, round.totalHint + 1);
    if (state.screen === "assist-total") state.screen = "total";
    render();
    speak(totalSpeech(round));
  },
  "retry-total"() {
    state.round.totalChoice = null;
    show("total");
  },
  "reveal-total"() {
    const round = state.round;
    if (round.firstTotalCorrect == null) round.firstTotalCorrect = false;
    round.assisted = true;
    round.showTotalAnswer = true;
    show("assist-total");
  },
  "continue-change"() { show("change"); },
  "choose-change"(target) {
    state.round.changeChoice = Number(target.dataset.amount);
    render({ keepScroll: true, focusKey: `choose-change-${state.round.changeChoice}` });
    speak(`${state.round.changeChoice} 元`);
  },
  "submit-change"() {
    const round = state.round;
    if (round.changeChoice == null) {
      speak("先點一個金額");
      return;
    }
    const right = round.changeChoice === round.bill.correct;
    if (round.firstChangeCorrect == null) round.firstChangeCorrect = right;
    if (right) finishMarket();
    else show("assist-change");
  },
  "hint-change"() {
    const round = state.round;
    round.hints += 1;
    round.changeHint = Math.min(3, round.changeHint + 1);
    if (state.screen === "assist-change") state.screen = "change";
    render();
    speak(changeSpeech(round));
  },
  "retry-change"() {
    state.round.changeChoice = null;
    show("change");
  },
  "reveal-change"() {
    const round = state.round;
    if (round.firstChangeCorrect == null) round.firstChangeCorrect = false;
    round.assisted = true;
    round.showChangeAnswer = true;
    show("assist-change");
  },
  "finish-market": finishMarket,
  "play-again"() {
    state.plan = planDifficulty(state.result.game, state.sessions);
    state.game = state.result.game;
    show("intro");
  },
  "go-map"() {
    if (PLAYING.has(state.screen)) clearDraft();
    state.round = null;
    state.dialog = null;
    show("map");
  },
  "go-house"() { show("house"); },
  "go-welcome"() {
    state.dialog = null;
    state.round = null;
    show("welcome");
  },
  "ask-leave"() {
    state.dialog = {
      title: "要先離開嗎？",
      body: "這次先不記錄，之後可以再玩。",
      yes: "先離開",
      no: "繼續玩",
      yesAction: "confirm-leave",
    };
    render({ keepScroll: true });
  },
  "confirm-leave"() {
    state.dialog = null;
    clearDraft();
    state.round = null;
    show("map");
  },
  "ask-clear"() {
    state.dialog = {
      title: "清除這台手機上的紀錄？",
      body: "清除後，難度會重新從較少的項目開始。",
      yes: "清除",
      no: "先不要",
      yesAction: "confirm-clear",
    };
    render({ keepScroll: true });
  },
  "confirm-clear"() {
    state.sessions = [];
    state.dialog = null;
    save();
    show("house");
  },
  "close-dialog"() {
    state.dialog = null;
    render({ keepScroll: true });
  },
  "font-large"() {
    state.font = "large";
    save();
    render({ keepScroll: true });
  },
  "font-xlarge"() {
    state.font = "xlarge";
    save();
    render({ keepScroll: true });
  },
};

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target || !document.getElementById("app").contains(target)) return;
  const action = actions[target.dataset.action];
  if (action) action(target);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.dialog) {
    state.dialog = null;
    render({ keepScroll: true });
  }
});

load();
state.draft = readDraft();
applyFont();
render();

window.speechSynthesis?.getVoices();
window.speechSynthesis?.addEventListener?.("voiceschanged", () => {
  window.speechSynthesis.getVoices();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
