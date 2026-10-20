# MAU Operation Desk - Zoho Autofill Extension

## Install in Chrome

If an older **Ticket Assistant Zoho Autofill** extension is installed, remove or disable it first to avoid duplicate autofill actions.

1. Extract `MAU-Zoho-Extension-v1.1.zip` to a folder (MAU-Zoho-Extension).
2. Open **chrome://extensions/** in the Chrome address bar.
3. Turn on **Developer mode** (upper-right corner).
4. Click **Load unpacked** and select the extracted **MAU-Zoho-Extension** folder.
5. If you run MAU by directly opening `index.html` (file://), open the extension **Details** and turn on **Allow access to file URLs**. The recommended method is to start MAU using `START-MAU-DESK.bat` and `http://127.0.0.1:3000`.
6. Return to MAU, click **Install extension** > **Check connection**. You should see **Zoho extension connected**.
7. Generate a Zoho ticket using Gemini, click **Create Ticket**, then review the fields in the newly opened Zoho form. Submit manually when everything looks correct.

### Supported MAU addresses

- `http://127.0.0.1:3000/` or `http://localhost:3000/`
- `https://dazabb.github.io/zoho-ticket-assistant/`
- `file:///.../index.html` (requires access to file URLs)

### Notes

- **The extension does not create or submit tickets automatically.** It fills the form for review.
- **The extension is not published in the Chrome Web Store**. Chrome requires manual Load unpacked for local extensions. A site cannot install it silently.
- Check `chrome://extensions/` to make sure the extension is enabled and has no errors.
- If you update files in the extracted extension folder, click **Reload** on its extension card.
- Keep the extension in its own permanent folder. Deleting or moving it may prevent Chrome from loading it.
- On Chrome's extension details page, grant appropriate site access if Chrome requests it. Never use arbitrary extension installers or paste credentials into the extension.
- Some Zoho fields might require manual selection if Zoho changed its form.

Open MAU > Install extension to access the setup guide.
