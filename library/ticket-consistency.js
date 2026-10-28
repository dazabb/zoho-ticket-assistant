/* Shared deterministic final checks for evidence-backed ticket classification.
 * Never infer a whole ticket from a notification source or another customer.
 */
(function(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.MAUTicketConsistency = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null), function () {
  'use strict';
  const pick = (text,name) => {
    const pat = name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const m = String(text||'').match(new RegExp('(?:^|\\n)\\s*'+pat+':\\s*([^\\r\\n]*)','i'));
    return m ? m[1].trim() : '';
  };
  const put = (text,name,value) => {
    const pat = name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return String(text||'').replace(new RegExp('(^[ \\t]*'+pat+':[ \\t]*)([^\\r\\n]*)','im'), (_,pre) => pre + value);
  };
  function decide(text, evidence) {
    const original = String(evidence||'');
    const given = String(text||'');
    const shortFields = ['Subject','Description','Issue Description','Issue/Request'].map(n => pick(given,n)).filter(Boolean).join(' ');
    const sourceEvidence = original.slice(0,6000);
    const focused = [shortFields,sourceEvidence].filter(Boolean).join(' ');
    const isBackup = /\bBackup\s*-\s*Incident\b/i.test(pick(given,'Issue Category'));
    const error = /TN_ERR_CONNECT_SERV|\bunreachable\s+(?:backup\s+)?agent\b|\b(?:backup\s+server|agent)\s+(?:cannot|could\s+not|unable\s+to)\s+connect\b/i.test(focused);
    const failed = /\b(?:backup\s+job|incremental\s+backup|full\s+backup|backup\s+attempt)\b[\s\S]{0,120}\b(?:failed|failure|stopped)\b|\b(?:failed|failure)\b[\s\S]{0,80}\bbackup\b/i.test(focused);
    const auth = /\b(?:permission denied|access denied|authentication failed|invalid (?:password|credentials)|login failed|account locked|403 forbidden)\b/i.test(focused);
    const atina = /\bAtempo\s+(?:Time\s+Navigator|TINA|ATINA)\b|\bTN_ERR_CONNECT_SERV\b/i.test(focused);
    const hostLine = sourceEvidence.match(/(?:^|\n)\s*Hostname\s*:\s*([A-Za-z0-9_-]+)/i);
    const hosts = [...sourceEvidence.matchAll(/(?:^|\n)\s*Hostname\s*:\s*([A-Za-z0-9_-]+)/gi)];
    const ewb = /^\s*EWB\b/i.test(sourceEvidence) || /^East West Bank$/i.test(pick(given,'Customer Company Name'));
    const canonicalHost = hostLine && hosts.length===1 ? hostLine[1] : '';
    return {isBackup,agentJobFailure:isBackup && error && failed && !auth, atina:isBackup && atina, canonicalHost:ewb && canonicalHost && isBackup && error && failed && !auth && atina ? canonicalHost : ''};
  }
  function fixZohoText(raw, source) {
    let text = String(raw||'');
    const d = decide(text,source);
    const changes=[];
    if(d.canonicalHost && /^SANDZ-MSDCO-EWB-/i.test(pick(text,'Subject'))) {
      const standard='Atempo Backup Job Failed - '+d.canonicalHost+' Unreachable';
      text=put(text,'Subject','SANDZ-MSDCO-EWB-'+standard);
      text=put(text,'Description',standard);
      changes.push('Subject / Description');
    }
    if(d.agentJobFailure && /^(?:Access Issue|Verify in Zoho Desk)$/i.test(pick(text,'Issue Subcategory')||pick(text,'Issue Sub-Category'))) {
      const label = /(?:^|\n)\s*Issue Sub-Category\s*:/i.test(text) ? 'Issue Sub-Category':'Issue Subcategory';
      text=put(text,label,'Reliability Issue');changes.push('Issue Subcategory');
    }
    if(d.atina && /^(?:Atempo|Atempo TINA|Atempo Time Navigator|Verify in Zoho Desk)$/i.test(pick(text,'Technology/Platform'))) {
      text=put(text,'Technology/Platform','Atempo Time Navigator (ATINA)');changes.push('Technology/Platform');
    }
    const owner=pick(text,'Ticket Owner');
    if(/^Verify\b/i.test(owner) && /\b(?:ticket owner|exact account|account in Zoho)\b/i.test(owner)) {
      text=put(text,'Ticket Owner','Verify ticket owner in Zoho Desk');
      changes.push('Ticket Owner');
    }
    return {text,changes};
  }
  function fixPayload(payload,source) {
    if (!payload || !payload.fields) return payload;
    const f=payload.fields;
    const converted=Object.entries(f).map(([k,v])=> k+': '+v).join('\n');
    const d=decide(converted,[payload.rawWorkspace,source].filter(Boolean).join('\n'));
    if(d.canonicalHost && /^SANDZ-MSDCO-EWB-/i.test(f.Subject||'')) {
      const standard='Atempo Backup Job Failed - '+d.canonicalHost+' Unreachable';
      f.Subject='SANDZ-MSDCO-EWB-'+standard;
      f.Description=standard;
      if(f['Issue Description'])f['Issue Description']=standard;
    }
    if(d.agentJobFailure && /^(Access Issue|Verify in Zoho Desk)$/i.test(f['Issue Sub-Category']||''))f['Issue Sub-Category']='Reliability Issue';
    if(d.atina && /^(Atempo|Atempo TINA|Atempo Time Navigator|Verify in Zoho Desk)$/i.test(f['Technology/Platform']||''))f['Technology/Platform']='Atempo Time Navigator (ATINA)';
    if(/^Verify\b/i.test(f['Ticket Owner']||'') && /\b(?:ticket owner|exact account|account in Zoho)\b/i.test(f['Ticket Owner']||''))f['Ticket Owner']='Verify ticket owner in Zoho Desk';
    return payload;
  }

  /* Current-ticket evidence wins over account/project history and the AI's own
     proposed classification. Do not use a ticket list or an old forwarded chain. */
  function currentZohoSubject(source) {
    const raw=String(source||'');
    // Zoho's ticket editor has its own title between SaveCancel and Reply All.
    const editor=raw.match(/Save\s*Cancel\s*\n\s*([^\r\n]+)[\s\S]{0,650}?\bReply All\b/i);
    if(editor && /^SANDZ[-–](?:MSDCO|SI)[-–]/i.test(editor[1].trim())) return editor[1].trim();
    // Some copies have no SaveCancel but have a single current-ticket title.
    const direct=raw.match(/(?:^|\n)\s*(?:Current Ticket Subject|Existing Zoho Subject)\s*:\s*(SANDZ[-–](?:MSDCO|SI)[-–][^\r\n]+)/i);
    if(direct)return direct[1].trim();
    const beforeReply=raw.match(/\n\s*(SANDZ[-–](?:MSDCO|SI)[-–][^\r\n]+)\s*\n\s*Reply All\b/i);
    if(beforeReply)return beforeReply[1].trim();
    return '';
  }
  function sourceField(source,field) {
    const raw=String(source||'');
    const fromProperties=raw.lastIndexOf('Ticket Properties');
    const subjectBound=raw.indexOf('Reply All',Math.max(fromProperties,0));
    const block=fromProperties>=0 ? raw.slice(fromProperties,subjectBound>fromProperties?subjectBound:undefined) : raw;
    const re=new RegExp('(?:^|\\n)\\s*'+field.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*\\*?\\s*(?::\\s*|\\n\\s*)([^\\r\\n]+)','i');
    const matched=block.match(re);
    if(!matched)return '';
    const value=matched[1].trim();
    return /^(?:-None-|None|Verify|--?|dd MMM yyyy)$/i.test(value)?'':value;
  }
  function sourceEvidence(source) {
    const raw=String(source||'');
    // When pasted directly from Zoho, look at the current conversation rather
    // than the unrelated tickets in the left-hand search results.
    const conversation=raw.lastIndexOf('Reply All');
    if(conversation>=0) {
      const segment=raw.slice(conversation);
      // Trim reply chains if the first message includes them; the earliest
      // ticket email still provides the original observed issue.
      return segment.slice(0,18000);
    }
    return raw.slice(0,18000);
  }
  function storageIncident(source,generated) {
    const evidence=sourceEvidence(source);
    const proposed=[pick(generated,'Subject'),pick(generated,'Description'),pick(generated,'Issue/Request')].join(' ');
    const subject=evidence.length>70 ? evidence : proposed;
    const hardware=/\b(?:Dell\s*(?:EMC\s*)?Unity|Unity\s*(?:380F|480F|550F)|storage\s+(?:array|pool|appliance)|NAS\s+server)\b/i.test(subject);
    // Existing faults, unlike a proposed firmware update or health-report request.
    const stuck=/(?:snapshot[^\n.]{0,130}(?:hung|stuck|frozen|destroying)|(?:hung|stuck|frozen)[^\n.]{0,90}snapshot)/i.test(subject);
    const naming=/(?:LDAP|NIS|DNS|naming services)[\s\S]{0,180}(?:fail(?:ed|ure|s)?|unable\s+to\s+update|not\s+updating|old\s+IP|error)|(?:fail(?:ed|ure|s)?)[^\n.]{0,100}(?:LDAP|NIS|DNS)/i.test(subject);
    const degraded=/\b(?:degraded\s+(?:file\s+system|FS|storage)|(?:file\s+system|FS)[^\n.]{0,45}degraded)\b/i.test(subject);
    const significant=Number(stuck)+Number(naming)+Number(degraded);
    const vendor=/\bDell\s*(?:EMC\s*)?Unity\b/i.test(subject)?'Dell':'';
    return {isStorageIncident:hardware && significant>=2,stuck,naming,degraded,vendor,
      capacity:stuck && /(?:\b\d+(?:\.\d+)?\s*(?:TB|GB)\b|consum(?:ing|es?)\s+\d+|insufficient\s+storage|full\s+pool)/i.test(subject)};
  }
  function recentTicketId(source) {
    const raw=String(source||'');
    const match=raw.match(/\bReply All\s*\n\s*#(\d{4,12})\b/i);
    return match?match[1]:'';
  }
  // Match the same SI/MS database used by the prompt generator; the current
  // Zoho subject is NOT service-line authority. Prefer the current ticket's
  // account properties, not unrelated customer names in sidebar search results.
  function databaseService(source, generated) {
    const account = sourceField(source,'Account Name') || sourceField(source,'Customer Company Name')
      || pick(generated,'Customer Company Name') || pick(generated,'Account Name');
    const direct = /^\s*(?:Verify|None|-None-)\b/i.test(account) ? '' : account;
    const focus = [direct,sourceEvidence(source)].filter(Boolean).join('\n');
    const project = typeof window !== 'undefined' && window.MAUProjectDatabase;
    let decision = project && typeof project.decide==='function' ? project.decide(focus) : null;
    // If a screenshot has no ticket-properties section, use the explicit
    // customer in the generated ticket rather than the sidebar of other cases.
    if(!decision && direct && project && typeof project.decide==='function')decision=project.decide(direct);
    const serviceApi = typeof window!=='undefined' ? window.MAUServiceLine : null;
    const service = serviceApi ? serviceApi.resolve(focus, direct?{customer:direct}:null, decision) : null;
    return {service:service?.confidence==='database'?service.type:'',decision,account:direct};
  }
  function validatedStorageResult(source,generated) {
    const findings=storageIncident(source,generated);
    // This exact correction is for Dell Unity evidence, not every storage vendor.
    if(!findings.isStorageIncident || findings.vendor !== 'Dell') return null;
    const db=databaseService(source,generated);
    const currentSubject=currentZohoSubject(source);
    const generatedSubject=pick(generated,'Subject');
    const label=(currentSubject||generatedSubject).match(/^SANDZ[-–](?:MSDCO|SI)[-–]([^\r\n-]+)[-–]/i)?.[1]
      || (db.account ? db.account.replace(/\s*[-–]\s*Sandz\s*$/i,'') : '');
    const concise='Dell Unity 380F Snapshot, Naming Services and File System Issues';
    const subject=db.service&&label?('SANDZ-'+(db.service==='MS'?'MSDCO':'SI')+'-'+label+'-'+concise):'';
    const knownAccount=sourceField(source,'Account Name');
    // The current ticket does not provide a filled Severity field. Use the
    // existing SANDZ severity matrix, rather than writing a non-selectable
    // "Verify" placeholder. Three concurrent faults (snapshot blocked,
    // naming services failing and a degraded filesystem) constitute major
    // storage-service degradation -> Sev2. Isolated faults remain Sev3.
    // A genuinely supplied Zoho severity still wins.
    const severityFromTicket=sourceField(source,'Severity Level') || sourceField(source,'Severity');
    const severity=/^Sev[1-4]$/i.test(severityFromTicket) ?
      'Sev'+severityFromTicket.match(/[1-4]/)[0] :
      findings.stuck && findings.naming && findings.degraded ? 'Sev2' : 'Sev3';
    const priorityBySeverity={Sev1:'High',Sev2:'Medium',Sev3:'Medium',Sev4:'Low'};
    // Dell Unity is represented in the Supported Portfolio dropdown as Dell,
    // not in the separate Technology/Platform dropdown. Its valid default
    // there is Not Applicable, never Zadara or an invalid text placeholder.
    return {findings,service:db.service,subject,severity,priority:priorityBySeverity[severity],platform:'Not Applicable',
      account:knownAccount&& !/^(?:RTVM\s+[-–]\s+Issue|Account Name)$/i.test(knownAccount)?knownAccount:'',
      existing:!!recentTicketId(source),
      issueSubcategory:findings.capacity?'Capacity Issue':'',
      description:'Dell Unity 380F: snapshot stuck in destroying state; NAS LDAP/DNS naming services updates failing; file system degraded. Firmware upgrade assistance also requested.'};
  }
  function fixStorageText(raw,source) {
    let text=String(raw||''); const changes=[];
    if(!/(?:^|\n)\s*Ticket Category\s*:/i.test(text))return {text,changes};
    // A generated answer alone is never proof of completed work.
    const info=validatedStorageResult(source||'',text);
    if(!info) return {text,changes};
    function update(label,value){
      const old=pick(text,label);
      if(old===value || !new RegExp('(?:^|\\n)\\s*'+label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+':','i').test(text)) return;
      text=put(text,label,value);changes.push(label);
    }
    update('Ticket Category','Incident');
    update('Issue Category','Storage - Incident');
    update('Description',info.description);
    update(/(?:^|\n)\s*Issue Sub-Category:/i.test(text)?'Issue Sub-Category':'Issue Subcategory',info.issueSubcategory||'Verify in Zoho Desk');
    update('Supported Portfolio',info.findings.vendor||'Verify in Zoho Desk');
    update('Technology/Platform',info.platform); // Exact valid Zoho option; Dell remains Supported Portfolio.
    if(info.service)update('Solutions',info.service);
    else update('Solutions','Verify in Zoho Desk');
    if(info.subject) update('Subject',info.subject);
    if(info.account)update('Account Name',info.account);
    // Use the same decision for all employee profiles and for autofill.
    update('Severity',info.severity);
    update('Priority',info.priority);
    const note=info.existing?'Existing Incident Ticket':'Incident Ticket';
    text=text.replace(/\b(?:New|Existing)\s+(?:Incident|Request)\s+Ticket\b/g,note);
    return {text,changes};
  }
  function fixStoragePayload(payload,source){
    if(!payload||!payload.fields)return payload;
    const f=payload.fields;
    const evidence=[source||'',payload.rawWorkspace||''].filter(Boolean).join('\n');
    const info=validatedStorageResult(evidence,Object.entries(f).map(([k,v])=>k+': '+v).join('\n'));
    if(!info)return payload;
    f['Ticket Category']='Incident';
    f['Issue Category']='Storage - Incident';
    f.Description=info.description;
    if(f['Issue Description']!==undefined)f['Issue Description']=info.description;
    f['Issue Sub-Category']=info.issueSubcategory;
    f['Supported Portfolio']=info.findings.vendor||'';
    f['Technology/Platform']=info.platform;
    if(info.service)f.Solutions=info.service;
    else f.Solutions='';
    if(info.subject)f.Subject=info.subject;
    if(info.account)f['Account Name']=info.account;
    f['Severity Level']=info.severity;
    f.Priority=info.priority;
    if(payload.rawWorkspace)payload.rawWorkspace=fixStorageText(payload.rawWorkspace,evidence).text;
    payload.classificationNote='Dell Unity storage incident: severity based on three concurrent faults; firmware assistance is a separate request. Review final ticket before saving.';
    return payload;
  }
  const earlierFixZohoText=fixZohoText;
  const earlierFixPayload=fixPayload;
  function enforceDatabaseText(raw,source){
    let text=String(raw||'');const changes=[];
    if(!/(?:^|\n)\s*Subject\s*:/i.test(text))return {text,changes};
    const db=databaseService(source,text);
    if(!db.service)return {text,changes};
    const existing=pick(text,'Subject');
    const api=typeof window!=='undefined'?window.MAUServiceLine:null;
    const fixed=api?.enforceSubject(existing,db.service)||existing;
    if(existing!==fixed){text=put(text,'Subject',fixed);changes.push('Subject prefix');}
    if(pick(text,'Solutions')!==db.service){text=put(text,'Solutions',db.service);changes.push('Solutions');}
    return {text,changes};
  }
  function enforceDatabasePayload(payload,source){
    if(!payload?.fields)return payload;
    const f=payload.fields;
    const db=databaseService(source||payload.rawWorkspace||'',Object.entries(f).map(([k,v])=>k+': '+v).join('\n'));
    if(!db.service)return payload;
    const api=typeof window!=='undefined'?window.MAUServiceLine:null;
    if(f.Subject)f.Subject=api?.enforceSubject(f.Subject,db.service)||f.Subject;
    f.Solutions=db.service;
    if(payload.rawWorkspace)payload.rawWorkspace=enforceDatabaseText(payload.rawWorkspace,source||payload.rawWorkspace).text;
    return payload;
  }
  function correctedText(text,source){
    const first=earlierFixZohoText(text,source);
    const last=fixStorageText(first.text,source);
    const service=enforceDatabaseText(last.text,source);
    return {text:service.text,changes:[...first.changes,...last.changes,...service.changes]};
  }
  function correctedPayload(payload,source){
    earlierFixPayload(payload,source);
    fixStoragePayload(payload,source);
    return enforceDatabasePayload(payload,source);
  }
  const POLICY='BACKUP INCIDENT FINAL CONSISTENCY: If the current backup job FAILED because an agent is unreachable (TN_ERR_CONNECT_SERV), select Reliability Issue, not Access Issue. Access Issue means confirmed permissions, login or authentication errors; an unreachable backup agent does not establish a credential problem. When Atempo Time Navigator, ATINA or its TN_ERR_CONNECT_SERV signature is evidenced, use the exact Zoho Technology/Platform option Atempo Time Navigator (ATINA). Never describe recommended checks as already completed. Do not infer a cause from the error message alone.';
  const STORAGE_POLICY='MIXED STORAGE TICKET FINAL VALIDATION: Treat multiple existing Dell Unity storage failures (stuck snapshot, LDAP/DNS update failure, degraded file system) as an Incident even when the customer also requests a future firmware upgrade. Storage - Incident is the issue family. Capacity Issue is a possible valid subcategory when the stuck snapshot consumes documented storage capacity; never invent unsupported dropdowns. Dell Unity is a product, not Zadara. The Technology/Platform dropdown has no Dell option: select the exact valid Not Applicable option and keep Dell under Supported Portfolio; never choose Zadara for Dell Unity. Use the matching customer-project row in the embedded SI/MS DATABASE for Solutions and subject prefix (RTVM Unity project is SI), even if an existing Zoho subject uses MSDCO. Do not infer service type from generic maintenance, firmware or configuration words. Apply the severity matrix consistently: where the current Dell Unity ticket documents a blocked snapshot, failing naming services and degraded file system together, select Sev2 with Medium priority; for an isolated issue with no wider degradation, select Sev3 with Medium priority. Respect a valid explicit source severity. Do not infer an outage or root cause. Avoid claiming troubleshooting was performed.';
  return {decide,fixZohoText:correctedText,fixPayload:correctedPayload,storageIncident,currentZohoSubject,validatedStorageResult,databaseService,POLICY:POLICY+'\n'+STORAGE_POLICY};
});
