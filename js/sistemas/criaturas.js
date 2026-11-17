/* === js/sistemas/criaturas.js === */
/* Unipar — criaturas y contratos: PRÓXIMAMENTE en el juego completo. Datos y contratos de API listos para añadir después. */
window.U = window.U || {};

U.Criaturas = {
  disponible: true, // Las criaturas SALVAJES ya vagan por el mundo: son la fuente de los compañeros de contrato.
  // Catálogo histórico de especies de contrato (referencia de diseño; las especies del mundo están en ESPECIES).
  catalogo: [
    { id: 'zorruna', nombre: 'Zorruna de Niebla', elemento: 'agua', insignia: ['Marea de Sangre'], modo: 'Paso de niebla', nota: 'Ve caminos ocultos como espíritu.' },
    { id: 'carbunco', nombre: 'Carbunco', elemento: 'tierra', insignia: ['Muro de Cristal'], modo: 'Coraza viva' },
    { id: 'centella', nombre: 'Ave Centella', elemento: 'rayo', insignia: ['Juicio'], modo: 'Vuelo eléctrico' }
  ],
  // Contrato de sangre: vínculo con ESTA vida, muere con la partida, hasta 3. Solo invocar (aliado con IA).
  contratoSangre: [], // máx 3 (espejo de E.contratos.sangre)
  // Contrato de alma: vínculo con el USUARIO, vive en el pasaporte, cruza vidas. Solo UNO, jamás, con una sola criatura (celosas).
  // Requiere vínculo máximo (100) + ritual + consentimiento mutuo de la criatura.
  contratoAlma: null,
  pilotaje: { costoPorSeg: 3, activo: false }, // próximamente (contrato de alma)
  modoAlma: { costoEntrada: 25, costoPorSeg: 5, activo: false }, // próximamente (contrato de alma)
  proximas() { return ['Pilotaje', 'Modo Alma']; },

  /* ===== ESPECIES SALVAJES POR REGIÓN =====
     temperamento: 'hostil' (ataca si te acercas o al verte: peleas o huyes) ·
     'timida' (huye si te acercas; si no, te ignora) ·
     'amistosa' (curiosa: se acerca, te deja HABLARLE como a un NPC y hablarle sube su vínculo). */
  ESPECIES: {
    loboBosque:    { nombre: 'Lobo del bosque', temperamento: 'hostil',   elemento: 'tierra', vida: 55,  ataque: 12, defensa: 6,  mente: 5,  velocidad: 11, sprite: 'lobo',      color: '#5c6b5a', color2: '#39443a', vision: 4.6 },
    ciervo:        { nombre: 'Ciervo susurrante', temperamento: 'timida', elemento: 'viento', vida: 40,  ataque: 6,  defensa: 4,  mente: 6,  velocidad: 13, sprite: 'ciervo',    color: '#a9825a', color2: '#7a5a38', huida: 3.2 },
    espirituBosque:{ nombre: 'Espíritu del bosque', temperamento: 'amistosa', elemento: 'viento', vida: 45, ataque: 9, defensa: 5,  mente: 12, velocidad: 9,  sprite: 'espiritu',  color: '#7ef0c0', color2: '#2a7f5c' },
    bestiaArena:   { nombre: 'Bestia de arena', temperamento: 'hostil',   elemento: 'tierra', vida: 72,  ataque: 13, defensa: 8,  mente: 4,  velocidad: 10, sprite: 'bestia',    color: '#c9a86a', color2: '#8a6b3a', vision: 4.6 },
    escorpion:     { nombre: 'Escorpión de sal', temperamento: 'hostil',  elemento: 'tierra', vida: 35,  ataque: 11, defensa: 9,  mente: 3,  velocidad: 9,  sprite: 'escorpion', color: '#8a6b46', color2: '#5b3d22', vision: 3.6 },
    lagartoArena:  { nombre: 'Lagarto de sal', temperamento: 'timida',    elemento: 'fuego',  vida: 30,  ataque: 7,  defensa: 4,  mente: 5,  velocidad: 12, sprite: 'lagarto',   color: '#d9a441', color2: '#7a5320', huida: 2.8 },
    loboNieve:     { nombre: 'Lobo de nieve', temperamento: 'hostil',     elemento: 'agua',   vida: 60,  ataque: 13, defensa: 7,  mente: 5,  velocidad: 11, sprite: 'lobo',      color: '#dfe9f2', color2: '#8fa5b8', vision: 4.6 },
    yeti:          { nombre: 'Yeti joven', temperamento: 'hostil',        elemento: 'agua',   vida: 115, ataque: 15, defensa: 10, mente: 5,  velocidad: 8,  sprite: 'yeti',      color: '#eef4fa', color2: '#9db4c8', vision: 4.2, escala: 1.35 },
    criaturaHielo: { nombre: 'Criatura de hielo', temperamento: 'timida', elemento: 'agua',   vida: 38,  ataque: 8,  defensa: 8,  mente: 6,  velocidad: 10, sprite: 'hielo',     color: '#9fd8ef', color2: '#4a86a8', huida: 3 },
    espirituHielo: { nombre: 'Espíritu de hielo', temperamento: 'amistosa', elemento: 'agua', vida: 44,  ataque: 10, defensa: 6,  mente: 12, velocidad: 9,  sprite: 'espiritu',  color: '#bfefff', color2: '#5b9ec4' },
    serpienteAgua: { nombre: 'Serpiente de agua', temperamento: 'hostil', elemento: 'agua',   vida: 50,  ataque: 12, defensa: 5,  mente: 5,  velocidad: 11, sprite: 'serpiente', color: '#35c6f4', color2: '#1a6b94', vision: 4.2, acuatica: true },
    nutria:        { nombre: 'Nutria del lago', temperamento: 'amistosa', elemento: 'agua',  vida: 36,  ataque: 7,  defensa: 4,  mente: 8,  velocidad: 11, sprite: 'nutria',    color: '#8a6b46', color2: '#5b3d22', acuatica: true },
    tortugaLago:   { nombre: 'Tortuga del lago', temperamento: 'timida',  elemento: 'agua',   vida: 65,  ataque: 6,  defensa: 14, mente: 6,  velocidad: 6,  sprite: 'tortuga',   color: '#4a7a5a', color2: '#2c4a34', huida: 2.2, acuatica: true },
    ajolote:       { nombre: 'Ajolote de la laguna', temperamento: 'amistosa', elemento: 'agua', vida: 30, ataque: 6, defensa: 3,  mente: 8,  velocidad: 8,  sprite: 'ajolote',   color: '#f2a7c3', color2: '#c46a92', acuatica: true }
  },
  // Instancias del mundo: unas POCAS por región (4), en su región correcta del continente continuo.
  INSTANCIAS: [
    { uid: 'lobo_bosque_1', especie: 'loboBosque', region: 'bosque', x: 64.5, y: 60.5 },
    { uid: 'ciervo_1', especie: 'ciervo', region: 'bosque', x: 68.5, y: 85.5 },
    { uid: 'ciervo_2', especie: 'ciervo', region: 'bosque', x: 61.5, y: 71.5 },
    { uid: 'espiritu_bosque_1', especie: 'espirituBosque', region: 'bosque', x: 83.5, y: 69.5, apodo: 'Lumen', agua: { x: 81.5, y: 71.5 } },
    { uid: 'bestia_arena_1', especie: 'bestiaArena', region: 'desierto', x: 64.5, y: 260.5 },
    { uid: 'escorpion_1', especie: 'escorpion', region: 'desierto', x: 68.5, y: 274.5 },
    { uid: 'lagarto_1', especie: 'lagartoArena', region: 'desierto', x: 78.5, y: 268.5 },
    { uid: 'lagarto_curioso_1', especie: 'lagartoArena', region: 'desierto', x: 89.5, y: 258.5, apodo: 'Solín', temperamento: 'amistosa', agua: { x: 89.5, y: 256.5 } },
    { uid: 'lobo_nieve_1', especie: 'loboNieve', region: 'nieve', x: 320.5, y: 44.5 },
    { uid: 'yeti_1', especie: 'yeti', region: 'nieve', x: 322.5, y: 52.5 },
    { uid: 'hielo_timido_1', especie: 'criaturaHielo', region: 'nieve', x: 332.5, y: 62.5 },
    { uid: 'espiritu_hielo_1', especie: 'espirituHielo', region: 'nieve', x: 324.5, y: 66.5, apodo: 'Nix' },
    { uid: 'serpiente_agua_1', especie: 'serpienteAgua', region: 'lago', x: 360.5, y: 232.5 },
    { uid: 'nutria_1', especie: 'nutria', region: 'lago', x: 368.5, y: 219.5, apodo: 'Onda', agua: { x: 368.5, y: 224.5 } },
    { uid: 'tortuga_1', especie: 'tortugaLago', region: 'lago', x: 382.5, y: 240.5 },
    { uid: 'ajolote_1', especie: 'ajolote', region: 'lago', x: 240.5, y: 313.5, apodo: 'Rosal', agua: { x: 244.5, y: 316.5 } }
  ],
  REGION_NOMBRE: { bosque: 'el Bosque Susurrante', desierto: 'el Desierto de Sal', nieve: 'la Montaña Brumosa (nieve)', lago: 'el Lago Brisa Azul y la Laguna Serena' },
  // ¿En qué región del continente continuo cae un punto? (mismas cajas que usa U.Vida para sus rutas)
  regionEn(x, y) {
    if (x >= 336 && x <= 400 && y >= 210 && y <= 252) return 'lago';
    if (x >= 226 && x <= 272 && y >= 302 && y <= 338) return 'lago';
    if (x >= 292 && x < 372 && y >= 30 && y < 96) return 'nieve';
    if (x >= 36 && x < 116 && y >= 40 && y < 104) return 'bosque';
    if (x >= 38 && x < 124 && y >= 238 && y < 304) return 'desierto';
    return 'campos';
  },
  // Deja la posición en una celda caminable cercana (sin sólidos; el agua solo si la especie es acuática).
  asegurarLibre(m, x, y, acuatica) {
    const T = U.Grid.T;
    const libre = (cx, cy) => { if (cx < 1 || cy < 1 || cx >= m.ancho - 1 || cy >= m.alto - 1) return false; const t = m.tiles[cy * m.ancho + cx]; if (t === T.AGUA) return !!acuatica; return m.solidos[cy * m.ancho + cx] !== 1; };
    if (libre(Math.floor(x), Math.floor(y))) return { x, y };
    for (let r = 1; r <= 6; r++) for (let cy = Math.floor(y) - r; cy <= Math.floor(y) + r; cy++) for (let cx = Math.floor(x) - r; cx <= Math.floor(x) + r; cx++) if (Math.max(Math.abs(cx - Math.floor(x)), Math.abs(cy - Math.floor(y))) === r && libre(cx, cy)) return { x: cx + 0.5, y: cy + 0.5 };
    return { x, y };
  },
  crearTodas(m) {
    return this.INSTANCIAS.map(def => {
      const sp = this.ESPECIES[def.especie];
      const pos = this.asegurarLibre(m, def.x, def.y, !!sp.acuatica);
      const temp = def.temperamento || sp.temperamento;
      return { tipo: 'criatura', uid: def.uid, especie: def.especie, nombre: sp.nombre, apodo: def.apodo || null, region: def.region, temperamento: temp, elemento: sp.elemento, sprite: sp.sprite, color: sp.color, color2: sp.color2, escala: sp.escala || 1, acuatica: !!sp.acuatica,
        stats: { vida: sp.vida, esencia: 30, ataque: sp.ataque, defensa: sp.defensa, mente: sp.mente, velocidad: sp.velocidad }, vida: sp.vida,
        x: pos.x, y: pos.y, home: { x: pos.x, y: pos.y }, agua: def.agua || null, dir: { x: 0, y: 1 }, anim: Math.random() * 4, moviendo: false, flash: 0,
        estado: 'vaga', objetivo: null, rutinaT: 2 + Math.random() * 5, cdAtaque: 0, respawnT: 0, vinculo: temp === 'amistosa' ? 25 : temp === 'timida' ? 10 : 0, charlasSesion: 0, invocada: false, w: 1, h: 1 };
    });
  },
  buscar(uid) { const E = U.Juego.estado; if (!E || !E.criaturas) return null; return E.criaturas.find(c => c.uid === uid) || null; },
  nombreDe(c) { return c.apodo ? c.apodo + ' · ' + c.nombre : c.nombre; },
  // Mover respetando el grid; las acuáticas cruzan el agua como los NPC que deciden cruzarla
  // (el agua se vuelve no-sólida solo durante su paso y se restaura al terminar).
  mover(c, m, dx, dy) {
    if (!c.acuatica) { U.Grid.mover(m, c, dx, dy); return; }
    const T = U.Grid.T; const tocados = [];
    for (let i = 0; i < m.tiles.length; i++) if (m.tiles[i] === T.AGUA && m.solidos[i] === 1) { m.solidos[i] = 0; tocados.push(i); }
    U.Grid.mover(m, c, dx, dy);
    tocados.forEach(i => { if (m.tiles[i] === T.AGUA) m.solidos[i] = 1; });
  },
  hayHostilCerca(j, dist) { const E = U.Juego.estado; if (!E || !E.criaturas) return false; return E.criaturas.some(c => c.vida > 0 && c.temperamento === 'hostil' && !c.invocada && U.Grid.dist(c, j) < dist); },
  // ===== VÍNCULO Y CONTRATOS =====
  ganarVinculo(c, n) { const antes = c.vinculo; c.vinculo = Math.max(0, Math.min(100, c.vinculo + n)); return c.vinculo - antes; },
  nivelVinculo(c) { return c.vinculo >= 100 ? 'VÍNCULO MÁXIMO' : c.vinculo >= 60 ? 'CONFIANZA ALTA' : c.vinculo >= 35 ? 'CONFIANZA' : c.vinculo >= 15 ? 'CURIOSIDAD' : 'DESCONFIANZA'; },
  tieneContrato(c) { const E = U.Juego.estado; if (!E || !E.contratos) return null; if (E.contratos.alma === c.uid) return 'alma'; if (E.contratos.sangre.indexOf(c.uid) >= 0) return 'sangre'; return null; },
  formarSangre(c) {
    const E = U.Juego.estado; if (!E || !E.contratos) return 'sin mundo';
    if (this.tieneContrato(c)) return 'ya';
    if (c.vinculo < 60) return 'vinculo';
    if (E.contratos.sangre.length >= 3) return 'lleno';
    E.contratos.sangre.push(c.uid); this.contratoSangre = E.contratos.sangre.slice();
    return 'ok';
  },
  formarAlma(c) {
    const E = U.Juego.estado; if (!E || !E.contratos) return 'sin mundo';
    if (E.contratos.alma === c.uid) return 'ya';
    if (E.contratos.alma) return 'ocupado';
    if (c.vinculo < 100) return 'vinculo';
    E.contratos.alma = c.uid; this.contratoAlma = c.uid;
    this.guardarAlmaPasaporte(c);
    return 'ok';
  },
  // El contrato de alma CRUZA VIDAS: vive en el pasaporte del usuario (su propio guardado
  // local, aparte del de la vida actual), como ya preveía U.Portal.
  CLAVE_ALMA: 'unipar_pasaporte_alma_v1',
  guardarAlmaPasaporte(c) { try { localStorage.setItem(this.CLAVE_ALMA, JSON.stringify({ uid: c.uid, especie: c.especie, apodo: c.apodo || null })); } catch (e) { /* sin almacenamiento: el alma vive en la partida actual */ } },
  leerAlmaPasaporte() { try { const s = localStorage.getItem(this.CLAVE_ALMA); if (s) { const d = JSON.parse(s); if (d && d.uid) return d; } } catch (e) { /* sin almacenamiento */ } return null; },
  aplicarAlmaPasaporte() {
    const E = U.Juego.estado; if (!E || !E.contratos || E.contratos.alma) return;
    const p = this.leerAlmaPasaporte(); if (!p) return;
    const c = this.buscar(p.uid); if (!c) return;
    E.contratos.alma = c.uid; this.contratoAlma = c.uid; c.vinculo = 100;
    setTimeout(() => { if (U.HUD) U.HUD.toast('🕯 Tu contrato de alma cruza vidas: ' + this.nombreDe(c) + ' te reconoce en esta vida nueva (vínculo máximo). Está en ' + (this.REGION_NOMBRE[c.region] || 'su región') + '.', 'exito'); }, 4200);
  },
  invocar(c) {
    const E = U.Juego.estado; if (!this.tieneContrato(c)) return false;
    c.invocada = true; c.vida = Math.max(c.vida, 1); c.respawnT = 0;
    const j = E.jugador; const pos = this.asegurarLibre(E.mapa, j.x + 1.6, j.y + 0.6, c.acuatica); c.x = pos.x; c.y = pos.y; c.estado = 'companera';
    if (U.Combate) U.Combate.particulas(c.x, c.y - 0.5, 16, c.color, 'chispa');
    if (U.Audio) U.Audio.sfx('yang');
    return true;
  },
  despedir(c) { c.invocada = false; c.estado = 'vaga'; c.objetivo = null; const pos = this.asegurarLibre(U.Juego.estado.mapa, c.home.x, c.home.y, c.acuatica); c.x = pos.x; c.y = pos.y; },
  // ===== DAÑO (la golpean tus Yin/Yang/técnicas, como a un enemigo) =====
  danar(c, base, elemento, o) {
    o = o || {}; const E = U.Juego.estado; if (!E || c.vida <= 0) return;
    let d = U.Estadisticas.formulaDaño(base, c.stats.defensa); const mult = U.Elementos.multiplica(elemento, c.elemento); d = Math.max(1, Math.round(d * mult));
    c.vida -= d; c.flash = 0.12; E.resumen.daño += d;
    if (U.Combate) { U.Combate.texto(c, '-' + d, elemento ? U.Elementos.color(elemento) : '#ffd08a', 1); U.Combate.particulas(c.x, c.y - 0.5, 6, c.color, 'chispa'); }
    if (c.temperamento !== 'hostil') { this.ganarVinculo(c, -10); c.estado = 'huye'; c.rutinaT = 2.5; if (U.HUD) U.HUD.toast('Golpeaste a ' + c.nombre + (c.temperamento === 'amistosa' ? ': su vínculo contigo cae −10.' : ', una criatura tímida: sale huyendo.'), 'peligro'); }
    else c.estado = 'persigue';
    if (c.vida <= 0) this.morir(c);
  },
  morir(c) {
    const E = U.Juego.estado; c.vida = 0; c.respawnT = 120; c.invocada = false; E.resumen.bajas++;
    if (U.Combate) { U.Combate.particulas(c.x, c.y - 0.5, 18, c.color, 'chispa'); U.Combate.texto(c, 'CAÍDA', '#e8dcc8', 1); }
    if (U.Audio) U.Audio.sfx('muerte');
    E.orbes.push({ x: c.x, y: c.y, t: 12 });
    if (c.temperamento === 'hostil') { const premio = 5 + Math.floor(Math.random() * 5); E.jugador.monedas = (E.jugador.monedas || 0) + premio; if (U.Combate) U.Combate.texto(c, '+' + premio + ' 🪙', '#ffe14d', 1); }
    if (c.temperamento === 'amistosa') this.ganarVinculo(c, -20);
  },
  // Impacto de un ataque del jugador (celdas y/o arco continuo, igual que con los enemigos).
  impactoJugador(celdas, o) {
    const E = U.Juego.estado; if (!E || !E.criaturas) return 0;
    let n = 0;
    E.criaturas.forEach(c => { if (c.vida <= 0 || c.invocada) return; if ((celdas && U.Grid.enCeldas(celdas, c)) || (o.arco && U.Grid.enArco(o.arco.x, o.arco.y, o.arco.dir, o.arco.alcance, c))) { n++; this.danar(c, o.dmg, o.elemento || null, o); } });
    return n;
  },
  // ===== RUTINAS Y TEMPERAMENTOS =====
  actualizar(dt) {
    const E = U.Juego.estado; if (!E || !E.criaturas || E.mapaId !== 'aldea') return;
    const j = E.jugador, m = E.mapa;
    E.criaturas.forEach(c => {
      c.flash = Math.max(0, c.flash - dt); c.cdAtaque = Math.max(0, c.cdAtaque - dt);
      if (c.vida <= 0) { c.respawnT -= dt; c.moviendo = false; if (c.respawnT <= 0) { const pos = this.asegurarLibre(m, c.home.x, c.home.y, c.acuatica); c.x = pos.x; c.y = pos.y; c.vida = c.stats.vida; c.estado = 'vaga'; if (U.Combate && U.Grid.dist(c, j) < 9) U.Combate.particulas(c.x, c.y - 0.5, 8, c.color, 'humo'); } return; }
      const d = U.Grid.dist(c, j);
      const sp = this.ESPECIES[c.especie];
      let destino = null, vel = 0, corriendo = false;
      if (c.invocada) {
        // COMPAÑERA INVOCADA: te sigue y pelea a tu lado contra los enemigos cercanos.
        // Si se queda muy atrás (un bosque cerrado, un río), el vínculo la trae de vuelta a tu lado.
        if (d > 14) { const posC = this.asegurarLibre(m, j.x - 1.5, j.y + 0.5, c.acuatica); c.x = posC.x; c.y = posC.y; if (U.Combate) U.Combate.particulas(c.x, c.y - 0.5, 8, c.color, 'chispa'); }
        const enemigo = (U.Combate ? U.Combate.vivos() : []).filter(e => U.Grid.dist(e, c) < 4.5).sort((a, b) => U.Grid.dist(a, c) - U.Grid.dist(b, c))[0];
        if (enemigo) { destino = enemigo; vel = 2.9; corriendo = true;
          if (U.Grid.dist(c, enemigo) < 1.25 && c.cdAtaque <= 0) { c.cdAtaque = 1.2; c.dir = U.Grid.dir8(enemigo.x - c.x, enemigo.y - c.y); U.Combate.dañoEnemigo(enemigo, c.stats.ataque * 2.4, c.elemento, { desafio: U.Combate.desafio(enemigo) }); } }
        else if (d > 2.1) { destino = { x: j.x - j.dir.x * 1.5, y: j.y - j.dir.y * 1.5 }; vel = d > 6 ? 3.6 : 2.4; corriendo = d > 6; }
      } else if (c.temperamento === 'hostil' && d < (sp.vision || 4.5)) {
        // HOSTIL: te vio o te acercaste — te persigue y te ataca; peleas con ella o huyes.
        c.estado = 'persigue'; destino = j; vel = 2.7; corriendo = true;
        if (d < 1.35 && c.cdAtaque <= 0) { c.cdAtaque = 1.5; c.dir = U.Grid.dir8(j.x - c.x, j.y - c.y); if (U.Combate) { U.Combate.texto(c, '¡' + c.nombre.toUpperCase() + ' ATACA!', '#ff4d4d', 1); U.Combate.dañoJugador(c.stats.ataque * 1.1, c, null, { elemento: null, proyectil: false, ox: c.x, oy: c.y }); } if (U.Audio) U.Audio.sfx('golpe'); }
      } else if (c.temperamento === 'timida' && d < (sp.huida || 3)) {
        // TÍMIDA: huye si te acercas.
        c.estado = 'huye'; const ax = c.x + (c.x - j.x), ay = c.y + (c.y - j.y); destino = { x: ax, y: ay }; vel = 2.5; corriendo = true;
      } else if (c.estado === 'huye' && c.temperamento !== 'hostil') {
        if (d > 5.5) { c.estado = 'vaga'; c.rutinaT = 1; } else { destino = { x: c.x + (c.x - j.x), y: c.y + (c.y - j.y) }; vel = 2.5; corriendo = true; }
      } else if (c.temperamento === 'amistosa' && d < 4 && d > 1.8) {
        // AMISTOSA/CURIOSA: se acerca a mirarte; de cerca se queda y te deja hablarle.
        c.estado = 'curiosa'; destino = j; vel = 1.1;
      } else {
        // RUTINA como la de los NPC: vaga por su hogar, descansa, va al agua, caza (hostiles).
        c.rutinaT -= dt;
        if (c.rutinaT <= 0) {
          const r = Math.random();
          if (c.agua && r < 0.3) { c.estado = 'agua'; c.objetivo = { x: c.agua.x, y: c.agua.y }; c.rutinaT = 14; }
          else if (r < 0.52) { c.estado = 'descansa'; c.objetivo = null; c.rutinaT = 3.5 + Math.random() * 4; }
          else { c.estado = c.temperamento === 'hostil' && r > 0.85 ? 'caza' : 'vaga'; const ang = Math.random() * Math.PI * 2, rad = 2.5 + Math.random() * 5.5; c.objetivo = { x: c.home.x + Math.cos(ang) * rad, y: c.home.y + Math.sin(ang) * rad }; c.rutinaT = 8 + Math.random() * 7; }
        }
        if (c.estado === 'descansa') { vel = 0; if (Math.random() < dt * 0.25 && U.Combate) U.Combate.texto(c, 'Z', '#9fb3d9', 1); }
        else if (c.objetivo) { destino = c.objetivo; vel = c.estado === 'caza' ? 2.1 : 1.05; if (U.Grid.dist(c, c.objetivo) < 0.5) { c.objetivo = null; c.rutinaT = Math.min(c.rutinaT, 1.5); } }
      }
      if (destino && vel > 0) {
        const dx = destino.x - c.x, dy = destino.y - c.y, dd = Math.hypot(dx, dy);
        if (dd > 0.12) { c.dir = U.Grid.dir8(dx, dy); this.mover(c, m, dx / dd * vel * dt, dy / dd * vel * dt); c.moviendo = true; c.anim += dt * (corriendo ? 2.2 : 1.2); }
        else c.moviendo = false;
      } else c.moviendo = false;
      // Separación suave entre criaturas cercanas (que no se encimen)
      E.criaturas.forEach(o2 => { if (o2 !== c && o2.vida > 0) { const sx = c.x - o2.x, sy = c.y - o2.y, sd = Math.hypot(sx, sy); if (sd < 0.7 && sd > 0.001) this.mover(c, m, sx / sd * dt * 0.8, sy / sd * dt * 0.8); } });
    });
  }
};
