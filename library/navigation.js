/* Lightweight app navigation. Keeps existing ticket workspace and its state intact. */
(() => {
  'use strict';
  const tickets=document.getElementById('navTickets');
  const monde=document.getElementById('navMonde');
  const followup=document.getElementById('navFollowup');
  const csa=document.getElementById('navCsa');
  const managed=document.getElementById('navManagedTickets');
  const topTickets=document.getElementById('topSwitchTickets');
  const topMonde=document.getElementById('topSwitchMonde');
  const topFollowup=document.getElementById('topSwitchFollowup');
  const topCsa=document.getElementById('topSwitchCsa');
  const topManaged=document.getElementById('topSwitchManaged');
  const newWorkspace=document.getElementById('sidebarNewWorkspaceBtn');
  const main=document.getElementById('mainArea');
  const reporting=document.getElementById('reportingPane');
  const followupPane=document.getElementById('followupPane');
  const csaPane=document.getElementById('csaPane');
  const managedPane=document.getElementById('managedTicketPane');
  const status=document.getElementById('statusBar');

  function syncViewButtons(view){
    [[tickets,topTickets,'tickets'],[monde,topMonde,'monde'],[followup,topFollowup,'followup'],[managed,topManaged,'managed'],[csa,topCsa,'csa']].forEach(([a,b,target])=>{
      for(const el of [a,b]){
        if(!el)continue;
        const active=view===target;
        el.classList.toggle('active',active);
        el.setAttribute('aria-selected',String(active));
        el.setAttribute('aria-current',active?'page':'false');
      }
    });
  }

  function activate(view){
    main.hidden=view!=='tickets';
    reporting.hidden=view!=='monde';
    followupPane.hidden=view!=='followup';
    csaPane.hidden=view!=='csa';
    managedPane.hidden=view!=='managed';
    status.hidden=view!=='tickets';
    syncViewButtons(view);

    document.getElementById('toolbarTitle').textContent=({
      tickets:'Ticket Workspace',
      monde:'Monde Nissin Report',
      followup:'Viber Follow-up',
      managed:'Managed Services Tickets',
      csa:'CSA Generator'
    })[view];
    document.getElementById('toolbarSubtitle').textContent=({
      tickets:'Chat',
      monde:'Daily Zerto monitoring report',
      followup:'Zoho ticket status updates from CSV',
      managed:'Prepare and autofill Managed Services tickets',
      csa:'Managed Services document generation'
    })[view];

    if(view==='tickets'&&window.editor&&typeof window.editor.resize==='function')requestAnimationFrame(()=>window.editor.resize());
    const newHash=({
      tickets:'#tickets',
      monde:'#reporting/monde',
      followup:'#reporting/viber-followup',
      managed:'#managed-services/tickets',
      csa:'#managed-services/csa-generator'
    })[view];
    if(window.location.hash!==newHash)history.replaceState(null,'',newHash);
    if(view==='followup'||view==='csa'||view==='managed')syncThemePreferenceButton();
  }

  tickets?.addEventListener('click',()=>activate('tickets'));
  monde?.addEventListener('click',()=>activate('monde'));
  followup?.addEventListener('click',()=>activate('followup'));
  csa?.addEventListener('click',()=>activate('csa'));
  managed?.addEventListener('click',()=>activate('managed'));
  topTickets?.addEventListener('click',()=>activate('tickets'));
  topMonde?.addEventListener('click',()=>activate('monde'));
  topFollowup?.addEventListener('click',()=>activate('followup'));
  topCsa?.addEventListener('click',()=>activate('csa'));
  topManaged?.addEventListener('click',()=>activate('managed'));

  if(newWorkspace)newWorkspace.addEventListener('click',()=>{
    activate('tickets');
    const createSession=document.getElementById('newChatSessionBtn');
    if(createSession)createSession.click();
  });

  const notesButton=document.getElementById('toggleNotesBtn');
  if(notesButton) notesButton.addEventListener('click',()=>{
    const collapsed=document.body.classList.toggle('workspace-collapsed');
    notesButton.textContent=collapsed?'Show notes':'Hide notes';
    notesButton.setAttribute('aria-expanded',String(!collapsed));
    if(window.editor?.resize) requestAnimationFrame(()=>window.editor.resize());
  });

  const themeButton=document.getElementById('themePreferenceButton');
  const themeLabel=document.getElementById('themePreferenceText');
  const themeIcon=document.getElementById('themePreferenceIcon');
  window.syncThemePreferenceButton=function(){
    const isDark=document.body.classList.contains('theme-dark');
    if(themeButton){
      themeButton.setAttribute('aria-label',isDark?'Switch to light mode':'Switch to dark mode');
      themeButton.setAttribute('title',isDark?'Switch to light mode':'Switch to dark mode');
      themeButton.setAttribute('aria-pressed',String(isDark));
    }
    if(themeLabel)themeLabel.textContent=isDark?'Light mode':'Dark mode';
    if(themeIcon)themeIcon.textContent=isDark?'☀':'☾';
    ['mondeFrame','followupFrame','csaFrame','managedTicketFrame'].forEach(id=>{
      const frame=document.getElementById(id);
      if(frame && frame.contentWindow){
        frame.contentWindow.postMessage({type:'MAU_APPEARANCE',dark:isDark},'*');
      }
    });
  };
  if(themeButton)themeButton.addEventListener('click',()=>{
    if(typeof window.toggleTheme==='function') window.toggleTheme();
  });

  function sendManagedProfile(){
    const frame=document.getElementById('managedTicketFrame');
    if(frame?.contentWindow)frame.contentWindow.postMessage({
      type:'MAU_PROFILE', profileId:window.MAUActiveProfileId||'guest',
      supportAgent:typeof window.getActiveSupportAgent==='function' ? window.getActiveSupportAgent() : ''
    },'*');
  }
  function sendMondeProfile(){
    const frame=document.getElementById('mondeFrame');
    if(frame?.contentWindow)frame.contentWindow.postMessage({type:'MAU_PROFILE',profileId:window.MAUActiveProfileId||'guest'},'*');
  }
  for(const id of ['mondeFrame','followupFrame','csaFrame','managedTicketFrame']){
    const frame=document.getElementById(id);
    if(frame)frame.addEventListener('load',()=>{
      window.syncThemePreferenceButton();
      if(id==='mondeFrame')sendMondeProfile();
      if(id==='managedTicketFrame') sendManagedProfile();
    });
  }
  window.addEventListener('mau:profilechange',sendMondeProfile);
  window.addEventListener('mau:profilechange',sendManagedProfile);
  window.syncThemePreferenceButton();

  const aiButton=document.getElementById('openTeamAiBtn');
  if (aiButton) aiButton.addEventListener('click',()=>{
    activate('tickets');
    const chat = document.getElementById('chatBotContainer');
    if (chat && getComputedStyle(chat).display==='none' && typeof window.toggleDisplayChatBotContainer==='function') window.toggleDisplayChatBotContainer();
    const input=document.getElementById('chat-input');if(input) input.focus();
  });

  // Managed Shared Service stays in its own frame. The parent performs Gemini and
  // Zoho actions, so API keys and extension bridge details are not copied to the frame.
  window.addEventListener('message',async event=>{
    const frame=document.getElementById('managedTicketFrame');
    if(!frame || event.source!==frame.contentWindow) return;
    if(location.protocol!=='file:' && event.origin!==location.origin) return;
    const message=event.data||{};
    if(message.type==='MAU_MANAGED_READY'){
      sendManagedProfile();
      window.syncThemePreferenceButton?.();
      return;
    }
    if(message.type!=='MAU_MANAGED_REQUEST' || !/^ms-[0-9]+-[0-9]+$/.test(String(message.requestId||'')))return;
    const reply=(ok,response,error)=>{
      if(frame.contentWindow)frame.contentWindow.postMessage({type:'MAU_MANAGED_RESULT',requestId:message.requestId,ok,response,error},'*');
    };
    try{
      if(message.action==='gemini'){
        const info=message.data||{};
        const prompt=String(info.text||'').slice(0,33000);
        if(!prompt)throw new Error('Enter your request first.');
        const images=Array.isArray(info.images)?info.images.slice(0,4):[];
        if(!window.MAUUserGemini?.hasKey())throw new Error('Add your Gemini API key from the MAU toolbar, then try again.');
        const result=await window.MAUUserGemini.generate({model:'gemini-3.5-flash-lite',messages:[{role:'user',text:prompt,images}]});
        reply(true,{text:result.text});
      }else if(message.action==='autofill'){
        const payload=message.data?.payload;
        if(!payload || payload.source!=='Managed Services Ticket Workspace')throw new Error('Prepare a Managed Services ticket first.');
        const result=await window.TicketAssistantZohoAutofill.openManagedServicesPayload(payload,message.data?.newTicketUrl);
        reply(true,result);
      }else{
        reply(false,null,'Unsupported action.');
      }
    }catch(error){reply(false,null,String(error?.message||'Could not complete the action.'));}
  });

  const hash=location.hash;
  activate(hash.includes('managed-services/tickets')?'managed':hash.includes('managed-services/csa-generator')?'csa':hash.includes('reporting/viber-followup')?'followup':hash.includes('reporting/monde')?'monde':'tickets');
})();
