/* Monde Nissin reporting — runs entirely in the local browser. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ORDER = ['MONDE-MAKATI', 'MONDE-AWS', 'MONDE-MK2', 'MONDE-MK2-2', 'MONDE-LenovoSTR'];
  const state = {vpgs:null, alerts:null, fileNames:{}, images:{}, generated:false, subject:'', originalHtml:''};
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const localDate = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  $('reportDate').value = localDate();
  let toastTimeout;
  function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').classList.remove('visible'),4200)}
  function parseCsv(input){
    let text=String(input).replace(/^\uFEFF/,'');let result=[],row=[],part='',quoted=false;
    for(let i=0;i<text.length;i++){
      let c=text[i];
      if(quoted){if(c==='"'&&text[i+1]==='"'){part+='"';i++}else if(c==='"')quoted=false;else part+=c}
      else if(c==='"')quoted=true;
      else if(c===','){row.push(part);part=''}
      else if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(part);result.push(row);row=[];part=''}
      else part+=c;
    }
    if(quoted)throw new Error('CSV has an unfinished quoted value.');
    if(part!==''||row.length){row.push(part);result.push(row)}
    return result.filter(r=>r.some(v=>String(v).trim()!==''));
  }
  const norm = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g,'');
  function parseTable(text, required){
    const rows=parseCsv(text);if(rows.length<2)throw new Error('CSV is empty or has no records.');
    const fields=rows[0].map(norm);
    for(const name of required){if(!fields.includes(norm(name)))throw new Error(`Missing column: ${name}. Please export the original CSV from Zerto.`)}
    return rows.slice(1).map(r=>Object.fromEntries(fields.map((h,i)=>[h,String(r[i] ?? '').trim()])));
  }
  const key = (row,name) => row[norm(name)] || '';
  const severity = s => /^(error|erroneous|red|critical|failed)$/i.test(s)?'red':/^(warned|warning|yellow|orange)$/i.test(s)?'yellow':/^(healthy|green|ok|normal)$/i.test(s)?'green':'unknown';
  function getVpgs(csv){
    return parseTable(csv,['Status','VPG Name','Protection Status','Recovery Site','Actual RPO']).map(row=>({
      name:key(row,'VPG Name'),site:key(row,'Recovery Site'),protectedSite:key(row,'Protected Site'),
      protection:key(row,'Protection Status'),rpo:(/^\s*\d+(?:\.\d+)?\s*$/.test(key(row,'Actual RPO').replace(/,/g,''))?Number(key(row,'Actual RPO').replace(/,/g,'')):NaN),rawRpo:key(row,'Actual RPO'),
      vms:key(row,'#VMs'),journal:Number(key(row,'Actual Journal History')),configuredJournal:Number(key(row,'Configured Journal History')),
      level:severity(key(row,'Status'))
    })).filter(r=>r.name);
  }
  // Zerto supplies local timestamps such as "10/15/2026 4:17:54 PM".
  // Parse numerically rather than using locale-sensitive Date.parse.
  function alertTime(text){
    const m=String(text||'').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if(!m)return NaN;
    let hour=+m[4]; if(m[7])hour=hour%12+(m[7].toUpperCase()==='PM'?12:0);
    if(+m[1]<1||+m[1]>12||+m[2]<1||+m[2]>31||hour>23||+m[5]>59||+m[6]>59)return NaN;
    const date=Date.UTC(+m[3],+m[1]-1,+m[2],hour,+m[5],+(m[6]||0));
    const check=new Date(date);
    return check.getUTCFullYear()===+m[3]&&check.getUTCMonth()===+m[1]-1&&check.getUTCDate()===+m[2]?date:NaN;
  }
  function getAlerts(csv){
    const alerts=parseTable(csv,['Status','Entity','Description','Site','Started']).filter(r=>key(r,'Description')).map((r,i)=>({
      level:severity(key(r,'Status')),entity:key(r,'Entity').toUpperCase(),
      description:key(r,'Description'),site:key(r,'Site'),id:key(r,'Alert ID'),
      started:key(r,'Started'),startedTime:alertTime(key(r,'Started')),sequence:i
    }));
    if(alerts.some(a=>a.entity==='VPG'&&!Number.isFinite(a.startedTime)))
      throw new Error('One or more VPG alerts have an invalid Started date. A valid date is needed to identify the latest alert.');
    return alerts;
  }
  // Match the full VPG name against VPG Export.csv, not the alert ID: one alert ID
  // (such as VRA0039) can apply to multiple unrelated VPGs.
  function alertVpg(a){
    const desc=a.description.toLowerCase();
    const matches=(state.vpgs||[]).filter(v=>
      v.site.toLowerCase()===a.site.toLowerCase()&&desc.includes(v.name.toLowerCase()));
    matches.sort((x,y)=>y.name.length-x.name.length);
    return matches[0]||null;
  }
  function latestVpgAlerts(){
    const chosen=new Map();
    (state.alerts||[]).forEach(a=>{
      if(a.entity!=='VPG')return;
      const vpg=alertVpg(a);
      // Never collapse unidentified alerts into another VPG by a shared alert code.
      const identity=vpg?`vpg:${vpg.site.toLowerCase()}|${vpg.name.toLowerCase()}`:`unmatched:${a.sequence}`;
      const candidate={...a,vpgName:vpg?vpg.name:'',matched:!!vpg};
      const previous=chosen.get(identity);
      const candidateTime=Number.isFinite(candidate.startedTime)?candidate.startedTime:-Infinity;
      const previousTime=previous&&Number.isFinite(previous.startedTime)?previous.startedTime:-Infinity;
      if(!previous||candidateTime>previousTime||candidateTime===previousTime&&candidate.sequence>previous.sequence)chosen.set(identity,candidate);
    });
    return [...chosen.values()].sort((a,b)=>
      ORDER.indexOf(a.site)-ORDER.indexOf(b.site) || a.vpgName.localeCompare(b.vpgName));
  }
  function conciseVpgName(a){
    const name=a.vpgName||'VPG not identified';
    return name.replace(/^\[[^\]]+\]\s*-?\s*/, '').trim()||name;
  }
  function alertTotals(){
    const alerts=latestVpgAlerts();
    return {alerts,red:alerts.filter(a=>a.level==='red'),yellow:alerts.filter(a=>a.level==='yellow')};
  }
  function markDirty(){
    state.generated=false;state.subject='';$('reportSubject').innerHTML='<b>Subject:</b> —';$('reportPreview').innerHTML='';
    ['copySubject','copyReport','copyTable'].forEach(id=>$(id).disabled=true);
    $('reportHint').textContent='';$('reportCard').hidden=true;
  }
  function refresh(){
    markDirty();
    const complete=Array.isArray(state.vpgs)&&Array.isArray(state.alerts);
    $('generateBtn').disabled=!complete;
    $('results').classList.toggle('hidden', !state.vpgs);
    if(!state.vpgs){$('sourceStatus').className='info';$('sourceStatus').textContent='Upload both files.';return}
    const counts={total:state.vpgs.length,green:0,yellow:0,red:0,unknown:0};
    for(const row of state.vpgs)counts[row.level==='green'?'green':row.level==='yellow'?'yellow':row.level==='red'?'red':'unknown']++;
    $('countTotal').textContent=counts.total;$('countGreen').textContent=counts.green;$('countYellow').textContent=counts.yellow;$('countRed').textContent=counts.red;
    $('siteGrid').innerHTML=sites().map(site=>{
      const rows=state.vpgs.filter(r=>r.site===site),normal=rows.filter(r=>/^meeting sla$/i.test(r.protection)),numbers=normal.map(r=>r.rpo).filter(Number.isFinite);
      const range=numbers.length?(Math.min(...numbers)===Math.max(...numbers)?`${Math.min(...numbers)}s`:`${Math.min(...numbers)}–${Math.max(...numbers)}s`):'Not available';
      const exceptions=rows.filter(r=>!/^meeting sla$/i.test(r.protection));
      const errors=rows.filter(r=>r.level==='red').length,warns=rows.filter(r=>r.level==='yellow').length;
      return `<div class="site"><strong>${escapeHtml(site)}</strong><div class="site-rpo">${range}</div><div class="detail">${rows.length} VPGs · ${normal.length} meeting SLA</div>${(exceptions.length||errors||warns)?`<span class="flag">${[exceptions.length?exceptions.length+' SLA exception(s)':'',errors?errors+' red':'',warns?warns+' yellow':''].filter(Boolean).join(' · ')}</span>`:'<span class="detail" style="color:#16834e">All meeting SLA</span>'}</div>`;
    }).join('');
    $('screenshotInputs').innerHTML=sites().map((site,i)=>`<label class="screen-field">${escapeHtml(site)}<input aria-label="Screenshot for ${escapeHtml(site)}" type="file" data-site="${i}" accept="image/png,image/jpeg,image/webp"></label>`).join('');
    $('screenshotInputs').querySelectorAll('input').forEach(input=>input.addEventListener('change',async e=>{
      const f=e.target.files[0];if(!f)return;
      if(f.size>8*1024*1024){toast('Please use a screenshot under 8 MB.');e.target.value='';return}
      if(!['image/png','image/jpeg','image/webp'].includes(f.type)){toast('Use PNG, JPEG, or WebP screenshot files.');e.target.value='';return}
      try{const site=sites()[Number(input.dataset.site)];state.images[site]=await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(f)});markDirty();toast(`${site} screenshot added. Generate again to include it.`)}catch(err){toast('Could not read screenshot.')}
    }));
    $('alertList').innerHTML=latestVpgAlerts().map(a=>alertItem(a)).join('')||'<div class="empty">No VPG alerts in the imported monitoring file.</div>';
    const others=(state.alerts||[]).filter(a=>a.entity!=='VPG');
    $('zvmAlerts').innerHTML=others.length?`<div class="mini"><b>Additional monitoring alerts (${others.length})</b> — review separately; these are not included in the VPG alert summary.</div>`+others.map(a=>alertItem(a)).join(''):'';
    const active=latestVpgAlerts();
    const vpgRawCount=(state.alerts||[]).filter(a=>a.entity==='VPG').length;
    const oldCount=vpgRawCount-active.length;
    $('alertToggle').textContent=`Latest alerts — ${active.length} VPG(s)${oldCount?` · ${oldCount} older alert(s) excluded`:''}`;
    const warnings=[];
    if(!state.alerts)warnings.push('Monitoring Alert.csv is still needed.');
    if(counts.unknown)warnings.push(`${counts.unknown} VPG status value(s) were not recognized.`);
    const alerts=latestVpgAlerts();
    if(counts.yellow+counts.red>alerts.length)warnings.push('Some VPGs with unhealthy status have no matching monitoring alert.');
    if(alerts.some(a=>!a.matched))warnings.push('Some alerts could not be matched to a VPG name; check the alert list.');
    if(state.vpgs.some(r=>Number.isFinite(r.rpo)&&r.rpo>60))warnings.push('High actual RPO detected — check the exception in the report.');
    if(others.length)warnings.push(`${others.length} additional ZVM alerts require separate review.`);
    $('sourceStatus').className='info '+(warnings.length?'warn':complete?'ok':'');
    $('sourceStatus').textContent=complete?(warnings.length?'Check alerts: '+warnings.join(' '):'Files ready.'):'Upload Monitoring Alert.csv.';
  }
  function sites(){return [...new Set((state.vpgs||[]).map(r=>r.site).filter(Boolean))].sort((a,b)=>{const ia=ORDER.indexOf(a),ib=ORDER.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib)||a.localeCompare(b)})}
  function alertItem(a){return `<div class="alert-item ${a.level==='red'?'red':'yellow'}"><div class="alert-head"><span>${escapeHtml(a.level==='red'?'Red':a.level==='yellow'?'Yellow':'Other')} · ${escapeHtml(a.site)}</span><span>${escapeHtml(a.started||a.entity+' '+a.id)}</span></div><p>${escapeHtml(a.description)}</p></div>`}
  async function handleFile(file,type){
    if(!file)return;
    if(!/\.csv$/i.test(file.name)&&file.type!=='text/csv'){toast('Please upload a CSV file.');return}
    try{
      const content=await file.text();
      if(type==='vpg'){
        const rows=getVpgs(content);if(!rows.length)throw new Error('No VPG rows were found.');
        state.vpgs=rows;state.fileNames.vpg=file.name;state.images={};$('vpgFileLabel').textContent=`✓ ${file.name} · ${rows.length} VPGs`;$('vpgSymbol').textContent='✓';$('vpgDrop').classList.add('ready');
      }else{
        state.alerts=getAlerts(content);state.fileNames.alert=file.name;$('alertFileLabel').textContent=`✓ ${file.name} · ${state.alerts.length} alerts`;$('alertSymbol').textContent='✓';$('alertDrop').classList.add('ready');
      }
      refresh();toast(`${file.name} loaded successfully.`);
    }catch(err){toast(`Unable to import ${file.name}: ${err.message}`)}
  }
  for(const [id,area,type] of [['vpgInput','vpgDrop','vpg'],['alertInput','alertDrop','alert']]){
    $(id).addEventListener('change',e=>handleFile(e.target.files[0],type));
    const drop=$(area);
    ['dragenter','dragover'].forEach(event=>drop.addEventListener(event,e=>{e.preventDefault();drop.classList.add('drag')}));
    ['dragleave','drop'].forEach(event=>drop.addEventListener(event,e=>{e.preventDefault();drop.classList.remove('drag')}));
    drop.addEventListener('drop',e=>handleFile(e.dataTransfer.files[0],type));
  }
  $('reportDate').addEventListener('change',markDirty);
  function reportStatus(site){
    const rows=state.vpgs.filter(v=>v.site===site);
    const normal=rows.filter(r=>/^meeting sla$/i.test(r.protection));
    const exception=rows.filter(r=>!/^meeting sla$/i.test(r.protection));
    const nums=normal.map(r=>r.rpo).filter(Number.isFinite);
    const range=nums.length?(Math.min(...nums)===Math.max(...nums)?`${Math.min(...nums)} second${Math.min(...nums)===1?'':'s'}`:`${Math.min(...nums)}-${Math.max(...nums)} seconds`):null;
    let text;
    if(normal.length){text=`${exception.length?'Most VPGs are':'VPGs are'} meeting SLA${range?' with Actual RPO of approximately '+range:''}.`}
    else{text='VPG protection status requires review.'}
    for(const row of exception){const rpo=Number.isFinite(row.rpo)?` with Actual RPO of ${row.rpo} seconds`:'';text+=` 1 VPG has a ${row.protection} (${row.name})${rpo}.`}
    const currentAlerts=latestVpgAlerts().filter(a=>a.site===site);
    const red=currentAlerts.filter(a=>a.level==='red').length;
    const yellow=currentAlerts.filter(a=>a.level==='yellow').length;
    if(red)text+=` ${red} VPG${red!==1?'s':''} ${red!==1?'have':'has'} a red alert.`;
    if(yellow)text+=` ${yellow} VPG${yellow!==1?'s':''} ${yellow!==1?'have':'has'} a yellow alert.`;
    return text;
  }
  function reportHtml(){
    let html='<p>Hi Team, Good day.</p><p>Please see below the current status of the Zerto Virtual Machines (VMs) and Virtual Protection Groups (VPGs) for protection.</p>';
    const bySite=sites(), allVpgAlerts=latestVpgAlerts();
    for(const site of bySite){
      html+=`<div class="site-block"><p><b>Recovery Site: ${escapeHtml(site)}</b></p><p><b>Status:</b> ${escapeHtml(reportStatus(site))}</p>`;
      const shot=state.images[site];if(shot)html+=`<img class="report-image" alt="Zerto status for ${escapeHtml(site)}" src="${shot}">`;
      const alerts=allVpgAlerts.filter(a=>a.site===site);
      if(!alerts.length){html+='<p>Alerts: None</p>'}
      else{
        for(const level of ['yellow','red']){
          const batch=alerts.filter(a=>a.level===level);
          for(let i=0;i<batch.length;i++)html+=`<p class="alert-line"><b>${level==='red'?'Red Alerts':'Yellow Alerts'}:</b> ${escapeHtml(batch[i].description)}</p>`;
        }
      }
      html+='</div>';
    }
    // Keep this a *summary*, not a second copy of all the full descriptions.
    const {red,yellow}=alertTotals();
    const count=red.length+yellow.length;
    html+=`<p><b>Alert Summary:</b> ${count===0?'No VPG alerts.':`${red.length} Red Alert${red.length===1?'':'s'} and ${yellow.length} Yellow Alert${yellow.length===1?'':'s'} affecting ${count} VPG${count===1?'':'s'}.`}</p>`;
    for(const [title,rows] of [['Red',red],['Yellow',yellow]]){
      if(rows.length){
        const names=rows.map(a=>`${a.site}: ${conciseVpgName(a)}`).join('; ');
        html+=`<p><b>${title}:</b> ${escapeHtml(names)}</p>`;
      }
    }
    html+='<p><b><i>Note: VPGs with Yellow/Orange alert status indicate as below.</i></b></p><p><i>Legend – VPG Alert Status Indicators</i></p>';
    html+='<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:570px;border:1px solid #444;font-family:Arial,sans-serif;font-size:12px;background:#fff;color:#222"><thead><tr><th style="border:1px solid #444;text-align:left;padding:6px">Indicator</th><th style="border:1px solid #444;text-align:left;padding:6px">Status Description</th></tr></thead><tbody><tr><td style="border:1px solid #444;padding:6px">🟢 Green</td><td style="border:1px solid #444;padding:6px">VPG is being replicated, including syncing between sites</td></tr><tr><td style="border:1px solid #444;padding:6px">🟡 Yellow/Orange</td><td style="border:1px solid #444;padding:6px">VPG is being replicated, but with issues (e.g., RPO &gt; Target)</td></tr><tr><td style="border:1px solid #444;padding:6px">🔴 Red</td><td style="border:1px solid #444;padding:6px">VPG is not being replicated due to communication or other issues</td></tr></tbody></table>';
    html+='<p style="margin-top:16px">For questions or further clarifications regarding this report, please feel free to respond to this email.</p>';
    return html;
  }
  $('generateBtn').addEventListener('click',()=>{
    if(!state.vpgs||!state.alerts){toast('Please upload both Zerto CSV exports.');return}
    const date=$('reportDate').value;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){toast('Please enter the report date.');return}
    const [yyyy,mm,dd]=date.split('-');
    state.subject=`SANDZ-MSDCO-Monde Nissin-MS-VM Status ${mm}/${dd}/${yyyy}`;
    $('reportSubject').innerHTML=`<b>Subject:</b> ${escapeHtml(state.subject)}`;
    $('reportPreview').innerHTML=reportHtml();
    $('reportPreview').contentEditable='true';$('reportPreview').setAttribute('aria-label','Editable daily report email content');
    $('reportHint').textContent='';$('reportCard').hidden=false;
    state.generated=true;['copySubject','copyReport','copyTable'].forEach(id=>$(id).disabled=false);
    $('reportCard').scrollIntoView({behavior:'smooth',block:'start'});
    toast('Report ready.');
  });
  async function copySubjectOnly(){
    const text=state.subject;
    try{await navigator.clipboard.writeText(text);return true}catch(e){
      const input=document.createElement('textarea');input.value=text;
      input.style.position='fixed';input.style.left='-9999px';document.body.appendChild(input);
      input.select();let ok=false;try{ok=document.execCommand('copy')}catch(err){}input.remove();return ok;
    }
  }
  // A plain-text fallback is intentionally NOT used for the email. It would silently
  // turn the three-column/row HTML legend into text when pasted into Zoho Desk.
  // Try HTML clipboard first, then browser rich-selection copy (supports tables).
  async function copyFormattedContent(node){
    const html=`<html><body><div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#202124;background:#fff">${node.innerHTML}</div></body></html>`;
    const plain=node.innerText;
    if(navigator.clipboard?.write&&window.ClipboardItem){
      try{
        await navigator.clipboard.write([new ClipboardItem({
          'text/html':new Blob([html],{type:'text/html'}),
          'text/plain':new Blob([plain],{type:'text/plain'})
        })]);
        return true;
      }catch(err){/* Use the rich-selection fallback below. */}
    }
    return selectAndCopy(node);
  }
  function selectAndCopy(node){
    const selection=window.getSelection();
    const saved=[];
    for(let i=0;selection&&i<selection.rangeCount;i++)saved.push(selection.getRangeAt(i).cloneRange());
    const range=document.createRange();
    if(node.tagName==='TABLE')range.selectNode(node);else range.selectNodeContents(node);
    node.focus({preventScroll:true});selection.removeAllRanges();selection.addRange(range);
    let ok=false;
    try{ok=document.execCommand('copy')}catch(err){}
    if(ok){selection.removeAllRanges();for(const old of saved)selection.addRange(old)}
    // On failure leave the formatted report selected: user can press Ctrl+C.
    return ok;
  }
  $('copySubject').addEventListener('click',async()=>{
    if(state.generated)toast(await copySubjectOnly()?'Subject copied.':'Select the subject and press Ctrl+C.');
  });
  $('copyReport').addEventListener('click',async()=>{
    if(!state.generated)return;
    toast(await copyFormattedContent($('reportPreview'))?'Formatted email copied, including the table.':'Email selected. Press Ctrl+C, then paste into Zoho Desk.');
  });
  $('copyTable').addEventListener('click',async()=>{
    if(!state.generated)return;
    const table=$('reportPreview').querySelector('table');
    if(!table){toast('No legend table found.');return;}
    toast(await copyFormattedContent(table)?'Table copied. Paste it into Zoho Desk.':'Table selected. Press Ctrl+C, then paste into Zoho Desk.');
  });
})();
