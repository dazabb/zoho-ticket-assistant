/* Customer-facing acknowledgements and private troubleshooting derived from
 * the SAME validated Zoho ticket. No additional Gemini request is made.
 * An acknowledgement must reflect the actual source: a received alert is not
 * the same thing as an incident discovered by the SANDZ monitoring team.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module!=='undefined' && module.exports)module.exports=api;
  if(root)root.MAUTicketCompanions=api;
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:null),function(){
  'use strict';
  const PLACEHOLDER='[enter ticket number]';
  const text=x=>String(x||'').replace(/\r\n/g,'\n');
  const plain=x=>text(x).replace(/```(?:text)?\s*|```/gi,'').trim();
  const clean=x=>text(x).replace(/\s+/g,' ').replace(/^[\s.;:]+|[\s.;:]+$/g,'').trim();
  function field(raw,label){
    const escaped=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const match=text(raw).match(new RegExp('(?:^|\\n)\\s*'+escaped+':\\s*([^\\r\\n]*)','i'));
    return match?match[1].trim():'';
  }
  function notes(zoho){
    const t=plain(zoho), m=t.match(/(?:^|\n)\s*Viber Details\/Zoho Comment on Ticket for initial troubleshooting\s*:\s*\n([\s\S]*)/i);
    let body=m?m[1].trim():'';
    body=body.replace(/^(\s*)(?:Reviewed|Confirmed|Checked) (ticket-visible|the agent|the logs|the backup job)([^\n]*)/gim,(_,sp,a,b)=>sp+'Review '+a+b);
    return body||'Review the ticket details and coordinate with the assigned engineer for appropriate next steps.';
  }
  function sourceType(raw){
    const s=text(raw);
    // Directly pasted vendor notifications prove an alert was RECEIVED;
    // their diagnostics are not independently verified SANDZ findings.
    if(/(?:noreply@sync\.alerts\.rackwareinc\.com|Rwsyncalerts|RackWare\s+(?:monitoring\s+)?alert)/i.test(s)
       && /(?:Wave Sync item Failed|RMM Wave item sync alert|SYNC_ERROR|failed to (?:stage|sync))/i.test(s)) return 'vendor-alert';
    if(/\b(?:received (?:a|an|the) (?:monitoring\s+)?alert|forwarded (?:monitoring\s+)?alert|alert notification received)\b/i.test(s)) return 'vendor-alert';
    if(/\b(?:we observed|our monitoring|L1\.?5 findings|L1\.?5 monitoring|as part of our monitoring|we detected)\b/i.test(s)) return 'observed';
    if(/(?:^|\n)\s*Backup Job\s*:[^\n]+[\s\S]{0,800}(?:^|\n)\s*(?:Status|Processed Volume|Findings)\s*:/im.test(s)) return 'observed';
    if(/\b(?:customer reported|client reported|customer raised a concern|the client reported|received (?:your|a customer) (?:report|request|concern))\b/i.test(s)) return 'customer-report';
    return 'unspecified';
  }
  function ticketNumber(zoho,raw){
    const s=text(raw);
    // Do NOT take any #number from a ticket-search list, alert Job ID,
    // forwarded email, client IN/SR reference, or unrelated quoted message.
    const explicit=s.match(/(?:^|\n)\s*(?:Zoho\s+)?(?:Ticket\s+(?:No\.?|Number|ID)|CSA\/Ticket ID)\s*:\s*#?\s*(\d{4,9})\b/im);
    if(explicit)return explicit[1];
    // In the Zoho copied ticket pane, Reply All immediately precedes the
    // selected record's #number even when the ticket list contains many IDs.
    const replyIds=[...s.matchAll(/(?:^|\n)\s*Reply All\s*\n\s*#\s*(\d{4,9})\b/gi)].map(m=>m[1]);
    if(replyIds.length===1)return replyIds[0];
    if(replyIds.length>1)return '';
    // A single explicit ticket number in a short, focused input is safe;
    // don't interpret multiple search results as the current ticket.
    if(s.length<2400){
      const matches=[...s.matchAll(/(?:^|\n)\s*(?:Ticket\s*#|#)\s*(\d{4,9})\b/gi)].map(m=>m[1]);
      if(new Set(matches).size===1)return matches[0]||'';
    }
    return '';
  }
  function info(zoho,raw){
    const z=plain(zoho),s=text(raw);
    const subject=clean(field(z,'Subject'));
    const desc=clean(field(z,'Description')||field(z,'Issue Description'));
    const issue=(z.match(/(?:^|\n)\s*Issue\/Request:\s*([^\r\n]*)/i)||[])[1]||'';
    const tNum=ticketNumber(z,s);
    const src=sourceType(s);
    const host=clean(field(s,'Hostname')||(s.match(/\bHost\s*-\s*([A-Za-z0-9_.-]+)\b/i)||[])[1]||'');
    const job=clean(field(s,'Backup Job'));
    const status=clean(field(s,'Status'));
    const volume=clean(field(s,'Processed Volume'));
    const isBackup=/\b(?:Backup\s*-\s*Incident|Backup\s+Job|Atempo|ATINA|TINA)\b/i.test([field(z,'Issue Category'),s.slice(0,3000),desc].join(' '));
    const failed=/\b(?:failed|failure|stopped|unreachable)\b/i.test([status,issue,desc,s.slice(0,2500)].join(' '));
    const syncFail=/\b(?:Wave Sync item Failed|SYNC_ERROR|sync alert - Failed|Failed to Stage 1 Sync)\b/i.test(s);
    return {subject,desc,issue:clean(issue),kind:field(z,'Ticket Category'),account:field(z,'Customer Company Name'),src,tNum,host,job,status,volume,isBackup,failed,syncFail,source:s};
  }
  function incidentSummary(i){
    if(i.src==='vendor-alert' && i.syncFail){
      const host=i.host?` for host ${i.host}`:'';
      let first=`We received a RackWare monitoring alert indicating a failed synchronization${host}.`;
      const fromTo=i.source.match(/Failed to Stage 1 Sync from\s*:\s*([^\r\n]+)/i);
      if(fromTo)first=`We received a RackWare monitoring alert indicating a failed Stage 1 synchronization from ${clean(fromTo[1])}.`;
      const unsynced=i.source.match(/The following file systems were not synced:\s*\n([^\r\n]+)/i);
      const ssh=i.source.match(/Details:\s*(SSH connection[^\r\n]+)/i);
      const details=[];
      if(unsynced)details.push(`The ${String(unsynced[1]).trim()} volume was not synchronized`);
      if(ssh)details.push(`${clean(ssh[1]).replace(/[.]+$/,'')}`);
      return first+(details.length?'\n'+details.join('. ')+'.':'');
    }
    if(i.isBackup && i.failed && i.job){
      let line=i.src==='vendor-alert' ? 'We received a monitoring alert indicating that ' :
        i.src==='observed' ? 'We observed that ' :
        i.src==='customer-report' ? 'Thank you for reporting that ' : 'The available ticket details indicate that ';
      line+=`the backup job ${i.job}${i.host?' for host '+i.host:''} failed`;
      if(/unreachable/i.test(i.status+' '+i.issue+' '+i.source.slice(0,1200)))line+=' because the backup agent was unreachable';
      line+='.';
      const bits=[];
      if(i.volume)bits.push('Processed Volume: '+i.volume);
      const code=i.source.match(/\b(TN_ERR_[A-Z0-9_]+)\b/);
      if(code)bits.push('Error: '+code[1]);
      return line+(bits.length?'\n'+bits.join(' | '):'');
    }
    let summary=i.issue||i.desc||i.subject.replace(/^SANDZ-(?:MSDCO|SI)-[^-]+-/i,'')||'the reported concern';
    if(summary.length>320)summary=summary.slice(0,317).replace(/\s+\S*$/,'')+'...';
    summary=summary.replace(/[.!?]+$/,'');
    if(/\bRequest\b/i.test(i.kind)){
      if(i.src==='customer-report')return 'We received your request regarding '+summary.replace(/^Request\s+for\s+/i,'')+'.';
      return 'This email concerns the request regarding '+summary.replace(/^Request\s+for\s+/i,'')+'.';
    }
    if(i.src==='vendor-alert')return 'We received a monitoring alert indicating '+summary+'.';
    if(i.src==='observed')return 'We observed '+summary.replace(/^(?:the|an?)\s+/i,'')+'.';
    if(i.src==='customer-report')return 'Thank you for reporting '+summary.replace(/^(?:the|an?)\s+/i,'')+'.';
    return 'This email concerns '+summary.replace(/^(?:the|an?)\s+/i,'')+'.';
  }
  function email(zoho,raw){
    const i=info(zoho,raw);
    const request=/\bRequest\b/i.test(i.kind);
    const addressee=/^(?:East West Bank|EWB)$/i.test(i.account)?'Hi EWB Team,':'Hi Team,';
    const numberLine=`Please be informed that we have already created Ticket #${i.tNum||PLACEHOLDER} for your reference.`;
    let action='We will immediately arrange a Service Engineer to assist you.';
    if(request)action='We will coordinate with the appropriate team to assist with your request.';
    else if(/\b(?:assigned (?:service )?engineer|engineer assigned|currently being handled by|coordinating with (?:the )?assigned (?:service )?engineer)\b/i.test(i.source.slice(0,2200)))
      action='We will coordinate with the assigned Service Engineer to assist you.';
    else if(/\b(?:sev\s*1|severity\s*1|critical|urgent)\b/i.test(i.source.slice(0,1500)))
      action='We will promptly arrange for a Service Engineer to assist you.';
    if(/(?:^|\n)\s*CURRENT STATE\s*\n\s*Closed\b/i.test(i.source)||/(?:^|\n)\s*Status\s*\n\s*Closed\b/i.test(i.source))
      action='Our team remains available should you need any further assistance.';
    return [addressee,'','Good day!','',incidentSummary(i),'',numberLine,'',action,'',
      'For any further questions or concerns, please reply to this email.','','Thank you.'].join('\n');
  }
  function withTicketNumber(draft,number){
    const n=String(number||'').trim().replace(/^#/,'');
    if(!/^\d{4,9}$/.test(n))return '';
    return plain(draft).replace(/Ticket\s*#\[enter ticket number\]/g,'Ticket #'+n);
  }
  function finishEmail(draft,source,previous){
    let body=plain(draft);
    if(!body)return body;
    const last=plain(previous);
    const seen=last.match(/\bTicket\s*#(\d{4,9})\b/i);
    const verified=ticketNumber('',source)||(seen?seen[1]:'');
    const reference='Please be informed that we have already created Ticket #'+(verified||PLACEHOLDER)+' for your reference.';
    // A Gemini follow-up must never swap in an invented ticket number.
    body=body.replace(/\bTicket\s*#(\d{4,9})\b/gi,(_,n)=>'Ticket #'+(verified||PLACEHOLDER));
    if(!/Ticket\s*#(?:\d{4,9}|\[enter ticket number\])/i.test(body)){
      const anchor=body.match(/(?:^|\n)(?:We will |For any further questions|Thank you\.?)/i);
      if(anchor){body=body.slice(0,anchor.index)+'\n'+reference+'\n'+body.slice(anchor.index);}
      else body+='\n\n'+reference;
    }
    const origin=sourceType(source);
    const priorObserved=/\bWe observed\b/i.test(last);
    if(origin==='observed'||(origin==='unspecified'&&priorObserved)){
      body=body.replace(/We received (?:a report|an alert|a monitoring alert) that /gi,'We observed that ')
        .replace(/We received a report regarding /gi,'We observed ');
    }else if(origin==='vendor-alert'){
      body=body.replace(/We received a report that /gi,'We received a monitoring alert indicating that ')
        .replace(/We observed that /gi,'The monitoring alert indicates that ');
    }else if(origin==='unspecified'&&!priorObserved){
      body=body.replace(/We received a report that /gi,'The ticket details indicate that ')
        .replace(/We received a report regarding /gi,'This email concerns ');
    }
    return body.replace(/\n{3,}/g,'\n\n');
  }
  function create(zoho,raw){return {email:email(zoho,raw),qa:notes(zoho)};}
  return {create,email,notes,field,sourceType,ticketNumber,withTicketNumber,finishEmail,PLACEHOLDER};
});
