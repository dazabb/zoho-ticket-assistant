MAU OPERATION DESK v3.2.5 — NO DUPLICATE MAU-ONLY SUGGESTIONS
Patch only — November 11, 2026

REPLACE ONE WEBSITE FILE:
  library/init.js

WHY
The suggested subcategory card repeated the Zoho dropdown's "Status / Health Report" for Radius (and other accounts), but called the repeated value "MAU only". MAU-only means an independent advisory that is not sent to Zoho; it should not be presented as an extra classification when both values are identical.

NEW BEHAVIOR
- If MAU's suggestion is the SAME as the mapped Zoho Issue Subcategory (ignoring capitalization, spaces around / and -, and leading/trailing spaces), hide the entire redundant advisory card. Users continue seeing the correct classification in the normal Zoho section.
- If MAU suggests a DIFFERENT subcategory, show "Additional suggested subcategory · MAU only" with the original Zoho Issue Category, explanation tooltip, "Why was this suggested?" and "Ask a follow-up".
- If Zoho subcategory is missing but a suggestion exists, continue showing the advisory, without filling Zoho from unsupported values.
- The shared suggestion catalog remains reusable across all accounts.

SCOPE
- No change to Zoho dropdown mappings, ticket category, severity, portfolio, or SI/MS.
- No change to copied Zoho ticket data, client email, Monde reporting, or the extension.
- No Chrome extension update is needed.

INSTALLATION
1. Back up your website's current library/init.js.
2. Replace library/init.js with the file in this ZIP.
3. Republish the site, then hard refresh (Ctrl + Shift + R).
4. Reopen the Radius status report: expect "Status / Health Report" in Zoho, with no duplicate MAU-only card.

VALIDATION
- node --check: PASS.
- Existing all-account tests: 209 checks over 31 enrolled accounts: PASS (tested source rule compatibility).
- Existing shared-classification tests: 35 scenarios: PASS.
- Existing explanation and follow-up tests: 138 checks: PASS.
- Patch-specific tests: 106 checks across 8 account scenarios: PASS.
- Live browser deployment remains unverified; review existing Zoho ticket fields before saving.
