// src/kpis.js
function computeLastDataDate(){
  const c  = CONFIG.COLS_PROS;
  const cl = CONFIG.COLS_LLAM;
  const srcPros = (typeof RAW_PROS !== 'undefined' ? RAW_PROS : (PROS||[]));
  const srcLlam = (typeof RAW_LLAM !== 'undefined' ? RAW_LLAM : (LLAM||[]));
  const a1 = srcPros.map(p=> parseDateFlex(p[c.fechaAlta], 'mdy')).filter(Boolean);
  const a2 = srcLlam.map(l=> parseDateFlex(l[cl.fecha],  'dmy')).filter(Boolean);
  if (!a1.length && !a2.length) return null;
  const all = a1.concat(a2).sort((a,b)=> b-a);
  return all[0];
}
function setLastModifiedKPI(d){
  if (!d) return;
  const el=$('#kpiUpdated'), sub=$('#kpiUpdatedSub');
  if (!el || !sub) return;
  el.textContent = d.toLocaleDateString('es-AR');
  const days = Math.round((new Date()-d)/86400000);
  sub.textContent = days===0 ? 'hoy' : (days===1 ? 'hace 1 día' : `hace ${days} días`);
}

function renderKPIs(){
  const c = CONFIG.COLS_PROS;
  if ($('#kpiPros')){ // solo en dashboard
    const totalProsHistorico = RAW_PROS.length;
    const nuevos30 = RAW_PROS.filter(p=>{
      const d = parseDateFlex(p[c.fechaAlta], 'mdy');
      return d && daysAgo(d,30);
    }).length;
    $('#kpiPros').textContent = fmt(totalProsHistorico);
    $('#kpiProsSub').textContent = `${fmt(nuevos30)} nuevos (30d)`;
  }
  if ($('#kpiLlam30')){
    $('#kpiLlam30').textContent = fmt(LLAM.length);
    $('#kpiLlam30Sub').textContent = `${fmt(RAW_LLAM.length)} total histórico`;
  }
  if ($('#kpiPros30')){
    $('#kpiPros30').textContent = fmt(PROS.length);
  }
}
