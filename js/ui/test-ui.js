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
    c.innerHTML = '<div class="intro"><canvas id="logoCanvas" width="360" height="110"></canvas><p class="sub">Una vida. Un elemento. Universos paralelos.</p>' + bloqueAuto + '<div class="introInfo"><b>Antes de nacer en este mundo:</b> 20 preguntas — 10 que revelan tu elemento y 10 que revelan tus estadísticas — mezcladas y distintas en cada vida: el azar elige cuáles salen y en qué orden, y las opciones también cambian de lugar. Responde con instinto: no hay respuestas correctas y nadie te dirá qué busca cada opción. El test decide tu elemento, tu atributo, tus estadísticas iniciales y tu inclinación de estilo. Una prueba por vida.<br><br><b>Recuerda:</b> dominar UN elemento es el trabajo de una vida. Concéntrate en él. El Yang es un estilo más: con afinidad naces despierto; sin ella, puedes alcanzarlo entrenando, como un segundo elemento.</div><div class="semillaFila">Semilla del mundo <input id="inpSemilla" maxlength="8" value="' + this.semilla + '"><button class="mini" id="btnDado">DADO</button></div><button class="grande" id="btnComenzarTest">' + (auto ? 'Nueva vida (repetir test)' : 'Comenzar el test') + '</button><button class="mini" id="btnCargarIntro" style="font-size:12px;padding:8px 14px">CARGAR DESDE ARCHIVO (RESPALDO)</button><p class="nota">100% offline · móvil (touch) y escritorio · juego completo: 1 continente continuo gigante rodeado de mar (la Metrópolis en el centro, 5 aldeas elementales en radial, la ciudad de los magos, 6 pueblos pequeños con casas para rentar, bosque, desierto, montaña de nieve) + interiores, calendario semanal, clima, casa con cama y alarma, retos y hechizo de inversión<br>Guardado automático activado: tu progreso se guarda solo en este navegador. Si quieres un respaldo para otro teléfono, en Opciones (⚙) tienes DESCARGAR PARTIDA.</p></div>';
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
    // Presupuesto fijo de 20 puntos, solo elementos y estilos. Máximo 2 elementos.
    let distr, elem2 = null;
    if (S.p[second] >= S.p[top] * 0.8 && share < 0.42) { distr = { [top]: 10, [second]: 5, yin: 5 }; elem2 = second; }
    else if (lean >= 3) { distr = { [top]: 15, yin: estilo === 'yin' ? 5 : 0, yang: estilo === 'yang' ? 5 : 0 }; }
    else { distr = { [top]: 20, yin: 0, yang: 0 }; }
    const stats = {}; const perf = U.Estadisticas.porElemento[top]; const ini = U.Atributos.de(atributo).inicio;
    for (const k in U.Estadisticas.base) { let v = U.Estadisticas.base[k] + (perf[k] || 0) + (S.s[k] || 0) * 1.2 + (ini[k] || 0); stats[k] = U.Estadisticas.clampTest(k, v); }
    // MAESTRÍA INICIAL DE PRINCIPIANTE (nivel 1): el test reparte 20 puntos de
    // AFINIDAD (distr, lo que se muestra como '20 puntos'), pero la MAESTRÍA con
    // la que naces es 1% en tu elemento principal — nivel 1 — y 0 en los demás.
    // Tu ataque básico ya es tuyo desde nivel 1 (alcance 1 celda); lo demás se
    // gana entrenando en esta vida. El segundo elemento (afinidad) no da
    // maestría: da 10 de XP en su barra (xpElemento), el piso natural de esa
    // afinidad; el principal empieza en 0 XP hacia el nivel 2 y los demás en 0.
    const maestria = { fuego: 0, agua: 0, tierra: 0, viento: 0, rayo: 0 }; maestria[top] = 1;
    const xpElemento = { fuego: 0, agua: 0, tierra: 0, viento: 0, rayo: 0 }; if (elem2) xpElemento[elem2] = 10;
    // META PARA DESPERTAR: la XP para llevar un elemento de nivel 0 a nivel 1
    // depende de su relación con tu principal. Normal: 100 XP. Opuesto — el
    // elemento que le gana a tu principal en la tabla (U.Elementos.gana) —: 200 XP.
    // El costo extra es SOLO al despertar: una vez despierto, la maestría sube
    // normal, sin penalización. El principal ya está despierto (nivel 1), así que
    // su meta es 100 como las demás.
    const GANA = (U.Elementos && U.Elementos.gana) || { fuego: ['viento', 'rayo'], agua: ['fuego', 'tierra'], tierra: ['fuego', 'rayo'], viento: ['tierra', 'agua'], rayo: ['agua', 'viento'] };
    const metaDespertar = {}; U.Elementos.ids.forEach(e => { metaDespertar[e] = (GANA[e] || []).indexOf(top) >= 0 ? 200 : 100; });
    // Yang es un estilo alcanzable por cualquiera, como un segundo elemento: el test solo revela la AFINIDAD.
    // Con afinidad naces despierto (estilo 5); sin afinidad empiezas en 0 y lo despiertas entrenando hasta 5.
    // Yin lo tiene todo el mundo (es el cuerpo); tenerlo no es dominarlo.
    const yangAfin = estilo === 'yang';
    // POTENCIAL DE HECHICERO (Arte Místico / Mente): el test lo revela si tu Mente
    // nace alta o tu atributo es Sabio. Sin revelación NO está cerrado: puedes
    // convertirte en hechicero entrenándote con los hechiceros (camino de una vida).
    const hechiceroPotencial = atributo === 'sabio' || stats.mente >= 12;
    const estilosFin = { yin: distr.yin || 0, yang: yangAfin ? Math.max(5, distr.yang || 0) : 0 };
    return { elemento: top, elemento2: elem2, atributo, estilo, yangAfin, hechiceroPotencial, stats, maestria, xpElemento, metaDespertar, estilos: estilosFin, distr, scores: S, sabores: (U.TestUI.ordenSabores && U.TestUI.ordenSabores.length === 5) ? U.TestUI.ordenSabores.slice() : U.Economia.SABORES.slice() };
  },
  reveal() {
    let perfil = this.calcular();
    if (!perfil) { if (this.resto.length) { const q = this.resto.shift(); this.usadas.push(q); this.pasos.push({ tipo: 'pregunta', q, extra: true }); this.idx = this.pasos.length - 1; this.pregunta(q, true); return; } const ord0 = U.Elementos.ids.slice().sort((a, b) => this.scores.p[b] - this.scores.p[a]); this.scores.p[ord0[0]] += 0.5; perfil = this.calcular(); }
    this.perfil = perfil; this.escena = { tipo: 'reveal', t: 0 }; document.getElementById('testProgreso').innerHTML = ''; const E = U.Elementos.datos[perfil.elemento], a = U.Atributos.de(perfil.atributo);
    const nombres = { fuego: ['Brann', 'Kira', 'Doran'], agua: ['Nima', 'Aren', 'Selia'], tierra: ['Toruk', 'Mara', 'Oren'], viento: ['Lira', 'Sael', 'Nim'], rayo: ['Vek', 'Zuri', 'Ilan'] }[perfil.elemento]; const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    let html = '<div class="reveal"><div class="revealCab"><canvas id="cvSimbolo" width="88" height="88" style="color:' + E.color + '"></canvas><div><h2 style="color:' + E.color + '">TU ELEMENTO ES ' + E.nombre.toUpperCase() + '</h2><p>' + E.personalidad + '</p></div></div>';
    html += '<div class="tarjetas"><div class="tarjeta"><h3>Atributo · ' + a.nombre + '</h3><div class="ventaja">▲ ' + a.ventaja + '</div><div class="desventaja">▼ ' + a.desventaja + '</div><p style="margin:6px 0 0;color:var(--textoFrio)">' + a.desc + '</p></div><div class="tarjeta"><h3>Inclinación de estilo · ' + perfil.estilo.toUpperCase() + '</h3><p style="margin:0;color:var(--textoFrio)">' + (perfil.estilo === 'yin' ? 'Yin: el cuerpo primero. Cerca, barato, universal. Todos dominan Yin en algún grado.' : 'Yang: energía blanca a distancia. Cara, deliberada, y entrena tu recuperación de Esencia.') + '</p><div class="distr" style="margin-top:6px">' + Object.keys(perfil.distr).filter(k => perfil.distr[k] > 0).map(k => '<span>' + (U.Elementos.datos[k] ? U.Elementos.nombre(k) : k.toUpperCase()) + ' ' + perfil.distr[k] + '</span>').join('') + '<span style="color:var(--textoTenue)">20 puntos</span></div></div></div>';
    html += '<div class="tarjeta"><h3>Estadísticas iniciales</h3><div class="statsGrid">' + Object.keys(perfil.stats).map(k => '<div class="statFila"><span>' + U.Estadisticas.etiquetas[k] + '</span><div class="bar"><i style="transform:scaleX(' + (perfil.stats[k] / ((k === 'vida' || k === 'esencia') ? 130 : 14)) + ')"></i></div><span class="val">' + perfil.stats[k] + '</span></div>').join('') + '</div></div>';
    const m = perfil.maestria[perfil.elemento]; const h1 = U.Habilidades.elementos[perfil.elemento][0];
    const segTxt = perfil.elemento2 ? ((perfil.metaDespertar && perfil.metaDespertar[perfil.elemento2] === 200) ? ' Segundo elemento ' + U.Elementos.nombre(perfil.elemento2) + ': es tu elemento contrario y despertarlo cuesta el doble (200 XP en vez de 100). Por afinidad llevas 10% de su barra, sin técnica todavía.' : ' Segundo elemento ' + U.Elementos.nombre(perfil.elemento2) + ': 10% de su barra por afinidad, sin técnica todavía.') : '';
    html += '<div class="tarjeta"><h3>Maestría de ' + E.nombre + ' · ' + m + '% · ' + U.Elementos.etapa(m) + '</h3><div class="maestriaReveal"><i style="transform:scaleX(' + m / 100 + ');background:linear-gradient(90deg,' + E.color + ',' + E.claro + ')"></i><b style="left:15%"></b><b style="left:40%"></b><b style="left:70%"></b></div><p style="margin:6px 0 0;font-size:11px;color:var(--textoFrio)">Tu ataque básico, ' + h1.nombre + ', ya es tuyo desde nivel 1 (botón 1 del equipo, alcance 1 celda). Las demás técnicas son POCAS y se aprenden de un GUÍA por tarea (no por porcentaje): 15 / 40 / 70% es la maestría MÍNIMA para poder aprender cada una. La maestría sube con curva multiplicativa — lenta desde el principio y cada tramo cuesta más que el anterior: ' + U.Habilidades.elementos[perfil.elemento].map(h => h.nombre).join(' · ') + '. Aún sin la maestría mínima de la siguiente técnica: canaliza con golpes Yin hasta el 15%.' + segTxt + '</p></div>';
    html += '<div class="tarjeta"><h3>Yang · ' + (perfil.yangAfin ? 'Afinidad revelada' : 'Sin afinidad revelada') + '</h3><p style="margin:0;color:var(--textoFrio)">' + (perfil.yangAfin ? 'El test reveló afinidad con el Yang: naces con el estilo despierto (Yang ' + U.Habilidades.yangDespertar + '). Pero despierto no es dominado: entrena un poco el Yang y su primera forma, el Haz, aparecerá entre tus botones; las demás formas se desbloquean entrenando. Yin también es tuyo, como el de todos: tenerlo no es dominarlo.' : 'El test no reveló afinidad Yang: no naces con él despierto, pero NO está cerrado. Como dominar otro elemento, puedes alcanzarlo entrenando: medita mientras descansas y entrena con Torin hasta llevar el estilo Yang a ' + U.Habilidades.yangDespertar + '; ahí despertará y aparecerá su botón. La afinidad cambia el punto de partida, no el destino: sin ella el camino es más largo, eso es todo. Yin lo tiene todo el mundo porque todos tienen cuerpo; tenerlo no es dominarlo.') + '</p></div>';
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
