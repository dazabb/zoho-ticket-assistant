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
