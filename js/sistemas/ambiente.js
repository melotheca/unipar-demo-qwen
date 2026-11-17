/* === js/sistemas/ambiente.js === */
/* Unipar — ambiente: cada zona cambia el COSTO de Esencia automáticamente (favorable ×0.75, desfavorable ×1.5). Nunca bloquea tu elemento. */
window.U = window.U || {};

U.Ambiente = {
  zonaEn(x, y) { const zs = U.Juego.estado.mapa.zonas; for (let i = 0; i < zs.length; i++) { const z = zs[i]; if (x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h) return z; } return zs[zs.length - 1]; },
  modificador(elem, z) {
    if (!z) return { m: 1, razon: '' };
    switch (elem) {
      case 'agua': if (z.humedad >= 0.65) return { m: 0.75, razon: 'La humedad ayuda al Agua' }; if (z.humedad <= 0.3) return { m: 1.5, razon: 'El aire seco encarece el Agua' }; break;
      case 'fuego': if (z.temp >= 0.65) return { m: 0.75, razon: 'El calor alimenta el Fuego' }; if (z.temp <= 0.3 || z.humedad >= 0.8) return { m: 1.5, razon: 'El frío y la humedad ahogan el Fuego' }; break;
      case 'viento': if (z.viento >= 0.7 || z.abierto) return { m: 0.75, razon: 'Zona abierta: el Viento fluye' }; if (z.viento <= 0.25) return { m: 1.5, razon: 'Lugar cerrado: el Viento se encierra' }; break;
      case 'tierra': if (z.suelo === 'pavimento') return { m: 1.5, razon: 'Suelo cubierto: la Tierra responde peor' }; if (z.suelo === 'tierra' || z.suelo === 'arena') return { m: 0.75, razon: 'Suelo natural: la Tierra responde' }; break;
      case 'rayo': if (z.abierto && z.viento >= 0.6) return { m: 0.75, razon: 'Cielo abierto: el Rayo cae fácil' }; if (z.suelo === 'pavimento') return { m: 1.5, razon: 'Entre techos el Rayo cuesta más' }; break;
    }
    return { m: 1, razon: 'Ambiente neutro' };
  },
  // Factor numérico total SIN redondear (zona × clima): para drenajes y HUD.
  factorNumerico(elem, z, atributo) {
    const mod = this.modificador(elem, z); const a = U.Atributos.de(atributo);
    const E = U.Juego.estado; const ct = E && E.clima ? E.clima.tipo : null;
    let m = mod.m, razon = mod.razon;
    if (ct === 'viento' && elem === 'viento') m *= 0.85;
    const fc = (E && U.Clima && U.Clima.factorNumerico) ? U.Clima.factorNumerico(elem, E) : null;
    if (fc) {
      if (fc.flat != null) return { m: 0, flat: fc.flat, razon: fc.razon, atrib: a.costo === 'inestable' ? 1 : a.costo };
      m *= fc.m; if (fc.razon) razon = (razon && razon !== 'Ambiente neutro') ? razon + ' · ' + fc.razon : fc.razon;
    }
    return { m: m, flat: null, razon: razon, atrib: a.costo === 'inestable' ? 1 : a.costo };
  },
  // Costo final visible = base × ambiente × atributo. YA NO se redondea a enteros:
  // los costos viven en DECIMALES (2 decimales, mínimo 0.1) para que en ambientes
  // favorables la Esencia baje poquito a poquito. Inestable muestra rango, también decimal.
  costo(h, elem, z, atributo) {
    const f = this.factorNumerico(elem, z, atributo); const a = U.Atributos.de(atributo);
    if (f.flat != null) return { costo: f.flat, mod: 0, razon: f.razon, plano: true };
    const base = h.costo * f.m;
    const red = v => Math.round(v * 100) / 100;
    if (a.costo === 'inestable') return { costo: Math.max(0.1, red(base)), mod: f.m, razon: f.razon, inestable: true, min: Math.max(0.1, red(base * 0.5)), max: red(base * 2) };
    return { costo: Math.max(0.1, red(base * a.costo)), mod: f.m, razon: f.razon };
  },
  actualizar() {
    const E = U.Juego.estado, j = E.jugador; const z = this.zonaEn(j.x, j.y);
    if (z !== E.zonaActual) {
      E.zonaActual = z; U.Audio.ambiente(z); U.Audio.sfx('zona');
      const mod = this.modificador(j.elementoActivo, z);
      let txt = z.nombre + ' · ' + (mod.razon || 'ambiente neutro');
      U.HUD.toast(txt, mod.m < 1 ? 'exito' : mod.m > 1 ? 'aviso' : '');
      if (z.id === 'ribera') E.flags.visitoRibera = true; if (z.id === 'cenizar') E.flags.visitoCenizar = true; if (z.id === 'bosque' || z.id === 'campamento') E.flags.visitoBosque = true; if (z.id === 'desierto') E.flags.visitoDesierto = true; if (z.id === 'montana') E.flags.visitoMontana = true; if (z.id === 'casa') E.flags.visitoCasa = true;
    }
  }
};
