# Ticket Assistant → Zoho Desk UI Autofill

This version does **not** create tickets through the Zoho API.

It adds the workflow you asked for:

1. Put the ticket details in the Ticket Workspace.
2. Click **Create Ticket** inside Ticket Assistant.
3. Zoho Desk opens at `https://helpcenter.amti.com.ph/agent/amtiphilippines/sandz/tickets/new`.
4. The Chrome extension reads the ticket data from the URL hash and auto-fills the Zoho form.
5. You review the ticket, choose/verify contact if needed, then click **Submit** manually.

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

## Change the Zoho target URL

The default URL is:

```text
https://helpcenter.amti.com.ph/agent/amtiphilippines/sandz/tickets/new
```

If you need to change it, open your browser console on the Ticket Assistant page and run:

```js
TicketAssistantZohoAutofill.setZohoNewTicketUrl("https://helpcenter.amti.com.ph/agent/amtiphilippines/sandz/tickets/new");
```
