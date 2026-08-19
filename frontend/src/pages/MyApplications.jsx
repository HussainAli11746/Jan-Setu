import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Plus, ArrowRight, Tractor, Home as HomeIcon, GraduationCap, CheckCircle2, Clock, Eye, Loader2, Sparkles, Inbox } from 'lucide-react';
import { fetchUserApplications } from '../services/api';
import { useTranslation } from 'react-i18next';

export default function MyApplications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchUserApplications();
        setApplications(data || []);
      } catch (err) {
        console.error(err);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getIcon = (schemeId = '') => {
    const s = String(schemeId).toLowerCase();
    if (s.includes('kisan') || s.includes('farmer') || s.includes('agriculture')) return <Tractor className="w-4 h-4 text-orange-700" />;
    if (s.includes('pmay') || s.includes('housing') || s.includes('awas')) return <HomeIcon className="w-4 h-4 text-blue-700" />;
    return <GraduationCap className="w-4 h-4 text-emerald-700" />;
  };

  const getStatusBadge = (app) => {
    switch (app.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Approved</span>
          </span>
        );
      case 'pending_verification':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Pending Verification</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#FDEEE7] text-[#9A3412] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#FAD6C5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></span>
            <span>Under Department Review</span>
          </span>
        );
    }
  };

  const getProgressBarColor = (status) => {
    if (status === 'approved') return 'bg-emerald-800';
    if (status === 'pending_verification') return 'bg-slate-400';
    return 'bg-[#8C3A0A]';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="text-xs text-slate-500 font-medium">Loading applications...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-900 block mb-1">
              {t('dashboard.badge', 'DASHBOARD')}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('dashboard.title', 'My Applications')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {}}
              className="bg-slate-100/90 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('dashboard.filter', 'Filter')}</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="bg-[#0A1633] hover:bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('dashboard.new_app', 'New Application')}</span>
            </button>
          </div>
        </div>

        {/* 3-Column Applications Grid or Empty State */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center max-w-lg mx-auto w-full my-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t('dashboard.empty_title', 'No applications yet')}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
              {t('dashboard.empty_desc', "You haven't submitted any scheme applications yet. Start with our AI assistant to find and apply for schemes.")}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('dashboard.empty_btn', 'Find Schemes for Me')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div
                key={app.id || app.reference_number}
                className={`bg-white rounded-2xl p-6 border shadow-2xs flex flex-col justify-between hover:shadow-md transition-all ${
                  app.status === 'approved'
                    ? 'border-t-4 border-t-emerald-800 border-slate-200/90'
                    : app.status === 'pending_verification'
                    ? 'border-t-4 border-t-slate-400 border-slate-200/90'
                    : 'border-t-4 border-t-[#EA580C] border-slate-200/90'
                }`}
              >
                <div>
                  {/* Card Top: Icon & Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      {getIcon(app.schemeId || app.scheme_id)}
                    </div>
                    {getStatusBadge(app)}
                  </div>

                  {/* Scheme Name & Ref ID */}
                  <h3 className="text-base font-bold text-slate-900 leading-tight mb-1">
                    {app.schemeName || app.scheme_id}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 mb-6">
                    {app.id || app.reference_number}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(app.status)}`}
                      style={{ width: `${app.progressPercent || 65}%` }}
                    ></div>
                  </div>
                </div>

                {/* Card Footer: Last Updated & View Status */}
                <div className="flex items-end justify-between pt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('dashboard.last_updated', 'Last updated')}</span>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">{app.updatedAt || 'Recently'}</p>
                  </div>

                  <button
                    onClick={() => navigate(`/track/${app.id || app.reference_number}`)}
                    className="text-xs font-bold text-indigo-900 hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{app.status === 'approved' ? t('dashboard.view_details', 'View Details') : t('dashboard.view_status', 'View Status')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
