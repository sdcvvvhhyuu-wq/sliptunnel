import { Info, Server, Network, Shield, Cpu, Zap, Lock, Terminal } from "lucide-react";

export function About() {
  return (
    <div className="space-y-8 pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary uppercase tracking-widest glitch flex items-center gap-3">
          <Info className="w-8 h-8" />
          System Specifications
        </h1>
        <p className="text-muted-foreground mt-2">Architecture and technical capabilities of the ArgoTunnel Ultimate engine.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 flex flex-col gap-4">
          <Lock className="w-10 h-10 text-success" />
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-foreground">Post-Quantum Crypto</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Implementation of Kyber-1024 (CRYSTALS-Kyber) key encapsulation mechanism. Protects tunnel establishment against future quantum computer attacks (Store Now, Decrypt Later).
            </p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 flex flex-col gap-4">
          <Network className="w-10 h-10 text-primary" />
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-foreground">Dual-Engine Tunnel</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Hybrid WireGuard and Shadowsocks architecture. WireGuard provides high-throughput UDP routing, while Shadowsocks handles TCP obfuscation and DPI evasion.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 flex flex-col gap-4">
          <Shield className="w-10 h-10 text-chart-4" />
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-foreground">GAN Traffic Morphing</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Generative Adversarial Networks actively reshape packet timing, sizing, and sequences to perfectly mimic allowed protocols (WebRTC, TLS, HTTP/3).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 mt-8">
        <h3 className="text-lg font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-3">
          <Server className="w-5 h-5" />
          System Architecture
        </h3>
        
        <div className="bg-background border border-border p-6 overflow-x-auto">
          <pre className="text-xs text-primary font-mono leading-relaxed min-w-max">
{`
    [CLIENT APPLICATION]                             [IRAN NATIONAL NETWORK (NIN)]                            [EXTERNAL EDGE NODE]
   
   +--------------------+                           +---------------------------+                           +--------------------+
   |  Local SOCKS5/HTTP +-------------------------->|  Deep Packet Inspection   |                           |  Nginx / HAProxy   |
   |  Listener (1080)   |                           |  (Smart Filtering System) |                           |  (Fronting Server) |
   +---------+----------+                           +-------------+-------------+                           +---------+----------+
             |                                                    |                                                   |
             v                                                    |                                                   v
   +---------+----------+      +------------------+               |                  +------------------+   +---------+----------+
   |                    |      |  Active Shield   |               |                  |  IP Scanner /    |   |                    |
   | Dynamic Orchestra  |<---->|  DPI Analyzer &  |               |                  |  Domain Discovery|   |  WebSocket / gRPC  |
   | (Strategy Engine)  |      |  Fragmenter      |               |                  +---------+--------+   |  Terminator        |
   |                    |      +---------+--------+               v                            |            |                    |
   +---------+----------+                |                 [SNI Routing]                       |            +---------+----------+
             |                           v                        |                            |                      |
             v                 +---------+--------+               |                            |                      v
   +---------+----------+      |                  |               |                            |            +---------+----------+
   |                    |      | AI Morph Profile |    [TLS 1.3 / QUIC Masquerade]             |            |                    |
   | Dual Tunnel Core   |<---->| (GAN Generator)  |===============|===========================>|            | Shadowsocks / SS   |
   | (WG + Shadowsocks) |      |                  |               |                            |            | (Decryption)       |
   |                    |      +------------------+               |                            |            |                    |
   +---------+----------+                                         |                            |            +---------+----------+
             |                                                    |                            v                      |
             v                                                    |                [Clean Cloudflare IPs]             v
   +---------+----------+                                         |                                         +---------+----------+
   |                    |                                         |                                         |                    |
   | Kyber-1024 (PQC)   |-----------------------------------------+                                         | Internet Gateway   |
   | Key Encapsulation  |                                                                                   | (Unrestricted)     |
   |                    |                                                                                   |                    |
   +--------------------+                                                                                   +--------------------+
`}
          </pre>
        </div>
      </div>
      
      <div className="bg-primary/5 border border-primary/20 p-6 flex items-start gap-4">
        <Terminal className="w-6 h-6 text-primary shrink-0 mt-1" />
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">CLI / Daemon Usage</h4>
          <p className="text-sm text-muted-foreground font-mono leading-relaxed mb-4">
            The ArgoTunnel core can be run headlessly on servers or routers.
          </p>
          <code className="block bg-black p-3 text-success font-mono text-sm border border-border">
            $ argotunnel core --config /etc/argotunnel/config.json --daemon
          </code>
        </div>
      </div>
    </div>
  );
}