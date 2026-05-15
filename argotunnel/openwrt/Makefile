include $(TOPDIR)/rules.mk

PKG_NAME    := argotunnel
PKG_VERSION := 2.0
PKG_RELEASE := 1

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/argotunnel
  SECTION   := net
  CATEGORY  := Network
  TITLE     := ArgoTunnel – AI/Quantum Anti-Censorship VPN
  URL       := https://github.com/sdcvvvhhyuu-wq/argotunnel
  DEPENDS   := +kmod-tun +iptables +ip6tables +ipset
endef

define Package/argotunnel/description
  ArgoTunnel v2.0 Ultimate – AI-powered censorship bypass for Iran.
  Features: WireGuard + Shadowsocks + Psiphon fallback,
  PQC Kyber-1024 encryption, AI traffic morphing (RL + GAN),
  DPI bypass, automatic IP/domain scanner.
endef

define Build/Compile
  # Binary is cross-compiled by CI and placed in files/
endef

define Package/argotunnel/install
  $(INSTALL_DIR) $(1)/usr/bin
  $(INSTALL_DIR) $(1)/etc/init.d
  $(INSTALL_DIR) $(1)/etc/argotunnel
  $(INSTALL_BIN) ./files/argotunnel $(1)/usr/bin/argotunnel
  $(INSTALL_BIN) ./files/argotunnel.init $(1)/etc/init.d/argotunnel
  $(INSTALL_DATA) ./files/config.json $(1)/etc/argotunnel/config.json
endef

define Package/argotunnel/postinst
#!/bin/sh
/etc/init.d/argotunnel enable
/etc/init.d/argotunnel start
endef

$(eval $(call BuildPackage,argotunnel))
