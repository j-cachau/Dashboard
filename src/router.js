// src/router.js
function setActiveTab(route){
  document.querySelectorAll('nav.tabs a').forEach(a=>{
    const r = a.getAttribute('href').replace('#/','');
    const key = route.replace('/','');
    a.classList.toggle('active', (r===key) || (r==='' && key===''));
  });
}

function navigate(){
  const hash = location.hash || '#/';
  const route = hash.replace('#','');
  // toggle views
  const views = {
    '/': '#view-dashboard',
    '/prospectos': '#view-prospectos',
    '/llamados': '#view-llamados'
  };
  Object.values(views).forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.classList.add('hidden');
  });
  const sel = views[route] || '#view-dashboard';
  const el = document.querySelector(sel);
  if (el) el.classList.remove('hidden');

  setActiveTab(route);

  // cuando cambie de vista, redibujar lo necesario
  if (route === '/'){
    renderKPIs();
    renderCharts();
    if ($('#durMode')){
      $('#durMode').onchange = ()=> renderDuracionChart($('#durMode').value);
    }
  } else if (route === '/prospectos'){
    renderProspectsTable();
  } else if (route === '/llamados'){
    renderCallsTable();
  }
}

window.addEventListener('hashchange', navigate);
