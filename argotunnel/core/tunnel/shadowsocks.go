package tunnel

import (
	"encoding/binary"
	"fmt"
	"io"
	"log"
	"net"
	"strconv"

	"github.com/sdcvvvhhyuu-wq/argotunnel/pqc"
)

type ShadowsocksTunnel struct {
	quantum  *pqc.QuantumSession
	listener net.Listener
	addr     string
}

func NewShadowsocksTunnel() *ShadowsocksTunnel {
	return &ShadowsocksTunnel{addr: ":1080"}
}

func (s *ShadowsocksTunnel) Start() error {
	ln, err := net.Listen("tcp", s.addr)
	if err != nil {
		log.Printf("[Shadowsocks] SOCKS5 listen failed on %s: %v", s.addr, err)
		return err
	}
	s.listener = ln
	go func() {
		log.Printf("[Shadowsocks] SOCKS5 proxy running on %s", s.addr)
		for {
			conn, err := ln.Accept()
			if err != nil {
				return
			}
			go s.handleConn(conn)
		}
	}()
	return nil
}

func (s *ShadowsocksTunnel) handleConn(conn net.Conn) {
	defer conn.Close()

	buf := make([]byte, 2)
	if _, err := io.ReadFull(conn, buf); err != nil {
		return
	}
	if buf[0] != 0x05 {
		return
	}
	nMethods := int(buf[1])
	methods := make([]byte, nMethods)
	if _, err := io.ReadFull(conn, methods); err != nil {
		return
	}
	conn.Write([]byte{0x05, 0x00})

	header := make([]byte, 4)
	if _, err := io.ReadFull(conn, header); err != nil {
		return
	}
	if header[0] != 0x05 || header[1] != 0x01 {
		return
	}

	var host string
	var port int

	switch header[3] {
	case 0x01:
		addr := make([]byte, 4)
		if _, err := io.ReadFull(conn, addr); err != nil {
			return
		}
		host = net.IP(addr).String()
	case 0x03:
		lenBuf := make([]byte, 1)
		if _, err := io.ReadFull(conn, lenBuf); err != nil {
			return
		}
		domainBuf := make([]byte, lenBuf[0])
		if _, err := io.ReadFull(conn, domainBuf); err != nil {
			return
		}
		host = string(domainBuf)
	case 0x04:
		addr := make([]byte, 16)
		if _, err := io.ReadFull(conn, addr); err != nil {
			return
		}
		host = net.IP(addr).String()
	default:
		return
	}

	portBuf := make([]byte, 2)
	if _, err := io.ReadFull(conn, portBuf); err != nil {
		return
	}
	port = int(binary.BigEndian.Uint16(portBuf))

	target := net.JoinHostPort(host, strconv.Itoa(port))
	remote, err := net.Dial("tcp", target)
	if err != nil {
		conn.Write([]byte{0x05, 0x05, 0x00, 0x01, 0, 0, 0, 0, 0, 0})
		return
	}
	defer remote.Close()

	localAddr := remote.LocalAddr().(*net.TCPAddr)
	ip4 := localAddr.IP.To4()
	if ip4 == nil {
		ip4 = net.IP{0, 0, 0, 0}
	}
	resp := []byte{0x05, 0x00, 0x00, 0x01,
		ip4[0], ip4[1], ip4[2], ip4[3],
		byte(localAddr.Port >> 8), byte(localAddr.Port & 0xff),
	}
	conn.Write(resp)

	go io.Copy(remote, conn)
	io.Copy(conn, remote)

	log.Printf("[Shadowsocks] → %s", target)
	_ = fmt.Sprintf("")
}

func (s *ShadowsocksTunnel) SetQuantumSession(sess *pqc.QuantumSession) {
	s.quantum = sess
	log.Println("[Shadowsocks] Quantum session registered")
}
