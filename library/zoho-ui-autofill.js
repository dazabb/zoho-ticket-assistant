(function () {
  "use strict";

  const DEFAULT_ZOHO_NEW_TICKET_URL = "https://helpcenter.amti.com.ph/agent/amtiphilippines/sandz/tickets/new";
  const STORAGE_KEY_URL = "ztaZohoNewTicketUrl";
  const HASH_KEY = "zta";
  const BRIDGE_REQUEST_TYPE = "zta:bridge-request";
  const BRIDGE_RESPONSE_TYPE = "zta:bridge-response";
  const ACTION_PREPARE_OR_FOCUS = "prepareOrFocusZohoTab";

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
  const INFRASTRUCTURE_REQUEST_LABEL = "Infrastructure ( Zadara Storage / Zadara Infrastructure / OS / Dell Server and Storage )";
  const ISSUE_RULES = {
    incident: {
      "archive": {
        category: "Archive - Incident",
        keywords: ["archive"],
        subcategories: ["Access Issue", "Additional Compute", "Capacity Issue", "Configuration Issue", "Device Issue", "Firmware Upgrade", "Migration", "Reliability Issue"]
      },
      "backup": {
        category: "Backup - Incident",
        keywords: ["backup"],
        subcategories: ["Access Issue", "Additional Compute (Expansion)", "Capacity Issue", "Check Backup Policy", "Check Backup Retention and Performance", "Configuration Issue", "Device Issue", "Hardisk Change", "Migration", "Reliability Issue", "Restart backup policy", "Restart Backup Server", "Restart Catalog", "Restoration", "Retrigger failed backup", "Run Guide", "Tape Request"]
      },
      "cloud": {
        category: "Cloud - Incident",
        keywords: ["cloud"],
        subcategories: ["Access Issue", "Capacity Issue", "Configuration", "Device Issue", "Hardisk Change", "Network Issue", "Performance Issue", "Reliability Issue"]
      },
      "dr": {
        category: "Disaster Recovery - Incident",
        keywords: ["disaster recovery", "dr"],
        subcategories: ["Device Issue", "FailOver Issue", "Network Issue", "Performance Issue"]
      },
      "hardware": {
        category: "Hardware - Incident",
        keywords: ["hardware"],
        subcategories: ["Hardisk Change", "Over-utilized", "Restart Device"]
      },
      "network": {
        category: "Network - Incident",
        keywords: ["network"],
        subcategories: ["Network Bandwidth Change", "Network Connection", "Network Device Change", "Network Device Configuration", "Network Logical Address Change", "Network Telco Self Recovery", "Restart Device"]
      },
      "server_operation_alerts": {
        category: "Server Operation Alerts",
        keywords: ["server operation alerts"],
        subcategories: ["Network Unstable"]
      },
      "server": {
        category: "Server - Incident",
        keywords: ["server", "compute"],
        subcategories: ["Access Issue", "Application Issue", "Compatibility Issue", "Computer Resource", "Device Issue", "License Issue/Renewal", "Network Issue", "OS Compatibility Issue", "OS Configuration Issue", "Performance Issue", "Restart Services", "Settings Change"]
      },
      "software": {
        category: "Software - Incident",
        keywords: ["software"],
        subcategories: ["Vulnerability issue", "Compatibility Issue", "Computer Resource Change", "Configuration Change", "License Issue", "Restart Services", "Settings Change"]
      },
      "storage": {
        category: "Storage - Incident",
        keywords: ["storage", "nas", "vpsa", "capacity"],
        subcategories: ["Access Issue", "Capacity Issue", "Device Issue", "Performance Issue"]
      },
      "vm": {
        category: "VM - Incident",
        keywords: [" vm ", "vmware", "virtual machine", "hyper-v"],
        subcategories: ["Access Issue", "Application Issue", "Database Issue", "Network Issue", "Performance Issue"]
      }
    },
    request: {
      "archive": {
        category: "Archive - Request",
        keywords: ["archive"],
        subcategories: ["Additional Compute", "Archiving Report", "Firmware Upgrade", "Logs", "Migration", "Status / Health Report", "Utilization Report"]
      },
      "backup_monitoring": {
        category: "Backup Monitoring Request",
        keywords: ["backup monitoring"],
        subcategories: []
      },
      "backup": {
        category: "Backup - Request",
        keywords: ["backup"],
        subcategories: ["Additional Compute", "Check backup policies and status", "Check Backup Retention and Performance", "Config Settings", "Extract Job Manager Report", "Extract Logs", "File Level/DB Level/BareMetal Level", "Full Backup", "Logs", "Migration", "Restart backup policy", "Restart Backup Server", "Restart Catalog", "Restoration", "Retrigger failed backup", "Run Guide", "Status / Health Report", "Tape Request", "Utilization Report"]
      },
      "cloud": {
        category: "Cloud - Request",
        keywords: ["cloud"],
        subcategories: ["Additional Compute", "Logs", "Migration", "Status / Health Report", "Utilization Report"]
      },
      "dr": {
        category: "Disaster Recovery - Request",
        keywords: ["disaster recovery", "dr"],
        subcategories: ["Additional DR", "Logs", "Migration", "Outage/FailOver Test", "Status / Health Report"]
      },
      "draas_monitoring": {
        category: "DRaaS Monitoring Request",
        keywords: ["draas"],
        subcategories: []
      },
      "ewb_mk2": {
        category: "EWB MK2 and TIM Daily Report",
        keywords: ["ewb mk2"],
        subcategories: []
      },
      "hardware": {
        category: "Hardware - Request",
        keywords: ["hardware"],
        subcategories: []
      },
      "iaas_monitoring": {
        category: "IaaS Monitoring Request",
        keywords: ["iaas monitoring"],
        subcategories: []
      },
      "infrastructure": {
        category: INFRASTRUCTURE_REQUEST_LABEL,
        keywords: ["infrastructure", "iaas", "zadara", "os", "dell server", "dell storage", "equinix"],
        subcategories: ["Check IAAS Health and Metrics"]
      },
      "network": {
        category: "Network - Request",
        keywords: ["network"],
        subcategories: ["Network bandwidth report", "Network Device inventory report", "Network settings report", "Submit status Reports"]
      },
      "server": {
        category: "Server - Request",
        keywords: ["server", "compute"],
        subcategories: ["Additional Compute", "Firmware Upgrade", "Logs", "Migration", "Monitoring", "Status / Health Report", "Utilization Report"]
      },
      "software": {
        category: "Software - Request",
        keywords: ["software"],
        subcategories: ["Agent Installer / Installation", "Submit status Reports", "Update License"]
      },
      "storage": {
        category: "Storage - Request",
        keywords: ["storage", "nas", "vpsa", "capacity"],
        subcategories: ["Agent Installer / Installation", "Additional Compute", "Firmware Upgrade", "Logs", "Migration", "Monitoring", "Status / Health Report", "Provisioning", "Cloning"]
      },
      "vm": {
        category: "VM - Request",
        keywords: [" vm ", "vmware", "virtual machine", "hyper-v"],
        subcategories: ["Additional Compute", "Change Compute", "Firmware Upgrade", "Logs", "Migration", "Monitoring", "Snapshot", "Status / Health Report", "Utilization Report"]
      }
    }
  };

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

  function normalizeWhitespace(value) {
    return String(value || "").replace(/\u00a0/g, " ").replace(/[\s\t\r\n]+/g, " ").trim();
  }

  function normalizeForMatch(value) {
    return normalizeWhitespace(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function includesAny(text, patterns) {
    const haystack = normalizeForMatch(text);
    return patterns.some((pattern) => haystack.includes(normalizeForMatch(pattern)));
  }

  function buildIssueContext(fields, description, workspaceText) {
    return normalizeForMatch([
      workspaceText,
      fields.subject,
      description,
      fields.issueDescription,
      fields.ticketCategory,
      fields.issueCategory,
      fields.issueSubCategory,
      fields.supportedPortfolio,
      fields.technologyPlatform
    ].join(" "));
  }

  function getTicketMode(ticketCategory) {
    return String(ticketCategory || "").trim().toLowerCase() === "request" ? "request" : "incident";
  }

  function getRuleSet(ticketCategory) {
    return ISSUE_RULES[getTicketMode(ticketCategory)];
  }

  function getAllValidCategories() {
    return Object.keys(ISSUE_RULES).reduce(function (acc, mode) {
      Object.keys(ISSUE_RULES[mode]).forEach(function (family) {
        acc.add(ISSUE_RULES[mode][family].category);
      });
      return acc;
    }, new Set());
  }

  function findFamilyByCategory(issueCategory, ticketCategory) {
    const normalizedCategory = normalizeForMatch(issueCategory);
    if (!normalizedCategory) return "";
    const rules = getRuleSet(ticketCategory);
    const directFamily = Object.keys(rules).find(function (family) {
      return normalizeForMatch(rules[family].category) === normalizedCategory;
    });
    if (directFamily) return directFamily;
    if (normalizedCategory === normalizeForMatch("Infrastructure")) return "infrastructure";
    if (normalizedCategory === normalizeForMatch("IT Support - Request")) return "";
    return "";
  }

  function inferFamilyFromContext(context, ticketCategory) {
    const rules = getRuleSet(ticketCategory);
    const orderedFamilies = getTicketMode(ticketCategory) === "request"
      ? ["backup_monitoring", "draas_monitoring", "ewb_mk2", "infrastructure", "backup", "storage", "dr", "network", "vm", "server", "software", "cloud", "archive", "hardware", "iaas_monitoring"]
      : ["server_operation_alerts", "storage", "backup", "dr", "network", "vm", "server", "software", "cloud", "archive", "hardware"];
    return orderedFamilies.find(function (family) {
      const rule = rules[family];
      return rule && includesAny(context, rule.keywords);
    }) || "";
  }

  function resolveValidIssueCategory(fields, description, ticketCategory, workspaceText, options) {
    if (options && options.iaasHealthCheck) return INFRASTRUCTURE_REQUEST_LABEL;
    if (options && options.backupConnectivityIncident) return "Network - Incident";
    if (options && options.restoreRequest) return "Backup - Request";
    if (options && options.siMigrationFamily) {
      const requestRules = getRuleSet("Request");
      const migrationRule = requestRules[options.siMigrationFamily];
      if (migrationRule && migrationRule.category) return migrationRule.category;
      return "Server - Request";
    }
    if (options && options.siStorageHealthCheck) return "Storage - Request";
    if (options && options.scheduledMaintenance) return "Server - Request";
    if (options && options.storageCapacityBackupIncident) return "Storage - Incident";

    const rawIssueCategory = normalizeWhitespace(fields.issueCategory);
    const rules = getRuleSet(ticketCategory);
    const validCategories = getAllValidCategories();
    if (validCategories.has(rawIssueCategory)) return rawIssueCategory;
    if (normalizeForMatch(rawIssueCategory) === normalizeForMatch("Infrastructure")) return INFRASTRUCTURE_REQUEST_LABEL;

    const context = buildIssueContext(fields, description, workspaceText);
    const family = findFamilyByCategory(rawIssueCategory, ticketCategory) || inferFamilyFromContext(context, ticketCategory);
    if (family && rules[family]) return rules[family].category;

    return getTicketMode(ticketCategory) === "request" ? "Server - Request" : "Server - Incident";
  }

  function chooseDefaultSubcategory(rule, context, ticketCategory) {
    const subcategories = rule && Array.isArray(rule.subcategories) ? rule.subcategories : [];
    if (!subcategories.length) return "";

    if (getTicketMode(ticketCategory) === "request") {
      if (subcategories.includes("Check IAAS Health and Metrics")) return "Check IAAS Health and Metrics";
      if (includesAny(context, ["restore", "restoration", "test-restore", "test restore"]) && subcategories.includes("Restoration")) {
        return "Restoration";
      }
      if (includesAny(context, ["health check", "health and metrics", "status", "report"]) && subcategories.includes("Status / Health Report")) {
        return "Status / Health Report";
      }
      if (includesAny(context, ["logs", "log"]) && subcategories.includes("Logs")) return "Logs";
      if (includesAny(context, ["migration"]) && subcategories.includes("Migration")) return "Migration";
      if (includesAny(context, ["monitoring"]) && subcategories.includes("Monitoring")) return "Monitoring";
      if (includesAny(context, ["utilization"]) && subcategories.includes("Utilization Report")) return "Utilization Report";
      if (includesAny(context, ["backup policy", "policies", "policy"]) && subcategories.includes("Check backup policies and status")) {
        return "Check backup policies and status";
      }
      return subcategories[0];
    }

    if (includesAny(context, ["capacity", "nearly full"]) && subcategories.includes("Capacity Issue")) return "Capacity Issue";
    if (includesAny(context, ["access"]) && subcategories.includes("Access Issue")) return "Access Issue";
    if (includesAny(context, ["network"]) && subcategories.includes("Network Issue")) return "Network Issue";
    if (includesAny(context, ["configuration", "settings"]) && subcategories.includes("Configuration Change")) return "Configuration Change";
    if (includesAny(context, ["restart"]) && subcategories.includes("Restart Services")) return "Restart Services";
    if (includesAny(context, ["failover"]) && subcategories.includes("FailOver Issue")) return "FailOver Issue";
    if (includesAny(context, ["device"]) && subcategories.includes("Device Issue")) return "Device Issue";
    if (includesAny(context, ["failure", "fail", "error"]) && subcategories.includes("Reliability Issue")) return "Reliability Issue";
    if (includesAny(context, ["performance", "slow"]) && subcategories.includes("Performance Issue")) return "Performance Issue";
    return subcategories[0];
  }

  function resolveValidIssueSubCategory(fields, description, ticketCategory, workspaceText, resolvedIssueCategory, options) {
    if (options && options.iaasHealthCheck) return "Check IAAS Health and Metrics";
    if (options && options.backupConnectivityIncident) return "Network Connection";
    if (options && options.restoreRequest) return "Restoration";
    if (options && options.siMigrationFamily) return "Migration";
    if (options && options.siStorageHealthCheck) return "Status / Health Report";
    if (options && options.scheduledMaintenance) return "Status / Health Report";
    if (options && options.storageCapacityBackupIncident) return "Capacity Issue";

    const rawIssueSubCategory = normalizeWhitespace(fields.issueSubCategory);
    const rules = getRuleSet(ticketCategory);
    const family = findFamilyByCategory(resolvedIssueCategory, ticketCategory) || inferFamilyFromContext(buildIssueContext(fields, description, workspaceText), ticketCategory);
    const rule = family && rules[family] ? rules[family] : null;
    const allowed = rule && Array.isArray(rule.subcategories) ? rule.subcategories : [];
    if (allowed.includes(rawIssueSubCategory)) {
      return normalizeForbiddenIssueSubCategory(rawIssueSubCategory, fields, description, ticketCategory, workspaceText);
    }

    const context = buildIssueContext(fields, description, workspaceText);
    const preferred = chooseDefaultSubcategory(rule, context, ticketCategory);
    if (preferred) return preferred;

    return "";
  }

  function isScheduledMaintenance(fields, workspaceText, description) {
    const subject = firstNonEmpty(fields.subject, "");
    const context = [
      workspaceText,
      subject,
      description,
      fields.issueDescription,
      fields.ticketCategory,
      fields.issueCategory,
      fields.issueSubCategory
    ].join(" ");

    if (!includesAny(context, [
      "power drain activity",
      "maintenance activity",
      "scheduled activity"
    ])) {
      return false;
    }

    if (includesAny(context, [
      "backup failure",
      "production down",
      "service interruption",
      "outage",
      "alert",
      "incident"
    ])) {
      return false;
    }

    return true;
  }

  function isIaasHealthCheck(fields, workspaceText, description) {
    const context = [
      workspaceText,
      fields.subject,
      description,
      fields.issueDescription,
      fields.ticketCategory,
      fields.issueCategory,
      fields.issueSubCategory,
      fields.supportedPortfolio,
      fields.technologyPlatform
    ].join(" ");

    const isHealthCheckLike = includesAny(context, [
      "health check",
      "health and metrics",
      "check iaas health and metrics",
      "infrastructure health",
      "health verification",
      "health status"
    ]);
    if (!isHealthCheckLike) return false;

    const isIaasLike = includesAny(context, [
      "iaas",
      "infrastructure",
      "zadara",
      "os",
      "dell server",
      "dell storage",
      "equinix",
      "workspace one"
    ]);
    if (!isIaasLike) return false;

    if (includesAny(context, [
      "backup failure",
      "production down",
      "service interruption",
      "outage",
      "alert",
      "incident",
      "capacity tier",
      "offload",
      "repository"
    ])) {
      return false;
    }

    return true;
  }

  function isSiDeliveryActivity(fields, workspaceText, description) {
    const context = [
      workspaceText,
      fields.subject,
      description,
      fields.issueDescription,
      fields.ticketCategory,
      fields.issueCategory,
      fields.issueSubCategory,
      fields.supportedPortfolio,
      fields.technologyPlatform
    ].join(" ");

    if (!includesAny(context, [
      "migration",
      "cabling",
      "implementation",
      "deployment",
      "refresh",
      "upgrade",
      "cutover",
      "relocation",
      "project activity",
      "scheduled project",
      "scheduled activity"
    ])) {
      return false;
    }

    if (
      includesAny(context, [
        "health check",
        "health and metrics",
        "check iaas health and metrics",
        "health verification",
        "status / health report"
      ])
      && !includesAny(context, ["migration", "cabling", "cutover", "relocation"])
    ) {
      return false;
    }

    if (includesAny(context, [
      "backup failure",
      "production down",
      "service interruption",
      "outage",
      "alert",
      "reliability issue",
      "capacity tier",
      "offload",
      "repository"
    ])) {
      return false;
    }

    return true;
  }

  function isRestoreRequest(fields, workspaceText, description) {
    const context = [
      workspaceText,
      fields.subject,
      description,
      fields.issueDescription,
      fields.ticketCategory,
      fields.issueCategory,
      fields.issueSubCategory,
      fields.supportedPortfolio,
      fields.technologyPlatform
    ].join(" ");

    const isRestoreLike = includesAny(context, [
      "restore",
      "restoration",
      "test-restore",
      "test restore",
      "file level restore",
      "bare metal restore",
      "database restore",
      "cristie"
    ]);
    if (!isRestoreLike) return false;

    if (includesAny(context, [
      "backup failure",
      "production down",
      "service interruption",
      "outage",
      "alert",
      "incident"
    ])) {
      return false;
    }

    return true;
  }

  function isBackupConnectivityIncident(fields, workspaceText, description, ticketCategory) {
    if (String(ticketCategory || "").trim().toLowerCase() !== "incident") return false;

    const context = [
      workspaceText,
      fields.subject,
      description,
      fields.issueDescription,
      fields.ticketCategory,
      fields.issueCategory,
      fields.issueSubCategory,
      fields.supportedPortfolio,
      fields.technologyPlatform
    ].join(" ");

    const isBackupLike = includesAny(context, [
      "backup",
      "veeam",
      "catalog",
      "job detail",
      "restore point",
      "repository",
      "agent"
    ]);
    if (!isBackupLike) return false;

    const hasConnectivityProof = includesAny(context, [
      "connection refused",
      "telnet",
      "port inaccessible",
      "port closed",
      "cannot connect",
      "unable to connect",
      "unreachable",
      "network path",
      "firewall",
      "timed out",
      "timeout",
      "connection timeout",
      "failed to connect"
    ]);
    if (!hasConnectivityProof) return false;

    if (includesAny(context, [
      "capacity tier",
      "capacity-tier",
      "offload",
      "repository nearly full",
      "nearly full",
      "local repository pressure",
      "s3 compatible"
    ])) {
      return false;
    }

    return true;
  }

  function getSiMigrationRequestFamily(fields, workspaceText, description, resolvedSolutions) {
    if (String(resolvedSolutions || "").trim().toUpperCase() !== "SI") return "";
    if (!isSiDeliveryActivity(fields, workspaceText, description)) return "";

    const context = [
      workspaceText,
      fields.subject,
      description,
      fields.issueDescription,
      fields.issueCategory,
      fields.issueSubCategory,
      fields.supportedPortfolio,
      fields.technologyPlatform
    ].join(" ");

    if (!includesAny(context, ["migration", "cabling", "implementation", "deployment", "refresh", "upgrade", "cutover", "relocation"])) {
      return "";
    }
    if (includesAny(context, ["netapp", "storage", "nas", "san", "powerstore", "unity", "synology"])) {
      return "storage";
    }
    if (includesAny(context, ["virtual machine", "vmware", "hyper-v", " vm "])) {
      return "vm";
    }
    if (includesAny(context, ["disaster recovery", " draas ", " dr "])) {
      return "dr";
    }
    if (includesAny(context, ["server", "compute", "host", "esxi"])) {
      return "server";
    }
    return "server";
  }

  function isSiStorageHealthCheck(fields, workspaceText, description, resolvedSolutions) {
    if (String(resolvedSolutions || "").trim().toUpperCase() !== "SI") return false;

    const context = [
      workspaceText,
      fields.subject,
      description,
      fields.issueDescription,
      fields.ticketCategory,
      fields.issueCategory,
      fields.issueSubCategory,
      fields.supportedPortfolio,
      fields.technologyPlatform
    ].join(" ");

    const isHealthCheckLike = includesAny(context, [
      "health check",
      "scheduled health check",
      "maintenance check",
      "health verification",
      "status / health report",
      "status report"
    ]);
    if (!isHealthCheckLike) return false;

    const isStorageLike = includesAny(context, [
      "netapp",
      "storage",
      "nas",
      "san",
      "powerstore",
      "unity",
      "synology"
    ]);
    if (!isStorageLike) return false;

    if (includesAny(context, [
      "backup failure",
      "production down",
      "service interruption",
      "outage",
      "alert",
      "incident",
      "capacity tier",
      "offload",
      "repository"
    ])) {
      return false;
    }

    return true;
  }

  function normalizeSupportLevel(value) {
    const raw = normalizeWhitespace(value);
    if (!raw) return "Level 1.5";
    const comparable = normalizeForMatch(raw).replace(/\s+/g, "");
    if (comparable === "level1.5" || comparable === "l11.5" || comparable === "lvl1.5") {
      return "Level 1.5";
    }
    return raw;
  }

  function normalizeSupportAgent(value) {
    return normalizeWhitespace(value);
  }

  function formatIssueCategory(issueCategory, ticketCategory) {
    const issue = String(issueCategory || "").trim();
    const ticket = String(ticketCategory || "").trim();
    if (!issue) return "";
    if (getAllValidCategories().has(issue)) return issue;
    if (!ticket) return issue;
    if (issue.toLowerCase().includes(ticket.toLowerCase())) return issue;
    return `${issue} - ${ticket}`;
  }

  function normalizeForbiddenIssueSubCategory(issueSubCategory, fields, description, ticketCategory, workspaceText) {
    const raw = normalizeWhitespace(issueSubCategory);
    if (!raw) return "";
    if (normalizeForMatch(raw) === normalizeForMatch("Retrigger failed backup")) {
      return "Reliability Issue";
    }
    if (
      normalizeForMatch(raw) === normalizeForMatch("Monitoring")
      && isScheduledMaintenance(fields, workspaceText, description)
      && String(ticketCategory || "").trim().toLowerCase() === "request"
    ) {
      return "Status / Health Report";
    }
    return raw;
  }

  function normalizeIssueSubCategory(fields, description, ticketCategory, workspaceText) {
    const rawIssueCategory = firstNonEmpty(fields.issueCategory, "");
    const rawIssueSubCategory = firstNonEmpty(fields.issueSubCategory, "");
    if (isIaasHealthCheck(fields, workspaceText, description)) {
      return "Check IAAS Health and Metrics";
    }
    if (isBackupConnectivityIncident(fields, workspaceText, description, ticketCategory)) {
      return "Network Connection";
    }
    if (isRestoreRequest(fields, workspaceText, description)) {
      return "Restoration";
    }
    if (
      isSiDeliveryActivity(fields, workspaceText, description)
      && includesAny([rawIssueCategory, rawIssueSubCategory, fields.subject, description].join(" "), ["migration", "cabling", "implementation", "deployment", "refresh", "upgrade", "cutover", "relocation"])
    ) {
      return "Migration";
    }
    if (isScheduledMaintenance(fields, workspaceText, description)) {
      return "Status / Health Report";
    }
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

    return normalizeForbiddenIssueSubCategory(
      firstNonEmpty(rawIssueSubCategory, ticketCategory.toLowerCase() === "incident" ? "Performance Issue" : ""),
      fields,
      description,
      ticketCategory,
      workspaceText
    );
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
    if (fields.subject) return window.MAUSandzTicketRules
      ? window.MAUSandzTicketRules.normalizeSubject(fields.subject, text)
      : String(fields.subject || "").trim().replace(/\s+Ticket\s+No\.\s*#?\d+\s*$/i, "").replace(/\.$/, "");
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !/^[-*•]/.test(line))
      .filter((line) => !/^Ticket Workspace$/i.test(line));
    return (lines.find((line) => line.length > 8) || "New ticket from Ticket Assistant").slice(0, 180).replace(/\.$/, "");
  }

  function extractDescriptionFromSubject(subject) {
    const raw = String(subject || "").trim();
    if (!raw) return "";
    const withoutTicketNo = raw.replace(/\s+Ticket\s+No\.\s*#.+$/i, "").trim();
    const withoutPeriod = withoutTicketNo.replace(/\.$/, "").trim();
    const match = withoutPeriod.match(/^SANDZ-(?:MSDCO|SI)-.+?-(.+)$/i);
    return (match ? match[1] : withoutPeriod).trim();
  }

  function buildZohoPayload(workspaceText) {
    const fields = parseWorkspace(workspaceText);
    const sandzDecision = window.MAUSandzTicketRules ? window.MAUSandzTicketRules.getDecision(workspaceText) : null;
    const isRackwareDrIncident = Boolean(sandzDecision && sandzDecision.drIncident);
    const profileSupportAgent = typeof window.getActiveSupportAgent === "function"
      ? normalizeSupportAgent(window.getActiveSupportAgent() || "")
      : "";
    const subject = inferSubject(workspaceText, fields);
    const description = firstNonEmpty(
      extractDescriptionFromSubject(subject),
      fields.description,
      fields.issueDescription
    );
    const iaasHealthCheck = isIaasHealthCheck(fields, workspaceText, description);
    const restoreRequest = isRestoreRequest(fields, workspaceText, description);
    const scheduledMaintenance = isScheduledMaintenance(fields, workspaceText, description);
    const siDeliveryActivity = isSiDeliveryActivity(fields, workspaceText, description);
    const resolvedSolutions = firstNonEmpty(
      iaasHealthCheck ? "MS" : "",
      isBackupConnectivityIncident(fields, workspaceText, description, normalizeWhitespace(fields.ticketCategory) || "Incident") ? "MS" : "",
      siDeliveryActivity ? "SI" : "",
      scheduledMaintenance ? "SI" : "",
      fields.solutions
    );
    const siMigrationFamily = getSiMigrationRequestFamily(fields, workspaceText, description, resolvedSolutions);
    const siStorageHealthCheck = isSiStorageHealthCheck(fields, workspaceText, description, resolvedSolutions);
    const ticketCategory = firstNonEmpty(
      iaasHealthCheck ? "Request" : "",
      restoreRequest ? "Request" : "",
      siMigrationFamily ? "Request" : "",
      siStorageHealthCheck ? "Request" : "",
      scheduledMaintenance ? "Request" : "",
      normalizeWhitespace(fields.ticketCategory),
      "Incident"
    );
    const backupConnectivityIncident = isBackupConnectivityIncident(fields, workspaceText, description, ticketCategory);
    const preliminaryIssueSubCategory = normalizeIssueSubCategory(fields, description, ticketCategory, workspaceText);
    const storageCapacityBackupIncident = isStorageCapacityBackupIncident(fields, description, ticketCategory, preliminaryIssueSubCategory);
    const normalizedIssueCategory = isRackwareDrIncident ? "Disaster Recovery - Incident" : resolveValidIssueCategory(fields, description, ticketCategory, workspaceText, {
      iaasHealthCheck,
      backupConnectivityIncident,
      restoreRequest,
      siMigrationFamily,
      siStorageHealthCheck,
      scheduledMaintenance,
      storageCapacityBackupIncident
    });
    const issueSubCategory = isRackwareDrIncident
      ? (sandzDecision.subcategory || (["Device Issue", "FailOver Issue", "Network Issue", "Performance Issue"].includes(fields.issueSubCategory) ? fields.issueSubCategory : ""))
      : resolveValidIssueSubCategory(fields, description, ticketCategory, workspaceText, normalizedIssueCategory, {
      iaasHealthCheck,
      backupConnectivityIncident,
      restoreRequest,
      siMigrationFamily,
      siStorageHealthCheck,
      scheduledMaintenance,
      storageCapacityBackupIncident
    });
    const supportedPortfolio = firstNonEmpty(
      isRackwareDrIncident ? "(DRaaS) Disaster Recovery as a Service" : "",
      backupConnectivityIncident ? "(BaaS) Backup as a Service" : "",
      String(resolvedSolutions || "").trim().toUpperCase() === "SI" ? "(SI) System Integration" : "",
      iaasHealthCheck ? "(IaaS) Infrastructure as a Service" : "",
      fields.supportedPortfolio,
      storageCapacityBackupIncident ? "(BaaS) Backup as a Service" : ""
    );
    const severityLevel = fields.severityLevel || "";
    const priority = normalizePriority(severityLevel, fields.priority || "");

    const result = {
      version: 1,
      source: "Ticket Assistant",
      createdAt: new Date().toISOString(),
      rawWorkspace: workspaceText,
      fields: {
        "Customer Company Name": fields.customerCompanyName || "",
        "Subject": subject,
        "Description": description,
        "Status": firstNonEmpty(fields.status, "Open"),
        "Ticket Owner": fields.ticketOwner || "",
        "Supported Portfolio": supportedPortfolio,
        "Solutions": resolvedSolutions,
        "Ticket Category": ticketCategory,
        "Issue Category": formatIssueCategory(normalizedIssueCategory, ticketCategory),
        "Issue Sub-Category": issueSubCategory,
        "Severity Level": severityLevel,
        "Support Level": normalizeSupportLevel(fields.supportLevel),
        "Support Agent": firstNonEmpty(normalizeSupportAgent(fields.supportAgent), profileSupportAgent),
        "Priority": priority,
        "Channel": fields.channel || "",
        "Ticket Source": fields.ticketSource || "",
        "Issue Description": description,
      }
    };
    if (window.MAUSandzTicketRules) {
      return window.MAUSandzTicketRules.correctZohoPayload(result, workspaceText);
    }
    return result;
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

  function buildHashFallbackUrl(payload, targetUrl) {
    const encoded = base64UrlEncodeUnicode(JSON.stringify(payload));
    const separator = targetUrl.includes("#") ? "&" : "#";
    return `${targetUrl}${separator}${HASH_KEY}=${encoded}`;
  }

  function sendExtensionBridgeRequest(action, data) {
    return new Promise((resolve, reject) => {
      const requestId = `zta-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const timeoutId = window.setTimeout(() => {
        window.removeEventListener("message", onMessage);
        reject(new Error("Extension bridge timeout"));
      }, 1500);

      function onMessage(event) {
        const message = event && event.data;
        if (event.source !== window || !message || message.type !== BRIDGE_RESPONSE_TYPE || message.requestId !== requestId) {
          return;
        }

        window.clearTimeout(timeoutId);
        window.removeEventListener("message", onMessage);
        if (message.ok) {
          resolve(message.response || {});
          return;
        }
        reject(new Error(message.error || "Extension bridge error"));
      }

      window.addEventListener("message", onMessage);
      window.postMessage({
        type: BRIDGE_REQUEST_TYPE,
        requestId,
        action,
        data: data || {}
      }, "*");
    });
  }

  async function openZohoTicket() {
    const workspaceText = getWorkspaceText();
    if (!workspaceText || !workspaceText.trim()) {
      appendStatus("Workspace is empty. Add the ticket details first, then click Create Ticket.");
      return;
    }

    const payload = buildZohoPayload(workspaceText);
    const currentLock=window.MAUGetTicketCustomerLock?.();
    if (currentLock?.key && window.MAUCustomerSafety) {
      window.MAUCustomerSafety.enforcePayload(payload,currentLock.key,workspaceText);
    }
    copyFallbackPayload(payload);
    const targetUrl = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_ZOHO_NEW_TICKET_URL;
    const fallbackUrl = buildHashFallbackUrl(payload, targetUrl);

    try {
      const response = await sendExtensionBridgeRequest(ACTION_PREPARE_OR_FOCUS, {
        payload,
        targetUrl
      });
      if (response && response.ok === false) {
        throw new Error(response.error || "Extension bridge refused request");
      }
      return;
    } catch (error) {}

    window.open(fallbackUrl, "_blank", "noopener");
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
