import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Eye, EyeOff, Mic, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const LOGIN_I18N = {
  hi: {
    title: 'पुनः स्वागत है',
    subtitle: 'अपने आवेदनों और प्रोफ़ाइल तक पहुँचने के लिए लॉगिन करें।',
    emailLabel: 'ईमेल पता',
    emailPlaceholder: 'अपना पंजीकृत ईमेल दर्ज करें',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    signInBtn: 'साइन इन करें',
    signingInBtn: 'साइन इन हो रहा है...',
    orContinueWith: 'या इसके साथ जारी रखें',
    voiceLogin: 'आवाज से लॉगिन करें',
    noAccount: 'क्या आपका खाता नहीं है?',
    registerLink: 'पंजीकरण करें',
    reqError: 'कृपया अपना ईमेल और पासवर्ड दर्ज करें',
    welcomeBack: (name) => `पुनः स्वागत है, ${name}!`,
  },
  bn: {
    title: 'স্বাগতম',
    subtitle: 'আপনার আবেদন এবং প্রোফাইল দেখতে লগইন করুন।',
    emailLabel: 'ইমেল ঠিকানা',
    emailPlaceholder: 'আপনার নিবন্ধিত ইমেল লিখুন',
    passwordLabel: 'পাসওয়ার্ড',
    passwordPlaceholder: 'আপনার পাসওয়ার্ড লিখুন',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
    signInBtn: 'সাইন ইন করুন',
    signingInBtn: 'সাইন ইন হচ্ছে...',
    orContinueWith: 'অথবা এর মাধ্যমে চালিয়ে যান',
    voiceLogin: 'ভয়েস দিয়ে লগইন করুন',
    noAccount: 'কোনো অ্যাকাউন্ট নেই?',
    registerLink: 'নিবন্ধন করুন',
    reqError: 'অনুগ্রহ করে আপনার ইমেল এবং পাসওয়ার্ড লিখুন',
    welcomeBack: (name) => `স্বাগতম, ${name}!`,
  },
  ta: {
    title: 'மீண்டும் வருக',
    subtitle: 'உங்கள் விண்ணப்பங்கள் மற்றும் சுயவிவரத்தை அணுக உள்நுழையவும்.',
    emailLabel: 'மின்னஞ்சல் முகவரி',
    emailPlaceholder: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
    passwordLabel: 'கடவுச்சொல்',
    passwordPlaceholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    signInBtn: 'உள்நுழைக',
    signingInBtn: 'உள்நுழைகிறது...',
    orContinueWith: 'அல்லது இதன் மூலம் தொடரவும்',
    voiceLogin: 'குரல் மூலம் உள்நுழைக',
    noAccount: 'கணக்கு இல்லையா?',
    registerLink: 'பதிவு செய்க',
    reqError: 'தயவுசெய்து உங்கள் மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்',
    welcomeBack: (name) => `மீண்டும் வருக, ${name}!`,
  },
  te: {
    title: 'తిరిగి స్వాగతం',
    subtitle: 'మీ దరఖాస్తులు మరియు ప్రొఫైల్‌ను యాక్సెస్ చేయడానికి లాగిన్ అవ్వండి.',
    emailLabel: 'ఇమెయిల్ చిరునామా',
    emailPlaceholder: 'మీ రిజిస్టర్డ్ ఇమెయిల్‌ను నమోదు చేయండి',
    passwordLabel: 'పాస్‌వర్డ్',
    passwordPlaceholder: 'మీ పాస్‌వర్డ్‌ను నమోదు చేయండి',
    forgotPassword: 'పాస్‌వర్డ్ మర్చిపోయారా?',
    signInBtn: 'సైన్ ఇన్ చేయండి',
    signingInBtn: 'సైన్ ఇన్ అవుతోంది...',
    orContinueWith: 'లేదా దీనితో కొనసాగించండి',
    voiceLogin: 'వాయిస్‌తో లాగిన్ అవ్వండి',
    noAccount: 'ఖాతా లేదా?',
    registerLink: 'నమోదు చేయండి',
    reqError: 'దయచేసి మీ ఇమెయిల్ మరియు పాస్‌వర్డ్‌ను నమోదు చేయండి',
    welcomeBack: (name) => `తిరిగి స్వాగతం, ${name}!`,
  },
  en: {
    title: 'Welcome back',
    subtitle: 'Log in to access your applications and profile.',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'Forgot password?',
    signInBtn: 'Sign In',
    signingInBtn: 'Signing In...',
    orContinueWith: 'or continue with',
    voiceLogin: 'Sign In with Voice',
    noAccount: "Don't have an account?",
    registerLink: 'Register',
    reqError: 'Please enter your email and password',
    welcomeBack: (name) => `Welcome back, ${name}!`,
  },
};

export default function Login() {
  const { login } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const currentLang = (i18n.language || 'en').slice(0, 2);
  const t = LOGIN_I18N[currentLang] || LOGIN_I18N['en'];

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error(t.reqError);
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(t.welcomeBack(user.name));
      if (!user.profile?.onboardingComplete) {
        navigate('/onboarding');
      } else {
        navigate(from === '/assistant' ? '/' : from, { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceLogin = () => {
    toast(currentLang === 'hi' ? 'वॉयस लॉगिन प्रारंभ हुआ...' : 'Voice login initiated. Please speak your name or email…');
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[#F8FAFC] transition-colors duration-200">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-8 sm:p-9 text-center">
        {/* Top Avatar Icon */}
        <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#1E3A8A] mx-auto mb-4 border border-blue-100">
          <User className="w-5 h-5 text-[#1E3A8A]" />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl font-bold text-[#0B132B] tracking-tight mb-1.5">
          {t.title}
        </h1>
        <p className="text-xs text-slate-500 mb-7 leading-relaxed">
          {t.subtitle}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="text-left flex flex-col gap-4">
          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              {t.emailLabel}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t.emailPlaceholder}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {t.passwordLabel}
              </label>
              <button
                type="button"
                onClick={() => toast.success(currentLang === 'hi' ? 'पासवर्ड रीसेट लिंक भेजा गया' : 'Password reset link sent to your email')}
                className="text-[11px] font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                {t.forgotPassword}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t.passwordPlaceholder}
                required
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#0A1633] hover:bg-slate-900 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                <span>{t.signingInBtn}</span>
              </>
            ) : (
              <span>{t.signInBtn}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-slate-100 w-full"></div>
          <span className="bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 absolute">
            {t.orContinueWith}
          </span>
        </div>

        {/* Voice Login Button */}
        <button
          type="button"
          onClick={handleVoiceLogin}
          className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm py-2.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Mic className="w-4 h-4 text-orange-500" />
          <span>{t.voiceLogin}</span>
        </button>

        {/* Bottom Link */}
        <p className="text-xs text-slate-500 mt-6">
          {t.noAccount}{' '}
          <Link to="/register" state={{ from }} className="text-orange-600 font-bold hover:underline">
            {t.registerLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
