package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/sdcvvvhhyuu-wq/argotunnel/capabilities"
	"github.com/sdcvvvhhyuu-wq/argotunnel/engine"
)

func main() {
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Println("  ArgoTunnel Ultimate v2.0 – Linux")
	fmt.Println("  AI/Quantum Anti-Censorship for Iran")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

	caps := capabilities.SelectOptimal()
	exec := engine.NewExecutor(caps)

	go func() {
		if err := exec.Start(); err != nil {
			log.Fatalf("Engine error: %v", err)
		}
	}()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM, syscall.SIGHUP)
	sig := <-c
	fmt.Printf("ArgoTunnel stopped (signal: %v)\n", sig)
}
