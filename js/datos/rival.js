/* === js/datos/rival.js === */
/* Unipar — EL RIVAL: Ren, el Vendaval.
   DISEÑO: lo conoces en el TORNEO DE BRUMA (primer encuentro natural: se inscribe
   contigo y te reta antes de la primera ronda). Después te lo vuelves a encontrar
   por el mundo — cerca de la Arena de Ecos, en los pueblos —: a veces te reta a
   duelo, a veces te ayuda cuando vas herido. Entrena como tú: crece un poco cada
   día de juego y MÁS después de cada duelo contigo, para seguir siendo un reto.
   ELEMENTO: Viento (rápido, burlón, siempre un paso por delante; su viento le
   gana a Tierra y Agua, y pierde contra Fuego y Rayo, como todo el mundo).
   PERSONALIDAD: arrogante y competitivo, pero con código: respeta a quien le
   gana de verdad y no deja tirado a un rival herido. Quiere ser el mejor del
   continente y te usa a ti como medida: si tú subes, él sube más.
   SET PROPIO (dirección Pokémon: movimientos con tipo, poder y efecto propio):
   5 técnicas ÚNICAS de Ren, con nombres inventados en español, del mundo de
   Unipar. La inspiración viene de las MECÁNICAS (no de los nombres): un haz de
   energía cargado y una esfera de energía (energía lanzada, estilo Dragon Ball),
   movimientos elementales con forma propia como un dragón de viento (jutsu
   elemental, estilo Naruto), un físico especial con efecto secundario (movimiento
   con tipo/poder/efecto, estilo Pokémon) y un ataque final grande. NINGÚN nombre
   con copyright: nada de Kamehameha, Rasengan, Chidori, Thunderbolt ni parecidos.
   ACLARACIÓN: el PUÑO normal NO es una técnica de Ren (ni de nadie): es el
   ataque universal que ya tiene todo el mundo. Su "Garra del Vendaval" es un
   movimiento FÍSICO ESPECIAL de Yin (como Golpe Rompe-Todo o Sobrecarga), no el
   puño básico; y su Haz/Esfera son movimientos de ENERGÍA de Yang, no puños.
   FORMAS Y EFECTOS: solo los que combate.js ya soporta (linea, proyectil,
   circulo, rect, alterna, cono, cadena, destello / empuje, slow, dot, stun,
   cegar). La columna `claseIA` dice con qué clase enemiga existente pelea cada
   técnica dentro del combate (combate.js solo ataca con las clases de CLASES):
   es el puente mientras no exista un ejecutor propio de técnicas enemigas. */
window.U = window.U || {};

U.RivalDatos = {
  nombre: 'Ren',
  apodo: 'el Vendaval',
  titulo: 'REN · EL VENDAVAL',
  elemento: 'viento',
  claseBase: 'chaman', // Viento a distancia, como su Haz: la clase de la que parte crearEnemigo
  personalidad: 'Arrogante y competitivo, con código: se burla cuando gana, respeta cuando pierde y no deja tirado a un rival herido.',
  descripcion: 'Un dominador de Viento obsesionado con ser el mejor del continente. Te usa como medida: cada vez que subes, él entrena para alcanzarte. Lo conoces en el Torneo de Bruma.',
  // Stats base (día 1, duelo 0): un poco por encima de un jugador nuevo, para que el primer duelo duela.
  BASE: { vida: 95, esencia: 60, ataque: 13, defensa: 10, mente: 9, velocidad: 13 },
  POR_DIA: { vida: 3, esencia: 1, ataque: 0.35, defensa: 0.25, mente: 0.2, velocidad: 0.3 }, // crece un poco cada día de juego
  POR_DUELO: 0.06, // +6% a todo después de CADA duelo contigo (gane quien gane: él también entrena)
  // Si te escapas mucho, Ren recorta: nunca baja del 90% de tu poder (tope +35%).
  MIN_PODER_RELATIVO: 0.9, TOPE_ALCANCE: 1.35,
  RECOMPENSA_DUELO: 40, // monedas al ganarle un duelo fuera del torneo (en la final del torneo el premio es el del podio, no este)
  ENFRIAMIENTO_DIAS: 1, // tras un duelo o una ayuda, no te vuelve a retar hasta el día siguiente

  // ---- SET PROPIO: 5 técnicas únicas (esquema = el de habilidades.js) ----
  // desbloqueoDuelos: en cuántos duelos contigo tiene que haber peleado para aprenderla.
  tecnicas: [
    { id: 'hazVendaval', nombre: 'Haz del Vendaval', costo: 14, forma: 'linea', alcance: 10, radio: 0, power: 1.6, cd: 2.5, efecto: null, desbloqueoDuelos: 0, claseIA: 'chaman',
      desc: 'Un haz de energía de viento cargado, recto y perforante: lo concentra un instante y lo suelta de golpe. Su ataque de energía a distancia (Yang).' },
    { id: 'esferaVendaval', nombre: 'Esfera Vendaval', costo: 12, forma: 'proyectil', alcance: 8, radio: 1, power: 1.5, cd: 1.8, efecto: null, explora: { radio: 1, power: 1.5 }, desbloqueoDuelos: 0, claseIA: 'chaman',
      desc: 'Una esfera de energía que vuela y estalla al impactar: daño en área pequeña. Su esfera de energía (Yang).' },
    { id: 'garraVendaval', nombre: 'Garra del Vendaval', costo: 6, forma: 'cono', alcance: 2, radio: 0, power: 1.4, cd: 1.2, efecto: { empuje: 2 }, desbloqueoDuelos: 0, claseIA: 'bandido',
      desc: 'Un tajo físico especial de viento, cuerpo a cuerpo, que EMPUJA al rival dos celdas. Movimiento físico de Yin (no es el puño normal: es un especial, como el Golpe Rompe-Todo).' },
    { id: 'dragonViento', nombre: 'Dragón de Viento', costo: 16, forma: 'rect', alcance: 6, radio: 1, power: 1.5, cd: 2.8, efecto: { empuje: 2, slow: 1 }, desbloqueoDuelos: 2, claseIA: 'chaman',
      desc: 'Un dragón de viento que arrasa 6 celdas en línea: empuja y FRENTA a quien alcanza. Su jutsu elemental con forma propia. Lo aprende tras 2 duelos contigo.' },
    { id: 'tormentaFinal', nombre: 'Tormenta Final', costo: 22, forma: 'circulo', alcance: 3, radio: 3, power: 1.9, cd: 4.0, efecto: { slow: 1.5 }, desbloqueoDuelos: 4, claseIA: 'veterano',
      desc: 'Su ataque final grande: una tormenta que estalla a su alrededor y frena a todo lo que toca. Solo la usa cuando ya te conoce bien (tras 4 duelos).' }
  ],
  // ¿Qué técnicas tiene desbloqueadas con N duelos peleados?
  desbloqueadas(duelos) { return this.tecnicas.filter(t => (t.desbloqueoDuelos || 0) <= (duelos || 0)); },
  porId(id) { return this.tecnicas.find(t => t.id === id) || null; },

  // ---- DIÁLOGO: varias líneas por situación; el historial manda ----
  // 'encuentro' se resuelve en el sistema según el marcador (ventaja / empate / desventaja).
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
