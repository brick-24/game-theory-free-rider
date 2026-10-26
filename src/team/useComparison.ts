import { useEffect, useRef, useState } from 'react';
import type { FormationId, FormationSummary, TeamConfig } from './model';
import ComparisonWorker from './worker?worker&inline';

type Result = Record<FormationId, FormationSummary>;

/**
 * Keeps at most one job in flight. While the worker is busy only the latest
 * config is remembered, so dragging a slider never builds up a queue.
 */
export function useComparison(config: TeamConfig, classes: number) {
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(true);
  const worker = useRef<Worker | null>(null);
  const inFlight = useRef(false);
  const queued = useRef<TeamConfig | null>(null);
  const latest = useRef(config);

  const send = (cfg: TeamConfig) => {
    if (!worker.current) return;
    inFlight.current = true;
    worker.current.postMessage({ config: cfg, classes });
  };

  useEffect(() => {
    const w = new ComparisonWorker();
    w.onmessage = (e: MessageEvent<{ result: Result }>) => {
      setResult(e.data.result);
      inFlight.current = false;
      const next = queued.current;
      queued.current = null;
      if (next) send(next);
      else setBusy(false);
    };
    worker.current = w;
    inFlight.current = false;
    queued.current = null;
    send(latest.current);
    return () => {
      w.terminate();
      worker.current = null;
      inFlight.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    latest.current = config;
    setBusy(true);
    if (inFlight.current) queued.current = config;
    else send(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  return { result, busy };
}
