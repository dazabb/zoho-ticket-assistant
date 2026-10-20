# MAU Operation Desk v2.7 — New and Edit Ticket autofill

When Create Ticket is pressed, the Chrome extension checks open Zoho edit-ticket tabs on the SANDZ help center. If any are found, MAU prompts the user to choose a **new ticket** (default) or an **existing edit ticket** by ID.

The edit route follows `/agent/amtiphilippines/sandz/tickets/edit/<numeric-id>`; no unrelated page will be edited. Existing tickets require an explicit confirmation. By default MAU does not change the existing subject, description, account/customer, status, ownership, channel, ticket source or serial number, but there is an optional checkbox to replace subject/description/company name. The extension never presses Save or Submit.

Both app and extension retain the exact v2.6 Zoho field mappings.

Chrome extension version: 1.3.0. Reload the new extension folder in `chrome://extensions` after updating. Testing performed with mock Chrome tabs/message bridge and code checks; live Zoho DOM still requires checking in your tenant.
