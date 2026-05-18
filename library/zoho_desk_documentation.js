(function () {
  "use strict";

  window.ZOHO_DESK_DOCUMENTATION_HTML = [
    "<h3>Assistant behavior</h3>",
    "<p>This UI is a strict <strong>Zoho Desk Ticket Auto-Fill Assistant</strong>, not a general chat assistant. When you send ticket details, the assistant should return the Zoho output immediately.</p>",
    "<h3>Accepted input</h3>",
    "<p>Paste incident details, email content, monitoring alerts, customer requests, bridge-call notes, or screenshot OCR text. OCR text from added screenshots is included automatically.</p>",
    "<h3>Standard output contract</h3>",
    "<p>For normal ticket generation, the assistant should return a single <code>```text</code> block only, containing the exact Zoho ticket fields plus the Viber Details/Zoho Comment section.</p>",
    "<h3>Fallback behavior</h3>",
    "<p>If you paste only the system prompt or provide no usable incident details, the assistant should return only this exact line:</p>",
    "<pre>Please paste the ticket details, email content, alert, request, or screenshot text so I can generate the Zoho ticket auto-fill.</pre>",
    "<h3>Bridge-call mode</h3>",
    "<p>If your message explicitly asks for live screenshot or bridge-call help, the assistant should return only the <code>Bridge Call / Screenshot Triage</code> structure instead of the full Zoho ticket block.</p>",
    "<h3>Zoho handoff</h3>",
    "<p>After reviewing the generated output, place or keep it in the workspace and click <strong>Create Ticket</strong>. The Chrome extension reads the parsed content and fills the Zoho Desk new-ticket form.</p>",
    "<h3>Target URL</h3>",
    "<p>The default Zoho page is <code>https://helpcenter.amti.com.ph/agent/amtiphilippines/sandz/tickets/new</code>. You can override it from the browser console with <code>TicketAssistantZohoAutofill.setZohoNewTicketUrl(...)</code>.</p>"
  ].join("");
}());
