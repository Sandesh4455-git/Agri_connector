import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Shield, Globe, Bell } from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Agri Connect',
    supportEmail: 'support@agriconnect.com',
    currency: 'INR',
    enableNewRegistrations: true,
    enableEmailNotifications: true,
    maintenanceMode: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('agriConnectSettings');
    if (s) setSettings(JSON.parse(s));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('agriConnectSettings', JSON.stringify(settings));
      setLoading(false); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleReset = () => {
    const def = { siteName: 'Agri Connect', supportEmail: 'support@agriconnect.com', currency: 'INR', enableNewRegistrations: true, enableEmailNotifications: true, maintenanceMode: false, twoFactorAuth: false, sessionTimeout: 30, maxLoginAttempts: 5 };
    setSettings(def);
    localStorage.setItem('agriConnectSettings', JSON.stringify(def));
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: 'system-ui,sans-serif',
    background: 'white', boxSizing: 'border-box', transition: 'border-color .2s',
  };
  const labelStyle = { display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 };
  const sectionTitleStyle = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 };
  const checkWrap = { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6', cursor: 'pointer' };

  return (
    <div style={{ padding: '16px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }

        .ss-page { padding: 16px; }
        @media (min-width: 768px) { .ss-page { padding: 32px; } }

        .ss-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .ss-grid { grid-template-columns: 1fr 1fr; }
        }

        .ss-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        @media (min-width: 480px) {
          .ss-actions { flex-direction: row; }
        }

        .ss-input:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,.12); }
        .ss-check { width: 18px; height: 18px; accent-color: #7c3aed; cursor: pointer; margin-top: 1px; flex-shrink: 0; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>⚙️ System Settings</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Configure platform settings and preferences</p>
      </div>

      {/* Saved banner */}
      {saved && (
        <div style={{ background: '#dcfce7', borderLeft: '4px solid #16a34a', color: '#15803d', padding: '12px 16px', marginBottom: 20, borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
          ✅ Settings saved successfully!
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 1px 12px rgba(0,0,0,.07)', padding: '20px 18px' }}>

        {/* ── General ── */}
        <section style={{ marginBottom: 28 }}>
          <div style={sectionTitleStyle}>
            <Globe size={22} color="#7c3aed" />
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>General Settings</h2>
          </div>
          <div className="ss-grid">
            <div>
              <label style={labelStyle}>Site Name</label>
              <input className="ss-input" style={inputStyle} type="text" name="siteName" value={settings.siteName} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle}>Support Email</label>
              <input className="ss-input" style={inputStyle} type="email" name="supportEmail" value={settings.supportEmail} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle}>Currency</label>
              <select className="ss-input" style={inputStyle} name="currency" value={settings.currency} onChange={handleChange}>
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </div>
        </section>

        <div style={{ height: 1, background: '#f3f4f6', margin: '0 0 28px' }} />

        {/* ── Security ── */}
        <section style={{ marginBottom: 28 }}>
          <div style={sectionTitleStyle}>
            <Shield size={22} color="#7c3aed" />
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>Security Settings</h2>
          </div>
          <div className="ss-grid" style={{ marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Session Timeout (minutes)</label>
              <input className="ss-input" style={inputStyle} type="number" name="sessionTimeout" value={settings.sessionTimeout} onChange={handleChange} min="5" max="120" />
            </div>
            <div>
              <label style={labelStyle}>Max Login Attempts</label>
              <input className="ss-input" style={inputStyle} type="number" name="maxLoginAttempts" value={settings.maxLoginAttempts} onChange={handleChange} min="3" max="10" />
            </div>
          </div>
          <label style={checkWrap} htmlFor="twoFactorAuth">
            <input className="ss-check" type="checkbox" name="twoFactorAuth" id="twoFactorAuth" checked={settings.twoFactorAuth} onChange={handleChange} />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#374151' }}>Enable Two-Factor Authentication (2FA)</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>Require 2FA for admin login</p>
            </div>
          </label>
        </section>

        <div style={{ height: 1, background: '#f3f4f6', margin: '0 0 28px' }} />

        {/* ── Notifications ── */}
        <section style={{ marginBottom: 28 }}>
          <div style={sectionTitleStyle}>
            <Bell size={22} color="#7c3aed" />
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>Notification Settings</h2>
          </div>
          <label style={checkWrap} htmlFor="enableEmailNotifications">
            <input className="ss-check" type="checkbox" name="enableEmailNotifications" id="enableEmailNotifications" checked={settings.enableEmailNotifications} onChange={handleChange} />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#374151' }}>Enable Email Notifications</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>Send transactional and alert emails to users</p>
            </div>
          </label>
        </section>

        <div style={{ height: 1, background: '#f3f4f6', margin: '0 0 28px' }} />

        {/* ── System Status ── */}
        <section>
          <div style={sectionTitleStyle}>
            <RefreshCw size={22} color="#7c3aed" />
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>System Status</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={checkWrap} htmlFor="enableNewRegistrations">
              <input className="ss-check" type="checkbox" name="enableNewRegistrations" id="enableNewRegistrations" checked={settings.enableNewRegistrations} onChange={handleChange} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#374151' }}>Allow New User Registrations</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>New farmers, dealers and customers can register</p>
              </div>
            </label>
            <label style={{ ...checkWrap, background: settings.maintenanceMode ? '#fff7ed' : '#f9fafb', border: `1px solid ${settings.maintenanceMode ? '#fed7aa' : '#f3f4f6'}` }} htmlFor="maintenanceMode">
              <input className="ss-check" type="checkbox" name="maintenanceMode" id="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: settings.maintenanceMode ? '#ea580c' : '#374151' }}>
                  {settings.maintenanceMode ? '⚠️ ' : ''}Maintenance Mode
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>Only admins can access the platform</p>
              </div>
            </label>
          </div>
        </section>

        {/* Actions */}
        <div className="ss-actions">
          <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 20px', border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            <RefreshCw size={16} /> Reset to Default
          </button>
          <button onClick={handleSave} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 28px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? .7 : 1 }}>
            {loading
              ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Saving...</>
              : <><Save size={16} /> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;