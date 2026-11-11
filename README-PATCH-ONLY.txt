MAU Operation Desk v3.2.5 — MAU-only suggested Issue Category & Subcategory

PATCH ONLY — no version upgrade, no Chrome extension update.

Replace only:
  library/init.js

What changes:
- Adds a distinct "Suggested issue classification · MAU only" block beneath the normal Zoho classification in Ticket Workspace replies, only when the current ticket contains sufficient details.
- Suggestions use technical categories beyond the allowed Zoho dropdown labels (e.g. Disaster Recovery — License Management / ZVM License Update).
- The Zoho Issue Category / Issue Subcategory fields are unchanged and must still use your exact Zoho dropdown mappings.
- Suggestions are never included in raw Zoho output, Copy Zoho Fields, the Chrome extension payload, or the original workspace content.
- Existing saved ticket replies also show a suggestion when reopened.
- In conversational MAU field-review questions, Gemini may suggest a more specific category pair outside Zoho, explicitly labeled as advisory only.
- No suggestion is shown when the details do not support a specific technical classification.

Example ticket #114781 (Monde ZVM license update):
  Zoho: DR - Request / Update License
  MAU suggestion: Disaster Recovery — License Management / ZVM License Update / Zerto Analytics Alignment

All earlier v3.2.5 patches (Monde reporting, serial safeguard, Zoho categories, extension v1.6.2) remain separate and unchanged.
Publish the updated website and hard refresh (Ctrl+Shift+R).
