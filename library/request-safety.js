/* MAU final classification guard: incident versus administrative request.
 * Source-of-truth is the CURRENT subject/issue, never unrelated forwarded threads.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.MAURequestSafety = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const ATEMPO = /\batempo(?:\s+tina)?\b/i;
  const RACKWARE = /\brackware\b|\brmm\s+wave\b/i;
  const ZERTO = /\bzerto\b|\bVPGs?\b/i;
  const VEEAM = /\bveeam\b/i;
  const ADMIN_REQUEST = /\b(?:request\s+(?:for|to)|(?:please|kindly)\s+(?:assist|provide|grant|enable)|access\s+request|login\s+request|service\s+request|requesting)\b/i;
  const ADMIN_ACTION = /\b(?:login|log[ -]?in|sign[ -]?in|service account|access|permission|credentials?|approval|provision|account creation|grant|enable|reset password|password reset|account unlock|authorization)\b/i;
  const FAILURE = /\b(?:cannot|unable\s+to|could\s+not|failed|failure|denied|locked\s*out|expired|outage|error|not\s+working|unavailable|timeout|timed out|sync_error|job\s+failed)\b/i;
  function field(text, label) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = String(text || '').match(new RegExp('(?:^|\\n)\\s*'+escaped+'\\s*:\\s*([^\\r\\n]*)','i'));
    return m ? m[1].trim() : '';
  }
  function focus(text) {
    const s = String(text || '');
    const subject = field(s,'Subject');
    const description = field(s,'Description') || field(s,'Issue Description');
    if (subject || description) return [subject,description].filter(Boolean).join('\n');
    // For copied Zoho pages, prefer first explicit ticket-title or request lines.
    const lines = s.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    const requestLine = lines.find(l => /^(?:request for |activity:\s*request for |\w.*\brequest for (?:login|access))\b/i.test(l));
    return requestLine || lines.slice(0, 18).join('\n').slice(0,1300);
  }
  function determine(source) {
    const relevant = focus(source);
    if (!ADMIN_REQUEST.test(relevant) || !ADMIN_ACTION.test(relevant) || FAILURE.test(relevant)) return null;
    const isAtempo = ATEMPO.test(relevant);
    const isDr = ZERTO.test(relevant) || RACKWARE.test(relevant);
    const isBackup = isAtempo || VEEAM.test(relevant);
    return {
      type:'request',category:'Request',
      issueCategory:isBackup?'Backup - Request':isDr?'Disaster Recovery - Request':'',
      subcategory:'',
      portfolio:isBackup?'(BaaS) Backup as a Service':isDr?'(DRaaS) Disaster Recovery as a Service':'',
      platform:isAtempo?'Atempo TINA':ZERTO.test(relevant)?'Zerto':RACKWARE.test(relevant)?'RackWare':VEEAM.test(relevant)?'Veeam Backup & Replication':'',
      solutions:'MS',reason:isAtempo?'atempo-service-account-login':'administrative-access-request'
    };
  }
  function replaceField(text,label,value) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx=new RegExp('(^[ \\t]*'+escaped+':[ \\t]*)([^\\r\\n]*)','im');
    return rx.test(text) ? text.replace(rx,(_,pre)=>pre+value) : text;
  }
  function setCategory(text,label,value) {
    if (!value) return text;
    return replaceField(text,label,value);
  }
  function fixNotes(text,source) {
    const existing = /#111852\b|(?:Ticket\s*(?:No\.?|Number)?\s*#?\s*111852\b)/i.test(source) || /\bExisting\s+(?:Incident|Request)\s+Ticket\b/i.test(text);
    const newLabel = existing ? 'Existing Request Ticket':'Request Ticket';
    return text.replace(/\b(?:New|Existing)\s+Incident\s+Ticket\b|\bNew\s+Request\s+Ticket\b/ig,newLabel);
  }
  function fixTicketText(raw,source) {
    const d=determine(source) || determine(raw);let text=String(raw||'');const changes=[];
    if(!d || !/(?:^|\n)\s*Ticket Category\s*:/i.test(text))return {text,changes,decision:d};
    const desired={'Ticket Category':d.category, 'Issue Category':d.issueCategory,
      'Issue Subcategory':'Verify in Zoho Desk','Issue Sub-Category':'Verify in Zoho Desk',
      'Supported Portfolio':d.portfolio,'Technology/Platform':d.platform,'Solutions':d.solutions};
    for(const [label,value] of Object.entries(desired)) {
      if(!value)continue;
      const old=field(text,label);
      if(old&&old!==value){text=replaceField(text,label,value);changes.push(label);}
    }
    const newText=fixNotes(text,source);
    if(newText!==text)changes.push('Ticket note type');
    return {text:newText,changes,decision:d};
  }
  function fixPayload(payload,source) {
    if(!payload || !payload.fields)return payload;
    const f=payload.fields;
    const d=determine(source)||determine([`Subject: ${f.Subject||''}`,`Description: ${f.Description||''}`].join('\n'));
    if(!d)return payload;
    f['Ticket Category']='Request';
    if(d.issueCategory)f['Issue Category']=d.issueCategory;
    else if(/\bIncident\b/i.test(String(f['Issue Category']||'')))f['Issue Category']='';
    f['Issue Sub-Category']=''; // no verified access-request subcategory
    if(d.portfolio)f['Supported Portfolio']=d.portfolio;
    else f['Supported Portfolio']=''; // don't leak a previous customer's family
    if(d.platform)f['Technology/Platform']=d.platform;
    else f['Technology/Platform']='';
    f['Solutions']='MS';
    payload.rawWorkspace=fixNotes(String(payload.rawWorkspace||''),source||'');
    payload.classificationNote='Administrative access request; verify the valid Zoho request subcategory.';
    return payload;
  }
  const POLICY=`MANDATORY SANDZ ticket type validation:
- Determine Request versus Incident from the CURRENT request, not an older incident or an engineer's escalation. A service desk ticket being opened or escalated to L2 does not mean an incident occurred.
- Administrative account login, service-account access, permission or approval coordination without a verified failure = Ticket Category: Request.
- For EWB "Request for login using Atempo Service Account" (#111852), use Ticket Category: Request, Issue Category: Backup - Request, Supported Portfolio: (BaaS) Backup as a Service, Technology/Platform: Atempo TINA, Solutions: MS. Exact request subcategory must be verified. Never label it RackWare or DRaaS.
- Atempo access request is different from a failed Atempo backup job. Reserve Incident for the reported actual failure/outage.
- Existing ticket #111852 is an Existing Request Ticket. External service reference SR-26-061313 is not a new incident ID.
- When a request's service family is not clearly established, leave it for verification rather than reusing RackWare, Zerto, DRaaS or BaaS from previous work.
- Never fabricate completed troubleshooting or treat a request as a failure based on generic words from an unrelated forwarded thread.`;
  return {determine,focus,fixTicketText,fixPayload,POLICY};
});
