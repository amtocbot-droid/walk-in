// Security middleware for all API endpoints

const RATE_LIMIT = new Map();
const MAX_REQUESTS = 60;
const WINDOW_MS = 60000;

function getClientId(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "127.0.0.1";
  return ip;
}

function checkRateLimit(clientId) {
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

function addSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; media-src 'self' https:;"
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function sanitizeString(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

function validateInput(data, schema) {
  // Simple validation - in production use Zod
  for (const [key, rules] of Object.entries(schema)) {
    let value = data[key];

    // Sanitize string inputs
    if (typeof value === "string") {
      value = sanitizeString(value);
      data[key] = value; // Update the data with sanitized value
    }

    if (rules.required && (value === undefined || value === null || value === "")) {
      return { valid: false, error: `${key} is required` };
    }

    if (value !== undefined && rules.type && typeof value !== rules.type) {
      return { valid: false, error: `${key} must be of type ${rules.type}` };
    }

    if (value !== undefined && rules.minLength && value.length < rules.minLength) {
      return { valid: false, error: `${key} must be at least ${rules.minLength} characters` };
    }

    if (value !== undefined && rules.maxLength && value.length > rules.maxLength) {
      return { valid: false, error: `${key} must be at most ${rules.maxLength} characters` };
    }

    if (value !== undefined && rules.pattern && !rules.pattern.test(value)) {
      return { valid: false, error: `${key} has invalid format` };
    }
  }

  return { valid: true };
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Skip middleware for non-API routes
  if (!url.pathname.startsWith("/api/")) {
    return context.next();
  }

  // Rate limiting
  const clientId = getClientId(request);
  const limit = checkRateLimit(clientId);
  if (!limit.ok) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(limit.retryAfter),
      },
    });
  }

  // Add security headers to all API responses
  const response = await context.next();
  return addSecurityHeaders(response);
}

export { validateInput };
