MAU OPERATION DESK v3.2.5 — EXISTING ZOHO CATEGORY + EXPLAINABLE SHARED SUBCATEGORY
PATCH ONLY — November 11, 2026

Replace ONLY:
- library/init.js
- library/output-improvements.css

WHAT CHANGED
1. The Issue Category shown in the MAU-only suggestion panel uses the EXACT Issue Category already present in the generated Zoho ticket. Thus "Disaster Recovery - Request", "Disaster Recovery - Incident", "DR - Request", "Backup - Incident" etc. are not renamed or replaced by broad taxonomies. If no Zoho Issue Category was output, it says "Not set in Zoho ticket" rather than inventing a category.
2. Only the more specific MAU-only Suggested Subcategory comes from the fixed shared catalog. Replication Failure, License Management, Status / Health Report etc. reuse the same names across accounts; no customer/product-specific category proliferation.
3. Both suggested fields have hover tooltips (and keyboard-focus help icons) explaining WHY the label is being shown, citing the ticket's subject/description and the matching issue type. A "Why was this suggested?" disclosure offers a clickable/mobile-friendly explanation.
4. "Ask a follow-up" opens the existing Troubleshooting/QA conversation and PREPARES a contextual question comparing the MAU suggestion with the actual Zoho dropdown. It does not send automatically or spend a Gemini request until the user presses Send. Users can then ask more follow-up questions.

SAFETY/COMPATIBILITY
- The suggestion panel remains MAU-only. It never edits the actual Zoho category/subcategory, Zoho payload, copied fields, Chrome extension, or account mapping.
- The MAU suggestion is advisory and should not be interpreted as a selectable Zoho subcategory.
- The main Ticket Workspace keeps Serial Number empty. Managed Services serial behavior is unchanged.
- Compatible with the v3.2.5 All Accounts Issue Subcategory patch (different source files).
- No changes to Monde reporting, client email Cc, saved sessions, or Chrome extension.

INSTALL
1. Back up the current files in the MAU GitHub website repository.
2. Replace the two files at the paths above, preserving the folder structure.
3. Publish and hard refresh (Ctrl + Shift + R).
4. Hover the info icon or open the "Why was this suggested?" disclosure; click "Ask a follow-up" to move to the Troubleshooting tab.

TESTS
- node --check on init.js: PASS
- 35 existing reusable-suggestion cases: PASS
- 209 existing all-account assertions covering 31 enrolled accounts: PASS
- 138 new assertion checks for preserving exact Zoho categories, matching the same subcategory across customers, escaped tooltip text, and question handoff: PASS
- Live deployed site / Zoho browser interaction was not tested.
