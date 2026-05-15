package ip_scanner

import (
	"log"
	"math/rand"
	"net"
	"sync"
	"time"
)

var (
	cdnCIDRs = []string{
		"104.16.0.0/12",
		"172.64.0.0/13",
		"13.32.0.0/15",
		"13.224.0.0/14",
		"151.101.0.0/16",
		"23.32.0.0/11",
		"199.232.0.0/16",
		"185.199.108.0/22",
		"140.82.112.0/20",
		"1.1.1.0/24",
		"1.0.0.0/24",
	}
	cleanIPs []net.IP
	mu       sync.RWMutex
)

func GetCleanIPs() []net.IP {
	mu.RLock()
	defer mu.RUnlock()
	res := make([]net.IP, len(cleanIPs))
	copy(res, cleanIPs)
	return res
}

func StartScanning() {
	log.Println("[Scanner] AI IP Scanner active – probing CDN ranges for clean IPs...")
	go func() {
		for {
			scanCIDRs()
			time.Sleep(10 * time.Minute)
		}
	}()
}

func scanCIDRs() {
	var wg sync.WaitGroup
	results := make(chan net.IP, 100)
	for _, cidr := range cdnCIDRs {
		wg.Add(1)
		go func(c string) {
			defer wg.Done()
			_, ipnet, err := net.ParseCIDR(c)
			if err != nil {
				return
			}
			for i := 0; i < 20; i++ {
				ip := randomIP(ipnet)
				if ip == nil {
					continue
				}
				if isClean(ip) {
					results <- ip
				}
			}
		}(cidr)
	}
	go func() {
		wg.Wait()
		close(results)
	}()
	newIPs := []net.IP{}
	seen := map[string]bool{}
	for ip := range results {
		key := ip.String()
		if !seen[key] {
			seen[key] = true
			newIPs = append(newIPs, ip)
			log.Printf("[Scanner] ✅ Clean IP: %s", key)
		}
	}
	mu.Lock()
	defer mu.Unlock()
	existing := map[string]bool{}
	for _, ip := range cleanIPs {
		existing[ip.String()] = true
	}
	for _, ip := range newIPs {
		if !existing[ip.String()] {
			cleanIPs = append(cleanIPs, ip)
		}
	}
	if len(cleanIPs) > 200 {
		cleanIPs = cleanIPs[len(cleanIPs)-200:]
	}
}

func randomIP(ipnet *net.IPNet) net.IP {
	ip := make(net.IP, len(ipnet.IP))
	copy(ip, ipnet.IP)
	ip = ip.To4()
	if ip == nil {
		return nil
	}
	mask := ipnet.Mask
	randBytes := make([]byte, 4)
	rand.Read(randBytes)
	for i := range ip {
		ip[i] = (ip[i] & mask[i]) | (randBytes[i] & ^mask[i])
	}
	return ip
}

func isClean(ip net.IP) bool {
	conn, err := net.DialTimeout("tcp", net.JoinHostPort(ip.String(), "443"), 2*time.Second)
	if err != nil {
		return false
	}
	conn.Close()
	return true
}
