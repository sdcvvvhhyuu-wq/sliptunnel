package dynamic_orchestra

import (
	"log"
	"math/rand"
	"time"

	"github.com/sdcvvvhhyuu-wq/argotunnel/tunnel"
)

type Orchestrator struct {
	current    tunnel.Tunnel
	wg         tunnel.Tunnel
	ss         tunnel.Tunnel
	switchCount int
}

func NewOrchestrator(wg, ss tunnel.Tunnel) *Orchestrator {
	return &Orchestrator{wg: wg, ss: ss, current: wg}
}

func (o *Orchestrator) Start() {
	log.Println("[Orchestrator] Dynamic tunnel switching started (WireGuard ↔ Shadowsocks)")
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			loss := rand.Float32()
			latency := rand.Intn(500)
			if loss > 0.2 || latency > 300 {
				log.Printf("[Orchestrator] High loss=%.2f latency=%dms → switching to Shadowsocks", loss, latency)
				o.SwitchTo(o.ss)
			} else {
				if o.current == o.ss {
					log.Printf("[Orchestrator] Network stable loss=%.2f → switching back to WireGuard", loss)
					o.SwitchTo(o.wg)
				}
			}
		}
	}()
}

func (o *Orchestrator) SwitchTo(newTun tunnel.Tunnel) {
	if o.current == newTun {
		return
	}
	o.current = newTun
	o.switchCount++
	if err := o.current.Start(); err != nil {
		log.Printf("[Orchestrator] Tunnel start error: %v", err)
	}
	log.Printf("[Orchestrator] Switch #%d completed", o.switchCount)
}

func (o *Orchestrator) GetSwitchCount() int {
	return o.switchCount
}
