'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Mail, Lock, ArrowRight, CheckCircle2, Quote } from 'lucide-react';

import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import BMPLogo from '../components/BMPLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';

type Testimonial = { quote: string; author: string; role: string };

export default function Login() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, language, translateNode } = useLanguage();

  const marketingBenefitsNode = translateNode('auth.marketing.benefits');
  const marketingBenefits = Array.isArray(marketingBenefitsNode)
    ? (marketingBenefitsNode as string[])
    : [
        'Capture every reservation request even after closing time',
        'Sync guest details to your dashboard automatically',
        'Spot VIPs, allergies, and preferences instantly'
      ];

  const testimonialNode = {
    quote: t('auth.marketing.highlight'),
    author: t('auth.marketing.highlightAuthor'),
    role: t('auth.marketing.highlightRole')
  } as Testimonial;

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError(t('auth.errors.fillAllFields') as string);
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push(`/${language}/dashboard`);
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
          setError(t('auth.errors.userNotFound') as string);
          break;
        case 'auth/wrong-password':
          setError(t('auth.errors.wrongPassword') as string);
          break;
        case 'auth/invalid-email':
          setError(t('auth.errors.invalidEmail') as string);
          break;
        case 'auth/too-many-requests':
          setError(t('auth.errors.tooManyRequests') as string);
          break;
        default:
          setError(t('auth.errors.loginGeneric') as string);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-500/20 blur-[120px]" />

      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <BMPLogo size="sm" />
          <LanguageSwitcher />
        </div>
      </header>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl gap-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur lg:grid-cols-[1.15fr_1fr] lg:p-10">
          <section className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 shadow-inner">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-teal-200">
                {t('auth.marketing.badge')}
              </span>
              <h1 className="mt-6 text-3xl font-semibold leading-snug sm:text-4xl">
                {t('auth.marketing.headline')}
              </h1>
              <p className="mt-4 text-base text-slate-200/80">
                {t('auth.marketing.subtitle')}
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-100/80">
                {marketingBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-teal-300" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100/90 shadow-lg">
              <Quote className="mb-3 h-6 w-6 text-teal-300" />
              <p>{testimonialNode.quote}</p>
              <div className="mt-4 font-semibold text-white">{testimonialNode.author}</div>
              <div className="text-xs text-slate-300">{testimonialNode.role}</div>
              <div className="mt-5 text-xs font-medium text-teal-200">
                {t('auth.marketing.contact')}
              </div>
            </div>
          </section>

          <section className="flex flex-col justify-center rounded-2xl bg-slate-950/60 p-8 shadow-lg ring-1 ring-white/10 backdrop-blur-lg">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold">{t('auth.login')}</h2>
              <p className="mt-2 text-sm text-slate-300">
                {t('auth.marketing.subtitle')}
              </p>
            </div>

            {user && (
              <div className="mb-6 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm text-green-100">
                {t('auth.alreadyLoggedIn')}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-200">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('auth.placeholders.email') as string}
                    disabled={loading}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-200">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('auth.placeholders.password') as string}
                    disabled={loading}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
                    {t('auth.login')}
                  </span>
                ) : (
                  <>
                    {t('auth.signIn')}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-300">
              <span className="mr-1">{t('auth.register')}?</span>
              <Link
                href={`/${language}/register`}
                className="font-semibold text-teal-300 transition hover:text-teal-200"
              >
                {t('auth.signUp')}
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
