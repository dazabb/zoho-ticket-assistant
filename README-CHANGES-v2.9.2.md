# MAU Operation Desk v2.9.2 — CSA generator reliability fix

- CSA Generator is now self-contained on GitHub Pages: DOCX engine, ZIP library, and gold-master CSA template are embedded directly in the generator page.
- Fixes `CSADocx is not defined` and removes dependence on a separately hosted built-in template file.
- Uses the known-good 110417 CSA layout as the gold-master format.
- Restores real Word bullet formatting for Engineer Task/Activity in generated DOCX files.
- Keeps one task per line in the UI/plain-text preview while using bullets only in the DOCX output.
- Preserves Unicode and special characters (e.g. ñ, Ñ, &, apostrophes, en/em dashes, parentheses, /, degree symbols) and decodes common HTML entities.
- Cleans visit schedule values so email prose such as `Kindly provide the list of Field Engineers...` is excluded.
- Support Agent and Assigned Engineer remain blank.
- Embedded template requires no upload and no separate network fetch.
