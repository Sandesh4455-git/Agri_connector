// DealerNotifications.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bell, Check, X, AlertCircle, Package,
  DollarSign, Filter, RefreshCw,
  CheckCircle, UserCheck, Handshake,
} from 'lucide-react';

const API      = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');

const DealerNotifications = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState('all');
  const [toast,         setToast]         = useState(null);

  const showMsg = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/notifications`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) {
        const notifData = data.data;
        setNotifications(Array.isArray(notifData) ? notifData : []);
      }
    } catch (e) {
      console.error(e);
      showMsg('Could not load notifications', 'error');
    } finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await fetch(`${API}/notifications/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${getToken()}` } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) { console.error(e); }
  };

  const deleteNotif = async (id) => {
    try {
      await fetch(`${API}/notifications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
      setNotifications(prev => prev.filter(n => n.id !== id));
      showMsg('Notification deleted');
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API}/notifications/read-all`, { method: 'PUT', headers: { Authorization: `Bearer ${getToken()}` } });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showMsg('All notifications marked as read');
    } catch (e) { console.error(e); }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread')  return !n.read;
    if (filter === 'order')   return (n.type || '').toLowerCase().includes('order') || (n.type || '').toLowerCase().includes('request') || (n.type || '').toLowerCase().includes('deal');
    if (filter === 'payment') return (n.type || '').toLowerCase().includes('payment');
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeConfig = (type = '') => {
    const ty = type.toLowerCase();
    if (ty.includes('payment'))  return { icon: DollarSign,  color: '#16a34a', bg: '#dcfce7' };
    if (ty.includes('deal'))     return { icon: Handshake,   color: '#7c3aed', bg: '#ede9fe' };
    if (ty.includes('request'))  return { icon: Package,     color: '#2563eb', bg: '#dbeafe' };
    if (ty.includes('order'))    return { icon: Package,     color: '#2563eb', bg: '#dbeafe' };
    if (ty.includes('supplier')) return { icon: UserCheck,   color: '#d97706', bg: '#fef3c7' };
    return                              { icon: AlertCircle, color: '#6b7280', bg: '#f3f4f6' };
  };

  const getPriorityColor = (n) => {
    if (!n.read) return '#2563eb';
    const ty = (n.type || '').toLowerCase();
    if (ty.includes('payment') || ty.includes('deal')) return '#16a34a';
    if (ty.includes('request'))                        return '#d97706';
    return '#e5e7eb';
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const S = {
    page: { flex: 1, padding: 'clamp(12px,3vw,20px)', background: 'linear-gradient(135deg,#f8fafc,#eff6ff)', minHeight: '100vh', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' },
    card: { background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,.06)' },
    btn:  (bg, color, border) => ({ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: bg, color, border: border || 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }),
    pill: (active) => ({ padding: '5px 12px', borderRadius: 20, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', background: active ? '#dbeafe' : '#f3f4f6', color: active ? '#1d4ed8' : '#6b7280', outline: active ? '1.5px solid #93c5fd' : 'none' }),
  };

  const filterTabs = [
    { key: 'all',     label: `All (${notifications.length})`  },
    { key: 'unread',  label: `Unread (${unreadCount})`        },
    { key: 'order',   label: t.orders   || 'Orders'           },
    { key: 'payment', label: t.payments || 'Payments'         },
  ];

  if (loading) return (
    <main style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #dbeafe', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: 13 }}>Loading {t.notifications || 'notifications'}...</p>
      </div>
    </main>
  );

  return (
    <main style={S.page}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dn-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .dn-header-actions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }
        .dn-filter-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          margin-bottom: 14px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .dn-filter-pills {
          display: flex;
          gap: 6px;
          flex: 1;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .dn-notif-item {
          padding: 13px 14px;
          display: flex;
          align-items: flex-start;
          gap: 11px;
        }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200, padding: '10px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: 'white', border: `1.5px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`, color: toast.type === 'success' ? '#15803d' : '#dc2626', boxShadow: '0 8px 30px rgba(0,0,0,.1)', maxWidth: 'calc(100vw - 32px)' }}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="dn-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Bell size={24} color="#1d4ed8" />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 800, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(18px,4vw,24px)', fontWeight: 800, color: '#1e3a5f', margin: 0 }}>
              {t.notifications || 'Notifications'}
            </h1>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>Stay updated with your business</p>
          </div>
        </div>
        <div className="dn-header-actions">
          <button onClick={fetchNotifications} style={S.btn('white', '#374151', '1px solid #e5e7eb')}>
            <RefreshCw size={13} /> <span>{t.refresh || 'Refresh'}</span>
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={S.btn('linear-gradient(135deg,#1d4ed8,#2563eb)', 'white')}>
              <CheckCircle size={13} /> <span className="hide-xs">Mark All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ ...S.card, marginBottom: 14 }}>
        <div className="dn-filter-bar">
          <Filter size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
          <div className="dn-filter-pills">
            {filterTabs.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={S.pill(filter === f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div style={{ ...S.card, textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: 44, margin: '0 0 10px' }}>🔔</p>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: '0 0 7px' }}>
            No {t.notifications || 'notifications'}
          </h3>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
            {filter === 'unread' ? 'All caught up! No unread notifications.' : `No ${t.notifications || 'notifications'} yet.`}
          </p>
        </div>
      )}

      {/* Notification List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(n => {
          const { icon: Icon, color, bg } = getTypeConfig(n.type);
          return (
            <div key={n.id} style={{ ...S.card, borderLeft: `4px solid ${getPriorityColor(n)}`, background: n.read ? 'white' : '#f0f7ff' }}>
              <div className="dn-notif-item">
                {/* Icon */}
                <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color={color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>
                      {n.title || n.message}
                    </h3>
                    {!n.read && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 7, background: '#2563eb', color: 'white', flexShrink: 0 }}>
                        New
                      </span>
                    )}
                  </div>
                  {n.title && n.message && (
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 3px' }}>{n.message}</p>
                  )}
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>{formatTime(n.createdAt)}</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'flex-start' }}>
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} title="Mark as read"
                      style={{ width: 30, height: 30, background: '#dcfce7', border: 'none', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={13} color="#16a34a" />
                    </button>
                  )}
                  <button onClick={() => deleteNotif(n.id)} title="Delete"
                    style={{ width: 30, height: 30, background: '#fee2e2', border: 'none', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={13} color="#dc2626" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default DealerNotifications;