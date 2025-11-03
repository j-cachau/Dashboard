// src/main.js  (ESM)
import './config.js';
import './state.js';
import './utils.js';
import './filters.js';
import './kpis.js';
import './charts.js';
import './tables.js';
import './data.js';
import './router.js';


async function init(){
  ensureConfig();
  $('#dataStatus').textContent = 'Cargando…';
  try{
    const [pros, llam] = await Promise.all([
      papaCsv(CONFIG.CSV_PROSPECTOS_URL),
      papaCsv(CONFIG.CSV_LLAMADOS_URL)
    ]);
    RAW_PROS = pros; RAW_LLAM = llam;

    // Primer filtrado + render
    rerenderAll();

    // KPI “Última actualización” con Last-Modified y fallback
    try{
      const [m1, m2] = await Promise.all([
        fetchLastModifiedFlexible(CONFIG.CSV_PROSPECTOS_URL),
        fetchLastModifiedFlexible(CONFIG.CSV_LLAMADOS_URL)
      ]);
      let d = [m1, m2].filter(Boolean).sort((a,b)=> b-a)[0];
      if (!d) d = computeLastDataDate();
      setLastModifiedKPI(d);
    }catch{
      const d = computeLastDataDate();
      if (d) setLastModifiedKPI(d);
    }

    $('#dataStatus').textContent = 'Datos OK';
  }catch(e){
    console.error(e);
    $('#dataStatus').textContent = 'Error de datos';
  }

  // Rango
  applyRangeControls();

  // Router
  navigate();
}

// Redibuja todo según RANGE (sin tocar RAW_*)
export function rerenderAll(){
  const { pros, llam } = getFiltered();
  PROS = pros; LLAM = llam;

  // Si estamos en dashboard
  renderKPIs();
  renderCharts();

  // Si estoy en vistas listadas
  if (!$('#view-prospectos').classList.contains('hidden')) renderProspectsTable();
  if (!$('#view-llamados').classList.contains('hidden')) renderCallsTable();

  // Modo duración
  if ($('#durMode')){
    $('#durMode').onchange = ()=> renderDuracionChart($('#durMode').value);
  }
}

init();
