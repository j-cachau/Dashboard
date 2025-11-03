// src/utils.js
const $ = (sel)=> document.querySelector(sel);
const fmt = (n)=> Number(n||0).toLocaleString('es-AR');

// Duración -> segundos
function parseDurationToSeconds(s){
  if (!s) return 0;
  s = String(s).toLowerCase();
  const mm = s.match(/(\d+(?:[.,]\d+)?)\s*min/);
  const ss = s.match(/(\d+(?:[.,]\d+)?)\s*s/);
  const m = mm ? parseFloat(String(mm[1]).replace(',', '.')) : 0;
  const sec = ss ? parseFloat(String(ss[1]).replace(',', '.')) : 0;
  return Math.round(m * 60 + sec);
}
// segundos -> mm:ss | hh:mm:ss
function formatSecondsBrief(total){
  total = Math.max(0, Math.round(total||0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const two = (n)=> String(n).padStart(2,'0');
  return h ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`;
}
// Parser flexible de fechas
function parseDateFlex(v, prefer='mdy'){
  if (!v) return null;
  const s = String(v).trim();
  let m = s.match(/^(\d{4})[/-](\d{2})[/-](\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) return new Date(+m[1], +m[2]-1, +m[3], +(m[4]||0), +(m[5]||0), +(m[6]||0));
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    let a=+m[1], b=+m[2], day, month;
    if (a>12 && b<=12){ day=a; month=b; }
    else if (b>12 && a<=12){ month=a; day=b; }
    else if (prefer==='dmy'){ day=a; month=b; }
    else { month=a; day=b; }
    return new Date(+m[3], month-1, day, +(m[4]||0), +(m[5]||0), +(m[6]||0));
  }
  const d = new Date(s);
  return isNaN(d) ? null : d;
}
const daysAgo = (d,n)=>{
  if (!(d instanceof Date)) return false;
  const cut = new Date(); cut.setHours(0,0,0,0); cut.setDate(cut.getDate()-n);
  return d >= cut;
};
const groupCount = (arr, key)=> arr.reduce((acc, it)=>{
  const k = (typeof key === 'function') ? key(it) : (it[key] ?? 'Sin dato');
  acc[k] = (acc[k]||0) + 1;
  return acc;
}, {});
// Etiquetas largas
function shortenLabel(s, max=36){
  s = String(s||''); if (s.length<=max) return s;
  const cut = s.lastIndexOf(' ', max-1);
  return (cut>15? s.slice(0,cut): s.slice(0,max-1)) + '…';
}
// Éxito llamada
function isSuccessCall(row){
  const cl = CONFIG.COLS_LLAM;
  const raw = (row?.[cl.resultado] ?? '').toString();
  const v = raw.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();
  return v === 'la llamada tuvo exito' || (v.startsWith('la llamada tuvo') && v.includes('exito'));
}

// --- CSV helpers ---
export function toCSV(rows, headersOrder) {
  if (!rows?.length) return '';
  const head = headersOrder || Object.keys(rows[0]);
  const escape = (v) => {
    const s = (v ?? '').toString();
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [];
  lines.push(head.map(escape).join(';'));
  for (const r of rows) lines.push(head.map(h => escape(r[h])).join(';'));
  return lines.join('\n');
}
export function downloadFile(filename, content, mime='text/csv;charset=utf-8') {
  const blob = new Blob([content], {type:mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(()=> URL.revokeObjectURL(url), 2000);
}

