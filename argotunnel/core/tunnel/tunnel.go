package tunnel

import "github.com/sdcvvvhhyuu-wq/argotunnel/pqc"

type Tunnel interface {
	Start() error
	SetQuantumSession(*pqc.QuantumSession)
}
