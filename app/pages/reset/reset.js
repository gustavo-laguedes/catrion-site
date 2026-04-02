import { $, mountHTML } from "../../utils/dom.js";
import { updatePassword, getSession } from "../../services/auth/auth.js";

export async function renderReset(root, router){
  const html = await fetch("./pages/reset/reset.html").then(r => r.text());
  mountHTML(root, html);

  const form = $("#resetForm");
  const newPassword = $("#newPassword");
  const confirmPassword = $("#confirmPassword");
  const btnBack = $("#btnBackLogin");
  const btnSave = $("#btnSavePassword");
  const resetHint = $("#resetHint");
  const resetSessionInfo = $("#resetSessionInfo");

  const session = await getSession();

  if (!session && resetSessionInfo) {
    resetSessionInfo.textContent = "Abra esta tela pelo link recebido no e-mail de recuperação.";
  }

  btnBack.addEventListener("click", ()=>router.go("/login"));

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();

    const pass1 = (newPassword.value || "").trim();
    const pass2 = (confirmPassword.value || "").trim();

    if (pass1.length < 8){
      alert("A nova senha precisa ter pelo menos 8 caracteres.");
      newPassword.focus();
      return;
    }

    if (pass1 !== pass2){
      alert("A confirmação da senha não confere.");
      confirmPassword.focus();
      return;
    }

    try{
      btnSave.disabled = true;
      if (resetHint) {
        resetHint.textContent = "Salvando nova senha...";
      }

      await updatePassword(pass1);

      alert("Senha atualizada com sucesso. Agora faça login.");
      router.go("/login");
    }catch(err){
      console.error(err);
      alert(err?.message || "Não foi possível atualizar a senha.");
    }finally{
      btnSave.disabled = false;
      if (resetHint) {
        resetHint.textContent = "Use pelo menos 8 caracteres.";
      }
    }
  });
}