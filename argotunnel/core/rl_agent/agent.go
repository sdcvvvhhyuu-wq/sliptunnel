package rl_agent

import (
	"log"
	"math"
	"math/rand"
	"sync"
	"time"
)

type State struct {
	PacketLoss float32
	Latency    int
	DPIDetect  bool
}

type QTable map[string]map[string]float64

var (
	bestProfile = "chrome_124"
	qTable      = make(QTable)
	mu          sync.RWMutex
	epsilon     = 0.3
	learningRate = 0.1
	discount    = 0.9
	episodes    = 0
)

var allProfiles = []string{
	"chrome_124", "firefox_125", "safari_17", "twitch",
	"zoom_voip", "netflix", "telegram", "youtube",
	"instagram", "http2_generic",
}

func init() {
	for _, s := range []string{"high_loss", "low_loss", "dpi_active", "stable"} {
		qTable[s] = make(map[string]float64)
		for _, a := range allProfiles {
			qTable[s][a] = rand.Float64()
		}
	}
}

func getState(loss float32, latency int, dpi bool) string {
	if dpi {
		return "dpi_active"
	}
	if loss > 0.2 {
		return "high_loss"
	}
	if loss < 0.05 && latency < 100 {
		return "stable"
	}
	return "low_loss"
}

func selectAction(state string) string {
	if rand.Float64() < epsilon {
		return allProfiles[rand.Intn(len(allProfiles))]
	}
	best := ""
	bestVal := math.Inf(-1)
	for action, val := range qTable[state] {
		if val > bestVal {
			bestVal = val
			best = action
		}
	}
	if best == "" {
		return allProfiles[0]
	}
	return best
}

func updateQ(state, action string, reward float64, nextState string) {
	mu.Lock()
	defer mu.Unlock()
	currentQ := qTable[state][action]
	maxNextQ := math.Inf(-1)
	for _, v := range qTable[nextState] {
		if v > maxNextQ {
			maxNextQ = v
		}
	}
	if math.IsInf(maxNextQ, -1) {
		maxNextQ = 0
	}
	qTable[state][action] = currentQ + learningRate*(reward+discount*maxNextQ-currentQ)
}

func StartLearning() {
	log.Println("[RL Agent] Reinforcement learning agent started (Q-Learning)")
	go func() {
		ticker := time.NewTicker(15 * time.Second)
		defer ticker.Stop()
		prevState := "stable"
		prevAction := bestProfile
		for range ticker.C {
			loss := rand.Float32()
			latency := rand.Intn(500)
			dpi := rand.Float32() < 0.1
			currentState := getState(loss, latency, dpi)
			reward := 1.0
			if loss > 0.2 {
				reward -= float64(loss) * 2
			}
			if latency > 200 {
				reward -= float64(latency) / 500
			}
			if dpi {
				reward -= 2.0
			}
			updateQ(prevState, prevAction, reward, currentState)
			action := selectAction(currentState)
			mu.Lock()
			bestProfile = action
			episodes++
			if epsilon > 0.05 {
				epsilon *= 0.995
			}
			mu.Unlock()
			log.Printf("[RL Agent] Episode %d | state=%s action=%s reward=%.2f ε=%.3f",
				episodes, currentState, action, reward, epsilon)
			prevState = currentState
			prevAction = action
		}
	}()
}

func GetRecommendedProfile() string {
	mu.RLock()
	defer mu.RUnlock()
	return bestProfile
}
