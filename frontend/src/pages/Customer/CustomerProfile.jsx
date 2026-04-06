// CustomerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, Shield,
  Save, Edit, Loader2, RefreshCw, CheckCircle,
  Package, FileText, CreditCard, X, Lock,
  Bell, Trash2, Eye, EyeOff, AlertTriangle
} from 'lucide-react';

const API_URL = 'http://localhost:8080/api/profile';
const AUTH_URL = 'http://localhost:8080/api/auth';
const getToken = () => localStorage.getItem('agri_connect_token');

const CustomerProfile = () => {
  const { t } = useLanguage();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('info');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    orderUpdates: true,
    requestResponses: true,
    paymentAlerts: true,
    marketPrices: false,
    newProducts: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', city: '', state: '', address: ''
  });

  useEffect(() => {
    fetchProfile();
    const saved = localStorage.getItem('agri_customer_notif_settings');
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
          name: data.data.name || '',
          email: data.data.email || '',
          city: data.data.city || '',
          state: data.data.state || '',
          address: data.data.address || '',
        });
      }
    } catch {
      showToast('❌ Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
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
    } catch {
      showToast('❌ Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      email: profile?.email || '',
      city: profile?.city || '',
      state: profile?.state || '',
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
    } catch {
      showToast('❌ Something went wrong', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    await new Promise(r => setTimeout(r, 600));
    localStorage.setItem('agri_customer_notif_settings', JSON.stringify(notifSettings));
    setNotifSaving(false);
    showToast('✅ Notification settings saved!');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== profile?.username) { showToast('❌ Username does not match', 'error'); return; }
    setDeleteLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/delete-account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Account deleted. Logging out...');
        setTimeout(() => { logout(); navigate('/login'); }, 2000);
      } else {
        showToast('❌ ' + data.message, 'error');
      }
    } catch {
      showToast('❌ Something went wrong', 'error');
    } finally {
      setDeleteLoading(false);
    }
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
    if (!pw) return { label: '', color: '', width: 0 };
    if (pw.length < 6) return { label: 'Weak', color: 'bg-red-500', width: 25 };
    if (pw.length < 8) return { label: 'Fair', color: 'bg-yellow-500', width: 50 };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return { label: 'Strong', color: 'bg-green-500', width: 100 };
    return { label: 'Good', color: 'bg-blue-500', width: 75 };
  };

  const strength = getStrength(pwForm.newPassword);

  const inputClass = (editing) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-all ${
      editing
        ? 'border-gray-300 focus:ring-2 focus:ring-purple-400'
        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
    }`;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-purple-500" size={40} />
        <p className="text-gray-500 text-sm">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen">

      {/* Toast — full-width on mobile, fixed width on desktop */}
      {toast.show && (
        <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[100] px-5 py-3 rounded-xl shadow-2xl text-sm font-medium border ${
          toast.type === 'success' ? 'bg-white border-green-300 text-gray-800' : 'bg-white border-red-300 text-red-700'
        }`}>{toast.msg}</div>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{t.myProfile}</h1>
          <p className="text-gray-500 text-sm mt-1">{t.manageProfile}</p>
        </div>
        <button
          onClick={fetchProfile}
          className="self-start sm:self-auto flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-50 text-sm shadow-sm whitespace-nowrap"
        >
          <RefreshCw size={15} /> {t.refresh}
        </button>
      </div>

      {/* Tab Navigation — scrollable on very small screens */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { key: 'info', label: t.profileInfo },
          { key: 'notifications', label: t.notifications },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 sm:px-5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.key
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Profile Info Tab ── */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT: Avatar & Stats */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Avatar banner */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white text-center">
                <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg mb-3">
                  <span className="text-2xl font-bold text-purple-600">{getInitials(profile?.name)}</span>
                </div>
                <h2 className="text-lg font-bold break-words">{profile?.name}</h2>
                <p className="text-purple-100 text-sm capitalize">
                  {profile?.role?.toLowerCase()}{profile?.city ? ` • ${profile?.city}` : ''}
                </p>
                <div className="flex justify-center gap-2 mt-3 flex-wrap">
                  {profile?.verified && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      <CheckCircle size={11} /> {t.verified}
                    </span>
                  )}
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs capitalize">
                    {profile?.role?.toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: t.orders,   value: profile?.totalOrders ?? 0,
                      icon: <Package size={15} className="text-purple-500" />, bg: 'bg-purple-50' },
                    { label: t.requests, value: profile?.pendingRequests ?? 0,
                      icon: <FileText size={15} className="text-blue-500" />,  bg: 'bg-blue-50' },
                    { label: t.spent,    value: `₹${((profile?.totalSpent || 0) / 1000).toFixed(1)}K`,
                      icon: <CreditCard size={15} className="text-orange-500" />, bg: 'bg-orange-50' },
                  ].map((s, i) => (
                    <div key={i} className={`text-center ${s.bg} rounded-xl p-2.5`}>
                      <div className="flex justify-center mb-1">{s.icon}</div>
                      <p className="text-sm sm:text-base font-bold text-gray-800 break-all">{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Contact details */}
                <div className="space-y-2">
                  {[
                    { icon: <Calendar size={14} className="text-purple-500 shrink-0" />, text: `Joined: ${formatDate(profile?.joinDate)}` },
                    { icon: <Phone size={14} className="text-purple-500 shrink-0" />, text: profile?.phone },
                    ...(profile?.city ? [{ icon: <MapPin size={14} className="text-purple-500 shrink-0" />, text: `${profile.city}${profile.state ? `, ${profile.state}` : ''}` }] : []),
                    ...(profile?.address ? [{ icon: <MapPin size={14} className="text-purple-500 shrink-0" />, text: profile.address }] : []),
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-lg">
                      {item.icon}
                      <span className="truncate text-xs text-gray-600">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md">
              <h3 className="text-base font-bold text-gray-800 mb-3">{t.quickActions}</h3>
              <div className="space-y-2">
                <button
                  onClick={() => { setShowPasswordModal(true); setPwErrors({}); setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); }}
                  className="w-full flex items-center gap-3 bg-purple-50 text-purple-700 py-3 px-4 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors"
                >
                  <Lock size={16} /> {t.changePassword}
                </button>
                <button
                  onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); }}
                  className="w-full flex items-center gap-3 bg-red-50 text-red-600 py-3 px-4 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} /> {t.deleteAccount}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Profile form & Security */}
          <div className="lg:col-span-2 space-y-5">

            {/* Profile Information */}
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h3 className="text-lg font-bold text-gray-800">{t.profileInfo}</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90"
                  >
                    <Edit size={15} /> {t.editProfile}
                  </button>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-2 rounded-xl text-sm hover:bg-gray-50"
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button
                      onClick={handleSave} disabled={saving}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: t.fullName,     icon: User,  field: 'name',  type: 'text',  placeholder: 'Your full name' },
                  { label: t.emailAddress, icon: Mail,  field: 'email', type: 'email', placeholder: 'your@email.com' },
                  { label: t.city,         icon: MapPin, field: 'city', type: 'text',  placeholder: 'e.g. Mumbai' },
                  { label: t.state,        icon: null,  field: 'state', type: 'text',  placeholder: 'e.g. Maharashtra' },
                ].map(f => (
                  <div key={f.field}>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                      {f.icon && React.createElement(f.icon, { size: 13 })}
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      value={formData[f.field]}
                      onChange={e => setFormData({ ...formData, [f.field]: e.target.value })}
                      disabled={!isEditing}
                      placeholder={f.placeholder}
                      className={inputClass(isEditing)}
                    />
                  </div>
                ))}

                {/* Phone — read-only */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <Phone size={13} /> {t.phone}
                    <span className="text-gray-400 font-normal">(cannot change)</span>
                  </label>
                  <input
                    type="tel" value={profile?.phone || ''} disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>

                {/* Address — full width */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <MapPin size={13} /> {t.address}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Your full address..."
                    className={`${inputClass(isEditing)} resize-none`}
                  />
                </div>
              </div>

              {/* Username & Role — read-only */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">{t.username}</label>
                  <div className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-500 truncate">@{profile?.username}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">{t.role}</label>
                  <div className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-500 capitalize">{profile?.role?.toLowerCase()}</div>
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">{t.accountSecurity}</h3>
              <div className="space-y-3">
                {/* Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{t.accountStatus}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {profile?.verified ? t.accountVerified : '⚠️ Account not verified'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                    profile?.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {profile?.verified ? t.verified : 'Pending'}
                  </span>
                </div>

                {/* Change password */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{t.changePassword}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.updatePasswordMsg}</p>
                  </div>
                  <button
                    onClick={() => { setShowPasswordModal(true); setPwErrors({}); }}
                    className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors shrink-0"
                  >
                    {t.change}
                  </button>
                </div>

                {/* Member since */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{t.memberSince}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(profile?.joinDate)}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium shrink-0">{t.active}</div>
                </div>

                {/* Danger zone */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                  <div>
                    <p className="font-medium text-red-700 text-sm">{t.dangerZone}</p>
                    <p className="text-xs text-red-400 mt-0.5">{t.deleteAccountMsg}</p>
                  </div>
                  <button
                    onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); }}
                    className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors shrink-0"
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications Tab ── */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 max-w-2xl">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t.notificationPreferences}</h3>
          <div className="space-y-3">
            {[
              { key: 'orderUpdates',     label: t.orderUpdates,        desc: t.orderUpdatesDesc,        emoji: '📦' },
              { key: 'requestResponses', label: t.requestResponses,     desc: t.requestResponsesDesc,    emoji: '💬' },
              { key: 'paymentAlerts',    label: t.paymentAlerts,        desc: t.paymentAlertsDesc,       emoji: '💰' },
              { key: 'marketPrices',     label: t.marketPriceUpdates,   desc: t.marketPriceUpdatesDesc,  emoji: '📈' },
              { key: 'newProducts',      label: t.newProducts,          desc: t.newProductsDesc,         emoji: '🆕' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-xl shrink-0">{item.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifSettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${notifSettings[item.key] ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifSettings[item.key] ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveNotifications} disabled={notifSaving}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {notifSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {t.saveSettings}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                  <Lock size={16} className="text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-800">Change Password</h3>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {[
                { label: 'Current Password',     field: 'oldPassword',    show: showOld,    toggle: () => setShowOld(v => !v) },
                { label: 'New Password',          field: 'newPassword',    show: showNew,    toggle: () => setShowNew(v => !v) },
                { label: 'Confirm New Password',  field: 'confirmPassword', show: showConfirm, toggle: () => setShowConfirm(v => !v) },
              ].map(({ label, field, show, toggle }) => (
                <div key={field}>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">{label}</label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      value={pwForm[field]}
                      onChange={e => { setPwForm({ ...pwForm, [field]: e.target.value }); setPwErrors(p => ({ ...p, [field]: '' })); }}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 pr-11 ${
                        pwErrors[field]
                          ? 'border-red-400 focus:ring-red-300'
                          : field === 'confirmPassword' && pwForm.confirmPassword && pwForm.newPassword === pwForm.confirmPassword
                            ? 'border-green-400 focus:ring-green-300'
                            : 'border-gray-300 focus:ring-purple-400'
                      }`}
                    />
                    <button type="button" onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {field === 'newPassword' && pwForm.newPassword && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Password strength</span>
                        <span className={`font-medium ${
                          strength.label === 'Strong' ? 'text-green-600' :
                          strength.label === 'Good'   ? 'text-blue-600' :
                          strength.label === 'Fair'   ? 'text-yellow-600' : 'text-red-500'
                        }`}>{strength.label}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${strength.color}`} style={{ width: `${strength.width}%` }} />
                      </div>
                    </div>
                  )}
                  {pwErrors[field] && <p className="text-red-500 text-xs mt-1">{pwErrors[field]}</p>}
                  {field === 'confirmPassword' && !pwErrors.confirmPassword && pwForm.confirmPassword && pwForm.newPassword === pwForm.confirmPassword && (
                    <p className="text-green-600 text-xs mt-1 flex items-center gap-1"><CheckCircle size={12} /> Passwords match</p>
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPasswordModal(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleChangePassword} disabled={pwLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {pwLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Account Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-red-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} className="text-red-600" />
                </div>
                <h3 className="font-bold text-red-700">Delete Account</h3>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                <p className="text-sm font-semibold text-red-700 mb-2">⚠️ This action cannot be undone!</p>
                <ul className="text-xs text-red-600 space-y-1">
                  <li>• All your orders and requests will be permanently deleted</li>
                  <li>• All transaction history will be lost</li>
                  <li>• Your account cannot be recovered</li>
                </ul>
              </div>
              <div className="mb-5">
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  Type your username <span className="font-bold text-red-600 break-all">{profile?.username}</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder={profile?.username}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                    deleteConfirm === profile?.username
                      ? 'border-red-500 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-gray-300'
                  }`}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Keep Account
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== profile?.username || deleteLoading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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

export default CustomerProfile;