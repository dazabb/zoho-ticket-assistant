# Monde Nissin report v2.2 — current VPG alert priority

The user-facing email does not label alert details as "Latest Alert" or mention older conflicting alerts. It reports one corresponding alert per VPG according to the VPG health status exported by Zerto.

- RED VPG → choose a matching Red Monitoring Alert for that exact VPG and recovery site. Where multiple Red alarms exist, use the newest Red record; do not override it with a newer Yellow alarm.
- YELLOW VPG → choose a matching Yellow Monitoring Alert.
- GREEN VPG → no current alert shown in the email (older exported alert rows are not proof of current trouble).
- RED/YELLOW without corresponding matching severity alarm → report its current status and ask for verification, without inventing an error description.
- Summary counts current VPG status, not raw count of monitoring alerts.

Example test, Oct 16, 2026: Current VPG Export.csv has 53 VPGs, 50 Healthy, 3 Erroneous. For MNCVENDOR_DB at MONDE-MAKATI the generator uses the Red VRA0039 journal limit at 4096000 MB, even though a Yellow journal-history alert started later on Oct 15. It does not display both. The other current Red VPGs are MONDE-AWS MNCVENDORDB (new), and MONDE-MK2 EPO.

**Important:** Neither VPG Export.csv nor Monitoring Alert.csv establishes the current live Zerto state after export. Verify against Zerto when the exports are stale or collected at different times. Monitoring alerts have Started timestamps but no cleared/resolved timestamps; VPG health is the best available snapshot for severity selection in this offline tool.

The copy email + table action retains the rich HTML table with a browser fallback for pasting to the Zoho Desk editor; Zoho behavior still depends on editor support.
