/* === js/sistemas/sparring.js === */
/* Unipar — CÍRCULO DE SPARRING: no es un lugar fijo, se forma alrededor de la pelea.
   Dos NPC entrenan peleando (Kaelen–Marco 09:00–11:00 · Torin–Breno 14:00–17:00) y el
   círculo se dibuja y se detecta alrededor de ELLOS, donde sea que estén peleando.
   RADIO: al entrar en el círculo paran, voltean hacia ti y te ofrecen unirte: contra los dos,
   del bando de uno, solo mirar o salir. REGLA DEL 10%: si tu Vida cae al 10%, la pelea se
   para, te dicen que te miras débil según su personalidad, te sacan del círculo y no te dejan
   volver hasta recuperarte (50%). Si un NPC cae al 10%, se retira diciendo que está débil y
   la pelea sigue con el que queda. Al final, cada uno te dice algo según su forma de ser. */
window.U = window.U || {};

U.Sparring = {
  CENTRO: { x: 32.5, y: 16.5 }, RADIO: 5, // CENTRO solo queda como respaldo si una pelea arranca sin centro vivo
  // Centro VIVO de la pelea actual: el punto medio entre los dos que están peleando,
  // estén donde estén. Sin pelea en curso devuelve null (y no hay círculo en el mapa).
  centroActual(E) {
    if (!E || !E.sparring) return null; const S = E.sparring;
    if (S.fase === 'peleando') {
      const pts = E.enemigos.filter(e => e.esSparring && e.vida > 0).map(e => ({ x: e.x, y: e.y }));
      const ali = S.aliado ? U.Vida.buscar(S.aliado) : null;
      if (ali && !ali.ocultoSparring && ali.mapa === E.mapaId) pts.push({ x: ali.x, y: ali.y });
      if (!pts.length) return S.centro || null;
      let x = 0, y = 0; pts.forEach(p => { x += p.x; y += p.y; });
      return { x: x / pts.length, y: y / pts.length };
    }
    const v = this.ventanaActual(E); if (!v) return null;
    const A = U.Vida.buscar(v.a), B = U.Vida.buscar(v.b);
    // Solo hay pelea (y círculo) cuando los dos ya están en su sitio, frente a frente
    // y quietos: mientras vienen de camino no se forma ningún círculo.
    if (A && B && A.mapa === E.mapaId && B.mapa === E.mapaId && !A.ocultoSparring && !B.ocultoSparring && A.enCirculo && B.enCirculo && !A.moviendo && !B.moviendo && Math.hypot(A.x - B.x, A.y - B.y) <= 4.5) return { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    return S.fase === 'ofrecido' ? (S.centro || null) : null;
  },
  VENTANAS: [ { a: 'kaelen', b: 'marco', d: 9, h: 11 }, { a: 'torin', b: 'breno', d: 14, h: 17 } ],
  CLASES: { kaelen: 'veterano', torin: 'veterano', breno: 'bandido', marco: 'chaman' },
  ventanaActual(E) { const h = U.Tiempo.hora(E); for (let i = 0; i < this.VENTANAS.length; i++) { const v = this.VENTANAS[i]; if (h >= v.d && h < v.h) return v; } return null; },
  claveVentana(E, v) { return (E.reloj ? E.reloj.dia : 1) + '-' + v.a + v.b + '-' + v.d; },
  actualizar(dt) {
    const E = U.Juego.estado; if (!E || !E.sparring) return; const S = E.sparring, j = E.jugador;
    S.ofrecidoCd = Math.max(0, (S.ofrecidoCd || 0) - dt);
    const v = this.ventanaActual(E);
    // El círculo rodea a la pelea, no a un punto fijo: la distancia se mide al
    // centro vivo entre los dos que pelean (si no hay pelea, no hay círculo).
    const centro = this.centroActual(E); if (centro) S.centro = centro;
    const distC = centro ? Math.hypot(j.x - centro.x, j.y - centro.y) : 1e9;
    if (!centro && S.fase === 'idle') { S.dentro = false; return; }
    // --- pelea en curso ---
    if (S.fase === 'peleando') {
      if (E.sparringJugadorDebil || j.vida <= j.stats.vida * 0.10) { E.sparringJugadorDebil = false; this.pararPorDebil(); return; }
      const enemigosSpar = E.enemigos.filter(e => e.esSparring);
      enemigosSpar.filter(e => e.retirarSparring).slice().forEach(e => this.retirar(e));
      if (!E.enemigos.some(e => e.esSparring)) { this.victoria(); return; }
      if (distC > 11) { this.cancelarPelea('Saliste del círculo: el sparring se da por terminado.'); return; }
      // El aliado pelea a tu lado: se acerca a su rival y golpea con tu fuerza a medias.
      if (S.aliado) {
        const ali = U.Vida.buscar(S.aliado); const rival = E.enemigos.find(e => e.esSparring);
        if (ali && rival && !ali.ocultoSparring) {
          const d = Math.hypot(rival.x - ali.x, rival.y - ali.y);
          if (d > 1.5) { ali.dir = U.Grid.dir8(rival.x - ali.x, rival.y - ali.y); U.Grid.mover(E.mapa, ali, (rival.x - ali.x) / d * 2.2 * dt, (rival.y - ali.y) / d * 2.2 * dt); ali.moviendo = true; ali.anim += dt * 1.6; }
          else { ali.moviendo = false; ali.dir = U.Grid.dir8(rival.x - ali.x, rival.y - ali.y); S.allyT = (S.allyT || 0) - dt; if (S.allyT <= 0) { S.allyT = 1.7; ali.atacando = 0.25; U.Combate.dañoEnemigo(rival, Math.max(2, j.stats.ataque * 0.4), null, { desafio: 0.5 }); } }
        }
      }
      return;
    }
    if (S.fase !== 'idle') return;
    // --- entrenamiento NPC contra NPC (sin ti): se pegan de verdad, sin bajar del 55% ---
    if (v && S.consumida !== this.claveVentana(E, v)) {
      const A = U.Vida.buscar(v.a), B = U.Vida.buscar(v.b);
      if (A && B && A.mapa === E.mapaId && B.mapa === E.mapaId && !A.ocultoSparring && !B.ocultoSparring) {
        A.enCirculo = B.enCirculo = true;
        A.vidaSim = Math.min(100, (A.vidaSim || 100) + dt * 1.2); B.vidaSim = Math.min(100, (B.vidaSim || 100) + dt * 1.2);
        S.golpeT = (S.golpeT || 0) - dt;
        if (S.golpeT <= 0 && distC < 12) {
          S.golpeT = 1.15; S.turno = (S.turno || 0) + 1;
          const atk = S.turno % 2 ? A : B, def = S.turno % 2 ? B : A;
          atk.atacando = 0.25; atk.dir = U.Grid.dir8(def.x - atk.x, def.y - atk.y); def.dir = U.Grid.dir8(atk.x - def.x, atk.y - def.y);
          def.vidaSim = Math.max(55, (def.vidaSim || 100) - 4);
          U.Combate.particulas(def.x, def.y - 0.6, 6, '#ffd08a', 'chispa'); U.Audio.sfx('golpe');
          if (Math.random() < 0.3) U.Combate.texto(def, ['¡Ja!', '¡Buena!', '¡Otra!', '¡Eso!'][Math.floor(Math.random() * 4)], '#e8dcc8', 1);
        }
      }
    }
    // --- radio de entrada ---
    const dentro = distC <= this.RADIO + 0.4;
    if (!dentro) { S.dentro = false; return; }
    if (S.bloqueado) {
      if (j.vida >= j.stats.vida * 0.5) { S.bloqueado = false; U.HUD.banner('YA TE VES RECUPERADO · PUEDES VOLVER AL CÍRCULO', 2); U.Audio.sfx('cura'); }
      else if (!S.dentro) {
        S.dentro = true;
        const vv = v || this.VENTANAS[0]; const A = U.Vida.buscar(vv.a);
        const per = A ? U.Personas.de(A.id) : null;
        const cc = centro || this.CENTRO; j.x = cc.x; j.y = cc.y + this.RADIO + 2.2;
        U.Dialogo.mostrarTexto('CÍRCULO DE ENTRENAMIENTO', (A ? A.nombre + ': ' : '') + (per && per.expulsa ? per.expulsa : 'Te miras muy débil. Fuera del círculo.') + ' (Tu Vida está al ' + Math.round(j.vida / j.stats.vida * 100) + '%: vuelve cuando estés sobre el 50%.)');
        return;
      }
      return;
    }
    if (!v || S.dentro || S.ofrecidoCd > 0 || S.consumida === this.claveVentana(E, v)) { S.dentro = dentro; return; }
    S.dentro = true;
    const A2 = U.Vida.buscar(v.a), B2 = U.Vida.buscar(v.b);
    if (A2 && B2 && A2.mapa === E.mapaId && B2.mapa === E.mapaId) this.ofrecer(v);
  },
  ofrecer(v) {
    const E = U.Juego.estado, S = E.sparring;
    S.fase = 'ofrecido'; S.pareja = [v.a, v.b]; S.ventana = v;
    const c0 = this.centroActual(E); if (c0) S.centro = c0; // el círculo queda donde está la pelea
    const A = U.Vida.buscar(v.a), B = U.Vida.buscar(v.b), j = E.jugador;
    [A, B].forEach(n => { if (n) { n.dir = U.Grid.dir8(j.x - n.x, j.y - n.y); n.moviendo = false; } });
    U.HUD.banner('⚔ CÍRCULO DE ENTRENAMIENTO · ' + A.nombre.toUpperCase() + ' Y ' + B.nombre.toUpperCase() + ' TE MIRAN', 2);
    U.Dialogo.abrirSparring(v);
  },
  cancelarOferta() { const E = U.Juego.estado; if (!E || !E.sparring) return; if (E.sparring.fase === 'ofrecido') { E.sparring.fase = 'idle'; E.sparring.ofrecidoCd = 20; } },
  iniciar(bando) {
    const E = U.Juego.estado, S = E.sparring, j = E.jugador; if (!S.ventana) return;
    const v = S.ventana; S.fase = 'peleando'; S.bando = bando; S.retirados = []; S.allyT = 0;
    const rivales = bando === 'solo' ? [v.a, v.b] : bando === 'a' ? [v.b] : [v.a];
    S.aliado = bando === 'solo' ? null : (bando === 'a' ? v.a : v.b);
    rivales.forEach(id => {
      const n = U.Vida.buscar(id); if (!n) return; n.ocultoSparring = true; n.enCirculo = false;
      const e = U.Combate.crearEnemigo(this.CLASES[id] || 'bandido', n.x, n.y, E.dificultad);
      e.nombre = n.nombre; e.esSparring = true; e.npcId = id;
      e.stats.vida = Math.round(80 + j.stats.ataque * 5 + j.stats.vida * 0.25); e.vida = e.stats.vida;
      e.stats.ataque = Math.round(e.stats.ataque + j.stats.defensa * 0.35);
      E.enemigos.push(e); U.Combate.particulas(e.x, e.y - 0.5, 14, '#ffe14d', 'humo');
    });
    U.HUD.banner('⚔ ¡SPARRING! · SIN MUERTE: AL 10% DE VIDA, FUERA', 2.2); U.Audio.sfx('oleada'); U.Audio.musica('arena');
  },
  restaurarNpc(id, alBorde) {
    const n = U.Vida.buscar(id); if (!n) return n;
    n.ocultoSparring = false; n.enCirculo = false;
    if (alBorde) { const E = U.Juego.estado; const cc = (E && E.sparring && E.sparring.centro) || this.CENTRO; const a = Math.random() * Math.PI * 2; n.x = cc.x + Math.cos(a) * (this.RADIO + 0.9); n.y = cc.y + Math.sin(a) * (this.RADIO + 0.9) * 0.7; n.ruta = []; n.rutaKey = ''; }
    return n;
  },
  retirar(e) {
    const E = U.Juego.estado, S = E.sparring;
    E.enemigos = E.enemigos.filter(x => x !== e);
    const n = this.restaurarNpc(e.npcId, true); if (!n) return;
    n.sparringCansado = 50; S.retirados.push(e.npcId);
    const per = U.Personas.de(n.id);
    U.Emociones.evento(n, { realidad: 45, energia: 15, etiqueta: 'se retiró del sparring al 10%' });
    if (!n.hechos) n.hechos = []; n.hechos.push('se retiró del sparring al quedar al 10% de Vida');
    const F = E.efectos.textos; F.push({ x: n.x, y: n.y, txt: per.cortoDebil || 'Estoy débil… me salgo.', color: '#ffb347', escala: 1, vida: 2.4, max: 2.4 });
    U.Combate.particulas(n.x, n.y - 0.6, 10, '#ffb347', 'polvo'); U.Audio.sfx('esquiva');
    U.HUD.banner('🛑 ' + n.nombre.toUpperCase() + ' SE RETIRA · QUEDÓ AL 10% DE VIDA', 2);
  },
  finComun() {
    const E = U.Juego.estado, S = E.sparring;
    E.enemigos = E.enemigos.filter(e => !e.esSparring); E.proyectiles = [];
    S.pareja.forEach(id => this.restaurarNpc(id, true));
    if (S.ventana) S.consumida = this.claveVentana(E, S.ventana);
    S.fase = 'idle'; S.aliado = null; S.centro = null; U.Audio.musica(E.mapaId === 'bosque' ? 'bosque' : E.mapaId === 'desierto' ? 'desierto' : E.mapaId === 'montana' ? 'montana' : 'aldea');
  },
  victoria() {
    const E = U.Juego.estado, S = E.sparring, j = E.jugador;
    const pareja = S.pareja.slice(); const bando = S.bando;
    this.finComun();
    j.monedas = (j.monedas || 0) + 12;
    U.Crecimiento.stat('ataque', 0.3, 1); U.Crecimiento.stat('defensa', 0.3, 1);
    pareja.forEach(id => { const n = U.Vida.buscar(id); if (n) { U.Emociones.evento(n, { realidad: 82, energia: 14, etiqueta: 'sparring ganado por ti' }); if (!n.hechos) n.hechos = []; n.hechos.push('le ganaste en el sparring del bosque'); } });
    U.HUD.banner('🏆 ¡GANASTE EL SPARRING! · +12 🪙', 2.4); U.Audio.sfx('victoria');
    U.Dialogo.abrirResultadoSparring('victoria', pareja, bando);
  },
  pararPorDebil() {
    const E = U.Juego.estado, S = E.sparring, j = E.jugador;
    const pareja = S.pareja.slice(); const bando = S.bando;
    const cc = S.centro || this.CENTRO; // se captura antes de finComun: te sacan al borde del círculo de ESTA pelea
    this.finComun();
    S.bloqueado = true;
    j.vida = Math.max(1, Math.ceil(j.stats.vida * 0.10)); j.cargando = false; j.escudo = false;
    j.x = cc.x; j.y = cc.y + this.RADIO + 2.2;
    pareja.forEach(id => { const n = U.Vida.buscar(id); if (n) { if (!n.hechos) n.hechos = []; n.hechos.push('te sacó del círculo al verte al 10% de Vida'); } });
    U.HUD.banner('🛑 SPARRING DETENIDO · TE MIRAS MUY DÉBIL', 2.4); U.Audio.sfx('derrota');
    U.Dialogo.abrirResultadoSparring('debil', pareja, bando);
  },
  cancelarPelea(msg) {
    const E = U.Juego.estado; if (!E || !E.sparring || E.sparring.fase !== 'peleando') return;
    this.finComun(); if (msg) U.HUD.toast(msg, 'aviso');
  },
  cancelarPorSalida() {
    const E = U.Juego.estado; if (!E || !E.sparring) return;
    if (E.sparring.fase === 'peleando') this.finComun();
    else if (E.sparring.fase === 'ofrecido') { E.sparring.fase = 'idle'; if (U.Dialogo.abierto && U.Dialogo.modo === 'sparring') U.Dialogo.cerrar(); }
  }
};
