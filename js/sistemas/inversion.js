/* === js/sistemas/inversion.js === */
/* Unipar — HECHIZO DE INVERSIÓN (Arte Místico): ya NO es una inversión fija.
   Cada aplicación elige un DESARREGLO aleatorio de las 8 direcciones de movimiento
   (↑ ↗ → ↘ ↓ ↙ ← ↖): ninguna dirección se mapea a sí misma (hay 14833 desarreglos
   posibles de 8 elementos). El mapeo NO se muestra en pantalla: el jugador lo
   descubre probando — presiona una dirección, ve hacia dónde se mueve y se adapta.
   Sobrellevarlo = adaptarse rápido por ensayo y error. Solo se remapea el MOVIMIENTO. */
window.U = window.U || {};
U.Inversion = {
  // Orden: 0↑ 1↗ 2→ 3↘ 4↓ 5↙ 6← 7↖ (vectores unitarios de las 8 direcciones)
  DIRS: [ { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 }, { x: -1, y: -1 } ],
  indiceDe(vx, vy) { // vector continuo → índice de la dirección más cercana (con dir8 del motor)
    const d = U.Grid.dir8(vx, vy); for (let i = 0; i < 8; i++) if (this.DIRS[i].x === d.x && this.DIRS[i].y === d.y) return i; return 4;
  },
  generar() { // desarreglo aleatorio: permutación de 0..7 sin ningún punto fijo (se reintenta hasta lograrlo; ~37% de las permutaciones sirven)
    let p; do { p = [0, 1, 2, 3, 4, 5, 6, 7]; for (let i = 7; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); const t = p[i]; p[i] = p[k]; p[k] = t; } } while (p.some((v, i) => v === i));
    return p;
  },
  esDesarreglo(p) { return Array.isArray(p) && p.length === 8 && p.every((v, i) => v !== i) && p.slice().sort((a, b) => a - b).join('') === '01234567'; },
  aplicar(mapa, vx, vy) { // remapea un vector de movimiento conservando su magnitud (joystick analógico incluido)
    if (!mapa || !this.esDesarreglo(mapa)) return { x: vx, y: vy };
    const mag = Math.hypot(vx, vy); if (!mag) return { x: 0, y: 0 };
    const d = this.DIRS[mapa[this.indiceDe(vx, vy)]]; const dd = Math.hypot(d.x, d.y) || 1;
    return { x: d.x / dd * mag, y: d.y / dd * mag };
  }
};
