MAU Operation Desk v3.2.5 - Reusable Issue Classification Suggestions (Patch Only)

REPLACES ONLY:
  library/init.js

PURPOSE
- MAU-only advisory issue categories and subcategories now come from a single shared,
  fixed catalog, not customer-specific or vendor-specific names.
- Synonyms and equivalent symptoms normalize to the same canonical pair regardless of
  customer, account or platform (e.g., Zerto, RackWare or Veeam replication failure).
- There are 8 broad advisory issue categories and 21 defined advisory subcategories.
- Existing suggestions in saved messages are recomputed using the shared catalog when
  displayed in the current Ticket Workspace, so older wording does not multiply categories.
- Incomplete or non-specific cases do not manufacture new categories.

EXAMPLES
- Monde Zerto replication failed / Oona Veeam replication failed / Radius RackWare
  sync failure -> Disaster Recovery / Replication Failure
- Monde ZVM license update / Oona Veeam license renewal / Radius RackWare
  license activation -> Software & Licensing / License Management
- Radius server replication report / Monde VPG daily report / Oona Veeam
  health report -> Service Operations / Status / Health Report
- Dell Unity / HPE server firmware updates -> Infrastructure / Firmware Upgrade

SAFETY / COMPATIBILITY
- Suggestions are visible ONLY in MAU Operation Desk.
- Existing Zoho dropdown Issue Category / Issue Subcategory and ticket values stay as-is.
- Suggestions are NOT sent to the Chrome extension, Zoho autofill, copy Zoho fields,
  email, or the original ticket text.
- No account databases, customer routing, serial number rules, or Monde reporting
  logic are changed.
- No Chrome extension update is needed.
- Patch is compatible with the v3.2.5 All Accounts Issue Subcategory patch because
  that patch updates other files.

INSTALLATION
1. Back up the existing library/init.js from your GitHub website repository.
2. Copy this archive's library/init.js over the existing file.
3. Publish the site and hard refresh (Ctrl + Shift + R).

TESTING
- JavaScript syntax check passed.
- 35 distinct classification examples passed, including cross-account synonyms.
- 8 canonical category names and 21 unique classification IDs checked.
- Prior 209 all-account issue classification assertions passed (31 enrolled accounts).
- Browser/Zoho live deployment was not performed.
