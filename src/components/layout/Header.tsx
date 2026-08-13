import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Notification, UserRole } from '../../types';
import { Bell, Search, User as UserIcon, LogOut, CheckCheck, Sparkles, ShieldCheck, Stethoscope, UserCheck, Pill, FlaskConical, ClipboardList } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Header: React.FC<{ activeTab?: string; onTabChange?: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
  const { user, logout, demoLogin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showDemoMenu, setShowDemoMenu] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed notifications fetch');
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Polling for notifications
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDemoSwitch = async (role: UserRole) => {
    try {
      await demoLogin(role);
      setShowDemoMenu(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search & Breadcrumb */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patients, doctors, appointments, medicines..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-all border border-blue-200/60"
            title="Switch Demo Role"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Switch Role</span>
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Role Preview
              </div>
              <button
                onClick={() => handleDemoSwitch('ADMIN')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" /> Admin Portal
              </button>
              <button
                onClick={() => handleDemoSwitch('DOCTOR')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                <Stethoscope className="w-4 h-4 text-blue-600" /> Doctor Workstation
              </button>
              <button
                onClick={() => handleDemoSwitch('PATIENT')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" /> Patient Portal
              </button>
              <button
                onClick={() => handleDemoSwitch('RECEPTIONIST')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                <ClipboardList className="w-4 h-4 text-amber-600" /> Reception Desk
              </button>
              <button
                onClick={() => handleDemoSwitch('PHARMACIST')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                <Pill className="w-4 h-4 text-cyan-600" /> Pharmacy Hub
              </button>
              <button
                onClick={() => handleDemoSwitch('LAB_STAFF')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                <FlaskConical className="w-4 h-4 text-indigo-600" /> Laboratory Hub
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition-colors ${
                        n.isRead ? 'bg-white text-slate-600' : 'bg-blue-50/50 text-slate-900 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold mb-0.5">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge & Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-800">{user?.name || 'User'}</div>
              <div className="text-[10px] text-slate-500 font-medium">{user?.role}</div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1">
                  <Badge status={user?.role || 'PATIENT'} size="sm" />
                </div>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  if (onTabChange) onTabChange('profile');
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-slate-400" /> My Profile
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
