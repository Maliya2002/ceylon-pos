import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  ChefHat,
  LayoutGrid,
  TrendingUp,
  Clock,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  BookOpen,
  Database,
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchUser,
  language,
  setLanguage,
}) {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'pos', label: language === 'si' ? 'POS ටර්මිනලය' : 'POS Terminal', icon: UtensilsCrossed },
    { id: 'kds', label: language === 'si' ? 'කුස්සිය (KDS)' : 'Kitchen KDS', icon: ChefHat },
    { id: 'tables', label: language === 'si' ? 'මේස පිරිසැලසුම' : 'Dining Tables', icon: LayoutGrid },
    { id: 'menu', label: language === 'si' ? 'මෙනුව සහ මිල' : 'Menu Manager', icon: BookOpen },
    { id: 'reports', label: language === 'si' ? 'දවසේ වාර්තා' : 'Daily Reports', icon: TrendingUp },
  ];

  return (
    <header className="h-16 bg-slate-850 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 ring-2 ring-orange-400/20">
          <span className="text-xl">🍛</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-white tracking-wide">
              CEYLON FLAVORS
            </h1>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              NEON LIVE
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Rice & Curry • Kottu • Short Eats
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                isActive
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Language, Clock & User Switcher */}
      <div className="flex items-center gap-3">
        {/* Language Toggle (EN / සිං) */}
        <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-700 text-[10px] font-bold">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-lg transition ${
              language === 'en' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('si')}
            className={`px-2 py-1 rounded-lg transition ${
              language === 'si' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            සිං
          </button>
        </div>

        {/* Live Sri Lanka Clock */}
        <div className="hidden xl:flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>{currentTime}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{currentDate}</span>
        </div>

        {/* User Account / Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl px-3 py-1.5 text-xs font-semibold text-slate-200 transition"
          >
            <div className="w-6 h-6 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[11px]">
              {currentUser?.name?.[0] || 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <span className="block text-xs font-bold leading-none">{currentUser?.name || 'Nuwan Perera'}</span>
              <span className="text-[10px] text-orange-400 leading-none">{currentUser?.role || 'CASHIER'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User dropdown menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-700 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Switch Active Persona
                </span>
              </div>
              <button
                onClick={() => {
                  onSwitchUser('admin');
                  setIsUserMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-750 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admin (Kasun Bandara)</span>
              </button>
              <button
                onClick={() => {
                  onSwitchUser('cashier');
                  setIsUserMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-750 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-orange-400" />
                <span>Cashier (Nuwan Perera)</span>
              </button>
              <button
                onClick={() => {
                  onSwitchUser('kitchen');
                  setIsUserMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-750 flex items-center gap-2"
              >
                <ChefHat className="w-4 h-4 text-amber-400" />
                <span>Kitchen Chef (Chef Kamal)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
