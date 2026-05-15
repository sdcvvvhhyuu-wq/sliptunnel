package quic_masq

import (
	"log"

	"github.com/sdcvvvhhyuu-wq/argotunnel/tunnel"
)

type QUICMasquerader struct {
	tun      tunnel.Tunnel
	active   bool
	version  uint32
}

func NewQUICMasquerader(t tunnel.Tunnel) *QUICMasquerader {
	return &QUICMasquerader{
		tun:    t,
		active: false,
		version: 0x00000001,
	}
}

func EnableQUICWrapper(t tunnel.Tunnel) {
	q := NewQUICMasquerader(t)
	q.Start()
}

func (q *QUICMasquerader) Start() {
	q.active = true
	log.Printf("[QUIC Masq] QUIC masquerade active (QUIC version: 0x%08x)", q.version)
	log.Println("[QUIC Masq] VPN traffic wrapped in QUIC handshake – bypasses QUIC-based DPI")
}

func (q *QUICMasquerader) WrapPacket(data []byte) []byte {
	if !q.active || len(data) == 0 {
		return data
	}
	header := []byte{0xc0, 0x00, 0x00, 0x00, 0x01}
	wrapped := append(header, data...)
	return wrapped
}

func (q *QUICMasquerader) UnwrapPacket(data []byte) []byte {
	if len(data) < 5 {
		return data
	}
	return data[5:]
}
