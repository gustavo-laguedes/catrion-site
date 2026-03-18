import { $, mountHTML } from "../../utils/dom.js";
import { listTenants, getSelectedTenant, setSelectedTenant } from "../../services/tenants/tenants.js";

export async function renderTenant(root, router){
  const html = await fetch("./pages/tenant/tenant.html").then(r=>r.text());
  mountHTML(root, html);

  const listEl = $("#tenantList");
  const btn = $("#btnContinue");

  const tenants = await listTenants();
  const selected = getSelectedTenant();

    listEl.innerHTML = tenants.map(t=>{
    // mock visual: logo só para o primeiro parceiro
    const logo =
      (t.name || "").toLowerCase().includes("clube do suplemento")
        ? "assets/clubedosuplemento-logo.png"
        : null;

    const subtitle =
      (t.name || "").toLowerCase().includes("demo")
        ? "Ambiente de demonstração"
        : "Empresa ativa no Portal";

    const initials = (t.name || "?")
      .split(" ")
      .slice(0,2)
      .map(w => (w[0] || "").toUpperCase())
      .join("");

    return `
      <div class="tenant-item ${selected?.id === t.id ? "active" : ""}" data-id="${t.id}">
        <div class="tenant-left">
          <div class="tenant-logo-wrap">
            ${
              logo
                ? `<img class="tenant-logo" src="${logo}" alt="${t.name}">`
                : `<div class="tenant-initials">${initials}</div>`
            }
          </div>

          <div class="tenant-meta">
            <div class="tenant-name">${t.name}</div>
            <div class="tenant-sub">${subtitle}</div>
          </div>
        </div>

        <div class="badge">Selecionar</div>
      </div>
    `;
  }).join("");

  function refresh(){ btn.disabled = !getSelectedTenant(); }
  refresh();

  listEl.addEventListener("click", (e)=>{
    const item = e.target.closest(".tenant-item");
    if(!item) return;

    const id = item.getAttribute("data-id");
    const tenant = tenants.find(x=>x.id===id);
    setSelectedTenant(tenant);

    [...listEl.querySelectorAll(".tenant-item")].forEach(x=>x.classList.remove("active"));
    item.classList.add("active");
    refresh();
  });

  btn.addEventListener("click", ()=> router.go("/hub"));
}