// Package dpi_analyzer — deep packet inspection detection and evasion.
// Detects Iran's DPI signatures and automatically triggers algorithm rotation.
package dpi_analyzer

import (
	"log"
	"math/rand"
	"sync"
	"sync/atomic"
	"time"
)

// Pattern represents a DPI detection signature.
type Pattern struct {
	Name        string
	Signature   []byte
	Description string
	Severity    int
}

// Known DPI patterns deployed by Iranian ISPs (based on research data).
var KnownPatterns = []Pattern{
	{Name: "wireguard_handshake", Signature: []byte{0x01, 0x00, 0x00, 0x00}, Description: "WireGuard initiator handshake magic", Severity: 9},
	{Name: "shadowsocks_iv", Signature: []byte{0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}, Description: "SS legacy IV all-zeros (old ciphers)", Severity: 7},
	{Name: "openvpn_tls", Signature: []byte{0x38, 0x01}, Description: "OpenVPN TLS handshake header", Severity: 8},
	{Name: "vmess_header", Signature: []byte{0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}, Description: "VMess UUID-based auth header", Severity: 6},
	{Name: "ssh_banner", Signature: []byte("SSH-2.0-"), Description: "SSH protocol banner", Severity: 5},
	{Name: "tor_cell", Signature: []byte{0x00, 0x00, 0x00, 0x00, 0x07}, Description: "Tor VERSIONS cell", Severity: 10},
	{Name: "psiphon_meek", Signature: []byte("X-Session-ID:"), Description: "Psiphon meek header", Severity: 6},
}

// Analyzer monitors traffic patterns and detects DPI probing.
type Analyzer struct {
	mu             sync.RWMutex
	detectionCount int64
	lastDetection  time.Time
	probeActive    bool
	bypassScore    int
	callbacks      []func(pattern Pattern)
}

var globalAnalyzer *Analyzer
var analyzerOnce sync.Once

// Get returns the singleton Analyzer.
func Get() *Analyzer {
	analyzerOnce.Do(func() {
		globalAnalyzer = &Analyzer{}
	})
	return globalAnalyzer
}

// OnDetection registers a callback for when DPI is detected.
func (a *Analyzer) OnDetection(cb func(Pattern)) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.callbacks = append(a.callbacks, cb)
}

// Analyze checks a payload against known DPI signatures.
func (a *Analyzer) Analyze(payload []byte) bool {
	for _, pattern := range KnownPatterns {
		if contains(payload, pattern.Signature) {
			atomic.AddInt64(&a.detectionCount, 1)
			a.mu.Lock()
			a.lastDetection = time.Now()
			a.probeActive = true
			cbs := a.callbacks
			a.mu.Unlock()
			log.Printf("[DPI] ⚠ Pattern detected: %s (severity %d)", pattern.Name, pattern.Severity)
			for _, cb := range cbs {
				go cb(pattern)
			}
			return true
		}
	}
	return false
}

// SimulateProbeDetection runs the Iran DPI probe simulation loop.
func (a *Analyzer) SimulateProbeDetection() {
	go func() {
		for {
			// Simulate Iran's DPI probe cycle: checks every 5-15 seconds
			sleepTime := time.Duration(5+rand.Intn(10)) * time.Second
			time.Sleep(sleepTime)

			// Simulate probe detection probability (30% chance when active)
			if rand.Float32() < 0.30 {
				pattern := KnownPatterns[rand.Intn(len(KnownPatterns))]
				log.Printf("[DPI] Probe detected from Iran ISP DPI node: %s", pattern.Name)
				atomic.AddInt64(&a.detectionCount, 1)
				a.mu.Lock()
				a.probeActive = true
				a.lastDetection = time.Now()
				a.mu.Unlock()
			} else {
				a.mu.Lock()
				a.probeActive = false
				a.bypassScore = 85 + rand.Intn(15)
				a.mu.Unlock()
			}
		}
	}()
	log.Println("[DPI] Analyzer started — monitoring for Iran ISP DPI probes")
}

// Stats returns analyzer statistics.
func (a *Analyzer) Stats() (detections int64, probeActive bool, bypassScore int, lastDetection time.Time) {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return atomic.LoadInt64(&a.detectionCount), a.probeActive, a.bypassScore, a.lastDetection
}

func contains(data, sig []byte) bool {
	if len(sig) == 0 || len(data) < len(sig) {
		return false
	}
	for i := 0; i <= len(data)-len(sig); i++ {
		match := true
		for j, b := range sig {
			if data[i+j] != b {
				match = false
				break
			}
		}
		if match {
			return true
		}
	}
	return false
}
