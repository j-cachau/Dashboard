// src/config.js
export const CONFIG = {
  LOGO_URL: 'assets/logo.png',

  CSV_PROSPECTOS_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR11IHFM7jVM_QT1iTEzGEAyhRIBWhI_X6s1XWxW7ZILxMOK09jKQ0356inkeevTTp-L4ukSoFn2wjK/pub?gid=375626003&single=true&output=csv',
  CSV_LLAMADOS_URL  : 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR11IHFM7jVM_QT1iTEzGEAyhRIBWhI_X6s1XWxW7ZILxMOK09jKQ0356inkeevTTp-L4ukSoFn2wjK/pub?gid=1112671308&single=true&output=csv',

  COLS_PROS: {
    id: 'ID',
    fechaAlta: 'Creado',        // mm/dd/yyyy hh:mm
    compania: 'Compañias',
    contacto: 'Responsable',
    tel: 'Tel',
    email: 'Email',
    origen: 'Origen',
    estado: 'Etiquetas'
  },
  COLS_LLAM: {
    id: 'LlamadoID',
    prospectoId: 'ProspectoID',
    fecha: 'Fecha de la llamada',
    operador: 'Empleado',
    resultado: 'Estatus',
    notas: 'Notas',
    Duracion: 'Duración de la llamada'
  }
};

// 🔹 NUEVO: dejala global para que main.js pueda llamarla sin imports
window.ensureConfig = function ensureConfig(){
  let ok = true;
  try {
    if(!window.CONFIG?.CSV_PROSPECTOS_URL) ok = false;
    if(!window.CONFIG?.CSV_LLAMADOS_URL)  ok = false;
  } catch { ok = false; }

  const n = document.getElementById('configNotice');
  if (n) n.style.display = ok ? 'none' : 'block';

  const logo = document.getElementById('logo');
  if (logo) logo.src = window.CONFIG?.LOGO_URL || 'assets/logo.png';
};
