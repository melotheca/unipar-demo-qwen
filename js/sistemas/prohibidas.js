/* === js/sistemas/prohibidas.js === */
/* Unipar — TÉCNICAS PROHIBIDAS: LA EXCEPCIÓN a la regla de los Guías.
   Normalmente las técnicas se aprenden de un GUÍA completando una tarea. Las prohibidas
   NO: se aprenden de PERGAMINOS raros o enseñanzas secretas escondidas en lugares
   peligrosos, sin Guía, y están prohibidas POR UNA RAZÓN. Aprenderlas o usarlas tiene
   consecuencias: sube la Recompensa (las que son crimen), los NPC cercanos reaccionan
   con miedo y LOS COLECCIONISTAS —que ahora también coleccionan técnicas prohibidas,
   pergaminos raros, objetos peligrosos y conocimiento prohibido— te persiguen por los
   pergaminos que lleves encima en zonas salvajes (como con las máscaras). Guardado en
   el COFRE de tu casa, un pergamino no atrae a nadie. LEYENDA (NO aprendible):
   Las Puertas del Infierno, la técnica con la que Orión selló a El Infernal (y a sí
   mismo); Los Coleccionistas la buscan —es la técnica prohibida más valiosa que
   existe— pero nadie sabe dónde está su pergamino ni si existe: solo vive en rumores. */
window.U = window.U || {};

U.Prohibidas = {
  DEFS: {
    robo: { nombre: 'Robo de Esencia', color: '#4da3ff', costo: 10, cd: 4, crimen: true,
      razon: 'Roba la energía vital de otra persona: su Esencia pasa a ser tuya.',
      desc: 'Golpe a distancia corta (4 celdas) que daña poco pero DRENA la Esencia del enemigo y te la da a ti (+10 a +20 según tu Ataque).',
      consecuencia: 'Es un CRIMEN: cada uso que conecte sube tu Recompensa ⭐ y los vecinos que lo vean te temerán.' },
    toque: { nombre: 'Toque Mortal', color: '#ff4d4d', costo: 0, costoVidaPct: 0.18, cd: 5, crimen: false,
      razon: 'El golpe toma prestada TU propia vida: daña a quien la usa.',
      desc: 'Un solo golpe cuerpo a cuerpo con daño ENORME (×3.2 de tu Ataque), pero te cuesta el 18% de tu Vida máxima a ti. No se puede usar si ese costo te mataría.',
      consecuencia: 'Te daña a TI con cada uso: si abusas, te matas solo. Los vecinos que lo vean se apartarán con miedo.' },
    control: { nombre: 'Control Mental', color: '#e05bd0', costo: 20, cd: 8, crimen: true,
      razon: 'Viola la voluntad de otra persona: la obliga a obedecerte.',
      desc: 'Arte Místico · Mente. El enemigo más cercano (a 5 celdas) pelea POR TI durante 8 s contra los suyos. Sin enemigos cerca, el vecino más cercano te seguirá y obedecerá durante 15 s.',
      consecuencia: 'Es un CRIMEN: sube tu Recompensa ⭐ y los NPC cercanos te temerán de verdad.' },
    invocacion: { nombre: 'Invocación Oscura', color: '#8b7fd4', costo: 25, cd: 12, crimen: false,
      razon: 'Lo que invoca no está bajo tu control: es impredecible y peligroso.',
      desc: 'Invoca un ESPÍRITU OSCURO que pelea a tu lado 30 s (te sigue y ataca a tus enemigos, como una compañera de contrato).',
      consecuencia: 'PELIGRO: 1 de cada 4 veces el espíritu se REBELA al llegar y te ataca a TI. Nunca sabes cuál de las dos cosas va a pasar.' }
  },
  ORDEN: ['robo', 'toque', 'control', 'invocacion'],
  // Pergaminos escondidos en lugares PELIGROSOS del continente (la celda exacta se
  // ajusta sola a la celda libre más cercana, como los tesoros de U.Reliquias).
  PERGAMINOS: [
    { id: 'robo', x: 95, y: 250, lugar: 'las ruinas del Desierto de Sal, pasado el oasis' },
    { id: 'toque', x: 186, y: 228, lugar: 'las ruinas quemadas del Campo de Ceniza' },
    { id: 'control', x: 58, y: 154, lugar: 'las ruinas viejas al oeste de Arcana, la ciudad de los magos' },
    { id: 'invocacion', x: 78, y: 63, lugar: 'una cueva de raíces del Bosque Susurrante' }
  ],
  LEYENDA: 'LAS PUERTAS DEL INFIERNO: la técnica prohibida que usó ORIÓN para sellar a El Infernal (y sellarse a sí mismo con él). Los Coleccionistas la buscan sin descanso: es la técnica prohibida MÁS VALIOSA que existe. Pero nadie sabe dónde está su pergamino… ni si el pergamino existe. Es solo una LEYENDA: vive en rumores e historias y NO se puede aprender.',
  asegurar() {
    const E = U.Juego && U.Juego.estado; const j = E && E.jugador; if (!j) return null;
    if (!j.prohibidas) j.prohibidas = { pergaminos: [], aprendidas: [], casa: [], encontradas: [] };
    const p = j.prohibidas;
    ['pergaminos', 'aprendidas', 'casa', 'encontradas'].forEach(k => { if (!Array.isArray(p[k])) p[k] = []; });
    if (!j.cdProh) j.cdProh = {};
    if (j.prohibidaSel && p.aprendidas.indexOf(j.prohibidaSel) < 0) j.prohibidaSel = p.aprendidas[0] || null;
    if (!j.prohibidaSel && p.aprendidas.length) j.prohibidaSel = p.aprendidas[0];
    return p;
  },
  tiene(id) { const p = this.asegurar(); return !!p && (p.aprendidas.indexOf(id) >= 0 || p.pergaminos.indexOf(id) >= 0 || p.casa.indexOf(id) >= 0); },
  colocarPergaminos() {
    const E = U.Juego.estado; if (!E || E.mapaId !== 'aldea' || !E.mapa || !U.Reliquias) return;
    const p = this.asegurar(); if (!p) return;
    this.PERGAMINOS.forEach(t => {
      if (this.tiene(t.id) || p.encontradas.indexOf(t.id) >= 0) return; // aprendida, llevada, guardada o ya vendida: no reaparece
      if (E.mapa.objetos.some(o => o.tipo === 'pergamino' && o.prohibidaId === t.id)) return;
      const d = this.DEFS[t.id]; const pos = U.Reliquias.celdaLibre(E.mapa, t.x, t.y);
      E.mapa.objetos.push({ tipo: 'pergamino', prohibidaId: t.id, nombreTesoro: 'Pergamino prohibido · ' + d.nombre, color: d.color, x: pos.x, y: pos.y, w: 1, h: 1, solido: false });
    });
  },
  quitarDelMapa(id) { const E = U.Juego.estado; if (!E || !E.mapa) return; const i = E.mapa.objetos.findIndex(o => o.tipo === 'pergamino' && o.prohibidaId === id); if (i >= 0) E.mapa.objetos.splice(i, 1); },
  // ===== RECOGER: primero la ADVERTENCIA, siempre. Aprender es una decisión. =====
  recoger(obj) {
    if (!obj) return;
    const p = this.asegurar(); if (!p) return;
    if (p.aprendidas.indexOf(obj.prohibidaId) >= 0) { this.quitarDelMapa(obj.prohibidaId); U.HUD.toast('Ya conoces ' + this.DEFS[obj.prohibidaId].nombre + ': el pergamino se deshace en ceniza entre tus dedos, como si ya no te necesitara.', 'aviso'); return; }
    this.abrirAdvertencia(obj.prohibidaId);
  },
  abrirAdvertencia(id) {
    const E = U.Juego.estado, j = E.jugador, D = U.Dialogo, d = this.DEFS[id]; if (!d || !D) return;
    const p = this.asegurar(); const yaLlevado = p && p.pergaminos.indexOf(id) >= 0;
    this._pendiente = id;
    D.npc = null; D.esCartel = false; D.modo = 'pergamino'; D.fase = 'normal'; D.abierto = true; E.ui = 'dialogo'; j.descansando = false; j.cargando = false;
    document.getElementById('dialogo').classList.remove('oculto');
    document.getElementById('dlgNombre').textContent = '💀 PERGAMINO PROHIBIDO · ' + d.nombre.toUpperCase(); document.getElementById('dlgEmocion').textContent = '⚠ PROHIBIDO'; document.getElementById('dlgConfTxt').textContent = 'NO se aprende de un Guía';
    document.getElementById('dlgConfianza').firstElementChild.style.width = '0%';
    const cv = document.getElementById('dlgCara'); const ctx = cv.getContext('2d'); ctx.fillStyle = '#1a0b1e'; ctx.fillRect(0, 0, 64, 64); U.Render.iconoCanvas(cv, 'aldea', d.color);
    D.decir('⚠⚠ ADVERTENCIA: ESTO ES UNA TÉCNICA PROHIBIDA ⚠⚠ — ' + d.nombre + '. Las técnicas normales se aprenden de un GUÍA completando una tarea; esta es la EXCEPCIÓN: se aprende de un pergamino, sin Guía y sin permiso de nadie. Está prohibida por una razón: ' + d.razon + ' LO QUE HACE: ' + d.desc + ' CONSECUENCIA: ' + d.consecuencia + ' Y ojo: si llevas el pergamino encima por zonas salvajes, LOS COLECCIONISTAS te pueden salir al paso para quitártelo (sus informantes están en cada pueblo); guardado en el cofre de tu casa, nadie te persigue por él. Piénsalo antes de tocarlo.');
    D.razon = 'Técnica prohibida = la excepción: pergamino, no Guía · peligrosa por una razón · aprenderla o usarla tiene consecuencias';
    D.opciones = [
      { t: '💀 APRENDER ' + d.nombre + ' (acepto el peligro y las consecuencias)', proh: 'aprender' },
      { t: yaLlevado ? '📜 Seguir llevándolo SIN aprenderlo (me lo pueden robar en zonas salvajes)' : '📜 Llevarme el pergamino SIN aprenderlo (me lo pueden robar en zonas salvajes)', proh: 'llevar' },
      { t: yaLlevado ? 'Dejarlo aquí en la mochila por ahora (cerrar)' : 'Dejarlo donde está (no tocarlo)', proh: 'dejar' }
    ];
    D.pintarRazon(); D.pintarOpciones(); U.Audio.sfx('fail');
  },
  elegirPergamino(o) {
    const D = U.Dialogo, id = this._pendiente, d = this.DEFS[id]; if (!d) { D.cerrar(); return; }
    const p = this.asegurar();
    if (o.proh === 'aprender') { this.quitarDelMapa(id); this.aprender(id); D.cerrar(); return; }
    if (o.proh === 'llevar') {
      this.quitarDelMapa(id);
      if (p && p.pergaminos.indexOf(id) < 0) p.pergaminos.push(id);
      D.cerrar();
      U.HUD.banner('📜 LLEVAS EL PERGAMINO DE ' + d.nombre.toUpperCase() + ' SIN APRENDER', 2.6); U.Audio.sfx('unlock');
      U.HUD.toast('Pergamino en tu mochila (sin aprender). Ábrelo y apréndelo cuando quieras desde Pausa → 🎒 Mochila → Técnicas prohibidas. ⚠ En zonas salvajes, Los Coleccionistas pueden salirte al paso para quitártelo; en el cofre de tu casa estaría a salvo.', 'peligro');
      if (U.Guardado) U.Guardado.guardarAuto();
      return;
    }
    D.cerrar();
  },
  aprender(id) {
    const E = U.Juego.estado, j = E.jugador; const p = this.asegurar(); const d = this.DEFS[id]; if (!p || !d) return;
    const i = p.pergaminos.indexOf(id); if (i >= 0) p.pergaminos.splice(i, 1);
    const i2 = p.casa.indexOf(id); if (i2 >= 0) p.casa.splice(i2, 1);
    if (p.aprendidas.indexOf(id) < 0) p.aprendidas.push(id);
    if (p.encontradas.indexOf(id) < 0) p.encontradas.push(id);
    j.prohibidaSel = id;
    U.Combate.particulas(j.x, j.y - 1, 26, d.color, 'chispa');
    U.HUD.banner('💀 ¡TÉCNICA PROHIBIDA APRENDIDA! · ' + d.nombre.toUpperCase(), 3); U.Audio.sfx('unlock');
    if (d.crimen && U.Progresion) U.Progresion.sumarRecompensa(1, 'aprender ' + d.nombre + ', una técnica prohibida (es un crimen)');
    U.HUD.toast('Ya conoces ' + d.nombre + '. Selecciónala en sus chips (💀) y úsala con la tecla G o el botón PROH. Recuerda: ' + d.consecuencia, 'peligro');
    if (U.HUD.refrescarChips) U.HUD.refrescarChips();
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  // ===== CONSECUENCIAS: miedo/rechazo de los NPC que lo ven =====
  reaccion(motivo) {
    const E = U.Juego.estado, j = E.jugador; if (!E || !E.npcs) return 0;
    let n = 0;
    E.npcs.forEach(npc => { if (npc.enCasa || npc.ocultoSparring) return; if (U.Grid.dist(npc, j) > 7) return; n++;
      if (U.Emociones) U.Emociones.evento(npc, { realidad: 22, energia: 38, etiqueta: 'tecnica prohibida' });
      if (U.Economia) U.Economia.confianza(npc, -8);
      if (!npc.hechos) npc.hechos = []; const h = 'te vio usar una técnica prohibida (' + motivo + ') y te teme'; if (npc.hechos.indexOf(h) < 0) { npc.hechos.push(h); if (npc.hechos.length > 8) npc.hechos.shift(); }
      if (U.Combate) U.Combate.texto(npc, '¡¿QUÉ FUE ESO?!', '#ff4d4d', 1);
    });
    if (n) U.HUD.toast('Los vecinos que lo vieron retroceden con miedo: tu técnica prohibida no pasó desapercibida (confianza −8 con cada testigo, y lo recordarán).', 'peligro');
    return n;
  },
  consecuenciaCrimen(id) {
    const d = this.DEFS[id];
    if (d.crimen && U.Progresion) U.Progresion.sumarRecompensa(1, 'usar ' + d.nombre + ', una técnica prohibida (es un crimen)');
    this.reaccion(d.nombre);
  },
  // ===== USO EN COMBATE =====
  seleccionar(id) { const j = U.Juego.estado.jugador; const p = this.asegurar(); if (!p || p.aprendidas.indexOf(id) < 0) return; j.prohibidaSel = id; U.Audio.sfx('click'); if (U.HUD.refrescarChips) U.HUD.refrescarChips(); },
  usarSeleccionada() { const j = U.Juego.estado.jugador; const p = this.asegurar(); if (!p || !p.aprendidas.length) { U.HUD.toast('Aún no conoces ninguna técnica prohibida. Son la EXCEPCIÓN: no se aprenden de un Guía, sino de pergaminos raros escondidos en lugares peligrosos (ruinas del desierto, del Campo de Ceniza, de Arcana y del Bosque). Y la leyenda de Las Puertas del Infierno no se puede aprender: es solo un rumor.', 'aviso'); U.Audio.sfx('fail'); return; } this.usar(j.prohibidaSel || p.aprendidas[0]); },
  usar(id) {
    const E = U.Juego.estado, j = E.jugador; const p = this.asegurar(); const d = this.DEFS[id]; if (!p || !d) return;
    if (p.aprendidas.indexOf(id) < 0) { U.HUD.toast('No conoces ' + d.nombre + ': las técnicas prohibidas se aprenden de su PERGAMINO, no de un Guía.', 'aviso'); U.Audio.sfx('fail'); return; }
    if ((j.cdProh[id] || 0) > 0) return;
    if (j.agotado) { U.HUD.toast('Estás Agotado: ni siquiera lo prohibido sale gratis.', 'aviso'); U.Audio.sfx('fail'); return; }
    const atk = U.Reliquias ? U.Reliquias.statEf(j, 'ataque') : j.stats.ataque;
    if (id === 'robo') {
      const vivos = U.Combate.vivos().filter(e => U.Grid.dist(e, j) <= 4.5).sort((a, b) => U.Grid.dist(a, j) - U.Grid.dist(b, j));
      if (!vivos.length) { U.HUD.toast('Robo de Esencia: ningún enemigo a 4 celdas de quien robar. Acércate: robar exige estar cerca de tu víctima.', 'aviso'); U.Audio.sfx('fail'); return; }
      if (!U.Recuperacion.gastar(d.costo)) return;
      j.cdProh[id] = d.cd; const t = vivos[0];
      U.Combate.dañoEnemigo(t, atk * 0.9, null, { desafio: U.Combate.desafio(t) });
      const robada = Math.round(Math.min(20, 10 + atk * 0.5));
      U.Recuperacion.restaurar(robada); U.Combate.texto(j, '+' + robada + ' ESE ROBADA', '#4da3ff', 2);
      U.Combate.particulas(t.x, t.y - 0.6, 14, '#4da3ff', 'chispa'); U.Audio.sfx('yang'); E.resumen.tecnicas++;
      this.consecuenciaCrimen(id);
    } else if (id === 'toque') {
      const costoVida = Math.max(1, Math.round(j.stats.vida * d.costoVidaPct));
      if (j.vida - costoVida < 1) { U.HUD.toast('Toque Mortal: te costaría ' + costoVida + ' de Vida y te MATARÍA. Está prohibida porque daña a quien la usa: cúrate antes de volver a intentarlo.', 'peligro'); U.Audio.sfx('fail'); return; }
      j.cdProh[id] = d.cd; j.vida -= costoVida; j.ataqueAnim = 0.3; j.descansando = false;
      U.Combate.texto(j, '-' + costoVida + ' (TU VIDA)', '#ff4d4d', 2); U.Combate.sacudir(1.2); U.Audio.sfx('cargado');
      const celdas = U.Grid.forma('cono', j.x, j.y, j.dir, 2.2, 1);
      E.efectos.cortes.push({ x: j.x, y: j.y, dir: j.dir, color: '#ff4d4d', t: 0.25, max: 0.25 });
      let golpes = 0; U.Combate.vivos().forEach(e => { if (U.Grid.enCeldas(celdas, e) || U.Grid.enArco(j.x, j.y, j.dir, 2.65, e)) { golpes++; U.Combate.dañoEnemigo(e, atk * 3.2, null, { desafio: U.Combate.desafio(e), cargado: true }); } });
      if (U.Criaturas) U.Criaturas.impactoJugador(celdas, { arco: { x: j.x, y: j.y, dir: j.dir, alcance: 2.65 }, dmg: atk * 3.2, elemento: null });
      U.Combate.particulas(j.x + j.dir.x, j.y + j.dir.y - 0.6, 18, '#ff4d4d', 'brasa'); E.resumen.tecnicas++;
      U.HUD.toast('💀 TOQUE MORTAL: pagaste ' + costoVida + ' de TU Vida por ese golpe' + (golpes ? ' (' + golpes + ' golpeado(s), daño enorme)' : '… y no había nadie delante. El costo se paga igual: por eso está prohibida') + '.', 'peligro');
      this.reaccion(d.nombre);
    } else if (id === 'control') {
      const vivos = U.Combate.vivos().filter(e => U.Grid.dist(e, j) <= 5.5).sort((a, b) => U.Grid.dist(a, j) - U.Grid.dist(b, j));
      const npcCerca = (E.npcs || []).filter(n => !n.enCasa && !n.ocultoSparring && U.Grid.dist(n, j) <= 4).sort((a, b) => U.Grid.dist(a, j) - U.Grid.dist(b, j))[0];
      if (!vivos.length && !npcCerca) { U.HUD.toast('Control Mental: nadie a tu alcance a quien obligar. Necesitas un enemigo a 5 celdas o un vecino a 4.', 'aviso'); U.Audio.sfx('fail'); return; }
      if (!U.Recuperacion.gastar(d.costo)) return;
      j.cdProh[id] = d.cd; E.resumen.tecnicas++;
      if (vivos.length) { const t = vivos[0]; t.efectos.controlado = 8; U.Combate.texto(t, '🧠 BAJO TU CONTROL', '#e05bd0', 2); U.Combate.particulas(t.x, t.y - 0.8, 16, '#e05bd0', 'chispa'); U.HUD.toast('🧠 CONTROL MENTAL: ' + t.nombre + ' pelea POR TI durante 8 s contra los suyos. Violar una voluntad es un crimen: tu Recompensa puede subir y los testigos te temen.', 'peligro'); }
      else { npcCerca.prohControlT = 15; U.Combate.texto(npcCerca, '🧠 TE OBEDECE…', '#e05bd0', 2); U.HUD.toast('🧠 CONTROL MENTAL: ' + npcCerca.nombre + ' te seguirá y obedecerá durante 15 s, con la mirada vacía. Violar una voluntad es un crimen: tu Recompensa puede subir y los testigos te temen.', 'peligro'); }
      U.Audio.sfx('viento');
      this.consecuenciaCrimen(id);
    } else if (id === 'invocacion') {
      const T = E.prohibidasT || (E.prohibidasT = { cdP: 90, expo: 0, avisoP: 0, coleVivos: 0, espirituUid: null, espirituT: 0 });
      if (T.espirituUid) { U.HUD.toast('Ya hay un espíritu oscuro suelto por tu culpa. Uno es bastante peligro.', 'aviso'); U.Audio.sfx('fail'); return; }
      if (!U.Recuperacion.gastar(d.costo)) return;
      j.cdProh[id] = d.cd; E.resumen.tecnicas++;
      const rebelde = Math.random() < 0.25;
      const uid = 'espiritu_oscuro_' + Math.floor(E.tiempo * 10) + '_' + Math.floor(Math.random() * 9999);
      const c = { tipo: 'criatura', uid, especie: 'espirituBosque', nombre: 'Espíritu oscuro', apodo: 'Umbra', region: 'campos', temperamento: rebelde ? 'hostil' : 'amistosa', elemento: 'viento', sprite: 'espiritu', color: '#4a3577', color2: '#12081f', escala: 1.15, acuatica: false,
        stats: { vida: 80, esencia: 30, ataque: 14, defensa: 6, mente: 12, velocidad: 10 }, vida: 80,
        x: j.x + 1.4, y: j.y + 0.6, home: { x: j.x, y: j.y }, agua: null, dir: { x: 0, y: 1 }, anim: Math.random() * 4, moviendo: false, flash: 0,
        estado: rebelde ? 'persigue' : 'companera', objetivo: null, rutinaT: 2, cdAtaque: 0, respawnT: 0, vinculo: 0, charlasSesion: 0, invocada: !rebelde, w: 1, h: 1, esOscura: true };
      if (U.Criaturas) { const pos = U.Criaturas.asegurarLibre(E.mapa, c.x, c.y, false); c.x = pos.x; c.y = pos.y; }
      E.criaturas = E.criaturas || []; E.criaturas.push(c);
      T.espirituUid = uid; T.espirituT = 30;
      U.Combate.particulas(c.x, c.y - 0.5, 26, '#8b7fd4', 'humo'); U.Audio.sfx('oleada');
      if (rebelde) { U.HUD.banner('🕯 ¡EL ESPÍRITU SE REBELÓ! · TE ATACA A TI', 3); U.HUD.toast('Invocación Oscura: lo que llamaste NO te obedece. Se volvió contra ti, como advertía el pergamino: es impredecible y peligrosa. ¡Pelea o huye!', 'peligro'); }
      else { U.HUD.banner('🕯 ESPÍRITU OSCURO INVOCADO · PELEA POR TI 30 s', 2.6); U.HUD.toast('El espíritu oscuro te sigue y ataca a tus enemigos durante 30 s. Esta vez obedeció… la próxima puede volverse contra ti (1 de cada 4).', 'aviso'); }
      this.reaccion(d.nombre);
    }
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  // ===== LOS COLECCIONISTAS TE PERSIGUEN POR EL PERGAMINO (como con las máscaras) =====
  lanzarEmboscada() {
    const E = U.Juego.estado, j = E.jugador; const T = E.prohibidasT;
    [[3, 1], [-3, -1]].forEach((pp, i) => {
      const c = U.Reliquias.celdaLibre(E.mapa, Math.floor(j.x) + pp[0], Math.floor(j.y) + pp[1]);
      const e = U.Combate.crearEnemigo(i === 0 ? 'veterano' : 'bandido', c.x + 0.5, c.y + 0.5, E.dificultad * 1.1);
      e.nombre = 'Coleccionista · cazador de pergaminos'; e.esOrg = 'coleProhibida';
      E.enemigos.push(e); U.Combate.particulas(e.x, e.y - 0.5, 12, '#d9a441', 'humo');
    });
    if (T) T.coleVivos = 2;
    U.HUD.banner('💀 ¡LOS COLECCIONISTAS QUIEREN TU PERGAMINO PROHIBIDO!', 3);
    U.HUD.toast('Sus informantes avisaron: llevas un pergamino prohibido en zona salvaje y vienen a QUITÁRTELO, como hacen con las máscaras. ¡Pelea o huye! (También podrías vendérselo a Petra en Arcana por muchas monedas… o guardarlo en el cofre de tu casa, donde no te persiguen.)', 'peligro');
    U.Audio.sfx('oleada');
  },
  coleccionistaCaido() {
    const E = U.Juego.estado, j = E.jugador; const T = E.prohibidasT; if (!T || !T.coleVivos) return;
    T.coleVivos--; if (T.coleVivos > 0) return;
    j.monedas = (j.monedas || 0) + 50;
    U.HUD.toast('Los Coleccionistas caídos llevaban 50 🪙. Su red de informantes ya sabe que el pergamino tiene un dueño que se defiende… y que conoce técnicas prohibidas.', 'exito');
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  // ===== COFRE DE LA CASA: el pergamino guardado no atrae a nadie =====
  dejarEnCasa(id) {
    const p = this.asegurar(); if (!p) return '…';
    const i = p.pergaminos.indexOf(id); if (i < 0) return 'Ese pergamino no está contigo.';
    p.pergaminos.splice(i, 1); if (p.casa.indexOf(id) < 0) p.casa.push(id);
    if (U.Guardado) U.Guardado.guardarAuto();
    return 'Dejas el pergamino de ' + this.DEFS[id].nombre + ' en el cofre de tu casa. Guardado, Los Coleccionistas NO te persiguen por él: sus informantes solo señalan lo que LLEVAS encima. (Lo ya aprendido no se guarda: el conocimiento se queda contigo.)';
  },
  recogerDeCasa(id) {
    const p = this.asegurar(); if (!p) return '…';
    const i = p.casa.indexOf(id); if (i < 0) return 'Ese pergamino no está en el cofre.';
    p.casa.splice(i, 1); if (p.pergaminos.indexOf(id) < 0) p.pergaminos.push(id);
    if (U.Guardado) U.Guardado.guardarAuto();
    return 'Recoges el pergamino de ' + this.DEFS[id].nombre + ' del cofre: vuelve a tu mochila… y vuelve el riesgo en zonas salvajes.';
  },
  accionMochila(accion, id) {
    const E = U.Juego.estado;
    if (accion === 'usar') { this.usar(id); return; }
    if (accion === 'aprender') { if (E && E.ui === 'pausa' && U.Juego.togglePausa) U.Juego.togglePausa(); setTimeout(() => this.abrirAdvertencia(id), 90); return; }
    if (accion === 'dejar' || accion === 'recoger') {
      if (!E || E.mapaId !== 'casa') { U.HUD.toast('El almacenamiento está en tu CASA: entra en la casa azul de Bruma y usa el COFRE (o abre la Mochila estando dentro de casa).', 'aviso'); U.Audio.sfx('fail'); return; }
      U.HUD.toast(accion === 'dejar' ? this.dejarEnCasa(id) : this.recogerDeCasa(id), 'exito');
    }
  },
  htmlMochila() {
    const E = U.Juego.estado; const p = this.asegurar(); if (!p) return '';
    const enCasa = E.mapaId === 'casa'; const esc = s => U.HUD.escHtml(s);
    let h = '<section><h3>💀 Técnicas prohibidas · LA EXCEPCIÓN (no se aprenden de un Guía)</h3>';
    h += '<div style="font-size:11px;color:var(--textoFrio)">Las técnicas normales se aprenden de un GUÍA por tarea. Estas NO: se aprenden de PERGAMINOS raros escondidos en lugares peligrosos, y están prohibidas por una razón. Aprenderlas o usarlas tiene consecuencias: Recompensa ⭐, miedo de los NPC y Los Coleccionistas tras tus pergaminos en zonas salvajes (en el cofre de tu casa, a salvo).</div>';
    this.ORDEN.forEach(id => {
      const d = this.DEFS[id]; const ap = p.aprendidas.indexOf(id) >= 0, per = p.pergaminos.indexOf(id) >= 0, enCofre = p.casa.indexOf(id) >= 0;
      const t = this.PERGAMINOS.find(x => x.id === id);
      h += '<div class="mochilaItem"><span>💀 <b style="color:' + d.color + '">' + esc(d.nombre) + '</b> <small style="color:var(--textoFrio)">' + (ap ? 'APRENDIDA · ' + esc(d.desc) + ' Consecuencia: ' + esc(d.consecuencia) : per ? 'PERGAMINO CONTIGO (sin aprender) · Prohibida porque: ' + esc(d.razon) : enCofre ? 'pergamino guardado en el cofre de tu casa (sin riesgo)' : 'todavía no la tienes: su pergamino está en ' + (t ? t.lugar : 'un lugar peligroso')) + '</small></span><span class="acts">'
        + (ap ? '<button class="mini peligro" data-prohibida="usar" data-id="' + id + '">USAR (G)</button>' : '')
        + (per ? '<button class="mini peligro" data-prohibida="aprender" data-id="' + id + '">LEER Y APRENDER</button>' : '')
        + (per && enCasa ? '<button class="mini" data-prohibida="dejar" data-id="' + id + '">DEJAR EN CASA</button>' : '')
        + (enCofre && enCasa ? '<button class="mini exito" data-prohibida="recoger" data-id="' + id + '">RECOGER</button>' : '') + '</span></div>';
    });
    h += '<div style="font-size:11px;color:var(--textoTenue)">🕯 LEYENDA (no aprendible): ' + esc(this.LEYENDA) + '</div>';
    if (!enCasa) h += '<div style="font-size:11px;color:var(--textoTenue)">🏠 Para guardar o recoger un pergamino, ve al COFRE de tu casa (la casa azul de Aldea de Bruma).</div>';
    return h + '</section>';
  },
  tick(dt) {
    const E = U.Juego.estado; if (!E || !E.jugador) return;
    const j = E.jugador; const p = this.asegurar(); if (!p) return;
    this.colocarPergaminos();
    for (const k in j.cdProh) j.cdProh[k] = Math.max(0, j.cdProh[k] - dt);
    if (!E.prohibidasT) E.prohibidasT = { cdP: 90, expo: 0, avisoP: 0, coleVivos: 0, espirituUid: null, espirituT: 0 };
    const T = E.prohibidasT;
    // Espíritu oscuro invocado: dura 30 s y luego se desvanece (o cae peleando).
    if (T.espirituUid) {
      const c = (E.criaturas || []).find(x => x.uid === T.espirituUid);
      if (!c || c.vida <= 0) { if (c && c.vida <= 0) { const i = E.criaturas.indexOf(c); if (i >= 0) E.criaturas.splice(i, 1); } T.espirituUid = null; T.espirituT = 0; U.HUD.toast('El espíritu oscuro se desvaneció en humo negro. Lo invocado nunca se queda.', 'aviso'); }
      else { T.espirituT -= dt; if (T.espirituT <= 0) { const i = E.criaturas.indexOf(c); if (i >= 0) E.criaturas.splice(i, 1); U.Combate.particulas(c.x, c.y - 0.5, 14, '#8b7fd4', 'humo'); T.espirituUid = null; U.HUD.toast('El espíritu oscuro cumplió sus 30 s y se desvaneció.', ''); if (U.Guardado) U.Guardado.guardarAuto(); } }
    }
    // Control Mental sobre un vecino: te sigue y obedece mientras dura el efecto.
    (E.npcs || []).forEach(n => { if ((n.prohControlT || 0) > 0) { n.prohControlT -= dt; const dx = j.x - n.x, dy = j.y - n.y, dd = Math.hypot(dx, dy); if (dd > 1.7) U.Grid.mover(E.mapa, n, dx / dd * 2.3 * dt, dy / dd * 2.3 * dt); } });
    if (E.mapaId !== 'aldea' || E.ui !== 'mundo') return;
    if (!U.Reliquias || !U.Reliquias.esSalvaje(E)) { T.expo = 0; return; } // EN LOS PUEBLOS NO PASA NADA
    const ocupado = E.enCombate || (E.arena && E.arena.activa) || E.torneo || E.reto;
    if (p.pergaminos.length && !ocupado) {
      T.avisoP -= dt;
      if (T.avisoP <= 0) { T.avisoP = 90; U.HUD.toast('💀 Zona salvaje con un pergamino prohibido encima: los informantes de Los Coleccionistas están en cada pueblo y pueden salirte al paso para quitártelo. En los pueblos estás a salvo; en tu casa puedes dejarlo en el cofre.', 'aviso'); }
      T.expo += dt; T.cdP -= dt;
      if (T.expo >= 10 && T.cdP <= 0) { T.cdP = 160 + Math.random() * 60; T.expo = 0; this.lanzarEmboscada(); }
    } else T.expo = 0;
  }
};
