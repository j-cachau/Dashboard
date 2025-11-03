// src/charts.js
import { CONFIG } from './config.js';
import { PROS, LLAM } from './state.js';
import { groupCount, isSuccessCall, shortenLabel, formatSecondsBrief, parseDurationToSeconds } from './charts_utils.js';
import { getFiltered } from './filters.js';
import { parseDateFlex, classifyCall, isInbound } from './utils.js';


let chartEstados, chartOperador, chartCompanias, chartDuracion;

export function renderCharts(){
  const c  = CONFIG.COLS_PROS, cl = CONFIG.COLS_LLAM;

  const estados  = groupCount(PROS, p => p[c.estado] || 'Sin estado');
  const entriesE = Object.entries(estados).sort((a,b)=> b[1]-a[1]).slice(0,10);
  const labelsE  = entriesE.map(([k]) => k);
  const dataE    = entriesE.map(([,v]) => v);

  const llamOK = LLAM.filter(isSuccessCall);
  const porOper = groupCount(llamOK, l => l[cl.operador] || 'Sin operador');
  const entriesO= Object.entries(porOper).sort((a,b)=> b[1]-a[1]);
  const labelsO = entriesO.map(([k]) => k);
  const dataO   = entriesO.map(([,v]) => v);

  const companias = groupCount(PROS, p => p[c.compania] || 'Sin compañía');
  const entriesC  = Object.entries(companias).sort((a,b)=> b[1]-a[1]).slice(0,10);
  const labelsC   = entriesC.map(([k]) => k);
  const dataC     = entriesC.map(([,v]) => v);

  const H = (n)=> !n?160: (n<=6?220: Math.min(320, 22*n+80));

  const elE = document.getElementById('chartEstados');
  const elO = document.getElementById('chartOperador');
  const elC = document.getElementById('chartCompanias');
  if(!elE || !elO || !elC) return;

  //elE.style.height = H(labelsE.length)+'px';
  //elO.style.height = H(labelsO.length)+'px';
  //elC.style.height = H(labelsC.length)+'px';

  const ctxE = elE.getContext('2d');
  const ctxO = elO.getContext('2d');
  const ctxC = elC.getContext('2d');

  if (chartEstados) chartEstados.destroy();
  if (chartOperador) chartOperador.destroy();
  if (chartCompanias) chartCompanias.destroy();

  const commonOpts = (labels)=>({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    layout: { padding: { right: 28 } },
    plugins: { legend: { display:false }, tooltip: { mode:'nearest', intersect:false } },
    scales: {
      x: { beginAtZero:true, ticks:{ precision:0 }, grid:{ color:'rgba(255,255,255,.06)' } },
      y: { ticks:{ autoSkip:false, font:{ size:12 }, callback:(v,i)=> shortenLabel(labels[i], 36) }, grid:{ display:false } }
    }
  });

  chartEstados = new Chart(ctxE, {
    type:'bar',
    data:{ labels:labelsE, datasets:[{ label:'Prospectos', data:dataE, barThickness:18, maxBarThickness:22, borderRadius:6, borderSkipped:false, categoryPercentage:0.6, barPercentage:0.9 }]},
    options: commonOpts(labelsE),
    plugins: [valueLabels]
  });

  chartOperador = new Chart(ctxO, {
    type:'bar',
    data:{ labels:labelsO, datasets:[{ label:'Llamados (30d)', data:dataO, barThickness:18, maxBarThickness:22, borderRadius:6, borderSkipped:false, categoryPercentage:0.6, barPercentage:0.9 }]},
    options: commonOpts(labelsO),
    plugins: [valueLabels]
  });

  chartCompanias = new Chart(ctxC, {
    type:'bar',
    data:{ labels:labelsC, datasets:[{ label:'Prospectos', data:dataC, barThickness:18, maxBarThickness:22, borderRadius:6, borderSkipped:false, categoryPercentage:0.6, barPercentage:0.9 }]},
    options: commonOpts(labelsC),
    plugins: [valueLabels]
  });
}

export function renderDuracionChart(mode='avg'){
  const cl = CONFIG.COLS_LLAM;
  const agg = new Map();
  for (const r of LLAM.filter(isSuccessCall)){
    const oper = r[cl.operador] || 'Sin operador';
    const sec  = parseDurationToSeconds(r[cl.Duracion]) || parseDurationToSeconds(r['Duración de la llamada']) || parseDurationToSeconds(r['Duración']);
    if (!sec) continue;
    let a = agg.get(oper); if(!a) agg.set(oper, a={sumSec:0,count:0});
    a.sumSec += sec; a.count += 1;
  }
  const entries = Array.from(agg.entries()).map(([k,v])=> [k, mode==='avg' ? v.sumSec/Math.max(1,v.count) : v.sumSec]).sort((a,b)=> b[1]-a[1]);
  const labels = entries.map(e=>e[0]); const data = entries.map(e=>e[1]);

  const el = document.getElementById('chartDuracion'); if(!el) return;
  const H = (n)=> !n?160: (n<=6?220: Math.min(320, 22*n+80)); //el.style.height=H(labels.length)+'px';
  const ctx = el.getContext('2d'); if(chartDuracion) chartDuracion.destroy();

  chartDuracion = new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[{ label: mode==='avg' ? 'Promedio por llamada' : 'Suma total', data, barThickness:18, maxBarThickness:22, borderRadius:6, borderSkipped:false, categoryPercentage:0.6, barPercentage:0.9, valueLabelFormatter:(v)=> formatSecondsBrief(v) }]},
    options:{
      indexAxis:'y', responsive:true, maintainAspectRatio:false, animation:false, layout:{ padding:{ right:28 } },
      plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label:(ctx)=> `${ctx.dataset.label}: ${formatSecondsBrief(ctx.parsed.x)}` }}},
      scales:{
        x:{ beginAtZero:true, grid:{ color:'rgba(255,255,255,.06)' }, ticks:{ callback:(v)=> formatSecondsBrief(v), precision:0 } },
        y:{ ticks:{ autoSkip:false, font:{ size:12 }, callback:(v,i)=> shortenLabel(labels[i],36) }, grid:{ display:false } }
      }
    },
    plugins:[valueLabels]
  });
}

// plugin & helpers for charts moved to charts_utils.js
export const valueLabels = {
  id:'valueLabels',
  afterDatasetsDraw(chart){
    const {ctx} = chart;
    const ds = chart.data.datasets[0];
    const fmtVal = ds.valueLabelFormatter || ((v)=> v.toLocaleString('es-AR'));
    ctx.save(); ctx.fillStyle = getComputedStyle(document.body).color; ctx.font = '12px system-ui, Segoe UI, Roboto, Arial';
    chart.getDatasetMeta(0).data.forEach((bar,i)=>{ const raw = ds.data[i]; if(raw==null) return; ctx.fillText(fmtVal(raw), bar.x+6, bar.y+4); });
    ctx.restore();
  }
};

let chartLlamTrend;

/** Normaliza texto con acentos quitados y minúsculas */
function _norm(s){
  return String(s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();
}

/** Heurística simple para “omitida” */
function isOmittedCall(row){
  const cl = CONFIG.COLS_LLAM;
  const v = _norm(row?.[cl.resultado]);
  // “omitid” cubre omitida/omitido; ajusta si tenés otra etiqueta
  return v.includes('omitid');
}

/** Rellena días faltantes entre min y max con 0 */
function fillDaysRange(counts, minDate, maxDate){
  const out = {};
  const d = new Date(minDate);
  d.setHours(0,0,0,0);
  const end = new Date(maxDate);
  end.setHours(0,0,0,0);
  while (d <= end){
    const k = d.toISOString().slice(0,10);
    out[k] = counts[k] || 0;
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function renderLlamadosTrend(){
  const { llam } = getFiltered();            // respeta el rango global
  const cl = CONFIG.COLS_LLAM;

  if (!llam || !llam.length){
    // si no hay datos, destruye chart previo y sale
    if (chartLlamTrend) { chartLlamTrend.destroy(); chartLlamTrend = null; }
    return;
  }

  // Agrupa por día yyyy-mm-dd
  const succ = {};   // éxitos por día
  const omit = {};   // omitidos por día

  let minD = null, maxD = null;

  for (const r of llam){
    const d = parseDateFlex(r[cl.fecha], 'dmy');
    if (!d || isNaN(d)) continue;
    d.setHours(0,0,0,0);
    if (!minD || d < minD) minD = new Date(d);
    if (!maxD || d > maxD) maxD = new Date(d);

    const key = d.toISOString().slice(0,10);
    if (isSuccessCall(r)) {
      succ[key] = (succ[key]||0) + 1;
    } else if (isOmittedCall(r)) {
      omit[key] = (omit[key]||0) + 1;
    } else {
      // otros estados: no se cuentan (solo pediste éxitos vs omitidos)
    }
  }

  if (!minD || !maxD){
    if (chartLlamTrend) { chartLlamTrend.destroy(); chartLlamTrend = null; }
    return;
  }

  // Rellenar días sin registros con 0 para tener líneas continuas
  const succFull = fillDaysRange(succ, minD, maxD);
  const omitFull = fillDaysRange(omit, minD, maxD);

  const keys = Object.keys(succFull).sort();  // yyyy-mm-dd
  const labels = keys.map(k => {
    const [y,m,d] = k.split('-').map(Number);
    return new Date(y, m-1, d).toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit' });
  });

  const dataSucc = keys.map(k => succFull[k]);
  const dataOmit = keys.map(k => omitFull[k]);

  // Render — línea verde (éxitos) y roja (omitidos)
  const el = document.getElementById('chartLlamTrend');
  if (!el) return;
  const ctx = el.getContext('2d');

  if (chartLlamTrend) chartLlamTrend.destroy();

  chartLlamTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Éxitos',
          data: dataSucc,
          borderColor: '#5ad77c',
          backgroundColor: 'rgba(90,215,124,0.15)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0
        },
        {
          label: 'Omitidos',
          data: dataOmit,
          borderColor: '#ff6b6b',
          backgroundColor: 'rgba(255,107,107,0.15)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: (ctx)=> `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('es-AR')}`
          }
        }
      },
      scales: {
        x: { grid: { color:'rgba(255,255,255,.06)' } },
        y: {
          beginAtZero: true,
          grid: { color:'rgba(255,255,255,.06)' },
          ticks: { precision: 0, stepSize: 1 }
        }
      }
    }
  });
}

