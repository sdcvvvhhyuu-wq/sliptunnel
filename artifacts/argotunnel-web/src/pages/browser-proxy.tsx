import { useProxyEngine } from "@/hooks/useProxyEngine";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Wifi, WifiOff, RefreshCw, Globe, Server, AlertTriangle, CheckCircle, XCircle, ChevronRight } from "lucide-react";

export function BrowserProxy() {
  const { state, ready, enable, disable, forceRotate, dohResolvers, endpoints, techniques } = useProxyEngine();

  const isConnected = state.wsState === "connected";
  const isConnecting = state.wsState === "connecting";

  const handleToggle = () => {
    if (state.enabled) {
      disable();
    } else {
      enable();
    }
  };

  const wsColor = isConnected ? "text-green-400" : isConnecting ? "text-yellow-400" : "text-red-400";
  const wsLabel = isConnected ? "WS CONNECTED" : isConnecting ? "CONNECTING..." : "WS DISCONNECTED";

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary uppercase tracking-widest">Browser Proxy</h1>
        <p className="text-muted-foreground mt-2">
          Service Worker intercepts all browser fetch requests — routes through encrypted WebSocket tunnel.
          Works on iOS Safari, Chrome, Firefox without installing any app.
        </p>
      </header>

      {/* Honest capability notice */}
      <div className="border border-yellow-500/40 bg-yellow-500/5 p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-yellow-300 font-bold uppercase tracking-wide mb-1">Scope: Browser-Level Only</p>
          <p className="text-muted-foreground">
            This proxy bypasses filtering <strong className="text-foreground">only within this browser</strong>.
            Other apps (Telegram, Instagram, etc.) use the network directly and are not affected.
            For full device-level VPN on iOS, install the native ArgoTunnel iOS app.
          </p>
        </div>
      </div>

      {/* Main control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 flex flex-col items-center justify-center gap-6">
          <motion.button
            onClick={handleToggle}
            whileTap={{ scale: 0.96 }}
            disabled={!ready}
            className={`
              w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 relative
              ${state.enabled
                ? "bg-primary/20 border-2 border-primary text-primary shadow-[0_0_40px_rgba(0,255,255,0.4)]"
                : "bg-muted/20 border-2 border-muted-foreground/30 text-muted-foreground"
              }
              disabled:opacity-40 disabled:cursor-not-allowed
            `}
          >
            {isConnecting && (
              <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
            )}
            {state.enabled ? <Wifi className="w-12 h-12" /> : <WifiOff className="w-12 h-12" />}
          </motion.button>

          <div className="text-center">
            <div className="text-xl font-bold uppercase tracking-widest">
              {state.enabled ? "PROXY ACTIVE" : "PROXY OFF"}
            </div>
            <div className={`text-xs font-mono mt-1 ${wsColor}`}>{wsLabel}</div>
            {!ready && (
              <div className="text-xs text-yellow-400 mt-1">Service worker loading...</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard
            label="Bypassed Requests"
            value={state.bypassedRequests.toLocaleString()}
            icon={<Shield className="w-10 h-10" />}
            active={state.enabled}
          />
          <StatCard
            label="Endpoint Rotations"
            value={state.rotationCount.toLocaleString()}
            icon={<RefreshCw className="w-10 h-10" />}
            active={state.enabled}
          />
          <StatCard
            label="Active DoH Resolver"
            value={state.dohResolver?.replace("https://", "").split("/")[0] || "—"}
            icon={<Globe className="w-10 h-10" />}
            active={true}
          />
          <StatCard
            label="Proxy Endpoint"
            value={state.endpoint?.replace("wss://", "").split("/")[0] || "Not connected"}
            icon={<Server className="w-10 h-10" />}
            active={state.enabled && isConnected}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={forceRotate}
          className="flex items-center gap-2 px-4 py-2 border border-primary/40 text-primary text-sm uppercase tracking-wider hover:bg-primary/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Force Rotate Endpoint + DoH
        </button>
      </div>

      {/* Techniques */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Active Bypass Techniques ({techniques.filter(t => t.active).length}/{techniques.length})
        </h2>
        <div className="space-y-2">
          {techniques.map((t) => (
            <motion.div
              key={t.id}
              layout
              className={`border p-4 flex items-start gap-3 transition-colors ${
                t.active ? "border-primary/30 bg-primary/5" : "border-border bg-card opacity-50"
              }`}
            >
              {t.active
                ? <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                : <XCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-foreground uppercase tracking-wide">{t.name}</span>
                  <span className={`text-xs px-2 py-0.5 font-mono ${t.active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {t.active ? "ACTIVE" : "PLANNED"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DoH Resolvers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
            DNS-over-HTTPS Resolvers
          </h2>
          <div className="space-y-2">
            {dohResolvers.map((r) => (
              <div
                key={r}
                className={`flex items-center gap-3 border p-3 text-xs font-mono transition-colors ${
                  state.dohResolver === r ? "border-primary/50 bg-primary/5 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                <Globe className="w-3 h-3 shrink-0" />
                <span className="truncate">{r.replace("https://", "")}</span>
                {state.dohResolver === r && (
                  <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5">ACTIVE</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
            WebSocket Proxy Endpoints
          </h2>
          <div className="space-y-2">
            {endpoints.map((e) => (
              <div
                key={e}
                className={`flex items-center gap-3 border p-3 text-xs font-mono transition-colors ${
                  state.endpoint === e ? "border-primary/50 bg-primary/5 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                <Server className="w-3 h-3 shrink-0" />
                <span className="truncate">{e.replace("wss://", "")}</span>
                {state.endpoint === e && state.enabled && (
                  <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5">ACTIVE</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* iOS instructions */}
      <div className="border border-border bg-card p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4">iOS Safari Setup</h2>
        <div className="space-y-3">
          {[
            { n: "1", t: "Open Safari on iOS and navigate to this URL" },
            { n: "2", t: "Tap the Share button → \"Add to Home Screen\" → tap Add" },
            { n: "3", t: "Open the ArgoTunnel icon from your home screen (this enables full PWA mode)" },
            { n: "4", t: "Enable Browser Proxy on this page — service worker activates automatically" },
            { n: "5", t: "Now browse any blocked site in the SAME Safari session — traffic is tunneled" },
            { n: "6", t: "For full device VPN (all apps): install the native iOS ArgoTunnel app (.ipa)" },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full border border-primary/40 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {s.n}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon, active,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <div className={`bg-card border p-4 flex flex-col justify-between relative overflow-hidden transition-colors ${
      active ? "border-primary/30" : "border-border"
    }`}>
      <div className="absolute top-0 right-0 p-3 opacity-10">{icon}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{label}</div>
      <div className={`text-xl font-bold font-mono truncate ${active ? "text-primary" : "text-muted-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
