// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Eye, EyeOff, LogIn, ArrowLeft, ChevronRight, Globe,
  TrendingUp, Users, ShieldCheck, Zap,
} from 'lucide-react';

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const LANG = {
  en: {
    brandTag: "Farmer's Partner",
    welcomeTitle: "Hello,", welcomeSub: "Farmers!",
    welcomeP1: "Get the right price for your crop.",
    welcomeP2: "Connect directly with buyers.",
    statFarmers: "Farmers", statDealers: "Dealers", statDistricts: "Districts",
    b1: "Live Market Prices", b2: "Safe & Secure", b3: "Direct Contact with Buyers",
    secure: "Secure",
    formTitle: "Welcome Back!", formSub: "Please sign in to continue.",
    whoAreYou: "Select Your Role", signingAs: "Signing in as",
    roles: { farmer: "Farmer", dealer: "Dealer", customer: "Customer", admin: "Admin" },
    userLabel: "Username", userPH: "Enter your username",
    passLabel: "Password", passPH: "Enter your password",
    forgot: "Forgot Password?", loginBtn: "Sign In",
    loggingIn: "Signing in…", loginOk: "Login successful! Redirecting…",
    newHere: "New here?", register: "Register",
    backHome: "Back to home",
    errWrong: "Wrong username or password.",
    errConn: "Connection error. Please try again.",
    roleDesc: {
      farmer: "Agricultural Producer",
      dealer: "Crop Buyer & Seller",
      customer: "End Consumer",
      admin: "System Administrator",
    },
    loginAs: "Sign in as",
  },
  mr: {
    brandTag: "शेतकऱ्याचा साथी",
    welcomeTitle: "नमस्कार,", welcomeSub: "शेतकरी बंधुंनो!",
    welcomeP1: "तुमच्या पिकाची योग्य किंमत मिळवा.",
    welcomeP2: "थेट व्यापाऱ्याशी जोडा.",
    statFarmers: "शेतकरी", statDealers: "व्यापारी", statDistricts: "जिल्हे",
    b1: "बाजारभाव पाहा", b2: "सुरक्षित व्यासपीठ", b3: "थेट संपर्क",
    secure: "सुरक्षित",
    formTitle: "परत आल्याबद्दल स्वागत!", formSub: "साइन इन करा.",
    whoAreYou: "तुमची भूमिका निवडा", signingAs: "म्हणून लॉगिन",
    roles: { farmer: "शेतकरी", dealer: "व्यापारी", customer: "ग्राहक", admin: "ॲडमिन" },
    userLabel: "युजरनेम", userPH: "तुमचे युजरनेम टाका",
    passLabel: "पासवर्ड", passPH: "पासवर्ड टाका",
    forgot: "विसरलात?", loginBtn: "लॉगिन करा",
    loggingIn: "लॉगिन होत आहे…", loginOk: "लॉगिन यशस्वी! पुनर्निर्देशित करत आहे…",
    newHere: "नवीन आहात?", register: "नोंदणी करा",
    backHome: "मुख्य पृष्ठ",
    errWrong: "चुकीचे युजरनेम किंवा पासवर्ड.",
    errConn: "कनेक्शन समस्या. पुन्हा प्रयत्न करा.",
    roleDesc: {
      farmer: "शेती उत्पादक",
      dealer: "पीक खरेदी-विक्री",
      customer: "अंतिम ग्राहक",
      admin: "सिस्टम ॲडमिन",
    },
    loginAs: "म्हणून लॉगिन करा",
  },
  hi: {
    brandTag: "किसान का साथी",
    welcomeTitle: "नमस्ते,", welcomeSub: "किसान भाइयों!",
    welcomeP1: "अपनी फसल का सही दाम पाएं।",
    welcomeP2: "सीधे व्यापारी से जुड़ें।",
    statFarmers: "किसान", statDealers: "व्यापारी", statDistricts: "जिले",
    b1: "बाज़ार भाव देखें", b2: "सुरक्षित मंच", b3: "सीधा संपर्क",
    secure: "सुरक्षित",
    formTitle: "वापस आने पर स्वागत!", formSub: "साइन इन करने के लिए आगे बढ़ें।",
    whoAreYou: "अपनी भूमिका चुनें", signingAs: "के रूप में लॉगिन",
    roles: { farmer: "किसान", dealer: "व्यापारी", customer: "ग्राहक", admin: "एडमिन" },
    userLabel: "यूज़रनेम", userPH: "अपना यूज़रनेम डालें",
    passLabel: "पासवर्ड", passPH: "पासवर्ड डालें",
    forgot: "भूल गए?", loginBtn: "लॉगिन करें",
    loggingIn: "लॉगिन हो रहा है…", loginOk: "लॉगिन सफल! पुनर्निर्देशित हो रहा है…",
    newHere: "नया खाता नहीं है?", register: "रजिस्टर करें",
    backHome: "होम पेज",
    errWrong: "गलत यूज़रनेम या पासवर्ड।",
    errConn: "कनेक्शन में समस्या। पुनः प्रयास करें।",
    roleDesc: {
      farmer: "कृषि उत्पादक",
      dealer: "फसल खरीद-बिक्री",
      customer: "अंतिम उपभोक्ता",
      admin: "सिस्टम एडमिन",
    },
    loginAs: "के रूप में साइन इन करें",
  },
};

const LANG_OPTS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'mr', label: 'मराठी', flag: '🧡' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
];

// ─── ROLE CONFIG ─────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  farmer:   { bg:'#f0fce8', border:'#86d63a', accent:'#2d6a0a', light:'#dcfce7', emoji:'🌾', gradient:'135deg, #2d6a0a 0%, #86d63a 100%' },
  dealer:   { bg:'#fff8ed', border:'#f6a234', accent:'#b45309', light:'#fef3c7', emoji:'🏪', gradient:'135deg, #b45309 0%, #f6a234 100%' },
  customer: { bg:'#eff6ff', border:'#6095e8', accent:'#1e40af', light:'#dbeafe', emoji:'🛒', gradient:'135deg, #1e40af 0%, #6095e8 100%' },
  admin:    { bg:'#f5f3ff', border:'#a78bfa', accent:'#7c3aed', light:'#ede9fe', emoji:'⚙️', gradient:'135deg, #7c3aed 0%, #a78bfa 100%' },
};

const ROLES = ['farmer', 'dealer', 'customer', 'admin'];

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [lang, setLang] = useState('en');
  const [langOpen, setLangOpen] = useState(false);
  const t = LANG[lang];

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('farmer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState(null);
  const rc = ROLE_CONFIG[role];

  useEffect(() => { setForm({ username: '', password: '' }); setError(''); }, [role]);
  useEffect(() => { setError(''); }, [lang]);

  useEffect(() => {
    const handler = (e) => { if (!e.target.closest('.lp-lang-wrap')) setLangOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const r = await login(form.username, form.password, role);
      if (r.success) {
        setSuccess(true);
        setTimeout(() => navigate(`/${role}/dashboard`), 1200);
      } else {
        setError(r.message || t.errWrong);
      }
    } catch {
      setError(t.errConn);
    } finally {
      setLoading(false);
    }
  };

  const currentLangOpt = LANG_OPTS.find(l => l.code === lang);

  return (
    <div className="lp-root">
      <canvas ref={canvasRef} className="lp-grain" />

      <div className="lp-bg">
        <div className="lp-bg__sky" />
        <div className="lp-bg__field" />
        <div className="lp-bg__sun" />
        <div className="lp-bg__dots" />
      </div>

      <div className="lp-deco d1">🌾</div>
      <div className="lp-deco d2">☀️</div>
      <div className="lp-deco d3">🌱</div>
      <div className="lp-deco d4">🍃</div>

      {/* Language Switcher */}
      <div className="lp-lang-wrap">
        <button className="lp-lang-btn" onClick={() => setLangOpen(o => !o)}>
          <Globe size={14} strokeWidth={2.5} />
          <span>{currentLangOpt.flag}</span>
          <span className="lp-lang-label">{currentLangOpt.label}</span>
          <span className={`lp-lang-caret ${langOpen ? 'open' : ''}`}>▾</span>
        </button>
        {langOpen && (
          <div className="lp-lang-dd">
            {LANG_OPTS.map(opt => (
              <button key={opt.code}
                className={`lp-lang-opt ${lang === opt.code ? 'active' : ''}`}
                onClick={() => { setLang(opt.code); setLangOpen(false); }}>
                <span>{opt.flag}</span>
                <span>{opt.label}</span>
                {lang === opt.code && <span className="lp-lang-tick">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="lp-layout">
        {/* LEFT PANEL */}
        <aside className="lp-aside">
          <div className="lp-aside__inner">
            <div className="lp-brand">
              <div className="lp-brand__icon-wrap">
                <div className="lp-brand__icon">🌾</div>
                <div className="lp-brand__zap"><Zap size={14} color="white" /></div>
              </div>
              <div>
                <div className="lp-brand__name">AgriConnect</div>
                <div className="lp-brand__tag">{t.brandTag}</div>
              </div>
            </div>

            <div className="lp-welcome">
              <div className="lp-sun-icon">☀️</div>
              <h1>{t.welcomeTitle}<br /><span>{t.welcomeSub}</span></h1>
              <p>{t.welcomeP1}<br />{t.welcomeP2}</p>
            </div>

            <div className="lp-features">
              <div className="lp-feature">
                <div className="lp-feature__icon" style={{background:'rgba(134,214,58,.2)'}}>
                  <TrendingUp size={20} color="#86d63a" />
                </div>
                <div>
                  <div className="lp-feature__title">Market Analytics</div>
                  <div className="lp-feature__sub">{t.b1}</div>
                </div>
              </div>
              <div className="lp-feature">
                <div className="lp-feature__icon" style={{background:'rgba(96,149,232,.2)'}}>
                  <Users size={20} color="#6095e8" />
                </div>
                <div>
                  <div className="lp-feature__title">Connected Community</div>
                  <div className="lp-feature__sub">{t.b3}</div>
                </div>
              </div>
              <div className="lp-feature">
                <div className="lp-feature__icon" style={{background:'rgba(167,139,250,.2)'}}>
                  <ShieldCheck size={20} color="#a78bfa" />
                </div>
                <div>
                  <div className="lp-feature__title">Secure Platform</div>
                  <div className="lp-feature__sub">{t.b2}</div>
                </div>
              </div>
            </div>

            <div className="lp-stats">
              {[
                ['10,000+', t.statFarmers, '#86d63a'],
                ['500+', t.statDealers, '#6095e8'],
                ['50+', t.statDistricts, '#a78bfa'],
              ].map(([n, l, c]) => (
                <div key={l} className="lp-stat">
                  <div className="lp-stat__n" style={{color: c}}>{n}</div>
                  <div className="lp-stat__l">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-aside__foot">
            <span>© 2024 AgriConnect</span><span>·</span><span>{t.secure}</span>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className="lp-main">
          <div className="lp-card">
            <div className="lp-stripe" style={{ background: `linear-gradient(90deg, ${rc.accent}, ${rc.border}, ${rc.accent})` }} />

            <div className="lp-card__body">
              {/* Header */}
              <div className="lp-head">
                <div className="lp-head__left">
                  <span className="lp-head__ico">👋</span>
                  <div>
                    <h2>{t.formTitle}</h2>
                    <p>{t.formSub}</p>
                  </div>
                </div>
                <div className="lp-live">
                  <div className="lp-live__dot" />
                  <span>Live</span>
                </div>
              </div>

              {/* Role selector */}
              <div className="lp-sec-lbl">{t.whoAreYou} <span className="lp-req">*</span></div>
              <div className="lp-roles">
                {ROLES.map(r => (
                  <button key={r} type="button"
                    onClick={() => setRole(r)}
                    className={`lp-role ${role === r ? 'active' : ''}`}
                    style={role === r ? {
                      background: ROLE_CONFIG[r].bg,
                      borderColor: ROLE_CONFIG[r].border,
                      boxShadow: `0 4px 16px ${ROLE_CONFIG[r].border}55`,
                      transform: 'translateY(-3px) scale(1.04)',
                    } : {}}>
                    <span className="lp-role__ico">{ROLE_CONFIG[r].emoji}</span>
                    <span className="lp-role__lbl">{t.roles[r]}</span>
                    {role === r && (
                      <span className="lp-role__chk" style={{ background: ROLE_CONFIG[r].accent }}>✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Role info */}
              <div className="lp-role-info" style={{ background: rc.light, border: `1.5px solid ${rc.border}`, color: rc.accent }}>
                <div className="lp-role-info__icon" style={{ background: `linear-gradient(${rc.gradient})` }}>
                  <span style={{fontSize:18}}>{rc.emoji}</span>
                </div>
                <div>
                  <div className="lp-role-info__title">{t.roles[role]} — {t.signingAs}</div>
                  <div className="lp-role-info__sub">{t.roleDesc[role]}</div>
                </div>
              </div>

              {/* Alerts */}
              {error && <div className="lp-alert err">⚠️ {error}</div>}
              {success && <div className="lp-alert ok">✅ {t.loginOk}</div>}

              {/* Form */}
              <form onSubmit={handleSubmit} className="lp-form">
                <div className={`lp-field ${focused === 'u' ? 'focused' : ''}`}
                     style={{ '--bd': rc.border, '--lt': rc.light }}>
                  <label>{t.userLabel}</label>
                  <div className="lp-fi">
                    <span className="lp-fi__ico">👤</span>
                    <input type="text" value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      onFocus={() => setFocused('u')} onBlur={() => setFocused(null)}
                      placeholder={t.userPH} required />
                  </div>
                </div>

                <div className={`lp-field ${focused === 'p' ? 'focused' : ''}`}
                     style={{ '--bd': rc.border, '--lt': rc.light }}>
                  <div className="lp-ftop">
                    <label>{t.passLabel}</label>
                    <Link to="/forgot-password" className="lp-forgot" style={{color: rc.accent}}>{t.forgot}</Link>
                  </div>
                  <div className="lp-fi">
                    <span className="lp-fi__ico">🔒</span>
                    <input type={showPw ? 'text' : 'password'} value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocused('p')} onBlur={() => setFocused(null)}
                      placeholder={t.passPH} required />
                    <button type="button" className="lp-eye" onClick={() => setShowPw(s => !s)}>
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading || success} className="lp-btn"
                  style={{ background: `linear-gradient(${rc.gradient})` }}>
                  {loading
                    ? <><span className="lp-spin" /> {t.loggingIn}</>
                    : success
                    ? <>✅ {t.loginOk}</>
                    : <><LogIn size={20} strokeWidth={2} /> {t.loginAs} {t.roles[role]} <ChevronRight size={18} className="lp-arr" /></>
                  }
                </button>
              </form>

              {/* Register link */}
              {['farmer', 'dealer', 'customer'].includes(role) && (
                <div className="lp-reg">
                  <span>{t.newHere}</span>
                  <Link to="/register" style={{ color: rc.accent }}>
                    {t.register} <ChevronRight size={14} strokeWidth={2.5} />
                  </Link>
                </div>
              )}
            </div>

            <div className="lp-card__foot">
              <Link to="/" className="lp-back">
                <ArrowLeft size={15} strokeWidth={2} /> {t.backHome}
              </Link>
              <span>© 2024 AgriConnect</span>
            </div>
          </div>
        </main>
      </div>

      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.lp-root{min-height:100vh;display:flex;align-items:stretch;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;color:#1c1a14;position:relative;overflow:hidden;}
.lp-grain{position:fixed;inset:0;pointer-events:none;z-index:100;opacity:.35;mix-blend-mode:multiply;}
.lp-bg{position:fixed;inset:0;z-index:0;background:linear-gradient(180deg,#fdf8ed 0%,#f5f0df 60%,#ede8d0 100%);}
.lp-bg__sky{position:absolute;inset:0;background:radial-gradient(ellipse 100% 40% at 70% 0%,rgba(255,220,80,.18) 0%,transparent 55%),radial-gradient(ellipse 70% 50% at 10% 100%,rgba(139,195,74,.15) 0%,transparent 60%);}
.lp-bg__field{position:absolute;bottom:0;left:0;right:0;height:35%;background:linear-gradient(180deg,transparent 0%,rgba(139,195,74,.08) 100%);border-radius:60% 60% 0 0/30% 30% 0 0;}
.lp-bg__sun{position:absolute;width:300px;height:300px;top:-100px;right:15%;background:radial-gradient(circle,rgba(255,215,0,.12) 0%,rgba(255,180,0,.06) 40%,transparent 70%);border-radius:50%;animation:sunG 8s ease-in-out infinite;}
.lp-bg__dots{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(139,100,20,.06) 1px,transparent 1px);background-size:40px 40px;}
@keyframes sunG{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.15);opacity:1}}
.lp-deco{position:fixed;pointer-events:none;z-index:2;font-size:28px;opacity:.2;user-select:none;}
.d1{top:8%;left:4%;animation:df1 12s ease-in-out infinite;}
.d2{top:12%;right:4%;font-size:36px;animation:df2 10s ease-in-out infinite;opacity:.14;}
.d3{bottom:15%;left:3%;animation:df3 14s ease-in-out infinite;}
.d4{bottom:8%;right:6%;animation:df1 11s ease-in-out infinite reverse;}
@keyframes df1{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-20px) rotate(5deg)}}
@keyframes df2{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-15px) scale(1.1)}}
@keyframes df3{0%,100%{transform:translateY(0) rotate(5deg)}50%{transform:translateY(-18px) rotate(-5deg)}}
.lp-lang-wrap{position:fixed;top:16px;right:20px;z-index:300;}
.lp-lang-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:20px;background:rgba(255,252,245,.95);backdrop-filter:blur(12px);border:1.5px solid #e8dfc0;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;font-size:13px;font-weight:600;color:#3d3010;cursor:pointer;transition:all .2s;box-shadow:0 2px 10px rgba(100,70,10,.1);}
.lp-lang-btn:hover{border-color:#c8b878;box-shadow:0 4px 14px rgba(100,70,10,.15);}
.lp-lang-label{display:none;}
@media(min-width:480px){.lp-lang-label{display:inline;}}
.lp-lang-caret{font-size:11px;transition:transform .2s;display:inline-block;margin-left:2px;}
.lp-lang-caret.open{transform:rotate(180deg);}
.lp-lang-dd{position:absolute;top:calc(100% + 8px);right:0;background:rgba(255,252,245,.98);backdrop-filter:blur(16px);border:1.5px solid #e8dfc0;border-radius:14px;padding:6px;min-width:140px;box-shadow:0 8px 24px rgba(100,70,10,.14);animation:ddIn .18s ease both;}
@keyframes ddIn{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:none}}
.lp-lang-opt{display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;border-radius:9px;border:none;background:transparent;cursor:pointer;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;font-size:14px;font-weight:500;color:#3d3010;transition:background .15s;}
.lp-lang-opt:hover{background:#f5edd8;}
.lp-lang-opt.active{background:#f0fce8;font-weight:700;color:#1a4a08;}
.lp-lang-tick{margin-left:auto;color:#2d6a0a;font-size:13px;font-weight:800;}
.lp-layout{position:relative;z-index:10;display:flex;width:100%;min-height:100vh;}
.lp-aside{display:none;flex-direction:column;justify-content:space-between;width:420px;min-width:380px;min-height:100vh;padding:48px 44px;background:linear-gradient(160deg,#1a4a08 0%,#22600a 45%,#1e5508 100%);position:relative;overflow:hidden;}
.lp-aside::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 40% at 50% 100%,rgba(255,220,50,.1) 0%,transparent 55%),radial-gradient(ellipse 60% 50% at 80% 0%,rgba(180,230,100,.08) 0%,transparent 55%);pointer-events:none;}
.lp-aside::after{content:'';position:absolute;top:0;right:0;width:1px;height:100%;background:linear-gradient(to bottom,transparent,rgba(255,220,80,.18),transparent);}
@media(min-width:1024px){.lp-aside{display:flex;}}
.lp-aside__inner{flex:1;display:flex;flex-direction:column;gap:36px;}
.lp-brand{display:flex;align-items:center;gap:14px;animation:sIn .8s ease both;}
.lp-brand__icon-wrap{position:relative;width:60px;height:60px;}
.lp-brand__icon{width:60px;height:60px;background:linear-gradient(135deg,rgba(255,255,255,.15),rgba(255,255,255,.05));border:1px solid rgba(255,220,80,.2);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:30px;}
.lp-brand__zap{position:absolute;bottom:-6px;right:-6px;width:24px;height:24px;background:linear-gradient(135deg,#f6a234,#ffd700);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(246,162,52,.5);}
.lp-brand__name{font-size:24px;font-weight:800;color:#fef9e7;letter-spacing:-.3px;}
.lp-brand__tag{font-size:12px;color:rgba(255,240,180,.55);margin-top:3px;}
.lp-welcome{animation:sIn .8s ease .1s both;}
.lp-sun-icon{font-size:40px;margin-bottom:10px;animation:sunG 4s ease-in-out infinite;display:inline-block;}
.lp-welcome h1{font-size:40px;font-weight:800;line-height:1.1;color:#fef9e7;letter-spacing:-.5px;margin-bottom:14px;}
.lp-welcome h1 span{color:#ffd700;}
.lp-welcome p{font-size:14px;line-height:1.75;color:rgba(255,240,180,.75);}
.lp-features{display:flex;flex-direction:column;gap:12px;animation:sIn .8s ease .2s both;}
.lp-feature{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:14px;transition:background .2s;}
.lp-feature:hover{background:rgba(255,255,255,.06);}
.lp-feature__icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.lp-feature__title{font-size:14px;font-weight:700;color:rgba(255,240,180,.9);}
.lp-feature__sub{font-size:12px;color:rgba(255,240,180,.5);margin-top:2px;}
.lp-stats{display:flex;border:1px solid rgba(255,220,80,.2);border-radius:18px;overflow:hidden;background:rgba(0,0,0,.15);animation:sIn .8s ease .3s both;}
.lp-stat{flex:1;padding:16px 10px;text-align:center;border-right:1px solid rgba(255,220,80,.12);transition:background .2s;}
.lp-stat:last-child{border-right:none;}
.lp-stat:hover{background:rgba(255,255,255,.05);}
.lp-stat__n{font-size:22px;font-weight:800;}
.lp-stat__l{font-size:11px;color:rgba(255,240,180,.6);margin-top:3px;}
.lp-aside__foot{display:flex;gap:8px;font-size:12px;color:rgba(255,240,180,.28);}
@keyframes sIn{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}
.lp-main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:72px 20px 36px;gap:20px;}
.lp-card{width:100%;max-width:480px;background:rgba(255,252,245,.96);backdrop-filter:blur(20px);border-radius:28px;border:2px solid rgba(255,220,80,.2);box-shadow:0 2px 0 rgba(255,255,255,.9) inset,0 20px 50px rgba(100,70,10,.12),0 4px 16px rgba(0,0,0,.05);overflow:hidden;animation:cIn .8s cubic-bezier(.22,1,.36,1) both;}
@keyframes cIn{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
.lp-stripe{height:5px;transition:background .5s ease;}
.lp-card__body{padding:28px 32px 24px;display:flex;flex-direction:column;gap:18px;}
.lp-card__foot{padding:14px 32px 20px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(200,184,120,.15);}
.lp-head{display:flex;align-items:center;justify-content:space-between;}
.lp-head__left{display:flex;align-items:center;gap:14px;}
.lp-head__ico{font-size:38px;line-height:1;flex-shrink:0;}
.lp-head h2{font-size:22px;font-weight:800;color:#1c1a14;line-height:1.2;}
.lp-head p{font-size:13px;color:#8a7a55;margin-top:3px;}
.lp-live{display:flex;align-items:center;gap:6px;font-size:12px;color:#8a7a55;padding:4px 10px;border-radius:20px;background:rgba(200,184,120,.12);border:1px solid rgba(200,184,120,.2);}
.lp-live__dot{width:8px;height:8px;background:#22c55e;border-radius:50%;animation:pulse 2s ease-in-out infinite;flex-shrink:0;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.9)}}
.lp-sec-lbl{font-size:12px;font-weight:700;color:#6b5c35;text-transform:uppercase;letter-spacing:.6px;}
.lp-req{color:#ef4444;}
.lp-roles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}
.lp-role{position:relative;display:flex;flex-direction:column;align-items:center;gap:5px;padding:14px 6px;border-radius:16px;border:2px solid #e8dfc0;background:white;cursor:pointer;transition:all .25s;outline:none;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;}
.lp-role:hover:not(.active){border-color:#c8b878;transform:translateY(-2px);box-shadow:0 6px 14px rgba(100,70,10,.1);}
.lp-role__ico{font-size:24px;line-height:1;}
.lp-role__lbl{font-size:11px;font-weight:700;color:#3d3010;text-align:center;}
.lp-role__chk{position:absolute;top:-7px;right:-7px;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,.25);}
.lp-role-info{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:14px;font-size:13px;font-weight:500;transition:all .4s;}
.lp-role-info__icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 10px rgba(0,0,0,.15);}
.lp-role-info__title{font-size:13px;font-weight:700;}
.lp-role-info__sub{font-size:11px;opacity:.7;margin-top:2px;}
.lp-alert{display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:14px;font-size:13.5px;font-weight:500;animation:aIn .3s ease both;}
@keyframes aIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
.lp-alert.err{background:#fff1f0;border:2px solid #ffb3ae;color:#9b1c1c;}
.lp-alert.ok{background:#f0fce8;border:2px solid #86d63a;color:#1a4a08;}
.lp-form{display:flex;flex-direction:column;gap:16px;}
.lp-field{display:flex;flex-direction:column;gap:6px;}
.lp-field label{font-size:14px;font-weight:700;color:#3d3010;}
.lp-ftop{display:flex;align-items:center;justify-content:space-between;}
.lp-fi{position:relative;display:flex;align-items:center;}
.lp-fi__ico{position:absolute;left:14px;font-size:18px;pointer-events:none;z-index:1;transition:transform .2s;}
.lp-field.focused .lp-fi__ico{transform:scale(1.15);}
.lp-field input{width:100%;padding:14px 14px 14px 46px;background:white;border:2px solid #e8dfc0;border-radius:14px;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;font-size:15px;color:#1c1a14;outline:none;transition:all .25s;-webkit-appearance:none;}
.lp-field input::placeholder{color:#c4b898;}
.lp-field input:hover{border-color:#c8b878;background:#fffcf5;}
.lp-field.focused input{border-color:var(--bd);background:var(--lt);box-shadow:0 0 0 3px color-mix(in srgb,var(--bd) 18%,transparent);}
.lp-forgot{background:none;border:none;cursor:pointer;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;font-size:13px;font-weight:600;padding:0;transition:opacity .2s;}
.lp-forgot:hover{opacity:.7;}
.lp-eye{position:absolute;right:14px;background:none;border:none;cursor:pointer;color:#a09070;display:flex;align-items:center;padding:4px;border-radius:8px;transition:all .2s;}
.lp-eye:hover{color:#3d3010;background:rgba(0,0,0,.05);}
.lp-btn{width:100%;padding:16px 24px;border:none;border-radius:16px;cursor:pointer;font-family:'Baloo 2','Noto Sans Devanagari',sans-serif;font-size:16px;font-weight:700;color:white;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .3s;outline:none;margin-top:4px;box-shadow:0 6px 20px rgba(0,0,0,.2),0 2px 0 rgba(255,255,255,.15) inset;position:relative;overflow:hidden;}
.lp-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.1),transparent);pointer-events:none;}
.lp-btn:hover:not(:disabled){transform:translateY(-3px);box-shadow:0 12px 30px rgba(0,0,0,.25);filter:brightness(1.06);}
.lp-btn:active:not(:disabled){transform:translateY(-1px);}
.lp-btn:disabled{opacity:.6;cursor:not-allowed;}
.lp-arr{transition:transform .25s;}
.lp-btn:hover .lp-arr{transform:translateX(4px);}
.lp-spin{width:20px;height:20px;border:2.5px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg)}}
.lp-reg{display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;color:#8a7a55;padding-top:4px;}
.lp-reg a{display:flex;align-items:center;gap:3px;font-weight:700;text-decoration:none;transition:all .2s;}
.lp-reg a:hover{text-decoration:underline;text-underline-offset:3px;}
.lp-back{display:flex;align-items:center;gap:6px;font-size:13px;color:#8a7a55;text-decoration:none;padding:6px 10px;border-radius:10px;font-weight:600;transition:all .2s;}
.lp-back:hover{color:#3d3010;background:rgba(100,70,10,.06);}
.lp-card__foot span{font-size:12px;color:rgba(139,122,85,.45);}
@media(max-width:480px){
  .lp-main{padding-top:68px;}
  .lp-card__body{padding:22px 18px 20px;}
  .lp-roles{grid-template-columns:repeat(2,1fr);}
  .lp-head__ico{font-size:30px;}
  .lp-head h2{font-size:18px;}
}
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important;}
}
      `}</style>
    </div>
  );
}