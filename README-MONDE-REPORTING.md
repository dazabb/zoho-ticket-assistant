> **MAU Operation Desk v0.8:** Reporting uses local CSV uploads, and does not require a backend. Open the app through `START-MAU-DESK.bat` or host the frontend as static files. Each user can optionally supply their own Gemini API key for the ticket assistant. This is unrelated to Zerto CSV reporting.

# SANDZ Ticket Assistant — Monde Nissin Reporting

This package is an update to the existing Zoho Ticket Assistant site. The original ticket workspace, assistant features, Chrome extension and files are retained.

## What's new

- Cleaner SANDZ Operations layout with a dedicated navigation sidebar.
- **Reporting > Monde Nissin** page.
- Import Zerto's original **VPG Export.csv** and **Monitoring Alert.csv** files (no column changes required).
- Click **Generate daily report** to create an email following the supplied Monde Nissin / SANDZ reporting structure.
- Copy subject and formatted content separately into Zoho Desk, or save an HTML file.
- Optional per-recovery-site screenshots, with preview editing before copying.
- No automated sending and **no sign-off / name / company signature** at the end of the generated email. Add your own signature in Zoho Desk.

## Get started

1. Open `index.html` in Chrome / Edge (or deploy the entire folder on your existing static hosting). Keep all folders together.
2. Choose your existing Ticket Assistant profile if prompted.
3. In the left navigation, go to **Reporting > Monde Nissin**.
4. Upload **VPG Export.csv** and **Monitoring Alert.csv**, fresh from Zerto Analytics. Both are required; the Generate button stays disabled until both are loaded.
5. Check **Report date**. This defaults to the date on your computer. Zerto CSVs do not reliably state the snapshot date.
6. Click **Generate daily report**. Review the recovery-site statuses, alerts, and email preview. Edit the preview if needed.
7. Use **Copy subject** and **Copy email content**, then paste them into Zoho Desk and add your own sign-off/signature there.

## Important notes

- Data comes **only from the CSV files you manually upload**. Nothing contacts Zerto automatically.
- Files and optional screenshots are read locally in the browser. They are not uploaded by the reporting module.
- Actual RPO values are interpreted as **seconds**, matching the uploaded Zerto export.
- The daily report includes VPG alerts by recovery site. Additional ZVM monitoring alerts appear under *Review monitoring alerts* for separate attention, but are **not counted as VPG alerts** in the email.
- The supplied example had 53 VPGs (51 healthy, 1 warning, 1 error). Each new report uses current uploaded files, not this historical data.
- You must review the email, site exceptions, and discrepancies before sending. The reporting module does not submit, send, or update Zoho Desk tickets.
- Existing Ticket Assistant features may depend on their original external script dependencies and account/API settings; these are not changed by the reporting module.

## Source files changed or added

- `index.html`: app navigation and reporting pane.
- `library/refresh.css`: updated application layout, responsive navigation and simplified toolbar.
- `library/navigation.js`: client-side switching between Ticket Workspace and Reporting.
- `reporting/monde.html`: standalone reporting page interface.
- `reporting/monde.js`: CSV parsing, summaries, alert handling and email generation.

## Version

v0.3 — integrated CSV-based reporting prototype. Manual review required.
