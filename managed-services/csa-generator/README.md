# CSA Generator

Paste one or more Zoho tickets, then generate individual CSA DOCX files or a batch ZIP.

## Field rules

- **Company Name** = the store / branch / work site receiving the onsite visit.
- **Location Address** = the full physical service address. It is never the Company Name, a region such as Mindanao/Visayas, or a generic site label.
- Address priority: explicit current-ticket `Address:` → specific Site/Store/Service Address → valid Zoho location metadata → CSA site knowledge fallback.
- The knowledge base is fallback-only and never overrides a reliable address in the current pasted ticket.
- Created Date/Time uses the current Philippine date.
- Support Agent and Assigned Engineer are always blank unless the workflow is deliberately changed.
- Engineer Task/Activity is taken from the original requested work and excludes tool-packing lists.
- Job Done / Resolution remains blank.

The bundled DOCX template is used automatically. A custom template remains optional under Advanced.

## AI-assisted extraction (v3.1)

The CSA Generator can reuse the same personal Gemini API key configured in MAU Operation Desk / Ticket Workspace.

- Rule-based parsing always runs first.
- When **AI verify extraction** is enabled and a Gemini key is active, Gemini independently reviews the pasted ticket.
- AI corrections are accepted only when the value is supported by text/evidence in the current pasted ticket.
- Created Date remains deterministic (current Philippine date).
- Support Agent and Assigned Engineer remain blank.
- Tool/material packing lists are rejected from Engineer Task / Activity even if AI returns them.
- If Gemini is unavailable, times out, or has no key, the existing rule-based CSA workflow still works.
- Multiple tickets are AI-verified one ticket at a time to reduce cross-ticket field mixing.

This hybrid workflow is designed to catch cases such as a generic Company Name (`PENSHOPPE` instead of `Penshoppe SM Butuan`), a schedule date that lost its time, a repeated store name used as Location Address, and flattened email prose being mistaken for a single Engineer Task.
