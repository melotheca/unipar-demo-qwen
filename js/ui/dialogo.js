/* === js/ui/dialogo.js === */
/* Unipar — diálogo: cara pixel-art, emoción y tono visibles, opciones que alimentan el motor de emociones con razón visible. */
window.U = window.U || {};

U.Dialogo = {
  npc: null, textoCompleto: '', mostrado: 0, abierto: false, opciones: [], razon: '', esCartel: false, fase: 'normal', modo: 'npc',
  guiones: {
    kaelen: {
      saludo: { alegre: ['¡Ja! Te veía con cara de querer problemas. La arena te espera al sureste.', 'Buen día para pelear. Se te nota el fuego en los pasos.'], sereno: ['Todo en orden por aquí. Si buscas acción, la Arena de Ecos está al sureste.'], neutral: ['Hmm. Tú debes ser el nuevo. Soy Kaelen, guardia de Bruma. La arena está al sureste, cruzando el puente.'], triste: ['Otro día gris… Si vas a la arena, al menos no me aburras.'], enojado: ['¿Qué quieres? Estoy de guardia, no de niñera.'], asustado: ['¡No te acerques tan rápido! …ah, eres tú. Perdón.'] },
      opciones: [
        { t: 'Saludarlo con calidez', realidad: 72, energia: 5, resp: { pos: 'Así se habla. Bruma necesita gente así.', neg: '…gracias. Supongo.' }, et: 'saludo' },
        { t: 'Preguntar por la arena', realidad: 60, energia: 5, resp: { pos: 'Tres oleadas. La runa del centro las activa. Los enemigos marcan el suelo antes de golpear: muévete o esquiva con el dash.', neg: 'Runa del centro. Tres oleadas. Eso es todo.' }, accion: 'arena', et: 'pregunta' },
        { t: 'Reto de combate de Kaelen (duelo con tiempo)', realidad: 66, energia: 15, resp: { pos: 'Acepto el reto.', neg: 'Sin reto.' }, accion: 'reto', et: 'reto' },
        { t: '🏆 Inscribirme al TORNEO DE BRUMA (entrada 50 🪙 · solo cobra el podio)', realidad: 70, energia: 15, resp: { pos: 'Inscrito con la entrada cobrada al pelear. Ve a la Arena de Ecos: allí saldrá tu rival de octavos. Solo cobra el podio: 300, 150 y 80.', neg: 'Inscrito.' }, accion: 'torneo', et: 'torneo' },
        { t: 'Entrenar con Kaelen: guardia y esquiva (guía)', realidad: 66, energia: 12, resp: { pos: 'Dash, dash, dash. Tres esquivas con dash y tu cuerpo aprende. Ya empezó: mira el contador en pantalla.', neg: 'Muévete.' }, accion: 'entrenoGuia', et: 'entrenar' },
        { t: '🛡 Aprender el ESCUDO (técnica de Guía)', realidad: 68, energia: 10, resp: { pos: 'El escudo no se regala: se aprende.', neg: 'El escudo se aprende, no se pide.' }, accion: 'aprenderEscudo', et: 'escudo' },
        { t: '✦ Aprender el Puño del Cometa (técnica especial de Guía)', realidad: 68, energia: 10, resp: { pos: 'El Puño del Cometa no se aprende mirando: se aprende siguiendo. Te lo demuestro, y tú sigues la demostración hasta que vaya a tu velocidad. ¿Empezamos?', neg: 'El Cometa espera. Cuando quieras.' }, accion: 'aprenderEspecial', tecId: 'puñoCometa', et: 'entrenar' },
        { t: 'Presumir de tu poder', realidad: 66, energia: 15, resp: { pos: '¡Eso quiero ver! Que la arena lo confirme.', neg: 'Sí, sí. Todos son fuertes hasta que reciben.' }, et: 'presumir' },
        { t: 'Provocarlo', realidad: 18, energia: 25, resp: { pos: '…¿Estás bien de la cabeza?', neg: 'Repite eso y te saco yo mismo de la aldea.' }, et: 'provocar' }
      ]
    },
    sora: {
      saludo: { alegre: ['¡Qué alegría verte! El pozo canta cuando alguien con calma se acerca.', 'Ven, ven. Te ves entero, eso me gusta.'], sereno: ['Respira. Aquí el agua va despacio y nosotros también.'], neutral: ['Soy Sora. Cuido el pozo y a los que vuelven golpeados de la arena. ¿Necesitas algo?'], triste: ['Ay… perdón, no estoy de ánimo. Pero dime, ¿estás herido?'], enojado: ['No voy a curarte si vienes a pelear también conmigo.'], asustado: ['¡Ay! Me asustaste… los nervios, ya sabes.'] },
      opciones: [
        { t: 'Saludarla con calidez', realidad: 74, energia: 4, resp: { pos: 'Quédate un momento. La calma también cura.', neg: '…hola.' }, et: 'saludo' },
        { t: 'Pedir una poción', realidad: 62, energia: 5, resp: { pos: 'Toma. Es una poción de +50 unidades, preparada a medida: cura 50 de Vida, y lo que sobre al tomarla se pierde. La recuperación automática solo llega al 25%: úsala cuando de verdad importe.', neg: 'Te la doy, pero no las desperdicies.' }, accion: 'pocion', et: 'pocion' },
        { t: 'Entrenar con Sora: meditación guiada (guía)', realidad: 66, energia: 8, resp: { pos: 'Siéntate conmigo en la calma: medita (tecla R) un total de 8 segundos y tu Mente y tu Yang respiran. Ya empezó: mira el contador.', neg: 'Respira.' }, accion: 'entrenoGuia', et: 'entrenar' },
        { t: '✦ Aprender el Dragón del Lago (técnica especial de Guía)', realidad: 68, energia: 10, resp: { pos: 'El Dragón del Lago es agua con paciencia: te lo demuestro, y tú lo sigues hasta que lo sientas tuyo. ¿Empezamos?', neg: 'El lago no se va. Cuando quieras.' }, accion: 'aprenderEspecial', tecId: 'dragonLago', et: 'entrenar' },
        { t: '✦ Aprender la Flor de Escarcha (técnica especial de Guía)', realidad: 68, energia: 10, resp: { pos: 'La Flor de Escarcha se abre en un instante: te la demuestro, y tú la sigues hasta que se abra a tu ritmo. ¿Empezamos?', neg: 'La escarcha espera. Cuando quieras.' }, accion: 'aprenderEspecial', tecId: 'florEscarcha', et: 'entrenar' },
        { t: '✦ Aprender el PRESENTIMIENTO (habilidad de Entre-Mundos)', realidad: 68, energia: 10, resp: { pos: 'El Presentimiento no se mira: se siente. Es de Entre-Mundos: pide Mente alta y maestría de tu elemento al 70%. Te lo demuestro despacio, y tú lo sigues hasta sentirlo tuyo. Cuesta más que una técnica normal: catorce aciertos. ¿Empezamos?', neg: 'El sentir espera. Cuando tu Mente y tu maestría estén listas.' }, accion: 'aprenderPresentimiento', et: 'entrenar' },
        { t: 'Preguntar por el descanso', realidad: 60, energia: 3, resp: { pos: 'Tu Vida se recupera sola siempre que estés bajo una cuarta parte de tu máximo, y se detiene justo ahí: el 25% es el tope de la recuperación automática en campo abierto. Pero si duermes en la fogata —interactúa con ella— el tiempo avanza hasta el siguiente momento del día (Madrugada, Amanecer, Mañana, Tarde, Atardecer o Noche) y despiertas con Vida y Esencia al cien por ciento, en la fase que toque. Un día completo dura veinte minutos y tiene 6 momentos: Madrugada 0–4, Amanecer 4–8, Mañana 8–12, Tarde 12–16, Atardecer 16–20 y Noche 20–0. La semana corre en el calendario: Lunes a Domingo, y cada medianoche suma un día a tu vida. La Esencia vuelve sola siempre, a ritmo constante: rápida fuera de combate, más lenta en combate, y golpeando con Yin recuperas aún más. Y quieto, meditando, también entrenas el Yang poco a poco: así se alcanza aunque el test no te haya dado afinidad. Y mira la barrita verde bajo tu Esencia: es tu CONDICIÓN — cien por ciento es estar en perfecta forma. Cada 10 de Esencia que gastas en total, baja 1; y entre más baja esté, más lento se recarga tu Esencia (nunca deja de recargarse, pero se nota). Se recupera muy despacio fuera de combate, según tu atributo, por hora de juego; en combate no se recupera. Dormir te la deja al cien por ciento de su máximo. Y si de verdad te cansas —si cae por debajo de 25— tu máximo crece 5, y dominar el Yin te da todavía más barra. Así que {descansar_bien}: pelear en mala condición es pelear a media máquina.', neg: 'Vida sola hasta el veinticinco por ciento. Para el cien: duerme en la fogata. Y ojo con la barrita verde: es tu condición, y frena tu recarga.' }, et: 'pregunta' },
        { t: 'Provocarla', realidad: 15, energia: 25, resp: { pos: '…¿Por qué harías eso?', neg: 'Fuera. Ahora.' }, et: 'provocar' }
      ]
    },
    torin: {
      saludo: { alegre: ['¡Ese es el espíritu! El cuerpo primero, la energía después. Ven, te enseño algo.', 'Je. Se te ve firme. Bien.'], sereno: ['El martillo y el puño tienen el mismo secreto: repetir hasta que duela y un poco más.'], neutral: ['Torin, herrero. Aquí se aprende Yin: golpe normal 2 de Esencia, cargado 6, dash 12 al aprenderlo y 4 al dominarlo (la práctica lo abarata). Pegar te devuelve Esencia.'], triste: ['Hoy el fuego está bajo… como yo. ¿Qué necesitas?'], enojado: ['No tengo tiempo para tonterías. Habla claro.'], asustado: ['¡Por las brasas! Avísame antes de aparecer.'] },
      opciones: [
        { t: 'Saludarlo con respeto', realidad: 70, energia: 5, resp: { pos: 'Respeto al oficio. Eso me gusta.', neg: 'Ajá.' }, et: 'saludo' },
        { t: 'Pedir consejo de estilo', realidad: 62, energia: 4, resp: { pos: 'Yin es el cuerpo: barato, cercano, siempre tuyo. Yang es energía blanca a distancia y cara: el Haz perfora 10 celdas en línea, pero te vacía rápido. Entrenar Yang mejora tu recuperación de Esencia. ¿Y defenderte? El ESCUDO se lo aprendes a Kaelen, no a mí: es su oficio. Y {mirar_bien} tu condición: la barrita verde bajo la Esencia. Gastar mucho te cansa, tu condición baja y la recarga se vuelve lenta.', neg: 'Yin cerca. Yang lejos y caro. El escudo, con Kaelen. Fin.' }, et: 'pregunta' },
        { t: 'Entrenar un momento con él', realidad: 68, energia: 20, resp: { pos: '¡Eso! Mantén presionado Yin hasta sentir el peso, suelta y golpea. Tu estilo Yin crece con cada golpe.', neg: 'Una vez. Y no me hagas perder el tiempo.' }, accion: 'entrenar', et: 'entrenar' },
        { t: 'Entrenar el Yang (meditación guiada)', realidad: 64, energia: 20, resp: { pos: 'Siéntate. Respira. La energía blanca no se agarra: se deja pasar. Cuesta Esencia y tiempo, pero cualquiera puede despertarla entrenando, tenga o no afinidad.', neg: 'Respira y concéntrate. Es todo.' }, accion: 'entrenarYang', et: 'entrenar' },
        { t: 'Reto de combate de Torin (puño y brasa)', realidad: 66, energia: 15, resp: { pos: 'Acepto el reto.', neg: 'Sin reto.' }, accion: 'reto', et: 'reto' },
        { t: 'Entrenar con Torin: serie de golpes Yin (guía)', realidad: 66, energia: 12, resp: { pos: 'Cinco golpes Yin que CONECTEN, donde sea. El cuerpo aprende pegando. Ya empezó: mira el contador.', neg: 'Pega.' }, accion: 'entrenoGuia', et: 'entrenar' },
        { t: '✦ Aprender el Fénix de Brasas (técnica especial de Guía)', realidad: 68, energia: 10, resp: { pos: 'El Fénix de Brasas no se forja en un día: te lo demuestro, y tú sigues la demostración hasta que vuele a tu velocidad. ¿Empezamos?', neg: 'El Fénix espera. Cuando quieras.' }, accion: 'aprenderEspecial', tecId: 'fenixBrasas', et: 'entrenar' },
        { t: 'Presumir de tu elemento', realidad: 48, energia: 12, resp: { pos: 'El elemento importa, pero sin cuerpo no hay quien lo sostenga.', neg: 'Tu elemento no golpea por ti. Muévete.' }, et: 'presumir' }
      ]
    },
    marisol: {
      saludo: { alegre: ['¡Bienvenido a la tienda! Monedas en la bolsa, pociones en la mano.'], sereno: ['Tienda de Bruma: pociones a medida, comida, polainas y el permiso de viajero. ¿Qué te llevas?'], neutral: ['Soy Marisol. Preparo pociones A MEDIDA: tú me dices las unidades y pagas 2 monedas por unidad (y tu karma aquí decide el descuento o el recargo). Pasa a la tienda por la puerta de al lado.'], triste: ['Hoy se vende poco… pero una poción a tiempo vale oro.'], enojado: ['Sin monedas no hay poción. Ve a ganarlas con misiones.'], asustado: ['¡Ay! Entra despacio, que me tiras los frascos.'] },
      opciones: [
        { t: 'Ir a su tienda (pociones A MEDIDA, comida, polainas y permiso)', realidad: 66, energia: 5, resp: { pos: 'Pasa a la tienda: ahí te preparo la poción con las unidades exactas que me pidas.', neg: 'A la tienda.' }, accion: 'irTienda', et: 'comprar' },
        { t: 'Preguntar cómo ganar monedas', realidad: 62, energia: 4, resp: { pos: 'Monedas de verdad: las MISIONES del tablón de Lía, por rango (D paga 15–25, S paga 135–165); la arena paga 50 solo si completas toda la ronda (entrar cuesta 10); y el torneo solo paga el podio (300, 150 y 80; entrar cuesta 50). Romper árboles y rocas ya no da monedas: eso era ilógico. Gastar es fácil: aquí, en mi tienda.', neg: 'Misiones por rango, arena completa y podio del torneo. Todo lo demás es gasto.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: 'Qué amable. Vuelve cuando quieras.', neg: '…hola.' }, et: 'saludo' }
      ]
    },
    breno: {
      saludo: { alegre: ['¡A talar! Los árboles del camino ya no aguantan ni tres golpes tuyos, ¿sabías?'], sereno: ['Leña, sombra y paciencia. Eso es un árbol.'], neutral: ['Breno, leñador. Si un árbol o una roca te cierra el paso, golpéalos: tienen su propia vida y al romperse dejan el paso libre y materiales que valen monedas.'], triste: ['Se me rompió el hacha…'], enojado: ['No me distraigas con el hacha en alto.'], asustado: ['¡Esa roca se movió! …no, eras tú.'] },
      opciones: [
        { t: 'Preguntar por árboles y rocas', realidad: 62, energia: 4, resp: { pos: 'Cada árbol aguanta unos 30 de daño, una roca unos 55: míralos agrietarse y su barra bajar. Sirven de cobertura — un enemigo detrás de una roca no te alcanza y tú a él tampoco — hasta que la rompes. Al caer sueltan monedas.', neg: 'Golpéalos hasta que se rompan. Fin.' }, et: 'pregunta' },
        { t: 'Saludarlo', realidad: 70, energia: 4, resp: { pos: 'Buen día para trabajar.', neg: 'Ajá.' }, et: 'saludo' },
        { t: '✦ Aprender el Coloso de Piedra (técnica especial de Guía)', realidad: 68, energia: 10, resp: { pos: 'El Coloso de Piedra se levanta del suelo: te lo demuestro, y tú lo sigues hasta que se levante a tu ritmo. ¿Empezamos?', neg: 'La piedra no se mueve. Cuando quieras.' }, accion: 'aprenderEspecial', tecId: 'colosoPiedra', et: 'entrenar' }
      ]
    },
    elena: {
      saludo: { alegre: ['¡La huerta crece y yo con ella!'], sereno: ['Las plantas no tienen prisa. Nosotros tampoco deberíamos.'], neutral: ['Elena, granjera. De noche nos metemos todos en casa: a las 21:00 la aldea se vacía, no nos busques por la plaza.'], triste: ['La cosecha viene floja…'], enojado: ['No pises lo sembrado.'], asustado: ['¡Los bandidos del bosque… de noche ni me asomo!'] },
      opciones: [
        { t: 'Preguntar por los horarios de la aldea', realidad: 62, energia: 4, resp: { pos: 'De día estamos fuera: plaza, tienda, huerta. Al caer la Noche (20:00) cada quien camina a SU casa y se mete dentro hasta el amanecer (04:00). El Guardián y Lía se quedan en la Oficina. Si nos necesitas, ven de día.', neg: 'De noche, en casa. De día, fuera.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: 'Pasa, pasa. ¿Un té?', neg: '…hola.' }, et: 'saludo' }
      ]
    },
    marco: {
      saludo: { alegre: ['¡Vengo del desierto! ¡Vi un espejismo que caminaba!'], sereno: ['Cada mapa guarda algo. El desierto, una reliquia que Lía busca.'], neutral: ['Marco, explorador. Crucé bosque, desierto y montaña: los caminos ahora son más largos y hay más mundo que antes.'], triste: ['Me perdí dos días en la sal…'], enojado: ['No toques mi mapa.'], asustado: ['¡El ilusionista me invirtió los pies!'] },
      opciones: [
        { t: 'Preguntar por el desierto', realidad: 62, energia: 4, resp: { pos: 'Al este, por el borde. Oasis al noreste, calor que ayuda al Fuego y una reliquia perdida que brilla si Lía te encarga buscarla. Los hechiceros de allí levantan su ESCUDO MÁGICO: quietos e intocables unos segundos; espera a que caiga. El TUYO es otra cosa: se lo aprendes a Kaelen y toma la naturaleza de tu elemento.', neg: 'Este. Oasis. Cuidado con los escudos.' }, et: 'pregunta' },
        { t: 'Saludarlo', realidad: 70, energia: 4, resp: { pos: '¡Buen camino!', neg: 'Ajá.' }, et: 'saludo' },
        { t: '✦ Aprender la Hoja del Huracán (técnica especial de Guía)', realidad: 68, energia: 10, resp: { pos: 'La Hoja del Huracán corta donde mira: te la demuestro, y tú la sigues hasta que corte a tu ritmo. ¿Empezamos?', neg: 'El huracán espera. Cuando quieras.' }, accion: 'aprenderEspecial', tecId: 'hojaHuracan', et: 'entrenar' },
        { t: '✦ Aprender la Danza de las Mil Hojas (técnica especial de Guía)', realidad: 68, energia: 10, resp: { pos: 'La Danza de las Mil Hojas es viento que baila: te la demuestro, y tú la sigues hasta que baile a tu ritmo. ¿Empezamos?', neg: 'Las hojas esperan. Cuando quieras.' }, accion: 'aprenderEspecial', tecId: 'danzaHojas', et: 'entrenar' }
      ]
    },
    pipo: {
      saludo: { alegre: ['¡Cuando sea grande gano el TORNEO! ¡Octavos, cuartos, semi y la FINAL!'], sereno: ['Estoy contando las casas: ¡ya hay muchas más que antes!'], neutral: ['Soy Pipo. De noche me meto en casa porque mi mamá dice que salen bandidos. ¿Tú no tienes miedo?'], triste: ['Me regañaron por jugar en la arena…'], enojado: ['¡No soy un niño chico! …bueno, sí.'], asustado: ['¡De noche no salgo NI LOCO!'] },
      opciones: [
        { t: 'Preguntar por el torneo', realidad: 62, energia: 6, resp: { pos: '¡Se pelea en la Arena! Entrar cuesta 50 monedas. Primero octavos, luego cuartos, la semi y la FINAL. Después de cada pelea te curan TODO. ¡Y solo cobra el podio: el campeón 300, el segundo 150 y el tercero 80!', neg: 'Arena. Entrada 50. Solo podio.' }, et: 'pregunta' },
        { t: 'Jugar a saltar con Pipo', realidad: 74, energia: 8, resp: { pos: '¡Regla del juego: tienes que {brincar_alto}, más que yo! ¡Y sin caerte! ¡Otra vez, otra vez: {brincar} conmigo hasta que nos cansemos!', neg: 'Tienes que {brincar_alto}. Es la regla. ¡Yo ya voy ganando!' }, et: 'jugar' },
        { t: 'Saludarlo', realidad: 72, energia: 5, resp: { pos: '¡Hola, héroe!', neg: '…hola.' }, et: 'saludo' }
      ]
    },
    aldric: {
      saludo: { alegre: ['Bruma prospera cuando su gente se mueve. Bienvenido a mi oficina.'], sereno: ['Soy Aldric, Guardián de Bruma. Otros pueblos tienen a su Hokage o a su dios en la torre; Bruma me tiene a mí, con papeles y todo.'], neutral: ['Guardián Aldric. Gobierno esta aldea, firmo los encargos y pago las misiones que cumple mi gente. Lía, mi secretaria, lleva el tablón: habla con ella.'], triste: ['Hay encargos sin cumplir y caminos cortados por rocas…'], enojado: ['La oficina se respeta.'], asustado: ['¿Bandidos DENTRO de la aldea? Lía, cierra la puerta.'] },
      opciones: [
        { t: 'Preguntar por la aldea y su gobierno', realidad: 64, energia: 5, resp: { pos: 'Bruma creció: más casas, tienda, esta oficina y caminos más largos a bosque, desierto y montaña. De noche la gente se recoge en sus casas; de día, la plaza vive. Mi trabajo: que nadie pase hambre ni miedo. El tuyo, si quieres: las misiones de Lía.', neg: 'Yo gobierno. Lía encarga. Tú decides.' }, et: 'pregunta' },
        { t: '🏆 Pedir el TORNEO DE BRUMA', realidad: 70, energia: 12, resp: { pos: 'Autorizado. Entrada: 50 monedas (el permiso no lo cubre). Ve a la Arena de Ecos: octavos, cuartos, semifinal y final, con recuperación total entre rondas. Solo cobra el podio: el campeón 300, el segundo 150 y el tercero 80.', neg: 'Autorizado.' }, accion: 'torneo', et: 'torneo' },
        { t: '✦ Aprender la Lanza del Amanecer (técnica especial de Guía)', realidad: 68, energia: 10, resp: { pos: 'La Lanza del Amanecer es luz con puntería: te la demuestro, y tú la sigues hasta que vuele a tu ritmo. ¿Empezamos?', neg: 'El amanecer espera. Cuando quieras.' }, accion: 'aprenderEspecial', tecId: 'lanzaAmanecer', et: 'entrenar' },
        { t: 'Saludarlo con respeto', realidad: 72, energia: 4, resp: { pos: 'El respeto abre puertas. Esta ya está abierta para ti.', neg: '…asiente en silencio.' }, et: 'saludo' }
      ]
    },
    lia: {
      saludo: { alegre: ['¡El tablón está lleno y tú tienes pinta de cumplir!'], sereno: ['Secretaría del Guardián. Yo registro, encargo y pago. Sin papel no hay misión.'], neutral: ['Soy Lía, secretaria de Aldric. Aquí se encargan las MISIONES de Bruma: entregas a otros lugares, proteger a un vecino, buscar una reliquia en el desierto, despejar caminos… Cada una paga monedas al entregarla conmigo.'], triste: ['Se acumulan los encargos y nadie viene…'], enojado: ['Sin entregar la anterior no hay misión nueva. Orden es orden.'], asustado: ['¡Ese encargo era URGENTE, no aterrador!'] },
      opciones: [
        { t: '📜 Ver el TABLÓN: las 5 misiones de hoy (por rango)', realidad: 66, energia: 6, resp: { pos: 'El tablón de hoy…', neg: 'El tablón.' }, accion: 'tablon', et: 'mision' },
        { t: '✅ Entregar misión completada (cobrar)', realidad: 66, energia: 6, resp: { pos: 'Revisando el tablón…', neg: 'Revisando…' }, accion: 'entregarMision', et: 'mision' },
        { t: 'Preguntar cómo funcionan las misiones', realidad: 62, energia: 4, resp: { pos: 'El tablón trae 5 misiones CADA DÍA, totalmente al azar: entregas, recoger encargos, escoltas (un vecino camina a su pueblo y tú lo proteges de los bandidos), objetos perdidos, caza, investigaciones, rescates y mensajes urgentes. Cada una trae su RANGO (D, C, B, A, S) y su elemento sugerido con la razón de la región. El pago es SOLO por el rango, nunca por el elemento: D 15–25, C 30–50, B 55–85, A 90–130, S 135–165. Y el rango se desbloquea con la maestría de TU elemento principal: C al 10%, B al 25%, A al 45%, S al 65%. Cualquiera puede intentar cualquier misión, pero si no es tu elemento te costará más Esencia. Las de hoy caducan esta noche.', neg: 'Tablón, rango, cumplir, volver, cobrar.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: 'Qué gusto. El tablón te espera.', neg: '…hola.' }, et: 'saludo' }
      ]
    },
    vera: {
      saludo: { alegre: ['Ah, una cara nueva que pregunta. Eso ya es raro por aquí.', 'Justo a tiempo: siempre necesito ojos nuevos.'], sereno: ['Soy Vera. Investigo lo que la Metrópolis prefiere no mirar.'], neutral: ['Vera, investigadora. No soy guardia ni trabajo para el Guardián: sigo casos por mi cuenta. Si vienes a hablar, habla claro: apunto todo.'], triste: ['Otro nombre en la libreta… perdón, dime.'], enojado: ['Sin rodeos. Mi tiempo vale casos.'], asustado: ['¡No aparezcas así! …perdón, los nervios del oficio.'] },
      opciones: [
        { t: '🕵 Investigar: los dominadores que desaparecen', realidad: 66, energia: 6, resp: { pos: '', neg: '' }, accion: 'orgVeraMano', et: 'pregunta' },
        { t: '🪤 Investigar: las jaulas del Lago Brisa Azul', realidad: 66, energia: 6, resp: { pos: '', neg: '' }, accion: 'orgVeraJade', et: 'pregunta' },
        { t: '✦ Investigar: las reliquias robadas (o devolver la que lleves)', realidad: 66, energia: 6, resp: { pos: '', neg: '' }, accion: 'orgVeraCole', et: 'pregunta' },
        { t: '💀 Investigar: los Coleccionistas y las técnicas prohibidas', realidad: 66, energia: 6, resp: { pos: '', neg: '' }, accion: 'orgVeraProh', et: 'pregunta' },
        { t: '🗺 Investigar: los escondites secretos de las organizaciones', realidad: 66, energia: 6, resp: { pos: '', neg: '' }, accion: 'orgVeraEscondites', et: 'pregunta' },
        { t: 'Saludarla con respeto', realidad: 70, energia: 4, resp: { pos: 'Respeto y preguntas claras: así me gusta la gente.', neg: '…asiente y sigue escribiendo.' }, et: 'saludo' }
      ]
    },
    bram: {
      saludo: { alegre: ['…hola. Perdón, ya no saludo como antes.', 'Pasa. Siéntate si quieres: de pie me canso, como todo.'], sereno: ['La tierra sigue ahí. Yo la miro desde fuera, como quien mira su casa por la ventana.'], neutral: ['Soy Bram. Fui dominador de Tierra, de los buenos de Bruma. Fui. Ahora cuento piedras y espero que nadie me pida una demostración.'], triste: ['Hoy amanecí más vacío que ayer, si eso es posible.'], enojado: ['No me pidas que te muestre mi elemento. No hay nada que mostrar.'], asustado: ['¡No me toques el hombro! …perdón. Perdón. Es reflejo.'] },
      opciones: [
        { t: 'Preguntarle qué le pasó a su elemento (con cuidado)', realidad: 64, energia: 6, resp: { pos: '', neg: '' }, accion: 'orgBram', et: 'pregunta' },
        { t: 'Saludarlo con calidez', realidad: 72, energia: 4, resp: { pos: 'Gracias. De verdad. Los que todavía pueden no suelen pararse a hablar con un vacío.', neg: '…hola.' }, et: 'saludo' }
      ]
    },
    dario: {
      saludo: { alegre: ['Un viajero con dominio. Mi día mejora.', 'Qué agradable: alguien que vale la pena mirar dos veces.'], sereno: ['El viento trae a cada quien a su sitio. Tú acabas de llegar al tuyo.'], neutral: ['Dario, viajero. No vendo nada, no compro nada: observo. Tu dominio, por ejemplo. Se nota desde lejos, ¿sabías?'], triste: ['Hoy el viento trae poco. Hasta tú pareces poco, viajero.'], enojado: ['Preguntas cortas. Las largas me aburren.'], asustado: ['Interesante reflejo el tuyo. Casi te tomo por una amenaza.'] },
      opciones: [
        { t: 'Preguntar por el guante negro de su mano', realidad: 60, energia: 6, resp: { pos: '', neg: '' }, accion: 'orgDarioGuante', et: 'pregunta' },
        { t: '🖤 «Sé lo que buscan. Quiero entrar.» (unirte)', realidad: 58, energia: 8, resp: { pos: '', neg: '' }, accion: 'orgDarioUnirse', et: 'pregunta' },
        { t: '⚔ «No vas a vaciar a nadie más.» (pelear con él)', realidad: 40, energia: 20, resp: { pos: '', neg: '' }, accion: 'orgDarioPelear', et: 'reto' },
        { t: 'Dejar a los del guante (abandonar la organización)', realidad: 55, energia: 6, resp: { pos: '', neg: '' }, accion: 'orgSalir', et: 'pregunta' },
        { t: 'Saludarlo con cautela', realidad: 62, energia: 4, resp: { pos: 'Cautela. Bien: la cautela alarga la vida… y el dominio.', neg: '…sonríe apenas.' }, et: 'saludo' }
      ]
    },
    sana: {
      saludo: { alegre: ['Buen día de lago. Las criaturas salen y yo trabajo.', 'Pasa, pero no pises las redes.'], sereno: ['El lago paga a quien sabe esperar. Yo sé esperar.'], neutral: ['Sana, cazadora. Capturo criaturas raras, vivas, por encargo. Si vienes a mirar, mira. Si vienes a estorbar, dilo ya.'], triste: ['Se me escapó una buena hoy. No estoy de humor.'], enojado: ['Lejos de mis trampas. Lejos.'], asustado: ['¡Quieto! …ah, eres tú. Casi te pongo una red encima.'] },
      opciones: [
        { t: 'Preguntar por las jaulas y las trampas del lago', realidad: 60, energia: 6, resp: { pos: '', neg: '' }, accion: 'orgSanaJaulas', et: 'pregunta' },
        { t: '🪤 «Yo también cazo. Quiero entrar en la Red.» (unirte)', realidad: 58, energia: 8, resp: { pos: '', neg: '' }, accion: 'orgSanaUnirse', et: 'pregunta' },
        { t: '⚔ «Suelta a las criaturas.» (pelear con ella)', realidad: 40, energia: 20, resp: { pos: '', neg: '' }, accion: 'orgSanaPelear', et: 'reto' },
        { t: 'Dejar la Red (abandonar la organización)', realidad: 55, energia: 6, resp: { pos: '', neg: '' }, accion: 'orgSalir', et: 'pregunta' },
        { t: 'Saludarla', realidad: 66, energia: 4, resp: { pos: 'Buen día. Y buen lago, si no estorbas.', neg: 'Ajá.' }, et: 'saludo' }
      ]
    },
    milo: {
      saludo: { alegre: ['¡Viajero! ¿Traes encargo? ¿Traes chisme? ¡Ambos pagan!', '¡Justo pasaba! ¿O yo pasaba? ¡Da igual, hablemos!'], sereno: ['Milo, corredor: paquetes, mensajes y cosas que no se preguntan, de pueblo en pueblo.'], neutral: ['Soy Milo. Llevo encargos por todo el continente y oigo de todo por el camino. Si buscas a alguien que sepa quién compra qué… puede que sepas demasiado ya.'], triste: ['Hoy perdí un paquete y media mañana. No me hables de rutas.'], enojado: ['¡Sin empujar! ¡El corredor se cae y el encargo se rompe!'], asustado: ['¡No me sigas así! …ah, eres tú. El susto me dura todavía.'] },
      opciones: [
        { t: 'Preguntar quién compra cosas «sin hacer preguntas»', realidad: 60, energia: 5, resp: { pos: '', neg: '' }, accion: 'orgMiloCompra', et: 'pregunta' },
        { t: '💀 Preguntar por pergaminos y técnicas prohibidas (bajito)', realidad: 60, energia: 5, resp: { pos: '', neg: '' }, accion: 'orgMiloProh', et: 'pregunta' },
        { t: 'Saludarlo', realidad: 70, energia: 4, resp: { pos: '¡Buen día! ¡Y buena ruta, que es lo mismo!', neg: '…ya voy tarde. ¡Hola y adiós!' }, et: 'saludo' }
      ]
    },
    petra: {
      saludo: { alegre: ['Una visita con buen ojo, espero. Pasa, mira las vitrinas.', 'Arcana recibe a quien sabe mirar despacio.'], sereno: ['Petra, anticuaria. Lo antiguo entra por mi puerta y sale… catalogado.'], neutral: ['Soy Petra. Compro y vendo reliquias en Arcana, sin hacer preguntas: es mi cartel y mi costumbre. ¿Traes algo que valga, o solo vienes a mirar?'], triste: ['Hoy llegó una pieza falsa y me amargó el té. Dime que traes algo auténtico.'], enojado: ['En mi tienda no se grita ni se regatea a voces.'], asustado: ['¡Cuidado con las vitrinas! …perdón, el susto.'] },
      opciones: [
        { t: '✦ Venderle la reliquia que llevas (150 🪙, sin preguntas)', realidad: 62, energia: 5, resp: { pos: '', neg: '' }, accion: 'orgPetraVender', et: 'comprar' },
        { t: '🎭 Comprarle una pieza rara: máscara o artefacto (250 🪙, sin preguntas)', realidad: 62, energia: 5, resp: { pos: '', neg: '' }, accion: 'orgPetraComprar', et: 'comprar' },
        { t: '💀 Venderle un PERGAMINO PROHIBIDO (220 🪙, sin preguntas) / preguntar por ellos', realidad: 62, energia: 5, resp: { pos: '', neg: '' }, accion: 'orgPetraProh', et: 'comprar' },
        { t: '💰 «Quiero trabajar para tu comprador.» (unirte)', realidad: 58, energia: 8, resp: { pos: '', neg: '' }, accion: 'orgPetraUnirse', et: 'pregunta' },
        { t: 'Dejar de trabajar para ellos (abandonar)', realidad: 55, energia: 6, resp: { pos: '', neg: '' }, accion: 'orgSalir', et: 'pregunta' },
        { t: 'Saludarla con elegancia', realidad: 70, energia: 4, resp: { pos: 'Modales. Qué raro y qué agradable.', neg: '…asiente con la cabeza.' }, et: 'saludo' }
      ]
    },
    // --- Vecinos nuevos (H): guion propio, con su voz según personas.js ---
    ines: {
      saludo: { alegre: ['¡Pasa, pasa! El pan acaba de salir: todavía canta.', 'Buen día. Huele a pan, ¿verdad? Es que acaba de salir del horno.'], sereno: ['La masa ya está en el horno. Mientras sube, dime: ¿qué necesitas?'], neutral: ['Soy Inés, la panadera de Bruma. Me levanto antes que el sol para que la aldea despierte con pan caliente.'], triste: ['Hoy la masa salió floja… el calor la agria. Pero pan hay, no te preocupes.'] },
      opciones: [
        { t: 'Preguntar por su pan', realidad: 64, energia: 4, resp: { pos: 'Mi pan es de harina buena y horno de leña: cruje por fuera y es suave por dentro. El secreto es levantarse temprano y no tenerle miedo al fuego. ¿Quieres probar uno? Hoy salió redondo.', neg: 'Pan de horno de leña. Eso es todo el secreto.' }, et: 'pregunta' },
        { t: 'Preguntar por la mañana en Bruma', realidad: 62, energia: 4, resp: { pos: 'A las cuatro ya estoy en el horno. El olor del pan despierta a media aldea antes que el sol: esa es mi forma de decir buenos días. Un día sin pan recién hecho es un día a medias, te lo digo yo.', neg: 'Madrugo. Huele a pan. Eso es la mañana.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: 'Qué amable. Ven mañana temprano: te guardo un pan caliente.', neg: '…hola, mi cielo.' }, et: 'saludo' }
      ]
    },
    ramiro: {
      saludo: { alegre: ['Buen día. La madera está seca y la sierra, afilada. Día de trabajar.'], sereno: ['El taller está en silencio. Así me gusta: la madera no admite errores y yo tampoco.'], neutral: ['Ramiro, carpintero. Hago puertas, mesas y las vigas de media aldea. Habla poco y directo: ¿qué necesitas?'], triste: ['La humedad me torció una tabla buena… hoy no es día de encargar nada fino.'] },
      opciones: [
        { t: 'Preguntar por su oficio', realidad: 64, energia: 4, resp: { pos: 'Una puerta que cierra justo, una mesa que no cojea: eso es carpintería. La madera buena y seca no perdona las prisas, y yo no perdono la madera mala. Si me encargas algo, te lo hago para que dure.', neg: 'Madera buena, medidas exactas, sin prisas. Fin.' }, et: 'pregunta' },
        { t: 'Pedirle un consejo de trabajo', realidad: 62, energia: 4, resp: { pos: 'El consejo es uno: mide dos veces, corta una. Lo demás es fuerza y paciencia. Y si algo sale mal, no lo escondas: la madera se nota cuando mientes.', neg: 'Mide dos veces. Corta una.' }, et: 'pregunta' },
        { t: 'Saludarlo con respeto', realidad: 70, energia: 4, resp: { pos: 'Respeto. Eso me gusta.', neg: 'Ajá.' }, et: 'saludo' }
      ]
    },
    carmen: {
      saludo: { alegre: ['¡Qué día tan bueno para tejer! La lluvia mansa ya pasó y los hilos están contentos.', 'Pasa, pasa. El telar canta y la manta sale sola.'], sereno: ['Cada hilo tiene su humor y yo solo lo acompaño. Siéntate, si quieres ver.'], neutral: ['Soy Carmen, tejedora de Bruma. Tejo mantas, redes y las bufandas de media aldea.'], triste: ['Se me deshizo un nudo que llevaba horas… no pasa nada: todo tejido se puede volver a empezar.'] },
      opciones: [
        { t: 'Preguntar por sus tejidos', realidad: 64, energia: 4, resp: { pos: 'Mis mantas pesan lo justo y abrigan lo que deben: lana buena, nudos firmes y paciencia. Una bufanda mía dura inviernos enteros. El truco no es la prisa: es acompañar al hilo, no pelear con él.', neg: 'Lana buena y paciencia. Eso es tejer.' }, et: 'pregunta' },
        { t: 'Preguntar por la lluvia mansa', realidad: 62, energia: 4, resp: { pos: 'La lluvia mansa es el mejor clima para tejer: todo suena a agua y a hilo, y nadie te apura. Con tormenta guardo el telar; con calor, los hilos se pegan a los dedos. Pero la lluvia mansa… esa es mi aliada.', neg: 'Lluvia mansa: el mejor clima para el telar.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: 'Qué amable. Siéntate un rato: el telar no muerde.', neg: '…hola, mi cielo.' }, et: 'saludo' }
      ]
    },
    felipe: {
      saludo: { alegre: ['¡Hoy la huerta está el doble de verde! ¡La lluvia la pedía a gritos!', '¡Buen día! ¿Viste cómo crece lo sembrado? ¡Yo lo sembré!'], sereno: ['La tierra mojada al amanecer… eso no tiene precio. Bueno, sí: trabajo.'], neutral: ['Soy Felipe, granjero de Bruma. Trabajo la huerta del sur con Elena y quiero una parcela propia.'], triste: ['La tormenta me tumba lo sembrado… una noche así y todo se va al suelo.'] },
      opciones: [
        { t: 'Preguntar por la huerta', realidad: 64, energia: 4, resp: { pos: 'La huerta es paciencia: riegas temprano, siembras con cuidado y esperas. Ver crecer lo sembrado es lo mejor del oficio. Eso sí: el calor de mediodía tumba a cualquiera, así que a regar antes de que salga el sol fuerte.', neg: 'Se siembra, se riega y se espera. Así crece todo.' }, et: 'pregunta' },
        { t: 'Preguntar por Elena', realidad: 62, energia: 4, resp: { pos: 'Elena me enseña todo: cuándo regar, cuándo sembrar, cuándo dejar quieta la tierra. Yo tengo más fuerza que experiencia, y lo sé. Pero aprendo rápido, ¿eh? Algún día tendré mi propia parcela.', neg: 'Elena es la que sabe. Yo aprendo.' }, et: 'pregunta' },
        { t: 'Saludarlo', realidad: 70, energia: 4, resp: { pos: '¡Buen día! ¿Me ayudas a regar? Es broma… o no.', neg: '¡Hola!' }, et: 'saludo' }
      ]
    },
    lucia: {
      saludo: { alegre: ['¡Lluvia! ¡Las hierbas se despiertan y el cesto se llena solo!', 'Buen día. Huele a romero, ¿verdad? Lo acabo de recoger.'], sereno: ['Cada planta se conoce por su olor y cada olor, por su uso. Pregunta sin miedo.'], neutral: ['Soy Lucía, herbolaria de Bruma. Recojo hierbas en la Ribera y preparo remedios con Sora.'], triste: ['El calor me marchitó lo recogido… habrá que salir más temprano mañana.'] },
      opciones: [
        { t: 'Preguntar por sus remedios', realidad: 64, energia: 4, resp: { pos: 'Un remedio bueno no hace ruido: cura sin que lo notes. El romero al amanecer, la manzanilla para el susto, y siempre, siempre, preguntar antes de arrancar una planta. La tierra da, pero hay que pedir permiso.', neg: 'Hierbas, paciencia y no arrancar sin pedir.' }, et: 'pregunta' },
        { t: 'Preguntar por la Ribera', realidad: 62, energia: 4, resp: { pos: 'La Ribera es mi despensa: junto al río crecen las mejores hierbas, mojadas y contentas. Eso sí: no cruces el puente sin mirar el agua, y no pises lo sembrado. Y si ves a Sora, dile que el romero ya está seco.', neg: 'Junto al río, las mejores hierbas.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: 'Qué amable. ¿Un té de hierbas? Lo preparo en un momento.', neg: '…hola.' }, et: 'saludo' }
      ]
    },
    tomas: {
      saludo: { alegre: ['¡TÚ! ¿Viste entrenar a Kaelen? ¡Yo lo vi TODO! ¡Cuando sea guardia peleo como él!', '¡Día de correr hasta la arena y volver! ¿Vienes? ¿Vienes?'], sereno: ['Kaelen dice que la guardia se practica igual con lluvia que con sol. Yo le creo.'], neutral: ['¡Soy Tomás! Aprendiz de guardia de Bruma. Sigo a Kaelen a todas partes y practico con un palo. ¿Quieres ver cómo entreno?'], triste: ['La tormenta me mete en casa… y los truenos son el cielo entrenando, ¿verdad? …¿verdad?'] },
      opciones: [
        { t: 'Preguntar por Kaelen', realidad: 64, energia: 4, resp: { pos: '¡Kaelen es el mejor guardia de Bruma! Me enseña a vigilar, a correr y a no tenerle miedo a nada. Bueno… casi a nada. Me dijo «bien hecho» una vez, ¿sabías? ¡UNA VEZ! Yo quiero ser guardia de verdad antes de cumplir años.', neg: '¡Kaelen es el mejor! ¡Y yo voy a ser como él!' }, et: 'pregunta' },
        { t: 'Verlo entrenar', realidad: 66, energia: 6, resp: { pos: '¡MIRA! ¡Un palo, dos pasos, giro! …¿viste? ¿Viste cómo lo hice? ¡Otra vez! ¡Otra vez!', neg: '¡Mira! …bueno, más o menos. ¡La próxima sí sale!' }, et: 'entrenar' },
        { t: 'Saludarlo', realidad: 72, energia: 5, resp: { pos: '¡Hola, héroe! ¿Vamos a correr?', neg: '¡Hola!' }, et: 'saludo' }
      ]
    },
    elvira: {
      saludo: { alegre: ['Día claro: a tender hierbas al sol. Pasa, pero no toques los frascos.'], sereno: ['Mi tienda huele a romero y a menta desde la calle. Eso es buena señal.'], neutral: ['Soy Elvira, herbolaria de la Metrópolis. Preparo remedios para media ciudad. El precio es el precio: no regateo.'], triste: ['Hoy llegó un cliente que quería el remedio a medias. Los remedios a medias no curan: se lo dije y se fue.'] },
      opciones: [
        { t: 'Preguntar por sus remedios', realidad: 64, energia: 4, resp: { pos: 'Un remedio bien hecho se nota en el olor: hierbas secas, medida exacta y paciencia. Yo no vendo promesas: vendo lo que funciona. Si sabes lo que buscas, te lo preparo. Si no sabes, te pregunto y lo averiguamos.', neg: 'El precio es el precio. El remedio, el remedio.' }, et: 'pregunta' },
        { t: 'Preguntar por la ciudad', realidad: 62, energia: 4, resp: { pos: 'La Metrópolis es grande y ruidosa, pero las hierbas son las mismas que en Bruma: solo cambia el precio. Aquí viene gente de todas las aldeas, y todos acaban buscando lo mismo: algo que los cure sin hacerles preguntas.', neg: 'Ciudad grande, hierbas iguales.' }, et: 'pregunta' },
        { t: 'Saludarla con respeto', realidad: 70, energia: 4, resp: { pos: 'Respeto. Bien. ¿Qué buscas?', neg: 'Ajá.' }, et: 'saludo' }
      ]
    },
    rodrigo: {
      saludo: { alegre: ['¡Día perfecto! ¿Calor? Mi fragua trabaja sola con este sol. ¡A forjar!', '¡Ese es el espíritu! ¿Vienes por acero o solo a mirar cómo se hace?'], sereno: ['El acero al rojo cereza no espera a nadie. Habla mientras trabajo, si puedes seguirme.'], neutral: ['Rodrigo, herrero de la Metrópolis. Forjo para guardias, torneo y quien pague bien. Mi acero es el mejor del continente, y si lo dudas, pregúntale a mi martillo.'], triste: ['La lluvia me enfría la fragua… en la ciudad eso es casi un insulto.'] },
      opciones: [
        { t: 'Preguntar por su acero', realidad: 64, energia: 4, resp: { pos: 'Mi acero se forja con calor constante y sin atajos: al rojo cereza, martillo pesado, temple con paciencia. El acero barato de fuera se dobla con mirarlo; el mío aguanta torneos. Los encargos difíciles son mis favoritos: si es fácil, no vale la pena.', neg: 'Acero bueno, martillo pesado, sin regateos.' }, et: 'pregunta' },
        { t: 'Pedirle un encargo', realidad: 62, energia: 6, resp: { pos: '¿Un encargo? Dime qué necesitas y cuánto pagas. Lo difícil lo hago hoy; lo imposible, mañana. Pero que no me regateen el oficio: el martillo no perdona y yo tampoco.', neg: 'Encargo sí. Regateo no.' }, et: 'pregunta' },
        { t: 'Saludarlo con respeto', realidad: 70, energia: 4, resp: { pos: 'Respeto al oficio. Eso me gusta.', neg: 'Ajá.' }, et: 'saludo' }
      ]
    },
    camila: {
      saludo: { alegre: ['¡Día claro! ¡A tender telas al sol! ¡Mira qué colores!', '¡Qué bueno verte! Traigo telas nuevas y la aguja ya está impaciente.'], sereno: ['Un buen traje se nota antes de hablar. Siéntate: te tomo medidas mientras charlamos.'], neutral: ['Soy Camila, sastre de la Metrópolis. Coso trajes de torneo, capas de viaje y los uniformes de la guardia.'], triste: ['Me pidieron un traje para ayer… ¡para AYER! La aguja no corre tanto, por mucho que yo quiera.'] },
      opciones: [
        { t: 'Preguntar por sus trajes', realidad: 64, energia: 4, resp: { pos: 'Un traje de torneo tiene que aguantar golpes y verse bien al mismo tiempo: tela fuerte, costura firme y un color que se vea desde la grada. Las capas de viaje son otra cosa: ligeras, que no estorben al correr. Dime para qué lo quieres y te digo qué tela lleva.', neg: 'Tela buena, medidas exactas y sin prisas.' }, et: 'pregunta' },
        { t: 'Preguntar por la guardia', realidad: 62, energia: 4, resp: { pos: 'Los uniformes de la guardia los coso yo: mismos colores, mismo corte, para que se reconozcan de lejos. Un guardia mal vestido es un guardia que nadie respeta, y eso no lo permito. Ni el viento me mueve los patrones: los sujeto con alfileres, como todo.', neg: 'Uniformes iguales, bien cosidos. Orden.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: '¡Qué amable! Pasa: te enseño las telas nuevas.', neg: '…hola, mi cielo.' }, et: 'saludo' }
      ]
    },
    andres: {
      saludo: { alegre: ['¡Día de mercado grande! ¡Hoy horneo para media ciudad!', '¡Sol y mercado! ¡El pan vuela de las bandejas! ¡Pasa, pasa!'], sereno: ['El pan recién hecho y las mañanas de horno… no hay mejor forma de empezar el día.'], neutral: ['Soy Andrés, panadero de la Metrópolis. Horneo desde antes del amanecer. El pan del día anterior lo regalo a quien no puede pagarlo, sin decirlo.'], triste: ['Hoy me devolvieron un pan… un pan mío, devuelto. Eso duele más que el calor del horno.'] },
      opciones: [
        { t: 'Preguntar por su pan', realidad: 64, energia: 4, resp: { pos: 'Mi pan es de horno de leña y madrugada: se vende antes de que salga el sol, cuando la ciudad todavía huele a noche. El calor de la ciudad lo agria si no tienes cuidado, así que horneo el doble de temprano. Y el que sobra, se regala: un panadero no deja a nadie sin comer.', neg: 'Pan de madrugada, horno de leña. Eso es todo.' }, et: 'pregunta' },
        { t: 'Preguntar por el mercado', realidad: 62, energia: 4, resp: { pos: 'El mercado de la Metrópolis es el corazón de la ciudad: aquí se cruzan peleadores, comerciantes y viajeros de todas las aldeas. Con lluvia la plaza se vacía y mi tienda se llena de olor a pan; con sol, el pan vuela. Nublado o no, se hornea igual.', neg: 'El mercado es la ciudad entera, en una plaza.' }, et: 'pregunta' },
        { t: 'Saludarlo con calidez', realidad: 72, energia: 4, resp: { pos: '¡Qué amable! Toma, un pan caliente. Es de la casa.', neg: '…hola, mi cielo.' }, et: 'saludo' }
      ]
    },
    valeria: {
      saludo: { alegre: ['Día claro: clase completa, sin excusas. Siéntate y abre el cuaderno.'], sereno: ['La teoría también se entrena. Pregunta bien y te respondo bien.'], neutral: ['Soy Valeria, maestra de la academia de la Metrópolis. Enseño teoría de los elementos a los aspirantes. Exijo puntualidad, cuadernos limpios y preguntas buenas.'], triste: ['Hoy la clase se durmió con el calor… preguntas cortas y agua cerca, o no aprende nadie.'] },
      opciones: [
        { t: 'Preguntar por los elementos', realidad: 64, energia: 4, resp: { pos: 'Los elementos no son trucos: son teoría. Fuego, Agua, Tierra, Viento y Rayo, cada uno con su carácter y su costo. El que no estudia, gasta Esencia a lo loco y luego pregunta por qué se cansa. Tú: estudia primero, pelea después. Esa es la lección de hoy.', neg: 'Estudia la teoría. Luego pelea.' }, et: 'pregunta' },
        { t: 'Preguntar por sus alumnos', realidad: 62, energia: 4, resp: { pos: 'Mis alumnos llegan tarde con niebla y con excusas. Las anoto todas. Pero los que leen, los que preguntan exacto… esos llegan lejos. La academia no es para el que más pega: es para el que más entiende. ¿Tú lees, o solo peleas?', neg: 'Alumnos que leen: esos llegan lejos.' }, et: 'pregunta' },
        { t: 'Saludarla con respeto', realidad: 70, energia: 4, resp: { pos: 'Puntualidad y respeto. Así se empieza una clase.', neg: 'Ajá. Siéntate.' }, et: 'saludo' }
      ]
    },
    jorge: {
      saludo: { alegre: ['Día despejado y en orden. Así prospera la ciudad.'], sereno: ['La puerta oeste no se cierra: se vigila. Yo vigilo.'], neutral: ['Soy Jorge, guardia de la puerta oeste de la Metrópolis. Vigilo quién entra y quién sale. Conozco a los viajeros por la cara y a los problemas por el paso.'], triste: ['Hoy entró gente sin saludar… el desorden a la hora punta no se perdona, pero se registra.'] },
      opciones: [
        { t: 'Preguntar por la puerta oeste', realidad: 64, energia: 4, resp: { pos: 'Por esta puerta pasa todo: viajeros de Arcana, comerciantes de Bruma, peleadores de torneo. Mi trabajo es simple: que entre quien debe entrar y que no entre el desorden. Los que entran sin saludar los anoto. Los que saludan, pasan sin problemas.', neg: 'Se vigila quién entra. Orden, siempre.' }, et: 'pregunta' },
        { t: 'Preguntar por Arcana', realidad: 62, energia: 4, resp: { pos: 'Al oeste: Pueblo Salina y, más lejos, Arcana, la ciudad de los magos. El camino es largo y recto. Si vas, ve con orden: los magos no perdonan el desorden, y yo no perdono que vuelvas sin avisar.', neg: 'Al oeste, Arcana. Camino largo.' }, et: 'pregunta' },
        { t: 'Saludarlo con respeto', realidad: 70, energia: 4, resp: { pos: 'Orden y respeto. Pasa.', neg: 'Ajá.' }, et: 'saludo' }
      ]
    },
    sofia: {
      saludo: { alegre: ['¡Día claro! ¡Plaza llena y voz clara! ¡A cantar!', '¡El viento lleva mi voz hasta las calles! ¡Hoy canto para toda la ciudad!'], sereno: ['Las canciones cuentan las historias de las aldeas. Yo solo les pongo voz.'], neutral: ['Soy Sofía, trovadora de la Metrópolis. Canto en la plaza por monedas y por gusto.'], triste: ['La tormenta vació la plaza… ni los trovadores salimos con truenos. La plaza espera, y yo también.'] },
      opciones: [
        { t: 'Pedirle una canción', realidad: 66, energia: 6, resp: { pos: '¡Claro! Esta es de un viajero que cruzó el desierto sin agua y volvió contándolo: «caminó la sal, bebió del viento… y al final, el oasis lo encontró a él». ¿Te gustó? La exagero solo un poco.', neg: 'Una corta, entonces: «el viento canta, la plaza escucha».' }, et: 'pregunta' },
        { t: 'Preguntar por las aldeas', realidad: 62, energia: 4, resp: { pos: 'He cantado en todas: Bruma huele a pan, Vuelo Alto a viento, Chispa Alta a tormenta y el Puerto, a caldo. Cada aldea tiene su canción, y yo me las sé todas… o casi todas. Las que no me sé, las invento. Solo un poco.', neg: 'Cada aldea tiene su canción.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: '¡Qué amable! Esta canción va por ti.', neg: '…hola.' }, et: 'saludo' }
      ]
    },
    diego: {
      saludo: { alegre: ['¡Día despejado, día de ventas! ¡Pasa, pasa, mira sin compromiso… y con compromiso también!', '¡Cielo claro y bolsa llena! ¡Hoy se vende bien!'], sereno: ['Las especias son historia que se huele: cada una viene de lejos y cuenta de dónde.'], neutral: ['Soy Diego, comerciante de especias de la Metrópolis. Vendo pimienta, comino y cosas que huelen a otros continentes.'], triste: ['Lloviendo no vende nadie… bueno, casi nadie. El olor a especias mojadas me encanta, eso sí.'] },
      opciones: [
        { t: 'Preguntar por sus especias', realidad: 64, energia: 4, resp: { pos: 'Tengo pimienta que pica como un puño, comino que huele a desierto y mezclas que no te digo de dónde vienen: secreto de comerciante. Todo trato se hace con sonrisa, y todo trato bueno se repite. ¿Qué buscas? ¿Algo que pique, algo que perfume, o algo raro?', neg: 'Pimienta, comino y cosas raras. A precio amigo.' }, et: 'pregunta' },
        { t: 'Preguntar por el mercado', realidad: 62, energia: 4, resp: { pos: 'El mercado es chisme sano y monedas que suenan: aquí se sabe quién llegó, quién se fue y quién busca qué. Con niebla los clientes llegan de sorpresa, y eso me encanta… si compran. Con tormenta, a cerrar el puesto y a contar monedas adentro.', neg: 'El mercado lo sabe todo. Y vende de todo.' }, et: 'pregunta' },
        { t: 'Saludarlo', realidad: 70, energia: 4, resp: { pos: '¡Buen día! ¡Y buena compra, que es lo mismo!', neg: '…pasa, pasa.' }, et: 'saludo' }
      ]
    },
    paola: {
      saludo: { alegre: ['Día claro: a destilar al sol. Pasa, pero no toques los frascos.'], sereno: ['Las mezclas exactas no admiten prisas. Pregunta con calma y te respondo con calma.'], neutral: ['Soy Paola, alquimista de la Metrópolis. Mezclo hierbas y minerales en mi taller junto a la plaza. Mis pociones son caras porque funcionan, y lo digo sin sonreír.'], triste: ['Una mezcla se me evaporó con el calor… a trabajar más temprano mañana.'] },
      opciones: [
        { t: 'Preguntar por sus mezclas', realidad: 64, energia: 4, resp: { pos: 'La alquimia es medida: un gramo de más y la mezcla se arruina; un gramo de menos y no sirve. El calor evapora, el polvo arruina, la humedad engaña: por eso mido dos veces. Mis pociones cuestan porque funcionan. Las baratas… bueno, las baratas son baratas por algo.', neg: 'Medida exacta. Sin atajos.' }, et: 'pregunta' },
        { t: 'Preguntar por las hierbas', realidad: 62, energia: 4, resp: { pos: 'Las hierbas las traen de Bruma y de Raíz de Piedra: romero, menta, raíces secas. Las seco yo misma, a la sombra, para que no pierdan el olor. El viento del mercado me trae olores nuevos: algunos sirven, otros no. El olfato no miente.', neg: 'Hierbas de Bruma y de Raíz. Secas a la sombra.' }, et: 'pregunta' },
        { t: 'Saludarla con respeto', realidad: 70, energia: 4, resp: { pos: 'Respeto y preguntas exactas. Bien.', neg: 'Ajá.' }, et: 'saludo' }
      ]
    },
    ariel: {
      saludo: { alegre: ['¡Día claro! ¡Se ven las montañas enteras desde aquí! ¡La cometa llega más alto que ayer!', '¡Este viento es mi clima! ¡La cometa lo sabe antes que yo!'], sereno: ['El viento me cuenta las noticias antes que a nadie. Hoy trae… viajeros. Y calma.'], neutral: ['Soy Ariel, vigía de Vuelo Alto. Vuelo cometas desde la meseta y aviso cuando viene tormenta o viajeros.'], triste: ['Hoy no hay viento… los días sin viento son días sin noticias. La cometa duerme.'] },
      opciones: [
        { t: 'Preguntar por el viento', realidad: 64, energia: 4, resp: { pos: 'El viento de la meseta no es uno: es muchos. El de la mañana levanta la cometa; el de la tarde la empuja lejos; el de tormenta… ese avisa antes, si sabes escuchar. Yo escucho. Por eso soy vigía: el viento me habla y yo traduzco.', neg: 'El viento avisa antes. Yo escucho.' }, et: 'pregunta' },
        { t: 'Preguntar por las cometas', realidad: 62, energia: 4, resp: { pos: 'Mi cometa es de tela ligera y varillas firmes: sube con el viento caliente y baja solo si yo quiero. Con niebla vuelo de memoria, como los viejos: desaparece y solo queda el hilo. ¿Quieres verla volar? Hoy el viento está de buen humor.', neg: 'Tela ligera, viento bueno. Así vuela.' }, et: 'pregunta' },
        { t: 'Saludarlo', realidad: 70, energia: 4, resp: { pos: 'Buen viento te traiga. Y buen camino.', neg: '…hola.' }, et: 'saludo' }
      ]
    },
    nora: {
      saludo: { alegre: ['¡Día claro! ¡Se ve la Metrópolis desde el telar! ¡Bonito!', '¡El viento de la meseta seca la lana mejor que el sol! ¡Mi mejor ayudante!'], sereno: ['Tejo despacio, como pide la lana. Siéntate si quieres mirar.'], neutral: ['Soy Nora, tejedora de Vuelo Alto. Tejo con lana de la meseta y vendo mantas que pesan poco y abrigan mucho.'], triste: ['El calor me resecó las manos… a tejer bajo techo, con agua cerca.'] },
      opciones: [
        { t: 'Preguntar por sus mantas', realidad: 64, energia: 4, resp: { pos: 'Mis mantas son de lana de la meseta: ligeras como el viento y calientes como un abrazo. El viento me enseña los nudos: los que aguantan son los que se hacen despacio, sin prisa. Una manta mía dura inviernos enteros, y pesa menos que un pan.', neg: 'Lana de meseta, nudos lentos. Así salen.' }, et: 'pregunta' },
        { t: 'Preguntar por Vuelo Alto', realidad: 62, energia: 4, resp: { pos: 'Vuelo Alto es viento, altura y silencio: desde aquí se ve todo el continente en un día claro. Con niebla, la meseta se vuelve lana sin tejer: todo suave y borroso. Aquí arriba el sol pega más fuerte, así que a tejer bajo techo.', neg: 'Viento, altura y silencio. Así es Vuelo Alto.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: 'Qué amable. Siéntate: el telar canta bajito.', neg: '…hola.' }, et: 'saludo' }
      ]
    },
    ivan: {
      saludo: { alegre: ['¡TORMENTA! ¡El cielo forja rayos y yo forjo acero! ¡Mi clima!', '¡Buen día! ¡El acero no espera! ¿Vienes por herramientas o a mirar?'], sereno: ['La fragua está caliente y el martillo, listo. Habla claro: ¿qué necesitas?'], neutral: ['Iván, herrero de Chispa Alta. Forjo con el calor de los rayos que caen en la meseta. Mi acero huele a tormenta, y no admito que otro herrero sea mejor.'], triste: ['La lluvia mansa me enfría la fragua… en Chispa Alta eso es casi un insulto.'] },
      opciones: [
        { t: 'Preguntar por su acero', realidad: 64, energia: 4, resp: { pos: 'Mi acero se forja con rayo y paciencia: cada trueno es leña gratis para mi fragua, y cada golpe de martillo lleva el calor de la tormenta. Las herramientas que hago duran: no se rompen, no se doblan. El acero barato… ese ni lo toco.', neg: 'Acero de tormenta. Dura. Fin.' }, et: 'pregunta' },
        { t: 'Preguntar por las tormentas', realidad: 62, energia: 4, resp: { pos: 'Aquí la tormenta no pasa: vive. Los rayos caen sin avisar, y yo los aprovecho: cuando truena, forjo. Cuando no truena, también forjo, pero con menos gracia. Si te asustan los truenos, no te acerques a la fragua con tormenta: las chispas vuelan.', neg: 'Tormenta: mi clima, mi leña.' }, et: 'pregunta' },
        { t: 'Saludarlo con respeto', realidad: 70, energia: 4, resp: { pos: 'Respeto al oficio. Bien.', neg: 'Ajá.' }, et: 'saludo' }
      ]
    },
    lena: {
      saludo: { alegre: ['¡TORMENTA! ¡El cielo canta conmigo! ¡Mi momento!', '¡Día claro! ¡Plaza llena y voz clara! ¡A cantar!'], sereno: ['Mi voz se lleva bien con los rayos: cuando truena, canto más fuerte.'], neutral: ['Soy Lena, cantante de Chispa Alta. Canto cuando truena y dicen que soy la voz de la tormenta.'], triste: ['Hoy no hay trueno… los días sin trueno son días sin coro. Canto igual, pero no es lo mismo.'] },
      opciones: [
        { t: 'Pedirle una canción', realidad: 66, energia: 6, resp: { pos: '¡Claro! Esta va con trueno de fondo, aunque no haya trueno: «cayó el rayo en la meseta, y la meseta cantó…». ¿Te gustó? ¡Cuando truene de verdad suena el doble!', neg: 'Una corta: «trueno, voz y plaza».' }, et: 'pregunta' },
        { t: 'Preguntar por Chispa Alta', realidad: 62, energia: 4, resp: { pos: 'Chispa Alta es cielo abierto y tormenta: aquí el Rayo cae fácil y la fragua de Iván nunca se enfría. Con niebla canto bajito, que todo se escucha raro; con sol, la plaza se llena. Y con tormenta… con tormenta soy yo la que manda.', neg: 'Cielo abierto, tormenta y voz.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: '¡Qué amable! Esta canción va por ti, con truenos.', neg: '…hola.' }, et: 'saludo' }
      ]
    },
    omar: {
      saludo: { alegre: ['Día claro. Buen lago.'], sereno: ['El lago sube. Bien.'], neutral: ['Omar. Pescador. Pesco en el lago desde antes de que Nami naciera, según yo.'], triste: ['Calor. El lago se enturbia. Mal día.'] },
      opciones: [
        { t: 'Preguntar por la pesca', realidad: 64, energia: 4, resp: { pos: 'Pescar es esperar. El amanecer sobre el lago, la caña quieta, y el pez viene solo. Nublado pican; con calor bajan; con tormenta, nadie pesca. Ni yo. La prisa no pesca nada.', neg: 'Esperar. Eso es pescar.' }, et: 'pregunta' },
        { t: 'Preguntar por el lago', realidad: 62, energia: 4, resp: { pos: 'El lago es grande y callado. El Río del Este lo alimenta y sigue al sur. Con niebla no se ve nada: se oye todo. Pesco de memoria cuando hay niebla. Y de día claro, se ve el fondo. Casi.', neg: 'Lago grande. Callado. Bueno.' }, et: 'pregunta' },
        { t: 'Saludarlo', realidad: 70, energia: 4, resp: { pos: '…Buen día.', neg: '…Ajá.' }, et: 'saludo' }
      ]
    },
    rosa: {
      saludo: { alegre: ['¡Día claro! ¡Pescado fresco y plaza llena! ¡Hoy se cocina para todos!', '¡Lluvia! ¡Día de caldo caliente y puerto lleno!'], sereno: ['El caldo está al fuego y el pescado, fresco. Siéntate: comes en un momento.'], neutral: ['Soy Rosa, cocinera de Puerto Brisa Azul. Cocino pescado para todo el puerto y mi caldo es famoso hasta la Metrópolis.'], triste: ['El calor me echa a perder el pescado… a cocinar temprano o no se cocina.'] },
      opciones: [
        { t: 'Preguntar por su caldo', realidad: 64, energia: 4, resp: { pos: 'Mi caldo es pescado fresco del lago, leña buena y sazón que no se discute. Se cocina despacio, con el puerto entero oliéndolo. Hasta el mejor caldo se puede quemar, pero el mío no: lo vigilo como a un hijo. ¿Quieres un tazón? Te lo sirvo caliente.', neg: 'Caldo de pescado fresco. Famoso. Fin.' }, et: 'pregunta' },
        { t: 'Preguntar por el puerto', realidad: 62, energia: 4, resp: { pos: 'El puerto vive del lago: Nami pesca en el muelle, Omar pesca en silencio y yo cocino lo que traen. Con lluvia, mi cocina se llena; con sol, la plaza se llena. Y con tormenta, cierro y guardo el pescado: ni el caldo sale con truenos.', neg: 'Lago, pesca y caldo. Eso es el puerto.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: '¡Qué amable! Siéntate: un caldo te espera.', neg: '…hola, mi cielo.' }, et: 'saludo' }
      ]
    },
    hugo: {
      saludo: { alegre: ['Día claro. A hacer carbón.'], sereno: ['El carbón no necesita palabras. Yo tampoco.'], neutral: ['Hugo. Carbonero de Ceniza Viva. Hago carbón con la madera quemada y lo vendo a las forjas.'], triste: ['Lluvia. Mal día. El carbón se apaga.'] },
      opciones: [
        { t: 'Preguntar por el carbón', realidad: 64, energia: 4, resp: { pos: 'Carbón bien hecho: madera quemada, horno tapado y paciencia. El calor seco de la ceniza ayuda; la lluvia lo apaga. Lo vendo a las forjas: sin carbón bueno no hay acero bueno. El trabajo terminado es lo único que importa.', neg: 'Carbón bien hecho. Eso es todo.' }, et: 'pregunta' },
        { t: 'Preguntar por Ceniza Viva', realidad: 62, energia: 4, resp: { pos: 'Ceniza Viva es fuego y silencio: la Tierra Quemada, los braseros que no se apagan y la ceniza que vuela con el viento. El frío de la montaña no llega aquí. Aquí se trabaja callado y se termina lo empezado.', neg: 'Fuego y silencio.' }, et: 'pregunta' },
        { t: 'Saludarlo', realidad: 70, energia: 4, resp: { pos: '…Buen día.', neg: '…Ajá.' }, et: 'saludo' }
      ]
    },
    emma: {
      saludo: { alegre: ['¡Día claro! ¡A secar ollas al sol!', '¡Sol y barro! ¡Así salen las ollas buenas!'], sereno: ['El barro guarda el calor de la tierra. Amaso despacio: las prisas agrietan.'], neutral: ['Soy Emma, alfarera de Ceniza Viva. Hago ollas y cántaros con la arcilla de la Tierra Quemada y los cuezo en los braseros.'], triste: ['La lluvia me arruina el barro… hoy no se amasa. Se mira llover.'] },
      opciones: [
        { t: 'Preguntar por sus ollas', realidad: 64, energia: 4, resp: { pos: 'Una olla buena no tiene grietas: barro suave al amasar, torno parejo y brasero al rojo vivo. El viento seca el barro antes de tiempo, así que lo tapo; la ceniza se mete, así que lo limpio. Y cuando sale del horno entera… eso no tiene precio.', neg: 'Barro, torno y brasero. Sin prisas.' }, et: 'pregunta' },
        { t: 'Preguntar por la Tierra Quemada', realidad: 62, energia: 4, resp: { pos: 'La Tierra Quemada es ceniza, brasas y calor seco: el suelo no quema a los suyos, y a los demás sí. Aquí la arcilla sale buena porque la tierra ya pasó por el fuego. Con niebla el barro se ve suave, bonito. Con lluvia… mejor no hablar.', neg: 'Ceniza, brasas y barro bueno.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: 'Qué amable. Mira las ollas: si te gusta una, es tuya.', neg: '…hola.' }, et: 'saludo' }
      ]
    },
    pablo: {
      saludo: { alegre: ['Día claro: la piedra se ve entera. A cortar.'], sereno: ['La cantera en silencio… eso es trabajar bien.'], neutral: ['Pablo. Cantero de Raíz de Piedra. Corto piedra para las casas y los caminos.'], triste: ['Lluvia: la cantera se vuelve barro. Se corta igual, más despacio.'] },
      opciones: [
        { t: 'Preguntar por la piedra', realidad: 64, energia: 4, resp: { pos: 'La piedra buena y firme no se discute: se corta, se carga y se pone donde hace falta. La blanda se deshace; la buena dura siglos. Mi forma de querer es aparecer con una piedra justo cuando hace falta. Sin palabras.', neg: 'Piedra buena. Punto.' }, et: 'pregunta' },
        { t: 'Preguntar por Raíz de Piedra', realidad: 62, energia: 4, resp: { pos: 'Raíz de Piedra es roca, silencio y trabajo: entre las rocas, las raíces curan y la piedra sostiene. El viento entre las rocas silba; yo lo conozco. Con niebla cada piedra es una sorpresa, y conozco todas.', neg: 'Roca y silencio.' }, et: 'pregunta' },
        { t: 'Saludarlo', realidad: 70, energia: 4, resp: { pos: '…Buen día.', neg: '…Ajá.' }, et: 'saludo' }
      ]
    },
    ana: {
      saludo: { alegre: ['¡Lluvia! ¡Las raíces se ablandan y salen enteras! ¡El mejor día para recoger!', '¡Día claro! ¡A secar raíces al sol!'], sereno: ['La raíz cura porque no tiene prisa. Yo tampoco.'], neutral: ['Soy Ana, herbolaria de Raíz de Piedra. Recojo raíces y hierbas entre las rocas y preparo remedios para la aldea.'], triste: ['El calor marchita las raíces… a salir al amanecer, con cesto y sombrero.'] },
      opciones: [
        { t: 'Preguntar por sus remedios', realidad: 64, energia: 4, resp: { pos: 'Todo remedio empieza con un error curado: se recoge la raíz entera, sin arrancarla a lo bruto, se seca a la sombra y se prepara con calma. La raíz bien sacada cura; la mal sacada, ni eso. Y nunca arranques sin pedir: la tierra escucha.', neg: 'Raíces enteras, secas a la sombra.' }, et: 'pregunta' },
        { t: 'Preguntar por las raíces', realidad: 62, energia: 4, resp: { pos: 'Entre las rocas crecen las mejores raíces: huelen más fuerte con niebla, así las encuentro. Con lluvia se ablandan y salen enteras; con calor, se esconden. Yo recojo de memoria, planta a planta, y el cesto siempre vuelve lleno.', neg: 'Entre las rocas, las mejores.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: 'Qué amable. ¿Un té de raíces? Lo preparo en un momento.', neg: '…hola, mi cielo.' }, et: 'saludo' }
      ]
    },
    esteban: {
      saludo: { alegre: ['Día claro: la luz buena entra a la biblioteca. Pasa, pero en silencio.', 'Sol en Arcana: día de leer en serio.'], sereno: ['Los libros viejos no tienen prisa. Yo tampoco. Pregunta exacto y te respondo exacto.'], neutral: ['Soy Esteban, bibliotecario de Arcana. Cuido los libros de la ciudad de los magos y sé dónde está cada uno. Presto libros con una condición: que vuelvan.'], triste: ['Con este calor los libros se resecan… a cerrar ventanas y a cuidar el papel viejo.'] },
      opciones: [
        { t: 'Preguntar por los libros', realidad: 64, energia: 4, resp: { pos: 'La biblioteca guarda siglos: libros de teoría, de historia, de técnicas que ya nadie enseña. Cada uno tiene su estante y su lugar; el desorden en los estantes no se perdona. Si doblas una página, te lo anoto. Si lo devuelves a tiempo, te presto otro.', neg: 'Libros viejos, estantes en orden. Que vuelvan.' }, et: 'pregunta' },
        { t: 'Preguntar por Arcana', realidad: 62, energia: 4, resp: { pos: 'Arcana es la ciudad de los magos: torres de estudio, braseros que no se apagan y hechiceros que cruzan el continente entero para venir a leer. Con niebla, la ciudad entera parece un libro viejo. Con lluvia, se lee y se pregunta: nadie se escapa.', neg: 'Torres, libros y braseros.' }, et: 'pregunta' },
        { t: '🧙 Aprender lo básico del Arte Místico (con los hechiceros)', realidad: 68, energia: 10, resp: { pos: 'Los hechiceros no enseñan a cualquiera: enseñan a quien viene a Arcana a aprender. Yo te presento: ellos te enseñan lo básico, en orden, y tú pones los años. ¿Empezamos por lo primero?', neg: 'Los hechiceros no tienen prisa. Vuelve cuando no la tengas tú tampoco.' }, accion: 'aprenderBasico', et: 'entrenar' },
        { t: 'Saludarlo con respeto', realidad: 70, energia: 4, resp: { pos: 'Respeto y silencio. Así se entra a una biblioteca.', neg: '…asiente sin levantar la vista.' }, et: 'saludo' }
      ]
    },
    miriam: {
      saludo: { alegre: ['¡Día claro! ¡La noche será clara! ¡Lo sé!', '¡Sol de día, estrellas de noche! ¡Así me gusta!'], sereno: ['Las estrellas no se apagan. Yo las miro y digo lo que veo, sin adornarlo.'], neutral: ['Soy Miriam, astróloga de Arcana. Leo las estrellas desde la torre. La ciudad me consulta antes de las fiestas y después de las tormentas.'], triste: ['Las nubes tapan el cielo… las estrellas esperan. Yo también.'] },
      opciones: [
        { t: 'Preguntar por las estrellas', realidad: 64, energia: 4, resp: { pos: 'Las estrellas hablan bajito: hay que mirar sin prisa y sin pedir certezas. Yo digo lo que veo: una noche clara trae buen camino; un cielo nublado, paciencia. Y si me preguntas si vas a ganar el torneo… las estrellas no apuestan, y yo tampoco.', neg: 'Miro, digo lo que veo. Sin certezas.' }, et: 'pregunta' },
        { t: 'Preguntar por el cielo de Arcana', realidad: 62, energia: 4, resp: { pos: 'El cielo de Arcana es el más limpio del continente: sin humo de fraguas ni luces de ciudad grande. Con viento, las nubes se van y las estrellas quedan. Con niebla, ni las estrellas se ven: día de té. Y con tormenta, el cielo habla fuerte. Yo escucho.', neg: 'El cielo más limpio del continente.' }, et: 'pregunta' },
        { t: 'Saludarla con calidez', realidad: 72, energia: 4, resp: { pos: 'Qué amable. Las estrellas lo vieron venir. Yo también, casi.', neg: '…hola.' }, et: 'saludo' }
      ]
    },
    vesper: {
      saludo: { alegre: ['Día claro. La mente se ve entera. Siéntate, si vienes a escuchar.', 'Sol y silencio: así se oye lo que la mente dice.'], sereno: ['La mente no admite prisas. Yo tampoco. Pregunta despacio y te respondo despacio.'], neutral: ['Soy Vesper, maestro hechicero de Arcana. Guío a quien quiere despertar el Arte Místico. No enseño atajos: enseño a escuchar la mente.'], triste: ['Con este calor la mente se seca… a meditar a la sombra y a cuidar el silencio.'] },
      opciones: [
        { t: 'Preguntar por el Arte Místico', realidad: 64, energia: 4, resp: { pos: 'El Arte Místico es la capa mental del mundo: no se ve, se siente. Sentido, Rastreo y Barrera mental son lo primero que se aprende, en orden, con los hechiceros de Arcana. Después vienen las técnicas mayores, según tu camino. Y ser hechicero es casi otra vida: dominarlo de verdad toma años, no días.', neg: 'Mente, silencio y años. Eso es el Arte Místico.' }, et: 'pregunta' },
        { t: 'Preguntar por los hechiceros de Arcana', realidad: 62, energia: 4, resp: { pos: 'Los hechiceros de Arcana no enseñan a cualquiera: enseñan a quien viene a aprender, sin prisa. Esteban te presenta y ellos te enseñan lo básico, en orden, y tú pones los años. Yo soy quien despierta y guía: si quieres convertirte en uno, ven a mí.', neg: 'Hechiceros de Arcana: vienen a aprender, no a presumir.' }, et: 'pregunta' },
        { t: '✨ Pedir el despertar de hechicero', realidad: 68, energia: 10, resp: { pos: '¿Quieres despertar? No es un truco ni un examen: es un momento. Pongo la mano sobre tu frente, el mundo se queda en silencio un instante, y el Arte Místico empieza a correr por ti. Después, las tres básicas las aprendes con los hechiceros, en orden. ¿Lo hacemos ahora?', neg: 'El despertar no se pide con prisa. Vuelve cuando lo quieras de verdad.' }, accion: 'despertarHechicero', et: 'entrenar' },
        { t: 'Saludarlo con respeto', realidad: 70, energia: 4, resp: { pos: 'Respeto y silencio. Así se entra a la mente.', neg: '…asiente despacio, sin abrir los ojos.' }, et: 'saludo' }
      ]
    }
  },
  init() {
    document.getElementById('dlgCerrar').addEventListener('click', () => this.cerrar());
    // Panel compacto: se arma por JS (index.html no se toca): retrato pequeño + nombre
    // arriba, charla con historial y máquina de escribir, y barra de secciones.
    const caja = document.querySelector('#dialogo .dlgCaja');
    if (caja) caja.classList.add('dlgCompacto');
    const cuerpo = document.querySelector('#dialogo .dlgCuerpo');
    const txt = document.getElementById('dlgTexto');
    if (cuerpo && txt && !document.getElementById('dlgCharla')) {
      const charla = document.createElement('div'); charla.id = 'dlgCharla';
      const hist = document.createElement('div'); hist.id = 'dlgHistorial';
      cuerpo.insertBefore(charla, txt);
      charla.appendChild(hist); charla.appendChild(txt);
    }
    if (cuerpo && !document.getElementById('dlgSecciones')) {
      const sec = document.createElement('div'); sec.id = 'dlgSecciones';
      const ops = document.getElementById('dlgOpciones');
      cuerpo.insertBefore(sec, ops);
    }
  },
  abrir(npc) {
    const E = U.Juego.estado; this.npc = npc; this.esCartel = false; this.modo = 'npc'; this.fase = 'apertura'; this.abierto = true; E.ui = 'dialogo'; E.jugador.descansando = false; E.jugador.cargando = false; if (!npc.hechos) npc.hechos = []; npc.veces = (npc.veces || 0) + 1;
    document.getElementById('dialogo').classList.remove('oculto');
    if (!npc.saludado) { npc.saludado = true; U.Emociones.evento(npc, { realidad: 62, energia: 4, etiqueta: 'primer encuentro' }); }
    if (npc.id === 'kaelen' && E.objetivos[0].estado === 'actual') { E.objetivos[0].estado = 'hecho'; U.HUD.toast('Objetivo cumplido: habla con Kaelen.', 'exito'); U.Juego.siguienteObjetivo(); }
    if (npc.id === 'kaelen' && E.flags.victoria && !E.flags.contadoVictoria) { E.flags.contadoVictoria = true; U.Emociones.evento(npc, { realidad: 90, energia: 20, etiqueta: 'victoria en la arena' }); this.razon = 'Kaelen recuerda tu victoria: Confianza +'; E.objetivos[3].estado = 'hecho'; U.Juego.siguienteObjetivo(); }
    // TU HABLAS PRIMERO: eliges como empezar; el NPC responde DESPUES, recordando lo que ya paso.
    this.decir('Te acercas a ' + npc.nombre + ' (' + npc.rol + '). Tú hablas primero: ¿cómo empiezas la conversación?');
    this.razon = this.recuerdoTexto(npc); this.pintarRazon(); this.seccion = 'hablar'; this.opciones = this.opcionesApertura(npc); this.pintarOpciones(); this.pintarCara(); U.Audio.sfx('dialogo');
  },
  opcionesApertura(npc) {
    const E = U.Juego.estado; const mom = U.Tiempo.faseDe(U.Tiempo.hora(E)); const cl = U.Clima.de(E); const sal = U.General.saludoContexto(npc, E);
    return [
      { t: '«' + sal.palabra + ', ' + npc.nombre + '.» (saludo del archivo general: es ' + mom.nombre.toLowerCase() + ')', realidad: 70, energia: 4, et: 'saludo', apertura: 'saludo' },
      { t: '«Vaya tiempo que hace…» (comentar el clima: ' + cl.nombre + ' · ' + cl.detalle + ')', realidad: 64, energia: 4, et: 'clima', apertura: 'clima' },
      { t: '«¿Qué hay de nuevo por aquí?» (preguntar novedades)', realidad: 62, energia: 5, et: 'pregunta', apertura: 'novedades' },
      { t: '«Necesito tu ayuda, ' + npc.nombre + '.» (ir al grano)', realidad: 58, energia: 8, et: 'directo', apertura: 'directo' }
    ];
  },
  opcionesNormales(npc) {
    const ops = this.guiones[npc.id] ? this.guiones[npc.id].opciones.slice() : [];
    ops.push({ t: 'Preguntar si ha oído algo raro últimamente (rumores)', realidad: 62, energia: 4, resp: { pos: '', neg: '' }, accion: 'orgRumor', et: 'pregunta' });
    ops.push({ t: 'Conocerle mejor: gustos, disgustos y forma de ser', realidad: 68, energia: 4, resp: { pos: '', neg: '' }, accion: 'gustos', et: 'conocer' });
    ops.push({ t: 'Preguntar su sabor favorito (para regalarle comida)', realidad: 66, energia: 3, resp: { pos: '', neg: '' }, accion: 'saborFavorito', et: 'conocer' });
    ops.push({ t: '🎁 Regalarle dinero (sorpresa, sin que lo pida)', realidad: 70, energia: 5, resp: { pos: '', neg: '' }, accion: 'regaloSorpresa', et: 'regalo' });
    { const E2 = U.Juego.estado; const pr2 = E2 && E2.jugador.promesas ? E2.jugador.promesas.find(x => x.npcId === npc.id) : null; if (pr2) ops.push({ t: 'Cumplir tu promesa: darle las ' + pr2.cantidad + ' 🪙 prometidas', realidad: 74, energia: 5, resp: { pos: '', neg: '' }, accion: 'cumplirPromesa', et: 'promesa' }); }
    if (U.Vida) {
      const candidatos = ['torin', 'breno', 'marco', 'kaelen', 'marisol', 'sora', 'elena'];
      let añadidos = 0;
      candidatos.forEach(id => { if (añadidos >= 3 || id === npc.id) return; const t = U.Vida.buscar(id); if (!t) return; if (t.mapa === npc.mapa && !t.enCasa && U.Grid.dist(t, npc) < 8) return; ops.push({ t: '¿Dónde está ' + t.nombre + ' ahora?', realidad: 64, energia: 3, resp: { pos: '', neg: '' }, accion: 'preguntarPor', target: id, et: 'preguntar' }); añadidos++; });
    }
    return ops;
  },
  // ===== PANEL COMPACTO: secciones Hablar / Acciones / Misiones =====
  // El panel ya no muestra todos los botones a la vez: cada sección muestra solo sus
  // sub-opciones. «Misiones» solo existe si ese NPC tiene alguna (tablón, entrega o
  // torneo). Toda opción sigue siendo el mismo objeto de siempre: las sub-opciones
  // llaman a los manejadores de acción que ya existen (nada se reescribe).
  SECCIONES: [{ id: 'hablar', t: '💬 Hablar' }, { id: 'acciones', t: '⚔ Acciones' }, { id: 'misiones', t: '📜 Misiones' }],
  _categoria(op) {
    if (!op) return 'hablar';
    if (op.et === 'mision' || op.et === 'torneo' || op.accion === 'tablon' || op.accion === 'entregarMision' || op.accion === 'torneo') return 'misiones';
    if (op.et === 'reto' || op.et === 'entrenar' || op.et === 'comprar' || op.et === 'escudo' || op.et === 'pocion' || op.et === 'jugar' || op.et === 'regalo' || op.et === 'promesa' || op.accion === 'reto' || op.accion === 'entrenoGuia' || op.accion === 'entrenar' || op.accion === 'entrenarYang' || op.accion === 'irTienda' || op.accion === 'aprenderEscudo' || op.accion === 'regaloSorpresa' || op.accion === 'cumplirPromesa' || op.darComida || op.darRegalo || op.darSabor || (op.accion && op.accion.indexOf('orgPetra') === 0)) return 'acciones';
    return 'hablar';
  },
  _tieneMisiones(npc) {
    if (!npc) return false;
    return this.opcionesNormales(npc).some(o => this._categoria(o) === 'misiones');
  },
  _opcionesSeccion(npc, sec) {
    const base = this.opcionesNormales(npc);
    if (sec === 'hablar') {
      const ops = [];
      ops.push({ t: '💬 Charlar un rato', realidad: 66, energia: 4, et: 'charlar', charlar: true });
      ops.push({ t: '🏘 Preguntar por el pueblo', realidad: 62, energia: 4, et: 'pregunta', pueblo: true });
      base.forEach(o => { if (o.accion === 'preguntarPor') ops.push(o); });
      ops.push({ t: '👂 Pedir un rumor', realidad: 62, energia: 4, et: 'pregunta', accion: 'orgRumor', resp: { pos: '', neg: '' } });
      ops.push({ t: '🌦 Preguntar por el clima', realidad: 64, energia: 4, et: 'clima', clima: true });
      base.forEach(o => { if (this._categoria(o) === 'hablar' && o.accion !== 'preguntarPor' && o.accion !== 'orgRumor') ops.push(o); });
      return ops;
    }
    if (sec === 'acciones') {
      const ops = [];
      ops.push({ t: '🪙 Dar dinero', realidad: 70, energia: 5, et: 'regalo', accion: 'regaloSorpresa', resp: { pos: '', neg: '' } });
      ops.push({ t: '🎁 Darle un objeto (comida de tu mochila)', realidad: 68, energia: 4, et: 'regalo', darComida: true });
      ops.push({ t: '🎁 Darle su regalo favorito', realidad: 68, energia: 4, et: 'regalo', darRegalo: true });
      base.forEach(o => { if (this._categoria(o) === 'acciones' && o.accion !== 'regaloSorpresa') ops.push(o); });
      return ops;
    }
    return base.filter(o => this._categoria(o) === 'misiones');
  },
  mostrarSecciones(npc) {
    if (!npc) return;
    if (!this.seccion || (this.seccion === 'misiones' && !this._tieneMisiones(npc))) this.seccion = 'hablar';
    this.opciones = this._opcionesSeccion(npc, this.seccion);
    this.pintarOpciones();
  },
  // Dar una comida de la mochila (objeto o regalo favorito): misma regla que cuando
  // un NPC te la pide (elegirPeticion): +5 confianza (+8 si es su favorito) y +2 karma.
  elegirDar(n, o) {
    const E = U.Juego.estado, j = E.jugador; j.bolsaComida = j.bolsaComida || [];
    if (o.darRegalo) {
      const fav = U.Economia.favoritoNpc(n.id);
      if (j.bolsaComida.indexOf(fav) < 0) { this.decir('Su sabor favorito es el ' + fav + ' y no llevas ninguna comida ' + fav + ' en la mochila. Marisol vende las 5 en la tienda, a 10 🪙.'); U.Audio.sfx('fail'); return; }
      this._darComidaSabor(n, fav); this.mostrarSecciones(n); return;
    }
    if (!j.bolsaComida.length) { this.decir('No llevas comida en la mochila para regalar. Marisol vende las 5 en la tienda, a 10 🪙.'); U.Audio.sfx('fail'); return; }
    this.decir('¿Qué le das a ' + n.nombre + ' de tu mochila?');
    this.opciones = j.bolsaComida.map(sab => ({ t: '🍽 Darle una Comida ' + sab, darSabor: sab, realidad: 68, energia: 4, et: 'regalo' }));
    this.pintarOpciones();
  },
  _darComidaSabor(n, sabor) {
    const E = U.Juego.estado, j = E.jugador;
    const idx = (j.bolsaComida || []).indexOf(sabor);
    if (idx < 0) { this.decir('Ya no llevas Comida ' + sabor + ' en la mochila.'); U.Audio.sfx('fail'); return; }
    j.bolsaComida.splice(idx, 1);
    const ranking = U.Economia.rankingNpc(n.id); const puesto = ranking.indexOf(sabor);
    const ef = U.Economia.DAR_COMIDA[puesto]; const esFav = puesto === 0;
    const conf = esFav ? 8 : Math.max(5, ef.conf);
    U.Economia.confianza(n, conf);
    if (n.estados) n.estados.animo = Math.max(0, Math.min(100, n.estados.animo + ef.animo));
    U.Economia.karmaAdd(2, U.Economia.puebloDeMapa(n.mapa));
    if (!n.hechos) n.hechos = []; n.hechos.push('le regalaste una comida ' + sabor);
    U.Emociones.evento(n, { realidad: 70, energia: 5, etiqueta: 'regalo' });
    this.decir(n.nombre + ' recibe tu comida ' + sabor + (esFav ? ': «¡Es mi sabor favorito! ¿Cómo lo supiste?»' : ' con gusto.') + ' (Confianza +' + conf + (esFav ? ' por ser su favorito' : '') + ' · Ánimo ' + (ef.animo >= 0 ? '+' : '') + ef.animo + ' según SU orden de sabores · Karma +2)');
    this.razon = ''; this.pintarRazon(); this.pintarCara(); U.Audio.sfx('cura');
  },
  abrirSparring(v) {
    const E = U.Juego.estado; const A = U.Vida.buscar(v.a), B = U.Vida.buscar(v.b); if (!A || !B) return;
    this.npc = A; this.esCartel = false; this.modo = 'sparring'; this.fase = 'sparring'; this.abierto = true; E.ui = 'dialogo'; E.jugador.descansando = false; E.jugador.cargando = false;
    document.getElementById('dialogo').classList.remove('oculto');
    const perA = U.Personas.de(A.id);
    this.decir(A.nombre + ' y ' + B.nombre + ' paran su entrenamiento y voltean hacia ti. ' + A.nombre + ' (' + perA.tipo.toLowerCase() + ') te mide con la mirada: «¿Entraste al círculo nomás a mirar? Aquí se vale unirse: contra los dos, del bando de uno, o salte y déjanos entrenar. Y ojo: esto es sparring, sin muerte: quien caiga al 10% de Vida, se retira.»');
    this.razon = 'Círculo de la pelea · ' + A.nombre + ' y ' + B.nombre + ' entrenaban entre ellos, aquí mismo';
    this.opciones = [
      { t: '⚔ Unirme CONTRA los dos (yo solo contra ' + A.nombre + ' y ' + B.nombre + ')', spar: 'solo' },
      { t: '🤝 Unirme al bando de ' + A.nombre + ' (contra ' + B.nombre + ')', spar: 'a' },
      { t: '🤝 Unirme al bando de ' + B.nombre + ' (contra ' + A.nombre + ')', spar: 'b' },
      { t: '👀 Solo mirar: que sigan entrenando', spar: 'mirar' },
      { t: '🚶 Salir del círculo', spar: 'salir' }
    ];
    this.pintarRazon(); this.pintarOpciones(); this.pintarCara(); U.Audio.sfx('dialogo');
  },
  abrirResultadoSparring(tipo, pareja, bando) {
    const E = U.Juego.estado; const A = U.Vida.buscar(pareja[0]), B = pareja[1] ? U.Vida.buscar(pareja[1]) : null; if (!A) return;
    this.npc = A; this.esCartel = false; this.modo = 'sparringFin'; this.fase = 'sparringFin'; this.abierto = true; E.ui = 'dialogo'; E.jugador.descansando = false;
    document.getElementById('dialogo').classList.remove('oculto');
    const pA = U.Personas.de(A.id), pB = B ? U.Personas.de(B.id) : null;
    let txt;
    if (tipo === 'victoria') txt = 'El sparring terminó: ganaste. ' + A.nombre + ': «' + (pA.victoria || 'Bien peleado.') + '»' + (B ? ' ' + B.nombre + ': «' + (pB.victoria || 'Bien peleado.') + '»' : '') + (bando && bando !== 'solo' ? ' Pelear en bando también cuenta: tu aliado celebra contigo.' : '') + ' (+12 monedas)';
    else txt = 'La pelea se detuvo: caíste al 10% de Vida y te sacaron del círculo. ' + A.nombre + ': «' + (pA.expulsa || 'Te miras muy débil.') + '»' + (B ? ' ' + B.nombre + ': «' + (pB.derrota || 'Lo hiciste bien.') + '»' : '') + ' No podrás volver al círculo hasta recuperarte por encima del 50% de Vida.';
    this.decir(txt);
    this.razon = tipo === 'victoria' ? 'Resultado del sparring · cada quien opina según su forma de ser' : 'Regla del 10% · el círculo se cierra para ti hasta que te recuperes';
    this.opciones = []; this.pintarRazon(); this.pintarOpciones(); this.pintarCara(); U.Audio.sfx('dialogo');
  },
  recuerdoTexto(npc) {
    const E = U.Juego.estado; const rec = [];
    if ((npc.veces || 0) > 1) rec.push('ya hablasteis ' + npc.veces + ' veces');
    if (npc.hechos && npc.hechos.length) rec.push(npc.hechos[npc.hechos.length - 1]);
    if (E.flags.victoria && npc.id === 'kaelen') rec.push('recuerda tu victoria en la arena');
    if (E.historial && E.historial.derrotas > 0) rec.push('sabe que caíste ' + E.historial.derrotas + ' vez/veces');
    if (E.historial && E.historial.retos > 0) rec.push('sabe que superaste ' + E.historial.retos + ' reto(s)');
    return rec.length ? npc.nombre + ' recuerda: ' + rec.join(' · ') : npc.nombre + ' aún no tiene recuerdos contigo: esta charla será el primero.';
  },
  respuestaContextual(npc, tipo) {
    const E = U.Juego.estado; const hechos = npc.hechos || [];
    if (npc.id === 'kaelen' && E.flags.contadoVictoria && E.flags.victoria) return '¡Lo escuché desde aquí! Tres oleadas y de pie. Bruma hablará de ti. ¿Qué sigue?';
    if (hechos.indexOf('superaste su reto de combate') >= 0) return 'Todavía me dura el respeto de tu reto superado. Habla, te escucho.';
    if (hechos.indexOf('te vieron caer') >= 0) return npc.id === 'sora' ? 'Te vi despertar junto a la fogata tras caer… Cuídate, ¿sí? ¿Qué necesitas hoy?' : 'La última vez volviste a la fogata en brazos de la derrota. Sigues en pie: eso cuenta. Dime.';
    if (tipo === 'clima') return U.General.respuestaClima(npc, E);
    if (tipo === 'charlar') return U.General.charlaContexto(npc, E);
    if (tipo === 'novedades') {
      if (U.Tiempo.esNoche(U.Tiempo.hora(E))) return 'De noche la novedad es una: los bandidos del Bosque Susurrante salen al caer la Noche y se retiran al amanecer. No acampan: solo cruzan para asaltar.';
      const aus = (E.roster || []).find(x => x.id !== npc.id && x.mapa !== E.mapaId && !x.enCasa);
      if (aus) return 'La novedad: ' + aus.nombre + ' no está en la aldea ahora. ' + U.Vida.dondeEstaTexto(aus) + '. Si lo buscas, pregúntame dónde está y te lo digo.';
      if (E.historial && E.historial.retos > 0) return 'La novedad eres tú: ya superaste ' + E.historial.retos + ' reto(s) de combate. Los guías te miran distinto.';
      return 'Novedades: el continente es radial ahora — la Metrópolis brilla en el centro, las aldeas elementales quedan lejos en cada dirección y Arcana, la de los magos, al oeste. El Desierto de Sal arde al oeste de Bruma y la Montaña Brumosa guarda su obelisco al noreste. Y cuando dos de los nuestros hacen sparring en el Bosque (09:00–11:00 y 14:00–17:00) se forma un círculo alrededor de su pelea, donde sea que estén. El mundo creció.';
    }
    // No todos los NPCs tienen guion propio (p. ej. nami, orin, zara, varek): sin
    // este respaldo, saludarlos rompía el diálogo (g.saludo de undefined).
    const g = this.guiones[npc.id] || { saludo: { neutral: [npc.nombre + ' te mira y asiente, sin muchas palabras.'] } };
    const lineas = g.saludo[npc.emocion] || g.saludo.neutral; const fraseSal = lineas[Math.floor(Math.random() * lineas.length)];
    if (tipo === 'saludo') return U.General.saludoContexto(npc, E).frase + ' ' + fraseSal;
    return fraseSal;
  },
  abrirTienda(dueno) {
    const E = U.Juego.estado, j = E.jugador; this.npc = null; this.esCartel = false; this.modo = 'tienda'; this.fase = 'normal'; this.abierto = true; E.ui = 'dialogo'; E.jugador.descansando = false; E.jugador.cargando = false;
    // La tienda de Bruma es de Marisol; las demás tiendas de pociones del continente
    // (la Metrópolis y las aldeas elementales) las atiende su propio boticario: la
    // puerta trae su nombre en o.dueno y los textos lo usan en vez de «Marisol».
    this.tiendaDueno = dueno || null;
    document.getElementById('dialogo').classList.remove('oculto');
    const pueblo = U.Economia.puebloActual(); const k = U.Economia.karma(j, pueblo);
    document.getElementById('dlgNombre').textContent = 'TIENDA · ' + (dueno ? dueno.toUpperCase() : 'MARISOL, LA BOTICARIA'); document.getElementById('dlgEmocion').textContent = 'tienda';
    const cv = document.getElementById('dlgCara'); const ctx = cv.getContext('2d'); ctx.fillStyle = '#0e1530'; ctx.fillRect(0, 0, 64, 64); U.Render.iconoCanvas(cv, 'aldea', '#67e08a');
    if (!U.Economia.puedeVender(j, pueblo)) {
      document.getElementById('dlgConfTxt').textContent = 'Karma aquí: ' + k;
      document.getElementById('dlgConfianza').firstElementChild.style.width = '0%';
      this.decir((this.tiendaDueno || 'Marisol') + ' cruza los brazos: «Con tu karma aquí (' + k + ') no te vendo nada. La aldea no olvida: ayuda con misiones, da lo que te pidan y gánate de vuelta el trato.»');
      this.razon = 'Karma −80 o menos en este pueblo: se niegan a venderte.'; this.opciones = []; this.pintarRazon(); this.pintarOpciones(); U.Audio.sfx('fail'); return;
    }
    this.tiendaUnidades = this.tiendaUnidades || 50;
    this.pintarTienda();
    U.Audio.sfx('click');
  },
  pintarTienda() {
    const secBar = document.getElementById('dlgSecciones'); if (secBar) secBar.innerHTML = '';
    const E = U.Juego.estado, j = E.jugador; j.bolsaPociones = j.bolsaPociones || []; j.bolsaComida = j.bolsaComida || [];
    const pueblo = U.Economia.puebloActual(); const k = U.Economia.karma(j, pueblo);
    const mult = U.Economia.multLugar(E.mapaId);
    document.getElementById('dlgConfTxt').textContent = '🪙 ' + Math.floor(j.monedas || 0) + ' · Karma aquí ' + k + ' (' + U.Economia.factorTexto(k) + ')';
    document.getElementById('dlgConfianza').firstElementChild.style.width = Math.max(0, Math.min(100, 50 + k / 2)) + '%';
    const u = Math.max(10, Math.min(1000, this.tiendaUnidades || 50));
    const pv = U.Economia.precioPocion(u, E.mapaId, j), pe = U.Economia.precioPocion(u, E.mapaId, j);
    const uc = Math.max(10, Math.min(120, u)); const pc = U.Economia.precioPocion(uc, E.mapaId, j);
    this.decir((this.tiendaDueno || 'Marisol') + ' te prepara la poción AL MOMENTO, como boticaria: tú eliges las unidades y pagas 2 🪙 por unidad' + (mult > 1 ? ' — aquí, lejos y con peligro, cuesta ×1.5 (3 por unidad)' : '') + '. Tu karma en ' + U.Economia.PUEBLOS[pueblo] + ' es ' + k + ': ' + U.Economia.factorTexto(k) + ' ya aplicado. Bolsa: ' + j.bolsaPociones.length + '/3 pociones · ' + j.bolsaComida.length + '/5 comidas · ' + Math.floor(j.monedas || 0) + ' 🪙. Ojo: al tomarla, lo que sobra se pierde.');
    this.razon = 'Vida/Esencia: 10–1000 unidades · Condición: 10–120 · Vender una poción devuelve la mitad de lo que pagaste (en la Mochila)';
    this.pintarRazon();
    const c = document.getElementById('dlgOpciones'); c.innerHTML = '';
    const fila = document.createElement('div'); fila.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;background:#0e1530;border:2px solid var(--borde);padding:8px 10px';
    fila.innerHTML = '<b style="color:var(--rayo)">Unidades: <span id="tiendaUniNum">' + u + '</span></b>';
    const sl = document.createElement('input'); sl.type = 'range'; sl.min = '10'; sl.max = '1000'; sl.step = '1'; sl.value = String(u); sl.className = 'tiendaSlider'; sl.style.flex = '1 1 160px';
    sl.addEventListener('input', () => { this.tiendaUnidades = parseInt(sl.value); document.getElementById('tiendaUniNum').textContent = sl.value; this.pintarTiendaPrecios(); });
    fila.appendChild(sl);
    [50, 100, 250, 500, 1000].forEach(n => { const b = document.createElement('button'); b.className = 'mini'; b.textContent = String(n); b.addEventListener('click', () => { this.tiendaUnidades = n; this.pintarTienda(); }); fila.appendChild(b); });
    c.appendChild(fila);
    const mk = (txt, fn) => { const b = document.createElement('button'); b.innerHTML = txt; b.addEventListener('click', fn); c.appendChild(b); return b; };
    this._btnPV = mk('', () => this.comprarPocionMedida('vida'));
    this._btnPE = mk('', () => this.comprarPocionMedida('esencia'));
    this._btnPC = mk('', () => this.comprarPocionMedida('condicion'));
    this.pintarTiendaPrecios();
    U.Economia.SABORES.forEach(sab => { mk('Comprar Comida ' + sab + ' · 10 🪙 (mochila ' + j.bolsaComida.length + '/5)', () => this.comprarComida(sab)); });
    Object.keys(U.Economia.POLAINAS).forEach(clave => { const pd = U.Economia.POLAINAS[clave]; const tiene = j.polainas && j.polainas[clave]; mk((tiene ? '✓ Ya tienes: ' : 'Comprar ') + pd.nombre + ' · ' + pd.precio + ' 🪙 (vas ' + Math.round((1 - pd.velMult) * 100) + '% más lento; Velocidad crece ×' + pd.crecMult + ' en combate)', () => this.comprarPolainas(clave)); });
    mk(U.Economia.permisoVigente() ? '✓ Permiso de viajero vigente hasta el día ' + j.permisoHasta + ' (cubre viajes y arena; NO el torneo)' : 'Comprar PERMISO de viajero · 200 🪙 · 28 días (cubre viajes entre pueblos y la entrada a la arena; NO el torneo; se paga solo con 20 usos o más)', () => this.comprarPermiso());
    const s2 = document.createElement('button'); s2.innerHTML = '<span class="k">✕</span>Salir de la tienda'; s2.addEventListener('click', () => this.cerrar()); c.appendChild(s2);
    c.scrollTop = 0; this.refrescarScroll();
  },
  pintarTiendaPrecios() {
    const E = U.Juego.estado, j = E.jugador; const u = Math.max(10, Math.min(1000, this.tiendaUnidades || 50));
    const p = U.Economia.precioPocion(u, E.mapaId, j); const uc = Math.max(10, Math.min(120, u)); const pc = U.Economia.precioPocion(uc, E.mapaId, j);
    if (this._btnPV) this._btnPV.innerHTML = '🧪 Comprar Poción de Vida +' + u + ' · <b>' + p + ' 🪙</b>';
    if (this._btnPE) this._btnPE.innerHTML = '🔵 Comprar Tónico de Esencia +' + u + ' · <b>' + p + ' 🪙</b>';
    if (this._btnPC) this._btnPC.innerHTML = '💚 Comprar Poción de Condición +' + uc + ' · <b>' + pc + ' 🪙</b>';
    const num = document.getElementById('tiendaUniNum'); if (num) num.textContent = u;
  },
  comprarPocionMedida(tipo) {
    const E = U.Juego.estado, j = E.jugador; j.bolsaPociones = j.bolsaPociones || [];
    if (j.bolsaPociones.length >= 3) { this.decir('Tu mochila ya lleva 3 pociones (el máximo). Toma o vende una antes de pedir otra.'); U.Audio.sfx('fail'); return; }
    let u = Math.max(10, Math.min(1000, this.tiendaUnidades || 50)); if (tipo === 'condicion') u = Math.max(10, Math.min(120, u));
    const precio = U.Economia.precioPocion(u, E.mapaId, j);
    if ((j.monedas || 0) < precio) { this.decir('Esa dosis cuesta ' + precio + ' 🪙 y tienes ' + Math.floor(j.monedas || 0) + '. Pide menos unidades o gana monedas con misiones del tablón.'); U.Audio.sfx('fail'); return; }
    j.monedas -= precio; j.bolsaPociones.push({ tipo, unidades: u, precio }); U.Recuperacion.sincronizar(j);
    this.decir((this.tiendaDueno || 'Marisol') + ' la prepara al momento y te la entrega humeante: ' + (tipo === 'vida' ? 'Poción' : tipo === 'esencia' ? 'Tónico' : 'Poción de Condición') + ' +' + u + ' por ' + precio + ' 🪙. Bolsa: ' + Math.floor(j.monedas) + ' 🪙 · Pociones ' + j.bolsaPociones.length + '/3.'); U.Audio.sfx('cura'); this.pintarTienda();
  },
  comprarComida(sabor) {
    const E = U.Juego.estado, j = E.jugador; j.bolsaComida = j.bolsaComida || [];
    const pueblo = U.Economia.puebloActual(); const precio = Math.max(1, Math.round(U.Economia.COMIDA_PRECIO * U.Economia.factorKarma(U.Economia.karma(j, pueblo))));
    if (j.bolsaComida.length >= 5) { this.decir('Tu mochila ya lleva 5 comidas (el máximo). Cómete una antes de comprar más.'); U.Audio.sfx('fail'); return; }
    if ((j.monedas || 0) < precio) { this.decir('La comida cuesta ' + precio + ' 🪙 y tienes ' + Math.floor(j.monedas || 0) + '.'); U.Audio.sfx('fail'); return; }
    j.monedas -= precio; j.bolsaComida.push(sabor);
    this.decir('Comida ' + sabor + ' a la mochila (' + precio + ' 🪙). Se come desde la Mochila (pausa), máximo 3 al día y fuera de combate: sube porcentaje según TU orden de sabores del test.'); U.Audio.sfx('cura'); this.pintarTienda();
  },
  comprarPolainas(clave) {
    const E = U.Juego.estado, j = E.jugador; const pd = U.Economia.POLAINAS[clave]; j.polainas = j.polainas || {};
    if (j.polainas[clave]) { this.decir('Ya tienes las ' + pd.nombre.toLowerCase() + '. Se equipan y se quitan desde la Mochila.'); return; }
    const pueblo = U.Economia.puebloActual(); const precio = Math.max(1, Math.round(pd.precio * U.Economia.factorKarma(U.Economia.karma(j, pueblo))));
    if ((j.monedas || 0) < precio) { this.decir('Las ' + pd.nombre.toLowerCase() + ' cuestan ' + precio + ' 🪙 y tienes ' + Math.floor(j.monedas || 0) + '.'); U.Audio.sfx('fail'); return; }
    j.monedas -= precio; j.polainas[clave] = true;
    this.decir(pd.nombre + ' compradas (' + precio + ' 🪙). Equípalas desde la Mochila: con ellas puestas vas más lento, pero tu Velocidad crece ×' + pd.crecMult + ' en combate y un poco por pasos. Solo cabe UNA puesta a la vez.'); U.Audio.sfx('unlock'); this.pintarTienda();
  },
  comprarPermiso() {
    const E = U.Juego.estado, j = E.jugador;
    if (U.Economia.permisoVigente()) { this.decir('Ya tienes permiso vigente hasta el día ' + j.permisoHasta + '. Cubre los cruces entre pueblos (10 🪙) y la entrada a la arena (10 🪙); el torneo NO entra.'); return; }
    if ((j.monedas || 0) < 200) { this.decir('El permiso cuesta 200 🪙 por 28 días de juego y tienes ' + Math.floor(j.monedas || 0) + '. Se paga solo si lo usas 20 veces o más.'); U.Audio.sfx('fail'); return; }
    j.monedas -= 200; j.permisoHasta = (E.reloj ? E.reloj.dia : 1) + 28; j.permisoUsos = 0;
    this.decir('Permiso de viajero firmado: 28 días de juego (hasta el día ' + j.permisoHasta + '). Cubre viajes entre pueblos y entradas a la arena. El torneo se paga aparte, siempre.'); U.Audio.sfx('unlock'); this.pintarTienda();
  },
  // ===== TABLÓN DE MISIONES (Lía): 5 del día, con rango, elemento, razón y pago =====
  abrirTablon() {
    const E = U.Juego.estado, j = E.jugador; this.modo = 'tablon'; this.fase = 'normal'; this.abierto = true;
    const lista = U.Economia.asegurarTablon();
    document.getElementById('dlgConfTxt').textContent = '🪙 ' + Math.floor(j.monedas || 0) + ' · Maestría de ' + U.Elementos.nombre(j.elemento) + ': ' + Math.floor(j.maestria[j.elemento] || 0) + '%';
    let txt = 'El tablón de hoy (' + U.Tiempo.diaTexto(E.reloj) + '): 5 misiones, las que salieron, sin escoger a mano. Caducan al final del día. Toca una para aceptarla.';
    if (E.mision && E.mision.activa) txt = E.mision.completada ? 'Ya cumpliste tu misión: entrégala con la opción de entregar para cobrar ' + E.mision.pago + ' 🪙.' : 'Tienes una misión activa: «' + E.mision.desc + '» (' + Math.floor(E.mision.prog) + '/' + E.mision.meta + '). Solo una a la vez.';
    this.decir(txt);
    this.razon = 'Desbloqueo por maestría de tu elemento principal: D 0% · C 10% · B 25% · A 45% · S 65% · El pago es SOLO por rango';
    this.opciones = lista.map(m => { const bloq = !U.Economia.desbloqueada(m.rango, j); return { t: '[' + m.rango + '] ' + m.desc + ' · Especialista en: ' + U.Elementos.nombre(m.elemento) + ' (' + m.razon + ') · ' + m.pago + ' 🪙' + (bloq ? ' · 🔒 pide ' + U.Economia.DESBLOQUEO[m.rango] + '% de maestría' : ''), tablonUid: m.uid }; });
    this.pintarRazon(); this.pintarOpciones(); U.Audio.sfx('click');
  },
  // ===== PETICIÓN DE UN NPC que te buscó caminando: dinero o un sabor de comida =====
  abrirPeticion(npc, pet) {
    const E = U.Juego.estado; this.npc = npc; this.esCartel = false; this.modo = 'peticion'; this.fase = 'normal'; this.abierto = true; E.ui = 'dialogo'; E.jugador.descansando = false; E.jugador.cargando = false;
    document.getElementById('dialogo').classList.remove('oculto');
    this.peticionActual = pet;
    if (pet.tipo === 'dinero') {
      this.decir(npc.nombre + ' te buscó hasta encontrarte: «Perdona que te aborde así… ¿me prestas ' + pet.cantidad + ' monedas? Es para algo importante en casa. Si me ayudas, no lo olvido.»');
      this.razon = 'Dar lo pedido: +3 confianza y +3 karma aquí · Negarte: −3 confianza y −2 karma · Prometer y no dar: −5 karma';
      this.opciones = [
        { t: 'Darle las ' + pet.cantidad + ' 🪙 que pide', pet: 'dar' },
        { t: 'Dar otra cantidad (yo elijo cuánto)', pet: 'libre' },
        { t: 'Prometo traértelas mañana', pet: 'prometer' },
        { t: 'No puedo ayudarte', pet: 'negar' }
      ];
    } else {
      const fav = U.Economia.favoritoNpc(npc.id) === pet.sabor;
      this.decir(npc.nombre + ' te buscó con hambre: «¿No tendrás por ahí una comida ' + pet.sabor + '? Llevo el día entero sin probar bocado' + (fav ? '… y es justo mi sabor favorito, aunque eso no lo sabe casi nadie' : '') + '.»');
      this.razon = 'Dar el sabor pedido: +5 confianza (+8 si es su favorito) y +2 karma · El ánimo del NPC cambia según SU orden de sabores';
      this.opciones = [
        { t: 'Darle una Comida ' + pet.sabor + ' de tu mochila', pet: 'darComida' },
        { t: 'No tengo de eso ahora', pet: 'negarComida' }
      ];
    }
    this.pintarRazon(); this.pintarOpciones(); this.pintarCara(); U.Audio.sfx('dialogo');
  },
  elegirPeticion(o) {
    const E = U.Juego.estado, j = E.jugador, n = this.npc, pet = this.peticionActual; if (!n || !pet) { this.cerrar(); return; }
    const pueblo = U.Economia.puebloDeMapa(n.mapa);
    if (o.pet === 'libre') {
      this.decir('¿Cuánto le das? (Pidió ' + pet.cantidad + ' 🪙. La confianza escala con lo dado frente a lo pedido, con tope; dar de más no da más.)');
      this.opciones = [5, 10, 20, 40].filter(v => v <= Math.max(5, Math.floor(j.monedas || 0))).map(v => ({ t: 'Dar ' + v + ' 🪙', pet: 'darLibre', cantidad: v }));
      if (!this.opciones.length) this.opciones = [{ t: 'No traigo monedas', pet: 'negar' }];
      this.pintarOpciones(); return;
    }
    if (o.pet === 'dar' || o.pet === 'darLibre') {
      const cant = o.pet === 'dar' ? pet.cantidad : o.cantidad;
      if ((j.monedas || 0) < cant) { this.decir('No traes ' + cant + ' 🪙 (tienes ' + Math.floor(j.monedas || 0) + ').'); U.Audio.sfx('fail'); return; }
      j.monedas -= cant;
      const paso = 3; const gan = o.pet === 'dar' ? paso : Math.max(1, Math.min(paso, Math.round(paso * cant / pet.cantidad)));
      U.Economia.confianza(n, gan); U.Economia.karmaAdd(3, pueblo);
      if (!n.hechos) n.hechos = []; n.hechos.push('le diste el dinero que te pidió');
      this.decir(n.nombre + ': «¡Gracias! De verdad, gracias.» (Confianza +' + gan + ' · Karma +3 en ' + U.Economia.PUEBLOS[pueblo] + ' · Bolsa: ' + Math.floor(j.monedas) + ' 🪙)'); this.razon = ''; this.pintarRazon(); this.opciones = []; this.pintarOpciones(); this.pintarCara(); U.Audio.sfx('cura'); return;
    }
    if (o.pet === 'prometer') {
      j.promesas = j.promesas || []; j.promesas.push({ npcId: n.id, cantidad: pet.cantidad, diaLimite: (E.reloj ? E.reloj.dia : 1) + 1 });
      this.decir(n.nombre + ': «Mañana, entonces. Te creo.» (Si mañana pasa y no das el dinero: karma −5. Puedes cumplir desde su diálogo: «Cumplir tu promesa».)'); this.opciones = []; this.pintarOpciones(); U.Audio.sfx('click'); return;
    }
    if (o.pet === 'negar') { U.Economia.confianza(n, -3); U.Economia.karmaAdd(-2, pueblo); this.decir(n.nombre + ' baja la mirada: «Entiendo… otro día será.» (Confianza −3 · Karma −2)'); this.opciones = []; this.pintarOpciones(); this.pintarCara(); U.Audio.sfx('fail'); return; }
    if (o.pet === 'darComida') {
      const idx = (j.bolsaComida || []).indexOf(pet.sabor);
      if (idx < 0) { this.decir('Revisas tu mochila: no llevas Comida ' + pet.sabor + '. Marisol vende las 5 en la tienda, a 10 🪙.'); U.Audio.sfx('fail'); return; }
      j.bolsaComida.splice(idx, 1);
      const ranking = U.Economia.rankingNpc(n.id); const puesto = ranking.indexOf(pet.sabor);
      const ef = U.Economia.DAR_COMIDA[puesto]; const esFav = puesto === 0;
      const conf = esFav ? 8 : Math.max(5, ef.conf);
      U.Economia.confianza(n, conf); n.estados.animo = Math.max(0, Math.min(100, n.estados.animo + ef.animo)); U.Economia.karmaAdd(2, pueblo);
      if (!n.hechos) n.hechos = []; n.hechos.push('le diste la comida ' + pet.sabor + ' que te pidió');
      this.decir(n.nombre + ' come con gusto' + (esFav ? ': «¡Es mi sabor favorito! ¿Cómo lo supiste?»' : '.') + ' (Confianza +' + conf + (esFav ? ' por ser su favorito' : '') + ' · Ánimo ' + (ef.animo >= 0 ? '+' : '') + ef.animo + ' según SU orden de sabores · Karma +2)'); this.razon = ''; this.pintarRazon(); this.opciones = []; this.pintarOpciones(); this.pintarCara(); U.Audio.sfx('cura'); return;
    }
    if (o.pet === 'negarComida') { this.decir(n.nombre + ': «Ni modo, gracias de todos modos.»'); this.opciones = []; this.pintarOpciones(); U.Audio.sfx('click'); return; }
  },
  abrirCama() {
    const E = U.Juego.estado; this.npc = null; this.esCartel = false; this.modo = 'cama'; this.fase = 'normal'; this.abierto = true; E.ui = 'dialogo'; E.jugador.descansando = false; E.jugador.cargando = false;
    document.getElementById('dialogo').classList.remove('oculto');
    document.getElementById('dlgNombre').textContent = 'TU CAMA · DESPERTADOR'; document.getElementById('dlgEmocion').textContent = 'casa'; document.getElementById('dlgConfTxt').textContent = 'Alarma ' + U.Tiempo.formato(E.alarmaMin);
    document.getElementById('dlgConfianza').firstElementChild.style.width = '100%';
    const cv = document.getElementById('dlgCara'); const ctx = cv.getContext('2d'); ctx.fillStyle = '#0e1530'; ctx.fillRect(0, 0, 64, 64); U.Render.iconoCanvas(cv, 'aldea', '#ffe14d');
    this.decir('Tu cama. Hoy es ' + U.Tiempo.diaTexto(E.reloj) + ', es ' + U.Tiempo.faseDe(U.Tiempo.hora(E)).nombre.toLowerCase() + ' (' + U.Tiempo.formato(E.reloj.minutos) + ') y el clima es ' + U.Clima.de(E).nombre.toLowerCase() + '. La alarma está fijada a las ' + U.Tiempo.formato(E.alarmaMin) + '. Dormir aquí te despierta con Vida y Esencia al 100%.');
    this.razon = 'La fogata avanza al siguiente momento; la CAMA duerme HASTA LA ALARMA y el calendario suma los días.';
    this.opciones = [
      { t: '⏰ Dormir hasta la alarma (' + U.Tiempo.formato(E.alarmaMin) + ')', cama: 'alarma' },
      { t: 'Dormir hasta el siguiente momento del día', cama: 'momento' },
      { t: 'Fijar la alarma a las 06:00', cama: 'fijar', min: 360 },
      { t: 'Fijar la alarma a las 07:00', cama: 'fijar', min: 420 },
      { t: 'Fijar la alarma a las 08:00', cama: 'fijar', min: 480 }
    ];
    this.pintarRazon(); this.pintarOpciones(); U.Audio.sfx('click');
  },
  elegirRegalo(o) {
    const E = U.Juego.estado, j = E.jugador, n = this.npc; this.modo = 'npc';
    if (!n || !o.cantidad) { this.decir('Otro día será.'); this.mostrarSecciones(n); return; }
    if ((j.monedas || 0) < o.cantidad) { this.decir('No traes ' + o.cantidad + ' 🪙.'); this.mostrarSecciones(n); return; }
    j.monedas -= o.cantidad;
    n.regaloDinero = n.regaloDinero || { paso: 0, total: 0 };
    const pasoVal = U.Economia.PASOS_REGALO[Math.min(n.regaloDinero.paso, 3)];
    let gan = Math.max(1, Math.min(pasoVal, Math.round(pasoVal * o.cantidad / 10)));
    gan = Math.min(gan, 20 - n.regaloDinero.total); if (gan < 0) gan = 0;
    n.regaloDinero.paso++; n.regaloDinero.total += gan;
    U.Economia.confianza(n, gan);
    if (!n.hechos) n.hechos = []; n.hechos.push('le regalaste dinero por sorpresa');
    this.decir(n.nombre + ' parpadea, sorprendido: «¿Para mí? …Gracias. De verdad.» (Regalo sorpresa: confianza +' + gan + ' · Bolsa: ' + Math.floor(j.monedas) + ' 🪙)');
    this.razon = 'Regalos de dinero a ' + n.nombre + ': +' + n.regaloDinero.total + '/20 de confianza solo por dinero'; this.pintarRazon();
    this.mostrarSecciones(n); this.pintarCara(); U.Audio.sfx('cura');
  },
  elegirCama(o) {
    const E = U.Juego.estado;
    if (o.cama === 'fijar') { E.alarmaMin = o.min; document.getElementById('dlgConfTxt').textContent = 'Alarma ' + U.Tiempo.formato(E.alarmaMin); this.decir('Despertador fijado a las ' + U.Tiempo.formato(E.alarmaMin) + '. Al dormir hasta la alarma despertarás a esa hora: hoy si aún no pasó; si ya pasó, mañana, y el calendario sumará el día.'); this.razon = 'Alarma actual: ' + U.Tiempo.formato(E.alarmaMin); this.pintarRazon(); U.Audio.sfx('unlock'); return; }
    this.cerrar();
    if (o.cama === 'alarma') U.Recuperacion.dormirEnCama(); else U.Recuperacion.descansarFogata();
  },
  // RENTAR UNA CASA: en los pueblos pequeños (y en Arcana) NO hay tienda de pociones;
  // la forma de recuperarse es rentar una casa por 15 🪙 la noche: pagas, duermes
  // dentro (misma secuencia que la fogata) y despiertas con Vida y Esencia al 100%.
  RENTA_PRECIO: 15,
  abrirRenta(obj) {
    const E = U.Juego.estado, j = E.jugador; this.npc = null; this.esCartel = false; this.modo = 'renta'; this.fase = 'normal'; this.abierto = true; this.rentaObj = obj; E.ui = 'dialogo'; E.jugador.descansando = false; E.jugador.cargando = false;
    document.getElementById('dialogo').classList.remove('oculto');
    document.getElementById('dlgNombre').textContent = 'CASA PARA RENTAR · ' + (obj.pueblo || 'PUEBLO').toUpperCase(); document.getElementById('dlgEmocion').textContent = 'renta'; document.getElementById('dlgConfTxt').textContent = '🪙 ' + Math.floor(j.monedas || 0) + ' · ' + this.RENTA_PRECIO + ' 🪙 la noche';
    document.getElementById('dlgConfianza').firstElementChild.style.width = '100%';
    const cv = document.getElementById('dlgCara'); const ctx = cv.getContext('2d'); ctx.fillStyle = '#0e1530'; ctx.fillRect(0, 0, 64, 64); U.Render.iconoCanvas(cv, 'aldea', '#ffd08a');
    this.decir('Una casa entera para ti, por una noche. En ' + (obj.pueblo || 'este pueblo') + ' no hay tienda de pociones: así se recuperan los viajeros aquí. Pagas ' + this.RENTA_PRECIO + ' 🪙, duermes en cama de verdad y despiertas con Vida y Esencia al 100%, como en tu casa o junto a la fogata. El reloj avanza al siguiente momento del día.');
    this.razon = 'Rentar = dormir al 100% por ' + this.RENTA_PRECIO + ' 🪙 · Bolsa: ' + Math.floor(j.monedas || 0) + ' 🪙';
    this.opciones = [
      { t: '🔑 Rentar la casa y dormir · ' + this.RENTA_PRECIO + ' 🪙', renta: 'pagar' },
      { t: 'Solo mirar la casa', renta: 'mirar' }
    ];
    this.pintarRazon(); this.pintarOpciones(); U.Audio.sfx('click');
  },
  elegirRenta(o) {
    const E = U.Juego.estado, j = E.jugador;
    if (o.renta === 'mirar') { this.decir('La casa huele a madera y a sopa de ayer. La puerta tiene un cartelito: «Se renta · ' + this.RENTA_PRECIO + ' 🪙 la noche · viajeros bienvenidos». Cuando el cuerpo te lo pida, aquí se duerme como en casa.'); this.razon = 'Bolsa: ' + Math.floor(j.monedas || 0) + ' 🪙'; this.pintarRazon(); U.Audio.sfx('click'); return; }
    if (E.enCombate) { this.decir('No puedes rentar una casa en mitad de una pelea.'); U.Audio.sfx('fail'); return; }
    if ((j.monedas || 0) < this.RENTA_PRECIO) { this.decir('La renta cuesta ' + this.RENTA_PRECIO + ' 🪙 y traes ' + Math.floor(j.monedas || 0) + '. Gana monedas con las misiones del tablón de la Oficina del Guardián (en Aldea de Bruma), la arena o el torneo… o descansa gratis junto a cualquier fogata.'); U.Audio.sfx('fail'); return; }
    j.monedas -= this.RENTA_PRECIO; E.flags.casasRentadas = (E.flags.casasRentadas || 0) + 1;
    const pueblo = (this.rentaObj && this.rentaObj.pueblo) || 'el pueblo';
    this.cerrar();
    U.HUD.toast('Casa rentada en ' + pueblo + ' por ' + this.RENTA_PRECIO + ' 🪙. Duermes en cama de verdad…', 'exito');
    U.Recuperacion.descansarFogata();
  },
  // ===== CRIATURAS SALVAJES AMISTOSAS: hablarles como a un NPC =====
  // Hablar y acariciar suben el VÍNCULO (la confianza de la criatura). Con 60+ se puede
  // proponer el CONTRATO DE SANGRE (máx. 3, para invocarla como compañera) y con el
  // vínculo al MÁXIMO (100) el CONTRATO DE ALMA: ritual + consentimiento mutuo, solo UNO
  // y cruza vidas (queda en el pasaporte). Todo vive en U.Criaturas; aquí solo se habla.
  abrirCriatura(c) {
    const E = U.Juego.estado; this.npc = null; this.criatura = c; this.esCartel = false; this.modo = 'criatura'; this.fase = 'normal'; this.abierto = true; E.ui = 'dialogo'; E.jugador.descansando = false; E.jugador.cargando = false;
    c.charlasSesion = 0;
    document.getElementById('dialogo').classList.remove('oculto');
    this.pintarCaraCriatura();
    const saludo = c.vinculo >= 60 ? 'te recibe como a un amigo: ya eres parte de su manada.' : c.vinculo >= 35 ? 'te reconoce y se acerca sin miedo.' : c.vinculo >= 15 ? 'te mira con curiosidad y no huye.' : 'te observa de lejos, todavía sin fiarse.';
    this.decir(U.Criaturas.nombreDe(c) + ' — ' + saludo + ' Es una criatura salvaje de ' + (U.Criaturas.REGION_NOMBRE[c.region] || 'esta región') + '. Las criaturas amistosas se vinculan hablando: cada charla tranquila sube su vínculo contigo.');
    this.razon = 'Vínculo ' + Math.round(c.vinculo) + '/100 · ' + U.Criaturas.nivelVinculo(c) + ' · Sangre a los 60 (máx. 3) · Alma a los 100 (solo UNA, con ritual y su consentimiento)';
    this.opciones = this.opcionesCriatura(c); this.pintarRazon(); this.pintarOpciones(); U.Audio.sfx('dialogo');
  },
  pintarCaraCriatura() {
    const c = this.criatura; if (!c) return;
    const cv = document.getElementById('dlgCara'); U.Render.caraBestia(cv, c);
    document.getElementById('dlgNombre').textContent = U.Criaturas.nombreDe(c).toUpperCase();
    const ch = document.getElementById('dlgEmocion'); ch.textContent = c.invocada ? 'tu compañera' : c.temperamento; ch.style.color = '#a7f3c9'; ch.style.borderColor = '#a7f3c9';
    document.getElementById('dlgConfTxt').textContent = 'Vínculo ' + Math.round(c.vinculo) + ' · ' + U.Criaturas.nivelVinculo(c);
    document.getElementById('dlgConfianza').firstElementChild.style.width = Math.max(0, Math.min(100, c.vinculo)) + '%';
  },
  opcionesCriatura(c) {
    const E = U.Juego.estado, j = E.jugador; const contrato = U.Criaturas.tieneContrato(c); const ops = [];
    ops.push({ t: 'Hablarle con calma (su vínculo sube)', cri: 'hablar' });
    ops.push({ t: 'Acariciarla / ofrecerle tu mano abierta', cri: 'acariciar' });
    if ((j.bolsaComida || []).length) ops.push({ t: '🍽 Ofrecerle una comida de tu mochila (' + j.bolsaComida.length + ')', cri: 'comida' });
    if (contrato && !c.invocada) ops.push({ t: '✦ Invocarla como tu compañera (te sigue y pelea a tu lado)', cri: 'invocar' });
    if (contrato && c.invocada) ops.push({ t: 'Despedirla (vuelve a su región)', cri: 'despedir' });
    if (!contrato && c.vinculo >= 60) ops.push({ t: '🩸 Proponer el CONTRATO DE SANGRE (invocarla · llevas ' + E.contratos.sangre.length + '/3)', cri: 'sangre' });
    if (!contrato || contrato === 'sangre') { if (c.vinculo >= 100 && !E.contratos.alma) ops.push({ t: '🕯 Proponer el CONTRATO DE ALMA (ritual + su consentimiento · solo UNO y cruza vidas)', cri: 'alma' }); }
    return ops;
  },
  elegirCriatura(o) {
    const E = U.Juego.estado, j = E.jugador, c = this.criatura; if (!c) { this.cerrar(); return; }
    const nombre = U.Criaturas.nombreDe(c);
    const refrescar = txt => { this.decir(txt); this.razon = 'Vínculo ' + Math.round(c.vinculo) + '/100 · ' + U.Criaturas.nivelVinculo(c); this.pintarRazon(); this.opciones = this.opcionesCriatura(c); this.pintarOpciones(); this.pintarCaraCriatura(); };
    if (o.cri === 'hablar') {
      if ((c.charlasSesion || 0) >= 3) { refrescar(nombre + ' ya charló bastante por ahora: bosteza y se acomoda. Déjala descansar y vuelve en otro momento: el vínculo crece con visitas, no con prisa.'); U.Audio.sfx('click'); return; }
      c.charlasSesion = (c.charlasSesion || 0) + 1;
      const gan = U.Criaturas.ganarVinculo(c, 7);
      const frases = ['le cuentas tu camino hasta aquí, despacio, y escucha con las orejas atentas.', 'le hablas de la Metrópolis y de las aldeas: mueve la cabeza como si entendiera cada nombre.', 'le cuentas una pelea tuya sin presumir: respira más tranquila a tu lado.', 'le hablas de nada importante, como se habla con un amigo, y se queda.'];
      refrescar('Le hablas con calma: ' + nombre + ' ' + frases[Math.floor(Math.random() * frases.length)] + ' (Vínculo +' + Math.round(gan) + ' → ' + Math.round(c.vinculo) + '/100)'); U.Audio.sfx('dialogo'); return;
    }
    if (o.cri === 'acariciar') {
      if (c.vinculo < 15) { U.Criaturas.ganarVinculo(c, 2); refrescar('Acercas la mano despacio y la retiras sin tocarla del todo: que huela tu intención primero. ' + nombre + ' no huye. Es un comienzo. (Vínculo +2 → ' + Math.round(c.vinculo) + ')'); U.Audio.sfx('click'); return; }
      const gan = U.Criaturas.ganarVinculo(c, 5);
      refrescar(nombre + ' se deja acariciar y cierra los ojos un momento. La confianza también se toca. (Vínculo +' + Math.round(gan) + ' → ' + Math.round(c.vinculo) + '/100)'); U.Audio.sfx('cura'); return;
    }
    if (o.cri === 'comida') {
      const sab = (j.bolsaComida || [])[0];
      if (sab == null) { refrescar('No llevas comida en la mochila. La tienda vende los 5 sabores a 10 🪙.'); U.Audio.sfx('fail'); return; }
      j.bolsaComida.splice(0, 1); const gan = U.Criaturas.ganarVinculo(c, 10);
      refrescar('Le ofreces tu comida ' + sab + ' y la come de tu mano, sin prisa. Compartir comida es el idioma más viejo del mundo. (Vínculo +' + Math.round(gan) + ' → ' + Math.round(c.vinculo) + '/100)'); U.Audio.sfx('cura'); return;
    }
    if (o.cri === 'sangre') {
      const r = U.Criaturas.formarSangre(c);
      if (r === 'lleno') { refrescar('Ya tienes 3 contratos de sangre (el máximo). El vínculo de sangre no da para más: despide o deja ir a otra compañera antes de atarte a una nueva.'); U.Audio.sfx('fail'); return; }
      if (r !== 'ok') { refrescar('Todavía no: el contrato de sangre pide un vínculo de 60 o más (llevas ' + Math.round(c.vinculo) + ').'); U.Audio.sfx('fail'); return; }
      refrescar('🩸 CONTRATO DE SANGRE con ' + nombre + ': una gota tuya y su aliento, nada más. Desde ahora puedes INVOCARLA como compañera desde este diálogo o desde Ajustes → Estadísticas. El contrato de sangre vive en ESTA vida (máximo 3).'); U.Audio.sfx('unlock'); if (U.Guardado) U.Guardado.guardarAuto(); return;
    }
    if (o.cri === 'alma') {
      this.decir('🕯 EL RITUAL DEL ALMA. Te arrodillas, respiras con ' + nombre + ' al mismo ritmo y le ofreces el vínculo más profundo que existe: no es de esta vida, es del USUARIO — cruza vidas, mundos y partidas, y solo puede existir UNO, jamás, con una sola criatura (las demás lo saben y lo respetan, celosas). Nada se firma: ella tiene que consentirlo libremente. ' + nombre + ' te mira largo…');
      this.razon = 'Contrato de alma: vínculo máximo (100) + ritual + consentimiento mutuo · solo UNO · cruza vidas';
      this.opciones = [
        { t: 'Completar el ritual: ' + (c.apodo || 'ella') + ' consiente libremente', cri: 'almaSi' },
        { t: 'Detener el ritual (todavía no)', cri: 'almaNo' }
      ];
      this.pintarRazon(); this.pintarOpciones(); U.Audio.sfx('yang'); return;
    }
    if (o.cri === 'almaNo') { refrescar('Detienes el ritual con respeto. ' + nombre + ' parpadea, tranquila: lo que no se consiente entero, no se hace. El vínculo sigue donde estaba.'); U.Audio.sfx('click'); return; }
    if (o.cri === 'almaSi') {
      const r = U.Criaturas.formarAlma(c);
      if (r === 'ocupado') { refrescar('Tu alma ya está atada a otra criatura: solo puede haber UN contrato de alma. Ella lo entiende y se aparta con dignidad.'); U.Audio.sfx('fail'); return; }
      if (r !== 'ok') { refrescar('El ritual no cuaja: el contrato de alma pide el vínculo al MÁXIMO (100). Llevas ' + Math.round(c.vinculo) + '.'); U.Audio.sfx('fail'); return; }
      refrescar('🕯 ¡CONTRATO DE ALMA con ' + nombre + '! Consintió libremente, mirándote a los ojos. Este vínculo no muere con esta vida: queda en tu pasaporte y te reconocerá en las vidas que vienen. Solo puede existir uno. Invócala cuando quieras: es tu compañera de alma.'); U.Audio.sfx('victoria'); if (U.Guardado) U.Guardado.guardarAuto(); return;
    }
    if (o.cri === 'invocar') { this.cerrar(); if (U.Criaturas.invocar(c)) U.HUD.toast('✦ ' + nombre + ' acude a tu lado: tu compañera de contrato te sigue y pelea contigo.', 'exito'); return; }
    if (o.cri === 'despedir') { U.Criaturas.despedir(c); refrescar('Despides a ' + nombre + ': vuelve caminando a su región. El contrato sigue: puedes invocarla de nuevo cuando quieras.'); U.Audio.sfx('click'); return; }
  },
  // ===== COFRE DE TU CASA: almacenamiento de máscaras y artefactos (U.Reliquias) =====
  // Lo guardado NO da bonus, pero tampoco atrae a Los Coleccionistas ni a los agentes
  // del sello: en casa todo está a salvo. Lo que llevas contigo (y la máscara puesta)
  // sí funciona… y sí te expone en las zonas salvajes.
  abrirCofre() {
    const E = U.Juego.estado; this.npc = null; this.esCartel = false; this.modo = 'cofre'; this.fase = 'normal'; this.abierto = true; E.ui = 'dialogo'; E.jugador.descansando = false; E.jugador.cargando = false;
    document.getElementById('dialogo').classList.remove('oculto');
    document.getElementById('dlgNombre').textContent = 'COFRE DE TU CASA · ALMACENAMIENTO'; document.getElementById('dlgEmocion').textContent = 'casa'; document.getElementById('dlgConfTxt').textContent = 'Guardar = sin bonus y sin riesgo';
    document.getElementById('dlgConfianza').firstElementChild.style.width = '100%';
    const cv = document.getElementById('dlgCara'); const ctx = cv.getContext('2d'); ctx.fillStyle = '#0e1530'; ctx.fillRect(0, 0, 64, 64); U.Render.iconoCanvas(cv, 'aldea', '#d9a441');
    const r = U.Reliquias.asegurar();
    this.decir('Tu cofre. Aquí guardas máscaras, artefactos y PERGAMINOS PROHIBIDOS: lo guardado NO da bonus, pero tampoco atrae a Los Coleccionistas ni a nadie — en casa, todo está a salvo. Lo que llevas contigo (y la máscara puesta, y un pergamino prohibido en la mochila) sí funciona… y sí se nota cuando cruzas zonas salvajes.');
    this.razon = 'Contigo: ' + (r ? (r.tenidas.length + r.artefactos.length) : 0) + ' objeto(s) · En el cofre: ' + (r ? r.casa.length : 0) + ' · Máscara puesta: ' + (r && r.puesta ? U.Reliquias.MASCARAS[r.puesta].nombre : 'ninguna');
    this.opciones = this.opcionesCofre(); this.pintarRazon(); this.pintarOpciones(); U.Audio.sfx('click');
  },
  opcionesCofre() {
    const R = U.Reliquias, r = R.asegurar(); const ops = [];
    if (!r) return ops;
    r.tenidas.forEach(id => { ops.push({ t: (r.puesta === id ? '🎭 Quitarte la ' : '🎭 Ponerte la ') + R.MASCARAS[id].nombre, cof: 'poner', id }); });
    r.tenidas.forEach(id => { ops.push({ t: '🏠 Dejar en el cofre: ' + R.MASCARAS[id].nombre, cof: 'dejar', id }); });
    r.artefactos.forEach(id => { ops.push({ t: '🏠 Dejar en el cofre: ' + R.ARTEFACTOS[id].nombre, cof: 'dejar', id }); });
    r.casa.forEach(id => { const d = R.defDe(id); if (d) ops.push({ t: '🎒 Recoger del cofre: ' + d.nombre, cof: 'recoger', id }); });
    if (U.Prohibidas) { const pp = U.Prohibidas.asegurar(); if (pp) { pp.pergaminos.forEach(id => { ops.push({ t: '🏠 Dejar en el cofre: Pergamino prohibido · ' + U.Prohibidas.DEFS[id].nombre, cof: 'dejarProh', id }); }); pp.casa.forEach(id => { ops.push({ t: '🎒 Recoger del cofre: Pergamino prohibido · ' + U.Prohibidas.DEFS[id].nombre, cof: 'recogerProh', id }); }); } }
    if (!ops.length) ops.push({ t: 'El cofre está vacío y no llevas nada que guardar (todavía)', cof: 'nada' });
    return ops;
  },
  elegirCofre(o) {
    const R = U.Reliquias; let msg = '…';
    if (o.cof === 'poner') { const r = R.asegurar(); msg = (r && r.puesta === o.id) ? R.quitar() : R.poner(o.id); }
    else if (o.cof === 'dejar') msg = R.dejarEnCasa(o.id);
    else if (o.cof === 'recoger') msg = R.recogerDeCasa(o.id);
    else if (o.cof === 'dejarProh') msg = U.Prohibidas ? U.Prohibidas.dejarEnCasa(o.id) : '…';
    else if (o.cof === 'recogerProh') msg = U.Prohibidas ? U.Prohibidas.recogerDeCasa(o.id) : '…';
    else if (o.cof === 'nada') msg = 'Las máscaras legendarias y los artefactos antiguos están escondidos en cuevas, ruinas y lugares difíciles del continente. Cuando tengas uno, aquí lo podrás guardar.';
    const r = R.asegurar();
    this.decir(msg);
    this.razon = 'Contigo: ' + (r ? (r.tenidas.length + r.artefactos.length) : 0) + ' objeto(s) · En el cofre: ' + (r ? r.casa.length : 0) + ' · Máscara puesta: ' + (r && r.puesta ? R.MASCARAS[r.puesta].nombre : 'ninguna');
    this.pintarRazon(); this.opciones = this.opcionesCofre(); this.pintarOpciones(); U.Audio.sfx('click');
  },
  mostrarTexto(titulo, texto) {
    const E = U.Juego.estado; this.npc = null; this.esCartel = true; this.abierto = true; E.ui = 'dialogo'; document.getElementById('dialogo').classList.remove('oculto');
    document.getElementById('dlgNombre').textContent = titulo; document.getElementById('dlgEmocion').textContent = 'aviso'; document.getElementById('dlgConfTxt').textContent = ''; document.getElementById('dlgConfianza').firstElementChild.style.width = '0%';
    const cv = document.getElementById('dlgCara'); const ctx = cv.getContext('2d'); ctx.fillStyle = '#0e1530'; ctx.fillRect(0, 0, 64, 64); U.Render.iconoCanvas(cv, 'aldea', '#d9a441');
    this.decir(texto); this.razon = ''; this.pintarRazon(); this.opciones = []; this.pintarOpciones(); U.Audio.sfx('click');
  },
  decir(t) {
    // La línea anterior pasa al historial (para releer la conversación) antes de
    // empezar a escribir la nueva con la máquina de escribir.
    if (this.textoCompleto) this._agregarHistorial(this.npc ? this.npc.nombre : (this.criatura ? U.Criaturas.nombreDe(this.criatura) : '·'), this.textoCompleto);
    const tono = this.npc ? U.Emociones.tonos[this.npc.emocion] : U.Emociones.tonos.neutral; this.textoCompleto = (U.Diccionario && t) ? U.Diccionario.expandir(t, this.npc) : t; this.mostrado = 0; this.vel = tono.vel * (this.npc && U.Personas ? (U.Personas.de(this.npc.id).ritmo || 1) : 1); const p = document.getElementById('dlgTexto'); p.textContent = ''; p.scrollTop = 0; p.style.color = this.npc ? tono.color : '#e8dcc8'; this._textoListo = false; this._pasoScroll = 0;
    const ch = document.getElementById('dlgCharla'); if (ch) ch.scrollTop = ch.scrollHeight;
  },
  _agregarHistorial(hablante, texto) {
    const h = document.getElementById('dlgHistorial'); if (!h) return;
    const d = document.createElement('div'); d.className = 'dlgHistLinea';
    const b = document.createElement('b'); b.textContent = hablante + ': ';
    const s = document.createElement('span'); s.textContent = texto;
    d.appendChild(b); d.appendChild(s); h.appendChild(d);
    while (h.children.length > 40) h.removeChild(h.firstChild);
    const ch = document.getElementById('dlgCharla'); if (ch) ch.scrollTop = ch.scrollHeight;
  },
  pintarCara() {
    const n = this.npc; if (!n) return; const cv = document.getElementById('dlgCara'); const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, 64, 64); U.Render.cara(ctx, n.id, n.emocion, 0, 0, 4);
    document.getElementById('dlgNombre').textContent = n.nombre.toUpperCase() + ' · ' + n.rol; const ch = document.getElementById('dlgEmocion'); ch.textContent = n.emocion; ch.style.color = U.Emociones.tonos[n.emocion].color; ch.style.borderColor = U.Emociones.tonos[n.emocion].color;
    document.getElementById('dlgConfTxt').textContent = 'Confianza ' + Math.round(n.estados.confianza); document.getElementById('dlgConfianza').firstElementChild.style.width = n.estados.confianza + '%';
  },
  pintarRazon() { document.getElementById('dlgRazon').textContent = this.razon; },
  refrescarScroll() {
    const c = document.getElementById('dlgOpciones'); const a = document.getElementById('dlgScrollAviso'); if (!c || !a) return;
    const t = document.getElementById('dlgCharla') || document.getElementById('dlgTexto'); const at = document.getElementById('dlgTextoAviso');
    if (!this._scrollLigado) { this._scrollLigado = true; c.addEventListener('scroll', () => this.refrescarScroll(), { passive: true }); if (t) t.addEventListener('scroll', () => this.refrescarScroll(), { passive: true }); window.addEventListener('resize', () => this.refrescarScroll()); }
    requestAnimationFrame(() => { const sobra = c.scrollHeight > c.clientHeight + 6; const falta = c.scrollHeight - c.scrollTop - c.clientHeight > 6; a.classList.toggle('visible', sobra && falta); if (t && at) { const sobraT = t.scrollHeight > t.clientHeight + 6; const faltaT = t.scrollHeight - t.scrollTop - t.clientHeight > 6; at.classList.toggle('visible', sobraT && faltaT); } });
  },
  pintarOpciones() {
    const c = document.getElementById('dlgOpciones'); c.innerHTML = '';
    const secBar = document.getElementById('dlgSecciones');
    if (this.esCartel) { if (secBar) secBar.innerHTML = ''; const b = document.createElement('button'); b.innerHTML = '<span class="k">1</span>Cerrar'; b.addEventListener('click', () => this.cerrar()); c.appendChild(b); c.scrollTop = 0; this.refrescarScroll(); return; }
    // Panel de NPC: secciones (Hablar / Acciones / Misiones) + sub-opciones de la
    // sección activa. Los demás modos (tienda, tablón, cama, cofre, criatura, sparring,
    // petición, regalo) siguen con la lista plana de siempre.
    if (this.modo === 'npc' && this.npc) {
      if (secBar) {
        secBar.innerHTML = '';
        const disp = this.fase === 'apertura' ? ['hablar'] : this.SECCIONES.filter(s => s.id !== 'misiones' || this._tieneMisiones(this.npc)).map(s => s.id);
        disp.forEach(id => {
          const s = this.SECCIONES.find(x => x.id === id);
          const b = document.createElement('button');
          b.textContent = s.t; b.className = 'dlgSec' + (this.seccion === id ? ' act' : '');
          b.addEventListener('click', () => { this.seccion = id; this.opciones = this.fase === 'apertura' ? this.opcionesApertura(this.npc) : this._opcionesSeccion(this.npc, id); this.pintarOpciones(); U.Audio.sfx('click'); });
          secBar.appendChild(b);
        });
      }
      this.opciones.forEach((o, i) => { const b = document.createElement('button'); b.innerHTML = '<span class="k">' + (i + 1) + '</span>' + o.t; b.addEventListener('click', () => this.elegir(i)); c.appendChild(b); });
      const s = document.createElement('button'); s.innerHTML = '<span class="k">' + (this.opciones.length + 1) + '</span>Cerrar'; s.addEventListener('click', () => this.cerrar()); c.appendChild(s);
      c.scrollTop = 0; this.refrescarScroll(); return;
    }
    if (secBar) secBar.innerHTML = '';
    this.opciones.forEach((o, i) => { const b = document.createElement('button'); b.innerHTML = '<span class="k">' + (i + 1) + '</span>' + o.t; b.addEventListener('click', () => this.elegir(i)); c.appendChild(b); });
    const s = document.createElement('button'); s.innerHTML = '<span class="k">' + (this.opciones.length + 1) + '</span>Despedirse'; s.addEventListener('click', () => this.cerrar()); c.appendChild(s);
    c.scrollTop = 0; this.refrescarScroll();
  },
  elegir(i) {
    const o = this.opciones[i]; if (!o) { this.cerrar(); return; }
    if (this.modo === 'cama') { this.elegirCama(o); return; }
    if (this.modo === 'criatura') { this.elegirCriatura(o); return; }
    if (this.modo === 'renta') { this.elegirRenta(o); return; }
    if (this.modo === 'cofre') { this.elegirCofre(o); return; }
    if (this.modo === 'pergamino') { if (U.Prohibidas) U.Prohibidas.elegirPergamino(o); return; }
    if (this.modo === 'tienda') { return; } // la tienda nueva se maneja con sus propios botones (pintarTienda)
    if (this.modo === 'tablon') { const respT = U.Juego.aceptarMision(o.tablonUid); this.modo = 'npc'; this.decir(respT); this.razon = ''; this.pintarRazon(); this.mostrarSecciones(this.npc); return; }
    if (this.modo === 'peticion') { this.elegirPeticion(o); return; }
    if (this.modo === 'regalo') { this.elegirRegalo(o); return; }
    if (this.modo === 'sparring') { if (o.spar === 'solo' || o.spar === 'a' || o.spar === 'b') { const bandoS = o.spar; this.cerrar(); U.Sparring.iniciar(bandoS); } else this.cerrar(); return; }
    if (this.modo === 'sparringFin') { this.cerrar(); return; }
    const n = this.npc; if (!n) { this.cerrar(); return; }
    if (this.fase === 'apertura') {
      const r = U.Emociones.evento(n, { realidad: o.realidad, energia: o.energia, etiqueta: o.et });
      if (!n.hechos) n.hechos = []; n.hechos.push('empezaste la charla con: ' + o.et); if (n.hechos.length > 8) n.hechos.shift();
      this.razon = 'Tú hablaste primero (' + o.et + ') · ' + n.nombre + ' ahora está ' + n.emocion + ' · Confianza ' + (r.delta >= 0 ? '+' : '') + r.delta.toFixed(1);
      this.fase = 'normal';
      this.decir(this.respuestaContextual(n, o.apertura)); this.pintarRazon(); this.mostrarSecciones(n); this.pintarCara(); U.Audio.sfx('dialogo'); return;
    }
    if (this.mostrado < this.textoCompleto.length) { this.mostrado = this.textoCompleto.length; document.getElementById('dlgTexto').textContent = this.textoCompleto; }
    const E = U.Juego.estado;
    // Sub-opciones sintéticas de las secciones (no existen como opción de guion):
    if (o.darComida || o.darRegalo) { this.elegirDar(n, o); return; }
    if (o.darSabor) { this._darComidaSabor(n, o.darSabor); this.mostrarSecciones(n); return; }
    if (o.charlar || o.pueblo || o.clima) {
      const r0 = U.Emociones.evento(n, { realidad: o.realidad, energia: o.energia, etiqueta: o.et });
      this.razon = n.nombre + ' te escucha · Confianza ' + (r0.delta >= 0 ? '+' : '') + r0.delta.toFixed(1) + ' · ahora está ' + n.emocion;
      const resp0 = o.charlar ? U.General.charlaContexto(n, E) : o.clima ? U.General.respuestaClima(n, E) : this.respuestaContextual(n, 'novedades');
      this.decir(resp0); this.pintarRazon(); this.pintarCara(); U.Audio.sfx('dialogo'); return;
    }
    const r = U.Emociones.evento(n, { realidad: o.realidad, energia: o.energia, etiqueta: o.et });
    const signo = r.delta >= 0 ? '+' : ''; this.razon = n.nombre + ' ' + (r.delta >= 0.3 ? 'confía más en ti' : r.delta <= -0.3 ? 'se ha incomodado' : 'te escucha') + ' · Confianza ' + signo + r.delta.toFixed(1) + ' · ahora está ' + n.emocion;
    const bien = n.estados.animo >= 45; let resp = bien ? o.resp.pos : o.resp.neg;
    if (o.accion && o.accion.indexOf('org') === 0 && U.Orgs) { const rOrg = U.Orgs.accion(o.accion, n); if (rOrg === '__cerrar__') return; if (typeof rOrg === 'string' && rOrg) resp = rOrg; }
    if (o.accion === 'pocion') { const jj = U.Juego.estado.jugador; jj.bolsaPociones = jj.bolsaPociones || []; if (n.stockPociones > 0 && jj.bolsaPociones.length < 3) { n.stockPociones--; jj.bolsaPociones.push({ tipo: 'vida', unidades: 50, precio: 0 }); U.Recuperacion.sincronizar(jj); resp += ' (Poción +50 recibida: la llevas en la mochila, ×' + jj.pociones + ')'; U.Audio.sfx('cura'); } else resp = n.stockPociones <= 0 ? 'Se me acabaron por hoy. Recuerda: tu Vida se recupera sola solo hasta el 25%; para despertar al 100%, duerme en la fogata.' : 'Tu mochila ya lleva 3 pociones. Úsalas primero.'; }
    if (o.accion === 'entrenar') { if (!n.entreno) { n.entreno = true; U.Crecimiento.estilo('yin', 1.5, 1); resp += ' (Estilo Yin +1.5)'; U.Audio.sfx('unlock'); } else resp = 'Ya entrenamos hoy. Sigue en la arena: el Yin crece golpeando, no hablando.'; }
    if (o.accion === 'entrenarYang') { const j = U.Juego.estado.jugador; if (j.estilos.yang >= 100) resp = 'Tu Yang ya está al máximo (100). De aquí en adelante, úsalo: crece lanzándolo.'; else if (U.Recuperacion.gastar(25)) { U.Crecimiento.estilo('yang', 1.2, 1); resp += ' (Yang ' + j.estilos.yang.toFixed(1) + (j.tieneYang ? '' : ' / ' + U.Habilidades.yangDespertar + ' para despertar') + ' · −25 Esencia)'; U.Audio.sfx('yang'); } else resp = 'Te falta Esencia (la sesión cuesta 25) o estás Agotado. Descansa junto a la fogata y vuelve: meditar descansando también entrena el Yang.'; }
    if (o.accion === 'reto') { const guiaR = n.id; if (!n.hechos) n.hechos = []; n.hechos.push('aceptaste su reto de combate'); this.cerrar(); U.Combate.iniciarReto(guiaR); return; }
    if (o.accion === 'entrenoGuia') { U.Juego.iniciarEntreno(n.id); resp += ' (Entrenamiento con guía iniciado: sigue el contador en pantalla)'; }
    if (o.accion === 'irTienda') { this.cerrar(); setTimeout(() => U.Dialogo.abrirTienda(), 60); return; }
    if (o.accion === 'torneo') { this.cerrar(); U.Combate.iniciarTorneo(); return; }
    if (o.accion === 'tablon') { this.abrirTablon(); return; }
    if (o.accion === 'regaloSorpresa') { this.modo = 'regalo'; this.decir('¿Cuánto le regalas a ' + n.nombre + '? (Regalo sorpresa, sin que te lo pidiera: la confianza sube por pasos — +8 la primera vez, +5, +3, +1 — con tope de +20 por persona solo por dinero. Dar de más no da más.)'); this.razon = 'Bolsa: ' + Math.floor(U.Juego.estado.jugador.monedas || 0) + ' 🪙'; this.pintarRazon(); this.opciones = [5, 10, 20, 50].filter(v => v <= Math.max(0, Math.floor(U.Juego.estado.jugador.monedas || 0))).map(v => ({ t: 'Regalar ' + v + ' 🪙', cantidad: v })); if (!this.opciones.length) this.opciones = [{ t: 'No traigo monedas encima', cantidad: 0 }]; this.pintarOpciones(); return; }
    if (o.accion === 'cumplirPromesa') { const jj2 = U.Juego.estado.jugador; const pr = (jj2.promesas || []).find(x => x.npcId === n.id); if (pr) { if ((jj2.monedas || 0) >= pr.cantidad) { jj2.monedas -= pr.cantidad; jj2.promesas = jj2.promesas.filter(x => x !== pr); U.Economia.confianza(n, 3); U.Economia.karmaAdd(3, U.Economia.puebloDeMapa(n.mapa)); resp = 'Promesa cumplida: le das las ' + pr.cantidad + ' 🪙. (Confianza +3 · Karma +3)'; if (!n.hechos) n.hechos = []; n.hechos.push('cumpliste tu promesa de dinero'); } else resp = 'Le prometiste ' + pr.cantidad + ' 🪙 y traes ' + Math.floor(jj2.monedas || 0) + '. Si pasa mañana sin cumplir, tu karma cae −5.'; } }
    if (o.accion === 'entregarMision') { resp = U.Juego.entregarMision(); }
    if (o.accion === 'arena') { const E = U.Juego.estado; if (E.objetivos[1].estado === 'actual') { E.objetivos[1].estado = 'hecho'; U.Juego.siguienteObjetivo(); } resp += ' (Objetivo actualizado)'; }
    if (n.id === 'torin' && o.et === 'pregunta' && !U.Juego.estado.jugador.tieneYang) resp += ' Y escucha: tu test no reveló afinidad Yang, pero no está cerrado: se alcanza entrenando, como dominar otro elemento. Medita al descansar o entrena conmigo hasta Yang ' + U.Habilidades.yangDespertar + ' y despertará.';
    if (o.accion === 'aprenderEscudo') { const j = U.Juego.estado.jugador;
      if (j.escudoAprendido) resp = 'Ya te enseñé el escudo y vas en el nivel ' + (j.escudoNv || 1) + ' (' + U.Habilidades.escudo.niveles[j.escudoNv || 1].nombre + '). Recuerda cómo funciona: un solo botón (B), la naturaleza de TU elemento, y la tabla de ventajas le pega como si fueras tú. ' + (j.elementoActivo === 'fuego' ? 'El tuyo es de FUEGO: quema, pero lo físico lo atraviesa, los rayos lo traspasan y el AGUA te lo apaga aunque traigas la Esencia llena: la Esencia se queda, el escudo no.' : j.elementoActivo === 'agua' ? 'El tuyo es de AGUA: amortigua lo físico, pero el RAYO pasa por el agua y te pega con ventaja (el escudo no se rompe, nomás no sirve contra eso). Contra Tierra aguantas bien: la piedra se amortigua.' : j.elementoActivo === 'tierra' ? 'El tuyo es CAPA DE ROCA: fuertísimo contra lo físico. Pero el AGUA lo erosiona: se vuelve lodo y se rompe más rápido.' : j.elementoActivo === 'viento' ? 'El tuyo es de VIENTO: no es un muro, es una corriente. DESVÍA proyectiles, pero cuerpo a cuerpo te entra casi todo. Úsalo contra tiradores, no contra puños.' : 'El tuyo es un CAMPO DE RAYO: castiga al que te toca cuerpo a cuerpo. Y ojo: el Agua y la Tierra le ganan en la tabla.') + ' Tu mismo elemento lo absorbe y te devuelve Esencia. Y {escudo_listo}: al nivel 1 solo cubre tu frente y no te deja moverte; bloqueando golpes subes: nivel 2, frente y lados; nivel 3, los cuatro lados.';
      else if (U.Combate.aprenderEscudo()) resp = 'Escucha, porque esto se aprende una vez y se domina en años. El escudo es una TÉCNICA: un solo botón (B) y toma la naturaleza de TU elemento, ' + U.Elementos.nombre(j.elementoActivo) + ' en tu caso. La tabla de ventajas le aplica como si el escudo fueras tú: tu contra te lo rompe o te lo atraviesa, y tu mismo elemento lo absorbe. Al principio solo te cubre DE FRENTE y no te deja moverte: si te pegan por la espalda, es como si no trajeras nada. Bloquea golpes reales y subirá: nivel 2 cubre frente y lados; nivel 3, los cuatro lados. Drena Esencia por segundo, menos si el clima favorece a tu elemento. Ahora practica: {escudo_listo}, y {tener_cuidado} con lo que venga por detrás.';
    }
    if (o.accion === 'aprenderBasico') { // BÁSICAS DE HECHICERO: en Arcana, con los hechiceros, en orden (Esteban te presenta; él no enseña, solo sabe dónde está cada uno)
      const j = U.Juego.estado.jugador; const sig = U.Habilidades.siguienteBasico(j);
      if (!sig) resp = 'Ya aprendiste las tres básicas: Sentido, Rastreo y Barrera mental. Con eso, las técnicas mayores del Arte Místico ya se te abren según tu camino (Mirada que Pesa con 1 básica, Prisión del Espejo con 2). La Invisibilidad no se enseña: solo la tienen los hechiceros del Escuadrón Gamma, y no es para ti.';
      else { const r = U.Habilidades.aprenderBasico(j, sig.id);
        if (r.ok) { U.Audio.sfx('unlock'); resp = 'Los hechiceros de Arcana te aceptan como aprendiz y te enseñan «' + sig.nombre + '»: ' + sig.desc + ' Básicas de hechicero: ' + r.basicos + '/3.' + (sig.id === 'sentido' ? ' Con 1 básica, la Mirada que Pesa ya es tuya: equípala en Pausa → Ajustes → Equipo (máx. 5).' : sig.id === 'rastreo' ? ' Con 2 básicas, la Prisión del Espejo ya es tuya: equípala en Pausa → Ajustes → Equipo (máx. 5).' : ' Las tres básicas son tuyas: ya dominas lo básico del Arte Místico. Las técnicas mayores se te abren según tu camino.') + ' Ser hechicero es casi otra vida: esto es solo el principio, y dominarlo de verdad toma años.';
          if (!n.hechos) n.hechos = []; n.hechos.push('te presentó a los hechiceros de Arcana para aprender ' + sig.nombre); }
        else resp = 'Los hechiceros niegan con la cabeza: ' + r.motivo + '.'; }
    }
    if (o.accion === 'despertarHechicero') { // DESPERTAR DE HECHICERO: momento de historia/diálogo con Vesper, no un grind ni una barrera nueva — marca j.hechicero.despertado = true (flag para uso futuro; no inventa efectos). No toca las 3 básicas: Esteban las sigue enseñando en orden.
      const j = U.Juego.estado.jugador; if (!j.hechicero) j.hechicero = { potencial: false, basicos: 0, basicas: [], despertado: false };
      if (j.hechicero.despertado) resp = 'Ya despertaste: el Arte Místico ya corre por ti. Lo demás —Sentido, Rastreo, Barrera mental— lo aprendes con los hechiceros de Arcana, en orden, y dominarlo de verdad toma años. Yo solo te abrí la puerta; el camino lo andas tú.';
      else { j.hechicero.despertado = true; U.Audio.sfx('unlock'); U.HUD.banner('✨ ¡DESPERTAR DE HECHICERO! · El Arte Místico ya corre por ti', 3); resp = 'Vesper pone una mano sobre tu frente y el mundo se queda en silencio un instante. «Listo. Ya no eres solo alguien que mira la mente: eres hechicero. El Arte Místico ya corre por ti, despacio, como un río bajo la tierra. Las tres básicas —Sentido, Rastreo y Barrera mental— las aprendes con los hechiceros de Arcana, en orden; yo te guiaré cuando las busques. Ser hechicero es casi otra vida: esto es solo el principio, y dominarlo de verdad toma años.»';
        if (!n.hechos) n.hechos = []; n.hechos.push('te despertó como hechicero'); }
    }
    if (o.accion === 'aprenderEspecial') { // TÉCNICA ESPECIAL de un Guía: minijuego de aprendizaje (U.Aprendizaje)
      const j = U.Juego.estado.jugador; const esp = (U.Habilidades.especiales || []).find(h => h.id === o.tecId);
      const tec = esp ? U.Habilidades.porId(j, 'especial:' + esp.id) : null;
      if (!esp) resp = 'Esa técnica no existe en mi lista. Dime otra cosa.';
      else if (!tec) resp = '«' + esp.nombre + '» es de ' + U.Elementos.nombre(esp.elemento) + ', y tu elemento es ' + U.Elementos.nombre(j.elementoActivo) + ': yo solo enseño técnicas especiales de TU elemento. Busca al Guía que enseñe las de ' + U.Elementos.nombre(j.elementoActivo) + '.';
      else if (U.Habilidades.aprendida(j, tec)) resp = 'Ya dominas «' + tec.nombre + '»: la demostración ya va a tu velocidad. Úsala en combate (Pausa → Ajustes → Equipo).';
      else { this.cerrar(); if (U.Aprendizaje) U.Aprendizaje.iniciar(esp.id, n.id); return; }
    }
    if (o.accion === 'aprenderPresentimiento') { // PRESENTIMIENTO (Sora): habilidad pasiva de Entre-Mundos, minijuego de aprendizaje (U.Aprendizaje)
      const j = U.Juego.estado.jugador;
      if (!U.Presentimiento) resp = 'El Presentimiento aún no está en este mundo. Dime otra cosa.';
      else if (U.Presentimiento.aprendido(j)) resp = 'Ya dominas el Presentimiento: el borde de la pantalla ya te avisa cuando algo hostil se acerca. Úsalo: es presencia, no ubicación — no te dice dónde está, solo que está.';
      else { const g = U.Presentimiento.puedeAprender(j); if (!g.ok) resp = g.motivo; else { this.cerrar(); if (U.Aprendizaje) U.Aprendizaje.iniciar('presentimiento', n.id); return; } }
    }
    if (o.accion === 'gustos') resp = U.Personas.presentarse(n);
    if (o.accion === 'saborFavorito') { const fav = U.Economia.favoritoNpc(n.id); resp = n.nombre + ' lo piensa y sonríe: «Mi sabor favorito es el ' + fav + '. Si algún día me traes una comida ' + fav + ', me haces el día.» (Darle el sabor que te PIDE da +5 de confianza; si además es su favorito, +8. Y su ánimo cambia según SU orden de sabores.)'; if (!n.hechos) n.hechos = []; n.hechos.push('te contó su sabor favorito: ' + fav); }
    if (o.accion === 'preguntarPor') { const t2 = U.Vida.buscar(o.target); resp = t2 ? U.Vida.respuestaDonde(n, t2) : 'No lo he visto hoy.'; if (!n.hechos) n.hechos = []; n.hechos.push('preguntaste por ' + (t2 ? t2.nombre : 'un vecino')); }
    this.decir(resp); this.pintarRazon(); this.pintarCara(); U.Audio.sfx('dialogo');
  },
  cerrar() { if (this.modo === 'sparring' && U.Sparring) U.Sparring.cancelarOferta(); this.abierto = false; this.npc = null; this.criatura = null; this.modo = 'npc'; this.fase = 'normal'; this.seccion = 'hablar'; this.textoCompleto = ''; const h = document.getElementById('dlgHistorial'); if (h) h.innerHTML = ''; document.getElementById('dialogo').classList.add('oculto'); if (U.Juego.estado.ui === 'dialogo') U.Juego.estado.ui = 'mundo'; U.Audio.sfx('click'); },
  tecla(num) { if (!this.abierto) return; if (this.esCartel) { this.cerrar(); return; } if (num <= this.opciones.length) this.elegir(num - 1); else this.cerrar(); },
  actualizar(dt) {
    if (!this.abierto) return;
    if (this.mostrado < this.textoCompleto.length) { this.mostrado = Math.min(this.textoCompleto.length, this.mostrado + this.vel * dt); document.getElementById('dlgTexto').textContent = this.textoCompleto.slice(0, Math.floor(this.mostrado)); if (Math.random() < dt * 8) U.Audio.sfx('dialogo'); const paso = Math.floor(this.mostrado / 30); if (paso !== this._pasoScroll) { this._pasoScroll = paso; this.refrescarScroll(); } const ch = document.getElementById('dlgCharla'); if (ch) ch.scrollTop = ch.scrollHeight; }
    else if (!this._textoListo) { this._textoListo = true; this.refrescarScroll(); }
    if (this.npc) this.pintarCara();
  }
};
