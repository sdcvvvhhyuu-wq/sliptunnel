import { useGetDownloads } from "@workspace/api-client-react";
import { DownloadCloud, Terminal, Smartphone, Monitor, HardDrive, Package, ShieldCheck } from "lucide-react";

export function Downloads() {
  const { data: downloads, isLoading } = useGetDownloads();

  const getPlatformIcon = (platform: string) => {
    switch(platform.toLowerCase()) {
      case 'android': return <Smartphone className="w-8 h-8 text-chart-3" />;
      case 'windows': return <Monitor className="w-8 h-8 text-primary" />;
      case 'linux': return <Terminal className="w-8 h-8 text-chart-5" />;
      case 'ios': return <Smartphone className="w-8 h-8 text-muted-foreground" />;
      case 'openwrt': return <HardDrive className="w-8 h-8 text-chart-4" />;
      case 'scanner-cli': return <Terminal className="w-8 h-8 text-success" />;
      default: return <Package className="w-8 h-8 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary uppercase tracking-widest glitch flex items-center gap-3">
          <DownloadCloud className="w-8 h-8" />
          Deployments
        </h1>
        <p className="text-muted-foreground mt-2">Download client applications and auxiliary tools for all platforms.</p>
      </header>

      {isLoading ? (
        <div className="text-primary animate-pulse font-mono">LOADING DEPLOYMENT ARTIFACTS...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {downloads?.map((entry) => (
            <div key={`${entry.platform}-${entry.version}`} className="bg-card border border-border flex flex-col group hover:border-primary/50 transition-colors">
              <div className="p-5 flex items-start gap-4">
                <div className="bg-background p-3 border border-border group-hover:border-primary/30 transition-colors">
                  {getPlatformIcon(entry.platform)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
                      {entry.platform}
                    </h3>
                    <span className="bg-background border border-border px-2 py-0.5 text-xs font-mono text-muted-foreground">
                      v{entry.version}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground font-mono mt-1 mb-2">
                    {entry.filename}
                  </div>
                  <div className="flex gap-4 text-xs uppercase tracking-widest text-muted-foreground">
                    <span>SIZE: {entry.size}</span>
                    {entry.buildDate && <span>BUILD: {entry.buildDate}</span>}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border bg-black/20 p-4 mt-auto">
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground font-mono">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  <span className="truncate">SHA256: {entry.checksum}</span>
                </div>
                <a 
                  href={entry.url}
                  className="block w-full py-2 bg-primary/10 border border-primary/30 text-primary text-center font-bold uppercase tracking-widest text-sm hover:bg-primary/20 hover:border-primary transition-all"
                  download
                >
                  Download Artifact
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}