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
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-2 pb-1 min-w-max">
        {PHASES.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-display font-medium uppercase tracking-wide border transition-colors ${
              active === p
                ? "bg-trophy text-pitch-900 border-trophy"
                : "border-line text-chalk-dim hover:border-chalk-dim hover:text-chalk"
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
