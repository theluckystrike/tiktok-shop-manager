# Permissions Justification for TikTok Shop Manager

This document explains why each permission is required and how it's used.

## Requested Permissions

### 1. `storage`

**Purpose:** Store user data locally

**What's Stored:**
- OpenAI API key (for AI features)
- Tracked products (names, prices, URLs)
- Competitor information
- Trend analysis history
- Usage counter (free tier tracking)
- User settings/preferences

**Why Needed:**
- Enables persistent data without requiring user accounts
- Allows the extension to remember tracked products between sessions
- Stores API key securely so users don't need to re-enter it

**Data Flow:**
- Data is written when user tracks products or changes settings
- Data is read when popup opens to display dashboard
- Data never leaves the user's device

---

### 2. `activeTab`

**Purpose:** Detect when user is on TikTok Shop

**What It Does:**
- Checks the URL of the currently active tab
- Only activated when user opens the extension popup

**Why Needed:**
- Show relevant context (e.g., "Track this product" when on product page)
- Enable one-click tracking from the popup
- Provide contextual help based on current page

**What It DOESN'T Do:**
- Doesn't access tab content automatically
- Doesn't track browsing history
- Only works on the active tab when popup is open

---

### 3. `tabs`

**Purpose:** Query active tab information

**What It Does:**
- Works together with `activeTab`
- Gets the URL of the current tab

**Why Needed:**
- Determine if user is on TikTok Shop domain
- Enable content script communication
- Support the floating action button feature

**What It DOESN'T Do:**
- Doesn't access all open tabs
- Doesn't track tab history
- Limited to checking current tab URL

---

### 4. `alarms`

**Purpose:** Schedule periodic background tasks

**What It Does:**
- Creates a recurring alarm to check price alerts
- Runs once per hour (minimal resource usage)

**Why Needed:**
- Check if any tracked products hit price alert thresholds
- Notify user of price drops/increases they're watching

**What It DOESN'T Do:**
- Doesn't wake device from sleep unnecessarily
- Doesn't run continuously (only hourly checks)

---

### 5. `notifications`

**Purpose:** Show desktop notifications for price alerts

**What It Does:**
- Displays native Chrome notification when price target is hit
- Only triggers for user-set price alerts

**Why Needed:**
- Alert users when products reach their target price
- Timely notifications help users catch deals

**What It DOESN'T Do:**
- No promotional/marketing notifications
- Only user-initiated alerts trigger notifications
- Users can disable in Settings

---

## Host Permissions

### TikTok Shop Domains

```
https://seller-us.tiktok.com/*
https://seller.tiktok.com/*
https://www.tiktok.com/*
https://shop.tiktok.com/*
https://affiliate.tiktok.com/*
```

**Purpose:** Run content script on TikTok Shop pages

**What the Content Script Does:**
1. Injects a floating action button (FAB) in the corner
2. Extracts product data when user clicks "Track Product"
3. Extracts seller data when user clicks "Track Seller"

**Why These Specific Domains:**
- `seller-us.tiktok.com` - US seller center
- `seller.tiktok.com` - Global seller center
- `shop.tiktok.com` - TikTok Shop storefront
- `www.tiktok.com` - Product pages embedded in main site
- `affiliate.tiktok.com` - Affiliate product pages

**What It DOESN'T Do:**
- Doesn't access other websites
- Doesn't read TikTok messages or DMs
- Doesn't access account settings
- Doesn't modify page content (except adding our button)

---

## Data Flow Diagram

```
User Action                    Data Flow
───────────                    ─────────
1. Track Product    →    Content script extracts product data
                         ↓
                    Data stored in chrome.storage.local
                         ↓
                    Displayed in extension popup

2. AI Analysis      →    Product data sent to OpenAI API
                         (using user's API key)
                         ↓
                    Results returned and displayed
                         ↓
                    Results saved to local storage

3. View Dashboard   →    Data read from chrome.storage.local
                         ↓
                    Displayed in extension popup
```

---

## Permissions We DON'T Request

| Permission | Why We Don't Need It |
|-----------|---------------------|
| `<all_urls>` | Only need TikTok Shop domains |
| `history` | Don't track browsing history |
| `bookmarks` | Not relevant to our functionality |
| `identity` | No account/login required |
| `webRequest` | Don't need to intercept requests |
| `cookies` | Don't access TikTok session |
| `geolocation` | Location not needed |

---

## Security Measures

1. **Minimal Permissions:** Only request what's absolutely necessary
2. **Local Storage:** All data stays on user's device
3. **No Backend:** No servers that could be compromised
4. **Direct API Calls:** OpenAI calls go directly from browser to OpenAI
5. **User Control:** Users can delete all data anytime
6. **Transparent:** All code available on GitHub

---

## Summary

| Permission | Necessity | User Benefit |
|-----------|-----------|-------------|
| `storage` | Essential | Persistent data without accounts |
| `activeTab` | Essential | Context-aware UI |
| `tabs` | Essential | Tab URL detection |
| `alarms` | Essential | Background price alert checks |
| `notifications` | Essential | Price drop/increase alerts |
| Host permissions | Essential | Product/seller tracking |

All permissions are the minimum required to provide core functionality. We follow the principle of least privilege and request no unnecessary access.
