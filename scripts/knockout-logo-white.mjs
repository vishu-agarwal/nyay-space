/**
 * Makes near-white pixels transparent on the Nyay Space logo PNG.
 * Run: node scripts/knockout-logo-white.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "public", "nyay-space-logo-vam.png");
const tmpPath = `${logoPath}.tmp`;
const iconPath = path.join(root, "app", "icon.png");

const THRESHOLD = 247;

const { data, info } = await sharp(logoPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const out = Buffer.from(data);
for (let i = 0; i < out.length; i += 4) {
  const r = out[i];
  const g = out[i + 1];
  const b = out[i + 2];
  if (r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) {
    out[i + 3] = 0;
  }
}

await sharp(out, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4,
  },
})
  .png()
  .toFile(tmpPath);

fs.renameSync(tmpPath, logoPath);
await sharp(logoPath).png().toFile(iconPath);

console.log("Transparent logo written:", logoPath);
console.log("Favicon synced:", iconPath);
