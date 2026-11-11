MAU OPERATION DESK v3.2.5 — CONSOLIDATED PATCH ONLY

BASE: v3.2.5 FINAL Integrated (NOT v3.2.6)
No full website distribution. No Chrome extension update.

This patch combines:
1. First standalone customer marker priority (e.g., MONDE on the first line), so unrelated account names later in pasted ticket details do not take over the customer/company mapping.
2. Full Oct 2026 Zoho dropdown map for Solutions (SI/MS), Supported Portfolio, Technology/Platform, Ticket Category, Issue Category and Issue Sub-Category.
3. No 'Verify in Zoho Desk' text as a fake selectable value in mapped ticket fields. Evidence-backed categories are filled, but truly unresolved dropdowns remain blank for manual selection. Never fabricate a category or severity just to fill a field.
4. Existing v3.2.5 Dell Unity/RTVM and Oona SI/closed ticket consistency rules.
5. Existing standard Ticket Workspace Serial Number blank (does NOT blank real serials in the separate Managed Services Tickets workspace).
6. Monde Nissin monitoring alert Started-date CSV fix from the previous v3.2.5 report hotfix (DD/MM/YYYY and MM/DD/YYYY).

FILES (all are relative to your v3.2.5 WEBSITE ROOT):
  library/customer-safety.js
  library/zoho-dropdown-map.js
  library/ticket-consistency.js
  library/backup-subcategory.js
  library/request-safety.js
  library/sandz-ticket-rules.js
  reporting/monde.js
  reporting/monde.html

INSTALL:
1. Back up those same relative files in your v3.2.5 website repository.
2. Copy the library/ and reporting/ folders from this patch into the v3.2.5 website ROOT. Merge folders, overwrite ONLY the eight matching files. Do not upload the outer ZIP as a separate web app.
3. Publish the website and hard-refresh Ctrl+Shift+R.
4. Do NOT remove other website files. Do NOT change the v1.6.2 Chrome extension for this patch.

KNOWN LIMITATIONS:
- The provided UI lists valid choices, but they do not establish which one fits every future incident. For insufficient evidence, leave the field blank and review it; never assert that a guessed choice is verified.
- Source-level tests do not verify current Zoho live dropdown behavior, browser navigation, AI generation, or ticket submission. MAU does not auto-save tickets.
