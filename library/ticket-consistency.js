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
  const POLICY='BACKUP INCIDENT FINAL CONSISTENCY: If the current backup job FAILED because an agent is unreachable (TN_ERR_CONNECT_SERV), select Reliability Issue, not Access Issue. Access Issue means confirmed permissions, login or authentication errors; an unreachable backup agent does not establish a credential problem. When Atempo Time Navigator, ATINA or its TN_ERR_CONNECT_SERV signature is evidenced, use the exact Zoho Technology/Platform option Atempo Time Navigator (ATINA). Never describe recommended checks as already completed. Do not infer a cause from the error message alone.';
  return {decide,fixZohoText,fixPayload,POLICY};
});
