import {
  readStore,
  writeStore,
  clearSharedDevPanelSession,
  clearPendingRedirect,
  clearPortalSelections
} from "../../utils/storage.js";
import { supabase, SUPABASE_READY } from "../supabase/supabaseClient.js";

// ==========================================
// Auth (REAL via Supabase) + fallback mock
// ==========================================

// --- Mock fallback (pra não quebrar enquanto você não colar as keys)
function getMockSession(){
  const s = readStore();
  return s.session || null;
}

function setMockSession(session){
  const s = readStore();
  s.session = session;
  writeStore(s);
}

function clearMockSession(){
  const s = readStore();
  delete s.session;
  writeStore(s);
}

// --- API pública

export async function getSession(){
  if(!SUPABASE_READY) return getMockSession();
  const { data, error } = await supabase.auth.getSession();
  if(error) {
    console.warn("[auth.getSession]", error);
    return null;
  }
  return data.session || null;
}

export async function signIn(email, password){
  if(!SUPABASE_READY){
    // mock
    const session = {
      user: { id: "mock-user-1", email: email || "demo@catrion.com.br", name: "Gu" },
      created_at: Date.now()
    };
    setMockSession(session);
    return session;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: (email || "").trim(),
    password: (password || "").trim(),
  });

  if(error) throw error;
  return data.session;
}

export async function signOut(options = {}){
  const preserveRedirect = options.preserveRedirect === true;
  const redirectSnapshot = preserveRedirect ? sessionStorage.getItem("catrion.portal.redirect") || "" : "";

  clearSharedDevPanelSession();
  clearPortalSelections();

  if (!preserveRedirect) {
    clearPendingRedirect();
  }

  if(!SUPABASE_READY){
    clearMockSession();

    if (preserveRedirect && redirectSnapshot) {
      sessionStorage.setItem("catrion.portal.redirect", redirectSnapshot);
    }

    return;
  }

  const { error } = await supabase.auth.signOut();
  if(error) throw error;

  if (preserveRedirect && redirectSnapshot) {
    sessionStorage.setItem("catrion.portal.redirect", redirectSnapshot);
  }
}

export function onAuthStateChange(handler){
  if(!SUPABASE_READY) return { unsubscribe: ()=>{} };
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    handler?.(event, session);
  });
  return data;
}

export async function requestPasswordReset(email){
  if(!SUPABASE_READY){
    throw new Error("Supabase não configurado (SUPABASE_URL / SUPABASE_ANON_KEY).");
  }

  // Vai mandar o usuário voltar para o portal em #/reset
  const redirectTo = window.location.origin + window.location.pathname + "#/reset";

  const { error } = await supabase.auth.resetPasswordForEmail(
    (email || "").trim(),
    { redirectTo }
  );

  if(error) throw error;
}

export async function updatePassword(newPassword){
  if(!SUPABASE_READY){
    throw new Error("Supabase não configurado (SUPABASE_URL / SUPABASE_ANON_KEY).");
  }

  const password = (newPassword || "").trim();

  if (password.length < 8){
    throw new Error("A nova senha precisa ter pelo menos 8 caracteres.");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if(error) throw error;
}

export async function updateEmail(newEmail){
  if(!SUPABASE_READY){
    throw new Error("Supabase não configurado.");
  }

  const email = (newEmail || "").trim().toLowerCase();

  if (!email) {
    throw new Error("E-mail inválido.");
  }

  const { error } = await supabase.auth.updateUser({
    email
  });

  if(error) throw error;
}

export async function updateUserPassword(newPassword){
  return updatePassword(newPassword);
}