"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';

export default function KnowledgePage() {
  const router = useRouter();
  const { language } = useLanguage();

  useEffect(() => {
    router.replace(`/${language}/dashboard`);
  }, [router, language]);

  return null;
}
