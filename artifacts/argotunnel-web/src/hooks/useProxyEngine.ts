import { useEffect, useState, useCallback } from "react";
import { proxyEngine, type ProxyState } from "@/lib/proxy-engine";

let engineInitialized = false;
const initPromise = typeof window !== "undefined"
  ? proxyEngine.init().then((ok) => { engineInitialized = ok; })
  : Promise.resolve();

export function useProxyEngine() {
  const [state, setState] = useState<ProxyState>(proxyEngine.getState());
  const [ready, setReady] = useState(engineInitialized);

  useEffect(() => {
    initPromise.then(() => setReady(true));
    const unsub = proxyEngine.subscribe(setState);
    return unsub;
  }, []);

  const enable = useCallback(() => proxyEngine.enable(), []);
  const disable = useCallback(() => proxyEngine.disable(), []);
  const forceRotate = useCallback(() => proxyEngine.forceRotate(), []);

  return {
    state,
    ready,
    enable,
    disable,
    forceRotate,
    dohResolvers: proxyEngine.getDohResolvers(),
    endpoints: proxyEngine.getEndpoints(),
    techniques: proxyEngine.getTechniques(),
  };
}
