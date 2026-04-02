import { $, mountHTML } from "../../utils/dom.js";
import { signIn, requestPasswordReset } from "../../services/auth/auth.js";
import {
  clearPortalSelections,
  setPendingRedirect,
  getPendingRedirect,
  clearPendingRedirect
} from "../../utils/storage.js";
import { getAccessContext } from "../../services/tenants/tenants.js";
import { supabase } from "../../services/supabase/supabaseClient.js";

export async function renderLogin(root, router){
  const html = await fetch("./pages/login/login.html").then(r => r.text());
  mountHTML(root, html);

    const redirectTarget = getRedirectFromUrl();
  if (redirectTarget) {
    setPendingRedirect(redirectTarget);
  }

  const form = $("#loginForm");
  const email = $("#email");
  const password = $("#password");
  const btnForgot = document.getElementById("btnForgot");

  const btnInstall = document.getElementById("btnInstall");
  const btnHowInstall = document.getElementById("btnHowInstall");
  const btnHowInstallIOS = document.getElementById("btnHowInstallIOS");

  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  console.log("PWA disponível para instalação");

  if (btnInstall){
    btnInstall.style.opacity = "1";
    btnInstall.style.pointerEvents = "auto";
  }
});

  if (btnInstall){
  btnInstall.addEventListener("click", async () => {
    if (!deferredPrompt){
      alert("Instalação não disponível automaticamente.\n\nNo Android/PC:\nMenu do navegador → Instalar app.");
      return;
    }

    try {
      deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;
      console.log("PWA install result:", choice.outcome);

    } catch (err) {
      console.error("Erro ao instalar:", err);
    } finally {
      deferredPrompt = null;
    }
  });
}
  
  if (btnHowInstall){
    btnHowInstall.addEventListener("click", () => {
      alert("Android/PC: procure o botão “Instalar” no navegador ou abra o menu e escolha “Instalar app”.");
    });
  }

  if (btnHowInstallIOS){
    btnHowInstallIOS.addEventListener("click", () => {
      alert("iPhone (iOS): Safari → Compartilhar → Adicionar à Tela de Início.");
    });
  }

    if (btnForgot){
    btnForgot.addEventListener("click", async (e) => {
      e.preventDefault();

      const emailVal = (email.value || "").trim();
      if (!emailVal){
        alert("Digite seu e-mail primeiro.");
        email.focus();
        return;
      }

      try{
        btnForgot.style.pointerEvents = "none";
        btnForgot.style.opacity = "0.6";

        await requestPasswordReset(emailVal);

        alert("Se existir uma conta com esse e-mail, enviamos o link de recuperação de senha.");
      }catch(err){
        console.error(err);
        alert(err?.message || "Não foi possível solicitar recuperação de senha.");
      }finally{
        btnForgot.style.pointerEvents = "";
        btnForgot.style.opacity = "";
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailVal = (email.value || "").trim();
    const passVal = (password?.value || "").trim();

    try{
            await signIn(emailVal, passVal);

      clearPortalSelections();
      await getAccessContext(true);

      const redirectTarget = resolvePostLoginRedirect();

      if (redirectTarget) {
  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();

  if (refreshError) {
    console.warn("[login] refreshSession falhou antes do redirect para o Dev Panel.", refreshError);
  }

  const accessToken = refreshed?.session?.access_token || "";
  const refreshToken = refreshed?.session?.refresh_token || "";

  if (accessToken && refreshToken) {
    const url = new URL(redirectTarget);

    url.searchParams.set("access_token", accessToken);
    url.searchParams.set("refresh_token", refreshToken);

    clearPendingRedirect();
    window.location.href = url.toString();
    return;
  }
}

      router.go("/tenant");
    }catch(err){
      console.error(err);
      alert(err?.message || "Não foi possível entrar.");
    }
  });
}

function getRedirectFromUrl(){
  const searchRedirect = new URLSearchParams(window.location.search).get("redirect");
  if (searchRedirect) return searchRedirect;

  const hash = window.location.hash || "";
  const queryIndex = hash.indexOf("?");
  if (queryIndex === -1) return "";

  const query = hash.slice(queryIndex + 1);
  return new URLSearchParams(query).get("redirect") || "";
}

function resolvePostLoginRedirect(){
  return getPendingRedirect() || getRedirectFromUrl() || "";
}