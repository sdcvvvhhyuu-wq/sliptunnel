import { 
  useGetTunnelStatus, 
  useGetStats, 
  useGetStatsHistory, 
  useGetCurrentAlgorithm,
  useConnectTunnel,
  useDisconnectTunnel,
  useGetActiveProfile
} from "@workspace/api-client-react";
import { Shield, Activity, Wifi, Lock, Zap, Power, Server, Cpu } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

export function Dashboard() {
  const { data: status } = useGetTunnelStatus({ query: { refetchInterval: 2000 } });
  const { data: stats } = useGetStats({ query: { refetchInterval: 1000 } });
  const { data: history } = useGetStatsHistory({ query: { refetchInterval: 2000 } });
  const { data: algorithm } = useGetCurrentAlgorithm({ query: { refetchInterval: 1000 } });
  const { data: profile } = useGetActiveProfile();

  const connectMutation = useConnectTunnel();
  const disconnectMutation = useDisconnectTunnel();

  const isConnected = status?.connected;

  const handleToggle = () => {
    if (isConnected) {
      disconnectMutation.mutate();
    } else {
      connectMutation.mutate({ data: {} });
    }
  };

  const formatBytes = (bytes = 0) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (speed = 0) => `${formatBytes(speed)}/s`;

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary uppercase tracking-widest glitch">Ops Dashboard</h1>
        <p className="text-muted-foreground mt-2">Real-time deep packet inspection evasion & traffic routing.</p>
      </header>

      {/* Primary Actions & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-card border border-border p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <div className="flex flex-col items-center justify-center h-full space-y-6 relative z-10">
            <button
              onClick={handleToggle}
              disabled={connectMutation.isPending || disconnectMutation.isPending}
              className={`
                w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500
                ${isConnected 
                  ? 'bg-success/20 border-2 border-success text-success shadow-[0_0_30px_rgba(0,255,0,0.3)] hover:bg-success/30 hover:shadow-[0_0_50px_rgba(0,255,0,0.5)]' 
                  : 'bg-destructive/20 border-2 border-destructive text-destructive shadow-[0_0_30px_rgba(255,0,0,0.3)] hover:bg-destructive/30 hover:shadow-[0_0_50px_rgba(255,0,0,0.5)]'}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <Power className={`w-12 h-12 ${isConnected ? 'animate-pulse' : ''}`} />
            </button>

            <div className="text-center">
              <div className="text-2xl font-bold uppercase tracking-widest mb-1">
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {status?.protocol || 'NO PROTOCOL'} | UPTIME: {status?.uptime || 0}s
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-card border border-border p-5 flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 p-3 opacity-20"><Shield className="w-12 h-12" /></div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Active Morph Profile
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{profile?.name || 'N/A'}</div>
              <div className="text-sm text-muted-foreground mt-1">{profile?.description || 'Loading profile data...'}</div>
            </div>
          </div>

          <div className="bg-card border border-border p-5 flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 p-3 opacity-20"><Cpu className="w-12 h-12" /></div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              DPI Rotation Algorithm
            </div>
            <div>
              <div className="text-2xl font-bold text-primary truncate" title={algorithm?.name}>{algorithm?.name || 'STANDBY'}</div>
              <div className="text-sm text-primary/70 mt-1 flex items-center justify-between">
                <span>Rotating in: {algorithm?.nextRotation || 0}s</span>
                <span className="bg-primary/20 px-2 py-0.5 rounded text-xs">IDX: {algorithm?.index}/{algorithm?.total}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-5 flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 p-3 opacity-20"><Lock className="w-12 h-12" /></div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Quantum Protection
            </div>
            <div>
              <div className={`text-2xl font-bold ${status?.pqcEnabled ? 'text-success' : 'text-muted-foreground'}`}>
                {status?.pqcEnabled ? 'KYBER-1024 ACTIVE' : 'DISABLED'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Post-Quantum Cryptography</div>
            </div>
          </div>

          <div className="bg-card border border-border p-5 flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 p-3 opacity-20"><Wifi className="w-12 h-12" /></div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Network Ping
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{status?.ping || 0} ms</div>
              <div className="text-sm text-muted-foreground mt-1">Latency to edge node</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bandwidth Graph */}
      <div className="bg-card border border-border p-6 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-3">
            <Activity className="text-primary w-5 h-5" />
            Telemetry Stream
          </h2>
          <div className="flex gap-6">
            <div className="flex flex-col items-end">
              <div className="text-xs text-success uppercase tracking-widest mb-1">RX Rate</div>
              <div className="text-lg font-bold text-success font-mono">{formatSpeed(stats?.speedIn)}</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xs text-primary uppercase tracking-widest mb-1">TX Rate</div>
              <div className="text-lg font-bold text-primary font-mono">{formatSpeed(stats?.speedOut)}</div>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history || []} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(150 100% 50%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(150 100% 50%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(180 100% 50%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(180 100% 50%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis 
                tickFormatter={(tick) => formatBytes(tick)} 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 0, fontFamily: 'monospace' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                labelStyle={{ display: 'none' }}
                formatter={(value: number, name: string) => [formatSpeed(value), name === 'speedIn' ? 'RX' : 'TX']}
              />
              <Area type="monotone" dataKey="speedIn" stroke="hsl(150 100% 50%)" fillOpacity={1} fill="url(#colorIn)" isAnimationActive={false} />
              <Area type="monotone" dataKey="speedOut" stroke="hsl(180 100% 50%)" fillOpacity={1} fill="url(#colorOut)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}