/* === js/sistemas/tiempo.js === */
/* Unipar — reloj interno: un día completo dura 20 minutos reales, dividido en 4 fases de
   5 minutos reales (6 horas de juego) cada una: Madrugada 00–06, Día 06–12, Tarde 12–18
   y Noche 18–24, en ciclo. La fase tiñe el mundo (madrugada y noche oscuras, día claro,
   tarde cálida que cae hacia la noche) y descansar en la fogata adelanta el reloj
   exactamente una fase: 5 minutos reales = 6 horas de juego = un cuarto de día. */
window.U = window.U || {};

U.Tiempo = {
  SEG_POR_DIA: 1200, // 1200 s reales (20 min) = 1440 min de juego → 1.2 min de juego por segundo real; cada fase dura 300 s reales
  MIN_POR_FASE: 360, // 6 horas de juego por fase
  DIAS: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  // 6 MOMENTOS del día: Amanecer 05–08 · Mañana 08–12 · Mediodía 12–15 · Tarde 15–19 · Atardecer 19–21 · Noche 21–05.
  crear() { return { minutos: 9 * 60, durmiendo: false, fase: 0, t: 0, dia: 1, diaSemana: 0, salto: null, modoCama: false }; }, // se nace un Lunes a las 09:00 (Mañana)
  avanzar(E, dt) { const r = E.reloj; if (!r || r.durmiendo) return; const total = r.minutos + dt * (1440 / this.SEG_POR_DIA); const diasExtra = Math.floor(total / 1440); r.minutos = total % 1440; if (diasExtra > 0) { r.dia = (r.dia || 1) + diasExtra; r.diaSemana = ((r.diaSemana || 0) + diasExtra) % 7; if (E.clima && U.Clima) U.Clima.alCambiarDia(E); } },
  diaTexto(r) { return this.DIAS[((r.diaSemana || 0) % 7 + 7) % 7] + ' · Día ' + (r.dia || 1); },
  esNoche(h) { return h >= 21 || h < 5; },
  hora(E) { return E && E.reloj ? E.reloj.minutos / 60 : 9; },
  // Minutos de juego transcurridos desde el inicio de la vida (día 1 a las 00:00 = 0).
  // Sirve para fechar cosas que duran días de juego completos (p. ej. el puente de Tierra:
  // dura 1440 de estos minutos y luego el agua se lo traga).
  absoluto(E) { return E && E.reloj ? ((E.reloj.dia || 1) - 1) * 1440 + (E.reloj.minutos || 0) : 0; },
  formato(minutos) { return this.formatoHora(minutos) + ' ' + this.formatoAmpm(minutos); },
  formatoHora(minutos) { const m = Math.floor(minutos) % 1440; const hh24 = Math.floor(m / 60), mm = m % 60; const hh = hh24 % 12 === 0 ? 12 : hh24 % 12; return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm; },
  formatoAmpm(minutos) { const m = Math.floor(minutos) % 1440; return Math.floor(m / 60) < 12 ? 'AM' : 'PM'; },
  // Fase actual según la hora: madrugada 00–06 · día 06–12 · tarde 12–18 · noche 18–24.
  faseDe(h) {
    if (h >= 5 && h < 8) return { id: 'amanecer', nombre: 'Amanecer', banner: 'ES EL AMANECER', icono: '🌅' };
    if (h >= 8 && h < 12) return { id: 'manana', nombre: 'Mañana', banner: 'ES LA MAÑANA', icono: '☀' };
    if (h >= 12 && h < 15) return { id: 'mediodia', nombre: 'Mediodía', banner: 'ES MEDIODÍA', icono: '☀' };
    if (h >= 15 && h < 19) return { id: 'tarde', nombre: 'Tarde', banner: 'ES LA TARDE', icono: '◑' };
    if (h >= 19 && h < 21) return { id: 'atardecer', nombre: 'Atardecer', banner: 'ES EL ATARDECER', icono: '🌇' };
    return { id: 'noche', nombre: 'Noche', banner: 'ES DE NOCHE', icono: '☾' };
  },
  fase(E) { return this.faseDe(this.hora(E)); },
  // Oscuridad 0..0.72 por tramos, alineada a las fases: madrugada oscura que aclara al
  // llegar el Día (06:00), Día claro, Tarde clara que oscurece al caer la Noche (18:00).
  oscuridad(h) {
    const K = [[0, 0.72], [5, 0.72], [5.6, 0.55], [6, 0.18], [6.6, 0.03], [12, 0.03], [16.8, 0.03], [17.6, 0.22], [18, 0.38], [18.8, 0.62], [19.6, 0.72], [24, 0.72]];
    for (let i = 0; i < K.length - 1; i++) { const a = K[i], b = K[i + 1]; if (h >= a[0] && h <= b[0]) { const f = b[0] === a[0] ? 0 : (h - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * f; } }
    return 0;
  },
  // Tinte cálido (naranja suave) en el cambio Madrugada→Día (06:00) y Tarde→Noche (18:00).
  calidez(h) {
    const pico = (c, w) => Math.max(0, 1 - Math.abs(h - c) / w);
    return Math.max(pico(6, 1.1), pico(18, 1.2)) * 0.16;
  },
  icono(h) { return this.faseDe(h).icono; },
  // Al descansar en la fogata: avanza UNA fase completa (360 min de juego = 5 min reales
  // de reloj = un cuarto de día), con vuelta de ciclo a medianoche. NO salta a una hora
  // fija: desde la mañana despiertas por la tarde, desde la tarde de noche, etc.
  // Dormir en la fogata: avanza hasta el INICIO DEL SIGUIENTE MOMENTO (de los 6). Si cruza medianoche, suma un día al calendario.
  avanzarDescanso(r) { const cortes = [300, 480, 720, 900, 1140, 1260, 1440]; const m = Math.floor(r.minutos); let dest = cortes[cortes.length - 1]; for (let i = 0; i < cortes.length; i++) { if (cortes[i] > m + 1) { dest = cortes[i]; break; } } if (dest >= 1440) { r.dia = (r.dia || 1) + 1; r.diaSemana = ((r.diaSemana || 0) + 1) % 7; r.minutos = 0; } else r.minutos = dest; return r.minutos; },
  // Dormir en la CAMA hasta la alarma: salta a la hora fijada (hoy si aún no pasó; si ya pasó, mañana) y ajusta el calendario.
  aplicarSalto(r) { if (!r.salto) { this.avanzarDescanso(r); return; } const s = r.salto; r.salto = null; r.minutos = s.minutos; if (s.dias) { r.dia = (r.dia || 1) + s.dias; r.diaSemana = ((r.diaSemana || 0) + s.dias) % 7; } }
};
