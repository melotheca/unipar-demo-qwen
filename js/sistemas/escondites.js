/* === js/sistemas/escondites.js === */
/* Unipar — ESCONDITES / GUARIDAS DE LAS ORGANIZACIONES: TEMPORALES e IMPROVISADOS.
   Cada organización criminal monta guaridas IMPROVISADAS por el continente (jaulas y
   corrales de la Red de Jade, bóvedas y almacenes de los Coleccionistas, cámaras y
   refugios de los que drenan dominio, y los dos lugares de la organización sin nombre).
   NO son fijos dentro de una partida: APARECEN Y DESAPARECEN con el tiempo — la
   organización los monta de prestado y luego se mueve. A veces salen y a veces no:
   ir a la misma zona NO garantiza que el escondite vuelva a estar ahí.
   - Los RUMORES acotan la ZONA (dos rumores del mismo escondite = zona conocida), pero
     el escondite en sí es aleatorio: puede estar o no cuando llegues.
   - LA BANDERITA (el color de la organización) solo aparece cuando el escondite ESTÁ
     presente (y su zona ya se conoce o estás cerca); si no está, no hay banderita ni
     guardias. También se descubren EXPLORANDO (acercarte caminando), SIGUIENDO a un
     miembro (quedarte cerca de Sana, Dario o Petra un rato) o por NOTAS en otra guarida.
   - Cada guarida parece una cueva normal con enemigos guardia alrededor; NO se puede
     entrar hasta derrotar a los guardias, entonces aparece la opción "ENTRAR" (tocar
     la entrada). Dentro: una cueva pequeña con un túnel, enemigos más fuertes y un JEFE
     (miembro fuerte con nombre) al final; recompensa = artefacto, máscara o dinero.
   - Las 2 MÁSCARAS de los Coleccionistas son recompensa de jefe en sus guaridas
     (coleRuinas → Máscara de la Fuerza, coleCueva → Máscara de la Mente).
   - Si limpias una guarida (derrotas al jefe y tomas la recompensa), queda ABANDONADA
     y puede aparecer OTRA en otro lado después (otro lugar aleatorio de la misma zona).
   - Dentro de una guarida NO hay minimapa ni mapa completo: el flag es E.enGuarida
     (true mientras mapaId empieza por 'guarida'); el HUD lo lee para ocultar los mapas.
   - Las guaridas aparecen PROGRESIVAMENTE conforme crece la maestría del jugador (el
     jugador no tiene nivel: se usa su maestría más alta, ver puedeAparecer).
   Los de la organización secreta son LOS MÁS DIFÍCILES: ni los rumores ni la
   exploración los revelan hasta que avanzaste mucho (ver puedeRevelarse). */
window.U = window.U || {};

U.Escondites = {
  DEFS: [
    { id: 'jadeDesierto', org: 'jade', nombre: 'Jaula del Desierto', x: 102, y: 284, color: '#67e08a', guardias: ['bandido', 'chaman'], guardiaNom: 'Cazador de la Red de Jade', maestriaMin: 0, zonaRadio: 14,
      jefe: { nombre: 'Cazador Mayor de la Red', clase: 'veterano', mult: 1.5 }, recompensa: { tipo: 'artefacto', id: 'fragmento', monedas: 120 },
      zona: 'el Desierto de Sal, lejos al sureste del oasis, entre dunas sin camino',
      desc: 'Jaulas de red verde entre las dunas: corrales donde la Red de Jade guarda las criaturas capturadas antes de venderlas. Huele a cebo, a cuero y a miedo animal.',
      rumor: 'Dicen que la Red de Jade monta un escondite en el desierto, lejos al sureste del oasis: jaulas y corrales entre dunas donde ni el camino llega. No siempre está: lo montan, cazan y se mueven.' },
    { id: 'jadeBosque', org: 'jade', nombre: 'Refugio del Bosque', x: 52, y: 54, color: '#67e08a', guardias: ['bandido', 'bandido'], guardiaNom: 'Cazador de la Red de Jade', maestriaMin: 0, zonaRadio: 12,
      jefe: { nombre: 'Guardabosques de la Red', clase: 'bandido', mult: 1.4 }, recompensa: { tipo: 'monedas', monedas: 120 },
      zona: 'el Bosque Susurrante, al fondo del noroeste, lejos del sendero',
      desc: 'Un campamento escondido entre los árboles más cerrados del bosque: redes colgadas a secar, trampas desarmadas y una fogata que nunca se deja humear de día.',
      rumor: 'Un leñador jura que en el fondo del Bosque Susurrante, lejos del sendero, la Red de Jade monta a veces un campamento que no sale en ningún mapa: redes verdes colgadas entre los árboles. Unas semanas está y otras no.' },
    { id: 'jadeMontana', org: 'jade', nombre: 'Guarida de la Montaña', x: 350, y: 80, color: '#67e08a', guardias: ['chaman', 'veterano'], guardiaNom: 'Cazador de la Red de Jade', maestriaMin: 10, zonaRadio: 12,
      jefe: { nombre: 'Vigía de la Cumbre', clase: 'chaman', mult: 1.55 }, recompensa: { tipo: 'artefacto', id: 'cristal', monedas: 140 },
      zona: 'la Montaña Brumosa, en su ladera este, en altura',
      desc: 'Una guarida en altura, entre rocas de la ladera este: desde aquí la Red vigila los pasos de montaña y esconde lo que caza en las cumbres, donde nadie sube a curiosear.',
      rumor: 'Cuentan que la Red de Jade monta a veces una guarida en la Montaña Brumosa, en la ladera este, bien arriba: un escondite en altura desde donde vigilan los pasos. A esa altura nadie sube a curiosear… y ellos lo saben, por eso se mueven.' },
    { id: 'coleRuinas', org: 'cole', nombre: 'Bóveda de las Ruinas', x: 172, y: 128, color: '#d9a441', guardias: ['veterano', 'bandido'], guardiaNom: 'Guardián de los Coleccionistas', maestriaMin: 10, zonaRadio: 13,
      jefe: { nombre: 'Tasador de las Ruinas', clase: 'veterano', mult: 1.6 }, recompensa: { tipo: 'mascara', id: 'fuerza', monedas: 150 },
      zona: 'las ruinas viejas de los campos del noroeste, al sur del Mirador',
      desc: 'Bajo las piedras caídas hay una bóveda con puerta de hierro: aquí los Coleccionistas guardan los artefactos robados mientras esperan comprador en la Metrópolis. Su jefe guarda, además, una de las máscaras legendarias.',
      rumor: 'Dicen que los Coleccionistas montan su bóveda en unas ruinas viejas de los campos del noroeste: una bóveda bajo las piedras, llena de artefactos robados esperando comprador. Y que su jefe guarda ahí una MÁSCARA legendaria: la de la Fuerza.' },
    { id: 'colePuerto', org: 'cole', nombre: 'Almacén del Puerto', x: 400, y: 210, color: '#d9a441', guardias: ['bandido', 'veterano'], guardiaNom: 'Guardián de los Coleccionistas', maestriaMin: 15, zonaRadio: 12,
      jefe: { nombre: 'Contrabandista del Puerto', clase: 'veterano', mult: 1.55 }, recompensa: { tipo: 'monedas', monedas: 200 },
      zona: 'el este de Puerto Brisa Azul, pegado a la orilla, con pinta de almacén normal',
      desc: 'Parece un almacén más del puerto: cajas, redes y pescado seco. Pero la mitad de las cajas tienen doble fondo, y lo que guardan no huele a pescado: huele a ruina y a pergamino viejo.',
      rumor: 'Junto a Puerto Brisa Azul hay un almacén que parece de lo más normal… demasiado normal. Dicen que es una fachada que los Coleccionistas montan y desmontan: guardan ahí lo robado antes de moverlo, entre cajas con doble fondo.' },
    { id: 'coleCueva', org: 'cole', nombre: 'Cueva del Tesoro', x: 118, y: 146, color: '#d9a441', guardias: ['veterano', 'chaman'], guardiaNom: 'Guardián de los Coleccionistas', maestriaMin: 20, zonaRadio: 13,
      jefe: { nombre: 'Custodio del Tesoro', clase: 'veterano', mult: 1.7 }, recompensa: { tipo: 'mascara', id: 'mente', monedas: 150 },
      zona: 'una cueva de las lomas entre Arcana y Pueblo Alto Pino',
      desc: 'La cueva donde los Coleccionistas esconden sus objetos MÁS valiosos: piezas únicas y, sellado en una caja de plomo, un pergamino de técnica prohibida. Su jefe guarda, además, una de las máscaras legendarias.',
      rumor: 'El tesoro de verdad de los Coleccionistas no está en ningún almacén: está en una cueva de las lomas entre Arcana y Alto Pino. Ahí guardan sus objetos más valiosos… y dicen que su jefe guarda ahí una MÁSCARA legendaria: la de la Mente. La cueva cambia de lugar: la montan y la abandonan.' },
    { id: 'manoCamara', org: 'mano', nombre: 'Cámara del Vacío', x: 296, y: 336, color: '#8b93a3', guardias: ['veterano', 'brasa'], guardiaNom: 'Élite del guante negro', guante: true, maestriaMin: 25, zonaRadio: 13,
      jefe: { nombre: 'Drenador de la Cámara', clase: 'brasa', mult: 1.6 }, recompensa: { tipo: 'artefacto', id: 'espada', monedas: 160 },
      zona: 'la Tierra Quemada, al oeste de Aldea Ceniza Viva, bajo la ceniza',
      desc: 'Una cámara subterránea bajo la ceniza: sillas con correas, marcas de uñas en la piedra y un silencio raro, como si el lugar mismo hubiera quedado VACÍO. Aquí drenan el dominio de sus víctimas.',
      rumor: 'En la Tierra Quemada, al oeste de Ceniza Viva, hay quien ha oído gritos bajo la ceniza… y luego nada. Dicen que los que drenan dominio montan ahí una cámara subterránea donde retienen a sus víctimas. Nunca está dos veces en el mismo hoyo.' },
    { id: 'manoNiebla', org: 'mano', nombre: 'Refugio de la Niebla', x: 320, y: 88, color: '#8b93a3', guardias: ['brasa', 'ilusionista'], guardiaNom: 'Élite del guante negro', guante: true, maestriaMin: 30, zonaRadio: 12,
      jefe: { nombre: 'Señor de la Niebla', clase: 'ilusionista', mult: 1.6 }, recompensa: { tipo: 'monedas', monedas: 220 },
      zona: 'el pie brumoso de la Montaña, junto a la orilla oeste del Río del Este',
      desc: 'Un refugio al pie de la montaña, donde la bruma baja del río y lo tapa todo: quien no sabe que está aquí, pasa de largo a diez pasos sin verlo.',
      rumor: 'Al pie de la Montaña Brumosa, junto al Río del Este, la niebla esconde algo: un refugio de los del guante negro, tan tapado por la bruma que se pasa de largo sin verlo. La niebla se mueve, y el refugio con ella.' },
    { id: 'manoTorre', org: 'mano', nombre: 'Torre Oscura', x: 404, y: 148, color: '#8b93a3', guardias: ['veterano', 'veterano', 'brasa'], guardiaNom: 'Élite del guante negro', guante: true, maestriaMin: 35, zonaRadio: 12, notas: 'secSantuario',
      jefe: { nombre: 'Centinela de la Torre', clase: 'veterano', mult: 1.75 }, recompensa: { tipo: 'monedas', monedas: 300 },
      zona: 'el extremo este del continente, pasado Aldea Chispa Alta',
      desc: 'Una torre en ruinas en el extremo este del continente: la base principal de los que drenan dominio. Desde su alto vigilan los caminos del Rayo, y en su sótano esperan las sillas vacías.',
      rumor: 'La base principal de los que drenan dominio es una torre en ruinas, en el extremo este del continente, pasado Chispa Alta. La llaman la Torre Oscura, y nadie del rumbo se acerca ni por apuesta. Hasta la torre parece mudarse con la niebla.' },
    { id: 'secSantuario', org: 'secreta', nombre: 'Santuario del Sello', x: 206, y: 96, color: '#e8a2e0', guardias: ['ilusionista', 'veterano'], guardiaNom: 'Agente sin nombre', maestriaMin: 45, zonaRadio: 12,
      jefe: { nombre: 'Oficiante del Sello', clase: 'ilusionista', mult: 1.7 }, recompensa: { tipo: 'monedas', monedas: 350 },
      zona: 'las ruinas sin nombre al sur de Aldea Vuelo Alto',
      desc: 'Un santuario roto junto a las ruinas sin nombre: velas negras, círculos grabados en la piedra y herramientas hechas para una sola cosa: trabajar sobre el SELLO, despacio, para debilitarlo.',
      rumor: 'En voz bajísima: junto a las ruinas sin nombre al sur de Vuelo Alto hay un santuario donde gente sin insignia trabaja sobre el sello… para debilitarlo. Nadie sabe de quiénes son. Nadie. Y el santuario nunca está donde lo viste la última vez.' },
    { id: 'secVacio', org: 'secreta', nombre: 'Escondite del Vacío', x: 56, y: 336, color: '#e8a2e0', guardias: ['ilusionista', 'veterano', 'veterano'], guardiaNom: 'Agente sin nombre', maestriaMin: 55, zonaRadio: 14, radio: 2.0,
      jefe: { nombre: 'Vacío sin Nombre', clase: 'ilusionista', mult: 1.85 }, recompensa: { tipo: 'monedas', monedas: 450 },
      zona: 'el rincón más perdido del suroeste del continente, donde no llega ningún camino',
      desc: 'El lugar más escondido del continente: sin camino, sin humo, sin nombre. El último refugio de la organización que no tiene nombre — solo se llega a saber de él cuando ya se sabe casi todo lo demás.',
      rumor: 'El rumor que casi no es rumor: en el rincón más perdido del suroeste, donde no llega ningún camino, la organización sin nombre guarda su último refugio. Quien lo nombra en voz alta, baja la voz a mitad de frase. Y nadie lo ha visto dos veces en el mismo sitio.' }
  ],
  def(id) { return this.DEFS.find(d => d.id === id) || null; },
  asegurar() {
    const E = U.Juego && U.Juego.estado; if (!E) return null;
    if (U.Orgs) U.Orgs.asegurar();
    if (!E.orgs) return null;
    if (!E.orgs.escondites) E.orgs.escondites = {};
    const S = E.orgs.escondites;
    this.DEFS.forEach(d => {
      if (!S[d.id]) S[d.id] = { rumores: 0, zonaConocida: false, presente: false, x: d.x, y: d.y, spawned: false, guardias: 0, jefeVivo: false, recompensaTomada: false, veces: 0, ausenteHasta: 0, presenteHasta: 0 };
      const s = S[d.id];
      // Migración de partidas viejas (modelo fijo → temporal): 'descubierto' era la zona.
      if (s.descubierto != null && s.zonaConocida == null) s.zonaConocida = !!s.descubierto;
      if (s.saqueado != null && s.recompensaTomada == null) s.recompensaTomada = !!s.saqueado;
      ['rumores', 'veces', 'guardias', 'ausenteHasta', 'presenteHasta'].forEach(k => { if (s[k] == null) s[k] = 0; });
      ['zonaConocida', 'presente', 'spawned', 'jefeVivo', 'recompensaTomada'].forEach(k => { if (s[k] == null) s[k] = false; });
      if (s.x == null) s.x = d.x; if (s.y == null) s.y = d.y;
    });
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
  // APARICIÓN PROGRESIVA: la guarida solo se monta cuando tu maestría más alta llega
  // a su umbral (no tienes nivel: la maestría manda). La secreta exige además revelar.
  puedeAparecer(def) {
    const E = U.Juego.estado; if (!E || !E.jugador || !U.Orgs) return false;
    if (U.Orgs.maxMaestria(E.jugador) < (def.maestriaMin || 0)) return false;
    return this.puedeRevelarse(def);
  },
  // La guarida SE MONTA: elige un punto ALEATORIO dentro de su zona (radio zonaRadio
  // alrededor del centro de la zona) y aparece ahí con sus guardias. El punto es
  // distinto cada vez: nunca es "la misma cueva en el mismo sitio".
  aparecer(d) {
    const E = U.Juego.estado, S = this.asegurar(); if (!E || !S) return false;
    const s = S[d.id]; if (!s || s.presente) return false;
    const T = E.tiempo || 0;
    let x = d.x, y = d.y;
    for (let intento = 0; intento < 12; intento++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * (d.zonaRadio || 12);
      const cx = Math.round(d.x + Math.cos(a) * r), cy = Math.round(d.y + Math.sin(a) * r);
      const pos = U.Reliquias.celdaLibre(E.mapa, cx, cy);
      if (pos && (pos.x !== cx || pos.y !== cy || intento > 6)) { x = pos.x; y = pos.y; break; }
      x = pos.x; y = pos.y;
    }
    s.presente = true; s.x = x; s.y = y; s.spawned = false; s.guardias = 0;
    s.jefeVivo = false; s.recompensaTomada = false; s.veces = (s.veces || 0) + 1;
    s.presenteHasta = T + 420 + Math.random() * 300; // presente unos 7–12 min: luego la organización se mueve
    this.colocar();
    this.spawnGuardias(d);
    if (s.zonaConocida) {
      U.HUD.banner('🗺 ¡GUARIDA PRESENTE! · ' + d.nombre.toUpperCase(), 3);
      U.HUD.toast(d.nombre + ' está MONTADO ahora mismo en ' + d.zona + ' (verás su banderita ' + d.color + ' en el mapa). No siempre está ahí: la organización lo monta improvisado y luego se mueve. Ve antes de que se vaya.', 'aviso');
      U.Audio.sfx('unlock');
    }
    if (U.Guardado) U.Guardado.guardarAuto();
    return true;
  },
  // La guarida DESAPARECE: la organización se movió. Se quitan la entrada y sus
  // guardias; la próxima vez que se monte será en OTRO punto aleatorio de la zona.
  desaparecer(d, silencioso) {
    const E = U.Juego.estado, S = this.asegurar(); if (!E || !S) return;
    const s = S[d.id]; if (!s || !s.presente) return;
    s.presente = false; s.spawned = false; s.guardias = 0; s.jefeVivo = false;
    s.ausenteHasta = (E.tiempo || 0) + 300 + Math.random() * 420; // tarda 5–12 min en volver a montarse
    const m = E.mapa;
    if (m) { const i = m.objetos.findIndex(o => o.tipo === 'escondite' && o.esconditeId === d.id); if (i >= 0) m.objetos.splice(i, 1); }
    E.enemigos = E.enemigos.filter(e => !(e.esOrg === 'escondite' && e.esconditeId === d.id));
    if (E.mapas) delete E.mapas['guarida_' + d.id]; // la próxima cueva se construye de nuevo
    if (!silencioso && s.zonaConocida) U.HUD.toast('El escondite de ' + d.nombre + ' ya no está donde estaba: la organización lo desmontó y se movió. Volverá a montarlo en otro punto de ' + d.zona + ', cuando le toque.', 'aviso');
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  colocar() {
    const E = U.Juego.estado; if (!E || E.mapaId !== 'aldea' || !E.mapa || !U.Reliquias) return;
    const S = this.asegurar(); if (!S) return;
    const j = E.jugador;
    this.DEFS.forEach(d => {
      const s = S[d.id];
      let o = E.mapa.objetos.find(x => x.tipo === 'escondite' && x.esconditeId === d.id);
      if (!s.presente) { if (o) { const i = E.mapa.objetos.indexOf(o); E.mapa.objetos.splice(i, 1); } return; }
      if (!o) { const pos = U.Reliquias.celdaLibre(E.mapa, s.x, s.y); o = { tipo: 'escondite', esconditeId: d.id, color: d.color, x: pos.x, y: pos.y, w: 1, h: 1, solido: false }; E.mapa.objetos.push(o); s.x = pos.x; s.y = pos.y; }
      // LA BANDERITA solo aparece cuando el escondite ESTÁ presente: con la zona
      // conocida (rumores) o estando cerca (exploración). Si no está presente, no hay
      // objeto en el mapa y por tanto no hay banderita ni guardias.
      o.descubierto = !!s.zonaConocida || Math.hypot(j.x - (o.x + 0.5), j.y - (o.y + 0.5)) < 4;
      o.saqueado = !!s.recompensaTomada;
    });
  },
  objDe(id) { const E = U.Juego.estado; if (!E || !E.mapa) return null; return E.mapa.objetos.find(x => x.tipo === 'escondite' && x.esconditeId === id) || null; },
  spawnGuardias(d) {
    const E = U.Juego.estado, s = this.est(d.id); if (!s || s.spawned || !s.presente) return;
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
    if (s.guardias) { U.HUD.banner('⚔ ¡GUARDIAS DE LA GUARIDA! · ' + d.nombre.toUpperCase(), 2.2); U.Audio.sfx('oleada'); }
  },
  guardiaCaido(e) {
    const s = this.est(e.esconditeId); if (!s) return;
    s.guardias = Math.max(0, (s.guardias || 1) - 1);
    const d = this.def(e.esconditeId);
    if (s.guardias <= 0 && d) U.HUD.toast('Los guardias de ' + d.nombre + ' cayeron. Toca la entrada para ENTRAR en la guarida.', 'exito');
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  // Caída de enemigos DENTRO de la guarida (la despacha U.Orgs.enemigoDerrotado).
  enemigoCaido(e) {
    const s = this.est(e.guaridaId); if (!s) return;
    const d = this.def(e.guaridaId);
    if (e.esJefeGuarida) {
      s.jefeVivo = false;
      this.darRecompensa(d);
      // Limpia: la guarida queda ABANDONADA y se desmonta en cuanto salgas.
      s.presenteHasta = (U.Juego.estado.tiempo || 0);
      if (U.Guardado) U.Guardado.guardarAuto();
      return;
    }
    if (e.esGuardiaInterior) {
      const E = U.Juego.estado;
      const quedan = E.enemigos.some(x => x.vida > 0 && x.esOrg === 'guarida' && x.esGuardiaInterior && x.guaridaId === e.guaridaId);
      if (!quedan) U.HUD.toast('Los guardias del túnel cayeron. Al fondo, el jefe te espera.', 'aviso');
    }
  },
  guardiasVivos(id) { const E = U.Juego.estado; return E.enemigos.some(e => e.vida > 0 && e.esOrg === 'escondite' && e.esconditeId === id); },
  // ENTRAR: toca la entrada tras derrotar a los guardias → interior (mapa de cueva).
  // Pone E.enGuarida = true (y el mapaId 'guarida_<id>'): dentro NO hay minimapa ni
  // mapa completo; el HUD lee ese flag. Al salir por el túnel del sur, cambiarMapa
  // vuelve a 'aldea' y el PARCHE de main.js (cambiarMapa) pone E.enGuarida = false.
  entrar(d) {
    const E = U.Juego.estado, s = this.est(d.id); if (!E || !s || !s.presente) return;
    if (s.recompensaTomada) { U.HUD.toast('Ya limpiaste esta guarida: la organización la abandonó. Volverá a montar otra en otro punto de la zona.', 'aviso'); return; }
    E.enGuarida = true; E.guaridaActual = d.id;
    U.Juego.cambiarMapa('guarida_' + d.id, null);
    // Interior: guardias del túnel + jefe al fondo. Se crean AQUÍ (después del
    // cambiarMapa, que limpia E.enemigos): si sales y vuelves a entrar, se recrean.
    const j = E.jugador;
    const mult = E.dificultad * (d.org === 'secreta' ? 1.35 : 1.2);
    const puestos = [[10.5, 8.5], [16.5, 8.5]];
    d.guardias.forEach((clase, i) => {
      const p = puestos[i % puestos.length];
      const e = U.Combate.crearEnemigo(clase, p[0], p[1], mult);
      e.nombre = d.guardiaNom + ' · interior'; e.esOrg = 'guarida'; e.esGuardiaInterior = true; e.guaridaId = d.id;
      if (d.guante) e.guanteNegro = true;
      E.enemigos.push(e);
    });
    const jb = U.Combate.crearEnemigo(d.jefe.clase, 13.5, 4.5, mult * (d.jefe.mult || 1.5));
    jb.stats.vida = Math.round(jb.stats.vida * 1.8); jb.vida = jb.stats.vida;
    jb.nombre = d.jefe.nombre + ' · jefe de ' + d.nombre; jb.esOrg = 'guarida'; jb.esJefeGuarida = true; jb.guaridaId = d.id;
    if (d.guante) jb.guanteNegro = true;
    E.enemigos.push(jb); s.jefeVivo = true;
    U.HUD.banner('🕳 ¡DENTRO DE LA GUARIDA! · ' + d.nombre.toUpperCase(), 2.6);
    U.Dialogo.mostrarTexto('🕳 ' + d.nombre.toUpperCase(), 'Cueva húmeda, túnel estrecho y antorchas que apenas alumbran. Al fondo, ' + d.jefe.nombre + ' te espera: es el jefe de esta guarida, un miembro fuerte de ' + (d.org === 'secreta' ? 'la organización sin nombre' : U.Orgs.DEFS[d.org].nombre) + '. Derrótalo y la recompensa es tuya. Sal por el túnel del sur cuando quieras… pero si sales con el jefe vivo, todo seguirá ahí dentro.');
    U.Audio.sfx('oleada');
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  interactuar(obj) {
    const E = U.Juego.estado, d = this.def(obj.esconditeId), s = this.est(obj.esconditeId);
    if (!d || !s || !s.presente) return;
    if (!s.zonaConocida) { s.zonaConocida = true; U.HUD.toast('Te acercaste lo bastante para verlo claro: esto es ' + d.nombre + ', una guarida improvisada de ' + (d.org === 'secreta' ? 'la organización sin nombre' : U.Orgs.DEFS[d.org].nombre) + '. Su banderita queda marcada mientras esté montado.', 'aviso'); }
    if (this.guardiasVivos(d.id)) { U.HUD.toast('Los guardias de ' + d.nombre + ' no te van a dejar entrar: derríbalos primero.', 'peligro'); U.Audio.sfx('fail'); return; }
    if (s.recompensaTomada) { U.HUD.toast('Esta guarida ya está limpia y abandonada: la organización se movió. Otra aparecerá en otro punto de la zona.', 'aviso'); return; }
    this.entrar(d);
  },
  // Recompensa del JEFE: artefacto, máscara o dinero. Si la pieza ya la tienes (o la
  // máscara ya está en tu cofre), son monedas en su lugar. Si una máscara te fue
  // ROBADA por los perseguidores (U.Orgs.persecucion.rastrear), el jefe de ESA guarida
  // la tiene: recuperarla es la recompensa.
  darRecompensa(d) {
    const E = U.Juego.estado, j = E.jugador; const r = U.Reliquias ? U.Reliquias.asegurar() : null;
    const s = this.est(d.id); if (s) s.recompensaTomada = true;
    let rec = d.recompensa;
    const rast = U.Orgs && U.Orgs.persecucionRastrear ? U.Orgs.persecucionRastrear() : null;
    if (rast && rast.guaridaId === d.id) rec = { tipo: 'mascara', id: rast.mascara, monedas: 0, robada: true };
    let texto = '';
    if (rec.tipo === 'mascara' && r) {
      const def = U.Reliquias.MASCARAS[rec.id];
      if (r.tenidas.indexOf(rec.id) < 0 && r.casa.indexOf(rec.id) < 0) {
        r.tenidas.push(rec.id); if (r.encontradas.indexOf(rec.id) < 0) r.encontradas.push(rec.id);
        if (rast) { if (U.Orgs.persecucionRastrearLimpiar) U.Orgs.persecucionRastrearLimpiar(); }
        texto = '🎭 ¡RECUPERASTE LA ' + def.nombre.toUpperCase() + '! ' + (rec.robada ? 'Los Coleccionistas te la habían quitado y su jefe la guardaba aquí: vuelve a ser tuya. ' : 'El jefe la guardaba como su pieza más valiosa y ahora es tuya. ') + def.efecto + ' Póntela desde la Mochila… y recuerda el riesgo en zonas salvajes.';
      } else { j.monedas = (j.monedas || 0) + 150; texto = 'El jefe guardaba la ' + def.nombre + ', pero ya la tienes: te quedas con su botín en monedas (+150 🪙).'; }
    } else if (rec.tipo === 'artefacto' && r) {
      const def = U.Reliquias.ARTEFACTOS[rec.id];
      if (r.artefactos.indexOf(rec.id) < 0 && r.casa.indexOf(rec.id) < 0) {
        r.artefactos.push(rec.id); if (r.encontradas.indexOf(rec.id) < 0) r.encontradas.push(rec.id);
        texto = '✦ ¡ARTEFACTO! · ' + def.nombre.toUpperCase() + ' — el jefe lo guardaba para venderlo y ahora es tuyo. ' + def.efecto;
      } else { j.monedas = (j.monedas || 0) + 150; texto = 'El jefe guardaba ' + def.nombre + ', pero ya lo tienes: te quedas con su botín en monedas (+150 🪙).'; }
    } else {
      j.monedas = (j.monedas || 0) + (rec.monedas || 100);
      texto = 'El jefe cayó y su botín es tuyo: +' + (rec.monedas || 100) + ' 🪙 de sus ventas y encargos.';
    }
    if (d.notas) { texto += ' Entre sus papeles hay NOTAS con rutas y lugares marcados: hablan de otro escondite.'; }
    U.Combate.particulas(j.x, j.y - 1, 22, d.color, 'chispa');
    U.HUD.banner('🏆 ¡JEFE CAÍDO! · ' + d.nombre.toUpperCase(), 3); U.Audio.sfx('victoria');
    U.Dialogo.mostrarTexto('🏆 RECOMPENSA · ' + d.nombre.toUpperCase(), texto + ' La guarida queda ABANDONADA: la organización ya no la usa. Sal por el túnel del sur; otra guarida aparecerá en otro punto de la zona cuando le toque.');
    if (d.notas) this.darPistaEscondite(d.notas, 1);
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  // INTERIOR: mapa de cueva pequeño (26×18), construido con las primitivas del grid
  // (tiles + solidos + objetos, como crearMapaCasa). Entrada al sur, túnel estrecho
  // al centro y cámara del jefe al norte. PARCHE (main.js, mapaPorId):
  //   E.mapas[id] = (id.indexOf('guarida') === 0 && U.Escondites)
  //     ? U.Escondites.crearMapaCueva(id, rngM) : U.Grid.crearMapaPorId(id, rngM);
  crearMapaCueva(id, rng) {
    const T = U.Grid.T, W = 26, H = 18;
    const d = this.def(id.replace('guarida_', ''));
    const tiles = new Uint8Array(W * H), vari = new Uint8Array(W * H), solidos = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) { tiles[i] = T.CAMINO; vari[i] = Math.floor((rng ? rng() : Math.random()) * 4); }
    const muro = (x, y) => { if (x >= 0 && y >= 0 && x < W && y < H) { tiles[y * W + x] = T.PIEDRA; solidos[y * W + x] = 1; } };
    for (let x = 0; x < W; x++) { muro(x, 0); muro(x, H - 1); }
    for (let y = 0; y < H; y++) { muro(0, y); muro(W - 1, y); }
    // Túnel: dos muros verticales dejan un pasillo central (x 10–15) entre la entrada
    // sur y la cámara del jefe al norte.
    for (let y = 8; y <= 14; y++) { for (let x = 1; x <= 9; x++) muro(x, y); for (let x = 16; x <= 24; x++) muro(x, y); }
    for (let x = 10; x <= 15; x++) { muro(x, 7); } // boca del túnel: se entra por los lados (x 9 y 16 quedan abiertos en y=7)
    const objetos = [];
    const obj = (tipo, x, y, w, h, solido, extra) => { const o = Object.assign({ tipo, x, y, w: w || 1, h: h || 1, solido: !!solido }, extra || {}); if (tipo === 'roca') { o.vidaMax = 55; o.vida = 55; } objetos.push(o); if (o.solido) for (let yy = o.y; yy < o.y + o.h; yy++) for (let xx = o.x; xx < o.x + o.w; xx++) if (xx >= 0 && yy >= 0 && xx < W && yy < H) solidos[yy * W + xx] = 1; };
    obj('roca', 4, 4, 1, 1, true); obj('roca', 21, 4, 1, 1, true); obj('roca', 4, 12, 1, 1, true); obj('roca', 21, 12, 1, 1, true);
    obj('brasero', 11, 9, 1, 1, true); obj('brasero', 14, 9, 1, 1, true); obj('brasero', 12, 2, 1, 1, true);
    obj('cartel', 13, 1, 1, 1, true, { texto: 'GUARIDA · ' + (d ? d.nombre : 'escondite') + ': la organización la monta improvisada y luego se mueve. Al fondo espera su jefe; sal por el túnel del sur.' });
    const s = d ? this.est(d.id) : null;
    const salida = { x: 11, y: 16.4, w: 4, h: 1.6, destino: 'aldea', spawn: { x: (s ? s.x : d.x) + 0.5, y: (s ? s.y : d.y) + 2.5 }, etiqueta: 'Salir de la guarida' };
    const zonas = [{ id: 'cueva', nombre: d ? d.nombre : 'Guarida', x: 0, y: 0, w: W, h: H, humedad: 0.7, temp: 0.4, viento: 0.05, suelo: 'pavimento', icono: 'bosque', tinte: [40, 40, 60, 0.08] }];
    return { id, nombreMapa: d ? d.nombre : 'Guarida', ancho: W, alto: H, tiles, vari, objetos, solidos, zonas, arena: { x: 13, y: 9, r: 2 }, ocultarRuna: true, inicio: { x: 13.5, y: 15.5 }, spawns: [], npcs: {}, salidas: [salida] };
  },
  // RUMORES de guaridas: los suelta cualquier NPC con la opción de rumores.
  // El primer rumor es una pista de zona; el segundo ACOTA la zona (no marca el punto:
  // el escondite es aleatorio y puede no estar cuando llegues).
  rumorEscondite(npc) {
    const S = this.asegurar(); if (!S) return null;
    const cands = this.DEFS.filter(d => !S[d.id].zonaConocida && this.puedeRevelarse(d));
    if (!cands.length) return null;
    const d = cands[((npc.veces || 0) + ((U.Juego.estado.reloj ? U.Juego.estado.reloj.dia : 1))) % cands.length];
    const s = S[d.id]; s.rumores++;
    if (s.rumores >= 2) {
      s.zonaConocida = true;
      if (U.Guardado) U.Guardado.guardarAuto();
      return npc.nombre + ' baja la voz hasta casi desaparecer: «' + d.rumor + '» Y añade el detalle que faltaba: con dos rumores iguales, la ZONA queda acotada — ' + d.nombre + ', en ' + d.zona + '. Pero ojo: el escondite es improvisado, se monta y se mueve. Cuando esté ahí verás su banderita ' + d.color + ' en el mapa; si vas y no está, es que aún no lo montaron o ya se fueron. Sus guardias no van a regalarte la entrada.';
    }
    if (U.Guardado) U.Guardado.guardarAuto();
    return npc.nombre + ' mira a los lados y baja la voz: «' + d.rumor + '» (Rumor de guarida anotado, 1/2: si otro rumor coincide, la zona quedará acotada. El escondite en sí aparece y desaparece: no busques un punto fijo.)';
  },
  darPistaEscondite(id, n) {
    const d = this.def(id), s = this.est(id); if (!d || !s || s.zonaConocida) return;
    if (!this.puedeRevelarse(d)) { if (d.org === 'secreta') return; }
    s.rumores += (n || 1);
    if (s.rumores >= 2) { s.zonaConocida = true; U.HUD.toast('📜 Las notas acotan la zona: ' + d.nombre + ' se monta por ' + d.zona + '. Cuando esté ahí, verás su banderita en el mapa.', 'aviso'); }
    else U.HUD.toast('📜 Unas notas mencionan un lugar: ' + d.nombre + ' estaría en ' + d.zona + '. Todavía es solo una pista (1/2).', 'aviso');
  },
  // Vera, la investigadora, puede atar UN cabo de guaridas por conversación.
  vera() {
    const S = this.asegurar(); if (!S) return 'Vera no tiene nada nuevo.';
    const cands = this.DEFS.filter(d => !S[d.id].zonaConocida && this.puedeRevelarse(d));
    if (!cands.length) return 'Vera hojea su libreta y sonríe de medio lado: «Guaridas ya no me quedan por darte: las zonas las tienes todas acotadas. El continente es grande… pero tú lo caminaste entero. Recuerda: se montan y se mueven, nunca están dos veces en el mismo sitio.»';
    const d = cands[0];
    this.darPistaEscondite(d.id, 1);
    const s = S[d.id];
    return 'Vera abre la libreta por una página llena de flechas: «Las guaridas son la otra razón de que este continente sea tan grande: cada organización monta las suyas lejos de los caminos, improvisadas, y luego se mueve. Tengo una casi atada: ' + d.nombre + ', en ' + d.zona + '. ' + d.rumor + '»' + (s.zonaConocida ? ' (Con esto la zona queda ACOTADA: cuando la guarida esté montada verás su banderita en el mapa. Ve con cuidado: tiene guardias y un jefe dentro.)' : ' (Es una pista firme, 1/2: un rumor más y la zona quedará acotada.)');
  },
  html() {
    const S = this.asegurar(); if (!S) return '';
    const con = this.DEFS.filter(d => S[d.id].zonaConocida);
    if (!con.length) return '<div style="font-size:12px;margin:5px 0"><b style="color:#9fb3d9">GUARIDAS SECRETAS</b><br><span style="color:var(--textoFrio)">No tienes ninguna zona acotada. Las organizaciones montan guaridas IMPROVISADAS por el continente (jaulas, bóvedas, cámaras, refugios): aparecen y desaparecen, nunca están dos veces en el mismo sitio. Se acotan por rumores de la gente, explorando zonas escondidas, siguiendo a un miembro o por notas encontradas en otra guarida. Cuando una está montada verás su banderita en el mapa: derrota a sus guardias, ENTRA, vence a su jefe y toma la recompensa.</span></div>';
    return '<div style="font-size:12px;margin:5px 0"><b style="color:#9fb3d9">GUARIDAS SECRETAS · zonas acotadas ' + con.length + '/' + this.DEFS.length + '</b>' + con.map(d => { const s = S[d.id]; return '<br><span style="color:' + d.color + '">🗺 <b>' + d.nombre + '</b></span> <span style="color:var(--textoFrio)">(' + (d.org === 'secreta' ? 'organización sin nombre' : U.Orgs.DEFS[d.org].nombre) + ' · ' + d.zona + ') · ' + (s.presente ? '<b style="color:var(--exito)">¡MONTADA AHORA MISMO! (banderita en el mapa)</b>' : 'ahora mismo no está montada: aparecerá en otro punto de la zona') + (s.recompensaTomada ? ' · ya la limpiaste una vez' : '') + '</span>'; }).join('') + '<br><span style="color:var(--textoTenue)">Las que faltan siguen sin acotar: rumores, exploración, seguir a un miembro o notas de otra guarida. Los de la organización sin nombre son los más difíciles de encontrar.</span></div>';
  },
  tick(dt) {
    const E = U.Juego.estado; if (!E || !E.jugador || E.mapaId !== 'aldea' || E.ui !== 'mundo') return;
    const S = this.asegurar(); if (!S) return;
    this.colocar();
    const j = E.jugador;
    const T = E.tiempo || 0;
    // APARICIÓN / DESAPARICIÓN: cada guarida se monta sola con el tiempo (si tu
    // maestría ya llega a su umbral) y se desmonta a los 7–12 minutos. Ir a la misma
    // zona no garantiza encontrarla: es aleatorio e improvisado.
    for (const d of this.DEFS) {
      const s = S[d.id];
      if (!s.presente) {
        if (T >= (s.ausenteHasta || 0) && this.puedeAparecer(d) && Math.random() < dt / 480) this.aparecer(d);
        continue;
      }
      if (T > (s.presenteHasta || 0) && E.mapaId !== ('guarida_' + d.id)) {
        // No se desmonta en plena pelea a su puerta: si sus guardias siguen vivos y
        // estás cerca, aguanta un poco más.
        if (!(this.guardiasVivos(d.id) && Math.hypot(j.x - s.x, j.y - s.y) < 15)) { this.desaparecer(d); continue; }
      }
      // EXPLORACIÓN: acercarte caminando a una guarida montada acota su zona.
      if (!s.zonaConocida && Math.hypot(j.x - (s.x + 0.5), j.y - (s.y + 0.5)) < 3.2) {
        s.zonaConocida = true;
        U.HUD.toast('Llegaste caminando hasta algo escondido: es ' + d.nombre + ', una guarida improvisada de ' + (d.org === 'secreta' ? 'la organización sin nombre' : U.Orgs.DEFS[d.org].nombre) + '. Su zona queda acotada y su banderita marcada mientras esté montada.', 'aviso');
        if (U.Guardado) U.Guardado.guardarAuto();
      }
    }
    // SEGUIR A UN MIEMBRO: quedarte cerca de Sana (Red de Jade), Dario (los que
    // drenan dominio) o Petra (Coleccionistas) unos segundos hace que su organización
    // monte una guarida: los sigues la mirada, las manos y las rutas que repiten.
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
          const d = this.DEFS.find(x => x.org === org && !S[x.id].presente && this.puedeAparecer(x));
          this._seg = null; this._segCd = 180;
          if (d) {
            S[d.id].zonaConocida = true;
            U.HUD.toast('Siguiendo a ' + cerca.nombre + ' sin que se dé cuenta —sus rutas, sus miradas, los lugares que evita— atas el cabo: su organización acaba de montar una guarida y ya sabes por dónde.', 'aviso');
            this.aparecer(d);
          }
        }
      } else this._seg = null;
    }
  }
};
