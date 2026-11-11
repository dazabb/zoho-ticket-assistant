MAU Operation Desk v3.2.5 — Zoho Autofill Setup v1.6.2 PATCH ONLY

Replace these files at their existing paths in your MAU v3.2.5 GitHub website repository:
- index.html
- library/zoho-extension-setup.js
- library/zoho-ui-autofill.js
- local-server.js (for local server users)
- MAU-Zoho-Extension-v1.6.2.zip (website root; makes Download v1.6.2 work)

Then publish/refresh the website (Ctrl+Shift+R).
If you have not installed extension v1.6.2, extract the bundled ZIP and load its MAU-Zoho-Extension folder in chrome://extensions (Developer mode > Load unpacked). Remove the older unpacked extension to avoid conflict.

Changes:
- Setup popup badge, download link, displayed instructions now v1.6.2
- Connection checks require v1.6.2+ rather than v1.6.1+
- Managed Services extension upgrade notice now v1.6.2
- Local server can serve the v1.6.2 ZIP
No edits to ticket customer mapping, Monde reporting, serial number protection, or Chrome extension code.
