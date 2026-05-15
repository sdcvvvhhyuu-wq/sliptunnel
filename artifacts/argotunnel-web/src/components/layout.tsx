import { Link, useLocation } from "wouter";
import { 
  Shield, 
  Activity, 
  Cpu, 
  Radar, 
  DownloadCloud, 
  Info,
  Menu,
  X,
  Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { useHealthCheck } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Set dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const { data: health } = useHealthCheck({ query: { refetchInterval: 5000 } });

  const navItems = [
    { href: "/", label: "OPS DASHBOARD", icon: Activity },
    { href: "/profiles", label: "AI MORPH", icon: Shield },
    { href: "/algorithms", label: "DPI EVASION", icon: Cpu },
    { href: "/browser-proxy", label: "BROWSER PROXY", icon: Globe },
    { href: "/scanner", label: "IP SCANNER", icon: Radar },
    { href: "/downloads", label: "DEPLOYMENTS", icon: DownloadCloud },
    { href: "/about", label: "SYS SPECS", icon: Info },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden font-mono">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded border border-primary">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold tracking-widest text-primary glitch text-lg">ARGOTUNNEL</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-primary hover:bg-primary/10 rounded"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        ${isMobileMenuOpen ? "fixed inset-0 z-50 bg-background/95 backdrop-blur flex flex-col" : "hidden"} 
        md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-card/50 md:backdrop-blur
      `}>
        <div className="hidden md:flex items-center gap-3 p-6 border-b border-border">
          <div className="w-10 h-10 bg-primary/20 flex items-center justify-center rounded border border-primary">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="font-bold tracking-widest text-primary text-xl">ARGO</div>
            <div className="text-[10px] tracking-widest text-muted-foreground uppercase">Ultimate Ops</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded text-sm transition-all duration-200 uppercase tracking-widest
                  ${isActive 
                    ? "bg-primary/20 text-primary border border-primary shadow-[0_0_15px_rgba(0,255,255,0.2)]" 
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary border border-transparent"}
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border bg-black/40">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-success animate-pulse shadow-[0_0_8px_rgba(0,255,0,0.8)]' : 'bg-destructive'}`}></div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              {health?.status === 'ok' ? 'System Online' : 'System Offline'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative h-[calc(100vh-73px)] md:h-screen">
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
               backgroundSize: '40px 40px',
               backgroundPosition: 'center center'
             }}>
        </div>
        <div className="p-4 md:p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}