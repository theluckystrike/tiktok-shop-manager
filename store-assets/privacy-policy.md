# Privacy Policy for TikTok Shop Manager

**Last Updated:** January 2026

## Overview

TikTok Shop Manager is a Chrome browser extension designed to help TikTok Shop sellers track products, monitor competitors, and optimize pricing. This privacy policy explains what data we collect and how we handle it.

## Data Collection

### What We Store Locally

All data is stored locally on your device using Chrome's `chrome.storage.local` API:

1. **OpenAI API Key** - Your personal API key for AI features (stored securely, never transmitted to our servers)
2. **Tracked Products** - Product names, prices, sales data, and URLs you choose to track
3. **Competitor Data** - Shop names and URLs you add for monitoring
4. **Trend Analysis History** - Keywords you've analyzed and results
5. **Usage Counter** - Number of AI analyses used (for free tier tracking)
6. **Settings** - Your preferences (notifications, auto-track, etc.)

### What We DON'T Collect

- Personal information (name, email, address)
- TikTok account credentials
- Browsing history outside TikTok Shop
- Payment information
- Analytics or telemetry data
- Crash reports

## Third-Party Services

### OpenAI API

When you use AI-powered features (trend analysis, price optimization), your queries are sent directly to OpenAI's API using YOUR API key. This data is subject to [OpenAI's Privacy Policy](https://openai.com/privacy/).

**What's sent to OpenAI:**
- Product descriptions and names
- Competitor price data (anonymized)
- Analysis queries

**What's NOT sent to OpenAI:**
- Your personal information
- TikTok account details
- Complete browsing history

## Data Storage & Security

- **Local Only:** All data remains on your device
- **No Cloud Sync:** Data is not synced across devices
- **No Servers:** We don't operate any backend servers
- **Encryption:** All communications use HTTPS
- **No Analytics:** We don't track how you use the extension

## Your Rights

You can at any time:
- **View your data:** All stored in Chrome's extension storage
- **Delete your data:** Use "Clear All Data" in Settings
- **Remove API key:** Delete from Settings anytime
- **Uninstall:** Removes all extension data

## Host Permissions

The extension requests access to TikTok Shop domains:
- `seller-us.tiktok.com`
- `seller.tiktok.com`
- `shop.tiktok.com`
- `www.tiktok.com`

This access is used ONLY to:
- Display the floating action button
- Extract product/seller data when you click "Track"
- Detect when you're on a TikTok Shop page

We NEVER:
- Read your TikTok messages
- Access your TikTok account
- Modify TikTok pages (except adding our button)
- Track your activity across sites

## Children's Privacy

This extension is not intended for users under 13 years of age. We do not knowingly collect data from children.

## Changes to This Policy

We may update this policy as needed. Significant changes will be noted in the extension's changelog.

## Contact

For privacy questions or concerns:
- GitHub Issues: https://github.com/theluckystrike/tiktok-shop-manager/issues

## Summary

✅ All data stored locally on your device
✅ No personal information collected
✅ No tracking or analytics
✅ No backend servers
✅ You control and can delete all data
✅ OpenAI integration uses YOUR key directly
