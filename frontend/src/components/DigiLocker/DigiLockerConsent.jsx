import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, FileText, Lock, AlertCircle } from 'lucide-react';

const DigiLockerConsent = ({ scheme, onConsentGranted, onCancel }) => {
  const { t } = useTranslation();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    if (!agreed) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConsentGranted();
    }, 1600);
  };

  return (
    <div
      className="rounded-lg overflow-hidden max-w-sm"
      style={{ background: '#fff', border: '1px solid #E5E2DC' }}
    >
      {/* Top strip */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: '#EEF1FB', borderBottom: '1px solid #D8DCF0' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: '#1A2A6C' }}
        >
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1A2A6C' }}>DigiLocker Verification</p>
          <p className="text-[11px]" style={{ color: '#57534E' }}>for {scheme?.name}</p>
        </div>
      </div>

      <div className="p-4">
        {/* Docs needed */}
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#78716C' }}>
          Documents to fetch
        </p>
        <ul className="space-y-1.5 mb-4">
          {(scheme?.requiredDocuments || ['Aadhaar Card']).map((doc, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-xs px-2.5 py-2 rounded"
              style={{ background: '#FAFAF8', border: '1px solid #E5E2DC', color: '#44403C' }}
            >
              <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#78716C' }} />
              {doc}
            </li>
          ))}
        </ul>

        {/* Privacy note */}
        <div
          className="flex items-start gap-2 p-3 rounded mb-4 text-[11px] leading-relaxed"
          style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534' }}
        >
          <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#0A6B3C' }} />
          <span>
            Only the documents listed above will be fetched. They are read in-memory for this application only
            — <strong>no file is saved</strong> to any server.
          </span>
        </div>

        {/* Consent checkbox */}
        <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-primary flex-shrink-0"
          />
          <span className="text-xs leading-relaxed" style={{ color: '#57534E' }}>
            {t('digilocker.consent')}
          </span>
        </label>

        {/* Actions */}
        <button
          onClick={handleConnect}
          disabled={!agreed || loading}
          className="btn-primary w-full mb-2"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Connect DigiLocker & Continue'
          )}
        </button>
        <button onClick={onCancel} disabled={loading} className="btn-secondary w-full text-xs">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DigiLockerConsent;
