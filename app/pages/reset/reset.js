import { $, mountHTML } from "../../utils/dom.js";
import { updatePassword, getSession } from "../../services/auth/auth.js";

async function waitForRecoverySession(timeoutMs = 4000, intervalMs = 200) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const session = await getSession();
    if (session) {
      return session;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return null;
}

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

  btnBack.addEventListener("click", ()=>router.go("/login"));

  if (btnSave) {
    btnSave.disabled = true;
  }

  if (resetHint) {
    resetHint.textContent = "Validando link de recuperação...";
  }

  const session = await waitForRecoverySession();

  if (!session) {
    if (resetSessionInfo) {
      resetSessionInfo.textContent = "Link inválido, expirado ou aberto fora do fluxo de recuperação.";
    }

    if (resetHint) {
      resetHint.textContent = "Solicite um novo e-mail de recuperação.";
    }

    return;
  }

  if (resetSessionInfo) {
    resetSessionInfo.textContent = "Sessão de recuperação validada. Agora defina sua nova senha.";
  }

  if (resetHint) {
    resetHint.textContent = "Use pelo menos 8 caracteres.";
  }

  if (btnSave) {
    btnSave.disabled = false;
  }

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