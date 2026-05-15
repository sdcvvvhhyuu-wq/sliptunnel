import { useGetProfiles, useGetActiveProfile, useSetActiveProfile } from "@workspace/api-client-react";
import { Shield, CheckCircle, Target, Activity } from "lucide-react";

export function Profiles() {
  const { data: profiles, isLoading } = useGetProfiles();
  const { data: activeProfile } = useGetActiveProfile();
  const setActiveMutation = useSetActiveProfile();

  const handleSelect = (id: string) => {
    setActiveMutation.mutate({ data: { id } });
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary uppercase tracking-widest glitch flex items-center gap-3">
          <Shield className="w-8 h-8" />
          AI Morph Profiles
        </h1>
        <p className="text-muted-foreground mt-2">Disguise tunnel traffic as regular application traffic using generative adversarial networks.</p>
      </header>

      {isLoading ? (
        <div className="text-primary animate-pulse font-mono">LOADING PROFILES...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {profiles?.map((profile) => {
            const isActive = activeProfile?.id === profile.id;
            return (
              <div 
                key={profile.id}
                onClick={() => !isActive && handleSelect(profile.id)}
                className={`
                  bg-card border p-5 relative overflow-hidden transition-all duration-300 cursor-pointer group
                  ${isActive 
                    ? 'border-primary shadow-[0_0_20px_rgba(0,255,255,0.15)]' 
                    : 'border-border hover:border-primary/50'}
                `}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> ACTIVE
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className={`text-xl font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {profile.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono uppercase">
                      ID: {profile.id}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6 h-10">
                  {profile.description}
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono uppercase">
                    <span className="text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" /> Bypass Rate</span>
                    <span className={profile.bypassRate > 90 ? 'text-success' : 'text-primary'}>
                      {profile.bypassRate}%
                    </span>
                  </div>
                  <div className="w-full bg-background h-1.5 rounded-none overflow-hidden border border-border">
                    <div 
                      className={`h-full ${profile.bypassRate > 90 ? 'bg-success' : 'bg-primary'}`} 
                      style={{ width: `${profile.bypassRate}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs font-mono uppercase pt-2 border-t border-border border-dashed">
                    <span className="text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3" /> Pattern</span>
                    <span className="text-primary">{profile.trafficPattern}</span>
                  </div>
                </div>
                
                {!isActive && (
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="bg-background/80 border border-primary text-primary px-4 py-2 uppercase tracking-widest text-sm font-bold">
                      ACTIVATE MORPH
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}