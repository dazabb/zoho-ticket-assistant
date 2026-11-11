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
  // A Zerto Virtual Manager license update belongs to the user's exact
  // DR - Request / Update License dropdown pair, not Disaster Recovery - Request.
  // Require a Request, a license-update action, and Zerto/ZVM evidence.
  function isZvmLicenseUpdate(type,fields,evidence){
    if(type!=='Request')return false;
    const context=[String(evidence||''),fields.Subject||'',fields.Description||'',
      fields['Issue Description']||'',fields['Technology/Platform']||'',
      fields['Supported Portfolio']||''].join(' ');
    const action=/(?:\b(?:update|updating|renew|renewal|apply|install|replace|activate)\b[\s\S]{0,50}\blicen[cs]e\b|\blicen[cs]e\b[\s\S]{0,50}\b(?:update|updating|renew|renewal|apply|install|replace|activate)\b)/i.test(context);
    const zerto=/\b(?:Zerto|ZVM|Zerto Virtual Manager)\b/i.test(context);
    return action && zerto;
  }
  // Account-independent handling: any enrolled customer may send a periodic
  // report involving failed/disabled rows; that does not turn the REPORT itself
  // into an Incident. An actual failure alert remains an Incident.
  function reportingClassification(fields,evidence){
    const f=fields||{};
    const subject=String(f.Subject||'');
    const description=String(f.Description||f['Issue Description']||'');
    const headline=(subject+' '+description).trim();
    // Prefer the generated/current subject and description over the many other
    // ticket titles typically pasted from the Zoho sidebar.
    const source=String(evidence||'');
    const scoped=headline || source.slice(0,900);
    const statusReport=/\b(?:server\s+)?replication\s+(?:status|health)\s+report\b|\b(?:daily|weekly|monthly|periodic)\s+(?:server\s+)?replication\s+report\b|\bserver\s+replication\s*-\s*(?:cloudany|rackware)[^\r\n]*\b(?:am|pm)\b/i.test(scoped);
    const drStatus=/\b(?:vpg|vm)\s+(?:status|health)\s+(?:report|monitoring)\b|\bzerto\s+(?:daily|weekly|monthly|status)\s+report\b|\b(?:VM|VPG)\s+Status\s*\d{1,2}\/\d{1,2}\/\d{4}\b/i.test(scoped);
    const backupStatus=/\bbackup\s+(?:status|health|daily|weekly|monthly)\s+report\b/i.test(scoped);
    const storageStatus=/\bstorage\s+(?:status|health)\s+report\b/i.test(scoped);
    const infrastructureStatus=/\b(?:iaas|infrastructure)\s+(?:status|health)\s+report\b/i.test(scoped);
    const hasFailureTicketTitle=/\b(?:sync alert|failed\s+sync\s+job|failed\s+backup\s+job|replication\s+failure|replication\s+failed|incident)\b/i.test(subject);
    if(hasFailureTicketTitle)return null;
    if(statusReport)return {type:'Request',category:'Disaster Recovery - Request',subcategory:'Status / Health Report',reason:'periodic-replication-status-report'};
    if(drStatus)return {type:'Request',category:'DRaaS Monitoring Request',subcategory:'Monitoring',reason:'dr-protection-monitoring-report'};
    if(backupStatus)return {type:'Request',category:'Backup - Request',subcategory:'Status / Health Report',reason:'backup-status-report'};
    if(storageStatus)return {type:'Request',category:'Storage - Request',subcategory:'Status / Health Report',reason:'storage-status-report'};
    if(infrastructureStatus)return {type:'Request',category:'IaaS Monitoring Request',subcategory:'Monitoring',reason:'infrastructure-status-report'};
    return null;
  }
  function inferCategory(type,fields,evidence){
    const context=[fields.Subject,fields.Description,fields['Issue Description'],evidence].filter(Boolean).join(' ');
    // Do not use a guess from a different customer or an unrelated ticket-list row.
    const title=[fields.Subject,fields.Description].filter(Boolean).join(' ') || String(evidence||'').slice(0,450);
    if(type==='Request'){
      if(/\b(?:zerto|zvm)\b/i.test(context) && /\b(?:update|renew|apply|install|activate)\b[^\r\n]{0,55}\blicen[cs]e\b|\blicen[cs]e\b[^\r\n]{0,55}\b(?:update|renew|apply|install|activate)\b/i.test(title))return 'DR - Request';
      if(/\b(?:backup|veeam|atempo|tina)\b/i.test(title) && /\b(?:restore|restoration|backup\s+policy|report|monitor|health)\b/i.test(title))return 'Backup - Request';
      if(/\b(?:disaster recovery|replication|rackware|zerto|vpg)\b/i.test(title) && /\b(?:check|status|health|report|monitor|test|request)\b/i.test(title))return 'Disaster Recovery - Request';
      if(/\bstorage\b/i.test(title) && /\b(?:report|monitor|health|firmware|provision|clon)\b/i.test(title))return 'Storage - Request';
      if(/\bserver\b/i.test(title) && /\b(?:report|monitor|health|firmware)\b/i.test(title))return 'Server - Request';
    }
    if(type==='Incident'){
      if(/\b(?:RMM Wave item sync alert|rackware[^\r\n]{0,80}\b(?:failed|failure)|zerto[^\r\n]{0,80}\b(?:failed|error))\b/i.test(title))return 'Disaster Recovery - Incident';
      if(/\b(?:backup\s+job|veeam\s+job|atempo\s+job)\b[^\r\n]{0,80}\b(?:fail|error)/i.test(title))return 'Backup - Incident';
    }
    return '';
  }
  function inferSubcategory(type,issue,evidence){
    const text=String(evidence||'');
    if(type==='Request'){
      const opts=CATEGORIES.Request[issue]||[];
      const choose=v=>opts.includes(v)?v:'';
      if(/\b(?:update|renew|apply|activate)\b[^\r\n]{0,55}\blicen[cs]e\b|\blicen[cs]e\b[^\r\n]{0,55}\b(?:update|renew|apply|activate)\b/i.test(text))return choose('Update License')||choose('License Issue/Renewal');
      if(/\b(?:restore|restoration|file.level restore)\b/i.test(text))return choose('Restoration');
      if(/\b(?:health|status|daily|weekly|monthly)\s+(?:check|report)|\b(?:health|status)\s+report|\bstatus\s+as\s+of/i.test(text))return choose('Status / Health Report')||choose('Monitoring')||choose('Check Replication status');
      if(/\b(?:replication|sync)\s+(?:status|check)|\bcheck\s+replication\s+status/i.test(text))return choose('Check Replication status')||choose('Monitoring');
      if(/\b(?:monitor|monitoring|surveillance)\b/i.test(text))return choose('Monitoring');
      if(/\bfirmware\s+(?:upgrade|update)/i.test(text))return choose('Firmware Upgrade');
      if(/\b(?:extract|request|collect)\s+logs?\b/i.test(text))return choose('Logs')||choose('Extract Logs');
      if(/\b(?:migration|migrate|relocation|cutover)\b/i.test(text))return choose('Migration');
      if(/\bprovision(?:ing)?\b/i.test(text))return choose('Provisioning');
      if(/\bclone|cloning\b/i.test(text))return choose('Cloning');
      if(/\b(?:dr\s+test|test\s+failover|failover\s+test)\b/i.test(text))return choose('Outage/FailOver Test');
    }
    if(type==='Incident'){
      const opts=CATEGORIES.Incident[issue]||[];
      const choose=v=>opts.includes(v)?v:'';
      if(/\b(?:permission denied|access denied|authentication failed|login failed|invalid credentials)\b/i.test(text))return choose('Access Issue');
      if(/\b(?:connection refused|network unreachable|connection closed|ssh (?:failed|error)|network connection failed)\b/i.test(text))return choose('Network Issue')||choose('Network Connection');
      if(/\b(?:timeout|timed out|slow replication|high latency|replication lag)\b/i.test(text))return choose('Performance Issue')||choose('Check Backup Retention and Performance');
      if(/\b(?:failover failed|failed failover)\b/i.test(text))return choose('FailOver Issue');
      if(/\b(?:snapshot stuck|invalid host state|host rediscover|device fault|storage pool full|no space left)\b/i.test(text))return choose('Device Issue')||choose('Capacity Issue');
      if(/\b(?:backup job failed|backup job failure|veeam job failed)\b/i.test(text))return choose('Reliability Issue');
    }
    return '';
  }
  function pickFromEvidence(type,issue,sub,source){
    // Only well-evidenced fixes; otherwise force user verification instead of choosing first dropdown item.
    if (sub) return sub;
    const text=String(source||'');
    if(type==='Incident' && issue==='Backup - Incident') {
      const slow=/\b(?:slowness|slow|sluggish|latency|performance degradation|unresponsive)\b/i.test(text);
      const auth=/\b(?:access denied|permission denied|authentication failed|login failed|invalid password|invalid credentials)\b/i.test(text);
      if(slow && !auth)return 'Check Backup Retention and Performance';
      if(auth)return 'Access Issue';
      if(/\b(?:failed|failure|error)\b/i.test(text) && /\b(?:backup|veeam|atempo|tina|vbm)\b/i.test(text))return 'Reliability Issue';
    }
    if(type==='Incident' && issue==='Storage - Incident') {
      if(/(?:\bsnapshot\b.{0,120}\b(?:destroying|hung|frozen|stuck)\b|\b(?:LDAP|NIS|DNS)\b.{0,130}\b(?:failed|fails|error|not updating)\b|\bfile system\b.{0,45}\bdegraded\b)/i.test(text))return 'Device Issue';
      if(/\b(?:capacity above 9[05]\s*%|storage pool full|no space left)\b/i.test(text))return 'Capacity Issue';
      if(/\b(?:severe latency|poor performance|high IOPS)\b/i.test(text))return 'Performance Issue';
    }
    if(type==='Incident' && issue==='Disaster Recovery - Incident') {
      if(/\b(?:SSH failed|connection closed|connection refused|network unreachable|connection timeout|socket error)\b/i.test(text))return 'Network Issue';
      if(/\b(?:slow replication|lag|degradation|sync timeout)\b/i.test(text))return 'Performance Issue';
      if(/\b(?:failover failed|failover issue)\b/i.test(text))return 'FailOver Issue';
    }
    if(type==='Request' && /^(?:Backup Monitoring Request|DRaaS Monitoring Request|IaaS Monitoring Request|EWB MK2 and TIM Daily Report)$/.test(issue))return 'Monitoring';
    if(type==='Request' && issue==='DR - Request' &&
        isZvmLicenseUpdate(type,{'Technology/Platform':'Zerto'},text)) return 'Update License';
    if(type==='Request' && issue==='Backup - Request') {
      if(/\b(?:restore|restoration)\b/i.test(text))return 'Restoration';
      if(/\b(?:status report|daily report|health report)\b/i.test(text))return 'Status / Health Report';
    }
    if(type==='Request' && issue==='Disaster Recovery - Request') {
      if(/\b(?:health report|status report|daily report)\b/i.test(text))return 'Status / Health Report';
      if(/\b(?:test failover|dr test)\b/i.test(text))return 'Outage/FailOver Test';
    }
    return inferSubcategory(type,issue,text);
  }
  function validateFields(fields,evidence=''){
    const issues=[]; const f={...fields};
    const report=reportingClassification(f,evidence);
    const type=report?.type || mode(f['Ticket Category']);
    if(!type)issues.push('Ticket Category needs verification');
    f['Ticket Category']=type;
    let cat=report?.category || issueCategory(type,f['Issue Category']);
    if(!cat)cat=inferCategory(type,f,evidence);
    // An AI can omit the category or pick Disaster Recovery - Request,
    // which does NOT contain Update License. Correct only this proven scenario.
    if(isZvmLicenseUpdate(type,f,evidence) &&
       (!cat || cat==='Disaster Recovery - Request')) cat='DR - Request';
    if(!cat)issues.push('Issue Category needs verification for '+(type||'this ticket'));
    f['Issue Category']=cat;
    const originalSub=report?.subcategory || f['Issue Sub-Category']||f['Issue Subcategory']||'';
    let sub=subcategory(type,cat,originalSub);
    const selectionEvidence=[evidence,f.Subject,f.Description,f['Issue Description'],
      f['Technology/Platform'],f['Supported Portfolio']].filter(Boolean).join(' ');
    if(!sub && cat==='DR - Request' && isZvmLicenseUpdate(type,f,evidence)) sub='Update License';
    else sub=pickFromEvidence(type,cat,sub,selectionEvidence);
    sub=subcategory(type,cat,sub); // Never emit an option absent from this exact category.
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
    if(!f['Technology/Platform']) {
      // Only choose a known platform if it is explicit in the actual issue.
      if(/\bDell\s*(?:EMC\s*)?Unity\b/i.test(evidence)) f['Technology/Platform']='Not Applicable';
      else if(/\bZerto\b/i.test(evidence)) f['Technology/Platform']='Zerto';
      else if(/\bRack\s*Ware\b/i.test(evidence)) f['Technology/Platform']='Rackware';
      else if(/\bVeeam\b/i.test(evidence)) f['Technology/Platform']='Veeam';
      else if(/\b(?:Atempo\s*Time\s*Navigator|\bATINA\b|\bTINA\b)/i.test(evidence)) f['Technology/Platform']='Atempo Time Navigator (ATINA)';
      else issues.push('Technology/Platform needs verification');
    }
    if(!f['Supported Portfolio'] && /\bDell\s*(?:EMC\s*)?Unity\b/i.test(evidence)) f['Supported Portfolio']='Dell';
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
    return rx.test(text) ? String(text).replace(rx,(_,pre)=>pre+(pre.endsWith(' ')?'':' ')+value) : String(text);
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
      const next=outcome.fields[key] || ''; // Blank unmatched dropdown; never show non-option placeholder.
      if(old!==next)updated=setField(updated,name,next);
    }
    // Recover a missing field label as well as one with an empty value.
    if (!/(?:^|\n)\s*Issue\s+Sub-?Category\s*:/i.test(updated) && outcome.fields['Issue Sub-Category']) {
      updated=updated.replace(/^(\s*Issue Category\s*:[^\r\n]*)(\r?\n|$)/im,
        (_,line,separator)=>line+'\nIssue Subcategory: '+outcome.fields['Issue Sub-Category']+separator);
    }
    const report=reportingClassification({Subject:getField(updated,'Subject'),Description:getField(updated,'Description')},source);
    if(report){
      const existing=/(?:Ticket\s*(?:No\.|Number)?\s*#?\s*\d{5,8}|#\s*\d{5,8})\b/i.test(String(source||''));
      updated=updated.replace(/\b(?:New|Existing)\s+Incident\s+Ticket\b/gi,
        existing?'Existing Request Ticket':'Request Ticket');
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
    '\nNever invent dropdown values, never borrow a subcategory from a different Issue Category, and never convert an allowed option merely because of generic wording. "Monitoring" and "Retrigger failed backup" ARE valid for particular families.\\nIf uncertain, leave the mapped dropdown blank instead of outputting Verify in Zoho Desk. A valid Request is never turned into Incident based only on being escalated.';
  return {CATEGORIES,SOLUTIONS,PORTFOLIOS,PLATFORMS,mode,issueCategory,subcategory,portfolio,platform,solution,reportingClassification,validateFields,correctTicketText,correctPayload,POLICY};
});
