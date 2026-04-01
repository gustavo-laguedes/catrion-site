import { $, mountHTML } from "../../utils/dom.js";
import { listTenants, getSelectedTenant, setSelectedTenant } from "../../services/tenants/tenants.js";

function getInitials(name){
  return (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => (w[0] || "").toUpperCase())
    .join("");
}

export async function renderTenant(root, router){
  const html = await fetch("./pages/tenant/tenant.html").then(r => r.text());
  mountHTML(root, html);

  const listEl = $("#tenantList");
  const btn = $("#btnContinue");

  listEl.innerHTML = `<div class="notice">Carregando empresas...</div>`;
  btn.disabled = true;

  const tenants = await listTenants();
  const selected = getSelectedTenant();

  if (!tenants.length) {
    listEl.innerHTML = `
      <div class="panel">
        <div class="panel-inner">
          <div class="notice">
            Nenhuma empresa encontrada para este usuário.
          </div>
        </div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = tenants.map((t) => `
    <div class="tenant-item ${selected?.id === t.id ? "active" : ""}" data-id="${t.id}">
      <div class="tenant-left">
        <div class="tenant-logo-wrap">
          ${
            t.logoUrl
              ? `<img class="tenant-logo" src="${t.logoUrl}" alt="${t.name}">`
              : `<div class="tenant-initials">${getInitials(t.name)}</div>`
          }
        </div>

        <div class="tenant-meta">
          <div class="tenant-name">${t.name}</div>
          <div class="tenant-sub">tenant_id: ${t.tenantId}</div>
        </div>
      </div>

      <div class="badge">Selecionar</div>
    </div>
  `).join("");

  function refresh(){
    btn.disabled = !getSelectedTenant();
  }

  refresh();

  listEl.addEventListener("click", (e) => {
    const item = e.target.closest(".tenant-item");
    if (!item) return;

    const id = item.getAttribute("data-id");
    const tenant = tenants.find((x) => x.id === id);
    setSelectedTenant(tenant);

    [...listEl.querySelectorAll(".tenant-item")].forEach((x) => x.classList.remove("active"));
    item.classList.add("active");
    refresh();
  });

  btn.addEventListener("click", () => router.go("/hub"));
}