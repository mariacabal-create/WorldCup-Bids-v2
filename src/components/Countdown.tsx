"use client";

import { useEffect, useState } from "react";
import { getCountdown } from "@/lib/format";

export function Countdown({ kickoff }: { kickoff: string }) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- confirma montaje en cliente para evitar mismatch de hidratación (el countdown depende de Date.now())
    setMounted(true);
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) {
    // evita mismatch de hidratación: no renderizamos el conteo hasta montar en cliente
    return <span className="text-chalk-dim text-xs font-body">Calculando…</span>;
  }

  const c = getCountdown(kickoff, now);

  if (c.closed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-card-red font-display text-xs font-semibold uppercase tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-card-red" />
        Subasta cerrada
      </span>
    );
  }

  const segments: string[] = [];
  if (c.days > 0) segments.push(`${c.days}d`);
  if (c.days > 0 || c.hours > 0) segments.push(`${c.hours}h`);
  segments.push(`${c.minutes}m`);
  if (c.days === 0 && c.hours === 0) segments.push(`${c.seconds}s`);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-wide scoreboard-digit ${
        c.urgent ? "text-trophy-bright" : "text-chalk-dim"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          c.urgent ? "bg-trophy-bright pulse-live" : "bg-chalk-dim"
        }`}
      />
      Cierra en {segments.join(" ")}
    </span>
  );
}
