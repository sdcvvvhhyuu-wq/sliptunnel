import { Router } from "express";

const router = Router();

const profiles = [
  { id: "chrome_100", name: "Google Chrome 100", description: "Mimics Chrome 100 TLS fingerprint + HTTP/2 header order", active: true, bypassRate: 97, trafficPattern: "HTTPS browsing" },
  { id: "firefox_120", name: "Mozilla Firefox 120", description: "Firefox 120 cipher suites + ALPN negotiation pattern", active: false, bypassRate: 95, trafficPattern: "HTTPS browsing" },
  { id: "safari_16", name: "Safari 16.0", description: "Safari on iOS 16 — low suspicion, common in Iran", active: false, bypassRate: 94, trafficPattern: "HTTPS browsing" },
  { id: "netflix", name: "Netflix Stream", description: "Mimics Netflix adaptive bitrate streaming traffic signature", active: false, bypassRate: 91, trafficPattern: "Video streaming" },
  { id: "telegram", name: "Telegram MTProto", description: "Telegram MTProto 2.0 handshake and packet timing pattern", active: false, bypassRate: 88, trafficPattern: "Messaging" },
  { id: "youtube", name: "YouTube QUIC", description: "YouTube HTTP/3 QUIC video streaming — bypasses most QoS", active: false, bypassRate: 93, trafficPattern: "Video streaming" },
  { id: "zoom_voip", name: "Zoom VoIP", description: "Zoom video call traffic shape — SRTP-like packet cadence", active: false, bypassRate: 86, trafficPattern: "VoIP / video call" },
  { id: "instagram", name: "Instagram API", description: "Instagram mobile app API call pattern + CDN traffic", active: false, bypassRate: 89, trafficPattern: "Social media API" },
  { id: "twitch", name: "Twitch Live Stream", description: "Twitch HLS/RTMP hybrid streaming traffic signature", active: false, bypassRate: 90, trafficPattern: "Video streaming" },
  { id: "http2_generic", name: "Generic HTTP/2", description: "Generic multiplexed HTTP/2 — no specific app fingerprint", active: false, bypassRate: 82, trafficPattern: "Generic HTTPS" },
];

let activeProfileId = "chrome_100";

router.get("/profiles", (_req, res) => {
  res.json(profiles.map(p => ({ ...p, active: p.id === activeProfileId })));
});

router.get("/profiles/active", (_req, res) => {
  const p = profiles.find(p => p.id === activeProfileId) || profiles[0];
  res.json({ ...p, active: true });
});

router.post("/profiles/active", (req, res) => {
  const { id } = req.body || {};
  const found = profiles.find(p => p.id === id);
  if (!found) {
    res.status(400).json({ error: "Unknown profile id" });
    return;
  }
  activeProfileId = id;
  req.log.info({ id }, "Profile changed");
  res.json({ ...found, active: true });
});

export default router;
