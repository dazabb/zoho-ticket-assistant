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
    overlay?.classList.toggle("is-connected", state === "ok");
    if (state === "ok" && installButton) installButton.textContent = "Extension ready";
    else if (installButton) installButton.textContent = "Install extension";
  }

  function checkConnection(timeoutMs = 1600) {
    return new Promise((resolve) => {
      const requestId = `mau-ping-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      let finished = false;
      const finish = (connected, message = connected ? "Zoho is ready. You can use Create Ticket." : "Install the Zoho extension, then click Refresh.") => {
        if (finished) return;
        finished = true;
        window.removeEventListener("message", onReply);
        window.clearTimeout(timer);
        lastCheck = connected;
        setStatus(message, connected ? "ok" : "bad");
        resolve(connected);
      };
      function onReply(e) {
        const data = e.data;
        if (e.source !== window || (location.protocol === "file:" ? e.origin !== "null" : e.origin !== location.origin) || !data || data.type !== "zta:bridge-response" || data.requestId !== requestId) return;
        const version = String(data.response?.version || "");
        const parsed = /^(\d+)\.(\d+)(?:\.(\d+))?$/.exec(version);
        const compatible = parsed && (Number(parsed[1]) > 1 || (Number(parsed[1]) === 1 && Number(parsed[2]) >= 3));
        if (data.ok && !compatible) {
          finish(false, version
            ? `Extension v${version} is out of date. Install v1.3, then click Refresh.`
            : "Please install extension v1.3, then click Refresh.");
        } else finish(!!data.ok, data.ok ? `Zoho is ready. You can use Create Ticket.` : undefined);
      }
      const timer = window.setTimeout(() => finish(false), timeoutMs);
      window.addEventListener("message", onReply);
      try {
        // An offline preview (about:blank) has a null origin; avoid an
        // uncaught exception while still supporting local file:// use.
        const target = location.origin === "null" || location.protocol === "file:" ? "*" : location.origin;
        window.postMessage({ type: "zta:bridge-request", requestId, action: "pingMauZohoExtension", data: {} }, target);
      } catch (_) { finish(false); }
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
  $("checkZohoExtensionBtn")?.addEventListener("click", () => { window.location.reload(); });
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
