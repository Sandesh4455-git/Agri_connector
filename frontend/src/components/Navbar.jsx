// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LogoutModal from './LogoutModal';
import {
  Sprout, LogOut, Bell, User, ChevronDown,
  CheckCheck, X, Clock,
  Handshake, TrendingUp, Package, AlertCircle, Info, ExternalLink,
  Globe,
} from 'lucide-react';

const API      = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');

const NOTIF_CONFIG = {
  deal:    { color: '#16a34a', bg: '#f0fdf4', icon: <Handshake   size={14} /> },
  crop:    { color: '#d97706', bg: '#fef3c7', icon: <Package     size={14} /> },
  price:   { color: '#2563eb', bg: '#dbeafe', icon: <TrendingUp  size={14} /> },
  alert:   { color: '#dc2626', bg: '#fee2e2', icon: <AlertCircle size={14} /> },
  info:    { color: '#7c3aed', bg: '#ede9fe', icon: <Info        size={14} /> },
  default: { color: '#6b7280', bg: '#f3f4f6', icon: <Bell        size={14} /> },
};

const getInitials = (name = '') =>
  name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m    = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ── Responsive hook ───────────────────────────────────────────
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
};

const Navbar = () => {
  const { user, logout }             = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate                     = useNavigate();
  const isMobile                     = useIsMobile();

  const [notifOpen,       setNotifOpen]       = useState(false);
  const [profileOpen,     setProfileOpen]     = useState(false);
  const [langOpen,        setLangOpen]        = useState(false);
  const [notifications,   setNotifications]   = useState([]);
  const [loadingNotif,    setLoadingNotif]    = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const langRef    = useRef(null);

  const unread   = notifications.filter(n => !n.read && !n.isRead).length;
  const rolePath = (user?.role || 'farmer').toLowerCase();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (langRef.current    && !langRef.current.contains(e.target))    setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const token = getToken();
    if (!token) return;
    setLoadingNotif(true);
    try {
      const res  = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setNotifications(data.data);
    } catch { /* silent */ }
    finally { setLoadingNotif(false); }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    try {
      await fetch(`${API}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch { /* silent */ }
  };

  const markOneRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n));
    try {
      await fetch(`${API}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch { /* silent */ }
  };

  const deleteOne = async (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await fetch(`${API}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch { /* silent */ }
  };

  const handleLogoutClick = () => {
    setProfileOpen(false);
    setNotifOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const goTo = (path) => {
    setNotifOpen(false);
    setProfileOpen(false);
    navigate(path);
  };

  const LANG_LABELS = { en: 'EN', hi: 'हि', mr: 'म' };

  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .nav-drop   { animation: dropIn .18s cubic-bezier(.22,1,.36,1) both; }
        .nav-scroll::-webkit-scrollbar { width: 4px; }
        .nav-scroll::-webkit-scrollbar-thumb { background: #d1fae5; border-radius: 4px; }
        .nav-del    { opacity: 0; transition: opacity .15s; }
        .nav-row:hover .nav-del { opacity: 1; }
        .nav-row:hover { background: #f0fdf4 !important; }
        .icon-btn { transition: all .18s; }
        .icon-btn:hover { background: #f0fdf4 !important; border-color: #86efac !important; color: #15803d !important; }
      `}</style>

      <nav style={{
        background: 'white',
        boxShadow: '0 1px 12px rgba(0,0,0,.08)',
        position: 'sticky', top: 0, zIndex: 100,
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: isMobile ? '0 12px 0 56px' : '0 20px',
          height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <Link to={`/${rolePath}`} style={{ display:'flex', alignItems:'center', gap:7, textDecoration:'none' }}>
            <Sprout size={22} color="#16a34a" />
            {!isMobile && (
              <span style={{ fontSize:17, fontWeight:800, color:'#15803d', fontFamily:'Georgia,serif' }}>
                Agri Connect
              </span>
            )}
          </Link>

          {/* Right controls */}
          <div style={{ display:'flex', alignItems:'center', gap: isMobile ? 6 : 10 }}>

            {/* Language — desktop: full select | mobile: icon toggle */}
            {!isMobile ? (
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{
                  padding:'6px 10px', border:'1.5px solid #e5e7eb', borderRadius:8,
                  fontSize:13, outline:'none', background:'white', cursor:'pointer',
                }}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </select>
            ) : (
              <div style={{ position:'relative' }} ref={langRef}>
                <button
                  className="icon-btn"
                  onClick={() => setLangOpen(o => !o)}
                  style={{
                    padding:'7px 9px', borderRadius:9, border:'1.5px solid #e5e7eb',
                    background:'white', cursor:'pointer', display:'flex', alignItems:'center',
                    gap:4, color:'#6b7280', fontSize:12, fontWeight:700,
                  }}
                >
                  <Globe size={15} />
                  {LANG_LABELS[language]}
                </button>
                {langOpen && (
                  <div className="nav-drop" style={{
                    position:'absolute', right:0, top:'calc(100% + 6px)',
                    background:'white', border:'1px solid #e5e7eb', borderRadius:12,
                    boxShadow:'0 10px 30px rgba(0,0,0,.12)', zIndex:200, overflow:'hidden', minWidth:130,
                  }}>
                    {[['en','English'],['hi','हिंदी'],['mr','मराठी']].map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => { setLanguage(val); setLangOpen(false); }}
                        style={{
                          display:'block', width:'100%', textAlign:'left',
                          padding:'10px 16px', background: language === val ? '#f0fdf4' : 'white',
                          color: language === val ? '#15803d' : '#374151',
                          border:'none', fontSize:13, fontWeight: language === val ? 700 : 500,
                          cursor:'pointer',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── NOTIFICATION BELL ── */}
            <div style={{ position:'relative' }} ref={notifRef}>
              <button
                className="icon-btn"
                onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); setLangOpen(false); }}
                style={{
                  position:'relative', padding:'7px 8px', borderRadius:9,
                  border:`1.5px solid ${notifOpen ? '#86efac' : '#e5e7eb'}`,
                  background: notifOpen ? '#f0fdf4' : 'white',
                  cursor:'pointer', display:'flex', alignItems:'center',
                  color: notifOpen ? '#15803d' : '#6b7280',
                }}
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span style={{
                    position:'absolute', top:-5, right:-5,
                    minWidth:17, height:17, padding:'0 3px',
                    background:'#ef4444', color:'white',
                    fontSize:9, fontWeight:800, borderRadius:999,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    border:'2px solid white',
                  }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="nav-drop" style={{
                  position:'absolute', right: isMobile ? -60 : 0, top:'calc(100% + 8px)',
                  width: isMobile ? 'calc(100vw - 24px)' : 360,
                  maxWidth: 380,
                  background:'white', borderRadius:16, border:'1px solid #e5e7eb',
                  boxShadow:'0 12px 40px rgba(0,0,0,.14)', zIndex:200, overflow:'hidden',
                }}>
                  {/* Header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background:'linear-gradient(135deg,#f0fdf4,#ecfdf5)', borderBottom:'1px solid #d1fae5' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Bell size={13} color="#16a34a" />
                      <span style={{ fontWeight:700, fontSize:13, color:'#111827' }}>Notifications</span>
                      {unread > 0 && (
                        <span style={{ padding:'1px 7px', background:'#fee2e2', color:'#dc2626', fontSize:11, fontWeight:700, borderRadius:999 }}>
                          {unread} new
                        </span>
                      )}
                    </div>
                    {unread > 0 && (
                      <button onClick={markAllRead} style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 8px', fontSize:11, fontWeight:600, color:'#15803d', background:'white', border:'1px solid #86efac', borderRadius:7, cursor:'pointer' }}>
                        <CheckCheck size={11} /> Mark all read
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="nav-scroll" style={{ maxHeight:300, overflowY:'auto' }}>
                    {loadingNotif ? (
                      <div style={{ textAlign:'center', padding:'28px 0', color:'#9ca3af', fontSize:13 }}>Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'36px 20px' }}>
                        <p style={{ fontSize:32, margin:'0 0 8px' }}>🔔</p>
                        <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 4px' }}>All caught up!</p>
                        <p style={{ fontSize:12, color:'#9ca3af', margin:0 }}>No notifications right now</p>
                      </div>
                    ) : notifications.map(n => {
                      const cfg    = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.default;
                      const isRead = n.read || n.isRead;
                      return (
                        <div
                          key={n.id}
                          className="nav-row"
                          onClick={() => markOneRead(n.id)}
                          style={{
                            display:'flex', alignItems:'flex-start', gap:10,
                            padding:'10px 14px', borderBottom:'1px solid #f9fafb',
                            cursor:'pointer', background: isRead ? 'white' : '#f0fdf4',
                            transition:'background .15s',
                          }}
                        >
                          <div style={{ width:30, height:30, borderRadius:9, background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:cfg.color }}>
                            {cfg.icon}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:12, fontWeight:700, color:'#111827', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {n.title}
                            </p>
                            <p style={{ fontSize:12, color:'#6b7280', margin:'0 0 4px', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                              {n.message}
                            </p>
                            <p style={{ fontSize:10, color:'#9ca3af', margin:0, display:'flex', alignItems:'center', gap:3 }}>
                              <Clock size={9} /> {n.createdAt ? timeAgo(n.createdAt) : n.time || ''}
                            </p>
                          </div>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0 }}>
                            {!isRead && <div style={{ width:7, height:7, borderRadius:'50%', background:'#16a34a' }} />}
                            <button
                              className="nav-del"
                              onClick={(e) => deleteOne(e, n.id)}
                              style={{ padding:2, background:'none', border:'none', cursor:'pointer', color:'#d1d5db', borderRadius:4 }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div style={{ padding:'10px 12px', borderTop:'1px solid #f3f4f6', background:'#fafafa' }}>
                    <button
                      onClick={() => goTo(`/${rolePath}/notifications`)}
                      style={{ width:'100%', padding:'9px', background:'white', border:'1.5px solid #d1fae5', borderRadius:10, fontSize:13, fontWeight:600, color:'#15803d', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
                    >
                      View all <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── PROFILE ── */}
            <div style={{ position:'relative' }} ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); setLangOpen(false); }}
                style={{
                  display:'flex', alignItems:'center', gap: isMobile ? 6 : 8,
                  padding: isMobile ? '5px 8px 5px 5px' : '5px 12px 5px 5px',
                  border:`1.5px solid ${profileOpen ? '#86efac' : '#e5e7eb'}`,
                  borderRadius:10, background: profileOpen ? '#f0fdf4' : 'white',
                  cursor:'pointer', transition:'all .18s',
                }}
              >
                <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#15803d,#059669)', color:'white', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {getInitials(user?.name)}
                </div>
                {!isMobile && (
                  <span style={{ fontSize:13, fontWeight:700, color:'#374151', maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {user?.name || user?.username || 'User'}
                  </span>
                )}
                <ChevronDown size={12} color="#9ca3af" style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)', transition:'transform .2s' }} />
              </button>

              {profileOpen && (
                <div className="nav-drop" style={{
                  position:'absolute', right:0, top:'calc(100% + 8px)',
                  width: isMobile ? 'min(260px, calc(100vw - 24px))' : 240,
                  background:'white', borderRadius:16, border:'1px solid #e5e7eb',
                  boxShadow:'0 12px 40px rgba(0,0,0,.14)', zIndex:200, overflow:'hidden',
                }}>
                  {/* User info */}
                  <div style={{ padding:'14px 16px', background:'linear-gradient(135deg,#f0fdf4,#ecfdf5)', borderBottom:'1px solid #d1fae5' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#15803d,#059669)', color:'white', fontSize:15, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {getInitials(user?.name)}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:700, color:'#111827', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {user?.name || 'User'}
                        </p>
                        <p style={{ fontSize:11, color:'#6b7280', margin:'0 0 4px' }}>@{user?.username || 'user'}</p>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', background:'#dcfce7', color:'#15803d', borderRadius:999, textTransform:'capitalize' }}>
                          {rolePath}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding:'6px 0' }}>
                    <button
                      onClick={() => goTo(`/${rolePath}/profile`)}
                      style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', transition:'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background='none'}
                    >
                      <div style={{ width:30, height:30, borderRadius:8, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <User size={14} color="#15803d" />
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 1px' }}>My Profile</p>
                        <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>View & edit profile</p>
                      </div>
                    </button>

                    <div style={{ margin:'4px 12px', borderTop:'1px solid #f3f4f6' }} />

                    <button
                      onClick={handleLogoutClick}
                      style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', transition:'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.background='none'}
                    >
                      <div style={{ width:30, height:30, borderRadius:8, background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <LogOut size={14} color="#ef4444" />
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:'#ef4444', margin:'0 0 1px' }}>{t?.logout || 'Logout'}</p>
                        <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>Sign out of account</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
        userName={user?.name}
      />
    </>
  );
};

export default Navbar;