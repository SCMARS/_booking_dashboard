'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

const PUBLIC_ROUTES = new Set<string>(['/login', '/register']);

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();


  const segments = (pathname || '/').split('/');
  const first = segments[1];
  const currentPath = first && ['en','ru','hr','es'].includes(first) ? `/${segments.slice(2).join('/')}` : (pathname || '/');
  const isPublic = PUBLIC_ROUTES.has(currentPath);

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublic) {
      router.replace(`/${first || 'en'}/login`);
      return;
    }

    if (user && isPublic) {
      router.replace(`/${first || 'en'}/dashboard`);
    }
  }, [user, loading, isPublic, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Загрузка...
      </div>
    );
  }


  if (isPublic) {
    return <div className="min-h-screen bg-lightGray p-4 md:p-6">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-lightGray">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 w-full">{children}</main>
    </div>
  );
}


