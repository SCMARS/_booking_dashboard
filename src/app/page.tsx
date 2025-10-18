'use client';

import { useLanguage } from './contexts/LanguageContext';
import SimpleVapiWidget from './components/SimpleVapiWidget';
import LanguageSwitcher from './components/LanguageSwitcher';
import BMPLogo from './components/BMPLogo';
import Link from 'next/link';
import {
  CheckCircle2,
  Mic,
  CalendarCheck,
  BarChart3,
  Sparkles,
  ArrowRight,
  Star
} from 'lucide-react';

type StatItem = { value: string; label: string };
type WorkflowStep = { title: string; description: string };
type Testimonial = { quote: string; author: string; role: string };

export default function HomePage() {
  const { t, language, translateNode } = useLanguage();
  const defaultStatsItems: StatItem[] = [
    { value: '2,500+', label: 'restaurants powered by our AI' },
    { value: '500,000+', label: 'reservations handled' },
    { value: '75%', label: 'staff time saved' },
    { value: '98%', label: 'customer satisfaction' }
  ];
  const statsNode = translateNode('landing.stats.items');
  const statsItems = Array.isArray(statsNode) ? (statsNode as StatItem[]) : defaultStatsItems;
  const heroBulletsNode = translateNode('landing.hero.bullets');
  const heroBullets = Array.isArray(heroBulletsNode)
    ? (heroBulletsNode as string[])
    : [
        'Capture bookings 24/7, even after hours',
        'Reduce host workload by automating calls',
        'Upsell specials and confirm guests in seconds'
      ];
  const workflowNode = translateNode('landing.workflow.steps');
  const workflowSteps = Array.isArray(workflowNode)
    ? (workflowNode as WorkflowStep[])
    : [
        { title: 'Answer & Qualify', description: 'AI greets callers, understands the request, and checks availability instantly.' },
        { title: 'Secure the Booking', description: 'Smart rules prevent double bookings, balance waitlists, and send confirmations.' },
        { title: 'Share the Insight', description: 'Every interaction logs intent, guest data, and revenue notes in your dashboard.' }
      ];
  const testimonialsNode = translateNode('landing.testimonials.items');
  const testimonials = Array.isArray(testimonialsNode)
    ? (testimonialsNode as Testimonial[])
    : [
        {
          quote: 'We capture 35% more bookings after hours and my hosts can finally focus on guests in front of them.',
          author: 'Lena Ortiz',
          role: 'Owner, Azul Tapas Bar'
        },
        {
          quote: 'The analytics highlight peak demand by the hour so we schedule smarter and cut no-shows in half.',
          author: 'Marco Petrović',
          role: 'GM, Adriatic Bistro'
        }
      ];
  const integrationsNode = translateNode('landing.integrations.items');
  const integrations = Array.isArray(integrationsNode)
    ? (integrationsNode as string[])
    : [
        'OpenTable, GloriaFood, and POS exports',
        'Twilio voice, WhatsApp, and SMS',
        'Google Sheets, Slack, and email alerts',
        'Custom automations via webhooks'
      ];
  const highlightStats = statsItems.slice(0, 2);
  const featureCards = [
    {
      title: t('landing.features.voiceAI.title'),
      description: t('landing.features.voiceAI.description'),
      icon: Mic
    },
    {
      title: t('landing.features.booking.title'),
      description: t('landing.features.booking.description'),
      icon: CalendarCheck
    },
    {
      title: t('landing.features.analytics.title'),
      description: t('landing.features.analytics.description'),
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <BMPLogo size="md" />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
          <div className="absolute inset-0">
            <div className="absolute -top-64 -right-32 h-[480px] w-[480px] rounded-full bg-teal-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 lg:pt-40">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-teal-200 backdrop-blur">
                  <Sparkles size={16} className="text-teal-300" />
                  {t('landing.hero.badge')}
                </div>
                <h1 className="mt-6 max-w-2xl font-display text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                  {t('landing.hero.title')}
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
                  {t('landing.hero.subtitle')}
                </p>
                <ul className="mt-8 space-y-3 text-base text-slate-200/90">
                  {heroBullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-teal-400" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href={`/${language}/register`}
                    className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-400"
                  >
                    {t('landing.hero.ctaPrimary')}
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href="#features"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/60"
                  >
                    {t('landing.hero.ctaSecondary')}
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-teal-400/10 to-white/5 blur-xl" />
                <div className="relative space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
                  <div>
                    <p className="text-sm uppercase tracking-wider text-slate-200/80">
                      {t('landing.stats.title')}
                    </p>
                    <p className="mt-2 text-base text-slate-200/70">{t('landing.stats.subtitle')}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {highlightStats.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="text-3xl font-semibold text-white">{item.value}</div>
                        <div className="mt-1 text-sm text-slate-300/80">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-teal-500/10 to-violet-500/10 p-5">
                    <p className="text-sm text-slate-100">
                      “{t('landing.testimonials.items.0.quote')}”
                    </p>
                    <p className="mt-4 text-sm font-medium text-teal-200">
                      {t('landing.testimonials.items.0.author')} · {t('landing.testimonials.items.0.role')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-24 text-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {t('landing.features.title')}
              </h2>
              <p className="mt-5 text-lg text-slate-600">
                {t('landing.features.subtitle')}
              </p>
            </div>
            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {featureCards.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-100 opacity-0 transition group-hover:opacity-60" />
                  <div className="relative flex h-full flex-col">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10 text-teal-600">
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-slate-900">{title}</h3>
                    <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
                    <div className="mt-auto pt-6 text-sm font-medium text-teal-600">Riley AI</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-24 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('landing.workflow.title')}</h2>
              <p className="mt-4 text-lg text-slate-300">{t('landing.workflow.subtitle')}</p>
            </div>
            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {workflowSteps.map((step) => (
                <div
                  key={step.title}
                  className="relative rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur transition hover:border-teal-400/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/20 text-teal-300">
                    <Sparkles size={18} />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-4 text-sm text-slate-200/80">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-900 py-24 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('landing.stats.title')}</h2>
              <p className="mt-4 text-lg text-slate-300">{t('landing.stats.subtitle')}</p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {statsItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 text-center shadow-lg backdrop-blur"
                >
                  <div className="text-4xl font-semibold text-white">{item.value}</div>
                  <div className="mt-3 text-sm text-slate-200/80">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-24 text-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('landing.testimonials.title')}</h2>
              <p className="mt-4 text-lg text-slate-600">{t('landing.testimonials.subtitle')}</p>
            </div>
            <div className="mt-16 grid gap-8 lg:grid-cols-2">
              {testimonials.map((item) => (
                <div key={item.quote} className="rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-sm">
                  <div className="flex items-center gap-2 text-teal-500">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} size={16} fill="currentColor" className="text-teal-500" />
                    ))}
                  </div>
                  <blockquote className="mt-6 text-lg font-medium text-slate-900">“{item.quote}”</blockquote>
                  <div className="mt-6 text-sm font-semibold text-slate-800">{item.author}</div>
                  <div className="text-sm text-slate-500">{item.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-24 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('landing.integrations.title')}</h2>
              <p className="mt-4 text-lg text-slate-300">{t('landing.integrations.subtitle')}</p>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {integrations.map((integration) => (
                <span
                  key={integration}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-100"
                >
                  <Sparkles size={14} className="text-teal-300" />
                  {integration}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-24 text-slate-900">
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-10 shadow-xl sm:p-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('landing.cta.title')}</h2>
              <p className="mt-4 text-lg text-slate-600">{t('landing.cta.subtitle')}</p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  href={`/${language}/register`}
                  className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-400"
                >
                  {t('landing.cta.button')}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href={`/${language}/login`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-8 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
                >
                  {t('landing.cta.secondary')} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SimpleVapiWidget />
    </div>
  );
}
