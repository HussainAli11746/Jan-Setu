import React from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const CATEGORY_COLORS = {
  Agriculture: { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  Health:      { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  Employment:  { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  Housing:     { bg: '#FDF4FF', text: '#7E22CE', border: '#E9D5FF' },
  Finance:     { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  Women:       { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
  Skill:       { bg: '#F0FDFA', text: '#115E59', border: '#99F6E4' },
  Energy:      { bg: '#FEF9C3', text: '#713F12', border: '#FEF08A' },
};

const SchemeCard = ({ scheme, onApply }) => {
  const daysLeft = Math.ceil((new Date(scheme.deadline) - new Date()) / 86400000);
  const isUrgent = daysLeft <= 30;
  const cat = CATEGORY_COLORS[scheme.category] || CATEGORY_COLORS.Finance;

  return (
    <div className="scheme-card overflow-hidden mb-3">
      {/* Header row */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-sm"
              style={{ background: cat.bg, color: cat.text, border: `1px solid ${cat.border}` }}
            >
              {scheme.category}
            </span>
            <span className="badge-match">{scheme.matchPercentage}% match</span>
          </div>
          <h3 className="text-[15px] font-bold mt-1.5 leading-tight" style={{ color: '#1C1917' }}>
            {scheme.fullName || scheme.name}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#78716C' }}>{scheme.ministry}</p>
        </div>
      </div>

      {/* Benefit */}
      <div className="mx-4 mb-3 px-3 py-2.5 rounded" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#166534' }}>Benefit</p>
        <p className="text-sm font-bold mt-0.5" style={{ color: '#14532D' }}>{scheme.benefitAmount}</p>
        <p className="text-xs mt-0.5" style={{ color: '#166534' }}>{scheme.benefitDescription}</p>
      </div>

      {/* Eligibility reasons */}
      <div className="px-4 mb-3">
        <p className="text-xs font-semibold mb-2" style={{ color: '#57534E' }}>Why you qualify</p>
        <ul className="space-y-1.5">
          {scheme.eligibilityReasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#44403C' }}>
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#0A6B3C' }} />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderTop: '1px solid #F5F4F1' }}
      >
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: isUrgent ? '#DC2626' : '#78716C' }}>
          {isUrgent ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : (
            <Clock className="w-3.5 h-3.5" />
          )}
          Deadline: {new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          {isUrgent && <span className="font-semibold">· {daysLeft}d left</span>}
        </div>

        <button
          onClick={() => onApply(scheme)}
          className="btn-primary text-xs px-3 py-1.5"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default SchemeCard;
