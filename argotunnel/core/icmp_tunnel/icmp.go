package icmp_tunnel

import (
	"log"
	"net"

	"golang.org/x/net/icmp"
	"golang.org/x/net/ipv4"
)

type ICMPTunnel struct {
	conn *icmp.PacketConn
}

func NewICMPTunnel() *ICMPTunnel {
	conn, err := icmp.ListenPacket("ip4:icmp", "0.0.0.0")
	if err != nil {
		log.Printf("[ICMP Tunnel] Listen failed (requires root/admin): %v", err)
		return &ICMPTunnel{}
	}
	return &ICMPTunnel{conn: conn}
}

func (t *ICMPTunnel) Start() {
	if t.conn == nil {
		log.Println("[ICMP Tunnel] Not started (no connection)")
		return
	}
	go func() {
		log.Println("[ICMP Tunnel] Covert ICMP tunnel started")
		buf := make([]byte, 1500)
		for {
			n, peer, err := t.conn.ReadFrom(buf)
			if err != nil {
				continue
			}
			msg, err := icmp.ParseMessage(1, buf[:n])
			if err != nil {
				continue
			}
			if msg.Type == ipv4.ICMPTypeEcho {
				reply := icmp.Message{
					Type: ipv4.ICMPTypeEchoReply,
					Code: 0,
					Body: msg.Body,
				}
				b, _ := reply.Marshal(nil)
				t.conn.WriteTo(b, peer)
			}
		}
	}()
}

func (t *ICMPTunnel) SendData(dest net.IP, data []byte) error {
	if t.conn == nil {
		return nil
	}
	msg := icmp.Message{
		Type: ipv4.ICMPTypeEcho,
		Code: 0,
		Body: &icmp.Echo{
			ID:   0x4172,
			Seq:  1,
			Data: data,
		},
	}
	b, err := msg.Marshal(nil)
	if err != nil {
		return err
	}
	_, err = t.conn.WriteTo(b, &net.IPAddr{IP: dest})
	return err
}
