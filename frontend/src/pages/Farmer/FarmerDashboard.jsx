// FarmerDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChatBot from '../../components/Chatbot/ChatBot';
import {
  Package,
  TrendingUp,
  Users,
  ShoppingCart,
  PlusCircle,
  BarChart3,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  X
} from 'lucide-react';

const API_URL = 'http://localhost:8080/api/dashboard/farmer';
const getToken = () => localStorage.getItem('agri_connect_token');

const FarmerDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setDashData(data.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoStr) => {
    try {
      const date = new Date(isoStr);
      const diff = Math.floor((Date.now() - date.getTime()) / 60000);
      if (diff < 60) return `${diff} min ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
      return `${Math.floor(diff / 1440)} days ago`;
    } catch {
      return 'Recently';
    }
  };

  const statusIcon = (status) => {
    if (status === 'pending')
      return <Clock size={14} className="text-yellow-500" />;
    if (status === 'accepted' || status === 'completed' || status === 'active')
      return <CheckCircle size={14} className="text-green-500" />;
    return <AlertCircle size={14} className="text-red-500" />;
  };

  const stats = dashData
    ? [
        {
          title: t?.myCrops || 'My Crops',
          value: dashData.totalCrops,
          icon: Package,
          color: 'green',
          change: `${dashData.totalCrops} listed`
        },
        {
          title: t?.activeDeals || 'Active Deals',
          value: dashData.activeDeals,
          icon: ShoppingCart,
          color: 'blue',
          change: `${dashData.pendingRequests} pending requests`
        },
        {
          title: t?.totalRevenue || 'Total Revenue',
          value: `₹${(dashData.totalRevenue || 0).toLocaleString()}`,
          icon: TrendingUp,
          color: 'orange',
          change: 'from completed deals'
        },
        {
          title: t?.buyers || 'Buyers',
          value: dashData.uniqueBuyers,
          icon: Users,
          color: 'purple',
          change: 'unique dealers'
        }
      ]
    : [];

  return (
    <div className="p-3 sm:p-4 lg:p-6 relative min-h-screen">
      <style>{`
        .quick-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }
        @media (min-width: 768px) {
          .quick-actions-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }
        @media (min-width: 480px) {
          .summary-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t.dashboard}</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            {t.welcomeback}, {user?.name || 'Farmer'}! 👋
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-200 px-2.5 sm:px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-all text-xs sm:text-sm shadow-sm flex-shrink-0"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">{t.refresh}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-green-500" size={40} />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 mb-5 sm:mb-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all"
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-2 sm:mb-3`}
                >
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${stat.color}-600`} />
                </div>
                <p className="text-gray-500 text-xs mb-0.5 sm:mb-1">{stat.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5 sm:mt-1 line-clamp-1">{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-grid">
            <button
              onClick={() => navigate('/farmer/crops')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg text-xs sm:text-sm"
            >
              <PlusCircle size={16} />
              <span className="truncate">{t.manageCrops}</span>
            </button>

            <button
              onClick={() => navigate('/farmer/market-prices')}
              className="bg-white text-green-600 border-2 border-green-200 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-green-50 shadow-sm text-xs sm:text-sm"
            >
              <ShoppingCart size={16} />
              <span className="truncate">{t.marketPrices}</span>
            </button>

            <button
              onClick={() => navigate('/farmer/analytics')}
              className="bg-white text-green-600 border-2 border-green-200 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-green-50 shadow-sm text-xs sm:text-sm"
            >
              <BarChart3 size={16} />
              <span className="truncate">{t?.viewAnalytics || 'Analytics'}</span>
            </button>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg text-xs sm:text-sm"
            >
              <MessageCircle size={16} />
              <span className="truncate">{isChatOpen ? (t?.closeChat || 'Close') : (t?.agriAssist || 'AgriAssist')}</span>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="summary-grid">
            <SummaryCard
              title={t?.pendingRequests || 'Pending Requests'}
              value={dashData?.pendingRequests || 0}
              icon={Clock}
              color="yellow"
            />
            <SummaryCard
              title={t?.activeDeals || 'Active Deals'}
              value={dashData?.activeDeals || 0}
              icon={CheckCircle}
              color="green"
            />
            <SummaryCard
              title={t?.uniqueBuyers || 'Unique Buyers'}
              value={dashData?.uniqueBuyers || 0}
              icon={Users}
              color="purple"
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-gray-100">
            <h2 className="text-sm sm:text-base font-bold text-gray-800 mb-3 sm:mb-4">
              {t.recentActivity}
            </h2>

            {(dashData?.recentActivity || []).length === 0 ? (
              <p className="text-gray-400 text-xs sm:text-sm text-center py-6">
                {t.norecentactivityyet}
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {dashData.recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-xl gap-2"
                  >
                    <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                      <div className="mt-0.5 flex-shrink-0">{statusIcon(activity.status)}</div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTime(activity.time)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium flex-shrink-0 ml-2">
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Chatbot */}
      {isChatOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-auto max-w-sm">
          <div className="relative">
            <button
              onClick={() => setIsChatOpen(false)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-lg z-10"
            >
              <X size={16} />
            </button>
            <ChatBot userType="farmer" language="marathi" />
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 sm:p-4 rounded-full shadow-lg flex items-center gap-2 group z-40"
        >
          <MessageCircle size={22} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all whitespace-nowrap text-sm">
            {t?.agriAssist || 'AgriAssist'}
          </span>
        </button>
      )}
    </div>
  );
};

/* Reusable Summary Card */
const SummaryCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-${color}-50 border border-${color}-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3`}>
    <div className={`w-9 h-9 sm:w-10 sm:h-10 bg-${color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon size={18} className={`text-${color}-600`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 truncate">{title}</p>
      <p className={`text-lg sm:text-xl font-bold text-${color}-700`}>{value}</p>
    </div>
  </div>
);

export default FarmerDashboard;