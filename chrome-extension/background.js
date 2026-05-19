(function () {
  "use strict";

  const ACTION_PREPARE_OR_FOCUS = "prepareOrFocusZohoTab";
  const ACTION_AUTOFILL = "autofillZohoTicket";
  const STORAGE_KEY_TAB_ID = "ztaZohoTabId";
  const DEFAULT_ZOHO_NEW_TICKET_URL = "https://helpcenter.amti.com.ph/agent/amtiphilippines/sandz/tickets/new";

  const pendingPayloadByTabId = new Map();
  const targetUrlByTabId = new Map();

  function stripHash(url) {
    return String(url || "").split("#")[0];
  }

  function urlsMatch(actualUrl, expectedUrl) {
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
    if (storedTab) {
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
        pendingPayloadByTabId.set(tabId, payload);
      } else {
        pendingPayloadByTabId.delete(tabId);
      }
    }

    return {
      ok: true,
      reused: result.reused && !result.navigated,
      tabId,
      navigated: result.navigated
    };
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || message.type !== ACTION_PREPARE_OR_FOCUS) return undefined;

    handlePrepareOrFocus(message)
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
    if (!pendingPayloadByTabId.has(tabId)) return;

    const expectedUrl = targetUrlByTabId.get(tabId) || DEFAULT_ZOHO_NEW_TICKET_URL;
    if (!urlsMatch(tab && tab.url, expectedUrl)) return;

    const payload = pendingPayloadByTabId.get(tabId);
    const delivered = await sendAutofill(tabId, payload);
    if (delivered) {
      pendingPayloadByTabId.delete(tabId);
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
