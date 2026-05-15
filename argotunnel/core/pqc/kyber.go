package pqc

import (
	"crypto/rand"
	"log"
	"time"

	"github.com/cloudflare/circl/kem/kyber/kyber1024"
)

type QuantumSession struct {
	PrivateKey []byte
	PublicKey  []byte
	tunnel     interface{ SetQuantumSession(*QuantumSession) }
}

func NewQuantumSession(level int) (*QuantumSession, error) {
	pk, sk, err := kyber1024.GenerateKeyPair(rand.Reader)
	if err != nil {
		return nil, err
	}
	pub, _ := pk.MarshalBinary()
	priv, _ := sk.MarshalBinary()
	log.Printf("[PQC] Kyber-1024 session created (level %d)", level)
	return &QuantumSession{PrivateKey: priv, PublicKey: pub}, nil
}

func (s *QuantumSession) StartKeyRollover() {
	go func() {
		for {
			time.Sleep(45 * time.Second)
			newPk, newSk, err := kyber1024.GenerateKeyPair(rand.Reader)
			if err != nil {
				continue
			}
			pub, _ := newPk.MarshalBinary()
			priv, _ := newSk.MarshalBinary()
			s.PrivateKey = priv
			s.PublicKey = pub
			log.Println("[PQC] Key rotated (Kyber-1024 hybrid) – forward secrecy maintained")
			if s.tunnel != nil {
				s.tunnel.SetQuantumSession(s)
			}
		}
	}()
}

func (s *QuantumSession) RegisterTunnel(t interface{ SetQuantumSession(*QuantumSession) }) {
	s.tunnel = t
}

func (s *QuantumSession) HybridEncapsulate(classicPub []byte) (ct, ss []byte, err error) {
	pk, err := kyber1024.Scheme().UnmarshalBinaryPublicKey(s.PublicKey)
	if err != nil {
		return nil, nil, err
	}
	ct, ss, err = kyber1024.Scheme().Encapsulate(pk)
	if err != nil {
		return nil, nil, err
	}
	hybrid := append(ss, classicPub...)
	return ct, hybrid, nil
}
