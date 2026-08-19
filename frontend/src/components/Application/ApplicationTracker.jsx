import React from 'react';
import { CheckCircle2, Circle, Loader2, Copy, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = [
  { label: 'Application submitted',     note: 'Just now',          status: 'done' },
  { label: 'Documents verified',        note: 'Just now',          status: 'done' },
  { label: 'Under department review',   note: 'In progress',       status: 'active' },
  { label: 'Approval & disbursement',   note: 'Expected: 12 Oct',  status: 'pending' },
];

const ApplicationTracker = ({ applicationId = 'JANSETU-20260819-A7X2K' }) => {
  const copy = () => {
    navigator.clipboard.writeText(applicationId);
    toast.success('Reference number copied');
  };

  return (
    <div
      className="rounded-lg overflow-hidden max-w-sm"
      style={{ background: '#fff', border: '1px solid #E5E2DC' }}
    >
      {/* Receipt-style header */}
      <div
        className="px-4 py-3"
        style={{ background: '#FAFAF8', borderBottom: '1px solid #E5E2DC' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#A8A29E' }}>
              Application Status
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <code className="text-xs font-mono font-semibold" style={{ color: '#1A2A6C' }}>
                {applicationId}
              </code>
              <button
                onClick={copy}
                className="text-warm-400 hover:text-warm-700 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <button
            className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-warm-100 transition-colors"
            style={{ color: '#E8601C' }}
            title="Set reminder"
          >
            <Bell className="w-4 h-4" />
            <span className="text-[9px] font-medium">Remind</span>
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 py-4">
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[11px] top-3 bottom-3 w-px"
            style={{ background: '#E5E2DC' }}
          />

          <div className="space-y-5">
            {STEPS.map((step, i) => {
              const done   = step.status === 'done';
              const active = step.status === 'active';

              return (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className="flex-shrink-0 relative z-10">
                    {done ? (
                      <CheckCircle2 className="w-6 h-6" style={{ color: '#0A6B3C' }} />
                    ) : active ? (
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#E8601C' }} />
                    ) : (
                      <Circle className="w-6 h-6" style={{ color: '#D6D3CD' }} />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p
                      className="text-sm font-medium"
                      style={{ color: done ? '#1C1917' : active ? '#E8601C' : '#A8A29E' }}
                    >
                      {step.label}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#A8A29E' }}>
                      {step.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div
        className="px-4 py-3 text-[11px] text-center"
        style={{ borderTop: '1px solid #E5E2DC', color: '#78716C', background: '#FAFAF8' }}
      >
        DigiLocker session ended · Documents discarded · No data retained
      </div>
    </div>
  );
};

export default ApplicationTracker;
