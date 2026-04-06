import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, Shield,
  Save, Edit, Loader2, RefreshCw, CheckCircle,
  Package, TrendingUp, Handshake, X, Lock,
  Bell, Trash2, Eye, EyeOff, AlertTriangle, Leaf
} from 'lucide-react';

const API_URL = 'http://localhost:8080/api/profile';
const AUTH_URL = 'http://localhost:8080/api/auth';
const getToken = () => localStorage.getItem('agri_connect_token');

const FarmerProfile = () => {
  const { t } = useLanguage();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('profile');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    newRequests: true, dealUpdates: true, paymentAlerts: true,
    marketPrices: false, newSchemes: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', city: '', state: '',
    farmSize: '', experience: '', address: ''
  });

  useEffect(() => {
    fetchProfile();
    const saved = localStorage.getItem('agri_notif_settings');
    if (saved) setNotifSettings(JSON.parse(saved));
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setFormData({
          name: data.data.name || '', email: data.data.email || '',
          city: data.data.city || '', state: data.data.state || '',
          farmSize: data.data.farmSize || '', experience: data.data.experience || '',
          address: data.data.address || '',
        });
      }
    } catch (err) { showToast('❌ Failed to load profile', 'error'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { showToast('❌ Name cannot be empty', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setProfile(prev => ({ ...prev, ...formData }));
        setIsEditing(false);
        showToast('✅ Profile updated successfully!');
      } else showToast('❌ ' + data.message, 'error');
    } catch { showToast('❌ Something went wrong', 'error'); }
    finally { setSaving(false); }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '', email: profile?.email || '',
      city: profile?.city || '', state: profile?.state || '',
      farmSize: profile?.farmSize || '', experience: profile?.experience || '',
      address: profile?.address || '',
    });
    setIsEditing(false);
  };

  const validatePassword = () => {
    const errors = {};
    if (!pwForm.oldPassword) errors.oldPassword = 'Current password is required';
    if (!pwForm.newPassword) errors.newPassword = 'New password is required';
    else if (pwForm.newPassword.length < 6) errors.newPassword = 'At least 6 characters required';
    else if (pwForm.newPassword === pwForm.oldPassword) errors.newPassword = 'Must be different from current password';
    if (!pwForm.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (pwForm.newPassword !== pwForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setPwErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    setPwLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword })
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Password changed successfully!');
        setShowPasswordModal(false);
        setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPwErrors({});
      } else showToast('❌ ' + data.message, 'error');
    } catch { showToast('❌ Something went wrong', 'error'); }
    finally { setPwLoading(false); }
  };

  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    await new Promise(r => setTimeout(r, 600));
    localStorage.setItem('agri_notif_settings', JSON.stringify(notifSettings));
    setNotifSaving(false);
    setShowNotifModal(false);
    showToast('✅ Notification settings saved!');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== profile?.username) { showToast('❌ Username does not match', 'error'); return; }
    setDeleteLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/delete-account`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Account deleted. Logging out...');
        setTimeout(() => { logout(); navigate('/login'); }, 2000);
      } else showToast('❌ ' + data.message, 'error');
    } catch { showToast('❌ Something went wrong', 'error'); }
    finally { setDeleteLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3500);
  };

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch { return 'N/A'; }
  };

  const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const getStrength = (pw) => {
    if (!pw) return { label: '', color: '', pct: 0 };
    if (pw.length < 6) return { label: 'Weak', color: '#ef4444', pct: 25 };
    if (pw.length < 8) return { label: 'Fair', color: '#f59e0b', pct: 50 };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return { label: 'Strong', color: '#10b981', pct: 100 };
    return { label: 'Good', color: '#3b82f6', pct: 75 };
  };

  const strength = getStrength(pwForm.newPassword);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0fdf4' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid #dcfce7', borderTop: '3px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ color: '#6b7280', fontSize: 13, fontFamily: 'system-ui' }}>Loading your profile...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const S = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)',
      padding: 'clamp(12px, 3vw, 20px)',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      boxSizing: 'border-box',
      width: '100%',
      overflowX: 'hidden',
    },
    card: {
      background: 'white',
      borderRadius: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      border: '1px solid rgba(220, 252, 231, 0.8)',
      width: '100%',
      boxSizing: 'border-box',
    },
    profileBanner: {
      background: 'linear-gradient(135deg, #15803d 0%, #059669 50%, #0d9488 100%)',
      padding: '24px 20px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    bannerPattern: {
      position: 'absolute', inset: 0,
      backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)',
    },
    avatar: {
      width: 68, height: 68, borderRadius: '50%',
      background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 10px', fontSize: 24, fontWeight: 700, color: 'white',
      backdropFilter: 'blur(10px)', position: 'relative', zIndex: 1,
    },
    profileName: { fontSize: 18, fontWeight: 700, color: 'white', margin: '0 0 3px', position: 'relative', zIndex: 1 },
    profileRole: { fontSize: 12, color: 'rgba(255,255,255,0.75)', position: 'relative', zIndex: 1, fontFamily: 'system-ui' },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: 20,
      fontSize: 10, color: 'white', marginTop: 8, backdropFilter: 'blur(4px)', fontFamily: 'system-ui',
    },
    statsRow: {
      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
      padding: '14px', borderBottom: '1px solid #f3f4f6',
    },
    statBox: { background: '#f9fafb', borderRadius: 10, padding: '10px 6px', textAlign: 'center', border: '1px solid #f3f4f6' },
    statVal: { fontSize: 16, fontWeight: 700, color: '#111827', display: 'block' },
    statLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2, fontFamily: 'system-ui' },
    infoList: { padding: '14px' },
    infoItem: {
      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px',
      borderRadius: 9, marginBottom: 5, background: '#f9fafb',
      fontSize: 12, color: '#374151', fontFamily: 'system-ui',
    },
    quickActions: { padding: '14px', borderTop: '1px solid #f3f4f6' },
    qaTitle: { fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontFamily: 'system-ui' },
    qaBtn: (color, bg) => ({
      width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px',
      borderRadius: 11, border: 'none', background: bg, color, fontSize: 12, fontWeight: 600,
      cursor: 'pointer', marginBottom: 7, transition: 'all 0.2s', fontFamily: 'system-ui', textAlign: 'left',
    }),
    tabBar: { display: 'flex', gap: 4, padding: '4px', background: '#f3f4f6', borderRadius: 12, marginBottom: 16 },
    tab: (active) => ({
      flex: 1, padding: '7px 12px', borderRadius: 9, border: 'none',
      background: active ? 'white' : 'transparent', color: active ? '#15803d' : '#6b7280',
      fontSize: 12, fontWeight: active ? 600 : 500, cursor: 'pointer',
      transition: 'all 0.2s', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
      fontFamily: 'system-ui',
    }),
    sectionCard: {
      background: 'white', borderRadius: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      border: '1px solid rgba(220, 252, 231, 0.8)',
      padding: '18px', marginBottom: 14, boxSizing: 'border-box', width: '100%',
    },
    sectionTitle: { fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
    label: { display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'system-ui' },
    input: (editing, error) => ({
      width: '100%', padding: '9px 12px',
      border: `1.5px solid ${error ? '#ef4444' : editing ? '#86efac' : '#e5e7eb'}`,
      borderRadius: 9, fontSize: 13, color: editing ? '#111827' : '#9ca3af',
      background: editing ? 'white' : '#fafafa', outline: 'none',
      transition: 'all 0.2s', boxSizing: 'border-box', fontFamily: 'system-ui',
      cursor: editing ? 'text' : 'not-allowed',
    }),
    editBtn: { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'linear-gradient(135deg, #15803d, #059669)', color: 'white', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui' },
    saveBtn: { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'linear-gradient(135deg, #15803d, #059669)', color: 'white', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui' },
    cancelBtn: { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: 'white', color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: 'pointer', marginRight: 7, fontFamily: 'system-ui' },
    securityRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 11, marginBottom: 9, background: '#f9fafb', border: '1px solid #f3f4f6', gap: 10, flexWrap: 'wrap' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16, backdropFilter: 'blur(4px)' },
    modalBox: { background: 'white', borderRadius: 18, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
    modalHeader: (color) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${color}` }),
    modalBody: { padding: '20px' },
    modalInput: (err) => ({ width: '100%', padding: '10px 38px 10px 12px', border: `1.5px solid ${err ? '#ef4444' : '#e5e7eb'}`, borderRadius: 9, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui' }),
    modalPrimary: (color) => ({ flex: 1, padding: '11px', background: `linear-gradient(135deg, ${color}, ${color}dd)`, color: 'white', border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'system-ui' }),
    modalSecondary: { flex: 1, padding: '11px', background: 'white', color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: 11, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'system-ui' },
    toast: (type) => ({ position: 'fixed', top: 16, right: 16, zIndex: 100, padding: '11px 18px', borderRadius: 11, fontSize: 13, fontWeight: 500, background: 'white', border: `1.5px solid ${type === 'success' ? '#86efac' : '#fca5a5'}`, color: type === 'success' ? '#15803d' : '#dc2626', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontFamily: 'system-ui', maxWidth: 'calc(100vw - 32px)' }),
  };

  return (
    <main style={S.page}>
      <style>{`
        * { box-sizing: border-box; }
        .profile-grid { display: grid; grid-template-columns: 1fr; gap: 14px; width: 100%; }
        .form-grid { display: grid; grid-template-columns: 1fr; gap: 10px; width: 100%; }
        @media (min-width: 640px) {
          .form-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 900px) {
          .profile-grid { grid-template-columns: 260px 1fr; }
        }
        .qa-btn:hover { filter: brightness(0.95); transform: translateX(2px); }
        .refresh-btn:hover { background: #f0fdf4 !important; }
        input:focus, textarea:focus { border-color: #86efac !important; box-shadow: 0 0 0 3px rgba(134,239,172,0.2); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {toast.show && <div style={S.toast(toast.type)}>{toast.msg}</div>}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, color: '#14532d', margin: 0, letterSpacing: '-0.5px' }}>{t.myProfile}</h1>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 3, fontFamily: 'system-ui' }}>{t.manageFarmerAccount}</p>
        </div>
        <button className="refresh-btn" onClick={fetchProfile} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'white', border: '1px solid #d1fae5', borderRadius: 10, color: '#16a34a', fontSize: 12, cursor: 'pointer', fontFamily: 'system-ui', fontWeight: 500 }}>
          <RefreshCw size={13} /> {t.refresh}
        </button>
      </div>

      <div className="profile-grid">
        {/* LEFT COLUMN */}
        <div>
          <div style={S.card}>
            <div style={S.profileBanner}>
              <div style={S.bannerPattern} />
              <div style={S.avatar}>{getInitials(profile?.name)}</div>
              <h2 style={S.profileName}>{profile?.name}</h2>
              <p style={S.profileRole}>{profile?.role?.toLowerCase()} {profile?.city ? `• ${profile.city}` : ''}</p>
              <div style={{ position: 'relative', zIndex: 1 }}>
                {profile?.verified && (
                  <span style={S.badge}><CheckCircle size={10} /> {t.verifiedAccount}</span>
                )}
              </div>
            </div>

            <div style={S.statsRow}>
              {[
                { label: t.crops, value: profile?.totalCrops ?? 0, color: '#16a34a' },
                { label: t.deals, value: profile?.completedDeals ?? 0, color: '#2563eb' },
                { label: t.revenue, value: `₹${((profile?.totalRevenue || 0) / 1000).toFixed(1)}K`, color: '#d97706' },
              ].map((s, i) => (
                <div key={i} style={S.statBox}>
                  <span style={{ ...S.statVal, color: s.color }}>{s.value}</span>
                  <span style={S.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>

            <div style={S.infoList}>
              {[
                { icon: <Calendar size={13} color="#16a34a" />, text: `Joined: ${formatDate(profile?.joinDate)}` },
                { icon: <Phone size={13} color="#16a34a" />, text: profile?.phone },
                profile?.city && { icon: <MapPin size={13} color="#16a34a" />, text: `${profile.city}${profile.state ? `, ${profile.state}` : ''}` },
                profile?.farmSize && { icon: <Package size={13} color="#16a34a" />, text: `Farm: ${profile.farmSize}` },
                profile?.experience && { icon: <Shield size={13} color="#16a34a" />, text: `Exp: ${profile.experience}` },
              ].filter(Boolean).map((item, i) => (
                <div key={i} style={S.infoItem}>{item.icon}<span>{item.text}</span></div>
              ))}
            </div>

            <div style={S.quickActions}>
              <p style={S.qaTitle}>{t.quickActions}</p>
              <button className="qa-btn" style={S.qaBtn('#15803d', '#f0fdf4')}
                onClick={() => { setShowPasswordModal(true); setPwErrors({}); setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); }}>
                <Lock size={14} /> {t.changePassword}
              </button>
              <button className="qa-btn" style={S.qaBtn('#1d4ed8', '#eff6ff')}
                onClick={() => setShowNotifModal(true)}>
                <Bell size={14} /> {t.notificationSettings}
              </button>
              <button className="qa-btn" style={S.qaBtn('#dc2626', '#fef2f2')}
                onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); }}>
                <Trash2 size={14} /> {t.deleteAccount}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <div style={S.tabBar}>
            {[
              { key: 'profile', label: t.profileInfo },
              { key: 'security', label: t.security },
            ].map(tab => (
              <button key={tab.key} style={S.tab(activeTab === tab.key)} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'profile' && (
            <div style={S.sectionCard}>
              <div style={S.sectionTitle}>
                <span>{t.profileInformation}</span>
                <div style={{ display: 'flex', gap: 7 }}>
                  {isEditing ? (
                    <>
                      <button onClick={handleCancel} style={S.cancelBtn}><X size={13} /> Cancel</button>
                      <button onClick={handleSave} disabled={saving} style={S.saveBtn}>
                        {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />}
                        Save
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} style={S.editBtn}><Edit size={13} /> {t.editProfile}</button>
                  )}
                </div>
              </div>

              <div className="form-grid">
                {[
                  { label: t.fullName, field: 'name', type: 'text', placeholder: 'Your full name' },
                  { label: t.emailAddress, field: 'email', type: 'email', placeholder: 'your@email.com' },
                  { label: t.city, field: 'city', type: 'text', placeholder: 'e.g. Pune' },
                  { label: t.state, field: 'state', type: 'text', placeholder: 'e.g. Maharashtra' },
                  { label: t.farmSize, field: 'farmSize', type: 'text', placeholder: 'e.g. 5 acres' },
                  { label: t.farmingExperience, field: 'experience', type: 'text', placeholder: 'e.g. 8 years' },
                ].map(f => (
                  <div key={f.field}>
                    <label style={S.label}>{f.label}</label>
                    <input type={f.type} value={formData[f.field]}
                      onChange={e => setFormData({ ...formData, [f.field]: e.target.value })}
                      disabled={!isEditing} placeholder={f.placeholder} style={S.input(isEditing)} />
                  </div>
                ))}

                <div>
                  <label style={S.label}>{t.phone} <span style={{ color: '#9ca3af', textTransform: 'none', fontSize: 10 }}>(cannot change)</span></label>
                  <input type="tel" value={profile?.phone || ''} disabled style={S.input(false)} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={S.label}>{t.farmAddress}</label>
                  <textarea rows={3} value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing} placeholder="Full farm address..."
                    style={{ ...S.input(isEditing), resize: 'none', width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                {[
                  { label: t.username, value: `@${profile?.username}` },
                  { label: t.role, value: profile?.role?.toLowerCase() },
                ].map((f, i) => (
                  <div key={i}>
                    <label style={S.label}>{f.label}</label>
                    <div style={{ ...S.input(false), display: 'block', padding: '9px 12px', textTransform: 'capitalize' }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={S.sectionCard}>
              <div style={S.sectionTitle}>{t.accountSecurity}</div>

              <div style={S.securityRow}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#111827', margin: 0 }}>{t.accountStatus}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: '3px 0 0', fontFamily: 'system-ui' }}>
                    {profile?.verified ? t.accountVerifiedMessage : '⚠️ Account not verified'}
                  </p>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: profile?.verified ? '#dcfce7' : '#fef9c3', color: profile?.verified ? '#15803d' : '#a16207', fontFamily: 'system-ui', whiteSpace: 'nowrap' }}>
                  {profile?.verified ? t.verified : 'Pending'}
                </span>
              </div>

              <div style={S.securityRow}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#111827', margin: 0 }}>{t.changePassword}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: '3px 0 0', fontFamily: 'system-ui' }}>{t.updatePasswordText}</p>
                </div>
                <button onClick={() => { setShowPasswordModal(true); setPwErrors({}); }}
                  style={{ padding: '6px 14px', background: '#15803d', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui', whiteSpace: 'nowrap' }}>
                  {t.change}
                </button>
              </div>

              <div style={S.securityRow}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#111827', margin: 0 }}>{t.memberSince}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: '3px 0 0', fontFamily: 'system-ui' }}>{formatDate(profile?.joinDate)}</p>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#dbeafe', color: '#1d4ed8', fontFamily: 'system-ui', whiteSpace: 'nowrap' }}>{t.active}</span>
              </div>

              <div style={{ ...S.securityRow, background: '#fff5f5', border: '1px solid #fecaca' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#dc2626', margin: 0 }}>{t.dangerZone}</p>
                  <p style={{ fontSize: 11, color: '#f87171', margin: '3px 0 0', fontFamily: 'system-ui' }}>{t.deleteAccountText}</p>
                </div>
                <button onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); }}
                  style={{ padding: '6px 14px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui', whiteSpace: 'nowrap' }}>
                  {t.delete}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <div style={S.modalHeader('#e5e7eb')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={15} color="#15803d" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Change Password</span>
              </div>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={17} /></button>
            </div>
            <div style={S.modalBody}>
              {[
                { label: 'Current Password', field: 'oldPassword', show: showOld, toggle: () => setShowOld(!showOld) },
                { label: 'New Password', field: 'newPassword', show: showNew, toggle: () => setShowNew(!showNew) },
                { label: 'Confirm New Password', field: 'confirmPassword', show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
              ].map(({ label, field, show, toggle }) => (
                <div key={field} style={{ marginBottom: 14 }}>
                  <label style={S.label}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={show ? 'text' : 'password'} value={pwForm[field]}
                      onChange={e => { setPwForm({ ...pwForm, [field]: e.target.value }); setPwErrors(p => ({ ...p, [field]: '' })); }}
                      placeholder={`Enter ${label.toLowerCase()}`} style={S.modalInput(pwErrors[field])} />
                    <button type="button" onClick={toggle} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {field === 'newPassword' && pwForm.newPassword && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3, fontFamily: 'system-ui' }}>
                        <span style={{ color: '#9ca3af' }}>Strength</span>
                        <span style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                      </div>
                      <div style={{ height: 3, background: '#e5e7eb', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${strength.pct}%`, background: strength.color, borderRadius: 4, transition: 'all 0.3s' }} />
                      </div>
                    </div>
                  )}
                  {pwErrors[field] && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 3, fontFamily: 'system-ui' }}>{pwErrors[field]}</p>}
                  {field === 'confirmPassword' && !pwErrors.confirmPassword && pwForm.confirmPassword && pwForm.newPassword === pwForm.confirmPassword && (
                    <p style={{ color: '#16a34a', fontSize: 11, marginTop: 3, display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'system-ui' }}>
                      <CheckCircle size={11} /> Passwords match
                    </p>
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 9, marginTop: 6 }}>
                <button onClick={() => setShowPasswordModal(false)} style={S.modalSecondary}>Cancel</button>
                <button onClick={handleChangePassword} disabled={pwLoading} style={S.modalPrimary('#15803d')}>
                  {pwLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={14} />}
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION MODAL */}
      {showNotifModal && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <div style={S.modalHeader('#e5e7eb')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={15} color="#2563eb" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Notification Settings</span>
              </div>
              <button onClick={() => setShowNotifModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={17} /></button>
            </div>
            <div style={S.modalBody}>
              {[
                { key: 'newRequests', label: 'New Purchase Requests', desc: 'When dealers send requests', emoji: '📬' },
                { key: 'dealUpdates', label: 'Deal Updates', desc: 'Accepted or completed deals', emoji: '🤝' },
                { key: 'paymentAlerts', label: 'Payment Alerts', desc: 'Received or pending payments', emoji: '💰' },
                { key: 'marketPrices', label: 'Market Price Updates', desc: 'Daily price changes', emoji: '📈' },
                { key: 'newSchemes', label: 'Government Schemes', desc: 'New schemes for farmers', emoji: '🏛️' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f3f4f6', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{item.emoji}</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, fontFamily: 'system-ui' }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0', fontFamily: 'system-ui' }}>{item.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => setNotifSettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    style={{ width: 42, height: 22, borderRadius: 11, border: 'none', background: notifSettings[item.key] ? '#2563eb' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 2, width: 18, height: 18, background: 'white', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'all 0.2s', left: notifSettings[item.key] ? 22 : 2 }} />
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
                <button onClick={() => setShowNotifModal(false)} style={S.modalSecondary}>Cancel</button>
                <button onClick={handleSaveNotifications} disabled={notifSaving} style={S.modalPrimary('#2563eb')}>
                  {notifSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <div style={S.modalHeader('#fee2e2')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={15} color="#dc2626" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#dc2626' }}>Delete Account</span>
              </div>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={17} /></button>
            </div>
            <div style={S.modalBody}>
              <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 11, padding: 14, marginBottom: 16 }}>
                <p style={{ fontWeight: 700, color: '#dc2626', fontSize: 13, margin: '0 0 7px', fontFamily: 'system-ui' }}>⚠️ This action cannot be undone!</p>
                {['All your crops will be permanently deleted', 'All deals and transactions will be lost', 'Your account cannot be recovered'].map((txt, i) => (
                  <p key={i} style={{ fontSize: 11, color: '#f87171', margin: '3px 0', fontFamily: 'system-ui' }}>• {txt}</p>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>
                  Type <strong style={{ color: '#dc2626' }}>{profile?.username}</strong> to confirm
                </label>
                <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder={profile?.username}
                  style={{ ...S.modalInput(false), border: `1.5px solid ${deleteConfirm === profile?.username ? '#dc2626' : '#e5e7eb'}` }} />
              </div>
              <div style={{ display: 'flex', gap: 9 }}>
                <button onClick={() => setShowDeleteModal(false)} style={S.modalSecondary}>Keep Account</button>
                <button onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== profile?.username || deleteLoading}
                  style={{ ...S.modalPrimary('#dc2626'), opacity: deleteConfirm !== profile?.username ? 0.4 : 1 }}>
                  {deleteLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default FarmerProfile;