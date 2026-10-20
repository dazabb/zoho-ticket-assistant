(() => {
  const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const XML_NS = "http://www.w3.org/XML/1998/namespace";

  function directChildren(node, localName) {
    return [...node.childNodes].filter(n => n.nodeType === 1 && n.namespaceURI === W_NS && n.localName === localName);
  }

  function descendants(node, localName) {
    return [...node.getElementsByTagNameNS(W_NS, localName)];
  }

  function textOf(node) {
    return descendants(node, "t").map(t => t.textContent || "").join("");
  }

  function normalizedLabelText(s) {
    return String(s || "").replace(/\s+/g, " ").trim().replace(/[:*]+$/, "").trim().toLowerCase();
  }

  function cloneFirstChildByName(node, localName) {
    const el = directChildren(node, localName)[0];
    return el ? el.cloneNode(true) : null;
  }

  function newElement(doc, name) {
    return doc.createElementNS(W_NS, `w:${name}`);
  }

  function ensureBold(doc, rPr) {
    if (!rPr) return;
    if (!rPr.getElementsByTagNameNS(W_NS, "b").length) rPr.appendChild(newElement(doc, "b"));
    if (!rPr.getElementsByTagNameNS(W_NS, "bCs").length) rPr.appendChild(newElement(doc, "bCs"));
  }

  function makeRun(doc, prototypeRun, value, bold = null) {
    const r = newElement(doc, "r");
    const protoRPr = prototypeRun ? directChildren(prototypeRun, "rPr")[0] : null;
    const rPr = protoRPr ? protoRPr.cloneNode(true) : null;
    if (rPr) {
      if (bold === true) ensureBold(doc, rPr);
      if (bold === false) {
        descendants(rPr, "b").forEach(n => n.remove());
        descendants(rPr, "bCs").forEach(n => n.remove());
      }
      r.appendChild(rPr);
    }
    const t = newElement(doc, "t");
    if (/^\s|\s$|\s{2,}/.test(value || "")) t.setAttributeNS(XML_NS, "xml:space", "preserve");
    t.textContent = value || "";
    r.appendChild(t);
    return r;
  }

  function setParagraphText(doc, p, value, bold = null) {
    const prototypeRun = directChildren(p, "r")[0] || null;
    const pPr = directChildren(p, "pPr")[0] || null;
    [...p.childNodes].forEach(ch => {
      if (ch !== pPr) p.removeChild(ch);
    });
    p.appendChild(makeRun(doc, prototypeRun, value || "", bold));
  }

  function findCellByLabel(doc, label) {
    const needle = normalizedLabelText(label);
    const cells = descendants(doc, "tc");
    for (const cell of cells) {
      const paras = directChildren(cell, "p");
      if (!paras.length) continue;
      const first = normalizedLabelText(textOf(paras[0]).split("\n")[0]);
      if (first === needle || first.startsWith(needle)) return cell;
    }
    return null;
  }

  function setBreakParagraphValue(doc, p, label, value) {
    const runs = directChildren(p, "r");
    let breakRunIndex = -1;
    for (let i = 0; i < runs.length; i++) {
      if (descendants(runs[i], "br").length) { breakRunIndex = i; break; }
    }
    if (breakRunIndex < 0) return false;

    const prototypeValueRun = runs[breakRunIndex + 1] || runs[breakRunIndex];
    for (let i = runs.length - 1; i > breakRunIndex; i--) runs[i].remove();

    // Keep the label run intact. If a previous template has text after the break in
    // the same run, reduce that run to label text + break.
    const breakRun = runs[breakRunIndex];
    const ts = descendants(breakRun, "t");
    if (ts.length) {
      ts[0].textContent = label;
      ts.slice(1).forEach(t => t.remove());
    }
    const valueRun = makeRun(doc, prototypeValueRun, value || "", true);
    breakRun.parentNode.insertBefore(valueRun, breakRun.nextSibling);
    return true;
  }

  function setCellValue(doc, label, value) {
    const cell = findCellByLabel(doc, label);
    if (!cell) return false;
    const paras = directChildren(cell, "p");
    if (!paras.length) return false;

    if (descendants(paras[0], "br").length) {
      return setBreakParagraphValue(doc, paras[0], label, value || "");
    }

    let valueP = paras[1] || null;
    if (!valueP) {
      valueP = newElement(doc, "p");
      cell.appendChild(valueP);
    }
    setParagraphText(doc, valueP, value || "", true);
    for (let i = 2; i < paras.length; i++) {
      // Keep layout paragraphs but remove stale values.
      if (textOf(paras[i]).trim()) setParagraphText(doc, paras[i], "", true);
    }
    return true;
  }

  function setTicketId(xmlDoc, ticketNumber) {
    const paragraphs = descendants(xmlDoc, "p");
    for (const p of paragraphs) {
      const all = textOf(p);
      if (!/CSA\s*\/\s*Ticket|CSA\/Ticket/i.test(all)) continue;
      const ts = descendants(p, "t");
      const numeric = ts.filter(t => /^\d+$/.test((t.textContent || "").trim()));
      if (numeric.length) {
        numeric[numeric.length - 1].textContent = String(ticketNumber || "").replace(/\D/g, "");
        return true;
      }
      // Fallback: rewrite the paragraph text while preserving first run style.
      setParagraphText(xmlDoc, p, `CSA/Ticket ID: #${String(ticketNumber || "").replace(/\D/g, "")}`, true);
      return true;
    }
    return false;
  }

  function removeNumbering(pPr) {
    if (!pPr) return;
    descendants(pPr, "numPr").forEach(n => n.remove());
  }

  function setTasks(doc, tasks) {
    let cell = findCellByLabel(doc, "Scope of Work");
    if (!cell) {
      cell = descendants(doc, "tc").find(c => textOf(c).trim().toLowerCase().startsWith("scope of work")) || null;
    }
    if (!cell) return false;
    const paras = directChildren(cell, "p");
    let labelP = paras[0] || null;
    if (!labelP) {
      labelP = newElement(doc, "p");
      cell.appendChild(labelP);
      setParagraphText(doc, labelP, "Scope of Work:", null);
    }
    const prototypeP = paras[1] || paras[0];
    const protoPPr = prototypeP ? directChildren(prototypeP, "pPr")[0] : null;
    const protoRun = prototypeP ? directChildren(prototypeP, "r")[0] : null;

    directChildren(cell, "p").slice(1).forEach(p => p.remove());

    for (const raw of (tasks || [])) {
      const task = String(raw || "").replace(/[ \t]+/g, " ").trim();
      if (!task) continue;
      const p = newElement(doc, "p");
      if (protoPPr) {
        const pPr = protoPPr.cloneNode(true);
        removeNumbering(pPr);
        p.appendChild(pPr);
      }
      p.appendChild(makeRun(doc, protoRun, task, false));
      cell.appendChild(p);
    }
    return true;
  }

  function serializeXml(doc) {
    return new XMLSerializer().serializeToString(doc);
  }

  function parseXml(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");
    const error = doc.getElementsByTagName("parsererror")[0];
    if (error) throw new Error("The DOCX contains XML that could not be parsed in the browser.");
    return doc;
  }

  async function loadTemplateBytes(file) {
    if (file) {
      if (!/\.docx$/i.test(file.name || "")) throw new Error("Template must be a .docx file.");
      return await file.arrayBuffer();
    }
    const res = await fetch("./assets/CSA_TEMPLATE.docx", { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load the bundled CSA template.");
    return await res.arrayBuffer();
  }

  async function generateDocxBlob(templateBytes, data) {
    if (!window.JSZip) throw new Error("ZIP library did not load.");
    const zip = await JSZip.loadAsync(templateBytes);
    const docFile = zip.file("word/document.xml");
    if (!docFile) throw new Error("This DOCX does not contain word/document.xml.");

    const xmlText = await docFile.async("string");
    const doc = parseXml(xmlText);

    setCellValue(doc, "Company Name", data.company_name || "");
    setCellValue(doc, "Contact Name", data.contact_name || "");
    setCellValue(doc, "Mobile Number", data.mobile_number || "");
    setCellValue(doc, "Created Date/Time", data.created_date || "");
    setCellValue(doc, "Customer Visit Schedule Date", data.visit_schedule || "");
    setCellValue(doc, "Location Address", data.location_address || "");
    setCellValue(doc, "Ticket Category", data.ticket_category || "");
    setCellValue(doc, "Issue Category", data.issue_category || "");
    setCellValue(doc, "Issue Description", data.issue_description || "");
    setCellValue(doc, "Serial Number", data.serial_number || "");
    setCellValue(doc, "Support Agent", "");
    setCellValue(doc, "Assigned Engineer", "");
    setTasks(doc, Array.isArray(data.engineer_tasks) ? data.engineer_tasks : []);

    zip.file("word/document.xml", serializeXml(doc));

    const names = Object.keys(zip.files).filter(name => /^word\/header\d+\.xml$/i.test(name));
    for (const name of names) {
      const hText = await zip.file(name).async("string");
      const hDoc = parseXml(hText);
      if (setTicketId(hDoc, data.ticket_number || "")) zip.file(name, serializeXml(hDoc));
    }

    return await zip.generateAsync({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });
  }

  async function generateBatchZip(templateBytes, items) {
    const out = new JSZip();
    const seen = new Set();
    for (const item of items || []) {
      const ticket = String(item.ticket_number || "").replace(/\D/g, "");
      if (!ticket || seen.has(ticket)) continue;
      seen.add(ticket);
      const blob = await generateDocxBlob(templateBytes, item);
      out.file(`${ticket}.docx`, blob);
    }
    return await out.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  }

  window.CSADocx = { loadTemplateBytes, generateDocxBlob, generateBatchZip };
})();
