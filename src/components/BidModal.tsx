"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { formatUSD } from "@/lib/format";
import type { Match, TopBid } from "@/types/domain";
import type { BidderIdentity } from "@/lib/useBidderIdentity";

export function BidModal({
  match,
  currentTop,
  identity,
  onSaveIdentity,
  onClose,
  onSuccess,
}: {
  match: Match;
  currentTop: TopBid | null;
  identity: BidderIdentity | null;
  onSaveIdentity: (id: BidderIdentity) => void;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(identity?.name ?? "");
  const [email, setEmail] = useState(identity?.email ?? "");
  const [homeScore, setHomeScore] = useState(
    currentTop ? String(currentTop.home_score) : ""
  );
  const [awayScore, setAwayScore] = useState(
    currentTop ? String(currentTop.away_score) : ""
  );
  const minBid = currentTop ? currentTop.amount_usd + 1 : 1;
  const [amount, setAmount] = useState(String(minBid));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const hs = Number(homeScore);
    const as = Number(awayScore);
    const amt = Number(amount);

    if (!trimmedName) return setError("Escribe tu nombre.");
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail))
      return setError("Escribe un correo válido.");
    if (!Number.isInteger(hs) || hs < 0 || hs > 7)
      return setError("El marcador local debe ser un número entre 0 y 7.");
    if (!Number.isInteger(as) || as < 0 || as > 7)
      return setError("El marcador visitante debe ser un número entre 0 y 7.");
    if (!Number.isFinite(amt) || amt <= 0)
      return setError("La puja debe ser un monto en USD mayor a 0.");
    if (amt <= (currentTop?.amount_usd ?? 0))
      return setError(
        `Tu puja debe superar la puja actual de ${formatUSD(currentTop!.amount_usd)}.`
      );
    if (new Date(match.kickoff).getTime() <= Date.now())
      return setError("Esta subasta ya cerró: el partido ya comenzó.");

    setSubmitting(true);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("place_bid", {
      p_match_id: match.id,
      p_bidder_name: trimmedName,
      p_bidder_email: trimmedEmail,
      p_home_score: hs,
      p_away_score: as,
      p_amount_usd: amt,
    });
    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message.replace(/^.*?:\s*/, ""));
      return;
    }

    onSaveIdentity({ name: trimmedName, email: trimmedEmail });
    onSuccess();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-pitch-900/80 backdrop-blur-sm p-0 sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bid-modal-title"
        className="w-full sm:max-w-md bg-pitch-800 border-t sm:border border-line rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="px-5 pt-5 pb-4 border-b border-line">
          <p className="font-display text-[11px] uppercase tracking-widest text-trophy">
            {match.phase}
            {match.group_name ? ` · Grupo ${match.group_name}` : ""}
          </p>
          <h2
            id="bid-modal-title"
            className="font-display text-xl font-semibold mt-0.5"
          >
            {match.home} vs {match.away}
          </h2>
          <p className="text-xs text-chalk-dim mt-1">
            {match.venue}, {match.city}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-chalk-dim mb-2 font-display">
              Tu pronóstico de marcador
            </p>
            <div className="flex items-start justify-center gap-3">
              <ScoreField
                autoFocus
                label={match.home}
                value={homeScore}
                onChange={setHomeScore}
              />
              <span className="font-display text-xl text-chalk-dim/40 mt-9">–</span>
              <ScoreField
                label={match.away}
                value={awayScore}
                onChange={setAwayScore}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="amount"
              className="text-xs uppercase tracking-wide text-chalk-dim mb-2 font-display block"
            >
              Tu puja (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk-dim font-display text-lg">
                $
              </span>
              <input
                id="amount"
                type="number"
                inputMode="decimal"
                min={minBid}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-pitch-900 border border-line rounded-md pl-8 pr-3 py-2.5 font-display text-lg text-trophy-bright focus:border-trophy outline-none"
              />
            </div>
            <p className="text-[11px] text-chalk-dim mt-1.5">
              {currentTop
                ? `Puja mínima: ${formatUSD(minBid)} (debe superar la actual de ${formatUSD(currentTop.amount_usd)})`
                : "No hay límite de precio — tú abres la subasta."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1 border-t border-line">
            <div className="pt-3">
              <label
                htmlFor="bidder-name"
                className="text-xs uppercase tracking-wide text-chalk-dim mb-1.5 block font-display"
              >
                Tu nombre
              </label>
              <input
                id="bidder-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como quieres aparecer en la subasta"
                className="w-full bg-pitch-900 border border-line rounded-md px-3 py-2.5 text-sm focus:border-trophy outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="bidder-email"
                className="text-xs uppercase tracking-wide text-chalk-dim mb-1.5 block font-display"
              >
                Tu correo
              </label>
              <input
                id="bidder-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="para identificarte en próximas pujas"
                className="w-full bg-pitch-900 border border-line rounded-md px-3 py-2.5 text-sm focus:border-trophy outline-none"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm text-card-red bg-card-red/10 border border-card-red/30 rounded-md px-3 py-2"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-md border border-line text-sm font-display uppercase tracking-wide text-chalk-dim hover:text-chalk hover:border-chalk-dim transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-md bg-trophy text-pitch-900 text-sm font-display font-semibold uppercase tracking-wide hover:bg-trophy-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Enviando…" : "Confirmar puja"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScoreField({
  label,
  value,
  onChange,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  const numeric = value === "" ? null : Number(value);
  const options = [0, 1, 2, 3, 4, 5, 6, 7];

  function step(delta: number) {
    const current = numeric ?? -delta; // si está vacío, +1 → 0, -1 → 0
    const next = Math.min(7, Math.max(0, current + delta));
    onChange(String(next));
  }

  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      <span className="text-[11px] uppercase tracking-wide text-chalk-dim text-center truncate max-w-full px-1">
        {label}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Restar gol a ${label}`}
          onClick={() => step(-1)}
          className="w-9 h-9 shrink-0 rounded-full border border-line text-chalk-dim text-lg font-display leading-none hover:border-trophy hover:text-trophy active:scale-95 transition-all flex items-center justify-center"
        >
          –
        </button>

        <div
          className="w-14 h-14 shrink-0 rounded-md bg-pitch-900 border border-trophy/40 flex items-center justify-center font-display text-3xl font-bold text-trophy-bright scoreboard-digit"
          aria-live="polite"
        >
          {numeric ?? "–"}
        </div>

        <button
          type="button"
          aria-label={`Sumar gol a ${label}`}
          onClick={() => step(1)}
          className="w-9 h-9 shrink-0 rounded-full border border-line text-chalk-dim text-lg font-display leading-none hover:border-trophy hover:text-trophy active:scale-95 transition-all flex items-center justify-center"
        >
          +
        </button>
      </div>

      <div
        role="group"
        aria-label={`Marcador rápido para ${label}, de 0 a 7`}
        className="flex flex-wrap justify-center gap-1 max-w-[168px]"
      >
        {options.map((n) => {
          const selected = numeric === n;
          return (
            <button
              key={n}
              type="button"
              autoFocus={autoFocus && n === 0}
              onClick={() => onChange(String(n))}
              aria-pressed={selected}
              className={`w-7 h-7 rounded text-xs font-display font-semibold transition-colors ${
                selected
                  ? "bg-trophy text-pitch-900"
                  : "bg-pitch-900 text-chalk-dim border border-line hover:border-trophy hover:text-trophy"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
