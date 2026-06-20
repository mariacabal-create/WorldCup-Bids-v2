"use client";

import { useState } from "react";
import type { BidderIdentity } from "@/lib/useBidderIdentity";

export function IdentityModal({
  identity,
  onSave,
  onClose,
}: {
  identity: BidderIdentity | null;
  onSave: (id: BidderIdentity) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(identity?.name ?? "");
  const [email, setEmail] = useState(identity?.email ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName) return setError("Escribe tu nombre.");
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail))
      return setError("Escribe un correo válido.");
    onSave({ name: trimmedName, email: trimmedEmail });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-pitch-900/80 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm bg-pitch-800 border border-line rounded-2xl shadow-2xl p-5"
      >
        <h2 className="font-display text-lg font-semibold mb-1">
          ¿Cómo te identificamos?
        </h2>
        <p className="text-xs text-chalk-dim mb-4">
          Usamos esto para mostrar tu nombre junto a tus pujas. No se requiere contraseña.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            autoFocus
            className="w-full bg-pitch-900 border border-line rounded-md px-3 py-2.5 text-sm focus:border-trophy outline-none"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu correo"
            className="w-full bg-pitch-900 border border-line rounded-md px-3 py-2.5 text-sm focus:border-trophy outline-none"
          />
          {error && <p className="text-sm text-card-red">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-md border border-line text-sm font-display uppercase tracking-wide text-chalk-dim hover:text-chalk transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-md bg-trophy text-pitch-900 text-sm font-display font-semibold uppercase tracking-wide hover:bg-trophy-bright transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
