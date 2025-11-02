// src/charts.js
let chartEstados, chartOperador, chartCompanias, chartDuracion;

const valueLabels = {
  id: 'valueLabels',
  afterDatasetsDraw(chart){
    const {ctx} = chart;
    const ds = chart.data.datasets[0];
    const fmtVal = ds.valueLabelFormatter || ((v)=> v.toLocaleString('es-AR'));
    ctx.save();
    ctx.fillStyle = getComputedStyle(document.body).color;
    ctx.font = '12px system-ui, Segoe UI, Roboto, Arial';
    chart.getDatasetMeta(0).data.forEach((bar, i)=>{
      const raw = ds.data[i]; if (raw == null) return;
      ctx.fillText(fmtVal(raw), bar.x + 6, bar.y + 4);
    });
    ctx.restore();
  }
};

function commonChartOpts(labels){
  return {
    indexAxis:'y', responsive:true, maintainAspectRatio:false, animation:false,
    layout:{ padding:{ right:28 } },
    plugins:{ legend:{ display:false }, tooltip:{ mode:'nearest', intersect:false } },
    scales:{
      x:{ beginAtZero:true, ticks:{ precision:0 }, grid:{ color:'rgba(255,255,255,.06)' } },
      y:{ ticks:{ autoSkip:false, font:{ size:12 }, callback:(v,i)=> shortenLabel(labels[i], 36) }, grid:{ display:false } }
    }
  };
}

function renderCharts(){
  // Si no estoy en dashboard, salgo silencioso
  if (!$('#chartEstados')) return;

  const c=CONFIG.COLS_PROS, cl=CONFIG.COLS_LLAM;

  const estados = groupCount(PROS, p=> p[c.estado] || 'Sin estado');
  const eE = Object.entries(estados).sort((a,b)=> b[1]-a[1]).slice(0,10);
  const labelsE = eE.map(([k])=>k);
  const dataE = eE.map(([,v])=>v);

  const llamOK = LLAM.filter(isSuccessCall);
  const porOper = groupCount(llamOK, l=> l[cl.operador] || 'Sin operador');
  const eO = Object.entries(porOper).sort((a,b)=> b[1]-a[1]);
  const labelsO = eO.map(([k])=>k);
  const dataO = eO.map(([,v])=>v);

  const companias = groupCount(PROS, p=> p[c.compania] || 'Sin compañía');
  const eC = Object.entries(companias).sort((a,b)=> b[1]-a[1]).slice(0,10);
  const labelsC = eC.map(([k])=>k);
  const dataC = eC.map(([,v])=>v);

  const H = (n)=> !n?160: (n<=6?220: Math.min(320, 22*n+80));

  const elE = $('#chartEstados'), elO = $('#chartOperador'), elC = $('#chartCompanias');
  elE.style.height = H(labelsE.length)+'px';
  elO.style.height = H(labelsO.length)+'px';
  elC.style.height = H(labelsC.length)+'px';

  if (chartEstados) chartEstados.destroy();
  if (chartOperador) chartOperador.destroy();
  if (chartCompanias) chartCompanias.destroy();

  chartEstados = new Chart(elE.getContext('2d'), {
    type:'bar',
    data:{ labels:labelsE, datasets:[{ label:'Prospectos', data:dataE, barThickness:18, maxBarThickness:22, borderRadius:6, borderSkipped:false, categoryPercentage:.6, barPercentage:.9 }]},
    options: commonChartOpts(labelsE),
    plugins:[valueLabels]
  });
  chartOperador = new Chart(elO.getContext('2d'), {
    type:'bar',
    data:{ labels:labelsO, datasets:[{ label:'Llamados (30d)', data:dataO, barThickness:18, maxBarThickness:22, borderRadius:6, borderSkipped:false, categoryPercentage:.6, barPercentage:.9 }]},
    options: commonChartOpts(labelsO),
    plugins:[valueLabels]
  });
  chartCompanias = new Chart(elC.getContext('2d'), {
    type:'bar',
    data:{ labels:labelsC, datasets:[{ label:'Prospectos', data:dataC, barThickness:18, maxBarThickness:22, borderRadius:6, borderSkipped:false, categoryPercentage:.6, barPercentage:.9 }]},
    options: commonChartOpts(labelsC),
    plugins:[valueLabels]
  });

  // Gráfico de duración
  renderDuracionChart($('#durMode')?.value || 'avg');
}

function renderDuracionChart(mode){
  const el = $('#chartDuracion');
  if (!el) return;
  const { llam } = getFiltered();
  const cl = CONFIG.COLS_LLAM;
  const llamOK = llam.filter(isSuccessCall);

  const agg = new Map();
  for (const r of llamOK){
    const oper = r[cl.operador] || 'Sin operador';
    const sec  = parseDurationToSeconds(r[cl.Duracion]) || parseDurationToSeconds(r['Duración de la llamada']) || parseDurationToSeconds(r['Duración']);
    if (!sec) continue;
    let a = agg.get(oper); if (!a) agg.set(oper, a={sumSec:0,count:0});
    a.sumSec += sec; a.count += 1;
  }
  const entries = Array.from(agg.entries()).map(([k,v])=>[k, (mode==='avg'? v.sumSec/Math.max(1,v.count): v.sumSec), v]).sort((a,b)=> b[1]-a[1]);
  const labels = entries.map(e=>e[0]);
  const data = entries.map(e=>e[1]);

  const H = (n)=> !n?160: (n<=6?220: Math.min(320, 22*n+80));
  el.style.height = H(labels.length)+'px';

  if (chartDuracion) chartDuracion.destroy();
  chartDuracion = new Chart(el.getContext('2d'), {
    type:'bar',
    data:{ labels, datasets:[{ label: mode==='avg'?'Promedio por llamada':'Suma total', data, barThickness:18, maxBarThickness:22, borderRadius:6, borderSkipped:false, categoryPercentage:.6, barPercentage:.9, valueLabelFormatter:(v)=> formatSecondsBrief(v) }]},
    options:{
      indexAxis:'y', responsive:true, maintainAspectRatio:false, animation:false,
      layout:{ padding:{ right:28 } },
      plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label:(ctx)=> `${ctx.dataset.label}: ${formatSecondsBrief(ctx.parsed.x)}` } } },
      scales:{
        x:{ beginAtZero:true, grid:{ color:'rgba(255,255,255,.06)' }, ticks:{ callback:(v)=> formatSecondsBrief(v), precision:0 } },
        y:{ ticks:{ autoSkip:false, font:{ size:12 }, callback:(v,i)=> shortenLabel(labels[i], 36) }, grid:{ display:false } }
      }
    },
    plugins:[valueLabels]
  });
}
