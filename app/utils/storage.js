const KEY = "catrion_portal_mock_v1";

export function readStore(){
  try{ return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch{ return {}; }
}

export function writeStore(obj){
  localStorage.setItem(KEY, JSON.stringify(obj || {}));
}