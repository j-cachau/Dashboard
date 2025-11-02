// src/state.js
let RAW_PROS = [], RAW_LLAM = []; // CSV completos
let PROS = [], LLAM = [];         // filtrados por rango

// Rango global
let RANGE = { type: '30d', from: null, to: null };
