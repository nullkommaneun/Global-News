import { tryFetchText, parseRSS } from "./common.js";
function rssToEvents(xml, sourceName, sourceUrl, sub="politics"){
  const items = parseRSS(xml);
  return items.slice(0,50).map(it=>({
    id: sourceName.replace(/\W+/g,"_")+"_"+(it.link||it.title),
    time_utc:new Date(it.date||Date.now()).toISOString(),
    updated_utc:new Date(it.date||Date.now()).toISOString(),
    geo:{}, category:"conflict", subcategory:sub,
    headline: it.title || sourceName,
    summary: it.sum?.slice(0,240) || sourceName,
    sources:[{name:sourceName, url: it.link||sourceUrl, confidence:0.7}],
    metrics:{severity:45, exposure:65, confidence:70, trend:"rising"},
    impacts:{population:1,supply_chain:1,markets:1,infrastructure:0},
    tags:["europe","rss"]
  }));
}

// 1) European Parliament News RSS
export async function loadEP_News(){
  const url="https://www.europarl.europa.eu/rss/doc/topnews/en.xml";
  try{ const xml=await tryFetchText(url); return rssToEvents(xml,"European Parliament News",url,"politics");}catch{return[];}
}
// 2) EEAS (EU-Außenpolitik) News RSS
export async function loadEEAS(){
  const url="https://www.eeas.europa.eu/eeas/rss_en";
  try{ const xml=await tryFetchText(url); return rssToEvents(xml,"EEAS News",url,"geopolitics");}catch{return[];}
}
// 3) NATO Press Releases RSS
export async function loadNATO(){
  const url="https://www.nato.int/cps/en/natohq/news_rss.htm";
  try{ const xml=await tryFetchText(url); return rssToEvents(xml,"NATO News",url,"security");}catch{return[];}
}
// 4) OSCE Press RSS
export async function loadOSCE(){
  const url="https://www.osce.org/press-releases/rss";
  try{ const xml=await tryFetchText(url); return rssToEvents(xml,"OSCE Press",url,"security");}catch{return[];}
}
// 5) Frontex News RSS
export async function loadFrontex(){
  const url="https://frontex.europa.eu/rss/";
  try{ const xml=await tryFetchText(url); return rssToEvents(xml,"Frontex News",url,"border");}catch{return[];}
}
