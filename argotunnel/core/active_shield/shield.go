package active_shield

import (
	"log"
	"net"
	"sync"
	"time"
)

const probeThreshold = 3

var (
	suspiciousIPs sync.Map
	blockedIPs    sync.Map
)

func StartProbeShield() {
	log.Printf("[Shield] Active Probe Detection online (threshold: %d probes)", probeThreshold)
	go func() {
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			suspiciousIPs.Range(func(key, value any) bool {
				count := value.(int)
				if count >= probeThreshold {
					log.Printf("[Shield] 🚨 Active probe detected from %s (%d attempts) – blocking + morphing", key, count)
					blockedIPs.Store(key, true)
					suspiciousIPs.Delete(key)
				}
				return true
			})
		}
	}()
	go func() {
		cleanupTicker := time.NewTicker(5 * time.Minute)
		defer cleanupTicker.Stop()
		for range cleanupTicker.C {
			blockedIPs.Range(func(key, _ any) bool {
				blockedIPs.Delete(key)
				return true
			})
			log.Println("[Shield] Blocked IP list cleared (periodic refresh)")
		}
	}()
}

func RecordProbe(ip net.IP) {
	key := ip.String()
	val, _ := suspiciousIPs.LoadOrStore(key, 0)
	suspiciousIPs.Store(key, val.(int)+1)
}

func IsBlocked(ip net.IP) bool {
	_, blocked := blockedIPs.Load(ip.String())
	return blocked
}
