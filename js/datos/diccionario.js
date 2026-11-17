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
