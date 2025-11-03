import { CONFIG } from './config.js';
import { PROS, LLAM, RAW_PROS, RAW_LLAM, RANGE } from './state.js';


// src/data.js
function ensureConfig(){
  let ok = true;
  if(!CONFIG.CSV_PROSPECTOS_URL || CONFIG.CSV_PROSPECTOS_URL.startsWith('REEMPLAZA')) ok=false;
  if(!CONFIG.CSV_LLAMADOS_URL || CONFIG.CSV_LLAMADOS_URL.startsWith('REEMPLAZA')) ok=false;
  if(!ok) $('#configNotice').style.display='block';
  $('#logo').src = CONFIG.LOGO_URL || 'assets/logo.png';
}

function papaCsv(url){
  return new Promise((resolve,reject)=>{
    Papa.parse(url, {download:true, header:true, skipEmptyLines:true,
      complete:(res)=> resolve(res.data), error:reject
    });
  });
}

async function fetchLastModifiedFlexible(url){
  const u = url + (url.includes('?')?'&':'?') + 'cb=' + Date.now();
  try{
    const r = await fetch(u, {method:'HEAD', cache:'no-store'});
    const lm = r.headers.get('last-modified');
    if (lm){ const d = new Date(lm); if (!isNaN(d)) return d; }
  }catch{}
  try{
    const r = await fetch(u, {method:'GET', cache:'no-store'});
    const lm = r.headers.get('last-modified');
    if (lm){ const d = new Date(lm); if (!isNaN(d)) return d; }
  }catch{}
  return null;
}
