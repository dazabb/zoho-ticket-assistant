/* SANDZ L1.5 operational guardrails based on the user's customer mapping reference.
 * Keep actual incident observations separate from suggested classification.
 * Used for prompt guidance, generated Zoho output, and final Zoho autofill.
 */
(function (root, factory) {
  const exported = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = exported;
  if (root) root.MAUSandzTicketRules = exported;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function () {
  "use strict";

  const CASES = [
    {
      id: "bpitc", customer: "BPI Tokyo Century", account: "BPI Tokyo Century (BPITC) - Sandz",
      subject: "BPI Tokyo Century", contact: "Sir Adrian",
      primaryHost: /\b(?:mkt-prod-sapb1(?:-dr|-IMAGE)?|bpictmktfs2(?:-src|-IMAGE)?|Bpitcmktsapdb)\b/i,
      accountName: /\b(?:BPI\s*Tokyo\s*Century|BPITC)\b/i,
      se: "Jhon Philip Doblado / CJ Tecson", pmsd: "Lian"
    },
    {
      id: "radius", customer: "RADIUS TELECOMS INC.", account: "RADIUS TELECOMS INC. - Sandz",
      subject: "RADIUS TELECOMS INC.", contact: "Sir Rustom",
      primaryHost: /\b(?:iwf-url-filtering(?:-src|-IMAGE)?|ert(?:-src-IMAGE|-tgt)|radiuspr1(?:-src)?|fiberdash(?:-src)?)\b/i,
      accountName: /\b(?:Radius\s+Telecoms|RADIUS TELECOMS INC\.?|\bRadius\b)/i,
      se: "CJ Tecson / Aeron Villanueva", pmsd: "Cha"
    },
    {
      id: "natre", customer: "National Reinsurance Corporation of the Philippines", account: "National Reinsurance Corporation of the Philippines - Sandz",
      subject: "NatRe", contact: "Sir Rico",
      primaryHost: /\bNatre_Backup_Copy_to_Immutable_S3-2\b/i,
      accountName: /\b(?:NatRe|National Reinsurance)\b/i,
      se: "CJ Tecson / EJ Remolona", pmsd: "Cha"
    },
    {
      id: "gma", customer: "GMA Network Inc.", account: "GMA Network Inc. - Sandz",
      subject: "GMA", contact: "",
      primaryHost: /\bSIR66-New\b/i,
      accountName: /\bGMA\s+(?:Network|Inc\.?)/i,
      se: "CJ Tecson / EJ Remolona", pmsd: "Cha"
    },
    {
      id: "ewb", customer: "East West Bank", account: "East West Bank - Sandz",
      subject: "EWB", contact: "",
      primaryHost: /\b(?:EastWest-Atempo-TINA-Backup)\b/i,
      accountName: /\b(?:East\s*West\s*Bank|EWB)\b/i,
      se: "Lery Ponce / Aeron Villanueva", pmsd: "Lian"
    }
  ];
  const DR_PORTFOLIO = "(DRaaS) Disaster Recovery as a Service";
  const DR_CATEGORY = "Disaster Recovery - Incident";
  const DR_ALLOWED_SUBCATEGORIES = ["Device Issue", "FailOver Issue", "Network Issue", "Performance Issue"];
  const BACKUP_PORTFOLIO = "(BaaS) Backup as a Service";

  function isRackwareSync(text) {
    const raw = String(text || "");
    return /(?:Rack\s*Ware|RMM\s+Wave\s+item\s+sync|RSP_SYNC_|Wave\s+Sync\s+item\s+Failed|Stage\s*[12]\s+Sync|TNG\s+delta\s+data\s+transfer|\brwsyncalerts\b|sync\.alerts\.rackwareinc\.com)/i.test(raw);
  }
  const HISTORY = typeof MAUAccountHistory !== "undefined" ? MAUAccountHistory
    : (typeof globalThis !== "undefined" ? globalThis.MAUAccountHistory : null);
  function fromHistory(record, evidence) {
    if (!record) return null;
    const known = CASES.find(c => c.customer === record.customer || (record.account && c.account === record.account));
    return {
      ...(known || {}),
      id: known ? known.id : record.id,
      customer: record.customer,
      subject: record.subject,
      account: record.accountVerified ? record.account : "",
      accountVerified: Boolean(record.accountVerified),
      se: known ? known.se : "",
      pmsd: known ? known.pmsd : "",
      evidence,
      historicTickets:record.count
    };
  }
  function explicitCompanyFromText(text) {
    if (!HISTORY) return null;
    const source=String(text||"");
    // Read a named ticket field, not a customer mentioned in an unrelated sidebar
    // row, old correspondence, or concatenated case history.
    for (const label of ["Customer Company Name", "Account Name"]) {
      const pattern = new RegExp("(?:^|\\n)\\s*" + label + "\\s*:\\s*([^\\n]+)","i");
      const match=source.match(pattern);
      if (!match) continue;
      const raw=match[1].trim().replace(/\s*[-–]\s*Sandz\s*$/i,"");
      const found=HISTORY.findByCompany(raw);
      if (found) return fromHistory(found, "explicit-company");
    }
    return null;
  }
  function subjectHistoryFromText(text) {
    if (!HISTORY) return null;
    const source=String(text||"");
    // Only ticket subject fields and the first line; never scan whole ticket
    // history for arbitrary company acronyms such as BPI or DOE.
    const explicit=source.match(/(?:^|\n)\s*Subject\s*:\s*([^\n]+)/i);
    const first=source.split(/\r?\n/).map(x=>x.trim()).find(x=>x);
    const match=HISTORY.findBySubject(explicit ? explicit[1] : first||"");
    return match ? fromHistory(match.record, "historical-subject") : null;
  }
  function resolveAccount(text) {
    const raw = String(text || "");
    // Strong evidence from the affected system takes precedence over Zoho's
    // notification-account label and unrelated ticket-list history.
    const hostMatches = CASES.map(c => {
      const pattern = new RegExp(c.primaryHost.source, "gi");
      const count = (raw.match(pattern) || []).length;
      const leadingCount = (raw.slice(0, 1800).match(pattern) || []).length;
      return {caseInfo:c,count,score:count + leadingCount * 3};
    }).filter(m => m.count > 0).sort((a,b) => b.score-a.score);
    if (hostMatches.length === 1) {
      const found=hostMatches[0].caseInfo;
      const company=explicitCompanyFromText(raw);
      const subj=subjectHistoryFromText(raw);
      const conflict=Boolean((company && company.account && company.account!==found.account) || (subj && subj.account && subj.account!==found.account));
      return {...found, accountVerified:true, evidence: "affected-workload",
        needsReview:conflict,
        conflictingCompany:company && company.account!==found.account ? company.customer : "",
        conflictingSubject:subj && subj.account!==found.account ? subj.customer : ""};
    }
    if (hostMatches.length > 1) {
      // Ticket list / sidebar often includes unrelated customer alerts.
      // Pick the dominant affected workload only when the signal is clear.
      if (hostMatches[0].score > hostMatches[1].score * 2) {
        const found=hostMatches[0].caseInfo;
        const company=explicitCompanyFromText(raw);
        const subj=subjectHistoryFromText(raw);
        const conflict=Boolean((company && company.account && company.account!==found.account) || (subj && subj.account && subj.account!==found.account));
        return {...found,accountVerified:true,evidence:"dominant-affected-workload",
          needsReview:conflict,
          conflictingCompany:company && company.account!==found.account ? company.customer : "",
          conflictingSubject:subj && subj.account!==found.account ? subj.customer : ""};
      }
      return null;
    }
    const explicit=explicitCompanyFromText(raw);
    const historical=subjectHistoryFromText(raw);
    if (explicit && historical && explicit.customer!==historical.customer) {
      return {...explicit,needsReview:true,conflictingSubject:historical.customer};
    }
    if (explicit) return explicit;
    if (historical) return historical;
    // Legacy aliases only for known accounts, and only in short incident
    // requests. Avoid a match from an unrelated ticket-list / alert history.
    if (raw.length <= 2000) {
      const accounts = CASES.filter(c => c.accountName.test(raw));
      if (accounts.length === 1) return {...accounts[0], accountVerified:true, evidence: "account-name"};
    }
    return null;
  }
  // Keep Zoho ticket IDs in ticket details, NOT in the Subject field.
  // The cleaner is used by the assistant reply, saved-session renderer,
  // editable ticket workspace, and the final Zoho extension payload.
  function normalizeSubject(value, incidentText) {
    let subject = String(value || "").replace(/\s+/g, " ").trim();
    if (!subject) return "";
    // Old prompt appended "Ticket No. #111743" to the end of the title.
    // Keep the number in internal notes / client email, never the Subject.
    subject = subject.replace(/(?:\s*[-–—|:,]\s*)?\bTicket\s*(?:No\.?|Number|#)\s*[:#.-]*\s*#?\d{4,12}\s*\.?\s*$/i, "").trim();
    subject = subject.replace(/\s*[-–—|:,]\s*$/, "").replace(/\.$/, "").trim();

    // Compact the noisy RackWare forwarder title only when the alert and
    // affected host are explicit, and a single customer can be resolved.
    // Never infer Stage 1/2 from a generic "sync failed" notification.
    const source = String(incidentText || "");
    const combined = subject + "\n" + source;
    const noisyRackware = /\[\s*(?:RMM|Wave|Host)\s*-/i.test(subject)
      && /RMM\s+Wave\s+item\s+sync\s+alert\s*-?\s*Failed/i.test(subject)
      && isRackwareSync(combined);
    if (noisyRackware) {
      const account = resolveAccount(source || subject);
      const hostMatch = subject.match(/\[\s*Host\s*-\s*([^\]\r\n]+)\s*\]/i)
        || subject.match(/\[\s*Wave\s*-\s*([^\]\r\n]+)\s*\]/i);
      if (account && hostMatch) {
        const host = hostMatch[1].trim();
        const prefixMatch = subject.match(/^(SANDZ-(?:MSDCO|SI))-?/i);
        const stageMatch = source.match(/\bStage\s*([12])\s*Sync\b/i);
        const prefix = prefixMatch ? prefixMatch[1].toUpperCase() : "SANDZ-MSDCO";
        if (host && /^[a-z0-9][a-z0-9._-]*$/i.test(host)) {
          subject = `${prefix}-${account.subject}-RackWare ${stageMatch ? `Stage ${stageMatch[1]} Sync` : "Wave Sync"} Failed - ${host}`;
        }
      }
    }
    // Historical report normalizer: keep exact observed subject details,
    // changing only a known customer label or documented typo. Don't infer
    // account identity from a broad acronym match inside technical details.
    if (HISTORY && /^SANDZ[-–](?:MSDCO|SI|MSCDCO)[-–]/i.test(subject)) {
      const resolved = resolveAccount(incidentText || subject);
      if (resolved && !resolved.needsReview) {
        const record = HISTORY.findByCompany(resolved.customer);
        if (record) subject = HISTORY.makeSubject(subject,record);
      }
    }
    return subject;
  }

  function getDecision(text) {
    const source = String(text || "");
    const account = resolveAccount(source);
    const rackware = isRackwareSync(source);
    const drIncident = rackware && !/\b(?:planned|scheduled)\s+(?:test|migration|activity|maintenance)\b/i.test(source);
    if (!account && !rackware) return null;
    const hasTimeout = /\b(?:SYNC_ERROR_TIMEOUT|timed?\s*out|timeout|delta\s+(?:data\s+)?transfer\s+(?:of\s+)?[A-Z]:\s+failed)\b/i.test(source);
    const broadImpact = /\b(?:production\s+down|multiple\s+(?:critical\s+)?(?:hosts|systems|workloads)\s+(?:affected|failed)|service-wide|DR\s+not\s+functioning|major\s+outage|critical\s+outage)\b/i.test(source);
    return {
      account, rackware, drIncident,
      portfolio: drIncident ? DR_PORTFOLIO : "",
      category: drIncident ? DR_CATEGORY : "",
      subcategory: drIncident && hasTimeout ? "Performance Issue" : "",
      severitySuggestion: drIncident && !broadImpact ? "Sev3" : "",
      prioritySuggestion: drIncident && !broadImpact ? "Medium" : "",
      hasTimeout, broadImpact
    };
  }
  function textLabelPattern(label) {
    return new RegExp("^(\\s*" + label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ":)[ \\t]*(.*)$", "im");
  }
  function setField(block, label, value, options) {
    if (!value) return block;
    const pattern = textLabelPattern(label);
    if (pattern.test(block)) return block.replace(pattern, function (_, prefix, previous) {
      if (options && options.ifEmpty && String(previous || "").trim()) return prefix + " " + previous;
      return prefix + " " + value;
    });
    // Insert fields by expected Zoho order rather than appending them after assignments.
    if (label === "Technology/Platform" && /^(\s*Supported Portfolio:[^\n]*)(\n|$)/im.test(block)) {
      return block.replace(/^(\s*Supported Portfolio:[^\n]*)(\n|$)/im, "$1\n" + label + ": " + value + "$2");
    }
    if (label === "Ticket Owner" && /^(\s*PM\/SD of this account:[^\n]*)(\n|$)/im.test(block)) {
      return block.replace(/^(\s*PM\/SD of this account:[^\n]*)(\n|$)/im, "$1\n" + label + ": " + value + "$2");
    }
    const delimiter = /^(Viber Details\/Zoho Comment on Ticket for initial troubleshooting:)/im;
    if (delimiter.test(block)) return block.replace(delimiter, label + ": " + value + "\n\n$1");
    return block.trimEnd() + "\n" + label + ": " + value;
  }
  function extractValue(text, label) {
    const match = String(text || "").match(textLabelPattern(label));
    return match ? match[2].trim() : "";
  }
  function fixZohoText(raw, incidentText) {
    const original = String(raw || "");
    const decision = getDecision(incidentText);
    if (!/(?:^|\n)\s*(?:Customer Company Name|Account Name|Subject|Supported Portfolio):/i.test(original)) return {text:original,changes:[]};
    const lines = original.split(/\r?\n/);
    const viberAt = lines.findIndex(line => /^Viber Details\/Zoho Comment on Ticket for initial troubleshooting:/i.test(line.trim()));
    let fields = (viberAt >= 0 ? lines.slice(0,viberAt) : lines).join("\n");
    const notes = viberAt >= 0 ? "\n" + lines.slice(viberAt).join("\n") : "";
    const changes = [];
    function update(label,value,opts) {
      if (!value) return;
      const old = extractValue(fields,label);
      if (old === value) return;
      fields = setField(fields,label,value,opts);
      if (!opts || !opts.ifEmpty || !old) changes.push(label + (old ? ": corrected" : ": populated"));
    }
    const oldSubject = extractValue(fields,"Subject");
    const cleanSubject = normalizeSubject(oldSubject,incidentText);
    if (oldSubject && cleanSubject !== oldSubject) update("Subject", cleanSubject);
    if (!decision) return {text:fields + notes,changes};
    if (decision.account && decision.account.needsReview) {
      changes.push("Account mismatch: source company and affected workload/subject differ; review Zoho account before autofill");
    }
    if (decision.account && !decision.account.needsReview) {
      update("Customer Company Name",decision.account.customer);
      if (decision.account.account) update("Account Name",decision.account.account);
      else {
        // Export contains company labels and subjects, not verified Account
        // Name values. Never rely on the previous AI's "Company - Sandz" guess.
        update("Account Name","Verify exact account in Zoho Desk");
      }
      update("SE's that can handle this ticket",decision.account.se);
      update("PM/SD of this account",decision.account.pmsd);
    }
    if (decision.drIncident) {
      update("Supported Portfolio",DR_PORTFOLIO);
      update("Ticket Category","Incident");
      update("Issue Category",DR_CATEGORY);
      update("Technology/Platform","RackWare");
      update("Ticket Owner","Sandz Support L1.5",{ifEmpty:true});
      update("Solutions","MS");
      const oldSub = extractValue(fields,"Issue Subcategory") || extractValue(fields,"Issue Sub-Category");
      const subLabel = /(^|\n)\s*Issue Sub-Category:/i.test(fields) ? "Issue Sub-Category" : "Issue Subcategory";
      if (decision.subcategory) update(subLabel,decision.subcategory);
      else if (oldSub && !DR_ALLOWED_SUBCATEGORIES.includes(oldSub)) {
        // Never pass an invalid DR incident category to Zoho.
        fields = setField(fields,subLabel,"Verify in Zoho Desk");
        changes.push("Issue Subcategory: requires verification");
      }
      if (decision.severitySuggestion) {
        // The recommendation is only suitable for an isolated incident, and can
        // be overridden by an engineer based on documented business impact.
        const oldSeverity = extractValue(fields,"Severity");
        if (!oldSeverity || !/^Sev[1234]$/i.test(oldSeverity)) update("Severity",decision.severitySuggestion);
        const oldPriority = extractValue(fields,"Priority");
        if (!oldPriority || !/^(High|Medium|Low)$/i.test(oldPriority)) update("Priority",decision.prioritySuggestion);
      }
    }
    let normalizedNotes = notes;
    // This change requires evidence that a tracked ticket is already open.
    // A ticket number alone does not establish its status.
    const openTicketInContext = /(?:Ticket\s*(?:No\.|Number)?\s*#?\s*\d{5,8}[\s\S]{0,100}?\bOpen\b|#\d{5,8}[\s\S]{0,110}?\bOpen\b)/i.test(String(incidentText || ""));
    if (decision.drIncident && openTicketInContext && /New Incident Ticket/i.test(normalizedNotes)) {
      normalizedNotes = normalizedNotes.replace(/New Incident Ticket/i, "Existing Incident Ticket");
      changes.push("Ticket handling: existing open incident");
    }
    return {text:fields + normalizedNotes,changes,decision};
  }
  function correctZohoPayload(payload,sourceText) {
    if (!payload || !payload.fields) return payload;
    const decision = getDecision(sourceText);
    const fields = payload.fields;
    if (fields["Subject"]) fields["Subject"] = normalizeSubject(fields["Subject"],sourceText);
    if (!decision) return payload;
    if (decision.account && decision.account.needsReview) {
      // Don't silently override the company on inconsistent historical tickets.
      // Let the engineer resolve the mismatch using the actual affected host.
      payload.accountMappingWarning = "Customer company conflicts with the subject/workload. Verify the correct Zoho account.";
      fields["Customer Company Name"] = "";
      fields["Account Name"] = "";
    } else if (decision.account) {
      fields["Customer Company Name"] = decision.account.customer;
      // Zoho extension payload historically lacked Account Name; provide it.
      if (decision.account.account) fields["Account Name"] = decision.account.account;
      else fields["Account Name"] = "";
    }
    if (decision.drIncident) {
      fields["Supported Portfolio"] = DR_PORTFOLIO;
      fields["Issue Category"] = DR_CATEGORY;
      fields["Ticket Category"] = "Incident";
      fields["Solutions"] = "MS";
      fields["Technology/Platform"] = "RackWare";
      fields["Ticket Owner"] = fields["Ticket Owner"] || "Sandz Support L1.5";
      if (decision.subcategory) fields["Issue Sub-Category"] = decision.subcategory;
      else if (!DR_ALLOWED_SUBCATEGORIES.includes(fields["Issue Sub-Category"])) fields["Issue Sub-Category"] = "";
    }
    return payload;
  }
  const POLICY = `SANDZ L1.5 operational policy (takes precedence over broad old keyword mappings):
- Determine customer by the actual affected workload/host, not merely the ticket-list context, CC recipients or the account chosen by automatic notification. mkt-prod-sapb1, mkt-prod-sapb1-dr -> BPI Tokyo Century (BPITC) - Sandz. iwf-url-filtering, ert -> RADIUS TELECOMS INC. - Sandz. Do not mix alerts from unrelated tickets.
- For RackWare RMM Wave Sync, Stage 1/Stage 2 synchronization or replication failures: Supported Portfolio MUST be (DRaaS) Disaster Recovery as a Service; Issue Category MUST be Disaster Recovery - Incident; Solutions MS; Technology/Platform RackWare. Do NOT classify as BaaS or Backup - Incident merely because the workflow resembles backup.
- Exact valid DR incident subcategories in this desk: Device Issue; FailOver Issue; Network Issue; Performance Issue. For a delta-transfer timeout, suggest Performance Issue, subject to review. Never output Reliability Issue as a DR subcategory unless Zoho options change.
- Account references: BPITC known SE Jhon Philip Doblado / CJ Tecson, PM/SD Lian, recipient Sir Adrian. Radius known SE CJ Tecson / Aeron Villanueva, PM/SD Cha, recipient Sir Rustom. NatRe known SE CJ Tecson / EJ Remolona, PM/SD Cha, recipient Sir Rico. These are contact references, NOT proof an engineer has accepted the ticket or is available.
- If the incident involves a single host/job and broader impact is not shown, suggest Sev3 / Medium, not an unsupported Sev1/Sev2. Confirm with the current business impact and support policy.
- For RackWare, distinguish Stage 1 vs Stage 2, source, image, target, job ID, file system and exact error. A timeout on C: delta sending is an observed failure, not proof of network, disk, permission, or storage root cause. Record successful file systems separately from failed ones.
- Before recommending a new ticket, check supplied history. If the same workload is tracked under an existing OPEN ticket, recommend updating that ticket and use its actual number. Do not duplicate just because a fresh alert arrived.
- Internal comment order: Issue/Request, Ticket No. (only if present), Affected Environment, Job Details, Observed Error, Initial Handling (visible evidence only), Next Action, Possible Triage. Triage is proposed; never claim tasks, retries, logins, assignments or resolution occurred.
- Customer email only when explicitly requested. Use Hi Sir Adrian for confirmed BPITC recipient, Hi Sir Rustom for Radius, Hi Sir Rico for NatRe; otherwise verify recipient. Use Good Day!, precise error and workload, actual ticket number only if supplied, polite closing, no signature.
- Subject must be concise and identify the actual issue/workload. NEVER append "Ticket No. #...", "Ticket #...", or a case number to a Zoho Subject. Put verified existing ticket IDs in the internal note, not in Subject.
- For a RackWare alert like [ RMM - rmm-server ] - [ Wave - mkt-prod-sapb1 ] - [ Host - mkt-prod-sapb1 ] - RMM Wave item sync alert - Failed, prefer SANDZ-MSDCO-BPI Tokyo Century-RackWare Stage 1 Sync Failed - mkt-prod-sapb1 ONLY when Stage 1 is confirmed by the alert; otherwise say Wave Sync Failed.
- Keep generated ticket fields in order for Zoho autofill; don't add internal Part A commentary inside field values. Prefer straight, professional SANDZ operations language with no fluff.`;
  function guidanceFor(text) {
    const d = getDecision(text);
    const historyPolicy = HISTORY ? "\n- The 2026 Zoho historical subject/account reference covers 39 canonical customer records. Use canonical historical subject labels only when a company, explicit subject or affected host establishes the match. Keep BPI separate from BPI Tokyo Century, HONDA separate from Honda Parts Manufacturing, and unassigned customer rows unresolved. The history export has NO exact Zoho Account Name column. For accounts without a verified exact name, write Account Name: Verify exact account in Zoho Desk rather than guessing <company> - Sandz. Never force DRaaS/BaaS from customer name alone; determine service by the actual platform/job.\n" : "";
    if (!d) return POLICY + historyPolicy;
    const context = [];
    if (d.account) {
      context.push(`Confirmed account reference from ${d.account.evidence}: ${d.account.customer} | ${d.account.account} | known SE ${d.account.se} | PM/SD ${d.account.pmsd}.`);
    }
    if (d.drIncident) {
      context.push(`This alert is a RackWare replication incident, not a backup-service incident. Force Supported Portfolio ${DR_PORTFOLIO}, Issue Category ${DR_CATEGORY}, Solutions MS, Technology/Platform RackWare.`);
      if (d.subcategory) context.push(`The alert includes timeout/delta-transfer failure: suggested DR subcategory ${d.subcategory} (verify in Zoho).`);
      if (d.severitySuggestion) context.push(`Isolated issue unless other impact is evidenced: suggested ${d.severitySuggestion} / ${d.prioritySuggestion}.`);
    }
    if (d.account && d.account.needsReview) context.push("CONFLICT: Customer company and the incident subject/workload disagree. Do NOT auto-fill the account or silently rewrite the subject; request manual account verification.");
    if (d.account && d.account.evidence === "historical-subject") context.push("Account recognized from the actual subject, not Zoho Account Name; verify against the affected workload.");
    if (d.account && !d.account.account) context.push("Exact Zoho Account Name not established by historical export; verify manually rather than inventing a - Sandz suffix.");
    return POLICY + historyPolicy + (context.length ? "\n\nCurrent incident checks:\n- " + context.join("\n- ") : "");
  }
  return {getDecision,resolveAccount,isRackwareSync,normalizeSubject,fixZohoText,correctZohoPayload,guidanceFor,DR_PORTFOLIO,DR_CATEGORY,DR_ALLOWED_SUBCATEGORIES,BACKUP_PORTFOLIO};
});
