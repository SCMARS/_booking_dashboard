'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, LogOut, Home, Calendar, FileText, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();


  const localePrefix = `/${useLanguage().language}`;
  const menu = [
    { name: t('nav.dashboard'), path: `${localePrefix}/dashboard`, icon: Home },
    { name: t('nav.bookings'), path: `${localePrefix}/bookings`, icon: Calendar },
    { name: t('nav.logs'), path: `${localePrefix}/logs`, icon: FileText },
    { name: t('nav.knowledge'), path: `${localePrefix}/knowledge`, icon: BookOpen },
    { name: t('nav.settings'), path: `${localePrefix}/settings`, icon: SettingsIcon },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 bg-slate-900/90 backdrop-blur text-white p-2 rounded-lg shadow-lg border border-white/10"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar for mobile (overlay) and desktop */}
      <aside 
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
          transition-transform duration-300 ease-in-out
          fixed md:static top-0 left-0 z-40
          w-full md:w-64 h-screen
          text-white p-4
          md:h-auto md:min-h-screen
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800
          border-r border-white/10
        `}
      >
        {/* Brand */}
        <div className="mb-6 md:mb-8 flex items-center gap-3 pt-12 md:pt-4 px-1">
          <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shadow-inner">🍽️</div>
          <div className="font-heading text-lg tracking-tight">{t('app.title')}</div>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {menu.map((item) => {
            const active = pathname?.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setIsOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-3 py-2 px-3 rounded-lg transition
                  ${active
                    ? 'bg-white/10 text-white shadow-inner border border-white/10'
                    : 'text-slate-200 hover:text-white hover:bg-white/5 border border-transparent'}
                `}
              >
                <Icon size={18} className={`shrink-0 ${active ? 'text-white' : 'text-slate-300 group-hover:text-white'}`} />
                <span className="text-sm font-medium leading-none">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <button
            onClick={async () => {
              await logout();
              router.replace('/login');
            }}
            className="flex items-center gap-2 py-2 px-3 rounded-lg w-full text-slate-200 hover:text-white hover:bg-white/5 transition"
          >
            <LogOut size={16} />
            <span className="text-sm">{t('nav.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
