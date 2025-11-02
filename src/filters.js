// src/filters.js
function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d){ const x=new Date(d); x.setHours(23,59,59,999); return x; }

function inRange(d){
  if (!(d instanceof Date) || isNaN(d)) return false;
  const today0 = startOfDay(new Date());
  if (RANGE.type==='todo') return true;
  if (RANGE.type==='30d' || RANGE.type==='90d'){
    const days = RANGE.type==='30d' ? 30 : 90;
    const from = new Date(today0); from.setDate(from.getDate()-days+1);
    return d>=from && d<=endOfDay(new Date());
  }
  if (RANGE.type==='ytd'){
    const from = new Date(new Date().getFullYear(), 0, 1);
    return d>=from && d<=endOfDay(new Date());
  }
  if (RANGE.type==='custom'){
    const f = RANGE.from ? startOfDay(RANGE.from) : null;
    const t = RANGE.to ? endOfDay(RANGE.to) : null;
    if (f && d < f) return false;
    if (t && d > t) return false;
    return true;
  }
  return true;
}

function getFiltered(){
  const c=CONFIG.COLS_PROS, cl=CONFIG.COLS_LLAM;
  const pros = RAW_PROS.filter(p=> inRange(parseDateFlex(p[c.fechaAlta], 'mdy')));
  const llam = RAW_LLAM.filter(l=> inRange(parseDateFlex(l[cl.fecha], 'dmy')));
  return { pros, llam };
}

function applyRangeControls(){
  const preset = $('#presetRange');
  const from = $('#fromDate');
  const to = $('#toDate');
  const apply = $('#applyRange');

  if (preset){
    preset.onchange = ()=>{
      const v = preset.value;
      if (v==='custom'){ from.disabled=false; to.disabled=false; }
      else { from.disabled=true; to.disabled=true; RANGE = {type:v, from:null, to:null}; rerenderAll(); }
    };
  }
  if (apply){
    apply.onclick = ()=>{
      if (preset.value!=='custom') return;
      const f = from.value ? new Date(from.value + 'T00:00:00') : null;
      const t = to.value ? new Date(to.value + 'T23:59:59') : null;
      RANGE = { type:'custom', from:f, to:t };
      rerenderAll();
    };
  }
}
