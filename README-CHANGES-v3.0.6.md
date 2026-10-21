# MAU Operation Desk v3.0.6 — CSA work site and optional brand

- **Company Name** now uses the customer work site / store / branch / outlet if supplied. For ticket #110524 that is **OXYGEN KCC MARBEL**, not the parent Zoho account Golden ABC, Incorporated or customer code GABC_OXYGEN.
- When explicit labels are missing, the parser can use the original service request phrase (e.g., *Please do the following for...*) and the ticket title immediately before Reply All. If no site can be identified, existing customer information is used as a fallback for employee review.
- **Brand** is blank unless explicitly provided in ticket data such as Brand, Retail Brand, Make, or Manufacturer; never derive it from a store name or GABC account code.
- Location Address no longer repeats the site when Company Name already shows it.
- The editable Company Name field is labelled **Company Name (Store / Site)** so employees do not have to enter the site twice.
- Existing engineer activities, CSA filename `#<ticket>.docx`, and Job Done / Resolution behavior are unchanged.
