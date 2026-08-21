import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const REGISTER_I18N = {
  hi: {
    title: 'नया खाता बनाएं',
    subtitle: 'सरकारी योजनाओं को खोजने और लाभ उठाने के लिए पंजीकरण करें।',
    nameLabel: 'पूरा नाम',
    namePlaceholder: 'अपना पूरा नाम दर्ज करें',
    emailLabel: 'ईमेल पता',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'न्यूनतम 6 अक्षर',
    confirmLabel: 'पासवर्ड की पुष्टि करें',
    confirmPlaceholder: 'पासवर्ड पुनः दर्ज करें',
    termsText: 'मैं जन-सेतु की',
    termsLink: 'सेवा की शर्तों',
    andText: 'और',
    privacyLink: 'गोपनीयता नीति',
    agreeText: 'से सहमत हूँ।',
    createBtn: 'खाता बनाएं',
    creatingBtn: 'खाता बन रहा है...',
    hasAccount: 'क्या आपके पास पहले से खाता है?',
    signInLink: 'साइन इन करें',
    allFieldsReq: 'कृपया सभी आवश्यक फ़ील्ड भरें',
    minPassLen: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए',
    passMismatch: 'पासवर्ड मेल नहीं खाते',
    agreeReq: 'कृपया सेवा की शर्तों और गोपनीयता नीति से सहमत हों',
    welcome: (name) => `खाता सफलतापूर्वक बन गया! स्वागत है, ${name}`,
  },
  bn: {
    title: 'অ্যাকাউন্ট তৈরি করুন',
    subtitle: 'সরকারি প্রকল্পসমূহ অন্বেষণ করতে নিবন্ধন করুন।',
    nameLabel: 'পুরো নাম',
    namePlaceholder: 'আপনার পুরো নাম লিখুন',
    emailLabel: 'ইমেল ঠিকানা',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'পাসওয়ার্ড',
    passwordPlaceholder: 'কমপক্ষে ৬টি অক্ষর',
    confirmLabel: 'পাসওয়ার্ড নিশ্চিত করুন',
    confirmPlaceholder: 'পাসওয়ার্ড পুনরায় লিখুন',
    termsText: 'আমি জন-সেতুর',
    termsLink: 'শর্তাবলী',
    andText: 'এবং',
    privacyLink: 'গোপনীয়তা নীতি',
    agreeText: 'মেনে নিচ্ছি।',
    createBtn: 'অ্যাকাউন্ট তৈরি করুন',
    creatingBtn: 'তৈরি হচ্ছে...',
    hasAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    signInLink: 'সাইন ইন করুন',
    allFieldsReq: 'অনুগ্রহ করে সমস্ত প্রয়োজনীয় ঘর পূরণ করুন',
    minPassLen: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
    passMismatch: 'পাসওয়ার্ড মেলেনি',
    agreeReq: 'অনুগ্রহ করে শর্তাবলীতে সম্মতি দিন',
    welcome: (name) => `অ্যাকাউন্ট তৈরি হয়েছে! স্বাগতম, ${name}`,
  },
  ta: {
    title: 'புதிய கணக்கை உருவாக்கவும்',
    subtitle: 'அரசு நலத்திட்டங்களை கண்டறிய பதிவு செய்க.',
    nameLabel: 'முழுப் பெயர்',
    namePlaceholder: 'உங்கள் முழுப் பெயர்',
    emailLabel: 'மின்னஞ்சல் முகவரி',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'கடவுச்சொல்',
    passwordPlaceholder: 'குறைந்தது 6 எழுத்துக்கள்',
    confirmLabel: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    confirmPlaceholder: 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்',
    termsText: 'நான் ஜன-சேதுவின்',
    termsLink: 'சேவை விதிகள்',
    andText: 'மற்றும்',
    privacyLink: 'தனியுரிமைக் கொள்கையை',
    agreeText: 'ஏற்கிறேன்.',
    createBtn: 'கணக்கை உருவாக்கவும்',
    creatingBtn: 'உருவாக்கப்படுகிறது...',
    hasAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    signInLink: 'உள்நுழைக',
    allFieldsReq: 'அனைத்து விவரங்களையும் நிரப்பவும்',
    minPassLen: 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்',
    passMismatch: 'கடவுச்சொற்கள் பொருந்தவில்லை',
    agreeReq: 'விதிமுறைகளை ஏற்கவும்',
    welcome: (name) => `கணக்கு உருவாக்கப்பட்டது! வருக, ${name}`,
  },
  te: {
    title: 'ఖాతాను సృష్టించండి',
    subtitle: 'ప్రభుత్వ పథకాలను శోధించడానికి నమోదు చేయండి.',
    nameLabel: 'పూర్తి పేరు',
    namePlaceholder: 'మీ పూర్తి పేరును నమోదు చేయండి',
    emailLabel: 'ఇమెయిల్ చిరునామా',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'పాస్‌వర్డ్',
    passwordPlaceholder: 'కనీసం 6 అక్షరాలు',
    confirmLabel: 'పాస్‌వర్డ్‌ను నిర్ధారించండి',
    confirmPlaceholder: 'పాస్‌వర్డ్‌ను మళ్లీ నమోదు చేయండి',
    termsText: 'నేను జన-సేతు యొక్క',
    termsLink: 'సేవా నిబంధనలు',
    andText: 'మరియు',
    privacyLink: 'గోప్యతా విధానం',
    agreeText: 'అంగీకరిస్తున్నాను.',
    createBtn: 'ఖాతాను సృష్టించండి',
    creatingBtn: 'సృష్టించబడుతోంది...',
    hasAccount: 'ఇప్పటికే ఖాతా ఉందా?',
    signInLink: 'సైన్ ఇన్ చేయండి',
    allFieldsReq: 'దయచేసి అన్ని వివరాలను నమోదు చేయండి',
    minPassLen: 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి',
    passMismatch: 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు',
    agreeReq: 'దయచేసి నిబంధనలను అంగీకరించండి',
    welcome: (name) => `ఖాతా సృష్టించబడింది! స్వాగతం, ${name}`,
  },
  en: {
    title: 'Create your account',
    subtitle: 'Sign up to discover and apply for government welfare schemes.',
    nameLabel: 'Full Name',
    namePlaceholder: 'Your Name',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 6 characters',
    confirmLabel: 'Confirm Password',
    confirmPlaceholder: 'Re-enter password',
    termsText: 'I agree to the',
    termsLink: 'Terms of Service',
    andText: 'and',
    privacyLink: 'Privacy Policy',
    agreeText: '.',
    createBtn: 'Create Account',
    creatingBtn: 'Creating Account...',
    hasAccount: 'Already have an account?',
    signInLink: 'Sign In',
    allFieldsReq: 'Please fill in all fields',
    minPassLen: 'Password must be at least 6 characters',
    passMismatch: 'Passwords do not match',
    agreeReq: 'Please agree to the Terms of Service and Privacy Policy',
    welcome: (name) => `Account created! Welcome, ${name}`,
  },
};

export default function Register() {
  const { register } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const currentLang = i18n.language || 'en';
  const t = REGISTER_I18N[currentLang] || REGISTER_I18N['en'];

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return toast.error(t.allFieldsReq);
    }
    if (form.password.length < 6) {
      return toast.error(t.minPassLen);
    }
    if (form.password !== form.confirm) {
      return toast.error(t.passMismatch);
    }
    if (!agreed) {
      return toast.error(t.agreeReq);
    }

    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, currentLang);
      toast.success(t.welcome(user.name));
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 bg-[#F8FAFC]">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-9 text-center">
        {/* Top Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#1E3A8A] mx-auto mb-4">
          <UserCheck className="w-5 h-5 text-[#1E3A8A]" />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl font-bold text-[#0B132B] tracking-tight mb-1.5">
          {t.title}
        </h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          {t.subtitle}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="text-left flex flex-col gap-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              {t.nameLabel}
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={t.namePlaceholder}
              required
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              {t.emailLabel}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t.emailPlaceholder}
              required
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t.passwordPlaceholder}
                required
                className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              {t.confirmLabel}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder={t.confirmPlaceholder}
                required
                className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-600">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded-sm border-slate-300 text-blue-950 focus:ring-blue-900 cursor-pointer"
            />
            <label htmlFor="terms" className="leading-snug cursor-pointer">
              {t.termsText}{' '}
              <Link to="/about" className="text-orange-600 font-bold hover:underline">
                {t.termsLink}
              </Link>{' '}
              {t.andText}{' '}
              <Link to="/about" className="text-orange-600 font-bold hover:underline">
                {t.privacyLink}
              </Link>
              {t.agreeText}
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#0A1633] hover:bg-slate-900 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                <span>{t.creatingBtn}</span>
              </>
            ) : (
              <span>{t.createBtn}</span>
            )}
          </button>
        </form>

        {/* Bottom Link */}
        <p className="text-xs text-slate-500 mt-6">
          {t.hasAccount}{' '}
          <Link to="/login" className="text-orange-600 font-bold hover:underline">
            {t.signInLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
