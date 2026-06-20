"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useBidderIdentity } from "@/lib/useBidderIdentity";
import { formatDateHeading } from "@/lib/format";
import { Header } from "@/components/Header";
import { PhaseFilterBar, type PhaseFilter } from "@/components/PhaseFilterBar";
import { MatchCard } from "@/components/MatchCard";
import { BidModal } from "@/components/BidModal";
import { IdentityModal } from "@/components/IdentityModal";
import matchesData from "@/lib/matches-data.json";
import type { Match, TopBid } from "@/types/domain";

const ALL_MATCHES = matchesData as Match[];

export type MatchBidSummary = {
  match_id: number;
  score_count: number;
  bidder_count: number;
  bid_count: number;
  last_bid_at: string | null;
};

export default function Home() {
  const { identity, save: saveIdentity, hydrated } = useBidderIdentity();

  const [topBids, setTopBids] = useState<Record<number, TopBid>>({});
  const [summaries, setSummaries] = useState<Record<number, MatchBidSummary>>({});
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("Todas");
  const [activeBidMatch, setActiveBidMatch] = useState<Match | null>(null);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const { data: topData, error: topError } = await supabase
      .from("current_top_bids")
      .select("*");

    const { data: summaryData, error: summaryError } = await supabase
      .from("match_bid_summaries")
      .select("*");

    if (topError || summaryError) {
      setLoadError("No pudimos cargar las pujas en vivo.");
      return;
    }

    const topMap: Record<number, TopBid> = {};
    for (const row of topData ?? []) {
      topMap[row.match_id] = row as TopBid;
    }

    const summaryMap: Record<number, MatchBidSummary> = {};
    for (const row of summaryData ?? []) {
      summaryMap[row.match_id] = row as MatchBidSummary;
    }

    setTopBids(topMap);
    setSummaries(summaryMap);
  }, []);

  useEffect(() => {
    loadData();

    const supabase = createClient();

    const channel = supabase
      .channel("bids-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bids" },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const groupedByDate = useMemo(() => {
    const now = new Date();

    const upcomingMatches = ALL_MATCHES.filter(
      (m) => new Date(m.kickoff) > now
    );

    const filtered =
      phaseFilter === "Todas"
        ? upcomingMatches
        : upcomingMatches.filter((m) => m.phase === phaseFilter);

    const groups = new Map<string, Match[]>();

    for (const match of filtered) {
      const list = groups.get(match.date) ?? [];
      list.push(match);
      groups.set(match.date, list);
    }

    return Array.from(groups.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
  }, [phaseFilter]);

  return (
    <>
      <Header
        identity={identity}
        onEditIdentity={() => setShowIdentityModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <section className="max-w-4xl">
          <p className="text-sm text-zinc-400 leading-relaxed">
            Puja por el marcador exacto del Mundial 2026. Cada marcador funciona
            como una subasta independiente.
          </p>
        </section>

        {loadError && (
          <div className="rounded-md border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {loadError}
          </div>
        )}

        <PhaseFilterBar active={phaseFilter} onChange={setPhaseFilter} />

        <div className="space-y-10">
          {groupedByDate.map(([date, matches]) => (
            <section key={date}>
              <h2 className="text-sm font-bold uppercase tracking-widest text-yellow-400 mb-4">
                {formatDateHeading(date)}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {matches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    topBid={topBids[m.id] ?? null}
                    summary={summaries[m.id] ?? null}
                    onOpenBid={setActiveBidMatch}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-zinc-800 py-6 mt-10">
        <p className="text-center text-[11px] text-zinc-500">
          Quiniela amistosa entre amigos · Horarios en hora del Este (ET)
        </p>
      </footer>

      {hydrated && activeBidMatch && (
        <BidModal
          match={activeBidMatch}
          currentTop={topBids[activeBidMatch.id] ?? null}
          identity={identity}
          onSaveIdentity={saveIdentity}
          onClose={() => setActiveBidMatch(null)}
          onSuccess={() => {
            setActiveBidMatch(null);
            loadData();
          }}
        />
      )}

      {showIdentityModal && (
        <IdentityModal
          identity={identity}
          onSave={saveIdentity}
          onClose={() => setShowIdentityModal(false)}
        />
      )}
    </>
  );
}
