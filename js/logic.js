export const LEVELS = ["easy", "medium", "hard"];

export const GROCERY = [
  { id: "rice", name: "白米", tone: "#F6E7C4" },
  { id: "soy", name: "醬油", tone: "#F0D2B0" },
  { id: "egg", name: "雞蛋", tone: "#F8E7B8" },
  { id: "towel", name: "毛巾", tone: "#D9E6F4" },
  { id: "soap", name: "肥皂", tone: "#E5F0D4" },
  { id: "tea", name: "茶葉", tone: "#D7E4BE" },
  { id: "candy", name: "糖果", tone: "#F8D5DC" },
  { id: "can", name: "罐頭", tone: "#F0D7A4" },
  { id: "notebook", name: "筆記本", tone: "#F7F1E4" },
  { id: "slipper", name: "拖鞋", tone: "#F0CDB8" },
  { id: "umbrella", name: "雨傘", tone: "#F6D0C8" },
  { id: "cup", name: "杯子", tone: "#F4EFE8" },
];

export const MARKET = [
  { id: "cabbage", name: "高麗菜", tone: "#E3F0D4" },
  { id: "tomato", name: "番茄", tone: "#F8D7D0" },
  { id: "tofu", name: "豆腐", tone: "#F7F3E8" },
  { id: "scallion", name: "青蔥", tone: "#D9EEDC" },
  { id: "radish", name: "蘿蔔", tone: "#F4F1EA" },
  { id: "banana", name: "香蕉", tone: "#F8EAB4" },
  { id: "fish", name: "魚", tone: "#D5E6F2" },
  { id: "egg", name: "雞蛋", tone: "#F8E7B8" },
  { id: "sprout", name: "豆芽", tone: "#EEF0D4" },
  { id: "pumpkin", name: "南瓜", tone: "#F8D7B0" },
  { id: "mushroom", name: "香菇", tone: "#E7D3C0" },
  { id: "orange", name: "橘子", tone: "#FDE0B8" },
];

const MEMORY_SIZE = { easy: [3, 6], medium: [4, 8], hard: [5, 8] };
const MARKET_SIZE = { easy: [2, 4], medium: [3, 6], hard: [4, 8] };
const PRICES = {
  easy: [10, 20, 30, 40],
  medium: [10, 15, 20, 25, 30, 35],
  hard: [12, 14, 16, 18, 22, 24, 26, 28],
};

export function shuffle(list, rng = Math.random) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(rng() * (i + 1)));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function lower(level) {
  const index = Math.max(0, LEVELS.indexOf(level) - 1);
  return LEVELS[index] || "easy";
}

export function higher(level) {
  const index = Math.min(LEVELS.length - 1, Math.max(0, LEVELS.indexOf(level)) + 1);
  return LEVELS[index] || "hard";
}

export function struggled(session) {
  return Boolean(session.assisted) || session.hints >= 2 || session.accuracy < 0.7;
}

export function didWell(session) {
  return Boolean(session.completed) && !session.assisted && session.hints <= 1 && session.accuracy >= 0.9;
}

export function planDifficulty(game, sessions) {
  const history = sessions.filter((session) => session.game === game && session.completed);
  const last = history.at(-1);
  if (!last) {
    return { level: "easy", reason: "第一次玩，先從較少的項目開始。" };
  }
  if (struggled(last)) {
    const level = lower(last.level);
    return {
      level,
      reason: level === last.level
        ? "上次需要較多協助，這次維持較少的項目，也可以隨時聽提示。"
        : "上次需要較多協助，這次減少項目，也可以隨時看圖片提示。",
    };
  }
  const prev = history.at(-2);
  if (prev && didWell(last) && didWell(prev) && last.level === prev.level) {
    const level = higher(last.level);
    return {
      level,
      reason: level === last.level
        ? "最近兩次都很順利，已經是項目較多的安排，這次先維持。"
        : "最近兩次都很順利，這次多一項，讓活動稍有變化。",
    };
  }
  if (didWell(last)) {
    return { level: last.level, reason: "上次很順利。再順利完成一次，下次才會多一項。" };
  }
  return { level: last.level, reason: "這次維持上次的分量，不急著變難。" };
}

export function suggestion(sessions) {
  const memory = planDifficulty("memory", sessions);
  const market = planDifficulty("market", sessions);
  const rank = { easy: 0, medium: 1, hard: 2 };
  if (rank[market.level] < rank[memory.level]) {
    return { game: "market", text: "今天可以先去菜市場。項目少一點，比較輕鬆。" };
  }
  return { game: "memory", text: "今天可以先去雜貨店。商品少一點，比較輕鬆。" };
}

export function memoryBrief(level) {
  const [remember, choices] = MEMORY_SIZE[level];
  return `請記住 ${remember} 樣，再從 ${choices} 樣裡找出來。`;
}

export function marketBrief(level) {
  const [count] = MARKET_SIZE[level];
  return `依照清單買 ${count} 樣，再算一共多少、找回多少。`;
}

export function countLine(selected, total) {
  if (selected < total) return `已選 ${selected} 樣，一共要選 ${total} 樣。`;
  if (selected === total) return `已選 ${selected} 樣。如果都對了，就按我選好了。`;
  return `已選 ${selected} 樣，只要 ${total} 樣。再點一次可以取消。`;
}

export function scoreSelection(targets, selected) {
  const targetIds = targets.map((item) => item.id);
  const hits = selected.filter((id) => targetIds.includes(id));
  const extras = selected.filter((id) => !targetIds.includes(id));
  const missing = targetIds.filter((id) => !selected.includes(id));
  const accuracy = targetIds.length === 0 ? 0 : Math.max(0, (hits.length - extras.length) / targetIds.length);
  return {
    hits,
    extras,
    missing,
    accuracy,
    perfect: missing.length === 0 && extras.length === 0,
  };
}

export function feedbackCopy(score, nameOf) {
  const hitNames = score.hits.map(nameOf);
  const extraNames = score.extras.map(nameOf);
  const parts = [];
  parts.push(hitNames.length ? `你找到了${hitNames.join("、")}。` : "這次還沒有選到要找的項目。");
  if (extraNames.length) parts.push(`${extraNames.join("、")}可以先放下。`);
  if (score.missing.length === 1) parts.push("還有 1 樣，可以再找找。");
  else if (score.missing.length > 1) parts.push(`還有 ${score.missing.length} 樣，可以再找找。`);
  return parts.join("");
}

export function memoryResultCopy(first, assisted) {
  const found = first.hits.length;
  const total = first.targetCount;
  if (!assisted && first.perfect) {
    return { headline: "做得好", detail: `${total} 樣都找到了。` };
  }
  if (!assisted) {
    return { headline: "你完成了", detail: `第一次找到 ${found} 樣，共 ${total} 樣。後來你自己找齊了。` };
  }
  return { headline: "這次一起完成了", detail: `第一次找到 ${found} 樣，共 ${total} 樣。看過答案也沒關係。` };
}

export function marketAccuracy(selectionAccuracy, totalCorrect, changeCorrect) {
  return (selectionAccuracy + (totalCorrect ? 1 : 0) + (changeCorrect ? 1 : 0)) / 3;
}

export function marketResultCopy({ targetCount, hitCount, totalCorrect, changeCorrect, assisted }) {
  const shop = hitCount === targetCount
    ? `${targetCount} 樣都買對了。`
    : `清單裡第一次選對 ${hitCount} 樣，共 ${targetCount} 樣。`;
  const money = totalCorrect && changeCorrect
    ? "金額和找零都正確。"
    : `${totalCorrect ? "一共的金額正確。" : "一共的金額有再算過。"}${changeCorrect ? "找零正確。" : "找零有再算過。"}`;
  const perfect = !assisted && hitCount === targetCount && totalCorrect && changeCorrect;
  return {
    headline: perfect ? "做得好" : assisted ? "這次一起完成了" : "你完成了",
    detail: `${shop}${money}`,
  };
}

export function buildTotalOptions(total) {
  const options = [];
  for (const value of [total, total + 10, total - 10, total + 20, total + 5, total - 5]) {
    if (value > 0 && !options.includes(value)) options.push(value);
    if (options.length === 4) break;
  }
  return options;
}

export function buildChange(total) {
  const pay = total < 50 ? 50 : total < 100 ? 100 : 200;
  const correct = pay - total;
  const options = [];
  for (const value of [correct, correct + 10, correct - 10, correct + 20, total, correct + 5]) {
    if (value > 0 && value !== pay && !options.includes(value)) options.push(value);
    if (options.length === 4) break;
  }
  if (!options.includes(correct)) options.unshift(correct);
  return { pay, total, correct, options: options.slice(0, 4) };
}

export function createMemoryRound(level, rng = Math.random) {
  const [count, choiceCount] = MEMORY_SIZE[level];
  const targets = shuffle(GROCERY, rng).slice(0, count);
  const distractors = shuffle(
    GROCERY.filter((item) => !targets.some((target) => target.id === item.id)),
    rng,
  ).slice(0, choiceCount - count);
  return { targets, choices: shuffle([...targets, ...distractors], rng) };
}

export function createMarketRound(level, rng = Math.random) {
  const [count, stallCount] = MARKET_SIZE[level];
  const targets = shuffle(MARKET, rng).slice(0, count);
  const distractors = shuffle(
    MARKET.filter((item) => !targets.some((target) => target.id === item.id)),
    rng,
  ).slice(0, stallCount - count);
  const prices = shuffle(PRICES[level], rng);
  const priced = [...targets, ...distractors].map((item, index) => ({ ...item, price: prices[index] }));
  const pricedTargets = priced.filter((item) => targets.some((target) => target.id === item.id));
  const total = pricedTargets.reduce((sum, item) => sum + item.price, 0);
  return {
    targets: pricedTargets,
    choices: shuffle(priced, rng),
    totalOptions: buildTotalOptions(total),
    bill: buildChange(total),
  };
}

export function formatDuration(ms) {
  const safe = Number.isFinite(ms) ? ms : 0;
  const seconds = Math.max(0, Math.round(safe / 1000));
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  if (minutes <= 0) return `${remain} 秒`;
  return `${minutes} 分 ${remain} 秒`;
}

export function formatWhen(ts) {
  const date = new Date(ts);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function isSameDay(ts, now = Date.now()) {
  const left = new Date(ts);
  const right = new Date(now);
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

export function todayCount(sessions, now = Date.now()) {
  return sessions.filter((session) => session.completed && isSameDay(session.at, now)).length;
}

export function memorySummary(first) {
  return `找到 ${first.hits.length}/${first.targetCount} 樣`;
}

export function marketSummary({ hitCount, targetCount, totalCorrect, changeCorrect }) {
  return `選對 ${hitCount}/${targetCount}，金額${totalCorrect ? "正確" : "再算過"}，找零${changeCorrect ? "正確" : "再算過"}`;
}
