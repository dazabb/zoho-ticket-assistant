# MAU Zoho Autofill — Edit Ticket Identity Fix v3.2.2

This patch is based on MAU Operation Desk v3.2.1.

**When editing an existing ticket, the extension will not change:**
- Account Name
- Contact Name
- Email

These fields stay as they are in Zoho even if a pasted request includes different values.
New Ticket behavior is unchanged. The existing ticket number is verified before updating any fields, and MAU never clicks Save or Submit.

## Install on GitHub Pages

1. Copy the patch files (index.html, local-server.js, library/, chrome-extension/, and the v1.6.1 ZIP) into the corresponding paths of your existing MAU repository.
2. Publish the updated website.
3. Open chrome://extensions. Remove the old MAU extension and load the extracted MAU-Zoho-Extension-v1.6.1 folder using Load unpacked (or overwrite the installed extension files and click Reload).
4. Refresh MAU and Zoho Desk.

The only changed runtime logic for editing is in chrome-extension/content.js. Existing Zoho ticket account/contact fields are left untouched. The additional website changes make its Download extension link and minimum-version check point to the corrected Chrome extension.
