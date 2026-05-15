package domain_discovery

import (
	"log"
	"math/rand"
	"net"
	"sync"
	"time"
)

var (
	baseCandidates = []string{
		"cloudflare.com", "google.com", "amazon.com", "fastly.com",
		"akamai.com", "microsoft.com", "azure.com", "facebook.com",
		"twitter.com", "dropbox.com", "godaddy.com", "namecheap.com",
		"digitalocean.com", "linode.com", "vultr.com", "cdn77.com",
		"stackpath.com", "cachefly.com", "bunnycdn.com", "gcorelabs.com",
		"edgecast.com", "limelight.com", "keycdn.com", "maxcdn.com",
		"jsdelivr.net", "unpkg.com", "cdnjs.cloudflare.com", "github.com",
		"githubusercontent.com", "netlify.com", "vercel.com", "render.com",
	}
	discoveredDomains []string
	mu                sync.RWMutex
	discovered        = make(map[string]bool)
)

func GetDiscoveredDomains() []string {
	mu.RLock()
	defer mu.RUnlock()
	res := make([]string, len(discoveredDomains))
	copy(res, discoveredDomains)
	return res
}

func StartDiscovery() {
	log.Println("[Discovery] AI Domain Discovery engine started")
	go func() {
		for {
			candidate := generateCandidate()
			if isReachable(candidate) {
				addDiscovered(candidate)
			}
			time.Sleep(30*time.Second + time.Duration(rand.Intn(30))*time.Second)
		}
	}()
	go func() {
		for _, base := range baseCandidates {
			if isReachable(base) {
				addDiscovered(base)
			}
			time.Sleep(2 * time.Second)
		}
	}()
}

func generateCandidate() string {
	base := baseCandidates[rand.Intn(len(baseCandidates))]
	prefixes := []string{"www", "cdn", "edge", "static", "assets", "api", "img", "v", "s", "media"}
	return prefixes[rand.Intn(len(prefixes))] + "." + base
}

func isReachable(domain string) bool {
	conn, err := net.DialTimeout("tcp", net.JoinHostPort(domain, "443"), 3*time.Second)
	if err != nil {
		return false
	}
	conn.Close()
	return true
}

func addDiscovered(domain string) {
	mu.Lock()
	defer mu.Unlock()
	if discovered[domain] {
		return
	}
	discovered[domain] = true
	discoveredDomains = append(discoveredDomains, domain)
	log.Printf("[Discovery] ✅ Reachable domain found: %s (total: %d)", domain, len(discoveredDomains))
}
