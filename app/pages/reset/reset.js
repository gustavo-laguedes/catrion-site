import { $, mountHTML } from "../../utils/dom.js";
import { updatePassword } from "../../services/auth/auth.js";

export async function renderReset(root, router){
  const html = await fetch("./pages/reset/reset.html").then(r=>r.text());
  mountHTML(root, html);

  const form = $("resetForm");
  const newPassword = $("newPassword");
  const btnBack = $("btnBackLogin");

  btnBack.addEventListener("click", ()=>router.go("/login"));

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    try{
      await updatePassword(newPassword.value);
      alert("Senha atualizada! Agora faça login.");
      router.go("/login");
    }catch(err){
      console.error(err);
      alert(err?.message || "Não foi possível atualizar a senha.");
    }
  });
}