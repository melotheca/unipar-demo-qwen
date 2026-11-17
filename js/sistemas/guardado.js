/* === js/sistemas/guardado.js === */
/* Unipar — guardado de partida.
   GUARDADO AUTOMÁTICO (siempre activo, como pidió el jugador): la partida se guarda sola en
   el almacenamiento del propio navegador — al nacer, cada pocos segundos, al abrir/cerrar
   Opciones y al salir de la página — sin descargar ni subir ningún archivo. Al volver a
   entrar, la pantalla inicial ofrece CONTINUAR PARTIDA y sigues donde ibas. Ese guardado
   vive en este navegador y este teléfono: en otro navegador u otro teléfono empieza vacío.
   DESCARGAR PARTIDA (en Opciones ⚙): además, quien quiera puede bajar su partida como
   archivo JSON de respaldo, para conservarla donde quiera o pasarla a otro dispositivo, y
   volver a cargarla con CARGAR DESDE ARCHIVO (Opciones o pantalla inicial).
   Si el navegador bloqueara su almacenamiento, el automático cae a memoria de la sesión:
   sigue guardando solo mientras la página está abierta. */
window.U = window.U || {};

U.Guardado = {
  CLAVE: 'unipar_partida_auto_v1',
  _mem: null, _ultimoAuto: null, _autoIniciado: false,
  aviso(msg, ok) {
    const E = U.Juego.estado;
    if (E && !U.TestUI.activo) { U.HUD.banner(ok ? 'PARTIDA CARGADA' : 'NO SE PUDO CARGAR', 1.8); if (!ok) U.HUD.toast(msg, 'peligro'); }
    else { const pie = document.getElementById('testPie'); if (pie) pie.innerHTML = msg; }
    if (window.console) console.log('Unipar guardado: ' + msg);
  },
  fechaTexto(iso) { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return '—'; const p = n => String(n).padStart(2, '0'); return p(d.getDate()) + '/' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); },
  horaTexto(iso) { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return '—'; const p = n => String(n).padStart(2, '0'); return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()); },
  ultimoAutoTexto() { const d = this.leerAuto(); const iso = this._ultimoAuto || (d && d.guardadoEn); return iso ? this.fechaTexto(iso) + ' · ' + this.horaTexto(iso) : 'todavía sin guardar en esta sesión'; },
  serializar() {
    const E = U.Juego.estado; if (!E || !E.jugador) return null; const j = E.jugador;
    return {
      juego: 'unipar', version: 1, mundoContinuo: true, guardadoEn: new Date().toISOString(), semilla: E.semilla,
      nombre: j.nombre, mapaId: E.mapaId, x: Math.round(j.x * 100) / 100, y: Math.round(j.y * 100) / 100,
      perfil: { elemento: j.perfil.elemento, elemento2: j.perfil.elemento2 || null, atributo: j.atributo, estilo: j.perfil.estilo, yangAfin: !!j.perfil.yangAfin },
      stats: Object.assign({}, j.stats), vida: Math.round(j.vida * 100) / 100, esencia: Math.round(j.esencia * 100) / 100,
      maestria: Object.assign({}, j.maestria), estilos: Object.assign({}, j.estilos), tieneYang: !!j.tieneYang,
      elementoActivo: j.elementoActivo, tecnicaIdx: j.tecnicaIdx || 0, yangForma: j.yangForma || 'haz',
      pociones: (j.bolsaPociones || []).length, bolsaPociones: (j.bolsaPociones || []).map(x => Object.assign({}, x)), bolsaComida: (j.bolsaComida || []).slice(), karma: Object.assign({}, j.karma || {}), sabores: (j.sabores || []).slice(), polainas: Object.assign({}, j.polainas || {}), polainaEquipada: j.polainaEquipada || null, comidasHoy: j.comidasHoy || 0, permisoHasta: j.permisoHasta || 0, promesas: (j.promesas || []).map(x => Object.assign({}, x)), tablon: E.tablon ? { dia: E.tablon.dia, lista: E.tablon.lista } : null, monedas: Math.floor(j.monedas || 0), reliquias: j.reliquias ? { tenidas: (j.reliquias.tenidas || []).slice(), puesta: j.reliquias.puesta || null, artefactos: (j.reliquias.artefactos || []).slice(), casa: (j.reliquias.casa || []).slice(), encontradas: (j.reliquias.encontradas || []).slice() } : null, prohibidas: j.prohibidas ? { pergaminos: (j.prohibidas.pergaminos || []).slice(), aprendidas: (j.prohibidas.aprendidas || []).slice(), casa: (j.prohibidas.casa || []).slice(), encontradas: (j.prohibidas.encontradas || []).slice() } : null, prohibidaSel: j.prohibidaSel || null, misionIdx: E.misionIdx || 0, mision: E.mision ? Object.assign({}, E.mision) : null, regenBonus: j.regenBonus || 0, crecimientoTotal: Object.assign({}, U.Crecimiento.total || {}),
      escudoAprendido: !!j.escudoAprendido, escudoNv: j.escudoNv || 0, escudoExp: j.escudoExp || 0, cansancio: Math.round((j.cansancio != null ? j.cansancio : U.Recuperacion.condicionMax(j)) * 10) / 10, condicionExtra: Math.max(0, Math.min(100, j.condicionExtra || 0)), gastoFatiga: Math.round((j.gastoFatiga || 0) * 100) / 100,
      relojMinutos: E.reloj ? E.reloj.minutos : 540, dia: E.reloj ? (E.reloj.dia || 1) : 1, diaSemana: E.reloj ? (E.reloj.diaSemana || 0) : 0, climaTipo: E.clima ? E.clima.tipo : 'despejado', climaIntensidad: E.clima ? (E.clima.intensidad || 0) : 0, alarmaMin: E.alarmaMin != null ? E.alarmaMin : 420, historial: Object.assign({}, E.historial || {}), dificultad: E.dificultad, ronda: E.arena.ronda,
      objetivos: E.objetivos.map(o => o.estado), objetivoIdx: E.objetivoIdx, flags: Object.assign({}, E.flags), orgs: E.orgs ? JSON.parse(JSON.stringify(E.orgs)) : null,
      npcs: (E.roster || E.npcs || []).map(n => ({ id: n.id, estados: Object.assign({}, n.estados), emocion: n.emocion, saludado: !!n.saludado, entreno: !!n.entreno, stockPociones: n.stockPociones, hechos: (n.hechos || []).slice(), veces: n.veces || 0, mapa: n.mapa || 'aldea', x: Math.round(n.x * 100) / 100, y: Math.round(n.y * 100) / 100 })),
      criaturas: (E.criaturas || []).map(c => ({ uid: c.uid, vinculo: Math.round(c.vinculo * 10) / 10, vida: Math.round(c.vida), invocada: !!c.invocada, x: Math.round(c.x * 100) / 100, y: Math.round(c.y * 100) / 100 })),
      contratos: E.contratos ? { sangre: E.contratos.sangre.slice(), alma: E.contratos.alma || null } : { sangre: [], alma: null },
      prog: (E.prog && U.Progresion) ? U.Progresion.serializable() : null, destelloModo: E.destelloModo || 'normal'
    };
  },
  // --- Guardado automático: siempre activo, sin que el jugador haga nada ---
  guardarAuto() {
    if (U.TestUI && U.TestUI.activo) return false;
    const datos = this.serializar(); if (!datos) return false;
    this._mem = datos; this._ultimoAuto = datos.guardadoEn;
    try { localStorage.setItem(this.CLAVE, JSON.stringify(datos)); } catch (e) { /* almacenamiento bloqueado: queda la copia en memoria de la sesión */ }
    return true;
  },
  leerAuto() {
    try { const s = localStorage.getItem(this.CLAVE); if (s) { const d = JSON.parse(s); if (d && d.juego === 'unipar' && d.perfil && d.stats && d.semilla) return d; } } catch (e) { /* sin acceso al almacenamiento */ }
    return this._mem;
  },
  hayAuto() { return !!this.leerAuto(); },
  cargarAuto() { const d = this.leerAuto(); if (!d) { this.aviso('No hay ninguna partida guardada automáticamente todavía.', false); return; } this.cargar(d); },
  borrarAuto() { this._mem = null; this._ultimoAuto = null; try { localStorage.removeItem(this.CLAVE); } catch (e) {} },
  iniciarAuto() {
    if (this._autoIniciado) return; this._autoIniciado = true;
    setInterval(() => this.guardarAuto(), 5000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') this.guardarAuto(); });
    window.addEventListener('pagehide', () => this.guardarAuto());
    window.addEventListener('beforeunload', () => this.guardarAuto());
  },
  // --- Descarga de respaldo (Opciones): la partida como archivo, para quien la quiera fuera del navegador ---
  descargar() {
    const datos = this.serializar(); if (!datos) return; const j = U.Juego.estado.jugador;
    this.guardarAuto();
    const blob = new Blob([JSON.stringify(datos, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'unipar-partida-' + String(j.nombre || 'vida').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    U.HUD.banner('PARTIDA DESCARGADA · ARCHIVO DE RESPALDO', 2); U.Audio.sfx('unlock');
  },
  guardar() { this.descargar(); }, // compatibilidad: guardar = descargar respaldo (el automático ya va por su cuenta)
  elegirArchivo() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.addEventListener('change', () => { const f = inp.files && inp.files[0]; if (f) this.leer(f); });
    inp.click();
  },
  leer(f) {
    const r = new FileReader();
    r.onload = () => { try { this.cargar(JSON.parse(String(r.result))); } catch (e) { this.aviso('Ese archivo no es una partida válida de Unipar.', false); } };
    r.onerror = () => this.aviso('No se pudo leer el archivo de partida.', false);
    r.readAsText(f);
  },
  cargar(d) {
    if (!d || d.juego !== 'unipar' || !d.perfil || !d.stats || !d.semilla) { this.aviso('Ese archivo no es una partida válida de Unipar.', false); return; }
    const perfil = { elemento: d.perfil.elemento, elemento2: d.perfil.elemento2 || null, atributo: d.perfil.atributo, estilo: d.perfil.estilo || 'yin', yangAfin: !!d.perfil.yangAfin, sabores: Array.isArray(d.sabores) && d.sabores.length === 5 ? d.sabores.slice() : null,
      stats: Object.assign({}, d.stats), maestria: Object.assign({ fuego: 0, agua: 0, tierra: 0, viento: 0, rayo: 0 }, d.maestria), estilos: Object.assign({ yin: 0, yang: 0 }, d.estilos), distr: {}, scores: null };
    U.Audio.init(); U.Audio.reanudar();
    U.TestUI.activo = false; U.TestUI.escena = null; document.getElementById('test').classList.add('oculto');
    const pausa = document.getElementById('pausa'); if (pausa) pausa.classList.add('oculto');
    U.Juego.comenzarMundo(perfil, d.semilla, d.nombre || 'Sin nombre');
    const E = U.Juego.estado, j = E.jugador;
    j.vida = Math.min(j.stats.vida, d.vida != null ? d.vida : j.stats.vida); j.esencia = Math.min(j.stats.esencia, d.esencia != null ? d.esencia : j.stats.esencia);
    j.bolsaPociones = Array.isArray(d.bolsaPociones) ? d.bolsaPociones.map(x => Object.assign({}, x)) : Array.from({ length: Math.min(3, d.pociones || 0) }, () => ({ tipo: 'vida', unidades: 50, precio: 15 })); j.pociones = j.bolsaPociones.length; j.bolsaComida = Array.isArray(d.bolsaComida) ? d.bolsaComida.slice(0, 5) : []; j.karma = Object.assign({}, d.karma || {}); if (Array.isArray(d.sabores) && d.sabores.length === 5) j.sabores = d.sabores.slice(); j.polainas = Object.assign({}, d.polainas || {}); j.polainaEquipada = d.polainaEquipada && j.polainas[d.polainaEquipada] ? d.polainaEquipada : null; j.polainaMultCrec = j.polainaEquipada ? U.Economia.POLAINAS[j.polainaEquipada].crecMult : 1; j.comidasHoy = d.comidasHoy || 0; j.permisoHasta = d.permisoHasta || 0; j.promesas = Array.isArray(d.promesas) ? d.promesas : []; if (d.tablon && Array.isArray(d.tablon.lista)) E.tablon = d.tablon; E.ultimoDia = E.reloj ? E.reloj.dia : 1;
    j.monedas = d.monedas != null ? d.monedas : 0; E.misionIdx = d.misionIdx || 0; if (d.mision) E.mision = Object.assign({}, d.mision); j.regenBonus = d.regenBonus || 0; j.tieneYang = !!d.tieneYang;
    if (d.reliquias) { j.reliquias = { tenidas: Array.isArray(d.reliquias.tenidas) ? d.reliquias.tenidas.slice() : [], puesta: d.reliquias.puesta || null, artefactos: Array.isArray(d.reliquias.artefactos) ? d.reliquias.artefactos.slice() : [], casa: Array.isArray(d.reliquias.casa) ? d.reliquias.casa.slice() : [], encontradas: Array.isArray(d.reliquias.encontradas) ? d.reliquias.encontradas.slice() : [] }; if (j.reliquias.puesta && j.reliquias.tenidas.indexOf(j.reliquias.puesta) < 0) j.reliquias.puesta = null; }
    if (d.prohibidas) { j.prohibidas = { pergaminos: Array.isArray(d.prohibidas.pergaminos) ? d.prohibidas.pergaminos.slice() : [], aprendidas: Array.isArray(d.prohibidas.aprendidas) ? d.prohibidas.aprendidas.slice() : [], casa: Array.isArray(d.prohibidas.casa) ? d.prohibidas.casa.slice() : [], encontradas: Array.isArray(d.prohibidas.encontradas) ? d.prohibidas.encontradas.slice() : [] }; j.prohibidaSel = d.prohibidaSel && j.prohibidas.aprendidas.indexOf(d.prohibidaSel) >= 0 ? d.prohibidaSel : (j.prohibidas.aprendidas[0] || null); j.cdProh = {}; }
    // Escudo aprendido y Condición: las partidas viejas no traen condicionExtra → 0 (máximo base 100 + bono de Yin) y la Condición se limita a su máximo actual.
    j.escudoAprendido = !!d.escudoAprendido; j.escudoNv = d.escudoNv || (j.escudoAprendido ? 1 : 0); j.escudoExp = d.escudoExp || 0; j.escudoVida = 0; j.escudo = false; j.condicionExtra = d.condicionExtra != null ? Math.max(0, Math.min(100, d.condicionExtra)) : 0; { const maxC = U.Recuperacion.condicionMax(j); j.cansancio = d.cansancio != null ? Math.max(0, Math.min(maxC, d.cansancio)) : maxC; } j.gastoFatiga = d.gastoFatiga || 0;
    j.tecnicaIdx = d.tecnicaIdx || 0; j.yangForma = d.yangForma || 'haz'; if (d.elementoActivo && j.elementos.indexOf(d.elementoActivo) >= 0) j.elementoActivo = d.elementoActivo;
    if (d.crecimientoTotal) U.Crecimiento.total = Object.assign({}, d.crecimientoTotal);
    if (E.reloj && d.relojMinutos != null) E.reloj.minutos = ((d.relojMinutos % 1440) + 1440) % 1440;
    if (E.reloj) { if (d.dia) E.reloj.dia = d.dia; if (d.diaSemana != null) E.reloj.diaSemana = d.diaSemana; }
    if (d.climaTipo && U.Clima.TIPOS[d.climaTipo]) E.clima = { tipo: d.climaTipo, intensidad: d.climaIntensidad != null ? d.climaIntensidad : (d.climaTipo === 'tormenta' ? 4 : d.climaTipo === 'lluvia' ? 2 : 0), restante: 180 };
    if (d.alarmaMin != null) E.alarmaMin = d.alarmaMin;
    if (d.historial) Object.assign(E.historial, d.historial);
    E.dificultad = d.dificultad || 1; E.arena.ronda = d.ronda || 1; Object.assign(E.flags, d.flags || {});
    if (Array.isArray(d.objetivos)) d.objetivos.forEach((s, i) => { if (E.objetivos[i]) E.objetivos[i].estado = s; });
    if (d.orgs) { E.orgs = U.Orgs.nuevoEstado(); ['mano', 'jade', 'cole'].forEach(k => { if (d.orgs[k]) Object.assign(E.orgs[k], d.orgs[k]); }); if (d.orgs.secreta) Object.assign(E.orgs.secreta, d.orgs.secreta); if (d.orgs.cd != null) E.orgs.cd = d.orgs.cd; if (d.orgs.escondites) E.orgs.escondites = d.orgs.escondites; }
    E.objetivoIdx = Math.min(d.objetivoIdx || 0, E.objetivos.length - 1);
    (d.npcs || []).forEach(sn => { const n = (E.roster || E.npcs).find(x => x.id === sn.id); if (n) { Object.assign(n.estados, sn.estados || {}); n.emocion = sn.emocion || n.emocion; n.saludado = !!sn.saludado; n.entreno = !!sn.entreno; if (sn.stockPociones != null) n.stockPociones = sn.stockPociones; if (Array.isArray(sn.hechos)) n.hechos = sn.hechos.slice(); if (sn.veces) n.veces = sn.veces; if (sn.mapa) n.mapa = sn.mapa; if (sn.x != null && sn.y != null) { n.x = sn.x; n.y = sn.y; } if (!d.mundoContinuo) { if (n.mapa === 'bosque') { n.x += 4; n.y += 4; n.mapa = 'aldea'; } else if (n.mapa === 'aldea') { n.x += 58; n.y += 60; } } n.ruta = []; n.rutaKey = ''; n.viaje = null; } }); if (U.Juego.refrescarNpcs) U.Juego.refrescarNpcs();
    // Criaturas salvajes y contratos: vínculo, posición e invocación de esta vida (el de alma, además, vive en el pasaporte).
    if (Array.isArray(d.criaturas)) d.criaturas.forEach(sc => { const c = (E.criaturas || []).find(x => x.uid === sc.uid); if (c) { if (sc.vinculo != null) c.vinculo = Math.max(0, Math.min(100, sc.vinculo)); if (sc.vida != null) c.vida = Math.max(0, Math.min(c.stats.vida, sc.vida)); if (sc.x != null && sc.y != null && c.vida > 0) { c.x = sc.x; c.y = sc.y; } c.invocada = !!sc.invocada && !!(d.contratos && ((d.contratos.sangre || []).indexOf(c.uid) >= 0 || d.contratos.alma === c.uid)); if (c.invocada) c.estado = 'companera'; } });
    if (d.contratos) { E.contratos = { sangre: Array.isArray(d.contratos.sangre) ? d.contratos.sangre.slice(0, 3) : [], alma: d.contratos.alma || null }; U.Criaturas.contratoSangre = E.contratos.sangre.slice(); U.Criaturas.contratoAlma = E.contratos.alma; }
    if (d.prog && U.Progresion) { const base = U.Progresion.nuevo(); E.prog = Object.assign(base, d.prog); E.prog.examen = Object.assign({ intentos: 0, aprobado: false, nota: 0 }, d.prog.examen || {}); E.prog.patrulla = Object.assign({ rango: null, misiones: 0 }, d.prog.patrulla || {}); E.prog.duelo = null; E.prog._examen = null; }
    if (d.destelloModo) E.destelloModo = d.destelloModo;
    if (d.mapaId && d.mapaId !== 'aldea') U.Juego.cambiarMapa(d.mapaId, { x: d.x, y: d.y }, true);
    else if (!d.mundoContinuo && d.x != null && d.y != null && d.x < 84 && d.y < 62) { j.x = d.x + 58; j.y = d.y + 60; }
    else { j.x = d.x != null ? d.x : j.x; j.y = d.y != null ? d.y : j.y; }
    E.camara.x = j.x * 16 - U.Render.viewW / 2; E.camara.y = j.y * 16 - U.Render.viewH / 2;
    E.ui = 'mundo';
    U.HUD.refrescarSimbolos(); U.HUD.refrescarChips();
    this.guardarAuto(); // lo cargado pasa a ser también el guardado automático vigente
    this.aviso('Partida cargada: ' + j.nombre + ' · ' + U.Elementos.nombre(j.elemento) + ' · semilla ' + E.semilla, true);
  }
};
