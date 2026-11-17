/* === js/sistemas/escondites.js === */
/* Unipar — ESCONDITES SECRETOS DE LAS ORGANIZACIONES: cada organización criminal
   tiene VARIOS escondites repartidos por el continente grande (esa es una de las
   razones de que el mapa sea grande): jaulas y corrales de la Red de Jade, bóvedas
   y almacenes de los Coleccionistas, cámaras y refugios de los que drenan dominio,
   y los dos lugares de la organización sin nombre. Son SECRETOS de verdad: NO están
   marcados en el mapa ni en el minimapa al empezar, no aparecen en ninguna lista y
   sus guardias no existen hasta que los descubres. Se descubren por RUMORES de los
   NPC (dos rumores del mismo escondite lo marcan), EXPLORANDO (acercarte caminando
   por zonas escondidas), SIGUIENDO a un miembro de la organización (quedarte cerca
   de Sana, Dario o Petra un rato) o por NOTAS/mapas que se encuentran en otro
   escondite. Al descubrir uno aparecen sus guardias: derríbalos y toca el escondite
   para SAQUEAR su botín (monedas, pociones, comida, pergaminos prohibidos y notas).
   Los de la organización secreta son LOS MÁS DIFÍCILES: ni los rumores ni la
   exploración los revelan hasta que avanzaste mucho (ver puedeRevelarse). */
window.U = window.U || {};

U.Escondites = {
  DEFS: [
    { id: 'jadeDesierto', org: 'jade', nombre: 'Jaula del Desierto', x: 102, y: 284, color: '#67e08a', guardias: ['bandido', 'chaman'], guardiaNom: 'Cazador de la Red de Jade', monedas: 90, pocion: 'vida',
      zona: 'el Desierto de Sal, lejos al sureste del oasis, entre dunas sin camino',
      desc: 'Jaulas de red verde entre las dunas: corrales donde la Red de Jade guarda las criaturas capturadas antes de venderlas. Huele a cebo, a cuero y a miedo animal.',
      rumor: 'Dicen que la Red de Jade tiene un escondite en el desierto, lejos al sureste del oasis: jaulas y corrales entre dunas donde ni el camino llega. Las criaturas capturadas pasan ahí la noche antes de que las vendan.' },
    { id: 'jadeBosque', org: 'jade', nombre: 'Refugio del Bosque', x: 52, y: 54, color: '#67e08a', guardias: ['bandido', 'bandido'], guardiaNom: 'Cazador de la Red de Jade', monedas: 70, comida: 2,
      zona: 'el Bosque Susurrante, al fondo del noroeste, lejos del sendero',
      desc: 'Un campamento escondido entre los árboles más cerrados del bosque: redes colgadas a secar, trampas desarmadas y una fogata que nunca se deja humear de día.',
      rumor: 'Un leñador jura que en el fondo del Bosque Susurrante, lejos del sendero, hay un campamento que no sale en ningún mapa: redes verdes colgadas entre los árboles. La Red de Jade duerme ahí cuando caza por el bosque.' },
    { id: 'jadeMontana', org: 'jade', nombre: 'Guarida de la Montaña', x: 350, y: 80, color: '#67e08a', guardias: ['chaman', 'veterano'], guardiaNom: 'Cazador de la Red de Jade', monedas: 120, pocion: 'esencia',
      zona: 'la Montaña Brumosa, en su ladera este, en altura',
      desc: 'Una guarida en altura, entre rocas de la ladera este: desde aquí la Red vigila los pasos de montaña y esconde lo que caza en las cumbres, donde nadie sube a curiosear.',
      rumor: 'Cuentan que la Red de Jade tiene una guarida en la Montaña Brumosa, en la ladera este, bien arriba: un escondite en altura desde donde vigilan los pasos. A esa altura nadie sube a curiosear.' },
    { id: 'coleRuinas', org: 'cole', nombre: 'Bóveda de las Ruinas', x: 172, y: 128, color: '#d9a441', guardias: ['veterano', 'bandido'], guardiaNom: 'Guardián de los Coleccionistas', monedas: 150,
      zona: 'las ruinas viejas de los campos del noroeste, al sur del Mirador',
      desc: 'Bajo las piedras caídas hay una bóveda con puerta de hierro: aquí los Coleccionistas guardan los artefactos robados mientras esperan comprador en la Metrópolis.',
      rumor: 'Dicen que los Coleccionistas guardan sus cosas en unas ruinas viejas de los campos del noroeste: una bóveda bajo las piedras, llena de artefactos robados esperando comprador.' },
    { id: 'colePuerto', org: 'cole', nombre: 'Almacén del Puerto', x: 400, y: 210, color: '#d9a441', guardias: ['bandido', 'veterano'], guardiaNom: 'Guardián de los Coleccionistas', monedas: 110, notas: 'coleCueva',
      zona: 'el este de Puerto Brisa Azul, pegado a la orilla, con pinta de almacén normal',
      desc: 'Parece un almacén más del puerto: cajas, redes y pescado seco. Pero la mitad de las cajas tienen doble fondo, y lo que guardan no huele a pescado: huele a ruina y a pergamino viejo.',
      rumor: 'Junto a Puerto Brisa Azul hay un almacén que parece de lo más normal… demasiado normal. Dicen que es una fachada: los Coleccionistas guardan ahí lo robado antes de moverlo, entre cajas con doble fondo.' },
    { id: 'coleCueva', org: 'cole', nombre: 'Cueva del Tesoro', x: 118, y: 146, color: '#d9a441', guardias: ['veterano', 'chaman'], guardiaNom: 'Guardián de los Coleccionistas', monedas: 200, pergamino: 'invocacion',
      zona: 'una cueva de las lomas entre Arcana y Pueblo Alto Pino',
      desc: 'La cueva donde los Coleccionistas esconden sus objetos MÁS valiosos: piezas únicas y, sellado en una caja de plomo, un pergamino de técnica prohibida. Lo mejor de su colección no se vende en ningún pueblo: se guarda aquí.',
      rumor: 'El tesoro de verdad de los Coleccionistas no está en ningún almacén: está en una cueva de las lomas entre Arcana y Alto Pino. Ahí guardan sus objetos más valiosos… incluidos pergaminos de técnicas prohibidas.' },
    { id: 'manoCamara', org: 'mano', nombre: 'Cámara del Vacío', x: 296, y: 336, color: '#8b93a3', guardias: ['veterano', 'brasa'], guardiaNom: 'Élite del guante negro', guante: true, monedas: 130, pocion: 'vida',
      zona: 'la Tierra Quemada, al oeste de Aldea Ceniza Viva, bajo la ceniza',
      desc: 'Una cámara subterránea bajo la ceniza: sillas con correas, marcas de uñas en la piedra y un silencio raro, como si el lugar mismo hubiera quedado VACÍO. Aquí drenan el dominio de sus víctimas.',
      rumor: 'En la Tierra Quemada, al oeste de Ceniza Viva, hay quien ha oído gritos bajo la ceniza… y luego nada. Dicen que los que drenan dominio tienen ahí una cámara subterránea donde retienen a sus víctimas.' },
    { id: 'manoNiebla', org: 'mano', nombre: 'Refugio de la Niebla', x: 320, y: 88, color: '#8b93a3', guardias: ['brasa', 'ilusionista'], guardiaNom: 'Élite del guante negro', guante: true, monedas: 100,
      zona: 'el pie brumoso de la Montaña, junto a la orilla oeste del Río del Este',
      desc: 'Un refugio al pie de la montaña, donde la bruma baja del río y lo tapa todo: quien no sabe que está aquí, pasa de largo a diez pasos sin verlo.',
      rumor: 'Al pie de la Montaña Brumosa, junto al Río del Este, la niebla esconde algo: un refugio de los del guante negro, tan tapado por la bruma que se pasa de largo sin verlo.' },
    { id: 'manoTorre', org: 'mano', nombre: 'Torre Oscura', x: 404, y: 148, color: '#8b93a3', guardias: ['veterano', 'veterano', 'brasa'], guardiaNom: 'Élite del guante negro', guante: true, monedas: 180, notas: 'secSantuario',
      zona: 'el extremo este del continente, pasado Aldea Chispa Alta',
      desc: 'Una torre en ruinas en el extremo este del continente: la base principal de los que drenan dominio. Desde su alto vigilan los caminos del Rayo, y en su sótano esperan las sillas vacías.',
      rumor: 'La base principal de los que drenan dominio es una torre en ruinas, en el extremo este del continente, pasado Chispa Alta. La llaman la Torre Oscura, y nadie del rumbo se acerca ni por apuesta.' },
    { id: 'secSantuario', org: 'secreta', nombre: 'Santuario del Sello', x: 206, y: 96, color: '#e8a2e0', guardias: ['ilusionista', 'veterano'], guardiaNom: 'Agente sin nombre', monedas: 220, notas: 'secVacio',
      zona: 'las ruinas sin nombre al sur de Aldea Vuelo Alto',
      desc: 'Un santuario roto junto a las ruinas sin nombre: velas negras, círculos grabados en la piedra y herramientas hechas para una sola cosa: trabajar sobre el SELLO, despacio, para debilitarlo.',
      rumor: 'En voz bajísima: junto a las ruinas sin nombre al sur de Vuelo Alto hay un santuario donde gente sin insignia trabaja sobre el sello… para debilitarlo. Nadie sabe de quiénes son. Nadie.' },
    { id: 'secVacio', org: 'secreta', nombre: 'Escondite del Vacío', x: 56, y: 336, color: '#e8a2e0', guardias: ['ilusionista', 'veterano', 'veterano'], guardiaNom: 'Agente sin nombre', monedas: 300, pocion: 'esencia', radio: 2.0,
      zona: 'el rincón más perdido del suroeste del continente, donde no llega ningún camino',
      desc: 'El lugar más escondido del continente: sin camino, sin humo, sin nombre. El último refugio de la organización que no tiene nombre — solo se llega a saber de él cuando ya se sabe casi todo lo demás.',
      rumor: 'El rumor que casi no es rumor: en el rincón más perdido del suroeste, donde no llega ningún camino, la organización sin nombre guarda su último refugio. Quien lo nombra en voz alta, baja la voz a mitad de frase.' }
  ],
  def(id) { return this.DEFS.find(d => d.id === id) || null; },
  asegurar() {
    const E = U.Juego && U.Juego.estado; if (!E) return null;
    if (U.Orgs) U.Orgs.asegurar();
    if (!E.orgs) return null;
    if (!E.orgs.escondites) E.orgs.escondites = {};
    const S = E.orgs.escondites;
    this.DEFS.forEach(d => { if (!S[d.id]) S[d.id] = { descubierto: false, rumores: 0, spawned: false, saqueado: false, guardias: 0 }; });
    return S;
  },
  est(id) { const S = this.asegurar(); return S ? S[id] : null; },
  // LOS DE LA ORG SECRETA SON LOS MÁS DIFÍCILES DE ENCONTRAR: ni rumores ni
  // exploración los revelan hasta avanzar mucho; el Escondite del Vacío, ni eso:
  // exige además rumores altos de la secreta, dos organizaciones frenadas o 70% de maestría.
  puedeRevelarse(def) {
    if (!def || def.org !== 'secreta') return true;
    if (!U.Orgs || !U.Orgs.secretaDesbloqueada()) return false;
    if (def.id === 'secSantuario') return true;
    const E = U.Juego.estado, O = E.orgs;
    return (O.secreta && (O.secreta.rumores || 0) >= 2) || U.Orgs.frenadas() >= 2 || U.Orgs.maxMaestria(E.jugador) >= 70;
  },
  colocar() {
    const E = U.Juego.estado; if (!E || E.mapaId !== 'aldea' || !E.mapa || !U.Reliquias) return;
    const S = this.asegurar(); if (!S) return;
    this.DEFS.forEach(d => {
      let o = E.mapa.objetos.find(x => x.tipo === 'escondite' && x.esconditeId === d.id);
      if (!o) { const pos = U.Reliquias.celdaLibre(E.mapa, d.x, d.y); o = { tipo: 'escondite', esconditeId: d.id, color: d.color, x: pos.x, y: pos.y, w: 1, h: 1, solido: false }; E.mapa.objetos.push(o); }
      o.descubierto = !!S[d.id].descubierto; o.saqueado = !!S[d.id].saqueado;
    });
  },
  objDe(id) { const E = U.Juego.estado; if (!E || !E.mapa) return null; return E.mapa.objetos.find(x => x.tipo === 'escondite' && x.esconditeId === id) || null; },
  descubrir(id, via) {
    const E = U.Juego.estado, S = this.asegurar(), d = this.def(id), s = S ? S[id] : null;
    if (!d || !s || s.descubierto) return false;
    s.descubierto = true;
    if (d.org !== 'secreta' && U.Orgs) U.Orgs.darPista(d.org, 1);
    U.HUD.banner('🗺 ¡ESCONDITE DESCUBIERTO! · ' + d.nombre.toUpperCase(), 3);
    U.HUD.toast(d.desc + ' (Descubierto ' + via + '. Queda MARCADO en tu mapa y minimapa con el color de su organización. Sus guardias ya saben que estás aquí: derríbalos y toca el escondite para saquear el botín.)', 'aviso');
    U.Audio.sfx('unlock');
    this.spawnGuardias(d);
    if (U.Guardado) U.Guardado.guardarAuto();
    return true;
  },
  darPistaEscondite(id, n) {
    const d = this.def(id), s = this.est(id); if (!d || !s || s.descubierto) return;
    if (!this.puedeRevelarse(d)) { if (d.org === 'secreta') return; }
    s.rumores += (n || 1);
    if (s.rumores >= 2) this.descubrir(id, 'por las notas y mapas que encontraste');
    else U.HUD.toast('📜 Unas notas mencionan un lugar: ' + d.nombre + ' estaría en ' + d.zona + '. Todavía es solo una pista (1/2): otro rumor o acercarte por allí lo confirmará.', 'aviso');
  },
  spawnGuardias(d) {
    const E = U.Juego.estado, s = this.est(d.id); if (!s || s.spawned || s.saqueado) return;
    const o = this.objDe(d.id); const cx = o ? o.x : d.x, cy = o ? o.y : d.y;
    s.spawned = true; s.guardias = 0;
    d.guardias.forEach((clase, i) => {
      const c = U.Reliquias.celdaLibre(E.mapa, cx + (i % 2 ? 2 : -2), cy + (i < 2 ? 1 : -2));
      const e = U.Combate.crearEnemigo(clase, c.x + 0.5, c.y + 0.5, E.dificultad * (d.org === 'secreta' ? 1.3 : 1.15));
      e.nombre = d.guardiaNom + ' · ' + d.nombre; e.esOrg = 'escondite'; e.esconditeId = d.id;
      if (d.guante) e.guanteNegro = true;
      E.enemigos.push(e); s.guardias++;
      U.Combate.particulas(e.x, e.y - 0.5, 10, d.color, 'humo');
    });
    if (s.guardias) { U.HUD.banner('⚔ ¡GUARDIAS DEL ESCONDITE! · ' + d.nombre.toUpperCase(), 2.2); U.Audio.sfx('oleada'); }
  },
  guardiaCaido(e) {
    const s = this.est(e.esconditeId); if (!s) return;
    s.guardias = Math.max(0, (s.guardias || 1) - 1);
    const d = this.def(e.esconditeId);
    if (s.guardias <= 0 && d) U.HUD.toast('Los guardias de ' + d.nombre + ' cayeron. Toca el escondite para SAQUEAR su botín.', 'exito');
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  guardiasVivos(id) { const E = U.Juego.estado; return E.enemigos.some(e => e.vida > 0 && e.esOrg === 'escondite' && e.esconditeId === id); },
  interactuar(obj) {
    const E = U.Juego.estado, j = E.jugador, d = this.def(obj.esconditeId), s = this.est(obj.esconditeId);
    if (!d || !s) return;
    if (!s.descubierto) { this.descubrir(d.id, 'explorando: llegaste caminando hasta él'); return; }
    if (this.guardiasVivos(d.id)) { U.HUD.toast('Los guardias de ' + d.nombre + ' no te van a dejar tocar nada: derríbalos primero.', 'peligro'); U.Audio.sfx('fail'); return; }
    if (s.saqueado) { U.Dialogo.mostrarTexto('🗺 ' + d.nombre.toUpperCase(), 'Ya está saqueado: quedan cajas rotas, redes cortadas y el eco de lo que guardaban. La organización lo abandonó: un escondite quemado no se vuelve a usar.'); return; }
    s.saqueado = true;
    const o = this.objDe(d.id); if (o) o.saqueado = true;
    let botin = [];
    if (d.monedas) { j.monedas = (j.monedas || 0) + d.monedas; botin.push(d.monedas + ' 🪙'); }
    if (d.pocion) { if ((j.bolsaPociones || []).length < 3) { j.bolsaPociones.push({ tipo: d.pocion, unidades: 50, precio: 0 }); botin.push('una poción de ' + (d.pocion === 'vida' ? 'Vida' : 'Esencia') + ' +50'); } else { j.monedas += 30; botin.push('30 🪙 más (tu mochila de pociones iba llena)'); } }
    if (d.comida) { let n = 0; while (n < d.comida && (j.bolsaComida || []).length < 5) { j.bolsaComida.push(U.Economia.SABORES[Math.floor(Math.random() * 5)]); n++; } if (n) botin.push(n + ' comida(s) de las provisiones'); }
    if (d.pergamino && U.Prohibidas) { const p = U.Prohibidas.asegurar(); if (p && !U.Prohibidas.tiene(d.pergamino)) { p.pergaminos.push(d.pergamino); if (p.encontradas.indexOf(d.pergamino) < 0) p.encontradas.push(d.pergamino); botin.push('💀 el PERGAMINO PROHIBIDO de ' + U.Prohibidas.DEFS[d.pergamino].nombre + ' (sin aprender: ábrelo en tu Mochila cuando quieras, con su advertencia)'); } else { j.monedas += 100; botin.push('100 🪙 más (el pergamino sellado ya no te hacía falta)'); } }
    if (d.id === 'jadeDesierto') botin.push('las criaturas de las jaulas, libres: salen corriendo hacia la sal y no miran atrás');
    U.Combate.particulas(j.x, j.y - 1, 22, d.color, 'chispa');
    U.HUD.banner('🎒 ¡ESCONDITE SAQUEADO! · ' + d.nombre.toUpperCase(), 2.8); U.Audio.sfx('victoria');
    let extra = '';
    if (d.notas) { extra = ' Entre los papeles hay NOTAS con rutas y lugares marcados: hablan de otro escondite.'; }
    U.Dialogo.mostrarTexto('🎒 BOTÍN · ' + d.nombre.toUpperCase(), 'Sin guardias, el escondite es tuyo. BOTÍN: ' + botin.join(' · ') + '.' + extra + (d.org === 'secreta' ? ' La organización sin nombre ya sabe que estuviste aquí. Eso también es un botín: miedo, del suyo.' : ''));
    if (d.notas) this.darPistaEscondite(d.notas, 1);
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  // RUMORES de escondites: los suelta cualquier NPC con la opción de rumores.
  // El primer rumor es una pista de zona; el segundo MARCA el escondite.
  rumorEscondite(npc) {
    const S = this.asegurar(); if (!S) return null;
    const cands = this.DEFS.filter(d => !S[d.id].descubierto && this.puedeRevelarse(d));
    if (!cands.length) return null;
    const d = cands[((npc.veces || 0) + ((U.Juego.estado.reloj ? U.Juego.estado.reloj.dia : 1))) % cands.length];
    const s = S[d.id]; s.rumores++;
    if (s.rumores >= 2) { this.descubrir(d.id, 'por los rumores de la gente'); return npc.nombre + ' baja la voz hasta casi desaparecer: «' + d.rumor + '» Y añade el detalle que faltaba: con dos rumores iguales, ya no es un cuento — ' + d.nombre + ' queda MARCADO en tu mapa. Sus guardias no van a regalarte el botín.'; }
    if (U.Guardado) U.Guardado.guardarAuto();
    return npc.nombre + ' mira a los lados y baja la voz: «' + d.rumor + '» (Rumor de escondite anotado, 1/2: si otro rumor coincide —o si vas tú a mirar por ' + d.zona + '— quedará marcado en tu mapa.)';
  },
  // Vera, la investigadora, puede atar UN cabo de escondites por conversación.
  vera() {
    const S = this.asegurar(); if (!S) return 'Vera no tiene nada nuevo.';
    const cands = this.DEFS.filter(d => !S[d.id].descubierto && this.puedeRevelarse(d));
    if (!cands.length) return 'Vera hojea su libreta y sonríe de medio lado: «Escondites ya no me quedan por darte: los encontraste todos, hasta los que no debían existir. El continente es grande… pero tú lo caminaste entero.»';
    const d = cands[0];
    this.darPistaEscondite(d.id, 1);
    const s = S[d.id];
    return 'Vera abre la libreta por una página llena de flechas: «Los escondites son la otra razón de que este continente sea tan grande: cada organización guarda los suyos lejos de los caminos. Tengo uno casi atado: ' + d.nombre + ', en ' + d.zona + '. ' + d.rumor + '»' + (s.descubierto ? ' (Con esto queda CONFIRMADO: ' + d.nombre + ' está marcado en tu mapa. Ve con cuidado: tiene guardias y botín.)' : ' (Es una pista firme, 1/2: un rumor más, o tus propios pies por la zona, y quedará marcado en tu mapa.)');
  },
  html() {
    const S = this.asegurar(); if (!S) return '';
    const desc = this.DEFS.filter(d => S[d.id].descubierto);
    if (!desc.length) return '<div style="font-size:12px;margin:5px 0"><b style="color:#9fb3d9">ESCONDITES SECRETOS</b><br><span style="color:var(--textoFrio)">No has descubierto ninguno. Las organizaciones guardan VARIOS escondites por el continente (jaulas, bóvedas, cámaras, refugios): no están marcados en el mapa. Se descubren por rumores de la gente, explorando zonas escondidas, siguiendo a un miembro o por notas encontradas en otro escondite.</span></div>';
    return '<div style="font-size:12px;margin:5px 0"><b style="color:#9fb3d9">ESCONDITES SECRETOS · descubiertos ' + desc.length + '/' + this.DEFS.length + '</b>' + desc.map(d => { const s = S[d.id]; return '<br><span style="color:' + d.color + '">🗺 <b>' + d.nombre + '</b></span> <span style="color:var(--textoFrio)">(' + (d.org === 'secreta' ? 'organización sin nombre' : U.Orgs.DEFS[d.org].nombre) + ' · ' + d.zona + ') · ' + (s.saqueado ? '<span style="color:var(--exito)">SAQUEADO</span>' : 'marcado en tu mapa · botín sin reclamar') + '</span>'; }).join('') + '<br><span style="color:var(--textoTenue)">Los que faltan siguen sin marcar: rumores, exploración, seguir a un miembro o notas de otro escondite. Los de la organización sin nombre son los más difíciles de encontrar.</span></div>';
  },
  tick(dt) {
    const E = U.Juego.estado; if (!E || !E.jugador || E.mapaId !== 'aldea' || E.ui !== 'mundo') return;
    const S = this.asegurar(); if (!S) return;
    this.colocar();
    const j = E.jugador;
    // EXPLORACIÓN: acercarte caminando a un escondite lo descubre (los de la
    // org secreta exigen haber avanzado mucho y, el del Vacío, acercarte más).
    for (const d of this.DEFS) {
      const s = S[d.id]; if (s.descubierto) continue;
      if (!this.puedeRevelarse(d)) continue;
      const o = this.objDe(d.id); const ox = o ? o.x + 0.5 : d.x + 0.5, oy = o ? o.y + 0.5 : d.y + 0.5;
      if (Math.hypot(j.x - ox, j.y - oy) < (d.radio || 3.2)) { this.descubrir(d.id, 'explorando: llegaste caminando hasta él'); break; }
    }
    // SEGUIR A UN MIEMBRO: quedarte cerca de Sana (Red de Jade), Dario (los que
    // drenan dominio) o Petra (Coleccionistas) unos segundos revela un escondite
    // de SU organización: los sigues la mirada, las manos y las rutas que repiten.
    this._segCd = Math.max(0, (this._segCd || 0) - dt);
    if (this._segCd <= 0) {
      const miembros = { sana: 'jade', dario: 'mano', petra: 'cole' };
      let cerca = null;
      (E.npcs || []).forEach(n => { if (miembros[n.id] && !n.enCasa && Math.hypot(n.x - j.x, n.y - j.y) < 2.6) cerca = n; });
      if (cerca) {
        if (!this._seg || this._seg.id !== cerca.id) this._seg = { id: cerca.id, t: 0 };
        this._seg.t += dt;
        if (this._seg.t >= 6) {
          const org = miembros[cerca.id];
          const d = this.DEFS.find(x => x.org === org && !S[x.id].descubierto);
          this._seg = null; this._segCd = 180;
          if (d) { U.HUD.toast('Siguiendo a ' + cerca.nombre + ' sin que se dé cuenta —sus rutas, sus miradas, los lugares que evita— atas el cabo: hay un escondite suyo que ya puedes ubicar.', 'aviso'); this.descubrir(d.id, 'siguiendo a un miembro de su organización'); }
        }
      } else this._seg = null;
    }
  }
};
