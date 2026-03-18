import { $, mountHTML } from "../../utils/dom.js";
import { signIn, requestPasswordReset } from "../../services/auth/auth.js";

export async function renderLogin(root, router){
  const html = await fetch("./pages/login/login.html").then(r => r.text());
  mountHTML(root, html);

  const form     = $("#loginForm");
  const email    = $("#email");
  const password = $("#password");

  const btnForgot = document.getElementById("btnForgot");

  // PWA buttons
  const btnInstall      = document.getElementById("btnInstall");
  const btnHowInstall   = document.getElementById("btnHowInstall");
  const btnHowInstallIOS= document.getElementById("btnHowInstallIOS");

  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (btnInstall) btnInstall.disabled = false;
  });

  if (btnInstall){
    btnInstall.disabled = true;
    btnInstall.addEventListener("click", async () => {
      if (!deferredPrompt){
        alert("Instalação automática não disponível agora. No Android/PC: menu ⋮ do navegador → “Instalar app”.");
        return;
      }
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      btnInstall.disabled = true;
    });
  }

  if (btnHowInstall){
    btnHowInstall.addEventListener("click", () => {
      alert("Android/PC: procure o botão “Instalar” no navegador ou abra o menu ⋮ e escolha “Instalar app / Instalar Catrion”.");
    });
  }

  if (btnHowInstallIOS){
    btnHowInstallIOS.addEventListener("click", () => {
      alert("iPhone (iOS): Safari → Compartilhar → “Adicionar à Tela de Início”.");
    });
  }

  // ✅ Agora sim: o botão existe porque o HTML já foi montado.
  if (btnForgot){
    btnForgot.addEventListener("click", async (e) => {
      e.preventDefault();

      const emailVal = (email.value || "").trim();
      if (!emailVal){
        alert("Digite seu e-mail primeiro.");
        return;
      }

      try{
        await requestPasswordReset(emailVal);
        alert("Enviei um e-mail de recuperação (se existir uma conta com esse e-mail).");
      }catch(err){
        console.error(err);
        alert(err?.message || "Não foi possível solicitar recuperação de senha.");
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailVal = (email.value || "").trim();
    const passVal  = (password?.value || "").trim();

    try{
      await signIn(emailVal, passVal);
      router.go("/tenant");
    }catch(err){
      console.error(err);
      alert(err?.message || "Não foi possível entrar.");
    }
  });
}