# CSA Generator — v2.9.2

The Managed Services CSA Generator runs fully in the browser and is designed for GitHub Pages.

## v2.9.2 reliability changes

- The generator page is now self-contained. Its DOCX engine, JSZip runtime, and gold-master CSA template are embedded in `index.html`.
- No CSA template upload is required for normal use.
- No separate template fetch is required, removing the previous `Built-in template unavailable` failure mode.
- The previous `CSADocx is not defined` failure mode is removed because the DOCX engine loads inside the same page before the application code.
- Generated DOCX files use the known-good one-page CSA layout represented by ticket 110417.
- Engineer Task/Activity keeps the Word bullet formatting in the DOCX while the form/plain-text preview remains one task per line without typed bullets.
- Unicode and special characters are preserved, including ñ / Ñ, &, apostrophes, en/em dashes, parentheses, slashes, and degree symbols. Common HTML entities are decoded before extraction.
- Visit schedules are normalized and stop after the valid date/time so copied email prose is not inserted into the CSA.
- Support Agent and Assigned Engineer are always left blank unless the generator is intentionally changed.

## Multiple tickets

Paste multiple complete Zoho ticket blocks and click **Extract all to batch**. Each detected ticket is added to the queue and can be downloaded individually or together as `CSA_Batch.zip`.

## GitHub Pages

Upload the project while preserving the existing folder structure. The parent MAU Operation Desk opens this generator at:

`managed-services/csa-generator/index.html`

Because the generator is self-contained, updating that one HTML file is enough for the CSA module itself.
