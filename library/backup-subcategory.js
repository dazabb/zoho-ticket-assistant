/* Exact Zoho Backup - Incident Issue Sub-Category options confirmed by MAU users.
 * Do not confuse this option set with Disaster Recovery, Storage or Server issues.
 * A text response and the Create Ticket payload are checked independently.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.MAUBackupSubcategories = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null), function () {
  'use strict';
  const ALLOWED = Object.freeze([
    '-None-',
    'Access Issue',
    'Additional Compute (Expansion)',
    'Capacity Issue',
    'Check Backup Policy',
    'Check Backup Retention and Performance',
    'Configuration Issue',
    'Device Issue',
    'Hardisk Change',
    'Migration',
    'Reliability Issue',
    'Restart backup policy',
    'Restart Backup Server',
    'Restart Catalog',
    'Restoration',
    'Retrigger failed backup',
    'Run Guide',
    'Tape Request'
  ]);
  const ALLOWED_REAL = ALLOWED.slice(1);
  function getField(text, name) {
    const label = name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const match = String(text || '').match(new RegExp('(?:^|\\n)\\s*' + label + '\\s*:\\s*([^\\r\\n]*)','i'));
    return match ? match[1].trim() : '';
  }
  function getSub(text) { return getField(text, 'Issue Subcategory') || getField(text, 'Issue Sub-Category'); }
  function isBackupIncident(category, ticketCategory) {
    return String(category || '').trim().toLowerCase() === 'backup - incident'
      && (!ticketCategory || String(ticketCategory).trim().toLowerCase() === 'incident');
  }
  function sameAllowed(raw) {
    const text = String(raw || '').trim();
    return ALLOWED_REAL.find(x => x.toLowerCase() === text.toLowerCase()) || '';
  }
  function getIncidentEvidence(proposed, source) {
    // The present ticket's fields take precedence over incidental terms from the
    // other tickets visible in a copied Zoho sidebar.
    const focused = [
      getField(proposed, 'Subject'),
      getField(proposed, 'Description'),
      getField(proposed, 'Issue Description'),
      getField(proposed, 'Issue/Request'),
      getField(source, 'Issue/Request'),
      getField(source, 'Subject'),
      getField(source, 'Description'),
      getField(source, 'Issue Description')
    ].filter(Boolean).join(' ');
    if (focused) return focused + ' ' + String(source||'').slice(0,1400);
    // Fresh prompts sometimes have no labels; use only the opening text.
    return String(source || proposed || '').slice(0, 1200);
  }
  function choose({value = '', issueCategory = '', ticketCategory = '', evidence = ''} = {}) {
    if (!isBackupIncident(issueCategory,ticketCategory)) {
      return {applies:false, value:String(value || '').trim(), reason:'not-backup-incident'};
    }
    const raw = String(value || '').trim();
    const caseText = String(evidence || '');
    const hasSlowness = /\b(?:slowness|slow(?:er|ly)?|sluggish|latency|performance|degradation|lag|unresponsive|resource\s+bottleneck)\b/i.test(caseText);
    const hasActualAuthProblem = /\b(?:access\s+denied|permission\s+denied|authentication\s+failed|invalid\s+(?:credentials|password)|login\s+failed|unauthori[sz]ed|forbidden|\b403\b|\b401\b)\b/i.test(caseText);
    const hasCapacity = /\b(?:no\s+space\s+left|out\s+of\s+space|low\s+disk\s+space|repository\s+full|capacity\s+(?:limit|exhausted)|storage\s+(?:full|nearly\s+full))\b/i.test(caseText);
    const hasJobFailure = /\b(?:failed|failure|job\s+stopped|backup\s+job\s+(?:was\s+)?stopped|job\s+error|backup\s+error|corrupt|incomplete\s+backup|job\s+timed\s+out|backup\s+job\s+timeout)\b/i.test(caseText);
    const existing = sameAllowed(raw);
    if (hasSlowness && !hasActualAuthProblem && (raw.toLowerCase() === 'performance issue' || raw === 'Access Issue' || !existing)) {
      return {applies:true,value:'Check Backup Retention and Performance',reason:'observed-slowdown'};
    }
    // A failed backup job with an unreachable agent is an operational job failure,
    // NOT a Zoho permission or credential problem. Previously Access Issue won
    // just because it was a valid dropdown option, producing profile-dependent results.
    const agentUnreachable = /\b(?:unreachable\s+agent|agent\s+unreachable|TN_ERR_CONNECT_SERV|server\s+does\s+not\s+accept\s+the\s+connection)\b/i.test(caseText);
    if(hasJobFailure && agentUnreachable && !hasActualAuthProblem && (!existing || existing === 'Access Issue')) {
      return {applies:true,value:'Reliability Issue',reason:'failed-backup-job-unreachable-agent'};
    }
    if (existing) return {applies:true,value:existing,reason:'valid-exact-choice'};
    if (hasActualAuthProblem) return {applies:true,value:'Access Issue',reason:'verified-access-or-authentication-error'};
    if (hasCapacity) return {applies:true,value:'Capacity Issue',reason:'observed-capacity-error'};
    if (hasJobFailure) return {applies:true,value:'Reliability Issue',reason:'observed-job-failure'};
    if (hasSlowness) return {applies:true,value:'Check Backup Retention and Performance',reason:'observed-slowdown'};
    return {applies:true,value:'',reason:'manual-verification-needed'};
  }
  function setField(text,label,value) {
    const escaped=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re=new RegExp('(^[ \\t]*'+escaped+':[ \\t]*)([^\\r\\n]*)','im');
    return re.test(text) ? text.replace(re,(_,pre)=>pre+value) : text;
  }
  function correctTicketText(raw,source) {
    let text=String(raw || '');
    const cat=getField(text,'Issue Category');
    const ticketCat=getField(text,'Ticket Category');
    const label=/(?:^|\n)\s*Issue Sub-Category\s*:/i.test(text) ? 'Issue Sub-Category' : 'Issue Subcategory';
    const current=getSub(text);
    const d=choose({value:current,issueCategory:cat,ticketCategory:ticketCat,evidence:getIncidentEvidence(text,source)});
    if (!d.applies) return {text,changed:false,decision:d};
    const displayed=d.value || 'Verify in Zoho Desk';
    const updated=setField(text,label,displayed);
    return {text:updated,changed:updated!==text,decision:d};
  }
  function correctPayload(payload,source) {
    if (!payload || !payload.fields) return payload;
    const fields=payload.fields;
    const d=choose({
      value:fields['Issue Sub-Category'] || '',
      issueCategory:fields['Issue Category'],
      ticketCategory:fields['Ticket Category'],
      evidence:getIncidentEvidence(payload.rawWorkspace || '',source)
    });
    if (!d.applies) return payload;
    fields['Issue Sub-Category']=d.value; // Blank rather than sending unsupported Zoho dropdown text.
    payload.subcategoryValidation=d.reason;
    return payload;
  }
  const POLICY = `CONFIRMED ZOHO BACKUP - INCIDENT SUBCATEGORY DROPDOWN (EXACT VALUES):\n${ALLOWED.map(x=>'- '+x).join('\n')}\n- Never write Performance Issue for Backup - Incident: it is not an option.\n- If the observed issue is slow backup server processing, Restore and Archive slowness, or a performance degradation without authentication failure, use Check Backup Retention and Performance.\n- If an actual backup job failed unexpectedly, prefer Reliability Issue. For TN_ERR_CONNECT_SERV or unreachable backup agent, an AI guess of Access Issue must be corrected to Reliability Issue unless the source explicitly documents authentication/permission failure.\n- Choose Access Issue only with authentication, credentials, or permissions evidence; "cannot access Restore and Archive" accompanied by slowness is not automatically an access permission issue.\n- If uncertain, write Issue Subcategory: Verify in Zoho Desk and leave the actual Zoho dropdown unselected.\n- Never apply this list to Disaster Recovery - Incident or other Issue Categories.\n- Ticket #112374 EWB, Atempo Time Navigator 4.9.3, severe Linux backup-server slowness impacting Restore and Archive: Backup - Incident -> Check Backup Retention and Performance (recommended).`;
  return {ALLOWED,isBackupIncident,choose,correctTicketText,correctPayload,POLICY};
});
