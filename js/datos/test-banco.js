/* === js/datos/test-banco.js === */
/* Unipar — banco del test inicial: 35 preguntas indirectas + escenas (mercado, carga, río, criatura, festival). Nadie ve los puntajes. */
window.U = window.U || {};

U.TestBanco = {
  // p = temperamento secreto · s = pista de estadística · a = pista de atributo · e = inclinación de estilo
  preguntas: [
    { t: 'Despiertas antes de la alarma. ¿Qué haces?', ops: [
      { t: 'Me levanto de una: el día no espera.', p: { fuego: 2 }, s: { velocidad: 1 }, a: { duro: 1 }, e: { yin: 1 } },
      { t: 'Me quedo flotando entre sueños, sin apuro.', p: { agua: 2 }, s: { vida: 1 }, a: { tenaz: 1 } },
      { t: 'Repaso el día en orden, punto por punto.', p: { rayo: 2, tierra: 1 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } },
      { t: 'Abro la ventana: ¿qué pasó afuera mientras dormía?', p: { viento: 2 }, s: { velocidad: 1 }, a: { fragil: 1 }, e: { yang: 1 } } ] },
    { t: 'Alguien te interrumpe a mitad de una idea.', ops: [
      { t: 'Le marco el corte en voz alta. Ya.', p: { fuego: 2 }, s: { ataque: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Escucho; retomaré si hace falta.', p: { agua: 2 }, s: { mente: 1 }, a: { fluido: 1 } },
      { t: 'Termino lo mío, tranquilo, aunque haya ruido.', p: { tierra: 2 }, s: { defensa: 1 }, a: { tenaz: 1 }, e: { yin: 1 } },
      { t: 'Me voy por la rama nueva: quizá era mejor.', p: { viento: 2, rayo: 1 }, s: { velocidad: 1 }, a: { inestable: 1 }, e: { yang: 1 } } ] },
    { t: 'Un plan que te tomó meses se cae a último momento.', ops: [
      { t: 'Armo otro plan hoy mismo.', p: { fuego: 2 }, s: { ataque: 1 }, a: { duro: 1 }, e: { yin: 1 } },
      { t: 'Me adapto: algo bueno saldrá del cambio.', p: { agua: 2 }, s: { esencia: 1 }, a: { fluido: 1 } },
      { t: 'Reviso qué falló y lo intento de nuevo, igual.', p: { tierra: 2 }, s: { vida: 1 }, a: { tenaz: 1 } },
      { t: 'Calculo la salida más corta y la ejecuto.', p: { rayo: 2 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } } ] },
    { t: '¿Qué te agota más?', ops: [
      { t: 'Esperar sin hacer nada.', p: { fuego: 2 }, s: { velocidad: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Los lugares rígidos, sin salida.', p: { viento: 2 }, s: { velocidad: 1 }, a: { fragil: 1 } },
      { t: 'La gente impredecible.', p: { tierra: 2, rayo: 1 }, s: { defensa: 1 }, a: { duro: 1 } },
      { t: 'Las decisiones apresuradas.', p: { agua: 2 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } } ] },
    { t: 'En un grupo nuevo, tu lugar natural es…', ops: [
      { t: 'El que empuja para que algo pase.', p: { fuego: 2 }, s: { ataque: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'El que lee el ambiente y suaviza.', p: { agua: 2 }, s: { mente: 1 }, a: { fluido: 1 } },
      { t: 'El que sostiene lo que todos sueltan.', p: { tierra: 2 }, s: { vida: 1 }, a: { tenaz: 1 } },
      { t: 'El que propone el camino raro.', p: { viento: 2, rayo: 1 }, s: { esencia: 1 }, a: { inestable: 1 }, e: { yang: 1 } } ] },
    { t: 'Tu cuarto, honestamente, está…', ops: [
      { t: 'En caos activo: sé dónde está todo.', p: { fuego: 1, viento: 2 }, s: { velocidad: 1 }, a: { inestable: 1 } },
      { t: 'Ordenado por fuera, lleno por dentro.', p: { agua: 1, tierra: 1 }, s: { defensa: 1 }, a: { pesado: 1 } },
      { t: 'Cada cosa en su lugar exacto.', p: { rayo: 2, tierra: 1 }, s: { mente: 1 }, a: { duro: 1 } },
      { t: 'Cambió tres veces este año.', p: { viento: 2, agua: 1 }, s: { esencia: 1 }, a: { fluido: 1 } } ] },
    { t: 'Cuando algo te importa de verdad…', ops: [
      { t: 'Voy con todo, aunque me queme.', p: { fuego: 2 }, s: { ataque: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Lo cuido en silencio, todos los días.', p: { agua: 1, tierra: 2 }, s: { vida: 1 }, a: { tenaz: 1 } },
      { t: 'Lo estudio hasta entenderlo del todo.', p: { rayo: 1, agua: 1 }, s: { mente: 2 }, a: { sabio: 1 }, e: { yang: 1 } },
      { t: 'Lo persigo aunque cambie de forma.', p: { viento: 2 }, s: { velocidad: 1 }, a: { fragil: 1 } } ] },
    { t: '¿Qué se siente peor?', ops: [
      { t: 'Quedarte quieto cuando podrías actuar.', p: { fuego: 2 }, s: { velocidad: 1 }, a: { duro: 1 }, e: { yin: 1 } },
      { t: 'Traicionar tu propia calma.', p: { agua: 2 }, s: { mente: 1 }, a: { fluido: 1 } },
      { t: 'Soltar algo que prometiste sostener.', p: { tierra: 2 }, s: { vida: 1 }, a: { tenaz: 1 } },
      { t: 'Elegir mal por no mirar bien.', p: { rayo: 2 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } } ] },
    { t: 'Una discusión sube de tono. Tú…', ops: [
      { t: 'Subo también: que se diga todo.', p: { fuego: 2 }, s: { ataque: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Bajo la voz hasta que el otro baje.', p: { agua: 2 }, s: { mente: 1 }, a: { fluido: 1 } },
      { t: 'No me muevo de mi punto.', p: { tierra: 2 }, s: { defensa: 1 }, a: { tenaz: 1 }, e: { yin: 1 } },
      { t: 'Corto con el dato exacto que cierra.', p: { rayo: 2 }, s: { ataque: 1 }, a: { duro: 1 }, e: { yang: 1 } } ] },
    { t: 'Eliges fila en el supermercado. ¿Cuál?', ops: [
      { t: 'La que avanza más rápido, aunque sea larga.', p: { fuego: 1, viento: 1 }, s: { velocidad: 1 }, a: { fragil: 1 } },
      { t: 'La de siempre: ya sé cómo funciona.', p: { tierra: 2 }, s: { defensa: 1 }, a: { pesado: 1 } },
      { t: 'La que tiene menos gente; calculo al ojo.', p: { rayo: 2 }, s: { mente: 1 }, a: { duro: 1 }, e: { yang: 1 } },
      { t: 'Da igual: me pongo a mirar alrededor.', p: { agua: 1, viento: 2 }, s: { esencia: 1 }, a: { fluido: 1 } } ] },
    { t: 'Una hora libre inesperada. Tú…', ops: [
      { t: 'Salgo a hacer algo, lo que sea.', p: { fuego: 1, viento: 2 }, s: { velocidad: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Me quedo donde estoy, en paz.', p: { agua: 1, tierra: 1 }, s: { vida: 1 }, a: { tenaz: 1 } },
      { t: 'Adelanto algo pendiente, en orden.', p: { tierra: 1, rayo: 2 }, s: { mente: 1 }, a: { duro: 1 } },
      { t: 'Me pierdo en algo nuevo sin plan.', p: { viento: 2, agua: 1 }, s: { esencia: 1 }, a: { inestable: 1 }, e: { yang: 1 } } ] },
    { t: 'Tu memoria funciona mejor con…', ops: [
      { t: 'Lo que hiciste con el cuerpo.', p: { fuego: 1, tierra: 1 }, s: { ataque: 1 }, a: { pesado: 1 }, e: { yin: 2 } },
      { t: 'Climas y sensaciones.', p: { agua: 2 }, s: { esencia: 1 }, a: { fluido: 1 } },
      { t: 'Rutas, lugares, mapas.', p: { viento: 1, tierra: 1 }, s: { velocidad: 1 }, a: { fragil: 1 } },
      { t: 'Patrones y detalles exactos.', p: { rayo: 2 }, s: { mente: 2 }, a: { sabio: 1 }, e: { yang: 2 } } ] },
    { t: 'Un favor grande en mal momento.', ops: [
      { t: 'Lo hago ya y después veo cómo.', p: { fuego: 2 }, s: { vida: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Busco la forma de ayudar sin romperme.', p: { agua: 2 }, s: { esencia: 1 }, a: { fluido: 1 } },
      { t: 'Cumplo lo que prometí, aunque cueste.', p: { tierra: 2 }, s: { defensa: 1 }, a: { tenaz: 1 } },
      { t: 'Digo que no, con precisión y sin drama.', p: { rayo: 2 }, s: { mente: 1 }, a: { duro: 1 }, e: { yang: 1 } } ] },
    { t: '¿Qué error te molesta más cometer?', ops: [
      { t: 'Ser lento.', p: { fuego: 2 }, s: { velocidad: 1 }, a: { duro: 1 } },
      { t: 'Ser cruel.', p: { agua: 2 }, s: { mente: 1 }, a: { sabio: 1 } },
      { t: 'Ser inconstante.', p: { tierra: 2 }, s: { vida: 1 }, a: { tenaz: 1 } },
      { t: 'Ser impreciso.', p: { rayo: 2 }, s: { ataque: 1 }, a: { sabio: 1 }, e: { yang: 1 } } ] },
    { t: 'Llueve de golpe en la calle.', ops: [
      { t: 'Corro: que no me atrape.', p: { fuego: 1, viento: 2 }, s: { velocidad: 1 }, a: { fragil: 1 }, e: { yin: 1 } },
      { t: 'Me dejo mojar un poco, no pasa nada.', p: { agua: 2 }, s: { vida: 1 }, a: { fluido: 1 } },
      { t: 'Sigo a mi ritmo: la lluvia no manda.', p: { tierra: 2 }, s: { defensa: 1 }, a: { tenaz: 1 } },
      { t: 'Busco el alero exacto en dos segundos.', p: { rayo: 2 }, s: { mente: 1 }, a: { duro: 1 }, e: { yang: 1 } } ] },
    { t: '¿Qué es para ti la paciencia?', ops: [
      { t: 'Una espera que me quema.', p: { fuego: 2 }, s: { ataque: 1 }, a: { fuerte: 1 } },
      { t: 'Un río: llega solo.', p: { agua: 2 }, s: { esencia: 1 }, a: { fluido: 1 } },
      { t: 'Una raíz: sostiene todo.', p: { tierra: 2 }, s: { vida: 1 }, a: { tenaz: 1 } },
      { t: 'Un disparo que aún no sale.', p: { rayo: 2 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } } ] },
    { t: 'Si nadie te viera, ¿cómo bailarías?', ops: [
      { t: 'Con todo el cuerpo, sin regla.', p: { fuego: 2, viento: 1 }, s: { velocidad: 1 }, a: { fuerte: 1 }, e: { yin: 2 } },
      { t: 'Como agua, siguiendo la música.', p: { agua: 2 }, s: { esencia: 1 }, a: { fluido: 1 }, e: { yin: 1 } },
      { t: 'Pisos firmes, ritmo constante.', p: { tierra: 2 }, s: { defensa: 1 }, a: { pesado: 1 }, e: { yin: 1 } },
      { t: 'Movimientos mínimos, exactos.', p: { rayo: 2 }, s: { mente: 1 }, a: { duro: 1 }, e: { yang: 2 } } ] },
    { t: 'Te dejan a cargo de algo que no conoces. Primer paso:', ops: [
      { t: 'Lanzarme y aprender en marcha.', p: { fuego: 2, viento: 1 }, s: { ataque: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Preguntar a quien ya lo hizo.', p: { agua: 2 }, s: { mente: 1 }, a: { sabio: 1 } },
      { t: 'Asegurar lo básico antes de mover.', p: { tierra: 2 }, s: { defensa: 1 }, a: { tenaz: 1 } },
      { t: 'Mapear el problema entero primero.', p: { rayo: 2 }, s: { mente: 2 }, a: { sabio: 1 }, e: { yang: 2 } } ] },
    { t: '¿Qué te da más miedo de ti mismo?', ops: [
      { t: 'Arder y arrastrar a otros.', p: { fuego: 2 }, s: { vida: 1 }, a: { fuerte: 1 } },
      { t: 'Disolverme hasta no tener forma.', p: { agua: 2 }, s: { esencia: 1 }, a: { inestable: 1 } },
      { t: 'Volverme piedra, no sentir.', p: { tierra: 2 }, s: { defensa: 1 }, a: { pesado: 1 } },
      { t: 'Ser un rayo sin dirección.', p: { rayo: 1, viento: 1 }, s: { mente: 1 }, a: { inestable: 1 } } ] },
    { t: 'La frase que más te suena a ti:', ops: [
      { t: 'Primero hago, después entiendo.', p: { fuego: 2 }, s: { ataque: 1 }, a: { duro: 1 }, e: { yin: 1 } },
      { t: 'Todo encuentra su cauce.', p: { agua: 2 }, s: { esencia: 1 }, a: { fluido: 1 } },
      { t: 'Lo que se sostiene, vale.', p: { tierra: 2 }, s: { vida: 1 }, a: { tenaz: 1 } },
      { t: 'Un instante bien elegido lo cambia todo.', p: { rayo: 2 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } },
      { t: 'El camino se hace al andar.', p: { viento: 2 }, s: { velocidad: 1 }, a: { fragil: 1 } } ] },
    { t: 'Te despiertas en un lugar que no reconoces.', ops: [
      { t: 'Me levanto y exploro: quieto no se entiende nada.', p: { fuego: 2 }, s: { velocidad: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Escucho primero: el lugar también respira.', p: { agua: 2 }, s: { mente: 1 }, a: { fluido: 1 } },
      { t: 'Reviso qué tengo y aseguro un rincón seguro.', p: { tierra: 2 }, s: { defensa: 1 }, a: { tenaz: 1 }, e: { yin: 1 } },
      { t: 'Salgo a mirar desde lo más alto que encuentre.', p: { viento: 2 }, s: { velocidad: 1 }, a: { fragil: 1 }, e: { yang: 1 } } ] },
    { t: 'Un desconocido te ofrece ayuda sin que la pidas.', ops: [
      { t: 'La acepto: nadie llega por nada.', p: { agua: 2 }, s: { esencia: 1 }, a: { fluido: 1 } },
      { t: 'Pregunto qué espera a cambio antes de aceptar.', p: { tierra: 2 }, s: { mente: 1 }, a: { duro: 1 } },
      { t: 'La acepto, pero sigo mi propio camino igual.', p: { viento: 2 }, s: { velocidad: 1 }, a: { inestable: 1 }, e: { yang: 1 } },
      { t: 'Calculo en un segundo si me conviene.', p: { rayo: 2 }, s: { velocidad: 1 }, a: { sabio: 1 }, e: { yang: 1 } } ] },
    { t: 'El puente del camino está roto.', ops: [
      { t: 'Busco piedras y lo reparo, aunque tarde.', p: { tierra: 2 }, s: { vida: 1 }, a: { pesado: 1 }, e: { yin: 1 } },
      { t: 'Rodeo por donde el viento sople a favor.', p: { viento: 2 }, s: { velocidad: 1 }, a: { fragil: 1 }, e: { yang: 1 } },
      { t: 'Mido el salto: si da, salto.', p: { rayo: 2 }, s: { ataque: 1 }, a: { duro: 1 }, e: { yang: 1 } },
      { t: 'Cruzo por el agua helada, sin pensarlo dos veces.', p: { fuego: 2 }, s: { ataque: 1 }, a: { fuerte: 1 }, e: { yin: 1 } } ] },
    { t: 'Escuchas un ruido raro en la noche.', ops: [
      { t: 'Salgo a ver: la curiosidad manda.', p: { viento: 2 }, s: { velocidad: 1 }, a: { inestable: 1 }, e: { yang: 1 } },
      { t: 'Escucho fijo: el patrón dice qué es.', p: { rayo: 2 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } },
      { t: 'Agarro algo pesado y voy directo al ruido.', p: { fuego: 2 }, s: { ataque: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Espero en silencio: casi todo pasa solo.', p: { agua: 2 }, s: { esencia: 1 }, a: { pesado: 1 } } ] },
    { t: 'Te toca enseñar algo a alguien que no sabe.', ops: [
      { t: 'Le muestro el atajo exacto, sin rodeos.', p: { rayo: 2 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } },
      { t: 'Lo pongo a hacerlo ya: se aprende haciendo.', p: { fuego: 2 }, s: { ataque: 1 }, a: { duro: 1 }, e: { yin: 1 } },
      { t: 'Voy a su ritmo, sin apurarlo nunca.', p: { agua: 2 }, s: { vida: 1 }, a: { fluido: 1 } },
      { t: 'Empiezo por lo básico, paso a paso, como debe ser.', p: { tierra: 2 }, s: { defensa: 1 }, a: { tenaz: 1 }, e: { yin: 1 } } ] },
    { t: 'Una tormenta se acerca y estás lejos de casa.', ops: [
      { t: 'Corro: llego antes que ella.', p: { fuego: 2 }, s: { velocidad: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Busco refugio tranquilo y la dejo pasar.', p: { agua: 2 }, s: { vida: 1 }, a: { tenaz: 1 } },
      { t: 'Aseguro todo lo que pueda volarse y espero firme.', p: { tierra: 2 }, s: { defensa: 1 }, a: { pesado: 1 }, e: { yin: 1 } },
      { t: 'Me muevo con ella, de refugio en refugio.', p: { viento: 2 }, s: { velocidad: 1 }, a: { inestable: 1 }, e: { yang: 1 } } ] },
    { t: 'Encuentras algo valioso que no es tuyo.', ops: [
      { t: 'Lo dejo donde estaba: el río devuelve lo suyo.', p: { agua: 2 }, s: { esencia: 1 }, a: { sabio: 1 } },
      { t: 'Lo guardo hasta encontrar a su dueño.', p: { tierra: 2 }, s: { vida: 1 }, a: { tenaz: 1 }, e: { yin: 1 } },
      { t: 'Lo miro, lo admiro… y sigo mi camino libre.', p: { viento: 2 }, s: { velocidad: 1 }, a: { fragil: 1 }, e: { yang: 1 } },
      { t: 'Reviso marcas y detalles: alguien lo perdió hoy.', p: { rayo: 2 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } } ] },
    { t: 'Tu equipo pierde por un error tuyo.', ops: [
      { t: 'Cargo con ello y entreno el doble mañana.', p: { tierra: 2 }, s: { vida: 1 }, a: { pesado: 1 }, e: { yin: 1 } },
      { t: 'Lo suelto rápido: quedarse pegado no sirve.', p: { viento: 2 }, s: { esencia: 1 }, a: { inestable: 1 }, e: { yang: 1 } },
      { t: 'Analizo el error hasta que no se repita.', p: { rayo: 2 }, s: { mente: 1 }, a: { duro: 1 }, e: { yang: 1 } },
      { t: 'Pido la revancha ahí mismo.', p: { fuego: 2 }, s: { ataque: 1 }, a: { fuerte: 1 }, e: { yin: 1 } } ] },
    { t: '¿Qué casa te gustaría?', ops: [
      { t: 'Una que se mueva: barco, caravana, lo que sea.', p: { viento: 2 }, s: { velocidad: 1 }, a: { fragil: 1 }, e: { yang: 1 } },
      { t: 'Pequeña, exacta, todo a la mano y medido.', p: { rayo: 2 }, s: { mente: 1 }, a: { duro: 1 }, e: { yang: 1 } },
      { t: 'Una con fogata grande y puerta siempre abierta.', p: { fuego: 2 }, s: { vida: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Una junto al agua, que se oiga de noche.', p: { agua: 2 }, s: { esencia: 1 }, a: { fluido: 1 } } ] },
    { t: 'Te dan a elegir una herramienta para siempre.', ops: [
      { t: 'Un instrumento de precisión, fino y exacto.', p: { rayo: 2 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } },
      { t: 'Un hacha buena: corta, defiende, resuelve.', p: { fuego: 2 }, s: { ataque: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Una red: sirve para pescar, cargar y atrapar.', p: { agua: 2 }, s: { esencia: 1 }, a: { tenaz: 1 } },
      { t: 'Una pala: con ella se construye todo.', p: { tierra: 2 }, s: { defensa: 1 }, a: { pesado: 1 }, e: { yin: 1 } } ] },
    { t: 'Alguien que quieres está triste y no dice por qué.', ops: [
      { t: 'Lo saco a hacer algo: moverse cura.', p: { fuego: 2 }, s: { velocidad: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Me siento a su lado, sin preguntas.', p: { agua: 2 }, s: { vida: 1 }, a: { fluido: 1 } },
      { t: 'Le llevo comida y me quedo cerca, disponible.', p: { tierra: 2 }, s: { defensa: 1 }, a: { tenaz: 1 }, e: { yin: 1 } },
      { t: 'Le cuento algo nuevo que lo distraiga del peso.', p: { viento: 2 }, s: { esencia: 1 }, a: { inestable: 1 }, e: { yang: 1 } } ] },
    { t: 'El camino se parte en dos y no hay señal.', ops: [
      { t: 'Sigo el que suene a agua: ahí hay vida.', p: { agua: 2 }, s: { mente: 1 }, a: { inestable: 1 } },
      { t: 'El más firme: el otro se ve flojo.', p: { tierra: 2 }, s: { defensa: 1 }, a: { pesado: 1 }, e: { yin: 1 } },
      { t: 'El que no tomaría nadie: ese quiero ver.', p: { viento: 2 }, s: { velocidad: 1 }, a: { fragil: 1 }, e: { yang: 1 } },
      { t: 'Reviso huellas y sombra: los datos deciden.', p: { rayo: 2 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } } ] },
    { t: 'Tienes que esperar una semana entera sin hacer nada.', ops: [
      { t: 'Perfecto: descanso, ordeno, reparo lo mío.', p: { tierra: 2 }, s: { vida: 1 }, a: { tenaz: 1 }, e: { yin: 1 } },
      { t: 'Imposible: algo invento cada día.', p: { viento: 2 }, s: { velocidad: 1 }, a: { inestable: 1 }, e: { yang: 1 } },
      { t: 'Lo uso para planear el próximo año, entero.', p: { rayo: 2 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } },
      { t: 'Aguanto dos días. Al tercero ya estoy en algo.', p: { fuego: 2 }, s: { ataque: 1 }, a: { inestable: 1 }, e: { yin: 1 } } ] },
    { t: 'Un niño te pregunta por qué el cielo es azul.', ops: [
      { t: 'Le digo que salga a mirarlo y me cuente él.', p: { viento: 2 }, s: { esencia: 1 }, a: { fragil: 1 }, e: { yang: 1 } },
      { t: 'Le explico la luz y el aire, con calma y exacto.', p: { rayo: 2 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } },
      { t: 'Le invento una historia mejor que la verdad.', p: { fuego: 2 }, s: { ataque: 1 }, a: { inestable: 1 }, e: { yin: 1 } },
      { t: 'Le digo que algunas cosas se sienten, no se explican.', p: { agua: 2 }, s: { esencia: 1 }, a: { fluido: 1 } } ] },
    { t: 'Si tu vida fuera un clima, sería…', ops: [
      { t: 'Una tormenta breve que lo aclara todo.', p: { rayo: 2 }, s: { velocidad: 1 }, a: { inestable: 1 }, e: { yang: 1 } },
      { t: 'Un mediodía de verano, sin una nube.', p: { fuego: 2 }, s: { vida: 1 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { t: 'Lluvia suave que no para en días.', p: { agua: 2 }, s: { esencia: 1 }, a: { fluido: 1 } },
      { t: 'Un otoño firme: todo cae donde debe.', p: { tierra: 2 }, s: { defensa: 1 }, a: { pesado: 1 }, e: { yin: 1 } } ] }
  ],

  // Escena (a): mercado — toca lo primero que te llame la atención (sin pregunta).
  mercado: {
    titulo: 'Un mercado cualquiera. Toca lo primero que te llame la atención.',
    sub: 'Sin pensar. Solo tu instinto.',
    objetos: [
      { id: 'frutas', nombre: 'Puesto de frutas', x: 28, y: 84, w: 66, h: 52, p: { fuego: 1, tierra: 1 }, a: { pesado: 1 } },
      { id: 'musico', nombre: 'El músico', x: 118, y: 62, w: 42, h: 66, p: { viento: 2, agua: 1 }, a: { fluido: 1 }, e: { yang: 1 } },
      { id: 'jaula', nombre: 'Pájaro en la jaula', x: 196, y: 56, w: 32, h: 46, p: { viento: 2 }, a: { fragil: 1 } },
      { id: 'mapa', nombre: 'Mapa viejo', x: 246, y: 92, w: 54, h: 42, p: { rayo: 1, viento: 1 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } },
      { id: 'fuente', nombre: 'La fuente', x: 140, y: 128, w: 66, h: 40, p: { agua: 2 }, a: { fluido: 1 } },
      { id: 'gato', nombre: 'Gato dormido', x: 62, y: 146, w: 40, h: 24, p: { agua: 1, tierra: 1 }, a: { tenaz: 1 } },
      { id: 'balanza', nombre: 'La balanza', x: 276, y: 138, w: 34, h: 34, p: { rayo: 2, tierra: 1 }, a: { duro: 1 } }
    ]
  },

  // Escena (c): mantener presionado y soltar cuando "sientas que es suficiente".
  carga: {
    titulo: 'Mantén presionado el círculo.',
    sub: 'Suelta cuando sientas que es suficiente. No hay meta visible.',
    tramos: [
      { max: 0.45, p: { fuego: 2, rayo: 1 }, a: { duro: 1, fragil: 1 }, e: { yin: 1 }, nota: 'Soltaste casi de inmediato.' },
      { max: 1.2,  p: { rayo: 1, viento: 1 }, a: { duro: 1 }, nota: 'Un pulso breve y medido.' },
      { max: 2.4,  p: { agua: 2 }, s: { esencia: 1 }, a: { fluido: 1 }, nota: 'Esperaste con calma.' },
      { max: 99,   p: { tierra: 2, agua: 1 }, s: { vida: 1 }, a: { tenaz: 1, pesado: 1 }, e: { yang: 1 }, nota: 'Sostuviste hasta el fondo.' }
    ]
  },

  // Escena nueva: el río — toca lo primero que te llame la atención (sin pregunta).
  rio: {
    titulo: 'Un río ancho corta el camino. Toca lo primero que te llame la atención.',
    sub: 'Sin pensar. Solo tu instinto.',
    objetos: [
      { id: 'fogata', nombre: 'La fogata de la orilla', x: 16, y: 56, w: 38, h: 32, p: { fuego: 2 }, a: { duro: 1 }, e: { yin: 1 } },
      { id: 'puente', nombre: 'El puente de cuerdas', x: 118, y: 34, w: 84, h: 28, p: { rayo: 1, viento: 1 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } },
      { id: 'libelula', nombre: 'La libélula', x: 262, y: 44, w: 28, h: 18, p: { viento: 1, rayo: 1 }, s: { velocidad: 1 }, a: { inestable: 1 }, e: { yang: 1 } },
      { id: 'pez', nombre: 'El pez que salta', x: 56, y: 118, w: 32, h: 20, p: { agua: 2 }, a: { fluido: 1 } },
      { id: 'barca', nombre: 'La barca vieja', x: 216, y: 92, w: 58, h: 24, p: { tierra: 1, agua: 1 }, a: { tenaz: 1 } },
      { id: 'piedra', nombre: 'La piedra plana', x: 120, y: 132, w: 46, h: 20, p: { tierra: 2 }, a: { pesado: 1 } },
      { id: 'remolino', nombre: 'El remolino', x: 168, y: 112, w: 38, h: 26, p: { agua: 2 }, a: { inestable: 1 } }
    ]
  },

  // Escena nueva: la criatura herida — toca lo primero que mires (sin pregunta).
  criatura: {
    titulo: 'Una criatura herida junto al camino. Toca lo primero que mires.',
    sub: 'Sin pensar. Solo tu instinto.',
    objetos: [
      { id: 'arbol', nombre: 'La sombra del árbol', x: 118, y: 14, w: 74, h: 32, p: { viento: 2 }, a: { fragil: 1 } },
      { id: 'capa', nombre: 'Tu capa para cubrirla', x: 36, y: 52, w: 42, h: 32, p: { fuego: 2 }, a: { fuerte: 1 }, e: { yin: 1 } },
      { id: 'huellas', nombre: 'Las huellas que se alejan', x: 232, y: 44, w: 54, h: 26, p: { rayo: 2 }, a: { duro: 1 }, e: { yang: 1 } },
      { id: 'criatura', nombre: 'La criatura herida', x: 128, y: 88, w: 62, h: 46, p: { agua: 2 }, a: { fluido: 1 } },
      { id: 'hierbas', nombre: 'Las hierbas del borde', x: 36, y: 122, w: 46, h: 28, p: { tierra: 2 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } },
      { id: 'arroyo', nombre: 'El agua del arroyo', x: 232, y: 112, w: 60, h: 32, p: { agua: 1, tierra: 1 }, a: { tenaz: 1 } }
    ]
  },

  // Escena nueva: el festival — toca lo primero que te llame la atención (sin pregunta).
  festival: {
    titulo: 'Un festival de noche en la plaza. Toca lo primero que te llame la atención.',
    sub: 'Sin pensar. Solo tu instinto.',
    objetos: [
      { id: 'faroles', nombre: 'Los faroles', x: 28, y: 26, w: 52, h: 32, p: { fuego: 2 }, a: { duro: 1 }, e: { yin: 1 } },
      { id: 'mascaras', nombre: 'Las máscaras', x: 104, y: 38, w: 46, h: 36, p: { viento: 1, agua: 1 }, s: { mente: 1 }, a: { sabio: 1 }, e: { yang: 1 } },
      { id: 'cohetes', nombre: 'Los fuegos del cielo', x: 206, y: 16, w: 62, h: 38, p: { rayo: 2 }, a: { inestable: 1 }, e: { yang: 1 } },
      { id: 'tambores', nombre: 'Los tambores', x: 36, y: 108, w: 56, h: 42, p: { fuego: 1, tierra: 1 }, a: { pesado: 1 }, e: { yin: 1 } },
      { id: 'danza', nombre: 'El círculo de danza', x: 118, y: 104, w: 62, h: 44, p: { viento: 2 }, a: { fluido: 1 } },
      { id: 'cantaro', nombre: 'El cántaro de agua', x: 196, y: 120, w: 30, h: 28, p: { agua: 2 }, a: { fluido: 1 } },
      { id: 'comida', nombre: 'El puesto de comida', x: 232, y: 100, w: 64, h: 46, p: { tierra: 2 }, a: { tenaz: 1 } }
    ]
  }
};
