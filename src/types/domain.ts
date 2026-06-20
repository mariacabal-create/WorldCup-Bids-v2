export type Phase =
  | "Fase de grupos"
  | "Dieciseisavos"
  | "Octavos"
  | "Cuartos"
  | "Semifinal"
  | "Tercer puesto"
  | "Final";

export interface Match {
  id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM ET
  kickoff: string; // ISO timestamptz
  home: string;
  away: string;
  venue: string;
  city: string;
  phase: Phase;
  group_name: string | null;
}

export interface TopBid {
  match_id: number;
  bid_id: string;
  home_score: number;
  away_score: number;
  amount_usd: number;
  created_at: string;
  bidder_name: string;
}

export interface Bidder {
  id: string;
  name: string;
  email: string;
}
