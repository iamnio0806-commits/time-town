import assert from "node:assert/strict";
import test from "node:test";
import {
  buildChange,
  buildTotalOptions,
  countLine,
  createMarketRound,
  createMemoryRound,
  didWell,
  feedbackCopy,
  marketAccuracy,
  marketResultCopy,
  memoryResultCopy,
  planDifficulty,
  scoreSelection,
  struggled,
  suggestion,
} from "../js/logic.js";

function rngFrom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function session(overrides) {
  return {
    game: "memory",
    level: "easy",
    accuracy: 1,
    hints: 0,
    assisted: false,
    completed: true,
    ...overrides,
  };
}

test("第一次玩從較少項目開始", () => {
  const plan = planDifficulty("memory", []);
  assert.equal(plan.level, "easy");
  assert.match(plan.reason, /較少/);
});

test("兩種遊戲的紀錄互不影響", () => {
  const sessions = [session({ game: "market", level: "hard", assisted: true, accuracy: 0.2, hints: 3 })];
  assert.equal(planDifficulty("memory", sessions).level, "easy");
});

test("一次不順利就減少項目", () => {
  const plan = planDifficulty("memory", [session({ level: "medium", accuracy: 0.5, hints: 0 })]);
  assert.equal(plan.level, "easy");
  assert.match(plan.reason, /減少項目/);
});

test("已經最少時維持輕鬆分量", () => {
  const plan = planDifficulty("memory", [session({ level: "easy", hints: 2, accuracy: 1 })]);
  assert.equal(plan.level, "easy");
  assert.match(plan.reason, /維持較少/);
});

test("只順利一次不會立刻變多", () => {
  const plan = planDifficulty("memory", [session({ level: "easy", accuracy: 1, hints: 0 })]);
  assert.equal(plan.level, "easy");
  assert.match(plan.reason, /再順利完成一次/);
});

test("連續兩次順利才多一項", () => {
  const sessions = [
    session({ level: "easy", accuracy: 1, hints: 1 }),
    session({ level: "easy", accuracy: 0.95, hints: 0 }),
  ];
  const plan = planDifficulty("memory", sessions);
  assert.equal(plan.level, "medium");
  assert.match(plan.reason, /多一項/);
});

test("兩次順利但難度不同時不連跳", () => {
  const sessions = [
    session({ level: "easy", accuracy: 1, hints: 0 }),
    session({ level: "medium", accuracy: 1, hints: 0 }),
  ];
  assert.equal(planDifficulty("memory", sessions).level, "medium");
});

test("看過答案算需要協助", () => {
  assert.equal(struggled(session({ assisted: true, accuracy: 1, hints: 0 })), true);
  assert.equal(didWell(session({ assisted: true, accuracy: 1, hints: 0 })), false);
});

test("普通表現維持原分量", () => {
  const plan = planDifficulty("market", [session({ game: "market", level: "medium", accuracy: 0.8, hints: 1 })]);
  assert.equal(plan.level, "medium");
  assert.match(plan.reason, /不急著變難/);
});

test("建議先去目前比較輕鬆的地方", () => {
  const sessions = [session({ level: "hard", accuracy: 1, hints: 0 }), session({ level: "hard", accuracy: 1, hints: 0 })];
  assert.equal(suggestion(sessions).game, "market");
});

test("記憶題包含正確項目且沒有重複", () => {
  const round = createMemoryRound("easy", rngFrom(7));
  assert.equal(round.targets.length, 3);
  assert.equal(round.choices.length, 6);
  const ids = round.choices.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const target of round.targets) assert.ok(ids.includes(target.id));
});

test("買菜題的金額與找零一致", () => {
  const round = createMarketRound("medium", rngFrom(11));
  assert.equal(round.targets.length, 3);
  assert.equal(round.choices.length, 6);
  const total = round.targets.reduce((sum, item) => sum + item.price, 0);
  assert.equal(round.bill.total, total);
  assert.equal(round.bill.correct, round.bill.pay - total);
  assert.ok(round.totalOptions.includes(total));
  assert.ok(round.bill.options.includes(round.bill.correct));
  assert.equal(new Set(round.bill.options).size, round.bill.options.length);
});

test("計分會扣掉多選", () => {
  const targets = [{ id: "rice" }, { id: "tea" }, { id: "egg" }];
  const score = scoreSelection(targets, ["rice", "soap"]);
  assert.deepEqual(score.hits, ["rice"]);
  assert.deepEqual(score.extras, ["soap"]);
  assert.equal(score.perfect, false);
  assert.ok(score.accuracy < 0.7);
});

test("選項數量提示", () => {
  assert.match(countLine(1, 3), /已選 1 樣/);
  assert.match(countLine(3, 3), /我選好了/);
  assert.match(countLine(4, 3), /取消/);
});

test("回饋先說找到的項目", () => {
  const text = feedbackCopy(
    { hits: ["rice"], extras: ["soap"], missing: ["tea"] },
    (id) => ({ rice: "白米", soap: "肥皂", tea: "茶葉" })[id],
  );
  assert.match(text, /^你找到了白米/);
  assert.match(text, /肥皂可以先放下/);
  assert.match(text, /還有 1 樣/);
});

test("結果語句不責備用詞", () => {
  const memory = memoryResultCopy({ hits: ["a"], targetCount: 3, perfect: false }, true);
  assert.equal(memory.headline, "這次一起完成了");
  assert.doesNotMatch(memory.detail, /失敗|錯誤|退化/);
  const market = marketResultCopy({
    targetCount: 2,
    hitCount: 2,
    totalCorrect: true,
    changeCorrect: false,
    assisted: false,
  });
  assert.match(market.detail, /找零有再算過/);
});

test("買菜正確率分成選菜、金額、找零", () => {
  assert.equal(marketAccuracy(1, true, true), 1);
  assert.ok(marketAccuracy(1, false, true) < 0.7);
});

test("找零選項不會出現付出的金額", () => {
  const bill = buildChange(40);
  assert.equal(bill.pay, 50);
  assert.equal(bill.correct, 10);
  assert.ok(!bill.options.includes(50));
  assert.ok(buildTotalOptions(45).includes(45));
});
