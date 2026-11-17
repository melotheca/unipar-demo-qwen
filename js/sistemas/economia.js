/* === js/sistemas/economia.js === */
/* Unipar — ECONOMÍA COMPLETA: dinero por RANGOS, KARMA por pueblo, comida por sabores,
   pociones A MEDIDA, polainas y el TABLÓN de misiones diarias.
   Números cerrados (decisión del jugador):
   · Rangos D C B A S (sin Z). Desbloqueo por maestría del elemento principal: D 0% · C 10% · B 25% · A 45% · S 65%.
   · Pago SOLO por rango, nunca por elemento, con ±25%: D 15–25 · C 30–50 · B 55–85 · A 90–130 · S 135–165.
   · Arena: entrada 10; solo cobras 50 si completas TODA la ronda. Torneo: entrada 50; solo podio 300/150/80.
   · Viaje a otro pueblo: 10 por cruce. Permiso: 200 por 28 días (viajes + arena; NO torneo).
   · Poción a medida: 2 monedas por unidad (×1.5 en desierto/montaña), karma encima: 3% por cada 10 de karma.
   · Karma −100..+100 POR PUEBLO; a −80 o menos no te venden. Comida: 5 sabores, 10 monedas, máx 3 al día.
   · Polainas: Ligeras 100 (×0.9 vel, ×1.5 crec) · Medianas 250 (×0.8, ×2) · Pesadas 500 (×0.7, ×2.5). */
window.U = window.U || {};

U.Economia = {
  RANGOS: ['D', 'C', 'B', 'A', 'S'],
  DESBLOQUEO: { D: 0, C: 10, B: 25, A: 45, S: 65 },
  PAGO: { D: [15, 25], C: [30, 50], B: [55, 85], A: [90, 130], S: [135, 165] },
  SABORES: ['dulce', 'salado', 'picante', 'ácido', 'amargo'],
  SABOR_NOM: { dulce: 'Dulce', salado: 'Salado', picante: 'Picante', 'ácido': 'Ácido', amargo: 'Amargo' },
  COMIDA_PRECIO: 10,
  // Efecto de comer según TU ranking (índice 0 = tu favorito): % del máximo. La comida NO restaura Condición.
  COMER: [ { vida: 10, esencia: 15 }, { vida: 5, esencia: 10 }, { vida: 0, esencia: 5 }, { vida: 0, esencia: 3 }, { vida: 0, esencia: 0 } ],
  // Efecto de DAR comida a un NPC según el ranking DEL NPC: confianza y ánimo.
  DAR_COMIDA: [ { conf: 8, animo: 15 }, { conf: 5, animo: 8 }, { conf: 3, animo: 3 }, { conf: 1, animo: 0 }, { conf: 0, animo: -5 } ],
  PASOS_REGALO: [8, 5, 3, 1],
  POLAINAS: {
    ligera:  { nombre: 'Polainas ligeras',  precio: 100, velMult: 0.9, crecMult: 1.5, pasosPunto: 100, condCada: 50 },
    mediana: { nombre: 'Polainas medianas', precio: 250, velMult: 0.8, crecMult: 2.0, pasosPunto: 75,  condCada: 40 },
    pesada:  { nombre: 'Polainas pesadas',  precio: 500, velMult: 0.7, crecMult: 2.5, pasosPunto: 50,  condCada: 30 }
  },
  PUEBLOS: { aldea: 'Aldea de Bruma', bosque: 'Bosque Susurrante', desierto: 'Desierto de Sal', montana: 'Montaña Brumosa', puerto: 'Puerto Brisa Azul', fuego: 'Aldea Ceniza Viva' },
  puebloDeMapa(mapaId) { if (mapaId === 'oficina' || mapaId === 'casa') return 'aldea'; return this.PUEBLOS[mapaId] ? mapaId : 'aldea'; },
  puebloActual() { const E = U.Juego.estado; return E ? this.puebloDeMapa(E.mapaId) : 'aldea'; },
  karma(j, pueblo) { j.karma = j.karma || {}; return j.karma[pueblo] || 0; },
  karmaAdd(delta, pueblo) {
    const E = U.Juego.estado, j = E.jugador; pueblo = pueblo || this.puebloActual();
    j.karma = j.karma || {}; const antes = j.karma[pueblo] || 0;
    j.karma[pueblo] = Math.max(-100, Math.min(100, antes + delta));
    if (delta !== 0 && U.Combate) U.Combate.texto(j, 'KARMA ' + (delta > 0 ? '+' : '') + delta + ' · ' + this.PUEBLOS[pueblo], delta > 0 ? '#67e08a' : '#ff5470', 1);
    return j.karma[pueblo];
  },
  // Factor de precio por karma: 3% por cada 10 → +100 = −30% · −100 = +30%.
  factorKarma(k) { return 1 - Math.max(-100, Math.min(100, k)) * 0.003; },
  factorTexto(k) { const f = this.factorKarma(k); if (k >= 0) return '−' + Math.round((1 - f) * 100) + '% de descuento'; return '+' + Math.round((f - 1) * 100) + '% de recargo'; },
  puedeVender(j, pueblo) { return this.karma(j, pueblo) > -80; },
  // Precio por lugar: Bruma ×1.0 (2/unidad); desierto y montaña ×1.5 (3/unidad). El karma va encima.
  multLugar(mapaId) { return (mapaId === 'desierto' || mapaId === 'montana') ? 1.5 : 1.0; },
  precioUnidad(mapaId, j) { const pueblo = this.puebloDeMapa(mapaId); return 2 * this.multLugar(mapaId) * this.factorKarma(this.karma(j, pueblo)); },
  precioPocion(unidades, mapaId, j) { return Math.max(1, Math.round(unidades * this.precioUnidad(mapaId, j))); },
  permisoVigente() { const E = U.Juego.estado, j = E.jugador; return !!(j.permisoHasta && E.reloj && E.reloj.dia <= j.permisoHasta); },
  // Ranking de sabores de un NPC: fijo por su id (determinista). El favorito se descubre hablando con él.
  rankingNpc(npcId) {
    let h = 2166136261; const s = 'sabor:' + npcId; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    const arr = this.SABORES.slice(); let seed = h >>> 0;
    for (let i = arr.length - 1; i > 0; i--) { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; const k = seed % (i + 1); const t = arr[i]; arr[i] = arr[k]; arr[k] = t; }
    return arr;
  },
  favoritoNpc(npcId) { return this.rankingNpc(npcId)[0]; },
  confianza(npc, delta) {
    if (!npc || !npc.estados) return;
    npc.estados.confianza = Math.max(0, Math.min(100, npc.estados.confianza + delta));
    npc.estados.animo = Math.max(0, Math.min(100, npc.estados.animo + (delta > 0 ? delta * 0.6 : delta)));
    if (U.Emociones) npc.emocion = U.Emociones.emocion(npc);
  },
  pagoRango(rango, rng) { const r = this.PAGO[rango]; return r[0] + Math.floor((rng ? rng() : Math.random()) * (r[1] - r[0] + 1)); },
  desbloqueada(rango, j) { return (j.maestria[j.elemento] || 0) >= this.DESBLOQUEO[rango]; },
  // ---------- TABLÓN: 5 misiones diarias, TOTALMENTE aleatorias ----------
  TIPOS: {
    entrega:   { nombre: 'Entrega', rangos: ['D', 'C'] },
    recoger:   { nombre: 'Recoger', rangos: ['D', 'C'] },
    escolta:   { nombre: 'Escolta', rangos: ['D', 'C', 'B', 'A'] },
    perdido:   { nombre: 'Objeto perdido', rangos: ['D', 'C'] },
    cazar:     { nombre: 'Cazar', rangos: ['C', 'B'] },
    investigar:{ nombre: 'Investigar', rangos: ['C', 'B'] },
    rescatar:  { nombre: 'Rescatar', rangos: ['B', 'A'] },
    mensaje:   { nombre: 'Mensaje urgente', rangos: ['D', 'C'] }
  },
  RAZONES: { agua: 'porque vas a la región del lago', fuego: 'porque vas a la zona quemada', tierra: 'porque vas a la zona rocosa', viento: 'porque vas a el acantilado de viento', rayo: 'porque vas a la montaña de las tormentas' },
  DESTINOS: [
    { mapa: 'aldea', x: 89.5, y: 249.5, lugar: 'la orilla del Oasis del Desierto de Sal' },
    { mapa: 'aldea', x: 83.5, y: 69.5, lugar: 'la orilla del estanque del Bosque Susurrante' },
    { mapa: 'aldea', x: 320.5, y: 48.5, lugar: 'la cima de la Montaña Brumosa' },
    { mapa: 'aldea', x: 174.5, y: 246.5, lugar: 'la Ribera Húmeda' },
    { mapa: 'aldea', x: 185.5, y: 234.5, lugar: 'el Campo de Ceniza' },
    { mapa: 'aldea', x: 68.5, y: 56.5, lugar: 'el claro norte del Bosque Susurrante' },
    { mapa: 'aldea', x: 356.5, y: 220.5, lugar: 'el Lago Brisa Azul, junto a Puerto Brisa Azul' },
    { mapa: 'aldea', x: 330.5, y: 311.5, lugar: 'la plaza de Aldea Ceniza Viva' },
    { mapa: 'aldea', x: 220.5, y: 190.5, lugar: 'la plaza de la Metrópolis' },
    { mapa: 'aldea', x: 64.5, y: 160.5, lugar: 'Arcana, la ciudad de los magos' },
    { mapa: 'aldea', x: 216.5, y: 66.5, lugar: 'la plaza de Aldea Vuelo Alto' },
    { mapa: 'aldea', x: 148.5, y: 332.5, lugar: 'la plaza de Aldea Raíz de Piedra' }
  ],
  generarTablon(rng) {
    const tipos = Object.keys(this.TIPOS); const out = [];
    const objetosPerdidos = ['un anillo de plata', 'una herramienta de la forja', 'un juguete de madera', 'una llave vieja', 'un colgante de la familia'];
    for (let i = 0; i < 5; i++) {
      const tipo = tipos[Math.floor(rng() * tipos.length)];
      let rango = this.TIPOS[tipo].rangos[Math.floor(rng() * this.TIPOS[tipo].rangos.length)];
      if (rng() < 0.07 && ['escolta', 'cazar', 'rescatar', 'investigar', 'entrega'].indexOf(tipo) >= 0) rango = 'S';
      const elemento = U.Elementos.ids[Math.floor(rng() * 5)];
      const dest = this.DESTINOS[Math.floor(rng() * this.DESTINOS.length)];
      const pago = this.pagoRango(rango, rng);
      let desc = '';
      if (tipo === 'entrega') desc = 'Lleva un paquete sellado a ' + dest.lugar + '.';
      else if (tipo === 'recoger') desc = 'Recoge un encargo que espera en ' + dest.lugar + ' y tráelo de vuelta.';
      else if (tipo === 'escolta') desc = 'Escolta a un vecino caminando hasta la entrada de su pueblo. Protégelo de los bandidos del camino.';
      else if (tipo === 'perdido') desc = 'Se perdió ' + objetosPerdidos[Math.floor(rng() * objetosPerdidos.length)] + ' por ' + dest.lugar + '. Búscalo y devuélvelo.';
      else if (tipo === 'cazar') desc = 'Una bestia molesta al pueblo cerca de ' + dest.lugar + ': come cultivos y acecha el camino. Encuéntrala y derróbala.';
      else if (tipo === 'investigar') desc = 'Se oyen ruidos extraños y faltan cosas por ' + dest.lugar + '. Ve, busca pistas y descubre qué pasa.';
      else if (tipo === 'rescatar') desc = 'Alguien está atrapado cerca de ' + dest.lugar + ', guardado por bandidos. Rescátalo.';
      else if (tipo === 'mensaje') desc = 'Lleva un mensaje urgente a ' + dest.lugar + '. Es rápido: si tardas más de 3 horas de juego, cobras la mitad.';
      out.push({ uid: 'm' + Math.floor(rng() * 1e9), tipo, rango, elemento, razon: this.RAZONES[elemento], pago, desc, destino: { mapa: dest.mapa, x: dest.x, y: dest.y, lugar: dest.lugar } });
    }
    return out;
  },
  asegurarTablon() {
    const E = U.Juego.estado; if (!E) return [];
    const dia = E.reloj ? E.reloj.dia : 1;
    if (!E.tablon || E.tablon.dia !== dia) E.tablon = { dia, lista: this.generarTablon(E.rng || Math.random) };
    return E.tablon.lista;
  }
};
