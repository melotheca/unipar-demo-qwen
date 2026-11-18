/* === js/datos/rival.js === */
/* Unipar — EL RIVAL: Ren, el espejo invertido.
   DISEÑO: lo conoces en el TORNEO DE BRUMA (primer encuentro natural: se inscribe
   contigo y te reta antes de la primera ronda). Después te lo vuelves a encontrar
   por el mundo — cerca de la Arena de Ecos, en los pueblos —: a veces te reta a
   duelo, a veces te ayuda cuando vas herido. Entrena como tú: crece un poco cada
   día de juego y MÁS después de cada duelo contigo, para seguir siendo un reto.
   ELEMENTO (ESPEJO DINÁMICO, no fijo): Ren domina el ELEMENTO CONTRARIO al tuyo
   (el del test): Fuego→Agua, Agua→Rayo, Rayo→Tierra, Tierra→Viento, Viento→Fuego.
   Cada contrario es un contador válido según la tabla de elementos (cada elemento
   cubre uno distinto). Su elemento NUNCA es el tuyo: es tu espejo invertido.
   El elemento del jugador se lee del estado (E.jugador.elemento, el del test);
   aquí solo vive el MAPEO (CONTRARIO) y los resolutores puros (elementoContrarioDe,
   apodoDe, tituloDe, tecnicasDe): el sistema (js/sistemas/rival.js) es quien
   resuelve el elemento efectivo en cada momento. Los campos `elemento`, `apodo` y
   `titulo` de abajo son el RESPALDO de Viento (el comportamiento anterior) para
   cuando aún no hay jugador o no hay catálogo cargado.
   APODO: uno propio por elemento (APODOS), nunca repetido: Viento sigue siendo
   'el Vendaval'; Fuego 'el Incendio', Agua 'la Marea', Rayo 'el Relámpago',
   Tierra 'la Montaña'. Las líneas de diálogo escriben 'el Vendaval' como texto
   base y U.Rival.dialogo() lo sustituye por el apodo efectivo (mismo artículo).
   ALDEA (DECISIÓN 3, 2026-11-18): Ren vive en la aldea de SU elemento — la
   contraria a la del jugador, porque su elemento es el contrario. El torneo
   final y la Arena de Ecos siguen siendo EVENTOS en Bruma (no su casa): ahí
   aparece igual que antes. El mapa ALDEAS dice dónde vive por elemento, y
   rutinaDe() su rutina diaria en esa aldea (plaza, entreno, entrada, fogata).
   PERSONALIDAD: arrogante y competitivo, pero con código: respeta a quien le
   gana de verdad y no deja tirado a un rival herido. Quiere ser el mejor del
   continente y te usa a ti como medida: si tú subes, él sube más.
   SET POR ELEMENTO (dirección Pokémon: movimientos con tipo, poder y efecto propio):
   5 técnicas DEL CATÁLOGO EXISTENTE (U.Habilidades.elementos[elementoRen]) por
   elemento, sin tocar el catálogo y sin inventar técnicas nuevas. La tabla SETS
   dice QUÉ 5 ids, con QUÉ desbloqueo por duelos y QUÉ claseIA; tecnicasDe()
   copia la entrada del catálogo y le añade desbloqueoDuelos + claseIA + elemento.
   Los desbloqueos se quedan como estaban (0, 0, 0, 2, 4 duelos). Por elemento:
   el hueco 1 es el ataque a distancia básico, el 2 otro a distancia con efecto,
   el 3 el especial de cerca que empuja (o el especial propio del elemento cuando
   no tiene cono: Ola en Agua, Destello NO — ver nota), el 4 el grande de mitad
   de camino y el 5 el final. NOTA RAYO: 'destello' NO entra en el set de Ren:
   del lado enemigo el Destello no ciega al jugador (dañoJugador no aplica
   cegar al jugador) y su telegrafía saldría como una línea ancha; eso es trabajo
   del ejecutor (combate.js), fuera de este cambio. En su lugar Rayo usa
   'cadena' (Relámpago en cadena: el ejecutor sí tiene rama de cadena).
   ACLARACIÓN: el PUÑO normal NO es una técnica de Ren (ni de nadie): es el
   ataque universal que ya tiene todo el mundo.
   FORMAS Y EFECTOS: solo los que combate.js ya soporta (linea, proyectil,
   circulo, rect, alterna, cono, cadena / empuje, slow, dot, stun, cegar). La
   columna `claseIA` dice con qué clase enemiga existente pelea cada técnica
   dentro del combate (combate.js solo ataca con las clases de CLASES). */
window.U = window.U || {};

U.RivalDatos = {
  nombre: 'Ren',
  apodo: 'el Vendaval', // RESPALDO (Viento): el efectivo es apodoDe(elementoRen(E))
  titulo: 'REN · EL VENDAVAL', // RESPALDO (Viento): el efectivo es tituloDe(elementoRen(E))
  elemento: 'viento', // RESPALDO (Viento): el efectivo es elementoContrarioDe(elementoJugador)
  // ---- ESPEJO: elemento contrario al del jugador (tabla de elementos: cada
  // contrario le gana al elemento del jugador) ----
  CONTRARIO: { fuego: 'agua', agua: 'rayo', rayo: 'tierra', tierra: 'viento', viento: 'fuego' },
  // ---- APODOS: uno por elemento de Ren (Viento conserva 'el Vendaval') ----
  APODOS: { fuego: 'el Incendio', agua: 'la Marea', rayo: 'el Relámpago', tierra: 'la Montaña', viento: 'el Vendaval' },
  EMOJIS: { fuego: '🔥', agua: '💧', rayo: '⚡', tierra: '⛰️', viento: '🌪' },
  // Elemento de Ren para un elemento de jugador dado (desconocido → Viento, el anterior).
  elementoContrarioDe(elJugador) { return (elJugador && this.CONTRARIO[elJugador]) || 'viento'; },
  apodoDe(elRen) { return (elRen && this.APODOS[elRen]) || 'el Vendaval'; },
  tituloDe(elRen) { return 'REN · ' + this.apodoDe(elRen).toUpperCase(); },
  emojiDe(elRen) { return (elRen && this.EMOJIS[elRen]) || '🌪'; },
  // ---- ALDEA (Decisión 3): vive en la aldea de SU elemento ----
  // Coordenadas del CONTINENTE, mapa 'aldea'. La plaza es donde spawnea y hace
  // su vida; la casa es donde duerme de noche (horaCasa 21, vía Personas).
  // NOTA: la casa NO es el punto exacto del encargo (380,206) etc.: ahí hay
  // una casa SÓLIDA (el objeto 'casa' ocupa esa celda) y un NPC no puede estar
  // dentro de un sólido — al despertar, Vida lo deja EN casaPos. Por eso cada
  // casa es la baldosa transitable pegada a la casa (1 celda al norte, 1.4 en
  // Ceniza Viva), igual que las casas de los NPC de Bruma, que también están
  // en baldosa libre junto a su casa. Verificado en el mapa real.
  NPC_ID: 'rival', // NUNCA 'ren': ese id ya es el aprendiz de Bruma (U.AprendizDatos)
  ALDEAS: {
    agua: { nombre: 'Puerto Brisa Azul', plaza: { x: 360.5, y: 196.5 }, casa: { x: 380.5, y: 205.5 } },
    rayo: { nombre: 'Chispa Alta', plaza: { x: 355.5, y: 135.5 }, casa: { x: 366.5, y: 129.5 } },
    tierra: { nombre: 'Raíz de Piedra', plaza: { x: 148.5, y: 332.5 }, casa: { x: 160.5, y: 323.5 } },
    viento: { nombre: 'Vuelo Alto', plaza: { x: 219.5, y: 50.5 }, casa: { x: 235.5, y: 39.5 } },
    fuego: { nombre: 'Ceniza Viva', plaza: { x: 330.5, y: 311.5 }, casa: { x: 338.5, y: 314.5 } }
  },
  // Aldea de Ren para SU elemento (desconocido → Viento / Vuelo Alto, el respaldo).
  // Copias: quien la reciba no muta el mapa.
  aldeaDe(elRen) {
    const el = (elRen && this.ALDEAS[elRen]) ? elRen : 'viento';
    const a = this.ALDEAS[el];
    return { nombre: a.nombre, plaza: { x: a.plaza.x, y: a.plaza.y }, casa: { x: a.casa.x, y: a.casa.y } };
  },
  rolDe(elRen) { return 'Rival · Ren, ' + this.apodoDe(elRen); },
  // ---- RUTINA POR ALDEA: plaza, entreno, entrada del pueblo, fogata ----
  // Mismo formato que U.Vida.RUTINAS (d/h = horas, m = 'aldea', coordenadas del
  // continente). Todas las paradas quedan a pocos pasos de SU plaza: es su
  // pueblo, no un viajero. De noche (21h–04h) Vida lo mete en su casa solo.
  RUTINAS: {
    agua: [
      { d: 5, h: 9, m: 'aldea', x: 360.5, y: 196.5, l: 'la plaza de Puerto Brisa Azul', a: 'entrena solo en la plaza, midiendo a quien pasa' },
      { d: 9, h: 13, m: 'aldea', x: 367.5, y: 190.5, l: 'el muelle de entreno del puerto', a: 'practica sobre el agua, como si el lago fuera suyo' },
      { d: 13, h: 17, m: 'aldea', x: 352.5, y: 201.5, l: 'la entrada del puerto, junto al puente del Río del Este', a: 'vigila la entrada, buscando rivales que crucen' },
      { d: 17, h: 21, m: 'aldea', x: 362.5, y: 199.5, l: 'la fogata del puerto', a: 'escucha historias junto al fuego, sin admitir que le gustan' }
    ],
    rayo: [
      { d: 5, h: 9, m: 'aldea', x: 355.5, y: 135.5, l: 'la plaza de Chispa Alta', a: 'entrena solo en la plaza, midiendo a quien pasa' },
      { d: 9, h: 13, m: 'aldea', x: 362.5, y: 129.5, l: 'la meseta de entreno de Chispa Alta', a: 'practica bajo el cielo de tormenta, esperando un rayo' },
      { d: 13, h: 17, m: 'aldea', x: 348.5, y: 140.5, l: 'la entrada de Chispa Alta', a: 'vigila la entrada, buscando rivales que suban' },
      { d: 17, h: 21, m: 'aldea', x: 357.5, y: 138.5, l: 'la fogata de Chispa Alta', a: 'escucha historias junto al fuego, sin admitir que le gustan' }
    ],
    tierra: [
      { d: 5, h: 9, m: 'aldea', x: 148.5, y: 332.5, l: 'la plaza de Raíz de Piedra', a: 'entrena solo en la plaza, midiendo a quien pasa' },
      { d: 9, h: 13, m: 'aldea', x: 156.5, y: 326.5, l: 'el claro de entreno entre las rocas', a: 'practica contra las piedras, que no se quejan nunca' },
      { d: 13, h: 17, m: 'aldea', x: 141.5, y: 338.5, l: 'la entrada de Raíz de Piedra', a: 'vigila la entrada, buscando rivales que bajen' },
      { d: 17, h: 21, m: 'aldea', x: 150.5, y: 335.5, l: 'la fogata de Raíz de Piedra', a: 'escucha historias junto al fuego, sin admitir que le gustan' }
    ],
    viento: [
      { d: 5, h: 9, m: 'aldea', x: 219.5, y: 50.5, l: 'la plaza de Vuelo Alto', a: 'entrena solo en la plaza, midiendo a quien pasa' },
      { d: 9, h: 13, m: 'aldea', x: 228.5, y: 45.5, l: 'la meseta de entreno de Vuelo Alto', a: 'practica con el viento de la meseta, que nunca se está quieto' },
      { d: 13, h: 17, m: 'aldea', x: 212.5, y: 56.5, l: 'la entrada de Vuelo Alto', a: 'vigila la entrada, buscando rivales que suban' },
      { d: 17, h: 21, m: 'aldea', x: 221.5, y: 53.5, l: 'la fogata de Vuelo Alto', a: 'escucha historias junto al fuego, sin admitir que le gustan' }
    ],
    fuego: [
      { d: 5, h: 9, m: 'aldea', x: 330.5, y: 311.5, l: 'la plaza de Ceniza Viva', a: 'entrena solo en la plaza, midiendo a quien pasa' },
      { d: 9, h: 13, m: 'aldea', x: 338.5, y: 305.5, l: 'el brasero de entreno de Ceniza Viva', a: 'practica entre las brasas, que no perdonan un paso en falso' },
      { d: 13, h: 17, m: 'aldea', x: 323.5, y: 317.5, l: 'la entrada de Ceniza Viva', a: 'vigila la entrada, buscando rivales que crucen la ceniza' },
      { d: 17, h: 21, m: 'aldea', x: 332.5, y: 314.5, l: 'la fogata de Ceniza Viva', a: 'escucha historias junto al fuego, sin admitir que le gustan' }
    ]
  },
  // Rutina de Ren para SU elemento (copias: el registro no muta el mapa).
  rutinaDe(elRen) {
    const el = (elRen && this.RUTINAS[elRen]) ? elRen : 'viento';
    return this.RUTINAS[el].map(s => Object.assign({}, s));
  },
  // ---- PERSONA (para U.Personas.datos['rival']): elemento dinámico ----
  // Reutiliza personalidad/descripcion de arriba; las frases son suyas: arrogante
  // con código, no el Ren tímido del aprendiz. El elemento es el efectivo.
  personaDe(elRen) {
    const el = (elRen && this.ALDEAS[elRen]) ? elRen : 'viento';
    return {
      tipo: 'Arrogante y competitivo, con código',
      elemento: el,
      ritmo: 1.15,
      horaCasa: 21,
      desc: this.descripcion + ' Vive en ' + this.ALDEAS[el].nombre + ', la aldea de su elemento.',
      gustos: ['un buen duelo', 'que le reconozcan que es el mejor', 'entrenar hasta que duela'],
      disgustos: ['perder', 'que le digan que solo es ruido', 'los rivales que no aparecen'],
      frases: {
        calor: ['Con este calor entreno mejor. El que se queja, pierde.', 'Calor: el que aguanta, gana. Yo aguanto.'],
        lluvia: ['Lluvia. El suelo resbala y el duelo se pone interesante.', 'Con lluvia peleo igual: el agua no me asusta.'],
        tormenta: ['Tormenta. El cielo entrena conmigo, parece.', 'Que truene: un duelo con truenos suena mejor.'],
        viento: ['Viento: empuja a los débiles y a mí me despeina. Nada más.', 'Con este viento los novatos ni se paran firmes. Yo sí.'],
        niebla: ['Niebla. El rival que no ves es el que más te enseña.', 'Con niebla entreno el oído. El que se esconde, pierde.'],
        despejado: ['Día claro: se ve lejos y se pelea mejor. ¿Te atreves?', 'Cielo limpio: día de duelo. No hay excusa que valga.'],
        nublado: ['Nublado. Ni el cielo se decide hoy. Yo sí: entreno.', 'Día gris, guardia firme. Como siempre.']
      },
      victoria: '¿Eso era todo? Vuelve cuando tus golpes pesen de verdad.',
      derrota: '…Vale. Me ganaste. No pongas esa cara: mañana entreno el doble.',
      debil: 'Tch… estoy débil. Me retiro. No es huida: es estrategia.',
      expulsa: '¡ALTO! Te miras muy débil. Fuera del círculo: un rival herido no me sirve.',
      cortoDebil: 'Estoy débil… me salgo.'
    };
  },
  // ---- SALUDO (para U.Dialogo.guiones['rival']): con su apodo efectivo ----
  saludoDe(elRen) {
    const ap = this.apodoDe(elRen);
    return {
      alegre: ['¡Ahí estás! Justo te buscaba: ¿un duelo, o vienes solo a mirar?', '¡Qué bueno verte! Hoy entrené el doble. ¿Lo notaste?'],
      sereno: ['Buen día. Entrené esta mañana. Creo que ya me sale mejor que a ti.', 'Pasa. Estoy en mi aldea, en mi plaza. Aquí mando yo.'],
      neutral: ['¿Tú otra vez? Soy Ren, ' + ap + '. Si vienes a retarme, habla. Si no, no me quites el sol.', 'Hmm. Tú debes ser el de Bruma. Yo soy Ren, ' + ap + '.'],
      triste: ['Hoy no me sale nada… ¿tú también tienes días así? No me lo digas: no me importa.', 'Mal día. Pero un mal día mío sigue siendo mejor que tu buen día.'],
      enojado: ['¿Qué quieres? Estoy entrenando, no de niñera.', '¡No me mires así! ¡Yo también puedo! ¡Mira cómo entreno!'],
      asustado: ['¡No te acerques tan rápido! …ah, eres tú. Perdón. O no.']
    };
  },
  // ---- PALETA (para U.Render.paletaNPC['rival']): el color de SU elemento ----
  // Espejo de U.Elementos.datos por si aún no cargó: mismos hexágonos.
  COLORES: {
    fuego: { color: '#ff7a2f', claro: '#ffd08a', oscuro: '#a33b12' },
    agua: { color: '#35c6f4', claro: '#bfefff', oscuro: '#1a6b94' },
    tierra: { color: '#d9a441', claro: '#f3d9a0', oscuro: '#7a5320' },
    viento: { color: '#7ef0c0', claro: '#dbfff0', oscuro: '#2a7f5c' },
    rayo: { color: '#ffe14d', claro: '#fff7c2', oscuro: '#9c8410' }
  },
  paletaDe(elRen) {
    const el = (elRen && this.ALDEAS[elRen]) ? elRen : 'viento';
    const c = (typeof U !== 'undefined' && U.Elementos && U.Elementos.datos && U.Elementos.datos[el]) || this.COLORES[el] || this.COLORES.viento;
    return { piel: '#e8c39e', pelo: '#2b2b33', ropa: c.color, ropa2: c.oscuro, detalle: c.claro };
  },
  // Título por ganarle 3 duelos: 'Azote del Vendaval' / 'Azote de la Marea' / ...
  azoteDe(elRen) { const a = this.apodoDe(elRen); return a.indexOf('el ') === 0 ? 'Azote del ' + a.slice(3) : 'Azote de ' + a; },
  claseBase: 'chaman', // Viento a distancia, como su Haz: la clase de la que parte crearEnemigo
  personalidad: 'Arrogante y competitivo, con código: se burla cuando gana, respeta cuando pierde y no deja tirado a un rival herido.',
  descripcion: 'Un dominador del elemento contrario al tuyo, obsesionado con ser el mejor del continente. Te usa como medida: cada vez que subes, él entrena para alcanzarte. Lo conoces en el Torneo de Bruma.',
  // Stats base (día 1, duelo 0): un poco por encima de un jugador nuevo, para que el primer duelo duela.
  BASE: { vida: 95, esencia: 60, ataque: 13, defensa: 10, mente: 9, velocidad: 13 },
  POR_DIA: { vida: 3, esencia: 1, ataque: 0.35, defensa: 0.25, mente: 0.2, velocidad: 0.3 }, // crece un poco cada día de juego
  POR_DUELO: 0.06, // +6% a todo después de CADA duelo contigo (gane quien gane: él también entrena)
  // Si te escapas mucho, Ren recorta: nunca baja del 90% de tu poder (tope +35%).
  MIN_PODER_RELATIVO: 0.9, TOPE_ALCANCE: 1.35,
  RECOMPENSA_DUELO: 40, // monedas al ganarle un duelo fuera del torneo (en la final del torneo el premio es el del podio, no este)
  ENFRIAMIENTO_DIAS: 1, // tras un duelo o una ayuda, no te vuelve a retar hasta el día siguiente

  // ---- SET POR ELEMENTO: 5 técnicas DEL CATÁLOGO (U.Habilidades.elementos) ----
  // desbloqueoDuelos: en cuántos duelos contigo tiene que haber peleado para aprenderla.
  // La tabla SETS es la única fuente de QUÉ técnicas lleva Ren por elemento;
  // tecnicasDe() copia cada entrada del catálogo y le añade desbloqueo + claseIA.
  SETS: {
    agua: [
      { id: 'chorro', desbloqueoDuelos: 0, claseIA: 'chaman' },
      { id: 'mareaAgujas', desbloqueoDuelos: 0, claseIA: 'chaman' },
      { id: 'ola', desbloqueoDuelos: 0, claseIA: 'bandido' },
      { id: 'tromba', desbloqueoDuelos: 2, claseIA: 'chaman' },
      { id: 'prisionMarea', desbloqueoDuelos: 4, claseIA: 'veterano' }
    ],
    fuego: [
      { id: 'llamarada', desbloqueoDuelos: 0, claseIA: 'chaman' },
      { id: 'bolafuego', desbloqueoDuelos: 0, claseIA: 'chaman' },
      { id: 'colmilloBrasa', desbloqueoDuelos: 0, claseIA: 'bandido' },
      { id: 'serpienteFuego', desbloqueoDuelos: 2, claseIA: 'chaman' },
      { id: 'explosion', desbloqueoDuelos: 4, claseIA: 'veterano' }
    ],
    tierra: [
      { id: 'roca', desbloqueoDuelos: 0, claseIA: 'chaman' },
      { id: 'muroPiedra', desbloqueoDuelos: 0, claseIA: 'chaman' },
      { id: 'garraMontana', desbloqueoDuelos: 0, claseIA: 'bandido' },
      { id: 'avalancha', desbloqueoDuelos: 2, claseIA: 'chaman' },
      { id: 'terremoto', desbloqueoDuelos: 4, claseIA: 'veterano' }
    ],
    viento: [
      { id: 'rafaga', desbloqueoDuelos: 0, claseIA: 'chaman' },
      { id: 'hojaVendaval', desbloqueoDuelos: 0, claseIA: 'chaman' },
      { id: 'torbellino', desbloqueoDuelos: 0, claseIA: 'bandido' },
      { id: 'vendavalCortante', desbloqueoDuelos: 2, claseIA: 'chaman' },
      { id: 'tifon', desbloqueoDuelos: 4, claseIA: 'veterano' }
    ],
    rayo: [
      { id: 'chispa', desbloqueoDuelos: 0, claseIA: 'chaman' },
      { id: 'cadena', desbloqueoDuelos: 0, claseIA: 'chaman' },
      { id: 'lanzaCielo', desbloqueoDuelos: 0, claseIA: 'chaman' },
      { id: 'cieloPartido', desbloqueoDuelos: 2, claseIA: 'chaman' },
      { id: 'juicio', desbloqueoDuelos: 4, claseIA: 'veterano' }
    ]
  },
  // Respaldo de Viento (copia literal del catálogo): lo que devuelve tecnicasDe()
  // si U.Habilidades aún no cargó. Sin catálogo, Ren sigue siendo el de antes.
  tecnicas: [
    { id: 'rafaga', nombre: 'Ráfaga', umbral: 15, costo: 7, forma: 'linea', alcance: 7, radio: 0, power: 1.15, cd: 0.9, efecto: { empuje: 2.5 }, desbloqueoDuelos: 0, claseIA: 'chaman', elemento: 'viento',
      desc: 'Línea larga y fina que empuja.' },
    { id: 'hojaVendaval', nombre: 'Hoja del Vendaval', umbral: 25, costo: 14, forma: 'linea', alcance: 8, radio: 0, power: 1.5, cd: 1.6, efecto: { empuje: 2 }, desbloqueoDuelos: 0, claseIA: 'chaman', elemento: 'viento',
      desc: 'Una hoja de viento que corta en línea recta y empuja. 8 celdas.' },
    { id: 'torbellino', nombre: 'Torbellino', umbral: 40, costo: 15, forma: 'circulo', radio: 2, power: 1.3, cd: 2.5, efecto: { empuje: 3 }, desbloqueoDuelos: 0, claseIA: 'bandido', elemento: 'viento',
      desc: 'Círculo que expulsa a todos alrededor.' },
    { id: 'vendavalCortante', nombre: 'Vendaval Cortante', umbral: 55, costo: 18, forma: 'alterna', alcance: 12, power: 1.55, cd: 2.2, desbloqueoDuelos: 2, claseIA: 'chaman', elemento: 'viento',
      desc: 'Ráfagas en celdas alternas que cortan como cuchillas. 12 celdas de alcance.' },
    { id: 'tifon', nombre: 'Tifón del Cielo', umbral: 85, costo: 24, forma: 'circulo', radio: 2, power: 1.9, cd: 3.5, efecto: { empuje: 3 }, desbloqueoDuelos: 4, claseIA: 'veterano', elemento: 'viento',
      desc: 'Un tifón que nace a tu alrededor y lanza lejos a todo lo que toca. Radio 2.' }
  ],
  // Set completo de Ren para SU elemento (copias: el catálogo no se muta).
  tecnicasDe(elRen) {
    const el = (elRen && this.SETS[elRen]) ? elRen : 'viento';
    const cat = (typeof U !== 'undefined' && U.Habilidades && U.Habilidades.elementos && U.Habilidades.elementos[el]) || null;
    if (!cat) return this.tecnicas.map(t => Object.assign({}, t));
    return this.SETS[el].map(s => {
      const c = cat.find(h => h.id === s.id);
      return c ? Object.assign({}, c, { desbloqueoDuelos: s.desbloqueoDuelos, claseIA: s.claseIA, elemento: el }) : null;
    }).filter(Boolean);
  },
  // ¿Qué técnicas tiene desbloqueadas con N duelos peleados? (elRen: su elemento;
  // sin él, Viento, el comportamiento anterior).
  desbloqueadas(duelos, elRen) { return this.tecnicasDe(elRen || 'viento').filter(t => (t.desbloqueoDuelos || 0) <= (duelos || 0)); },
  porId(id, elRen) { return this.tecnicasDe(elRen || 'viento').find(t => t.id === id) || null; },

  // ---- DIÁLOGO: varias líneas por situación; el historial manda ----
  // 'encuentro' se resuelve en el sistema según el marcador (ventaja / empate / desventaja).
  // 'el Vendaval' en las líneas es el apodo base (Viento): U.Rival.dialogo() lo
  // sustituye por el apodo efectivo de Ren según su elemento (p. ej. 'la Marea').
  lineas: {
    primero: [
      '¡Eh, tú! Sí, tú, el nuevo. Me llamo Ren. He oído que hay un dominador nuevo en Bruma y vine a ver si vales algo… o si solo eres ruido.',
      '¿Así que tú eres el nuevo? Yo soy Ren, el Vendaval. Apúntate al torneo si te atreves: nos vemos en la final. Si llegas.',
      'Vaya, vaya… otro que quiere dominar los elementos. Yo ya voy por delante, pero me gusta tener a alguien a quien ganarle. Nos vemos en la arena.'
    ],
    reto: [
      '¡Otra vez tú! ¿Otra ronda? Venga, que hoy te lo voy a poner difícil. No me hagas bostezar.',
      'Te estaba buscando. Un duelo, aquí y ahora. Sin público, sin excusas.',
      '¿Crees que has mejorado? Demuéstramelo. Un duelo, y sin llorar después.'
    ],
    ganaJugador: [
      '…Vale. Vale, me ganaste. No pongas esa cara: no me voy a enfadar, voy a ENTRENAR. La próxima vez no te lo pongo tan fácil.',
      '¡Tch! Me ganaste… esta vez. ¿Sabes qué? Me gusta: por fin alguien que me obliga a mejorar. No te duermas, que yo no lo haré.',
      'Bien jugado. En serio. Me has ganado y me lo apunto: mañana entreno el doble. La revancha será otra historia.'
    ],
    ganaRival: [
      '¿Eso era todo? Jaja… venga, levántate. Cuando tus golpes pesen de verdad, vuelve y lo intentamos otra vez.',
      'Te lo dije: el Vendaval no se para con eso. Entrena más y vuelve. Me aburro ganándote tan fácil.',
      '¿Ya? Pensé que durarías más. No te lo tomes a mal: perder contra mí es casi un honor. Casi.'
    ],
    ayuda: [
      '…Te ves fatal. Toma, una poción. Y no me mires así: no te ayudo por lástima, es que si te mueres por ahí, ¿contra quién peleo yo?',
      'Eh, no te caigas aquí. Te curo un poco, pero que conste: lo hago porque un rival herido no me sirve. La próxima vez peleamos de verdad.',
      'Anda, respira. Estás hecho un desastre y todavía te queda mucho por mejorar… y yo necesito que mejores. Toma, recupérate.'
    ],
    encuentroVentaja: [ // vas ganando el marcador: te respeta (a regañadientes)
      'Ahí va el que me ganó… No te crezcas: solo significa que tendré que entrenar más que tú.',
      'Tú otra vez. Vale, reconozco que pegas fuerte. Pero esto no ha terminado: te sigo de cerca.',
      'Mira quién viene… el que me ganó. Disfrútalo mientras dure, porque estoy entrenando para la revancha.'
    ],
    encuentroEmpate: [
      'Empate en duelos, ¿eh? Eso no se queda así. Tarde o temprano uno de los dos se escapa.',
      'Tú y yo estamos a mano. Eso me gusta… y me molesta a partes iguales. Ya veremos quién rompe el empate.',
      'Seguimos empatados. Bien: así la rivalidad sabe mejor. La próxima vez, gano yo.'
    ],
    encuentroDesventaja: [ // él va ganando: se burla
      '¡Mira quién viene! ¿Otra vez a por la revancha? No aprende…',
      'Tú otra vez. ¿Cuántas van que te gano? No las cuento: me canso de contar.',
      'Eh, el de siempre. Ven, ven: una paliza rápida y sigo con mi día.'
    ],
    revancha: [
      '¿Revancha? Siempre. Pero esta vez no te guardo nada.',
      'Otra vez, claro. No sé rendirme, ¿y tú? Pues eso: a pelear.'
    ]
  }
};
