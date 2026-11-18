/* === js/sistemas/aprendiz.js === */
/* Unipar — SER GUÍA (tener un aprendiz): de alumno a Guía, progresión tardía.
   Taro, un aspirante de Bruma, te pide que seas su Guía SOLO cuando ya eres alguien
   en el pueblo: 1+ título honorífico Y fama ≥20 en el pueblo actual (U.Progresion
   + U.Orgs.fama). A partir de ahí lo entrenas como Torin te entrena a ti (mismo
   E.entreno con meta/prog/recompensa, mismo progresoEntreno contando tus golpes,
   dashes o meditación), le ENSEÑAS tu set (dirección Pokémon: eliges qué técnicas
   de las que TÚ ya dominas pasan a su set, máx. 5, por id genérico desde
   j.tecnicasAprendidas / j.equipo vía U.Habilidades.aprendida — nunca se hardcodea
   un id nuevo del catálogo), te acompaña y pelea a tu lado, y te reta cuando crece.
   Al dominar su elemento (70%) con 10 entrenos se gradúa y ganas el título
   'Guía de Taro'.
   INTEGRACIÓN (sin tocar otros archivos, solo estas líneas las pone el coordinador):
   · index.html: <script src="js/datos/aprendiz.js"> tras personas.js y
     <script src="js/sistemas/aprendiz.js"> al final, tras guardado.js.
   · main.js comenzarMundo, tras refrescarNpcs(): if (U.Aprendiz) U.Aprendiz.init();
   · main.js actualizarMundo, tras U.Progresion.tick: if (U.Aprendiz) U.Aprendiz.tick(dtM);
   · guardado.js serializar: aprendiz: U.Aprendiz ? U.Aprendiz.serializable() : null,
   · guardado.js cargar, tras restaurar prog: if (d.aprendiz && U.Aprendiz) U.Aprendiz.restaurar(d.aprendiz);
   · (opcional) progresion.js htmlPausa/resumenPerfil: + (U.Aprendiz ? U.Aprendiz.htmlResumen() : '')
   NOTAS DE DISEÑO:
   · El diálogo de Taro vive en U.Dialogo.guiones['taro'] (registrado aquí en init,
     con getter: las opciones se construyen frescas cada vez que se abre el menú, así
     enseñan su progreso real y solo muestran lo disponible). Las acciones propias
     ('apr*') se atienden con un envoltorio fino de U.Dialogo.elegir instalado en
     init(): solo intercepta opciones apr* con Taro abierto; TODO lo demás delega al
     elegir original sin tocarlo. El resto de acciones de Taro ('reto', rumores,
     regalos, gustos…) son las nativas de dialogo.js.
   · El reto usa U.Combate.iniciarReto('taro'): combate.js solo tiene defs de Kaelen
     y Torin y cae en la de Kaelen (veterano, 60 s). Funciona, pero el banner dice
     'RETO DE KAELEN · EL MURO'. Para que diga 'RETO DE TARO' basta añadir una línea
     a defs en combate.js: taro: { nombre: 'Reto de Taro · El aprendiz', clases: ['bandido'], t: 60, mult: 0.95 }.
     No se toca aquí porque combate.js está fuera de este encargo.
   · U.HUD.toast es un no-op en este juego (HUD minimalista): todo el feedback
     visible va por U.HUD.banner, texto flotante (U.Combate.texto) y el diálogo.
   · Taro no tiene muerte: los enemigos solo persiguen al jugador, así que como
     acompañante pega pero nadie le pega a él. Simplificación deliberada. */
window.U = window.U || {};

U.Aprendiz = {
  _registrado: false,

  // ---------- estado ----------
  nuevo() {
    const D = U.AprendizDatos;
    const maestria = {};
    (U.Elementos ? U.Elementos.ids : ['fuego', 'agua', 'tierra', 'viento', 'rayo']).forEach(id => { maestria[id] = 0; });
    maestria[D.ELEMENTO] = D.MAESTRIA_INICIAL;
    return {
      estado: 'ninguno', // ninguno → pendiente (te lo pidió) → aprendiz → graduado
      pedidoDia: 0, ultimoPedidoDia: -99,
      elemento: D.ELEMENTO,
      stats: Object.assign({}, D.STATS_INICIALES),
      maestria, estilos: { yin: 0, yang: 0 },
      tecnicas: [], // set que TÚ le enseñas: ids de registro U.Habilidades, máx. 5
      entrenos: 0, acompana: false, retosGanados: 0, retosPerdidos: 0,
      _entrenosVistos: 0, _vigilando: null, _retoActivo: false, _retosVistos: 0, _aliadoCd: 0
    };
  },
  asegurar() {
    const E = U.Juego.estado; if (!E) return null;
    if (!E.aprendiz) E.aprendiz = this.nuevo();
    const a = E.aprendiz, D = U.AprendizDatos;
    if (!a.stats) a.stats = Object.assign({}, D.STATS_INICIALES);
    if (!a.maestria) { a.maestria = {}; (U.Elementos ? U.Elementos.ids : []).forEach(id => { a.maestria[id] = 0; }); a.maestria[a.elemento || D.ELEMENTO] = D.MAESTRIA_INICIAL; }
    if (!a.estilos) a.estilos = { yin: 0, yang: 0 };
    if (!Array.isArray(a.tecnicas)) a.tecnicas = [];
    if (a.entrenos == null) a.entrenos = 0;
    if (a.acompana == null) a.acompana = false;
    if (a.retosGanados == null) a.retosGanados = 0;
    if (a.retosPerdidos == null) a.retosPerdidos = 0;
    if (a.estado == null) a.estado = 'ninguno';
    return a;
  },
  serializable() {
    const a = this.asegurar(); if (!a) return null;
    const c = JSON.parse(JSON.stringify(a));
    Object.keys(c).forEach(k => { if (k.charAt(0) === '_') delete c[k]; }); // transitorios no se guardan
    return c;
  },
  restaurar(d) {
    const a = this.asegurar(); if (!a || !d) return;
    if (d.estado) a.estado = d.estado;
    if (d.pedidoDia != null) a.pedidoDia = d.pedidoDia;
    if (d.ultimoPedidoDia != null) a.ultimoPedidoDia = d.ultimoPedidoDia;
    if (d.elemento) a.elemento = d.elemento;
    if (d.stats) a.stats = Object.assign({}, d.stats);
    if (d.maestria) a.maestria = Object.assign({}, d.maestria);
    if (d.estilos) a.estilos = Object.assign({ yin: 0, yang: 0 }, d.estilos);
    if (Array.isArray(d.tecnicas)) a.tecnicas = d.tecnicas.slice(0, U.AprendizDatos.MAX_TECNICAS);
    if (d.entrenos != null) a.entrenos = d.entrenos;
    if (d.acompana != null) a.acompana = !!d.acompana;
    if (d.retosGanados != null) a.retosGanados = d.retosGanados;
    if (d.retosPerdidos != null) a.retosPerdidos = d.retosPerdidos;
    a._vigilando = null; a._retoActivo = false; a._aliadoCd = 0; // un entreno/reto a medias no sobrevive a cargar
    const n = this.buscar(); if (n) n.enEscolta = !!a.acompana;
  },

  // ---------- registro e inicio ----------
  registrar() {
    if (this._registrado) return;
    this._registrado = true;
    const D = U.AprendizDatos;
    if (U.Emociones && U.Emociones.catalogo) U.Emociones.catalogo[D.NPC_ID] = { nombre: D.NOMBRE, rol: D.ROL };
    if (U.Personas && U.Personas.datos) U.Personas.datos[D.NPC_ID] = D.PERSONA;
    if (U.Vida && U.Vida.RUTINAS) U.Vida.RUTINAS[D.NPC_ID] = D.RUTINA.map(s => Object.assign({}, s));
    if (U.Render && U.Render.paletaNPC) U.Render.paletaNPC[D.NPC_ID] = Object.assign({}, D.PALETA);
    if (U.Dialogo && U.Dialogo.guiones) {
      const self = this;
      U.Dialogo.guiones[D.NPC_ID] = {
        saludo: D.SALUDO,
        get opciones() { return self.guionOpciones(); } // frescas cada vez: progreso real, solo lo disponible
      };
    }
    this.instalarDialogo();
  },
  instalarDialogo() {
    if (!U.Dialogo || !U.Dialogo.elegir || U.Dialogo._aprEnvuelto) return;
    const orig = U.Dialogo.elegir.bind(U.Dialogo);
    U.Dialogo._aprEnvuelto = true;
    U.Dialogo.elegir = function (i) {
      const o = this.opciones && this.opciones[i];
      const n = this.npc;
      if (o && o.accion && o.accion.indexOf('apr') === 0 && n && n.id === U.AprendizDatos.NPC_ID && U.Aprendiz) {
        U.Aprendiz.elegirDialogo(o, n);
        return;
      }
      return orig(i);
    };
  },
  init() {
    this.registrar();
    const E = U.Juego.estado; if (!E) return;
    this.asegurar();
    if (!this.buscar()) this.crearNpc();
    else { const n = this.buscar(); const a = this.asegurar(); if (n && a.acompana) n.enEscolta = true; }
  },
  crearNpc() {
    const E = U.Juego.estado, D = U.AprendizDatos;
    const rng = (E && E.rng) || Math.random;
    const n = U.Emociones.crear(D.NPC_ID, rng, { x: D.SPAWN.x, y: D.SPAWN.y });
    n.casaPos = { x: D.CASA.x, y: D.CASA.y };
    n.mapa = 'aldea';
    E.roster = E.roster || [];
    E.roster.push(n);
    if (!E.npcsPorMapa) E.npcsPorMapa = {};
    E.npcsPorMapa.aldea = E.npcsPorMapa.aldea || [];
    if (E.npcsPorMapa.aldea.indexOf(n) < 0) E.npcsPorMapa.aldea.push(n);
    if (U.Juego.refrescarNpcs) U.Juego.refrescarNpcs();
    return n;
  },
  buscar() {
    const E = U.Juego.estado; if (!E) return null;
    const id = U.AprendizDatos.NPC_ID;
    const enRoster = (E.roster || []).find(x => x.id === id);
    if (enRoster) return enRoster;
    return (U.Vida && U.Vida.buscar) ? U.Vida.buscar(id) : null;
  },

  // ---------- desbloqueo ----------
  titulosCount() {
    const E = U.Juego.estado; if (!E) return 0;
    if (U.Progresion && U.Progresion.asegurar) { const p = U.Progresion.asegurar(); return p && Array.isArray(p.titulos) ? p.titulos.length : 0; }
    return (E.prog && Array.isArray(E.prog.titulos)) ? E.prog.titulos.length : 0;
  },
  famaActual() {
    const E = U.Juego.estado; if (!E || !E.jugador) return 0;
    if (U.Orgs && U.Orgs.fama) return U.Orgs.fama(E);
    if (U.Economia && U.Economia.karma) return U.Economia.karma(E.jugador, U.Economia.puebloActual());
    return 0;
  },
  puedeSerGuia() {
    const D = U.AprendizDatos;
    const titulos = this.titulosCount(), fama = this.famaActual();
    return { ok: titulos >= D.TITULOS_MIN && fama >= D.FAMA_MIN, titulos, fama,
      faltaTitulos: Math.max(0, D.TITULOS_MIN - titulos), faltaFama: Math.max(0, D.FAMA_MIN - fama) };
  },

  // ---------- tick ----------
  tick(dt) {
    const E = U.Juego.estado; if (!E || !E.jugador || E.ui === 'test') return;
    const a = this.asegurar(); if (!a) return;
    const D = U.AprendizDatos;
    // LA PETICIÓN: cuando cumples el umbral, Taro te lo pide (por diálogo, no por arte
    // de magia). El banner te avisa; la conversación es con él, en la plaza. Si lo
    // rechazas, no insiste hasta pasados 2 días.
    if (a.estado === 'ninguno') {
      const p = this.puedeSerGuia();
      const dia = E.reloj ? (E.reloj.dia || 1) : 1;
      if (p.ok && dia - (a.ultimoPedidoDia || -99) >= 2) {
        a.estado = 'pendiente'; a.pedidoDia = dia; a.ultimoPedidoDia = dia;
        U.HUD.banner('🌿 ¡TARO QUIERE HABLAR CONTIGO! · TE ESPERA EN LA PLAZA DE BRUMA', 3);
        if (U.Audio) U.Audio.sfx('unlock');
        if (U.Guardado) U.Guardado.guardarAuto();
      }
    }
    // VIGILANCIA DEL ENTRENO: la sesión la lleva E.entreno (como con Torin) y la
    // completa progresoEntreno (golpes/dash/meditación). Aquí solo detectamos que
    // terminó (historial.entrenos subió) y le damos a TARO su crecimiento.
    if (a._vigilando) {
      if (!E.entreno) {
        const vistos = E.historial ? (E.historial.entrenos || 0) : 0;
        const tipo = a._vigilando; a._vigilando = null; a._entrenosVistos = vistos;
        if (vistos > (a._entrenosVistosPrev || 0)) this.completarEntreno(tipo);
      }
    }
    // VIGILANCIA DEL RETO: victoria = historial.retos subió (actualizarReto); si se
    // cierra sin subir, se acabó el tiempo: derrota.
    if (E.reto && E.reto.guia === D.NPC_ID) { a._retoActivo = true; a._retosVistos = E.historial ? (E.historial.retos || 0) : 0; }
    else if (a._retoActivo && !E.reto) {
      a._retoActivo = false;
      const vistos = E.historial ? (E.historial.retos || 0) : 0;
      if (vistos > (a._retosVistos || 0)) { a.retosGanados++; }
      else { a.retosPerdidos++; const n = this.buscar(); if (n) { if (!n.hechos) n.hechos = []; n.hechos.push('te ganó su reto de combate'); } }
      a._retosVistos = vistos;
      if (U.Guardado) U.Guardado.guardarAuto();
    }
    // GRADUACIÓN: 70% de maestría en su elemento + 10 entrenos.
    if (a.estado === 'aprendiz' && (a.maestria[a.elemento] || 0) >= D.GRADUACION_MAESTRIA && (a.entrenos || 0) >= D.GRADUACION_ENTRENOS) this.graduar();
    // ACOMPAÑAR: te sigue y pelea a tu lado.
    if (a.acompana) this.tickAcompanar(dt);
  },
  tickAcompanar(dt) {
    const E = U.Juego.estado, j = E.jugador, a = this.asegurar();
    const n = this.buscar(); if (!n) return;
    if (n.mapa !== E.mapaId) { n.enEscolta = false; return; } // dentro de la casa/oficina no entra: te espera fuera
    n.enEscolta = true; // Vida.mover lo salta: lo muevo yo, como a la escolta
    const d = U.Grid.dist(n, j);
    if (d > 2.4) {
      const dx = j.x - n.x, dy = j.y - n.y, dd = d || 0.001;
      n.dir = U.Grid.dir8(dx, dy);
      U.Vida.moverNPC(n, E.mapa, dx / dd * 2.6 * dt, dy / dd * 2.6 * dt);
      n.moviendo = true; n.anim += dt * 1.6;
    } else { n.moviendo = false; n.dir = U.Grid.dir8(j.x - n.x, j.y - n.y); }
    a._aliadoCd = Math.max(0, (a._aliadoCd || 0) - dt);
    if (a._aliadoCd <= 0 && E.enCombate && U.Combate) {
      const vivos = U.Combate.vivos ? U.Combate.vivos() : (E.enemigos || []).filter(e => e.vida > 0);
      let mejor = null, bd = 6.5;
      vivos.forEach(e => { const dd = U.Grid.dist(n, e); if (dd < bd) { bd = dd; mejor = e; } });
      if (mejor) {
        a._aliadoCd = 2.5;
        const dmg = Math.max(3, Math.round((a.stats.ataque || 8) * 0.8));
        U.Combate.dañoEnemigo(mejor, dmg, a.elemento, { desafio: 0.5 });
        U.Combate.particulas(mejor.x, mejor.y - 0.6, 6, U.Elementos.color(a.elemento), 'chispa');
        const tec = this.tecnicaFavorita();
        U.Combate.texto(mejor, 'TARO · ' + (tec || '¡Toma!') + ' −' + dmg, U.Elementos.color(a.elemento), 1);
        a.maestria[a.elemento] = Math.min(100, (a.maestria[a.elemento] || 0) + 0.05); // pelear a tu lado también le enseña
        if (U.Audio) U.Audio.sfx('golpe');
      }
    }
  },
  tecnicaFavorita() {
    const E = U.Juego.estado, a = this.asegurar(); if (!E || !a || !a.tecnicas.length || !U.Habilidades) return null;
    const tec = U.Habilidades.porId(E.jugador, a.tecnicas[0]);
    return tec ? tec.nombre : null;
  },

  // ---------- entreno (espejo de Torin) ----------
  iniciarEntrenoAprendiz(tipo, n) {
    const E = U.Juego.estado, D = U.AprendizDatos, a = this.asegurar();
    const d = D.ENTRENOS[tipo];
    const decir = txt => { U.Dialogo.decir(txt); U.Dialogo.razon = ''; U.Dialogo.pintarRazon(); U.Dialogo.pintarCara(); if (U.Audio) U.Audio.sfx('dialogo'); };
    const refrescar = () => { if (U.Dialogo.mostrarSecciones) U.Dialogo.mostrarSecciones(n); };
    if (!d) { decir('Ese entreno no existe.'); refrescar(); return; }
    if (a.estado !== 'aprendiz' && a.estado !== 'graduado') { decir('Taro aún no es tu aprendiz: primero tiene que pedirte que seas su Guía (eso pasa cuando ya tienes títulos y fama en Bruma).'); refrescar(); return; }
    if (E.entreno) { decir('Ya tienes un entrenamiento en curso (' + E.entreno.nombre + '). Termínalo primero y luego entrenas a Taro: un entreno a la vez, como con Torin.'); refrescar(); return; }
    E.entreno = { guia: D.NPC_ID, tipo: d.tipo, meta: d.meta, prog: 0, nombre: d.nombre, recompensa: d.recompensa };
    a._vigilando = d.tipo;
    a._entrenosVistosPrev = E.historial ? (E.historial.entrenos || 0) : 0;
    a._entrenosVistos = a._entrenosVistosPrev;
    U.HUD.banner('🎯 ' + d.nombre.toUpperCase(), 1.8);
    if (U.Audio) U.Audio.sfx('unlock');
    decir('Taro deja el palo y se pone en guardia: «' + d.nombre + '. ¡Vamos, Guía!» (El entreno es el mismo que con Torin: TÚ haces la tarea —golpes, dashes o meditación— y ÉL aprende contigo. Tu recompensa también llega: ' + (U.Estadisticas ? U.Estadisticas.etiquetas[d.recompensa] : d.recompensa) + ' +.)');
    refrescar();
  },
  completarEntreno(tipo) {
    const D = U.AprendizDatos, a = this.asegurar();
    const d = D.ENTRENOS[tipo]; if (!d) return;
    const c = d.crecimiento;
    const tope = k => (U.Estadisticas && U.Estadisticas.topes ? U.Estadisticas.topes[k] : 3000);
    const subidas = [];
    Object.keys(c.stats || {}).forEach(k => {
      a.stats[k] = Math.min(tope(k), (a.stats[k] || 0) + c.stats[k]);
      subidas.push(((U.Estadisticas && U.Estadisticas.etiquetas) ? U.Estadisticas.etiquetas[k] : k) + ' +' + c.stats[k]);
    });
    a.maestria[a.elemento] = Math.min(100, (a.maestria[a.elemento] || 0) + (c.maestria || 0));
    subidas.push('Maestría ' + U.Elementos.nombre(a.elemento) + ' +' + (c.maestria || 0) + '%');
    if (c.yin) { a.estilos.yin = Math.min(100, a.estilos.yin + c.yin); subidas.push('Yin +' + c.yin); }
    if (c.yang) { a.estilos.yang = Math.min(100, a.estilos.yang + c.yang); subidas.push('Yang +' + c.yang); }
    a.entrenos++;
    const n = this.buscar();
    if (n) {
      if (U.Economia && U.Economia.confianza) U.Economia.confianza(n, 3);
      if (!n.hechos) n.hechos = [];
      n.hechos.push('completó un entreno contigo (' + d.tipo + ')');
      if (U.Emociones) U.Emociones.evento(n, { realidad: 80, energia: 10, etiqueta: 'entreno completo' });
    }
    U.HUD.banner('🎯 ¡TARO COMPLETÓ EL ENTRENO! · ' + subidas.join(' · '), 2.4);
    if (U.Audio) U.Audio.sfx('unlock');
    if (n && U.Combate && U.Combate.texto) U.Combate.texto(n, '▲ ' + subidas.join(' · '), '#7ef0c0', 1);
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  graduar() {
    const a = this.asegurar(); if (!a || a.estado !== 'aprendiz') return;
    a.estado = 'graduado';
    if (U.Progresion) U.Progresion.otorgarTitulo('Guía de Taro');
    U.HUD.banner('🌿 ¡TARO DOMINA LA TIERRA! · YA NO ES TU APRENDIZ: ES UN GUÍA EN FORMACIÓN', 3.5);
    if (U.Audio) U.Audio.sfx('victoria');
    const n = this.buscar();
    if (n) { if (!n.hechos) n.hechos = []; n.hechos.push('se graduó como tu aprendiz'); if (U.Emociones) U.Emociones.evento(n, { realidad: 95, energia: 20, etiqueta: 'graduación' }); }
    if (U.Guardado) U.Guardado.guardarAuto();
  },

  // ---------- enseñar / olvidar (dirección Pokémon, por id genérico) ----------
  nombresSet() {
    const E = U.Juego.estado, a = this.asegurar(); if (!E || !a) return [];
    return a.tecnicas.map(id => {
      const tec = U.Habilidades ? U.Habilidades.porId(E.jugador, id) : null;
      return tec ? tec.nombre : id;
    });
  },
  ensenar(tecId) {
    const E = U.Juego.estado, j = E.jugador, D = U.AprendizDatos, a = this.asegurar();
    const tec = U.Habilidades ? U.Habilidades.porId(j, tecId) : null;
    if (!tec) return 'Esa técnica no existe en tu registro: no puedes enseñar lo que ni tú conoces.';
    if (a.tecnicas.indexOf(tecId) >= 0) return 'Taro ya sabe «' + tec.nombre + '»: ya está en su set. Enséñale otra, o que olvide esta primero.';
    if (a.tecnicas.length >= D.MAX_TECNICAS) return 'Su set está lleno (' + D.MAX_TECNICAS + '/' + D.MAX_TECNICAS + '): para enseñarle «' + tec.nombre + '» tiene que OLVIDAR una primero. El set lo decides tú, pero no crece sin límite — como en Pokémon.';
    // GENÉRICO: ¿la dominas TÚ? Vale maestría ≥ umbral, concedida por un Guía
    // (j.tecnicasAprendidas) o estilo Yang/Yin según el caso. Nada hardcodeado.
    if (!U.Habilidades.aprendida(j, tec)) return 'Tú aún no dominas «' + tec.nombre + '»: no puedes enseñar lo que no has aprendido. (Se aprende por maestría, de un Guía o, el Yang, entrenando el estilo.)';
    a.tecnicas.push(tecId);
    const n = this.buscar(); if (n) { if (!n.hechos) n.hechos = []; n.hechos.push('le enseñaste «' + tec.nombre + '»'); }
    U.HUD.banner('📖 TARO APRENDIÓ «' + tec.nombre.toUpperCase() + '» · SU SET: ' + a.tecnicas.length + '/' + D.MAX_TECNICAS, 2.2);
    if (U.Audio) U.Audio.sfx('unlock');
    if (U.Guardado) U.Guardado.guardarAuto();
    return 'Le enseñas «' + tec.nombre + '» paso a paso, como Torin te enseñó a ti: primero el gesto, luego la respiración, luego la Esencia. Taro lo repite hasta que le sale: ya es SUYA. Su set ahora es: ' + this.nombresSet().join(', ') + ' (' + a.tecnicas.length + '/' + D.MAX_TECNICAS + ').';
  },
  olvidar(tecId) {
    const a = this.asegurar();
    const i = a.tecnicas.indexOf(tecId); if (i < 0) return 'Taro no tiene esa técnica en su set.';
    const nombre = this.nombresSet()[i];
    a.tecnicas.splice(i, 1);
    if (U.Guardado) U.Guardado.guardarAuto();
    return 'Taro asiente, serio: «Vale, Guía. La dejo ir.» «' + nombre + '» sale de su set (ahora: ' + (this.nombresSet().join(', ') || 'vacío') + '). Ya le puedes enseñar otra en su lugar.';
  },
  cambiarAcompanar() {
    const a = this.asegurar(); const n = this.buscar();
    a.acompana = !a.acompana;
    if (n) n.enEscolta = !!a.acompana;
    if (U.Guardado) U.Guardado.guardarAuto();
    return a.acompana
      ? 'Taro se pone a tu lado, palo en mano: «Voy contigo, Guía. Si sale algo, yo también pego.» (Te sigue por Bruma y en combate golpea al enemigo más cercano. Si entras en tu casa o en la Oficina, te espera fuera.)'
      : 'Taro asiente y vuelve a su puesto en la plaza: «Aquí te espero, Guía. Cuando quieras, volvemos.»';
  },

  // ---------- textos ----------
  textoPeticion() {
    const p = this.puedeSerGuia();
    return 'Te he visto pelear, y he oído lo que dicen de ti en la plaza: tienes ' + p.titulos + ' título(s) y la gente de Bruma te respeta (fama ' + p.fama + '). Yo… yo quiero aprender en serio, no solo jugar con un palo. ¿Serías mi Guía? Yo entreno contigo, hago lo que me pidas, y un día peleo a tu lado.';
  },
  textoSueno() {
    const p = this.puedeSerGuia(); const a = this.asegurar();
    let t = 'Taro mira al suelo, luego a ti: «Quiero ser guardia como Kaelen. De verdad, no de mentiritas. Practico todos los días con mi palo, pero… solo llego hasta aquí. Necesito un Guía que me enseñe en serio.»';
    if (a.estado === 'aprendiz' || a.estado === 'graduado') t += ' (Ya eres su Guía: háblale para entrenarlo, enseñarle tu set o pedirle que te acompañe.)';
    else if (p.ok) t += ' (Y mírate: ya cumples lo que pide un Guía — títulos y fama. ¿A qué esperas? Háblale y escucha lo que te quiere pedir.)';
    else {
      t += ' (Para que te tome como Guía te falta: ';
      if (p.faltaTitulos > 0) t += 'un título honorífico (tienes ' + p.titulos + ', necesitas 1: defiende un pueblo, gana un torneo, doma una criatura…)';
      if (p.faltaTitulos > 0 && p.faltaFama > 0) t += ' y ';
      if (p.faltaFama > 0) t += 'fama ' + p.fama + '/20 en este pueblo (ayuda en misiones, cumple promesas)';
      t += '.)';
    }
    return t;
  },
  textoProgreso() {
    const a = this.asegurar();
    const el = U.Elementos.nombre(a.elemento);
    const estadoTxt = a.estado === 'graduado' ? 'GRADUADO: ya domina su elemento, un Guía en formación (sigue entrenando contigo si quieres)' : a.estado === 'aprendiz' ? 'Tu APRENDIZ' : 'Aún no es tu aprendiz';
    const st = a.stats;
    let t = 'Taro · ' + estadoTxt + ' · Elemento: ' + el + ' (maestría ' + Math.floor(a.maestria[a.elemento] || 0) + '%) · Yin ' + Math.floor(a.estilos.yin) + ' · Yang ' + Math.floor(a.estilos.yang)
      + ' · Vida ' + Math.floor(st.vida) + ' · Esencia ' + Math.floor(st.esencia) + ' · Ataque ' + Math.floor(st.ataque) + ' · Defensa ' + Math.floor(st.defensa) + ' · Mente ' + Math.floor(st.mente) + ' · Velocidad ' + Math.floor(st.velocidad)
      + ' · Entrenos completados: ' + (a.entrenos || 0) + ' · Retos: ' + (a.retosGanados || 0) + ' ganados, ' + (a.retosPerdidos || 0) + ' perdidos'
      + ' · Su set (' + a.tecnicas.length + '/' + U.AprendizDatos.MAX_TECNICAS + '): ' + (this.nombresSet().join(', ') || 'vacío — enséñale TUS técnicas')
      + (a.acompana ? ' · Te acompaña ahora mismo.' : ' · Está en su puesto en la plaza.');
    if (a.estado === 'aprendiz') t += ' Para GRADUARSE necesita maestría ' + U.AprendizDatos.GRADUACION_MAESTRIA + '% en ' + el + ' (lleva ' + Math.floor(a.maestria[a.elemento] || 0) + '%) y ' + U.AprendizDatos.GRADUACION_ENTRENOS + ' entrenos (lleva ' + (a.entrenos || 0) + ').';
    return t;
  },

  // ---------- diálogo ----------
  guionOpciones() {
    const E = U.Juego.estado; if (!E || !E.jugador) return [];
    const a = this.asegurar(); if (!a) return [];
    const j = E.jugador, D = U.AprendizDatos;
    const R = (t, extra) => Object.assign({ t, realidad: 66, energia: 5, resp: { pos: '…', neg: '…' } }, extra || {});
    const ops = [];
    if (a.estado === 'pendiente') {
      ops.push(R('🌿 Escuchar lo que Taro quiere pedirte (parece importante)', { accion: 'aprPedir', et: 'pregunta' }));
      ops.push(R('🌿 Preguntarle a Taro qué quiere ser de mayor', { accion: 'aprSueno', et: 'pregunta' }));
      return ops;
    }
    if (a.estado === 'ninguno') {
      ops.push(R('🌿 Preguntarle a Taro qué quiere ser de mayor', { accion: 'aprSueno', et: 'pregunta' }));
      return ops;
    }
    // aprendiz o graduado
    ops.push(R('📋 Ver cómo va Taro (stats, maestría y su set)', { accion: 'aprVer', et: 'pregunta' }));
    const enCurso = !!E.entreno;
    Object.keys(D.ENTRENOS).forEach(k => {
      const d = D.ENTRENOS[k];
      const etiqueta = k === 'golpes' ? '🎯 Entrenarlo: serie de golpes Yin (' + d.meta + ' que conecten)'
        : k === 'esquiva' ? '💨 Entrenarlo: guardia y esquiva (' + d.meta + ' dashes)'
        : '🌀 Entrenarlo: meditación guiada (' + d.meta + ' s, tecla R)';
      ops.push(R(etiqueta + (enCurso ? ' (ya tienes un entreno en curso)' : ''), { accion: 'aprEntrenar', tipo: k, et: 'entrenar' }));
    });
    // ENSEÑAR: solo técnicas que TÚ dominas (genérico, por id) y que él aún no tiene.
    const dominadas = U.Habilidades ? U.Habilidades.dominadas(j) : [];
    let mostradas = 0;
    dominadas.forEach(tec => {
      if (mostradas >= 10) return;
      if (a.tecnicas.indexOf(tec.id) >= 0) return;
      mostradas++;
      const clase = tec.kind === 'yang' ? 'Yang' : tec.kind === 'yin' ? 'Yin' : U.Elementos.nombre(tec.elemento);
      ops.push(R('📖 Enseñarle «' + tec.nombre + '» (' + clase + ')', { accion: 'aprEnsenar', tecId: tec.id, et: 'entrenar' }));
    });
    if (a.tecnicas.length >= D.MAX_TECNICAS) ops.push(R('📖 Su set está lleno (' + D.MAX_TECNICAS + '/' + D.MAX_TECNICAS + '): que olvide una para enseñarle otra', { accion: 'aprVer', et: 'pregunta' }));
    a.tecnicas.forEach(id => {
      const tec = U.Habilidades ? U.Habilidades.porId(j, id) : null;
      ops.push(R('🗑 Que Taro olvide «' + (tec ? tec.nombre : id) + '»', { accion: 'aprOlvidar', tecId: id, et: 'entrenar' }));
    });
    ops.push(R(a.acompana ? '🚶 Que Taro vuelva a la plaza (deja de acompañarte)' : '🤝 Que Taro te acompañe (pelea a tu lado)', { accion: 'aprAcompanar', et: 'entrenar' }));
    if ((a.maestria[a.elemento] || 0) >= D.RETO_MAESTRIA_MIN || (a.entrenos || 0) >= D.RETO_ENTRENOS_MIN) {
      ops.push(R('⚔ Retar a Taro a un duelo (60 s, como con Kaelen y Torin)', { accion: 'reto', et: 'reto', resp: { pos: 'Acepto el reto.', neg: 'Sin reto.' } }));
    }
    return ops;
  },
  elegirDialogo(o, n) {
    const E = U.Juego.estado, a = this.asegurar(); if (!a) return;
    const decir = txt => { U.Dialogo.decir(txt); U.Dialogo.razon = ''; U.Dialogo.pintarRazon(); U.Dialogo.pintarCara(); if (U.Audio) U.Audio.sfx('dialogo'); };
    const refrescar = () => { if (U.Dialogo.mostrarSecciones) U.Dialogo.mostrarSecciones(n); };
    switch (o.accion) {
      case 'aprPedir': {
        if (U.Emociones) U.Emociones.evento(n, { realidad: 72, energia: 8, etiqueta: 'te pide ser su Guía' });
        decir('Taro se quita el palo de la espalda, lo deja en el suelo y te mira a los ojos, serio por primera vez desde que lo conoces: «' + this.textoPeticion() + '»');
        U.Dialogo.opciones = [
          { t: '🌿 «Sí, Taro. Seré tu Guía.» (aceptar: entrenarlo es tu trabajo ahora)', accion: 'aprAceptar', realidad: 80, energia: 10, et: 'guia' },
          { t: '«Ahora no, Taro. Todavía no.» (rechazar: te lo volverá a pedir en unos días)', accion: 'aprRechazar', realidad: 40, energia: 5, et: 'guia' }
        ];
        U.Dialogo.pintarOpciones();
        return;
      }
      case 'aprAceptar': {
        a.estado = 'aprendiz';
        if (U.Emociones) U.Emociones.evento(n, { realidad: 95, energia: 20, etiqueta: 'aceptaste ser su Guía' });
        if (!n.hechos) n.hechos = [];
        n.hechos.push('aceptaste ser su Guía');
        U.HUD.banner('🌿 ¡ERES EL GUÍA DE TARO! · ENTRENA CON ÉL Y ENSÉÑALE TU SET', 3);
        if (U.Audio) U.Audio.sfx('victoria');
        decir('Taro suelta el aire que estaba aguantando y sonríe como si le hubieran dado la plaza entera: «¡Gracias, Guía! Empiezo ahora mismo: dime qué entrenamos primero.» (Háblale cuando quieras: entrenarlo como Torin te entrena a ti, enseñarle TUS técnicas —su set lo decides tú— o pedirle que te acompañe y pelee a tu lado.)');
        refrescar();
        if (U.Guardado) U.Guardado.guardarAuto();
        return;
      }
      case 'aprRechazar': {
        a.estado = 'ninguno';
        a.ultimoPedidoDia = E.reloj ? (E.reloj.dia || 1) : 1;
        if (U.Emociones) U.Emociones.evento(n, { realidad: 45, energia: 5, etiqueta: 'rechazaste ser su Guía' });
        decir('Taro baja la mirada, recoge su palo y asiente despacio: «Vale… lo entiendo. Seguiré practicando solo. Si algún día cambias de idea… aquí estaré, en la plaza.» (Te lo volverá a pedir en unos días, si sigues cumpliendo el umbral.)');
        refrescar();
        if (U.Guardado) U.Guardado.guardarAuto();
        return;
      }
      case 'aprSueno': decir(this.textoSueno()); refrescar(); return;
      case 'aprVer': decir(this.textoProgreso()); refrescar(); return;
      case 'aprEntrenar': this.iniciarEntrenoAprendiz(o.tipo, n); return;
      case 'aprEnsenar': decir(this.ensenar(o.tecId)); refrescar(); return;
      case 'aprOlvidar': decir(this.olvidar(o.tecId)); refrescar(); return;
      case 'aprAcompanar': decir(this.cambiarAcompanar()); refrescar(); return;
    }
  },

  // ---------- pausa (opcional: el coordinador puede sumarlo a Progresion.htmlPausa/resumenPerfil) ----------
  htmlResumen() {
    const E = U.Juego.estado, a = this.asegurar(); if (!a) return '';
    const esc = s => (U.HUD && U.HUD.escHtml) ? U.HUD.escHtml(s) : String(s);
    const st = a.stats;
    const estadoTxt = a.estado === 'graduado' ? 'GRADUADO (Guía en formación)' : a.estado === 'aprendiz' ? 'Tu aprendiz' : a.estado === 'pendiente' ? 'Te pidió ser su Guía (háblale en la plaza)' : 'Aún no es tu aprendiz';
    return '<section><h3>🌿 Tu aprendiz · Taro</h3><div style="font-size:12.5px">Estado: <b>' + estadoTxt + '</b> · Elemento: ' + esc(U.Elementos.nombre(a.elemento)) + ' · Maestría: <b>' + Math.floor(a.maestria[a.elemento] || 0) + '%</b>'
      + '<br>Vida ' + Math.floor(st.vida) + ' · Esencia ' + Math.floor(st.esencia) + ' · Ataque ' + Math.floor(st.ataque) + ' · Defensa ' + Math.floor(st.defensa) + ' · Mente ' + Math.floor(st.mente) + ' · Velocidad ' + Math.floor(st.velocidad)
      + ' · Yin ' + Math.floor(a.estilos.yin) + ' · Yang ' + Math.floor(a.estilos.yang)
      + '<br>Entrenos: <b>' + (a.entrenos || 0) + '</b> · Retos: ' + (a.retosGanados || 0) + ' ganados / ' + (a.retosPerdidos || 0) + ' perdidos' + (a.acompana ? ' · <b>Te acompaña</b>' : '')
      + '<br>Su set (' + a.tecnicas.length + '/' + U.AprendizDatos.MAX_TECNICAS + '): ' + (this.nombresSet().map(esc).join(', ') || '<span style="color:var(--textoFrio)">vacío — enséñale TUS técnicas hablándole</span>')
      + (a.estado === 'aprendiz' ? '<br><span style="color:var(--textoFrio)">Se gradúa con maestría ' + U.AprendizDatos.GRADUACION_MAESTRIA + '% y ' + U.AprendizDatos.GRADUACION_ENTRENOS + ' entrenos.</span>' : '')
      + '</div></section>';
  }
};
