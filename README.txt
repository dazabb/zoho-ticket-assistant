MAU Operation Desk v3.2.5 — Monde Nissin Reporting FINAL PATCH ONLY

Install into your existing v3.2.5 website repository:
  reporting/monde.js
  reporting/monde.html

Replace only the two matching files, republish GitHub Pages and hard refresh.
No change to Ticket Workspace, Managed Services, or Chrome extension.

Changes:
- Recovery-site Status displays counts of VPGs with History Not Meeting SLA
  and RPO Not Meeting SLA, independently of Red/Yellow alert counts.
- Protection labels are bold and use grammatical singular/plural counts.
- A VPG with an alert is still included in the protection-status count.
- One Red Alert: or Yellow Alert: heading per recovery site; each affected
  VPG appears below that heading on a separate line.
- No redundant 'in Zerto' wording after alert counts or descriptions.
- Preserves prior DD/MM/YYYY Monitoring Alert CSV importer fix.
- Preserves current VPG status source of truth, latest same-severity alert
  matching, and final alert summary counts.

The imported VPG Export's Protection Status column determines whether a
VPG is out of SLA; alert severity alone does not establish an SLA failure.
