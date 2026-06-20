"use client";

import type { BidderIdentity } from "@/lib/useBidderIdentity";

export function Header({
  identity,
  onEditIdentity,
}: {
  identity: BidderIdentity | null;
  onEditIdentity: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 bg-pitch-900/95 backdrop-blur border-b border-line">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-[11px] uppercase tracking-[0.2em] text-trophy">
            Mundial 2026
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-semibold leading-tight">
            Subasta de Marcadores
          </h1>
        </div>
        <button
          onClick={onEditIdentity}
          className="text-right group"
        >
          {identity ? (
            <>
              <p className="text-xs text-chalk-dim group-hover:text-chalk transition-colors">
                Pujando como
              </p>
              <p className="font-display text-sm font-medium text-trophy">
                {identity.name}
              </p>
            </>
          ) : (
            <p className="font-display text-xs uppercase tracking-wide text-chalk-dim border border-line rounded-full px-3 py-1.5 hover:border-trophy hover:text-trophy transition-colors">
              Identifícate
            </p>
          )}
        </button>
      </div>
    </header>
  );
}
