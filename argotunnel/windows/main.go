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
	logFile, _ := os.OpenFile("argotunnel.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if logFile != nil {
		log.SetOutput(logFile)
	}

	fmt.Println("ArgoTunnel Ultimate v2.0 – Windows")
	fmt.Println("AI/Quantum Anti-Censorship for Iran")
	fmt.Println("Press Ctrl+C to stop")

	caps := capabilities.SelectOptimal()
	exec := engine.NewExecutor(caps)

	go func() {
		if err := exec.Start(); err != nil {
			log.Fatalf("Engine error: %v", err)
		}
	}()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c
	fmt.Println("ArgoTunnel stopped.")
}
