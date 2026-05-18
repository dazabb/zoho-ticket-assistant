(function () {
  "use strict";

  const HASH_KEY = "zta";
  const PANEL_ID = "ticket-assistant-autofill-panel";
  const SCRIPT_REVISION = "2026-05-19-r10";
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
        'input[data-id="cf_support_level_textBox"]',
        'input[data-test-id="cf_support_level_textBox"]'
      ]
    },
    "Support Agent": {
      kind: "dropdown",
      selectors: [
        'input[data-id="support_agent_textBox"]',
        'input[aria-labelledby="Support Agent"]'
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

  const READINESS_REQUIRED_DELAY_MS = 1500;
  const READINESS_POLL_MS = 500;
  const FIELD_RETRY_ATTEMPTS = 5;
  const FIELD_RETRY_DELAY_MS = 600;
  const EXACT_DEFINITION_CONTROLS = new WeakSet();
  let autofillRunning = false;
  let pendingPayload = null;
  let autofillAutoStarted = false;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

  function normalize(text) {
    return String(text || "")
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

  function ensurePanel() {
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
          return resolved;
        }
      }
    }

    return null;
  }

  function findControl(label) {
    const direct = resolveDefinitionControl(label);
    if (direct) return direct;
    if (STRICT_DEFINITION_ONLY_LABELS.has(label)) return null;

    const labelEl = findLabelElement(label);
    if (!labelEl) return null;
    return findControlFromLabel(labelEl);
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
    await sleep(100);
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
      await sleep(350);

      const upgraded = findControl(DESCRIPTION_RETRY_LABEL);
      if (upgraded && upgraded !== control && getEditorBody(upgraded)) {
        if (!await setTextLike(upgraded, value)) return false;
        await sleep(250);
        return richTextContainsValue(upgraded, value);
      }

      return richTextContainsValue(control, value);
    }

    if (!await setTextLike(control, value)) return false;
    await sleep(250);
    return richTextContainsValue(control, value);
  }

  async function setRichTextLike(control, value) {
    if (!control || !String(value || "").trim()) return false;
    control.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(80);

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
    await sleep(80);

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

  function findVisibleOptions(value, root) {
    const scope = root || document;
    const target = normalize(value);
    const looseTarget = looseNormalize(value);
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
        .filter((el) => {
          const text = normalize(visibleText(el));
          const loose = looseNormalize(visibleText(el));
          return text === target || loose === looseTarget || text.includes(target) || target.includes(text);
        });
      if (matches.length) return matches;
    }

    return Array.from(scope.querySelectorAll("li, div, span, td, a"))
      .filter(isVisible)
      .filter((el) => !el.closest(`#${PANEL_ID}`))
      .filter((el) => visibleText(el).length <= Math.max(140, String(value).length + 60))
      .filter((el) => {
        const text = normalize(visibleText(el));
        const loose = looseNormalize(visibleText(el));
        return text === target || loose === looseTarget || text.includes(target) || target.includes(text);
      });
  }

  async function clickBestOption(value, roots) {
    const scopes = (roots && roots.length ? roots : [document]).filter(Boolean);
    for (const scope of scopes) {
      const options = findVisibleOptions(value, scope);
      if (!options.length) continue;
      options[0].scrollIntoView({ block: "center", inline: "nearest" });
      options[0].click();
      await sleep(220);
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

  async function clickOptionByDataValue(value, roots) {
    const target = normalize(value);
    const scopes = (roots && roots.length ? roots : [document]).filter(Boolean);

    for (const scope of scopes) {
      const match = Array.from(scope.querySelectorAll("[data-value]"))
        .filter(isVisible)
        .filter((el) => !el.closest(`#${PANEL_ID}`))
        .find((el) => {
          const dataValue = normalize(el.getAttribute("data-value") || "");
          return dataValue === target || dataValue.includes(target);
        });
      if (!match) continue;
      match.scrollIntoView({ block: "center", inline: "nearest" });
      match.click();
      await sleep(300);
      return true;
    }

    return false;
  }

  function verifyDropdownSelection(control, value, popupRoot) {
    const target = normalize(value);
    const controlText = normalize(controlTextSnapshot(control));
    if (target === normalize("Sandz Support L1.5")) {
      if (controlText.includes(target) && !controlText.includes(normalize("unassigned"))) {
        return true;
      }
    } else if (controlText && controlText !== "-none-" && (controlText === target || controlText.includes(target) || target.includes(controlText))) {
      return true;
    }

    const popupScopes = [popupRoot, document].filter(Boolean);
    for (const scope of popupScopes) {
      const selected = Array.from(scope.querySelectorAll(
        "lyte-drop-item[data-selected='true'], [class*='highlighted' i][role='option'], [aria-selected='true'], [role='option'][aria-selected='true']"
      ))
        .filter(isVisible)
        .find((el) => {
          const text = normalize(visibleText(el));
          if (target === normalize("Sandz Support L1.5")) {
            return text.includes(target);
          }
          return text === target || text.includes(target) || target.includes(text);
        });
      if (selected) return true;
    }

    let node = control;
    for (let i = 0; node && i < 4; i += 1) {
      const text = normalize(controlTextSnapshot(node));
      if (text && text !== "-none-" && (text === target || text.includes(target) || target.includes(text))) {
        return true;
      }
      node = node.parentElement;
    }

    return false;
  }

  async function navigateToOption(control, value, popupRoot, maxSteps = 20) {
    const target = normalize(value);
    for (let i = 0; i < maxSteps; i += 1) {
      control.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", code: "ArrowDown", bubbles: true }));
      await sleep(80);

      const focused = document.activeElement;
      if (focused && normalize(visibleText(focused)).includes(target)) {
        focused.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
        if (typeof focused.click === "function") focused.click();
        await sleep(200);
        if (verifyDropdownSelection(control, value, popupRoot)) return true;
      }

      const highlighted = (popupRoot || document).querySelector(
        "lyte-drop-item[data-selected='true'], [class*='highlighted' i][role='option'], [aria-selected='true']"
      );
      if (highlighted && normalize(visibleText(highlighted)).includes(target)) {
        highlighted.click();
        await sleep(200);
        if (verifyDropdownSelection(control, value, popupRoot)) return true;
      }
    }
    return false;
  }

  async function setDropdownLike(control, value, options) {
    if (!control || !String(value || "").trim()) return { ok: false, reason: "empty" };
    const strictMode = !!(options && options.strictMode);
    const label = options && options.label;
    const trigger = extractInteractiveControl(control) || control;
    if (!isValidResolvedControl(label, trigger)) {
      return { ok: false, reason: "resolved control rejected" };
    }
    trigger.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(120);

    fireMouseEvents(trigger);
    if (typeof trigger.focus === "function") trigger.focus();
    await sleep(600);

    let popupRoot = findActiveDropdownPopup(trigger);
    if (strictMode && !popupRoot) {
      return { ok: false, reason: "dropdown popup not detected" };
    }
    const searchInput = strictMode
      ? findPopupSearchInput(popupRoot, trigger)
      : (findNearestNewInput(trigger, popupRoot) || findNearestNewInput(trigger));
    if (searchInput) {
      searchInput.focus();
      setNativeValue(searchInput, value);
      fireInputEvents(searchInput);
      await sleep(700);
      popupRoot = findActiveDropdownPopup(trigger) || popupRoot;
      if (await clickBestOption(value, [popupRoot, document])) {
        await sleep(250);
        if (verifyDropdownSelection(trigger, value, popupRoot)) return { ok: true };
      }
    }

    popupRoot = findActiveDropdownPopup(trigger) || popupRoot;
    if (await clickBestOption(value, [popupRoot, document])) {
      await sleep(250);
      if (verifyDropdownSelection(trigger, value, popupRoot)) return { ok: true };
    }

    popupRoot = findActiveDropdownPopup(trigger) || popupRoot;
    if (await clickOptionByDataValue(value, [popupRoot, document])) {
      await sleep(250);
      if (verifyDropdownSelection(trigger, value, popupRoot)) return { ok: true };
    }

    popupRoot = findActiveDropdownPopup(trigger) || popupRoot;
    if (await navigateToOption(trigger, value, popupRoot)) return { ok: true };

    return { ok: false, reason: "dropdown option not found" };
  }

  async function waitForInteractiveControl(label, attempts) {
    const maxAttempts = attempts || FIELD_RETRY_ATTEMPTS;
    let lastControl = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      lastControl = findControl(label);
      const resolved = extractInteractiveControl(lastControl);
      if (resolved && isVisible(resolved)) return resolved;
      if (attempt < maxAttempts) await sleep(FIELD_RETRY_DELAY_MS);
    }

    return extractInteractiveControl(lastControl) || lastControl;
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
    return String(payload.fields[label] || "").trim();
  }

  async function fillLabel(label, value) {
    const cleanValue = String(value || "").trim();
    if (!cleanValue) return { skipped: true, reason: "empty" };

    const kind = FIELD_DEFINITIONS[label] && FIELD_DEFINITIONS[label].kind;
    const shouldText = kind === "text" || kind === "richtext" || TEXT_FIELD_LABELS.has(label);
    const shouldDropdown = kind === "dropdown" || DROPDOWN_FIELD_LABELS.has(label);
    let lastDropdownReason = "";

    for (let attempt = 1; attempt <= FIELD_RETRY_ATTEMPTS; attempt += 1) {
      let control = findControl(label);
      if (!control && shouldDropdown) {
        control = await waitForInteractiveControl(label, 2);
      }
      if (control && !isValidResolvedControl(label, control)) {
        panel(`Rejected candidate for ${label}: matched protected or unrelated field context.`, "error");
        control = null;
      }
      if (!control) {
        if (attempt < FIELD_RETRY_ATTEMPTS) {
          await sleep(FIELD_RETRY_DELAY_MS);
          continue;
        }
        return { ok: false, reason: "field not found" };
      }

      if (kind === "richtext") {
        if (!hasWritableEditor(control)) {
          if (attempt < FIELD_RETRY_ATTEMPTS) {
            await sleep(FIELD_RETRY_DELAY_MS);
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
            && !verifyDropdownSelection(control, cleanValue)) {
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

      if (attempt < FIELD_RETRY_ATTEMPTS) {
        await sleep(FIELD_RETRY_DELAY_MS);
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
    await sleep(3000);
    while (Date.now() - started < timeoutMs) {
      if (isFormSufficientlyLoaded()) {
        await sleep(READINESS_REQUIRED_DELAY_MS);
        if (isFormSufficientlyLoaded()) return true;
      }
      await sleep(READINESS_POLL_MS);
    }
    return false;
  }

  async function runAutofill(payload) {
    if (!payload || !payload.fields || autofillRunning) return;
    autofillRunning = true;

    try {
      panel(`Loaded script revision ${SCRIPT_REVISION}`, "info");
      setPanelStatus("Waiting for Zoho new ticket form...", "info");
      panel("Waiting for Zoho new ticket form...", "info");
      setPanelStatus("Waiting for Zoho form to finish loading...", "info");
      panel("Waiting for Zoho form to finish loading...", "info");
      await waitForTicketForm(30000);
      setPanelStatus("Zoho form is ready. Starting autofill now.", "info");
      panel("Zoho form is ready. Starting autofill now.", "info");
      setPanelStatus("Autofill in progress. Please do not click while fields are being filled.", "info");
      panel("Starting autofill. Please do not click while fields are being filled.", "info");

      let filled = 0;
      let failed = 0;
      let deferredDescription = false;

      for (const label of FILL_ORDER) {
        if (SKIP_AUTOFILL_LABELS.has(label)) {
          continue;
        }

        const value = getFieldValue(payload, label);
        if (!String(value || "").trim()) continue;

        const result = await fillLabel(label, value);
        if (result.ok) {
          filled += 1;
          panel(`Filled: ${label}`, "success");
        } else if (label === DESCRIPTION_RETRY_LABEL && result.reason === "field not ready") {
          deferredDescription = true;
          panel("Delayed Description fill: editor not ready yet, retrying after other fields.", "info");
        } else if (!result.skipped) {
          failed += 1;
          panel(`Skipped ${label}: ${result.reason}`, "error");
        }
        await sleep(350);
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

      const serialCleanup = await clearProtectedField("Serial Number");
      if (serialCleanup.ok && serialCleanup.cleared) {
        panel("Cleared protected field: Serial Number", "info");
      } else if (serialCleanup.ok) {
        panel("Protected field already clean: Serial Number", "info");
      } else {
        panel(`Protected field cleanup skipped: Serial Number (${serialCleanup.reason})`, "error");
      }

      const finalMessage = `Done. Filled ${filled} field(s). ${failed ? `${failed} field(s) need manual checking.` : "Review the ticket, then click Submit manually."}`;
      setPanelStatus(finalMessage, failed ? "error" : "success");
      panel(finalMessage, failed ? "error" : "success");

      try {
        history.replaceState(null, document.title, location.pathname + location.search);
      } catch (error) {}
    } finally {
      autofillRunning = false;
    }
  }

  const payload = decodePayload();
  if (payload) {
    pendingPayload = payload;
    ensurePanel();
    panel(`Payload detected. Running script revision ${SCRIPT_REVISION}.`, "info");
    setPanelStatus("Payload loaded. Autofill will begin automatically after the Zoho form is ready.", "info");
    if (!autofillAutoStarted) {
      autofillAutoStarted = true;
      setTimeout(() => {
        if (!autofillRunning && pendingPayload) {
          runAutofill(pendingPayload);
        }
      }, 0);
    }
  }
}());
