"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { formatUSD } from "@/lib/format";
import type { Match, TopBid } from "@/types/domain";
import type { BidderIdentity } from "@/lib/useBidderIdentity";

type ScoreBid = {
  match_id: number;
  home_score: number;
  away_score: number;
  amount_usd: number;
  created_at: string;
  bidder_name: string;
};

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
  const [amount, setAmount] = useState("1");
  const [scoreBids, setScoreBids] = useState<ScoreBid[]>([]);
  const [loadingScoreBids, setLoadingScoreBids] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const selectedScoreBid = scoreBids.find(
    (bid) =>
      String(bid.home_score) === homeScore &&
      String(bid.away_score) === awayScore
  );

  const selectedMinBid = selectedScoreBid
    ? Number(selectedScoreBid.amount_usd) + 1
    : 1;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    async function loadScoreBids() {
      setLoadingScoreBids(true);

      const supabase = createClient();

      const { data, error } = await supabase
        .from("match_score_bids")
        .select("*")
        .eq("match_id", match.id)
        .order("amount_usd", { ascending: false });

      if (!error) {
        setScoreBids((data ?? []) as ScoreBid[]);
      }

      setLoadingScoreBids(false);
    }

    loadScoreBids();
  }, [match.id]);

  useEffect(() => {
    if (homeScore === "" || awayScore === "") return;

    const currentAmount = Number(amount);

    if (!Number.isFinite(currentAmount) || currentAmount < selectedMinBid) {
      setAmount(String(selectedMinBid));
    }
  }, [homeScore, awayScore, selectedMinBid, amount]);

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
    if (homeScore === "" || !Number.isInteger(hs) || hs < 0 || hs > 7)
      return setError("El marcador local debe ser un número entre 0 y 7.");
    if (awayScore === "" || !Number.isInteger(as) || as < 0 || as > 7)
      return setError("El marcador visitante debe ser un número entre 0 y 7.");
    if (!Number.isFinite(amt) || amt <= 0)
      return setError("La puja debe ser un monto en USD mayor a 0.");
    if (amt < selectedMinBid)
      return setError(
        selectedScoreBid
          ? `Para tomar este marcador debes pujar mínimo ${formatUSD(
              selectedMinBid
            )}.`
          : "Este marcador está libre. La puja mínima es $1."
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
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
        className="w-full sm:max-w-2xl bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="px-6 pt-6 pb-5 border-b border-zinc-800">
          <p className="text-yellow-400 text-xs uppercase tracking-[0.25em] font-bold">
            {match.phase}
            {match.group_name ? ` · Grupo ${match.group_name}` : ""}
          </p>

          <h2 id="bid-modal-title" className="text-3xl font-bold text-white mt-2">
            {match.home} vs {match.away}
          </h2>

          <p className="text-sm text-zinc-400 mt-2">
            📍 {match.venue}, {match.city}
          </p>
        </div>

        <div className="px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-white font-bold text-lg">Marcadores ya pujados</h3>
            <span className="text-xs text-zinc-400">
              {scoreBids.length} marcador{scoreBids.length === 1 ? "" : "es"}
            </span>
          </div>

          {loadingScoreBids ? (
            <p className="text-sm text-zinc-400">Cargando pujas…</p>
          ) : scoreBids.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-black/30 px-4 py-5 text-center">
              <p className="text-zinc-300 font-semibold">
                Todavía no hay marcadores pujados
              </p>
              <p className="text-zinc-500 text-sm mt-1">
                Sé la primera persona en abrir esta subasta.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scoreBids.map((bid) => {
                const selected =
                  homeScore === String(bid.home_score) &&
                  awayScore === String(bid.away_score);

                const nextBid = Number(bid.amount_usd) + 1;

                return (
                  <button
                    key={`${bid.home_score}-${bid.away_score}-${bid.bidder_name}-${bid.created_at}`}
                    type="button"
                    onClick={() => {
                      setHomeScore(String(bid.home_score));
                      setAwayScore(String(bid.away_score));
                      setAmount(String(nextBid));
                    }}
                    className={`text-left rounded-2xl border px-4 py-3 transition ${
                      selected
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-zinc-800 bg-black/30 hover:border-yellow-400/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-3xl font-bold text-yellow-300 scoreboard-digit">
                          {bid.home_score} - {bid.away_score}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                          Para tomarlo: {formatUSD(nextBid)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-white font-bold">
                          {formatUSD(Number(bid.amount_usd))}
                        </div>
                        <div className="text-xs text-zinc-400 truncate max-w-[130px]">
                          {bid.bidder_name}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3 font-bold">
              Tu pronóstico de marcador
            </p>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
              <ScoreField
                autoFocus
                label={match.home}
                value={homeScore}
                onChange={setHomeScore}
              />

              <span className="text-3xl text-zinc-600 font-bold mt-10">–</span>

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
              className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2 font-bold block"
            >
              Tu puja (USD)
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl font-bold">
                $
              </span>

              <input
                id="amount"
                type="number"
                inputMode="decimal"
                min={selectedMinBid}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl pl-9 pr-4 py-4 text-2xl font-bold text-yellow-300 focus:border-yellow-400 outline-none"
              />
            </div>

            <p className="text-xs text-zinc-500 mt-2">
              {homeScore === "" || awayScore === ""
                ? "Elige un marcador para ver la puja mínima."
                : selectedScoreBid
                ? `Este marcador lo tiene ${selectedScoreBid.bidder_name} con ${formatUSD(
                    Number(selectedScoreBid.amount_usd)
                  )}. Para tomarlo debes pujar mínimo ${formatUSD(selectedMinBid)}.`
                : "Este marcador está libre. Puedes abrirlo desde $1."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2 border-t border-zinc-800">
            <div className="pt-4">
              <label
                htmlFor="bidder-name"
                className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2 block font-bold"
              >
                Tu nombre
              </label>

              <input
                id="bidder-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como quieres aparecer en la subasta"
                className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-yellow-400 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="bidder-email"
                className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2 block font-bold"
              >
                Tu correo
              </label>

              <input
                id="bidder-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="para identificarte en próximas pujas"
                className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-yellow-400 outline-none"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm text-red-300 bg-red-950/40 border border-red-500/30 rounded-2xl px-4 py-3"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-zinc-700 text-sm font-bold uppercase tracking-wide text-zinc-300 hover:text-white hover:border-zinc-400 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-2xl bg-yellow-400 text-black text-sm font-bold uppercase tracking-wide hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

  return (
    <div className="flex flex-col items-center gap-3 min-w-0">
      <span className="text-xs uppercase tracking-wide text-zinc-400 text-center truncate max-w-full px-1">
        {label}
      </span>

      <div className="w-20 h-20 rounded-3xl bg-black border border-yellow-400/40 flex items-center justify-center text-5xl font-bold text-yellow-300 scoreboard-digit">
        {numeric ?? "–"}
      </div>

      <div
        role="group"
        aria-label={`Marcador rápido para ${label}, de 0 a 7`}
        className="grid grid-cols-4 gap-1.5"
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
              className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                selected
                  ? "bg-yellow-400 text-black"
                  : "bg-black text-zinc-400 border border-zinc-800 hover:border-yellow-400 hover:text-white"
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
