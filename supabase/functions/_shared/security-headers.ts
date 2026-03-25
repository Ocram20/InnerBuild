export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
};

export function createSecureResponse(
  body: string | null,
  init: ResponseInit & { headers?: Record<string, string> } = {}
): Response {
  const headers = {
    ...securityHeaders,
    ...(init.headers || {}),
  };
  return new Response(body, { ...init, headers });
}
