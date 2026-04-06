import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Key } from 'lucide-react';

const AdminCredentials = () => {
  const cardStyle = {
    background: '#f9fafb',
    borderRadius: 12,
    padding: '20px 18px',
    marginBottom: 14,
    border: '1px solid #e5e7eb',
  };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151' };
  const valueStyle = { fontSize: 13, color: '#111827' };
  const dividerStyle = { height: 1, background: '#e5e7eb', margin: '12px 0' };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: 'system-ui,sans-serif',
      boxSizing: 'border-box',
    }}>
      <style>{`* { box-sizing: border-box; }`}</style>

      <div style={{
        background: 'white',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,.1)',
        padding: 'clamp(20px,5vw,32px)',
        width: '100%',
        maxWidth: 580,
      }}>

        {/* Icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={28} color="#dc2626" />
          </div>
        </div>

        <h1 style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 800, textAlign: 'center', marginBottom: 20, color: '#111827' }}>
          System Credentials
        </h1>

        {/* Warning */}
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
          <p style={{ color: '#991b1b', fontSize: 13, margin: 0, fontWeight: 500 }}>
            ⚠️ This page is for development purposes only. Remove before production!
          </p>
        </div>

        {/* Admin Credentials */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={15} color="#dc2626" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Admin Login</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={labelStyle}>Email:</span>
              <span style={valueStyle}>admin@agriconnect.com</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={labelStyle}>Password:</span>
              <span style={{ ...valueStyle, fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 8px', borderRadius: 6, fontSize: 13 }}>Admin@123456</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={labelStyle}>Role:</span>
              <span style={{ ...valueStyle, background: '#eff6ff', color: '#2563eb', padding: '2px 9px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Admin</span>
            </div>
          </div>
        </div>

        {/* Government Credentials */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={15} color="#2563eb" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Government Login</h2>
          </div>

          {/* Officer 1 */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Officer 1</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={labelStyle}>Email:</span>
                <span style={valueStyle}>gov.officer1@agriconnect.com</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={labelStyle}>Password:</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 8px', borderRadius: 6, fontSize: 13 }}>Gov@123456</span>
              </div>
            </div>
          </div>

          <div style={dividerStyle} />

          {/* Officer 2 */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Officer 2</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={labelStyle}>Email:</span>
                <span style={valueStyle}>gov.officer2@agriconnect.com</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={labelStyle}>Password:</span>
                <span style={{ ...valueStyle, fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 8px', borderRadius: 6, fontSize: 13 }}>Gov@123456</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
          <p style={{ color: '#1e40af', fontSize: 13, margin: 0, fontWeight: 500 }}>
            ℹ️ Farmer and Dealer accounts can be registered freely through the registration page.
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px',
              background: 'linear-gradient(135deg,#16a34a,#15803d)',
              color: 'white', borderRadius: 12,
              fontWeight: 700, fontSize: 14,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(22,163,74,.3)',
              transition: 'opacity .2s',
            }}
          >
            🔐 Go to Login Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminCredentials;