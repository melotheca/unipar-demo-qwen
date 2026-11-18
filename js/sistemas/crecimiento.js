/* === js/sistemas/crecimiento.js === */
/* Unipar — crecimiento por uso con NIVELES POR ESTADÍSTICA: cada acción da XP
   a su estadística (ver ESCALA_XP); al llenar la barra el stat sube 1 nivel y
   su valor sube por la ganancia por nivel. El atributo acorta la barra de sus
   favoritas (×0.5) y alarga la de su penalizada (×5/3): la barra es visible,
   el multiplicador invisible de antes (favorita ×2, penalizada ×0.6) se eliminó. */
window.U = window.U || {};

U.Crecimiento = {
  acum: {}, total: {}, tFlush: 0, desbloqueos: [],
  // ESCALA_XP: los `base` antiguos sumaban directo al VALOR del stat (0.05 por
  // puño, 0.1 por dash...). Ahora cada acción da XP hacia el siguiente nivel:
  // ×20 convierte el puño (0.05) en 1 XP y el dash (0.1) en 2 XP. El costo de
  // subir de nivel 5 a 6 neutral es 5 XP ≈ 5 puños.
  ESCALA_XP: 20,
  // Desafío relativo: igual o más fuerte = 100% (hasta 150%); un poco más débil = mitad; mucho más débil = casi nada. Farmear no hace fuerte.
  desafio(enemigo) { const j = U.Juego.estado.jugador; const r = U.Estadisticas.poder(enemigo) / Math.max(1, U.Estadisticas.poder(j)); if (r >= 0.9) return Math.min(1.5, 1 + (r - 0.9)); if (r >= 0.65) return 0.5; if (r >= 0.4) return 0.25; return 0.05; },
  stat(stat, base, desafio) {
    const j = U.Juego.estado.jugador; const d = desafio == null ? 1 : desafio; if (d <= 0 || base <= 0) return 0;
    // Nivel y XP por defecto (partidas viejas: nivel 1, XP 0 — sin migración).
    if (!j.nivelStat) j.nivelStat = { vida: 1, esencia: 1, ataque: 1, defensa: 1, mente: 1, velocidad: 1 };
    if (!j.xpStat) j.xpStat = { vida: 0, esencia: 0, ataque: 0, defensa: 0, mente: 0, velocidad: 0 };
    if (j.nivelStat[stat] == null) j.nivelStat[stat] = 1;
    if (j.xpStat[stat] == null) j.xpStat[stat] = 0;
    const tope = U.Estadisticas.topes[stat];
    if (tope && j.stats[stat] >= tope) return 0; // al tope de valor, esa estadística ya no gana XP
    // EL MULTIPLICADOR DE CRECIMIENTO POR ATRIBUTO (favorita ×2, penalizada
    // ×0.6) SE ELIMINÓ: lo reemplaza la barra de XP (ver xpParaNivel). Se
    // CONSERVAN: el multiplicador por desafío (antigranja) y el de polainas
    // (Velocidad en combate multiplica la XP ganada, no la barra).
    let xp = base * d * this.ESCALA_XP;
    if (stat === 'velocidad' && j.polainaEquipada && U.Juego.estado.enCombate) xp *= (j.polainaMultCrec || 1); // POLAINAS: en combate la Velocidad gana más XP
    j.xpStat[stat] += xp;
    let subidos = 0;
    while (j.xpStat[stat] >= U.Estadisticas.xpParaNivel(j.nivelStat[stat], j.atributo, stat)) {
      const need = U.Estadisticas.xpParaNivel(j.nivelStat[stat], j.atributo, stat);
      j.xpStat[stat] -= need; j.nivelStat[stat]++;
      const g = U.Estadisticas.gananciaNivel[stat] || 1;
      const antes = j.stats[stat]; j.stats[stat] = tope ? Math.min(tope, antes + g) : antes + g;
      const real = j.stats[stat] - antes; subidos++;
      if (stat === 'vida') j.vida = Math.min(j.stats.vida, j.vida + real); if (stat === 'esencia') j.esencia = Math.min(j.stats.esencia, j.esencia + real);
      if (tope && j.stats[stat] >= tope) { j.xpStat[stat] = 0; break; } // llegó al tope de valor: se acabó la barra
    }
    if (subidos > 0) {
      const et = U.Estadisticas.etiquetas[stat];
      U.HUD.toast('¡' + et + ' NIVEL ' + j.nivelStat[stat] + '! +' + (U.Estadisticas.gananciaNivel[stat] || 1) + ' ' + et + ' (ahora ' + Math.round(j.stats[stat]) + ')', 'exito');
      U.HUD.banner(et.toUpperCase() + ' · NIVEL ' + j.nivelStat[stat], 1.6); U.Audio.sfx('unlock');
      if (U.HUD.refrescarChips) U.HUD.refrescarChips();
    }
    // acum/total/resumen ahora acumulan XP ganada (no valor): el HUD la muestra como XP.
    this.acum[stat] = (this.acum[stat] || 0) + xp; this.total[stat] = (this.total[stat] || 0) + xp; U.Juego.estado.resumen.crecimiento[stat] = (U.Juego.estado.resumen.crecimiento[stat] || 0) + xp;
    return xp;
  },
  // CURVA DE MAESTRÍA (multiplicativa, NO lineal): la ganancia se divide entre un
  // divisor que CRECE con tu maestría actual. Los primeros tramos también son lentos
  // (factor base 0.62) y cada tramo cuesta más que el anterior: subir de 5% a 6% no
  // cuesta lo mismo que de 6% a 7% — de 6% a 7% cuesta más. Como nivel 50 en Pokémon.
  curvaDiv(antes) { const x = Math.max(0, Math.min(100, antes || 0)) / 100; return 1 + x * 2.4 + x * x * 2.1; },
  maestria(elem, base, desafio) {
    const j = U.Juego.estado.jugador; const d = desafio == null ? 1 : desafio; const a = U.Atributos.de(j.atributo);
    const antes = j.maestria[elem] || 0; const c = base * d * (a.maestriaMult || 1) * ((j.reliquias && j.reliquias.artefactos && j.reliquias.artefactos.indexOf('fragmento') >= 0) ? 1.5 : 1) * 0.62 / this.curvaDiv(antes); // ✦ Fragmento del Meteorito: +50% · curva multiplicativa: cada tramo cuesta más que el anterior
    j.maestria[elem] = Math.min(100, antes + c); U.Juego.estado.resumen.maestria[elem] = (U.Juego.estado.resumen.maestria[elem] || 0) + (j.maestria[elem] - antes);
    // Aviso por TÉCNICA (no por umbral genérico): cada técnica tiene su propio umbral,
    // así un elemento con 2 técnicas en el mismo umbral (Rayo: Destello y Relámpago en
    // cadena, ambas al 40%) avisa las dos, y Juicio (70%) no se pierde ni se confunde
    // con la anterior. UMBRALES [15,40,70] queda como dato histórico en habilidades.js.
    U.Habilidades.elementos[elem].forEach(h => { if (antes < h.umbral && j.maestria[elem] >= h.umbral) { if (j.desdeCero) U.HUD.toast('¡' + h.nombre + ' dominada! Ya es tuya y aparece entre tus botones si hay hueco libre (máx. 5); si no hay hueco, equípala en Pausa → Ajustes → Equipo.', 'exito'); else U.HUD.toast('¡Maestría mínima alcanzada (' + h.umbral + '%): ya puedes aprender ' + h.nombre + ' de un Guía, por tarea! Las técnicas son POCAS y se aprenden, no caen solas.', 'exito'); U.HUD.banner(h.nombre.toUpperCase(), 1.6); U.Audio.sfx('unlock'); U.HUD.refrescarChips(); } });
    if (antes < 100 && j.maestria[elem] >= 100) { U.HUD.banner('DOMINACIÓN DE ' + U.Elementos.nombre(elem).toUpperCase(), 2.5); U.Audio.sfx('victoria'); }
    return j.maestria[elem] - antes;
  },
  estilo(cual, base, desafio) {
    const j = U.Juego.estado.jugador; const antes = j.estilos[cual]; j.estilos[cual] = Math.min(100, antes + base * (desafio == null ? 1 : desafio) * (cual === j.estiloNatural ? 1.5 : 1)); // ESTILO NATURAL: tu inclinación del test (yin o yang) crece ×1.5 más rápido; es tu talento natural
    if (cual === 'yang') { U.Habilidades.yangOrden.forEach(k => { const h = U.Habilidades.yang[k]; if (antes < h.umbral && j.estilos.yang >= h.umbral) { U.HUD.toast((h.forma === 'cono' ? 'Técnica Yang desbloqueada: ' : 'Forma Yang desbloqueada: ') + h.nombre, 'exito'); U.Audio.sfx('unlock'); U.HUD.refrescarChips(); } });
      // Tiempo Lento (Yang avanzado, interruptor): se desbloquea al llegar a Yang 25.
      const tl = U.Habilidades.yang.tiempoLento; if (tl && antes < tl.umbral && j.estilos.yang >= tl.umbral) { U.HUD.toast('Técnica Yang desbloqueada: ' + tl.nombre + ' — el mundo se pone lento y tú sigues a tu velocidad. Drena Esencia rápido.' + (j.desdeCero ? ' Aparece entre tus botones si hay hueco libre; si no, equípala en Pausa → Ajustes → Equipo.' : ' Equípala en Pausa → Ajustes → Equipo.'), 'exito'); U.Audio.sfx('unlock'); U.HUD.refrescarChips(); }
      // Despertar: sin afinidad se empieza en 0, pero entrenando hasta el umbral el Yang despierta igual (como dominar otro elemento).
      if (!j.tieneYang && j.estilos.yang >= U.Habilidades.yangDespertar) { j.tieneYang = true; U.HUD.banner('¡YANG DESPERTADO!', 2.4); U.Audio.sfx('unlock'); U.HUD.refrescarChips(); } }
    else { const s = U.Habilidades.yin.sobrecarga; if (antes < s.umbral && j.estilos.yin >= s.umbral) { U.HUD.toast('Técnica Yin desbloqueada: Sobrecarga (X)', 'exito'); U.Audio.sfx('unlock'); U.HUD.refrescarChips(); }
      const ac = U.Habilidades.yin.acero; if (ac && antes < ac.umbral && j.estilos.yin >= ac.umbral) { U.HUD.toast('Técnica Yin desbloqueada: ' + ac.nombre + ' — tu cuerpo se endurece como acero: el daño que recibes se reduce a la mitad.' + (j.desdeCero ? ' Aparece entre tus botones si hay hueco libre; si no, equípala en Pausa → Ajustes → Equipo.' : ' Equípala en Pausa → Ajustes → Equipo.'), 'exito'); U.Audio.sfx('unlock'); U.HUD.refrescarChips(); } }
  },
  regenCap(base) { const j = U.Juego.estado.jugador; j.regenBonus = Math.min(U.Atributos.de(j.atributo).regen, (j.regenBonus || 0) + base); },
  flush(dt) {
    this.tFlush += dt; if (this.tFlush < 1.2) return; this.tFlush = 0;
    const partes = []; for (const k in this.acum) { if (this.acum[k] >= 0.005) partes.push({ k, txt: U.Estadisticas.etiquetas[k].toUpperCase() + ' +' + (Math.round(this.acum[k] * 100) / 100) + ' XP' }); }
    if (partes.length) { U.HUD.toast(partes.map(p => p.txt).join(' · '), 'crec');
      // Feedback VISIBLE: el toast del HUD es silencioso a propósito, así que el crecimiento se anuncia
      // con texto flotante sobre el jugador. Sin esto las estadísticas SÍ subían al pelear, pero nadie lo veía.
      const cols = { vida: '#ff8a9c', esencia: '#7cc4ff', ataque: '#ffd08a', defensa: '#67e08a', mente: '#e8a2e0', velocidad: '#7ef0c0' };
      const j = U.Juego.estado && U.Juego.estado.jugador;
      if (j && U.Combate && U.Combate.texto) partes.slice(0, 3).forEach((p, i) => U.Combate.texto({ x: j.x, y: j.y - 1.15 - i * 0.55 }, '▲ ' + p.txt, cols[p.k] || '#e8dcc8', 1)); }
    this.acum = {};
  },
  reset() { this.acum = {}; this.total = {}; this.tFlush = 0; }
};
