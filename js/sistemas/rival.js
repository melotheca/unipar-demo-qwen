/* === js/sistemas/rival.js === */
/* Unipar — EL RIVAL (Ren, el espejo): memoria, crecimiento, duelos y encuentros.
   CÓMO FUNCIONA: U.Rival.actualizar(dt) se llama UNA vez por cuadro desde
   U.Juego.actualizarMundo (hook del coordinador, ver abajo). Todo lo demás son
   reacciones a lo que ya existe: el torneo (E.torneo), la arena (E.mapa.arena),
   el historial de derrotas (E.historial.derrotas) y los enemigos (E.enemigos).
   DUELOS: se spawnea con U.Combate.crearEnemigo(clase, x, y, mult) y el flag
   propio e.esRival = true (NO se toca combate.js para spawnearlo). El resultado
   se detecta SIN editar combate.js, por sondeo en actualizar():
     - VICTORIA: el enemigo rival ya no está en E.enemigos y el contador de
       derrotas del jugador NO subió (murió y combate.js lo retiró).
     - DERROTA: E.historial.derrotas subió desde que empezó el duelo (el jugador
       cayó y despertar() lo contó). Por eso se guarda derrotasAlInicio.
     - ABANDONO: el jugador cambia de mapa o se aleja >16 celdas 8 s: se cancela
       SIN registrar (no fue un duelo, fue una huida).
   Además hay DOS ganchos opcionales de una línea (coordinador, exactos abajo):
   alDerrotaRival(e) en U.Combate.morir y alDerrotaJugador() en U.Juego.fin:
   dan la detección INMEDIATA (diálogo en el acto); el sondeo es el respaldo.
   CRECIMIENTO: +POR_DIA por cada día de juego (crecerPorTiempo) y +6% tras
   CADA duelo (crecerPorDuelo), más un alcance que lo mantiene ≥90% de tu poder.
   MEMORIA: E.rival guarda duelos, ganados (tuyos), perdidos, rachas, historial
   de cada duelo y las técnicas desbloqueadas; el diálogo cambia con el marcador.
   AYUDA: si vas herido (<30% Vida), sin enemigos vivos y sin haberle visto hoy,
   Ren aparece, te cura un 30% y te da 1 poción (máx. 3 en bolsa): a veces ayuda.
   NO TOCA: Escudo, los 6 momentos, combo de golpes, Presentimiento, guardado
   (solo expone serializar/cargar para el hook del coordinador). */
window.U = window.U || {};

U.Rival = {
  // ---------- estado ----------
  nuevo() {
    return { conocido: false, encuentro: null, presentadoTorneo: false,
      duelos: 0, ganados: 0, perdidos: 0, rachaJugador: 0, rachaRival: 0,
      nivel: 1, diasEntrenados: 0, bonusDuelos: 0, ultimoDia: 1,
      cooldownHasta: 0, ultimoAyudaDia: 0, retadoDia: 0,
      historial: [], duelo: null, _idxDialogo: 0, ultimaLinea: null };
  },
  asegurar(E) {
    if (!E) return null;
    if (!E.rival || typeof E.rival !== 'object') E.rival = this.nuevo();
    const r = E.rival;
    if (r.duelos == null) r.duelos = 0; if (r.ganados == null) r.ganados = 0; if (r.perdidos == null) r.perdidos = 0;
    if (r.rachaJugador == null) r.rachaJugador = 0; if (r.rachaRival == null) r.rachaRival = 0;
    if (r.nivel == null) r.nivel = 1; if (r.diasEntrenados == null) r.diasEntrenados = 0;
    if (r.bonusDuelos == null) r.bonusDuelos = 0; if (r.ultimoDia == null) r.ultimoDia = 1;
    if (r.cooldownHasta == null) r.cooldownHasta = 0; if (r.ultimoAyudaDia == null) r.ultimoAyudaDia = 0;
    if (!Array.isArray(r.historial)) r.historial = [];
    if (r._idxDialogo == null) r._idxDialogo = 0;
    return r;
  },
  init(E) { return this.asegurar(E); }, // hook: U.Rival.init(this.estado) en comenzarMundo
  diaActual(E) { return (E && E.reloj && E.reloj.dia) || 1; },
  // ---------- espejo: Ren es el elemento CONTRARIO al del jugador (test) ----------
  // El elemento del jugador es fijo en esta vida (j.elemento = perfil.elemento);
  // Ren se resuelve en vivo en cada uso: nada que guardar, nada que migrar.
  elementoJugador(E) { const j = E && E.jugador; return (j && (j.elemento || j.elementoActivo || (j.perfil && j.perfil.elemento))) || 'viento'; },
  elementoRen(E) { return U.RivalDatos.elementoContrarioDe(this.elementoJugador(E)); },
  apodoRen(E) { return U.RivalDatos.apodoDe(this.elementoRen(E)); },
  tituloRen(E) { return U.RivalDatos.tituloDe(this.elementoRen(E)); },
  emojiRen(E) { return U.RivalDatos.emojiDe(this.elementoRen(E)); },
  // ---------- crecimiento ----------
  crecerPorTiempo(E) {
    const r = this.asegurar(E); const dia = this.diaActual(E);
    if (dia > r.ultimoDia) { r.diasEntrenados += dia - r.ultimoDia; r.ultimoDia = dia; }
    return r.diasEntrenados;
  },
  // Multiplicador total de Ren: días + duelos (+ alcance al 90% de tu poder).
  multRival(E) {
    const D = U.RivalDatos, r = this.asegurar(E);
    let m = 1 + 0.02 * r.diasEntrenados + (r.bonusDuelos || 0);
    const j = E && E.jugador;
    if (j && U.Estadisticas && U.Estadisticas.poder) {
      const base = { stats: D.BASE };
      const pr = U.Estadisticas.poder(base), pj = Math.max(1, U.Estadisticas.poder(j));
      const relativo = (pr * m) / pj;
      if (relativo < D.MIN_PODER_RELATIVO) m *= Math.min(D.TOPE_ALCANCE, D.MIN_PODER_RELATIVO / Math.max(0.01, relativo));
    }
    return m;
  },
  statsRival(E) {
    const D = U.RivalDatos, r = this.asegurar(E), m = this.multRival(E), s = {};
    Object.keys(D.BASE).forEach(k => {
      const porDia = (D.POR_DIA[k] || 0) * r.diasEntrenados;
      s[k] = Math.max(1, Math.round((D.BASE[k] + porDia) * m));
    });
    return s;
  },
  tecnicasDesbloqueadas(E) { return U.RivalDatos.desbloqueadas(this.asegurar(E).duelos, this.elementoRen(E)); },
  // ---------- diálogo (cambia con el historial) ----------
  // Devuelve la línea elegida (rotación, sin azar: testeable) y la muestra si hay UI.
  // Las líneas escriben 'el Vendaval' como apodo base: aquí se sustituye por el
  // apodo efectivo de Ren según su elemento (p. ej. 'la Marea').
  dialogo(situacion) {
    const E = U.Juego.estado, r = this.asegurar(E);
    let sit = situacion;
    if (sit === 'encuentro') sit = r.ganados > r.perdidos ? 'encuentroVentaja' : r.perdidos > r.ganados ? 'encuentroDesventaja' : 'encuentroEmpate';
    const lista = (U.RivalDatos.lineas[sit] && U.RivalDatos.lineas[sit].length ? U.RivalDatos.lineas[sit] : U.RivalDatos.lineas.encuentroEmpate);
    const base = lista[(r._idxDialogo || 0) % lista.length];
    const ap = this.apodoRen(E);
    const linea = ap === 'el Vendaval' ? base : base.split('el Vendaval').join(ap);
    r._idxDialogo = (r._idxDialogo || 0) + 1; r.ultimaLinea = linea;
    return linea;
  },
  mostrarDialogo(situacion) {
    const linea = this.dialogo(situacion);
    if (U.Dialogo && U.Dialogo.mostrarTexto && typeof document !== 'undefined') {
      try { U.Dialogo.mostrarTexto(this.tituloRen(U.Juego.estado), linea); } catch (e) { /* sin UI: queda en ultimaLinea */ }
    }
    return linea;
  },
  banner(txt, dur) { if (U.HUD && U.HUD.banner) { try { U.HUD.banner(txt, dur || 2); } catch (e) {} } },
  // ---------- duelos ----------
  // Spawn del rival como enemigo (API existente + flag propio). lugar: 'arena' | 'torneo' | 'mundo'.
  // ESPEJO: su elemento es el contrario al del jugador y su set ejecutable es el
  // del catálogo de ESE elemento (setTecManual, solo las desbloqueadas por duelos):
  // sin esto, crearEnemigo('chaman') le dejaría el set de Viento con cualquier elemento.
  spawnDuelo(E, lugar) {
    const D = U.RivalDatos, j = E.jugador;
    let x, y;
    if ((lugar === 'arena' || lugar === 'torneo') && E.mapa && E.mapa.arena) { x = E.mapa.arena.x + 0.5 + 2.5; y = E.mapa.arena.y + 0.5; }
    else { x = j.x + 3; y = j.y; }
    const e = U.Combate.crearEnemigo(D.claseBase, x, y, (E.dificultad || 1));
    e.nombre = D.nombre + ' · ' + this.apodoRen(E); e.elemento = this.elementoRen(E);
    e.setTec = this.tecnicasDesbloqueadas(E).map(t => t.id); e.setTecManual = true;
    e.esRival = true; e.esDuelo = true; e.tecnicaRival = null; e._tecIdx = 0;
    e.stats = this.statsRival(E); e.vida = e.stats.vida;
    E.enemigos.push(e);
    return e;
  },
  iniciarDuelo(E, lugar) {
    E = E || U.Juego.estado; if (!E || !E.jugador) return null;
    const r = this.asegurar(E);
    if (r.duelo && r.duelo.activo) return null; // ya hay un duelo en curso
    if ((E.arena.activa || E.reto) || (E.torneo && lugar !== 'torneo')) return null; // no se mezcla con arena/reto; el torneo SOLO admite su propia final (lugar 'torneo')
    if (E.ui && E.ui !== 'mundo') return null;
    const j = E.jugador; if (j.vida <= 0) return null;
    // Duelo limpio: se empieza a tope los dos (como en el torneo entre rondas).
    j.vida = j.stats.vida; j.esencia = j.stats.esencia; j.agotado = false; j.dot = null;
    const e = this.spawnDuelo(E, lugar || 'mundo');
    r.duelo = { activo: true, lugar: lugar || 'mundo', mapaId: E.mapaId,
      derrotasAlInicio: (E.historial && E.historial.derrotas) || 0,
      t: 0, fueraT: 0, enemigo: e };
    r.conocido = true;
    this.banner('⚔ DUELO CONTRA REN · ' + this.apodoRen(E).toUpperCase(), 2.2);
    return e;
  },
  // La FINAL del torneo ES Ren (gancho del coordinador en spawnTorneo: si
  // T.idx === 3, llamar a esto en vez de spawnear 'El Campeón Velado').
  // El enemigo lleva esTorneo=true para que actualizarTorneo lo cuente como el
  // rival de la final (avance, podio y derrotaTorneo siguen funcionando solos).
  iniciarDueloTorneo(E) {
    E = E || U.Juego.estado; if (!E || !E.torneo) return null;
    const e = this.iniciarDuelo(E, 'torneo');
    if (!e) return null;
    e.esTorneo = true;
    if (E.torneo) E.torneo.spawned = true;
    this.banner('🏆 FINAL DEL TORNEO · REN, ' + this.apodoRen(E).toUpperCase(), 2.4);
    return e;
  },
  // Rotación del set propio en combate: cada vez que Ren va a atacar, cambia a
  // la siguiente técnica desbloqueada (round-robin) y la IA enemiga pelea con la
  // clase equivalente (ver MAPA en datos: claseIA). El nombre flota sobre él.
  rotarTecnica(e) {
    const E = U.Juego.estado; if (!E || !e || e.vida <= 0) return null;
    const tecs = this.tecnicasDesbloqueadas(E);
    if (!tecs.length) return null;
    e._tecIdx = ((e._tecIdx || 0) + 1) % tecs.length;
    const t = tecs[e._tecIdx];
    e.tecnicaRival = t.id;
    if (t.claseIA && U.Combate.CLASES && U.Combate.CLASES[t.claseIA]) e.clase = t.claseIA;
    if (U.Combate.texto) { try { U.Combate.texto(e, t.nombre.toUpperCase(), '#7ef0c0', 1); } catch (err) {} }
    return t;
  },
  // Crecimiento tras CADA duelo (gane quien gane) + aviso si aprende técnica nueva.
  crecerPorDuelo(E) {
    const r = this.asegurar(E);
    const antes = U.RivalDatos.desbloqueadas(r.duelos, this.elementoRen(E)).map(t => t.id);
    r.nivel++; r.bonusDuelos = (r.bonusDuelos || 0) + U.RivalDatos.POR_DUELO;
    const ahora = U.RivalDatos.desbloqueadas(r.duelos, this.elementoRen(E));
    ahora.forEach(t => { if (antes.indexOf(t.id) < 0) this.banner(this.emojiRen(E) + ' REN APRENDIÓ «' + t.nombre.toUpperCase() + '» · LA PRÓXIMA VEZ LA USARÁ', 2.6); });
    return r.nivel;
  },
  registrar(E, resultado, lugar) {
    const r = this.asegurar(E), dia = this.diaActual(E);
    r.duelos++;
    if (resultado === 'victoria') { r.ganados++; r.rachaJugador++; r.rachaRival = 0; }
    else { r.perdidos++; r.rachaRival++; r.rachaJugador = 0; }
    r.historial.push({ dia, lugar: lugar || 'mundo', resultado });
    if (r.historial.length > 30) r.historial.shift();
    r.cooldownHasta = dia + U.RivalDatos.ENFRIAMIENTO_DIAS;
    this.crecerPorDuelo(E);
  },
  resolverVictoria(E) {
    E = E || U.Juego.estado; const r = this.asegurar(E);
    if (!r.duelo || !r.duelo.activo) return false;
    const lugar = r.duelo.lugar; r.duelo = null;
    this.registrar(E, 'victoria', lugar);
    const j = E.jugador;
    if (lugar !== 'torneo') { j.monedas = (j.monedas || 0) + U.RivalDatos.RECOMPENSA_DUELO; } // en la final, el premio es el podio del torneo
    if (r.ganados === 3 && U.Progresion && U.Progresion.otorgarTitulo) { try { U.Progresion.otorgarTitulo(U.RivalDatos.azoteDe(this.elementoRen(E))); } catch (err) {} }
    this.banner('🏆 ¡LE GANASTE A REN! · ' + (lugar === 'torneo' ? 'LA FINAL ES TUYA' : '+' + U.RivalDatos.RECOMPENSA_DUELO + ' 🪙 · REN ENTRENARÁ MÁS'), 2.6);
    this.mostrarDialogo('ganaJugador');
    return true;
  },
  resolverDerrota(E) {
    E = E || U.Juego.estado; const r = this.asegurar(E);
    if (!r.duelo || !r.duelo.activo) return false;
    const lugar = r.duelo.lugar; r.duelo = null;
    this.registrar(E, 'derrota', lugar);
    this.banner(this.emojiRen(E) + ' REN TE GANÓ · ÉL TAMBIÉN ENTRENARÁ MÁS', 2.4);
    this.mostrarDialogo('ganaRival');
    return true;
  },
  // Gancho opcional (coordinador): U.Combate.morir(e) → si e.esRival, esto.
  alDerrotaRival(e) { if (e && e.esRival) return this.resolverVictoria(); return false; },
  // Gancho opcional (coordinador): U.Juego.fin('derrota') → esto, antes de despertar().
  alDerrotaJugador() { return this.resolverDerrota(); },
  cancelarDuelo(E, motivo) {
    const r = this.asegurar(E); if (!r.duelo || !r.duelo.activo) return false;
    r.duelo = null; r.cooldownHasta = this.diaActual(E) + U.RivalDatos.ENFRIAMIENTO_DIAS;
    if (motivo && U.HUD && U.HUD.banner) { try { U.HUD.banner(motivo, 2); } catch (err) {} }
    return true;
  },
  // ---------- encuentros por el mundo ----------
  // Te reta en la Arena de Ecos cuando te acercas (una vez al día, con enfriamiento).
  retarEnArena(E) {
    const r = this.asegurar(E), dia = this.diaActual(E);
    if (!r.conocido || dia <= r.cooldownHasta || dia === r.retadoDia) return null;
    if (E.mapaId !== 'aldea' || !E.mapa || !E.mapa.arena) return null;
    const j = E.jugador, c = E.mapa.arena;
    const d = Math.hypot(j.x - (c.x + 0.5), j.y - (c.y + 0.5));
    if (d > 7) return null;
    r.retadoDia = dia;
    this.mostrarDialogo('reto');
    return this.iniciarDuelo(E, 'arena');
  },
  // Te ayuda: herido, sin enemigos vivos, y sin haberle visto hoy.
  ayudar(E) {
    const r = this.asegurar(E), j = E.jugador, dia = this.diaActual(E);
    if (!r.conocido || dia === r.ultimoAyudaDia || dia <= r.cooldownHasta) return false;
    if (!j || j.vida > j.stats.vida * 0.30) return false;
    if ((E.enemigos || []).some(e => e.vida > 0)) return false;
    if (E.torneo || E.arena.activa || E.reto) return false;
    r.ultimoAyudaDia = dia;
    j.vida = Math.min(j.stats.vida, j.vida + j.stats.vida * 0.30);
    if ((j.bolsaPociones || []).length < 3) { j.bolsaPociones.push({ tipo: 'vida', unidades: 50, precio: 0 }); if (U.Recuperacion && U.Recuperacion.sincronizar) { try { U.Recuperacion.sincronizar(j); } catch (err) {} } }
    this.banner(this.emojiRen(E) + ' REN TE AYUDA · +30% VIDA · +1 POCIÓN', 2.2);
    this.mostrarDialogo('ayuda');
    return true;
  },
  // ---------- bucle (hook: una vez por cuadro en actualizarMundo) ----------
  actualizar(dt) {
    const E = U.Juego.estado; if (!E) return;
    const r = this.asegurar(E);
    if (E.ui && E.ui !== 'mundo') return;
    this.crecerPorTiempo(E);
    // 1) Primer encuentro: te inscribes al torneo y Ren aparece a retarte.
    if (E.torneo && E.torneo.activo && !r.presentadoTorneo) {
      r.presentadoTorneo = true; r.conocido = true; r.encuentro = 'torneo';
      this.mostrarDialogo('primero');
      return;
    }
    // 2) Duelo en curso: sondeo del resultado + rotación del set + abandono.
    if (r.duelo && r.duelo.activo) {
      const d = r.duelo;
      const derrotas = (E.historial && E.historial.derrotas) || 0;
      if (derrotas > d.derrotasAlInicio) { this.resolverDerrota(E); return; } // caíste: despertar() lo contó
      if (E.mapaId !== d.mapaId) { this.cancelarDuelo(E, 'Saliste del lugar: el duelo con Ren se cancela.'); return; }
      const e = (E.enemigos || []).find(x => x.esRival);
      if (!e) { this.resolverVictoria(E); return; } // Ren murió y combate.js lo retiró
      d.t += dt || 0;
      const dj = Math.hypot(e.x - E.jugador.x, e.y - E.jugador.y);
      if (dj > 16) { d.fueraT += dt || 0; if (d.fueraT > 8) { this.cancelarDuelo(E, 'Te alejaste del duelo: Ren se da por plantado.'); return; } }
      else d.fueraT = 0;
      if (e.cd <= 0 && e.estado === 'persigue') this.rotarTecnica(e);
      return;
    }
    // 3) Sin duelo: te reta en la arena o te ayuda si vas herido.
    if (!E.torneo && !E.arena.activa && !E.reto) {
      if (this.retarEnArena(E)) return;
      this.ayudar(E);
    }
  },
  // ---------- guardado (hooks del coordinador en guardado.js) ----------
  serializar() {
    const E = U.Juego.estado; if (!E) return null;
    const r = this.asegurar(E);
    return { conocido: !!r.conocido, encuentro: r.encuentro || null, presentadoTorneo: !!r.presentadoTorneo,
      duelos: r.duelos, ganados: r.ganados, perdidos: r.perdidos,
      rachaJugador: r.rachaJugador, rachaRival: r.rachaRival,
      nivel: r.nivel, diasEntrenados: r.diasEntrenados, bonusDuelos: r.bonusDuelos,
      ultimoDia: r.ultimoDia, cooldownHasta: r.cooldownHasta, ultimoAyudaDia: r.ultimoAyudaDia,
      retadoDia: r.retadoDia || 0, historial: r.historial.slice(), _idxDialogo: r._idxDialogo || 0 };
  },
  cargar(d) {
    const E = U.Juego.estado; if (!E || !d) return null;
    const r = this.asegurar(E);
    ['conocido', 'presentadoTorneo'].forEach(k => { if (d[k] != null) r[k] = !!d[k]; });
    ['encuentro'].forEach(k => { if (d[k] != null) r[k] = d[k]; });
    ['duelos', 'ganados', 'perdidos', 'rachaJugador', 'rachaRival', 'nivel', 'diasEntrenados', 'bonusDuelos', 'ultimoDia', 'cooldownHasta', 'ultimoAyudaDia', 'retadoDia', '_idxDialogo'].forEach(k => { if (d[k] != null) r[k] = d[k]; });
    if (Array.isArray(d.historial)) r.historial = d.historial.slice();
    r.duelo = null; // un duelo a medias no sobrevive a cargar: se reencuentran luego
    return r;
  },
  // ---------- consulta (pausa / depuración) ----------
  textoHistorial(E) {
    const r = this.asegurar(E || U.Juego.estado);
    const ap = this.apodoRen(E || U.Juego.estado);
    if (!r.conocido) return 'Aún no conoces a Ren, ' + ap + '.';
    return 'Ren, ' + ap + ' · Duelos: ' + r.duelos + ' · Tú ' + r.ganados + ' — Ren ' + r.perdidos + ' · Nv. rival ' + r.nivel;
  }
};
