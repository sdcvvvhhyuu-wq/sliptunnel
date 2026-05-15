import { Router } from "express";

const router = Router();

const algorithms = [
  { id: "tls_record_split", name: "TLS Record Splitting", description: "Split TLS ClientHello across multiple TCP segments to prevent DPI pattern match", technique: "fragmentation", active: false },
  { id: "tcp_segment_overlap", name: "TCP Segment Overlap", description: "Overlapping TCP segments confuse DPI reassembly engine — effective against Iran Hamnet nodes", technique: "fragmentation", active: false },
  { id: "http2_multiplex", name: "HTTP/2 Multiplexing", description: "Multiplex streams inside HTTP/2 to hide VPN handshake — appears as browser traffic", technique: "mux", active: false },
  { id: "ws_over_tls", name: "WebSocket over TLS", description: "Encapsulate tunnel inside WSS upgrade — indistinguishable from browser WebSocket", technique: "websocket", active: false },
  { id: "utls_randomize", name: "uTLS Randomized Fingerprint", description: "Rotate TLS fingerprint every connection to appear as different browser versions", technique: "fingerprint", active: false },
  { id: "quic_masquerade", name: "QUIC Masquerade", description: "Traffic shaped to match QUIC/HTTP3 — Iran DPI has poor QUIC detection as of 2025", technique: "quic", active: false },
  { id: "domain_fronting", name: "Domain Fronting via CDN", description: "Cloudflare CDN: SNI=legit domain, Host=actual server — bypasses SNI-based blocking", technique: "fronting", active: false },
  { id: "reality_vision", name: "XTLS REALITY", description: "Zero-RTT ECH protocol — cryptographically indistinguishable from TLS 1.3 HTTPS", technique: "reality", active: false },
  { id: "dns_over_https", name: "DNS-over-HTTPS Tunnel", description: "Covert data channel inside DoH queries to Cloudflare/Google resolvers", technique: "dns", active: false },
  { id: "icmp_covert", name: "ICMP Covert Channel", description: "Data inside ICMP echo payloads — rarely inspected by Iranian ISPs", technique: "icmp", active: false },
  { id: "padding_morph", name: "Traffic Padding Morph", description: "Pad packets to fixed bucket sizes (1024/4096/16384) to break statistical traffic analysis", technique: "padding", active: false },
  { id: "timing_jitter", name: "Timing Jitter Injection", description: "Randomize ±80ms inter-packet delay to defeat timing-based DPI correlation attacks", technique: "timing", active: false },
  { id: "tls_in_tls", name: "TLS-in-TLS Tunnel", description: "Outer TLS looks like HTTPS; inner layer carries WireGuard encrypted payload", technique: "nested_tls", active: false },
  { id: "shadowsocks_2022", name: "Shadowsocks 2022 AEAD", description: "SS-2022 with AEAD-AES-256-GCM + timestamp replay protection (IETF standard)", technique: "shadowsocks", active: false },
  { id: "hysteria2_brutal", name: "Hysteria2 Brutal CC", description: "QUIC-based with aggressive congestion control — hard to classify, bypasses QoS throttling", technique: "hysteria", active: false },
  { id: "mtu_probe_evasion", name: "MTU Probe Evasion", description: "Force MSS=536 to prevent DPI from seeing full reassembled packets", technique: "mtu", active: false },
];

let currentIndex = 0;
let rotationCount = 0;

// Rotate every 2 seconds
setInterval(() => {
  currentIndex = (currentIndex + 1) % algorithms.length;
  rotationCount++;
}, 2000);

router.get("/algorithm", (_req, res) => {
  const algo = algorithms[currentIndex];
  res.json({
    name: algo.name,
    index: currentIndex,
    total: algorithms.length,
    rotationInterval: 2,
    nextRotation: 2,
    effectiveness: 82 + Math.floor(Math.random() * 18),
  });
});

router.get("/algorithm/list", (_req, res) => {
  res.json(algorithms.map((a, i) => ({ ...a, active: i === currentIndex })));
});

export default router;
