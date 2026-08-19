import React, { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
};

const VoiceInput = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const { i18n } = useTranslation();
  const recognitionRef = useRef(null);

  const toggle = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechAPI) {
      alert('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }

    const rec = new SpeechAPI();
    rec.lang = LANG_MAP[i18n.language] || 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onTranscript(text);
      setIsRecording(false);
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend   = () => setIsRecording(false);

    recognitionRef.current = rec;
    try {
      rec.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      {/* Pulse ring when recording */}
      {isRecording && (
        <span
          className="absolute inset-0 rounded-full pulse-ring"
          style={{ background: 'rgba(220,38,38,0.25)' }}
        />
      )}
      <button
        type="button"
        onClick={toggle}
        title={isRecording ? 'Stop recording' : 'Speak your message'}
        className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
        style={{
          background: isRecording ? '#DC2626' : '#F5F4F1',
          border: `1.5px solid ${isRecording ? '#DC2626' : '#E5E2DC'}`,
        }}
      >
        {isRecording
          ? <Square className="w-4 h-4 text-white" fill="currentColor" />
          : <Mic className="w-4 h-4" style={{ color: '#57534E' }} />}
      </button>
    </div>
  );
};

export default VoiceInput;
