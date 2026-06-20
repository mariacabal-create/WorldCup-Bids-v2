"use client";

import { useEffect, useRef, useState } from "react";
import { formatUSD } from "@/lib/format";
import type { TopBid } from "@/types/domain";

export function LeaderScoreboard({
  topBid,
  homeAbbr,
  awayAbbr,
}: {
  topBid: TopBid | null;
  homeAbbr: string;
  awayAbbr: string;
}) {
  const [flip, setFlip] = useState(false);
  const prevBidId = useRef<string | null>(null);

  useEffect(() => {
    if (topBid && prevBidId.current && prevBidId.current !== topBid.bid_id) {
      setFlip(true);
      const t = setTimeout(() => setFlip(false), 500);
      return () => clearTimeout(t);
    }
    prevBidId.current = topBid?.bid_id ?? null;
  }, [topBid]);

  if (!topBid) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-pitch-900/60 py-6 text-center">
        <p className="font-display text-xl uppercase tracking-widest text-chalk-dim">
          Aún sin pujas
        </p>

        <p className="mt-2 text-sm text-chalk-dim/70">
          Sé el primero en marcar
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-black/40 border border-trophy/30 px-5 py-5">
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="text-center w-12">
            <div className="text-[11px] text-chalk-dim uppercase tracking-widest">
              {homeAbbr}
            </div>
          </div>

          <div
            key={topBid.bid_id}
            className={`flex items-center gap-3 font-display ${
              flip ? "flip-update" : ""
            }`}
          >
            <span className="text-5xl font-bold text-trophy-bright scoreboard-digit">
              {topBid.home_score}
            </span>

            <span className="text-3xl text-chalk-dim/40">
              :
            </span>

            <span className="text-5xl font-bold text-trophy-bright scoreboard-digit">
              {topBid.away_score}
            </span>
          </div>

          <div className="text-center w-12">
            <div className="text-[11px] text-chalk-dim uppercase tracking-widest">
              {awayAbbr}
            </div>
          </div>

        </div>

        <div className="text-right">

          <div className="text-2xl font-display font-bold text-trophy">
            {formatUSD(topBid.amount_usd)}
          </div>

          <div className="mt-1 text-xs text-chalk-dim">
            {topBid.bidder_name}
          </div>

        </div>

      </div>
    </div>
  );
}
