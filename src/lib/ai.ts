// ── Central Gemini client — ALL AI requests route through Cloudflare AI Gateway ──
//
// Cloudflare AI Gateway gives you a single URL that proxies every Gemini call,
// adding caching, rate-limiting, retries, logging & analytics.
//
// Set these env vars (Vercel → Settings → Environment Variables):
//   CF_ACCOUNT_ID    = your Cloudflare account id
//   CF_GATEWAY_ID    = the AI Gateway name you created
//   GEMINI_API_KEY   = your Google Gemini API key
// (optional) CF_GATEWAY_TOKEN = the gateway's authentication token (if you turned
//   on "Authenticated Gateway" — recommended). Sent as cf-aig-authorization.
//
// The Gemini base URL through the gateway is:
//   https://gateway.ai.cloudflare.com/v1/<ACCOUNT_ID>/<GATEWAY_ID>/google-ai-studio
// The SDK appends /v1beta/... itself, so we hand it that prefix as `baseUrl`.

import { GoogleGenerativeAI, RequestOptions } from "@google/generative-ai";
import { getSecureKey } from "./api-key-manager";

function gatewayBaseUrl(): string | null {
  const acct = process.env.CF_ACCOUNT_ID;
  const gw = process.env.CF_GATEWAY_ID;
  if (!acct || !gw) return null;
  return `https://gateway.ai.cloudflare.com/v1/${acct}/${gw}/google-ai-studio`;
}

/** Per-request options that point the Gemini SDK at the Cloudflare gateway. */
export function aiRequestOptions(): RequestOptions {
  const baseUrl = gatewayBaseUrl();
  const opts: RequestOptions = {};
  if (baseUrl) {
    opts.baseUrl = baseUrl;
    const token = process.env.CF_GATEWAY_TOKEN;
    if (token) {
      // forward the gateway auth header (only used when the gateway is authenticated)
      opts.customHeaders = { "cf-aig-authorization": `Bearer ${token}` };
    }
  }
  return opts;
}

/** A ready Gemini client. Falls back to calling Google directly if the
 *  gateway env vars aren't set yet, so nothing breaks before setup. */
export function getGenAI(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(getSecureKey());
}

/** True when requests are being routed through Cloudflare AI Gateway. */
export function usingGateway(): boolean {
  return !!gatewayBaseUrl();
}
