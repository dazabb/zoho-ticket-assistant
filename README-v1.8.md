# MAU Operation Desk v1.8 — Customer-safe chat and saved personal Gemini keys

## What changed

1. **One-time key entry per profile.** Select a named picture profile, open **API key**, paste your own Gemini key, and click **Save key**. The key is automatically loaded when you return to that profile on the same browser and site address. Use **Remove key** to forget that profile's saved key. Guest keys are session-only.
2. **Correct customer detection.** The current ticket's Account Name/Customer Company Name fields and a clearly selected company take precedence over unrelated names in Zoho's sidebar, other ticket listings, and conversation history.
3. **Separate customer chats.** When the current ticket changes from one known customer to another, MAU creates a fresh customer-specific chat. Old conversations are retained under Saved ticket sessions, but not included in new ticket generations. Screenshots confirmed as belonging to the new customer are retained when switching.
4. **Safer Zoho output.** For recognized customer tickets, the generated Customer Company Name, Zoho Account Name, subject customer label and platform are checked against the current source before rendering/copying; the Create Ticket payload is also checked. Unconfirmed SE/PM assignments are marked for verification rather than carried over from an unrelated customer.
5. **No historical chat in new ticket generation.** Standard Zoho autofill and email generation use the current request/attachments rather than re-sending previous model answers. Chat Q&A can still use same-session history.

## Corrected example: Monde Nissin ticket #111843

- Customer Company Name: Monde Nissin
- Account Name: Monde Nissin - Sandz
- Subject: SANDZ-MSDCO-Monde Nissin-Zerto Multiple VPGs RPO Not Meeting SLA and Journal Limit Exceeded
- Technology/Platform: Zerto
- Supported Portfolio: (DRaaS) Disaster Recovery as a Service
- Issue Category: Disaster Recovery - Incident

## IMPORTANT: browser storage and upgrades

To have a saved key survive later app ZIP upgrades, **start the app using START-MAU-DESK.bat** and keep using `http://127.0.0.1:3000` in the **same browser profile**. Opening `index.html` directly from changing Downloads folders can create different storage locations, so your earlier saved key may not follow it. Browser data deletion or private browsing also removes/stops saved keys. MAU picture profiles are not passwords, and keys are stored unencrypted in local browser storage. Do not enable saved keys on shared computers. A server with authenticated users is necessary for strong multi-user key security.

## Verification

Syntax and deterministic tests passed for the provided Monde/EWB ticket-list contamination case, subject/technology correction, Create Ticket payload, conflicting account fields, and per-profile API key save/restore/remove. No live Gemini request or live Zoho submission was performed, and browser UI rendering was not available in this environment. Always review the generated record before sending.
