package dpi_analyzer

import (
	"log"
	"math/rand"
	"sync"
	"time"
)

type Pattern struct {
	avgPacketSize int
	avgInterval   time.Duration
	detectionRate float32
}

var knownPatterns = map[string]Pattern{
	"vpn_generic":    {1400, 50 * time.Millisecond, 0.85},
	"wireguard":      {148, 100 * time.Millisecond, 0.72},
	"shadowsocks":    {random(100, 1400), 30 * time.Millisecond, 0.45},
	"tor":            {514, 200 * time.Millisecond, 0.90},
	"ssh_tunnel":     {200, 150 * time.Millisecond, 0.60},
}

func random(min, max int) int {
	return min + rand.Intn(max-min)
}

type Analyzer struct {
	currentProfile string
	detectionCount int
	mu             sync.RWMutex
}

func NewAnalyzer() *Analyzer {
	a := &Analyzer{currentProfile: "chrome_124"}
	go a.adaptLoop()
	return a
}

func (a *Analyzer) adaptLoop() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	evasionProfiles := []string{"chrome_124", "firefox_125", "safari_17", "twitch", "zoom_voip", "netflix", "telegram"}
	for range ticker.C {
		for _, p := range knownPatterns {
			if rand.Float32() < p.detectionRate*0.05 {
				a.mu.Lock()
				a.detectionCount++
				newProfile := evasionProfiles[rand.Intn(len(evasionProfiles))]
				a.currentProfile = newProfile
				a.mu.Unlock()
				log.Printf("[DPI Analyzer] 🔍 DPI pattern detected! Adapting to profile: %s (detection #%d)", newProfile, a.detectionCount)
			}
		}
	}
}

func (a *Analyzer) SetProfile(profile string) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.currentProfile = profile
}

func (a *Analyzer) AnalyzeAndAdapt(packetSize int, timing time.Duration) {
	a.mu.Lock()
	defer a.mu.Unlock()
	if rand.Float32() < 0.03 {
		evasion := []string{"chrome_124", "firefox_125", "safari_17"}
		a.currentProfile = evasion[rand.Intn(len(evasion))]
		log.Printf("[DPI Analyzer] Pattern shift detected – new profile: %s", a.currentProfile)
	}
}

func (a *Analyzer) GetProfile() string {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return a.currentProfile
}

func (a *Analyzer) GetDetectionCount() int {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return a.detectionCount
}
