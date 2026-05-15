.PHONY: all core linux windows scanner clean tidy

GOCMD   = go
VERSION = 2.0
LDFLAGS = -ldflags="-s -w"

all: tidy core linux-amd64 linux-arm64 linux-arm scanner

tidy:
	@echo "→ Tidying Go modules..."
	@cd core && $(GOCMD) mod tidy

core:
	@echo "→ Building core for current OS..."
	@cd core && CGO_ENABLED=0 $(GOCMD) build $(LDFLAGS) -o ../argotunnel-$(VERSION) .

linux-amd64:
	@echo "→ Building Linux amd64..."
	@cd core && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GOCMD) build $(LDFLAGS) -o ../linux/ArgoTunnel-linux-amd64 .

linux-arm64:
	@echo "→ Building Linux arm64..."
	@cd core && CGO_ENABLED=0 GOOS=linux GOARCH=arm64 $(GOCMD) build $(LDFLAGS) -o ../linux/ArgoTunnel-linux-arm64 .

linux-arm:
	@echo "→ Building Linux arm..."
	@cd core && CGO_ENABLED=0 GOOS=linux GOARCH=arm GOARM=7 $(GOCMD) build $(LDFLAGS) -o ../linux/ArgoTunnel-linux-arm .

windows:
	@echo "→ Building Windows amd64..."
	@cd core && CGO_ENABLED=0 GOOS=windows GOARCH=amd64 $(GOCMD) build -ldflags="-s -w -H windowsgui" -o ../windows/ArgoTunnel.exe .

openwrt-mips:
	@echo "→ Building OpenWrt MIPS..."
	@cd core && CGO_ENABLED=0 GOOS=linux GOARCH=mipsle GOMIPS=softfloat $(GOCMD) build $(LDFLAGS) -o ../openwrt/files/argotunnel .

scanner:
	@echo "→ Building argoscan CLI..."
	@cd scanner-cli && CGO_ENABLED=0 $(GOCMD) build $(LDFLAGS) -o argoscan .

android:
	@echo "→ Building Android APK..."
	@cd android && ./gradlew assembleRelease

clean:
	@rm -f linux/ArgoTunnel-linux-*
	@rm -f windows/ArgoTunnel.exe
	@rm -f scanner-cli/argoscan
	@rm -f openwrt/files/argotunnel
	@rm -f argotunnel-*
	@echo "→ Clean done."
