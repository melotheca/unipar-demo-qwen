/* === js/datos/aprendiz.js === */
/* Unipar — SER GUÍA (tener un aprendiz). Datos puros, sin lógica: el sistema vive
   en js/sistemas/aprendiz.js. No depende del orden de carga: solo define
   U.AprendizDatos; el registro (catálogo, personas, rutinas, guion) lo hace
   U.Aprendiz.init() cuando el juego ya arrancó.
   EL APRENDIZ ES REN: un chico de Bruma que practica la guardia con un palo en la
   plaza. No es un NPC inventado de la nada para la ocasión: vive en Bruma desde el
   primer día, con su rutina y su casa, y solo cuando el jugador ya es ALGUIEN en el
   pueblo (títulos + fama) se atreve a pedirle que sea su Guía. */
window.U = window.U || {};

U.AprendizDatos = {
  NPC_ID: 'ren',
  NOMBRE: 'Ren',
  ROL: 'Aspirante de Bruma · tu aprendiz',
  ELEMENTO: 'tierra',
  // DESBLOQUEO (explícito y sensato, juego tardío): 1+ título honorífico Y fama ≥20
  // en el pueblo actual. Los títulos son hazañas (Guerrero, Héroe de Bruma, Campeón…);
  // la fama es el karma del pueblo (−100…100, U.Orgs.fama / U.Economia.karma).
  TITULOS_MIN: 1,
  FAMA_MIN: 20,
  // El set que TÚ le enseñas: como en Pokémon, el aprendiz lleva el set que su
  // entrenador le pone. Máximo 5 técnicas, como el equipo del jugador (MAX_EQUIPO).
  MAX_TECNICAS: 5,
  // Reto: Ren solo te reta cuando ya creció un poco (maestría ≥15 en su elemento,
  // el umbral de la primera técnica, O 3 entrenos completados).
  RETO_MAESTRIA_MIN: 15,
  RETO_ENTRENOS_MIN: 3,
  // Graduación: deja de ser tu aprendiz cuando domina su elemento (70%, el umbral
  // de la tercera técnica) Y completó 10 entrenos. El jugador gana el título
  // 'Guía de Ren' (U.Progresion.otorgarTitulo).
  GRADUACION_MAESTRIA: 70,
  GRADUACION_ENTRENOS: 10,
  // Ren empieza como un principiante de verdad: stats bajos, maestría 5% en Tierra.
  STATS_INICIALES: { vida: 60, esencia: 30, ataque: 8, defensa: 8, mente: 8, velocidad: 8 },
  MAESTRIA_INICIAL: 5,
  // Paleta propia (U.Render.paletaNPC['ren']): si no existiera, el render usa la de
  // Kaelen como fallback, así que Ren siempre se ve; con esta, se ve DISTINTO.
  PALETA: { piel: '#e8c39e', pelo: '#2a4a2a', ropa: '#7a9a5b', ropa2: '#4a6b3a', detalle: '#f3d9a0' },
  // Plaza de Bruma, coordenadas del CONTINENTE (aldea +134,+222): junto a la fogata
  // pero sin pisarla (la fogata es sólida en 150.5,246.5). Casa: puerta vecina.
  SPAWN: { x: 153.5, y: 244.5 },
  CASA: { x: 157.5, y: 245.5 },
  // Rutina (coordenadas del continente, mapa 'aldea'): plaza, claro del bosque a
  // entrenar, puerta de la arena a mirar a los grandes, fogata al atardecer.
  // Se registra DESPUÉS de cargar vida.js, así que NO pasa por su conversión de
  // coordenadas viejas: estas ya son las buenas.
  RUTINA: [
    { d: 5, h: 9, m: 'aldea', x: 152.5, y: 244.5, l: 'la plaza de Bruma', a: 'practica la guardia con un palo' },
    { d: 9, h: 13, m: 'aldea', x: 70.5, y: 58.5, l: 'un claro del Bosque Susurrante', a: 'entrena solo, imitando a los grandes' },
    { d: 13, h: 17, m: 'aldea', x: 177.5, y: 253.5, l: 'la puerta de la Arena de Ecos', a: 'mira entrenar a los grandes' },
    { d: 17, h: 21, m: 'aldea', x: 151.5, y: 247.5, l: 'la fogata de la plaza', a: 'escucha historias junto al fuego' }
  ],
  PERSONA: {
    tipo: 'Tímido y tenaz',
    elemento: 'tierra',
    ritmo: 1.05,
    horaCasa: 21,
    desc: 'Aspirante de Bruma. Practica la guardia con un palo en la plaza y sueña con ser guardia como Kaelen. Tímido para hablar, tenaz para entrenar: no se rinde nunca.',
    gustos: ['ver entrenar a los grandes', 'los días despejados para practicar', 'que le digan bien hecho'],
    disgustos: ['que lo traten de chiquito', 'la tormenta que lo mete en casa'],
    frases: {
      calor: ['Con este calor practico tres golpes y ya quiero sombra… pero sigo.', 'El calor me tumba, pero la guardia se practica igual. Eso dice Kaelen.'],
      lluvia: ['Llueve y la guardia se practica igual. Bueno, eso dice Kaelen.', 'Con lluvia el palo se me resbala. Practico despacio.'],
      tormenta: ['La tormenta me da miedo… pero solo un poquito. Los truenos son el cielo entrenando, ¿verdad?', '¡Ese trueno fue ENORME! …me meto a casa.'],
      viento: ['¡El viento me empuja! ¡Así se entrena la guardia, dicen!', 'Viento: el palo se mueve solo. O eso me parece.'],
      niebla: ['Con niebla practico de memoria. Como los grandes.', 'No se ve nada… ¿y si hay un bandido? …¡mejor practico más!'],
      despejado: ['¡Día de practicar hasta la arena y volver! ¿Me miras?', 'Sol y plaza libre: ¡el mejor día para entrenar!'],
      nublado: ['Está nublado. ¿Las nubes también entrenan? Se ven fuertes.', 'Día gris: igual practico. Yo no me apago.']
    },
    victoria: '¡Te gané, Guía! ¡Lo practiqué TODO! ¿Lo viste? ¿Lo viste?',
    derrota: 'Lo hiciste bien… bueno, más o menos. ¡La próxima te gano, ya verás!',
    debil: 'Ya me cansé… los aprendices también se sientan. Me salgo.',
    expulsa: '¡Ya no pelees! ¡Te miras muy débil! ¡Fuera del círculo, que así se descansa!',
    cortoDebil: 'Ya me cansé… me salgo.'
  },
  SALUDO: {
    alegre: ['¡Guía! ¡Justo te buscaba! ¿Entrenamos hoy? ¡Traigo el palo!', '¡Qué bueno verte! Hoy practiqué el doble, ¿me miras?'],
    sereno: ['Buen día, Guía. Practiqué esta mañana. Creo que ya me sale mejor.'],
    neutral: ['Hola… soy Ren. Practico la guardia con un palo, en la plaza. ¿Me viste alguna vez?'],
    triste: ['Hoy no me sale nada… ¿tú también tuviste días así, cuando empezabas?'],
    enojado: ['¡No me mires así! ¡Yo también puedo! ¡Mira, mira cómo practico!'],
    asustado: ['¡Ay! …ah, eres tú, Guía. Perdón, pensé que era un bandido.']
  },
  // ENTRENOS: espejo de Torin (main.js iniciarEntreno / progresoEntreno). El jugador
  // hace la tarea (golpes Yin que conecten, dashes, meditación con R) y el que crece
  // es REN: sus stats y su maestría suben de forma visible. El jugador también gana
  // lo suyo por el entreno normal (progresoEntreno), como cuando entrena con Torin:
  // entrenar juntos hace crecer a los dos.
  // tipo = el tipo de E.entreno que progresoEntreno ya sabe contar ('golpes',
  // 'esquiva', 'meditacion'); meta = lo que hay que completar; recompensa = el stat
  // que sube EL JUGADOR al completar (igual que con Torin); crecimiento = lo que
  // sube REN al completar.
  ENTRENOS: {
    golpes: { tipo: 'golpes', meta: 5, nombre: 'Entreno de Ren · 5 golpes Yin que conecten', recompensa: 'ataque',
      crecimiento: { stats: { ataque: 1, vida: 2 }, maestria: 1.2, yin: 1 } },
    esquiva: { tipo: 'esquiva', meta: 3, nombre: 'Entreno de Ren · 3 dashes', recompensa: 'defensa',
      crecimiento: { stats: { defensa: 1, velocidad: 1 }, maestria: 1.0, yin: 0.5 } },
    meditacion: { tipo: 'meditacion', meta: 8, nombre: 'Entreno de Ren · medita 8 s (tecla R)', recompensa: 'mente',
      crecimiento: { stats: { mente: 1, esencia: 2 }, maestria: 1.0, yang: 0.5 } }
  }
};
