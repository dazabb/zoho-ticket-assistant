# Monde Nissin Report — v2.0

## Use

1. Open **Monde Nissin** in MAU Operation Desk.
2. Upload the **VPG Export.csv** and **Monitoring Alert.csv** files from Zerto. The filenames can vary; the exported column headings are what matter.
3. Check the report date and click **Generate report**.
4. Click **Copy subject**, then **Copy email + table**. Paste into the Zoho Desk **rich-text reply/editor**.
5. If Zoho does not keep the legend table in the full pasted email, place the cursor where the table belongs, then click **Copy table** and paste it separately.

## What's fixed

- Alerts are matched to the full **VPG name and recovery site**, never simply by the alert ID (one alert ID may be reused for different VPGs).
- For multiple alerts for the same VPG, only the one with the **latest `Started` timestamp** is used in the email and error summary. A later Yellow replaces an earlier Red for that VPG. The review panel lists the latest alerts and notes how many older alerts were excluded.
- The final **Alert Summary** shows counts and a compact list of VPG names, **not repeated full alert descriptions**.
- The HTML legend table has inline borders/cell styling and the Copy button writes HTML and plain-text clipboard formats. If that isn't permitted, it attempts a browser rich selection. If both methods are blocked it selects the report for a manual Ctrl+C.
- **Copy table** is available for editors that behave differently when you paste a complete email.
- Existing Monde report subject format and no-signature ending are preserved.

## Important

- The **VPG status** counts shown in *View VPG details* are from the VPG export. **Red/Yellow Alert Summary** counts are from the latest matching monitoring alert for each VPG; the numbers can differ because they describe different data.
- Zerto exports must include the **Started** column with valid dates for VPG alerts. Without it, MAU cannot safely determine which alert is newest.
- This is a reporting helper. Review current Zerto status and alerts before sending.
- Zoho Desk's macro editor or rich-text editor may sanitize pasted HTML. The app creates a real HTML table on the clipboard, but cannot force Zoho to accept table formatting. If a particular Zoho editor strips tables, use its rich-text reply composer or the **Copy table** alternative and verify it visually.
- All other MAU features remain in the application. No automatic ticket submission or email sending.
