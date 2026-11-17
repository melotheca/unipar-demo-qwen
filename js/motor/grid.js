/* === js/motor/grid.js === */
/* Unipar — grid: mapa por semilla, colisiones y geometría de ataques (línea, cono, círculo, rect). 1 celda = 1 unidad. */
window.U = window.U || {};

U.Grid = {
  TILE: 16,
  T: { PASTO: 0, CAMINO: 1, AGUA: 2, ARENA: 3, CENIZA: 4, PIEDRA: 5, PUENTE: 6, SOTOBOSQUE: 7, DESIERTO: 8, NIEVE: 9, MONTANA: 10 },

  crearMapa(rng) {
    const W = 84, H = 62, T = this.T;
    const tiles = new Uint8Array(W * H), vari = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) { tiles[i] = T.PASTO; vari[i] = Math.floor(rng() * 4); }
    const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < W && y < H) tiles[y * W + x] = t; };
    const get = (x, y) => (x >= 0 && y >= 0 && x < W && y < H) ? tiles[y * W + x] : T.PASTO;

    // Río serpenteante (zona húmeda) con puente
    for (let y = 0; y < H; y++) { const cx = 30 + Math.round(Math.sin(y * 0.18) * 2); for (let x = cx - 1; x <= cx + 1; x++) set(x, y, T.AGUA); }
    for (let y = 23; y <= 25; y++) for (let x = 27; x <= 35; x++) set(x, y, T.PUENTE);
    // Campo de ceniza (zona caliente)
    for (let y = 4; y <= 20; y++) for (let x = 42; x <= 60; x++) if (rng() > 0.12) set(x, y, T.CENIZA);
    // Arena circular
    const AX = 50, AY = 34, AR = 7;
    for (let y = AY - AR; y <= AY + AR; y++) for (let x = AX - AR; x <= AX + AR; x++) if (Math.hypot(x - AX, y - AY) <= AR) set(x, y, T.ARENA);
    // Plaza de la aldea
    for (let y = 20; y <= 28; y++) for (let x = 12; x <= 20; x++) set(x, y, T.PIEDRA);
    // Caminos (en L)
    const camino = (x1, y1, x2, y2) => { let x = x1, y = y1; while (x !== x2) { if (get(x, y) !== T.AGUA) set(x, y, T.CAMINO); x += Math.sign(x2 - x); } while (y !== y2) { if (get(x, y) !== T.AGUA) set(x, y, T.CAMINO); y += Math.sign(y2 - y); } if (get(x, y) !== T.AGUA) set(x, y, T.CAMINO); };
    camino(20, 24, 27, 24); camino(35, 24, 43, 24); camino(43, 24, 43, 34); camino(43, 34, 49, 34); camino(46, 24, 46, 15); camino(16, 28, 16, 31);
    camino(20, 24, 80, 24); camino(16, 31, 16, 38); camino(16, 38, 22, 38); camino(24, 24, 24, 20); camino(43, 34, 66, 34); camino(66, 34, 66, 38); camino(58, 24, 58, 44);
    // EXPANSIÓN ESTE/SUR (+25% de mundo útil): cada zona elemental tiene su lugar real.
    camino(58, 44, 66, 44); camino(66, 44, 66, 52);
    for (let y = 47; y <= 55; y++) for (let x = 62; x <= 71; x++) if (Math.hypot((x - 66.5) / 4.6, (y - 51) / 4.1) <= 1) set(x, y, T.AGUA); // Lago del Sur (Agua)
    for (let y = 45; y <= 53; y++) for (let x = 74; x <= 82; x++) if (rng() > 0.15) set(x, y, T.CENIZA); // Suelo Quemado del Este (Fuego)
    for (let y = 56; y <= 60; y++) for (let x = 56; x <= 66; x++) if (rng() > 0.2) set(x, y, T.PIEDRA); // Zona Rocosa del Sur (Tierra)
    for (let y = 45; y <= 49; y++) for (let x = 52; x <= 58; x++) set(x, y, T.PASTO); // Acantilado de Viento (claro alto y abierto)
    for (let y = 33; y <= 39; y++) for (let x = 12; x <= 23; x++) if (get(x, y) !== T.AGUA) set(x, y, T.PIEDRA);
    // Sendero a la ENTRADA DEL BOSQUE (borde norte): al pisar el umbral cambias de mapa.
    camino(12, 22, 8, 22); camino(8, 22, 8, 1);

    const objetos = [];
    const obj = (tipo, x, y, w, h, solido, extra) => { const o = Object.assign({ tipo, x, y, w: w || 1, h: h || 1, solido: !!solido }, extra || {}); if (tipo === 'arbol') { o.vidaMax = 30; o.vida = 30; } else if (tipo === 'roca') { o.vidaMax = 55; o.vida = 55; } else if (tipo === 'cactus') { o.vidaMax = 22; o.vida = 22; } objetos.push(o); };
    // Aldea
    obj('casa', 9, 17, 3, 3, true, { techo: '#7c3b2e' }); obj('casa', 17, 16, 3, 3, true, { techo: '#5b4a8a' }); obj('casa', 9, 27, 3, 3, true, { techo: '#3b6b7c' });
    obj('casa', 24, 17, 3, 3, true, { techo: '#7c3b2e' }); obj('casa', 5, 36, 3, 3, true, { techo: '#5b4a8a' }); obj('casa', 26, 28, 3, 3, true, { techo: '#3b6b7c' }); obj('casa', 62, 16, 3, 3, true, { techo: '#7c3b2e' }); obj('casa', 68, 36, 3, 3, true, { techo: '#5b4a8a' }); obj('casa', 58, 44, 3, 3, true, { techo: '#3b6b7c' }); obj('casa', 72, 20, 3, 3, true, { techo: '#7c3b2e' });
    obj('oficina', 13, 34, 5, 4, true, { techo: '#d9a441' }); obj('puertaOficina', 15, 37, 1, 1, false); obj('tienda', 20, 34, 3, 3, true, { techo: '#2a7f5c' }); obj('puertaTienda', 21, 36, 1, 1, false);
    obj('cartel', 16, 33, 1, 1, true, { texto: 'OFICINA DEL GUARDIÁN DE BRUMA · El Guardián Aldric gobierna la aldea (como un Hokage o un Kamisama, pero de Bruma). Dentro, su secretaria Lía lleva el TABLÓN: 5 misiones nuevas cada día, por RANGO (D a S), pagadas solo por el rango. Entra por la puerta dorada. Al lado está la TIENDA de Marisol: pociones A MEDIDA (tú eliges las unidades), comida, polainas y el permiso de viajero.' });
    obj('fogata', 16, 24, 1, 1, true); obj('pozo', 19, 21, 1, 1, true); obj('puertaCasa', 10, 29, 1, 1, false); obj('cartel', 57, 24, 1, 1, true, { texto: 'CAMINO GRANDE DEL CONTINENTE · Al este, la METRÓPOLIS, la mega ciudad del centro. Al oeste y al sur de Bruma, el DESIERTO DE SAL: sol brutal, un oasis y espejismos que remapean tus controles al azar. Al noreste, pasando la Metrópolis, la MONTAÑA BRUMOSA y su obelisco; al este, cruzando el puente ancho del Río del Este, PUERTO BRISA AZUL. Todo es un solo mapa continuo: se llega caminando, sin entradas ni avisos, y también a campo traviesa.' }); obj('cartel', 46, 6, 1, 1, true, { texto: 'AL NORESTE, SIGUIENDO EL CAMINO: MONTAÑA BRUMOSA · Se llega caminando por el mapa continuo, sin transiciones. Arriba hay nieve, ilusionistas y un obelisco antiguo que enseña el Hechizo de Inversión.' }); obj('cartel', 9, 4, 1, 1, true, { texto: 'CAMINO AL BOSQUE SUSURRANTE · El sendero del noroeste lleva directo al bosque: todo es un solo mapa continuo, caminas y llegas, sin entradas ni avisos. Dentro ya no hay arena ni reglas: los bandidos salen de noche entre los árboles. Vuelve por el sur cuando quieras.' }); obj('cartel', 23, 24, 1, 1, true, { texto: 'ALDEA DE BRUMA · Al este, el puente lleva a la Ribera Húmeda: el Agua allí cuesta menos. Más al norte, el Campo de Ceniza: el Fuego respira y el Agua se encarece. La Arena está al sureste.' });
    obj('cartel', 40, 24, 1, 1, true, { texto: 'RIBERA HÚMEDA · La humedad abarata el Agua (−25%) y encarece el Fuego (+50%). Siempre puedes usar tu elemento: solo cambia el costo.' });
    obj('cartel', 59, 44, 1, 1, true, { texto: 'AL SUR Y AL ESTE, TIERRA NUEVA · El Lago del Sur (Agua cruza gratis; los demás gastan Esencia o rodean por tierra), el Suelo Quemado (el Fuego es inmune; los demás se queman), la Zona Rocosa de Tierra y el Acantilado de Viento (el Viento levita unos segundos). Todo se alcanza por caminos de tierra.' });
    obj('cartel', 45, 17, 1, 1, true, { texto: 'CAMPO DE CENIZA · Calor extremo: el Fuego cuesta −25%, el Agua +50%. El suelo seco no ayuda a la Tierra. Observa el costo ajustado en tu HUD.' });
    // Arena: reja con puerta al oeste + runa central
    for (let y = AY - AR - 1; y <= AY + AR + 1; y++) for (let x = AX - AR - 1; x <= AX + AR + 1; x++) { const d = Math.hypot(x - AX, y - AY); if (d > AR && d <= AR + 1.2 && !(x <= AX - AR && Math.abs(y - AY) <= 1)) obj('reja', x, y, 1, 1, true); }
    obj('runa', AX, AY, 1, 1, false);
    [[45, 8], [52, 10], [57, 15], [48, 17]].forEach(p => obj('brasero', p[0], p[1], 1, 1, true));
    // Naturaleza
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const t = get(x, y); const enAldea = x >= 7 && x <= 23 && y >= 15 && y <= 31; const cercaCamino = get(x + 1, y) === T.CAMINO || get(x - 1, y) === T.CAMINO || get(x, y + 1) === T.CAMINO || get(x, y - 1) === T.CAMINO;
      if (t === T.PASTO && !enAldea && !cercaCamino) { const r = rng(); if (r < 0.07) obj('arbol', x, y, 1, 1, true, { v: Math.floor(rng() * 2) }); else if (r < 0.095) obj('roca', x, y, 1, 1, true); else if (r < 0.16) obj('flor', x, y, 1, 1, false, { v: Math.floor(rng() * 3) }); }
      if (t === T.CENIZA && rng() < 0.035) obj('roca', x, y, 1, 1, true, { quemada: true });
      if (t === T.PASTO && (get(x + 1, y) === T.AGUA || get(x - 1, y) === T.AGUA) && rng() < 0.35) obj('junco', x, y, 1, 1, false);
    }
    // Colisiones
    const solidos = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) if (tiles[i] === T.AGUA) solidos[i] = 1;
    objetos.forEach(o => { if (o.solido) for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) if (x >= 0 && y >= 0 && x < W && y < H) solidos[y * W + x] = 1; });

    // Los puntos de llegada desde otros mapas (y el inicio) quedan siempre libres de sólidos
    [[16.5, 26.5], [8.5, 2.6], [61.5, 24.5], [47.5, 2.6], [10.5, 31.5]].forEach(p => { const cx = Math.floor(p[0]), cy = Math.floor(p[1]); for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) if (x >= 0 && y >= 0 && x < W && y < H && tiles[y * W + x] !== T.AGUA) solidos[y * W + x] = 0; for (let i = objetos.length - 1; i >= 0; i--) { const o = objetos[i]; if (o.solido && (o.tipo === 'arbol' || o.tipo === 'roca') && Math.abs(o.x + 0.5 - p[0]) < 1.6 && Math.abs(o.y + 0.5 - p[1]) < 1.6) objetos.splice(i, 1); } });
    // Zonas de ambiente (la primera que coincide gana; la última cubre todo)
    const zonas = [
      { id: 'aldea', nombre: 'Aldea de Bruma', x: 4, y: 12, w: 38, h: 32, humedad: 0.45, temp: 0.5, viento: 0.4, suelo: 'pavimento', icono: 'aldea', tinte: [255, 210, 140, 0.03] },
      { id: 'ribera', nombre: 'Ribera Húmeda', x: 26, y: 4, w: 14, h: 40, humedad: 0.92, temp: 0.42, viento: 0.5, suelo: 'tierra', icono: 'agua', tinte: [60, 160, 255, 0.07] },
      { id: 'cenizar', nombre: 'Campo de Ceniza', x: 42, y: 4, w: 19, h: 18, humedad: 0.08, temp: 0.95, viento: 0.55, suelo: 'ceniza', icono: 'fuego', tinte: [255, 120, 40, 0.09] },
      { id: 'arena', nombre: 'Arena de Ecos', x: 41, y: 25, w: 19, h: 19, humedad: 0.25, temp: 0.6, viento: 0.75, suelo: 'arena', abierto: true, icono: 'arena', tinte: [255, 220, 120, 0.04] },
      { id: 'lagoSur', nombre: 'Lago del Sur', x: 60, y: 44, w: 14, h: 14, humedad: 0.95, temp: 0.45, viento: 0.5, suelo: 'tierra', icono: 'agua', tinte: [60, 160, 255, 0.07] },
      { id: 'quemado', nombre: 'Suelo Quemado', x: 73, y: 44, w: 11, h: 11, humedad: 0.06, temp: 0.97, viento: 0.5, suelo: 'ceniza', icono: 'fuego', tinte: [255, 120, 40, 0.09] },
      { id: 'rocosa', nombre: 'Zona Rocosa', x: 55, y: 55, w: 13, h: 7, humedad: 0.3, temp: 0.5, viento: 0.45, suelo: 'tierra', icono: 'bosque', tinte: [150, 130, 90, 0.05] },
      { id: 'acantilado', nombre: 'Acantilado de Viento', x: 51, y: 44, w: 9, h: 7, humedad: 0.4, temp: 0.45, viento: 0.95, suelo: 'tierra', abierto: true, icono: 'arena', tinte: [126, 240, 192, 0.05] },
      { id: 'bosque', nombre: 'Bosque Susurrante', x: 0, y: 0, w: W, h: H, humedad: 0.55, temp: 0.4, viento: 0.22, suelo: 'tierra', icono: 'bosque', tinte: [40, 90, 60, 0.05] }
    ];
    return { id: 'aldea', nombreMapa: 'Aldea de Bruma', ancho: W, alto: H, tiles, vari, objetos, solidos, zonas, arena: { x: AX, y: AY, r: AR }, ocultarRuna: false, inicio: { x: 16.5, y: 26.5 }, spawns: [[46, 31], [54, 31], [50, 38], [46, 37], [54, 37]], npcs: { kaelen: { x: 21.5, y: 22.5 }, sora: { x: 14.5, y: 26.5 }, torin: { x: 11.5, y: 20.5 }, marisol: { x: 22.5, y: 32.5 }, breno: { x: 18.5, y: 29.5 }, elena: { x: 8.5, y: 24.5 }, marco: { x: 27.5, y: 22.5 }, pipo: { x: 15.5, y: 21.5 } },
      salidas: [{ x: 6.5, y: 0, w: 4, h: 1.4, destino: 'bosque', spawn: { x: 28.5, y: 52.5 }, etiqueta: 'Bosque Susurrante' },
        { x: 82.4, y: 21, w: 1.6, h: 6, destino: 'desierto', spawn: { x: 2.5, y: 21.5 }, etiqueta: 'Desierto de Sal' },
        { x: 44, y: 0, w: 7, h: 1.4, destino: 'montana', spawn: { x: 27.5, y: 39.5 }, etiqueta: 'Montaña Brumosa' }] };
  },

  /* Segundo mapa: el Bosque Susurrante. Otro grid, otro ambiente (cerrado, húmedo, frío:
     el Viento se encarece, el Fuego se ahoga un poco), bandidos en abierto y campamento al norte. */
  crearMapaBosque(rng) {
    const W = 72, H = 56, T = this.T;
    const tiles = new Uint8Array(W * H), vari = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) { tiles[i] = T.SOTOBOSQUE; vari[i] = Math.floor(rng() * 4); }
    const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < W && y < H) tiles[y * W + x] = t; };
    const get = (x, y) => (x >= 0 && y >= 0 && x < W && y < H) ? tiles[y * W + x] : T.SOTOBOSQUE;
    for (let i = 0; i < 260; i++) set(Math.floor(rng() * W), Math.floor(rng() * H), T.PASTO);
    const camino = (x1, y1, x2, y2) => { let x = x1, y = y1; while (x !== x2) { set(x, y, T.CAMINO); x += Math.sign(x2 - x); } while (y !== y2) { set(x, y, T.CAMINO); y += Math.sign(y2 - y); } set(x, y, T.CAMINO); };
    camino(28, 54, 28, 14); camino(28, 26, 43, 26); camino(43, 26, 43, 29);
    for (let y = 26; y <= 34; y++) for (let x = 39; x <= 47; x++) if (Math.hypot((x - 43) / 4.5, (y - 30) / 3.6) <= 1) set(x, y, T.AGUA);
    for (let y = 6; y <= 18; y++) for (let x = 20; x <= 36; x++) if (Math.hypot(x - 28, y - 12) <= 6.5) set(x, y, T.PASTO);
    for (let y = 10; y <= 14; y++) for (let x = 25; x <= 31; x++) set(x, y, T.ARENA);
    for (let y = 38; y <= 43; y++) for (let x = 24; x <= 32; x++) if (Math.hypot(x - 28, (y - 41) * 1.4) <= 5) set(x, y, T.PASTO);
    // Claro de la ENTRADA PRINCIPAL, pegado al borde sur: ahí está el umbral a la Aldea.
    for (let y = 47; y <= 55; y++) for (let x = 24; x <= 32; x++) if (Math.hypot(x - 28, (y - 52) * 1.4) <= 5) set(x, y, T.PASTO);
    const objetos = [];
    const obj = (tipo, x, y, w, h, solido, extra) => { const o = Object.assign({ tipo, x, y, w: w || 1, h: h || 1, solido: !!solido }, extra || {}); if (tipo === 'arbol') { o.vidaMax = 30; o.vida = 30; } else if (tipo === 'roca') { o.vidaMax = 55; o.vida = 55; } else if (tipo === 'cactus') { o.vidaMax = 22; o.vida = 22; } objetos.push(o); };
    obj('cartel', 30, 50, 1, 1, true, { texto: 'BOSQUE SUSURRANTE · Entrada principal, al sur del bosque. De día el bosque está tranquilo; de NOCHE salen los bandidos entre los árboles, sin campamento ni aviso, y al amanecer se retiran. El sendero va al norte; a mitad de camino, el ramal del este lleva al estanque. El sendero del sur vuelve caminando a la Aldea de Bruma: no hay puertas ni umbrales, todo es un solo mapa continuo.' });
    obj('cartel', 29, 13, 1, 1, true, { texto: 'CLARO DEL NORTE · Aquí no hay campamento: los bandidos no viven en el bosque, solo lo cruzan de noche para asaltar el sendero. Si oscurece, vuelve a la aldea o prepárate. El bosque cerrado encarece el Viento (×1.5) y la humedad ayuda al Agua.' });
    obj('fogata', 26, 51, 1, 1, true);
    obj('roca', 24, 10, 1, 1, true); obj('roca', 33, 16, 1, 1, true);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const t = get(x, y); const cercaCamino = get(x + 1, y) === T.CAMINO || get(x - 1, y) === T.CAMINO || get(x, y + 1) === T.CAMINO || get(x, y - 1) === T.CAMINO;
      const enClaro = (x >= 19 && x <= 37 && y >= 5 && y <= 19) || (x >= 23 && x <= 33 && y >= 37) || (x >= 23 && x <= 33 && y >= 46);
      if ((t === T.SOTOBOSQUE || t === T.PASTO) && !enClaro && !cercaCamino) { const r = rng(); if (r < 0.17) obj('arbol', x, y, 1, 1, true, { v: Math.floor(rng() * 2) }); else if (r < 0.20) obj('roca', x, y, 1, 1, true); else if (r < 0.26) obj('flor', x, y, 1, 1, false, { v: Math.floor(rng() * 3) }); }
      if (t === T.PASTO && (get(x + 1, y) === T.AGUA || get(x - 1, y) === T.AGUA || get(x, y + 1) === T.AGUA || get(x, y - 1) === T.AGUA) && rng() < 0.4) obj('junco', x, y, 1, 1, false);
    }
    // Borde sur cerrado: doble hilera de árboles en las dos últimas filas. El único
    // hueco es el sendero de la entrada principal (x 25–31), donde está el umbral a
    // la Aldea: ya no se puede bajar más allá ni rodear la salida por abajo.
    for (let x = 1; x < W - 1; x++) { if (x >= 25 && x <= 31) continue; obj('arbol', x, 54, 1, 1, true, { v: Math.floor(rng() * 2) }); obj('arbol', x, 55, 1, 1, true, { v: Math.floor(rng() * 2) }); }
    const solidos = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) if (tiles[i] === T.AGUA) solidos[i] = 1;
    objetos.forEach(o => { if (o.solido) for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) if (x >= 0 && y >= 0 && x < W && y < H) solidos[y * W + x] = 1; });
    // Los puntos de aparición de bandidos y la entrada quedan siempre libres de sólidos
    const spawnsBandidos = [[24.5, 16.5], [32.5, 16.5], [28.5, 21.5], [21.5, 27.5], [36.5, 24.5]];
    spawnsBandidos.concat([[28.5, 41.5], [28.5, 52.5]]).forEach(p => { const cx = Math.floor(p[0]), cy = Math.floor(p[1]); for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) if (x >= 0 && y >= 0 && x < W && y < H) solidos[y * W + x] = 0; for (let i = objetos.length - 1; i >= 0; i--) { const o = objetos[i]; if (o.solido && Math.abs(o.x + (o.w || 1) / 2 - p[0]) < 1.6 && Math.abs(o.y + (o.h || 1) / 2 - p[1]) < 1.6) objetos.splice(i, 1); } });
    const zonas = [
      { id: 'bosque', nombre: 'Bosque Susurrante', x: 0, y: 0, w: W, h: H, humedad: 0.62, temp: 0.35, viento: 0.15, suelo: 'tierra', icono: 'bosque', tinte: [20, 70, 40, 0.10] }
    ];
    return { id: 'bosque', nombreMapa: 'Bosque Susurrante', ancho: W, alto: H, tiles, vari, objetos, solidos, zonas, arena: { x: 28, y: 12, r: 5 }, ocultarRuna: true, inicio: { x: 28.5, y: 52.5 }, spawns: [], spawnsBandidos: [[24.5, 16.5], [32.5, 16.5], [28.5, 21.5], [21.5, 27.5], [36.5, 24.5]], npcs: {},
      salidas: [{ x: 25.5, y: 54.6, w: 6, h: 1.4, destino: 'aldea', spawn: { x: 8.5, y: 2.6 }, etiqueta: 'Aldea de Bruma' }] };
  },
  /* Tercer mapa: el Desierto de Sal. Calor extremo (el Fuego respira, el Agua se encarece),
     un oasis al noreste, cactus, y espejismos/ilusionistas que INVIERTEN tus controles. */
  crearMapaDesierto(rng) {
    const W = 74, H = 54, T = this.T;
    const tiles = new Uint8Array(W * H), vari = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) { tiles[i] = T.DESIERTO; vari[i] = Math.floor(rng() * 4); }
    const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < W && y < H) tiles[y * W + x] = t; };
    const get = (x, y) => (x >= 0 && y >= 0 && x < W && y < H) ? tiles[y * W + x] : T.DESIERTO;
    for (let y = 6; y <= 15; y++) for (let x = 40; x <= 50; x++) if (Math.hypot((x - 45) / 5.5, (y - 10) / 4.5) <= 1) set(x, y, T.AGUA);
    for (let y = 4; y <= 8; y++) for (let x = 38; x <= 52; x++) if (get(x, y) === T.DESIERTO && Math.hypot((x - 45) / 7.5, (y - 10) / 6) <= 1) set(x, y, T.PASTO);
    [[10, 30, 9, 6], [26, 12, 8, 5], [48, 28, 10, 7], [16, 6, 7, 4]].forEach(d => { for (let y = d[1]; y < d[1] + d[3]; y++) for (let x = d[0]; x < d[0] + d[2]; x++) if (rng() > 0.25) set(x, y, T.ARENA); });
    const camino = (x1, y1, x2, y2) => { let x = x1, y = y1; while (x !== x2) { if (get(x, y) !== T.AGUA) set(x, y, T.CAMINO); x += Math.sign(x2 - x); } while (y !== y2) { if (get(x, y) !== T.AGUA) set(x, y, T.CAMINO); y += Math.sign(y2 - y); } };
    camino(1, 21, 30, 21); camino(30, 21, 30, 11); camino(30, 11, 41, 11);
    const objetos = [];
    const obj = (tipo, x, y, w, h, solido, extra) => { const o = Object.assign({ tipo, x, y, w: w || 1, h: h || 1, solido: !!solido }, extra || {}); if (tipo === 'arbol') { o.vidaMax = 30; o.vida = 30; } else if (tipo === 'roca') { o.vidaMax = 55; o.vida = 55; } else if (tipo === 'cactus') { o.vidaMax = 22; o.vida = 22; } objetos.push(o); };
    obj('cartel', 4, 20, 1, 1, true, { texto: 'DESIERTO DE SAL · El calor alimenta al Fuego y seca el Agua. Al noreste hay un oasis. Cuidado con los espejismos: el Ilusionista del desierto lanza el Hechizo de Inversión y tu movimiento se remapea al azar unos segundos. El camino del este vuelve caminando a la Aldea de Bruma pasando el oasis, y la ruta del sur lleva a Aldea Raíz de Piedra y a Aldea Ceniza Viva: todo es un solo mapa continuo, sin transiciones.' });
    obj('cartel', 42, 14, 1, 1, true, { texto: 'OASIS · Agua en medio de la sal. Aquí la humedad ayuda a tu Agua aunque todo arda alrededor.' });
    obj('fogata', 28, 22, 1, 1, true);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const t = get(x, y); const cercaCamino = get(x + 1, y) === T.CAMINO || get(x - 1, y) === T.CAMINO || get(x, y + 1) === T.CAMINO || get(x, y - 1) === T.CAMINO;
      if ((t === T.DESIERTO || t === T.ARENA) && !cercaCamino) { const r = rng(); if (r < 0.05) obj('cactus', x, y, 1, 1, true); else if (r < 0.075) obj('roca', x, y, 1, 1, true); }
      if (t === T.PASTO && rng() < 0.3) obj('junco', x, y, 1, 1, false);
    }
    const solidos = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) if (tiles[i] === T.AGUA) solidos[i] = 1;
    objetos.forEach(o => { if (o.solido) for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) if (x >= 0 && y >= 0 && x < W && y < H) solidos[y * W + x] = 1; });
    [[2.5, 21.5], [20.5, 16.5], [34.5, 24.5], [24.5, 30.5], [45.5, 20.5]].forEach(p => { const cx = Math.floor(p[0]), cy = Math.floor(p[1]); for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) if (x >= 0 && y >= 0 && x < W && y < H && tiles[y * W + x] !== T.AGUA) solidos[y * W + x] = 0; for (let i = objetos.length - 1; i >= 0; i--) { const o = objetos[i]; if (o.solido && (o.tipo === 'cactus' || o.tipo === 'roca') && Math.abs(o.x + 0.5 - p[0]) < 1.6 && Math.abs(o.y + 0.5 - p[1]) < 1.6) objetos.splice(i, 1); } });
    const zonas = [
      { id: 'oasis', nombre: 'Oasis del Desierto', x: 36, y: 3, w: 18, h: 16, humedad: 0.85, temp: 0.6, viento: 0.4, suelo: 'tierra', icono: 'agua', tinte: [60, 160, 255, 0.05] },
      { id: 'desierto', nombre: 'Desierto de Sal', x: 0, y: 0, w: W, h: H, humedad: 0.05, temp: 1, viento: 0.6, suelo: 'arena', abierto: true, icono: 'arena', tinte: [255, 190, 90, 0.08] }
    ];
    return { id: 'desierto', nombreMapa: 'Desierto de Sal', ancho: W, alto: H, tiles, vari, objetos, solidos, zonas, arena: { x: 28, y: 30, r: 4 }, ocultarRuna: true, inicio: { x: 2.5, y: 21.5 }, spawns: [], spawnsAbiertos: [['brasa', 20.5, 16.5], ['ilusionista', 34.5, 24.5], ['bandido', 24.5, 30.5], ['ilusionista', 45.5, 20.5]], npcs: {},
      salidas: [{ x: 0, y: 19, w: 1.3, h: 6, destino: 'aldea', spawn: { x: 61.5, y: 24.5 }, etiqueta: 'Aldea de Bruma' }] };
  },
  /* Cuarto mapa: la Montaña Brumosa. Frío y viento abierto (el Rayo y el Viento respiran),
     nieve en la cima, ilusionistas y el OBELISCO que enseña el Hechizo de Inversión. */
  crearMapaMontana(rng) {
    const W = 68, H = 54, T = this.T;
    const tiles = new Uint8Array(W * H), vari = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) { tiles[i] = T.MONTANA; vari[i] = Math.floor(rng() * 4); }
    const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < W && y < H) tiles[y * W + x] = t; };
    const get = (x, y) => (x >= 0 && y >= 0 && x < W && y < H) ? tiles[y * W + x] : T.MONTANA;
    for (let y = 0; y <= 12; y++) for (let x = 0; x < W; x++) if (y < 10 + Math.sin(x * 0.3) * 2) set(x, y, T.NIEVE);
    for (let y = 30; y <= 41; y++) for (let x = 18; x <= 36; x++) if (rng() > 0.3) set(x, y, T.PASTO);
    const camino = (x1, y1, x2, y2) => { let x = x1, y = y1; while (y !== y2) { set(x, y, T.CAMINO); y += Math.sign(y2 - y); } while (x !== x2) { set(x, y, T.CAMINO); x += Math.sign(x2 - x); } set(x, y, T.CAMINO); };
    camino(27, 41, 27, 24); camino(27, 24, 20, 24); camino(20, 24, 20, 13);
    const objetos = [];
    const obj = (tipo, x, y, w, h, solido, extra) => { const o = Object.assign({ tipo, x, y, w: w || 1, h: h || 1, solido: !!solido }, extra || {}); if (tipo === 'arbol') { o.vidaMax = 30; o.vida = 30; } else if (tipo === 'roca') { o.vidaMax = 55; o.vida = 55; } else if (tipo === 'cactus') { o.vidaMax = 22; o.vida = 22; } objetos.push(o); };
    obj('cartel', 28, 38, 1, 1, true, { texto: 'MONTAÑA BRUMOSA · El viento abierto abarata el Viento y el Rayo; el frío ahoga el Fuego. Los Ilusionistas de la cima invierten tus controles con su hechizo. En la cima, el OBELISCO enseña ese mismo hechizo a quien lo toca: con V lo lanzas tú y los enemigos se mueven con un mapeo aleatorio.' });
    obj('obelisco', 20, 10, 1, 2, true);
    obj('cartel', 21, 13, 1, 1, true, { texto: 'OBELISCO DE LA INVERSIÓN · Tócalo para aprender el Hechizo de Inversión (tecla V, 12 de Esencia): los enemigos cercanos se mueven con un mapeo de direcciones ALEATORIO durante 6 segundos. Los Ilusionistas lo usan contra ti: si te alcanza, TU movimiento se remapea al azar unos segundos (ninguna dirección queda igual) y NO se muestra el mapeo: lo descubres probando.' });
    obj('fogata', 25, 36, 1, 1, true);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const t = get(x, y); const cercaCamino = get(x + 1, y) === T.CAMINO || get(x - 1, y) === T.CAMINO || get(x, y + 1) === T.CAMINO || get(x, y - 1) === T.CAMINO;
      if ((t === T.MONTANA || t === T.NIEVE) && !cercaCamino) { const r = rng(); if (r < 0.06) obj('roca', x, y, 1, 1, true); else if (r < 0.09 && t === T.MONTANA) obj('arbol', x, y, 1, 1, true, { v: 1 }); }
    }
    const solidos = new Uint8Array(W * H);
    objetos.forEach(o => { if (o.solido) for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) if (x >= 0 && y >= 0 && x < W && y < H) solidos[y * W + x] = 1; });
    [[20.5, 11.5], [27.5, 39.5]].forEach(p => { const cx = Math.floor(p[0]), cy = Math.floor(p[1]); for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) if (x >= 0 && y >= 0 && x < W && y < H && !(x === 20 && (y === 10 || y === 11))) solidos[y * W + x] = 0; });
    [[27.5, 39.5], [22.5, 16.5], [17.5, 20.5], [32.5, 26.5], [24.5, 30.5]].forEach(p => { const cx = Math.floor(p[0]), cy = Math.floor(p[1]); for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) if (x >= 0 && y >= 0 && x < W && y < H) solidos[y * W + x] = 0; for (let i = objetos.length - 1; i >= 0; i--) { const o = objetos[i]; if (o.solido && (o.tipo === 'roca' || o.tipo === 'arbol') && Math.abs(o.x + 0.5 - p[0]) < 1.6 && Math.abs(o.y + 0.5 - p[1]) < 1.6) objetos.splice(i, 1); } });
    const zonas = [ { id: 'montana', nombre: 'Montaña Brumosa', x: 0, y: 0, w: W, h: H, humedad: 0.3, temp: 0.15, viento: 0.9, suelo: 'tierra', abierto: true, icono: 'bosque', tinte: [160, 190, 230, 0.06] } ];
    return { id: 'montana', nombreMapa: 'Montaña Brumosa', ancho: W, alto: H, tiles, vari, objetos, solidos, zonas, arena: { x: 27, y: 20, r: 4 }, ocultarRuna: true, inicio: { x: 27.5, y: 39.5 }, spawns: [], spawnsAbiertos: [['ilusionista', 22.5, 16.5], ['ilusionista', 17.5, 20.5], ['chaman', 32.5, 26.5], ['veterano', 24.5, 30.5]], npcs: {},
      salidas: [{ x: 24.5, y: 40.6, w: 6, h: 1.4, destino: 'aldea', spawn: { x: 47.5, y: 2.6 }, etiqueta: 'Aldea de Bruma' }] };
  },
  /* Interior: TU CASA en la aldea. Cama con ALARMA programable: duermes hasta la hora fijada
     (100% Vida y Esencia) y el calendario avanza lo que toque. Se entra por la puerta de la casa azul. */
  crearMapaOficina(rng) {
    const W = 24, H = 16, T = this.T;
    const tiles = new Uint8Array(W * H), vari = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const borde = x === 0 || y === 0 || x === W - 1 || y === H - 1; tiles[y * W + x] = borde ? T.PIEDRA : T.CAMINO; vari[y * W + x] = Math.floor(rng() * 4); }
    for (let y = 4; y <= 9; y++) for (let x = 7; x <= 17; x++) tiles[y * W + x] = T.PIEDRA;
    const objetos = [];
    const obj = (tipo, x, y, w, h, solido, extra) => { const o = Object.assign({ tipo, x, y, w: w || 1, h: h || 1, solido: !!solido }, extra || {}); objetos.push(o); };
    obj('mesa', 10, 5, 4, 2, true); obj('brasero', 2, 2, 1, 1, true); obj('brasero', 21, 2, 1, 1, true);
    obj('cartel', 5, 2, 1, 1, true, { texto: 'OFICINA DEL GUARDIÁN · Aldric, Guardián de Bruma, vela por la aldea. Su secretaria Lía lleva el tablón de MISIONES: entregas, escoltas, búsquedas en el desierto y encargos de caza. Cada misión paga monedas al entregarla aquí. Con monedas compras pociones en la tienda de al lado.' });
    const solidos = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x === 0 || y === 0 || x === W - 1 || y === H - 1) solidos[y * W + x] = 1;
    solidos[15 * W + 11] = 0; solidos[15 * W + 12] = 0;
    objetos.forEach(o => { if (o.solido) for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) if (x >= 0 && y >= 0 && x < W && y < H) solidos[y * W + x] = 1; });
    const zonas = [ { id: 'oficina', nombre: 'Oficina del Guardián', x: 0, y: 0, w: W, h: H, humedad: 0.4, temp: 0.55, viento: 0.05, suelo: 'pavimento', icono: 'aldea', tinte: [255, 210, 140, 0.05] } ];
    return { id: 'oficina', nombreMapa: 'Oficina del Guardián', ancho: W, alto: H, tiles, vari, objetos, solidos, zonas, arena: { x: 12, y: 8, r: 3 }, ocultarRuna: true, inicio: { x: 11.5, y: 13.5 }, spawns: [], npcs: { aldric: { x: 12.5, y: 3.5 }, lia: { x: 8.5, y: 7.5 } },
      salidas: [{ x: 10, y: 14.4, w: 4, h: 1.6, destino: 'aldea', spawn: { x: 15.5, y: 39.5 }, etiqueta: 'Aldea de Bruma' }] };
  },
  crearMapaCasa(rng) {
    const W = 22, H = 16, T = this.T;
    const tiles = new Uint8Array(W * H), vari = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const borde = x === 0 || y === 0 || x === W - 1 || y === H - 1; tiles[y * W + x] = borde ? T.PIEDRA : T.CAMINO; vari[y * W + x] = Math.floor(rng() * 4); }
    for (let y = 5; y <= 10; y++) for (let x = 8; x <= 14; x++) tiles[y * W + x] = T.PIEDRA;
    const objetos = [];
    const obj = (tipo, x, y, w, h, solido, extra) => { const o = Object.assign({ tipo, x, y, w: w || 1, h: h || 1, solido: !!solido }, extra || {}); if (tipo === 'arbol') { o.vidaMax = 30; o.vida = 30; } else if (tipo === 'roca') { o.vidaMax = 55; o.vida = 55; } else if (tipo === 'cactus') { o.vidaMax = 22; o.vida = 22; } objetos.push(o); };
    obj('cama', 2, 2, 2, 1, true);
    obj('brasero', 19, 2, 1, 1, true);
    obj('cartel', 6, 2, 1, 1, true, { texto: 'TU CASA · La cama tiene despertador: tócala para dormir hasta la ALARMA que fijes (07:00 por defecto) con Vida y Esencia al 100%. El calendario avanza los días que duermas. El COFRE junto al brasero es tu ALMACENAMIENTO: guarda ahí máscaras, artefactos y pergaminos de técnicas prohibidas — guardados no dan bonus, pero tampoco atraen a Los Coleccionistas. La puerta del sur te devuelve a la aldea.' });
    obj('pozo', 18, 12, 1, 1, true);
    obj('cofre', 16, 2, 1, 1, true);
    const solidos = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x === 0 || y === 0 || x === W - 1 || y === H - 1) solidos[y * W + x] = 1;
    solidos[15 * W + 10] = 0; solidos[15 * W + 11] = 0;
    objetos.forEach(o => { if (o.solido) for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) if (x >= 0 && y >= 0 && x < W && y < H) solidos[y * W + x] = 1; });
    const zonas = [ { id: 'casa', nombre: 'Tu casa', x: 0, y: 0, w: W, h: H, humedad: 0.4, temp: 0.55, viento: 0.05, suelo: 'pavimento', icono: 'aldea', tinte: [255, 200, 130, 0.05] } ];
    return { id: 'casa', nombreMapa: 'Tu casa', ancho: W, alto: H, tiles, vari, objetos, solidos, zonas, arena: { x: 11, y: 8, r: 3 }, ocultarRuna: true, inicio: { x: 10.5, y: 13.5 }, spawns: [], npcs: {},
      // Salida por la puerta del sur: el destino es el mapa CONTINUO, así que el punto de
      // llegada va en coordenadas del continente: la puerta exterior de tu casa (la azul,
      // en la aldea pegada con desplazamiento 134,222) está en (144,251) y apareces justo
      // al sur de ella, en (144.5, 253.5) — el antiguo (10.5, 31.5) eran coordenadas del
      // submapa de la aldea y caían fuera del pueblo en el mapa continuo.
      salidas: [{ x: 9, y: 14.4, w: 4, h: 1.6, destino: 'aldea', spawn: { x: 144.5, y: 253.5 }, etiqueta: 'Aldea de Bruma' }] };
  },
  /* MAPA CONTINUO — EL CONTINENTE DE BRUMA: un solo mapa al aire libre de 440×400,
     rodeado de AGUA por los cuatro bordes (el borde del mundo es mar: no se puede salir
     del continente). Acomodo RADIAL: la METRÓPOLIS (la mega ciudad central, la más grande
     y tecnológica) está en el CENTRO (220,200); a su alrededor, LEJOS y en distintas
     direcciones, las aldeas elementales: Puerto Brisa Azul (Agua) al ESTE, Aldea Ceniza
     Viva (Fuego) al SURESTE, Aldea Raíz de Piedra (Tierra) al SUROESTE, Aldea Vuelo Alto
     (Viento) al NORTE y Aldea Chispa Alta (Rayo) al NORESTE; más lejos, al OESTE, ARCANA,
     la metrópolis pequeña de los magos. La Aldea de Bruma (inicio) queda cerca de la
     Metrópolis, al suroeste de ella. Entre todo: el Bosque Susurrante (noroeste), la
     Montaña Brumosa (noreste), el Desierto de Sal (oeste-sur), el Río del Este, el Lago
     Brisa Azul, la Laguna Serena, SEIS pueblos pequeños y lugares con fogatas y carteles,
     para que el viaje nunca sea caminar por nada vacío. Hay caminos que cosen todo
     (espinas radiales + anillo + rutas cruzadas: a cada aldea se llega por MÁS de un
     camino), pero el jugador puede ir a campo traviesa en cualquier dirección: no hay
     un camino único. El mapa es FIJO, el mismo para todos (la generación procedural
     sigue cancelada): se compone pegando los generadores de siempre con un
     desplazamiento sobre una sola cuadrícula y construyendo encima los asentamientos
     nuevos. NO hay salidas ni umbrales al aire libre: solo los interiores (tu casa y la
     Oficina) siguen siendo mapas aparte con su puerta. La RAM no es problema: la
     cuadrícula entera son 176 000 celdas (unos cientos de KB) y el render solo dibuja
     la vista, así que no hace falta precargar nada como en el GBA. */
  crearMapaContinuo(rng) {
    const T = this.T, W = 440, H = 400;
    const tiles = new Uint8Array(W * H), vari = new Uint8Array(W * H);
    const solidos = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) { tiles[i] = T.AGUA; solidos[i] = 1; vari[i] = Math.floor(rng() * 4); }
    // set() mantiene solidos al día con el terreno nuevo (el agua bloquea; lo demás libera).
    const set = (x, y, tt) => { if (x >= 0 && y >= 0 && x < W && y < H) { tiles[y * W + x] = tt; solidos[y * W + x] = tt === T.AGUA ? 1 : 0; } };
    const get = (x, y) => (x >= 0 && y >= 0 && x < W && y < H) ? tiles[y * W + x] : T.AGUA;
    // --- LA COSTA: superelipse alrededor del centro; fuera de ella, mar abierto. ---
    const CX = 220, CY = 200;
    const enContinente = (x, y) => { const dx = Math.abs(x - CX) / 214, dy = Math.abs(y - CY) / 186; const v = Math.pow(dx, 4) + Math.pow(dy, 4); return v < 1 + Math.sin(x * 0.11) * Math.cos(y * 0.13) * 0.06; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (enContinente(x, y)) set(x, y, T.PASTO);
    // --- Las regiones de siempre, pegadas con su desplazamiento nuevo ---
    const OFF = { aldea: { x: 134, y: 222 }, bosque: { x: 40, y: 44 }, desierto: { x: 44, y: 244 }, montana: { x: 300, y: 36 } };
    const objetos = [];
    const obj = (tipo, x, y, w, h, solido, extra) => { const o = Object.assign({ tipo, x, y, w: w || 1, h: h || 1, solido: !!solido }, extra || {}); if (tipo === 'arbol') { o.vidaMax = 30; o.vida = 30; } else if (tipo === 'roca') { o.vidaMax = 55; o.vida = 55; } else if (tipo === 'cactus') { o.vidaMax = 22; o.vida = 22; } objetos.push(o); if (o.solido) for (let yy = o.y; yy < o.y + o.h; yy++) for (let xx = o.x; xx < o.x + o.w; xx++) if (xx >= 0 && yy >= 0 && xx < W && yy < H) solidos[yy * W + xx] = 1; };
    const zonas = []; const npcsPos = {};
    const blit = (sub, off, esAldea) => {
      for (let y = 0; y < sub.alto; y++) for (let x = 0; x < sub.ancho; x++) { const si = y * sub.ancho + x, di = (y + off.y) * W + (x + off.x); tiles[di] = sub.tiles[si]; vari[di] = sub.vari[si]; solidos[di] = sub.solidos[si]; }
      sub.objetos.forEach(o => objetos.push(Object.assign({}, o, { x: o.x + off.x, y: o.y + off.y })));
      (sub.zonas || []).forEach(z => { const nz = Object.assign({}, z, { x: z.x + off.x, y: z.y + off.y }); if (esAldea && z.id === 'bosque') { nz.id = 'campos'; nz.nombre = 'Campos de Bruma'; } zonas.push(nz); });
      if (sub.npcs) for (const id in sub.npcs) npcsPos[id] = { x: sub.npcs[id].x + off.x, y: sub.npcs[id].y + off.y };
    };
    const mAldea = this.crearMapa(rng), mBosque = this.crearMapaBosque(rng), mDes = this.crearMapaDesierto(rng), mMon = this.crearMapaMontana(rng);
    blit(mBosque, OFF.bosque, false); blit(mMon, OFF.montana, false); blit(mAldea, OFF.aldea, true); blit(mDes, OFF.desierto, false);
    const pav = (x0, y0, x1, y1, tt) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (get(x, y) !== T.AGUA || tt === T.AGUA) set(x, y, tt); };
    // --- Río del Este: nace al norte, pasa al oeste de Puerto Brisa Azul, se curva al
    // lago y sigue al sur por la Tierra Quemada. La Laguna Serena queda al sur. ---
    for (let y = 52; y <= 336; y++) { let cx; if (y <= 214) cx = 334 + Math.round(Math.sin(y * 0.045) * 2); else if (y <= 245) cx = 336 + Math.round((y - 214) * 12 / 31); else cx = 348 + Math.round(Math.sin(y * 0.05) * 2); for (let x = cx - 1; x <= cx + 1; x++) set(x, y, T.AGUA); }
    for (let y = 222; y <= 244; y++) for (let x = 347; x <= 389; x++) if (Math.hypot((x - 368) / 21, (y - 233) / 11) <= 1) set(x, y, T.AGUA); // Lago Brisa Azul
    for (let y = 312; y <= 328; y++) for (let x = 233; x <= 263; x++) if (Math.hypot((x - 248) / 15, (y - 320) / 8) <= 1) set(x, y, T.AGUA); // Laguna Serena
    // --- Tierra Quemada del sureste (suelo de Aldea Ceniza Viva) ---
    for (let y = 280; y <= 354; y++) for (let x = 290; x <= 386; x++) if (get(x, y) !== T.AGUA && rng() > 0.12) set(x, y, T.CENIZA);
    // --- Caminos que cosen el continente (sobre el agua dejan PUENTE de madera) ---
    const camino = (x1, y1, x2, y2) => { let x = x1, y = y1; const paso = () => { const tt = get(x, y); if (tt === T.AGUA) set(x, y, T.PUENTE); else set(x, y, T.CAMINO); }; paso(); while (x !== x2) { x += Math.sign(x2 - x); paso(); } while (y !== y2) { y += Math.sign(y2 - y); paso(); } };
    // Espinas radiales desde la Metrópolis
    camino(220, 170, 220, 82);                                       // N: Metrópolis → Aldea Vuelo Alto
    camino(246, 176, 252, 176); camino(252, 176, 252, 116);         // NE: → Pueblo Rocafirme
    camino(252, 116, 300, 116); camino(300, 116, 300, 84); camino(300, 84, 327, 84); camino(327, 84, 327, 76); // NE: → Montaña Brumosa (obelisco)
    camino(300, 116, 340, 116); camino(340, 116, 340, 120); camino(340, 120, 364, 120); // NE: → Aldea Chispa Alta (Rayo)
    camino(368, 96, 384, 96); camino(384, 96, 384, 102);            // Montaña → Chispa Alta (segunda ruta al Rayo)
    camino(254, 196, 346, 196);                                     // E: Metrópolis → Puerto Brisa Azul (cruza el río por el puente)
    camino(300, 116, 300, 196);                                     // anillo este interior: Rocafirme → Tres Cruces → camino del este
    camino(238, 224, 292, 224); camino(292, 224, 292, 262);         // SE: → Pueblo Brasa Chica
    camino(292, 262, 330, 262); camino(330, 262, 330, 296);         // SE: → Aldea Ceniza Viva
    camino(376, 216, 376, 296); camino(376, 296, 348, 296);         // ruta del este: Puerto → lago → Ceniza Viva (segunda ruta al Fuego)
    camino(220, 228, 220, 268); camino(220, 268, 246, 268);         // S: → Pueblo Vega Baja
    camino(246, 268, 292, 268); camino(292, 268, 292, 262);         // anillo sur: Vega Baja ↔ Brasa Chica
    camino(220, 268, 220, 300); camino(220, 300, 164, 300); camino(164, 300, 164, 312); // S: → Aldea Raíz de Piedra (Tierra)
    camino(220, 300, 220, 306); camino(220, 306, 312, 306);         // ruta del sur: → Ceniza Viva por el sur (tercera ruta al Fuego)
    camino(196, 224, 196, 246); camino(196, 246, 152, 246);         // SO: Metrópolis → Aldea de Bruma (entra por su camino grande)
    camino(188, 196, 88, 196); camino(88, 196, 88, 206);            // O: → Pueblo Salina
    camino(88, 196, 88, 168); camino(88, 168, 86, 168);             // O: → Arcana, la ciudad de los magos
    // Conexiones entre regiones (el viaje nunca depende de un solo camino)
    camino(150, 260, 150, 272); camino(150, 272, 96, 272); camino(96, 272, 96, 252);   // Bruma → Desierto de Sal (al oasis)
    camino(96, 290, 96, 306); camino(96, 306, 220, 306);            // Desierto → ruta del sur (a Raíz y a Ceniza)
    camino(200, 306, 200, 318); camino(200, 318, 170, 318);         // ruta del sur → Aldea Raíz de Piedra (segunda ruta a Tierra)
    camino(64, 178, 64, 220); camino(64, 220, 80, 220); camino(80, 220, 80, 244);     // Arcana → Desierto por la costa oeste
    camino(88, 214, 88, 236); camino(88, 236, 80, 236);             // Salina → Desierto (tercera entrada al desierto)
    camino(150, 222, 150, 140); camino(150, 140, 140, 140); camino(140, 140, 140, 122); // Bruma → Pueblo Alto Pino
    camino(140, 122, 104, 122); camino(104, 122, 104, 98); camino(104, 98, 68, 98);    // Alto Pino → Bosque Susurrante (entrada sur)
    camino(140, 112, 140, 84); camino(140, 84, 196, 84);            // Alto Pino → Vuelo Alto (anillo noroeste)
    camino(238, 84, 252, 84); camino(252, 84, 252, 116);            // Vuelo Alto → Rocafirme (anillo norte)
    camino(196, 64, 114, 64);                                       // Vuelo Alto → Bosque por el norte (segunda ruta al bosque)
    // El puente del camino del este queda ANCHO (6 baldosas): la escolta y los vecinos
    // cruzan el Río del Este sin tener que atinarle a una sola fila.
    for (let y = 192; y <= 200; y++) for (let x = 326; x <= 344; x++) if (get(x, y) === T.AGUA) set(x, y, T.PUENTE);
    // ================================================================
    // LA METRÓPOLIS — la mega ciudad central: suelo de piedra, calles, muchos
    // edificios, su TIENDA DE POCIONES propia y peleadores de todas las aldeas.
    // ================================================================
    pav(188, 170, 254, 228, T.PIEDRA);
    pav(202, 182, 238, 218, T.PIEDRA);
    for (let x = 188; x <= 254; x++) { set(x, 199, T.CAMINO); set(x, 200, T.CAMINO); }
    for (let y = 170; y <= 228; y++) { set(219, y, T.CAMINO); set(220, y, T.CAMINO); }
    [[192, 172], [200, 172], [208, 172], [228, 172], [242, 172], [248, 180], [248, 190], [248, 204], [248, 214], [242, 222], [228, 222], [208, 222], [200, 222], [192, 222], [190, 214], [190, 204], [190, 190], [190, 180]].forEach(p => obj('casa', p[0], p[1], 3, 3, true, { techo: ['#7c3b2e', '#5b4a8a', '#3b6b7c'][Math.floor(rng() * 3)] }));
    obj('tienda', 234, 174, 3, 3, true, { techo: '#2a7f5c' }); obj('puertaTienda', 235, 176, 1, 1, false, { dueno: 'la Boticaria de la Metrópolis' });
    obj('fogata', 219, 207, 1, 1, true); obj('pozo', 210, 190, 1, 1, true);
    obj('brasero', 204, 184, 1, 1, true); obj('brasero', 236, 184, 1, 1, true); obj('brasero', 204, 216, 1, 1, true); obj('brasero', 236, 216, 1, 1, true);
    obj('cartel', 220, 184, 1, 1, true, { texto: 'LA METRÓPOLIS · La mega ciudad del centro del continente: la más grande, la más avanzada, la de los edificios altos y las calles de piedra. Aquí se cruzan peleadores de TODAS las aldeas, se habla de torneos y se comercia con todo el continente. Tiene su propia TIENDA DE POCIONES (al norte de la plaza). Alrededor, lejos, irradian las aldeas elementales: Vuelo Alto (Viento) al norte, Chispa Alta (Rayo) al noreste, Puerto Brisa Azul (Agua) al este, Ceniza Viva (Fuego) al sureste, Raíz de Piedra (Tierra) al suroeste y Arcana, la ciudad de los magos, al oeste. La Aldea de Bruma queda cerca, al suroeste: es la aldea de inicio.' });
    obj('cartel', 196, 196, 1, 1, true, { texto: 'PUERTA OESTE DE LA METRÓPOLIS · Al oeste: Pueblo Salina y, más lejos, ARCANA, la pequeña metrópolis de los magos, sobre la costa. Al suroeste, la Aldea de Bruma. Todo el borde del continente es mar: el mundo se acaba en el agua.' });
    obj('cartel', 244, 222, 1, 1, true, { texto: 'PUERTA SURESTE DE LA METRÓPOLIS · Al sureste, Pueblo Brasa Chica y Aldea Ceniza Viva (Fuego). Al sur, Pueblo Vega Baja y Aldea Raíz de Piedra (Tierra). Al este, cruzando el puente del Río del Este, Puerto Brisa Azul (Agua). Los caminos ayudan, pero el continente es libre: puedes ir a campo traviesa por donde quieras.' });
    // ================================================================
    // PUERTO BRISA AZUL (Agua) — al este, junto al Lago Brisa Azul
    // ================================================================
    pav(348, 180, 390, 212, T.PIEDRA);
    camino(368, 212, 368, 222); for (let y = 223; y <= 240; y++) set(368, y, T.PUENTE); // muelle sobre el lago
    obj('casa', 350, 182, 3, 3, true, { techo: '#3b6b7c' }); obj('casa', 358, 180, 3, 3, true, { techo: '#2a7f5c' }); obj('casa', 378, 182, 3, 3, true, { techo: '#3b6b7c' }); obj('casa', 386, 188, 3, 3, true, { techo: '#5b4a8a' }); obj('casa', 352, 204, 3, 3, true, { techo: '#3b6b7c' }); obj('casa', 386, 204, 3, 3, true, { techo: '#2a7f5c' });
    obj('tienda', 366, 180, 3, 3, true, { techo: '#2a7f5c' }); obj('puertaTienda', 367, 182, 1, 1, false, { dueno: 'la Boticaria del Puerto' });
    obj('casa', 380, 206, 3, 3, true, { techo: '#7c3b2e' }); obj('puertaRenta', 381, 208, 1, 1, false, { pueblo: 'Puerto Brisa Azul' });
    obj('fogata', 374, 202, 1, 1, true); obj('pozo', 356, 192, 1, 1, true);
    obj('cartel', 360, 196, 1, 1, true, { texto: 'PUERTO BRISA AZUL · Aldea de Agua, a la orilla del Lago Brisa Azul. Aquí el Agua respira: cuesta menos y cruza gratis. Nami pesca en el muelle y Orin cuida la orilla. Tiene tienda de pociones. Al oeste, el puente ancho cruza el Río del Este y el camino lleva a la Metrópolis; también puedes rodear el lago o ir a campo traviesa.' });
    obj('cartel', 368, 220, 1, 1, true, { texto: 'LAGO BRISA AZUL · El lago grande del este. El Río del Este lo alimenta desde el norte y sigue hacia el sur, hasta perderse en la Tierra Quemada. Desde el muelle se pesca y se mira el agua; cruzarlo ya es cosa de tu elemento (o de tu botón de caminar sobre el agua).' });
    npcsPos.nami = { x: 364.5, y: 198.5 }; npcsPos.orin = { x: 362.5, y: 200.5 };
    // ================================================================
    // ALDEA CENIZA VIVA (Fuego) — al sureste, sobre la Tierra Quemada
    // ================================================================
    pav(312, 296, 348, 328, T.PIEDRA);
    obj('casa', 316, 300, 3, 3, true, { techo: '#7c3b2e' }); obj('casa', 338, 300, 3, 3, true, { techo: '#8a4a2a' }); obj('casa', 316, 320, 3, 3, true, { techo: '#7c3b2e' }); obj('casa', 340, 318, 3, 3, true, { techo: '#8a4a2a' });
    obj('tienda', 326, 298, 3, 3, true, { techo: '#2a7f5c' }); obj('puertaTienda', 327, 300, 1, 1, false, { dueno: 'el Boticario de Ceniza Viva' });
    obj('casa', 342, 320, 3, 3, true, { techo: '#7c3b2e' }); obj('puertaRenta', 343, 322, 1, 1, false, { pueblo: 'Aldea Ceniza Viva' });
    obj('brasero', 320, 304, 1, 1, true); obj('brasero', 344, 304, 1, 1, true); obj('brasero', 320, 324, 1, 1, true); obj('brasero', 344, 324, 1, 1, true); obj('fogata', 330, 306, 1, 1, true);
    obj('cartel', 330, 310, 1, 1, true, { texto: 'ALDEA CENIZA VIVA · Aldea de Fuego, levantada sobre la Tierra Quemada del sureste. Aquí el Fuego cuesta menos y la ceniza no quema a los suyos; a los demás sí (3 de Vida por segundo sobre ceniza). Zara guarda las brasas y Varek trabaja su forja de ceniza. Tiene tienda de pociones. Se llega por el camino del sureste, por la ruta del este bajando del lago, o por la ruta del sur desde el Desierto: hay más de un camino.' });
    npcsPos.zara = { x: 330.5, y: 312.5 }; npcsPos.varek = { x: 322.5, y: 320.5 };
    // Gente de las tramas abiertas (investigadora, víctima, cazadora, informante, anticuaria y el del guante negro)
    npcsPos.vera = { x: 224.5, y: 192.5 }; npcsPos.milo = { x: 214.5, y: 206.5 };
    npcsPos.bram = { x: 150.5, y: 246.5 }; npcsPos.dario = { x: 297.5, y: 171.5 };
    npcsPos.sana = { x: 374.5, y: 216.5 }; npcsPos.petra = { x: 68.5, y: 162.5 };
    // ================================================================
    // ALDEA VUELO ALTO (Viento) — al norte, en la meseta ventosa
    // ================================================================
    pav(204, 56, 230, 74, T.PIEDRA);
    obj('casa', 200, 54, 3, 3, true, { techo: '#3b6b7c' }); obj('casa', 226, 54, 3, 3, true, { techo: '#5b4a8a' }); obj('casa', 200, 70, 3, 3, true, { techo: '#5b4a8a' }); obj('casa', 228, 70, 3, 3, true, { techo: '#3b6b7c' });
    obj('tienda', 210, 52, 3, 3, true, { techo: '#2a7f5c' }); obj('puertaTienda', 211, 54, 1, 1, false, { dueno: 'la Boticaria de Vuelo Alto' });
    obj('casa', 232, 58, 3, 3, true, { techo: '#7c3b2e' }); obj('puertaRenta', 233, 60, 1, 1, false, { pueblo: 'Aldea Vuelo Alto' });
    obj('fogata', 216, 60, 1, 1, true); obj('pozo', 222, 68, 1, 1, true);
    obj('cartel', 216, 76, 1, 1, true, { texto: 'ALDEA VUELO ALTO · Aldea de Viento, en la meseta abierta del norte: aquí el Viento fluye y cuesta menos. Tiene tienda de pociones. Al sur, el camino baja directo a la Metrópolis; al oeste, el anillo lleva a Pueblo Alto Pino y al Bosque Susurrante; al este, a Pueblo Rocafirme y a la Montaña Brumosa.' });
    // ================================================================
    // ALDEA CHISPA ALTA (Rayo) — al noreste, tierra de tormentas
    // ================================================================
    pav(372, 110, 398, 130, T.PIEDRA);
    obj('casa', 368, 108, 3, 3, true, { techo: '#5b4a8a' }); obj('casa', 392, 108, 3, 3, true, { techo: '#3b6b7c' }); obj('casa', 368, 126, 3, 3, true, { techo: '#3b6b7c' }); obj('casa', 394, 124, 3, 3, true, { techo: '#5b4a8a' });
    obj('tienda', 378, 106, 3, 3, true, { techo: '#2a7f5c' }); obj('puertaTienda', 379, 108, 1, 1, false, { dueno: 'el Boticario de Chispa Alta' });
    obj('casa', 396, 116, 3, 3, true, { techo: '#7c3b2e' }); obj('puertaRenta', 397, 118, 1, 1, false, { pueblo: 'Aldea Chispa Alta' });
    obj('fogata', 384, 116, 1, 1, true); obj('pozo', 374, 124, 1, 1, true);
    obj('cartel', 384, 132, 1, 1, true, { texto: 'ALDEA CHISPA ALTA · Aldea de Rayo, en la tierra abierta de tormentas del noreste: cielo abierto, el Rayo cae fácil. Tiene tienda de pociones. Al oeste queda la Montaña Brumosa y su obelisco; al suroeste, el camino de Pueblo Rocafirme baja a la Metrópolis.' });
    // ================================================================
    // ALDEA RAÍZ DE PIEDRA (Tierra) — al suroeste, entre rocas
    // ================================================================
    pav(136, 320, 162, 340, T.PIEDRA);
    obj('casa', 134, 318, 3, 3, true, { techo: '#7c3b2e' }); obj('casa', 156, 318, 3, 3, true, { techo: '#5b4a8a' }); obj('casa', 134, 336, 3, 3, true, { techo: '#3b6b7c' }); obj('casa', 158, 334, 3, 3, true, { techo: '#7c3b2e' });
    obj('tienda', 142, 316, 3, 3, true, { techo: '#2a7f5c' }); obj('puertaTienda', 143, 318, 1, 1, false, { dueno: 'la Boticaria de Raíz de Piedra' });
    obj('casa', 160, 324, 3, 3, true, { techo: '#5b4a8a' }); obj('puertaRenta', 161, 326, 1, 1, false, { pueblo: 'Aldea Raíz de Piedra' });
    obj('fogata', 148, 326, 1, 1, true); obj('pozo', 138, 330, 1, 1, true);
    obj('cartel', 148, 342, 1, 1, true, { texto: 'ALDEA RAÍZ DE PIEDRA · Aldea de Tierra, entre rocas del suroeste: suelo natural, la Tierra responde fuerte. Tiene tienda de pociones. Al norte, el camino sube a la Metrópolis pasando por Pueblo Vega Baja; al este, la ruta del sur lleva al Desierto de Sal y a Ceniza Viva; al noreste queda la Laguna Serena.' });
    // ================================================================
    // ARCANA — la metrópolis pequeña de los magos, lejos al oeste
    // ================================================================
    pav(46, 144, 84, 174, T.PIEDRA);
    obj('casa', 48, 146, 3, 3, true, { techo: '#5b4a8a' }); obj('casa', 56, 146, 3, 3, true, { techo: '#3b6b7c' }); obj('casa', 66, 146, 3, 3, true, { techo: '#5b4a8a' }); obj('casa', 74, 146, 3, 3, true, { techo: '#3b6b7c' }); obj('casa', 48, 164, 3, 3, true, { techo: '#3b6b7c' }); obj('casa', 58, 166, 3, 3, true, { techo: '#5b4a8a' }); obj('casa', 70, 164, 3, 3, true, { techo: '#5b4a8a' }); obj('casa', 78, 156, 3, 3, true, { techo: '#3b6b7c' });
    obj('casa', 50, 154, 3, 3, true, { techo: '#7c3b2e' }); obj('puertaRenta', 51, 156, 1, 1, false, { pueblo: 'Arcana' });
    obj('fogata', 64, 158, 1, 1, true); obj('pozo', 72, 152, 1, 1, true);
    obj('brasero', 52, 148, 1, 1, true); obj('brasero', 76, 148, 1, 1, true); obj('brasero', 52, 168, 1, 1, true); obj('brasero', 76, 168, 1, 1, true);
    obj('cartel', 64, 150, 1, 1, true, { texto: 'ARCANA · La pequeña metrópolis de los MAGOS: más que una aldea, menos que la Metrópolis. Torres de estudio, braseros que no se apagan y hechiceros que cruzan el continente entero para venir a leer aquí. No hay tienda de pociones: el viajero renta una casa (15 🪙 la noche) y amanece entero. Al este, el camino vuelve a la Metrópolis por Pueblo Salina; al sur, la costa lleva al Desierto de Sal.' });
    // ================================================================
    // PUEBLOS PEQUEÑOS — sin tienda de pociones: se renta una casa (15 🪙)
    // ================================================================
    const pueblo = (nombre, cx, cy, textoExtra) => {
      pav(cx - 6, cy - 4, cx + 6, cy + 4, T.CAMINO);
      obj('casa', cx - 9, cy - 5, 3, 3, true, { techo: '#7c3b2e' }); obj('casa', cx + 6, cy - 6, 3, 3, true, { techo: '#5b4a8a' }); obj('casa', cx - 9, cy + 3, 3, 3, true, { techo: '#3b6b7c' });
      obj('casa', cx + 5, cy + 3, 3, 3, true, { techo: '#7c3b2e' }); obj('puertaRenta', cx + 6, cy + 5, 1, 1, false, { pueblo: nombre });
      obj('fogata', cx, cy, 1, 1, true); obj('pozo', cx - 3, cy + 2, 1, 1, true);
      obj('cartel', cx + 2, cy - 3, 1, 1, true, { texto: nombre.toUpperCase() + ' · Pueblo pequeño del camino. Aquí NO hay tienda de pociones: si necesitas recuperarte, RENTA LA CASA (la del cartel de llave, 15 🪙 por noche): duermes y despiertas con Vida y Esencia al 100%, como en tu casa o en la fogata. ' + (textoExtra || '') });
    };
    pueblo('Pueblo Alto Pino', 140, 120, 'Entre el Bosque Susurrante y la meseta de Viento: de aquí salen los leñadores.');
    pueblo('Pueblo Rocafirme', 252, 116, 'Parada del camino del noreste, entre la Metrópolis y la Montaña Brumosa.');
    pueblo('Pueblo Tres Cruces', 300, 168, 'Tres caminos se cruzan: al norte Rocafirme, al sur Brasa Chica, al este el puente a Puerto Brisa Azul.');
    pueblo('Pueblo Salina', 88, 206, 'Pueblo de saladores del oeste, entre Arcana y el Desierto de Sal.');
    pueblo('Pueblo Vega Baja', 246, 268, 'Vega fértil del sur: de aquí come media Metrópolis.');
    pueblo('Pueblo Brasa Chica', 292, 262, 'La última parada antes de la Tierra Quemada: aquí el aire ya huele a ceniza.');
    // --- Lugares con nombre entre los asentamientos (el viaje no es vacío) ---
    obj('fogata', 262, 232, 1, 1, true); obj('cartel', 263, 232, 1, 1, true, { texto: 'CAMPAMENTO DEL CAMINO LARGO · Un círculo de piedras y leña seca a mitad de camino entre la Metrópolis y el sur. Los viajeros dejan leña para el que viene detrás. Descansa en la fogata y sigue.' });
    obj('fogata', 232, 306, 1, 1, true); obj('cartel', 233, 306, 1, 1, true, { texto: 'CAMPAMENTO DE LA LAGUNA · A la orilla noroeste de la Laguna Serena. Agua quieta, juncos y nadie apurado. Al oeste está Aldea Raíz de Piedra; al este, la ruta del sur sigue a Ceniza Viva.' });
    obj('roca', 180, 120, 1, 1, true); obj('roca', 182, 121, 1, 1, true); obj('roca', 179, 122, 1, 1, true); obj('cartel', 181, 123, 1, 1, true, { texto: 'RUINAS DEL MIRADOR · Piedras caídas de algo que fue alto y miró lejos. Desde aquí, en un día claro, se distingue el humo de la Metrópolis al sureste y la meseta de Vuelo Alto al este.' });
    obj('fogata', 120, 168, 1, 1, true); obj('cartel', 121, 168, 1, 1, true, { texto: 'DESCANSO DEL OESTE · Fogata vieja junto al camino de Arcana. Los magos que bajan a la Metrópolis paran aquí a hervir agua y a discutir en voz baja.' });
    // --- Naturaleza de relleno en los campos entre asentamientos ---
    const enRegion = (x, y) => (x >= OFF.aldea.x && x < OFF.aldea.x + 84 && y >= OFF.aldea.y && y < OFF.aldea.y + 62) || (x >= OFF.bosque.x && x < OFF.bosque.x + 72 && y >= OFF.bosque.y && y < OFF.bosque.y + 56) || (x >= OFF.desierto.x && x < OFF.desierto.x + 74 && y >= OFF.desierto.y && y < OFF.desierto.y + 54) || (x >= OFF.montana.x && x < OFF.montana.x + 68 && y >= OFF.montana.y && y < OFF.montana.y + 54);
    const enAsentamiento = (x, y) => (x >= 184 && x <= 258 && y >= 166 && y <= 232) || (x >= 344 && x <= 396 && y >= 174 && y <= 248) || (x >= 306 && x <= 354 && y >= 290 && y <= 334) || (x >= 192 && x <= 242 && y >= 44 && y <= 86) || (x >= 360 && x <= 408 && y >= 98 && y <= 142) || (x >= 124 && x <= 174 && y >= 308 && y <= 352) || (x >= 40 && x <= 90 && y >= 138 && y <= 180) || (x >= 128 && x <= 154 && y >= 108 && y <= 132) || (x >= 240 && x <= 266 && y >= 104 && y <= 128) || (x >= 288 && x <= 314 && y >= 156 && y <= 180) || (x >= 76 && x <= 102 && y >= 194 && y <= 218) || (x >= 234 && x <= 260 && y >= 256 && y <= 280) || (x >= 280 && x <= 306 && y >= 250 && y <= 274);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const tt = get(x, y); if (enAsentamiento(x, y) || enRegion(x, y)) continue;
      const cercaCamino = get(x + 1, y) === T.CAMINO || get(x - 1, y) === T.CAMINO || get(x, y + 1) === T.CAMINO || get(x, y - 1) === T.CAMINO || tt === T.CAMINO;
      if (tt === T.PASTO && !cercaCamino) { const r = rng(); if (r < 0.05) obj('arbol', x, y, 1, 1, true, { v: Math.floor(rng() * 2) }); else if (r < 0.065) obj('roca', x, y, 1, 1, true); else if (r < 0.11) obj('flor', x, y, 1, 1, false, { v: Math.floor(rng() * 3) }); }
      if (tt === T.CENIZA && rng() < 0.03) obj('roca', x, y, 1, 1, true, { quemada: true });
      if ((tt === T.PASTO || tt === T.SOTOBOSQUE) && (get(x + 1, y) === T.AGUA || get(x - 1, y) === T.AGUA || get(x, y + 1) === T.AGUA || get(x, y - 1) === T.AGUA) && rng() < 0.3) obj('junco', x, y, 1, 1, false);
    }
    // Ningún árbol/roca/cactus puede quedar sobre un camino, un puente o una plaza: el paso queda libre.
    for (let i = objetos.length - 1; i >= 0; i--) { const o = objetos[i]; if ((o.tipo === 'arbol' || o.tipo === 'roca' || o.tipo === 'cactus') && o.solido) { const tt = get(o.x, o.y); if (tt === T.CAMINO || tt === T.PUENTE || tt === T.PIEDRA) { objetos.splice(i, 1); for (let yy = o.y; yy < o.y + (o.h || 1); yy++) for (let xx = o.x; xx < o.x + (o.w || 1); xx++) if (xx >= 0 && yy >= 0 && xx < W && yy < H && tiles[yy * W + xx] !== T.AGUA) solidos[yy * W + xx] = 0; } } }
    // Los puntos clave (plazas, puertas, puestos de NPC, destinos) quedan siempre libres.
    [[150.5, 248.5], [220.5, 200.5], [364.5, 202.5], [330.5, 314.5], [148.5, 332.5], [216.5, 66.5], [384.5, 122.5], [64.5, 160.5], [368.5, 236.5], [332.5, 196.5], [344.5, 196.5], [362.5, 200.5], [360.5, 196.5], [374.5, 216.5], [368.5, 232.5], [354.5, 300.5], [326.5, 318.5], [330.5, 312.5], [322.5, 320.5], [318.5, 306.5], [68.5, 96.5], [327.5, 75.5], [46.5, 265.5], [89.5, 249.5], [83.5, 69.5], [320.5, 48.5], [174.5, 246.5], [185.5, 234.5], [68.5, 56.5], [356.5, 220.5], [330.5, 311.5], [220.5, 190.5], [140.5, 120.5], [252.5, 116.5], [300.5, 168.5], [88.5, 206.5], [246.5, 268.5], [292.5, 262.5]].forEach(p => { for (let i = objetos.length - 1; i >= 0; i--) { const o = objetos[i]; if (o.solido && (o.tipo === 'arbol' || o.tipo === 'roca' || o.tipo === 'cactus') && Math.abs(o.x + 0.5 - p[0]) < 1.7 && Math.abs(o.y + 0.5 - p[1]) < 1.7) objetos.splice(i, 1); } const cx = Math.floor(p[0]), cy = Math.floor(p[1]); for (let yy = cy - 1; yy <= cy + 1; yy++) for (let xx = cx - 1; xx <= cx + 1; xx++) if (xx >= 0 && yy >= 0 && xx < W && yy < H && tiles[yy * W + xx] !== T.AGUA) solidos[yy * W + xx] = 0; });
    // El borde del mundo es MAR: dos baldosas de agua en todo el contorno, sí o sí.
    for (let x = 0; x < W; x++) { set(x, 0, T.AGUA); set(x, 1, T.AGUA); set(x, H - 2, T.AGUA); set(x, H - 1, T.AGUA); }
    for (let y = 0; y < H; y++) { set(0, y, T.AGUA); set(1, y, T.AGUA); set(W - 2, y, T.AGUA); set(W - 1, y, T.AGUA); }
    // --- Zonas de ambiente de los asentamientos nuevos ---
    zonas.push({ id: 'metropolis', nombre: 'La Metrópolis', x: 186, y: 168, w: 70, h: 62, humedad: 0.4, temp: 0.55, viento: 0.5, suelo: 'pavimento', icono: 'aldea', tinte: [200, 210, 255, 0.04] });
    zonas.push({ id: 'vueloAlto', nombre: 'Aldea Vuelo Alto', x: 192, y: 44, w: 50, h: 42, humedad: 0.4, temp: 0.4, viento: 0.95, suelo: 'tierra', abierto: true, icono: 'arena', tinte: [126, 240, 192, 0.05] });
    zonas.push({ id: 'chispaAlta', nombre: 'Aldea Chispa Alta', x: 360, y: 98, w: 48, h: 44, humedad: 0.35, temp: 0.5, viento: 0.8, suelo: 'tierra', abierto: true, icono: 'arena', tinte: [255, 225, 120, 0.05] });
    zonas.push({ id: 'arcana', nombre: 'Arcana · Ciudad de los Magos', x: 40, y: 138, w: 50, h: 42, humedad: 0.5, temp: 0.5, viento: 0.45, suelo: 'pavimento', icono: 'aldea', tinte: [150, 120, 255, 0.05] });
    zonas.push({ id: 'raizPiedra', nombre: 'Aldea Raíz de Piedra', x: 124, y: 308, w: 50, h: 44, humedad: 0.3, temp: 0.5, viento: 0.45, suelo: 'tierra', icono: 'bosque', tinte: [150, 130, 90, 0.05] });
    zonas.push({ id: 'puebloAgua', nombre: 'Puerto Brisa Azul', x: 344, y: 172, w: 52, h: 46, humedad: 0.9, temp: 0.45, viento: 0.55, suelo: 'pavimento', icono: 'agua', tinte: [60, 160, 255, 0.06] });
    zonas.push({ id: 'lagoEste', nombre: 'Lago Brisa Azul', x: 344, y: 216, w: 52, h: 34, humedad: 0.95, temp: 0.45, viento: 0.5, suelo: 'tierra', icono: 'agua', tinte: [60, 160, 255, 0.07] });
    zonas.push({ id: 'rioEste', nombre: 'Río del Este', x: 322, y: 48, w: 34, h: 200, humedad: 0.92, temp: 0.42, viento: 0.5, suelo: 'tierra', icono: 'agua', tinte: [60, 160, 255, 0.07] });
    zonas.push({ id: 'puebloFuego', nombre: 'Aldea Ceniza Viva', x: 306, y: 290, w: 48, h: 44, humedad: 0.07, temp: 0.96, viento: 0.5, suelo: 'ceniza', icono: 'fuego', tinte: [255, 120, 40, 0.09] });
    zonas.push({ id: 'quemadaSur', nombre: 'Tierra Quemada', x: 286, y: 274, w: 104, h: 84, humedad: 0.08, temp: 0.95, viento: 0.55, suelo: 'ceniza', icono: 'fuego', tinte: [255, 120, 40, 0.07] });
    zonas.push({ id: 'lagunaSerena', nombre: 'Laguna Serena', x: 228, y: 304, w: 42, h: 32, humedad: 0.9, temp: 0.45, viento: 0.45, suelo: 'tierra', icono: 'agua', tinte: [60, 160, 255, 0.06] });
    zonas.push({ id: 'altoPino', nombre: 'Pueblo Alto Pino', x: 128, y: 108, w: 26, h: 24, humedad: 0.55, temp: 0.4, viento: 0.3, suelo: 'tierra', icono: 'bosque', tinte: [40, 90, 60, 0.05] });
    zonas.push({ id: 'rocafirme', nombre: 'Pueblo Rocafirme', x: 240, y: 104, w: 26, h: 24, humedad: 0.35, temp: 0.45, viento: 0.6, suelo: 'tierra', icono: 'bosque', tinte: [150, 130, 90, 0.04] });
    zonas.push({ id: 'tresCruces', nombre: 'Pueblo Tres Cruces', x: 288, y: 156, w: 26, h: 24, humedad: 0.5, temp: 0.5, viento: 0.45, suelo: 'tierra', icono: 'aldea', tinte: [255, 210, 140, 0.03] });
    zonas.push({ id: 'salina', nombre: 'Pueblo Salina', x: 76, y: 194, w: 26, h: 24, humedad: 0.6, temp: 0.55, viento: 0.55, suelo: 'tierra', icono: 'agua', tinte: [230, 230, 210, 0.04] });
    zonas.push({ id: 'vegaBaja', nombre: 'Pueblo Vega Baja', x: 234, y: 256, w: 26, h: 24, humedad: 0.55, temp: 0.55, viento: 0.4, suelo: 'tierra', icono: 'aldea', tinte: [120, 180, 90, 0.04] });
    zonas.push({ id: 'brasaChica', nombre: 'Pueblo Brasa Chica', x: 280, y: 250, w: 26, h: 24, humedad: 0.2, temp: 0.8, viento: 0.5, suelo: 'ceniza', icono: 'fuego', tinte: [255, 120, 40, 0.05] });
    zonas.push({ id: 'camino', nombre: 'Tierras de Bruma', x: 0, y: 0, w: W, h: H, humedad: 0.5, temp: 0.5, viento: 0.4, suelo: 'tierra', icono: 'bosque', tinte: [120, 160, 90, 0.03] });
    return { id: 'aldea', nombreMapa: 'Continente de Bruma · Mapa continuo', ancho: W, alto: H, tiles, vari, objetos, solidos, zonas, arena: { x: mAldea.arena.x + OFF.aldea.x, y: mAldea.arena.y + OFF.aldea.y, r: mAldea.arena.r }, ocultarRuna: false, inicio: { x: mAldea.inicio.x + OFF.aldea.x, y: mAldea.inicio.y + OFF.aldea.y }, spawns: (mAldea.spawns || []).map(p => [p[0] + OFF.aldea.x, p[1] + OFF.aldea.y]), spawnsBandidos: (mBosque.spawnsBandidos || []).map(p => [p[0] + OFF.bosque.x, p[1] + OFF.bosque.y]), spawnsAbiertos: (mDes.spawnsAbiertos || []).map(s => [s[0], s[1] + OFF.desierto.x, s[2] + OFF.desierto.y]).concat((mMon.spawnsAbiertos || []).map(s => [s[0], s[1] + OFF.montana.x, s[2] + OFF.montana.y])).concat([['bandido', 300.5, 210.5], ['bandido', 120.5, 190.5], ['ilusionista', 252.5, 130.5], ['brasa', 296.5, 282.5], ['chaman', 216.5, 100.5], ['veterano', 342.5, 150.5], ['bandido', 186.5, 306.5], ['ilusionista', 140.5, 168.5], ['bandido', 70.5, 120.5], ['brasa', 330.5, 246.5]]), npcs: npcsPos, salidas: [], offsets: OFF, continuo: true,
      // SPAWN POR ELEMENTO: apareces en la aldea de TU elemento (el viaje a la
      // Metrópolis es parte del juego). Si un elemento no tuviera aldea, Bruma.
      spawnsElemento: { agua: { x: 364.5, y: 202.5 }, fuego: { x: 330.5, y: 314.5 }, tierra: { x: 148.5, y: 332.5 }, viento: { x: 216.5, y: 66.5 }, rayo: { x: 384.5, y: 122.5 } },
      pueblos: { metropolis: { x: 220.5, y: 200.5 }, bruma: { x: 150.5, y: 248.5 }, puerto: { x: 368.5, y: 196.5 }, ceniza: { x: 330.5, y: 312.5 }, raiz: { x: 148.5, y: 330.5 }, vuelo: { x: 216.5, y: 64.5 }, chispa: { x: 384.5, y: 120.5 }, arcana: { x: 64.5, y: 158.5 } } };
  },
  crearMapaPorId(id, rng) { if (id === 'casa') return this.crearMapaCasa(rng); if (id === 'oficina') return this.crearMapaOficina(rng); return this.crearMapaContinuo(rng); },

  objetoEn(m, x, y) { const cx = Math.floor(x), cy = Math.floor(y); for (let i = 0; i < m.objetos.length; i++) { const o = m.objetos[i]; if (cx >= o.x && cx < o.x + (o.w || 1) && cy >= o.y && cy < o.y + (o.h || 1)) return o; } return null; },
  esDestructible(o) { return o && (o.tipo === 'arbol' || o.tipo === 'roca' || o.tipo === 'cactus') && o.vidaMax != null; },
  danarObjeto(m, o, dmg) {
    if (!this.esDestructible(o) || o.vida <= 0) return false;
    o.vida -= dmg;
    if (window.U && U.Combate) { U.Combate.particulas(o.x + 0.5, o.y + 0.2, 6, o.tipo === 'arbol' ? '#46a06a' : '#8b93a3', 'chispa'); U.Combate.texto({ x: o.x + 0.5, y: o.y }, '-' + Math.round(dmg) + (o.tipo === 'arbol' ? ' 🌳' : o.tipo === 'roca' ? ' 🪨' : ' 🌵'), '#ffd08a', 1); }
    if (o.vida > 0) return false;
    const idx = m.objetos.indexOf(o); if (idx >= 0) m.objetos.splice(idx, 1);
    for (let y = o.y; y < o.y + (o.h || 1); y++) for (let x = o.x; x < o.x + (o.w || 1); x++) if (x >= 0 && y >= 0 && x < m.ancho && y < m.alto && m.tiles[y * m.ancho + x] !== this.T.AGUA) m.solidos[y * m.ancho + x] = 0;
    const E = window.U && U.Juego ? U.Juego.estado : null;
    if (E && E.jugador) { if (U.Combate) U.Combate.particulas(o.x + 0.5, o.y, 10, o.tipo === 'arbol' ? '#46a06a' : '#8b93a3', 'chispa'); if (U.HUD) U.HUD.toast((o.tipo === 'arbol' ? 'Árbol' : o.tipo === 'roca' ? 'Roca' : 'Cactus') + ' destruido: el paso queda libre. (Los materiales no son monedas: el dinero se gana con misiones, arena y torneo.)', 'exito'); E.flags.rompioObjeto = true; }
    if (window.U && U.Audio) U.Audio.sfx('tierra');
    return true;
  },
  esSolido(m, cx, cy) { if (cx < 0 || cy < 0 || cx >= m.ancho || cy >= m.alto) return true; return m.solidos[cy * m.ancho + cx] === 1; },
  solidoEn(m, x, y) { return this.esSolido(m, Math.floor(x), Math.floor(y)); },
  // Caja del personaje (radio ~0.3 celdas) contra el grid; desliza por eje.
  mover(m, e, dx, dy) {
    const r = 0.3;
    const libre = (x, y) => !this.esSolido(m, Math.floor(x - r), Math.floor(y - r)) && !this.esSolido(m, Math.floor(x + r), Math.floor(y - r)) && !this.esSolido(m, Math.floor(x - r), Math.floor(y + r)) && !this.esSolido(m, Math.floor(x + r), Math.floor(y + r));
    if (libre(e.x + dx, e.y)) e.x += dx;
    if (libre(e.x, e.y + dy)) e.y += dy;
    e.x = Math.max(0.5, Math.min(m.ancho - 0.5, e.x)); e.y = Math.max(0.5, Math.min(m.alto - 0.5, e.y));
  },
  dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); },
  dir8(dx, dy) { if (!dx && !dy) return { x: 0, y: 1 }; const a = Math.atan2(dy, dx); const s = Math.round(a / (Math.PI / 4)) * (Math.PI / 4); return { x: Math.round(Math.cos(s)), y: Math.round(Math.sin(s)) }; },

  // Geometría: delgado = largo alcance y pocas celdas; ancho = corto alcance y muchas celdas.
  forma(tipo, ox, oy, dir, alcance, radio) {
    const out = [], seen = {}; const d = this.dir8(dir.x, dir.y); const px = -d.y, py = d.x;
    const add = (x, y) => { const k = x + ',' + y; if (!seen[k]) { seen[k] = 1; out.push({ x, y }); } };
    const cx = Math.round(ox), cy = Math.round(oy);
    if (tipo === 'circulo') { const r = radio || 1; for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + 0.5) add(cx + x, cy + y); }
    else if (tipo === 'cono') { for (let i = 1; i <= alcance; i++) { const w = Math.floor(i * 0.6); const bx = Math.round(ox + d.x * i), by = Math.round(oy + d.y * i); for (let j = -w; j <= w; j++) add(bx + px * j, by + py * j); } }
    // 'alterna' (LLAMARADA): línea recta que golpea SOLO las celdas impares (1, 3, 5…)
    // y salta las pares (2, 4, 6…): esas celdas no reciben daño.
    else if (tipo === 'alterna') { for (let i = 1; i <= alcance; i += 2) add(Math.round(ox + d.x * i), Math.round(oy + d.y * i)); }
    else { const r = tipo === 'rect' ? (radio || 0) : (radio || 0); for (let i = 1; i <= alcance; i++) { const bx = Math.round(ox + d.x * i), by = Math.round(oy + d.y * i); for (let j = -r; j <= r; j++) add(bx + px * j, by + py * j); } }
    return out;
  },
  enCeldas(celdas, e) { const cx = Math.round(e.x), cy = Math.round(e.y); for (let i = 0; i < celdas.length; i++) if (celdas[i].x === cx && celdas[i].y === cy) return true; return false; },
  // Arco cuerpo a cuerpo CONTINUO, sin redondear posiciones a celdas. El golpe Yin usaba SOLO
  // enCeldas: la celda del puño sale de Math.round(posición del jugador + dirección) y el blanco
  // entra si Math.round(su posición) cae EXACTO en esa celda. Como ambos se mueven en continuo,
  // a veces el puño se dibujaba ENCIMA del enemigo (o del cactus) y el redondeo de uno caía en la
  // celda vecina: golpe al aire sin daño. Por eso «a veces golpeo y no lo daño». Este arco mira la
  // distancia y el ángulo reales: pega si el blanco está dentro del alcance y de frente (cono
  // amplio, dot ≥ 0.35 ≈ ±70°); pegado a ti (menos de 0.9) cuenta aunque quede a un costado.
  enArco(ox, oy, dir, alcance, e) { const dx = e.x - ox, dy = e.y - oy; const d = Math.hypot(dx, dy); if (d > alcance) return false; if (d < 0.9) return true; const dl = Math.hypot(dir.x, dir.y) || 1; return (dx / d) * (dir.x / dl) + (dy / d) * (dir.y / dl) >= 0.35; }
};
