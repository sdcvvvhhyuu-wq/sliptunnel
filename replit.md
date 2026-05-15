# ArgoTunnel Ultimate v2.0

پیشرفته‌ترین سیستم دور زدن فیلترینگ ایران با هوش مصنوعی و رمزگذاری پس‌کوانتومی.

## Run & Operate

```bash
# Build all Go packages (verify compilation)
cd argotunnel/core && go build ./...

# Run Go vet (static analysis)
cd argotunnel/core && go vet ./...

# Build scanner CLI
cd argotunnel/scanner-cli && go build -o argoscan .

# Cross-compile for Linux
cd argotunnel/core && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ../linux/ArgoTunnel-linux-amd64 .

# Run core locally
cd argotunnel/core && go run .

# Use root Makefile
cd argotunnel && make all
```

## Stack

- **Go 1.23+** – core engine, Windows, Linux, Scanner CLI
- **WireGuard-go** – userspace WireGuard tunnel
- **Shadowsocks** – custom SOCKS5 fallback tunnel
- **PQC Kyber-1024** – post-quantum cryptography (cloudflare/circl)
- **uTLS** – TLS fingerprint spoofing (refraction-networking/utls)
- **DNS library** – covert DNS tunnel (miekg/dns)
- **Kotlin + Jetpack Compose** – Android UI
- **Swift + NetworkExtension** – iOS PacketTunnelProvider
- **GitHub Actions** – full CI/CD for all 6 platforms

## Where things live

```
argotunnel/
├── .github/workflows/build-all.yml  ← CI/CD کامل
├── core/                            ← موتور اصلی Go
│   ├── main.go                      ← entry point
│   ├── go.mod                       ← ماژول‌های Go
│   ├── engine/executor.go           ← orchestrator اصلی
│   ├── capabilities/                ← سیستم 5000 قابلیت
│   ├── tunnel/                      ← WireGuard + Shadowsocks
│   ├── obfs/                        ← Fragmentation + uTLS + Fronting
│   ├── pqc/                         ← Kyber-1024
│   ├── psiphon/                     ← fallback Psiphon
│   ├── ai_morph/                    ← 10 پروفایل AI
│   ├── active_shield/               ← سپر ضد Probe فعال
│   ├── dpi_analyzer/                ← تحلیل و دور زدن DPI
│   ├── rl_agent/                    ← Q-Learning agent
│   ├── gan_generator/               ← cover traffic GAN
│   ├── quic_masq/                   ← پوشش QUIC
│   ├── dns_tunnel/                  ← تانل DNS مخفی
│   ├── icmp_tunnel/                 ← تانل ICMP
│   ├── dynamic_orchestra/           ← سوئیچ خودکار تانل
│   ├── domain_discovery/            ← کشف دامنه AI
│   └── ip_scanner/                  ← اسکن IP پاک CDN
├── android/                         ← Android Jetpack Compose
├── ios/                             ← iOS Swift + NetworkExtension
├── windows/                         ← کلاینت ویندوز
├── linux/                           ← کلاینت لینوکس
├── scanner-cli/                     ← argoscan
└── openwrt/                         ← پکیج OpenWrt
```

## Architecture decisions

- WireGuard as primary tunnel + Shadowsocks as secondary (auto-switch by orchestrator)
- PQC Kyber-1024 with 45-second key rotation for forward secrecy
- RL Q-Learning (epsilon-greedy) for adaptive profile selection
- Custom SOCKS5 implementation to avoid problematic txthinking/socks5 dependency
- Psiphon as last-resort fallback with connectivity monitoring loop
- `netip.Addr` used instead of `net.IP` for WireGuard netstack compatibility

## CI/CD Workflow

Push a tag to trigger build for all platforms:
```bash
git tag v2.0.0
git push origin v2.0.0
```

Or use GitHub Actions → build-all.yml → "Run workflow" for manual dispatch.

Required GitHub secret: `GH_TOKEN` with `repo` + `workflow` permissions.

## User preferences

- Keep all ArgoTunnel project files in `argotunnel/` subdirectory
- Go module: `github.com/sdcvvvhhyuu-wq/argotunnel`
- Android: compileSdk=34, minSdk=26, Jetpack Compose
- iOS: NetworkExtension PacketTunnelProvider
- All builds must be CGO_ENABLED=0 (pure Go, no cgo)

## Gotchas

- `go mod tidy` must be run in `argotunnel/core/` not project root
- WireGuard netstack requires `netip.Addr` not `net.IP`
- `device.NewDevice` requires 3 args: `(tun, conn.Bind, logger)`
- uTLS profiles: use `HelloChrome_100`, `HelloFirefox_120`, `HelloSafari_16_0` (not versioned _124/_125)
- `txthinking/socks5` has broken dependency `txthinking/x` – replaced with custom SOCKS5

## Pointers

- See `argotunnel/README.md` for full project documentation
- See `argotunnel/core/engine/executor.go` for main orchestration logic
- See `argotunnel/.github/workflows/build-all.yml` for CI/CD
