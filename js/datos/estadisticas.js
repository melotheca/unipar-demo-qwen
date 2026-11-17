/* === js/datos/estadisticas.js === */
/* Unipar — las 6 estadísticas, topes, rangos del test y fórmula de daño. */
window.U = window.U || {};

U.Estadisticas = {
  base: { vida: 100, esencia: 100, ataque: 10, defensa: 10, mente: 10, velocidad: 10 },
  topes: { vida: 3000, esencia: 3000, ataque: 3000, defensa: 3000, mente: 3000, velocidad: 3000 }, // Tope universal de 3000 para las 6 estadísticas; los atributos NO ponen tope por atributo.
  rangosTest: { vida: [80, 130], esencia: [80, 120], ataque: [7, 14], defensa: [7, 14], mente: [7, 14], velocidad: [7, 14] },
  // Perfil inicial por elemento (el test lo suma a las respuestas y al atributo)
  porElemento: {
    fuego:  { ataque: 2, velocidad: 1, defensa: -1 },
    agua:   { mente: 2, vida: 5, ataque: -1 },
    tierra: { vida: 10, defensa: 2, velocidad: -1 },
    viento: { velocidad: 3, esencia: -5 },
    rayo:   { ataque: 1, mente: 2, vida: -5 }
  },
  etiquetas: { vida: 'Vida', esencia: 'Esencia', ataque: 'Ataque', defensa: 'Defensa', mente: 'Mente', velocidad: 'Velocidad' },
  descrip: {
    vida: 'Tu cuerpo. En campo abierto se recupera solo cuando está bajo el 25% del máximo, y el 25% es el tope de esa recuperación automática. Dormir en la fogata sí te despierta al 100%.',
    esencia: 'Tu reserva de energía. A 0 quedas Agotado hasta recuperar el 25%.',
    ataque: 'Daño por golpe. La Velocidad decide cuántas veces pegas, no cuánto.',
    defensa: 'Reduce TODO el daño que pega al cuerpo (físico, elemental y Yang).',
    mente: 'Capa mental: duelos Mente contra Mente y control de Esencia (Arte Místico: próximamente).',
    velocidad: 'Cadencia de golpes, movimiento y distancia de dash.'
  },
  // Fórmula oficial: rendimientos decrecientes, nunca llega a 0.
  formulaDaño(ataque, defensa) { return Math.max(1, ataque * (100 / (100 + Math.max(0, defensa)))); },
  // "Poder" aproximado para escalar el crecimiento por desafío relativo.
  poder(e) { const s = e.stats; return s.vida + s.ataque * 4 + s.defensa * 3 + s.velocidad * 2 + s.mente; },
  clampTest(stat, v) { const r = this.rangosTest[stat]; return Math.round(Math.max(r[0], Math.min(r[1], v))); }
};
