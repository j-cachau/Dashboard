// tables.js
import { CONFIG } from './config.js';
import { PROS, LLAM, RAW_PROS, RAW_LLAM, RANGE } from './state.js';
import { setRaw, setFiltered, setRange } from './state.js';
import { parseDateFlex } from './utils.js';
import { toCSV, downloadFile } from './utils.js';

const c  = CONFIG.COLS_PROS;
const cl = CONFIG.COLS_LLAM;

// Estado de paginación por vista
const prosState = { page: 1, size: 50, q: '' };
const llamState = { page: 1, size: 50, q: '' };

function paginate(arr, {page, size}) {
  const total = arr.length;
  const maxPage = Math.max(1, Math.ceil(total / size));
  const p = Math.min(Math.max(1, page), maxPage);
  const start = (p - 1) * size;
  const end = start + size;
  return { rows: arr.slice(start, end), total, page: p, maxPage };
}

function mountPager(container, state, total, onChange) {
  const pager = document.createElement('div');
  pager.className = 'pager';

  const btnPrev = document.createElement('button');
  btnPrev.className = 'btn';
  btnPrev.textContent = '‹ Anterior';
  btnPrev.disabled = state.page <= 1;
  btnPrev.onclick = () => { state.page = Math.max(1, state.page - 1); onChange(); };

  const btnNext = document.createElement('button');
  btnNext.className = 'btn';
  btnNext.textContent = 'Siguiente ›';
  const maxPg = Math.max(1, Math.ceil(total / state.size));
  btnNext.disabled = state.page >= maxPg;
  btnNext.onclick = () => { state.page = Math.min(maxPg, state.page + 1); onChange(); };

  const info = document.createElement('span');
  info.className = 'info';
  const from = total ? (state.page - 1) * state.size + 1 : 0;
  const to   = Math.min(state.page * state.size, total);
  info.textContent = `${from}–${to} de ${total}`;

  const sel = document.createElement('select');
  sel.className = 'page-size';
  [25, 50, 100, 200].forEach(n=>{
    const opt = document.createElement('option');
    opt.value = String(n); opt.textContent = `${n}/página`;
    if (n === state.size) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.onchange = () => { state.size = Number(sel.value); state.page = 1; onChange(); };

  pager.append(btnPrev, btnNext, info, sel);
  container.appendChild(pager);
}

function mountExportButton(container, fileName, rows, headersOrder) {
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Exportar CSV';
  btn.onclick = () => {
    const csv = toCSV(rows, headersOrder);
    downloadFile(fileName, csv);
  };
  container.appendChild(btn);
}

export function renderProspectsTable() {
  const tbody = document.getElementById('tbodyPros');
  const toolbar = document.getElementById('prosToolbar');
  if (!tbody || !toolbar) return;

  // Orden por fecha (desc)
  const ordered = [...PROS].sort((a,b)=>
    (parseDateFlex(b[c.fechaAlta], 'mdy')||0)-(parseDateFlex(a[c.fechaAlta], 'mdy')||0)
  );

  // Buscar
  const q = prosState.q.toLowerCase();
  const filtered = !q ? ordered : ordered.filter(p => [
    p[c.compania], p[c.contacto], p[c.estado], p[c.origen]
  ].some(x => (x||'').toLowerCase().includes(q)));

  const { rows, total, page, maxPage } = paginate(filtered, prosState);

  // Render filas
  const row = (p)=> `<tr>
      <td>${p[c.fechaAlta]||''}</td>
      <td>${p[c.compania]||''}</td>
      <td>${p[c.contacto]||''}</td>
      <td>${p[c.estado]||''}</td>
      <td>${p[c.origen]||''}</td>
    </tr>`;
  tbody.innerHTML = rows.map(row).join('');

  // Render barra inferior (pager + export)
  const footer = document.getElementById('prosFooter') || toolbar; // si no hay footer dedicado, usa toolbar
  footer.querySelectorAll('.pager, .btn.export').forEach(el => el.remove()); // limpia
  const cont = document.createElement('div');
  cont.className = 'pager';
  mountPager(cont, prosState, filtered.length, renderProspectsTable);
  mountExportButton(cont, 'prospectos.csv', filtered, [
    c.fechaAlta, c.compania, c.contacto, c.estado, c.origen
  ]);
  footer.appendChild(cont);

  // Actualiza placeholder de info si querés
  const info = footer.querySelector('.info');
  if (info) info.textContent += ` (pág. ${page}/${maxPage})`;
}

export function wireProsSearch() {
  const input = document.getElementById('searchPros');
  if (!input) return;
  input.oninput = (e)=>{
    prosState.q = (e.target.value || '').trim();
    prosState.page = 1;
    renderProspectsTable();
  };
}

export function renderCallsTable() {
  const tbody = document.getElementById('tbodyLlam');
  const toolbar = document.getElementById('llamToolbar');
  if (!tbody || !toolbar) return;

  // Orden por fecha (desc)
  const ordered = [...LLAM].sort((a,b)=>
    (parseDateFlex(b[cl.fecha], 'dmy')||0)-(parseDateFlex(a[cl.fecha], 'dmy')||0)
  );

  // Buscar
  const q = llamState.q.toLowerCase();
  const filtered = !q ? ordered : ordered.filter(l => [
    l[cl.operador], l[cl.resultado], l[cl.prospectoId]
  ].some(x => (x||'').toLowerCase().includes(q)));

  const { rows, total, page, maxPage } = paginate(filtered, llamState);

  // Render filas
  const row = (l)=> `<tr>
      <td>${l[cl.fecha]||''}</td>
      <td>${l[cl.prospectoId]||''}</td>
      <td>${l[cl.operador]||''}</td>
      <td>${l[cl.resultado]||''}</td>
    </tr>`;
  tbody.innerHTML = rows.map(row).join('');

  // Render barra inferior (pager + export)
  const footer = document.getElementById('llamFooter') || toolbar;
  footer.querySelectorAll('.pager, .btn.export').forEach(el => el.remove());
  const cont = document.createElement('div');
  cont.className = 'pager';
  mountPager(cont, llamState, filtered.length, renderCallsTable);
  mountExportButton(cont, 'llamados.csv', filtered, [
    cl.fecha, cl.prospectoId, cl.operador, cl.resultado
  ]);
  footer.appendChild(cont);

  const info = footer.querySelector('.info');
  if (info) info.textContent += ` (pág. ${page}/${maxPage})`;
}

export function wireLlamSearch() {
  const input = document.getElementById('searchLlam');
  if (!input) return;
  input.oninput = (e)=>{
    llamState.q = (e.target.value || '').trim();
    llamState.page = 1;
    renderCallsTable();
  };
}
