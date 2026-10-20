# MAU Operation Desk v2.9.1 — CSA extraction accuracy update

- Fixed Customer Visit Schedule extraction so flattened Zoho/email text does not leak into the field. For example, `October 17, 2026 9:00 AM Kindly provide...` is now stored as `October 17, 2026 9:00 AM` only.
- Added stricter date/time parsing with weekday removal and AM/PM normalization.
- Improved main ticket-number detection by prioritizing the ticket number shown beside `Reply All`, reducing false matches from Zoho ticket-list entries.
- Improved multi-ticket splitting for pasted full Zoho pages and separator-based custom blocks.
- Added HTML entity decoding, zero-width-character cleanup, and explicit Unicode preservation. Names and addresses containing characters such as `ñ`, `&`, `/`, apostrophes, parentheses, en/em dashes, and other Unicode characters are retained in generated DOCX files.
- Added an Extraction Check panel that flags missing or suspicious values before DOCX generation.
- Added a generation guard for contaminated schedule fields.
- Clarified that the bundled CSA template is automatic. No DOCX template upload is required for normal use.
- Moved custom template upload under an optional Advanced section.
- The bundled `managed-services/csa-generator/assets/CSA_TEMPLATE.docx` remains the default template for GitHub Pages and local usage.
