export const $ = (sel, root=document) => root.querySelector(sel);

export function mountHTML(container, html){
  container.innerHTML = html;
  return container;
}