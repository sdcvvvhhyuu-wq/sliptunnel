import { Router } from "express";

const router = Router();

let tunnelState = {
  connected: false,
  protocol: "wireguard",
  profile: "chrome_100",
  uptime: 0,
  ping: 0,
  pqcEnabled: true,
  autoRotate: true,
  currentAlgorithm: "tls_record_split",
  rotationInterval: 2,
};

let uptimeStart: number | null = null;
let rotationTimer: NodeJS.Timeout | null = null;
let algorithmIndex = 0;

const algorithms = [
  "tls_record_split",
  "tcp_segment_overlap",
  "http2_multiplex",
  "ws_over_tls",
  "utls_randomize",
  "quic_masquerade",
  "domain_fronting",
  "reality_vision",
  "dns_over_https",
  "icmp_covert",
  "padding_morph",
  "timing_jitter",
  "tls_in_tls",
  "shadowsocks_2022",
  "hysteria2_brutal",
  "mtu_probe_evasion",
];

function startAlgorithmRotation() {
  if (rotationTimer) clearInterval(rotationTimer);
  rotationTimer = setInterval(() => {
    algorithmIndex = (algorithmIndex + 1) % algorithms.length;
    tunnelState.currentAlgorithm = algorithms[algorithmIndex];
  }, 2000);
}

function stopAlgorithmRotation() {
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }
}

router.get("/tunnel/status", (req, res) => {
  const uptime = uptimeStart ? Math.floor((Date.now() - uptimeStart) / 1000) : 0;
  const ping = tunnelState.connected ? 15 + Math.floor(Math.random() * 40) : 0;
  res.json({
    ...tunnelState,
    uptime,
    ping,
    currentAlgorithm: tunnelState.currentAlgorithm,
    rotationInterval: 2,
  });
});

router.post("/tunnel/connect", (req, res) => {
  const { profile, protocol } = req.body || {};
  tunnelState.connected = true;
  tunnelState.protocol = protocol || "wireguard";
  tunnelState.profile = profile || "chrome_100";
  uptimeStart = Date.now();
  startAlgorithmRotation();
  req.log.info({ profile, protocol }, "Tunnel connected");
  res.json({ ...tunnelState, uptime: 0, ping: 18, rotationInterval: 2 });
});

router.post("/tunnel/disconnect", (_req, res) => {
  tunnelState.connected = false;
  uptimeStart = null;
  stopAlgorithmRotation();
  res.json({ ...tunnelState, uptime: 0, ping: 0, rotationInterval: 2 });
});

export default router;
