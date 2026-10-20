# MAU Operation Desk v2.3 — Monde RPO, Email Recipients, MS/SI Prefixes

## Monde Nissin Report

1. Open **Monde Report** and upload the VPG Export and Monitoring Alert CSVs.
2. RPO values of 60 seconds or longer now display in minutes/hours. Examples:
   - 72 seconds → **1 minute and 12 seconds**
   - 3,600 seconds → **1 hour**
   - 3,771 seconds → **1 hour, 2 minutes and 51 seconds**
   - 7–72 seconds → **7 seconds to 1 minute and 12 seconds**
3. Edit **To** and **Cc** in the recipients section. Click **Save recipients** to store separate recipient lists for the currently selected *named profile* in this browser. Click **Copy To** and **Copy Cc** to paste recipients into Zoho Desk. Recipient addresses are not inserted into the report body.
4. Click **Generate report** and use **Copy subject** and **Copy email + table**.

The sample To/Cc values come from the provided October 19 Monde ticket. Verify them before sending. Do not use a guest profile to save recipients. Browser storage is local to the browser and site origin; use the same `START-MAU-DESK.bat` URL each day for the saved lists to remain available.

## MS versus SI — subject safety

The generated AI output and final Zoho Create Ticket payload now both check the service line:

- **Solutions = MS** → `SANDZ-MSDCO-[Customer]-[Issue]`
- **Solutions = SI** → `SANDZ-SI-[Customer]-[Issue]`

The current ticket's explicitly specified `Solutions` field is preferred, followed by a specific matching project/product from the SANDZ account database, followed by consistent 2026 historical ticket evidence. Mixed-service accounts without a clear project match receive a warning rather than being silently classified using the *newest SI row*. Historical prefixes are evidence, not proof of the account's current service contract.

Examples from the supplied historical export:

- **MS examples:** Monde Nissin, EWB, BCDA, Radius, BPITC, NatRe.
- **SI examples:** JG Summit and Okada Manila.
- **Mixed:** DOE and First Sumiden, depending on the supported project/service.

These checks change **Solutions** and the matching **subject prefix**, not the ticket category; `Request` vs `Incident` remains independent of MS/SI. This also does not automatically guess the BaaS/DRaaS portfolio from the MS/SI prefix.

## Verification

- Script syntax and HTML structure validated.
- Verified RPO duration conversions and report ranges.
- Verified MS/SI decisions, subject prefixes, and Zoho payload correction for eight customer examples, mixed-service cases, and explicit MS override.
- Live Zoho clipboard behavior, full browser UI, and Gemini responses need confirmation in the deployed app.
