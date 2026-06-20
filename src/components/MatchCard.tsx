"use client";

import { useState } from "react";
import { Countdown } from "./Countdown";
import { LeaderScoreboard } from "./LeaderScoreboard";
import { formatKickoffTime } from "@/lib/format";
import type { Match, TopBid } from "@/types/domain";

const FLAGS: Record<string, string> = {
  Netherlands: "🇳🇱",
  Sweden: "🇸🇪",
  Mexico: "🇲🇽",
  "South Africa": "🇿🇦",
  USA: "🇺🇸",
  Canada: "🇨🇦",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  Spain: "🇪🇸",
  England: "🏴",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Portugal: "🇵🇹",
  Italy: "🇮🇹",
};

type MatchSummary = {
  match_id: number;
  score_count: number;
  bidder_count: number;
  bid_count: number;
  last_bid_at: string | null;
};

export function MatchCard({
  match,
  topBid,
  summary,
  onOpenBid,
}: {
  match: Match;
  topBid: TopBid | null;
  summary: MatchSummary | null;
  onOpenBid: (match: Match) => void;
}) {
  const [now] = useState(() => Date.now());

  const closed = new Date(match.kickoff).getTime() <= now;

  return (
    <article className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl hover:border-yellow-500 transition-all">

      <div className="px-5 pt-5">

        <div className="flex justify-between items-center mb-4">

          <div className="text-xs uppercase tracking-widest text-yellow-400 font-semibold">
            {match.group_name ? `Grupo ${match.group_name}` : match.phase}
          </div>

          <div className="text-xs text-zinc-400">
            {formatKickoffTime(match.time)}
          </div>

        </div>

        <div className="flex items-center justify-between">

          <div className="flex flex-col gap-4">

            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {FLAGS[match.home] ?? "⚽"}
              </div>

              <div className="text-xl font-bold text-white">
                {match.home}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {FLAGS[match.away] ?? "⚽"}
              </div>

              <div className="text-xl font-bold text-white">
                {match.away}
              </div>
            </div>

          </div>

        </div>

        <div className="mt-5 text-sm text-zinc-400">
          📍 {match.venue}, {match.city}
        </div>

        <div className="mt-5">
          <LeaderScoreboard
            topBid={topBid}
            homeAbbr={match.home.slice(0, 3).toUpperCase()}
            awayAbbr={match.away.slice(0, 3).toUpperCase()}
          />
        </div>

        <div className="mt-5 rounded-2xl bg-black/30 border border-zinc-800 p-4 space-y-2">

          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">
              🎯 Marcadores tomados
            </span>

            <span className="text-white font-semibold">
              {summary?.score_count ?? 0}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">
              👥 Participantes
            </span>

            <span className="text-white font-semibold">
              {summary?.bidder_count ?? 0}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">
              🔥 Pujas realizadas
            </span>

            <span className="text-white font-semibold">
              {summary?.bid_count ?? 0}
            </span>
          </div>

        </div>

      </div>

      <div className="border-t border-zinc-800 mt-5 px-5 py-4 flex items-center justify-between">

        <Countdown kickoff={match.kickoff} />

        <button
          onClick={() => onOpenBid(match)}
          disabled={closed}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 py-3 rounded-2xl transition-all"
        >
          {closed ? "Cerrada" : "Pujar"}
        </button>

      </div>

    </article>
  );
}
