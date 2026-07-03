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

import { GoogleGenerativeAI, RequestOptions, ModelParams } from "@google/generative-ai";
import { getSecureKey } from "./api-key-manager";

// Default Cloudflare AI Gateway for this project (the "cream-ai-skin-care" gateway).
// Env vars still override these if set on Vercel.
const DEFAULT_CF_ACCOUNT_ID = "3d1cabaf9d1df38540b6437d7c395cbc";
const DEFAULT_CF_GATEWAY_ID = "cream-ai-skin-care";

// ▶️ Cloudflare AI Gateway is ON. AI requests route through the gateway
// (caching, analytics, rate-limiting). Set back to true to bypass it.
const GATEWAY_PAUSED = false;

function gatewayBaseUrl(): string | null {
  // Paused either by the code flag above or the Vercel env kill-switch.
  if (GATEWAY_PAUSED) return null;
  if (process.env.AI_GATEWAY_DISABLED === "true") return null;
  const acct = process.env.CF_ACCOUNT_ID || DEFAULT_CF_ACCOUNT_ID;
  const gw = process.env.CF_GATEWAY_ID || DEFAULT_CF_GATEWAY_ID;
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

/**
 * Run a Gemini request, preferring the Cloudflare AI Gateway.
 * If the gateway call fails for ANY reason (e.g. the gateway has
 * "Authenticated Gateway" turned on and no token is set, or a network
 * hiccup), it automatically retries the SAME request directly against
 * Google so the app never breaks. Once the gateway is reachable, every
 * request shows up in the Cloudflare dashboard logs.
 */
export async function generateWithGateway(modelParams: ModelParams, content: any) {
  const genAI = getGenAI();
  const gwOpts = aiRequestOptions();
  if (gwOpts.baseUrl) {
    try {
      const model = genAI.getGenerativeModel(modelParams, gwOpts);
      return await model.generateContent(content);
    } catch (err) {
      console.warn("[ai] Cloudflare gateway call failed, falling back to direct Google:", (err as any)?.message || err);
    }
  }
  const model = genAI.getGenerativeModel(modelParams, {});
  return await model.generateContent(content);
}

/**
 * Like generateWithGateway but for multi-turn chat (startChat + sendMessage).
 * Tries the Cloudflare gateway first, falls back to direct Google on any error.
 */
export async function chatWithGateway(modelParams: ModelParams, history: any[], message: string) {
  const genAI = getGenAI();
  const gwOpts = aiRequestOptions();
  if (gwOpts.baseUrl) {
    try {
      const model = genAI.getGenerativeModel(modelParams, gwOpts);
      const chat = model.startChat({ history: history || [] });
      return await chat.sendMessage(message);
    } catch (err) {
      console.warn("[ai] Cloudflare gateway chat failed, falling back to direct Google:", (err as any)?.message || err);
    }
  }
  const model = genAI.getGenerativeModel(modelParams, {});
  const chat = model.startChat({ history: history || [] });
  return await chat.sendMessage(message);
}
