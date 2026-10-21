(() => {
  const PLACEHOLDERS = new Set(["", "-", "none", "-none-", "n/a", "0", "dd mmm yyyy"]);
  const REGION_ONLY = new Set(["MINDANAO", "VISAYAS", "LUZON", "NCR"]);
  const MONTH_MAP = {
    jan: "January", feb: "February", mar: "March", apr: "April", may: "May", jun: "June",
    jul: "July", aug: "August", sep: "September", oct: "October", nov: "November", dec: "December"
  };
  const MONTH_PATTERN = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
  const WEEKDAY_PATTERN = "(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)";

  function decodeEntities(value = "") {
    return String(value)
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
      .replace(/&nbsp;/gi, "\u00a0")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&apos;|&#39;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">");
  }

  function normalizeSource(value = "") {
    return decodeEntities(value)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/[\u00a0\u202f]/g, " ");
  }

  const normalizeSpace = (value = "") => normalizeSource(value).replace(/[ \t]+/g, " ").trim();

  function todayPH() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric"
    }).formatToParts(new Date());
    const get = (type) => parts.find(x => x.type === type)?.value || "";
    return `${get("month")} ${Number(get("day"))}, ${get("year")}`;
  }

  function canonicalDate(monthRaw, dayRaw, yearRaw) {
    const month = MONTH_MAP[String(monthRaw || "").slice(0, 3).toLowerCase()] || monthRaw;
    return `${month} ${Number(dayRaw)}, ${yearRaw}`;
  }

  function canonicalTime(hourRaw, minuteRaw, meridiemRaw) {
    let hour = Number(hourRaw);
    let minute = minuteRaw == null || minuteRaw === "" ? 0 : Number(minuteRaw);
    const meridiem = String(meridiemRaw || "").toUpperCase();
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return "";
    if (meridiem) {
      if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return "";
      return `${hour}:${String(minute).padStart(2, "0")} ${meridiem}`;
    }
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return "";
    const ap = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${String(minute).padStart(2, "0")} ${ap}`;
  }

  function parseScheduleFragment(value = "") {
    const v = normalizeSpace(value);
    if (!v) return "";

    const pattern = new RegExp(
      `(${MONTH_PATTERN})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s*,?\\s*(\\d{4})` +
      `(?:\\s*(?:\\(${WEEKDAY_PATTERN}\\)|${WEEKDAY_PATTERN}))?` +
      `(?:\\s*(?:\\||,|-|–|—|at)?\\s*(\\d{1,2})(?::(\\d{2}))?\\s*(AM|PM))?`,
      "i"
    );
    const m = v.match(pattern);
    if (!m) return "";
    const date = canonicalDate(m[1], m[2], m[3]);
    const time = m[4] ? canonicalTime(m[4], m[5], m[6]) : "";
    return time ? `${date} ${time}` : date;
  }

  function normalizeSchedule(value = "") {
    const parsed = parseScheduleFragment(value);
    if (parsed) return parsed;

    let v = normalizeSpace(value);
    // If the copied Zoho row was flattened into one line, stop before obvious UI/email prose.
    v = v.split(/\s+(?=(?:Kindly|Please|Thank\s+you|Regards\b|Ticket\s*[:#]|CURRENT\s+STATE\b|From\b|To\b|Cc\b))/i)[0];
    v = v.replace(new RegExp(`\\s*\\(${WEEKDAY_PATTERN}\\)\\s*`, "gi"), " ");
    v = v.replace(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/gi, (_, h, mm, ap) => canonicalTime(h, mm || "00", ap));
    return normalizeSpace(v);
  }

  function lines(text) {
    return normalizeSource(text).split("\n").map(x => x.trim());
  }

  function nextMeaningful(ls, start) {
    for (let i = start; i < ls.length; i++) {
      const v = normalizeSpace(ls[i]);
      if (!v) continue;
      const low = v.toLowerCase();
      if (["svg", "savecancel", "save", "cancel"].includes(low)) continue;
      if (PLACEHOLDERS.has(low)) return "";
      return v;
    }
    return "";
  }

  function labelKey(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function fieldAfterLabel(text, labels) {
    const ls = lines(text);
    const wanted = new Set(labels.map(labelKey));
    for (let i = 0; i < ls.length; i++) {
      const raw = ls[i];
      const colonAt = raw.indexOf(":");
      if (colonAt >= 0) {
        const before = labelKey(raw.slice(0, colonAt));
        if (wanted.has(before)) {
          const inline = normalizeSpace(raw.slice(colonAt + 1));
          if (inline && !PLACEHOLDERS.has(inline.toLowerCase())) return inline;
          return nextMeaningful(ls, i + 1);
        }
      }
      const key = labelKey(raw);
      if (wanted.has(key)) return nextMeaningful(ls, i + 1);
    }
    return "";
  }

  function allRegex(pattern, text) {
    const out = [];
    for (const m of text.matchAll(pattern)) {
      const v = normalizeSpace(m[1] || "");
      if (v) out.push(v);
    }
    return out;
  }

  function validValue(v) {
    return !PLACEHOLDERS.has(normalizeSpace(v).toLowerCase());
  }

  function cleanTask(value) {
    return normalizeSpace(String(value || "").replace(/^(?:[•●▪◦‣*]\s*|[-–—]\s+|\d+[.)]\s+)/, ""));
  }

  // Read engineer activities from the actual customer request, including
  // bulletless task lists directly beneath the original issue description.
  // Do not mistake onsite tool-packing lists or service-desk replies for work.
  function extractTasks(text, issueDescription = "") {
    const ls = lines(text);
    const issue = normalizeSpace(issueDescription).toLowerCase();
    const normalizedIssue = issue.replace(/[^a-z0-9]+/g, "");
    const normalizedLine = value => normalizeSpace(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
    const heading = /^(?:please\s+do\s+the\s+following(?:\s+for)?|following\s+tasks?|engineer\s+task\s*\/\s*activity|engineer\s+tasks?|scope\s+of\s+work|work\s+to\s+be\s+performed|requested\s+tasks?|requested\s+activities|onsite\s+activities|activities\s+to\s+perform|work\s+scope|action\s+items)\s*:?\s*$/i;
    const explicitVerb = /^(?:check|inspect|verify|test|fix|repair|replace|replaced|replacing|clean|wipe|install|upgrade|update|perform|conduct|configure|reconfigure|troubleshoot|resolve|restore|migrate|setup|set\s+up|connect|disconnect|remove|mount|unmount|provide|apply|change|adjust|reboot|restart|retrigger|validate|deploy|provision|assemble|service|relocate|reimage|image|take\s+(?:a\s+)?backup|run\s+(?:a\s+)?(?:test|diagnostic))\b/i;
    const nounWork = /\b(?:upgrade|replacement|preventive\s+maintenance|cable\s+management|reconfiguration|installation|troubleshooting|repair|restoration|migration|health\s+check|cleaning|maintenance\s+activity)\b/i;
    const stop = /^(?:store\s+name\s*:|serial\s*(?:#|number)\s*:|address\s*:|please\s+contact\b|location\s+address\b|company\s+name\b|contact\s+name\b|mobile\s+number\b|site\s+contact\b|it\s+contact\b|required\s+date\b|created\s+date\b|customer\s+visit\b|ticket\s+(?:information|category|owner|closed)\b|issue\s+(?:category|description)\b|support\s+(?:agent|level)\b|assigned\s+engineer\b|priority\b|severity\s+level\b|from\b\s*:|to\b\s*:|cc\b\s*:|regards\b|best\s+regards\b|thank\s+you\b|current\s+state\b|my\s+pins\b|ticket\s+properties\b|job\s+done\b|resolution\b|conforme\b|customer\s+remarks\b|[\-–—]{2,}\s*on\s+\w{3}\b|screenshot\s+for\b|kindly\s+bring\b|please\s+bring\b|(?:kindly|please)\s+provide\s+the\s+list\s+of\s+field\s+engineers\b|following\s+tools\b|tools\s+(?:for|to)\s+(?:this|bring)\b)/i;
    const ignore = /^(?:ss|sl|gs|sa|j|[.·]|save|savecancel|cancel|reply\s+all|\d+\s+conversations?|time\s+entry|attachment|activity|approval|history|priority|status|open|closed|none|n\/a|\d{1,2}:\d{2}\s*[ap]m)$/i;
    const toolLine = /^(?:screwdriver|screw\s+for|empty\s+external\s+hard\s+drive|hdd\/ssd\s+enclosure|sata\s+cable|usb\s+flash\s+drive|crimper|rj45|twist\s+tie|thermal\s+paste)\b/i;

    const candidates = [];
    function harvest(start, mode) {
      const tasks = [];
      let blanks = 0;
      for (let j = start; j < ls.length && j < start + 28; j++) {
        const raw = ls[j];
        if (!raw) {
          if (++blanks >= 3 && tasks.length) break;
          continue;
        }
        blanks = 0;
        const value = cleanTask(raw);
        if (!value) continue;
        if (stop.test(value) || toolLine.test(value) || heading.test(value)) break;
        if (ignore.test(value) || /^\b(?:kindly\s+inform|please\s+inform|we\s+received|we\s+will|as\s+advised|this\s+message|site\s*id\s*:|https?:\/\/)\b/i.test(value)) break;
        const bullet = /^(?:[•●▪◦‣*]\s*|[-–—]\s+|\d+[.)]\s+)/.test(raw);
        const taskLike = explicitVerb.test(value) || nounWork.test(value) || bullet;
        // Unlabelled lists must look like engineer work, not ticket metadata.
        if (!taskLike) break;
        if (value.length > 240) break;
        if (tasks[tasks.length - 1] !== value) tasks.push(value);
      }
      if (tasks.length) candidates.push({tasks, start, mode});
    }

    for (let i = 0; i < ls.length; i++) {
      if (heading.test(ls[i])) harvest(i + 1, "heading");
      // Zoho copies repeat the issue description in the Properties pane and in
      // the original customer message. Only the latter has a genuine work list.
      if (normalizedIssue && normalizedIssue.length >= 12 && normalizedLine(ls[i]) === normalizedIssue) {
        harvest(i + 1, "original-request");
      }
    }
    // Some customer emails provide task lists but no scope heading. Only accept
    // two or more consecutive work-like lines, never a packing/tools list.
    if (!candidates.length) {
      for (let i = 0; i < ls.length; i++) {
        if (explicitVerb.test(ls[i]) || nounWork.test(ls[i])) harvest(i, "task-list");
      }
    }
    // Prefer the longest supported scope; on a tie prefer the original request
    // found later in Zoho's reverse-chronological conversation history.
    candidates.sort((a, b) => b.tasks.length - a.tasks.length || b.start - a.start);
    const best = candidates[0];
    if (!best || (best.mode === "task-list" && best.tasks.length < 2)) return [];
    return best.tasks;
  }

  function findTicketNumber(src) {
    // The main Zoho ticket number next to Reply All is more reliable than ticket IDs visible in search/list panes.
    const reply = src.match(/Reply\s+All[\s\S]{0,120}?#\s*(\d{5,7})\b/i);
    if (reply) return reply[1];

    const explicit = src.match(/(?:^|\n)\s*(?:Ticket(?:\s+No\.?|\s+ID)?\s*[:#]?\s*)?#\s*(\d{5,7})\s*(?=\n|$)/im);
    if (explicit) return explicit[1];
    const fallback = src.match(/\bTicket(?:\s+No\.?|\s+ID)?\s*[:#]?\s*(\d{5,7})\b/i);
    if (fallback) return fallback[1];
    const ticketMatches = [...src.matchAll(/#\s*(\d{5,7})\b/g)].map(m => m[1]);
    return ticketMatches[0] || "";
  }

  function scheduleCandidates(src) {
    const candidates = [];
    const add = (raw, index) => {
      const parsed = normalizeSchedule(raw);
      if (parsed) candidates.push({ value: parsed, index: Number.isFinite(index) ? index : Number.MAX_SAFE_INTEGER });
    };

    const contextualPatterns = [
      /proceed\s+with\s+the\s+onsite\s+support\s+activity\s+on\s+([^\n]+)/gi,
      /^\s*(?:Customer\s+Visit\s+Schedule\s+Date|Visit\s+Schedule|Schedule|Required\s+date)\s*:\s*\*?\s*([^\n]+)/gim
    ];
    for (const re of contextualPatterns) {
      for (const m of src.matchAll(re)) add(m[1], m.index ?? Number.MAX_SAFE_INTEGER);
    }

    // Also support label on one line and date on the next line.
    const ls = lines(src);
    let running = 0;
    for (let i = 0; i < ls.length; i++) {
      if (/^(?:Customer\s+Visit\s+Schedule\s+Date|Visit\s+Schedule|Schedule|Required\s+date)\s*:?$/i.test(ls[i])) {
        const next = nextMeaningful(ls, i + 1);
        add(next, running);
      }
      running += (ls[i]?.length || 0) + 1;
    }

    candidates.sort((a, b) => a.index - b.index);
    return candidates;
  }

  function extractTicketData(text) {
    const src = normalizeSource(text);
    const ticketNumber = findTicketNumber(src);

    const stores = allRegex(/^\s*Store\s+Name\s*:\s*(.+?)\s*$/gim, src);
    // Use Zoho Customer Company Name for the CSA company field; store name is a fallback.
    const mappedCompany = fieldAfterLabel(src, ["Customer Company Name", "Company Name"]);
    const companyName = validValue(mappedCompany) ? mappedCompany : (stores[stores.length - 1] || "");

    const contacts = allRegex(/Please\s+contact\s+([^\n]+?)\s+for\s+any\s+questions/gi, src);
    const contactName = contacts.length ? contacts[contacts.length - 1] : fieldAfterLabel(src, ["Contact Name"]);

    let mobile = fieldAfterLabel(src, ["Mobile Number"]);
    if (!/\d{7,}/.test(mobile || "")) {
      const phoneMatches = [...src.matchAll(/(?:IT\s+Contact\s+person|Contact\s+person)[^\n]*?((?:\+?63|0)\d(?:[\d\s()-]*\d))/gi)];
      mobile = phoneMatches.length ? phoneMatches[phoneMatches.length - 1][1] : "";
    }
    mobile = mobile ? normalizeSpace(mobile).replace(/[^+\d]/g, "") : "";
    if (["0", "+0"].includes(mobile)) mobile = "";

    const schedules = scheduleCandidates(src);
    const visitSchedule = schedules.length ? schedules[0].value : "";

    const addresses = allRegex(/^\s*Address\s*:\s*(.+?)\s*$/gim, src);
    let locationAddress = addresses.length ? addresses[addresses.length - 1] : fieldAfterLabel(src, ["Location Address", "Customer Location Address"]);
    if (REGION_ONLY.has((locationAddress || "").toUpperCase())) locationAddress = "";
    locationAddress = normalizeSpace((locationAddress || "").replace(/^Stall\s*#\s*:\s*/i, ""));

    const ticketCategory = fieldAfterLabel(src, ["Ticket Category", "Ticket Category*"]);
    const issueCategory = fieldAfterLabel(src, ["Issue Category", "Issue Category*"]);
    const issueDescription = fieldAfterLabel(src, ["Issue Description"]);

    const serials = allRegex(/^\s*Serial\s*#\s*:\s*([^\n]+)/gim, src);
    let serialNumber = serials.length ? serials[serials.length - 1] : fieldAfterLabel(src, ["Serial Number"]);
    serialNumber = validValue(serialNumber) ? normalizeSpace(serialNumber) : "";

    return {
      ticket_number: ticketNumber,
      company_name: normalizeSpace(companyName),
      contact_name: normalizeSpace(contactName),
      mobile_number: mobile,
      visit_schedule: visitSchedule,
      created_date: todayPH(),
      location_address: locationAddress,
      ticket_category: validValue(ticketCategory) ? normalizeSpace(ticketCategory) : "",
      issue_category: validValue(issueCategory) ? normalizeSpace(issueCategory) : "",
      issue_description: validValue(issueDescription) ? normalizeSpace(issueDescription) : "",
      serial_number: serialNumber,
      engineer_tasks: extractTasks(src, issueDescription)
    };
  }

  function splitTicketBlocks(text) {
    const src = normalizeSource(text);
    if (!src.trim()) return [];

    // Explicit separators remain the most predictable option for custom field blocks.
    const separated = src
      .split(/\n\s*(?:={3,}|-{3,}|_{3,})\s*\n/g)
      .map(x => x.trim())
      .filter(x => /#\s*\d{5,7}\b|\bTicket(?:\s+No\.?|\s+ID)?\s*[:#]?\s*\d{5,7}\b/i.test(x));
    if (separated.length > 1) return separated;

    // Multiple full Zoho copies normally start with a fresh "Tickets" heading.
    const pageChunks = src
      .split(/(?=^Tickets\s*$)/gim)
      .map(x => x.trim())
      .filter(x => /Reply\s+All[\s\S]{0,120}?#\s*\d{5,7}\b/i.test(x));
    if (pageChunks.length > 1) return pageChunks;

    // Multiple compact blocks can also be identified by their Reply All ticket anchors.
    const anchors = [...src.matchAll(/^\s*Reply\s+All\s*\n\s*#\s*(\d{5,7})\s*$/gim)];
    if (anchors.length > 1) {
      const blocks = [];
      for (let i = 0; i < anchors.length; i++) {
        const current = anchors[i];
        const priorEnd = i === 0 ? 0 : (anchors[i - 1].index ?? 0);
        let start = src.lastIndexOf("\nTickets\n", current.index ?? 0);
        if (start < priorEnd) start = priorEnd;
        else start += 1;
        const end = i + 1 < anchors.length ? (anchors[i + 1].index ?? src.length) : src.length;
        blocks.push(src.slice(start, end).trim());
      }
      return blocks;
    }

    return [src.trim()];
  }

  function extractMultipleTicketData(text) {
    const blocks = splitTicketBlocks(text);
    const items = [];
    const seen = new Set();
    for (const block of blocks) {
      const item = extractTicketData(block);
      const ticket = String(item.ticket_number || "").replace(/\D/g, "");
      if (!ticket || seen.has(ticket)) continue;
      item.ticket_number = ticket;
      seen.add(ticket);
      items.push(item);
    }
    return items;
  }

  function analyzeTicketData(data) {
    const warnings = [];
    const notes = [];
    const d = data || {};

    if (!String(d.ticket_number || "").replace(/\D/g, "")) warnings.push("Ticket number is missing.");
    if (!normalizeSpace(d.company_name)) warnings.push("Company / Store Name is missing.");
    if (!normalizeSpace(d.location_address)) warnings.push("Full location address is missing or only a region was detected.");
    if (!normalizeSpace(d.visit_schedule)) warnings.push("Customer visit schedule was not detected.");
    if (!normalizeSpace(d.serial_number)) warnings.push("Serial number was not detected.");
    if (!Array.isArray(d.engineer_tasks) || !d.engineer_tasks.length) warnings.push("Engineer Task / Activity is empty.");

    const schedule = normalizeSpace(d.visit_schedule);
    if (/\b(?:Kindly|Please|Field\s+Engineer|CURRENT\s+STATE|Thank\s+you|Regards)\b/i.test(schedule)) {
      warnings.push("Visit schedule contains copied email/UI text and should be reviewed.");
    }

    const allText = [d.company_name, d.contact_name, d.location_address, d.issue_description, d.serial_number]
      .concat(Array.isArray(d.engineer_tasks) ? d.engineer_tasks : [])
      .join(" ");
    if (/[^\x00-\x7F]/.test(allText)) notes.push("Unicode/special characters detected and will be preserved in the DOCX.");
    notes.push("Support Agent and Assigned Engineer will be blank in the generated CSA.");

    return { warnings, notes };
  }

  window.CSAParser = {
    extractTicketData,
    extractMultipleTicketData,
    splitTicketBlocks,
    extractTasks,
    analyzeTicketData,
    todayPH,
    normalizeSchedule,
    normalizeSpace,
    parseScheduleFragment
  };
})();
