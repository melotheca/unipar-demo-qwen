/* === js/datos/habilidades.js === */
/* Unipar — técnicas: 3 por elemento (15/40/70%), formas de Yang, Yin, y datos futuros (combinadas/transformaciones/entre-mundos). */
window.U = window.U || {};

U.Habilidades = {
  UMBRALES: [15, 40, 70],
  elementos: {
    agua: [
      { id: 'chorro', nombre: 'Chorro', umbral: 15, costo: 8, forma: 'linea', alcance: 5, radio: 0, power: 1.2, cd: 1.0, desc: 'Línea precisa de agua a presión. 5 celdas, ancho 1.' },
      { id: 'ola', nombre: 'Ola', umbral: 40, costo: 14, forma: 'linea', alcance: 4, radio: 1, power: 1.35, cd: 2.2, efecto: { empuje: 2 }, desc: 'Franja ancha que empuja. 4×3 celdas.' },
      { id: 'tromba', nombre: 'Tromba', umbral: 70, costo: 22, forma: 'rect', alcance: 6, radio: 2, power: 1.7, cd: 3.5, efecto: { slow: 1.5 }, desc: 'Rectángulo 6×2: 30 celdas que frenan al enemigo.' }
    ],
    fuego: [
      { id: 'llamarada', nombre: 'Llamarada', umbral: 15, costo: 10, forma: 'alterna', alcance: 20, power: 1.3, cd: 1.2, efecto: { dot: { dmg: 2, t: 3 } }, desc: 'Línea recta en CELDAS ALTERNAS (mismo alcance que un ataque lineal): golpea las celdas 1, 3, 5, 7, 9… y SALTA las pares (2, 4, 6…), que no reciben daño. Cada celda golpeada hace +20% de daño (ráfaga concentrada) y sufre la caída por distancia normal (100% a 1 celda → 80% en la última celda). Deja quemadura.' },
      { id: 'bolafuego', nombre: 'Bola de Fuego', umbral: 40, costo: 14, forma: 'proyectil', alcance: 8, power: 1.5, cd: 1.8, explora: { radio: 1, power: 1.5 }, efecto: { dot: { dmg: 2, t: 2 } }, desc: 'Esfera que estalla en círculo.' },
      { id: 'explosion', nombre: 'Explosión Ígnea', umbral: 70, costo: 24, forma: 'circulo', radio: 2, power: 1.9, cd: 3.5, efecto: { dot: { dmg: 3, t: 3 } }, desc: 'Círculo radio 2 (~13 celdas) centrado en ti.' }
    ],
    tierra: [
      { id: 'roca', nombre: 'Roca', umbral: 15, costo: 9, forma: 'proyectil', alcance: 7, power: 1.4, cd: 1.3, efecto: { stun: 0.5 }, desc: 'Proyectil pesado que aturde.' },
      { id: 'temblor', nombre: 'Temblor', umbral: 40, costo: 16, forma: 'circulo', radio: 3, power: 1.3, cd: 3.0, efecto: { slow: 2 }, desc: 'Onda circular a tu alrededor que frena.' },
      { id: 'avalancha', nombre: 'Avalancha', umbral: 70, costo: 24, forma: 'rect', alcance: 5, radio: 2, power: 1.8, cd: 4.0, efecto: { empuje: 1.5 }, desc: 'Muro de tierra que arrasa 25 celdas.' }
    ],
    viento: [
      { id: 'rafaga', nombre: 'Ráfaga', umbral: 15, costo: 7, forma: 'linea', alcance: 7, radio: 0, power: 1.15, cd: 0.9, efecto: { empuje: 2.5 }, desc: 'Línea larga y fina que empuja.' },
      { id: 'torbellino', nombre: 'Torbellino', umbral: 40, costo: 15, forma: 'circulo', radio: 2, power: 1.3, cd: 2.5, efecto: { empuje: 3 }, desc: 'Círculo que expulsa a todos alrededor.' },
      { id: 'cuchilla', nombre: 'Cuchilla de Aire', umbral: 70, costo: 18, forma: 'linea', alcance: 9, radio: 0, power: 1.7, cd: 2.0, desc: 'Corte de 9 celdas que perfora todo.' }
    ],
    rayo: [
      { id: 'chispa', nombre: 'Chispa', umbral: 15, costo: 8, forma: 'linea', alcance: 8, radio: 0, power: 1.25, cd: 1.0, efecto: { stun: 0.35 }, desc: 'Instantánea, precisa, aturde. 8 celdas, ancho 1.' },
      { id: 'destello', nombre: 'Destello', umbral: 40, costo: 12, forma: 'destello', radio: 4, power: 0.5, cd: 3.0, efecto: { cegar: 3 }, desc: 'Flash de luz blanca (suave y gradual, nunca un estrobo): los enemigos a 4 celdas quedan CEGADOS 3 s — no te ven y sus ataques fallan. El nicho de Rayo: velocidad + luz + ceguera. Puedes reducir o apagar el destello en Pausa → Progresión / Ajustes.' },
      { id: 'cadena', nombre: 'Relámpago en cadena', umbral: 40, costo: 16, forma: 'cadena', alcance: 6, saltos: 3, power: 1.35, cd: 2.5, efecto: { stun: 0.25 }, desc: 'Salta entre 3 enemigos cercanos.' },
      { id: 'juicio', nombre: 'Juicio', umbral: 70, costo: 26, forma: 'circulo', radio: 2, centro: 'frente4', power: 2.1, cd: 4.0, efecto: { stun: 0.6 }, desc: 'El cielo cae en un punto delante de ti.' }
    ]
  },

  // Yang: energía pura BLANCA. Es un ESTILO alcanzable por cualquiera, como dominar otro elemento:
  // despierta al llevar el estilo a 5. Con afinidad (test) naces despierto en 5; sin afinidad empiezas
  // en 0 y lo alcanzas entrenando (meditar al descansar, sesiones con Torin). Haz es la forma básica;
  // Onda y Esférico suben con el estilo.
  yangDespertar: 5,
  yang: {
    haz:      { id: 'haz', nombre: 'Haz', umbral: 0, costo: 15, forma: 'linea', alcance: 10, radio: 0, power: 1.5, cd: 0.9, desc: 'Solo una línea recta, perfora. 10×1 celdas.' },
    onda:     { id: 'onda', nombre: 'Onda', umbral: 5, costo: 14, forma: 'proyectil', vel: 9, power: 1.3, cd: 1.4, efecto: { empuje: 2 }, cometa: true, desc: 'Esfera con línea de energía detrás, como cometa. Empuja.' },
    esferico: { id: 'esferico', nombre: 'Esférico', umbral: 10, costo: 18, forma: 'proyectil', vel: 6, power: 1.4, cd: 2.2, explora: { radio: 2, power: 1.8 }, desc: 'Solo una esfera: vuela y explota.' }
  },
  yangOrden: ['haz', 'onda', 'esferico'],

  // Yin: base universal, cuerpo a cuerpo, casi sin Esencia. La Velocidad decide la cadencia.
  // ESCUDO: es una TÉCNICA, no un don: hay que buscar a un Guía que te la enseñe (Kaelen, el guardia).
  // Un solo botón (B). La naturaleza del escudo es la de TU elemento o estilo, y la tabla de ventajas
  // le aplica como si el escudo fueras tú. Cobertura por nivel: Nv.1 solo de frente (y sin moverte),
  // Nv.2 frente + lados, Nv.3 los cuatro lados. Sube bloqueando golpes reales (escudoExp).
  //  Yang = energía: bloquea todo · Mágico (hechiceros enemigos): bloquea todo ·
  //  Fuego = pared que quema: débil contra físico, los rayos lo traspasan y el Agua lo APAGA (la Esencia
  //  se queda: hay que volver a levantarlo) · Agua = amortigua lo físico, pero el Rayo pasa por el agua
  //  y pega con ventaja sin romperlo · Tierra = capa de roca: fuerte contra físico, el Agua lo EROSIONA
  //  (se vuelve lodo y se rompe más rápido) · Viento = no es un muro: DESVÍA proyectiles, débil contra
  //  cuerpo a cuerpo · Rayo = campo que CASTIGA al que lo toca cuerpo a cuerpo.
  //  Ataque del mismo elemento que el escudo: el escudo lo ABSORBE (y devuelve un poco de Esencia).
  escudo: { id: 'escudo', nombre: 'Escudo', costoSeg: 9, maestro: 'kaelen',
    niveles: [null,
      { nombre: 'Frontal', cobertura: 0.2, integridad: 34, bloquesParaSubir: 10 },
      { nombre: 'Frente y lados', cobertura: -0.55, integridad: 52, bloquesParaSubir: 26 },
      { nombre: 'Cuatro lados', cobertura: -2, integridad: 78, bloquesParaSubir: Infinity } ],
    desc: 'Técnica que se aprende de un Guía (Kaelen). Un solo botón: el escudo toma la naturaleza de tu elemento o estilo. Nv.1 solo protege de frente y no te deja moverte; Nv.2 suma los lados; Nv.3 cubre los cuatro lados. La tabla de ventajas le aplica como a ti: el Agua apaga el escudo de Fuego, el Rayo atraviesa el de Agua, el Agua erosiona el de Tierra, y tu mismo elemento lo absorbe. Drena Esencia por segundo (menos si el clima favorece a tu elemento).' },
  yin: {
    normal:   { costo: 2, power: 1.0, forma: 'cono', alcance: 1.8, restaura: 6 },
    cargado:  { costo: 6, power: 1.9, forma: 'cono', alcance: 2.2, restaura: 12 },
    dash:     { costo: 4 },
    sobrecarga: { id: 'sobrecarga', nombre: 'Sobrecarga', umbral: 15, mult: 2, drain: 0.05, desc: 'Estilo Yin (Kaioken): es un INTERRUPTOR, sin duración fija ni enfriamiento — Ataque y Velocidad ×2 mientras esté activa, y la apagas con el mismo botón cuando quieras. Drena SOLO Esencia: 5% de tu Esencia máxima por segundo (mientras está activa, la recarga de Esencia se pausa, para que el drenaje sea real). Cuando la Esencia llega a 0, el drenaje pasa a VIDA a la MISMA tasa (5% de tu Vida máxima por segundo; el costo por segundo no cambia, solo cambia de dónde sale) y solamente puedes GOLPEAR (puños Yin): las técnicas quedan bloqueadas porque cuestan Esencia y no tienes. Al desactivarla se detiene el drenaje y termina el aumento de fuerza. Si la Vida llega a 0 con ella activa, caes y despiertas en la fogata, como cualquier derrota.' }
  },

  // ---- PRÓXIMAMENTE (datos listos, lógica NO activa en el juego completo) ----
  // Combinadas: automáticas cuando AMBOS elementos llegan a 15/40/70%. No hay modo de fusión.
  combinadas: {
    vapor:   { par: ['agua', 'fuego'], tec: ['Nube Hirviente', 'Ebullición', 'Vapor Cegador'] },
    lodo:    { par: ['agua', 'tierra'], tec: ['Chorro de Lodo', 'Pantano', 'Avalancha de Lodo'] },
    hielo:   { par: ['agua', 'viento'], tec: ['Carámbano', 'Ventisca', 'Prisión de Hielo'] },
    corriente:{ par: ['agua', 'rayo'], tec: ['Chispa Acuosa', 'Marea Eléctrica', 'Descarga Total'] },
    lava:    { par: ['fuego', 'tierra'], tec: ['Roca Fundida', 'Río de Lava', 'Erupción'] },
    calor:   { par: ['fuego', 'viento'], tec: ['Onda de Calor', 'Viento Ardiente', 'Incendio'] },
    centella:{ par: ['fuego', 'rayo'], tec: ['Chispa Ígnea', 'Relámpago Ígneo', 'Tormenta de Centellas'] },
    arena:   { par: ['tierra', 'viento'], tec: ['Tormenta de Arena', 'Duna', 'Torbellino de Arena'] },
    cristal: { par: ['tierra', 'rayo'], tec: ['Fragmento de Cristal', 'Muro de Cristal', 'Descarga de Cuarzo'] },
    tormenta:{ par: ['viento', 'rayo'], tec: ['Viento Eléctrico', 'Ciclón', 'Tormenta Perfecta'] }
  },
  // Transformaciones: maestría alta del elemento + nivel alto del estilo. Yang NO crea elementos nuevos.
  transformaciones: {
    yin:  { fuego: 'Puños que queman', agua: 'Palma fluida', tierra: 'Cuerpo de piedra', rayo: 'Cuerpo eléctrico', viento: 'Paso del viento' },
    yang: { fuego: { nombre: 'Plasma', tec: ['Lanza de Plasma', 'Arco de Plasma', 'Sol en Miniatura'] },
            agua:  { nombre: 'Sangre', tec: ['Parálisis de Sangre', 'Drenaje Vital', 'Marea de Sangre'], nota: 'Drenaje Vital cura hasta 100% en combate; los NPC le temen.' },
            tierra:{ nombre: 'Metal', tec: ['Hoja de Metal', 'Armadura de Metal', 'Lluvia de Metal'], nota: 'Armadura: daño 0 mientras activa, 20 Esencia + 5/s, más lento y más débil.' },
            viento:{ nombre: 'Sonido', tec: ['Onda Sónica', 'Grito Resonante', 'Vibración'] },
            rayo:  { nombre: 'Magnetismo', tec: ['Atracción', 'Repulsión', 'Tormenta Magnética'] } }
  },
  // Entre-Mundos: SOLO 3 cuando se programen. Aquí irían Teletransportación (50% Esencia, un punto), Invisibilidad (drena/s, visible al atacar) e Intangible (quieto, sin regen).
  // Las demás (Puerta, Eco, Sentido, Prisión, Intercambio, Memoria/Regresión) quedan EN CONSIDERACIÓN.
  entreMundos: { proximas: ['Teletransportación', 'Intangible'], noAprendibles: ['Invisibilidad'], nota: 'Requieren Mente alta, mucha Esencia y un Guía en el mundo espiritual. La INVISIBILIDAD no está aquí: es una técnica de HECHICEROS (Arte Místico, mental) y el jugador NO puede aprenderla — no es una técnica elemental ni congruente con ningún elemento (un dominador de Agua, por ejemplo, no la aprendería). Solo la tienen hechiceros entrenados, como los del Escuadrón Gamma de la organización secreta.' },
  // HECHICEROS (Arte Místico / Mente): casi otra vida. El test puede revelar POTENCIAL;
  // sin potencial revelado, cualquiera puede CONVERTIRSE en hechicero entrenándose con
  // los hechiceros (en Arcana): primero lo básico, durante una vida entera de práctica.
  hechiceros: { nombre: 'Arte Místico · Mente', basicas: ['Sentido', 'Rastreo', 'Barrera mental'],
    invisibilidad: { nombre: 'Invisibilidad', aprendiblePorJugador: false, razon: 'Es mental (Arte Místico), no elemental: ningún elemento la hace congruente, así que un dominador no la aprende como técnica suya. La tienen los hechiceros del Escuadrón Gamma.' },
    nota: 'Ser hechicero es casi otra vida: súper difícil, toma una vida. Primero se aprenden cosas básicas (Sentido, Rastreo, Barrera mental) y solo tras años llegan las técnicas mayores.' },
  // Reclasificadas: Destello (Rayo), Vuelo (Viento), Disco Cortante (Yang). Presentimiento/Supresión/Dominio: no se programan.
  reclasificadas: { destello: 'rayo', vuelo: 'viento', discoCortante: 'yang' }
};
