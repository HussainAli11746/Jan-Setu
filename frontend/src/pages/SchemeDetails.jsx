import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Bookmark, BookmarkCheck, Info, FileText, Landmark, CreditCard, ShieldCheck, Tractor, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { fetchSchemeDetails } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SchemeDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const OFFICIAL_PORTALS = {
    pmkisan: 'https://pmkisan.gov.in/',
    pmfby: 'https://pmfby.gov.in/',
    pmayg: 'https://pmayg.nic.in/',
    ayushman: 'https://beneficiary.nha.gov.in',
    svanidhi: 'https://pmsvanidhi.mohua.gov.in/',
    pmkvy: 'https://www.skillindiadigital.gov.in',
    mgnregs: 'https://nrega.nic.in/',
    mudra: 'https://www.udyamimitra.in',
    ssy: 'https://www.myscheme.gov.in/schemes/ssy',
    nps_lite: 'https://www.npscra.nsdl.co.in/scheme-details.php',
    nsp_postmatric_sc: 'https://scholarships.gov.in/',
    nsp_postmatric_obc: 'https://scholarships.gov.in/',
    pmvishwakarma: 'https://pmvishwakarma.gov.in/',
    kcc: 'https://myscheme.gov.in/schemes/kcc',
    pmjjby: 'https://jansuraksha.gov.in/',
    pmsby: 'https://jansuraksha.gov.in/',
  };

  const { saveScheme, removeSavedScheme, isSchemeSaved } = useAuth();
  const isSaved = scheme ? isSchemeSaved(scheme.id) : false;

  const handleSave = () => {
    if (!scheme) return;
    if (isSaved) {
      removeSavedScheme(scheme.id);
      toast('Scheme removed from saved bookmarks', { icon: '🗑️' });
    } else {
      saveScheme(scheme);
      toast.success('Scheme saved to your bookmarks! 🔖');
    }
  };

  const handleApply = () => {
    if (!scheme) return;
    const url = scheme.applyUrl
      || scheme.apply_url
      || OFFICIAL_PORTALS[scheme.id]
      || `https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.fullName || scheme.name || '')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="text-xs text-slate-500 font-medium">Loading scheme details...</span>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] py-12 px-4 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900 mb-1">Scheme not found</h2>
        <button
          onClick={() => navigate('/schemes')}
          className="mt-4 text-xs font-bold text-indigo-700 hover:underline cursor-pointer"
        >
          {t('details.back', 'Back to Schemes')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Back Link */}
        <div>
          <button
            onClick={() => navigate('/schemes')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('details.back', 'Back to Schemes')}</span>
          </button>
        </div>

        {/* Scheme Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-1">
              <Tractor className="w-5 h-5" />
            </div>

            <div className="flex-1">
              {/* Category Pills */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100/80 text-emerald-800 px-2.5 py-0.5 rounded-md">
                  {scheme.category || 'WELFARE'}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">
                  {scheme.sectorType || 'CENTRAL'}
                </span>
              </div>

              {/* Scheme Name */}
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug mb-2">
                {scheme.fullName || scheme.name}
              </h1>

              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-3xl">
                {scheme.benefitDetail || scheme.benefit_description}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Benefit Card */}
        <div className="bg-gradient-to-r from-[#FDE8DF] to-[#FCD9CC] border border-[#F8C1B0]/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9A3412] block mb-1">
            {t('details.primary_benefit', 'PRIMARY BENEFIT')}
          </span>
          
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#7C2D12]">
              {(scheme.benefitShort || scheme.benefit_amount || '₹6,000 / year').split('/')[0]}
            </span>
            <span className="text-sm font-bold text-[#9A3412]">
              / {(scheme.benefitShort || scheme.benefit_amount || '₹6,000 / year').split('/')[1] || 'year'}
            </span>
          </div>

          <p className="text-xs sm:text-[13px] text-[#9A3412] font-medium leading-relaxed max-w-xl mt-2">
            {scheme.benefitDetail || 'Direct financial benefit transferred to bank accounts.'}
          </p>

          {/* Watermark symbol */}
          <div className="absolute right-4 bottom-2 text-7xl font-extrabold text-[#7C2D12]/10 select-none pointer-events-none">
            ₹
          </div>
        </div>

        {/* 2-Column Details Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Why you may qualify & Official Eligibility */}
          <div className="md:col-span-7 flex flex-col gap-6">
            
            {/* 1. Why you may qualify */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">{t('details.why_qualify', 'Why you may qualify')}</h3>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
                {(scheme.qualifications || [
                  { text: 'Occupation matches profile', sub: 'Your profile indicates eligibility for this sector.' },
                  { text: 'Income criteria met', sub: 'Within designated benefit threshold.' },
                  { text: 'Location supported', sub: 'Scheme is active in your registered state.' }
                ]).map((q, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-700 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 leading-tight">{q.text}</h5>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{q.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Official Eligibility */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">{t('details.official_eligibility', 'Official Eligibility')}</h3>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 shadow-2xs text-xs text-slate-600 leading-relaxed flex flex-col gap-3">
                <p>{scheme.officialEligibility?.description || 'All verified citizens fulfilling the ministry guidelines.'}</p>
                <p>
                  <strong className="text-slate-900 font-bold">{t('details.exclusions', 'Exclusions:')} </strong>
                  {scheme.officialEligibility?.exclusions || 'Constitutional post holders and institutional entities.'}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Required Docs */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">{t('details.required_docs', 'Required Docs')}</h3>
            </div>

            <div className="flex flex-col gap-3">
              {(scheme.requiredDocs || [
                { name: 'Aadhaar Card', status: 'Pre-verified' },
                { name: 'Bank Account Details', status: 'Active account' },
                { name: 'Identity Proof', status: 'Required' }
              ]).map((doc, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      {idx === 0 ? <CreditCard className="w-4 h-4" /> : idx === 1 ? <Landmark className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{doc.name}</h5>
                      <p className="text-[10px] text-slate-400 font-medium">{doc.status}</p>
                    </div>
                  </div>

                  {idx === 0 && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {t('details.pre_verified', 'Pre-verified')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Action Buttons: Save & Apply Now */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={handleSave}
            className={`w-44 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-3.5 px-5 rounded-xl border flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer ${
              isSaved ? 'border-amber-400 text-amber-700' : 'border-slate-300'
            }`}
          >
            {isSaved
              ? <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
              : <Bookmark className="w-4 h-4" />}
            <span>{isSaved ? t('details.saved', 'Saved') : t('details.save_scheme', 'Save Scheme')}</span>
          </button>

          <button
            onClick={handleApply}
            className="w-56 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>{t('details.apply_now', 'Apply Now')}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Disclaimer Footer Box */}
        <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200/60 flex items-start gap-2.5 mt-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <strong className="text-slate-700">{t('details.disclaimer_title', 'Disclaimer:')} </strong>
            {t('details.disclaimer_text', 'The information provided is based on official guidelines but may be subject to change. Please verify with local authorities before making financial decisions.')}
          </p>
        </div>

      </div>
    </div>
  );
}
