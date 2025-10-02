import { tryFetchJSON, withinEUorNull } from "./common.js";

// 1) USGS FDSN — Europa-BBOX (GeoJSON)
export async function loadUSGS_EU(){
  const url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime="+encodeURIComponent(new Date(Date.now()-7*864e5).toISOString())+"&minlatitude=34&maxlatitude=72&minlongitude=-25&maxlongitude=45";
  const j = await tryFetchJSON(url);
  return (j.features||[]).map(f=>{
    const p=f.properties||{}; const c=f.geometry?.coordinates||[];
    const geo = withinEUorNull(c[1], c[0]); if(!geo) return null;
    const mag = p.mag ?? 0; const sev = Math.min(100, Math.max(0, (mag/8)*100));
    return {
      id: "usgs_"+(p.code||p.ids||Math.random()),
      time_utc: new Date(p.time||Date.now()).toISOString(),
      updated_utc: new Date(p.updated||p.time||Date.now()).toISOString(),
      geo, category:"environment", subcategory:"earthquake",
      headline:`Erdbeben M${mag?.toFixed?.(1)??mag} — ${p.place||"Europa"}`,
      summary:p.title||"USGS Meldung",
      sources:[{name:"USGS FDSN", url:p.url||"https://earthquake.usgs.gov", confidence:0.9}],
      metrics:{severity:sev, exposure:60, confidence:90, trend:"flat"},
      impacts:{population:1,supply_chain:0,markets:0,infrastructure:1},
      tags:["usgs","quake"]
    };
  }).filter(Boolean);
}

// 2) NASA EONET — offene Naturereignisse, EU-Filter
export async function loadEONET_EU(){
  const url="https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=80";
  const j = await tryFetchJSON(url);
  const out=[];
  for(const ev of (j.events||[])){
    for(const g of (ev.geometry||[])){
      const coords=g.coordinates; if(!Array.isArray(coords)) continue;
      const lon=coords[0], lat=coords[1]; const geo=withinEUorNull(lat,lon); if(!geo) continue;
      out.push({
        id:`eonet_${ev.id}_${g.date}`,
        time_utc:new Date(g.date||ev.open||Date.now()).toISOString(),
        updated_utc:new Date(g.date||ev.open||Date.now()).toISOString(),
        geo, category:"environment", subcategory:"natural_event",
        headline:ev.title, summary:(ev.categories?.[0]?.title||"EONET"),
        sources:[{name:"NASA EONET", url:`https://eonet.gsfc.nasa.gov/api/v3/events/${ev.id}`, confidence:0.85}],
        metrics:{severity:55, exposure:55, confidence:85, trend:"rising"},
        impacts:{population:1,supply_chain:0,markets:0,infrastructure:1},
        tags:["eonet"]
      });
    }
  }
  return out;
}

// 3) GDACS — Eventliste (GeoJSONähnlich), EU-Filter
export async function loadGDACS_EU(){
  const url="https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?";
  const j = await tryFetchJSON(url);
  return (j||[]).map(e=>{
    const lat=Number(e.latitude), lon=Number(e.longitude);
    const geo=withinEUorNull(lat,lon); if(!geo) return null;
    const type=e.eventtype || "EVT";
    const title = `${e.eventname||type} — ${e.country||"EU"}`;
    return {
      id:`gdacs_${e.eventid||e.glide||Math.random()}`,
      time_utc:new Date(e.fromdate || e.createddate || Date.now()).toISOString(),
      updated_utc:new Date(e.todate || e.updateddate || e.fromdate || Date.now()).toISOString(),
      geo, category:"environment", subcategory:type.toLowerCase(),
      headline:title, summary:`GDACS: ${e.alertlevel||""} ${e.severitytext||""}`.trim(),
      sources:[{name:"GDACS API", url:"https://www.gdacs.org/", confidence:0.8}],
      metrics:{severity:60, exposure:60, confidence:80, trend:"rising"},
      impacts:{population:2,supply_chain:1,markets:0,infrastructure:2},
      tags:["gdacs"]
    };
  }).filter(Boolean);
}

// 4) UK Environment Agency Flood API — England (EU-Region erweitert), EU-Filter (nur GB-Punkte nahe EU-BBOX)
export async function loadUKFlood(){
  const url="https://environment.data.gov.uk/flood-monitoring/id/floods";
  const j = await tryFetchJSON(url);
  return (j.items||[]).map(it=>{
    const lat=Number(it.lat), lon=Number(it.long);
    const geo=withinEUorNull(lat,lon); if(!geo) return null;
    return {
      id:"ukflood_"+(it.floodAreaID||it["@id"]||Math.random()),
      time_utc:new Date(it.timeRaised || it.timeSeverityChanged || Date.now()).toISOString(),
      updated_utc:new Date(it.timeSeverityChanged || it.timeRaised || Date.now()).toISOString(),
      geo, category:"environment", subcategory:"flood_warning",
      headline:`Flood warning: ${it.description?.slice(0,80)??"UK Flood"}`,
      summary:it.message || it.description || "Flood warning (UK)",
      sources:[{name:"UK Flood Monitoring API", url:"https://environment.data.gov.uk/flood-monitoring/doc/reference", confidence:0.8}],
      metrics:{severity:50, exposure:60, confidence:80, trend:"rising"},
      impacts:{population:2,supply_chain:1,markets:0,infrastructure:2},
      tags:["flood","uk"]
    };
  }).filter(Boolean);
}

// 5) Meteoalarm CAP ATOM (EU-weit) — Viele Länder; hier nur ATOM-Index ohne Geopunkt (Liste)
export async function loadMeteoalarmRSS(){
  // Viele Landesfeeds; Index liefert Links. Ohne Geo → nur Liste
  const url="https://www.meteoalarm.org/ATOM";
  // manche Server ohne CORS; wenn blockiert, einfach leer zurück
  try{
    const txt = await fetch(url, {cache:"no-store"}).then(r=>{if(!r.ok) throw new Error(r.status); return r.text();});
    return (txt? [{
      id:"meteoalarm_index",
      time_utc:new Date().toISOString(),
      updated_utc:new Date().toISOString(),
      geo:{}, category:"environment", subcategory:"weather_warning",
      headline:"Meteoalarm — EU-Wetterwarnungen (Index)",
      summary:"Landesfeeds verfügbar (ATOM).",
      sources:[{name:"Meteoalarm ATOM", url:"https://www.meteoalarm.org/ATOM", confidence:0.7}],
      metrics:{severity:40, exposure:70, confidence:70, trend:"rising"},
      impacts:{population:1,supply_chain:0,markets:0,infrastructure:1},
      tags:["weather","meteoalarm"]
    }]:[]);
  } catch(e){ return []; }
}
