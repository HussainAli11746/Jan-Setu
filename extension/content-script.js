/**
 * JanSetu Apply Assist — Content Script
 */

(function () {
  "use strict";

  if (window.__jansetuLoaded) return;
  window.__jansetuLoaded = true;

  var E_ROBOT  = "\uD83E\uDD16";
  var E_FLAG   = "\uD83C\uDDEE\uD83C\uDDF3";
  var E_TEMPLE = "\uD83C\uDFDB\uFE0F";
  var E_PIN    = "\uD83D\uDCCD";
  var E_DOC    = "\uD83D\uDCC4";
  var E_ARROW  = "\u27A1\uFE0F";
  var E_LISTEN = "\uD83D\uDD0A";
  var E_CAMERA = "\uD83D\uDCF8";
  var E_RELOAD = "\uD83D\uDD04";
  var E_TICK   = "\u2705";
  var E_DOT    = "\uD83D\uDD35";
  var E_WARN   = "\u26A0\uFE0F";

  function getContext() {
    return new Promise(function(resolve) {
      try {
        chrome.runtime.sendMessage({ type: "GET_CONTEXT" }, function(res) {
          if (chrome.runtime.lastError) {
            resolve(null);
            return;
          }
          resolve(res && res.context ? res.context : null);
        });
      } catch (e) {
        resolve(null);
      }
    });
  }

  function downscaleBase64(base64, maxWidth) {
    return new Promise(function(resolve) {
      var img = new Image();
      img.onload = function() {
        var targetWidth = maxWidth || 768;
        var scale = img.width > targetWidth ? targetWidth / img.width : 1;
        var canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75).replace(/^data:image\/\w+;base64,/, ""));
      };
      img.onerror = function() { resolve(base64); };
      img.src = "data:image/jpeg;base64," + base64;
    });
  }

  function createFloatingButton() {
    var btn = document.createElement("button");
    btn.id = "jansetu-assist-btn";
    btn.setAttribute("aria-label", "JanSetu: What do I do here?");
    btn.innerHTML =
      '<span class="js-btn-icon">' + E_ROBOT + '</span>' +
      '<span class="js-btn-label">What do I do here?</span>';
    document.body.appendChild(btn);
    return btn;
  }

  function createPanel() {
    var panel = document.createElement("div");
    panel.id = "jansetu-panel";
    panel.className = "js-hidden";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-live", "polite");
    panel.innerHTML =
      '<div class="js-panel-header">' +
        '<div class="js-panel-title">' +
          '<span class="js-logo">' + E_FLAG + '</span>' +
          '<span>JanSetu AI Guide</span>' +
        '</div>' +
        '<button class="js-close-btn" id="jansetu-close-btn" aria-label="Close">\u2715</button>' +
      '</div>' +

      // Tab bar
      '<div class="js-tab-bar">' +
        '<button class="js-tab js-tab-active" id="jansetu-tab-analyze" data-tab="analyze">' + E_CAMERA + ' Analyze</button>' +
        '<button class="js-tab" id="jansetu-tab-ask" data-tab="ask">\uD83D\uDCAC Ask AI</button>' +
      '</div>' +

      // ── Tab: Analyze Screen ──────────────────────────────────────
      '<div class="js-tab-content js-panel-body" id="jansetu-tab-content-analyze">' +

        // 1. Welcome view
        '<div id="jansetu-welcome" class="js-state-view js-welcome-view">' +
          '<div class="js-welcome-icon">' + E_TEMPLE + '</div>' +
          '<p class="js-welcome-title">Ready to help you apply!</p>' +
          '<p class="js-welcome-sub">Click below to analyze this page and get step-by-step guidance in your language.</p>' +
          '<button class="js-analyze-btn" id="jansetu-analyze-btn">' + E_CAMERA + ' Analyze This Page</button>' +
        '</div>' +

        // 2. Loading view
        '<div id="jansetu-loading" class="js-state-view js-loading-view js-hidden">' +
          '<div class="js-spinner"></div>' +
          '<p class="js-loading-text">Analyzing your screen\u2026</p>' +
          '<p class="js-loading-sub">JanSetu AI is reading this form section</p>' +
        '</div>' +

        // 3. Error view
        '<div id="jansetu-error" class="js-state-view js-error-view js-hidden">' +
          '<span class="js-error-icon">' + E_WARN + '</span>' +
          '<p id="jansetu-error-msg">Something went wrong. Please try again.</p>' +
          '<button class="js-retry-btn" id="jansetu-retry-btn">Try Again</button>' +
        '</div>' +

        // 4. Result view
        '<div id="jansetu-result" class="js-state-view js-hidden">' +
          '<div class="js-section-card">' +
            '<div class="js-section-label">' + E_PIN + ' You are here:</div>' +
            '<p id="jansetu-section" class="js-section-text"></p>' +
          '</div>' +
          '<div class="js-docs-card">' +
            '<div class="js-docs-label">' + E_DOC + ' Documents needed for this step:</div>' +
            '<ul id="jansetu-docs" class="js-docs-list"></ul>' +
          '</div>' +
          '<div class="js-action-card">' +
            '<div class="js-action-label">' + E_ARROW + ' What to do next:</div>' +
            '<p id="jansetu-action" class="js-action-text"></p>' +
          '</div>' +
          '<div class="js-result-footer">' +
            '<button class="js-listen-btn" id="jansetu-listen-btn">' + E_LISTEN + ' Listen</button>' +
            '<button class="js-analyze-btn js-reanalyze" id="jansetu-reanalyze-btn">' + E_RELOAD + ' Re-analyze</button>' +
          '</div>' +
        '</div>' +

      '</div>' +

      // ── Tab: Ask AI ──────────────────────────────────────────────
      '<div class="js-tab-content js-panel-body js-hidden" id="jansetu-tab-content-ask">' +
        '<div id="jansetu-chat-messages" class="js-chat-messages"></div>' +
        '<div class="js-chat-input-row">' +
          '<input type="text" id="jansetu-chat-input" class="js-chat-input" placeholder="Ask anything about this form\u2026" maxlength="300" />' +
          '<button id="jansetu-chat-send" class="js-chat-send-btn" aria-label="Send">\u27A4</button>' +
        '</div>' +
      '</div>' +

      '<div class="js-panel-footer">Powered by JanSetu AI \u00B7 No data stored</div>';

    document.body.appendChild(panel);
    return panel;
  }

  function showState(panel, activeState) {
    var states = ["welcome", "loading", "error", "result"];
    for (var i = 0; i < states.length; i++) {
      var s = states[i];
      var el = panel.querySelector("#jansetu-" + s);
      if (el) {
        if (s === activeState) {
          el.classList.remove("js-hidden");
        } else {
          el.classList.add("js-hidden");
        }
      }
    }
  }

  function showError(panel, msg) {
    var isInvalidated = String(msg || "").indexOf("Extension context invalidated") !== -1;
    var displayMsg = isInvalidated
      ? "Extension was reloaded. Please refresh this webpage (press F5) to reconnect."
      : (msg || "Something went wrong. Please try again.");
    panel.querySelector("#jansetu-error-msg").textContent = displayMsg;
    showState(panel, "error");
  }

  function renderResult(panel, data, ctx) {
    panel.querySelector("#jansetu-section").textContent = data.sectionSummary || "Application Form Step";

    var docsList = panel.querySelector("#jansetu-docs");
    docsList.innerHTML = "";
    (data.docsNeeded || []).forEach(function(doc) {
      var li = document.createElement("li");
      li.className = "js-doc-item js-doc-needed";
      li.innerHTML = '<span class="js-doc-tick">' + E_TICK + '</span> ' + doc;
      docsList.appendChild(li);
    });

    (data.allDocs || []).filter(function(d) {
      return !(data.docsNeeded || []).includes(d);
    }).forEach(function(doc) {
      var li = document.createElement("li");
      li.className = "js-doc-item js-doc-other";
      li.innerHTML = '<span class="js-doc-dot">' + E_DOT + '</span> ' + doc;
      docsList.appendChild(li);
    });

    panel.querySelector("#jansetu-action").textContent = data.nextAction || "Proceed with filling the required details.";

    var listenBtn = panel.querySelector("#jansetu-listen-btn");
    listenBtn.onclick = function() {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      var utt = new SpeechSynthesisUtterance(data.spokenText || data.sectionSummary);
      utt.lang = (ctx && ctx.lang) ? ctx.lang + "-IN" : "en-IN";
      window.speechSynthesis.speak(utt);
      listenBtn.textContent = E_LISTEN + " Speaking\u2026";
      utt.onend = function() { listenBtn.textContent = E_LISTEN + " Listen"; };
    };

    showState(panel, "result");
  }

  var _ctx = null;

  function runAnalysis(panel, ctx) {
    showState(panel, "loading");

    try {
      chrome.runtime.sendMessage({ type: "CAPTURE_REQUEST" }, function(captureRes) {
        if (chrome.runtime.lastError) {
          showError(panel, chrome.runtime.lastError.message);
          return;
        }
        if (!captureRes || !captureRes.ok) {
          showError(panel, captureRes ? captureRes.error : "Screenshot capture failed.");
          return;
        }

        downscaleBase64(captureRes.base64, 768).then(function(imageBase64) {
          chrome.runtime.sendMessage({
            type: "ANALYZE_REQUEST",
            schemeId: ctx.schemeId,
            imageBase64: imageBase64,
            lang: ctx.lang || "en",
            token: ctx.token,
          }, function(analyzeRes) {
            if (chrome.runtime.lastError) {
              showError(panel, chrome.runtime.lastError.message);
              return;
            }
            if (!analyzeRes || !analyzeRes.ok) {
              showError(panel, analyzeRes ? analyzeRes.error : "Analysis failed.");
              return;
            }
            renderResult(panel, analyzeRes.data, ctx);
          });
        }).catch(function(err) {
          showError(panel, err.message || "Failed to process screenshot.");
        });
      });
    } catch (e) {
      showError(panel, e.message || "Extension connection error.");
    }
  }

  function makeDraggable(el) {
    var header = el.querySelector(".js-panel-header");
    if (!header) return;
    var dx = 0, dy = 0, sx = 0, sy = 0;
    header.style.cursor = "grab";
    header.addEventListener("mousedown", function(e) {
      e.preventDefault();
      sx = e.clientX; sy = e.clientY;
      var r = el.getBoundingClientRect();
      dx = r.left; dy = r.top;
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
    function onMove(e) {
      el.style.left = Math.max(0, dx + (e.clientX - sx)) + "px";
      el.style.top  = Math.max(0, dy + (e.clientY - sy)) + "px";
      el.style.right = "auto"; el.style.bottom = "auto";
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
  }

  // ── Chat helpers ────────────────────────────────────────────────
  function appendChatMessage(panel, role, text) {
    var container = panel.querySelector("#jansetu-chat-messages");
    var msg = document.createElement("div");
    msg.className = "js-chat-msg js-chat-msg-" + role;
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    return msg;
  }

  function runAsk(panel, ctx, question) {
    var input = panel.querySelector("#jansetu-chat-input");
    var sendBtn = panel.querySelector("#jansetu-chat-send");
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;

    appendChatMessage(panel, "user", question);
    var thinkingMsg = appendChatMessage(panel, "ai", "\u231B Thinking\u2026");

    try {
      chrome.runtime.sendMessage({
        type: "ASK_REQUEST",
        schemeId: ctx.schemeId,
        question: question,
        lang: ctx.lang || "en",
        token: ctx.token,
      }, function(res) {
        thinkingMsg.remove();
        if (chrome.runtime.lastError) {
          appendChatMessage(panel, "ai-error", "\u26A0\uFE0F " + (chrome.runtime.lastError.message || "Connection error."));
        } else if (!res || !res.ok) {
          appendChatMessage(panel, "ai-error", "\u26A0\uFE0F " + (res ? res.error : "No response from AI."));
        } else {
          appendChatMessage(panel, "ai", res.answer);
        }
        if (input) { input.disabled = false; input.focus(); }
        if (sendBtn) sendBtn.disabled = false;
      });
    } catch (e) {
      thinkingMsg.remove();
      appendChatMessage(panel, "ai-error", "\u26A0\uFE0F Extension error: " + (e.message || "Unknown error"));
      if (input) input.disabled = false;
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  function initChat(panel, ctx) {
    var input   = panel.querySelector("#jansetu-chat-input");
    var sendBtn = panel.querySelector("#jansetu-chat-send");

    // Welcome message
    appendChatMessage(panel, "ai", "\uD83D\uDC4B I'm your JanSetu AI guide! Ask me anything about this form or scheme.");

    function handleSend() {
      var q = input.value.trim();
      if (!q) return;
      input.value = "";
      runAsk(panel, ctx, q);
    }

    sendBtn.addEventListener("click", handleSend);
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
  }

  // ── Tab switching ───────────────────────────────────────────────
  function initTabs(panel) {
    var tabs = panel.querySelectorAll(".js-tab");
    tabs.forEach(function(tab) {
      tab.addEventListener("click", function() {
        tabs.forEach(function(t) { t.classList.remove("js-tab-active"); });
        tab.classList.add("js-tab-active");
        var target = tab.getAttribute("data-tab");
        panel.querySelectorAll(".js-tab-content").forEach(function(tc) {
          tc.classList.add("js-hidden");
        });
        var activeContent = panel.querySelector("#jansetu-tab-content-" + target);
        if (activeContent) activeContent.classList.remove("js-hidden");
      });
    });
  }

  function init() {
    getContext().then(function(ctx) {
      _ctx = ctx;
      if (!_ctx || !_ctx.schemeId || !_ctx.token) {
        console.log("[JanSetu] No context found -- navigate from JanSetu Apply Now first.");
        return;
      }
      console.log("[JanSetu] Co-Pilot active for scheme:", _ctx.schemeId, "| lang:", _ctx.lang);

      var btn   = createFloatingButton();
      var panel = createPanel();

      btn.addEventListener("click", function() {
        if (panel.classList.contains("js-hidden")) {
          panel.classList.remove("js-hidden");
        } else {
          panel.classList.add("js-hidden");
        }
      });

      panel.querySelector("#jansetu-close-btn").addEventListener("click", function() {
        panel.classList.add("js-hidden");
      });

      var btnAnalyze = panel.querySelector("#jansetu-analyze-btn");
      if (btnAnalyze) btnAnalyze.addEventListener("click", function() { runAnalysis(panel, _ctx); });

      var btnReanalyze = panel.querySelector("#jansetu-reanalyze-btn");
      if (btnReanalyze) btnReanalyze.addEventListener("click", function() { runAnalysis(panel, _ctx); });

      var btnRetry = panel.querySelector("#jansetu-retry-btn");
      if (btnRetry) btnRetry.addEventListener("click", function() { runAnalysis(panel, _ctx); });

      initTabs(panel);
      initChat(panel, _ctx);
      makeDraggable(panel);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();