// Zentraler Store + Filterlogik
export const state = {
  rawEvents: [],
  filters: {
    range: "7d",
    category: "all",
    minConfidence: 50
  }
};

export function setRawEvents(list) { state.rawEvents = list; }

export function setFilter(key, val) {
  state.filters[key] = val;
  return state.filters;
}

export function getFilteredEvents(now = new Date()) {
  const { range, category, minConfidence } = state.filters;
  const minTs = new Date(now);
  if (range === "24h") minTs.setHours(minTs.getHours() - 24);
  if (range === "7d")  minTs.setDate(minTs.getDate() - 7);
  if (range === "30d") minTs.setDate(minTs.getDate() - 30);

  return state.rawEvents.filter(e => {
    const t = new Date(e.time_utc);
    const catOk = (category === "all") || e.category === category;
    const confOk = (e.metrics?.confidence ?? 0) >= minConfidence;
    return t >= minTs && catOk && confOk;
  });
}
