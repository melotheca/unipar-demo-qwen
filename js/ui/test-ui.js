/* === js/ui/test-ui.js === */
/* Unipar — test inicial: 10–12 preguntas al azar del banco ampliado (mezcla Fisher-Yates, opciones también barajadas) + 2–3 escenas al azar en posiciones aleatorias (mercado, carga, río, criatura, festival), desempate, revelación y nombre. */
window.U = window.U || {};

U.TestUI = {
  activo: true, pasos: [], idx: 0, scores: null, usadas: [], escena: null, t: 0, logoT: 0, semilla: '', cargaT: 0, cargando: false, escenaLista: false,
  init() { this.semilla = this.nuevaSemilla(); document.getElementById('semillaTxt').textContent = this.semilla; this.intro(); },
  nuevaSemilla() { const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]; return s; },
  rngSemilla(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return U.Render.mulberry(h >>> 0); },
  // Mezcla Fisher-Yates de verdad (sin sesgo): devuelve una copia barajada.
  barajar(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; },
  comenzar() {
    U.Audio.init(); U.Audio.reanudar(); U.Audio.musica('test'); U.Audio.sfx('click'); this.saboresListo = false; this.ordenSabores = [];
    this.scores = { p: { fuego: 0, agua: 0, tierra: 0, viento: 0, rayo: 0 }, s: {}, a: {}, e: { yin: 0, yang: 0 } }; this.usadas = [];
    // Preguntas: Fisher-Yates sobre todo el banco y se toman 10–12 distintas en cada vida.
    const banco = this.barajar(U.TestBanco.preguntas.map((q, i) => i));
    const nPreg = 10 + Math.floor(Math.random() * 3); const elegidas = banco.slice(0, nPreg); this.usadas = elegidas.slice(); this.resto = banco.slice(nPreg);
    this.pasos = elegidas.map(q => ({ tipo: 'pregunta', q }));
    // Escenas: 2–3 al azar del banco de escenas (mercado, carga y las nuevas), insertadas en posiciones aleatorias ENTRE las preguntas.
    const poolEscenas = ['mercado', 'carga', 'rio', 'criatura', 'festival'];
    const nEsc = Math.random() < 0.5 ? 2 : 3;
    const escenas = this.barajar(poolEscenas).slice(0, nEsc);
    const posSet = new Set(); while (posSet.size < nEsc) posSet.add(1 + Math.floor(Math.random() * (this.pasos.length - 1)));
    const posiciones = Array.from(posSet).sort((a, b) => b - a); // de atrás hacia adelante para que los splice no muevan las demás
    escenas.forEach((id, k) => { const pasoEsc = id === 'carga' ? { tipo: 'carga' } : id === 'mercado' ? { tipo: 'mercado' } : { tipo: 'escena', id }; this.pasos.splice(posiciones[k], 0, pasoEsc); });
    this.idx = 0; this.paso();
  },
  sumar(o) { const S = this.scores; if (o.p) for (const k in o.p) S.p[k] += o.p[k]; if (o.s) for (const k in o.s) S.s[k] = (S.s[k] || 0) + o.s[k]; if (o.a) for (const k in o.a) S.a[k] = (S.a[k] || 0) + o.a[k]; if (o.e) for (const k in o.e) S.e[k] += o.e[k]; },
  progreso(extra) { const c = document.getElementById('testProgreso'); c.innerHTML = ''; const total = Math.max(this.pasos.length, this.idx + 1); for (let i = 0; i < total; i++) { const d = document.createElement('i'); d.className = i < this.idx ? 'hecho' : i === this.idx ? 'actual' : ''; c.appendChild(d); } if (extra) { const p = document.createElement('span'); p.style.cssText = 'font-size:11px;color:var(--aviso);margin-left:8px'; p.textContent = extra; c.appendChild(p); } },
  intro() {
    const c = document.getElementById('testContenido'); document.getElementById('testProgreso').innerHTML = '';
    const auto = (window.U && U.Guardado) ? U.Guardado.leerAuto() : null;
    const escHtml = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const bloqueAuto = auto ? '<div class="introInfo" style="border-color:var(--exito)"><b style="color:var(--exito)">● Guardado automático: tienes una partida en curso.</b><br>' + escHtml(auto.nombre || 'Sin nombre') + ' · ' + U.Elementos.nombre(auto.perfil.elemento) + ' · guardada el ' + U.Guardado.fechaTexto(auto.guardadoEn) + '. Tu partida se guarda sola en este navegador: entra y sigues donde ibas, sin descargar ni subir ningún archivo.</div><button class="grande" id="btnContinuarAuto" style="background:linear-gradient(180deg,#2f7d4f,#1d5233);border-color:#a7f3c9;box-shadow:0 5px 0 var(--sombra),0 0 22px rgba(103,224,138,.4)">Continuar partida</button>' : '';
    c.innerHTML = '<div class="intro"><canvas id="logoCanvas" width="360" height="110"></canvas><p class="sub">Una vida. Un elemento. Universos paralelos.</p>' + bloqueAuto + '<div class="introInfo"><b>Antes de nacer en este mundo:</b> entre 10 y 12 preguntas y 2 o 3 escenas, distintas en cada vida: el azar elige cuáles salen y en qué orden, y las opciones también cambian de lugar. Responde con instinto: no hay respuestas correctas y nadie te dirá qué elemento busca cada opción. El test decide tu elemento, tu atributo, tus estadísticas iniciales y tu inclinación de estilo. Una prueba por vida.<br><br><b>Recuerda:</b> dominar UN elemento es el trabajo de una vida. Concéntrate en él. El Yang es un estilo más: con afinidad naces despierto; sin ella, puedes alcanzarlo entrenando, como un segundo elemento.</div><div class="semillaFila">Semilla del mundo <input id="inpSemilla" maxlength="8" value="' + this.semilla + '"><button class="mini" id="btnDado">DADO</button></div><button class="grande" id="btnComenzarTest">' + (auto ? 'Nueva vida (repetir test)' : 'Comenzar el test') + '</button><button class="mini" id="btnCargarIntro" style="font-size:12px;padding:8px 14px">CARGAR DESDE ARCHIVO (RESPALDO)</button><p class="nota">100% offline · móvil (touch) y escritorio · juego completo: 1 continente continuo gigante rodeado de mar (la Metrópolis en el centro, 5 aldeas elementales en radial, la ciudad de los magos, 6 pueblos pequeños con casas para rentar, bosque, desierto, montaña de nieve) + interiores, calendario semanal, clima, casa con cama y alarma, retos y hechizo de inversión<br>Guardado automático activado: tu progreso se guarda solo en este navegador. Si quieres un respaldo para otro teléfono, en Opciones (⚙) tienes DESCARGAR PARTIDA.</p></div>';
    document.getElementById('btnComenzarTest').addEventListener('click', () => { const v = document.getElementById('inpSemilla').value.trim().toUpperCase(); this.semilla = v || this.nuevaSemilla(); document.getElementById('semillaTxt').textContent = this.semilla; this.comenzar(); });
    const bCA = document.getElementById('btnContinuarAuto'); if (bCA) bCA.addEventListener('click', () => { U.Audio.init(); U.Audio.reanudar(); U.Guardado.cargarAuto(); });
    const bcI = document.getElementById('btnCargarIntro'); if (bcI) bcI.addEventListener('click', () => { U.Audio.init(); U.Audio.reanudar(); U.Guardado.elegirArchivo(); });
    document.getElementById('btnDado').addEventListener('click', () => { this.semilla = this.nuevaSemilla(); document.getElementById('inpSemilla').value = this.semilla; document.getElementById('semillaTxt').textContent = this.semilla; U.Audio.init(); U.Audio.sfx('click'); });
    document.getElementById('inpSemilla').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });
    this.escena = { tipo: 'logo' };
  },
  paso() {
    this.escenaLista = false; const p = this.pasos[this.idx]; if (!p) { if (!this.saboresListo) { this.sabores(); return; } this.reveal(); return; }
    if (p.tipo === 'pregunta') this.pregunta(typeof p.q === 'number' ? U.TestBanco.preguntas[p.q] : p.q, p.extra); else if (p.tipo === 'mercado') this.mercado(); else if (p.tipo === 'carga') this.carga(); else if (p.tipo === 'escena') this.escenaTap(p.id);
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
  // SABORES: no eliges uno: los ORDENAS del que más te gusta al que menos. El ranking queda fijo y manda en la comida.
  sabores() {
    this.progreso('Sabores: ordénalos por gusto'); this.escena = null;
    const orden = this.ordenSabores = [];
    const c = document.getElementById('testContenido');
    const pintar = () => {
      let html = '<div class="pregunta"><span class="indice">ANTES DE NACER · TUS SABORES</span><h2>Ordena los sabores del que MÁS te gusta al que MENOS. Tócalos en ese orden: este ranking queda fijo en tu vida y decide cuánto te sube cada comida.</h2>';
      html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">' + orden.map((sb, i) => '<span class="chip" style="border-color:var(--exito);color:var(--exito)">' + (i + 1) + 'º ' + sb + '</span>').join('') + '</div><div class="ops">';
      U.Economia.SABORES.forEach(sb => { if (orden.indexOf(sb) < 0) html += '<button class="op" data-sabor="' + sb + '"><span class="num">' + (orden.length + 1) + '</span><span>Comida ' + sb + '</span></button>'; });
      html += '</div>' + (orden.length === 5 ? '<p class="registrado" style="color:var(--exito);margin-top:8px">Ranking completo: ' + orden.join(' · ') + '. Registrado.</p>' : '<p class="nota" style="margin-top:8px">Llevas ' + orden.length + '/5. Tu favorito te subirá +10% de Vida y +15% de Esencia al comerlo; el último no te subirá nada, solo te llena.</p>') + '</div>';
      c.innerHTML = html;
      c.querySelectorAll('[data-sabor]').forEach(b => b.addEventListener('click', () => { orden.push(b.dataset.sabor); U.Audio.sfx('click'); if (orden.length >= 5) { this.saboresListo = true; if (this.perfil) this.perfil.sabores = orden.slice(); setTimeout(() => this.reveal(), 700); } pintar(); }));
    };
    pintar();
  },
  tecla(num) { if (!this.activo) return; const c = document.getElementById('testContenido'); const ops = c.querySelectorAll('.op'); if (ops.length && num >= 1 && num <= ops.length) ops[num - 1].click(); },
  mercado() {
    this.progreso(); const M = U.TestBanco.mercado; const c = document.getElementById('testContenido');
    c.innerHTML = '<div class="escena"><p>' + M.titulo + '</p><small>' + M.sub + '</small><canvas id="canvasMercado" width="320" height="180"></canvas><div id="mercadoNota"></div></div>';
    const cv = document.getElementById('canvasMercado'); this.escena = { tipo: 'mercado', cv, ctx: cv.getContext('2d'), sel: null, t: 0 };
    cv.addEventListener('pointerdown', e => { if (this.escenaLista) return; const r = cv.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * 320, y = (e.clientY - r.top) / r.height * 180; const o = M.objetos.find(o => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h); if (!o) return; this.escenaLista = true; this.escena.sel = o; this.sumar(o); U.Audio.sfx('unlock'); document.getElementById('mercadoNota').innerHTML = '<span class="registrado">' + o.nombre + '. Registrado.</span>'; setTimeout(() => this.siguiente(), 900); });
  },
  // Escenas táctiles nuevas (río, criatura, festival): mismo gesto que el mercado — toca lo primero que te llame.
  escenaTap(id) {
    this.progreso(); const E = U.TestBanco[id]; const c = document.getElementById('testContenido');
    c.innerHTML = '<div class="escena"><p>' + E.titulo + '</p><small>' + E.sub + '</small><canvas id="canvasEscena" width="320" height="180"></canvas><div id="escenaNota"></div></div>';
    const cv = document.getElementById('canvasEscena'); this.escena = { tipo: 'escenaTap', id, cv, ctx: cv.getContext('2d'), sel: null, t: 0 };
    cv.addEventListener('pointerdown', e => { if (this.escenaLista) return; const r = cv.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * 320, y = (e.clientY - r.top) / r.height * 180; const o = E.objetos.find(o => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h); if (!o) return; this.escenaLista = true; this.escena.sel = o; this.sumar(o); U.Audio.sfx('unlock'); document.getElementById('escenaNota').innerHTML = '<span class="registrado">' + o.nombre + '. Registrado.</span>'; setTimeout(() => this.siguiente(), 900); });
  },
  carga() {
    this.progreso(); const C = U.TestBanco.carga; const c = document.getElementById('testContenido');
    c.innerHTML = '<div class="escena"><p>' + C.titulo + '</p><small>' + C.sub + '</small><canvas id="canvasCarga" width="320" height="260"></canvas><div id="cargaNota"></div></div>';
    const cv = document.getElementById('canvasCarga'); this.escena = { tipo: 'carga', cv, ctx: cv.getContext('2d'), t: 0, partes: [] }; this.cargaT = 0; this.cargando = false;
    const down = e => { e.preventDefault(); if (this.escenaLista) return; this.cargando = true; this.cargaT = 0; U.Audio.init(); U.Audio.sfx('cargando'); cv.setPointerCapture(e.pointerId); };
    const up = e => { if (!this.cargando || this.escenaLista) return; this.cargando = false; this.escenaLista = true; const tr = C.tramos.find(t => this.cargaT < t.max) || C.tramos[C.tramos.length - 1]; this.sumar(tr); U.Audio.sfx(this.cargaT >= 0.35 ? 'cargado' : 'yin'); document.getElementById('cargaNota').innerHTML = '<span class="registrado">' + tr.nota + ' (' + this.cargaT.toFixed(2) + 's)</span>'; setTimeout(() => this.siguiente(), 900); };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', up);
  },
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
    const maestria = { fuego: 0, agua: 0, tierra: 0, viento: 0, rayo: 0 }; maestria[top] = distr[top]; if (elem2) maestria[elem2] = distr[elem2];
    // Yang es un estilo alcanzable por cualquiera, como un segundo elemento: el test solo revela la AFINIDAD.
    // Con afinidad naces despierto (estilo 5); sin afinidad empiezas en 0 y lo despiertas entrenando hasta 5.
    // Yin lo tiene todo el mundo (es el cuerpo); tenerlo no es dominarlo.
    const yangAfin = estilo === 'yang';
    // POTENCIAL DE HECHICERO (Arte Místico / Mente): el test lo revela si tu Mente
    // nace alta o tu atributo es Sabio. Sin revelación NO está cerrado: puedes
    // convertirte en hechicero entrenándote con los hechiceros (camino de una vida).
    const hechiceroPotencial = atributo === 'sabio' || stats.mente >= 12;
    const estilosFin = { yin: distr.yin || 0, yang: yangAfin ? Math.max(5, distr.yang || 0) : 0 };
    return { elemento: top, elemento2: elem2, atributo, estilo, yangAfin, hechiceroPotencial, stats, maestria, estilos: estilosFin, distr, scores: S, sabores: (U.TestUI.ordenSabores && U.TestUI.ordenSabores.length === 5) ? U.TestUI.ordenSabores.slice() : U.Economia.SABORES.slice() };
  },
  reveal() {
    let perfil = this.calcular();
    if (!perfil) { if (this.resto.length) { const qi = this.resto.shift(); this.usadas.push(qi); this.pasos.push({ tipo: 'pregunta', q: U.TestBanco.preguntas[qi], extra: true }); this.idx = this.pasos.length - 1; this.pregunta(U.TestBanco.preguntas[qi], true); return; } this.scores.p[U.Elementos.ids[Math.floor(Math.random() * 5)]] += 0.5; perfil = this.calcular(); }
    this.perfil = perfil; this.escena = { tipo: 'reveal', t: 0 }; document.getElementById('testProgreso').innerHTML = ''; const E = U.Elementos.datos[perfil.elemento], a = U.Atributos.de(perfil.atributo);
    const nombres = { fuego: ['Brann', 'Kira', 'Doran'], agua: ['Nima', 'Aren', 'Selia'], tierra: ['Toruk', 'Mara', 'Oren'], viento: ['Lira', 'Sael', 'Nim'], rayo: ['Vek', 'Zuri', 'Ilan'] }[perfil.elemento]; const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    let html = '<div class="reveal"><div class="revealCab"><canvas id="cvSimbolo" width="88" height="88" style="color:' + E.color + '"></canvas><div><h2 style="color:' + E.color + '">TU ELEMENTO ES ' + E.nombre.toUpperCase() + '</h2><p>' + E.personalidad + '</p></div></div>';
    html += '<div class="tarjetas"><div class="tarjeta"><h3>Atributo · ' + a.nombre + '</h3><div class="ventaja">▲ ' + a.ventaja + '</div><div class="desventaja">▼ ' + a.desventaja + '</div><p style="margin:6px 0 0;color:var(--textoFrio)">' + a.desc + '</p></div><div class="tarjeta"><h3>Inclinación de estilo · ' + perfil.estilo.toUpperCase() + '</h3><p style="margin:0;color:var(--textoFrio)">' + (perfil.estilo === 'yin' ? 'Yin: el cuerpo primero. Cerca, barato, universal. Todos dominan Yin en algún grado.' : 'Yang: energía blanca a distancia. Cara, deliberada, y entrena tu recuperación de Esencia.') + '</p><div class="distr" style="margin-top:6px">' + Object.keys(perfil.distr).filter(k => perfil.distr[k] > 0).map(k => '<span>' + (U.Elementos.datos[k] ? U.Elementos.nombre(k) : k.toUpperCase()) + ' ' + perfil.distr[k] + '</span>').join('') + '<span style="color:var(--textoTenue)">20 puntos</span></div></div></div>';
    html += '<div class="tarjeta"><h3>Estadísticas iniciales</h3><div class="statsGrid">' + Object.keys(perfil.stats).map(k => '<div class="statFila"><span>' + U.Estadisticas.etiquetas[k] + '</span><div class="bar"><i style="transform:scaleX(' + (perfil.stats[k] / ((k === 'vida' || k === 'esencia') ? 130 : 14)) + ')"></i></div><span class="val">' + perfil.stats[k] + '</span></div>').join('') + '</div></div>';
    const m = perfil.maestria[perfil.elemento]; const h1 = U.Habilidades.elementos[perfil.elemento][0];
    html += '<div class="tarjeta"><h3>Maestría de ' + E.nombre + ' · ' + m + '% · ' + U.Elementos.etapa(m) + '</h3><div class="maestriaReveal"><i style="transform:scaleX(' + m / 100 + ');background:linear-gradient(90deg,' + E.color + ',' + E.claro + ')"></i><b style="left:15%"></b><b style="left:40%"></b><b style="left:70%"></b></div><p style="margin:6px 0 0;font-size:11px;color:var(--textoFrio)">POCAS técnicas, y se aprenden de un GUÍA por tarea (no por porcentaje): 15 / 40 / 70% es la maestría MÍNIMA para poder aprender cada una. La maestría sube con curva multiplicativa — lenta desde el principio y cada tramo cuesta más que el anterior: ' + U.Habilidades.elementos[perfil.elemento].map(h => h.nombre).join(' · ') + '. ' + (m >= 15 ? 'Ya cumples la maestría mínima de ' + h1.nombre + ': búscala con un Guía y apréndela por tarea.' : 'Aún sin la maestría mínima de ninguna técnica: canaliza con golpes Yin hasta el 15%.') + (perfil.elemento2 ? ' Segundo elemento ' + U.Elementos.nombre(perfil.elemento2) + ' al 5%: sin técnica todavía.' : '') + '</p></div>';
    html += '<div class="tarjeta"><h3>Yang · ' + (perfil.yangAfin ? 'Afinidad revelada' : 'Sin afinidad revelada') + '</h3><p style="margin:0;color:var(--textoFrio)">' + (perfil.yangAfin ? 'El test reveló afinidad con el Yang: naces con el estilo despierto (Yang ' + U.Habilidades.yangDespertar + ') y verás su botón en los controles. Desarrollarlo a fondo lleva su propia vida de entrenamiento. Yin también es tuyo, como el de todos: tenerlo no es dominarlo.' : 'El test no reveló afinidad Yang: no naces con él despierto, pero NO está cerrado. Como dominar otro elemento, puedes alcanzarlo entrenando: medita mientras descansas y entrena con Torin hasta llevar el estilo Yang a ' + U.Habilidades.yangDespertar + '; ahí despertará y aparecerá su botón. La afinidad cambia el punto de partida, no el destino: sin ella el camino es más largo, eso es todo. Yin lo tiene todo el mundo porque todos tienen cuerpo; tenerlo no es dominarlo.') + '</p></div>';
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
  // Animación de escenas (la llama el único bucle del juego)
  animar(dt) {
    this.t += dt; const s = this.escena; if (!s) return;
    if (s.tipo === 'logo') { const cv = document.getElementById('logoCanvas'); if (!cv) return; const x = cv.getContext('2d'); x.clearRect(0, 0, 360, 110); x.fillStyle = '#05070f'; U.Render.texto(x, 'UNIPAR', 180 + 3, 30 + 3, 7, '#05070f', 'center', false); U.Render.texto(x, 'UNIPAR', 180, 30, 7, '#e8dcc8', 'center', false); x.fillStyle = 'rgba(53,198,244,.35)'; x.fillRect(60, 84, 240, 2); U.Elementos.ids.forEach((id, i) => { const a = this.t * 0.8 + i * 1.256; const px = 180 + Math.cos(a) * 150, py = 55 + Math.sin(a) * 36; U.Render.simbolo(x, id, Math.round(px) - 8, Math.round(py) - 8, 2, undefined, true); }); return; }
    const x = s.ctx; s.t += dt;
    if (s.tipo === 'mercado') {
      x.fillStyle = '#1a2440'; x.fillRect(0, 0, 320, 180); x.fillStyle = '#22305a'; for (let i = 0; i < 320; i += 16) for (let j = 100; j < 180; j += 12) { x.fillStyle = (i / 16 + j / 12) % 2 ? '#2a3a66' : '#22305a'; x.fillRect(i, j, 16, 12); }
      x.fillStyle = '#3b4d86'; x.fillRect(0, 0, 320, 40); x.fillStyle = '#0b1020'; for (let i = 0; i < 320; i += 24) x.fillRect(i + 8, 12, 8, 12); x.fillStyle = '#ffe14d'; for (let i = 0; i < 320; i += 24) x.fillRect(i + 10, 14 + Math.round(Math.sin(s.t * 3 + i) * 1), 4, 6);
      const M = U.TestBanco.mercado.objetos; const dib = {
        frutas: o => { x.fillStyle = '#5b3d22'; x.fillRect(o.x, o.y + 20, o.w, 32); x.fillStyle = '#ff7a2f'; x.fillRect(o.x - 2, o.y, o.w + 4, 10); x.fillStyle = '#f8fafc'; for (let i = 0; i < o.w + 4; i += 12) x.fillRect(o.x - 2 + i, o.y, 6, 10); x.fillStyle = '#ff5470'; x.fillRect(o.x + 6, o.y + 14, 8, 6); x.fillStyle = '#ffe14d'; x.fillRect(o.x + 20, o.y + 14, 8, 6); x.fillStyle = '#67e08a'; x.fillRect(o.x + 34, o.y + 14, 8, 6); x.fillStyle = '#e05bd0'; x.fillRect(o.x + 48, o.y + 14, 8, 6); },
        musico: o => { x.fillStyle = '#e8c39e'; x.fillRect(o.x + 14, o.y + 6, 12, 12); x.fillStyle = '#e05bd0'; x.fillRect(o.x + 8, o.y + 18, 24, 28); x.fillStyle = '#3d2a18'; x.fillRect(o.x + 12, o.y, 16, 6); x.fillStyle = '#d9a441'; x.fillRect(o.x + 4, o.y + 26 + Math.round(Math.sin(s.t * 6) * 2), 30, 10); x.fillStyle = '#5b3d22'; x.fillRect(o.x + 30, o.y + 14, 4, 20); x.fillStyle = '#f8fafc'; const n = Math.floor(s.t * 3) % 3; x.fillRect(o.x + 30 + n * 4, o.y - 6 - n * 5, 3, 3); x.fillRect(o.x + 32 + n * 4, o.y - 10 - n * 5, 2, 4); },
        jaula: o => { x.fillStyle = '#5b3d22'; x.fillRect(o.x + 14, o.y + 30, 4, 16); x.fillStyle = '#d9a441'; x.fillRect(o.x, o.y, 32, 30); x.fillStyle = '#0e1530'; x.fillRect(o.x + 2, o.y + 2, 28, 26); x.fillStyle = '#d9a441'; for (let i = 0; i < 28; i += 6) x.fillRect(o.x + 2 + i, o.y + 2, 1, 26); x.fillStyle = '#35c6f4'; x.fillRect(o.x + 12, o.y + 14 + Math.round(Math.sin(s.t * 5) * 2), 8, 6); x.fillStyle = '#ffe14d'; x.fillRect(o.x + 20, o.y + 15 + Math.round(Math.sin(s.t * 5) * 2), 2, 2); },
        mapa: o => { x.fillStyle = '#5b3d22'; x.fillRect(o.x, o.y + 30, o.w, 12); x.fillStyle = '#e8dcc8'; x.fillRect(o.x + 4, o.y, o.w - 8, 32); x.fillStyle = '#7a5320'; x.fillRect(o.x + 8, o.y + 6, 20, 10); x.fillStyle = '#35c6f4'; x.fillRect(o.x + 28, o.y + 4, 12, 18); x.fillStyle = '#a33b12'; x.fillRect(o.x + 14, o.y + 20, 3, 3); x.fillRect(o.x + 30, o.y + 12, 3, 3); x.fillStyle = '#ff7a2f'; x.fillRect(o.x + 20, o.y + 24, 8, 2); },
        fuente: o => { x.fillStyle = '#6b7280'; x.fillRect(o.x, o.y + 14, o.w, 26); x.fillStyle = '#8b93a3'; x.fillRect(o.x + 2, o.y + 14, o.w - 4, 4); x.fillStyle = '#1f5f9e'; x.fillRect(o.x + 6, o.y + 18, o.w - 12, 16); x.fillStyle = '#63b3e8'; for (let i = 0; i < 5; i++) x.fillRect(o.x + 10 + i * 10, o.y + 22 + Math.round(Math.sin(s.t * 4 + i) * 2), 5, 1); x.fillStyle = '#8b93a3'; x.fillRect(o.x + 30, o.y, 6, 16); x.fillStyle = '#bfefff'; x.fillRect(o.x + 28, o.y - 4 + Math.round(Math.sin(s.t * 8) * 2), 10, 4); },
        gato: o => { x.fillStyle = '#3d2a18'; x.fillRect(o.x + 4, o.y + 8, 30, 14); x.fillRect(o.x + 28, o.y + 2, 10, 10); x.fillRect(o.x + 28, o.y, 3, 4); x.fillRect(o.x + 35, o.y, 3, 4); x.fillRect(o.x, o.y + 4 + Math.round(Math.sin(s.t * 2) * 2), 6, 8); x.fillStyle = '#67e08a'; x.fillRect(o.x + 31, o.y + 6, 2, 1); x.fillRect(o.x + 35, o.y + 6, 2, 1); },
        balanza: o => { x.fillStyle = '#d9a441'; x.fillRect(o.x + 15, o.y + 4, 3, 28); x.fillRect(o.x + 2, o.y + 6, 30, 2); const b = Math.sin(s.t * 1.5) * 3; x.fillRect(o.x + 2, o.y + 8, 1, 8 + b); x.fillRect(o.x + 31, o.y + 8, 1, 8 - b); x.fillRect(o.x - 2, o.y + 16 + b, 9, 3); x.fillRect(o.x + 27, o.y + 16 - b, 9, 3); x.fillStyle = '#8b93a3'; x.fillRect(o.x + 8, o.y + 30, 18, 4); }
      };
      M.forEach(o => { dib[o.id](o); if (s.sel === o) { x.strokeStyle = '#ffe14d'; x.lineWidth = 2; x.strokeRect(o.x - 3, o.y - 3, o.w + 6, o.h + 6); } });
      x.fillStyle = 'rgba(255,225,77,.7)'; U.Render.texto(x, 'TOCA SIN PENSAR', 160, 4, 1, '#ffe14d', 'center');
    }
    if (s.tipo === 'carga') {
      if (this.cargando) { this.cargaT += dt; if (Math.random() < dt * 20) s.partes.push({ a: Math.random() * Math.PI * 2, r: 110, v: 60 + Math.random() * 60 }); if (Math.random() < dt * 3) U.Audio.sfx('cargando'); }
      s.partes.forEach(p => p.r -= p.v * dt); s.partes = s.partes.filter(p => p.r > 30);
      x.fillStyle = '#0e1530'; x.fillRect(0, 0, 320, 260); const k = Math.min(1, this.cargaT / 4); const col = k < 0.12 ? '#ff7a2f' : k < 0.3 ? '#ffe14d' : k < 0.6 ? '#35c6f4' : '#7ef0c0';
      x.fillStyle = 'rgba(255,255,255,.06)'; x.beginPath(); x.arc(160, 120, 70, 0, Math.PI * 2); x.fill();
      x.strokeStyle = '#3b4d86'; x.lineWidth = 8; x.beginPath(); x.arc(160, 120, 60, 0, Math.PI * 2); x.stroke();
      x.strokeStyle = col; x.beginPath(); x.arc(160, 120, 60, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); x.stroke();
      x.fillStyle = this.cargando ? col : '#1a2440'; x.beginPath(); x.arc(160, 120, 34 + (this.cargando ? Math.sin(s.t * 12) * 3 : 0), 0, Math.PI * 2); x.fill();
      s.partes.forEach(p => { x.fillStyle = col; x.fillRect(160 + Math.cos(p.a) * p.r, 120 + Math.sin(p.a) * p.r, 3, 3); });
      U.Render.texto(x, this.cargando ? 'SOSTÉN…' : (this.escenaLista ? 'REGISTRADO' : 'MANTÉN PRESIONADO'), 160, 210, 2, this.escenaLista ? '#67e08a' : '#e8dcc8', 'center'); U.Render.texto(x, 'SUELTA CUANDO SIENTAS QUE ES SUFICIENTE', 160, 236, 1, '#9fb3d9', 'center');
    }
    if (s.tipo === 'escenaTap') {
      const E = U.TestBanco[s.id]; const dib = {
        rio: {
          fondo() { x.fillStyle = '#274268'; x.fillRect(0, 0, 320, 62); x.fillStyle = '#ffe14d'; x.fillRect(282, 8, 16, 16); x.fillStyle = '#2f6b4f'; x.fillRect(0, 56, 320, 16); x.fillStyle = '#1f5f9e'; x.fillRect(0, 72, 320, 108); x.fillStyle = '#63b3e8'; for (let i = 0; i < 8; i++) x.fillRect((i * 43 + Math.round(Math.sin(s.t * 2 + i * 1.7) * 6) + 320) % 320, 84 + (i % 4) * 24, 18, 2); x.fillStyle = '#3d7a57'; x.fillRect(0, 164, 320, 16); },
          fogata: o => { x.fillStyle = '#5b3d22'; x.fillRect(o.x + 6, o.y + 22, 26, 5); x.fillRect(o.x + 10, o.y + 17, 18, 5); x.fillStyle = '#ff7a2f'; const f = Math.round(Math.sin(s.t * 9) * 2); x.fillRect(o.x + 13, o.y + 4 + f, 12, 14); x.fillStyle = '#ffe14d'; x.fillRect(o.x + 16, o.y + 8 + f, 6, 9); },
          puente: o => { x.strokeStyle = '#8a6a3b'; x.lineWidth = 3; x.beginPath(); x.moveTo(o.x, o.y + 6); x.quadraticCurveTo(o.x + o.w / 2, o.y + 24, o.x + o.w, o.y + 6); x.stroke(); x.beginPath(); x.moveTo(o.x, o.y + 16); x.quadraticCurveTo(o.x + o.w / 2, o.y + 30, o.x + o.w, o.y + 16); x.stroke(); x.fillStyle = '#a87f45'; for (let i = 0; i < 7; i++) x.fillRect(o.x + 4 + i * 11, o.y + 10 + Math.round(Math.sin(i * 0.9) * 3), 8, 3); x.fillStyle = '#5b3d22'; x.fillRect(o.x - 3, o.y, 5, 28); x.fillRect(o.x + o.w - 2, o.y, 5, 28); },
          libelula: o => { const b = Math.round(Math.sin(s.t * 14) * 2); x.fillStyle = 'rgba(191,239,255,.75)'; x.fillRect(o.x + 2, o.y + 2 + b, 10, 4); x.fillRect(o.x + 16, o.y + 2 - b, 10, 4); x.fillStyle = '#35c6f4'; x.fillRect(o.x + 10, o.y + 6, 9, 4); x.fillStyle = '#7ef0c0'; x.fillRect(o.x + 18, o.y + 7, 8, 2); },
          pez: o => { const j = Math.abs(Math.sin(s.t * 2.4)) * 10; x.fillStyle = '#ff9d5c'; x.fillRect(o.x + 6, o.y + 12 - j, 16, 8); x.fillRect(o.x + 20, o.y + 10 - j, 6, 5); x.fillStyle = '#f8fafc'; x.fillRect(o.x + 9, o.y + 14 - j, 2, 2); x.fillStyle = 'rgba(191,239,255,.8)'; x.fillRect(o.x + 4, o.y + 18, 4, 2); x.fillRect(o.x + 22, o.y + 18, 4, 2); },
          barca: o => { x.fillStyle = '#5b3d22'; x.fillRect(o.x, o.y + 10, o.w, 10); x.fillRect(o.x + 4, o.y + 20, o.w - 8, 4); x.fillStyle = '#3d2a18'; x.fillRect(o.x + 26, o.y - 6, 3, 18); x.fillStyle = '#e8dcc8'; x.fillRect(o.x + 29, o.y - 6, 12, 10); },
          piedra: o => { x.fillStyle = '#8b93a3'; x.fillRect(o.x + 2, o.y + 8, o.w - 4, 10); x.fillStyle = '#aab2c0'; x.fillRect(o.x + 6, o.y + 5, o.w - 12, 5); x.fillStyle = '#6b7280'; x.fillRect(o.x + 12, o.y + 12, 10, 3); },
          remolino: o => { x.strokeStyle = 'rgba(191,239,255,.85)'; x.lineWidth = 2; for (let rI = 0; rI < 3; rI++) { x.beginPath(); x.arc(o.x + o.w / 2, o.y + o.h / 2, 5 + rI * 6, s.t * (1.6 - rI * 0.3) + rI, s.t * (1.6 - rI * 0.3) + rI + 4.2); x.stroke(); } }
        },
        criatura: {
          fondo() { x.fillStyle = '#3a2c4e'; x.fillRect(0, 0, 320, 70); x.fillStyle = '#f8fafc'; x.fillRect(24, 12, 3, 3); x.fillRect(90, 26, 2, 2); x.fillRect(250, 10, 3, 3); x.fillRect(292, 30, 2, 2); x.fillStyle = '#2f6b4f'; x.fillRect(0, 70, 320, 110); x.fillStyle = '#8a6a3b'; x.beginPath(); x.moveTo(150, 180); x.lineTo(176, 70); x.lineTo(196, 70); x.lineTo(196, 180); x.closePath(); x.fill(); x.fillStyle = '#35c6f4'; x.fillRect(226, 140, 94, 40); x.fillStyle = 'rgba(191,239,255,.7)'; for (let i = 0; i < 4; i++) x.fillRect(234 + i * 22, 150 + (i % 2) * 12, 12, 2); },
          arbol: o => { x.fillStyle = '#3d2a18'; x.fillRect(o.x + 32, o.y + 16, 9, 16); x.fillStyle = '#24513a'; x.fillRect(o.x + 8, o.y + 2, 58, 18); x.fillRect(o.x + 18, o.y - 2, 38, 8); x.fillStyle = '#2f6b4f'; x.fillRect(o.x + 14, o.y + 8, 12, 6); x.fillRect(o.x + 44, o.y + 6, 12, 6); },
          capa: o => { x.fillStyle = '#a33b12'; x.fillRect(o.x + 6, o.y + 8, 30, 20); x.fillStyle = '#c14e1d'; x.fillRect(o.x + 6, o.y + 8, 30, 6); x.fillStyle = '#7c2d0e'; x.fillRect(o.x + 12, o.y + 2, 18, 8); x.fillStyle = '#d9a441'; x.fillRect(o.x + 18, o.y + 16, 5, 5); },
          huellas: o => { x.fillStyle = 'rgba(20,16,10,.55)'; const pts = [[4, 16], [16, 10], [28, 14], [40, 6]]; pts.forEach(p => { x.fillRect(o.x + p[0], o.y + p[1], 6, 4); x.fillRect(o.x + p[0] + 1, o.y + p[1] - 3, 2, 3); x.fillRect(o.x + p[0] + 4, o.y + p[1] - 3, 2, 3); }); },
          criatura: o => { const br = Math.round(Math.sin(s.t * 1.8) * 1); x.fillStyle = '#b08954'; x.fillRect(o.x + 8, o.y + 20 + br, 38, 16); x.fillRect(o.x + 40, o.y + 12 + br, 16, 14); x.fillRect(o.x + 50, o.y + 6 + br, 5, 8); x.fillRect(o.x + 41, o.y + 6 + br, 5, 8); x.fillRect(o.x + 2, o.y + 16 + br, 8, 6); x.fillStyle = '#ff5470'; x.fillRect(o.x + 20, o.y + 24 + br, 7, 4); x.fillStyle = '#0e1530'; x.fillRect(o.x + 48, o.y + 17 + br, 3, 2); x.fillStyle = '#8a6a3b'; x.fillRect(o.x + 12, o.y + 34, 6, 6); x.fillRect(o.x + 36, o.y + 34, 6, 6); },
          hierbas: o => { x.fillStyle = '#2f6b4f'; for (let i = 0; i < 6; i++) x.fillRect(o.x + 3 + i * 7, o.y + 12 + (i % 3) * 3, 3, 14); x.fillStyle = '#e05bd0'; x.fillRect(o.x + 8, o.y + 8, 4, 4); x.fillStyle = '#ffe14d'; x.fillRect(o.x + 26, o.y + 6, 4, 4); x.fillStyle = '#f8fafc'; x.fillRect(o.x + 38, o.y + 10, 3, 3); },
          arroyo: o => { x.fillStyle = '#1f5f9e'; x.fillRect(o.x, o.y + 6, o.w, o.h - 6); x.fillStyle = '#63b3e8'; for (let i = 0; i < 4; i++) x.fillRect(o.x + 6 + i * 14, o.y + 12 + Math.round(Math.sin(s.t * 3 + i) * 2), 8, 2); }
        },
        festival: {
          fondo() { x.fillStyle = '#141033'; x.fillRect(0, 0, 320, 180); x.fillStyle = '#f8fafc'; x.fillRect(30, 10, 2, 2); x.fillRect(150, 6, 2, 2); x.fillRect(286, 22, 2, 2); x.fillRect(96, 20, 2, 2); x.fillStyle = '#241a4d'; x.fillRect(0, 140, 320, 40); x.fillStyle = '#31236b'; for (let i = 0; i < 320; i += 16) x.fillRect(i, 140 + ((i / 16) % 2) * 10, 16, 2); x.strokeStyle = '#3b2d7a'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, 8); x.quadraticCurveTo(160, 34, 320, 8); x.stroke(); x.fillStyle = '#ffe14d'; for (let i = 0; i < 9; i++) x.fillRect(14 + i * 36, 12 + Math.round(Math.sin(i * 0.8) * 5), 4, 6); },
          faroles: o => { const cols = ['#ff7a2f', '#ffe14d', '#ff5470']; for (let i = 0; i < 3; i++) { x.fillStyle = '#3b2d7a'; x.fillRect(o.x + 8 + i * 16, o.y, 2, 8); x.fillStyle = cols[i]; x.fillRect(o.x + 3 + i * 16, o.y + 8 + Math.round(Math.sin(s.t * 2 + i) * 1), 12, 15); x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(o.x + 6 + i * 16, o.y + 11, 3, 9); } },
          mascaras: o => { x.fillStyle = '#e8dcc8'; x.fillRect(o.x + 2, o.y + 6, 18, 22); x.fillStyle = '#0e1530'; x.fillRect(o.x + 6, o.y + 13, 4, 3); x.fillRect(o.x + 13, o.y + 13, 4, 3); x.fillStyle = '#a33b12'; x.fillRect(o.x + 8, o.y + 22, 7, 2); x.fillStyle = '#35c6f4'; x.fillRect(o.x + 24, o.y + 2, 18, 22); x.fillStyle = '#0e1530'; x.fillRect(o.x + 28, o.y + 9, 4, 3); x.fillRect(o.x + 35, o.y + 9, 4, 3); x.fillStyle = '#141033'; x.fillRect(o.x + 30, o.y + 18, 7, 2); },
          cohetes: o => { const f = (s.t * 0.7) % 1; const cx = o.x + 30, cy = o.y + 18, r = 4 + f * 16; x.strokeStyle = f < 0.85 ? '#ffe14d' : 'rgba(255,225,77,0)'; x.lineWidth = 2; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.4; x.beginPath(); x.moveTo(cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5); x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); x.stroke(); } x.strokeStyle = '#ff5470'; const r2 = 3 + ((s.t * 0.7 + 0.5) % 1) * 11; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; x.beginPath(); x.moveTo(o.x + 12 + Math.cos(a) * r2 * 0.5, o.y + 12 + Math.sin(a) * r2 * 0.5); x.lineTo(o.x + 12 + Math.cos(a) * r2, o.y + 12 + Math.sin(a) * r2); x.stroke(); } },
          tambores: o => { const b = Math.abs(Math.sin(s.t * 5)) * 2; x.fillStyle = '#a33b12'; x.fillRect(o.x + 4, o.y + 12, 20, 24); x.fillRect(o.x + 32, o.y + 12, 20, 24); x.fillStyle = '#e8dcc8'; x.fillRect(o.x + 4, o.y + 10 - b, 20, 6); x.fillRect(o.x + 32, o.y + 10 + b, 20, 6); x.fillStyle = '#5b3d22'; x.fillRect(o.x + 12, o.y + 2 - b, 3, 10); x.fillRect(o.x + 42, o.y + 2 + b, 3, 10); },
          danza: o => { const cols = ['#ff7a2f', '#35c6f4', '#67e08a', '#e05bd0', '#ffe14d', '#ff5470']; for (let i = 0; i < 6; i++) { const a = s.t * 0.9 + i * Math.PI / 3; const px = o.x + o.w / 2 + Math.cos(a) * 20 - 4, py = o.y + o.h / 2 + Math.sin(a) * 11 - 6; x.fillStyle = cols[i]; x.fillRect(Math.round(px), Math.round(py), 8, 12); x.fillStyle = '#e8c39e'; x.fillRect(Math.round(px) + 2, Math.round(py) - 4, 5, 5); } x.fillStyle = '#ffe14d'; x.fillRect(o.x + o.w / 2 - 2, o.y + o.h / 2 - 2, 4, 4); },
          cantaro: o => { x.fillStyle = '#8a5a2b'; x.fillRect(o.x + 6, o.y + 8, 18, 18); x.fillRect(o.x + 10, o.y + 2, 10, 7); x.fillStyle = '#a87f45'; x.fillRect(o.x + 6, o.y + 12, 18, 4); x.fillStyle = '#63b3e8'; x.fillRect(o.x + 11, o.y + 3, 8, 3); },
          comida: o => { x.fillStyle = '#5b3d22'; x.fillRect(o.x + 4, o.y + 22, o.w - 8, 22); x.fillStyle = '#2a7f5c'; x.fillRect(o.x, o.y + 6, o.w, 9); x.fillStyle = '#f8fafc'; for (let i = 0; i < o.w; i += 12) x.fillRect(o.x + i, o.y + 6, 6, 9); x.fillStyle = '#ff5470'; x.fillRect(o.x + 8, o.y + 16, 8, 6); x.fillStyle = '#ffe14d'; x.fillRect(o.x + 22, o.y + 16, 8, 6); x.fillStyle = '#ff7a2f'; x.fillRect(o.x + 36, o.y + 16, 8, 6); }
        }
      };
      const D = dib[s.id]; x.fillStyle = '#10182e'; x.fillRect(0, 0, 320, 180); if (D && D.fondo) D.fondo();
      E.objetos.forEach(o => { if (D && D[o.id]) D[o.id](o); if (s.sel === o) { x.strokeStyle = '#ffe14d'; x.lineWidth = 2; x.strokeRect(o.x - 3, o.y - 3, o.w + 6, o.h + 6); } });
      x.fillStyle = 'rgba(255,225,77,.7)'; U.Render.texto(x, 'TOCA SIN PENSAR', 160, 4, 1, '#ffe14d', 'center');
    }
    if (s.tipo === 'reveal') { const cv = document.getElementById('cvSimbolo'); if (cv) { const x = cv.getContext('2d'); x.clearRect(0, 0, 88, 88); const p = 0.5 + 0.5 * Math.sin(s.t * 3); x.fillStyle = 'rgba(255,255,255,' + (0.04 + p * 0.06) + ')'; x.beginPath(); x.arc(44, 44, 40 + p * 3, 0, Math.PI * 2); x.fill(); U.Render.simbolo(x, this.perfil.elemento, 12, 12 + Math.round(Math.sin(s.t * 2) * 2), 8, undefined, true); } }
  }
};
