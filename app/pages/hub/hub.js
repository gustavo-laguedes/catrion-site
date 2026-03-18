import { $, mountHTML } from "../../utils/dom.js";
import { getSelectedTenant } from "../../services/tenants/tenants.js";
import { getTenantModules } from "../../services/modules/modules.js";

export async function renderHub(root, router){
  const html = await fetch("./pages/hub/hub.html").then(r=>r.text());
  mountHTML(root, html);

  const tenant = getSelectedTenant();
  if(!tenant){ router.go("/tenant"); return; }

  $("#tenantBadge").textContent = tenant.name;

  const mods = getTenantModules(tenant.id);
  const grid = $("#hubGrid");

  const cards = [
  {
    key: "core",
    name: "Core",
    desc: "Ponto de venda, caixa e estoque — com rastreabilidade operacional e base para relatórios.",
    icon: "../assets/core-logo.png",
    route: "/core",
  },
];

  grid.innerHTML = cards.map(c=>{
  const unlocked = !!mods[c.key]; // continua respeitando licenciamento quando você ligar o supabase de verdade

  // Se quiser que o Core sempre apareça liberado no mock, pode forçar:
  // const unlocked = true;

  return `
    <div class="panel module-card ${unlocked ? "" : "locked"}" data-route="${c.route}" data-unlocked="${unlocked}">
      <div class="panel-inner">
        <div class="module-title">
          <div style="font-size:12px;color:var(--muted);letter-spacing:.14em;text-transform:uppercase">${c.name}</div>
          ${c.icon ? `<img src="${c.icon}" alt="${c.name}">` : ``}
        </div>

        <div class="notice">${c.desc}</div>

        <div style="height:14px"></div>

        <div class="row" style="justify-content:space-between">
          <span class="badge">${unlocked ? "Disponível" : "Acesso necessário"}</span>
          <button class="btn btn-primary btn-small" type="button" ${unlocked ? "" : "disabled"}>
            Abrir Core
          </button>
        </div>
      </div>
    </div>
  `;
}).join("");

  grid.addEventListener("click", (e)=>{
    const card = e.target.closest(".module-card");
    if(!card) return;
    if(card.getAttribute("data-unlocked") !== "true") return;
    router.go(card.getAttribute("data-route"));
  });
}