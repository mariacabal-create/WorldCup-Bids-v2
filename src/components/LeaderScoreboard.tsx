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
      const t = setTimeout(() => setFlip(false), 450);
      return () => clearTimeout(t);
    }
    prevBidId.current = topBid?.bid_id ?? null;
  }, [topBid]);

  if (!topBid) {
    return (
      <div className="rounded-md border border-dashed border-line bg-pitch-900/40 px-4 py-3 text-center">
        <p className="font-display text-sm uppercase tracking-wide text-chalk-dim">
          Aún sin pujas
        </p>
        <p className="text-xs text-chalk-dim/70 mt-0.5">Sé el primero en marcar</p>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-pitch-900 border border-trophy/30 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-[11px] uppercase tracking-widest text-chalk-dim w-12 text-right">
            {homeAbbr}
          </span>
          <div
            key={topBid.bid_id}
            className={`flex items-center gap-1.5 font-display text-3xl font-bold scoreboard-digit text-trophy-bright ${
              flip ? "flip-update" : ""
            }`}
          >
            <span>{topBid.home_score}</span>
            <span className="text-chalk-dim/40 text-xl">–</span>
            <span>{topBid.away_score}</span>
          </div>
          <span className="font-display text-[11px] uppercase tracking-widest text-chalk-dim w-12">
            {awayAbbr}
          </span>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-semibold text-trophy leading-none">
            {formatUSD(topBid.amount_usd)}
          </p>
          <p className="text-[11px] text-chalk-dim mt-1 truncate max-w-[110px]">
            {topBid.bidder_name}
          </p>
        </div>
      </div>
    </div>
  );
}
