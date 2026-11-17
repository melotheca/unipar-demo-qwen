/* === js/sistemas/organizaciones.js === */
/* Unipar — DISEÑO ABIERTO + LAS TRES ORGANIZACIONES CRIMINALES.
   El mundo NO tiene final ni cadena lineal: las organizaciones no existen para el
   jugador al empezar (nadie las nombra, nada las anuncia). Se descubren hablando:
   cualquier vecino suelta RUMORES vagos (sin nombres); con 2 pistas de una misma
   organización, el jugador la IDENTIFICA y su nombre entra en sus objetivos.
   Cada una tiene su gente, su misión de investigación y su trama, y el jugador
   puede investigarla, combatirla o UNIRSE a ella (una sola a la vez). Lograrlo
   no acaba el juego: es un objetivo cumplido entre otros, y el mundo sigue. */
window.U = window.U || {};

U.Orgs = {
  DEFS: {
    mano: { nombre: 'LOS QUE DRENAN DOMINIO', corto: 'los que drenan dominio', color: '#8b93a3',
      resumen: 'Drenan el dominio de un elemento de quienes lo dominan y los dejan VACÍOS, sin su poder; se les reconoce por el GUANTE NEGRO. Su líder quiere absorber el dominio de los 5 elementos. SU NOMBRE VERDADERO AÚN NO SE CONOCE: en los rumores se les dice «los que drenan dominio» y algunos usan «El Abismo» como etiqueta tentativa, nada más. DESDE SU PUNTO DE VISTA: no buscan el poder por ambición, buscan el CONTROL de todo el dominio porque así aseguran que NO haya guerras — si ellos controlan todo el poder, nadie más puede iniciar una guerra, y la tensión entre aldeas se apaga. Cuanto más crece TU dominio, más te quieren a ti.' },
    jade: { nombre: 'LA RED DE JADE', corto: 'la Red de Jade', color: '#67e08a',
      resumen: 'Cazadores que capturan criaturas raras y poderosas para venderlas y sacarles su poder. Su objetivo final es EL ANCESTRO: la primera criatura, ancestro de todas, que vive en el mundo de los espíritus y recuerda todos los mundos. Quieren su poder PARA LA HUMANIDAD, no para la selva. DESDE SU PUNTO DE VISTA: las criaturas son peligrosas y capturarlas protege a la gente; ellos no matan, capturan.' },
    cole: { nombre: 'LOS COLECCIONISTAS', corto: 'los Coleccionistas', color: '#d9a441',
      resumen: 'Roban artefactos, fragmentos del meteorito y llaves del sello para venderlos… y TAMBIÉN coleccionan TÉCNICAS PROHIBIDAS y cosas raras o peligrosas parecidas: pergaminos raros, objetos peligrosos y conocimiento prohibido. Buscan, roban y VENDEN técnicas prohibidas: dicen que las están «preservando», pero en la práctica se las venden por dinero a quien pague — coleccionistas, criminales, cualquiera. No son peleadores de élite: tienen INFORMANTES en cada pueblo que les avisan en cuanto aparece una técnica prohibida (u otra cosa rara), y su líder es un coleccionista rico que quiere las piezas más valiosas del continente — incluida la leyenda: el pergamino de LAS PUERTAS DEL INFIERNO. DESDE SU PUNTO DE VISTA: los artefactos y las técnicas son historia y ellos los están PRESERVANDO — pagan por ellos, y los dueños (ruinas, templos) no los aprecian: ahí están tirados, sin uso.' }
  },
  RUMORES: {
    mano: [
      'Se dice que dos dominadores de pueblos lejanos «perdieron» su elemento de un día para otro. No murieron: quedaron… vacíos. Caminan y comen, pero ya no pueden ni encender una chispa. Nadie vio quién fue.',
      'Hay quien jura que los que dominan un elemento están desapareciendo sin dejar rastro. Ni pelea ni cuerpo: solo su casa vacía y una silla volcada.',
      'Un viajero contó que un hombre con un GUANTE NEGRO en una mano le preguntó cuánto dominio tenía… y se fue sonriendo. Desde entonces duerme con la puerta atrancada.'
    ],
    jade: [
      'Junto al Lago Brisa Azul aparecieron trampas y jaulas vacías, de las caras. Alguien caza criaturas raras por encargo, y paga bien por no hacer preguntas.',
      'Dicen que hay cazadores que solo buscan criaturas «especiales»: las que casi nadie ha visto. Las comunes ni las miran.',
      'Un pescador vio redes de un verde brillante, como de jade, colgadas a secar lejos del puerto. Al día siguiente ya no estaban.'
    ],
    cole: [
      'A un viajero le robaron una reliquia vieja en el camino y, a la semana, alguien en la Metrópolis preguntaba cuánto valdría «una pieza así». Mucha casualidad.',
      'Cuentan que en cada pueblo hay alguien que apunta qué casas guardan cosas antiguas… y a quién le llegan visitas. Nadie sabe para quién apunta.',
      'Las piezas antiguas están desapareciendo de los pueblos, una a una, sin romper ni una puerta. Como si supieran exactamente dónde mirar.',
      'Dicen que los Coleccionistas ahora también buscan TÉCNICAS PROHIBIDAS: pergaminos raros, conocimiento peligroso, cosas que ningún Guía enseñaría. Pagan mucho por un pergamino prohibido, sin preguntar de dónde salió.',
      'Si tienes una técnica prohibida, no se lo digas a nadie: en cada pueblo hay un informante de los Coleccionistas, y en cuanto aparece una, ellos ya lo saben. Te la quitan en el camino o te la compran… tú eliges cómo la pierdes.',
      'La leyenda que persiguen todos: LAS PUERTAS DEL INFIERNO, la técnica prohibida con la que Orión selló a El Infernal y se selló a sí mismo. Los Coleccionistas la buscan como la pieza más valiosa que existe… pero nadie sabe dónde está el pergamino, ni si existe.'
    ]
  },
  // LA ORGANIZACIÓN SECRETA: NO TIENE NOMBRE y no se le pone ninguno. Pequeña y secreta,
  // liderada por el COMPAÑERO de El Infernal. Al principio NADIE sabe de ella: sin rumores.
  SECRETA: {
    lider: 'El compañero de El Infernal: un ser de otro planeta que vive mucho más que los humanos. La edad lo ha debilitado, pero sigue siendo fuerte comparado con cualquier humano — y débil comparado con El Infernal. Él está detrás del debilitamiento del sello, tratando de liberar a El Infernal.',
    escuadrones: {
      alfa: { nombre: 'Alfa', rol: 'Proteger', tecnicas: ['Escudo de [Elemento]', 'Barrera', 'Muro'] },
      beta: { nombre: 'Beta', rol: 'Misiones peligrosas', tecnicas: ['Golpe Fuerte', 'Explosión', 'Asalto'] },
      gamma: { nombre: 'Gamma', rol: 'Investigar', tecnicas: ['Invisibilidad', 'Rastreo', 'Sentido'], nota: 'Son hechiceros (Arte Místico / Mente): por eso tienen Invisibilidad.' }
    },
    resumen: 'Una organización pequeña y secreta, SIN NOMBRE, liderada por el compañero de El Infernal, con pocos aliados. Al principio nadie sabe de ella. Solo cuando avanzas mucho empiezan a llegar rumores; con el tiempo se hace más fuerte, y cada organización que frenas la alimenta: muchos desertores de las otras se pasan a ella. Al final se vuelve la MÁS PODEROSA y busca traer de vuelta a El Infernal.'
  },
  RUMORES_TENSION: [
    'Entre aldeas ya no se miran como antes. No es guerra, ni de cerca… pero hay desconfianza: que si el agua, que si los caminos, que si quién tiene más dominadores.',
    'En el mercado se comenta bajito: dos aldeas se pelearon por unos recursos y nadie quiso ceder. Tensión de la fea, de la que se queda flotando en el aire.',
    'Dicen que cada aldea anda contando a sus dominadores, como quien cuenta soldados sin decirlo. A mí eso me pone la piel rara.',
    'Un primo de otra aldea vino de visita y en toda la cena no se habló de dominio. Antes eso no pasaba. Algo se está tensando entre los pueblos.',
    'Hay quien dice que si nadie pone orden, la tensión entre aldeas un día va a estallar en guerra. Y hay quien escucha eso… demasiado interesado.'
  ],
  RUMORES_SECRETA: [
    'Un viajero juró que en el camino lo siguieron sin hacer ruido y que, al voltear, no había nadie. Ni insignia, ni nombre, nada. Todavía le tiembla la voz.',
    'Cuentan que hay escuadrones que actúan en silencio: unos protegen algo que nadie ve, otros golpean y desaparecen, y otros investigan sin ser vistos. Nadie sabe de quién son.',
    'Gente de las organizaciones que alguien frenó desapareció de los caminos… y no volvió a su casa. Alguien los está recogiendo, y cada vez son más.',
    'Ya se dice en voz muy baja: hay una organización sin nombre que hoy es la más poderosa del continente, y su líder no es de este planeta. Dicen que trabaja en secreto sobre el sello… para traer de vuelta a El Infernal.'
  ],
  nuevoEstado() {
    const base = () => ({ pistas: 0, descubierta: false, unido: false, detenida: false, mision: 0, spawned: false, emboscadas: 0 });
    return { mano: base(), jade: base(), cole: base(), secreta: { poderExtra: 0, rumores: 0, frenadasVistas: 0 }, cd: 0 };
  },
  asegurar() {
    const E = U.Juego.estado; if (!E) return null;
    if (!E.orgs) E.orgs = this.nuevoEstado();
    ['mano', 'jade', 'cole'].forEach(k => { if (!E.orgs[k]) E.orgs[k] = { pistas: 0, descubierta: false, unido: false, detenida: false, mision: 0, spawned: false, emboscadas: 0 }; });
    if (E.orgs.cd == null) E.orgs.cd = 0;
    if (!E.orgs.secreta) E.orgs.secreta = { poderExtra: 0, rumores: 0, frenadasVistas: 0 };
    return E.orgs;
  },
  de(org) { const O = this.asegurar(); return O ? O[org] : null; },
  objetivoDe(org) { const E = U.Juego.estado; return E && E.objetivos ? E.objetivos.find(o => o.orgId === org) : null; },
  maxMaestria(j) { let m = 0; U.Elementos.ids.forEach(id => { m = Math.max(m, j.maestria[id] || 0); }); return m; },
  descubrir(org) {
    const o = this.de(org); if (!o || o.descubierta) return;
    o.descubierta = true;
    U.HUD.banner('🕵 ORGANIZACIÓN DESCUBIERTA · ' + this.DEFS[org].nombre, 3);
    U.HUD.toast(this.DEFS[org].resumen + ' (Nuevo objetivo en tu panel OBJETIVO: detenerla… o unirte a ella. El juego no termina con eso: es un objetivo entre otros.)', 'aviso');
    U.Audio.sfx('unlock');
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  frenadas() { const O = this.asegurar(); if (!O) return 0; return ['mano', 'jade', 'cole'].filter(k => O[k] && O[k].detenida).length; },
  poderSecreta() {
    const E = U.Juego.estado; if (!E || !E.jugador) return 0; const O = this.asegurar(); if (!O) return 0;
    const dia = E.reloj ? (E.reloj.dia || 1) : 1;
    const p = (O.secreta.poderExtra || 0) + this.frenadas() * 22 + Math.max(0, dia - 4) * 2 + Math.floor(this.maxMaestria(E.jugador) / 25) * 3;
    return Math.max(0, Math.min(100, Math.round(p)));
  },
  // Los rumores de la secreta SOLO llegan cuando el jugador ha avanzado MUCHO:
  // frenó al menos a una organización con dominio/días de camino, a dos, o dominó mucho.
  secretaDesbloqueada() {
    const E = U.Juego.estado; if (!E || !E.jugador) return false;
    const fr = this.frenadas(); const mm = this.maxMaestria(E.jugador); const dia = E.reloj ? (E.reloj.dia || 1) : 1;
    return fr >= 2 || (fr >= 1 && (mm >= 35 || dia >= 8)) || (mm >= 70 && dia >= 10);
  },
  rumorTension(npc) {
    const E = U.Juego.estado;
    const txt = this.RUMORES_TENSION[((npc.veces || 0) + (E.reloj ? E.reloj.dia : 1)) % this.RUMORES_TENSION.length];
    return npc.nombre + ' baja un poco la voz, sin alarma pero sin sonreír: «' + txt + '»';
  },
  rumorSecreta(npc) {
    const O = this.asegurar(); const etapa = Math.max(0, Math.min(3, (O.secreta.rumores || 1) - 1));
    const txt = this.RUMORES_SECRETA[etapa];
    return npc.nombre + ' mira a los lados dos veces antes de hablar: «' + txt + '» (Esto no es como lo demás: de ESTO casi nadie sabe nada. No tiene nombre.)';
  },
  darPista(org, n) {
    const o = this.de(org); if (!o) return;
    o.pistas += (n || 1);
    if (!o.descubierta) { if (o.pistas >= 2) this.descubrir(org); else U.HUD.toast('🔎 Pista registrada: algo se mueve en la sombra (1/2 para identificarlo). Sigue hablando con la gente, sobre todo con quien investiga.', 'aviso'); }
  },
  rumor(npc) {
    const O = this.asegurar(); if (!O) return 'Sin novedades.';
    const E = U.Juego.estado;
    // ORG SECRETA: sus rumores solo existen si ya avanzaste mucho (ver secretaDesbloqueada).
    if (this.secretaDesbloqueada() && ((npc.veces || 0) % 4) === 3) return this.rumorSecreta(npc);
    // ESCONDITES SECRETOS: de vez en cuando el rumor es de un escondite concreto.
    if (U.Escondites && ((npc.veces || 0) % 5) === 2) { const rh = U.Escondites.rumorEscondite(npc); if (rh) return rh; }
    // TENSIÓN ENTRE ALDEAS: trasfondo de bajo nivel, presente desde el principio.
    if (((npc.veces || 0) % 3) === 1) return this.rumorTension(npc);
    const pendientes = ['mano', 'jade', 'cole'].filter(k => !O[k].descubierta);
    if (!pendientes.length) { if (this.secretaDesbloqueada()) return this.rumorSecreta(npc); return npc.nombre + ' baja la voz: «¿Lo raro? Ya no es rumor: ya sabes lo que se mueve por el continente. Lo que hagas con eso es cosa tuya: investigarlo, pelearlo o unirte. Yo, ni sé nada.»'; }
    const org = pendientes[((npc.veces || 0) + (E.reloj ? E.reloj.dia : 1)) % pendientes.length];
    const lista = this.RUMORES[org];
    const txt = lista[(npc.veces || 0) % lista.length];
    this.darPista(org, 1);
    return npc.nombre + ' mira a los lados y baja la voz: «' + txt + '» (Pista anotada en tu cabeza: habla con más gente —y con quien INVESTIGA, como Vera en la Metrópolis— para atar cabos.)';
  },
  unirse(org, npc) {
    const O = this.asegurar(); const o = O[org];
    if (!o.descubierta) return 'Todavía no sabes ni a qué te unirías: es solo un rumor con guante, redes o monedas. Descúbrelo primero (pistas hablando con la gente) y luego hablamos.';
    if (o.detenida) return 'Esa organización ya cayó: no queda nadie a quien unirse.';
    const otra = ['mano', 'jade', 'cole'].find(k => k !== org && O[k].unido);
    if (otra) return 'Ya estás dentro de ' + this.DEFS[otra].nombre + '. Las organizaciones no comparten gente: abandona la tuya antes de entrar en otra.';
    if (o.unido) return 'Ya estás dentro de ' + this.DEFS[org].nombre + '. Lo tuyo ya no es investigar: es obedecer… y callar.';
    o.unido = true;
    U.HUD.banner('🤝 TE UNISTE A ' + this.DEFS[org].nombre, 2.6); U.Audio.sfx('unlock');
    if (U.Guardado) U.Guardado.guardarAuto();
    return 'Hecho. Desde hoy eres de ' + this.DEFS[org].nombre + '. Nadie en los pueblos debe saberlo: sigue tu vida normal por fuera y, por dentro, ya tienes bando. (Objetivo cumplido a TU manera: el mundo sigue, y puedes abandonarlos cuando quieras hablando con los suyos.)';
  },
  salir(org) {
    const o = this.de(org); if (!o || !o.unido) return 'No estás dentro de ' + this.DEFS[org].nombre + ': no hay nada que abandonar.';
    o.unido = false; U.HUD.toast('Abandonaste ' + this.DEFS[org].nombre + '. Susurran que nadie sale del todo… pero tú ya no eres de los suyos.', 'aviso'); U.Audio.sfx('click');
    return 'Te vas. Sin ceremonia y sin testigos: así se sale de ' + this.DEFS[org].nombre + '. Si algún día quieres volver, ellos decidirán si te creen.';
  },
  colocarReliquia() {
    const E = U.Juego.estado; if (!E || !E.mapa) return;
    if (!E.mapa.objetos.some(o => o.tipo === 'reliquia')) E.mapa.objetos.push({ tipo: 'reliquia', x: 89, y: 249, w: 1, h: 1, solido: false });
  },
  pelear(npc) {
    const E = U.Juego.estado, j = E.jugador; if (!E) return '__cerrar__';
    let e = null;
    if (npc.id === 'dario') { e = U.Combate.crearEnemigo('veterano', j.x + 2.5, j.y, E.dificultad * 1.15); e.nombre = 'Dario · élite del guante negro'; e.guanteNegro = true; e.esOrg = 'dario'; }
    else if (npc.id === 'sana') { e = U.Combate.crearEnemigo('chaman', j.x + 2.5, j.y, E.dificultad * 1.1); e.nombre = 'Sana · cazadora de la Red de Jade'; e.esOrg = 'sana'; }
    if (e) { E.enemigos.push(e); U.Combate.particulas(e.x, e.y - 0.5, 14, '#8b93a3', 'humo'); }
    U.Dialogo.cerrar();
    U.HUD.banner('⚔ ¡PELEA!', 1.6); U.Audio.sfx('oleada');
    return '__cerrar__';
  },
  // Acciones de diálogo de las organizaciones (o.accion empieza por 'org').
  accion(a, npc) {
    const E = U.Juego.estado, j = E.jugador; const O = this.asegurar(); if (!O) return '…';
    const mano = O.mano, jade = O.jade, cole = O.cole;
    switch (a) {
      case 'orgRumor': return this.rumor(npc);
      case 'orgVeraMano': {
        if (mano.detenida) return 'Vera cierra la libreta: «El emisario de los que drenan dominio cayó gracias a ti. Los dominadores vuelven a dormir tranquilos… por ahora. Su líder sigue ahí fuera, eso sí: esto no era el final de nada, era un caso. Habrá más.»';
        if (mano.mision === 0) { mano.mision = 1; this.darPista('mano', 1); return 'Vera abre su libreta: «Llevo meses con esto: dominadores que aparecen VACÍOS, sin su elemento, sin recordar la noche. Nadie pelea con ellos: los drenan. Hay un testigo vivo en la Aldea de Bruma: BRAM, era dominador de Tierra. Ve y escucha lo que le pasó. Luego vuelve: ataremos cabos.» (Misión abierta: habla con Bram en Bruma.)'; }
        if (mano.mision === 1) return '«Bram está en la Aldea de Bruma, junto a la plaza. Escúchalo: su testimonio es la primera pieza sólida. Y cuidado con lo que cuentas por ahí: si lo que creo es cierto, ellos también escuchan.»';
        if (mano.mision === 2) return '«El del guante negro merodea PUEBLO TRES CRUCES, en el camino del noreste. Es uno de ellos, seguro. Confróntalo: vivo o a golpes, pero que hable. Y ojo: cuanto más crece TU dominio, más te quieren a ti. Ya debes de olerles a banquete.»';
        if (mano.mision === 3) { mano.mision = 4; mano.detenida = true; j.monedas = (j.monedas || 0) + 100; U.HUD.banner('🖤 CASO CERRADO · EL EMISARIO DE LOS QUE DRENAN DOMINIO HA CAÍDO · +100 🪙', 3); U.Audio.sfx('victoria'); return 'Vera escribe la última línea y cierra la libreta: «Cayó el emisario. Los suyos se repliegan: por ahora nadie más amanecerá vacío. Cobras 100 🪙 de los fondos de la investigación. El líder sigue libre y el mundo sigue girando: esto fue UN objetivo, no el final. Gracias.»'; }
        return '«Sin novedades nuevas. Sigue con tu vida: entrenar, viajar, pelear… y si oyes un rumor raro, ya sabes dónde encontrarme.»';
      }
      case 'orgBram': {
        this.darPista('mano', 1);
        if (mano.mision === 1) { mano.mision = 2; U.HUD.toast('Testimonio de Bram anotado: vuelve con Vera a la Metrópolis.', 'exito'); return 'Bram tarda en hablar, pero habla: «Fue de noche. Una mano con un GUANTE NEGRO en mi hombro, una voz cortés… y sentí cómo me DRENABAN el dominio, gota a gota, hasta amanecer VACÍO, sin mi elemento. No me robaron nada que se vea: me robaron A MÍ. Eran varios, todos con el guante. Uno dijo: “uno menos para el que los tendrá todos”.» Sus manos tiemblan sobre las rodillas. (Vera querrá oír esto: vuelve con ella.)'; }
        return 'Bram mira sus manos: «No levanto ni una piedra desde aquella noche. Si los ves —guante negro, voz cortés—, no dejes que te toquen el hombro. A mí nadie me creyó hasta que apareció el segundo vacío.»';
      }
      case 'orgDarioGuante': {
        this.darPista('mano', 1);
        return 'Dario se mira la mano izquierda, enguantada de negro, y sonríe sin prisa: «¿El guante? Una costumbre. Hay manos que se guardan para un solo trabajo en la vida. La mía espera a alguien con mucho, mucho dominio… ¿Cuánto llevas tú, viajero?» Su cortesía da más miedo que un grito. Y añade, casi amable: «No somos ladrones de poder. Somos el freno. Mientras cada aldea tenga sus dominadores habrá tensión, roces por los recursos y por el dominio… y un día, guerra. Si UN solo control guarda todo el dominio, nadie podrá empezar una guerra. Piénsalo antes de juzgarnos.»';
      }
      case 'orgDarioUnirse': return this.unirse('mano', npc);
      case 'orgDarioPelear': {
        if (mano.mision === 2) mano.mision = 2.5;
        return this.pelear(npc);
      }
      case 'orgVeraJade': {
        if (jade.detenida) return 'Vera sonríe: «La jaula del lago quedó vacía y la criatura, libre. La Red de Jade sigue existiendo —y El Ancestro sigue a salvo en el mundo de los espíritus—, pero este golpe lo sintieron. Un objetivo más, cumplido. El mundo no se acabó: sigue.»';
        if (jade.mision === 0) { jade.mision = 1; this.darPista('jade', 1); return 'Vera pasa una página: «Segundo caso: junto al LAGO BRISA AZUL hay trampas y JAULAS para criaturas raras. Alguien las captura vivas y las vende. Su cazadora se llama SANA y merodea la orilla sur del lago. Ve allí: si encuentras la jaula, libérala; si te ven, pelea. Yo marco el punto: la orilla sur del lago, cerca de Sana.» (Misión abierta: ve a la orilla sur del Lago Brisa Azul.)'; }
        if (jade.mision === 1) return '«La orilla sur del Lago Brisa Azul: busca la jaula entre los juncos. Los cazadores no la dejan sola. Y piensa: si venden criaturas normales a ese precio… ¿cuánto vale la primera de todas? Ellos también lo han pensado.»';
        if (jade.mision === 2) { jade.mision = 3; jade.detenida = true; j.monedas = (j.monedas || 0) + 80; U.HUD.banner('🪤 JAULA VACÍA · LA RED DE JADE PIERDE SU PRESA · +80 🪙', 3); U.Audio.sfx('victoria'); return 'Vera asiente, satisfecha: «Criatura libre y cazadores en fuga. La Red lo pagará caro: esa presa valía una fortuna. Cobras 80 🪙. Su gran objetivo sigue siendo EL ANCESTRO, la primera criatura, la que recuerda todos los mundos… pero hoy duerme a salvo. Gracias, de nuevo.»'; }
        return '«Sin novedades de la Red por ahora. Si ves redes verdes como jade, ya sabes.»';
      }
      case 'orgSanaJaulas': {
        this.darPista('jade', 1);
        return 'Sana señala el lago con la barbilla: «¿Las jaulas? Trabajo. Criaturas raras, vivas, bien pagadas. Las comunes no valen el cebo. ¿Las especiales? Esas valen pueblos enteros. Y hay UNA que vale más que todas: la primera, la que recuerda… pero esa no vive en este mundo, así que no es asunto tuyo.» Se le escapa una sonrisa: ha hablado de más. «Y que conste: no matamos, capturamos. Una criatura rara y poderosa suelta es un peligro para cualquier pueblo; capturada, su poder sirve a la gente, no a la selva.»';
      }
      case 'orgSanaUnirse': return this.unirse('jade', npc);
      case 'orgSanaPelear': return this.pelear(npc);
      case 'orgMiloCompra': {
        this.darPista('cole', 1);
        if (cole.mision === 0) { cole.mision = 1; this.colocarReliquia(); return 'Milo baja la voz hasta casi desaparecer: «¿Comprar sin preguntar? Hay UNA anticuaria en ARCANA, Petra, que paga en el acto… pero el dinero de verdad viene de arriba: un señor rico de la Metrópolis que colecciona lo más valioso del continente. Y escucha, entre nosotros: hace días robaron una RELIQUIA a un viajero y la escondieron por el OASIS DEL DESIERTO DE SAL, esperando comprador. Si la encuentras… tú decides a quién se la llevas.» (Hay una reliquia escondida junto al oasis del Desierto de Sal.)'; }
        return 'Milo se encoge de hombros: «Yo solo corro encargos. Que si una reliquia apareció por el oasis… que si Petra paga sin preguntar… yo no sé nada. Y tú tampoco, ¿verdad?»';
      }
      case 'orgPetraVender': {
        if (cole.mision === 2) { cole.mision = 3; j.monedas = (j.monedas || 0) + 150; U.HUD.banner('✦ RELIQUIA VENDIDA · +150 🪙', 2.6); U.Audio.sfx('victoria'); return 'Petra examina la reliquia con guantes blancos y los ojos brillantes: «Auténtica. Antigua. Exactamente lo que mi comprador sueña. 150 🪙, sin preguntas, como siempre.» La guarda bajo llave antes de que termines de contar las monedas. (Resolviste lo de la reliquia a tu manera: el mundo sigue, y ahora ellos saben tu nombre.)'; }
        if (cole.detenida) return 'Petra sirve té con manos temblorosas: «Desde que devolviste aquella reliquia, mi comprador no me habla. No sé si darte las gracias o cobrarte el té.»';
        if (cole.mision === 0) { cole.mision = 1; this.colocarReliquia(); this.darPista('cole', 1); return 'Petra sonríe de medio lado: «¿Vender? Claro que compro. De hecho… circula una pieza robada, escondida por el OASIS DEL DESIERTO DE SAL, y mi comprador la quiere. Tráemela y te pago 150 🪙 sin una sola pregunta. O llévala a las autoridades, si tu conciencia cotiza más alto que eso. Los artefactos son historia, viajero: en las ruinas están tirados, sin que nadie los mire. Nosotros los preservamos… y pagamos por ellos.»'; }
        return 'Petra tamborilea sobre el mostrador: «La reliquia del oasis, viajero. Mi oferta sigue: 150 🪙. La conciencia, que yo sepa, no paga rentas.»';
      }
      case 'orgPetraProh': {
        this.darPista('cole', 1);
        const pP = U.Prohibidas ? U.Prohibidas.asegurar() : null;
        if (pP && pP.pergaminos.length) { const idP = pP.pergaminos[0]; const dP = U.Prohibidas.DEFS[idP]; pP.pergaminos.splice(0, 1); if (pP.encontradas.indexOf(idP) < 0) pP.encontradas.push(idP); j.monedas = (j.monedas || 0) + 220; U.HUD.banner('💀 PERGAMINO PROHIBIDO VENDIDO · +220 🪙', 2.6); U.Audio.sfx('victoria'); if (U.Guardado) U.Guardado.guardarAuto(); return 'Petra ni parpadea: descorre la cortina, pesa el pergamino de ' + dP.nombre + ' con la mirada y pone 220 🪙 sobre el mostrador. «Técnicas prohibidas, pergaminos raros, conocimiento peligroso… mi comprador lo llama PRESERVAR la historia. Yo lo llamo negocio: se vende a quien pague, coleccionista o criminal. Tú no viste nada, yo no compré nada.» (Vendiste el pergamino: ya no lo llevas encima, así que en zonas salvajes nadie te perseguirá por él. Lo aprendido, eso sí, no se vende: el conocimiento se queda contigo.)'; }
        return 'Petra baja la voz y la cortina a la vez: «¿Pergaminos prohibidos? Mi comprador paga MUCHO por un pergamino prohibido — 220 🪙, sin preguntas, como siempre. Dicen que hay cuatro escondidos en lugares peligrosos: el desierto, el Campo de Ceniza, las ruinas de Arcana y el Bosque. Y ni te cuento lo que pagaría por la LEYENDA: Las Puertas del Infierno, la técnica con la que Orión selló a El Infernal… y a sí mismo. La buscan todos. Nadie sabe dónde está el pergamino, ni si existe. Si un día lo tuvieras tú… no, ni lo sueñes en voz alta.»';
      }
      case 'orgVeraProh': {
        this.darPista('cole', 1);
        return 'Vera cierra la libreta y te mira muy seria: «Nuevo hilo, y es feo: los Coleccionistas ya no solo roban reliquias — ahora buscan, roban y VENDEN técnicas prohibidas. Pergaminos raros, objetos peligrosos, conocimiento que ningún Guía enseñaría. Tienen informantes en cada pueblo que les avisan en cuanto aparece una. Dicen que las “preservan”… y se las venden a quien pague, criminales incluidos. Y su obsesión mayor es una LEYENDA: Las Puertas del Infierno, la técnica prohibida de Orión. Nadie sabe dónde está su pergamino ni si existe, y aun así es la pieza más valiosa del continente para ellos. Escúchame bien: si tienes una técnica prohibida, NO se lo digas a nadie. Ni a mí.»';
      }
      case 'orgMiloProh': {
        this.darPista('cole', 1);
        return 'Milo mira a los lados dos veces antes de hablar, rapidísimo: «¿Técnicas prohibidas? ¡Shh! Yo corro encargos, yo oigo cosas: en CADA pueblo hay un informante que avisa a los Coleccionistas cuando aparece una técnica prohibida o cualquier cosa rara. Pagan mucho por un pergamino prohibido, ¡mucho! Y si lo llevas encima por el campo, te salen al paso a quitártelo, igual que con las máscaras. ¿Mi consejo de corredor? Cofre de tu casa y boca cerrada. Y ni menciones Las Puertas del Infierno: por esa leyenda hay gente capaz de cualquier cosa.»';
      }
      case 'orgPetraComprar': return U.Reliquias ? U.Reliquias.comprarEnPetra() : 'Petra no tiene nada para ti ahora.';
      case 'orgPetraUnirse': return this.unirse('cole', npc);
      case 'orgVeraCole': {
        if (cole.mision === 2) { cole.mision = 3; cole.detenida = true; j.monedas = (j.monedas || 0) + 60; U.Economia.karmaAdd(5, 'aldea'); U.HUD.banner('✦ RELIQUIA DEVUELTA · LOS COLECCIONISTAS PIERDEN SU PIEZA · +60 🪙', 3); U.Audio.sfx('victoria'); return 'Le entregas la reliquia a Vera y ella la envuelve en un paño, casi con ternura: «Su dueño lloró al verla. Y el comprador rico de la Metrópolis se quedó sin su pieza: sus informantes ya no apuntan tan tranquilos. Recompensa oficial: 60 🪙, y Bruma lo recordará (+5 de karma). Un objetivo más, cumplido a tu manera.»'; }
        if (cole.detenida) return '«La reliquia volvió a su dueño. La red de informantes sigue por los pueblos, pero sin su pieza estrella andan de capa caída.»';
        this.darPista('cole', 1);
        return 'Vera niega despacio: «El tercer hilo: reliquias que desaparecen sin forzar puertas. Alguien APUNTA en cada pueblo dónde está cada pieza valiosa. Su comprador es rico y paciente. Si una reliquia robada pasa por tus manos, tráemela a mí… o véndela tú, si el precio te tienta más que la conciencia. Tú eliges: así funciona este mundo.»';
      }
      case 'orgVeraEscondites': return U.Escondites ? U.Escondites.vera() : 'Vera no tiene nada nuevo.';
      case 'orgSalir': {
        const org = npc.id === 'dario' ? 'mano' : npc.id === 'sana' ? 'jade' : 'cole';
        return this.salir(org);
      }
    }
    return '…';
  },
  enemigoDerrotado(e) {
    const O = this.asegurar(); if (!O) return;
    if (e.esOrg === 'dario') {
      this.darPista('mano', 2);
      if (O.mano.mision === 2 || O.mano.mision === 2.5) { O.mano.mision = 3; U.HUD.toast('Dario cae y su GUANTE NEGRO queda en el suelo. Vuelve con VERA a la Metrópolis: el caso está listo para cerrarse.', 'exito'); }
      else U.HUD.toast('Dario cae. Bajo el guante negro no hay nada raro: solo una mano. Pero su sonrisa al caer decía que vendrán más.', 'aviso');
    }
    if (e.esOrg === 'sana') { this.darPista('jade', 2); U.HUD.toast('Sana huye hacia los juncos dejando sus redes verdes. Ahora sabes quién caza para la Red… y dónde.', 'aviso'); }
    if (e.esOrg === 'manoEmboscada') U.HUD.toast('Los del guante negro se repliegan entre los árboles. No será la última vez: tu dominio huele desde lejos.', 'aviso');
    if (e.esOrg === 'coleMascara' && U.Reliquias) U.Reliquias.coleccionistaCaido(); // emboscada por tu máscara: al caer todos, puede que llevaran un artefacto robado
    if (e.esOrg === 'coleProhibida' && U.Prohibidas) U.Prohibidas.coleccionistaCaido(); // emboscada por tu pergamino prohibido
    if (e.esOrg === 'escondite' && U.Escondites) U.Escondites.guardiaCaido(e);
    if (e.esOrg === 'selloAgente') U.HUD.toast('El agente sin nombre cae susurrando: «La llave… no es tuya…» La organización que no tiene nombre ya sabe que la tienes.', 'aviso');
  },
  tick(dt) {
    const E = U.Juego.estado; if (!E || !E.jugador) return;
    const O = this.asegurar(); if (!O) return;
    const j = E.jugador;
    O.cd = Math.max(0, (O.cd || 0) - dt);
    // LOS QUE DRENAN DOMINIO TE BUSCA: a más dominio, más te quieren. Emboscadas a 40/70/100%
    // de maestría máxima, solo si ya sabes algo de ellos (pistas) y no son tu bando ni cayeron.
    const mano = O.mano;
    if (!mano.detenida && !mano.unido && O.cd <= 0 && mano.emboscadas < 3 && (mano.pistas >= 1)) {
      const umbral = [40, 70, 100][mano.emboscadas];
      if (this.maxMaestria(j) >= umbral) {
        mano.emboscadas++; O.cd = 180;
        if (!mano.descubierta) this.descubrir('mano');
        const e1 = U.Combate.crearEnemigo('veterano', j.x + 3, j.y + 1, E.dificultad * 1.1); e1.nombre = 'Élite del guante negro'; e1.guanteNegro = true; e1.esOrg = 'manoEmboscada';
        const e2 = U.Combate.crearEnemigo('brasa', j.x - 3, j.y - 1, E.dificultad); e2.nombre = 'Élite del guante negro'; e2.guanteNegro = true; e2.esOrg = 'manoEmboscada';
        E.enemigos.push(e1, e2);
        U.HUD.banner('🖤 ¡LOS QUE DRENAN DOMINIO TE HAN ENCONTRADO! · QUIEREN TU DOMINIO (' + Math.floor(this.maxMaestria(j)) + '%)', 3); U.Audio.sfx('oleada');
        U.HUD.toast('Te lo advirtieron: cuanto más crece tu dominio, más vales para ellos. ¡Pelea o huye!', 'peligro');
      }
    }
    // RED DE JADE: la jaula del lago (misión de Vera). Al llegar a la orilla sur salen los cazadores.
    const jade = O.jade;
    if (jade.mision === 1 && !jade.spawned && E.mapaId === 'aldea' && Math.hypot(j.x - 356.5, j.y - 220.5) < 6) {
      jade.spawned = true;
      const c1 = U.Combate.crearEnemigo('bandido', 358.5, 219.5, E.dificultad); c1.nombre = 'Cazador de la Red de Jade'; c1.esOrg = 'jade';
      const c2 = U.Combate.crearEnemigo('chaman', 354.5, 222.5, E.dificultad); c2.nombre = 'Cazadora de la Red de Jade'; c2.esOrg = 'jade';
      E.enemigos.push(c1, c2);
      U.HUD.banner('🪤 ¡LA JAULA DEL LAGO! · LOS CAZADORES DE JADE TE HAN VISTO', 2.6); U.Audio.sfx('oleada');
    }
    if (jade.mision === 1 && jade.spawned && !E.enemigos.some(e => e.vida > 0 && e.esOrg === 'jade')) {
      jade.mision = 2;
      const cLago = (E.criaturas || []).filter(c => c.region === 'lago' && c.temperamento === 'amistosa' && c.vida > 0)[0];
      if (cLago) { U.Criaturas.ganarVinculo(cLago, 20); U.HUD.toast('¡Liberaste a ' + U.Criaturas.nombreDe(cLago) + '! Sale de la jaula, te mira un largo momento y se pierde en el lago. No lo olvida: su vínculo contigo sube +20.', 'exito'); }
      else U.HUD.toast('¡Jaula vacía! La criatura escapó al lago entre los juncos. Vuelve con Vera a la Metrópolis.', 'exito');
      U.Audio.sfx('unlock');
    }
    // COLECCIONISTAS: recoger la reliquia escondida junto al oasis.
    const cole = O.cole;
    if (cole.mision === 1 && E.mapaId === 'aldea') {
      const ri = E.mapa.objetos.findIndex(o => o.tipo === 'reliquia');
      if (ri >= 0 && Math.hypot(j.x - (E.mapa.objetos[ri].x + 0.5), j.y - (E.mapa.objetos[ri].y + 0.5)) < 1.6) {
        E.mapa.objetos.splice(ri, 1); cole.mision = 2;
        U.Combate.particulas(j.x, j.y - 1, 18, '#ffe14d', 'chispa');
        U.HUD.banner('✦ RELIQUIA ROBADA EN TUS MANOS', 2.4); U.Audio.sfx('unlock');
        U.HUD.toast('Es pesada, vieja y brilla con luz antigua. Tú decides: VÉNDELA a Petra en Arcana (150 🪙, sin preguntas) o DEVUÉLVELA con Vera en la Metrópolis (recompensa y karma). Nadie te obliga: es tu objetivo, tu elección.', 'aviso');
      }
    }
    // Objetivos de organización: se cumplen al detenerla, unirte o resolver su trama.
    ['mano', 'jade', 'cole'].forEach(org => {
      const o = O[org]; const ob = this.objetivoDe(org);
      if (ob && ob.estado !== 'hecho' && o.descubierta && (o.detenida || o.unido || (org === 'cole' && o.mision === 3))) { ob.estado = 'hecho'; U.HUD.toast('Objetivo cumplido: lo de ' + this.DEFS[org].nombre + ' quedó resuelto a tu manera. El mundo sigue: elige otro objetivo.', 'exito'); if (U.Juego.siguienteObjetivo) U.Juego.siguienteObjetivo(); }
    });
    // ORGANIZACIÓN SECRETA (sin nombre): su poder crece con el tiempo y, sobre todo,
    // con cada organización que el jugador FRENA: los desertores se pasan a ella.
    { const sec = O.secreta; const fr = this.frenadas();
      if (fr > (sec.frenadasVistas || 0)) { sec.frenadasVistas = fr; sec.poderExtra = (sec.poderExtra || 0) + 10; if (this.secretaDesbloqueada()) U.HUD.toast('Rumor que corre de boca en boca: gente de la organización que frenaste DESAPARECIÓ de los caminos… y no volvió a su casa. Alguien los está recogiendo.', 'aviso'); if (U.Guardado) U.Guardado.guardarAuto(); }
      if (this.secretaDesbloqueada()) {
        const poder = this.poderSecreta();
        const etapa = poder >= 85 ? 4 : poder >= 60 ? 3 : poder >= 35 ? 2 : poder >= 15 ? 1 : 0;
        if (etapa > (sec.rumores || 0)) { sec.rumores = etapa;
          const msgs = ['Empiezan a llegar rumores imposibles de atar: figuras que aparecen y desaparecen en los caminos, sin insignia y sin nombre. Nadie sabe quiénes son. Nadie.',
            'Los rumores crecen: hablan de ESCUADRONES que actúan en silencio — Alfa protege (Escudo, Barrera, Muro), Beta golpea en misiones peligrosas (Golpe Fuerte, Explosión, Asalto) y Gamma investiga sin ser visto (Invisibilidad, Rastreo, Sentido: son hechiceros). La organización sigue sin nombre.',
            'Ya no es un rumor suelto: la organización sin nombre suma desertores de las otras organizaciones y cada vez más aliados. Su poder crece mientras las demás caen.',
            'En voz muy baja ya se dice: la organización sin nombre es hoy la MÁS PODEROSA del continente. Su líder —el compañero de El Infernal, de otro planeta, viejo y débil para lo que fue pero muy por encima de cualquier humano— estaría debilitando el SELLO en secreto para traer de vuelta a El Infernal.'];
          U.HUD.banner('👁 RUMOR SIN NOMBRE · PODER EN LA SOMBRA: ' + poder + '%', 3);
          U.HUD.toast(msgs[etapa - 1], 'aviso'); U.Audio.sfx('unlock');
          if (U.Guardado) U.Guardado.guardarAuto(); }
      }
    }
    // Objetivo abierto: dominar los cinco elementos.
    const obD = E.objetivos ? E.objetivos.find(o => o.id === 'dominar') : null;
    if (obD && obD.estado !== 'hecho' && U.Elementos.ids.every(id => (j.maestria[id] || 0) >= 70)) { obD.estado = 'hecho'; U.HUD.banner('🌟 ¡LOS CINCO ELEMENTOS DOMINADOS!', 3); U.HUD.toast('Objetivo cumplido: dominas los cinco elementos. Y el mundo sigue: hay torneos, organizaciones y un portal esperándote. Elige tu siguiente objetivo.', 'exito'); }
  }
};
