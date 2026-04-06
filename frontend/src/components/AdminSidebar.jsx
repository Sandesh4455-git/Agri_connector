// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  Store,
  Shield,
  Settings,
  LogOut,
  Package,
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  Bell,
  User,
  ShoppingCart
} from 'lucide-react';

const Sidebar = ({ role }) => {
  // Admin Menu Items - 7 options
  const adminMenu = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', name: 'User Management', icon: Users },
    { path: '/admin/schemes', name: 'Schemes', icon: FileText },
    { path: '/admin/market-prices', name: 'Market Prices', icon: DollarSign },
    { path: '/admin/analytics', name: 'Analytics', icon: TrendingUp },
    { path: '/admin/settings', name: 'Settings', icon: Settings },
    { path: '/admin/credentials', name: 'Credentials', icon: Shield },
    { path: '/logout', name: 'Logout', icon: LogOut }
  ];

  // Farmer Menu
  const farmerMenu = [
    { path: '/farmer/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/farmer/crops', name: 'My Crops', icon: Package },
    { path: '/farmer/market-prices', name: 'Market Prices', icon: TrendingUp },
    { path: '/farmer/requests', name: 'Requests', icon: ShoppingCart },
    { path: '/farmer/deals', name: 'My Deals', icon: DollarSign },
    { path: '/farmer/schemes', name: 'Government Schemes', icon: FileText },
    { path: '/farmer/analytics', name: 'Analytics', icon: TrendingUp },
    { path: '/farmer/notifications', name: 'Notifications', icon: Bell },
    { path: '/farmer/profile', name: 'Profile', icon: User },
    { path: '/logout', name: 'Logout', icon: LogOut }
  ];

  // Dealer Menu
  const dealerMenu = [
    { path: '/dealer/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/dealer/marketplace', name: 'Marketplace', icon: Store },
    { path: '/dealer/orders', name: 'Orders', icon: ShoppingCart },
    { path: '/dealer/suppliers', name: 'Suppliers', icon: Users },
    { path: '/dealer/analytics', name: 'Analytics', icon: TrendingUp },
    { path: '/dealer/notifications', name: 'Notifications', icon: Bell },
    { path: '/dealer/profile', name: 'Profile', icon: User },
    { path: '/logout', name: 'Logout', icon: LogOut }
  ];

  // Government Menu
  const governmentMenu = [
    { path: '/government/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/government/schemes', name: 'Schemes', icon: FileText },
    { path: '/government/farmers', name: 'Farmers', icon: Users },
    { path: '/government/applications', name: 'Applications', icon: FileText },
    { path: '/government/notifications', name: 'Notifications', icon: Bell },
    { path: '/logout', name: 'Logout', icon: LogOut }
  ];

  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return adminMenu;
      case 'farmer':
        return farmerMenu;
      case 'dealer':
        return dealerMenu;
      case 'government':
        return governmentMenu;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-gradient-to-b from-green-900 to-green-800 text-white h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">Agri Connect</h2>
        <p className="text-gray-300 text-sm capitalize">{role} Panel</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-l-4 border-white'
                  : 'text-gray-200 hover:bg-green-700 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;