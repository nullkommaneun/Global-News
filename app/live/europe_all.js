// Orchestrator für Europa-Feeds
import { setRawEvents, state } from "../store.js";
import { loadUSGS_EU, loadEONET_EU, loadGDACS_EU, loadUKFlood, loadMeteoalarmRSS } from "./env_europe.js";
import { loadECDC_Cdtr, loadECDC_Risk, loadWHO_Europe, loadRKI_Bulletin, loadEFSA } from "./health_europe.js";
import { loadCERTEU, loadENISA, loadBSI, loadCERTFR, loadNCSC } from "./cyber_europe.js";
import { loadEurostat_Unemp, loadECB_HICP, loadECFIN_RSS, loadBundesbank_RSS, loadBoE_RSS } from "./economy_europe.js";
import { loadEP_News, loadEEAS, loadNATO, loadOSCE, loadFrontex } from "./conflict_europe.js";
import { loadEurocontrolNews, loadEASA, loadDGMOVE, loadTenneT, loadRTE } from "./infra_europe.js";

export async function loadEuropeAll(){
  const loaders = [
    // environment (5)
    loadUSGS_EU, loadEONET_EU, loadGDACS_EU, loadUKFlood, loadMeteoalarmRSS,
    // health (5)
    loadECDC_Cdtr, loadECDC_Risk, loadWHO_Europe, loadRKI_Bulletin, loadEFSA,
    // cyber (5)
    loadCERTEU, loadENISA, loadBSI, loadCERTFR, loadNCSC,
    // economy (5)
    loadEurostat_Unemp, loadECB_HICP, loadECFIN_RSS, loadBundesbank_RSS, loadBoE_RSS,
    // conflict/politics (5)
    loadEP_News, loadEEAS, loadNATO, loadOSCE, loadFrontex,
    // infrastructure (5)
    loadEurocontrolNews, loadEASA, loadDGMOVE, loadTenneT, loadRTE
  ];

  const results = await Promise.allSettled(loaders.map(fn=>fn()));
  const all = [];
  for(const r of results){
    if(r.status==="fulfilled" && Array.isArray(r.value)) all.push(...r.value);
  }
  // Dedup by id
  const seen=new Set(), merged=[];
  for(const e of all){ if(!e?.id) continue; if(seen.has(e.id)) continue; seen.add(e.id); merged.push(e); }
  return merged;
}
