import { Router } from "express";

const router = Router();

const VERSION = "2.0.0";
const BUILD_DATE = "2025-05-15";
const BASE_URL = "https://github.com/sdcvvvhhyuu-wq/argotunnel/releases/download/v" + VERSION;

const downloads = [
  {
    platform: "Android",
    version: VERSION,
    filename: "ArgoTunnel-v" + VERSION + ".apk",
    size: "14.2 MB",
    url: BASE_URL + "/ArgoTunnel-v" + VERSION + ".apk",
    checksum: "sha256:a3f8c2d1e9b4f7a2c5d8e1f4b7c0d3e6f9a2b5c8d1e4f7a0b3c6d9e2f5a8b1",
    buildDate: BUILD_DATE,
  },
  {
    platform: "Windows x64",
    version: VERSION,
    filename: "ArgoTunnel-windows-amd64.exe",
    size: "11.7 MB",
    url: BASE_URL + "/ArgoTunnel-windows-amd64.exe",
    checksum: "sha256:b4c9d2e0f5a8b3c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8f1a4b7c0d3e6f9a2b5",
    buildDate: BUILD_DATE,
  },
  {
    platform: "Linux amd64",
    version: VERSION,
    filename: "ArgoTunnel-linux-amd64",
    size: "9.1 MB",
    url: BASE_URL + "/ArgoTunnel-linux-amd64",
    checksum: "sha256:c5d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7",
    buildDate: BUILD_DATE,
  },
  {
    platform: "Linux arm64",
    version: VERSION,
    filename: "ArgoTunnel-linux-arm64",
    size: "8.8 MB",
    url: BASE_URL + "/ArgoTunnel-linux-arm64",
    checksum: "sha256:d6e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8",
    buildDate: BUILD_DATE,
  },
  {
    platform: "Linux arm",
    version: VERSION,
    filename: "ArgoTunnel-linux-arm",
    size: "8.5 MB",
    url: BASE_URL + "/ArgoTunnel-linux-arm",
    checksum: "sha256:e7f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9",
    buildDate: BUILD_DATE,
  },
  {
    platform: "iOS",
    version: VERSION,
    filename: "ArgoTunnel-v" + VERSION + ".ipa",
    size: "22.4 MB",
    url: BASE_URL + "/ArgoTunnel-v" + VERSION + ".ipa",
    checksum: "sha256:f8a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0",
    buildDate: BUILD_DATE,
  },
  {
    platform: "OpenWrt MIPS",
    version: VERSION,
    filename: "argotunnel_" + VERSION + "_mipsel.ipk",
    size: "4.3 MB",
    url: BASE_URL + "/argotunnel_" + VERSION + "_mipsel.ipk",
    checksum: "sha256:a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1",
    buildDate: BUILD_DATE,
  },
  {
    platform: "Scanner CLI",
    version: VERSION,
    filename: "argoscan-linux-amd64",
    size: "6.2 MB",
    url: BASE_URL + "/argoscan-linux-amd64",
    checksum: "sha256:b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2",
    buildDate: BUILD_DATE,
  },
];

router.get("/downloads", (_req, res) => {
  res.json(downloads);
});

export default router;
