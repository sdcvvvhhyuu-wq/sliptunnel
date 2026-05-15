package capabilities

import (
	"math/rand"
	"strings"
)

type CapabilitySet struct {
	ActiveIDs        []int
	FragSize         int
	UseUTLS          bool
	UTLSProfile      string
	PQCLevel         int
	Transport        string
	AIMorphEnabled   bool
	UseDNSTunnel     bool
	UseICMPTunnel    bool
	UseQRNG          bool
	DPIAdaptive      bool
	UsePsiphon       bool
	PsiphonFallback  bool
}

func SelectOptimal() CapabilitySet {
	all := GetAllCapabilities()
	set := CapabilitySet{}
	for _, c := range all {
		if rand.Float32() < 0.1 {
			set.ActiveIDs = append(set.ActiveIDs, c.ID)
			switch c.Category {
			case "frag":
				if s := ParseParamInt(c.Param, "size="); s > 0 {
					set.FragSize = s
				}
			case "tls":
				if strings.HasPrefix(c.Name, "utls_") {
					set.UseUTLS = true
					set.UTLSProfile = c.Param
				}
			case "pqc":
				if l := ParseParamInt(c.Param, "level="); l > 0 {
					set.PQCLevel = l
				}
			case "transport":
				set.Transport = c.Param
				if c.Param == "psiphon" {
					set.UsePsiphon = true
				}
			case "ai_evasion":
				set.AIMorphEnabled = true
			case "dns":
				set.UseDNSTunnel = true
			case "icmp":
				set.UseICMPTunnel = true
			case "qrng":
				set.UseQRNG = true
			case "dpi_analyzer":
				set.DPIAdaptive = true
			}
		}
	}
	if set.FragSize == 0 {
		set.FragSize = 150
	}
	if set.PQCLevel == 0 {
		set.PQCLevel = 2
	}
	if set.Transport == "" {
		set.Transport = "wireguard"
	}
	set.PsiphonFallback = true
	set.DPIAdaptive = true
	set.AIMorphEnabled = true
	return set
}
