/* === js/datos/banter.js === */
/* Unipar — DICCIONARIO GRANDE DE DIÁLOGO DE COMBATE (banter).
   El recuadro de banter aparece SOLO cuando la vida está MUY BAJA (≤25%):
   la del enemigo (casiPierde: desesperación, miedo, súplica o desafío final)
   o la tuya (casiPierdes: burla, celebración, amenaza final).
   No hay banter al inicio del combate ni en ningún otro momento.
   SOLO HABLAN LOS HUMANOIDES CON PERSONALIDAD HABLADORA.
   - Las criaturas (lobos, bestias, yetis, serpientes, grifos) NUNCA hablan:
     para ellas no aparece el recuadro, así que no hay tipo 'criatura' aquí.
   - Las personalidades calladas NUNCA dicen nada (ver U.BanterDic.personalidades):
     si el tipo de personalidad contiene una palabra callada, el enemigo es
     silencioso. Si contiene una habladora (o ninguna de las dos), habla.
   - Los personajes con nombre hablan con sus líneas propias, salvo que su
     entrada lleve habla: false (p. ej. el Vacío sin Nombre, que no dice nada).
   Capas (en orden): líneas propias por nombre → sabor por tipo de enemigo →
   capa de registros (brusco / amable / neutro / cobarde, según
   U.Diccionario.registroDe más el 4º registro 'cobarde' para los tipos
   cobardes, miedosos o asustadizos). Lo que falte en una capa cae a la siguiente.
   Estilo: español latinoamericano, voz del juego. Líneas cortas de 1-2
   renglones (máximo ~90 caracteres), para un recuadro pequeño con la cara
   del enemigo. Nada de tutorial, nada de "presiona X". */
window.U = window.U || {};

U.BanterDic = {
  // Quién habla y quién no, por palabras clave dentro del tipo de personalidad
  // (U.Personas.tipo). Regla que aplica el sistema: si el tipo contiene una
  // palabra callada → NUNCA habla. Si contiene una habladora (o ninguna de
  // las dos) → habla. Las listas se comparan en minúsculas, por substring.
  personalidades: {
    habladoras: ['arrogante', 'orgulloso', 'burlón', 'bocón', 'fanfarrón', 'charlatán', 'provocador', 'jactancioso', 'altanero', 'sarcástico', 'altivo', 'mandón'],
    calladas: ['silencioso', 'serio', 'tímido', 'frío', 'callado', 'reservado', 'taciturno', 'distante', 'sombrío', 'mudo', 'formal']
  },

  // 2 estados de la pelea (los únicos en los que aparece el recuadro).
  // Cada estado: 4 registros, cada uno un ARRAY de líneas.
  estados: {
    // El enemigo está a punto de perder (su vida ≤25%): desesperación, miedo,
    // súplica, desafío final, negación.
    casiPierde: {
      brusco: [
        '¡No! ¡Esto no se acaba así, maldita sea!',
        '¡Todavía puedo! ¡Ven, que no me he caído!',
        '¡Tch! Un golpe más y te arranco la cabeza.',
        '¡No me voy a rendir ante un mocoso como tú!',
        '¡Maldición! ¡Maldición! ¡Esto no puede pasar!',
        '¡Ven! ¡Si me vas a tumbar, que sea peleando!',
        '¡No he perdido! ¡No he perdido todavía!',
        '¡Te juro que te llevo conmigo, aunque sea lo último!'
      ],
      amable: [
        'Espera… por favor, ya no puedo más.',
        'Me rindo… por favor, no sigas.',
        'Ya basta… no tengo fuerzas para seguir.',
        'Perdóname… yo solo hacía mi trabajo.',
        'Por favor… tengo a alguien esperándome.',
        'No me hagas esto… te lo suplico.',
        'Está bien… ganaste. Solo déjame ir.',
        'No quiero morir aquí… por favor.'
      ],
      neutro: [
        'Esto… esto no puede estar pasando.',
        'Ya no me queda nada… ¿cómo llegué a esto?',
        'Respira… todavía hay una salida.',
        'No puedo caer aquí. No ahora.',
        'Me equivoqué contigo… lo reconozco.',
        'Un último intento. Solo uno más.',
        'Si caigo, que sea de pie.',
        'Esto se acabó… pero no me arrepiento.'
      ],
      cobarde: [
        '¡No! ¡No me mates! ¡Te doy todo lo que tengo!',
        '¡Por favor, suéltame! ¡Yo no quería pelear!',
        '¡Ay! ¡Ya, ya! ¡Me rindo, me rindo!',
        '¡No te acerques! ¡Te lo ruego!',
        '¡Mamá!… digo… ¡por favor, piedad!',
        '¡Yo no soy nadie! ¡Déjame ir, por favor!',
        '¡Te juro que no te vuelvo a molestar!',
        '¡Huyo! ¡Mejor vivo para contarlo!'
      ]
    },
    // Tú estás a punto de perder (tu vida ≤25%): el enemigo se burla, celebra,
    // amenaza con el golpe final.
    casiPierdes: {
      brusco: [
        '¡JA! ¿Eso era todo? ¡Ya te tengo!',
        '¡Mira cómo tiemblas! ¡Patético!',
        '¡Un golpe más y eres historia!',
        '¡Te dije que no eras rival para mí!',
        '¡Arrodíllate! ¡Ya no te queda nada!',
        '¡Esto se acabó! ¡Di tus últimas palabras!',
        '¡Qué fácil! ¡Y yo que te tenía miedo!',
        '¡Tú solito te metiste en esto, mocoso!'
      ],
      amable: [
        'Ya no sigas… ríndete, no quiero lastimarte más.',
        'Estás muy herido… por favor, retírate.',
        'No quiero hacerte daño… pero no me dejas opción.',
        'Ríndete, te lo pido. No vale la pena morir aquí.',
        'Ya basta… vete a curarte, en serio.',
        'Me duele verte así… por favor, para.',
        'No pelees más… no tienes por qué caer aquí.',
        'Te lo ruego: ríndete antes de que sea tarde.'
      ],
      neutro: [
        'Ya no te queda nada. Esto se acabó.',
        'Estás acabado. Ríndete y listo.',
        'Un golpe más y caes. Tú decides.',
        'Mira cómo estás… no puedes ganar.',
        'Se acabó el juego. Fuiste buen rival.',
        'No te muevas… esto termina ahora.',
        'Tu suerte se acabó. Acéptalo.',
        'Ya no hay vuelta atrás para ti.'
      ],
      cobarde: [
        '¡JA! ¡Ahora sí! ¡Ahora el que manda soy yo!',
        '¡Mira! ¡Te estoy ganando! ¡Yo! ¡Ja!',
        '¡Un golpe más y… y me voy corriendo, pero gané!',
        '¡Te tengo! ¡Por fin te tengo, cobarde tú!',
        '¡Esto es mío! ¡Ya casi! ¡No me lo quites!',
        '¡Ja! ¡Y decían que yo era el miedoso!',
        '¡Casi, casi! ¡No te levantes, por favor!',
        '¡Lo logré! ¡Lo logré! ¡Ahora sí que corro!'
      ]
    }
  },
  // Sabor por TIPO de enemigo. Solo los dos estados (casiPierde / casiPierdes).
  // Lo que falte cae a la capa de registros. Sin tipo 'criatura': las bestias
  // nunca hablan y para ellas no aparece el recuadro.
  tipos: {
    bandido: {
      casiPierde: [
        '¡Tch! ¡Hoy no es mi día para robar… ni para pelear!',
        '¡Ya, ya! ¡Llévate las monedas, pero déjame ir!',
        '¡Maldito seas! ¡Los bandidos no caemos así!',
        '¡Esto no se queda así! ¡Mis compas se van a enterar!'
      ],
      casiPierdes: [
        '¡Ja! ¡Vacía los bolsillos o te vacío yo!',
        '¡Mira nomás! ¡El héroe ya no se para!',
        '¡Esto es un asalto, bonito! ¡Y tú ya perdiste!',
        '¡Un golpe más y tus monedas son mías!'
      ]
    },
    chaman: {
      casiPierde: [
        'Los espíritus… me abandonan… no puede ser.',
        'La tierra me llama… todavía no… todavía no.',
        'Perdón, ancestros… les fallé.',
        'El círculo se rompe… todo se rompe…'
      ],
      casiPierdes: [
        'Los espíritus ya te marcaron. Tu fin llegó.',
        'La tierra te reclama… y yo solo obedezco.',
        'Ríndete… los ancestros ya decidieron.',
        'Tu energía se apaga. El ritual se cumplió.'
      ]
    },
    brasa: {
      casiPierde: [
        '¡Mi fuego… se apaga! ¡No… no puede apagarse!',
        '¡Todavía ardo! ¡Todavía ardo, maldita sea!',
        '¡La brasa no muere! ¡La brasa nunca muere!',
        '¡Quémame si quieres, pero no me apagues!'
      ],
      casiPierdes: [
        '¡Arde! ¡Mira cómo ardes, ceniza andante!',
        '¡Mi fuego te va a tragar entero!',
        '¡Ya hueles a quemado! ¡Un poco más!',
        '¡La brasa no perdona! ¡Despídete!'
      ]
    },
    veterano: {
      casiPierde: [
        'Tantos años… y me tumba un mocoso…',
        'He caído cien veces. Esta no será la última.',
        'La arena me vio nacer… no me verá morir.',
        'Un veterano no suplica. Solo se levanta… o cae.'
      ],
      casiPierdes: [
        'Te lo dije: la experiencia pesa más que el talento.',
        'Buen combate… pero la arena es mía.',
        'Ya estás acabado, chico. Así es la arena.',
        'Un golpe más y te enseño tu lugar.'
      ]
    },
    ilusionista: {
      casiPierde: [
        '¿Cómo… cómo viste a través de mí?',
        '¡Esto es un truco! ¡Todo es un truco… ojalá!',
        'Mis ilusiones se deshacen… como yo.',
        'Ja… buen truco, el tuyo. Mejor que el mío.'
      ],
      casiPierdes: [
        '¿Ya no sabes qué es real y qué no? Perfecto.',
        'Mira a tu alrededor… todo es mi truco.',
        'Caíste en la ilusión. Ahora cae de verdad.',
        'Tu miedo ya es mío. El resto es fácil.'
      ]
    },
    coleccionista: {
      casiPierde: [
        '¡No! ¡Mi colección! ¡No puedes quitarme mi colección!',
        '¡Te lo ruego! ¡Tengo piezas que nadie más tiene!',
        '¡Esto vale más que mi vida! ¡Mi colección no se toca!',
        '¡Por favor! ¡Negociemos! ¡Todo tiene precio!'
      ],
      casiPierdes: [
        'Esa máscara será mía. Ya casi es mía.',
        '¡Qué pieza tan hermosa vas a ser en mi colección!',
        'Ríndete… y tu artefacto tendrá un buen hogar.',
        'Nadie escapa de mi colección. Nadie.'
      ]
    },
    patrullero: {
      casiPierde: [
        '¡La patrulla… no cae así! ¡No puede caer así!',
        '¡Me retiro… por orden! ¡Esto no es huida!',
        '¡Un patrullero no abandona su puesto… pero hoy sí!',
        '¡Refuerzos! ¡Necesito refuerzos!'
      ],
      casiPierdes: [
        '¡Por orden del Guardián: ríndete ahora mismo!',
        '¡Estás bajo arresto! ¡No te muevas!',
        '¡La ley te alcanzó, forastero!',
        '¡Un paso más y te llevo a la Oficina a rastras!'
      ]
    },
    lider: {
      casiPierde: [
        '¡Un líder no cae ante un don nadie!',
        '¡Mis hombres me están viendo… no puedo caer!',
        '¡La patrulla sigue en pie aunque yo caiga!',
        '¡Esto no se acaba! ¡La orden sigue!'
      ],
      casiPierdes: [
        '¡Arrodíllate ante tu Guardián!',
        '¡Te lo ordeno: ríndete, por el bien de Bruma!',
        '¡Mira el poder de la ley! ¡Esto es autoridad!',
        '¡Ya está! ¡La aldea verá cómo cae un rebelde!'
      ]
    },
    jefe: {
      casiPierde: [
        '¡Mi guarida! ¡No me la quites!',
        '¡Años guardando esto… y llega un mocoso!',
        '¡Todavía tengo un as bajo la manga!',
        '¡Caigo yo, pero la guarida no se rinde!'
      ],
      casiPierdes: [
        '¡Nadie entra a MI guarida y sale vivo!',
        '¡Te voy a colgar junto a mis trofeos!',
        '¡Mira tu sangre! ¡Mi guarida la celebra!',
        '¡Arrodíllate! ¡El jefe de aquí soy yo!'
      ]
    },
    torneo: {
      casiPierde: [
        '¡No! ¡No frente a toda la arena!',
        '¡El público me está viendo… no puedo caer!',
        '¡Un round más! ¡Solo pido un round más!',
        '¡Esto no es derrota! ¡Es… un empate tardío!'
      ],
      casiPierdes: [
        '¡La arena es mía! ¡El público grita mi nombre!',
        '¡Ríndete! ¡No arruines mi final!',
        '¡Mira a la grada! ¡Todos saben quién gana!',
        '¡El torneo será mío! ¡Tú solo eres el escalón!'
      ]
    },
    reto: {
      casiPierde: [
        '¡Me retaste tú! ¡Y aun así me ganas…!',
        '¡No puede ser! ¡Yo pedí este duelo!',
        '¡Un retador no se rinde!… bueno, a veces sí.',
        '¡Me equivoqué de rival! ¡Lo admito!'
      ],
      casiPierdes: [
        '¡Tú me retaste! ¡Ahora aguanta las consecuencias!',
        '¡Aceptaste el reto! ¡Ahora paga el precio!',
        '¡Esto es lo que pediste! ¡Un duelo de verdad!',
        '¡Ya te tengo! ¡El reto se cobra ahora!'
      ]
    }
  },
  // Líneas PROPIAS por nombre (el sistema busca por substring en el nombre del
  // enemigo). Solo los dos estados. Dario es 'Frío y cortés' pero habla: con
  // líneas CORTAS y frías, de un renglón. Sana es práctica y directa, sin
  // remilgos. El Vacío sin Nombre lleva habla: false: nunca dice nada.
  nombres: {
    'Dario': {
      casiPierde: [
        'Interesante… muy interesante.',
        'Me equivoqué contigo. Lo reconozco.',
        'Qué lástima… tenía planes para ti.',
        'Me retiro, viajero. Esto no ha terminado.'
      ],
      casiPierdes: [
        'Eso era tu dominio, ¿verdad? Tierno.',
        'Ya no te queda nada. Qué pena.',
        'Te lo advertí… con educación.',
        'Descansa, viajero. Te recordaré… un poco.'
      ]
    },
    'Sana': {
      casiPierde: [
        'Tch… la cazadora también es presa, a veces.',
        'Buen golpe. Me lo merezco por confiarme.',
        'Me retiro. El lago me espera.',
        'Esto no es una derrota: es una lección cara.'
      ],
      casiPierdes: [
        'En el lago, el que duda es la cena.',
        'Te falta instinto, chico. Y ya no hay tiempo.',
        'Buena presa. Valdrás monedas… digo, respeto.',
        'Ni a una criatura herida la remato así… pero tú no eres criatura.'
      ]
    },
    'Bruno el Leñador': {
      casiPierde: [
        '¡Tch! ¡Ni el roble más duro cae de un hachazo!',
        '¡Me ganaste… pero el bosque no olvida!',
        '¡Un leñador no se rinde! ¡Se sienta… un rato!',
        '¡Buen golpe! ¡Tienes más tronco de lo que creí!'
      ],
      casiPierdes: [
        '¡Te voy a cortar como leña seca!',
        '¡Mira nomás! ¡El arbolito ya se dobla!',
        '¡Un hachazo más y caes, tronco débil!',
        '¡En el bosque manda el hacha! ¡Y el hacha soy yo!'
      ]
    },
    'Sibila del Viento': {
      casiPierde: [
        'El viento… me suelta… no puede ser.',
        'Escuché mil vientos y ninguno me avisó de ti.',
        'Me retiro como el viento: sin ruido.',
        'El viento cambia… y yo con él.'
      ],
      casiPierdes: [
        'El viento ya decidió: tú caes.',
        'Escucha… hasta el viento guarda silencio por ti.',
        'Tu final sopla suave… como yo.',
        'Ríndete… el viento no perdona a quien se aferra.'
      ]
    },
    'Corazón de Brasa': {
      casiPierde: [
        '¡Mi brasa… se enfría! ¡Imposible!',
        '¡Todavía quemo! ¡Mira, todavía quemo!',
        '¡El fuego no se apaga! ¡No en mí!',
        '¡Que me apague el río, pero no tú!'
      ],
      casiPierdes: [
        '¡Arde, corazón frío! ¡Arde!',
        '¡Mi fuego te tragó entero, ceniza!',
        '¡Ya hueles a humo! ¡Despídete!',
        '¡La brasa manda! ¡Y tú obedeces cayendo!'
      ]
    },
    'El Campeón Velado': {
      casiPierde: [
        'Nadie me había llevado tan lejos…',
        'El velo se cae… y con él, mi invicto.',
        'Interesante. Nadie llega hasta aquí dos veces.',
        'Me retiro… el misterio sigue intacto.'
      ],
      casiPierdes: [
        'El campeón no perdona. El velo, menos.',
        'Ya viste mi sombra. Ahora verás mi final.',
        'Arrodíllate… el velo lo exige.',
        'Tu derrota ya estaba escrita. Yo solo la leí.'
      ]
    },
    'El Otro Semifinalista': {
      casiPierde: [
        '¡No! ¡Estaba tan cerca de la final!',
        '¡La final era mía! ¡Era mía!',
        '¡Un paso! ¡Me faltaba un paso!',
        '¡Me ganaste… pero la arena me debe una!'
      ],
      casiPierdes: [
        '¡La final será mía! ¡Tú no pasas de aquí!',
        '¡Ya te tengo! ¡La final me espera!',
        '¡Ríndete! ¡No me robes mi final!',
        '¡Mira la grada! ¡Todos saben quién llega!'
      ]
    },
    'Líder de la Patrulla': {
      casiPierde: [
        '¡Un líder no cae! ¡La patrulla me está viendo!',
        '¡Me retiro por orden… mía! ¡Esto no es huida!',
        '¡La ley sigue en pie aunque yo caiga!',
        '¡Refuerzos! ¡Que vengan todos!'
      ],
      casiPierdes: [
        '¡Por orden del Guardián: ríndete!',
        '¡Estás bajo arresto, forastero!',
        '¡La ley no perdona! ¡Y yo, menos!',
        '¡Arrodíllate ante la patrulla!'
      ]
    },
    'Coleccionista': {
      casiPierde: [
        '¡Mi colección! ¡No puedes con mi colección!',
        '¡Te lo compro! ¡Todo tiene precio!',
        '¡Por favor! ¡Esa pieza no tiene reemplazo!',
        '¡Negociemos! ¡Tengo piezas que valen reinos!'
      ],
      casiPierdes: [
        'Tu máscara será la joya de mi colección.',
        '¡Qué artefacto tan hermoso vas a ser!',
        'Ríndete… y te guardo en buen lugar.',
        'Nadie escapa de mi colección. Nadie.'
      ]
    },
    'Cazador de la Red de Jade': {
      casiPierde: [
        '¡La Red no cae! ¡La Red nunca cae!',
        '¡Me atrapaste… como yo a mis presas!',
        '¡La Red me debe una! ¡Me retiro!',
        '¡Esto no se queda así! ¡La Red tiene ojos!'
      ],
      casiPierdes: [
        '¡La Red de Jade ya te tiene en sus hilos!',
        '¡Buena presa! ¡La Red paga bien por ti!',
        '¡Ni te muevas! ¡Ya eres de la Red!',
        '¡Te cazamos a ti… y a tu máscara!'
      ]
    },
    'Cazadora de la Red de Jade': {
      casiPierde: [
        '¡Tch! ¡La presa me salió cazadora!',
        '¡Me retiro! ¡La Red caza mejor en la sombra!',
        '¡No se queda así! ¡La Red no olvida!',
        '¡Buen golpe! ¡Te lo reconozco, presa!'
      ],
      casiPierdes: [
        '¡La Red de Jade te atrapó, bonito!',
        '¡Qué presa tan rara! ¡Valdrás una fortuna!',
        '¡Ya eres mío… digo, de la Red!',
        '¡Ni corras! ¡La Red llega a todos lados!'
      ]
    },
    'Élite del guante negro': {
      casiPierde: [
        '…Imposible. Nadie toca al guante negro.',
        'Me retiro. El guante no perdona… pero espera.',
        'Esto no ha terminado. El guante vuelve.',
        '…Bien. Te recordaré, forastero.'
      ],
      casiPierdes: [
        'El guante negro no falla. Tú, sí.',
        'Arrodíllate. El guante lo ordena.',
        'Tu final ya está firmado… con guante negro.',
        '…Despídete. Sin ruido, como nosotros.'
      ]
    },
    // --- Los 11 jefes de guarida, cada uno con su oficio ---
    'Cazador Mayor de la Red': {
      casiPierde: [
        '¡Yo cacé a los mejores! ¡No puedo caer así!',
        '¡La Red me enseñó a no fallar… y fallé!',
        '¡Me retiro! ¡El mayor caza en otro día!',
        '¡Mi jaula más grande… era para ti!'
      ],
      casiPierdes: [
        '¡La presa mayor eres tú! ¡Y ya te tengo!',
        '¡Ni los mejores se me escaparon! ¡Tú, menos!',
        '¡La Red de Jade caza… y yo soy su garra!',
        '¡Tu máscara colgará junto a mis trofeos!'
      ]
    },
    'Guardabosques de la Red': {
      casiPierde: [
        '¡El bosque era mío! ¡Yo lo cuidaba!',
        '¡Las trampas… mis trampas me fallaron!',
        '¡Me retiro al bosque! ¡Ahí nadie me gana!',
        '¡El bosque me debe una… y me la cobra!'
      ],
      casiPierdes: [
        '¡El bosque es mi jaula! ¡Y tú ya entraste!',
        '¡Ni un paso más! ¡El bosque te traga!',
        '¡Conozco cada tronco… y tu final!',
        '¡La Red vigila el bosque! ¡Y yo te vigilo a ti!'
      ]
    },
    'Vigía de la Cumbre': {
      casiPierde: [
        '¡Desde la cumbre lo veía todo… menos esto!',
        '¡Caigo… desde lo más alto!',
        '¡La cumbre no perdona… ni a su vigía!',
        '¡Me retiro! ¡La niebla me cubre!'
      ],
      casiPierdes: [
        '¡Desde arriba se ve tu final, forastero!',
        '¡La cumbre es mía! ¡Y tú caes por ella!',
        '¡Ni el viento te salva aquí arriba!',
        '¡Te vi venir desde lejos… y aun así te tengo!'
      ]
    },
    'Tasador de las Ruinas': {
      casiPierde: [
        '¡No! ¡Esta pieza no tiene precio… ni reemplazo!',
        '¡Te lo compro! ¡Te compro tu victoria!',
        '¡Mi tasación… falló! ¡Nadie tasó tu fuerza!',
        '¡Por favor! ¡Esa ruina vale más que yo!'
      ],
      casiPierdes: [
        'Te tasé en monedas… y vales menos caído.',
        '¡Tu máscara vale una fortuna! ¡Ya es mía!',
        '¡Todo tiene precio! ¡Tu derrota, también!',
        '¡Las ruinas me dieron tu precio: cero!'
      ]
    },
    'Contrabandista del Puerto': {
      casiPierde: [
        '¡Tch! ¡Este cargamento era el bueno!',
        '¡Negociemos! ¡Siempre hay un trato!',
        '¡El puerto no olvida a quien lo traiciona… ni a mí!',
        '¡Me retiro! ¡El próximo barco me espera!'
      ],
      casiPierdes: [
        '¡El puerto es mío! ¡Y tú, mi mercancía!',
        '¡Te vendo… digo, te entrego a la Red!',
        '¡Buen cargamento! ¡Valdrás monedas!',
        '¡En el puerto nadie pregunta! ¡Y nadie te busca!'
      ]
    },
    'Custodio del Tesoro': {
      casiPierde: [
        '¡El tesoro… no puede caer en tus manos!',
        '¡Lo guardé años… años!',
        '¡Me retiro! ¡Pero el tesoro se queda conmigo!',
        '¡Nadie toca el tesoro! ¡Nadie!'
      ],
      casiPierdes: [
        '¡El tesoro se queda! ¡Y tú te quedas… caído!',
        '¡Guardo el tesoro… y ahora guardo tu derrota!',
        '¡Ni un paso más! ¡El tesoro es sagrado!',
        '¡Tu sangre pagará lo que miraste!'
      ]
    },
    'Drenador de la Cámara': {
      casiPierde: [
        '¡Mi energía… se me escapa! ¡No…!',
        '¡Drené a tantos… y ahora me drenan a mí!',
        '¡La cámara me llama… todavía no!',
        '¡Sin energía no soy nada… nada!'
      ],
      casiPierdes: [
        '¡Tu Esencia será mía! ¡Toda, gota a gota!',
        '¡Te dreno hasta la última gota!',
        '¡La cámara tiene hambre… y tú eres el plato!',
        '¡Ya siento tu Esencia! ¡Dulce, dulce Esencia!'
      ]
    },
    'Señor de la Niebla': {
      casiPierde: [
        '¡La niebla… se disipa! ¡No puede ser!',
        '¡Me deshago como la niebla al sol…!',
        '¡La niebla me cubre… por última vez!',
        '¡Ni la niebla me esconde de ti!'
      ],
      casiPierdes: [
        '¡La niebla te tragó, forastero!',
        '¡Ni te vi venir… ni te veré irte!',
        '¡En la niebla nadie te oye caer!',
        '¡La niebla es mía! ¡Y tu final, también!'
      ]
    },
    'Centinela de la Torre': {
      casiPierde: [
        '¡La torre… no cae! ¡Yo tampoco!',
        '¡Guardé esta torre años… y caigo en un día!',
        '¡Me retiro a la torre! ¡Ahí nadie sube!',
        '¡Un centinela no duerme… pero sí cae!'
      ],
      casiPierdes: [
        '¡La torre es mía! ¡Y tu final, también!',
        '¡Desde arriba se ve tu derrota, forastero!',
        '¡Ni un paso más! ¡La torre no se rinde!',
        '¡Yo vigilo… y yo ejecuto!'
      ]
    },
    'Oficiante del Sello': {
      casiPierde: [
        '¡El sello… se rompe! ¡No puede romperse!',
        '¡El ritual… falló! ¡Los dioses me miran!',
        '¡Me retiro! ¡El sello me espera… sellado!',
        '¡Sin sello no soy nada… nada!'
      ],
      casiPierdes: [
        '¡El sello te marca! ¡Ya eres mío!',
        '¡El ritual se cumplió! ¡Tu fin llegó!',
        '¡Sellado! ¡Tu destino quedó sellado!',
        '¡Los sellos no perdonan! ¡Yo, menos!'
      ]
    },
    // El Vacío sin Nombre es un vacío: NUNCA habla. habla: false lo marca y
    // las listas quedan vacías a propósito: el sistema no debe mostrar
    // recuadro para él en ningún estado.
    'Vacío sin Nombre': {
      habla: false,
      casiPierde: [],
      casiPierdes: []
    }
  },

  // Personalidad que se le asigna a cada clase de enemigo al aparecer (el
  // sistema elige una al azar de la lista). 2 opciones por clase, y SIEMPRE
  // al menos una claramente callada por clase, para que una buena parte de
  // los enemigos sean silenciosos. Sin 'criatura': las bestias nunca hablan.
  tiposPersonalidad: {
    bandido: ['Arrogante y bocón', 'Silencioso y frío'],
    chaman: ['Sereno y paciente', 'Taciturno y reservado'],
    brasa: ['Intenso y directo', 'Serio y frío'],
    veterano: ['Orgulloso y curtido', 'Serio y formal'],
    ilusionista: ['Burlón y tramposo', 'Frío y cortés'],
    coleccionista: ['Jactancioso y codicioso', 'Reservado y calculador'],
    patrullero: ['Altivo y mandón', 'Serio y formal'],
    lider: ['Altanero y autoritario', 'Serio y distante'],
    jefe: ['Sarcástico y cruel', 'Sombrío y callado'],
    torneo: ['Fanfarrón y bocón', 'Serio y concentrado'],
    reto: ['Provocador y burlón', 'Tímido y callado']
  }
};
