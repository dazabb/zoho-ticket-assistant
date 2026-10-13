# MAU Operation Desk v0.8

An internal ticket-assistant and Monde Nissin daily Zerto CSV reporting tool. Light appearance is default; dark mode is optional.

## Getting started

1. Download and extract this app. Keep `index.html`, `library/`, `images/`, and `reporting/` together.
2. On Windows, run `START-MAU-DESK.bat` (requires Node.js 20+). The optional server serves static files at `http://127.0.0.1:3000`. No `.env`, login password, or MAU backend Gemini connection is needed.
3. Choose your picture-based profile. Each profile retains its own ticket notes, chat history and appearance setting in that browser.
4. Choose **API key** in the top toolbar, paste a personal Google AI Studio Gemini API key, and press **Use this key**. The key is held only in the active page's memory. It is cleared when you switch profiles, reload or close the page.
5. Use the centered assistant to draft ticket information, or open **Reporting → Monde Nissin** and import the two CSV exports to generate the email report for copying into Zoho Desk. Report content excludes the signature.

## Usage

The API key dialog displays successful and failed Gemini requests and token usage in this browser for the selected profile today, plus the countdown to the next Pacific midnight. Data is local to this browser and is not an authoritative Google quota or remaining balance; see the AI Studio usage dashboard. Gemini daily request limits are per Google Cloud project, regardless of number of keys; minute-based limits may also apply.

## Privacy and security

The Gemini API key is sent from the browser **directly to Google**, never stored on a MAU backend or in localStorage. It is visible to this browser's developer tools and potentially extensions. This is suitable for a personal, trusted-browser workflow, not a protected team secret. Named profiles are not a substitute for login security.

Use your own Google AI Studio project without billing if you want to avoid paid API charges. Google may use free-tier content to improve products; get approval before submitting confidential support records. Never commit API keys or Zerto/customer exports to GitHub. If internet-facing hosting is desired, restrict access separately because the static version does not provide secure user authentication.

See `README-UI-v0.8.md` for implementation notes and `README-MONDE-REPORTING.md` for the CSV workflow.
