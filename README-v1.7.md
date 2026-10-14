# MAU Operation Desk v1.7 — Chat Only

- The ticket screen uses a single large chat with Zoho Autofill, Client Email and Troubleshooting modes.
- **Create Ticket** uses the latest generated Zoho ticket fields via the existing, hidden legacy editor. No notes panel is shown.
- When a new customer is clearly identified in a new prompt, MAU opens a separate chat session before calling Gemini. Past messages and screenshot extracts are not included in the new request. If multiple customers appear in one prompt and MAU cannot determine the correct one, it asks you to specify the customer rather than guessing.
- Previous chats remain accessible in **Workspace tools > Saved ticket sessions**. **New chat** starts a clean chat manually.
- Each named picture profile can optionally save their own Gemini API key on this device. The Remember checkbox defaults to checked. Profile switching uses the new profile's own key.
- **Security warning:** saved browser keys are stored as plain text in `localStorage` and are accessible to someone using the same browser profile, browser extensions, and developer tools. Do not save keys on shared computers. MAU picture profiles are not authentication. Use dedicated browser profiles or a server-backed solution for strong account isolation.
- Existing Monde Nissin and Viber Follow-up reporting remain in place.
- Verify generated Zoho fields before creating tickets.
