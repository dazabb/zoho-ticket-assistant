/* Lightweight app navigation. Keeps existing ticket workspace and its state intact. */
(() => {
  'use strict';
  const tickets=document.getElementById('navTickets');
  const monde=document.getElementById('navMonde');
  const followup=document.getElementById('navFollowup');
  const topTickets=document.getElementById('topSwitchTickets');
  const topMonde=document.getElementById('topSwitchMonde');
  const topFollowup=document.getElementById('topSwitchFollowup');
  const newWorkspace=document.getElementById('sidebarNewWorkspaceBtn');
  const main=document.getElementById('mainArea');
  const reporting=document.getElementById('reportingPane');
  const followupPane=document.getElementById('followupPane');
  const status=document.getElementById('statusBar');
  function syncViewButtons(view){
    [[tickets,topTickets,'tickets'],[monde,topMonde,'monde'],[followup,topFollowup,'followup']].forEach(([a,b,target])=>{
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
    status.hidden=view!=='tickets';
    syncViewButtons(view);
    document.getElementById('toolbarTitle').textContent=({tickets:'Ticket Workspace',monde:'Monde Nissin Report',followup:'Viber Follow-up'})[view];
    document.getElementById('toolbarSubtitle').textContent=({tickets:'Chat',monde:'Daily Zerto monitoring report',followup:'Zoho ticket status updates from CSV'})[view];
    if(view==='tickets'&&window.editor&&typeof window.editor.resize==='function')requestAnimationFrame(()=>window.editor.resize());
    const newHash=({tickets:'#tickets',monde:'#reporting/monde',followup:'#reporting/viber-followup'})[view];
    if(window.location.hash!==newHash)history.replaceState(null,'',newHash);
    if(view==='followup')syncThemePreferenceButton();
  }
  tickets.addEventListener('click',()=>activate('tickets'));
  monde.addEventListener('click',()=>activate('monde'));
  followup.addEventListener('click',()=>activate('followup'));
  if(topTickets)topTickets.addEventListener('click',()=>activate('tickets'));
  if(topMonde)topMonde.addEventListener('click',()=>activate('monde'));
  if(topFollowup)topFollowup.addEventListener('click',()=>activate('followup'));
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
    ['mondeFrame','followupFrame'].forEach(id=>{
      const frame=document.getElementById(id);
      if(frame && frame.contentWindow){
        frame.contentWindow.postMessage({type:'MAU_APPEARANCE',dark:isDark},'*');
      }
    });
  };
  if(themeButton)themeButton.addEventListener('click',()=>{
    if(typeof window.toggleTheme==='function') window.toggleTheme();
  });
  function sendMondeProfile(){
    const frame=document.getElementById('mondeFrame');
    if(frame?.contentWindow)frame.contentWindow.postMessage({type:'MAU_PROFILE',profileId:window.MAUActiveProfileId||'guest'},'*');
  }
  for(const id of ['mondeFrame','followupFrame']){
    const frame=document.getElementById(id);
    if(frame)frame.addEventListener('load',()=>{window.syncThemePreferenceButton();if(id==='mondeFrame')sendMondeProfile();});
  }
  window.addEventListener('mau:profilechange',sendMondeProfile);
  window.syncThemePreferenceButton();

  const aiButton=document.getElementById('openTeamAiBtn');
  if (aiButton) aiButton.addEventListener('click',()=>{
    activate('tickets');
    const chat = document.getElementById('chatBotContainer');
    if (chat && getComputedStyle(chat).display==='none' && typeof window.toggleDisplayChatBotContainer==='function') window.toggleDisplayChatBotContainer();
    const input=document.getElementById('chat-input');if(input) input.focus();
  });
  activate(location.hash.includes('reporting/viber-followup')?'followup':location.hash.includes('reporting/monde')?'monde':'tickets');
})();
