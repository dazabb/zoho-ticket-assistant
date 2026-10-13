## v0.9: Get Gemini API Key link

The **Gemini API key & usage** dialog now has a **Get Gemini API key ↗** link next to the key field. It opens [Google AI Studio API Keys](https://aistudio.google.com/apikey) in a separate browser tab. Each user can create or copy their own key, return to MAU, paste it into the masked field, and select **Use this key**.

The link does **not** read or retrieve a key automatically, does not connect Google accounts to MAU, and does not change how keys are handled or how usage is tracked.

# MAU Operation Desk — v0.8

- Original character-photo profile selector is restored and appears each time you open the application. Named profiles keep their own ticket notes, chat history, theme and local usage counters on the device.
- Each user enters their own Gemini API key using the **API key** button. The password field is masked. **Use this key** saves it to JavaScript memory for the current page session only. It is cleared on switching profiles, refresh, or tab close; it is never written to localStorage or included in exported files. It can still be visible to browser developer tools and extensions, as with any direct browser API request.
- Gemini `gemini-3.5-flash-lite` is called directly through Google's generateContent API. No MAU AI proxy, shared key, or backend `.env` is required.
- **Usage** shows this browser/profile's successful calls, failed calls, reported token usage and a countdown to midnight in the `America/Los_Angeles` time zone, including daylight saving. This does not measure the user's total Google Cloud project usage or display their remaining real quota.
- The Google AI Studio usage link shows project-level consumption; Google's limits are per project, not per key.
- A static HTTP server (`local-server.js`) is provided for local convenience, only binding to `127.0.0.1`. It does not process or see Gemini requests, user keys, or customer ticket contents. Static hosting such as GitHub Pages can host these frontend files but does not provide authentication or protect private ticket content.
- Monde Nissin Reporting keeps the CSV import and email generation functions (no signature); light appearance remains default with dark preference toggle.

## Security and cost

API keys in a browser are not secrets against someone with access to that browser. Use your own Google Cloud project and restricted key, preferably with billing disabled if you want to remain in the free tier. Never commit a key to GitHub or paste it into a shared document. Free-tier Gemini requests may be used by Google to improve its products; don't send confidential customer data without permission. The built-in named profiles are convenience selectors, **not authentication**. 

## Development smoke test

- `node --check library/init.js`
- `node --check library/user-gemini.js`
- `node local-server.js`, then visit `http://127.0.0.1:3000`
- Without a Google API key, the app can test saving/removing keys and opening the dialog, but live completion and authoritative quota must be tested with the user's own key.
