/* MAU Viber ticket follow-up generator. Deliberately local-only; never calls APIs. */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const state={tickets:[],exportedAt:null,source:'',report:'',header:[],missingCloseColumn:false};
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const FULL_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const h=s=>String(s??'').replace(/\s+/g,' ').trim();
  const norm=s=>h(s).toLowerCase().replace(/[^a-z0-9]/g,'');
  function parseCsv(input){
    input=String(input||'').replace(/^\uFEFF/,'');
    const lines=[];let row=[],field='',inQuote=false;
    for(let i=0;i<input.length;i++){
      const c=input[i];
      if(c==='"'){
        if(inQuote&&input[i+1]==='"'){field+='"';i++;}
        else inQuote=!inQuote;
      }else if(c===','&&!inQuote){row.push(field);field='';}
      else if((c==='\n'||c==='\r')&&!inQuote){
        if(c==='\r'&&input[i+1]==='\n')i++;
        row.push(field);lines.push(row);row=[];field='';
      }else field+=c;
    }
    if(inQuote)throw new Error('The CSV has an unfinished quoted field.');
    if(field!==''||row.length){row.push(field);lines.push(row);}
    return lines;
  }
  function parseWhen(value){
    if(value instanceof Date)return Number.isFinite(value.getTime())?value:null;
    const s=h(value);
    if(!s||s==='-')return null;
    let m=s.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?:\s*([AP]M))?)?$/i);
    if(m){
      const month=MONTHS.findIndex(x=>x.toLowerCase()===m[2].slice(0,3).toLowerCase());
      if(month<0)return null;
      let hour=Number(m[4]||0), minute=Number(m[5]||0);
      if(m[6])hour=(hour%12)+(m[6].toUpperCase()==='PM'?12:0);
      const date=new Date(Number(m[3]),month,Number(m[1]),hour,minute);
      return date.getFullYear()===Number(m[3])&&date.getMonth()===month&&date.getDate()===Number(m[1])?date:null;
    }
    m=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?$/);
    if(m){
      const date=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),Number(m[4]||0),Number(m[5]||0));
      return date.getFullYear()===Number(m[1])&&date.getMonth()===Number(m[2])-1&&date.getDate()===Number(m[3])?date:null;
    }
    return null;
  }
  function localInput(date){const f=n=>String(n).padStart(2,'0');return `${date.getFullYear()}-${f(date.getMonth()+1)}-${f(date.getDate())}T${f(date.getHours())}:${f(date.getMinutes())}`;}
  function dayKey(d){return d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'';}
  function sameDay(a,b){return a&&b&&dayKey(a)===dayKey(b);}
  function stamp(d,year=false){if(!d)return '';const hour=d.getHours()%12||12;return `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]}${year?' '+d.getFullYear():''} ${String(hour).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ${d.getHours()<12?'AM':'PM'}`;}
  function timeOnly(d){if(!d)return '';return stamp(d).replace(/^\d+\s+[A-Za-z]{3}\s+/,'');}
  function dayTitle(d){return `${FULL_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;}
  function cleanCell(v){const val=h(v);return !val||val==='-'||val.toLowerCase()==='none'?'':val;}
  function importRecords(text){
    const rows=parseCsv(text);
    const ix=rows.findIndex(row=>row.some(c=>norm(c)==='ticketid')&&row.some(c=>norm(c)==='status'||norm(c)==='statusticket'));
    if(ix<0)throw new Error('Could not find the Zoho ticket header (Ticket Id and Status).');
    const headers=rows[ix].map(norm);
    const pos=(...keys)=>keys.map(norm).map(key=>headers.indexOf(key)).find(x=>x>=0)??-1;
    const idx={id:pos('Ticket Id','Ticket Number','Ticket #'),company:pos('Customer Company Name','Company Name','Account Name'),subject:pos('Subject','Ticket Subject'),sev:pos('Severity Level','Severity'),owner:pos('Assigned Onsite Engr','Assigned Engineer','Ticket Owner','Assignee'),due:pos('Due Date','Due Time'),overdue:pos('Is Overdue'),status:pos('Status (Ticket)','Status'),hold:pos('Ticket On Hold Time','On Hold Time'),created:pos('Created Time (Ticket)','Created Time'),closed:pos('Closed Time (Ticket)','Ticket Closed Time','Closed Time','Closed Date','Ticket Closed Date','Ticket Closed On','Date Closed','Closed At','Date of Closure','Date/Time Closed')};
    if(idx.id<0||idx.status<0)throw new Error('Ticket Id and Status columns are required.');
    const known=new Map(),parsed=[];
    for(const row of rows.slice(ix+1)){
      const get=key=>idx[key]<0?'':cleanCell(row[idx[key]]);
      const id=get('id').replace(/^#/,'');
      if(!/^\d{3,12}$/.test(id))continue;
      const record={id,company:get('company'),subject:get('subject'),severity:get('sev'),owner:get('owner'),due:parseWhen(get('due')),overdue:get('overdue').toLowerCase()==='true',status:get('status'),hold:parseWhen(get('hold')),created:parseWhen(get('created')),closed:parseWhen(get('closed')),closedRaw:get('closed')};
      if(!known.has(id)){known.set(id,true);parsed.push(record);}
    }
    if(!parsed.length)throw new Error('No ticket records found. Check that you exported ticket-level rows.');
    let exportedAt=null;
    for(const row of rows.slice(0,ix)){
      const val=row.find(v=>norm(v)==='generatedon');
      if(val!==undefined)exportedAt=parseWhen(row[row.indexOf(val)+1]);
    }
    return {tickets:parsed,exportedAt,missingCloseColumn:idx.closed<0,headers:rows[ix]};
  }
  function parseNotes(text){
    const map=new Map(),errors=[];
    String(text).split(/\r?\n/).forEach((line,i)=>{
      if(!line.trim())return;
      const match=line.match(/^\s*#?(\d{3,12})\s*\|\s*(.+?)\s*$/);
      if(!match){errors.push(`Remarks line ${i+1} does not use #number | note`);return;}
      map.set(match[1],match[2]);
    });
    return {map,errors};
  }
  function parseClosures(text){
    const map=new Map(),errors=[];
    String(text).split(/\r?\n/).forEach((line,i)=>{
      if(!line.trim())return;
      const m=line.match(/^\s*#?(\d{3,12})\s*\|\s*([^|]+?)(?:\s*\|\s*(.*))?\s*$/);
      if(!m){errors.push(`Closed line ${i+1} must use #number | time | optional note`);return;}
      const closed=parseWhen(m[2]);
      if(!closed){errors.push(`Closed line ${i+1} has an invalid date/time`);return;}
      map.set(m[1],{closed,extra:h(m[3]||'')});
    });
    return {map,errors};
  }
  // Previous Viber updates contain useful manually maintained notes. They are a
  // supplemental source only: do not reuse old statuses, owners or due dates.
  function parseOldShortDate(raw,year){
    const m=h(raw).match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{1,2}):(\d{2})\s*([AP]M)$/i);
    if(!m||!year)return null;
    return parseWhen(`${m[1]} ${m[2]} ${year} ${m[3]}:${m[4]} ${m[5]}`);
  }
  function parsePreviousViber(text,asOf,tickets){
    const remarks=new Map(), closures=new Map(), warnings=[];
    const byId=new Map(tickets.map(t=>[t.id,t]));
    const lines=String(text||'').replace(/\r\n?/g,'\n').split('\n');
    let section='',headingYear=null,stickyClosedNote='',matched=0,notesCount=0,dated=0,skipped=0;
    for(let i=0;i<lines.length;i++){
      const line=h(lines[i]);
      if(!line)continue;
      const heading=line.match(/^Ticket\s+Closed\s*(?:as\s+of\s+)?(?:on\s+)?(?:the\s+date\s+)?([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})\b/i) ||
          line.match(/^Ticket\s+Closed\s*(?:as\s+of\s+)?(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b/i);
      if(heading){
        section='closed';headingYear=Number(heading[3]);
        continue;
      }
      const normalizedLine=line.replace(/^\*+\s*/, '');
      // In the old format, high-severity labels may appear INSIDE the
      // "Ticket closed" section, sometimes with a ticket on the same line.
      const isSectionHeader=/^(new\s+high\s+severity|high\s+severity|overdue\s+tickets|tickets\s+nearing\s+overdue|open\s+tickets|on\s+hold\s+tickets|resolved\s*\/|updated\s+list\s+of\s+tickets)\b/i.test(normalizedLine);
      if(isSectionHeader&&section==='closed'&&!normalizedLine.includes('#')){
        // "*High Severity Ticket (Sev 2) - Radius IaaS - (Ongoing Cleanup)"
        // applies its comment to the following closed-ticket ID.
        const noteMatch=normalizedLine.match(/\(([^()]+)\)\s*$/);
        if(noteMatch&&!/^sev\s*[1-4]$/i.test(noteMatch[1]))stickyClosedNote=noteMatch[1].trim();
        continue;
      }
      if(isSectionHeader&&section!=='closed'){
        section='other';headingYear=null;continue;
      }
      const ticketLine=section==='closed'&&normalizedLine.includes('#')?normalizedLine.slice(normalizedLine.indexOf('#')):line;
      const match=ticketLine.match(/^#?(\d{3,12})\s*[-–—]\s*(.*)$/);
      if(!match)continue;
      const id=match[1],original=byId.get(id);
      if(!original){skipped++;continue;}
      matched++;
      let rest=h(match[2]);
      // Detect an explicitly dated closure under a dated Closed section. For
      // yearless dates, the section date supplies the year (never today's date).
      if(section==='closed'){
        const closedMatch=rest.match(/(?:Closed\s*time\s*)?(\d{1,2}\s+[A-Za-z]{3,}\s+(?:\d{4}\s+)?\d{1,2}:\d{2}\s*[AP]M)/i);
        if(closedMatch){
          const raw=h(closedMatch[1]);
          const closeDate=parseWhen(raw)||parseOldShortDate(raw,headingYear);
          if(closeDate){
            if(original.closed && original.closed.getTime()!==closeDate.getTime())warnings.push(`Pasted Viber closing time for #${id} conflicts with the CSV Closed Time. CSV timestamp takes precedence.`);
            if(sameDay(closeDate,asOf)&&!original.closed){
              closures.set(id,closeDate);dated++;
              if(!isClosed(original.status))warnings.push(`Pasted Viber update lists #${id} as closed, but CSV status is ${original.status||'blank'}. Confirm this closure in Zoho before sending.`);
            }
          }
        }
      }
      const pieces=rest.split(/\s+-\s+/).map(h).filter(Boolean);
      // Start reading a remark after the current CSV owner. This prevents old
      // owner names, due dates and status labels from becoming comments.
      let tail=[];
      const owner=norm(original.owner);
      const ownerParts=h(original.owner).toLowerCase().split(/\s+/).filter(Boolean);
      const ownerIndex=pieces.findIndex(seg=>{
        if(!owner)return false;
        if(norm(seg)===owner||norm(seg).startsWith(owner))return true;
        // The Viber group commonly abbreviates "Jhon Philip Doblado" to "Jhon Doblado".
        // Require matching first AND last names; never guess ownership by surname alone.
        if(ownerParts.length<2)return false;
        const first=ownerParts[0],last=ownerParts[ownerParts.length-1];
        return new RegExp('^'+first+'\\s+'+last+'(?:\\s|$|\\s*\\()','i').test(seg);
      });
      if(ownerIndex>=0){
        const own=pieces[ownerIndex];
        const ownerPrefix=ownerParts.length>=2?'(?:'+original.owner.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'|'+ownerParts[0]+'\\s+'+ownerParts[ownerParts.length-1]+')':original.owner.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        const embedded=own.replace(new RegExp('^'+ownerPrefix,'i'),'').trim();
        if(embedded&&/^\(/.test(embedded))tail.push(embedded);
        tail.push(...pieces.slice(ownerIndex+1));
      }else{
        // Entries may omit the engineer. Only accept clear freeform notes,
        // not a generic last segment that could be an engineer name.
        tail=pieces.filter(seg=>/^\(?\s*(waiting|still\s+waiting|ongoing|backups?\s+|the\s+activity|checking|scheduled|for\s+closing|resolved\s+after|pending\s+|reviewed|client\s+|source\s+server|treat(?:ed)?\s+as|on\s+hold\s+due)\b/i.test(seg));
      }
      tail=tail.filter(seg=>!(/^\(?\s*(open|closed|resolved|on\s*hold|escalated\s+to\s+sandz|work\s+in\s+progress|sev\s*[1-4])\s*\)?$/i.test(seg)));
      let note=tail.join(' - ').replace(/^\((.*)\)$/,'$1').trim();
      // Don't treat previous ticket-state descriptions as current remarks.
      if(/^(closed\s+time|on\s+hold\s+time|due\s+today|due\s+date)\b/i.test(note))note='';
      if(stickyClosedNote&&section==='closed'){
        note=[note,stickyClosedNote].filter(Boolean).join(' - ');
        stickyClosedNote='';
      }
      if(note&&note.length>=7){remarks.set(id,note);notesCount++;}
    }
    if(skipped)warnings.push(`${skipped} previous-update line(s) were not found in the uploaded CSV; skipped.`);
    return {remarks,closures,warnings,matched,notesCount,dated};
  }

  function parseStatuses(text){
    const map=new Map(),errors=[];
    String(text).split(/\r?\n/).forEach((line,i)=>{
      if(!line.trim())return;
      const m=line.match(/^\s*#?(\d{3,12})\s*\|\s*([^|]+?)(?:\s*\|\s*(.*))?\s*$/);
      if(!m){errors.push(`Status correction line ${i+1} must use #number | status | optional hold time`);return;}
      const label=h(m[2]);
      if(!/^(on hold|on hold\/waiting customer|open|resolved|escalated to sandz|work in progress)$/i.test(label)){
        errors.push(`Status correction line ${i+1} has unsupported status ${label}. For closures, use the closed-tickets field.`);return;
      }
      const when=m[3]?parseWhen(m[3]):null;
      if(m[3]&&!when){errors.push(`Status correction line ${i+1} has invalid on-hold time`);return;}
      map.set(m[1],{status:label,hold:when});
    });
    return {map,errors};
  }
  function getAsOf(){const date=parseWhen($('asOf').value);if(!date)throw new Error('Choose a valid date and time.');return date;}
  const isClosed=status=>/\bclosed\b|\bcancelled\b|\bmerged\b/i.test(status);
  const isHold=status=>/on\s*hold|waiting\s+(customer|client|support|response|vendor|user)/i.test(status);
  const isResolved=status=>/resolved|for\s*closing/i.test(status);
  function compile(){
    if(!state.tickets.length)throw new Error('Upload a Zoho CSV first.');
    const asOf=getAsOf(),threshold=Number($('nearHours').value)*60*60*1000;
    const notes=parseNotes($('noteLines').value),manual=parseClosures($('closureLines').value),corrections=parseStatuses($('statusLines').value);
    const previous=parsePreviousViber($('previousViber').value,asOf,state.tickets);
    const warning=[...notes.errors,...manual.errors,...corrections.errors,...previous.warnings];
    const byId=new Map(state.tickets.map(t=>[t.id,t]));
    for(const id of notes.map.keys())if(!byId.has(id))warning.push(`Remark for #${id} has no matching ticket in the CSV.`);
    for(const id of manual.map.keys())if(!byId.has(id))warning.push(`Closed entry #${id} is not present in the CSV and was skipped.`);
    for(const id of corrections.map.keys())if(!byId.has(id))warning.push(`Status correction for #${id} has no matching ticket in the CSV.`);
    const buckets={high1:[],high2:[],overdue:[],near:[],open:[],hold:[],resolved:[],closed:[]};
    const active=[];let closedCannotDetermine=0,excludedUnassigned=0;
    const assignedOnly=$('assignedOnly').checked;
    for(const original of state.tickets){
      const manualClosed=manual.map.get(original.id);
      const corrected=corrections.map.get(original.id);
      const oldClosed=previous.closures.get(original.id);
      // Explicit newest remarks override older pasted Viber notes.
      const t={...original,note:notes.map.get(original.id)||previous.remarks.get(original.id)||'',closed:manualClosed?.closed||original.closed||oldClosed||null};
      if(corrected){t.status=corrected.status;if(corrected.hold)t.hold=corrected.hold;}
      if(manualClosed?.extra)t.note=[t.note,manualClosed.extra].filter(Boolean).join(' - ');
      if(manualClosed&&!isClosed(original.status))warning.push(`Manual closure for #${t.id} differs from CSV status (${original.status||'blank'}). Verify before sending.`);
      // Closed on report date is independent of the Assigned-only filter:
      // every confirmed closure belongs in the closed section.
      if(manualClosed || oldClosed || isClosed(t.status)){
        if(t.closed && sameDay(t.closed,asOf))buckets.closed.push(t);
        else if(!t.closed)closedCannotDetermine++;
        continue;
      }
      if(assignedOnly&&!t.owner){excludedUnassigned++;continue;}
      if(t.created&&t.created.getTime()>asOf.getTime())continue;
      active.push(t);
      if(/^sev\s*1$/i.test(t.severity)){buckets.high1.push(t);continue;}
      if(/^sev\s*2$/i.test(t.severity)){buckets.high2.push(t);continue;}
      if(isHold(t.status)){buckets.hold.push(t);continue;}
      if(isResolved(t.status)){buckets.resolved.push(t);continue;}
      if(t.due&&(t.due.getTime()<asOf.getTime()) || t.overdue){buckets.overdue.push(t);continue;}
      if(t.due&&t.due.getTime()-asOf.getTime()<=threshold){buckets.near.push(t);continue;}
      buckets.open.push(t);
    }
    const sortDue=(a,b)=>(a.due?.getTime()??Infinity)-(b.due?.getTime()??Infinity)||Number(a.id)-Number(b.id);
    const sortHold=(a,b)=>(a.hold?.getTime()??Infinity)-(b.hold?.getTime()??Infinity)||Number(a.id)-Number(b.id);
    buckets.high1.sort(sortDue);buckets.high2.sort(sortDue);buckets.overdue.sort(sortDue);buckets.near.sort(sortDue);buckets.open.sort(sortDue);buckets.hold.sort(sortHold);buckets.resolved.sort(sortDue);
    buckets.closed.sort((a,b)=>(a.closed?.getTime()??0)-(b.closed?.getTime()??0));
    if(closedCannotDetermine)warning.push(`The export does not give closing times for ${closedCannotDetermine} closed tickets; these cannot be assigned to ${dayTitle(asOf)} without confirmation.`);
    if(state.exportedAt && Math.abs(state.exportedAt-asOf)>24*60*60*1000)warning.push('The selected report time is more than one day from the CSV export time; verify ticket statuses.');
    if(manual.map.size)warning.push('Manually supplied closing times are included; verify them against Zoho Desk.');
    if(corrections.map.size)warning.push(`${corrections.map.size} status override(s) applied. Verify the latest Zoho ticket status.`);
    if(excludedUnassigned)warning.push(`${excludedUnassigned} active tickets without an assigned engineer were excluded. Uncheck “Assigned tickets only” to include them.`);
    if(previous.matched)warning.push(`Previous Viber update matched ${previous.matched} ticket line(s), carried forward ${previous.remarks.size} ticket remark(s), and supplied ${previous.closures.size} confirmed same-day closing time(s). Review all carried-over notes.`);
    const who=t=>t.owner||'Owner not provided';
    const extra=t=>t.note?' - '+t.note:'';
    const due=t=>t.due?`${sameDay(t.due,asOf)?'Due today '+timeOnly(t.due):stamp(t.due)}`:'Due date not provided';
    const severity=t=>t.severity?` - ${t.severity}`:'';
    const showStatus=t=>t.status&&!/^(open|escalated\s+to\s+sandz)$/i.test(t.status)?t.status:'';
    const nonopen=t=>showStatus(t)?` - ${showStatus(t)}`:'';
    const list=(title,items,format)=>[title,items.length?items.map(format).join('\n'):'None',''].join('\n');
    const lines=['Updated List of tickets','=============================================',''];
    lines.push(list('New High Severity Ticket (SEVERITY 1)',buckets.high1,t=>`#${t.id} - ${t.company||'Customer not provided'} - ${due(t)} - ${who(t)}${showStatus(t)?' - ('+showStatus(t)+')':''}${extra(t)}`));
    lines.push(list('High Severity Ticket (Sev 2)',buckets.high2,t=>`#${t.id} - ${t.company||'Customer not provided'} - ${due(t)} - ${who(t)}${nonopen(t)}${extra(t)}`));
    lines.push(list('Overdue Tickets:',buckets.overdue,t=>`#${t.id} - ${t.due?stamp(t.due):'Due date not provided'} - ${who(t)}${nonopen(t)}${extra(t)}`));
    lines.push(list('Tickets Nearing Overdue:',buckets.near,t=>`#${t.id} - ${t.due?stamp(t.due):'Due date not provided'} - ${who(t)}${nonopen(t)}${extra(t)}`));
    lines.push(list('Open Tickets:',buckets.open,t=>`#${t.id} - ${t.due?stamp(t.due):'Due date not provided'} - ${who(t)}${nonopen(t)}${extra(t)}`));
    lines.push(list('On hold tickets:',buckets.hold,t=>`#${t.id} - ${t.hold?'On Hold Time '+stamp(t.hold):'On Hold Time not provided'} - ${who(t)}${extra(t)}`));
    if(buckets.resolved.length)lines.push(list('Resolved / For closing tickets:',buckets.resolved,t=>`#${t.id} - ${t.due?stamp(t.due):'Due date not provided'} - ${who(t)} - ${t.status}${extra(t)}`));
    lines.push(list('Ticket Closed as of '+dayTitle(asOf),buckets.closed,t=>`${/^sev\s*[12]$/i.test(t.severity)?`High Severity Ticket (${t.severity}) - ${t.company||'Customer not provided'} - `:''}#${t.id} - Closed time ${stamp(t.closed)} - ${who(t)}${extra(t)}`));
    const output=lines.join('\n').replace(/\n{3,}/g,'\n\n').trim();
    return {buckets,active,warning,output,asOf,closedCannotDetermine,assignedOnly,previous};
  }
  function updateReview(){
    if(!state.tickets.length)return;
    const term=h($('search').value).toLowerCase();
    const rows=state.tickets.filter(t=>!isClosed(t.status)&&(!$('assignedOnly').checked||t.owner)&&(t.id+' '+t.company+' '+t.owner+' '+t.subject).toLowerCase().includes(term)).slice(0,180);
    $('reviewRows').replaceChildren();
    for(const t of rows){
      const tr=document.createElement('tr');
      [t.id,t.company||'—',t.severity||'—',t.status||'—',t.due?stamp(t.due,true):'—',t.owner||'—'].forEach((value,i)=>{const td=document.createElement('td');td.textContent=i===0?'#'+value:value;if(i===1)td.className='wrap';tr.appendChild(td);});
      $('reviewRows').appendChild(tr);
    }
    $('tableEmpty').hidden=rows.length>0;
    $('rowCountHint').textContent=`${rows.length} visible records • Active/pending tickets • Search by number, company, or engineer`;
  }
  function doGenerate(){
    try{
      const result=compile();state.report=result.output;
      $('preview').textContent=result.output;$('preview').classList.remove('empty');
      $('stats').hidden=false;$('reviewCard').hidden=false;
      $('countActive').textContent=String(result.active.length);
      $('countOverdue').textContent=String(result.buckets.overdue.length);
      $('countNear').textContent=String(result.buckets.near.length);
      $('countHold').textContent=String(result.buckets.hold.length);
      $('countClosed').textContent=String(result.buckets.closed.length);
      $('copyReport').disabled=false;
      $('previewHint').textContent='';
      $('reviewWarnings').hidden=result.warning.length===0;
      $('reviewWarningSummary').textContent=`Check ${result.warning.length} item${result.warning.length===1?'':'s'}`;
      $('reviewStatus').className='notice warn';
      $('reviewStatus').textContent=result.warning.join('  •  ');
      updateReview();$('outputCard').scrollIntoView({behavior:'smooth',block:'start'});
    }catch(e){$('importStatus').className='notice warn';$('importStatus').textContent=e.message;}
  }
  async function importFile(file){
    if(!file)return;
    if(!/\.csv$/i.test(file.name)&&file.type!=='text/csv'){$('importStatus').textContent='Please choose a .csv file.';return;}
    try{
      const content=await file.text();
      const parsed=importRecords(content);
      Object.assign(state,parsed,{source:file.name,report:''});
      $('dropzone').classList.add('loaded');$('fileSymbol').textContent='✓';
      $('fileInfo').textContent=`${file.name} • ${state.tickets.length} ticket rows`;
      $('asOf').value=localInput(parsed.exportedAt||new Date());
      $('generateBtn').disabled=false;
      $('importStatus').className='notice ok';
      $('importStatus').textContent=`${state.tickets.length} tickets loaded.${parsed.missingCloseColumn?' Add closed times in previous update if needed.':''}`;
      $('preview').textContent='';$('preview').classList.add('empty');
      $('copyReport').disabled=true;$('stats').hidden=true;$('reviewCard').hidden=true;
    }catch(e){$('importStatus').className='notice warn';$('importStatus').textContent='Could not read CSV: '+e.message;}
  }
  $('csvInput').addEventListener('change',e=>importFile(e.target.files[0]));
  for(const evt of ['dragenter','dragover'])$('dropzone').addEventListener(evt,e=>{e.preventDefault();$('dropzone').classList.add('drag');});
  for(const evt of ['dragleave','drop'])$('dropzone').addEventListener(evt,e=>{e.preventDefault();$('dropzone').classList.remove('drag');});
  $('dropzone').addEventListener('drop',e=>importFile(e.dataTransfer.files[0]));
  $('generateBtn').addEventListener('click',doGenerate);
  $('search').addEventListener('input',updateReview);
  $('assignedOnly').addEventListener('change',()=>{if(state.report)doGenerate();});
  $('copyReport').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(state.report);$('copyReport').textContent='Copied!';setTimeout(()=>$('copyReport').textContent='Copy message',1600);}
    catch{const sel=window.getSelection(),range=document.createRange();range.selectNodeContents($('preview'));sel.removeAllRanges();sel.addRange(range);$('copyReport').textContent='Select and copy text';}
  });

  $('asOf').value=localInput(new Date());
  window.addEventListener('message',event=>{
    if(event.source!==window.parent||!event.data||event.data.type!=='MAU_APPEARANCE')return;
    document.body.classList.toggle('theme-dark',!!event.data.dark);
  });
})();
