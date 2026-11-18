/* === js/main.js === */
/* Unipar — main: arranque, estado de la vida, bucle único (rAF), entrada teclado/touch, interacciones, objetivos, cámara, pausa y fin. */
window.U = window.U || {};

U.Juego = {
  estado: null, input: { vx: 0, vy: 0, mag: 0, joy: false, teclas: {}, a: false }, ultimo: 0, corriendo: false,
  boot() {
    U.Render.init(document.getElementById('lienzo')); U.HUD.init(); U.Dialogo.init(); U.TestUI.init();
    if (U.Guardado) U.Guardado.iniciarAuto(); // guardado automático: siempre activo desde el arranque
    // Tocar el mundo: si el toque cae sobre un personaje u objeto interactuable al alcance, interactúa con él.
    document.getElementById('lienzo').addEventListener('pointerdown', e => this.tocarMundo(e.clientX, e.clientY));
    window.addEventListener('keydown', e => this.keydown(e)); window.addEventListener('keyup', e => this.keyup(e));
    window.addEventListener('blur', () => { this.input.teclas = {}; this.input.a = false; if (this.estado && this.estado.jugador) this.estado.jugador.cargando = false; });
    document.addEventListener('pointerdown', () => { U.Audio.init(); U.Audio.reanudar(); }, { passive: true });
    this.corriendo = true; this.ultimo = performance.now(); requestAnimationFrame(t => this.bucle(t));
  },
  // ---------- nueva vida ----------
  comenzarMundo(perfil, semilla, nombre) {
    const rng = U.TestUI.rngSemilla(semilla); const mapa = U.Grid.crearMapaContinuo(rng);
    const j = { tipo: 'jugador', nombre, perfil, elemento: perfil.elemento, elemento2: perfil.elemento2, elementos: perfil.elemento2 ? [perfil.elemento, perfil.elemento2] : [perfil.elemento], elementoActivo: perfil.elemento, atributo: perfil.atributo,
      stats: Object.assign({}, perfil.stats), vida: perfil.stats.vida, esencia: perfil.stats.esencia, maestria: Object.assign({}, perfil.maestria), estilos: Object.assign({}, perfil.estilos), regenBonus: 0,
      x: mapa.inicio.x, y: mapa.inicio.y, dir: { x: 0, y: 1 }, anim: 0, moviendo: false, trote: false, agotado: false, invuln: 0, flash: 0, carga: 0, cargando: false, ataqueAnim: 0, cdYin: 0, cdYang: 0, cdTec: {}, cdBasico: 0, dash: { t: 0, cd: 0, dx: 0, dy: 0 }, rastro: [], tecnicaIdx: 0, yangForma: 'haz', equipo: [], tecnicasAprendidas: [], tieneYang: !!perfil.yangAfin, buffs: { sobrecarga: 0, sobrecargaCd: 0 }, descansando: false, pociones: 0, bolsaPociones: [], bolsaComida: [], reliquias: { tenidas: [], puesta: null, artefactos: [], casa: [], encontradas: [] }, prohibidas: { pergaminos: [], aprendidas: [], casa: [], encontradas: [] }, prohibidaSel: null, cdProh: {}, karma: {}, sabores: (perfil.sabores || U.Economia.SABORES.slice()), polainas: {}, polainaEquipada: null, polainaMultCrec: 1, pasosPolainas: 0, condPolainas: 0, comidasHoy: 0, permisoHasta: 0, permisoUsos: 0, promesas: [], monedas: 0, ultimaOrilla: null, levitT: 0, enAguaT: 0, caminarAgua: false, cercaAgua: false, sobreAgua: false, hechicero: { potencial: !!(perfil.hechiceroPotencial || perfil.atributo === 'sabio' || (perfil.stats && perfil.stats.mente >= 12)), basicos: 0, basicas: [], despertado: false }, escudo: false, escudoAprendido: false, escudoNv: 0, escudoExp: 0, escudoVida: 0, presentimientoAprendido: false, tiempoLento: false, acero: false, cansancio: 100, condicionExtra: 0, gastoFatiga: 0, dot: null, invertido: 0, invMapa: null, invTotal: 0, flags: {} };
    // CORRECCIÓN 2 · PARTIDA NUEVA SOLO CON LO BÁSICO: el jugador nace con su
    // ataque básico de elemento (botón 1 del equipo) y nada más dominado: ni
    // Resistencia de Acero, ni formas Yang, ni técnicas de Místico, ni
    // fusiones. U.Habilidades.nuevoJugador marca la vida 'desde cero' y guarda
    // los valores iniciales del test, para que aprendida() solo dé por dominado
    // lo que se entrene POR ENCIMA de ellos en esta vida. (Al cargar una
    // partida guardada, U.Guardado.cargar quita esta marca en partidas viejas.)
    if (U.Habilidades && U.Habilidades.nuevoJugador) Object.assign(j, U.Habilidades.nuevoJugador(perfil));
    // tieneYang = Yang DESPERTADO: con afinidad naces despierto; sin ella, despierta al entrenar el estilo hasta el umbral (5).
    // SPAWN INICIAL: una nueva vida empieza DENTRO de tu casa en la Aldea de Bruma
    // (el interior 'casa': piso, paredes, cama y cofre, con la puerta del sur para
    // salir a la aldea), NO afuera en la plaza ni en la aldea de tu elemento. El
    // interior ya existía como mapa aparte (crearMapaCasa, el mismo al que se entra
    // por la puerta de la casa azul); ahora también es el punto de aparición.
    // mapaCasa.inicio = (10.5, 13.5): dentro, junto a la puerta, sin pisar la salida.
    const mapaCasa = U.Grid.crearMapaCasa(U.TestUI.rngSemilla(semilla + '-casa'));
    j.x = mapaCasa.inicio.x; j.y = mapaCasa.inicio.y;
    const npcs = ['kaelen', 'sora', 'torin', 'marisol', 'breno', 'elena', 'marco', 'pipo', 'nami', 'orin', 'zara', 'varek', 'vera', 'bram', 'dario', 'sana', 'milo', 'petra', 'ines', 'ramiro', 'carmen', 'felipe', 'lucia', 'tomas', 'elvira', 'rodrigo', 'camila', 'andres', 'valeria', 'jorge', 'sofia', 'diego', 'paola', 'ariel', 'nora', 'ivan', 'lena', 'omar', 'rosa', 'hugo', 'emma', 'pablo', 'ana', 'esteban', 'miriam', 'vesper'].filter(id => mapa.npcs[id]).map(id => U.Emociones.crear(id, rng, mapa.npcs[id])); // 'vesper' entra al roster solo cuando grid.js tenga npcsPos.vesper (el filtro lo descarta hasta entonces, sin romper nada)
    const criaturas = U.Criaturas.crearTodas(mapa);
    this.estado = { ui: 'mundo', mapa: mapaCasa, mapaId: 'casa', mapas: { aldea: mapa, casa: mapaCasa }, npcsPorMapa: {}, cambioCd: 0, jugador: j, npcs, criaturas, contratos: { sangre: [], alma: null }, enemigos: [], proyectiles: [], orbes: [], efectos: { particulas: [], textos: [], haces: [], anillos: [], cadenas: [], cortes: [], telegrafos: [] }, camara: { x: j.x * 16 - U.Render.viewW / 2, y: j.y * 16 - U.Render.viewH / 2, shake: 0 }, tiempo: 0, reloj: U.Tiempo.crear(), clima: U.Clima.crear(rng), alarmaMin: 7 * 60, historial: { derrotas: 0, victorias: 0, retos: 0, entrenos: 0, torneos: 0, misiones: 0 }, reto: null, entreno: null, bandidoT: 0, hitstop: 0, dificultad: 1, semilla, rng,
      arena: { activa: false, ronda: 1, oleada: 1, total: 3, entre: 0, spawned: false, cuenta: 0 }, torneo: null, mision: null, misionIdx: 0, tablon: null, escolta: null, ultimoDia: 1, peticionT: 40, peticion: null, enCombate: false, zonaActual: null, interactuable: null, flags: {}, orgs: U.Orgs.nuevoEstado(), prog: null, destelloModo: 'normal', resumen: { daño: 0, recibido: 0, golpes: 0, tecnicas: 0, yang: 0, bajas: 0, esquives: 0, dashes: 0, crecimiento: {}, maestria: {} },
      // DISEÑO ABIERTO: NO hay cadena de objetivos ni final. Todos están DISPONIBLES
      // desde el primer minuto (estado 'actual'), en el orden que el jugador quiera,
      // y cumplir uno no desbloquea el siguiente: desbloquea lo que su PROPIA actividad
      // abre (técnicas por maestría, rangos del tablón, tramas por hablar con gente).
      // Los de las organizaciones llevan oculto:true — ni siquiera aparecen en la lista
      // hasta que el jugador las DESCUBRE hablando: al empezar no sabe que existen.
      objetivos: [ { id: 'kaelen', texto: 'Habla con Kaelen, el guardia de la aldea (una posibilidad, no un paso obligatorio).', estado: 'actual' }, { id: 'ambiente', texto: 'Visita la Ribera Húmeda y el Campo de Ceniza: siente el costo ambiental.', estado: 'actual' }, { id: 'arena', texto: 'Activa la runa de la Arena (sureste) y sobrevive 3 oleadas.', estado: 'actual' }, { id: 'contar', texto: 'Cuéntale tu victoria de la arena a Kaelen.', estado: 'actual' }, { id: 'bosque', texto: 'Camina al noroeste hasta el Bosque Susurrante (todo es un solo mapa continuo, sin transiciones): de día tranquilo; de noche salen los bandidos.', estado: 'actual' }, { id: 'regiones', texto: 'Visita el Desierto de Sal (al oeste de Bruma, por el camino del oasis) y la Montaña Brumosa (al noreste, pasando la Metrópolis y Pueblo Rocafirme). Todo caminando por el continente continuo: no hay transiciones.', estado: 'actual' }, { id: 'obelisco', texto: 'Toca el obelisco de la cima de la Montaña y aprende el Hechizo de Inversión (tecla V).', estado: 'actual' }, { id: 'casa', texto: 'Entra en tu casa (puerta de la casa azul), fija la alarma y duerme en tu cama.', estado: 'actual' }, { id: 'oficina', texto: 'Visita la OFICINA DEL GUARDIÁN (edificio dorado al sur de la plaza): conoce a Aldric y pide una MISIÓN a su secretaria Lía — el tablón es una actividad más, no una obligación.', estado: 'actual' }, { id: 'torneo', texto: 'Gana el TORNEO DE BRUMA en la Arena (entrada 50): solo cobra el podio — 1º 300, 2º 150, 3º 80 — y te recuperas tras cada ronda.', estado: 'actual' }, { id: 'romper', texto: 'Rompe un árbol o una roca que te cierre el paso: tienen vida propia y al caer dejan el camino libre.', estado: 'actual' }, { id: 'portal', texto: 'Cruzar el PORTAL entre mundos cuando despierte: es UN objetivo posible entre varios, NO el final del juego (el juego no tiene final).', estado: 'actual' }, { id: 'dominar', texto: 'Dominar los CINCO elementos (70% de maestría en cada uno): el trabajo de cinco vidas, en una.', estado: 'actual' }, { id: 'orgMano', orgId: 'mano', oculto: true, texto: 'LOS QUE DRENAN DOMINIO (su nombre verdadero aún no se conoce; «El Abismo» es solo una etiqueta tentativa): detener a los que drenan el dominio de los dominadores… o unirte a ellos.', estado: 'actual' }, { id: 'orgJade', orgId: 'jade', oculto: true, texto: 'LA RED DE JADE: impedir que capturen a EL ANCESTRO, la primera criatura… o unirte a la Red.', estado: 'actual' }, { id: 'orgCole', orgId: 'cole', oculto: true, texto: 'LOS COLECCIONISTAS: recuperar lo robado y cortar su red de informantes… o trabajar para ellos.', estado: 'actual' }, { id: 'reliquias', texto: '🎭 Busca las 6 MÁSCARAS legendarias y los 4 ARTEFACTOS antiguos escondidos en cuevas, ruinas y lugares difíciles del continente: la máscara puesta da su bonus (pasivo, sin gastar Esencia), pero en zonas salvajes atrae a Los Coleccionistas. En tu casa tienes un COFRE para guardarlos: guardados no dan bonus, pero nadie te persigue por ellos.', estado: 'actual' }, { id: 'prohibidas', texto: '💀 TÉCNICAS PROHIBIDAS (la excepción: se aprenden de PERGAMINOS en lugares peligrosos, NO de un Guía): Robo de Esencia, Toque Mortal, Control Mental e Invocación Oscura. Aprenderlas o usarlas tiene consecuencias (Recompensa, miedo de los NPC, Los Coleccionistas tras tus pergaminos en zonas salvajes; en el cofre de tu casa, a salvo). Y la leyenda de Las Puertas del Infierno NO se puede aprender: es solo un rumor que Los Coleccionistas persiguen.', estado: 'actual' }, { id: 'escondites', orgId: 'jade', oculto: true, texto: '🗺 ESCONDITES SECRETOS: cada organización guarda VARIOS escondites por el continente (jaulas, bóvedas, cámaras, refugios) que NO están marcados en el mapa. Descúbrelos por rumores, explorando, siguiendo a un miembro o por notas de otro escondite; derrumba a sus guardias y saquea su botín. Son 11 en total, y los de la organización sin nombre son los más difíciles de encontrar.', estado: 'actual' } ], objetivoIdx: 0, ambienteT: 0, pajaroT: 5 };
    this.estado.roster = npcs; this.refrescarNpcs();
    if (U.Aprendiz) U.Aprendiz.init(); // IDEA 4: Taro, tu aprendiz (se crea su NPC y su guion)
    this.estado.sparring = { fase: 'idle', ventana: null, consumida: null, pareja: [], bando: null, aliado: null, retirados: [], bloqueado: false, dentro: false, ofrecidoCd: 0, golpeT: 0, turno: 0, allyT: 0, centro: null };
    U.Crecimiento.reset();
    if (U.Rival) U.Rival.init(this.estado); // IDEA 1: Ren, el rival (su memoria de duelos)
    U.HUD.mostrar(); U.HUD.refrescarSimbolos(); U.HUD.refrescarChips(); U.Audio.musica('aldea'); U.Ambiente.actualizar();
    U.Criaturas.contratoSangre = []; U.Criaturas.contratoAlma = null; U.Criaturas.aplicarAlmaPasaporte(); // el contrato de alma cruza vidas: si ya existe en el pasaporte, esta vida lo hereda
    if (U.Guardado) setTimeout(() => U.Guardado.guardarAuto(), 400); // la nueva vida queda guardada automáticamente desde el primer momento
    U.HUD.banner('UNA NUEVA VIDA', 2); U.HUD.toast('Bienvenido, ' + nombre + '. Tu elemento es ' + U.Elementos.nombre(j.elemento) + ': concéntrate en él.', 'exito');
    setTimeout(() => U.HUD.toast('🌎 Este mundo NO tiene final ni un camino marcado: es normal llegar y no saber qué hacer, como al llegar a un mundo real. Puedes EMPEZAR por lo que quieras — entrenar un elemento, pelear en la arena, aceptar misiones del tablón, explorar el continente o hablar con la gente — y lo primero que hagas irá abriendo lo demás. Tu objetivo lo eliges TÚ (toca OBJETIVO arriba): dominar los elementos, ganar el torneo, cruzar el portal cuando despierte… Al lograr uno, el juego sigue: eliges otro.', 'aviso'), 5200);
    setTimeout(() => U.HUD.toast('Empiezas en TU CASA, en la Aldea de Bruma: aquí dentro están tu cama y tu cofre. Sal por la puerta del sur cuando quieras ir a la aldea; la Oficina y la Arena están en Bruma, y la METRÓPOLIS te espera en el centro del continente.', 'aviso'), 3400);
    setTimeout(() => U.HUD.toast('Muévete con el joystick o WASD. Mantén A (E) para trotar. Para hablar, leer o descansar, toca directamente al personaje u objeto cuando salga su globo.', ''), 1200);
    setTimeout(() => { if (!j.desdeCero) return; const bas = U.Habilidades.elementos[j.elementoActivo][0]; if ((j.maestria[j.elementoActivo] || 0) < 15) U.HUD.toast('Empiezas con lo básico: el puño y ' + bas.nombre + ' (botón 1, tecla L), nada más. Maestría ' + j.maestria[j.elementoActivo] + '%: golpea con Yin en combate para canalizar hasta el 15%, la maestría mínima para aprender la siguiente técnica de un Guía, por tarea. La maestría sube con curva multiplicativa: lenta desde el principio, y cada tramo cuesta más que el anterior.', 'aviso'); else U.HUD.toast(bas.nombre + ' listo (L). El HUD muestra su costo según la zona.', ''); }, 2600);
  },
  // ---------- mundo de varios mapas conectados por umbrales ----------
  mapaPorId(id) { const E = this.estado; if (id === 'bosque' || id === 'desierto' || id === 'montana') id = 'aldea'; if (!E.mapas[id]) { const rngM = U.TestUI.rngSemilla(E.semilla + '-' + id); E.mapas[id] = (id.indexOf('guarida') === 0 && U.Escondites) ? U.Escondites.crearMapaCueva(id, rngM) : U.Grid.crearMapaPorId(id, rngM); } return E.mapas[id]; },
  refrescarNpcs() { const E = this.estado; if (!E) return; if (E.mapaId === 'oficina') { E.npcs = E.npcsPorMapa.oficina || []; return; } if (E.roster) { E.npcs = E.roster.filter(n => n.mapa === E.mapaId); E.npcsPorMapa.aldea = E.roster.filter(n => n.mapa === 'aldea'); } },
  cambiarMapa(destino, spawn, silencioso) {
    const E = this.estado; if (!E) return;
    // MAPA CONTINUO: bosque, desierto y montaña ya NO son mapas aparte, son regiones del
    // mismo mapa 'aldea'. Una llamada vieja (guardados anteriores, misiones) se traduce a
    // la región correspondiente sumando el offset de esa región; al aire libre ya nadie
    // cambia de mapa caminando: solo quedan como mapas aparte tu casa y la Oficina.
    if (destino === 'bosque' || destino === 'desierto' || destino === 'montana') {
      const OFFM = { bosque: { x: 40, y: 44, e: { x: 68.5, y: 96.5 } }, desierto: { x: 44, y: 244, e: { x: 46.5, y: 265.5 } }, montana: { x: 300, y: 36, e: { x: 327.5, y: 75.5 } } }[destino];
      spawn = spawn ? { x: spawn.x + OFFM.x, y: spawn.y + OFFM.y } : OFFM.e;
      destino = 'aldea';
    }
    if (E.mapaId === destino) { if (spawn) { E.jugador.x = spawn.x; E.jugador.y = spawn.y; } return; }
    if (U.Sparring) U.Sparring.cancelarPorSalida();
    const origenMapa = E.mapaId;
    const nuevo = this.mapaPorId(destino); E.mapa = nuevo; E.mapaId = destino; E.enGuarida = destino.indexOf('guarida') === 0;
    if (!silencioso && E.tiempo > 1) { const crucePueblo = (origenMapa === 'aldea' && (destino === 'desierto' || destino === 'montana')) || ((origenMapa === 'desierto' || origenMapa === 'montana') && destino === 'aldea');
      if (crucePueblo) { const jj = E.jugador; if (U.Economia.permisoVigente()) { jj.permisoUsos = (jj.permisoUsos || 0) + 1; setTimeout(() => U.HUD.toast('Cruce cubierto por tu permiso de viajero.', ''), 60); }
        else if ((jj.monedas || 0) >= 10) { jj.monedas -= 10; setTimeout(() => U.HUD.toast('Viaje a otro pueblo: −10 🪙 por el cruce.', 'aviso'), 60); }
        else setTimeout(() => U.HUD.toast('No traes las 10 🪙 del cruce: el guardia te deja pasar esta vez. Gana monedas con misiones.', 'aviso'), 60); } }
    if (destino === 'oficina' && !E.npcsPorMapa.oficina) { const rngO = U.TestUI.rngSemilla(E.semilla + '-oficina'); E.npcsPorMapa.oficina = ['aldric', 'lia'].map(id => U.Emociones.crear(id, rngO, nuevo.npcs[id])); }
    this.refrescarNpcs();
    const j = E.jugador; const sp = spawn || nuevo.inicio; j.x = sp.x; j.y = sp.y; j.descansando = false; j.cargando = false; j.caminarAgua = false; j.sobreAgua = false; j.cercaAgua = false;
    E.enemigos = []; E.proyectiles = []; E.orbes = []; E.efectos.telegrafos = []; E.interactuable = null; E.zonaActual = null; E.cambioCd = 1.6;
    E.camara.x = j.x * 16 - U.Render.viewW / 2; E.camara.y = j.y * 16 - U.Render.viewH / 2;
    U.Combate.cancelarArena();
    U.Audio.musica(destino === 'bosque' ? 'bosque' : destino === 'desierto' ? 'desierto' : destino === 'montana' ? 'montana' : 'aldea');
    if (destino === 'oficina') { E.flags.visitoOficina = true; if (E.objetivos[8] && E.objetivos[8].estado === 'actual') { /* se completa al pedir mision */ } }
    U.Ambiente.actualizar();
    if (!silencioso) U.HUD.banner(nuevo.nombreMapa.toUpperCase(), 2);
    if (destino === 'bosque') {
      E.flags.visitoBosque = true;
      this.gestionarBandidos();
      if (!silencioso) U.HUD.toast(U.Tiempo.esNoche(U.Tiempo.hora(E)) ? 'Bosque Susurrante de noche: los bandidos ya están entre los árboles.' : 'Bosque Susurrante de día: tranquilo. Los bandidos solo salen de noche (20:00–04:00) y sin campamento.', 'aviso');
      if (E.objetivos[4] && E.objetivos[4].estado !== 'hecho') { E.objetivos[4].estado = 'hecho'; if (E.objetivoIdx === 4) this.siguienteObjetivo(); }
    }
    if (nuevo.spawnsAbiertos) nuevo.spawnsAbiertos.forEach(sp => { E.enemigos.push(U.Combate.crearEnemigo(sp[0], sp[1], sp[2], E.dificultad)); });
  },
  // Seguridad al cargar (o al reaparecer): si el jugador quedó en una celda no
  // transitable (sólida o fuera del mapa), buscar la celda libre más cercana,
  // anillo a anillo; si no hay ninguna cerca, ir al inicio del mapa. Evita quedarse
  // atrapado en una esquina sin poder moverse (el bug de "continuar partida").
  asegurarPosicionValida() {
    const E = this.estado, j = E.jugador, m = E.mapa; if (!E || !j || !m) return;
    if (!isFinite(j.x) || !isFinite(j.y)) { j.x = m.inicio.x; j.y = m.inicio.y; return; }
    const libre = (x, y) => { const cx = Math.floor(x), cy = Math.floor(y); if (cx < 0 || cy < 0 || cx >= m.ancho || cy >= m.alto) return false; return !m.solidos[cy * m.ancho + cx]; };
    if (libre(j.x, j.y)) return;
    const jx = Math.floor(j.x), jy = Math.floor(j.y);
    for (let r = 1; r <= 12; r++) {
      let mejor = null, bd = 1e9;
      for (let cy = jy - r; cy <= jy + r; cy++) for (let cx = jx - r; cx <= jx + r; cx++) {
        if (Math.max(Math.abs(cx - jx), Math.abs(cy - jy)) !== r) continue;
        const px = cx + 0.5, py = cy + 0.5;
        if (libre(px, py)) { const d = Math.hypot(px - j.x, py - j.y); if (d < bd) { bd = d; mejor = { x: px, y: py }; } }
      }
      if (mejor) { j.x = mejor.x; j.y = mejor.y; return; }
    }
    j.x = m.inicio.x; j.y = m.inicio.y;
  },
  // PUENTE DE PIEDRA DE TIERRA: NO es permanente. Cada baldosa que levanta Tierra (el
  // jugador o un NPC de Tierra) dura UN DÍA DEL JUEGO (1440 minutos de juego) y luego el
  // agua se la traga: la baldosa vuelve a ser AGUA (y sólida como agua). Construirla cuesta
  // 5 de Esencia por baldosa, una sola vez por baldosa, al crearla; mientras el puente
  // dure, cualquiera cruza sobre él gratis (es piedra sólida, sin costo por cruzar). El
  // puente de MADERA original del mapa (el de la Ribera) no es de Tierra: no caduca.
  PUENTE_COSTO: 5,
  PUENTE_DURACION: 1440, // minutos de juego = un día completo del juego
  AGUA_CAMINAR_COSTO: 2, // Esencia por segundo que gasta AGUA al caminar sobre el agua (su elemento: poco, pero no gratis; Fuego/Rayo pagan 10/s)
  // Levanta UNA baldosa de puente de piedra sobre una celda de AGUA y la fecha: queda
  // registrada en m.puentesTierra[idx] con su vencimiento (en minutos absolutos de juego).
  // Devuelve true solo si la baldosa se creó ahora (si ya era PUENTE, no se cobra ni se
  // renueva: cruzar sobre un puente ya creado es gratis mientras dure).
  levantarPuente(m, idx) {
    const T = U.Grid.T; if (!m || m.tiles[idx] !== T.AGUA) return false;
    m.tiles[idx] = T.PUENTE; m.solidos[idx] = 0;
    if (!m.puentesTierra) m.puentesTierra = {};
    m.puentesTierra[idx] = U.Tiempo.absoluto(this.estado) + this.PUENTE_DURACION;
    return true;
  },
  // El agua se traga los puentes vencidos: recorre TODOS los mapas conocidos y cada
  // baldosa de puente de Tierra cuyo día ya pasó vuelve a ser AGUA (sólida como agua).
  // Si el vencido está en el mapa actual, se ve la salpicadura y sale un aviso (uno solo
  // por tanda). Quien esté parado sobre la baldosa cuando se hunde queda sobre el agua y
  // le aplican las reglas de siempre de su elemento (tickSuelo / moverNPC).
  actualizarPuentes() {
    const E = this.estado; if (!E || !E.reloj || !E.mapas) return;
    const ahora = U.Tiempo.absoluto(E), T = U.Grid.T; let hundidosAqui = 0;
    for (const id in E.mapas) { const m = E.mapas[id]; if (!m || !m.puentesTierra) continue;
      for (const k in m.puentesTierra) { if (ahora < m.puentesTierra[k]) continue;
        const idx = +k; delete m.puentesTierra[k];
        if (m.tiles[idx] === T.PUENTE) { m.tiles[idx] = T.AGUA; m.solidos[idx] = 1;
          if (m === E.mapa) { hundidosAqui++; if (U.Combate) U.Combate.particulas(idx % m.ancho + 0.5, Math.floor(idx / m.ancho) + 0.5, 5, '#35c6f4', 'agua'); } } } }
    if (hundidosAqui > 0) U.HUD.toast('🌊 El agua se tragó el puente de piedra de Tierra: duró un día del juego y sus baldosas volvieron a ser agua.', 'aviso');
  },
  // DESPLAZAMIENTOS POR ELEMENTO: solo Viento cruza automático (levita hasta ~5 s sobre
  // el agua, sin botón). FUEGO, RAYO, TIERRA y AGUA son distintos: por DEFECTO el agua les
  // BLOQUEA (colisiona como un muro) y solo cruzan si el jugador ACTIVA el botón
  // (interruptor, ver toggleCaminarAgua), que aparece únicamente cerca del agua o ya sobre
  // ella. Fuego/Rayo cruzan CAMINANDO sobre el agua y gastan 10 de Esencia por segundo; si
  // la Esencia se acaba A MITAD DEL AGUA, NO se hunden: el costo pasa a VIDA a la misma tasa
  // (10/s) y siguen caminando (ver tickSuelo); si la Vida llega a 0, derrota normal y
  // despiertan en la fogata. AGUA también camina sobre el agua con el botón, pero le cuesta
  // POQUITO porque es su elemento: 2 de Esencia por segundo; si se acaba, NO pierde Vida
  // (el agua no le hace daño): simplemente SE DETIENE sobre el agua — espera a que la
  // Esencia se regenere o se REGRESA a la orilla. TIERRA, en cambio, LEVANTA PIEDRA al
  // caminar: cada baldosa de puente de piedra cuesta 5 de Esencia (una sola vez por baldosa)
  // y dura UN DÍA DEL JUEGO; si la Esencia se acaba, Tierra NO pierde Vida: simplemente NO
  // AVANZA sobre agua nueva — se queda parado sobre el puente que ya levantó, esperando a
  // recuperar Esencia, y puede REGRESARSE a la orilla cuando quiera (el paso de vuelta a
  // tierra o a puente ya creado nunca exige Esencia ni botón). Desde la ORILLA, con Esencia
  // en 0, NO se puede entrar al agua aunque el botón esté activo: el permiso de abajo exige
  // Esencia suficiente para la siguiente baldosa (Tierra), > 0.5 (Fuego/Rayo) o > 0 (Agua),
  // y solo deja seguir a quien YA está sobre el agua (centro en celda de agua, Fuego/Rayo)
  // o a quien vuelve a tierra (Tierra/Agua).
  // NADAR (solo Fuego/Rayo): si apagas el botón A MITAD DEL AGUA, ya no te hundes a la
  // orilla: NADAS (mitad de velocidad, gratis). Siempre hay una forma de parar el drenaje
  // de Esencia y Vida: apagas y nadas hasta la orilla. El botón sigue siendo necesario para
  // ENTRAR al agua desde la orilla y para cruzarla rápido (caminando gastas Esencia; nadando no).
  moverJugador(m, j, dx, dy) {
    const T = U.Grid.T; const enAgua = (x, y) => { const cx = Math.floor(x), cy = Math.floor(y); return cx >= 0 && cy >= 0 && cx < m.ancho && cy < m.alto && m.tiles[cy * m.ancho + cx] === T.AGUA; };
    // La colisión de Grid.mover usa la CAJA del personaje (radio 0.3), no su centro: el agua hay
    // que detectarla con esa misma caja (centro y esquinas, en la posición actual y en la destino).
    // Antes se miraba solo el centro, y la caja chocaba con el agua sólida 0.3 celdas ANTES de que
    // el centro tocara el agua: el desbloqueo nunca se activaba, nadie podía pisar el agua caminando
    // (ni siquiera el de Agua) y el personaje se quedaba pegado a la orilla empujando sin avanzar.
    const R = 0.3; const cajaAgua = (x, y) => enAgua(x, y) || enAgua(x - R, y - R) || enAgua(x + R, y - R) || enAgua(x - R, y + R) || enAgua(x + R, y + R);
    const destinoAgua = cajaAgua(j.x + dx, j.y + dy) || cajaAgua(j.x, j.y);
    // enAgua(j.x, j.y) = YA estás sobre el agua: con el botón activo puedes seguir caminando
    // aunque la Esencia sea 0 (te cuesta Vida, ver tickSuelo). Sin ese término, al llegar la
    // Esencia a 0 el agua volvería a ser sólida bajo tus pies y te quedarías pegado a mitad
    // del lago sin poder avanzar ni volver. Para Fuego y Rayo TODO pasa por el interruptor
    // j.caminarAgua: apagado = el agua es sólida y bloquea, como antes de cualquier arreglo.
    // TIERRA y AGUA también pasan por el interruptor (ver tierraPuede / aguaPuede abajo).
    const esAuto = j.elementoActivo === 'viento';
    // NADAR: Fuego/Rayo con el botón APAGADO pero YA en el agua pueden moverse por ella
    // (a mitad de velocidad, ver actualizarMundo; gratis, sin Esencia ni Vida). No pueden
    // ENTRAR desde la orilla sin el botón: enAgua(j.x, j.y) es falso en tierra, así que el
    // agua sigue bloqueando la entrada como siempre. Tierra y Agua NO nadan: sin Esencia
    // se DETIENEN sobre el agua y solo pueden regresarse (ver mismaCeldaAgua).
    const nadando = !esAuto && j.elementoActivo !== 'tierra' && j.elementoActivo !== 'agua' && !j.caminarAgua && enAgua(j.x, j.y);
    // Moverse DENTRO de la celda de agua donde ya estás parado no es avanzar: es
    // reacomodarse (y es lo que permite SALIR de esa celda hacia tierra). Sin este
    // permiso, quien se queda sin Esencia parado sobre agua quedaría clavado: el centro
    // seguiría en agua varios pasos antes de cruzar a tierra y cada paso se bloquearía.
    // Entrar a una celda de agua NUEVA sí exige botón + Esencia (ver abajo).
    const destinoCentroAgua = enAgua(j.x + dx, j.y + dy);
    const mismaCeldaAgua = enAgua(j.x, j.y) && destinoCentroAgua && Math.floor(j.x + dx) === Math.floor(j.x) && Math.floor(j.y + dy) === Math.floor(j.y);
    // TIERRA: el agua solo se pisa con el botón ENCENDIDO y Esencia para la siguiente
    // baldosa (5/baldosa). Sin Esencia NO avanza sobre agua nueva: se detiene sobre el
    // puente, SIN perder Vida (a diferencia de Fuego/Rayo). El paso de VUELTA — destino
    // en tierra firme o en puente ya creado — nunca exige Esencia ni botón, así que
    // siempre puede regresarse, también con Esencia en 0 o el botón apagado. Lo mismo
    // vale si quedó varado sobre agua (un puente vencido bajo sus pies): puede salir
    // hacia tierra, pero no avanzar sobre agua nueva sin Esencia.
    const tierraPuede = j.elementoActivo === 'tierra' && (!destinoCentroAgua || mismaCeldaAgua || (!!j.caminarAgua && j.esencia >= this.PUENTE_COSTO));
    // AGUA: también con botón, pero barato porque es su elemento: 2 de Esencia por
    // segundo (ver tickSuelo), no gratis. Sin Esencia NO avanza sobre agua nueva y NO
    // pierde Vida: se detiene, espera a que se regenere o se regresa a la orilla (el
    // paso de vuelta y el reacomodo dentro de su celda nunca exigen Esencia ni botón).
    const aguaPuede = j.elementoActivo === 'agua' && (!destinoCentroAgua || mismaCeldaAgua || (!!j.caminarAgua && j.esencia > 0));
    const puede = (j.elementoActivo === 'viento' && (j.levitT || 0) < 5) || tierraPuede || aguaPuede || (!esAuto && j.elementoActivo !== 'tierra' && j.elementoActivo !== 'agua' && !!j.caminarAgua && (j.esencia > 0.5 || enAgua(j.x, j.y))) || nadando;
    if (!destinoAgua || !puede) { U.Grid.mover(m, j, dx, dy); return; }
    const tocados = [];
    for (let i = 0; i < m.tiles.length; i++) if (m.tiles[i] === T.AGUA && m.solidos[i] === 1) { m.solidos[i] = 0; tocados.push(i); }
    const px = j.x, py = j.y;
    U.Grid.mover(m, j, dx, dy);
    tocados.forEach(i => { if (m.tiles[i] === T.AGUA) m.solidos[i] = 1; });
    // Salir del agua NADANDO: al pisar tierra, centra al jugador en la celda. Si no,
    // queda a 0.01 de la orilla con su caja (radio 0.3) todavía tocando el agua — y como
    // el agua es sólida con el botón apagado, no se puede mover en ninguna dirección
    // (la misma cuña que atrapaba al apagar el botón). Al centrarlo, la caja queda
    // entera dentro de la celda de tierra y se camina normal. (Al salir caminando
    // sobre el agua no hace falta: el botón sigue encendido hasta alejarse de la orilla.)
    if (nadando && !enAgua(j.x, j.y)) { j.x = Math.floor(j.x) + 0.5; j.y = Math.floor(j.y) + 0.5; }
    // Tierra levanta piedra SOLO con el botón ENCENDIDO (la pregunta ya se hizo al
    // chocar con el agua): sin botón, aunque pise agua (varado por un puente vencido),
    // no se levanta nada solo. Cada baldosa nueva cuesta 5 de Esencia, una sola vez.
    if (j.elementoActivo === 'tierra' && j.caminarAgua && enAgua(j.x, j.y)) { const cx = Math.floor(j.x), cy = Math.floor(j.y); const idx = cy * m.ancho + cx; if (m.tiles[idx] === T.AGUA && j.esencia >= this.PUENTE_COSTO && this.levantarPuente(m, idx)) { j.esencia -= this.PUENTE_COSTO; U.Recuperacion.registrarGasto(this.PUENTE_COSTO); U.Combate.particulas(j.x, j.y, 4, '#d9a441', 'polvo'); } }
  },
  // ¿Está NADANDO? Fuego/Rayo, botón APAGADO y centro ya en una celda de agua.
  // Nadar es más lento que caminar sobre el agua (vel ×0.5, ver actualizarMundo) y
  // gratis: sin Esencia ni Vida. Es la salida del drenaje: apagas y nadas a la orilla.
  estaNadando(j) {
    if (!j || j.elementoActivo === 'agua' || j.elementoActivo === 'tierra' || j.elementoActivo === 'viento') return false;
    if (j.caminarAgua) return false;
    const E = this.estado, m = E && E.mapa; if (!m) return false;
    const cx = Math.floor(j.x), cy = Math.floor(j.y);
    return cx >= 0 && cy >= 0 && cx < m.ancho && cy < m.alto && m.tiles[cy * m.ancho + cx] === U.Grid.T.AGUA;
  },
  // CAMINAR SOBRE EL AGUA (Fuego, Rayo y AGUA) / PONER TIERRA SOBRE EL AGUA (Tierra):
  // interruptor como la Sobrecarga, con su estado visible en el propio botón
  // (ENCENDIDO/APAGADO). Por defecto APAGADO: el agua bloquea. El botón solo aparece
  // cerca del agua o ya sobre ella (HUD.actualizar mira j.cercaAgua y j.sobreAgua); al
  // alejarse de la orilla el interruptor se apaga solo (ver tickSuelo), para que cada
  // cruce sea una decisión del jugador y nunca un paso automático como antes.
  // Fuego/Rayo: si lo apagas A MITAD DEL AGUA, NADAS (ver estaNadando): más lento y
  // gratis, hasta la orilla. Nunca te quedas sin forma de parar el drenaje de Esencia
  // y Vida. AGUA: caminar sobre el agua le cuesta 2 de Esencia/s (es su elemento: poco,
  // pero no gratis); sin Esencia se detiene sobre el agua, SIN perder Vida, y puede
  // esperar o regresarse. TIERRA no nada ni pierde Vida: con el botón encendido levanta
  // piedra al caminar (5 de Esencia por baldosa, puente de un día); sin Esencia se
  // detiene sobre el puente y puede regresarse a la orilla.
  toggleCaminarAgua() {
    const E = this.estado, j = E.jugador; if (!E || !j) return;
    if (j.elementoActivo === 'viento') return; // solo el Viento cruza solo, sin botón
    if (j.elementoActivo === 'agua') {
      if (j.caminarAgua) { j.caminarAgua = false; U.Audio.sfx('click');
        if (j.sobreAgua) U.HUD.toast('Caminar sobre el agua APAGADO: te detienes sobre el agua — ya no avanzas, pero puedes regresarte a la orilla cuando quieras. Vuelve a encenderlo para seguir cruzando.', 'aviso');
        else U.HUD.toast('Caminar sobre el agua APAGADO: el agua vuelve a bloquearte el paso.', '');
        return; }
      j.caminarAgua = true; U.Audio.sfx('agua');
      if (j.esencia <= 0) U.HUD.toast('Caminar sobre el agua ENCENDIDO, pero no tienes Esencia: recupera Esencia primero para poder entrar al agua.', 'aviso');
      else U.HUD.toast('¿Quieres caminar sobre el agua? ENCENDIDO: cruzas gastando solo 2 de Esencia por segundo, porque el agua es tu elemento. Si se acaba, te detienes sobre el agua sin perder Vida: espera a que se regenere o regrésate a la orilla.', 'exito');
      return; }
    if (j.elementoActivo === 'tierra') {
      if (j.caminarAgua) { j.caminarAgua = false; U.Audio.sfx('click');
        U.HUD.toast('Poner tierra sobre el agua APAGADO: el agua vuelve a bloquearte el paso. El puente de piedra que ya levantaste sigue ahí hasta que se cumpla su día.', '');
        return; }
      j.caminarAgua = true; U.Audio.sfx('tierra');
      if (j.esencia < this.PUENTE_COSTO) U.HUD.toast('Poner tierra sobre el agua ENCENDIDO, pero tienes menos de 5 de Esencia: recupera Esencia primero para levantar la primera baldosa de piedra.', 'aviso');
      else U.HUD.toast('¿Quieres poner tierra sobre el agua? ENCENDIDO: al caminar irás levantando piedra, 5 de Esencia por baldosa, y el puente dura un día del juego. Sin Esencia no avanzas: te quedas sobre el puente, sin perder Vida, y puedes regresarte a la orilla.', 'exito');
      return; }
    if (j.caminarAgua) { j.caminarAgua = false; U.Audio.sfx('click');
      if (j.sobreAgua) { U.HUD.toast('Caminar sobre el agua APAGADO: ahora NADAS (más lento, sin gastar Esencia ni Vida). Nada hasta la orilla.', 'aviso'); }
      else U.HUD.toast('Caminar sobre el agua APAGADO: el agua vuelve a bloquearte el paso.', '');
      return; }
    j.caminarAgua = true; U.Audio.sfx('agua');
    if (j.esencia <= 0.5) U.HUD.toast('Caminar sobre el agua ENCENDIDO, pero sin Esencia NO puedes entrar desde la orilla: recupera Esencia primero. (Ya sobre el agua, sin Esencia, el costo pasaría a tu Vida.)', 'aviso');
    else U.HUD.toast('Caminar sobre el agua ENCENDIDO: cruzas gastando 10 de Esencia por segundo; si se acaba a mitad del agua, 10 de Vida por segundo. Apágalo cuando quieras con el mismo botón.', 'exito');
  },
  // Hundirse: vuelves a la orilla más cercana. (Ya no se usa al apagar el botón: ahora
  // se nada. Queda como red de seguridad por si algún día hace falta devolver a
  // alguien a tierra firme.) ultimaOrilla es la última posición en tierra
  // firme que pisaste; si no sirve (no existe o su celda ya no es tierra), se busca la celda
  // de tierra libre más cercana alrededor, anillo a anillo.
  hundirAgua() {
    const E = this.estado, j = E.jugador, m = E.mapa; const T = U.Grid.T;
    const esAgua = (x, y) => { const cx = Math.floor(x), cy = Math.floor(y); return cx >= 0 && cy >= 0 && cx < m.ancho && cy < m.alto && m.tiles[cy * m.ancho + cx] === T.AGUA; };
    const libre = (x, y) => { const cx = Math.floor(x), cy = Math.floor(y); return cx >= 0 && cy >= 0 && cx < m.ancho && cy < m.alto && !esAgua(x, y) && !m.solidos[cy * m.ancho + cx]; };
    if (j.ultimaOrilla && libre(j.ultimaOrilla.x, j.ultimaOrilla.y)) { j.x = j.ultimaOrilla.x; j.y = j.ultimaOrilla.y; }
    else {
      let mejor = null, bd = 1e9;
      const jx = Math.floor(j.x), jy = Math.floor(j.y);
      for (let r = 1; r <= 8 && !mejor; r++) {
        for (let cy = jy - r; cy <= jy + r; cy++) {
          for (let cx = jx - r; cx <= jx + r; cx++) {
            if (Math.max(Math.abs(cx - jx), Math.abs(cy - jy)) !== r) continue;
            const px = cx + 0.5, py = cy + 0.5;
            if (libre(px, py)) { const d = Math.hypot(px - j.x, py - j.y); if (d < bd) { bd = d; mejor = { x: px, y: py }; } }
          }
        }
      }
      if (mejor) { j.x = mejor.x; j.y = mejor.y; }
    }
    j.sobreAgua = false; j.levitT = 0; U.Combate.particulas(j.x, j.y - 0.4, 10, '#35c6f4', 'agua'); U.Audio.sfx('agua');
  },
  // Efectos del suelo al caminar: agua (drenaje de Esencia y, sin Esencia a mitad del agua, de Vida a la misma tasa), ceniza (quema si no eres Fuego), polainas (pasos y Condición).
  tickSuelo(dt, seMovio, distCel) {
    const E = this.estado, j = E.jugador, m = E.mapa; const T = U.Grid.T;
    const cx = Math.max(0, Math.min(m.ancho - 1, Math.floor(j.x))), cy = Math.max(0, Math.min(m.alto - 1, Math.floor(j.y)));
    const tile = m.tiles[cy * m.ancho + cx];
    j.sobreAgua = tile === T.AGUA;
    // ¿Hay agua cerca? (celdas de agua a ~2 celdas o menos) Decide si el botón «Caminar sobre
    // el agua» se muestra: cerca de la orilla, chocando con el agua o ya sobre ella.
    { let cerca = j.sobreAgua;
      if (!cerca) { const px = Math.floor(j.x), py = Math.floor(j.y);
        for (let yy = py - 2; yy <= py + 2 && !cerca; yy++) for (let xx = px - 2; xx <= px + 2; xx++) { if (xx < 0 || yy < 0 || xx >= m.ancho || yy >= m.alto) continue; if (m.tiles[yy * m.ancho + xx] === T.AGUA && Math.hypot(xx + 0.5 - j.x, yy + 0.5 - j.y) <= 2.1) { cerca = true; break; } } }
      j.cercaAgua = cerca; }
    if (tile !== T.AGUA) { j.ultimaOrilla = { x: j.x, y: j.y }; j.levitT = 0; if (!j.cercaAgua) j.caminarAgua = false; }
    // Fuego/Rayo sobre el agua SIN el interruptor (p. ej. cambiaron de elemento a mitad del
    // agua, o lo apagaron): ya NO se hunden — NADAN (ver estaNadando): se mueven por el
    // agua a mitad de velocidad, sin gastar Esencia ni Vida. El drenaje de abajo solo
    // corre con el botón ENCENDIDO (caminar sobre el agua cuesta; nadar es gratis).
    if (tile === T.AGUA) {
      if (j.elementoActivo === 'viento') { j.levitT = (j.levitT || 0) + dt; if (j.levitT >= 5 && j.ultimaOrilla) { j.x = j.ultimaOrilla.x; j.y = j.ultimaOrilla.y; j.levitT = 0; U.HUD.toast('La levitación se acaba: bajas a la orilla. El Viento levita unos 5 segundos, no vuela el mapa entero.', 'aviso'); } }
      else if (j.elementoActivo === 'agua' && j.caminarAgua) {
        // AGUA camina sobre el agua con el botón: 2 de Esencia/s, porque es su elemento.
        // Sin Esencia NO pasa a Vida (el agua no le hace daño): simplemente se DETIENE
        // sobre el agua — el aviso sale una sola vez, al cruzar a 0 — y ahí espera a que
        // la Esencia se regenere o se regresa a la orilla (ver moverJugador: el paso de
        // vuelta nunca exige Esencia). Con el botón apagado no hay drenaje: parado sobre
        // el agua, solo puede regresarse o volver a encenderlo.
        if (j.esencia > 0) {
          j.esencia = Math.max(0, j.esencia - this.AGUA_CAMINAR_COSTO * dt); U.Recuperacion.registrarGasto(this.AGUA_CAMINAR_COSTO * dt);
          if (j.esencia <= 0.01) { j.esencia = 0; j.agotado = true; U.HUD.toast('Sin Esencia sobre el agua: te detienes — el agua es tu elemento y no te hace daño, así que no pierdes Vida. Espera a que se regenere o regrésate a la orilla.', 'peligro'); U.Audio.sfx('agua'); }
        }
      }
      else if (j.elementoActivo !== 'agua' && j.elementoActivo !== 'tierra' && j.caminarAgua) {
        if (j.esencia > 0) { // Fase Esencia: caminar sobre el agua cuesta 10 de Esencia por segundo.
          j.esencia = Math.max(0, j.esencia - 10 * dt); U.Recuperacion.registrarGasto(10 * dt);
          if (j.esencia <= 0.01) { j.esencia = 0; j.agotado = true; U.HUD.toast('Sin Esencia sobre el agua: NO te hundes — sigues caminando, pero ahora te cuesta VIDA (10/s, la misma tasa). Llega a la orilla o toma un tónico; si tu Vida llega a 0, despiertas en la fogata.', 'peligro'); U.Audio.sfx('agua'); }
        } else { // Fase Vida: MISMA tasa (10/s), otra fuente. Sin teletransporte: sigues sobre el agua.
          j.vida -= 10 * dt;
          if (Math.random() < dt * 6) U.Combate.particulas(j.x, j.y - 0.4, 1, '#ff5470', 'brasa');
          if (j.vida <= 0) { j.vida = 0; this.fin('derrota'); return; }
        }
      }
    }
    // TIERRA sin Esencia sobre su propio puente: NO pierde Vida (a diferencia de
    // Fuego/Rayo, que pasan a Vida). Solo se detiene: un aviso cada 5 s le recuerda
    // que puede esperar a recuperar Esencia o regresarse a la orilla. El aviso solo
    // sale sobre un puente DE TIERRA (puentesTierra) o varado sobre agua, no sobre el
    // puente de madera del mapa.
    if (j.elementoActivo === 'tierra' && j.caminarAgua && j.esencia < this.PUENTE_COSTO) {
      const idxA = cy * m.ancho + cx;
      const enPuenteTierra = tile === T.PUENTE && m.puentesTierra && m.puentesTierra[idxA] != null;
      if (tile === T.AGUA || enPuenteTierra) {
        j.avisoPuenteCd = (j.avisoPuenteCd || 0) - dt;
        if (j.avisoPuenteCd <= 0) { j.avisoPuenteCd = 5; U.HUD.toast('Sin Esencia para levantar tierra (5 por baldosa): no avanzas sobre el agua. No pierdes Vida: espera a recuperar Esencia o regrésate a la orilla.', 'aviso'); }
      }
    }
    if (tile === T.CENIZA && j.elementoActivo !== 'fuego') { j.vida = Math.max(0, j.vida - 3 * dt); if (Math.random() < dt * 2) U.Combate.particulas(j.x, j.y - 0.4, 1, '#ff7a2f', 'brasa'); if (j.vida <= 0) { j.vida = 0; this.fin('derrota'); return; } }
    // POLAINAS: caminar cuenta por pasos (celdas). El dash NUNCA cuenta como entrenamiento.
    if (seMovio && j.dash.t <= 0 && distCel > 0) {
      if (j.polainaEquipada) { const pd = U.Economia.POLAINAS[j.polainaEquipada]; if (!pd) return;
        j.pasosPolainas = (j.pasosPolainas || 0) + distCel;
        j.condPolainas = (j.condPolainas || 0) + distCel;
        while (j.pasosPolainas >= pd.pasosPunto) { j.pasosPolainas -= pd.pasosPunto; if (j.stats.velocidad < 3000) { j.stats.velocidad = Math.min(3000, j.stats.velocidad + 1); U.Combate.texto(j, 'VELOCIDAD +1 · PASOS CON POLAINAS', '#7ef0c0', 1); U.Audio.sfx('unlock'); } }
        while (j.condPolainas >= pd.condCada) { j.condPolainas -= pd.condCada; j.cansancio = Math.max(0, (j.cansancio != null ? j.cansancio : U.Recuperacion.condicionMax(j)) - 1); }
      }
    }
  },
  tocarObelisco() {
    const E = this.estado, j = E.jugador;
    if (!E.flags.hechizoInversion) { E.flags.hechizoInversion = true; U.HUD.banner('🌀 ¡HECHIZO DE INVERSIÓN APRENDIDO! · TECLA V', 2.4); U.Audio.sfx('unlock'); U.Combate.particulas(j.x, j.y - 1, 26, '#e05bd0', 'chispa'); U.Dialogo.mostrarTexto('OBELISCO DE LA INVERSIÓN', 'El obelisco vibra y el mundo se da la vuelta un instante… y vuelve. Ya conoces el Hechizo de Inversión: con la tecla V (12 de Esencia) los enemigos cercanos se mueven con un mapeo de direcciones ALEATORIO durante 6 segundos. Los Ilusionistas te lo lanzan a ti: si te alcanza, TU movimiento se remapea al azar unos segundos — ninguna de las 8 direcciones queda igual — y el mapeo NO se muestra en pantalla: presiona una dirección, mira hacia dónde vas y adáptate. Dura poco: es desorientación breve, no un castigo.'); return; }
    U.Dialogo.mostrarTexto('OBELISCO DE LA INVERSIÓN', 'Ya conoces el hechizo (tecla V, 12 de Esencia). El obelisco sigue zumbando, paciente, como si esperara a otro viajero.');
  },
  // BANDIDOS SOLO DE NOCHE y SIN CAMPAMENTO: aparecen al caer la Noche en el bosque (una vez por noche) y se retiran al amanecer.
  gestionarBandidos() {
    const E = this.estado; if (!E || E.mapaId !== 'aldea') return;
    // En el mapa continuo el bosque es una REGIÓN (noroeste): los bandidos salen de noche
    // cuando estás en ella y se retiran al amanecer, igual que antes.
    const jB = E.jugador; const enBosque = jB.x < 78 && jB.y < 60;
    if (enBosque) { E.flags.visitoBosque = true; if (E.objetivos[4] && E.objetivos[4].estado !== 'hecho') { E.objetivos[4].estado = 'hecho'; if (E.objetivoIdx === 4) this.siguienteObjetivo(); } }
    if (!enBosque) { const r0 = E.reloj; if (r0 && !U.Tiempo.esNoche(r0.minutos / 60) && E.enemigos.some(e => e.nocturno && e.vida > 0)) E.enemigos = E.enemigos.filter(e => !e.nocturno); return; }
    const r = E.reloj; const h = r.minutos / 60; const noche = U.Tiempo.esNoche(h);
    const clave = h >= 21 ? r.dia : (h < 5 ? r.dia - 1 : null);
    if (noche && clave != null && E.flags.nocheBandidos !== clave) {
      if (!U.Combate.vivos().some(e => e.nocturno)) { E.flags.nocheBandidos = clave; (E.mapa.spawnsBandidos || []).forEach((p, i) => { const e = U.Combate.crearEnemigo(i % 3 === 2 ? 'chaman' : 'bandido', p[0], p[1], E.dificultad * 0.95); e.nocturno = true; E.enemigos.push(e); }); U.HUD.banner('🌙 NOCHE · LOS BANDIDOS SALEN EN EL BOSQUE', 2); U.Audio.sfx('oleada'); }
    } else if (!noche && E.enemigos.some(e => e.nocturno && e.vida > 0)) { E.enemigos = E.enemigos.filter(e => !e.nocturno); }
  },
  // ENTRENAMIENTO CON LOS GUÍAS: Kaelen (esquiva) · Torin (golpes Yin) · Sora (meditación)
  iniciarEntreno(guia) {
    const E = this.estado; if (!E || E.entreno) return;
    const defs = { kaelen: { tipo: 'esquiva', meta: 3, nombre: 'Entreno de Kaelen · 3 dashes', recompensa: 'defensa' }, torin: { tipo: 'golpes', meta: 5, nombre: 'Entreno de Torin · 5 golpes Yin que conecten', recompensa: 'ataque' }, sora: { tipo: 'meditacion', meta: 8, nombre: 'Entreno de Sora · medita 8 s (tecla R)', recompensa: 'mente' } };
    const d = defs[guia] || defs.torin;
    if ((E.jugador.monedas || 0) >= 5) { E.jugador.monedas -= 5; U.HUD.toast('Encargo del Guía: pagas 5 🪙 de tu bolsillo (materiales y comida del entreno). La recompensa es entrenamiento, no dinero.', 'aviso'); }
    E.entreno = { guia, tipo: d.tipo, meta: d.meta, prog: 0, nombre: d.nombre, recompensa: d.recompensa };
    U.HUD.banner('🎯 ' + d.nombre.toUpperCase(), 1.8); U.Audio.sfx('unlock');
  },
  progresoEntreno(tipo, n) {
    const E = this.estado; if (!E || !E.entreno || E.entreno.tipo !== tipo) return;
    E.entreno.prog += n;
    if (E.entreno.prog >= E.entreno.meta) { const en = E.entreno; E.entreno = null; E.historial.entrenos++; U.Crecimiento.stat(en.recompensa, 0.5, 1); if (en.tipo === 'meditacion') U.Crecimiento.estilo('yang', 0.6, 1); U.HUD.banner('🎯 ¡ENTRENAMIENTO COMPLETO! · ' + U.Estadisticas.etiquetas[en.recompensa].toUpperCase() + ' +', 2); U.Audio.sfx('unlock'); const npc = E.npcs.find(x => x.id === en.guia); if (npc) { if (!npc.hechos) npc.hechos = []; npc.hechos.push('completaste su entrenamiento de guía'); U.Emociones.evento(npc, { realidad: 80, energia: 10, etiqueta: 'entreno completo' }); } }
  },
  // ---------- MISIONES DEL TABLÓN: 5 al día, aleatorias, por RANGO ----------
  aceptarMision(uid) {
    const E = this.estado; if (!E) return 'No hay oficina sin mundo.';
    if (E.mision && E.mision.activa && !E.mision.completada) return 'Ya tienes una misión activa: «' + E.mision.desc + '» (' + Math.floor(E.mision.prog) + '/' + E.mision.meta + '). Cúmplela y vuelve a cobrar, o déjala caducar al final del día.';
    if (E.mision && E.mision.completada) return 'Esa misión ya está cumplida y sin cobrar: entrégala primero con la opción de entregar.';
    const lista = U.Economia.asegurarTablon(); const def = lista.find(m => m.uid === uid) || lista[0]; if (!def) return 'El tablón está vacío hoy.';
    const j = E.jugador;
    if (!U.Economia.desbloqueada(def.rango, j)) return 'Rango ' + def.rango + ' bloqueado: necesitas ' + U.Economia.DESBLOQUEO[def.rango] + '% de maestría de tu elemento principal (' + U.Elementos.nombre(j.elemento) + ': llevas ' + Math.floor(j.maestria[j.elemento] || 0) + '%). El rango se desbloquea con maestría, no con dinero.';
    E.mision = { uid: def.uid, tipo: def.tipo, rango: def.rango, elemento: def.elemento, razon: def.razon, nombre: def.desc, desc: def.desc, pago: def.pago, destino: def.destino, prog: 0, meta: 1, activa: true, completada: false, dia: E.reloj.dia, inicioMin: E.reloj.minutos + (E.reloj.dia - 1) * 1440, spawned: false };
    const M = E.mision;
    if (def.tipo === 'cazar') M.meta = 1;
    if (def.tipo === 'investigar') M.meta = 3;
    if (def.tipo === 'rescatar') M.meta = 2;
    if (def.tipo === 'escolta') M.meta = 1;
    if (def.tipo === 'recoger' || def.tipo === 'perdido') { const md = this.mapaPorId(def.destino.mapa); const tipoObj = def.tipo === 'recoger' ? 'encargo' : 'perdido'; if (!md.objetos.some(o => o.tipo === tipoObj)) md.objetos.push({ tipo: tipoObj, x: Math.floor(def.destino.x), y: Math.floor(def.destino.y), w: 1, h: 1, solido: false }); }
    if (def.tipo === 'investigar') { const md = this.mapaPorId(def.destino.mapa); for (let i = 0; i < 3; i++) { if (!md.objetos.some(o => o.tipo === 'pista' && o.n === i)) md.objetos.push({ tipo: 'pista', n: i, x: Math.max(1, Math.floor(def.destino.x) + (i - 1) * 3), y: Math.max(1, Math.floor(def.destino.y) + (i % 2) * 2), w: 1, h: 1, solido: false }); } }
    if (def.tipo === 'rescatar') { const md = this.mapaPorId(def.destino.mapa); if (!md.objetos.some(o => o.tipo === 'cautivo')) md.objetos.push({ tipo: 'cautivo', x: Math.floor(def.destino.x), y: Math.floor(def.destino.y), w: 1, h: 1, solido: false }); }
    if (def.tipo === 'escolta') this.iniciarEscolta();
    U.HUD.banner('📜 MISIÓN ACEPTADA · RANGO ' + def.rango, 2); U.Audio.sfx('unlock');
    if (E.objetivos[8] && E.objetivos[8].estado !== 'hecho') { E.objetivos[8].estado = 'hecho'; if (E.objetivoIdx === 8) this.siguienteObjetivo(); }
    return 'Misión registrada: «' + def.desc + '» · Rango ' + def.rango + ' · Especialista en: ' + U.Elementos.nombre(def.elemento) + ' (' + def.razon + ') · Paga ' + def.pago + ' 🪙 al entregarla aquí. El pago es por el rango, nunca por el elemento.';
  },
  entregarMision() {
    const E = this.estado; if (!E || !E.mision || !E.mision.activa) return 'No tienes ninguna misión por entregar. Pide una en el tablón primero.';
    if (!E.mision.completada) return 'Aún no está cumplida: «' + E.mision.desc + '» va ' + Math.floor(E.mision.prog) + '/' + E.mision.meta + '.';
    let r = E.mision.pago;
    if (E.mision.tipo === 'mensaje') { const ahora = E.reloj.minutos + (E.reloj.dia - 1) * 1440; if (ahora - E.mision.inicioMin > 180) r = Math.floor(r / 2); }
    E.jugador.monedas = (E.jugador.monedas || 0) + r; E.historial.misiones = (E.historial.misiones || 0) + 1;
    U.Economia.karmaAdd(2, 'aldea'); // hacer una misión que ayuda: +2 de karma en este pueblo
    const rangoC = E.mision.rango; E.mision = null;
    U.HUD.banner('✅ MISIÓN ENTREGADA · RANGO ' + rangoC + ' · +' + r + ' 🪙', 2.2); U.Audio.sfx('victoria');
    return 'Perfecto, queda asentado en el libro. Cobras ' + r + ' monedas (rango ' + rangoC + '). Bolsa: ' + Math.floor(E.jugador.monedas) + ' 🪙. Tu karma en la Aldea de Bruma sube +2 por ayudar. El tablón de hoy sigue en el tablón: pide otra si quieres.';
  },
  progresoMision(tipo, n) {
    const E = this.estado; if (!E || !E.mision || !E.mision.activa || E.mision.completada) return;
    if (E.mision.tipo !== tipo) return;
    E.mision.prog += n;
    if (E.mision.prog >= E.mision.meta) { E.mision.completada = true; U.HUD.banner('📜 ¡MISIÓN CUMPLIDA! · VUELVE CON LÍA A COBRAR ' + E.mision.pago + ' 🪙', 2.4); U.Audio.sfx('unlock'); }
  },
  // ---------- ESCOLTA: el NPC CAMINA a su pueblo; los bandidos salen en oleadas ----------
  iniciarEscolta() {
    const E = this.estado; if (!E || !E.mision) return;
    const npc = (E.roster || []).find(n => n.id === 'elena') || (E.roster || [])[0]; if (!npc) return;
    npc.enEscolta = true; npc.vidaEscolta = 100; npc.mapa = 'aldea'; npc.enCasa = false; npc.x = E.jugador.x + 1.5; npc.y = E.jugador.y + 0.5; npc.ruta = []; npc.rutaKey = '';
    E.escolta = { activa: true, npc, destino: { x: 344.5, y: 196.5 }, oleadaT: 10, bandidosTotal: 5, bandidosFuera: 0, nombre: npc.nombre };
    if (E.mapaId !== 'aldea') U.HUD.toast('La escolta empieza en la Aldea de Bruma: ' + npc.nombre + ' te espera junto a la plaza para caminar a su pueblo (la entrada este).', 'aviso');
    else U.HUD.toast(npc.nombre + ' camina hacia Puerto Brisa Azul por el camino del este, cruzando el puente del Río del Este. No te alejes: si sale un bandido, se pondrá detrás de ti y tú peleas.', 'exito');
    this.refrescarNpcs();
  },
  tickEscolta(dt) {
    const E = this.estado, esc = E.escolta; if (!esc || !esc.activa || E.mapaId !== 'aldea') return;
    const npc = esc.npc, j = E.jugador; if (!npc || npc.mapa !== 'aldea') return;
    const bandidos = E.enemigos.filter(e => e.vida > 0 && e.esEscolta);
    let destino = esc.destino, vel = 1.7;
    if (bandidos.length) { destino = { x: j.x - j.dir.x * 1.4, y: j.y - j.dir.y * 1.4 }; vel = 2.6; } // con peligro, se pone DETRÁS de ti
    else if (U.Grid.dist(npc, j) > 7) { npc.moviendo = false; return; } // te espera si te alejas
    const dx = destino.x - npc.x, dy = destino.y - npc.y, d = Math.hypot(dx, dy);
    if (d > 0.4) { npc.dir = U.Grid.dir8(dx, dy); U.Vida.moverNPC(npc, E.mapa, dx / d * vel * dt, dy / d * vel * dt); npc.moviendo = true; npc.anim += dt * 1.6; } else npc.moviendo = false;
    if (!bandidos.length && U.Grid.dist(npc, esc.destino) < 1.4) { esc.activa = false; npc.enEscolta = false; this.progresoMision('escolta', 1); U.HUD.banner('🏡 ' + npc.nombre.toUpperCase() + ' LLEGÓ A SU PUEBLO · ESCOLTA CUMPLIDA', 2.4); return; }
    esc.oleadaT -= dt;
    if (esc.oleadaT <= 0 && !bandidos.length && esc.bandidosFuera + bandidos.length < esc.bandidosTotal) {
      esc.oleadaT = 16 + Math.random() * 8;
      const n = Math.min(esc.bandidosTotal - esc.bandidosFuera, Math.random() < 0.5 ? 1 : 2);
      for (let i = 0; i < n; i++) { const e = U.Combate.crearEnemigo('bandido', Math.min(E.mapa.ancho - 2, npc.x + 5 + i * 1.6), Math.max(2, npc.y + (i ? 2 : -2)), E.dificultad); e.esEscolta = true; E.enemigos.push(e); }
      U.HUD.banner('⚠ ¡BANDIDOS EN EL CAMINO! · ' + npc.nombre.toUpperCase() + ' SE PONE DETRÁS DE TI', 2); U.Audio.sfx('oleada');
    }
  },
  escoltaDanada(npc, dmg) {
    const E = this.estado, esc = E.escolta; if (!esc || !esc.activa) return;
    npc.vidaEscolta = (npc.vidaEscolta != null ? npc.vidaEscolta : 100) - dmg;
    U.Combate.texto(npc, '-' + Math.round(dmg), '#ff5470', 1);
    if (npc.vidaEscolta <= 0) { esc.activa = false; npc.enEscolta = false; npc.vidaEscolta = 100; if (E.mision && E.mision.tipo === 'escolta') E.mision = null; E.enemigos = E.enemigos.filter(e => !e.esEscolta); U.HUD.banner('📜 ESCOLTA FALLIDA · ' + npc.nombre.toUpperCase() + ' CAYÓ EN EL CAMINO', 2.6); U.Audio.sfx('derrota'); U.HUD.toast(npc.nombre + ' se recupera en la aldea, pero la misión de escolta falló. Pide otra en el tablón.', 'peligro'); }
    else if (Math.random() < 0.4) U.HUD.toast('¡Protege a ' + npc.nombre + '! Vida de la escolta: ' + Math.ceil(npc.vidaEscolta) + '%', 'peligro');
  },
  chequearMision(dt) {
    const E = this.estado; if (!E || !E.mision || !E.mision.activa || E.mision.completada) return;
    const j = E.jugador, M = E.mision, D = M.destino; if (!D) return;
    const cercaDestino = E.mapaId === D.mapa && Math.hypot(j.x - D.x, j.y - D.y) < 3;
    if (M.tipo === 'entrega' || M.tipo === 'mensaje') { if (cercaDestino) this.progresoMision(M.tipo, 1); return; }
    if (M.tipo === 'recoger' || M.tipo === 'perdido') { if (E.mapaId === D.mapa) { const md = E.mapa; const tipoObj = M.tipo === 'recoger' ? 'encargo' : 'perdido'; const ri = md.objetos.findIndex(o => o.tipo === tipoObj); if (ri >= 0 && Math.hypot(j.x - (md.objetos[ri].x + 0.5), j.y - (md.objetos[ri].y + 0.5)) < 1.5) { md.objetos.splice(ri, 1); U.Combate.particulas(j.x, j.y - 1, 18, '#ffe14d', 'chispa'); U.HUD.toast(M.tipo === 'recoger' ? '¡Encargo recogido! Vuelve con Lía a entregarlo.' : '¡Lo encontraste! Estaba en ' + D.lugar + '. Vuelve con Lía.', 'exito'); this.progresoMision(M.tipo, 1); } } return; }
    if (M.tipo === 'cazar' && !M.spawned && E.mapaId === D.mapa) { M.spawned = true; const e = U.Combate.crearEnemigo(Math.random() < 0.5 ? 'veterano' : 'brasa', D.x + 2, D.y + 1, E.dificultad * 1.1); e.nombre = 'Bestia del camino'; e.esBestia = true; E.enemigos.push(e); U.HUD.banner('🐾 ¡LA BESTIA APARECE! · ' + D.lugar.toUpperCase(), 2); U.Audio.sfx('oleada'); return; }
    if (M.tipo === 'investigar' && E.mapaId === D.mapa) { const md = E.mapa; for (let i = md.objetos.length - 1; i >= 0; i--) { const o = md.objetos[i]; if (o.tipo === 'pista' && Math.hypot(j.x - (o.x + 0.5), j.y - (o.y + 0.5)) < 1.5) { md.objetos.splice(i, 1); U.Combate.particulas(j.x, j.y - 1, 12, '#7cc4ff', 'chispa'); U.HUD.toast('Pista encontrada (' + (Math.floor(M.prog) + 1) + '/3): huellas y cosas revueltas. Alguien merodea por aquí de noche.', 'exito'); this.progresoMision('investigar', 1); } } return; }
    if (M.tipo === 'rescatar' && E.mapaId === D.mapa) { if (!M.spawned) { M.spawned = true; for (let i = 0; i < 2; i++) { const e = U.Combate.crearEnemigo('bandido', D.x + 1.5 + i * 1.6, D.y + 1, E.dificultad); e.esRescate = true; E.enemigos.push(e); } U.HUD.banner('⚠ ¡BANDIDOS GUARDAN AL CAUTIVO! · ' + D.lugar.toUpperCase(), 2); U.Audio.sfx('oleada'); }
      if (M.spawned && M.prog >= M.meta) { const md = E.mapa; const ci = md.objetos.findIndex(o => o.tipo === 'cautivo'); if (ci >= 0 && Math.hypot(j.x - (md.objetos[ci].x + 0.5), j.y - (md.objetos[ci].y + 0.5)) < 1.6) { md.objetos.splice(ci, 1); U.HUD.toast('¡Cautivo liberado! Te lo agradece entre lágrimas. Vuelve con Lía.', 'exito'); M.completada = true; U.HUD.banner('📜 ¡MISIÓN CUMPLIDA! · VUELVE CON LÍA A COBRAR ' + M.pago + ' 🪙', 2.4); U.Audio.sfx('unlock'); } } return; }
  },
  // Cambio de día: tablón nuevo, misiones sin cumplir caducan, comida del día se reinicia, promesas vencidas castigan el karma.
  chequearDia() {
    const E = this.estado; if (!E || !E.reloj) return;
    if (E.ultimoDia === E.reloj.dia) return;
    E.ultimoDia = E.reloj.dia; const j = E.jugador; j.comidasHoy = 0;
    (E.roster || E.npcs || []).forEach(n => { if (n.esenciaPuente != null) n.esenciaPuente = 100; }); // la reserva de Esencia para puentes de los NPC de Tierra se rellena con el día nuevo
    if (E.mision && E.mision.activa && !E.mision.completada) { if (E.escolta && E.escolta.activa) { E.escolta.activa = false; if (E.escolta.npc) E.escolta.npc.enEscolta = false; E.escolta = null; } E.mision = null; U.HUD.toast('La misión de ayer caducó sin cumplirse. El tablón trae 5 misiones nuevas.', 'aviso'); }
    if (j.promesas && j.promesas.length) { const vencidas = j.promesas.filter(pr => E.reloj.dia > pr.diaLimite); if (vencidas.length) { j.promesas = j.promesas.filter(pr => E.reloj.dia <= pr.diaLimite); vencidas.forEach(() => { U.Economia.karmaAdd(-5); }); U.HUD.toast('Prometiste dinero y no lo diste: karma −5 por cada promesa rota.', 'peligro'); } }
    E.tablon = { dia: E.reloj.dia, lista: U.Economia.generarTablon(E.rng || Math.random) };
  },
  // Los NPC TE BUSCAN: de vez en cuando uno camina hasta ti para pedirte dinero o un sabor de comida.
  tickPeticiones(dt) {
    const E = this.estado; if (!E || E.ui !== 'mundo' || (E.reloj && E.reloj.durmiendo)) return;
    if (E.peticion) { const n = E.peticion.npc; if (!n || n.mapa !== E.mapaId || n.enCasa) { E.peticion = null; return; } if (U.Grid.dist(n, E.jugador) < 1.7) { const pet = E.peticion; E.peticion = null; n.buscaJugador = false; U.Dialogo.abrirPeticion(n, pet); } return; }
    E.peticionT = (E.peticionT || 60) - dt; if (E.peticionT > 0) return; E.peticionT = 80 + Math.random() * 60;
    const h = U.Tiempo.hora(E); if (h < 6 || h > 20) return;
    const cands = E.npcs.filter(n => !n.enCasa && !n.enEscolta && !n.ocultoSparring && n.id !== 'pipo' && ['nami', 'orin', 'zara', 'varek'].indexOf(n.id) < 0);
    if (!cands.length) return;
    const n = cands[Math.floor(Math.random() * cands.length)];
    const esComida = Math.random() < 0.45;
    E.peticion = { npc: n, tipo: esComida ? 'comida' : 'dinero', cantidad: 6 + Math.floor(Math.random() * 20), sabor: U.Economia.SABORES[Math.floor(Math.random() * 5)] };
    n.buscaJugador = true;
    U.HUD.toast(n.nombre + ' viene hacia ti: parece que quiere pedirte algo.', '');
  },
  // DISEÑO ABIERTO: ya no hay "siguiente objetivo". Cumplir uno no empuja al jugador
  // al siguiente paso de una cadena: todos están disponibles desde el principio y
  // el jugador elige el suyo. Esta función queda como compatibilidad para las
  // llamadas viejas: solo deja el panel apuntando a la portada abierta.
  siguienteObjetivo() { const E = this.estado; if (!E) return; E.objetivoIdx = 0; },
  despertar() { if (U.Orgs) U.Orgs.alDespertar(); const E = this.estado, j = E.jugador; if (E.mapaId !== 'aldea') this.cambiarMapa('aldea', null, true); U.Combate.limpiar(); j.x = E.mapa.inicio.x; j.y = E.mapa.inicio.y; j.vida = Math.max(1, j.stats.vida * 0.25); j.esencia = j.stats.esencia * 0.5; j.agotado = false; j.dot = null; j.escudo = false; j.tiempoLento = false; j.acero = false; j.buffs.sobrecarga = 0; j.caminarAgua = false; j.sobreAgua = false; j.cercaAgua = false; j.invuln = 1; U.Audio.musica('aldea'); U.HUD.toast('Despiertas junto a la fogata. Sora te mira de reojo.', ''); E.historial.derrotas++; E.npcs.forEach(n => { if (!n.hechos) n.hechos = []; if (n.hechos.indexOf('te vieron caer') < 0) n.hechos.push('te vieron caer'); U.Emociones.evento(n, { realidad: 40, energia: 10, etiqueta: 'te vieron caer' }); }); },
  fin(tipo) { const E = this.estado; if (E.ui === 'fin') return;
    if (tipo === 'derrota' && U.Rival) U.Rival.alDerrotaJugador(); // IDEA 1: si caes en un duelo con Ren, él lo registra al instante
    if (tipo === 'derrota' && E.torneo && E.torneo.activo) { if (U.Combate.derrotaTorneo()) return; }
    if (tipo === 'derrota' && E.escolta && E.escolta.activa) { const esc = E.escolta; esc.activa = false; if (esc.npc) { esc.npc.enEscolta = false; esc.npc.vidaEscolta = 100; } E.escolta = null; if (E.mision && E.mision.tipo === 'escolta') { E.mision = null; U.HUD.banner('📜 ESCOLTA FALLIDA · CAÍSTE PROTEGIENDO', 2.4); } } if (tipo === 'derrota') { U.Audio.sfx('derrota'); U.Audio.musica('aldea'); } if (tipo === 'victoria' && E.historial) { E.historial.victorias++; E.npcs.forEach(n => { if (!n.hechos) n.hechos = []; if (n.hechos.indexOf('te vieron ganar la arena') < 0) n.hechos.push('te vieron ganar la arena'); }); } U.Combate.cancelarArena(); U.HUD.mostrarFin(tipo); },
  togglePausa() { const E = this.estado; if (!E) return; if (E.ui === 'pausa') { E.ui = 'mundo'; U.HUD.el.pausa.classList.add('oculto'); if (U.Guardado) U.Guardado.guardarAuto(); } else if (E.ui === 'mundo') { if (U.Guardado) U.Guardado.guardarAuto(); E.ui = 'pausa'; U.HUD.construirPausa(); U.HUD.el.pausa.classList.remove('oculto'); this.input.teclas = {}; E.jugador.cargando = false; } U.Audio.sfx('click'); },
  toggleSonido() { U.Audio.init(); const s = U.Audio.toggleSilencio(); U.HUD.el.sonido.textContent = 'SONIDO: ' + (s ? 'OFF' : 'ON'); U.HUD.el.sonido.style.color = s ? 'var(--peligro)' : ''; if (!s) U.Audio.sfx('click'); },
  // ---------- entrada ----------
  keydown(e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return; const k = e.key.toLowerCase(); const E = this.estado;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (U.TestUI.activo) { if (/^[1-5]$/.test(k)) U.TestUI.tecla(parseInt(k)); if (k === 'enter' && document.getElementById('btnComenzarTest')) document.getElementById('btnComenzarTest').click(); return; }
    if (!E) return;
    if (k === 'm') { this.toggleSonido(); return; }
    if (E.ui === 'dialogo') { if (k === 'escape' || k === 'enter') U.Dialogo.cerrar(); else if (/^[1-5]$/.test(k)) U.Dialogo.tecla(parseInt(k)); return; }
    if (E.ui === 'fin') { if (k === 'enter' || k === 'escape') { const b = document.querySelector('#finBotones button'); if (b) b.click(); } return; }
    if (k === 'escape' || k === 'p') { this.togglePausa(); return; }
    if (E.ui !== 'mundo') return;
    if (E.reloj && E.reloj.durmiendo) return;
    if (this.input.teclas[k]) return; this.input.teclas[k] = true;
    switch (k) {
      case 'e': this.pressA(); break; case 'j': U.Combate.iniciarCarga(); break; case 'k': U.Combate.yang(); break; case 'l': U.Combate.tecnica(); break;
      case 'shift': case ' ': U.Combate.dash(); break; case 'q': U.Recuperacion.pocion(); break; case 'r': U.Recuperacion.toggleDescanso(); break; case 'x': U.Combate.sobrecarga(); break; case 'v': U.Combate.hechizoInversion(); break;
      case 'b': U.Combate.toggleEscudo(); break; case 'c': this.toggleCaminarAgua(); break; case 'g': if (U.Prohibidas) U.Prohibidas.usarSeleccionada(); break; case 'f': { const j = E.jugador; if (!j.tieneYang) break; const ord = U.Habilidades.yangOrden.filter(f => j.estilos.yang >= U.Habilidades.yang[f].umbral && U.Habilidades.podarEquipo(j).indexOf('yang:' + f) >= 0); if (!ord.length) break; const i = ord.indexOf(j.yangForma); U.Combate.seleccionarYang(ord[(i + 1) % ord.length]); break; }
      case '1': case '2': case '3': case '4': case '5': U.Combate.seleccionarTec(parseInt(k) - 1); break;
      case 'tab': { e.preventDefault(); const j = E.jugador; if (j.elementos.length > 1) U.Combate.cambiarElemento(j.elementos[(j.elementos.indexOf(j.elementoActivo) + 1) % j.elementos.length]); break; }
    }
  },
  keyup(e) { const k = e.key.toLowerCase(); this.input.teclas[k] = false; if (!this.estado || this.estado.ui !== 'mundo') return; if (k === 'j') U.Combate.soltarYin(); if (k === 'e') this.releaseA(); },
  // El botón A (y la tecla E) SOLO sirve para trotar: ya no interactúa, para que mantenerlo
  // para correr nunca se corte al pasar junto a un personaje u objeto. Interactuar = tocar el objetivo.
  pressA() { const E = this.estado; if (!E || E.ui !== 'mundo' || (E.reloj && E.reloj.durmiendo)) return; this.input.a = true; },
  releaseA() { this.input.a = false; },
  interactuar() {
    const E = this.estado, it = E.interactuable; if (!it) return; const j = E.jugador;
    if (it.tipo === 'npc') U.Dialogo.abrir(it.obj);
    else if (it.tipo === 'criatura') U.Dialogo.abrirCriatura(it.obj);
    else if (it.tipo === 'notaForja') { const torF = (E.roster || []).find(n => n.id === 'torin'); U.Dialogo.mostrarTexto('NOTA EN LA FORJA', 'Una nota clavada junto a la forja, con letra de martillo: «Salí. — Torin». ' + (torF ? 'Torin ' + U.Vida.dondeEstaTexto(torF) + '. Pregúntale a cualquier vecino por él: la aldea entera sabe dónde anda cada quien, y en Ajustes (engrane) tienes la lista de dónde está cada uno.' : '')); }
    else if (it.tipo === 'fogata') U.Recuperacion.descansarFogata();
    else if (it.tipo === 'runa') U.Combate.iniciarArena();
    else if (it.tipo === 'apuestas') U.Apuestas.abrir(); // IDEA 5: hablar con Rolo, el organizador, abre la cartelera de apuestas
    else if (it.tipo === 'cartel') U.Dialogo.mostrarTexto('CARTEL', it.obj.texto);
    else if (it.tipo === 'cama') U.Dialogo.abrirCama();
    else if (it.tipo === 'cofre') U.Dialogo.abrirCofre();
    else if (it.tipo === 'tesoro') U.Reliquias.recoger(it.obj);
    else if (it.tipo === 'pergamino') { if (U.Prohibidas) U.Prohibidas.recoger(it.obj); }
    else if (it.tipo === 'escondite') { if (U.Escondites) U.Escondites.interactuar(it.obj); }
    else if (it.tipo === 'puertaCasa') this.cambiarMapa('casa', { x: 10.5, y: 13.5 });
    else if (it.tipo === 'puertaOficina') this.cambiarMapa('oficina', { x: 11.5, y: 13.5 });
    else if (it.tipo === 'puertaTienda') U.Dialogo.abrirTienda(it.obj.dueno);
    else if (it.tipo === 'puertaRenta') U.Dialogo.abrirRenta(it.obj);
    else if (it.tipo === 'obelisco') this.tocarObelisco();
    else if (it.tipo === 'pozo') { if ((E.flags.pozoCd || 0) <= 0) { E.flags.pozoCd = 20; U.Recuperacion.restaurar(10); U.Combate.texto(j, '+10 ESE', '#4da3ff', 1); U.Audio.sfx('agua'); U.Dialogo.mostrarTexto('POZO', 'El agua del pozo está fría y clara. Te refresca la Esencia (+10). Sora dice que el pozo recuerda a todos los que bebieron de él.'); } else U.Dialogo.mostrarTexto('POZO', 'El agua sigue ahí, pero ya bebiste hace poco. Vuelve en un momento.'); }
  },
  // Candidatos a interactuar en el mapa actual (NPC y objetos con acción).
  candidatos() {
    const E = this.estado, m = E.mapa; const cand = [];
    E.npcs.forEach(n => { if (n.id === 'organizador') return; if (!n.enCasa && !n.ocultoSparring) cand.push({ tipo: 'npc', obj: n, r: 1.8, corto: 'HABLAR', label: 'Hablar con ' + n.nombre }); }); // IDEA 5: Rolo no usa el HABLAR genérico; su entrada es el candidato 'apuestas'
    (E.criaturas || []).forEach(c => { if (c.vida > 0 && c.temperamento === 'amistosa') cand.push({ tipo: 'criatura', obj: c, r: 1.9, corto: 'HABLAR', label: 'Hablar con ' + U.Criaturas.nombreDe(c) + ' · vínculo ' + Math.round(c.vinculo) }); });
    if (E.mapaId === 'aldea' && E.roster) { const torN = E.roster.find(n => n.id === 'torin'); if (torN && !torN.enCasa && Math.hypot(torN.x - 145.5, torN.y - 242.5) > 12) cand.push({ tipo: 'notaForja', obj: { x: 144.5, y: 241.5, w: 1, h: 1 }, r: 2.0, corto: 'NOTA', label: 'Nota en la forja de Torin (no está)' }); }
    m.objetos.forEach(o => { if (o.tipo === 'fogata') cand.push({ tipo: 'fogata', obj: o, r: 2.0, corto: 'DESCANSAR', label: 'Fogata · dormir y despertar al 100%' }); else if (o.tipo === 'runa' && !E.arena.activa) cand.push({ tipo: 'runa', obj: o, r: 2.0, corto: 'OLEADA', label: 'Runa de la arena' }); else if (o.tipo === 'cama') cand.push({ tipo: 'cama', obj: o, r: 2.0, corto: 'DORMIR', label: 'Tu cama · dormir hasta la alarma' }); else if (o.tipo === 'puertaCasa') cand.push({ tipo: 'puertaCasa', obj: o, r: 1.8, corto: 'ENTRAR', label: 'Puerta de tu casa' }); else if (o.tipo === 'puertaOficina') cand.push({ tipo: 'puertaOficina', obj: o, r: 1.9, corto: 'OFICINA', label: 'Oficina del Guardián · Aldric y Lía (misiones)' }); else if (o.tipo === 'puertaTienda') cand.push({ tipo: 'puertaTienda', obj: o, r: 1.9, corto: 'TIENDA', label: o.dueno ? 'Tienda de pociones · ' + o.dueno : 'Tienda de Marisol · pociones por monedas' }); else if (o.tipo === 'puertaRenta') cand.push({ tipo: 'puertaRenta', obj: o, r: 1.9, corto: 'RENTAR', label: 'Casa para rentar · 15 🪙 la noche · dormir y despertar al 100%' }); else if (o.tipo === 'reliquia') cand.push({ tipo: 'cartel', obj: { x: o.x, y: o.y, w: 1, h: 1, texto: 'RELIQUIA PERDIDA · Brilla con luz antigua. Acércate para recogerla y vuelve con Lía a la Oficina.' }, r: 1.6, corto: 'RELIQUIA', label: 'Reliquia perdida' }); else if (o.tipo === 'obelisco') cand.push({ tipo: 'obelisco', obj: o, r: 2.0, corto: 'HECHIZO', label: 'Obelisco de la Inversión' }); else if (o.tipo === 'cartel') cand.push({ tipo: 'cartel', obj: o, r: 1.7, corto: 'LEER', label: 'Cartel' }); else if (o.tipo === 'pozo') cand.push({ tipo: 'pozo', obj: o, r: 1.7, corto: 'BEBER', label: 'Pozo' }); else if (o.tipo === 'encargo') cand.push({ tipo: 'cartel', obj: { x: o.x, y: o.y, w: 1, h: 1, texto: 'ENCARGO DE LA OFICINA · Un paquete que espera ser recogido. Acércate para tomarlo y vuelve con Lía.' }, r: 1.6, corto: 'RECOGER', label: 'Encargo por recoger' }); else if (o.tipo === 'perdido') cand.push({ tipo: 'cartel', obj: { x: o.x, y: o.y, w: 1, h: 1, texto: 'OBJETO PERDIDO · Brilla entre la hierba: es lo que alguien perdió. Acércate para tomarlo y devuélvelo con Lía.' }, r: 1.6, corto: '¡ES ESTO!', label: 'Objeto perdido' }); else if (o.tipo === 'pista') cand.push({ tipo: 'cartel', obj: { x: o.x, y: o.y, w: 1, h: 1, texto: 'PISTA · Huellas frescas y cosas revueltas: alguien merodea por aquí de noche. Acércate para registrarla.' }, r: 1.6, corto: 'PISTA', label: 'Pista de la investigación' }); else if (o.tipo === 'cautivo') cand.push({ tipo: 'cartel', obj: { x: o.x, y: o.y, w: 1, h: 1, texto: 'CAUTIVO · Está atado y asustado. Derrota a sus bandidos y acércate para liberarlo.' }, r: 1.7, corto: 'RESCATAR', label: 'Cautivo por rescatar' }); else if (o.tipo === 'cofre') cand.push({ tipo: 'cofre', obj: o, r: 2.0, corto: 'COFRE', label: 'Cofre de tu casa · guardar / recoger máscaras, artefactos y pergaminos prohibidos' }); else if (o.tipo === 'tesoro') cand.push({ tipo: 'tesoro', obj: o, r: 1.9, corto: '¡TESORO!', label: (o.nombreTesoro || 'Objeto antiguo escondido') + ' · tócalo para recogerlo' }); else if (o.tipo === 'pergamino') cand.push({ tipo: 'pergamino', obj: o, r: 1.9, corto: '💀 ¿PERGAMINO?', label: (o.nombreTesoro || 'Pergamino prohibido') + ' · tócalo: primero lee la ADVERTENCIA' }); else if (o.tipo === 'escondite') { const dE = U.Escondites ? U.Escondites.def(o.esconditeId) : null; const sE = U.Escondites ? U.Escondites.est(o.esconditeId) : null; const gv = U.Escondites ? U.Escondites.guardiasVivos(o.esconditeId) : 0; cand.push({ tipo: 'escondite', obj: o, r: 2.0, corto: gv > 0 ? '¡GUARDIAS!' : '¡ENTRAR!', label: dE ? dE.nombre + ' · ' + (gv > 0 ? 'guardias protegiendo la entrada (' + gv + ') — derrótalos para entrar' : 'sin guardias — tócalo para ENTRAR') : 'Un lugar escondido entre la nada… tócalo para mirar de cerca' }); } });
    // IDEA 5: Rolo, el organizador de apuestas (su posición es la del NPC 'organizador', dentro de la arena).
    if (E.mapaId === 'aldea' && U.Apuestas && U.Apuestas.mostrarOrganizador()) { const o = U.Apuestas.posOrganizador(); cand.push({ tipo: 'apuestas', obj: { x: o.x, y: o.y, w: 1, h: 1 }, r: 2.2, corto: 'APOSTAR', label: U.Apuestas.etiquetaOrganizador() }); }
    return cand;
  },
  // Interactuar = tocar directamente al personaje u objeto en la pantalla (toque o clic sobre el mundo).
  // Solo funciona si el toque cae sobre el objetivo y el jugador está a su alcance (el mismo rango del globo).
  tocarMundo(clientX, clientY) {
    const E = this.estado; if (!E || E.ui !== 'mundo' || (E.reloj && E.reloj.durmiendo)) return;
    const R = U.Render, rect = R.canvas.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    const wx = ((clientX - rect.left) / R.zoom + E.camara.x) / 16, wy = ((clientY - rect.top) / R.zoom + E.camara.y) / 16;
    const j = E.jugador; let best = null, bd = 99;
    this.candidatos().forEach(c => { const ox = c.obj.x + (c.obj.w || 1) / 2, oy = c.obj.y + (c.obj.h || 1) / 2; const dToque = Math.hypot(wx - ox, wy - oy), dJug = Math.hypot(j.x - ox, j.y - oy); if (dToque < 1.6 && dJug < c.r + 0.4 && dToque < bd) { bd = dToque; best = c; } });
    if (best) { E.interactuable = best; this.interactuar(); }
  },
  // ---------- bucle único ----------
  bucle(ts) {
    if (!this.corriendo) return; let dt = Math.min(0.05, (ts - this.ultimo) / 1000); if (!(dt > 0)) dt = 0.016; this.ultimo = ts;
    // Red de seguridad: un error en un cuadro se registra y se salta ESE cuadro; el bucle nunca muere (antes, un solo error dejaba el juego congelado para siempre).
    try {
      const E = this.estado;
      if (U.TestUI.activo) U.TestUI.animar(dt);
      else if (E) {
        E.tiempo += dt; if (E.ui !== 'pausa' && E.ui !== 'fin') U.Tiempo.avanzar(E, dt);
        if (E.ui === 'mundo') { if (E.reloj && E.reloj.durmiendo) U.Recuperacion.actualizarFogata(dt); else if (E.hitstop > 0) E.hitstop -= dt; else this.actualizarMundo(dt); }
        else if (E.ui === 'dialogo') { U.Dialogo.actualizar(dt); U.Combate.actualizarEfectos(dt); E.npcs.forEach(n => { n.anim += dt * 0.2; }); }
        try { U.Render.mundo(E, E.ui === 'pausa' || E.ui === 'fin' ? 0 : dt); } catch (errR) { if (window.console) console.error('Unipar: error de render ignorado', errR); }
        try { U.HUD.actualizar(dt); } catch (errH) { if (window.console) console.error('Unipar: error de HUD ignorado', errH); }
      }
      U.Audio.actualizar(); if (U.Audio.actualizarMusica) U.Audio.actualizarMusica(E);
    } catch (err) { if (window.console) console.error('Unipar: error de cuadro ignorado', err); }
    requestAnimationFrame(t => this.bucle(t));
  },
  actualizarMundo(dt) {
    const E = this.estado, j = E.jugador, I = this.input, m = E.mapa;
    // TIEMPO LENTO: el mundo (enemigos, NPCs, proyectiles, sistemas) corre a
    // dtM = dt × escala; el jugador y el reloj corren a dt real. El reloj del
    // día ya avanzó con dt real en bucle() y aquí no se toca.
    const dtM = dt * U.Combate.escalaMundo();
    // Vector de movimiento: joystick analógico o teclado (8 direcciones, magnitud analógica)
    let vx = 0, vy = 0, mag = 0;
    if (I.joy && I.mag > 0) { vx = I.vx; vy = I.vy; mag = I.mag; }
    else { const k = I.teclas; const kx = (k['d'] || k['arrowright'] ? 1 : 0) - (k['a'] || k['arrowleft'] ? 1 : 0), ky = (k['s'] || k['arrowdown'] ? 1 : 0) - (k['w'] || k['arrowup'] ? 1 : 0); if (kx || ky) { const d = U.Grid.dir8(kx, ky); vx = d.x; vy = d.y; mag = 1; } }
    if (j.escudo) { vx = 0; vy = 0; mag = 0; } // Escudo Mágico: protegido pero SIN moverse
    j.trote = I.a && mag > 0;
    if ((j.invertido || 0) > 0 && (vx || vy)) { if (!j.invMapa && U.Inversion) j.invMapa = U.Inversion.generar(); const mv = U.Inversion ? U.Inversion.aplicar(j.invMapa, vx, vy) : { x: -vx, y: -vy }; vx = mv.x; vy = mv.y; j.dir = U.Grid.dir8(vx, vy); } // HECHIZO DE INVERSIÓN: remapeo ALEATORIO de las 8 direcciones (desarreglo: ninguna dirección queda igual); el mapeo se muestra en pantalla
    let vel = (3.4 * (0.85 + (U.Reliquias ? U.Reliquias.statEf(j, 'velocidad') : j.stats.velocidad) * 0.015)) * (j.trote ? 1.25 : 1) * (j.cargando ? 0.55 : 1) * (j.buffs.sobrecarga > 0 ? 2 : 1) * (j.agotado ? 0.85 : 1);
    if (this.estaNadando(j)) vel *= 0.5; // nadar es más lento que caminar sobre el agua (y gratis: sin Esencia ni Vida)
    if (j.polainaEquipada && U.Economia.POLAINAS[j.polainaEquipada]) vel *= U.Economia.POLAINAS[j.polainaEquipada].velMult; // con polainas vas MÁS LENTO: lo que sube es tu nivel al entrenar
    let distCel = 0;
    if (j.dash.t <= 0) {
      if (mag > 0.15) { const n = Math.hypot(vx, vy) || 1; const ox2 = j.x, oy2 = j.y; this.moverJugador(m, j, vx / n * vel * mag * dt, vy / n * vel * mag * dt); distCel = Math.hypot(j.x - ox2, j.y - oy2); j.dir = U.Grid.dir8(vx, vy); j.moviendo = true; j.anim += dt * (0.6 + mag); if (j.descansando) j.descansando = false; }
      else j.moviendo = false;
    } else j.moviendo = true;
    this.tickSuelo(dt, j.moviendo, distCel);
    this.actualizarPuentes(); // el puente de piedra de Tierra dura un día del juego: el agua se traga las baldosas vencidas
    this.chequearDia(); this.tickEscolta(dtM); this.tickPeticiones(dtM);
    // Umbrales entre mapas: pisar una salida cambia de mapa (con enfriamiento anti-rebote)
    E.cambioCd = Math.max(0, (E.cambioCd || 0) - dt);
    if (E.cambioCd <= 0 && m.salidas) { for (const s of m.salidas) { if (j.x >= s.x && j.x <= s.x + s.w && j.y >= s.y && j.y <= s.y + s.h) { this.cambiarMapa(s.destino, s.spawn); return; } } }
    // NPC: emociones, deambular y choque
    E.npcs.forEach(n => { U.Emociones.actualizar(n, dtM, j); const d = U.Grid.dist(n, j); if (d < 0.75) { const dx = j.x - n.x, dy = j.y - n.y, dd = d || 0.01; U.Grid.mover(m, j, dx / dd * 0.05, dy / dd * 0.05); if (n.bumpCd <= 0) { n.bumpCd = 3; const r = U.Emociones.evento(n, { realidad: 32, energia: 12, etiqueta: 'choque' }); U.HUD.toast(n.nombre + ' se aparta, molesto por el empujón (confianza ' + r.delta.toFixed(1) + ').', 'aviso'); } } });
    if (U.Vida) U.Vida.tickGlobal(E, dtM); if (U.Sparring) U.Sparring.actualizar(dtM);
    if (U.Criaturas) U.Criaturas.actualizar(dtM); // criaturas salvajes: rutinas y temperamentos (hostil persigue, tímida huye, amistosa se acerca)
    this.chequearMision(dt);
    if (U.Orgs) U.Orgs.tick(dtM); // organizaciones: emboscadas de los que drenan dominio, la jaula de la Red de Jade, la reliquia de los Coleccionistas y los objetivos abiertos
    if (U.Escondites) U.Escondites.tick(dtM); // escondites secretos: colocar los lugares (sin marcar), descubrir por exploración o por seguir a un miembro
    if (U.Reliquias) U.Reliquias.tick(dtM); // máscaras y artefactos: tesoros escondidos en el mundo, emboscadas de Los Coleccionistas si llevas una máscara puesta en zona salvaje, y agentes del sello si llevas la Llave contigo
    if (U.Prohibidas) U.Prohibidas.tick(dtM); // técnicas prohibidas: pergaminos escondidos en lugares peligrosos, espíritu oscuro invocado, control mental sobre vecinos y emboscadas de Los Coleccionistas si llevas un pergamino encima en zona salvaje
    if (U.Progresion) U.Progresion.tick(dtM); // progresión: duelos de examen/gimnasio/defensa, contadores de academia y títulos automáticos por hazaña
    if (U.Rival) U.Rival.actualizar(dtM); // IDEA 1: Ren, el rival (memoria, reencuentros, duelos, ayuda)
    if (U.Aprendiz) U.Aprendiz.tick(dtM); // IDEA 4: Taro, el aprendiz (petición, entrenos, reto, acompañar)
    if (E.objetivos[9] && E.objetivos[9].estado === 'actual' && (E.historial.torneos || 0) > 0) { E.objetivos[9].estado = 'hecho'; this.siguienteObjetivo(); }
    if (E.objetivos[10] && E.objetivos[10].estado === 'actual' && E.flags.rompioObjeto) { E.objetivos[10].estado = 'hecho'; this.siguienteObjetivo(); }
    if (U.Apuestas) U.Apuestas.actualizar(dtM); U.Combate.actualizar(dt, dtM); U.Recuperacion.actualizar(dt); U.Crecimiento.flush(dt); U.Ambiente.actualizar();
    E.flags.pozoCd = Math.max(0, (E.flags.pozoCd || 0) - dt);
    // Objetivos
    if (E.objetivos[1].estado === 'actual' && E.flags.visitoRibera && E.flags.visitoCenizar) { E.objetivos[1].estado = 'hecho'; U.HUD.toast('Has sentido el ambiente: el mismo elemento cuesta distinto según la zona.', 'exito'); this.siguienteObjetivo(); }
    if (E.objetivos[0].estado === 'hecho' && E.objetivoIdx === 0) this.siguienteObjetivo();
    if (E.objetivos[3].estado === 'actual' && E.flags.contadoVictoria) { E.objetivos[3].estado = 'hecho'; this.siguienteObjetivo(); }
    U.Clima.actualizar(E, dtM);
    E.bandidoT = (E.bandidoT || 0) + dt; if (E.bandidoT > 1) { E.bandidoT = 0; this.gestionarBandidos(); }
    if (E.objetivos[5] && E.objetivos[5].estado === 'actual' && E.flags.visitoDesierto && E.flags.visitoMontana) { E.objetivos[5].estado = 'hecho'; this.siguienteObjetivo(); }
    if (E.objetivos[6] && E.objetivos[6].estado === 'actual' && E.flags.hechizoInversion) { E.objetivos[6].estado = 'hecho'; this.siguienteObjetivo(); }
    if (E.objetivos[7] && E.objetivos[7].estado === 'actual' && E.flags.casaDormida) { E.objetivos[7].estado = 'hecho'; this.siguienteObjetivo(); }
    // Partículas ambientales por zona (visibles, ligadas al clima de la zona)
    const z = E.zonaActual; E.ambienteT += dtM;
    if (z && E.ambienteT > 0.08) { E.ambienteT = 0; const cx = E.camara.x / 16, cy = E.camara.y / 16, vw = U.Render.viewW / 16, vh = U.Render.viewH / 16; const rx = cx + Math.random() * vw, ry = cy + Math.random() * vh; const P = E.efectos.particulas;
      if ((z.id === 'cenizar' || z.id === 'quemadaSur' || z.id === 'volcanes' || z.id === 'puebloFuego') && P.length < 380) P.push({ x: rx, y: ry, dx: (Math.random() - 0.5) * 0.4, dy: -0.8 - Math.random() * 0.6, vida: 1.5, max: 1.5, color: Math.random() < 0.5 ? '#ff7a2f' : '#ffb347', tam: 1, grav: -0.2 });
      else if (z.id === 'ribera' && P.length < 380) P.push({ x: rx, y: ry, dx: (Math.random() - 0.5) * 0.5, dy: (Math.random() - 0.5) * 0.3, vida: 2, max: 2, color: Math.random() < 0.5 ? '#bfefff' : '#7ef0c0', tam: 1, grav: 0 });
      else if (z.id === 'bosque' && P.length < 380 && Math.random() < 0.5) P.push({ x: rx, y: cy - 1, dx: 0.6 + Math.random() * 0.5, dy: 0.5 + Math.random() * 0.4, vida: 3, max: 3, color: Math.random() < 0.5 ? '#46a06a' : '#d9a441', tam: 2, grav: 0 });
      else if (z.id === 'arena' && P.length < 380 && Math.random() < 0.6) P.push({ x: cx - 1, y: ry, dx: 2 + Math.random(), dy: (Math.random() - 0.5) * 0.3, vida: 2.5, max: 2.5, color: 'rgba(219,191,133,.7)', tam: 1, grav: 0 });
      else if (z.id === 'aldea' && Math.random() < 0.15) { E.pajaroT -= 0.08; if (E.pajaroT <= 0) { E.pajaroT = 4 + Math.random() * 8; U.Audio.sfx('pajaro'); } }
    }
    // Interactuable más cercano: solo decide qué globo se muestra sobre el objetivo.
    // El botón A ya no lo activa: interactuar es tocar el objetivo en pantalla (tocarMundo).
    let best = null, bd = 99;
    this.candidatos().forEach(c => { const ox = c.obj.x + (c.obj.w || 1) / 2, oy = c.obj.y + (c.obj.h || 1) / 2; const d = Math.hypot(j.x - ox, j.y - oy); if (d < c.r && d < bd) { bd = d; best = c; } });
    E.interactuable = best;
  }
};

document.addEventListener('DOMContentLoaded', () => U.Juego.boot());
