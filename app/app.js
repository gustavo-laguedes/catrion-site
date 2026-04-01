import { $, mountHTML } from "./utils/dom.js";
import { getSession, signOut, onAuthStateChange } from "./services/auth/auth.js";
import { getSelectedTenant } from "./services/tenants/tenants.js";
import { getPendingRedirect, clearPendingRedirect, setPendingRedirect } from "./utils/storage.js";

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
  const h = (location.hash || "#/login").replace(/^#/, "");
  return h.startsWith("/") ? h : ("/" + h);
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
        const accessToken = session?.access_token;
        const refreshToken = session?.refresh_token;

        if (accessToken && refreshToken) {
          const url = new URL(redirectTarget);

          url.searchParams.set("access_token", accessToken);
          url.searchParams.set("refresh_token", refreshToken);

          clearPendingRedirect();
          window.location.href = url.toString();
          return;
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

$("#btnLogout")?.addEventListener("click", async ()=>{
  await signOut();
  router.go("/login");
});

window.addEventListener("hashchange", ()=>router.render());

onAuthStateChange(()=>router.render());

router.render();