/* MAU authoritative Zoho Desk dropdown mapping, transcribed from user-provided October 20, 2026 lists.
 * Selection is verified by ticket category AND issue category; never submit guessed dropdown choices.
 * Kept identical in MAU and the Chrome extension. "Search" / "-None-" are UI controls, not stored values.
 */
(function (root, factory) {
  'use strict';
  const api=factory();
  if (typeof module!=='undefined' && module.exports) module.exports=api;
  if (root) root.MAUZohoMap=api;
})(typeof window!=='undefined' ? window : (typeof globalThis!=='undefined' ? globalThis : null),function(){
  'use strict';
  const CATEGORIES=Object.freeze({"Incident":{"Archive - Incident":["Access Issue","Additional Compute","Capacity Issue","Configuration Issue","Device Issue","Firmware Upgrade","Migration","Reliability Issue"],"Backup - Incident":["Access Issue","Additional Compute (Expansion)","Capacity Issue","Check Backup Policy","Check Backup Retention and Performance","Configuration Issue","Device Issue","Hardisk Change","Migration","Reliability Issue","Restart backup policy","Restart Backup Server","Restart Catalog","Restoration","Retrigger failed backup","Run Guide","Tape Request"],"Cloud - Incident":["Access Issue","Capacity Issue","Configuration","Device Issue","Hardisk Change"],"Disaster Recovery - Incident":["Device Issue","FailOver Issue","Network Issue","Performance Issue"],"DR - Incident":["Check data replication volume health","Check Replication Retention and Recovery","Check Replication status","Reboot DR application"],"Hardware - Incident":["CPU Change","Hardisk Change","Over-utilized","Restart Device"],"Network - Incident":["Network Bandwidth Change","Network Connection","Network Device Change","Network Device Configuration","Network Logical Address Change","Network Telco Self Recovery","Restart Device"],"Server - Incident":["Access Issue","Application Issue","Compatibility Issue","Computer Resource","Device Issue","License Issue/Renewal","Network Issue","OS Compatibility Issue","OS Configuration Issue","Performance Issue","Restart Services","Settings Change"],"Server Operation Alerts":["Network Unstable"],"Software - Incident":["Vulnerability issue","Compatibility Issue","Computer Resource Change","Configuration Change","License Issue","Restart Services","Settings Change"],"Storage - Incident":["Access Issue","Capacity Issue","Device Issue","Performance Issue"],"VM - Incident":["Access Issue","Application Issue","Database Issue","Network Issue","Performance Issue"]},"Request":{"Archive - Request":["Additional Compute","Archiving Report","Firmware Upgrade","Logs","Migration","Monitoring","Status / Health Report","Utilization Report"],"Backup - Request":["Additional Compute","Check backup policies and status","Check Backup Retention and Performance","Config Settings","Extract Job Manager Report","Extract Logs","File Level/DB Level/BareMetal Level","Full Backup","Logs","Migration","Monitoring","Restart backup policy","Restart Backup Server","Restart Catalog","Restoration","Retrigger failed backup","Run Guide","Status / Health Report","Tape Request","Utilization Report"],"Backup Monitoring Request":["Backup Monitoring for Non-Active Session","Backup Monitoring for Stop on Error","Monitoring"],"Cloud - Request":["Additional Compute","Logs","Migration","Monitoring","Status / Health Report","Utilization Report"],"Disaster Recovery - Request":["Additional DR","Logs","Migration","Monitoring","Outage/FailOver Test","Status / Health Report"],"DR - Request":["Power Failure","Access Issue","Network Unstable","Vulnerability issue","Agent Installer / Installation","Additional Compute","Additional Compute (Expansion)","Additional DR","Allocate disk drives to storage pool","Application Issue","Archiving Report","Backup Monitoring for Non-Active Session","Backup Monitoring for Stop on Error","Capacity Issue","Change Compute","Check VM operability","Check available disk drives","Check backup policies and status","Check Backup Policy","Check Backup Retention and Performance","Check data replication volume health","Check Disk Pool","Check drive partitions","Check File System size","Check IAAS Health and Metrics","Check ILOM","Check IOPS","Check performance metrics","Check Replication Retention and Recovery","Check Replication status","Check storage connectivity","Check VM Health and Metrics","Check VM Pool / Disk Pools","Check VPSA Pools","Compatibility Issue","Computer Resource","Computer Resource Change","Config Settings","Configuration","Configuration Change","Configuration Issue","CPU Change","Database Issue","Device Issue","Extract Job Manager Report","Extract Logs","Extract utilization Report","Extract zsnaps","FailOver Issue","File Level/DB Level/BareMetal Level","Firmware Upgrade","Full Backup","Hardisk Change","License Issue","License Issue/Renewal","Logs","Migration","Monitoring","Mount / unmount file system","Network Bandwidth Change","Network bandwidth report","Network Connection","Network Connection Change","Network Device Change","Network Device Configuration","Network Device inventory report","Network Issue","Network Logical Address Change","Network settings report","Network Telco Self Recovery","OS Compatibility Issue","OS Configuration Issue","Outage/FailOver Test","Over-utilized","Performance Issue","Reboot DR application","Reliability Issue","Restart backup policy","Restart Backup Server","Restart Catalog","Restart Device","Restart Instance","Restart Services","Restoration","Restore Issue","Retrigger failed backup","Retriggered Failed Backup","Run Guide","Settings Change","Snapshot","Status / Health Report","Submit status Reports","Submit utilization report","Tape Request","Update License","Utilization Report","Provisioning","Cloning"],"DRaaS Monitoring Request":["Monitoring"],"EWB MK2 and TIM Daily Report":["Monitoring"],"Hardware - Request":["Submit status Reports","Submit utilization report"],"IaaS Monitoring Request":["Monitoring"],"Infrastructure ( Zadara Storage / Zadara Infrastructure / OS / Dell Server and Storage":["Allocate disk drives to storage pool","Check VM operability","Check available disk drives","Check backup policies and status","Check Disk Pool","Check drive partitions","Check File System size","Check IAAS Health and Metrics","Check ILOM","Check IOPS","Check performance metrics","Check storage connectivity","Check VM Health and Metrics","Check VM Pool / Disk Pools","Check VPSA Pools","Extract Logs","Extract utilization Report","Extract zsnaps","Mount / unmount file system"],"Network - Request":["Network bandwidth report","Network Device inventory report","Network settings report","Submit status Reports"],"Server - Request":["Additional Compute","Firmware Upgrade","Logs","Migration","Monitoring","Status / Health Report","Utilization Report"],"Software - Request":["Agent Installer / Installation","Submit status Reports","Update License"],"Storage - Request":["Agent Installer / Installation","Additional Compute","Firmware Upgrade","Logs","Migration","Monitoring","Status / Health Report","Provisioning","Cloning"],"VM - Request":["Additional Compute","Change Compute","Firmware Upgrade","Logs","Migration","Monitoring","Snapshot","Status / Health Report","Utilization Report"]}});
  const SOLUTIONS=Object.freeze(["SI", "MS"]);
  const PORTFOLIOS=Object.freeze(["(IaaS) Infrastructure as a Service", "(BaaS) Backup as a Service", "(ESTaaS) Enterprise Storage as a Service", "(CaaS) Compute as a Service", "(DRaaS) Disaster Recovery as a Service", "(AraaS) Archive as a Service", "(OPaaS) On Prem as a Service", "(SI) System Integration", "POC (Proof of Concept)", "HPE", "Dell", "VMware"]);
  const PLATFORMS=Object.freeze(["Acronis", "Asigra", "Atempo", "Atempo Time Navigator (ATINA)", "BaaS", "BaaS Plus", "CloudAny", "DRaaS", "DRaaS Plus", "EStaaS", "Full", "IaaS", "Lina Atempo", "Not Applicable", "OVC", "Rackware", "SI", "vCenter", "Veeam", "VMWare", "Zadara", "Zerto"]);
  const PLATFORM_ALIASES=Object.freeze({
    'rackware':'Rackware','rack ware':'Rackware',
    'atempo tina':'Atempo Time Navigator (ATINA)',
    'atempo time navigator':'Atempo Time Navigator (ATINA)',
    'atempo time navigator (tina)':'Atempo Time Navigator (ATINA)',
    'veeam backup & replication':'Veeam','veeam backup and replication':'Veeam',
    'vmware':'VMWare'
  });
  const compact=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
  const isEmpty=s=>!String(s||'').trim() || /^(-None-|none|verify in zoho desk|n\/a|not specified|unselected)$/i.test(String(s).trim());
  const match=(choice,opts)=> isEmpty(choice) ? '' : (opts.find(o=>compact(o)===compact(choice)) || '');
  const mode=value=>match(value,Object.keys(CATEGORIES));
  function issueCategory(ticketCategory,issue){
    const type=mode(ticketCategory);
    if (!type) return '';
    // Special-case spelling with a trailing ')' exported by legacy MAU versions.
    const old=String(issue||'').replace(/^Infrastructure \( Zadara Storage \/ Zadara Infrastructure \/ OS \/ Dell Server and Storage \)\s*$/i,
      'Infrastructure ( Zadara Storage / Zadara Infrastructure / OS / Dell Server and Storage');
    return match(old,Object.keys(CATEGORIES[type]));
  }
  function subcategory(ticketCategory,issue,sub){
    const cat=issueCategory(ticketCategory,issue);
    return cat ? match(sub,CATEGORIES[mode(ticketCategory)][cat]) : '';
  }
  function platform(value){
    if(isEmpty(value))return '';
    const original=String(value||'').trim();
    return PLATFORMS.find(p=>p===original) || PLATFORM_ALIASES[compact(original)] || match(original,PLATFORMS);
  }
  const portfolio=value=>match(value,PORTFOLIOS);
  const solution=value=>match(value,SOLUTIONS);
  function pickFromEvidence(type,issue,sub,source){
    // Only well-evidenced fixes; otherwise force user verification instead of choosing first dropdown item.
    if (sub) return sub;
    const text=String(source||'');
    if(type==='Incident' && issue==='Backup - Incident') {
      const slow=/\b(?:slowness|slow|sluggish|latency|performance degradation|unresponsive)\b/i.test(text);
      const auth=/\b(?:access denied|permission denied|authentication failed|login failed|invalid password|invalid credentials)\b/i.test(text);
      if(slow && !auth)return 'Check Backup Retention and Performance';
    }
    return '';
  }
  function validateFields(fields,evidence=''){
    const issues=[]; const f={...fields};
    const type=mode(f['Ticket Category']);
    if(!type)issues.push('Ticket Category needs verification');
    f['Ticket Category']=type;
    const cat=issueCategory(type,f['Issue Category']);
    if(!cat)issues.push('Issue Category needs verification for '+(type||'this ticket'));
    f['Issue Category']=cat;
    const originalSub=f['Issue Sub-Category']||f['Issue Subcategory']||'';
    let sub=subcategory(type,cat,originalSub);
    sub=pickFromEvidence(type,cat,sub,evidence);
    if(!sub && cat) issues.push('Issue Sub-Category needs verification for '+cat);
    f['Issue Sub-Category']=sub;
    delete f['Issue Subcategory'];
    const rawSolutions=f.Solutions||'';
    f.Solutions=solution(rawSolutions);
    if(!f.Solutions) issues.push('Solutions needs verification (MS or SI)');
    const rawPortfolio=f['Supported Portfolio']||'';
    f['Supported Portfolio']=portfolio(rawPortfolio);
    if(!f['Supported Portfolio'])issues.push('Supported Portfolio needs verification');
    const rawPlatform=f['Technology/Platform']||'';
    f['Technology/Platform']=platform(rawPlatform);
    if(!f['Technology/Platform'])issues.push('Technology/Platform needs verification');
    // Never force (SI) System Integration for an MS service or vice-versa. The project context determines Solutions.
    if(f.Solutions==='SI' && f['Supported Portfolio'] && f['Supported Portfolio']!=='(SI) System Integration'){
      // SI service may have a different supported portfolio (HPE, Dell, VMware); do not overwrite.
    }
    return {fields:f,issues};
  }
  function getField(text,label){
    const pat=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const m=String(text||'').match(new RegExp('(?:^|\\n)\\s*'+pat+'\\s*:\\s*([^\\r\\n]*)','i'));
    return m ? m[1].trim() : '';
  }
  function setField(text,label,value){
    const pat=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const rx=new RegExp('(^[ \\t]*'+pat+':[ \\t]*)([^\\r\\n]*)','im');
    return rx.test(text) ? String(text).replace(rx,(_,pre)=>pre+value) : String(text);
  }
  function focusedEvidence(text,source){
    const values=[getField(text,'Subject'),getField(text,'Description'),getField(text,'Issue Description'),
      getField(source,'Subject'),getField(source,'Description'),getField(source,'Issue Description')].filter(Boolean);
    return values.join(' ') || String(source||text||'').slice(0,800);
  }
  function correctTicketText(text,source){
    let updated=String(text||'');
    if (!/(?:^|\n)\s*Ticket Category\s*:/i.test(updated))return {text:updated,changed:false,issues:[]};
    const sourceLabel=/(?:^|\n)\s*Issue Sub-Category\s*:/i.test(updated)?'Issue Sub-Category':'Issue Subcategory';
    const names=['Ticket Category','Issue Category',sourceLabel,'Solutions','Supported Portfolio','Technology/Platform'];
    const raw={
      'Ticket Category':getField(updated,'Ticket Category'),
      'Issue Category':getField(updated,'Issue Category'),
      'Issue Sub-Category':getField(updated,sourceLabel),
      'Solutions':getField(updated,'Solutions'),
      'Supported Portfolio':getField(updated,'Supported Portfolio'),
      'Technology/Platform':getField(updated,'Technology/Platform')
    };
    const outcome=validateFields(raw,focusedEvidence(updated,source));
    for(const name of names){
      const key=name===sourceLabel?'Issue Sub-Category':name;
      const old=getField(updated,name);
      if (!old && !(new RegExp('(?:^|\\n)\\s*'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*:','i')).test(updated))continue;
      const next=outcome.fields[key] || 'Verify in Zoho Desk';
      if(old!==next)updated=setField(updated,name,next);
    }
    return {text:updated,changed:updated!==String(text||''),issues:outcome.issues};
  }
  function correctPayload(payload,source){
    if(!payload || !payload.fields)return payload;
    const check=validateFields(payload.fields,focusedEvidence(payload.rawWorkspace||'',source));
    // Retain ticket identifiers and descriptions, but remove invalid dropdown choices.
    Object.assign(payload.fields,check.fields);
    payload.zohoDropdownWarnings=check.issues;
    return payload;
  }
  const POLICY='AUTHORITATIVE ZOHO DESK DROPDOWN RULES (OCT 20, 2026):\n'+
    Object.entries(CATEGORIES).map(([kind,cats])=>kind+':\\n'+Object.entries(cats).map(([c,subs])=>
      '- '+c+': '+subs.join(' | ')).join('\n')).join('\n')+
    '\nSolutions (EXACT): '+SOLUTIONS.join(' | ')+
    '\nSupported Portfolio (EXACT): '+PORTFOLIOS.join(' | ')+
    '\nTechnology/Platform (EXACT): '+PLATFORMS.join(' | ')+
    '\nNever invent dropdown values, never borrow a subcategory from a different Issue Category, and never convert an allowed option merely because of generic wording. "Monitoring" and "Retrigger failed backup" ARE valid for particular families.\\nIf uncertain, write Verify in Zoho Desk and leave the actual dropdown blank. A valid Request is never turned into Incident based only on being escalated.';
  return {CATEGORIES,SOLUTIONS,PORTFOLIOS,PLATFORMS,mode,issueCategory,subcategory,portfolio,platform,solution,validateFields,correctTicketText,correctPayload,POLICY};
});
