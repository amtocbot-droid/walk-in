import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

// Lightweight API security helpers.

const RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 60;
const WINDOW_MS = 60_000;

export function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "127.0.0.1";
  return ip;
}

export async function checkRateLimitAsync(clientId: string): Promise<{ ok: boolean; retryAfter?: number }> {
  const redis = getRedis();
  if (!redis) {
    return checkRateLimit(clientId);
  }

  const key = `ratelimit:${clientId}`;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Sliding window using Redis sorted set.
  await redis.zremrangebyscore(key, 0, windowStart);
  const count = await redis.zcard(key);

  if (count >= MAX_REQUESTS) {
    const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
    const retryAfter = oldest.length >= 2 ? Math.ceil((Number(oldest[1]) + WINDOW_MS - now) / 1000) : 60;
    return { ok: false, retryAfter };
  }

  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, Math.ceil(WINDOW_MS / 1000));
  return { ok: true };
}

export function checkRateLimit(clientId: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = RATE_LIMIT.get(clientId);

  if (!record || now > record.resetAt) {
    RATE_LIMIT.set(clientId, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (record.count >= MAX_REQUESTS) {
    return { ok: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count += 1;
  return { ok: true };
}

export function requireApiKey(request: NextRequest): { ok: boolean; response?: NextResponse } {
  const auth = request.headers.get("authorization");
  const key = auth?.replace(/^Bearer\s+/i, "").trim();

  // Production: validate key against database; for MVP any non-empty key is accepted.
  if (!key) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Missing API key" }, { status: 401 }),
    };
  }

  return { ok: true };
}

// Accepts either an owner session cookie (dashboard) or a Bearer API key
// (robots / integrations). Used for endpoints that create resources.
export function requireSessionOrApiKey(request: NextRequest): { ok: boolean; response?: NextResponse } {
  const sessionCookie = request.cookies.get("authjs.session-token")?.value;
  if (sessionCookie) {
    return { ok: true };
  }
  return requireApiKey(request);
}

export function securityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; media-src 'self' https:;"
  );
  return response;
}

export function withApiSecurity<T = unknown>(
  handler: (req: NextRequest, context: T) => Promise<Response | NextResponse>
): (req: NextRequest, context: T) => Promise<Response | NextResponse> {
  return async (request: NextRequest, context: T) => {
    const clientId = getClientId(request);
    const limit = await checkRateLimitAsync(clientId);
    if (!limit.ok) {
      const res = NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      res.headers.set("Retry-After", String(limit.retryAfter));
      return res;
    }

    const apiKey = requireApiKey(request);
    if (!apiKey.ok && apiKey.response) {
      return apiKey.response;
    }

    const response = await handler(request, context);
    if (response instanceof NextResponse) {
      return securityHeaders(response);
    }
    return response;
  };
}

// For public ingest endpoints (e.g. first-party telemetry) that browsers call
// without credentials. Rate-limited and header-hardened, but no API key.
export function withPublicApiSecurity<T = unknown>(
  handler: (req: NextRequest, context: T) => Promise<Response | NextResponse>
): (req: NextRequest, context: T) => Promise<Response | NextResponse> {
  return async (request: NextRequest, context: T) => {
    const clientId = getClientId(request);
    const limit = await checkRateLimitAsync(clientId);
    if (!limit.ok) {
      const res = NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      res.headers.set("Retry-After", String(limit.retryAfter));
      return res;
    }

    const response = await handler(request, context);
    if (response instanceof NextResponse) {
      return securityHeaders(response);
    }
    return response;
  };
}

export async function requireStoreApiKey(
  request: NextRequest,
  storeId: string
): Promise<{ ok: boolean; response?: NextResponse }> {
  // First try session cookie (owner dashboard).
  const sessionCookie = request.cookies.get("authjs.session-token")?.value;
  if (sessionCookie) {
    return { ok: true };
  }

  // Fall back to API key (robots / integrations).
  const auth = request.headers.get("authorization");
  const key = auth?.replace(/^Bearer\s+/i, "").trim();

  if (!key) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Missing API key or session" }, { status: 401 }),
    };
  }

  const { validateApiKey } = await import("@/lib/db");
  if (!(await validateApiKey(storeId, key))) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid API key" }, { status: 401 }),
    };
  }

  return { ok: true };
}

export function withStoreApiSecurity(
  handler: (req: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response | NextResponse>
): (req: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response | NextResponse> {
  return async (request, context) => {
    const clientId = getClientId(request);
    const limit = await checkRateLimitAsync(clientId);
    if (!limit.ok) {
      const res = NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      res.headers.set("Retry-After", String(limit.retryAfter));
      return res;
    }

    const { id } = await context.params;
    const apiKey = await requireStoreApiKey(request, id);
    if (!apiKey.ok && apiKey.response) {
      return apiKey.response;
    }

    const response = await handler(request, context);
    if (response instanceof NextResponse) {
      return securityHeaders(response);
    }
    return response;
  };
}
