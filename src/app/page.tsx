'use client';

import { useLanguage } from './contexts/LanguageContext';
import SimpleVapiWidget from './components/SimpleVapiWidget';
import LanguageSwitcher from './components/LanguageSwitcher';
import CallButton from './components/CallButton';
import VapiTest from './components/VapiTest';
import Link from 'next/link';

export default function HomePage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-blue-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-white sm:text-7xl">
            {t('landing.hero.title')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-blue-100">
            {t('landing.hero.subtitle')}
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link
              className="group inline-flex items-center justify-center rounded-full py-4 px-8 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-teal-600 text-white hover:bg-teal-500 active:bg-teal-800 focus-visible:outline-teal-600"
              href={`/${language}/login`}
            >
              {t('landing.hero.ctaPrimary')}
            </Link>
            <a
              className="group inline-flex ring-1 items-center justify-center rounded-full py-4 px-8 text-sm focus:outline-none ring-white text-white hover:ring-white/70 active:ring-white/70"
              href="#features"
            >
              {t('landing.hero.ctaSecondary')}
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('landing.features.title')}
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {t('landing.features.subtitle')}
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-5 w-5 flex-none rounded-full bg-teal-600 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  {t('landing.features.voiceAI.title')}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    {t('landing.features.voiceAI.description')}
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-5 w-5 flex-none rounded-full bg-teal-600 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  {t('landing.features.automation.title')}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    {t('landing.features.automation.description')}
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-5 w-5 flex-none rounded-full bg-teal-600 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  {t('landing.features.analytics.title')}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    {t('landing.features.analytics.description')}
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t('landing.stats.title')}
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-400">
                {t('landing.stats.subtitle')}
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col bg-white/5 p-8">
                    <dt className="text-sm font-semibold leading-6 text-gray-400">{t('landing.stats.activeUsers')}</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-white">2,500+</dd>
                  </div>
                  <div className="flex flex-col bg-white/5 p-8">
                    <dt className="text-sm font-semibold leading-6 text-gray-400">{t('landing.stats.processedRequests')}</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-white">500K+</dd>
                  </div>
                  <div className="flex flex-col bg-white/5 p-8">
                    <dt className="text-sm font-semibold leading-6 text-gray-400">{t('landing.stats.timeSaved')}</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-white">75%</dd>
                  </div>
                  <div className="flex flex-col bg-white/5 p-8">
                    <dt className="text-sm font-semibold leading-6 text-gray-400">{t('landing.stats.satisfiedCustomers')}</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-white">98%</dd>
                  </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('landing.cta.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              {t('landing.cta.subtitle')}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-x-6 gap-y-4">
              <div className="flex gap-x-6">
                <Link
                  href={`/${language}/register`}
                  className="rounded-full bg-teal-600 px-10 py-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                >
                  {t('landing.cta.createAccount')}
                </Link>
                <Link href={`/${language}/login`} className="text-sm font-semibold leading-6 text-gray-900">
                  {t('landing.cta.hasAccount')} <span aria-hidden="true">→</span>
                </Link>
              </div>
              
              {/* Call Button */}
              <div className="mt-4">
                <CallButton 
                  phoneNumber="+1234567890" 
                  assistantId="c459fd1f-dcc7-4716-8dc8-e8c79ce5e319"
                />
              </div>
              
              {/* Vapi Test Component */}
              <div className="mt-8">
                <VapiTest />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vapi AI Widget */}
      <SimpleVapiWidget />
    </div>
  );
}
