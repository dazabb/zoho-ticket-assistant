MAU Managed Services Ticket Fix v3.2.4

Changes:
- Uses Store Name / Branch / Site (or 'Please do the following for ...')
  as Customer Company Name when the selected ticket has no company field.
- Keeps the Zoho corporate Account Name in its own field.
- Recognizes clearly titled hardware provisioning Requests instead of incorrectly
  converting them to Incidents because the repair activities mention damage.
- Keeps the selected ticket's subject and serial number, even if it names a
  branch by its outlet code rather than its complete store name.
- Leaves the ordinary Edit Ticket safeguards, profile Support Agent, saved Cc,
  reporting tools, and extension unchanged.

To apply:
Replace managed-services/ticket-workspace/managed-ticket.js in your existing
MAU website/repository with the file from this ZIP. Publish, then refresh the
MAU page (Ctrl+Shift+R).

Regression test: #94104, Regatta SM City Iloilo, Serial SGH815QS24.
Company = Regatta SM City Iloilo
Account = Golden ABC, Incorporated
Ticket Category = Request
Issue Category = Hardware
Issue Sub-Category = Desktop
Engineer activities = 5

Zoho Save / Submit still require employee review and manual action.
