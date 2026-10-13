# MAU Operation Desk v1.0 — Zoho and Email workflow

## What changed

- Zoho ticket autofill now renders in a structured, readable panel with Ticket Details, Zoho Classification, Assignment and Internal Comment sections.
- **Copy Zoho fields** copies the original newline-delimited text for use with the existing Zoho Desk Create Ticket helper.
- **Copy comment** copies only the Viber/Zoho internal troubleshooting comment.
- **Draft client email** switches to the client-email output mode. Enter the recipient and existing ticket number if available, then click Send.
- Use the three output modes above the chat: Zoho autofill, Client email, Troubleshooting.
- Original model prompt and account/SE classification data from earlier releases are preserved and strengthened to avoid invented facts.
- Fixed malformed encoding (e.g. `â€¢`) from earlier template strings, plus repair for older chat results in saved sessions.
- Original picture-based profile selector, per-user Gemini key input, local usage dashboard, light/dark themes, and Monde Nissin reporting remain.

## Usage

1. Extract the archive and run `START-MAU-DESK.bat` on Windows (requires Node.js). Open `http://127.0.0.1:3000`.
2. Select your pictured agent profile. Enter your own Gemini API key via **API key**.
3. Paste monitoring details in Ticket Workspace or the chat input.
4. Select **Zoho autofill** and send the request to generate the structured fields and internal troubleshooting comment.
5. Review classification, customer, severity, host, and ticket details. **Create Ticket** uses the workspace text for the existing browser extension workflow, or click **Copy Zoho fields** to paste manually.
6. Select **Client email** or click **Draft client email** on a ticket. Include a name/title and existing ticket number if you have them. Review the customer-ready draft, click **Copy email**, paste it into Zoho Desk, and send manually. No email is sent by the app.

## Important

- Client email output omits the full engineer signature.
- Do not fabricate details (ticket numbers, steps performed, root causes, engineer assignment). Check the generated text before sending.
- Users' Gemini API keys are stored in browser memory for the tab session only. Browser-direct requests expose the key to extensions/devtools; avoid confidential data unless authorized.
- Local MAU usage is not Google's overall quota.
- A live Gemini end-to-end run needs your API key; this version's renderer, output formatting and template logic were tested without a real Gemini request.
- The client's separate full prompt, if there is one beyond the example email, has not yet been supplied. The build preserves the pre-existing Zoho generator prompt and adds the example's customer-email style.
