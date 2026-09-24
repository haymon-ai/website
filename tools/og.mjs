import { chromium } from "playwright";

const card = new URL("og.html", import.meta.url).href;
const out = new URL("../assets/og.png", import.meta.url).pathname;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(card);
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: out, type: "png" });
await browser.close();
console.log(out);
