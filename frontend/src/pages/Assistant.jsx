import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Bot, Mic, Loader2, Sparkles, RotateCcw, User, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import SchemeCard from '../components/Chat/SchemeCard';
import SchemeSlider from '../components/Chat/SchemeSlider';
import LanguageChangeModal from '../components/Common/LanguageChangeModal';
import toast from 'react-hot-toast';

const rawUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
];

const QUICK_PROMPTS_BY_LANG = {
  hi: [
    'मुझे शिक्षा और छात्रवृत्ति से संबंधित योजनाएँ चाहिए',
    'किसानों और कृषि के लिए योजनाएं दिखाएं',
    'आवास सहायता योजनाएं खोजें',
    'स्वास्थ्य और आयुष्मान योजनाएं बताएं',
    'युवाओं के लिए रोजगार और कौशल योजनाएं',
  ],
  bn: [
    'আমাকে শিক্ষা এবং বৃত্তি সম্পর্কিত প্রকল্প দেখান',
    'কৃষকদের জন্য কৃষি প্রকল্প দেখান',
    'আবাসন সহায়তা প্রকল্প খুঁজুন',
    'স্বাস্থ্য বীমা প্রকল্প সম্পর্কে জানান',
    'যুবকদের জন্য কর্মসংস্থান প্রকল্প',
  ],
  ta: [
    'கல்வி மற்றும் உதவித்தொகை திட்டங்களை எனக்குக் காட்டுங்கள்',
    'விவசாயிகளுக்கான திட்டங்களை காட்டுங்கள்',
    'வீட்டு வசதி உதவித் திட்டங்கள்',
    'மருத்துவ காப்பீட்டு திட்டங்கள்',
    'வேலைவாய்ப்பு மற்றும் திறன் திட்டங்கள்',
  ],
  te: [
    'నాకు విద్య మరియు స్కాలర్‌షిప్ పథకాలు కావాలి',
    'రైతుల కోసం వ్యవసాయ పథకాలను చూపించండి',
    'గృహ నిర్మాణ సహాయ పథకాలు',
    'ఆరోగ్య బీమా పథకాల గురించి చెప్పండి',
    'యువత కోసం ఉపాధి పథకాలు',
  ],
  en: [
    'I want education and scholarship schemes',
    'Show me farming and agriculture schemes',
    'Find housing assistance schemes',
    'I need health insurance schemes',
    'Employment and skill schemes for youth',
  ],
};

const GREETINGS_BY_LANG = {
  hi: (name) => `नमस्ते${name ? `, ${name}` : ''}! 👋 मैं जन-सेतु AI हूँ। आप किस प्रकार की सरकारी योजनाएँ खोजना चाहते हैं?\n\nआप पूछ सकते हैं: *"मुझे शिक्षा संबंधित योजनाएँ चाहिए"* या *"किसानों के लिए योजनाएं दिखाएं"*।`,
  bn: (name) => `নমস্কার${name ? `, ${name}` : ''}! 👋 আমি জন-সেতু AI। আপনি কোন ধরনের সরকারি প্রকল্প খুঁজছেন?\n\nআপনি বলতে পারেন: *"আমাকে শিক্ষা সম্পর্কিত প্রকল্প দেখান"*।`,
  ta: (name) => `வணக்கம்${name ? `, ${name}` : ''}! 👋 நான் ஜன-சேது AI. உங்களுக்கு என்ன அரசு நலத்திட்டங்கள் தேவை?\n\nஉதாரணம்: *"கல்வி உதவித்தொகை திட்டங்களை காட்டுங்கள்"*।`,
  te: (name) => `నమస్తే${name ? `, ${name}` : ''}! 👋 నేను జన-సేతు AI. మీరు ఎలాంటి ప్రభుత్వ సంక్షేమ పథకాల కోసం చూస్తున్నారు?\n\nఉదాహరణ: *"నాకు విద్య పథకాలు కావాలి"*।`,
  en: (name) => `Namaste${name ? `, ${name}` : ''}! 👋 I'm JanSetu AI. Tell me what kind of government schemes you're looking for and I'll find the most relevant ones for you.\n\nYou can ask things like *"I want education schemes"* or *"Show me farming schemes"*.`,
};

function getProfileSummary(profile) {
  if (!profile) return null;
  const parts = [];
  if (profile.occupation) parts.push(profile.occupation);
  if (profile.state) parts.push(profile.state);
  if (profile.incomeBracket) parts.push(`income ${profile.incomeBracket}`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export default function Assistant() {
  const { user, token, updateLanguage } = useAuth();
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'en').slice(0, 2);
  const profile = user?.profile || {};

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getGreeting = useCallback((lang = currentLang) => {
    const langCode = (lang || 'en').slice(0, 2);
    const fn = GREETINGS_BY_LANG[langCode] || GREETINGS_BY_LANG['en'];
    const firstName = user?.name ? user.name.split(' ')[0] : '';
    return fn(firstName);
  }, [currentLang, user]);

  const [messages, setMessages] = useState(() => [
    {
      id: 'greeting',
      sender: 'bot',
      text: getGreeting(currentLang),
      schemes: [],
    }
  ]);

  const prevLangRef = useRef(currentLang);

  // When language changes (from Navbar, Dropdown, or Profile), reset chatbot and its history completely
  useEffect(() => {
    if (prevLangRef.current !== currentLang) {
      prevLangRef.current = currentLang;
      setMessages([
        {
          id: 'greeting',
          sender: 'bot',
          text: getGreeting(currentLang),
          schemes: [],
        }
      ]);
      setInput('');
    }
  }, [currentLang, getGreeting]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSelectLanguage = (lang) => {
    setLangDropdownOpen(false);
    if (lang.code === currentLang) return;
    setPendingLanguage(lang);
  };

  // Language Change Confirmation Handler: updates i18n, saves to DB, and RESTARTS the chat
  const handleConfirmLanguageChange = async () => {
    if (!pendingLanguage) return;
    const newLangCode = pendingLanguage.code;
    const langObj = pendingLanguage;
    setPendingLanguage(null);

    if (updateLanguage) {
      await updateLanguage(newLangCode);
    } else {
      i18n.changeLanguage(newLangCode);
      localStorage.setItem('i18nextLng', newLangCode);
    }

    // Restart chat completely in the newly selected language
    const newGreeting = getGreeting(newLangCode);
    setMessages([
      {
        id: 'greeting',
        sender: 'bot',
        text: newGreeting,
        schemes: [],
      }
    ]);
    setInput('');

    const toastMsg = newLangCode === 'hi'
      ? `भाषा बदलकर ${langObj.native} कर दी गई! चैट रीस्टार्ट हो गई।`
      : `Language changed to ${langObj.native}! Chat restarted.`;
    toast.success(toastMsg);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Send recent conversation context (last 6 turns)
    const history = messages
      .slice(-6)
      .filter(m => m.text)
      .map(m => ({ sender: m.sender, text: m.text }));

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          profile,
          language: currentLang,
          history,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Request failed');
      }

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: data.reply || 'Here are some schemes that might help you.',
          schemes: data.schemes || [],
          lastUserQuery: text,
        }
      ]);
    } catch (err) {
      toast.error(err.message || 'Failed to reach JanSetu AI');
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: 'bot',
          text: currentLang === 'hi'
            ? 'क्षमा करें, सर्वर से कनेक्ट करने में समस्या हुई। कृपया पुनः प्रयास करें।'
            : 'Sorry, I had trouble connecting. Please try again.',
          schemes: [],
          isError: true,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();
  const initialQueryHandled = useRef(false);

  // Automatically execute initial query passed from Home or other pages
  useEffect(() => {
    if (location.state?.initialQuery && !initialQueryHandled.current) {
      initialQueryHandled.current = true;
      sendMessage(location.state.initialQuery);
    }
  }, [location.state]);

  const handleAskMore = (lastQuery) => {
    let moreQuery = '';
    if (currentLang === 'hi') {
      moreQuery = lastQuery ? `कृपया "${lastQuery}" से संबंधित और अधिक सरकारी योजनाएँ खोजें` : 'कृपया मुझे और अधिक सरकारी योजनाएं दिखाएं';
    } else if (currentLang === 'bn') {
      moreQuery = lastQuery ? `অনুগ্রহ করে "${lastQuery}" সম্পর্কিত আরও সরকারি প্রকল্প দেখান` : 'অনুগ্রহ করে আমাকে আরও প্রকল্প দেখান';
    } else if (currentLang === 'ta') {
      moreQuery = lastQuery ? `"${lastQuery}" தொடர்பான மேலும் அரசு திட்டங்களைக் காட்டுங்கள்` : 'மேலும் அரசு திட்டங்களைக் காட்டுங்கள்';
    } else if (currentLang === 'te') {
      moreQuery = lastQuery ? `"${lastQuery}"కి సంబంధించిన మరిన్ని ప్రభుత్వ పథకాలను చూపించండి` : 'మరిన్ని ప్రభుత్వ పథకాలను చూపించండి';
    } else {
      moreQuery = lastQuery ? `Show me more government schemes related to "${lastQuery}"` : 'Show me more government schemes';
    }
    sendMessage(moreQuery);
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    const langMap = { hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', en: 'en-IN' };
    recognition.lang = langMap[currentLang] || 'en-IN';
    recognition.interimResults = false;
    setIsListening(true);
    toast(currentLang === 'hi' ? '🎙️ सुन रहे हैं... बोलिए' : '🎙️ Listening… speak now', { duration: 3000 });
    recognition.start();
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      sendMessage(transcript);
    };
    recognition.onerror = () => { setIsListening(false); };
    recognition.onend = () => setIsListening(false);
  };

  const handleReset = () => {
    setMessages([{
      id: 'greeting',
      sender: 'bot',
      text: getGreeting(currentLang),
      schemes: [],
    }]);
    toast(currentLang === 'hi' ? 'नई चैट प्रारंभ की गई' : 'New chat started', { icon: '🔄' });
  };

  const quickPrompts = QUICK_PROMPTS_BY_LANG[currentLang] || QUICK_PROMPTS_BY_LANG['en'];
  const profileSummary = getProfileSummary(profile);
  const activeLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  const placeholderText = currentLang === 'hi'
    ? 'सरकारी योजनाओं के बारे में यहाँ पूछें...'
    : currentLang === 'bn'
    ? 'সরকারি প্রকল্প সম্পর্কে এখানে জিজ্ঞাসা করুন...'
    : currentLang === 'ta'
    ? 'அரசு திட்டங்கள் பற்றி இங்கே கேளுங்கள்...'
    : currentLang === 'te'
    ? 'ప్రభుత్వ పథకాల గురించి ఇక్కడ అడగండి...'
    : 'Ask about any government scheme…';

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFA]">

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200/90 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0A1633] flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">JanSetu AI</p>
              {profileSummary && (
                <p className="text-[11px] text-slate-400">Profile: {profileSummary}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Interactive Language Selector with chat restart */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                title="Change language (restarts chat)"
              >
                <Globe className="w-3.5 h-3.5 text-orange-600" />
                <span>{activeLangObj.native}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    Select Language
                  </div>
                  {LANGUAGES.map((lang) => {
                    const isActive = currentLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleSelectLanguage(lang)}
                        className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                          isActive
                            ? 'bg-orange-50 text-orange-600'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{lang.native}</span>
                          <span className="text-[10px] text-slate-400">{lang.label}</span>
                        </div>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Restart Button */}
            <button
              onClick={handleReset}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
              title="Restart conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col gap-6">

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}>

            {/* Bot avatar */}
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-xl bg-[#0A1633] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`flex flex-col gap-3 max-w-2xl ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Text bubble */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#1E293B] text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-red-50 border border-red-200 text-red-700 rounded-tl-none'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none'
                }`}
              >
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>
                    {line.split(/\*([^*]+)\*/g).map((part, j) =>
                      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                    )}
                    {i < msg.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>

              {/* Scheme cards with Horizontal Slider / Grid toggle & Load More */}
              {msg.schemes && msg.schemes.length > 0 && (
                <SchemeSlider
                  schemes={msg.schemes}
                  onAskMore={() => handleAskMore(msg.lastUserQuery || input)}
                  queryText={msg.lastUserQuery || ''}
                />
              )}
            </div>

            {/* User avatar */}
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0A1633] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              <span className="text-sm text-slate-500">
                {currentLang === 'hi'
                  ? 'जन-सेतु AI योजनाएँ खोज रहा है...'
                  : 'JanSetu AI is finding schemes…'}
              </span>
            </div>
          </div>
        )}

        {/* Quick prompt chips — only shown on first message */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 pl-11">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs bg-white border border-slate-200 text-slate-600 font-medium px-3.5 py-2 rounded-full hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50/50 transition-all cursor-pointer shadow-sm text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          {/* Mic button */}
          <button
            onClick={handleVoice}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-all cursor-pointer shrink-0 ${
              isListening ? 'bg-red-500 animate-pulse' : 'bg-[#F97316] hover:bg-[#EA580C]'
            }`}
            title="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Text input */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex-1 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              id="assistant-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholderText}
              disabled={loading}
              className="flex-1 bg-slate-100/90 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl bg-[#1E293B] hover:bg-slate-900 disabled:opacity-40 text-white flex items-center justify-center shadow-sm shrink-0 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal for Language Change */}
      <LanguageChangeModal
        isOpen={!!pendingLanguage}
        targetLanguage={pendingLanguage}
        onClose={() => setPendingLanguage(null)}
        onConfirm={handleConfirmLanguageChange}
      />
    </div>
  );
}
