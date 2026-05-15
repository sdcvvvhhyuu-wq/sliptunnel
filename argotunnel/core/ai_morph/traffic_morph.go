package ai_morph

import (
	"log"
	"math/rand"
	"sync"
	"time"
)

type Profile struct {
	pattern []int
	jitter  time.Duration
	name    string
}

var (
	profiles = map[string]Profile{
		"chrome_124":   {[]int{120, 1400, 40, 800, 100, 300, 1200}, 20 * time.Millisecond, "Google Chrome 124"},
		"firefox_125":  {[]int{100, 1500, 50, 700, 200, 400, 900}, 25 * time.Millisecond, "Mozilla Firefox 125"},
		"safari_17":    {[]int{90, 1300, 60, 750, 150, 350, 1100}, 15 * time.Millisecond, "Safari 17"},
		"twitch":       {[]int{1200, 1200, 1200, 1200, 1200, 1200}, 5 * time.Millisecond, "Twitch Stream"},
		"zoom_voip":    {[]int{160, 160, 320, 160, 480, 160, 160}, 30 * time.Millisecond, "Zoom VoIP"},
		"netflix":      {[]int{1400, 1400, 1400, 800, 1400, 1400}, 3 * time.Millisecond, "Netflix Stream"},
		"telegram":     {[]int{64, 256, 512, 128, 64, 1024, 256}, 10 * time.Millisecond, "Telegram"},
		"youtube":      {[]int{1400, 1400, 1350, 1400, 1200, 1400}, 2 * time.Millisecond, "YouTube"},
		"instagram":    {[]int{400, 800, 200, 1400, 600, 300}, 18 * time.Millisecond, "Instagram"},
		"http2_generic": {[]int{100, 200, 50, 1400, 100, 800}, 22 * time.Millisecond, "HTTP/2 Generic"},
	}
	activeProfile = "chrome_124"
	mu            sync.RWMutex
)

func SetActiveProfile(name string) {
	mu.Lock()
	defer mu.Unlock()
	if _, ok := profiles[name]; ok {
		activeProfile = name
		log.Printf("[AI Morph] Profile switched → %s (%s)", name, profiles[name].name)
	}
}

func GetActiveProfile() string {
	mu.RLock()
	defer mu.RUnlock()
	return activeProfile
}

func GetAllProfiles() []string {
	keys := make([]string, 0, len(profiles))
	for k := range profiles {
		keys = append(keys, k)
	}
	return keys
}

func EnableTrafficMorphing() {
	log.Printf("[AI Morph] Traffic morphing activated with %d behavioral profiles", len(profiles))
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		profileList := GetAllProfiles()
		for range ticker.C {
			selected := profileList[rand.Intn(len(profileList))]
			SetActiveProfile(selected)
		}
	}()
	go func() {
		for {
			mu.RLock()
			p := profiles[activeProfile]
			mu.RUnlock()
			for _, size := range p.pattern {
				jitter := p.jitter + time.Duration(rand.Intn(15))*time.Millisecond
				_ = size
				time.Sleep(jitter)
			}
		}
	}()
}
