# Ticket Assistant Zoho Autofill Chrome Extension

Install this folder as an unpacked Chrome extension:

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Choose this `chrome-extension` folder
5. If you open Ticket Assistant as a local `file://` page, open the extension details and enable **Allow access to file URLs**

Then click **Create Ticket** in Ticket Assistant. The extension will try to reuse one prepared Zoho new-ticket tab for much faster repeat autofill runs. If the extension bridge is unavailable, it falls back to opening Zoho with the payload in the URL hash.

## Troubleshooting reloads

After changing `content.js` or `background.js`, go back to `chrome://extensions/` and click **Reload** on this unpacked extension before testing again.

When Zoho opens, confirm the autofill panel shows the latest script revision. If the panel still shows an older revision such as `2026-05-19-r12`, Chrome is still running the previous content script and the latest fixes are not loaded yet.
