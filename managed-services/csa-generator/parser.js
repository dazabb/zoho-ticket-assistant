(() => {
  const PLACEHOLDERS = new Set(["", "-", "none", "-none-", "n/a", "0", "dd mmm yyyy"]);
  const REGION_ONLY = new Set(["MINDANAO", "VISAYAS", "LUZON", "NCR"]);

  // CSA site knowledge is a fallback only. Explicit Address / Site Address
  // text in the CURRENT ticket always wins. This helps older Zoho tickets
  // where Customer Location Address contains only a region or repeats the
  // store name instead of the physical service address.
  const SITE_KNOWLEDGE = [
    { company:"Penshoppe SM City GENSAN", aliases:["PENSHOPPE SM CITY GENSAN","P-BTQ SM City Gen. Santos"], address:"# 155A and 156A SM City Gensan Cor Santiago Blvd and San Miguel St General Santos City" },
    { company:"PENSHOPPE KCC MALLGENSAN", aliases:["PENSHOPPE KCC MALL GENSAN","P-BTQ KCC Mall Gen. Santos"], address:"UG Floor Code No. 107-A New KCC Mall of Gensan, J. Catolico Sr. Ave., General Santos City" },
    { company:"PENSHOPPE AYALA DAVAO", aliases:["P-BTQ Ayala Davao"], address:"Unit 1147-1149, Level 1, Ayala Abreeza Mall, JP Laurel Ave., Bajada, Davao City" },
    { company:"Penshoppe SM City Mindpro", aliases:["P-BTQ SM City Mindpro"], address:"Unit 22-23 2/F, SM City Mindpro, La Purisima St., Zamboanga City" },
    { company:"X122- Oxygen -BTQ SM Seaside City Cebu", aliases:["Oxygen -BTQ SM Seaside City Cebu","O2-BTQ SM Seaside City Cebu"], address:"2039 – 2040 2nd Level, SM Seaside Cebu, South Road Properties, Cebu City" },
    { company:"Regatta Robinsons Iloilo", aliases:["R-BTQ Robinsons Iloilo"], address:"G/F Robinsons Place Iloilo Roxas Village, Iloilo City, Iloilo" },
    { company:"Oxygen-BTQ SM City Iloilo", aliases:["X019- Oxygen-BTQ SM City Iloilo","O2-BTQ SM City Iloilo"], address:"S-40, UGF, SM City Iloilo, Benigno Aquino Ave., Mandurriao, Iloilo City" },
    { company:"OXYGEN KCC MARBEL", aliases:["O2-BTQ KCC Marbel"], address:"2/F KCC Mall of Marbel Zone II (Pob.) City of Koronadal, South Cotabato" },
    { company:"PENSHOPPE ACCESSORIES SM BUTUAN", aliases:["P-BTQ Accs SM Butuan"], address:"G/F SM BUTUAN LAPU-LAPU POB. (BRGY. 8), BUTUAN CITY AGUSAN DEL NORTE" },
    { company:"Penshoppe Savemore Tacloban", aliases:["P-BTQ Savemore Tacloban"], address:"GF Unit 125-126, SM Savemore Market Tacloban, J. Romualdez St., Tacloban City, Leyte" },
    { company:"Oxygen SM City GENSAN", aliases:["O2-BTQ SM City Gen. Santos"], address:"# 141-142 SM City Gensan Cor Santiago Blvd and San Miguel St General Santos City" },
    { company:"X079- Oxygen-BTQ SM City Bacolod", aliases:["Oxygen-BTQ SM City Bacolod"], address:"Oxygen SMBD 150 Bldg B, SM City Bacolod, Brgy 062, Poblacion Reclamation Area, Bacolod City" },
    { company:"Regatta SM City Iloilo", aliases:["R-BTQ SM City Iloilo"], address:"Unit 1012 Uppergroundfloor SM City Iloilo, Benigno Aquino Ave. Mandurriao Iloilo City" },
    { company:"Memo Robinsons Iligan", aliases:["M-BTQ Robinsons Iligan"], address:"Stall # 157 - 158B G/F Robinsons Place, Macapagal Highway Tubod Iligan City" },
    { company:"Forme Robinsons Iligan", aliases:["F-BTQ Robinsons Iligan"], address:"Stall # 159 - 160 G/F Robinsons Place, Macapagal Highway Tubod Iligan City" },
    { company:"Penshoppe Sindangan", aliases:["P-BTQ Sindangan"], address:"SMCT Property/DES Appliance New Building, Ninoy Aquino Boulevard, Poblacion, Sindangan, Zamboanga del Norte" },
    { company:"X024- Oxygen BTQ Ayala Center Cebu", aliases:["O2-BTQ Ayala Center Cebu"], address:"Level 2, Space 248, Ayala Center Cebu, Cebu Business Park, Cebu City" },
    { company:"Oxygen Robinsons Valencia", aliases:["O2-BTQ Robinsons Valencia"], address:"Level 1, Robinsons Place Valencia, Hagkol, Bagontaas, Valencia, Bukidnon" },
    { company:"Regatta Robinsons Valencia", aliases:["R-BTQ Robinsons Valencia"], address:"Level 1, Robinsons Place Valencia, Hagkol, Bagontaas, Valencia, Bukidnon" },
    { company:"Forme SM Lanang Premier Davao", aliases:["F-BTQ SM Lanang Premier"], address:"Unit 204, 2nd floor, SM Lanang Premier, J.P. Laurel Avenue, Davao City" },
    { company:"X195- Oxygen BTQ Gmall Toril Davao", aliases:["O2-BTQ Gmall Toril Davao"], address:"UGF Gaisano Mall Toril Davao City, Davao Del Sur" },
    { company:"P052- Penshoppe Boutique SM City Cebu", aliases:["Penshoppe SM City Cebu","P-BTQ SM City Cebu"], address:"Unit B1102-3, UGF, SM City Cebu, North Reclamation Area, Cebu City" },
    { company:"Forme Robinsons Ormoc", aliases:["F-BTQ Robinsons Place Ormoc"], address:"LEVEL 1 – TENANT 134-135A ROBINSONS PLACE ORMOC, BRGY. COGON, ORMOC CITY 6541" },
    { company:"Penshoppe Accessories Primark Tacurong", aliases:["P-BTQ Accs Primark Tacurong"], address:"Magsaysay Avenue, Bonifacio Street, Tacurong City, Sultan Kudarat" },
    { company:"Forme Robinsons Place Butuan", aliases:["Forme Robinsons Butuan","F-BTQ Robinsons Place Butuan"], address:"Level 1 EXP 1-132, 1-133A Robinsons Place, Brgy. Bayanihan, Butuan City" },
    { company:"Forme KCC GENSAN", aliases:["F-BTQ KCC Mall Gen. Santos"], address:"Unit B8-0009A/B upper G/F, KCC Mall of Gensan, J. Catolico Ave., General Santos City" }
  ];
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

  // A work request can arrive as bullets, a paragraph, a form, or a forwarded
  // email. Only extract work to be performed, never a list of tools to bring.
  function extractTasks(text, issueDescription = "") {
    const ls = lines(text);
    const normalizeKey = x => normalizeSpace(x).toLowerCase().replace(/[^a-z0-9]+/g, "");
    const issueKey = normalizeKey(issueDescription);
    const heading = /^(?:(?:proposed|requested|planned|required|onsite|on-site|field\s+engineer|engineer|technician|FE)?\s*(?:work\s*(?:scope|details|order|instructions|required|requested|activities|tasks)|scope\s*of\s*(?:work|service)|task(?:s|\s+list)?|activities|activity|action\s*(?:items|plan|required)|service\s*(?:required|request|activities)|job\s*(?:description|details)|work\s*to\s*(?:do|be\s+performed)|things\s*to\s*do|to\s*be\s*done)|please\s+(?:do|perform|carry\s+out)\s+(?:the\s+)?following(?:\s+(?:for|tasks))?|following\s+(?:tasks|activities|work)|engineer\s+task\s*\/\s*activity|perform\s+the\s+following)\s*:?\s*$/i;
    const workVerb = /^(?:check|inspect|verify|test|fix|repair|replace|replaced|replacing|clean|wipe|install|upgrade|update|perform|conduct|configure|reconfigure|troubleshoot|resolve|restore|migrate|set\s*up|setup|connect|disconnect|remove|mount|unmount|provide|apply|change|adjust|reboot|restart|retrigger|validate|deploy|provision|stage|staging|assemble|relocate|reimage|image|take\s+(?:a\s+)?backup|run\s+(?:a\s+)?(?:test|diagnostic)|diagnose|troubleshoot|re-seat|reseat|replace\s+and\s+test|clean\s+and\s+inspect)\b/i;
    const nounWork = /\b(?:upgrade|replacement|preventive\s+maintenance|cable\s+management|reconfiguration|installation|troubleshooting|repair|restoration|migration|health\s+check|cleaning|maintenance\s+activity|data\s+transfer|software\s+update|cable\s+replacement|ssd\s*(?:&|and|\+)\s*ram)\b/i;
    const workIntent = /\b(?:please|kindly|request(?:ing|ed)?|need|needs|requires?|required|should|will|must|tasked\s+to|assigned\s+to|for\s+(?:our|the)\s+engineers?\s+to|technician\s+to|on.?site\s+engineer\s+to|scope\s+(?:is|includes?))\b/i;
    const actionAnywhere = /\b(?:replace|upgrade|install|fix|repair|troubleshoot|inspect|clean|check|test|restore|configure|perform|migrate|reboot|restart|update|deploy|conduct|verify|reseat|re-seat|run|remove|setup|set\s+up|relocate|provision|stage|staging)\b/i;
    const stop = /^(?:store\b|branch\b|outlet\b|site\s*(?:name|address)?\s*:|serial\b|(?:service\s*)?address\s*:|please\s+contact\b|location\b|company\b|customer\b|client\b|contact\b|mobile\b|phone\b|city\b|province\b|required\s+date\b|created\s+date\b|customer\s+visit\b|ticket\s+(?:information|category|owner|closed)\b|issue\s+(?:category|description)\b|support\s+(?:agent|level)\b|assigned\s+engineer\b|priority\b|severity\b|from\s*:|to\s*:|cc\s*:|regards\b|best\s+regards\b|thank\s+you\b|current\s+state\b|my\s+pins\b|ticket\s+properties\b|job\s+done\b|resolution\b|conforme\b|customer\s+remarks\b|[-–—]{2,}\s*on\s+\w{3}\b|screenshot\s+for\b|kindly\s+bring\b|please\s+bring\b|(?:kindly|please)\s+provide\s+the\s+list\s+of\s+field\s+engineers\b|following\s+tools\b|tools\s+(?:for|to)\s+(?:this|bring)\b|list\s+of\s+tools\b|materials\s+(?:required|needed|to\s+bring)\b|checklist\s+of\s+tools\b|attachments?\b|reply\s+all\b|\w+@\w+\.|https?:\/\/)/i;
    const ignore = /^(?:ss|sl|gs|sa|j|[.·]|save|savecancel|cancel|reply\s+all|\d+\s+conversations?|time\s+entry|attachment|activity|approval|history|priority|status|open|closed|none|n\/a|\d{1,2}:\d{2}\s*[ap]m)$/i;
    const toolLine = /^(?:screwdriver|screw\s+for|empty\s+external\s+hard\s+drive|hdd\/ssd\s+enclosure|sata\s+cable|usb\s+flash\s+drive|crimper|rj45|twist\s+tie|thermal\s+paste|power\s+strip|multimeter|ladder)\b/i;
    const candidates = [];
    function taskLike(value, raw, mode) {
      const bullet = /^(?:[•●▪◦‣*]\s*|[-–—]\s+|\d+[.)]\s+)/.test(raw);
      if (workVerb.test(value) || nounWork.test(value)) return true;
      // Bullets under a work heading may be phrased as nouns ("RAM module replacement").
      return Boolean(bullet && mode !== "task-list" && value.length < 150 && !/^(?:note|remark|date|time|ticket|phone|contact|serial|location)\b/i.test(value));
    }
    function harvest(start, mode, firstInline = "") {
      const tasks = [];
      let blanks = 0;
      const options = firstInline ? [{raw:firstInline, index:start-1}].concat(ls.slice(start, start + 30).map((raw, i)=>({raw,index:start+i}))) : ls.slice(start,start+30).map((raw,i)=>({raw,index:start+i}));
      for (const {raw} of options) {
        if (!raw) { if (++blanks >= 3 && tasks.length) break; continue; }
        blanks = 0;
        const value = cleanTask(raw);
        if (!value) continue;
        if (stop.test(value) || toolLine.test(value) || heading.test(value) || ignore.test(value)) break;
        if (/^(?:kindly\s+inform|please\s+inform|we\s+received|we\s+will\s+coordinate|as\s+advised|this\s+message|site\s*id\s*:|\s*https?:\/\/)/i.test(value)) break;
        if (value.length > 260 || !taskLike(value, raw, mode)) break;
        if (!tasks.some(x => normalizeKey(x) === normalizeKey(value))) tasks.push(value);
      }
      if (tasks.length) candidates.push({tasks, start, mode});
    }
    ls.forEach((raw, i) => {
      if (heading.test(raw)) harvest(i+1,'heading');
      const colon = raw.match(/^([^:]{3,62}):\s*(.+)$/);
      if (colon && heading.test(colon[1])) harvest(i+1,'heading',colon[2]);
      if (issueKey.length >= 12 && normalizeKey(raw) === issueKey) harvest(i+1,'original-request',raw);
    });
    // Bare lists and work paragraphs occur often in the oldest customer reply.
    // Prefer a consecutive list, or a *clearly worded* requested work sentence.
    if (!candidates.length) {
      ls.forEach((raw,i) => {
        if (workVerb.test(raw) || nounWork.test(raw)) harvest(i,'task-list');
      });
    }
    const paragraphs = [];
    for (let i = 0; i < ls.length; i++) {
      const raw = ls[i];
      if (!raw || raw.length > 370 || stop.test(raw) || /^\s*(?:[-•*]|\d+[.)])\s/.test(raw) || /^\s*(?:Original\s+Message|From|To|Cc|Subject)\s*:/i.test(raw)) continue;
      if (/(?:please|kindly|request(?:ing|ed)?|need|requires?|scope\s+(?:is|includes?)|we\s+(?:would\s+like|need))\b/i.test(raw) && actionAnywhere.test(raw) && workIntent.test(raw)) {
        let value = raw.replace(/^(?:please|kindly)\s*/i, "");
        value = value.replace(/^(?:we\s+(?:would\s+like|need)|we\s+are\s+requesting|request(?:ing|ed)?|need|needs)\s+(?:(?:an?|the|our)\s+)?(?:(?:field|onsite|on-site)\s+)?(?:technician|engineer|FE)?\s*(?:to|for)?\s*/i, "");
        value = normalizeSpace(value);
        if (value.length >= 12 && actionAnywhere.test(value) && !/\b(?:bring|tools|prepare\s+the\s+equipment)\b/i.test(value)) paragraphs.push({tasks:[value],start:i,mode:'paragraph'});
      }
    }
    candidates.push(...paragraphs);
    // Work in the original issue is more reliable than recent support replies.
    candidates.sort((a,b) => b.tasks.length-a.tasks.length ||
      ({'original-request':3,'heading':2,'task-list':1,'paragraph':0}[b.mode] - {'original-request':3,'heading':2,'task-list':1,'paragraph':0}[a.mode]) || b.start-a.start);
    const best = candidates.find(c => c.mode !== "task-list" || c.tasks.length >= 2);
    if (!best) return [];
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

  // Field names differ between Zoho layouts, customers and forwarded emails.
  // Match known synonyms and score candidates; do not take address lines from
  // sender signatures, unrelated quoted ticket lists, or tool inventories.
  function sectionCandidates(src, labelConfigs) {
    const ls = lines(src);
    const candidates = [];
    const genericBadValue = /^(?:tickets|analytics|customers|reply\s+all|ticket\s+properties|contact\s+info|customer\s+information|ticket\s+information|issue\s+category|issue\s+description|status|open|closed|savecancel|email|phone|mobile|country|profile|ss|sl|sa|\w+@\w+\.|https?:\/\/)/i;
    for (let i = 0; i < ls.length; i++) {
      const raw = ls[i];
      if (!raw || raw.length > 260) continue;
      for (const {rx,score,label} of labelConfigs) {
        const m=raw.match(rx);
        if (!m) continue;
        const inline=normalizeSpace(m[1] || "");
        let value = inline || nextMeaningful(ls,i+1);
        if (!value || !validValue(value) || genericBadValue.test(value)) continue;
        if (value.length > 190 || value.includes('@') || /^(?:\d{1,2}\s+(?:conversations|time\s+entry))\b/i.test(value)) continue;
        if (!inline && i + 1 < ls.length && /^\w[^:]{1,35}:\s*/.test(ls[i+1])) continue;
        // A signature often contains the company address of the support agent;
        // ignore unqualified generic address labels below a "Best Regards".
        const context=ls.slice(Math.max(0,i-4),i).join(" ");
        const nearSignature=/\b(?:Best\s+Regards|Thank\s+you\s+and\s+regards|This\s+email\s+and\s+files|CONFIDENTIALITY\s+NOTICE)\b/i.test(context);
        const isZoho= /Customer\s+Information|Ticket\s+Properties|Account\s+Name/i.test(ls.slice(Math.max(0,i-15),i).join(" "));
        candidates.push({value,score:score-(nearSignature?85:0)+(isZoho && /Customer\s+Company|Account\s+Name/i.test(label||'')?10:0),index:i,label});
      }
    }
    return candidates;
  }

  function selectedValue(candidates) {
    if (!candidates.length) return {value:"",label:""};
    candidates.sort((a,b)=>b.score-a.score || b.index-a.index);
    return candidates[0];
  }

  function comparablePlace(value = "") {
    return normalizeSpace(value)
      .toLowerCase()
      .replace(/\b(?:stall|store|branch|outlet|site)\s*#?\s*:?/g, " ")
      .replace(/\b(?:x|p|r|f|m|o2)\d{2,4}\s*[-–—]?\s*/g, " ")
      .replace(/\b(?:btq|boutique)\b/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function samePlaceLabel(a, b) {
    const x = comparablePlace(a), y = comparablePlace(b);
    if (!x || !y) return false;
    return x === y || (x.length >= 10 && y.length >= 10 && (x.includes(y) || y.includes(x)));
  }

  function addressStrength(value = "") {
    const v = normalizeSpace(value);
    if (!v || REGION_ONLY.has(v.toUpperCase())) return 0;
    let score = 0;
    if (/\d/.test(v)) score += 22;
    if (/\b(?:unit|stall|space|tenant|level|floor|g\/?f|ugf|2\/?f|1\/?f|3\/?f|4\/?f|bldg|building|mall|robinsons|sm\s+city|kcc|gaisano|plaza|property)\b/i.test(v)) score += 24;
    if (/\b(?:street|st\.?|road|rd\.?|avenue|ave\.?|boulevard|blvd\.?|highway|hwy\.?|brgy\.?|barangay|poblacion|reclamation|business\s+park)\b/i.test(v)) score += 28;
    if (/\b(?:city|province|del\s+norte|del\s+sur|bukidnon|leyte|iloilo|cebu|davao|cotabato|zamboanga|gensan|general\s+santos|bacolod|butuan|ormoc|tacurong)\b/i.test(v)) score += 18;
    if (/,/.test(v)) score += 8;
    if (v.length >= 30) score += 10;
    return score;
  }

  function findKnownSite(companyName = "", storeName = "") {
    const keys = [storeName, companyName].map(comparablePlace).filter(Boolean);
    if (!keys.length) return null;
    let best = null;
    for (const entry of SITE_KNOWLEDGE) {
      const names = [entry.company].concat(entry.aliases || []).map(comparablePlace).filter(Boolean);
      for (const key of keys) {
        for (const name of names) {
          if (key === name || (key.length >= 12 && name.length >= 12 && (key.includes(name) || name.includes(key)))) {
            const score = key === name ? 100 : Math.min(key.length, name.length);
            if (!best || score > best.score) best = { ...entry, score };
          }
        }
      }
    }
    return best;
  }

  function addressLooksReal(value) {
    const v=normalizeSpace(value);
    if (!v || REGION_ONLY.has(v.toUpperCase()) || /^(?:philippines|manila|cebu|laguna|metro\s+manila|ncr|city|province)$/i.test(v)) return false;
    if (/@|https?:\/\/|ticket\s*#|kindly|please\s+inform/i.test(v)) return false;
    return v.length >= 8 && /[a-z]{2}/i.test(v);
  }

  function extractTicketData(text) {
    const src=normalizeSource(text);
    const ticketNumber=findTicketNumber(src);
    const company=sectionCandidates(src,[
      // Account Name may identify the parent organisation, but employees use
      // the actual store / branch / site as Company Name on a CSA. Treat
      // customer company fields only as fallback when no work site is stated.
      {rx:/^Account\s*Name\s*\*?\s*[:=\-]?\s*(.*)$/i,score:55,label:'Zoho Account Name'},
      {rx:/^Company\s*Name\s*[:=\-]\s*(.*)$/i,score:165,label:'Explicit Company Name'},
      {rx:/^(?:Customer\s*Company\s*Name|Customer\s*Company)\s*[:=\-]?\s*(.*)$/i,score:135,label:'Customer Company Name'},
      {rx:/^(?:Company\s*(?:Name)?|Client\s*(?:Name)?|Customer\s*(?:Name)?|End\s*User\s*(?:Name)?|Organization\s*(?:Name)?|Organisation\s*(?:Name)?|Business\s*(?:Name)?|Merchant\s*(?:Name)?|Retailer\s*(?:Name)?)\s*[:=\-]\s*(.*)$/i,score:105,label:'Company Name'},
      {rx:/^(?:Company\s*Name|Client\s*Name|Customer\s*Name|End\s*User|Organization\s*Name|Merchant\s*Name)\s*\*?\s*$/i,score:96,label:'Company Name'},
      {rx:/^(?:for\s+customer|on\s+behalf\s+of|client\s+is)\s+(.+)$/i,score:45,label:'Customer'}
    ]);
    const sites=sectionCandidates(src,[
      {rx:/^(?:Store|Branch|Outlet|Site|Shop|Office|Warehouse|Facility|Venue|Establishment|Installation\s*Site|Deployment\s*Site|Work\s*Site|Project\s*Site|Store\s*\/\s*Branch)(?:\s*(?:Name|Code|Location))?\s*[:=\-]\s*(.*)$/i,score:110,label:'Site Name'},
      {rx:/^(?:Store|Branch|Outlet|Site|Shop|Office|Warehouse|Facility|Venue|Establishment|Installation\s*Site|Deployment\s*Site|Work\s*Site)(?:\s*Name)?\s*\*?$/i,score:90,label:'Site Name'},
      // Several service desks name the store in the customer request rather
      // than as a formal field, e.g. "Please do the following for ...".
      {rx:/^(?:Please|Kindly)\s+(?:do|perform|complete|carry\s+out)\s+the\s+following\s+(?:for|at)\s+(.+)$/i,score:85,label:'Requested Work Site'}
    ]);
    // Site is a location name, not a street address. Prefer explicit names;
    // skip Region/City values and actual street addresses as "site names".
    const siteOptions=sites.filter(c=>!REGION_ONLY.has(c.value.toUpperCase()) &&
      !/^(?:G\/?F|\d+(?:\/?F|\/F|\s*(?:st|nd|rd|th)\s*floor|\s+(?:street|st\.?|road|rd\.?|avenue|ave\.?|brgy\.?|barangay)))\b/i.test(c.value));
    const pickedSite=selectedValue(siteOptions);
    const storeName=pickedSite.value||"";
    // The CSA's Company Name is the place receiving the engineer's visit,
    // even when Zoho's Account Name is a legal parent organisation. If a
    // ticket has no Store Name field, sometimes its title still states it.
    const ls=lines(src);
    const subjectSites=[];
    for (let i=1;i<ls.length;i++) {
      if (!/^Reply\s+All$/i.test(ls[i])) continue;
      const before=ls.slice(Math.max(0,i-3),i).filter(Boolean).pop() || '';
      const subject=before.split('\u007c')[0].trim();
      if (!before.includes('|') || !subject || subject.length>110) continue;
      const inferred=subject.replace(/^[^_]{2,35}_\s*/, '').trim();
      if (inferred.length>=4 && !/^(?:sandez|tickets|all tickets)$/i.test(inferred)) {
        subjectSites.push({value:inferred,score:78,index:i,label:'Ticket Subject Site'});
      }
    }
    const subjectSite=selectedValue(subjectSites).value||'';
    const actualSite=storeName || subjectSite;
    const pickedCompany=selectedValue(company);
    let companyName=actualSite || pickedCompany.value || '';
    if (/\s*[-–]\s*Sandz\s*$/i.test(companyName)) companyName=companyName.replace(/\s*[-–]\s*Sandz\s*$/i,'');

    // Brand means an explicitly identified brand/manufacturer, not the
    // Account Name, store name or a guess from a company code (GABC_OXYGEN).
    // If none is stated, leave the CSA's Brand value blank.
    const brandOptions=sectionCandidates(src,[
      {rx:/^(?:Brand(?:\s*Name)?|Retail\s*Brand|Device\s*Brand|Equipment\s*Brand|Manufacturer|Make)\s*[:=\-]\s*(.*)$/i,score:120,label:'Brand'}
    ]);
    const brandName=selectedValue(brandOptions).value||'';

    const contactOptions=sectionCandidates(src,[
      {rx:/^(?:Contact\s*(?:Person|Name)?|Site\s*Contact|Store\s*Contact|On.?site\s*Contact|Person\s*in\s*Charge|PIC|Point\s*of\s*Contact|Attention\s*to|Contact\s*Person\s*Name)\s*[:=\-]\s*(.*)$/i,score:95,label:'Contact Name'}
    ]);
    const contacts=allRegex(/Please\s+contact\s+([^\n]+?)\s+for\s+any\s+questions/gi,src);
    const contactName=contacts.length?contacts[contacts.length-1]:(selectedValue(contactOptions).value || fieldAfterLabel(src,['Contact Name']));

    let mobile=fieldAfterLabel(src,['Mobile Number','Contact Number','Contact Mobile','Phone Number','Cellphone','Telephone']);
    if(!/\d{7,}/.test(mobile||'')) {
      const phoneMatches=[...src.matchAll(/(?:IT\s+Contact\s+person|Contact\s+person)[^\n]*?((?:\+?63|0)\d(?:[\d\s()-]*\d))/gi)];
      mobile=phoneMatches.length?phoneMatches[phoneMatches.length-1][1]:'';
    }
    mobile=mobile?normalizeSpace(mobile).replace(/[^+\d]/g,''):'';
    if(['0','+0'].includes(mobile)) mobile='';
    const schedules=scheduleCandidates(src);
    const visitSchedule=schedules.length?schedules[0].value:'';

    let addressOptions=sectionCandidates(src,[
      // The original client request's Address line is the strongest source.
      {rx:/^Address\s*:\s*(.*)$/i,score:245,label:'Explicit Request Address'},
      {rx:/^(?:Complete\s*Site\s*Address|Site\s*Address|Store\s*Address|Branch\s*Address|Service\s*Address|On.?site\s*Address|Full\s*Address|Installation\s*Address|Office\s*Address|Outlet\s*Address|Delivery\s*Address|Physical\s*Address|Address\s*of\s*Site)\s*[:=\-]\s*(.*)$/i,score:220,label:'Explicit Site Address'},
      // Zoho Customer Location Address is useful only if it actually looks like
      // a street/site address. Many GABC records contain just "Mindanao",
      // "Visayas", or the store name here, so it must not outrank Address:.
      {rx:/^Customer\s*Location\s*Address\s*[:=\-]?\s*(.*)$/i,score:105,label:'Zoho Customer Location Address'},
      {rx:/^(?:Work\s*Location|Location\s*Address|Location\s*Details)\s*[:=\-]?\s*(.*)$/i,score:150,label:'Location Address'},
      {rx:/^(?:Location|Service\s*Location|Site\s*Location|Store\s*Location|Branch\s*Location|Venue|Where|Place)(?:\s*(?:of\s*work|for\s*service))?\s*[:=\-]\s*(.*)$/i,score:126,label:'Address'},
      {rx:/^(?:Customer\s*Location\s*Address|Location\s*Address|Site\s*Address|Full\s*Address|Address|Service\s*Location)\s*\*?$/i,score:92,label:'Address'},
      {rx:/^(?:Located\s+at|Situated\s+at|Our\s+store\s+is\s+at|The\s+site\s+is\s+at|Service\s+at)\s+(.+)$/i,score:120,label:'Address'}
    ]).filter(c=>addressLooksReal(c.value));

    // Company Name and Location Address are different concepts. Never accept a
    // location candidate that is simply the store/site name repeated by Zoho.
    addressOptions = addressOptions
      .filter(c => !samePlaceLabel(c.value, companyName) && !samePlaceLabel(c.value, storeName))
      .map(c => ({ ...c, score: c.score + Math.min(45, addressStrength(c.value)) }));

    // Generic street addresses in signatures are often AMTI/SANDZ offices;
    // sectionCandidates already penalizes signature context. Prefer the best
    // remaining physical address from the current ticket.
    let locationAddress=selectedValue(addressOptions).value||'';
    locationAddress=normalizeSpace(locationAddress.replace(/^Stall\s*#\s*:\s*/i,'').replace(/^#\s*:\s*/i,''));

    // Knowledge-base fallback: only when the current ticket does not contain a
    // reliable physical address. Never overwrite a valid explicit Address:.
    let locationSource = locationAddress ? 'ticket' : '';
    if (!locationAddress || addressStrength(locationAddress) < 20) {
      const known = findKnownSite(companyName, storeName);
      if (known?.address) {
        locationAddress = normalizeSpace(known.address);
        locationSource = 'knowledge';
      }
    }

    const ticketCategory=fieldAfterLabel(src,['Ticket Category','Ticket Category*']);
    const issueCategory=fieldAfterLabel(src,['Issue Category','Issue Category*']);
    let issueDescription=fieldAfterLabel(src,['Issue Description','Problem Description','Concern','Reported Problem','Issue/Request']);
    if(!validValue(issueDescription)) issueDescription='';
    const serialOptions=sectionCandidates(src,[
      {rx:/^(?:Serial\s*(?:Number|No\.?|#)|S\/?N|Service\s*Tag|Asset\s*Serial|Device\s*Serial)\s*[:=\-]\s*(.*)$/i,score:100,label:'Serial Number'}
    ]);
    const serialNumber=normalizeSpace(selectedValue(serialOptions).value || fieldAfterLabel(src,['Serial Number']));
    const serial=validValue(serialNumber)?serialNumber:'';
    return {
      ticket_number:ticketNumber,
      company_name:normalizeSpace(companyName),
      brand_name:normalizeSpace(brandName),
      store_name:normalizeSpace(storeName),
      contact_name:normalizeSpace(contactName),
      mobile_number:mobile,
      visit_schedule:visitSchedule,
      created_date:todayPH(),
      location_address:locationAddress,
      location_source:locationSource,
      ticket_category:validValue(ticketCategory)?normalizeSpace(ticketCategory):'',
      issue_category:validValue(issueCategory)?normalizeSpace(issueCategory):'',
      issue_description:issueDescription,
      serial_number:serial,
      engineer_tasks:extractTasks(src,issueDescription)
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
    if (!normalizeSpace(d.company_name)) warnings.push("Company Name / Store-Site is missing.");
    // The store/site IS the desired Company Name on this CSA; do not flag that
    // as a mismatch. Flag only an unconfirmed fallback with no site information.
    if (normalizeSpace(d.company_name) && !normalizeSpace(d.store_name) && /^GABC[_-]/i.test(d.company_name)) warnings.push("Please check the store or site name.");
    if (!normalizeSpace(d.location_address)) warnings.push("Full physical location address is missing. Do not use the Company/Store name or a region as the Location Address.");
    if (normalizeSpace(d.location_address) && samePlaceLabel(d.location_address, d.company_name)) warnings.push("Location Address matches Company Name; replace it with the full physical site address.");
    if (d.location_source === 'knowledge') notes.push("Location Address was filled from the CSA site knowledge base because no reliable physical address was found in the pasted ticket. Review before download.");
    if (!normalizeSpace(d.visit_schedule)) warnings.push("Customer visit schedule was not detected.");
    if (!normalizeSpace(d.serial_number)) warnings.push("Serial number was not detected.");
    if (!Array.isArray(d.engineer_tasks) || !d.engineer_tasks.length) warnings.push("Engineer Task / Activity is empty.");

    const schedule = normalizeSpace(d.visit_schedule);
    if (/\b(?:Kindly|Please|Field\s+Engineer|CURRENT\s+STATE|Thank\s+you|Regards)\b/i.test(schedule)) {
      warnings.push("Visit schedule contains copied email/UI text and should be reviewed.");
    }

    const allText = [d.company_name, d.store_name, d.contact_name, d.location_address, d.issue_description, d.serial_number]
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
    parseScheduleFragment,
    siteKnowledge: SITE_KNOWLEDGE,
    findKnownSite,
    addressStrength
  };
})();
