// frontend/src/components/PaymentExportButton.jsx
// Admin Panel च्या कोणत्याही page मध्ये import करून वापरा

import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

const API      = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('agri_connect_token');

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

const PaymentExportButton = ({ variant = 'full' }) => {
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState(null);
  const isMobile              = useIsMobile();

  // On mobile, auto-use 'small' variant to save space
  const effectiveVariant = isMobile && variant === 'full' ? 'small' : variant;

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/payments/export`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `AgriConnect_Payments_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast('✅ Excel downloaded successfully!');
    } catch {
      showToast('❌ Export failed — try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px) scale(.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .export-btn { transition: all .2s cubic-bezier(.22,1,.36,1) !important; }
        .export-btn:hover:not(:disabled) {
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 22px rgba(22,163,74,.45) !important;
        }
        .export-btn:active:not(:disabled) {
          transform: scale(.97) translateY(0) !important;
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed',
          top: isMobile ? 'auto' : 20,
          bottom: isMobile ? 20 : 'auto',
          right: isMobile ? 12 : 20,
          left: isMobile ? 12 : 'auto',
          zIndex:9999,
          padding:'11px 18px', borderRadius:12, fontSize:13, fontWeight:700,
          background:'white',
          border:`2px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
          color: toast.type === 'error' ? '#dc2626' : '#15803d',
          boxShadow:'0 6px 24px rgba(0,0,0,.15)',
          animation:'toastIn .2s cubic-bezier(.22,1,.36,1) both',
          fontFamily:'system-ui,sans-serif',
          textAlign:'center',
        }}>
          {toast.text}
        </div>
      )}

      <button
        className="export-btn"
        onClick={handleExport}
        disabled={loading}
        title="Export Payment Data to Excel"
        style={{
          display:'flex', alignItems:'center', justifyContent:'center',
          gap: effectiveVariant === 'full' ? 8 : 6,
          padding: effectiveVariant === 'full'
            ? (isMobile ? '9px 16px' : '10px 20px')
            : '8px 12px',
          background: loading
            ? '#9ca3af'
            : 'linear-gradient(135deg,#16a34a,#15803d)',
          color:'white',
          border:'none',
          borderRadius: effectiveVariant === 'full' ? 12 : 10,
          fontSize: effectiveVariant === 'full' ? (isMobile ? 13 : 14) : 12,
          fontWeight:700,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 14px rgba(22,163,74,.35)',
          fontFamily:'system-ui,sans-serif',
          whiteSpace:'nowrap',
          minWidth: effectiveVariant === 'icon' ? 40 : 'auto',
          minHeight: effectiveVariant === 'icon' ? 40 : 'auto',
        }}
      >
        {loading ? (
          <>
            <div style={{
              width:15, height:15,
              border:'2px solid rgba(255,255,255,.35)',
              borderTop:'2px solid white', borderRadius:'50%',
              animation:'spin 1s linear infinite',
              flexShrink:0,
            }} />
            {effectiveVariant !== 'icon' && 'Generating...'}
          </>
        ) : effectiveVariant === 'icon' ? (
          <FileSpreadsheet size={18} />
        ) : effectiveVariant === 'full' ? (
          <>
            <FileSpreadsheet size={isMobile ? 16 : 18} />
            {isMobile ? 'Export Excel' : 'Export Payment Excel'}
          </>
        ) : (
          <>
            <FileSpreadsheet size={14} />
            Export Excel
          </>
        )}
      </button>
    </>
  );
};

export default PaymentExportButton;

// ── Usage ──────────────────────────────────────────────────────────────────
//
// import PaymentExportButton from '../../components/PaymentExportButton';
//
// <PaymentExportButton variant="full"  />   ← मोठा button (mobile वर auto-small)
// <PaymentExportButton variant="small" />   ← compact button
// <PaymentExportButton variant="icon"  />   ← फक्त icon (toolbar साठी)