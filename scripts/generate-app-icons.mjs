import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "assets/icons/huanqi-icon-04-badge-bold.png");

const BRAND_DEEP = "#7c3aed";
const BRAND = "#8b5cf6";
const SHELL_BG = "#1c1917";
/** ~iOS home-screen squircle corner radius at 1024px */
const IOS_CORNER_RATIO = 0.2237;

function gradientRoundedRectSvg(size, radius) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${BRAND_DEEP}"/>
      <stop offset="100%" stop-color="${BRAND}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#brand)"/>
</svg>`;
}

function iosHomeScreenSvg(size) {
  const radius = Math.round(size * IOS_CORNER_RATIO);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${BRAND_DEEP}"/>
      <stop offset="100%" stop-color="${BRAND}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" fill="${SHELL_BG}"/>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#brand)"/>
</svg>`;
}

async function squareSource(size) {
  const meta = await sharp(source).metadata();
  const side = Math.min(meta.width, meta.height);
  const left = Math.floor((meta.width - side) / 2);
  const top = Math.floor((meta.height - side) / 2);

  return sharp(source)
    .extract({ left, top, width: side, height: side })
    .resize(size, size, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

async function extractLogoLayer(size) {
  const { data, info } = await squareSource(size);
  const logo = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum > 210 && r > 180 && g > 180 && b > 180) {
      logo[i] = 255;
      logo[i + 1] = 255;
      logo[i + 2] = 255;
      logo[i + 3] = 255;
    }
  }

  return sharp(logo, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();
}

async function buildIcon(size, { iosHomeScreen = false } = {}) {
  const radius = Math.round(size * IOS_CORNER_RATIO);
  const background = iosHomeScreen
    ? sharp(Buffer.from(iosHomeScreenSvg(size)))
    : sharp(Buffer.from(gradientRoundedRectSvg(size, radius)));

  const logo = await extractLogoLayer(size);

  return background
    .composite([{ input: await logo.toBuffer(), blend: "over" }])
    .png();
}

async function buildForeground(size) {
  const logo = await extractLogoLayer(size);
  return logo;
}

async function writePng(target, size, options) {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, await (await buildIcon(size, options)).toBuffer());
  console.log(`wrote ${path.relative(root, target)} (${size}x${size})`);
}

async function writeForegroundPng(target, size) {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, await (await buildForeground(size)).toBuffer());
  console.log(`wrote ${path.relative(root, target)} (${size}x${size})`);
}

const androidSizes = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

const androidForegroundSizes = {
  "mipmap-mdpi": 108,
  "mipmap-hdpi": 162,
  "mipmap-xhdpi": 216,
  "mipmap-xxhdpi": 324,
  "mipmap-xxxhdpi": 432,
};

async function main() {
  await writePng(
    path.join(root, "apps/mobile/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"),
    1024,
    { iosHomeScreen: true },
  );

  await writePng(path.join(root, "apps/web/src/app/icon.png"), 512);
  await writePng(path.join(root, "apps/web/src/app/apple-icon.png"), 180);
  await writePng(path.join(root, "apps/web/public/favicon.png"), 32);
  await writePng(path.join(root, "apps/web/public/apple-touch-icon.png"), 180);
  await writePng(path.join(root, "assets/icons/huanqi-app-icon-1024.png"), 1024);

  for (const [folder, size] of Object.entries(androidSizes)) {
    const base = path.join(root, "apps/mobile/android/app/src/main/res", folder);
    await writePng(path.join(base, "ic_launcher.png"), size);
    await writePng(path.join(base, "ic_launcher_round.png"), size);
  }

  for (const [folder, size] of Object.entries(androidForegroundSizes)) {
    await writeForegroundPng(
      path.join(root, "apps/mobile/android/app/src/main/res", folder, "ic_launcher_foreground.png"),
      size,
    );
  }

  console.log("Done. iOS uses squircle purple tile; other platforms use rounded-square purple icon.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
