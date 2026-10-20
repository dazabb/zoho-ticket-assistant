(function () {
  "use strict";

  const ACTION_PREPARE_OR_FOCUS = "prepareOrFocusZohoTab";
  const ACTION_AUTOFILL = "autofillZohoTicket";
  const ACTION_LIST_EDIT = "listOpenZohoEditTickets";
  const EDIT_PATH_RE = /^\/agent\/amtiphilippines\/sandz\/tickets\/edit\/(\d+)\/?$/i;
  const STORAGE_KEY_TAB_ID = "ztaZohoTabId";
  const DEFAULT_ZOHO_NEW_TICKET_URL = "https://helpcenter.amti.com.ph/agent/amtiphilippines/sandz/tickets/new";

  const pendingPayloadByTabId = new Map();
  const targetUrlByTabId = new Map();
  const PENDING_PREFIX = "mauPendingZohoTab:";
  const PENDING_TARGET_PREFIX = "mauPendingZohoUrl:";
  async function storePending(tabId, payload) {
    pendingPayloadByTabId.set(tabId, payload);
    await chrome.storage.session.set({
      [PENDING_PREFIX + tabId]: payload,
      [PENDING_TARGET_PREFIX + tabId]: targetUrlByTabId.get(tabId) || DEFAULT_ZOHO_NEW_TICKET_URL
    });
  }
  async function readPending(tabId) {
    if (pendingPayloadByTabId.has(tabId)) return pendingPayloadByTabId.get(tabId);
    const result = await chrome.storage.session.get(PENDING_PREFIX + tabId);
    return result[PENDING_PREFIX + tabId] || null;
  }
  async function clearPending(tabId) {
    pendingPayloadByTabId.delete(tabId);
    await chrome.storage.session.remove([PENDING_PREFIX + tabId, PENDING_TARGET_PREFIX + tabId]);
  }

  function stripHash(url) {
    return String(url || "").split("#")[0];
  }

  function urlsMatch(actualUrl, expectedUrl) {
    const actualEdit = parseEditUrl(actualUrl);
    const expectedEdit = parseEditUrl(expectedUrl);
    if (actualEdit || expectedEdit) return !!actualEdit && !!expectedEdit && actualEdit.url === expectedEdit.url;
    const actual = stripHash(actualUrl);
    const expected = stripHash(expectedUrl || DEFAULT_ZOHO_NEW_TICKET_URL);
    return actual === expected;
  }

  function buildQueryPattern(targetUrl) {
    try {
      const parsed = new URL(stripHash(targetUrl || DEFAULT_ZOHO_NEW_TICKET_URL));
      return `${parsed.origin}${parsed.pathname}*`;
    } catch (error) {
      return `${stripHash(DEFAULT_ZOHO_NEW_TICKET_URL)}*`;
    }
  }

  async function getStoredTabId() {
    const stored = await chrome.storage.session.get(STORAGE_KEY_TAB_ID);
    return Number(stored[STORAGE_KEY_TAB_ID] || 0) || 0;
  }

  async function setStoredTabId(tabId) {
    if (!tabId) {
      await chrome.storage.session.remove(STORAGE_KEY_TAB_ID);
      return;
    }
    await chrome.storage.session.set({ [STORAGE_KEY_TAB_ID]: tabId });
  }

  async function getTabById(tabId) {
    if (!tabId) return null;
    try {
      return await chrome.tabs.get(tabId);
    } catch (error) {
      return null;
    }
  }

  async function focusTab(tab) {
    if (!tab || !tab.id) return;
    if (tab.windowId != null) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }
    await chrome.tabs.update(tab.id, { active: true });
  }

  async function resolveTrackedTab(targetUrl) {
    const storedTabId = await getStoredTabId();
    const storedTab = await getTabById(storedTabId);
    if (storedTab && urlsMatch(storedTab.url, targetUrl)) {
      targetUrlByTabId.set(storedTab.id, targetUrl);
      return storedTab;
    }

    const queryPattern = buildQueryPattern(targetUrl);
    const matches = await chrome.tabs.query({ url: [queryPattern] });
    const matchedTab = matches.find((tab) => tab && !tab.discarded) || matches[0] || null;
    if (matchedTab && matchedTab.id) {
      await setStoredTabId(matchedTab.id);
      targetUrlByTabId.set(matchedTab.id, targetUrl);
    }
    return matchedTab;
  }

  function parseEditUrl(urlText) {
    try {
      const url = new URL(String(urlText || ""));
      if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "helpcenter.amti.com.ph") return null;
      const match = url.pathname.match(EDIT_PATH_RE);
      return match ? { ticketId: match[1], url: url.origin + url.pathname } : null;
    } catch (_) { return null; }
  }

  async function listOpenEditTabs() {
    const candidates = await chrome.tabs.query({ url: "https://helpcenter.amti.com.ph/agent/amtiphilippines/sandz/tickets/edit/*" });
    return candidates.filter(tab => tab && tab.id && !tab.discarded && parseEditUrl(tab.url))
      .map(tab => ({ tabId: tab.id, ticketId: parseEditUrl(tab.url).ticketId,
        title: String(tab.title || "Zoho Edit Ticket").slice(0, 150),
        url: parseEditUrl(tab.url).url, active: !!tab.active }))
      .sort((a,b) => Number(b.active) - Number(a.active)).slice(0, 30);
  }

  async function handleExistingEdit(message) {
    const tabId = Number(message.editTabId || 0);
    const ticketId = String(message.editTicketId || "");
    if (!Number.isSafeInteger(tabId) || tabId < 1 || !/^\d+$/.test(ticketId) || message.confirmedEdit !== true) {
      throw new Error("Select and confirm an existing Zoho Edit Ticket tab first.");
    }
    const tab = await getTabById(tabId);
    const parsed = parseEditUrl(tab && tab.url);
    if (!parsed || parsed.ticketId !== ticketId) {
      throw new Error("The selected Zoho edit tab changed or was closed. Check tabs and choose again.");
    }
    const payload = { ...message.payload, __mauEdit: {
      mode: "edit", ticketId,
      replaceIdentity: message.replaceIdentity === true
    } };
    targetUrlByTabId.set(tabId, parsed.url);
    await setStoredTabId(tabId);
    await focusTab(tab);
    const delivered = await sendAutofill(tabId, payload);
    if (!delivered) {
      await storePending(tabId, payload);
      // Keep the queue only for this exact edit URL. Never navigate to an unrelated ticket.
      const tabNow = await getTabById(tabId);
      if (!tabNow || !urlsMatch(tabNow.url, parsed.url)) {
        await clearPending(tabId);
        throw new Error("The edit ticket changed before autofill. No data was sent.");
      }
      setTimeout(async () => {
        try {
          const stillPending = await readPending(tabId);
          const currentTab = await getTabById(tabId);
          if (stillPending && currentTab && urlsMatch(currentTab.url, parsed.url) &&
              await sendAutofill(tabId, stillPending)) await clearPending(tabId);
        } catch (_) {}
      }, 1500);
    } else {
      await clearPending(tabId);
    }
    return { ok:true, mode:"edit", tabId, ticketId, queued: !delivered };
  }

  async function sendAutofill(tabId, payload) {
    if (!tabId || !payload) return false;
    try {
      const response = await chrome.tabs.sendMessage(tabId, {
        type: ACTION_AUTOFILL,
        payload
      });
      return !!(response && response.ok);
    } catch (error) {
      return false;
    }
  }

  async function ensureTargetTab(targetUrl) {
    const requestedUrl = stripHash(targetUrl || DEFAULT_ZOHO_NEW_TICKET_URL);
    const existingTab = await resolveTrackedTab(requestedUrl);

    if (!existingTab || !existingTab.id) {
      const createdTab = await chrome.tabs.create({ url: requestedUrl, active: true });
      await setStoredTabId(createdTab.id);
      targetUrlByTabId.set(createdTab.id, requestedUrl);
      return { tab: createdTab, reused: false, navigated: true };
    }

    const needsNavigation = !urlsMatch(existingTab.url, requestedUrl);
    const updatedTab = needsNavigation
      ? await chrome.tabs.update(existingTab.id, { url: requestedUrl, active: true })
      : await chrome.tabs.update(existingTab.id, { active: true });

    await setStoredTabId(updatedTab.id);
    targetUrlByTabId.set(updatedTab.id, requestedUrl);
    await focusTab(updatedTab);

    return { tab: updatedTab, reused: true, navigated: needsNavigation };
  }

  async function handlePrepareOrFocus(message) {
    const targetUrl = stripHash(message && message.targetUrl || DEFAULT_ZOHO_NEW_TICKET_URL);
    const payload = message && message.payload;
    const result = await ensureTargetTab(targetUrl);
    const tabId = result.tab && result.tab.id;

    if (tabId && payload) {
      const canSendNow = result.reused && !result.navigated;
      const delivered = canSendNow ? await sendAutofill(tabId, payload) : false;
      if (!delivered) {
        await storePending(tabId, payload);
        // Zoho can finish loading before Chrome fires the next update event.
        // Retry shortly; storage.session also keeps the queued data through worker suspension.
        setTimeout(async () => {
          try {
            const stillPending = await readPending(tabId);
            if (stillPending && await sendAutofill(tabId, stillPending)) await clearPending(tabId);
          } catch (_) { /* onUpdated will also retry on page load */ }
        }, 1400);
      } else {
        await clearPending(tabId);
      }
    }

    return {
      ok: true,
      reused: result.reused && !result.navigated,
      tabId,
      navigated: result.navigated
    };
  }

  function isAllowedAppSender(sender) {
    try {
      const parsed = new URL(sender && sender.url || "");
      const host = parsed.hostname.toLowerCase();
      if ((host === "127.0.0.1" || host === "localhost") && parsed.port === "3000") return true;
      if (host === "dazabb.github.io" && parsed.pathname.toLowerCase().startsWith("/zoho-ticket-assistant/")) return true;
      // Locally opened MAU can use file:// after the user explicitly enables file URL access.
      if (parsed.protocol === "file:" && /\/index\.html$/i.test(parsed.pathname)) return true;
      return false;
    } catch (e) { return false; }
  }

  function safeTargetUrl(requested) {
    try {
      const url = new URL(stripHash(requested || DEFAULT_ZOHO_NEW_TICKET_URL));
      const host = url.hostname.toLowerCase();
      const trustedHost = host === "helpcenter.amti.com.ph" || host.endsWith(".zoho.com") || host.endsWith(".zoho.com.ph");
      if (url.protocol !== "https:" || !trustedHost || !/\/tickets\/new\/?$/i.test(url.pathname)) return null;
      return url.href;
    } catch(e) { return null; }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || !isAllowedAppSender(sender)) return undefined;
    if (message.type === "pingMauZohoExtension") {
      sendResponse({ ok: true, version: chrome.runtime.getManifest().version });
      return undefined;
    }
    if (message.type === ACTION_LIST_EDIT) {
      listOpenEditTabs().then(tabs => sendResponse({ok:true, tabs}))
        .catch(error => sendResponse({ok:false, error:String(error?.message || error)}));
      return true;
    }
    if (message.type !== ACTION_PREPARE_OR_FOCUS) return undefined;
    if (message.mode === "edit") {
      if (!message.payload || !message.payload.fields || typeof message.payload.fields !== "object") {
        sendResponse({ok:false, error:"Invalid ticket details"}); return undefined;
      }
      handleExistingEdit(message).then(sendResponse)
        .catch(error => sendResponse({ok:false, error:String(error?.message || error)}));
      return true;
    }
    const targetUrl = safeTargetUrl(message.targetUrl);
    if (!targetUrl || !message.payload || !message.payload.fields || typeof message.payload.fields !== 'object') {
      sendResponse({ ok:false, error:"Invalid ticket or Zoho address" });
      return undefined;
    }
    handlePrepareOrFocus({ targetUrl, payload: { ...message.payload, __mauEdit: { mode:"new" } } })
      .then((response) => sendResponse(response))
      .catch((error) => {
        sendResponse({
          ok: false,
          error: error && error.message ? error.message : "Unknown extension error"
        });
      });
    return true;
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") return;
    const payload = await readPending(tabId);
    if (!payload) return;

    const storedTarget = await chrome.storage.session.get(PENDING_TARGET_PREFIX + tabId);
    const expectedUrl = targetUrlByTabId.get(tabId) || storedTarget[PENDING_TARGET_PREFIX + tabId] || DEFAULT_ZOHO_NEW_TICKET_URL;
    if (!urlsMatch(tab && tab.url, expectedUrl)) {
      // A queued edit payload must never follow a tab to a different ticket.
      await clearPending(tabId);
      return;
    }

    const delivered = await sendAutofill(tabId, payload);
    if (delivered) {
      await clearPending(tabId);
    }
  });

  chrome.tabs.onRemoved.addListener(async (tabId) => {
    pendingPayloadByTabId.delete(tabId);
    targetUrlByTabId.delete(tabId);

    const storedTabId = await getStoredTabId();
    if (storedTabId === tabId) {
      await setStoredTabId(0);
    }
  });
}());
