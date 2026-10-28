MAU Ticketing Field Fix — v3.0.8d

For the existing v3.0.8b (Database-First RTVM Fix).
This patch does NOT include or require the cancelled Support Agent extension v3.0.8c.

INSTALL
1. Open your zoho-ticket-assistant repository.
2. Replace library/ticket-consistency.js with this patch's matching file.
3. Publish the updated GitHub Pages site.
4. Reload MAU with Ctrl+Shift+R. Generate the ticket again to see corrected fields.

FOR RTVM TICKET #113329
- Severity: Sev2 (three reported storage issues: blocked snapshot, failed naming services updates, degraded filesystem)
- Priority: Medium (standard pairing for Sev2)
- Supported Portfolio: Dell
- Technology/Platform: Not Applicable (valid Zoho dropdown; Dell Unity is not a choice in that particular dropdown)
- Solutions: SI (customer project database)
- Subject prefix: SANDZ-SI
- Ticket Category: Incident
- Issue Category: Storage - Incident
- Issue Subcategory: Capacity Issue

Exact non-placeholder values are applied to the chat ticket and the Create Ticket payload.
If a valid severity is already filled in the CURRENT Zoho ticket, it is preserved.
The fallback for a single isolated storage issue stays Sev3; no claims of outage are invented.
Other customers / services are not modified by this Dell Unity-specific rule.

Tests: JS syntax and browser regression; variations of RTVM generated reply,
Create Ticket fields, source-defined severity, other EWB tickets; passed.
The Zoho web form itself was not edited or submitted in tests. Manually review before Save.
