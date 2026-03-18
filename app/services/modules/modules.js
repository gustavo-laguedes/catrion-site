import { readStore, writeStore } from "../../utils/storage.js";

const DEFAULT = { core: true, gate: false, line: false };

export function getTenantModules(tenantId){
  const s = readStore();
  const map = s.tenantModules || {};
  return map[tenantId] || DEFAULT;
}

export function setTenantModules(tenantId, mods){
  const s = readStore();
  s.tenantModules = s.tenantModules || {};
  s.tenantModules[tenantId] = mods;
  writeStore(s);
}