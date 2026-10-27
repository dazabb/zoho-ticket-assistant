# MAU Operation Desk v3.0.7 — CSA address intelligence

- **Company Name and Location Address are now strictly separate.** Company Name identifies the store/site; Location Address must be the physical service address.
- Explicit `Address:` lines in the current service request now outrank Zoho `Customer Location Address`. This fixes cases where Zoho stores a region or the store name in the location field.
- A location value matching the Company/Store name is rejected as a physical address instead of being copied into Location Address.
- Added a CSA site knowledge base for known GABC locations. It is used only when the pasted ticket has no reliable physical address and never overwrites a valid current-ticket address.
- Added extraction QA messaging when an address comes from the knowledge base.
- Fixed engineer-task extraction when the first requested task is also the Issue Description (for example, `Set up 1 set of POS` followed by `Cable Management`). Both tasks are retained.
- Preserves Unicode/special characters in addresses such as the en dash in `2039 – 2040`.
- Support Agent and Assigned Engineer remain blank in generated CSAs.
