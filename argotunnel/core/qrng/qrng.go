package qrng

import (
	"crypto/rand"
	"encoding/binary"
	"math/big"
)

func RandInt(max int) int {
	n, _ := rand.Int(rand.Reader, big.NewInt(int64(max)))
	return int(n.Int64())
}

func RandFloat() float64 {
	var b [8]byte
	rand.Read(b[:])
	return float64(binary.LittleEndian.Uint64(b[:])) / (1 << 64)
}

func RandBytes(n int) []byte {
	b := make([]byte, n)
	rand.Read(b)
	return b
}

func RandBool() bool {
	b := make([]byte, 1)
	rand.Read(b)
	return b[0]&1 == 1
}
