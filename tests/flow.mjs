import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright-core";

const base = process.env.BASE_URL || "http://127.0.0.1:4173";
const shots = "/tmp/time-town";
fs.mkdirSync(shots, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: "zh-TW" });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

async function screen(name) {
  await page.waitForSelector(`#app[data-screen="${name}"]`);
}

async function shot(name) {
  await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true });
}

async function noOverflow() {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `橫向超出 ${overflow}px，畫面 ${await page.locator("#app").getAttribute("data-screen")}`);
}

async function dockClears() {
  const overlap = await page.evaluate(() => {
    const dock = document.querySelector(".dock");
    if (!dock) return 0;
    window.scrollTo(0, document.body.scrollHeight);
    const last = document.querySelector("main").lastElementChild;
    return Math.round(last.getBoundingClientRect().bottom - dock.getBoundingClientRect().top);
  });
  const name = await page.locator("#app").getAttribute("data-screen");
  assert.ok(overlap <= 8, `${name} 的底部被按鈕蓋住 ${overlap}px`);
}

async function bigTargets() {
  const small = await page.evaluate(() => [...document.querySelectorAll(".btn, .store, .item, .money")]
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return { h: Math.round(rect.height), w: Math.round(rect.width), text: element.innerText.replace(/\s+/g, " ").slice(0, 24) };
    })
    .filter((item) => item.h > 0 && (item.h < 48 || item.w < 48)));
  assert.deepEqual(small, []);
}

async function labelsClearDock() {
  const covered = await page.evaluate(() => {
    const dock = document.querySelector(".dock");
    if (!dock) return [];
    const limit = dock.getBoundingClientRect().top;
    return [...document.querySelectorAll(".item-name, .item-price, .money")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top < limit && rect.bottom > limit + 1 && rect.bottom > 0 && rect.top < window.innerHeight;
      })
      .map((element) => element.textContent.trim());
  });
  assert.deepEqual(covered, []);
}

async function checkLayout() {
  await noOverflow();
  await dockClears();
  await bigTargets();
  await labelsClearDock();
}

async function sessions() {
  return page.evaluate(() => {
    const raw = localStorage.getItem("time-town-v1");
    return raw ? JSON.parse(raw).sessions : [];
  });
}

async function playMemory({ perfect }) {
  await page.locator(".store", { hasText: "雜貨店" }).click();
  await screen("intro");
  await page.getByRole("button", { name: "開始", exact: true }).click();
  await screen("memorize");
  const names = await page.locator(".static-card .item-name").allTextContents();
  assert.equal(names.length, 3);
  await page.getByRole("button", { name: "我記住了", exact: true }).click();
  await screen("pick");
  await page.screenshot({ path: `${shots}/04-pick.png` });
  if (perfect) {
    for (const name of names) await page.locator(`button.item[aria-label^="${name}"]`).click();
    await page.getByRole("button", { name: "我選好了", exact: true }).click();
  } else {
    const wrong = page.locator("button.item").filter({ hasNotText: names[0] }).filter({ hasNotText: names[1] }).filter({ hasNotText: names[2] }).first();
    await wrong.click();
    await page.getByRole("button", { name: "我選好了", exact: true }).click();
    await screen("assist");
    await page.getByRole("heading", { name: "沒關係，可以再試" }).waitFor();
    await page.getByRole("button", { name: "請告訴我", exact: true }).click();
    await page.getByRole("heading", { name: "要找的是這些" }).waitFor();
    await page.getByRole("button", { name: "完成", exact: true }).click();
  }
  await screen("result");
}

async function playMarket() {
  await page.locator(".store", { hasText: "菜市場" }).click();
  await screen("intro");
  await page.getByRole("button", { name: "開始", exact: true }).click();
  await screen("list");
  const items = await page.locator(".bill li").evaluateAll((rows) => rows.map((row) => ({
    name: row.querySelector(".item-name").textContent.trim(),
    price: Number(row.querySelector("span:last-child").textContent.match(/\d+/)[0]),
  })));
  assert.equal(items.length, 2);
  await page.getByRole("button", { name: "開始選菜", exact: true }).click();
  await screen("shop");
  await page.screenshot({ path: `${shots}/05-shop.png` });
  await page.getByRole("button", { name: "請給我提示", exact: true }).click();
  await page.locator(".hint-banner").waitFor();
  assert.match(await page.locator(".hint-banner").innerText(), /圖片提示|可以放下/);
  for (const item of items) await page.locator(`button.item[aria-label^="${item.name}"]`).click();
  await page.getByRole("button", { name: "我選好了", exact: true }).click();
  await screen("total");
  await page.screenshot({ path: `${shots}/05-total.png` });
  const total = items.reduce((sum, item) => sum + item.price, 0);
  await page.locator(`button.money[data-amount="${total}"]`).click();
  await page.getByRole("button", { name: "就選這個", exact: true }).click();
  await screen("change");
  await page.screenshot({ path: `${shots}/05-change.png` });
  const notes = await page.locator(".pay-note").allTextContents();
  const pay = Number(notes[1].match(/(\d+)/)[1]);
  const change = pay - total;
  await page.locator(`button.money[data-amount="${change}"]`).click();
  await page.getByRole("button", { name: "就選這個", exact: true }).click();
  await screen("result");
}

await page.goto(base);
await screen("welcome");
await shot("01-welcome");
await checkLayout();
assert.match(await page.locator("h1").innerText(), /時光小鎮/);

await page.getByRole("button", { name: "進入小鎮", exact: true }).click();
await screen("map");
await page.screenshot({ path: `${shots}/02-map.png` });
await checkLayout();
const hiddenStores = await page.evaluate(() => [...document.querySelectorAll(".store")].filter((element) => {
  const rect = element.getBoundingClientRect();
  return rect.top < 0 || rect.bottom > window.innerHeight - 4;
}).map((element) => element.innerText.replace(/\s+/g, " ").slice(0, 16)));
assert.deepEqual(hiddenStores, []);
assert.match(await page.locator(".suggest").innerText(), /雜貨店/);

await page.locator(".store", { hasText: "雜貨店" }).click();
await screen("intro");
await shot("03-grocery-intro");
assert.match(await page.locator(".note").innerText(), /第一次玩/);
await page.getByRole("button", { name: "回小鎮", exact: true }).click();
await screen("map");

await playMemory({ perfect: true });
await shot("04-memory-result");
await checkLayout();
assert.match(await page.locator("h1").innerText(), /做得好/);
assert.match(await page.locator(".note").innerText(), /再順利完成一次/);

await page.getByRole("button", { name: "回小鎮", exact: true }).click();
await playMemory({ perfect: true });
assert.match(await page.locator(".note").innerText(), /多一項/);
await page.getByRole("button", { name: "再玩一次", exact: true }).click();
await screen("intro");
assert.match(await page.locator(".lead").innerText(), /記住 4 樣/);
await page.getByRole("button", { name: "回小鎮", exact: true }).click();

await playMarket();
await shot("05-market-result");
await checkLayout();
assert.match(await page.locator("h1").innerText(), /你完成了|做得好/);
assert.match(await page.locator("body").innerText(), /提示/);

await page.getByRole("button", { name: "回小鎮", exact: true }).click();
await page.locator(".store", { hasText: "雜貨店" }).click();
await page.getByRole("button", { name: "開始", exact: true }).click();
await page.getByRole("button", { name: "我記住了", exact: true }).click();
await page.locator("button.item").first().click();
await page.getByRole("button", { name: "我選好了", exact: true }).click();
await screen("assist");
await page.screenshot({ path: `${shots}/10-assist.png` });
await checkLayout();
assert.match(await page.locator("h1").innerText(), /沒關係/);
await page.getByRole("button", { name: "請告訴我", exact: true }).click();
await page.getByRole("heading", { name: "要找的是這些" }).waitFor();
await page.getByRole("button", { name: "完成", exact: true }).click();
await screen("result");
assert.match(await page.locator(".note").innerText(), /協助/);
await page.getByRole("button", { name: "回小鎮", exact: true }).click();
await page.locator(".store", { hasText: "雜貨店" }).click();
await page.getByRole("button", { name: "開始", exact: true }).click();
await screen("memorize");
const before = (await sessions()).length;
await page.getByRole("button", { name: "離開", exact: true }).click();
await page.getByRole("button", { name: "先離開", exact: true }).click();
await screen("map");
assert.equal((await sessions()).length, before);

await page.locator(".store", { hasText: "我家" }).click();
await screen("house");
await shot("06-house");
await checkLayout();
assert.match(await page.locator("body").innerText(), /不能用來判斷健康/);
assert.match(await page.locator(".log").innerText(), /雜貨店/);
assert.match(await page.locator(".log").innerText(), /菜市場/);

await page.getByRole("button", { name: "特大字", exact: true }).click();
assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize), "22px");
await checkLayout();
await shot("07-house-xlarge");
await page.getByRole("button", { name: "大字", exact: true }).click();

await page.getByRole("button", { name: "語音：開", exact: true }).click();
await page.getByRole("button", { name: "再聽一次", exact: true }).click();
await page.getByText("語音目前是關的").waitFor();
await page.getByRole("button", { name: "語音：關", exact: true }).click();

await page.setViewportSize({ width: 320, height: 568 });
await page.getByRole("button", { name: "回小鎮", exact: true }).click();
await screen("map");
await shot("08-map-se");
await checkLayout();
await page.locator(".store", { hasText: "菜市場" }).click();
await page.getByRole("button", { name: "開始", exact: true }).click();
await page.getByRole("button", { name: "開始選菜", exact: true }).click();
await screen("shop");
await shot("09-shop-se");
await checkLayout();

const manifest = await page.evaluate(async () => {
  const link = document.querySelector('link[rel="manifest"]').href;
  const response = await fetch(link);
  return { ok: response.ok, body: await response.json(), apple: Boolean(document.querySelector('link[rel="apple-touch-icon"]')) };
});
assert.equal(manifest.ok, true);
assert.equal(manifest.body.display, "standalone");
assert.equal(manifest.body.lang, "zh-Hant");
assert.equal(manifest.apple, true);
await page.waitForFunction(async () => Boolean(await navigator.serviceWorker.getRegistration()));

assert.deepEqual(errors, []);
await browser.close();
console.log("flow ok");
