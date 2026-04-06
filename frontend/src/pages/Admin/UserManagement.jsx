import React, { useState, useEffect } from 'react';
import { Search, Trash2, ShieldOff, ShieldCheck, RefreshCw } from 'lucide-react';

const API = 'http://localhost:8080/api/admin';
const getToken = () => localStorage.getItem('agri_connect_token');

const roleColor = (role) => {
  switch (role) {
    case 'farmer':   return { bg: '#f0fdf4', color: '#16a34a' };
    case 'dealer':   return { bg: '#fef3c7', color: '#d97706' };
    case 'admin':    return { bg: '#eff6ff', color: '#2563eb' };
    case 'customer': return { bg: '#fdf4ff', color: '#9333ea' };
    default:         return { bg: '#f3f4f6', color: '#6b7280' };
  }
};

const UserManagement = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');
  const [toast,   setToast]   = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/users`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setUsers(data.data || []);
    } catch { showToast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  };

  const deleteUser = async (id) => {
    try {
      const res  = await fetch(`${API}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) { setUsers(prev => prev.filter(u => u.id !== id)); showToast('User deleted'); }
      else showToast(data.message || 'Failed', 'error');
    } catch { showToast('Error', 'error'); }
    setConfirm(null);
  };

  const toggleBlock = async (id) => {
    try {
      const res  = await fetch(`${API}/users/${id}/toggle-block`, { method: 'PUT', headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, verified: !u.verified } : u));
        showToast(data.message);
      }
    } catch { showToast('Error', 'error'); }
    setConfirm(null);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q) || u.phone?.includes(q);
    const matchRole   = filter === 'all' || u.role === filter;
    return matchSearch && matchRole;
  });

  return (
    <div style={{ padding: '16px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }

        /* ── Header ── */
        .um-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 10px;
        }

        /* ── Search + filter bar ── */
        .um-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .um-search {
          position: relative;
          flex: 1 1 160px;
          min-width: 0;
        }
        .um-search input {
          width: 100%;
          padding: 9px 12px 9px 32px;
          border: 1.5px solid #e5e7eb;
          border-radius: 9px;
          font-size: 13px;
          outline: none;
          background: white;
        }
        .um-search .icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }
        .um-select {
          padding: 9px 12px;
          border: 1.5px solid #e5e7eb;
          border-radius: 9px;
          font-size: 13px;
          outline: none;
          background: white;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* ── TABLE view (≥ 600 px) ── */
        .um-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          background: white;
          box-shadow: 0 1px 6px rgba(0,0,0,.06);
        }
        .um-table-wrap::-webkit-scrollbar { height: 4px; }
        .um-table-wrap::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
        .um-table { width: 100%; border-collapse: collapse; min-width: 580px; }
        .um-table thead tr { background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .um-table th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .04em; white-space: nowrap; }
        .um-table tbody tr { border-bottom: 1px solid #f3f4f6; transition: background .15s; }
        .um-table tbody tr:hover td { background: #fafafa; }
        .um-table td { padding: 11px 12px; }

        /* ── CARD view (< 600 px) ── */
        .um-cards { display: flex; flex-direction: column; gap: 10px; }
        .um-card {
          background: white;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          padding: 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,.05);
          animation: fadeIn .2s;
        }
        .um-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .um-card-avatar {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 700;
          flex-shrink: 0;
        }
        .um-card-name { font-size: 14px; font-weight: 700; color: #111827; }
        .um-card-username { font-size: 12px; color: #6b7280; }
        .um-card-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 10px;
          margin-bottom: 12px;
        }
        .um-card-field label { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .04em; display: block; margin-bottom: 2px; }
        .um-card-field span  { font-size: 12px; color: #374151; }
        .um-card-actions { display: flex; gap: 8px; }
        .um-badge { padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: capitalize; }

        /* ── Responsive switch ── */
        .um-table-wrap { display: block; }
        .um-cards      { display: none; }
        @media (max-width: 599px) {
          .um-table-wrap { display: none; }
          .um-cards      { display: flex; }
        }

        /* ── Action buttons ── */
        .um-btn-block {
          flex: 1;
          display: inline-flex; align-items: center; justify-content: center; gap: 5px;
          padding: 8px 12px;
          border: none; border-radius: 8px;
          font-size: 12px; font-weight: 600; cursor: pointer;
        }
        .um-btn-delete {
          flex: 1;
          display: inline-flex; align-items: center; justify-content: center; gap: 5px;
          padding: 8px 12px;
          background: #fee2e2; color: #dc2626;
          border: none; border-radius: 8px;
          font-size: 12px; font-weight: 600; cursor: pointer;
        }
        .um-icon-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 5px 8px; border: none; border-radius: 7px; cursor: pointer;
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'white', border: `1.5px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`, color: toast.type === 'error' ? '#dc2626' : '#15803d', boxShadow: '0 6px 20px rgba(0,0,0,.1)', animation: 'fadeIn .2s', maxWidth: 'calc(100vw - 32px)' }}>
          {toast.text}
        </div>
      )}

      {/* Confirm Modal */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '24px 20px', width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
              {confirm.action === 'delete' ? '🗑️ Delete User?' : '🔒 Block/Unblock User?'}
            </p>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
              {confirm.action === 'delete'
                ? `"${confirm.name}" will be permanently deleted.`
                : `Toggle block status for "${confirm.name}".`}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirm(null)} style={{ flex: 1, padding: 9, background: 'white', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button
                onClick={() => confirm.action === 'delete' ? deleteUser(confirm.id) : toggleBlock(confirm.id)}
                style={{ flex: 1, padding: 9, background: confirm.action === 'delete' ? '#dc2626' : '#d97706', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
              >
                {confirm.action === 'delete' ? 'Delete' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="um-header">
        <div>
          <h1 style={{ fontSize: 'clamp(17px, 4vw, 22px)', fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'Georgia,serif' }}>User Management</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>{users.length} total users</p>
        </div>
        <button
          onClick={fetchUsers}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Search + Filter */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 1px 6px rgba(0,0,0,.06)', padding: '12px 14px', marginBottom: 14 }}>
        <div className="um-filters">
          <div className="um-search">
            <Search size={13} className="icon" />
            <input
              placeholder="Search name, username, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="um-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="farmer">Farmers</option>
            <option value="dealer">Dealers</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 14, border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: 32, margin: '0 0 10px' }}>👥</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>No users found</p>
        </div>
      ) : (
        <>
          {/* ── TABLE (≥ 600px) ── */}
          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  {['#','Name','Username','Phone','City','Role','Status','Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => {
                  const rc = roleColor(user.role);
                  return (
                    <tr key={user.id}>
                      <td style={{ fontSize: 11, color: '#9ca3af' }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: rc.color, flexShrink: 0 }}>
                            {(user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{user.name || '—'}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>@{user.username}</td>
                      <td style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{user.phone || '—'}</td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>{user.city || '—'}</td>
                      <td>
                        <span className="um-badge" style={{ background: rc.bg, color: rc.color }}>{user.role}</span>
                      </td>
                      <td>
                        <span className="um-badge" style={{ background: user.verified ? '#dcfce7' : '#fee2e2', color: user.verified ? '#16a34a' : '#dc2626' }}>
                          {user.verified ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td>
                        {user.role !== 'admin' && (
                          <div style={{ display: 'flex', gap: 5 }}>
                            <button className="um-icon-btn" onClick={() => setConfirm({ id: user.id, name: user.name, action: 'block' })} title={user.verified ? 'Block' : 'Unblock'}
                              style={{ background: user.verified ? '#fef3c7' : '#dcfce7', color: user.verified ? '#d97706' : '#16a34a' }}>
                              {user.verified ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                            </button>
                            <button className="um-icon-btn" onClick={() => setConfirm({ id: user.id, name: user.name, action: 'delete' })} title="Delete"
                              style={{ background: '#fee2e2', color: '#dc2626' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── CARDS (< 600px) ── */}
          <div className="um-cards">
            {filtered.map((user) => {
              const rc = roleColor(user.role);
              return (
                <div key={user.id} className="um-card">
                  <div className="um-card-top">
                    <div className="um-card-avatar" style={{ background: rc.bg, color: rc.color }}>
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="um-card-name">{user.name || '—'}</div>
                      <div className="um-card-username">@{user.username}</div>
                    </div>
                    <span className="um-badge" style={{ background: user.verified ? '#dcfce7' : '#fee2e2', color: user.verified ? '#16a34a' : '#dc2626' }}>
                      {user.verified ? 'Active' : 'Blocked'}
                    </span>
                  </div>

                  <div className="um-card-grid">
                    <div className="um-card-field">
                      <label>Phone</label>
                      <span>{user.phone || '—'}</span>
                    </div>
                    <div className="um-card-field">
                      <label>City</label>
                      <span>{user.city || '—'}</span>
                    </div>
                    <div className="um-card-field">
                      <label>Role</label>
                      <span className="um-badge" style={{ background: rc.bg, color: rc.color }}>{user.role}</span>
                    </div>
                  </div>

                  {user.role !== 'admin' && (
                    <div className="um-card-actions">
                      <button
                        className="um-btn-block"
                        onClick={() => setConfirm({ id: user.id, name: user.name, action: 'block' })}
                        style={{ background: user.verified ? '#fef3c7' : '#dcfce7', color: user.verified ? '#d97706' : '#16a34a' }}
                      >
                        {user.verified ? <><ShieldOff size={13} /> Block</> : <><ShieldCheck size={13} /> Unblock</>}
                      </button>
                      <button className="um-btn-delete" onClick={() => setConfirm({ id: user.id, name: user.name, action: 'delete' })}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;