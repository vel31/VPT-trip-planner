import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Compass, 
  Sparkles, 
  Bookmark, 
  Search, 
  Hotel,
  ShieldCheck,
  User,
  LogOut,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VVTLogo } from './VVTLogo';

export type NavTab = 'explore' | 'destinations' | 'hotels' | 'food' | 'planner' | 'saved' | 'admin';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenSearch: () => void;
  onOpenAdvisor: () => void;
  onOpenVerification: () => void;
  onOpenAuth: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenAdvisor,
  onOpenVerification,
  onOpenAuth,
  savedCount
}) => {
  const { user, isAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserMenu]);

  const mainNavItems: { id: NavTab; label: string }[] = [
    { id: 'explore', label: 'EXPLORE' },
    { id: 'destinations', label: 'DESTINATIONS' },
    { id: 'hotels', label: 'HOTELS & STAYS' },
    { id: 'food', label: 'FOOD' },
    { id: 'planner', label: 'PLAN TRIP' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-[#060608]/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/80 py-3' 
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <VVTLogo
            size="sm"
            onClick={() => setActiveTab('explore')}
          />

          {/* Center Editorial Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-1 text-xs font-mono tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? 'text-amber-400 font-bold' 
                      : 'text-[#D4D4D8] hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavUnderline"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-500"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            {/* Admin Console Link (if admin) */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`text-xs font-mono tracking-[0.15em] uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'admin' ? 'text-purple-400 font-bold' : 'text-purple-300/80 hover:text-purple-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>ADMIN</span>
              </button>
            )}
          </nav>

          {/* Action Buttons Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Trigger (⌘K) */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#D4D4D8] hover:text-white text-xs border border-white/15 transition-all cursor-pointer backdrop-blur-sm"
              title="Search monuments, stays, food across India (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-[#E4E4E7]" />
              <span className="hidden sm:inline font-mono tracking-widest text-[11px]">SEARCH</span>
              <kbd className="hidden xl:inline text-[9px] bg-black/60 text-[#A1A1AA] px-1.5 py-0.5 rounded border border-white/10 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Saved Expeditions / Bookings Button */}
            <button
              onClick={() => setActiveTab('saved')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase border transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-md shadow-amber-400/20'
                  : 'bg-white/5 text-[#D4D4D8] hover:text-white hover:bg-white/10 border-white/15'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">MY TRIPS</span>
              {savedCount > 0 && (
                <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                  activeTab === 'saved' ? 'bg-black text-amber-400' : 'bg-amber-400 text-black'
                }`}>
                  {savedCount}
                </span>
              )}
            </button>

            {/* User Profile / Login Button */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-mono cursor-pointer transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-black font-bold text-[10px] flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-semibold">{user.name.split(' ')[0]}</span>
                </button>

                {showUserMenu && (
                  <div 
                    onClick={() => setShowUserMenu(false)}
                    className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0D0D12] border border-white/15 shadow-2xl p-2 z-50 text-xs font-mono space-y-1"
                  >
                    <div className="px-3 py-2 border-b border-white/10">
                      <span className="text-white font-bold block truncate">{user.name}</span>
                      <span className="text-[10px] text-[#71717A] truncate block">{user.email}</span>
                    </div>

                    <button
                      onClick={() => setActiveTab('saved')}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#D4D4D8] hover:text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>My Bookings & Trips</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => setActiveTab('admin')}
                        className="w-full text-left px-3 py-2 rounded-xl text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono tracking-wider uppercase shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span className="text-[11px]">SIGN IN</span>
              </button>
            )}

            {/* AI Advisor Chat Trigger */}
            <button
              onClick={onOpenAdvisor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-mono text-xs border border-white/15 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline text-[11px]">AI ADVISOR</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-between pt-3 pb-1 border-t border-white/10 mt-3 overflow-x-auto scrollbar-none gap-2">
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-[10px] font-mono tracking-widest uppercase py-1 px-2.5 rounded-md whitespace-nowrap transition-colors ${
                  isActive ? 'bg-white text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`text-[10px] font-mono tracking-widest uppercase py-1 px-2.5 rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'admin' ? 'bg-purple-400 text-black font-bold' : 'text-purple-300 hover:text-white'
              }`}
            >
              ADMIN
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
