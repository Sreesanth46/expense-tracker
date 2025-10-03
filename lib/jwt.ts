import { jwtVerify, SignJWT } from 'jose';
import env from './env';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const durationMap = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000
} as const;

const tokenMap = {
  access: 'access',
  refresh: 'refresh'
} as const;

type DurationUnit = keyof typeof durationMap;
type TokenType = keyof typeof tokenMap;

const alg = 'HS256';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

function getSecret(tokenType: TokenType) {
  return tokenType === tokenMap.access ? accessSecret : refreshSecret;
}

function getExpiry(tokenType: TokenType) {
  const expiry =
    tokenType === tokenMap.access
      ? env.JWT_ACCESS_TOKEN_EXPIRY
      : env.JWT_REFRESH_TOKEN_EXPIRY;

  const unit = (Object.keys(durationMap) as DurationUnit[]).find(key =>
    expiry.endsWith(key)
  );

  const duration = unit
    ? parseInt(expiry.split(unit)[0]) * durationMap[unit]
    : null;

  return duration ? new Date(Date.now() + duration) : new Date(0);
}

async function encrypt(payload: any, tokenType: TokenType) {
  const expiry = getExpiry(tokenType);
  const secret = getSecret(tokenType);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(secret);
}

async function decrypt(token: string, tokenType: TokenType) {
  const secret = getSecret(tokenType);
  const { payload } = await jwtVerify(token, secret, { algorithms: [alg] });
  return payload;
}

async function hasExpired(token: string, tokenType: TokenType) {
  try {
    const secret = getSecret(tokenType);
    await jwtVerify(token, secret);
    return false;
  } catch (error: any) {
    console.log({ tokenError: error });

    if (error?.code === 'ERR_JWT_EXPIRED') {
      return true;
    }

    throw error;
  }
}

export async function setSession(user: Record<string, any>) {
  const cookieStore = cookies();

  Object.values(tokenMap).forEach(async token => {
    const expires = getExpiry(token);
    cookieStore.set(token, await encrypt({ ...user, expires }, token), {
      expires,
      httpOnly: true
    });
  });
}

export function clearSession() {
  Object.values(tokenMap).forEach(token => {
    cookies().set(token, '', { expires: new Date(0), httpOnly: true });
  });
}

export async function updateSession(request: NextRequest) {
  const access = request.cookies.get(tokenMap.access)?.value;
  const refresh = request.cookies.get(tokenMap.refresh)?.value;
  if (!access || !refresh) return;

  const hasRefreshExpired = await hasExpired(refresh, tokenMap.refresh);
  if (hasRefreshExpired) {
    clearSession();
    return NextResponse.json({ message: 'Session expired' }, { status: 401 });
  } else {
    const parsed = await decrypt(access, tokenMap.access);
    const expires = getExpiry(tokenMap.access);
    const res = NextResponse.next();

    res.cookies.set(tokenMap.access, access, {
      name: tokenMap.access,
      value: await encrypt(
        { ...(parsed as Record<string, any>), expires },
        tokenMap.access
      ),
      httpOnly: true,
      expires
    });

    return res;
  }
}
