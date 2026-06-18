import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "assets/icons/huanqi-icon-04-badge-bold.png");

async function squareIcon(size) {
  const meta = await sharp(source).metadata();
  const side = Math.min(meta.width, meta.height);
  const left = Math.floor((meta.width - side) / 2);
  const top = Math.floor((meta.height - side) / 2);

  return sharp(source)
    .extract({ left, top, width: side, height: side })
    .resize(size, size, { fit: "fill" })
    .png();
}

async function writePng(target, size) {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, await (await squareIcon(size)).toBuffer());
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
    await writePng(
      path.join(root, "apps/mobile/android/app/src/main/res", folder, "ic_launcher_foreground.png"),
      size,
    );
  }

  console.log("Done. Source: huanqi-icon-04-badge-bold.png");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
