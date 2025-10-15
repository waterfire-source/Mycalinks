import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const ignores = [
  // /^\/api\/square\/webhook/,
  // /^\/api\/system/,
  /^\/api/,
  /^\/images/,
  /^.*.(svg|png)/,
  /^\/_next/,
  /^\/epos/,
];

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const pathName = req.nextUrl.pathname;

  //無視
  if (ignores.some((i) => i.test(pathName))) return NextResponse.next();

  const posOrigin = process.env.NEXT_PUBLIC_ORIGIN!;
  const serviceOrigin = process.env.NEXT_PUBLIC_SERVICE_ORIGIN!;
  const ecOrigin = process.env.NEXT_PUBLIC_EC_ORIGIN!;
  const bizOrigin = process.env.NEXT_PUBLIC_BIZ_ORIGIN!;
  const isLocal = process.env.NEXT_PUBLIC_ORIGIN?.includes('localhost');

  //guestディレクトリへのアクセスではドメインがmycalinks.serviceでないといけない（本番orステージング環境）

  //ecかどうか
  if (pathName.startsWith('/ec')) {
    //ec以外のドメインになってたらecにリダイレクトする 一旦無効で
    if (!ecOrigin.includes(host)) {
      return NextResponse.redirect(new URL(pathName, ecOrigin));
    }
  } else if (pathName.startsWith('/guest')) {
    //service以外のドメインになってたらguestにリダイレクトする
    if (!serviceOrigin.includes(host)) {
      return NextResponse.redirect(new URL(pathName, serviceOrigin));
    }
  } else if (pathName.startsWith('/register')) {
    //biz以外のドメインになってたらbizにリダイレクトする
    if (!bizOrigin.includes(host)) {
      return NextResponse.redirect(new URL(pathName, bizOrigin));
    }
  } else {
    //逆に他のoriginになっちゃってたらmycaにアクセスする
    if (!posOrigin.includes(host) && !isLocal) {
      return NextResponse.redirect(new URL('https://myca.co.jp/'));
    }
  }

  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  //トークンを確認する必要があるページ
  if (
    req.nextUrl.pathname === '/login' ||
    req.nextUrl.pathname.startsWith('/auth')
  ) {
    const token = await getToken({ req });
    const isAuthenticated: boolean = !!token;

    if (req.nextUrl.pathname === '/login' && isAuthenticated) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }
    if (req.nextUrl.pathname.startsWith('/auth') && !isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}
