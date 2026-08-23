import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Bookmark, BookmarkCheck, Info, FileText, Landmark, CreditCard, ShieldCheck, Tractor, Loader2, AlertCircle, ExternalLink, Award, Sparkles } from 'lucide-react';
import { fetchSchemeDetails } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OFFICIAL_PORTALS = {
  pmkisan: 'https://pmkisan.gov.in/',
  pmfby: 'https://pmfby.gov.in/',
  pmayg: 'https://pmayg.nic.in/',
  pmayu: 'https://pmay-urban.gov.in/',
  ayushman: 'https://beneficiary.nha.gov.in',
  pmjay: 'https://beneficiary.nha.gov.in',
  svanidhi: 'https://pmsvanidhi.mohua.gov.in/',
  pmkvy: 'https://www.skillindiadigital.gov.in',
  mgnregs: 'https://nrega.nic.in/',
  mudra: 'https://www.udyamimitra.in',
  standup_india: 'https://www.standupmitra.in',
  pm_vishwakarma: 'https://pmvishwakarma.gov.in/',
  pmvishwakarma: 'https://pmvishwakarma.gov.in/',
  kcc: 'https://myscheme.gov.in/schemes/kcc',
  pmksy: 'https://pmksy.gov.in/',
  pmjdy: 'https://pmjdy.gov.in/',
  pmjjby: 'https://jansuraksha.gov.in/',
  pmsby: 'https://jansuraksha.gov.in/',
  apy: 'https://www.npscra.nsdl.co.in/scheme-details.php',
  sukanya_samriddhi: 'https://www.myscheme.gov.in/schemes/ssy',
  ssy: 'https://www.myscheme.gov.in/schemes/ssy',
  nsp_sc: 'https://scholarships.gov.in/',
  nsp_postmatric_sc: 'https://scholarships.gov.in/',
  nsp_postmatric_obc: 'https://scholarships.gov.in/',
  nmmss: 'https://scholarships.gov.in/',
  cbse_merit_single_girl: 'https://www.cbse.gov.in/cbsenew/scholar.html',
  'pm-poshan': 'https://pmposhan.education.gov.in/index.html',
};

export default function SchemeDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = useAuth() || {};
  const { saveScheme, removeSavedScheme, isSchemeSaved } = auth;

  const isSaved = Boolean(scheme && isSchemeSaved && isSchemeSaved(scheme.id));

  useEffect(() => {
    let isMounted = true;
    async function loadScheme() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSchemeDetails(id);
        if (isMounted) {
          if (data) {
            setScheme(data);
          } else {
            setError('Scheme not found');
          }
        }
      } catch (err) {
        console.error('Failed to load scheme details:', err);
        if (isMounted) {
          setError('Failed to load scheme details');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadScheme();
    return () => { isMounted = false; };
  }, [id]);

  const handleSave = () => {
    if (!scheme || !saveScheme) return;
    if (isSaved) {
      if (removeSavedScheme) removeSavedScheme(scheme.id);
      toast('Scheme removed from saved bookmarks');
    } else {
      saveScheme(scheme);
      toast.success('Scheme saved to your bookmarks!');
    }
  };

  const handleApply = () => {
    if (!scheme) return;
    const url = scheme.applyUrl
      || scheme.apply_url
      || (scheme.id && OFFICIAL_PORTALS[scheme.id])
      || `https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.fullName || scheme.name || '')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="text-xs text-slate-500 font-semibold">Loading scheme details...</span>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs">
          <AlertCircle className="w-10 h-10 text-orange-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Scheme Details Unavailable</h2>
          <p className="text-xs text-slate-500 mb-6">We couldn't load the details for this scheme. Please explore the scheme catalog.</p>
          <button
            onClick={() => navigate('/schemes')}
            className="w-full py-3 bg-[#0A1633] hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            {t('details.back', 'Back to Schemes')}
          </button>
        </div>
      </div>
    );
  }

  const displayName = scheme.fullName || scheme.name || 'Government Welfare Scheme';
  const displayBenefit = String(scheme.benefitShort || scheme.benefit_amount || scheme.benefitDetail || 'Government Assistance');
  const hasSlash = displayBenefit.includes('/');
  const benefitParts = hasSlash ? displayBenefit.split('/') : [displayBenefit, ''];

  const qualificationsList = Array.isArray(scheme.qualifications) && scheme.qualifications.length > 0
    ? scheme.qualifications
    : [
        { text: 'Occupation criteria aligns', sub: 'Targeted support for this specific sector and community.' },
        { text: 'Income criteria met', sub: 'Within designated benefit and entitlement threshold.' },
        { text: 'Location supported', sub: 'Active across all registered states and UTs in India.' }
      ];

  const requiredDocsList = Array.isArray(scheme.requiredDocs) && scheme.requiredDocs.length > 0
    ? scheme.requiredDocs
    : [
        { name: 'Aadhaar Card', status: 'Pre-verified' },
        { name: 'Bank Account Details (DBT)', status: 'Active account needed' },
        { name: 'Identity & Address Proof', status: 'Required' }
      ];

  const eligibilityDescription = typeof scheme.officialEligibility === 'object' && scheme.officialEligibility !== null
    ? scheme.officialEligibility.description
    : (typeof scheme.officialEligibility === 'string' ? scheme.officialEligibility : 'All verified Indian citizens fulfilling the ministry guidelines are eligible to apply.');

  const eligibilityExclusions = typeof scheme.officialEligibility === 'object' && scheme.officialEligibility !== null
    ? scheme.officialEligibility.exclusions
    : 'Constitutional post holders, institutional entities, and income tax payers (where applicable).';

  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0B0F19] py-8 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Back Navigation */}
        <div>
          <button
            onClick={() => navigate('/schemes')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('details.back', 'Back to Schemes')}</span>
          </button>
        </div>

        {/* Scheme Header Card */}
        <div className="bg-white dark:bg-[#131B2E] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 mt-1 border border-transparent dark:border-purple-800/40">
              <Award className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Category & Sector Pills */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-transparent dark:border-emerald-800/40">
                  {scheme.category || 'WELFARE'}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-md border border-transparent dark:border-slate-700">
                  {scheme.sectorType || 'CENTRAL'}
                </span>
              </div>

              {/* Scheme Name */}
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug mb-2">
                {displayName}
              </h1>

              {scheme.ministry && (
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  {scheme.ministry}
                </p>
              )}

              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {scheme.benefitDetail || scheme.benefit_description || 'Direct benefit and assistance provided under the official government welfare scheme guidelines.'}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Benefit Card */}
        <div className="bg-gradient-to-r from-[#FDE8DF] to-[#FCD9CC] dark:from-[#2A1711] dark:to-[#1F120D] border border-[#F8C1B0]/80 dark:border-orange-900/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9A3412] dark:text-orange-400 block mb-1">
            {t('details.primary_benefit', 'PRIMARY BENEFIT')}
          </span>
          
          <div className="flex items-baseline gap-1.5 my-1 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#7C2D12] dark:text-orange-300">
              {benefitParts[0].trim()}
            </span>
            {benefitParts[1] && (
              <span className="text-sm font-bold text-[#9A3412] dark:text-orange-400">
                / {benefitParts[1].trim()}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-[13px] text-[#9A3412] dark:text-orange-300 font-medium leading-relaxed max-w-xl mt-2">
            {scheme.benefitDetail || scheme.benefit_description || 'Direct financial benefit transferred to beneficiary accounts.'}
          </p>

          {/* Watermark symbol */}
          <div className="absolute right-4 bottom-2 text-7xl font-extrabold text-[#7C2D12]/10 dark:text-orange-500/10 select-none pointer-events-none">
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
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('details.why_qualify', 'Why you may qualify')}</h3>
              </div>

              <div className="bg-white dark:bg-[#131B2E] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex flex-col gap-4">
                {qualificationsList.map((q, idx) => {
                  const qText = typeof q === 'string' ? q : (q.text || q.title || 'Eligible qualification criteria');
                  const qSub = typeof q === 'string' ? '' : (q.sub || q.description || '');
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{qText}</h5>
                        {qSub && <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{qSub}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Official Eligibility */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('details.official_eligibility', 'Official Eligibility')}</h3>
              </div>

              <div className="bg-slate-50 dark:bg-[#131B2E] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-2xs text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex flex-col gap-3">
                <p>{eligibilityDescription}</p>
                <p>
                  <strong className="text-slate-900 dark:text-white font-bold">{t('details.exclusions', 'Exclusions:')} </strong>
                  {eligibilityExclusions}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Required Docs */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('details.required_docs', 'Required Docs')}</h3>
            </div>

            <div className="flex flex-col gap-3">
              {requiredDocsList.map((doc, idx) => {
                const docName = typeof doc === 'string' ? doc : (doc.name || doc.title || 'Required Document');
                const docStatus = typeof doc === 'string' ? 'Required' : (doc.status || 'Required');
                return (
                  <div key={idx} className="bg-white dark:bg-[#131B2E] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        {idx === 0 ? <CreditCard className="w-4 h-4" /> : idx === 1 ? <Landmark className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{docName}</h5>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">{docStatus}</p>
                      </div>
                    </div>

                    {idx === 0 && (
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {t('details.pre_verified', 'Pre-verified')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Action Buttons: Save & Apply Now */}
        <div className="flex items-center justify-center gap-4 pt-4 flex-wrap">
          <button
            onClick={handleSave}
            className={`min-w-[170px] bg-white dark:bg-[#131B2E] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold py-3.5 px-5 rounded-xl border flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer ${
              isSaved ? 'border-amber-400 text-amber-700 bg-amber-50/50 dark:bg-amber-950/30' : 'border-slate-300 dark:border-slate-700'
            }`}
          >
            {isSaved
              ? <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
              : <Bookmark className="w-4 h-4" />}
            <span>{isSaved ? t('details.saved', 'Saved') : t('details.save_scheme', 'Save Scheme')}</span>
          </button>

          <button
            onClick={handleApply}
            className="min-w-[210px] bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>{t('details.apply_now', 'Apply Now')}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Disclaimer Footer Box */}
        <div className="bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700 flex items-start gap-2.5 mt-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-700 dark:text-slate-200">{t('details.disclaimer_title', 'Disclaimer:')} </strong>
            {t('details.disclaimer_text', 'The information provided is based on official guidelines but may be subject to change. Please verify with local authorities before making financial decisions.')}
          </p>
        </div>

      </div>
    </div>
  );
}
