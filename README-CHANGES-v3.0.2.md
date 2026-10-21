# MAU Operation Desk v3.0.2 — CSA Engineer Tasks

- CSA Generator now reads the original ticket's engineer activities even when they appear without a heading or bullets beneath the Issue Description.
- Keeps task lists separate from tool lists in later service-desk replies and onsite scheduling conversations.
- Preserves explicit task headings and supports work lists found in other customer requests.
- Prompts staff to enter Engineer Task / Activity before downloading a CSA if no work scope was found; applies to individual and batch downloads.
- Uses Zoho Customer Company Name before store name for the CSA company field, and preserves the full location and visit schedule.
- Removes an empty trailing Word template paragraph that otherwise creates a blank second page when several tasks are included.
- Continues to use `#<ticket number>.docx` filenames and leaves Job Done / Resolution empty for field staff to complete after the visit.

## How to use

Paste the entire Zoho ticket, including the original customer request in the Conversations area, then choose **Download CSA**. If no engineer tasks were found, MAU opens **Edit details first** so the scope can be entered manually.
