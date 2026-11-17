/* === js/sistemas/clima.js === */
/* Unipar — CLIMA vivo: 7 climas con icono y detalle visibles en el HUD. Cambia con el momento
   del día, la zona y el azar de la semilla; dura unos minutos reales y se anuncia al cambiar.
   Efectos reales: la lluvia se VE caer, la niebla tapa el mundo, la tormenta abarata el Rayo,
   el viento fuerte abarata el Viento, el calor extremo abarata el Fuego (vía Ambiente.costo).
   LLUVIA CON INTENSIDADES (1 ligera · 2 normal · 3 fuerte · 4 tormenta): gotas, largo,
   velocidad, opacidad y salpicaduras crecen con la intensidad, y los costos también:
   el Agua es PROGRESIVA (ligera ×0.8 · normal ×0.5 · fuerte y tormenta = 1 plano, y en
   ambientes con muchísima agua paga DECIMALES ×0.15), el Fuego paga cada vez más,
   la Tierra y el Rayo bajan un poco, el Viento sube (tabla COSTOS_LLUVIA, vía Ambiente.costo).
   La TEMPERATURA y la PRECIPITACIÓN también pesan: calor → Fuego ×0.85 y Agua ×1.25;
   frío → Fuego ×1.2 y Agua ×0.9 (U.Clima.factorNumerico).
   BAJO TECHO NO LLUEVE: en los mapas interiores (tu casa, la Oficina) no caen gotas, no hay
   relámpagos, los costos no cambian por lluvia y nadie comenta la lluvia como si le cayera
   encima: solo se sabe que afuera llueve (U.Clima.esInterior lo decide todo). */
window.U = window.U || {};

U.Clima = {
  TIPOS: {
    despejado: { nombre: 'Despejado', icono: '☀', detalle: 'Cielo limpio, sin efectos' },
    nublado:   { nombre: 'Nublado', icono: '☁', detalle: 'Nubes densas, luz suave' },
    lluvia:    { nombre: 'Lluvia', icono: '🌧', detalle: 'Llueve: el mundo se moja y se oye el agua' },
    tormenta:  { nombre: 'Tormenta', icono: '⛈', detalle: 'Tormenta (precipitación máxima): Agua cuesta 1 · Rayo ×0.6 · Fuego ×2.5' },
    viento:    { nombre: 'Viento fuerte', icono: '🌬', detalle: 'Viento fuerte: el Viento cuesta −15%' },
    niebla:    { nombre: 'Niebla', icono: '🌫', detalle: 'Niebla espesa: se ve poco y todo suena lejos' },
    calor:     { nombre: 'Calor extremo', icono: '🌡', detalle: 'Calor extremo: el Fuego cuesta −15%' }
  },
  // Mapas bajo techo: dentro de una casa o lugar con techo NO debe llover.
  INTERIORES: ['casa', 'oficina'],
  INTENSIDAD_NOMBRES: { 1: 'ligera', 2: 'normal', 3: 'fuerte', 4: 'tormenta' },
  // Costos bajo lluvia por intensidad (índice = intensidad − 1).
  // AGUA ES PROGRESIVA, ya no plano 1 con cualquier lluvia: ligera ×0.8 (un poco menos),
  // normal ×0.5 (la mitad), fuerte y tormenta = 1 plano (hay muchísima agua: solo la controlas).
  // Y donde ABUNDA el agua sin llover (río, estanque, oasis, zona muy húmeda) el Agua paga en
  // DECIMALES (×0.15, mínimo 0.5): la barra de Esencia baja poquito a poquito, como debe ser
  // cuando el ambiente te favorece. Fuego: la lluvia lo apaga, paga más cuanto más llueve.
  // Tierra: el barro ayuda. Viento: la lluvia lo frena. Rayo: el agua conduce; en tormenta, ×0.6.
  COSTOS_LLUVIA: {
    agua:   [0.8, 0.5, 0, 0],
    fuego:  [1.3, 1.6, 2.0, 2.5],
    tierra: [0.95, 0.9, 0.85, 0.8],
    viento: [1.1, 1.2, 1.35, 1.5],
    rayo:   [0.95, 0.9, 0.85, 0.6]
  },
  // TEMPERATURA ambiente 0..1: la de la zona, ajustada por el clima (el calor extremo sube,
  // la lluvia y la tormenta enfrían) y un poco por el momento del día. Bajo techo, neutra.
  temperatura(E) {
    if (!E) return 0.5;
    if (this.esInterior(E)) return 0.5;
    let t = E.zonaActual ? (E.zonaActual.temp != null ? E.zonaActual.temp : 0.5) : 0.5;
    const ct = E.clima ? E.clima.tipo : 'despejado';
    if (ct === 'calor') t += 0.3; else if (ct === 'lluvia') t -= 0.15; else if (ct === 'tormenta') t -= 0.2; else if (ct === 'niebla') t -= 0.08;
    const h = U.Tiempo.hora(E); if (h >= 11 && h < 16) t += 0.06; if (h >= 21 || h < 5) t -= 0.08;
    return Math.max(0, Math.min(1, t));
  },
  // PRECIPITACIÓN 0..1: intensidad de lluvia / 4 afuera; bajo techo, 0 (no llueve dentro).
  precipitacion(E) { return this.intensidadDe(E) / 4; },
  // DATOS DEL RELOJ en unidades de verdad (los que muestra el panel al tocar el reloj):
  // todo sale de la misma simulación (temperatura 0..1 de la zona + clima + hora).
  grados(E) { return Math.round(-2 + this.temperatura(E) * 40); },
  humedad(E) { const z = E && E.zonaActual; let h = z && z.humedad != null ? z.humedad : 0.45; const ct = E && E.clima ? E.clima.tipo : 'despejado'; if (ct === 'lluvia') h = Math.max(h, 0.82); else if (ct === 'tormenta') h = Math.max(h, 0.92); else if (ct === 'niebla') h = Math.max(h, 0.85); else if (ct === 'calor') h = Math.min(h, 0.28); return Math.round(h * 100); },
  vientoKmh(E) { const z = E && E.zonaActual; let v = z && z.viento != null ? z.viento : 0.3; const ct = E && E.clima ? E.clima.tipo : 'despejado'; if (ct === 'viento') v = Math.max(v, 0.8); else if (ct === 'tormenta') v = Math.max(v, 0.9); else if (ct === 'lluvia') v = Math.max(v, 0.45); return Math.round(v * 55); },
  vientoNombre(kmh) { return kmh < 2 ? 'calmo' : kmh < 12 ? 'brisa ligera' : kmh < 25 ? 'brisa' : kmh < 40 ? 'viento moderado' : kmh < 55 ? 'viento fuerte' : 'vendaval'; },
  // SENSACIÓN TÉRMICA: con frío, el viento roba calor (fórmula de sensación por viento);
  // con calor, la humedad agobia y se siente más caliente que el termómetro.
  sensacion(E) { const t = this.grados(E), v = this.vientoKmh(E), h = this.humedad(E) / 100; let s = t; if (t <= 10 && v > 8) { const vp = Math.pow(v, 0.16); s = 13.12 + 0.6215 * t - 11.37 * vp + 0.3965 * t * vp; } else if (t >= 26) s = t + (h - 0.3) * 9 * Math.min(1, (t - 24) / 8); return Math.round(s); },
  // ¿El jugador está en un ambiente donde ABUNDA el agua? (junto a un río/estanque/oasis,
  // o en una zona de humedad altísima). Ahí el Agua paga decimales aunque no llueva.
  aguaAbundante(E) {
    if (!E || !E.jugador || !E.mapa) return false;
    const j = E.jugador, z = E.zonaActual;
    if (z && z.humedad >= 0.9) return true;
    const T = U.Grid.T, m = E.mapa;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = Math.floor(j.x) + dx, y = Math.floor(j.y) + dy;
      if (x >= 0 && y >= 0 && x < m.ancho && y < m.alto && m.tiles[y * m.ancho + x] === T.AGUA) return true;
    }
    return false;
  },
  // Factor NUMÉRICO completo (sin redondear: los costos ya viven en decimales): precipitación
  // + temperatura. Lo usan Ambiente.costo (técnicas) y el drenaje del escudo.
  factorNumerico(elem, E) {
    const inten = this.intensidadDe(E); const temp = this.temperatura(E); const razones = [];
    let m = 1, flat = null;
    if (inten > 0) {
      const nom = this.INTENSIDAD_NOMBRES[inten];
      if (elem === 'agua') {
        if (inten >= 3) { flat = 1; razones.push('Lluvia ' + nom + ': agua por todos lados, solo la controlas (costo 1)'); }
        else { m *= this.COSTOS_LLUVIA.agua[inten - 1]; razones.push('Lluvia ' + nom + ': el Agua paga menos (×' + this.COSTOS_LLUVIA.agua[inten - 1] + ')'); }
      } else {
        const tabla = this.COSTOS_LLUVIA[elem];
        if (tabla) { m *= tabla[inten - 1]; razones.push('Lluvia ' + nom + ' (×' + tabla[inten - 1] + ' para ' + U.Elementos.nombre(elem) + ')'); }
      }
    }
    if (flat == null && elem === 'agua' && this.aguaAbundante(E)) { m *= 0.15; razones.push('Agua por todos lados: pagas decimales (×0.15)'); }
    // Temperatura: el calor alimenta al Fuego y evapora el Agua; el frío, al revés.
    if (temp >= 0.75) {
      if (elem === 'fuego') { m *= 0.85; razones.push('Temperatura alta: el calor alimenta el Fuego (×0.85)'); }
      if (elem === 'agua') { m *= 1.25; razones.push('Temperatura alta: el calor evapora el Agua (×1.25)'); }
      if (elem === 'viento') { m *= 0.95; razones.push('Temperatura alta: el aire caliente se mueve (×0.95)'); }
    } else if (temp <= 0.25) {
      if (elem === 'fuego') { m *= 1.2; razones.push('Temperatura baja: el frío ahoga el Fuego (×1.2)'); }
      if (elem === 'agua') { m *= 0.9; razones.push('Temperatura baja: el Agua fluye densa y barata (×0.9)'); }
      if (elem === 'rayo') { m *= 0.95; razones.push('Temperatura baja: el aire frío conduce el Rayo (×0.95)'); }
    }
    return { m: m, flat: flat, razon: razones.join(' · '), temp: temp, precip: this.precipitacion(E) };
  },
  esInterior(E) { return !!(E && this.INTERIORES.indexOf(E.mapaId) >= 0); },
  // Intensidad que TE AFECTA: 0 bajo techo o sin lluvia; 1–3 en lluvia; 4 en tormenta.
  intensidadDe(E) {
    if (!E || !E.clima || this.esInterior(E)) return 0;
    if (E.clima.tipo === 'tormenta') return 4;
    if (E.clima.tipo === 'lluvia') return Math.max(1, Math.min(3, E.clima.intensidad || 2));
    return 0;
  },
  // Intensidad real del clima afuera (para nombrar el clima aunque estés bajo techo).
  intensidadGuardada(E) {
    if (!E || !E.clima) return 0;
    if (E.clima.tipo === 'tormenta') return 4;
    if (E.clima.tipo === 'lluvia') return Math.max(1, Math.min(3, E.clima.intensidad || 2));
    return 0;
  },
  // Compatibilidad: el factor de costo del clima es factorNumerico (precipitación + temperatura).
  factorCosto(elem, E) {
    const f = this.factorNumerico(elem, E);
    if (f.flat == null && Math.abs(f.m - 1) < 0.001) return null;
    return f;
  },
  crear(rng) { return { tipo: 'despejado', intensidad: 0, restante: 150 + (rng ? rng() * 90 : 60) }; },
  de(E) {
    const base = (E && E.clima && this.TIPOS[E.clima.tipo]) ? this.TIPOS[E.clima.tipo] : this.TIPOS.despejado;
    if (!E || !E.clima || (E.clima.tipo !== 'lluvia' && E.clima.tipo !== 'tormenta')) return base;
    const inten = this.intensidadGuardada(E); const nom = this.INTENSIDAD_NOMBRES[inten] || 'normal';
    if (this.esInterior(E)) return Object.assign({}, base, { nombre: base.nombre + (E.clima.tipo === 'lluvia' ? ' ' + nom : ''), detalle: 'Afuera: ' + base.nombre.toLowerCase() + (E.clima.tipo === 'lluvia' ? ' ' + nom : '') + ' · Bajo techo: aquí no llueve ni cambian los costos' });
    if (E.clima.tipo === 'tormenta') return Object.assign({}, base, { detalle: 'Tormenta (precipitación máxima) · Agua cuesta 1 · Rayo ×0.6 · Fuego ×2.5' });
    const f = this.COSTOS_LLUVIA.fuego[inten - 1];
    const fa = inten >= 3 ? 'Agua cuesta 1' : 'Agua ×' + this.COSTOS_LLUVIA.agua[inten - 1];
    return Object.assign({}, base, { nombre: 'Lluvia ' + nom, detalle: 'Lluvia ' + nom + ' · ' + fa + ' · Fuego ×' + f + ' · Tierra y Rayo bajan · Viento sube' });
  },
  elegir(E) {
    const h = U.Tiempo.hora(E); const z = E.zonaActual; const zid = z ? z.id : 'aldea';
    const pool = [['despejado', 30], ['nublado', 18], ['viento', 12]];
    if (zid === 'ribera' || zid === 'bosque') { pool.push(['lluvia', 20], ['niebla', 12], ['tormenta', 6]); }
    else if (zid === 'desierto' || zid === 'cenizar') { pool.push(['calor', 26], ['viento', 10]); }
    else if (zid === 'montana') { pool.push(['niebla', 18], ['lluvia', 10], ['tormenta', 8]); }
    else { pool.push(['lluvia', 12], ['niebla', 7], ['tormenta', 5], ['calor', 6]); }
    if (U.Tiempo.esNoche(h)) pool.push(['niebla', 10]);
    let tot = 0; pool.forEach(p => tot += p[1]); let r = Math.random() * tot;
    for (let i = 0; i < pool.length; i++) { r -= pool[i][1]; if (r <= 0) return pool[i][0]; }
    return 'despejado';
  },
  fijar(E, tipo, silencioso) {
    if (!E.clima) E.clima = this.crear(null);
    E.clima.tipo = tipo; E.clima.restante = 150 + Math.random() * 150;
    E.clima.intensidad = tipo === 'tormenta' ? 4 : tipo === 'lluvia' ? 1 + Math.floor(Math.random() * 3) : 0;
    if (!silencioso && U.HUD) { const c = this.TIPOS[tipo]; if (tipo === 'tormenta') U.HUD.banner('⛈ TORMENTA', 1.6); U.Audio.sfx(tipo === 'tormenta' ? 'rayo' : tipo === 'lluvia' ? 'agua' : 'zona'); }
    // Un vecino cercano comenta el clima EN VOZ ALTA, con su gusto personal (no todos igual).
    if (!silencioso && U.Juego && U.Juego.estado && U.General && !this.esInterior(U.Juego.estado)) { const E2 = U.Juego.estado; const cerca = (E2.npcs || []).filter(n => !n.enCasa && !n.ocultoSparring).sort((a, b) => U.Grid.dist(a, E2.jugador) - U.Grid.dist(b, E2.jugador))[0]; if (cerca && U.Grid.dist(cerca, E2.jugador) < 11) E2.efectos.textos.push({ x: cerca.x, y: cerca.y, txt: cerca.nombre + ': ' + U.General.fraseCortaClima(cerca, E2), color: '#e8dcc8', escala: 1, vida: 2.6, max: 2.6 }); }
  },
  alCambiarDia(E) { this.fijar(E, this.elegir(E), true); },
  actualizar(E, dt) {
    if (!E.clima) E.clima = this.crear(null);
    E.clima.restante -= dt;
    if (E.clima.restante <= 0) this.fijar(E, this.elegir(E));
  }
};
