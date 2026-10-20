(() => {
  const ids = [
    "ticket_number", "company_name", "contact_name", "mobile_number",
    "visit_schedule", "created_date", "location_address", "ticket_category",
    "issue_category", "issue_description", "serial_number", "engineer_tasks"
  ];
  const $ = (id) => document.getElementById(id);
  const batch = [];
  let bundledTemplateCache = null;

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
    const title = document.createElement("strong");
    title.textContent = result.warnings.length ? "Extraction check — review needed" : "Extraction check — looks clean";
    root.appendChild(title);

    if (result.warnings.length) {
      const ul = document.createElement("ul");
      result.warnings.forEach(msg => {
        const li = document.createElement("li");
        li.textContent = msg;
        ul.appendChild(li);
      });
      root.appendChild(ul);
    }

    if (result.notes.length) {
      const note = document.createElement("p");
      note.textContent = result.notes.join(" ");
      root.appendChild(note);
    }
  }

  function updatePreview() {
    const d = getFormData();
    const tasks = d.engineer_tasks.length ? d.engineer_tasks.join("\n") : "";
    $("preview").textContent =
`Company Name: ${d.company_name}
Contact Name: ${d.contact_name}
Mobile Number: ${d.mobile_number}
Customer Visit Schedule Date: ${d.visit_schedule}
Created Date/Time: ${d.created_date}
Location Address: ${d.location_address}

Ticket Information:

Ticket Category: ${d.ticket_category}
Issue Category: ${d.issue_category}
Issue Description: ${d.issue_description}
Serial Number: ${d.serial_number}

Engineer Task/Activity:
${tasks}`;
    renderAnalysis(d);
  }

  function extractTicket() {
    const text = $("ticketText").value.trim();
    if (!text) return setStatus("Paste a ticket first.", "error");
    try {
      const data = CSAParser.extractTicketData(text);
      if (!data.ticket_number) return setStatus("No ticket number was detected. Review the pasted text or enter the ticket number manually.", "error");
      fillForm(data);
      const analysis = CSAParser.analyzeTicketData(data);
      setStatus(analysis.warnings.length ? "Fields extracted. Please review the flagged items before generating." : "Fields extracted and checked. Review them, then generate the CSA.", analysis.warnings.length ? "" : "success");
      $("editorCard").scrollIntoView({behavior:"smooth", block:"start"});
    } catch (err) {
      setStatus(err?.message || "Extraction failed.", "error");
    }
  }

  function addOrUpdateBatch(data) {
    const ticket = String(data.ticket_number || "").replace(/\D/g, "");
    if (!ticket) return false;
    const normalized = {...data, ticket_number: ticket, visit_schedule: CSAParser.normalizeSchedule(data.visit_schedule || "")};
    const idx = batch.findIndex(x => x.ticket_number === ticket);
    if (idx >= 0) batch[idx] = normalized; else batch.push(normalized);
    return true;
  }

  function extractAllTickets() {
    const text = $("ticketText").value.trim();
    if (!text) return setStatus("Paste one or more tickets first.", "error");
    try {
      const items = CSAParser.extractMultipleTicketData(text);
      if (!items.length) return setStatus("No ticket blocks were detected. Include a ticket number such as #110524 in each block.", "error");
      items.forEach(addOrUpdateBatch);
      renderBatch();
      fillForm(items[0]);
      const warningCount = items.reduce((sum, item) => sum + CSAParser.analyzeTicketData(item).warnings.length, 0);
      setStatus(`${items.length} ticket${items.length === 1 ? "" : "s"} extracted and added to the batch queue${warningCount ? `; ${warningCount} review item${warningCount === 1 ? "" : "s"} flagged` : ""}.`, warningCount ? "" : "success");
      $("batchCard").scrollIntoView({behavior:"smooth", block:"start"});
    } catch (err) {
      console.error(err);
      setStatus(err?.message || "Batch extraction failed.", "error");
    }
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
    if (!window.CSADocx) throw new Error("CSA DOCX engine failed to initialize. Refresh the page (Ctrl+F5). No template upload is required.");
    const file = $("templateFile").files[0] || null;
    if (file) return await window.CSADocx.loadTemplateBytes(file);
    if (!bundledTemplateCache) bundledTemplateCache = await window.CSADocx.loadTemplateBytes(null);
    return bundledTemplateCache.slice(0);
  }

  async function verifyBundledTemplate() {
    const badge = $("templateState");
    try {
      await getTemplateBytes();
      badge.textContent = "Embedded template ready";
      badge.classList.add("ready");
      badge.classList.remove("failed");
    } catch (err) {
      console.error(err);
      badge.textContent = "Built-in template unavailable";
      badge.classList.remove("ready");
      badge.classList.add("failed");
      setStatus("The embedded CSA generator could not initialize. Refresh the page; no template upload is required.", "error");
    }
  }

  async function generateOne(data) {
    const ticket = String(data.ticket_number || "").replace(/\D/g, "");
    if (!ticket) throw new Error("Ticket number is required.");
    const normalized = {...data, ticket_number: ticket, visit_schedule: CSAParser.normalizeSchedule(data.visit_schedule || "")};
    const analysis = CSAParser.analyzeTicketData(normalized);
    if (analysis.warnings.some(x => /copied email\/UI text/i.test(x))) {
      throw new Error("The visit schedule still contains extra copied text. Review the schedule field before generating.");
    }
    const templateBytes = await getTemplateBytes();
    const blob = await window.CSADocx.generateDocxBlob(templateBytes, normalized);
    triggerDownload(blob, `${ticket}.docx`);
    return ticket;
  }

  async function generateDocx() {
    const data = getFormData();
    if (!data.ticket_number) return setStatus("Ticket number is required.", "error");
    setStatus("Generating DOCX locally in your browser…");
    $("generateBtn").disabled = true;
    try {
      const ticket = await generateOne(data);
      setStatus(`Generated ${ticket}.docx using the ${$("templateFile").files[0] ? "selected custom" : "built-in"} CSA template.`, "success");
    } catch (err) {
      console.error(err);
      setStatus(err?.message || "Could not generate the DOCX.", "error");
    } finally {
      $("generateBtn").disabled = false;
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function renderBatch() {
    const root = $("batchList");
    root.innerHTML = "";
    $("batchEmpty").style.display = batch.length ? "none" : "block";
    $("downloadBatchBtn").disabled = !batch.length;
    $("batchCount").textContent = batch.length ? `${batch.length} ticket${batch.length === 1 ? "" : "s"}` : "";

    batch.forEach((item, i) => {
      const analysis = CSAParser.analyzeTicketData(item);
      const el = document.createElement("div");
      el.className = `batch-item${analysis.warnings.length ? " batch-warning" : ""}`;
      el.innerHTML = `<div class="batch-main">
          <div class="batch-ticket">#${escapeHtml(item.ticket_number)}</div>
          <div class="batch-company">${escapeHtml(item.company_name || "(No company name)")}</div>
          <div class="batch-date">${escapeHtml(item.visit_schedule || "No schedule")}${analysis.warnings.length ? ` · ${analysis.warnings.length} review` : ""}</div>
        </div>
        <div class="batch-actions">
          <button class="batch-action edit" type="button" data-i="${i}">Edit</button>
          <button class="batch-action download" type="button" data-i="${i}">DOCX</button>
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
      setStatus(`Loaded ticket ${item.ticket_number} for review. Click Add / update batch after editing.`, "success");
      $("editorCard").scrollIntoView({behavior:"smooth", block:"start"});
    }));
    root.querySelectorAll(".download").forEach(btn => btn.addEventListener("click", async () => {
      const item = batch[Number(btn.dataset.i)];
      if (!item) return;
      btn.disabled = true;
      try {
        const ticket = await generateOne(item);
        setStatus(`Generated ${ticket}.docx.`, "success");
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
    setStatus(`Ticket ${data.ticket_number} added/updated in batch.`, "success");
  }

  async function downloadBatch() {
    if (!batch.length) return;
    setStatus("Generating ZIP locally in your browser…");
    $("downloadBatchBtn").disabled = true;
    try {
      const contaminated = batch.filter(item => CSAParser.analyzeTicketData(item).warnings.some(x => /copied email\/UI text/i.test(x)));
      if (contaminated.length) throw new Error(`Review the visit schedule for ticket${contaminated.length > 1 ? "s" : ""} ${contaminated.map(x => x.ticket_number).join(", ")} before batch generation.`);
      const templateBytes = await getTemplateBytes();
      const normalized = batch.map(item => ({...item, visit_schedule: CSAParser.normalizeSchedule(item.visit_schedule || "")}));
      const blob = await window.CSADocx.generateBatchZip(templateBytes, normalized);
      triggerDownload(blob, "CSA_Batch.zip");
      setStatus(`Generated ZIP with ${batch.length} CSA file${batch.length === 1 ? "" : "s"}.`, "success");
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
    setStatus("Batch queue cleared.", "success");
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

  // Browser QA hook. It is inert during normal use but lets automated checks
  // exercise the exact parser + DOCX generator used by GitHub Pages.
  window.CSAAppTest = {
    extract: (text) => CSAParser.extractTicketData(text),
    extractMany: (text) => CSAParser.extractMultipleTicketData(text),
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
