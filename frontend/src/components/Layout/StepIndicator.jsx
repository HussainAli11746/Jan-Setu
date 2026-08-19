import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, short: 'Describe' },
  { id: 2, short: 'Match' },
  { id: 3, short: 'Verify' },
  { id: 4, short: 'Fill' },
  { id: 5, short: 'Track' },
];

const StepIndicator = ({ currentStep }) => {
  const { t } = useTranslation();

  return (
    <div
      className="w-full px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto"
      style={{ background: '#FAFAF8', borderBottom: '1px solid #E5E2DC' }}
    >
      {STEPS.map((step, i) => {
        const done    = currentStep > step.id;
        const active  = currentStep === step.id;
        const pending = currentStep < step.id;

        return (
          <React.Fragment key={step.id}>
            <div className={`step-pill flex-shrink-0 ${done ? 'done' : active ? 'active' : 'pending'}`}>
              {done ? (
                <Check className="w-3 h-3" strokeWidth={3} />
              ) : (
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: active ? 'rgba(232,96,28,0.15)' : 'rgba(0,0,0,0.06)',
                    color: active ? '#E8601C' : '#A8A29E',
                  }}
                >
                  {step.id}
                </span>
              )}
              <span>{t(`step.${step.id}`, step.short)}</span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className="flex-shrink-0 h-px w-5 transition-colors duration-500"
                style={{ background: done ? '#0A6B3C' : '#E5E2DC' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
