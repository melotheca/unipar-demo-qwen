/* === js/ui/test-ui.js === */
/* Unipar — test inicial: 20 preguntas al azar del banco (10 de elemento y 10 de estadísticas, mezcladas con Fisher-Yates, opciones también barajadas) + ranking de platillos por arrastre, desempate, revelación y nombre. */
window.U = window.U || {};

U.TestUI = {
  activo: true, pasos: [], idx: 0, scores: null, usadas: [], escena: null, t: 0, logoT: 0, semilla: '', escenaLista: false,
  init() { this.semilla = this.nuevaSemilla(); document.getElementById('semillaTxt').textContent = this.semilla; this.intro(); },
  nuevaSemilla() { const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]; return s; },
  rngSemilla(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return U.Render.mulberry(h >>> 0); },
  // Mezcla Fisher-Yates de verdad (sin sesgo): devuelve una copia barajada.
  barajar(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; },
  comenzar() {
    U.Audio.init(); U.Audio.reanudar(); U.Audio.musica('test'); U.Audio.sfx('click'); this.saboresListo = false; this.ordenSabores = [];
    this.scores = { p: { fuego: 0, agua: 0, tierra: 0, viento: 0, rayo: 0 }, s: {}, a: {}, e: { yin: 0, yang: 0 } }; this.usadas = [];
    // 20 preguntas: 10 al azar de k='elemento' y 10 al azar de k='stats', mezcladas
    // (Fisher-Yates). El usuario no sabe cuál es cuál: todas se ven iguales.
    const banco = U.TestBanco.preguntas;
    const deElem = banco.filter(q => q.k === 'elemento');
    const deStats = banco.filter(q => q.k === 'stats');
    let elegidas, resto;
    if (deElem.length >= 10 && deStats.length >= 10) {
      const e = this.barajar(deElem).slice(0, 10);
      const s = this.barajar(deStats).slice(0, 10);
      elegidas = this.barajar(e.concat(s));
      const usados = new Set(elegidas);
      resto = this.barajar(banco.filter(q => !usados.has(q)));
    } else {
      // Banco anterior (sin campo k): 20 al azar de todo el banco.
      const bar = this.barajar(banco);
      elegidas = bar.slice(0, 20); resto = bar.slice(20);
    }
    this.usadas = elegidas.slice(); this.resto = resto;
    this.pasos = elegidas.map(q => ({ tipo: 'pregunta', q }));
    this.idx = 0; this.paso();
  },
  sumar(o) { const S = this.scores; if (o.p) for (const k in o.p) S.p[k] += o.p[k]; if (o.s) for (const k in o.s) S.s[k] = (S.s[k] || 0) + o.s[k]; if (o.a) for (const k in o.a) S.a[k] = (S.a[k] || 0) + o.a[k]; if (o.e) for (const k in o.e) S.e[k] += o.e[k]; },
  progreso(extra) { const c = document.getElementById('testProgreso'); c.innerHTML = ''; const total = Math.max(this.pasos.length, this.idx + 1); for (let i = 0; i < total; i++) { const d = document.createElement('i'); d.className = i < this.idx ? 'hecho' : i === this.idx ? 'actual' : ''; c.appendChild(d); } if (extra) { const p = document.createElement('span'); p.style.cssText = 'font-size:11px;color:var(--aviso);margin-left:8px'; p.textContent = extra; c.appendChild(p); } },
  intro() {
    const c = document.getElementById('testContenido'); document.getElementById('testProgreso').innerHTML = '';
    const auto = (window.U && U.Guardado) ? U.Guardado.leerAuto() : null;
    const escHtml = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const bloqueAuto = auto ? '<div class="introInfo" style="border-color:var(--exito)"><b style="color:var(--exito)">● Guardado automático: tienes una partida en curso.</b><br>' + escHtml(auto.nombre || 'Sin nombre') + ' · ' + U.Elementos.nombre(auto.perfil.elemento) + ' · guardada el ' + U.Guardado.fechaTexto(auto.guardadoEn) + '. Tu partida se guarda sola en este navegador: entra y sigues donde ibas, sin descargar ni subir ningún archivo.</div><button class="grande" id="btnContinuarAuto" style="background:linear-gradient(180deg,#2f7d4f,#1d5233);border-color:#a7f3c9;box-shadow:0 5px 0 var(--sombra),0 0 22px rgba(103,224,138,.4)">Continuar partida</button>' : '';
    c.innerHTML = '<div class="intro"><canvas id="logoCanvas" width="360" height="110"></canvas><p class="sub">Una vida. Un elemento. Universos paralelos.</p>' + bloqueAuto + '<div class="introInfo"><b>Antes de nacer en este mundo:</b> 20 preguntas — 10 que revelan tu elemento y 10 que revelan tus estadísticas — mezcladas y distintas en cada vida: el azar elige cuáles salen y en qué orden, y las opciones también cambian de lugar. Responde con instinto: no hay respuestas correctas y nadie te dirá qué busca cada opción. El test decide tu elemento, tu atributo, tus estadísticas iniciales y tu inclinación de estilo. Una prueba por vida.<br><br><b>Recuerda:</b> dominar UN elemento es el trabajo de una vida. Concéntrate en él. Yin y Yang ya están despiertos en ti desde que naces (nivel 1): lo que falta es controlarlos. Se entrenan con el uso — Yin golpeando de cerca, Yang lanzando elementos — y las técnicas se aprenden de un Guía, que te pedirá cierto nivel de Yin o de Yang.</div><div class="semillaFila">Semilla del mundo <input id="inpSemilla" maxlength="8" value="' + this.semilla + '"><button class="mini" id="btnDado">DADO</button></div><button class="grande" id="btnComenzarTest">' + (auto ? 'Nueva vida (repetir test)' : 'Comenzar el test') + '</button><button class="mini" id="btnCargarIntro" style="font-size:12px;padding:8px 14px">CARGAR DESDE ARCHIVO (RESPALDO)</button><p class="nota">100% offline · móvil (touch) y escritorio · juego completo: 1 continente continuo gigante rodeado de mar (la Metrópolis en el centro, 5 aldeas elementales en radial, la ciudad de los magos, 6 pueblos pequeños con casas para rentar, bosque, desierto, montaña de nieve) + interiores, calendario semanal, clima, casa con cama y alarma, retos y hechizo de inversión<br>Guardado automático activado: tu progreso se guarda solo en este navegador. Si quieres un respaldo para otro teléfono, en Opciones (⚙) tienes DESCARGAR PARTIDA.</p></div>';
    document.getElementById('btnComenzarTest').addEventListener('click', () => { const v = document.getElementById('inpSemilla').value.trim().toUpperCase(); this.semilla = v || this.nuevaSemilla(); document.getElementById('semillaTxt').textContent = this.semilla; this.comenzar(); });
    const bCA = document.getElementById('btnContinuarAuto'); if (bCA) bCA.addEventListener('click', () => { U.Audio.init(); U.Audio.reanudar(); U.Guardado.cargarAuto(); });
    const bcI = document.getElementById('btnCargarIntro'); if (bcI) bcI.addEventListener('click', () => { U.Audio.init(); U.Audio.reanudar(); U.Guardado.elegirArchivo(); });
    document.getElementById('btnDado').addEventListener('click', () => { this.semilla = this.nuevaSemilla(); document.getElementById('inpSemilla').value = this.semilla; document.getElementById('semillaTxt').textContent = this.semilla; U.Audio.init(); U.Audio.sfx('click'); });
    document.getElementById('inpSemilla').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });
    this.escena = { tipo: 'logo' };
  },
  paso() {
    this.escenaLista = false; const p = this.pasos[this.idx]; if (!p) { if (!this.saboresListo) { this.sabores(); return; } this.reveal(); return; }
    if (p.tipo === 'pregunta') this.pregunta(p.q, p.extra);
  },
  siguiente() { this.idx++; setTimeout(() => this.paso(), 350); },
  pregunta(q, extra) {
    this.progreso(extra ? 'Empate: una pregunta más.' : ''); this.escena = null; const c = document.getElementById('testContenido'); const numPregunta = this.pasos.slice(0, this.idx + 1).filter(x => x.tipo === 'pregunta').length;
    // Las opciones TAMBIÉN se barajan (Fisher-Yates) en cada pregunta y cada partida: la opción 1 ya no es siempre Fuego.
    const ops = this.barajar(q.ops);
    let html = '<div class="pregunta">' + (extra ? '<p class="avisoDesempate">Aún hay empate. Responde una más, con instinto.</p>' : '') + '<span class="indice">PREGUNTA ' + numPregunta + '</span><h2>' + q.t + '</h2><div class="ops">';
    ops.forEach((o, i) => { html += '<button class="op" data-i="' + i + '"><span class="num">' + (i + 1) + '</span><span>' + o.t + '</span></button>'; }); html += '</div></div>'; c.innerHTML = html;
    c.querySelectorAll('.op').forEach(b => b.addEventListener('click', () => { if (this.escenaLista) return; this.escenaLista = true; b.classList.add('elegida'); U.Audio.sfx('click'); this.sumar(ops[parseInt(b.dataset.i)]); this.siguiente(); }));
    this.preguntaActual = q;
  },
  // SABORES: no eliges uno: los ORDENAS del que más te gusta al que menos, arrastrando
  // los platillos. Cada platillo representa su sabor: el ranking que queda fijo es el
  // orden de SABORES (mismo contrato que antes: calcular() hace perfil.sabores desde
  // ordenSabores y el resto del juego consume sabores como nombres de sabor).
  sabores() {
    this.progreso('Sabores: ordénalos por gusto'); this.escena = null;
    const c = document.getElementById('testContenido');
    // Una variedad al azar por sabor, del catálogo del banco; orden inicial al azar.
    const P = (U.TestBanco && U.TestBanco.platillos) || null;
    const variedad = sb => { const lista = P && P[sb]; if (lista && lista.length) return lista[Math.floor(Math.random() * lista.length)]; return 'Comida ' + sb; };
    this.platillosOrden = this.barajar(U.Economia.SABORES.map(sb => ({ sabor: sb, nombre: variedad(sb) })));
    const guardar = () => { this.ordenSabores = this.platillosOrden.map(x => x.sabor); };
    guardar();
    const pintar = () => {
      let html = '<div class="pregunta"><span class="indice">ANTES DE NACER · TUS SABORES</span><h2>Ordena estos platillos del que MÁS te gusta al que MENOS. Arrastra cada uno hacia arriba o hacia abajo, o usa las flechas ↑ ↓. Puedes corregir arrastrando de vuelta. Cuando el orden te guste, confirma: este ranking queda fijo en tu vida y decide cuánto te sube cada comida.</h2>';
      html += '<p class="nota" style="margin-top:0">Tu favorito te subirá +10% de Vida y +15% de Esencia al comerlo; el 2º, +5% y +10%; el 3º, +5% de Esencia; el 4º, +3%; el 5º no sube nada, solo te llena.</p><div id="listaPlatillos" style="touch-action:none">';
      this.platillosOrden.forEach((pl, i) => {
        html += '<div class="filaPlatillo" data-idx="' + i + '" data-sabor="' + pl.sabor + '" style="display:flex;align-items:center;gap:8px;padding:10px 8px;margin-bottom:6px;border:1px solid rgba(255,255,255,.18);border-radius:10px;background:rgba(255,255,255,.05);touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab"><span style="font-size:18px;color:var(--textoTenue)">☰</span><span style="min-width:24px;font-weight:bold;color:var(--exito)">' + (i + 1) + 'º</span><span style="flex:1"><b>' + pl.nombre + '</b><br><small style="color:var(--textoTenue)">Sabor ' + pl.sabor + '</small></span><button class="mini btnSubir" data-idx="' + i + '" style="font-size:16px;padding:6px 10px"' + (i === 0 ? ' disabled' : '') + '>↑</button><button class="mini btnBajar" data-idx="' + i + '" style="font-size:16px;padding:6px 10px"' + (i === this.platillosOrden.length - 1 ? ' disabled' : '') + '>↓</button></div>';
      });
      html += '</div><button class="grande" id="btnConfirmarSabores" style="margin-top:8px">Confirmar mi ranking</button></div>';
      c.innerHTML = html;
      // Arrastre con pointer events (touch y ratón): la pantalla no se mueve porque
      // las filas tienen touch-action:none y el puntero se captura en la fila.
      c.querySelectorAll('.filaPlatillo').forEach(fila => {
        fila.addEventListener('pointerdown', e => {
          if (e.target.closest('button')) return; // las flechas son botones, no arrastre
          e.preventDefault();
          const inicioY = e.clientY, idxIni = parseInt(fila.dataset.idx);
          const alto = fila.offsetHeight + 6; // altura de fila + margen
          fila.setPointerCapture(e.pointerId);
          fila.style.cursor = 'grabbing'; fila.style.position = 'relative'; fila.style.zIndex = '5';
          const mover = ev => { fila.style.transform = 'translateY(' + (ev.clientY - inicioY) + 'px)'; };
          const soltar = ev => {
            fila.removeEventListener('pointermove', mover); fila.removeEventListener('pointerup', soltar); fila.removeEventListener('pointercancel', soltar);
            const salto = Math.round((ev.clientY - inicioY) / alto);
            fila.style.transform = ''; fila.style.cursor = ''; fila.style.zIndex = '';
            const idxFin = Math.max(0, Math.min(this.platillosOrden.length - 1, idxIni + salto));
            if (salto !== 0 && idxFin !== idxIni) { const it = this.platillosOrden.splice(idxIni, 1)[0]; this.platillosOrden.splice(idxFin, 0, it); guardar(); U.Audio.sfx('click'); pintar(); }
          };
          fila.addEventListener('pointermove', mover); fila.addEventListener('pointerup', soltar); fila.addEventListener('pointercancel', soltar);
        });
      });
      // Respaldo: flechas ↑/↓ en cada fila.
      c.querySelectorAll('.btnSubir').forEach(b => b.addEventListener('click', () => { const i = parseInt(b.dataset.idx); if (i <= 0) return; const t = this.platillosOrden[i - 1]; this.platillosOrden[i - 1] = this.platillosOrden[i]; this.platillosOrden[i] = t; guardar(); U.Audio.sfx('click'); pintar(); }));
      c.querySelectorAll('.btnBajar').forEach(b => b.addEventListener('click', () => { const i = parseInt(b.dataset.idx); if (i >= this.platillosOrden.length - 1) return; const t = this.platillosOrden[i + 1]; this.platillosOrden[i + 1] = this.platillosOrden[i]; this.platillosOrden[i] = t; guardar(); U.Audio.sfx('click'); pintar(); }));
      document.getElementById('btnConfirmarSabores').addEventListener('click', () => { guardar(); this.saboresListo = true; if (this.perfil) this.perfil.sabores = this.ordenSabores.slice(); U.Audio.sfx('unlock'); setTimeout(() => this.reveal(), 600); });
    };
    pintar();
  },
  tecla(num) { if (!this.activo) return; const c = document.getElementById('testContenido'); const ops = c.querySelectorAll('.op'); if (ops.length && num >= 1 && num <= ops.length) ops[num - 1].click(); },
  calcular() {
    const S = this.scores; const ord = U.Elementos.ids.slice().sort((a, b) => S.p[b] - S.p[a]); const top = ord[0], second = ord[1];
    if (S.p[top] === S.p[second]) return null; // empate → pregunta extra
    const total = U.Elementos.ids.reduce((s, k) => s + S.p[k], 0) || 1; const share = S.p[top] / total;
    let atributo = Object.keys(S.a).sort((a, b) => S.a[b] - S.a[a])[0] || U.Atributos.porDefecto[top]; if (!U.Atributos.datos[atributo]) atributo = U.Atributos.porDefecto[top];
    const estilo = S.e.yang > S.e.yin ? 'yang' : 'yin'; const lean = Math.abs(S.e.yang - S.e.yin);
    // Reparto antiguo de 20 puntos (distr): hoy solo decide si hay segundo
    // elemento (elem2); ya no pone niveles de Yin/Yang ni se muestra.
    let distr, elem2 = null;
    if (S.p[second] >= S.p[top] * 0.8 && share < 0.42) { distr = { [top]: 10, [second]: 5, yin: 5 }; elem2 = second; }
    else if (lean >= 3) { distr = { [top]: 15, yin: estilo === 'yin' ? 5 : 0, yang: estilo === 'yang' ? 5 : 0 }; }
    else { distr = { [top]: 20, yin: 0, yang: 0 }; }
    // ELEMENTO PURO: ningún elemento no-principal recibió puntos (tocados vacío,
    // es decir, 10/10 en el principal). El nivel se queda en 1 para todos — el
    // puro NO empieza en nivel 2 — pero su bono PRINCIPAL de estadística sube
    // 50% (redondeado hacia arriba): solo el bono principal, los secundarios
    // quedan igual. Fuego ataque +2→+3, Agua vida +10→+15, Tierra vida +10→+15,
    // Viento velocidad +3→+5, Rayo velocidad +3→+5.
    const tocados = U.Elementos.ids.filter(e => e !== top && (S.p[e] || 0) > 0);
    const puro = tocados.length === 0;
    const PRIMARIO = { fuego: 'ataque', agua: 'vida', tierra: 'vida', viento: 'velocidad', rayo: 'velocidad' };
    const primario = PRIMARIO[top];
    const perf = Object.assign({}, U.Estadisticas.porElemento[top]);
    let bonoPuro = null;
    if (puro) { const basePuro = perf[primario] || 0; const conPuro = Math.ceil(basePuro * 1.5); perf[primario] = conPuro; bonoPuro = { stat: primario, base: basePuro, puro: conPuro }; }
    const stats = {}; const ini = U.Atributos.de(atributo).inicio;
    for (const k in U.Estadisticas.base) { let v = U.Estadisticas.base[k] + (perf[k] || 0) + (S.s[k] || 0) * 1.2 + (ini[k] || 0); stats[k] = U.Estadisticas.clampTest(k, v); }
    // MAESTRÍA INICIAL DE PRINCIPIANTE (nivel 1): la MAESTRÍA con la que naces
    // es 1% en tu elemento principal — nivel 1 — y 0 en los demás. (distr era el
    // reparto antiguo de 20 puntos; ya no pone niveles de Yin/Yang ni se muestra.)
    // Tu ataque básico ya es tuyo desde nivel 1 (alcance 1 celda); lo demás se
    // gana entrenando en esta vida. El principal empieza en 0 XP hacia el nivel 2.
    const maestria = { fuego: 0, agua: 0, tierra: 0, viento: 0, rayo: 0 }; maestria[top] = 1;
    // META PARA DESPERTAR (nivel 0→1): 150 XP para un elemento normal, 300 XP
    // para los 2 OPUESTOS — los 2 elementos que le ganan a tu principal en la
    // tabla (U.Elementos.gana). El costo extra es SOLO al despertar: una vez
    // despierto, la maestría sube normal, sin penalización.
    const GANA = (U.Elementos && U.Elementos.gana) || { fuego: ['viento', 'rayo'], agua: ['fuego', 'tierra'], tierra: ['fuego', 'rayo'], viento: ['tierra', 'agua'], rayo: ['agua', 'viento'] };
    const metaDespertar = {}; U.Elementos.ids.forEach(e => { metaDespertar[e] = (GANA[e] || []).indexOf(top) >= 0 ? 300 : 150; });
    // AFINIDAD (como tu ADN): el pool es el 50% de la barra de cada elemento,
    // repartido en partes IGUALES entre todos los elementos NO-principales que
    // recibieron al menos 1 punto en el test (S.p). El principal no entra en
    // el reparto (ya es nivel 1) y los que no recibieron puntos quedan en 0%.
    // 1 tocado → 50%; 2 → 25% c/u; 3 → 16.7% c/u; 4 → 12.5% c/u. El % es de
    // la barra PROPIA de cada elemento, así que en XP absolutos el opuesto
    // lleva más (25% de 300 = 75 XP) que un normal (25% de 150 = 37.5 XP),
    // pero el opuesto sigue costando más en total (300 frente a 150).
    const xpElemento = { fuego: 0, agua: 0, tierra: 0, viento: 0, rayo: 0 };
    if (tocados.length) { const pct = 50 / tocados.length; tocados.forEach(e => { xpElemento[e] = pct * metaDespertar[e] / 100; }); }
    // YIN Y YANG DESPIERTOS DESDE EL NACIMIENTO: el test ya no despierta nada.
    // Ambos estilos nacen despiertos en nivel 1; lo que falta es CONTROLARLOS
    // (aprender técnicas con un Guía, que pide cierto nivel). Nivel ≠ control.
    // La inclinación del test (estilo) es tu ESTILO NATURAL: crece ×1.5 más
    // rápido (ver U.Crecimiento.estilo). yangAfin se conserva por compatibilidad
    // (HUD y guardado lo leen): es true cuando el estilo natural es yang.
    const yangAfin = estilo === 'yang';
    // POTENCIAL DE HECHICERO (Arte Místico / Mente): el test lo revela si tu Mente
    // nace alta o tu atributo es Sabio. Sin revelación NO está cerrado: puedes
    // convertirte en hechicero entrenándote con los hechiceros (camino de una vida).
    const hechiceroPotencial = atributo === 'sabio' || stats.mente >= 12;
    const estilosFin = { yin: 1, yang: 1 };
    return { elemento: top, elemento2: elem2, atributo, estilo, estiloNatural: estilo, yangAfin, hechiceroPotencial, puro, bonoPuro, stats, maestria, xpElemento, metaDespertar, estilos: estilosFin, distr, scores: S, sabores: (U.TestUI.ordenSabores && U.TestUI.ordenSabores.length === 5) ? U.TestUI.ordenSabores.slice() : U.Economia.SABORES.slice() };
  },
  reveal() {
    let perfil = this.calcular();
    if (!perfil) { if (this.resto.length) { const q = this.resto.shift(); this.usadas.push(q); this.pasos.push({ tipo: 'pregunta', q, extra: true }); this.idx = this.pasos.length - 1; this.pregunta(q, true); return; } const ord0 = U.Elementos.ids.slice().sort((a, b) => this.scores.p[b] - this.scores.p[a]); this.scores.p[ord0[0]] += 0.5; perfil = this.calcular(); }
    this.perfil = perfil; this.escena = { tipo: 'reveal', t: 0 }; document.getElementById('testProgreso').innerHTML = ''; const E = U.Elementos.datos[perfil.elemento], a = U.Atributos.de(perfil.atributo);
    const nombres = { fuego: ['Brann', 'Kira', 'Doran'], agua: ['Nima', 'Aren', 'Selia'], tierra: ['Toruk', 'Mara', 'Oren'], viento: ['Lira', 'Sael', 'Nim'], rayo: ['Vek', 'Zuri', 'Ilan'] }[perfil.elemento]; const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    let html = '<div class="reveal"><div class="revealCab"><canvas id="cvSimbolo" width="88" height="88" style="color:' + E.color + '"></canvas><div><h2 style="color:' + E.color + '">TU ELEMENTO ES ' + E.nombre.toUpperCase() + '</h2><p>' + E.personalidad + '</p></div></div>';
    html += '<div class="tarjetas"><div class="tarjeta"><h3>Atributo · ' + a.nombre + '</h3><div class="ventaja">▲ ' + a.ventaja + '</div><div class="desventaja">▼ ' + a.desventaja + '</div><p style="margin:6px 0 0;color:var(--textoFrio)">' + a.desc + '</p></div><div class="tarjeta"><h3>Inclinación de estilo · ' + perfil.estiloNatural.toUpperCase() + '</h3><p style="margin:0;color:var(--textoFrio)">Yin y Yang ya están despiertos en ti desde que naces (nivel 1): lo que falta es controlarlos. Tu estilo natural es ' + perfil.estiloNatural.toUpperCase() + ': crece ×1.5 más rápido que el otro, porque es tu talento natural. ' + (perfil.estiloNatural === 'yin' ? 'Yin: el cuerpo primero. Cerca, barato, universal.' : 'Yang: energía blanca a distancia. Cara, deliberada, y entrena tu recuperación de Esencia.') + '</p></div></div>';
    html += '<div class="tarjeta"><h3>Estadísticas iniciales</h3><div class="statsGrid">' + Object.keys(perfil.stats).map(k => '<div class="statFila"><span>' + U.Estadisticas.etiquetas[k] + '</span><div class="bar"><i style="transform:scaleX(' + (perfil.stats[k] / ((k === 'vida' || k === 'esencia') ? 130 : 14)) + ')"></i></div><span class="val">' + perfil.stats[k] + '</span></div>').join('') + '</div>' + (perfil.puro && perfil.bonoPuro ? '<p style="margin:8px 0 0;color:var(--exito)">100% concentrado en ' + E.nombre.toUpperCase() + ': tu bono principal sube 50% (' + U.Estadisticas.etiquetas[perfil.bonoPuro.stat] + ' +' + perfil.bonoPuro.puro + ' en vez de +' + perfil.bonoPuro.base + ')</p>' : '') + '</div>';
    const m = perfil.maestria[perfil.elemento]; const h1 = U.Habilidades.elementos[perfil.elemento][0];
    html += '<div class="tarjeta"><h3>Maestría de ' + E.nombre + ' · ' + m + '% · ' + U.Elementos.etapa(m) + '</h3><div class="maestriaReveal"><i style="transform:scaleX(' + m / 100 + ');background:linear-gradient(90deg,' + E.color + ',' + E.claro + ')"></i><b style="left:15%"></b><b style="left:40%"></b><b style="left:70%"></b></div><p style="margin:6px 0 0;font-size:11px;color:var(--textoFrio)">Tu ataque básico, ' + h1.nombre + ', ya es tuyo desde nivel 1 (botón 1 del equipo, alcance 1 celda). Las demás técnicas son POCAS y se aprenden de un GUÍA por tarea (no por porcentaje): 15 / 40 / 70% es la maestría MÍNIMA para poder aprender cada una. La maestría sube con curva multiplicativa — lenta desde el principio y cada tramo cuesta más que el anterior: ' + U.Habilidades.elementos[perfil.elemento].map(h => h.nombre).join(' · ') + '. Aún sin la maestría mínima de la siguiente técnica: canaliza con golpes Yin hasta el 15%.</p></div>';
    // AFINIDAD (como tu ADN): el 50% de cada barra se reparte en partes iguales
    // entre los elementos que tocaste con tus respuestas; el que no tocaste
    // queda en 0%. El % es de la barra propia de cada elemento.
    const fmt1 = v => { const r = Math.round(v * 10) / 10; return (r % 1 === 0) ? String(r) : r.toFixed(1); };
    const opuestos = U.Elementos.ids.filter(e => e !== perfil.elemento && (perfil.metaDespertar[e] || 150) >= 300);
    const filasAfin = U.Elementos.ids.filter(e => e !== perfil.elemento).map(e => { const xp = perfil.xpElemento[e] || 0; const meta = perfil.metaDespertar[e] || 150; const pct = meta ? xp / meta * 100 : 0; const esOp = meta >= 300; return '<div class="statFila"><span>' + U.Elementos.nombre(e) + (esOp ? ' · contrario' : '') + '</span><div class="bar"><i style="transform:scaleX(' + (pct / 100) + ');background:linear-gradient(90deg,' + U.Elementos.datos[e].color + ',' + U.Elementos.datos[e].claro + ')"></i></div><span class="val">' + fmt1(pct) + '% · ' + fmt1(xp) + '/' + meta + ' XP</span></div>'; }).join('');
    html += '<div class="tarjeta"><h3>Tu afinidad · como tu ADN</h3><p style="margin:0 0 6px;color:var(--textoFrio)">El test es tu ADN: el 50% de cada barra se reparte en partes iguales entre los elementos que tocaste con tus respuestas. El que no tocaste queda en 0%. Tus dos contrarios (' + opuestos.map(e => U.Elementos.nombre(e)).join(' y ') + ') cuestan el doble despertar: 300 XP en vez de 150. El costo extra es solo al despertar: una vez despierto, la maestría sube como cualquier otro elemento.</p><div class="statsGrid">' + filasAfin + '</div></div>';
    html += '<div class="tarjeta"><h3>Yin y Yang · despiertos desde el nacimiento</h3><p style="margin:0;color:var(--textoFrio)">Yin y Yang ya están despiertos en ti (nivel 1 los dos): no hay que despertar ninguno. Lo que falta es CONTROLARLOS: se entrenan con el uso — Yin golpeando de cerca, Yang lanzando energía a distancia — y tu estilo natural (' + perfil.estiloNatural.toUpperCase() + ') crece ×1.5 más rápido. Las formas y técnicas se aprenden de un Guía, que te pedirá cierto nivel de Yin o de Yang. Despierto no es dominado: dominar un estilo es el trabajo de una vida.</p></div>';
    html += '<div class="tarjeta"><h3>Arte Místico · Mente (hechiceros)</h3><p style="margin:0;color:var(--textoFrio)">' + (perfil.hechiceroPotencial ? 'El test REVELÓ potencial de hechicero en ti: tienes afinidad con el Arte Místico / la Mente. Es solo el potencial: ser hechicero es casi otra vida — súper difícil, toma una vida — y primero se aprenden cosas básicas con los hechiceros (en Arcana).' : 'El test no reveló potencial de hechicero, pero NO está cerrado: puedes CONVERTIRTE en hechicero si vas con los hechiceros (en Arcana) y te entrenas con ellos. Es casi otra vida: súper difícil, toma una vida, y primero se aprenden cosas básicas.') + ' La INVISIBILIDAD es técnica de hechiceros y tú NO puedes aprenderla: es mental, no elemental, y no es congruente con ningún elemento. La tienen los hechiceros entrenados.' + '</p></div>';
    html += '<div class="tarjeta"><h3>Tus sabores · en tu orden</h3><p style="margin:0;color:var(--textoFrio)">' + perfil.sabores.map((sb, i) => (i + 1) + 'º ' + sb).join(' · ') + '. Al comer, tu favorito sube +10% de Vida y +15% de Esencia; el 2º, +5% y +10%; el 3º, +5% de Esencia; el 4º, +3%; el 5º no sube nada. Máximo 3 comidas al día, fuera de combate, y la comida no restaura Condición.</p></div>';
    html += '<div class="enfoque">Tu elemento es ' + E.nombre + '. Dominarlo es el trabajo de una vida. Concéntrate en él.</div>';
    html += '<div class="nombreFila"><input id="inpNombre" maxlength="12" value="' + nombre + '" placeholder="Nombre de esta vida"><button class="mini" id="btnDadoNombre">DADO</button><button class="grande" id="btnNacer" style="font-size:13px;padding:10px 16px">Comenzar esta vida</button></div></div>';
    document.getElementById('testContenido').innerHTML = html; U.Render.iconoCanvas(document.getElementById('cvSimbolo'), perfil.elemento);
    document.getElementById('btnDadoNombre').addEventListener('click', () => { document.getElementById('inpNombre').value = nombres[Math.floor(Math.random() * nombres.length)]; U.Audio.sfx('click'); });
    document.getElementById('btnNacer').addEventListener('click', () => this.nacer()); document.getElementById('inpNombre').addEventListener('keydown', e => { if (e.key === 'Enter') this.nacer(); e.stopPropagation(); });
    U.Audio.sfx('unlock');
  },
  nacer() { const n = document.getElementById('inpNombre').value.trim() || 'Sin nombre'; this.activo = false; this.escena = null; document.getElementById('test').classList.add('oculto'); U.Juego.comenzarMundo(this.perfil, this.semilla, n); },
  // Animación del logo y del reveal (la llama el único bucle del juego)
  animar(dt) {
    this.t += dt; const s = this.escena; if (!s) return;
    if (s.tipo === 'logo') { const cv = document.getElementById('logoCanvas'); if (!cv) return; const x = cv.getContext('2d'); x.clearRect(0, 0, 360, 110); x.fillStyle = '#05070f'; U.Render.texto(x, 'UNIPAR', 180 + 3, 30 + 3, 7, '#05070f', 'center', false); U.Render.texto(x, 'UNIPAR', 180, 30, 7, '#e8dcc8', 'center', false); x.fillStyle = 'rgba(53,198,244,.35)'; x.fillRect(60, 84, 240, 2); U.Elementos.ids.forEach((id, i) => { const a = this.t * 0.8 + i * 1.256; const px = 180 + Math.cos(a) * 150, py = 55 + Math.sin(a) * 36; U.Render.simbolo(x, id, Math.round(px) - 8, Math.round(py) - 8, 2, undefined, true); }); return; }
    s.t += dt;
    if (s.tipo === 'reveal') { const cv = document.getElementById('cvSimbolo'); if (cv) { const x = cv.getContext('2d'); x.clearRect(0, 0, 88, 88); const p = 0.5 + 0.5 * Math.sin(s.t * 3); x.fillStyle = 'rgba(255,255,255,' + (0.04 + p * 0.06) + ')'; x.beginPath(); x.arc(44, 44, 40 + p * 3, 0, Math.PI * 2); x.fill(); U.Render.simbolo(x, this.perfil.elemento, 12, 12 + Math.round(Math.sin(s.t * 2) * 2), 8, undefined, true); } }
  }
};
