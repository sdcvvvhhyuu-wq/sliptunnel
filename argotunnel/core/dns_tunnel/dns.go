package dns_tunnel

import (
	"encoding/base64"
	"log"
	"strings"

	"github.com/miekg/dns"
	"github.com/sdcvvvhhyuu-wq/argotunnel/pqc"
)

type DNSTunnel struct {
	domain string
	qs     *pqc.QuantumSession
}

func NewDNSTunnel(domain string, qs *pqc.QuantumSession) *DNSTunnel {
	return &DNSTunnel{domain: domain, qs: qs}
}

func (t *DNSTunnel) Start() {
	dns.HandleFunc(".", t.handleDNS)
	go func() {
		server := &dns.Server{Addr: ":5353", Net: "udp"}
		log.Printf("[DNS Tunnel] Covert DNS tunnel listening on :5353 (domain: %s)", t.domain)
		if err := server.ListenAndServe(); err != nil {
			log.Printf("[DNS Tunnel] Error: %v", err)
		}
	}()
	go func() {
		tcpServer := &dns.Server{Addr: ":5353", Net: "tcp"}
		if err := tcpServer.ListenAndServe(); err != nil {
			log.Printf("[DNS Tunnel] TCP Error: %v", err)
		}
	}()
}

func (t *DNSTunnel) handleDNS(w dns.ResponseWriter, r *dns.Msg) {
	if len(r.Question) == 0 {
		return
	}
	q := r.Question[0]
	qname := strings.ToLower(q.Name)

	if strings.HasSuffix(qname, "."+t.domain+".") {
		data := strings.TrimSuffix(qname, "."+t.domain+".")
		decoded, err := base64.RawURLEncoding.DecodeString(strings.ReplaceAll(data, ".", ""))
		if err == nil {
			log.Printf("[DNS Tunnel] Data received: %d bytes", len(decoded))
		}
	}

	msg := new(dns.Msg)
	msg.SetReply(r)
	msg.Authoritative = true

	switch q.Qtype {
	case dns.TypeA:
		rr, _ := dns.NewRR(q.Name + " 1 IN A 1.1.1.1")
		msg.Answer = append(msg.Answer, rr)
	case dns.TypeAAAA:
		rr, _ := dns.NewRR(q.Name + " 1 IN AAAA ::1")
		msg.Answer = append(msg.Answer, rr)
	case dns.TypeTXT:
		rr, _ := dns.NewRR(q.Name + ` 1 IN TXT "v=ArgoTunnel"`)
		msg.Answer = append(msg.Answer, rr)
	}
	w.WriteMsg(msg)
}
