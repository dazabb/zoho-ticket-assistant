# MAU Operation Desk v1.5 — Viber Follow-up

## What's updated

- **Ticket Closed as of [report date]** is included in every generated update. It lists **all** CSV rows whose status is closed and whose actual **Closed Time** matches that date, even when no engineer is assigned. Closure timestamps are **not guessed** from status or due dates.
- Supports variations of the Zoho `Closed Time` column. The historical `Jan 1 - Oct 13 2026.csv` does **not** include a closure-time column. You can fill gaps by pasting the previous Viber message (with an explicit dated closing-time line), or entering known closings manually.
- **Nearing overdue within** is now **3 days (72 hours)** by default. It is configurable.
- Entries with `Escalated to Sandz` as their status remain categorized by actual due date. Only the unnecessary status wording is removed from the copied Viber message. This preserves overdue follow-ups.
- **Paste previous Viber update (optional)** accepts the entire Viber report. The tool matches `#ticket-number` to the uploaded CSV and carries forward ticket-specific remarks and dated closure details.
- Where both the pasted message and CSV contain the same field, the **CSV is authoritative** for status, severity, due date, owner, and customer. A previously pasted, same-day explicit closure date can supplement an export without Closed Time. If the CSV status conflicts, MAU warns you to verify in Zoho.
- Manual remarks typed in `#ticket-number | note` format **override** older Viber remarks. Manual closed times override both. Review stale notes before sending.
- Copy Viber message and Save .txt remain available. No Gemini connection is required and no data is sent to a server.

## Steps

1. Open **Viber Follow-up** in MAU Operation Desk.
2. Upload your most recent **Zoho Desk ticket CSV**. Prefer one that includes **Closed Time**.
3. Set the report date/time (usually today). The 3-day threshold is already selected.
4. Optionally paste your **previous Viber update** in the new multiline field. This helps retain notes such as "Waiting for BPITC to confirm" and "Ongoing Integrity Restore". It does **not** treat the previous ticket statuses or dates as today's statuses.
5. Optionally add confirmed updates in `Ticket remarks`, and confirmed closing times or status corrections in the fields below.
6. Select **Generate Viber update**, review warnings, then **Copy Viber message** to your Viber group.

## Reporting limitations

- The historical 2026 export has no Closed Time, so **all actual same-day closures cannot be recovered from that CSV alone**. The copied previous Viber update can fill only the closures it explicitly lists for the chosen date. To include every closed ticket from today, export a Zoho view that contains `Closed Time (Ticket)` / `Closed Time` or manually confirm missing closures.
- Pasted remarks may describe yesterday's state; these are carried forward as reference text and require review. MAU will not infer that a pending action was completed.
- This feature is local; it does not check live Zoho or send Viber messages automatically.
