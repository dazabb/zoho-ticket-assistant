# MAU Operation Desk v2.5 — Zoho Backup Incident Subcategory Validation

The **Backup - Incident** Issue Sub-Category values are now checked against the exact options supplied by the MAU/Zoho Desk user.

## Corrected reference — Backup - Incident

1. -None-
2. Access Issue
3. Additional Compute (Expansion)
4. Capacity Issue
5. Check Backup Policy
6. Check Backup Retention and Performance
7. Configuration Issue
8. Device Issue
9. Hardisk Change
10. Migration
11. Reliability Issue
12. Restart backup policy
13. Restart Backup Server
14. Restart Catalog
15. Restoration
16. Retrigger failed backup
17. Run Guide
18. Tape Request

**Performance Issue is NOT a valid Backup - Incident subcategory.** It must not be generated, copied, or passed to Zoho for that Issue Category. The above are exact dropdown strings, including the spelling "Hardisk Change".

### Typical mappings from the incident evidence

- EWB #112374, Atempo Time Navigator backup server slowdown while using Restore and Archive: **Check Backup Retention and Performance** (suggested closest matching option).
- Confirmed backup job failure, without a more specific documented condition: **Reliability Issue**.
- Verified repository/storage capacity issue: **Capacity Issue** (keep the correct Issue Category based on the incident; an offload capacity-tier failure may be `Storage - Incident`).
- Verified login, authorization, or permissions failure: **Access Issue**. Don't confuse a slow/unresponsive Restore and Archive feature with a credential error.
- If information is insufficient: show **Verify in Zoho Desk** in the draft and leave the actual dropdown blank for manual selection.

These are evidence-based suggestions, **not overrides for user-selected valid options**. The validation is scoped to `Backup - Incident`; other families such as `Disaster Recovery - Incident` retain their own lists.

## What was fixed

- Added validation in the Gemini ticket instructions **and** after the AI output.
- Validates older saved chat ticket previews.
- Validates the `Create Ticket` autofill payload after other account and Request/Incident corrections.
- The Chrome extension also refuses to apply a non-existent Backup - Incident subcategory as a final safety check.
- Fixed an omission where `Technology/Platform` could be missing from the autofill payload, even if it appeared in the chat output.
- No changes to the Monde report generator or Viber follow-up.

## Testing performed

- EWB ticket #112374: `Incident`, `Backup - Incident`, `Check Backup Retention and Performance`, `Atempo Time Navigator`, `BaaS`.
- All 18 dropdown entries remain recognized (including `-None-` as an unselected field).
- Unknown/unsupported labels are left blank rather than guessed.
- DRaaS/RackWare incident and Atempo administrative request regression tests pass.

**Before live use:** Test a draft ticket in Zoho Desk and confirm the dropdown choices match the actual account configuration. The extension fills fields; it does **not** submit tickets.
