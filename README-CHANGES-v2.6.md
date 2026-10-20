# MAU Operation Desk v2.6 — Exact Zoho Dropdown Remapping

Authoritative source: user-supplied Zoho Desk options, October 20, 2026.

- Verifies Solutions (MS/SI), Supported Portfolio, Technology/Platform, Ticket Category, Issue Category, and Issue Sub-Category against the exact supplied lists.
- 12 Incident issue categories, 16 Request issue categories, and their category-specific subcategories.
- Distinguishes Disaster Recovery - Incident vs DR - Incident; Disaster Recovery - Request vs DR - Request.
- Keeps valid selections `Monitoring`, `Retrigger failed backup`, `CPU Change`, and other user-confirmed values (rather than remapping them to a different option).
- Fixes Cloud - Incident old extra options; fixes omitted DR - Request, monitoring, hardware options.
- Uses the same validation on generated chat tickets, ticket previews, Create Ticket payloads, and the updated Chrome extension. The extension now attempts Technology/Platform autofill when its exact Zoho field can be located safely; failed selection is reported for manual review.
- When evidence does not establish a dropdown choice, the app marks it for Zoho verification and leaves the actual autofill value blank. It does not pick the first dropdown item.
- Normalizes known historical aliases (`RackWare` → `Rackware`; `Atempo TINA` / `Atempo Time Navigator` → `Atempo Time Navigator (ATINA)`), per Zoho option text.
- Do not assume `Ticket Category: Incident` is the same as `Solutions: SI`. Those are independent fields.

## Installation

Unzip and start `START-MAU-DESK.bat`, then refresh the MAU page. Reload the unpacked Chrome extension at chrome://extensions (or replace the old folder with the new `chrome-extension` folder, then reload). Actual dropdown availability may depend on Zoho Desk layout and permissions; verify before submitting.

## The list remains editable by maintainers

`library/zoho-dropdown-map.json` is the plain-text snapshot of the dropdown schema. Runtime copies are in `library/zoho-dropdown-map.js` and `chrome-extension/zoho-dropdown-map.js` and must stay in sync.
