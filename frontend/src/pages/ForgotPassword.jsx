// src/pages/ForgotPassword.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Globe, Smartphone, Mail, Eye, EyeOff, CheckCircle } from 'lucide-react';

const API = 'http://localhost:8080/api/auth/forgot-password';

const LANG = {
  en: {
    title: 'Forgot Password?', sub: 'No worries! Reset it with your mobile or email.',
    step1: 'Enter Mobile / Email', step2: 'Verify OTP', step3: 'New Password',
    contactLabel: 'Mobile Number or Email', contactPH: 'Enter mobile or email',
    sendOtp: 'Send OTP', sending: 'Sending…',
    otpLabel: 'Enter 6-digit OTP', verifyOtp: 'Verify OTP', verifying: 'Verifying…',
    resend: 'Resend OTP', resendIn: 'Resend in',
    newPassLabel: 'New Password', confirmPassLabel: 'Confirm Password',
    newPassPH: 'Min 8 characters', confirmPassPH: 'Re-enter password',
    resetBtn: 'Reset Password', resetting: 'Resetting…',
    successTitle: 'Password Reset!', successSub: 'Your password has been updated.',
    goLogin: 'Back to Login', backLogin: '← Back to Login',
    smsBadge: 'OTP will be sent via: Mobile SMS',
    emailBadge: 'OTP will be sent via: Email',
    strength: ['', 'Weak', 'Fair', 'Good', 'Strong'],
    passMatch: 'Passwords match ✓', passMismatch: 'Passwords do not match',
    errConn: 'Connection error. Please try again.',
    errInvalidOtp: 'Invalid OTP. Please try again.',
    errExpired: 'OTP expired. Please request again.',
    secs: 'sec',
  },
  mr: {
    title: 'पासवर्ड विसरलात?', sub: 'काळजी नाही! Mobile किंवा Email ने reset करा.',
    step1: 'Mobile / Email टाका', step2: 'OTP Verify करा', step3: 'नवीन पासवर्ड',
    contactLabel: 'Mobile नंबर किंवा Email', contactPH: 'Mobile किंवा email टाका',
    sendOtp: 'OTP पाठवा', sending: 'पाठवत आहे…',
    otpLabel: '6-digit OTP टाका', verifyOtp: 'OTP Verify करा', verifying: 'Verify होत आहे…',
    resend: 'OTP पुन्हा पाठवा', resendIn: 'पुन्हा पाठवा',
    newPassLabel: 'नवीन पासवर्ड', confirmPassLabel: 'पासवर्ड confirm करा',
    newPassPH: 'किमान 8 characters', confirmPassPH: 'पासवर्ड परत टाका',
    resetBtn: 'पासवर्ड Reset करा', resetting: 'Reset होत आहे…',
    successTitle: 'पासवर्ड Reset झाला!', successSub: 'तुमचा पासवर्ड बदलला गेला.',
    goLogin: 'Login वर परत जा', backLogin: '← Login वर परत',
    smsBadge: 'OTP पाठवला जाईल: Mobile SMS द्वारे',
    emailBadge: 'OTP पाठवला जाईल: Email द्वारे',
    strength: ['', 'कमकुवत', 'ठीक', 'चांगला', 'मजबूत'],
    passMatch: 'पासवर्ड जुळतो ✓', passMismatch: 'पासवर्ड जुळत नाही',
    errConn: 'Connection error. पुन्हा try करा.',
    errInvalidOtp: 'चुकीचा OTP. पुन्हा try करा.',
    errExpired: 'OTP expired. पुन्हा request करा.',
    secs: 'से.',
  },
  hi: {
    title: 'पासवर्ड भूल गए?', sub: 'चिंता नहीं! Mobile या Email से reset करें।',
    step1: 'Mobile / Email डालें', step2: 'OTP Verify करें', step3: 'नया पासवर्ड',
    contactLabel: 'Mobile नंबर या Email', contactPH: 'Mobile या email डालें',
    sendOtp: 'OTP भेजें', sending: 'भेज रहे हैं…',
    otpLabel: '6-digit OTP डालें', verifyOtp: 'OTP Verify करें', verifying: 'Verify हो रहा है…',
    resend: 'OTP दोबारा भेजें', resendIn: 'दोबारा भेजें',
    newPassLabel: 'नया पासवर्ड', confirmPassLabel: 'पासवर्ड confirm करें',
    newPassPH: 'कम से कम 8 characters', confirmPassPH: 'पासवर्ड दोबारा डालें',
    resetBtn: 'पासवर्ड Reset करें', resetting: 'Reset हो रहा है…',
    successTitle: 'पासवर्ड Reset हुआ!', successSub: 'आपका पासवर्ड बदल दिया गया।',
    goLogin: 'Login पर वापस जाएं', backLogin: '← Login पर वापस',
    smsBadge: 'OTP भेजा जाएगा: Mobile SMS से',
    emailBadge: 'OTP भेजा जाएगा: Email से',
    strength: ['', 'कमज़ोर', 'ठीक', 'अच्छा', 'मज़बूत'],
    passMatch: 'पासवर्ड मेल खाता है ✓', passMismatch: 'पासवर्ड मेल नहीं खाता',
    errConn: 'Connection error। दोबारा try करें।',
    errInvalidOtp: 'गलत OTP। दोबारा try करें।',
    errExpired: 'OTP expired। दोबारा request करें।',
    secs: 'से.',
  },
};
const LANG_OPTS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'mr', label: 'मराठी',  flag: '🧡' },
  { code: 'hi', label: 'हिंदी',  flag: '🇮🇳' },
];

const detectType = (val) =>
  /^\d{10}$/.test(val.trim()) ? 'mobile'
  : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? 'email'
  : null;

const passStrength = (p) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};
const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [lang, setLang] = useState('en');
  const [langOpen, setLangOpen] = useState(false);
  const t = LANG[lang];

  const [step, setStep] = useState(1);
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpRefs] = useState(() => Array.from({ length: 6 }, () => React.createRef()));
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [timer, setTimer] = useState(0);
  const [success, setSuccess] = useState(false);

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

  useEffect(() => { setContactType(detectType(contact)); }, [contact]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  useEffect(() => {
    const h = (e) => { if (!e.target.closest('.fp-lang-wrap')) setLangOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) otpRefs[i + 1].current?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
  };
  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) { setOtp(text.split('')); otpRefs[5].current?.focus(); }
    e.preventDefault();
  };

  const sendOtp = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contact.trim(), type: contactType }),
      });
      const data = await res.json();
      if (data.success) { setStep(2); setTimer(60); setTimeout(() => otpRefs[0].current?.focus(), 100); }
      else setError(data.message || t.errConn);
    } catch { setError(t.errConn); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    const otpStr = otp.join(''); if (otpStr.length < 6) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contact.trim(), otp: otpStr }),
      });
      const data = await res.json();
      if (data.success && data.resetToken) { setResetToken(data.resetToken); setStep(3); }
      else if (data.success) { setStep(3); }
      else {
        setError(data.message === 'INVALID_OTP' ? t.errInvalidOtp : data.message || t.errConn);
        setOtp(['', '', '', '', '', '']); otpRefs[0].current?.focus();
      }
    } catch { setError(t.errConn); }
    finally { setLoading(false); }
  };

  const resetPassword = async () => {
    if (newPass !== confirmPass || newPass.length < 8) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/reset`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword: newPass }),
      });
      const data = await res.json();
      if (data.success) { setSuccess(true); setTimeout(() => navigate('/login'), 3000); }
      else setError(data.message || t.errConn);
    } catch { setError(t.errConn); }
    finally { setLoading(false); }
  };

  const strength = passStrength(newPass);
  const currentLang = LANG_OPTS.find(l => l.code === lang);
  const otpFilled = otp.join('').length === 6;

  if (success) return (
    <div style={S.root}>
      <canvas ref={canvasRef} style={S.grain} />
      <div style={S.bg} />
      <div style={S.center}>
        <div style={{ ...S.card, textAlign: 'center', padding: 'clamp(32px,8vw,48px) clamp(20px,6vw,32px)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 'clamp(18px,4vw,24px)', fontWeight: 800, color: '#1a4a08', marginBottom: 8 }}>{t.successTitle}</div>
          <div style={{ fontSize: 14, color: '#8a7a55', marginBottom: 24 }}>{t.successSub}</div>
          <div style={{ fontSize: 13, color: '#86d63a' }}>Redirecting to login…</div>
        </div>
      </div>
      <style>{GLOBAL_CSS}</style>
    </div>
  );

  return (
    <div style={S.root}>
      <canvas ref={canvasRef} style={S.grain} />
      <div style={S.bg} />

      <div style={{ ...S.deco, top: '8%', left: '4%', animationName: 'df1' }}>🌾</div>
      <div style={{ ...S.deco, top: '12%', right: '4%', fontSize: 32, animationName: 'df2', opacity: .1 }}>☀️</div>
      <div style={{ ...S.deco, bottom: '15%', left: '3%', animationName: 'df3' }}>🌱</div>

      {/* Lang switcher */}
      <div className="fp-lang-wrap" style={S.langWrap}>
        <button style={S.langBtn} onClick={() => setLangOpen(o => !o)}>
          <Globe size={13} />
          <span>{currentLang.flag}</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{currentLang.label}</span>
          <span style={{ fontSize: 10, transition: 'transform .2s', display: 'inline-block', transform: langOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
        </button>
        {langOpen && (
          <div style={S.langDd}>
            {LANG_OPTS.map(opt => (
              <button key={opt.code} style={{ ...S.langOpt, background: lang === opt.code ? '#f0fce8' : 'transparent', fontWeight: lang === opt.code ? 700 : 500 }}
                onClick={() => { setLang(opt.code); setLangOpen(false); }}>
                <span>{opt.flag}</span><span>{opt.label}</span>
                {lang === opt.code && <span style={{ marginLeft: 'auto', color: '#2d6a0a' }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={S.center}>
        <div style={S.card}>

          <div style={{ height: 5, background: 'linear-gradient(90deg,#2d6a0a,#86d63a,#2d6a0a)', borderRadius: '16px 16px 0 0' }} />

          <div style={{ padding: 'clamp(20px,5vw,28px) clamp(16px,5vw,32px) clamp(18px,4vw,24px)', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
              {[1, 2, 3].map((s, i) => (
                <React.Fragment key={s}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 13,
                      background: step >= s ? 'linear-gradient(135deg,#2d6a0a,#86d63a)' : '#e8dfc0',
                      color: step >= s ? 'white' : '#a09070',
                      boxShadow: step === s ? '0 4px 12px rgba(45,106,10,.35)' : 'none',
                      transition: 'all .3s',
                    }}>{step > s ? '✓' : s}</div>
                    <div style={{ fontSize: 8, color: step >= s ? '#2d6a0a' : '#a09070', fontWeight: 600, textAlign: 'center', maxWidth: 55, lineHeight: 1.2 }}>
                      {s === 1 ? t.step1 : s === 2 ? t.step2 : t.step3}
                    </div>
                  </div>
                  {i < 2 && <div style={{ flex: 1, height: 2, background: step > s ? '#86d63a' : '#e8dfc0', margin: '0 4px', marginBottom: 18, transition: 'background .3s' }} />}
                </React.Fragment>
              ))}
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 36, lineHeight: 1 }}>🔑</span>
              <div>
                <div style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800, color: '#1c1a14' }}>{t.title}</div>
                <div style={{ fontSize: 12, color: '#8a7a55', marginTop: 3 }}>{t.sub}</div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: '#fff1f0', border: '2px solid #ffb3ae', color: '#9b1c1c', padding: '11px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={S.label}>{t.contactLabel} <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={S.inputWrap}>
                    <span style={S.inputIcon}>{contactType === 'email' ? '📧' : '📱'}</span>
                    <input value={contact} onChange={e => { setContact(e.target.value); setError(''); }} onKeyDown={e => e.key === 'Enter' && contactType && sendOtp()} placeholder={t.contactPH} style={S.input} autoFocus />
                  </div>
                  {contactType && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderRadius: 10, background: '#eff6ff', border: '1.5px solid #6095e8', color: '#1e40af', fontSize: 11, fontWeight: 600 }}>
                      {contactType === 'mobile' ? <Smartphone size={13} /> : <Mail size={13} />}
                      {contactType === 'mobile' ? t.smsBadge : t.emailBadge}
                    </div>
                  )}
                </div>
                <button onClick={sendOtp} disabled={!contactType || loading} style={{ ...S.btn, opacity: (!contactType || loading) ? .6 : 1, cursor: (!contactType || loading) ? 'not-allowed' : 'pointer' }}>
                  {loading ? <><span style={S.spin} /> {t.sending}</> : <>{t.sendOtp} <ChevronRight size={17} /></>}
                </button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={S.label}>{t.otpLabel}</label>
                  <div style={{ display: 'flex', gap: 'clamp(4px,1.5vw,10px)', justifyContent: 'center' }} onPaste={handleOtpPaste}>
                    {otp.map((d, i) => (
                      <input key={i} ref={otpRefs[i]} value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(i, e)}
                        maxLength={1} inputMode="numeric"
                        style={{
                          width: 'clamp(38px,10vw,48px)', height: 'clamp(44px,12vw,54px)',
                          textAlign: 'center', fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800,
                          border: d ? '2px solid #86d63a' : '2px solid #e8dfc0',
                          borderRadius: 12, background: d ? '#f0fce8' : 'white', outline: 'none',
                          fontFamily: "'Baloo 2', sans-serif", transition: 'all .2s', color: '#1c1a14',
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#8a7a55' }}>
                    {timer > 0
                      ? <span>{t.resendIn} {timer}{t.secs}</span>
                      : <button onClick={() => { setTimer(60); setOtp(['','','','','','']); sendOtp(); }}
                          style={{ background: 'none', border: 'none', color: '#2d6a0a', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: "'Baloo 2',sans-serif" }}>
                          🔄 {t.resend}
                        </button>
                    }
                  </div>
                </div>
                <button onClick={verifyOtp} disabled={!otpFilled || loading}
                  style={{ ...S.btn, opacity: (!otpFilled || loading) ? .6 : 1, cursor: (!otpFilled || loading) ? 'not-allowed' : 'pointer' }}>
                  {loading ? <><span style={S.spin} /> {t.verifying}</> : <>{t.verifyOtp} <ChevronRight size={17} /></>}
                </button>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={S.label}>{t.newPassLabel}</label>
                  <div style={S.inputWrap}>
                    <span style={S.inputIcon}>🔒</span>
                    <input type={showPass ? 'text' : 'password'} value={newPass} onChange={e => { setNewPass(e.target.value); setError(''); }} placeholder={t.newPassPH} style={S.input} autoFocus />
                    <button type="button" onClick={() => setShowPass(s => !s)} style={S.eyeBtn}>{showPass ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                  </div>
                  {newPass.length > 0 && (
                    <>
                      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                        {[1,2,3,4].map(n => (
                          <div key={n} style={{ flex: 1, height: 4, borderRadius: 4, background: strength >= n ? strengthColor[strength] : '#e8dfc0', transition: 'background .3s' }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 12, color: strengthColor[strength], fontWeight: 600 }}>{t.strength[strength]}</div>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={S.label}>{t.confirmPassLabel}</label>
                  <div style={S.inputWrap}>
                    <span style={S.inputIcon}>🔑</span>
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPass} onChange={e => { setConfirmPass(e.target.value); setError(''); }} placeholder={t.confirmPassPH} style={S.input} />
                    <button type="button" onClick={() => setShowConfirm(s => !s)} style={S.eyeBtn}>{showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                  </div>
                  {confirmPass.length > 0 && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: newPass === confirmPass ? '#22c55e' : '#ef4444' }}>
                      {newPass === confirmPass ? t.passMatch : t.passMismatch}
                    </div>
                  )}
                </div>
                <button onClick={resetPassword} disabled={loading || newPass.length < 8 || newPass !== confirmPass}
                  style={{ ...S.btn, opacity: (loading || newPass.length < 8 || newPass !== confirmPass) ? .6 : 1, cursor: (loading || newPass.length < 8 || newPass !== confirmPass) ? 'not-allowed' : 'pointer' }}>
                  {loading ? <><span style={S.spin} /> {t.resetting}</> : <><CheckCircle size={19} /> {t.resetBtn}</>}
                </button>
              </>
            )}

            <button onClick={() => navigate('/login')} style={S.backBtn}>
              <ArrowLeft size={14} /> {t.backLogin}
            </button>

          </div>
        </div>
      </div>
      <style>{GLOBAL_CSS}</style>
    </div>
  );
}

const S = {
  root: { minHeight: '100vh', display: 'flex', alignItems: 'stretch', fontFamily: "'Baloo 2','Noto Sans Devanagari',sans-serif", position: 'relative', overflow: 'hidden' },
  grain: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, opacity: .35, mixBlendMode: 'multiply' },
  bg: { position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(180deg,#fdf8ed 0%,#f5f0df 60%,#ede8d0 100%)' },
  center: { position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 'clamp(60px,10vw,72px) 16px 32px' },
  card: { width: '100%', maxWidth: 480, background: 'rgba(255,252,245,.96)', backdropFilter: 'blur(20px)', borderRadius: 'clamp(18px,4vw,28px)', border: '2px solid rgba(255,220,80,.2)', boxShadow: '0 2px 0 rgba(255,255,255,.9) inset, 0 20px 50px rgba(100,70,10,.12)', overflow: 'hidden', animation: 'cIn .7s cubic-bezier(.22,1,.36,1) both' },
  deco: { position: 'fixed', pointerEvents: 'none', zIndex: 2, fontSize: 24, opacity: .2, userSelect: 'none', animationDuration: '12s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' },
  langWrap: { position: 'fixed', top: 12, right: 14, zIndex: 300 },
  langBtn: { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 20, background: 'rgba(255,252,245,.95)', border: '1.5px solid #e8dfc0', fontFamily: "'Baloo 2',sans-serif", fontSize: 12, fontWeight: 600, color: '#3d3010', cursor: 'pointer', boxShadow: '0 2px 10px rgba(100,70,10,.1)' },
  langDd: { position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'rgba(255,252,245,.98)', border: '1.5px solid #e8dfc0', borderRadius: 14, padding: 6, minWidth: 140, boxShadow: '0 8px 24px rgba(100,70,10,.14)', animation: 'ddIn .18s ease both' },
  langOpt: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: "'Baloo 2',sans-serif", fontSize: 14, color: '#3d3010', transition: 'background .15s' },
  label: { fontSize: 13, fontWeight: 700, color: '#3d3010' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 13, fontSize: 16, pointerEvents: 'none', zIndex: 1 },
  input: { width: '100%', padding: '13px 13px 13px 44px', background: 'white', border: '2px solid #e8dfc0', borderRadius: 14, fontFamily: "'Baloo 2','Noto Sans Devanagari',sans-serif", fontSize: 14, color: '#1c1a14', outline: 'none', boxSizing: 'border-box' },
  eyeBtn: { position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#a09070', display: 'flex', alignItems: 'center', padding: 4 },
  btn: { width: '100%', padding: '14px 20px', border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: "'Baloo 2','Noto Sans Devanagari',sans-serif", fontSize: 15, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#2d6a0a,#86d63a)', boxShadow: '0 6px 20px rgba(45,106,10,.3)', transition: 'all .3s', marginTop: 2 },
  backBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Baloo 2',sans-serif", fontSize: 13, fontWeight: 600, color: '#8a7a55', padding: '7px 10px', borderRadius: 10, width: '100%', transition: 'all .2s' },
  spin: { width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .8s linear infinite', flexShrink: 0, display: 'inline-block' },
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
@keyframes cIn{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
@keyframes ddIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes df1{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-20px) rotate(5deg)}}
@keyframes df2{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-15px) scale(1.1)}}
@keyframes df3{0%,100%{transform:translateY(0) rotate(5deg)}50%{transform:translateY(-18px) rotate(-5deg)}}
.fp-lang-wrap{}
input:focus{border-color:#86d63a !important;box-shadow:0 0 0 3px rgba(134,214,58,.15) !important;}
`;