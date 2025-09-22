'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menu = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Bookings', path: '/bookings' },
    { name: 'Logs', path: '/logs' },
    { name: 'Knowledge', path: '/knowledge' },
    { name: 'Settings', path: '/settings' },
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
        <div className="mb-8 text-center font-heading text-xl pt-12 md:pt-0">AI Bot Admin</div>
        <nav>
          {menu.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={`block py-2 px-4 rounded hover:bg-primary ${
                pathname === item.path ? 'bg-primary' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
