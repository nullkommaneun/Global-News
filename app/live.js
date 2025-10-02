// Fetcher & Normalizer für Live-Datenquellen (ohne API-Keys)
// Quellen: USGS (GeoJSON), NASA EONET (JSON), CISA KEV (JSON; ohne Geo)
// CORS: USGS+EONET erlauben CORS. CISA kann Ratenlimits/403 haben.

const RW_APPNAME = "thomas-global-dashboard-demo-20251002"; // Reserve für ReliefWeb (falls später genutzt)

export async function loadLiveEvents() {
  const out = [];
  try {
    const quakes = await loadUSGS();
    out.push(...quakes);
  } catch (e) { console.warn("USGS fehlgeschlagen:", e); }

  try {
    const eonet = await loadEONET();
    out.push(...eonet);
  } catch (e) { console.warn("EONET fehlgeschlagen:", e); }

  try {
    const kev = await loadCISAKEV();
    out.push(...kev);
  } catch (e) { console.warn("CISA KEV fehlgeschlagen:", e); }

  return out;
}

// USGS GeoJSON: Past 7 Days, all earthquakes
// Docs: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
async function loadUSGS() {
  const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("USGS HTTP " + res.status);
  const geo = await res.json();
  const now = Date.now();

  return (geo.features || []).slice(0, 300).map(f => {
    const p = f.properties || {};
    const c = f.geometry?.coordinates || [0,0,0];
    const mag = p.mag ?? 0;
    // Severity heuristisch aus Magnitude
    const severity = Math.min(100, Math.max(0, (mag / 8) * 100));
    const conf = 90; // USGS Datenqualität hoch
    return {
      id: String(p?.code || p?.ids || p?.url || Math.random()),
      time_utc: new Date(p.time || now).toISOString(),
      updated_utc: new Date(p.updated || p.time || now).toISOString(),
      geo: { lat: c[1], lon: c[0], admin0: p.place || "Earth", admin1: "" },
      category: "environment",
      subcategory: "earthquake",
      headline: `Erdbeben M${mag?.toFixed?.(1) ?? mag} — ${p.place || "unbekannt"}`,
      summary: p.title || "USGS Meldung",
      sources: [{ name: "USGS GeoJSON", url: p.url || "https://earthquake.usgs.gov", confidence: conf/100 }],
      metrics: { severity, exposure: 60, confidence: conf, trend: "flat" },
      impacts: { population: 0, supply_chain: 0, markets: 0, infrastructure: 0 },
      tags: ["quake","usgs"]
    };
  });
}

// NASA EONET: Recent open natural events
// Docs: https://eonet.gsfc.nasa.gov/how-to-guide (v3)
async function loadEONET() {
  const url = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("EONET HTTP " + res.status);
  const data = await res.json();

  const mapCat = (c) => ({
    "Wildfires": { cat: "environment", sub: "wildfire", sev: 55, tag: "fire" },
    "Severe Storms": { cat: "environment", sub: "storm", sev: 60, tag: "storm" },
    "Volcanoes": { cat: "environment", sub: "volcano", sev: 65, tag: "volcano" },
    "Sea and Lake Ice": { cat: "environment", sub: "ice", sev: 40, tag: "ice" },
    "Drought": { cat: "environment", sub: "drought", sev: 50, tag: "drought" },
    "Floods": { cat: "environment", sub: "flood", sev: 60, tag: "flood" }
  }[c] || { cat: "environment", sub: "natural_event", sev: 45, tag: "eonet" });

  const out = [];
  for (const ev of (data.events || [])) {
    const catName = ev.categories?.[0]?.title || "Natural Event";
    const m = mapCat(catName);
    for (const g of (ev.geometry || [])) {
      const coords = g.coordinates;
      let lat, lon;
      if (Array.isArray(coords) && typeof coords[0] === "number") {
        lon = coords[0]; lat = coords[1];
      } else continue;
      const dt = g.date || ev.closed || ev.open;
      out.push({
        id: `eonet_${ev.id}_${dt}`,
        time_utc: new Date(dt).toISOString(),
        updated_utc: new Date(dt).toISOString(),
        geo: { lat, lon, admin0: "", admin1: "" },
        category: m.cat,
        subcategory: m.sub,
        headline: `${ev.title}`,
        summary: `NASA EONET: ${catName}`,
        sources: [{ name: "NASA EONET", url: `https://eonet.gsfc.nasa.gov/api/v3/events/${ev.id}`, confidence: 0.85 }],
        metrics: { severity: m.sev, exposure: 55, confidence: 85, trend: "rising" },
        impacts: { population: 1, supply_chain: 0, markets: 0, infrastructure: 1 },
        tags: [m.tag, "eonet"]
      });
    }
  }
  return out;
}

// CISA KEV: JSON (kein Geo); wird nur als Karten-Ereignis ohne Marker gelistet
// Feed (kann Ratenlimits/403 haben): https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
async function loadCISAKEV() {
  const url = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("CISA HTTP " + res.status);
  const data = await res.json();
  const items = data?.vulnerabilities || [];
  return items.slice(0, 50).map(v => ({
    id: `kev_${v.cveID}`,
    time_utc: new Date(v.dateAdded || Date.now()).toISOString(),
    updated_utc: new Date(v.dueDate || v.dateAdded || Date.now()).toISOString(),
    geo: {}, // kein Marker
    category: "cyber",
    subcategory: "kev",
    headline: `${v.cveID} — ${v.vendorProject || ""} ${v.product || ""}`.trim(),
    summary: `${v.shortDescription || "CISA KEV"} (Required Action: ${v.requiredAction || "—"})`,
    sources: [{ name: "CISA KEV", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", confidence: 0.9 }],
    metrics: { severity: 65, exposure: 70, confidence: 90, trend: "rising" },
    impacts: { population: 0, supply_chain: 2, markets: 1, infrastructure: 2 },
    tags: ["kev","cve"]
  }));
}
