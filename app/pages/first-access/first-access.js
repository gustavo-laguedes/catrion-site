import { $, mountHTML } from "../../utils/dom.js";
import { getSession, updatePassword, signOut } from "../../services/auth/auth.js";
import { updateProfileBasics } from "../../services/tenants/tenants.js";

function onlyDigits(value){
  return String(value || "").replace(/\D/g, "");
}

function formatPhone(value){
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export async function renderFirstAccess(root, router){
  const html = await fetch("./pages/first-access/first-access.html").then(r => r.text());
  mountHTML(root, html);

  const form = $("#firstAccessForm");
  const name = $("#firstAccessName");
  const phone = $("#firstAccessPhone");
  const password = $("#firstAccessPassword");
  const passwordConfirm = $("#firstAccessPasswordConfirm");
  const hint = $("#firstAccessHint");
  const btnSave = $("#btnSaveFirstAccess");
  const btnBack = $("#btnBackToLoginFromFirstAccess");

  const session = await getSession();

  if (!session?.user?.email) {
    alert("Abra esta tela pelo link de primeiro acesso.");
    router.go("/login");
    return;
  }

  phone.addEventListener("input", () => {
    phone.value = formatPhone(phone.value);
  });

  btnBack.addEventListener("click", async () => {
    try {
      await signOut();
    } catch (_) {
    }
    router.go("/login");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = String(name.value || "").trim();
    const phoneValue = String(phone.value || "").trim();
    const pass1 = String(password.value || "").trim();
    const pass2 = String(passwordConfirm.value || "").trim();

    if (!fullName) {
      alert("Digite seu nome completo.");
      name.focus();
      return;
    }

    if (pass1.length < 8) {
      alert("A senha precisa ter pelo menos 8 caracteres.");
      password.focus();
      return;
    }

    if (pass1 !== pass2) {
      alert("A confirmação da senha não confere.");
      passwordConfirm.focus();
      return;
    }

    try {
      btnSave.disabled = true;
      if (hint) hint.textContent = "Salvando seu primeiro acesso...";

      await updatePassword(pass1);
      await updateProfileBasics({
        fullName,
        phone: phoneValue
      });

      alert("Primeiro acesso concluído com sucesso. Faça login.");
      await signOut();
      router.go("/login");
    } catch (error) {
      console.error(error);
      alert(error?.message || "Não foi possível concluir o primeiro acesso.");
    } finally {
      btnSave.disabled = false;
      if (hint) hint.textContent = "Preencha seus dados e use pelo menos 8 caracteres na senha.";
    }
  });
}