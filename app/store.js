export const state = {
  rawEvents: [], filters: { range: "7d", category: "all", minConfidence: 50, euOnly: true }
};
export function setRawEvents(list){ state.rawEvents = list; }
export function setFilter(k,v){ state.filters[k]=v; return state.filters; }

const EU_BBOX = { minLat: 34.0, maxLat: 72.0, minLon: -25.0, maxLon: 45.0 };
export function isInEurope(lat, lon){
  return typeof lat==='number' && typeof lon==='number'
    && lat>=EU_BBOX.minLat && lat<=EU_BBOX.maxLat && lon>=EU_BBOX.minLon && lon<=EU_BBOX.maxLon;
}

export function getFilteredEvents(now=new Date()){
  const { range, category, minConfidence, euOnly } = state.filters;
  const minTs = new Date(now);
  if (range==="24h") minTs.setHours(minTs.getHours()-24);
  if (range==="7d")  minTs.setDate(minTs.getDate()-7);
  if (range==="30d") minTs.setDate(minTs.getDate()-30);

  return state.rawEvents.filter(e=>{
    const t = new Date(e.time_utc);
    const catOk = (category==="all") || e.category===category;
    const confOk = (e.metrics?.confidence ?? 0) >= minConfidence;
    const euOk = !euOnly || (e.geo && isInEurope(e.geo.lat, e.geo.lon));
    return (!isNaN(t) && t>=minTs) && catOk && confOk && euOk;
  });
}
