import { tryFetchText, tryFetchJSON, parseRSS, withinEUorNull } from "./common.js";

// 1) Eurocontrol Newsroom RSS (if available via page xml; fallback to list)
export async function loadEurocontrolNews(){
  const url="https://www.eurocontrol.int/newsroom/rss.xml";
  try{ const xml=await tryFetchText(url); const items=parseRSS(xml);
    return items.slice(0,30).map(it=>({
      id:"euctrl_"+(it.link||it.title),
      time_utc:new Date(it.date||Date.now()).toISOString(),
      updated_utc:new Date(it.date||Date.now()).toISOString(),
      geo:{}, category:"infrastructure", subcategory:"aviation_news",
      headline: it.title||"EUROCONTROL News",
      summary: it.sum?.slice(0,240)||"Eurocontrol News",
      sources:[{name:"EUROCONTROL", url: it.link||url, confidence:0.7}],
      metrics:{severity:35, exposure:70, confidence:70, trend:"flat"},
      impacts:{population:1,supply_chain:2,markets:1,infrastructure:2},
      tags:["aviation","eurocontrol"]
    }));
  }catch{return[];}
}

// 2) EASA RSS
export async function loadEASA(){
  const url="https://www.easa.europa.eu/en/rss";
  try{ const xml=await tryFetchText(url); const items=parseRSS(xml);
    return items.slice(0,20).map(it=>({
      id:"easa_"+(it.link||it.title),
      time_utc:new Date(it.date||Date.now()).toISOString(),
      updated_utc:new Date(it.date||Date.now()).toISOString(),
      geo:{}, category:"infrastructure", subcategory:"aviation_reg",
      headline: it.title||"EASA",
      summary: it.sum?.slice(0,240)||"EASA RSS",
      sources:[{name:"EASA", url: it.link||url, confidence:0.7}],
      metrics:{severity:30, exposure:60, confidence:70, trend:"flat"},
      impacts:{population:1,supply_chain:1,markets:1,infrastructure:2},
      tags:["aviation","easa"]
    }));
  }catch{return[];}
}

// 3) DG MOVE (EU-Verkehr) News RSS
export async function loadDGMOVE(){
  const url="https://transport.ec.europa.eu/news/rss_en";
  try{ const xml=await tryFetchText(url); const items=parseRSS(xml);
    return items.slice(0,20).map(it=>({
      id:"dgmv_"+(it.link||it.title),
      time_utc:new Date(it.date||Date.now()).toISOString(),
      updated_utc:new Date(it.date||Date.now()).toISOString(),
      geo:{}, category:"infrastructure", subcategory:"transport_policy",
      headline: it.title||"DG MOVE",
      summary: it.sum?.slice(0,240)||"DG MOVE News",
      sources:[{name:"DG MOVE", url: it.link||url, confidence:0.7}],
      metrics:{severity:30, exposure:60, confidence:70, trend:"flat"},
      impacts:{population:1,supply_chain:2,markets:1,infrastructure:2},
      tags:["transport","eu"]
    }));
  }catch{return[];}
}

// 4) TenneT (NL/DE) News RSS
export async function loadTenneT(){
  const url="https://www.tennet.eu/rss.xml";
  try{ const xml=await tryFetchText(url); const items=parseRSS(xml);
    return items.slice(0,20).map(it=>({
      id:"tennet_"+(it.link||it.title),
      time_utc:new Date(it.date||Date.now()).toISOString(),
      updated_utc:new Date(it.date||Date.now()).toISOString(),
      geo:{}, category:"infrastructure", subcategory:"grid",
      headline: it.title||"TenneT",
      summary: it.sum?.slice(0,240)||"TenneT RSS",
      sources:[{name:"TenneT", url: it.link||url, confidence:0.65}],
      metrics:{severity:40, exposure:70, confidence:65, trend:"flat"},
      impacts:{population:1,supply_chain:3,markets:2,infrastructure:3},
      tags:["grid","energy"]
    }));
  }catch{return[];}
}

// 5) RTE (FR) News RSS
export async function loadRTE(){
  const url="https://www.rte-france.com/feeds/en";
  try{ const xml=await tryFetchText(url); const items=parseRSS(xml);
    return items.slice(0,20).map(it=>({
      id:"rte_"+(it.link||it.title),
      time_utc:new Date(it.date||Date.now()).toISOString(),
      updated_utc:new Date(it.date||Date.now()).toISOString(),
      geo:{}, category:"infrastructure", subcategory:"grid",
      headline: it.title||"RTE France",
      summary: it.sum?.slice(0,240)||"RTE RSS",
      sources:[{name:"RTE France", url: it.link||url, confidence:0.65}],
      metrics:{severity:40, exposure:70, confidence:65, trend:"flat"},
      impacts:{population:1,supply_chain:3,markets:2,infrastructure:3},
      tags:["grid","energy"]
    }));
  }catch{return[];}
}
