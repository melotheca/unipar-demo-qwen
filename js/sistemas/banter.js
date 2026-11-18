/* === js/sistemas/banter.js === */
/* Unipar — DIÁLOGO DE COMBATE (banter): el enemigo habla SOLO cuando la vida
   está MUY BAJA (≤25%): la suya (casiPierde) o la tuya (casiPierdes). Nada más:
   no hay línea de apertura, ni reacción a esquives, técnicas, Tiempo Lento o
   dash. Solo enemigos humanoides con personalidad habladora; los callados
   NUNCA dicen nada y las criaturas NUNCA hablan (ni siquiera se consideran
   como hablante). Efímero: nada se guarda; al cargar partida empieza apagado. */
window.U = window.U || {};

U.Banter = {
  DURACION: 4.5, // segundos que se muestra la caja
  UMBRAL: 0.25,  // ≤25% de vida
  RANGO: 11,     // celdas: el hablante es el enemigo vivo más cercano dentro de este rango
  _el: null, _cara: null, _nombre: null, _texto: null,
  _visible: false, _t: 0,
  _hablante: null, _prevVidaH: 1, _prevVidaJ: 1,
  _contador: 0,

  // ---------- DOM (perezoso, en el primer actualizar) ----------
  init() {
    if (this._el) return;
    const juego = document.getElementById('juego');
    if (!juego) return;
    const caja = document.createElement('div');
    caja.id = 'banter';
    caja.setAttribute('aria-live', 'polite');
    const cara = document.createElement('canvas');
    cara.id = 'banterCara'; cara.width = 48; cara.height = 48;
    const cuerpo = document.createElement('div');
    cuerpo.className = 'banterCuerpo';
    const nom = document.createElement('b');
    nom.id = 'banterNombre';
    const txt = document.createElement('span');
    txt.id = 'banterTexto';
    cuerpo.appendChild(nom); cuerpo.appendChild(txt);
    const btn = document.createElement('button');
    btn.id = 'banterCerrar'; btn.type = 'button'; btn.title = 'Cerrar'; btn.textContent = '✕';
    const self = this;
    btn.addEventListener('click', function () { self.esconder(); });
    caja.appendChild(cara); caja.appendChild(cuerpo); caja.appendChild(btn);
    juego.appendChild(caja);
    this._el = caja; this._cara = cara; this._nombre = nom; this._texto = txt;
  },

  // ---------- resolución del hablante ----------
  // Tipo de personalidad del enemigo (se asigna una sola vez, al azar, de
  // tiposPersonalidad[clase]); se guarda en e.banterTipo.
  _asegurarTipo(e) {
    if (e.banterTipo) return e.banterTipo;
    const D = U.BanterDic;
    const lista = (D && D.tiposPersonalidad && D.tiposPersonalidad[e.clase]) || ['Salvaje'];
    e.banterTipo = lista[Math.floor(Math.random() * lista.length)];
    return e.banterTipo;
  },
  // Clave de U.BanterDic.nombres que aparece dentro del nombre del enemigo
  // (substring; si varias coinciden, la más larga, que es la más específica).
  _claveNombre(nombre) {
    const D = U.BanterDic;
    if (!D || !D.nombres || !nombre) return null;
    let mejor = null;
    for (const k in D.nombres) {
      if (nombre.indexOf(k) >= 0 && (!mejor || k.length > mejor.length)) mejor = k;
    }
    return mejor;
  },
  // ¿Este enemigo habla? Con entrada propia en nombres habla con sus líneas,
  // SALVO habla: false (p. ej. 'Vacío sin Nombre'). Sin entrada propia, habla
  // si su tipo de personalidad contiene una palabra habladora o ninguna; si
  // contiene una palabra callada, NUNCA habla.
  _esHablador(e) {
    const D = U.BanterDic;
    if (!D) return false; // sin diccionario no hay líneas: nadie habla
    const clave = this._claveNombre(e.nombre || '');
    if (clave) {
      const ent = D.nombres[clave];
      if (ent && ent.habla === false) return false;
      return true;
    }
    const tipo = (this._asegurarTipo(e) || '').toLowerCase();
    const calladas = (D.personalidades && D.personalidades.calladas) || [];
    for (let i = 0; i < calladas.length; i++) {
      if (tipo.indexOf(String(calladas[i]).toLowerCase()) >= 0) return false;
    }
    return true;
  },
  // Tipo de hablante para la capa de tipos (sin 'criatura': nunca hablan).
  _tipo(e) {
    if (e.esJefeGuarida) return 'jefe';
    if (e.esTorneo) return 'torneo';
    if (e.esReto) return 'reto';
    const nom = e.nombre || '';
    const org = e.esOrg;
    if (e.guanteNegro || org === 'mano' || (typeof org === 'string' && (org.indexOf('mano') === 0 || org.indexOf('cole') === 0)) || nom.indexOf('Coleccionista') >= 0 || nom.indexOf('Red de Jade') >= 0) return 'coleccionista';
    if (nom === 'Líder de la Patrulla') return 'lider';
    if (nom.indexOf('Patrullero') >= 0) return 'patrullero';
    return e.clase || 'bandido';
  },
  // Registro de la línea, con las mismas reglas que U.Diccionario.registroDe
  // más el 4º registro 'cobarde'.
  _registro(e) {
    const t = (this._asegurarTipo(e) || '').toLowerCase();
    if (t.indexOf('brusco') >= 0 || t.indexOf('rudo') >= 0 || t.indexOf('arrogante') >= 0) return 'brusco';
    if (t.indexOf('amable') >= 0 || t.indexOf('maternal') >= 0 || t.indexOf('inocente') >= 0) return 'amable';
    if (t.indexOf('cobarde') >= 0 || t.indexOf('miedoso') >= 0 || t.indexOf('asustadizo') >= 0) return 'cobarde';
    return 'neutro';
  },

  // ---------- líneas ----------
  // Prioridad: nombres → tipos → estados por registro. Solo los dos estados
  // (casiPierde / casiPierdes); si el diccionario trajera otros, se ignoran.
  // Sin repetir la misma línea dos veces seguidas para el mismo (hablante, estado).
  _elegirLinea(e, estado) {
    const D = U.BanterDic;
    if (!D || (estado !== 'casiPierde' && estado !== 'casiPierdes')) return null;
    const nombre = e.nombre || '';
    let lista = null;
    const clave = this._claveNombre(nombre);
    if (clave && D.nombres[clave] && D.nombres[clave][estado]) lista = D.nombres[clave][estado];
    if ((!lista || !lista.length) && D.tipos) {
      const t = this._tipo(e);
      if (D.tipos[t] && D.tipos[t][estado]) lista = D.tipos[t][estado];
    }
    let registro = 'neutro';
    if ((!lista || !lista.length) && D.estados && D.estados[estado]) {
      registro = this._registro(e);
      lista = D.estados[estado][registro] || D.estados[estado].neutro;
    }
    if (!lista || !lista.length) return null;
    const ult = (e._banterUltima || {})[estado];
    let linea = '', intentos = 0;
    do {
      this._contador++;
      const ck = nombre + ':' + estado + ':' + this._contador;
      linea = (U.Diccionario && U.Diccionario.elegir) ? U.Diccionario.elegir(lista, ck) : lista[this._contador % lista.length];
      intentos++;
    } while (linea === ult && lista.length > 1 && intentos < 6);
    if (!e._banterUltima) e._banterUltima = {};
    e._banterUltima[estado] = linea;
    return { linea: linea, registro: registro };
  },

  // ---------- mostrar / esconder ----------
  mostrar(e, estado) {
    if (!this._el) this.init();
    if (!this._el) return;
    const res = this._elegirLinea(e, estado);
    if (!res || !res.linea) return;
    const emocion = res.registro === 'amable' ? 'sereno' : (estado === 'casiPierde' ? 'asustado' : 'alegre');
    const nom = e.nombre || '';
    const caraId = nom.indexOf('Dario') === 0 ? 'dario' : (nom.indexOf('Sana') === 0 ? 'sana' : (e.clase || 'bandido'));
    if (this._cara && U.Render && U.Render.cara) {
      const ctx = this._cara.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      U.Render.cara(ctx, caraId, emocion, 0, 0, 3); // 16x16 a escala 3 = 48x48
    }
    this._nombre.textContent = nom.split(' · ')[0] || 'Enemigo';
    this._texto.textContent = res.linea;
    this._el.classList.add('visible');
    this._visible = true;
    this._t = this.DURACION;
  },
  esconder() {
    if (!this._el) return;
    this._el.classList.remove('visible');
    this._visible = false; this._t = 0;
  },
  _resetPelea() { this._hablante = null; this._prevVidaH = 1; this._prevVidaJ = 1; },

  // ---------- bucle (llamado cada frame desde U.Combate.actualizar, con dt real) ----------
  actualizar(dt) {
    if (!this._el) this.init();
    const E = U.Juego.estado;
    if (!E || !E.jugador || E.ui !== 'mundo') { this.esconder(); return; }
    if (this._visible) { this._t -= dt; if (this._t <= 0) this.esconder(); }
    const j = E.jugador;
    // Hablante: el enemigo vivo NO sparring y HABLADOR más cercano (<11 celdas).
    // Las criaturas nunca hablan: no se consideran. Los callados tampoco.
    let mejor = null, mejorD = this.RANGO;
    (E.enemigos || []).forEach(e => {
      if (!e || e.vida <= 0 || e.esSparring) return;
      if (!this._esHablador(e)) return;
      const d = U.Grid.dist(e, j);
      if (d < mejorD) { mejorD = d; mejor = e; }
    });
    if (!mejor) { this.esconder(); this._resetPelea(); return; }
    const fH = mejor.vida / (mejor.stats.vida || 1);
    const fJ = j.vida / (j.stats.vida || 1);
    if (this._hablante !== mejor) {
      // Nuevo hablante (o nueva pelea): el cruce se resetea; no dispara por
      // entrar ya herido, solo cuando la vida CRUZA el 25% durante la pelea.
      this._hablante = mejor; this._prevVidaH = fH; this._prevVidaJ = fJ;
      return;
    }
    // Solo dos cruces de umbral (≤25%), una línea por cruce: si la vida sube
    // por encima de 25% y vuelve a bajar, puede volver a disparar.
    if (this._prevVidaJ > this.UMBRAL && fJ <= this.UMBRAL) this.mostrar(mejor, 'casiPierdes');
    else if (this._prevVidaH > this.UMBRAL && fH <= this.UMBRAL) this.mostrar(mejor, 'casiPierde');
    this._prevVidaH = fH; this._prevVidaJ = fJ;
  }
};
