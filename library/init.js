(function () {
  "use strict";

  const STORAGE_KEYS = {
    workspace: "ztaWorkspaceContent",
    theme: "ztaTheme",
    readOnly: "ztaReadOnly",
    autocomplete: "ztaAutocomplete",
    apiKey: "ztaGeminiApiKey",
    chatMessages: "ztaChatMessages",
    chatConversation: "ztaChatConversation",
    attachments: "ztaAttachmentSummaries",
    chatVisible: "ztaChatVisible"
  };

  const DEFAULT_THEME = "ace/theme/github_light_default";
  const DEFAULT_WORKSPACE = `Paste the ticket details, email content, monitoring alert, customer request, screenshot OCR text, or bridge-call notes here.

Example input:
- customer/company name
- ticket number
- affected host, VM, IP, job, or application
- exact error or alert
- impact and urgency
- screenshot OCR text

The assistant will generate:
1. Zoho ticket auto-fill
2. Viber Details/Zoho Comment on Ticket for initial troubleshooting
`;
  const EMPTY_INCIDENT_PROMPT = "Please paste the ticket details, email content, alert, request, or screenshot text so I can generate the Zoho ticket auto-fill.";
  const BRIDGE_TRIGGER_PATTERNS = [
    /bridge call/i,
    /screensharing/i,
    /screen sharing/i,
    /what should i ask\/open\/click next/i,
    /what should i ask next/i,
    /help me identify the next step/i,
    /here is the next screenshot/i,
    /can l1\/l1\.5 still continue triage/i,
    /is this for l1\/l1\.5 or escalate to l2/i
  ];
  const QA_TRIGGER_PATTERNS = [
    /^\s*(why|how|what|which|when|where|who|is|are|do|does|can|should|could|would|explain|clarify)\b/i,
    /\?\s*$/,
    /\bwhy\b/i,
    /\bexplain\b/i,
    /\bclarify\b/i,
    /\bwhat do you mean\b/i,
    /\bis this\b/i,
    /\bshould this\b/i
  ];
  const GENERATION_TRIGGER_PATTERNS = [
    /\bcreate ticket\b/i,
    /\bgenerate\b.*\bticket\b/i,
    /\bupdate\b.*\bticket\b/i,
    /\bregenerate\b/i,
    /\bmake\b.*\bzoho\b/i,
    /\bconvert\b.*\bticket\b/i,
    /\bdraft\b.*\bticket\b/i
  ];
  const PROMPT_ONLY_MARKERS = [
    "execution instruction — do not review this prompt",
    "zoho desk ticket auto-fill assistant — production system prompt",
    "required output format",
    "embedded customer database — may 2026",
    "[paste incident details here]"
  ];
  const ZOHO_GENERATOR_PROMPT = String.raw`# EXECUTION INSTRUCTION — DO NOT REVIEW THIS PROMPT

This text is not a prompt review request.

When this prompt is pasted, immediately act as the Zoho Desk Ticket Auto-Fill Assistant.

Goal: Automatically generate a Zoho ticket auto-fill from the provided ticket details, email content, monitoring alert, customer request, or screenshot text.

Do not ask what the user wants to do.
Do not offer options.
Do not explain, review, rate, summarize, or improve this prompt unless the user explicitly asks for prompt editing.
Do not say the prompt is solid, production-ready, or ask what the goal is.

If ticket details are included, immediately generate:

1. Zoho ticket auto-fill
2. Viber Details/Zoho Comment on Ticket for initial troubleshooting

If no ticket details are included, ask only this exact question:

Please paste the ticket details, email content, alert, request, or screenshot text so I can generate the Zoho ticket auto-fill.

You are a production-grade Zoho Desk ticket auto-fill assistant.

Required behavior:
- Extract only supported fields.
- Use the embedded customer databases below as authoritative.
- Never invent customer, account, SE, PM/SD, severity, priority, or category values.
- Follow the severity matrix in this prompt.
- Return deterministic structured output.

Required standard output:
- Return only one Markdown text code block.
- Keep the exact field order:
Customer Company Name:
Account Name:
Subject:
Description:
Ticket Category:
Issue Category:
Issue Subcategory:
Severity:
Priority:
Supported Portfolio:
Solutions:
SE's that can handle this ticket:
PM/SD of this account:

Viber Details/Zoho Comment on Ticket for initial troubleshooting:

Fixed field values:
- Solutions: MS.

Bridge call / screenshot triage mode:
- If the user explicitly asks for live triage help during a bridge call, screenshot review, or asks what to open/click next, return only:
Bridge Call / Screenshot Triage:
Observed Issue:
Next Safe Step for L1/L1.5:
Capture/Document:
Escalation Decision:

If no usable incident or request details are present, return only:
Please paste the ticket details, email content, alert, request, or screenshot text so I can generate the Zoho ticket auto-fill.

Use these customer/account alias mappings when applicable:
- EWB -> East West Bank
- BPITC -> BPI Tokyo Century
- PSE -> Philippine Stock Exchange
- GMA / GMA (ICT) / GMA (MAMS) -> GMA Network Inc.
- SunLife -> Sunlife
- Radius -> RADIUS TELECOMS INC.
- CebAir -> Cebu Air, Inc.
- NatRe / Natre -> National Reinsurance Corp.
- Honda Cars / Honda Phils. Inc -> HONDA
- First Sumiden Circuits Inc. -> First Sumiden
- COL Financial -> COL
- Department of Energy -> DOE
- PHIC -> PhilHealth
- Okada -> Okada Manila
- Angeles Electric Corp / AEC -> ANGELES ELECTRIC
- Smart / PLDT / ePLDT / AMDOCS-SMART -> SMART/E-PLDT/AMDOCS
- UHRI -> Universal Hotels and Resorts Inc.
- SMIC -> SM Investment
- EMD Technology Philippines Inc. -> EMD
- Watsons -> WATSONS
- Bureau of the Treasury -> BOTR

Account Name rule:
- Use <Customer Company Name> - Sandz when a customer is identified.
- Account Name remains part of the workspace output for reference, but the Create Ticket autofill does not populate manual-only Zoho fields such as Department, Account Name, Contact Name, Email, Phone, or Mobile Number.

SE and PM/SD matching rules:
- Resolve SE's that can handle this ticket from the SI and MS Customer Database.
- Resolve PM/SD of this account only from the Enrolled Accounts Database.
- Match Account + Product/Project first before Account-only matching.
- Prefer MS rows for managed support, monitoring, backup operations, storage incidents, and other operational support tickets.
- Prefer SI rows for implementation, migration, deployment, and one-time project delivery work.
- Use newest year only as a tie-breaker after Account + Product/Project + SI/MS relevance.
- Do not output SE's that can handle this ticket: N/A when a valid matching SI/MS row exists in the embedded database.
- For GMA backup or storage-capacity incidents, select the best matching GMA SI/MS row from the embedded database instead of defaulting to N/A.

Subject rules:
- If ticket number exists:
SANDZ-MSDCO-(Subject Customer Label)-(SubjectName). Ticket No. #<ticket number>
- Otherwise:
SANDZ-MSDCO-(Subject Customer Label)-(SubjectName).
- Build SubjectName from the main issue pattern, not from a generic backup phrase.
- Prefer the clearest technical symptom first, then the most useful named object if it materially improves clarity.
- If one named job, repository, policy, SOBR, tier, or protected object is clearly central to the issue, include it in SubjectName.
- If two closely related named jobs or repositories are clearly central and still fit cleanly, include both, such as SOBR_ISCSI and SOBR_ISCSI2 Offload Failure.
- If many jobs, servers, or workloads share the same failure mode, summarize the scope instead of listing hosts one by one.
- Do not enumerate long server lists in SubjectName; keep host-by-host detail in Description.
- Avoid vague SubjectName values such as Backup Issue, Backup Failure, or Capacity Tier Issue when the ticket shows a more precise failure pattern.
- Keep SubjectName concise, formal, and usually around 6 to 12 words when possible.
- Prefer this subject construction order:
  primary failure mode
  most relevant named backup object, repository, or tier
  summarized scope only when multiple workloads are affected
- For backup offload or capacity-tier incidents:
  - if local repository pressure or near-full storage is the strongest visible cause, prefer wording around repository capacity or offload blockage
  - if S3-compatible or capacity-tier connection failure is the strongest visible cause, prefer wording around capacity-tier or S3 offload connection failure
  - if both are clearly present, combine them concisely instead of listing every affected host
- Preferred subject examples:
  - SOBR_ISCSI and SOBR_ISCSI2 Capacity Tier Offload Failure
  - Multiple Backup Offload Failures Due to Repository Capacity
  - Capacity Tier Offload Failure with S3-Compatible Connection Errors

Always classify Ticket Category as Incident by default; use Request only for clear service/work requests.

Backup incident mapping rules:
- For backup offload failures caused by repository pressure, capacity tier problems, local repository nearly full state, or S3-compatible offload failures, output Supported Portfolio: (BaaS) Backup as a Service.
- For that same incident type, output Issue Category: Storage - Incident.
- For that same incident type, output Issue Subcategory: Capacity Issue.
- Do not classify that incident type as Backup - Incident.
- Do not output raw Issue Subcategory: Offload Failure / Capacity Tier.
- Do not suggest or include retrigger failed backup as a default action phrase for backup incidents.

Supported Portfolio keyword guidance:
- backup, acronis, atempo, veeam, arcserve, rubrik -> (BaaS) Backup as a Service
- storage, nas, san, powerstore, unity, netapp, synology -> (ESTaaS) Enterprise Storage as a Service
- compute, server, node -> (CaaS) Compute as a Service
- disaster, dr, draas, replication, failover, zerto -> (DRaaS) Disaster Recovery as a Service
- archive -> (AraaS) Archive as a Service
- on prem -> (OPaaS) On Prem as a Service
- integration, implementation -> (SI) System Integration
- poc -> POC (Proof of Concept)
- otherwise -> (IaaS) Infrastructure as a Service

Severity matrix:
- Sev1 / High:
  Choose Sev1 only when the visible ticket details clearly show production down, backup infrastructure failure, storage or repository inaccessible, DR not functioning, multiple critical systems affected, or no workaround available.
- Sev2 / Medium:
  Choose Sev2 only when the visible ticket details clearly show multiple systems affected, repeated instability across workloads, major degradation of backup/replication/storage service, or meaningful risk to business continuity without full outage.
- Sev3 / Medium:
  Choose Sev3 when the visible ticket details show an isolated issue affecting one host, one source machine, one job, one VM, or one protected asset, while overall service continues and broader impact is not shown.
- Sev4 / Low:
  Choose Sev4 for requests, informational tickets, reports, administrative work, or cases with no service impact.

Severity decision rules:
- Do not raise severity just to be safe.
- Choose the highest severity clearly supported by the visible ticket details only.
- If business impact or affected scope is unknown, do not assume multiple-system impact.
- If the incident shows Failed to connect to source machine and only one source machine or one protected asset is shown, default to Sev3 unless the ticket also shows multiple affected systems, service-wide instability, production outage, or no workaround.
- If multiple source machines, multiple backup jobs, or broader backup-service instability are clearly shown, use Sev2.
- If the backup infrastructure is down, the repository or storage is inaccessible, or multiple critical systems are unprotected with no workaround, use Sev1.

Priority consistency rules:
- When Severity is Sev1, output Priority: High.
- When Severity is Sev2, output Priority: Medium.
- When Severity is Sev3, output Priority: Medium.
- When Severity is Sev4, output Priority: Low.

Embedded Customer Database — May 2026

SI and MS Customer Database:
BCDA | Integrated Cloud Backup Project Phase 2 | 2025 | MS | Atempo / Acronis | Aeron Villanueva | EJ Remolona
Honda Cars | Honda Cars | Backup and DR Infra | 2025 | SI | Veeam | CJ Tecson | Aeron Villanueva
PSE | PSE | Data Storage Refresh | 2024 | SI | Dell | Danilo Damiles | JP Doblado
GMA (ICT) | GMA AMS Server | 2024 | SI | HPE | CJ Tecson | Aeron Villanueva
GMA (ICT) | GMA 10G Switch | SI |  | CJ Tecson | EJ Remolona
GMA (MAMS) | GMA Quantum StoreNext Migration | SI |  | CJ Tecson | EJ Remolona
GMA (MAMS) | GMA RP4VM and Relocation | 2022 | SI |  | CJ Tecson | EJ Remolona
GMA (ICT) | GMA Exchange Server | 2022 | SI |  | CJ Tecson | EJ Remolona
GMA (MAMS) | GMA VxRail | 2022 | SI | DellEMC | CJ Tecson | EJ Remolona
GMA | Dell VxRail P670F HCI - Application/Database Infra | 2023 | SI | DellEMC | CJ Tecson | EJ Remolona
GMA (MAMS) | GMA | CMOSD Dell Assets MA Batch 1 (01Jan2024 - Dec2024) | 2024 | SI | Dell | CJ Tecson | EJ Remolona
GMA (MAMS) | GMA | Quantum i6000 MA Renewal | 2024 | SI | Quantum | CJ Tecson | EJ Remolona
GMA (ICT) | GMA - BAS Network Refresh, Enterprise Network Upgrade PH3, Additional requirements | 2024 | SI |  | CJ Tecson | EJ Remolona
GMA (ICT) | GMA - ICT File Server + Post Prod Simplivity 325 with upgrades | 2024 | SI |  | CJ Tecson | EJ Remolona
GMA, (MAMS) | CMOSD Dell Assets MA (VXRAIL P570) - July 2024-July 2025- Dec 2025 (7 mos.) | 2024 | SI |  | CJ Tecson | EJ Remolona
GMA (MAMS) | CMOSD Dell Assets MA (VXRAIL P570) - July 2024-July 2025- Dec 2025 ( 12 mos) | 2024 | SI |  | CJ Tecson | EJ Remolona
GMA (ICT) | HPE ARUBA RAP and AIRWAVE MA (15-July-2024 to 02-Nov-2025) | 2024 | SI |  | CJ Tecson | EJ Remolona
GMA (ICT) | Aruba Airwave MA | 2025 | SI |  | CJ Tecson | EJ Remolona
GMA | Dell MA (Servers and Switches) | 2025 | SI | Dell | CJ Tecson | EJ Remolona
GMA | VMWare Subsciption (MAMS<,POST) | 2026 | SI |  | CJ Tecson | EJ Remolona
GMA | HPE Aruba Core Switch MA (1/1/26-1/1/7) | 2026 | SI |  | CJ Tecson | EJ Remolona
SunLife | Sunlife | PowerStore Upgrade for WMS | 2025 | SI | Dell | Danilo Damiles | JP Doblado
Angeles Electric Corp | AEC Veeam Subscription License Renewal | 2025 | SI | Veeam | EJ Remolona | Lery Ponce
Orix | Orix - Zerto Back up and Replication | 2024 | SI | Zerto | Lery Ponce | EJ Remolona
NatRe | NatRe BaaS | 2025 | MS | Veeam | CJ Tecson | EJ Remolona
Radius | Radius BSC Site Prod | 2022 | MS | BaaS (Veeam & Zadara) | CJ Tecson | Aeron Villanueva
Radius | Radius TIM Site DR | 2022 | MS | BaaS (Veeam & Zadara) | CJ Tecson | Aeron Villanueva
Honda Phils. Inc | Honda Phils. Inc IaaS | MS | Zadara | Edmund Malpas | Mike Coloma
EWB | EWB MA Renewal w/ Expansion and Enhancement | MS | Zadara | Lery Ponce | Aeron Villanueva
PSE | PSE VMax DR Drill Activity | 2023 | MS | DR Drill Activity | Danilo Damiles | JP Doblado
Chinabank | Chinabank BaaS 3.5 | 2026 | MS | BaaS | Lery Ponce | JP Doblado
BPITC | BPITC Y1 | 2024 | MS | Zadara Iaas / Rackware | JP Doblado | CJ Tecson
COL Financial | COL Financial | 2024 | SI | Dell | Lery Ponce | JP Doblado
PHIC | PHIC - Backup Project 2025 | 2025 | SI | VEEAM | Danilo Damiles | Lery Ponce
Card Bank | AMTI - CARD Bank, Inc. Zerto | 2025 | MS | Zerto | Danilo Damiles | Edmund Malpas
Watsons | Zerto for Disaster Recovery Site | 2025 | MS | Zerto Licence | Lery Ponce | Dan Damiles
Department of Energy | Procurement of Backup Software License Maintenance and Support Services for CY2025 for ITMS-ITD | 2025 | SI | Acronis | Lerry Ponce | CJ Tecson
EMD Technology Philippines Inc. | NAS Storage | 2025 | MS | VST | Qnap | Danilo Damiles | Carl Bautista

Enrolled Accounts Database:
East West Bank | PM/SD Lian | Remote Support enabled
BPI | PM/SD Lian
SMART/E-PLDT/AMDOCS | PM/SD Cha | Remote Support enabled | Event Monitoring enabled
RADIUS TELECOMS INC. | PM/SD Cha | Remote Support enabled | Event Monitoring enabled | Storage enabled
CHINABANK | PM/SD Cha
BCDA | PM/SD Lian | Remote Support enabled | Event Monitoring enabled
GMA Network Inc. | PM/SD Cha
Cebu Air, Inc. | PM/SD Cha
National Reinsurance Corp. | PM/SD Cha
HONDA | PM/SD Lian
DSWD | PM/SD 4A - Lian / Main - Cha
First Sumiden | PM/SD Lian
Philippine Stock Exchange | PM/SD Lian
Oona | PM/SD Lian
Sunlife | PM/SD Lian
COL | PM/SD Cha
BPI Tokyo Century | PM/SD Lian
DOE | PM/SD Lian
PhilHealth | PM/SD Cha
PNOC | PM/SD Cha
Universal Hotels and Resorts Inc. | PM/SD Lian
SM Investment | PM/SD Lian
Okada Manila | PM/SD Lian
ANGELES ELECTRIC | PM/SD Lian
Orix | PM/SD Cha
EMD | PM/SD Lian
WATSONS | PM/SD Cha
BOTR | PM/SD Lian`;

  const ZOHO_QA_PROMPT = String.raw`You are a senior L3-style IT support engineer answering questions for L1/L1.5 technicians.

Your job in this mode is to answer questions about the current ticket, workspace, customer/account mapping, SE selection, PM/SD mapping, subject formatting, category/subcategory choice, severity, priority, supported portfolio, triage logic, likely cause, safer next steps, workaround ideas, replacement options, escalation timing, and whether specific workspace field values are really the best choice for this ticket.

Response style:
- Answer in plain text, not a Zoho ticket code block, unless the user explicitly asks to generate or regenerate the ticket.
- Sound like an L3 engineer internally, but explain things clearly enough for L1/L1.5 to act on them safely.
- Prefer short sectioned answers when the topic is operational. Use sections like:
  Likely Cause
  What L1/L1.5 Can Do Now
  What to Ask the Client
  What to Capture
  When to Escalate
- When the user is challenging or reviewing a classification field, prefer short review sections like:
  Current Value
  Better Option
  Why
  When to Keep the Current Value
- If more than one option is plausible, also include:
  Other Valid Options
  Best Recommendation
- If the question is simple, you may answer more briefly, but keep the wording direct and easy to follow.

What you should help with:
- Explain why a specific customer mapping, SE mapping, PM/SD mapping, category, subcategory, severity, priority, or supported portfolio was chosen.
- Explain why one classification is better than another, such as Storage - Incident versus Backup - Incident.
- Review whether a current workspace field value is defensible or whether a better option exists.
- Recommend better inputs when the user questions fields such as Supported Portfolio, Ticket Category, Issue Category, Issue Sub-Category, Technology/Platform, and Severity Level.
- Compare candidate options briefly and explain which one best fits the specific ticket.
- Interpret symptoms, alerts, logs, and ticket details to suggest likely causes.
- Suggest safe next steps for L1/L1.5, including what to validate, what read-only screens to ask the client to open, what screenshots/logs/details to gather, and what to tell L2/SE.
- If the user asks for alternatives, replacement suggestions, workaround ideas, or safer options, compare them briefly and call out tradeoffs and supportability.

Field-review rules:
- Reason from the current ticket details, current workspace, embedded mappings, allowed category/subcategory choices, supported portfolio rules, and severity matrix already available in the application context.
- For Ticket Category, compare only Incident versus Request.
- For Issue Category and Issue Sub-Category, compare only against allowed values from the embedded ticket rules; do not invent new categories or subcategories.
- For Supported Portfolio, compare only against the supported portfolio mapping rules already embedded.
- For Severity Level, compare against the embedded severity matrix and explain what business impact or scope detail is driving the level.
- For severity review questions, do not escalate just to be safe; compare the current case against the Sev2 and Sev3 criteria and recommend the level that is actually supported by the visible details.
- For source-machine connection failures, treat a single affected host or single protected asset as Sev3 by default unless the ticket clearly shows broader impact, multiple affected systems, service-wide instability, production outage, or no workaround.
- For Technology/Platform, if the user asks about it, explain whether it is genuinely useful, ambiguous, or better left untouched for that specific ticket context.
- If the current value is acceptable but not ideal, say so clearly.
- If the current ticket lacks enough detail to make a strong recommendation, say exactly what missing detail would change the decision.
- Prefer the minimum missing detail needed to improve the field choice, such as:
  one job versus multiple jobs
  backup workflow issue versus repository/storage-capacity issue
  warning-only versus active service degradation
  operational support versus one-time service request

Safety boundaries:
- Do not pretend direct access exists.
- Do not assume L1/L1.5 can make admin changes, restart services, reconfigure systems, retrigger jobs, or perform destructive actions unless the ticket explicitly says that action was approved and is in scope.
- Respect Remote Support and screenshare limitations already established by the ticket logic.
- If the answer depends on missing ticket details, say exactly what is missing.
- Do not overwrite or restate the full ticket unless the user explicitly asks for a new/generated ticket output.

Severity answer structure:
- When the user asks whether a ticket really deserves a severity level, prefer these short sections:
  Current Severity
  Better Severity
  Why
  What Would Change It
`;

  const state = {
    initialized: false,
    latestFileName: "ticket-workspace.txt",
    fileHandle: null,
    history: [],
    historyIndex: -1,
    historyTimer: null,
    suppressHistoryCapture: false,
    diffRecords: [],
    selectedDiffIndex: null,
    attachments: [],
    attachmentCounter: 0,
    chatConversation: [],
    isSending: false,
    apiKey: "",
    chatVisible: true
  };

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatMessageContent(text) {
    const raw = String(text || "");
    const parts = raw.split(/```/);
    return parts.map(function (part, index) {
      if (index % 2 === 1) {
        return `<pre><code>${escapeHtml(part.replace(/^\w+\n/, ""))}</code></pre>`;
      }
      return escapeHtml(part).replace(/\n/g, "<br>");
    }).join("");
  }

  function showSnackbar(message, timeout) {
    const bar = $("snackbar");
    if (!bar) return;
    bar.textContent = message;
    bar.classList.add("show");
    window.clearTimeout(showSnackbar._timer);
    showSnackbar._timer = window.setTimeout(function () {
      bar.classList.remove("show");
    }, timeout || 4200);
  }

  function safeLocalStorageGet(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function safeLocalStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {}
  }

  function getInitialWorkspaceContent() {
    return safeLocalStorageGet(STORAGE_KEYS.workspace, DEFAULT_WORKSPACE);
  }

  function getStoredTheme() {
    return safeLocalStorageGet(STORAGE_KEYS.theme, DEFAULT_THEME);
  }

  function getStoredBoolean(key, fallback) {
    const raw = safeLocalStorageGet(key, fallback ? "true" : "false");
    return raw === "true";
  }

  function setChatVisibility(isVisible) {
    const pane = $("workspacePane");
    const chat = $("chatBotContainer");
    if (!pane || !chat) return;

    state.chatVisible = !!isVisible;
    chat.style.display = state.chatVisible ? "block" : "none";
    pane.style.width = state.chatVisible ? "65%" : "100%";
    pane.style.flex = state.chatVisible ? "0 0 65%" : "1 1 auto";
    safeLocalStorageSet(STORAGE_KEYS.chatVisible, String(state.chatVisible));
  }

  function getEditorText() {
    return window.editor && typeof window.editor.getValue === "function"
      ? window.editor.getValue()
      : "";
  }

  function setEditorText(value) {
    if (!window.editor) return;
    window.editor.setValue(String(value || ""), -1);
    persistWorkspace();
  }

  function persistWorkspace() {
    safeLocalStorageSet(STORAGE_KEYS.workspace, getEditorText());
  }

  function timestampLabel(dateLike) {
    const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
    return isNaN(date.getTime()) ? "" : date.toLocaleString();
  }

  function applyTheme(themeName) {
    if (!window.editor) return;
    window.currentTheme = themeName;
    window.editor.setTheme(themeName);
    document.body.classList.toggle("theme-dark", themeName === "ace/theme/monokai");
    safeLocalStorageSet(STORAGE_KEYS.theme, themeName);
  }

  function openModal() {
    $("modalOverlay").style.display = "flex";
  }

  function closeModal() {
    $("modalOverlay").style.display = "none";
  }

  function openDocumentationModal() {
    $("documentationBody").innerHTML = window.ZOHO_DESK_DOCUMENTATION_HTML || "<p>No documentation is available.</p>";
    $("documentationModal").style.display = "flex";
  }

  function closeDocumentationModal() {
    $("documentationModal").style.display = "none";
  }

  function openApiModal() {
    $("APIKey").value = state.apiKey;
    $("modalApi").style.display = "flex";
    $("APIKey").focus();
  }

  function closeApiModal() {
    $("modalApi").style.display = "none";
    saveApiKey();
  }

  function openClearChatModal() {
    $("clearChatModal").style.display = "flex";
  }

  function closeClearChatModal() {
    $("clearChatModal").style.display = "none";
  }

  function closeDiffModal() {
    $("diffModal").style.display = "none";
    state.selectedDiffIndex = null;
  }

  function toggleDisplayChatBotContainer() {
    setChatVisibility(!state.chatVisible);
  }

  function toggleTheme() {
    applyTheme(window.currentTheme === "ace/theme/monokai" ? DEFAULT_THEME : "ace/theme/monokai");
  }

  function saveApiKey() {
    state.apiKey = String($("APIKey").value || "").trim();
    safeLocalStorageSet(STORAGE_KEYS.apiKey, state.apiKey);
  }

  function getApiKey() {
    return state.apiKey || safeLocalStorageGet(STORAGE_KEYS.apiKey, "");
  }

  function createDownload(content, fileName) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName || state.latestFileName || "ticket-workspace.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 500);
  }

  async function saveToFile() {
    const content = getEditorText();
    persistWorkspace();

    if ("showSaveFilePicker" in window) {
      try {
        if (!state.fileHandle) {
          state.fileHandle = await window.showSaveFilePicker({
            suggestedName: state.latestFileName,
            types: [{
              description: "Text files",
              accept: {
                "text/plain": [".txt", ".md"]
              }
            }]
          });
        }

        const writable = await state.fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        state.latestFileName = state.fileHandle.name || state.latestFileName;
        showSnackbar("Workspace saved.");
        return;
      } catch (error) {
        if (error && error.name === "AbortError") {
          return;
        }
      }
    }

    createDownload(content, state.latestFileName);
    showSnackbar("Workspace downloaded.");
  }

  function downloadEditorContent() {
    createDownload(getEditorText(), state.latestFileName);
  }

  async function openFileFromPicker() {
    let file = null;

    if ("showOpenFilePicker" in window) {
      try {
        const handles = await window.showOpenFilePicker({
          multiple: false,
          types: [{
            description: "Text files",
            accept: {
              "text/plain": [".txt", ".md", ".log"],
              "application/json": [".json"],
              "text/html": [".html"]
            }
          }]
        });
        state.fileHandle = handles[0];
        file = await handles[0].getFile();
      } catch (error) {
        if (!error || error.name === "AbortError") {
          return;
        }
      }
    }

    if (!file) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt,.md,.log,.json,.html,.csv";
      input.addEventListener("change", async function () {
        const selected = input.files && input.files[0];
        if (!selected) return;
        state.latestFileName = selected.name || state.latestFileName;
        const text = await selected.text();
        setEditorText(text);
        saveCurrentCodeToHistory(true);
        window.lastSavedCode = getEditorText();
        document.title = `${state.latestFileName} - Zoho Desk Ticket Assistant`;
        showSnackbar("Workspace loaded.");
      }, { once: true });
      input.click();
      return;
    }

    state.latestFileName = file.name || state.latestFileName;
    const text = await file.text();
    setEditorText(text);
    saveCurrentCodeToHistory(true);
    window.lastSavedCode = getEditorText();
    document.title = `${state.latestFileName} - Zoho Desk Ticket Assistant`;
    showSnackbar("Workspace loaded.");
  }

  function newFile() {
    state.fileHandle = null;
    state.latestFileName = "ticket-workspace.txt";
    setEditorText(DEFAULT_WORKSPACE);
    saveCurrentCodeToHistory(true);
    window.lastSavedCode = getEditorText();
    document.title = "Untitled - Zoho Desk Ticket Assistant";
    showSnackbar("Started a new workspace.");
  }

  function getDiffStats(parts) {
    let added = 0;
    let removed = 0;

    parts.forEach(function (part) {
      const count = part.count || part.value.split(/\r?\n/).filter(Boolean).length;
      if (part.added) added += count;
      if (part.removed) removed += count;
    });

    return { added, removed };
  }

  function renderDiffPane(targetId, parts, type) {
    const pane = $(targetId);
    if (!pane) return;

    const html = parts.map(function (part) {
      const classes = [];
      if (part.added && type === "new") classes.push("added");
      if (part.removed && type === "old") classes.push("removed");
      if ((part.added && type === "old") || (part.removed && type === "new")) {
        return "";
      }
      const value = escapeHtml(part.value || "").replace(/\n/g, "<br>");
      return `<div class="${classes.join(" ")}">${value || "<br>"}</div>`;
    }).join("");

    pane.innerHTML = `<div style="padding:12px; font-family: var(--mono-font); font-size:12px; line-height:1.45;">${html}</div>`;
  }

  function openDiffModal(index) {
    const record = state.diffRecords[index];
    if (!record || !window.Diff) return;

    state.selectedDiffIndex = index;
    const diffParts = window.Diff.diffLines(record.oldContent, record.newContent);
    const stats = getDiffStats(diffParts);
    $("diffStats").textContent = `(+${stats.added} / -${stats.removed})`;
    $("diffTimestamp").textContent = timestampLabel(record.timestamp);
    renderDiffPane("diffOld", diffParts, "old");
    renderDiffPane("diffNew", diffParts, "new");
    $("diffModal").style.display = "flex";
  }

  function restoreFromDiff() {
    if (state.selectedDiffIndex === null) return;
    const record = state.diffRecords[state.selectedDiffIndex];
    if (!record) return;
    setEditorText(record.newContent);
    saveCurrentCodeToHistory(true);
    closeDiffModal();
    addMessage("Restored workspace content from a saved diff.", "ai");
  }

  function recordChange(oldContent, newContent) {
    if (String(oldContent || "") === String(newContent || "")) {
      return null;
    }

    const record = {
      oldContent: String(oldContent || ""),
      newContent: String(newContent || ""),
      timestamp: new Date().toISOString()
    };

    state.diffRecords.push(record);
    return state.diffRecords.length - 1;
  }

  function updateHistoryButtonsState() {
    $("previousCodeBtn").disabled = state.historyIndex <= 0;
    $("nextCodeBtn").disabled = state.historyIndex >= state.history.length - 1 || state.history.length === 0;
  }

  function saveCurrentCodeToHistory(force) {
    if (!window.editor || state.suppressHistoryCapture) return;
    const content = getEditorText();
    const current = state.history[state.historyIndex];

    if (!force && current && current.content === content) {
      updateHistoryButtonsState();
      return;
    }

    if (state.historyIndex < state.history.length - 1) {
      state.history = state.history.slice(0, state.historyIndex + 1);
    }

    state.history.push({
      content,
      timestamp: new Date().toISOString()
    });

    if (state.history.length > 100) {
      state.history.shift();
    }

    state.historyIndex = state.history.length - 1;
    updateHistoryButtonsState();
  }

  function navigateHistory(direction) {
    if (!state.history.length) return;
    const nextIndex = state.historyIndex + direction;
    if (nextIndex < 0 || nextIndex >= state.history.length) return;

    state.historyIndex = nextIndex;
    state.suppressHistoryCapture = true;
    window.editor.setValue(state.history[nextIndex].content, -1);
    state.suppressHistoryCapture = false;
    persistWorkspace();
    updateHistoryButtonsState();
    showSnackbar(`Loaded version from ${timestampLabel(state.history[nextIndex].timestamp)}.`);
  }

  function previousCode() {
    navigateHistory(-1);
  }

  function nextCode() {
    navigateHistory(1);
  }

  function addMessage(text, role, options) {
    const container = $("chat-messages");
    if (!container) return;

    const message = document.createElement("div");
    const safeRole = role === "user" ? "user" : role === "restored" ? "restored" : "ai";
    message.className = `message ${safeRole}`;

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.innerHTML = formatMessageContent(text);
    message.appendChild(bubble);

    if (options && (options.footerText || options.diffIndex !== undefined)) {
      const footer = document.createElement("div");
      footer.style.marginTop = "8px";
      footer.style.fontSize = "11px";
      footer.style.color = "#5f6368";

      if (options.footerText) {
        const textNode = document.createElement("div");
        textNode.textContent = options.footerText;
        footer.appendChild(textNode);
      }

      if (options.diffIndex !== undefined && options.diffIndex !== null) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "diff-button";
        button.style.marginTop = "6px";
        button.textContent = "View changes";
        button.setAttribute("data-diff-index", String(options.diffIndex));
        footer.appendChild(button);
      }

      bubble.appendChild(footer);
    }

    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
    persistChatMessages();
  }

  function persistChatMessages() {
    const html = $("chat-messages") ? $("chat-messages").innerHTML : "";
    safeLocalStorageSet(STORAGE_KEYS.chatMessages, html);
  }

  function persistConversation() {
    safeLocalStorageSet(STORAGE_KEYS.chatConversation, JSON.stringify(state.chatConversation));
  }

  function hydrateSavedChat() {
    const saved = safeLocalStorageGet(STORAGE_KEYS.chatMessages, "");
    if (saved && $("chat-messages")) {
      $("chat-messages").innerHTML = saved;
    }

    try {
      const savedConversation = safeLocalStorageGet(STORAGE_KEYS.chatConversation, "[]");
      const parsed = JSON.parse(savedConversation);
      if (Array.isArray(parsed)) {
        state.chatConversation = parsed;
      }
    } catch (error) {
      state.chatConversation = [];
    }
  }

  function setLoading(isLoading) {
    state.isSending = isLoading;
    $("loading-indicator").classList.toggle("active", isLoading);
    $("send-button").disabled = isLoading;
  }

  function buildAttachmentSummary(attachment) {
    return {
      id: attachment.id,
      name: attachment.name,
      status: attachment.status,
      ocrText: attachment.ocrText
    };
  }

  function persistAttachmentSummaries() {
    safeLocalStorageSet(STORAGE_KEYS.attachments, JSON.stringify(state.attachments.map(buildAttachmentSummary)));
  }

  function getCombinedOcrText() {
    return state.attachments
      .filter(function (attachment) {
        return attachment.status === "ready" && String(attachment.ocrText || "").trim();
      })
      .map(function (attachment) {
        return `[${attachment.name}]\n${attachment.ocrText.trim()}`;
      })
      .join("\n\n");
  }

  function updateAttachmentSummaryActions() {
    const count = state.attachments.length;
    $("attachmentCount").textContent = count ? `(${count})` : "";
    $("clearAttachmentsBtn").style.display = count ? "inline-block" : "none";
  }

  function renderAttachmentTray() {
    const tray = $("attachmentTray");
    if (!tray) return;

    updateAttachmentSummaryActions();

    if (!state.attachments.length) {
      tray.innerHTML = '<div class="attachment-empty">No screenshots added yet.</div>';
      persistAttachmentSummaries();
      return;
    }

    tray.innerHTML = "";
    state.attachments.forEach(function (attachment) {
      const card = document.createElement("div");
      card.className = "attachment-card";

      const thumb = document.createElement("img");
      thumb.className = "attachment-thumb";
      thumb.src = attachment.previewUrl;
      thumb.alt = attachment.name;

      const info = document.createElement("div");
      info.className = "attachment-info";

      const fileName = document.createElement("div");
      fileName.className = "attachment-filename";
      fileName.textContent = attachment.name;

      const badge = document.createElement("span");
      badge.className = `attachment-badge ${attachment.status}`;
      badge.textContent = attachment.status === "processing"
        ? "OCR running"
        : attachment.status === "ready"
          ? "OCR ready"
          : "OCR failed";

      info.appendChild(fileName);
      info.appendChild(badge);

      const actions = document.createElement("div");
      actions.className = "attachment-card-actions";

      const useButton = document.createElement("button");
      useButton.type = "button";
      useButton.className = "card-action-btn secondary";
      useButton.textContent = "Use OCR";
      useButton.disabled = attachment.status !== "ready" || !String(attachment.ocrText || "").trim();
      useButton.addEventListener("click", function () {
        insertTextIntoWorkspace(attachment.ocrText.trim());
      });

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "card-action-btn danger";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", function () {
        removeAttachment(attachment.id);
      });

      actions.appendChild(useButton);
      actions.appendChild(removeButton);

      card.appendChild(thumb);
      card.appendChild(info);
      card.appendChild(actions);
      tray.appendChild(card);
    });

    persistAttachmentSummaries();
  }

  function removeAttachment(id) {
    const index = state.attachments.findIndex(function (attachment) {
      return attachment.id === id;
    });
    if (index === -1) return;

    const item = state.attachments[index];
    if (item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    state.attachments.splice(index, 1);
    renderAttachmentTray();
  }

  function clearAttachments() {
    state.attachments.forEach(function (attachment) {
      if (attachment.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
    });
    state.attachments = [];
    renderAttachmentTray();
    showSnackbar("Cleared screenshot attachments.");
  }

  async function runOcr(attachment) {
    if (!window.Tesseract || !attachment.file) {
      attachment.status = "error";
      renderAttachmentTray();
      return;
    }

    try {
      const result = await window.Tesseract.recognize(attachment.file, "eng");
      attachment.ocrText = String(result && result.data && result.data.text || "").trim();
      attachment.status = "ready";
      renderAttachmentTray();
      if (attachment.ocrText) {
        showSnackbar(`OCR completed for ${attachment.name}.`);
      } else {
        showSnackbar(`OCR completed for ${attachment.name}, but no text was found.`);
      }
    } catch (error) {
      attachment.status = "error";
      attachment.ocrText = "";
      renderAttachmentTray();
      showSnackbar(`OCR failed for ${attachment.name}.`);
    }
  }

  function addAttachment(file) {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      return;
    }

    const attachment = {
      id: `attachment-${Date.now()}-${state.attachmentCounter += 1}`,
      name: file.name || `screenshot-${state.attachmentCounter}.png`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: "processing",
      ocrText: ""
    };

    state.attachments.push(attachment);
    renderAttachmentTray();
    runOcr(attachment);
  }

  function handleImageFiles(fileList) {
    Array.from(fileList || []).forEach(addAttachment);
  }

  function getReadyOcrTextOrWarn() {
    const text = getCombinedOcrText();
    if (!text) {
      showSnackbar("No OCR text is ready yet.");
      return "";
    }
    return text;
  }

  function appendOcrToWorkspace() {
    const text = getReadyOcrTextOrWarn();
    if (!text || !window.editor) return;
    const current = getEditorText();
    const separator = current.trim() ? "\n\n" : "";
    setEditorText(current + separator + text);
    saveCurrentCodeToHistory(true);
    showSnackbar("OCR text appended to the workspace.");
  }

  function replaceWorkspaceWithOcr() {
    const text = getReadyOcrTextOrWarn();
    if (!text) return;
    setEditorText(text);
    saveCurrentCodeToHistory(true);
    showSnackbar("Workspace replaced with OCR text.");
  }

  function insertTextIntoWorkspace(text) {
    if (!window.editor) return;
    const selectionRange = window.editor.getSelectionRange();
    window.editor.session.replace(selectionRange, String(text || ""));
    persistWorkspace();
    saveCurrentCodeToHistory(true);
  }

  function insertOcrIntoWorkspace() {
    const text = getReadyOcrTextOrWarn();
    if (!text) return;
    insertTextIntoWorkspace(text);
    showSnackbar("OCR text inserted at the cursor.");
  }

  function sendWorkspaceToAssistant() {
    $("chat-input").value = getEditorText();
    sendMessage();
  }

  function getMeaningfulWorkspaceText() {
    const workspace = getEditorText().trim();
    return normalizeText(workspace) === normalizeText(DEFAULT_WORKSPACE) ? "" : workspace;
  }

  function normalizeText(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^\w\s/-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function detectBridgeCallMode(text) {
    return BRIDGE_TRIGGER_PATTERNS.some(function (pattern) {
      return pattern.test(String(text || ""));
    });
  }

  function detectExplicitGenerationRequest(text) {
    return GENERATION_TRIGGER_PATTERNS.some(function (pattern) {
      return pattern.test(String(text || ""));
    });
  }

  function detectConversationalQAMode(userText, workspaceText, ocrText) {
    const user = String(userText || "").trim();
    if (!user) return false;
    if (detectExplicitGenerationRequest(user)) return false;
    if (!QA_TRIGGER_PATTERNS.some(function (pattern) { return pattern.test(user); })) {
      return false;
    }

    const context = [workspaceText, ocrText].filter(Boolean).join("\n\n");
    return hasUsableIncidentDetails(context) || hasUsableIncidentDetails(user);
  }

  function detectInteractionMode(userText, workspaceText, ocrText) {
    const combined = [workspaceText, ocrText, userText].filter(Boolean).join("\n\n");
    if (detectBridgeCallMode(combined)) return "bridge";
    if (detectConversationalQAMode(userText, workspaceText, ocrText)) return "qa";
    return "standard";
  }

  function looksLikePromptOnly(text) {
    const raw = String(text || "");
    const normalized = normalizeText(raw);
    const matches = PROMPT_ONLY_MARKERS.filter(function (marker) {
      return normalized.includes(normalizeText(marker));
    }).length;
    const placeholderIndex = raw.toLowerCase().indexOf("[paste incident details here]");
    if (matches >= 2 && placeholderIndex !== -1) {
      const trailing = raw.slice(placeholderIndex + "[paste incident details here]".length).trim();
      if (!trailing || trailing === "```" || trailing === "```text") {
        return true;
      }
    }
    return matches >= 3;
  }

  function hasUsableIncidentDetails(text) {
    const raw = String(text || "");
    const normalized = normalizeText(raw);
    if (!normalized) return false;
    if (normalizeText(raw) === normalizeText(DEFAULT_WORKSPACE)) {
      return false;
    }
    if (looksLikePromptOnly(raw)) {
      return false;
    }

    const signals = [
      /ticket no/i,
      /subject:/i,
      /description:/i,
      /customer/i,
      /account/i,
      /incident/i,
      /request/i,
      /alert/i,
      /error/i,
      /failed|failure/i,
      /backup/i,
      /restore/i,
      /zerto|veeam|acronis|atempo|rubrik|arcserve|powerstore|unity|synology|netapp|qnap|zadara/i,
      /\bvm\b|\bip\b|hostname|server/i,
      /screenshot/i,
      /monitoring/i
    ];

    return signals.some(function (pattern) {
      return pattern.test(raw);
    });
  }

  function buildPrompt(userPrompt, mode) {
    const incidentSections = [];
    const workspace = getMeaningfulWorkspaceText();
    const ocrText = getCombinedOcrText().trim();
    const userText = String(userPrompt || "").trim();

    if (workspace && normalizeText(workspace) !== normalizeText(DEFAULT_WORKSPACE)) {
      incidentSections.push("Workspace content:");
      incidentSections.push(workspace);
    }

    if (ocrText) {
      incidentSections.push("OCR text from screenshots:");
      incidentSections.push(ocrText);
    }

    if (userText) {
      incidentSections.push(mode === "bridge"
        ? "Bridge-call or screenshot triage request:"
        : mode === "qa"
          ? "User question about the current ticket/workspace:"
          : "User-provided incident details:");
      incidentSections.push(userText);
    }

    const modeInstruction = mode === "bridge"
      ? "Use Bridge Call / Screenshot Assistance Mode. Return only the bridge-call structure."
      : mode === "qa"
        ? "Use conversational ticket Q&A mode. Answer plainly and do not generate a Zoho ticket code block unless explicitly requested."
        : "Use standard Zoho Desk ticket generation mode. Return only one ```text code block.";

    const sections = [
      mode === "qa" ? ZOHO_QA_PROMPT : ZOHO_GENERATOR_PROMPT,
      modeInstruction,
      "Incident details to process:"
    ];
    sections.push(incidentSections.join("\n\n"));
    return sections.join("\n\n");
  }

  function normalizeAssistantOutput(rawReply, mode) {
    const reply = String(rawReply || "").trim();
    if (!reply) {
      if (mode === "bridge") {
        return "Bridge Call / Screenshot Triage:\nObserved Issue: Unable to determine from the provided details.\nNext Safe Step for L1/L1.5: Ask the client to provide the next screenshot or screenshare the exact read-only error/status page.\nCapture/Document: Record the exact error, timestamp, affected system, and visible status shown on screen.\nEscalation Decision: Ask L2/assigned SE for initial guidance if the next required action is unclear.";
      }
      if (mode === "qa") {
        return "I need a bit more ticket context before I can answer that clearly. Point me to the specific field, mapping, category, severity, priority, or account detail you want explained.";
      }
      return `\`\`\`text\n${EMPTY_INCIDENT_PROMPT}\n\`\`\``;
    }

    if (mode === "bridge") {
      const bridgeMatch = reply.match(/Bridge Call \/ Screenshot Triage:[\s\S]*$/i);
      return bridgeMatch ? bridgeMatch[0].trim() : reply;
    }

    if (mode === "qa") {
      return reply;
    }

    const codeBlockMatch = reply.match(/```text[\s\S]*?```/i) || reply.match(/```[\s\S]*?```/);
    if (codeBlockMatch) {
      const block = codeBlockMatch[0];
      if (/^```text/i.test(block)) {
        return block.trim();
      }
      return block.replace(/^```/, "```text").trim();
    }

    return `\`\`\`text\n${reply}\n\`\`\``;
  }

  function extractWorkspaceContentFromReply(replyText) {
    const raw = String(replyText || "").trim();
    if (!raw) return "";

    const fencedMatch = raw.match(/```text\s*([\s\S]*?)```/i) || raw.match(/```\s*([\s\S]*?)```/);
    if (fencedMatch) {
      return String(fencedMatch[1] || "").trim();
    }

    return raw;
  }

  function updateWorkspaceFromAssistantReply(replyText) {
    const content = extractWorkspaceContentFromReply(replyText);
    if (!content) return;
    setEditorText(content);
    saveCurrentCodeToHistory(true);
    window.lastSavedCode = getEditorText();
    showSnackbar("Workspace updated from the latest assistant response.");
  }

  async function fetchGeminiResponse(prompt) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("Missing Gemini API key. Use the API Key button first.");
    }

    const model = $("my-select-dropdown").value;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: state.chatConversation.concat([{
          role: "user",
          parts: [{ text: prompt }]
        }])
      })
    });

    if (!response.ok) {
      let detail = "";
      try {
        const errorBody = await response.json();
        detail = errorBody && errorBody.error && errorBody.error.message
          ? ` ${errorBody.error.message}`
          : "";
      } catch (error) {}
      throw new Error(`Gemini request failed (${response.status}).${detail}`);
    }

    const payload = await response.json();
    const candidate = payload && payload.candidates && payload.candidates[0];
    const parts = candidate && candidate.content && Array.isArray(candidate.content.parts)
      ? candidate.content.parts
      : [];
    const text = parts
      .map(function (part) { return part.text || ""; })
      .join("\n")
      .trim();

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    return text;
  }

  async function sendMessage() {
    if (state.isSending) return;
    const input = $("chat-input");
    const userText = String(input.value || "").trim();
    if (!userText) {
      showSnackbar("Enter a message before sending.");
      return;
    }

    addMessage(userText, "user");
    input.value = "";
    setLoading(true);

    try {
      const workspaceText = getMeaningfulWorkspaceText();
      const ocrText = getCombinedOcrText().trim();
      const combinedInput = [workspaceText, ocrText, userText].filter(Boolean).join("\n\n");
      if (!hasUsableIncidentDetails(combinedInput)) {
        addMessage(EMPTY_INCIDENT_PROMPT, "ai");
        return;
      }

      const mode = detectInteractionMode(userText, workspaceText, ocrText);
      const prompt = buildPrompt(userText, mode);
      const reply = await fetchGeminiResponse(prompt);
      const normalizedReply = normalizeAssistantOutput(reply, mode);
      state.chatConversation.push({
        role: "user",
        parts: [{ text: prompt }]
      });
      state.chatConversation.push({
        role: "model",
        parts: [{ text: normalizedReply }]
      });
      persistConversation();
      addMessage(normalizedReply, "ai");
      if (mode === "standard") {
        updateWorkspaceFromAssistantReply(normalizedReply);
      }
    } catch (error) {
      addMessage(error.message || "The assistant request failed.", "ai");
    } finally {
      setLoading(false);
    }
  }

  function clearChatHistory() {
    $("chat-messages").innerHTML = "";
    state.chatConversation = [];
    persistChatMessages();
    persistConversation();
    closeClearChatModal();
    showSnackbar("Chat history cleared.");
  }

  function bindModalClosers() {
    [
      ["modalOverlay", closeModal],
      ["documentationModal", closeDocumentationModal],
      ["modalApi", closeApiModal],
      ["clearChatModal", closeClearChatModal],
      ["diffModal", closeDiffModal]
    ].forEach(function (entry) {
      const modal = $(entry[0]);
      const closeFn = entry[1];
      modal.addEventListener("click", function (event) {
        if (event.target === modal) {
          closeFn();
        }
      });
    });
  }

  function initializeSettings() {
    const autocompleteCheckbox = $("toggleLocalCompletion");
    const readOnlyCheckbox = $("toggleReadOnly");

    autocompleteCheckbox.checked = getStoredBoolean(STORAGE_KEYS.autocomplete, false);
    readOnlyCheckbox.checked = getStoredBoolean(STORAGE_KEYS.readOnly, false);

    if (window.editor) {
      window.editor.setOptions({
        enableBasicAutocompletion: autocompleteCheckbox.checked,
        enableLiveAutocompletion: autocompleteCheckbox.checked,
        readOnly: readOnlyCheckbox.checked
      });
    }

    autocompleteCheckbox.addEventListener("change", function () {
      const enabled = autocompleteCheckbox.checked;
      safeLocalStorageSet(STORAGE_KEYS.autocomplete, String(enabled));
      if (window.editor) {
        window.editor.setOptions({
          enableBasicAutocompletion: enabled,
          enableLiveAutocompletion: enabled
        });
      }
    });

    readOnlyCheckbox.addEventListener("change", function () {
      const enabled = readOnlyCheckbox.checked;
      safeLocalStorageSet(STORAGE_KEYS.readOnly, String(enabled));
      if (window.editor) {
        window.editor.setReadOnly(enabled);
      }
    });
  }

  function initializeEditorHooks() {
    if (!window.editor) return;

    window.editor.on("change", function () {
      persistWorkspace();
      window.clearTimeout(state.historyTimer);
      state.historyTimer = window.setTimeout(function () {
        saveCurrentCodeToHistory(false);
      }, 450);
    });

    saveCurrentCodeToHistory(true);
    updateHistoryButtonsState();
    window.lastSavedCode = getEditorText();
  }

  function initializeRuntime() {
    if (state.initialized) return;
    state.initialized = true;

    state.apiKey = safeLocalStorageGet(STORAGE_KEYS.apiKey, typeof window.myGeminiAPIKey === "string" ? window.myGeminiAPIKey : "");
    $("APIKey").value = state.apiKey;
    hydrateSavedChat();
    renderAttachmentTray();
    setChatVisibility(getStoredBoolean(STORAGE_KEYS.chatVisible, true));

    bindModalClosers();
    initializeSettings();
    initializeEditorHooks();

    $("openBtn").addEventListener("click", openFileFromPicker);
    $("saveBtn").addEventListener("click", function () { saveToFile(); });
    $("send-button").addEventListener("click", sendMessage);
    $("clear-chat-btn").addEventListener("click", openClearChatModal);
    $("confirmClearChatBtn").addEventListener("click", clearChatHistory);
    $("attachImageBtn").addEventListener("click", function () { $("imageAttachmentInput").click(); });
    $("imageAttachmentInput").addEventListener("change", function (event) {
      handleImageFiles(event.target.files);
      event.target.value = "";
    });
    $("appendWorkspaceBtn").addEventListener("click", appendOcrToWorkspace);
    $("replaceWorkspaceBtn").addEventListener("click", replaceWorkspaceWithOcr);
    $("insertOcrBtn").addEventListener("click", insertOcrIntoWorkspace);
    $("sendWorkspaceBtn").addEventListener("click", sendWorkspaceToAssistant);
    $("clearAttachmentsBtn").addEventListener("click", clearAttachments);
    $("APIKey").addEventListener("change", saveApiKey);
    $("APIKey").addEventListener("blur", saveApiKey);
    $("chat-messages").addEventListener("click", function (event) {
      const button = event.target.closest("[data-diff-index]");
      if (!button) return;
      const index = Number(button.getAttribute("data-diff-index"));
      if (!Number.isNaN(index)) {
        openDiffModal(index);
      }
    });
    $("chat-input").addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });

    const dropZone = $("imageDropZone");
    dropZone.addEventListener("click", function (event) {
      if (event.target.id !== "attachImageBtn") {
        $("imageAttachmentInput").click();
      }
    });
    dropZone.addEventListener("dragover", function (event) {
      event.preventDefault();
      dropZone.classList.add("drag-over");
    });
    dropZone.addEventListener("dragleave", function () {
      dropZone.classList.remove("drag-over");
    });
    dropZone.addEventListener("drop", function (event) {
      event.preventDefault();
      dropZone.classList.remove("drag-over");
      handleImageFiles(event.dataTransfer && event.dataTransfer.files);
    });

    document.addEventListener("paste", function (event) {
      const items = Array.from(event.clipboardData && event.clipboardData.items || []);
      const files = items
        .filter(function (item) { return item.type && item.type.startsWith("image/"); })
        .map(function (item) { return item.getAsFile(); })
        .filter(Boolean);
      if (files.length) {
        handleImageFiles(files);
      }
    });

    showSnackbar("Zoho Ticket Auto-Fill Assistant is ready.");
  }

  window.getStoredTheme = getStoredTheme;
  window.getInitialWorkspaceContent = getInitialWorkspaceContent;
  window.initializeTicketAssistantRuntime = initializeRuntime;
  window.showSnackbar = showSnackbar;
  window.recordChange = recordChange;
  window.lastSavedCode = "";
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.openDocumentationModal = openDocumentationModal;
  window.closeDocumentationModal = closeDocumentationModal;
  window.openApiModal = openApiModal;
  window.closeApiModal = closeApiModal;
  window.toggleDisplayChatBotContainer = toggleDisplayChatBotContainer;
  window.toggleTheme = toggleTheme;
  window.newFile = newFile;
  window.saveToFile = saveToFile;
  window.downloadEditorContent = downloadEditorContent;
  window.previousCode = previousCode;
  window.nextCode = nextCode;
  window.addMessage = addMessage;
  window.sendMessage = sendMessage;
  window.saveCurrentCodeToHistory = saveCurrentCodeToHistory;
  window.updateHistoryButtonsState = updateHistoryButtonsState;
  window.closeDiffModal = closeDiffModal;
  window.restoreFromDiff = restoreFromDiff;
  window.closeClearChatModal = closeClearChatModal;
}());
