import { $, mountHTML } from "./utils/dom.js";
import { getSession, signOut, onAuthStateChange } from "./services/auth/auth.js";
import { getSelectedTenant } from "./services/tenants/tenants.js";
import { getPendingRedirect, clearPendingRedirect, setPendingRedirect } from "./utils/storage.js";
import { getAccessContext } from "./services/tenants/tenants.js";


import { renderLogin } from "./pages/login/login.js";
import { renderTenant } from "./pages/tenant/tenant.js";
import { renderHub } from "./pages/hub/hub.js";
import { renderReset } from "./pages/reset/reset.js";

async function loadPageCSS(href){
  document.querySelectorAll("link[data-pagecss='1']").forEach(l=>l.remove());
  if(!href) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-pagecss", "1");
  document.head.appendChild(link);
}

const routes = {
  "/login":  { css: "./pages/login/login.css",  render: renderLogin },
  "/reset":  { css: "./pages/reset/reset.css",  render: renderReset },
  "/tenant": { css: "./pages/tenant/tenant.css", render: renderTenant },
  "/hub":    { css: "./pages/hub/hub.css",    render: renderHub },

  "/core": { css: null, render: (root, r)=>renderPlaceholder(root, r, "Core", "Aqui entra o Core real depois.") },
  "/gate": { css: null, render: (root, r)=>renderPlaceholder(root, r, "Gate", "Placeholder do módulo Gate.") },
  "/line": { css: null, render: (root, r)=>renderPlaceholder(root, r, "Line", "Placeholder do módulo Line.") },
};

function getHashPath(){
  const rawHash = location.hash || "";
  const hash = rawHash.replace(/^#/, "");

  if (!hash) {
    return "/login";
  }

  const isRecoveryHash =
    hash.startsWith("access_token=") ||
    hash.includes("type=recovery") ||
    hash.includes("refresh_token=");

  if (isRecoveryHash) {
    return "/reset";
  }

  const pathOnly = hash.split("?")[0];
  return pathOnly.startsWith("/") ? pathOnly : ("/" + pathOnly);
}

function getHashQueryParams(){
  const hash = (location.hash || "").replace(/^#/, "");
  const queryIndex = hash.indexOf("?");
  if (queryIndex === -1) return new URLSearchParams();

  return new URLSearchParams(hash.slice(queryIndex + 1));
}

function getRedirectTarget(){
  const searchRedirect = new URLSearchParams(window.location.search).get("redirect");
  if (searchRedirect) return searchRedirect;

  const hashRedirect = getHashQueryParams().get("redirect");
  if (hashRedirect) return hashRedirect;

  return getPendingRedirect() || "";
}

function hasLogoutRequest(){
  const search = new URLSearchParams(window.location.search);
  const hash = getHashQueryParams();

  return search.get("logout") === "1" || hash.get("logout") === "1";
}

function buildCleanLoginUrl(){
  const redirectTarget = getRedirectTarget();
  const base = `${window.location.origin}${window.location.pathname}#/login`;

  if (!redirectTarget) {
    return base;
  }

  return `${base}?redirect=${encodeURIComponent(redirectTarget)}`;
}

function setNavVisibility(isAuthed){
  $("#portalNav").style.display = isAuthed ? "flex" : "none";
  $("#portalNavAuth").style.display = isAuthed ? "none" : "flex";
}

async function renderProfileUI(){
  const profileNameEl = document.getElementById("profileName");
  const profileAvatarEl = document.getElementById("profileAvatar");

  try {
    const access = await getAccessContext();
    const name = access?.profile?.fullName || "Usuário";

    if (profileNameEl) {
      profileNameEl.textContent = name.split(" ")[0];
    }

    if (profileAvatarEl) {
      profileAvatarEl.textContent = name.charAt(0).toUpperCase();
    }
  } catch (e) {
    console.warn("Erro ao carregar perfil", e);
  }
}

function openProfileModal(){
  const existing = document.getElementById("profileModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "profileModal";

  modal.innerHTML = `
    <div class="modal">
      <h3>Meu perfil</h3>

      <div class="form">
  <label class="label">Nome</label>
  <input class="input" id="profileFullName" />

  <label class="label">Telefone</label>
  <input class="input" id="profilePhone" />

  <div style="height:8px;"></div>

  <label class="label">E-mail</label>
  <input class="input" id="profileEmail" />

  <label class="label">Nova senha</label>
  <input class="input" id="profilePassword" type="password" />

  <label class="label">Confirmar senha</label>
  <input class="input" id="profilePasswordConfirm" type="password" />
</div>

      <div class="modal-actions">
        <button class="btn btn-primary" id="btnSaveProfile">Salvar</button>
        <button class="btn" id="btnCloseProfile">Fechar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  bindProfileModal();
}

import { updateProfileBasics } from "./services/tenants/tenants.js";

async function bindProfileModal(){
  const nameInput = document.getElementById("profileFullName");
  const phoneInput = document.getElementById("profilePhone");
  const emailInput = document.getElementById("profileEmail");
const passwordInput = document.getElementById("profilePassword");
const passwordConfirmInput = document.getElementById("profilePasswordConfirm");

  const btnSave = document.getElementById("btnSaveProfile");
  const btnClose = document.getElementById("btnCloseProfile");

  const access = await getAccessContext();

  nameInput.value = access?.profile?.fullName || "";
  phoneInput.value = access?.profile?.phone || "";
  const session = await getSession();
emailInput.value = session?.user?.email || "";

  btnClose.onclick = () => {
    document.getElementById("profileModal")?.remove();
  };

  btnSave.onclick = async () => {
  const fullName = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();
  const confirm = passwordConfirmInput.value.trim();

  if (!fullName) {
    alert("Digite seu nome.");
    return;
  }

  let requiresLogout = false;

  try {
    btnSave.disabled = true;

    // atualizar perfil básico
    await updateProfileBasics({
      fullName,
      phone
    });

    // EMAIL
    if (email && email !== access?.profile?.email) {
      const { updateEmail } = await import("./services/auth/auth.js");
      await updateEmail(email);
      requiresLogout = true;
    }

    // SENHA
    if (password || confirm) {
      if (password.length < 8) {
        throw new Error("A senha deve ter pelo menos 8 caracteres.");
      }

      if (password !== confirm) {
        throw new Error("As senhas não conferem.");
      }

      const { updateUserPassword } = await import("./services/auth/auth.js");
      await updateUserPassword(password);
      requiresLogout = true;
    }

    if (requiresLogout) {
      alert("Dados atualizados. Faça login novamente.");
      await signOut();
      router.go("/login");
      return;
    }

    alert("Perfil atualizado com sucesso.");

    document.getElementById("profileModal")?.remove();
    renderProfileUI();

  } catch (err) {
    console.error(err);
    alert(err?.message || "Erro ao atualizar perfil.");
  } finally {
    btnSave.disabled = false;
  }
};
}

function renderPlaceholder(root, router, title, desc){
  const tenant = getSelectedTenant();
  root.innerHTML = `
    <div class="portal-shell">
      <div class="portal-header">
        <h2 class="portal-title">${title}</h2>
        <span class="badge">${tenant ? tenant.name : "sem tenant"}</span>
      </div>

      <div class="panel">
        <div class="panel-inner">
          <p class="notice">${desc}</p>
          <div style="height:12px"></div>
          <div class="row">
            <button class="btn btn-primary" id="backHub">Voltar ao Hub</button>
            <a class="btn" href="../index.html">Ir pro Site</a>
          </div>
        </div>
      </div>
    </div>
  `;
  $("#backHub").addEventListener("click", ()=>router.go("/hub"));
}

const router = {
  go(path){ location.hash = "#" + path; },

  async render(){
    const root = $("#appRoot");

    if (hasLogoutRequest()) {
      const redirectTarget = getRedirectTarget();

      if (redirectTarget) {
        setPendingRedirect(redirectTarget);
      }

      try {
        await signOut({ preserveRedirect: true });
      } catch (error) {
        console.warn("[portal] erro ao executar logout forçado", error);
      }

      window.history.replaceState({}, "", buildCleanLoginUrl());
    }

    const session = await getSession();

    setNavVisibility(!!session);
    if (session) {
  renderProfileUI();
}

    let path = getHashPath();
    if(!routes[path]) path = "/login";

        const isPublic = (path === "/login" || path === "/reset");

    if(!session && !isPublic){
      this.go("/login");
      return;
    }

    if (session && path === "/login") {
  const redirectTarget = getRedirectTarget();

  if (redirectTarget) {
    try {
      const { supabase } = await import("./services/supabase/supabaseClient.js");

      let accessToken = "";
      let refreshToken = "";

      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.warn("[portal] refreshSession falhou antes do redirect para o Dev Panel.", refreshError);
      }

      accessToken =
        refreshed?.session?.access_token ||
        session?.access_token ||
        "";

      refreshToken =
        refreshed?.session?.refresh_token ||
        session?.refresh_token ||
        "";

      if (accessToken && refreshToken) {
        const url = new URL(redirectTarget);

        url.searchParams.set("access_token", accessToken);
        url.searchParams.set("refresh_token", refreshToken);

        clearPendingRedirect();
        window.location.href = url.toString();
        return;
      }
    } catch (error) {
      console.warn("[portal] erro ao preparar redirect autenticado para o Dev Panel.", error);
    }

    clearPendingRedirect();
    window.location.href = redirectTarget;
    return;
  }

  this.go("/tenant");
  return;
}

    await loadPageCSS(routes[path].css);
    await routes[path].render(root, this);
  }
};

document.getElementById("btnProfile")?.addEventListener("click", openProfileModal);

$("#btnLogout")?.addEventListener("click", async ()=>{
  await signOut();
  router.go("/login");
});

window.addEventListener("hashchange", ()=>router.render());

onAuthStateChange((event) => {
  console.log("[AUTH EVENT]", event);

  if (event === "PASSWORD_RECOVERY") {
    console.log("🔐 Entrando em fluxo de recuperação de senha");
    window.location.hash = "/reset";
    return;
  }

  router.render();
});

router.render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/app/sw.js")
      .then(() => console.log("SW registrado"))
      .catch((err) => console.error("Erro SW:", err));
  });
}

let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const btn = document.getElementById("btnInstallApp");
  if (btn) btn.style.display = "inline-flex";
});

document.getElementById("btnInstallApp")?.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;
  console.log("Resultado instalação:", outcome);

  deferredPrompt = null;
});