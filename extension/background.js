/**
 * JanSetu Apply Assist — Background Service Worker
 */

const BACKEND = "http://localhost:3001";

// ── Receive handshake from JanSetu React frontend ─────────────────────────
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  const { schemeId, token, lang } = message || {};
  if (!schemeId || !token) {
    sendResponse({ ok: false, error: "Missing schemeId or token" });
    return true;
  }
  chrome.storage.session.set(
    { jansetu_context: { schemeId, token, lang: lang || "en" } },
    () => {
      if (chrome.runtime.lastError) {
        console.error("[JanSetu BG] storage.session.set error:", chrome.runtime.lastError.message);
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
      } else {
        console.log("[JanSetu BG] Handshake stored for scheme:", schemeId);
        sendResponse({ ok: true });
      }
    }
  );
  return true;
});

// ── Handle messages from content script ────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 1. GET_CONTEXT
  if (message?.type === "GET_CONTEXT") {
    chrome.storage.session.get("jansetu_context", (result) => {
      sendResponse({ ok: true, context: result?.jansetu_context || null });
    });
    return true;
  }

  // 2. CAPTURE_REQUEST
  if (message?.type === "CAPTURE_REQUEST") {
    const windowId = sender.tab?.windowId || null;
    chrome.tabs.captureVisibleTab(
      windowId,
      { format: "jpeg", quality: 75 },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          const errMsg = chrome.runtime.lastError.message || "Failed to capture tab screenshot.";
          console.error("[JanSetu BG] captureVisibleTab error:", errMsg);
          sendResponse({ ok: false, error: errMsg });
        } else if (!dataUrl) {
          sendResponse({ ok: false, error: "Empty screenshot returned by browser." });
        } else {
          const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
          sendResponse({ ok: true, base64 });
        }
      }
    );
    return true;
  }

  // 3. ANALYZE_REQUEST (proxies fetch to backend — no CORS issues)
  if (message?.type === "ANALYZE_REQUEST") {
    const { schemeId, imageBase64, lang, token } = message;

    if (!schemeId || !imageBase64 || !token) {
      sendResponse({ ok: false, error: "Missing required fields for analysis." });
      return true;
    }

    fetch(`${BACKEND}/api/copilot/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        schemeId,
        imageBase64,
        lang: lang || "en",
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server returned HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        sendResponse({ ok: true, data });
      })
      .catch((err) => {
        const errMsg = err.message || "Failed to communicate with JanSetu AI server.";
        console.error("[JanSetu BG] analyze error:", errMsg);
        sendResponse({ ok: false, error: errMsg });
      });

    return true; // Keep message channel open for async response
  }
});