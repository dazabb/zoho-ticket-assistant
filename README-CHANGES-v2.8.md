# MAU Operation Desk v2.8 — Zoho Extension v1.3 setup fix

- The in-app Download Zoho Extension v1.3 link is now permitted by the bundled local HTTP server. Before this update, the server whitelist permitted only the obsolete v1.1 filename and returned HTTP 404 for the v1.3 ZIP.
- The setup window explicitly labels version v1.3 and describes replacing/reloading older Chrome extensions.
- The connection check now reads the installed extension version and requires v1.3 or newer to enable Create Ticket; old and missing versions show helpful setup text.
- The included extension files remain v1.3.0 and include edit-ticket autofill from v2.7.
- Zoho changes are never submitted automatically; review them before clicking Save or Submit.
