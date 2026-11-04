(() => {
  const ids = [
    "ticket_number", "company_name", "brand_name", "store_name", "location_source", "contact_name", "mobile_number",
    "visit_schedule", "created_date", "location_address", "ticket_category",
    "issue_category", "issue_description", "serial_number", "engineer_tasks"
  ];
  const $ = (id) => document.getElementById(id);
  const batch = [];
  let bundledTemplateCache = null;
  const AI_MODEL_FALLBACK = "gemini-3.5-flash-lite";

  function getParentWindow() {
    try { return window.parent && window.parent !== window ? window.parent : window; }
    catch (_) { return window; }
  }

  function getGeminiBridge() {
    try {
      const host = getParentWindow();
      return host.MAUUserGemini || window.MAUUserGemini || null;
    } catch (_) { return window.MAUUserGemini || null; }
  }

  function getGeminiModel() {
    try {
      const host = getParentWindow();
      return host.document?.getElementById("my-select-dropdown")?.value || AI_MODEL_FALLBACK;
    } catch (_) { return AI_MODEL_FALLBACK; }
  }

  function aiEnabled() {
    return Boolean($("useAiAssist")?.checked);
  }

  function aiReady() {
    const bridge = getGeminiBridge();
    try { return Boolean(bridge?.hasKey?.()); } catch (_) { return false; }
  }

  function openApiKeySettings() {
    try {
      const host = getParentWindow();
      const button = host.document?.getElementById("toolbarApiKeyBtn");
      if (button) { button.click(); return; }
    } catch (_) {}
    setStatus("Set your Gemini API key from the MAU Operation Desk toolbar first.", "error");
  }

  function refreshAiState() {
    const state = $("aiState");
    if (!state) return;
    if (!aiEnabled()) {
      state.textContent = "AI verification is off. Rule-based extraction will be used.";
      state.className = "ai-state muted";
      return;
    }
    if (aiReady()) {
      state.textContent = "AI verification ready — uses your existing MAU Gemini key.";
      state.className = "ai-state ready";
    } else {
      state.textContent = "AI verification selected, but no Gemini key is active. Rule-based extraction will be used until a key is set.";
      state.className = "ai-state warn";
    }
  }

  function stripCodeFence(value) {
    const text = String(value || "").trim();
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    return (fenced ? fenced[1] : text).trim();
  }

  function parseAiJson(value) {
    const raw = stripCodeFence(value);
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("Gemini did not return structured CSA data.");
    try { return JSON.parse(raw.slice(start, end + 1)); }
    catch (_) { throw new Error("Gemini returned CSA data that could not be read safely."); }
  }

  function evidenceText(ai, field) {
    const evidence = ai?.evidence && typeof ai.evidence === "object" ? ai.evidence[field] : "";
    return String(evidence || "").trim();
  }

  function compareText(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[–—]/g, "-")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function sourceSupports(source, value, evidence = "") {
    const src = compareText(source);
    const val = compareText(value);
    const ev = compareText(evidence);
    if (!val) return false;
    if (src.includes(val)) return true;
    if (ev && src.includes(ev)) return true;
    // Accept a value when most meaningful tokens are present in the cited source line.
    const tokens = val.split(" ").filter(x => x.length >= 3);
    if (tokens.length >= 3 && ev) {
      const evTokens = new Set(ev.split(" "));
      const hits = tokens.filter(t => evTokens.has(t)).length;
      if (hits / tokens.length >= 0.78) return true;
    }
    return false;
  }

  function looksPhysicalAddress(value) {
    const v = String(value || "").trim();
    if (!v || /^(?:mindanao|visayas|luzon|ncr|philippines)$/i.test(v)) return false;
    if (/^(?:gabc[_ -]|penshoppe$|oxygen$|forme$|regatta$|memo$)/i.test(v)) return false;
    return /(?:\b(?:floor|level|unit|stall|building|bldg|mall|city|brgy|barangay|street|st\.?|road|rd\.?|avenue|ave\.?|boulevard|blvd|pob\.?|poblacion|province|highway|corner|cor\.?|reclamation|compound|tower)\b|\d)/i.test(v);
  }

  function suspiciousTasks(tasks) {
    const list = Array.isArray(tasks) ? tasks : [];
    if (!list.length) return true;
    const joined = list.join(" ");
    if (list.length === 1 && joined.length > 170) return true;
    if (/\b(?:Hi\s+AMTI|good\s+day|kindly\s+bring|thank\s+you|reply\s+all|current\s+state)\b/i.test(joined)) return true;
    const verbs = joined.match(/\b(?:replace|upgrade|fix|clean|check|install|reformat|setup|set\s+up|troubleshoot|repair|test|verify|configure|perform)\b/gi) || [];
    return list.length === 1 && verbs.length >= 3;
  }

  function sanitizeAiTasks(tasks) {
    const toolLine = /^(?:screwdriver|screw\s+for|empty\s+external\s+hard\s+drive|hdd\/ssd\s+enclosure|sata\s+cable|usb\s+flash\s+drive|crimper|rj45|twist\s+tie|cable\s+tie|thermal\s+paste|power\s+strip|multimeter|ladder)\b/i;
    const prose = /^(?:hi\b|hello\b|good\s+(?:day|morning|afternoon)|thank\s+you|kindly\s+bring|please\s+bring|kindly\s+provide|please\s+provide|as\s+advised|store\s+name\s*:|serial\s*#?\s*:|address\s*:|ticket\s*:|current\s+state\b)/i;
    return (Array.isArray(tasks) ? tasks : [])
      .map(x => String(x || "").trim().replace(/^(?:[•●▪◦‣*]\s*|[-–—]\s+|\d+[.)]\s+)/, ""))
      .filter(x => x && !toolLine.test(x) && !prose.test(x) && x.length <= 260);
  }

  function aiTaskListSupported(source, tasks) {
    const clean = sanitizeAiTasks(tasks);
    if (!clean.length) return false;
    const supported = clean.filter(task => sourceSupports(source, task)).length;
    return supported / clean.length >= 0.8;
  }

  function buildAiExtractionPrompt(sourceText, draft) {
    const compactDraft = {
      ticket_number: draft.ticket_number || "",
      company_name: draft.company_name || "",
      contact_name: draft.contact_name || "",
      mobile_number: draft.mobile_number || "",
      visit_schedule: draft.visit_schedule || "",
      location_address: draft.location_address || "",
      ticket_category: draft.ticket_category || "",
      issue_category: draft.issue_category || "",
      issue_description: draft.issue_description || "",
      serial_number: draft.serial_number || "",
      engineer_tasks: Array.isArray(draft.engineer_tasks) ? draft.engineer_tasks : []
    };
    return `You are verifying fields for an AMTI Customer Service Agreement (CSA) from ONE pasted Zoho Desk ticket.

Return ONLY valid JSON. Do not use Markdown. Do not explain.

Critical CSA rules:
1. Never invent a value. If unsupported, return an empty string or empty array.
2. Company Name means the exact STORE / BRANCH / WORK SITE receiving the visit. Prefer "Store Name:" or the original client request (for example "Please do the following for ..."). Do NOT reduce a store such as "Penshoppe SM Butuan" to just "PENSHOPPE". Do NOT use the legal account name when a store/site is stated.
3. Location Address is different from Company Name. It must be the full PHYSICAL service address. Prefer the original request's "Address:" line. Never use Mindanao/Visayas/Luzon/NCR or a repeated store/company label as the address.
4. Customer Visit Schedule must contain ONLY the confirmed onsite date and time. Remove weekday text and all comments/instructions after the time. Preserve a time such as 9:00 AM when it is present.
5. Engineer Tasks must contain only the actual requested work, one task per array item. Exclude greetings, email prose, ticket UI labels, signatures, contact/address lines, and tool/material lists such as USB drive, crimper, RJ45, cable tie, thermal paste, etc.
6. Preserve source spelling, punctuation, capitalization, accents and special characters when practical. Do not "correct" names or addresses using outside knowledge.
7. Ticket Category, Issue Category and Issue Description should reflect the explicit Zoho fields when present.
8. Serial Number should use an explicit Serial # / Serial Number from the ticket or original request. A dash means missing.
9. Do not return Support Agent or Assigned Engineer; those remain blank in the CSA.
10. Evidence must quote the smallest exact source fragment that supports each extracted value. For engineer_tasks, evidence may be a short joined excerpt containing the task lines.

Rule-based draft (may contain mistakes; use only as a clue):
${JSON.stringify(compactDraft, null, 2)}

Required JSON shape:
{
  "ticket_number":"",
  "company_name":"",
  "contact_name":"",
  "mobile_number":"",
  "visit_schedule":"",
  "location_address":"",
  "ticket_category":"",
  "issue_category":"",
  "issue_description":"",
  "serial_number":"",
  "engineer_tasks":[],
  "evidence":{
    "ticket_number":"",
    "company_name":"",
    "contact_name":"",
    "mobile_number":"",
    "visit_schedule":"",
    "location_address":"",
    "ticket_category":"",
    "issue_category":"",
    "issue_description":"",
    "serial_number":"",
    "engineer_tasks":""
  }
}

ZOHO TICKET SOURCE:
${String(sourceText || "").slice(0, 28000)}`;
  }

  function mergeAiWithDraft(sourceText, draft, ai) {
    const out = {...draft};
    const accepted = [];
    const rejected = [];
    const accept = (field, transform = x => String(x || "").trim(), condition = () => true) => {
      const raw = ai?.[field];
      const value = transform(raw);
      if (!value) return;
      const evidence = evidenceText(ai, field);
      if (!sourceSupports(sourceText, value, evidence) || !condition(value, evidence)) {
        rejected.push(field);
        return;
      }
      out[field] = value;
      accepted.push(field);
    };

    // Ticket number and created date remain deterministic unless the parser missed the ID.
    if (!String(out.ticket_number || "").replace(/\D/g, "")) {
      accept("ticket_number", x => String(x || "").replace(/\D/g, ""));
    }

    const draftCompany = String(out.company_name || "").trim();
    const aiCompany = String(ai?.company_name || "").trim();
    const genericCompany = /^(?:gabc[_ -].*|penshoppe|oxygen|forme|regatta|memo)$/i.test(draftCompany);
    if (aiCompany && (genericCompany || !draftCompany || compareText(aiCompany).length > compareText(draftCompany).length)) {
      accept("company_name", x => String(x || "").trim(), v => !/^(?:golden\s+abc(?:,?\s+incorporated)?|gabc[_ -].*)$/i.test(v));
      if (out.company_name !== draftCompany && out.company_name) out.store_name = out.company_name;
    }

    if (!String(out.contact_name || "").trim()) accept("contact_name");
    if (!String(out.mobile_number || "").trim()) accept("mobile_number", x => String(x || "").replace(/[^+\d]/g, ""), v => /\d{7,}/.test(v));

    const normalizedAiSchedule = window.CSAParser.normalizeSchedule(ai?.visit_schedule || "");
    if (normalizedAiSchedule && sourceSupports(sourceText, ai?.visit_schedule || normalizedAiSchedule, evidenceText(ai, "visit_schedule"))) {
      const current = window.CSAParser.normalizeSchedule(out.visit_schedule || "");
      // Prefer AI when it restores a missing time or removes contamination.
      const aiHasTime = /\d{1,2}:\d{2}\s*(?:AM|PM)$/i.test(normalizedAiSchedule);
      const currentHasTime = /\d{1,2}:\d{2}\s*(?:AM|PM)$/i.test(current);
      if (!current || (aiHasTime && !currentHasTime) || /kindly|please|field\s+engineer/i.test(current)) {
        out.visit_schedule = normalizedAiSchedule;
        accepted.push("visit_schedule");
      }
    }

    const aiAddress = String(ai?.location_address || "").trim();
    if (aiAddress && looksPhysicalAddress(aiAddress)) {
      const currentAddress = String(out.location_address || "").trim();
      const currentBad = !looksPhysicalAddress(currentAddress) || compareText(currentAddress) === compareText(out.company_name || "");
      const addressEvidence = evidenceText(ai, "location_address");
      const explicitAddressEvidence = /(?:^|\b)(?:address|site\s+address|store\s+address|branch\s+address)\s*:/i.test(addressEvidence);
      if (currentBad || explicitAddressEvidence || compareText(aiAddress).length > compareText(currentAddress).length) {
        accept("location_address", x => String(x || "").trim(), looksPhysicalAddress);
        if (out.location_address !== currentAddress && out.location_address) out.location_source = "ai-verified-ticket";
      }
    }

    // Explicit Zoho fields are safer than AI. AI fills only missing values.
    if (!String(out.ticket_category || "").trim()) accept("ticket_category");
    if (!String(out.issue_category || "").trim()) accept("issue_category");
    if (!String(out.issue_description || "").trim()) accept("issue_description");
    if (!String(out.serial_number || "").trim()) accept("serial_number");

    const aiTasks = sanitizeAiTasks(ai?.engineer_tasks);
    if (aiTasks.length && aiTaskListSupported(sourceText, aiTasks)) {
      if (suspiciousTasks(out.engineer_tasks) || aiTasks.length > (Array.isArray(out.engineer_tasks) ? out.engineer_tasks.length : 0)) {
        out.engineer_tasks = aiTasks;
        accepted.push("engineer_tasks");
      }
    } else if (Array.isArray(ai?.engineer_tasks) && ai.engineer_tasks.length) rejected.push("engineer_tasks");

    out.created_date = draft.created_date || window.CSAParser.todayPH();
    out.ai_verification = {
      used: true,
      accepted_fields: [...new Set(accepted)],
      rejected_fields: [...new Set(rejected)]
    };
    return out;
  }

  async function aiVerifyTicket(sourceText, draft) {
    if (!aiEnabled() || !aiReady()) return {...draft, ai_verification:{used:false, reason: aiEnabled() ? "no-key" : "disabled"}};
    const bridge = getGeminiBridge();
    const result = await bridge.generate({
      model: getGeminiModel(),
      messages: [{role:"user", text:buildAiExtractionPrompt(sourceText, draft)}]
    });
    const parsed = parseAiJson(result?.text || "");
    return mergeAiWithDraft(sourceText, draft, parsed);
  }

  async function extractTicketHybrid(sourceText) {
    const draft = window.CSAParser.extractTicketData(sourceText);
    if (!draft.ticket_number) return draft;
    if (!aiEnabled() || !aiReady()) return draft;
    return await aiVerifyTicket(sourceText, draft);
  }

  async function extractManyHybrid(sourceText) {
    const blocks = window.CSAParser.splitTicketBlocks(sourceText);
    const results = [];
    const seen = new Set();
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const draft = window.CSAParser.extractTicketData(block);
      const ticket = String(draft.ticket_number || "").replace(/\D/g, "");
      if (!ticket || seen.has(ticket)) continue;
      draft.ticket_number = ticket;
      setStatus(aiEnabled() && aiReady() ? `AI checking ticket ${results.length + 1}…` : `Reading ticket ${results.length + 1}…`);
      const item = aiEnabled() && aiReady() ? await aiVerifyTicket(block, draft) : draft;
      seen.add(ticket);
      results.push(item);
    }
    return results;
  }

  function setStatus(message, kind = "") {
    const el = $("status");
    el.textContent = message || "";
    el.classList.toggle("error", kind === "error");
    el.classList.toggle("success", kind === "success");
  }

  function getFormData() {
    const obj = {};
    for (const id of ids) obj[id] = $(id).value.trim();
    obj.ticket_number = obj.ticket_number.replace(/\D/g, "");
    obj.visit_schedule = CSAParser.normalizeSchedule(obj.visit_schedule);
    obj.engineer_tasks = obj.engineer_tasks.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    if (!obj.created_date) obj.created_date = CSAParser.todayPH();
    return obj;
  }

  function fillForm(data) {
    for (const id of ids) {
      if (id === "engineer_tasks") $(id).value = (data[id] || []).join("\n");
      else $(id).value = data[id] || "";
    }
    updatePreview();
  }

  function renderAnalysis(data) {
    const result = CSAParser.analyzeTicketData(data);
    const root = $("analysisBox");
    root.innerHTML = "";
    root.classList.toggle("has-warning", result.warnings.length > 0);
    root.hidden = !result.warnings.length;
    if (result.warnings.length) {
      const title = document.createElement("strong");
      title.textContent = "Please check these details:";
      root.appendChild(title);
    }

    if (result.warnings.length) {
      const ul = document.createElement("ul");
      result.warnings.forEach(msg => {
        const li = document.createElement("li");
        li.textContent = msg;
        ul.appendChild(li);
      });
      root.appendChild(ul);
    }

  }

  function updatePreview() {
    renderAnalysis(getFormData());
  }

  async function extractTicket() {
    const text = $("ticketText").value.trim();
    if (!text) return setStatus("Paste a ticket first.", "error");
    const button = $("extractBtn");
    button.disabled = true;
    setStatus(aiEnabled() && aiReady() ? "Reading ticket and verifying with AI…" : "Reading ticket…");
    try {
      const data = await extractTicketHybrid(text);
      if (!data.ticket_number) return setStatus("No ticket number was detected. Review the pasted text or enter the ticket number manually.", "error");
      fillForm(data);
      const analysis = CSAParser.analyzeTicketData(data);
      $("editDetails").open = true;
      const aiNote = data.ai_verification?.used ? ` AI verified ${data.ai_verification.accepted_fields?.length || 0} field${(data.ai_verification.accepted_fields?.length || 0) === 1 ? "" : "s"}.` : "";
      setStatus((analysis.warnings.length ? "Some details need checking. Please review them below." : "Ticket details are ready to edit.") + aiNote, analysis.warnings.length ? "" : "success");
      $("editorCard").scrollIntoView({behavior:"smooth", block:"start"});
    } catch (err) {
      console.error(err);
      const fallback = CSAParser.extractTicketData(text);
      if (fallback.ticket_number) {
        fillForm(fallback);
        $("editDetails").open = true;
        setStatus(`AI verification could not finish (${err?.message || "unknown error"}). Rule-based extraction is shown for review.`, "error");
        $("editorCard").scrollIntoView({behavior:"smooth", block:"start"});
      } else setStatus(err?.message || "Extraction failed.", "error");
    } finally { button.disabled = false; }
  }

  function addOrUpdateBatch(data) {
    const ticket = String(data.ticket_number || "").replace(/\D/g, "");
    if (!ticket) return false;
    const normalized = {...data, ticket_number: ticket, visit_schedule: CSAParser.normalizeSchedule(data.visit_schedule || "")};
    const idx = batch.findIndex(x => x.ticket_number === ticket);
    if (idx >= 0) batch[idx] = normalized; else batch.push(normalized);
    return true;
  }

  async function extractAllTickets() {
    const text = $("ticketText").value.trim();
    if (!text) return setStatus("Paste one or more tickets first.", "error");
    const button = $("extractAllBtn");
    button.disabled = true;
    try {
      const items = await extractManyHybrid(text);
      if (!items.length) return setStatus("No ticket blocks were detected. Include a ticket number such as #110524 in each block.", "error");
      items.forEach(addOrUpdateBatch);
      renderBatch();
      fillForm(items[0]);
      const warningCount = items.reduce((sum, item) => sum + CSAParser.analyzeTicketData(item).warnings.length, 0);
      const aiCount = items.filter(x => x.ai_verification?.used).length;
      setStatus(`${items.length} ticket${items.length === 1 ? "" : "s"} added.${aiCount ? ` AI verified ${aiCount}.` : ""}${warningCount ? " Please check any missing details before downloading." : ""}`, warningCount ? "" : "success");
      $("batchCard").scrollIntoView({behavior:"smooth", block:"start"});
    } catch (err) {
      console.error(err);
      setStatus(err?.message || "Batch extraction failed.", "error");
    } finally { button.disabled = false; }
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function getTemplateBytes() {
    if (!window.CSADocx) throw new Error("CSA is unavailable right now. Please refresh the page.");
    const file = $("templateFile").files[0] || null;
    if (file) return await window.CSADocx.loadTemplateBytes(file);
    if (!bundledTemplateCache) bundledTemplateCache = await window.CSADocx.loadTemplateBytes(null);
    return bundledTemplateCache.slice(0);
  }

  async function verifyBundledTemplate() {
    const badge = $("templateState");
    try {
      await getTemplateBytes();
      badge.textContent = "Ready";
      badge.classList.add("ready");
      badge.classList.remove("failed");
    } catch (err) {
      console.error(err);
      badge.textContent = "Built-in template unavailable";
      badge.classList.remove("ready");
      badge.classList.add("failed");
      setStatus("CSA is unavailable right now. Please refresh the page.", "error");
    }
  }

  async function generateOne(data) {
    const ticket = String(data.ticket_number || "").replace(/\D/g, "");
    if (!ticket) throw new Error("Ticket number is required.");
    const normalized = {...data, ticket_number: ticket, visit_schedule: CSAParser.normalizeSchedule(data.visit_schedule || "")};
    if (!Array.isArray(normalized.engineer_tasks) || !normalized.engineer_tasks.length) throw new Error("No engineer tasks found. Select Edit details first and enter the work to be done.");
    const analysis = CSAParser.analyzeTicketData(normalized);
    if (analysis.warnings.some(x => /copied email\/UI text/i.test(x))) {
      throw new Error("The visit schedule still contains extra copied text. Review the schedule field before generating.");
    }
    const templateBytes = await getTemplateBytes();
    const blob = await window.CSADocx.generateDocxBlob(templateBytes, normalized);
    triggerDownload(blob, `#${ticket}.docx`);
    return ticket;
  }

  async function generateDocx() {
    const data = getFormData();
    if (!data.ticket_number) return setStatus("Ticket number is required.", "error");
    setStatus("Preparing your CSA…");
    $("generateBtn").disabled = true;
    try {
      const ticket = await generateOne(data);
      setStatus(`CSA #${ticket} downloaded.`, "success");
    } catch (err) {
      console.error(err);
      setStatus(err?.message || "Could not generate the DOCX.", "error");
    } finally {
      $("generateBtn").disabled = false;
    }
  }

  async function downloadFromPaste() {
    const text = $("ticketText").value.trim();
    if (!text) return setStatus("Paste the Zoho ticket first.", "error");
    const button = $("quickCreateBtn");
    button.disabled = true;
    setStatus(aiEnabled() && aiReady() ? "Reading ticket, AI-checking fields, then preparing CSA…" : "Reading ticket and preparing CSA…");
    try {
      const data = await extractTicketHybrid(text);
      if (!data.ticket_number) throw new Error("Couldn't find the ticket number. Click Edit details first to add it.");
      const problems = CSAParser.analyzeTicketData(data).warnings;
      if (problems.some(x => /copied email\/UI text/i.test(x))) {
        fillForm(data);
        $("editDetails").open = true;
        $("editorCard").scrollIntoView({behavior:"smooth", block:"start"});
        throw new Error("Please check the visit date before downloading.");
      }
      if (!Array.isArray(data.engineer_tasks) || !data.engineer_tasks.length) {
        fillForm(data);
        $("editDetails").open = true;
        $("editorCard").scrollIntoView({behavior:"smooth", block:"start"});
        throw new Error("No engineer tasks found. Add the scope of work under Edit details first.");
      }
      const ticket = await generateOne(data);
      const aiNote = data.ai_verification?.used ? ` AI verified ${data.ai_verification.accepted_fields?.length || 0} corrected field${(data.ai_verification.accepted_fields?.length || 0) === 1 ? "" : "s"}.` : "";
      setStatus(`CSA #${ticket} downloaded.${aiNote}${problems.length ? " Some information was missing; check the document before using it." : ""}`, "success");
    } catch (err) {
      console.error(err);
      setStatus(err?.message || "Couldn't create this CSA. Please check the ticket details.", "error");
    } finally {
      button.disabled = false;
    }
  }

  async function recheckCurrentWithAi() {
    const text = $("ticketText").value.trim();
    if (!text) return setStatus("Paste the original Zoho ticket first so AI can verify the current details.", "error");
    if (!aiReady()) { openApiKeySettings(); return; }
    const button = $("aiRecheckBtn");
    button.disabled = true;
    setStatus("AI checking the current CSA fields against the pasted ticket…");
    try {
      const data = await aiVerifyTicket(text, getFormData());
      fillForm(data);
      const count = data.ai_verification?.accepted_fields?.length || 0;
      setStatus(`AI verification complete. ${count} field${count === 1 ? "" : "s"} improved from source-supported evidence.`, "success");
    } catch (err) {
      console.error(err);
      setStatus(err?.message || "AI verification failed. Your current fields were not changed.", "error");
    } finally { button.disabled = false; }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function renderBatch() {
    const root = $("batchList");
    root.innerHTML = "";
    $("batchEmpty").style.display = batch.length ? "none" : "block";
    $("batchCard").hidden = !batch.length;
    $("downloadBatchBtn").disabled = !batch.length;
    $("batchCount").textContent = batch.length ? `${batch.length} ticket${batch.length === 1 ? "" : "s"}` : "";

    batch.forEach((item, i) => {
      const analysis = CSAParser.analyzeTicketData(item);
      const el = document.createElement("div");
      el.className = `batch-item${analysis.warnings.length ? " batch-warning" : ""}`;
      el.innerHTML = `<div class="batch-main">
          <div class="batch-ticket">#${escapeHtml(item.ticket_number)}</div>
          <div class="batch-company">${escapeHtml(item.company_name || "(No company name)")}</div>
          <div class="batch-date">${escapeHtml(item.visit_schedule || "Schedule not set")}${analysis.warnings.length ? " · Check details" : ""}</div>
        </div>
        <div class="batch-actions">
          <button class="batch-action edit" type="button" data-i="${i}">Edit</button>
          <button class="batch-action download" type="button" data-i="${i}">Download</button>
          <button class="remove" type="button" title="Remove" aria-label="Remove ticket ${escapeHtml(item.ticket_number)}" data-i="${i}">×</button>
        </div>`;
      root.appendChild(el);
    });

    root.querySelectorAll(".remove").forEach(btn => btn.addEventListener("click", () => {
      batch.splice(Number(btn.dataset.i), 1);
      renderBatch();
    }));
    root.querySelectorAll(".edit").forEach(btn => btn.addEventListener("click", () => {
      const item = batch[Number(btn.dataset.i)];
      if (!item) return;
      fillForm(item);
      $("editDetails").open = true;
      setStatus(`Editing ticket #${item.ticket_number}. Save changes below when you're done.`, "success");
      $("editorCard").scrollIntoView({behavior:"smooth", block:"start"});
    }));
    root.querySelectorAll(".download").forEach(btn => btn.addEventListener("click", async () => {
      const item = batch[Number(btn.dataset.i)];
      if (!item) return;
      btn.disabled = true;
      try {
        const ticket = await generateOne(item);
        setStatus(`CSA #${ticket} downloaded.`, "success");
      } catch (err) {
        console.error(err);
        setStatus(err?.message || "Could not generate the DOCX.", "error");
      } finally {
        btn.disabled = false;
      }
    }));
  }

  function addToBatch() {
    const data = getFormData();
    if (!data.ticket_number) return setStatus("Ticket number is required before adding to batch.", "error");
    addOrUpdateBatch(data);
    renderBatch();
    setStatus(`Ticket #${data.ticket_number} saved to the list.`, "success");
  }

  async function downloadBatch() {
    if (!batch.length) return;
    setStatus("Preparing your CSA files…");
    $("downloadBatchBtn").disabled = true;
    try {
      const contaminated = batch.filter(item => CSAParser.analyzeTicketData(item).warnings.some(x => /copied email\/UI text/i.test(x)));
      if (contaminated.length) throw new Error(`Review the visit schedule for ticket${contaminated.length > 1 ? "s" : ""} ${contaminated.map(x => x.ticket_number).join(", ")} before batch generation.`);
      const withoutTasks = batch.filter(item => !Array.isArray(item.engineer_tasks) || !item.engineer_tasks.length);
      if (withoutTasks.length) throw new Error(`Add engineer tasks for ticket${withoutTasks.length > 1 ? "s" : ""} ${withoutTasks.map(x => "#" + x.ticket_number).join(", ")} before downloading.`);
      const templateBytes = await getTemplateBytes();
      const normalized = batch.map(item => ({...item, visit_schedule: CSAParser.normalizeSchedule(item.visit_schedule || "")}));
      const blob = await window.CSADocx.generateBatchZip(templateBytes, normalized);
      triggerDownload(blob, "CSA_Batch.zip");
      setStatus(`${batch.length} CSA file${batch.length === 1 ? "" : "s"} downloaded.`, "success");
    } catch (err) {
      console.error(err);
      setStatus(err?.message || "Could not generate the ZIP.", "error");
    } finally {
      $("downloadBatchBtn").disabled = !batch.length;
    }
  }

  function clearForm() {
    for (const id of ids) $(id).value = "";
    $("created_date").value = CSAParser.todayPH();
    updatePreview();
    setStatus("");
  }

  function clearBatch() {
    batch.splice(0, batch.length);
    renderBatch();
    setStatus("Ticket list cleared.", "success");
  }

  function resetTemplate() {
    $("templateFile").value = "";
    setStatus("Built-in CSA template selected. No template upload is required.", "success");
  }

  function applyParentTheme(isDark) {
    document.body.classList.toggle("theme-dark", Boolean(isDark));
  }

  window.addEventListener("message", (event) => {
    if (event?.data?.type === "MAU_APPEARANCE") applyParentTheme(event.data.dark);
  });
  try {
    if (window.parent && window.parent !== window) {
      applyParentTheme(window.parent.document.body.classList.contains("theme-dark"));
    }
  } catch (_) {}

  $("quickCreateBtn").addEventListener("click", downloadFromPaste);
  $("aiRecheckBtn")?.addEventListener("click", recheckCurrentWithAi);
  $("aiKeyBtn")?.addEventListener("click", openApiKeySettings);
  $("useAiAssist")?.addEventListener("change", refreshAiState);
  $("extractBtn").addEventListener("click", extractTicket);
  $("extractAllBtn").addEventListener("click", extractAllTickets);
  $("generateBtn").addEventListener("click", generateDocx);
  $("addBatchBtn").addEventListener("click", addToBatch);
  $("downloadBatchBtn").addEventListener("click", downloadBatch);
  $("clearBatchBtn").addEventListener("click", clearBatch);
  $("clearBtn").addEventListener("click", clearForm);
  $("resetTemplateBtn").addEventListener("click", resetTemplate);
  $("templateFile").addEventListener("change", () => {
    const file = $("templateFile").files[0];
    if (file) setStatus(`Using local custom template: ${file.name}`, "success");
  });
  ids.forEach(id => $(id).addEventListener("input", updatePreview));

  $("created_date").value = CSAParser.todayPH();
  renderBatch();
  updatePreview();
  verifyBundledTemplate();
  refreshAiState();
  window.setInterval(refreshAiState, 2500);

  // Browser QA hook. It is inert during normal use but lets automated checks
  // exercise the exact parser + DOCX generator used by GitHub Pages.
  window.CSAAppTest = {
    extract: (text) => CSAParser.extractTicketData(text),
    extractMany: (text) => CSAParser.extractMultipleTicketData(text),
    mergeAi: (text, draft, ai) => mergeAiWithDraft(text, draft, ai),
    suspiciousTasks,
    generateBase64: async (data) => {
      const bytes = await getTemplateBytes();
      const blob = await window.CSADocx.generateDocxBlob(bytes, data);
      const arr = new Uint8Array(await blob.arrayBuffer());
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < arr.length; i += chunk) binary += String.fromCharCode(...arr.subarray(i, i + chunk));
      return btoa(binary);
    }
  };

})();
