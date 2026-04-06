// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CropProvider } from './context/CropContext';
import { MarketPriceProvider } from './context/MarketPriceContext';
import { SchemeProvider } from './context/SchemeContext';

// ───────────────── PUBLIC PAGES ─────────────────
import Home           from './pages/Home';
import Login          from './pages/Login';
import Register       from './pages/Register';
import PaymentSuccess from './pages/PaymentSuccess';
import ForgotPassword from './pages/ForgotPassword';
import HelpGuide      from './pages/HelpGuide';

// ───────────────── FARMER PAGES ─────────────────
import {
  FarmerDashboard,
  FarmerCrops,
  FarmerMarketPrices,
  FarmerRequests,
  FarmerDeals,
  FarmerAnalytics,
  FarmerNotifications,
  FarmerProfile,
  FarmerSchemes,
  SchemeDetail,
} from './pages/Farmer/FarmerPages';
import AddCropForm   from './pages/Farmer/AddCropForm';
import FarmerPayments from './pages/Farmer/FarmerPayments';

// ───────────────── DEALER PAGES ─────────────────
import DealerDashboard     from './pages/Dealer/DealerDashboard';
import DealerMarketplace   from './pages/Dealer/DealerMarketplace';
import DealerOrders        from './pages/Dealer/DealerOrders';
import DealerSuppliers     from './pages/Dealer/DealerSuppliers';
import DealerAnalytics     from './pages/Dealer/DealerAnalytics';
import DealerNotifications from './pages/Dealer/DealerNotifications';
import DealerProfile       from './pages/Dealer/DealerProfile';
import DealerPayments      from './pages/Dealer/DealerPayment';

// ───────────────── CUSTOMER PAGES ─────────────────
import CustomerDashboard   from './pages/Customer/CustomerDashboard';
import BrowseProducts      from './pages/Customer/BrowseProducts';
import MyOrders            from './pages/Customer/MyOrders';
import MyRequests          from './pages/Customer/MyRequest';
import MyTransactions      from './pages/Customer/MyTransactions';
import CustomerMarketPrices from './pages/Customer/CustomerMarketPrices';
import CustomerProfile     from './pages/Customer/CustomerProfile';

// ───────────────── ADMIN PAGES ─────────────────
import AdminDashboard        from './pages/Admin/AdminDashboard';
import AdminCredentials      from './pages/Admin/AdminCredentials';
import UserManagement        from './pages/Admin/UserManagement';
import SchemeManagement      from './pages/Admin/SchemeManagement';
import MarketPriceManagement from './pages/Admin/MarketPriceManagement';
import AnalyticsDashboard    from './pages/Admin/AnalyticsDashboard';
import SystemSettings        from './pages/Admin/SystemSettings';

// ───────────────── LAYOUT COMPONENTS ─────────────────
import Navbar  from './components/Navbar';
import Sidebar from './components/Sidebar';


// ─────────────────────────────────────────────────────
// DASHBOARD LAYOUT
// ─────────────────────────────────────────────────────
const DashboardLayout = ({ role }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <div className="flex">
      <Sidebar role={role} />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  </div>
);


// ─────────────────────────────────────────────────────
// PROTECTED ROUTE
// ─────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f0fdf4' }}>
        <div style={{ width:40, height:40, border:'3px solid #dcfce7', borderTop:'3px solid #16a34a', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Fallback to localStorage (PayU redirect fix)
  const token      = localStorage.getItem('agri_connect_token');
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('agri_connect_user') || 'null'); }
    catch { return null; }
  })();

  const effectiveAuth = isAuthenticated || !!token;
  const effectiveUser = user || storedUser;

  if (!effectiveAuth) {
    const returnTo = window.location.pathname + window.location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(returnTo)}`} replace />;
  }

  if (allowedRole && effectiveUser?.role !== allowedRole) {
    return <Navigate to={`/${effectiveUser?.role}/dashboard`} replace />;
  }

  return children;
};


// ─────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>

      {/* ── PUBLIC ROUTES ── */}
      <Route path="/"                 element={<Home />} />
      <Route path="/login"            element={<Login />} />
      <Route path="/register"         element={<Register />} />
      <Route path="/payment-success"  element={<PaymentSuccess />} />
      <Route path="/forgot-password"  element={<ForgotPassword />} />
      <Route path="/help"             element={<HelpGuide />} />
      <Route path="/admin/credentials" element={<AdminCredentials />} />

      {/* ── FARMER ROUTES ── */}
      <Route path="/farmer" element={
        <ProtectedRoute allowedRole="farmer">
          <DashboardLayout role="farmer" />
        </ProtectedRoute>
      }>
        <Route index                    element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"         element={<FarmerDashboard />} />
        <Route path="crops"             element={<FarmerCrops />} />
        <Route path="add-crop"          element={<AddCropForm />} />
        <Route path="market-prices"     element={<FarmerMarketPrices />} />
        <Route path="requests"          element={<FarmerRequests />} />
        <Route path="deals"             element={<FarmerDeals />} />
        <Route path="payments"          element={<FarmerPayments />} />
        <Route path="schemes"           element={<FarmerSchemes />} />
        <Route path="schemes/:id"       element={<SchemeDetail />} />
        <Route path="analytics"         element={<FarmerAnalytics />} />
        <Route path="notifications"     element={<FarmerNotifications />} />
        <Route path="profile"           element={<FarmerProfile />} />
      </Route>

      {/* ── DEALER ROUTES ── */}
      <Route path="/dealer" element={
        <ProtectedRoute allowedRole="dealer">
          <DashboardLayout role="dealer" />
        </ProtectedRoute>
      }>
        <Route index                element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<DealerDashboard />} />
        <Route path="marketplace"   element={<DealerMarketplace />} />
        <Route path="orders"        element={<DealerOrders />} />
        <Route path="suppliers"     element={<DealerSuppliers />} />
        <Route path="analytics"     element={<DealerAnalytics />} />
        <Route path="notifications" element={<DealerNotifications />} />
        <Route path="profile"       element={<DealerProfile />} />
        <Route path="payments"      element={<DealerPayments />} />
      </Route>

      {/* ── CUSTOMER ROUTES ── */}
      <Route path="/customer" element={
        <ProtectedRoute allowedRole="customer">
          <DashboardLayout role="customer" />
        </ProtectedRoute>
      }>
        <Route index                  element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"       element={<CustomerDashboard />} />
        <Route path="browse"          element={<BrowseProducts />} />
        <Route path="orders"          element={<MyOrders />} />
        <Route path="requests"        element={<MyRequests />} />
        <Route path="transactions"    element={<MyTransactions />} />
        <Route path="market-prices"   element={<CustomerMarketPrices />} />
        <Route path="profile"         element={<CustomerProfile />} />
      </Route>

      {/* ── ADMIN ROUTES ── */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRole="admin">
          <DashboardLayout role="admin" />
        </ProtectedRoute>
      }>
        <Route index                  element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"       element={<AdminDashboard />} />
        <Route path="users"           element={<UserManagement />} />
        <Route path="schemes"         element={<SchemeManagement />} />
        <Route path="market-prices"   element={<MarketPriceManagement />} />
        <Route path="analytics"       element={<AnalyticsDashboard />} />
        <Route path="settings"        element={<SystemSettings />} />
      </Route>

      {/* ── FALLBACK ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}


// ─────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────
function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <LanguageProvider>
          <CropProvider>
            <MarketPriceProvider>
              <SchemeProvider>
                <AppRoutes />
              </SchemeProvider>
            </MarketPriceProvider>
          </CropProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;