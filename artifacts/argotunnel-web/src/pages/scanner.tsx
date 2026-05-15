import { useGetScannerResults, useStartScanner } from "@workspace/api-client-react";
import { Radar, Play, MapPin, Activity, Server } from "lucide-react";
import { useState, useEffect } from "react";

export function Scanner() {
  const { data: results, refetch } = useGetScannerResults();
  const startScanner = useStartScanner();
  const [isScanning, setIsScanning] = useState(false);

  // Poll for results if scanning
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning || results?.scanning) {
      interval = setInterval(() => {
        refetch();
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, results?.scanning, refetch]);

  // Sync internal state with API state
  useEffect(() => {
    if (results) {
      setIsScanning(results.scanning);
    }
  }, [results]);

  const handleStartScan = () => {
    startScanner.mutate(undefined, {
      onSuccess: () => {
        setIsScanning(true);
        refetch();
      }
    });
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return "text-success";
    if (latency < 200) return "text-chart-5";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary uppercase tracking-widest glitch flex items-center gap-3">
            <Radar className="w-8 h-8" />
            Clean IP Scanner
          </h1>
          <p className="text-muted-foreground mt-2">Discover unblocked Cloudflare/CDN edge nodes with lowest latency.</p>
        </div>
        
        <button
          onClick={handleStartScan}
          disabled={isScanning}
          className={`
            px-6 py-3 border flex items-center gap-2 uppercase tracking-widest font-bold transition-all
            ${isScanning 
              ? 'bg-primary/10 border-primary text-primary/50 cursor-not-allowed' 
              : 'bg-primary/20 border-primary text-primary hover:bg-primary/30 shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]'}
          `}
        >
          {isScanning ? (
            <>
              <Radar className="w-5 h-5 animate-spin-slow" />
              Scanning...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Scan
            </>
          )}
        </button>
      </header>

      {isScanning && (
        <div className="bg-card border border-primary p-6 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
          <div className="flex justify-between text-xs uppercase tracking-widest text-primary mb-2">
            <span>Scanning IP Ranges...</span>
            <span className="font-mono">{results?.totalScanned || 0} IPs Checked</span>
          </div>
          <div className="w-full bg-background h-1.5 overflow-hidden border border-primary/30">
            <div className="h-full bg-primary w-full animate-[progress-indeterminate_2s_ease-in-out_infinite] origin-left" />
          </div>
        </div>
      )}

      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border bg-black/20 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Discovered Edge Nodes</h3>
          {results?.lastUpdated && (
            <span className="text-xs font-mono text-muted-foreground">
              Last updated: {new Date(results.lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                <th className="p-4 font-normal">IP Address</th>
                <th className="p-4 font-normal">Latency</th>
                <th className="p-4 font-normal">Location</th>
                <th className="p-4 font-normal">CDN Provider</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {results?.cleanIPs?.length === 0 && !isScanning ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground uppercase tracking-widest">
                    No clean IPs found. Run a scan to discover edge nodes.
                  </td>
                </tr>
              ) : null}
              
              {results?.cleanIPs?.map((ip, idx) => (
                <tr key={`${ip.ip}-${idx}`} className="border-b border-border hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-foreground font-bold group-hover:text-primary transition-colors">
                    {ip.ip}
                  </td>
                  <td className={`p-4 ${getLatencyColor(ip.latency)}`}>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 opacity-50" />
                      {ip.latency} ms
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 opacity-50" />
                      {ip.location}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 opacity-50" />
                      {ip.cdn}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}