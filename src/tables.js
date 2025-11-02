// src/tables.js
function renderProspectsTable(){
  const c = CONFIG.COLS_PROS;
  const tbody = $('#tbodyProsFull'); if (!tbody) return;
  const pros = [...PROS].sort((a,b)=> (parseDateFlex(b[c.fechaAlta],'mdy')||0)-(parseDateFlex(a[c.fechaAlta],'mdy')||0));
  const row = (p)=> `<tr><td>${p[c.fechaAlta]||''}</td><td>${p[c.compania]||''}</td><td>${p[c.contacto]||''}</td><td>${p[c.estado]||''}</td><td>${p[c.origen]||''}</td></tr>`;
  tbody.innerHTML = pros.map(row).join('');
  const input = $('#searchProsFull');
  if (input){
    input.oninput = (e)=>{
      const q = e.target.value.toLowerCase();
      tbody.innerHTML = pros.filter(p=>[p[c.compania],p[c.contacto],p[c.estado],p[c.origen]].some(x=>(x||'').toLowerCase().includes(q))).map(row).join('');
    };
  }
}

function renderCallsTable(){
  const cl = CONFIG.COLS_LLAM;
  const tbody = $('#tbodyLlamFull'); if (!tbody) return;
  const llam = [...LLAM].sort((a,b)=> (parseDateFlex(b[cl.fecha],'dmy')||0)-(parseDateFlex(a[cl.fecha],'dmy')||0));
  const row = (l)=> `<tr><td>${l[cl.fecha]||''}</td><td>${l[cl.prospectoId]||''}</td><td>${l[cl.operador]||''}</td><td>${l[cl.resultado]||''}</td></tr>`;
  tbody.innerHTML = llam.map(row).join('');
  const input = $('#searchLlamFull');
  if (input){
    input.oninput = (e)=>{
      const q = e.target.value.toLowerCase();
      tbody.innerHTML = llam.filter(l=>[l[cl.operador],l[cl.resultado],l[cl.prospectoId]].some(x=>(x||'').toLowerCase().includes(q))).map(row).join('');
    };
  }
}
