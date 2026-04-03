import { $, mountHTML } from "./utils/dom.js";
import { getSession, signOut, onAuthStateChange } from "./services/auth/auth.js";
import { getSelectedTenant } from "./services/tenants/tenants.js";
import { getPendingRedirect, clearPendingRedirect, setPendingRedirect } from "./utils/storage.js";
import { getAccessContext } from "./services/tenants/tenants.js";


import { renderLogin } from "./pages/login/login.js";
import { renderTenant } from "./pages/tenant/tenant.js";
import { renderHub } from "./pages/hub/hub.js";
import { renderReset } from "./pages/reset/reset.js";

// =========================
// RECOVERY MODE CONTROL
// =========================

const RECOVERY_MODE_KEY = "catrion_recovery_mode";

function isRecoveryMode() {
  return sessionStorage.getItem(RECOVERY_MODE_KEY) === "1";
}

function setRecoveryMode(value) {
  if (value) {
    sessionStorage.setItem(RECOVERY_MODE_KEY, "1");
    return;
  }

  sessionStorage.removeItem(RECOVERY_MODE_KEY);
}

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

function closeProfileModal(){
  document.getElementById("profileModal")?.remove();
}

function formatPhoneBR(value = "") {
  const digits = String(value).replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;

  return value;
}

function setProfileFormEditable(isEditable) {
  const ids = [
    "profileFullName",
    "profilePhone",
    "profileEmail",
    "profilePassword",
    "profilePasswordConfirm"
  ];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = !isEditable;
  });

  const btnSave = document.getElementById("btnSaveProfile");
  const btnEdit = document.getElementById("btnEditProfile");
  const btnChoosePhoto = document.getElementById("btnChooseProfileAvatar");
  const btnRemovePhoto = document.getElementById("btnRemoveProfileAvatar");

  if (btnSave) btnSave.disabled = !isEditable;
  if (btnChoosePhoto) btnChoosePhoto.disabled = !isEditable;
  if (btnRemovePhoto) btnRemovePhoto.disabled = !isEditable;

  if (btnEdit) {
    btnEdit.textContent = isEditable ? "Editando..." : "Editar informações";
    btnEdit.disabled = isEditable;
  }
}

function syncTopbar(routePath){
  const backBtn = document.getElementById("btnBackToTenants");
  const tenantBadge = document.getElementById("topbarTenantBadge");
  const tenant = getSelectedTenant();

  if (!backBtn || !tenantBadge) return;

  const shouldShowHubTools = routePath === "/hub" && !!tenant;

  backBtn.style.display = shouldShowHubTools ? "inline-flex" : "none";
  tenantBadge.style.display = shouldShowHubTools ? "inline-flex" : "none";
  tenantBadge.textContent = tenant?.name || "Empresa";
}

async function renderProfileUI(){
  const profileNameEl = document.getElementById("profileName");
  const profileAvatarEl = document.getElementById("profileAvatar");

  try {
    const access = await getAccessContext(true);
    const fullName = access?.profile?.fullName || "Usuário";
    const avatarUrl = access?.profile?.avatarUrl || "";

    if (profileNameEl) {
      profileNameEl.textContent = fullName;
    }

    if (profileAvatarEl) {
      if (avatarUrl) {
        profileAvatarEl.innerHTML = `<img src="${avatarUrl}" alt="avatar do usuário" class="profile-avatar-image" />`;
      } else {
        profileAvatarEl.textContent = fullName.charAt(0).toUpperCase();
      }
    }
  } catch (e) {
    console.warn("Erro ao carregar perfil", e);
  }
}

function openProfileModal(){
  const existing = document.getElementById("profileModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.className = "profile-modal-overlay";
  modal.id = "profileModal";

  modal.innerHTML = `
    <div class="profile-modal-card">
      <div class="profile-modal-head">
        <h3 class="profile-modal-title">Meu perfil</h3>
        <button class="btn" id="btnCloseProfile" type="button">Fechar</button>
      </div>

      <div class="profile-avatar-section">
        <div class="profile-avatar profile-avatar-xl" id="profileModalAvatarPreview">U</div>

        <div class="profile-avatar-actions">
          <input
            id="profileAvatarFile"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            style="display:none;"
          />
          <button class="btn" id="btnChooseProfileAvatar" type="button" disabled>Escolher foto</button>
          <button class="btn" id="btnRemoveProfileAvatar" type="button" disabled>Remover foto</button>
          <div class="small" id="profileAvatarFileName">Nenhum arquivo escolhido</div>
        </div>
      </div>

      <div class="profile-form-grid">
        <label class="label">Nome completo</label>
        <input class="input" id="profileFullName" disabled />

        <label class="label">Telefone</label>
        <input class="input" id="profilePhone" maxlength="15" disabled />

        <label class="label">E-mail</label>
        <input class="input" id="profileEmail" disabled />

        <label class="label">Nova senha</label>
        <input class="input" id="profilePassword" type="password" disabled />

        <label class="label">Confirmar senha</label>
        <input class="input" id="profilePasswordConfirm" type="password" disabled />
      </div>

      <div class="profile-modal-actions">
        <button class="btn" id="btnEditProfile" type="button">Editar informações</button>
        <button class="btn btn-primary" id="btnSaveProfile" type="button" disabled>Salvar</button>
      </div>
    </div>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });

  document.body.appendChild(modal);

  bindProfileModal();
}


import { updateProfileBasics, getAccessContext as refreshAccessContext } from "./services/tenants/tenants.js";

async function bindProfileModal(){
  const nameInput = document.getElementById("profileFullName");
  const phoneInput = document.getElementById("profilePhone");
  const emailInput = document.getElementById("profileEmail");
  const passwordInput = document.getElementById("profilePassword");
  const passwordConfirmInput = document.getElementById("profilePasswordConfirm");

  const btnSave = document.getElementById("btnSaveProfile");
  const btnClose = document.getElementById("btnCloseProfile");
  const btnEdit = document.getElementById("btnEditProfile");

  const avatarPreview = document.getElementById("profileModalAvatarPreview");
  const avatarFileInput = document.getElementById("profileAvatarFile");
  const btnChooseAvatar = document.getElementById("btnChooseProfileAvatar");
  const btnRemoveAvatar = document.getElementById("btnRemoveProfileAvatar");
  const avatarFileName = document.getElementById("profileAvatarFileName");

  const access = await refreshAccessContext(true);
  const profile = access?.profile || {};
  const session = await getSession();

  let currentAvatarUrl = profile.avatarUrl || "";
  let avatarFile = null;
  let removeAvatar = false;

  nameInput.value = profile.fullName || "";
  phoneInput.value = formatPhoneBR(profile.phone || "");
  emailInput.value = session?.user?.email || profile.email || "";

  if (avatarPreview) {
    if (currentAvatarUrl) {
      avatarPreview.innerHTML = `<img src="${currentAvatarUrl}" alt="avatar atual" class="profile-avatar-image" />`;
    } else {
      avatarPreview.textContent = (profile.fullName || "U").charAt(0).toUpperCase();
    }
  }

  setProfileFormEditable(false);

  btnClose.onclick = () => {
    closeProfileModal();
  };

  btnEdit.onclick = () => {
    setProfileFormEditable(true);
  };

  phoneInput.addEventListener("input", () => {
    phoneInput.value = formatPhoneBR(phoneInput.value);
  });

  btnChooseAvatar?.addEventListener("click", () => {
    avatarFileInput?.click();
  });

  avatarFileInput?.addEventListener("change", () => {
    const file = avatarFileInput.files?.[0] || null;
    avatarFile = file;
    removeAvatar = false;

    avatarFileName.textContent = file ? file.name : "Nenhum arquivo escolhido";

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.innerHTML = `<img src="${reader.result}" alt="prévia do avatar" class="profile-avatar-image" />`;
    };
    reader.readAsDataURL(file);
  });

  btnRemoveAvatar?.addEventListener("click", () => {
    avatarFile = null;
    removeAvatar = true;
    if (avatarFileInput) avatarFileInput.value = "";
    if (avatarFileName) avatarFileName.textContent = "Nenhum arquivo escolhido";
    if (avatarPreview) {
      avatarPreview.textContent = (nameInput.value || "U").charAt(0).toUpperCase();
    }
  });

  btnSave.onclick = async () => {
    const fullName = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();
    const confirm = passwordConfirmInput.value.trim();

    if (!fullName) {
      alert("Digite seu nome completo.");
      return;
    }

    let requiresLogout = false;

    try {
      btnSave.disabled = true;
      btnEdit.disabled = true;

      let finalAvatarUrl = currentAvatarUrl;

      const { supabase } = await import("./services/supabase/supabaseClient.js");

      if (removeAvatar && currentAvatarUrl) {
        try {
          const url = new URL(currentAvatarUrl);
          const marker = "/storage/v1/object/public/user-avatars/";
          const idx = url.pathname.indexOf(marker);

          if (idx !== -1) {
            const objectPath = decodeURIComponent(url.pathname.slice(idx + marker.length));
            await supabase.storage.from("user-avatars").remove([objectPath]);
          }
        } catch (error) {
          console.warn("Não foi possível remover avatar anterior.", error);
        }

        finalAvatarUrl = "";
      }

      if (avatarFile) {
        if (currentAvatarUrl) {
          try {
            const url = new URL(currentAvatarUrl);
            const marker = "/storage/v1/object/public/user-avatars/";
            const idx = url.pathname.indexOf(marker);

            if (idx !== -1) {
              const objectPath = decodeURIComponent(url.pathname.slice(idx + marker.length));
              await supabase.storage.from("user-avatars").remove([objectPath]);
            }
          } catch (error) {
            console.warn("Não foi possível remover avatar anterior.", error);
          }
        }

        const ext = (avatarFile.name.split(".").pop() || "png").toLowerCase();
        const filePath = `users/${profile.id}/${profile.id}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("user-avatars")
          .upload(filePath, avatarFile, {
            upsert: true,
            cacheControl: "3600"
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicData } = supabase.storage
          .from("user-avatars")
          .getPublicUrl(filePath);

        finalAvatarUrl = publicData?.publicUrl || "";
      }

      await updateProfileBasics({
        fullName,
        phone,
        avatarUrl: finalAvatarUrl
      });

      if (email && email !== (profile.email || "").toLowerCase()) {
        const { updateEmail } = await import("./services/auth/auth.js");
        await updateEmail(email);
        requiresLogout = true;
      }

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
        closeProfileModal();
        await signOut();
        router.go("/login");
        return;
      }

      alert("Perfil atualizado com sucesso.");

      closeProfileModal();
      await renderProfileUI();

    } catch (err) {
      console.error(err);
      alert(err?.message || "Erro ao atualizar perfil.");
      setProfileFormEditable(true);
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

    syncTopbar(path);

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

document.getElementById("btnBackToTenants")?.addEventListener("click", () => {
  router.go("/tenant");
});

$("#btnLogout")?.addEventListener("click", async ()=>{
  closeProfileModal();
  setRecoveryMode(false);
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