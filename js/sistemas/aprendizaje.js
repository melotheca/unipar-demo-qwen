/* === js/sistemas/aprendizaje.js === */
/* Unipar — MINIJUEGO DE APRENDIZAJE de técnicas ESPECIALES (de un Guía).
   Cómo se juega: el Guía DEMUESTRA la técnica y tú tienes que seguirla.
   - Un marcador cruza una pista de lado a lado, MUY RÁPIDO al principio (un
     barrido cada 0.5 s: apenas lo puedes seguir) y hay una zona luminosa en la
     pista, en un sitio distinto cada vez.
   - Pulsa el botón ¡AHORA! (o Espacio) justo cuando el marcador pasa POR la zona:
     ACIERTO. Si pulsas fuera, FALLO (la zona se mueve, sin castigo de velocidad).
   - Cada ACIERTO hace la demostración un poco MÁS LENTA (el periodo del barrido
     ×1.15: la vas siguiendo mejor) y suma 1 a tu progreso de esa técnica.
   - Al llegar a 10 ACIERTOS el barrido tarda ~2 s: ya la sigues con calma, la
     DOMINAS y la aprendes: entra a tecnicasAprendidas y se auto-equipa si hay
     hueco (U.Habilidades.aprenderTecnica), como las demás técnicas.
   - El progreso (velocidad actual, aciertos, fallos) se guarda POR TÉCNICA en
     j.aprendizaje y en su propia clave de almacenamiento ('unipar_aprendizaje_v1'):
     si cierras a medias, al volver sigues donde ibas (la demostración ya no va
     tan rápida). NO es el guardado general (guardado.js no serializa j.aprendizaje:
     para que viaje con la partida hace falta 1 línea allí — ver nota al final).
   - NO se usa para el Escudo (se aprende como siempre, de Kaelen) ni para los
     movimientos generales (maestría o Guía, sin minijuego). Solo ESPECIALES.
   - Entrada: U.Aprendizaje.iniciar('dragonLago', 'sora') — la abre quien enseña
     (diálogo del Guía, por cablear: U.Aprendizaje.ofrecer('sora') lista lo que
     ese Guía enseña). Mientras está abierto, U.Aprendizaje.activo = true (el
     bucle del juego puede mirarlo para no robar el Espacio).
   NOTA PARA INTEGRACIÓN (coordinador): 1) añadir <script
   src="js/sistemas/aprendizaje.js"></script> en index.html (después de
   combate.js); 2) opción en el diálogo del Guía que llame a
   U.Aprendizaje.iniciar(idEspecial, idGuia); 3) si el progreso debe viajar con
   el archivo de partida, 1 línea en guardado.js: serializar/restaurar
   j.aprendizaje (hoy vive en su propia clave local, no en el archivo). */
window.U = window.U || {};

U.Aprendizaje = {
  // La demostración: periodo (segundos por barrido) inicial, final y ritmo.
  PERIODO_INICIAL: 0.5,   // MUY rápida al principio: apenas la puedes seguir
  PERIODO_DOMINIO: 2.0,   // a 2 s por barrido ya la sigues con calma: dominio
  FACTOR_LENTO: 1.15,     // cada acierto: periodo ×1.15 (más lenta)
  ACIERTOS_DOMINIO: 10,   // aciertos para dominar (0.5 × 1.15^10 ≈ 2.02 s)
  ANCHO_ZONA: 0.18,       // la zona luminosa ocupa el 18% de la pista
  CLAVE: 'unipar_aprendizaje_v1',
  activo: false, tecId: null, guiaId: null, _raf: 0, _ultimo: 0, _fase: 0,
  _els: null, _tecla: null,

  // ---- matemáticas puras (testeables sin DOM) ----
  periodoTras(n) { return this.PERIODO_INICIAL * Math.pow(this.FACTOR_LENTO, Math.max(0, n || 0)); },
  dominioAlcanzado(prog) { return !!prog && (prog.aciertos || 0) >= this.ACIERTOS_DOMINIO && this.periodoTras(prog.aciertos) >= this.PERIODO_DOMINIO; },

  // ---- progreso por técnica ----
  _mapa(j) { if (!j) return {}; j.aprendizaje = j.aprendizaje || {}; return j.aprendizaje; },
  progreso(j, tecId) {
    const m = this._mapa(j);
    if (!m[tecId]) {
      m[tecId] = { aciertos: 0, fallos: 0, dominada: false };
      try { const g = JSON.parse(localStorage.getItem(this.CLAVE) || '{}'); if (g[tecId]) m[tecId] = { aciertos: g[tecId].aciertos || 0, fallos: g[tecId].fallos || 0, dominada: !!g[tecId].dominada }; } catch (e) { /* sin almacenamiento: el progreso vive solo en la sesión */ }
    }
    return m[tecId];
  },
  guardarProgreso(j) {
    if (!j || !j.aprendizaje) return;
    try { localStorage.setItem(this.CLAVE, JSON.stringify(j.aprendizaje)); } catch (e) { /* sin almacenamiento */ }
    try { if (U.Guardado) U.Guardado.guardarAuto(); } catch (e) { /* el guardado general no corre aquí */ }
  },
  // Lo que un Guía enseña (para el diálogo: qué especiales ofrece cada Guía).
  ofrecer(guiaId) { return U.Habilidades.especialesDeGuia(guiaId); },
  puedeEnseñar(guiaId, tecId) { return this.ofrecer(guiaId).some(h => h.id === tecId); },

  // ---- apertura ----
  iniciar(tecId, guiaId) {
    if (this.activo) return false;
    if (typeof document === 'undefined') return false;
    const j = U.Juego && U.Juego.estado ? U.Juego.estado.jugador : null;
    if (!j) return false;
    const tec = (U.Habilidades.especiales || []).find(h => h.id === tecId);
    if (!tec) return false;
    if (tec.maestro && guiaId && tec.maestro !== guiaId) return false; // ese Guía no enseña esta técnica
    if (!U.Habilidades.porId(j, 'especial:' + tecId)) return false; // no está en tu registro (no es de tu elemento): el Guía no puede enseñártela
    if (U.Habilidades.aprendida(j, U.Habilidades.porId(j, 'especial:' + tecId))) { if (U.HUD) U.HUD.toast('Ya dominas ' + tec.nombre + '.', 'exito'); return false; }
    const prog = this.progreso(j, tecId);
    if (prog.dominada) return false;
    this.activo = true; this.tecId = tecId; this.guiaId = guiaId || tec.maestro;
    this._fase = 0; this._ultimo = 0; this._zona = Math.random() * (1 - this.ANCHO_ZONA);
    this._construirUI(tec, prog);
    this._tecla = e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); this.presionar(); } else if (e.code === 'Escape') this.cerrar(); };
    document.addEventListener('keydown', this._tecla);
    const paso = ts => {
      if (!this.activo) return;
      if (this._ultimo) { const dt = Math.min(0.1, (ts - this._ultimo) / 1000); this._fase += dt / this.periodoTras(this.progreso(j, this.tecId).aciertos); }
      this._ultimo = ts;
      this._pintar();
      this._raf = requestAnimationFrame(paso);
    };
    this._raf = requestAnimationFrame(paso);
    return true;
  },
  _construirUI(tec, prog) {
    const raiz = document.createElement('div');
    raiz.id = 'aprendizaje';
    raiz.style.cssText = 'position:fixed;inset:0;z-index:999;background:rgba(5,7,15,.92);display:flex;align-items:center;justify-content:center;font-family:inherit;color:#f8fafc;';
    const guia = (U.Personas && U.Personas.de ? U.Personas.de(this.guiaId).tipo : '') || '';
    raiz.innerHTML = '<div style="width:min(92vw,460px);background:#141a2e;border:2px solid #e8a2e0;border-radius:14px;padding:18px;text-align:center">'
      + '<div style="font-size:12px;color:#e8a2e0">✦ TÉCNICA ESPECIAL · APRENDIZAJE CON GUÍA ✦</div>'
      + '<h2 style="margin:8px 0 2px">' + tec.nombre + '</h2>'
      + '<div style="font-size:12px;color:#9fb3d9">' + (this.guiaId || '') + (guia ? ' · ' + guia : '') + ' te la demuestra. Al principio va MUY rápida: apenas la sigues. Con cada acierto se pone más lenta, hasta que la dominas.</div>'
      + '<div id="aprPista" style="position:relative;height:30px;margin:16px 0 8px;background:#05070f;border:1px solid #5b6b8a;border-radius:8px;overflow:hidden">'
      + '<div id="aprZona" style="position:absolute;top:0;bottom:0;background:rgba(232,162,224,.45);border-left:2px solid #e8a2e0;border-right:2px solid #e8a2e0"></div>'
      + '<div id="aprMarca" style="position:absolute;top:2px;bottom:2px;width:10px;margin-left:-5px;background:#ffe14d;border-radius:4px"></div></div>'
      + '<div id="aprEstado" style="font-size:13px;margin:4px 0 10px"></div>'
      + '<button id="aprBoton" style="font-size:20px;padding:12px 34px;border-radius:12px;border:0;background:#e8a2e0;color:#141a2e;font-weight:bold;cursor:pointer">¡AHORA!</button>'
      + '<div style="font-size:11px;color:#9fb3d9;margin-top:8px">Pulsa ¡AHORA! (o Espacio) justo cuando la marca amarilla pasa POR la zona rosa.</div>'
      + '<button id="aprCerrar" style="margin-top:12px;background:none;border:1px solid #5b6b8a;color:#9fb3d9;border-radius:8px;padding:6px 14px;cursor:pointer">Practicar después (se guarda tu progreso)</button>'
      + '</div>';
    document.body.appendChild(raiz);
    raiz.querySelector('#aprBoton').addEventListener('click', () => this.presionar());
    raiz.querySelector('#aprCerrar').addEventListener('click', () => this.cerrar());
    this._els = { raiz, zona: raiz.querySelector('#aprZona'), marca: raiz.querySelector('#aprMarca'), estado: raiz.querySelector('#aprEstado') };
    this._pintarEstado(prog);
  },
  _pos() { const f = this._fase % 2; return f <= 1 ? f : 2 - f; },
  _pintar() {
    if (!this._els) return;
    const pos = this._pos();
    this._els.marca.style.left = (pos * 100) + '%';
    this._els.zona.style.left = (this._zona * 100) + '%';
    this._els.zona.style.width = (this.ANCHO_ZONA * 100) + '%';
  },
  _pintarEstado(prog) {
    if (!this._els) return;
    const per = this.periodoTras(prog.aciertos);
    this._els.estado.textContent = 'Aciertos: ' + prog.aciertos + '/' + this.ACIERTOS_DOMINIO + ' · Fallos: ' + prog.fallos + ' · Velocidad: 1 barrido cada ' + per.toFixed(2) + ' s' + (prog.aciertos === 0 ? ' (¡rapidísima!)' : per >= this.PERIODO_DOMINIO ? ' (ya la sigues con calma)' : ' (se va poniendo lenta)');
  },
  // ---- el pulso ----
  presionar() {
    if (!this.activo || !this.tecId) return;
    const j = U.Juego.estado.jugador;
    const prog = this.progreso(j, this.tecId);
    const pos = this._pos();
    const acierto = pos >= this._zona && pos <= this._zona + this.ANCHO_ZONA;
    if (acierto) {
      prog.aciertos++;
      if (U.Audio) U.Audio.sfx('unlock');
      if (this.dominioAlcanzado(prog)) { this._aprender(j, prog); return; }
    } else {
      prog.fallos++;
      if (U.Audio) U.Audio.sfx('fail');
    }
    this._zona = Math.random() * (1 - this.ANCHO_ZONA);
    this._pintarEstado(prog);
    this.guardarProgreso(j);
  },
  _aprender(j, prog) {
    prog.dominada = true;
    this.guardarProgreso(j);
    const id = 'especial:' + this.tecId;
    const tec = U.Habilidades.porId(j, id);
    U.Habilidades.aprenderTecnica(id);
    this.cerrar();
    if (U.HUD) { U.HUD.banner('✦ ¡' + (tec ? tec.nombre.toUpperCase() : 'TÉCNICA ESPECIAL') + ' DOMINADA! · YA ES TUYA', 3); U.HUD.toast('La demostración ya va a tu velocidad: la técnica es tuya y entró a tu equipo si había hueco (máx. 5).', 'exito'); }
    if (U.Audio) U.Audio.sfx('victoria');
    if (U.Guardado) U.Guardado.guardarAuto();
  },
  cerrar() {
    if (!this.activo) return;
    this.activo = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
    if (this._tecla && typeof document !== 'undefined') document.removeEventListener('keydown', this._tecla);
    this._tecla = null;
    if (this._els && this._els.raiz && this._els.raiz.remove) this._els.raiz.remove();
    this._els = null;
    this.tecId = null; this.guiaId = null;
  }
};
