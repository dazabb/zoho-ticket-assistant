# MAU Operation Desk - Zoho Autofill Extension

## Install in Chrome

If an older **Ticket Assistant Zoho Autofill** extension is installed, remove or disable it first to avoid duplicate autofill actions.

1. Extract `MAU-Zoho-Extension-v1.3.zip` to a folder (MAU-Zoho-Extension).
2. Open **chrome://extensions/** in the Chrome address bar.
3. Turn on **Developer mode** (upper-right corner).
4. Click **Load unpacked** and select the extracted **MAU-Zoho-Extension** folder.
5. If you run MAU by directly opening `index.html` (file://), open the extension **Details** and turn on **Allow access to file URLs**. The recommended method is to start MAU using `START-MAU-DESK.bat` and `http://127.0.0.1:3000`.
6. Return to MAU, click **Install extension** > **Check connection**. You should see **Zoho extension connected**.
7. Generate a Zoho ticket using Gemini, click **Create Ticket**, then choose a New Ticket or an already-open Edit Ticket. For an Edit Ticket, verify the ticket ID and customer and check the confirmation box. Then review the fields in Zoho and Save or Submit manually.

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

### Existing ticket editing (v1.3)

- Keep a Zoho tab open at `https://helpcenter.amti.com.ph/agent/amtiphilippines/sandz/tickets/edit/<numeric-id>`.
- In MAU, click **Create Ticket**. If edit tabs are present, select a specific ID or choose **Create a new Zoho ticket**. New is the default.
- Selecting an existing ticket requires confirming the ID and customer.
- Edit mode preserves the existing subject, description, customer company, status, agent, channel, ticket source, and serial number by default; the checkbox allows intentionally replacing the subject and description. Account Name is never changed by the extension.
- On Zoho Edit Ticket forms, open the ticket property fields before autofilling. The extension won't fill if they're not available, and it never clicks Save.
- If the edit tab changes between selection and filling, MAU cancels rather than sending data to a different ticket.
