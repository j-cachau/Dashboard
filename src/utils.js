import { CONFIG } from './config.js';

// src/utils.js  (ESM)

export const $   = (sel) => document.querySelector(sel);
export const fmt = (n)  => Number(n ?? 0).toLocaleString('es-AR');

// ---------------------- Fechas ----------------------

/**
 * Parser de fecha flexible.
 * Soporta: yyyy-mm-dd, dd/mm/yyyy, mm/dd/yyyy con hora opcional.
 * @param {string} v
 * @param {'dmy'|'mdy'} prefer  Qué asumir cuando a/b <= 12. Default 'mdy'.
 */
export function parseDateFlex(v, prefer = 'mdy') {
  if (!v) return null;
  const s = String(v).trim();

  // ISO: 2025-10-31 23:08 o 2025/10/31
  let m = s.match(/^(\d{4})[/-](\d{2})[/-](\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) return new Date(+m[1], +m[2]-1, +m[3], +(m[4]||0), +(m[5]||0), +(m[6]||0));

  // Barras: dd/mm/yyyy o mm/dd/yyyy (+hora opcional)
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    let a = +m[1], b = +m[2];
    let day, month;
    if (a > 12 && b <= 12)      { day = a; month = b; }
    else if (b > 12 && a <= 12) { month = a; day = b; }
    else if (prefer === 'dmy')  { day = a; month = b; }
    else                        { month = a; day = b; }
    return new Date(+m[3], month-1, day, +(m[4]||0), +(m[5]||0), +(m[6]||0));
  }

  const d = new Date(s);
  return isNaN(d) ? null : d;
}

export function daysAgo(d, n) {
  if (!(d instanceof Date)) return false;
  const cut = new Date();
  cut.setHours(0,0,0,0);
  cut.setDate(cut.getDate() - n);
  return d >= cut;
}

// ---------------------- Duraciones ----------------------

/** "6 min, 2 s" | "53 s" | "9 min" -> segundos */
export function parseDurationToSeconds(s) {
  if (!s) return 0;
  s = String(s).toLowerCase();
  const mm = s.match(/(\d+(?:[.,]\d+)?)\s*min/);
  const ss = s.match(/(\d+(?:[.,]\d+)?)\s*s/);
  const m = mm ? parseFloat(String(mm[1]).replace(',', '.')) : 0;
  const sec = ss ? parseFloat(String(ss[1]).replace(',', '.')) : 0;
  return Math.round(m * 60 + sec);
}

/** 125 -> "2:05" | 3671 -> "1:01:11" */
export function formatSecondsBrief(total) {
  total = Math.max(0, Math.round(total||0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const two = (n)=> String(n).padStart(2,'0');
  return h ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`;
}

// ---------------------- Otras helpers ----------------------

export function groupCount(arr, key) {
  return arr.reduce((acc, it)=>{
    const k = (typeof key === 'function') ? key(it) : (it[key] ?? 'Sin dato');
    acc[k] = (acc[k]||0) + 1;
    return acc;
  }, {});
}

export function shortenLabel(s, max = 36) {
  s = String(s || '');
  if (s.length <= max) return s;
  const cut = s.lastIndexOf(' ', max - 1);
  return (cut > 15 ? s.slice(0, cut) : s.slice(0, max - 1)) + '…';
}

// Plugin de Chart.js para dibujar valores al final de la barra
export const valueLabels = {
  id: 'valueLabels',
  afterDatasetsDraw(chart) {
    const {ctx} = chart;
    const ds = chart.data.datasets[0];
    const fmtVal = ds.valueLabelFormatter || ((v)=>v.toLocaleString('es-AR'));
    ctx.save();
    ctx.fillStyle = getComputedStyle(document.body).color;
    ctx.font = '12px system-ui, Segoe UI, Roboto, Arial';
    chart.getDatasetMeta(0).data.forEach((bar, i) => {
      const raw = ds.data[i];
      if (raw == null) return;
      ctx.fillText(fmtVal(raw), bar.x + 6, bar.y + 4);
    });
    ctx.restore();
  }
};

// === Descarga de archivos (CSV, etc.) ===
export function downloadFile(filename, content, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });

  // Fallback para IE/Edge heredados
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  // limpiar
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

