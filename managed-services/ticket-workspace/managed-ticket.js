/* Managed Shared Service ticket preparation. Source evidence outranks unrelated replies. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MAUManagedTicket = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const clean = v => String(v == null ? '' : v).replace(/\r/g, '').trim();
  const empty = v => !v || /^(?:-none-|none|n\/a|na|[-–—]|0|verify in zoho desk)$/i.test(clean(v));
  const squeeze = v => clean(v).replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, ' ');
  const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const unique = xs => [...new Set(xs.map(squeeze).filter(Boolean))];
  const FIELD_NAMES = [
    'Ticket Owner', 'Status', 'Due Date', 'Customer Company Name', 'Account Name', 'Customer Location Address',
    'Support Agent', 'Assigned Engineer', 'Issue Description', 'Issue Sub-Category', 'Issue Category',
    'Ticket Category', 'Serial Number', 'Severity Level', 'Support Level', 'Priority', 'Channel', 'Layout',
    'Contact Info', 'Mobile Number', 'Phone', 'Ticket Source', 'Solutions', 'Resolution', 'Ticket Closed By',
    'Technical Resolution', 'Supported Portfolio', 'Technology/Platform'
  ];
  function fromZohoField(raw, label) {
    const escaped=escapeRe(label);
    const re=new RegExp('(?:^|\\n)\\s*'+escaped+'\\s*\\*?\\s*(?:\\n|:\\s*)([^\\n]+)','i');
    const match=clean(raw).match(re);
    if(!match) return '';
    const value=squeeze(match[1]);
    if (empty(value) || FIELD_NAMES.some(x=>x.toLowerCase()===value.toLowerCase())) return '';
    return value;
  }
  function fromLabeledText(raw, labels) {
    for (const name of labels) {
      const re=new RegExp('(?:^|\\n)\\s*'+escapeRe(name)+'\\s*(?:[:：]|-\\s)([^\\n]+)','im');
      const m=String(raw).match(re);
      if(m && !empty(m[1])) return squeeze(m[1]).replace(/^\s*#\s*(?=[A-Za-z0-9])/,'');
    }
    return '';
  }
  function serialClean(v) {
    let s=squeeze(v).replace(/^(?:SN|Serial\s*(?:No\.?|Number|#))\s*[:#-]?\s*/i,'').replace(/^#\s*/, '');
    s=s.replace(/[),.;]+$/,'').replace(/\s.*$/,'');
    return /^[a-z0-9][a-z0-9-]{4,35}$/i.test(s) && /\d/.test(s) ? s.toUpperCase() : '';
  }
  function selectedSubject(raw) {
    const t=clean(raw);
    let m=t.match(/(?:Save\s*Cancel|SaveCancel)\s*\n\s*([^\n]{12,200})\s*\n\s*Reply All/i);
    if(m) return squeeze(m[1]);
    // A ticket dump often puts the selected subject directly above the Reply All action.
    const pos=t.search(/\n\s*Reply All\s*\n/i);
    if(pos>=0){
      const lines=t.slice(Math.max(0,pos-700),pos).split('\n').map(clean).filter(Boolean);
      const found=lines.reverse().find(line=>/\b(?:GABC|Hemmersbach|FMC|POS|Hardware|Request|Incident)\b/i.test(line) && line.length>14 && !/^(?:Status|Ticket|Issue Category|Hardware)$/i.test(line));
      if(found) return found;
    }
    const first=t.match(/^(?:Subject|Ticket Subject)\s*:\s*(.+)$/mi);
    return first?squeeze(first[1]):'';
  }
  function sourceRequest(raw) {
    const t=clean(raw);
    // Prefer the original customer's explicitly named site and serial; later engineer reports
    // may concern another device, customer or location and must never overwrite them.
    const chunks=[];
    const re=/(?:Please do the following for|Kindly perform the following(?: for)?|Scope of Work\s*:?|Work Required\s*:?)([^\n]*)(?:\n([\s\S]{0,3000}?))(?=\n(?:CURRENT STATE|On \d{4}-\d\d-\d\d|---- on|SS\s*\n|Thank you and|Ticket Properties|Ticket Information|CONFORME|$))/gi;
    for(const m of t.matchAll(re)) chunks.push((m[0]||'').trim());
    const originalIndex=t.lastIndexOf('Please do the following for');
    if(originalIndex>=0){
      const suffix=t.slice(originalIndex,originalIndex+3000);
      const stop=suffix.search(/\n(?:CURRENT STATE|On \d{4}-\d\d-\d\d|---- on|Thank you and|Ticket Properties|SS\s*\n)/i);
      return stop>=0?suffix.slice(0,stop):suffix;
    }
    // Otherwise use the first original request paragraph with a site/serial pair.
    const stores=[...t.matchAll(/(?:^|\n)\s*(?:Store Name|Branch Name|Site Name|Installation Site|Outlet)\s*:\s*[^\n]+/gim)];
    if(stores.length){
      const index=stores[stores.length-1].index;
      return t.slice(Math.max(0,index-900),Math.min(t.length,index+950));
    }
    return t.slice(0,7000);
  }
  function customerSite(original, raw) {
    return fromLabeledText(original,['Store Name','Branch Name','Outlet Name','Site Name','Store / Site','Installation Site','Site','Branch','Outlet']) ||
      fromLabeledText(raw,['Store Name','Branch Name','Outlet Name','Site Name','Store / Site','Installation Site']) ||
      squeeze(original.match(/Please do the following for\s+([^\n]+)/i)?.[1]||'') ||
      fromLabeledText(raw,['Store','Location']);
  }
  function extractActivities(original, raw) {
    const scope=original || raw;
    let start=scope.search(/(?:Please do the following for|Work Required|Scope of Work|Requested Activities|Action Required|Planned Activities|Activities to Perform|Please (?:perform|complete|carry out))/i);
    if(start<0) start=0;
    const selected=scope.slice(start);
    const lines=selected.split('\n').map(line=>clean(line).replace(/^\s*(?:\d+[.)]|[-•*])\s*/,''));
    let inTasks=false;
    let stopped=false;
    const result=[];
    const stopAt=/^(?:Store Name|Branch Name|Outlet Name|Site Name|Address|Serial(?: Number| No\.?| #)?|Ticket\s*:|Please contact|Contact|CURRENT STATE|Best Regards|Regards|Thank you|Kindly provide the list|Please inform the assigned|Tools for|Tools to bring|Action Taken|Status\s*:|FE\s*:|OIC\s*:|From\s*:|On \d{4}-|\s*----\s*on)/i;
    const taskRe=/^(?:set\s*up|install|stage|provision|upgrade|replace|repair|fix|check|inspect|clean|wipe|perform|preventive|troubleshoot|reformat|configure|transfer|migrate|test|validate|investigate|restore|retrigger|setup|cable management|ssd|ram|cpu|hdd|pos\s+(?:setup|installation))/i;
    const nonTasks=/^(?:screwdriver|screw for|empty external|hdd\/ssd enclosure|sata cable|usb flash drive|crimper|rj45|twist tie|thermal paste|cable tie|\d{1,2}\/\d{1,2}\/\d{4}|ref\. number|client\s*:|travel time|time onsite|time start|time stop)/i;
    for(let i=0;i<lines.length;i++) {
      const line=lines[i];
      if(!line) continue;
      if(stopAt.test(line) && (inTasks||result.length)) {stopped=true;break;}
      if(/^(?:Please do the following for|Work Required|Scope of Work|Requested Activities|Action Required|Planned Activities|Activities to Perform)/i.test(line)) {inTasks=true;continue;}
      if(nonTasks.test(line)||/^(?:[A-Z ]{2,} :|Ticket Properties|Customer Information|Ticket Information)$/i.test(line)) continue;
      if(line.length>220) continue;
      if(taskRe.test(line)) {result.push(line);inTasks=true;}
      else if(inTasks && result.length && /^\(?\d\)?\.?\s+/.test(line)) result.push(line);
      if(result.length>=18) break;
    }
    return unique(result).slice(0,14);
  }
  function detectIntent(text, issue, existing) {
    const direct=clean(existing);
    if(/^(?:Request|Incident)$/i.test(direct)) return direct[0].toUpperCase()+direct.slice(1).toLowerCase();
    // The selected ticket's title states the service type. A tool list or an old
    // conversation must not change a provisioning REQUEST into an INCIDENT just
    // because it mentions replacement of a damaged cable or an old mail failure.
    const title=clean(text).split('\n')[0];
    if(/^(?:request\s+for\b|service\s+request\b|\w[^\n]{0,90}\s*\|\s*request\s+for\b)/i.test(title)) return 'Request';
    if(/^(?:incident\b|\w[^\n]{0,90}\s*\|\s*incident\b)/i.test(title)) return 'Incident';
    if(/^hardware provisioning$/i.test(issue)) return 'Request';
    const s=(issue+' '+text).toLowerCase();
    // Classify a service failure from the actual incident, not from ordinary
    // planned repair tasks such as 'replace damaged cables'.
    if(/(?:failed|failure|bugdown|black\s*screen|unresponsive|not\s+(?:booting|working|powering)|unable to|slow\s+pos|lagg(?:y|ing)|broken|crashed|error|outage|down\b)/i.test(s)) return 'Incident';
    return 'Request';
  }
  function detectCategory(issue, text, explicit) {
    if(explicit) return explicit;
    const lower=(issue+' '+text).toLowerCase();
    if(/(?:lan|switch|cable|network|internet|connectivity)/.test(lower) && !/(?:ram|ssd|hdd|desktop|pos|cpu)/.test(lower)) return 'Network';
    if(/(?:application|octopos|software|app support|login)/.test(lower) && !/(?:ram|ssd|hdd|desktop|pos|cpu|hardware|physical)/.test(lower)) return 'Software';
    return 'Hardware';
  }
  function makeSubject(draft, originalSubject) {
    const serial=serialClean(draft.serialNumber);
    let subject=squeeze(originalSubject);
    // The selected ticket subject can use an outlet code (R-BTQ) instead of the
    // full store name (Regatta). A matching SERIAL is stronger evidence than a
    // missing textual customer-name match; do not throw that subject away.
    const matchesSerial=!!(serial && subject && new RegExp('(?:^|[^A-Za-z0-9])'+escapeRe(serial)+'(?:$|[^A-Za-z0-9])','i').test(subject));
    const companyToken=(draft.company||'').toLowerCase().replace(/_+/g,' ').split(' ')[0];
    if(subject && draft.company && !matchesSerial && companyToken && !subject.toLowerCase().includes(companyToken)) subject='';
    if(!subject){
      const head=draft.company||draft.accountName||'Customer';
      const loc=draft.storeName||'';
      const detail=draft.issueDescription||'Support';
      const requestPrefix=draft.ticketCategory==='Request' && !/request|hardware provisioning|upgrade|installation/i.test(detail)?'Request for ':'';
      const separateSite=loc && squeeze(loc).toLowerCase()!==squeeze(head).toLowerCase();
      subject=`${head} | ${requestPrefix}${separateSite?loc+' : ':''}${detail}`;
    }
    if(serial){
      // Add the exact device serial once and remove an unrelated trailing serial if present.
      if(!new RegExp('(?:^|[^A-Za-z0-9])'+escapeRe(serial)+'(?:$|[^A-Za-z0-9])','i').test(subject)) {
        subject=subject.replace(/\s*\([A-Z0-9-]{7,}\)\s*$/i,'');
        subject+=` (${serial})`;
      }
    }
    return subject.slice(0,230);
  }
  function extract(source, profile={}) {
    const raw=clean(source);
    const original=sourceRequest(raw);
    const formalCompany=fromZohoField(raw,'Customer Company Name');
    const site=customerSite(original,raw);
    const serial=serialClean(fromZohoField(raw,'Serial Number')) ||
       serialClean(fromLabeledText(original,['Serial #','Serial Number','Serial No.','Serial No','SN','S/N','Service Tag'])) ||
       serialClean(fromLabeledText(raw,['Serial #','Serial Number','Serial No.','SN','S/N'])) ||
       serialClean(selectedSubject(raw).match(/\(([A-Za-z0-9-]{6,35})\)\s*$/)?.[1]);
    const subject=selectedSubject(raw);
    const issue=fromZohoField(raw,'Issue Description') || fromLabeledText(original,['Issue Description','Concern','Problem','Issue','Activity']) ||
       (/(?:hardware provisioning|set up (?:one|1) set of pos|ssd upgrade|ram upgrade)/i.test(original)?'Hardware Provisioning':'') ||
       (/(?:pos.*(?:lag|slow|bugdown))/i.test(subject)?'POS Performance Issue':'');
    const ticketCategory=detectIntent((subject||'')+'\n'+original,issue,fromZohoField(raw,'Ticket Category'));
    const category=detectCategory(issue,subject+' '+original,fromZohoField(raw,'Issue Category'));
    const subcat=fromZohoField(raw,'Issue Sub-Category') ||
       (category==='Hardware' && ticketCategory==='Request' && /(pos|desktop|hardware provision)/i.test(issue+' '+original)?'Desktop':'') ||
       (category==='Hardware' && ticketCategory==='Incident' && /(pos|desktop|hardware)/i.test(issue+' '+original)?'Computer':'');
    const assigned=fromZohoField(raw,'Assigned Engineer');
    const inputAgent=fromZohoField(raw,'Support Agent');
    const name=profile.name||'';
    const agent=name || inputAgent;
    const address=fromLabeledText(original,['Address','Site Address','Store Address','Installation Address','Work Location','Service Address']) ||
        fromZohoField(raw,'Customer Location Address') || fromLabeledText(raw,['Address','Site Address','Store Address']);
    const account=fromZohoField(raw,'Account Name') || (/(?:gabc|penshoppe|oxygen|regatta|memo)/i.test((formalCompany||'')+' '+site)?'Golden ABC, Incorporated':'');
    // In Managed Shared Service the CSA/customer-company field should identify
    // the LOCATION ACTUALLY RECEIVING SERVICE. 'Store Name', 'Branch', or the
    // 'Please do the following for ...' phrase is authoritative for that field.
    // Keep the corporate Zoho account separately. This also works for Regatta,
    // Hemmersbach, FMC and future stores, not just Oxygen/Penshoppe.
    const company=site || formalCompany || (account && !/Golden ABC/i.test(account)?account:'') || '';
    const titleCaseHint=issue||(/^\s*Request/i.test(subject)?'Hardware Provisioning':'');
    const out={
      ticketNumber:(raw.match(/\bReply All\s*\n\s*#\s*(\d{4,})/i)?.[1]||''),
      company, accountName:account,storeName:site,customerLocationAddress:address,
      contactName:fromLabeledText(original,['Primary Contact Person','Contact Person','Contact Name']) ||
        (raw.match(/Contact Info\s*\n\s*([^\n]+)/i)?.[1]||''),
      phoneNumber:fromZohoField(raw,'Phone') || fromLabeledText(original,['Phone Number','Telephone Number','Primary Contact Number','Contact Number']) || '0',
      mobileNumber:fromZohoField(raw,'Mobile Number')||fromLabeledText(original,['Mobile Number','Cellphone Number','Secondary Contact Number'])||'0',
      subject:'',issueDescription:titleCaseHint,description:'',ticketCategory,issueCategory:category,issueSubCategory:subcat,
      severityLevel:fromZohoField(raw,'Severity Level') || (ticketCategory==='Incident'?'Sev3':'Sev4'),
      priority:fromZohoField(raw,'Priority') || 'Medium',
      supportLevel:fromZohoField(raw,'Support Level') || (assigned?'Level 2':''),
      supportAgent:agent,assignedEngineer:assigned,serialNumber:serial,
      channel:fromZohoField(raw,'Channel') || 'Email',layout:'Managed Shared Service',
      engineerTasks:extractActivities(original,raw),
      notes:'',
      originalText:original.slice(0,5000),
      evidence: { company:!!formalCompany, serial:!!serial, category:!!fromZohoField(raw,'Ticket Category'),
        assignment:!!assigned, tasks:!!extractActivities(original,raw).length }
    };
    out.subject=makeSubject(out,subject);
    const activity=out.engineerTasks.length ? `\nRequested activities:\n${out.engineerTasks.map((x,i)=>`${i+1}. ${x}`).join('\n')}` : '';
    out.description=''; // The Managed Services Description starts blank by request.
    return out;
  }
  function sanitize(draft) {
    const r={...draft};
    r.serialNumber=serialClean(r.serialNumber);
    for(const key of ['company','accountName','storeName','customerLocationAddress','contactName','phoneNumber','mobileNumber','issueDescription','description','ticketCategory','issueCategory','issueSubCategory','severityLevel','priority','supportLevel','supportAgent','assignedEngineer','channel','layout','subject']){
      r[key]=clean(r[key]);
    }
    r.phoneNumber=r.phoneNumber||'0';r.mobileNumber=r.mobileNumber||'0';
    r.engineerTasks=Array.isArray(r.engineerTasks)?unique(r.engineerTasks).slice(0,20):[];
    if(r.serialNumber&&!r.subject.toUpperCase().includes(r.serialNumber))r.subject=(r.subject?r.subject.replace(/\s*\([A-Z0-9-]{6,}\)\s*$/i,'').trim()+' ('+r.serialNumber+')':makeSubject(r,''));
    return r;
  }
  function payload(draft, profile={}) {
    const d=sanitize(draft);
    if(profile.supportAgent)d.supportAgent=clean(profile.supportAgent);
    const fields={
      'Customer Company Name':d.company,'Account Name':d.accountName,'Contact Name':d.contactName,
      'Phone':d.phoneNumber,'Mobile Number':d.mobileNumber,'Customer Location Address':d.customerLocationAddress,
      'Subject':d.subject,'Description':d.description,'Ticket Category':d.ticketCategory,
      'Issue Category':d.issueCategory,'Issue Sub-Category':d.issueSubCategory,
      'Issue Description':d.issueDescription,'Serial Number':d.serialNumber,
      'Severity Level':d.severityLevel,'Support Level':d.supportLevel,
      'Support Agent':d.supportAgent,'Assigned Engineer':d.assignedEngineer,
      'Priority':d.priority,'Channel':d.channel,'Layout':'Managed Shared Service'
    };
    Object.keys(fields).forEach(key=>{
      // Zero is the required default for missing Managed Services phone numbers.
      if((key==='Phone'||key==='Mobile Number') && String(fields[key])==='0')return;
      if(empty(fields[key]))delete fields[key];
    });
    return {version:1,source:'Managed Services Ticket Workspace',createdAt:new Date().toISOString(),ticketNumber:clean(d.ticketNumber),fields};
  }
  function email(d){
    const name=d.accountName&&/Golden ABC/i.test(d.accountName)?'GABC Service Desk':'Team';
    const number=d.ticketNumber?`Please be informed that we have created Ticket #${d.ticketNumber} for your reference.`:
      'We will provide the ticket number once it has been created in Zoho Desk.';
    return `Hi ${name},\n\nGood day!\n\nThank you for reaching out regarding ${d.issueDescription||'your service request'}${d.storeName?' at '+d.storeName:''}${d.serialNumber?' (Serial Number: '+d.serialNumber+')':''}.\n\n${number}\n\nWe will coordinate with the assigned service engineer for the next steps.\n\nFor any further questions or concerns, please reply to this email.\n\nThank you.\n\nAMTI Support Team`;
  }
  function notes(d){
    return [`${d.ticketNumber?'Existing':'New'} ${d.ticketCategory} Ticket`,
      `Customer: ${d.company||'To confirm'}${d.storeName?' | Store: '+d.storeName:''}`,
      `Issue/Request: ${d.issueDescription||'Review requested'}${d.serialNumber?' (Serial: '+d.serialNumber+')':''}`,
      `Next Action: ${d.assignedEngineer?'Coordinate with '+d.assignedEngineer+' for onsite service.':'Confirm the assigned engineer and coordinate the service schedule.'}`,
      d.engineerTasks.length?`Engineer Task / Activity:\n${d.engineerTasks.map(x=>'• '+x).join('\n')}`:'Engineer Task / Activity: Confirm the work scope from the original customer request.',
      'Status: Await engineer assessment and completion report. Do not claim work is completed without evidence.'
    ].join('\n\n');
  }
  return {extract,sanitize,payload,email,notes,serialClean,extractActivities,sourceRequest,makeSubject};
});
