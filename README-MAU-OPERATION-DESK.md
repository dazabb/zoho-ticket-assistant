# MAU Operation Desk v0.8

An internal ticket-assistant, reporting workspace, and Managed Services utility desk. Light appearance is default; dark mode is optional.

## Getting started

1. Download and extract this app. Keep `index.html`, `library/`, `images/`, and `reporting/` together.
2. On Windows, run `START-MAU-DESK.bat` (requires Node.js 20+). The optional server serves static files at `http://127.0.0.1:3000`. No `.env`, login password, or MAU backend Gemini connection is needed.
3. Choose your picture-based profile. Each profile retains its own ticket notes, chat history and appearance setting in that browser.
4. Choose **API key** in the toolbar, paste your personal Google AI Studio Gemini key, press **Save key**. That named MAU profile will reload the saved key automatically on this same device. Other profiles have their own keys.
5. The ticket page is chat-only. New customers detected in the next request start separate chat sessions automatically. Use **New chat** at any time, open **Reporting → Monde Nissin** for Zerto CSV reporting, or open **Manage Services → CSA Generator** to create one or many CSA DOCX files directly in the browser.

## Usage

The API key dialog displays successful and failed Gemini requests and token usage in this browser for the selected profile today, plus the countdown to the next Pacific midnight. Data is local to this browser and is not an authoritative Google quota or remaining balance; see the AI Studio usage dashboard. Gemini daily request limits are per Google Cloud project, regardless of number of keys; minute-based limits may also apply.

## Privacy and security

Gemini requests are made directly from the browser to Google; no shared MAU backend key is used. For a named MAU profile, clicking **Save key** stores that key in the browser's localStorage (unencrypted) until you select **Remove key**; anyone who opens that same browser profile can inspect or use it, including someone who selects that MAU picture. **Never save on a shared computer.** Browser extensions and developer tools can access the key. The MAU profile chooser is NOT authentication. Use separate OS/browser accounts for isolation, or a properly authenticated server-backed application when handling confidential work.

Use your own Google AI Studio project without billing if you want to avoid paid API charges. Google may use free-tier content to improve products; get approval before submitting confidential support records. Never commit API keys or Zerto/customer exports to GitHub. If internet-facing hosting is desired, restrict access separately because the static version does not provide secure user authentication.

See `README-UI-v0.8.md` for implementation notes and `README-MONDE-REPORTING.md` for the CSV workflow.


## Zoho Create Ticket extension - v2.4

The **Install extension** button is next to **Create Ticket**. Download the extension ZIP and follow the in-app Chrome instructions (or see `README-ZOHO-EXTENSION-v2.4.md`). **Check connection** before Create Ticket. The app never submits the Zoho form automatically.


## Managed Services — CSA Generator

Open **Manage Services → CSA Generator** from the sidebar. Paste one Zoho ticket and choose **Extract one ticket**, or paste several tickets and choose **Extract all to batch**. Review any extracted values before generation. Individual files download as the numeric ticket number (for example `110524.docx`); multiple queued tickets can be downloaded together as `CSA_Batch.zip`. The browser keeps Support Agent and Assigned Engineer blank and processes the ticket text and DOCX template locally.
