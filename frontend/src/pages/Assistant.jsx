import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mic, Send, Bot, Info, ArrowRight, CheckCircle2,
  Loader2, Edit3, Check, RotateCcw
} from 'lucide-react';
import { sendMessage } from '../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// Fields that should only appear in the review screen if they were actually collected
const REVIEW_FIELDS = [
  { key: 'occupation',     label_key: 'assistant.occupation',     label: 'Occupation',      always: true },
  { key: 'annualIncome',   label_key: 'assistant.annual_income',  label: 'Annual Income',   always: true },
  { key: 'location',       label_key: 'assistant.location',       label: 'Location',        always: true },
  { key: 'familyMembers',  label_key: 'assistant.family_members', label: 'Family Members',  always: false },
  { key: 'landOwnership',  label_key: 'assistant.land_ownership', label: 'Land Ownership',  always: false, occupations: ['Farmer'] },
  { key: 'caste',          label_key: 'assistant.caste',          label: 'Category',        always: false, occupations: ['Student'] },
  { key: 'residence_type', label_key: 'assistant.residence_type', label: 'Area Type',       always: false },
  { key: 'has_pucca_house',label_key: 'assistant.housing_type',   label: 'Housing Type',    always: false },
];

const formatHousingType = (val) => {
  if (val === true) return 'Pucca house (permanent)';
  if (val === false) return 'Kutcha / temporary dwelling';
  return null;
};

const formatResidenceType = (val) => {
  if (!val) return null;
  return val.charAt(0).toUpperCase() + val.slice(1);
};

export default function Assistant() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Compute greeting based on current language
  const getGreeting = useCallback(() =>
    t('assistant.bot_greeting',
      "Namaste! Tell me about yourself — your occupation, family situation, income, and location. I'll help find the government schemes you may be eligible for."
    ),
  [t, i18n.language] // eslint-disable-line
  );

  const [messages, setMessages] = useState(() => [{ sender: 'bot', text: getGreeting() }]);
  const [inputVal, setInputVal] = useState(location.state?.initialText || '');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUnderstood, setShowUnderstood] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [lastAskedField, setLastAskedField] = useState(null);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [relevantSchemes, setRelevantSchemes] = useState([]);

  // Profile — null values mean "not collected yet" (distinct from empty string)
  const [profile, setProfile] = useState(() => {
    try {
      const saved = sessionStorage.getItem('jansetu_chat_profile');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Re-generate greeting whenever language changes
  useEffect(() => {
    setMessages(prev => {
      const newGreeting = getGreeting();
      // Only update the first message if it was the bot greeting
      if (prev.length > 0 && prev[0].sender === 'bot') {
        return [{ sender: 'bot', text: newGreeting }, ...prev.slice(1)];
      }
      return prev;
    });
  }, [i18n.language]); // eslint-disable-line

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showUnderstood, isComplete]);

  useEffect(() => {
    if (chatInputRef.current) chatInputRef.current.focus();
  }, [showUnderstood]);

  useEffect(() => {
    if (location.state?.initialText) {
      handleSendText(location.state.initialText);
    }
  }, []); // eslint-disable-line

  const handleStartOver = () => {
    sessionStorage.removeItem('jansetu_chat_profile');
    setProfile({});
    setMessages([{ sender: 'bot', text: getGreeting() }]);
    setIsComplete(false);
    setShowUnderstood(false);
    setIsEditingInline(false);
    setLastAskedField(null);
    setRelevantSchemes([]);
    setInputVal('');
  };

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    const langMap = { hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN' };
    recognition.lang = langMap[i18n.language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    if (!isListening) {
      setIsListening(true);
      toast(t('chat.listening', 'Listening... Speak now'), { icon: '🎙️' });
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(transcript);
        setIsListening(false);
        handleSendText(transcript);
      };
      recognition.onerror = () => { setIsListening(false); toast.error('Voice input ended'); };
      recognition.onend = () => setIsListening(false);
    } else {
      setIsListening(false);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;
    handleSendText(inputVal);
  };

  const handleSendText = async (text) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputVal('');
    setLoading(true);
    try {
      const response = await sendMessage(text, i18n.language || 'en', undefined, profile, lastAskedField);
      if (response?.reply) {
        setMessages(prev => [...prev, { sender: 'bot', text: response.reply }]);
      }
      if (response?.profile) {
        const backendP = response.profile;
        const updated = {
          ...profile,
          ...backendP,
          // Normalize display fields
          annualIncome: backendP.annualIncome
            || (backendP.income_annual != null ? `₹${Number(backendP.income_annual).toLocaleString('en-IN')}` : profile.annualIncome),
          location: backendP.location || backendP.state || profile.location,
          familyMembers: backendP.familyMembers
            || (backendP.family_size != null ? String(backendP.family_size) : profile.familyMembers),
          landOwnership: backendP.landOwnership
            || (backendP.has_land === true && !profile.landOwnership ? 'Owns land' : profile.landOwnership),
          caste: backendP.caste || backendP.category || profile.caste,
        };
        setProfile(updated);
        sessionStorage.setItem('jansetu_chat_profile', JSON.stringify(updated));
      }
      if (response) {
        setIsComplete(Boolean(response.isComplete));
        setLastAskedField(response.nextField || null);
        if (response.relevantSchemes?.length) setRelevantSchemes(response.relevantSchemes);
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determine which tiles to show in review screen
  const getVisibleTiles = () => {
    return REVIEW_FIELDS.filter(field => {
      if (field.always) return true;
      // Occupation-specific tiles
      if (field.occupations) {
        if (!profile.occupation) return false;
        return field.occupations.includes(profile.occupation);
      }
      // Only show if actually collected
      if (field.key === 'has_pucca_house') return profile.has_pucca_house !== undefined && profile.has_pucca_house !== null;
      if (field.key === 'residence_type') return !!profile.residence_type;
      if (field.key === 'landOwnership') {
        // Show for farmers or if land was mentioned
        return profile.occupation === 'Farmer' || profile.landOwnership != null;
      }
      return false;
    });
  };

  const getTileValue = (field) => {
    if (field.key === 'has_pucca_house') return formatHousingType(profile.has_pucca_house);
    if (field.key === 'residence_type') return formatResidenceType(profile.residence_type);
    return profile[field.key] || null;
  };

  const visibleTiles = getVisibleTiles();

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFA]">

      {/* Top Step Progress Bar */}
      <div className="w-full bg-white border-b border-slate-200/90 py-3.5 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          <div className="w-full bg-slate-200/80 h-1 rounded-full overflow-hidden flex">
            <div
              className="bg-[#F97316] h-full rounded-full transition-all duration-500"
              style={{ width: isComplete ? '66%' : showUnderstood ? '100%' : '33%' }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {showUnderstood ? t('assistant.step_review', '2. Review') : t('assistant.step_title', '1. Tell Us')}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('assistant.step_desc', 'You can speak or type. No complicated forms.')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Start Over button */}
              <button
                onClick={handleStartOver}
                className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
                title="Start a new conversation"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Start over</span>
              </button>
              {isComplete && !showUnderstood && (
                <button
                  onClick={() => setShowUnderstood(true)}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-lg border border-orange-200/60 flex items-center gap-1 transition-all cursor-pointer animate-in fade-in"
                >
                  <span>{t('assistant.btn_review', 'Review my information')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-between">

        {!showUnderstood ? (
          /* Chat View */
          <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-lg bg-[#0A1633] flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`rounded-2xl p-4 sm:p-5 max-w-xl text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#1E293B] text-white rounded-tr-none'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none font-normal'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                <span>{t('assistant.analyzing', 'JanSetu is analyzing your details with rules engine...')}</span>
              </div>
            )}

            {/* Review CTA — only when isComplete */}
            {isComplete && !loading && (
              <div className="bg-white border-2 border-orange-200/90 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 my-2 animate-in fade-in slide-in-from-bottom-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {t('assistant.complete_title', 'I have everything I need.')}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {relevantSchemes.length > 0
                      ? `Checking eligibility for: ${relevantSchemes.join(', ')}`
                      : t('assistant.complete_desc', 'You can continue chatting or review your information.')
                    }
                  </p>
                </div>
                <button
                  onClick={() => setShowUnderstood(true)}
                  className="w-full sm:w-auto bg-[#8C3A0A] hover:bg-[#722F08] text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
                >
                  <span>{t('assistant.btn_review', 'Review my information')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Suggestion Pills — only on first message */}
            {!loading && messages.length === 1 && (
              <div className="flex flex-wrap gap-2.5 pt-4">
                {[
                  t('assistant.prompt_1', 'I am a farmer with 2 acres of land'),
                  t('assistant.prompt_2', 'I am looking for housing assistance'),
                  t('assistant.prompt_3', 'I am a student from a low-income family'),
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendText(prompt)}
                    className="text-xs bg-white hover:bg-slate-50 text-slate-700 font-medium px-4 py-2.5 rounded-full border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

        ) : (
          /* Review Screen */
          <div className="max-w-4xl mx-auto w-full py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left Column */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {t('assistant.understood_title', "Here's what we understood")}
                </h1>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  {t('assistant.understood_desc', "We've extracted this information based on your conversation. Please review and confirm before we match you with eligible government schemes.")}
                </p>
                {relevantSchemes.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-3.5 text-xs text-emerald-800 font-medium">
                    <span className="font-bold block mb-1">Schemes being evaluated:</span>
                    <span>{relevantSchemes.join(' · ')}</span>
                  </div>
                )}
                <div className="bg-[#EEF2F6]/90 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 mb-1">{t('assistant.why_need_title', 'Why do we need this?')}</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {t('assistant.why_need_desc', 'Accurate details ensure we only show you schemes where you have a high probability of approval.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column — Dynamic Tiles */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {visibleTiles.map((field) => {
                    const value = getTileValue(field);
                    return (
                      <div key={field.key} className="bg-slate-100/90 rounded-2xl p-4 border border-slate-200/60">
                        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                          {t(field.label_key, field.label)}
                        </span>
                        {isEditingInline ? (
                          <input
                            type="text"
                            value={profile[field.key] || ''}
                            onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                            placeholder={field.label}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 mt-1 focus:outline-none focus:border-orange-500"
                          />
                        ) : (
                          <p className={`text-sm font-bold mt-1 ${value ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                            {value || 'Not specified'}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                  {isEditingInline ? (
                    <button
                      onClick={() => {
                        setIsEditingInline(false);
                        sessionStorage.setItem('jansetu_chat_profile', JSON.stringify(profile));
                        toast.success('Information updated!');
                      }}
                      className="w-full sm:flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save changes</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingInline(true)}
                      className="w-full sm:flex-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-3 px-4 rounded-xl border border-slate-300 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('assistant.btn_edit', 'Edit information')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      sessionStorage.setItem('jansetu_chat_profile', JSON.stringify(profile));
                      navigate('/schemes');
                    }}
                    className="w-full sm:flex-1 bg-[#8C3A0A] hover:bg-[#722F08] text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <span>{t('assistant.btn_find_schemes', 'Yes, find my schemes')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    onClick={() => { setShowUnderstood(false); setIsEditingInline(false); }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline underline-offset-4"
                  >
                    ← {t('assistant.back_to_chat', 'Continue conversation in chat')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Input Bar */}
      {!showUnderstood && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-200/90 py-4 px-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={handleVoiceToggle}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-95 cursor-pointer shrink-0 ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-[#F97316] hover:bg-[#EA580C]'
              }`}
              title="Speak in your language"
            >
              <Mic className="w-5 h-5" />
            </button>
            <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
              <input
                ref={chatInputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={t('assistant.placeholder', 'Describe your situation...')}
                className="w-full bg-slate-100/90 border border-slate-200 text-xs sm:text-[13px] text-slate-800 placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="w-11 h-11 rounded-xl bg-[#1E293B] hover:bg-slate-900 disabled:opacity-40 text-white flex items-center justify-center shadow-sm shrink-0 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
