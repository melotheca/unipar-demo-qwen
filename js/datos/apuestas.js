/* === js/datos/apuestas.js === */
/* Unipar — APOSTAR EN LA ARENA (modo espectador): luchadores de la arena con
   sus PROPIOS sets de movimientos, y la fórmula de CUOTAS.
   Los sets se BASAN EN MOVIMIENTOS TIPO POKÉMON, NARUTO Y DRAGON BALL, con
   NOMBRES ORIGINALES en español, del mundo de Unipar. La inspiración es la
   MECÁNICA y el CONCEPTO, nunca el nombre con copyright: nada de Kamehameha,
   Rasengan, Chidori, Thunderbolt ni similares, ni en el juego ni en los datos.
   - De POKÉMON: movimientos con tipo, poder y efecto (quemar, paralizar,
     subir/bajar estadísticas, curarse).
   - De NARUTO: jutsu elementales (aliento de dragón, dragón de agua, muro de
     tierra), técnicas con carga, clones e ilusiones que confunden.
   - De DRAGON BALL: rayos de energía cargados (un haz), esferas de energía,
     teletransportación, aura/potenciación y un ataque final grande.
   Cada técnica trae su esquema COMPLETO aquí (no depende del catálogo de
   U.Habilidades, que otro agente está expandiendo). Formas soportadas por el
   simulador: linea, proyectil, circulo, rect, alterna, cono, cadena, destello.
   Efectos: empuje, slow, dot, stun, cegar, más cura / buff / debuff / blink /
   windup (carga) propios de este sistema.
   CUOTAS: fuerza F = vida×0.30 + ataque×2.0 + defensa×1.6 + velocidad×1.0 +
   mente×0.5 + puntos del set. Probabilidad implícita pA = FA/(FA+FB) y la
   cuota es 1/p, con tope [1.15, 4.00]. El fuerte paga menos, el débil más.
   El jugador ve las cuotas Y la fuerza de cada uno antes de apostar. */
window.U = window.U || {};

U.ApuestasDatos = {
  APUESTA_MIN: 10,
  MONTOS: [10, 25, 50, 100],
  CUOTA_MIN: 1.15,
  CUOTA_MAX: 4.00,
  // Puntos que aporta cada efecto al puntaje del set (para la cuota).
  VALOR_EFECTO: { empuje: 2, slow: 2, dot: 3, stun: 4, cegar: 4 },
  VALOR_EXTRA: { cura: 4, buff: 4, debuff: 3, blink: 3 },

  // clase = base VISUAL (paleta y accesorio de U.Combate.CLASES / render):
  // bandido, chaman, brasa, veterano, ilusionista. Los stats y el set son
  // propios de cada luchador, no de la clase.
  LUCHADORES: [
    {
      id: 'rurik', nombre: 'Rurik', apodo: 'Puño de Roca', personalidad: 'Paciente como una montaña: aguanta, aguanta… y devuelve el golpe doble.',
      elemento: 'tierra', clase: 'veterano',
      stats: { vida: 150, ataque: 14, defensa: 15, velocidad: 6, mente: 7 },
      set: [
        { id: 'muro', nombre: 'Muro de Piedra Viva', forma: 'circulo', alcance: 0, radio: 1, power: 0, cd: 5, buff: { def: 1.35, t: 4 }, desc: 'Endurece su piel como roca: su defensa sube un rato.', origen: 'pokemon' },
        { id: 'sismico', nombre: 'Puño Sísmico', forma: 'cono', alcance: 2, radio: 0, power: 1.5, cd: 1.6, efecto: { stun: 0.5 }, desc: 'Puñetazo que hace temblar el suelo y aturde.', origen: 'naruto' },
        { id: 'avalancha', nombre: 'Avalancha de Rocas', forma: 'circulo', alcance: 0, radio: 2, power: 1.4, cd: 2.6, efecto: { empuje: 2 }, desc: 'Rocas que caen en círculo y empujan a todo lo que tocan.', origen: 'naruto' }
      ]
    },
    {
      id: 'naiara', nombre: 'Naiara', apodo: 'La Brisa Cortante', personalidad: 'Rápida y burlona: no la tocas ni con suerte, y te lo recuerda.',
      elemento: 'viento', clase: 'chaman',
      stats: { vida: 95, ataque: 13, defensa: 7, velocidad: 15, mente: 10 },
      set: [
        { id: 'hoja', nombre: 'Hoja de Viento', forma: 'linea', alcance: 7, radio: 0, power: 1.3, cd: 1.0, efecto: { empuje: 2 }, desc: 'Corte de aire fino y largo que empuja.', origen: 'naruto' },
        { id: 'petalos', nombre: 'Danza de Pétalos', forma: 'alterna', alcance: 6, radio: 0, power: 1.2, cd: 1.4, desc: 'Golpea en celdas alternas, como pétalos que cortan al pasar.', origen: 'pokemon' },
        { id: 'remolino', nombre: 'Remolino Atrapador', forma: 'circulo', alcance: 0, radio: 2, power: 1.3, cd: 2.5, efecto: { slow: 2 }, desc: 'Torbellino que frena al rival en su sitio.', origen: 'naruto' }
      ]
    },
    {
      id: 'bram', nombre: 'Bram', apodo: 'El Coloso de Brasas', personalidad: 'Ríe fuerte, pega más fuerte. Su fuego no pide permiso.',
      elemento: 'fuego', clase: 'brasa',
      stats: { vida: 110, ataque: 16, defensa: 8, velocidad: 9, mente: 6 },
      set: [
        { id: 'aliento', nombre: 'Aliento de Dragón', forma: 'cono', alcance: 3, radio: 0, power: 1.5, cd: 1.5, efecto: { dot: { dmg: 2, t: 3 } }, desc: 'Exhala fuego en abanico: quema durante unos segundos.', origen: 'naruto' },
        { id: 'ascuas', nombre: 'Lluvia de Ascuas', forma: 'proyectil', alcance: 7, radio: 0, power: 1.4, cd: 1.8, efecto: { dot: { dmg: 2, t: 2 } }, desc: 'Brasas que vuelan y dejan quemadura.', origen: 'pokemon' },
        { id: 'furia', nombre: 'Furia Ígnea', forma: 'circulo', alcance: 0, radio: 1, power: 0, cd: 6, buff: { atk: 1.3, t: 4 }, desc: 'Su aura arde: su ataque sube un rato.', origen: 'dragonball' }
      ]
    },
    {
      id: 'zel', nombre: 'Zel', apodo: 'El Rayo Silencioso', personalidad: 'Casi no habla. Aparece, cae un rayo, y ya se acabó.',
      elemento: 'rayo', clase: 'ilusionista',
      stats: { vida: 90, ataque: 15, defensa: 6, velocidad: 16, mente: 11 },
      set: [
        { id: 'latigazo', nombre: 'Latigazo de Tormenta', forma: 'linea', alcance: 8, radio: 0, power: 1.35, cd: 1.1, efecto: { stun: 0.35 }, desc: 'Rayo instantáneo que paraliza un instante.', origen: 'pokemon' },
        { id: 'destello', nombre: 'Destello Cegador', forma: 'destello', alcance: 0, radio: 4, power: 0.4, cd: 3.0, efecto: { cegar: 3 }, desc: 'Flash de luz que deja ciego al rival unos segundos.', origen: 'pokemon' },
        { id: 'paso', nombre: 'Paso Relámpago', forma: 'cono', alcance: 2, radio: 0, power: 1.3, cd: 2.4, blink: true, desc: 'Se teletransporta detrás del rival y golpea por la espalda.', origen: 'dragonball' }
      ]
    },
    {
      id: 'mira', nombre: 'Mira', apodo: 'La Marea Serena', personalidad: 'Calma total: el agua no tiene prisa, y aun así siempre llega.',
      elemento: 'agua', clase: 'chaman',
      stats: { vida: 120, ataque: 12, defensa: 10, velocidad: 10, mente: 12 },
      set: [
        { id: 'dragon', nombre: 'Dragón de Agua', forma: 'linea', alcance: 6, radio: 0, power: 1.5, cd: 1.6, efecto: { empuje: 2 }, desc: 'Un dragón de agua a presión que arrastra lo que toca.', origen: 'naruto' },
        { id: 'burbujas', nombre: 'Prisión de Burbujas', forma: 'circulo', alcance: 0, radio: 2, power: 1.2, cd: 2.8, efecto: { slow: 2.5 }, desc: 'Burbujas que atrapan y frenan al rival.', origen: 'pokemon' },
        { id: 'marea', nombre: 'Marea Curativa', forma: 'circulo', alcance: 0, radio: 1, power: 0, cd: 7, cura: 15, desc: 'El agua la recompone: recupera vida.', origen: 'pokemon' }
      ]
    },
    {
      id: 'durn', nombre: 'Durn', apodo: 'El Puño Vacío', personalidad: 'Serio y directo: energía blanca, sin adornos, sin piedad.',
      elemento: 'yang', clase: 'veterano',
      stats: { vida: 130, ataque: 15, defensa: 11, velocidad: 11, mente: 9 },
      set: [
        { id: 'haz', nombre: 'Haz de Energía', forma: 'linea', alcance: 10, radio: 0, power: 1.6, cd: 2.0, windup: 0.6, desc: 'Carga energía blanca un instante y dispara un haz recto.', origen: 'dragonball' },
        { id: 'esfera', nombre: 'Esfera de Luz', forma: 'proyectil', alcance: 8, radio: 0, power: 1.5, cd: 1.8, explora: { radio: 1, power: 1.4 }, desc: 'Esfera de energía que estalla al impactar.', origen: 'dragonball' },
        { id: 'veloz', nombre: 'Puño Veloz', forma: 'cono', alcance: 2, radio: 0, power: 1.2, cd: 0.5, desc: 'Puñetazos rapidísimos, uno tras otro.', origen: 'dragonball' }
      ]
    },
    {
      id: 'kira', nombre: 'Kira', apodo: 'La Sombra Doble', personalidad: 'Sonríe mientras te confunde: nunca sabes cuál es la de verdad.',
      elemento: 'viento', clase: 'ilusionista',
      stats: { vida: 85, ataque: 14, defensa: 6, velocidad: 14, mente: 14 },
      set: [
        { id: 'doble', nombre: 'Doble Ilusorio', forma: 'cono', alcance: 2, radio: 0, power: 1.1, cd: 2.2, efecto: { cegar: 2 }, blink: true, desc: 'Deja un doble ilusorio: el rival golpea aire y queda confundido.', origen: 'naruto' },
        { id: 'cuchilla', nombre: 'Cuchilla Invisible', forma: 'linea', alcance: 9, radio: 0, power: 1.6, cd: 1.9, desc: 'Corte de aire que no se ve venir.', origen: 'naruto' },
        { id: 'niebla', nombre: 'Muro de Niebla', forma: 'circulo', alcance: 0, radio: 2, power: 0.6, cd: 3.2, debuff: { atk: 0.8, t: 4 }, desc: 'Niebla espesa que debilita los golpes del rival.', origen: 'pokemon' }
      ]
    },
    {
      id: 'toro', nombre: 'Toro', apodo: 'El Último Golpe', personalidad: 'Toro no pierde: cuando está contra las cuerdas, es cuando más pega.',
      elemento: 'tierra', clase: 'bandido',
      stats: { vida: 140, ataque: 17, defensa: 9, velocidad: 8, mente: 5 },
      set: [
        { id: 'demoledor', nombre: 'Puño Demoledor', forma: 'cono', alcance: 2, radio: 0, power: 1.8, cd: 3.0, desc: 'Un puño que demuele: lento, pero duele.', origen: 'naruto' },
        { id: 'grito', nombre: 'Grito de Guerra', forma: 'circulo', alcance: 0, radio: 1, power: 0, cd: 6, buff: { atk: 1.25, t: 4 }, desc: 'Grita y su ataque sube: la pelea se le pone seria.', origen: 'dragonball' },
        { id: 'onda', nombre: 'Onda Final', forma: 'circulo', alcance: 0, radio: 3, power: 2.0, cd: 6, windup: 1.0, condicion: { vidaMenor: 0.4 }, desc: 'Su ataque final: solo cuando su vida baja del 40%. Onda enorme que lo cubre todo.', origen: 'dragonball' }
      ]
    }
  ],

  porId(id) { return this.LUCHADORES.find(l => l.id === id) || null; },

  // Puntos del set de un luchador (para la cuota).
  puntosSet(l) {
    let p = 0;
    (l.set || []).forEach(t => {
      let v = (t.power || 0) * 10 / (1 + (t.cd || 1));
      const ef = t.efecto || {};
      if (ef.empuje) v += this.VALOR_EFECTO.empuje;
      if (ef.slow) v += this.VALOR_EFECTO.slow;
      if (ef.dot) v += this.VALOR_EFECTO.dot;
      if (ef.stun) v += this.VALOR_EFECTO.stun;
      if (ef.cegar) v += this.VALOR_EFECTO.cegar;
      if (t.cura) v += this.VALOR_EXTRA.cura;
      if (t.buff) v += this.VALOR_EXTRA.buff;
      if (t.debuff) v += this.VALOR_EXTRA.debuff;
      if (t.blink) v += this.VALOR_EXTRA.blink;
      if (t.windup) v -= 1; // la carga es una debilidad: da tiempo a esquivar
      if (t.condicion) v *= 0.5; // solo disponible a veces: vale la mitad
      p += v;
    });
    return p;
  },

  // Fuerza total de un luchador: stats + set.
  fuerzaDe(l) {
    const s = l.stats;
    return Math.round((s.vida * 0.30 + s.ataque * 2.0 + s.defensa * 1.6 + s.velocidad * 1.0 + s.mente * 0.5 + this.puntosSet(l)) * 10) / 10;
  },

  // Cuotas de una pareja: { a, b, pA, pB, fA, fB }. cuota = 1/probabilidad,
  // con tope [1.15, 4.00]. El fuerte paga menos, el débil paga más.
  cuotasDe(lA, lB) {
    const fA = this.fuerzaDe(lA), fB = this.fuerzaDe(lB);
    const pA = fA / (fA + fB), pB = 1 - pA;
    const red = c => Math.round(Math.max(this.CUOTA_MIN, Math.min(this.CUOTA_MAX, c)) * 100) / 100;
    let cA = red(1 / pA), cB = red(1 / pB);
    // Desempate por redondeo: si las fuerzas difieren pero las cuotas
    // redondeadas empatan, el fuerte paga 0.01 menos (nunca bajo el mínimo).
    if (cA === cB && fA !== fB) {
      if (fA > fB) { if (cA > this.CUOTA_MIN) cA = Math.round((cA - 0.01) * 100) / 100; else cB = Math.round((cB + 0.01) * 100) / 100; }
      else { if (cB > this.CUOTA_MIN) cB = Math.round((cB - 0.01) * 100) / 100; else cA = Math.round((cA + 0.01) * 100) / 100; }
    }
    return { a: cA, b: cB, pA: Math.round(pA * 100) / 100, pB: Math.round(pB * 100) / 100, fA, fB };
  },

  // Una pareja al azar (dos distintos, sin repetir la pareja anterior).
  parejaAlAzar(ultimoPar) {
    const ids = this.LUCHADORES.map(l => l.id);
    let a = ids[Math.floor(Math.random() * ids.length)], b = a;
    while (b === a) b = ids[Math.floor(Math.random() * ids.length)];
    if (ultimoPar && ((ultimoPar[0] === a && ultimoPar[1] === b) || (ultimoPar[0] === b && ultimoPar[1] === a))) return this.parejaAlAzar(null);
    return [a, b];
  }
};
