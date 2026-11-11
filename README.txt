MAU OPERATION DESK v3.2.5 — ZVM LICENSE CATEGORY FIX (PATCH ONLY)

Fix for Monde Nissin ticket #114781: Zerto Virtual Manager (ZVM) license update.
Expected:
  Ticket Category: Request
  Issue Category: DR - Request
  Issue Subcategory: Update License
  Supported Portfolio: (DRaaS) Disaster Recovery as a Service
  Technology/Platform: Zerto
  Solutions: MS
  Severity: Sev4
  Priority: Low

WHY BLANK BEFORE: The original dropdown validator only checked existing Issue Category values. For a blank category, it could not infer a ZVM license-update request. The generic 'Disaster Recovery - Request' dropdown does NOT contain 'Update License' whereas 'DR - Request' does. The request-safety module could also clear subcategories and failed to fill initially empty fields.

FILES TO REPLACE (relative to your v3.2.5 website root):
  library/zoho-dropdown-map.js
  library/request-safety.js

INSTALL:
1. Keep your existing v3.2.5 app, reporting patch, and Chrome extension v1.6.2.
2. Back up and replace ONLY the two files listed above.
3. Publish GitHub Pages; hard-refresh (Ctrl+Shift+R) and regenerate ticket #114781.
4. Review fields in Zoho before saving. This patch does NOT write to live Zoho by itself.

SCOPING:
- Uses Zerto/ZVM + license-update action + Request as evidence; does not force DR - Request for all Zerto tickets.
- Preserves existing valid issue categories for unrelated requests.
- All other v3.2.5 functionality and Monde reporting files stay unchanged.
- Source-level regression tests cover text and Zoho payload normalization, but not an authenticated live browser session.
