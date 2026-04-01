const KEY = "catrion_portal_v2";
const SHARED_DEVPANEL_SESSION_KEY = "catrion.portal.session";
const REDIRECT_KEY = "catrion.portal.redirect";

export function readStore(){
  try{
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  }catch{
    return {};
  }
}

export function writeStore(obj){
  localStorage.setItem(KEY, JSON.stringify(obj || {}));
}

export function clearPortalSelections(){
  const s = readStore();
  delete s.selectedTenant;
  delete s.selectedModule;
  delete s.portalAccess;
  writeStore(s);
}

export function setPendingRedirect(url){
  if (!url) return;
  sessionStorage.setItem(REDIRECT_KEY, url);
}

export function getPendingRedirect(){
  return sessionStorage.getItem(REDIRECT_KEY) || "";
}

export function clearPendingRedirect(){
  sessionStorage.removeItem(REDIRECT_KEY);
}

export function saveSharedDevPanelSession(payload){
  localStorage.setItem(SHARED_DEVPANEL_SESSION_KEY, JSON.stringify(payload || {}));
}

export function clearSharedDevPanelSession(){
  localStorage.removeItem(SHARED_DEVPANEL_SESSION_KEY);
}