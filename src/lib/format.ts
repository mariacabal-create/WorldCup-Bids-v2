export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const DAY_NAMES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];
const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function formatDateHeading(dateStr: string): string {
  // dateStr: YYYY-MM-DD interpretado en horario local del partido (ET), mostramos por fecha de calendario
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dayName = DAY_NAMES[date.getDay()];
  const monthName = MONTH_NAMES[date.getMonth()];
  return `${capitalize(dayName)} ${d} de ${monthName}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatKickoffTime(timeET: string): string {
  const [h, m] = timeET.split(":").map(Number);
  const period = h >= 12 ? "p. m." : "a. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period} ET`;
}

export interface CountdownParts {
  totalMs: number;
  closed: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  urgent: boolean; // < 1 hora
}

export function getCountdown(kickoffISO: string, now: number = Date.now()): CountdownParts {
  const kickoff = new Date(kickoffISO).getTime();
  const totalMs = kickoff - now;
  const closed = totalMs <= 0;
  const abs = Math.max(0, totalMs);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const seconds = Math.floor((abs % 60_000) / 1000);
  return {
    totalMs,
    closed,
    days,
    hours,
    minutes,
    seconds,
    urgent: !closed && totalMs < 3_600_000,
  };
}
