/* === js/datos/diccionario.js === */
/* Unipar — DICCIONARIO DE VARIANTES: que los textos no suenen siempre igual.
   Investigado antes de programarlo, y hecho de forma INTELIGENTE, no palabra por palabra a ciegas:
   en español sustituir palabras sueltas rompe género, número y conjugación («brincar alto» no admite
   cualquier cambio: «saltar» sí encaja, pero un adjetivo suelto puede dejar la frase coja). Por eso:
   1) Las frases se escriben con RANURAS {así}, y cada ranura solo admite sustitutos que encajan
      gramaticalmente en ESE hueco (frases verbales completas o palabras de la misma categoría).
   2) Solo entran al diccionario las palabras/frases que SÍ tienen buen sustituto; el resto queda fijo.
   3) La elección es DETERMINISTA por personaje y por conversación (hash de npc + nº de charla):
      el mismo NPC no repite siempre la misma forma, pero tampoco cambia a mitad de una frase.
   4) El tono manda: hay ranuras por registro (neutro / brusco / amable) para que un arrogante
      no hable como un amable. U.Dialogo.decir() expande las ranuras al mostrar el texto. */
window.U = window.U || {};

U.Diccionario = {
  // Cada ranura: lista de formas INTERCAMBIABLES en ese hueco exacto (misma función gramatical).
  ranuras: {
    brincar_alto: ['brincar alto', 'saltar alto', 'dar un salto bien alto', 'brincar hasta arriba', 'pegar un brinco alto'],
    brincar: ['brincar', 'saltar', 'dar brincos', 'pegar saltos'],
    entrenar_fuerte: ['entrenar fuerte', 'entrenar en serio', 'darle duro al entrenamiento', 'entrenar hasta sudar'],
    descansar_bien: ['descansar bien', 'descansar como se debe', 'echarte un buen descanso', 'recuperarte bien'],
    tener_cuidado: ['ten cuidado', 'cuídate', 've con cuidado', 'no te confíes'],
    mirar_bien: ['mira bien', 'fíjate bien', 'abre bien los ojos', 'pon atención'],
    volver_pronto: ['vuelve pronto', 'regresa cuando puedas', 'pásate seguido', 'no tardes en volver'],
    pelear_bien: ['pelear bien', 'defenderte bien', 'plantarte bien en una pelea'],
    dia_lindo: ['qué día tan lindo', 'qué buen día hace', 'un día de esos que levantan el ánimo'],
    animo: ['ánimo', 'con todo', 'sin miedo'],
    de_verdad: ['de verdad', 'en serio', 'sin exagerar'],
    escudo_listo: ['levanta el escudo a tiempo', 'pon el escudo antes del golpe', 'cúbrete con el escudo a tiempo']
  },
  // Registro por tipo de personalidad (U.Personas.tipo): matiza las despedidas y los ánimos.
  registroDe(npc) {
    if (!npc || !U.Personas) return 'neutro';
    const t = (U.Personas.de(npc.id).tipo || '').toLowerCase();
    if (t.indexOf('brusco') >= 0 || t.indexOf('rudo') >= 0 || t.indexOf('arrogante') >= 0) return 'brusco';
    if (t.indexOf('amable') >= 0 || t.indexOf('maternal') >= 0 || t.indexOf('inocente') >= 0) return 'amable';
    return 'neutro';
  },
  despedidas: {
    neutro: ['Cuídate en los caminos.', 'Nos vemos por la plaza.', 'Que te vaya bien.'],
    brusco: ['Ya. A moverte.', 'Menos charla y más camino.', 'Ve. Y no vuelvas golpeado.'],
    amable: ['Cuídate mucho, ¿sí?', 'Vuelve cuando quieras, aquí estoy.', 'Que el camino te trate bien.']
  },
  hash(s) { let h = 2166136261; s = String(s || ''); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); },
  elegir(lista, clave) { if (!lista || !lista.length) return ''; return lista[this.hash(clave) % lista.length]; },
  // Expande las ranuras {nombre} de un texto. Sin ranuras, el texto pasa intacto.
  expandir(texto, npc) {
    if (!texto || texto.indexOf('{') < 0) return texto;
    const claveBase = (npc ? npc.id + ':' + (npc.veces || 0) + ':' : 'sin-npc:') + texto.length;
    return texto.replace(/\{([a-z_]+)\}/g, (m, nombre) => {
      const lista = this.ranuras[nombre];
      return lista ? this.elegir(lista, claveBase + ':' + nombre) : m;
    });
  },
  despedida(npc) { return this.elegir(this.despedidas[this.registroDe(npc)], (npc ? npc.id + ':' + (npc.veces || 0) : 'x') + ':despedida'); }
};

/* ===== U.General: saludo y charla conscientes del contexto (momento · clima · fecha) =====
   U.General vive en js/datos/personas.js (que no se toca): aquí solo se AMPLÍA.
   Momentos REALES del juego (U.Tiempo.faseDe): madrugada 00–04 · amanecer 04–08 ·
   mañana 08–12 · tarde 12–16 · atardecer 16–20 · noche 20–00. En Atardecer y de
   Noche NUNCA se dice «buen día»: al atardecer «ya cae el sol», de noche «¿qué haces
   fuera?». La fecha que existe en el juego es día de la semana + nº de día
   (U.Tiempo.diaTexto) y calendario semanal (U.Tiempo.CALENDARIO): mercado en un pueblo
   cada día, Torneo de Bruma el sábado en la arena y festival nocturno el domingo; el
   saludo y la charla los nombran de vez en cuando (fraseEvento). Los tipos de clima
   reales son los de U.Clima.TIPOS (despejado, nublado, lluvia, tormenta, viento, niebla, calor):
   no existe un tipo «frío» — el frío es temperatura numérica —, pero se deja una
   entrada «frio» por si algún día aparece como tipo. */
if (U.General) {
  // Respuesta al clima con respaldo por PERSONALIDAD: es la misma lógica que la
  // versión de personas.js, con un paso extra — si el archivo del NPC no trae frase
  // propia para ese clima, cae a la variante por registro (amable/brusco/neutro) en
  // vez de a la frase general plana, para que un amable y un arrogante nunca digan
  // lo mismo ante la misma lluvia.
  U.General.respuestaClima = function (npc, E) {
    const tipo = E.clima ? E.clima.tipo : 'despejado';
    if ((tipo === 'lluvia' || tipo === 'tormenta') && U.Clima && U.Clima.esInterior(E)) { const inten = U.Clima.intensidadGuardada(E); const nom = U.Clima.INTENSIDAD_NOMBRES[inten] || ''; return 'Afuera hay ' + (tipo === 'tormenta' ? 'tormenta' : 'lluvia ' + nom) + ', se oye en el techo… pero aquí dentro estamos secos: bajo techo no llueve.'; }
    const per = U.Personas.de(npc.id);
    const propias = per && per.frases ? per.frases[tipo] : null;
    if (propias && propias.length) return propias[(npc.veces || 0) % propias.length];
    const reg = U.Diccionario ? U.Diccionario.registroDe(npc) : 'neutro';
    const porReg = this.climaRegistro[tipo] ? this.climaRegistro[tipo][reg] : null;
    if (porReg && porReg.length) return U.Diccionario.elegir(porReg, npc.id + ':' + tipo + ':' + (npc.veces || 0));
    const gen = this.clima[tipo] || this.clima.despejado;
    return gen[Math.floor(Math.random() * gen.length)];
  };

  Object.assign(U.General, {
    saludosMomento: {
      amanecer: { palabra: 'Buenos días',
        neutro: ['Buenos días. El sol apenas asoma y la aldea despierta.', 'Buenos días, que el amanecer te agarre despierto.'],
        amable: ['Buenos días, qué alegría verte tan temprano.', 'Buenos días. El amanecer huele a nuevo, ¿no crees?'],
        brusco: ['Buenos días. Temprano y ya dando vueltas.', 'Amanecer: a trabajar, que el día no espera.'] },
      manana: { palabra: 'Buenos días',
        neutro: ['Buenos días. La plaza ya está despierta.', 'Buenos días. La mañana es para los encargos.'],
        amable: ['Buenos días. Qué mañana tan bonita para verte por aquí.', 'Buenos días, ¿cómo amaneciste?'],
        brusco: ['Buenos días. Si vienes a charlar, que sea corto.', 'Mañana: habla claro y no me hagas perder el día.'] },
      tarde: { palabra: 'Buenas tardes',
        neutro: ['Buenas tardes. La tarde avanza tranquila.', 'Buenas tardes. Ya falta menos para recogerse.'],
        amable: ['Buenas tardes. Qué tarde tan bonita para pasear un rato.', 'Buenas tardes, ¿cómo va tu día?'],
        brusco: ['Buenas tardes. Queda poco día: úsalo o piérdelo.', 'Tardes. Di lo que tengas que decir.'] },
      atardecer: { palabra: 'Buenas tardes',
        neutro: ['Buenas tardes, ya cae el sol. En un rato la aldea se recoge.', 'Ya está anocheciendo. Buenas tardes.'],
        amable: ['Buenas tardes. Ya cae el sol, qué bonito se pone el cielo…', 'Ya está anocheciendo. Quédate un rato, que la tarde está preciosa.'],
        brusco: ['Ya cae el sol. Habla rápido, que yo me recojo pronto.', 'Atardecer. Lo que no hiciste hoy, mañana.'] },
      noche: { palabra: 'Buenas noches',
        neutro: ['Buenas noches. De noche la aldea duerme.', 'Buenas noches. Habla bajito, que la aldea duerme.'],
        amable: ['Buenas noches… ¿todo bien? A estas horas casi todos estamos en casa.', 'Es de noche ya. ¿Quieres resguardarte un rato?'],
        brusco: ['Buenas noches… ¿o es que no tienes casa a la que volver?', 'De noche no se charla: se duerme o se vigila.'] }
    },
    // De noche casi todos están en sus casas (los NPCs se meten en casa al caer la noche): si hablas
    // con uno, lo primero que te dice es qué haces fuera. Cada registro a su manera.
    saludoNoche: {
      neutro: ['Es de noche, ¿qué haces fuera? Casi todos estamos en casa a estas horas.', 'Buenas noches. De noche la aldea se recoge: yo debería estar en casa, como todos.', 'Es de noche. Los bandidos salen de noche, ¿lo sabías? Ten cuidado.'],
      amable: ['Es de noche, ¿qué haces fuera? Entra, que de noche salen los bandidos y no quiero que te pase nada.', 'Buenas noches… ¿todo bien? A estas horas casi todos estamos en casa.', 'Es de noche ya. ¿Quieres resguardarte un rato? Aquí dentro estás seguro.'],
      brusco: ['¿Qué haces fuera a estas horas? De noche ni los guardias pasean por gusto.', 'Es de noche. Si vienes a molestar, que sea rápido.', '¿Fuera a estas horas? Eres más terco que valiente.']
    },
    // Charla por momento: lo que se comenta a esa hora, según la personalidad.
    charlaMomento: {
      madrugada: {
        neutro: ['De madrugada la aldea duerme: silencio, estrellas y algún perro a lo lejos.'],
        amable: ['De madrugada todo duerme… hasta las estrellas parecen susurrar bajito.'],
        brusco: ['Madrugada. La aldea duerme y yo también debería. Habla rápido.'] },
      amanecer: {
        neutro: ['El amanecer trae la aldea de vuelta: puertas, humo y pasos.'],
        amable: ['Qué bonito amanecer. Todo empieza otra vez, ¿verdad?'],
        brusco: ['Amanecer: trabajo y cero quejas.'] },
      manana: {
        neutro: ['La mañana es para los encargos: la plaza ya anda en lo suyo.'],
        amable: ['La mañana está para disfrutarla despacio.'],
        brusco: ['Mañana: si no trabajas, estorbas.'] },
      tarde: {
        neutro: ['La tarde avanza tranquila: ya falta menos para recogerse.'],
        amable: ['Qué tarde tan bonita para pasear un rato.'],
        brusco: ['Tarde: queda poco día, úsalo o piérdelo.'] },
      atardecer: {
        neutro: ['Ya está anocheciendo: en un rato la aldea se mete en casa.'],
        amable: ['Mira ese cielo… el atardecer siempre me pone contenta.'],
        brusco: ['Ya cae el sol. Lo que no hiciste hoy, mañana.'] },
      noche: {
        neutro: ['De noche la aldea duerme. Yo debería estar en casa, como todos.'],
        amable: ['Es de noche… me quedo un rato más, pero no tardes tú tampoco.'],
        brusco: ['De noche no se charla: se duerme o se vigila.'] }
    },
    // Cola corta de clima para la charla (el comentario largo con personalidad vive en
    // respuestaClima; aquí solo el toque que hace la charla congruente con el clima).
    climaCorto: {
      despejado: 'El cielo está limpio, se ve todo.',
      nublado: 'Las nubes tapan el sol, pero no llueve.',
      lluvia: 'Y llueve: los caminos se vuelven barro.',
      tormenta: 'Y con esta tormenta, mejor bajo techo.',
      viento: 'Y este viento no deja quieto a nadie.',
      niebla: 'Y con esta niebla no se ve ni la plaza.',
      calor: 'Y este calor no da tregua.',
      frio: 'Y este frío corta el aire.'
    },
    // Variante por PERSONALIDAD para cada clima (respaldo cuando el archivo del NPC no
    // trae frase propia): la misma lluvia la comenta distinto un amable que un arrogante.
    climaRegistro: {
      despejado: {
        neutro: ['Cielo claro: hoy todo se ve de lejos.', 'Día despejado. Así da gusto salir.'],
        amable: ['Qué día tan bonito. Así da gusto salir.', 'Cielo limpio… un día así levanta el ánimo a cualquiera.'],
        brusco: ['Día claro. Hasta yo saludo contento. Casi.', 'Despejado. Día de trabajo, sin excusas.'] },
      nublado: {
        neutro: ['Está nublado. No llueve, pero el cielo anda pensativo.', 'Con este nublado no se sabe si va a llover o no.'],
        amable: ['Nublado y tranquilo. Día de té y de calma.', 'Las nubes cuidan del sol. Nosotros, de nosotros.'],
        brusco: ['Nublado. Ni el cielo se decide hoy.', 'Gris. Ni sol ni lluvia: día de trabajar igual.'] },
      lluvia: {
        neutro: ['Llueve. A mojarse o a guardarse.', 'La lluvia no perdona: los caminos se vuelven barro.'],
        amable: ['¿Quieres resguardarte? Llueve y no quiero que te enfermes.', 'Llueve… quédate un rato, que aquí dentro estás seco.'],
        brusco: ['¿Vienes a mojarte como un tonto? La lluvia no espera a nadie.', 'Lluvia. Mal día para entrenar y para todo lo demás.'] },
      tormenta: {
        neutro: ['Tormenta. Mejor no andar lejos de un techo.', 'Los truenos se oyen hasta en los huesos.'],
        amable: ['La tormenta me pone nerviosa… quédate cerca, es más seguro.', 'Truenos… respira conmigo, ya pasa.'],
        brusco: ['Tormenta. Que el cielo gruña: yo no me muevo de mi puesto.', 'Si un rayo quiere problemas, que baje.'] },
      viento: {
        neutro: ['Qué viento. Agárrate el sombrero y las ideas.', 'Hoy el aire no deja quieto a nadie.'],
        amable: ['Qué viento… agárrate, pero sin miedo.', 'El viento mueve todo. Ven, que aquí no te lleva.'],
        brusco: ['El viento me despeina la guardia. Molesto, pero aguanto.', 'Viento. Los novatos ni se paran firmes. Yo sí.'] },
      niebla: {
        neutro: ['Niebla espesa. No se ve ni la otra orilla.', 'Con esta niebla hay que andar despacio y de memoria.'],
        amable: ['La niebla me da un poco de miedo, pero aquí estoy.', 'Con niebla habla bajito: todo se escucha raro.'],
        brusco: ['Niebla. Los cobardes se esconden en ella. Yo no.', 'No veo al enemigo: mejor. Así entreno el oído.'] },
      calor: {
        neutro: ['Qué calor hace. El sol pega sin pedir permiso.', 'Con este calor hay que buscar sombra y agua.'],
        amable: ['Qué calor… busca sombra y toma agua, ¿sí?', 'Con este calor hasta el agua pide agua. Cuídate.'],
        brusco: ['¿Calor? Esto es clima de CAMPEONES. A mí el sol me respeta.', 'Calor: el metal obedece y la gente también. A trabajar.'] },
      frio: {
        neutro: ['Hace frío. El aire corta.', 'Frío… abrígate o lo pagas mañana.'],
        amable: ['Qué frío… abrígate bien, ¿sí?', 'Con este frío, un té caliente es lo primero.'],
        brusco: ['¿Frío? Abrígate y deja de temblar.', 'Frío. El que se queja, se congela.'] }
    },
    // Frases de CALENDARIO (U.Tiempo.CALENDARIO): se nombran de vez en cuando, con el
    // registro del NPC (amable/brusco/neutro). {pueblo} es el pueblo del mercado.
    frasesEvento: {
      mercadoHoy: {
        neutro: ['Hoy es día de mercado en {pueblo}: la plaza anda llena.', 'Hoy hay mercado en {pueblo}. Los puestos ya están puestos.'],
        amable: ['Hoy hay mercado en {pueblo}, ¿ya viste los puestos? Qué bonito se pone.', 'Hoy es día de mercado en {pueblo}. Si vas, prueba de todo, ¿sí?'],
        brusco: ['Hoy es mercado en {pueblo}. Si vas, que sea rápido: la plaza está hasta arriba.', 'Mercado hoy en {pueblo}. Compra o no estorbes.'] },
      mercadoManana: {
        neutro: ['Mañana es día de mercado en {pueblo}.', 'Mañana toca mercado en {pueblo}: la plaza se llena.'],
        amable: ['Mañana hay mercado en {pueblo}. Te va a gustar, ya verás.', 'Mañana es día de mercado en {pueblo}. Ven temprano, que lo bueno se acaba.'],
        brusco: ['Mañana hay mercado en {pueblo}. Ve temprano o no vayas.', 'Mañana: mercado en {pueblo}. No me pidas que te acompañe.'] },
      torneoHoy: {
        neutro: ['Hoy es el torneo en la arena: empieza al atardecer.', 'Hoy hay torneo en la arena. Al atardecer empieza.'],
        amable: ['Hoy es el torneo en la arena… ¡qué emoción! Empieza al atardecer, no te lo pierdas.', 'Hoy hay torneo. Si vas a la arena, te veo por ahí.'],
        brusco: ['Hoy hay torneo en la arena. Al atardecer. O peleas o miras, pero no estorbes.', 'Torneo hoy. En la arena, al atardecer. Lo demás es ruido.'] },
      torneoManana: {
        neutro: ['Mañana es el torneo en la arena.', 'Mañana toca torneo en la arena: empieza al atardecer.'],
        amable: ['Mañana es el torneo en la arena. ¡Ya quiero que llegue!', 'Mañana hay torneo. Descansa hoy, que mañana se pelea.'],
        brusco: ['Mañana: torneo en la arena. Prepárate o ni vayas.', 'Mañana hay torneo. Afila lo que tengas que afilar.'] },
      festivalHoy: {
        neutro: ['Esta noche es el festival: la aldea se queda despierta.', 'Hoy hay festival nocturno. Esta noche nadie duerme temprano.'],
        amable: ['¡Esta noche es el festival! Quédate, que se pone precioso.', 'Hoy es el festival nocturno. Luces, música y toda la aldea despierta.'],
        brusco: ['Esta noche hay festival. Ruido hasta tarde, ya te aviso.', 'Festival hoy, de noche. Si no te gusta el ruido, métete en casa.'] },
      festivalManana: {
        neutro: ['Mañana es el festival nocturno.', 'Mañana toca festival: de noche la aldea no duerme.'],
        amable: ['¡Mañana es el festival nocturno! Qué ganas tengo.', 'Mañana hay festival. Guarda fuerzas para la noche.'],
        brusco: ['Mañana: festival nocturno. Ruido y gente hasta tarde.', 'Mañana hay festival. Duerme hoy, que mañana no se duerme.'] }
    },
    // Pueblo del NPC: el de su mapa (vía U.Economia.puebloDeMapa) o, si su mapa no es
    // un pueblo, el pueblo donde está el jugador. Devuelve el nombre tal como figura
    // en U.Tiempo.CALENDARIO.MERCADO, o null si no es pueblo de mercado.
    puebloDeNpc(npc, E) {
      if (!U.Economia || !U.Economia.PUEBLOS) return null;
      const nombrar = k => (k && U.Economia.PUEBLOS[k]) || null;
      if (npc && npc.mapa) { const n = nombrar(U.Economia.puebloDeMapa(npc.mapa)); if (n && U.Tiempo && U.Tiempo.CALENDARIO.MERCADO.indexOf(n) >= 0) return n; }
      const n2 = nombrar(U.Economia.puebloActual());
      if (n2 && U.Tiempo && U.Tiempo.CALENDARIO.MERCADO.indexOf(n2) >= 0) return n2;
      return null;
    },
    // Frase del próximo evento del calendario (hoy o mañana) para el pueblo del NPC:
    // mercado en su pueblo, torneo o festival. Vacía si no hay evento hoy ni mañana.
    fraseEvento(npc, E) {
      if (!U.Tiempo || !U.Tiempo.proximoEvento || !E || !E.reloj) return '';
      const pueblo = this.puebloDeNpc ? this.puebloDeNpc(npc, E) : null;
      const ev = U.Tiempo.proximoEvento(E, pueblo);
      if (!ev || ev.dias > 1) return '';
      const reg = U.Diccionario ? U.Diccionario.registroDe(npc) : 'neutro';
      const clave = (npc ? npc.id : 'x') + ':evento:' + ev.tipo + ':' + ev.dias + ':' + (E.reloj.dia || 1);
      const tabla = this.frasesEvento[ev.tipo + (ev.dias === 0 ? 'Hoy' : 'Manana')];
      if (!tabla) return '';
      const lin = tabla[reg] || tabla.neutro;
      return U.Diccionario.elegir(lin, clave).replace(/\{pueblo\}/g, ev.pueblo || '');
    },
    // Saludo consciente del contexto: dado el NPC (su personalidad), el momento, el
    // clima y la fecha, devuelve { palabra, frase }. Nunca «buen día» en Atardecer/Noche.
    saludoContexto(npc, E) {
      const h = U.Tiempo ? U.Tiempo.hora(E) : 9;
      const mom = U.Tiempo ? U.Tiempo.faseDe(h) : { id: 'manana', nombre: 'Mañana' };
      const reg = U.Diccionario ? U.Diccionario.registroDe(npc) : 'neutro';
      const clave = (npc ? npc.id : 'x') + ':' + mom.id + ':' + (E && E.reloj ? E.reloj.dia : 1);
      if (mom.id === 'noche' || mom.id === 'madrugada') {
        const lin = this.saludoNoche[reg] || this.saludoNoche.neutro;
        let frase = U.Diccionario.elegir(lin, clave);
        // De noche también se nombra el calendario de vez en cuando (sobre todo el
        // festival, que es nocturno): solo el evento, sin la fecha plana.
        if (U.Tiempo && E && E.reloj && U.Diccionario.hash(clave + ':fecha') % 3 === 0) { const ev = this.fraseEvento(npc, E); if (ev) frase += ' ' + ev; }
        return { palabra: 'Buenas noches', frase: frase };
      }
      const tabla = this.saludosMomento[mom.id] || this.saludosMomento.manana;
      const lin = tabla[reg] || tabla.neutro;
      let frase = U.Diccionario.elegir(lin, clave);
      // Fecha (día de la semana + nº de día, lo que el juego sí lleva): se nombra de
      // vez en cuando; si hoy o mañana hay un evento del calendario (mercado en el
      // pueblo del NPC, torneo o festival), se nombra el evento en vez de la fecha.
      if (U.Tiempo && E && E.reloj && U.Diccionario.hash(clave + ':fecha') % 3 === 0) { const ev = this.fraseEvento(npc, E); frase += ' ' + (ev || ('Hoy es ' + U.Tiempo.diaTexto(E.reloj) + '.')); }
      return { palabra: tabla.palabra, frase: frase };
    },
    // Charla consciente del contexto: momento (con su personalidad) + clima actual.
    charlaContexto(npc, E) {
      const h = U.Tiempo ? U.Tiempo.hora(E) : 9;
      const mom = U.Tiempo ? U.Tiempo.faseDe(h) : { id: 'manana', nombre: 'Mañana' };
      const reg = U.Diccionario ? U.Diccionario.registroDe(npc) : 'neutro';
      const tabla = this.charlaMomento[mom.id] || this.charlaMomento.manana;
      const lin = tabla[reg] || tabla.neutro;
      const clave = (npc ? npc.id : 'x') + ':charla:' + mom.id + ':' + (E && E.reloj ? E.reloj.dia : 1);
      const tipo = E && E.clima ? E.clima.tipo : 'despejado';
      const cola = this.climaCorto[tipo] || this.climaCorto.despejado;
      let frase = U.Diccionario.elegir(lin, clave) + ' ' + cola;
      // Calendario: si hoy o mañana hay un evento (mercado en el pueblo del NPC,
      // torneo o festival), se nombra de vez en cuando, igual que la fecha en el saludo.
      if (U.Tiempo && E && E.reloj && U.Diccionario.hash(clave + ':fecha') % 3 === 0) { const ev = this.fraseEvento(npc, E); if (ev) frase += ' ' + ev; }
      return frase;
    }
  });
}
