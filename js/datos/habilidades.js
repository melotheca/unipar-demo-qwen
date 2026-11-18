/* === js/datos/habilidades.js === */
/* Unipar — catálogo de técnicas en 8 GRUPOS (5 elementos + Yin + Yang + Místico).
   - GENERALES (por elemento): cualquiera con ese elemento las aprende por maestría
     mínima (umbral %) o por Guía, sin minijuego. 6 por elemento (umbrales
     15/40/70 para las 3 primeras; 25/55/85 para la 4ª/5ª/6ª, que se desbloquean después).
   - ESPECIALES (lista `especiales`): movimientos raros/avanzados, NO se aprenden por
     maestría: SOLO de un Guía, con el minijuego de U.Aprendizaje. Marca: especial:true
     + origen:'guia' + maestro. En el registro van con kind 'elemento' (para que el
     equipo, el HUD y tecnica() las traten como una técnica más); aprendida() solo
     las da por concedidas, nunca por maestría.
   - FUSIONES (lista `fusiones`): la 1ª técnica de cada par de `combinadas`, usable
     cuando AMBOS elementos llegan al umbral (15%). Marca: fusion:true + par:[a,b].
   - YIN y YANG son grupos propios (como un elemento más): Yin = físico especial
     (el puño NORMAL es universal y NO es técnica: no está en el catálogo; el Golpe
     Rompe-Todo sí está, como puño cargado); Yang = energía blanca.
   - MÍSTICO (Arte Místico / Mente): solo para hechiceros (puerta: j.hechicero —
     potencial del test o basicos entrenados en Arcana). Su umbral NO es maestría %:
     es el nivel de básicos de hechicero requerido. La INVISIBILIDAD está en la
     lista para los hechiceros NPC, marcada aprendiblePorJugador:false.
   Inspiración (CONCEPTOS, nombres 100% originales en español): variedad de
   movimientos por tipo con efecto propio (quemar, paralizar, frenar, aturdir);
   dragones, muros, hojas y serpientes hechas del elemento; haces y esferas de
   energía cargados, discos de energía y potenciación temporal; clones e ilusiones
   que confunden al enemigo. Nada de nombres de otras obras: todo renombrado. */
window.U = window.U || {};

U.Habilidades = {
  UMBRALES: [15, 40, 70],
  elementos: {
    agua: [
      { id: 'chorro', nombre: 'Chorro', umbral: 15, costo: 8, forma: 'linea', alcance: 5, radio: 0, power: 1.2, cd: 1.0, desc: 'Línea precisa de agua a presión. 5 celdas, ancho 1.' },
      { id: 'ola', nombre: 'Ola', umbral: 40, costo: 14, forma: 'linea', alcance: 4, radio: 1, power: 1.35, cd: 2.2, efecto: { empuje: 2 }, desc: 'Franja ancha que empuja. 4×3 celdas.' },
      { id: 'tromba', nombre: 'Tromba', umbral: 70, costo: 22, forma: 'rect', alcance: 6, radio: 2, power: 1.7, cd: 3.5, efecto: { slow: 1.5 }, desc: 'Rectángulo 6×2: 30 celdas que frenan al enemigo.' },
      { id: 'mareaAgujas', nombre: 'Marea de Agujas', umbral: 25, costo: 15, forma: 'proyectil', alcance: 7, power: 1.45, cd: 1.6, efecto: { slow: 1 }, desc: 'Lluvia de agujas de agua que cosen al enemigo y lo dejan lento. Proyectil de 7 celdas.' },
      { id: 'serpienteRio', nombre: 'Serpiente del Río', umbral: 55, costo: 18, forma: 'linea', alcance: 6, radio: 0, power: 1.6, cd: 2.4, efecto: { empuje: 2 }, desc: 'Una serpiente hecha de río que embiste en línea recta y arrastra a quien golpea. 6 celdas.' },
      { id: 'prisionMarea', nombre: 'Prisión de Marea', umbral: 85, costo: 25, forma: 'circulo', radio: 2, power: 1.85, cd: 4.0, efecto: { stun: 0.7 }, desc: 'El agua se cierra en círculo a tu alrededor y deja atrapados a los de adentro. Radio 2.' }
    ],
    fuego: [
      { id: 'llamarada', nombre: 'Llamarada', umbral: 15, costo: 10, forma: 'alterna', alcance: 20, power: 1.3, cd: 1.2, efecto: { dot: { dmg: 2, t: 3 } }, desc: 'Línea recta en CELDAS ALTERNAS (mismo alcance que un ataque lineal): golpea las celdas 1, 3, 5, 7, 9… y SALTA las pares (2, 4, 6…), que no reciben daño. Cada celda golpeada hace +20% de daño (ráfaga concentrada) y sufre la caída por distancia normal (100% a 1 celda → 80% en la última celda). Deja quemadura.' },
      { id: 'bolafuego', nombre: 'Bola de Fuego', umbral: 40, costo: 14, forma: 'proyectil', alcance: 8, power: 1.5, cd: 1.8, explora: { radio: 1, power: 1.5 }, efecto: { dot: { dmg: 2, t: 2 } }, desc: 'Esfera que estalla en círculo.' },
      { id: 'explosion', nombre: 'Explosión Ígnea', umbral: 70, costo: 24, forma: 'circulo', radio: 2, power: 1.9, cd: 3.5, efecto: { dot: { dmg: 3, t: 3 } }, desc: 'Círculo radio 2 (~13 celdas) centrado en ti.' },
      { id: 'colmilloBrasa', nombre: 'Colmillo de Brasa', umbral: 25, costo: 15, forma: 'cono', alcance: 3, power: 1.5, cd: 1.6, efecto: { dot: { dmg: 2, t: 2 } }, desc: 'Mordida de fuego en abanico que deja quemadura. Corto, 3 celdas.' },
      { id: 'serpienteFuego', nombre: 'Serpiente de Fuego', umbral: 55, costo: 19, forma: 'linea', alcance: 8, power: 1.6, cd: 2.4, efecto: { dot: { dmg: 2, t: 3 } }, desc: 'Una serpiente de llamas que corre en línea recta y quema a quien cruza. 8 celdas.' },
      { id: 'lluviaBrasas', nombre: 'Lluvia de Brasas', umbral: 85, costo: 26, forma: 'circulo', radio: 2, centro: 'frente4', power: 2.0, cd: 4.0, efecto: { dot: { dmg: 3, t: 3 } }, desc: 'El cielo se abre delante de ti y caen brasas sobre un círculo a 4 celdas. Tu ataque final de Fuego.' }
    ],
    tierra: [
      { id: 'roca', nombre: 'Roca', umbral: 15, costo: 9, forma: 'proyectil', alcance: 7, power: 1.4, cd: 1.3, efecto: { stun: 0.5 }, desc: 'Proyectil pesado que aturde.' },
      { id: 'temblor', nombre: 'Temblor', umbral: 40, costo: 16, forma: 'circulo', radio: 3, power: 1.3, cd: 3.0, efecto: { slow: 2 }, desc: 'Onda circular a tu alrededor que frena.' },
      { id: 'avalancha', nombre: 'Avalancha', umbral: 70, costo: 24, forma: 'rect', alcance: 5, radio: 2, power: 1.8, cd: 4.0, efecto: { empuje: 1.5 }, desc: 'Muro de tierra que arrasa 25 celdas.' },
      { id: 'muroPiedra', nombre: 'Muro de Piedra', umbral: 25, costo: 15, forma: 'rect', alcance: 4, radio: 1, power: 1.45, cd: 2.0, efecto: { empuje: 2 }, desc: 'Un muro que se levanta del suelo y empuja todo lo que tiene delante. 4×3 celdas.' },
      { id: 'garraMontana', nombre: 'Garra de la Montaña', umbral: 55, costo: 19, forma: 'cono', alcance: 3, power: 1.65, cd: 2.4, efecto: { stun: 0.6 }, desc: 'Zarpazo de piedra en abanico que aturde. Corto y pesado, 3 celdas.' },
      { id: 'terremoto', nombre: 'Terremoto', umbral: 85, costo: 25, forma: 'circulo', radio: 3, power: 1.9, cd: 4.0, efecto: { slow: 2.5 }, desc: 'El suelo entero se sacude a tu alrededor y deja a todos lentos. Radio 3.' }
    ],
    viento: [
      { id: 'rafaga', nombre: 'Ráfaga', umbral: 15, costo: 7, forma: 'linea', alcance: 7, radio: 0, power: 1.15, cd: 0.9, efecto: { empuje: 2.5 }, desc: 'Línea larga y fina que empuja.' },
      { id: 'torbellino', nombre: 'Torbellino', umbral: 40, costo: 15, forma: 'circulo', radio: 2, power: 1.3, cd: 2.5, efecto: { empuje: 3 }, desc: 'Círculo que expulsa a todos alrededor.' },
      { id: 'cuchilla', nombre: 'Cuchilla de Aire', umbral: 70, costo: 18, forma: 'linea', alcance: 9, radio: 0, power: 1.7, cd: 2.0, desc: 'Corte de 9 celdas que perfora todo.' },
      { id: 'hojaVendaval', nombre: 'Hoja del Vendaval', umbral: 25, costo: 14, forma: 'linea', alcance: 8, radio: 0, power: 1.5, cd: 1.6, efecto: { empuje: 2 }, desc: 'Una hoja de viento que corta en línea recta y empuja. 8 celdas.' },
      { id: 'vendavalCortante', nombre: 'Vendaval Cortante', umbral: 55, costo: 18, forma: 'alterna', alcance: 12, power: 1.55, cd: 2.2, desc: 'Ráfagas en celdas alternas que cortan como cuchillas. 12 celdas de alcance.' },
      { id: 'tifon', nombre: 'Tifón del Cielo', umbral: 85, costo: 24, forma: 'circulo', radio: 2, power: 1.9, cd: 3.5, efecto: { empuje: 3 }, desc: 'Un tifón que nace a tu alrededor y lanza lejos a todo lo que toca. Radio 2.' }
    ],
    rayo: [
      { id: 'chispa', nombre: 'Chispa', umbral: 15, costo: 8, forma: 'linea', alcance: 8, radio: 0, power: 1.25, cd: 1.0, efecto: { stun: 0.35 }, desc: 'Instantánea, precisa, aturde. 8 celdas, ancho 1.' },
      { id: 'destello', nombre: 'Destello', umbral: 40, costo: 12, forma: 'destello', radio: 4, power: 0.5, cd: 3.0, efecto: { cegar: 3 }, desc: 'Flash de luz blanca (suave y gradual, nunca un estrobo): los enemigos a 4 celdas quedan CEGADOS 3 s — no te ven y sus ataques fallan. El nicho de Rayo: velocidad + luz + ceguera. Puedes reducir o apagar el destello en Pausa → Progresión / Ajustes.' },
      { id: 'cadena', nombre: 'Relámpago en cadena', umbral: 40, costo: 16, forma: 'cadena', alcance: 6, saltos: 3, power: 1.35, cd: 2.5, efecto: { stun: 0.25 }, desc: 'Salta entre 3 enemigos cercanos.' },
      { id: 'juicio', nombre: 'Juicio', umbral: 70, costo: 26, forma: 'circulo', radio: 2, centro: 'frente4', power: 2.1, cd: 4.0, efecto: { stun: 0.6 }, desc: 'El cielo cae en un punto delante de ti.' },
      { id: 'lanzaCielo', nombre: 'Lanza del Cielo', umbral: 55, costo: 18, forma: 'proyectil', alcance: 9, power: 1.6, cd: 2.2, efecto: { stun: 0.5 }, desc: 'Una lanza de relámpago que vuela recta y aturde a quien alcanza. 9 celdas.' },
      { id: 'cieloPartido', nombre: 'Cielo Partido', umbral: 85, costo: 24, forma: 'cadena', alcance: 8, saltos: 4, power: 1.7, cd: 3.5, efecto: { stun: 0.5 }, desc: 'El relámpago salta entre 4 enemigos y los deja aturdidos. Tu tormenta final de Rayo.' }
    ],
    // ---- YIN (grupo propio, como un elemento más) ----
    // El puño NORMAL no está aquí: es universal, botón por defecto, fuera del equipo.
    // El Golpe Rompe-Todo SÍ está (puño cargado), pero no se equipa (equipo:false):
    // se ejecuta manteniendo presionado el botón de puño. La Velocidad Extrema (dash)
    // vive en Yang (ver abajo). Sobrecarga y Acero son interruptores equipables.
    yin: [
      { id: 'rompeTodo', nombre: 'Golpe Rompe-Todo', umbral: 0, costo: 6, forma: 'cono', alcance: 2.2, power: 1.9, cd: 0.6, equipo: false, desc: 'El puño CARGADO de Yin: mantén presionado el botón de puño y suelta. No se equipa: es el puño, cargado. Restaura Esencia al golpear, como todo Yin.' },
      { id: 'sobrecarga', nombre: 'Sobrecarga', umbral: 15, costo: '5%/s', forma: 'toggle', cd: 0, desc: 'Interruptor Yin: Ataque y Velocidad ×2 mientras esté activa. Drena 5% de tu Esencia máxima por segundo (luego Vida, a la misma tasa). Se apaga con el mismo botón.' },
      { id: 'acero', nombre: 'Resistencia de Acero', umbral: 20, costo: 6, forma: 'toggle', cd: 0, desc: 'Interruptor Yin: tu cuerpo se endurece como acero y el daño que recibes se reduce a la mitad. Cuesta 6 al activar y drena 2/s. No te pone lento.' },
      { id: 'puñoMontana', nombre: 'Puño de la Montaña', umbral: 25, costo: 8, forma: 'cono', alcance: 2, power: 1.6, cd: 1.5, efecto: { empuje: 2 }, desc: 'Un puño pesado como una montaña que empuja al enemigo dos celdas. Cuerpo a cuerpo.' },
      { id: 'lluviaPuños', nombre: 'Lluvia de Puños', umbral: 40, costo: 10, forma: 'cono', alcance: 2, power: 1.3, cd: 2.0, efecto: { stun: 0.4 }, desc: 'Una lluvia de puños rápidos en abanico que deja aturdido a quien recibe. Cuerpo a cuerpo.' },
      { id: 'palmaSueño', nombre: 'Palma del Sueño', umbral: 55, costo: 9, forma: 'cono', alcance: 2, power: 1.4, cd: 1.8, efecto: { slow: 1.5 }, desc: 'Palma precisa a un punto del cuerpo: no rompe, duerme. El enemigo queda lento 1.5 s. Cuerpo a cuerpo.' }
    ],
    // ---- YANG (grupo propio, como un elemento más) ----
    // Energía pura BLANCA. La Velocidad Extrema (dash) es un movimiento de Yang, pero
    // no se equipa (equipo:false): es el botón de dash. Tiempo Lento es interruptor.
    yang: [
      { id: 'haz', nombre: 'Haz', umbral: 0, costo: 15, forma: 'linea', alcance: 10, radio: 0, power: 1.5, cd: 0.9, desc: 'Solo una línea recta, perfora. 10×1 celdas.' },
      { id: 'onda', nombre: 'Onda', umbral: 5, costo: 14, forma: 'proyectil', vel: 9, power: 1.3, cd: 1.4, efecto: { empuje: 2 }, cometa: true, desc: 'Esfera con línea de energía detrás, como cometa. Empuja.' },
      { id: 'esferico', nombre: 'Esférico', umbral: 10, costo: 18, forma: 'proyectil', vel: 6, power: 1.4, cd: 2.2, explora: { radio: 2, power: 1.8 }, desc: 'Solo una esfera: vuela y explota.' },
      { id: 'golpeVeloz', nombre: 'Golpe Veloz', umbral: 15, costo: 8, forma: 'cono', alcance: 2, radio: 0, power: 1.35, cd: 0.35, icono: 'yin', desc: 'Puño Yang rapidísimo: sin carga, sin preparación, difícil de esquivar. Cuerpo a cuerpo (2 celdas). Pega más que el puño normal, menos que el cargado.' },
      { id: 'discoEsencia', nombre: 'Disco de Esencia', umbral: 20, costo: 20, forma: 'proyectil', vel: 8, alcance: 9, power: 1.6, cd: 2.4, desc: 'Un disco de energía blanca que gira y vuela recto, cortando lo que cruza. 9 celdas.' },
      { id: 'rayoAmanecer', nombre: 'Rayo del Amanecer', umbral: 30, costo: 22, forma: 'linea', alcance: 12, power: 1.9, cd: 3.0, desc: 'Un haz de energía cargado, blanco como el amanecer, que perfora 12 celdas en línea recta. Tu ataque final de Yang.' },
      { id: 'tiempoLento', nombre: 'Tiempo Lento', umbral: 25, costo: 'dreno', forma: 'toggle', icono: 'tiempo', desc: 'Cámara lenta: el mundo se pone lento y tú sigues a tu velocidad. Drena Esencia rápido por segundo; a más nivel de Yang, más lento el mundo y menos dreno. El reloj del día sigue a su ritmo.' },
      { id: 'velocidadExtrema', nombre: 'Velocidad Extrema', umbral: 0, costo: '12→4', forma: 'dash', cd: 0.6, equipo: false, desc: 'El dash: te mueves al instante y golpeas a quien cruzas. Es un movimiento de Yang, pero no se equipa: es el botón de dash. Su costo baja con tu estilo Yang: 12 al aprenderlo, 10 a 25, 8 a 50, 6 a 75 y 4 al dominarlo (100).' }
    ],
    // ---- MÍSTICO (Arte Místico / Mente — grupo propio, como un elemento más) ----
    // Umbral = nivel de BÁSICOS de hechicero requerido (j.hechicero.basicos), NO
    // maestría %. Puerta: potencial del test o haber empezado el camino en Arcana.
    mistico: [
      { id: 'veloNiebla', nombre: 'Velo de Niebla', umbral: 0, costo: 12, forma: 'cono', alcance: 4, power: 0.8, cd: 2.0, efecto: { cegar: 2 }, desc: 'Una ilusión de niebla que ciega 2 s a quien queda dentro. El enemigo no te ve y falla. 4 celdas.' },
      { id: 'ecoMental', nombre: 'Eco Mental', umbral: 0, costo: 14, forma: 'linea', alcance: 6, power: 1.2, cd: 2.0, efecto: { slow: 1.5 }, desc: 'Un eco en la mente del enemigo que lo confunde y lo deja lento. 6 celdas.' },
      { id: 'miradaPesa', nombre: 'Mirada que Pesa', umbral: 1, costo: 16, forma: 'linea', alcance: 5, power: 1.0, cd: 2.5, efecto: { stun: 1.0 }, desc: 'Lo miras fijo y su cuerpo se queda quieto 1 s: la mente manda sobre el cuerpo. 5 celdas.' },
      { id: 'prisionEspejo', nombre: 'Prisión del Espejo', umbral: 2, costo: 20, forma: 'circulo', radio: 2, power: 1.5, cd: 3.5, efecto: { stun: 0.8 }, desc: 'Un círculo de espejos que atrapa y aturde a los de adentro. Radio 2.' },
      { id: 'inversion', nombre: 'Inversión', umbral: 1, costo: 12, forma: 'hechizo', cd: 0, equipo: false, desc: 'El hechizo que remapea el movimiento del enemigo al azar unos segundos. Se aprende en el obelisco de la Montaña (tecla V): no se equipa, no va en el equipo.' },
      { id: 'invisibilidad', nombre: 'Invisibilidad', umbral: 99, costo: 'dreno', forma: 'toggle', equipo: false, aprendiblePorJugador: false, desc: 'Solo la tienen los hechiceros del Escuadrón Gamma. El jugador NO puede aprenderla: es mental, no elemental.' }
    ]
  },

  // ---- TÉCNICAS ESPECIALES (grupo aparte del catálogo general) ----
  // Movimientos raros/avanzados. NO se aprenden por maestría: SOLO de un Guía, con
  // el minijuego de U.Aprendizaje (la demostración va MUY rápida al principio y se
  // va poniendo más lenta con la práctica, hasta dominarla). Marca: especial:true,
  // origen:'guia', maestro (id del Guía que la enseña). `umbral` no aplica.
  especiales: [
    { id: 'dragonLago', nombre: 'Dragón del Lago', elemento: 'agua', maestro: 'sora', costo: 24, forma: 'linea', alcance: 8, power: 1.9, cd: 3.0, efecto: { empuje: 2 }, desc: 'ESPECIAL · Solo la enseña Sora (minijuego de aprendizaje): un dragón hecho de agua del lago que embiste 8 celdas y arrastra a quien golpea.' },
    { id: 'florEscarcha', nombre: 'Flor de Escarcha', elemento: 'agua', maestro: 'sora', costo: 20, forma: 'rect', alcance: 5, radio: 1, power: 1.7, cd: 2.6, efecto: { slow: 2 }, desc: 'ESPECIAL · Solo la enseña Sora (minijuego de aprendizaje): una flor de escarcha que se abre en rectángulo y congela el paso 2 s. 5×3 celdas.' },
    { id: 'fenixBrasas', nombre: 'Fénix de Brasas', elemento: 'fuego', maestro: 'torin', costo: 25, forma: 'proyectil', alcance: 8, power: 1.9, cd: 3.2, explora: { radio: 2, power: 1.9 }, efecto: { dot: { dmg: 3, t: 3 } }, desc: 'ESPECIAL · Solo la enseña Torin (minijuego de aprendizaje): un ave de brasas que vuela y estalla, dejando quemadura. 8 celdas.' },
    { id: 'puñoCometa', nombre: 'Puño del Cometa', elemento: 'fuego', maestro: 'kaelen', costo: 20, forma: 'cono', alcance: 3, power: 1.8, cd: 2.2, efecto: { dot: { dmg: 2, t: 2 } }, desc: 'ESPECIAL · Solo la enseña Kaelen (minijuego de aprendizaje): un puño envuelto en fuego que cae como un cometa y quema. 3 celdas.' },
    { id: 'colosoPiedra', nombre: 'Coloso de Piedra', elemento: 'tierra', maestro: 'breno', costo: 25, forma: 'circulo', radio: 2, power: 1.9, cd: 3.5, efecto: { stun: 0.8 }, desc: 'ESPECIAL · Solo la enseña Breno (minijuego de aprendizaje): un coloso de piedra se levanta a tu alrededor y aturde a los de adentro. Radio 2.' },
    { id: 'hojaHuracan', nombre: 'Hoja del Huracán', elemento: 'viento', maestro: 'marco', costo: 23, forma: 'alterna', alcance: 14, power: 1.8, cd: 2.8, desc: 'ESPECIAL · Solo la enseña Marco (minijuego de aprendizaje): una hoja de huracán en celdas alternas que corta a 14 celdas.' },
    { id: 'danzaHojas', nombre: 'Danza de las Mil Hojas', elemento: 'viento', maestro: 'marco', costo: 22, forma: 'circulo', radio: 2, power: 1.8, cd: 3.0, efecto: { empuje: 2 }, desc: 'ESPECIAL · Solo la enseña Marco (minijuego de aprendizaje): mil hojas de viento danzan en círculo a tu alrededor y expulsan a todos. Radio 2.' },
    { id: 'lanzaAmanecer', nombre: 'Lanza del Amanecer', elemento: 'rayo', maestro: 'aldric', costo: 24, forma: 'linea', alcance: 10, power: 1.9, cd: 3.0, efecto: { stun: 0.6 }, desc: 'ESPECIAL · Solo la enseña Aldric (minijuego de aprendizaje): una lanza de luz del amanecer que perfora 10 celdas y aturde.' }
  ],
  especialesDeGuia(guiaId) { return (this.especiales || []).filter(h => h.maestro === guiaId); },

  // ---- FUSIONES (1ª técnica de cada par, usable) ----
  // La 1ª de cada par de `combinadas` (las 2ª/3ª siguen siendo solo nombres, futuro).
  // Desbloqueo: AMBOS elementos del par llegan al umbral (15%). Marca: fusion:true.
  fusiones: {
    vapor:     { par: ['agua', 'fuego'], nombre: 'Nube Hirviente', umbral: 15, costo: 20, forma: 'circulo', radio: 2, power: 1.6, cd: 3.0, efecto: { dot: { dmg: 2, t: 3 } }, desc: 'FUSIÓN Agua+Fuego (ambos al 15%): una nube que hierve a los de adentro. Radio 2.' },
    lodo:      { par: ['agua', 'tierra'], nombre: 'Chorro de Lodo', umbral: 15, costo: 16, forma: 'linea', alcance: 5, power: 1.5, cd: 2.2, efecto: { slow: 1.5 }, desc: 'FUSIÓN Agua+Tierra (ambos al 15%): un chorro de lodo que frena. 5 celdas.' },
    hielo:     { par: ['agua', 'viento'], nombre: 'Carámbano', umbral: 15, costo: 18, forma: 'proyectil', alcance: 8, power: 1.6, cd: 2.4, efecto: { stun: 0.5 }, desc: 'FUSIÓN Agua+Viento (ambos al 15%): un carámbano que vuela y aturde. 8 celdas.' },
    corriente: { par: ['agua', 'rayo'], nombre: 'Chispa Acuosa', umbral: 15, costo: 20, forma: 'cadena', alcance: 6, saltos: 3, power: 1.5, cd: 2.5, efecto: { stun: 0.3 }, desc: 'FUSIÓN Agua+Rayo (ambos al 15%): la chispa salta por el agua entre 3 enemigos.' },
    lava:      { par: ['fuego', 'tierra'], nombre: 'Roca Fundida', umbral: 15, costo: 20, forma: 'proyectil', alcance: 7, power: 1.7, cd: 2.6, efecto: { dot: { dmg: 2, t: 3 } }, desc: 'FUSIÓN Fuego+Tierra (ambos al 15%): una roca fundida que quema al impactar. 7 celdas.' },
    calor:     { par: ['fuego', 'viento'], nombre: 'Onda de Calor', umbral: 15, costo: 18, forma: 'cono', alcance: 4, power: 1.5, cd: 2.4, efecto: { dot: { dmg: 2, t: 2 } }, desc: 'FUSIÓN Fuego+Viento (ambos al 15%): una onda de calor en abanico que quema. 4 celdas.' },
    centella:  { par: ['fuego', 'rayo'], nombre: 'Chispa Ígnea', umbral: 15, costo: 18, forma: 'linea', alcance: 8, power: 1.55, cd: 2.2, efecto: { stun: 0.4 }, desc: 'FUSIÓN Fuego+Rayo (ambos al 15%): una chispa de fuego y relámpago en línea recta. 8 celdas.' },
    arena:     { par: ['tierra', 'viento'], nombre: 'Tormenta de Arena', umbral: 15, costo: 20, forma: 'circulo', radio: 2, power: 1.5, cd: 3.0, efecto: { slow: 2 }, desc: 'FUSIÓN Tierra+Viento (ambos al 15%): una tormenta de arena a tu alrededor que frena. Radio 2.' },
    cristal:   { par: ['tierra', 'rayo'], nombre: 'Fragmento de Cristal', umbral: 15, costo: 19, forma: 'proyectil', alcance: 8, power: 1.65, cd: 2.4, efecto: { stun: 0.5 }, desc: 'FUSIÓN Tierra+Rayo (ambos al 15%): un fragmento de cristal cargado que aturde. 8 celdas.' },
    tormenta:  { par: ['viento', 'rayo'], nombre: 'Viento Eléctrico', umbral: 15, costo: 20, forma: 'linea', alcance: 9, power: 1.6, cd: 2.6, efecto: { empuje: 2 }, desc: 'FUSIÓN Viento+Rayo (ambos al 15%): viento con relámpago que empuja en línea recta. 9 celdas.' }
  },

  // Yang: energía pura BLANCA. Es un ESTILO alcanzable por cualquiera, como dominar otro elemento:
  // despierta al llevar el estilo a 5. Con afinidad (test) naces despierto en 5; sin afinidad empiezas
  // en 0 y lo alcanzas entrenando (meditar al descansar, sesiones con Torin). Haz es la forma básica;
  // Onda y Esférico suben con el estilo. La lista canónica vive en elementos.yang.
  yangDespertar: 5,
  yang: {
    haz:      { id: 'haz', nombre: 'Haz', umbral: 0, costo: 15, forma: 'linea', alcance: 10, radio: 0, power: 1.5, cd: 0.9, desc: 'Solo una línea recta, perfora. 10×1 celdas.' },
    onda:     { id: 'onda', nombre: 'Onda', umbral: 5, costo: 14, forma: 'proyectil', vel: 9, power: 1.3, cd: 1.4, efecto: { empuje: 2 }, cometa: true, desc: 'Esfera con línea de energía detrás, como cometa. Empuja.' },
    esferico: { id: 'esferico', nombre: 'Esférico', umbral: 10, costo: 18, forma: 'proyectil', vel: 6, power: 1.4, cd: 2.2, explora: { radio: 2, power: 1.8 }, desc: 'Solo una esfera: vuela y explota.' },
    // GOLPE VELOZ: puño Yang cuerpo a cuerpo, instantáneo y sin carga — difícil de
    // esquivar o interrumpir. Más rápido que el puño Yin normal y más fuerte que el
    // toque, pero pega menos que el Golpe Rompe-Todo cargado (1.9). No devuelve
    // Esencia al golpear (eso es Yin); gasta 8 y usa el enfriamiento de Yang.
    golpeVeloz: { id: 'golpeVeloz', nombre: 'Golpe Veloz', umbral: 15, costo: 8, forma: 'cono', alcance: 2, radio: 0, power: 1.35, cd: 0.35, icono: 'yin', desc: 'Puño Yang rapidísimo: sin carga, sin preparación, difícil de esquivar. Cuerpo a cuerpo (2 celdas). Pega más que el puño normal, menos que el cargado.' },
    // DISCO DE ESENCIA: disco de energía blanca que gira y vuela recto (concepto:
    // disco de energía cortante). Proyectil normal de Yang: lo ejecuta yang().
    discoEsencia: { id: 'discoEsencia', nombre: 'Disco de Esencia', umbral: 20, costo: 20, forma: 'proyectil', vel: 8, alcance: 9, power: 1.6, cd: 2.4, desc: 'Un disco de energía blanca que gira y vuela recto, cortando lo que cruza. 9 celdas.' },
    // RAYO DEL AMANECER: haz de energía cargado (concepto: rayo de energía final).
    // Línea larga de Yang: lo ejecuta yang().
    rayoAmanecer: { id: 'rayoAmanecer', nombre: 'Rayo del Amanecer', umbral: 30, costo: 22, forma: 'linea', alcance: 12, power: 1.9, cd: 3.0, desc: 'Un haz de energía cargado, blanco como el amanecer, que perfora 12 celdas en línea recta. Tu ataque final de Yang.' },
    // TIEMPO LENTO: interruptor Yang avanzado (cámara lenta). NO es una forma
    // lanzable: no va en yangOrden. El mundo (enemigos, NPCs, proyectiles,
    // animaciones) va lento y el jugador a velocidad normal. Drena Esencia
    // rápido por segundo; el dreno y la fuerza dependen del nivel de Yang
    // (a más nivel, mundo más lento y menos dreno). El reloj del día no se toca.
    tiempoLento: { id: 'tiempoLento', nombre: 'Tiempo Lento', umbral: 25, costo: 'dreno', forma: 'toggle', icono: 'tiempo', desc: 'Cámara lenta: el mundo se pone lento y tú sigues a tu velocidad. Drena Esencia rápido por segundo; a más nivel de Yang, más lento el mundo y menos dreno. El reloj del día sigue a su ritmo.' }
  },
  yangOrden: ['haz', 'onda', 'esferico', 'golpeVeloz', 'discoEsencia', 'rayoAmanecer'],

  // Yin: base universal, cuerpo a cuerpo, casi sin Esencia. La Velocidad decide la cadencia.
  // El puño NORMAL (un toque) es UNIVERSAL y no es técnica de nadie: no está en el
  // catálogo. El Golpe Rompe-Todo (puño cargado) SÍ es un movimiento de Yin y vive en
  // elementos.yin. La Velocidad Extrema (dash) es un movimiento de YANG (elementos.yang).
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
    // DASH (Velocidad Extrema, movimiento de Yang): su costo BAJA con la práctica
    // (regla general: la práctica hace las técnicas más eficientes). costoMax al
    // aprenderlo, costo (4) al dominarlo. Escala por estilo Yang: 0→12 · 25→10 ·
    // 50→8 · 75→6 · 100→4. Ver costoDash(j) abajo.
    dash:     { costo: 4, costoMax: 12 },
    sobrecarga: { id: 'sobrecarga', nombre: 'Sobrecarga', umbral: 15, mult: 2, drain: 0.05, desc: 'Estilo Yin: es un INTERRUPTOR, sin duración fija ni enfriamiento — Ataque y Velocidad ×2 mientras esté activa, y la apagas con el mismo botón cuando quieras. Drena SOLO Esencia: 5% de tu Esencia máxima por segundo (mientras está activa, la recarga de Esencia se pausa, para que el drenaje sea real). Cuando la Esencia llega a 0, el drenaje pasa a VIDA a la MISMA tasa (5% de tu Vida máxima por segundo; el costo por segundo no cambia, solo cambia de dónde sale) y solamente puedes GOLPEAR (puños Yin): las técnicas quedan bloqueadas porque cuestan Esencia y no tienes. Al desactivarla se detiene el drenaje y termina el aumento de fuerza. Si la Vida llega a 0 con ella activa, caes y despiertas en la fogata, como cualquier derrota.' },
    // RESISTENCIA DE ACERO: defensa Yin. Concentras tu energía Yin en un punto
    // del cuerpo y ese punto se endurece como acero. Interruptor: mientras está
    // activa, el daño que recibes se reduce a la MITAD. NO es la Armadura de
    // Metal (Tierra+Yang: daño 0, 20 Esencia + 5/s, más lento y más débil): la
    // de acero es más débil (no da 0, solo reduce) y NO te pone lento.
    acero: { id: 'acero', nombre: 'Resistencia de Acero', umbral: 20, costoActivar: 6, drain: 2, reduccion: 0.5, desc: 'Tu cuerpo se endurece como acero: el daño que recibes se reduce a la mitad. Cuesta 6 al activar y drena 2/s. Más débil que la Armadura de Metal (esa da 0) pero no te pone lento.' }
  },

  // ---- PRÓXIMAMENTE (datos listos, lógica NO activa en el juego completo) ----
  // Combinadas: automáticas cuando AMBOS elementos llegan a 15/40/70%. No hay modo de fusión.
  // La 1ª de cada par YA es usable: vive en `fusiones` (arriba). La 2ª/3ª siguen aquí, como nombres.
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
  // Las 3 BÁSICAS se aprenden EN ARCANA, con los hechiceros, EN ORDEN (Sentido →
  // Rastreo → Barrera mental), una cada vez: cada una sube +1 j.hechicero.basicos
  // (U.Habilidades.aprenderBasico, abajo). Con 1 básica se abre la Mirada que Pesa
  // (umbral 1), con 2 la Prisión del Espejo (umbral 2); la 3ª deja basicos en 3.
  // NO piden potencial: son EL CAMINO para convertirse sin potencial revelado.
  // La puerta de las técnicas mayores (aprendida()) sigue pidiendo potencial O
  // basicos>0, y basicos ≥ umbral. Sin costo ni minijuego: como el Escudo de
  // Kaelen, se aprende hablando (el viaje a Arcana y el orden son el coste);
  // no se inventa otro grind. La Invisibilidad NO está aquí: sigue sin poder
  // aprenderse nunca (umbral 99, aprendiblePorJugador:false, solo Gamma).
  // Las técnicas de combate de Místico viven en elementos.mistico (arriba).
  hechiceros: { nombre: 'Arte Místico · Mente', basicas: [
    { id: 'sentido', nombre: 'Sentido', desc: 'Sentir la Mente ajena: notar presencias, intenciones y mentiras antes de verlas. Lo primero que enseña un hechicero.' },
    { id: 'rastreo', nombre: 'Rastreo', desc: 'Seguir el rastro de una mente: saber por dónde pasó alguien y hacia dónde va. Los hechiceros del Escuadrón Gamma lo usan para investigar.' },
    { id: 'barrera', nombre: 'Barrera mental', desc: 'Cerrar tu mente: que nadie lea lo que piensas ni te confunda con ilusiones. Sin ella, un hechicero está desnudo ante otro.' }
  ],
    invisibilidad: { nombre: 'Invisibilidad', aprendiblePorJugador: false, razon: 'Es mental (Arte Místico), no elemental: ningún elemento la hace congruente, así que un dominador no la aprende como técnica suya. La tienen los hechiceros del Escuadrón Gamma.' },
    nota: 'Ser hechicero es casi otra vida: súper difícil, toma una vida. Primero se aprenden cosas básicas (Sentido, Rastreo, Barrera mental) y solo tras años llegan las técnicas mayores.' },
  // Reclasificadas: Destello (Rayo), Vuelo (Viento), Disco Cortante (Yang). Presentimiento/Supresión/Dominio: no se programan.
  reclasificadas: { destello: 'rayo', vuelo: 'viento', discoCortante: 'yang' },

  // Costo del DASH (Velocidad Extrema, Yang) según tu estilo Yang: la práctica lo
  // hace más eficiente. Yang 0 → 12 · 25 → 10 · 50 → 8 · 75 → 6 · 100 → 4.
  costoDash(j) { const n = Math.max(0, Math.min(100, (j && j.estilos && j.estilos.yang) || 0)); const d = this.yin.dash; return Math.max(d.costo, Math.round(d.costoMax - (d.costoMax - d.costo) * n / 100)); },
  // ---- EQUIPO (loadout) · HUD PROGRESIVO ----
  // 8 grupos en el catálogo (5 elementos + Yin + Yang + Místico); cada grupo es una
  // lista abierta en `elementos`. El límite es solo del EQUIPO: 5 huecos en el HUD.
  // El puño normal NO es técnica: es el botón por defecto, fuera del equipo.
  MAX_EQUIPO: 5,
  // Ataque BÁSICO del elemento principal: siempre disponible, sin aprender nada.
  // Es lo que dispara el botón TÉC cuando no llevas ninguna técnica equipada.
  BASICO: { costo: 4, power: 0.9, cd: 0.8, alcanceMax: 3, desc: 'Ataque básico de tu elemento: línea corta, poco coste, siempre disponible.' },
  // CORRECCIÓN 2 · EL ATAQUE BÁSICO DE CADA ELEMENTO: la técnica general con el
  // requisito de maestría más bajo (la primera del catálogo, umbral 15%). Es lo
  // ÚNICO que una partida nueva lleva dominado y equipado, además del puño.
  // Fuego: Llamarada · Agua: Chorro · Tierra: Roca · Viento: Ráfaga · Rayo: Chispa.
  BASICO_POR_ELEMENTO: { fuego: 'llamarada', agua: 'chorro', tierra: 'roca', viento: 'rafaga', rayo: 'chispa' },
  basicoId(elemento) { const id = this.BASICO_POR_ELEMENTO[elemento]; return id ? 'tec:' + elemento + ':' + id : null; },
  // ¿Es ESTA técnica el ataque básico del elemento principal del jugador?
  // (Solo el del elemento principal: el básico de un segundo elemento se aprende
  // entrenando ese elemento hasta el 15%, como cualquier otra técnica.)
  esBasico(j, tec) { return !!tec && tec.kind === 'elemento' && !!j && tec.elemento === j.elemento && tec.tecId === this.BASICO_POR_ELEMENTO[tec.elemento]; },
  // CORRECCIÓN 2 · KIT DE PARTIDA NUEVA ('desde cero'): lo único que lleva un
  // principiante. Lo usa U.Juego.comenzarMundo (y el test de simulación).
  // desdeCero + los valores iniciales (maestría/estilos/basicos al nacer) son la
  // prueba de lo que el test te DIO, no de lo que APRENDISTE: aprendida() solo
  // da por dominada una técnica si la entrenaste POR ENCIMA de ese valor inicial
  // (o te la concedió un Guía / un contrato de alma). Las partidas VIEJAS no
  // llevan esta marca: para ellas aprendida() sigue como antes.
  nuevoJugador(perfil) {
    const basico = this.basicoId(perfil.elemento);
    const visto = {}; if (basico) visto[basico] = 1;
    return { desdeCero: true,
      maestriaInicial: Object.assign({}, perfil.maestria || {}),
      estilosInicial: Object.assign({}, perfil.estilos || {}),
      hechiceroBasicosInicial: 0,
      equipo: basico ? [basico] : [],
      tecnicasAprendidas: basico ? [basico] : [],
      _equipoVisto: visto };
  },
  // Registro canónico de todo lo equipable. id único por técnica:
  // 'tec:<elemento>:<id>' (elemental), 'yin:<id>', 'yang:<forma>', 'mistico:<id>',
  // 'especial:<id>' (kind 'elemento' + especial:true), 'fusion:<par>' (kind
  // 'elemento' + fusion:true), 'escudo'. Las entradas con equipo:false (puño
  // cargado, dash, Inversión, Invisibilidad) NO entran: no se equipan.
  registro(j) {
    const lista = [];
    const E5 = ['agua', 'fuego', 'tierra', 'viento', 'rayo'];
    (j.elementos || [j.elementoActivo]).forEach(el => {
      if (E5.indexOf(el) < 0) return;
      (this.elementos[el] || []).forEach(h => lista.push(Object.assign({}, h, { id: 'tec:' + el + ':' + h.id, tecId: h.id, kind: 'elemento', elemento: el })));
    });
    // Yin: base universal, siempre en el registro (su estilo lo entrena cualquiera).
    (this.elementos.yin || []).forEach(h => { if (h.equipo === false) return; lista.push(Object.assign({}, h, { id: 'yin:' + h.id, tecId: h.id, kind: 'yin', elemento: 'yin' })); });
    // Yang: solo si despertó.
    if (j.tieneYang) (this.elementos.yang || []).forEach(h => { if (h.equipo === false) return; lista.push(Object.assign({}, h, { id: 'yang:' + h.id, tecId: h.id, kind: 'yang', elemento: 'yang' })); });
    // Místico: en el registro para todos; aprendida() lo cierra con la puerta de hechicero.
    (this.elementos.mistico || []).forEach(h => { if (h.equipo === false) return; lista.push(Object.assign({}, h, { id: 'mistico:' + h.id, tecId: h.id, kind: 'mistico', elemento: 'mistico' })); });
    // Especiales: solo del elemento del jugador (un Guía te enseña movimientos de TU elemento).
    const mios = j.elementos || [j.elementoActivo];
    (this.especiales || []).forEach(h => { if (mios.indexOf(h.elemento) < 0) return; lista.push(Object.assign({}, h, { id: 'especial:' + h.id, tecId: h.id, kind: 'elemento', elemento: h.elemento, especial: true, origen: 'guia' })); });
    // Fusiones: solo si tienes AMBOS elementos del par.
    Object.keys(this.fusiones || {}).forEach(k => { const f = this.fusiones[k]; if (mios.indexOf(f.par[0]) < 0 || mios.indexOf(f.par[1]) < 0) return; lista.push(Object.assign({}, f, { id: 'fusion:' + k, tecId: k, kind: 'elemento', elemento: f.par[0], fusion: true, par: f.par.slice() })); });
    lista.push({ id: 'escudo', tecId: 'escudo', kind: 'escudo', elemento: j.elementoActivo, nombre: 'Escudo', costo: '9/s', cd: 0, umbral: 0, desc: this.escudo.desc });
    // Técnicas HEREDADAS por contrato de alma (U.TecnicasAlma): una por especie,
    // origen 'heredada' — la criatura te la pasa por el vínculo, sin minijuego.
    if (U.TecnicasAlma) U.TecnicasAlma.todas().forEach(t => lista.push(Object.assign({}, t, { id: 'alma:' + t.id, tecId: t.id, kind: 'alma', umbral: 0 })));
    return lista;
  },
  porId(j, id) { return this.registro(j).find(t => t.id === id) || null; },
  // Catálogo COMPLETO (equipables + movimientos que no se equipan: puño cargado,
  // dash, Inversión, Invisibilidad). Para mostrar la lista entera por grupo.
  catalogo(j) {
    const lista = this.registro(j).slice();
    const noEq = [];
    (this.elementos.yin || []).forEach(h => { if (h.equipo === false) noEq.push(Object.assign({}, h, { id: 'yin:' + h.id, tecId: h.id, kind: 'yin', elemento: 'yin' })); });
    (this.elementos.yang || []).forEach(h => { if (h.equipo === false) noEq.push(Object.assign({}, h, { id: 'yang:' + h.id, tecId: h.id, kind: 'yang', elemento: 'yang' })); });
    (this.elementos.mistico || []).forEach(h => { if (h.equipo === false) noEq.push(Object.assign({}, h, { id: 'mistico:' + h.id, tecId: h.id, kind: 'mistico', elemento: 'mistico' })); });
    noEq.forEach(t => { if (!lista.some(x => x.id === t.id)) lista.push(t); });
    return lista;
  },
  // ¿Está DOMINADA (aprendida)? Elemental: maestría ≥ umbral, o concedida por un Guía
  // (j.tecnicasAprendidas, lista de ids de registro). ESPECIAL: SOLO concedida
  // (minijuego de Guía): nunca por maestría. FUSIÓN: concedida, o AMBOS elementos
  // al umbral. Yang: despierto + estilo ≥ umbral. Yin: estilo ≥ umbral. Místico:
  // puerta de hechicero (potencial o basicos>0) + basicos ≥ umbral (NO maestría);
  // Invisibilidad: nunca para el jugador. Escudo: aprendido de Kaelen.
  // CORRECCIÓN 2 · PARTIDAS NUEVAS (j.desdeCero): NADA viene dominado del test.
  // El test reparte maestría/estilos iniciales (5% como mucho), pero eso es lo
  // que TRAES, no lo que DOMINAS: una técnica solo cuenta como dominada si la
  // entrenaste POR ENCIMA de tu valor inicial en esta vida, o te la concedieron.
  // Excepción: el ataque BÁSICO de tu elemento principal, que es tuyo desde el
  // inicio (es lo único dominado al nacer). Sin la marca, partidas viejas: igual
  // que antes, para no romperlas.
  aprendida(j, tec) {
    if (!tec) return false;
    const desdeCero = !!(j && j.desdeCero);
    const iniM = el => (j && j.maestriaInicial && j.maestriaInicial[el]) || 0;
    const iniE = cual => (j && j.estilosInicial && j.estilosInicial[cual]) || 0;
    if (tec.kind === 'elemento') {
      if (tec.especial) return (j.tecnicasAprendidas || []).indexOf(tec.id) >= 0;
      if (tec.fusion) {
        if ((j.tecnicasAprendidas || []).indexOf(tec.id) >= 0) return true;
        const mA = (j.maestria[tec.par[0]] || 0), mB = (j.maestria[tec.par[1]] || 0);
        if (mA < tec.umbral || mB < tec.umbral) return false;
        return !desdeCero || mA > iniM(tec.par[0]) || mB > iniM(tec.par[1]);
      }
      if (desdeCero && this.esBasico(j, tec)) return true;
      return (j.tecnicasAprendidas || []).indexOf(tec.id) >= 0 || ((j.maestria[tec.elemento] || 0) >= tec.umbral && (!desdeCero || (j.maestria[tec.elemento] || 0) > iniM(tec.elemento)));
    }
    if (tec.kind === 'alma') {
      if ((j.tecnicasAprendidas || []).indexOf(tec.id) >= 0) return true;
      // Respaldo: si el contrato de alma es de esa especie, la técnica heredada sigue siendo
      // tuya aunque la lista se haya perdido (p. ej. partida vieja): el pasaporte manda.
      if (U.TecnicasAlma && U.Criaturas && U.Juego.estado && U.Juego.estado.contratos && U.Juego.estado.contratos.alma) {
        const c = U.Criaturas.buscar(U.Juego.estado.contratos.alma);
        if (c) { const t = U.TecnicasAlma.porEspecie(c.especie); if (t && 'alma:' + t.id === tec.id) return true; }
      }
      return false;
    }
    if (tec.kind === 'yang') return !!j.tieneYang && (j.estilos.yang || 0) >= tec.umbral && (!desdeCero || (j.estilos.yang || 0) > iniE('yang'));
    if (tec.kind === 'yin') return (j.estilos.yin || 0) >= tec.umbral && (!desdeCero || (j.estilos.yin || 0) > iniE('yin'));
    if (tec.kind === 'mistico') {
      if (tec.aprendiblePorJugador === false) return false;
      const h = j.hechicero || {};
      return (h.potencial || (h.basicos || 0) > 0) && (h.basicos || 0) >= (tec.umbral || 0) && (!desdeCero || (h.basicos || 0) > (j.hechiceroBasicosInicial || 0));
    }
    if (tec.kind === 'escudo') return !!j.escudoAprendido;
    return false;
  },
  dominadas(j) { return this.registro(j).filter(t => this.aprendida(j, t)); },
  // ---- BÁSICAS DE HECHICERO (Arte Místico / Mente) ----
  // aprenderBasico(j, id?) concede la SIGUIENTE básica en orden (Sentido →
  // Rastreo → Barrera mental); si se pasa un id, tiene que ser justo esa
  // siguiente (fuera de orden o repetida: {ok:false}, sin subir nada). Cada
  // básica aprendida sube +1 j.hechicero.basicos (máx. 3) y queda registrada
  // en j.hechicero.basicas (lista de ids, en orden). NO pide potencial: las
  // básicas SON el camino para convertirse en hechicero sin potencial revelado;
  // la puerta de las técnicas mayores (aprendida()) sigue intacta. Tampoco
  // pide costo ni minijuego (precedente: el Escudo de Kaelen se aprende
  // hablando). Acepta partidas viejas: si j.hechicero.basicas no existe, la
  // crea. Guarda automáticamente (como U.Aprendizaje.guardarProgreso).
  basicaPorId(id) { return (this.hechiceros.basicas || []).find(b => b.id === id) || null; },
  basicasAprendidas(j) { const h = (j && j.hechicero) || {}; const ids = Array.isArray(h.basicas) ? h.basicas : []; return (this.hechiceros.basicas || []).filter(b => ids.indexOf(b.id) >= 0); },
  siguienteBasico(j) { const h = (j && j.hechicero) || {}; const ids = Array.isArray(h.basicas) ? h.basicas : []; return (this.hechiceros.basicas || []).find(b => ids.indexOf(b.id) < 0) || null; },
  aprenderBasico(j, id) {
    if (!j) return { ok: false, motivo: 'sin jugador' };
    const sig = this.siguienteBasico(j);
    if (!sig) return { ok: false, motivo: 'ya aprendiste las tres básicas' };
    if (id && id !== sig.id) return { ok: false, motivo: 'primero va ' + sig.nombre };
    const h = j.hechicero = j.hechicero || {};
    h.basicas = Array.isArray(h.basicas) ? h.basicas.slice() : [];
    if (h.basicas.indexOf(sig.id) >= 0) return { ok: false, motivo: 'ya la aprendiste' };
    h.basicas.push(sig.id);
    h.basicos = Math.min(3, h.basicas.length);
    try { if (U.Guardado) U.Guardado.guardarAuto(); } catch (e) { /* sin guardado aquí (p. ej. test) */ }
    return { ok: true, basico: sig, basicos: h.basicos };
  },
  // Un Guía concede una técnica (futuro sistema de enseñanza por tarea): queda
  // registrada como aprendida aunque la maestría aún no llegue al umbral, y se
  // auto-equipa si hay hueco libre. Las ESPECIALES llegan por aquí, desde el
  // minijuego de U.Aprendizaje al dominarlas.
  aprenderTecnica(id) {
    const j = U.Juego.estado.jugador; const tec = this.porId(j, id); if (!tec) return false;
    j.tecnicasAprendidas = j.tecnicasAprendidas || [];
    if (j.tecnicasAprendidas.indexOf(id) < 0) j.tecnicasAprendidas.push(id);
    this.equipar(j, id);
    return true;
  },
  // Equipo: j.equipo = [ids de registro, en orden]. podarEquipo solo poda
  // (técnicas ya no dominadas, p. ej. tras cargar una partida vieja).
  // asegurarEquipo ADEMÁS auto-equipa lo RECIÉN dominado mientras haya hueco
  // libre, en orden de registro (primero el elemento principal, luego el
  // segundo, luego Yang, luego Escudo) — pero solo UNA VEZ por técnica
  // (j._equipoVisto): si el jugador la quita a mano, no vuelve sola.
  podarEquipo(j) {
    j.equipo = Array.isArray(j.equipo) ? j.equipo.slice(0, this.MAX_EQUIPO) : [];
    j.equipo = j.equipo.filter(id => { const t = this.porId(j, id); return t && this.aprendida(j, t); });
    return j.equipo;
  },
  asegurarEquipo(j) {
    this.podarEquipo(j);
    j._equipoVisto = j._equipoVisto || {};
    this.registro(j).forEach(t => {
      if (this.aprendida(j, t) && !j._equipoVisto[t.id]) {
        j._equipoVisto[t.id] = 1;
        if (j.equipo.length < this.MAX_EQUIPO && j.equipo.indexOf(t.id) < 0) j.equipo.push(t.id);
      }
    });
    return j.equipo;
  },
  equipar(j, id) {
    const tec = this.porId(j, id); if (!tec) return { ok: false, motivo: 'técnica desconocida' };
    if (!this.aprendida(j, tec)) return { ok: false, motivo: 'aún no dominada' };
    this.podarEquipo(j);
    if (j.equipo.indexOf(id) >= 0) return { ok: true, motivo: 'ya equipada' };
    if (j.equipo.length >= this.MAX_EQUIPO) return { ok: false, motivo: 'equipo lleno (máx. 5)' };
    j.equipo.push(id); return { ok: true };
  },
  desequipar(j, id) { this.podarEquipo(j); const i = j.equipo.indexOf(id); if (i >= 0) j.equipo.splice(i, 1); return j.equipo; },
  moverEquipo(j, id, dir) {
    this.podarEquipo(j); const i = j.equipo.indexOf(id); const k = i + dir;
    if (i < 0 || k < 0 || k >= j.equipo.length) return false;
    j.equipo[i] = j.equipo[k]; j.equipo[k] = id; return true;
  },
  equipoDetalles(j) { this.asegurarEquipo(j); return j.equipo.map(id => this.porId(j, id)).filter(Boolean); }
};
