/* === js/sistemas/reliquias.js === */
window.U = window.U || {};

/* Unipar — MÁSCARAS LEGENDARIAS, ARTEFACTOS ANTIGUOS y ALMACENAMIENTO EN LA CASA.
   MÁSCARAS: 6, una por estadística, SÚPER RARAS. 4 están escondidas DENTRO de rocas
   o árboles concretos del continente (la roca se elige al azar al crear el mundo con
   la semilla: la misma roca toda la partida, otra roca en otro mundo; al romperla se
   revela la máscara) y 2 las guardan LOS COLECCIONISTAS como recompensa de jefe en
   sus guaridas (ver U.Escondites). Los rumores acotan la ZONA de cada máscara, no el
   punto exacto. La Llave del Sello es objeto de trama y NO entra en este reparto.
   Pasivas: NO gastan Esencia. Solo se lleva UNA puesta a la vez (ponerte otra quita
   la anterior) y el bonus SOLO funciona con la máscara puesta.
   RIESGO: con una máscara puesta, en los PUEBLOS no pasa nada; en ZONAS SALVAJES
   (desierto, bosque, montaña, campos…) Los Coleccionistas salen al paso para quitártela.
   CASA: el COFRE de tu casa guarda máscaras y artefactos. Lo guardado no da bonus,
   pero tampoco atrae a nadie: llevarla = bonus + riesgo; dejarla = ni bonus ni riesgo.
   ARTEFACTOS: 4 objetos antiguos y ÚNICOS (Guerra de los Clanes, Orión, el meteorito,
   El Ancestro). Pasivos mientras los llevas CONTIGO: Cristal de Esencia (+25 de Esencia
   máxima), Espada de Orión (+25% de daño elemental), Fragmento del Meteorito (+50% de
   ganancia de maestría) y la Llave del Sello (peligrosa: llevarla atrae a los agentes
   de la organización sin nombre, los del compañero de El Infernal). Se encuentran en
   el mundo, se compran a Petra en Arcana o se recuperan de los Coleccionistas caídos. */
U.Reliquias = {
  MASCARAS: {
    vida: { nombre: 'Máscara de la Vida', stat: 'vida', color: '#ff8a9c', efecto: 'Tu Vida se regenera 3 veces más rápido (la recuperación automática). Pasiva: no gasta Esencia.' },
    esencia: { nombre: 'Máscara de la Esencia', stat: 'esencia', color: '#7cc4ff', efecto: 'Tu Esencia se regenera un 60% más rápido. Pasiva: no gasta Esencia.' },
    fuerza: { nombre: 'Máscara de la Fuerza', stat: 'ataque', color: '#ffd08a', efecto: 'Ataque +25% mientras la llevas puesta: pegas más fuerte con Yin, Yang y técnicas. Pasiva: no gasta Esencia.' },
    resistencia: { nombre: 'Máscara de la Resistencia', stat: 'defensa', color: '#67e08a', efecto: 'Defensa +25% mientras la llevas puesta: recibes menos daño. Pasiva: no gasta Esencia.' },
    velocidad: { nombre: 'Máscara de la Velocidad', stat: 'velocidad', color: '#7ef0c0', efecto: 'Velocidad +20% mientras la llevas puesta: te mueves más rápido, golpeas más seguido y el dash llega más lejos. Pasiva: no gasta Esencia.' },
    mente: { nombre: 'Máscara de la Mente', stat: 'mente', color: '#e8a2e0', efecto: 'Mente +25% mientras la llevas puesta: tu poder mental es más fuerte (tu Hechizo de Inversión dura 9 s en vez de 6) y resistes mejor los ataques mentales / Arte Místico (la Inversión enemiga te dura menos de la mitad). Pasiva: no gasta Esencia.' }
  },
  ARTEFACTOS: {
    cristal: { nombre: 'Cristal de Esencia', color: '#7cc4ff', efecto: 'Guarda Esencia extra: tu Esencia máxima sube +25 mientras lo llevas contigo.', origen: 'Un cristal de la Guerra de los Clanes, cargado con la Esencia de los caídos.' },
    espada: { nombre: 'Espada de Orión', color: '#ffe14d', efecto: 'El daño de tus TÉCNICAS ELEMENTALES sube +25% mientras la llevas contigo.', origen: 'La espada de Orión, El Elegido: el que dominó los cinco elementos en una sola vida, venció a los cinco líderes y unificó los pueblos.' },
    fragmento: { nombre: 'Fragmento del Meteorito', color: '#e05bd0', efecto: 'Resuena con la Esencia: ganas MAESTRÍA un 50% más rápido mientras lo llevas contigo.', origen: 'Un pedazo del fragmento estelar que cayó del espacio con Esencia Primordial, el mismo que trajo a El Ancestro a este mundo.' },
    llave: { nombre: 'Llave del Sello', color: '#ff5470', peligro: true, efecto: 'Una llave del sello que encierra a El Infernal. PELIGRO: el compañero de El Infernal la quiere para liberarlo, así que llevarla contigo atrae a los agentes de su organización sin nombre en las zonas salvajes. Guardada en el cofre de tu casa, nadie te sigue.', origen: 'Forjada cuando Orión se selló a sí mismo junto a El Infernal con la técnica prohibida, Las Puertas del Infierno.' }
  },
  PRECIO_PETRA: 250,
  // Dónde está escondido cada ARTEFACTO en el continente continuo (la celda exacta se
  // ajusta sola a la celda libre más cercana al generarse: nunca cae en agua ni en un muro).
  // Las MÁSCARAS ya NO tienen tesoro visible: 4 van dentro de rocas/árboles al azar
  // (ver ZONAS_MASCARA / asignarMascarasEnRocas) y 2 son recompensa de jefe en las
  // guaridas de los Coleccionistas (ver U.Escondites: coleRuinas → fuerza, coleCueva → mente).
  TESOROS: [
    { id: 'cristal', x: 353, y: 217, lugar: 'la orilla escondida del Lago Brisa Azul' },
    { id: 'espada', x: 330, y: 72, lugar: 'las ruinas de la Montaña Brumosa, bajo el obelisco' },
    { id: 'fragmento', x: 334, y: 308, lugar: 'la Tierra Quemada, junto a Aldea Ceniza Viva' },
    { id: 'llave', x: 213, y: 103, lugar: 'unas ruinas sin nombre al sur de Aldea Vuelo Alto' }
  ],
  // MÁSCARAS EN ROCAS/ÁRBOLES: cada una vive en UNA zona del continente (rectángulo en
  // coordenadas del mapa continuo). Los rumores acotan la zona; la roca o el árbol exacto
  // se elige al azar con la semilla del mundo (misma roca toda la partida, otra en otro
  // mundo). Al romper esa roca/árbol, la máscara se revela como tesoro recogible.
  // PARCHE (js/motor/grid.js, en U.Grid.danarObjeto, justo antes de su `return true;`):
  //   if (window.U && U.Reliquias) U.Reliquias.objetoRoto(o);
  MASCARAS_ROCA: ['vida', 'esencia', 'resistencia', 'velocidad'],
  ZONAS_MASCARA: {
    vida: { rect: { x0: 40, y0: 44, x1: 112, y1: 100 }, lugar: 'dentro de una roca o un árbol del Bosque Susurrante',
      rumor: 'Dicen que una máscara duerme escondida en el Bosque Susurrante, al fondo del noroeste, DENTRO de una roca o de un árbol: no se ve desde fuera, hay que romper la piedra o talar el árbol para encontrarla. Nadie sabe cuál roca es: en cada mundo es otra.' },
    esencia: { rect: { x0: 158, y0: 224, x1: 176, y1: 268 }, lugar: 'dentro de una roca o un árbol de la Ribera Húmeda',
      rumor: 'Junto al río, en la Ribera Húmeda, cuentan que una máscara quedó sellada DENTRO de una roca o un árbol, a la orilla del agua. Rompe piedras por la ribera y quizá suene a hueco.' },
    resistencia: { rect: { x0: 300, y0: 36, x1: 368, y1: 90 }, lugar: 'dentro de una roca o un árbol de la Montaña Brumosa',
      rumor: 'En la Montaña Brumosa, en altura, hay una máscara metida DENTRO de una roca o un árbol: los viejos dicen que la montaña la tragó para guardarla. Rompe rocas arriba y busca.' },
    velocidad: { rect: { x0: 44, y0: 244, x1: 118, y1: 298 }, lugar: 'dentro de una roca del Desierto de Sal',
      rumor: 'Pasado el oasis del Desierto de Sal, una máscara espera DENTRO de una roca del desierto, tapada por la arena y el sol. Las rocas del desierto son muchas: rompe y escucha.' }
  },
  // Rumores de máscaras, como DATOS que el sistema de diálogo puede leer: una línea
  // por máscara aún no encontrada, con su zona acotada (nunca el punto exacto).
  // Uso desde diálogo: U.Reliquias.rumorZonaMascara(id) o U.Reliquias.rumoresMascaras().
  rumorZonaMascara(id) { const z = this.ZONAS_MASCARA[id]; return z ? z.rumor : null; },
  rumoresMascaras() {
    const r = this.asegurar(); if (!r) return [];
    return this.MASCARAS_ROCA.filter(id => r.encontradas.indexOf(id) < 0).map(id => ({ id, nombre: this.MASCARAS[id].nombre, zona: this.ZONAS_MASCARA[id].lugar, rumor: this.ZONAS_MASCARA[id].rumor }));
  },
  // Asigna CADA máscara de roca/árbol a UNA roca o árbol concreto, al azar con la
  // semilla del mundo (rngSemilla con la semilla + '-mascaras-roca'): determinista por
  // mundo — la misma roca toda la partida, otra roca en otro mundo — y estable aunque
  // se guarde y se cargue (se guarda en j.reliquias.mascarasRoca; PARCHE guardado.js,
  // ver final de este archivo). Si el archivo no trae el campo (partida vieja), se
  // vuelve a derivar igual, porque la derivación solo depende de la semilla.
  asignarMascarasEnRocas() {
    const E = U.Juego.estado; if (!E || E.mapaId !== 'aldea' || !E.mapa) return null;
    const r = this.asegurar(); if (!r) return null;
    if (!Array.isArray(r.mascarasRoca)) r.mascarasRoca = [];
    // Limpia asignaciones de máscaras ya encontradas (no vuelven a esconderse).
    r.mascarasRoca = r.mascarasRoca.filter(a => a && r.encontradas.indexOf(a.mascara) < 0 && !a.revelada);
    const rng = U.TestUI.rngSemilla(E.semilla + '-mascaras-roca');
    const cands = E.mapa.objetos.filter(o => (o.tipo === 'arbol' || o.tipo === 'roca') && o.vidaMax != null)
      .slice().sort((a, b) => (a.y - b.y) || (a.x - b.x));
    const enRect = (o, rc) => o.x >= rc.x0 && o.x <= rc.x1 && o.y >= rc.y0 && o.y <= rc.y1;
    this.MASCARAS_ROCA.forEach(id => {
      if (r.encontradas.indexOf(id) >= 0) return;
      if (r.mascarasRoca.some(a => a.mascara === id)) return;
      const z = this.ZONAS_MASCARA[id];
      let pool = cands.filter(o => enRect(o, z.rect) && !r.mascarasRoca.some(a => a.x === o.x && a.y === o.y));
      if (!pool.length) pool = cands.filter(o => !r.mascarasRoca.some(a => a.x === o.x && a.y === o.y));
      if (!pool.length) return;
      // Fisher-Yates con el rng de la semilla: el azar es del mundo, no del momento.
      for (let i = pool.length - 1; i > 0; i--) { const k = Math.floor(rng() * (i + 1)); const t = pool[i]; pool[i] = pool[k]; pool[k] = t; }
      const o = pool[0];
      r.mascarasRoca.push({ mascara: id, x: o.x, y: o.y, tipo: o.tipo, revelada: false });
    });
    return r.mascarasRoca;
  },
  // Enganche de destrucción: lo llama U.Grid.danarObjeto (parche en grid.js) cuando
  // una roca/árbol/cactus cae. Si esa roca/árbol guardaba una máscara, la máscara se
  // REVELA como tesoro recogible en esa misma celda (la recoge el flujo normal).
  objetoRoto(o) {
    const E = U.Juego.estado; if (!E || !E.mapa || !o) return false;
    const r = this.asegurar(); if (!r || !Array.isArray(r.mascarasRoca)) return false;
    const a = r.mascarasRoca.find(x => x && !x.revelada && x.x === o.x && x.y === o.y);
    if (!a) return false;
    a.revelada = true;
    const d = this.MASCARAS[a.mascara];
    if (!E.mapa.objetos.some(x => x.tipo === 'tesoro' && x.reliquiaId === a.mascara)) {
      E.mapa.objetos.push({ tipo: 'tesoro', reliquiaId: a.mascara, nombreTesoro: d.nombre, color: d.color, x: o.x, y: o.y, w: 1, h: 1, solido: false });
    }
    U.Combate.particulas(o.x + 0.5, o.y, 24, d.color, 'chispa');
    U.HUD.banner('🎭 ¡ALGO BRILLABA DENTRO! · ' + d.nombre.toUpperCase(), 3); U.Audio.sfx('victoria');
    U.HUD.toast('La ' + (o.tipo === 'arbol' ? 'madera' : 'piedra') + ' se abrió y dentro brillaba una máscara: estaba ESCONDIDA ahí dentro, no a la vista. Tócala para recogerla.', 'exito');
    if (U.Guardado) U.Guardado.guardarAuto();
    return true;
  },
  // Zonas SEGURAS (pueblos y ciudades): con máscara puesta aquí no pasa nada.
  // Todo lo demás del continente (bosque, desierto, montaña, campos, ribera, ceniza…) es SALVAJE.
  ZONAS_SEGURAS: ['aldea', 'metropolis', 'arcana', 'puebloAgua', 'puebloFuego', 'vueloAlto', 'chispaAlta', 'raizPiedra', 'altoPino', 'rocafirme', 'tresCruces', 'salina', 'vegaBaja', 'brasaChica', 'casa', 'oficina'],
  defDe(id) { if (this.MASCARAS[id]) return Object.assign({ tipo: 'mascara' }, this.MASCARAS[id]); if (this.ARTEFACTOS[id]) return Object.assign({ tipo: 'artefacto' }, this.ARTEFACTOS[id]); return null; },
  asegurar() {
    const E = U.Juego && U.Juego.estado; const j = E && E.jugador; if (!j) return null;
    if (!j.reliquias) j.reliquias = { tenidas: [], puesta: null, artefactos: [], casa: [], encontradas: [] };
    const r = j.reliquias;
    ['tenidas', 'artefactos', 'casa', 'encontradas'].forEach(k => { if (!Array.isArray(r[k])) r[k] = []; });
    if (r.puesta && r.tenidas.indexOf(r.puesta) < 0) r.puesta = null; // una máscara guardada en casa nunca queda "puesta"
    return r;
  },
  puestaDe(j) { return j && j.reliquias ? (j.reliquias.puesta || null) : null; },
  // Estadística EFECTIVA con la máscara puesta (la base j.stats nunca se toca: al quitarla, el bonus desaparece solo).
  statEf(j, stat) {
    let v = (j && j.stats) ? (j.stats[stat] || 0) : 0;
    const p = this.puestaDe(j);
    if (p && this.MASCARAS[p] && this.MASCARAS[p].stat === stat) v *= (stat === 'velocidad' ? 1.2 : 1.25);
    return v;
  },
  // Resistencia mental (Arte Místico): factor que multiplica la duración de la Inversión enemiga.
  resistMental(j) { if (this.puestaDe(j) === 'mente') return 0.45; return ((j && j.stats && j.stats.mente) || 0) >= 20 ? 0.75 : 1; },
  esenciaMax(j) { return ((j && j.stats) ? j.stats.esencia : 0) + (this.llevaArtefacto(j, 'cristal') ? 25 : 0); },
  llevaArtefacto(j, id) { return !!(j && j.reliquias && Array.isArray(j.reliquias.artefactos) && j.reliquias.artefactos.indexOf(id) >= 0); },
  esSalvaje(E) {
    if (!E || E.mapaId !== 'aldea') return false; // interiores (tu casa, la Oficina): a salvo
    // ZONA SEGURA CIRCULAR (U.ZonasSeguras, radio 10 desde la fogata del pueblo):
    // dentro del círculo es pueblo, fuera es salvaje. Si el módulo no está
    // cargado, se usa la regla vieja por rectángulo de zona.
    if (U.ZonasSeguras) return !U.ZonasSeguras.enZonaSegura(E.jugador.x, E.jugador.y);
    const z = E.zonaActual; if (!z || !z.id) return false;
    return this.ZONAS_SEGURAS.indexOf(z.id) < 0;
  },
  celdaLibre(m, x, y) {
    const T = U.Grid.T;
    const libre = (cx, cy) => { if (cx < 1 || cy < 1 || cx >= m.ancho - 1 || cy >= m.alto - 1) return false; if (m.tiles[cy * m.ancho + cx] === T.AGUA) return false; if (m.solidos[cy * m.ancho + cx]) return false; return !m.objetos.some(o => o.solido && cx >= o.x && cx < o.x + (o.w || 1) && cy >= o.y && cy < o.y + (o.h || 1)); };
    if (libre(x, y)) return { x, y };
    for (let r = 1; r <= 8; r++) for (let cy = y - r; cy <= y + r; cy++) for (let cx = x - r; cx <= x + r; cx++) if (Math.max(Math.abs(cx - x), Math.abs(cy - y)) === r && libre(cx, cy)) return { x: cx, y: cy };
    return { x, y };
  },
  colocarTesoros() {
    const E = U.Juego.estado; if (!E || E.mapaId !== 'aldea' || !E.mapa) return;
    const r = this.asegurar(); if (!r) return;
    this.TESOROS.forEach(t => {
      if (r.encontradas.indexOf(t.id) >= 0) return; // ya recogido (o comprado/recuperado): no reaparece
      if (E.mapa.objetos.some(o => o.tipo === 'tesoro' && o.reliquiaId === t.id)) return;
      const d = this.defDe(t.id); const pos = this.celdaLibre(E.mapa, t.x, t.y);
      E.mapa.objetos.push({ tipo: 'tesoro', reliquiaId: t.id, nombreTesoro: d.nombre, color: d.color, x: pos.x, y: pos.y, w: 1, h: 1, solido: false });
    });
  },
  quitarTesoroDelMapa(id) { const E = U.Juego.estado; if (!E || !E.mapa) return; const i = E.mapa.objetos.findIndex(o => o.tipo === 'tesoro' && o.reliquiaId === id); if (i >= 0) E.mapa.objetos.splice(i, 1); },
  recoger(obj) {
    const E = U.Juego.estado, j = E.jugador; const r = this.asegurar(); if (!r || !obj) return;
    const d = this.defDe(obj.reliquiaId); if (!d) return;
    const t = this.TESOROS.find(x => x.id === obj.reliquiaId) || (this.ZONAS_MASCARA[obj.reliquiaId] ? { lugar: this.ZONAS_MASCARA[obj.reliquiaId].lugar } : null);
    this.quitarTesoroDelMapa(obj.reliquiaId);
    if (r.encontradas.indexOf(obj.reliquiaId) < 0) r.encontradas.push(obj.reliquiaId);
    U.Combate.particulas(j.x, j.y - 1, 22, d.color, 'chispa');
    if (d.tipo === 'mascara') {
      if (r.tenidas.indexOf(obj.reliquiaId) < 0) r.tenidas.push(obj.reliquiaId);
      U.HUD.banner('🎭 ¡MÁSCARA LEGENDARIA! · ' + d.nombre.toUpperCase(), 3); U.Audio.sfx('victoria');
      U.Dialogo.mostrarTexto('🎭 ' + d.nombre.toUpperCase(), 'Estaba escondida en ' + (t ? t.lugar : 'un lugar difícil') + '. Es una de las seis máscaras legendarias: SÚPER RARA, pasiva y no gasta Esencia. EFECTO: ' + d.efecto + ' El bonus SOLO funciona mientras la llevas PUESTA, y solo puedes llevar UNA a la vez (ponerte otra quita la anterior): póntela o quítatela en Pausa → 🎒 Mochila, o en el cofre de tu casa. ⚠ EL RIESGO: con una máscara puesta, en los PUEBLOS no pasa nada… pero al cruzar ZONAS SALVAJES (desierto, bosque, montaña, campos) Los Coleccionistas te saldrán al paso para quitártela, porque ellos coleccionan objetos raros. Si la dejas en el COFRE de tu casa, nadie te persigue — pero tampoco tienes su bonus. Tú decides: bonus con riesgo, o calma sin bonus.');
    } else {
      if (r.artefactos.indexOf(obj.reliquiaId) < 0) r.artefactos.push(obj.reliquiaId);
      U.HUD.banner('✦ ¡ARTEFACTO ANTIGUO! · ' + d.nombre.toUpperCase(), 3); U.Audio.sfx('victoria');
      let extra = '';
      if (obj.reliquiaId === 'cristal') extra = ' Tu Esencia máxima acaba de subir a ' + Math.round(this.esenciaMax(j)) + '.';
      if (obj.reliquiaId === 'llave') extra = ' ⚠ Desde ahora, llevarla contigo por zonas salvajes puede atraer a los agentes de la organización sin nombre. En el cofre de tu casa estarás a salvo.';
      U.Dialogo.mostrarTexto('✦ ' + d.nombre.toUpperCase(), d.origen + ' EFECTO: ' + d.efecto + ' Los artefactos son pasivos: funcionan mientras los llevas CONTIGO. También puedes guardarlos en el COFRE de tu casa (sin efecto mientras estén guardados, pero a salvo de Los Coleccionistas, que los roban para venderlos).' + extra);
    }
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  poner(id) {
    const r = this.asegurar(); if (!r) return '…';
    if (r.tenidas.indexOf(id) < 0) return 'No tienes esa máscara contigo: está guardada en el cofre de tu casa o aún no la encontraste.';
    r.puesta = id; // UNA a la vez: ponerse otra quita la anterior automáticamente
    const d = this.MASCARAS[id]; U.Audio.sfx('unlock'); if (U.Guardado) U.Guardado.guardarAuto();
    return 'Te pones la ' + d.nombre + '. ' + d.efecto + ' Recuerda: en zonas salvajes, Los Coleccionistas pueden salirte al paso por ella.';
  },
  quitar() {
    const r = this.asegurar(); if (!r) return '…';
    if (!r.puesta) return 'No llevas ninguna máscara puesta.';
    const d = this.MASCARAS[r.puesta]; r.puesta = null; U.Audio.sfx('click'); if (U.Guardado) U.Guardado.guardarAuto();
    return 'Te quitas la ' + d.nombre + ': su bonus deja de funcionar (solo actúa puesta) y ya no atraes a Los Coleccionistas. La máscara sigue en tu mochila.';
  },
  dejarEnCasa(id) {
    const E = U.Juego.estado, j = E.jugador; const r = this.asegurar(); if (!r) return '…';
    const d = this.defDe(id); if (!d) return '…';
    if (d.tipo === 'mascara') {
      const i = r.tenidas.indexOf(id); if (i < 0) return 'Esa máscara no está contigo.';
      r.tenidas.splice(i, 1); if (r.puesta === id) r.puesta = null; // guardada = ya no está puesta: sin bonus y sin riesgo
    } else {
      const i = r.artefactos.indexOf(id); if (i < 0) return 'Ese artefacto no está contigo.';
      r.artefactos.splice(i, 1); j.esencia = Math.min(j.esencia, this.esenciaMax(j)); // sin el Cristal encima, la Esencia sobrante se va con él
    }
    if (r.casa.indexOf(id) < 0) r.casa.push(id);
    if (U.Guardado) U.Guardado.guardarAuto();
    return 'Dejas ' + d.nombre + ' en el cofre de tu casa. Guardada no da ningún bonus… y nadie te persigue por ella: Los Coleccionistas solo salen a por lo que LLEVAS puesto o contigo.';
  },
  recogerDeCasa(id) {
    const r = this.asegurar(); if (!r) return '…';
    const d = this.defDe(id); if (!d) return '…';
    const i = r.casa.indexOf(id); if (i < 0) return 'Eso no está en el cofre.';
    r.casa.splice(i, 1);
    if (d.tipo === 'mascara') { if (r.tenidas.indexOf(id) < 0) r.tenidas.push(id); }
    else if (r.artefactos.indexOf(id) < 0) r.artefactos.push(id);
    if (U.Guardado) U.Guardado.guardarAuto();
    return 'Recoges ' + d.nombre + ' del cofre: vuelve a tu mochila' + (d.tipo === 'artefacto' ? ' y su efecto vuelve a funcionar, porque la llevas contigo' : ' (póntela para que su bonus funcione)') + '.';
  },
  // Petra (Arcana) vende UN artefacto al azar de los que aún no tienes.
  // NO vende máscaras (las 6 solo se encuentran: 4 en rocas/árboles, 2 como recompensa de jefe coleccionista)
  // ni la Llave del Sello (objeto de trama, peligro: true).
  comprarEnPetra() {
    const E = U.Juego.estado, j = E.jugador; const r = this.asegurar(); if (!r) return '…';
    const tiene = id => r.tenidas.indexOf(id) >= 0 || r.artefactos.indexOf(id) >= 0 || r.casa.indexOf(id) >= 0;
    const pool = Object.keys(this.ARTEFACTOS).filter(id => id !== 'llave' && !tiene(id));
    if (!pool.length) return 'Petra abre las manos: «Ya tienes TODAS las piezas que circulan por el continente, viajero. Ni mi comprador podría ofrecerme más. Lo que te falte ya no se compra: se encuentra… o se defiende.»';
    if ((j.monedas || 0) < this.PRECIO_PETRA) return 'Petra señala una vitrina cerrada con llave: «Artefactos antiguos de verdad — a ' + this.PRECIO_PETRA + ' 🪙 la pieza, sin preguntas. Traes ' + Math.floor(j.monedas || 0) + ': vuelve con la bolsa llena.»';
    const id = pool[Math.floor(Math.random() * pool.length)]; const d = this.defDe(id);
    j.monedas -= this.PRECIO_PETRA;
    if (r.encontradas.indexOf(id) < 0) r.encontradas.push(id);
    this.quitarTesoroDelMapa(id);
    if (d.tipo === 'mascara') r.tenidas.push(id); else r.artefactos.push(id);
    U.Audio.sfx('victoria'); if (U.Guardado) U.Guardado.guardarAuto();
    return 'Petra descorre una cortina y saca, envuelta en paño negro: ' + d.nombre + '. «' + d.efecto + '» ' + this.PRECIO_PETRA + ' 🪙 cambian de manos sin una sola pregunta. (Ya es tuya: ' + (d.tipo === 'mascara' ? 'póntela desde la Mochila o el cofre de tu casa; y recuerda el riesgo en zonas salvajes' : 'su efecto ya funciona, porque la llevas contigo') + '.)';
  },
  // Recompensa al caer TODOS los Coleccionistas de una emboscada por tu máscara:
  // a veces llevaban encima un artefacto robado (recuperable); si no, sus monedas.
  coleccionistaCaido() {
    const E = U.Juego.estado, j = E.jugador; const T = E.reliquiasT; if (!T || !T.coleVivos) return;
    T.coleVivos--; if (T.coleVivos > 0) return;
    const r = this.asegurar(); if (!r) return;
    const faltan = Object.keys(this.ARTEFACTOS).filter(id => r.artefactos.indexOf(id) < 0 && r.casa.indexOf(id) < 0);
    if (faltan.length && Math.random() < 0.6) {
      const id = faltan[Math.floor(Math.random() * faltan.length)]; const d = this.ARTEFACTOS[id];
      r.artefactos.push(id); if (r.encontradas.indexOf(id) < 0) r.encontradas.push(id); this.quitarTesoroDelMapa(id);
      U.HUD.banner('✦ ¡ARTEFACTO RECUPERADO! · ' + d.nombre.toUpperCase(), 3);
      U.HUD.toast('Entre lo que llevaban los Coleccionistas caídos estaba ' + d.nombre + ': lo habían robado para venderlo y ahora es tuyo. ' + d.efecto, 'exito');
      U.Audio.sfx('victoria');
    } else {
      j.monedas = (j.monedas || 0) + 60;
      U.HUD.toast('Los Coleccionistas caídos llevaban 60 🪙 de sus ventas. Su red sabrá que esta máscara tiene un dueño que se defiende.', 'exito');
    }
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  lanzarEmboscada(tipo) {
    const E = U.Juego.estado, j = E.jugador; const T = E.reliquiasT;
    [[3, 1], [-3, -1]].forEach((p, i) => {
      const c = this.celdaLibre(E.mapa, Math.floor(j.x) + p[0], Math.floor(j.y) + p[1]);
      let e;
      if (tipo === 'cole') { e = U.Combate.crearEnemigo(i === 0 ? 'veterano' : 'bandido', c.x + 0.5, c.y + 0.5, E.dificultad * 1.1); e.nombre = 'Coleccionista · cazador de máscaras'; e.esOrg = 'coleMascara'; }
      else { e = U.Combate.crearEnemigo(i === 0 ? 'ilusionista' : 'veterano', c.x + 0.5, c.y + 0.5, E.dificultad * 1.15); e.nombre = 'Agente sin nombre · quiere la Llave'; e.esOrg = 'selloAgente'; }
      E.enemigos.push(e); U.Combate.particulas(e.x, e.y - 0.5, 12, '#d9a441', 'humo');
    });
    if (tipo === 'cole') {
      if (T) T.coleVivos = 2;
      U.HUD.banner('🎭 ¡LOS COLECCIONISTAS QUIEREN TU MÁSCARA!', 3);
      U.HUD.toast('Te lo advirtieron: una máscara legendaria en zona salvaje es un faro para Los Coleccionistas, que coleccionan objetos raros. ¡Pelea o huye! Si caen, puede que lleven encima algún artefacto robado que recuperar.', 'peligro');
    } else {
      U.HUD.banner('🗝 ¡QUIEREN LA LLAVE DEL SELLO!', 3);
      U.HUD.toast('Agentes de la organización sin nombre: el compañero de El Infernal manda por su llave para liberarlo. ¡No se la des!', 'peligro');
    }
    U.Audio.sfx('oleada');
  },
  tick(dt) {
    const E = U.Juego.estado; if (!E || !E.jugador) return;
    const j = E.jugador; const r = this.asegurar(); if (!r) return;
    this.colocarTesoros();
    if (E.mapaId === 'aldea') this.asignarMascarasEnRocas(); // rocas/árboles con máscara: una vez por mundo (semilla), estables toda la partida
    if (E.mapaId !== 'aldea' || E.ui !== 'mundo') return;
    if (!E.reliquiasT) E.reliquiasT = { cdM: 75, cdL: 150, expo: 0, avisoM: 0, coleVivos: 0 };
    const T = E.reliquiasT;
    if (!this.esSalvaje(E)) { T.expo = 0; return; } // EN LOS PUEBLOS NO PASA NADA: ni exposición ni temporizadores
    const ocupado = E.enCombate || (E.arena && E.arena.activa) || E.torneo || E.reto;
    if (r.puesta && !ocupado) {
      T.avisoM -= dt;
      if (T.avisoM <= 0) { T.avisoM = 90; U.HUD.toast('🎭 Zona salvaje con la ' + this.MASCARAS[r.puesta].nombre + ' puesta: Los Coleccionistas pueden salirte al paso por ella. En los pueblos estás a salvo; en tu casa puedes dejarla en el cofre.', 'aviso'); }
      T.expo += dt; T.cdM -= dt;
      if (T.expo >= 10 && T.cdM <= 0) { T.cdM = 150 + Math.random() * 60; T.expo = 0; this.lanzarEmboscada('cole'); }
    } else T.expo = 0;
    if (r.artefactos.indexOf('llave') >= 0 && !ocupado) {
      T.cdL -= dt;
      if (T.cdL <= 0) { T.cdL = 200 + Math.random() * 80; this.lanzarEmboscada('llave'); }
    }
  },
  accionMochila(accion, id) {
    const E = U.Juego.estado;
    if (accion === 'poner') U.HUD.toast(this.poner(id), 'exito');
    else if (accion === 'quitar') U.HUD.toast(this.quitar(), '');
    else if (accion === 'soltar') U.HUD.toast(U.Orgs ? U.Orgs.soltarMascara() : '…', 'aviso'); // soltar la máscara puesta: los perseguidores la toman y se van
    else if (accion === 'dejar' || accion === 'recoger') {
      if (!E || E.mapaId !== 'casa') { U.HUD.toast('El almacenamiento está en tu CASA: entra en la casa azul de Bruma y usa el COFRE (o abre la Mochila estando dentro de casa).', 'aviso'); U.Audio.sfx('fail'); return; }
      U.HUD.toast(accion === 'dejar' ? this.dejarEnCasa(id) : this.recogerDeCasa(id), 'exito');
    }
  },
  htmlMochila() {
    const E = U.Juego.estado, j = E.jugador; const r = this.asegurar(); if (!r) return '';
    const enCasa = E.mapaId === 'casa'; const esc = s => U.HUD.escHtml(s);
    let h = '<section><h3>🎭 Máscaras legendarias · súper raras · una puesta a la vez</h3>';
    h += '<div style="font-size:11px;color:var(--textoFrio)">Pasivas: NO gastan Esencia. El bonus SOLO funciona con la máscara PUESTA. Con una puesta, en los pueblos no pasa nada, pero en ZONAS SALVAJES (desierto, bosque, montaña, campos) Los Coleccionistas te saldrán al paso para quitártela. Guardada en el cofre de tu casa: sin bonus y sin riesgo.</div>';
    if (r.puesta) h += '<div style="font-size:12px;margin-top:5px">🎭 <b>Llevas puesta: ' + esc(this.MASCARAS[r.puesta].nombre) + '</b> <span style="color:var(--textoFrio)">' + esc(this.MASCARAS[r.puesta].efecto) + '</span></div>';
    else h += '<div style="font-size:12px;margin-top:5px;color:var(--textoFrio)">No llevas ninguna máscara puesta: ningún bonus de máscara activo (y nadie te persigue por una).</div>';
    Object.keys(this.MASCARAS).forEach(id => {
      const d = this.MASCARAS[id]; const tiene = r.tenidas.indexOf(id) >= 0, enCofre = r.casa.indexOf(id) >= 0, puesta = r.puesta === id;
      h += '<div class="mochilaItem"><span>🎭 <b style="color:' + d.color + '">' + esc(d.nombre) + '</b> <small style="color:var(--textoFrio)">' + (puesta ? 'PUESTA · bonus activo · ' + esc(d.efecto) : tiene ? esc(d.efecto) : enCofre ? 'guardada en el cofre de tu casa (sin bonus)' : 'todavía no la encontraste: duerme dentro de una roca o un árbol de su zona, o la guarda un jefe Coleccionista en su guarida') + '</small></span><span class="acts">'
        + (puesta ? '<button class="mini peligro" data-reliquia="quitar" data-id="' + id + '">QUITAR</button><button class="mini peligro" data-reliquia="soltar" data-id="' + id + '">SOLTAR (que se la lleven)</button>' : tiene ? '<button class="mini exito" data-reliquia="poner" data-id="' + id + '">PONER</button>' : '')
        + (tiene && enCasa ? '<button class="mini" data-reliquia="dejar" data-id="' + id + '">DEJAR EN CASA</button>' : '')
        + (enCofre && enCasa ? '<button class="mini exito" data-reliquia="recoger" data-id="' + id + '">RECOGER</button>' : '') + '</span></div>';
    });
    h += '<div style="font-size:11px;color:var(--textoTenue)">Dónde se esconden: 4 máscaras duermen DENTRO de una roca o un árbol de su zona (rompe rocas y tala árboles: la roca exacta es al azar en cada mundo) y 2 las guardan los Coleccionistas como recompensa de jefe en sus guaridas. Los rumores de la gente acotan la zona.</div>';
    h += '</section><section><h3>✦ Artefactos antiguos · únicos · los que roban Los Coleccionistas</h3><div style="font-size:11px;color:var(--textoFrio)">Objetos antiguos y únicos (de la Guerra de los Clanes, de Orión, del meteorito, de El Ancestro). Su poder funciona mientras los llevas CONTIGO; guardados en el cofre de tu casa, no. Los Coleccionistas los roban para venderlos: encuéntralos en el mundo, cómpraselos a Petra en Arcana o recupéralos de sus cazadores caídos.</div>';
    Object.keys(this.ARTEFACTOS).forEach(id => {
      const d = this.ARTEFACTOS[id]; const tiene = r.artefactos.indexOf(id) >= 0, enCofre = r.casa.indexOf(id) >= 0;
      h += '<div class="mochilaItem"><span>✦ <b style="color:' + d.color + '">' + esc(d.nombre) + '</b> <small style="color:var(--textoFrio)">' + (tiene ? 'CONTIGO · ' + esc(d.efecto) : enCofre ? 'guardado en el cofre de tu casa (sin efecto)' : 'todavía no lo tienes · ' + esc(d.efecto)) + '</small></span><span class="acts">'
        + (tiene && enCasa ? '<button class="mini" data-reliquia="dejar" data-id="' + id + '">DEJAR EN CASA</button>' : '')
        + (enCofre && enCasa ? '<button class="mini exito" data-reliquia="recoger" data-id="' + id + '">RECOGER</button>' : '') + '</span></div>';
    });
    if (!enCasa) h += '<div style="font-size:11px;color:var(--textoTenue)">🏠 El almacenamiento vive en el COFRE de tu casa (la casa azul de Aldea de Bruma): ve allí para dejar o recoger objetos. Aquí fuera solo puedes ponerte o quitarte máscaras.</div>';
    return h;
  }
};
