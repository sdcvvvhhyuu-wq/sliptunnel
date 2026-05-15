import { Router } from "express";

const router = Router();

const history: { timestamp: number; speedIn: number; speedOut: number }[] = [];
let bytesIn = 0;
let bytesOut = 0;
let packetsIn = 0;
let packetsOut = 0;

setInterval(() => {
  const speedIn = Math.floor(Math.random() * 5_000_000);
  const speedOut = Math.floor(Math.random() * 2_000_000);
  bytesIn += speedIn;
  bytesOut += speedOut;
  packetsIn += Math.floor(speedIn / 1400);
  packetsOut += Math.floor(speedOut / 1400);
  history.push({ timestamp: Date.now(), speedIn, speedOut });
  if (history.length > 60) history.shift();
}, 1000);

router.get("/stats", (_req, res) => {
  const last = history[history.length - 1] || { speedIn: 0, speedOut: 0 };
  res.json({
    bytesIn,
    bytesOut,
    speedIn: last.speedIn,
    speedOut: last.speedOut,
    packetsIn,
    packetsOut,
    uptime: history.length,
    activeConnections: 1,
  });
});

router.get("/stats/history", (_req, res) => {
  res.json(history);
});

export default router;
