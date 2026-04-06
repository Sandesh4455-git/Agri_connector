// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = 'http://localhost:8080/api/auth';

const INITIAL_USERS = {
  'admin': {
    id: 'admin_001', username: 'admin', password: 'Admin@123456',
    name: 'System Administrator', phone: '9999999999', city: 'Mumbai',
    state: 'Maharashtra', role: 'admin', avatar: '🛡️',
    createdAt: new Date().toISOString(), verified: true
  },
  'gov.officer': {
    id: 'gov_001', username: 'gov.officer', password: 'Gov@123456',
    name: 'Government Officer', phone: '8888888888', city: 'Delhi',
    state: 'Delhi', role: 'government', avatar: '👨‍💼',
    createdAt: new Date().toISOString(), verified: true
  },
  'customer1': {
    id: 'cust_001', username: 'customer1', password: 'Customer@123',
    name: 'Priya Consumer', phone: '9876543211', city: 'Mumbai',
    state: 'Maharashtra', role: 'customer', avatar: '🛒',
    createdAt: new Date().toISOString(), verified: true
  },
  'farmer1': {
    id: 'farmer_001', username: 'farmer1', password: 'Farmer@123',
    name: 'Raj Patil', phone: '9876543210', city: 'Pune',
    state: 'Maharashtra', role: 'farmer', avatar: '👨‍🌾',
    createdAt: new Date().toISOString(), verified: true
  },
  'dealer1': {
    id: 'dealer_001', username: 'dealer1', password: 'Dealer@123',
    name: 'Vijay Traders', phone: '9123456789', city: 'Mumbai',
    state: 'Maharashtra', role: 'dealer', avatar: '🏢',
    createdAt: new Date().toISOString(), verified: true
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [otpData,         setOtpData]         = useState(null);
  const [allUsers,        setAllUsers]        = useState({});
  const [loading,         setLoading]         = useState(true);

  useEffect(() => { initializeAuth(); }, []);

  const initializeAuth = () => {
    try {
      const storedUser  = localStorage.getItem('agri_connect_user');
      const storedUsers = localStorage.getItem('agri_connect_users');
      const storedOTP   = localStorage.getItem('agri_connect_otp');

      if (storedUsers) {
        setAllUsers(JSON.parse(storedUsers));
      } else {
        setAllUsers(INITIAL_USERS);
        localStorage.setItem('agri_connect_users', JSON.stringify(INITIAL_USERS));
      }

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        // ✅ role sync on app load
        if (parsedUser.role) {
          localStorage.setItem('agri_connect_role', parsedUser.role);
        }
      }

      if (storedOTP) {
        const parsedOTP = JSON.parse(storedOTP);
        if (Date.now() > parsedOTP.expiresAt) {
          localStorage.removeItem('agri_connect_otp');
        } else {
          setOtpData(parsedOTP);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      setLoading(false);
    }
  };

  // ─── SEND OTP ──────────────────────────────────────────────────────────────
  // Calls Spring Boot backend → backend calls Fast2SMS → real SMS येतो
  const sendOTP = async ({ name, username, phone, role, city }) => {
    try {
      if (!phone || phone.length !== 10)
        return { success: false, message: 'Please enter a valid 10-digit phone number' };

      const response = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ phone, name, username, role, city })
      });

      const data = await response.json();

      // Backend returns OTP in data.data (dev/test mode) OR just success:true (prod mode)
      if (data.success) {
        // Store partial OTP info for expiry tracking (code may be null in prod)
        const otpInfo = {
          code: data.data || null,   // null in production (SMS पाठवलेला असतो)
          phone,
          expiresAt: Date.now() + 600000 // 10 minutes (matches otp.expiry.minutes=10)
        };
        setOtpData(otpInfo);
        localStorage.setItem('agri_connect_otp', JSON.stringify(otpInfo));
      }

      return data;
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  };

  // ─── VERIFY OTP ────────────────────────────────────────────────────────────
  // Backend कडे OTP verify करतो — backend DB मधून check करतो
  const verifyOTP = async (enteredOTP) => {
    if (!enteredOTP || enteredOTP.length !== 6)
      return { success: false, message: 'Please enter a valid 6-digit OTP' };

    // 1) Local expiry check
    const storedOTP = localStorage.getItem('agri_connect_otp');
    if (storedOTP) {
      const otpInfo = JSON.parse(storedOTP);
      if (Date.now() > otpInfo.expiresAt) {
        localStorage.removeItem('agri_connect_otp');
        setOtpData(null);
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }

      // 2) If backend returned code in dev mode — local check
      if (otpInfo.code && enteredOTP === otpInfo.code) {
        return { success: true, message: 'OTP verified successfully', userData: { phone: otpInfo.phone } };
      }
    }

    // 3) Backend verify (production path — Fast2SMS OTP)
    try {
      const phone = otpData?.phone || JSON.parse(storedOTP || '{}')?.phone;
      if (phone) {
        const response = await fetch(`${API_URL}/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ phone, otp: enteredOTP })
        });
        const data = await response.json();
        if (data.success) {
          return { success: true, message: 'OTP verified successfully', userData: { phone } };
        }
      }
    } catch (err) {
      console.warn('⚠️ Backend OTP verify failed, using fallback:', err.message);
    }

    // 4) Test code fallback (development only)
    if (enteredOTP === '123456') {
      console.warn('⚠️ Using test OTP 123456 — disable in production!');
      return { success: true, message: 'OTP verified (test code)', userData: {} };
    }

    return { success: false, message: 'Invalid OTP. Please try again.' };
  };

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  const login = async (username, password, role) => {
    try {
      if (!username || !password)
        return { success: false, message: 'Please enter username and password' };

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      const data = await response.json();

      if (data.success && data.data) {
        const userData = data.data;

        // ✅ role store — CropContext आणि बाकी contexts साठी
        localStorage.setItem('agri_connect_token', userData.token);
        localStorage.setItem('agri_connect_user',  JSON.stringify(userData));
        localStorage.setItem('agri_connect_role',  userData.role || '');

        setUser(userData);
        setIsAuthenticated(true);
      }
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, message: 'Server error. Please try again.' };
    }
  };

  // ─── REGISTER ──────────────────────────────────────────────────────────────
  const register = async ({ name, username, phone, password, role, city, otp }) => {
    try {
      if (!name || !username || !phone || !password || !role || !city)
        return { success: false, message: 'Please fill all required fields' };
      if (!otp || otp.length !== 6)
        return { success: false, message: 'Please enter valid OTP' };

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, username, phone, password, role, city, otp })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('agri_connect_otp');
        setOtpData(null);
      }
      return data;
    } catch (error) {
      console.error('❌ Register error:', error);
      return { success: false, message: 'Server error. Please try again.' };
    }
  };

  // ─── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // ✅ logout वेळी role पण clear करतो
    localStorage.removeItem('agri_connect_user');
    localStorage.removeItem('agri_connect_token');
    localStorage.removeItem('agri_connect_role');
  };

  // ─── USERNAME CHECK ────────────────────────────────────────────────────────
  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) return null;
    try {
      const response = await fetch(`${API_URL}/check-username/${username}`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      return data.success === true;
    } catch {
      return true; // fallback: available assume करा
    }
  };

  const checkPhone = (phone) => {
    return !Object.values(allUsers).find(u => u.phone === phone);
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, loading, otpData,
      login, register, logout,
      sendOTP, verifyOTP,
      checkUsernameAvailability,
      checkPhone, allUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };