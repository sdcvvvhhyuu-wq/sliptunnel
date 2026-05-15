# ArgoTunnel Ultimate v2.0
### پیشرفته‌ترین سیستم دور زدن فیلترینگ ایران – AI/Quantum

[![Build](https://github.com/sdcvvvhhyuu-wq/argotunnel/actions/workflows/build-all.yml/badge.svg)](https://github.com/sdcvvvhhyuu-wq/argotunnel/actions)

---

## قابلیت‌های کلیدی

| ماژول | توضیح |
|-------|-------|
| 🔐 **PQC Kyber-1024** | رمزگذاری پس‌کوانتومی با چرخش کلید هر ۴۵ ثانیه |
| 🤖 **AI Traffic Morphing** | جعل الگوی ترافیک Chrome، Firefox، Safari، Twitch، Zoom، Netflix |
| 🧠 **RL Q-Learning Agent** | یادگیری تقویتی برای انتخاب بهترین پروفایل در لحظه |
| 🎭 **GAN Cover Traffic** | تزریق ترافیک پوشش با شبکه‌های GAN |
| 🌐 **Domain Discovery** | کشف خودکار دامنه‌های قابل دسترس |
| 🔍 **IP Scanner** | اسکن موازی CDN برای یافتن IP پاک |
| 🛡️ **Active Probe Shield** | شناسایی و مسدود کردن بررسی‌های فعال |
| 📡 **QUIC Masquerade** | پوشاندن ترافیک در قالب QUIC |
| 🔀 **DNS/ICMP Tunnel** | تانل مخفی از طریق DNS و ICMP |
| 🆘 **Psiphon Fallback** | سایفون به‌عنوان پشتیبان اضطراری |
| 🔁 **Dynamic Orchestrator** | تغییر خودکار بین WireGuard و Shadowsocks |

---

## پشتیبانی از پلتفرم‌ها

- 📱 **Android** (APK با امضای خودکار)
- 🪟 **Windows** x64
- 🐧 **Linux** x64, ARM64, ARM
- 🍎 **iOS** (IPA بدون امضا)
- 🔌 **OpenWrt** (MIPS little-endian)
- 🖥️ **Scanner CLI** (argoscan)

---

## ساخت خودکار (GitHub Actions)

### پیش‌نیاز
فقط یک secret لازم است: `GH_TOKEN` با دسترسی `repo` و `workflow`.

### ساخت دستی
```bash
# در تنظیمات GitHub → Actions → build-all.yml → Run workflow
# نسخه را بدون ورودی بگذارید تا خودکار افزایش یابد
```

### ساخت با تگ
```bash
git tag v2.0.0
git push origin v2.0.0
```

---

## ساخت محلی

```bash
# نیاز: Go 1.23+
make tidy          # آماده‌سازی ماژول‌ها
make linux-amd64   # لینوکس x64
make windows       # ویندوز
make scanner       # ابزار argoscan
make all           # همه پلتفرم‌ها

# اجرای مستقیم
cd core && go run .
```

---

## ساختار فایل‌ها

```
argotunnel/
├── .github/workflows/build-all.yml  ← CI/CD کامل
├── core/                            ← موتور اصلی Go
│   ├── main.go
│   ├── engine/executor.go           ← اجراکننده اصلی
│   ├── capabilities/                ← ۵۰۰۰ قابلیت
│   ├── tunnel/                      ← WireGuard + Shadowsocks
│   ├── obfs/                        ← Fragmentation + uTLS + Fronting
│   ├── pqc/                         ← Kyber-1024 کوانتومی
│   ├── ai_morph/                    ← پروفایل‌های AI
│   ├── active_shield/               ← سپر ضد Probe
│   ├── dynamic_orchestra/           ← سوئیچ خودکار تانل
│   ├── dns_tunnel/                  ← تانل DNS
│   ├── icmp_tunnel/                 ← تانل ICMP
│   ├── dpi_analyzer/                ← تحلیل و دور زدن DPI
│   ├── qrng/                        ← اعداد تصادفی کوانتومی
│   ├── rl_agent/                    ← عامل Q-Learning
│   ├── gan_generator/               ← تزریق ترافیک GAN
│   ├── quic_masq/                   ← پوشش QUIC
│   ├── domain_discovery/            ← کشف دامنه
│   ├── ip_scanner/                  ← اسکن IP
│   └── psiphon/                     ← پشتیبان Psiphon
├── android/                         ← اپ اندروید Jetpack Compose
├── ios/                             ← اپ iOS Swift + NetworkExtension
├── windows/                         ← کلاینت ویندوز
├── linux/                           ← کلاینت لینوکس
├── scanner-cli/                     ← ابزار argoscan
└── openwrt/                         ← پکیج OpenWrt
```

---

## پروتکل‌های فیلترشکنی

| شرایط | پروتکل انتخابی |
|-------|---------------|
| اینترنت عادی | WireGuard + PQC |
| DPI فعال | Shadowsocks + uTLS Chrome |
| فیلترینگ شدید | QUIC Masquerade + Fragmentation |
| قطعی کامل | DNS/ICMP Tunnel + Psiphon |

---

## معماری ضد فیلترینگ ایران

```
کاربر → [AI Morph] → [Fragment] → [uTLS] → [Domain Fronting]
    → [WireGuard/SS + PQC Kyber-1024]
    → [CDN Clean IP / Discovered Domain]
    → [Psiphon Fallback اگر همه مسدود شدند]
```

---

> **نکته**: این پروژه برای دسترسی آزاد به اینترنت طراحی شده است.
