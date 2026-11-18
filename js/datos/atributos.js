/* === js/datos/atributos.js === */
/* Unipar — atributos: identidad fija por vida (genes). Una ventaja + una desventaja; la ventaja es una barra de XP más corta (favorita ×0.5) y la desventaja una barra más larga (penalizada ×5/3) para subir de nivel cada estadística. */
window.U = window.U || {};

U.Atributos = {
  datos: {
    pesado:   { nombre: 'Pesado',   fav: ['vida', 'esencia'], penal: ['velocidad'], inicio: { vida: 18, esencia: 14, velocidad: -2 }, costo: 1,    regen: 5,  descanso: 0.005,
      ventaja: 'Vida y Esencia suben de nivel con la mitad de XP', desventaja: 'Velocidad sube de nivel más despacio', desc: 'Tu cuerpo es un tanque: aguantas y reservas, pero te cuesta arrancar.' },
    fragil:   { nombre: 'Frágil',   fav: ['velocidad'], penal: ['esencia'], inicio: { velocidad: 3, esencia: -14 }, costo: 1,    regen: 5,  descanso: 0.002,
      ventaja: 'Velocidad sube de nivel con la mitad de XP', desventaja: 'Esencia sube de nivel más despacio · descanso lento (1%/5s)', desc: 'Rápido como una hoja: nadie te toca, pero tu reserva es corta. (La penalización de Vida está en revisión.)' },
    duro:     { nombre: 'Duro',     fav: ['ataque'], penal: ['esencia'], inicio: { ataque: 2, esencia: -10 }, costo: 1.25, regen: 2,  descanso: 0.005,
      ventaja: 'Ataque sube de nivel con la mitad de XP (precisión)', desventaja: 'Costo de Esencia ×1.25 · recuperación 2/s', desc: 'Pegas fuerte porque eres preciso. Cada técnica te cuesta más y recuperas lento.' },
    fluido:   { nombre: 'Fluido',   fav: ['maestria'], penal: ['esencia'], inicio: { esencia: -8, mente: 1 }, costo: 1.18, regen: 5,  descanso: 0.005, maestriaMult: 1.5,
      ventaja: 'Maestría elemental ×1.5', desventaja: 'Esencia sube de nivel más despacio · desperdicia Esencia (costo ×1.18)', desc: 'Aprendes el elemento como quien nada: rápido, pero salpicando energía.' },
    fuerte:   { nombre: 'Fuerte',   fav: ['ataque'], penal: ['defensa'], inicio: { ataque: 3, defensa: -2 }, costo: 1,    regen: 5,  descanso: 0.005,
      ventaja: 'Ataque sube de nivel con la mitad de XP (fuerza bruta)', desventaja: 'Defensa sube de nivel más despacio', desc: 'Fuerza pura: rompes antes de que te rompan. Duro es precisión; lo tuyo es potencia.' },
    sabio:    { nombre: 'Sabio',    fav: ['mente'], penal: ['vida'], inicio: { mente: 3, vida: -15 }, costo: 1,    regen: 10, descanso: 0.005,
      ventaja: 'Mente sube de nivel con la mitad de XP · Esencia 10/s', desventaja: 'Vida sube de nivel más despacio', desc: 'Control total de la Esencia: recuperas rápido, pero tu cuerpo es frágil. (Candidato.)' },
    tenaz:    { nombre: 'Tenaz',    fav: ['vida', 'defensa'], penal: ['ataque'], inicio: { vida: 15, defensa: 2, ataque: -2 }, costo: 1,    regen: 5,  descanso: 0.01,
      ventaja: 'Vida y Defensa suben de nivel con la mitad de XP · descanso 1%/s', desventaja: 'Ataque sube de nivel más despacio', desc: 'Te cansas pero sigues: el muro físico. Descansas el doble de rápido que el resto.' },
    inestable:{ nombre: 'Inestable', fav: ['esencia'], penal: [], inicio: { esencia: 10 }, costo: 'inestable', regen: 5, descanso: 0.005, especial: true,
      ventaja: 'Esencia sube de nivel con la mitad de XP · a veces el costo se desploma', desventaja: 'Esencia impredecible (costo ×0.5 a ×2)', desc: 'Especial: tu energía es un clima. A veces el doble de potencia, a veces casi nada.' }
  },
  porDefecto: { fuego: 'fuerte', agua: 'fluido', tierra: 'tenaz', viento: 'fragil', rayo: 'duro' },
  de(id) { return this.datos[id] || this.datos.tenaz; },
  esFavorita(id, stat) { return this.de(id).fav.indexOf(stat) >= 0; },
  esPenalizada(id, stat) { return this.de(id).penal.indexOf(stat) >= 0; },
  // Multiplicador de costo de Esencia (Inestable tira el dado cada vez)
  multCosto(id) {
    const a = this.de(id);
    if (a.costo === 'inestable') return 0.5 + Math.random() * 1.5;
    return a.costo;
  }
};
