# Managed Services Ticket Workspace

Open **Managed Services Tickets** in the MAU sidebar. This workspace is separate from the SANDZ ticket assistant and uses the **Managed Shared Service** Zoho layout.

1. Paste the selected Zoho ticket or the customer's original request.
2. Choose **Generate ticket**. Customer, store/site, address, tasks, serial number and ticket fields are prepared using the information supplied. An API key is not required for text extraction.
3. Review/edit the ticket fields. When the current ticket contains a serial number, it is included in the subject.
4. Optional: choose **Improve with Gemini**, or paste an image and generate. Image interpretation requires your profile's Gemini API key.
5. Choose **Create Ticket**. MAU can fill a new Zoho form or offer an already-open Edit Ticket tab. You must select and confirm an existing ticket to edit it. **MAU never saves/submits automatically.**
6. Use **Client email** and **Engineer notes** tabs to prepare related messages. Enter a Zoho ticket number before copying a client acknowledgment.

### Zoho extension

Install **MAU Zoho Extension v1.6** (included in the app ZIP), then reload MAU and open Zoho. In Chrome, open `chrome://extensions` and use **Developer mode → Load unpacked** to select the extracted `MAU-Zoho-Extension` folder. This version adds Managed Services `Layout`, `Assigned Engineer`, location and serial-number support. Existing SANDZ autofill remains available.

The default New Ticket address is `https://helpcenter.amti.com.ph/agent/amtiphilippines/sandz/tickets/new`. Change this under **Zoho settings** if you use a different Zoho department. The actual department and layout must be verified before saving.

### Safety

- The selected ticket's original customer request takes priority over later replies about other devices.
- An existing valid Zoho category, severity and engineer assignment are preserved when present.
- The CSV reference has 233 tickets with valid categories (218 Requests and 15 Incidents). It does not contain the full Zoho Managed Services subcategory menu, so the subcategory remains editable.
- The SANDZ MS/SI, Backup, and DRaaS rules **are not applied** to Managed Shared Service tickets.
- The current draft, recent tickets, and follow-up conversations are saved only in each profile's browser storage. They are not synchronized to coworkers' computers; no shared chat-history feature is included.
- Personal Gemini keys are used through the existing MAU profile configuration and never copied into the new workspace's storage.
- No ticket is created or edited in Zoho until the user chooses Create Ticket. The final Zoho Save/Submit action is always manual.
- Screenshots are kept in memory for the current draft and are not stored with chat history.
