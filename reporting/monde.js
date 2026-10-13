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
      protection:key(row,'Protection Status'),rpo:Number(key(row,'Actual RPO').replace(/,/g,'')),rawRpo:key(row,'Actual RPO'),
      vms:key(row,'#VMs'),journal:Number(key(row,'Actual Journal History')),configuredJournal:Number(key(row,'Configured Journal History')),
      level:severity(key(row,'Status'))
    })).filter(r=>r.name);
  }
  function getAlerts(csv){
    return parseTable(csv,['Status','Entity','Description','Site']).filter(r=>key(r,'Description')).map(r=>({
      level:severity(key(r,'Status')), entity:key(r,'Entity').toUpperCase(),description:key(r,'Description'),site:key(r,'Site'),id:key(r,'Alert ID')
    }));
  }
  function markDirty(){
    state.generated=false;state.subject='';$('reportSubject').innerHTML='<b>Subject:</b> —';$('reportPreview').innerHTML='';
    ['copySubject','copyReport'].forEach(id=>$(id).disabled=true);
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
    $('alertList').innerHTML=(state.alerts||[]).filter(a=>a.entity==='VPG').map(a=>alertItem(a)).join('')||'<div class="empty">No VPG alerts in the imported monitoring file.</div>';
    const others=(state.alerts||[]).filter(a=>a.entity!=='VPG');
    $('zvmAlerts').innerHTML=others.length?`<div class="mini"><b>Additional monitoring alerts (${others.length})</b> — review separately; these are not included in the VPG alert summary.</div>`+others.map(a=>alertItem(a)).join(''):'';
    $('alertToggle').textContent=`Review monitoring alerts — ${(state.alerts||[]).filter(a=>a.entity==='VPG').length} VPG alert(s), ${others.length} other alert(s)`;
    const warnings=[];
    if(!state.alerts)warnings.push('Monitoring Alert.csv is still needed.');
    if(counts.unknown)warnings.push(`${counts.unknown} VPG status value(s) were not recognized.`);
    const alerts=(state.alerts||[]).filter(a=>a.entity==='VPG');
    if(counts.yellow+counts.red>alerts.length)warnings.push('Some non-green VPG statuses have no matching VPG alert record.');
    if(state.vpgs.some(r=>Number.isFinite(r.rpo)&&r.rpo>60))warnings.push('High actual RPO detected — check the exception in the report.');
    if(others.length)warnings.push(`${others.length} additional ZVM alerts require separate review.`);
    $('sourceStatus').className='info '+(warnings.length?'warn':complete?'ok':'');
    $('sourceStatus').textContent=complete?(warnings.length?'Check alerts: '+warnings.join(' '):'Files ready.'):'Upload Monitoring Alert.csv.';
  }
  function sites(){return [...new Set((state.vpgs||[]).map(r=>r.site).filter(Boolean))].sort((a,b)=>{const ia=ORDER.indexOf(a),ib=ORDER.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib)||a.localeCompare(b)})}
  function alertItem(a){return `<div class="alert-item ${a.level==='red'?'red':'yellow'}"><div class="alert-head"><span>${escapeHtml(a.level==='red'?'Red':a.level==='yellow'?'Yellow':'Other')} · ${escapeHtml(a.site)}</span><span>${escapeHtml(a.entity)} ${escapeHtml(a.id)}</span></div><p>${escapeHtml(a.description)}</p></div>`}
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
    const red=rows.filter(r=>r.level==='red').length;
    const yellow=rows.filter(r=>r.level==='yellow').length;
    if(red)text+=` ${red} VPG${red!==1?'s':''} ${red!==1?'have':'has'} a red alert.`;
    if(yellow && !exception.some(r=>r.level==='yellow'))text+=` ${yellow} VPG${yellow!==1?'s':''} ${yellow!==1?'have':'has'} a yellow alert.`;
    return text;
  }
  function reportHtml(){
    let html='<p>Hi Team, Good day.</p><p>Please see below the current status of the Zerto Virtual Machines (VMs) and Virtual Protection Groups (VPGs) for protection.</p>';
    const bySite=sites(), allVpgAlerts=state.alerts.filter(a=>a.entity==='VPG');
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
    html+='<p><b>Alert Summary:</b></p>';
    const red=allVpgAlerts.filter(a=>a.level==='red'),yellow=allVpgAlerts.filter(a=>a.level==='yellow');
    for(const [label,rows] of [['Red',red],['Yellow',yellow]]){
      if(rows.length){for(const a of rows){const vpg=state.vpgs.find(r=>a.description.includes(r.name));html+=`<p>1 ${label} Alert for VPG: ${escapeHtml(vpg?.name||a.site+' (confirm VPG name)')}</p>`}}
    }
    if(!red.length&&!yellow.length)html+='<p>Alerts: None</p>';
    if(red.length||yellow.length){for(const a of [...red,...yellow])html+=`<p>- ${escapeHtml(a.description)}</p>`}
    html+='<p><b><i>Note: VPGs with Yellow/Orange alert status indicate as below.</i></b></p><p><i>Legend – VPG Alert Status Indicators</i></p>';
    html+='<table><thead><tr><th>Indicator</th><th>Status Description</th></tr></thead><tbody><tr><td>🟢 Green</td><td>VPG is being replicated, including syncing between sites</td></tr><tr><td>🟡 Yellow/Orange</td><td>VPG is being replicated, but with issues (e.g., RPO &gt; Target)</td></tr><tr><td>🔴 Red</td><td>VPG is not being replicated due to communication or other issues</td></tr></tbody></table>';
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
    state.generated=true;['copySubject','copyReport'].forEach(id=>$(id).disabled=false);
    $('reportCard').scrollIntoView({behavior:'smooth',block:'start'});
    toast('Report ready.');
  });
  async function copy(text,html){
    try{if(html&&navigator.clipboard?.write&&window.ClipboardItem){await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([text],{type:'text/plain'})})]);return true}}
    catch(e){/* fallback */}
    try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true}}catch(e){/* fallback */}
    const el=document.createElement('textarea');el.value=text;el.style.position='fixed';el.style.opacity='0';document.body.appendChild(el);el.focus();el.select();const worked=document.execCommand('copy');el.remove();return worked;
  }
  $('copySubject').addEventListener('click',async()=>{if(state.generated){toast(await copy(state.subject)?'Subject copied.':'Please select and copy the subject.')}});
  $('copyReport').addEventListener('click',async()=>{
    if(!state.generated)return;
    const content=$('reportPreview');const html=content.innerHTML;const text=content.innerText;
    toast(await copy(text,html)?'Email copied.':'Please select and copy the email preview.');
  });

})();
