# MAU Operation Desk v1.4 — Viber Follow-up Update

The app now includes **Reporting → Viber Follow-up** in the left navigation and **Viber Follow-up** in the top navigation. This is a local CSV-based report generator. It does not use Gemini, update Zoho tickets, or send anything to Viber.

## How to use

1. Start MAU Operation Desk normally using `START-MAU-DESK.bat`, or open `index.html` in a supported browser. Choose your existing profile.
2. Open **Viber Follow-up** and upload a Zoho Desk ticket CSV. The parser accepts the historical `Jan 1 - Oct 13 2026.csv` export format (with its first four metadata lines) and ordinary ticket CSVs with `Ticket Id` and `Status` headers.
3. Confirm the **Report date & time** (defaults to the CSV's Generated On timestamp if supplied). Choose **Nearing overdue** threshold (24 hours by default).
4. **Assigned tickets only** is enabled by default to match the daily SE follow-up report. Disable it to include unassigned tickets. The skipped count is shown in the review notice.
5. Optionally add line-by-line remarks using `#TICKETID | remark`. These are manual, confirmed facts only.
6. The optional **Closed tickets without a Closed Time column** box accepts `#111684 | 13 Oct 2026 05:34 PM | remark`. It will include the ticket in the selected report's closed section only if the dates match. Do not enter unverified closure times.
7. If a CSV status has changed since export, expand **Optional: Correct ticket statuses**, and enter e.g. `#111263 | On Hold | 13 Oct 2026 01:02 PM`. The status and on-hold time are explicitly supplied by you, not inferred.
8. Click **Generate Viber update**, review the preview and warnings, then **Copy Viber message** or **Save as .txt**. Paste it into your Viber group manually.

## Included sections

- New High Severity Ticket (SEVERITY 1)
- High Severity Ticket (Sev 2)
- Overdue Tickets
- Tickets Nearing Overdue
- Open Tickets
- On hold tickets
- Resolved / For closing tickets (only when applicable)
- Ticket closed [report date] (only when closing times have been confirmed)

High-severity unresolved tickets appear in the high-severity sections rather than being repeated in open/hold sections.

## Important data limitations

The supplied January–October export contains **2,193 rows**, with `Created Time`, `Ticket Id`, `Customer Company Name`, `Severity Level`, `Assigned Onsite Engr`, `Due Date`, `Is Overdue`, `Status (Ticket)` and `Ticket On Hold Time`. It **does not include Closed Time**. The app cannot infer a ticket's closure date from its creation date or present status; consequently it does not claim any historical ticket was closed on the chosen report date unless you supply confirmed closing times or a later CSV includes a Closed Time column.

The export is a snapshot rather than live Zoho status. Review changed ticket states, missing assignees and overdue times before sending. Uploaded CSV data, remarks, and report content remain in your browser tab and are not sent to MAU servers or Gemini through this feature.
