/* === js/sistemas/progresion.js === */
/* Unipar — RANGOS / PROGRESIÓN + TÍTULOS (sistema nuevo, separado de lo demás).
   ESCUELA (Estudiante, teoría, examen escrito OPCIONAL) → ACADEMIA (Aspirante,
   práctica: N misiones fáciles + Torneo Académico) → GRADUADO. Desde ahí el camino
   se RAMIFICA y es libre: APRENDIZ de un Guía (por confianza, NO exige graduarse),
   PATRULLA (Cuartel: Novato→Patrullero→Oficial→Élite→Líder→Guardianes, con examen
   de combate por ascenso y sin Recompensa activa), PELEADOR (gimnasios con líderes
   y medallas) y GUERRERO (título al juntar TODAS las medallas).
   TÍTULOS: hazañas independientes, sin jerarquía; se ganan solos y viven en el perfil.
   La palabra prohibida no se usa: quien enseña es un GUÍA. */
window.U = window.U || {};
U.Progresion = {
  ACADEMIA_MISIONES: 3,
  GUIAS: [ { id: 'kaelen', nombre: 'Kaelen', dato: 'guardia de Bruma' }, { id: 'torin', nombre: 'Torin', dato: 'herrero, Guía de Yin' }, { id: 'sora', nombre: 'Sora', dato: 'curandera del pozo' } ],
  CONFIANZA_GUIA: 70,
  PATRULLA_RANGOS: ['novato', 'patrullero', 'oficial', 'elite', 'lider', 'guardian'],
  PATRULLA_NOM: { novato: 'Novato', patrullero: 'Patrullero', oficial: 'Oficial', elite: 'Élite', lider: 'Líder de pueblo', guardian: 'Uno de Los 5 Guardianes' },
  PATRULLA_META: { novato: 3, patrullero: 4, oficial: 5, elite: null }, // misiones de patrulla para poder presentarse al examen de ascenso
  GIMNASIOS: [
    { id: 'bruma', pueblo: 'Bruma', lider: 'Bruno, líder de la sala de Bruma', clase: 'bandido', mult: 1.1, medalla: 'Medalla de Bruma' },
    { id: 'agua', pueblo: 'Puerto Brisa Azul', lider: 'Nami, líder de la sala del Puerto', clase: 'chaman', mult: 1.25, medalla: 'Medalla de la Brisa' },
    { id: 'fuego', pueblo: 'Aldea Ceniza Viva', lider: 'Varek, líder de la sala de Ceniza', clase: 'brasa', mult: 1.4, medalla: 'Medalla de la Brasa' },
    { id: 'tierra', pueblo: 'Aldea Raíz de Piedra', lider: 'Toruk, líder de la sala de Raíz', clase: 'veterano', mult: 1.55, medalla: 'Medalla de la Raíz' },
    { id: 'viento', pueblo: 'Aldea Vuelo Alto', lider: 'Lira, líder de la sala de Vuelo', clase: 'chaman', mult: 1.7, medalla: 'Medalla del Vuelo' },
    { id: 'rayo', pueblo: 'Aldea Chispa Alta', lider: 'Vek, líder de la sala de Chispa', clase: 'ilusionista', mult: 1.85, medalla: 'Medalla de la Chispa' }
  ],
  EXAMEN: [
    { q: '¿Cuántos elementos existen en el mundo?', ops: ['Cinco: Fuego, Agua, Tierra, Viento y Rayo', 'Cuatro: Fuego, Agua, Tierra y Aire', 'Siete, contando Luz y Sombra'], ok: 0 },
    { q: 'Un enemigo de Fuego te ataca. ¿Qué elementos le ganan al Fuego?', ops: ['Viento y Rayo', 'Agua y Tierra', 'Solo el propio Fuego'], ok: 1 },
    { q: '¿Quién gobierna la Metrópolis, en El Origen?', ops: ['Un rey elegido por las aldeas', 'El líder más fuerte de cada época', 'Nadie: no tiene rey ni gobernante, por respeto a Orión'], ok: 2 },
    { q: '¿Qué es la Esencia?', ops: ['La energía que gastas al usar técnicas y estilos', 'Una moneda antigua de las aldeas', 'El nombre del viento de la montaña'], ok: 0 },
    { q: 'El Yang es…', ops: ['Un sexto elemento secreto', 'Energía pura de color blanco que cualquiera puede entrenar', 'Una técnica solo de los de Rayo'], ok: 1 },
    { q: 'Orión, El Elegido, logró en una sola vida lo que a otros les toma cinco vidas. ¿Qué fue?', ops: ['Fundar las cinco aldeas', 'Ganar todos los torneos', 'Dominar los cinco elementos'], ok: 2 }
  ],
  nuevo() {
    return { escuela: 'estudiante', examen: { intentos: 0, aprobado: false, nota: 0 }, academiaMisiones: 0,
      guia: null, patrulla: { rango: null, misiones: 0 }, medallas: {}, titulos: [], recompensa: 0, recompensaCd: 0,
      duelo: null, _examen: null, _dia: 0, _misionesVistas: 0, _torneosVistos: 0, _derrotasVistas: 0, _sangreVistos: [] };
  },
  asegurar() { const E = U.Juego.estado; if (!E) return null; if (!E.prog) E.prog = this.nuevo(); const p = E.prog; if (!p.examen) p.examen = { intentos: 0, aprobado: false, nota: 0 }; if (!p.patrulla) p.patrulla = { rango: null, misiones: 0 }; if (!p.medallas) p.medallas = {}; if (!Array.isArray(p.titulos)) p.titulos = []; if (!Array.isArray(p._sangreVistos)) p._sangreVistos = []; return p; },
  serializable() { const p = this.asegurar(); if (!p) return null; const c = JSON.parse(JSON.stringify(p)); delete c._examen; delete c.duelo; return c; },
  rangoEscuelaNom(p) { return p.escuela === 'graduado' ? 'Graduado' : p.escuela === 'aspirante' ? 'Aspirante' : 'Estudiante'; },
  tieneTitulo(p, t) { return p.titulos.indexOf(t) >= 0; },
  otorgarTitulo(t) {
    const E = U.Juego.estado, p = this.asegurar(); if (!p || this.tieneTitulo(p, t)) return false;
    p.titulos.push(t); U.HUD.banner('🏅 ¡TÍTULO GANADO! · ' + t.toUpperCase(), 3); U.Audio.sfx('victoria');
    setTimeout(() => U.HUD.toast('Nuevo título: «' + t + '». Los títulos son hazañas independientes: ninguno está por encima de otro. Míralos en Pausa → Estadísticas o Progresión.', 'exito'), 350);
    if (U.Guardado) U.Guardado.guardarAuto(); return true;
  },
  sumarRecompensa(n, motivo) {
    const E = U.Juego.estado, p = this.asegurar(); if (!p || (p.recompensaCd || 0) > 0) return;
    p.recompensaCd = 20; const antes = p.recompensa || 0; p.recompensa = Math.max(0, Math.min(5, antes + n));
    if (p.recompensa !== antes) U.HUD.toast('⭐ RECOMPENSA (se busca): ahora tienes ' + p.recompensa + ' estrella(s) por ' + motivo + '. Con Recompensa activa NO puedes entrar a la Patrulla. Baja una estrella por cada día sin delitos.', 'peligro');
  },
  confianzaDe(id) { const E = U.Juego.estado; const n = (E.roster || E.npcs || []).find(x => x.id === id) || (E.npcsPorMapa && E.npcsPorMapa.oficina || []).find(x => x.id === id); return n && n.estados ? Math.round(n.estados.confianza) : 0; },
  // ---------- duelos genéricos (exámenes, gimnasios, defensas, torneos especiales) ----------
  iniciarDuelo(tipo, spawns, bannerTxt) {
    const E = U.Juego.estado, p = this.asegurar(), j = E.jugador; if (!E || !p || p.duelo) { U.HUD.toast('Ya tienes un duelo o evento en curso: termínalo primero.', 'aviso'); return false; }
    p.duelo = { tipo }; p._derrotasVistas = E.historial.derrotas || 0;
    spawns.forEach((sp, i) => { const a = (i / Math.max(1, spawns.length)) * Math.PI * 2 + 0.7; const e = U.Combate.crearEnemigo(sp.clase, j.x + Math.cos(a) * 3.2, j.y + Math.sin(a) * 3.2, sp.mult * E.dificultad); e.esProg = tipo; if (sp.nombre) e.nombre = sp.nombre; E.enemigos.push(e); U.Combate.particulas(e.x, e.y - 0.5, 14, '#ffe14d', 'humo'); });
    U.HUD.banner(bannerTxt, 2.4); U.Audio.sfx('oleada'); U.Audio.musica('arena'); return true;
  },
  victoriaDuelo(tipo) {
    const E = U.Juego.estado, p = this.asegurar(), j = E.jugador; U.Audio.musica('aldea');
    const dar = (mon, txt) => { if (mon) j.monedas = (j.monedas || 0) + mon; U.HUD.banner(txt, 3); U.Audio.sfx('victoria'); };
    if (tipo === 'academiaTorneo') { p.escuela = 'graduado'; dar(40, '🎓 ¡GRADUADO! · TORNEO ACADÉMICO SUPERADO · +40 🪙'); U.HUD.toast('Pasaste la Academia: ya eres GRADUADO. Se abre el menú de caminos: Aprendiz de un Guía, Patrulla (en el Cuartel), Peleador (gimnasios)… tú eliges, nada es obligatorio. Pausa → Progresión.', 'exito'); }
    else if (tipo === 'patrullaIngreso') { p.patrulla.rango = 'novato'; p.patrulla.misiones = 0; dar(0, '🛡 ¡ACEPTADO EN LA PATRULLA! · RANGO: NOVATO'); U.HUD.toast('El Cuartel te acepta como NOVATO: haz misiones de patrulla aquí mismo y luego presenta el examen de combate para subir a Patrullero.', 'exito'); }
    else if (tipo === 'patrullaAscenso') { const orden = this.PATRULLA_RANGOS; const sig = orden[orden.indexOf(p.patrulla.rango) + 1]; p.patrulla.rango = sig; p.patrulla.misiones = 0; dar(30, '🛡 ¡ASCENSO! · NUEVO RANGO DE PATRULLA: ' + this.PATRULLA_NOM[p.patrulla.rango].toUpperCase() + ' · +30 🪙'); }
    else if (tipo === 'patrullaMision') { p.patrulla.misiones = (p.patrulla.misiones || 0) + 1; dar(20, '🛡 PATRULLA CUMPLIDA · ' + p.patrulla.misiones + ' EN ESTE RANGO · +20 🪙'); }
    else if (tipo.indexOf('gym:') === 0) { const g = this.GIMNASIOS.find(x => x.id === tipo.slice(4)); if (g) { p.medallas[g.id] = true; dar(25, '🏅 ¡' + g.medalla.toUpperCase() + '! · VENCIÓ LA SALA DE ' + g.pueblo.toUpperCase() + ' · +25 🪙'); const n = this.GIMNASIOS.filter(x => p.medallas[x.id]).length; U.HUD.toast('Medallas: ' + n + '/' + this.GIMNASIOS.length + '. Al juntar TODAS ganas el título de Guerrero.', 'exito'); if (n >= this.GIMNASIOS.length) this.otorgarTitulo('Guerrero'); } }
    else if (tipo === 'defensaBruma') { dar(30, '🏡 ¡BRUMA DEFENDIDA! · +30 🪙'); this.otorgarTitulo('Héroe de Bruma'); }
    else if (tipo === 'defensaMetro') { dar(40, '🏙 ¡LA METRÓPOLIS DEFENDIDA! · +40 🪙'); this.otorgarTitulo('Héroe de la Metrópolis'); }
    else if (tipo === 'sello') { dar(30, '🔒 ¡EL SELLO SIGUE A SALVO! · +30 🪙'); this.otorgarTitulo('Guardián del Sello'); }
    else if (tipo === 'torneoMetro') { dar(150, '👑 ¡CAMPEÓN DEL TORNEO DE LA METRÓPOLIS! · +150 🪙'); this.otorgarTitulo('Campeón'); }
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  // ---------- tick: duelos, contadores y títulos automáticos por hazaña ----------
  tick(dt) {
    const E = U.Juego.estado; if (!E || !E.jugador || E.ui === 'test') return; const p = this.asegurar(); if (!p) return;
    if (p.recompensaCd > 0) p.recompensaCd -= dt;
    if (p._dia !== (E.reloj ? E.reloj.dia : 0)) { const nuevoDia = E.reloj ? E.reloj.dia : 0; if (p._dia && nuevoDia > p._dia && p.recompensa > 0) { p.recompensa--; U.HUD.toast('⭐ Pasó un día sin delitos: tu Recompensa baja a ' + p.recompensa + ' estrella(s).', ''); } p._dia = nuevoDia; }
    // Academia: entregar misiones del tablón cuenta como misiones fáciles de Aspirante
    const hm = E.historial.misiones || 0; if (hm !== p._misionesVistas) { if (p.escuela === 'aspirante' && hm > p._misionesVistas) { p.academiaMisiones = Math.min(this.ACADEMIA_MISIONES, (p.academiaMisiones || 0) + (hm - p._misionesVistas)); if (p.academiaMisiones >= this.ACADEMIA_MISIONES) U.HUD.toast('🎓 Academia: ya cumpliste las ' + this.ACADEMIA_MISIONES + ' misiones fáciles. Solo falta el TORNEO ACADÉMICO para graduarte (Pausa → Progresión).', 'exito'); } p._misionesVistas = hm; }
    const ht = E.historial.torneos || 0; if (ht !== p._torneosVistos) { if (ht > p._torneosVistos) this.otorgarTitulo('Vencedor del Torneo de Bruma'); p._torneosVistos = ht; }
    (E.contratos ? E.contratos.sangre : []).forEach(uid => { if (p._sangreVistos.indexOf(uid) < 0) { p._sangreVistos.push(uid); const c = U.Criaturas ? U.Criaturas.buscar(uid) : null; this.otorgarTitulo('Domador de ' + (c ? U.Criaturas.nombreDe(c) : 'una criatura')); } });
    if (E.orgs && E.orgs.jade && E.orgs.jade.detenida) this.otorgarTitulo('Cazador de la Red');
    if (E.flags && E.flags.portalCruzado) this.otorgarTitulo('Caminante de Mundos');
    if (p.duelo) {
      if ((E.historial.derrotas || 0) > (p._derrotasVistas || 0)) { p.duelo = null; U.HUD.toast('Caíste en el duelo: no pasa nada, recupérate y vuelve a intentarlo cuando quieras (Pausa → Progresión). Perder un examen solo pide más práctica, no castiga tu rango.', 'aviso'); }
      else if (U.Combate.vivos().filter(e => e.esProg).length === 0 && E.ui === 'mundo') { const t = p.duelo.tipo; p.duelo = null; this.victoriaDuelo(t); }
    }
  },
  // ---------- acciones de la pantalla de Progresión ----------
  accion(a, ds) {
    const E = U.Juego.estado, p = this.asegurar(), j = E.jugador; if (!p) return; p._msg = null;
    const salir = () => { if (U.Juego.estado.ui === 'pausa') U.Juego.togglePausa(); };
    if (a === 'destelloModo') { E.destelloModo = ds.v || 'normal'; U.HUD.toast('Ajuste de destellos de pantalla: ' + ({ normal: 'NORMAL (destello suave completo)', suave: 'REDUCIDO (destello más tenue)', off: 'DESACTIVADO (sin velo blanco; la ceguera de Destello sigue funcionando)' })[E.destelloModo], 'exito'); if (U.Guardado) U.Guardado.guardarAuto(); return; }
    if (a === 'examenEmpezar') { p._examen = { idx: 0, aciertos: 0 }; return; }
    if (a === 'examenResp') { const ex = p._examen; if (!ex) return; const q = this.EXAMEN[ex.idx]; if (parseInt(ds.v) === q.ok) ex.aciertos++; ex.idx++;
      if (ex.idx >= this.EXAMEN.length) { p.examen.intentos++; p.examen.nota = ex.aciertos; const aprueba = ex.aciertos >= 4; p._examen = null;
        if (aprueba) { p.examen.aprobado = true; if (p.escuela === 'estudiante') p.escuela = 'aspirante'; U.HUD.banner('📚 ¡EXAMEN TEÓRICO APROBADO! · ' + ex.aciertos + '/' + this.EXAMEN.length + ' · AHORA ERES ASPIRANTE', 3); U.Audio.sfx('victoria'); }
        else { U.HUD.banner('📚 EXAMEN NO APROBADO · ' + ex.aciertos + '/' + this.EXAMEN.length + ' · PUEDES REINTENTARLO', 2.6); U.Audio.sfx('derrota'); U.HUD.toast('No pasa nada: el examen es OPCIONAL. Puedes seguir jugando, subiendo nivel y maestría como Estudiante, y reintentarlo cuando quieras.', 'aviso'); }
        if (U.Guardado) U.Guardado.guardarAuto(); } return; }
    if (a === 'examenCancelar') { p._examen = null; return; }
    if (a === 'torneoAcademico') { salir(); setTimeout(() => this.iniciarDuelo('academiaTorneo', [{ clase: 'bandido', mult: 0.85 }, { clase: 'brasa', mult: 0.85 }], '🎓 TORNEO ACADÉMICO · GANA Y TE GRADÚAS'), 80); return; }
    if (a === 'aprendiz') { const g = this.GUIAS.find(x => x.id === ds.v); if (!g) return; if (this.confianzaDe(g.id) < this.CONFIANZA_GUIA) { p._msg = g.nombre + ' aún no confía en ti lo suficiente (' + this.confianzaDe(g.id) + '/' + this.CONFIANZA_GUIA + '). Habla con esa persona, ayúdala, regálale su comida favorita: la confianza se gana, no se compra.'; return; } p.guia = g.id; U.HUD.banner('🌿 ¡' + g.nombre.toUpperCase() + ' TE ACEPTA COMO SU APRENDIZ!', 3); U.Audio.sfx('victoria'); U.HUD.toast('Eres Aprendiz de ' + g.nombre + '. Ojo: esto NO depende de la escuela — tu rango escolar sigue siendo ' + this.rangoEscuelaNom(p) + '. La escuela y el aprendizaje con un Guía son caminos separados.', 'exito'); if (U.Guardado) U.Guardado.guardarAuto(); return; }
    if (a === 'patrullaUnirse') { if (p.escuela !== 'graduado') { p._msg = 'La Patrulla es una institución formal: exige estar GRADUADO de la Academia. Tu rango escolar es ' + this.rangoEscuelaNom(p) + '.'; return; } if ((p.recompensa || 0) > 0) { p._msg = 'Tienes Recompensa activa (' + p.recompensa + ' ⭐): la Patrulla no acepta a nadie buscado. Espera días sin delitos hasta quedar en 0.'; return; } salir(); setTimeout(() => this.iniciarDuelo('patrullaIngreso', [{ clase: 'veterano', mult: 0.9, nombre: 'Guardia examinador del Cuartel' }], '🛡 EXAMEN DE COMBATE DEL CUARTEL · GANA Y ENTRAS COMO NOVATO'), 80); return; }
    if (a === 'patrullaMision') { const mult = { novato: 0.9, patrullero: 1.05, oficial: 1.2, elite: 1.4, lider: 1.5, guardian: 1.6 }[p.patrulla.rango] || 0.9; salir(); setTimeout(() => this.iniciarDuelo('patrullaMision', [{ clase: 'bandido', mult, nombre: 'Bandido en ronda de patrulla' }], '🛡 RONDA DE PATRULLA · DESPEJA LA AMENAZA'), 80); return; }
    if (a === 'patrullaExamen') { const meta = this.PATRULLA_META[p.patrulla.rango]; if (meta == null) return; if ((p.patrulla.misiones || 0) < meta) { p._msg = 'Aún no: para el examen de ascenso necesitas ' + meta + ' misiones de patrulla en este rango (llevas ' + (p.patrulla.misiones || 0) + ').'; return; } const mult = { novato: 1.1, patrullero: 1.3, oficial: 1.6, elite: 1.9 }[p.patrulla.rango] || 1.1; const tipo = p.patrulla.rango === 'elite' ? 'patrullaAscenso' : 'patrullaAscenso'; salir(); setTimeout(() => this.iniciarDuelo(tipo, [{ clase: 'veterano', mult, nombre: 'Guardia del siguiente rango' }], '🛡 EXAMEN DE ASCENSO · GANA Y SUBES DE RANGO'), 80); return; }
    if (a === 'liderDuelo') { salir(); setTimeout(() => this.iniciarDuelo('patrullaAscenso', [{ clase: 'veterano', mult: 2.0, nombre: 'Líder saliente de Bruma' }], '👑 EL PUESTO DE LÍDER SE ABRIÓ · DUELO POR EL LIDERAZGO'), 80); return; }
    if (a === 'guardianDuelo') { salir(); setTimeout(() => this.iniciarDuelo('patrullaAscenso', [{ clase: 'veterano', mult: 2.3, nombre: 'Guardián examinador' }, { clase: 'brasa', mult: 1.8, nombre: 'Guardia del Origen' }], '✦ UN PUESTO DE GUARDIÁN SE ABRIÓ · DUELO DE GUARDIANES'), 80); return; }
    if (a === 'gym') { const g = this.GIMNASIOS.find(x => x.id === ds.v); if (!g || p.medallas[g.id]) return; salir(); setTimeout(() => this.iniciarDuelo('gym:' + g.id, [{ clase: g.clase, mult: g.mult, nombre: g.lider }], '🏅 SALA DE COMBATE DE ' + g.pueblo.toUpperCase() + ' · ' + g.lider.toUpperCase()), 80); return; }
    if (a === 'defensaBruma') { salir(); setTimeout(() => this.iniciarDuelo('defensaBruma', [{ clase: 'bandido', mult: 1.0 }, { clase: 'bandido', mult: 1.0 }, { clase: 'brasa', mult: 1.0 }], '⚠ ¡BANDIDOS ATACAN BRUMA! · DEFIENDE EL PUEBLO'), 80); return; }
    if (a === 'defensaMetro') { salir(); setTimeout(() => this.iniciarDuelo('defensaMetro', [{ clase: 'bandido', mult: 1.2 }, { clase: 'brasa', mult: 1.2 }, { clase: 'ilusionista', mult: 1.2 }], '⚠ ¡ATAQUE A LA METRÓPOLIS! · DEFIÉNDELA'), 80); return; }
    if (a === 'sello') { salir(); setTimeout(() => this.iniciarDuelo('sello', [{ clase: 'ilusionista', mult: 1.3 }, { clase: 'ilusionista', mult: 1.3 }], '🔒 MERODEADORES JUNTO AL SELLO · PROTÉGELO'), 80); return; }
    if (a === 'torneoMetro') { salir(); setTimeout(() => this.iniciarDuelo('torneoMetro', [{ clase: 'veterano', mult: 1.7, nombre: 'Finalista de la Metrópolis' }, { clase: 'chaman', mult: 1.5, nombre: 'Semifinalista de la Metrópolis' }], '👑 TORNEO DE LA METRÓPOLIS · LA FINAL'), 80); return; }
  },
  // ---------- HTML de la sección de pausa ----------
  htmlPausa() {
    const E = U.Juego.estado, p = this.asegurar(), j = E.jugador; if (!p) return '';
    const esc = s => U.HUD.escHtml(s); let h = ''; if (p._msg) h += '<section style="border-color:var(--rayo)"><div style="font-size:12.5px">' + esc(p._msg) + '</div></section>';
    h += '<section><h3>🎓 Rangos · tu situación</h3><div style="font-size:12.5px">Rango escolar: <b style="color:var(--rayo)">' + this.rangoEscuelaNom(p).toUpperCase() + '</b>'
      + (p.guia ? ' · <b style="color:var(--viento)">Aprendiz de ' + esc((this.GUIAS.find(g => g.id === p.guia) || {}).nombre || p.guia) + '</b>' : '')
      + (p.patrulla.rango ? ' · <b style="color:var(--agua)">Patrulla: ' + this.PATRULLA_NOM[p.patrulla.rango] + '</b>' : '')
      + '<br>Recompensa (se busca): ' + (p.recompensa > 0 ? '<b style="color:var(--peligro)">' + '⭐'.repeat(p.recompensa) + ' ' + p.recompensa + ' activa</b> — baja 1 por día sin delitos' : '<b style="color:var(--exito)">sin estrellas</b> · ciudadano limpio')
      + '<br><span style="color:var(--textoFrio)">Medallas de gimnasio: ' + this.GIMNASIOS.filter(g => p.medallas[g.id]).length + '/' + this.GIMNASIOS.length + ' · Misiones entregadas en tu vida: ' + (E.historial.misiones || 0) + ' · Nivel y maestría suben siempre, tengas el rango que tengas.</span></div></section>';
    // ESCUELA
    h += '<section><h3>📚 La Escuela · teoría (eres ' + this.rangoEscuelaNom(p) + ')</h3><div style="font-size:12px;color:var(--textoFrio)">La escuela es solo TEORÍA: libros, preguntas, el mundo, los elementos, la historia y las reglas. Empiezas como un niño en la escuela, no como un guerrero. El examen final es ESCRITO (preguntas) y es <b>OPCIONAL</b>: sin pasarlo sigues jugando y subiendo nivel y maestría igual; solo no subes de rango escolar.</div>';
    if (p._examen) { const q = this.EXAMEN[p._examen.idx]; h += '<div style="font-size:13px;margin-top:8px"><b>Examen teórico · pregunta ' + (p._examen.idx + 1) + '/' + this.EXAMEN.length + '</b> (aciertos: ' + p._examen.aciertos + ' · apruebas con 4)</div><div style="font-size:13.5px;margin:6px 0">' + esc(q.q) + '</div><div class="menuLista">' + q.ops.map((o, i) => '<button data-prog="examenResp" data-v="' + i + '">' + esc(o) + '</button>').join('') + '</div><button class="mini" data-prog="examenCancelar">ABANDONAR EXAMEN (sin castigo)</button>'; }
    else if (p.escuela === 'estudiante') { h += '<div style="font-size:12px;margin-top:6px">Examen: ' + (p.examen.intentos ? 'intentado ' + p.examen.intentos + ' vez/veces · mejor nota ' + p.examen.nota + '/' + this.EXAMEN.length : 'sin intentar') + '.</div><button class="mini exito" data-prog="examenEmpezar" style="margin-top:6px">✏ PRESENTAR EL EXAMEN TEÓRICO (opcional)</button>'; }
    else h += '<div style="font-size:12px;color:var(--exito);margin-top:6px">✓ Examen teórico aprobado (' + p.examen.nota + '/' + this.EXAMEN.length + '). Ya no eres solo un estudiante de teoría.</div>';
    h += '</section>';
    // ACADEMIA
    h += '<section><h3>🥋 La Academia · práctica</h3><div style="font-size:12px;color:var(--textoFrio)">La academia es PRÁCTICA: entrenamiento físico, combate y misiones fáciles — nada que ver con los libros de la escuela.</div>';
    if (p.escuela === 'estudiante') h += '<div style="font-size:12px;margin-top:6px">Para entrar necesitas aprobar el examen teórico de la escuela (arriba). Mientras tanto puedes jugar libre: entrenar, explorar y hacerte Aprendiz de un Guía (abajo) sin graduarte de nada.</div>';
    else if (p.escuela === 'aspirante') h += '<div style="font-size:12px;margin-top:6px">Misiones fáciles de la Academia: <b>' + (p.academiaMisiones || 0) + '/' + this.ACADEMIA_MISIONES + '</b> (entrega misiones del tablón de Lía, en la Oficina). ' + (p.academiaMisiones >= this.ACADEMIA_MISIONES ? '<br><button class="mini exito" data-prog="torneoAcademico" style="margin-top:6px">🏆 PRESENTAR EL TORNEO ACADÉMICO (graduación)</button>' : 'Al completarlas se abre el Torneo Académico de graduación.') + '</div>';
    else h += '<div style="font-size:12px;color:var(--exito);margin-top:6px">✓ Academia superada: eres GRADUADO. Puedes hacer más misiones (rangos altos del tablón) y elegir camino abajo.</div>';
    h += '</section>';
    // RAMIFICACIÓN
    h += '<section><h3>🌿 Tu camino · tú eliges (nada es una escalera obligatoria)</h3>';
    h += '<div style="font-size:12.5px;margin:6px 0"><b style="color:var(--viento)">APRENDIZ</b> — la confianza de un Guía, no la escuela. ' + (p.guia ? '<span style="color:var(--exito)">Ya eres Aprendiz de ' + esc((this.GUIAS.find(g => g.id === p.guia) || {}).nombre || '') + '.</span>' : 'Necesitas confianza ' + this.CONFIANZA_GUIA + ' con un Guía:') + '</div>' + (!p.guia ? this.GUIAS.map(g => '<div class="mochilaItem"><span><b>' + g.nombre + '</b> <small style="color:var(--textoFrio)">' + g.dato + ' · confianza ' + this.confianzaDe(g.id) + '/' + this.CONFIANZA_GUIA + '</small></span><span class="acts"><button class="mini exito" data-prog="aprendiz" data-v="' + g.id + '">PEDIR SER SU APRENDIZ</button></span></div>').join('') : '');
    // CUARTEL
    h += '<div style="font-size:12.5px;margin:10px 0 6px"><b style="color:var(--agua)">PATRULLA · Cuartel de la Patrulla</b> — su base es el Cuartel: aquí te unes, aquí te dan las misiones y aquí presentas los exámenes de combate.</div>';
    if (!p.patrulla.rango) h += '<div style="font-size:12px;color:var(--textoFrio)">Requisitos para unirte: estar <b>Graduado</b>, <b>sin Recompensa activa</b> (0 ⭐) y <b>ganar el examen de combate</b> de ingreso. Hoy: graduado ' + (p.escuela === 'graduado' ? '✓' : '✗ (' + this.rangoEscuelaNom(p) + ')') + ' · recompensa ' + (p.recompensa > 0 ? '✗ (' + p.recompensa + ' ⭐)' : '✓') + '.</div><button class="mini exito" data-prog="patrullaUnirse" style="margin-top:6px">🛡 UNIRME A LA PATRULLA (examen de combate)</button>';
    else { const meta = this.PATRULLA_META[p.patrulla.rango]; h += '<div style="font-size:12px">Tu rango: <b style="color:var(--agua)">' + this.PATRULLA_NOM[p.patrulla.rango] + '</b> · misiones de patrulla en este rango: <b>' + (p.patrulla.misiones || 0) + (meta != null ? '/' + meta : '') + '</b>.</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><button class="mini exito" data-prog="patrullaMision">🛡 HACER UNA RONDA DE PATRULLA (+20 🪙)</button>'
      + (meta != null ? '<button class="mini" data-prog="patrullaExamen">⚔ EXAMEN DE ASCENSO A ' + this.PATRULLA_NOM[this.PATRULLA_RANGOS[this.PATRULLA_RANGOS.indexOf(p.patrulla.rango) + 1]].toUpperCase() + '</button>' : '')
      + (p.patrulla.rango === 'elite' ? '<button class="mini" data-prog="liderDuelo">👑 EL PUESTO DE LÍDER SE ABRIÓ: COMPETIR POR ÉL</button>' : '')
      + (p.patrulla.rango === 'lider' ? '<button class="mini" data-prog="guardianDuelo">✦ SE ABRIÓ UN PUESTO DE GUARDIÁN: COMPETIR POR ÉL</button>' : '')
      + (p.patrulla.rango === 'guardian' ? '<span style="font-size:12px;color:var(--exito)">Eres uno de Los 5 Guardianes, la élite que cuida El Origen. Y sí: un líder puede salir de su pueblo — por eso pudiste llegar hasta aquí.</span>' : '')
      + '</div><div style="font-size:11px;color:var(--textoTenue);margin-top:4px">Subes por misiones + examen de combate (un duelo contra un guardia del siguiente rango): si pierdes, haces más misiones y lo intentas de nuevo. Tras Élite, cuando el puesto de líder se abre, los Élite compiten por él; y un líder puede volverse Guardián cuando se abre un puesto, dejando su pueblo a un nuevo líder.</div>'; }
    // PELEADOR / GIMNASIOS
    h += '<div style="font-size:12.5px;margin:10px 0 6px"><b style="color:var(--fuego)">PELEADOR · gimnasios</b> — cada pueblo tiene su sala de combate con un líder fuerte. Derríbalo y ganas su certificado/medalla. Con TODAS, el título de <b>Guerrero</b>.</div>'
      + this.GIMNASIOS.map(g => '<div class="mochilaItem"><span>' + (p.medallas[g.id] ? '🏅' : '🥊') + ' <b>' + g.pueblo + '</b> <small style="color:var(--textoFrio)">' + g.lider + (p.medallas[g.id] ? ' · ya tienes la ' + g.medalla : ' · premio: ' + g.medalla) + '</small></span><span class="acts">' + (p.medallas[g.id] ? '<span style="color:var(--exito);font-size:12px">MEDALLA ✓</span>' : '<button class="mini exito" data-prog="gym" data-v="' + g.id + '">RETAR AL LÍDER</button>') + '</span></div>').join('');
    h += '</section>';
    // EVENTOS DE HAZAÑA (títulos)
    h += '<section><h3>🏅 Hazañas · gana títulos defendiéndolos</h3><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="mini" data-prog="defensaBruma">⚠ DEFENDER BRUMA DE UN ATAQUE</button><button class="mini" data-prog="defensaMetro">⚠ DEFENDER LA METRÓPOLIS</button><button class="mini" data-prog="sello">🔒 PROTEGER EL SELLO</button><button class="mini" data-prog="torneoMetro">👑 TORNEO DE LA METRÓPOLIS</button></div><div style="font-size:11px;color:var(--textoTenue);margin-top:4px">Otros títulos llegan solos con tus hazañas: Domador de una criatura (contrato de sangre), Vencedor del Torneo de Bruma (ganar el torneo), Cazador de la Red (frenar a La Red de Jade) y Caminante de Mundos (cruzar el portal cuando despierte).</div></section>';
    // TÍTULOS
    h += '<section><h3>🏅 Tus títulos (' + p.titulos.length + ')</h3>' + (p.titulos.length ? '<div class="listaProx">' + p.titulos.map(t => '<span style="border-style:solid;color:var(--rayo)">🏅 ' + esc(t) + '</span>').join('') + '</div>' : '<div style="font-size:12px;color:var(--textoFrio)">Aún no tienes títulos. Se ganan por hazañas concretas (defender un pueblo, domar una criatura, ganar un torneo, juntar todas las medallas…), no por subir una escalera: son independientes y puedes tener varios a la vez.</div>') + '</section>';
    // AJUSTE DESTELLOS
    h += '<section><h3>✦ Ajuste · destellos de pantalla (Destello de Rayo)</h3><div style="font-size:12px;color:var(--textoFrio)">El destello es suave y gradual, nunca un parpadeo brusco. Si te molesta la luz, redúcelo o apágalo: la técnica sigue cegando igual.</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">' + ['normal', 'suave', 'off'].map(m2 => '<button class="mini' + ((E.destelloModo || 'normal') === m2 ? ' exito' : '') + '" data-prog="destelloModo" data-v="' + m2 + '">' + ({ normal: 'NORMAL', suave: 'REDUCIDO', off: 'DESACTIVADO' })[m2] + '</button>').join('') + '</div></section>';
    h += (U.Aprendiz ? U.Aprendiz.htmlResumen() : ''); // IDEA 4: el progreso de Taro, tu aprendiz
    return h;
  },
  resumenPerfil() {
    const E = U.Juego.estado, p = this.asegurar(); if (!p) return '';
    const esc = s => U.HUD.escHtml(s);
    return '<section><h3>🎓 Rangos · caminos · títulos</h3><div style="font-size:12.5px">Rango escolar: <b style="color:var(--rayo)">' + this.rangoEscuelaNom(p).toUpperCase() + '</b>'
      + (p.guia ? ' · Aprendiz de <b>' + esc((this.GUIAS.find(g => g.id === p.guia) || {}).nombre || p.guia) + '</b>' : '')
      + (p.patrulla.rango ? ' · Patrulla: <b>' + this.PATRULLA_NOM[p.patrulla.rango] + '</b>' : '')
      + ' · Medallas: <b>' + this.GIMNASIOS.filter(g => p.medallas[g.id]).length + '/' + this.GIMNASIOS.length + '</b>'
      + (p.recompensa > 0 ? ' · <b style="color:var(--peligro)">Recompensa: ' + p.recompensa + ' ⭐</b>' : ' · Sin recompensa')
      + '</div><div style="font-size:12px;margin-top:5px">Títulos: ' + (p.titulos.length ? p.titulos.map(t => '<span style="color:var(--rayo)">🏅 ' + esc(t) + '</span>').join(' · ') : '<span style="color:var(--textoFrio)">ninguno todavía — se ganan por hazañas, en Pausa → Progresión</span>') + '</div><div style="font-size:11px;color:var(--textoTenue);margin-top:4px">Escuela (teoría) y Academia (práctica), el Cuartel de la Patrulla, los gimnasios y los exámenes viven en Pausa → 🎓 Progresión.</div></section>';
  }
};
