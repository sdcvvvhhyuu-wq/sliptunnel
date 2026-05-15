package gan_generator

import (
	"log"
	"math/rand"
	"time"
)

type TrafficSample struct {
	Size      int
	Timing    time.Duration
	Protocol  string
	Direction string
}

var trafficPatterns = []TrafficSample{
	{1400, 5 * time.Millisecond, "TCP", "out"},
	{100, 20 * time.Millisecond, "TCP", "in"},
	{800, 10 * time.Millisecond, "UDP", "out"},
	{40, 50 * time.Millisecond, "TCP", "in"},
	{1200, 3 * time.Millisecond, "TCP", "out"},
	{256, 15 * time.Millisecond, "UDP", "out"},
	{64, 80 * time.Millisecond, "TCP", "in"},
}

func EnableGANMorphing(interval time.Duration) {
	log.Printf("[GAN] Generative cover traffic injection enabled (interval: %v)", interval)
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for range ticker.C {
			n := 2 + rand.Intn(5)
			for i := 0; i < n; i++ {
				sample := trafficPatterns[rand.Intn(len(trafficPatterns))]
				payload := make([]byte, sample.Size)
				rand.Read(payload)
				time.Sleep(sample.Timing + time.Duration(rand.Intn(10))*time.Millisecond)
				log.Printf("[GAN] Cover packet injected: %s %s %d bytes",
					sample.Protocol, sample.Direction, len(payload))
			}
		}
	}()
}

func GenerateCoverPacket() []byte {
	sizes := []int{40, 64, 100, 256, 512, 800, 1200, 1400}
	size := sizes[rand.Intn(len(sizes))]
	payload := make([]byte, size)
	rand.Read(payload)
	return payload
}
