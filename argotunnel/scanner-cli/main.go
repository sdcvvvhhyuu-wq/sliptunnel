package main

import (
	"flag"
	"fmt"
	"net"
	"os"
	"strconv"
	"sync"
	"time"
)

type ScanResult struct {
	IP      net.IP
	Port    int
	Latency time.Duration
}

func main() {
	cidr    := flag.String("cidr", "104.16.0.0/12", "CIDR range to scan")
	port    := flag.Int("port", 443, "TCP port to probe")
	timeout := flag.Duration("timeout", 2*time.Second, "connection timeout")
	workers := flag.Int("workers", 50, "concurrent scan workers")
	output  := flag.String("output", "", "output file (default: stdout)")
	count   := flag.Int("count", 0, "max results (0=unlimited)")
	verbose := flag.Bool("v", false, "verbose output")
	flag.Parse()

	_, ipnet, err := net.ParseCIDR(*cidr)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Invalid CIDR: %v\n", err)
		os.Exit(1)
	}

	var out *os.File
	if *output != "" {
		out, err = os.Create(*output)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Cannot create output file: %v\n", err)
			os.Exit(1)
		}
		defer out.Close()
	} else {
		out = os.Stdout
	}

	fmt.Fprintf(os.Stderr, "ArgScan v2.0 – Scanning %s port %d\n", *cidr, *port)

	ipCh  := make(chan net.IP, *workers*2)
	resCh := make(chan ScanResult, *workers)
	var wg sync.WaitGroup

	for i := 0; i < *workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for ip := range ipCh {
				if result, ok := probe(ip, *port, *timeout); ok {
					resCh <- result
				}
			}
		}()
	}

	go func() {
		for ip := ipnet.IP.Mask(ipnet.Mask); ipnet.Contains(ip); inc(ip) {
			ipCopy := make(net.IP, len(ip))
			copy(ipCopy, ip)
			ipCh <- ipCopy
		}
		close(ipCh)
		wg.Wait()
		close(resCh)
	}()

	found := 0
	for res := range resCh {
		if *count > 0 && found >= *count {
			break
		}
		line := res.IP.String()
		if *verbose {
			line = fmt.Sprintf("%s\t%dms", res.IP.String(), res.Latency.Milliseconds())
		}
		fmt.Fprintln(out, line)
		if out != os.Stdout {
			fmt.Fprintf(os.Stderr, "✅ %s\n", line)
		}
		found++
	}

	fmt.Fprintf(os.Stderr, "\nScan complete. Found %d clean IPs.\n", found)
}

func probe(ip net.IP, port int, timeout time.Duration) (ScanResult, bool) {
	addr  := net.JoinHostPort(ip.String(), strconv.Itoa(port))
	start := time.Now()
	conn, err := net.DialTimeout("tcp", addr, timeout)
	if err != nil {
		return ScanResult{}, false
	}
	lat := time.Since(start)
	conn.Close()
	return ScanResult{IP: ip, Port: port, Latency: lat}, true
}

func inc(ip net.IP) {
	for j := len(ip) - 1; j >= 0; j-- {
		ip[j]++
		if ip[j] > 0 {
			break
		}
	}
}
