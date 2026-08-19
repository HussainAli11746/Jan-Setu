import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react';
import StepIndicator from '../Layout/StepIndicator';
import MessageBubble from './MessageBubble';
import VoiceInput from './VoiceInput';
import SchemeList from '../Schemes/SchemeList';
import DigiLockerConsent from '../DigiLocker/DigiLockerConsent';
import FormPreview from '../Application/FormPreview';
import ApplicationTracker from '../Application/ApplicationTracker';

// ---- Demo scheme data ----
const DEMO_SCHEMES = [
  {
    id: 'pmkisan',
    name: 'PM-KISAN',
    fullName: 'PM Kisan Samman Nidhi',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    benefitAmount: '₹6,000 / year',
    benefitDescription: 'Paid in 3 equal installments directly to your bank account',
    eligibilityReasons: ['You are a farmer', 'Annual income below threshold', 'Land ownership confirmed'],
    deadline: '2026-12-31',
    matchPercentage: 97,
    category: 'Agriculture',
    requiredDocuments: ['Aadhaar Card', 'Land Records (Khasra/Khatauni)', 'Bank Passbook'],
  },
  {
    id: 'ayushman',
    name: 'Ayushman Bharat PM-JAY',
    fullName: 'Pradhan Mantri Jan Arogya Yojana',
    ministry: 'Ministry of Health & Family Welfare',
    benefitAmount: '₹5 Lakh / year',
    benefitDescription: 'Cashless health insurance at 25,000+ empanelled hospitals',
    eligibilityReasons: ['Household in SECC list', 'Rural household', 'No existing health coverage'],
    deadline: '2026-10-15',
    matchPercentage: 91,
    category: 'Health',
    requiredDocuments: ['Aadhaar Card', 'Ration Card'],
  },
  {
    id: 'mgnregs',
    name: 'MGNREGS',
    fullName: 'Mahatma Gandhi National Rural Employment Guarantee Scheme',
    ministry: 'Ministry of Rural Development',
    benefitAmount: '100 days / year',
    benefitDescription: 'Guaranteed wage employment at current minimum wage rate',
    eligibilityReasons: ['Rural household', 'Adult member willing to do unskilled work'],
    deadline: '2026-11-30',
    matchPercentage: 88,
    category: 'Employment',
    requiredDocuments: ['Aadhaar Card', 'Job Card (issued by Gram Panchayat)'],
  },
];

// ---- Chat Input Bar ----
const InputBar = ({ onSend, isLoading, disabled }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const send = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div
      className="px-4 py-3"
      style={{ background: '#fff', borderTop: '1px solid #E5E2DC' }}
    >
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <VoiceInput onTranscript={(t) => onSend(t)} />

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              // auto resize
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={t('chat.placeholder')}
            disabled={disabled || isLoading}
            className="input-field resize-none pr-10 py-2.5 leading-snug"
            style={{ minHeight: 42, maxHeight: 120 }}
          />
          <button
            onClick={send}
            disabled={!text.trim() || isLoading || disabled}
            className="absolute right-2 bottom-2 w-7 h-7 rounded flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ background: text.trim() ? '#E8601C' : '#E5E2DC' }}
          >
            <ArrowUp className="w-4 h-4 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <p className="text-center text-[10px] mt-2" style={{ color: '#C5C1BB' }}>
        Documents are verified in-memory only — never stored
      </p>
    </div>
  );
};

// ---- Typing indicator ----
const TypingIndicator = () => (
  <div className="flex items-start gap-2.5 mb-3">
    <div
      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
      style={{ background: 'linear-gradient(135deg, #1A2A6C, #2E4BC6)' }}
    >
      JS
    </div>
    <div
      className="px-4 py-3 rounded-xl rounded-tl-sm flex gap-1.5 items-center"
      style={{ background: '#fff', border: '1px solid #E5E2DC' }}
    >
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  </div>
);

// ---- Main Chat Interface ----
const ChatInterface = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const bottomRef = useRef(null);

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: 'assistant',
        type: 'text',
        text: t('chat.welcome'),
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const addMessage = (msg) =>
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), ...msg }]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    addMessage({ sender: 'user', type: 'text', text, timestamp: new Date().toISOString() });
    setIsLoading(true);

    setTimeout(() => {
      if (currentStep === 1) {
        setCurrentStep(2);
        addMessage({
          sender: 'assistant',
          type: 'scheme-list',
          text: 'Based on what you shared, I found 3 schemes you likely qualify for. Click "Apply" on any to get started.',
          schemes: DEMO_SCHEMES,
          timestamp: new Date().toISOString(),
        });
      } else {
        addMessage({
          sender: 'assistant',
          type: 'text',
          text: `I understand. Is there anything specific you'd like to know about these schemes?`,
          timestamp: new Date().toISOString(),
        });
      }
      setIsLoading(false);
    }, 1400);
  };

  const handleApply = (scheme) => {
    setSelectedScheme(scheme);
    setCurrentStep(3);
    addMessage({ sender: 'user', type: 'text', text: `I want to apply for ${scheme.name}`, timestamp: new Date().toISOString() });
    setTimeout(() => {
      addMessage({
        sender: 'assistant',
        type: 'digilocker-prompt',
        text: `To apply for ${scheme.fullName}, I need to verify a few documents via DigiLocker. Your data is processed in-memory and discarded immediately after.`,
        scheme,
        timestamp: new Date().toISOString(),
      });
    }, 600);
  };

  const handleConsent = () => {
    setCurrentStep(4);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addMessage({
        sender: 'assistant',
        type: 'form-preview',
        text: `Documents verified. I've pre-filled the application — please review each field and confirm.`,
        scheme: selectedScheme,
        timestamp: new Date().toISOString(),
      });
    }, 1800);
  };

  const handleSubmit = () => {
    setCurrentStep(5);
    const refNo = `JANSETU-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    addMessage({
      sender: 'assistant',
      type: 'tracker',
      text: `Your application has been submitted. Reference: ${refNo}`,
      applicationId: refNo,
      timestamp: new Date().toISOString(),
    });
  };

  const renderMessage = (msg) => {
    switch (msg.type) {
      case 'text':
        return <MessageBubble key={msg.id} message={msg} />;

      case 'scheme-list':
        return (
          <div key={msg.id}>
            <MessageBubble message={{ ...msg, type: 'text' }} />
            <div className="ml-10 mb-3">
              <SchemeList schemes={msg.schemes} onApply={handleApply} />
            </div>
          </div>
        );

      case 'digilocker-prompt':
        return (
          <div key={msg.id}>
            <MessageBubble message={{ ...msg, type: 'text' }} />
            <div className="ml-10 mb-3">
              <DigiLockerConsent
                scheme={msg.scheme}
                onConsentGranted={handleConsent}
                onCancel={() => { setCurrentStep(2); setMessages((p) => p.slice(0, -2)); }}
              />
            </div>
          </div>
        );

      case 'form-preview':
        return (
          <div key={msg.id}>
            <MessageBubble message={{ ...msg, type: 'text' }} />
            <div className="ml-10 mb-3">
              <FormPreview schemeName={msg.scheme?.name} onSubmit={handleSubmit} />
            </div>
          </div>
        );

      case 'tracker':
        return (
          <div key={msg.id}>
            <MessageBubble message={{ ...msg, type: 'text' }} />
            <div className="ml-10 mb-3">
              <ApplicationTracker applicationId={msg.applicationId} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 60px)', background: '#FAFAF8' }}>
      <StepIndicator currentStep={currentStep} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.map(renderMessage)}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      {currentStep < 5 && (
        <InputBar onSend={handleSend} isLoading={isLoading} disabled={currentStep === 3 || currentStep === 4} />
      )}
    </div>
  );
};

export default ChatInterface;
