/* Client email and troubleshooting are derived from the same validated Zoho draft.
 * No extra API request, no extra assumptions, no cross-customer chat memory.
 */
(function(root, factory){
  'use strict';
  const api=factory();
  if(typeof module!=='undefined' && module.exports)module.exports=api;
  if(root)root.MAUTicketCompanions=api;
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:null),function(){
  'use strict';
  function plain(text){return String(text||'').replace(/```(?:text)?\s*|```/gi,'').trim();}
  function field(text,label){
    const escaped=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const m=plain(text).match(new RegExp('(?:^|\\n)\\s*'+escaped+':\\s*([^\\r\\n]*)','i'));
    return m?m[1].trim():'';
  }
  function clean(t){return String(t||'').replace(/\s+/g,' ').replace(/^[\s.;:]+|[\s.;:]+$/g,'').trim();}
  function notes(zoho){
    const t=plain(zoho);const m=t.match(/(?:^|\n)\s*Viber Details\/Zoho Comment on Ticket for initial troubleshooting\s*:\s*\n([\s\S]*)/i);
    let body=m?m[1].trim():'';
    // Strip any accidental footer from the model; never claim work performed.
    body=body.replace(/^(\s*)(?:Reviewed|Confirmed|Checked) (ticket-visible|the agent|the logs|the backup job)([^\n]*)/gim,(_,sp,a,b)=>sp+'Review '+a+b);
    return body || 'Review the incident details and coordinate with the assigned engineer for the next safe checks.';
  }
  function email(zoho){
    const kind=field(zoho,'Ticket Category');
    const desc=clean(field(zoho,'Description')||field(zoho,'Issue Description'));
    const issue=clean(field(zoho,'Issue/Request'));
    const subject=clean(field(zoho,'Subject'));
    let summary=issue||desc||subject||'the reported concern';
    summary=summary.replace(/\b(?:confirmed|verified)\s+(?:the\s+)?(?:root cause|agent is)\b/gi,'reported');
    if(summary.length>420)summary=summary.slice(0,417).replace(/\s+\S*$/,'')+'...';
    const request=/\bRequest\b/i.test(kind);
    if(request)summary=summary.replace(/^Request\s+for\s+/i,'');
    const prefix=request ? 'We received your request regarding ' :
      /\b(?:failed|stopped|was unreachable|is unreachable)\b/i.test(summary)
        ? 'We received a report that the ' : 'We received a report regarding ';
    if(!request && prefix.endsWith('the ') && /^(?:the|an?)\s+/i.test(summary))summary=summary.replace(/^(?:the|an?)\s+/i,'');
    const action=request
      ? 'We will coordinate with the appropriate team regarding this request.'
      : 'We will coordinate with the appropriate service engineer to review the issue.';
    return ['Hi Team,','', 'Good day!','',prefix+summary.replace(/[.!?]+$/,'')+'.','',action,'','For any further questions or concerns, please reply to this email.','','Thank you.'].join('\n');
  }
  function create(zoho){return {email:email(zoho),qa:notes(zoho)};}
  return {create,email,notes,field};
});
