import { tryFetchText, parseRSS } from "./common.js";
function rssToEvents(xml, sourceName, sourceUrl){
  const items = parseRSS(xml);
  return items.slice(0,50).map(it=>({
    id: sourceName.replace(/\W+/g,"_")+"_"+(it.link||it.title),
    time_utc:new Date(it.date||Date.now()).toISOString(),
    updated_utc:new Date(it.date||Date.now()).toISOString(),
    geo:{}, category:"cyber", subcategory:"advisory",
    headline: it.title || sourceName,
    summary: it.sum?.slice(0,240) || sourceName,
    sources:[{name:sourceName, url: it.link||sourceUrl, confidence:0.8}],
    metrics:{severity:60, exposure:70, confidence:80, trend:"rising"},
    impacts:{population:0,supply_chain:2,markets:1,infrastructure:2},
    tags:["cyber","rss"]
  }));
}

// 1) CERT-EU advisories RSS (year overview pages link RSS)
export async function loadCERTEU(){
  const url="https://cert.europa.eu/publications/security-advisories/2025/rss";
  try{ const xml = await tryFetchText(url); return rssToEvents(xml,"CERT‑EU Advisories",url);}catch{return[];}
}
// 2) ENISA news RSS
export async function loadENISA(){
  const url="https://www.enisa.europa.eu/news/enisa-news/RSS";
  try{ const xml = await tryFetchText(url); return rssToEvents(xml,"ENISA News",url);}catch{return[];}
}
// 3) BSI (DE) CERT-Bund Meldungen RSS
export async function loadBSI(){
  const url="https://www.bsi.bund.de/SiteGlobals/Functions/RSSFeed/RSSGenerator_Zertmeldungen.xml";
  try{ const xml = await tryFetchText(url); return rssToEvents(xml,"BSI CERT-Bund",url);}catch{return[];}
}
// 4) ANSSI (FR) CERT-FR RSS
export async function loadCERTFR(){
  const url="https://www.cert.ssi.gouv.fr/feed/";
  try{ const xml = await tryFetchText(url); return rssToEvents(xml,"CERT-FR",url);}catch{return[];}
}
// 5) NCSC (UK) advisories RSS
export async function loadNCSC(){
  const url="https://www.ncsc.gov.uk/api/1/services/v1/all-rss/alerts";
  try{ const xml = await tryFetchText(url); return rssToEvents(xml,"NCSC Alerts",url);}catch{return[];}
}
