// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Sprout, TrendingUp, ArrowRight, ChevronRight, ChevronLeft,
  Star, Mail, Phone, MapPin, X, CheckCircle,
  Facebook, Twitter, Instagram, Youtube, Linkedin,
  Banknote, Umbrella, Tractor, BookOpen, BadgeCheck, HelpCircle
} from 'lucide-react';

const API_URL = 'http://localhost:8080/api/contact';

const useCounter = (end, duration = 2000, active = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, end, duration]);
  return val;
};

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const [showHelpMenu, setShowHelpMenu] = useState(false);

  const slides = [
    { url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1400', alt: 'Farmer in field' },
    { url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1400', alt: 'Agriculture' },
    { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400', alt: 'Harvest' },
    { url: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=1400', alt: 'Fresh produce' },
  ];

  const [slide,       setSlide]       = useState(0);
  const [navSolid,    setNavSolid]    = useState(false);
  const [countersOn,  setCountersOn]  = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [form,        setForm]        = useState({ name:'', email:'', phone:'', message:'' });
  const [formErr,     setFormErr]     = useState({});
  const [submitted,   setSubmitted]   = useState(false);
  const [sending,     setSending]     = useState(false);
  const [activeRole,  setActiveRole]  = useState('farmer');
  const statsRef = useRef(null);

  const c1 = useCounter(10000, 2200, countersOn);
  const c2 = useCounter(500,   1800, countersOn);
  const c3 = useCounter(50,    1500, countersOn);
  const c4 = useCounter(5,     2000, countersOn);

  useEffect(() => {
    const id = setInterval(() => setSlide(p => (p+1) % slides.length), 5500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fn = () => setNavSolid(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCountersOn(true); }, { threshold: 0.3 });
    if (statsRef.current) io.observe(statsRef.current);
    return () => io.disconnect();
  }, []);

  // ── Help menu options (LanguageContext keys वापरून) ──
  const helpOptions = [
    { path:'/help#intro',    icon:'🌟', label: t?.helpIntro||'Introduction of Agri Connect', desc: t?.helpIntroDes||'Know about our platform',     bg:'#16a34a' },
    { path:'/help#login',    icon:'🔐', label: t?.helpLogin||'Login Process',                 desc: t?.helpLoginDes||'How to login to your account', bg:'#2563eb' },
    { path:'/help#register', icon:'📝', label: t?.helpRegister||'Register Process',           desc: t?.helpRegDes||'Create new account',             bg:'#7c3aed' },
    { path:'/help#farmer',   icon:'👨‍🌾', label: t?.helpFarmer||'Farmer Panel',               desc: t?.helpFarmerDes||'Guide for farmers',           bg:'#16a34a' },
    { path:'/help#dealer',   icon:'🏪', label: t?.helpDealer||'Dealer Panel',                 desc: t?.helpDealerDes||'Guide for dealers',           bg:'#2563eb' },
    { path:'/help#customer', icon:'🛒', label: t?.helpCustomer||'Customer Panel',             desc: t?.helpCustomerDes||'Guide for customers',       bg:'#7c3aed' },
  ];

  // ── Role sections (t. keys वापरून) ──
  const roles = {
    farmer: {
      color:'#16a34a', light:'#f0fdf4', border:'#bbf7d0',
      emoji:'👨‍🌾', title: t?.forFarmers||'For Farmers',
      headline: t?.farmerHeadline||'Sell your crops directly. Earn what you deserve.',
      sub:      t?.farmerSub||'No middlemen. No exploitation.',
      benefits: t?.farmerBenefits||[],
      cta:      t?.farmerCta||'Join as Farmer',
      ctaPath:'/register',
      stat:{ value:'30%', label: t?.farmerStat||'Average increase in farmer income' },
      image:'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600',
    },
    dealer: {
      color:'#2563eb', light:'#eff6ff', border:'#bfdbfe',
      emoji:'🏢', title: t?.forDealers||'For Dealers',
      headline: t?.dealerHeadline||'Source fresh crops directly from verified farmers.',
      sub:      t?.dealerSub||'Skip the mandis and middlemen.',
      benefits: t?.dealerBenefits||[],
      cta:      t?.dealerCta||'Join as Dealer',
      ctaPath:'/register',
      stat:{ value:'40%', label: t?.dealerStat||'Reduction in procurement cost' },
      image:'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
    },
    customer: {
      color:'#7c3aed', light:'#faf5ff', border:'#ddd6fe',
      emoji:'🛒', title: t?.forCustomers||'For Customers',
      headline: t?.customerHeadline||'Farm-fresh produce, delivered to your door.',
      sub:      t?.customerSub||'Buy directly from the farmer who grew it.',
      benefits: t?.customerBenefits||[],
      cta:      t?.customerCta||'Shop Fresh',
      ctaPath:'/register',
      stat:{ value:'25%', label: t?.customerStat||'Savings compared to market price' },
      image:'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600',
    },
  };

  // ── Schemes (t. keys वापरून) ──
  const schemes = [
    { icon:Banknote,   color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', title:'PM-KISAN', full:'Pradhan Mantri Kisan Samman Nidhi',        tag:t?.incomeSupport||'Income Support',  desc:t?.schemeDescs?.[0]||'' },
    { icon:Umbrella,   color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', title:'PMFBY',    full:'Pradhan Mantri Fasal Bima Yojana',          tag:t?.cropInsurance||'Crop Insurance',  desc:t?.schemeDescs?.[1]||'' },
    { icon:Tractor,    color:'#d97706', bg:'#fffbeb', border:'#fde68a', title:'SMAM',     full:'Sub-Mission on Agricultural Mechanization', tag:t?.equipSubsidy||'Equipment Subsidy',desc:t?.schemeDescs?.[2]||'' },
    { icon:TrendingUp, color:'#7c3aed', bg:'#faf5ff', border:'#ddd6fe', title:'eNAM',     full:'National Agriculture Market',               tag:t?.marketAccess||'Market Access',    desc:t?.schemeDescs?.[3]||'' },
    { icon:BookOpen,   color:'#dc2626', bg:'#fef2f2', border:'#fecaca', title:'PKVY',     full:'Paramparagat Krishi Vikas Yojana',          tag:t?.organicFarming||'Organic Farming',desc:t?.schemeDescs?.[4]||'' },
    { icon:BadgeCheck, color:'#059669', bg:'#ecfdf5', border:'#a7f3d0', title:'KCC',      full:'Kisan Credit Card',                         tag:t?.farmerLoans||'Farmer Loans',      desc:t?.schemeDescs?.[5]||'' },
  ];

  const testimonials = [
    { name:'Rajesh Patil',  role:'Wheat Farmer, Pune',     avatar:'👨‍🌾', tag:'Farmer',   color:'#16a34a', bg:'#f0fdf4', stars:5, text:'I now get 30% more for my wheat. No middlemen — I talk directly to the buyer and the money comes straight to my account!' },
    { name:'Vijay Traders', role:'Agri Dealer, Mumbai',    avatar:'🏢',  tag:'Dealer',   color:'#2563eb', bg:'#eff6ff', stars:5, text:'Finding quality produce used to take days. Now I source fresh vegetables from verified farmers within hours.' },
    { name:'Priya Sharma',  role:'Customer, Nashik',       avatar:'👩',  tag:'Customer', color:'#7c3aed', bg:'#faf5ff', stars:5, text:'The vegetables are SO fresh. I know exactly which farm they come from. Better than any supermarket!' },
    { name:'Suresh Kolhe',  role:'Farmer, Kolhapur',       avatar:'🧑‍🌾', tag:'Farmer',   color:'#16a34a', bg:'#f0fdf4', stars:5, text:'Very easy to use. Even I could list my sugarcane crop and got 3 dealer requests the same day!' },
    { name:'Anita Foods',   role:'Food Processor, Nagpur', avatar:'🏭',  tag:'Dealer',   color:'#2563eb', bg:'#eff6ff', stars:5, text:'We source all our raw materials through Agri Connect. Consistent quality and reliable farmers.' },
    { name:'Meera Joshi',   role:'Customer, Aurangabad',   avatar:'👩‍💼', tag:'Customer', color:'#7c3aed', bg:'#faf5ff', stars:4, text:'Love supporting local farmers! Fresh produce at market prices — and I can see the farmer profile.' },
  ];

  const validateForm = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Enter valid name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter valid email';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g,''))) e.phone = 'Enter 10-digit number';
    if (!form.message.trim() || form.message.length < 10) e.message = 'Message too short';
    setFormErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;
    setSending(true);
    try {
      const res = await fetch(API_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => { setContactOpen(false); setSubmitted(false); setForm({name:'',email:'',phone:'',message:''}); }, 2500);
      }
    } catch { alert('Network error'); } finally { setSending(false); }
  };

  const active = roles[activeRole];
  const fmt = n => n >= 10000 ? '10K+' : n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n);

  return (
    <div style={{ fontFamily:"'Nunito',system-ui,sans-serif", background:'white' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:navSolid?'rgba(255,255,255,0.97)':'transparent', backdropFilter:navSolid?'blur(20px)':'none', boxShadow:navSolid?'0 1px 20px rgba(0,0,0,0.07)':'none', borderBottom:navSolid?'1px solid rgba(0,0,0,0.05)':'none', transition:'all .3s ease' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', height:72, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ background:'linear-gradient(135deg,#15803d,#059669)', padding:9, borderRadius:12 }}><Sprout size={20} color="white"/></div>
            <span style={{ fontSize:20, fontWeight:900, color:navSolid?'#15803d':'white', transition:'color .3s', letterSpacing:'-0.3px' }}>{t?.appName||'Agri Connect'}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <select value={language} onChange={e=>setLanguage(e.target.value)} style={{ padding:'7px 12px', borderRadius:10, fontSize:13, outline:'none', cursor:'pointer', fontWeight:600, background:navSolid?'white':'rgba(255,255,255,0.15)', border:navSolid?'1.5px solid #e5e7eb':'1.5px solid rgba(255,255,255,0.3)', color:navSolid?'#374151':'white' }}>
              <option value="en" style={{color:'#111'}}>English</option>
              <option value="hi" style={{color:'#111'}}>हिंदी</option>
              <option value="mr" style={{color:'#111'}}>मराठी</option>
            </select>
            <Link to="/login" style={{ padding:'8px 18px', borderRadius:10, fontSize:14, fontWeight:700, color:navSolid?'#374151':'white', textDecoration:'none' }}>{t?.login||'Login'}</Link>
            <Link to="/register" style={{ padding:'9px 22px', borderRadius:10, fontSize:14, fontWeight:800, background:navSolid?'linear-gradient(135deg,#15803d,#059669)':'white', color:navSolid?'white':'#15803d', textDecoration:'none', boxShadow:navSolid?'0 4px 14px rgba(21,128,61,0.25)':'0 4px 16px rgba(0,0,0,0.15)' }}>
              {t?.registerFree||'Register Free'}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position:'relative', height:'100vh', overflow:'hidden' }}>
        {slides.map((s,i) => (
          <div key={i} style={{ position:'absolute', inset:0, opacity:i===slide?1:0, transition:'opacity 1.4s ease' }}>
            <img src={s.url} alt={s.alt} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.25) 50%,rgba(0,40,0,0.65) 100%)' }}/>
          </div>
        ))}
        {[{d:'left',fn:()=>setSlide(p=>(p-1+slides.length)%slides.length),Icon:ChevronLeft},{d:'right',fn:()=>setSlide(p=>(p+1)%slides.length),Icon:ChevronRight}].map(({d,fn,Icon})=>(
          <button key={d} onClick={fn} style={{ position:'absolute', top:'50%', [d]:28, transform:'translateY(-50%)', zIndex:10, width:50, height:50, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
            <Icon size={24}/>
          </button>
        ))}
        <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8, zIndex:10 }}>
          {slides.map((_,i)=><button key={i} onClick={()=>setSlide(i)} style={{ height:6, width:i===slide?28:6, borderRadius:3, border:'none', background:i===slide?'white':'rgba(255,255,255,0.4)', cursor:'pointer', transition:'all .3s' }}/>)}
        </div>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', zIndex:5, padding:'0 24px' }}>
          <div style={{ maxWidth:1100, margin:'0 auto', width:'100%' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:999, padding:'8px 20px', color:'white', fontSize:14, fontWeight:700, marginBottom:24 }}>
              🌱 {t?.heroBadge||"India's Trusted Agricultural Marketplace"}
            </div>
            <h1 style={{ fontSize:'clamp(38px,6vw,76px)', fontWeight:900, color:'white', margin:'0 0 18px', lineHeight:1.05, letterSpacing:'-1.5px', textShadow:'0 4px 24px rgba(0,0,0,0.25)', maxWidth:800 }}>
              {t?.heroTitle||'Welcome to'}<br/>
              <span style={{ color:'#86efac' }}>{t?.fairPrices||'Agri Connect'}</span>
            </h1>
            <p style={{ fontSize:'clamp(16px,2vw,22px)', color:'rgba(255,255,255,0.88)', margin:'0 0 36px', lineHeight:1.6, maxWidth:580, textShadow:'0 2px 8px rgba(0,0,0,0.2)' }}>
              {t?.heroSubtitle||'Direct trade between farmers, dealers, and customers.'}
            </p>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:52 }}>
              {[
                {label:t?.heroBtnFarmer||'👨‍🌾 Farmer',  bg:'linear-gradient(135deg,#16a34a,#059669)', shadow:'rgba(22,163,74,0.4)'},
                {label:t?.heroBtnDealer||'🏢 Dealer',    bg:'linear-gradient(135deg,#2563eb,#1d4ed8)', shadow:'rgba(37,99,235,0.4)'},
                {label:t?.heroBtnCustomer||'🛒 Customer',bg:'linear-gradient(135deg,#7c3aed,#6d28d9)', shadow:'rgba(124,58,237,0.4)'},
              ].map(({label,bg,shadow})=>(
                <Link key={label} to="/register" style={{ padding:'14px 28px', borderRadius:14, fontSize:15, fontWeight:800, background:bg, color:'white', textDecoration:'none', boxShadow:`0 8px 28px ${shadow}`, display:'flex', alignItems:'center', gap:8 }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
                >{label} <ArrowRight size={16}/></Link>
              ))}
            </div>
            <div style={{ display:'flex', gap:0, flexWrap:'wrap' }}>
              {[['10K+',t?.farmers||'Farmers'],['500+',t?.dealers||'Dealers'],['50+',t?.districtsLabel||'Districts'],['₹5Cr+',t?.totalTrade||'Traded']].map(([v,l],i)=>(
                <div key={i} style={{ padding:'12px 28px', borderRight:i<3?'1px solid rgba(255,255,255,0.2)':'none', textAlign:'center' }}>
                  <div style={{ fontSize:26, fontWeight:900, color:'white' }}>{v}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.65)', fontWeight:600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ── */}
      <section style={{ background:'white', padding:'96px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div style={{ display:'inline-block', background:'#dcfce7', color:'#15803d', fontSize:13, fontWeight:700, padding:'6px 18px', borderRadius:999, marginBottom:14 }}>{t?.builtForYou||'Built For You'}</div>
            <h2 style={{ fontSize:42, fontWeight:900, color:'#0f172a', margin:'0 0 14px', letterSpacing:'-0.5px' }}>{t?.whoFor||'Who is Agri Connect for?'}</h2>
            <p style={{ fontSize:17, color:'#64748b', maxWidth:500, margin:'0 auto' }}>{t?.whoForSub||'Whether you grow it, sell it, or eat it.'}</p>
          </div>
          <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:52, flexWrap:'wrap' }}>
            {Object.entries(roles).map(([key,r])=>(
              <button key={key} onClick={()=>setActiveRole(key)} style={{ padding:'12px 32px', borderRadius:14, fontSize:16, fontWeight:800, border:`2px solid ${activeRole===key?r.color:'#e5e7eb'}`, background:activeRole===key?r.color:'white', color:activeRole===key?'white':'#374151', cursor:'pointer', transition:'all .25s', boxShadow:activeRole===key?`0 6px 24px ${r.color}30`:'none' }}>
                {r.emoji} {r.title}
              </button>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center', background:active.light, borderRadius:32, padding:'52px', border:`1.5px solid ${active.border}` }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:active.color, textTransform:'uppercase', letterSpacing:'1px', marginBottom:12 }}>{active.title}</div>
              <h3 style={{ fontSize:32, fontWeight:900, color:'#0f172a', margin:'0 0 16px', lineHeight:1.2 }}>{active.headline}</h3>
              <p style={{ fontSize:16, color:'#475569', lineHeight:1.75, margin:'0 0 28px' }}>{active.sub}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:32 }}>
                {(active.benefits||[]).map((b,i)=><div key={i} style={{ fontSize:15, color:'#374151', fontWeight:600 }}>{b}</div>)}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
                <Link to="/register" style={{ padding:'14px 32px', borderRadius:14, fontSize:15, fontWeight:800, background:`linear-gradient(135deg,${active.color},${active.color}cc)`, color:'white', textDecoration:'none', boxShadow:`0 8px 28px ${active.color}35`, display:'flex', alignItems:'center', gap:8 }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
                >{active.cta} <ArrowRight size={16}/></Link>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:28, fontWeight:900, color:active.color }}>{active.stat.value}</div>
                  <div style={{ fontSize:12, color:'#64748b', fontWeight:600, maxWidth:140 }}>{active.stat.label}</div>
                </div>
              </div>
            </div>
            <div style={{ position:'relative' }}>
              <div style={{ borderRadius:24, overflow:'hidden', boxShadow:`0 24px 64px ${active.color}25` }}>
                <img src={active.image} alt={active.title} style={{ width:'100%', height:380, objectFit:'cover', display:'block' }}/>
              </div>
              <div style={{ position:'absolute', bottom:-20, left:-20, background:'white', borderRadius:18, padding:'16px 24px', boxShadow:'0 12px 40px rgba(0,0,0,0.12)', border:`1px solid ${active.border}` }}>
                <div style={{ fontSize:28, fontWeight:900, color:active.color }}>{active.stat.value}</div>
                <div style={{ fontSize:12, color:'#64748b', fontWeight:600 }}>{active.stat.label}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GOVERNMENT SCHEMES ── */}
      <section style={{ background:'linear-gradient(180deg,#f8fafc,#f0fdf4)', padding:'96px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div style={{ display:'inline-block', background:'#dcfce7', color:'#15803d', fontSize:13, fontWeight:700, padding:'6px 18px', borderRadius:999, marginBottom:14 }}>🏛️ {t?.govSupport||'Government Support'}</div>
            <h2 style={{ fontSize:42, fontWeight:900, color:'#0f172a', margin:'0 0 14px', letterSpacing:'-0.5px' }}>{t?.govTitle||'Government Schemes for Farmers'}</h2>
            <p style={{ fontSize:17, color:'#64748b', maxWidth:580, margin:'0 auto', lineHeight:1.7 }}>{t?.govSub||'Agri Connect helps farmers discover government schemes.'}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:24 }}>
            {schemes.map((s,i)=>(
              <div key={i} style={{ background:'white', borderRadius:22, padding:'28px', border:`1.5px solid ${s.border}`, boxShadow:'0 2px 16px rgba(0,0,0,0.05)', transition:'all .3s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow=`0 16px 48px ${s.color}15`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 16px rgba(0,0,0,0.05)';}}
              >
                <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:16 }}>
                  <div style={{ width:52, height:52, borderRadius:16, background:s.bg, border:`1.5px solid ${s.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <s.icon size={24} color={s.color}/>
                  </div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <h3 style={{ fontSize:18, fontWeight:900, color:'#0f172a', margin:0 }}>{s.title}</h3>
                      <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, background:s.bg, color:s.color }}>{s.tag}</span>
                    </div>
                    <p style={{ fontSize:12, color:'#94a3b8', margin:'2px 0 0', fontStyle:'italic' }}>{s.full}</p>
                  </div>
                </div>
                <p style={{ fontSize:14, color:'#475569', lineHeight:1.7, margin:0 }}>{s.desc}</p>
                <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${s.border}` }}>
                  <Link to="/register" style={{ fontSize:13, fontWeight:700, color:s.color, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                    {t?.checkEligibility||'Check Eligibility'} <ArrowRight size={13}/>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:44 }}>
            <p style={{ fontSize:15, color:'#64748b', marginBottom:20 }}>📋 {t?.schemeNote||'Agri Connect shows you all eligible schemes'} <strong>{t?.schemeFree||'completely free.'}</strong></p>
            <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 32px', borderRadius:14, fontSize:15, fontWeight:800, background:'linear-gradient(135deg,#15803d,#059669)', color:'white', textDecoration:'none', boxShadow:'0 8px 28px rgba(21,128,61,0.3)' }}>
              {t?.discoverSchemes||'Discover Your Schemes'} <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ANIMATED STATS ── */}
      <section ref={statsRef} style={{ background:'linear-gradient(135deg,#0f172a,#1e3a2f)', padding:'80px 24px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontSize:36, fontWeight:900, color:'white', margin:'0 0 10px' }}>{t?.growingTitle||'Growing Every Day'}</h2>
          <p style={{ color:'rgba(255,255,255,0.6)', margin:'0 0 52px', fontSize:16 }}>{t?.growingSub||'Real numbers from real farmers across India'}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16 }}>
            {[
              {v:fmt(c1),    l:t?.activeFarmers||'Active Farmers',    e:'👨‍🌾'},
              {v:fmt(c2)+'+',l:t?.verifiedDealers||'Verified Dealers', e:'🏢'},
              {v:fmt(c3)+'+',l:t?.districtsLabel||'Districts',         e:'📍'},
              {v:'₹'+c4+'Cr+',l:t?.totalTrade||'Total Traded',        e:'💰'},
            ].map(({v,l,e},i)=>(
              <div key={i} style={{ background:'rgba(255,255,255,0.07)', borderRadius:20, padding:'32px 20px', border:'1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>{e}</div>
                <div style={{ fontSize:38, fontWeight:900, color:'white', lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginTop:8, fontWeight:600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background:'#fafafa', padding:'96px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div style={{ display:'inline-block', background:'#fef3c7', color:'#d97706', fontSize:13, fontWeight:700, padding:'6px 18px', borderRadius:999, marginBottom:14 }}>⭐{t?.userStories||' Real Stories'}</div>
            <h2 style={{ fontSize:42, fontWeight:900, color:'#0f172a', margin:'0 0 14px', letterSpacing:'-0.5px' }}>{t?.testimonialTitle||'What Our Users Say'}</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:24 }}>
            {testimonials.map((tm,i)=>(
              <div key={i} style={{ background:'white', borderRadius:22, padding:'28px', boxShadow:'0 2px 16px rgba(0,0,0,0.06)', border:'1px solid #e5e7eb', transition:'all .3s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.1)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 16px rgba(0,0,0,0.06)';}}
              >
                <div style={{ display:'flex', gap:3, marginBottom:16 }}>
                  {Array.from({length:tm.stars}).map((_,s)=><Star key={s} size={15} fill="#f59e0b" color="#f59e0b"/>)}
                </div>
                <p style={{ fontSize:15, color:'#374151', lineHeight:1.75, margin:'0 0 22px', fontStyle:'italic' }}>"{tm.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ fontSize:34, width:46, height:46, display:'flex', alignItems:'center', justifyContent:'center', background:tm.bg, borderRadius:14 }}>{tm.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:'#0f172a' }}>{tm.name}</div>
                    <div style={{ fontSize:12, color:'#6b7280' }}>{tm.role}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:999, background:tm.bg, color:tm.color }}>{tm.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:'linear-gradient(135deg,#15803d,#059669)', padding:'96px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:500, height:500, background:'rgba(255,255,255,0.06)', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', bottom:-100, left:-100, width:400, height:400, background:'rgba(0,0,0,0.06)', borderRadius:'50%' }}/>
        <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center', position:'relative' }}>
          <h2 style={{ fontSize:46, fontWeight:900, color:'white', margin:'0 0 18px', letterSpacing:'-0.5px' }}>{t?.startTrading||'Start Trading Today'}</h2>
          <p style={{ fontSize:18, color:'rgba(255,255,255,0.85)', margin:'0 0 44px', lineHeight:1.7 }}>{t?.joinCommunity||'Join 10,000+ farmers and dealers on Agri Connect.'}</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:40 }}>
            <Link to="/register" style={{ padding:'16px 36px', borderRadius:14, fontSize:16, fontWeight:800, background:'white', color:'#15803d', textDecoration:'none', boxShadow:'0 8px 28px rgba(0,0,0,0.15)', display:'flex', alignItems:'center', gap:8 }}>
              {t?.registerFree||'Register Free'} <ArrowRight size={18}/>
            </Link>
            <button onClick={()=>setContactOpen(true)} style={{ padding:'16px 36px', borderRadius:14, fontSize:16, fontWeight:700, background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.3)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
              {t?.contactUs||'Contact Us'} <ChevronRight size={18}/>
            </button>
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:32, flexWrap:'wrap' }}>
            {[[t?.freeReg||'Free Registration','✅'],[t?.securePlatform||'Secure Platform','🔒'],[t?.easyToUse||'Easy to Use','📱'],[t?.farmerFirst||'Farmer First','🌾']].map(([l,e])=>(
              <span key={l} style={{ fontSize:14, color:'rgba(255,255,255,0.8)', fontWeight:600 }}>{e} {l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#0f172a', color:'#94a3b8', padding:'64px 24px 32px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:40, marginBottom:52 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ background:'linear-gradient(135deg,#15803d,#059669)', padding:8, borderRadius:10 }}><Sprout size={20} color="white"/></div>
                <span style={{ fontSize:18, fontWeight:900, color:'white' }}>{t?.appName||'Agri Connect'}</span>
              </div>
              <p style={{ fontSize:14, lineHeight:1.7, marginBottom:22 }}>{t?.bridgeGap||'Bridging the gap between farmers and dealers.'}</p>
              <div style={{ display:'flex', gap:8 }}>
                {[[Facebook,'#1877f2'],[Twitter,'#1da1f2'],[Instagram,'#e1306c'],[Youtube,'#ff0000'],[Linkedin,'#0077b5']].map(([Icon,color],i)=>(
                  <a key={i} href="#" style={{ width:36, height:36, borderRadius:9, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', textDecoration:'none' }}
                    onMouseEnter={e=>{e.currentTarget.style.background=color;e.currentTarget.style.color='white';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='#94a3b8';}}
                  ><Icon size={15}/></a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color:'white', fontWeight:700, fontSize:14, marginBottom:18 }}>{t?.platform||'Platform'}</h4>
              {(t?.footerPlatformLinks||['For Farmers','For Dealers','For Customers','Government Schemes','Market Prices']).map(item=>(
                <div key={item} style={{ marginBottom:10 }}>
                  <Link to="/login" style={{ color:'#64748b', textDecoration:'none', fontSize:14 }}
                    onMouseEnter={e=>e.currentTarget.style.color='#4ade80'}
                    onMouseLeave={e=>e.currentTarget.style.color='#64748b'}
                  >{item}</Link>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ color:'white', fontWeight:700, fontSize:14, marginBottom:18 }}>{t?.company||'Company'}</h4>
              {(t?.companyLinks||['About Us','Contact','FAQ','Privacy Policy','Terms of Service']).map(item=>(
                <div key={item} style={{ marginBottom:10 }}>
                  <a href="#" style={{ color:'#64748b', textDecoration:'none', fontSize:14 }}
                    onMouseEnter={e=>e.currentTarget.style.color='#4ade80'}
                    onMouseLeave={e=>e.currentTarget.style.color='#64748b'}
                  >{item}</a>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ color:'white', fontWeight:700, fontSize:14, marginBottom:18 }}>Contact</h4>
              {[[Mail,'support@agriconnect.in'],[Phone,'+91 98765 43210'],[MapPin,'Pune, Maharashtra, India']].map(([Icon,text],i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <div style={{ width:30, height:30, background:'rgba(22,163,74,0.12)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon size={13} color="#4ade80"/></div>
                  <span style={{ fontSize:13 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
            <p style={{ fontSize:13, margin:0 }}>© {new Date().getFullYear()} Agri Connect. {t?.allRightsReserved||'All rights reserved.'}</p>
            <div style={{ display:'flex', gap:20 }}>
              {['Privacy Policy','Terms','Cookies'].map(item=><a key={item} href="#" style={{ fontSize:13, color:'#475569', textDecoration:'none' }}>{item}</a>)}
            </div>
          </div>
        </div>
      </footer>

      {/* ── CONTACT MODAL ── */}
      {contactOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 }}>
          <div style={{ background:'white', borderRadius:24, maxWidth:500, width:'100%', boxShadow:'0 32px 80px rgba(0,0,0,0.25)', overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 26px', borderBottom:'1px solid #e5e7eb', background:'linear-gradient(135deg,#f0fdf4,#ecfdf5)' }}>
              <div>
                <h3 style={{ fontSize:19, fontWeight:800, color:'#0f172a', margin:'0 0 3px' }}>{t?.contactUs||'Contact Us'}</h3>
                <p style={{ fontSize:13, color:'#64748b', margin:0 }}>We'll get back to you within 24 hours</p>
              </div>
              <button onClick={()=>setContactOpen(false)} style={{ width:34, height:34, borderRadius:9, border:'1.5px solid #e5e7eb', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280' }}><X size={15}/></button>
            </div>
            {submitted ? (
              <div style={{ padding:'52px 28px', textAlign:'center' }}>
                <div style={{ width:68, height:68, background:'#dcfce7', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}><CheckCircle size={34} color="#16a34a"/></div>
                <h4 style={{ fontSize:18, fontWeight:800, color:'#0f172a', margin:'0 0 8px' }}>Message Sent!</h4>
                <p style={{ fontSize:14, color:'#64748b', margin:0 }}>We'll respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding:'26px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  {[['name','Full Name *','text','Your name'],['email','Email *','email','your@email.com']].map(([k,l,type,p])=>(
                    <div key={k}>
                      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:5 }}>{l}</label>
                      <input type={type} value={form[k]} placeholder={p} onChange={e=>setForm({...form,[k]:e.target.value})}
                        style={{ width:'100%', padding:'10px 13px', borderRadius:10, border:`1.5px solid ${formErr[k]?'#ef4444':'#e5e7eb'}`, fontSize:14, outline:'none', boxSizing:'border-box' }}/>
                      {formErr[k] && <p style={{ fontSize:12, color:'#ef4444', margin:'4px 0 0' }}>{formErr[k]}</p>}
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:5 }}>Phone (optional)</label>
                  <input type="tel" value={form.phone} placeholder="10-digit number" onChange={e=>setForm({...form,phone:e.target.value})}
                    style={{ width:'100%', padding:'10px 13px', borderRadius:10, border:`1.5px solid ${formErr.phone?'#ef4444':'#e5e7eb'}`, fontSize:14, outline:'none', boxSizing:'border-box' }}/>
                </div>
                <div style={{ marginBottom:22 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:5 }}>Message *</label>
                  <textarea rows={4} value={form.message} placeholder="How can we help?" onChange={e=>setForm({...form,message:e.target.value})}
                    style={{ width:'100%', padding:'10px 13px', borderRadius:10, border:`1.5px solid ${formErr.message?'#ef4444':'#e5e7eb'}`, fontSize:14, outline:'none', resize:'none', boxSizing:'border-box' }}/>
                  {formErr.message && <p style={{ fontSize:12, color:'#ef4444', margin:'4px 0 0' }}>{formErr.message}</p>}
                </div>
                <div style={{ display:'flex', gap:12 }}>
                  <button type="button" onClick={()=>setContactOpen(false)} style={{ flex:1, padding:'13px', borderRadius:12, border:'2px solid #e5e7eb', background:'white', fontSize:14, fontWeight:700, color:'#374151', cursor:'pointer' }}>Cancel</button>
                  <button type="submit" disabled={sending} style={{ flex:1, padding:'13px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#16a34a,#059669)', fontSize:14, fontWeight:700, color:'white', cursor:sending?'not-allowed':'pointer', opacity:sending?0.7:1 }}>
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── FLOATING HELP BUTTON ── */}
      <div style={{ position:'fixed', bottom:30, right:30, zIndex:999 }}>
        {showHelpMenu && (
          <div style={{ position:'absolute', bottom:80, right:0, width:320, background:'white', borderRadius:20, boxShadow:'0 20px 60px rgba(0,0,0,0.3)', border:'1px solid #e5e7eb', overflow:'hidden', animation:'slideUp 0.3s ease' }}>
            <div style={{ padding:'18px 20px', background:'linear-gradient(135deg,#15803d,#059669)', color:'white', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <HelpCircle size={22}/>
                <span style={{ fontWeight:700, fontSize:16 }}>{t?.helpTitle||'Help & Guide'}</span>
              </div>
              <button onClick={()=>setShowHelpMenu(false)} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white' }}>
                <X size={18}/>
              </button>
            </div>
            <div style={{ padding:'12px' }}>
              {helpOptions.map((option,index)=>(
                <Link key={index} to={option.path}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', textDecoration:'none', color:'#374151', borderRadius:12, transition:'all 0.2s', marginBottom:4 }}
                  onMouseEnter={e=>e.currentTarget.style.background='#f3f4f6'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  onClick={()=>setShowHelpMenu(false)}
                >
                  <span style={{ width:36, height:36, background:option.bg, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                    {option.icon}
                  </span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{option.label}</div>
                    <div style={{ fontSize:11, color:'#6b7280' }}>{option.desc}</div>
                  </div>
                  <ChevronRight size={16} color="#9ca3af"/>
                </Link>
              ))}
            </div>
            <div style={{ padding:'12px 16px', borderTop:'1px solid #e5e7eb', background:'#f9fafb', fontSize:12, color:'#6b7280', textAlign:'center' }}>
              {t?.helpContact||'Need more help? Contact support@agriconnect.in'}
            </div>
          </div>
        )}
        <button onClick={()=>setShowHelpMenu(!showHelpMenu)}
          style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 24px', background:'linear-gradient(135deg,#15803d,#059669)', color:'white', borderRadius:'50px', boxShadow:'0 10px 30px rgba(21,128,61,0.4)', border:'1px solid rgba(255,255,255,0.2)', backdropFilter:'blur(10px)', transition:'all 0.3s ease', cursor:'pointer', fontWeight:700, fontSize:16 }}
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.05)';e.currentTarget.style.boxShadow='0 15px 40px rgba(21,128,61,0.6)';}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 10px 30px rgba(21,128,61,0.4)';}}
        >
          <span style={{ display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, background:'rgba(255,255,255,0.2)', borderRadius:'50%', fontSize:18, fontWeight:'bold' }}>?</span>
          <span>{t?.helpBtn||'Help'}</span>
          <ChevronRight size={18}/>
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}