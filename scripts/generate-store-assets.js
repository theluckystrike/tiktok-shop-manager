import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'store-assets');

// Ensure directory exists
if (!existsSync(assetsDir)) {
  mkdirSync(assetsDir, { recursive: true });
}

// TikTok brand colors
const TIKTOK_CYAN = '#25F4EE';
const TIKTOK_RED = '#FE2C55';
const TIKTOK_BLACK = '#000000';

// Generate promotional marquee (1400x560)
async function generateMarquee() {
  const width = 1400;
  const height = 560;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${TIKTOK_BLACK}"/>
          <stop offset="100%" style="stop-color:#161823"/>
        </linearGradient>
        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${TIKTOK_CYAN}"/>
          <stop offset="100%" style="stop-color:${TIKTOK_RED}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>

      <!-- Decorative circles -->
      <circle cx="100" cy="100" r="150" fill="${TIKTOK_CYAN}" opacity="0.1"/>
      <circle cx="${width - 100}" cy="${height - 100}" r="200" fill="${TIKTOK_RED}" opacity="0.1"/>

      <!-- Icon -->
      <rect x="150" y="180" width="120" height="120" rx="24" fill="url(#textGrad)"/>
      <text x="210" y="260" text-anchor="middle" font-size="60" fill="white">🛍️</text>

      <!-- Title -->
      <text x="300" y="220" font-size="48" font-weight="bold" fill="url(#textGrad)" font-family="Arial, sans-serif">
        TikTok Shop Manager
      </text>
      <text x="300" y="280" font-size="24" fill="#888" font-family="Arial, sans-serif">
        AI-Powered Seller Analytics &amp; Optimizer
      </text>

      <!-- Features -->
      <text x="300" y="360" font-size="20" fill="white" font-family="Arial, sans-serif">📊 Product Analytics</text>
      <text x="300" y="400" font-size="20" fill="white" font-family="Arial, sans-serif">🎯 Competitor Tracking</text>
      <text x="600" y="360" font-size="20" fill="white" font-family="Arial, sans-serif">🔥 Trend Detection</text>
      <text x="600" y="400" font-size="20" fill="white" font-family="Arial, sans-serif">💰 Price Optimization</text>

      <!-- CTA -->
      <rect x="300" y="450" width="200" height="50" rx="25" fill="url(#textGrad)"/>
      <text x="400" y="483" text-anchor="middle" font-size="18" font-weight="bold" fill="white" font-family="Arial, sans-serif">
        Install Free
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(assetsDir, 'marquee-1400x560.png'));

  console.log('Generated: marquee-1400x560.png');
}

// Generate small promo tile (440x280)
async function generateSmallPromo() {
  const width = 440;
  const height = 280;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${TIKTOK_BLACK}"/>
          <stop offset="100%" style="stop-color:#161823"/>
        </linearGradient>
        <linearGradient id="textGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${TIKTOK_CYAN}"/>
          <stop offset="100%" style="stop-color:${TIKTOK_RED}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bgGrad2)"/>

      <!-- Icon -->
      <rect x="170" y="40" width="100" height="100" rx="20" fill="url(#textGrad2)"/>
      <text x="220" y="105" text-anchor="middle" font-size="50" fill="white">🛍️</text>

      <!-- Title -->
      <text x="220" y="175" text-anchor="middle" font-size="24" font-weight="bold" fill="url(#textGrad2)" font-family="Arial, sans-serif">
        TikTok Shop Manager
      </text>
      <text x="220" y="205" text-anchor="middle" font-size="14" fill="#888" font-family="Arial, sans-serif">
        AI Seller Tools
      </text>

      <!-- Features -->
      <text x="220" y="250" text-anchor="middle" font-size="12" fill="white" font-family="Arial, sans-serif">
        📊 Analytics • 🎯 Competitors • 🔥 Trends • 💰 Pricing
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(assetsDir, 'promo-small-440x280.png'));

  console.log('Generated: promo-small-440x280.png');
}

// Generate store icon (128x128)
async function generateStoreIcon() {
  const size = 128;

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${TIKTOK_CYAN}"/>
          <stop offset="100%" style="stop-color:${TIKTOK_RED}"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="26" fill="url(#iconGrad)"/>
      <text x="64" y="80" text-anchor="middle" font-size="64" fill="white">🛍️</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(assetsDir, 'icon-128.png'));

  console.log('Generated: icon-128.png');
}

// Generate screenshot placeholder (1280x800)
async function generateScreenshotPlaceholder(name, title, subtitle) {
  const width = 1280;
  const height = 800;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a2e"/>
          <stop offset="100%" style="stop-color:#16213e"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bgGrad3)"/>

      <!-- Browser chrome mockup -->
      <rect x="100" y="50" width="1080" height="700" rx="12" fill="#2d2d2d"/>
      <circle cx="130" cy="75" r="8" fill="#ff5f56"/>
      <circle cx="155" cy="75" r="8" fill="#ffbd2e"/>
      <circle cx="180" cy="75" r="8" fill="#27c93f"/>

      <!-- Extension popup mockup -->
      <rect x="680" y="100" width="400" height="550" rx="12" fill="#000"/>
      <rect x="680" y="100" width="400" height="60" rx="12" fill="url(#bgGrad3)"/>

      <!-- Title bar -->
      <text x="700" y="140" font-size="18" font-weight="bold" fill="${TIKTOK_CYAN}" font-family="Arial">
        🛍️ TikTok Shop Manager
      </text>

      <!-- Feature highlight -->
      <text x="640" y="380" text-anchor="middle" font-size="36" font-weight="bold" fill="white" font-family="Arial">
        ${title}
      </text>
      <text x="640" y="420" text-anchor="middle" font-size="18" fill="#888" font-family="Arial">
        ${subtitle}
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(assetsDir, `screenshot-${name}.png`));

  console.log(`Generated: screenshot-${name}.png`);
}

async function main() {
  console.log('Generating Chrome Web Store assets...\n');

  await generateMarquee();
  await generateSmallPromo();
  await generateStoreIcon();

  // Generate screenshot placeholders
  await generateScreenshotPlaceholder('dashboard', 'Product Analytics Dashboard', 'Track sales, prices, and trends at a glance');
  await generateScreenshotPlaceholder('products', 'Product Tracking', 'Monitor prices and sales history');
  await generateScreenshotPlaceholder('competitors', 'Competitor Analysis', 'Track rival shops and threat levels');
  await generateScreenshotPlaceholder('trends', 'AI Trend Detection', 'Discover winning products with AI');
  await generateScreenshotPlaceholder('pricing', 'Smart Price Optimizer', 'Get AI-powered pricing recommendations');

  console.log('\nDone! Assets generated in store-assets/');
  console.log('\nNote: Replace screenshot placeholders with actual extension screenshots before submission.');
}

main().catch(console.error);
