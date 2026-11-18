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
   ALDEA: Bruma, siempre. No se mueve a otra aldea (pendiente de decisión del
   usuario: misma aldea o aldea contraria; aquí NO se decide).
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
