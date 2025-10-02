const weights = { severity: 0.45, exposure: 0.25, confidence: 0.2, trend: 0.15, age: 0.1 };
const ageHalfLifeHours = 12;
function agePenaltyHours(dt, now = new Date()) {
  const h = Math.max(0, (now - new Date(dt)) / 36e5);
  const decay = 1 - Math.exp(-Math.log(2) * h / ageHalfLifeHours);
  return decay;
}
export function scoreEvent(e, now = new Date()) {
  const m = e.metrics || {};
  const sev = clamp(m.severity);
  const exp = clamp(m.exposure);
  const conf = clamp(m.confidence);
  const trend = (m.trend === "rising" ? 100 : m.trend === "falling" ? 0 : 50);
  const age = agePenaltyHours(e.time_utc, now) * 100;
  let s = (weights.severity*sev + weights.exposure*exp + weights.confidence*conf + weights.trend*trend - weights.age*age);
  s = Math.max(0, Math.min(100, s));
  return Math.round(s);
}
function clamp(v){ const n = Number(v ?? 0); return Math.max(0, Math.min(100, n)); }
