/* Customer-first isolation and Zoho output validation. Never resolve an account from unrelated sidebar listings. */
(function(root, factory) {
  const api=factory();
  if(typeof module !== 'undefined' && module.exports) module.exports=api;
  if(root) root.MAUCustomerSafety=api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null), function() {
  'use strict';
  const CUSTOMERS=[
    {key:'monde',company:'Monde Nissin',account:'Monde Nissin - Sandz',subject:'Monde Nissin',aliases:['monde nissin corporation','monde nissin','monde']},
    {key:'ewb',company:'East West Bank',account:'East West Bank - Sandz',subject:'EWB',aliases:['eastwest bank','east west bank','ewb']},
    {key:'bpitc',company:'BPI Tokyo Century',account:'BPI Tokyo Century (BPITC) - Sandz',subject:'BPI Tokyo Century',aliases:['bpi tokyo century','bpitc']},
    {key:'radius',company:'RADIUS TELECOMS INC.',account:'RADIUS TELECOMS INC. - Sandz',subject:'Radius Telecoms Inc.',aliases:['radius telecoms inc','radius telecoms','radius']},
    {key:'natre',company:'National Reinsurance Corporation of the Philippines',account:'National Reinsurance Corporation of the Philippines - Sandz',subject:'NatRe',aliases:['national reinsurance corporation of the philippines','national reinsurance','natre']},
    {key:'gma',company:'GMA Network Inc.',account:'GMA Network Inc. - Sandz',subject:'GMA',aliases:['gma network','gma']},
    {key:'bcda',company:'BCDA',account:'',subject:'BCDA',aliases:['bcda']},
    {key:'dswd',company:'DSWD',account:'',subject:'DSWD',aliases:['dswd']}
  ];
  const byKey=key=>CUSTOMERS.find(c=>c.key===String(key||'').toLowerCase()) || null;
  const squish=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const aliasEntries=CUSTOMERS.flatMap(c=>c.aliases.map(alias=>({alias:squish(alias),customer:c}))).sort((a,b)=>b.alias.length-a.alias.length);
  function fromValue(value) {
    const words=' '+squish(value)+' ';
    if(!words.trim())return null;
    for(const entry of aliasEntries) if(words.includes(' '+entry.alias+' '))return entry.customer;
    return null;
  }
  function explicitSelection(text) {
    const source=String(text||'').trim();
    const first=source.split(/\r?\n/).map(s=>s.trim()).find(Boolean)||'';
    const sole=fromValue(first);
    if(sole && squish(first).length <= squish(sole.company).length + 12 && !/ticket\s*#/i.test(first))return sole;
    const selected=source.slice(0,450).match(/(?:^|[\n.!?]\s*)(?:now\s+|please\s+)?(?:switch(?:ing)?\s+to|new\s+(?:ticket|case|request)\s+for|next\s+(?:customer|ticket)\s+(?:is|for)|customer\s+is|for\s+customer)\s*:?\s*([^\n.!?,;]+)/i);
    return selected ? fromValue(selected[1]) : null;
  }
  function fieldValues(text) {
    const source=String(text||'');
    const lines=source.split(/\r?\n/);
    const found=[];
    for(let i=0;i<lines.length;i++){
      const match=lines[i].match(/^\s*(?:Account Name|Customer Company Name)\s*\*?\s*:?\s*(.*?)\s*$/i);
      if(!match) continue;
      let value=match[1]||'';
      if(!value && i+1<lines.length)value=lines[i+1].trim();
      const c=fromValue(value);
      if(c)found.push(c);
    }
    return [...new Map(found.map(c=>[c.key,c])).values()];
  }
  function focusTicket(text) {
    const source=String(text||'');
    const marker=source.lastIndexOf('Ticket Properties');
    if(marker!==-1) return source.slice(marker);
    return source;
  }
  function sourceIdentity({userText='',ocrText=''}={}) {
    const user=String(userText||'');
    const ocr=focusTicket(ocrText);
    const selected=explicitSelection(user);
    const userFields=fieldValues(user);
    const ocrFields=fieldValues(ocr);
    if(selected) {
      // The ticket's explicit account fields must not contradict the request.
      if(userFields.some(item=>item.key!==selected.key)) return {ambiguous:true,reason:'ticket-company-disagrees-with-request'};
      if(ocrFields.some(item=>item.key!==selected.key)) return {ambiguous:true,reason:'screenshot-company-disagrees-with-request'};
      return {key:selected.key,customer:selected,reason:'explicit-request',strong:true};
    }

    if(userFields.length===1)return {key:userFields[0].key,customer:userFields[0],reason:'user-ticket-field',strong:true};
    if(userFields.length>1)return {ambiguous:true,reason:'conflicting-ticket-fields'};
    if(ocrFields.length===1)return {key:ocrFields[0].key,customer:ocrFields[0],reason:'ticket-properties',strong:true};
    if(ocrFields.length>1)return {ambiguous:true,reason:'conflicting-ticket-properties'};
    // Only a single distinct subject in a current alert is usable; avoid choosing
    // a customer from the entire Zoho ticket listing or correspondence history.
    const rawSubject=user.match(/(?:^|\n)\s*Subject\s*:\s*(SANDZ[-–](?:MSDCO|SI)[-–][^\n]+)/i);
    if(rawSubject){
      const prefix=rawSubject[1].replace(/^SANDZ[-–](?:MSDCO|SI)[-–]/i,'');
      const sub=fromValue(prefix.split(/-(?=Zerto|Veeam|RackWare|RMM|Request|Daily|Incident|MS\b)/i)[0]);
      if(sub)return {key:sub.key,customer:sub,reason:'subject',strong:true};
    }
    return {key:'',customer:null,reason:'no-confirmed-customer',strong:false};
  }
  function platformFromSource(text) {
    const source=String(text||'');
    const platformField=source.match(/(?:^|\n)\s*Technology\s*\/\s*Platform\s*\*?\s*:?\s*(?:\n\s*)?([^\n]+)/i);
    if(platformField && /^Zerto\b/i.test(platformField[1].trim()))return 'Zerto';
    if(platformField && /^Rack\s*Ware\b/i.test(platformField[1].trim()))return 'RackWare';
    const z=/(?:\bZerto\b|\bVPGs?\b|journal limit|actual\s+RPO)/i.test(source);
    const r=/(?:\bRack\s*Ware\b|\bRMM Wave item sync\b|\bRSP_SYNC_)/i.test(source);
    if(z&&!r)return 'Zerto';
    if(r&&!z)return 'RackWare';
    return '';
  }
  function replaceField(text,label,value) {
    const escaped=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const regex=new RegExp('^(\\s*'+escaped+':[ \\t]*)([^\\r\\n]*)','im');
    if(regex.test(text))return text.replace(regex,(_,prefix)=>prefix+value);
    return text;
  }
  function fixSubject(value, customer) {
    const old=String(value||'').trim();
    if(!/^SANDZ[-–](?:MSDCO|SI)[-–]/i.test(old))return old;
    let subject=old;
    // Explicit old-prefix matches are safe to replace; preserve the rest exactly.
    const labelPattern=/^(SANDZ[-–](?:MSDCO|SI)[-–])([^\r\n]*?)(?=-(?:Zerto|RackWare|Veeam|Atempo|RMM|Request|Daily|VM\b|MS[-–]|Multiple\b|Backup\b|Incident\b))/i;
    if(labelPattern.test(subject))return subject.replace(labelPattern, (_,prefix)=>prefix+customer.subject);
    const oldEntry=CUSTOMERS.flatMap(c=>[c.subject,c.company,...c.aliases]).sort((a,b)=>b.length-a.length)
      .find(alias=>subject.toLowerCase().startsWith('sandz-msdco-'+alias.toLowerCase()+'-'));
    if(oldEntry)return subject.replace(new RegExp('^(SANDZ[-–](?:MSDCO|SI)[-–])'+oldEntry.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),(_,prefix)=>prefix+customer.subject);
    return subject;
  }
  function sourceField(source, label) {
    const labelRx=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const lines=String(source||'').split(/\r?\n/);
    for(let i=0;i<lines.length;i++){
      const m=lines[i].match(new RegExp('^\\s*'+labelRx+'\\s*\\*?\\s*:?[ \\t]*(.*)$','i'));
      if(!m)continue;
      return (m[1]||lines[i+1]||'').trim();
    }
    return '';
  }
  function enforceZoho(text, customerKey, sourceText) {
    const account=byKey(customerKey);
    const source=String(sourceText||'');
    if(!account)return {text:String(text||''),changes:[]};
    const original=String(text||'');
    if(!/(?:^|\n)\s*Customer Company Name\s*:/i.test(original) || !/(?:^|\n)\s*Subject\s*:/i.test(original))return {text:original,changes:[]};
    let corrected=original;const changes=[];
    function replace(label,value){
      const existing=corrected.match(new RegExp('^\\s*'+label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+':[ \\t]*(.*)$','im'));
      if(!existing)return;
      if(existing[1].trim()!==value){corrected=replaceField(corrected,label,value);changes.push(label);}
    }
    replace('Customer Company Name',account.company);
    if(account.account)replace('Account Name',account.account);
    const sm=corrected.match(/^\s*Subject:\s*(.*)$/im);
    if(sm){const next=fixSubject(sm[1],account);replace('Subject',next);}
    const platform=platformFromSource(source);
    if(platform){
      replace('Technology/Platform',platform);
      if(platform==='Zerto'||platform==='RackWare'){
        replace('Supported Portfolio','(DRaaS) Disaster Recovery as a Service');
        replace('Issue Category','Disaster Recovery - Incident');
      }
    }
    const verifiedSe=sourceField(source,'Assigned Onsite Engr');
    const trustedSe={ewb:'Lery Ponce / Aeron Villanueva',bpitc:'Jhon Philip Doblado / CJ Tecson',radius:'CJ Tecson / Aeron Villanueva',natre:'CJ Tecson / EJ Remolona',gma:'CJ Tecson / EJ Remolona'};
    const trustedPm={ewb:'Lian',bpitc:'Lian',radius:'Cha',natre:'Cha',gma:'Cha'};
    if(verifiedSe && !/^-?None-?$|^-$|^0$/i.test(verifiedSe)) replace("SE's that can handle this ticket",verifiedSe);
    else replace("SE's that can handle this ticket",trustedSe[customerKey]||'Verify assigned engineer in Zoho Desk');
    replace('PM/SD of this account',trustedPm[customerKey]||'Verify in Zoho Desk');
    const severity=sourceField(source,'Severity Level');
    if(/^Sev[1-4]$/i.test(severity))replace('Severity',severity);
    const priority=sourceField(source,'Priority');
    if(/^(Low|Medium|High|Urgent)$/i.test(priority))replace('Priority',priority);
    return {text:corrected,changes};
  }
  function enforcePayload(payload,key,sourceText){
    const account=byKey(key);
    if(!account||!payload||!payload.fields)return payload;
    payload.fields['Customer Company Name']=account.company;
    if(account.account)payload.fields['Account Name']=account.account;
    payload.fields.Subject=fixSubject(payload.fields.Subject,account);
    const platform=platformFromSource(sourceText);
    if(platform){
      payload.fields['Technology/Platform']=platform;
      if(platform==='Zerto'||platform==='RackWare'){
        payload.fields['Supported Portfolio']='(DRaaS) Disaster Recovery as a Service';
        payload.fields['Issue Category']='Disaster Recovery - Incident';
      }
    }
    return payload;
  }
  return {CUSTOMERS,byKey,sourceIdentity,focusTicket,fromValue,platformFromSource,fixSubject,enforceZoho,enforcePayload};
});
