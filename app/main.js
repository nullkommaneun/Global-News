import { setRawEvents, setFilter, getFilteredEvents, state } from "./store.js";
import { renderTriage, renderEventCards, colorBySeverity } from "./ui.js";
import { setDiag } from "./diag.js";
import { loadEuropeAll } from "./live/europe_all.js";

const mapEl = document.getElementById("map");
const triageEl = document.getElementById("triageList");
const eventsEl = document.getElementById("eventList");
const diagEl = document.getElementById("diagBox");

const rangeSelect = document.getElementById("rangeSelect");
const catSelect = document.getElementById("catSelect");
const minConf = document.getElementById("minConf");
const minConfVal = document.getElementById("minConfVal");
const reloadBtn = document.getElementById("reloadBtn");
const euOnlyChk = document.getElementById("euOnly");

let map;
document.addEventListener("DOMContentLoaded", init);

async function init(){
  map = L.map(mapEl, { worldCopyJump:true }).setView([52, 10], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 8, minZoom: 3, attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  rangeSelect.addEventListener("change", () => { setFilter("range", rangeSelect.value); refresh(); });
  catSelect.addEventListener("change", () => { setFilter("category", catSelect.value); refresh(); });
  minConf.addEventListener("input", () => { minConfVal.textContent = minConf.value; });
  minConf.addEventListener("change", () => { setFilter("minConfidence", Number(minConf.value)); refresh(); });
  euOnlyChk.addEventListener("change", () => { setFilter("euOnly", euOnlyChk.checked); refresh(); });
  reloadBtn.addEventListener("click", reloadLive);

  await reloadLive();
}

let layerGroup = L.layerGroup();
function refresh(){
  const filtered = getFilteredEvents(new Date());
  layerGroup.remove(); layerGroup = L.layerGroup().addTo(map);

  filtered.forEach(e=>{
    const {lat,lon}=e.geo||{}; if(typeof lat!=="number"||typeof lon!=="number") return;
    const sev=e.metrics?.severity??0; const color=colorBySeverity(sev);
    const circle=L.circleMarker([lat,lon],{radius:Math.max(4,Math.min(12,(sev/10)+4)),color,weight:1,fillColor:color,fillOpacity:.35});
    circle.bindPopup(`
      <strong>${escapeHtml(e.headline)}</strong><br/>
      <small>${escapeHtml(e.category)} • ${new Date(e.time_utc).toLocaleString()}</small><br/>
      <small>Sev ${Math.round(sev)} • Conf ${Math.round(e.metrics?.confidence??0)}</small><br/>
      <small><em>${escapeHtml(e.summary??"")}</em></small>`);
    circle.addTo(layerGroup);
  });

  renderTriage(triageEl, filtered);
  renderEventCards(eventsEl, filtered);

  setDiag(diagEl, {filters: state.filters, total: state.rawEvents.length, shown: filtered.length, lastUpdateUTC: new Date().toISOString()});
}

async function reloadLive(){
  setDiag(diagEl, {status:"Lade Europa‑Feeds …"});
  try{
    const live = await loadEuropeAll();
    setRawEvents(live);
  }catch(e){
    console.warn("Live-Load Fehler", e);
  }
  refresh();
}

function escapeHtml(s=""){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#039;'}[m]));}
