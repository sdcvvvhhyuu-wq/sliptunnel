package obfs

import "log"

var fragSize int

func EnableFragmentation(size int) {
	fragSize = size
	log.Printf("[Obfs] Fragmentation enabled: %d bytes per fragment", size)
}

func GetFragSize() int {
	return fragSize
}

func FragmentPayload(data []byte) [][]byte {
	if fragSize <= 0 {
		return [][]byte{data}
	}
	var fragments [][]byte
	for len(data) > 0 {
		end := fragSize
		if end > len(data) {
			end = len(data)
		}
		fragments = append(fragments, data[:end])
		data = data[end:]
	}
	return fragments
}
