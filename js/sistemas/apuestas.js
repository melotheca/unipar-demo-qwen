/* === js/sistemas/apuestas.js === */
/* Unipar — APOSTAR EN LA ARENA (modo espectador).
   Rolo, el organizador, se para junto a la Arena de Bruma y anuncia la
   próxima pelea: dos luchadores de la arena pelean DE VERDAD y A LA VISTA
   (se mueven, se pegan, se ven sus barras de vida) mientras el jugador MIRA.
   El jugador apuesta por uno antes de que empiece: elige luchador y cantidad;
   las cuotas salen de comparar la fuerza de ambos (U.ApuestasDatos.cuotasDe)
   y se muestran ANTES de apostar, con la fuerza y la probabilidad.
   Si gana su luchador, cobra apuesta × cuota; si pierde, pierde la apuesta.
   Sin monedas suficientes no se puede apostar (mínimo 10 🪙).
   REGLAS DE INTEGRACIÓN CON LO QUE YA HAY (sin tocar otros archivos):
   - Los luchadores son E.enemigos con esApuesta: el render ya los dibuja con
     su barra de vida. Su escudoT se mantiene alto a propósito: eso congela la
     IA genérica de U.Combate (que persigue al jugador) Y bloquea el daño del
     jugador en dañoEnemigo (sale 'ESCUDO'): la pelea es de exhibición, el
     jugador no puede intervenir ni ser atacado. El daño de la pelea lo aplica
     este sistema directamente a f.vida (nunca dañoEnemigo/morir: sin monedas
     ni orbes de más). El anillo magenta del render es el círculo protector
     del organizador: así se ve que nadie puede tocarlos.
   - El jugador tampoco puede entrar al círculo durante la pelea: este
     sistema lo empuja suavemente hacia afuera (barrera del organizador).
   - La UI usa U.Dialogo.mostrarTexto + botones propios añadidos a
     #dlgOpciones (el diálogo es modo cartel: solo trae 'Cerrar'; no se toca
     dialogo.js). U.HUD.toast es no-op en este proyecto: los avisos van por
     banner y por diálogo.
   - El organizador es un NPC literal en E.roster (id 'organizador'): se
     repone cada tick a su sitio (no deambula). La integración en main.js lo
     excluye del candidato 'HABLAR' genérico; su única entrada es el
     candidato 'apuestas'.
   - NO se toca el Escudo del jugador, ni los 6 momentos, ni arena/torneo/reto. */
window.U = window.U || {};

U.Apuestas = {
  DURACION_MAX: 90, // una pelea no dura más de 90 s: gana el que más vida tenga

  // ---------- estado ----------
  asegurar() {
    const E = U.Juego.estado; if (!E) return null;
    if (!E.apuestas) E.apuestas = { fase: 'idle', pareja: null, cuotas: null, apuesta: null, t: 0, cuenta: 0, ultimoConteo: 0, ultimoPar: null, historial: [], stats: { apuestas: 0, ganadas: 0, perdidas: 0, ganado: 0, perdido: 0 } };
    this.asegurarOrganizador();
    return E.apuestas;
  },
  centroArena() { const E = U.Juego.estado; const a = E.mapa.arena; return { x: a.x + 0.5, y: a.y + 0.5, r: a.r }; },
  posOrganizador() { const c = this.centroArena(); return { x: c.x, y: c.y + c.r - 1.5 }; }, // dentro del círculo, borde sur
  etiquetaOrganizador() { const A = U.Juego.estado.apuestas; if (A && A.fase === 'conteo') return 'Rolo, el organizador · ¡La pelea está por empezar! (tócalo para cancelar tu apuesta)'; return 'Rolo, el organizador de apuestas · ¡La próxima pelea ya está armada!'; },
  mostrarOrganizador() { const E = U.Juego.estado; if (!E || E.mapaId !== 'aldea') return false; const A = E.apuestas; if (A && A.fase === 'pelea') return false; return !E.arena.activa && !E.torneo && !E.reto; },
  puedeApostar() { const E = U.Juego.estado; const A = this.asegurar(); if (!E || !A) return false; return A.fase === 'idle' && !E.arena.activa && !E.torneo && !E.reto && E.mapaId === 'aldea'; },

  asegurarOrganizador() {
    const E = U.Juego.estado; if (!E || E.mapaId !== 'aldea' || !E.roster) return;
    if (E.roster.some(n => n.id === 'organizador')) return;
    const o = this.posOrganizador();
    const npc = { id: 'organizador', nombre: 'Rolo', rol: 'Organizador de apuestas', x: o.x, y: o.y, home: { x: o.x, y: o.y }, dir: { x: 0, y: 1 }, anim: 0, moviendo: false, fase: 0,
      casaPos: { x: o.x, y: o.y }, enCasa: false,
      rasgos: { perdon: 0.5, sensibilidad: 0.5, confianzaBase: 50 },
      estados: { animo: 70, energia: 60, confianza: 50, expectativa: 50 }, emocion: 'alegre', memoria: [], objetivo: null, tObj: 99, bumpCd: 0, stockPociones: 0, entreno: false, saludado: true, hechos: ['organiza las apuestas de la arena'], veces: 0, mapa: 'aldea', ruta: [], rutaKey: '', rutaT: 0, viaje: null, destinoActual: null, vidaSim: 100, atacando: 0, ocultoSparring: false, enCirculo: false, sparringCansado: 0, idleT: 0, microPunto: null, microT: 0 };
    E.roster.push(npc);
    if (U.Juego.refrescarNpcs) U.Juego.refrescarNpcs();
  },
  fijarOrganizador() {
    const E = U.Juego.estado; if (!E) return;
    const n = (E.npcs || []).find(x => x.id === 'organizador') || (E.roster || []).find(x => x.id === 'organizador');
    if (!n) return;
    const o = this.posOrganizador();
    n.x = o.x; n.y = o.y; n.ruta = []; n.rutaKey = ''; n.viaje = null; n.enCasa = false; n.moviendo = false; n.objetivo = null; n.destinoActual = null; n.mapa = 'aldea';
  },

  // ---------- UI (diálogo cartel + botones propios) ----------
  botones(ops) {
    if (typeof document === 'undefined') return;
    const c = document.getElementById('dlgOpciones'); if (!c) return;
    ops.forEach((o, i) => { const b = document.createElement('button'); b.innerHTML = '<span class="k">' + (i + 1) + '</span>' + o.t; b.addEventListener('click', o.fn); c.appendChild(b); });
  },
  abrir() {
    const E = U.Juego.estado, j = E.jugador; const A = this.asegurar(); if (!A) return;
    if (A.fase === 'pelea') { U.Dialogo.mostrarTexto('🎲 APUESTAS DE LA ARENA', 'La pelea ya empezó: mírala desde fuera del círculo. Cuando termine, Rolo paga a los ganadores.'); return; }
    if (A.fase === 'conteo') {
      const ap = A.apuesta;
      U.Dialogo.mostrarTexto('🎲 APUESTAS DE LA ARENA', '¡La pelea está por empezar! ' + (ap ? 'Tu apuesta: ' + ap.cantidad + ' 🪙 por ' + U.ApuestasDatos.porId(ap.luchador).nombre + ' (cuota ' + ap.cuota + '×).' : 'Pelea sin apuesta: solo miras.') + ' ¿La cancelamos? Si cancelas ahora, te devuelvo la apuesta completa.');
      this.botones([
        { t: '↩ Cancelar la pelea y que me devuelvan la apuesta', fn: () => this.cancelarPelea('Cancelaste antes de que empezara: te devuelvo la apuesta completa.') },
        { t: 'Que empiece, no me rajo', fn: () => U.Dialogo.cerrar() }
      ]);
      return;
    }
    if (E.arena.activa || E.torneo || E.reto) { U.Dialogo.mostrarTexto('🎲 APUESTAS DE LA ARENA', 'Ahora no hay apuestas: hay otro combate en curso. Cuando termine, vuelve: Rolo siempre tiene una pelea armada.'); return; }
    const c = this.centroArena();
    if (U.Grid.dist(j, c) > c.r + 4) { U.HUD.banner('Acércate a la Arena de Bruma para apostar.', 1.6); return; }
    const par = U.ApuestasDatos.parejaAlAzar(A.ultimoPar);
    const lA = U.ApuestasDatos.porId(par[0]), lB = U.ApuestasDatos.porId(par[1]);
    const cu = U.ApuestasDatos.cuotasDe(lA, lB);
    A.pareja = par; A.cuotas = cu; A.ultimoPar = par;
    const ficha = l => '⚔ ' + l.nombre + ' «' + l.apodo + '» · ' + U.Elementos.nombre(l.elemento) + '\n   ' + l.personalidad + '\n   Movimientos: ' + l.set.map(t => t.nombre).join(' · ') + '\n   Vida ' + l.stats.vida + ' · Ataque ' + l.stats.ataque + ' · Defensa ' + l.stats.defensa + ' · Velocidad ' + l.stats.velocidad;
    const texto = '🎲 APUESTAS DE LA ARENA · Rolo, el organizador\n«¡La próxima pelea ya está armada! Dos luchadores, un solo ganador. Yo pongo las cuotas, tú pones las monedas.»\n\n' + ficha(lA) + '\n   💪 Fuerza ' + cu.fA + ' · Cuota ' + cu.a + '× (' + Math.round(cu.pA * 100) + '% de probabilidad)\n\n' + ficha(lB) + '\n   💪 Fuerza ' + cu.fB + ' · Cuota ' + cu.b + '× (' + Math.round(cu.pB * 100) + '% de probabilidad)\n\nCuota = 1 ÷ probabilidad: el fuerte paga menos, el débil paga más. La fuerza suma vida, ataque, defensa, velocidad, mente y el set de movimientos de cada uno.\nTu bolsa: ' + Math.floor(j.monedas || 0) + ' 🪙 · Apuesta mínima: 10 🪙.\nSi gana tu luchador, cobras tu apuesta × su cuota. Si pierde, la pierdes. Miras la pelea desde fuera del círculo: nadie puede intervenir, el círculo del organizador los protege.';
    U.Dialogo.mostrarTexto('🎲 APUESTAS DE LA ARENA', texto);
    this.botones([
      { t: '⚔ Apostar por ' + lA.nombre + ' (cuota ' + cu.a + '×)', fn: () => this.elegirLuchador(lA.id) },
      { t: '⚔ Apostar por ' + lB.nombre + ' (cuota ' + cu.b + '×)', fn: () => this.elegirLuchador(lB.id) },
      { t: '👀 Solo mirar la pelea (sin apuesta)', fn: () => this.empezarPelea(null) },
      { t: '📜 Historial de apuestas', fn: () => this.verHistorial() }
    ]);
  },
  elegirLuchador(id) {
    const E = U.Juego.estado, j = E.jugador; const A = E.apuestas; if (!A || !A.pareja) return;
    const l = U.ApuestasDatos.porId(id); const cu = A.cuotas;
    const cuota = A.pareja[0] === id ? cu.a : cu.b;
    const monedas = Math.floor(j.monedas || 0);
    const montos = U.ApuestasDatos.MONTOS.filter(m => m <= monedas);
    if (!montos.length) { U.Dialogo.mostrarTexto('🎲 APUESTAS DE LA ARENA', 'Quieres apostar por ' + l.nombre + ', pero traes ' + monedas + ' 🪙 y la apuesta mínima es 10 🪙. Gana monedas con las misiones del tablón de Lía y vuelve.'); this.botones([{ t: '↩ Volver a la cartelera', fn: () => this.abrir() }]); return; }
    let texto = 'Vas con ' + l.nombre + ' «' + l.apodo + '» (cuota ' + cuota + '×).\n¿Cuánto le apuestas? Si gana, cobras lo que apuestes × ' + cuota + '.\nTu bolsa: ' + monedas + ' 🪙.';
    U.Dialogo.mostrarTexto('🎲 APUESTAS DE LA ARENA', texto);
    const ops = montos.map(m => ({ t: m + ' 🪙 → si gana, cobras ' + Math.round(m * cuota) + ' 🪙', fn: () => this.colocarApuesta(id, m, cuota) }));
    if (monedas > 100 && montos.indexOf(monedas) < 0) ops.push({ t: '💰 Todo (' + monedas + ' 🪙) → si gana, cobras ' + Math.round(monedas * cuota) + ' 🪙', fn: () => this.colocarApuesta(id, monedas, cuota) });
    ops.push({ t: '↩ Volver a la cartelera', fn: () => this.abrir() });
    this.botones(ops);
  },
  verHistorial() {
    const A = U.Juego.estado.apuestas; const h = (A && A.historial) || [];
    let texto = '📜 HISTORIAL DE APUESTAS\n';
    if (!h.length) texto += 'Aún no hay apuestas. La primera pelea con tu nombre está por armarse.';
    else {
      texto += h.slice(-8).reverse().map(r => '· ' + r.a + ' vs ' + r.b + ' → ganó ' + r.ganador + (r.apostado ? ' · apostaste ' + r.cantidad + ' 🪙 por ' + r.apostado + ' (' + r.resultado + (r.cobro ? ', cobraste ' + r.cobro + ' 🪙' : '') + ')' : ' · solo miraste')).join('\n');
      const s = A.stats; texto += '\n\nTotal: ' + s.apuestas + ' apuestas · ' + s.ganadas + ' ganadas · ' + s.perdidas + ' perdidas · ganado ' + s.ganado + ' 🪙 · perdido ' + s.perdido + ' 🪙.';
    }
    U.Dialogo.mostrarTexto('📜 HISTORIAL DE APUESTAS', texto);
    this.botones([{ t: '↩ Volver a la cartelera', fn: () => this.abrir() }]);
  },
  colocarApuesta(id, cantidad, cuota) {
    const E = U.Juego.estado, j = E.jugador; const A = E.apuestas;
    if (!A || A.fase !== 'idle') return;
    if ((j.monedas || 0) < cantidad) { U.Dialogo.mostrarTexto('🎲 APUESTAS DE LA ARENA', 'No te alcanza: quieres apostar ' + cantidad + ' 🪙 y traes ' + Math.floor(j.monedas || 0) + '.'); this.botones([{ t: '↩ Volver a la cartelera', fn: () => this.abrir() }]); return; }
    j.monedas -= cantidad;
    A.apuesta = { luchador: id, cantidad, cuota };
    if (U.Audio) U.Audio.sfx('click');
    this.empezarPelea(A.apuesta);
  },
  empezarPelea(apuesta) {
    const E = U.Juego.estado; const A = E.apuestas;
    if (U.Dialogo) U.Dialogo.cerrar();
    A.fase = 'conteo'; A.t = 3.2; A.cuenta = 0; A.ultimoConteo = 4;
    const lA = U.ApuestasDatos.porId(A.pareja[0]), lB = U.ApuestasDatos.porId(A.pareja[1]);
    U.HUD.banner('🎲 ' + lA.nombre.toUpperCase() + ' VS ' + lB.nombre.toUpperCase() + (apuesta ? ' · TU APUESTA: ' + apuesta.cantidad + ' 🪙 POR ' + U.ApuestasDatos.porId(apuesta.luchador).nombre.toUpperCase() : ' · SOLO MIRAS'), 2.6);
    if (U.Audio) U.Audio.sfx('oleada');
  },
  cancelarPelea(motivo) {
    const E = U.Juego.estado; const A = E.apuestas; if (!A || A.fase === 'idle') return;
    if (A.apuesta) { E.jugador.monedas = (E.jugador.monedas || 0) + A.apuesta.cantidad; A.apuesta = null; }
    E.enemigos = E.enemigos.filter(e => !e.esApuesta);
    A.fase = 'idle'; A.pareja = null; A.cuotas = null;
    if (U.Dialogo) U.Dialogo.cerrar();
    U.HUD.banner(motivo || 'Pelea cancelada: te devuelvo la apuesta.', 2.2);
    if (U.Audio) U.Audio.sfx('fail');
  },

  // ---------- pelea visible ----------
  crearRuntime(def, x, y) {
    const stats = Object.assign({}, def.stats);
    return { tipo: 'enemigo', clase: def.clase, nombre: def.nombre + ' «' + def.apodo + '»', elemento: def.elemento, x, y,
      dir: { x: 0, y: 1 }, stats, vida: stats.vida, estado: 'persigue', t: 0, cd: 1 + Math.random(), anim: Math.random(), moviendo: false, flash: 0,
      efectos: { stun: 0, slow: 0, dot: null, invertido: 0, invMapa: null, cegado: 0 }, tele: null, esReto: false, nocturno: false,
      escudoT: 9999, escudoCd: 9999, esTorneo: false, esProteccion: false, esApuesta: true,
      ap: { def, cds: {}, buffAtk: 1, buffDef: 1, buffAtkT: 0, buffDefT: 0, debuffAtk: 1, debuffAtkT: 0, stunT: 0, cegadoT: 0, slowT: 0, dot: null, windup: null, atkAnimT: 0, aviso30: false } };
  },
  spawnLuchadores() {
    const E = U.Juego.estado, A = E.apuestas; const c = this.centroArena();
    const dx = Math.min(3.5, c.r * 0.5);
    const fA = this.crearRuntime(U.ApuestasDatos.porId(A.pareja[0]), c.x - dx, c.y);
    const fB = this.crearRuntime(U.ApuestasDatos.porId(A.pareja[1]), c.x + dx, c.y);
    fA.dir = { x: 1, y: 0 }; fB.dir = { x: -1, y: 0 };
    E.enemigos.push(fA, fB);
    if (U.Combate) { U.Combate.particulas(fA.x, fA.y - 0.5, 12, U.Elementos.color(fA.elemento), 'humo'); U.Combate.particulas(fB.x, fB.y - 0.5, 12, U.Elementos.color(fB.elemento), 'humo'); U.Combate.texto(fA, '«' + fA.ap.def.apodo + '»', '#ffe14d', 1); U.Combate.texto(fB, '«' + fB.ap.def.apodo + '»', '#ffe14d', 1); }
    A.fase = 'pelea'; A.tPelea = 0;
    U.HUD.banner('⚔ ¡A LUCHAR! · ' + fA.nombre + ' VS ' + fB.nombre, 2);
    if (U.Audio) U.Audio.sfx('oleada');
  },
  alcanceTec(tec) {
    if (tec.forma === 'circulo' || tec.forma === 'destello') return tec.alcance > 0 ? tec.alcance : (tec.radio || 0);
    return tec.alcance || 0;
  },
  condOk(tec, at) {
    if (tec.condicion && tec.condicion.vidaMenor != null) return at.vida <= at.stats.vida * tec.condicion.vidaMenor;
    return true;
  },
  // Un paso de la pelea: at actúa contra df. Devuelve el ganador (at o df) si
  // alguien cayó, o null. La misma función mueve el combate en vivo y la
  // simulación rápida de simular() / del test.
  pasoPelea(at, df, dt, ctx) {
    if (!at || !df || at.vida <= 0 || df.vida <= 0) return at.vida > 0 && df.vida <= 0 ? at : (df.vida > 0 && at.vida <= 0 ? df : null);
    at.escudoT = 9999; // congela la IA genérica y blinda contra el daño del jugador
    const ap = at.ap, dp = df.ap;
    for (const k in ap.cds) ap.cds[k] = Math.max(0, ap.cds[k] - dt);
    if (ap.buffAtkT > 0) { ap.buffAtkT -= dt; if (ap.buffAtkT <= 0) ap.buffAtk = 1; }
    if (ap.buffDefT > 0) { ap.buffDefT -= dt; if (ap.buffDefT <= 0) ap.buffDef = 1; }
    if (ap.debuffAtkT > 0) { ap.debuffAtkT -= dt; if (ap.debuffAtkT <= 0) ap.debuffAtk = 1; }
    if (ap.stunT > 0) ap.stunT -= dt;
    if (ap.cegadoT > 0) ap.cegadoT -= dt;
    if (ap.slowT > 0) ap.slowT -= dt;
    if (ap.atkAnimT > 0) { ap.atkAnimT -= dt; if (ap.atkAnimT <= 0) at.estado = 'persigue'; }
    at.flash = Math.max(0, (at.flash || 0) - dt);
    if (ap.dot) { const d = ap.dot; d.t -= dt; d.tick += dt; if (d.tick >= 0.5) { d.tick = 0; const dd = Math.max(1, Math.round(d.dmg)); at.vida -= dd; if (U.Combate) U.Combate.texto(at, '-' + dd + ' 🔥', '#ff7a2f', 1); if (at.vida <= 0) { at.vida = 0; return df; } } if (d.t <= 0) ap.dot = null; }
    const dx = df.x - at.x, dy = df.y - at.y, dist = Math.hypot(dx, dy) || 0.001;
    at.dir = U.Grid.dir8(dx, dy);
    // Aviso al 30% de vida (una sola vez por luchador): el público lo nota.
    if (!ap.aviso30 && at.vida <= at.stats.vida * 0.3) { ap.aviso30 = true; if (U.Combate) U.Combate.texto(at, '¡' + at.ap.def.nombre.toUpperCase() + ' AGUANTA!', '#ffe14d', 1); }
    if (ap.stunT > 0) { at.moviendo = false; return null; } // aturdido: no se mueve ni pega
    // Carga (windup): se queda quieto cargando y luego dispara.
    if (ap.windup) {
      const w = ap.windup; w.t -= dt; at.moviendo = false;
      if (Math.random() < dt * 8 && U.Combate) U.Combate.particulas(at.x, at.y - 0.6, 1, U.Elementos.color(at.elemento), 'chispa');
      if (w.t <= 0) { ap.windup = null; this.dispararTec(at, df, w.tec, ctx); }
      return at.vida <= 0 || df.vida <= 0 ? (df.vida <= 0 ? at : df) : null;
    }
    // ¿Hay técnica lista y al alcance?
    const listas = at.ap.def.set.filter(t => (ap.cds[t.id] || 0) <= 0 && this.condOk(t, at) && this.alcanceTec(t) >= dist - 0.4);
    if (listas.length) {
      // Preferir el golpe más fuerte; de vez en cuando, un apoyo (buff/cura).
      const ataques = listas.filter(t => (t.power || 0) > 0).sort((a, b) => (b.power || 0) - (a.power || 0));
      const apoyos = listas.filter(t => (t.power || 0) === 0);
      let tec = null;
      if (apoyos.length && Math.random() < 0.35) {
        const util = apoyos.filter(t => (t.cura && at.vida < at.stats.vida * 0.7) || (t.buff && ((t.buff.atk && ap.buffAtkT <= 0) || (t.buff.def && ap.buffDefT <= 0))) || t.debuff);
        tec = util.length ? util[Math.floor(Math.random() * util.length)] : (ataques[0] || apoyos[0]);
      } else tec = ataques.length ? ataques[Math.random() < 0.7 ? 0 : Math.floor(Math.random() * Math.min(2, ataques.length))] : apoyos[0];
      if (tec) {
        if (tec.windup) { ap.windup = { tec, t: tec.windup }; if (U.Combate) U.Combate.texto(at, '¡CARGANDO ' + tec.nombre.toUpperCase() + '…!', '#ffe14d', 1); }
        else this.dispararTec(at, df, tec, ctx);
      }
    } else {
      // Acercarse al rival (lento si está frenado).
      const vel = (2.2 + at.stats.velocidad * 0.06) * (ap.slowT > 0 ? 0.5 : 1);
      U.Grid.mover(ctx.mapa, at, dx / dist * vel * dt, dy / dist * vel * dt);
      at.moviendo = true; at.anim += dt;
    }
    // Separación y límite del círculo.
    if (dist < 0.8 && dist > 0.001) U.Grid.mover(ctx.mapa, at, -dx / dist * dt * 1.2, -dy / dist * dt * 1.2);
    const dcx = at.x - ctx.cx, dcy = at.y - ctx.cy, dc = Math.hypot(dcx, dcy);
    if (dc > ctx.r - 0.8 && dc > 0.001) { at.x = ctx.cx + dcx / dc * (ctx.r - 0.8); at.y = ctx.cy + dcy / dc * (ctx.r - 0.8); }
    if (df.vida <= 0) { df.vida = 0; return at; }
    if (at.vida <= 0) { at.vida = 0; return df; }
    return null;
  },
  dispararTec(at, df, tec, ctx) {
    const ap = at.ap; ap.cds[tec.id] = tec.cd || 1;
    at.estado = 'ataca'; ap.atkAnimT = 0.25; at.moviendo = false;
    const el = tec.elemento || at.elemento;
    const col = U.Elementos.color(el);
    // Apoyos sin daño directo.
    if (tec.cura && !(tec.power > 0)) { const cur = Math.min(tec.cura, at.stats.vida - at.vida); at.vida += cur; if (U.Combate) { U.Combate.texto(at, '+' + Math.round(cur) + ' 💧', '#67e08a', 1); U.Combate.particulas(at.x, at.y - 0.6, 10, '#67e08a', 'cura'); } if (U.Audio) U.Audio.sfx('cura'); return; }
    if (tec.buff && !(tec.power > 0)) {
      if (tec.buff.atk) { ap.buffAtk = tec.buff.atk; ap.buffAtkT = tec.buff.t; }
      if (tec.buff.def) { ap.buffDef = tec.buff.def; ap.buffDefT = tec.buff.t; }
      if (U.Combate) { U.Combate.texto(at, tec.buff.atk ? '¡ATAQUE ↑!' : '¡DEFENSA ↑!', '#ffe14d', 1); U.Combate.particulas(at.x, at.y - 0.6, 12, '#ffe14d', 'chispa'); }
      if (U.Audio) U.Audio.sfx('yang');
      return;
    }
    if (tec.blink) { // teletransporte: aparece detrás del rival
      const dx = df.x - at.x, dy = df.y - at.y, d = Math.hypot(dx, dy) || 1;
      if (U.Combate) U.Combate.particulas(at.x, at.y - 0.6, 8, '#e8a2e0', 'humo');
      at.x = df.x + dx / d * 1.2; at.y = df.y + dy / d * 1.2;
      if (U.Combate) U.Combate.particulas(at.x, at.y - 0.6, 10, '#e8a2e0', 'humo');
    }
    // Visual del golpe según la forma (el simulador no usa proyectiles reales:
    // el haz se dibuja y el daño es instantáneo, para que nada pueda pegarle
    // al jugador por error).
    const E = U.Juego.estado;
    if (E && E.efectos) {
      if (tec.forma === 'destello') { E.efectos.anillos.push({ x: at.x, y: at.y, radio: tec.radio || 4, color: '#fff7c2', t: 0.5, max: 0.5 }); }
      else if (tec.forma === 'circulo') { const radio = tec.radio || 1; E.efectos.anillos.push({ x: at.x, y: at.y, radio, color: col, t: 0.4, max: 0.4 }); E.efectos.haces.push({ celdas: U.Grid.forma('circulo', at.x, at.y, at.dir, 0, radio), color: col, t: 0.3, max: 0.3 }); }
      else { const formaV = tec.forma === 'cadena' || tec.forma === 'proyectil' ? 'linea' : tec.forma; const alc = Math.max(1, Math.min(this.alcanceTec(tec) || 1, 12)); E.efectos.haces.push({ celdas: U.Grid.forma(formaV, at.x, at.y, at.dir, alc, tec.radio || 0), color: col, t: 0.25, max: 0.25 }); }
      if (tec.explora) E.efectos.anillos.push({ x: df.x, y: df.y, radio: tec.explora.radio, color: col, t: 0.4, max: 0.4 });
    }
    // Cegado: el golpe puede fallar.
    if (ap.cegadoT > 0 && Math.random() < 0.6) { if (U.Combate) U.Combate.texto(at, '¡FALLA! (CEGADO)', '#fff7c2', 1); return; }
    // Daño: ataque × power, defensa del rival, tabla de ventajas, azar ±10%,
    // crítico 10% (×1.5). Sin dañoEnemigo: la pelea no da monedas ni orbes.
    let base = at.stats.ataque * (ap.buffAtk || 1) * (ap.debuffAtk || 1) * (tec.power || 0);
    let d = U.Estadisticas.formulaDaño(base, df.stats.defensa * (df.ap.buffDef || 1));
    d *= U.Elementos.multiplica(el, df.elemento);
    d *= 0.9 + Math.random() * 0.2;
    const crit = Math.random() < 0.1; if (crit) d *= 1.5;
    d = Math.max(1, Math.round(d));
    df.vida -= d; df.flash = 0.12;
    if (U.Combate) { U.Combate.texto(df, '-' + d + (crit ? ' ¡CRÍTICO!' : ''), crit ? '#ffe14d' : col, crit ? 2 : 1); U.Combate.particulas(df.x, df.y - 0.6, 7, col, 'chispa'); }
    if (U.Audio) U.Audio.sfx(el === 'yang' ? 'yang' : el);
    // Efectos de la técnica.
    const ef = tec.efecto || {};
    if (ef.empuje) { const dx = df.x - at.x, dy = df.y - at.y, dd = Math.hypot(dx, dy) || 1; U.Grid.mover(ctx.mapa, df, dx / dd * ef.empuje * 0.5, dy / dd * ef.empuje * 0.5); }
    if (ef.slow) df.ap.slowT = Math.max(df.ap.slowT || 0, ef.slow);
    if (ef.stun) { df.ap.stunT = Math.max(df.ap.stunT || 0, ef.stun); if (U.Combate) U.Combate.texto(df, '¡ATURDIDO!', '#ffe14d', 1); }
    if (ef.dot) df.ap.dot = { dmg: ef.dot.dmg, t: ef.dot.t, tick: 0 };
    if (ef.cegar) { df.ap.cegadoT = Math.max(df.ap.cegadoT || 0, ef.cegar); if (U.Combate) U.Combate.texto(df, '👁 CEGADO', '#fff7c2', 1); }
    if (tec.debuff && tec.debuff.atk) { df.ap.debuffAtk = tec.debuff.atk; df.ap.debuffAtkT = tec.debuff.t; if (U.Combate) U.Combate.texto(df, '¡ATAQUE ↓!', '#9fb3d9', 1); }
    if (df.vida <= 0) df.vida = 0;
  },
  resolverPelea(ganadorF, motivo) {
    const E = U.Juego.estado, A = E.apuestas; if (!A || A.fase !== 'pelea') return;
    const fA = E.enemigos.find(e => e.esApuesta && e.ap.def.id === A.pareja[0]);
    const fB = E.enemigos.find(e => e.esApuesta && e.ap.def.id === A.pareja[1]);
    const g = ganadorF || (fA && fB ? ((fA.vida / fA.stats.vida) >= (fB.vida / fB.stats.vida) ? fA : fB) : (fA || fB));
    E.enemigos = E.enemigos.filter(e => !e.esApuesta);
    const lA = U.ApuestasDatos.porId(A.pareja[0]), lB = U.ApuestasDatos.porId(A.pareja[1]);
    const gDef = g ? g.ap.def : (motivo ? null : lA);
    A.fase = 'idle';
    let texto = '';
    if (!gDef) { texto = 'La pelea se canceló antes de terminar. Si habías apostado, te devuelvo la apuesta.'; }
    else {
      texto = '🏆 ¡GANA ' + gDef.nombre.toUpperCase() + ' «' + gDef.apodo.toUpperCase() + '»!' + (motivo ? ' (' + motivo + ')' : '') + '\n' + lA.nombre + ' vs ' + lB.nombre + ' · ' + (gDef.id === lA.id ? 'El público gritaba su nombre desde el primer golpe.' : 'Nadie lo veía venir, y ahí está: ganador.');
      const ap = A.apuesta;
      if (ap) {
        A.stats.apuestas++;
        if (ap.luchador === gDef.id) {
          const cobro = Math.round(ap.cantidad * ap.cuota);
          E.jugador.monedas = (E.jugador.monedas || 0) + cobro;
          A.stats.ganadas++; A.stats.ganado += cobro - ap.cantidad;
          texto += '\n\n🎉 ¡TU APUESTA GANÓ! Apostaste ' + ap.cantidad + ' 🪙 por ' + gDef.nombre + ' (cuota ' + ap.cuota + '×) y cobras ' + cobro + ' 🪙 (ganancia neta: +' + (cobro - ap.cantidad) + ' 🪙).';
          A.historial.push({ dia: E.reloj ? E.reloj.dia : 1, a: lA.nombre, b: lB.nombre, ganador: gDef.nombre, apostado: U.ApuestasDatos.porId(ap.luchador).nombre, cantidad: ap.cantidad, cuota: ap.cuota, resultado: 'ganó', cobro });
          if (U.Audio) U.Audio.sfx('victoria');
        } else {
          A.stats.perdidas++; A.stats.perdido += ap.cantidad;
          texto += '\n\nTu luchador perdió: se te van los ' + ap.cantidad + ' 🪙 de la apuesta. La próxima vez, mira mejor las cuotas: el fuerte paga menos por algo.';
          A.historial.push({ dia: E.reloj ? E.reloj.dia : 1, a: lA.nombre, b: lB.nombre, ganador: gDef.nombre, apostado: U.ApuestasDatos.porId(ap.luchador).nombre, cantidad: ap.cantidad, cuota: ap.cuota, resultado: 'perdió', cobro: 0 });
          if (U.Audio) U.Audio.sfx('derrota');
        }
        A.apuesta = null;
      } else {
        A.historial.push({ dia: E.reloj ? E.reloj.dia : 1, a: lA.nombre, b: lB.nombre, ganador: gDef.nombre, apostado: null, cantidad: 0, cuota: 0, resultado: 'miró', cobro: 0 });
        if (U.Audio) U.Audio.sfx('victoria');
      }
      if (A.historial.length > 20) A.historial = A.historial.slice(-20);
    }
    A.pareja = null; A.cuotas = null;
    U.HUD.banner(gDef ? '🏆 ¡GANA ' + gDef.nombre.toUpperCase() + '!' : 'PELEA CANCELADA', 2.4);
    U.Dialogo.mostrarTexto('🎲 APUESTAS DE LA ARENA', texto);
  },

  // ---------- tick (lo llama main.js antes de U.Combate.actualizar) ----------
  actualizar(dt) {
    const E = U.Juego.estado; if (!E) return;
    const A = this.asegurar(); if (!A) return;
    this.fijarOrganizador();
    const j = E.jugador;
    // Barrera del organizador: durante la pelea el jugador mira desde fuera
    // del círculo; si entra, lo empuja suavemente hacia afuera.
    if (A.fase === 'pelea' || A.fase === 'conteo') {
      const c = this.centroArena();
      const d = U.Grid.dist(j, c);
      if (d < c.r + 0.5) { const dd = d || 0.001; U.Grid.mover(E.mapa, j, (j.x - c.x) / dd * 3 * dt, (j.y - c.y) / dd * 3 * dt); if (Math.random() < dt * 0.5) U.HUD.banner('Miras la pelea desde fuera del círculo: nadie interviene.', 1.4); }
    }
    if (A.fase === 'conteo') {
      A.t -= dt; A.cuenta += dt;
      const n = Math.ceil(A.t);
      if (n !== A.ultimoConteo && n > 0) { A.ultimoConteo = n; U.HUD.banner('LA PELEA EMPIEZA EN ' + n + '…', 0.9); if (U.Audio) U.Audio.sfx('click'); }
      if (A.t <= 0) this.spawnLuchadores();
      return;
    }
    if (A.fase !== 'pelea') return;
    // Cancelaciones: otro combate, cambio de mapa o muerte del jugador.
    if (E.arena.activa || E.torneo || E.reto) { this.cancelarPelea('Empezó otro combate: se cancela la pelea y te devuelvo la apuesta.'); return; }
    if (E.mapaId !== 'aldea') { this.cancelarPelea('Saliste de la aldea en plena pelea: se cancela y te devuelvo la apuesta.'); return; }
    const fs = E.enemigos.filter(e => e.esApuesta);
    if (fs.length < 2) { this.cancelarPelea('La pelea se interrumpió: te devuelvo la apuesta.'); return; }
    const fA = fs.find(e => e.ap.def.id === A.pareja[0]), fB = fs.find(e => e.ap.def.id === A.pareja[1]);
    if (!fA || !fB) { this.cancelarPelea('La pelea se interrumpió: te devuelvo la apuesta.'); return; }
    const ctx = Object.assign(this.centroArena(), { mapa: E.mapa });
    A.tPelea = (A.tPelea || 0) + dt;
    let ganador = this.pasoPelea(fA, fB, dt, ctx);
    if (!ganador && fB.vida > 0) ganador = this.pasoPelea(fB, fA, dt, ctx);
    if (!ganador && A.tPelea >= this.DURACION_MAX) { this.resolverPelea(null, 'se acabó el tiempo: gana el que más vida trae'); return; }
    if (ganador) this.resolverPelea(ganador, null);
  },

  // ---------- simulación rápida (test headless, sin mundo) ----------
  simular(idA, idB) {
    const lA = U.ApuestasDatos.porId(idA), lB = U.ApuestasDatos.porId(idB);
    if (!lA || !lB) return null;
    const ctx = { cx: 0, cy: 0, r: 7, mapa: {} };
    const fA = this.crearRuntime(lA, -3.5, 0), fB = this.crearRuntime(lB, 3.5, 0);
    let ganador = null;
    for (let t = 0; t < 120 && !ganador; t += 0.05) {
      ganador = this.pasoPelea(fA, fB, 0.05, ctx);
      if (!ganador && fB.vida > 0) ganador = this.pasoPelea(fB, fA, 0.05, ctx);
    }
    if (!ganador) ganador = (fA.vida / fA.stats.vida) >= (fB.vida / fB.stats.vida) ? fA : fB;
    return { ganador: ganador.ap.def.id, vidaA: Math.round(fA.vida), vidaB: Math.round(fB.vida) };
  },

  // ---------- guardado ----------
  serializable() {
    const E = U.Juego.estado; const A = E && E.apuestas;
    return { historial: A ? A.historial.slice(-20) : [], stats: A ? Object.assign({}, A.stats) : { apuestas: 0, ganadas: 0, perdidas: 0, ganado: 0, perdido: 0 }, apuestaAbierta: (A && A.apuesta && (A.fase === 'conteo' || A.fase === 'pelea')) ? Object.assign({}, A.apuesta) : null };
  },
  restaurar(d) {
    if (!d) return;
    const A = this.asegurar(); if (!A) return;
    if (Array.isArray(d.historial)) A.historial = d.historial.slice(-20);
    if (d.stats) Object.assign(A.stats, d.stats);
    // Si se guardó en plena pelea, la pelea ya no existe al cargar: se
    // devuelve la apuesta abierta (las monedas ya se guardan aparte).
    if (d.apuestaAbierta) {
      const E = U.Juego.estado;
      E.jugador.monedas = (E.jugador.monedas || 0) + d.apuestaAbierta.cantidad;
      setTimeout(() => U.HUD.banner('Te devuelvo la apuesta abierta (' + d.apuestaAbierta.cantidad + ' 🪙): la pelea no sobrevivió a la carga.', 2.4), 600);
    }
    A.fase = 'idle'; A.apuesta = null; A.pareja = null; A.cuotas = null;
  }
};
