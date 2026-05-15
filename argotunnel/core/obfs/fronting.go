package obfs

import (
	"log"
	"sync"
)

var (
	currentFrontingHost string
	frontingMu          sync.RWMutex
)

func SetFrontingHost(host string) {
	frontingMu.Lock()
	defer frontingMu.Unlock()
	currentFrontingHost = host
	log.Printf("[Domain Fronting] Host set to: %s", host)
}

func GetFrontingHost() string {
	frontingMu.RLock()
	defer frontingMu.RUnlock()
	return currentFrontingHost
}
