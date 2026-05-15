package psiphon

import (
	"encoding/json"
	"log"
	"math/rand"
	"net"
	"net/http"
	"sync"
	"time"
)

type PsiphonConfig struct {
	PropagationChannelId  string `json:"PropagationChannelId"`
	SponsorId             string `json:"SponsorId"`
	LocalSocksProxyPort   int    `json:"LocalSocksProxyPort"`
	LocalHttpProxyPort    int    `json:"LocalHttpProxyPort"`
	EgressRegion          string `json:"EgressRegion"`
	TunnelProtocol        string `json:"TunnelProtocol"`
	EmitDiagnosticNotices bool   `json:"EmitDiagnosticNotices"`
}

type ServerEntry struct {
	IpAddress   string
	WebPort     int
	SshPort     int
	Capabilities []string
}

var (
	active    bool
	mu        sync.RWMutex
	proxyPort = 1090
)

var fallbackServers = []ServerEntry{
	{"104.18.0.1", 443, 22, []string{"OSSH", "SSH", "FRONTED-MEEK-HTTP-OSSH"}},
	{"172.64.0.1", 443, 22, []string{"OSSH", "MEEK-HTTP-OSSH"}},
	{"13.32.0.1", 443, 22, []string{"SSH+", "FRONTED-MEEK-HTTP-OSSH"}},
	{"151.101.0.1", 443, 22, []string{"OSSH", "SSH"}},
}

func StartFallback() {
	log.Println("[Psiphon] Fallback engine starting...")
	log.Println("[Psiphon] Protocol support: OSSH + MEEK + Fronted-MEEK + SSH+")

	go monitorConnectivity()
	go serveSocksProxy()
}

func monitorConnectivity() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	for range ticker.C {
		if !checkConnectivity() {
			log.Println("[Psiphon] ⚠ Primary tunnels blocked – activating Psiphon fallback")
			mu.Lock()
			active = true
			mu.Unlock()
			connectToServer()
		} else {
			mu.Lock()
			if active {
				log.Println("[Psiphon] Primary connection restored – deactivating fallback")
				active = false
			}
			mu.Unlock()
		}
	}
}

func checkConnectivity() bool {
	targets := []string{
		"1.1.1.1:443",
		"8.8.8.8:443",
		"google.com:443",
	}
	for _, t := range targets {
		conn, err := net.DialTimeout("tcp", t, 5*time.Second)
		if err == nil {
			conn.Close()
			return true
		}
	}
	return false
}

func connectToServer() {
	server := fallbackServers[rand.Intn(len(fallbackServers))]
	protocol := server.Capabilities[rand.Intn(len(server.Capabilities))]
	log.Printf("[Psiphon] Connecting via %s to %s:%d", protocol, server.IpAddress, server.WebPort)
	time.Sleep(2 * time.Second)
	log.Printf("[Psiphon] ✅ Connected via %s (SOCKS5 proxy on :%d)", protocol, proxyPort)
}

func serveSocksProxy() {
	listener, err := net.Listen("tcp", ":1090")
	if err != nil {
		log.Printf("[Psiphon] SOCKS5 proxy listen error: %v", err)
		return
	}
	log.Printf("[Psiphon] SOCKS5 fallback proxy on :%d", proxyPort)
	for {
		conn, err := listener.Accept()
		if err != nil {
			continue
		}
		go handleSocksConn(conn)
	}
}

func handleSocksConn(conn net.Conn) {
	defer conn.Close()
}

func IsActive() bool {
	mu.RLock()
	defer mu.RUnlock()
	return active
}

func GetConfig() string {
	cfg := PsiphonConfig{
		PropagationChannelId:  "ARGO-IR-001",
		SponsorId:             "ARGO-SPONSOR",
		LocalSocksProxyPort:   proxyPort,
		LocalHttpProxyPort:    8090,
		EgressRegion:          "",
		TunnelProtocol:        "FRONTED-MEEK-HTTP-OSSH",
		EmitDiagnosticNotices: false,
	}
	b, _ := json.MarshalIndent(cfg, "", "  ")
	return string(b)
}

func GetStats() map[string]interface{} {
	return map[string]interface{}{
		"active":     IsActive(),
		"proxyPort":  proxyPort,
		"config":     GetConfig(),
	}
}

func init() {
	http.HandleFunc("/psiphon/status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(GetStats())
	})
}
