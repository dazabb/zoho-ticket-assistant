MAU Ticket Workspace — Serial Number fix v3.2.5

For the main SANDZ Ticket Workspace, Zoho Serial Number remains blank.
Do not put Solutions (MS/SI) into Serial Number.
The Managed Services Ticket Workspace still fills its actual device serial number.
Existing serial values on Edit Tickets are preserved rather than erased.

PATCH INSTALLATION (GitHub Pages):
1. Replace the matching library/*.js files in your MAU repository.
2. Replace chrome-extension/content.js and chrome-extension/manifest.json.
3. Publish the website changes and refresh MAU.
4. In chrome://extensions, reload the updated unpacked MAU extension.
   Alternatively use the separately supplied MAU-Zoho-Extension-v1.6.2.zip.
5. On a SANDZ New Ticket, confirm Serial Number is blank before submitting.

Zoho is never automatically saved or submitted.
