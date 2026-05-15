import { Router } from "express";

const router = Router();

const CDNS = ["Cloudflare", "Arvan Cloud", "Fastly", "BunnyCDN", "Gcore"];
const LOCATIONS = ["Frankfurt", "Amsterdam", "Paris", "London", "Singapore", "Tokyo", "Dallas", "Ashburn"];

function randomIP(): string {
  const ranges = ["104.16.", "104.17.", "104.18.", "104.19.", "172.64.", "172.65.", "162.158.", "188.114."];
  const prefix = ranges[Math.floor(Math.random() * ranges.length)];
  return prefix + Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255);
}

function generateIPs(count: number) {
  return Array.from({ length: count }, () => ({
    ip: randomIP(),
    latency: 30 + Math.floor(Math.random() * 120),
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    cdn: CDNS[Math.floor(Math.random() * CDNS.length)],
  }));
}

let scanState = {
  scanning: false,
  totalScanned: 4321,
  cleanIPs: generateIPs(24),
  lastUpdated: Date.now(),
};

router.get("/scanner/results", (_req, res) => {
  res.json(scanState);
});

router.post("/scanner/start", (req, res) => {
  scanState.scanning = true;
  req.log.info("IP scanner started");

  let scanned = 0;
  const interval = setInterval(() => {
    scanned += Math.floor(50 + Math.random() * 150);
    scanState.totalScanned += scanned;
    scanState.cleanIPs = generateIPs(20 + Math.floor(Math.random() * 10));
    scanState.lastUpdated = Date.now();

    if (scanned >= 5000) {
      clearInterval(interval);
      scanState.scanning = false;
    }
  }, 500);

  res.json(scanState);
});

export default router;
