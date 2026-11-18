/* === js/ui/hud.js === */
/* Unipar — HUD: barras con números, maestría visible, símbolos de elemento como botones, chips de técnica/Yang, zona con costo ajustado, controles táctiles, pausa y paneles de fin. */
window.U = window.U || {};

U.HUD = {
  el: {}, tNum: 0, tMini: 0, bannerT: 0, _enCombate: false, _enArena: false, joy: { activo: false, id: null, cx: 0, cy: 0, r: 60 },
  init() {
    const $ = id => document.getElementById(id); this.el = { hud: $('hud'), rellVida: $('rellVida'), numVida: $('numVida'), rellEsencia: $('rellEsencia'), numEsencia: $('numEsencia'), rellCansancio: $('rellCansancio'), numCansancio: $('numCansancio'), agotado: $('agotado'), simbolos: $('simbolos'), pocion: $('btnPocion'), mini: $('minimapa'), obj: $('objTexto'), btnObj: $('objetivo'), objDetalle: $('objetivoDetalle'), objDetalleTexto: $('objDetalleTexto'), objDetalleLista: $('objDetalleLista'), banner: $('banner'), descanso: $('descansoInd'), rellDescanso: $('rellDescanso'), descansoTxt: $('descansoTxt'), btnInfo: $('btnReloj'), infoDetalle: $('infoDetalle'), calTexto: $('calTexto'), horaTexto: $('horaTexto'), horaMomento: $('horaMomento'), climaIcono: $('climaIcono'), climaTexto: $('climaTexto'), climaDetalle: $('climaDetalle'), tempTexto: $('tempTexto'), sensTexto: $('sensTexto'), sensNota: $('sensNota'), precipTexto: $('precipTexto'), precipNota: $('precipNota'), humTexto: $('humTexto'), vientoTexto: $('vientoTexto'), vientoNota: $('vientoNota'), btnA: $('btnA'), btnYin: $('btnYin'), btnYang: $('btnYang'), btnTec: $('btnTec'), btnDash: $('btnDash'), btnSobre: $('btnSobrecarga'), btnAgua: $('btnAgua'), btnAguaTexto: $('btnAguaTexto'), btnAguaEstado: $('btnAguaEstado'), chipsTec: $('chipsTec'), chipsYang: $('chipsYang'), chipsProh: $('chipsProh'), btnProh: $('btnProh'), sonido: $('btnSonido'), pausa: $('pausa'), pausaCuerpo: $('pausaCuerpo'), fin: $('panelFin') };
    // Iconos de acción (vectoriales suaves, sin pixelar)
    this.el.btnEscudo = $('btnEscudo'); if (this.el.btnEscudo) U.Render.iconoSuave(this.el.btnEscudo.querySelector('canvas'), 'yang', '#7cc4ff');
    U.Render.iconoSuave(this.el.btnA.querySelector('canvas'), 'a', '#a7f3c9'); U.Render.iconoSuave(this.el.btnYin.querySelector('canvas'), 'yin', '#e6c9a0'); U.Render.iconoSuave(this.el.btnYang.querySelector('canvas'), 'yang', '#f8fafc'); U.Render.iconoSuave(this.el.btnDash.querySelector('canvas'), 'dash', '#7ef0c0'); U.Render.iconoSuave(this.el.btnSobre.querySelector('canvas'), 'sobre', '#ffb3c0');
    this.el.pocion.addEventListener('click', () => U.Recuperacion.pocion());
    this.el.sonido.addEventListener('click', () => U.Juego.toggleSonido());
    this.el.btnObj.addEventListener('click', () => this.toggleObjetivo());
    if (this.el.btnInfo) this.el.btnInfo.addEventListener('click', () => this.toggleInfo());
    $('btnPausa').addEventListener('click', () => U.Juego.togglePausa()); $('btnCerrarPausa').addEventListener('click', () => U.Juego.togglePausa()); $('btnContinuar').addEventListener('click', () => U.Juego.togglePausa());
    $('btnReiniciar').addEventListener('click', e => { const b = e.currentTarget; if (b.dataset.armado) { if (U.Guardado) U.Guardado.borrarAuto(); location.reload(); return; } b.dataset.armado = '1'; const txt = b.textContent; b.textContent = '¿SEGURO? SE BORRARÁ EL GUARDADO AUTOMÁTICO · TOCA OTRA VEZ'; setTimeout(() => { delete b.dataset.armado; b.textContent = txt; }, 3500); });
    const bG = $('btnGuardar'); if (bG) bG.addEventListener('click', () => U.Guardado.descargar());
    const bC = $('btnCargar'); if (bC) bC.addEventListener('click', () => U.Guardado.elegirArchivo());
    $('selDificultad').addEventListener('change', e => { U.Juego.estado.dificultad = parseFloat(e.target.value); this.toast('Dificultad: ' + e.target.selectedOptions[0].text + '. Afecta a los enemigos que aparezcan.', ''); });
    // Botones de acción (puntero: sirve para touch y ratón)
    const press = (btn, down, up) => { btn.addEventListener('pointerdown', e => { const E = U.Juego.estado; if (E && E.reloj && E.reloj.durmiendo) return; e.preventDefault(); btn.setPointerCapture(e.pointerId); btn.classList.add('presionado'); down(); }); const rel = e => { btn.classList.remove('presionado'); if (up) up(); }; btn.addEventListener('pointerup', rel); btn.addEventListener('pointercancel', rel); btn.addEventListener('contextmenu', e => e.preventDefault()); };
    press(this.el.btnA, () => U.Juego.pressA(), () => U.Juego.releaseA());
    press(this.el.btnYin, () => U.Combate.iniciarCarga(), () => U.Combate.soltarYin());
    press(this.el.btnYang, () => U.Combate.yang()); press(this.el.btnTec, () => U.Combate.ataqueBasico()); press(this.el.btnDash, () => U.Combate.dash()); press(this.el.btnSobre, () => U.Combate.sobrecarga()); if (this.el.btnEscudo) press(this.el.btnEscudo, () => U.Combate.toggleEscudo()); if (this.el.btnAgua) press(this.el.btnAgua, () => U.Juego.toggleCaminarAgua()); if (this.el.btnProh) { U.Render.iconoSuave(this.el.btnProh.querySelector('canvas'), 'yang', '#ff8a9c'); press(this.el.btnProh, () => { if (U.Prohibidas) U.Prohibidas.usarSeleccionada(); }); }
    // EQUIPO: los botones fijos de Yang y Escudo ya no se usan — sus técnicas viven
    // en el equipo y sus botones se crean aquí (refrescarEquipo), solo si equipadas.
    this.el.btnYang.classList.add('oculto'); if (this.el.btnEscudo) this.el.btnEscudo.classList.add('oculto');
    { const cont = $('controles'); const eq = document.createElement('div'); eq.id = 'equipoBtns'; eq.setAttribute('aria-label', 'Técnicas equipadas'); cont.appendChild(eq); this.el.equipoBtns = eq; this._firmaEquipo = null; }
    // Joystick analógico
    const jz = $('joystick'), knob = $('joyKnob');
    const move = e => { if (!this.joy.activo || e.pointerId !== this.joy.id) return; let dx = e.clientX - this.joy.cx, dy = e.clientY - this.joy.cy; const d = Math.hypot(dx, dy); const max = this.joy.r; if (d > max) { dx = dx / d * max; dy = dy / d * max; } knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; const mag = Math.min(1, d / max); const I = U.Juego.input; if (mag < 0.15) { I.vx = 0; I.vy = 0; I.mag = 0; } else { const v = U.Grid.dir8(dx, dy); I.vx = v.x; I.vy = v.y; I.mag = mag; } I.joy = true; };
    jz.addEventListener('pointerdown', e => { e.preventDefault(); const r = jz.getBoundingClientRect(); this.joy.activo = true; this.joy.id = e.pointerId; this.joy.cx = r.left + r.width / 2; this.joy.cy = r.top + r.height / 2; this.joy.r = r.width / 2 - 10; jz.setPointerCapture(e.pointerId); move(e); });
    jz.addEventListener('pointermove', move);
    const endJoy = e => { if (e.pointerId !== this.joy.id) return; this.joy.activo = false; knob.style.transform = ''; U.Juego.input.vx = 0; U.Juego.input.vy = 0; U.Juego.input.mag = 0; U.Juego.input.joy = false; };
    jz.addEventListener('pointerup', endJoy); jz.addEventListener('pointercancel', endJoy);
    document.addEventListener('contextmenu', e => { if (e.target.closest('#controles')) e.preventDefault(); });
  },
  mostrar() { this.el.hud.classList.remove('oculto'); },
  // Tu elemento es FIJO (lo definió el test): ya no hay botones para cambiarlo.
  // Aquí solo queda la insignia de tu elemento principal, sin acción.
  refrescarSimbolos() {
    const j = U.Juego.estado.jugador; const c = this.el.simbolos; c.innerHTML = '';
    const el = j.elemento || j.elementoActivo;
    const insignia = document.createElement('span'); insignia.className = 'elemFijo'; insignia.title = 'Tu elemento: ' + U.Elementos.nombre(el) + ' (lo definió el test; no cambia en esta vida). Tu aura y tu escudo son de este elemento.';
    const cv = document.createElement('canvas'); cv.width = 57; cv.height = 57; U.Render.iconoSuave(cv, el); insignia.appendChild(cv);
    const nom = document.createElement('b'); nom.textContent = U.Elementos.nombre(el); insignia.appendChild(nom); c.appendChild(insignia);
    const caja = document.querySelector('#ajusteElemento .ajusteElemCaja');
    if (caja) { const h3 = caja.querySelector('h3'); if (h3) h3.textContent = 'Tu elemento'; const p = caja.querySelector('p'); if (p) p.textContent = 'Lo definió el test y no cambia en esta vida. Lo que sí cambia es tu EQUIPO: en Pausa → Ajustes → Equipo eliges hasta 5 técnicas dominadas, mezclando elementos.'; }
    U.Render.iconoSuave(this.el.btnTec.querySelector('canvas'), j.elementoActivo); this.el.btnTec.style.borderColor = U.Elementos.color(j.elementoActivo);
    this.refrescarEquipo();
  },
  // Botones del EQUIPO (hasta 5, en el orden elegido): un botón aparece SOLO si la
  // técnica está dominada Y equipada. Puño (Yin) y básico (TÉC) son fijos y no van aquí.
  refrescarEquipo() {
    const j = U.Juego.estado && U.Juego.estado.jugador; const cont = this.el.equipoBtns; if (!j || !cont) return;
    const eq = U.Habilidades.equipoDetalles(j);
    const firma = eq.map(t => t.id).join('|');
    if (this._firmaEquipo === firma) return; this._firmaEquipo = firma;
    cont.innerHTML = '';
    eq.forEach((t, i) => {
      const b = document.createElement('button'); b.className = 'boton equipo'; b.dataset.tec = t.id;
      b.style.borderColor = t.kind === 'yang' ? '#f8fafc' : t.kind === 'escudo' ? U.Combate.escudoColor(j) : t.kind === 'yin' ? '#94a3b8' : t.kind === 'mistico' ? '#e8a2e0' : U.Elementos.color(t.elemento);
      b.title = t.nombre + ' (' + (i + 1) + ') · ' + t.desc + (t.costo != null ? ' · Costo ' + t.costo + ' Esencia' : '') + (t.cd ? ' · CD ' + t.cd + 's' : '');
      const cv = document.createElement('canvas'); cv.width = 72; cv.height = 72;
      const icono = t.icono || (t.kind === 'yang' ? 'yang' : t.kind === 'escudo' ? (U.Combate.escudoTipo(j) === 'yang' ? 'yang' : U.Combate.escudoTipo(j)) : t.elemento);
      U.Render.iconoSuave(cv, icono, t.kind === 'yang' ? '#f8fafc' : t.kind === 'escudo' ? U.Combate.escudoColor(j) : t.kind === 'yin' ? '#94a3b8' : t.kind === 'mistico' ? '#e8a2e0' : U.Elementos.color(t.elemento));
      b.appendChild(cv);
      const lbl = document.createElement('span'); lbl.className = 'lbl'; lbl.textContent = (i + 1) + ' · ' + t.nombre.split(' ')[0].toUpperCase(); b.appendChild(lbl);
      const cd = document.createElement('i'); cd.className = 'cd'; b.appendChild(cd);
      const cdN = document.createElement('span'); cdN.className = 'cdNum'; b.appendChild(cdN);
      b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('presionado'); U.Combate.usarEquipo(t.id); });
      b.addEventListener('pointerup', () => b.classList.remove('presionado'));
      b.addEventListener('pointercancel', () => b.classList.remove('presionado'));
      b.addEventListener('contextmenu', e => e.preventDefault());
      cont.appendChild(b);
    });
  },
  // Selector del equipo (Pausa → Ajustes): todas las técnicas DOMINADAS, de TODOS
  // tus elementos (el equipo puede mezclarlos), en orden, hasta 5.
  htmlEquipo() {
    const j = U.Juego.estado.jugador; const dom = U.Habilidades.dominadas(j); const eq = U.Habilidades.asegurarEquipo(j);
    let h = '<section><h3>🎒 Equipo · hasta 5 técnicas (en orden)</h3>'
      + '<div style="font-size:12px;color:var(--texto)">Tu elemento es fijo (el del test), pero tu equipo MEZCLA elementos: aquí van todas las técnicas que ya DOMINASTE, de todos tus elementos, más las técnicas Yang, la Resistencia de Acero (Yin) y el Escudo. El HUD muestra solo las equipadas, en este orden (teclas 1-5). Cambiar el equipo se hace aquí, en pausa, con calma.</div>'
      + '<div style="font-size:12px;margin-top:4px">Al empezar solo llevas tu ataque básico (botón 1). Las técnicas que aprendas después —hablando con Guías, entrenando tu maestría y tus estilos— aparecen aquí y entran a tus botones si hay hueco libre. AQUÍ eliges cuáles se ven: EQUIPAR pone el botón, QUITAR lo esconde (la técnica sigue siendo tuya, no se olvida). Tú decides qué botones ves, no el juego.</div>'
      + '<div style="font-size:12px;margin-top:4px">Llevas <b>' + eq.length + '/5</b> equipadas.' + (eq.length >= 5 ? ' Equipo lleno: quita una para meter otra.' : '') + '</div>';
    if (!dom.length) h += '<div style="font-size:12px;color:var(--textoFrio);margin-top:6px">Aún no dominas ninguna técnica. Golpea con Yin en combate para subir la maestría de tu elemento: al 15% podrás aprender la primera de un Guía, por tarea. Mientras, tienes el puño y el ataque básico de tu elemento.</div>';
    const grupo = (titulo, lista) => {
      if (!lista.length) return '';
      let s = '<div style="font-size:11px;letter-spacing:1px;color:var(--rayo);margin:10px 0 4px">' + titulo + '</div>';
      lista.forEach(t => {
        const pos = eq.indexOf(t.id);
        const enEq = pos >= 0;
        s += '<div class="mochilaItem equipoFila"><span>' + (enEq ? '<b class="eqNum">' + (pos + 1) + '</b> ' : '') + '<b>' + this.escHtml(t.nombre) + '</b> <small style="color:var(--textoFrio)">' + this.escHtml(t.desc) + ' · Costo ' + t.costo + (t.cd ? ' · CD ' + t.cd + 's' : '') + (t.umbral ? ' · requiere ' + t.umbral + (t.kind === 'elemento' ? '%' : t.kind === 'yang' ? ' Yang' : t.kind === 'yin' ? ' Yin' : t.kind === 'mistico' ? ' básico de hechicero' : '') : '') + '</small></span><span class="acts">'
          + (enEq
            ? '<button class="mini" data-eq-up="' + t.id + '" title="Subir un hueco (antes en el HUD)">▲</button><button class="mini" data-eq-down="' + t.id + '" title="Bajar un hueco (después en el HUD)">▼</button><button class="mini peligro" data-eq-del="' + t.id + '">QUITAR</button>'
            : '<button class="mini exito" data-eq-add="' + t.id + '"' + (eq.length >= 5 ? ' disabled title="Equipo lleno (máx. 5): quita una primero"' : '') + '>EQUIPAR</button>')
          + '</span></div>';
      });
      return s;
    };
    (j.elementos || [j.elementoActivo]).forEach(el => { h += grupo(U.Elementos.nombre(el) + ' · ' + Math.floor(j.maestria[el] || 0) + '%', dom.filter(t => t.kind === 'elemento' && t.elemento === el)); });
    h += grupo('Yang · estilo ' + Math.floor(j.estilos.yang || 0), dom.filter(t => t.kind === 'yang'));
    h += grupo('Yin · estilo ' + Math.floor(j.estilos.yin || 0), dom.filter(t => t.kind === 'yin'));
    h += grupo('Místico · Arte Místico · básicos ' + ((j.hechicero && j.hechicero.basicos) || 0), dom.filter(t => t.kind === 'mistico'));
    h += grupo('Escudo · Nv.' + (j.escudoNv || 1), dom.filter(t => t.kind === 'escudo'));
    h += grupo('Alma · heredada por tu compañera de contrato', dom.filter(t => t.kind === 'alma'));
    h += '</section>';
    return h;
  },
  refrescarChips() {
    const j = U.Juego.estado.jugador;
    // Los botones fijos Yang/Escudo NO se muestran: sus técnicas viven en el equipo.
    this.el.btnYang.classList.add('oculto'); if (this.el.btnEscudo) this.el.btnEscudo.classList.add('oculto');
    // Las chips selectoras (técnica del elemento / forma Yang) desaparecen: el HUD
    // ya no selecciona, USA el equipo. Solo quedan las PROHIBIDAS (otro sistema).
    this.el.chipsTec.innerHTML = ''; this.el.chipsTec.classList.add('oculto');
    this.el.chipsYang.innerHTML = ''; this.el.chipsYang.classList.add('oculto');
    this.refrescarEquipo();
    // Técnicas PROHIBIDAS: chips rojos + botón PROH, solo visibles si ya aprendiste alguna.
    if (this.el.chipsProh && U.Prohibidas) { const cp = this.el.chipsProh; cp.innerHTML = ''; const pp = U.Prohibidas.asegurar(); const aps = pp ? pp.aprendidas : [];
      cp.classList.toggle('oculto', !aps.length); if (this.el.btnProh) this.el.btnProh.classList.toggle('oculto', !aps.length);
      aps.forEach(id => { const d = U.Prohibidas.DEFS[id]; const b = document.createElement('button'); b.className = (j.prohibidaSel === id ? 'sel' : ''); b.textContent = '💀 ' + d.nombre; b.title = '⚠ TÉCNICA PROHIBIDA · ' + d.desc + ' · Consecuencia: ' + d.consecuencia + ' · Toca para seleccionarla; úsala con G o el botón PROH'; b.addEventListener('click', () => U.Prohibidas.seleccionar(id)); cp.appendChild(b); });
      if (this.el.btnProh && j.prohibidaSel && U.Prohibidas.DEFS[j.prohibidaSel]) this.el.btnProh.title = '💀 ' + U.Prohibidas.DEFS[j.prohibidaSel].nombre + ' (G) · ⚠ PROHIBIDA: ' + U.Prohibidas.DEFS[j.prohibidaSel].consecuencia;
    }
    this.el.btnSobre.classList.toggle('oculto', j.estilos.yin < U.Habilidades.yin.sobrecarga.umbral);
  },
  // ---- NIEBLA DE GUERRA + GUARIDAS ----
  // En guarida no hay minimapa ni mapa completo: el jugador no conoce el lugar.
  // E.enGuarida lo pondrá el sistema de guaridas; mientras no exista, vale la
  // regla de respaldo: solo 'aldea' (continente), 'casa' y 'oficina' tienen mapa.
  enGuarida(E) {
    E = E || (U.Juego.estado || null); if (!E) return false;
    if (E.enGuarida) return true;
    if (typeof E.mapaId === 'string' && E.mapaId.indexOf('guarida') === 0) return true;
    return ['aldea', 'casa', 'oficina'].indexOf(E.mapaId) < 0;
  },
  // Registro de lo explorado: bloques gruesos de 8×8 celdas (un continente de
  // 440×400 son 55×50 = 2750 bloques como mucho; en la práctica, pocos cientos).
  // E.explorado = { bloques: { "bx,by": 1 }, zonas: [ids revelados] }.
  // Bruma y alrededores nacen revelados (ahí vive el jugador): al crear el registro
  // se marca un radio de 18 celdas alrededor del inicio del continente.
  EXPLORA_BLOQUE: 8, EXPLORA_RADIO: 12,
  asegurarExplorado(E) {
    if (!E.explorado) {
      E.explorado = { bloques: {}, zonas: [] };
      const ini = (E.mapas && E.mapas.aldea && E.mapas.aldea.inicio) || (E.mapaId === 'aldea' && E.mapa && E.mapa.inicio) || null;
      if (ini) this._marcarExplorado(E, ini.x, ini.y, 18);
    }
    return E.explorado;
  },
  _marcarExplorado(E, x, y, radio) {
    const ex = this.asegurarExplorado(E); const B = this.EXPLORA_BLOQUE;
    const r = Math.ceil(radio / B);
    const bx = Math.floor(x / B), by = Math.floor(y / B);
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r + r) continue;
      ex.bloques[(bx + dx) + ',' + (by + dy)] = 1;
    }
  },
  registrarExplorado(E) {
    if (!E || !E.jugador || E.mapaId !== 'aldea') return; // solo el continente tiene niebla; casa/oficina son interiores conocidos
    this._marcarExplorado(E, E.jugador.x, E.jugador.y, this.EXPLORA_RADIO);
  },
  bloqueExplorado(E, x, y) {
    if (!E || !E.explorado) return false;
    const B = this.EXPLORA_BLOQUE;
    if (E.explorado.bloques[Math.floor(x / B) + ',' + Math.floor(y / B)]) return true;
    // Una zona revelada por rumor revela su rectángulo entero (ver mapa.zonas).
    const m = (E.mapas && E.mapas.aldea) || E.mapa;
    if (m && m.zonas) {
      for (let i = 0; i < E.explorado.zonas.length; i++) {
        const z = m.zonas.find(zz => zz.id === E.explorado.zonas[i]);
        if (z && x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h) return true;
      }
    }
    return false;
  },
  // Revelar una zona/pueblo en el mapa SIN visitarlo (para el sistema de rumores).
  // id: id de mapa.zonas ('metropolis', 'vueloAlto', 'chispaAlta', 'arcana',
  // 'raizPiedra', 'puebloAgua', 'puebloFuego', 'altoPino', 'rocafirme',
  // 'tresCruces', 'salina', 'vegaBaja', 'brasaChica', 'lagoEste', 'rioEste',
  // 'lagunaSerena', 'quemadaSur') o clave de mapa.pueblos ('bruma', 'metropolis',
  // 'puerto', 'ceniza', 'raiz', 'vuelo', 'chispa', 'arcana'). Devuelve true si
  // el id existe en el mapa; si no existe, igual se guarda (por si el mapa aún
  // no está cargado) y devuelve false. Uso: U.HUD.revelarZona('metropolis').
  revelarZona(id) {
    const E = U.Juego.estado; if (!E || !id) return false;
    const ex = this.asegurarExplorado(E);
    if (ex.zonas.indexOf(id) < 0) ex.zonas.push(id);
    const m = (E.mapas && E.mapas.aldea) || E.mapa;
    let existe = false;
    if (m && m.zonas && m.zonas.some(z => z.id === id)) existe = true;
    if (m && m.pueblos && m.pueblos[id]) { existe = true; const p = m.pueblos[id]; this._marcarExplorado(E, p.x, p.y, 16); }
    if (U.Guardado) U.Guardado.guardarAuto();
    return existe;
  },
  // El reloj NUNCA se esconde en combate (su panel se puede abrir también
  // peleando): por eso toggleInfo ya no tiene guarda de combate.
  toggleInfo() { const abierto = this.el.infoDetalle.classList.toggle('oculto') === false; this.el.btnInfo.classList.toggle('abierto', abierto); this.el.btnInfo.setAttribute('aria-expanded', String(abierto)); if (abierto && !this.el.objDetalle.classList.contains('oculto')) { this.el.objDetalle.classList.add('oculto'); this.el.btnObj.classList.remove('abierto'); this.el.btnObj.setAttribute('aria-expanded', 'false'); } },
  toggleObjetivo() { if ((U.Juego.estado && U.Juego.estado.enCombate) || (this.el.hud && this.el.hud.classList.contains('enCombate'))) return; const abierto = this.el.objDetalle.classList.toggle('oculto') === false; this.el.btnObj.classList.toggle('abierto', abierto); this.el.btnObj.setAttribute('aria-expanded', String(abierto)); if (abierto) { this.refrescarObjetivoDetalle(); if (this.el.infoDetalle && !this.el.infoDetalle.classList.contains('oculto')) { this.el.infoDetalle.classList.add('oculto'); this.el.btnInfo.classList.remove('abierto'); this.el.btnInfo.setAttribute('aria-expanded', 'false'); } } },
  refrescarObjetivoDetalle() { const E = U.Juego.estado; if (!E || !E.objetivos) return; this.el.objDetalleTexto.textContent = 'MUNDO ABIERTO: este juego no tiene final ni una cadena de misiones obligatoria. Todo lo de abajo está DISPONIBLE desde ya, en el orden que quieras: empieza por lo que te llame (entrenar, la arena, el tablón, explorar, hablar con la gente) y eso irá abriendo más cosas. Elige TU objetivo; al lograrlo, el juego sigue y eliges otro.'; const visibles = E.objetivos.filter(o => { if (!o.oculto) return true; const oo = E.orgs && o.orgId ? E.orgs[o.orgId] : null; return !!(oo && oo.descubierta); }); this.el.objDetalleLista.innerHTML = visibles.map(o => '<li class="' + o.estado + '">' + (o.estado === 'hecho' ? '✓ ' : '◆ ') + o.texto + '</li>').join(''); },
  toast(txt, tipo) { /* HUD minimalista: sin registro de eventos en pantalla. El feedback va por sonido, banner y números flotantes del mundo. */ },
  banner(txt, dur) { const b = this.el.banner; if (!b) return; b.textContent = txt; b.classList.remove('oculto'); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; this.bannerT = dur || 1.5; if (this._bannerTO) clearTimeout(this._bannerTO); const ms = Math.max(300, this.bannerT * 1000); this._bannerTO = setTimeout(() => { b.classList.add('oculto'); this.bannerT = 0; }, ms); },
  actualizar(dt) {
    const E = U.Juego.estado, j = E.jugador, el = this.el;
    // MODO COMBATE: se esconde el objetivo (y su detalle) y se cierra el panel
    // del reloj al entrar. El RELOJ nunca se esconde. El MINIMAPA solo se
    // esconde en combate Y en lugar cerrado (arena, torneo o reto, o parado en
    // la zona 'arena'): clase 'enArena' en #hud. En el bosque y en lugares
    // salvajes el mapa se queda visible. Al salir de combate todo reaparece.
    // Solo se togglan clases en #hud (CSS display:none) — las barras, la
    // poción y las monedas no se tocan.
    { const enCombateAhora = !!E.enCombate || !!(E.arena && E.arena.activa) || !!(E.torneo && E.torneo.activo) || !!E.reto; const enArenaAhora = !!(E.arena && E.arena.activa) || !!(E.torneo && E.torneo.activo) || !!E.reto || (E.zonaActual && E.zonaActual.id === 'arena'); if (this._enCombate !== enCombateAhora) { this._enCombate = enCombateAhora; if (el.hud) el.hud.classList.toggle('enCombate', enCombateAhora); if (enCombateAhora) { if (el.objDetalle && !el.objDetalle.classList.contains('oculto')) { el.objDetalle.classList.add('oculto'); } if (el.btnObj) { el.btnObj.classList.remove('abierto'); el.btnObj.setAttribute('aria-expanded', 'false'); } if (el.infoDetalle && !el.infoDetalle.classList.contains('oculto')) { el.infoDetalle.classList.add('oculto'); } if (el.btnInfo) { el.btnInfo.classList.remove('abierto'); el.btnInfo.setAttribute('aria-expanded', 'false'); } } } else if (el.hud && enCombateAhora && !el.hud.classList.contains('enCombate')) { el.hud.classList.add('enCombate'); } if (this._enArena !== enArenaAhora) { this._enArena = enArenaAhora; if (el.hud) el.hud.classList.toggle('enArena', enArenaAhora); } else if (el.hud && enArenaAhora && !el.hud.classList.contains('enArena')) { el.hud.classList.add('enArena'); } }
    el.rellVida.style.transform = 'scaleX(' + Math.max(0, j.vida / (j.stats.vida || 1)) + ')'; el.rellEsencia.style.transform = 'scaleX(' + Math.max(0, j.esencia / ((U.Reliquias ? U.Reliquias.esenciaMax(j) : j.stats.esencia) || 1)) + ')';
    if (el.rellCansancio) { const maxC = U.Recuperacion.condicionMax(j); const can = j.cansancio != null ? j.cansancio : maxC; el.rellCansancio.style.transform = 'scaleX(' + Math.max(0, can / maxC) + ')'; if (el.numCansancio) el.numCansancio.textContent = 'CONDICIÓN ' + Math.floor(can) + '/' + maxC + ' · RECARGA ×' + U.Recuperacion.multCansancio().toFixed(2); }
    const m = j.maestria[j.elementoActivo] || 0;
    el.agotado.classList.toggle('oculto', !j.agotado);
    this.tNum += dt; if (this.tNum > 0.1) { this.tNum = 0;
      el.numVida.textContent = Math.ceil(j.vida) + '/' + Math.round(j.stats.vida); el.numEsencia.textContent = (Math.round(j.esencia * 10) / 10) + '/' + Math.round(U.Reliquias ? U.Reliquias.esenciaMax(j) : j.stats.esencia);
      j.pociones = (j.bolsaPociones || []).length; el.pocion.textContent = '🧪 ×' + j.pociones; el.pocion.disabled = j.pociones <= 0; const nm = document.getElementById('numMonedas'); if (nm) nm.textContent = Math.floor(j.monedas || 0); const mh = document.getElementById('mascaraHud'); if (mh) { const pid = j.reliquias && j.reliquias.puesta; mh.classList.toggle('oculto', !pid); if (pid && U.Reliquias && U.Reliquias.MASCARAS[pid]) { const mt = document.getElementById('mascaraHudTxt'); if (mt) mt.textContent = U.Reliquias.MASCARAS[pid].nombre; mh.style.borderColor = U.Reliquias.MASCARAS[pid].color; } } /* Botón fijo del Escudo: ya no existe; su estado vive en su botón del equipo (clase 'encendido' cuando está activo). */
      const b = U.Habilidades.BASICO; const z = E.zonaActual; const c = U.Ambiente.costo(b, j.elementoActivo, z, j.atributo);
      el.btnTec.classList.toggle('apagado', j.agotado || j.esencia < b.costo); el.btnYin.classList.toggle('apagado', j.agotado && !U.Combate.puñoSobre(j)); el.btnDash.classList.toggle('apagado', j.agotado);
      el.btnTec.title = 'Ataque básico de ' + U.Elementos.nombre(j.elementoActivo) + ' (TÉC) · línea de ' + U.Combate.alcanceElemental(j) + ' celdas (maestría ' + Math.floor(m) + '%) · costo ' + c.costo + ' Esencia' + (c.plano ? ' (plano por el clima)' : '') + ' · ' + (c.razon || 'ambiente neutro') + ' · Temp. ' + Math.round(U.Clima.temperatura(E) * 100) + '% · Precip. ' + Math.round(U.Clima.precipitacion(E) * 100) + '% · Tus técnicas equipadas están en los botones de arriba (teclas 1-5).';
      el.btnSobre.classList.toggle('apagado', false); el.btnSobre.style.filter = j.buffs.sobrecarga > 0 ? 'brightness(1.7)' : ''; el.btnSobre.title = j.buffs.sobrecarga > 0 ? 'Sobrecarga ACTIVA (X): toca para DESACTIVARLA. Drena Esencia; sin Esencia drena Vida y solo puedes golpear.' : 'Sobrecarga (X): interruptor. Ataque y Velocidad ×2; drena Esencia y, sin Esencia, Vida. Toca otra vez para apagarla.';
      // Botón del AGUA: existe para Fuego, Rayo, TIERRA y AGUA (solo el Viento cruza solo)
      // y solo se muestra cerca del agua o ya sobre ella; su estado se lee en el propio
      // botón. Tierra usa el MISMO botón e interruptor, pero con su texto: no camina
      // sobre el agua, LEVANTA PIEDRA (5 de Esencia por baldosa, puente de un día). Agua
      // camina sobre el agua gastando solo 2 de Esencia/s (es su elemento: poco, no gratis).
      if (el.btnAgua) { const esTierra = j.elementoActivo === 'tierra'; const esAgua = j.elementoActivo === 'agua'; const necesitaAgua = esTierra || esAgua || j.elementoActivo === 'fuego' || j.elementoActivo === 'rayo'; const visibleAgua = necesitaAgua && (!!j.cercaAgua || !!j.sobreAgua); el.btnAgua.classList.toggle('oculto', !visibleAgua); el.btnAgua.classList.toggle('encendido', !!j.caminarAgua); if (el.btnAguaTexto) el.btnAguaTexto.textContent = esTierra ? '🪨 PONER TIERRA SOBRE EL AGUA' : '🌊 CAMINAR SOBRE EL AGUA'; if (el.btnAguaEstado) el.btnAguaEstado.textContent = j.caminarAgua ? 'ENCENDIDO' : 'APAGADO'; el.btnAgua.title = esTierra ? (j.caminarAgua ? 'Poner tierra sobre el agua ENCENDIDO (C): toca para APAGARLO. Al caminar levantas piedra: 5 de Esencia por baldosa, puente de un día del juego. Sin Esencia no avanzas sobre el agua: te quedas sobre el puente, sin perder Vida, y puedes regresarte.' : 'Poner tierra sobre el agua APAGADO (C): el agua te bloquea el paso. Toca para ENCENDERLO y levantar piedra al caminar (5 de Esencia por baldosa, dura un día del juego).') : esAgua ? (j.caminarAgua ? 'Caminar sobre el agua ENCENDIDO (C): toca para APAGARLO. Sobre el agua gastas solo 2 de Esencia/s, porque el agua es tu elemento; sin Esencia te detienes sobre el agua, sin perder Vida, y puedes esperar o regresarte.' : 'Caminar sobre el agua APAGADO (C): el agua te bloquea el paso. Toca para ENCENDERLO y cruzar gastando 2 de Esencia/s (el agua es tu elemento: te cuesta menos, pero no es gratis).') : (j.caminarAgua ? 'Caminar sobre el agua ENCENDIDO (C): toca para APAGARLO. Sobre el agua gastas 10 de Esencia/s y, sin Esencia, 10 de Vida/s; si lo apagas a mitad del agua, NADAS (más lento, gratis) hasta la orilla.' : 'Caminar sobre el agua APAGADO (C): el agua te bloquea el paso. Toca para ENCENDERLO y cruzar gastando 10 de Esencia/s (sin Esencia no puedes entrar desde la orilla).'); }
      el.btnTec.querySelector('.cd').style.height = Math.min(1, (j.cdBasico || 0) / b.cd) * 100 + '%'; el.btnYin.querySelector('.cd').style.height = Math.min(1, j.cdYin / 0.4) * 100 + '%'; this.setCdNum(el.btnTec, j.cdBasico || 0); this.setCdNum(el.btnYin, j.cdYin || 0); if (el.btnYang) this.setCdNum(el.btnYang, j.cdYang || 0);
      // Enfriamiento de cada botón del equipo (según su técnica).
      Array.from(this.el.equipoBtns ? this.el.equipoBtns.children : []).forEach(btn => { const tec = U.Habilidades.porId(j, btn.dataset.tec); if (!tec) return; const esToggle = tec.tecId === 'tiempoLento' || tec.tecId === 'acero'; const cdRest = esToggle ? 0 : tec.kind === 'yang' ? (j.cdYang || 0) : tec.kind === 'escudo' ? 0 : (j.cdTec[tec.id] || 0); const cdv = esToggle ? 0 : cdRest / (tec.cd || 1); const ic = btn.querySelector('.cd'); if (ic) ic.style.height = Math.min(1, Math.max(0, cdv)) * 100 + '%'; this.setCdNum(btn, cdRest); btn.classList.toggle('apagado', j.agotado || cdRest > 0); if (tec.kind === 'escudo') { btn.classList.toggle('encendido', !!j.escudo); btn.style.filter = j.escudo ? 'brightness(1.5)' : ''; btn.title = U.Combate.escudoNombre(j) + ' (B) · Nv.' + (j.escudoNv || 1) + ' (' + U.Habilidades.escudo.niveles[j.escudoNv || 1].nombre + ') · integridad ' + Math.max(0, Math.round(j.escudoVida || 0)) + '/' + U.Combate.escudoMax(j) + ' · no te mueves, drena Esencia/s'; } if (tec.tecId === 'tiempoLento') { btn.classList.toggle('encendido', !!j.tiempoLento); btn.style.filter = j.tiempoLento ? 'brightness(1.5)' : ''; } if (tec.tecId === 'acero') { btn.classList.toggle('encendido', !!j.acero); btn.style.filter = j.acero ? 'brightness(1.5)' : ''; } });
      el.btnA.querySelector('.lbl').textContent = j.trote ? 'TROTE +' : 'TROTE';
      el.descanso.classList.toggle('oculto', !j.descansando);
      if (j.descansando) { const durm = !!(E.reloj && E.reloj.durmiendo); el.rellDescanso.style.transform = 'scaleX(' + (durm ? Math.min(1, j.vida / j.stats.vida) : Math.min(1, j.vida / U.Recuperacion.techoVida())) + ')'; if (el.descansoTxt) el.descansoTxt.textContent = durm ? 'Durmiendo junto a la fogata… al despertar: Vida y Esencia al 100%' : 'Meditando · Esencia ×3 · Yang + · muévete para cancelar'; }
      if (E.reloj && el.horaTexto) { const hh = E.reloj.minutos / 60; const ff = U.Tiempo.faseDe(hh); el.horaTexto.textContent = U.Tiempo.formato(E.reloj.minutos); if (el.horaMomento) el.horaMomento.textContent = ff.nombre; if (el.calTexto) el.calTexto.textContent = U.Tiempo.diaTexto(E.reloj); if (E.clima && el.climaTexto) { const cl = U.Clima.de(E); el.climaIcono.textContent = cl.icono; el.climaTexto.textContent = cl.nombre; if (el.climaDetalle) el.climaDetalle.textContent = cl.detalle; } if (E.clima && el.tempTexto) { const C = U.Clima, tg = C.grados(E), sg = C.sensacion(E); el.tempTexto.textContent = tg + '°C'; el.sensTexto.textContent = sg + '°C'; el.sensNota.textContent = 'Sensación térmica' + (sg <= tg - 2 ? ' · el viento enfría' : sg >= tg + 2 ? ' · la humedad agobia' : ''); const ig = C.intensidadGuardada(E); el.precipTexto.textContent = Math.round(ig / 4 * 100) + '%'; el.precipNota.textContent = 'Precipitación' + (C.esInterior(E) ? ' afuera' : '') + ' · ' + (ig === 0 ? 'sin lluvia' : ig === 4 ? 'tormenta' : 'lluvia ' + C.INTENSIDAD_NOMBRES[ig]); el.humTexto.textContent = C.humedad(E) + '%'; const vk = C.vientoKmh(E); el.vientoTexto.textContent = vk + ' km/h'; el.vientoNota.textContent = 'Viento · ' + C.vientoNombre(vk); } }
      const ob = E.objetivos[E.objetivoIdx]; el.obj.textContent = ob ? ob.texto : 'Entrena libremente: la arena acepta rondas más difíciles.';
      if (!el.objDetalle.classList.contains('oculto')) this.refrescarObjetivoDetalle();
    }
    this.tMini += dt; if (this.tMini > 0.2) { this.tMini = 0; const guarida = this.enGuarida(E); if (el.mini) el.mini.classList.toggle('oculto', guarida); if (!this._enCombate && !guarida) { this.registrarExplorado(E); try { U.Render.minimapa(el.mini, E); } catch (e) { if (window.console) console.error('Unipar: minimapa ignorado', e); } } }
    /* Panel superior de oleadas (ARENA DE ECOS / torneo / misión / reto) eliminado: no se crea ni se muestra. El progreso sigue visible en Objetivo, banners y diálogos. */
    // PRESENTIMIENTO (habilidad pasiva de Entre-Mundos): borde rojo que
    // RESPIRA LENTO, solo en los bordes, cuando un hostil está cerca.
    // Presencia, no ubicación: sin flechas ni marcadores. Respeta
    // E.destelloModo ('off' = sin pulso). Distinto del flash de daño:
    // ese es un velo blanco rápido de TODA la pantalla (#veloDestello).
    { const vp = document.getElementById('veloPresentimiento'); if (vp) { this._presT = (this._presT || 0) + dt; const V = U.Presentimiento ? U.Presentimiento.visual(E, this._presT) : { opacidad: 0 }; vp.style.opacity = (V.opacidad || 0).toFixed(3); } }
    // DESTELLO (Rayo): velo blanco SUAVE y gradual — sube en ~0.18 s a su pico y decae exponencial (~1.5 s). Nunca parpadea ni es un estrobo. Ajuste E.destelloModo: 'normal' (pico .5) · 'suave' (.22) · 'off' (sin velo; la ceguera sigue).
    { const vd = document.getElementById('veloDestello'); if (vd) { const F = U.Combate ? U.Combate.flashPantalla : null; if (F) { F.t += dt; const pico = E.destelloModo === 'off' ? 0 : E.destelloModo === 'suave' ? 0.22 : 0.5; const subida = Math.min(1, F.t / 0.18); const decaida = Math.exp(-Math.max(0, F.t - 0.18) / 0.6); vd.style.opacity = (pico * subida * decaida).toFixed(3); if (F.t >= F.max) { U.Combate.flashPantalla = null; vd.style.opacity = '0'; } } else if (vd.style.opacity !== '0') vd.style.opacity = '0'; } }
    // INVERSIÓN: tinte visible + barra que se drena con el NOMBRE del hechizo. El MAPEO NO se muestra: el jugador lo descubre probando direcciones.
    { const ind = document.getElementById('invIndicador'), bar = document.getElementById('invBarRelleno'), tin = document.getElementById('veloInversion'); const inv = (j.invertido || 0) > 0; if (ind) ind.classList.toggle('oculto', !inv); if (tin) tin.style.opacity = inv ? '1' : '0'; if (inv && bar) bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, j.invertido / Math.max(0.01, j.invTotal || j.invertido))) + ')'; }
    if (this.bannerT > 0) { this.bannerT -= dt; if (this.bannerT <= 0) el.banner.classList.add('oculto'); }
  },
  // Número de segundos de enfriamiento sobre un botón (vacío si no hay CD).
  // Solo se muestra mientras queda enfriamiento, para no romper el HUD minimalista.
  setCdNum(btn, rest) { const n = btn ? btn.querySelector('.cdNum') : null; if (n) n.textContent = rest > 0 ? String(Math.ceil(rest)) : ''; },
  escHtml(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); },
  radarStats(j) {
    // Radar hexagonal de las 6 estadísticas con los valores ACTUALES de j.stats:
    // se reconstruye en cada apertura de Opciones, así que crece solo con el personaje.
    const orden = ['vida', 'esencia', 'ataque', 'defensa', 'mente', 'velocidad'];
    const refs = { vida: 300, esencia: 300, ataque: 100, defensa: 100, mente: 100, velocidad: 100 }; // escala FIJA y amplia, propia del hexágono: que un valor alto no parezca "casi completo" (antes 200/20, relativo, y Velocidad 23 ya tocaba el borde)
    const cols = { vida: '#ff8a9c', esencia: '#7cc4ff', ataque: '#ffd08a', defensa: '#67e08a', mente: '#e8a2e0', velocidad: '#7ef0c0' };
    const cx = 180, cy = 158, R = 96;
    const pt = (i, f) => { const a = (-90 + i * 60) * Math.PI / 180; return [cx + R * f * Math.cos(a), cy + R * f * Math.sin(a)]; };
    const ptsAnillo = f => orden.map((k, i) => pt(i, f).map(n => n.toFixed(1)).join(',')).join(' ');
    const colElem = U.Elementos.color(j.elementoActivo);
    let s = '<div class="radarWrap"><svg class="radarSvg" viewBox="0 0 360 330" role="img" aria-label="Gráfico hexagonal con tus estadísticas actuales: ' + orden.map(k => U.Estadisticas.etiquetas[k] + ' ' + (+j.stats[k]).toFixed(2)).join(', ') + '">';
    [1, 0.75, 0.5, 0.25].forEach(f => { s += '<polygon points="' + ptsAnillo(f) + '" fill="' + (f === 1 ? 'rgba(11,16,32,.55)' : 'none') + '" stroke="#3b4d86" stroke-width="' + (f === 1 ? 2 : 1) + '"/>'; });
    orden.forEach((k, i) => { const p = pt(i, 1); s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="#3b4d86" stroke-width="1"/>'; });
    [0.25, 0.5, 0.75, 1].forEach(f => { const p = pt(0, f); s += '<text class="radarPct" x="' + (p[0] + 5).toFixed(1) + '" y="' + (p[1] + 3).toFixed(1) + '">' + Math.round(f * 100) + '%</text>'; });
    const datos = orden.map((k, i) => pt(i, Math.min(1, Math.max(0.02, (j.stats[k] || 0) / refs[k]))));
    s += '<polygon points="' + datos.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ') + '" fill="' + colElem + '" fill-opacity="0.35" stroke="' + colElem + '" stroke-width="2.5" stroke-linejoin="round"/>';
    orden.forEach((k, i) => {
      const p = datos[i];
      s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5" fill="' + cols[k] + '" stroke="#05070f" stroke-width="1"/>';
      const lp = pt(i, 1.32); const anc = (i === 0 || i === 3) ? 'middle' : (i === 1 || i === 2) ? 'start' : 'end';
      const yNom = (i === 0) ? lp[1] - 4 : (i === 3) ? lp[1] + 12 : lp[1] - 2;
      s += '<text text-anchor="' + anc + '" x="' + lp[0].toFixed(1) + '" y="' + yNom.toFixed(1) + '"><tspan class="radarNom" fill="' + cols[k] + '">' + U.Estadisticas.etiquetas[k] + '</tspan><tspan class="radarVal" x="' + lp[0].toFixed(1) + '" dy="13">' + (+j.stats[k]).toFixed(2) + '</tspan></text>';
    });
    s += '</svg><div class="radarNota">El hexágono muestra tu equilibrio entre estadísticas, no tu progreso: cada eje se mide contra un máximo fijo (Vida y Esencia hasta 300; Ataque, Defensa, Mente y Velocidad hasta 100), así que el polígono se ve pequeño aunque ya entrenes. Tu progreso real está en los niveles (Nv.) y las barras de XP de abajo. Tope real de cada estadística: 3000.</div></div>';
    return s;
  },
  construirPausaBase() {
    const E = U.Juego.estado, j = E.jugador, a = U.Atributos.de(j.atributo); let html = '';
    { const G = U.Guardado; const ult = G ? G.ultimoAutoTexto() : '—';
      html += '<section><h3>Partida · guardado automático</h3>'
      + '<div style="font-size:12px;color:var(--texto)"><span style="color:var(--exito)">●</span> <b>Guardado automático: ACTIVADO, siempre.</b> Tu partida se guarda sola en este navegador cada pocos segundos, al abrir esta pantalla y al salir. No tienes que hacer nada: al volver a entrar sigues donde ibas.</div>'
      + '<div style="font-size:11px;color:var(--textoFrio);margin-top:4px">Último guardado automático: ' + ult + ' · Se guarda en este navegador y este teléfono; en otro navegador empieza vacío.</div>'
      + '<div class="guardadoBtns"><button class="mini exito" id="btnDescargarPausa" title="Descarga tu partida como archivo de respaldo">⬇ DESCARGAR PARTIDA</button><button class="mini" id="btnCargarPausa" title="Carga una partida desde un archivo descargado antes">CARGAR DESDE ARCHIVO</button><button class="mini peligro" id="btnBorrarAuto" title="Borra el guardado automático de este navegador">BORRAR GUARDADO</button></div>'
      + '<div style="font-size:11px;color:var(--textoTenue);margin-top:6px">Descargar partida es solo un respaldo: un archivo que puedes guardar donde quieras o pasar a otro teléfono, y volver a cargarlo desde aquí. El juego normal no lo necesita, porque ya se guarda solo.</div></section>';
    }
    html += '<section><h3>Estadísticas · ' + this.escHtml(j.nombre) + ' · semilla ' + this.escHtml(E.semilla) + '</h3>';
    html += this.radarStats(j);
    for (const k in j.stats) { const v = j.stats[k]; const ref = (k === 'vida' || k === 'esencia') ? 200 : 20; html += '<div class="statFila" style="grid-template-columns:86px 1fr 118px" title="' + U.Estadisticas.descrip[k] + '"><span>' + U.Estadisticas.etiquetas[k] + '</span><div class="bar"><i style="transform:scaleX(' + Math.min(1, v / ref) + ')"></i></div><span class="val">' + v.toFixed(2) + ' / 3000</span></div>';
      // Barra de XP del nivel de esta estadística (visible: la ventaja del atributo es una barra más corta, no un ×2 invisible).
      const nv = (j.nivelStat && j.nivelStat[k]) || 1; const xp = (j.xpStat && j.xpStat[k]) || 0; const need = U.Estadisticas.xpParaNivel(nv, j.atributo, k); const marca = U.Atributos.esFavorita(j.atributo, k) ? 'Favorita: barra a la mitad' : U.Atributos.esPenalizada(j.atributo, k) ? 'Penalizada: barra ×5/3' : 'Neutral';
      html += '<div class="statFila" style="grid-template-columns:86px 1fr 118px;margin-top:-4px" title="Nivel de ' + U.Estadisticas.etiquetas[k] + ' · ' + marca + ' · Al subir: +' + U.Estadisticas.gananciaNivel[k] + ' ' + U.Estadisticas.etiquetas[k] + '"><span style="font-size:11px;color:var(--textoFrio)">Nv. ' + nv + '</span><div class="bar"><i style="transform:scaleX(' + Math.min(1, xp / need) + ');background:linear-gradient(90deg,#67e08a,#a7f3c9)"></i></div><span class="val">' + (Math.round(xp * 100) / 100) + ' / ' + need + ' XP</span></div>'; }
    { const tot = U.Crecimiento.total || {}; const crec = Object.keys(tot).filter(k => tot[k] >= 0.01).map(k => U.Estadisticas.etiquetas[k] + ' +' + tot[k].toFixed(2) + ' XP').join(' · '); html += '<div style="font-size:11px;color:var(--exito);margin-top:6px">XP ganada en esta vida (sube peleando): ' + (crec || 'todavía nada — golpea, recibe, esquiva y vence enemigos para que suba') + '</div>'; }
    html += '<div style="font-size:11px;color:var(--textoTenue);margin-top:6px">Niveles por estadística: cada acción da XP a su estadística (un puño ≈ 1 XP de Ataque, un dash ≈ 2 XP de Velocidad); al llenar la barra el stat sube 1 nivel y su valor sube (Vida y Esencia +5, el resto +1). Tu atributo acorta la barra de sus favoritas a la mitad y alarga la de su penalizada (×5/3). No hay tope de nivel. Tope de las 6 estadísticas: 3000 (al llegar, esa estadística deja de ganar XP). Recuperación de Esencia: ' + U.Recuperacion.capacidad().toFixed(1) + '/s · Vida automática ' + (a.descanso * 100).toFixed(1) + '%/s solo bajo el 25% (tope: 25% en campo abierto) · Dormir en la fogata: Vida y Esencia al 100% y el reloj avanza al siguiente momento del día. Día de 20 min reales con 6 momentos: Madrugada 00–04 · Amanecer 04–08 · Mañana 08–12 · Tarde 12–16 · Atardecer 16–20 · Noche 20–00. Calendario semanal: Lunes a Domingo.</div>'
    + '<div class="statFila" style="grid-template-columns:86px 1fr 118px" title="Condición: 100% es estar en perfecta forma. Cada 10 de Esencia gastada baja 1; la recarga de Esencia va por escalones: ×1.0 desde la mitad del máximo para arriba, ×0.5 de la mitad a un cuarto, ×0.1 por debajo de un cuarto (nunca cero). Se recupera muy lento fuera de combate, según tu atributo, por hora de juego; en combate no se recupera. Dormir la deja al 100% del máximo."><span style="color:#a9c795">Condición</span><div class="bar"><i style="transform:scaleX(' + ((j.cansancio != null ? j.cansancio : U.Recuperacion.condicionMax(j)) / U.Recuperacion.condicionMax(j)) + ');background:linear-gradient(90deg,#6f9a5e,#a9c795)"></i></div><span class="val">' + Math.floor(j.cansancio != null ? j.cansancio : U.Recuperacion.condicionMax(j)) + ' / ' + U.Recuperacion.condicionMax(j) + ' · recarga ×' + U.Recuperacion.multCansancio().toFixed(2) + '</span></div>'
    + '<div style="font-size:11px;color:var(--textoTenue)">Condición: cada 10 de Esencia que gastas en total (técnicas, Yang, dash… y también el drenaje del escudo) baja 1 punto. La recarga de Esencia no baja poco a poco: va por escalones medidos del máximo actual — de la mitad para arriba recuperas completo (×1.0, sin castigo); de la mitad a un cuarto, a la mitad de velocidad (×0.5); por debajo de un cuarto, al 10% (×0.1), muy lento pero nunca cero. Al cruzar un límite el ritmo salta de un escalón al otro. Nunca te bloquea lanzar poderes. El Fluido gasta más Esencia por técnica, así que se cansa más rápido. Se recupera MUCHO más lento que la Esencia, según tu atributo (la misma capacidad de tu Esencia —base 5, Sabio 10, Duro 2— pero POR HORA DE JUEGO, no por segundo) y solo fuera de combate: en combate no se recupera, solo baja. Dormir (fogata o cama) la deja al 100% de su máximo. Su máximo empieza en 100 y crece +5 cada vez que tu Condición cruza por debajo de 25 —cuando de verdad te cansas— hasta +100 por estrés (200 sin Yin). Dominar el Yin da más barra: nivel de Yin ' + U.Recuperacion.nivelYin(j) + ' de 5 (cada nivel +20) → máximo actual ' + U.Recuperacion.condicionMax(j) + ' (tope 300 con Yin Nv.5 y todo el estrés).</div></section>';
    html += '<section><h3>Escudo · técnica de Guía</h3>' + (j.escudoAprendido
      ? '<div style="font-size:12px"><b style="color:' + U.Combate.escudoColor(j) + '">' + U.Combate.escudoNombre(j) + '</b> · Nivel ' + (j.escudoNv || 1) + ' de 3 (' + U.Habilidades.escudo.niveles[j.escudoNv || 1].nombre + ') · Integridad ' + U.Combate.escudoMax(j) + ' · Bloqueos para subir: ' + (j.escudoNv >= 3 ? 'nivel máximo' : (j.escudoExp || 0) + '/' + U.Habilidades.escudo.niveles[j.escudoNv || 1].bloquesParaSubir) + '</div><div style="font-size:11px;color:var(--textoFrio);margin-top:4px">Un solo botón (B). Sin moverte mientras está activo; drena Esencia por segundo según el clima de tu elemento. La tabla de ventajas le aplica como a ti: el Agua apaga el de Fuego (tu Esencia se queda; vuelve a levantarlo), el Rayo atraviesa el de Agua con ventaja sin romperlo, el Agua erosiona el de Tierra hasta volverlo lodo, la Tierra se amortigua contra el de Agua, el Viento desvía proyectiles pero cede cuerpo a cuerpo, el campo de Rayo castiga al que lo toca, y tu mismo elemento lo absorbe. Su naturaleza es la de tu elemento principal (el del test), fijo toda la vida.</div>'
      : '<div style="font-size:12px;color:var(--aviso)">Aún no conoces el Escudo. Es una TÉCNICA: hay que buscar a alguien que te la enseñe. Kaelen, el guardia de la aldea, es el Guía de guardia: habla con él y elige «Aprender el ESCUDO». Cuando lo aprendas entrará en tu EQUIPO (Pausa → Ajustes → Equipo) si hay hueco.</div>') + '</section>';
    html += '<section><h3>Maestría elemental · curva multiplicativa · técnicas con un Guía</h3>';
    U.Elementos.ids.forEach(id => { const m = j.maestria[id] || 0; const propio = j.elementos.indexOf(id) >= 0; html += '<div class="statFila" style="opacity:' + (propio ? 1 : 0.45) + '"><span style="color:' + U.Elementos.color(id) + '">' + U.Elementos.nombre(id) + '</span><div class="bar"><i style="transform:scaleX(' + m / 100 + ');background:' + U.Elementos.color(id) + '"></i></div><span class="val">' + m.toFixed(1) + '%</span></div>'; });
    html += '<div style="font-size:11px;color:var(--textoTenue)">Etapa actual: ' + U.Elementos.etapa(j.maestria[j.elementoActivo] || 0) + '. Dominar UN elemento es el trabajo de una vida; los 5, como cinco vidas.</div>' + '<div style="font-size:11px;color:var(--textoFrio);margin-top:4px">📈 <b>Curva multiplicativa (no lineal):</b> la maestría sube gradual y cada tramo cuesta MÁS esfuerzo que el anterior — también los primeros son lentos. A tu ' + Math.floor(j.maestria[j.elementoActivo] || 0) + '% actual, cada punto cuesta ×' + (U.Crecimiento.curvaDiv ? U.Crecimiento.curvaDiv(j.maestria[j.elementoActivo] || 0).toFixed(2) : '1.00') + ' el esfuerzo del primer tramo, y seguirá subiendo. Las técnicas son POCAS y se aprenden de un GUÍA por tarea: 15 / 40 / 70% son la maestría MÍNIMA para poder aprender cada una, no un desbloqueo por porcentaje.</div>'
    + '<div style="font-size:11px;color:var(--textoFrio);margin-top:4px">🎯 <b>Alcance elemental: ' + (U.Combate.alcanceElemental ? U.Combate.alcanceElemental(j) : 1) + ' celdas</b> con tu maestría de ' + U.Elementos.nombre(j.elementoActivo) + ' (' + Math.floor(j.maestria[j.elementoActivo] || 0) + '%): +1 celda por cada 5% de maestría (0–5% = 1 celda … 100% = 20 celdas), como tope de lo que cada técnica permita. El daño elemental cae con la distancia: 100% a 1 celda y 80% en la última celda del alcance, bajando poco a poco (lineal) entre ambas. <b>Ataques RADIALES</b> (círculo a tu alrededor, en todas las direcciones): radio ' + (U.Combate.radioRadial ? U.Combate.radioRadial(j) : 1) + ' celdas = la MITAD de tu alcance lineal (redondeado hacia abajo, mínimo 1); cuestan +50% de Esencia y hacen −10% de daño por enemigo. <b>Llamarada (Fuego):</b> línea recta en celdas ALTERNAS — golpea las celdas 1, 3, 5… con +20% de daño y salta las pares, que no reciben daño.</div></section>';
    html += '<section><h3>Estilos</h3><div class="statFila"><span style="color:var(--yin)">Yin</span><div class="bar"><i style="transform:scaleX(' + j.estilos.yin / 100 + ');background:var(--yin)"></i></div><span class="val">' + j.estilos.yin.toFixed(1) + '</span></div>'
      + '<div class="statFila"><span>Yang</span><div class="bar"><i style="transform:scaleX(' + j.estilos.yang / 100 + ');background:var(--yang)"></i></div><span class="val">' + j.estilos.yang.toFixed(1) + '</span></div>'
      + (j.tieneYang
        ? '<div style="font-size:11px;color:var(--textoTenue)">' + (j.perfil.yangAfin ? 'Tu test reveló afinidad Yang: naciste con el estilo despierto.' : 'Alcanzaste el Yang entrenando, sin afinidad revelada: como dominar otro elemento.') + ' Desarrollarlo a fondo lleva su propia vida de entrenamiento.</div>'
        : '<div style="font-size:12px;color:var(--aviso)">Yang · SIN AFINIDAD REVELADA, PERO ALCANZABLE. No está cerrado: como dominar otro elemento, se logra entrenando. Llévalo a ' + U.Habilidades.yangDespertar + ' y despertará (aparecerá su botón). Entrena meditando mientras descansas (R o junto a la fogata) o con las sesiones guiadas de Torin (25 de Esencia). Yin lo tiene todo el mundo (es el cuerpo); desarrollarlo de verdad ya es otra historia.</div>')
      + '<div style="font-size:11px;color:var(--textoTenue)">Yin: cuerpo, cerca, casi sin Esencia (2/6/4). Yang (al despertar): energía blanca, lejos, cara (Haz 15, Onda 14, Esférico 18) y mejora tu recuperación. Inclinación de esta vida: ' + j.perfil.estilo.toUpperCase() + '.</div></section>';
    html += '<section><h3>Atributo · ' + a.nombre + ' (fijo por vida)</h3><div style="font-size:12px"><span style="color:var(--exito)">' + a.ventaja + '</span> · <span style="color:var(--aviso)">' + a.desventaja + '</span></div><div style="font-size:11px;color:var(--textoFrio);margin-top:4px">' + a.desc + ' La ventaja real es la barra de XP más corta en un camino largo.</div></section>';
    { const cl = E.clima ? U.Clima.de(E) : U.Clima.TIPOS.despejado; const ff2 = U.Tiempo.faseDe(U.Tiempo.hora(E));
      html += '<section><h3>Calendario · clima · tu casa · memoria</h3><div style="font-size:12px">📅 <b>' + U.Tiempo.diaTexto(E.reloj) + '</b> · Momento: ' + ff2.nombre + ' (' + U.Tiempo.formato(E.reloj.minutos) + ') · 6 momentos por día, semana de Lunes a Domingo.<br>' + cl.icono + ' <b>Clima: ' + cl.nombre + '</b> · ' + cl.detalle + '. Cambia solo cada pocos minutos y ajusta costos. La lluvia tiene intensidades (ligera, normal, fuerte y tormenta): bajo techo (tu casa, la Oficina) no llueve ni cambian los costos; afuera, el Agua es progresiva (ligera ×0.8, normal ×0.5, fuerte y tormenta = 1) y junto a ríos, estanques u oasis paga DECIMALES (×0.15): la Esencia baja poquito a poquito. El Fuego paga más cuanto más llueve, la Tierra y el Rayo bajan un poco y el Viento sube. La TEMPERATURA también pesa: con calor el Fuego paga ×0.85 y el Agua ×1.25; con frío, al revés (Fuego ×1.2, Agua ×0.9). Todos los costos viven en decimales.<br>🏠 Tu casa (puerta de la casa azul): alarma fijada a las <b>' + U.Tiempo.formato(E.alarmaMin) + '</b> · Hechizo de Inversión: ' + (E.flags.hechizoInversion ? '<b style="color:var(--exito)">aprendido (tecla V)</b>' : 'sin aprender (obelisco de la Montaña Brumosa)') + '<br>Monedas: <b style="color:var(--rayo)">' + Math.floor(j.monedas || 0) + ' 🪙</b> (misiones por rango · arena completa 50 · podio del torneo 300/150/80 · tienda de Marisol) · Torneos ganados: ' + (E.historial.torneos || 0) + ' · Misiones entregadas: ' + (E.historial.misiones || 0) + '<br>Historial de esta vida: victorias de arena ' + E.historial.victorias + ' · caídas ' + E.historial.derrotas + ' · retos superados ' + E.historial.retos + ' · entrenamientos completos ' + E.historial.entrenos + '. Los NPC recuerdan todo esto cuando hablas con ellos (tú hablas primero).</div></section>';
    }
    { const criaturas = E.criaturas || []; const conocidas = criaturas.filter(c => c.vinculo > 0 || U.Criaturas.tieneContrato(c));
      html += '<section><h3>🐾 Compañeros · criaturas salvajes y contratos</h3>'
      + '<div style="font-size:11px;color:var(--textoFrio)">Las criaturas salvajes vagan por cada región (desierto, bosque, nieve y lago) con su temperamento: las HOSTILES te atacan si te acercas, las TÍMIDAS huyen, y a las AMISTOSAS les puedes HABLAR en el mundo (tócalas cuando salga su globo) para subir su VÍNCULO. Con 60+ de vínculo: CONTRATO DE SANGRE (máximo 3, solo en esta vida). Con el vínculo al MÁXIMO (100): CONTRATO DE ALMA — ritual + su consentimiento, solo UNO, y cruza vidas (queda en tu pasaporte). Invocada, tu compañera te sigue y pelea a tu lado.</div>'
      + (conocidas.length ? conocidas.map(c => { const ct = U.Criaturas.tieneContrato(c); return '<div class="mochilaItem"><span>🐾 <b>' + U.Criaturas.nombreDe(c) + '</b> <small style="color:var(--textoFrio)">' + U.Criaturas.REGION_NOMBRE[c.region] + ' · vínculo ' + Math.round(c.vinculo) + '/100' + (ct ? ' · contrato de ' + ct.toUpperCase() : '') + (c.invocada ? ' · CONTIGO' : '') + '</small></span><span class="acts">' + (ct ? (c.invocada ? '<button class="mini peligro" data-despedir="' + c.uid + '">DESPEDIR</button>' : '<button class="mini exito" data-invocar="' + c.uid + '">INVOCAR</button>') : '') + '</span></div>'; }).join('') : '<div style="font-size:12px;color:var(--textoFrio);margin-top:4px">Todavía no te vinculaste con ninguna criatura. Busca una AMISTOSA en su región (un espíritu del bosque, un lagarto curioso del oasis, una nutria del lago…) y háblale.</div>')
      + '<div style="font-size:11px;color:var(--textoTenue);margin-top:4px">Contratos de sangre: ' + (E.contratos ? E.contratos.sangre.length : 0) + '/3 · Contrato de alma: ' + (E.contratos && E.contratos.alma ? U.Criaturas.nombreDe(U.Criaturas.buscar(E.contratos.alma) || { nombre: '—' }) : 'ninguno todavía') + '</div></section>';
    }
    { const O = E.orgs || null; const alguna = O && ['mano', 'jade', 'cole'].some(k => O[k] && O[k].descubierta);
      const secRum = O && O.secreta ? (O.secreta.rumores || 0) : 0;
      let orgHtml = alguna ? ['mano', 'jade', 'cole'].filter(k => O[k].descubierta).map(k => { const o = O[k], d = U.Orgs.DEFS[k]; return '<div style="font-size:12px;margin:5px 0"><b style="color:' + d.color + '">' + d.nombre + '</b> · ' + (o.detenida ? '<span style="color:var(--exito)">DETENIDA / trama resuelta</span>' : o.unido ? '<span style="color:var(--aviso)">ESTÁS DENTRO</span>' : 'activa · pistas ' + o.pistas) + '<br><span style="color:var(--textoFrio)">' + d.resumen + '</span></div>'; }).join('') : '<div style="font-size:12px;color:var(--textoFrio)">No sabes de ninguna organización. Si algo se mueve en este mundo, no te lo van a anunciar: se descubre hablando con la gente — rumores, pistas y quien investiga, como Vera en la Metrópolis.</div>';
      if (secRum >= 1 && U.Orgs) { const poderS = U.Orgs.poderSecreta(); orgHtml += '<div style="font-size:12px;margin:5px 0"><b style="color:#e8a2e0">ORGANIZACIÓN SIN NOMBRE</b> · <span style="color:var(--aviso)">solo rumores · poder en la sombra ≈ ' + poderS + '%</span><br><span style="color:var(--textoFrio)">' + U.Orgs.SECRETA.resumen + '</span>' + (secRum >= 2 ? '<br><span style="color:var(--textoFrio)">Escuadrones que mencionan los rumores: <b>Alfa</b> protege (Escudo de [Elemento], Barrera, Muro) · <b>Beta</b> hace misiones peligrosas (Golpe Fuerte, Explosión, Asalto) · <b>Gamma</b> investiga (Invisibilidad, Rastreo, Sentido — son hechiceros). Líder: ' + U.Orgs.SECRETA.lider + '</span>' : '') + '</div>'; }
      html += '<section><h3>🕵 Organizaciones</h3>' + orgHtml + (U.Escondites ? U.Escondites.html() : '') + '</section>';
    }
    html += '<section><h3>🧙 Hechiceros · Arte Místico / Mente</h3><div style="font-size:12px;color:var(--textoFrio)">' + (j.hechicero && j.hechicero.potencial ? 'Tu test REVELÓ potencial de hechicero: afinidad con el Arte Místico / la Mente. ' : 'Tu test no reveló potencial de hechicero, pero puedes CONVERTIRTE en uno si vas con los hechiceros (en Arcana) y te entrenas con ellos. ') + 'Ser hechicero es casi otra vida: súper difícil, toma una vida, y primero se aprenden cosas básicas (Sentido, Rastreo, Barrera mental). Básicas aprendidas: <b>' + ((j.hechicero && j.hechicero.basicos) || 0) + '/3</b>' + (U.Habilidades.basicasAprendidas ? ' (' + (U.Habilidades.basicasAprendidas(j).map(b => b.nombre).join(', ') || 'ninguna todavía') + ')' : '') + ' — se aprenden en Arcana, con los hechiceros: habla con Esteban, el bibliotecario, que te presenta (en orden: Sentido, Rastreo, Barrera mental; con 1 básica se abre la Mirada que Pesa, con 2 la Prisión del Espejo). La INVISIBILIDAD es técnica de hechiceros y tú NO puedes aprenderla: es mental, no elemental, y no es congruente con ningún elemento. La tienen hechiceros entrenados, como los del Escuadrón Gamma.</div></section>';
    html += '<section><h3>📖 Libros de historia (opcionales)</h3><div style="font-size:12px;color:var(--textoFrio)"><b>El Sello.</b> Nadie PUEDE escapar del sello: esa es la certeza vieja. Lo que nadie sabía es que el sello se fue DEBILITANDO con el tiempo… y que el compañero de El Infernal está detrás de ese debilitamiento, trabajando en secreto para liberarlo.<br><b>El Señor.</b> Jesucristo, el Señor, existe en este mundo, pero no aparece en persona en tu camino: no es alguien a quien te vayas a encontrar por las aldeas. Por respeto, a quien te enseña se le dice siempre <b>Guía</b>: el título mayor pertenece solo al Señor.<br><b>Las aldeas.</b> Entre las aldeas hay TENSIÓN: baja, sin guerra, pero real — desconfianza, roces por los recursos y por el dominio. Ese es el trasfondo con el que los que drenan dominio justifican lo suyo: dicen que con un solo control no habría tensión ni guerra.<br><b>Las Puertas del Infierno (LEYENDA).</b> La técnica prohibida que usó Orión para sellar a El Infernal… y sellarse a sí mismo con él. Las técnicas normales se aprenden de un Guía; las prohibidas son la excepción y se aprenden de pergaminos. De esta, Los Coleccionistas —que también coleccionan técnicas prohibidas, pergaminos raros y conocimiento peligroso— buscan su pergamino como la pieza más valiosa que existe. Nadie sabe dónde está, ni si existe: es solo un rumor, y NO se puede aprender.</div></section>';
    if (U.Progresion) html += U.Progresion.resumenPerfil();
    html += '<section><h3>Diario · tus objetivos (mundo abierto, sin final ni orden)</h3><ul class="diario">' + E.objetivos.filter(o => { if (!o.oculto) return true; const oo = E.orgs && o.orgId ? E.orgs[o.orgId] : null; return !!(oo && oo.descubierta); }).map(o => '<li class="' + o.estado + '">' + (o.estado === 'hecho' ? '✓ ' : '◆ ') + o.texto + '</li>').join('') + '</ul><div style="font-size:11px;color:var(--textoTenue)">Ninguno es obligatorio ni va antes que otro: son TU lista de cosas posibles. Cumplir uno no termina el juego.</div></section>';
    html += '<section><h3>Vecinos de Bruma · personalidad · dónde están ahora</h3>' + (E.roster || E.npcs).map(n => { const per = U.Personas ? U.Personas.de(n.id) : null; const donde = U.Vida ? U.Vida.dondeEstaTexto(n) : ''; return '<div style="font-size:12px;margin:4px 0"><b>' + n.nombre + '</b> · <span style="color:' + U.Emociones.tonos[n.emocion].color + '">' + n.emocion + '</span> · confianza ' + Math.round(n.estados.confianza) + (per ? '<br><span style="color:var(--textoFrio)">' + per.tipo + ' · le gusta: ' + per.gustos.join(', ') + '</span>' : '') + '<br><span style="color:var(--rayo)">📍 ' + n.nombre + ' ' + donde + '</span></div>'; }).join('') + '<div style="font-size:11px;color:var(--textoTenue)">Cada vecino tiene su rutina: trabaja, come en la plaza, entrena en el Bosque y vuelve a casa de noche (21:00; Pipo a las 20:00). Si alguien no está en su puesto, pregúntale a otro vecino «¿Dónde está…?» y te dirá dónde fue. Sparring: Kaelen–Marco 09:00–11:00 · Torin–Breno 14:00–17:00. El círculo no está en un lugar fijo: se forma alrededor de la pelea, donde sea que esté pasando; acércate a ese círculo y te ofrecerán unirte. El agua no los detiene a todos: cada vecino cruza según su elemento y su propia decisión — los de Agua, Viento y Tierra cruzan (los de Tierra dejan puente al pasar); los de Fuego y Rayo solo cruzan si ellos deciden hacerlo, y a los que no, el agua les bloquea el paso como a ti sin el botón.</div></section>';
    html += '<section><h3>Controles</h3><div class="controlesLista">WASD / joystick: mover (analógico)<br>E / botón A: trote +25% (mantén; el A ya no interactúa)<br>Interactuar: toca directamente al personaje u objeto cuando salga su globo (hablar, leer, beber, dormir…)<br>J / Yin: toca golpe 2 · mantén cargado 6<br>TÉC: ataque básico de tu elemento (siempre) · 1-5: usar la técnica del equipo en ese hueco<br>K / Yang: primera forma Yang equipada<br>L: primera técnica elemental equipada (o básico si no llevas ninguna)<br>Shift / Dash: esquiva con invulnerabilidad 4<br>Q: poción +50% · R: meditar (Esencia ×3, entrena Yang; la Vida automática sigue con techo 25%) · Fogata (tócala): dormir, despertar al 100%<br>F: cambiar forma Yang (solo entre las equipadas)<br>X: Sobrecarga (Yin 15) · V: Hechizo de Inversión (tras aprenderlo en el obelisco) · B: Escudo (tras aprenderlo con Kaelen; Nv.1 frente, Nv.2 frente y lados, Nv.3 cuatro lados; sin moverte) · M: sonido · Esc: pausa<br>Tu elemento es fijo (el del test). Tu EQUIPO se cambia en Pausa → Ajustes → Equipo (hasta 5 técnicas, mezclando elementos).</div></section>';
    html += '<section><h3>Próximamente (no activo en el juego completo)</h3><div class="listaProx">' + ['Portal', 'Pasaporte', 'Entre-Mundos', 'Eco', 'Pilotaje', 'Modo Alma', 'Teletransportación', 'Intangible', 'Arte Místico (hechiceros: camino de una vida)', 'Invisibilidad (solo hechiceros · tú no puedes aprenderla)', 'Técnicas combinadas', 'Transformaciones Yin/Yang', 'Sangre · Plasma · Metal · Sonido · Magnetismo', 'Vuelo (Viento)', 'Disco Cortante (Yang)'].map(s => '<span>' + s + '</span>').join('') + '</div></section>';
    this.el.pausaCuerpo.innerHTML = html; document.getElementById('selDificultad').value = String(E.dificultad);
    const bD = document.getElementById('btnDescargarPausa'); if (bD) bD.addEventListener('click', () => U.Guardado.descargar());
    const bCP = document.getElementById('btnCargarPausa'); if (bCP) bCP.addEventListener('click', () => U.Guardado.elegirArchivo());
    const bB = document.getElementById('btnBorrarAuto'); if (bB) bB.addEventListener('click', () => { if (bB.dataset.armado) { U.Guardado.borrarAuto(); bB.textContent = 'BORRADO ✓ (AL SEGUIR JUGANDO SE GUARDA ESTA VIDA)'; return; } bB.dataset.armado = '1'; bB.textContent = '¿SEGURO? TOCA OTRA VEZ'; setTimeout(() => { delete bB.dataset.armado; bB.textContent = 'BORRAR GUARDADO'; }, 3000); });
  },
  // ===== MENÚ DE PAUSA estilo Pokémon: Mochila · Mapa · Estadísticas · Reputación · Ajustes · Guardar =====
  construirPausa() { this.seccionPausa('menu'); },
  navPausa(activa) {
    const secs = [['menu', '☰ Menú'], ['mochila', '🎒 Mochila'], ['mapa', '🗺 Mapa'], ['estadisticas', '📊 Estadísticas'], ['progresion', '🎓 Progresión'], ['reputacion', '✦ Reputación'], ['ajustes', '⚙ Ajustes'], ['guardar', '💾 Guardar']];
    return '<div class="pausaNav">' + secs.map(x => '<button class="mini' + (x[0] === activa ? ' exito' : '') + '" data-sec="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>';
  },
  seccionPausa(sec) {
    const E = U.Juego.estado, j = E.jugador; if (!E || !j) return;
    j.bolsaPociones = j.bolsaPociones || []; j.bolsaComida = j.bolsaComida || []; j.polainas = j.polainas || {}; j.karma = j.karma || {};
    let html = this.navPausa(sec);
    if (sec === 'menu') {
      html += '<div class="menuLista">'
        + '<button data-sec="mochila">🎒 Mochila <small>' + j.bolsaPociones.length + '/3 pociones · ' + j.bolsaComida.length + '/5 comidas' + (j.polainaEquipada ? ' · ' + U.Economia.POLAINAS[j.polainaEquipada].nombre + ' puestas' : '') + '</small></button>'
        + '<button data-sec="mapa">🗺 Mapa <small>' + (E.mapa ? E.mapa.nombreMapa : '') + ' · el minimapa sigue visible en el juego</small></button>'
        + '<button data-sec="estadisticas">📊 Estadísticas <small>' + U.Elementos.nombre(j.elementoActivo) + ' · maestría ' + Math.floor(j.maestria[j.elementoActivo] || 0) + '%</small></button>'
        + '<button data-sec="progresion">🎓 Progresión <small>' + (U.Progresion ? U.Progresion.rangoEscuelaNom(U.Progresion.asegurar() || { escuela: 'estudiante' }) : 'Estudiante') + ' · escuela, academia, cuartel, gimnasios y títulos</small></button>'
        + '<button data-sec="reputacion">✦ Reputación (karma) <small>Aldea de Bruma: ' + (j.karma.aldea || 0) + '</small></button>'
        + '<button data-sec="ajustes">⚙ Ajustes <small>sonido, dificultad y tu equipo de técnicas</small></button>'
        + '<button data-sec="guardar">💾 Guardar <small>automático siempre activo</small></button>'
        + '</div><div style="font-size:11px;color:var(--textoTenue);margin-top:8px">El juego está PAUSADO mientras este menú está abierto. La mochila no pesa: llevar cosas no te hace más lento; el límite es cuántas caben (3 pociones y 5 comidas).</div>';
    } else if (sec === 'mochila') {
      html += '<section><h3>🎒 Mochila · pociones a medida (' + j.bolsaPociones.length + '/3)</h3>';
      if (!j.bolsaPociones.length) html += '<div style="font-size:12px;color:var(--textoFrio)">Sin pociones. Marisol te prepara una a medida en la tienda: tú eliges las unidades.</div>';
      j.bolsaPociones.forEach((p2, i) => { const nom = p2.tipo === 'vida' ? 'Poción de Vida' : p2.tipo === 'esencia' ? 'Tónico de Esencia' : 'Poción de Condición'; html += '<div class="mochilaItem"><span>' + (p2.tipo === 'vida' ? '🧪' : p2.tipo === 'esencia' ? '🔵' : '💚') + ' <b>' + nom + ' +' + p2.unidades + '</b>' + (p2.precio ? ' <small style="color:var(--textoFrio)">(costó ' + p2.precio + ' 🪙 · venderla devuelve ' + Math.floor(p2.precio / 2) + ')</small>' : '') + '</span><span class="acts"><button class="mini exito" data-usar="' + i + '">TOMAR</button>' + (p2.precio ? '<button class="mini" data-vender="' + i + '">VENDER · ' + Math.floor(p2.precio / 2) + ' 🪙</button>' : '') + '</span></div>'; });
      html += '<div style="font-size:11px;color:var(--textoTenue)">El botón rápido del HUD (Q) toma la poción de Vida MÁS CHICA. Aquí eliges la exacta: al tomarla, lo que sobra se pierde.</div></section>';
      html += '<section><h3>🍽 Comida (' + j.bolsaComida.length + '/5) · hoy ' + (j.comidasHoy || 0) + '/3</h3>';
      if (!j.bolsaComida.length) html += '<div style="font-size:12px;color:var(--textoFrio)">Sin comida. La tienda vende las 5: dulce, salada, picante, ácida y amarga, a 10 🪙.</div>';
      const conteo = {}; j.bolsaComida.forEach((sab, i) => { conteo[sab] = conteo[sab] || []; conteo[sab].push(i); });
      Object.keys(conteo).forEach(sab => { const ranking = j.sabores || U.Economia.SABORES; const puesto = ranking.indexOf(sab); const ef = U.Economia.COMER[puesto]; html += '<div class="mochilaItem"><span>🍽 <b>Comida ' + sab + '</b> ×' + conteo[sab].length + ' <small style="color:var(--textoFrio)">(tu sabor nº ' + (puesto + 1) + ': ' + (ef.vida ? '+' + ef.vida + '% Vida · ' : '') + (ef.esencia ? '+' + ef.esencia + '% Esencia' : 'solo te llena') + ')</small></span><span class="acts"><button class="mini exito" data-comer="' + conteo[sab][0] + '">COMER</button></span></div>'; });
      html += '<div style="font-size:11px;color:var(--textoTenue)">Comer: máximo 3 al día, solo fuera de combate, sube PORCENTAJE según TU orden de sabores del test. La comida NO restaura Condición.</div></section>';
      html += '<section><h3>🦵 Polainas (pesas de tobillo) · una puesta a la vez</h3>';
      Object.keys(U.Economia.POLAINAS).forEach(clave => { const pd = U.Economia.POLAINAS[clave]; const tiene = !!j.polainas[clave]; const puesta = j.polainaEquipada === clave;
        html += '<div class="mochilaItem"><span><b>' + pd.nombre + '</b> <small style="color:var(--textoFrio)">' + (tiene ? 'vas ' + Math.round((1 - pd.velMult) * 100) + '% más lento · Velocidad ×' + pd.crecMult + ' en combate · +1 Vel cada ' + pd.pasosPunto + ' pasos · −1 Condición cada ' + pd.condCada + ' pasos' : 'no las tienes: ' + pd.precio + ' 🪙 en la tienda') + '</small></span><span class="acts">' + (tiene ? (puesta ? '<button class="mini peligro" data-polaina="">QUITAR</button>' : '<button class="mini exito" data-polaina="' + clave + '">EQUIPAR</button>') : '') + '</span></div>'; });
      html += '<div style="font-size:11px;color:var(--textoTenue)">Con las polainas NO eres más rápido: vas más lento. Lo que crece es tu nivel de Velocidad (en combates y un poco por pasos; el dash nunca cuenta). Al quitártelas, eres más rápido porque el nivel ya subió, y es permanente.</div></section>';
      if (U.Reliquias) html += U.Reliquias.htmlMochila();
      if (U.Prohibidas) html += U.Prohibidas.htmlMochila();
    } else if (sec === 'mapa') {
      if (this.enGuarida(E)) {
        html += '<section><h3>🗺 Mapa · lugar desconocido</h3><div style="font-size:12px;color:var(--textoFrio)">Estás en una GUARIDA: un lugar que no conoces. Aquí no hay minimapa ni mapa completo — tendrás que orientarte por lo que veas. Al salir, tu mapa vuelve.</div></section>';
      } else {
        html += '<section><h3>🗺 Mapa · ' + (E.mapa ? E.mapa.nombreMapa : '') + '</h3><div style="text-align:center"><canvas id="mapaCompleto" width="512" height="384" style="width:min(512px,100%);image-rendering:pixelated;border:3px solid var(--borde);background:#0e1530"></canvas></div>'
          + '<div style="font-size:12px;color:var(--textoFrio);margin-top:6px">NIEBLA DE GUERRA: lo que ya exploraste QUEDA revelado (puedes volver), lo que no, está oscuro. Bruma y sus alrededores nacen revelados, porque ahí vives. Un rumor puede revelar un pueblo sin visitarlo (aparece marcado en dorado).</div>'
          + '<div style="font-size:12px;color:var(--textoFrio);margin-top:6px">El CONTINENTE DE BRUMA (440×400, TODO en un solo mapa continuo, rodeado de mar: el borde del mundo es agua): <b>La Metrópolis</b> en el CENTRO — la mega ciudad, la más grande y avanzada, con su tienda de pociones y peleadores de todas las aldeas · <b>Aldea de Bruma</b> cerca de ella, al suroeste (oficina del Guardián, tienda de Marisol, tu casa, la Arena de Ecos) · las aldeas elementales, LEJOS y en radial: <b>Aldea Vuelo Alto</b> (Viento) al norte · <b>Aldea Chispa Alta</b> (Rayo) al noreste · <b>Puerto Brisa Azul</b> (Agua) al este, junto al Lago Brisa Azul y el Río del Este · <b>Aldea Ceniza Viva</b> (Fuego) al sureste, sobre la Tierra Quemada · <b>Aldea Raíz de Piedra</b> (Tierra) al suroeste · y más lejos, al oeste, <b>Arcana</b>, la pequeña metrópolis de los magos. Regiones: <b>Bosque Susurrante</b> al noroeste · <b>Montaña Brumosa</b> al noreste, con nieve y el obelisco · <b>Desierto de Sal</b> al oeste-sur, con su oasis · la <b>Laguna Serena</b> al sur. Y SEIS pueblos pequeños repartidos por los caminos (Alto Pino, Rocafirme, Tres Cruces, Salina, Vega Baja, Brasa Chica): SIN tienda de pociones — ahí se RENTA UNA CASA por 15 🪙 la noche para dormir y despertar al 100%. Naces en la aldea de TU elemento. Caminos cosen todo en radial y en anillo (a cada aldea se llega por más de un camino), pero el continente es libre: puedes ir a campo traviesa en cualquier dirección, como en GTA. Solo tu casa y la Oficina son interiores: ahí sí entras por su puerta. El minimapa sigue visible en el juego, como siempre.</div></section>';
      }
    } else if (sec === 'reputacion') {
      html += '<section><h3>✦ Reputación · tu KARMA por pueblo</h3><div style="font-size:12px;color:var(--textoFrio)">El karma va de −100 a +100 y es POR PUEBLO: donde no te conocen empiezas en 0, neutral. En precios: 3% por cada 10 de karma (máximo 30% de descuento o de recargo). A −80 o menos, ese pueblo se niega a venderte.</div>';
      Object.keys(U.Economia.PUEBLOS).forEach(pid => { const k = j.karma[pid] || 0; const pct = Math.max(0, Math.min(100, 50 + k / 2)); html += '<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:13px"><b>' + U.Economia.PUEBLOS[pid] + '</b><span>Karma <b style="color:' + (k > 0 ? 'var(--exito)' : k < 0 ? 'var(--peligro)' : 'var(--texto)') + '">' + k + '</b> · ' + U.Economia.factorTexto(k) + (k <= -80 ? ' · 🚫 NO TE VENDEN' : '') + '</span></div><div class="karmaBar"><i style="left:' + (k >= 0 ? 50 : pct) + '%;width:' + Math.abs(k) / 2 + '%;background:' + (k >= 0 ? 'var(--exito)' : 'var(--peligro)') + '"></i></div></div>'; });
      html += '<div style="font-size:11px;color:var(--textoTenue)">Sube: dar dinero cuando te lo piden +3 · dar la comida pedida +2 · cumplir una misión que ayuda +2. Baja: negarte −2 · prometer y no dar −5 · atacar a un inocente −10 · robar −10. Ejemplo: una poción de 50 unidades en Bruma con karma 0 cuesta 100 🪙; en el desierto con karma +60 cuesta 123; en Bruma con karma −60 cuesta 118.</div></section>';
    } else if (sec === 'progresion') {
      html += U.Progresion ? U.Progresion.htmlPausa() : '<section><h3>🎓 Progresión</h3><div style="font-size:12px">Sistema de progresión no disponible.</div></section>';
    } else if (sec === 'estadisticas') {
      this.el.pausaCuerpo.innerHTML = html; this.construirPausaBase();
      const cuerpo = this.el.pausaCuerpo; cuerpo.innerHTML = html + cuerpo.innerHTML.replace(/^<div class="pausaNav">[\s\S]*?<\/div>/, '');
      this.cablearPausa(); return;
    } else if (sec === 'ajustes') {
      html += '<section><h3>⚙ Ajustes</h3><div style="font-size:12px">Sonido y dificultad están en la barra inferior de esta pantalla. Tu elemento es fijo (lo definió el test). Abajo, en Equipo, eliges qué técnicas aprendidas aparecen como botones (máx. 5): las que aprendas entran solas si hay hueco libre, y aquí las quitas o las pones tú. El minimapa queda visible por defecto en el juego, y el Mapa completo vive en este menú.</div></section>';
      html += this.htmlEquipo();
    } else if (sec === 'guardar') {
      html += '<section><h3>💾 Guardar</h3><div style="font-size:12px"><span style="color:var(--exito)">●</span> <b>Guardado automático: ACTIVADO, siempre.</b> Tu partida (monedas, mochila, karma, polainas, tablón y misiones) se guarda sola en este navegador cada pocos segundos. También puedes descargar un archivo de respaldo desde la barra inferior.</div></section>';
    }
    this.el.pausaCuerpo.innerHTML = html;
    this.cablearPausa();
    if (sec === 'mapa' && !this.enGuarida(E)) { const cv = document.getElementById('mapaCompleto'); if (cv && U.Render.mapaCompleto) U.Render.mapaCompleto(cv, E, (E.mapas && E.mapas.aldea) || E.mapa); }
  },
  cablearPausa() {
    const c = this.el.pausaCuerpo; if (!c) return;
    c.querySelectorAll('[data-sec]').forEach(b => b.addEventListener('click', () => this.seccionPausa(b.dataset.sec)));
    // Equipo: añadir / quitar / reordenar (re-render de Ajustes + botones del HUD).
    const reEq = () => { this.refrescarEquipo(); this.refrescarChips(); if (U.Juego.estado && U.Juego.estado.ui === 'pausa') this.seccionPausa('ajustes'); };
    c.querySelectorAll('[data-eq-add]').forEach(b => b.addEventListener('click', () => { const r = U.Habilidades.equipar(U.Juego.estado.jugador, b.dataset.eqAdd); if (!r.ok) U.HUD.toast('No se pudo equipar: ' + r.motivo + '.', 'aviso'); else { U.Audio.sfx('click'); } reEq(); }));
    c.querySelectorAll('[data-eq-del]').forEach(b => b.addEventListener('click', () => { U.Habilidades.desequipar(U.Juego.estado.jugador, b.dataset.eqDel); U.Audio.sfx('click'); reEq(); }));
    c.querySelectorAll('[data-eq-up]').forEach(b => b.addEventListener('click', () => { U.Habilidades.moverEquipo(U.Juego.estado.jugador, b.dataset.eqUp, -1); reEq(); }));
    c.querySelectorAll('[data-eq-down]').forEach(b => b.addEventListener('click', () => { U.Habilidades.moverEquipo(U.Juego.estado.jugador, b.dataset.eqDown, 1); reEq(); }));
    c.querySelectorAll('[data-prog]').forEach(b => b.addEventListener('click', () => { if (U.Progresion) U.Progresion.accion(b.dataset.prog, b.dataset); if (U.Juego.estado && U.Juego.estado.ui === 'pausa') this.seccionPausa('progresion'); }));
    c.querySelectorAll('[data-usar]').forEach(b => b.addEventListener('click', () => { U.Recuperacion.usarPocion(parseInt(b.dataset.usar)); this.seccionPausa('mochila'); }));
    c.querySelectorAll('[data-vender]').forEach(b => b.addEventListener('click', () => { const E = U.Juego.estado, j = E.jugador; const p2 = (j.bolsaPociones || [])[parseInt(b.dataset.vender)]; if (p2) { const mitad = Math.floor((p2.precio || 0) / 2); j.bolsaPociones.splice(parseInt(b.dataset.vender), 1); j.monedas = (j.monedas || 0) + mitad; U.Recuperacion.sincronizar(j); U.HUD.toast('Poción vendida por ' + mitad + ' 🪙 (la mitad de lo que pagaste).', 'exito'); U.Audio.sfx('cura'); } this.seccionPausa('mochila'); }));
    c.querySelectorAll('[data-comer]').forEach(b => b.addEventListener('click', () => { U.Recuperacion.comer(parseInt(b.dataset.comer)); this.seccionPausa('mochila'); }));
    c.querySelectorAll('[data-reliquia]').forEach(b => b.addEventListener('click', () => { if (U.Reliquias) U.Reliquias.accionMochila(b.dataset.reliquia, b.dataset.id); this.seccionPausa('mochila'); }));
    c.querySelectorAll('[data-prohibida]').forEach(b => b.addEventListener('click', () => { if (U.Prohibidas) U.Prohibidas.accionMochila(b.dataset.prohibida, b.dataset.id); if (U.Juego.estado && U.Juego.estado.ui === 'pausa') this.seccionPausa('mochila'); }));
    c.querySelectorAll('[data-polaina]').forEach(b => b.addEventListener('click', () => { const j = U.Juego.estado.jugador; const clave = b.dataset.polaina; if (!clave) { j.polainaEquipada = null; j.polainaMultCrec = 1; U.HUD.toast('Polainas fuera. Tu nivel de Velocidad se queda: lo ganado entrenando es permanente.', 'exito'); } else { j.polainaEquipada = clave; j.polainaMultCrec = U.Economia.POLAINAS[clave].crecMult; j.pasosPolainas = 0; j.condPolainas = 0; U.HUD.toast(U.Economia.POLAINAS[clave].nombre + ' puestas: vas más lento, pero tu Velocidad entrena ×' + U.Economia.POLAINAS[clave].crecMult + ' en combate.', 'aviso'); } U.Audio.sfx('click'); this.seccionPausa('mochila'); }));
    c.querySelectorAll('[data-invocar]').forEach(b => b.addEventListener('click', () => { const cc = U.Criaturas.buscar(b.dataset.invocar); if (cc && U.Criaturas.invocar(cc)) U.HUD.toast('✦ ' + U.Criaturas.nombreDe(cc) + ' acude a tu lado al cerrar el menú.', 'exito'); this.seccionPausa('estadisticas'); }));
    c.querySelectorAll('[data-despedir]').forEach(b => b.addEventListener('click', () => { const cc = U.Criaturas.buscar(b.dataset.despedir); if (cc) { U.Criaturas.despedir(cc); U.HUD.toast(U.Criaturas.nombreDe(cc) + ' vuelve a su región. El contrato sigue.', ''); } this.seccionPausa('estadisticas'); }));
    const bD = document.getElementById('btnDescargarPausa'); if (bD && !bD.dataset.cable) { bD.dataset.cable = '1'; bD.addEventListener('click', () => U.Guardado.descargar()); }
    const bCP = document.getElementById('btnCargarPausa'); if (bCP && !bCP.dataset.cable) { bCP.dataset.cable = '1'; bCP.addEventListener('click', () => U.Guardado.elegirArchivo()); }
    const bB = document.getElementById('btnBorrarAuto'); if (bB && !bB.dataset.cable) { bB.dataset.cable = '1'; bB.addEventListener('click', () => { if (bB.dataset.armado) { U.Guardado.borrarAuto(); bB.textContent = 'BORRADO ✓'; return; } bB.dataset.armado = '1'; bB.textContent = '¿SEGURO? TOCA OTRA VEZ'; setTimeout(() => { delete bB.dataset.armado; bB.textContent = 'BORRAR GUARDADO'; }, 3000); }); }
    this.refrescarScrollPausa();
  },
  refrescarScrollPausa() {
    const c = this.el.pausaCuerpo; const a = document.getElementById('pausaScrollAviso'); if (!c || !a) return;
    if (!this._pausaScrollLigado) { this._pausaScrollLigado = true; c.addEventListener('scroll', () => this.refrescarScrollPausa(), { passive: true }); window.addEventListener('resize', () => this.refrescarScrollPausa()); }
    requestAnimationFrame(() => { const sobra = c.scrollHeight > c.clientHeight + 6; const falta = c.scrollHeight - c.scrollTop - c.clientHeight > 6; a.classList.toggle('visible', sobra && falta); });
  },
  mostrarFin(tipo, datos) {
    const E = U.Juego.estado, j = E.jugador; const caja = this.el.fin.querySelector('.finCaja'); caja.classList.toggle('derrota', tipo === 'derrota');
    document.getElementById('finTitulo').textContent = tipo === 'victoria' ? '¡ARENA SUPERADA!' : 'HAS CAÍDO';
    document.getElementById('finSub').textContent = tipo === 'victoria' ? 'Ronda ' + E.arena.ronda + ' · 3 oleadas. Tu cuerpo recuerda lo que hizo: mira lo que creció.' : 'En el juego completo no hay muerte permanente: despiertas en la fogata con el 25% de Vida. Lo aprendido se queda.';
    const r = E.resumen; let html = '';
    const item = (k, v) => '<div>' + k + '<b>' + v + '</b></div>';
    html += item('Daño infligido', Math.round(r.daño)) + item('Daño recibido', Math.round(r.recibido)) + item('Bajas', r.bajas) + item('Golpes Yin', r.golpes) + item('Técnicas', r.tecnicas) + item('Yang', r.yang) + item('Esquivas', r.esquives);
    for (const k in r.crecimiento) if (r.crecimiento[k] >= 0.005) html += item(U.Estadisticas.etiquetas[k], '+' + r.crecimiento[k].toFixed(2));
    for (const k in r.maestria) if (r.maestria[k] >= 0.05) html += item('Maestría ' + U.Elementos.nombre(k), '+' + r.maestria[k].toFixed(1) + '%');
    document.getElementById('finResumen').innerHTML = html;
    const b = document.getElementById('finBotones'); b.innerHTML = '';
    if (tipo === 'victoria') { const b1 = document.createElement('button'); b1.className = 'mini exito'; b1.textContent = 'VOLVER A LA ALDEA'; b1.addEventListener('click', () => { this.ocultarFin(); U.Juego.estado.arena.ronda++; U.Juego.estado.objetivos[3].estado = 'actual'; U.Juego.siguienteObjetivo(); U.HUD.toast('Cuéntale tu victoria a Kaelen. Premio de la arena ya cobrado en monedas. La próxima ronda será más dura.', 'exito'); }); b.appendChild(b1); const b2 = document.createElement('button'); b2.className = 'mini'; b2.textContent = 'SIGUIENTE RONDA (MÁS DIFÍCIL)'; b2.addEventListener('click', () => { this.ocultarFin(); U.Juego.estado.arena.ronda++; U.Combate.iniciarArena(); }); b.appendChild(b2); }
    else { const b1 = document.createElement('button'); b1.className = 'mini exito'; b1.textContent = 'DESPERTAR EN LA FOGATA'; b1.addEventListener('click', () => { this.ocultarFin(); U.Juego.despertar(); }); b.appendChild(b1); }
    this.el.fin.classList.remove('oculto'); E.ui = 'fin';
  },
  ocultarFin() { this.el.fin.classList.add('oculto'); U.Juego.estado.ui = 'mundo'; }
};
