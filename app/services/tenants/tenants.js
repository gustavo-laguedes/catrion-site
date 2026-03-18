import { readStore, writeStore } from "../../utils/storage.js";

const MOCK_TENANTS = [
  { id: "t1", name: "Clube do Suplemento" },
  { id: "t2", name: "Aço-Fer (Demo)" },
];

export async function listTenants(){
  return MOCK_TENANTS;
}

export function getSelectedTenant(){
  const s = readStore();
  return s.selectedTenant || null;
}

export function setSelectedTenant(tenant){
  const s = readStore();
  s.selectedTenant = tenant;
  writeStore(s);
}