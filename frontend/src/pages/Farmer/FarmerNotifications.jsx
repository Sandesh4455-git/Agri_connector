import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Check, X, AlertCircle, ShoppingCart,
  Calendar, Filter, CheckCircle,
  RefreshCw, TrendingUp, Settings, ChevronDown,
  Wifi, WifiOff, Trash2, Eye
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = 'http://localhost:8080/api/notifications';
const getToken = () => localStorage.getItem('agri_connect_token');

const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

const TYPE_CONFIG = {
  ORDER:   { icon: ShoppingCart, color: '#166534', bg: '#dcfce7', label: 'Order',   emoji: '🛒' },
  PRICE:   { icon: TrendingUp,   color: '#92400e', bg: '#fef3c7', label: 'Price',   emoji: '📈' },
  PAYMENT: { icon: CheckCircle,  color: '#1e3a8a', bg: '#dbeafe', label: 'Payment', emoji: '💰' },
  MARKET:  { icon: AlertCircle,  color: '#7c2d12', bg: '#ffedd5', label: 'Market',  emoji: '🏪' },
  SCHEME:  { icon: Calendar,     color: '#134e4a', bg: '#ccfbf1', label: 'Scheme',  emoji: '📋' },
  SYSTEM:  { icon: Settings,     color: '#374151', bg: '#f3f4f6', label: 'System',  emoji: '⚙️' },
};

const PRIORITY_CONFIG = {
  HIGH:   { label: 'High',   color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
  MEDIUM: { label: 'Medium', color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  LOW:    { label: 'Low',    color: '#059669', bg: '#f0fdf4', dot: '#10b981' },
};

const DEMO_NOTIFICATIONS = [
  { id: 1, type: 'ORDER',   title: 'New Bulk Order Received',       message: 'Rajesh Traders placed an order for 500 kg of wheat at ₹48/kg. Please confirm within 24 hours.',  createdAt: new Date(Date.now() - 1.5*3600000).toISOString(), read: false, priority: 'HIGH'   },
  { id: 2, type: 'PAYMENT', title: 'Payment Credited ✓',            message: '₹24,000 credited to your account for wheat order #1042 from Sunita Agro Industries.',             createdAt: new Date(Date.now() - 3*3600000).toISOString(),   read: false, priority: 'HIGH'   },
  { id: 3, type: 'PRICE',   title: 'Tomato Price Surge — Act Now',  message: 'Tomato prices rose 22% in Pune mandi today. Current rate: ₹32/kg.',                               createdAt: new Date(Date.now() - 6*3600000).toISOString(),   read: false, priority: 'MEDIUM' },
  { id: 4, type: 'SCHEME',  title: 'PM Kisan Installment Released', message: '14th installment of PM-KISAN (₹2,000) released. Check your Aadhaar-linked bank account.',         createdAt: new Date(Date.now() - 24*3600000).toISOString(),  read: true,  priority: 'MEDIUM' },
  { id: 5, type: 'MARKET',  title: 'Weekly Mandi Report Ready',     message: 'Onion ₹18/kg ↑, Potato ₹14/kg ↓, Wheat ₹47/kg →. Check Market section for full details.',        createdAt: new Date(Date.now() - 2*86400000).toISOString(),  read: true,  priority: 'LOW'    },
  { id: 6, type: 'SYSTEM',  title: 'Tip: Complete Your Profile',    message: 'Add your bank account details to receive payments directly from buyers.',                           createdAt: new Date(Date.now() - 5*86400000).toISOString(),  read: true,  priority: 'LOW'    },
];

const formatTime = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const FarmerNotifications = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [filter, setFilter]               = useState('ALL');
  const [unreadCount, setUnreadCount]     = useState(0);
  const [connected, setConnected]         = useState(false);
  const [showPrefs, setShowPrefs]         = useState(false);
  const [toast, setToast]                 = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('No token');
      const res = await fetch(API_URL, { method: 'GET', headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
        setConnected(true);
        if (isRefresh) showToast('Notifications refreshed');
      } else throw new Error(data.message);
    } catch (err) {
      setNotifications(DEMO_NOTIFICATIONS);
      setUnreadCount(DEMO_NOTIFICATIONS.filter(n => !n.read).length);
      setConnected(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id) => {
    if (connected) await fetch(`${API_URL}/${id}/read`, { method: 'PUT', headers: authHeaders() });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (connected) await fetch(`${API_URL}/read-all`, { method: 'PUT', headers: authHeaders() });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    showToast('All marked as read');
  };

  const deleteNotif = async (id) => {
    const notif = notifications.find(n => n.id === id);
    if (connected) await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: authHeaders() });
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notif && !notif.read) setUnreadCount(prev => Math.max(0, prev - 1));
    showToast('Notification removed');
  };

  const FILTERS = [
    { key: 'ALL',     label: 'All',         count: notifications.length },
    { key: 'UNREAD',  label: 'Unread',      count: notifications.filter(n => !n.read).length },
    { key: 'HIGH',    label: '🔴 Urgent',    count: notifications.filter(n => n.priority === 'HIGH').length },
    { key: 'ORDER',   label: `🛒 Orders`,    count: notifications.filter(n => n.type === 'ORDER').length },
    { key: 'PAYMENT', label: `💰 Payments`,  count: notifications.filter(n => n.type === 'PAYMENT').length },
    { key: 'PRICE',   label: `📈 Prices`,    count: notifications.filter(n => n.type === 'PRICE').length },
    { key: 'SCHEME',  label: `📋 Schemes`,   count: notifications.filter(n => n.type === 'SCHEME').length },
  ];

  const filtered = notifications.filter(n => {
    if (filter === 'ALL')    return true;
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'HIGH')   return n.priority === 'HIGH';
    return n.type === filter;
  });

  const todayCount = notifications.filter(n =>
    (Date.now() - new Date(n.createdAt).getTime()) < 86400000
  ).length;

  if (loading) return <LoadingScreen />;

  return (
    <div style={styles.page}>
      <style>{CSS}</style>

      {toast && (
        <div style={{ ...styles.toast, background: toast.type === 'error' ? '#dc2626' : '#15803d' }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.bellWrap}>
            <Bell size={20} color="#15803d" />
            {unreadCount > 0 && <span style={styles.bellBadge}>{unreadCount}</span>}
          </div>
          <div>
            <h1 style={styles.title}>{t.notifications}</h1>
            <div style={styles.subtitle}>
              {connected
                ? <><Wifi size={10} color="#15803d" /> Live</>
                : <><WifiOff size={10} color="#d97706" /> Demo</>}
            </div>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button className="btn-outline" onClick={() => fetchNotifications(true)} disabled={refreshing}>
            <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
            <span className="hide-xs">{refreshing ? '…' : t.refresh}</span>
          </button>
          {unreadCount > 0 && (
            <button className="btn-primary" onClick={markAllAsRead}>
              <Check size={13} /> <span className="hide-xs">Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total',   value: notifications.length,                                    icon: '📬', color: '#374151' },
          { label: 'Unread',  value: unreadCount,                                             icon: '🔵', color: '#2563eb' },
          { label: 'Urgent',  value: notifications.filter(n => n.priority === 'HIGH').length, icon: '🔴', color: '#dc2626' },
          { label: "Today",   value: todayCount,                                              icon: '📅', color: '#15803d' },
        ].map((s, i) => (
          <div key={i} style={styles.statCard}>
            <span style={styles.statEmoji}>{s.icon}</span>
            <span style={{ ...styles.statValue, color: s.color }}>{s.value}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <Filter size={12} color="#9ca3af" style={{ flexShrink: 0 }} />
        <div style={styles.filterScroll}>
          {FILTERS.map(f => (
            <button key={f.key} className={`filter-pill ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}>
              {f.label}
              {f.count > 0 && <span style={styles.filterCount}>{f.count}</span>}
            </button>
          ))}
        </div>
        <span style={styles.shownLabel}>{filtered.length}</span>
      </div>

      {/* List */}
      <div style={styles.list}>
        {filtered.length === 0
          ? <EmptyState filter={filter} />
          : filtered.map((n, idx) => (
              <NotifCard key={n.id} notif={n} idx={idx} onRead={markAsRead} onDelete={deleteNotif} />
            ))}
      </div>

      {/* Preferences */}
      <div style={styles.prefsCard}>
        <button style={styles.prefsToggle} onClick={() => setShowPrefs(p => !p)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={15} color="#15803d" />
            <span style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{t.notificationPreferences}</span>
          </div>
          <ChevronDown size={15} color="#6b7280"
            style={{ transform: showPrefs ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </button>
        {showPrefs && <PrefsPanel />}
      </div>
    </div>
  );
};

const NotifCard = ({ notif: n, idx, onRead, onDelete }) => {
  const tc = TYPE_CONFIG[n.type] || TYPE_CONFIG.SYSTEM;
  const pc = PRIORITY_CONFIG[n.priority] || PRIORITY_CONFIG.LOW;
  const Icon = tc.icon;
  const borderColor = n.read ? '#f3f4f6' : '#bbf7d0';
  return (
    <div className="notif-card" style={{
      ...styles.card,
      background: n.read ? 'white' : '#f0fdf4',
      borderTop:    `1px solid ${borderColor}`,
      borderRight:  `1px solid ${borderColor}`,
      borderBottom: `1px solid ${borderColor}`,
      borderLeft:   `4px solid ${pc.dot}`,
      animationDelay: `${idx * 0.05}s`,
    }}>
      <div style={{ ...styles.iconBox, background: tc.bg }}>
        <Icon size={16} color={tc.color} />
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardMeta}>
          <span style={styles.cardTitle}>{n.title}</span>
          <div style={styles.badges}>
            {!n.read && <span style={styles.newBadge}>NEW</span>}
            <span style={{ ...styles.badge, background: pc.bg, color: pc.color }}>{pc.label}</span>
            <span style={{ ...styles.badge, background: tc.bg, color: tc.color }}>{tc.emoji} {tc.label}</span>
          </div>
        </div>
        <p style={styles.cardMsg}>{n.message}</p>
        <span style={styles.cardTime}>{formatTime(n.createdAt)}</span>
      </div>
      <div style={styles.cardActions}>
        {!n.read && (
          <button className="icon-btn green" onClick={() => onRead(n.id)} title="Mark as read">
            <Eye size={14} />
          </button>
        )}
        <button className="icon-btn red" onClick={() => onDelete(n.id)} title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const PREFS = [
  { key: 'orders',   label: '🛒 Order Alerts',   desc: 'New orders, confirmations', defaultOn: true  },
  { key: 'payments', label: '💰 Payment Updates', desc: 'Money received, pending',   defaultOn: true  },
  { key: 'prices',   label: '📈 Price Alerts',    desc: 'Mandi price changes',       defaultOn: true  },
  { key: 'schemes',  label: '📋 Govt Schemes',    desc: 'PM-KISAN, subsidies',       defaultOn: true  },
  { key: 'market',   label: '🏪 Market Reports',  desc: 'Weekly mandi summaries',    defaultOn: false },
  { key: 'system',   label: '⚙️ System Alerts',   desc: 'App updates',               defaultOn: false },
];

const PrefsPanel = () => {
  const [prefs, setPrefs] = useState(() =>
    Object.fromEntries(PREFS.map(p => [p.key, p.defaultOn]))
  );
  return (
    <div style={styles.prefsGrid}>
      {PREFS.map(p => (
        <div key={p.key} style={styles.prefRow}>
          <div style={{ minWidth: 0 }}>
            <p style={styles.prefLabel}>{p.label}</p>
            <p style={styles.prefDesc}>{p.desc}</p>
          </div>
          <button onClick={() => setPrefs(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
            style={{ ...styles.toggle, background: prefs[p.key] ? '#15803d' : '#d1d5db' }}>
            <div style={{ ...styles.toggleThumb, left: prefs[p.key] ? 20 : 2 }} />
          </button>
        </div>
      ))}
    </div>
  );
};

const EmptyState = ({ filter }) => (
  <div style={styles.empty}>
    <div style={styles.emptyEmoji}>{filter === 'UNREAD' ? '👀' : '🔔'}</div>
    <h3 style={styles.emptyTitle}>{filter === 'UNREAD' ? 'All caught up!' : 'No notifications'}</h3>
    <p style={styles.emptyDesc}>{filter === 'UNREAD' ? 'You have read all notifications.' : 'Nothing here right now.'}</p>
  </div>
);

const LoadingScreen = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <style>{CSS}</style>
    <div style={{ textAlign: 'center' }}>
      <div style={styles.spinner} />
      <p style={{ color: '#6b7280', fontSize: 13, marginTop: 14, fontFamily: 'system-ui' }}>Loading notifications…</p>
    </div>
  </div>
);

const CSS = `
  * { box-sizing: border-box; }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  .spin { animation: spin 0.8s linear infinite; }
  .notif-card { animation: slideIn 0.25s ease forwards; opacity:0; transition: box-shadow 0.2s, transform 0.2s; }
  .notif-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.09) !important; }
  .btn-primary { display:flex; align-items:center; gap:5px; padding:8px 14px; background:linear-gradient(135deg,#15803d,#059669); color:white; border:none; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; transition:opacity 0.15s; white-space:nowrap; }
  .btn-primary:hover { opacity:0.9; }
  .btn-outline { display:flex; align-items:center; gap:5px; padding:8px 12px; background:white; border:1.5px solid #d1fae5; border-radius:10px; color:#15803d; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
  .btn-outline:hover { background:#f0fdf4; }
  .btn-outline:disabled { opacity:0.6; cursor:default; }
  .filter-pill { display:inline-flex; align-items:center; gap:4px; padding:5px 11px; border-radius:20px; border:none; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.15s; white-space:nowrap; background:#f3f4f6; color:#6b7280; }
  .filter-pill:hover { background:#dcfce7; color:#15803d; }
  .filter-pill.active { background:#dcfce7; color:#15803d; outline:2px solid #86efac; }
  .icon-btn { width:30px; height:30px; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; flex-shrink:0; }
  .icon-btn.green { background:#dcfce7; color:#15803d; }
  .icon-btn.green:hover { background:#bbf7d0; }
  .icon-btn.red { background:#fee2e2; color:#dc2626; }
  .icon-btn.red:hover { background:#fecaca; }
  @media (max-width: 480px) {
    .hide-xs { display: none; }
  }
`;

const styles = {
  page: { flex: 1, padding: 'clamp(12px, 3vw, 24px)', background: 'linear-gradient(160deg,#f0fdf4 0%,#f8fafc 60%,#fafafa 100%)', minHeight: '100vh', fontFamily: 'system-ui,sans-serif', overflowX: 'hidden', position: 'relative', boxSizing: 'border-box' },
  toast: { position: 'fixed', top: 16, right: 16, zIndex: 9999, padding: '9px 16px', borderRadius: 12, color: 'white', fontSize: 12, fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', animation: 'fadeIn 0.3s ease', maxWidth: 'calc(100vw - 32px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  bellWrap: { width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 2px 8px rgba(21,128,61,0.15)', flexShrink: 0 },
  bellBadge: { position: 'absolute', top: -3, right: -3, background: '#dc2626', color: 'white', fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 10, minWidth: 16, textAlign: 'center', border: '2px solid white' },
  title: { fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 700, color: '#14532d', margin: 0 },
  subtitle: { fontSize: 11, color: '#6b7280', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 3 },
  headerActions: { display: 'flex', gap: 7, flexWrap: 'wrap' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 },
  statCard: { background: 'white', borderRadius: 12, padding: '12px 10px', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 18, marginBottom: 2 },
  statValue: { fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, lineHeight: 1 },
  statLabel: { fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' },
  filterBar: { background: 'white', borderRadius: 12, padding: '8px 12px', marginBottom: 12, border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' },
  filterScroll: { display: 'flex', gap: 5, flex: 1, overflowX: 'auto', paddingBottom: 2 },
  filterCount: { background: 'rgba(0,0,0,0.08)', borderRadius: 10, padding: '0 5px', fontSize: 9, fontWeight: 800 },
  shownLabel: { fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 },
  list: { display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 },
  card: { borderRadius: 12, padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'flex-start', gap: 10, transition: 'all 0.2s' },
  iconBox: { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardBody: { flex: 1, minWidth: 0 },
  cardMeta: { display: 'flex', alignItems: 'flex-start', gap: 5, flexWrap: 'wrap', marginBottom: 3 },
  cardTitle: { fontSize: 13, fontWeight: 800, color: '#111827' },
  badges: { display: 'flex', gap: 3, flexWrap: 'wrap' },
  newBadge: { background: '#2563eb', color: 'white', fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 10 },
  badge: { fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10 },
  cardMsg: { fontSize: 12, color: '#4b5563', margin: '0 0 5px', lineHeight: 1.6 },
  cardTime: { fontSize: 11, color: '#9ca3af', fontWeight: 600 },
  cardActions: { display: 'flex', gap: 5, flexShrink: 0, alignItems: 'flex-start' },
  prefsCard: { background: 'white', borderRadius: 14, border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' },
  prefsToggle: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: 'none', background: 'transparent', cursor: 'pointer' },
  prefsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8, padding: '0 14px 14px', borderTop: '1px solid #f3f4f6' },
  prefRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 11px', background: '#f9fafb', borderRadius: 9, border: '1px solid #f3f4f6' },
  prefLabel: { fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 },
  prefDesc: { fontSize: 10, color: '#9ca3af', margin: '2px 0 0' },
  toggle: { width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 },
  toggleThumb: { position: 'absolute', top: 2, width: 18, height: 18, background: 'white', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.25)', transition: 'left 0.2s' },
  empty: { textAlign: 'center', padding: '48px 20px', background: 'white', borderRadius: 14, border: '1px solid #f3f4f6' },
  emptyEmoji: { fontSize: 44, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: 800, color: '#374151', margin: '0 0 5px' },
  emptyDesc: { fontSize: 13, color: '#9ca3af', margin: 0 },
  spinner: { width: 42, height: 42, margin: '0 auto', border: '3px solid #dcfce7', borderTop: '3px solid #15803d', borderRadius: '50%', animation: 'spin 0.9s linear infinite' },
};

export default FarmerNotifications;