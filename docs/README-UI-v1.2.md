# MAU Operation Desk v1.2 — Zoho subject rules

## Subject formatting

- **Never** include a Zoho ticket number, case ID, or `Ticket No. #...` at the end of the ticket **Subject**.
- Ticket numbers still belong in the Viber/Zoho internal comment and in a customer email if that email is explicitly requested and the number is verified.
- Keep the title concise while preserving the affected customer and the actual technical failure.
- For RackWare auto-forwarder subjects with redundant `[RMM]`, `[Wave]`, `[Host]` labels, the app can shorten the title when a single customer, affected host, and replication error are supported by the source. It includes `Stage 1` or `Stage 2` only when the incident explicitly identifies the stage.

Example:

**Before**

`SANDZ-MSDCO-BPI Tokyo Century-[ RMM - rmm-server ] - [ Wave - mkt-prod-sapb1 ] - [ Host - mkt-prod-sapb1 ] - RMM Wave item sync alert - Failed Ticket No. #111743`

**After**

`SANDZ-MSDCO-BPI Tokyo Century-RackWare Stage 1 Sync Failed - mkt-prod-sapb1`

## Updated workflows

The same subject rule is applied in:

1. Gemini prompt instructions for new responses.
2. The generated Zoho Ticket Autofill field display and copied original text.
3. Ticket Workspace when populated from a Gemini response.
4. The **Create Ticket** payload prepared for the Zoho browser extension.
5. Previously saved assistant code-block responses when they are displayed again.

The change does not remove ticket numbers from source alerts, log contents, internal notes, or requested client emails.

## Test summary

The supplied BPITC / RackWare ticket #111743 example was checked against the subject normalization, DRaaS service classification, internal ticket reference preservation, and Zoho payload generation. JavaScript syntax checks passed. Live Gemini calls and actual Zoho submission still require testing in the user's environment.
