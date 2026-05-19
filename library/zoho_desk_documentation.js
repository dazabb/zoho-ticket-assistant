(function () {
  "use strict";

  window.ZOHO_DESK_DOCUMENTATION_HTML = [
    "<h3>Zoho Ticketing Assistant BETA</h3>",
    "<p>This tool helps you organize ticket details, ask the built-in AI for guidance, and prepare Zoho-ready output faster. It is designed for ticket work first, not as a general chat assistant.</p>",
    "<p><strong>Beta note:</strong> This system is still in beta. It can save time, but it will not get everything right every time. Please review the output before using it, and report bugs or odd behavior when you find them.</p>",
    "<h3>Key features</h3>",
    "<ul>" +
      "<li><strong>All-in-one workspace:</strong> Keep ticket details, emails, images, notes, and generated Zoho output in one place.</li>" +
      "<li><strong>Built-in AI help:</strong> Ask questions, review ticket fields, and get suggestions without jumping to another AI tool.</li>" +
      "<li><strong>Image support:</strong> Paste or upload screenshots, then let the system pull useful text from them automatically.</li>" +
      "<li><strong>Zoho-ready ticket output:</strong> Generate cleaner summaries, descriptions, severity, priority, and escalation notes.</li>" +
      "<li><strong>Bridge-call support:</strong> Get safer next-step guidance on what to check, what to capture, and when to escalate.</li>" +
      "<li><strong>Zoho autofill workflow:</strong> Open Zoho Desk and auto-fill most ticket fields to speed up ticket creation.</li>" +
    "</ul>",
    "<h3>Accepted input</h3>",
    "<p>Paste incident details, email content, monitoring alerts, customer requests, bridge-call notes, or images. When you add screenshots, the system can still pull text from them automatically in the background.</p>",
    "<h3>Standard output contract</h3>",
    "<p>For normal ticket generation, the assistant should return a single <code>```text</code> block only, containing the exact Zoho ticket fields plus the Viber Details/Zoho Comment section.</p>",
    "<h3>Fallback behavior</h3>",
    "<p>If you paste only the system prompt or provide no usable incident details, the assistant should return only this exact line:</p>",
    "<pre>Please paste the ticket details, email content, alert, request, images, or bridge-call notes so I can generate the Zoho ticket auto-fill.</pre>",
    "<h3>Bridge-call mode</h3>",
    "<p>If your message explicitly asks for live screenshot or bridge-call help, the assistant should return only the <code>Bridge Call / Screenshot Triage</code> structure instead of the full Zoho ticket block.</p>",
    "<h3>Zoho handoff</h3>",
    "<p>After reviewing the generated output, place or keep it in the workspace and click <strong>Create Ticket</strong>. The Chrome extension reads the parsed content and fills the Zoho Desk new-ticket form.</p>"
  ].join("");
}());
