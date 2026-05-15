package engine

import (
	"log"
	"math/rand"
	"time"

	"github.com/sdcvvvhhyuu-wq/argotunnel/active_shield"
	"github.com/sdcvvvhhyuu-wq/argotunnel/ai_morph"
	"github.com/sdcvvvhhyuu-wq/argotunnel/capabilities"
	"github.com/sdcvvvhhyuu-wq/argotunnel/dns_tunnel"
	"github.com/sdcvvvhhyuu-wq/argotunnel/domain_discovery"
	"github.com/sdcvvvhhyuu-wq/argotunnel/dpi_analyzer"
	"github.com/sdcvvvhhyuu-wq/argotunnel/dynamic_orchestra"
	"github.com/sdcvvvhhyuu-wq/argotunnel/gan_generator"
	"github.com/sdcvvvhhyuu-wq/argotunnel/icmp_tunnel"
	"github.com/sdcvvvhhyuu-wq/argotunnel/ip_scanner"
	"github.com/sdcvvvhhyuu-wq/argotunnel/obfs"
	"github.com/sdcvvvhhyuu-wq/argotunnel/pqc"
	"github.com/sdcvvvhhyuu-wq/argotunnel/psiphon"
	"github.com/sdcvvvhhyuu-wq/argotunnel/quic_masq"
	"github.com/sdcvvvhhyuu-wq/argotunnel/rl_agent"
	"github.com/sdcvvvhhyuu-wq/argotunnel/tunnel"
)

type Executor struct {
	caps         capabilities.CapabilitySet
	frontingHosts []string
	cleanIPs     []string
}

func NewExecutor(c capabilities.CapabilitySet) *Executor {
	return &Executor{caps: c}
}

func (e *Executor) Start() error {
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	log.Println("  ArgoTunnel Ultimate v2.0 – Iran Censorship Bypass")
	log.Println("  Modules: WG + SS + Psiphon + PQC + AI + GAN + RL")
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

	domain_discovery.StartDiscovery()
	ip_scanner.StartScanning()

	baseHosts := []string{
		"cloudflare.com", "google.com", "amazon.com", "fastly.com",
		"akamai.com", "microsoft.com", "azure.com", "facebook.com",
		"twitter.com", "dropbox.com", "digitalocean.com", "cdn77.com",
		"stackpath.com", "bunnycdn.com", "gcorelabs.com", "github.com",
		"netlify.com", "vercel.com", "render.com", "jsdelivr.net",
	}
	e.frontingHosts = baseHosts

	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			discovered := domain_discovery.GetDiscoveredDomains()
			e.frontingHosts = append(baseHosts, discovered...)
			e.cleanIPs = nil
			for _, ip := range ip_scanner.GetCleanIPs() {
				e.cleanIPs = append(e.cleanIPs, ip.String())
			}
			choices := append(e.frontingHosts, e.cleanIPs...)
			if len(choices) > 0 {
				chosen := choices[rand.Intn(len(choices))]
				obfs.SetFrontingHost(chosen)
			}
		}
	}()

	log.Printf("[Engine] ⚡ Booting with %d AI/Quantum capabilities", len(e.caps.ActiveIDs))

	var primary, secondary tunnel.Tunnel
	if e.caps.Transport == "shadowsocks" {
		primary = tunnel.NewShadowsocksTunnel()
		secondary = tunnel.NewWireGuardTunnel()
	} else {
		primary = tunnel.NewWireGuardTunnel()
		secondary = tunnel.NewShadowsocksTunnel()
	}

	if e.caps.UseUTLS {
		obfs.EnableUTLS(e.caps.UTLSProfile)
	} else {
		obfs.EnableUTLS("chrome_124")
	}

	if e.caps.FragSize > 0 {
		obfs.EnableFragmentation(e.caps.FragSize)
	}

	dpiA := dpi_analyzer.NewAnalyzer()
	rl_agent.StartLearning()

	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			bestProfile := rl_agent.GetRecommendedProfile()
			dpiA.SetProfile(bestProfile)
			ai_morph.SetActiveProfile(bestProfile)
		}
	}()

	ai_morph.EnableTrafficMorphing()
	active_shield.StartProbeShield()

	if e.caps.PQCLevel > 0 {
		sess, err := pqc.NewQuantumSession(e.caps.PQCLevel)
		if err == nil {
			primary.SetQuantumSession(sess)
			secondary.SetQuantumSession(sess)
			sess.RegisterTunnel(primary)
			sess.StartKeyRollover()
			log.Println("[Engine] ✅ PQC Kyber-1024 quantum session active")
		}
	}

	if e.caps.UseDNSTunnel {
		dns_tunnel.NewDNSTunnel("tunnel.argotunnel.com", nil).Start()
	}

	if e.caps.UseICMPTunnel {
		icmp_tunnel.NewICMPTunnel().Start()
	}

	gan_generator.EnableGANMorphing(20 * time.Second)
	quic_masq.EnableQUICWrapper(primary)
	dynamic_orchestra.NewOrchestrator(primary, secondary).Start()

	if e.caps.PsiphonFallback {
		go psiphon.StartFallback()
	}

	log.Println("[Engine] 🚀 All modules initialized – bypassing Iran censorship...")
	return primary.Start()
}
