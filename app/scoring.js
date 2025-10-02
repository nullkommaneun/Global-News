const weights={severity:.45,exposure:.25,confidence:.2,trend:.15,age:.1};
const half=12;
function agePenalty(dt, now=new Date()){
  const h=Math.max(0,(now - new Date(dt))/36e5);
  return 1 - Math.exp(-Math.log(2)*h/half);
}
export function scoreEvent(e, now=new Date()){
  const m=e.metrics||{};
  const sev=clamp(m.severity), exp=clamp(m.exposure), conf=clamp(m.confidence);
  const trend=(m.trend==="rising"?100:m.trend==="falling"?0:50);
  const age=agePenalty(e.time_utc, now)*100;
  let s=weights.severity*sev+weights.exposure*exp+weights.confidence*conf+weights.trend*trend-weights.age*age;
  return Math.round(Math.max(0,Math.min(100,s)));
}
function clamp(v){const n=Number(v??0);return Math.max(0,Math.min(100,n));}
