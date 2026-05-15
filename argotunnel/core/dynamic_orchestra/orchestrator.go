// Package dynamic_orchestra — auto-rotating DPI bypass engine.
// Core feature: algorithm changes every 2 seconds automatically.
package dynamic_orchestra

import (
	"log"
	"math/rand"
	"sync"
	"time"
)

// DPIAlgorithm represents one Iran-specific DPI bypass technique.
type DPIAlgorithm struct {
	ID          string
	Name        string
	Description string
	Technique   string
}

// Algorithms — all techniques effective against Iran's IRGC DPI / Arvancloud / Hamnet filtering.
var Algorithms = []DPIAlgorithm{
	{"tls_record_split", "TLS Record Splitting", "Split TLS ClientHello across multiple TCP segments to prevent DPI pattern match", "fragmentation"},
	{"tcp_segment_overlap", "TCP Segment Overlap", "Send overlapping TCP segments to confuse DPI reassembly engine", "fragmentation"},
	{"http2_multiplex", "HTTP/2 Multiplexing", "Multiplex streams inside HTTP/2 to hide VPN handshake pattern", "mux"},
	{"ws_over_tls", "WebSocket over TLS", "Encapsulate tunnel inside WSS upgrade — appears as legitimate browser traffic", "websocket"},
	{"utls_randomize", "uTLS Randomized Fingerprint", "Rotate TLS fingerprint every connection to appear as different browser versions", "fingerprint"},
	{"quic_masquerade", "QUIC Masquerade", "Shape traffic to match QUIC/HTTP3 patterns — Iran DPI has poor QUIC detection", "quic"},
	{"domain_fronting", "Domain Fronting via CDN", "Use Cloudflare CDN: SNI=legit domain, Host header=actual server", "fronting"},
	{"reality_vision", "XTLS REALITY", "Zero-RTT ECH-based protocol — indistinguishable from TLS 1.3 HTTPS", "reality"},
	{"dns_over_https", "DNS-over-HTTPS Tunnel", "Covert data channel inside DoH queries to Cloudflare/Google", "dns"},
	{"icmp_covert", "ICMP Covert Channel", "Data inside ICMP echo payloads — rarely inspected by Iranian ISPs", "icmp"},
	{"padding_morph", "Traffic Padding Morph", "Pad packets to fixed bucket sizes (1024/4096/16384) to break statistical analysis", "padding"},
	{"timing_jitter", "Timing Jitter Injection", "Randomize ±80ms inter-packet delay to defeat timing-based DPI correlation", "timing"},
	{"tls_in_tls", "TLS-in-TLS Tunnel", "Outer TLS looks like HTTPS; inner layer carries WireGuard encrypted payload", "nested_tls"},
	{"shadowsocks_2022", "Shadowsocks 2022 AEAD", "SS-2022 with AEAD-AES-256-GCM + timestamp replay protection (IETF standard)", "shadowsocks"},
	{"hysteria2_brutal", "Hysteria2 Brutal CC", "QUIC-based tunnel with aggressive congestion — hard to classify, bypasses QoS throttling", "hysteria"},
	{"mtu_probe_evasion", "MTU Probe Evasion", "Force MSS=536 to prevent DPI from seeing reassembled full packets", "mtu"},
}

// Orchestrator manages DPI algorithm rotation and tunnel protocol switching.
type Orchestrator struct {
	mu               sync.RWMutex
	currentIdx       int
	rotationTicker   *time.Ticker
	stopCh           chan struct{}
	rotationCount    int64
	rotationInterval time.Duration
	protocol         string
	connected        bool
	switchCount      int
}

var globalOrch *Orchestrator
var globalOnce sync.Once

// Get returns the singleton Orchestrator.
func Get() *Orchestrator {
	globalOnce.Do(func() {
		globalOrch = &Orchestrator{
			currentIdx:       0,
			stopCh:           make(chan struct{}, 1),
			rotationInterval: 2 * time.Second,
			protocol:         "wireguard",
		}
	})
	return globalOrch
}

// Start begins the 2-second auto-rotation loop.
func (o *Orchestrator) Start() {
	o.mu.Lock()
	o.connected = true
	o.rotationTicker = time.NewTicker(o.rotationInterval)
	o.mu.Unlock()

	log.Printf("[Orchestra] ✅ Started — %d DPI algorithms, rotating every %v automatically",
		len(Algorithms), o.rotationInterval)

	go o.rotationLoop()
}

// Stop halts the rotation loop.
func (o *Orchestrator) Stop() {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.connected = false
	if o.rotationTicker != nil {
		o.rotationTicker.Stop()
		o.rotationTicker = nil
	}
	select {
	case o.stopCh <- struct{}{}:
	default:
	}
	log.Println("[Orchestra] Stopped")
}

// rotationLoop is the core 2-second ticker goroutine.
func (o *Orchestrator) rotationLoop() {
	for {
		select {
		case <-o.rotationTicker.C:
			o.rotate()
		case <-o.stopCh:
			return
		}
	}
}

// rotate selects the next algorithm (round-robin + 10% random jump).
func (o *Orchestrator) rotate() {
	o.mu.Lock()
	defer o.mu.Unlock()

	// 10% chance of random jump — prevents ML classifiers from learning the pattern
	if rand.Intn(10) == 0 {
		o.currentIdx = rand.Intn(len(Algorithms))
	} else {
		o.currentIdx = (o.currentIdx + 1) % len(Algorithms)
	}
	o.rotationCount++
	algo := Algorithms[o.currentIdx]
	log.Printf("[Orchestra] ⟳ #%d → %s (%s) [total rotations: %d]",
		o.currentIdx, algo.Name, algo.Technique, o.rotationCount)

	o.selectProtocol(algo.Technique)
}

// selectProtocol picks the best underlying tunnel for the current technique.
func (o *Orchestrator) selectProtocol(technique string) {
	switch technique {
	case "hysteria", "quic":
		o.protocol = "hysteria2"
	case "shadowsocks":
		o.protocol = "shadowsocks"
	case "reality", "nested_tls":
		o.protocol = "wireguard_reality"
	case "icmp":
		o.protocol = "icmp_tunnel"
	case "dns":
		o.protocol = "dns_tunnel"
	default:
		o.protocol = "wireguard"
	}
}

// Status returns the current orchestrator state.
func (o *Orchestrator) Status() (algo DPIAlgorithm, idx int, count int64, protocol string, connected bool) {
	o.mu.RLock()
	defer o.mu.RUnlock()
	return Algorithms[o.currentIdx], o.currentIdx, o.rotationCount, o.protocol, o.connected
}

// AllAlgorithms returns the full algorithm list.
func AllAlgorithms() []DPIAlgorithm { return Algorithms }

// SetRotationInterval changes the rotation speed (default 2s).
func (o *Orchestrator) SetRotationInterval(d time.Duration) {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.rotationInterval = d
	if o.rotationTicker != nil {
		o.rotationTicker.Reset(d)
	}
}

// ForceSwitch immediately advances to the next algorithm.
func (o *Orchestrator) ForceSwitch() { o.rotate() }

// SwitchCount returns the number of protocol/algorithm switches.
func (o *Orchestrator) SwitchCount() int {
	o.mu.RLock()
	defer o.mu.RUnlock()
	return o.switchCount
}
