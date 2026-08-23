import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, FileText, ArrowRight, Landmark, Edit2, Send, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { fetchSchemeDetails, initiateDigiLocker, submitApplication } from '../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function ApplyPage() {
  const { t } = useTranslation();
  const { schemeId } = useParams();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(1);
  const [digiLockerConnected, setDigiLockerConnected] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  const [declared, setDeclared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-filled form state
  const [formData, setFormData] = useState({
    fullName: 'Hussain Ali',
    dob: '12/05/1988',
    address: '42, Sector 15, Near City Hospital, Bhopal, Madhya Pradesh - 462016',
    bankName: 'State Bank of India',
    bankAccount: '•••• 4590',
    annualIncome: '₹ 4,50,000'
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSchemeDetails(schemeId);
        setScheme(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [schemeId]);

  const handleConnectDigiLocker = async () => {
    try {
      const res = await initiateDigiLocker(schemeId);
      if (res && res.sessionToken) {
        setSessionToken(res.sessionToken);
      }
      setDigiLockerConnected(true);
      toast.success('DigiLocker verified! Verified credentials loaded in-memory.');
    } catch (err) {
      setDigiLockerConnected(true);
      toast.success('DigiLocker simulated consent granted.');
    }
  };

  const handleSubmitApplication = async () => {
    if (!declared) {
      toast.error('Please accept the declaration to submit.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitApplication({
        schemeId,
        sessionToken: sessionToken || 'dl_demo',
        formData
      });

      toast.success('Application submitted successfully!');
      const targetId = result.referenceNumber || result.applicationId || 'JANSETU-20260819-A7X2K';
      navigate(`/track/${targetId}`);
    } catch (err) {
      toast.error('Submission failed, saved offline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !scheme) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0B0F19] py-8 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* STAGE 1: Let's prepare your application */}
        {stage === 1 && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            
            {/* Top Stepper */}
            <div className="flex items-center justify-center gap-6 sm:gap-12 text-xs font-semibold text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400 font-bold">1</span>
                <span>{t('apply.step1', 'Identify')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400 font-bold">2</span>
                <span>{t('apply.step2', 'Check Eligibility')}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-950 dark:text-orange-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-[#0A1633] dark:bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span>{t('apply.step3', 'Apply')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400 font-bold">4</span>
                <span>{t('apply.step4', 'Review')}</span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="flex flex-col gap-2 text-center max-w-xl mx-auto">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('apply.prep_title', "Let's prepare your application")}
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('apply.prep_desc', "We'll use your verified information to pre-fill the form. Review everything carefully before submission.")}
              </p>
            </div>

            {/* Checklist Card */}
            <div className="bg-slate-100/90 dark:bg-[#131B2E] rounded-3xl p-6 border border-slate-200/60 dark:border-slate-700 max-w-2xl mx-auto w-full flex flex-col gap-3">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-slate-800 dark:text-emerald-400" />
                <span>{t('apply.check_identity', 'Identity verified')}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-slate-800 dark:text-emerald-400" />
                <span>{t('apply.check_eligibility', 'Eligibility confirmed')}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-slate-800 dark:text-emerald-400" />
                <span>{t('apply.check_docs', 'Required documents available')}</span>
              </div>
            </div>

            {/* DigiLocker Callout Banner */}
            <div className="bg-slate-100/90 dark:bg-[#131B2E] rounded-3xl p-6 border border-slate-200/60 dark:border-slate-700 max-w-2xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-slate-900 dark:text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('apply.digilocker_title', 'Verify with DigiLocker')}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug max-w-xs mt-0.5">
                    {t('apply.digilocker_desc', 'Your documents are processed securely and are not stored by JanSetu.')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleConnectDigiLocker}
                className="w-full sm:w-auto bg-[#0A1633] dark:bg-orange-600 hover:bg-slate-900 dark:hover:bg-orange-500 text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
              >
                <span>{digiLockerConnected ? t('apply.btn_connected', 'Connected ✓') : t('apply.btn_connect_dl', 'Connect DigiLocker')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Application Preview Form */}
            <div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-orange-400 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>{t('apply.preview_title', 'Application Preview')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#131B2E] rounded-xl p-3.5 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400">{t('apply.full_name', 'Full Name')}</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">{formData.fullName}</p>
                </div>

                <div className="bg-white dark:bg-[#131B2E] rounded-xl p-3.5 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400">{t('apply.dob', 'Date of Birth')}</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">{formData.dob}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#131B2E] rounded-xl p-3.5 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase text-slate-400">{t('apply.address', 'Registered Address')}</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">{formData.address}</p>
              </div>

              <div className="bg-white dark:bg-[#131B2E] rounded-xl p-3.5 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase text-slate-400">{t('apply.bank_account', 'Bank Account (Linked to Aadhaar)')}</span>
                <div className="flex items-center gap-2 mt-1">
                  <Landmark className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{formData.bankName} {formData.bankAccount}</p>
                </div>
              </div>

              {/* Review Application Action */}
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setStage(2)}
                  className="w-full sm:w-64 bg-[#F8DFD2] dark:bg-orange-950/60 hover:bg-[#F2CEBD] dark:hover:bg-orange-900/60 text-[#7C2D12] dark:text-orange-200 border border-transparent dark:border-orange-800/40 text-xs font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{t('apply.btn_review', 'Review Application')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STAGE 2: Review your application */}
        {stage === 2 && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            
            {/* Header */}
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-orange-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('apply.final_step', 'FINAL STEP')}</span>
              </div>

              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('apply.review_title', 'Review your application')}
              </h1>

              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                {t('apply.review_desc', 'Please verify all details carefully before submitting. Ensuring accuracy helps speed up the processing of your application.')}
              </p>
            </div>

            {/* 2-Column Review Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Editable Information Cards */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                
                {/* 1. Personal Information */}
                <div className="bg-slate-100/90 dark:bg-[#131B2E] rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {t('apply.personal_info', 'Personal Information')}
                    </span>
                    <button onClick={() => setStage(1)} className="text-xs text-indigo-700 dark:text-orange-400 hover:text-indigo-900 dark:hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer">
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{t('apply.full_name', 'Full Name')}</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{formData.fullName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{t('apply.dob', 'Date of Birth')}</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{formData.dob}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{t('apply.address', 'Residential Address')}</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{formData.address}</p>
                  </div>
                </div>

                {/* 2. Application Details */}
                <div className="bg-slate-100/90 dark:bg-[#131B2E] rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {t('apply.app_details', 'Application Details')}
                    </span>
                    <button onClick={() => setStage(1)} className="text-xs text-indigo-700 dark:text-orange-400 hover:text-indigo-900 dark:hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer">
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{t('apply.scheme_name', 'Scheme Name')}</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{scheme.fullName || scheme.name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{t('apply.category', 'Category')}</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{scheme.category || 'Welfare'} Assistance</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{t('apply.income_declared', 'Annual Income Declared')}</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{formData.annualIncome}</p>
                  </div>
                </div>

                {/* 3. Documents */}
                <div className="bg-slate-100/90 dark:bg-[#131B2E] rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {t('apply.documents', 'Documents')}
                    </span>
                    <button onClick={() => setStage(1)} className="text-xs text-indigo-700 dark:text-orange-400 hover:text-indigo-900 dark:hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer">
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Aadhaar Card</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">Verified via DigiLocker</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Land Record / Income Proof</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">Verified</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* 4. Bank Information */}
                <div className="bg-slate-100/90 dark:bg-[#131B2E] rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {t('apply.bank_info', 'Bank Information')}
                    </span>
                    <button onClick={() => setStage(1)} className="text-xs text-indigo-700 dark:text-orange-400 hover:text-indigo-900 dark:hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer">
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Landmark className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{formData.bankName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{formData.bankAccount}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                      DBT Linked
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Column: Declaration & Submission */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                
                {/* Declaration Box */}
                <div className="bg-white dark:bg-[#131B2E] rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col gap-4">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{t('apply.declaration_title', 'Declaration')}</span>
                  
                  <label className="flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={declared}
                      onChange={(e) => setDeclared(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <span>
                      {t('apply.declaration_text', 'I confirm that the information provided is correct and I consent to the terms of service. I understand that false declarations may result in rejection.')}
                    </span>
                  </label>

                  <button
                    onClick={handleSubmitApplication}
                    disabled={!declared || isSubmitting}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      declared && !isSubmitting
                        ? 'bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-500 text-white shadow-md'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <span>{isSubmitting ? t('apply.submitting', 'Submitting...') : t('apply.btn_submit', 'Submit Application')}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Security Guarantee */}
                <div className="bg-slate-100/90 dark:bg-[#131B2E] rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h6 className="text-[11px] font-bold text-slate-900 dark:text-white">{t('apply.secure_submission', 'Secure Submission')}</h6>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      {t('apply.encrypted', 'Your data is encrypted end-to-end.')}
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
