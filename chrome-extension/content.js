(function () {
  "use strict";

  const HASH_KEY = "zta";
  const PANEL_ID = "ticket-assistant-autofill-panel";
  const SCRIPT_REVISION = "MAU-2.4-r1";
  const ACTION_PREPARE_OR_FOCUS = "prepareOrFocusZohoTab";
  const ACTION_AUTOFILL = "autofillZohoTicket";
  const BRIDGE_REQUEST_TYPE = "zta:bridge-request";
  const BRIDGE_RESPONSE_TYPE = "zta:bridge-response";
  const SKIP_AUTOFILL_LABELS = new Set([
    "Department",
    "Account Name",
    "Contact Name",
    "Email",
    "Phone",
    "Mobile Number",
    "Ticket Owner",
    "Technology/Platform",
    "SE's that can handle this ticket",
    "PM/SD of this account",
    "Status",
    "Viber Details/Zoho Comment on Ticket for initial troubleshooting"
  ]);
  const STRICT_DEFINITION_ONLY_LABELS = new Set([
    "Priority",
    "Severity Level",
    "Support Level",
    "Support Agent",
    "Channel",
    "Ticket Source",
    "Ticket Category",
    "Technology/Platform"
  ]);
  const STRICT_DROPDOWN_LABELS = new Set([
    "Priority",
    "Severity Level",
    "Support Level",
    "Support Agent",
    "Channel",
    "Ticket Source",
    "Ticket Category"
  ]);
  const PROTECTED_FIELD_LABELS = new Set([
    "Serial Number"
  ]);

  const FIELD_DEFINITIONS = {
    "Department": {
      kind: "dropdown",
      selectors: [
        '[data-id="department"]',
        '[data-test-id="department"]',
        'lyte-yield[data-id="department"]',
        'input[placeholder*="None"][data-id*="department" i]',
        '[data-id="department"] input',
        '[data-test-id="department"] input',
        'lyte-yield[data-id="department"] input',
        'input[aria-label*="Department" i]',
        '[role="combobox"][aria-label*="Department" i]',
        '[class*="department" i] input'
      ]
    },
    "Account Name": {
      kind: "dropdown",
      selectors: [
        '[data-id="accountId"]',
        '[data-test-id="accountId"]',
        '[data-id="account_name"]',
        'lyte-yield[data-id="account_name"]',
        '[data-id="accountId"] input',
        '[data-test-id="accountId"] input',
        'input[placeholder*="Account" i]',
        '[data-id="account_name"] input',
        'lyte-yield[data-id="account_name"] input',
        '[role="combobox"][aria-label*="Account" i]'
      ]
    },
    "Contact Name": {
      kind: "text",
      selectors: [
        'input[data-id="contact_name"]',
        'input[data-test-id="contact_name"]',
        'input[aria-labelledby="Contact Name"]'
      ]
    },
    "Email": {
      kind: "text",
      selectors: [
        'input[data-id="email"]',
        'input[type="email"]',
        'input[aria-labelledby="Email"]'
      ]
    },
    "Phone": {
      kind: "text",
      selectors: [
        'input[data-id="phone"]',
        'input[aria-labelledby="Phone"]'
      ]
    },
    "Mobile Number": {
      kind: "text",
      selectors: [
        'input[data-id="mobile"]',
        'input[aria-labelledby="Mobile Number"]'
      ]
    },
    "Customer Company Name": {
      kind: "text",
      selectors: [
        'input[data-id="cf_customer_company"]',
        'input[data-test-id="cf_customer_company"]',
        'input[aria-labelledby="Customer Company Name"]'
      ]
    },
    "Subject": {
      kind: "text",
      selectors: [
        'input[data-id="subject"]',
        'input[data-test-id="subject"]',
        'input[aria-labelledby="Subject"]'
      ]
    },
    "Description": {
      kind: "richtext",
      selectors: [
        'textarea[data-id="description"]',
        'textarea[data-test-id="description"]',
        '#description_field textarea[data-selector-id="textarea"]',
        '[data-id="description_field"] textarea[data-selector-id="textarea"]',
        '[data-test-id="description_field"] textarea[data-selector-id="textarea"]',
        'div[data-id="description"][data-selector-id="textEditor"]',
        'div[data-test-id="description"][data-selector-id="textEditor"]',
        '#description_field iframe.KB_Editor_iframe',
        '[data-id="description_field"] iframe.KB_Editor_iframe',
        '[data-test-id="description_field"] iframe.KB_Editor_iframe',
        'iframe.KB_Editor_iframe[name^="deskEditor_"]',
        'div[data-test-id="description"] iframe.KB_Editor_iframe',
        'div[data-id="description"] iframe.KB_Editor_iframe',
        'div[data-test-id="description"] [contenteditable="true"]',
        'div[data-id="description"] [contenteditable="true"]',
        'div[data-test-id="description"]',
        'div[data-id="description"]'
      ]
    },
    "Status": {
      kind: "dropdown",
      selectors: [
        'input[data-id="status_textBox"]',
        'input[aria-labelledby="Status"]'
      ]
    },
    "Ticket Owner": {
      kind: "dropdown",
      selectors: [
        'input[data-id="ticket_owner_textBox"]',
        'input[aria-labelledby="Ticket Owner"]'
      ]
    },
    "Supported Portfolio": {
      kind: "dropdown",
      selectors: [
        'input[data-id="cf_type_of_service_textBox"]',
        'input[data-test-id="cf_type_of_service_textBox"]'
      ]
    },
    "Solutions": {
      kind: "dropdown",
      selectors: [
        'input[data-id="cf_solution_textBox"]',
        'input[data-test-id="cf_solution_textBox"]'
      ]
    },
    "Ticket Category": {
      kind: "dropdown",
      selectors: [
        'input[data-id="cf_ticket_category_textBox"]',
        'input[data-test-id="cf_ticket_category_textBox"]'
      ]
    },
    "Issue Category": {
      kind: "dropdown",
      selectors: [
        'input[data-id="cf_issue_category_textBox"]',
        'input[data-test-id="cf_issue_category_textBox"]'
      ]
    },
    "Issue Sub-Category": {
      kind: "dropdown",
      selectors: [
        'input[data-id="cf_issue_sub_category_textBox"]',
        'input[data-test-id="cf_issue_sub_category_textBox"]',
        '[data-test-id="cf_issue_sub_category_downIcon"]'
      ]
    },
    "Technology/Platform": {
      kind: "dropdown",
      selectors: [
        'input[data-id="cf_product_textBox"]',
        'input[data-test-id="cf_product_textBox"]'
      ]
    },
    "Severity Level": {
      kind: "dropdown",
      selectors: [
        'input[data-id="cf_severity_level_textBox"]',
        'input[data-test-id="cf_severity_level_textBox"]'
      ]
    },
    "Support Level": {
      kind: "dropdown",
      selectors: [
        '[data-id="cf_support_level"]',
        '[data-test-id="cf_support_level"]',
        '[data-id="cf_support_level"] [role="combobox"]',
        '[data-test-id="cf_support_level"] [role="combobox"]',
        'input[data-id="cf_support_level_textBox"]',
        'input[data-test-id="cf_support_level_textBox"]',
        '[data-id="cf_support_level"] input',
        '[data-test-id="cf_support_level"] input',
        '[data-id="cf_support_level"] button',
        '[data-test-id="cf_support_level"] button',
        '[data-id="cf_support_level"] [data-test-id$="_downIcon"]',
        '[data-test-id="cf_support_level"] [data-test-id$="_downIcon"]',
        '[aria-label*="Support Level" i]',
        '[role="combobox"][aria-label*="Support Level" i]'
      ]
    },
    "Support Agent": {
      kind: "dropdown",
      selectors: [
        '[data-id="support_agent"]',
        '[data-test-id="support_agent"]',
        '[data-id="support_agent"] [role="combobox"]',
        '[data-test-id="support_agent"] [role="combobox"]',
        'input[data-id="support_agent_textBox"]',
        'input[data-test-id="support_agent_textBox"]',
        '[data-id="support_agent"] input',
        '[data-test-id="support_agent"] input',
        '[data-id="support_agent"] button',
        '[data-test-id="support_agent"] button',
        '[data-id="support_agent"] [data-test-id$="_downIcon"]',
        '[data-test-id="support_agent"] [data-test-id$="_downIcon"]',
        'input[aria-labelledby="Support Agent"]',
        '[aria-label*="Support Agent" i]',
        '[role="combobox"][aria-label*="Support Agent" i]'
      ]
    },
    "Priority": {
      kind: "dropdown",
      selectors: [
        'input[data-id="priority_textBox"]',
        'input[data-test-id="priority_textBox"]',
        '[data-id="priority"] input',
        '[data-test-id="priority"] input'
      ]
    },
    "Serial Number": {
      kind: "text",
      selectors: [
        'input[data-id="serial_number"]',
        'input[data-test-id="serial_number"]',
        'input[data-id*="serial" i]',
        'input[data-test-id*="serial" i]',
        'input[aria-labelledby="Serial Number"]'
      ]
    },
    "Channel": {
      kind: "dropdown",
      selectors: [
        'input[data-id="channel_textBox"]',
        'input[aria-labelledby="Channel"]'
      ]
    },
    "Ticket Source": {
      kind: "dropdown",
      selectors: [
        'input[data-id="ticket_source_textBox"]',
        'input[aria-labelledby="Ticket Source"]'
      ]
    },
    "Issue Description": {
      kind: "text",
      selectors: [
        'textarea[data-id="property(cf_issue_description)"]',
        'textarea[data-test-id="property(cf_issue_description)"]',
        'textarea[aria-labelledby="Issue Description"]'
      ]
    },
    "SE's that can handle this ticket": {
      kind: "text",
      selectors: [
        'textarea[aria-labelledby="SE\'s that can handle this ticket"]',
        'input[aria-labelledby="SE\'s that can handle this ticket"]'
      ]
    },
    "PM/SD of this account": {
      kind: "text",
      selectors: [
        'textarea[aria-labelledby="PM/SD of this account"]',
        'input[aria-labelledby="PM/SD of this account"]'
      ]
    },
    "Viber Details/Zoho Comment on Ticket for initial troubleshooting": {
      kind: "text",
      selectors: [
        'textarea[aria-labelledby="Viber Details/Zoho Comment on Ticket for initial troubleshooting"]',
        'input[aria-labelledby="Viber Details/Zoho Comment on Ticket for initial troubleshooting"]'
      ]
    }
  };

  const TEXT_FIELD_LABELS = new Set([
    "Customer Company Name",
    "Account Name",
    "Contact Name",
    "Email",
    "Phone",
    "Mobile Number",
    "Subject",
    "Description",
    "Issue Description",
    "SE's that can handle this ticket",
    "PM/SD of this account",
    "Viber Details/Zoho Comment on Ticket for initial troubleshooting"
  ]);

  const DROPDOWN_FIELD_LABELS = new Set([
    "Department",
    "Account Name",
    "Status",
    "Ticket Owner",
    "Supported Portfolio",
    "Solutions",
    "Ticket Category",
    "Issue Category",
    "Issue Sub-Category",
    "Technology/Platform",
    "Severity Level",
    "Support Level",
    "Support Agent",
    "Priority",
    "Channel",
    "Ticket Source"
  ]);

  const FILL_ORDER = [
    "Department",
    "Account Name",
    "Contact Name",
    "Email",
    "Phone",
    "Mobile Number",
    "Customer Company Name",
    "Subject",
    "Description",
    "Status",
    "Ticket Owner",
    "Supported Portfolio",
    "Solutions",
    "Ticket Category",
    "Issue Category",
    "Issue Sub-Category",
    "Severity Level",
    "Support Level",
    "Issue Description",
    "Support Agent",
    "Priority",
    "Channel",
    "Ticket Source",
    "SE's that can handle this ticket",
    "PM/SD of this account",
    "Viber Details/Zoho Comment on Ticket for initial troubleshooting"
  ];

  const DESCRIPTION_RETRY_LABEL = "Description";
  const DESCRIPTION_FALLBACK_LABEL = "Issue Description";

  const READINESS_REQUIRED_DELAY_MS = 250;
  const READINESS_POLL_MS = 150;
  const FIELD_RETRY_ATTEMPTS = 4;
  const FIELD_RETRY_DELAY_MS = 250;
  const TEXT_INTERACTION_DELAY_MS = 20;
  const TEXT_POST_FILL_DELAY_MS = 40;
  const RICHTEXT_POST_FILL_DELAY_MS = 120;
  const DROPDOWN_OPEN_DELAY_MS = 220;
  const DROPDOWN_SEARCH_DELAY_MS = 250;
  const DROPDOWN_POST_SELECT_DELAY_MS = 120;
  const FIELD_POST_FILL_DELAY_MS = {
    text: 40,
    richtext: 120,
    dropdown: 120
  };
  const EXACT_DEFINITION_CONTROLS = new WeakSet();
  let autofillRunning = false;
  let pendingPayload = null;
  let queuedPayload = null;
  let autofillAutoStarted = false;
  let runtimeListenerInstalled = false;
  let bridgeInstalled = false;
  let panelAutoCloseTimer = 0;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function isZohoTicketPage() {
    const host = String(location.hostname || "").toLowerCase();
    return host === "helpcenter.amti.com.ph"
      || host.endsWith(".zoho.com")
      || host.endsWith(".zoho.com.ph");
  }

  function isMauWorkspacePage() {
    const host = location.hostname.toLowerCase();
    const path = location.pathname.toLowerCase();
    if ((host === "127.0.0.1" || host === "localhost") && location.port === "3000") return true;
    if (host === "dazabb.github.io" && path.startsWith("/zoho-ticket-assistant/")) return true;
    if (location.protocol === "file:" && /\/index\.html$/i.test(path)) {
      return !!document.getElementById("createZohoTicketBtn")
        && !!document.getElementById("chatBotContainer")
        && document.title.includes("MAU Operation Desk");
    }
    return false;
  }

  function installAssistantBridge() {
    if (bridgeInstalled || !isMauWorkspacePage() || !chrome?.runtime?.id || !window?.addEventListener) return;
    bridgeInstalled = true;

    window.addEventListener("message", (event) => {
      const data = event && event.data;
      if (event.source !== window || (location.protocol === "file:" ? event.origin !== "null" : event.origin !== location.origin) || !data || data.type !== BRIDGE_REQUEST_TYPE || !data.requestId) return;
      if (!new Set(["pingMauZohoExtension", ACTION_PREPARE_OR_FOCUS]).has(data.action)) return;

      chrome.runtime.sendMessage({
        type: data.action,
        ...(data.action === ACTION_PREPARE_OR_FOCUS ? (data.data || {}) : {})
      }, (response) => {
        const runtimeError = chrome.runtime.lastError;
        window.postMessage({
          type: BRIDGE_RESPONSE_TYPE,
          requestId: data.requestId,
          ok: !runtimeError && !!(response && response.ok),
          response: response || null,
          error: runtimeError ? runtimeError.message : response && response.error
        }, location.protocol === "file:" ? "*" : location.origin);
      });
    });
  }

  function getFieldSpeedClass(label, kind) {
    if (kind === "richtext" || label === DESCRIPTION_RETRY_LABEL) return "richtext";
    if (kind === "dropdown" || DROPDOWN_FIELD_LABELS.has(label)) return "dropdown";
    return "text";
  }

  function getRetryPolicy(label, kind) {
    const speedClass = getFieldSpeedClass(label, kind);
    if (speedClass === "text") {
      return { attempts: 2, delayMs: 120 };
    }
    if (speedClass === "richtext") {
      return { attempts: FIELD_RETRY_ATTEMPTS + 1, delayMs: FIELD_RETRY_DELAY_MS };
    }
    return { attempts: FIELD_RETRY_ATTEMPTS, delayMs: FIELD_RETRY_DELAY_MS };
  }

  function getPostFillDelay(label, kind) {
    return FIELD_POST_FILL_DELAY_MS[getFieldSpeedClass(label, kind)] || 0;
  }

  function decodePayload() {
    const rawHash = window.location.hash || "";
    if (!rawHash.includes(`${HASH_KEY}=`)) return null;

    const hash = rawHash.replace(/^#/, "");
    const params = new URLSearchParams(hash.replace(/^.*?zta=/, "zta="));
    let encoded = params.get(HASH_KEY);

    if (!encoded) {
      const match = rawHash.match(new RegExp(`${HASH_KEY}=([^&]+)`));
      encoded = match ? match[1] : "";
    }

    if (!encoded) return null;

    try {
      encoded = decodeURIComponent(encoded).replace(/-/g, "+").replace(/_/g, "/");
      while (encoded.length % 4) encoded += "=";
      const binary = atob(encoded);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (error) {
      panel(`Could not read Ticket Assistant payload: ${error.message}`, "error");
      return null;
    }
  }

  function acceptPayload(payload, source) {
    if (!payload || !payload.fields || !isZohoTicketPage()) return { ok: false, reason: "not a Zoho page" };

    pendingPayload = payload;
    ensurePanel();
    panel(`Payload received from ${source || "extension"}. Running script revision ${SCRIPT_REVISION}.`, "info");
    setPanelStatus("Payload loaded. Autofill will begin automatically after the Zoho form is ready.", "info");

    if (autofillRunning) {
      queuedPayload = payload;
      panel("Autofill is already running. Queued the latest payload to run next.", "info");
      return { ok: true, queued: true };
    }

    queuedPayload = null;
    setTimeout(() => {
      if (!autofillRunning && pendingPayload === payload) {
        runAutofill(payload);
      }
    }, 0);
    return { ok: true, queued: false };
  }

  function stripDiacritics(text) {
    return String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function normalize(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\*/g, "")
      .replace(/\u00a0/g, " ")
      .replace(/[\s\n\r\t]+/g, " ")
      .replace(/[ï¼š:]+$/g, "")
      .trim()
      .toLowerCase();
  }

  function looseNormalize(text) {
    return normalize(text).replace(/[^a-z0-9]+/g, "");
  }

  function normalizeHumanName(text) {
    return stripDiacritics(text).replace(/\u00a0/g, " ").replace(/[\s\n\r\t]+/g, " ").trim();
  }

  function isVisible(el) {
    if (!el || el.nodeType !== 1) return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function visibleText(el) {
    return String(el.innerText || el.textContent || el.getAttribute("aria-label") || el.getAttribute("title") || "").trim();
  }

  function describeElement(el) {
    if (!el) return "null";
    const tag = String(el.tagName || "node").toLowerCase();
    const dataId = el.getAttribute && el.getAttribute("data-id");
    const dataTestId = el.getAttribute && el.getAttribute("data-test-id");
    const role = el.getAttribute && el.getAttribute("role");
    const ariaLabel = el.getAttribute && el.getAttribute("aria-label");
    const text = visibleText(el).replace(/\s+/g, " ").slice(0, 80);
    return [
      tag,
      dataId ? `data-id=${dataId}` : "",
      dataTestId ? `data-test-id=${dataTestId}` : "",
      role ? `role=${role}` : "",
      ariaLabel ? `aria-label=${ariaLabel}` : "",
      text ? `text=${text}` : ""
    ].filter(Boolean).join(" | ");
  }

  function fieldValueAliases(label, value) {
    const raw = String(value || "").trim();
    const aliases = [raw];
    if (label === "Support Level" && normalize(raw) === normalize("Level 1.5")) {
      aliases.unshift("Level1.5");
      aliases.push("1.5");
    }
    if (label === "Issue Category" && normalize(raw).includes(normalize("Infrastructure ( Zadara Storage / Zadara Infrastructure / OS / Dell Server and Storage )"))) {
      aliases.push("Infrastructure");
      aliases.push("Infrastructure ( Zadara Storage / Zadara Infrastructure / OS / Dell Server and Storage");
      aliases.push("Zadara Infrastructure");
      aliases.push("Dell Server and Storage");
      aliases.push("Zadara Storage");
    }
    const unique = [];
    for (const item of aliases) {
      const normalizedItem = String(item || "").trim();
      if (normalizedItem && !unique.includes(normalizedItem)) unique.push(normalizedItem);
    }
    return unique;
  }

  function valueMatchesCandidate(text, candidate) {
    const normalizedText = normalize(text);
    const normalizedCandidate = normalize(candidate);
    const looseText = looseNormalize(text);
    const looseCandidate = looseNormalize(candidate);
    return normalizedText === normalizedCandidate
      || looseText === looseCandidate
      || normalizedText.includes(normalizedCandidate)
      || normalizedCandidate.includes(normalizedText);
  }

  function ensurePanel() {
    if (panelAutoCloseTimer) {
      clearTimeout(panelAutoCloseTimer);
      panelAutoCloseTimer = 0;
    }
    let box = document.getElementById(PANEL_ID);
    if (!box) {
      box = document.createElement("div");
      box.id = PANEL_ID;
      box.style.cssText = [
        "position: fixed",
        "right: 18px",
        "bottom: 18px",
        "z-index: 2147483647",
        "width: 330px",
        "max-height: 55vh",
        "overflow: auto",
        "font: 12px/1.35 Arial, sans-serif",
        "color: #172b4d",
        "background: #ffffff",
        "border: 1px solid #d0d7de",
        "border-radius: 10px",
        "box-shadow: 0 8px 26px rgba(0,0,0,.20)",
        "padding: 12px"
      ].join(";");
      box.innerHTML = '<strong style="display:block;margin-bottom:8px;font-size:13px;">Ticket Assistant Autofill</strong><div data-zta-status style="margin-bottom:8px;padding:6px 8px;border-radius:6px;background:#eef2ff;color:#172b4d;">Waiting for payload...</div><div data-zta-log></div><div data-zta-actions style="display:flex;gap:8px;margin-top:8px;"><button data-zta-close style="border:1px solid #d0d7de;background:#f6f8fa;border-radius:6px;padding:6px 10px;cursor:pointer;">Close</button></div>';
      document.documentElement.appendChild(box);
      box.querySelector("[data-zta-close]").addEventListener("click", () => box.remove());
    }

    return box;
  }

  function setPanelStatus(message, type) {
    const box = ensurePanel();
    const status = box.querySelector("[data-zta-status]");
    if (!status) return;

    status.textContent = message;
    status.style.background = type === "error" ? "#ffebe9" : type === "success" ? "#dafbe1" : "#eef2ff";
  }

  function panel(message, type) {
    const box = ensurePanel();

    const log = box.querySelector("[data-zta-log]");
    const div = document.createElement("div");
    div.style.margin = "5px 0";
    div.style.padding = "5px 7px";
    div.style.borderRadius = "6px";
    div.style.background = type === "error" ? "#ffebe9" : type === "success" ? "#dafbe1" : "#eef2ff";
    div.textContent = message;
    log.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function schedulePanelAutoClose(delayMs) {
    if (panelAutoCloseTimer) {
      clearTimeout(panelAutoCloseTimer);
    }
    panelAutoCloseTimer = window.setTimeout(() => {
      const box = document.getElementById(PANEL_ID);
      if (box) {
        box.remove();
      }
      panelAutoCloseTimer = 0;
    }, delayMs);
  }

  function firstVisible(selectors) {
    for (const selector of selectors || []) {
      const candidates = Array.from(document.querySelectorAll(selector))
        .filter((el) => !el.closest(`#${PANEL_ID}`))
        .filter(isVisible);
      if (candidates.length) return candidates[0];
    }
    return null;
  }

  function isInteractiveCandidate(el) {
    return !!(el && el.matches && el.matches([
      "input:not([type='hidden']):not([disabled])",
      "textarea:not([disabled])",
      "[contenteditable='true']",
      "[role='textbox']",
      "[role='combobox']",
      "lyte-drop-button",
      "[aria-haspopup='listbox']",
      "[data-test-id$='_downIcon']",
      "button"
    ].join(",")));
  }

  function extractInteractiveControl(node) {
    if (!node) return null;

    if (isInteractiveCandidate(node) && isVisible(node)) return node;

    const preferredSelectors = [
      "input:not([type='hidden']):not([disabled])",
      "[role='combobox']",
      "lyte-drop-button",
      "[aria-haspopup='listbox']",
      "[data-test-id$='_downIcon']",
      "textarea:not([disabled])",
      "[role='textbox']",
      "[contenteditable='true']",
      "button"
    ];

    for (const selector of preferredSelectors) {
      const found = Array.from(node.querySelectorAll ? node.querySelectorAll(selector) : [])
        .filter(isVisible)
        .find(Boolean);
      if (found) return found;
    }

    const trigger = node.closest && node.closest([
      "[role='combobox']",
      "lyte-drop-button",
      "[aria-haspopup='listbox']",
      "[data-selector-id='container']",
      "[data-selector-id='box']"
    ].join(","));
    if (trigger && isVisible(trigger)) return trigger;

    return isVisible(node) ? node : null;
  }

  function hasWritableEditor(control) {
    if (!control) return false;
    if (control.matches && control.matches("textarea, input")) return true;
    const body = getEditorBody(control);
    if (!body) return false;
    if (body.tagName === "BODY") return true;
    return isVisible(body) || body.isContentEditable || body.getAttribute("contenteditable") === "true";
  }

  function isFormSufficientlyLoaded() {
    const visibleInputs = Array.from(
      document.querySelectorAll("input:not([type='hidden']), select, textarea, [role='combobox'], [role='textbox']")
    )
      .filter(isVisible)
      .filter((el) => !el.closest(`#${PANEL_ID}`));

    if (visibleInputs.length < 5) return false;

    const subject = firstVisible([
      'input[data-id="subject"]',
      'input[data-test-id="subject"]',
      '[aria-label*="Subject" i]',
      'input[placeholder*="Subject" i]'
    ]);

    return !!subject && document.readyState === "complete";
  }

  function findLabelElement(labelText) {
    const target = normalize(labelText);
    const looseTarget = looseNormalize(labelText);
    const selector = [
      "label",
      "span",
      "div",
      "p",
      "td",
      "th",
      "strong",
      "b",
      "lyte-label",
      "[class*='label' i]",
      "[data-label]",
      "[aria-label]"
    ].join(",");

    const candidates = Array.from(document.querySelectorAll(selector))
      .filter(isVisible)
      .filter((el) => !el.closest(`#${PANEL_ID}`))
      .filter((el) => visibleText(el).length <= Math.max(90, labelText.length + 20));

    let exact = candidates.find((el) => normalize(visibleText(el)) === target);
    if (exact) return exact;

    exact = candidates.find((el) => looseNormalize(visibleText(el)) === looseTarget);
    if (exact) return exact;

    return candidates.find((el) => {
      const text = normalize(visibleText(el));
      return text.startsWith(target) || target.startsWith(text);
    }) || null;
  }

  function ancestorList(el) {
    const list = [];
    let node = el;
    for (let i = 0; node && i < 8; i += 1) {
      list.push(node);
      node = node.parentElement;
    }
    return list;
  }

  function controlCandidates(root) {
    if (!root) return [];
    const selector = [
      "input:not([type='hidden']):not([disabled])",
      "textarea:not([disabled])",
      "[contenteditable='true']",
      "iframe",
      "[role='textbox']",
      "[role='combobox']",
      "[aria-haspopup='listbox']",
      "lyte-dropdown",
      "lyte-drop-button",
      "[class*='dropdown' i]",
      "[class*='select' i]",
      "[class*='lookup' i]",
      "[class*='picklist' i]"
    ].join(",");
    return Array.from(root.querySelectorAll(selector))
      .map(extractInteractiveControl)
      .filter(Boolean)
      .filter(isVisible)
      .filter((el, index, list) => list.indexOf(el) === index);
  }

  function findControlFromLabel(labelEl) {
    const ancestors = ancestorList(labelEl);

    for (const root of ancestors) {
      const candidates = controlCandidates(root)
        .filter((el) => el !== labelEl)
        .filter((el) => !el.closest(`#${PANEL_ID}`));
      if (candidates.length) {
        const labelRect = labelEl.getBoundingClientRect();
        candidates.sort((a, b) => {
          const ar = a.getBoundingClientRect();
          const br = b.getBoundingClientRect();
          const ad = Math.abs(ar.left - labelRect.left) + Math.abs(ar.top - labelRect.bottom);
          const bd = Math.abs(br.left - labelRect.left) + Math.abs(br.top - labelRect.bottom);
          return ad - bd;
        });
        return candidates[0];
      }
    }

    return null;
  }

  function findSectionRoot(labelEl) {
    const ancestors = ancestorList(labelEl);
    return ancestors.find((node) => {
      const text = normalize(visibleText(node));
      return text.includes(normalize("Additional Information")) || text.includes(normalize("Support Agent")) || text.includes(normalize("Support Level"));
    }) || null;
  }

  function findControlInSection(label, labelEl) {
    const sectionRoot = findSectionRoot(labelEl);
    if (!sectionRoot) return null;

    const candidates = controlCandidates(sectionRoot)
      .filter((el) => el !== labelEl)
      .filter((el) => !el.closest(`#${PANEL_ID}`));
    if (!candidates.length) return null;

    const labelRect = labelEl.getBoundingClientRect();
    candidates.sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const scoreA = Math.abs(ar.top - labelRect.bottom) + Math.abs(ar.left - labelRect.left);
      const scoreB = Math.abs(br.top - labelRect.bottom) + Math.abs(br.left - labelRect.left);
      return scoreA - scoreB;
    });

    const match = candidates[0] || null;
    if (match) {
      panel(`Resolved ${label} from section fallback: ${describeElement(match)}`, "info");
    }
    return match;
  }

  function resolveDefinitionControl(label) {
    const definition = FIELD_DEFINITIONS[label];
    if (!definition) return null;

    for (const selector of definition.selectors || []) {
      const candidates = Array.from(document.querySelectorAll(selector))
        .filter((el) => !el.closest(`#${PANEL_ID}`))
        .filter(isVisible);
      for (const candidate of candidates) {
        const resolved = extractInteractiveControl(candidate);
        if (resolved && isVisible(resolved)) {
          EXACT_DEFINITION_CONTROLS.add(resolved);
          if (label === "Support Level" || label === "Support Agent") {
            panel(`Resolved ${label} using selector ${selector}: ${describeElement(resolved)}`, "info");
          }
          return resolved;
        }
      }
    }

    return null;
  }

  function findControl(label) {
    const direct = resolveDefinitionControl(label);
    if (direct) return direct;
    if (STRICT_DEFINITION_ONLY_LABELS.has(label) && label !== "Support Level" && label !== "Support Agent") return null;

    const labelEl = findLabelElement(label);
    if (!labelEl) return null;
    const fromLabel = findControlFromLabel(labelEl);
    if (fromLabel) {
      if (label === "Support Level" || label === "Support Agent") {
        panel(`Resolved ${label} from label fallback: ${describeElement(fromLabel)}`, "info");
      }
      return fromLabel;
    }
    if (label === "Support Level" || label === "Support Agent") {
      return findControlInSection(label, labelEl);
    }
    return null;
  }

  function setNativeValue(el, value) {
    const proto = Object.getPrototypeOf(el);
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    if (descriptor && descriptor.set) descriptor.set.call(el, value);
    else el.value = value;
  }

  function dispatchInput(el) {
    ["input", "change", "keyup", "blur"].forEach((eventName) => {
      el.dispatchEvent(new Event(eventName, { bubbles: true }));
    });
  }

  function fireMouseEvents(el) {
    ["mousedown", "mouseup", "click"].forEach((type) => {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
    });
  }

  function fireInputEvents(el) {
    ["input", "change", "keyup"].forEach((type) => {
      el.dispatchEvent(new Event(type, { bubbles: true }));
    });
  }

  function controlTextSnapshot(control) {
    if (!control) return "";

    const values = [];
    const pushValue = (item) => {
      if (!item) return;
      if (typeof item.value === "string") values.push(item.value);
      values.push(visibleText(item));
      const ariaLabel = item.getAttribute && item.getAttribute("aria-label");
      const title = item.getAttribute && item.getAttribute("title");
      if (ariaLabel) values.push(ariaLabel);
      if (title) values.push(title);
    };

    pushValue(control);
    pushValue(extractInteractiveControl(control));

    let node = control;
    for (let i = 0; node && i < 4; i += 1) {
      pushValue(node);
      node = node.parentElement;
    }

    return values.join(" ").trim();
  }

  function controlContextSnapshot(control) {
    const parts = [];
    let node = control;
    for (let i = 0; node && i < 5; i += 1) {
      parts.push(visibleText(node));
      const ariaLabel = node.getAttribute && node.getAttribute("aria-label");
      const title = node.getAttribute && node.getAttribute("title");
      const dataTestId = node.getAttribute && node.getAttribute("data-test-id");
      const dataId = node.getAttribute && node.getAttribute("data-id");
      if (ariaLabel) parts.push(ariaLabel);
      if (title) parts.push(title);
      if (dataTestId) parts.push(dataTestId);
      if (dataId) parts.push(dataId);
      node = node.parentElement;
    }
    return normalize(parts.join(" "));
  }

  function isInsideProtectedField(control) {
    if (!control) return false;
    for (const protectedLabel of PROTECTED_FIELD_LABELS) {
      const protectedControl = resolveDefinitionControl(protectedLabel);
      if (protectedControl && (protectedControl === control || protectedControl.contains?.(control) || control.contains?.(protectedControl))) {
        return true;
      }
      const context = controlContextSnapshot(control);
      if (context.includes(normalize(protectedLabel))) {
        return true;
      }
    }
    return false;
  }

  function isValidResolvedControl(label, control) {
    if (!control) return false;
    const context = controlContextSnapshot(control);
    const exactMatch = EXACT_DEFINITION_CONTROLS.has(control);
    if (PROTECTED_FIELD_LABELS.has(label)) return true;
    if (isInsideProtectedField(control)) return false;
    if (exactMatch) return true;
    if (label === "Priority") {
      if (!context.includes("priority")) return false;
      if (context.includes("serial number")) return false;
    }
    if (label === "Ticket Category") {
      if (!context.includes("ticket category")) return false;
      if (context.includes("serial number")) return false;
    }
    return true;
  }

  function snapshotProtectedField(label) {
    const control = findControl(label);
    const interactive = extractInteractiveControl(control) || control;
    if (!interactive) return { control: null, value: "" };
    const value = interactive.matches && interactive.matches("input, textarea")
      ? String(interactive.value || "")
      : controlTextSnapshot(interactive);
    return { control: interactive, value };
  }

  function protectedFieldChanged(beforeSnapshot, afterSnapshot) {
    if (!beforeSnapshot || !afterSnapshot) return false;
    return String(beforeSnapshot.value || "") !== String(afterSnapshot.value || "");
  }

  async function clearProtectedField(label) {
    const control = findControl(label);
    const interactive = extractInteractiveControl(control) || control;
    if (!interactive || !interactive.matches || !interactive.matches("input, textarea")) {
      return { ok: false, reason: "field not writable" };
    }

    const currentValue = String(interactive.value || "");
    if (!currentValue.trim()) {
      return { ok: true, cleared: false };
    }

    interactive.focus();
    setNativeValue(interactive, "");
    dispatchInput(interactive);
    await sleep(TEXT_POST_FILL_DELAY_MS);
    return { ok: String(interactive.value || "") === "", cleared: true };
  }

  function findActiveDropdownPopup(triggerControl) {
    const rect = triggerControl.getBoundingClientRect();
    const selectors = [
      "lyte-drop-box",
      "lyte-drop-body",
      "lyte-drop-list",
      "[role='listbox']",
      "[role='menu']",
      "[class*='dropdown' i]",
      "[class*='listbox' i]"
    ];

    const popups = Array.from(document.querySelectorAll(selectors.join(",")))
      .filter(isVisible)
      .filter((el) => !el.closest(`#${PANEL_ID}`));

    if (!popups.length) return null;

    popups.sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const ad = Math.abs(ar.left - rect.left) + Math.abs(ar.top - rect.bottom);
      const bd = Math.abs(br.left - rect.left) + Math.abs(br.top - rect.bottom);
      return ad - bd;
    });

    return popups[0] || null;
  }

  function findPopupSearchInput(popupRoot, triggerControl) {
    const scopes = [popupRoot, triggerControl && triggerControl.closest && triggerControl.closest("lyte-drop-box, lyte-drop-body, [role='listbox'], [role='menu']")].filter(Boolean);
    for (const scope of scopes) {
      const input = Array.from(scope.querySelectorAll("input:not([type='hidden']):not([disabled]):not([readonly])"))
        .filter(isVisible)
        .filter((el) => !el.closest(`#${PANEL_ID}`))
        .find(Boolean);
      if (input) return input;
    }
    return null;
  }

  function plainTextToHtml(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map((line) => line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"))
      .map((line) => `<div>${line || "<br>"}</div>`)
      .join("");
  }

  function getEditorBody(container) {
    if (!container) return null;
    if (container.tagName === "IFRAME") {
      try {
        return container.contentDocument && container.contentDocument.body;
      } catch (error) {
        return null;
      }
    }

    const iframe = container.matches && container.matches("iframe")
      ? container
      : container.querySelector && container.querySelector("iframe.KB_Editor_iframe");
    if (iframe) {
      try {
        return iframe.contentDocument && iframe.contentDocument.body;
      } catch (error) {
        return null;
      }
    }

    if (container.isContentEditable || container.getAttribute("contenteditable") === "true") {
      return container;
    }

    const editable = container.querySelector && container.querySelector('[contenteditable="true"]');
    return editable || null;
  }

  function richTextContainsValue(control, value) {
    const cleanValue = String(value || "").trim();
    if (!cleanValue) return false;

    if (control && control.matches && control.matches("textarea, input")) {
      return String(control.value || "").includes(cleanValue);
    }

    const body = getEditorBody(control);
    if (!body) return false;

    const text = String(body.innerText || body.textContent || "").replace(/\s+/g, " ").trim();
    const normalizedValue = cleanValue.replace(/\s+/g, " ").trim();
    return text.includes(normalizedValue);
  }

  async function fillFinalDescription(control, value) {
    if (!control || !String(value || "").trim()) return false;

    if (control.matches && control.matches("textarea, input")) {
      if (!await setTextLike(control, value)) return false;
      await sleep(RICHTEXT_POST_FILL_DELAY_MS);

      const upgraded = findControl(DESCRIPTION_RETRY_LABEL);
      if (upgraded && upgraded !== control && getEditorBody(upgraded)) {
        if (!await setTextLike(upgraded, value)) return false;
        await sleep(RICHTEXT_POST_FILL_DELAY_MS);
        return richTextContainsValue(upgraded, value);
      }

      return richTextContainsValue(control, value);
    }

    if (!await setTextLike(control, value)) return false;
    await sleep(RICHTEXT_POST_FILL_DELAY_MS);
    return richTextContainsValue(control, value);
  }

  async function setRichTextLike(control, value) {
    if (!control || !String(value || "").trim()) return false;
    control.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(TEXT_INTERACTION_DELAY_MS);

    const body = getEditorBody(control);
    if (!body) return false;

    body.focus();
    body.innerHTML = plainTextToHtml(value);
    dispatchInput(body);
    body.dispatchEvent(new KeyboardEvent("keyup", { key: " ", code: "Space", bubbles: true }));
    return true;
  }

  async function setTextLike(control, value) {
    if (!control || !String(value || "").trim()) return false;
    control.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(TEXT_INTERACTION_DELAY_MS);

    if (await setRichTextLike(control, value)) return true;

    if (control.tagName === "IFRAME") {
      try {
        const body = control.contentDocument && control.contentDocument.body;
        if (body) {
          body.innerHTML = plainTextToHtml(value);
          dispatchInput(body);
          return true;
        }
      } catch (error) {}
    }

    if (control.isContentEditable || control.getAttribute("contenteditable") === "true" || control.getAttribute("role") === "textbox") {
      control.focus();
      control.innerHTML = plainTextToHtml(value);
      dispatchInput(control);
      return true;
    }

    if (control.matches && (control.matches("textarea") || control.matches("input"))) {
      control.focus();
      setNativeValue(control, value);
      dispatchInput(control);
      return true;
    }

    return false;
  }

  function findVisibleOptions(value, root, label) {
    const scope = root || document;
    const aliases = fieldValueAliases(label, value);
    const prioritySelectors = [
      "lyte-drop-item",
      "[role='option']",
      "[role='menuitem']",
      ".lyteDropdownItem",
      "[data-value]",
      "li[class*='item' i]",
      "li[class*='option' i]"
    ];

    for (const selector of prioritySelectors) {
      const matches = Array.from(scope.querySelectorAll(selector))
        .filter(isVisible)
        .filter((el) => !el.closest(`#${PANEL_ID}`))
        .filter((el) => aliases.some((candidate) => valueMatchesCandidate(visibleText(el), candidate)));
      if (matches.length) {
        return matches.sort((a, b) => optionMatchScore(b, value, label) - optionMatchScore(a, value, label));
      }
    }

    return Array.from(scope.querySelectorAll("li, div, span, td, a"))
      .filter(isVisible)
      .filter((el) => !el.closest(`#${PANEL_ID}`))
      .filter((el) => visibleText(el).length <= Math.max(140, String(value).length + 60))
      .filter((el) => aliases.some((candidate) => valueMatchesCandidate(visibleText(el), candidate)))
      .sort((a, b) => optionMatchScore(b, value, label) - optionMatchScore(a, value, label));
  }

  function optionMatchScore(optionEl, value, label) {
    const text = visibleText(optionEl);
    const aliases = fieldValueAliases(label, value);
    const dataValue = optionEl.getAttribute && optionEl.getAttribute("data-value");
    for (const candidate of aliases) {
      const normalizedText = normalize(text);
      const normalizedCandidate = normalize(candidate);
      const looseText = looseNormalize(text);
      const looseCandidate = looseNormalize(candidate);
      const normalizedDataValue = normalize(dataValue || "");
      if (normalizedText === normalizedCandidate) return 600;
      if (looseText === looseCandidate) return 500;
      if (normalizedDataValue && normalizedDataValue === normalizedCandidate) return 400;
      if (normalizedText.startsWith(normalizedCandidate)) return 300;
      if (normalizedText.includes(normalizedCandidate)) return 200;
      if (normalizedCandidate.includes(normalizedText)) return 100;
    }
    return 0;
  }

  async function clickBestOption(value, roots, label) {
    const scopes = (roots && roots.length ? roots : [document]).filter(Boolean);
    for (const scope of scopes) {
      const options = findVisibleOptions(value, scope, label);
      if (!options.length) continue;
      options[0].scrollIntoView({ block: "center", inline: "nearest" });
      options[0].click();
      await sleep(DROPDOWN_POST_SELECT_DELAY_MS);
      return true;
    }
    return false;
  }

  function findNearestNewInput(triggerControl, root) {
    const scope = root || document;
    const controlRect = triggerControl.getBoundingClientRect();
    const inputs = Array.from(scope.querySelectorAll("input:not([type='hidden']):not([disabled]):not([readonly])"))
      .filter(isVisible)
      .filter((el) => !el.closest(`#${PANEL_ID}`))
      .filter((el) => el !== triggerControl);

    inputs.sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const ad = Math.abs(ar.left - controlRect.left) + Math.abs(ar.top - controlRect.bottom);
      const bd = Math.abs(br.left - controlRect.left) + Math.abs(br.top - controlRect.bottom);
      return ad - bd;
    });

    return inputs[0] || null;
  }

  async function clickOptionByDataValue(value, roots, label) {
    const aliases = fieldValueAliases(label, value);
    const scopes = (roots && roots.length ? roots : [document]).filter(Boolean);

    for (const scope of scopes) {
      const match = Array.from(scope.querySelectorAll("[data-value]"))
        .filter(isVisible)
        .filter((el) => !el.closest(`#${PANEL_ID}`))
        .find((el) => {
          const dataValue = normalize(el.getAttribute("data-value") || "");
          return aliases.some((candidate) => {
            const normalizedCandidate = normalize(candidate);
            const looseCandidate = looseNormalize(candidate);
            return dataValue === normalizedCandidate
              || dataValue.includes(normalizedCandidate)
              || looseNormalize(dataValue) === looseCandidate;
          });
        });
      if (!match) continue;
      match.scrollIntoView({ block: "center", inline: "nearest" });
      match.click();
      await sleep(DROPDOWN_POST_SELECT_DELAY_MS);
      return true;
    }

    return false;
  }

  function verifyDropdownSelection(control, value, popupRoot, label) {
    const aliases = fieldValueAliases(label, value);
    const controlText = normalize(controlTextSnapshot(control));
    if (aliases.some((candidate) => normalize(candidate) === normalize("Sandz Support L1.5"))) {
      if (aliases.some((candidate) => controlText.includes(normalize(candidate))) && !controlText.includes(normalize("unassigned"))) {
        return true;
      }
    } else if (label === "Issue Category") {
      if (
        controlText
        && controlText !== "-none-"
        && aliases.some((candidate) => valueMatchesCandidate(controlText, candidate) || normalize(controlText).includes(normalize(candidate)))
      ) {
        return true;
      }
    } else if (label === "Support Level") {
      if (aliases.some((candidate) => valueMatchesCandidate(controlText, candidate))) {
        return true;
      }
    } else if (controlText && controlText !== "-none-" && aliases.some((candidate) => valueMatchesCandidate(controlText, candidate))) {
      return true;
    }

    const popupScopes = [popupRoot, document].filter(Boolean);
    for (const scope of popupScopes) {
      const selected = Array.from(scope.querySelectorAll(
        "lyte-drop-item[data-selected='true'], [class*='highlighted' i][role='option'], [aria-selected='true'], [role='option'][aria-selected='true']"
      ))
        .filter(isVisible)
        .find((el) => {
          const text = visibleText(el);
          if (aliases.some((candidate) => normalize(candidate) === normalize("Sandz Support L1.5"))) {
            return aliases.some((candidate) => normalize(text).includes(normalize(candidate)));
          }
          if (label === "Issue Category") {
            return aliases.some((candidate) => valueMatchesCandidate(text, candidate) || normalize(text).includes(normalize(candidate)));
          }
          return aliases.some((candidate) => valueMatchesCandidate(text, candidate));
        });
      if (selected) return true;
    }

    let node = control;
    for (let i = 0; node && i < 4; i += 1) {
      const text = normalize(controlTextSnapshot(node));
      if (text && text !== "-none-" && aliases.some((candidate) => valueMatchesCandidate(text, candidate))) {
        return true;
      }
      node = node.parentElement;
    }

    return false;
  }

  async function navigateToOption(control, value, popupRoot, label, maxSteps = 20) {
    const aliases = fieldValueAliases(label, value);
    for (let i = 0; i < maxSteps; i += 1) {
      control.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", code: "ArrowDown", bubbles: true }));
      await sleep(TEXT_INTERACTION_DELAY_MS);

      const focused = document.activeElement;
      if (focused && aliases.some((candidate) => valueMatchesCandidate(visibleText(focused), candidate))) {
        focused.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
        if (typeof focused.click === "function") focused.click();
        await sleep(DROPDOWN_POST_SELECT_DELAY_MS);
        if (verifyDropdownSelection(control, value, popupRoot, label)) return true;
      }

      const highlighted = (popupRoot || document).querySelector(
        "lyte-drop-item[data-selected='true'], [class*='highlighted' i][role='option'], [aria-selected='true']"
      );
      if (highlighted && aliases.some((candidate) => valueMatchesCandidate(visibleText(highlighted), candidate))) {
        highlighted.click();
        await sleep(DROPDOWN_POST_SELECT_DELAY_MS);
        if (verifyDropdownSelection(control, value, popupRoot, label)) return true;
      }
    }
    return false;
  }

  function sampleVisibleOptions(root, limit = 6) {
    const scope = root || document;
    return Array.from(scope.querySelectorAll("lyte-drop-item, [role='option'], [role='menuitem'], li, div"))
      .filter(isVisible)
      .filter((el) => !el.closest(`#${PANEL_ID}`))
      .map((el) => visibleText(el).replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .filter((text, index, list) => list.indexOf(text) === index)
      .slice(0, limit);
  }

  function dropdownFailureReason(trigger, value, popupRoot, label) {
    const currentValue = controlTextSnapshot(trigger);
    const popupValue = popupRoot ? visibleText(popupRoot).slice(0, 140) : "";
    const options = sampleVisibleOptions(popupRoot || document).join(" | ");
    const aliases = fieldValueAliases(label, value).join(" / ");
    if (currentValue && normalize(currentValue) !== "-none-") {
      return `dropdown option not found (aliases: ${aliases}; current: ${currentValue}${options ? `; options: ${options}` : ""})`;
    }
    if (popupValue) {
      return `dropdown option not found (aliases: ${aliases}; popup: ${popupValue}${options ? `; options: ${options}` : ""})`;
    }
    return `dropdown option not found (aliases: ${aliases}${options ? `; options: ${options}` : ""})`;
  }

  async function setDropdownLike(control, value, options) {
    if (!control || !String(value || "").trim()) return { ok: false, reason: "empty" };
    const strictMode = !!(options && options.strictMode);
    const label = options && options.label;
    const trigger = extractInteractiveControl(control) || control;
    if (!isValidResolvedControl(label, trigger)) {
      return { ok: false, reason: "resolved control rejected" };
    }
    if (label === "Support Level" || label === "Support Agent") {
      panel(`Preparing ${label}: ${describeElement(trigger)}`, "info");
    }
    trigger.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(TEXT_POST_FILL_DELAY_MS);

    fireMouseEvents(trigger);
    if (typeof trigger.focus === "function") trigger.focus();
    await sleep(DROPDOWN_OPEN_DELAY_MS);

    let popupRoot = findActiveDropdownPopup(trigger);
    if (strictMode && !popupRoot) {
      return { ok: false, reason: "dropdown popup not detected" };
    }
    if (label === "Support Level" || label === "Support Agent") {
      panel(`${label} popup ${popupRoot ? "detected" : "not detected"}${popupRoot ? `: ${describeElement(popupRoot)}` : ""}`, popupRoot ? "info" : "error");
    }
    const searchInput = strictMode
      ? findPopupSearchInput(popupRoot, trigger)
      : (findNearestNewInput(trigger, popupRoot) || findNearestNewInput(trigger));
    if (searchInput) {
      searchInput.focus();
      for (const variant of fieldValueAliases(label, value)) {
        setNativeValue(searchInput, variant);
        fireInputEvents(searchInput);
        await sleep(DROPDOWN_SEARCH_DELAY_MS);
        popupRoot = findActiveDropdownPopup(trigger) || popupRoot;
        if (label === "Support Level" || label === "Support Agent") {
          panel(`${label} search variant: ${variant}`, "info");
        }
        if (await clickBestOption(value, [popupRoot, document], label)) {
          await sleep(DROPDOWN_POST_SELECT_DELAY_MS);
          if (verifyDropdownSelection(trigger, value, popupRoot, label)) return { ok: true };
        }
      }
    }

    popupRoot = findActiveDropdownPopup(trigger) || popupRoot;
    if (await clickBestOption(value, [popupRoot, document], label)) {
      await sleep(DROPDOWN_POST_SELECT_DELAY_MS);
      if (verifyDropdownSelection(trigger, value, popupRoot, label)) return { ok: true };
    }

    popupRoot = findActiveDropdownPopup(trigger) || popupRoot;
    if (await clickOptionByDataValue(value, [popupRoot, document], label)) {
      await sleep(DROPDOWN_POST_SELECT_DELAY_MS);
      if (verifyDropdownSelection(trigger, value, popupRoot, label)) return { ok: true };
    }

    popupRoot = findActiveDropdownPopup(trigger) || popupRoot;
    if (await navigateToOption(trigger, value, popupRoot, label)) return { ok: true };

    return { ok: false, reason: dropdownFailureReason(trigger, value, popupRoot, label) };
  }

  async function waitForInteractiveControl(label, attempts, delayMs) {
    const maxAttempts = attempts || FIELD_RETRY_ATTEMPTS;
    const retryDelay = delayMs == null ? FIELD_RETRY_DELAY_MS : delayMs;
    let lastControl = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      lastControl = findControl(label);
      const resolved = extractInteractiveControl(lastControl);
      if (resolved && isVisible(resolved)) return resolved;
      if (attempt < maxAttempts) await sleep(retryDelay);
    }

    return extractInteractiveControl(lastControl) || lastControl;
  }

  function detectZohoLoggedInSupportAgent() {
    const selectors = [
      '[data-zsqa="user-name"]',
      '[data-test-id*="user-name" i]',
      '[data-test-id*="profile-name" i]',
      '[class*="user-name" i]',
      '[class*="profile-name" i]',
      '[class*="account-name" i]',
      '[aria-label*="signed in" i]',
      '[title*="@" i]'
    ];

    for (const selector of selectors) {
      const match = Array.from(document.querySelectorAll(selector))
        .filter((el) => !el.closest(`#${PANEL_ID}`))
        .map((el) => normalizeHumanName(visibleText(el) || el.getAttribute("title") || el.getAttribute("aria-label") || ""))
        .find((text) => text && text.split(" ").length >= 2 && !/@/.test(text));
      if (match) return match;
    }

    return "";
  }

  function getFieldValue(payload, label) {
    if (!payload || !payload.fields) return "";
    if (label === DESCRIPTION_RETRY_LABEL) {
      return String(
        payload.fields[DESCRIPTION_FALLBACK_LABEL]
        || payload.fields[DESCRIPTION_RETRY_LABEL]
        || ""
      ).trim();
    }
    if (label === "Support Level") {
      const value = String(payload.fields[label] || "").trim();
      return value || "Level 1.5";
    }
    if (label === "Support Agent") {
      const value = normalizeHumanName(payload.fields[label] || "");
      return value || detectZohoLoggedInSupportAgent();
    }
    return String(payload.fields[label] || "").trim();
  }

  async function fillLabel(label, value) {
    const cleanValue = String(value || "").trim();
    if (!cleanValue) return { skipped: true, reason: "empty" };

    const kind = FIELD_DEFINITIONS[label] && FIELD_DEFINITIONS[label].kind;
    const shouldText = kind === "text" || kind === "richtext" || TEXT_FIELD_LABELS.has(label);
    const shouldDropdown = kind === "dropdown" || DROPDOWN_FIELD_LABELS.has(label);
    const retryPolicy = getRetryPolicy(label, kind);
    let lastDropdownReason = "";
    let control = null;

    for (let attempt = 1; attempt <= retryPolicy.attempts; attempt += 1) {
      control = control && isVisible(control) ? control : findControl(label);
      if (!control && shouldDropdown) {
        control = await waitForInteractiveControl(label, Math.min(2, retryPolicy.attempts), retryPolicy.delayMs);
      }
      if (control && !isValidResolvedControl(label, control)) {
        panel(`Rejected candidate for ${label}: matched protected or unrelated field context.`, "error");
        control = null;
      }
      if (!control) {
        if (attempt < retryPolicy.attempts) {
          await sleep(retryPolicy.delayMs);
          continue;
        }
        if (label === "Support Level" || label === "Support Agent") {
          panel(`Failed to resolve ${label}: no usable control found after ${retryPolicy.attempts} attempt(s).`, "error");
        }
        return { ok: false, reason: "field not found" };
      }

      if (kind === "richtext") {
        if (!hasWritableEditor(control)) {
          if (attempt < retryPolicy.attempts) {
            control = null;
            await sleep(retryPolicy.delayMs);
            continue;
          }
          return { ok: false, reason: "field not ready" };
        }
        if (await fillFinalDescription(control, cleanValue)) return { ok: true };
      }

      if (kind === "dropdown" || shouldDropdown) {
        const protectSerialNumber = label === "Priority" || label === "Ticket Category";
        const serialSnapshotBefore = protectSerialNumber ? snapshotProtectedField("Serial Number") : null;
        const dropdownResult = await setDropdownLike(control, cleanValue, { strictMode: STRICT_DROPDOWN_LABELS.has(label), label });
        if (dropdownResult.ok) {
          const serialSnapshotAfter = protectSerialNumber ? snapshotProtectedField("Serial Number") : null;
          if (protectSerialNumber && protectedFieldChanged(serialSnapshotBefore, serialSnapshotAfter)) {
            return { ok: false, reason: `${normalize(label)} wrote into protected field` };
          }
          if ((label === "Priority" || label === "Ticket Category" || label === "Severity Level" || label === "Support Level")
            && !verifyDropdownSelection(control, cleanValue, null, label)) {
            return { ok: false, reason: `${normalize(label)} verification failed` };
          }
          return { ok: true };
        }
        lastDropdownReason = dropdownResult.reason || lastDropdownReason || "dropdown option not found";
        if (!STRICT_DROPDOWN_LABELS.has(label) && await setTextLike(control, cleanValue)) return { ok: true };
      }

      if (shouldText) {
        if (await setTextLike(control, cleanValue)) return { ok: true };
        const dropdownResult = await setDropdownLike(control, cleanValue, { strictMode: STRICT_DROPDOWN_LABELS.has(label), label });
        if (dropdownResult.ok) return { ok: true };
        lastDropdownReason = dropdownResult.reason || lastDropdownReason || "dropdown option not found";
      }

      if (!STRICT_DROPDOWN_LABELS.has(label) && await setTextLike(control, cleanValue)) return { ok: true };
      const finalDropdownResult = await setDropdownLike(control, cleanValue, { strictMode: STRICT_DROPDOWN_LABELS.has(label), label });
      if (finalDropdownResult.ok) return { ok: true };
      lastDropdownReason = finalDropdownResult.reason || lastDropdownReason || "dropdown option not found";

      control = null;
      if (attempt < retryPolicy.attempts) {
        await sleep(retryPolicy.delayMs);
        continue;
      }
    }

    if (shouldDropdown || kind === "dropdown") {
      return { ok: false, reason: lastDropdownReason || "dropdown option not found" };
    }
    return { ok: false, reason: "unsupported field type" };
  }

  async function fillDescriptionWithRetry(payload) {
    const descriptionValue = getFieldValue(payload, DESCRIPTION_RETRY_LABEL);
    if (!descriptionValue) return { skipped: true, reason: "empty" };

    const attempts = FIELD_RETRY_ATTEMPTS + 2;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const control = findControl(DESCRIPTION_RETRY_LABEL);
      if (control && hasWritableEditor(control) && await fillFinalDescription(control, descriptionValue)) {
        return { ok: true };
      }
      if (attempt < attempts) await sleep(FIELD_RETRY_DELAY_MS);
    }

    return { ok: false, reason: "field not ready" };
  }

  async function waitForTicketForm(timeoutMs) {
    const started = Date.now();
    let readySince = 0;

    const isStableReady = () => {
      if (!isFormSufficientlyLoaded()) {
        readySince = 0;
        return false;
      }
      if (!readySince) readySince = Date.now();
      return Date.now() - readySince >= READINESS_REQUIRED_DELAY_MS;
    };

    if (isStableReady()) return true;

    return new Promise((resolve) => {
      let settled = false;
      const root = document.documentElement || document.body;
      let intervalId = null;
      let timeoutId = null;
      let observer = null;

      const cleanup = () => {
        if (observer) observer.disconnect();
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        document.removeEventListener("readystatechange", checkReadiness, true);
        window.removeEventListener("load", checkReadiness, true);
      };

      const finish = (result) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(result);
      };

      function checkReadiness() {
        if (isStableReady()) {
          finish(true);
        }
      }

      observer = new MutationObserver(() => {
        checkReadiness();
      });
      if (root) {
        observer.observe(root, {
          childList: true,
          subtree: true,
          attributes: true
        });
      }

      intervalId = window.setInterval(() => {
        if (Date.now() - started >= timeoutMs) {
          finish(false);
          return;
        }
        checkReadiness();
      }, READINESS_POLL_MS);
      timeoutId = window.setTimeout(() => finish(false), timeoutMs);

      document.addEventListener("readystatechange", checkReadiness, true);
      window.addEventListener("load", checkReadiness, true);
      checkReadiness();
    });
  }

  async function runAutofill(payload) {
    if (!payload || !payload.fields || autofillRunning) return;
    autofillRunning = true;

    try {
      const autofillStartedAt = Date.now();
      let firstFilledAt = 0;
      panel(`Loaded script revision ${SCRIPT_REVISION}`, "info");
      setPanelStatus("Waiting for Zoho new ticket form...", "info");
      panel("Waiting for Zoho new ticket form...", "info");
      setPanelStatus("Waiting for Zoho form to finish loading...", "info");
      panel("Waiting for Zoho form to finish loading...", "info");
      const formReady = await waitForTicketForm(30000);
      if (!formReady) {
        panel("Zoho form readiness timed out. Starting autofill against the current page state.", "error");
      }
      setPanelStatus("Zoho form is ready. Starting autofill now.", "info");
      panel("Zoho form is ready. Starting autofill now.", "info");
      setPanelStatus("Autofill in progress. Please do not click while fields are being filled.", "info");
      panel("Starting autofill. Please do not click while fields are being filled.", "info");

      let filled = 0;
      let failed = 0;
      let deferredDescription = false;
      let supportAgentStageReached = false;

      for (const label of FILL_ORDER) {
        if (SKIP_AUTOFILL_LABELS.has(label)) {
          continue;
        }

        if (label === "Support Agent") {
          supportAgentStageReached = true;
        }

        const value = getFieldValue(payload, label);
        if (!String(value || "").trim()) continue;

        const result = await fillLabel(label, value);
        if (result.ok) {
          filled += 1;
          if (!firstFilledAt) firstFilledAt = Date.now();
          panel(`Filled: ${label}`, "success");
        } else if (label === DESCRIPTION_RETRY_LABEL && result.reason === "field not ready") {
          deferredDescription = true;
          panel("Delayed Description fill: editor not ready yet, retrying after other fields.", "info");
        } else if (!result.skipped) {
          failed += 1;
          panel(`Skipped ${label}: ${result.reason}`, "error");
        }
        const kind = FIELD_DEFINITIONS[label] && FIELD_DEFINITIONS[label].kind;
        await sleep(getPostFillDelay(label, kind));
      }

      if (deferredDescription) {
        const descriptionRetry = await fillDescriptionWithRetry(payload);
        if (descriptionRetry.ok) {
          filled += 1;
          panel("Filled: Description", "success");
        } else if (!descriptionRetry.skipped) {
          failed += 1;
          panel(`Skipped Description: ${descriptionRetry.reason}`, "error");
        }
      }

      if (supportAgentStageReached) {
        const serialCleanup = await clearProtectedField("Serial Number");
        if (serialCleanup.ok && serialCleanup.cleared) {
          panel("Cleared protected field: Serial Number", "info");
        } else if (serialCleanup.ok) {
          panel("Protected field already clean: Serial Number", "info");
        } else {
          panel(`Protected field cleanup skipped: Serial Number (${serialCleanup.reason})`, "error");
        }
      } else {
        panel("Protected field cleanup skipped: Support Agent stage did not run.", "error");
      }

      const totalElapsedMs = Date.now() - autofillStartedAt;
      const firstFillElapsedMs = firstFilledAt ? firstFilledAt - autofillStartedAt : 0;
      if (firstFilledAt) {
        panel(`Speed: first field in ${firstFillElapsedMs}ms, completed in ${totalElapsedMs}ms.`, "info");
      } else {
        panel(`Speed: no fields were filled after ${totalElapsedMs}ms.`, "error");
      }

      const finalMessage = `Done. Filled ${filled} field(s). ${failed ? `${failed} field(s) need manual checking.` : "Review the ticket, then click Submit manually."}`;
      setPanelStatus(finalMessage, failed ? "error" : "success");
      panel(finalMessage, failed ? "error" : "success");
      if (!failed) {
        schedulePanelAutoClose(4000);
      }

      try {
        history.replaceState(null, document.title, location.pathname + location.search);
      } catch (error) {}
    } finally {
      autofillRunning = false;
      if (queuedPayload) {
        const nextPayload = queuedPayload;
        queuedPayload = null;
        pendingPayload = nextPayload;
        setTimeout(() => {
          if (!autofillRunning && pendingPayload === nextPayload) {
            runAutofill(nextPayload);
          }
        }, 0);
      }
    }
  }

  installAssistantBridge();

  if (chrome && chrome.runtime && chrome.runtime.onMessage && !runtimeListenerInstalled) {
    runtimeListenerInstalled = true;
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message || message.type !== ACTION_AUTOFILL) return undefined;
      const result = acceptPayload(message.payload, "extension message");
      sendResponse(result);
      return true;
    });
  }

  const payload = decodePayload();
  if (payload && !autofillAutoStarted) {
    autofillAutoStarted = true;
    acceptPayload(payload, "URL hash");
  }
}());
