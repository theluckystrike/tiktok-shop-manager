# TikTok Shop Manager - Pre-Publication Debugging Guide

## Quick Setup

1. **Load Extension in Chrome:**
   ```bash
   cd ~/tiktok-shop-manager
   npm run build
   ```
   - Open `chrome://extensions`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder

2. **Open DevTools for Extension:**
   - Right-click extension icon → "Inspect popup"
   - Or: `chrome://extensions` → Click "service worker" link under your extension

---

## Debugging Checklist

### 1. Popup UI Tests

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Popup opens | Click extension icon | Popup appears, 400x500px | ⬜ |
| Loading state | Open popup | Shows spinner briefly, then content | ⬜ |
| Onboarding flow | First open (clear storage first) | 3-step onboarding wizard | ⬜ |
| Tab navigation | Click each tab (Home, Products, etc.) | Content changes, tab highlights | ⬜ |
| Scroll behavior | Scroll in content area | Smooth scroll, no overflow issues | ⬜ |
| Dark theme | Visual inspection | TikTok-style dark gradient background | ⬜ |
| Responsive text | Check all text | No truncation, proper wrapping | ⬜ |

**How to test onboarding:**
```javascript
// In DevTools console
chrome.storage.local.clear(() => console.log('Storage cleared'));
// Close and reopen popup
```

### 2. Settings & API Key Tests

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| API key input | Go to Settings, enter key | Key appears masked (•••) | ⬜ |
| Show/hide key | Click eye icon | Toggles between masked/visible | ⬜ |
| Invalid key format | Enter "invalid" | Error: "Invalid API key format" | ⬜ |
| Invalid key (API) | Enter "sk-invalid123" | Error: "Invalid API key" | ⬜ |
| Valid key | Enter real OpenAI key | Success message, key saved | ⬜ |
| Key persists | Close/reopen popup | Key still there (masked) | ⬜ |
| Remove key | Click save with empty field | Key removed, message shown | ⬜ |

### 3. Product Tracking Tests

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Empty state | Products tab, no products | "No Products Tracked" message | ⬜ |
| Add product (manual) | Via content script | Product appears in list | ⬜ |
| Product card expand | Click product card | Expands with details | ⬜ |
| Sort by sales | Click "Sales" sort | Products reorder by sales | ⬜ |
| Sort by price | Click "Price" sort | Products reorder by price | ⬜ |
| Price alert | Set alert, enter target | Alert saved | ⬜ |
| Remove product | Click "Remove" button | Confirmation, product removed | ⬜ |

### 4. Competitor Tracking Tests

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Empty state | Rivals tab, no competitors | "Track Your Competitors" message | ⬜ |
| Add competitor | Click "+Add", fill form | Competitor appears with score | ⬜ |
| Threat score | Check competitor card | Score 0-100, threat level shown | ⬜ |
| Expand competitor | Click competitor card | Shows details, stats | ⬜ |
| Remove competitor | Click "Remove" | Confirmation, competitor removed | ⬜ |

### 5. Trend Scanner Tests (Requires API Key)

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Empty state | Trends tab | "Discover Trending Products" | ⬜ |
| No API key | Search without key | Error message about API key | ⬜ |
| Analyze trend | Enter keyword, click search | Loading, then analysis card | ⬜ |
| Analysis content | Check result | Viability, market size, risks | ⬜ |
| Trend saved | Check list below | Keyword added to history | ⬜ |
| Remove trend | Expand, click "Remove" | Trend removed from list | ⬜ |

### 6. Price Optimizer Tests (Requires API Key)

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Empty state | Pricing tab, no products | "Start tracking products" message | ⬜ |
| No products | Dropdown empty | "Choose a product..." only | ⬜ |
| Select product | Choose from dropdown | Product info displayed | ⬜ |
| Analyze price | Click "Get AI Price" | Loading, then recommendation | ⬜ |
| Price range | Check result | Min, recommended, max prices | ⬜ |
| Confidence | Check result | Low/Medium/High with color | ⬜ |
| Copy price | Click "Copy Price" | Price copied to clipboard | ⬜ |

### 7. Freemium Usage Tests

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Initial counter | Check header | "10 left" indicator | ⬜ |
| Use analysis | Run trend/price analysis | Counter decreases | ⬜ |
| Progress bar | Check header | Bar fills as usage increases | ⬜ |
| Limit reached | Use all 10 analyses | Error when trying more | ⬜ |
| Reset counter | Settings → Reset Usage | Counter back to 10 | ⬜ |
| Monthly reset | (manual test) | Resets on 1st of month | ⬜ |

### 8. Content Script Tests (On TikTok Shop)

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| FAB appears | Visit shop.tiktok.com | Floating button bottom-right | ⬜ |
| FAB menu | Click FAB | Menu with 3 options | ⬜ |
| Track Product | On product page, click | Toast: "Product added" | ⬜ |
| Track Seller | On shop page, click | Toast: "Seller added" | ⬜ |
| Data extraction | Track product | Name, price, sales extracted | ⬜ |
| Menu closes | Click outside | Menu dismisses | ⬜ |
| SPA navigation | Navigate within TikTok | FAB persists | ⬜ |

**Test URLs:**
- `https://shop.tiktok.com` - Main shop
- `https://seller-us.tiktok.com` - Seller center
- Product pages with `/product/` in URL

### 9. Storage Persistence Tests

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Data persists | Add product, close browser | Product still there on reopen | ⬜ |
| Clear all data | Settings → Clear All Data | All data wiped | ⬜ |
| Storage inspection | DevTools → Application → Storage | Data visible in chrome.storage | ⬜ |

**Inspect storage:**
```javascript
// In DevTools console
chrome.storage.local.get(null, (data) => console.log(data));
```

### 10. Error Handling Tests

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Network error | Disconnect internet, analyze | Graceful error message | ⬜ |
| API rate limit | Spam requests | 429 error handled | ⬜ |
| Invalid response | (simulate) | Doesn't crash, shows error | ⬜ |
| Empty data | Product with no price | Handles gracefully | ⬜ |

---

## Common Issues & Fixes

### Popup Doesn't Open
1. Check manifest.json syntax (JSON validator)
2. Check for console errors in service worker
3. Ensure popup/index.html exists in dist

### Content Script Not Running
1. Check host_permissions in manifest match URL
2. Reload extension after changes
3. Check for CSP violations in console

### API Calls Failing
1. Verify API key is correct (starts with `sk-`)
2. Check network tab for request/response
3. Ensure OpenAI has credits

### Styles Not Loading
1. Check popup.css is in dist/
2. Verify path in popup/index.html
3. Check for Tailwind compilation errors

### Storage Not Persisting
1. Check for errors in console
2. Verify storage permission in manifest
3. Test with chrome.storage.local.get()

---

## Pre-Submission Final Checklist

- [ ] All UI tests pass
- [ ] All feature tests pass
- [ ] No console errors
- [ ] No broken images/icons
- [ ] Privacy policy link works
- [ ] Screenshots are actual (not placeholders)
- [ ] Version number is correct
- [ ] Description is accurate
- [ ] Permissions are minimal

---

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Generate icons
npm run generate-icons

# Generate store assets
npm run generate-store-assets
```

---

## Useful DevTools Commands

```javascript
// Clear all extension storage
chrome.storage.local.clear(() => console.log('Cleared'));

// View all stored data
chrome.storage.local.get(null, console.log);

// Test message to content script
chrome.tabs.query({active: true}, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {type: 'GET_PAGE_DATA'}, console.log);
});

// Check usage
chrome.storage.local.get('usage', console.log);
```
