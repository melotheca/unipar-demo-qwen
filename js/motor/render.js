/* === js/motor/render.js === */
/* Unipar — render pixel-art 16-bit: tiles pre-renderizados, sprites procedurales, fuente bitmap propia, efectos, minimapa e iconos. */
window.U = window.U || {};

U.Render = {
  canvas: null, ctx: null, zoom: 3, dpr: 1, cssW: 0, cssH: 0, viewW: 0, viewH: 0,
  tileCache: {}, objCache: {}, iconCache: {}, glifos: null, tiempo: 0, vineta: null,
  FUENTE: {
    A:'01110/10001/10001/11111/10001/10001/10001',B:'11110/10001/10001/11110/10001/10001/11110',C:'01111/10000/10000/10000/10000/10000/01111',D:'11110/10001/10001/10001/10001/10001/11110',E:'11111/10000/10000/11110/10000/10000/11111',F:'11111/10000/10000/11110/10000/10000/10000',G:'01111/10000/10000/10111/10001/10001/01111',H:'10001/10001/10001/11111/10001/10001/10001',I:'11111/00100/00100/00100/00100/00100/11111',J:'00111/00010/00010/00010/00010/10010/01100',K:'10001/10010/10100/11000/10100/10010/10001',L:'10000/10000/10000/10000/10000/10000/11111',M:'10001/11011/10101/10101/10001/10001/10001',N:'10001/11001/10101/10011/10001/10001/10001',O:'01110/10001/10001/10001/10001/10001/01110',P:'11110/10001/10001/11110/10000/10000/10000',Q:'01110/10001/10001/10001/10101/10010/01101',R:'11110/10001/10001/11110/10100/10010/10001',S:'01111/10000/10000/01110/00001/00001/11110',T:'11111/00100/00100/00100/00100/00100/00100',U:'10001/10001/10001/10001/10001/10001/01110',V:'10001/10001/10001/10001/10001/01010/00100',W:'10001/10001/10001/10101/10101/11011/10001',X:'10001/10001/01010/00100/01010/10001/10001',Y:'10001/10001/01010/00100/00100/00100/00100',Z:'11111/00001/00010/00100/01000/10000/11111',
    '0':'01110/10001/10011/10101/11001/10001/01110','1':'00100/01100/00100/00100/00100/00100/01110','2':'01110/10001/00001/00010/00100/01000/11111','3':'11110/00001/00001/01110/00001/00001/11110','4':'00010/00110/01010/10010/11111/00010/00010','5':'11111/10000/11110/00001/00001/10001/01110','6':'00110/01000/10000/11110/10001/10001/01110','7':'11111/00001/00010/00100/01000/01000/01000','8':'01110/10001/10001/01110/10001/10001/01110','9':'01110/10001/10001/01111/00001/00010/01100',
    ' ':'00000/00000/00000/00000/00000/00000/00000','.':'00000/00000/00000/00000/00000/01100/01100',',':'00000/00000/00000/00000/01100/00100/01000',':':'00000/01100/01100/00000/01100/01100/00000','!':'00100/00100/00100/00100/00100/00000/00100','?':'01110/10001/00001/00110/00100/00000/00100','¡':'00100/00000/00100/00100/00100/00100/00100','¿':'00100/00000/00100/01100/10000/10001/01110','-':'00000/00000/00000/11111/00000/00000/00000','+':'00000/00100/00100/11111/00100/00100/00000','/':'00001/00010/00010/00100/01000/01000/10000','%':'11001/11010/00010/00100/01000/01011/10011','(':'00010/00100/01000/01000/01000/00100/00010',')':'01000/00100/00010/00010/00010/00100/01000',"'":'00100/00100/01000/00000/00000/00000/00000','×':'00000/10001/01010/00100/01010/10001/00000','→':'00000/00100/00010/11111/00010/00100/00000','Á':'00010/01110/10001/10001/11111/10001/10001','É':'00010/11111/10000/11110/10000/10000/11111','Í':'00010/11111/00100/00100/00100/00100/11111','Ó':'00010/01110/10001/10001/10001/10001/01110','Ú':'00010/10001/10001/10001/10001/10001/01110','Ñ':'01010/10001/11001/10101/10011/10001/10001','Ü':'01010/00000/10001/10001/10001/10001/01110'
  },
  SIMBOLOS: {
    fuego: ['00010000','00011000','00111010','01111110','01111111','11111110','01111100','00111000'],
    agua:  ['00010000','00011000','00111100','01111110','11111111','11111111','01111110','00111100'],
    tierra:['00000000','00010000','00111000','01111100','00111000','01111110','11111111','11111111'],
    viento:['00000000','01111100','10000010','00000010','01111100','10000000','10000010','01111100'],
    rayo:  ['00011110','00111000','01110000','11111100','00011100','00111000','01110000','11100000'],
    yin:   ['00000000','00111000','01111100','11111110','11111110','01111100','00111000','00010000'],
    yang:  ['00010000','00010000','11111111','00010000','00010000','00101000','01000100','10000010'],
    haz:   ['00000001','00000010','00000100','11111000','11111000','00000100','00000010','00000001'],
    onda:  ['00000110','00001111','00111110','11111100','00111110','00001111','00000110','00000000'],
    esferico:['00111100','01111110','11111111','11111111','11111111','11111111','01111110','00111100'],
    dash:  ['00000000','01000000','11000100','11101100','11111100','11101100','11000100','01000000'],
    a:     ['00010000','00111000','01111100','00111000','00111000','01111100','01111100','01101100'],
    pocion:['00111100','00011000','00011000','00111100','01111110','01111110','01111110','00111100'],
    sobre: ['10000001','01011010','00111100','01111110','01111110','00111100','01011010','10000001'],
    aldea: ['00010000','00111000','01111100','11111110','01111100','01101100','01101100','01111100'],
    arena: ['10000001','01000010','00100100','00011000','00011000','00100100','01000010','10000001'],
    bosque:['00010000','00111000','01111100','11111110','00111000','01111100','00010000','00010000'],
    sonido:['00010000','00110010','01110101','11110101','11110101','01110101','00110010','00010000']
  },

  init(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.glifos = {}; for (const k in this.FUENTE) this.glifos[k] = this.FUENTE[k].split('/').map(r => parseInt(r, 2));
    this.prepararTiles(); this.prepararObjetos(); this.resize();
    window.addEventListener('resize', () => this.resize());
  },
  resize() {
    const r = this.canvas.getBoundingClientRect(); this.cssW = Math.max(1, r.width); this.cssH = Math.max(1, r.height);
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.zoom = Math.max(2, Math.min(4, Math.round(this.cssW / 300)));
    this.canvas.width = Math.round(this.cssW * this.dpr); this.canvas.height = Math.round(this.cssH * this.dpr);
    this.viewW = this.cssW / this.zoom; this.viewH = this.cssH / this.zoom; this.ctx.imageSmoothingEnabled = false;
    this.vineta = null;
  },
  mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; },
  mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); fn(x); return c; },

  prepararTiles() {
    const T = U.Grid.T, C = {};
    const noise = (x, rnd, col, n, sz) => { x.fillStyle = col; for (let i = 0; i < n; i++) x.fillRect(Math.floor(rnd() * 16), Math.floor(rnd() * 16), sz || 1, sz || 1); };
    C[T.PASTO] = [0, 1, 2, 3].map(v => this.mk(16, 16, x => { const r = this.mulberry(100 + v); x.fillStyle = '#2e7d4f'; x.fillRect(0, 0, 16, 16); noise(x, r, '#27694a', 10, 2); noise(x, r, '#46a06a', 6); x.fillStyle = '#3d9160'; for (let i = 0; i < 3; i++) { const bx = Math.floor(r() * 14), by = Math.floor(r() * 14); x.fillRect(bx, by, 1, 2); x.fillRect(bx + 1, by + 1, 1, 1); } }));
    C[T.CAMINO] = [0, 1, 2, 3].map(v => this.mk(16, 16, x => { const r = this.mulberry(200 + v); x.fillStyle = '#8a6b46'; x.fillRect(0, 0, 16, 16); noise(x, r, '#7a5c3a', 8, 2); noise(x, r, '#a0805a', 6); noise(x, r, '#6f5537', 3); }));
    C[T.AGUA] = [0, 1, 2, 3].map(f => this.mk(16, 16, x => { x.fillStyle = '#1f5f9e'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#2a74b8'; for (let i = 0; i < 4; i++) x.fillRect(0, (i * 4 + f) % 16, 16, 2); x.fillStyle = '#63b3e8'; x.fillRect((f * 4) % 16, 3, 4, 1); x.fillRect((f * 4 + 8) % 16, 11, 3, 1); x.fillStyle = '#bfefff'; x.fillRect((f * 4 + 2) % 16, 3, 1, 1); }));
    C[T.ARENA] = [0, 1, 2, 3].map(v => this.mk(16, 16, x => { const r = this.mulberry(300 + v); x.fillStyle = '#c9a86a'; x.fillRect(0, 0, 16, 16); noise(x, r, '#b8965a', 8); noise(x, r, '#dbbf85', 6); noise(x, r, '#a3834a', 2); }));
    C[T.CENIZA] = [0, 1, 2, 3].map(v => this.mk(16, 16, x => { const r = this.mulberry(400 + v); x.fillStyle = '#4a3a3a'; x.fillRect(0, 0, 16, 16); noise(x, r, '#3a2c2c', 10, 2); noise(x, r, '#5c4848', 6); noise(x, r, '#ff7a2f', 2); noise(x, r, '#ffb347', 1); }));
    C[T.PIEDRA] = [0, 1, 2, 3].map(v => this.mk(16, 16, x => { const r = this.mulberry(500 + v); x.fillStyle = '#6b7280'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#565d6b'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 8, 16, 1); x.fillRect(v % 2 ? 4 : 10, 0, 1, 8); x.fillRect(v % 2 ? 11 : 3, 8, 1, 8); noise(x, r, '#7d8592', 5); noise(x, r, '#5f6673', 3); }));
    C[T.PUENTE] = [0, 1, 2, 3].map(v => this.mk(16, 16, x => { x.fillStyle = '#7a5a3a'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#5b3d22'; for (let i = 0; i < 16; i += 4) x.fillRect(0, i, 16, 1); x.fillStyle = '#94704a'; x.fillRect(0, 2, 16, 1); x.fillRect(0, 10, 16, 1); x.fillStyle = '#3d2a18'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 15, 16, 1); }));
    C[T.SOTOBOSQUE] = [0, 1, 2, 3].map(v => this.mk(16, 16, x => { const r = this.mulberry(700 + v); x.fillStyle = '#1e4630'; x.fillRect(0, 0, 16, 16); noise(x, r, '#173824', 10, 2); noise(x, r, '#2c5a3c', 6); noise(x, r, '#d9a441', 2); noise(x, r, '#0f2c1c', 4); x.fillStyle = '#3d7a52'; for (let i = 0; i < 2; i++) { const bx = Math.floor(r() * 14), by = Math.floor(r() * 14); x.fillRect(bx, by, 1, 2); } }));
    C[T.DESIERTO] = [0, 1, 2, 3].map(v => this.mk(16, 16, x => { const r = this.mulberry(800 + v); x.fillStyle = '#dbbf85'; x.fillRect(0, 0, 16, 16); noise(x, r, '#c9a86a', 9); noise(x, r, '#efdcab', 6); noise(x, r, '#b8965a', 3); x.fillStyle = '#fff3d6'; for (let i = 0; i < 14; i += 5) x.fillRect(i + v, 13, 3, 1); }));
    C[T.NIEVE] = [0, 1, 2, 3].map(v => this.mk(16, 16, x => { const r = this.mulberry(900 + v); x.fillStyle = '#e8eef4'; x.fillRect(0, 0, 16, 16); noise(x, r, '#d3dee9', 8); noise(x, r, '#ffffff', 6); noise(x, r, '#b9c9d9', 3); }));
    C[T.MONTANA] = [0, 1, 2, 3].map(v => this.mk(16, 16, x => { const r = this.mulberry(1000 + v); x.fillStyle = '#5d6472'; x.fillRect(0, 0, 16, 16); noise(x, r, '#4b5160', 10, 2); noise(x, r, '#767e8d', 6); noise(x, r, '#3d434f', 4); x.fillStyle = '#8b93a3'; x.fillRect(2 + v * 3, 3, 4, 1); }));
    this.tileCache = C;
  },
  prepararObjetos() {
    const O = {};
    O.arbol = [0, 1].map(v => this.mk(16, 32, x => { x.fillStyle = '#3d2a18'; x.fillRect(6, 20, 4, 12); x.fillStyle = '#5b3d22'; x.fillRect(7, 20, 1, 12); const g = v ? ['#1f5c3a', '#2e7d4f', '#46a06a'] : ['#235a4a', '#2f7d5f', '#4faa80']; x.fillStyle = g[0]; x.fillRect(2, 8, 12, 14); x.fillRect(0, 12, 16, 8); x.fillStyle = g[1]; x.fillRect(3, 6, 10, 12); x.fillRect(1, 10, 14, 7); x.fillStyle = g[2]; x.fillRect(4, 4, 7, 6); x.fillRect(2, 9, 4, 3); x.fillStyle = '#8fd9a8'; x.fillRect(5, 5, 2, 1); x.fillRect(3, 10, 1, 1); x.fillStyle = '#143d28'; x.fillRect(4, 20, 8, 2); }));
    O.roca = this.mk(16, 16, x => { x.fillStyle = '#4b5160'; x.fillRect(3, 7, 10, 8); x.fillRect(5, 5, 6, 2); x.fillStyle = '#6b7280'; x.fillRect(4, 6, 7, 5); x.fillStyle = '#8b93a3'; x.fillRect(5, 6, 3, 2); x.fillStyle = '#2f3440'; x.fillRect(3, 14, 10, 1); });
    O.rocaQ = this.mk(16, 16, x => { x.fillStyle = '#2f2626'; x.fillRect(3, 7, 10, 8); x.fillRect(5, 5, 6, 2); x.fillStyle = '#4a3a3a'; x.fillRect(4, 6, 7, 5); x.fillStyle = '#ff7a2f'; x.fillRect(6, 9, 2, 1); x.fillRect(9, 11, 1, 1); });
    O.casa = ['#7c3b2e', '#5b4a8a', '#3b6b7c'].map(techo => this.mk(48, 56, x => { x.fillStyle = '#3d2a18'; x.fillRect(2, 22, 44, 34); x.fillStyle = '#b98a5a'; x.fillRect(4, 24, 40, 30); x.fillStyle = '#8f6a42'; for (let i = 26; i < 54; i += 6) x.fillRect(4, i, 40, 1); x.fillStyle = techo; x.fillRect(0, 8, 48, 16); x.fillRect(4, 4, 40, 6); x.fillRect(8, 0, 32, 6); x.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 8; i < 24; i += 4) x.fillRect(0, i, 48, 1); x.fillStyle = '#4a2c1a'; x.fillRect(20, 38, 8, 16); x.fillStyle = '#ffe14d'; x.fillRect(8, 30, 8, 8); x.fillRect(32, 30, 8, 8); x.fillStyle = '#3d2a18'; x.fillRect(11, 30, 1, 8); x.fillRect(8, 33, 8, 1); x.fillRect(35, 30, 1, 8); x.fillRect(32, 33, 8, 1); x.fillStyle = '#ffd08a'; x.fillRect(26, 46, 1, 2); }));
    O.reja = this.mk(16, 20, x => { x.fillStyle = '#3d2a18'; x.fillRect(2, 4, 3, 16); x.fillRect(11, 4, 3, 16); x.fillStyle = '#7a5a3a'; x.fillRect(3, 5, 1, 14); x.fillRect(12, 5, 1, 14); x.fillStyle = '#5b3d22'; x.fillRect(0, 8, 16, 2); x.fillRect(0, 14, 16, 2); x.fillStyle = '#94704a'; x.fillRect(0, 8, 16, 1); x.fillRect(0, 14, 16, 1); });
    O.pozo = this.mk(16, 26, x => { x.fillStyle = '#3d2a18'; x.fillRect(2, 2, 2, 16); x.fillRect(12, 2, 2, 16); x.fillStyle = '#7c3b2e'; x.fillRect(0, 0, 16, 4); x.fillStyle = '#6b7280'; x.fillRect(2, 16, 12, 8); x.fillStyle = '#8b93a3'; x.fillRect(3, 16, 10, 2); x.fillStyle = '#1f5f9e'; x.fillRect(5, 18, 6, 3); x.fillStyle = '#565d6b'; x.fillRect(2, 23, 12, 1); });
    O.cartel = this.mk(16, 22, x => { x.fillStyle = '#5b3d22'; x.fillRect(7, 10, 2, 12); x.fillStyle = '#3d2a18'; x.fillRect(1, 2, 14, 10); x.fillStyle = '#a0805a'; x.fillRect(2, 3, 12, 8); x.fillStyle = '#5b3d22'; x.fillRect(4, 5, 8, 1); x.fillRect(4, 7, 6, 1); x.fillRect(4, 9, 7, 1); });
    O.junco = this.mk(16, 16, x => { x.fillStyle = '#2a7f5c'; x.fillRect(3, 6, 1, 10); x.fillRect(7, 4, 1, 12); x.fillRect(11, 7, 1, 9); x.fillStyle = '#7ef0c0'; x.fillRect(7, 3, 1, 2); x.fillRect(3, 5, 1, 1); x.fillStyle = '#7a5320'; x.fillRect(11, 5, 1, 2); });
    O.flor = ['#ff5470', '#ffe14d', '#e05bd0'].map(c => this.mk(16, 16, x => { x.fillStyle = '#3d9160'; x.fillRect(7, 10, 1, 5); x.fillRect(5, 12, 1, 2); x.fillStyle = c; x.fillRect(6, 8, 3, 3); x.fillStyle = '#fff'; x.fillRect(7, 9, 1, 1); }));
    O.brasero = this.mk(16, 20, x => { x.fillStyle = '#2f2626'; x.fillRect(3, 12, 10, 6); x.fillRect(5, 18, 6, 2); x.fillStyle = '#5c4848'; x.fillRect(2, 10, 12, 3); x.fillStyle = '#ff7a2f'; x.fillRect(4, 8, 8, 3); x.fillStyle = '#ffb347'; x.fillRect(6, 6, 4, 3); });
    O.fogata = this.mk(16, 16, x => { x.fillStyle = '#5b3d22'; x.fillRect(2, 11, 12, 3); x.fillRect(4, 9, 8, 2); x.fillStyle = '#3d2a18'; x.fillRect(1, 13, 14, 2); x.fillStyle = '#6b7280'; x.fillRect(0, 12, 2, 3); x.fillRect(14, 12, 2, 3); x.fillStyle = '#ff7a2f'; x.fillRect(5, 6, 6, 4); x.fillStyle = '#ffe14d'; x.fillRect(7, 5, 2, 3); });
    this.objCache = O;
  },

  // ---------- Fuente bitmap ----------
  texto(ctx, str, x, y, s, color, align, outline) {
    str = String(str).toUpperCase(); s = s || 1; const w = str.length * 6 * s - s;
    let ox = align === 'center' ? Math.round(x - w / 2) : align === 'right' ? Math.round(x - w) : Math.round(x); const oy = Math.round(y);
    const draw = (col, dx, dy) => { ctx.fillStyle = col; for (let i = 0; i < str.length; i++) { const g = this.glifos[str[i]] || this.glifos[' ']; for (let r = 0; r < 7; r++) { const bits = g[r]; for (let c = 0; c < 5; c++) if (bits & (16 >> c)) ctx.fillRect(ox + i * 6 * s + c * s + dx, oy + r * s + dy, s, s); } } };
    if (outline !== false) draw('#05070f', s, s); draw(color || '#fff', 0, 0); return w;
  },
  medida(str, s) { return String(str).length * 6 * (s || 1) - (s || 1); },
  // Globo de interacción estilo bocadillo de diálogo: caja clara con borde oscuro y piquito
  // que apunta al personaje u objeto. (cx, yPunta) en píxeles del mundo; la punta es la flecha inferior.
  globo(ctx, str, cx, yPunta) {
    const tw = this.medida(str, 1), w = tw + 8, h = 11, cola = 4;
    const x0 = Math.round(cx - w / 2), y0 = Math.round(yPunta - cola - h - 2);
    ctx.fillStyle = '#05070f'; ctx.fillRect(x0 - 1, y0 - 1, w + 2, h + 2);
    ctx.fillStyle = '#fdf6e3'; ctx.fillRect(x0, y0, w, h);
    ctx.fillStyle = '#05070f'; ctx.fillRect(Math.round(cx) - 2, y0 + h + 1, 5, 2); ctx.fillRect(Math.round(cx) - 1, y0 + h + 3, 3, 1);
    ctx.fillStyle = '#fdf6e3'; ctx.fillRect(Math.round(cx) - 1, y0 + h, 3, 2);
    this.texto(ctx, str, cx, y0 + 2, 1, '#3a2c10', 'center', false);
  },

  // ---------- Iconos (dataURL para HTML) ----------
  simbolo(ctx, id, x, y, s, color, outline) {
    const m = this.SIMBOLOS[id] || this.SIMBOLOS.yang; const col = color || U.Elementos.color(id);
    for (let r = 0; r < 8; r++) { const bits = parseInt(m[r], 2); for (let c = 0; c < 8; c++) if (bits & (128 >> c)) { if (outline) { ctx.fillStyle = '#05070f'; ctx.fillRect(x + c * s - 1, y + r * s - 1, s + 2, s + 2); } } }
    for (let r = 0; r < 8; r++) { const bits = parseInt(m[r], 2); for (let c = 0; c < 8; c++) if (bits & (128 >> c)) { ctx.fillStyle = r < 3 ? (U.Elementos.datos[id] ? U.Elementos.datos[id].claro : '#fff') : col; ctx.fillRect(x + c * s, y + r * s, s, s); } }
  },
  icono(id, px, color) {
    const k = id + px + (color || ''); if (this.iconCache[k]) return this.iconCache[k];
    const c = this.mk(px, px, x => { const s = Math.floor(px / 10); const off = Math.floor((px - s * 8) / 2); this.simbolo(x, id, off, off, s, color, true); });
    const url = c.toDataURL(); this.iconCache[k] = url; return url;
  },
  iconoCanvas(cv, id, color) { const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); const s = Math.floor(cv.width / 10); const off = Math.floor((cv.width - s * 8) / 2); this.simbolo(x, id, off, off, s, color, true); },
  // Iconos vectoriales suaves (rejilla 48×48, con antialias) para los controles del HUD:
  // los botones y el joystick se ven lisos, sin el borde pixelado de los sprites del mundo.
  iconoSuave(cv, id, color) {
    const x = cv.getContext('2d'); const W = cv.width, H = cv.height; x.clearRect(0, 0, W, H);
    x.save(); x.scale(W / 48, H / 48); x.lineJoin = 'round'; x.lineCap = 'round';
    const datos = U.Elementos.datos[id];
    const col = color || (datos ? datos.color : '#f8fafc'); const claro = datos ? datos.claro : '#ffffff';
    x.fillStyle = col; x.strokeStyle = col;
    const P = pts => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.fill(); };
    const rr = (a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
    const circ = (cx, cy, r) => { x.beginPath(); x.arc(cx, cy, r, 0, 6.3); x.fill(); };
    switch (id) {
      case 'rayo': P([[28, 3], [12, 28], [21, 28], [17, 45], [36, 19], [26, 19]]); break;
      case 'fuego':
        x.beginPath(); x.moveTo(24, 3); x.bezierCurveTo(29, 11, 37, 17, 37, 28); x.bezierCurveTo(37, 38, 31, 45, 24, 45); x.bezierCurveTo(17, 45, 11, 38, 11, 28); x.bezierCurveTo(11, 20, 16, 15, 19, 9); x.bezierCurveTo(20.5, 13, 22, 16, 24, 18); x.bezierCurveTo(26.5, 14.5, 26, 7, 24, 3); x.closePath(); x.fill();
        x.fillStyle = claro; x.beginPath(); x.moveTo(24, 24); x.bezierCurveTo(28, 29, 30, 32, 30, 36); x.bezierCurveTo(30, 41, 27, 43, 24, 43); x.bezierCurveTo(21, 43, 18, 41, 18, 36); x.bezierCurveTo(18, 32, 21, 28, 24, 24); x.closePath(); x.fill(); break;
      case 'agua':
        x.beginPath(); x.moveTo(24, 3); x.bezierCurveTo(30, 14, 37, 21, 37, 29); x.bezierCurveTo(37, 38, 31, 45, 24, 45); x.bezierCurveTo(17, 45, 11, 38, 11, 29); x.bezierCurveTo(11, 21, 18, 14, 24, 3); x.closePath(); x.fill();
        x.fillStyle = claro; circ(19, 33, 3.4); break;
      case 'tierra': P([[5, 41], [19, 15], [26, 27], [31, 18], [43, 41]]); x.fillStyle = claro; P([[19, 15], [23, 22.5], [15, 22.5]]); break;
      case 'viento':
        x.lineWidth = 5; [0.5, 2.6, 4.7].forEach(a => { x.beginPath(); x.arc(24, 24, 12.5, a, a + 1.85); x.stroke(); }); circ(24, 24, 3.2); break;
      case 'a': // trote: doble flecha de avance
        x.lineWidth = 6; x.beginPath(); x.moveTo(13, 11); x.lineTo(25, 24); x.lineTo(13, 37); x.moveTo(25, 11); x.lineTo(37, 24); x.lineTo(25, 37); x.stroke(); break;
      case 'yin': // puño
        [[17, 15], [24, 13], [31, 15]].forEach(c => circ(c[0], c[1], 5)); rr(13, 16, 22, 22, 7); x.fill(); circ(34.5, 27, 4.6); break;
      case 'yang': // orbe radiante
        circ(24, 24, 8.5); x.lineWidth = 4; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.beginPath(); x.moveTo(24 + Math.cos(a) * 12.5, 24 + Math.sin(a) * 12.5); x.lineTo(24 + Math.cos(a) * 18.5, 24 + Math.sin(a) * 18.5); x.stroke(); } break;
      case 'dash': // ráfagas
        x.lineWidth = 5; [[7, 15, 29], [11, 24, 39], [7, 33, 29]].forEach(l => { x.beginPath(); x.moveTo(l[0], l[1]); x.lineTo(l[2], l[1]); x.stroke(); }); break;
      case 'sobre': { // estallido
        const pts = []; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 - Math.PI / 2, r = i % 2 ? 9 : 20; pts.push([24 + Math.cos(a) * r, 24 + Math.sin(a) * r]); } P(pts); break; }
      case 'tiempo': // reloj: cámara lenta (Tiempo Lento)
        x.lineWidth = 4; x.beginPath(); x.arc(24, 24, 16, 0, 6.3); x.stroke(); x.beginPath(); x.moveTo(24, 24); x.lineTo(24, 12); x.moveTo(24, 24); x.lineTo(32, 28); x.stroke(); break;
      case 'acero': // placa de acero (Resistencia de Acero)
        P([[24, 4], [40, 10], [40, 26], [24, 44], [8, 26], [8, 10]]); x.fillStyle = claro; x.fillRect(14, 20, 20, 5); break;
      default: circ(24, 24, 10);
    }
    x.restore();
  },

  // ---------- Sprites humanoides ----------
  humanoide(ctx, px, py, o) {
    const p = o.paleta || { piel: '#e8c39e', pelo: '#3d2a18', ropa: '#5b6b8a', ropa2: '#3b4d86', detalle: '#f8fafc' }; const f = o.frame || 0; const dir = o.dir || 'abajo'; const lado = dir === 'izq' || dir === 'der'; const flip = dir === 'izq';
    const sc = o.escala || 1; const x = Math.round(px), y = Math.round(py);
    ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1); ctx.scale(sc, sc);
    const R = (rx, ry, w, h, col) => { ctx.fillStyle = '#05070f'; ctx.fillRect(rx - 1, ry - 1, w + 2, h + 2); ctx.fillStyle = col; ctx.fillRect(rx, ry, w, h); };
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-5, -2, 10, 3);
    const legOff = [0, 1, 0, -1][f % 4]; const bob = (o.moviendo && f % 2) ? -1 : 0;
    const flash = o.flash > 0; const F = c => flash ? '#ffffff' : c;
    // piernas
    R(-4, -6 + Math.max(0, legOff), 3, 5 - Math.max(0, legOff), F(p.ropa2)); R(1, -6 + Math.max(0, -legOff), 3, 5 - Math.max(0, -legOff), F(p.ropa2));
    // cuerpo
    R(-5, -13 + bob, 10, 8, F(p.ropa)); ctx.fillStyle = F(p.ropa2); ctx.fillRect(-5, -7 + bob, 10, 2); if (p.detalle) { ctx.fillStyle = F(p.detalle); ctx.fillRect(-1, -12 + bob, 2, 4); }
    // brazos
    const atk = o.atacando; const swing = o.moviendo ? legOff : 0;
    if (atk && (dir === 'abajo' || dir === 'arriba')) { R(-7, -12 + bob, 3, 5, F(p.piel)); R(4, -12 + bob, 3, 5, F(p.piel)); }
    else if (atk && lado) { R(4, -12 + bob, 7, 3, F(p.piel)); R(-7, -12 + bob + swing, 3, 6, F(p.piel)); }
    else { R(-7, -12 + bob + swing, 3, 6, F(p.piel)); R(4, -12 + bob - swing, 3, 6, F(p.piel)); }
    // cabeza
    R(-4, -21 + bob, 8, 8, F(p.piel)); ctx.fillStyle = F(p.pelo); ctx.fillRect(-4, -21 + bob, 8, 3); ctx.fillRect(-4, -18 + bob, 1, 3); ctx.fillRect(3, -18 + bob, 1, 3); if (p.peloLargo) ctx.fillRect(-4, -18 + bob, 2, 7);
    if (dir !== 'arriba') { ctx.fillStyle = F('#1a1a2e'); if (lado) ctx.fillRect(1, -16 + bob, 1, 2); else { ctx.fillRect(-2, -16 + bob, 1, 2); ctx.fillRect(1, -16 + bob, 1, 2); } }
    if (o.accesorio === 'club') { ctx.fillStyle = F('#5b3d22'); ctx.fillRect(6, -16 + bob, 2, 9); ctx.fillStyle = F('#8b93a3'); ctx.fillRect(5, -18 + bob, 4, 3); }
    if (o.accesorio === 'baston') { ctx.fillStyle = F('#5b3d22'); ctx.fillRect(6, -22 + bob, 1, 18); ctx.fillStyle = F(p.detalle || '#7ef0c0'); ctx.fillRect(5, -24 + bob, 3, 3); }
    if (o.accesorio === 'llama') { ctx.fillStyle = F('#ff7a2f'); ctx.fillRect(-3, -24 + bob, 6, 3); ctx.fillStyle = F('#ffe14d'); ctx.fillRect(-1, -26 + bob, 2, 3); }
    if (o.accesorio === 'casco') { ctx.fillStyle = F('#6b7280'); ctx.fillRect(-4, -22 + bob, 8, 4); ctx.fillStyle = F('#ffe14d'); ctx.fillRect(-1, -23 + bob, 2, 1); }
    if (o.accesorio === 'guante') { ctx.fillStyle = F('#05070f'); ctx.fillRect(4, -7 + bob - swing, 3, 3); ctx.fillStyle = F('#23232e'); ctx.fillRect(4, -7 + bob - swing, 3, 1); }
    ctx.restore();
    if (o.aura) { const t = this.tiempo * 4; ctx.fillStyle = o.aura; for (let i = 0; i < 3; i++) { const a = t + i * 2.1; ctx.fillRect(Math.round(x + Math.cos(a) * 9), Math.round(y - 12 + Math.sin(a) * 5), 2, 2); } }
    if (o.carga > 0) { ctx.strokeStyle = o.aura || '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y - 10, 8 + o.carga * 8, 0, Math.PI * 2 * Math.min(1, o.carga)); ctx.stroke(); }
  },
  paletaNPC: {
    marisol: { piel: '#e8c39e', pelo: '#7a3b12', ropa: '#2a7f5c', ropa2: '#1e4630', detalle: '#ffe14d', peloLargo: true },
    breno:   { piel: '#d9a074', pelo: '#3d2a18', ropa: '#8a6b46', ropa2: '#5b3d22', detalle: '#67e08a' },
    elena:   { piel: '#c98a5e', pelo: '#5c3a21', ropa: '#b85c7a', ropa2: '#7a2f4a', detalle: '#f8fafc', peloLargo: true },
    marco:   { piel: '#e8c39e', pelo: '#22222e', ropa: '#4a6b8a', ropa2: '#2a3a55', detalle: '#35c6f4' },
    pipo:    { piel: '#f0d0a8', pelo: '#a33b12', ropa: '#ffe14d', ropa2: '#d9a441', detalle: '#ff5470' },
    aldric:  { piel: '#d9a074', pelo: '#e8eef4', ropa: '#d9a441', ropa2: '#7a5320', detalle: '#fff7c2' },
    lia:     { piel: '#e8c39e', pelo: '#2b2b3a', ropa: '#7a5fd0', ropa2: '#3b2a6b', detalle: '#e05bd0', peloLargo: true },
    vera: { piel: '#e8c39e', pelo: '#4a2c4a', ropa: '#2a3a55', ropa2: '#16203a', detalle: '#7cc4ff', peloLargo: true },
    bram: { piel: '#c98a5e', pelo: '#5c5c6b', ropa: '#6b5a3a', ropa2: '#3d3222', detalle: '#8b93a3' },
    dario: { piel: '#d9a074', pelo: '#1a1a2e', ropa: '#23232e', ropa2: '#101018', detalle: '#05070f' },
    sana: { piel: '#a8743c', pelo: '#235a2a', ropa: '#1f5c3a', ropa2: '#12301f', detalle: '#67e08a', peloLargo: true },
    milo: { piel: '#e8c39e', pelo: '#a33b12', ropa: '#8a6b2a', ropa2: '#5c4517', detalle: '#ffe14d' },
    petra: { piel: '#f0d0a8', pelo: '#e8eef4', ropa: '#5b4a8a', ropa2: '#3b2a6b', detalle: '#d9a441', peloLargo: true },
    kaelen: { piel: '#d9a074', pelo: '#2b2b3a', ropa: '#5b6b8a', ropa2: '#3b4d86', detalle: '#d9a441' },
    sora:   { piel: '#e8c39e', pelo: '#2a9d8f', ropa: '#35c6f4', ropa2: '#1a6b94', detalle: '#f8fafc', peloLargo: true },
    torin:  { piel: '#c98a5e', pelo: '#a33b12', ropa: '#7a5320', ropa2: '#4a2c1a', detalle: '#ff7a2f' },
    nami:   { piel: '#e8c39e', pelo: '#1f5f9e', ropa: '#35c6f4', ropa2: '#1f5f9e', detalle: '#bfefff', peloLargo: true },
    orin:   { piel: '#c98a5e', pelo: '#2b2b3a', ropa: '#1f5f9e', ropa2: '#123a5f', detalle: '#7cc4ff' },
    zara:   { piel: '#d9a074', pelo: '#a33b12', ropa: '#ff7a2f', ropa2: '#7a2f12', detalle: '#ffe14d', peloLargo: true },
    varek:  { piel: '#b8785a', pelo: '#3d2a18', ropa: '#7a3b12', ropa2: '#4a2c1a', detalle: '#ff7a2f' }
  },
  paletaEnemigo: {
    bandido: { piel: '#c98a5e', pelo: '#3d2a18', ropa: '#6b4a2e', ropa2: '#3d2a18', detalle: '#8b93a3' },
    chaman:  { piel: '#a8c8a0', pelo: '#235a4a', ropa: '#2f7d5f', ropa2: '#1f5c3a', detalle: '#7ef0c0', peloLargo: true },
    brasa:   { piel: '#ff7a2f', pelo: '#ffe14d', ropa: '#a33b12', ropa2: '#5c1a08', detalle: '#ffe14d' },
    veterano:{ piel: '#b8785a', pelo: '#5c5c6b', ropa: '#4b5160', ropa2: '#2f3440', detalle: '#d9a441' },
    ilusionista: { piel: '#d9c8e8', pelo: '#5b4a8a', ropa: '#7a5fd0', ropa2: '#3b2a6b', detalle: '#e05bd0', peloLargo: true }
  },
  dirDe(v) { if (Math.abs(v.x) >= Math.abs(v.y) && v.x !== 0) return v.x > 0 ? 'der' : 'izq'; return v.y < 0 ? 'arriba' : 'abajo'; },

  // Cara pixel-art con emoción (una emoción fija y visible; los estados van por dentro)
  cara(ctx, npcId, emocion, x, y, s) {
    const p = this.paletaNPC[npcId] || this.paletaNPC.kaelen; const R = (rx, ry, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + rx * s, y + ry * s, w * s, h * s); };
    R(0, 0, 16, 16, '#0e1530'); R(2, 3, 12, 12, p.piel); R(2, 1, 12, 4, p.pelo); R(1, 3, 1, 6, p.pelo); R(14, 3, 1, 6, p.pelo);
    if (p.peloLargo) { R(1, 5, 2, 10, p.pelo); R(13, 5, 2, 10, p.pelo); }
    if (npcId === 'torin') { R(3, 11, 10, 4, p.pelo); R(2, 1, 12, 2, p.piel); R(4, 0, 8, 1, p.pelo); }
    const ojo = '#1a1a2e';
    switch (emocion) {
      case 'alegre': R(4, 7, 2, 1, ojo); R(10, 7, 2, 1, ojo); R(4, 8, 1, 1, ojo); R(11, 8, 1, 1, ojo); R(5, 11, 6, 1, '#a33b12'); R(6, 12, 4, 1, '#a33b12'); R(3, 9, 2, 1, '#ff9aa8'); R(11, 9, 2, 1, '#ff9aa8'); break;
      case 'sereno': R(4, 7, 2, 2, ojo); R(10, 7, 2, 2, ojo); R(6, 11, 4, 1, '#7a3b2e'); R(3, 5, 3, 1, p.pelo); R(10, 5, 3, 1, p.pelo); break;
      case 'triste': R(4, 8, 2, 1, ojo); R(10, 8, 2, 1, ojo); R(3, 6, 3, 1, p.pelo); R(10, 6, 3, 1, p.pelo); R(5, 12, 6, 1, '#7a3b2e'); R(6, 11, 4, 1, '#7a3b2e'); R(11, 9, 1, 2, '#35c6f4'); break;
      case 'enojado': R(4, 8, 2, 1, ojo); R(10, 8, 2, 1, ojo); R(3, 5, 3, 1, p.pelo); R(5, 6, 1, 1, p.pelo); R(10, 5, 3, 1, p.pelo); R(10, 6, 1, 1, p.pelo); R(5, 12, 6, 1, '#7a3b2e'); R(3, 9, 2, 2, '#ff5470'); R(11, 9, 2, 2, '#ff5470'); break;
      case 'asustado': R(4, 6, 2, 3, '#fff'); R(10, 6, 2, 3, '#fff'); R(4, 7, 1, 1, ojo); R(11, 7, 1, 1, ojo); R(6, 11, 4, 2, '#3d2a18'); R(13, 4, 1, 3, '#35c6f4'); R(3, 4, 3, 1, p.pelo); R(10, 4, 3, 1, p.pelo); break;
      default: R(4, 7, 2, 2, ojo); R(10, 7, 2, 2, ojo); R(6, 11, 4, 1, '#7a3b2e');
    }
  },
  burbuja(ctx, x, y, emocion) {
    const c = { alegre: '#ffe14d', sereno: '#7ef0c0', neutral: '#9fb3d9', triste: '#35c6f4', enojado: '#ff5470', asustado: '#e05bd0' }[emocion] || '#9fb3d9';
    ctx.fillStyle = '#05070f'; ctx.fillRect(x - 6, y - 6, 12, 11); ctx.fillStyle = '#f8fafc'; ctx.fillRect(x - 5, y - 5, 10, 9); ctx.fillRect(x - 1, y + 4, 3, 2);
    ctx.fillStyle = '#1a1a2e';
    if (emocion === 'alegre') { ctx.fillRect(x - 3, y - 2, 2, 1); ctx.fillRect(x + 1, y - 2, 2, 1); ctx.fillRect(x - 2, y + 1, 4, 1); }
    else if (emocion === 'enojado') { ctx.fillRect(x - 3, y - 3, 2, 1); ctx.fillRect(x + 1, y - 3, 2, 1); ctx.fillRect(x - 3, y - 1, 2, 1); ctx.fillRect(x + 1, y - 1, 2, 1); ctx.fillRect(x - 2, y + 2, 4, 1); }
    else if (emocion === 'triste') { ctx.fillRect(x - 3, y - 1, 2, 1); ctx.fillRect(x + 1, y - 1, 2, 1); ctx.fillRect(x - 2, y + 2, 4, 1); ctx.fillRect(x + 3, y, 1, 2); }
    else if (emocion === 'asustado') { ctx.fillRect(x - 3, y - 2, 2, 2); ctx.fillRect(x + 1, y - 2, 2, 2); ctx.fillRect(x - 1, y + 1, 2, 2); }
    else { ctx.fillRect(x - 3, y - 2, 2, 2); ctx.fillRect(x + 1, y - 2, 2, 2); ctx.fillRect(x - 2, y + 1, 4, 1); }
    ctx.fillStyle = c; ctx.fillRect(x - 6, y - 7, 12, 1);
  },

  // ---------- Mundo ----------
  mundo(estado, dt) {
    // TIEMPO LENTO: el reloj de animación del mundo (agua, pulsos, fuego,
    // luciérnagas) corre a la escala del mundo; la cámara sigue al jugador a
    // velocidad real (el jugador no se pone lento). En diálogo o pausa el mundo
    // no corre: escala 1.
    const escM = (estado.ui === 'mundo' && U.Combate && U.Combate.escalaMundo) ? U.Combate.escalaMundo() : 1;
    this.tiempo += dt * escM; const ctx = this.ctx, m = estado.mapa, j = estado.jugador, T = U.Grid.T, TS = 16;
    const cam = estado.camara; const vw = this.viewW, vh = this.viewH;
    // Cámara SIEMPRE centrada en el jugador, sin sujetarse a los bordes del mapa:
    // lo que quede fuera del mapa se pinta con el fondo oscuro, y el jugador nunca
    // termina en una esquina tapado por las barras del HUD (p. ej. la cama en casa).
    const cx = j.x * TS - vw / 2, cy = j.y * TS - vh / 2;
    cam.x += (cx - cam.x) * Math.min(1, dt * 8); cam.y += (cy - cam.y) * Math.min(1, dt * 8);
    cam.shake *= Math.exp(-dt * 9); const sx = (Math.random() - 0.5) * cam.shake * 6, sy = (Math.random() - 0.5) * cam.shake * 6;
    ctx.setTransform(this.dpr * this.zoom, 0, 0, this.dpr * this.zoom, 0, 0); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0b1020'; ctx.fillRect(0, 0, vw + 2, vh + 2);
    ctx.translate(Math.round(-cam.x + sx), Math.round(-cam.y + sy));
    const x0 = Math.max(0, Math.floor(cam.x / TS) - 1), y0 = Math.max(0, Math.floor(cam.y / TS) - 1), x1 = Math.min(m.ancho - 1, Math.ceil((cam.x + vw) / TS) + 1), y1 = Math.min(m.alto - 1, Math.ceil((cam.y + vh) / TS) + 2);
    const wf = Math.floor(this.tiempo * 3) % 4;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * m.ancho + x; const t = m.tiles[i]; const v = t === T.AGUA ? wf : m.vari[i]; ctx.drawImage(this.tileCache[t][v], x * TS, y * TS); }
    // Telegrafos enemigos bajo los sprites
    estado.efectos.telegrafos.forEach(t => { const a = 0.18 + 0.14 * Math.sin(this.tiempo * 14); ctx.fillStyle = 'rgba(255,77,77,' + a + ')'; ctx.strokeStyle = '#ff4d4d'; ctx.lineWidth = 1; t.celdas.forEach(c => { ctx.fillRect(c.x * TS + 1, c.y * TS + 1, TS - 2, TS - 2); ctx.strokeRect(c.x * TS + 0.5, c.y * TS + 0.5, TS - 1, TS - 1); }); });
    // Runa de la arena (pulso) — solo en mapas que la tienen (el bosque no)
    const ar = m.arena; if (ar && !m.ocultarRuna) { const pulse = 0.5 + 0.5 * Math.sin(this.tiempo * 3);
    ctx.strokeStyle = estado.arena.activa ? '#ff5470' : '#ffe14d'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ar.x * TS + 8, ar.y * TS + 8, 6 + pulse * 3, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = estado.arena.activa ? 'rgba(255,84,112,.4)' : 'rgba(255,225,77,.35)'; ctx.fillRect(ar.x * TS + 5, ar.y * TS + 5, 6, 6); }
    // Círculo de sparring: NO es un lugar fijo. Se forma alrededor de la pelea que
    // esté ocurriendo (el punto medio vivo entre los dos que pelean), en el mapa
    // que sea; si nadie está peleando, no hay círculo en ninguna parte.
    const scp = (U.Sparring && U.Sparring.centroActual) ? U.Sparring.centroActual(estado) : null;
    if (scp) { const pul = 0.5 + 0.5 * Math.sin(this.tiempo * 3); ctx.strokeStyle = estado.sparring && estado.sparring.fase === 'peleando' ? '#ff5470' : '#ffe14d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(scp.x * TS, scp.y * TS, 5 * TS + pul * 2, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = 'rgba(255,225,77,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(scp.x * TS, scp.y * TS, 5 * TS - 7, 0, Math.PI * 2); ctx.stroke(); this.texto(ctx, 'CÍRCULO DE ENTRENAMIENTO', scp.x * TS, (scp.y - 5.7) * TS, 1, '#ffe14d', 'center'); }
    // Salidas a otros mapas: umbral dorado pulsante con el destino escrito
    (m.salidas || []).forEach(s => { const a = 0.30 + 0.25 * Math.sin(this.tiempo * 4); const hh = Math.max(5, s.h * TS * 0.4); ctx.fillStyle = 'rgba(255,225,77,' + a + ')'; ctx.fillRect(s.x * TS, s.y * TS, s.w * TS, hh); ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 1; ctx.strokeRect(s.x * TS + 0.5, s.y * TS + 0.5, s.w * TS - 1, hh - 1); this.texto(ctx, 'A ' + s.etiqueta.toUpperCase(), (s.x + s.w / 2) * TS, s.y < 2 ? s.y * TS + hh + 5 : s.y * TS - 12, 1, '#ffe14d', 'center'); });
    // Dibujables ordenados por Y
    const draws = [];
    m.objetos.forEach(o => { if (o.x + o.w < x0 || o.x > x1 || o.y + o.h < y0 - 2 || o.y > y1) return; draws.push({ y: (o.y + o.h) * TS, f: () => this.objeto(ctx, o) }); });
    estado.npcs.forEach(n => { if (!n.enCasa && !n.ocultoSparring && n.x > x0 - 3 && n.x < x1 + 3 && n.y > y0 - 3 && n.y < y1 + 3) draws.push({ y: n.y * TS, f: () => this.npc(ctx, n, j) }); });
    estado.enemigos.forEach(e => { if (e.vida > 0 && e.x > x0 - 3 && e.x < x1 + 3 && e.y > y0 - 3 && e.y < y1 + 3) draws.push({ y: e.y * TS, f: () => this.enemigo(ctx, e) }); });
    (estado.criaturas || []).forEach(c => { if (c.vida > 0 && c.x > x0 - 3 && c.x < x1 + 3 && c.y > y0 - 3 && c.y < y1 + 3) draws.push({ y: c.y * TS, f: () => this.criatura(ctx, c, j) }); });
    estado.orbes.forEach(o => draws.push({ y: o.y * TS, f: () => { const b = Math.sin(this.tiempo * 6 + o.x) * 2; ctx.fillStyle = '#4da3ff'; ctx.fillRect(Math.round(o.x * TS) - 2, Math.round(o.y * TS) - 8 + b, 4, 4); ctx.fillStyle = '#bfefff'; ctx.fillRect(Math.round(o.x * TS) - 1, Math.round(o.y * TS) - 7 + b, 1, 1); } }));
    let jugadorDibujado = false;
    draws.push({ y: j.y * TS, f: () => { this.jugador(ctx, j); jugadorDibujado = true; } });
    // Cada sprite se dibuja aislado: si UNO falla, se salta ese sprite y el resto del
    // cuadro (incluido el jugador, que SIEMPRE debe verse) se sigue dibujando.
    draws.sort((a, b) => a.y - b.y); draws.forEach(d => { try { d.f(); } catch (e) { if (window.console) console.error('Unipar: sprite ignorado', e); } });
    // Red de seguridad del jugador: si por cualquier motivo su sprite no se dibujó en
    // la pasada ordenada, se dibuja aquí, encima de todo, en su posición real.
    if (!jugadorDibujado && isFinite(j.x) && isFinite(j.y)) { try { this.jugador(ctx, j); } catch (e) { /* el humanoide ya trae paleta por defecto */ } }
    // Proyectiles
    estado.proyectiles.forEach(p => { const px = p.x * TS, py = p.y * TS - 8; ctx.fillStyle = p.color; if (p.cometa) { ctx.fillStyle = 'rgba(248,250,252,.5)'; ctx.fillRect(Math.round(px - p.dx * 14) - 1, Math.round(py - p.dy * 14) - 1, 3, 3); ctx.fillRect(Math.round(px - p.dx * 8) - 1, Math.round(py - p.dy * 8) - 1, 3, 3); ctx.fillStyle = p.color; } ctx.fillRect(Math.round(px) - 3, Math.round(py) - 3, 6, 6); ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(px) - 1, Math.round(py) - 1, 2, 2); if (p.forma === 'roca') { ctx.fillStyle = '#4b5160'; ctx.fillRect(Math.round(px) - 3, Math.round(py) - 3, 6, 6); ctx.fillStyle = '#8b93a3'; ctx.fillRect(Math.round(px) - 2, Math.round(py) - 2, 2, 2); } });
    // Efectos de área
    estado.efectos.haces.forEach(h => { const a = Math.max(0, h.t / h.max); ctx.globalAlpha = a; h.celdas.forEach((c, i) => { ctx.fillStyle = h.color; ctx.fillRect(c.x * TS + 2, c.y * TS + 2, TS - 4, TS - 4); if (i % 2 === Math.floor(this.tiempo * 20) % 2) { ctx.fillStyle = '#fff'; ctx.fillRect(c.x * TS + 5, c.y * TS + 5, 6, 6); } }); ctx.globalAlpha = 1; });
    estado.efectos.anillos.forEach(r => { const k = 1 - r.t / r.max; ctx.strokeStyle = r.color; ctx.lineWidth = 2; ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(r.x * TS, r.y * TS - 6, 4 + k * r.radio * TS, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; });
    estado.efectos.cadenas.forEach(c => { ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 2; ctx.globalAlpha = Math.max(0, c.t / c.max); ctx.beginPath(); for (let i = 0; i < c.puntos.length; i++) { const p = c.puntos[i]; const px = p.x * TS, py = p.y * TS - 8; if (i === 0) ctx.moveTo(px, py); else { const mx = (c.puntos[i - 1].x * TS + px) / 2 + (Math.random() - 0.5) * 8, my = (c.puntos[i - 1].y * TS - 8 + py) / 2 + (Math.random() - 0.5) * 8; ctx.lineTo(mx, my); ctx.lineTo(px, py); } } ctx.stroke(); ctx.globalAlpha = 1; });
    estado.efectos.cortes.forEach(c => { const a = c.t / c.max; ctx.globalAlpha = a; ctx.fillStyle = c.color; const dx = c.dir.x, dy = c.dir.y; for (let i = -2; i <= 2; i++) { const px = c.x * TS + dx * 12 + (-dy) * i * 4, py = c.y * TS - 10 + dy * 12 + dx * i * 4; ctx.fillRect(Math.round(px) - 1, Math.round(py) - 1, 3, 3); } ctx.globalAlpha = 1; });
    // Partículas y textos
    estado.efectos.particulas.forEach(p => { ctx.globalAlpha = Math.max(0, Math.min(1, p.vida / p.max)); ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x * TS), Math.round(p.y * TS), p.tam, p.tam); }); ctx.globalAlpha = 1;
    estado.efectos.textos.forEach(t => { ctx.globalAlpha = Math.max(0, Math.min(1, t.vida / 0.4)); this.texto(ctx, t.txt, t.x * TS, t.y * TS - 26 - (1 - t.vida / t.max) * 14, t.escala, t.color, 'center'); }); ctx.globalAlpha = 1;
    // Ciclo día/noche (reloj interno): velo oscuro + tinte cálido de amanecer/atardecer SOBRE el mundo.
    // Va antes de las luces a propósito: la fogata y los braseros se dibujan después y brillan sobre la noche.
    const horaD = U.Tiempo.hora(estado); const oscD = U.Tiempo.oscuridad(horaD); const calD = U.Tiempo.calidez(horaD);
    if (oscD > 0.01) { ctx.fillStyle = 'rgba(9,13,44,' + oscD.toFixed(3) + ')'; ctx.fillRect(cam.x - 8, cam.y - 8, vw + 16, vh + 16); }
    if (calD > 0.01) { ctx.fillStyle = 'rgba(255,122,47,' + calD.toFixed(3) + ')'; ctx.fillRect(cam.x - 8, cam.y - 8, vw + 16, vh + 16); }
    // Luces (fogata, braseros, runa) — de noche la fogata abarca más y alumbra más fuerte
    ctx.globalCompositeOperation = 'lighter';
    const luz = (x, y, r, col, a) => { const g = ctx.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
    m.objetos.forEach(o => { if (o.tipo === 'fogata') luz(o.x * TS + 8, o.y * TS + 6, 40 + oscD * 38 + Math.sin(this.tiempo * 7) * 3, 'rgba(255,150,60,A)', 0.28 + oscD * 0.38); if (o.tipo === 'brasero') luz(o.x * TS + 8, o.y * TS + 4, 30 + oscD * 18 + Math.sin(this.tiempo * 9 + o.x) * 3, 'rgba(255,120,40,A)', 0.25 + oscD * 0.25); });
    if (j.buffs.sobrecarga > 0) luz(j.x * TS, j.y * TS - 8, 26, 'rgba(255,60,60,A)', 0.35);
    ctx.globalCompositeOperation = 'source-over';
    // Tinte de zona + viñeta
    const z = estado.zonaActual; if (z && z.tinte) { ctx.fillStyle = 'rgba(' + z.tinte[0] + ',' + z.tinte[1] + ',' + z.tinte[2] + ',' + z.tinte[3] + ')'; ctx.fillRect(cam.x - 8, cam.y - 8, vw + 16, vh + 16); }
    ctx.setTransform(this.dpr * this.zoom, 0, 0, this.dpr * this.zoom, 0, 0);
    if (!this.vineta) { this.vineta = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.45, vw / 2, vh / 2, Math.max(vw, vh) * 0.75); this.vineta.addColorStop(0, 'rgba(0,0,0,0)'); this.vineta.addColorStop(1, 'rgba(5,7,15,.55)'); }
    ctx.fillStyle = this.vineta; ctx.fillRect(0, 0, vw, vh);
    // Luciérnagas nocturnas: puntitos cálidos que derivan y parpadean cuando el mundo está oscuro
    if (oscD > 0.35) { const fa = Math.min(1, (oscD - 0.35) / 0.3); for (let i = 0; i < 22; i++) { const bx = ((i * 89 + 37) % 100) / 100 * vw, by = ((i * 61 + 23) % 100) / 100 * vh; const fx = bx + Math.sin(this.tiempo * 0.7 + i * 1.7) * 9, fy = by + Math.cos(this.tiempo * 0.5 + i * 2.3) * 6; const par = 0.35 + 0.65 * Math.abs(Math.sin(this.tiempo * 1.4 + i * 2.1)); ctx.fillStyle = 'rgba(255,225,120,' + (fa * par * 0.85).toFixed(3) + ')'; ctx.fillRect(Math.round(fx), Math.round(fy), 1.6, 1.6); } }
    // CLIMA visible sobre el mundo. BAJO TECHO (casa / Oficina) NO llueve: sin gotas,
    // sin salpicaduras, sin relámpagos y sin niebla dentro. Afuera, la LLUVIA tiene
    // INTENSIDAD (1 ligera · 2 normal · 3 fuerte · 4 tormenta) y se nota en todo:
    // más gotas, más largas, más rápidas, más opacas, con más viento y salpicaduras.
    if (estado.clima) { const ct = estado.clima.tipo; const bajoTecho = !!(U.Clima && U.Clima.esInterior && U.Clima.esInterior(estado));
      if ((ct === 'lluvia' || ct === 'tormenta') && !bajoTecho) {
        const inten = (U.Clima && U.Clima.intensidadDe) ? (U.Clima.intensidadDe(estado) || 2) : 2;
        const conf = [null,
          { n: 26, len: 5, vel: 150, op: 0.35, viento: -1, salp: 5 },
          { n: 55, len: 7, vel: 260, op: 0.55, viento: -2, salp: 10 },
          { n: 95, len: 10, vel: 380, op: 0.7, viento: -3, salp: 16 },
          { n: 140, len: 12, vel: 480, op: 0.82, viento: -4, salp: 22 }][inten];
        ctx.fillStyle = 'rgba(30,50,90,' + (0.025 * inten).toFixed(3) + ')'; ctx.fillRect(0, 0, vw, vh);
        ctx.strokeStyle = 'rgba(170,205,245,' + conf.op + ')'; ctx.lineWidth = inten >= 3 ? 1.4 : 1; ctx.beginPath();
        for (let i = 0; i < conf.n; i++) { const gx = ((i * 53 + 17) % 101) / 101 * vw, gy = (((i * 37 + 11) % 101) / 101 * vh + this.tiempo * conf.vel) % (vh + 14) - 7; ctx.moveTo(gx, gy); ctx.lineTo(gx + conf.viento, gy + conf.len); }
        ctx.stroke();
        // Salpicaduras: anillitos cortos donde las gotas pegan, más con más intensidad
        ctx.strokeStyle = 'rgba(190,220,255,' + (conf.op * 0.8).toFixed(2) + ')'; ctx.lineWidth = 1; ctx.beginPath();
        for (let i = 0; i < conf.salp; i++) { const sx2 = ((i * 67 + 29) % 101) / 101 * vw, sy2 = ((i * 41 + 13) % 101) / 101 * vh; const fase = (this.tiempo * 2.4 + i * 0.37) % 1; const r = 1 + fase * (2 + inten); ctx.moveTo(sx2 - r, sy2); ctx.lineTo(sx2 + r, sy2); }
        ctx.stroke();
        if (ct === 'tormenta' && Math.sin(this.tiempo * 0.7) > 0.995) { ctx.fillStyle = 'rgba(255,255,240,.18)'; ctx.fillRect(0, 0, vw, vh); }
      }
      else if (ct === 'niebla' && !bajoTecho) { ctx.fillStyle = 'rgba(220,228,238,.20)'; ctx.fillRect(0, 0, vw, vh); ctx.fillStyle = 'rgba(220,228,238,.13)'; for (let i = 0; i < 5; i++) { const fy = ((i * 29 + Math.sin(this.tiempo * 0.3 + i) * 8) % 100) / 100 * vh; ctx.fillRect(0, fy, vw, vh * 0.14); } }
      else if (ct === 'calor') { ctx.fillStyle = 'rgba(255,150,50,.06)'; ctx.fillRect(0, 0, vw, vh); }
    }
    if (j.vida < j.stats.vida * 0.25) { ctx.fillStyle = 'rgba(255,40,60,' + (0.08 + 0.06 * Math.sin(this.tiempo * 6)) + ')'; ctx.fillRect(0, 0, vw, vh); }
    // TIEMPO LENTO: tinte frío SUTIL (nunca rojo, nunca un flash): solo marca que
    // el mundo va lento. Respeta el ajuste de destellos: 'off' = sin tinte.
    if (j.tiempoLento) { const modoD = estado.destelloModo || 'normal'; const opTL = modoD === 'off' ? 0 : modoD === 'suave' ? 0.03 : 0.06; if (opTL > 0) { ctx.fillStyle = 'rgba(140,170,220,' + opTL.toFixed(3) + ')'; ctx.fillRect(0, 0, vw, vh); } }
    // Etiquetas de nombre de NPC cercanas
    ctx.translate(Math.round(-cam.x + sx), Math.round(-cam.y + sy));
    estado.npcs.forEach(n => { if (!n.enCasa && !n.ocultoSparring && U.Grid.dist(n, j) < 6) this.texto(ctx, n.nombre + (n.enCirculo ? ' · entrenando' : ''), n.x * TS, n.y * TS - 34, 1, '#e8dcc8', 'center'); });
    (estado.criaturas || []).forEach(c => { if (c.vida > 0 && U.Grid.dist(c, j) < 6) this.texto(ctx, (c.apodo ? c.apodo + ' · ' : '') + c.nombre.toUpperCase() + (c.invocada ? ' · TU COMPAÑERA' : c.temperamento === 'hostil' ? ' · HOSTIL' : c.temperamento === 'amistosa' ? ' · VÍNCULO ' + Math.round(c.vinculo) : ''), c.x * TS, c.y * TS - 30, 1, c.invocada ? '#67e08a' : c.temperamento === 'hostil' ? '#ff8a9c' : c.temperamento === 'amistosa' ? '#a7f3c9' : '#e8dcc8', 'center'); });
    if (j.invertido > 0) this.texto(ctx, '🌀 INVERTIDO ' + Math.ceil(j.invertido), j.x * TS, j.y * TS - 46 + Math.round(Math.sin(this.tiempo * 6) * 1.5), 1, '#e8a2e0', 'center');
    if (estado.interactuable) { const o = estado.interactuable.obj; const bob = Math.round(Math.sin(this.tiempo * 3) * 1.5); this.globo(ctx, estado.interactuable.corto, o.x * TS + (o.w || 1) * 8, (o.y - 1.3) * TS + bob); }
  },
  objeto(ctx, o) {
    const TS = 16, O = this.objCache; const x = o.x * TS, y = o.y * TS;
    switch (o.tipo) {
      case 'arbol': ctx.drawImage(O.arbol[o.v || 0], x, y - 16); if (o.vidaMax && o.vida < o.vidaMax) { ctx.fillStyle = '#05070f'; ctx.fillRect(x, y - 22, 16, 4); ctx.fillStyle = '#67e08a'; ctx.fillRect(x + 1, y - 21, Math.round(14 * Math.max(0, o.vida / o.vidaMax)), 2); ctx.strokeStyle = '#05070f'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 8, y - 10); ctx.lineTo(x + 6, y - 2); ctx.lineTo(x + 9, y + 4); ctx.stroke(); } break;
      case 'roca': ctx.drawImage(o.quemada ? O.rocaQ : O.roca, x, y); if (o.vidaMax && o.vida < o.vidaMax) { ctx.fillStyle = '#05070f'; ctx.fillRect(x, y - 6, 16, 4); ctx.fillStyle = '#ffb347'; ctx.fillRect(x + 1, y - 5, Math.round(14 * Math.max(0, o.vida / o.vidaMax)), 2); ctx.strokeStyle = '#05070f'; ctx.beginPath(); ctx.moveTo(x + 3, y + 4); ctx.lineTo(x + 8, y + 9); ctx.lineTo(x + 12, y + 6); ctx.stroke(); } break;
      case 'cactus': ctx.fillStyle = '#2a7f5c'; ctx.fillRect(x + 6, y - 8, 4, 22); ctx.fillRect(x + 1, y - 2, 4, 3); ctx.fillRect(x + 1, y - 6, 3, 5); ctx.fillRect(x + 11, y - 4, 4, 3); ctx.fillRect(x + 12, y - 8, 3, 5); ctx.fillStyle = '#7ef0c0'; ctx.fillRect(x + 7, y - 8, 1, 20); ctx.fillStyle = '#ff5470'; ctx.fillRect(x + 7, y - 11, 2, 3); if (o.vidaMax && o.vida < o.vidaMax) { ctx.fillStyle = '#05070f'; ctx.fillRect(x, y - 16, 16, 4); ctx.fillStyle = '#67e08a'; ctx.fillRect(x + 1, y - 15, Math.round(14 * Math.max(0, o.vida / o.vidaMax)), 2); } break;
      case 'casa': ctx.drawImage(O.casa[['#7c3b2e', '#5b4a8a', '#3b6b7c'].indexOf(o.techo)] || O.casa[0], x, y - 8); break;
      case 'reja': ctx.drawImage(O.reja, x, y - 4); break;
      case 'pozo': ctx.drawImage(O.pozo, x, y - 10); break;
      case 'cartel': ctx.drawImage(O.cartel, x, y - 6); break;
      case 'junco': ctx.drawImage(O.junco, x, y); break;
      case 'flor': ctx.drawImage(O.flor[o.v || 0], x, y); break;
      case 'brasero': ctx.drawImage(O.brasero, x, y - 4); { const f = Math.floor(this.tiempo * 10 + o.x) % 3; ctx.fillStyle = '#ffe14d'; ctx.fillRect(x + 6, y - 8 - f, 4, 3); ctx.fillStyle = '#ff7a2f'; ctx.fillRect(x + 5, y - 5 - f, 6, 2); } break;
      case 'cactus': ctx.fillStyle = '#2a7f5c'; ctx.fillRect(x + 6, y - 8, 4, 22); ctx.fillRect(x + 1, y - 2, 4, 3); ctx.fillRect(x + 1, y - 6, 3, 5); ctx.fillRect(x + 11, y - 4, 4, 3); ctx.fillRect(x + 12, y - 8, 3, 5); ctx.fillStyle = '#7ef0c0'; ctx.fillRect(x + 7, y - 8, 1, 20); ctx.fillStyle = '#ff5470'; ctx.fillRect(x + 7, y - 11, 2, 3); break;
      case 'cama': ctx.fillStyle = '#3d2a18'; ctx.fillRect(x, y + 6, 32, 8); ctx.fillStyle = '#e8dcc8'; ctx.fillRect(x + 1, y + 4, 30, 7); ctx.fillStyle = '#f8fafc'; ctx.fillRect(x + 2, y + 2, 9, 6); ctx.fillStyle = '#b33a4b'; ctx.fillRect(x + 13, y + 4, 18, 7); ctx.fillStyle = '#7c2434'; ctx.fillRect(x + 13, y + 9, 18, 2); ctx.fillStyle = '#ffe14d'; ctx.fillRect(x + 26, y - 2, 4, 4); break;
      case 'obelisco': ctx.fillStyle = '#05070f'; ctx.fillRect(x + 2, y - 14, 12, 30); ctx.fillStyle = '#4b3a6b'; ctx.fillRect(x + 3, y - 13, 10, 28); ctx.fillStyle = '#7a5fd0'; ctx.fillRect(x + 6, y - 10, 4, 4); ctx.fillRect(x + 6, y - 2, 4, 4); ctx.fillStyle = '#e05bd0'; ctx.fillRect(x + 7, y - 9 + Math.round(Math.sin(this.tiempo * 3) * 1), 2, 2); ctx.fillRect(x + 7, y - 1, 2, 2); break;
      case 'oficina': ctx.fillStyle = '#3d2a18'; ctx.fillRect(x, y - 10, 80, 62); ctx.fillStyle = '#c9b18a'; ctx.fillRect(x + 3, y - 7, 74, 56); ctx.fillStyle = '#d9a441'; ctx.fillRect(x - 2, y - 18, 84, 14); ctx.fillRect(x + 8, y - 24, 64, 8); ctx.fillStyle = '#4a2c1a'; ctx.fillRect(x + 34, y + 22, 12, 27); ctx.fillStyle = '#ffe14d'; ctx.fillRect(x + 8, y + 2, 12, 12); ctx.fillRect(x + 60, y + 2, 12, 12); ctx.fillRect(x + 34, y - 2, 12, 10); ctx.fillStyle = '#fff7c2'; ctx.fillRect(x + 38, y - 30, 4, 4); break;
      case 'tienda': ctx.fillStyle = '#3d2a18'; ctx.fillRect(x + 2, y - 6, 44, 46); ctx.fillStyle = '#a8c8a0'; ctx.fillRect(x + 4, y - 4, 40, 42); ctx.fillStyle = '#2a7f5c'; ctx.fillRect(x, y - 14, 48, 12); ctx.fillStyle = '#f8fafc'; for (let i = 0; i < 48; i += 12) ctx.fillRect(x + i, y - 14, 6, 12); ctx.fillStyle = '#4a2c1a'; ctx.fillRect(x + 20, y + 16, 8, 22); ctx.fillStyle = '#ffe14d'; ctx.fillRect(x + 7, y + 4, 9, 9); ctx.fillRect(x + 32, y + 4, 9, 9); break;
      case 'mesa': ctx.fillStyle = '#5b3d22'; ctx.fillRect(x, y + 4, 64, 8); ctx.fillRect(x + 4, y + 12, 6, 14); ctx.fillRect(x + 54, y + 12, 6, 14); ctx.fillStyle = '#e8dcc8'; ctx.fillRect(x + 10, y, 18, 5); ctx.fillStyle = '#ffe14d'; ctx.fillRect(x + 40, y + 1, 10, 4); break;
      case 'reliquia': { const b = Math.round(Math.sin(this.tiempo * 4) * 2); ctx.fillStyle = '#ffe14d'; ctx.fillRect(x + 5, y + 2 + b, 6, 8); ctx.fillStyle = '#fff7c2'; ctx.fillRect(x + 7, y + 4 + b, 2, 3); ctx.fillStyle = 'rgba(255,225,77,.35)'; ctx.fillRect(x + 2, y - 1 + b, 12, 14); } break;
      case 'encargo': case 'perdido': { const b = Math.round(Math.sin(this.tiempo * 4) * 2); ctx.fillStyle = o.tipo === 'encargo' ? '#d9a441' : '#7cc4ff'; ctx.fillRect(x + 3, y + 5 + b, 10, 8); ctx.fillStyle = '#fff7c2'; ctx.fillRect(x + 7, y + 5 + b, 2, 8); ctx.fillRect(x + 3, y + 8 + b, 10, 2); ctx.fillStyle = 'rgba(255,225,77,.3)'; ctx.fillRect(x + 1, y + 2 + b, 14, 13); } break;
      case 'pista': { const b = Math.round(Math.sin(this.tiempo * 3) * 1); ctx.fillStyle = '#7cc4ff'; ctx.fillRect(x + 4, y + 10 + b, 3, 3); ctx.fillRect(x + 9, y + 7 + b, 3, 3); ctx.fillRect(x + 6, y + 3 + b, 3, 3); } break;
      case 'cautivo': { ctx.fillStyle = '#e8c39e'; ctx.fillRect(x + 5, y + 1, 6, 6); ctx.fillStyle = '#5b4a8a'; ctx.fillRect(x + 4, y + 7, 8, 7); ctx.fillStyle = '#ffe14d'; ctx.fillRect(x + 2, y + 13, 12, 2); } break;
      case 'puertaOficina': ctx.fillStyle = '#3d2a18'; ctx.fillRect(x + 1, y - 27, 14, 31); ctx.fillStyle = '#d9a441'; ctx.fillRect(x + 3, y - 25, 10, 27); ctx.fillStyle = '#fff7c2'; ctx.fillRect(x + 10, y - 13, 2, 2); break;
      case 'puertaTienda': ctx.fillStyle = '#3d2a18'; ctx.fillRect(x + 3, y - 17, 10, 25); ctx.fillStyle = '#d9a441'; ctx.fillRect(x + 4, y - 16, 8, 23); ctx.fillStyle = '#fff7c2'; ctx.fillRect(x + 9, y - 6, 2, 2); break;
      case 'puertaCasa': ctx.fillStyle = '#3d2a18'; ctx.fillRect(x + 3, y - 3, 10, 19); ctx.fillStyle = '#8f6a42'; ctx.fillRect(x + 4, y - 2, 8, 17); ctx.fillStyle = '#ffd08a'; ctx.fillRect(x + 10, y + 6, 2, 2); ctx.fillStyle = '#ffe14d'; ctx.fillRect(x + 3, y - 6, 10, 2); break;
      case 'puertaRenta': ctx.fillStyle = '#3d2a18'; ctx.fillRect(x + 3, y - 3, 10, 19); ctx.fillStyle = '#6b4a2a'; ctx.fillRect(x + 4, y - 2, 8, 17); ctx.fillStyle = '#ffd08a'; ctx.fillRect(x + 10, y + 6, 2, 2); ctx.fillStyle = '#ffe14d'; ctx.fillRect(x + 2, y - 9, 12, 5); ctx.fillStyle = '#3d2a18'; ctx.fillRect(x + 4, y - 7, 3, 3); ctx.fillRect(x + 9, y - 7, 3, 1); ctx.fillRect(x + 10, y - 6, 1, 2); break;
      case 'cofre': ctx.fillStyle = '#3d2a18'; ctx.fillRect(x + 1, y + 3, 14, 11); ctx.fillStyle = '#7a5320'; ctx.fillRect(x + 1, y + 1, 14, 5); ctx.fillStyle = '#d9a441'; ctx.fillRect(x + 1, y + 6, 14, 2); ctx.fillRect(x + 7, y + 5, 2, 4); ctx.fillStyle = '#ffe14d'; ctx.fillRect(x + 7, y + 7, 2, 2); break;
      case 'tesoro': { const b = Math.round(Math.sin(this.tiempo * 4) * 2); const col = o.color || '#ffe14d'; ctx.fillStyle = 'rgba(255,225,77,.28)'; ctx.fillRect(x + 1, y - 2 + b, 14, 16); ctx.fillStyle = col; ctx.fillRect(x + 4, y + 1 + b, 8, 6); ctx.fillRect(x + 3, y + 7 + b, 10, 3); ctx.fillStyle = '#05070f'; ctx.fillRect(x + 5, y + 3 + b, 2, 2); ctx.fillRect(x + 9, y + 3 + b, 2, 2); ctx.fillStyle = '#f8fafc'; ctx.fillRect(x + 6, y + 1 + b, 4, 1); } break;
      case 'escondite': { ctx.fillStyle = '#2c3038'; ctx.fillRect(x + 1, y + 10, 6, 5); ctx.fillRect(x + 9, y + 11, 6, 4); ctx.fillStyle = '#565d6b'; ctx.fillRect(x + 2, y + 9, 4, 2); ctx.fillRect(x + 10, y + 10, 4, 2); ctx.fillStyle = '#5b3d22'; ctx.fillRect(x + 7, y + 2, 1, 9); ctx.fillStyle = '#3d2a18'; ctx.fillRect(x + 3, y + 13, 10, 2); if (o.descubierto) { ctx.fillStyle = o.color || '#d9a441'; ctx.fillRect(x + 8, y + 2, 6, 4); ctx.fillStyle = '#05070f'; ctx.fillRect(x + 8, y + 5, 6, 1); } if (o.saqueado) { ctx.fillStyle = 'rgba(5,7,15,.45)'; ctx.fillRect(x, y + 7, 16, 9); } } break;
      case 'pergamino': { const b = Math.round(Math.sin(this.tiempo * 3) * 2); const col = o.color || '#ff4d4d'; ctx.fillStyle = 'rgba(20,4,10,.55)'; ctx.fillRect(x, y + 12, 16, 3); ctx.fillStyle = 'rgba(255,77,77,.22)'; ctx.fillRect(x, y - 3 + b, 16, 17); ctx.fillStyle = '#e8dcc8'; ctx.fillRect(x + 3, y + 1 + b, 10, 11); ctx.fillStyle = col; ctx.fillRect(x + 3, y + 1 + b, 10, 2); ctx.fillRect(x + 3, y + 10 + b, 10, 2); ctx.fillStyle = '#2a0a12'; ctx.fillRect(x + 5, y + 5 + b, 6, 1); ctx.fillRect(x + 5, y + 7 + b, 4, 1); ctx.fillStyle = col; ctx.fillRect(x + 7, y + 5 + b, 2, 3); } break;
      case 'fogata': ctx.drawImage(O.fogata, x, y); { const f = Math.floor(this.tiempo * 12) % 3; ctx.fillStyle = '#ffe14d'; ctx.fillRect(x + 6, y + 1 - f, 3, 4); ctx.fillStyle = '#ff7a2f'; ctx.fillRect(x + 4, y + 4 - f, 8, 3); ctx.fillStyle = '#fff7c2'; ctx.fillRect(x + 7, y + 3 - f, 1, 1); } break;
    }
  },
  jugador(ctx, j) {
    const el = U.Elementos.datos[j.elementoActivo]; const p = { piel: '#e8c39e', pelo: '#3d2a18', ropa: el.color, ropa2: el.oscuro, detalle: '#f8fafc' };
    if (j.atributo === 'tenaz') p.detalle = '#8b93a3'; if (j.atributo === 'sabio') p.pelo = '#9fb3d9'; if (j.atributo === 'fuerte') p.ropa2 = '#3d2a18';
    const aura = j.buffs.sobrecarga > 0 ? '#ff5470' : (j.cargando ? el.claro : (j.maestria[j.elementoActivo] >= 40 ? el.color : null));
    for (let i = 0; i < j.rastro.length; i++) { const r = j.rastro[i]; ctx.globalAlpha = r.t * 0.5; this.humanoide(ctx, r.x * 16, r.y * 16, { paleta: { piel: el.claro, pelo: el.claro, ropa: el.color, ropa2: el.color }, dir: this.dirDe(j.dir), frame: 0 }); } ctx.globalAlpha = 1;
    this.humanoide(ctx, j.x * 16, j.y * 16, { paleta: p, dir: this.dirDe(j.dir), frame: Math.floor(j.anim * 8) % 4, moviendo: j.moviendo, flash: j.flash, atacando: j.ataqueAnim > 0, aura: aura, carga: j.cargando ? j.carga / 1.2 : 0, escala: j.atributo === 'pesado' ? 1.1 : (j.atributo === 'fragil' ? 0.95 : 1) });
    if (j.escudo) { // Arco según NIVEL y mirada: Nv.1 solo el frente · Nv.2 frente y lados (hueco atrás) · Nv.3 círculo completo.
      const colE = U.Combate ? U.Combate.escudoColor(j) : '#7cc4ff'; const nvE = j.escudoNv || 1;
      const ang = Math.atan2(j.dir.y, j.dir.x); const amp = nvE >= 3 ? Math.PI * 2 : nvE === 2 ? Math.PI * 1.55 : Math.PI * 0.62;
      const alfa = 0.35 + 0.65 * Math.max(0.15, (j.escudoVida || 1) / (U.Combate ? U.Combate.escudoMax(j) : 34));
      ctx.strokeStyle = colE; ctx.globalAlpha = alfa; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(j.x * 16, j.y * 16 - 10, 15 + Math.sin(this.tiempo * 6) * 1.5, ang - amp / 2, ang + amp / 2); ctx.stroke();
      ctx.globalAlpha = alfa * 0.16; ctx.fillStyle = colE; ctx.beginPath(); ctx.moveTo(j.x * 16, j.y * 16 - 10); ctx.arc(j.x * 16, j.y * 16 - 10, 15, ang - amp / 2, ang + amp / 2); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
      this.texto(ctx, 'ESCUDO NV.' + nvE, j.x * 16, j.y * 16 - 44, 1, colE, 'center'); }
    if (j.reliquias && j.reliquias.puesta && U.Reliquias && U.Reliquias.MASCARAS[j.reliquias.puesta]) { const mc = U.Reliquias.MASCARAS[j.reliquias.puesta].color; const mx = Math.round(j.x * 16), my = Math.round(j.y * 16); ctx.fillStyle = mc; ctx.fillRect(mx - 6, my - 25, 12, 5); ctx.fillRect(mx - 6, my - 20, 12, 1); ctx.fillStyle = '#05070f'; ctx.fillRect(mx - 4, my - 23, 2, 2); ctx.fillRect(mx + 2, my - 23, 2, 2); }
    if (j.descansando) this.texto(ctx, 'Z', j.x * 16 + 8, j.y * 16 - 36 - Math.sin(this.tiempo * 2) * 2, 1, '#67e08a', 'center');
    if (j.invuln > 0) { ctx.strokeStyle = 'rgba(126,240,192,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(j.x * 16, j.y * 16 - 8, 12, 0, Math.PI * 2); ctx.stroke(); }
  },
  npc(ctx, n, j) {
    const cerca = U.Grid.dist(n, j) < 5; const dir = cerca ? this.dirDe({ x: j.x - n.x, y: j.y - n.y }) : this.dirDe(n.dir);
    this.humanoide(ctx, n.x * 16, n.y * 16 + Math.sin(this.tiempo * 2 + n.fase) * 0.5, { paleta: this.paletaNPC[n.id] || this.paletaNPC.kaelen, dir, frame: Math.floor(n.anim * 6) % 4, moviendo: n.moviendo, atacando: (n.atacando || 0) > 0, accesorio: n.id === 'torin' ? 'club' : (n.id === 'sora' ? 'baston' : (n.id === 'dario' ? 'guante' : null)) });
    if (n.enCirculo) { const w = 16, vx = Math.round(n.x * 16 - w / 2), vy = Math.round(n.y * 16) - 31; ctx.fillStyle = '#05070f'; ctx.fillRect(vx - 1, vy - 1, w + 2, 4); ctx.fillStyle = '#67e08a'; ctx.fillRect(vx, vy, Math.round(w * Math.max(0, (n.vidaSim || 100) / 100)), 2); }
    if (cerca) this.burbuja(ctx, Math.round(n.x * 16), Math.round(n.y * 16) - 30, n.emocion);
  },
  enemigo(ctx, e) {
    const p = this.paletaEnemigo[e.clase]; const dir = this.dirDe(e.dir);
    this.humanoide(ctx, e.x * 16, e.y * 16, { paleta: p, dir, frame: Math.floor(e.anim * 8) % 4, moviendo: e.moviendo, flash: e.flash, atacando: e.estado === 'ataca', accesorio: e.guanteNegro ? 'guante' : e.clase === 'bandido' ? 'club' : e.clase === 'chaman' || e.clase === 'ilusionista' ? 'baston' : e.clase === 'brasa' ? 'llama' : 'casco', escala: e.clase === 'veterano' ? 1.3 : 1, aura: e.efectos.dot ? '#ff7a2f' : null });
    if (e.escudoT > 0) { ctx.strokeStyle = 'rgba(224,91,208,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x * 16, e.y * 16 - 10, 15, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = 'rgba(224,91,208,.13)'; ctx.beginPath(); ctx.arc(e.x * 16, e.y * 16 - 10, 15, 0, Math.PI * 2); ctx.fill(); }
    // barra de vida del enemigo
    const w = 14, vx = Math.round(e.x * 16 - w / 2), vy = Math.round(e.y * 16) - (e.clase === 'veterano' ? 36 : 28);
    ctx.fillStyle = '#05070f'; ctx.fillRect(vx - 1, vy - 1, w + 2, 4); ctx.fillStyle = '#ff5470'; ctx.fillRect(vx, vy, Math.round(w * Math.max(0, e.vida / e.stats.vida)), 2);
    if (e.efectos.stun > 0) this.texto(ctx, '!', e.x * 16, vy - 9, 1, '#ffe14d', 'center');
    if (e.efectos.slow > 0) { ctx.fillStyle = '#35c6f4'; ctx.fillRect(vx, vy + 3, w, 1); }
    const el = U.Elementos.datos[e.elemento]; ctx.fillStyle = el.color; ctx.fillRect(vx + w + 2, vy, 3, 3);
  },
  // ---------- Criaturas salvajes: sprites procedurales por especie ----------
  criatura(ctx, c, j) {
    const x = Math.round(c.x * 16), y = Math.round(c.y * 16); const sc = c.escala || 1;
    const flash = c.flash > 0; const col = flash ? '#ffffff' : c.color, col2 = flash ? '#ffffff' : c.color2;
    const paso = c.moviendo ? [0, 1, 0, -1][Math.floor(c.anim * 6) % 4] : 0;
    const flip = c.dir && c.dir.x < 0 ? -1 : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(flip * sc, sc);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-6, -2, 12, 3);
    const R = (rx, ry, w, h, cc) => { ctx.fillStyle = '#05070f'; ctx.fillRect(rx - 1, ry - 1, w + 2, h + 2); ctx.fillStyle = cc; ctx.fillRect(rx, ry, w, h); };
    switch (c.sprite) {
      case 'lobo': case 'bestia': {
        R(-7, -9 + Math.abs(paso), 13, 6, col); R(5, -13 + Math.abs(paso), 6, 6, col); R(5, -16 + Math.abs(paso), 2, 3, col2); R(9, -16 + Math.abs(paso), 2, 3, col2);
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(9, -11 + Math.abs(paso), 1, 2); ctx.fillRect(11, -9 + Math.abs(paso), 1, 1);
        R(-11, -11, 4, 2, col2);
        ctx.fillStyle = col2; ctx.fillRect(-5, -3 + Math.max(0, paso), 2, 4); ctx.fillRect(3, -3 + Math.max(0, -paso), 2, 4);
        if (c.sprite === 'bestia') { ctx.fillStyle = col2; ctx.fillRect(-2, -13, 2, 4); ctx.fillRect(2, -13, 2, 4); }
        break; }
      case 'ciervo': {
        R(-6, -10, 12, 6, col); R(5, -15, 5, 7, col); ctx.fillStyle = '#1a1a2e'; ctx.fillRect(8, -13, 1, 2);
        ctx.fillStyle = col2; ctx.fillRect(5, -19, 1, 4); ctx.fillRect(8, -19, 1, 4); ctx.fillRect(4, -18, 2, 1); ctx.fillRect(8, -18, 2, 1);
        ctx.fillStyle = col2; ctx.fillRect(-4, -4 + Math.max(0, paso), 2, 5); ctx.fillRect(3, -4 + Math.max(0, -paso), 2, 5);
        ctx.fillStyle = '#f8fafc'; ctx.fillRect(-3, -9, 2, 2); ctx.fillRect(1, -8, 2, 2);
        break; }
      case 'espiritu': {
        const bob = Math.round(Math.sin(this.tiempo * 2.4 + c.x) * 1.5);
        ctx.globalAlpha = 0.88; R(-5, -16 + bob, 10, 11, col); ctx.globalAlpha = 1;
        ctx.fillStyle = col2; ctx.fillRect(-5, -7 + bob, 10, 2);
        ctx.fillStyle = '#12301f'; ctx.fillRect(-2, -12 + bob, 2, 2); ctx.fillRect(2, -12 + bob, 2, 2);
        ctx.fillStyle = col; ctx.fillRect(-8, -13 + bob, 2, 5); ctx.fillRect(6, -13 + bob, 2, 5);
        ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(-1, -19 + bob, 2, 2);
        break; }
      case 'escorpion': {
        R(-6, -6, 11, 4, col); ctx.fillStyle = col2; for (let i = 0; i < 3; i++) { ctx.fillRect(-4 + i * 4, -2 + Math.abs(paso), 1, 3); ctx.fillRect(-3 + i * 4, -2 + Math.abs(-paso), 1, 3); }
        ctx.strokeStyle = col2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -5); ctx.quadraticCurveTo(-11, -10, -8, -14); ctx.stroke();
        ctx.fillStyle = col2; ctx.fillRect(-9, -15, 2, 2); ctx.fillRect(6, -8, 3, 3); ctx.fillRect(-9, -7, 3, 2);
        break; }
      case 'lagarto': case 'ajolote': {
        R(-6, -6 + Math.abs(paso), 10, 4, col); R(4, -8 + Math.abs(paso), 5, 4, col); ctx.fillStyle = '#1a1a2e'; ctx.fillRect(7, -7 + Math.abs(paso), 1, 1);
        ctx.fillStyle = col2; ctx.fillRect(-11, -5, 5, 2); ctx.fillRect(-3, -3 + Math.max(0, paso), 2, 2); ctx.fillRect(2, -3 + Math.max(0, -paso), 2, 2);
        if (c.sprite === 'ajolote') { ctx.fillStyle = '#e05bd0'; ctx.fillRect(3, -10, 2, 2); ctx.fillRect(8, -10, 2, 2); ctx.fillRect(3, -5, 2, 1); ctx.fillRect(8, -5, 2, 1); }
        break; }
      case 'yeti': {
        R(-7, -14 + Math.abs(paso), 14, 11, col); R(-5, -20 + Math.abs(paso), 10, 7, col);
        ctx.fillStyle = '#5b7a99'; ctx.fillRect(-3, -17 + Math.abs(paso), 6, 4); ctx.fillStyle = '#1a1a2e'; ctx.fillRect(-2, -16 + Math.abs(paso), 1, 1); ctx.fillRect(1, -16 + Math.abs(paso), 1, 1);
        ctx.fillStyle = col2; ctx.fillRect(-9, -12, 2, 8); ctx.fillRect(7, -12, 2, 8); ctx.fillRect(-5, -3 + Math.max(0, paso), 3, 4); ctx.fillRect(2, -3 + Math.max(0, -paso), 3, 4);
        break; }
      case 'hielo': {
        ctx.globalAlpha = 0.92; R(-5, -11 + Math.abs(paso), 10, 8, col); ctx.globalAlpha = 1;
        ctx.fillStyle = '#eaf7ff'; ctx.fillRect(-3, -15, 2, 4); ctx.fillRect(1, -16, 2, 5); ctx.fillRect(-1, -9, 3, 2);
        ctx.fillStyle = '#12303f'; ctx.fillRect(-2, -8, 1, 1); ctx.fillRect(2, -8, 1, 1);
        ctx.fillStyle = col2; ctx.fillRect(-4, -3 + Math.max(0, paso), 2, 3); ctx.fillRect(2, -3 + Math.max(0, -paso), 2, 3);
        break; }
      case 'serpiente': {
        const ond = Math.sin(this.tiempo * 6 + c.anim * 4);
        ctx.fillStyle = col; for (let i = 0; i < 4; i++) ctx.fillRect(-8 + i * 4, -5 + Math.round(Math.sin(ond + i) * 1.5), 5, 3);
        R(4, -8 + Math.round(ond), 6, 5, col); ctx.fillStyle = '#1a1a2e'; ctx.fillRect(8, -6 + Math.round(ond), 1, 1); ctx.fillStyle = '#ff5470'; ctx.fillRect(10, -6 + Math.round(ond), 2, 1);
        break; }
      case 'tortuga': {
        R(-7, -7, 14, 5, col); ctx.fillStyle = col2; ctx.fillRect(-5, -6, 4, 3); ctx.fillRect(1, -6, 4, 3); ctx.fillRect(-2, -6, 3, 3);
        R(7, -6, 4, 3, '#7a9a6a'); ctx.fillStyle = '#1a1a2e'; ctx.fillRect(9, -5, 1, 1);
        ctx.fillStyle = col2; ctx.fillRect(-5, -2 + Math.max(0, paso), 2, 2); ctx.fillRect(4, -2 + Math.max(0, -paso), 2, 2);
        break; }
      case 'nutria': {
        R(-6, -8 + Math.abs(paso), 11, 5, col); R(5, -11 + Math.abs(paso), 5, 5, col); ctx.fillStyle = '#1a1a2e'; ctx.fillRect(8, -9 + Math.abs(paso), 1, 1); ctx.fillRect(9, -7 + Math.abs(paso), 1, 1);
        ctx.fillStyle = col2; ctx.fillRect(-11, -6, 5, 2); ctx.fillRect(-4, -3 + Math.max(0, paso), 2, 3); ctx.fillRect(3, -3 + Math.max(0, -paso), 2, 3);
        ctx.fillStyle = '#e8dcc8'; ctx.fillRect(5, -6 + Math.abs(paso), 4, 2);
        break; }
      case 'salamandra': {
        R(-6, -6 + Math.abs(paso), 10, 4, col); R(4, -8 + Math.abs(paso), 5, 4, col); ctx.fillStyle = '#1a1a2e'; ctx.fillRect(7, -7 + Math.abs(paso), 1, 1);
        ctx.fillStyle = '#ffd23e'; ctx.fillRect(-4, -5, 2, 1); ctx.fillRect(0, -5, 2, 1); ctx.fillRect(-11, -5, 5, 2);
        ctx.fillStyle = col2; ctx.fillRect(-3, -3 + Math.max(0, paso), 2, 2); ctx.fillRect(2, -3 + Math.max(0, -paso), 2, 2);
        break; }
      case 'buho': {
        const bobB = Math.round(Math.sin(this.tiempo * 2.4 + c.x) * 1.5);
        ctx.globalAlpha = 0.95; R(-6, -14 + bobB, 12, 10, col); ctx.globalAlpha = 1;
        ctx.fillStyle = col2; ctx.fillRect(-8, -12 + bobB, 3, 4); ctx.fillRect(5, -12 + bobB, 3, 4);
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(-3, -11 + bobB, 2, 2); ctx.fillRect(1, -11 + bobB, 2, 2);
        ctx.fillStyle = '#ffd23e'; ctx.fillRect(-1, -8 + bobB, 2, 2);
        break; }
      case 'halcon': {
        const bobH = Math.round(Math.sin(this.tiempo * 3 + c.x) * 2);
        R(-5, -13 + bobH, 10, 6, col); R(5, -15 + bobH, 5, 5, col); ctx.fillStyle = '#1a1a2e'; ctx.fillRect(8, -13 + bobH, 1, 2);
        ctx.fillStyle = col2; ctx.fillRect(-10, -14 + bobH, 5, 2); ctx.fillRect(5, -14 + bobH, 5, 2); ctx.fillRect(-3, -8 + bobH, 2, 2);
        break; }
      case 'grifo': {
        R(-7, -9 + Math.abs(paso), 13, 6, col); R(5, -13 + Math.abs(paso), 6, 6, col); R(5, -16 + Math.abs(paso), 2, 3, col2); R(9, -16 + Math.abs(paso), 2, 3, col2);
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(9, -11 + Math.abs(paso), 1, 2);
        ctx.fillStyle = col2; ctx.fillRect(-9, -13, 4, 2); ctx.fillRect(4, -13, 4, 2); ctx.fillRect(-5, -3 + Math.max(0, paso), 2, 4); ctx.fillRect(3, -3 + Math.max(0, -paso), 2, 4);
        break; }
      default: R(-6, -10, 12, 7, col); R(5, -13, 5, 5, col);
    }
    ctx.restore();
    if (c.vida < c.stats.vida) { const w = 14, vx = Math.round(c.x * 16 - w / 2), vy = Math.round(c.y * 16) - 26; ctx.fillStyle = '#05070f'; ctx.fillRect(vx - 1, vy - 1, w + 2, 4); ctx.fillStyle = c.temperamento === 'hostil' ? '#ff5470' : '#67e08a'; ctx.fillRect(vx, vy, Math.round(w * Math.max(0, c.vida / c.stats.vida)), 2); }
    if (c.estado === 'persigue') this.texto(ctx, '!', c.x * 16, c.y * 16 - 34, 1, '#ff4d4d', 'center');
    if (c.invocada) { ctx.strokeStyle = 'rgba(103,224,138,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(c.x * 16, c.y * 16 - 8, 11 + Math.sin(this.tiempo * 4) * 1.2, 0, Math.PI * 2); ctx.stroke(); }
  },
  // Cara de criatura para el retrato del diálogo (canvas 64×64)
  caraBestia(cv, c) {
    const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#0e1530'; ctx.fillRect(0, 0, 64, 64);
    const mini = document.createElement('canvas'); mini.width = 32; mini.height = 32;
    const mctx = mini.getContext('2d'); mctx.save(); mctx.translate(16, 24);
    const cc = { x: 0, y: 0, sprite: c.sprite, color: c.color, color2: c.color2, escala: 1.6, flash: 0, vida: c.vida, stats: c.stats, anim: 0, moviendo: false, dir: { x: 0, y: 1 }, estado: '', invocada: false, temperamento: c.temperamento };
    this.criatura(mctx, cc, { x: 99, y: 99 });
    mctx.restore();
    ctx.drawImage(mini, 0, 0, 32, 32, 8, 10, 48, 48);
  },
  // Ventana deslizante del minimapa: 64×48 celdas alrededor del jugador (2 px por
  // celda en el lienzo de 128×96). Conforme avanza, la ventana le sigue; lo que
  // quedó muy atrás sale de la ventana y se borra (no queda dibujado).
  MINIMAPA_W: 64, MINIMAPA_H: 48,
  ventanaMinimapa(estado) {
    const m = estado.mapa; const j = estado.jugador;
    const w = Math.min(this.MINIMAPA_W, m.ancho), h = Math.min(this.MINIMAPA_H, m.alto);
    const x0 = Math.max(0, Math.min(m.ancho - w, Math.floor(j.x - w / 2)));
    const y0 = Math.max(0, Math.min(m.alto - h, Math.floor(j.y - h / 2)));
    return { x0, y0, w, h };
  },
  minimapa(cv, estado) {
    if (!cv || !estado || !estado.mapa || !estado.mapa.tiles) return;
    if (U.HUD && U.HUD.enGuarida && U.HUD.enGuarida(estado)) return; // en guarida no hay minimapa
    const ctx = cv.getContext('2d'); const m = estado.mapa; const cols = ['#2e7d4f', '#8a6b46', '#1f5f9e', '#c9a86a', '#4a3a3a', '#6b7280', '#7a5a3a', '#24513a', '#dbbf85', '#e8eef4', '#5d6472'];
    const v = this.ventanaMinimapa(estado); const sx = cv.width / v.w, sy = cv.height / v.h;
    ctx.fillStyle = '#0e1530'; ctx.fillRect(0, 0, cv.width, cv.height);
    // Muestreo por píxel del lienzo, NO por celda del mapa: cada píxel pinta el
    // color de la celda de LA VENTANA que le toca (el continente mide 440×400).
    for (let py = 0; py < cv.height; py++) for (let px = 0; px < cv.width; px++) { const tx = Math.min(m.ancho - 1, v.x0 + Math.floor(px / sx)), ty = Math.min(m.alto - 1, v.y0 + Math.floor(py / sy)); ctx.fillStyle = cols[m.tiles[ty * m.ancho + tx]] || '#2e7d4f'; ctx.fillRect(px, py, 1, 1); }
    const X = x => (x - v.x0) * sx, Y = y => (y - v.y0) * sy;
    const dentro = (x, y) => x >= v.x0 - 1 && x < v.x0 + v.w + 1 && y >= v.y0 - 1 && y < v.y0 + v.h + 1;
    m.objetos.forEach(o => { if (!dentro(o.x, o.y)) return; if (o.tipo === 'casa') { ctx.fillStyle = '#b98a5a'; ctx.fillRect(X(o.x), Y(o.y), o.w * sx, o.h * sy); } else if (o.tipo === 'arbol') { ctx.fillStyle = '#1f5c3a'; ctx.fillRect(X(o.x), Y(o.y), sx, sy); } else if (o.tipo === 'escondite' && o.descubierto) { ctx.fillStyle = o.color || '#d9a441'; ctx.fillRect(X(o.x) - 1, Y(o.y) - 1, 3, 3); } });
    const ar = m.arena; if (ar && !m.ocultarRuna && dentro(ar.x, ar.y)) { ctx.strokeStyle = estado.arena.activa ? '#ff5470' : '#ffe14d'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc((ar.x + 0.5 - v.x0) * sx, (ar.y + 0.5 - v.y0) * sy, ar.r * sx, 0, Math.PI * 2); ctx.stroke(); }
    (m.salidas || []).forEach(s => { if (!dentro(s.x, s.y)) return; ctx.fillStyle = '#ffe14d'; ctx.fillRect((s.x + s.w / 2 - v.x0) * sx - 2, (s.y + s.h / 2 - v.y0) * sy - 2, 4, 4); });
    estado.npcs.forEach(n => { if (n.enCasa || !dentro(n.x, n.y)) return; ctx.fillStyle = '#35c6f4'; ctx.fillRect(X(n.x) - 1, Y(n.y) - 1, 3, 3); });
    estado.enemigos.forEach(e => { if (e.vida > 0 && dentro(e.x, e.y)) { ctx.fillStyle = '#ff4d4d'; ctx.fillRect(X(e.x) - 1, Y(e.y) - 1, 3, 3); } });
    (estado.criaturas || []).forEach(c => { if (c.vida > 0 && dentro(c.x, c.y)) { ctx.fillStyle = c.invocada ? '#67e08a' : c.temperamento === 'hostil' ? '#ff8a9c' : '#e05bd0'; ctx.fillRect(X(c.x) - 1, Y(c.y) - 1, 3, 3); } });
    const j = estado.jugador; const p = 0.5 + 0.5 * Math.sin(this.tiempo * 5); ctx.fillStyle = '#fff'; ctx.fillRect(X(j.x) - 1.5, Y(j.y) - 1.5, 4, 4); ctx.strokeStyle = 'rgba(255,255,255,' + (0.3 + p * 0.5) + ')'; ctx.beginPath(); ctx.arc(X(j.x), Y(j.y), 3 + p * 2, 0, Math.PI * 2); ctx.stroke();
  },
  // Mapa COMPLETO con niebla de guerra (Pausa → Mapa): lo explorado QUEDA revelado
  // (para poder volver), lo no explorado está oscuro. Las zonas reveladas por rumor
  // se ven enteras, con marco dorado y nombre. `mapa` es el continente (E.mapas.aldea).
  mapaCompleto(cv, estado, mapa) {
    if (!cv || !estado) return;
    const m = mapa || estado.mapa; if (!m || !m.tiles) return;
    if (U.HUD && U.HUD.enGuarida && U.HUD.enGuarida(estado)) return;
    const ctx = cv.getContext('2d'); const cols = ['#2e7d4f', '#8a6b46', '#1f5f9e', '#c9a86a', '#4a3a3a', '#6b7280', '#7a5a3a', '#24513a', '#dbbf85', '#e8eef4', '#5d6472'];
    const sx = cv.width / m.ancho, sy = cv.height / m.alto;
    const visto = (x, y) => !U.HUD || !U.HUD.bloqueExplorado || U.HUD.bloqueExplorado(estado, x, y);
    ctx.fillStyle = '#0a0f24'; ctx.fillRect(0, 0, cv.width, cv.height);
    for (let py = 0; py < cv.height; py++) for (let px = 0; px < cv.width; px++) { const tx = Math.min(m.ancho - 1, Math.floor(px / sx)), ty = Math.min(m.alto - 1, Math.floor(py / sy)); if (!visto(tx, ty)) continue; ctx.fillStyle = cols[m.tiles[ty * m.ancho + tx]] || '#2e7d4f'; ctx.fillRect(px, py, 1, 1); }
    const X = x => x * sx, Y = y => y * sy;
    (m.zonas || []).forEach(z => {
      const revelada = estado.explorado && estado.explorado.zonas && estado.explorado.zonas.indexOf(z.id) >= 0;
      const explorada = visto(z.x + z.w / 2, z.y + z.h / 2);
      if (!revelada && !explorada) return;
      if (revelada && !explorada) { // por rumor: se ve el rectángulo, marcado en dorado
        ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 2; ctx.strokeRect(X(z.x), Y(z.y), z.w * sx, z.h * sy);
        this.texto(ctx, z.nombre.toUpperCase(), X(z.x + z.w / 2), Y(z.y + z.h / 2) - 4, 1, '#ffe14d', 'center');
      }
    });
    m.objetos.forEach(o => { if (!visto(o.x, o.y)) return; if (o.tipo === 'casa') { ctx.fillStyle = '#b98a5a'; ctx.fillRect(X(o.x), Y(o.y), o.w * sx, o.h * sy); } else if (o.tipo === 'arbol') { ctx.fillStyle = '#1f5c3a'; ctx.fillRect(X(o.x), Y(o.y), sx, sy); } else if (o.tipo === 'escondite' && o.descubierto) { ctx.fillStyle = o.color || '#d9a441'; ctx.fillRect(X(o.x) - 1, Y(o.y) - 1, 3, 3); } });
    const ar = m.arena; if (ar && !m.ocultarRuna && visto(ar.x, ar.y)) { ctx.strokeStyle = estado.arena.activa ? '#ff5470' : '#ffe14d'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc((ar.x + 0.5) * sx, (ar.y + 0.5) * sy, ar.r * sx, 0, Math.PI * 2); ctx.stroke(); }
    const j = estado.jugador;
    const pj = estado.mapaId === 'aldea' ? { x: j.x, y: j.y } : (m.pueblos && m.pueblos.bruma ? m.pueblos.bruma : { x: m.inicio.x, y: m.inicio.y });
    const p = 0.5 + 0.5 * Math.sin(this.tiempo * 5); ctx.fillStyle = '#fff'; ctx.fillRect(X(pj.x) - 2, Y(pj.y) - 2, 4, 4); ctx.strokeStyle = 'rgba(255,255,255,' + (0.3 + p * 0.5) + ')'; ctx.beginPath(); ctx.arc(X(pj.x), Y(pj.y), 4 + p * 2, 0, Math.PI * 2); ctx.stroke();
  }
};
