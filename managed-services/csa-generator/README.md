# CSA Generator

Browser-only CSA DOCX generator embedded in MAU Operation Desk under **Manage Services → CSA Generator**.

## Built-in template — no upload required

The generator automatically loads `assets/CSA_TEMPLATE.docx`. For normal use, you do **not** need to choose or upload a DOCX template. Select **Generate current DOCX** and the browser downloads `<ticket-number>.docx` to the local computer.

A different CSA template can still be selected from **Advanced: use a different CSA template** when needed. That custom file is read only in the browser.

## Single ticket

1. Paste the Zoho ticket.
2. Select **Extract one ticket**.
3. Review the fields and the **Extraction Check** panel.
4. Select **Generate current DOCX**.
5. The browser downloads `<ticket-number>.docx`.

## Multiple tickets

1. Paste several complete Zoho ticket copies into the same text area. Complete ticket pages can be pasted back-to-back. For hand-written/custom field blocks, separate tickets with `---`, `====`, or `___`.
2. Select **Extract all to batch**.
3. Review queue items. Items with missing/suspicious data are marked for review.
4. Use **Edit** on any queue item, then **Add / update batch** after changes.
5. Use **DOCX** on one row for an individual document or **Download all as ZIP** for all queued tickets.

## Extraction and CSA rules

- Schedule parsing extracts only the date/time portion. Flattened text such as `October 17, 2026 9:00 AM Kindly provide...` becomes `October 17, 2026 9:00 AM`.
- Weekday labels such as `(Saturday)` are removed from the CSA schedule value.
- Full physical address takes priority over broad values such as `Mindanao` or `Visayas`.
- Created Date/Time uses the current date in the Philippines.
- The main ticket number beside **Reply All** is prioritized over ticket IDs visible in Zoho list panes.
- Support Agent and Assigned Engineer are always cleared.
- Engineer tasks remain one line per task, with no bullets added by the generator.
- Output filenames are numeric ticket numbers only.
- Unicode and special characters are preserved, including accented letters and `ñ`, ampersands, slashes, apostrophes, parentheses, and typographic dashes.
- HTML entities copied into text are decoded before extraction where appropriate.

No backend is used. Ticket data, the built-in template, and DOCX generation stay in the browser session.
