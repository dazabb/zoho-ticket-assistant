# MAU Operation Desk v1.3 — Historical customer/subject mapping

## Basis and confidence

- Source: Zoho export **Jan 1 - Oct 13 2026.csv**, 2,193 dated tickets.
- The original export has **45 distinct Customer Company Name values**, including spelling/case variants and `-` (unassigned).
- We consolidated clearly equivalent values into **39 reference groups**; **10 tickets have no company**.
- The export contains **Customer Company Name** and **Subject**. It does **not** contain the exact Zoho **Account Name** field.
- Six exact Zoho Account Names are verified from previously provided SANDZ guidance or original ticket screenshots: East West Bank, Radius, Monde Nissin, BPITC, NatRe, and GMA. BCDA is not verified. These are identified individually in `ACCOUNT-MAPPING-REFERENCE.csv`; all others require confirmation.

## How to review account mappings in the app

Open **Workspace tools → Account reference**. Search historical customers or aliases to see the recommended subject prefix and exact Account Name when separately verified. Use **Copy subject prefix** to copy `SANDZ-MSDCO-[Subject label]-` for a typical managed-support ticket; the proper prefix for a delivery/project ticket may instead be `SANDZ-SI-`.

## Autofill safeguards

- Prefer explicit customer fields and high-confidence workload evidence. Use historical subject labels as naming references, not proof of customer identity or portfolio.
- For RackWare Stage 1/Stage 2 sync incidents, preserve the v1.2 DRaaS classification, not BaaS.
- Do not append ticket IDs to newly generated subjects; use actual ticket IDs in internal handling information.
- BPI and BPI Tokyo Century are **different**. HONDA and Honda Parts Manufacturing are **not automatically merged**. Out of Scope - BPI remains a distinct review case.
- If the company name conflicts with the recognized subject or affected workload, MAU marks the case for manual verification. The Create Ticket payload clears the conflicting customer/account fields instead of silently choosing one.
- For accounts not separately verified, **Account Name must be checked in Zoho Desk**; don't assume `Company - Sandz`.
- An account's historical ticket subjects are not a guarantee of which service portfolio applies. Choose category/portfolio based on the actual technology and service.

## Files

- `ACCOUNT-MAPPING-REFERENCE.csv`: 39 groups, historical ticket counts, preferred subject labels, recorded aliases, and account verification status.
- `ACCOUNT-MAPPING-REVIEW.csv`: four historical account/subject discrepancies that should be reviewed instead of silently remapped. Two are distinct-scope cases (Out of Scope - BPI and Honda Parts), while #96639 and #111551 are genuine customer-versus-subject conflicts requiring investigation.

## Regression tests

Static Node.js tests verify account normalization, known workload mappings, RackWare classification, subject formatting without ticket numbers, and uncertainty handling. A live Gemini or Zoho form-fill test is still required on the actual MAU workstation.

## Preferred new subject examples

- `SANDZ-MSDCO-Monde Nissin-MS-VM Status 10/13/2026` — keep the established daily monitoring subject format.
- `SANDZ-MSDCO-EWB-Daily Report 10-13-2026` — retain the EWB abbreviation.
- `SANDZ-MSDCO-BCDA-Daily Backup Monitoring (October 13, 2026)` — reporting title based on observed history.
- `SANDZ-MSDCO-NatRe-SFTP Backup Failed` — clear failure plus platform/job identification.
- `SANDZ-MSDCO-BPI Tokyo Century-RackWare Stage 1 Sync Failed - mkt-prod-sapb1` — DRaaS, and Stage 1 only if confirmed in the source.
- `SANDZ-SI-AMDOCS-Activity | Power Drain Activity (...)` — keep SI for confirmed project work.

No generated subject should append `Ticket No. #111743` or another ticket ID. Exact incident numbers belong in the internal comment and explicitly requested customer emails.
