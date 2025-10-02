import { setRawEvents, setFilter, getFilteredEvents, state } from "./store.js";
import { renderTriage, renderEventCards, colorBySeverity } from "./ui.js";
import { setDiag } from "./diag.js";
import { loadLiveEvents } from "./live.js";

const mapEl = document.getElementById("map");
const triageEl = document.getElementById("triageList");
const eventsEl = document.getElementById("eventList");
const diagEl = document.getElementById("diagBox");

const rangeSelect = document.getElementById("rangeSelect");
const catSelect = document.getElementById("catSelect");
const minConf = document.getElementById("minConf");
const minConfVal = document.getElementById("minConfVal");
const reloadBtn = document.getElementById("reloadBtn");

let map;
document.addEventListener("DOMContentLoaded", init);

async function init() {
  map = L.map(mapEl, { worldCopyJump: true }).setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 6,
    minZoom: 2,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  // Erst Fallback laden, damit UI nicht leer ist
  try {
    const res = await fetch("data/events.mock.json", { cache: "no-store" });
    const mock = await res.json();
    setRawEvents(mock);
  } catch (e) { console.warn("Mock nicht gefunden", e); }

  // Live laden
  await reloadLive();

  rangeSelect.addEventListener("change", () => { setFilter("range", rangeSelect.value); refresh(); });
  catSelect.addEventListener("change", () => { setFilter("category", catSelect.value); refresh(); });
  minConf.addEventListener("input", () => { minConfVal.textContent = minConf.value; });
  minConf.addEventListener("change", () => { setFilter("minConfidence", Number(minConf.value)); refresh(); });
  reloadBtn.addEventListener("click", reloadLive);

  refresh();
}

let layerGroup = L.layerGroup();

function refresh() {
  const filtered = getFilteredEvents(new Date());
  layerGroup.remove(); layerGroup = L.layerGroup().addTo(map);

  filtered.forEach(e => {
    const { lat, lon } = e.geo || {};
    if (typeof lat !== "number" || typeof lon !== "number") return;
    const sev = e.metrics?.severity ?? 0;
    const color = colorBySeverity(sev);
    const circle = L.circleMarker([lat, lon], {
      radius: Math.max(4, Math.min(12, (sev/10)+4)),
      color, weight: 1, fillColor: color, fillOpacity: 0.35
    });
    circle.bindPopup(`
      <strong>${escapeHtml(e.headline)}</strong><br/>
      <small>${escapeHtml(e.category)} • ${new Date(e.time_utc).toLocaleString()}</small><br/>
      <small>Sev ${Math.round(sev)} • Conf ${Math.round(e.metrics?.confidence ?? 0)}</small><br/>
      <small><em>${escapeHtml(e.summary ?? "")}</em></small>
    `);
    circle.addTo(layerGroup);
  });

  renderTriage(triageEl, filtered);
  renderEventCards(eventsEl, filtered);

  setDiag(diagEl, {
    filters: state.filters,
    total: state.rawEvents.length,
    shown: filtered.length,
    lastUpdateUTC: new Date().toISOString()
  });
}

async function reloadLive() {
  setDiag(diagEl, { status: "Lade Live-Daten…" });
  try {
    const live = await loadLiveEvents();
    // Merge: Live + vorhandene (Dedup by id)
    const all = [...live, ...(state.rawEvents || [])];
    const seen = new Set();
    const merged = [];
    for (const e of all) { if (!seen.has(e.id)) { seen.add(e.id); merged.push(e); } }
    setRawEvents(merged);
  } catch (e) {
    console.warn("Live-Load Fehler:", e);
  }
  refresh();
}

function escapeHtml(s=""){return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#039;'}[m]));}
