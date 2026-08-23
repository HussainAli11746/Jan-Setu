import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Bell, ShieldCheck, CheckCircle2, Clock, Trash2, HelpCircle, Activity, Loader2, AlertCircle } from 'lucide-react';
import { trackApplication } from '../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function ApplicationStatus() {
  const { t } = useTranslation();
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [reminded, setReminded] = useState(false);
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadApp() {
      try {
        const data = await trackApplication(applicationId);
        if (data) {
          setApp(data);
        } else {
          setError('Application not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch status');
      } finally {
        setLoading(false);
      }
    }
    loadApp();
  }, [applicationId]);

  const handleDownloadReceipt = () => {
    toast.success('Official Application Acknowledgment receipt downloaded!');
  };

  const handleRemindMe = () => {
    setReminded(!reminded);
    toast.success(!reminded ? 'SMS and WhatsApp alerts enabled for this application.' : 'Status alerts disabled.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="text-xs text-slate-500 font-medium">Tracking application...</span>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] py-12 px-4 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900 mb-1">Application not found</h2>
        <p className="text-xs text-slate-500 mb-4">The reference number <span className="font-mono">{applicationId}</span> does not exist.</p>
        <button
          onClick={() => navigate('/applications')}
          className="bg-[#0A1633] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
        >
          View My Applications
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0B0F19] py-8 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header Bar with Download Receipt */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('track.status_title', 'Application Status')}
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-1">
              {t('track.scheme', 'Scheme')}: <strong className="text-slate-800 dark:text-slate-200 font-bold">{app.schemeName || app.scheme_id}</strong> • ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{app.id || app.reference_number}</span>
            </p>
          </div>

          <button
            onClick={handleDownloadReceipt}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors cursor-pointer shrink-0"
            title="Download Acknowledgment"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Column Main Tracker Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Timeline */}
          <div className="md:col-span-8 bg-white dark:bg-[#131B2E] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex flex-col gap-6">
            
            {/* Timeline Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-900 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{t('track.timeline_title', 'Status Timeline')}</h3>
              </div>
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-950/50 border border-transparent dark:border-amber-800/40 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400"></span>
                <span>{t('track.in_progress', 'In Progress')}</span>
              </span>
            </div>

            {/* Timeline Steps */}
            <div className="relative pl-6 flex flex-col gap-8 border-l-2 border-slate-100 dark:border-slate-800 ml-3">
              
              {/* Event 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white dark:ring-[#131B2E] shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('track.submitted_step', 'Application submitted')}</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{app.submittedAt || '19 Aug · 10:42 AM'}</p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white dark:ring-[#131B2E] shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('track.docs_verified_step', 'Documents verified')}</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5 mb-2">19 Aug · 10:44 AM</p>
                  
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-3 py-1.5 rounded-lg text-[11px] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('track.docs_verified_note', 'Aadhaar & Land Records authenticated via DigiLocker')}</span>
                  </div>
                </div>
              </div>

              {/* Event 3: Active step */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-600 ring-4 ring-white dark:ring-[#131B2E] shadow-xs flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
                <div className="bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('track.under_review_step', 'Under department review')}</h4>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{t('track.in_progress', 'In progress')}</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t('track.under_review_note', 'Your application is currently being reviewed by the designated nodal officer.')}
                  </p>
                </div>
              </div>

              {/* Event 4: Pending */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 ring-4 ring-white dark:ring-[#131B2E]"></div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500">{t('track.approval_step', 'Approval & disbursement')}</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Expected: 12 Oct</p>
                </div>
              </div>

            </div>

            {/* Reminder CTA button */}
            <div className="pt-2">
              <button
                onClick={handleRemindMe}
                className={`w-full sm:w-auto text-xs font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  reminded
                    ? 'bg-emerald-800 dark:bg-emerald-600 text-white'
                    : 'bg-[#0A1633] dark:bg-orange-600 hover:bg-slate-900 dark:hover:bg-orange-500 text-white shadow-sm'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{reminded ? t('track.reminded', 'Alerts Activated ✓') : t('track.btn_remind', 'Remind me when status changes')}</span>
              </button>
            </div>

          </div>

          {/* Right Column: Application Details & Support */}
          <div className="md:col-span-4 flex flex-col gap-4">
            
            {/* Details Box */}
            <div className="bg-slate-100/90 dark:bg-[#131B2E] rounded-3xl p-5 border border-slate-200/60 dark:border-slate-700 shadow-2xs flex flex-col gap-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {t('track.details_header', 'Application Details')}
              </span>

              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold">{t('track.scheme', 'Scheme')}</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{app.schemeName || app.scheme_id}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold">{t('track.department', 'Department')}</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{app.department || 'Welfare'}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold">{t('track.submitted_date', 'Submitted')}</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{app.submittedAt || 'Today'}</p>
              </div>

              <div className="bg-[#F8E3D7] dark:bg-amber-950/40 rounded-xl p-3 border border-[#F1C8B4] dark:border-amber-800/40">
                <span className="text-[10px] uppercase text-[#9A3412] dark:text-amber-300 font-bold">{t('track.current_status', 'Current status')}</span>
                <p className="text-xs font-bold text-[#7C2D12] dark:text-amber-200 mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] dark:bg-amber-500"></span>
                  <span>{t('track.in_progress', 'Under Review')}</span>
                </p>
              </div>
            </div>

            {/* Need Help Box */}
            <div className="bg-slate-50 dark:bg-[#131B2E] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 text-center flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-transparent dark:border-blue-800/40">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">{t('track.need_help', 'Need help?')}</h5>
              <button
                onClick={() => toast('JanSetu Helpline: 1800-115-526 (Toll Free)')}
                className="text-xs font-bold text-indigo-700 dark:text-orange-400 hover:text-indigo-900 dark:hover:text-orange-300 cursor-pointer"
              >
                {t('track.contact_support', 'Contact Support')}
              </button>
            </div>

          </div>

        </div>

        {/* Bottom Privacy Guarantee Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 py-3 border-t border-slate-200/60 dark:border-slate-800 mt-2">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('track.dl_ended', 'DigiLocker session ended')}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('track.docs_discarded', 'Documents discarded')}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('track.no_pii', 'No document data retained')}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
