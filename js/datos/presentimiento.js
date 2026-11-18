/* === js/datos/presentimiento.js === */
/* Unipar — PRESENTIMIENTO: habilidad PASIVA de Entre-Mundos (no una técnica).
   - SE APRENDE, tarde y caro, como las técnicas de Entre-Mundos: de un Guía
     (Sora, la Guía de la calma y la meditación) con el minijuego de
     U.Aprendizaje — la demostración va MUY rápida al principio y se pone
     lenta con la práctica. Requisitos (tarde en el juego): Mente >= 12
     ("Mente alta", como pide la nota de Entre-Mundos en habilidades.js) y
     maestría de tu elemento >= 70% (el umbral tope de las técnicas
     generales). El minijuego pide 14 aciertos en vez de 10: cuesta más
     desarrollarla que una técnica especial normal. El progreso del
     minijuego vive en j.aprendizaje['presentimiento'] y viaja con la
     partida por la línea `aprendizaje` que ya serializa guardado.js.
   - Una vez aprendido es PASIVO y SIN costo de Esencia: no se equipa, no
     va en el equipo (máx. 5) ni en el registro de técnicas — vive en
     j.presentimientoAprendido (guardado.js lo serializa/restaura).
   - EFECTO: cuando un HOSTIL está cerca, el CONTORNO de la pantalla se
     pone ROJO con un PULSO LENTO en los bordes (respiración, nunca un
     flash). Advierte PRESENCIA, no ubicación: no hay flechas, marcadores
     ni dirección — no rompe la niebla ni las emboscadas. Solo hostiles:
     E.enemigos vivos (bandidos, arena, torneo, retos y emboscadas de las
     organizaciones — todas aparecen ahí vía U.Combate.crearEnemigo) y
     criaturas salvajes de temperamento 'hostil' que no sean tu compañera
     invocada. NPCs amistosos y criaturas tímidas/amistosas NO cuentan.
   - INTENSIDAD por proximidad: a <= 3 celdas es 1 (máximo); de 3 a 12
     celdas baja linealmente hasta 0; a >= 12 celdas no se siente nada.
     Más cerca = borde más rojo y pulso más rápido (de 2.2 s a 0.8 s por
     respiración); más lejos = más suave y más lento. Nunca más rápido
     de 0.8 s: no hay estroboscopio.
   - FOTOSENSIBILIDAD: respeta E.destelloModo (el mismo ajuste de
     Destello: Pausa → Progresión / Ajustes). 'off' = SIN pulso rojo;
     'suave' = pico al 45%; 'normal' = completo. Distinto del flash de
     daño: ese es un velo blanco rápido de TODA la pantalla
     (U.Combate.flashPantalla, pintado en #veloDestello); el
     Presentimiento es solo un borde rojo que respira (#veloPresentimiento).
   - El dibujo vive en U.HUD.actualizar (junto al velo de Destello) y en
     css/combate.css (#veloPresentimiento: box-shadow inset rojo, sin
     rellenar el centro, pointer-events:none: no bloquea nada del HUD).
   - Las matemáticas puras (intensidad / periodo / visual) no tocan el
     DOM: se pueden probar en Node con stubs. */
window.U = window.U || {};

U.Presentimiento = {
  // Definición para el minijuego de U.Aprendizaje (ver _resolverTec ahí):
  // mismo camino que las ESPECIALES, pero NO es una técnica equipable.
  DEF: {
    id: 'presentimiento', nombre: 'Presentimiento', maestro: 'sora',
    esPresentimiento: true, aciertos: 14, menteMin: 12, maestriaMin: 70,
    desc: 'HABILIDAD pasiva de Entre-Mundos: sientes la presencia hostil antes de verla. El borde de la pantalla respira en rojo cuando algo hostil está cerca — presencia, no ubicación. Sin costo de Esencia. Sora te la demuestra: al principio va MUY rápida, con cada acierto se pone más lenta, hasta que la sientes tuya.'
  },
  RADIO: 12,          // celdas: más allá no se siente nada
  RADIO_FUERTE: 3,    // celdas: a esta distancia o menos, intensidad 1
  PERIODO_LENTO: 2.2, // s por respiración cuando el hostil está lejos
  PERIODO_RAPIDO: 0.8, // s por respiración cuando está encima (nunca más rápido: sin estrobo)
  OPACIDAD_MIN: 0.12, // pico de opacidad del borde con el hostil al borde del radio
  OPACIDAD_MAX: 0.5,  // pico de opacidad del borde con el hostil encima
  FACTOR_SUAVE: 0.45, // destelloModo 'suave': el pico se reduce a esto

  aprendido(j) { return !!(j && j.presentimientoAprendido); },

  // ¿Puede empezar a aprenderlo? Devuelve { ok, motivo }.
  puedeAprender(j) {
    if (!j) return { ok: false, motivo: 'Sin jugador.' };
    if (this.aprendido(j)) return { ok: false, motivo: 'Ya dominas el Presentimiento: el borde ya te avisa cuando algo hostil se acerca.' };
    if ((j.stats && j.stats.mente != null ? j.stats.mente : 0) < this.DEF.menteMin) return { ok: false, motivo: 'Tu Mente aún no alcanza (' + Math.floor(j.stats ? j.stats.mente || 0 : 0) + '/' + this.DEF.menteMin + '): el Presentimiento pide Mente alta, como las técnicas de Entre-Mundos. La Mente crece usándola: medita, entrena y pelea con cabeza.' };
    const m = (j.maestria && j.elementoActivo != null ? (j.maestria[j.elementoActivo] || 0) : 0);
    if (m < this.DEF.maestriaMin) return { ok: false, motivo: 'Tu maestría de ' + (U.Elementos && U.Elementos.nombre ? U.Elementos.nombre(j.elementoActivo) : j.elementoActivo) + ' aún no llega (' + Math.floor(m) + '/' + this.DEF.maestriaMin + '%): el Presentimiento es cosa de dominadores hechos, no de aprendices.' };
    return { ok: true };
  },

  // Al dominar el minijuego: queda aprendido (pasivo, sin Esencia).
  conceder(j) {
    if (!j) return false;
    j.presentimientoAprendido = true;
    if (U.HUD) { U.HUD.banner('✦ ¡PRESENTIMIENTO DOMINADO! · YA SIENTES LO QUE SE ACERCA', 3); U.HUD.toast('Habilidad pasiva, sin costo de Esencia: cuando algo hostil esté cerca, el borde de la pantalla respirará en rojo. Presencia, no ubicación: no te dice dónde está.', 'exito'); }
    if (U.Audio) U.Audio.sfx('victoria');
    if (U.Guardado) U.Guardado.guardarAuto();
    return true;
  },

  // ---- hostiles (la misma distinción que ya usa el juego) ----
  // Enemigos: todo lo que vive en E.enemigos con vida (bandidos nocturnos,
  // arena, torneo, retos y emboscadas de organizaciones: todos se crean con
  // U.Combate.crearEnemigo, tipo 'enemigo'). Criaturas: solo temperamento
  // 'hostil' y que NO sea tu compañera invocada. NPCs y criaturas
  // tímidas/amistosas quedan fuera por construcción.
  hostiles(E) {
    if (!E) return [];
    const lista = [];
    (E.enemigos || []).forEach(e => { if (e && (e.vida || 0) > 0 && e.x != null && e.y != null) lista.push({ x: e.x, y: e.y }); });
    (E.criaturas || []).forEach(c => { if (c && (c.vida || 0) > 0 && c.temperamento === 'hostil' && !c.invocada && c.x != null && c.y != null) lista.push({ x: c.x, y: c.y }); });
    return lista;
  },
  distanciaCercana(E) {
    const j = E && E.jugador; if (!j) return Infinity;
    let dMin = Infinity;
    this.hostiles(E).forEach(h => { const d = Math.hypot(h.x - j.x, h.y - j.y); if (d < dMin) dMin = d; });
    return dMin;
  },

  // Intensidad 0..1 por proximidad del hostil MÁS cercano. 0 si no lo has
  // aprendido o no hay hostil dentro del radio. Sin Destello aquí: el
  // ajuste se aplica en visual(), no en la intensidad.
  intensidad(E) {
    if (!E || !this.aprendido(E.jugador)) return 0;
    const d = this.distanciaCercana(E);
    if (!isFinite(d) || d >= this.RADIO) return 0;
    if (d <= this.RADIO_FUERTE) return 1;
    return (this.RADIO - d) / (this.RADIO - this.RADIO_FUERTE);
  },
  // Periodo de la respiración: lento lejos (2.2 s), rápido cerca (0.8 s).
  periodo(I) { const i = Math.max(0, Math.min(1, I || 0)); return this.PERIODO_LENTO - (this.PERIODO_LENTO - this.PERIODO_RAPIDO) * i; },

  // Lo que pinta el HUD en el instante t (segundos acumulados): opacidad
  // del borde rojo, con respiración sinusoidal SUAVE (0 → pico → 0, sin
  // saltos). destelloModo 'off' = opacidad 0 (sin pulso); 'suave' = pico
  // al 45%; 'normal' (o sin ajuste) = completo.
  visual(E, t) {
    const I = this.intensidad(E);
    if (I <= 0) return { intensidad: 0, periodo: 0, opacidad: 0 };
    const per = this.periodo(I);
    const modo = (E && E.destelloModo) || 'normal';
    if (modo === 'off') return { intensidad: I, periodo: per, opacidad: 0 };
    const factor = modo === 'suave' ? this.FACTOR_SUAVE : 1;
    const pico = (this.OPACIDAD_MIN + (this.OPACIDAD_MAX - this.OPACIDAD_MIN) * I) * factor;
    const pulso = 0.5 + 0.5 * Math.sin((2 * Math.PI * (t || 0)) / per); // 0..1, respiración lenta
    return { intensidad: I, periodo: per, opacidad: pico * pulso };
  }
};
