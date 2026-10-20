/* MAU self-service Zoho extension setup and bridge readiness check. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const overlay = $("zohoExtensionOverlay");
  const status = $("zohoExtensionStatus");
  const installButton = $("openZohoExtensionInstallBtn");
  let lastCheck = false;

  function setStatus(text, state) {
    status.textContent = text;
    status.classList.toggle("is-ok", state === "ok");
    status.classList.toggle("is-bad", state === "bad");
    installButton?.classList.toggle("connected", state === "ok");
    if (state === "ok" && installButton) installButton.textContent = "Extension ready";
    else if (installButton) installButton.textContent = "Install extension";
  }

  function checkConnection(timeoutMs = 1600) {
    return new Promise((resolve) => {
      const requestId = `mau-ping-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      let finished = false;
      const finish = (connected) => {
        if (finished) return;
        finished = true;
        window.removeEventListener("message", onReply);
        window.clearTimeout(timer);
        lastCheck = connected;
        setStatus(connected ? "Zoho extension connected. You can use Create Ticket." : "Extension not connected yet. Follow the steps below.", connected ? "ok" : "bad");
        resolve(connected);
      };
      function onReply(e) {
        const data = e.data;
        if (e.source !== window || (location.protocol === "file:" ? e.origin !== "null" : e.origin !== location.origin) || !data || data.type !== "zta:bridge-response" || data.requestId !== requestId) return;
        finish(!!data.ok);
      }
      const timer = window.setTimeout(() => finish(false), timeoutMs);
      window.addEventListener("message", onReply);
      window.postMessage({ type: "zta:bridge-request", requestId, action: "pingMauZohoExtension", data: {} }, location.protocol === "file:" ? "*" : location.origin);
    });
  }

  function open() {
    overlay.hidden = false;
    setStatus("Checking extension…");
    checkConnection();
  }
  function close() { overlay.hidden = true; }

  $("openZohoExtensionSettingsBtn")?.addEventListener("click", open);
  installButton?.addEventListener("click", open);
  $("checkZohoExtensionBtn")?.addEventListener("click", () => { setStatus("Checking extension…"); checkConnection(2200); });
  $("closeZohoExtensionGuide")?.addEventListener("click", close);
  $("closeZohoExtensionBottomBtn")?.addEventListener("click", close);
  overlay?.addEventListener("click", (e) => { if(e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => { if (!overlay.hidden && e.key === "Escape") close(); });
  $("copyChromeExtensionsUrl")?.addEventListener("click", async () => {
    const text = "chrome://extensions/";
    try { await navigator.clipboard.writeText(text); $("copyChromeExtensionsUrl").textContent = "Copied"; }
    catch (e) { prompt("Copy and paste this address into Chrome:", text); }
  });

  window.MAUZohoExtensionGuide = { open, close, check: checkConnection, get connected() { return lastCheck; } };
  window.setTimeout(() => { if (!document.hidden) checkConnection(); }, 1100);
}());
