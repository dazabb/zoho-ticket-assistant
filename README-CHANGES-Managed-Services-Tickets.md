# MAU Operation Desk — Managed Services Tickets Workspace

Updated from the user's `zoho-ticket-assistant-main.zip` (November 4, 2026).

## Added
- **Managed Services Tickets** as a separate workspace beside the SANDZ ticket assistant and CSA Generator.
- Paste-to-ticket automation for the Managed Shared Service layout, including serial numbers in subjects.
- Editable company, account, store/site, service address, contact, ticket category, issue category and subcategory, serial, severity, priority, support agent, assigned engineer and work scope.
- A customer-facing acknowledgment and engineer notes. The client email requires a known ticket number before copying.
- Optional Gemini enhancement and screenshot reading, using the active MAU profile's existing key.
- Separate follow-up threads for Zoho, Client Email and Engineer Notes, with local per-profile saved drafts.
- Zoho extension v1.5 supports new-ticket and confirmed Edit Ticket autofill for the Managed Shared Service layout. The user still saves or submits manually.

## Reference examples checked
- Ticket #113492: Zamboanga Mindpro, serial `4CE9420T7B` (not a different Cebu engineer update).
- Ticket #113444: Robinsons Cebu, serial `4CE237CG10` obtained from the customer message even when Zoho's serial field is blank.
- Ticket #109752: slow POS is a Hardware Incident, serial `4CE94121MS`.

## Installation
1. Replace your MAU GitHub Pages files with the contents of this ZIP, or apply the patch ZIP to matching paths.
2. Install/replace the unpacked Chrome extension with v1.5 (`MAU-Zoho-Extension-v1.5.zip`).
3. Refresh MAU and Zoho Desk.
4. Open **Managed Services Tickets** in the sidebar.

> The actual Zoho New/Edit form has not been accessed in this environment. The extension chooses only matching available controls and never presses Save/Submit. Verify the layout, assignee, serial number and classification before saving.
