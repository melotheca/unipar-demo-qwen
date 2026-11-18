/* === js/ui/eleccion-directa.js === */
/* Unipar — elección directa: nacer sin hacer el test. El jugador elige su
   elemento (PURO: sin pool de afinidad, sin bonus +50% de puro, los demás
   elementos en 0 XP y 0%), su atributo (SÍ aplica su bono de inicio y su
   barra de XP favorita/penalizada), su estilo natural (Yin o Yang; el elegido
   crece ×1.5 más rápido) y reparte 40 PUNTOS entre Fuerza, Resistencia, Mente
   y Velocidad (cada una empieza en 0, MÁXIMO 10 por stat). Vida y Esencia son
   FIJOS en 100 cada uno (base adulto) + bono de elemento y bono de atributo.
   NO hay bono +2 del test: ese +2 es el 'extra' por completar el test.
   El perfil que sale de aquí tiene la MISMA forma que el del test
   (U.TestUI.calcular): nivelStat todo en 1, xpStat todo en 0, estilos
   Yin/Yang en nivel 1, tieneYang true (lo pone comenzarMundo), metaDespertar
   150/300 igual que el test — así U.Juego.comenzarMundo lo consume sin
   tocar nada. La lógica pura (crearPerfil / validarPuntos /
   statsResultantes) no toca el DOM: se verifica en Node con
   test-eleccion-directa.js, igual que test-correccion2.js verifica el test. */
window.U = window.U || {};

U.EleccionDirecta = {
  PUNTOS_TOTAL: 40, MAX_POR_STAT: 10,
  STATS_REPARTO: ['ataque', 'defensa', 'mente', 'velocidad'],
  ETIQUETAS_REPARTO: { ataque: 'Fuerza', defensa: 'Resistencia', mente: 'Mente', velocidad: 'Velocidad' },

  // ---------- lógica pura (sin DOM) ----------
  // Valida y sanea un reparto: cada stat entero entre 0 y MAX_POR_STAT, y el
  // total no pasa de PUNTOS_TOTAL. Si viene de más, se recorta por orden
  // (ataque, defensa, mente, velocidad) hasta quedar en 40. Devuelve el
  // reparto saneado, lo gastado, lo que queda y si es válido para confirmar.
  // Se PUEDE confirmar con puntos sin gastar (ej. 10/10/10/0 = 30): la UI
  // avisa antes, pero no lo prohíbe — el usuario puede querer una stat baja.
  validarPuntos(puntos) {
    const saneado = {}; const errores = [];
    this.STATS_REPARTO.forEach(k => {
      let v = puntos ? puntos[k] : 0; v = Math.floor(Number(v) || 0);
      if (v < 0) { errores.push(U.Estadisticas.etiquetas[k] + ' no puede ser negativo'); v = 0; }
      if (v > this.MAX_POR_STAT) { errores.push(U.Estadisticas.etiquetas[k] + ' no puede pasar de ' + this.MAX_POR_STAT); v = this.MAX_POR_STAT; }
      saneado[k] = v;
    });
    let gastados = this.STATS_REPARTO.reduce((s, k) => s + saneado[k], 0);
    if (gastados > this.PUNTOS_TOTAL) {
      errores.push('No se pueden repartir más de ' + this.PUNTOS_TOTAL + ' puntos');
      for (let i = this.STATS_REPARTO.length - 1; i >= 0 && gastados > this.PUNTOS_TOTAL; i--) {
        const k = this.STATS_REPARTO[i]; const quita = Math.min(saneado[k], gastados - this.PUNTOS_TOTAL);
        saneado[k] -= quita; gastados -= quita;
      }
    }
    return { puntos: saneado, gastados, restantes: this.PUNTOS_TOTAL - gastados, valido: gastados <= this.PUNTOS_TOTAL, errores };
  },
  // Estadísticas resultantes de un reparto: combate = puntos + bono de
  // elemento + bono de atributo; Vida/Esencia = 100 + bono de elemento +
  // bono de atributo (NO llevan puntos). El combate se fija en mínimo 1:
  // con 0 puntos y bonos negativos (ej. Agua −1 Ataque + Tenaz −2) saldría
  // 0 o negativo, y una estadística de combate bajo 1 no tiene sentido.
  statsResultantes(elemento, atributo, puntos) {
    const perf = U.Estadisticas.porElemento[elemento] || {};
    const ini = U.Atributos.de(atributo).inicio || {};
    const stats = {};
    stats.vida = 100 + (perf.vida || 0) + (ini.vida || 0);
    stats.esencia = 100 + (perf.esencia || 0) + (ini.esencia || 0);
    this.STATS_REPARTO.forEach(k => { stats[k] = Math.max(1, (puntos[k] || 0) + (perf[k] || 0) + (ini[k] || 0)); });
    return stats;
  },
  // Crea el perfil de una vida por elección directa, con la misma forma que
  // U.TestUI.calcular(). Sin afinidad (xpElemento todo 0), sin puro, sin
  // bono +2 del test, sin segundo elemento.
  crearPerfil(elemento, atributo, estilo, puntos) {
    if (U.Elementos.ids.indexOf(elemento) < 0) throw new Error('Elección directa: elemento desconocido: ' + elemento);
    if (!U.Atributos.datos[atributo]) throw new Error('Elección directa: atributo desconocido: ' + atributo);
    if (estilo !== 'yin' && estilo !== 'yang') throw new Error('Elección directa: estilo desconocido: ' + estilo);
    const val = this.validarPuntos(puntos);
    if (!val.valido) throw new Error('Elección directa: reparto inválido: ' + val.errores.join('; '));
    const stats = this.statsResultantes(elemento, atributo, val.puntos);
    const GANA = (U.Elementos && U.Elementos.gana) || {};
    const metaDespertar = {}; U.Elementos.ids.forEach(e => { metaDespertar[e] = (GANA[e] || []).indexOf(elemento) >= 0 ? 300 : 150; });
    const maestria = { fuego: 0, agua: 0, tierra: 0, viento: 0, rayo: 0 }; maestria[elemento] = 1;
    const xpElemento = { fuego: 0, agua: 0, tierra: 0, viento: 0, rayo: 0 };
    const nivelStat = { vida: 1, esencia: 1, ataque: 1, defensa: 1, mente: 1, velocidad: 1 };
    const xpStat = { vida: 0, esencia: 0, ataque: 0, defensa: 0, mente: 0, velocidad: 0 };
    const hechiceroPotencial = atributo === 'sabio' || stats.mente >= 12;
    const sabores = (U.Economia && U.Economia.SABORES) ? U.Economia.SABORES.slice() : ['dulce', 'salado', 'picante', 'ácido', 'amargo'];
    return { elemento, elemento2: null, atributo, estilo, estiloNatural: estilo, yangAfin: estilo === 'yang', hechiceroPotencial, puro: false, bonoPuro: null, stats, nivelStat, xpStat, maestria, xpElemento, metaDespertar, estilos: { yin: 1, yang: 1 }, distr: null, scores: null, sabores, directo: true, puntosReparto: Object.assign({}, val.puntos), puntosSinGastar: val.restantes };
  },

  // ---------- UI (5 pasos dentro de #testContenido) ----------
  sel: null, semilla: '', perfil: null, avisoPuntos: false,
  comenzar() {
    U.Audio.init(); U.Audio.reanudar(); U.Audio.musica('test'); U.Audio.sfx('click');
    const inp = document.getElementById('inpSemilla'); if (inp) { const v = inp.value.trim().toUpperCase(); this.semilla = v || U.TestUI.semilla; }
    else this.semilla = U.TestUI.semilla;
    document.getElementById('semillaTxt').textContent = this.semilla;
    this.sel = { elemento: null, atributo: null, estilo: null, puntos: { ataque: 0, defensa: 0, mente: 0, velocidad: 0 } };
    this.perfil = null; this.avisoPuntos = false;
    U.TestUI.escena = null; document.getElementById('testProgreso').innerHTML = '';
    this.pasoElemento();
  },
  atras(texto) { return '<button class="mini" id="btnAtrasDirecta" style="font-size:12px;padding:8px 14px">' + texto + '</button>'; },
  ligarAtras(fn) { const b = document.getElementById('btnAtrasDirecta'); if (b) b.addEventListener('click', () => { U.Audio.sfx('click'); fn(); }); },
  fmtBonos(bonos) {
    const partes = [];
    Object.keys(bonos || {}).forEach(k => { const v = bonos[k]; if (v) partes.push((v > 0 ? '+' : '') + v + ' ' + U.Estadisticas.etiquetas[k]); });
    return partes.length ? partes.join(' · ') : 'sin bonos';
  },
  pasoElemento() {
    const c = document.getElementById('testContenido');
    let html = '<div class="pregunta"><span class="indice">ELECCIÓN DIRECTA · 1 DE 4 · ELEMENTO</span><h2>Elige tu elemento. Es PURO: solo este elemento, sin afinidad con los demás (los demás empiezan en 0 XP y 0%). Dominar UN elemento es el trabajo de una vida.</h2><div class="ops">';
    U.Elementos.ids.forEach((id, i) => {
      const E = U.Elementos.datos[id];
      html += '<button class="op" data-el="' + id + '" style="border-left:6px solid ' + E.color + '"><span class="num">' + (i + 1) + '</span><span><b style="color:' + E.color + '">' + E.nombre.toUpperCase() + '</b> · ' + E.temperamento + '<br><small style="color:var(--textoTenue)">' + E.personalidad + '</small><br><small style="color:var(--exito)">Bonos: ' + this.fmtBonos(U.Estadisticas.porElemento[id]) + '</small></span></button>';
    });
    html += '</div><div style="margin-top:10px">' + this.atras('← Volver al inicio') + '</div></div>';
    c.innerHTML = html;
    c.querySelectorAll('.op').forEach(b => b.addEventListener('click', () => { this.sel.elemento = b.dataset.el; U.Audio.sfx('click'); this.pasoAtributo(); }));
    this.ligarAtras(() => U.TestUI.intro());
  },
  pasoAtributo() {
    const c = document.getElementById('testContenido');
    let html = '<div class="pregunta"><span class="indice">ELECCIÓN DIRECTA · 2 DE 4 · ATRIBUTO</span><h2>Elige tu atributo. Es tu identidad fija: su bono de inicio SÍ se aplica, y su barra de XP también — sus favoritas suben de nivel con la mitad de XP y su penalizada más despacio.</h2><div class="ops">';
    Object.keys(U.Atributos.datos).forEach((id, i) => {
      const a = U.Atributos.datos[id];
      html += '<button class="op" data-at="' + id + '"><span class="num">' + (i + 1) + '</span><span><b>' + a.nombre.toUpperCase() + '</b><br><small style="color:var(--textoTenue)">' + a.desc + '</small><br><span style="color:var(--exito)">▲ ' + a.ventaja + '</span><br><span style="color:var(--aviso)">▼ ' + a.desventaja + '</span><br><small style="color:var(--exito)">Inicio: ' + this.fmtBonos(a.inicio) + '</small></span></button>';
    });
    html += '</div><div style="margin-top:10px">' + this.atras('← Atrás: elemento') + '</div></div>';
    c.innerHTML = html;
    c.querySelectorAll('.op').forEach(b => b.addEventListener('click', () => { this.sel.atributo = b.dataset.at; U.Audio.sfx('click'); this.pasoEstilo(); }));
    this.ligarAtras(() => this.pasoElemento());
  },
  pasoEstilo() {
    const c = document.getElementById('testContenido');
    const html = '<div class="pregunta"><span class="indice">ELECCIÓN DIRECTA · 3 DE 4 · ESTILO NATURAL</span><h2>Elige tu estilo natural. Yin y Yang ya están despiertos en ti desde que naces (nivel 1 los dos): lo que falta es controlarlos. Tu estilo natural crece ×1.5 más rápido, porque es tu talento natural.</h2><div class="ops">'
      + '<button class="op" data-es="yin"><span class="num">1</span><span><b>YIN</b> · el cuerpo primero<br><small style="color:var(--textoTenue)">De cerca, barato, universal. Golpes, puño y cuerpo a cuerpo. Entrena tu recuperación de Esencia al golpear.</small></span></button>'
      + '<button class="op" data-es="yang"><span class="num">2</span><span><b>YANG</b> · energía blanca a distancia<br><small style="color:var(--textoTenue)">Energía pura lanzada con las manos (esfera, onda, haz). Cara, deliberada, a distancia. Sin color de elemento: blanca.</small></span></button>'
      + '</div><div style="margin-top:10px">' + this.atras('← Atrás: atributo') + '</div></div>';
    c.innerHTML = html;
    c.querySelectorAll('.op').forEach(b => b.addEventListener('click', () => { this.sel.estilo = b.dataset.es; U.Audio.sfx('click'); this.pasoReparto(); }));
    this.ligarAtras(() => this.pasoAtributo());
  },
  pasoReparto() {
    const c = document.getElementById('testContenido');
    const sel = this.sel; const val = this.validarPuntos(sel.puntos);
    const res = this.statsResultantes(sel.elemento, sel.atributo, val.puntos);
    const E = U.Elementos.datos[sel.elemento], a = U.Atributos.de(sel.atributo);
    let html = '<div class="pregunta"><span class="indice">ELECCIÓN DIRECTA · 4 DE 4 · TUS ESTADÍSTICAS</span><h2>Reparte 40 puntos entre tus 4 estadísticas. Cada una empieza en 0 y el MÁXIMO es 10 por estadística. Puedes dejar puntos sin gastar si quieres una estadística baja — pero nunca más de 10 en una sola.</h2>'
      + '<p class="nota" style="margin-bottom:8px">' + E.nombre + ' (' + this.fmtBonos(U.Estadisticas.porElemento[sel.elemento]) + ') · ' + a.nombre + ' (' + this.fmtBonos(a.inicio) + ') · Estilo natural: ' + sel.estilo.toUpperCase() + ' (×1.5)</p>'
      + '<p style="font-size:14px;margin:0 0 10px">Puntos restantes: <b id="puntosRestantes" style="color:' + (val.restantes > 0 ? 'var(--rayo)' : 'var(--exito)') + '">' + val.restantes + '</b> de 40 · gastados: ' + val.gastados + '</p><div class="ops">';
    this.STATS_REPARTO.forEach(k => {
      const perf = (U.Estadisticas.porElemento[sel.elemento] || {})[k] || 0;
      const ini = (a.inicio || {})[k] || 0;
      const bono = (perf > 0 ? '+' + perf : String(perf)) + ' elemento ' + (ini >= 0 ? '+' + ini : String(ini)) + ' atributo';
      html += '<div class="op" style="cursor:default"><span style="flex:1"><b>' + this.ETIQUETAS_REPARTO[k] + '</b> <small style="color:var(--textoTenue)">(' + bono + ')</small><br><span style="font-size:15px">Puntos: <b>' + val.puntos[k] + '</b> → resultante: <b style="color:var(--exito)">' + res[k] + '</b></span></span>'
        + '<button class="mini btnMenos" data-k="' + k + '" style="font-size:18px;padding:6px 12px"' + (val.puntos[k] <= 0 ? ' disabled' : '') + '>−</button>'
        + '<button class="mini btnMas" data-k="' + k + '" style="font-size:18px;padding:6px 12px"' + (val.puntos[k] >= this.MAX_POR_STAT || val.restantes <= 0 ? ' disabled' : '') + '>+</button></div>';
    });
    html += '</div><div class="tarjeta" style="margin-top:10px"><h3>Vida y Esencia · fijas</h3><div class="statsGrid">'
      + '<div class="statFila"><span>Vida</span><div class="bar"><i style="transform:scaleX(' + (res.vida / 130) + ')"></i></div><span class="val">' + res.vida + '</span></div>'
      + '<div class="statFila"><span>Esencia</span><div class="bar"><i style="transform:scaleX(' + (res.esencia / 130) + ')"></i></div><span class="val">' + res.esencia + '</span></div></div>'
      + '<p style="margin:8px 0 0;color:var(--textoFrio)">Base adulto 100 + bonos de ' + E.nombre + ' y de ' + a.nombre + '. No se reparten puntos aquí. Cada estadística empieza en NIVEL 1: cada acción da XP y al llenar la barra sube de nivel (Vida y Esencia +5, el resto +1). Tu atributo acorta la barra de sus favoritas a la mitad y alarga la de su penalizada.</p></div>'
      + '<div id="avisoPuntos" style="margin-top:10px">' + (this.avisoPuntos && val.restantes > 0 ? '<p class="avisoDesempate" style="font-size:13px">⚠ Te quedan ' + val.restantes + ' puntos sin gastar. Si es un error, repártelos arriba; si de verdad quieres una estadística baja, pulsa confirmar otra vez para empezar así.</p>' : '') + '</div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center">' + this.atras('← Atrás: estilo') + '<button class="grande" id="btnConfirmarDirecta" style="font-size:13px;padding:10px 16px">Confirmar y ver mi vida</button></div></div>';
    c.innerHTML = html;
    c.querySelectorAll('.btnMas').forEach(b => b.addEventListener('click', () => { const k = b.dataset.k; if (sel.puntos[k] < this.MAX_POR_STAT && this.validarPuntos(sel.puntos).restantes > 0) { sel.puntos[k]++; this.avisoPuntos = false; U.Audio.sfx('click'); this.pasoReparto(); } }));
    c.querySelectorAll('.btnMenos').forEach(b => b.addEventListener('click', () => { const k = b.dataset.k; if (sel.puntos[k] > 0) { sel.puntos[k]--; this.avisoPuntos = false; U.Audio.sfx('click'); this.pasoReparto(); } }));
    this.ligarAtras(() => this.pasoEstilo());
    document.getElementById('btnConfirmarDirecta').addEventListener('click', () => {
      const v2 = this.validarPuntos(sel.puntos);
      if (v2.restantes > 0 && !this.avisoPuntos) { this.avisoPuntos = true; U.Audio.sfx('click'); this.pasoReparto(); return; }
      U.Audio.sfx('unlock');
      this.perfil = this.crearPerfil(sel.elemento, sel.atributo, sel.estilo, sel.puntos);
      this.pasoNombre();
    });
  },
  pasoNombre() {
    const c = document.getElementById('testContenido');
    const p = this.perfil; const E = U.Elementos.datos[p.elemento], a = U.Atributos.de(p.atributo);
    const nombres = { fuego: ['Brann', 'Kira', 'Doran'], agua: ['Nima', 'Aren', 'Selia'], tierra: ['Toruk', 'Mara', 'Oren'], viento: ['Lira', 'Sael', 'Nim'], rayo: ['Vek', 'Zuri', 'Ilan'] }[p.elemento];
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    let html = '<div class="reveal"><div class="revealCab"><div><h2 style="color:' + E.color + '">TU VIDA · ' + E.nombre.toUpperCase() + ' · ' + a.nombre.toUpperCase() + ' · ' + p.estiloNatural.toUpperCase() + '</h2><p>' + E.personalidad + ' Elegiste todo tú: sin test, sin bono +2 del test, sin afinidad. Lo que elegiste es lo que eres.</p></div></div>';
    html += '<div class="tarjeta"><h3>Estadísticas iniciales · nivel 1</h3><div class="statsGrid">' + Object.keys(p.stats).map(k => '<div class="statFila"><span>' + U.Estadisticas.etiquetas[k] + '</span><div class="bar"><i style="transform:scaleX(' + (p.stats[k] / ((k === 'vida' || k === 'esencia') ? 130 : 16)) + ')"></i></div><span class="val">' + p.stats[k] + '</span></div>').join('') + '</div>'
      + '<p style="margin:8px 0 0;color:var(--textoFrio)">Reparto: ' + this.STATS_REPARTO.map(k => this.ETIQUETAS_REPARTO[k] + ' ' + p.puntosReparto[k]).join(' · ') + (p.puntosSinGastar > 0 ? ' · ' + p.puntosSinGastar + ' puntos sin gastar (tu decisión).' : ' · 40/40 gastados.') + ' Maestría de ' + E.nombre + ': 1%. Los demás elementos: 0 XP, 0% (sin afinidad). Yin y Yang despiertos en nivel 1; tu estilo natural (' + p.estiloNatural.toUpperCase() + ') crece ×1.5 más rápido.</p></div>';
    html += '<div class="nombreFila"><input id="inpNombre" maxlength="12" value="' + nombre + '" placeholder="Nombre de esta vida"><button class="mini" id="btnDadoNombre">DADO</button><button class="grande" id="btnNacer" style="font-size:13px;padding:10px 16px">Comenzar esta vida</button></div></div>';
    c.innerHTML = html;
    document.getElementById('btnDadoNombre').addEventListener('click', () => { document.getElementById('inpNombre').value = nombres[Math.floor(Math.random() * nombres.length)]; U.Audio.sfx('click'); });
    document.getElementById('btnNacer').addEventListener('click', () => this.nacer());
    document.getElementById('inpNombre').addEventListener('keydown', e => { if (e.key === 'Enter') this.nacer(); e.stopPropagation(); });
  },
  nacer() {
    const n = document.getElementById('inpNombre').value.trim() || 'Sin nombre';
    U.TestUI.activo = false; U.TestUI.escena = null;
    document.getElementById('test').classList.add('oculto');
    U.Juego.comenzarMundo(this.perfil, this.semilla, n);
  }
};
