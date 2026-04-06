// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutModal from './LogoutModal';
import {
  LayoutDashboard, Sprout, Store, Shield, Settings, LogOut,
  Package, TrendingUp, DollarSign, FileText, Users, Bell,
  ShoppingCart, Award, BarChart3, HelpCircle, BookOpen,
  UserCircle, X, Menu,
} from 'lucide-react';

// ── Responsive hook ───────────────────────────────────────────
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
};

const Sidebar = ({ role }) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const isMobile         = useIsMobile();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileOpen,      setMobileOpen]      = useState(false);

  // Close on route change (mobile)
  useEffect(() => { setMobileOpen(false); }, []);

  // ─── Menu Items ───────────────────────────────────────────────────────────
  const adminMenu = [
    { path: '/admin/dashboard',     name: 'Dashboard',       icon: LayoutDashboard },
    { path: '/admin/users',         name: 'User Management', icon: Users },
    { path: '/admin/schemes',       name: 'Schemes',         icon: FileText },
    { path: '/admin/market-prices', name: 'Market Prices',   icon: DollarSign },
    { path: '/admin/analytics',     name: 'Analytics',       icon: BarChart3 },
    { path: '/admin/settings',      name: 'Settings',        icon: Settings },
    { path: '/admin/credentials',   name: 'Credentials',     icon: Shield },
  ];
  const farmerMenu = [
    { path: '/farmer/dashboard',     name: 'Dashboard',          icon: LayoutDashboard },
    { path: '/farmer/crops',         name: 'My Crops',           icon: Package },
    { path: '/farmer/market-prices', name: 'Market Prices',      icon: TrendingUp },
    { path: '/farmer/requests',      name: 'Requests',           icon: FileText },
    { path: '/farmer/payments',      name: 'Payments',           icon: DollarSign },
    { path: '/farmer/schemes',       name: 'Government Schemes', icon: BookOpen },
    { path: '/farmer/analytics',     name: 'Analytics',          icon: BarChart3 },
    { path: '/farmer/notifications', name: 'Notifications',      icon: Bell },
    { path: '/farmer/profile',       name: 'Profile',            icon: UserCircle },
  ];
  const dealerMenu = [
    { path: '/dealer/dashboard',     name: 'Dashboard',     icon: LayoutDashboard },
    { path: '/dealer/marketplace',   name: 'Marketplace',   icon: Store },
    { path: '/dealer/orders',        name: 'Orders',        icon: ShoppingCart },
    { path: '/dealer/suppliers',     name: 'Suppliers',     icon: Users },
    { path: '/dealer/analytics',     name: 'Analytics',     icon: BarChart3 },
    { path: '/dealer/payments',      name: 'Payments',      icon: DollarSign },
    { path: '/dealer/notifications', name: 'Notifications', icon: Bell },
    { path: '/dealer/profile',       name: 'Profile',       icon: UserCircle },
  ];
  const customerMenu = [
    { path: '/customer/dashboard',     name: 'Dashboard',       icon: LayoutDashboard },
    { path: '/customer/browse',        name: 'Browse Products', icon: Package },
    { path: '/customer/orders',        name: 'My Orders',       icon: ShoppingCart },
    { path: '/customer/requests',      name: 'My Requests',     icon: FileText },
    { path: '/customer/transactions',  name: 'Transactions',    icon: DollarSign },
    { path: '/customer/market-prices', name: 'Market Prices',   icon: TrendingUp },
    { path: '/customer/profile',       name: 'Profile',         icon: UserCircle },
  ];

  const getMenuItems = () => {
    switch (role) {
      case 'admin':    return adminMenu;
      case 'farmer':   return farmerMenu;
      case 'dealer':   return dealerMenu;
      case 'customer': return customerMenu;
      default:         return [];
    }
  };

  const getBg = () => {
    switch (role) {
      case 'admin':    return 'linear-gradient(180deg,#1f2937,#111827)';
      case 'farmer':   return 'linear-gradient(180deg,#14532d,#166534)';
      case 'dealer':   return 'linear-gradient(180deg,#1e3a8a,#1e40af)';
      case 'customer': return 'linear-gradient(180deg,#581c87,#6b21a8)';
      default:         return 'linear-gradient(180deg,#1f2937,#111827)';
    }
  };

  const getActiveBg = () => {
    switch (role) {
      case 'admin':    return 'linear-gradient(90deg,#2563eb,#06b6d4)';
      case 'farmer':   return 'linear-gradient(90deg,#16a34a,#059669)';
      case 'dealer':   return 'linear-gradient(90deg,#2563eb,#06b6d4)';
      case 'customer': return 'linear-gradient(90deg,#7c3aed,#6366f1)';
      default:         return 'linear-gradient(90deg,#2563eb,#06b6d4)';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':    return <Shield size={22} />;
      case 'farmer':   return <Sprout size={22} />;
      case 'dealer':   return <Store size={22} />;
      case 'customer': return <Award size={22} />;
      default:         return <LayoutDashboard size={22} />;
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const menuItems = getMenuItems();

  // ── Sidebar inner content ──
  const SidebarContent = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Logo */}
      <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            {getRoleIcon()}
            <h2 style={{ fontSize:18, fontWeight:800, color:'white', margin:0, fontFamily:'Georgia,serif' }}>Agri Connect</h2>
          </div>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', margin:0, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'pulse 2s infinite' }}/>
            {role} Panel
          </p>
        </div>
        {/* Close button — mobile only */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{ background:'rgba(255,255,255,.1)', border:'none', borderRadius:8, padding:'6px 8px', cursor:'pointer', color:'white', display:'flex', alignItems:'center' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:'auto', padding:'12px 0', paddingBottom:80 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => isMobile && setMobileOpen(false)}
            style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:12,
              padding:'11px 20px',
              fontSize:13, fontWeight:600,
              color: isActive ? 'white' : 'rgba(255,255,255,.65)',
              background: isActive ? getActiveBg() : 'transparent',
              borderLeft: isActive ? '3px solid white' : '3px solid transparent',
              textDecoration:'none',
              transition:'all .18s',
              boxShadow: isActive ? '0 4px 12px rgba(0,0,0,.3)' : 'none',
            })}
          >
            <item.icon size={17} style={{ flexShrink:0 }} />
            <span style={{ flex:1 }}>{item.name}</span>
          </NavLink>
        ))}

        {/* Logout */}
        <button
          onClick={() => { setMobileOpen(false); setShowLogoutModal(true); }}
          style={{
            width:'100%', display:'flex', alignItems:'center', gap:12,
            padding:'11px 20px',
            fontSize:13, fontWeight:600,
            color:'rgba(248,113,113,.85)',
            background:'transparent',
            border:'none', borderLeft:'3px solid transparent',
            cursor:'pointer', textAlign:'left',
            transition:'all .18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,.15)'; e.currentTarget.style.color='#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(248,113,113,.85)'; }}
        >
          <LogOut size={17} style={{ flexShrink:0 }} />
          <span>Logout</span>
        </button>
      </nav>

      {/* Footer */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'14px 20px', background:'linear-gradient(to top, rgba(0,0,0,.4), transparent)' }}>
        <p style={{ fontSize:11, color:'rgba(255,255,255,.3)', margin:'0 0 2px' }}>Version 2.0.0 · © 2024 Agri Connect</p>
        <button
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'rgba(255,255,255,.4)', fontSize:11, cursor:'pointer', padding:0 }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,.8)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.4)'}
        >
          <HelpCircle size={12} /> Need help?
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        .sidebar-scroll::-webkit-scrollbar{width:3px}
        .sidebar-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:4px}
      `}</style>

      {/* ── DESKTOP: fixed sidebar ── */}
      {!isMobile && (
        <div
          style={{
            width:240, flexShrink:0,
            background: getBg(),
            height:'100vh', position:'sticky', top:0,
            overflowY:'auto', overflowX:'hidden',
            boxShadow:'4px 0 20px rgba(0,0,0,.2)',
            fontFamily:'system-ui,sans-serif',
          }}
          className="sidebar-scroll"
        >
          <SidebarContent />
        </div>
      )}

      {/* ── MOBILE: hamburger button (shown in Navbar area) ── */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            position:'fixed', top:10, left:12, zIndex:200,
            background:'linear-gradient(135deg,#15803d,#059669)',
            border:'none', borderRadius:10, padding:'9px 10px',
            cursor:'pointer', display:'flex', alignItems:'center',
            boxShadow:'0 4px 14px rgba(0,0,0,.25)',
          }}
          aria-label="Open menu"
        >
          <Menu size={20} color="white" />
        </button>
      )}

      {/* ── MOBILE: overlay backdrop ── */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position:'fixed', inset:0, zIndex:300,
            background:'rgba(0,0,0,.55)',
            backdropFilter:'blur(4px)',
          }}
        />
      )}

      {/* ── MOBILE: slide-in drawer ── */}
      {isMobile && (
        <div
          style={{
            position:'fixed', top:0, left:0, bottom:0,
            width:260, zIndex:400,
            background: getBg(),
            boxShadow:'6px 0 30px rgba(0,0,0,.35)',
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition:'transform .28s cubic-bezier(.22,1,.36,1)',
            fontFamily:'system-ui,sans-serif',
            overflowY:'auto',
          }}
          className="sidebar-scroll"
        >
          <SidebarContent />
        </div>
      )}

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
        userName={user?.name}
      />
    </>
  );
};

export default Sidebar;