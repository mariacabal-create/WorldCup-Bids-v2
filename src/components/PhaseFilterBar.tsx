"use client";

const PHASES = [
  "Todas",
  "Fase de grupos",
  "Dieciseisavos",
  "Octavos",
  "Cuartos",
  "Semifinal",
  "Tercer puesto",
  "Final",
] as const;

export type PhaseFilter = (typeof PHASES)[number];

export function PhaseFilterBar({
  active,
  onChange,
}: {
  active: PhaseFilter;
  onChange: (p: PhaseFilter) => void;
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        {PHASES.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition-all border whitespace-nowrap ${
              active === p
                ? "bg-yellow-400 text-black border-yellow-400 shadow-lg"
                : "bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-yellow-400 hover:text-white"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

export { PHASES };
