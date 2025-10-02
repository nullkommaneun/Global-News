export function setDiag(el, obj) {
  try {
    el.textContent = JSON.stringify(obj, null, 2);
  } catch {
    el.textContent = String(obj);
  }
}
