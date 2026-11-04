MAU Operation Desk v3.2.1 — Managed Services ticket autofill update

Install website patch:
1. Extract this ZIP over the ROOT of your MAU / zoho-ticket-assistant GitHub repository (the folder containing index.html).
2. Overwrite the files when prompted, commit and publish the updated website.
3. Open the MAU website and refresh it (Ctrl+Shift+R).

Install Chrome extension v1.6 (REQUIRED for the new automatic edit and Support Agent behavior):
1. Extract MAU-Zoho-Extension-v1.6.zip.
2. In Chrome open chrome://extensions; enable Developer mode, remove the old MAU extension,
   click Load unpacked, and select the extracted MAU-Zoho-Extension folder.
3. Refresh Zoho and the MAU website.

What changed:
- Selected MAU picture profile is the Support Agent in both Ticket Workspace and Managed Services.
  Example: Mauris -> Mauris Mananzan; Jacob -> Jacob Labor.
- Managed Services Open Zoho tickets link: https://helpcenter.amti.com.ph/agent/amtiphilippines/managed-shared-service/tickets/list/all-cases
- Managed Services new ticket URL: https://helpcenter.amti.com.ph/agent/amtiphilippines/managed-shared-service/tickets/new
- An open Managed Services edit tab is chosen automatically; other departments' tabs are ignored.
  When multiple Managed Services edit tabs are open, MAU prefers a matching visible ticket number,
  otherwise the active edit tab. If ambiguous, MAU stops instead of guessing.
  Existing ticket ID and account are checked when available; changing the edit URL stops autofill.
- Phone and Mobile Number default to 0 when missing; both are sent to the autofill payload.
- Managed Services Description starts blank; Issue Description is retained separately.
- Existing ticket identity fields are not overwritten automatically and Zoho Save/Submit is always manual.

Important: Matching the browser tab alone does not verify the customer when Zoho does not expose
its account value. Before clicking Create Ticket, open the correct Managed Services edit ticket,
and always review the autofilled values before manually saving.

Testing: source/UI tests, simulated Chrome-extension message tests and JavaScript syntax checks
passed. Actual Zoho fields and save/submit were NOT tested in a live signed-in Zoho session.
