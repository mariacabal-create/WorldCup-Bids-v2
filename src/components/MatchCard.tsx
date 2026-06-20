"use client";

import { useState } from "react";
import { Countdown } from "./Countdown";
import { LeaderScoreboard } from "./LeaderScoreboard";
import { formatKickoffTime } from "@/lib/format";
import type { Match, TopBid } from "@/types/domain";

const FLAGS: Record<string, string> = {
  Mexico: "🇲🇽",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  Czechia: "🇨🇿",
  Canada: "🇨🇦",
  USA: "🇺🇸",
  Netherlands: "🇳🇱",
  Sweden: "🇸🇪",
  Germany: "🇩🇪",
  Japan: "🇯🇵",
  Brazil: "🇧🇷",
  Morocco: "🇲🇦",
  Argentina: "🇦🇷",
  Colombia: "🇨🇴",
  England: "🏴",
  France: "🇫🇷",
  Spain: "🇪🇸",
  Portugal: "🇵🇹",
  Uruguay: "🇺🇾",
  Belgium: "🇧🇪",
};

function flagFor(team: string): string {
  return FLAGS[team] ?? "⚽";
}

function abbreviate(team: string): string {
  if (team.length <= 4) return team.toUpperCase();

  const words = team.split(/[\s/]+/);

  if (words.length >= 2) {
    return words.map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  }

  return team.slice(0, 3).toUpperCase();
}

export function MatchCard({
  match,
  topBid,
  onOpenBid,
}: {
  match: Match;
  topBid: TopBid | null;
  onOpenBid: (match: Match) => void;
}) {
  const [now] = useState(() => Date.now());
  const closed = new Date(match.kickoff).getTime() <= now;

  return (
    <article className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl hover:border-yellow-400/60 transition-all">
      <div className="p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-[0.25em]">
            {match.group_name ? `Grupo ${match.group_name}` : match.phase}
          </span>

          <span className="text-zinc-400 text-sm">
            {formatKickoffTime(match.time)}
          </span>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{flagFor(match.home)}</span>
            <h3 className="text-2xl font-bold text-white leading-tight">
              {match.home}
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-4xl">{flagFor(match.away)}</span>
            <h3 className="text-2xl font-bold text-white leading-tight">
              {match.away}
            </h3>
          </div>
        </div>

        <p className="mt-6 text-sm text-zinc-400">
          📍 {match.venue}, {match.city}
        </p>

        <div className="mt-6">
          <LeaderScoreboard
            topBid={topBid}
            homeAbbr={abbreviate(match.home)}
            awayAbbr={abbreviate(match.away)}
          />
        </div>
      </div>

      <div className="border-t border-zinc-800 bg-black/40 px-6 py-5 flex items-center justify-between gap-4">
        <Countdown kickoff={match.kickoff} />

        <button
          onClick={() => onOpenBid(match)}
          disabled={closed}
          className="shrink-0 rounded-2xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black hover:bg-yellow-300 transition disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed"
        >
          {closed ? "Cerrada" : topBid ? "Superar puja" : "Pujar"}
        </button>
      </div>
    </article>
  );
}
