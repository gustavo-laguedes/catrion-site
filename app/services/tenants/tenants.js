import {
  readStore,
  writeStore,
  saveSharedDevPanelSession
} from "../../utils/storage.js";
import { getSession } from "../auth/auth.js";
import { supabase, SUPABASE_READY } from "../supabase/supabaseClient.js";

function saveAccessContext(access){
  const s = readStore();
  s.portalAccess = access;
  writeStore(s);
}

function saveSharedSessionForDevPanel(session, access){
  if (!session?.user?.id) return;

  const allowedModules = new Set();

  (access?.tenants || []).forEach((tenant) => {
    (tenant.modules || []).forEach((module) => {
      if (module.key) {
        allowedModules.add(module.key);
      }
    });
  });

  if (access?.profile?.isPlatformAdmin) {
    allowedModules.add("devpanel");
  }

  saveSharedDevPanelSession({
    user: {
      id: session.user.id || "",
      name: access?.profile?.fullName || session.user.user_metadata?.name || "Usuário",
      email: session.user.email || access?.profile?.email || ""
    },
    session: {
      access_token: session.access_token || "",
      refresh_token: session.refresh_token || ""
    },
    context: {
      active_tenant_id: access?.tenants?.[0]?.tenantId || "catrion",
      allowed_modules: Array.from(allowedModules),
      global_role: access?.profile?.isPlatformAdmin ? "admin_catrion" : ""
    }
  });
}

function normalizeTenantName(row){
  return row?.trade_name || row?.legal_name || "Empresa";
}

export async function getAccessContext(force = false){
  const store = readStore();

  if (!force && store.portalAccess) {
    return store.portalAccess;
  }

  // fallback temporário se o Supabase ainda não estiver configurado
  if (!SUPABASE_READY) {
    const fallback = {
      profile: {
        id: "mock-profile",
        fullName: "Gu",
        email: "demo@catrion.com.br"
      },
      tenants: [
        {
          id: "mock-tenant-1",
          tenantId: "clube-suplemento",
          name: "Clube do Suplemento",
          legalName: "Clube do Suplemento LTDA",
          status: "ativo",
          logoUrl: "",
          modules: [
            {
              key: "core",
              name: "Core",
              domain: "core.catrion.com.br",
              roleKey: "core_admin",
              roleName: "Administrador",
              accessLevel: "admin",
              isEnabled: true
            }
          ]
        }
      ]
    };

    saveAccessContext(fallback);
    return fallback;
  }

  const session = await getSession();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    const empty = { profile: null, tenants: [] };
    saveAccessContext(empty);
    return empty;
  }

    const { data: profile, error: profileError } = await supabase
    .from("dp_profiles")
    .select("id, full_name, email, is_platform_admin")
    .ilike("email", email)
    .maybeSingle();
  if (profileError) throw profileError;

  if (!profile) {
    const empty = { profile: null, tenants: [] };
    saveAccessContext(empty);
    return empty;
  }

  const { data: memberships, error: membershipsError } = await supabase
    .from("dp_memberships")
    .select(`
      id,
      membership_status,
      tenant_id,
      role_id,
      dp_tenants:tenant_id (
        id,
        tenant_id,
        trade_name,
        legal_name,
        status,
        logo_url
      ),
      dp_roles:role_id (
        role_key,
        role_name
      )
    `)
    .eq("user_id", profile.id)
    .eq("membership_status", "ativo")
    .order("created_at", { ascending: true });

  if (membershipsError) throw membershipsError;

  const membershipIds = (memberships || []).map((item) => item.id);

  let membershipModules = [];
  if (membershipIds.length) {
    const { data, error } = await supabase
      .from("dp_membership_modules")
      .select(`
        membership_id,
        access_level,
        is_enabled,
        module_id,
        dp_modules:module_id (
          module_key,
          module_name,
          system_domain,
          is_active
        )
      `)
      .in("membership_id", membershipIds)
      .eq("is_enabled", true);

    if (error) throw error;
    membershipModules = data || [];
  }

  const modulesByMembership = new Map();

  membershipModules.forEach((row) => {
    const current = modulesByMembership.get(row.membership_id) || [];
    current.push({
      key: row.dp_modules?.module_key || "",
      name: row.dp_modules?.module_name || "",
      domain: row.dp_modules?.system_domain || "",
      accessLevel: row.access_level || "leitura",
      isEnabled: row.is_enabled === true,
      isActive: row.dp_modules?.is_active === true
    });
    modulesByMembership.set(row.membership_id, current);
  });

  const tenantMap = new Map();

  (memberships || []).forEach((membership) => {
    const tenantRow = membership.dp_tenants;
    if (!tenantRow) return;

    const tenantKey = tenantRow.id;
    const current = tenantMap.get(tenantKey) || {
      id: tenantRow.id,
      tenantId: tenantRow.tenant_id,
      name: normalizeTenantName(tenantRow),
      legalName: tenantRow.legal_name || "",
      status: tenantRow.status || "ativo",
      logoUrl: tenantRow.logo_url || "",
      modules: []
    };

    const roleKey = membership.dp_roles?.role_key || "";
    const roleName = membership.dp_roles?.role_name || "Sem papel";
    const modules = modulesByMembership.get(membership.id) || [];

    modules.forEach((module) => {
      current.modules.push({
        ...module,
        roleKey,
        roleName
      });
    });

    tenantMap.set(tenantKey, current);
  });

    const access = {
    profile: {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      isPlatformAdmin: profile.is_platform_admin === true
    },
    tenants: Array.from(tenantMap.values())
  };

  saveAccessContext(access);
    saveSharedSessionForDevPanel(session, access);
  return access;
}

export async function listTenants(){
  const access = await getAccessContext();
  return access.tenants || [];
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