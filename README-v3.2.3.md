# MAU Managed Services Client Email Cc — v3.2.3

Copy the `managed-services/ticket-workspace/` files in this patch to the same paths in your existing MAU website. No extension reinstall is required.

In **Managed Services Tickets → Client email**:

- **Cc** is prefilled with the 10 provided email addresses for Golden ABC / GABC customer tickets only.
- Edit the list, click **Save Cc**, then **Copy Cc** to paste into Zoho's Cc field.
- **Copy email** copies the email body only, not the Cc recipients.
- Saved recipients belong to the currently selected MAU profile and customer, in that browser; other customers start with an empty Cc list.
- Cc edits never send email automatically and do not require a Gemini request.
- You can clear a saved list by removing the addresses and clicking **Save Cc**.

For the GitHub Pages website, publish the files and hard-refresh the browser. Existing saved data and other workspaces are untouched.
