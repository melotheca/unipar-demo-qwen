/* === js/sistemas/vida.js === */
/* Unipar — VIDA DIARIA: rutinas con horarios, viajes entre mapas y el "¿dónde está?".
   Cada NPC tiene su rutina por horas: trabaja en su puesto, come en la plaza, entrena en el
   Bosque Susurrante, vuelve caminando (te lo puedes cruzar en el camino) y de noche se mete
   en su casa. Si no está en su puesto, su forja/tienda deja una nota y cualquier vecino te
   dice dónde fue: vas a ese lugar y está ahí, o te lo cruzas de regreso. */
window.U = window.U || {};

U.Vida = {
  SALIDAS: { aldea: { x: 8.5, y: 1.6 }, bosque: { x: 28.5, y: 53.8 } },
  ENTRADAS: { bosque: { x: 28.5, y: 52.4 }, aldea: { x: 8.5, y: 3.4 } },
  // Rutina: [desde, hasta, mapa, x, y, lugar, actividad, opciones]
  RUTINAS: {
    kaelen: [
      { d: 5, h: 9, m: 'aldea', x: 8.5, y: 5.5, l: 'la entrada norte de la aldea', a: 'vigila la entrada del bosque' },
      { d: 9, h: 11, m: 'bosque', x: 27, y: 12.5, l: 'un claro del Bosque Susurrante', a: 'entrena en sparring con Marco', spar: true, fijo: true },
      { d: 11, h: 14, m: 'aldea', x: 16.5, y: 24.5, l: 'la plaza de la aldea', a: 'hace su ronda de guardia' },
      { d: 14, h: 18, m: 'aldea', x: 41.5, y: 33.5, l: 'la puerta de la Arena de Ecos', a: 'vigila la arena y entrena la guardia', fijo: true },
      { d: 18, h: 21, m: 'aldea', x: 21.5, y: 22.5, l: 'la plaza, junto al pozo', a: 'cierra su ronda del día' }
    ],
    sora: [
      { d: 5, h: 8, m: 'aldea', x: 18.5, y: 22.5, l: 'el pozo de la aldea', a: 'saca agua y prepara pociones' },
      { d: 8, h: 11, m: 'aldea', x: 9.5, y: 25.5, l: 'la huerta de Elena', a: 'ayuda a Elena y recoge hierbas' },
      { d: 11, h: 14, m: 'aldea', x: 18.5, y: 22.5, l: 'el pozo de la aldea', a: 'atiende a los que vuelven golpeados' },
      { d: 14, h: 17, m: 'aldea', x: 36.5, y: 24.5, l: 'la Ribera Húmeda, cruzando el puente', a: 'recoge hierbas junto al río' },
      { d: 17, h: 21, m: 'aldea', x: 17.5, y: 25.5, l: 'la fogata de la plaza', a: 'descansa y escucha a la aldea' }
    ],
    torin: [
      { d: 5, h: 11, m: 'aldea', x: 11.5, y: 20.5, l: 'su forja, al oeste de la plaza', a: 'trabaja el acero desde temprano', fijo: true },
      { d: 11, h: 13, m: 'aldea', x: 18.5, y: 24.5, l: 'la plaza de la aldea', a: 'entrega encargos de la forja' },
      { d: 13, h: 14, m: 'bosque', x: 28.5, y: 15.5, l: 'el Claro del Bosque', a: 'calienta entrenando solo' },
      { d: 14, h: 17, m: 'bosque', x: 27, y: 12.5, l: 'un claro del Bosque Susurrante', a: 'entrena en sparring con Breno', spar: true, fijo: true },
      { d: 17, h: 20, m: 'aldea', x: 11.5, y: 20.5, l: 'su forja, al oeste de la plaza', a: 'cierra la forja y templa lo último', fijo: true },
      { d: 20, h: 21, m: 'aldea', x: 17.5, y: 25.5, l: 'la fogata de la plaza', a: 'descansa tras la jornada' }
    ],
    marisol: [
      { d: 5, h: 8, m: 'aldea', x: 22.5, y: 32.5, l: 'su tienda, al sur de la plaza', a: 'prepara la tienda antes de abrir', fijo: true },
      { d: 8, h: 20, m: 'aldea', x: 22.5, y: 32.5, l: 'su tienda, al sur de la plaza', a: 'vende pociones y escucha chismes', fijo: true },
      { d: 20, h: 21, m: 'aldea', x: 16.5, y: 24.5, l: 'la plaza de la aldea', a: 'pasea tras cerrar la tienda' }
    ],
    breno: [
      { d: 5, h: 8, m: 'aldea', x: 18.5, y: 29.5, l: 'el sur de la plaza', a: 'carga leña y afila el hacha' },
      { d: 8, h: 13, m: 'bosque', x: 19.5, y: 20.5, l: 'el oeste del Bosque Susurrante', a: 'tala árboles para la aldea' },
      { d: 13, h: 14, m: 'bosque', x: 28.5, y: 24.5, l: 'el sendero del Bosque', a: 'vuelve hacia el claro con la leña' },
      { d: 14, h: 17, m: 'bosque', x: 30, y: 12.5, l: 'un claro del Bosque Susurrante', a: 'entrena en sparring con Torin', spar: true, fijo: true },
      { d: 17, h: 19, m: 'aldea', x: 12.5, y: 11.5, l: 'el claro norte de la aldea', a: 'parte la leña del día' },
      { d: 19, h: 21, m: 'aldea', x: 17.5, y: 25.5, l: 'la fogata de la plaza', a: 'descansa en silencio' }
    ],
    elena: [
      { d: 5, h: 10, m: 'aldea', x: 9.5, y: 25.5, l: 'su huerta, al oeste de la plaza', a: 'riega y cuida lo sembrado' },
      { d: 10, h: 13, m: 'aldea', x: 16.5, y: 24.5, l: 'la plaza de la aldea', a: 'vende verduras en la plaza' },
      { d: 13, h: 18, m: 'aldea', x: 15.5, y: 36.5, l: 'la huerta del sur', a: 'siembra la segunda tanda' },
      { d: 18, h: 21, m: 'aldea', x: 9.5, y: 25.5, l: 'su huerta, al oeste de la plaza', a: 'recoge el día y riega por última vez' }
    ],
    marco: [
      { d: 5, h: 9, m: 'aldea', x: 27.5, y: 22.5, l: 'el puente hacia la Ribera', a: 'prepara su mochila y mira el río' },
      { d: 9, h: 11, m: 'bosque', x: 30, y: 12.5, l: 'un claro del Bosque Susurrante', a: 'entrena en sparring con Kaelen', spar: true, fijo: true },
      { d: 11, h: 16, m: 'bosque', x: 40.5, y: 27.5, l: 'el estanque del Bosque Susurrante', a: 'explora y dibuja su mapa' },
      { d: 16, h: 19, m: 'aldea', x: 36.5, y: 24.5, l: 'la Ribera Húmeda', a: 'vuelve de explorar y se lava las botas' },
      { d: 19, h: 21, m: 'aldea', x: 17.5, y: 25.5, l: 'la fogata de la plaza', a: 'cuenta sus historias, exagerando un poco' }
    ],
    pipo: [
      { d: 5, h: 9, m: 'aldea', x: 10.5, y: 30.5, l: 'junto a las casas del oeste', a: 'juega junto a su casa' },
      { d: 9, h: 13, m: 'aldea', x: 15.5, y: 21.5, l: 'la plaza de la aldea', a: 'corre y entrena a su manera: jugando' },
      { d: 13, h: 17, m: 'aldea', x: 17.5, y: 25.5, l: 'la fogata de la plaza', a: 'mira entrenar a los grandes' },
      { d: 17, h: 20, m: 'aldea', x: 22.5, y: 32.5, l: 'la puerta de la tienda de Marisol', a: 'mira las pociones como si fueran tesoros' }
    ]
  },
  esHoraCasa(n, h) { const per = U.Personas.de(n.id); const hc = per.horaCasa != null ? per.horaCasa : 21; return h >= hc || h < 5; },
  slotDe(n, hora, E) {
    if (n.id === 'aldric') return { mapa: 'oficina', x: 12.5, y: 3.5, lugar: 'la Oficina del Guardián', actividad: 'atiende la Oficina', fijo: true };
    if (n.id === 'lia') return { mapa: 'oficina', x: 8.5, y: 7.5, lugar: 'la Oficina, junto al tablón', actividad: 'lleva el tablón de misiones', fijo: true };
    if (E && E.sparring && E.sparring.fase === 'peleando' && E.sparring.pareja.indexOf(n.id) >= 0) return { mapa: n.mapa, x: n.x, y: n.y, lugar: 'el círculo de la pelea', actividad: 'está en pleno sparring contigo', fijo: true };
    if (this.esHoraCasa(n, hora)) return { enCasa: true, mapa: 'aldea', x: n.casaPos.x, y: n.casaPos.y, lugar: 'su casa', actividad: 'duerme en casa hasta el amanecer' };
    if ((n.sparringCansado || 0) > 0) return { mapa: n.mapa, x: n.x, y: n.y, lugar: 'el borde del círculo de la pelea', actividad: 'descansa tras el sparring, recuperándose', fijo: true };
    const r = this.RUTINAS[n.id] || [];
    for (let i = 0; i < r.length; i++) { const s = r[i]; if (hora >= s.d && hora < s.h) return { mapa: s.m, x: s.x, y: s.y, lugar: s.l, actividad: s.a, fijo: !!s.fijo, spar: !!s.spar }; }
    return { mapa: 'aldea', x: n.home.x, y: n.home.y, lugar: 'su puesto de siempre', actividad: 'está en su puesto' };
  },
  buscar(id) {
    const E = U.Juego.estado; if (!E) return null;
    const todos = (E.roster || []).concat(E.npcsPorMapa && E.npcsPorMapa.oficina ? E.npcsPorMapa.oficina : [], E.npcs || []);
    for (let i = 0; i < todos.length; i++) if (todos[i].id === id) return todos[i];
    return null;
  },
  dondeEstaTexto(n) {
    if (!n) return 'no se sabe';
    if (n.enCasa) return 'está en su casa, durmiendo (sale al amanecer, 05:00)';
    const E = U.Juego.estado; const dest = n.destinoActual || this.slotDe(n, E ? U.Tiempo.hora(E) : 9, E);
    if (n.viaje) return 'va DE CAMINO hacia ' + dest.lugar + ' (' + dest.actividad + '): te lo puedes cruzar por el sendero';
    const mapaTxt = dest.mapa === 'oficina' ? '' : '';
    return 'está ' + mapaTxt + 'en ' + dest.lugar + ': ' + dest.actividad;
  },
  respuestaDonde(hablante, target) {
    const donde = this.dondeEstaTexto(target);
    const tipo = U.Personas.de(hablante.id).tipo;
    let abre = 'Claro: ';
    if (hablante.id === 'pipo') abre = '¡Yo lo vi! ¡Yo sé! ';
    else if (hablante.id === 'kaelen') abre = '¿Y yo soy su mapa? …Está bien, te digo: ';
    else if (hablante.id === 'lia') abre = 'Según mi lista, y mi lista no falla: ';
    else if (hablante.id === 'torin') abre = 'Te digo dónde y vas. Sin vueltas: ';
    else if (hablante.id === 'marco') abre = '¡Eso SÍ lo sé, lo vi con estos ojos viajeros! ';
    else if (tipo.indexOf('Amable') >= 0 || tipo.indexOf('Maternal') >= 0) abre = 'Claro, mi cielo, te digo: ';
    let cierra = '';
    if (target.mapa !== hablante.mapa && !target.enCasa) cierra = ' Así que no lo busques en su puesto: ve a ese lugar y lo encuentras, o cruzatelo en el camino de regreso.';
    if (target.enCasa) cierra = ' Si es urgente, vuelve al amanecer.';
    return abre + target.nombre + ' ' + donde + '.' + cierra;
  },
  // Ruta con puntos de paso para no atascarse con casas ni con el río. En el MAPA
  // CONTINUO las regiones se detectan por coordenadas y cada región tiene sus puntos
  // de paso por los caminos (la entrada del bosque, el puente de la montaña, el camino
  // del sur al desierto, el puente del Río del Este…): el NPC cose su viaje por esos
  // puntos y llega caminando, sin cambiar de mapa.
  rutaPara(n, p) {
    const pts = [];
    const enBosque = q => q.x >= 36 && q.x < 116 && q.y >= 40 && q.y < 104;
    const enMontana = q => q.x >= 292 && q.y < 96;
    const enDesierto = q => q.y >= 236 && q.x < 124;
    const enFuego = q => q.x >= 284 && q.y >= 272;
    const enAgua = q => q.x >= 318 && q.y >= 150 && q.y < 262;
    const region = q => enBosque(q) ? 'bosque' : enMontana(q) ? 'montana' : enDesierto(q) ? 'desierto' : enFuego(q) ? 'fuego' : enAgua(q) ? 'agua' : 'aldea';
    const rn = region(n), rp = region(p);
    if (rn !== rp) {
      const puerta = { bosque: [{ x: 104.5, y: 110.5 }, { x: 68.5, y: 96.5 }], montana: [{ x: 280.5, y: 116.5 }, { x: 327.5, y: 75.5 }], desierto: [{ x: 120.5, y: 272.5 }, { x: 46.5, y: 265.5 }], agua: [{ x: 330.5, y: 196.5 }, { x: 360.5, y: 196.5 }], fuego: [{ x: 300.5, y: 290.5 }, { x: 330.5, y: 312.5 }], aldea: [{ x: 150.5, y: 246.5 }] };
      const sale = puerta[rn] ? puerta[rn].slice().reverse() : [];
      let entra = puerta[rp] || [];
      let ruta = sale.slice();
      if (rn === 'fuego' && rp !== 'desierto') ruta = ruta.concat([{ x: 46.5, y: 265.5 }, { x: 120.5, y: 272.5 }]);
      if (rn !== 'aldea' && rp !== 'aldea' && rn !== 'fuego') ruta.push({ x: 150.5, y: 246.5 });
      ruta = ruta.concat(entra);
      ruta.forEach(q => pts.push(q));
      pts.push({ x: p.x, y: p.y });
      return pts;
    }
    if (rn === 'bosque') {
      if (p.y < 62 && n.y >= 64) pts.push({ x: 68.5, y: 70.5 }, { x: 68.5, y: 62 });
      else if (p.y >= 76 && n.y < 64) pts.push({ x: 68.5, y: 62 }, { x: 68.5, y: 70.5 }, { x: 68.5, y: 80 });
      else if (p.x > 74 && n.x <= 74) pts.push({ x: 68.5, y: 70.5 }, { x: 75.5, y: 70.5 });
      else if (p.x < 64 && n.x >= 64 && n.y > 62) pts.push({ x: 65, y: 68.5 });
    } else if (rn === 'aldea') {
      const este = n.x > 167, pEste = p.x > 167;
      if (este && !pEste) { pts.push({ x: 170.5, y: 246.5 }, { x: 158.5, y: 246.5 }); }
      if (!este && pEste) { if (Math.hypot(n.x - 150.5, n.y - 246.5) > 3) pts.push({ x: 150.5, y: 246.5 }); pts.push({ x: 158.5, y: 246.5 }, { x: 170.5, y: 246.5 }); }
      else if (p.x < 149 && p.y < 237) { if (Math.hypot(n.x - 150.5, n.y - 246.5) > 3.5) pts.push({ x: 150.5, y: 246.5 }); pts.push({ x: 145.5, y: 244.5 }, { x: 142.5, y: 244.5 }, { x: 142.5, y: 232 }); }
      else if (n.y < 237 && n.x < 149 && !(p.x < 149 && p.y < 237)) { pts.push({ x: 142.5, y: 244.5 }, { x: 147, y: 245.5 }); }
      else if (p.y > 253 && n.y <= 253) { pts.push({ x: 150.5, y: 250.5 }); }
      else if (p.y <= 253 && n.y > 253) { pts.push({ x: 150.5, y: 250.5 }, { x: 150.5, y: 246.5 }); }
    }
    pts.push({ x: p.x, y: p.y });
    return pts;
  },
  // LOS NPC TAMBIÉN PUEDEN CAMINAR SOBRE EL AGUA, y lo deciden ELLOS, como el jugador con su
  // botón: su elemento manda. Agua cruza gratis; Viento levita; Tierra levanta su puente al
  // pasar (la celda queda como PUENTE para todos, igual que cuando lo hace el jugador de
  // Tierra; ese puente de piedra NO es permanente: dura un día del juego y el agua se lo
  // traga, y cuesta 5 de Esencia por baldosa al levantarlo). Fuego y Rayo DECIDEN: la decisión es de cada NPC, se toma una sola vez, es
  // estable (sale de su propio id: no cambia entre partidas) y queda en n.cruzaAgua — unos
  // cruzan y otros no, y a los que no, el agua les sigue bloqueando el paso como siempre.
  // Sin elemento conocido, no cruzan.
  elementoDe(n) { const per = U.Personas.de(n.id); return per ? per.elemento : null; },
  decideAgua(n) {
    if (n.cruzaAgua == null) { const el = this.elementoDe(n);
      if (el === 'agua' || el === 'viento' || el === 'tierra') n.cruzaAgua = true;
      else if (el === 'fuego' || el === 'rayo') { let h = 0; const s = String(n.id || n.nombre || ''); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; n.cruzaAgua = (h % 100) < 55; }
      else n.cruzaAgua = false; }
    return n.cruzaAgua;
  },
  // Mismo truco que U.Juego.moverJugador: si este NPC puede/decide cruzar, el agua se vuelve
  // no-sólida SOLO durante su paso (la colisión usa la caja del personaje, radio 0.3, no el
  // centro) y se restaura al terminar, para que no afecte a nadie más.
  moverNPC(n, m, dx, dy) {
    if (!m) return;
    if (!this.decideAgua(n)) { U.Grid.mover(m, n, dx, dy); return; }
    const T = U.Grid.T; const enAgua = (x, y) => { const cx = Math.floor(x), cy = Math.floor(y); return cx >= 0 && cy >= 0 && cx < m.ancho && cy < m.alto && m.tiles[cy * m.ancho + cx] === T.AGUA; };
    const R = 0.3; const cajaAgua = (x, y) => enAgua(x, y) || enAgua(x - R, y - R) || enAgua(x + R, y - R) || enAgua(x - R, y + R) || enAgua(x + R, y + R);
    if (!cajaAgua(n.x + dx, n.y + dy) && !cajaAgua(n.x, n.y)) { U.Grid.mover(m, n, dx, dy); return; }
    const tocados = [];
    for (let i = 0; i < m.tiles.length; i++) if (m.tiles[i] === T.AGUA && m.solidos[i] === 1) { m.solidos[i] = 0; tocados.push(i); }
    U.Grid.mover(m, n, dx, dy);
    tocados.forEach(i => { if (m.tiles[i] === T.AGUA) m.solidos[i] = 1; });
    // NPC DE TIERRA: levanta la misma baldosa de puente de piedra que el jugador, con las
    // mismas reglas — paga 5 de Esencia por baldosa al crearla (una sola vez por baldosa;
    // cruzar sobre un puente ya creado es gratis) y la baldosa dura UN DÍA DEL JUEGO, luego
    // el agua se la traga (ver U.Juego.levantarPuente / actualizarPuentes). Los NPC no
    // tienen barra de Esencia propia: pagan de su reserva n.esenciaPuente (100, se rellena
    // al cambiar el día en U.Juego.chequearDia). Sin reserva suficiente no levanta la
    // baldosa (cruza igual, sin dejar puente, como el jugador de Tierra sin Esencia).
    if (this.elementoDe(n) === 'tierra' && enAgua(n.x, n.y)) { const cx = Math.floor(n.x), cy = Math.floor(n.y); const idx = cy * m.ancho + cx; if (m.tiles[idx] === T.AGUA) { if (n.esenciaPuente == null) n.esenciaPuente = 100; if (n.esenciaPuente >= U.Juego.PUENTE_COSTO && U.Juego.levantarPuente(m, idx)) { n.esenciaPuente -= U.Juego.PUENTE_COSTO; if (U.Combate) U.Combate.particulas(n.x, n.y, 3, '#d9a441', 'polvo'); } } }
  },
  caminarDirecto(n, dt, p, vel, E) {
    const dx = p.x - n.x, dy = p.y - n.y, d = Math.hypot(dx, dy);
    if (d < 0.45) { n.moviendo = false; return true; }
    n.dir = U.Grid.dir8(dx, dy); this.moverNPC(n, E.mapa && n.mapa === E.mapaId ? E.mapa : U.Juego.mapaPorId(n.mapa), dx / d * vel * dt, dy / d * vel * dt);
    n.moviendo = true; n.anim += dt * 1.6;
    return Math.hypot(p.x - n.x, p.y - n.y) < 0.45;
  },
  // El mapa donde se mueve n: el del jugador si n está en él; si no, el suyo por id.
  mapaDe(n, E) { return E && E.mapa && n.mapa === E.mapaId ? E.mapa : (U.Juego && U.Juego.mapaPorId ? U.Juego.mapaPorId(n.mapa) : null); },
  // ¿El tramo recto de n hasta p cruza el agua en el mapa de n? Se muestrea el segmento cada
  // ~0.4 celdas (menos que el ancho de cualquier río/estanque del juego). Cuenta AGUA y
  // también PUENTE: el puente de madera y los puentes de Tierra solo existen SOBRE el agua,
  // y a la altura del puente las celdas del río son PUENTE, no AGUA (sin esto, un destino
  // justo cruzando el puente no se detectaba como cruce de agua).
  tramoCruzaAgua(n, p, E) {
    const m = this.mapaDe(n, E);
    if (!m) return false;
    const T = U.Grid.T, d = Math.hypot(p.x - n.x, p.y - n.y), pasos = Math.max(1, Math.ceil(d / 0.4));
    for (let i = 0; i <= pasos; i++) { const x = Math.floor(n.x + (p.x - n.x) * i / pasos), y = Math.floor(n.y + (p.y - n.y) * i / pasos); if (x >= 0 && y >= 0 && x < m.ancho && y < m.alto && (m.tiles[y * m.ancho + x] === T.AGUA || m.tiles[y * m.ancho + x] === T.PUENTE)) return true; }
    return false;
  },
  caminarA(n, dt, p, vel, E) {
    const clave = n.mapa + '>' + p.x + ',' + p.y;
    if (n.rutaKey !== clave) { n.rutaKey = clave; n.rutaT = 0; n.desvio = null; n.ultPos = null; n.atascoT = 0; n.mejorDist = null; n.desvioN = 0;
      // CRUCE DE AGUA TAMBIÉN POR RUTA/HORARIO: rutaPara es el camino viejo — rodea el río
      // por el puente (y ese rodeo atasca: p. ej. Sora, de Agua, se quedaba pegada para
      // siempre contra el cartel de (23,24) yendo de la plaza a la Ribera en su horario).
      // Si el tramo recto hasta el destino cruza agua y este NPC DECIDE cruzar (decideAgua:
      // Agua/Viento/Tierra cruzan — Tierra deja PUENTE al pasar —; Fuego/Rayo solo si ese
      // NPC lo decidió), la ruta es DIRECTA y cada paso se mueve con moverNPC (vía
      // caminarDirecto), igual que en el movimiento directo y en la escolta. Si no cruza
      // agua o el NPC no decidió cruzar, se usa rutaPara como siempre (puente incluido).
      n.rutaAgua = !!(this.decideAgua(n) && this.tramoCruzaAgua(n, p, E));
      n.ruta = n.rutaAgua ? [{ x: p.x, y: p.y }] : this.rutaPara(n, p); }
    if (!n.ruta || !n.ruta.length) return true;
    // Solo en la ruta DIRECTA de agua: si un sólido suelto (un árbol, una roca, un cartel)
    // queda justo en la línea y el NPC deja de avanzar, se desvía de lado ~1.5 celdas para
    // deslizarse por la cara del obstáculo y retoma el destino; sin esto, un sólido en la
    // línea recta al otro lado del agua lo dejaba pegado igual que el camino viejo. Y
    // mientras siga avanzando, el tiempo de abandono de la ruta (rutaT) se reinicia: un
    // cruce largo en línea recta tarda más que el límite de un tramo normal, y sin esto la
    // ruta se daba por terminada a mitad del cruce y el NPC se quedaba ahí para siempre.
    if (n.rutaAgua) {
      if (n.desvio) { n.desvioT -= dt; if (this.caminarDirecto(n, dt, n.desvio, vel, E) || n.desvioT <= 0) { n.desvio = null; n.ultPos = { x: n.x, y: n.y }; n.atascoT = 0; } return false; }
      if (!n.ultPos || Math.hypot(n.x - n.ultPos.x, n.y - n.ultPos.y) > 0.3) { n.ultPos = { x: n.x, y: n.y }; n.atascoT = 0; n.rutaT = 0; }
      else if (Math.hypot(p.x - n.x, p.y - n.y) > 0.6) { n.atascoT = (n.atascoT || 0) + dt;
        if (n.atascoT > 0.9) { n.atascoT = 0; const d = Math.hypot(p.x - n.x, p.y - n.y) || 1, px = -(p.y - n.y) / d, py = (p.x - n.x) / d, m = this.mapaDe(n, E);
          // Cada atasco seguido sin acercarse al destino, el desvío es más largo y cambia
          // de lado: un grupo ancho de árboles/rocas no se rodea con el mismo pasito corto.
          if (n.mejorDist == null || d < n.mejorDist - 1) { n.mejorDist = d; n.desvioN = 0; }
          n.desvioN = (n.desvioN || 0) + 1;
          const lejos = 1.5 + Math.min(3, n.desvioN - 1) * 1.1;
          let lado = n.desvioN % 2 === 1 ? 1 : -1; const tx = n.x + px * lejos * lado, ty = n.y + py * lejos * lado;
          if (m && U.Grid.solidoEn(m, tx, ty)) lado = -lado;
          n.desvio = { x: Math.max(0.6, Math.min((m ? m.ancho : 999) - 0.6, n.x + px * lejos * lado)), y: Math.max(0.6, Math.min((m ? m.alto : 999) - 0.6, n.y + py * lejos * lado)) }; n.desvioT = 2.5 + lejos * 0.5; return false; } }
    }
    n.rutaT = (n.rutaT || 0) + dt;
    const wp = n.ruta[0];
    const esFinal = n.ruta.length === 1;
    if (this.caminarDirecto(n, dt, wp, vel, E) || n.rutaT > (esFinal ? 45 : 25)) { n.ruta.shift(); n.rutaT = 0; if (!n.ruta.length) { n.moviendo = false; return true; } }
    return false;
  },
  // Movimiento de los NPC que están en el mapa del jugador.
  mover(n, dt, j) {
    const E = U.Juego.estado; if (!E || !E.mapa) return;
    if (n.enEscolta) { n.moviendo = false; return; } // la escolta camina con su propia lógica (U.Juego.tickEscolta)
    if (n.buscaJugador && n.mapa === E.mapaId && !n.enCasa) { this.caminarA(n, dt, { x: j.x, y: j.y }, 2.9, E); return; } // un NPC que te busca para pedirte algo
    const hora = U.Tiempo.hora(E);
    const dest = this.slotDe(n, hora, E); n.destinoActual = dest;
    if (n.enCasa) {
      if (!this.esHoraCasa(n, hora)) { n.enCasa = false; n.x = n.casaPos.x; n.y = n.casaPos.y; n.rutaKey = ''; }
      else { n.moviendo = false; return; }
    }
    if (dest.mapa !== n.mapa) {
      if (!n.viaje || n.viaje.hacia !== dest.mapa) n.viaje = { hacia: dest.mapa, t: 14 };
      const salida = this.SALIDAS[n.mapa];
      if (salida) {
        if (this.caminarA(n, dt, salida, 2.7, E)) { n.mapa = dest.mapa; const ent = this.ENTRADAS[n.mapa]; n.x = ent.x; n.y = ent.y; n.viaje = null; n.ruta = []; n.rutaKey = ''; if (U.Juego.refrescarNpcs) U.Juego.refrescarNpcs(); }
        return;
      }
      n.mapa = dest.mapa; n.x = dest.x; n.y = dest.y; n.viaje = null; return;
    }
    n.viaje = null;
    if (dest.enCasa) { if (this.caminarA(n, dt, n.casaPos, 2.3, E)) { n.enCasa = true; n.moviendo = false; } return; }
    const llego = this.caminarA(n, dt, dest, dest.fijo ? 2.5 : 2.1, E);
    n.enCirculo = !!dest.spar;
    if (llego) {
      n.moviendo = false;
      // Vida quieta con micro-movimiento: paseítos cortos alrededor de su puesto.
      if (!dest.fijo) {
        n.idleT = (n.idleT || 0) + dt;
        if (!n.microPunto && n.idleT > 5) { n.idleT = 0; n.microPunto = { x: dest.x + (Math.random() - 0.5) * 2.2, y: dest.y + (Math.random() - 0.5) * 2.2 }; n.microT = 0; }
        if (n.microPunto) { n.microT = (n.microT || 0) + dt; if (this.caminarDirecto(n, dt, n.microPunto, 0.85, E) || n.microT > 3.5) n.microPunto = null; }
      }
      const dj = U.Grid.dist(n, j);
      if (dj < 5 && E.mapaId === n.mapa) n.dir = U.Grid.dir8(j.x - n.x, j.y - n.y);
    }
  },
  // Los NPC que están en OTRO mapa también viven: viajan con su tiempo y llegan a su puesto.
  tickGlobal(E, dt) {
    if (!E.roster) return;
    const hora = U.Tiempo.hora(E);
    E.roster.forEach(n => {
      n.sparringCansado = Math.max(0, (n.sparringCansado || 0) - dt);
      if (E.npcs.indexOf(n) >= 0) return;
      const dest = this.slotDe(n, hora, E); n.destinoActual = dest;
      if (n.enCasa && !this.esHoraCasa(n, hora)) n.enCasa = false;
      if (dest.enCasa) { n.enCasa = true; n.mapa = 'aldea'; n.x = n.casaPos.x; n.y = n.casaPos.y; n.viaje = null; return; }
      if (dest.mapa !== n.mapa) {
        if (!n.viaje || n.viaje.hacia !== dest.mapa) n.viaje = { hacia: dest.mapa, t: 10 };
        n.viaje.t -= dt;
        if (n.viaje.t <= 0) { n.mapa = dest.mapa; n.x = dest.x; n.y = dest.y; n.viaje = null; n.ruta = []; n.rutaKey = ''; }
      } else { n.viaje = null; n.x = dest.x; n.y = dest.y; }
    });
  }
};

/* MAPA CONTINUO: las rutinas de arriba se escribieron con coordenadas de los mapas
   viejos. Aquí se convierten UNA vez a coordenadas del continente nuevo (aldea +134,+222 ·
   bosque +40,+44) y todas pasan a ser mapa 'aldea': los NPC ya no cambian de mapa, caminan
   por el mismo mundo abierto hasta su puesto, cruzándose contigo por los caminos. */
(function () {
  const OFFR = { aldea: { x: 134, y: 222 }, bosque: { x: 40, y: 44 } };
  Object.keys(U.Vida.RUTINAS).forEach(id => {
    U.Vida.RUTINAS[id].forEach(s => { const o = OFFR[s.m]; if (o) { s.x += o.x; s.y += o.y; s.m = 'aldea'; } });
  });
  U.Vida.RUTINAS.elena.forEach(s => { if (s.l === 'la huerta del sur') { s.x = 149.5; s.y = 260.5; } });
  // Los puestos de «la plaza» caían justo sobre la baldosa de la fogata (sólida): se
  // mueven a la baldosa libre de la plaza, pegada a la fogata, para que nadie se atasque.
  Object.keys(U.Vida.RUTINAS).forEach(id => { U.Vida.RUTINAS[id].forEach(s => { if (s.x === 150.5 && s.y === 246.5) { s.x = 149.5; s.y = 247.5; } }); }); // en el mapa viejo ese puesto caía dentro del edificio de la Oficina; en el continuo queda en la huerta, al sur de la Oficina
  U.Vida.RUTINAS.nami = [
    { d: 5, h: 11, m: 'aldea', x: 368.5, y: 236.5, l: 'el muelle de Puerto Brisa Azul', a: 'pesca en el muelle del lago', fijo: true },
    { d: 11, h: 17, m: 'aldea', x: 360.5, y: 196.5, l: 'la plaza de Puerto Brisa Azul', a: 'vende la pesca del día' },
    { d: 17, h: 21, m: 'aldea', x: 374.5, y: 216.5, l: 'la orilla del Lago Brisa Azul', a: 'mira el atardecer sobre el lago' }
  ];
  U.Vida.RUTINAS.orin = [
    { d: 5, h: 12, m: 'aldea', x: 332.5, y: 196.5, l: 'el puente del Río del Este', a: 'vigila el puente y a los que cruzan', fijo: true },
    { d: 12, h: 18, m: 'aldea', x: 362.5, y: 198.5, l: 'la plaza de Puerto Brisa Azul', a: 'hace su ronda por el puerto' },
    { d: 18, h: 21, m: 'aldea', x: 368.5, y: 232.5, l: 'el muelle del Lago Brisa Azul', a: 'cierra el muelle al caer el sol' }
  ];
  U.Vida.RUTINAS.zara = [
    { d: 5, h: 12, m: 'aldea', x: 330.5, y: 312.5, l: 'la plaza de Aldea Ceniza Viva', a: 'aviva los braseros del pueblo', fijo: true },
    { d: 12, h: 18, m: 'aldea', x: 354.5, y: 300.5, l: 'la Tierra Quemada, al este de Ceniza Viva', a: 'recoge brasas y ceniza buena' },
    { d: 18, h: 21, m: 'aldea', x: 326.5, y: 318.5, l: 'la plaza de Aldea Ceniza Viva', a: 'deja los braseros a punto para la noche' }
  ];
  U.Vida.RUTINAS.varek = [
    { d: 5, h: 13, m: 'aldea', x: 322.5, y: 320.5, l: 'su forja de ceniza, en Aldea Ceniza Viva', a: 'forja con el calor de la Tierra Quemada', fijo: true },
    { d: 13, h: 18, m: 'aldea', x: 330.5, y: 314.5, l: 'la plaza de Aldea Ceniza Viva', a: 'entrega herramientas y presume su acero' },
    { d: 18, h: 21, m: 'aldea', x: 318.5, y: 306.5, l: 'su forja de ceniza, en Aldea Ceniza Viva', a: 'templa lo último del día', fijo: true }
  ];
  // Gente de las tramas abiertas: puestos fijos o rondas cortas cerca de su lugar.
  U.Vida.RUTINAS.vera = [
    { d: 5, h: 12, m: 'aldea', x: 224.5, y: 192.5, l: 'la plaza de la Metrópolis', a: 'pregunta a los viajeros y apunta en su libreta', fijo: true },
    { d: 12, h: 18, m: 'aldea', x: 216.5, y: 204.5, l: 'la plaza de la Metrópolis', a: 'vigila quién entra y quién sale de la ciudad' },
    { d: 18, h: 22, m: 'aldea', x: 224.5, y: 192.5, l: 'la plaza de la Metrópolis', a: 'relee sus casos a la luz de los braseros', fijo: true }
  ];
  U.Vida.RUTINAS.milo = [
    { d: 5, h: 11, m: 'aldea', x: 214.5, y: 206.5, l: 'la plaza sur de la Metrópolis', a: 'recibe encargos y oye chismes', fijo: true },
    { d: 11, h: 17, m: 'aldea', x: 226.5, y: 210.5, l: 'la puerta sureste de la Metrópolis', a: 'espera viajeros con paquetes' },
    { d: 17, h: 23, m: 'aldea', x: 214.5, y: 206.5, l: 'la plaza sur de la Metrópolis', a: 'cuenta el día y los encargos', fijo: true }
  ];
  U.Vida.RUTINAS.bram = [
    { d: 5, h: 21, m: 'aldea', x: 150.5, y: 246.5, l: 'la huerta de Bruma, al sur de la Oficina', a: 'cuenta piedras y mira la plaza de lejos', fijo: true }
  ];
  U.Vida.RUTINAS.dario = [
    { d: 5, h: 24, m: 'aldea', x: 297.5, y: 171.5, l: 'la plaza de Pueblo Tres Cruces', a: 'observa a los viajeros que cruzan', fijo: true }
  ];
  U.Vida.RUTINAS.sana = [
    { d: 5, h: 12, m: 'aldea', x: 374.5, y: 216.5, l: 'la orilla sur del Lago Brisa Azul', a: 'pone trampas entre los juncos', fijo: true },
    { d: 12, h: 18, m: 'aldea', x: 368.5, y: 232.5, l: 'el muelle del Lago Brisa Azul', a: 'revisa sus redes verdes' },
    { d: 18, h: 22, m: 'aldea', x: 374.5, y: 216.5, l: 'la orilla sur del Lago Brisa Azul', a: 'vigila las jaulas al caer el sol', fijo: true }
  ];
  U.Vida.RUTINAS.petra = [
    { d: 5, h: 22, m: 'aldea', x: 68.5, y: 162.5, l: 'su tienda de antigüedades de Arcana', a: 'cataloga reliquias y recibe vendedores discretos', fijo: true }
  ];
})();
