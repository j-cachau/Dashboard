// src/state.js

// Estado "crudo" (todo el CSV)
export let RAW_PROS = [];
export let RAW_LLAM = [];

// Estado filtrado por el rango activo
export let PROS = [];
export let LLAM = [];

// Rango global de fechas
export let RANGE = { type: '30d', from: null, to: null };

// ---- Setters (mutan el estado y mantienen los live bindings de ESM) ----
export function setRaw(pros, llam) {
  RAW_PROS = pros;
  RAW_LLAM = llam;
}

export function setFiltered(pros, llam) {
  PROS = pros;
  LLAM = llam;
}

export function setRange(nextRange) {
  RANGE = nextRange;
}
