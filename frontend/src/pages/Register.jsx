// src/pages/Register.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Eye, EyeOff, ChevronRight, ArrowLeft, Globe,
  Phone, Mail, User, MapPin, CheckCircle, XCircle,
  Loader2, Shield, RotateCcw, Lock, BadgeCheck,
  AlertCircle, AtSign, Check, Zap
} from 'lucide-react';

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const LANG = {
  en: {
    brandTag: "Farmer's Partner",
    guideTitle: "Create Account", guideSub: "Just 2 easy steps to get started!",
    step1Hi: "Your Details", step1En: "Name, username, contact & password",
    step2Hi: "Verify Mobile", step2En: "Enter the OTP we send you",
    regAs: "Registering as",
    trust: ["Free to Register", "Completely Safe", "Easy on Mobile"],
    secure: "Secure",
    cardTitle1: "Fill in your details", cardSub1: "Create your AgriConnect account",
    cardTitle2: "Enter OTP", cardSub2: "OTP sent to",
    whoAreYou: "I want to register as *",
    roles: { farmer: "Farmer", dealer: "Dealer", customer: "Customer" },
    roleDesc: { farmer: "Agricultural Producer", dealer: "Crop Buyer & Seller", customer: "Product Buyer" },
    fields: {
      name: "Full Name", username: "Username", phone: "Mobile Number",
      city: "City", email: "Email (Optional)", password: "Password",
      confirm: "Confirm Password",
    },
    ph: {
      name: "Raj Patil", username: "rajpatil123", phone: "9876543210",
      city: "Pune, Maharashtra", email: "rajpatil@example.com",
      password: "Min. 8 characters", confirm: "Repeat password",
    },
    optional: "Not required",
    available: "✓ Available", taken: "✗ Already taken",
    pwMatch: "✓ Passwords match", pwNoMatch: "✗ Passwords don't match",
    strength: ["Very Weak", "Weak", "Fair", "Good", "Strong"],
    sendOtp: "Send OTP to Mobile", sending: "Sending OTP…",
    testHint: "For testing: check browser console (F12) for OTP",
    otpTitle: "Verify Your Mobile Number",
    otpSent: "6-digit OTP sent to",
    expiry: "Expires in", resend: "Resend OTP",
    verify: "Verify & Create Account", verifying: "Verifying…",
    editDetails: "← Edit details",
    otpHint: "Testing: F12 → Console → look for \"TEST OTP\"",
    alreadyAcc: "Already have an account?", signIn: "Sign in",
    backHome: "Back to home",
    successTitle: "Congratulations! 🎉",
    successHi: "Your account has been created.",
    successEn: "You can now login with your credentials.",
    detailLabels: { username: "Username", name: "Name", role: "Role", city: "City" },
    redirect: "Redirecting to login in 3 seconds…",
    goLogin: "Go to Login",
    progressLabel: ["Step 1 of 2", "Step 2 of 2"],
    err: {
      name: "Name must be at least 2 characters.",
      nameLetters: "Name should contain letters only.",
      username: "Username must be at least 3 characters.",
      usernameChars: "Letters, numbers and _ only.",
      usernameTaken: "Username already taken.",
      phone: "Phone number is required.",
      phoneDigits: "Phone must be 10 digits.",
      phoneStart: "Must start with 6, 7, 8, or 9.",
      password: "Password must be at least 8 characters.",
      confirm: "Passwords do not match.",
      city: "Please enter a valid city name.",
      sendFail: "Failed to send OTP.",
      regFail: "Registration failed.",
      otpWrong: "Invalid OTP.",
      otpErr: "Error verifying OTP. Please try again.",
    },
  },
  mr: {
    brandTag: "शेतकऱ्याचा साथी",
    guideTitle: "नवीन खाते बनवा", guideSub: "फक्त २ सोप्या पायऱ्यांमध्ये सुरुवात करा!",
    step1Hi: "तुमची माहिती", step1En: "नाव, युजरनेम, संपर्क व पासवर्ड",
    step2Hi: "मोबाइल तपासणी", step2En: "पाठवलेला OTP टाका",
    regAs: "नोंदणी करत आहात",
    trust: ["मोफत नोंदणी", "पूर्णपणे सुरक्षित", "मोबाइलवर सोपे"],
    secure: "सुरक्षित",
    cardTitle1: "तुमची माहिती भरा", cardSub1: "तुमचे AgriConnect खाते बनवा",
    cardTitle2: "OTP टाका", cardSub2: "OTP पाठवला",
    whoAreYou: "तुम्ही कोण आहात? *",
    roles: { farmer: "शेतकरी", dealer: "व्यापारी", customer: "ग्राहक" },
    roleDesc: { farmer: "शेतमाल उत्पादक", dealer: "पीक खरेदीदार", customer: "माल खरेदीदार" },
    fields: {
      name: "पूर्ण नाव", username: "युजरनेम", phone: "मोबाइल नंबर",
      city: "शहर", email: "ईमेल (पर्यायी)", password: "पासवर्ड",
      confirm: "पासवर्ड पुन्हा टाका",
    },
    ph: {
      name: "राज पाटील", username: "rajpatil123", phone: "9876543210",
      city: "पुणे, महाराष्ट्र", email: "rajpatil@example.com",
      password: "किमान ८ अक्षरे", confirm: "पासवर्ड दोहरावा",
    },
    optional: "आवश्यक नाही",
    available: "✓ उपलब्ध", taken: "✗ आधीच घेतले",
    pwMatch: "✓ पासवर्ड जुळतात", pwNoMatch: "✗ पासवर्ड जुळत नाहीत",
    strength: ["अगदी कमकुवत", "कमकुवत", "बरे आहे", "चांगले", "उत्तम"],
    sendOtp: "मोबाइलवर OTP पाठवा", sending: "OTP पाठवत आहे…",
    testHint: "चाचणी: OTP साठी ब्राउजर Console (F12) पहा",
    otpTitle: "तुमचा मोबाइल तपासा",
    otpSent: "६ अंकी OTP पाठवला",
    expiry: "वेळ शिल्लक", resend: "OTP पुन्हा पाठवा",
    verify: "OTP तपासा व खाते बनवा", verifying: "तपासत आहे…",
    editDetails: "← माहिती बदला",
    otpHint: "चाचणी: F12 → Console → \"TEST OTP\" पहा",
    alreadyAcc: "आधीच खाते आहे?", signIn: "लॉगिन करा",
    backHome: "मुख्य पृष्ठ",
    successTitle: "अभिनंदन! 🎉",
    successHi: "तुमचे खाते यशस्वीरित्या तयार झाले.",
    successEn: "You can now login with your credentials.",
    detailLabels: { username: "युजरनेम", name: "नाव", role: "भूमिका", city: "शहर" },
    redirect: "३ सेकंदात लॉगिन पेजवर जाल…",
    goLogin: "लॉगिन करा",
    progressLabel: ["पायरी १ / २", "पायरी २ / २"],
    err: {
      name: "नाव किमान २ अक्षरे असावे.",
      nameLetters: "नावात फक्त अक्षरे असावीत.",
      username: "युजरनेम किमान ३ अक्षरे असावे.",
      usernameChars: "फक्त अक्षरे, नंबर आणि _ वापरा.",
      usernameTaken: "हे युजरनेम आधीच घेतले आहे.",
      phone: "मोबाइल नंबर आवश्यक आहे.",
      phoneDigits: "१० अंकी नंबर टाका.",
      phoneStart: "६, ७, ८ किंवा ९ ने सुरू व्हायला हवे.",
      password: "किमान ८ अक्षरे असलेला पासवर्ड द्या.",
      confirm: "पासवर्ड जुळत नाहीत.",
      city: "शहराचे नाव टाका.",
      sendFail: "OTP पाठवणे अयशस्वी झाले.",
      regFail: "नोंदणी अयशस्वी झाली.",
      otpWrong: "चुकीचा OTP.",
      otpErr: "OTP तपासताना त्रुटी. पुन्हा प्रयत्न करा.",
    },
  },
  hi: {
    brandTag: "किसान का साथी",
    guideTitle: "नया खाता बनाएं", guideSub: "बस 2 आसान कदम में शुरू करें!",
    step1Hi: "आपकी जानकारी", step1En: "नाम, यूज़रनेम, संपर्क और पासवर्ड",
    step2Hi: "मोबाइल जाँच", step2En: "भेजा गया OTP डालें",
    regAs: "रजिस्टर कर रहे हैं",
    trust: ["मुफ़्त रजिस्ट्रेशन", "बिल्कुल सुरक्षित", "मोबाइल पर आसान"],
    secure: "सुरक्षित",
    cardTitle1: "अपनी जानकारी भरें", cardSub1: "अपना AgriConnect खाता बनाएं",
    cardTitle2: "OTP डालें", cardSub2: "OTP भेजा गया",
    whoAreYou: "आप कौन हैं? *",
    roles: { farmer: "किसान", dealer: "व्यापारी", customer: "ग्राहक" },
    roleDesc: { farmer: "कृषि उत्पादक", dealer: "फसल खरीदार", customer: "उत्पाद खरीदार" },
    fields: {
      name: "पूरा नाम", username: "यूज़रनेम", phone: "मोबाइल नंबर",
      city: "शहर", email: "ईमेल (वैकल्पिक)", password: "पासवर्ड",
      confirm: "पासवर्ड फिर डालें",
    },
    ph: {
      name: "राज पाटिल", username: "rajpatil123", phone: "9876543210",
      city: "पुणे, Maharashtra", email: "rajpatil@example.com",
      password: "कम से कम 8 अक्षर", confirm: "पासवर्ड दोहराएं",
    },
    optional: "ज़रूरी नहीं",
    available: "✓ उपलब्ध", taken: "✗ पहले से लिया",
    pwMatch: "✓ पासवर्ड मिलते हैं", pwNoMatch: "✗ पासवर्ड नहीं मिलते",
    strength: ["बहुत कमज़ोर", "कमज़ोर", "ठीक है", "अच्छा", "बहुत अच्छा"],
    sendOtp: "मोबाइल पर OTP भेजें", sending: "OTP भेज रहे हैं…",
    testHint: "Testing: OTP के लिए Console (F12) देखें",
    otpTitle: "अपना मोबाइल नंबर जाँचें",
    otpSent: "6 अंकों का OTP भेजा गया",
    expiry: "समय सीमा", resend: "OTP फिर भेजें",
    verify: "OTP जाँचें और खाता बनाएं", verifying: "जाँच हो रही है…",
    editDetails: "← जानकारी बदलें",
    otpHint: "Testing: F12 → Console → \"TEST OTP\" देखें",
    alreadyAcc: "पहले से खाता है?", signIn: "लॉगिन करें",
    backHome: "होम पेज",
    successTitle: "बधाई हो! 🎉",
    successHi: "आपका खाता सफलतापूर्वक बन गया है।",
    successEn: "You can now login with your credentials.",
    detailLabels: { username: "यूज़रनेम", name: "नाम", role: "भूमिका", city: "शहर" },
    redirect: "3 सेकंड में लॉगिन पेज पर जाएंगे…",
    goLogin: "लॉगिन करें",
    progressLabel: ["कदम १ / २", "कदम २ / २"],
    err: {
      name: "नाम कम से कम 2 अक्षर का होना चाहिए।",
      nameLetters: "नाम में केवल अक्षर होने चाहिए।",
      username: "यूज़रनेम कम से कम 3 अक्षर का होना चाहिए।",
      usernameChars: "केवल अक्षर, नंबर और _ चाहिए।",
      usernameTaken: "यह यूज़रनेम पहले से लिया जा चुका है।",
      phone: "मोबाइल नंबर ज़रूरी है।",
      phoneDigits: "10 अंकों का नंबर डालें।",
      phoneStart: "6, 7, 8 या 9 से शुरू होना चाहिए।",
      password: "कम से कम 8 अक्षर का पासवर्ड चाहिए।",
      confirm: "पासवर्ड मेल नहीं खाते।",
      city: "शहर का नाम डालें।",
      sendFail: "OTP भेजने में समस्या हुई।",
      regFail: "रजिस्ट्रेशन में समस्या हुई।",
      otpWrong: "गलत OTP है।",
      otpErr: "OTP जाँचने में समस्या। पुनः प्रयास करें।",
    },
  },
};

const LANG_OPTS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'mr', label: 'मराठी', flag: '🧡' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
];

// Password strength colors
const SC = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#16a34a'];

// ─── ROLE CONFIG ─────────────────────────────────────────────────────────────
const ROLE_EMOJI = { farmer: '🌾', dealer: '🏪', customer: '🛒' };

// ─── FIELD WRAPPER COMPONENT ─────────────────────────────────────────────────
const F = ({ label, req, error, ico, suffix, hint, focused, children }) => (
  <div className={`rp-field ${focused ? 'focused' : ''} ${error ? 'has-err' : ''}`}>
    <label>{label}{req && <span className="rp-req"> *</span>}</label>
    <div className="rp-fi">
      {ico && <span className="rp-fi__ico">{ico}</span>}
      {children}
      {suffix && <span className="rp-fi__sfx">{suffix}</span>}
    </div>
    {error && (
      <div className="rp-ferr">
        <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
        {error}
      </div>
    )}
    {hint && !error && <div className="rp-fhint">{hint}</div>}
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Register() {
  const { register, sendOTP, verifyOTP, checkUsernameAvailability } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const otpRefs = useRef([]);

  const [lang, setLang] = useState('en');
  const [langOpen, setLangOpen] = useState(false);
  const t = LANG[lang];

  const [step, setStep] = useState('details');
  const [form, setForm] = useState({
    name: '', username: '', email: '', phone: '',
    password: '', confirmPassword: '', role: 'farmer', city: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [success, setSuccess] = useState(false);
  const [unAvail, setUnAvail] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [focused, setFocused] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  // Close lang dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (!e.target.closest('.rp-lang-wrap')) setLangOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // OTP countdown timer
  useEffect(() => {
    let iv;
    if (timer > 0) iv = setInterval(() => setTimer(p => p - 1), 1000);
    else if (timer === 0 && step === 'otp') setCanResend(true);
    return () => clearInterval(iv);
  }, [timer, step]);

  // Username availability check (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      if (form.username.length >= 3) {
        const result = checkUsernameAvailability(form.username);
        // Support both sync (boolean) and async (Promise) versions
        if (result && typeof result.then === 'function') {
          result.then(available => setUnAvail(!available));
        } else {
          setUnAvail(!result);
        }
      } else {
        setUnAvail(null);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [form.username]);

  // Reset errors on lang change
  useEffect(() => { setErrors({}); }, [lang]);

  // Grain canvas texture
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const img = ctx.createImageData(c.width, c.height);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = 200 + Math.random() * 55;
      img.data[i + 1] = 160 + Math.random() * 55;
      img.data[i + 2] = 80 + Math.random() * 40;
      img.data[i + 3] = 8;
    }
    ctx.putImageData(img, 0, 0);
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const pwStr = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^a-zA-Z\d]/.test(pw)) s++;
    return s;
  };

  const validate = () => {
    const e = {};
    if (form.name.length < 2) e.name = t.err.name;
    else if (!/^[a-zA-Z\s\u0900-\u097F]+$/.test(form.name)) e.name = t.err.nameLetters;
    if (form.username.length < 3) e.username = t.err.username;
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = t.err.usernameChars;
    else if (unAvail === true) e.username = t.err.usernameTaken;
    if (!form.phone) e.phone = t.err.phone;
    else if (form.phone.replace(/\D/g, '').length !== 10) e.phone = t.err.phoneDigits;
    else if (!/^[6-9]/.test(form.phone.replace(/\D/g, ''))) e.phone = t.err.phoneStart;
    if (form.password.length < 8) e.password = t.err.password;
    if (form.password !== form.confirmPassword) e.confirmPassword = t.err.confirm;
    if (form.city.length < 2) e.city = t.err.city;
    return e;
  };

  const fc = (n, v) => {
    setForm({ ...form, [n]: v });
    if (errors[n]) setErrors({ ...errors, [n]: '' });
  };

  const handleInput = (e) => fc(e.target.name, e.target.value);

  // ── Send OTP ────────────────────────────────────────────────────────────────
  const sendOtp = async () => {
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    if (unAvail === true) { setErrors({ username: t.err.usernameTaken }); return; }

    setLoading(true); setErrors({}); setDebugInfo('Sending OTP...');
    try {
      const r = await sendOTP({
        name: form.name,
        username: form.username,
        phone: form.phone,
        role: form.role,
        city: form.city,
      });
      setDebugInfo(`OTP Result: ${JSON.stringify(r)}`);
      if (r.success) {
        setStep('otp'); setTimer(30); setCanResend(false); setOtpSent(true);
        console.log('🔢 TEST OTP:', r.data);
      } else {
        setErrors({ submit: r.message || t.err.sendFail });
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setDebugInfo(`Error: ${err.message}`);
      setErrors({ submit: t.err.sendFail });
    } finally { setLoading(false); }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const resendOtp = async () => {
    setLoading(true); setOtp(['', '', '', '', '', '']);
    setErrors({}); setCanResend(false); setDebugInfo('Resending OTP...');
    try {
      const r = await sendOTP({
        name: form.name,
        username: form.username,
        phone: form.phone,
        role: form.role,
        city: form.city,
      });
      setDebugInfo(`Resend Result: ${JSON.stringify(r)}`);
      if (r.success) { setTimer(30); }
      else setErrors({ submit: r.message || t.err.sendFail });
    } catch (err) {
      console.error('Resend OTP error:', err);
      setErrors({ submit: t.err.sendFail });
    } finally { setLoading(false); }
  };

  // ── OTP Input Handler ───────────────────────────────────────────────────────
  const handleOtpChange = (i, v) => {
    if (v.match(/^\d?$/)) {
      const n = [...otp]; n[i] = v; setOtp(n);
      if (v && i < 5) setTimeout(() => otpRefs.current[i + 1]?.focus(), 10);
      if (!v && i > 0) setTimeout(() => otpRefs.current[i - 1]?.focus(), 10);
      if (n.every(x => x !== '')) verifyOtp(n.join(''));
    }
  };

  // ── Verify OTP + Register ───────────────────────────────────────────────────
  const verifyOtp = async (code) => {
    setLoading(true); setErrors({}); setDebugInfo('Verifying OTP...');
    try {
      const r = await verifyOTP(code);
      setDebugInfo(`Verify Result: ${JSON.stringify(r)}`);
      if (r.success) {
        const reg = await register({
          name: form.name,
          username: form.username,
          phone: form.phone,
          password: form.password,
          role: form.role,
          city: form.city,
          otp: code,
        });
        if (reg.success) {
          setSuccess(true);
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setErrors({ submit: reg.message || t.err.regFail });
          setOtp(['', '', '', '', '', '']);
          otpRefs.current[0]?.focus();
        }
      } else {
        setErrors({ otp: r.message || t.err.otpWrong });
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setDebugInfo(`Verify Error: ${err.message}`);
      setErrors({ otp: t.err.otpErr });
      setOtp(['', '', '', '', '', '']);
    } finally { setLoading(false); }
  };

  const ps = pwStr(form.password);
  const currentLangOpt = LANG_OPTS.find(l => l.code === lang);

  // ── SUCCESS SCREEN ──────────────────────────────────────────────────────────
  if (success) return (
    <div className="rp-root">
      <canvas ref={canvasRef} className="rp-grain" />
      <div className="rp-bg"><div className="rp-bg__sky" /><div className="rp-bg__dots" /></div>
      <div className="rp-success-wrap">
        <div className="rp-success-card">
          <div className="rp-stripe" />
          <div className="rp-success-body">
            <div className="rp-sico-wrap">
              <div className="rp-sico">
                <div className="rp-sring" />
                <div className="rp-sico-inner">
                  <Check size={36} color="white" strokeWidth={3} />
                </div>
              </div>
            </div>
            <h2>{t.successTitle}</h2>
            <p className="shi">{t.successHi}</p>
            <p className="sen">{t.successEn}</p>
            <div className="rp-sdetails">
              {['username', 'name', 'role', 'city'].map(k => (
                <div key={k} className="rp-srow">
                  <span>{t.detailLabels[k]}</span>
                  <strong>{k === 'role' ? (t.roles[form.role] || form.role) : form[k]}</strong>
                </div>
              ))}
            </div>
            <p className="redir">{t.redirect}</p>
            <button className="rp-sbtn" onClick={() => navigate('/login')}>
              {t.goLogin} <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
      <style>{CSS}</style>
    </div>
  );

  // ── MAIN RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="rp-root">
      <canvas ref={canvasRef} className="rp-grain" />
      <div className="rp-bg">
        <div className="rp-bg__sky" /><div className="rp-bg__field" />
        <div className="rp-bg__sun" /><div className="rp-bg__dots" />
      </div>
      <div className="rp-deco d1">🌾</div>
      <div className="rp-deco d2">🌻</div>
      <div className="rp-deco d3">🍃</div>

      {/* ── LANGUAGE SWITCHER ── */}
      <div className="rp-lang-wrap">
        <button className="rp-lang-btn" onClick={() => setLangOpen(o => !o)}>
          <Globe size={14} strokeWidth={2.5} />
          <span>{currentLangOpt.flag}</span>
          <span className="rp-lang-lbl">{currentLangOpt.label}</span>
          <span className={`rp-lang-caret ${langOpen ? 'open' : ''}`}>▾</span>
        </button>
        {langOpen && (
          <div className="rp-lang-dd">
            {LANG_OPTS.map(opt => (
              <button key={opt.code}
                className={`rp-lang-opt ${lang === opt.code ? 'active' : ''}`}
                onClick={() => { setLang(opt.code); setLangOpen(false); }}>
                <span>{opt.flag}</span><span>{opt.label}</span>
                {lang === opt.code && <span className="rp-lang-tick">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── DEBUG (remove in production) ── */}
      {debugInfo && (
        <div style={{
          position: 'fixed', top: 16, left: 20, zIndex: 400,
          background: '#fef9c3', color: '#713f12', fontSize: 11,
          padding: '6px 12px', borderRadius: 8, maxWidth: 260,
          border: '1px solid #fde68a', fontWeight: 600,
        }}>
          <div style={{ fontWeight: 800, marginBottom: 2 }}>Debug:</div>
          <div style={{ wordBreak: 'break-all' }}>{debugInfo}</div>
        </div>
      )}

      <div className="rp-layout">

        {/* ── ASIDE ── */}
        <aside className="rp-aside">
          <div className="rp-aside__inner">

            {/* Brand */}
            <div className="rp-brand">
              <div className="rp-brand__icon-wrap">
                <div className="rp-brand__ico">🌾</div>
                <div className="rp-brand__zap"><Zap size={12} color="white" /></div>
              </div>
              <div>
                <div className="rp-brand__name">AgriConnect</div>
                <div className="rp-brand__tag">{t.brandTag}</div>
              </div>
            </div>

            {/* Guide */}
            <div className="rp-guide">
              <div className="rp-guide__leaf">🌱</div>
              <h2>{t.guideTitle}</h2>
              <p>{t.guideSub}</p>
            </div>

            {/* Steps */}
            <div className="rp-steps">
              <div className={`rp-step ${step === 'details' ? 'active' : step === 'otp' ? 'done' : ''}`}>
                <div className="rp-step__n">{step === 'otp' ? '✓' : '1'}</div>
                <div>
                  <div className="rp-step__h">{t.step1Hi}</div>
                  <div className="rp-step__e">{t.step1En}</div>
                </div>
              </div>
              <div className="rp-step__line" />
              <div className={`rp-step ${step === 'otp' ? 'active' : ''}`}>
                <div className="rp-step__n">2</div>
                <div>
                  <div className="rp-step__h">{t.step2Hi}</div>
                  <div className="rp-step__e">{t.step2En}</div>
                </div>
              </div>
            </div>

            {/* Role preview */}
            <div className="rp-rprev">
              <div className="rp-rprev__lbl">{t.regAs}</div>
              <div className="rp-rprev__card">
                <span style={{ fontSize: 28 }}>{ROLE_EMOJI[form.role]}</span>
                <div>
                  <div className="rp-rprev__name">{t.roles[form.role]}</div>
                  <div className="rp-rprev__desc">{t.roleDesc[form.role]}</div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="rp-trust">
              {['✅', '🔒', '📱'].map((ic, i) => (
                <div key={i} className="rp-trust__item">
                  <span>{ic}</span><span>{t.trust[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rp-aside__foot">
            <span>© 2024 AgriConnect</span><span>·</span><span>{t.secure}</span>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="rp-main">
          <div className="rp-card">

            {/* Progress bar */}
            <div className="rp-progress">
              <div className="rp-progress__fill" style={{ width: step === 'details' ? '50%' : '100%' }} />
              <span className="rp-progress__lbl">
                {t.progressLabel[step === 'details' ? 0 : 1]}
              </span>
            </div>

            <div className="rp-card__body">

              {/* Card header */}
              <div className="rp-head">
                <div className="rp-head__left">
                  <span className="rp-head__ico">{step === 'details' ? '📝' : '📱'}</span>
                  <div>
                    <h2>{step === 'details' ? t.cardTitle1 : t.cardTitle2}</h2>
                    <p>{step === 'details' ? t.cardSub1 : `${t.cardSub2} ${form.phone}`}</p>
                  </div>
                </div>
                {/* Step dots */}
                <div className="rp-step-dots">
                  <div className={`rp-step-dot ${step === 'details' ? 'active' : 'done'}`} />
                  <div className={`rp-step-dot ${step === 'otp' ? 'active' : ''}`} />
                </div>
              </div>

              {/* Submit error */}
              {errors.submit && (
                <div className="rp-alert err">
                  <div className="rp-alert__icon"><AlertCircle size={18} /></div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>Error</div>
                    <div>{errors.submit}</div>
                  </div>
                </div>
              )}

              {/* ══ STEP 1: DETAILS ══ */}
              {step === 'details' && (
                <div className="rp-form">

                  {/* Role selector */}
                  <div>
                    <div className="rp-sec-lbl">{t.whoAreYou}</div>
                    <div className="rp-role-toggle">
                      {['farmer', 'dealer', 'customer'].map(r => (
                        <button key={r} type="button"
                          onClick={() => setForm({ ...form, role: r })}
                          className={`rp-rbtn ${form.role === r ? 'active' : ''}`}>
                          <span className="rp-rbtn__ico">{ROLE_EMOJI[r]}</span>
                          <span className="rp-rbtn__hi">{t.roles[r]}</span>
                          <span className="rp-rbtn__en">{t.roleDesc[r]}</span>
                          {form.role === r && <span className="rp-rbtn__pip" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form grid */}
                  <div className="rp-grid">
                    {/* Full Name */}
                    <F label={t.fields.name} req error={errors.name}
                       ico={<User size={17} color="#10b981" />}
                       focused={focused === 'name'}>
                      <input type="text" name="name" value={form.name}
                        onChange={handleInput}
                        onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                        placeholder={t.ph.name} />
                    </F>

                    {/* Username */}
                    <F label={t.fields.username} req error={errors.username}
                       ico={<AtSign size={17} color="#3b82f6" />}
                       focused={focused === 'username'}
                       suffix={
                         form.username.length >= 3 && unAvail !== null
                           ? unAvail
                             ? <XCircle size={18} color="#ef4444" />
                             : <CheckCircle size={18} color="#16a34a" />
                           : null
                       }
                       hint={
                         form.username.length >= 3 && unAvail !== null
                           ? <span style={{ fontSize: 12, fontWeight: 600, color: unAvail ? '#ef4444' : '#16a34a' }}>
                               {unAvail ? t.taken : t.available}
                             </span>
                           : null
                       }>
                      <input type="text" name="username" value={form.username}
                        onChange={handleInput}
                        onFocus={() => setFocused('username')} onBlur={() => setFocused(null)}
                        placeholder={t.ph.username} />
                    </F>

                    {/* Phone */}
                    <F label={t.fields.phone} req error={errors.phone}
                       ico={<Phone size={17} color="#a855f7" />}
                       focused={focused === 'phone'}>
                      <input type="tel" name="phone" value={form.phone}
                        onChange={handleInput} maxLength="10"
                        onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                        placeholder={t.ph.phone} />
                    </F>

                    {/* City */}
                    <F label={t.fields.city} req error={errors.city}
                       ico={<MapPin size={17} color="#f97316" />}
                       focused={focused === 'city'}>
                      <input type="text" name="city" value={form.city}
                        onChange={handleInput}
                        onFocus={() => setFocused('city')} onBlur={() => setFocused(null)}
                        placeholder={t.ph.city} />
                    </F>
                  </div>

                  {/* Email (optional) */}
                  <F label={t.fields.email} ico={<Mail size={17} color="#94a3b8" />}
                     focused={focused === 'email'}
                     hint={<span style={{ fontSize: 12, color: '#a09070' }}>{t.optional}</span>}>
                    <input type="email" name="email" value={form.email}
                      onChange={handleInput}
                      onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                      placeholder={t.ph.email} />
                  </F>

                  {/* Password */}
                  <F label={t.fields.password} req error={errors.password}
                     ico={<Lock size={17} color="#ef4444" />}
                     focused={focused === 'password'}
                     suffix={
                       <button type="button" className="rp-eye" onClick={() => setShowPw(s => !s)}>
                         {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                     }
                     hint={form.password ? (
                       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                         <div style={{ display: 'flex', gap: 3 }}>
                           {[...Array(5)].map((_, i) => (
                             <div key={i} style={{
                               width: 28, height: 4, borderRadius: 2,
                               background: i < ps ? SC[ps - 1] : '#e8dfc0',
                               transition: 'background .3s',
                             }} />
                           ))}
                         </div>
                         <span style={{ fontSize: 12, fontWeight: 600, color: SC[ps - 1] || '#a09070' }}>
                           {t.strength[ps - 1] || t.strength[0]}
                         </span>
                       </div>
                     ) : null}>
                    <input type={showPw ? 'text' : 'password'} name="password" value={form.password}
                      onChange={handleInput}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                      placeholder={t.ph.password} />
                  </F>

                  {/* Confirm Password */}
                  <F label={t.fields.confirm} req error={errors.confirmPassword}
                     ico={<Shield size={17} color="#6366f1" />}
                     focused={focused === 'confirm'}
                     suffix={
                       <button type="button" className="rp-eye" onClick={() => setShowCPw(s => !s)}>
                         {showCPw ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                     }
                     hint={form.confirmPassword ? (
                       <span style={{
                         fontSize: 13, fontWeight: 600,
                         color: form.password === form.confirmPassword ? '#16a34a' : '#ef4444',
                         display: 'flex', alignItems: 'center', gap: 4,
                       }}>
                         {form.password === form.confirmPassword
                           ? <><CheckCircle size={14} /> {t.pwMatch}</>
                           : <><XCircle size={14} /> {t.pwNoMatch}</>}
                       </span>
                     ) : null}>
                    <input type={showCPw ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword}
                      onChange={handleInput}
                      onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                      placeholder={t.ph.confirm} />
                  </F>

                  {/* Testing hint */}
                  {otpSent && <div className="rp-alert info">💡 {t.testHint}</div>}

                  {/* Send OTP button */}
                  <button className="rp-btn" onClick={sendOtp}
                    disabled={loading || unAvail === true}>
                    {loading
                      ? <><Loader2 size={20} className="rp-spin-lc" /> {t.sending}</>
                      : <><Phone size={18} /> {t.sendOtp} <ChevronRight size={17} className="rp-arr" /></>
                    }
                  </button>
                </div>
              )}

              {/* ══ STEP 2: OTP ══ */}
              {step === 'otp' && (
                <div className="rp-otp-wrap">
                  {/* Icon */}
                  <div className="rp-otp-icon">
                    <Shield size={40} color="#7c3aed" strokeWidth={1.5} />
                  </div>

                  <h3>{t.otpTitle}</h3>
                  <p>
                    {t.otpSent} —{' '}
                    <strong style={{ color: '#1c1a14' }}>{form.phone}</strong>
                  </p>

                  {/* Timer / Resend */}
                  <div className="rp-timer">
                    {!canResend ? (
                      <span>
                        <span className="rp-tdot" />
                        {t.expiry}: <strong>{timer}s</strong>
                      </span>
                    ) : (
                      <button className="rp-resend" onClick={resendOtp} disabled={loading}>
                        <RotateCcw size={14} style={{ marginRight: 5 }} />
                        {t.resend}
                      </button>
                    )}
                  </div>

                  {/* OTP boxes */}
                  <div className="rp-otp-inputs">
                    {otp.map((v, i) => (
                      <input key={i} ref={el => otpRefs.current[i] = el}
                        type="tel" maxLength="1" value={v}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        className={`rp-otp-i ${v ? 'filled' : ''} ${errors.otp ? 'err' : ''}`} />
                    ))}
                  </div>

                  {errors.otp && (
                    <div className="rp-alert err" style={{ width: '100%' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      {errors.otp}
                    </div>
                  )}

                  {/* Testing hint */}
                  <div className="rp-otp-hint">{t.otpHint}</div>

                  {/* Verify button */}
                  <button className="rp-btn" style={{ width: '100%' }}
                    onClick={() => verifyOtp(otp.join(''))}
                    disabled={loading || !otp.every(v => v !== '')}>
                    {loading
                      ? <><Loader2 size={20} className="rp-spin-lc" /> {t.verifying}</>
                      : <><BadgeCheck size={20} /> {t.verify}</>
                    }
                  </button>

                  <button type="button" className="rp-back-step"
                    onClick={() => { setStep('details'); setOtp(['', '', '', '', '', '']); setErrors({}); }}>
                    {t.editDetails}
                  </button>
                </div>
              )}

              {/* Login link */}
              <div className="rp-login-link">
                <span>{t.alreadyAcc}</span>
                <Link to="/login">
                  {t.signIn} <ChevronRight size={14} strokeWidth={2.5} />
                </Link>
              </div>
            </div>

            {/* Card footer */}
            <div className="rp-card__foot">
              <Link to="/" className="rp-back">
                <ArrowLeft size={15} strokeWidth={2} /> {t.backHome}
              </Link>
              <span style={{ fontSize: 12, color: 'rgba(139,122,85,.4)' }}>© 2024 AgriConnect</span>
            </div>
          </div>
        </main>
      </div>

      <style>{CSS}</style>
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

/* ── ROOT & BACKGROUND ── */
.rp-root{min-height:100vh;display:flex;align-items:stretch;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;color:#1c1a14;position:relative;overflow:hidden;}
.rp-grain{position:fixed;inset:0;pointer-events:none;z-index:100;opacity:.35;mix-blend-mode:multiply;}
.rp-bg{position:fixed;inset:0;z-index:0;background:linear-gradient(180deg,#fdf8ed 0%,#f5f0df 60%,#ede8d0 100%);}
.rp-bg__sky{position:absolute;inset:0;background:radial-gradient(ellipse 90% 40% at 60% 0%,rgba(255,220,80,.16) 0%,transparent 55%),radial-gradient(ellipse 60% 45% at 5% 100%,rgba(139,195,74,.12) 0%,transparent 55%);}
.rp-bg__field{position:absolute;bottom:0;left:0;right:0;height:30%;background:linear-gradient(180deg,transparent 0%,rgba(139,195,74,.07) 100%);border-radius:60% 60% 0 0/30% 30% 0 0;}
.rp-bg__sun{position:absolute;width:280px;height:280px;top:-80px;right:20%;background:radial-gradient(circle,rgba(255,215,0,.1) 0%,transparent 70%);border-radius:50%;animation:sunG 8s ease-in-out infinite;}
@keyframes sunG{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
.rp-bg__dots{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(139,100,20,.05) 1px,transparent 1px);background-size:40px 40px;}

/* ── DECORATIONS ── */
.rp-deco{position:fixed;pointer-events:none;z-index:2;font-size:26px;opacity:.18;user-select:none;}
.d1{top:6%;left:3%;animation:df1 12s ease-in-out infinite;}
.d2{top:10%;right:4%;font-size:32px;animation:df2 10s ease-in-out infinite;}
.d3{bottom:10%;right:5%;animation:df1 14s ease-in-out infinite reverse;}
@keyframes df1{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-18px) rotate(5deg)}}
@keyframes df2{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-14px) scale(1.1)}}

/* ── LANGUAGE SWITCHER ── */
.rp-lang-wrap{position:fixed;top:16px;right:20px;z-index:300;}
.rp-lang-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:20px;background:rgba(255,252,245,.95);backdrop-filter:blur(12px);border:1.5px solid #e8dfc0;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;font-size:13px;font-weight:600;color:#3d3010;cursor:pointer;transition:all .2s;box-shadow:0 2px 10px rgba(100,70,10,.1);}
.rp-lang-btn:hover{border-color:#c8b878;}
.rp-lang-lbl{display:none;}
@media(min-width:480px){.rp-lang-lbl{display:inline;}}
.rp-lang-caret{font-size:11px;transition:transform .2s;display:inline-block;margin-left:2px;}
.rp-lang-caret.open{transform:rotate(180deg);}
.rp-lang-dd{position:absolute;top:calc(100% + 8px);right:0;background:rgba(255,252,245,.98);backdrop-filter:blur(16px);border:1.5px solid #e8dfc0;border-radius:14px;padding:6px;min-width:140px;box-shadow:0 8px 24px rgba(100,70,10,.14);animation:ddIn .18s ease both;}
@keyframes ddIn{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:none}}
.rp-lang-opt{display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;border-radius:9px;border:none;background:transparent;cursor:pointer;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;font-size:14px;font-weight:500;color:#3d3010;transition:background .15s;}
.rp-lang-opt:hover{background:#f5edd8;}
.rp-lang-opt.active{background:#f0fce8;font-weight:700;color:#1a4a08;}
.rp-lang-tick{margin-left:auto;color:#2d6a0a;font-size:13px;font-weight:800;}

/* ── LAYOUT ── */
.rp-layout{position:relative;z-index:10;display:flex;width:100%;min-height:100vh;}

/* ── ASIDE ── */
.rp-aside{display:none;flex-direction:column;justify-content:space-between;width:400px;min-width:360px;min-height:100vh;padding:48px 42px;background:linear-gradient(160deg,#1a4a08 0%,#22600a 45%,#1e5508 100%);position:relative;overflow:hidden;}
.rp-aside::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 40% at 50% 100%,rgba(255,220,50,.1) 0%,transparent 55%);pointer-events:none;}
.rp-aside::after{content:'';position:absolute;top:0;right:0;width:1px;height:100%;background:linear-gradient(to bottom,transparent,rgba(255,220,80,.18),transparent);}
@media(min-width:1024px){.rp-aside{display:flex;}}
.rp-aside__inner{flex:1;display:flex;flex-direction:column;gap:32px;}

/* Brand */
.rp-brand{display:flex;align-items:center;gap:14px;animation:sIn .8s ease both;}
.rp-brand__icon-wrap{position:relative;width:56px;height:56px;}
.rp-brand__ico{width:56px;height:56px;background:linear-gradient(135deg,rgba(255,255,255,.15),rgba(255,255,255,.05));border:1px solid rgba(255,220,80,.2);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:28px;line-height:1;}
.rp-brand__zap{position:absolute;bottom:-5px;right:-5px;width:22px;height:22px;background:linear-gradient(135deg,#f6a234,#ffd700);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(246,162,52,.5);}
.rp-brand__name{font-size:22px;font-weight:800;color:#fef9e7;}
.rp-brand__tag{font-size:12px;color:rgba(255,240,180,.55);margin-top:2px;}

/* Guide */
.rp-guide{animation:sIn .8s ease .1s both;}
.rp-guide__leaf{font-size:32px;margin-bottom:8px;display:inline-block;animation:sunG 3s ease-in-out infinite;}
.rp-guide h2{font-size:34px;font-weight:800;color:#fef9e7;letter-spacing:-.5px;}
.rp-guide p{font-size:14px;color:rgba(255,240,180,.6);margin-top:8px;line-height:1.6;}

/* Steps */
.rp-steps{display:flex;flex-direction:column;gap:0;animation:sIn .8s ease .2s both;}
.rp-step{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:12px;transition:background .3s;}
.rp-step.active{background:rgba(255,255,255,.08);}
.rp-step__n{width:32px;height:32px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;border:2px solid rgba(255,255,255,.2);color:rgba(255,240,180,.5);transition:all .3s;}
.rp-step.active .rp-step__n{background:#ffd700;border-color:#ffd700;color:#1a4a08;box-shadow:0 4px 14px rgba(255,215,0,.4);}
.rp-step.done .rp-step__n{background:rgba(255,215,0,.25);border-color:rgba(255,215,0,.5);color:#ffd700;}
.rp-step__h{font-size:14px;font-weight:700;color:rgba(255,240,180,.85);}
.rp-step__e{font-size:11px;color:rgba(255,240,180,.4);margin-top:2px;}
.rp-step__line{width:2px;height:16px;margin-left:28px;background:rgba(255,220,80,.15);}

/* Role preview */
.rp-rprev{animation:sIn .8s ease .3s both;}
.rp-rprev__lbl{font-size:11px;color:rgba(255,240,180,.4);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;}
.rp-rprev__card{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;background:rgba(0,0,0,.15);border:1px solid rgba(255,220,80,.15);}
.rp-rprev__name{font-size:15px;font-weight:700;color:rgba(255,240,180,.9);}
.rp-rprev__desc{font-size:11px;color:rgba(255,240,180,.4);}

/* Trust */
.rp-trust{display:flex;flex-direction:column;gap:10px;animation:sIn .8s ease .4s both;}
.rp-trust__item{display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(255,240,180,.65);font-weight:500;}
.rp-trust__item span:first-child{font-size:16px;}

.rp-aside__foot{display:flex;gap:8px;font-size:12px;color:rgba(255,240,180,.25);}
@keyframes sIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}

/* ── MAIN ── */
.rp-main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:72px 20px 36px;gap:20px;}

/* ── CARD ── */
.rp-card{width:100%;max-width:500px;background:rgba(255,252,245,.96);backdrop-filter:blur(20px);border-radius:28px;border:2px solid rgba(255,220,80,.2);box-shadow:0 2px 0 rgba(255,255,255,.9) inset,0 20px 50px rgba(100,70,10,.12),0 4px 16px rgba(0,0,0,.05);overflow:hidden;animation:cIn .8s cubic-bezier(.22,1,.36,1) both;}
@keyframes cIn{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}

/* Progress */
.rp-progress{position:relative;height:36px;background:#f5edd8;border-bottom:1px solid #e8dfc0;display:flex;align-items:center;}
.rp-progress__fill{position:absolute;top:0;left:0;height:100%;background:linear-gradient(90deg,#2d6a0a,#5a9e1a,#ffd700);transition:width .7s cubic-bezier(.22,1,.36,1);opacity:.22;}
.rp-progress__lbl{position:relative;z-index:1;font-size:12px;font-weight:700;color:#6b5c35;padding:0 16px;}

/* Card body */
.rp-card__body{padding:26px 30px 24px;display:flex;flex-direction:column;gap:18px;}
.rp-card__foot{padding:14px 30px 20px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(200,184,120,.15);}

/* Card header */
.rp-head{display:flex;align-items:center;justify-content:space-between;}
.rp-head__left{display:flex;align-items:center;gap:14px;}
.rp-head__ico{font-size:36px;flex-shrink:0;}
.rp-head h2{font-size:20px;font-weight:800;color:#1c1a14;line-height:1.2;}
.rp-head p{font-size:13px;color:#8a7a55;margin-top:3px;}
.rp-step-dots{display:flex;gap:6px;}
.rp-step-dot{width:8px;height:8px;border-radius:50%;background:#e8dfc0;transition:all .3s;}
.rp-step-dot.active{background:#5a9e1a;box-shadow:0 0 0 3px rgba(90,158,26,.2);}
.rp-step-dot.done{background:#ffd700;}

/* Alerts */
.rp-alert{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:12px;font-size:13.5px;font-weight:500;animation:aIn .3s ease both;}
@keyframes aIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
.rp-alert.err{background:#fff1f0;border:2px solid #ffb3ae;color:#9b1c1c;}
.rp-alert.info{background:#fffbeb;border:2px solid #fde68a;color:#78350f;font-size:12.5px;}
.rp-alert__icon{flex-shrink:0;}

/* Section label */
.rp-sec-lbl{font-size:12px;font-weight:700;color:#6b5c35;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}

/* Form */
.rp-form{display:flex;flex-direction:column;gap:14px;}

/* Role toggle */
.rp-role-toggle{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
@media(min-width:600px){.rp-role-toggle{grid-template-columns:repeat(3,1fr);}}
.rp-rbtn{position:relative;display:flex;flex-direction:column;align-items:center;gap:5px;padding:14px 10px;border-radius:16px;border:2px solid #e8dfc0;background:white;cursor:pointer;transition:all .25s;outline:none;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;}
.rp-rbtn:hover:not(.active){border-color:#c8b878;transform:translateY(-2px);box-shadow:0 6px 14px rgba(100,70,10,.1);}
.rp-rbtn.active{border-color:#5a9e1a;background:#f0fce8;transform:translateY(-2px);box-shadow:0 8px 20px rgba(90,158,26,.2);}
.rp-rbtn__ico{font-size:26px;}
.rp-rbtn__hi{font-size:13px;font-weight:700;color:#1c1a14;}
.rp-rbtn__en{font-size:10px;color:#8a7a55;text-align:center;}
.rp-rbtn__pip{position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);width:24px;height:3px;border-radius:2px 2px 0 0;background:#2d6a0a;animation:pipIn .2s ease both;}
@keyframes pipIn{from{width:0;opacity:0}to{width:24px;opacity:1}}

/* Grid */
.rp-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(max-width:520px){.rp-grid{grid-template-columns:1fr;}}

/* Field */
.rp-field{display:flex;flex-direction:column;gap:5px;}
.rp-field label{font-size:14px;font-weight:700;color:#3d3010;}
.rp-req{color:#dc2626;}
.rp-fi{position:relative;display:flex;align-items:center;}
.rp-fi__ico{position:absolute;left:13px;display:flex;align-items:center;pointer-events:none;z-index:1;transition:transform .2s;}
.rp-field.focused .rp-fi__ico{transform:scale(1.12);}
.rp-field input{width:100%;padding:13px 13px 13px 42px;background:white;border:2px solid #e8dfc0;border-radius:13px;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;font-size:14px;color:#1c1a14;outline:none;transition:all .25s;-webkit-appearance:none;}
.rp-field input::placeholder{color:#c4b898;}
.rp-field input:hover{border-color:#c8b878;}
.rp-field.focused input{border-color:#5a9e1a;background:#f8fff4;box-shadow:0 0 0 3px rgba(90,158,26,.1);}
.rp-field.has-err input{border-color:#fca5a5;background:#fff5f5;}
.rp-fi__sfx{position:absolute;right:12px;display:flex;align-items:center;}
.rp-ferr{font-size:12px;font-weight:600;color:#dc2626;margin-top:4px;display:flex;align-items:center;gap:4px;}
.rp-fhint{margin-top:5px;}
.rp-eye{background:none;border:none;cursor:pointer;color:#a09070;display:flex;align-items:center;padding:4px;border-radius:6px;transition:all .2s;}
.rp-eye:hover{color:#3d3010;background:rgba(0,0,0,.05);}

/* Submit button */
.rp-btn{width:100%;padding:15px 20px;border:none;border-radius:16px;cursor:pointer;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;font-size:16px;font-weight:700;color:white;background:linear-gradient(135deg,#1a4a08 0%,#2d8a0a 50%,#5a9e1a 100%);display:flex;align-items:center;justify-content:center;gap:10px;transition:all .3s;outline:none;margin-top:4px;box-shadow:0 6px 20px rgba(45,106,10,.28),0 2px 0 rgba(255,255,255,.12) inset;position:relative;overflow:hidden;}
.rp-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.1),transparent);pointer-events:none;}
.rp-btn:hover:not(:disabled){transform:translateY(-3px);box-shadow:0 12px 28px rgba(45,106,10,.35);filter:brightness(1.06);}
.rp-btn:active:not(:disabled){transform:translateY(-1px);}
.rp-btn:disabled{opacity:.55;cursor:not-allowed;}
.rp-arr{transition:transform .25s;}
.rp-btn:hover .rp-arr{transform:translateX(4px);}
.rp-spin-lc{animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── OTP STEP ── */
.rp-otp-wrap{display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;animation:cIn .5s ease both;}
.rp-otp-icon{width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg,#ede9fe,#ddd6fe);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(124,58,237,.15);}
.rp-otp-wrap h3{font-size:20px;font-weight:800;color:#1c1a14;}
.rp-otp-wrap>p{font-size:14px;color:#3d3010;}

.rp-timer{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:14px;color:#8a7a55;padding:9px 18px;border-radius:20px;background:#f5edd8;border:1.5px solid #e8dfc0;font-weight:600;}
.rp-timer strong{color:#dc2626;}
.rp-tdot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#dc2626;animation:live 1.5s ease infinite;vertical-align:middle;margin-right:4px;}
@keyframes live{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.4)}70%{box-shadow:0 0 0 6px rgba(220,38,38,0)}}
.rp-resend{background:none;border:none;cursor:pointer;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;font-size:14px;font-weight:700;color:#2d6a0a;padding:0;transition:color .2s;display:flex;align-items:center;}
.rp-resend:hover{color:#1a4a08;}

.rp-otp-inputs{display:flex;gap:10px;justify-content:center;}
.rp-otp-i{width:52px;height:62px;text-align:center;font-family:'Baloo 2',sans-serif;font-size:26px;font-weight:800;border-radius:14px;border:2px solid #e8dfc0;background:white;color:#1c1a14;outline:none;transition:all .2s;box-shadow:0 2px 6px rgba(100,70,10,.06);}
.rp-otp-i:focus{border-color:#5a9e1a;background:#f0fce8;box-shadow:0 0 0 3px rgba(90,158,26,.15);transform:translateY(-2px);}
.rp-otp-i.filled{border-color:#86d63a;background:#f0fce8;color:#1a4a08;box-shadow:0 4px 12px rgba(134,214,58,.2);}
.rp-otp-i.err{border-color:#fca5a5!important;background:#fff5f5!important;}

.rp-otp-hint{font-size:12px;color:#a09070;background:#f5edd8;border:1px solid #e8dfc0;padding:8px 14px;border-radius:8px;width:100%;font-weight:500;text-align:left;}
.rp-back-step{background:none;border:none;cursor:pointer;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;font-size:13px;font-weight:700;color:#8a7a55;padding:0;transition:color .2s;}
.rp-back-step:hover{color:#3d3010;}

/* Login link + footer */
.rp-login-link{display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;color:#8a7a55;padding-top:4px;border-top:1.5px solid #f0e8cc;margin-top:4px;font-weight:500;}
.rp-login-link a{display:flex;align-items:center;gap:3px;font-weight:700;color:#2d6a0a;text-decoration:none;transition:all .2s;}
.rp-login-link a:hover{color:#1a4a08;text-decoration:underline;text-underline-offset:3px;}
.rp-back{display:flex;align-items:center;gap:6px;font-size:13px;color:#8a7a55;text-decoration:none;padding:6px 10px;border-radius:10px;font-weight:600;transition:all .2s;}
.rp-back:hover{color:#3d3010;background:rgba(100,70,10,.06);}

/* ── SUCCESS SCREEN ── */
.rp-success-wrap{position:relative;z-index:10;padding:24px;width:100%;display:flex;justify-content:center;align-items:center;min-height:100vh;}
.rp-success-card{width:100%;max-width:440px;background:rgba(255,252,245,.96);backdrop-filter:blur(20px);border-radius:28px;border:2px solid rgba(255,220,80,.2);box-shadow:0 20px 50px rgba(100,70,10,.12);overflow:hidden;animation:cIn .8s cubic-bezier(.22,1,.36,1) both;}
.rp-stripe{height:5px;background:linear-gradient(90deg,#1a4a08,#5a9e1a,#ffd700,#5a9e1a,#1a4a08);background-size:200%;animation:sBar 3s ease infinite;}
@keyframes sBar{0%,100%{background-position:0%}50%{background-position:100%}}
.rp-success-body{padding:40px 34px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px;}
.rp-sico-wrap{position:relative;}
.rp-sico{position:relative;display:flex;align-items:center;justify-content:center;}
.rp-sico-inner{width:80px;height:80px;background:linear-gradient(135deg,#2d6a0a,#5a9e1a);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(45,106,10,.35);}
.rp-sring{position:absolute;inset:-8px;border-radius:50%;border:3px solid rgba(90,158,26,.3);animation:ring 2s ease infinite;}
@keyframes ring{0%{transform:scale(1);opacity:1}100%{transform:scale(1.4);opacity:0}}
.rp-success-body h2{font-size:28px;font-weight:800;color:#1c1a14;}
.shi{font-size:15px;font-weight:600;color:#2d6a0a;}
.sen{font-size:13px;color:#8a7a55;}
.rp-sdetails{width:100%;background:#f5edd8;border:1.5px solid #e8dfc0;border-radius:16px;padding:16px 18px;display:flex;flex-direction:column;gap:10px;}
.rp-srow{display:flex;justify-content:space-between;font-size:13px;}
.rp-srow span{color:#8a7a55;font-weight:600;}
.rp-srow strong{color:#1c1a14;font-weight:700;}
.redir{font-size:12px;color:#a09070;}
.rp-sbtn{display:flex;align-items:center;gap:8px;width:100%;padding:15px;background:linear-gradient(135deg,#1a4a08,#2d8a0a);border:none;border-radius:16px;color:white;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;font-size:16px;font-weight:700;cursor:pointer;justify-content:center;transition:all .3s;box-shadow:0 8px 20px rgba(45,106,10,.3);}
.rp-sbtn:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(45,106,10,.4);}

/* ── RESPONSIVE ── */
@media(max-width:480px){
  .rp-main{padding-top:72px;}
  .rp-card__body{padding:20px 18px 22px;}
  .rp-otp-i{width:43px;height:52px;font-size:20px;}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important;}}
`;