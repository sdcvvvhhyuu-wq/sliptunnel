import { useListAlgorithms, useGetCurrentAlgorithm } from "@workspace/api-client-react";
import { Cpu, RotateCw, CheckCircle2, AlertTriangle } from "lucide-react";

export function Algorithms() {
  const { data: algorithms, isLoading } = useListAlgorithms();
  const { data: currentAlg } = useGetCurrentAlgorithm({ query: { refetchInterval: 1000 } });

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary uppercase tracking-widest glitch flex items-center gap-3">
            <Cpu className="w-8 h-8" />
            DPI Evasion Algorithms
          </h1>
          <p className="text-muted-foreground mt-2">Dynamic fragmentation and obfuscation techniques to bypass Deep Packet Inspection.</p>
        </div>
        
        <div className="bg-card border border-primary/30 px-6 py-4 flex items-center gap-6 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
          <div className="flex items-center gap-3">
            <RotateCw className="w-5 h-5 text-primary animate-spin-slow" style={{ animationDuration: '3s' }} />
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Auto-Rotation In</div>
              <div className="text-xl font-bold text-primary font-mono">{currentAlg?.nextRotation || 0}s</div>
            </div>
          </div>
          <div className="h-10 w-px bg-border"></div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Active Evasion</div>
            <div className="text-lg font-bold text-foreground truncate max-w-[150px]">{currentAlg?.name || 'STANDBY'}</div>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="text-primary animate-pulse font-mono">LOADING ALGORITHMS...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {algorithms?.map((alg) => {
            const isActive = currentAlg?.name === alg.name;
            return (
              <div 
                key={alg.id}
                className={`
                  bg-card border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all
                  ${isActive 
                    ? 'border-primary shadow-[inset_4px_0_0_0_rgba(0,255,255,1),0_0_15px_rgba(0,255,255,0.1)]' 
                    : 'border-border opacity-70 hover:opacity-100'}
                `}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`text-lg font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {alg.name}
                    </div>
                    {isActive && (
                      <span className="bg-primary/20 text-primary border border-primary/50 px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> LIVE
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {alg.description}
                  </div>
                </div>

                <div className="bg-background border border-border p-3 min-w-[250px]">
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Technique</div>
                  <div className="text-sm font-mono text-primary/80">
                    {alg.technique}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-8 bg-destructive/10 border border-destructive/30 p-4 flex gap-4">
        <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
        <div className="text-sm text-destructive-foreground">
          <strong>WARNING:</strong> Manual algorithm selection is disabled while Dynamic Orchestra (Auto-Rotation) is active. The system will automatically select the optimal fragmentation strategy based on real-time DPI behavior analysis.
        </div>
      </div>
    </div>
  );
}