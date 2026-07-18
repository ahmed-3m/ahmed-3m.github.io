/**
 * Regenerate every raster icon in public/ from the single SVG source.
 *
 *   node tools/generate-icons.mjs
 *
 * Source of truth: public/icon.svg (the A3M "A" mark on a rounded dark square).
 *
 * Two silhouettes are produced from that one source:
 *   - rounded    -> browser favicons, which sit on the tab as-is
 *   - full-bleed -> apple-touch-icon and the PWA icons declared "any maskable"
 *                   in manifest.json. Maskable icons get cropped to an
 *                   OS-chosen shape, so the mark is inset into the safe zone
 *                   and the background runs edge to edge.
 *
 * Requires `sharp`, which Next.js already pulls in. It is not a direct
 * dependency, so if a future Next release drops it, `npm i -D sharp` first.
 * Nothing in `npm run build` calls this script — it is run by hand when the
 * logo changes, and the outputs are committed.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");

const BG = "#08090d";

/** The mark itself, on a 100x100 grid, with no background. */
const MARK = `
  <defs>
    <linearGradient id="a3mMark" x1="0%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="55%" stop-color="#2563c9"/>
      <stop offset="100%" stop-color="#6d3fd1"/>
    </linearGradient>
  </defs>
  <path fill-rule="evenodd" fill="url(#a3mMark)"
        d="M50 15 L89 87 L11 87 Z M50 45 L68 75 L32 75 Z"/>
  <circle cx="21" cy="79" r="2.6" fill="#6d3fd1"/>
  <circle cx="14" cy="84" r="1.9" fill="#7c4ddb" opacity="0.8"/>
  <circle cx="27" cy="85" r="1.5" fill="#38bdf8" opacity="0.7"/>
`;

/**
 * Full-bleed square with the mark scaled into the maskable safe zone.
 * `scale` 0.62 keeps every pixel of the mark inside the central 62%, which
 * survives the most aggressive circular mask Android applies.
 */
const fullBleed = (scale = 0.62) => {
  const offset = (100 - 100 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" fill="${BG}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">${MARK}</g>
</svg>`;
};

const render = (svg, size) =>
  sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size, { fit: "contain", background: BG })
    .png({ compressionLevel: 9 })
    .toBuffer();

/**
 * Pack PNGs into an ICO container. Every browser in the support matrix reads
 * PNG-compressed ICO entries, so there is no need for the legacy BMP encoding.
 */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);

  let offset = 6 + pngs.length * 16;
  const entries = [];

  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // 0 means 256
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette size
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const rounded = await readFile(path.join(PUBLIC, "icon.svg"), "utf8");

// Android maskable icons can be cropped to a circle, so they need the tight
// safe zone. iOS only rounds the corners, so the mark can breathe much closer
// to the edge — using the maskable scale there just looks undersized.
const maskable = fullBleed(0.62);
const appleTouch = fullBleed(0.84);

const written = [];
const emit = async (name, buffer) => {
  await writeFile(path.join(PUBLIC, name), buffer);
  written.push(`${name} (${(buffer.length / 1024).toFixed(1)} kB)`);
};

// Browser favicons keep the rounded silhouette.
await emit("favicon-16x16.png", await render(rounded, 16));
await emit("favicon-32x32.png", await render(rounded, 32));

// Touch and PWA icons are full-bleed so the OS mask has something to cut into.
await emit("apple-touch-icon.png", await render(appleTouch, 180));
await emit("icon-192.png", await render(maskable, 192));
await emit("icon-512.png", await render(maskable, 512));

// Multi-resolution .ico for legacy tab and bookmark surfaces.
const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(
  icoSizes.map(async (size) => ({ size, data: await render(rounded, size) }))
);
const ico = buildIco(icoPngs);
await emit("favicon.ico", ico);

// Next.js serves src/app/favicon.ico ahead of public/favicon.ico, so the two
// must stay in lockstep or the tab icon silently reverts to the old mark.
await writeFile(path.join(ROOT, "src", "app", "favicon.ico"), ico);
written.push("src/app/favicon.ico (mirrored)");

console.log(written.map((line) => `  ${line}`).join("\n"));
