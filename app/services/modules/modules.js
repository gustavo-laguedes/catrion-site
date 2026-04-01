import { readStore, writeStore } from "../../utils/storage.js";
import { MODULE_TARGETS } from "../supabase/config.js";
import { getAccessContext } from "../tenants/tenants.js";

export async function getTenantModules(tenantId){
  const access = await getAccessContext();
  const tenant = (access.tenants || []).find(
    (item) => item.id === tenantId || item.tenantId === tenantId
  );

  return tenant?.modules || [];
}

export function getSelectedModule(){
  const s = readStore();
  return s.selectedModule || null;
}

export function setSelectedModule(module){
  const s = readStore();
  s.selectedModule = module;
  writeStore(s);
}

export function resolveModuleTarget(module){
  const explicit = MODULE_TARGETS[module.key];
  if (explicit) return explicit;

  if (module.domain?.startsWith("http")) return module.domain;
  if (module.domain) return `https://${module.domain}`;

  return "";
}

export function buildModuleEntryUrl(baseUrl, tenant, module){
  if (!baseUrl) return "";

  const url = new URL(baseUrl, window.location.origin);

  url.searchParams.set("tenant", tenant.tenantId || "");
  url.searchParams.set("tenant_name", tenant.name || "");
  url.searchParams.set("module", module.key || "");
  url.searchParams.set("role", module.roleKey || "");
  url.searchParams.set("access", module.accessLevel || "");

  return url.toString();
}