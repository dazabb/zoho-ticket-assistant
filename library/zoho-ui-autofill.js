(function () {
  "use strict";

  const DEFAULT_ZOHO_NEW_TICKET_URL = "https://helpcenter.amti.com.ph/agent/amtiphilippines/sandz/tickets/new";
  const STORAGE_KEY_URL = "ztaZohoNewTicketUrl";
  const HASH_KEY = "zta";

  const LABEL_PATTERNS = [
    ["customerCompanyName", /^\s*Customer\s+Company\s+Name\s*:\s*(.*)$/i],
    ["accountName", /^\s*Account\s+Name\s*:\s*(.*)$/i],
    ["contactName", /^\s*Contact\s+Name\s*:\s*(.*)$/i],
    ["email", /^\s*(?:Email|E-mail)\s*:\s*(.*)$/i],
    ["phone", /^\s*Phone\s*:\s*(.*)$/i],
    ["mobileNumber", /^\s*(?:Mobile\s+Number|Mobile)\s*:\s*(.*)$/i],
    ["subject", /^\s*Subject\s*:\s*(.*)$/i],
    ["description", /^\s*Description\s*:\s*(.*)$/i],
    ["status", /^\s*Status\s*:\s*(.*)$/i],
    ["ticketOwner", /^\s*Ticket\s+Owner\s*:\s*(.*)$/i],
    ["supportedPortfolio", /^\s*Supported\s+Portfolio\s*:\s*(.*)$/i],
    ["solutions", /^\s*Solutions\s*:\s*(.*)$/i],
    ["ticketCategory", /^\s*Ticket\s+Category\s*:\s*(.*)$/i],
    ["issueCategory", /^\s*Issue\s+Category\s*:\s*(.*)$/i],
    ["issueSubCategory", /^\s*Issue\s+Sub-Category\s*:\s*(.*)$/i],
    ["issueSubCategory", /^\s*Issue\s+Subcategory\s*:\s*(.*)$/i],
    ["technologyPlatform", /^\s*Technology\s*\/\s*Platform\s*:\s*(.*)$/i],
    ["severityLevel", /^\s*(?:Severity\s+Level|Severity)\s*:\s*(.*)$/i],
    ["supportLevel", /^\s*Support\s+Level\s*:\s*(.*)$/i],
    ["supportAgent", /^\s*Support\s+Agent\s*:\s*(.*)$/i],
    ["priority", /^\s*Priority\s*:\s*(.*)$/i],
    ["channel", /^\s*Channel\s*:\s*(.*)$/i],
    ["ticketSource", /^\s*Ticket\s+Source\s*:\s*(.*)$/i],
    ["seHandles", /^\s*SE(?:'|’)?s\s+that\s+can\s+handle\s+this\s+ticket\s*:\s*(.*)$/i],
    ["pmSd", /^\s*PM\s*\/\s*SD\s+of\s+this\s+account\s*:\s*(.*)$/i],
    ["viberComment", /^\s*Viber\s+Details\s*\/\s*Zoho\s+Comment\s+on\s+Ticket\s+for\s+initial\s+troubleshooting\s*:\s*(.*)$/i],
    ["issueDescription", /^\s*Issue\s+Description\s*:\s*(.*)$/i],
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function getWorkspaceText() {
    if (window.editor && typeof window.editor.getValue === "function") {
      return window.editor.getValue();
    }
    const textarea = $("chat-input");
    return textarea ? textarea.value : "";
  }

  function isLabelLine(line) {
    return LABEL_PATTERNS.some(([, regex]) => regex.test(line));
  }

  function appendValue(fields, key, value) {
    if (!key) return;
    const clean = String(value || "").trimEnd();
    if (!fields[key]) fields[key] = clean;
    else if (clean) fields[key] += "\n" + clean;
  }

  function parseWorkspace(text) {
    const fields = {};
    let currentKey = "";
    const lines = String(text || "").replace(/\u00a0/g, " ").split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.replace(/\s+$/g, "");
      let matched = false;

      for (const [key, regex] of LABEL_PATTERNS) {
        const match = line.match(regex);
        if (match) {
          currentKey = key;
          appendValue(fields, key, match[1] || "");
          matched = true;
          break;
        }
      }

      if (!matched && currentKey) {
        if (line.trim() === "" && currentKey !== "description" && currentKey !== "viberComment" && currentKey !== "issueDescription") {
          continue;
        }
        appendValue(fields, currentKey, line);
      }
    }

    return fields;
  }

  function firstNonEmpty() {
    for (const item of arguments) {
      if (String(item || "").trim()) return String(item).trim();
    }
    return "";
  }

  function formatIssueCategory(issueCategory, ticketCategory) {
    const issue = String(issueCategory || "").trim();
    const ticket = String(ticketCategory || "").trim();
    if (!issue) return "";
    if (!ticket) return issue;
    if (issue.toLowerCase().includes(ticket.toLowerCase())) return issue;
    return `${issue} - ${ticket}`;
  }

  function normalizeIssueSubCategory(fields, description, ticketCategory) {
    const rawIssueCategory = firstNonEmpty(fields.issueCategory, "");
    const rawIssueSubCategory = firstNonEmpty(fields.issueSubCategory, "");
    const context = [
      rawIssueCategory,
      rawIssueSubCategory,
      fields.subject,
      description
    ].join(" ").toLowerCase();

    if (
      String(ticketCategory || "").trim().toLowerCase() === "incident"
      && (
        context.includes("backup")
        || context.includes("repository")
        || context.includes("capacity tier")
        || context.includes("offload")
        || context.includes("s3 compatible")
      )
      && (
        context.includes("offload")
        || context.includes("capacity tier")
        || context.includes("capacity-tier")
        || context.includes("capacity issue")
        || context.includes("repository")
        || context.includes("nearly full")
      )
    ) {
      return "Capacity Issue";
    }

    return firstNonEmpty(rawIssueSubCategory, ticketCategory.toLowerCase() === "incident" ? "Performance Issue" : "");
  }

  function isStorageCapacityBackupIncident(fields, description, ticketCategory, issueSubCategory) {
    const context = [
      fields.issueCategory,
      fields.issueSubCategory,
      fields.subject,
      description
    ].join(" ").toLowerCase();

    return String(ticketCategory || "").trim().toLowerCase() === "incident"
      && issueSubCategory === "Capacity Issue"
      && (
        context.includes("backup")
        || context.includes("repository")
        || context.includes("capacity tier")
        || context.includes("offload")
        || context.includes("s3 compatible")
      );
  }

  function normalizePriority(severityLevel, priority) {
    const severity = String(severityLevel || "").trim().toLowerCase();
    const currentPriority = String(priority || "").trim();
    if (severity === "sev1") return "High";
    if (severity === "sev2") return "Medium";
    if (severity === "sev3") return currentPriority || "Medium";
    if (severity === "sev4") return currentPriority || "Low";
    return currentPriority;
  }

  function inferSubject(text, fields) {
    if (fields.subject) return fields.subject;
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !/^[-*•]/.test(line))
      .filter((line) => !/^Ticket Workspace$/i.test(line));
    return (lines.find((line) => line.length > 8) || "New ticket from Ticket Assistant").slice(0, 180);
  }

  function buildZohoPayload(workspaceText) {
    const fields = parseWorkspace(workspaceText);
    const ticketCategory = firstNonEmpty(fields.ticketCategory, "Incident");
    const description = firstNonEmpty(fields.description, fields.issueDescription);
    const issueSubCategory = normalizeIssueSubCategory(fields, description, ticketCategory);
    const storageCapacityBackupIncident = isStorageCapacityBackupIncident(fields, description, ticketCategory, issueSubCategory);
    const supportedPortfolio = firstNonEmpty(
      fields.supportedPortfolio,
      storageCapacityBackupIncident ? "(BaaS) Backup as a Service" : ""
    );
    const normalizedIssueCategory = firstNonEmpty(
      storageCapacityBackupIncident ? "Storage" : "",
      fields.issueCategory,
      issueSubCategory === "Capacity Issue" ? "Storage" : ""
    );
    const severityLevel = fields.severityLevel || "";
    const priority = normalizePriority(severityLevel, fields.priority || "");

    return {
      version: 1,
      source: "Ticket Assistant",
      createdAt: new Date().toISOString(),
      rawWorkspace: workspaceText,
      fields: {
        "Customer Company Name": fields.customerCompanyName || "",
        "Subject": inferSubject(workspaceText, fields),
        "Description": description,
        "Status": firstNonEmpty(fields.status, "Open"),
        "Ticket Owner": fields.ticketOwner || "",
        "Supported Portfolio": supportedPortfolio,
        "Solutions": fields.solutions || "",
        "Ticket Category": ticketCategory,
        "Issue Category": formatIssueCategory(normalizedIssueCategory, ticketCategory),
        "Issue Sub-Category": issueSubCategory,
        "Severity Level": severityLevel,
        "Support Level": firstNonEmpty(fields.supportLevel, "Level 1.5"),
        "Support Agent": fields.supportAgent || "",
        "Priority": priority,
        "Channel": fields.channel || "",
        "Ticket Source": fields.ticketSource || "",
        "Issue Description": description,
      }
    };
  }

  function base64UrlEncodeUnicode(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function copyFallbackPayload(payload) {
    const text = JSON.stringify(payload, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
    }
  }

  function appendStatus(message) {
    if (typeof window.addMessage === "function") {
      window.addMessage(message, "ai");
      return;
    }
    const snackbar = $("snackbar");
    if (snackbar) {
      snackbar.textContent = message;
      snackbar.classList.add("show");
      setTimeout(() => snackbar.classList.remove("show"), 4500);
    } else {
      alert(message);
    }
  }

  function openZohoTicket() {
    const workspaceText = getWorkspaceText();
    if (!workspaceText || !workspaceText.trim()) {
      appendStatus("Workspace is empty. Add the ticket details first, then click Create Ticket.");
      return;
    }

    const payload = buildZohoPayload(workspaceText);
    copyFallbackPayload(payload);

    const encoded = base64UrlEncodeUnicode(JSON.stringify(payload));
    const targetUrl = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_ZOHO_NEW_TICKET_URL;
    const separator = targetUrl.includes("#") ? "&" : "#";
    const url = `${targetUrl}${separator}${HASH_KEY}=${encoded}`;

    window.open(url, "_blank", "noopener");
    appendStatus("Opening Zoho ticket page and sending the auto-fill data. Keep the Chrome extension enabled, then review before submitting.");
  }

  function installButton() {
    const btn = $("createZohoTicketBtn");
    if (!btn) return;
    btn.textContent = "Create Ticket";
    btn.title = "Open Zoho Desk and auto-fill the new ticket form from the workspace";
    btn.addEventListener("click", openZohoTicket);
  }

  window.TicketAssistantZohoAutofill = {
    parseWorkspace,
    buildZohoPayload,
    openZohoTicket,
    setZohoNewTicketUrl(url) {
      localStorage.setItem(STORAGE_KEY_URL, url || DEFAULT_ZOHO_NEW_TICKET_URL);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installButton);
  } else {
    installButton();
  }
}());
