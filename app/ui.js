import { scoreEvent } from "./scoring.js";
export function renderTriage(listEl, events) {
  listEl.innerHTML = "";
  const ranked = [...events].map(e => ({ e, s: scoreEvent(e) }))
                            .sort((a,b)=>b.s - a.s).slice(0, 5);
  for (const { e, s } of ranked) {
    const li = document.createElement("li");
    li.className = "triage-item";
    li.innerHTML = `<strong>${escapeHtml(e.headline)}</strong>
      <small> — Score ${s}, ${escapeHtml(e.category)}</small>`;
    listEl.appendChild(li);
  }
}
export function renderEventCards(container, events) {
  container.innerHTML = "";
  const ranked = [...events].map(e => ({ e, s: scoreEvent(e) }))
                            .sort((a,b)=>b.s - a.s);
  for (const { e, s } of ranked) {
    const card = document.createElement("article");
    card.className = "event-card";
    const time = new Date(e.time_utc).toLocaleString();
    const conf = e.metrics?.confidence ?? 0;
    const sev = e.metrics?.severity ?? 0;
    card.innerHTML = `
      <h3>${escapeHtml(e.headline)}</h3>
      <div class="event-meta">
        <span class="badge cat">${escapeHtml(e.category)}</span>
        <span class="badge conf">Conf ${Math.round(conf)}</span>
        <span class="badge sev">Sev ${Math.round(sev)}</span>
        <span>• ${time}</span>
      </div>
      <p>${escapeHtml(e.summary ?? "")}</p>
      <p style="font-family: var(--mono); font-size: 12px;">Score: ${s}</p>
      <div>${renderSources(e.sources)}</div>`;
    container.appendChild(card);
  }
}
function renderSources(sources = []) {
  if (!sources.length) return `<small class="event-meta">Keine Quellen.</small>`;
  return sources.map(s =>
    `<small class="event-meta">Quelle: <a href="${encodeURI(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a>${s.confidence!=null?` (${Math.round((s.confidence)*100)}%)`:""}</small>`
  ).join("<br/>");
}
export function colorBySeverity(sev=0) {
  if (sev >= 70) return "#ff5c5c";
  if (sev >= 40) return "#ffc857";
  return "#12d18e";
}
function escapeHtml(s=""){return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#039;'}[m]));}
