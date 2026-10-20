# Monde Nissin Daily Report — v2.1

## Steps
1. In **Monde Report**, upload the latest **VPG Export.csv** and **Monitoring Alert.csv** files from Zerto, preferably captured at the same time.
2. Select the date and click **Generate report**.
3. Review the **current VPG status** and **latest alerts**; click **Copy subject** and **Copy email + table** to paste into Zoho Desk. If Zoho strips the legend, use **Copy table** and paste into a rich-text email editor.

## What changed
- **The VPG status is authoritative for current health**: if `Status = Erroneous` in the VPG export, it is reported as RED even if the newest alert is Yellow.
- The latest alert per VPG is determined by the monitoring export's `Started` timestamp, not by severity or CSV row position. It is described **separately** from the current status.
- If an older Red alert and newer Yellow alert exist for the same VPG, the full text of the latest Yellow is used, the current Red status remains in the report, and an earlier Red alert is flagged for manual confirmation. An older alert's existence does not prove it was resolved or remains active.
- The summary reports **current Red/Yellow VPG counts** and **latest Red/Yellow alert counts** separately, with one entry per affected VPG.
- The legend explains Red as an **error requiring verification**, not definitive proof replication has stopped: VPGs can show `Meeting SLA` and an error simultaneously (e.g. a full journal alert).
- If a VPG appears Green in one export and has a Red latest monitoring alert in the other, a warning asks you to compare export times.

## Tested against the supplied October exports
- `export (9).csv` VPG snapshot: **53 total, 50 Healthy, 0 Warning, 3 Erroneous**.
- `export (8).csv` Monitoring alerts: **3 VPGs**, newest alert levels **2 Error, 1 Warning**; **4 separate ZVM alert records**.
- `[MONDE NISSIN MK2 New->MKT] MNCVENDOR_DB`: current VPG status **Erroneous/RED**; latest alert **Warning** (Oct 15, 2026, 4:17:54 PM), plus older Red journal-limit alert (Oct 15, 2026, 9:32:42 AM).
- The VPG overview screenshot from a different moment shows **49 Green and 4 Red**; values in a CSV report always come from that CSV snapshot, not the screenshot.

## Important
- Neither CSV has a reliable export-created timestamp. Do not mix files exported at significantly different times.
- **The app cannot read live Zerto status.** Review current alerts if the report conflicts with the UI.
- Actual pasting into Zoho may depend on Zoho's rich-text editor; the application cannot force an editor to preserve HTML tables.
- No automated ticket creation or email sending is performed by the Monde reporting tab.


## v2.2 update: report the current alert
- Use the VPG Export.csv status as the authority for current VPG health.
- Where a currently Red VPG has both Red and Yellow monitoring alerts, use the Red alarm description; do not let a newer Yellow timestamp downgrade that VPG.
- Show only one alert description per VPG (the newest matching the current status).
- Do not show both current/latest alert labels or duplicate the old Yellow alarm in the email.
- The email summary reports current Red/Yellow VPG counts and a short issue per affected VPG.
- Monitoring Alert.csv provides alert start times but not proof of clearance. If a current Red VPG has no Red monitoring record, the report asks for verification instead of inventing a Red error.
