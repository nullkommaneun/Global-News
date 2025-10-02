import { tryFetchJSON, tryFetchText, parseRSS } from "./common.js";

// 1) Eurostat API: Unemployment rate monthly (EU27_2020) → Event ohne Geo
export async function loadEurostat_Unemp(){
  const url="https://ec.europa.eu/eurostat/api/discoveries/tgm/table?code=une_rt_m&format=JSON";
  try{
    const j = await tryFetchJSON(url);
    return [{
      id:"eurostat_unemp",
      time_utc:new Date().toISOString(),
      updated_utc:new Date().toISOString(),
      geo:{},
      category:"economy", subcategory:"indicator",
      headline:"Eurostat: Arbeitslosenquote (EU)",
      summary:"Aktualisierte Daten (une_rt_m).",
      sources:[{name:"Eurostat API", url:"https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-introduction", confidence:0.8}],
      metrics:{severity:45, exposure:80, confidence:80, trend:"flat"},
      impacts:{population:2,supply_chain:1,markets:2,infrastructure:0},
      tags:["eurostat","unemployment"]
    }];
  }catch{return[];}
}

// 2) ECB SDW: HICP (Inflation) — exemplarischer Aufruf (ohne Parsingtiefe)
export async function loadECB_HICP(){
  const url="https://data.ecb.europa.eu/service/data/ICP/M.U2.N.000000.4.ANR?format=jsondata&lastNObservations=1";
  try{
    const j = await tryFetchJSON(url);
    return [{
      id:"ecb_hicp",
      time_utc:new Date().toISOString(),
      updated_utc:new Date().toISOString(),
      geo:{},
      category:"economy", subcategory:"indicator",
      headline:"EZB: HICP (Inflation, Euroraum)",
      summary:"Letzte Beobachtung via SDMX REST.",
      sources:[{name:"ECB SDW API", url:"https://data.ecb.europa.eu/help/api/overview", confidence:0.85}],
      metrics:{severity:50, exposure:85, confidence:85, trend:"flat"},
      impacts:{population:2,supply_chain:2,markets:3,infrastructure:0},
      tags:["ecb","hicp"]
    }];
  }catch{return[];}
}

// 3) European Commission DG ECFIN News RSS
export async function loadECFIN_RSS(){
  const url="https://economy-finance.ec.europa.eu/news/rss_en?field_core_tags_tid=All&field_core_news_type_tid=All";
  try{ const xml=await tryFetchText(url); const items=parseRSS(xml);
    return items.slice(0,20).map(it=>({
      id:"ecfin_"+(it.link||it.title),
      time_utc:new Date(it.date||Date.now()).toISOString(),
      updated_utc:new Date(it.date||Date.now()).toISOString(),
      geo:{}, category:"economy", subcategory:"news",
      headline: it.title||"ECFIN News",
      summary: it.sum?.slice(0,240)||"ECFIN News",
      sources:[{name:"ECFIN RSS", url: it.link||url, confidence:0.7}],
      metrics:{severity:40, exposure:70, confidence:70, trend:"flat"},
      impacts:{population:1,supply_chain:1,markets:2,infrastructure:0},
      tags:["ec","economy","rss"]
    }));
  }catch{return[];}
}

// 4) Bundesbank (DE) Presse RSS
export async function loadBundesbank_RSS(){
  const url="https://www.bundesbank.de/dynamic/action/en/rssfeed/751490/rssfeed?ut=";
  try{ const xml=await tryFetchText(url); const items=parseRSS(xml);
    return items.slice(0,15).map(it=>({
      id:"bbk_"+(it.link||it.title),
      time_utc:new Date(it.date||Date.now()).toISOString(),
      updated_utc:new Date(it.date||Date.now()).toISOString(),
      geo:{}, category:"economy", subcategory:"news",
      headline: it.title||"Bundesbank",
      summary: it.sum?.slice(0,240)||"Bundesbank News",
      sources:[{name:"Deutsche Bundesbank", url: it.link||url, confidence:0.7}],
      metrics:{severity:35, exposure:60, confidence:70, trend:"flat"},
      impacts:{population:1,supply_chain:1,markets:2,infrastructure:0},
      tags:["bundesbank","rss"]
    }));
  }catch{return[];}
}

// 5) Bank of England News RSS (Europa-Region, non-EU)
export async function loadBoE_RSS(){
  const url="https://www.bankofengland.co.uk/boeapps/rss/feeds.aspx";
  try{ const xml=await tryFetchText(url); const items=parseRSS(xml);
    return items.slice(0,15).map(it=>({
      id:"boe_"+(it.link||it.title),
      time_utc:new Date(it.date||Date.now()).toISOString(),
      updated_utc:new Date(it.date||Date.now()).toISOString(),
      geo:{}, category:"economy", subcategory:"news",
      headline: it.title||"Bank of England",
      summary: it.sum?.slice(0,240)||"BoE News",
      sources:[{name:"Bank of England RSS", url: it.link||url, confidence:0.65}],
      metrics:{severity:35, exposure:60, confidence:65, trend:"flat"},
      impacts:{population:1,supply_chain:1,markets:2,infrastructure:0},
      tags:["boe","rss"]
    }));
  }catch{return[];}
}
