"use client";

import { useCallback, useEffect, useState } from "react";

export interface BidderIdentity {
  name: string;
  email: string;
}

const STORAGE_KEY = "subasta-mundial-2026:postor";

export function useBidderIdentity() {
  const [identity, setIdentity] = useState<BidderIdentity | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let next: BidderIdentity | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) next = JSON.parse(raw);
    } catch {
      // localStorage no disponible; seguimos sin identidad guardada
    }
    // Lectura de localStorage solo es posible tras montar en cliente: este
    // setState inicial (no un loop de sincronización) es el patrón correcto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdentity(next);
    setHydrated(true);
  }, []);

  const save = useCallback((next: BidderIdentity) => {
    setIdentity(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignorar
    }
  }, []);

  const clear = useCallback(() => {
    setIdentity(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignorar
    }
  }, []);

  return { identity, save, clear, hydrated };
}
