import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  QrCode,
  Activity,
  Bell,
  LogOut,
} from 'lucide-react';
import { Button } from './ui/button';

export type NavItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: number;
};

export const defaultNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CalendarDays, label: 'Reservations', path: '/reservations' },
  { icon: MapPin, label: 'Courts', path: '/courts' },
  { icon: QrCode, label: 'Check-in', path: '/check-in' },
  { icon: Activity, label: 'Activity', path: '/activity' },
  { icon: Bell, label: 'Refunds', path: '/refunds' },
];

interface NavigationBarProps {
  pendingRefundsCount?: number;
  className?: string;
}

export function NavigationBar({ pendingRefundsCount = 0, className = '' }: NavigationBarProps) {
  const [location] = useLocation();
  const reduceMotion = useReducedMotion();

  const items: NavItem[] = defaultNavItems.map((item) => ({
    ...item,
    badge: item.path === '/refunds' && pendingRefundsCount > 0 ? pendingRefundsCount : undefined,
  }));

  return (
    <>
      {/* =========================================================================
          DESKTOP: Full-Height Sleek Black Navigation Bar on the Left
          ========================================================================= */}
      <aside
        aria-label="Desktop navigation sidebar"
        className={`hidden md:flex flex-col w-64 h-screen
          bg-[#0a0a0a] border-r border-white/[0.08] shadow-2xl
          z-30 overflow-hidden shrink-0 ${className}`}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-16 items-center px-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ElSewedy Logo"
              className="w-9 h-9 rounded-full object-cover shadow-lg shadow-red-500/20 shrink-0"
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight leading-none text-white">
                <span className="text-[#22C55E] font-black">ElSewedy</span>
                <span className="text-zinc-200">Sports</span>
              </div>
              <span className="text-[10px] tracking-widest uppercase text-zinc-400 font-semibold mt-1">Yalla Match</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Navigation
          </p>
          <nav className="space-y-1.5" role="navigation">
            {items.map((item) => {
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    isActive
                      ? 'text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Soft Light-Gray Rounded Background for Active Item */}
                  {isActive && (
                    <motion.div
                      layoutId="desktop-active-pill"
                      className="absolute inset-0 rounded-xl bg-zinc-200/15 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_4px_12px_rgba(0,0,0,0.2)]"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 380, damping: 28, mass: 0.7 }
                      }
                    />
                  )}

                  <item.icon
                    className={`relative z-10 w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  />
                  <span className="relative z-10 text-sm tracking-wide flex-1">
                    {item.label}
                  </span>

                  {item.badge !== undefined && (
                    <span className="relative z-10 text-[11px] font-bold bg-amber-500 text-white rounded-full px-2 py-0.5 shadow-sm animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-white/[0.08]">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 border border-transparent hover:border-red-500/20"
            onClick={() => {
              localStorage.removeItem('yalla-admin-token');
              localStorage.removeItem('yalla-admin-email');
              localStorage.removeItem('yalla-admin-role');
              window.location.assign('/');
            }}
          >
            <LogOut className="mr-2.5 h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </Button>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE: Sleek Floating Bottom Navigation Bar (Deep Black Icon Dock)
          ========================================================================= */}
      <nav
        aria-label="Mobile floating navigation bar"
        className="md:hidden fixed bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-0 mx-auto z-50
          w-[calc(100%-2rem)] max-w-sm rounded-full p-1.5
          bg-black/95 backdrop-blur-2xl border border-white/[0.12]
          shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.05)]
          flex items-center justify-between"
        style={{
          left: 0,
          right: 0,
          marginLeft: 'auto',
          marginRight: 'auto',
          width: 'calc(100% - 2rem)',
          maxWidth: '24rem',
        }}
      >
        {items.map((item) => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 outline-none ${
                isActive
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {/* Sleek Dark/Glass Active Indicator Pill */}
              {isActive && (
                <motion.div
                  layoutId="mobile-active-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.5)]"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 30, mass: 0.7 }
                  }
                />
              )}

              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative">
                  <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-emerald-400' : 'text-zinc-400'}`} />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-black animate-pulse" />
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
