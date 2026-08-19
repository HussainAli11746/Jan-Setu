import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Tractor, Home as HomeIcon, Leaf, Sparkles, Edit3,
  CheckCircle2, HelpCircle, Loader2, AlertCircle, Heart, Briefcase,
  GraduationCap, Zap, Shield, TrendingUp
} from 'lucide-react';
import { matchUserSchemes } from '../services/api';
import { useTranslation } from 'react-i18next';

// Map backend scheme data to display-ready shape
function normalizeScheme(s) {
  const iconMap = {
    agriculture: 'tractor',
    housing: 'home',
    health: 'heart',
    education: 'graduation',
    business: 'briefcase',
    employment: 'trending',
    skill: 'zap',
    pension: 'shield',
    maternity: 'heart',
    financial: 'zap',
    energy: 'zap',
    savings: 'shield',
    social: 'heart',
  };

  return {
    id: s.id || s.scheme_id,
    name: s.name || s.scheme_name,
    fullName: s.fullName || s.name || s.scheme_name,
    ministry: s.ministry,
    category: s.category?.toUpperCase() || 'WELFARE',
    icon: iconMap[s.category?.toLowerCase()] || 'sparkles',
    benefitShort: s.benefitShort || s.benefit_amount || 'See details',
    benefitType: s.benefitType || (s.category === 'health' ? 'Coverage' : s.category === 'pension' ? 'Pension' : 'Benefit'),
    benefitDetail: s.benefitDetail || s.benefit_description || '',
    matchStatus: (s.is_definite_match || s.match_score >= 0.80) ? 'eligible' : 'partial',
    matchReason: s.matchReason || formatMatchReason(s),
    matchScore: s.match_score || s.matchScore,
    matchReasons: s.match_reasons || [],
  };
}

function formatMatchReason(s) {
  if (s.match_reasons && s.match_reasons.length > 0) return s.match_reasons[0];
  if (s.match_score >= 0.85) return 'Strong match based on your profile details.';
  if (s.match_score >= 0.60) return 'Likely eligible — some details need verification.';
  return 'Matches your demographic profile criteria.';
}

export default function SchemesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileUsed, setProfileUsed] = useState(null);

  useEffect(() => {
    async function loadMatchedSchemes() {
      setLoading(true);
      setError(null);
      try {
        // Read user profile from sessionStorage
        let profile = {};
        try {
          const stored = sessionStorage.getItem('jansetu_chat_profile');
          if (stored) profile = JSON.parse(stored);
        } catch { /* ignore */ }

        setProfileUsed(profile);

        // Call match API with user's profile
        const data = await matchUserSchemes(profile);

        // Normalize and set
        if (Array.isArray(data) && data.length > 0) {
          setSchemes(data.map(normalizeScheme));
        } else {
          setSchemes([]);
        }
      } catch (err) {
        console.error(err);
        setError('Unable to fetch matching schemes. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadMatchedSchemes();
  }, []);

  const getSchemeIcon = (iconName) => {
    switch (iconName) {
      case 'tractor': return <Tractor className="w-4 h-4 text-emerald-600" />;
      case 'home': return <HomeIcon className="w-4 h-4 text-blue-600" />;
      case 'leaf': return <Leaf className="w-4 h-4 text-amber-600" />;
      case 'heart': return <Heart className="w-4 h-4 text-rose-600" />;
      case 'briefcase': return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'graduation': return <GraduationCap className="w-4 h-4 text-purple-600" />;
      case 'zap': return <Zap className="w-4 h-4 text-amber-600" />;
      case 'shield': return <Shield className="w-4 h-4 text-slate-600" />;
      case 'trending': return <TrendingUp className="w-4 h-4 text-green-600" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="text-xs text-slate-500 font-medium">Finding matching schemes for your profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">

        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <div className="w-8 h-1 bg-[#8C3A0A] rounded-full mb-1"></div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('schemes.title', 'Schemes you may be eligible for')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {schemes.length > 0
              ? t('schemes.subtitle', { count: schemes.length, defaultValue: `Based on your profile, we found ${schemes.length} relevant scheme${schemes.length !== 1 ? 's' : ''}.` })
              : t('schemes.empty', 'No matching schemes found. Try describing your situation differently.')}
          </p>

          {/* Profile context pill */}
          {profileUsed?.occupation && (
            <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 text-[11px] font-semibold text-slate-600 w-fit mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Matched for: {profileUsed.occupation}{profileUsed.annualIncome ? ` · ${profileUsed.annualIncome}` : ''}{profileUsed.location ? ` · ${profileUsed.location}` : ''}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Scheme Cards Grid or Empty State */}
        {schemes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs flex flex-col items-center justify-center max-w-md mx-auto">
            <Sparkles className="w-8 h-8 text-slate-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">{t('schemes.empty', 'No matching schemes found.')}</h3>
            <p className="text-xs text-slate-500 mb-4">Try providing more details about your situation to get better matches.</p>
            <button
              onClick={() => navigate('/assistant')}
              className="mt-2 bg-[#0A1633] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
            >
              {t('schemes.update_profile', 'Update Profile')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {schemes.map((scheme) => (
              <div
                key={scheme.id}
                className={`bg-white rounded-2xl p-6 border shadow-2xs flex flex-col justify-between transition-all hover:shadow-md ${
                  scheme.matchStatus === 'eligible'
                    ? 'border-t-4 border-t-emerald-700 border-slate-200/90'
                    : 'border-t-4 border-t-amber-700 border-slate-200/90'
                }`}
              >
                <div>
                  {/* Card Header: Icon & Eligibility Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      {getSchemeIcon(scheme.icon)}
                    </div>

                    {scheme.matchStatus === 'eligible' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{t('schemes.eligible_badge', 'You appear eligible')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>{t('schemes.partial_badge', 'Partial match')}</span>
                      </span>
                    )}
                  </div>

                  {/* Scheme Title & Category */}
                  <h3 className="text-base font-bold text-slate-900 mb-1">{scheme.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                    {scheme.fullName !== scheme.name ? scheme.fullName : scheme.benefitDetail || scheme.fullName}
                  </p>

                  {/* Benefit Amount Box */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {scheme.benefitType}
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {scheme.benefitShort}
                    </p>
                  </div>

                  {/* Match Reason */}
                  <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-snug mb-4">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p>{scheme.matchReason}</p>
                  </div>
                </div>

                {/* View Scheme Link */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/schemes/${scheme.id}`)}
                    className="text-xs font-bold text-slate-800 hover:text-orange-600 flex items-center gap-1.5 group transition-colors cursor-pointer"
                  >
                    <span>{t('schemes.view_scheme', 'View scheme')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Bottom Card: Explore more */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-8 sm:p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto w-full shadow-2xs mt-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mb-3.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5">{t('schemes.explore_title', 'Explore more options')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
            {t('schemes.explore_desc', 'Provide more details to uncover additional government schemes you might be eligible for.')}
          </p>
          <button
            onClick={() => navigate('/assistant')}
            className="bg-[#0A1633] hover:bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>{t('schemes.update_profile', 'Update Profile')}</span>
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
