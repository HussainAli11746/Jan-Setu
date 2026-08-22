/**
 * JanSetu Apply Assist — Multilingual Content Script
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

  var I18N = {
    en: {
      guideTitle: "JanSetu AI Guide",
      whatDoIDo: "What do I do here?",
      tabAnalyze: "📷 Analyze",
      tabAsk: "💬 Ask AI",
      welcomeTitle: "Ready to help you apply!",
      welcomeSub: "Click below to analyze this page and get step-by-step guidance in your language.",
      analyzeBtn: "📷 Analyze This Page",
      analyzingText: "Analyzing your screen…",
      analyzingSub: "JanSetu AI is reading this form section",
      errorDefault: "Something went wrong. Please try again.",
      tryAgainBtn: "Try Again",
      youAreHere: "📍 YOU ARE HERE:",
      docsNeededLabel: "📄 DOCUMENTS NEEDED FOR THIS STEP:",
      whatNextLabel: "➡️ WHAT TO DO NEXT:",
      listenBtn: "🔊 Listen",
      speakingBtn: "🔊 Speaking…",
      reanalyzeBtn: "🔄 Re-analyze",
      chatPlaceholder: "Ask anything about this form…",
      chatWelcome: "👋 I'm your JanSetu AI guide! Ask me anything about this form or scheme.",
      footerText: "Powered by JanSetu AI · No data stored",
      thinking: "⏳ Thinking…",
    },
    hi: {
      guideTitle: "जनसेतु AI गाइड",
      whatDoIDo: "यहाँ क्या करना है?",
      tabAnalyze: "📷 विश्लेषण करें",
      tabAsk: "💬 AI से पूछें",
      welcomeTitle: "आवेदन में सहायता के लिए तैयार!",
      welcomeSub: "इस पेज का विश्लेषण करने और अपनी भाषा में चरण-दर-चरण मार्गदर्शन पाने के लिए नीचे क्लिक करें।",
      analyzeBtn: "📷 यह पेज विश्लेषण करें",
      analyzingText: "स्क्रीन का विश्लेषण हो रहा है…",
      analyzingSub: "जनसेतु AI इस फॉर्म अनुभाग को पढ़ रहा है",
      errorDefault: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
      tryAgainBtn: "पुनः प्रयास करें",
      youAreHere: "📍 आप यहाँ हैं:",
      docsNeededLabel: "📄 इस चरण के लिए आवश्यक दस्तावेज़:",
      whatNextLabel: "➡️ आगे क्या करना है:",
      listenBtn: "🔊 सुनें",
      speakingBtn: "🔊 बोल रहा है…",
      reanalyzeBtn: "🔄 पुनः विश्लेषण",
      chatPlaceholder: "इस फॉर्म के बारे में कुछ भी पूछें…",
      chatWelcome: "👋 नमस्ते! मैं जनसेतु AI गाइड हूँ। इस फॉर्म या योजना के बारे में कुछ भी पूछें।",
      footerText: "जनसेतु AI द्वारा संचालित · कोई डेटा संग्रहीत नहीं",
      thinking: "⏳ सोच रहा है…",
    },
    bn: {
      guideTitle: "জনসেতু AI গাইড",
      whatDoIDo: "এখানে কী করতে হবে?",
      tabAnalyze: "📷 বিশ্লেষণ করুন",
      tabAsk: "💬 AI কে জিজ্ঞাসা করুন",
      welcomeTitle: "আবেদনে সাহায্য করতে প্রস্তুত!",
      welcomeSub: "এই পেজটি বিশ্লেষণ করতে এবং আপনার ভাষায় ধাপে ধাপে নির্দেশিকা পেতে নিচে ক্লিক করুন।",
      analyzeBtn: "📷 এই পেজ বিশ্লেষণ করুন",
      analyzingText: "স্ক্রিন বিশ্লেষণ করা হচ্ছে…",
      analyzingSub: "জনসেতু AI এই ফর্মটি পড়ছে",
      errorDefault: "কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      tryAgainBtn: "আবার চেষ্টা করুন",
      youAreHere: "📍 আপনি এখানে আছেন:",
      docsNeededLabel: "📄 এই ধাপের জন্য প্রয়োজনীয় নথিপত্র:",
      whatNextLabel: "➡️ পরবর্তী পদক্ষেপ:",
      listenBtn: "🔊 শুনুন",
      speakingBtn: "🔊 বলছে…",
      reanalyzeBtn: "🔄 পুনরায় বিশ্লেষণ",
      chatPlaceholder: "এই ফর্ম সম্পর্কে কিছু জিজ্ঞাসা করুন…",
      chatWelcome: "👋 নমস্কার! আমি জনসেতু AI সহকারী। এই ফর্ম সম্পর্কে যেকোনো প্রশ্ন জিজ্ঞাসা করুন।",
      footerText: "জনসেতু AI দ্বারা চালিত · কোনো ডেটা সংরক্ষিত নয়",
      thinking: "⏳ ভাবছে…",
    },
    ta: {
      guideTitle: "ஜன்சேது AI வழிகாட்டி",
      whatDoIDo: "இங்கு என்ன செய்ய வேண்டும்?",
      tabAnalyze: "📷 பகுப்பாய்வு",
      tabAsk: "💬 AI-யிடம் கேளுங்கள்",
      welcomeTitle: "விண்ணப்பிக்க உதவ தயார்!",
      welcomeSub: "உங்கள் மொழியில் படிப்படியான வழிகாட்டலைப் பெற கீழே கிளிக் செய்யவும்.",
      analyzeBtn: "📷 இந்த பக்கத்தை பகுப்பாய்வு செய்",
      analyzingText: "திரை பகுப்பாய்வு செய்யப்படுகிறது…",
      analyzingSub: "ஜன்சேது AI இந்த படிவத்தைப் படிக்கிறது",
      errorDefault: "ஏதோ தவறு நடந்துவிட்டது. மீண்டும் முயற்சிக்கவும்.",
      tryAgainBtn: "மீண்டும் முயற்சி",
      youAreHere: "📍 நீங்கள் இங்கே உள்ளீர்கள்:",
      docsNeededLabel: "📄 இந்த படிக்கு தேவையான ஆவணங்கள்:",
      whatNextLabel: "➡️ அடுத்து என்ன செய்ய வேண்டும்:",
      listenBtn: "🔊 கேட்க",
      speakingBtn: "🔊 பேசுகிறது…",
      reanalyzeBtn: "🔄 மீண்டும் பகுப்பாய்வு",
      chatPlaceholder: "இந்த படிவம் பற்றி எதையும் கேளுங்கள்…",
      chatWelcome: "👋 வணக்கம்! நான் உங்கள் ஜன்சேது AI வழிகாட்டி. இந்த படிவம் பற்றி ஏதேனும் கேட்கவும்.",
      footerText: "ஜன்சேது AI மூலம் இயக்கப்படுகிறது · தரவு சேமிக்கப்படவில்லை",
      thinking: "⏳ சிந்திக்கிறது…",
    },
    te: {
      guideTitle: "జన్సేతు AI గైడ్",
      whatDoIDo: "ఇక్కడ ఏమి చేయాలి?",
      tabAnalyze: "📷 విశ్లేషించండి",
      tabAsk: "💬 AI ని అడగండి",
      welcomeTitle: "దరఖాస్తుకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాము!",
      welcomeSub: "ఈ పేజీని విశ్లేషించడానికి మరియు మీ భాషలో మార్గదర్శకత్వం పొందడానికి క్రింద క్లిక్ చేయండి.",
      analyzeBtn: "📷 ఈ పేజీని విశ్లేషించండి",
      analyzingText: "స్క్రీన్ విశ్లేషించబడుతోంది…",
      analyzingSub: "జన్సేతు AI ఈ ఫారమ్‌ను చదువుతోంది",
      errorDefault: "ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
      tryAgainBtn: "మళ్లీ ప్రయత్నించండి",
      youAreHere: "📍 మీరు ఇక్కడ ఉన్నారు:",
      docsNeededLabel: "📄 ఈ దశకు అవసరమైన పత్రాలు:",
      whatNextLabel: "➡️ తర్వాత ఏమి చేయాలి:",
      listenBtn: "🔊 వినండి",
      speakingBtn: "🔊 మాట్లాడుతోంది…",
      reanalyzeBtn: "🔄 మళ్లీ విశ్లేషించండి",
      chatPlaceholder: "ఈ ఫారమ్ గురించి ఏదైనా అడగండి…",
      chatWelcome: "👋 నమస్కారం! నేను మీ జన్సేతు AI గైడ్. ఈ ఫారమ్ గురించి ఏదైనా అడగండి.",
      footerText: "జన్సేతు AI ద్వారా ఆధారితం · డేటా నిల్వ చేయబడదు",
      thinking: "⏳ ఆలోచిస్తోంది…",
    },
  };

  var DOC_NAMES = {
    hi: {
      "Identity Document": "पहचान प्रमाण पत्र",
      "Mobile Number (OTP)": "मोबाइल नंबर (OTP)",
      "Aadhaar Card": "आधार कार्ड",
      "Bank Account Details": "बैंक खाता विवरण",
      "Bank account passbook": "बैंक पासबुक",
      "Income Proof": "आय प्रमाण पत्र",
      "Land Records": "भूमि रिकॉर्ड (खसरा/खतौनी)",
      "Land ownership record (Khasra/Khatauni)": "भूमि स्वामित्व रिकॉर्ड (खसरा/खतौनी)",
      "Passport-size photograph": "पासपोर्ट साइज फोटो",
      "Photograph": "पासपोर्ट साइज फोटो",
      "Caste certificate (if SC/ST)": "जाति प्रमाण पत्र (SC/ST हेतु)",
      "BPL/SECC 2011 data registration": "BPL / SECC 2011 पंजीकरण विवरण",
      "Family details as per SECC / Ration Card data": "राशन कार्ड / SECC परिवार विवरण",
      "Aadhaar Card or Ration Card": "आधार कार्ड या राशन कार्ड",
    },
    bn: {
      "Identity Document": "পরিচয় প্রমাণপত্র",
      "Mobile Number (OTP)": "মোবাইল নম্বর (OTP)",
      "Aadhaar Card": "আধার কার্ড",
      "Bank Account Details": "ব্যাঙ্ক অ্যাকাউন্ট বিবরণ",
      "Bank account passbook": "ব্যাঙ্ক পাসবুক",
      "Income Proof": "আয় শংসাপত্র",
      "Land Records": "জমির রেকর্ড (খসড়া/খতিয়ান)",
      "Land ownership record (Khasra/Khatauni)": "জমির রেকর্ড (খসড়া/খতিয়ান)",
      "Photograph": "পাসপোর্ট সাইজ ছবি",
      "Caste certificate (if SC/ST)": "জাতিগত শংসাপত্র (SC/ST)",
      "Aadhaar Card or Ration Card": "আধার কার্ড বা রেশন কার্ড",
    },
    ta: {
      "Identity Document": "அடையாள சான்று",
      "Mobile Number (OTP)": "கைபேசி எண் (OTP)",
      "Aadhaar Card": "ஆதார் அட்டை",
      "Bank Account Details": "வங்கி கணக்கு விவரங்கள்",
      "Bank account passbook": "வங்கி கணக்கு புத்தகம்",
      "Income Proof": "வருமான சான்றிதழ்",
      "Land Records": "நில பதிவுகள் (கஸ்ரா)",
      "Photograph": "புகைப்படம்",
      "Caste certificate (if SC/ST)": "சாதி சான்றிதழ் (SC/ST)",
      "Aadhaar Card or Ration Card": "ஆதார் அட்டை அல்லது ரேஷன் அட்டை",
    },
    te: {
      "Identity Document": "గుర్తింపు పత్రం",
      "Mobile Number (OTP)": "మొబైల్ నంబర్ (OTP)",
      "Aadhaar Card": "ఆధార్ కార్డు",
      "Bank Account Details": "బ్యాంక్ ఖాతా వివరాలు",
      "Bank account passbook": "బ్యాంక్ పాస్‌బుక్",
      "Income Proof": "ఆదాయ ధృవీకరణ పత్రం",
      "Land Records": "భూమి రికార్డులు (ఖస్రా)",
      "Photograph": "పాస్‌పోర్ట్ సైజు ఫోటో",
      "Caste certificate (if SC/ST)": "కుల ధృవీకరణ పత్రం (SC/ST)",
      "Aadhaar Card or Ration Card": "ఆధార్ కార్డు లేదా రేషన్ కార్డు",
    },
  };

  function translateDoc(docName, lang) {
    var langKey = (lang || "en").slice(0, 2);
    var langMap = DOC_NAMES[langKey];
    if (langMap && langMap[docName]) return langMap[docName];
    return docName;
  }

  function getLang(ctx) {
    var l = (ctx && ctx.lang) ? String(ctx.lang).slice(0, 2) : "en";
    return I18N[l] ? l : "en";
  }

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
        var targetWidth = maxWidth || 640;
        var scale = img.width > targetWidth ? targetWidth / img.width : 1;
        var canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.65).replace(/^data:image\/\w+;base64,/, ""));
      };
      img.onerror = function() { resolve(base64); };
      img.src = "data:image/jpeg;base64," + base64;
    });
  }

  function createFloatingButton(lang) {
    var l = lang || "en";
    var t = I18N[l] || I18N.en;
    var btn = document.createElement("button");
    btn.id = "jansetu-assist-btn";
    btn.setAttribute("aria-label", "JanSetu: " + t.whatDoIDo);
    btn.innerHTML =
      '<span class="js-btn-icon">' + E_ROBOT + '</span>' +
      '<span class="js-btn-label">' + t.whatDoIDo + '</span>';
    document.body.appendChild(btn);
    return btn;
  }

  function createPanel(lang) {
    var l = lang || "en";
    var t = I18N[l] || I18N.en;

    var panel = document.createElement("div");
    panel.id = "jansetu-panel";
    panel.className = "js-hidden";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-live", "polite");
    panel.innerHTML =
      '<div class="js-panel-header">' +
        '<div class="js-panel-title">' +
          '<span class="js-logo">' + E_FLAG + '</span>' +
          '<span id="jansetu-header-title">' + t.guideTitle + '</span>' +
        '</div>' +
        '<div class="js-header-actions">' +
          '<select id="jansetu-lang-select" class="js-lang-select" aria-label="Select Language">' +
            '<option value="en"' + (l === "en" ? " selected" : "") + '>English</option>' +
            '<option value="hi"' + (l === "hi" ? " selected" : "") + '>हिंदी</option>' +
            '<option value="bn"' + (l === "bn" ? " selected" : "") + '>বাংলা</option>' +
            '<option value="ta"' + (l === "ta" ? " selected" : "") + '>தமிழ்</option>' +
            '<option value="te"' + (l === "te" ? " selected" : "") + '>తెలుగు</option>' +
          '</select>' +
          '<button class="js-close-btn" id="jansetu-close-btn" aria-label="Close">\u2715</button>' +
        '</div>' +
      '</div>' +

      // Tab bar
      '<div class="js-tab-bar">' +
        '<button class="js-tab js-tab-active" id="jansetu-tab-analyze" data-tab="analyze">' + t.tabAnalyze + '</button>' +
        '<button class="js-tab" id="jansetu-tab-ask" data-tab="ask">' + t.tabAsk + '</button>' +
      '</div>' +

      // ── Tab: Analyze Screen ──────────────────────────────────────
      '<div class="js-tab-content js-panel-body" id="jansetu-tab-content-analyze">' +

        // 1. Welcome view
        '<div id="jansetu-welcome" class="js-state-view js-welcome-view">' +
          '<div class="js-welcome-icon">' + E_TEMPLE + '</div>' +
          '<p class="js-welcome-title" id="jansetu-welcome-title">' + t.welcomeTitle + '</p>' +
          '<p class="js-welcome-sub" id="jansetu-welcome-sub">' + t.welcomeSub + '</p>' +
          '<button class="js-analyze-btn" id="jansetu-analyze-btn">' + t.analyzeBtn + '</button>' +
        '</div>' +

        // 2. Loading view
        '<div id="jansetu-loading" class="js-state-view js-loading-view js-hidden">' +
          '<div class="js-spinner"></div>' +
          '<p class="js-loading-text" id="jansetu-loading-text">' + t.analyzingText + '</p>' +
          '<p class="js-loading-sub" id="jansetu-loading-sub">' + t.analyzingSub + '</p>' +
        '</div>' +

        // 3. Error view
        '<div id="jansetu-error" class="js-state-view js-error-view js-hidden">' +
          '<span class="js-error-icon">' + E_WARN + '</span>' +
          '<p id="jansetu-error-msg">' + t.errorDefault + '</p>' +
          '<button class="js-retry-btn" id="jansetu-retry-btn">' + t.tryAgainBtn + '</button>' +
        '</div>' +

        // 4. Result view
        '<div id="jansetu-result" class="js-state-view js-hidden">' +
          '<div class="js-section-card">' +
            '<div class="js-section-label" id="jansetu-label-here">' + t.youAreHere + '</div>' +
            '<p id="jansetu-section" class="js-section-text"></p>' +
          '</div>' +
          '<div class="js-docs-card">' +
            '<div class="js-docs-label" id="jansetu-label-docs">' + t.docsNeededLabel + '</div>' +
            '<ul id="jansetu-docs" class="js-docs-list"></ul>' +
          '</div>' +
          '<div class="js-action-card">' +
            '<div class="js-action-label" id="jansetu-label-action">' + t.whatNextLabel + '</div>' +
            '<p id="jansetu-action" class="js-action-text"></p>' +
          '</div>' +
          '<div class="js-result-footer">' +
            '<button class="js-listen-btn" id="jansetu-listen-btn">' + t.listenBtn + '</button>' +
            '<button class="js-analyze-btn js-reanalyze" id="jansetu-reanalyze-btn">' + t.reanalyzeBtn + '</button>' +
          '</div>' +
        '</div>' +

      '</div>' +

      // ── Tab: Ask AI ──────────────────────────────────────────────
      '<div class="js-tab-content js-panel-body js-hidden" id="jansetu-tab-content-ask">' +
        '<div id="jansetu-chat-messages" class="js-chat-messages"></div>' +
        '<div class="js-chat-input-row">' +
          '<input type="text" id="jansetu-chat-input" class="js-chat-input" placeholder="' + t.chatPlaceholder + '" maxlength="300" />' +
          '<button id="jansetu-chat-send" class="js-chat-send-btn" aria-label="Send">\u27A4</button>' +
        '</div>' +
      '</div>' +

      '<div class="js-panel-footer" id="jansetu-panel-footer">' + t.footerText + '</div>';

    document.body.appendChild(panel);
    return panel;
  }

  function applyTranslations(panel, lang, btn) {
    var l = lang || "en";
    var t = I18N[l] || I18N.en;

    if (btn) {
      var btnLabel = btn.querySelector(".js-btn-label");
      if (btnLabel) btnLabel.textContent = t.whatDoIDo;
      btn.setAttribute("aria-label", "JanSetu: " + t.whatDoIDo);
    }

    var headerTitle = panel.querySelector("#jansetu-header-title");
    if (headerTitle) headerTitle.textContent = t.guideTitle;

    var tabAnalyze = panel.querySelector("#jansetu-tab-analyze");
    if (tabAnalyze) tabAnalyze.textContent = t.tabAnalyze;

    var tabAsk = panel.querySelector("#jansetu-tab-ask");
    if (tabAsk) tabAsk.textContent = t.tabAsk;

    var welcomeTitle = panel.querySelector("#jansetu-welcome-title");
    if (welcomeTitle) welcomeTitle.textContent = t.welcomeTitle;

    var welcomeSub = panel.querySelector("#jansetu-welcome-sub");
    if (welcomeSub) welcomeSub.textContent = t.welcomeSub;

    var analyzeBtn = panel.querySelector("#jansetu-analyze-btn");
    if (analyzeBtn) analyzeBtn.textContent = t.analyzeBtn;

    var loadingText = panel.querySelector("#jansetu-loading-text");
    if (loadingText) loadingText.textContent = t.analyzingText;

    var loadingSub = panel.querySelector("#jansetu-loading-sub");
    if (loadingSub) loadingSub.textContent = t.analyzingSub;

    var retryBtn = panel.querySelector("#jansetu-retry-btn");
    if (retryBtn) retryBtn.textContent = t.tryAgainBtn;

    var labelHere = panel.querySelector("#jansetu-label-here");
    if (labelHere) labelHere.textContent = t.youAreHere;

    var labelDocs = panel.querySelector("#jansetu-label-docs");
    if (labelDocs) labelDocs.textContent = t.docsNeededLabel;

    var labelAction = panel.querySelector("#jansetu-label-action");
    if (labelAction) labelAction.textContent = t.whatNextLabel;

    var listenBtn = panel.querySelector("#jansetu-listen-btn");
    if (listenBtn && !listenBtn.textContent.includes("Speaking") && !listenBtn.textContent.includes("बोल")) {
      listenBtn.textContent = t.listenBtn;
    }

    var reanalyzeBtn = panel.querySelector("#jansetu-reanalyze-btn");
    if (reanalyzeBtn) reanalyzeBtn.textContent = t.reanalyzeBtn;

    var chatInput = panel.querySelector("#jansetu-chat-input");
    if (chatInput) chatInput.placeholder = t.chatPlaceholder;

    var footer = panel.querySelector("#jansetu-panel-footer");
    if (footer) footer.textContent = t.footerText;

    var langSelect = panel.querySelector("#jansetu-lang-select");
    if (langSelect && langSelect.value !== l) {
      langSelect.value = l;
    }
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

  function showError(panel, msg, lang) {
    var l = lang || "en";
    var t = I18N[l] || I18N.en;
    var isInvalidated = String(msg || "").indexOf("Extension context invalidated") !== -1;
    var displayMsg = isInvalidated
      ? (l === "hi" ? "एक्सटेंशन अपडेट हुआ है। कृपया इस पेज को रिफ्रेश (F5) करें।" : "Extension was reloaded. Please refresh this webpage (press F5) to reconnect.")
      : (msg || t.errorDefault);
    panel.querySelector("#jansetu-error-msg").textContent = displayMsg;
    showState(panel, "error");
  }

  var _lastResultData = null;

  function renderResult(panel, data, ctx) {
    _lastResultData = data;
    var l = getLang(ctx);
    var t = I18N[l] || I18N.en;

    panel.querySelector("#jansetu-section").textContent = data.sectionSummary || (l === "hi" ? "आवेदन फॉर्म चरण" : "Application Form Step");

    var docsList = panel.querySelector("#jansetu-docs");
    docsList.innerHTML = "";
    (data.docsNeeded || []).forEach(function(doc) {
      var translatedDoc = translateDoc(doc, l);
      var li = document.createElement("li");
      li.className = "js-doc-item js-doc-needed";
      li.innerHTML = '<span class="js-doc-tick">' + E_TICK + '</span> ' + translatedDoc;
      docsList.appendChild(li);
    });

    (data.allDocs || []).filter(function(d) {
      return !(data.docsNeeded || []).includes(d);
    }).forEach(function(doc) {
      var translatedDoc = translateDoc(doc, l);
      var li = document.createElement("li");
      li.className = "js-doc-item js-doc-other";
      li.innerHTML = '<span class="js-doc-dot">' + E_DOT + '</span> ' + translatedDoc;
      docsList.appendChild(li);
    });

    panel.querySelector("#jansetu-action").textContent = data.nextAction || (l === "hi" ? "आवश्यक विवरण भरकर आगे बढ़ें।" : "Proceed with filling the required details.");

    var listenBtn = panel.querySelector("#jansetu-listen-btn");
    listenBtn.textContent = t.listenBtn;
    listenBtn.onclick = function() {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      var utt = new SpeechSynthesisUtterance(data.spokenText || data.sectionSummary);
      utt.lang = l + "-IN";
      window.speechSynthesis.speak(utt);
      listenBtn.textContent = t.speakingBtn;
      utt.onend = function() { listenBtn.textContent = t.listenBtn; };
      utt.onerror = function() { listenBtn.textContent = t.listenBtn; };
    };

    showState(panel, "result");
  }

  var _ctx = null;

  function runAnalysis(panel, ctx) {
    var l = getLang(ctx);
    showState(panel, "loading");

    try {
      chrome.runtime.sendMessage({ type: "CAPTURE_REQUEST" }, function(captureRes) {
        if (chrome.runtime.lastError) {
          showError(panel, chrome.runtime.lastError.message, l);
          return;
        }
        if (!captureRes || !captureRes.ok) {
          showError(panel, captureRes ? captureRes.error : "Screenshot capture failed.", l);
          return;
        }

        downscaleBase64(captureRes.base64, 640).then(function(imageBase64) {
          chrome.runtime.sendMessage({
            type: "ANALYZE_REQUEST",
            schemeId: ctx.schemeId,
            imageBase64: imageBase64,
            lang: l,
            token: ctx.token,
          }, function(analyzeRes) {
            if (chrome.runtime.lastError) {
              showError(panel, chrome.runtime.lastError.message, l);
              return;
            }
            if (!analyzeRes || !analyzeRes.ok) {
              showError(panel, analyzeRes ? analyzeRes.error : "Analysis failed.", l);
              return;
            }
            renderResult(panel, analyzeRes.data, ctx);
          });
        }).catch(function(err) {
          showError(panel, err.message || "Failed to process screenshot.", l);
        });
      });
    } catch (e) {
      showError(panel, e.message || "Extension connection error.", l);
    }
  }

  function makeDraggable(el) {
    var header = el.querySelector(".js-panel-header");
    if (!header) return;
    var dx = 0, dy = 0, sx = 0, sy = 0;
    header.style.cursor = "grab";
    header.addEventListener("mousedown", function(e) {
      if (e.target && (e.target.tagName === "SELECT" || e.target.tagName === "BUTTON")) return;
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
    var l = getLang(ctx);
    var t = I18N[l] || I18N.en;

    var input = panel.querySelector("#jansetu-chat-input");
    var sendBtn = panel.querySelector("#jansetu-chat-send");
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;

    appendChatMessage(panel, "user", question);
    var thinkingMsg = appendChatMessage(panel, "ai", t.thinking);

    try {
      chrome.runtime.sendMessage({
        type: "ASK_REQUEST",
        schemeId: ctx.schemeId,
        question: question,
        lang: l,
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
    var l = getLang(ctx);
    var t = I18N[l] || I18N.en;
    var input   = panel.querySelector("#jansetu-chat-input");
    var sendBtn = panel.querySelector("#jansetu-chat-send");

    // Welcome message
    appendChatMessage(panel, "ai", t.chatWelcome);

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
      _ctx = ctx || { schemeId: "general", lang: "hi", token: "guest" };
      var activeLang = getLang(_ctx);

      console.log("[JanSetu] Co-Pilot active for scheme:", _ctx.schemeId, "| lang:", activeLang);

      var btn   = createFloatingButton(activeLang);
      var panel = createPanel(activeLang);

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

      // Language Switcher Dropdown Listener
      var langSelect = panel.querySelector("#jansetu-lang-select");
      if (langSelect) {
        langSelect.addEventListener("change", function(e) {
          var newLang = e.target.value;
          _ctx.lang = newLang;
          applyTranslations(panel, newLang, btn);
          if (_lastResultData) {
            renderResult(panel, _lastResultData, _ctx);
          }
        });
      }

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