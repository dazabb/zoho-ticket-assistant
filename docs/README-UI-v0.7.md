# MAU Operation Desk — UI v0.7

## What's changed

- Light appearance is the default for this release, even if v0.6 previously saved a dark-mode choice.
- Toggle **Dark mode / Light mode** using the button in the upper-right toolbar. Each browser profile keeps its own choice.
- Ticket Workspace now appears **above** the centered assistant conversation panel.
- Use **Hide notes** / **Show notes** to free space for chatting.
- The screenshots drop zone is now inside **Attach screenshots (Optional)** and remains available whenever needed.
- Main sidebar stays visible on desktop and becomes compact on narrow screens.
- Reporting → Monde Nissin keeps the existing two-CSV reporting workflow and uses the current theme.
- The "Ticket workspace" sidebar action creates a new ticket session using the preexisting session control.

## Run

Unzip the archive, keep the files together, and start the app using the included `START-MAU-DESK.bat` on Windows, then open the local server address shown. A Node.js installation is needed. See `START-HERE.txt` and `README-MAU-OPERATION-DESK.md`.

This release focuses on layout and usability. The existing Gemini backend/configuration is unchanged; it has **not** been updated for separate API keys per teammate. The reporting module remains a local CSV-import workflow, not a live Zerto connection.

## Important

Do not upload a real `.env` file, Gemini key, customer exports, or customer ticket data to public hosting or GitHub. Keep the package's `.gitignore` active.
