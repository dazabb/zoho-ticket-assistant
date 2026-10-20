# MAU Operation Desk v2.9 — Managed Services CSA Generator

- Added **Manage Services → CSA Generator** to the main MAU navigation and toolbar view switcher.
- Added a browser-only CSA DOCX generator under `managed-services/csa-generator/`.
- The generator uses the bundled CSA template and can also accept another CSA `.docx` template selected from the user's computer.
- Added single-ticket extraction and **multi-ticket paste**. Multiple Zoho ticket blocks can be pasted back-to-back, or custom ticket blocks can be separated with `---`, `====`, or `___`.
- **Extract all to batch** detects unique ticket numbers, builds a queue, and can generate:
  - an individual `<ticket-number>.docx` for any queued ticket; or
  - `CSA_Batch.zip` containing one DOCX per ticket.
- Batch items can be loaded back into the review form, edited, and updated before generation.
- CSA rules remain enforced: full address over region-only placeholders, current Philippine date for Created Date/Time, newest visible schedule, numeric DOCX filenames, one engineer task per line, and blank Support Agent / Assigned Engineer values.
- Added dark-mode synchronization between MAU Operation Desk and the embedded CSA Generator.
- Updated the optional local static server to serve `managed-services/` assets and `.docx` templates.
- No backend is required for CSA generation. Ticket text and selected DOCX templates are processed in the browser.
