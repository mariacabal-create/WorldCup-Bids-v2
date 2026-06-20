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
    <header className="sticky top-0 z-30 bg-black/95 backdrop-blur border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">

        <div>
          <p className="text-yellow-400 text-xs uppercase tracking-[0.3em] font-semibold">
            FIFA WORLD CUP 2026
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">
            Subasta de Marcadores
          </h1>

          <p className="text-zinc-400 text-sm mt-2">
            Compite con tus amigos por los resultados exactos de cada partido
          </p>
        </div>

        <button
          onClick={onEditIdentity}
          className="bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-3 hover:border-yellow-400 transition"
        >
          {identity ? (
            <>
              <div className="text-zinc-400 text-xs">
                Pujando como
              </div>

              <div className="text-yellow-400 font-semibold">
                {identity.name}
              </div>
            </>
          ) : (
            <div className="text-white font-semibold">
              👤 Identifícate
            </div>
          )}
        </button>

      </div>
    </header>
  );
}
