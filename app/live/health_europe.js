import { tryFetchText, parseRSS } from "./common.js";

function rssToEvents(xml, sourceName, sourceUrl){
  const items = parseRSS(xml);
  return items.slice(0,50).map(it=>({
    id: sourceName.replace(/\W+/g,"_")+"_"+(it.link||it.title),
    time_utc: new Date(it.date || Date.now()).toISOString(),
    updated_utc: new Date(it.date || Date.now()).toISOString(),
    geo: {}, category:"health", subcategory:"outbreak",
    headline: it.title || sourceName,
    summary: it.sum?.slice(0,240) || sourceName,
    sources: [{name: sourceName, url: it.link || sourceUrl, confidence: 0.75}],
    metrics: {severity: 50, exposure: 60, confidence: 75, trend:"rising"},
    impacts: {population:3,supply_chain:1,markets:0,infrastructure:0},
    tags:["health","rss"]
  }));
}

// 1) ECDC: Communicable disease threats report
export async function loadECDC_Cdtr(){
  const url="https://www.ecdc.europa.eu/en/publications-data/communicable-disease-threats-report-cdtr/rss";
  try{ const xml = await tryFetchText(url); return rssToEvents(xml, "ECDC CDTR", url);}catch{return[];}
}
// 2) ECDC: Risk assessments RSS
export async function loadECDC_Risk(){
  const url="https://www.ecdc.europa.eu/en/publications-data/risk-assessment/rss";
  try{ const xml = await tryFetchText(url); return rssToEvents(xml, "ECDC Risk Assessments", url);}catch{return[];}
}
// 3) WHO/Europe news RSS
export async function loadWHO_Europe(){
  const url="https://www.who.int/europe/home/feed";
  try{ const xml = await tryFetchText(url); return rssToEvents(xml, "WHO Europe", url);}catch{return[];}
}
// 4) RKI (DE) epidemiologisches Bulletin RSS
export async function loadRKI_Bulletin(){
  const url="https://www.rki.de/SiteGlobals/Functions/RSSFeed/RSSGenerator_nCoV.jsp";
  try{ const xml = await tryFetchText(url); return rssToEvents(xml, "RKI RSS", url);}catch{return[];}
}
// 5) EFSA (Lebensmittelsicherheit) News RSS
export async function loadEFSA(){
  const url="https://www.efsa.europa.eu/en/rss/press/news";
  try{ const xml = await tryFetchText(url); return rssToEvents(xml, "EFSA News", url);}catch{return[];}
}
