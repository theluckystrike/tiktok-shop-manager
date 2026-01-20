import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 32, 48, 128];

// Create a TikTok-style icon with gradient
async function generateIcon(size) {
  // Create SVG with TikTok-inspired design
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#25F4EE;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FE2C55;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <text
        x="50%"
        y="55%"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="${size * 0.5}px"
        font-family="Arial, sans-serif"
      >🛍️</text>
    </svg>
  `;

  const outputPath = join(iconsDir, `icon${size}.png`);

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`Generated: icon${size}.png`);
}

// Generate all sizes
async function main() {
  console.log('Generating TikTok Shop Manager icons...');

  for (const size of sizes) {
    await generateIcon(size);
  }

  console.log('Done! Icons generated in public/icons/');
}

main().catch(console.error);
