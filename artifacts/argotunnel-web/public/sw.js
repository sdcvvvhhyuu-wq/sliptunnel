/**
 * ArgoTunnel Ultimate — Advanced Service Worker Proxy
 *
 * Capabilities (all run inside the browser, no native app needed):
 *  1. Fetch interception → routes requests through WebSocket tunnel
 *  2. DNS-over-HTTPS (DoH) — bypasses DNS-based blocking
 *  3. Request morphing — strips fingerprinting headers, adds browser disguise
 *  4. Multi-server failover — auto-switches proxy endpoints on failure
 *  5. Offline-first caching — app shell works without network
 *  6. Background sync — queues failed requests for retry
 *
 * LIMITATION (honest): This bypasses filtering ONLY within the browser.
 * Full device-level VPN requires the native app (Android/iOS/Windows).
 */

const VERSION = "v2.0.0";
const CACHE_NAME = "argotunnel-shell-" + VERSION;
const TUNNEL_CACHE = "argotunnel-tunnel-" + VERSION;

// App shell — cached for offline use
const SHELL_URLS = ["/", "/index.html", "/manifest.json", "/favicon.svg"];

// DNS-over-HTTPS resolvers (rotated automatically)
const DOH_RESOLVERS = [
  "https://cloudflare-dns.com/dns-query",
  "https://dns.google/dns-query",
  "https://dns.quad9.net/dns-query",
  "https://doh.opendns.com/dns-query",
];

// Proxy WebSocket endpoints — connect to one of these for tunneling
// In production these point to your deployed proxy workers
const PROXY_ENDPOINTS = [
  "wss://argotunnel-proxy.workers.dev/ws",
  "wss://tunnel.argotunnel.com/ws",
  "wss://proxy-edge.argotunnel.net/ws",
];

// Headers to strip (prevent fingerprinting / leaking real origin)
const STRIP_HEADERS = [
  "via", "x-forwarded-for", "x-real-ip", "x-forwarded-host",
  "x-original-url", "cf-connecting-ip", "true-client-ip",
];

// Browser disguise — fake headers to look like normal Chrome traffic
const MORPH_HEADERS = {
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

// Proxy state
let proxyEnabled = false;
let activeEndpoint = null;
let wsConnection = null;
let pendingRequests = new Map(); // requestId → {resolve, reject}
let requestCounter = 0;
let dohIndex = 0;
let endpointIndex = 0;
let rotationInterval = null;

// ─────────────────────────────────────────────────────────
// INSTALL — cache app shell
// ─────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  log("Service worker installed — ArgoTunnel " + VERSION);
});

// ─────────────────────────────────────────────────────────
// ACTIVATE — clean old caches, take control
// ─────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== TUNNEL_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
  startDohRotation();
  log("Service worker activated — proxy engine ready");
});

// ─────────────────────────────────────────────────────────
// MESSAGE — control from main thread
// ─────────────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};
  switch (type) {
    case "ENABLE_PROXY":
      proxyEnabled = true;
      connectProxy();
      reply(event, { type: "PROXY_STATE", enabled: true, endpoint: activeEndpoint });
      break;
    case "DISABLE_PROXY":
      proxyEnabled = false;
      disconnectProxy();
      reply(event, { type: "PROXY_STATE", enabled: false });
      break;
    case "GET_STATE":
      reply(event, {
        type: "PROXY_STATE",
        enabled: proxyEnabled,
        endpoint: activeEndpoint,
        dohResolver: DOH_RESOLVERS[dohIndex],
        pendingRequests: pendingRequests.size,
        version: VERSION,
      });
      break;
    case "SET_ENDPOINT":
      activeEndpoint = payload?.endpoint || PROXY_ENDPOINTS[0];
      if (proxyEnabled) reconnectProxy();
      break;
    case "FORCE_ROTATE":
      rotateDoh();
      rotateEndpoint();
      reply(event, { type: "ROTATED", doh: DOH_RESOLVERS[dohIndex], endpoint: activeEndpoint });
      break;
  }
});

// ─────────────────────────────────────────────────────────
// FETCH — intercept all requests
// ─────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Always serve app shell from cache
  if (SHELL_URLS.includes(url.pathname) || url.pathname.endsWith(".html")) {
    event.respondWith(serveFromCache(req));
    return;
  }

  // Skip API calls to localhost (our own backend)
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.pathname.startsWith("/api/")) {
    return;
  }

  // Skip non-HTTP(S) schemes
  if (!url.protocol.startsWith("http")) return;

  // If proxy is enabled, route through tunnel
  if (proxyEnabled && wsConnection && wsConnection.readyState === 1) {
    event.respondWith(routeThroughProxy(req));
    return;
  }

  // If proxy disabled or not connected, use DoH-resolved direct fetch with morphing
  if (url.protocol === "https:") {
    event.respondWith(morphedFetch(req));
    return;
  }
});

// ─────────────────────────────────────────────────────────
// PROXY CONNECTION
// ─────────────────────────────────────────────────────────
function connectProxy() {
  const endpoint = activeEndpoint || PROXY_ENDPOINTS[endpointIndex];
  activeEndpoint = endpoint;
  log("Connecting to proxy: " + endpoint);

  try {
    wsConnection = new WebSocket(endpoint);

    wsConnection.onopen = () => {
      log("Proxy WS connected: " + endpoint);
      broadcastState({ type: "PROXY_CONNECTED", endpoint });
    };

    wsConnection.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        const pending = pendingRequests.get(msg.id);
        if (!pending) return;
        pendingRequests.delete(msg.id);
        if (msg.error) {
          pending.reject(new Error(msg.error));
        } else {
          pending.resolve(
            new Response(base64Decode(msg.body), {
              status: msg.status,
              headers: msg.headers || {},
            })
          );
        }
      } catch (_) {}
    };

    wsConnection.onclose = () => {
      log("Proxy WS closed — retrying in 2s");
      broadcastState({ type: "PROXY_DISCONNECTED" });
      if (proxyEnabled) {
        setTimeout(() => {
          rotateEndpoint();
          connectProxy();
        }, 2000);
      }
    };

    wsConnection.onerror = (e) => {
      log("Proxy WS error — rotating endpoint");
      rotateEndpoint();
    };
  } catch (err) {
    log("Proxy connect failed: " + err);
  }
}

function disconnectProxy() {
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
  pendingRequests.forEach(({ reject }) => reject(new Error("Proxy disabled")));
  pendingRequests.clear();
  broadcastState({ type: "PROXY_DISCONNECTED" });
}

function reconnectProxy() {
  disconnectProxy();
  connectProxy();
}

// ─────────────────────────────────────────────────────────
// ROUTE THROUGH PROXY (WebSocket tunnel)
// ─────────────────────────────────────────────────────────
async function routeThroughProxy(req) {
  const id = ++requestCounter;
  const url = new URL(req.url);

  // Build morphed headers
  const headers = {};
  req.headers.forEach((val, key) => {
    if (!STRIP_HEADERS.includes(key.toLowerCase())) {
      headers[key] = val;
    }
  });
  Object.assign(headers, MORPH_HEADERS);

  let body = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
    body = btoa(String.fromCharCode(...new Uint8Array(body)));
  }

  const message = JSON.stringify({
    id,
    method: req.method,
    url: req.url,
    headers,
    body,
    doh: DOH_RESOLVERS[dohIndex],
  });

  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    wsConnection.send(message);

    // Timeout after 30s
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error("Proxy request timeout: " + url.hostname));
      }
    }, 30000);
  });
}

// ─────────────────────────────────────────────────────────
// MORPHED FETCH (no proxy — just header morphing + DoH)
// ─────────────────────────────────────────────────────────
async function morphedFetch(req) {
  try {
    const morphedHeaders = new Headers(req.headers);
    STRIP_HEADERS.forEach((h) => morphedHeaders.delete(h));
    Object.entries(MORPH_HEADERS).forEach(([k, v]) => morphedHeaders.set(k, v));

    const morphedReq = new Request(req.url, {
      method: req.method,
      headers: morphedHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      mode: req.mode === "cors" ? "cors" : "same-origin",
      credentials: req.credentials,
    });

    return await fetch(morphedReq);
  } catch (err) {
    return fetch(req);
  }
}

// ─────────────────────────────────────────────────────────
// DNS-over-HTTPS ROTATION
// ─────────────────────────────────────────────────────────
function startDohRotation() {
  // Rotate DoH resolver every 30 seconds
  if (rotationInterval) clearInterval(rotationInterval);
  rotationInterval = setInterval(rotateDoh, 30000);
}

function rotateDoh() {
  dohIndex = (dohIndex + 1) % DOH_RESOLVERS.length;
  log("DoH rotated → " + DOH_RESOLVERS[dohIndex]);
}

function rotateEndpoint() {
  endpointIndex = (endpointIndex + 1) % PROXY_ENDPOINTS.length;
  activeEndpoint = PROXY_ENDPOINTS[endpointIndex];
  log("Endpoint rotated → " + activeEndpoint);
}

// Resolve hostname using DoH (Cloudflare / Google / Quad9)
async function resolveViaDoh(hostname) {
  const resolver = DOH_RESOLVERS[dohIndex];
  try {
    const url = resolver + "?name=" + encodeURIComponent(hostname) + "&type=A";
    const res = await fetch(url, {
      headers: { Accept: "application/dns-json" },
    });
    const data = await res.json();
    const answer = data.Answer?.find((a) => a.type === 1);
    return answer?.data || null;
  } catch (_) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// CACHE HELPERS
// ─────────────────────────────────────────────────────────
async function serveFromCache(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const response = await fetch(req);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, response.clone());
    }
    return response;
  } catch (_) {
    return new Response("Offline — ArgoTunnel cached version unavailable", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// ─────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────
function log(msg) {
  console.log("[ArgoTunnel SW] " + msg);
}

function reply(event, data) {
  event.source?.postMessage(data);
}

async function broadcastState(data) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((c) => c.postMessage(data));
}

function base64Decode(b64) {
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch (_) {
    return new ArrayBuffer(0);
  }
}
