import { $, mountHTML } from "../../utils/dom.js";
import { getSelectedTenant } from "../../services/tenants/tenants.js";
import {
  getTenantModules,
  setSelectedModule,
  resolveModuleTarget,
  buildModuleEntryUrl
} from "../../services/modules/modules.js";

function getRoleLabel(roleKey){
  switch ((roleKey || "").toLowerCase()) {
    case "core_admin":
      return "Administrador";
    case "core_operador":
      return "Operador";
    case "core_visualizador":
      return "Visualizador";
    default:
      return roleKey || "Sem papel";
  }
}

export async function renderHub(root, router){
  const html = await fetch("./pages/hub/hub.html").then(r => r.text());
  mountHTML(root, html);

  const tenant = getSelectedTenant();
  if (!tenant){
    router.go("/tenant");
    return;
  }

  $("#tenantBadge").textContent = tenant.name;

  const modules = await getTenantModules(tenant.id);
  const grid = $("#hubGrid");

  if (!modules.length) {
    grid.innerHTML = `
      <div class="panel">
        <div class="panel-inner">
          <div class="notice">Nenhum sistema habilitado para esta empresa.</div>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = modules.map((module) => {
    const unlocked = module.isEnabled !== false;
    const title = module.name || module.key;
    const roleLabel = getRoleLabel(module.roleKey);

    return `
      <div
        class="panel module-card ${unlocked ? "" : "locked"}"
        data-module-key="${module.key}"
        data-unlocked="${unlocked}"
      >
        <div class="panel-inner">
          <div class="module-title">
            <div style="font-size:12px;color:var(--muted);letter-spacing:.14em;text-transform:uppercase">${title}</div>
          </div>

          <div class="notice">
            Papel: ${roleLabel}<br/>
            Nível de acesso: ${module.accessLevel || "leitura"}
          </div>

          <div style="height:14px"></div>

          <div class="row" style="justify-content:space-between">
            <span class="badge">${unlocked ? "Disponível" : "Bloqueado"}</span>
            <button class="btn btn-primary btn-small" type="button" ${unlocked ? "" : "disabled"}>
              Abrir ${title}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".module-card");
    if (!card) return;
    if (card.getAttribute("data-unlocked") !== "true") return;

    const moduleKey = card.getAttribute("data-module-key");
    const module = modules.find((item) => item.key === moduleKey);
    if (!module) return;

    setSelectedModule(module);

    const target = resolveModuleTarget(module);
    if (!target) {
      alert("URL do sistema ainda não configurada.");
      return;
    }

    const entryUrl = buildModuleEntryUrl(target, tenant, module);
    window.location.href = entryUrl;
  });
}