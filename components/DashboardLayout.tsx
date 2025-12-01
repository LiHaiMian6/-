import React from 'react';
import { User, LogOut, LayoutDashboard, FileText, Settings, Users, PieChart, ClipboardList, Wallet, TrendingUp, BookOpen, Calendar } from 'lucide-react';
import { Role } from '../types';
import { ROLE_CN } from '../constants';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: { name: string; role: Role };
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user,
  currentView,
  onViewChange,
  onLogout,
}) => {
  const getNavItems = () => {
    switch (user.role) {
      case 'teacher':
        return [
          { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
          { id: 'upload', label: '数据上传', icon: FileText },
          { id: 'my-records', label: '我的记录', icon: Users },
          { id: 'class-management', label: '班级管理', icon: BookOpen },
          { id: 'schedule-management', label: '课程表', icon: Calendar },
        ];
      case 'finance':
        return [
          { id: 'dashboard', label: '概览', icon: PieChart },
          { id: 'all-records', label: '所有教学记录', icon: ClipboardList },
          { id: 'billing', label: '账单与发票', icon: FileText },
          { id: 'payment-tracking', label: '收费管理', icon: Wallet },
          { id: 'config', label: '价格配置', icon: Settings },
        ];
      case 'admin':
        return [
          { id: 'admin-users', label: '用户管理', icon: Users },
          { id: 'monthly-revenue', label: '月度营收', icon: TrendingUp },
          { id: 'config', label: '系统配置', icon: Settings },
          { id: 'logs', label: '系统日志', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-lg">
              E
            </div>
            <span className="font-semibold text-xl tracking-tight">张东教育</span>
          </div>
          <div className="mt-4 text-xs text-slate-400 uppercase tracking-wider font-semibold">
            {ROLE_CN[user.role]} 端
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentView === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{ROLE_CN[user.role]}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};