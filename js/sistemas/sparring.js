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
    this.actualizarEventos(dt); // C (peleadores), E (duelo real) y F (extraño): eventos del círculo y del bosque
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
  // ---------- DIÁLOGO CON OPCIONES (sin tocar dialogo.js) ----------
  // U.Dialogo.mostrarTexto solo muestra texto + Cerrar. Para los eventos de aquí
  // (peleadores, círculo, extraño) hacen falta OPCIONES: se envuelve U.Dialogo.elegir
  // UNA vez (en este archivo) para el modo 'uniparEvento' y se pintan las opciones
  // con los métodos que ya existen (decir / pintarRazon / pintarOpciones).
  _instalarDialogoEventos() {
    const D = U.Dialogo; if (!D || D._uniparEventosInstalado) return;
    D._uniparEventosInstalado = true;
    const orig = D.elegir.bind(D);
    D.elegir = function (i) {
      if (this.modo === 'uniparEvento' && this._eventoOpciones && this._eventoOpciones[i]) {
        const o = this._eventoOpciones[i]; const fn = o.fn;
        this._eventoOpciones = null; this.cerrar();
        if (fn) fn();
        return;
      }
      return orig(i);
    };
  },
  // Muestra texto + opciones (cada opción { t, fn }). Como mostrarTexto, pero elegible.
  mostrarEvento(titulo, texto, opciones) {
    const D = U.Dialogo, E = U.Juego.estado; if (!D || !E) return;
    this._instalarDialogoEventos();
    D.npc = null; D.esCartel = false; D.modo = 'uniparEvento'; D.fase = 'uniparEvento'; D.abierto = true; E.ui = 'dialogo';
    document.getElementById('dialogo').classList.remove('oculto');
    document.getElementById('dlgNombre').textContent = titulo; document.getElementById('dlgEmocion').textContent = 'aviso'; document.getElementById('dlgConfTxt').textContent = ''; document.getElementById('dlgConfianza').firstElementChild.style.width = '0%';
    const cv = document.getElementById('dlgCara'); const ctx = cv.getContext('2d'); ctx.fillStyle = '#0e1530'; ctx.fillRect(0, 0, 64, 64); U.Render.iconoCanvas(cv, 'aldea', '#d9a441');
    D.decir(texto); D.razon = ''; D.pintarRazon();
    D._eventoOpciones = opciones || [];
    D.opciones = (opciones || []).map(o => ({ t: o.t })); D.pintarOpciones(); U.Audio.sfx('dialogo');
  },
  fama() { if (U.Orgs && U.Orgs.fama) return U.Orgs.fama(); const E = U.Juego.estado; if (!E || !U.Economia) return 0; return U.Economia.karma(E.jugador, U.Economia.puebloActual()); },
  // ---------- C / E / F: eventos aleatorios del círculo y del bosque ----------
  actualizarEventos(dt) {
    this.actualizarPeleadores(dt);
    this.actualizarExtrano(dt);
    this.actualizarDueloReal(dt);
  },
  // E. CÍRCULOS DINÁMICOS: la reacción del círculo es impredecible — depende de la
  // personalidad de los que entrenan, de tu Fama y del azar. No siempre te invitan:
  // a veces te ignoran, a veces te corren (e insistir es una pelea real 2 contra 1),
  // a veces te retan a duelo y a veces un maestro te da una lección.
  ofrecer(v) {
    const E = U.Juego.estado, S = E.sparring;
    const A = U.Vida.buscar(v.a), B = U.Vida.buscar(v.b);
    const reaccion = this.reaccionCirculo(v, A, B);
    if (reaccion !== 'invitar') { this.reaccionarCirculo(v, reaccion, A, B); return; }
    this.ofrecerEntrenamiento(v, A, B);
  },
  reaccionCirculo(v, A, B) {
    const perA = A ? U.Personas.de(A.id) : null, perB = B ? U.Personas.de(B.id) : null;
    const t = (((perA && perA.tipo) || '') + ' ' + ((perB && perB.tipo) || '')).toLowerCase();
    const fama = this.fama();
    let w = { invitar: 50, ignorar: 20, correr: 15, reto: 10, leccion: 5 };
    if (t.indexOf('arrogante') >= 0) w = { invitar: 20, ignorar: 10, correr: 50, reto: 20, leccion: 0 };
    else if (t.indexOf('amable') >= 0 || t.indexOf('maternal') >= 0) w = { invitar: 70, ignorar: 20, correr: 0, reto: 0, leccion: 10 };
    else if (t.indexOf('orgulloso') >= 0 || t.indexOf('brusco') >= 0 || t.indexOf('exigente') >= 0) w = { invitar: 25, ignorar: 10, correr: 15, reto: 45, leccion: 5 };
    else if (t.indexOf('rudo') >= 0 || t.indexOf('callado') >= 0) w = { invitar: 30, ignorar: 50, correr: 10, reto: 10, leccion: 0 };
    else if (t.indexOf('exagerado') >= 0 || t.indexOf('curioso') >= 0) w = { invitar: 60, ignorar: 15, correr: 5, reto: 10, leccion: 10 };
    if (fama >= 20) { w.invitar += 15; w.correr = Math.max(0, w.correr - 10); }
    else if (fama <= -20) { w.correr += 15; w.invitar = Math.max(0, w.invitar - 15); }
    // Lección solo si hay un maestro en la pareja (Kaelen o Torin, los veteranos que enseñan).
    if (v.a !== 'kaelen' && v.a !== 'torin' && v.b !== 'kaelen' && v.b !== 'torin') w.leccion = 0;
    let r = Math.random() * (w.invitar + w.ignorar + w.correr + w.reto + w.leccion);
    if ((r -= w.invitar) < 0) return 'invitar';
    if ((r -= w.ignorar) < 0) return 'ignorar';
    if ((r -= w.correr) < 0) return 'correr';
    if ((r -= w.reto) < 0) return 'reto';
    if (w.leccion > 0) return 'leccion';
    return 'invitar';
  },
  reaccionarCirculo(v, reaccion, A, B) {
    const E = U.Juego.estado, S = E.sparring; if (!E || !A || !B) return;
    S.ventana = v;
    const clave = this.claveVentana(E, v);
    if (reaccion === 'ignorar') {
      S.consumida = clave; S.ofrecidoCd = 30;
      U.Dialogo.mostrarTexto('CÍRCULO DE ENTRENAMIENTO', A.nombre + ' y ' + B.nombre + ' te miran de reojo… y siguen entrenando como si no existieras. Ni una palabra: están concentrados, o no te consideran dignos de una pausa. El círculo sigue ahí, pero hoy no eres parte de él.');
      return;
    }
    if (reaccion === 'correr') {
      const perA = U.Personas.de(A.id);
      this.mostrarEvento('CÍRCULO DE ENTRENAMIENTO', A.nombre + ' (' + (perA.tipo || '').toLowerCase() + ') se planta frente a ti: «Estamos entrenando. Vete. Apártate del círculo.» ' + B.nombre + ' asiente sin dejar de moverse: aquí no te quieren. Puedes irte… o insistir. Y si insistes, los dos te atacan: pelea REAL, 2 contra 1, sin regla del 10%.', [
        { t: '🚶 Irse: no vale la pena', fn: () => { S.ofrecidoCd = 30; } },
        { t: '😤 Insistir: «Yo también entreno aquí»', fn: () => { this.iniciarReal(v); } }
      ]);
      return;
    }
    if (reaccion === 'reto') {
      const retador = Math.random() < 0.5 ? A : B;
      const perR = U.Personas.de(retador.id);
      this.mostrarEvento('⚔ RETO DE DUELO', retador.nombre + ' (' + (perR.tipo || '').toLowerCase() + ') deja de entrenar, te señala y sonríe: «Tú. He oído hablar de ti. Un duelo, tú contra mí, aquí mismo, delante de ' + (retador === A ? B.nombre : A.nombre) + '. Sin muerte: regla del 10%, como el sparring. ¿Aceptas o te vas con el cuento?»', [
        { t: '⚔ Aceptar el duelo contra ' + retador.nombre, fn: () => { this.iniciarDuelo(v, retador.id); } },
        { t: '🙅 Rechazar: «Hoy no»', fn: () => { S.ofrecidoCd = 30; U.HUD.toast(retador.nombre + ' se ríe: «Ya sabía yo. Otra vez será… o no.»', 'aviso'); } }
      ]);
      return;
    }
    // lección de un maestro
    const maestro = v.a === 'kaelen' || v.a === 'torin' ? A : B;
    const perM = U.Personas.de(maestro.id);
    this.mostrarEvento('📖 LECCIÓN DE UN MAESTRO', maestro.nombre + ' (' + (perM.tipo || '').toLowerCase() + ') para el entrenamiento, te mira un momento y dice: «Ven. Antes de pelear, aprende: el golpe no sale del brazo, sale del suelo. Pisa firme, respira cuando el otro respira y pega cuando el otro suelta el aire. Eso no se entrena con fuerza: se entrena con calma.» Te deja practicar el paso con él unos minutos.', [
      { t: '🙏 Gracias, maestro', fn: () => {
        S.consumida = clave;
        const E2 = U.Juego.estado, j2 = E2.jugador;
        if (U.Crecimiento) U.Crecimiento.maestria(j2.elementoActivo, 1.5, 1);
        U.HUD.toast('Lección aprendida: tu maestría de ' + U.Elementos.nombre(j2.elementoActivo) + ' sube un poco (+1.5%). Los maestros no regalan el tiempo: aprovéchalo.', 'exito'); U.Audio.sfx('unlock');
      } }
    ]);
  },
  ofrecerEntrenamiento(v, A, B) {
    const E = U.Juego.estado, S = E.sparring;
    S.fase = 'ofrecido'; S.pareja = [v.a, v.b]; S.ventana = v;
    const c0 = this.centroActual(E); if (c0) S.centro = c0; // el círculo queda donde está la pelea
    const j = E.jugador;
    [A, B].forEach(n => { if (n) { n.dir = U.Grid.dir8(j.x - n.x, j.y - n.y); n.moviendo = false; } });
    U.HUD.banner('⚔ CÍRCULO DE ENTRENAMIENTO · ' + A.nombre.toUpperCase() + ' Y ' + B.nombre.toUpperCase() + ' TE MIRAN', 2);
    U.Dialogo.abrirSparring(v);
  },
  // Pelea REAL 2 contra 1 (te corrieron del círculo e insististe): SIN regla del 10%
  // (los rivales son enemigos normales, esOrg 'sparringReal', no esSparring). Si ganas,
  // respeto (+Fama); si pierdes, despiertas en casa (el flujo normal de derrota).
  iniciarReal(v) {
    const E = U.Juego.estado, S = E.sparring, j = E.jugador;
    S.dueloReal = { pareja: [v.a, v.b], marcaDerrotas: (E.historial && E.historial.derrotas) || 0 };
    [v.a, v.b].forEach(id => {
      const n = U.Vida.buscar(id); if (!n) return; n.ocultoSparring = true; n.enCirculo = false;
      const e = U.Combate.crearEnemigo(this.CLASES[id] || 'bandido', n.x, n.y, E.dificultad);
      e.nombre = n.nombre; e.esOrg = 'sparringReal'; e.npcId = id;
      e.stats.vida = Math.round(80 + j.stats.ataque * 5 + j.stats.vida * 0.25); e.vida = e.stats.vida;
      e.stats.ataque = Math.round(e.stats.ataque + j.stats.defensa * 0.35);
      E.enemigos.push(e); U.Combate.particulas(e.x, e.y - 0.5, 14, '#ff5470', 'humo');
    });
    U.HUD.banner('⚔ ¡PELEA REAL! · 2 CONTRA 1 · SIN REGLA DEL 10%', 2.4); U.Audio.sfx('oleada');
  },
  actualizarDueloReal(dt) {
    const E = U.Juego.estado; if (!E || !E.sparring || !E.sparring.dueloReal) return;
    const S = E.sparring, dr = S.dueloReal, j = E.jugador;
    if (((E.historial && E.historial.derrotas) || 0) > dr.marcaDerrotas) { this.limpiarDueloReal(); return; } // perdiste: ya despertaste; solo se restaura a los NPC
    if (!E.enemigos.some(e => e.esOrg === 'sparringReal' && e.vida > 0)) {
      this.limpiarDueloReal();
      j.monedas = (j.monedas || 0) + 20;
      if (U.Economia) U.Economia.karmaAdd(5);
      U.HUD.banner('🏆 ¡RESPETO GANADO! · +20 🪙', 2.4); U.Audio.sfx('victoria');
      U.Dialogo.mostrarTexto('RESPETO', 'Los dos te miran distinto ahora: insististe, peleaste contra los dos a la vez y ganaste. «Vale. Te quedas. La próxima vez no te corremos: te invitamos.» (+5 de Fama: pelear de frente, sin miedo, se respeta.)');
    }
  },
  limpiarDueloReal() {
    const E = U.Juego.estado; if (!E || !E.sparring || !E.sparring.dueloReal) return;
    const S = E.sparring;
    E.enemigos = E.enemigos.filter(e => e.esOrg !== 'sparringReal');
    S.dueloReal.pareja.forEach(id => this.restaurarNpc(id, true));
    if (S.ventana) S.consumida = this.claveVentana(E, S.ventana);
    S.dueloReal = null;
  },
  // Duelo 1 contra 1 por reto (regla del 10% del sparring, como siempre).
  iniciarDuelo(v, retadorId) {
    const E = U.Juego.estado, S = E.sparring, j = E.jugador;
    S.fase = 'peleando'; S.bando = 'duelo'; S.ventana = v; S.pareja = [v.a, v.b]; S.retirados = []; S.allyT = 0; S.aliado = null;
    const n = U.Vida.buscar(retadorId); if (!n) return;
    n.ocultoSparring = true; n.enCirculo = false;
    const e = U.Combate.crearEnemigo(this.CLASES[retadorId] || 'bandido', n.x, n.y, E.dificultad);
    e.nombre = n.nombre; e.esSparring = true; e.npcId = retadorId;
    e.stats.vida = Math.round(80 + j.stats.ataque * 5 + j.stats.vida * 0.25); e.vida = e.stats.vida;
    e.stats.ataque = Math.round(e.stats.ataque + j.stats.defensa * 0.35);
    E.enemigos.push(e); U.Combate.particulas(e.x, e.y - 0.5, 14, '#ffe14d', 'humo');
    U.HUD.banner('⚔ ¡DUELO! · TÚ CONTRA ' + n.nombre.toUpperCase() + ' · REGLA DEL 10%', 2.2); U.Audio.sfx('oleada');
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
  // ---------- C. DOS PELEADORES + TRAICIÓN (pelea REAL, no entrenamiento) ----------
  // Dos NPCs peleando DE VERDAD (no entrenando). Al entrar en su radio salen los
  // diálogos y eliges bando… o irte. El MENTIROSO es aleatorio cada vez: si ayudas
  // al mentiroso, pelean juntos contra la víctima y LUEGO el mentiroso te traiciona
  // y te ataca solo. Si ganas te quedas con su botín; si pierdes despiertas en casa
  // (flujo normal de derrota); la Fama baja por pelear contra un inocente.
  // Distinto del círculo de entrenamiento: aquí NO hay regla del 10%.
  NOMBRES_PELEA: ['Dren', 'Kobo', 'Sena', 'Rurik', 'Ilsa', 'Tomas', 'Nilo', 'Falk', 'Mira', 'Odo'],
  SUPLICAS: [
    ['¡Ayúdame! ¡Él me atacó sin motivo, yo solo pasaba por aquí!', '¡No le creas! ¡Fue ÉL quien me atacó a mí, yo solo me defendía!'],
    ['¡Por favor! ¡Este tipo me cayó encima de la nada, yo no le hice nada!', '¡Mentira! ¡Él me empujó primero y luego sacó el puño, yo solo respondí!'],
    ['¡Te lo juro! ¡Yo venía tranquilo por el camino y él me cerró el paso!', '¡Qué cuento! ¡Venía tranquilo yo, y él me cerró el paso a MÍ!'],
    ['¡Ayuda! ¡Si no me ayudas me va a dejar tirado aquí mismo!', '¡No lo ayudes! ¡Si me deja tirado a mí, se queda con mis cosas!']
  ],
  TRAICIONES: [
    '¡Jajaja! ¡Te engañé! Gracias por quitarme de en medio a ese estorbo… ahora voy a acabar contigo.',
    '¿De verdad te creíste su cuento? Yo ataqué primero, sí… y ahora sigues tú.',
    'Perfecto: peleaste por mí contra un inocente. Y ahora que está fuera del camino, te toca a ti.'
  ],
  GRACIAS: [
    'Gracias. Ese tipo me atacó de la nada y yo no le había hecho nada. Toma: es lo que llevaba encima, te lo mereces.',
    'Te debo una. Yo venía en paz y él me cayó encima sin motivo. Quédate con su botín: yo no quiero nada suyo.',
    'Gracias de verdad. Pensé que me dejaba tirado ahí. Su botín es tuyo: yo me largo antes de que vuelva.'
  ],
  peleadorEnt(lado) { const E = U.Juego.estado; return E.enemigos.find(e => e.esPeleador && e.peleaLado === lado && e.vida > 0) || null; },
  actualizarPeleadores(dt) {
    const E = U.Juego.estado; if (!E || !E.sparring || E.mapaId !== 'aldea' || E.ui !== 'mundo') return;
    const S = E.sparring, j = E.jugador;
    const P = S.pelea;
    if (!P) {
      // Aparición: solo en mundo tranquilo (sin sparring, arena, torneo o reto) y
      // con un cooldown largo entre eventos. No aparece en plena pelea de otro tipo.
      S.peleaCd = Math.max(0, (S.peleaCd || 0) - dt);
      if (S.peleaCd > 0 || S.fase !== 'idle' || E.arena.activa || E.torneo || E.reto) return;
      if (Math.random() > dt / 240) return; // ~1 vez cada 4 min de media
      this.spawnPeleadores();
      return;
    }
    if (((E.historial && E.historial.derrotas) || 0) > P.marcaDerrotas) { this.limpiarPeleadores(); return; } // caíste: ya despertaste
    const a = this.peleadorEnt('a'), b = this.peleadorEnt('b');
    if (!a || !b) {
      if (P.fase === 'combate' || P.fase === 'traicion') { this.peleadoresResolver(); return; }
      this.limpiarPeleadores(); return; // se fueron del mapa (cambio de mapa, etc.)
    }
    // Mientras pelean entre ellos, el combate normal los ignora (stun refrescado aquí).
    if (P.fase === 'peleando' || P.fase === 'espera') {
      if (P.fase === 'espera' && E.ui === 'mundo') P.fase = 'peleando'; // cerró el diálogo con Despedirse sin elegir: vuelven a pelear
      [a, b].forEach(e => { e.efectos.stun = 0.5; });
      if (P.fase === 'peleando') {
        P.golpeT -= dt;
        if (P.golpeT <= 0) {
          P.golpeT = 1.2; P.turno = (P.turno || 0) + 1;
          const atk = P.turno % 2 ? a : b, def = P.turno % 2 ? b : a;
          atk.atacando = 0.25;
          const key = P.turno % 2 ? 'a' : 'b';
          if (key === 'a') P.vidaA = Math.max(15, (P.vidaA || 100) - (4 + Math.random() * 4)); else P.vidaB = Math.max(15, (P.vidaB || 100) - (4 + Math.random() * 4));
          U.Combate.particulas(def.x, def.y - 0.6, 6, '#ffd08a', 'chispa'); U.Audio.sfx('golpe');
          if (Math.random() < 0.3) U.Combate.texto(def, ['¡Ay!', '¡Eso dolió!', '¡Ya verás!', '¡Toma!'][Math.floor(Math.random() * 4)], '#e8dcc8', 1);
        }
        const dC = Math.hypot(j.x - P.centro.x, j.y - P.centro.y);
        if (dC <= this.RADIO + 0.4 && (E.tiempo || 0) - (P.ultimaOferta || 0) > 20) this.peleadoresEntran();
        else if (dC > 25) { P.tiempoFuera = (P.tiempoFuera || 0) + dt; if (P.tiempoFuera > 120) this.limpiarPeleadores(); }
        else P.tiempoFuera = 0;
      }
      return;
    }
    if (P.fase === 'combate' || P.fase === 'traicion') {
      // El ALIADO (si lo hay) pelea a tu lado: se acerca a su rival y golpea.
      const aliado = P.fase === 'combate' && P.aliado ? this.peleadorEnt(P.aliado) : null;
      const rival = P.fase === 'combate' ? this.peleadorEnt(P.rival) : this.peleadorEnt(P.traidor);
      if (aliado && rival) {
        const d = Math.hypot(rival.x - aliado.x, rival.y - aliado.y);
        if (d > 1.5) { aliado.dir = U.Grid.dir8(rival.x - aliado.x, rival.y - aliado.y); U.Grid.mover(E.mapa, aliado, (rival.x - aliado.x) / d * 2.2 * dt, (rival.y - aliado.y) / d * 2.2 * dt); aliado.moviendo = true; aliado.anim += dt * 1.6; }
        else { aliado.moviendo = false; aliado.dir = U.Grid.dir8(rival.x - aliado.x, rival.y - aliado.y); P.allyT = (P.allyT || 0) - dt; if (P.allyT <= 0) { P.allyT = 1.7; aliado.atacando = 0.25; U.Combate.dañoEnemigo(rival, Math.max(2, j.stats.ataque * 0.4), null, { desafio: 0.5 }); } }
      }
    }
  },
  spawnPeleadores() {
    const E = U.Juego.estado, S = E.sparring, j = E.jugador;
    if (!U.Reliquias || !U.Reliquias.esSalvaje(E)) return; // la pelea real pasa fuera de los pueblos
    const nombres = this.NOMBRES_PELEA.slice();
    for (let i = nombres.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); const t = nombres[i]; nombres[i] = nombres[k]; nombres[k] = t; }
    const cx = Math.floor(j.x) + (Math.random() < 0.5 ? 7 : -7), cy = Math.floor(j.y) + (Math.random() < 0.5 ? 4 : -4);
    const c = U.Reliquias.celdaLibre(E.mapa, cx, cy);
    const a = U.Combate.crearEnemigo('bandido', c.x + 0.5, c.y + 0.5, E.dificultad);
    a.nombre = nombres[0]; a.esPeleador = true; a.peleaLado = 'a'; a.efectos.stun = 0.5;
    const b = U.Combate.crearEnemigo('veterano', c.x + 2.5, c.y + 0.5, E.dificultad);
    b.nombre = nombres[1]; b.esPeleador = true; b.peleaLado = 'b'; b.efectos.stun = 0.5;
    E.enemigos.push(a, b);
    S.pelea = { fase: 'peleando', a: nombres[0], b: nombres[1], mentiroso: Math.random() < 0.5 ? 'a' : 'b', centro: { x: c.x + 1.5, y: c.y + 0.5 }, golpeT: 0.5, turno: 0, vidaA: 100, vidaB: 100, aliado: null, rival: null, traidor: null, allyT: 0, ultimaOferta: -100, tiempoFuera: 0, marcaDerrotas: (E.historial && E.historial.derrotas) || 0 };
    U.HUD.toast('👀 A lo lejos, dos tipos se están peleando de verdad entre los árboles. No es entrenamiento: se pegan con ganas.', 'aviso');
  },
  peleadoresEntran() {
    const E = U.Juego.estado, S = E.sparring, P = S.pelea; if (!P) return;
    P.fase = 'espera'; P.ultimaOferta = E.tiempo || 0;
    const sup = this.SUPLICAS[Math.floor(Math.random() * this.SUPLICAS.length)];
    const a = this.peleadorEnt('a'), b = this.peleadorEnt('b');
    if (a) a.dir = U.Grid.dir8(E.jugador.x - a.x, E.jugador.y - a.y);
    if (b) b.dir = U.Grid.dir8(E.jugador.x - b.x, E.jugador.y - b.y);
    U.HUD.banner('⚔ ¡DOS TIPOS PELEANDO! · CADA UNO DICE QUE EL OTRO ATACÓ', 2.4);
    this.mostrarEvento('⚔ DOS PELEADORES', P.a + ' y ' + P.b + ' paran al verte y los dos te hablan a la vez, casi gritando:\n\n' + P.a + ': «' + sup[0] + '»\n' + P.b + ': «' + sup[1] + '»\n\nLos dos suenan… posibles. No sabes cuál miente. Elige un bando, o vete.', [
      { t: '🤝 Ayudar a ' + P.a, fn: () => { this.peleadoresElegir('a'); } },
      { t: '🤝 Ayudar a ' + P.b, fn: () => { this.peleadoresElegir('b'); } },
      { t: '🚶 Irse: no es mi pelea', fn: () => { P.fase = 'peleando'; S.peleaCd = 0; U.HUD.toast('Te vas. Atrás, los dos vuelven a pegarse como si nada.', ''); } }
    ]);
  },
  peleadoresElegir(lado) {
    const E = U.Juego.estado, S = E.sparring, P = S.pelea; if (!P) return;
    const otro = lado === 'a' ? 'b' : 'a';
    P.aliado = lado; P.rival = otro; P.fase = 'combate';
    P.traicionPendiente = (lado === P.mentiroso);
    const rival = this.peleadorEnt(otro);
    if (rival) { rival.efectos.stun = 0; } // el rival te ataca a ti (el combate normal lo persigue)
    const aliado = this.peleadorEnt(lado);
    if (aliado) { aliado.efectos.stun = 0.5; } // el aliado lo muevo yo en actualizarPeleadores
    U.HUD.banner('⚔ ¡PELEA! · AYUDAS A ' + (lado === 'a' ? P.a : P.b).toUpperCase(), 2);
    U.Audio.sfx('oleada');
  },
  peleadoresResolver() {
    const E = U.Juego.estado, S = E.sparring, P = S.pelea; if (!P) return;
    const j = E.jugador;
    if (P.fase === 'combate') {
      const rival = this.peleadorEnt(P.rival);
      if (rival) return; // todavía vive: no se resuelve
      if (P.traicionPendiente) {
        // Ayudaste al MENTIROSO: la víctima cayó y tu Fama baja por pelear contra un inocente.
        if (U.Economia) U.Economia.karmaAdd(-8);
        const traidor = this.peleadorEnt(P.aliado);
        P.fase = 'traicion'; P.traidor = P.aliado; P.aliado = null;
        if (traidor) {
          traidor.vida = traidor.stats.vida; traidor.efectos.stun = 0; // te ataca SOLO, con la vida llena
          traidor.nombre = (P.traidor === 'a' ? P.a : P.b) + ' · el mentiroso';
        }
        U.HUD.banner('😈 ¡TRAICIÓN!', 2.6); U.Audio.sfx('derrota');
        this.mostrarEvento('😈 ¡TRAICIÓN!', (P.traidor === 'a' ? P.a : P.b) + ' se ríe en tu cara mientras el otro se queda tirado: «' + this.TRAICIONES[Math.floor(Math.random() * this.TRAICIONES.length)] + '»\n\nTu Fama baja: acabas de ayudar a matar a un inocente. Y ahora el mentiroso va a por ti. Solo.', [
          { t: '⚔ Pelear contra el mentiroso', fn: () => {} }
        ]);
        return;
      }
      // Ayudaste a la VÍCTIMA: el mentiroso cayó. Botín + Fama.
      const botin = 40 + Math.floor(Math.random() * 31);
      j.monedas = (j.monedas || 0) + botin;
      if (U.Economia) U.Economia.karmaAdd(5);
      U.HUD.banner('🏆 ¡EL MENTIROSO CAYÓ! · +' + botin + ' 🪙', 2.4); U.Audio.sfx('victoria');
      this.mostrarEvento('🏆 EL MENTIROSO CAYÓ', (P.aliado === 'a' ? P.a : P.b) + ': «' + this.GRACIAS[Math.floor(Math.random() * this.GRACIAS.length)] + '»\n\nTe quedas con el botín del mentiroso (+' + botin + ' 🪙) y tu Fama sube (+5): ayudar a un inocente se nota.', [
        { t: '👍 Seguir mi camino', fn: () => {} }
      ]);
      this.limpiarPeleadores(true);
      return;
    }
    if (P.fase === 'traicion') {
      const traidor = this.peleadorEnt(P.traidor);
      if (traidor) return;
      const botin = 40 + Math.floor(Math.random() * 41);
      j.monedas = (j.monedas || 0) + botin;
      U.HUD.banner('🏆 ¡EL MENTIROSO CAYÓ! · +' + botin + ' 🪙', 2.4); U.Audio.sfx('victoria');
      this.mostrarEvento('🏆 EL MENTIROSO CAYÓ', 'El mentiroso cae de una vez. Te quedas con SU botín (+' + botin + ' 🪙): llevaba encima todo lo que le había quitado a otros. Tu Fama sigue tocada por lo de antes… pero al menos el cuento terminó como debía.', [
        { t: '👍 Seguir mi camino', fn: () => {} }
      ]);
      this.limpiarPeleadores(true);
    }
  },
  limpiarPeleadores(mantenerCd) {
    const E = U.Juego.estado; if (!E || !E.sparring) return;
    const S = E.sparring;
    E.enemigos = E.enemigos.filter(e => !e.esPeleador);
    S.pelea = null;
    S.peleaCd = mantenerCd ? 300 : 120;
  },
  // ---------- F. EXTRAÑO EN EL BOSQUE (EMBOSCADA) ----------
  // Fuera de los pueblos, un desconocido pide ayuda ("ayúdame a destruir esta roca" /
  // "ahí arriba hay algo que quiero alcanzar"). Si aceptas, puede ser de verdad
  // (recompensa: monedas, rumor, objeto, Fama) o una TRAMPA (salen bandidos). No sabes
  // cuál es. Si te niegas, no pasa nada. La trampa es más probable en zonas alejadas
  // y de noche — y los bandidos SOLO salen de noche, así que de día el extraño es
  // siempre de verdad. Si es trampa y ganas, te quedas con el botín de los bandidos.
  PETICIONES_EXTRANO: [
    '«¡Ey, viajero! ¿Me ayudas a destruir esta roca? Hay algo detrás y yo solo no puedo con ella. Te lo agradezco como se debe.»',
    '«¡Por favor! Ahí arriba, en esa rama, hay algo que quiero alcanzar y no llego. ¿Me echas una mano? No es nada raro, te lo juro.»',
    '«¿Me ayudas a mover este tronco caído? Llevo un rato intentándolo y pesa como una montaña. Si lo movemos, hay paso libre para los dos.»'
  ],
  actualizarExtrano(dt) {
    const E = U.Juego.estado; if (!E || !E.sparring || E.mapaId !== 'aldea' || E.ui !== 'mundo') return;
    const S = E.sparring, j = E.jugador;
    const X = S.extrano;
    if (X && ((E.historial && E.historial.derrotas) || 0) > X.marcaDerrotas) { this.limpiarExtrano(); return; }
    if (X && X.fase === 'emboscada') {
      if (!E.enemigos.some(e => e.esOrg === 'emboscadaExtrano' && e.vida > 0)) {
        j.monedas = (j.monedas || 0) + 30;
        U.HUD.banner('🏆 ¡EMBOSCADA SUPERADA! · +30 🪙', 2.4); U.Audio.sfx('victoria');
        U.HUD.toast('Los bandidos cayeron y su botín es tuyo (+30 🪙, además de lo que llevaban encima). El "extraño" ya ni se ve: corrió en cuanto empezó la pelea.', 'exito');
        this.limpiarExtrano(true);
      }
      return;
    }
    if (X && X.fase === 'espera') {
      const e = E.enemigos.find(x => x.esExtrano && x.vida > 0);
      if (!e) { this.limpiarExtrano(); return; }
      e.efectos.stun = 0.5;
      if (Math.hypot(j.x - e.x, j.y - e.y) < 2.5) this.extranoHablar();
      else if (Math.hypot(j.x - e.x, j.y - e.y) > 20) this.limpiarExtrano();
      return;
    }
    // Aparición: zonas salvajes, mundo tranquilo, con cooldown. Más probable de noche
    // y lejos de los pueblos (los bandidos solo salen de noche).
    S.extranoCd = Math.max(0, (S.extranoCd || 0) - dt);
    if (S.extranoCd > 0 || S.fase !== 'idle' || S.pelea || E.arena.activa || E.torneo || E.reto) return;
    if (!U.Reliquias || !U.Reliquias.esSalvaje(E)) return;
    const noche = U.Tiempo ? U.Tiempo.esNoche(U.Tiempo.hora(E)) : false;
    const lejos = E.zonaActual && ['bosque', 'desierto', 'montana'].indexOf(E.zonaActual.id) >= 0;
    const p = dt / (noche ? 150 : 400) * (lejos ? 1.5 : 1);
    if (Math.random() > p) return;
    const c = U.Reliquias.celdaLibre(E.mapa, Math.floor(j.x) + (Math.random() < 0.5 ? 6 : -6), Math.floor(j.y) + (Math.random() < 0.5 ? 3 : -3));
    const e = U.Combate.crearEnemigo('bandido', c.x + 0.5, c.y + 0.5, E.dificultad * 0.9);
    e.nombre = 'Desconocido del bosque'; e.esExtrano = true; e.efectos.stun = 0.5;
    E.enemigos.push(e);
    S.extrano = { fase: 'espera', esTrampa: false, marcaDerrotas: (E.historial && E.historial.derrotas) || 0 };
    U.HUD.toast('👤 Un desconocido sale de entre los árboles y te hace señas: parece querer pedirte algo.', 'aviso');
  },
  extranoHablar() {
    const E = U.Juego.estado, S = E.sparring, X = S.extrano; if (!X) return;
    const pet = this.PETICIONES_EXTRANO[Math.floor(Math.random() * this.PETICIONES_EXTRANO.length)];
    this.mostrarEvento('👤 UN EXTRAÑO EN EL BOSQUE', 'Un desconocido, con ropa de camino y las manos vacías, se te acerca:\n\n' + pet + '\n\nNo sabes si es de verdad o una trampa. Si te niegas, no pasa nada.', [
      { t: '🤝 Ayudarlo', fn: () => { this.extranoResolver(true); } },
      { t: '🚶 Negarse: «Lo siento, voy con prisa»', fn: () => { this.extranoResolver(false); } }
    ]);
  },
  extranoResolver(ayuda) {
    const E = U.Juego.estado, S = E.sparring, X = S.extrano, j = E.jugador; if (!X) return;
    const e = E.enemigos.find(x => x.esExtrano && x.vida > 0);
    if (!ayuda) {
      if (e) { U.Combate.particulas(e.x, e.y - 0.5, 8, '#9fb3d9', 'humo'); E.enemigos = E.enemigos.filter(x => x !== e); }
      U.HUD.toast('El desconocido asiente, sin rencor, y se pierde entre los árboles. No pasa nada.', '');
      this.limpiarExtrano();
      return;
    }
    const noche = U.Tiempo ? U.Tiempo.esNoche(U.Tiempo.hora(E)) : false;
    const lejos = E.zonaActual && ['bosque', 'desierto', 'montana'].indexOf(E.zonaActual.id) >= 0;
    const pTrampa = noche ? (lejos ? 0.65 : 0.55) : 0; // bandidos solo de noche: de día nunca es trampa
    if (Math.random() < pTrampa) {
      // TRAMPA: el "extraño" huye y salen los bandidos.
      if (e) { U.Combate.particulas(e.x, e.y - 0.5, 8, '#9fb3d9', 'humo'); E.enemigos = E.enemigos.filter(x => x !== e); }
      const n = 3;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.6;
        const c = U.Reliquias.celdaLibre(E.mapa, Math.floor(j.x + Math.cos(a) * 3), Math.floor(j.y + Math.sin(a) * 3));
        const b = U.Combate.crearEnemigo(i === 0 ? 'veterano' : 'bandido', c.x + 0.5, c.y + 0.5, E.dificultad * 1.05);
        b.nombre = 'Bandido de la emboscada'; b.esOrg = 'emboscadaExtrano'; // nunca esArena, nunca esPerseguidor
        E.enemigos.push(b); U.Combate.particulas(b.x, b.y - 0.5, 12, '#ff5470', 'humo');
      }
      X.fase = 'emboscada';
      U.HUD.banner('⚔ ¡EMBOSCADA! · ERA UNA TRAMPA', 3); U.Audio.sfx('oleada');
      U.HUD.toast('El desconocido suelta una risa corta y desaparece entre los árboles: ¡era el señuelo! Salen bandidos de la oscuridad. Si ganas, su botín es tuyo.', 'peligro');
      return;
    }
    // DE VERDAD: recompensa al azar (monedas, rumor, objeto o Fama).
    if (e) { U.Combate.particulas(e.x, e.y - 0.5, 8, '#67e08a', 'chispa'); E.enemigos = E.enemigos.filter(x => x !== e); }
    const roll = Math.random();
    if (roll < 0.4) {
      const m = 20 + Math.floor(Math.random() * 31);
      j.monedas = (j.monedas || 0) + m;
      U.HUD.banner('🤝 ¡AYUDA DE VERDAD! · +' + m + ' 🪙', 2.4);
      U.Dialogo.mostrarTexto('🤝 AYUDA DE VERDAD', 'Era de verdad: entre los dos lo lográis y el desconocido te paga con monedas (+' + m + ' 🪙) antes de seguir su camino. «Hay gente buena todavía», dice, y se va sonriendo.');
    } else if (roll < 0.65 && U.Orgs) {
      const orgs = ['mano', 'jade', 'cole'];
      const org = orgs[Math.floor(Math.random() * orgs.length)];
      const lista = U.Orgs.RUMORES[org];
      const txt = lista[Math.floor(Math.random() * lista.length)];
      U.Dialogo.mostrarTexto('🤝 AYUDA DE VERDAD', 'Era de verdad: lo ayudáis y, agradecido, te cuenta algo en voz baja: «' + txt + '» (Rumor anotado: habla con más gente para atar cabos.)');
    } else if (roll < 0.85) {
      if (U.Economia) U.Economia.karmaAdd(5);
      U.HUD.banner('🤝 ¡AYUDA DE VERDAD! · +5 DE FAMA', 2.4);
      U.Dialogo.mostrarTexto('🤝 AYUDA DE VERDAD', 'Era de verdad: lo ayudáis y el desconocido se va contando por el camino que hay un viajero que ayuda sin pedir nada. Tu Fama sube (+5).');
    } else {
      j.bolsaComida = j.bolsaComida || [];
      if (j.bolsaComida.length < 5) { j.bolsaComida.push(U.Economia.SABORES[Math.floor(Math.random() * 5)]); }
      U.HUD.banner('🤝 ¡AYUDA DE VERDAD! · COMIDA', 2.4);
      U.Dialogo.mostrarTexto('🤝 AYUDA DE VERDAD', 'Era de verdad: lo ayudáis y el desconocido saca comida de su morral y te la da. «Para el camino: quien ayuda, come.» (+1 comida en tu mochila.)');
    }
    U.Audio.sfx('victoria');
    this.limpiarExtrano(true);
  },
  limpiarExtrano(mantenerCd) {
    const E = U.Juego.estado; if (!E || !E.sparring) return;
    const S = E.sparring;
    E.enemigos = E.enemigos.filter(e => !e.esExtrano);
    S.extrano = null;
    S.extranoCd = mantenerCd ? 300 : 120;
  },
  cancelarPorSalida() {
    const E = U.Juego.estado; if (!E || !E.sparring) return;
    if (E.sparring.fase === 'peleando') this.finComun();
    else if (E.sparring.fase === 'ofrecido') { E.sparring.fase = 'idle'; if (U.Dialogo.abierto && U.Dialogo.modo === 'sparring') U.Dialogo.cerrar(); }
  }
};
