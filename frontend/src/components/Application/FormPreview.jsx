import React, { useState } from 'react';
import { Lock, Pencil, Check, X } from 'lucide-react';

const MOCK_FIELDS = [
  { key: 'fullName',   label: 'Full Name',           value: 'Rahul Kumar',           fromDigiLocker: true },
  { key: 'dob',        label: 'Date of Birth',        value: '15 Aug 1990',           fromDigiLocker: true },
  { key: 'gender',     label: 'Gender',               value: 'Male',                  fromDigiLocker: true },
  { key: 'aadhaar',   label: 'Aadhaar (last 4)',      value: 'XXXX XXXX 1234',        fromDigiLocker: true },
  { key: 'address',   label: 'Permanent Address',     value: '12, Ram Nagar, Bareilly, UP - 243001', fromDigiLocker: false },
  { key: 'income',    label: 'Annual Income (₹)',     value: '82,000',                fromDigiLocker: false },
  { key: 'category',  label: 'Social Category',       value: 'OBC',                   fromDigiLocker: false },
];

const FormPreview = ({ schemeName, onSubmit }) => {
  const [fields, setFields]     = useState(MOCK_FIELDS);
  const [editing, setEditing]   = useState(null);
  const [editVal, setEditVal]   = useState('');
  const [submitted, setSubmitting] = useState(false);

  const startEdit = (key, val) => { setEditing(key); setEditVal(val); };
  const saveEdit  = (key) => {
    setFields(f => f.map(x => x.key === key ? { ...x, value: editVal } : x));
    setEditing(null);
  };
  const cancelEdit = () => setEditing(null);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const data = Object.fromEntries(fields.map(f => [f.key, f.value]));
      onSubmit(data);
    }, 800);
  };

  return (
    <div
      className="rounded-lg overflow-hidden max-w-sm"
      style={{ background: '#fff', border: '1px solid #E5E2DC' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3"
        style={{ background: '#FAFAF8', borderBottom: '1px solid #E5E2DC' }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#A8A29E' }}>
          Application Form
        </p>
        <p className="text-sm font-semibold mt-0.5" style={{ color: '#1C1917' }}>{schemeName}</p>
        <p className="text-[11px] mt-0.5" style={{ color: '#78716C' }}>
          <span style={{ color: '#0A6B3C' }}>●</span> Fields with lock icon are verified via DigiLocker
        </p>
      </div>

      {/* Fields */}
      <div className="divide-y" style={{ borderColor: '#F5F4F1' }}>
        {fields.map(({ key, label, value, fromDigiLocker }) => (
          <div key={key} className="px-4 py-2.5">
            <div className="flex items-center justify-between mb-0.5">
              <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#78716C' }}>
                {label}
                {fromDigiLocker && (
                  <Lock className="w-3 h-3" style={{ color: '#0A6B3C' }} title="Verified via DigiLocker" />
                )}
              </span>
              {!fromDigiLocker && editing !== key && (
                <button
                  onClick={() => startEdit(key, value)}
                  className="text-xs flex items-center gap-1 transition-colors hover:text-primary"
                  style={{ color: '#A8A29E' }}
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>

            {editing === key ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  value={editVal}
                  onChange={e => setEditVal(e.target.value)}
                  autoFocus
                  className="flex-1 text-sm border-b outline-none py-0.5 px-0 bg-transparent"
                  style={{ borderColor: '#E8601C', color: '#1C1917' }}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(key); if (e.key === 'Escape') cancelEdit(); }}
                />
                <button onClick={() => saveEdit(key)} className="text-secondary ml-1">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={cancelEdit} style={{ color: '#A8A29E' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm font-medium" style={{ color: fromDigiLocker ? '#44403C' : '#1C1917' }}>
                {value || <span style={{ color: '#F59E0B', fontStyle: 'italic' }}>Needs input</span>}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid #E5E2DC' }}>
        <button
          onClick={handleSubmit}
          disabled={submitted}
          className="btn-primary w-full"
        >
          {submitted ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Confirm & Submit Application'
          )}
        </button>
        <p className="text-center text-[10px] mt-2" style={{ color: '#A8A29E' }}>
          By submitting, you confirm the details above are accurate
        </p>
      </div>
    </div>
  );
};

export default FormPreview;
