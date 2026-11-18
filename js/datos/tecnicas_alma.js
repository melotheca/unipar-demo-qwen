/* === js/datos/tecnicas_alma.js === */
/* Unipar — técnicas HEREDADAS por contrato de ALMA.
   Cuando formas un contrato de ALMA (vínculo 100 + ritual + aceptación mutua),
   la criatura ADEMÁS te PASA una de SUS técnicas por el vínculo. Es HEREDADA,
   no aprendida: NO hay minijuego, ni práctica, ni Guía que la enseñe, ni tarea
   que cumplir — te la da el alma de la criatura y queda contigo, incluso al
   cambiar de vida (el pasaporte la vuelve a heredar en la vida nueva).
   Solo el contrato de alma la da: el de sangre solo invoca, esta vida.
   Una técnica distinta POR ESPECIE (una por cada entrada de U.Criaturas.ESPECIES).
   Inspiración: movimientos tipo Pokémon (tipo + poder + efecto: quemar, paralizar,
   envenenar, frenar, cegar), jutsu elementales tipo Naruto (bola de fuego, dragón
   de agua, hoja de rayo, muro de tierra) y energía tipo Dragon Ball (haz cargado,
   esfera de energía, aura) — adaptados los CONCEPTOS y las MECÁNICAS, con NOMBRES
   ORIGINALES en español, del mundo de Unipar. Ningún nombre con copyright.
   Esquema: id, nombre, elemento (el de la especie), costo, forma, alcance/radio,
   power, cd, efecto, desc, origen 'heredada'. Solo formas y efectos que
   combate.js soporta: linea, proyectil, circulo, rect, alterna, cono, cadena,
   destello; empuje, slow, dot, stun, cegar. Costos 7-26 Esencia, power 1.15-2.1
   (salvo 'destello': power 0.5 como el Destello de Rayo, porque su fuerza es
   cegar, no el daño directo). umbral 0: no pide maestría — es heredada. */
window.U = window.U || {};

U.TecnicasAlma = {
  POR_ESPECIE: {
    // Lobo del bosque (tierra) — Inspiración: Pokémon, mordida que hace retroceder.
    loboBosque:    { id: 'mordiscoManada', nombre: 'Mordisco de Manada', elemento: 'tierra', costo: 12, forma: 'cono', alcance: 2, radio: 0, power: 1.5, cd: 1.6, efecto: { empuje: 2 }, origen: 'heredada', umbral: 0, desc: 'Te lanzas como la manada: mordida al frente que empuja al enemigo 2 celdas.' },
    // Ciervo susurrante (viento) — Inspiración: Pokémon, ataque veloz que llega primero.
    ciervo:        { id: 'saltoCiervo', nombre: 'Salto del Ciervo', elemento: 'viento', costo: 10, forma: 'linea', alcance: 7, radio: 0, power: 1.3, cd: 1.2, efecto: { empuje: 2.5 }, origen: 'heredada', umbral: 0, desc: 'Un salto imposible de seguir: cruzas 7 celdas en línea y empujas lo que encuentras.' },
    // Espíritu del bosque (viento) — Inspiración: Pokémon, canto/polvo que duerme (aquí: frena); Naruto, ilusión.
    espirituBosque:{ id: 'susurroBosque', nombre: 'Susurro del Bosque', elemento: 'viento', costo: 15, forma: 'circulo', radio: 2, power: 1.3, cd: 2.8, efecto: { slow: 2 }, origen: 'heredada', umbral: 0, desc: 'El bosque susurra y todo a tu alrededor se vuelve lento 2 s.' },
    // Bestia de arena (tierra) — Inspiración: Pokémon, tormenta de arena; Naruto, muro de tierra.
    bestiaArena:   { id: 'tormentaArena', nombre: 'Tormenta de Arena', elemento: 'tierra', costo: 20, forma: 'rect', alcance: 5, radio: 2, power: 1.6, cd: 3.5, efecto: { empuje: 1.5 }, origen: 'heredada', umbral: 0, desc: 'Un muro de arena que arrasa 25 celdas y empuja a quien alcanza.' },
    // Escorpión de sal (tierra) — Inspiración: Pokémon, aguijón venenoso (dot).
    escorpion:     { id: 'aguijonSal', nombre: 'Aguijón de Sal', elemento: 'tierra', costo: 14, forma: 'proyectil', alcance: 7, power: 1.5, cd: 1.8, efecto: { dot: { dmg: 2, t: 3 } }, origen: 'heredada', umbral: 0, desc: 'Aguijón certero que envenena: 2 de daño por 3 s.' },
    // Lagarto de sal (fuego) — Inspiración: Pokémon, brasa que quema; Naruto, bola de fuego.
    lagartoArena:  { id: 'lenguaBrasa', nombre: 'Lengua de Brasa', elemento: 'fuego', costo: 12, forma: 'linea', alcance: 6, radio: 0, power: 1.35, cd: 1.4, efecto: { dot: { dmg: 2, t: 2 } }, origen: 'heredada', umbral: 0, desc: 'Lengua de fuego que lame 6 celdas y deja quemadura 2 s.' },
    // Lobo de nieve (agua) — Inspiración: Pokémon, viento helado que frena.
    loboNieve:     { id: 'aullidoGelido', nombre: 'Aullido Gélido', elemento: 'agua', costo: 13, forma: 'cono', alcance: 3, radio: 0, power: 1.4, cd: 1.8, efecto: { slow: 1.5 }, origen: 'heredada', umbral: 0, desc: 'Aullido helado al frente: frena 1.5 s a quien lo escucha.' },
    // Yeti joven (agua) — Inspiración: Pokémon, puño helado y ventisca en área.
    yeti:          { id: 'punoVentisca', nombre: 'Puño de Ventisca', elemento: 'agua', costo: 18, forma: 'circulo', radio: 2, power: 1.7, cd: 3.2, efecto: { slow: 2 }, origen: 'heredada', umbral: 0, desc: 'Puñetazo que levanta una ventisca a tu alrededor y frena 2 s.' },
    // Criatura de hielo (agua) — Inspiración: Pokémon, fragmento de hielo que paraliza.
    criaturaHielo: { id: 'carambano', nombre: 'Carámbano', elemento: 'agua', costo: 15, forma: 'proyectil', alcance: 8, power: 1.55, cd: 1.9, efecto: { stun: 0.4 }, origen: 'heredada', umbral: 0, desc: 'Carámbano lanzado como una lanza: aturde 0.4 s.' },
    // Espíritu de hielo (agua) — Inspiración: Pokémon, destello de luz; Naruto, ilusión que ciega.
    espirituHielo: { id: 'brilloEscarcha', nombre: 'Brillo de Escarcha', elemento: 'agua', costo: 12, forma: 'destello', radio: 4, power: 0.5, cd: 3.0, efecto: { cegar: 3 }, origen: 'heredada', umbral: 0, desc: 'Destello suave de escarcha: ciega 3 s a los enemigos a 4 celdas, sin daño directo.' },
    // Serpiente de agua (agua) — Inspiración: Pokémon, colmillo venenoso y cola acuática.
    serpienteAgua: { id: 'colmilloMarea', nombre: 'Colmillo de Marea', elemento: 'agua', costo: 14, forma: 'linea', alcance: 6, radio: 0, power: 1.5, cd: 1.6, efecto: { dot: { dmg: 2, t: 2 } }, origen: 'heredada', umbral: 0, desc: 'Mordida de agua que envenena como la serpiente: 2 de daño por 2 s.' },
    // Nutria del lago (agua) — Inspiración: Pokémon, remolino que atrapa y expulsa.
    nutria:        { id: 'remolinoJugueton', nombre: 'Remolino Juguetón', elemento: 'agua', costo: 13, forma: 'circulo', radio: 2, power: 1.2, cd: 2.4, efecto: { empuje: 3 }, origen: 'heredada', umbral: 0, desc: 'Remolino juguetón que expulsa a todos a tu alrededor.' },
    // Tortuga del lago (agua) — Inspiración: Pokémon, giro rápido y cabezazo con caparazón.
    tortugaLago:   { id: 'embestidaCaparazon', nombre: 'Embestida de Caparazón', elemento: 'agua', costo: 13, forma: 'cono', alcance: 2, radio: 0, power: 1.6, cd: 1.8, efecto: { stun: 0.5 }, origen: 'heredada', umbral: 0, desc: 'Carga con el caparazón por delante: aturde 0.5 s.' },
    // Ajolote de la laguna (agua) — Inspiración: Pokémon, chorro veloz de agua.
    ajolote:       { id: 'colaLaguna', nombre: 'Cola de la Laguna', elemento: 'agua', costo: 10, forma: 'linea', alcance: 5, radio: 0, power: 1.25, cd: 1.2, efecto: { slow: 1.5 }, origen: 'heredada', umbral: 0, desc: 'Latigazo de cola con agua de la laguna: frena 1.5 s.' },
    // Salamandra de ceniza (fuego) — Inspiración: Naruto, dragón de fuego que avanza; Pokémon, fuego fatuo que quema.
    salamandraCeniza:{ id: 'rastroCeniza', nombre: 'Rastro de Ceniza', elemento: 'fuego', costo: 16, forma: 'alterna', alcance: 10, radio: 0, power: 1.35, cd: 2.0, efecto: { dot: { dmg: 2, t: 3 } }, origen: 'heredada', umbral: 0, desc: 'Línea de ceniza y fuego en celdas alternas (1, 3, 5…): deja quemadura 3 s.' },
    // Bestia de brasas (fuego) — Inspiración: Pokémon, carga envuelta en fuego que quema; Dragon Ball, carga con aura.
    bestiaBrasas:  { id: 'cargaBrasas', nombre: 'Carga de Brasas', elemento: 'fuego', costo: 20, forma: 'cono', alcance: 3, radio: 0, power: 1.8, cd: 3.0, efecto: { dot: { dmg: 3, t: 2 } }, origen: 'heredada', umbral: 0, desc: 'Carga envuelta en brasas: quema 3 de daño por 2 s.' },
    // Serpiente de tormenta (rayo) — Inspiración: Pokémon, colmillo de rayo; Naruto, hoja de rayo que salta.
    serpienteTormenta:{ id: 'colmilloTormenta', nombre: 'Colmillo de Tormenta', elemento: 'rayo', costo: 18, forma: 'cadena', alcance: 6, saltos: 3, power: 1.4, cd: 2.5, efecto: { stun: 0.3 }, origen: 'heredada', umbral: 0, desc: 'Mordida eléctrica que salta entre 3 enemigos y los aturde 0.3 s.' },
    // Búho de tormenta (rayo) — Inspiración: Pokémon, onda de trueno que paraliza.
    buhoTormenta:  { id: 'gritoElectrico', nombre: 'Grito Eléctrico', elemento: 'rayo', costo: 12, forma: 'linea', alcance: 8, radio: 0, power: 1.3, cd: 1.4, efecto: { stun: 0.35 }, origen: 'heredada', umbral: 0, desc: 'Grito que es un latigazo de rayo: 8 celdas y aturde 0.35 s.' },
    // Halcón de viento (viento) — Inspiración: Pokémon, ave en picado; Dragon Ball, embestida aérea.
    halconViento:  { id: 'zambullidaHalcon', nombre: 'Zambullida del Halcón', elemento: 'viento', costo: 16, forma: 'linea', alcance: 9, radio: 0, power: 1.7, cd: 2.0, efecto: { empuje: 2 }, origen: 'heredada', umbral: 0, desc: 'Zambullida en picado: 9 celdas que perforan y empujan.' },
    // Grifo joven (viento) — Inspiración: Naruto, muro de viento; Pokémon, corte de aire.
    grifoJoven:    { id: 'vueloGrifo', nombre: 'Vuelo del Grifo', elemento: 'viento', costo: 19, forma: 'rect', alcance: 6, radio: 1, power: 1.6, cd: 3.0, efecto: { empuje: 2 }, origen: 'heredada', umbral: 0, desc: 'El grifo cruza el aire en una franja de 6 celdas que empuja a quien toca.' }
  },
  porEspecie(especie) { return this.POR_ESPECIE[especie] || null; },
  porId(id) {
    if (!id) return null;
    const corto = String(id).indexOf('alma:') === 0 ? String(id).slice(5) : String(id);
    const claves = Object.keys(this.POR_ESPECIE);
    for (let i = 0; i < claves.length; i++) { const t = this.POR_ESPECIE[claves[i]]; if (t.id === corto) return Object.assign({ especie: claves[i] }, t); }
    return null;
  },
  todas() { return Object.keys(this.POR_ESPECIE).map(k => Object.assign({ especie: k }, this.POR_ESPECIE[k])); },
  idRegistro(tecOId) { const t = typeof tecOId === 'string' ? this.porId(tecOId) : tecOId; return t ? 'alma:' + t.id : null; }
};
