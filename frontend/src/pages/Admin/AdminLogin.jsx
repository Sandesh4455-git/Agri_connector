import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

const API = 'http://localhost:8080/api/admin';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Enter username and password'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('agri_connect_token', data.data.token);
        localStorage.setItem('agri_connect_user',  JSON.stringify(data.data.user));
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch { setError('Server error — is backend running?'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#1e1b4b,#312e81,#4f46e5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: 'system-ui,sans-serif',
      boxSizing: 'border-box',
    }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        * { box-sizing: border-box; }
        
        .login-card {
          width: 100%;
          max-width: 400px;
          background: white;
          border-radius: 20px;
          padding: 32px 28px;
          box-shadow: 0 25px 60px rgba(0,0,0,.3);
        }
        
        @media (max-width: 400px) {
          .login-card {
            padding: 24px 20px;
            border-radius: 16px;
          }
        }
        
        .login-input {
          width: 100%;
          padding: 11px 13px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: border-color .2s;
          font-family: system-ui, sans-serif;
        }
        .login-input:focus { border-color: #4f46e5; }
        
        .login-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg,#4f46e5,#7c3aed);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity .2s, transform .1s;
          font-family: system-ui, sans-serif;
        }
        .login-btn:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); }
        .login-btn:active { transform: translateY(0); }
      `}</style>

      <div className="login-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 24px rgba(79,70,229,.35)'
          }}>
            <ShieldCheck size={30} color="white" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px', fontFamily: 'Georgia,serif' }}>Admin Portal</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Agri Connect Administration</p>
        </div>

        <form onSubmit={handleLogin} noValidate>
          {/* Username */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>
              Username
            </label>
            <input
              className="login-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="login-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                style={{ paddingRight: 42 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 4 }}
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '9px 12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 14 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} className="login-btn" style={{ opacity: loading ? .7 : 1 }}>
            {loading
              ? <><div style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Signing in...</>
              : '🔐 Sign In'}
          </button>
        </form>

        {/* Default creds hint */}
        <div style={{ marginTop: 20, padding: '12px 14px', background: '#f5f3ff', borderRadius: 10, border: '1px solid #ddd6fe' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', margin: '0 0 4px' }}>Default Credentials</p>
          <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
            Username: <strong>admin</strong> | Password: <strong>Admin@123456</strong>
          </p>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>
            First time? Call /api/admin/setup to create admin account
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;