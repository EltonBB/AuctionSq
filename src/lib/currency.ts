const DEFAULT_ALL_PER_EUR = 100;

export function getAllPerEurRate() {
  const raw = Number(process.env.NEXT_PUBLIC_ALL_PER_EUR || DEFAULT_ALL_PER_EUR);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_ALL_PER_EUR;
  return raw;
}

export function allToEur(amountAll: number) {
  return amountAll / getAllPerEurRate();
}

export function eurToAll(amountEur: number) {
  return Number((amountEur * getAllPerEurRate()).toFixed(2));
}

export function formatEurFromAll(amountAll: number) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(allToEur(amountAll));
}
