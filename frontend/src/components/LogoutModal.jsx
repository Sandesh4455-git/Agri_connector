// src/components/LogoutModal.jsx
import React, { useEffect, useState } from 'react';
import { LogOut, X } from 'lucide-react';

const LogoutModal = ({ isOpen, onConfirm, onCancel, userName }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay so animation triggers properly
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  // Prevent background scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const firstName = userName ? userName.split(' ')[0] : 'User';

  return (
    <>
      <style>{`
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.88) translateY(30px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalInMobile {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
        @keyframes barSlide {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .lm-btn-cancel { transition: all .2s cubic-bezier(.22,1,.36,1) !important; }
        .lm-btn-cancel:hover { background: #f3f4f6 !important; transform: translateY(-1px); }
        .lm-btn-logout { transition: all .2s cubic-bezier(.22,1,.36,1) !important; }
        .lm-btn-logout:hover { background: linear-gradient(135deg,#dc2626,#b91c1c) !important; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(220,38,38,.45) !important; }
        .lm-close { transition: all .15s !important; }
        .lm-close:hover { background: #fee2e2 !important; color: #ef4444 !important; border-color: #fecaca !important; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position:'fixed', inset:0, zIndex:9998,
          background:'rgba(0,0,0,0.6)',
          backdropFilter:'blur(8px)',
          WebkitBackdropFilter:'blur(8px)',
          animation:'backdropIn .25s ease forwards',
        }}
      />

      {/* Modal wrapper */}
      <div style={{
        position:'fixed', inset:0, zIndex:9999,
        display:'flex',
        alignItems: window.innerWidth < 640 ? 'flex-end' : 'center',
        justifyContent:'center',
        padding: window.innerWidth < 640 ? 0 : 20,
        pointerEvents:'none',
      }}>
        <div style={{
          pointerEvents:'auto',
          width:'100%',
          maxWidth: window.innerWidth < 640 ? '100%' : 420,
          background:'white',
          borderRadius: window.innerWidth < 640 ? '20px 20px 0 0' : 28,
          overflow:'hidden',
          boxShadow:'0 32px 80px rgba(0,0,0,.22), 0 0 0 1px rgba(0,0,0,.06)',
          animation: window.innerWidth < 640 ? 'modalInMobile .32s cubic-bezier(.22,1,.36,1) forwards' : 'modalIn .3s cubic-bezier(.22,1,.36,1) forwards',
        }}>

          {/* Top accent bar */}
          <div style={{
            height:4,
            background:'linear-gradient(90deg,#ef4444 0%,#f97316 50%,#ef4444 100%)',
            transformOrigin:'left',
            animation:'barSlide .4s .1s cubic-bezier(.22,1,.36,1) both',
          }} />

          {/* Close btn */}
          <div style={{ position:'relative' }}>
            <button
              className="lm-close"
              onClick={onCancel}
              style={{
                position:'absolute', top:14, right:14,
                width:32, height:32, borderRadius:9,
                border:'1.5px solid #e5e7eb',
                background:'white', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#9ca3af', zIndex:1,
              }}
            >
              <X size={14} />
            </button>

            {/* Body */}
            <div style={{
              padding: window.innerWidth < 640 ? '32px 24px 28px' : '40px 36px 32px',
              textAlign:'center',
            }}>

              {/* Icon */}
              <div style={{
                width:72, height:72,
                borderRadius:'50%',
                background:'linear-gradient(135deg,#fff1f2,#ffe4e6)',
                border:'3px solid #fecaca',
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 20px',
                animation:'iconPulse 2.5s ease-in-out infinite',
                boxShadow:'0 8px 30px rgba(239,68,68,.18)',
              }}>
                <LogOut size={30} color="#ef4444" strokeWidth={2} />
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: window.innerWidth < 640 ? 18 : 22,
                fontWeight:800,
                color:'#0f172a', margin:'0 0 10px',
                fontFamily:'system-ui,-apple-system,sans-serif',
                letterSpacing:'-0.3px',
              }}>
                Are you sure you want to logout?
              </h2>

              {/* Subtitle */}
              <div style={{
                background:'linear-gradient(135deg,#f8fafc,#f1f5f9)',
                border:'1px solid #e2e8f0',
                borderRadius:12, padding:'10px 14px',
                margin:'0 0 22px',
              }}>
                <p style={{ fontSize:13, color:'#475569', margin:0, lineHeight:1.6 }}>
                  👋 Hey <strong style={{ color:'#0f172a' }}>{firstName}</strong>, your current
                  session will end and you will need to log in again.
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display:'flex', gap:10 }}>
                <button
                  className="lm-btn-cancel"
                  onClick={onCancel}
                  style={{
                    flex:1, padding:'13px 0',
                    borderRadius:14,
                    border:'2px solid #e2e8f0',
                    background:'white',
                    fontSize:14, fontWeight:700,
                    color:'#374151', cursor:'pointer',
                    fontFamily:'system-ui,sans-serif',
                  }}
                >
                  Cancel
                </button>

                <button
                  className="lm-btn-logout"
                  onClick={onConfirm}
                  style={{
                    flex:1, padding:'13px 0',
                    borderRadius:14, border:'none',
                    background:'linear-gradient(135deg,#ef4444,#dc2626)',
                    fontSize:14, fontWeight:700,
                    color:'white', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    boxShadow:'0 4px 18px rgba(239,68,68,.35)',
                    fontFamily:'system-ui,sans-serif',
                  }}
                >
                  <LogOut size={15} />
                  Yes, Logout
                </button>
              </div>

              {/* Hint */}
              <p style={{ fontSize:11, color:'#94a3b8', margin:'14px 0 0', letterSpacing:'0.2px' }}>
                Press ESC or click outside to cancel
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutModal;