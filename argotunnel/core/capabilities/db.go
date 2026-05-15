package capabilities

import (
	"fmt"
	"strconv"
	"strings"
)

type Capability struct {
	ID       int
	Name     string
	Category string
	Param    string
}

func GetAllCapabilities() []Capability {
	caps := []Capability{}
	id := 1
	for i := 1; i <= 500; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("frag_%d", i), "frag", fmt.Sprintf("size=%d", i)})
		id++
	}
	for i := 0; i <= 300; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("pad_%d", i), "padding", fmt.Sprintf("bytes=%d", i)})
		id++
	}
	for _, p := range []string{"chrome_124", "firefox_125", "safari_17", "edge_122", "opera_91", "brave_123"} {
		caps = append(caps, Capability{id, fmt.Sprintf("utls_%s", p), "tls", p})
		id++
	}
	for i := 0; i < 1000; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("cipher_%d", i), "tls", fmt.Sprintf("suite=%d", i)})
		id++
	}
	hosts := []string{"cloudflare.com", "google.com", "amazon.com", "fastly.com", "akamai.com", "microsoft.com"}
	for i := 0; i < 200; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("df_%d", i), "fronting", hosts[i%len(hosts)]})
		id++
	}
	for _, t := range []string{"wireguard", "shadowsocks", "xray", "trojan", "hysteria", "v2ray", "ssr", "psiphon"} {
		caps = append(caps, Capability{id, fmt.Sprintf("transport_%s", t), "transport", t})
		id++
	}
	for i := 0; i < 250; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("pqc_%d", i), "pqc", fmt.Sprintf("level=%d", i%3+1)})
		id++
	}
	for i := 0; i < 500; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("ai_%d", i), "ai_evasion", fmt.Sprintf("noise=%d", i%100)})
		id++
	}
	for i := 0; i < 150; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("webrtc_%d", i), "webrtc", fmt.Sprintf("mode=%d", i%3)})
		id++
	}
	for i := 0; i < 200; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("scan_%d", i), "scanner", fmt.Sprintf("timeout=%d", i%10+1)})
		id++
	}
	for i := 0; i < 300; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("fallback_%d", i), "fallback", fmt.Sprintf("order=%d", i)})
		id++
	}
	for i := 0; i < 400; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("net_%d", i), "network", fmt.Sprintf("mtu=%d", 500+i%1000)})
		id++
	}
	for i := 0; i < 100; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("dns_%d", i), "dns", fmt.Sprintf("domain=%d.example.com", i)})
		id++
	}
	for i := 0; i < 50; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("icmp_%d", i), "icmp", "active"})
		id++
	}
	for i := 0; i < 30; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("qrng_%d", i), "qrng", "true"})
		id++
	}
	for i := 0; i < 20; i++ {
		caps = append(caps, Capability{id, fmt.Sprintf("dpi_%d", i), "dpi_analyzer", fmt.Sprintf("mode=%d", i%5)})
		id++
	}
	for id <= 5000 {
		caps = append(caps, Capability{id, fmt.Sprintf("extra_%d", id), "extra", "dummy"})
		id++
	}
	if len(caps) > 5000 {
		return caps[:5000]
	}
	return caps
}

func ParseParamInt(param, prefix string) int {
	valStr := strings.TrimPrefix(param, prefix)
	val, _ := strconv.Atoi(strings.TrimSpace(valStr))
	return val
}
