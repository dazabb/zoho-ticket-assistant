(function () {
  'use strict';
  const M=window.MAUManagedTicket;
  const $=id=>document.getElementById(id);
  const fields=[
    ['company','Customer Company Name'],['accountName','Account Name'],
    ['storeName','Store / Site'],['customerLocationAddress','Customer Location Address'],
    ['subject','Subject','textarea'],['issueDescription','Issue Description'],
    ['ticketCategory','Ticket Category','category'],['issueCategory','Issue Category'],
    ['issueSubCategory','Issue Sub-Category'],['serialNumber','Serial Number'],
    ['severityLevel','Severity Level','severity'],['priority','Priority','priority'],
    ['supportLevel','Support Level'],['supportAgent','Support Agent'],
    ['assignedEngineer','Assigned Engineer'],['contactName','Contact Name'],
    ['mobileNumber','Mobile Number'],['channel','Channel','channel'],
    ['engineerTasks','Engineer Task / Activity','tasks'],['description','Description','textarea']
  ];
  const state={profileId:'guest',draft:null,mode:'zoho',images:[],messages:{zoho:[],email:[],notes:[]},busy:false,
    emailWasEdited:false,notesWasEdited:false,sessions:[],activeSessionId:''};
  const SESSIONS_PREFIX='mauManagedTicketsV01::';
  const ZOHO_URL_KEY='mauManagedNewZohoUrlV1';
  const DEFAULT_URL='https://helpcenter.amti.com.ph/agent/amtiphilippines/sandz/tickets/new';
  const profiles={'mauris-mananzan':'Mauris Mananzan','jacob-labor':'Jacob Labor','arthur-mejia':'Arthur Mejia'};
  let requestCounter=0;
  const pending=new Map();
  function text(v){return String(v==null?'':v).trim();}
  function safeStorage(key,val){try {if(val===undefined)return localStorage.getItem(key);localStorage.setItem(key,val);}catch(_){return null;}}
  function sessionKey(){return SESSIONS_PREFIX+state.profileId;}
  function sessionHistoryKey(){return sessionKey()+'::history';}
  function show(message,kind=''){const el=$('status');el.textContent=message;el.className='status'+(kind?' is-'+kind:'');}
  function save(){
    if(!state.draft)return;
    // Never persist screenshots or Gemini keys. Conversations belong to this MAU profile on this browser.
    const data={draft:state.draft,source:$('source').value.slice(0,30000),messages:state.messages,
      email:$('emailText').value,notes:$('notesText').value,emailWasEdited:state.emailWasEdited,notesWasEdited:state.notesWasEdited};
    safeStorage(sessionKey(),JSON.stringify(data));
    if(!state.activeSessionId)state.activeSessionId='ms-'+Date.now();
    const summary={id:state.activeSessionId,updated:Date.now(),title:(state.draft.subject||state.draft.company||'Untitled').slice(0,110),data:{...data,source:data.source.slice(0,16000)}};
    state.sessions=[summary,...state.sessions.filter(s=>s.id!==summary.id)].slice(0,12);
    safeStorage(sessionHistoryKey(),JSON.stringify(state.sessions));
    renderHistory();
  }
  function renderHistory(){
    const area=$('history');area.replaceChildren();
    area.hidden=!state.sessions.length;
    if(!state.sessions.length)return;
    const title=document.createElement('h3');title.textContent='Recent Managed Services tickets';area.append(title);
    const list=document.createElement('div');list.className='history-list';
    for(const item of state.sessions.slice(0,8)){
      const btn=document.createElement('button');btn.type='button';btn.textContent=item.title;
      btn.setAttribute('title',item.title);btn.addEventListener('click',()=>{
        state.activeSessionId=item.id;
        const data=item.data||{};state.draft=M.sanitize(data.draft||{});
        state.messages={zoho:[],email:[],notes:[]};
        for(const m of ['zoho','email','notes'])state.messages[m]=Array.isArray(data.messages?.[m])?data.messages[m].slice(-12):[];
        state.emailWasEdited=!!data.emailWasEdited;state.notesWasEdited=!!data.notesWasEdited;
        $('source').value=data.source||'';clearScreens();setMode('zoho');
        if(state.emailWasEdited)$('emailText').value=data.email||'';
        if(state.notesWasEdited)$('notesText').value=data.notes||'';
        show('Saved ticket loaded.');
      });list.append(btn);
    }
    area.append(list);
  }
  function loadProfile(id){
    const desired=text(id)||'guest';
    if(desired===state.profileId && state.draft)return;
    clearScreens();
    state.profileId=desired;
    state.draft=null;state.images=[];state.messages={zoho:[],email:[],notes:[]};state.emailWasEdited=false;state.notesWasEdited=false;state.activeSessionId='';state.sessions=[];
    $('source').value='';$('emailText').value='';$('notesText').value='';$('emailTicketNumber').value='';
    try {
      state.sessions=JSON.parse(safeStorage(sessionHistoryKey())||'[]');if(!Array.isArray(state.sessions))state.sessions=[];
      const parsed=JSON.parse(safeStorage(sessionKey())||'null');
      if(parsed?.draft && typeof parsed.draft==='object'){
        state.draft=M.sanitize(parsed.draft);
        state.activeSessionId=state.sessions[0]?.id||'';
        $('source').value=text(parsed.source);
        if(parsed.messages && typeof parsed.messages==='object') {
          for(const mode of ['zoho','email','notes'])state.messages[mode]=Array.isArray(parsed.messages[mode])?parsed.messages[mode].slice(-12):[];
        }
        state.emailWasEdited=!!parsed.emailWasEdited;
        state.notesWasEdited=!!parsed.notesWasEdited;
        render();
        if(state.emailWasEdited)$('emailText').value=text(parsed.email);
        if(state.notesWasEdited)$('notesText').value=text(parsed.notes);
        show('Your previous draft is ready.');
        renderAttachments();renderHistory();return;
      }
    }catch(_){ /* storage is optional */ }
    render();renderAttachments();renderHistory();
    show('Ready for your request.');
  }
  function dispatch(action,data){
    return new Promise((resolve,reject)=>{
      const id='ms-'+Date.now()+'-'+(++requestCounter);
      const timeout=setTimeout(()=>{pending.delete(id);reject(new Error('MAU did not respond. Reload the page and try again.'));},70000);
      pending.set(id,{resolve,reject,timeout});
      try{parent.postMessage({type:'MAU_MANAGED_REQUEST',requestId:id,action,data},'*');}
      catch(err){clearTimeout(timeout);pending.delete(id);reject(err);}
    });
  }
  function renderFields(){
    const root=$('ticketFields');root.replaceChildren();
    if(!state.draft)return;
    for(const [key,label,kind] of fields){
      const wrapper=document.createElement('div');wrapper.className='field'+(kind==='textarea'||kind==='tasks'?' span':'');
      const title=document.createElement('label');title.textContent=label;title.htmlFor='field-'+key;wrapper.append(title);
      let control;
      if(kind==='textarea'||kind==='tasks'){
        control=document.createElement('textarea');
        if(kind==='tasks') control.className='tasks';
      } else if(['category','severity','priority','channel'].includes(kind)) {
        control=document.createElement('select');
        const options=kind==='category'?['','Request','Incident']:
          kind==='severity'?['','Sev1','Sev2','Sev3','Sev4']:
          kind==='priority'?['','Low','Medium','High','Urgent']:['','Email','Web','Phone','Chat'];
        for(const value of options){const opt=document.createElement('option');opt.value=value;opt.textContent=value||'Select';control.append(opt);}
      } else {control=document.createElement('input');control.type='text';}
      control.id='field-'+key;
      control.value=key==='engineerTasks'?state.draft.engineerTasks.join('\n'):text(state.draft[key]);
      control.addEventListener('input',()=>onFieldChange(key,control.value));
      control.addEventListener('change',()=>onFieldChange(key,control.value));
      wrapper.append(control);
      if(key==='issueSubCategory') {
        const help=document.createElement('span');help.className='hint';help.textContent='Review the available options in your Managed Services layout.';wrapper.append(help);
      }
      root.append(wrapper);
    }
  }
  function onFieldChange(key,value){
    if(!state.draft)return;
    if(key==='engineerTasks')state.draft[key]=value.split('\n').map(x=>x.replace(/^\s*[-*•\d.)]+\s*/,'').trim()).filter(Boolean);
    else state.draft[key]=value;
    if(key==='serialNumber'){
      const prior=state.draft.subject;
      state.draft.serialNumber=M.serialClean(value);
      state.draft.subject=M.makeSubject(state.draft,prior);
      const subjectEl=$('field-subject');if(subjectEl)subjectEl.value=state.draft.subject;
    }
    if(key==='ticketCategory' && !state.draft.severityLevel){
      state.draft.severityLevel=value==='Request'?'Sev4':'Sev3';
      const severityEl=$('field-severityLevel');if(severityEl)severityEl.value=state.draft.severityLevel;
    }
    syncSupportingDrafts();save();
  }
  function syncSupportingDrafts(){
    if(!state.draft)return;
    if(!state.emailWasEdited)$('emailText').value=M.email(state.draft);
    if(!state.notesWasEdited)$('notesText').value=M.notes(state.draft);
    $('emailTicketNumber').value=text(state.draft.ticketNumber);
  }
  function renderMessages(){
    const root=$('modeMessages');root.replaceChildren();
    const messages=state.messages[state.mode]||[];
    for(const m of messages){
      const el=document.createElement('div');el.className='message '+(m.role==='user'?'user':'assistant');
      el.textContent=text(m.text).slice(0,6500);root.append(el);
    }
    $('modeChat').hidden=!state.draft;
    root.scrollTop=root.scrollHeight;
  }
  function render(){
    const exists=!!state.draft;
    $('emptyState').hidden=exists;
    $('createTicket').disabled=!exists;
    $('improve').disabled=!exists;
    $('copyFields').disabled=!exists;
    $('resultHint').textContent=exists? (state.draft.company||'Customer name needed')+(state.draft.serialNumber?' · '+state.draft.serialNumber:' · Serial number not provided') :'Your ticket will appear here after generating.';
    $('zohoView').hidden=!(exists&&state.mode==='zoho');
    $('emailView').hidden=!(exists&&state.mode==='email');
    $('notesView').hidden=!(exists&&state.mode==='notes');
    if(exists){renderFields();syncSupportingDrafts();}
    document.querySelectorAll('.tab').forEach(btn=>{
      const is=btn.dataset.mode===state.mode;
      btn.classList.toggle('active',is);btn.setAttribute('aria-selected',String(is));
    });
    renderMessages();
  }
  function setMode(next){state.mode=next;render();}
  function clearScreens(){for(const im of state.images){if(im.preview)URL.revokeObjectURL(im.preview);}state.images=[];renderAttachments();}
  function renderAttachments(){
    const root=$('attachments');root.replaceChildren();root.hidden=!state.images.length;
    for(let i=0;i<state.images.length;i++){
      const im=state.images[i];const chip=document.createElement('div');chip.className='thumbnail';
      const picture=document.createElement('img');picture.src=im.preview;picture.alt=im.name;
      const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove '+im.name);
      remove.addEventListener('click',()=>{URL.revokeObjectURL(im.preview);state.images.splice(i,1);renderAttachments();});
      const name=document.createElement('span');name.textContent=im.name;
      chip.append(picture,remove,name);root.append(chip);
    }
  }
  async function addImages(files){
    for(const file of files){
      if(state.images.length>=4){show('You can attach up to four screenshots.','error');break;}
      if(!/^image\/(?:png|jpeg|webp)$/.test(file.type)||file.size>7_000_000){show('Please use a PNG, JPG or WebP screenshot under 7 MB.','error');continue;}
      const base64=await new Promise((resolve,reject)=>{
        const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(file);
      });
      state.images.push({name:file.name||'Screenshot',mimeType:file.type,data:base64,preview:URL.createObjectURL(file)});
    }
    renderAttachments();
  }
  async function generate(){
    if(state.busy)return;
    const raw=text($('source').value);
    if(!raw&&!state.images.length){show('Paste a ticket or add a screenshot first.','error');return;}
    clearMessages();
    state.draft=M.extract(raw,{id:state.profileId,name:profiles[state.profileId]||''});
    state.emailWasEdited=false;state.notesWasEdited=false;
    state.mode='zoho';render();
    save();
    if(state.images.length){
      await improve(true);
    }else{
      show(state.draft.engineerTasks.length?'Ticket prepared. Review the fields before opening Zoho.':'Ticket prepared. Add the requested engineer activities if needed.','success');
    }
  }
  function clearMessages(){state.messages={zoho:[],email:[],notes:[]};}
  function parseJsonResponse(raw){
    const stripped=text(raw).replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'');
    try{return JSON.parse(stripped);}catch(_){
      const start=stripped.indexOf('{'),end=stripped.lastIndexOf('}');
      if(start>=0 && end>start){try{return JSON.parse(stripped.slice(start,end+1));}catch(_){}}
    }
    return null;
  }
  async function improve(fromScreenshot=false){
    if(state.busy||!state.draft)return;
    const source=text($('source').value);
    if(!fromScreenshot&&!source){show('Paste the ticket first.','error');return;}
    state.busy=true;$('generate').disabled=true;$('improve').disabled=true;
    const requestProfile=state.profileId, requestDraft=state.draft;
    show('Preparing the ticket with Gemini…');
    const prompt=[
      'You are helping AMTI Managed Shared Service staff with an existing customer request. This is NOT the SANDZ MS/SI/DRaaS ticket layout.',
      'Review ONLY the selected customer request and attached screenshots. The original customer request has priority over unrelated technician status replies.',
      'Return ONLY a compact JSON object using these keys: company, accountName, storeName, customerLocationAddress, serialNumber, issueDescription, ticketCategory, issueCategory, issueSubCategory, description, engineerTasks (array).',
      'Do not invent ticket numbers, serial numbers, sites, engineer assignments or completed actions. Do not copy a technician update for another store/device.',
      'For hardware provisioning or scheduled upgrade: Request. For existing failed, slow, damaged, or nonworking equipment: Incident unless the selected Zoho ticket explicitly states otherwise.',
      'Preserve exact serial case and values; use short issue descriptions. Put actual planned activities under engineerTasks, not packing lists or technician tools.',
      'Ticket source (may include unrelated Zoho lists and subsequent comments):\n'+source.slice(0,25000)
    ].join('\n\n');
    try{
      const ai=await dispatch('gemini',{text:prompt,images:state.images.map(({mimeType,data})=>({mimeType,data}))});
      if(state.profileId!==requestProfile||state.draft!==requestDraft)return;
      const values=parseJsonResponse(ai.text||'');
      if(!values||typeof values!=='object'){
        state.messages.zoho.push({role:'assistant',text:'Gemini returned suggestions, but the ticket fields need review.'});
        show('Ticket prepared. Review the details below.');
      }else{
        const existing=state.draft;
        // Existing Zoho fields and explicit customer request are authoritative.
        const onlyIfMissing=['company','accountName','storeName','customerLocationAddress','issueDescription','issueSubCategory','description'];
        for(const key of onlyIfMissing){if(!text(existing[key])&&text(values[key]))existing[key]=text(values[key]).slice(0,600);}
        if(!existing.serialNumber && values.serialNumber){const s=M.serialClean(values.serialNumber);if(s)existing.serialNumber=s;}
        if(!existing.evidence?.category&&['Request','Incident'].includes(values.ticketCategory)){
          // Do not reclassify explicitly described existing failures as a request.
          const isExistingFailure=/(?:failed|lagg|slow|not working|bugdown|unreachable|outage)/i.test(source.slice(0,5000));
          existing.ticketCategory=isExistingFailure?'Incident':values.ticketCategory;
        }
        if(!existing.engineerTasks.length&&Array.isArray(values.engineerTasks)){
          existing.engineerTasks=values.engineerTasks.filter(x=>typeof x==='string'&&!/^(?:screwdriver|usb flash|rj45|thermal paste|tools to bring)/i.test(x)).slice(0,12);
        }
        existing.subject=M.makeSubject(existing,existing.subject);
        state.messages.zoho.push({role:'assistant',text:'Reviewed the request and screenshots. The ticket fields are ready to check.'});
        show('Ticket ready. Review the details before autofill.','success');
      }
      state.images.length && clearScreens();
      render();save();
    }catch(e){show(e?.message||'Could not complete Gemini review. Your draft is still available.','error');}
    finally{state.busy=false;$('generate').disabled=false;$('improve').disabled=!state.draft;}
  }
  function modeText(){
    return state.mode==='zoho'?JSON.stringify(M.payload(state.draft).fields,null,2):
      state.mode==='email'?$('emailText').value:$('notesText').value;
  }
  async function followup(){
    if(state.busy||!state.draft)return;
    const question=text($('followQuestion').value);
    if(!question){show('Type your question first.','error');return;}
    const mode=state.mode;
    const requestProfile=state.profileId, requestDraft=state.draft;
    state.messages[mode].push({role:'user',text:question});renderMessages();$('followQuestion').value='';
    state.busy=true;$('sendFollow').disabled=true;
    show('Asking Gemini…');
    try{
      const context=modeText();
      const messages=state.messages[mode].slice(-5).map(m=>`${m.role==='user'?'Employee':'Assistant'}: ${m.text}`).join('\n');
      const prompt=`You are preparing a ${mode==='zoho'?'Managed Shared Service Zoho ticket':mode==='email'?'formal AMTI customer email':'Managed Shared Service engineer note'}.
Keep this discussion separate from other tabs and do not invent actions or ticket numbers.
Current approved draft:\n${context.slice(0,9000)}\n\nRecent discussion:\n${messages.slice(0,6000)}\n\nAnswer concisely. Do not change verified customer, site, serial or category unless a new source explicitly corrects it.`;
      const response=await dispatch('gemini',{text:prompt,images:[]});
      if(state.profileId!==requestProfile||state.draft!==requestDraft)return;
      state.messages[mode].push({role:'assistant',text:response.text});
      show('Gemini replied. Review it before using any changes.','success');
      renderMessages();save();
    }catch(e){state.messages[mode].push({role:'assistant',text:e?.message||'Gemini could not answer.'});renderMessages();show(e?.message||'Could not reach Gemini.','error');}
    finally{state.busy=false;$('sendFollow').disabled=false;}
  }
  async function copy(v){
    try{await navigator.clipboard.writeText(v);show('Copied.','success');}
    catch(_){
      const ta=document.createElement('textarea');ta.value=v;ta.style.position='fixed';ta.style.left='-10000px';document.body.append(ta);ta.select();
      const ok=document.execCommand('copy');ta.remove();show(ok?'Copied.':'Select the text and copy it manually.',ok?'success':'error');
    }
  }
  async function createZoho(){
    if(state.busy||!state.draft)return;
    const d=M.sanitize(state.draft);
    if(!d.company){show('Enter the Customer Company Name before opening Zoho.','error');setMode('zoho');$('field-company')?.focus();return;}
    if(!d.subject||!d.issueDescription){show('Add a subject and issue description before opening Zoho.','error');setMode('zoho');return;}
    if(/hardware/i.test(d.issueCategory)&&!d.serialNumber&&/(pos|desktop|laptop|hardware provisioning)/i.test(d.subject+' '+d.issueDescription)){
      show('Please enter the device serial number for this hardware ticket.','error');setMode('zoho');$('field-serialNumber')?.focus();return;
    }
    const url=text($('newZohoUrl').value)||DEFAULT_URL;
    if(!/^https:\/\/helpcenter\.amti\.com\.ph\/agent\/amtiphilippines\/[a-z0-9_-]+\/tickets\/new\/?$/i.test(url)){
      show('Check the New Ticket page address under Zoho settings.','error');return;
    }
    safeStorage(ZOHO_URL_KEY,url);
    state.busy=true;$('createTicket').disabled=true;show('Opening Zoho…');
    try{
      const result=await dispatch('autofill',{payload:M.payload(d),newTicketUrl:url});
      show(result?.cancelled?'Cancelled.':'Zoho opened. Please review and save the ticket yourself.','success');
    }catch(e){show(e?.message||'Zoho autofill did not start.','error');}
    finally{state.busy=false;$('createTicket').disabled=false;}
  }
  function newTicket(){
    clearScreens();state.draft=null;state.messages={zoho:[],email:[],notes:[]};state.emailWasEdited=false;state.notesWasEdited=false;state.activeSessionId='';
    $('source').value='';$('emailText').value='';$('notesText').value='';$('emailTicketNumber').value='';
    try{localStorage.removeItem(sessionKey());}catch(_){}
    setMode('zoho');render();renderHistory();show('Ready for a new customer request.');$('source').focus();
  }
  window.addEventListener('message',event=>{
    if(event.source!==parent)return;
    const msg=event.data||{};
    if(msg.type==='MAU_APPEARANCE'){document.body.classList.toggle('dark',!!msg.dark);return;}
    if(msg.type==='MAU_PROFILE'){loadProfile(msg.profileId);return;}
    if(msg.type!=='MAU_MANAGED_RESULT')return;
    const work=pending.get(msg.requestId);if(!work)return;
    pending.delete(msg.requestId);clearTimeout(work.timeout);
    msg.ok?work.resolve(msg.response||{}):work.reject(new Error(msg.error||'Operation failed.'));
  });
  $('generate').addEventListener('click',generate);
  $('improve').addEventListener('click',()=>improve(false));
  $('newTicket').addEventListener('click',newTicket);
  $('createTicket').addEventListener('click',createZoho);
  document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.mode)));
  $('upload').addEventListener('change',async e=>{await addImages(Array.from(e.target.files||[]));e.target.value='';});
  $('source').addEventListener('paste',async e=>{
    const files=Array.from(e.clipboardData?.items||[]).filter(item=>item.kind==='file'&&item.type.startsWith('image/')).map(item=>item.getAsFile()).filter(Boolean);
    if(files.length)await addImages(files);
  });
  const composer=document.querySelector('.composer');
  composer.addEventListener('dragover',e=>{if(Array.from(e.dataTransfer?.types||[]).includes('Files'))e.preventDefault();});
  composer.addEventListener('drop',async e=>{e.preventDefault();await addImages(Array.from(e.dataTransfer?.files||[]));});
  $('source').addEventListener('keydown',e=>{if(e.ctrlKey&&e.key==='Enter'){e.preventDefault();generate();}});
  $('emailText').addEventListener('input',()=>{state.emailWasEdited=true;save();});
  $('notesText').addEventListener('input',()=>{state.notesWasEdited=true;save();});
  $('emailTicketNumber').addEventListener('change',()=>{
    if(!state.draft)return;
    state.draft.ticketNumber=text($('emailTicketNumber').value).replace(/[^0-9]/g,'');
    if(!state.emailWasEdited)$('emailText').value=M.email(state.draft);
    save();
  });
  $('copyFields').addEventListener('click',()=>{
    if(!state.draft)return;const fields=M.payload(state.draft).fields;
    copy(Object.entries(fields).map(([k,v])=>k+': '+v).join('\n'));
  });
  $('copyEmail').addEventListener('click',()=>{
    if(!state.draft)return;
    if(!state.draft.ticketNumber){show('Enter the Zoho ticket number before copying the acknowledgment.','error');$('emailTicketNumber').focus();return;}
    if(!new RegExp('Ticket\\s*#\\s*'+state.draft.ticketNumber+'\\b','i').test($('emailText').value)){show('Include Ticket #'+state.draft.ticketNumber+' in the email before copying.','error');return;}
    copy($('emailText').value);
  });
  $('copyNotes').addEventListener('click',()=>{if(state.draft)copy($('notesText').value);});
  $('sendFollow').addEventListener('click',followup);
  $('followQuestion').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();followup();}});
  $('newZohoUrl').value=safeStorage(ZOHO_URL_KEY)||DEFAULT_URL;
  try{loadProfile(parent.MAUActiveProfileId||'guest');}catch(_){loadProfile('guest');}
  parent.postMessage({type:'MAU_MANAGED_READY'},'*');
})();
