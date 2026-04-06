// src/pages/HelpGuide.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Play, X, Volume2, ChevronRight, BookOpen, Users, ShoppingBag, Store,
  LogIn, UserPlus, HelpCircle, CheckCircle, ChevronDown, ChevronUp,
  Sprout, ArrowLeft, Search
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

// ══════════════════════════════════════════════════════════════════
// TUTORIAL DATA
// ══════════════════════════════════════════════════════════════════
const tutorialData = {
  intro: {
    id: 'intro',
    title: 'Introduction of Agri Connect',
    icon: '🌟',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    description: "Learn about Agri Connect — India's trusted agricultural marketplace connecting farmers, dealers, and customers.",
    video: null,
    thumbnail: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600',
    steps: [
      { step: 1, title: 'What is Agri Connect?',  desc: 'Agri Connect is a digital marketplace where farmers can sell crops directly to dealers and customers — no middlemen, no exploitation.' },
      { step: 2, title: 'Who can use it?',         desc: 'Farmers, Dealers, and Customers can all register and start trading on the platform for free.' },
      { step: 3, title: 'Why Agri Connect?',       desc: 'Get better prices, real-time market data, government scheme info, and secure payments — all in one place.' },
      { step: 4, title: 'Is it free to join?',     desc: 'Yes! Registration is completely free for all users.' },
    ],
    faqs: [
      { q: 'Is Agri Connect free to use?',     a: 'Yes, registration and basic features are completely free.' },
      { q: 'Which languages are supported?',   a: 'English, हिंदी, and मराठी are currently supported.' },
      { q: 'Is my data secure?',               a: 'Yes, all data is encrypted and stored securely.' },
    ],
  },

  login: {
    id: 'login',
    title: 'Login Process',
    icon: '🔐',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    description: 'Step-by-step guide to login to your Agri Connect account.',
    video: null,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
    steps: [
      { step: 1, title: 'Go to Login Page',    desc: 'Click the "Login" button on the top right of the homepage, or visit /login directly.' },
      { step: 2, title: 'Select Your Role',    desc: 'Choose whether you are a Farmer, Dealer, Customer, or Admin from the role selector.' },
      { step: 3, title: 'Enter Credentials',  desc: 'Type your registered username/email and password in the fields provided.' },
      { step: 4, title: 'Click Login',         desc: 'Press the Login button. You will be redirected to your dashboard.' },
      { step: 5, title: 'Forgot Password?',    desc: 'If you forgot your password, click "Forgot Password" and follow the OTP verification steps.' },
    ],
    faqs: [
      { q: 'I forgot my password. What to do?', a: 'Click "Forgot Password" on the login page, enter your mobile/email, verify OTP, and set a new password.' },
      { q: 'Can I login from mobile?',           a: 'Yes, Agri Connect works on all devices including mobile browsers.' },
      { q: 'My login is failing. Why?',          a: 'Check your username/password carefully. Ensure you selected the correct role.' },
    ],
  },

  register: {
    id: 'register',
    title: 'Register Process',
    icon: '📝',
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#ddd6fe',
    description: 'How to create a new account on Agri Connect.',
    video: null,
    thumbnail: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=600',
    steps: [
      { step: 1, title: 'Click Register Free',   desc: 'On the homepage, click the green "Register Free" button in the top navigation bar.' },
      { step: 2, title: 'Choose Your Role',      desc: 'Select Farmer, Dealer, or Customer based on who you are.' },
      { step: 3, title: 'Fill in Your Details',  desc: 'Enter your full name, mobile number, email (optional), and a strong password.' },
      { step: 4, title: 'Submit Registration',   desc: 'Click "Register" and your account will be created immediately.' },
      { step: 5, title: 'Login to Dashboard',    desc: 'After registration, login with your credentials to access your dashboard.' },
    ],
    faqs: [
      { q: 'Can I change my role after registration?', a: 'No, roles cannot be changed after registration. Please contact admin if needed.' },
      { q: 'Is mobile number mandatory?',              a: 'Yes, mobile number is required for OTP verification and account security.' },
      { q: 'Can I have multiple accounts?',            a: 'No, one mobile number can only be used for one account.' },
    ],
  },

  farmer: {
    id: 'farmer',
    title: 'Farmer Panel Guide',
    icon: '👨‍🌾',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    description: 'Complete guide for farmers on how to use the Farmer Panel.',
    video: null,
    thumbnail: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600',
    steps: [
      { step: 1, title: 'Dashboard Overview',       desc: 'After login, your dashboard shows total crops, active deals, pending requests, and earnings at a glance.' },
      { step: 2, title: 'Add Your Crop',            desc: 'Go to "My Crops" → "Add New Crop". Fill in crop name, category, quantity, price per quintal, and location.' },
      { step: 3, title: 'Handle Requests',          desc: "When a dealer or customer sends a request for your crop, you'll see it in \"Requests\". You can Accept, Reject, or Negotiate." },
      { step: 4, title: 'Manage Deals & Payments',  desc: 'Accepted requests become Deals. Track payment status, amount received, and deal progress in the Payments section.' },
      { step: 5, title: 'Check Market Prices',      desc: 'Visit "Market Prices" to see live APMC mandi prices across Maharashtra — make better pricing decisions.' },
      { step: 6, title: 'Government Schemes',       desc: 'Browse PM-KISAN, PMFBY, SMAM and other schemes you may be eligible for. Apply directly from the platform.' },
      { step: 7, title: 'Analytics',                desc: 'View your revenue trends, top crops by earnings, deal completion rate, and more in the Analytics section.' },
    ],
    faqs: [
      { q: 'How do I list my crop?',                      a: 'Go to My Crops → Add New Crop and fill in the details. Your crop will be visible to dealers and customers.' },
      { q: 'How do I get paid?',                          a: 'Once a deal is completed, the dealer makes payment through the platform. You can track it in Payments.' },
      { q: 'Can I negotiate the price?',                  a: 'Yes! When you receive a request, you can counter-offer with your preferred price.' },
      { q: 'How do I check which schemes I qualify for?', a: 'Go to Government Schemes section — it shows schemes based on your profile and crop type.' },
    ],
  },

  dealer: {
    id: 'dealer',
    title: 'Dealer Panel Guide',
    icon: '🏪',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    description: 'How dealers can source crops and manage their business on Agri Connect.',
    video: null,
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
    steps: [
      { step: 1, title: 'Dashboard Overview',      desc: 'See monthly revenue, active orders, top suppliers, and business analytics at a glance on your dashboard.' },
      { step: 2, title: 'Browse Marketplace',      desc: 'Go to "Marketplace" to browse all available crops from verified farmers. Filter by crop, location, price, quantity.' },
      { step: 3, title: 'Send Request to Farmer',  desc: 'Click on a crop listing, review the details, and send a purchase request. You can also propose a different price.' },
      { step: 4, title: 'Manage Orders',           desc: 'Once a farmer accepts your request, it becomes an Order. Track delivery status in the Orders section.' },
      { step: 5, title: 'My Suppliers',            desc: "View all farmers you've worked with in My Suppliers. See their reliability rating and order history." },
      { step: 6, title: 'Make Payments',           desc: 'Go to Payments to clear pending payments to farmers. All transactions are recorded securely.' },
      { step: 7, title: 'Analytics',               desc: 'Track monthly spending, top crops purchased, farmer diversity, and more in Business Analytics.' },
    ],
    faqs: [
      { q: 'How do I find farmers near me?',         a: 'In Marketplace, you can filter by location/city to find farmers near your area.' },
      { q: 'Can I negotiate the price with farmer?', a: 'Yes! When sending a request, you can propose a different price than what the farmer listed.' },
      { q: 'How do I pay a farmer?',                 a: 'Go to Payments section, find the deal, and click Pay. You can use UPI, NEFT, or other methods.' },
      { q: 'What if I need to cancel an order?',     a: 'Contact the farmer directly through the deal chat, or reach out to support.' },
    ],
  },

  customer: {
    id: 'customer',
    title: 'Customer Panel Guide',
    icon: '🛒',
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#ddd6fe',
    description: 'Guide for customers to order fresh produce directly from farmers.',
    video: null,
    thumbnail: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600',
    steps: [
      { step: 1, title: 'Dashboard Overview',       desc: 'Your customer dashboard shows recent orders, available fresh crops nearby, and total spending.' },
      { step: 2, title: 'Browse Fresh Products',    desc: 'Go to "Browse Products" to see all available crops. Filter by crop type, location, price to find what you need.' },
      { step: 3, title: 'Send Request to Farmer',   desc: 'Click on any crop, review details, and click "Request". Specify quantity and your preferred price.' },
      { step: 4, title: 'Track Your Orders',        desc: 'Once the farmer accepts your request, track the order status in "My Orders" — from accepted to delivered.' },
      { step: 5, title: 'View Transactions',        desc: 'All payment history is available in "Transactions". You can see paid, pending, and failed transactions.' },
      { step: 6, title: 'Market Prices',            desc: 'Check live APMC market prices to understand fair pricing before placing orders.' },
    ],
    faqs: [
      { q: 'How fresh is the produce?',         a: 'Farmers list crops that are ready to harvest or recently harvested. You can see the listing date.' },
      { q: 'Can I order in small quantities?',  a: 'Yes! Unlike mandis, farmers can accept small quantity requests too.' },
      { q: 'How do I pay for my order?',        a: 'Once the farmer accepts, you can pay through UPI, NEFT, or other secure payment methods.' },
      { q: 'Can I cancel my request?',          a: 'Yes, you can cancel a request before the farmer accepts it.' },
    ],
  },
};

// ══════════════════════════════════════════════════════════════════
// VIDEO PLAYER COMPONENT (inline — no separate file needed)
// ══════════════════════════════════════════════════════════════════
function VideoPlayer({ src, title, thumbnail, duration }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', background: '#0f172a', position: 'relative' }}>
      {playing ? (
        <>
          <video
            src={src} controls autoPlay
            style={{ width: '100%', maxHeight: 340, display: 'block', background: '#000' }}
            onEnded={() => setPlaying(false)}
          />
          <button onClick={() => setPlaying(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 10 }}>
            <X size={16}/>
          </button>
        </>
      ) : (
        <div onClick={() => src && setPlaying(true)}
          style={{ position: 'relative', cursor: src ? 'pointer' : 'default', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: thumbnail ? 'transparent' : 'linear-gradient(135deg,#1e3a2f,#0f172a)' }}
        >
          {thumbnail && <img src={thumbnail} alt={title} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', opacity: 0.7 }}/>}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: src ? 'rgba(22,163,74,0.9)' : 'rgba(107,114,128,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: src ? '0 8px 28px rgba(22,163,74,0.5)' : 'none' }}
              onMouseEnter={e => src && (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Play size={26} color="white" style={{ marginLeft: 4 }}/>
            </div>
            {title && <p style={{ color: 'white', fontSize: 13, fontWeight: 700, textAlign: 'center', margin: 0, padding: '0 16px', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>{title}</p>}
            {!src && <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: 0 }}>Video coming soon</p>}
            {duration && src && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                <Volume2 size={13}/> {duration}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN HELP GUIDE PAGE
// ══════════════════════════════════════════════════════════════════
export default function HelpGuide() {
  const { t } = useLanguage();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('intro');
  const [openFaq,       setOpenFaq]       = useState(null);
  const [search,        setSearch]        = useState('');

  // Hash-based navigation: /help#farmer etc.
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && tutorialData[hash]) setActiveSection(hash);
  }, [location.hash]);

  const sections = [
    { id: 'intro',    icon: '🌟', label: t?.helpIntro    || 'Introduction',   color: '#16a34a' },
    { id: 'login',    icon: '🔐', label: t?.helpLogin    || 'Login Process',  color: '#2563eb' },
    { id: 'register', icon: '📝', label: t?.helpRegister || 'Register',       color: '#7c3aed' },
    { id: 'farmer',   icon: '👨‍🌾', label: t?.helpFarmer  || 'Farmer Panel',   color: '#16a34a' },
    { id: 'dealer',   icon: '🏪', label: t?.helpDealer   || 'Dealer Panel',   color: '#2563eb' },
    { id: 'customer', icon: '🛒', label: t?.helpCustomer || 'Customer Panel', color: '#7c3aed' },
  ];

  const current = tutorialData[activeSection];

  const filteredSteps = search
    ? current.steps.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase()))
    : current.steps;

  const filteredFaqs = search
    ? current.faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
    : current.faqs;

  const S = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg,#f0fdf4 0%,#fefce8 50%,#f0fdf4 100%)', fontFamily: "'Nunito',system-ui,sans-serif" },
    card: { background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' },
  };

  const changeSection = (id) => { setActiveSection(id); setOpenFaq(null); setSearch(''); window.scrollTo(0, 0); };

  return (
    <div style={S.page}>

      {/* ── TOP NAV ── */}
      <div style={{ background: 'linear-gradient(135deg,#15803d,#059669)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 10 }}><Sprout size={20} color="white"/></div>
          <span style={{ color: 'white', fontWeight: 900, fontSize: 18 }}>Agri Connect</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>/ Help & Guide</span>
        </div>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
          <ArrowLeft size={16}/> Back to Home
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── SIDEBAR ── */}
        <div style={{ position: 'sticky', top: 20 }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search help..."
              style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          {/* Section nav */}
          <div style={{ ...S.card, padding: 12, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px', padding: '0 8px' }}>Topics</p>
            {sections.map(sec => (
              <button key={sec.id} onClick={() => changeSection(sec.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left',
                background: activeSection === sec.id ? `${sec.color}15` : 'transparent',
                color: activeSection === sec.id ? sec.color : '#374151',
                fontWeight: activeSection === sec.id ? 800 : 600,
                fontSize: 14, transition: 'all .15s', marginBottom: 2,
                borderLeft: activeSection === sec.id ? `3px solid ${sec.color}` : '3px solid transparent',
                fontFamily: 'inherit',
              }}>
                <span style={{ fontSize: 18 }}>{sec.icon}</span>
                <span style={{ flex: 1 }}>{sec.label}</span>
                {activeSection === sec.id && <ChevronRight size={14}/>}
              </button>
            ))}
          </div>

          {/* Quick links */}
          <div style={{ ...S.card, background: 'linear-gradient(135deg,#15803d,#059669)', border: 'none' }}>
            <h4 style={{ color: 'white', fontWeight: 800, fontSize: 14, margin: '0 0 12px' }}>🔗 Quick Links</h4>
            {[
              { to: '/login',    label: 'Login Now',     icon: <LogIn size={13}/>     },
              { to: '/register', label: 'Register Free', icon: <UserPlus size={13}/>  },
            ].map(({ to, label, icon }) => (
              <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, marginBottom: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: 10 }}>
                {icon} {label} <ChevronRight size={12} style={{ marginLeft: 'auto' }}/>
              </Link>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div>

          {/* Section Header */}
          <div style={{ ...S.card, marginBottom: 20, borderLeft: `4px solid ${current.color}`, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: current.bg, border: `1.5px solid ${current.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                {sections.find(s => s.id === activeSection)?.icon}
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>{current.title}</h1>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0', lineHeight: 1.5 }}>{current.description}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: current.bg, color: current.color }}>
                {filteredSteps.length} Steps
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: '#fef3c7', color: '#d97706' }}>
                {filteredFaqs.length} FAQs
              </span>
            </div>
          </div>

          {/* Video / Thumbnail */}
          <div style={{ marginBottom: 20 }}>
            <VideoPlayer src={current.video} title={current.title} thumbnail={current.thumbnail} duration="3:45"/>
          </div>

          {/* Steps */}
          <div style={{ ...S.card, marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} color={current.color}/> Step-by-Step Guide
            </h2>
            {filteredSteps.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No steps match your search.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {filteredSteps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 16, paddingBottom: idx < filteredSteps.length - 1 ? 20 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${current.color},${current.color}cc)`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, boxShadow: `0 4px 12px ${current.color}30`, zIndex: 1 }}>
                        {step.step}
                      </div>
                      {idx < filteredSteps.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: `${current.color}25`, marginTop: 6 }}/>
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: idx < filteredSteps.length - 1 ? 16 : 0 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '6px 0 6px' }}>{step.title}</h3>
                      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAQs */}
          <div style={{ ...S.card, marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={18} color={current.color}/> Frequently Asked Questions
            </h2>
            {filteredFaqs.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No FAQs match your search.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredFaqs.map((faq, idx) => (
                  <div key={idx} style={{ borderRadius: 14, border: `1.5px solid ${openFaq === idx ? current.border : '#e5e7eb'}`, overflow: 'hidden', transition: 'all .2s' }}>
                    <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: openFaq === idx ? current.bg : 'white', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 700, color: openFaq === idx ? current.color : '#0f172a', flex: 1, marginRight: 12 }}>{faq.q}</span>
                      {openFaq === idx ? <ChevronUp size={16} color={current.color}/> : <ChevronDown size={16} color="#9ca3af"/>}
                    </button>
                    {openFaq === idx && (
                      <div style={{ padding: '0 18px 16px', background: current.bg }}>
                        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Support Banner */}
          <div style={{ ...S.card, background: 'linear-gradient(135deg,#0f172a,#1e3a2f)', border: 'none', marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'white', fontWeight: 800, fontSize: 16, margin: '0 0 6px' }}>Need Personal Assistance?</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '0 0 16px' }}>Our support team is available to help you with any questions.</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[['📧', 'support@agriconnect.in'],['📱', '+91 98765 43210']].map(([ico, txt]) => (
                    <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: 10 }}>
                      <span>{ico}</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{txt}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 52 }}>🤝</div>
            </div>
          </div>

          {/* Prev / Next Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            {(() => {
              const idx = sections.findIndex(s => s.id === activeSection);
              const prev = sections[idx - 1];
              const next = sections[idx + 1];
              return (
                <>
                  {prev ? (
                    <button onClick={() => changeSection(prev.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 14, border: '2px solid #e5e7eb', background: 'white', fontSize: 14, fontWeight: 700, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <ArrowLeft size={16}/> {prev.label}
                    </button>
                  ) : <div/>}
                  {next ? (
                    <button onClick={() => changeSection(next.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg,${next.color},${next.color}cc)`, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: `0 4px 16px ${next.color}30`, fontFamily: 'inherit' }}>
                      {next.label} <ChevronRight size={16}/>
                    </button>
                  ) : <div/>}
                </>
              );
            })()}
          </div>

        </div>
      </div>
    </div>
  );
}