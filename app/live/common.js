// Gemeinsame Helfer
import { isInEurope } from "../store.js";

export function tryFetchJSON(url){
  return fetch(url,{cache:"no-store"}).then(r=>{ if(!r.ok) throw new Error(url+" HTTP "+r.status); return r.json(); });
}
export function tryFetchText(url){
  return fetch(url,{cache:"no-store"}).then(r=>{ if(!r.ok) throw new Error(url+" HTTP "+r.status); return r.text(); });
}

export function withinEUorNull(lat, lon){
  if(isInEurope(lat, lon)) return {lat, lon};
  return null;
}

// Minimal RSS/XML Parser → Array<{title, link, pubDate, summary}>
export function parseRSS(xmlString){
  const doc = new DOMParser().parseFromString(xmlString, "application/xml");
  const items = [...doc.querySelectorAll("item, entry")];
  return items.map(it=>{
    const title = it.querySelector("title")?.textContent?.trim() || "";
    const link = it.querySelector("link")?.getAttribute("href") || it.querySelector("link")?.textContent || "";
    const date = it.querySelector("updated, pubDate, published")?.textContent || "";
    const sum = it.querySelector("summary, description, content")?.textContent || "";
    return { title, link, date, sum };
  });
}
