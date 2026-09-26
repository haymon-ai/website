import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = process.env.HAYMON_URL ?? "http://localhost:8123";
const { HAYMON_USER, HAYMON_PASSWORD } = process.env;
if (!HAYMON_USER || !HAYMON_PASSWORD) {
  throw new Error("set HAYMON_USER and HAYMON_PASSWORD to a haymon sign-in");
}
const OUT = new URL("../assets/screens/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const shots = [
  ["packages", "/packages"],
  ["package", "/packages/acme/payments-core"],
  ["sources", "/sources"],
  ["source", "/sources/12"],
  ["spaces", "/spaces"],
  ["users", "/users"],
  ["credentials", "/credentials"],
];

// The fixtures hold one space; these fill the list. Only for a throwaway copy.
const spaces = [
  { name: "Contoso", slug: "contoso", tokens: ["Contoso CI", "Contoso deploy"],
    packages: ["acme/partner-sso", "acme/partner-theme", "acme/api-client"] },
  { name: "Globex", slug: "globex", tokens: ["Globex CI"],
    packages: ["acme/mobile-sdk", "acme/mobile-client"] },
  { name: "Internal", slug: "internal", tokens: ["Build server", "Staging", "Laptops"] },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

await page.goto(`${BASE}/login`);
await page.locator("#username").fill(HAYMON_USER);
await page.locator("#password").fill(HAYMON_PASSWORD);
await page.getByRole("button", { name: "Sign in" }).click();
await page.getByRole("heading", { name: "Get started with Haymon." }).waitFor();

const ask = (query, variables) =>
  page.evaluate(async ({ query, variables }) => {
    const response = await fetch("/graphql", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const { data, errors } = await response.json();
    if (errors) throw new Error(errors[0].message);
    return data;
  }, { query, variables });

const { spaces: existing } = await ask("{ spaces(page: 1) { nodes { slug } } }");
for (const space of spaces) {
  if (existing.nodes.some((node) => node.slug === space.slug)) continue;
  await ask(
    "mutation ($input: SpaceCreateInput!) { spaceCreate(input: $input) { __typename } }",
    { input: { name: space.name, slug: space.slug, everyPackage: !space.packages } },
  );
  if (space.packages) {
    await ask(
      "mutation ($slug: String!, $packages: [String!]!) { spacePackagesAdd(slug: $slug, packages: $packages) { __typename } }",
      { slug: space.slug, packages: space.packages },
    );
  }
  for (const token of space.tokens) {
    await ask(
      "mutation ($slug: String!, $input: SpaceTokenCreateInput!) { spaceTokenCreate(slug: $slug, input: $input) { __typename } }",
      { slug: space.slug, input: { name: token } },
    );
  }
}

for (const [name, path] of shots) {
  await page.goto(`${BASE}${path}`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(400);
  const hidden = await page.evaluate(() => {
    const stamp = [...document.querySelectorAll("body *")].find(
      (e) => e.children.length === 0 && /^v\d+\.\d+\.\d+ · /.test(e.textContent.trim()),
    );
    if (stamp) stamp.style.visibility = "hidden";
    return !!stamp;
  });
  if (!hidden) throw new Error(`no build stamp on ${path}`);
  const png = await page.screenshot({ type: "png" });

  const sizes = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const encode = (width) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = Math.round((img.naturalHeight * width) / img.naturalWidth);
      const context = canvas.getContext("2d");
      context.imageSmoothingQuality = "high";
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/webp", 0.86).split(",")[1];
    };
    return {
      full: encode(img.naturalWidth),
      half: encode(img.naturalWidth / 2),
      quarter: encode(img.naturalWidth / 4),
    };
  }, png.toString("base64"));

  writeFileSync(`${OUT}/${name}.webp`, Buffer.from(sizes.full, "base64"));
  writeFileSync(`${OUT}/${name}-1440.webp`, Buffer.from(sizes.half, "base64"));
  writeFileSync(`${OUT}/${name}-720.webp`, Buffer.from(sizes.quarter, "base64"));
  console.log(name, path, page.url());
}

await browser.close();
