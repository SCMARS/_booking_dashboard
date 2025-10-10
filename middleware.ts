import { NextRequest, NextResponse } from 'next/server';

function detectCountry(req: NextRequest): string | undefined {

  const vercelGeoCountry = (req as any).geo?.country as string | undefined;
  if (vercelGeoCountry) return vercelGeoCountry;


  const headerCountry =
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-geo-country') ||
    undefined;
  return headerCountry || undefined;
}

function mapCountryToLang(country?: string): 'hr' | 'es' | 'en' {
  const c = (country || '').toUpperCase();
  if (c === 'HR') return 'hr';
  if (c === 'ES') return 'es';
  return 'en';
}

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const res = NextResponse.next();


  const qpLang = url.searchParams.get('lang');
  const qpGeo = url.searchParams.get('geo');
  if ((qpLang && ['en', 'ru', 'hr', 'es'].includes(qpLang)) || qpGeo) {
    const forced = (qpLang as any) || mapCountryToLang(qpGeo || undefined);
    res.cookies.set('lang', forced, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });

    res.cookies.set('NEXT_LOCALE', forced, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  }

  const hasLangCookie = req.cookies.has('lang');
  const path = url.pathname;
  const locales = ['en', 'ru', 'hr', 'es'];
  const pathLocale = path.split('/')[1];

  if (!hasLangCookie) {
    const country = detectCountry(req);
    const lang = mapCountryToLang(country);
    res.cookies.set('lang', lang, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    res.cookies.set('NEXT_LOCALE', lang, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }


  if (locales.includes(pathLocale)) {
    const inner = `/${url.pathname.split('/').slice(2).join('/')}`;
    // Allow exact locale root like /ru -> rewrite to /
    const withoutLocale = inner === '/' ? '/' : inner.replace(/\/+/g, '/');
    const target = new URL((withoutLocale || '/') + url.search, url.origin);
    return NextResponse.rewrite(target);
  }


  // Allow root path to show landing page, redirect other non-locale paths
  if (!locales.includes(pathLocale) && path !== '/') {
    const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value || req.cookies.get('lang')?.value;
    const locale = (cookieLocale && locales.includes(cookieLocale)) ? cookieLocale : 'en';
    const redirectTo = `/${locale}${path}${url.search}`;
    return NextResponse.redirect(new URL(redirectTo, url.origin));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
};


