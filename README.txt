MAU Ticket Classification Patch — Database First (for v3.0.8)

Upload / replace these three existing files in your GitHub Pages repository:

  library/init.js
  library/service-line.js
  library/ticket-consistency.js

Then publish the site and use Ctrl+Shift+R to refresh MAU.
No browser extension reinstall is required.

What changed
- Uses the supplied SI/MS Customer Database as the authority for service line.
  A conflicting old Zoho ticket subject (such as MSDCO for RTVM) cannot
  change a single-type SI project to MS.
- RTVM's Unity maintenance project is SI; subject starts SANDZ-SI-RTVM-.
- Existing RTVM Dell Unity 380F problems (hung snapshot, failed LDAP/DNS
  configuration updates, degraded file system) map to Incident / Storage -
  Incident. The firmware assistance remains a separate request within the issue.
- The same RTVM evidence produces the same subject, summary, subcategory,
  Solutions, portfolio and technology selection for different profiles.
- Dell is the supported portfolio choice; Zadara is NOT inferred for Dell Unity.
  Technology/Platform remains unselected because Dell Unity is not in the
  supplied Zoho platform dropdown.
- Restores the provided MONDE NISSIN Zerto MS and PASCUAL LAB BaaS MS rows
  that were missing from the earlier embedded database snapshot.
- An account with both MS and SI projects needs a matching project/product;
  no arbitrary newest-record fallback.
- The fix applies to both chat previews and the final Create Ticket payload.
- Includes the previous Client Email accuracy improvements in init.js.

Automated validation
- RTVM Mauris/JV variants return the same validated fields.
- RTVM SI wins over MSDCO even when current Zoho title is MSDCO.
- Firmware-only request remains a Request, despite RTVM's SI classification.
- EWB / Monde keep MSDCO/MS; mixed DOE remains unconfirmed without a project.
- Browser scripts loaded with no JavaScript page errors; actual live Zoho
  dropdown interaction still requires checking on your site.

Nothing in this patch sends mail or submits a ticket automatically.
