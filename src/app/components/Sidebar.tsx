'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  // prefix links with current language
  const localePrefix = `/${useLanguage().language}`;
  const menu = [
    { name: t('nav.dashboard'), path: `${localePrefix}/dashboard` },
    { name: t('nav.bookings'), path: `${localePrefix}/bookings` },
    { name: t('nav.logs'), path: `${localePrefix}/logs` },
    { name: t('nav.knowledge'), path: `${localePrefix}/knowledge` },
    { name: t('nav.settings'), path: `${localePrefix}/settings` },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 bg-darkBlue text-white p-2 rounded-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar for mobile (overlay) and desktop */}
      <aside 
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
          transition-transform duration-300 ease-in-out
          fixed md:static top-0 left-0 z-40
          w-full md:w-64 h-screen
          bg-darkBlue text-white p-4
          md:h-auto md:min-h-screen
        `}
      >
        <div className="mb-8 text-center font-heading text-xl pt-12 md:pt-0">{t('app.title')}</div>
        <nav>
          {menu.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={`block py-2 px-4 rounded hover:bg-primary ${
                pathname?.startsWith(item.path) ? 'bg-primary' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        <button
          onClick={async () => {
            await logout();
            router.replace('/login');
          }}
          className="mt-8 flex items-center gap-2 py-2 px-4 rounded hover:bg-primary w-full"
        >
          <LogOut size={18} />
          {t('nav.logout')}
        </button>
      </aside>
    </>
  );
}
