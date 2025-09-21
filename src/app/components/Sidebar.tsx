'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Bookings', path: '/bookings' },
    { name: 'Logs', path: '/logs' },
    { name: 'Knowledge', path: '/knowledge' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 h-screen bg-darkBlue text-white p-4">
      <div className="mb-8 text-center font-heading text-xl">AI Bot Admin</div>
      <nav>
        {menu.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`block py-2 px-4 rounded hover:bg-primary ${
              pathname === item.path ? 'bg-primary' : ''
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}