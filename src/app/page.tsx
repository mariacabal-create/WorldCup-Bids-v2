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

export default function Home() {
  const { identity, save: saveIdentity, hydrated } = useBidderIdentity();

  const [topBids, setTopBids] = useState<Record<number, TopBid>>({});
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("Todas");
  const [activeBidMatch, setActiveBidMatch] = useState<Match | null>(null);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadTopBids = useCallback(async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("current_top_bids")
      .select("*");

    if (error) {
      setLoadError(
        "No pudimos cargar las pujas en vivo. Verifica la configuración de Supabase."
      );
      return;
    }

    const map: Record<number, TopBid> = {};

    for (const row of data ?? []) {
      map[row.match_id] = row as TopBid;
    }

    setTopBids(map);
  }, []);

  useEffect(() => {
    loadTopBids();

    const supabase = createClient();

    const channel = supabase
      .channel("bids-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
        },
        () => loadTopBids()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTopBids]);

  const groupedByDate = useMemo(() => {
    const now = new Date();

    // Mostrar únicamente partidos que aún no han comenzado
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

  function handleOpenBid(match: Match) {
    setActiveBidMatch(match);
  }

  return (
    <>
      <Header
        identity={identity}
        onEditIdentity={() => setShowIdentityModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">

        <section className="max-w-4xl">
          <p className="text-sm text-chalk-dim leading-relaxed">
            Puja por el marcador exacto de cualquiera de los{" "}
            <span className="text-chalk font-medium">
              104 partidos
            </span>{" "}
            del Mundial 2026. Todo en USD, sin precio mínimo ni techo.
            Cada subasta cierra justo cuando el árbitro pita el inicio
            del partido.
          </p>
        </section>

        {loadError && (
          <div className="rounded-md border border-card-red/40 bg-card-red/10 px-4 py-3 text-sm text-card-red">
            {loadError}
          </div>
        )}

        <PhaseFilterBar
          active={phaseFilter}
          onChange={setPhaseFilter}
        />

        <div className="space-y-10">
          {groupedByDate.map(([date, matches]) => (
            <section key={date}>
              <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-trophy mb-4">
                {formatDateHeading(date)}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {matches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    topBid={topBids[m.id] ?? null}
                    onOpenBid={handleOpenBid}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-line py-6 mt-10">
        <p className="text-center text-[11px] text-chalk-dim">
          Quiniela amistosa entre amigos · No involucra pagos reales dentro de la app · Horarios en hora del Este (ET)
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
            loadTopBids();
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
