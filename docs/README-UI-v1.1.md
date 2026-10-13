# MAU Operation Desk v1.1 — SANDZ classification corrections

This version addresses incorrectly classified RackWare synchronization / replication incidents. It preserves the existing Zoho Ticket Workspace, client-email mode, Gemini personal-key preferences, original profile images, the light/dark theme, and Monde Nissin reporting.

## Correct BPITC ticket example

Given an alert containing `mkt-prod-sapb1`, RackWare RMM, Stage 1 Sync, and `SYNC_ERROR_TIMEOUT`, the generated ticket is checked against SANDZ's internal reference rules:

- Customer Company Name: **BPI Tokyo Century**
- Account Name: **BPI Tokyo Century (BPITC) - Sandz**
- Supported Portfolio: **(DRaaS) Disaster Recovery as a Service**
- Issue Category: **Disaster Recovery - Incident**
- Issue Subcategory: **Performance Issue** (suggested for a timeout; verify Zoho options)
- Technology/Platform: **RackWare**
- Solutions: **MS**
- Known SE contacts: **Jhon Philip Doblado / CJ Tecson** (verify availability and current ownership)
- PM/SD reference: **Lian**
- Ticket Owner: **Sandz Support L1.5**
- Isolated alert: suggest **Sev3 / Medium** only where the visible evidence supports it

The supplied #111743 alert lists an existing open ticket for the workload. Reuse or update an open incident when it covers the same failure; do not automatically create a duplicate.

## How classification is enforced

1. A new SANDZ account/platform rules module helps the AI identify the actual affected host and generates policy instructions.
2. The app validates and corrects supported account/portfolio/issue-category fields before displaying the Zoho result.
3. The Create Ticket helper applies the same checks when constructing the Zoho autofill payload, even when older ticket notes still contain the wrong BaaS label.
4. RackWare is not automatically treated as BaaS because it involves synchronization. Normal Veeam backup incidents remain eligible for BaaS classification.

These rules derive from the account mapping, incident-handling, client-email, and safety requirements supplied by the user. The app does **not** check live contract status, SE availability, ticket ownership, or whether the real Zoho ticket remains open.

## Important review points

- Check the affected workload and exact error against the original monitoring alert.
- Performance Issue is a *suggestion* for a Stage 1 delta-transfer timeout and does not assert its root cause is performance-related.
- Severity, priority, and engineer references must be confirmed using current impact and assignment information.
- Client emails are drafts; the app does not send them.
- Gemini free-tier availability depends on the user's Google API project. Enter a personal API key through MAU's **API key** option.

## Technical notes

New `library/sandz-ticket-rules.js` is loaded ahead of the existing assistant and Zoho autofill modules. Updates were also made to `library/init.js` and `library/zoho-ui-autofill.js`.
