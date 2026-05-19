# Ticket Assistant BETA → Zoho Desk UI Autofill

This beta version does **not** create tickets through the Zoho API.

It is built to make ticket work faster, but it is not perfect yet. Please review the output before using it, and report bugs or odd behavior when you spot them.

It adds the workflow you asked for:

1. Put the ticket details in the Ticket Workspace.
2. Click **Create Ticket** inside Ticket Assistant.
3. Zoho Desk opens at `https://helpcenter.amti.com.ph/agent/amtiphilippines/sandz/tickets/new`.
4. The Chrome extension reads the ticket data from the URL hash and auto-fills the Zoho form.
5. You review the ticket, choose/verify contact if needed, then click **Submit** manually.

## Key features

- All-in-one workspace: Keep ticket details, alerts, emails, images, notes, and generated Zoho output in one place.
- Built-in AI help: Ask questions and review ticket details without needing a separate AI tool.
- Image support: Paste or upload screenshots and let the system pull useful text from them automatically.
- Zoho-ready ticket output: Generate cleaner summaries, descriptions, severity, priority, and escalation notes.
- Bridge-call support: Get guidance on what to check next, what to capture, and when to escalate.
- Zoho autofill workflow: Open Zoho Desk and auto-fill most ticket fields to speed up ticket creation.

## Why the Chrome extension is needed

A normal web page cannot directly control or fill fields inside another domain like `helpcenter.amti.com.ph` because browsers block cross-site access. The extension is the safe way to allow your Ticket Assistant page to fill the Zoho Desk page.

## Files changed

- `index.html`
  - Added the **Create Ticket** button in the workspace actions.
  - Added `library/zoho-ui-autofill.js`.

- `library/zoho-ui-autofill.js`
  - Parses your workspace text.
  - Builds the Zoho ticket field payload.
  - Opens the Zoho new ticket page with the autofill data.

- `chrome-extension/content.js`
  - Runs only on Zoho/helpcenter pages.
  - Reads the autofill payload.
  - Fills Zoho fields by label.

## Install the Chrome extension

1. Open Chrome.
2. Go to `chrome://extensions/`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the `chrome-extension` folder from this package.

## Use it

1. Open your Ticket Assistant.
2. Make sure your workspace has data like:

```text
Customer Company Name: Orix
Account Name: Orix - Sandz
Subject: SANDZ-MSDCO-Orix-Zerto VPG AUCTIONS Extended Journal Retention Failure
Description: The VPG 'AUCTIONS' is reporting a failed 'Extended Journal Retention' task.
Ticket Category: Incident
Issue Category: Disaster Recovery
Issue Subcategory: Zerto
Severity: Sev3
Priority: Medium
Supported Portfolio: (DRaaS) Disaster Recovery as a Service
Ticket Owner: Sandz Support L1.5
Solutions: MS
```

3. Click **Create Ticket**.
4. Zoho opens and fields will start filling.
5. Review all fields before clicking **Submit**.

## Important notes

- The extension will try to fill dropdowns by opening the field and selecting the matching option.
- Zoho custom dropdowns can change markup, so some fields may still need manual checking.
- Contact selection may still require manual confirmation if Zoho requires choosing an existing Contact record.
- The script does **not** auto-submit the ticket. This is intentional so you can review the data first.
