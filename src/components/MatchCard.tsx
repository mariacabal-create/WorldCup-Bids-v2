"use client";

import { useState } from "react";
import { Countdown } from "./Countdown";
import { LeaderScoreboard } from "./LeaderScoreboard";
import { formatKickoffTime } from "@/lib/format";
import type { Match, TopBid } from "@/types/domain";

const PHASE_COLORS: Record<string, string> = {
  "Fase de grupos": "bg-score-blue/20 text-score-blue border-score-blue/40",
  Dieciseisavos: "bg-trophy/15 text-trophy border-trophy/40",
  Octavos: "bg-trophy/20 text-trophy border-trophy/50",
  Cuartos: "bg-trophy/25 text-trophy-bright border-trophy/60",
  Semifinal: "bg-card-red/20 text-card-red border-card-red/40",
  "Tercer puesto": "bg-chalk-dim/15 text-chalk-dim border-chalk-dim/30",
  Final: "bg-card-red/25 text-card-red border-card-red/60",
};

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
  const phaseStyle =
    PHASE_COLORS[match.phase] ?? "bg-chalk-dim/15 text-chalk-dim border-chalk-dim/30";

  return (
    <article className="rounded-xl border border-line bg-pitch-800 overflow-hidden hover:border-trophy/40 transition-colors">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-block text-[10px] font-display font-semibold uppercase tracking-widest px-2 py-0.5 rounded border ${phaseStyle}`}
          >
            {match.group_name ? `Grupo ${match.group_name}` : match.phase}
          </span>
          <span className="text-[11px] text-chalk-dim font-body">
            {formatKickoffTime(match.time)}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3 className="font-display text-lg font-medium leading-tight">
            {match.home}
            <span className="text-chalk-dim mx-1.5 font-normal">vs</span>
            {match.away}
          </h3>
        </div>
        <p className="text-xs text-chalk-dim mb-3">
          {match.venue}, {match.city}
        </p>

        <LeaderScoreboard
          topBid={topBid}
          homeAbbr={abbreviate(match.home)}
          awayAbbr={abbreviate(match.away)}
        />
      </div>

      <div className="px-4 py-3 bg-pitch-900/40 border-t border-line flex items-center justify-between gap-3">
        <Countdown kickoff={match.kickoff} />
        <button
          onClick={() => onOpenBid(match)}
          disabled={closed}
          className="shrink-0 px-4 py-2 rounded-md bg-trophy text-pitch-900 text-xs font-display font-semibold uppercase tracking-wide hover:bg-trophy-bright transition-colors disabled:bg-pitch-700 disabled:text-chalk-dim disabled:cursor-not-allowed"
        >
          {closed ? "Cerrada" : topBid ? "Superar puja" : "Pujar"}
        </button>
      </div>
    </article>
  );
}
