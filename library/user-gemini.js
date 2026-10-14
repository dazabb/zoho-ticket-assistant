/* MAU: personally owned Gemini keys; optional device storage scoped to the selected MAU profile. */
(function () {
  'use strict';
  const MODEL = 'gemini-3.5-flash-lite';
  const USAGE_PREFIX = 'mauGeminiUsageV08::';
  const SAVED_KEY_PREFIX = 'mauPersonalGeminiV17::';
  const PROVIDER_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const GUIDANCE = 'You help MAU technical support engineers prepare Zoho Desk tickets, concise technical summaries, and troubleshooting notes. Prefer factual, natural, professional operational writing. Never invent actions, access to systems, ticket numbers, customer details, or incident resolutions. Explain uncertainty. Always distinguish notes supplied by the user from facts that require verification.';
  const pacificFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' });
  let key = '';
  let activeProfile = '';
  let busy = false;

  const $ = id => document.getElementById(id);

  function pacificDate(date = new Date()) {
    const parts = Object.fromEntries(pacificFormatter.formatToParts(date).map(p => [p.type, p.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function nextResetTimestamp(now = Date.now()) {
    const day = pacificDate(new Date(now));
    let lo = now, hi = now + 27 * 3600000;
    while (pacificDate(new Date(hi)) === day) hi += 3600000;
    // Find the first second of the following Pacific calendar day, including DST changes.
    while (hi - lo > 1000) {
      const mid = Math.floor((lo + hi) / 2000) * 1000;
      if (pacificDate(new Date(mid)) === day) lo = mid;
      else hi = mid;
    }
    return hi;
  }

  function storeKey(profileId = activeProfile) { return USAGE_PREFIX + (profileId || 'guest'); }
  function emptyUsage() { return { day: pacificDate(), requests: 0, failed: 0, totalTokens: 0, inputTokens: 0, outputTokens: 0 }; }
  function getUsage(profileId = activeProfile) {
    try {
      const raw = localStorage.getItem(storeKey(profileId));
      const data = JSON.parse(raw || 'null');
      if (data && data.day === pacificDate()) return {
        day:data.day,
        requests: Math.max(0, Number(data.requests) || 0),
        failed: Math.max(0, Number(data.failed) || 0),
        totalTokens: Math.max(0, Number(data.totalTokens) || 0),
        inputTokens: Math.max(0, Number(data.inputTokens) || 0),
        outputTokens: Math.max(0, Number(data.outputTokens) || 0)
      };
    } catch (e) { /* Storage is optional. */ }
    return emptyUsage();
  }
  function writeUsage(data, profileId = activeProfile) {
    try { localStorage.setItem(storeKey(profileId), JSON.stringify(data)); } catch (e) { /* Storage is optional. */ }
  }
  function tally(success, metadata = {}, profileId = activeProfile) {
    const data = getUsage(profileId);
    if (success) {
      data.requests++;
      data.inputTokens += Math.max(0, Number(metadata.promptTokenCount) || 0);
      data.outputTokens += Math.max(0, Number(metadata.candidatesTokenCount) || 0);
      data.totalTokens += Math.max(0, Number(metadata.totalTokenCount) || 0);
    } else {
      data.failed++;
    }
    writeUsage(data, profileId); refreshUi();
  }
  function timeUntilReset() {
    const ms = Math.max(0, nextResetTimestamp() - Date.now());
    const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${String(m).padStart(2,'0')}m`;
  }
  function refreshUi() {
    const status = $('userKeyStatus');
    if (status) {
      status.className = `api-key-feedback ${key ? 'ok' : 'warn'}`;
      status.textContent = key ? (savedForProfile() ? 'Saved for this profile. No need to enter it again.' : 'Key active for this session.') : 'No key saved for this profile.';
    }
    const toolbar = $('toolbarApiStatus'); if (toolbar) toolbar.textContent = key ? 'Ready' : 'Not set';
    const ai = $('openTeamAiBtn'); if (ai) {ai.classList.toggle('connected',!!key); ai.classList.toggle('disconnected',!key);}
    const data = getUsage();
    if ($('usageRequestCount')) $('usageRequestCount').textContent = data.requests.toLocaleString();
    if ($('usageFailureCount')) $('usageFailureCount').textContent = data.failed.toLocaleString();
    if ($('usageTokenCount')) $('usageTokenCount').textContent = data.totalTokens.toLocaleString();
    if ($('usageCounterInline')) $('usageCounterInline').textContent = `${data.requests} request${data.requests === 1 ? '' : 's'} today`;
    if ($('usageResetCountdown')) $('usageResetCountdown').textContent = timeUntilReset();
    if ($('usageResetTimestamp')) {
      $('usageResetTimestamp').textContent = new Date(nextResetTimestamp()).toLocaleString(undefined, {dateStyle:'medium',timeStyle:'short'}) + ' (local time) · midnight Pacific';
    }
  }
  function savedKeyName(profileId = activeProfile) {
    return SAVED_KEY_PREFIX + String(profileId || 'guest');
  }
  function savedForProfile() {
    if (!activeProfile || activeProfile === 'guest') return false;
    try { return Boolean(localStorage.getItem(savedKeyName())); } catch (_) { return false; }
  }
  function clearKey(removeSaved = false) {
    if (removeSaved && activeProfile && activeProfile !== 'guest') {
      try { localStorage.removeItem(savedKeyName()); } catch (_) {}
    }
    key = '';
    const input = $('userGeminiApiKey'); if(input) input.value = '';
    refreshUi();
  }
  function setProfile(profileId) {
    key = '';
    activeProfile = profileId || 'guest';
    if (activeProfile !== 'guest') {
      try { key = String(localStorage.getItem(savedKeyName()) || ''); } catch (_) { key = ''; }
    }
    // Each named profile remembers its key on this browser until explicitly removed.
    if ($('userGeminiApiKey')) $('userGeminiApiKey').value = '';
    refreshUi();
  }
  function hasKey() { return Boolean(key); }

  async function generate({ model, messages }) {
    if (!key) throw new Error('Enter your Gemini API key in API key settings first.');
    if (busy) throw new Error('A Gemini request is already in progress.');
    if (model !== MODEL) throw new Error('Only the configured Gemini model is enabled.');
    if (!Array.isArray(messages) || !messages.length || messages.length > 12) throw new Error('Invalid conversation history.');
    const contents = messages.map(item => ({ role:item.role === 'model' ? 'model' : 'user', parts:[{text:String(item.text||'')}]}));
    if (contents.some(item => !item.parts[0].text.trim())) throw new Error('Empty message.');
    busy = true;
    const requestProfile = activeProfile;
    const requestKey = key;
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 60000);
    try {
      const response = await fetch(PROVIDER_URL, {
        method:'POST',
        headers:{'Content-Type':'application/json','x-goog-api-key':requestKey},
        body:JSON.stringify({
          systemInstruction:{parts:[{text:GUIDANCE}]},
          contents,
          generationConfig:{maxOutputTokens:1800,temperature:0.3}
        }),
        signal:ctrl.signal,
        cache:'no-store'
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 400 || response.status === 401 || response.status === 403)
          throw new Error('Google rejected the request. Confirm your personal key, project access, and API settings in AI Studio.');
        if (response.status === 429)
          throw new Error('Google rate limit reached. It may be a per-minute or daily quota. Check Google AI Studio usage; daily requests reset at midnight Pacific Time.');
        if (response.status === 404)
          throw new Error('The selected Gemini model is not available to your project. Check your models in Google AI Studio.');
        throw new Error(`Gemini request failed (HTTP ${response.status}). Please retry later.`);
      }
      const text = (data.candidates||[]).flatMap(c => c.content?.parts || []).map(p => p.text || '').filter(Boolean).join('\n').trim();
      if (!text) throw new Error('Google returned no text. Please revise the request.');
      tally(true, data.usageMetadata || {}, requestProfile);
      return {text, usage:data.usageMetadata || {}};
    } catch (e) {
      tally(false, {}, requestProfile);
      if (e.name === 'AbortError') throw new Error('The Gemini request timed out. Please try again.');
      if (e instanceof TypeError) throw new Error('Could not reach Google Gemini from this browser. Check your internet, site permissions, and browser network policy.');
      throw e;
    } finally {clearTimeout(timeout);busy=false;}
  }

  function init() {
    const form = $('userApiKeyForm');
    if(form) form.addEventListener('submit',e=>{
      e.preventDefault();
      const entered = String($('userGeminiApiKey')?.value || '').trim();
      if (!entered || entered.length < 12 || /\s/.test(entered)) {
        if ($('userKeyStatus')) { $('userKeyStatus').textContent='Please enter a valid-looking Google AI Studio key (no spaces).'; $('userKeyStatus').className='api-key-feedback warn'; }
        return;
      }
      key = entered;
      if (activeProfile && activeProfile !== 'guest') {
        try { localStorage.setItem(savedKeyName(), entered); }
        catch (e) {
          if ($('userKeyStatus')) $('userKeyStatus').textContent = 'Key is active but could not be saved on this device.';
        }
      }
      if ($('userGeminiApiKey')) $('userGeminiApiKey').value='';
      refreshUi();
    });
    $('removeUserGeminiKey')?.addEventListener('click', () => clearKey(true));
    $('toolbarApiKeyBtn')?.addEventListener('click', () => window.openApiModal && window.openApiModal());
    $('chatApiKeyBtn')?.addEventListener('click', () => window.openApiModal && window.openApiModal());
    $('resetLocalUsageBtn')?.addEventListener('click', ()=>{
      if(!confirm('Clear this profile’s MAU usage history? This will NOT reset your Google quota.')) return;
      try{localStorage.removeItem(storeKey());}catch(e){}
      refreshUi();
    });
    $('toggleApiKeyVisibility')?.addEventListener('click',()=>{
      const input=$('userGeminiApiKey');
      input.type=input.type==='password'?'text':'password';
      $('toggleApiKeyVisibility').textContent=input.type==='password'?'Show':'Hide';
    });
    refreshUi();
    setInterval(refreshUi, 60000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshUi();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
  window.MAUUserGemini={hasKey,clearKey,setProfile,generate,refreshUi,nextResetTimestamp,pacificDate,getUsage};
})();
