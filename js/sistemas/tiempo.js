/* === js/sistemas/tiempo.js === */
/* Unipar — reloj interno: un día completo dura 20 minutos reales, dividido en 6 MOMENTOS
   de 4 horas de juego (200 segundos reales) cada uno: Madrugada 00–04, Amanecer 04–08,
   Mañana 08–12, Tarde 12–16, Atardecer 16–20 y Noche 20–00, en ciclo. El momento tiñe
   el mundo (madrugada y noche oscuras, amanecer y atardecer cálidos, mañana y tarde
   claras) y descansar en la fogata adelanta el reloj exactamente hasta el inicio del
   siguiente momento: 4 horas de juego = un sexto de día. */
window.U = window.U || {};

U.Tiempo = {
  SEG_POR_DIA: 1200, // 1200 s reales (20 min) = 1440 min de juego → 1.2 min de juego por segundo real; cada momento dura 200 s reales
  MIN_POR_FASE: 240, // 4 horas de juego por momento
  DIAS: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  // CALENDARIO semanal (días fijos; Lunes = 0): cada día un pueblo celebra mercado, el
  // Torneo de Bruma es el sábado en la arena (empieza al atardecer) y el festival
  // nocturno es el domingo. Arcana no tiene día de mercado: es ciudad de magos y tiene
  // tiendas fijas. El día dura 20 min reales (pendiente de decisión del jugador).
  CALENDARIO: {
    MERCADO: ['Aldea de Bruma', 'Metrópolis', 'Puerto Brisa Azul', 'Aldea Ceniza Viva', 'Raíz de Piedra', 'Vuelo Alto', 'Chispa Alta'], // Lunes..Domingo
    TORNEO_DIA: 5, // Sábado: Torneo de Bruma, en la arena
    FESTIVAL_DIA: 6 // Domingo: festival nocturno
  },
  // 6 MOMENTOS del día: Madrugada 00–04 · Amanecer 04–08 · Mañana 08–12 · Tarde 12–16 · Atardecer 16–20 · Noche 20–00.
  crear() { return { minutos: 9 * 60, durmiendo: false, fase: 0, t: 0, dia: 1, diaSemana: 0, salto: null, modoCama: false }; }, // se nace un Lunes a las 09:00 (Mañana)
  avanzar(E, dt) { const r = E.reloj; if (!r || r.durmiendo) return; const total = r.minutos + dt * (1440 / this.SEG_POR_DIA); const diasExtra = Math.floor(total / 1440); r.minutos = total % 1440; if (diasExtra > 0) { r.dia = (r.dia || 1) + diasExtra; r.diaSemana = ((r.diaSemana || 0) + diasExtra) % 7; if (E.clima && U.Clima) U.Clima.alCambiarDia(E); } },
  diaTexto(r) { return this.DIAS[((r.diaSemana || 0) % 7 + 7) % 7] + ' · Día ' + (r.dia || 1); },
  // Día de la semana (0 = Lunes) de hoy o de dentro de `diasMas` días.
  diaSemanaDe(E, diasMas) { const r = E && E.reloj; if (!r) return 0; return (((r.diaSemana || 0) + (diasMas || 0)) % 7 + 7) % 7; },
  // Mercado de un día de la semana: el pueblo que celebra mercado ese día.
  mercadoDia(diaSemana) { return this.CALENDARIO.MERCADO[((diaSemana % 7) + 7) % 7] || null; },
  mercadoHoy(E) { return this.mercadoDia(this.diaSemanaDe(E, 0)); },
  mercadoManana(E) { return this.mercadoDia(this.diaSemanaDe(E, 1)); },
  // ¿Hoy (o mañana) es día de mercado en ese pueblo? Sin pueblo, solo dice si hay mercado (lo hay todos los días).
  esMercadoHoy(E, pueblo) { const m = this.mercadoHoy(E); return pueblo ? m === pueblo : !!m; },
  esMercadoManana(E, pueblo) { const m = this.mercadoManana(E); return pueblo ? m === pueblo : !!m; },
  esDiaTorneo(E) { return this.diaSemanaDe(E, 0) === this.CALENDARIO.TORNEO_DIA; },
  esDiaFestival(E) { return this.diaSemanaDe(E, 0) === this.CALENDARIO.FESTIVAL_DIA; },
  esMananaTorneo(E) { return this.diaSemanaDe(E, 1) === this.CALENDARIO.TORNEO_DIA; },
  esMananaFestival(E) { return this.diaSemanaDe(E, 1) === this.CALENDARIO.FESTIVAL_DIA; },
  // Próximo evento del calendario: el más cercano (torneo > festival > mercado en caso
  // de empate en días). `pueblo` es opcional: sin él solo se miran torneo y festival.
  // Devuelve { tipo: 'mercado'|'torneo'|'festival', dias: 0.., pueblo: nombre|null }.
  proximoEvento(E, pueblo) {
    const hoy = this.diaSemanaDe(E, 0);
    const dist = dia => (dia - hoy + 7) % 7;
    const cands = [
      { tipo: 'torneo', dias: dist(this.CALENDARIO.TORNEO_DIA), pueblo: null },
      { tipo: 'festival', dias: dist(this.CALENDARIO.FESTIVAL_DIA), pueblo: null }
    ];
    if (pueblo) { const idx = this.CALENDARIO.MERCADO.indexOf(pueblo); if (idx >= 0) cands.push({ tipo: 'mercado', dias: dist(idx), pueblo: pueblo }); }
    const orden = { torneo: 0, festival: 1, mercado: 2 };
    cands.sort((a, b) => a.dias - b.dias || orden[a.tipo] - orden[b.tipo]);
    return cands[0] || null;
  },
  esNoche(h) { return h >= 20 || h < 4; },
  hora(E) { return E && E.reloj ? E.reloj.minutos / 60 : 9; },
  // Minutos de juego transcurridos desde el inicio de la vida (día 1 a las 00:00 = 0).
  // Sirve para fechar cosas que duran días de juego completos (p. ej. el puente de Tierra:
  // dura 1440 de estos minutos y luego el agua se lo traga).
  absoluto(E) { return E && E.reloj ? ((E.reloj.dia || 1) - 1) * 1440 + (E.reloj.minutos || 0) : 0; },
  formato(minutos) { return this.formatoHora(minutos) + ' ' + this.formatoAmpm(minutos); },
  formatoHora(minutos) { const m = Math.floor(minutos) % 1440; const hh24 = Math.floor(m / 60), mm = m % 60; const hh = hh24 % 12 === 0 ? 12 : hh24 % 12; return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm; },
  formatoAmpm(minutos) { const m = Math.floor(minutos) % 1440; return Math.floor(m / 60) < 12 ? 'AM' : 'PM'; },
  // Momento actual según la hora: madrugada 00–04 · amanecer 04–08 · mañana 08–12 ·
  // tarde 12–16 · atardecer 16–20 · noche 20–24.
  faseDe(h) {
    if (h >= 0 && h < 4) return { id: 'madrugada', nombre: 'Madrugada', banner: 'ES DE MADRUGADA', icono: '☾' };
    if (h >= 4 && h < 8) return { id: 'amanecer', nombre: 'Amanecer', banner: 'ES EL AMANECER', icono: '🌅' };
    if (h >= 8 && h < 12) return { id: 'manana', nombre: 'Mañana', banner: 'ES LA MAÑANA', icono: '☀' };
    if (h >= 12 && h < 16) return { id: 'tarde', nombre: 'Tarde', banner: 'ES LA TARDE', icono: '◑' };
    if (h >= 16 && h < 20) return { id: 'atardecer', nombre: 'Atardecer', banner: 'ES EL ATARDECER', icono: '🌇' };
    return { id: 'noche', nombre: 'Noche', banner: 'ES DE NOCHE', icono: '☾' };
  },
  fase(E) { return this.faseDe(this.hora(E)); },
  // Oscuridad 0..0.72 por tramos, alineada a los 6 momentos: oscura en Madrugada (00–04),
  // aclara en Amanecer (04–08), clara en Mañana y Tarde (08–16), oscurece en Atardecer
  // (16–20) y oscura en Noche (20–24). A las 18:00 ya es Atardecer pero aún no es noche.
  oscuridad(h) {
    const K = [[0, 0.72], [4, 0.72], [5, 0.55], [6, 0.30], [7, 0.10], [8, 0.03], [16, 0.03], [17, 0.18], [18, 0.38], [19, 0.62], [20, 0.72], [24, 0.72]];
    for (let i = 0; i < K.length - 1; i++) { const a = K[i], b = K[i + 1]; if (h >= a[0] && h <= b[0]) { const f = b[0] === a[0] ? 0 : (h - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * f; } }
    return 0;
  },
  // Tinte cálido (naranja suave) al amanecer (04:00) y al anochecer (20:00).
  calidez(h) {
    const pico = (c, w) => Math.max(0, 1 - Math.abs(h - c) / w);
    return Math.max(pico(4, 1.1), pico(20, 1.2)) * 0.16;
  },
  icono(h) { return this.faseDe(h).icono; },
  // Dormir en la fogata: avanza hasta el INICIO DEL SIGUIENTE MOMENTO (de los 6):
  // 04:00, 08:00, 12:00, 16:00, 20:00 o 00:00. Si cruza medianoche, suma un día al calendario.
  avanzarDescanso(r) { const cortes = [240, 480, 720, 960, 1200, 1440]; const m = Math.floor(r.minutos); let dest = cortes[cortes.length - 1]; for (let i = 0; i < cortes.length; i++) { if (cortes[i] > m + 1) { dest = cortes[i]; break; } } if (dest >= 1440) { r.dia = (r.dia || 1) + 1; r.diaSemana = ((r.diaSemana || 0) + 1) % 7; r.minutos = 0; } else r.minutos = dest; return r.minutos; },
  // Dormir en la CAMA hasta la alarma: salta a la hora fijada (hoy si aún no pasó; si ya pasó, mañana) y ajusta el calendario.
  aplicarSalto(r) { if (!r.salto) { this.avanzarDescanso(r); return; } const s = r.salto; r.salto = null; r.minutos = s.minutos; if (s.dias) { r.dia = (r.dia || 1) + s.dias; r.diaSemana = ((r.diaSemana || 0) + s.dias) % 7; } }
};
