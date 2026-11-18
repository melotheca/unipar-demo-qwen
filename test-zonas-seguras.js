/* === test-zonas-seguras.js === */
/* ZONAS SEGURAS · Test de simulación en Node (archivos REALES + stubs mínimos).
   Uso: node test-zonas-seguras.js   (sale con código 0 si todo pasa, 1 si algo falla)
   Carga los archivos reales js/motor/grid.js, js/datos/{elementos,estadisticas,
   personas}.js, js/sistemas/{tiempo,combate,vida,reliquias,zonasSeguras}.js,
   construye el MAPA CONTINUO REAL (440×400, semilla fija) y simula:
     (1) de DÍA dentro de la zona segura de Bruma: 0 spawns ambientales;
     (2) de NOCHE dentro: salen bandidos (pocos);
     (3) de DÍA FUERA (zona de transición): muchos más ladrones que dentro;
     (4) de NOCHE FUERA: aún más que de día fuera;
     (5) un ladrón que te persigue CRUZA el límite y te sigue dentro del pueblo
         (no desaparece, queda marcado persigueEnPueblo);
     (6) los aldeanos HUYEN cuando el enemigo entra en el pueblo;
     (7) los patrulleros CONVERGEN al intruso dentro del pueblo, le pegan y se
         retiran cuando ya no hay intrusos;
     (8) esSalvaje (máscaras/coleccionistas) ahora usa el círculo, no el
         rectángulo viejo de zona.
   Para medir la TASA de spawn sin que el tope de vivos la frene, cada ladrón
   generado se retira justo después de contarlo (como si el jugador lo
   derrotara): se cuentan EVENTOS de spawn en 600 s simulados. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

global.window = global;
global.U = global.U || {};
const cargar = rel => vm.runInThisContext(fs.readFileSync(path.join(__dirname, rel), 'utf8'), { filename: rel });
['js/datos/elementos.js', 'js/datos/atributos.js', 'js/datos/estadisticas.js', 'js/datos/habilidades.js', 'js/datos/personas.js',
 'js/motor/grid.js', 'js/sistemas/tiempo.js', 'js/sistemas/combate.js',
 'js/sistemas/vida.js', 'js/sistemas/reliquias.js',
 'js/sistemas/zonasSeguras.js'].forEach(cargar);

// PRNG con semilla: la simulación es reproducible (los intervalos llevan ±20%).
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
Math.random = mulberry32(12345);

let pass = 0, fail = 0; const fallos = [];
function t(nombre, cond, detalle) {
  if (cond) { pass++; console.log('  PASS ' + nombre); }
  else { fail++; fallos.push(nombre); console.log('  FAIL ' + nombre + (detalle ? ' — ' + detalle : '')); }
}

// ---------- mundo real ----------
const mapa = U.Grid.crearMapaContinuo(mulberry32(777));
const j = { tipo: 'jugador', nombre: 'Test', x: 150.5, y: 246.5, dir: { x: 0, y: 1 }, anim: 0, moviendo: false,
  vida: 10000, esencia: 50, stats: { vida: 10000, esencia: 50, ataque: 10, defensa: 10, mente: 10, velocidad: 10 },
  maestria: {}, elemento: 'fuego', elementoActivo: 'fuego', monedas: 0, flags: {}, dash: { t: 0, cd: 0 },
  cdYin: 0, cdYang: 0, cdTec: {}, cdBasico: 0, buffs: { sobrecarga: 0 }, invuln: 0, flash: 0,
  cargando: false, escudo: false, acero: false, cansancio: 100, dot: null, invertido: 0, invMapa: null,
  caminarAgua: false, sobreAgua: false, cercaAgua: false,
  reliquias: { tenidas: [], puesta: null, artefactos: [], casa: [], encontradas: [] } };
const E = { ui: 'mundo', mapa, mapaId: 'aldea', mapas: { aldea: mapa }, jugador: j, npcs: [], enemigos: [],
  proyectiles: [], orbes: [], efectos: { particulas: [], textos: [], haces: [], anillos: [], cadenas: [], cortes: [], telegrafos: [] },
  camara: { x: 0, y: 0, shake: 0 }, reloj: U.Tiempo.crear(), dificultad: 1, arena: { activa: false },
  torneo: null, reto: null, enCombate: false, zonaActual: null, hitstop: 0, tiempo: 0, flags: {},
  resumen: { daño: 0, recibido: 0, golpes: 0, tecnicas: 0, yang: 0, bajas: 0, esquives: 0, dashes: 0, crecimiento: {}, maestria: {} } };
U.Juego = { estado: E, fin() {}, mapaPorId() { return E.mapa; }, progresoMision() {}, progresoEntreno() {}, siguienteObjetivo() {} };
U.HUD = { toast() {}, banner() {}, mostrar() {}, refrescarSimbolos() {}, refrescarChips() {} };
U.Audio = { sfx() {}, musica() {}, init() {}, reanudar() {}, actualizar() {} };
U.Crecimiento = { stat() {}, maestria() {}, estilo() {}, reset() {}, flush() {}, desafio() { return 1; } };
U.Orgs = { enemigoDerrotado() {} };
U.Recuperacion = { restaurar() {}, registrarGasto() {} };

function ponerHora(h) { E.reloj.minutos = h * 60; E.reloj.dia = 1; }
function limpiar() { E.enemigos = []; E.npcs = []; E.zonasSegurasT = null; E.flags = {}; }
// Camina en círculo de radio r alrededor de (cx,cy): 1 vuelta por ~60 s.
function caminarCirculo(cx, cy, r, tSeg) { const a = tSeg * (Math.PI * 2 / 60); j.x = cx + Math.cos(a) * r; j.y = cy + Math.sin(a) * r; }
// Cuenta EVENTOS de spawn en `seg` segundos caminando; cada ladrón generado se
// retira al contarlo para que el tope de vivos no frene la tasa.
function medirSpawn(seg, cx, cy, r) {
  let eventos = 0; const dt = 0.5;
  for (let s = 0; s < seg; s += dt) {
    caminarCirculo(cx, cy, r, s);
    U.ZonasSeguras.tick(dt);
    const nuevos = E.enemigos.filter(e => e.esLadron && !e._contado);
    nuevos.forEach(e => { e._contado = true; eventos++; });
    E.enemigos = E.enemigos.filter(e => !e._contado);
  }
  return eventos;
}

console.log('— Zonas seguras: centros (fogata de cada plaza) —');
U.ZonasSeguras.PUEBLOS.forEach(p => console.log('   ' + p.nombre + ' centro (' + p.x + ', ' + p.y + ') radio ' + U.ZonasSeguras.RADIO));
t('14 pueblos con centro definido', U.ZonasSeguras.PUEBLOS.length === 14, 'hay ' + U.ZonasSeguras.PUEBLOS.length);
t('Bruma: plaza (150.5,246.5) dentro, (165,246.5) fuera (dist 14.5 > 10)',
  U.ZonasSeguras.enZonaSegura(150.5, 246.5) && !U.ZonasSeguras.enZonaSegura(165, 246.5));

console.log('— (1)(2)(3)(4) Densidad de spawn en 600 s caminando —');
limpiar(); ponerHora(12); // día, dentro de Bruma
const diaDentro = medirSpawn(600, 150.5, 246.5, 3);
console.log('   día DENTRO de Bruma: ' + diaDentro + ' spawns');
limpiar(); ponerHora(22); // noche, dentro de Bruma
const nocheDentro = medirSpawn(600, 150.5, 246.5, 3);
console.log('   noche DENTRO de Bruma: ' + nocheDentro + ' spawns');
limpiar(); ponerHora(12); // día, fuera (transición junto a Salina, dist ~13 del centro)
const diaFuera = medirSpawn(600, 100, 200, 3);
console.log('   día FUERA (100,200): ' + diaFuera + ' spawns');
limpiar(); ponerHora(22); // noche, fuera
const nocheFuera = medirSpawn(600, 100, 200, 3);
console.log('   noche FUERA (100,200): ' + nocheFuera + ' spawns');
t('(2) de día dentro: 0 spawns', diaDentro === 0, diaDentro + ' spawns');
t('(3) de noche dentro: salen bandidos, pocos (1-8)', nocheDentro >= 1 && nocheDentro <= 8, nocheDentro + ' spawns');
t('(4) fuera de día: muchos más que dentro de día (>=10)', diaFuera >= 10, diaFuera + ' spawns');
t('(5) fuera de noche: aún más que fuera de día', nocheFuera > diaFuera, nocheFuera + ' vs ' + diaFuera);
t('(6) fuera de noche: muchos más que dentro de noche', nocheFuera > nocheDentro, nocheFuera + ' vs ' + nocheDentro);

console.log('— (5) Persecución a través del límite —');
limpiar(); ponerHora(12);
j.x = 148; j.y = 246; // jugador DENTRO de Bruma (dist 2.5 del centro)
const ladron = U.Combate.crearEnemigo('bandido', 162.5, 246.5, 1); // FUERA (dist 12 del centro)
ladron.nombre = 'Ladrón del camino'; ladron.esLadron = true;
ladron.stats.vida = 100000; ladron.vida = 100000; // a propósito muy duro: los patrulleros del pueblo le pegarán durante la prueba y no deben matarlo antes de medir el cruce
E.enemigos.push(ladron);
const dCentro0 = Math.hypot(ladron.x - 150.5, ladron.y - 246.5);
let cruzo = false, marcadoAlCruzar = false;
for (let s = 0; s < 40; s += 0.25) {
  U.ZonasSeguras.tick(0.25); U.Combate.actualizarEnemigos(0.25);
  if (!cruzo && Math.hypot(ladron.x - 150.5, ladron.y - 246.5) < 10) { cruzo = true; marcadoAlCruzar = !!ladron.persigueEnPueblo; }
}
const dCentro1 = Math.hypot(ladron.x - 150.5, ladron.y - 246.5);
console.log('   ladrón: dist al centro de Bruma ' + dCentro0.toFixed(1) + ' → ' + dCentro1.toFixed(1) + ' | vivo: ' + (ladron.vida > 0) + ' | persigueEnPueblo: ' + !!ladron.persigueEnPueblo + ' | en E.enemigos: ' + E.enemigos.includes(ladron));
t('el ladrón cruza el límite y queda DENTRO (dist < 10)', dCentro1 < 10, 'dist final ' + dCentro1.toFixed(1));
t('el ladrón sigue vivo y en el mundo (nadie lo borra al entrar)', ladron.vida > 0 && E.enemigos.includes(ladron));
t('al cruzar queda marcado persigueEnPueblo', cruzo && marcadoAlCruzar, 'cruzó=' + cruzo + ' marcado=' + marcadoAlCruzar);

console.log('— (6) Huida de aldeanos —');
limpiar(); ponerHora(12);
j.x = 150; j.y = 244;
const bram = { id: 'bram', nombre: 'Bram', x: 149.5, y: 247.5, mapa: 'aldea', enCasa: false, casaPos: { x: 149.5, y: 247.5 }, dir: { x: 0, y: 1 }, anim: 0, moviendo: false, bumpCd: 0, rutaKey: '', esenciaPuente: 100 };
E.npcs.push(bram);
const intruso = U.Combate.crearEnemigo('bandido', 152, 247, 1); intruso.nombre = 'Ladrón del camino'; intruso.esLadron = true;
E.enemigos.push(intruso);
const dHuida0 = Math.hypot(bram.x - intruso.x, bram.y - intruso.y);
U.ZonasSeguras.tick(0.25);
const huyendoAlPrincipio = !!bram.huyendo;
for (let s = 0; s < 3; s += 0.25) { U.ZonasSeguras.tick(0.25); U.Vida.mover(bram, 0.25, j); }
const dHuida1 = Math.hypot(bram.x - intruso.x, bram.y - intruso.y);
console.log('   Bram: dist al intruso ' + dHuida0.toFixed(1) + ' → ' + dHuida1.toFixed(1) + ' | huyendo: ' + huyendoAlPrincipio + ' | pos final (' + bram.x.toFixed(1) + ', ' + bram.y.toFixed(1) + ')');
t('el aldeano entra en huida (n.huyendo)', huyendoAlPrincipio);
t('el aldeano se aleja del intruso (+1 casilla o más en 3 s)', dHuida1 > dHuida0 + 1, dHuida0.toFixed(1) + ' → ' + dHuida1.toFixed(1));

console.log('— (7) Patrulleros convergen —');
limpiar(); ponerHora(12);
j.x = 150; j.y = 244;
const intruso2 = U.Combate.crearEnemigo('bandido', 152, 247, 1); intruso2.nombre = 'Ladrón del camino'; intruso2.esLadron = true;
E.enemigos.push(intruso2);
const vidaIntruso0 = intruso2.vida;
let dPatrulla0 = null, dPatrulla1 = null, nPatrulla = 0, nPatrullaMax = 0;
for (let s = 0; s < 8; s += 0.25) {
  U.ZonasSeguras.tick(0.25);
  const pats = E.enemigos.filter(e => e.esPatrullaZona && e.vida > 0);
  nPatrulla = pats.length; nPatrullaMax = Math.max(nPatrullaMax, pats.length);
  if (pats.length) {
    const d = Math.min.apply(null, pats.map(p => Math.hypot(p.x - intruso2.x, p.y - intruso2.y)));
    if (dPatrulla0 == null) dPatrulla0 = d;
    dPatrulla1 = d;
  }
}
console.log('   patrulleros (máx vistos): ' + nPatrullaMax + ' | dist al intruso ' + (dPatrulla0 == null ? '—' : dPatrulla0.toFixed(1)) + ' → ' + (dPatrulla1 == null ? '—' : dPatrulla1.toFixed(1)) + ' | vida intruso ' + vidaIntruso0 + ' → ' + intruso2.vida);
t('salen patrulleros del pueblo (1-2)', nPatrullaMax >= 1 && nPatrullaMax <= 2, nPatrullaMax + ' patrulleros');
t('los patrulleros se acercan al intruso', dPatrulla0 != null && dPatrulla1 != null && dPatrulla1 < dPatrulla0, (dPatrulla0 || 0).toFixed(1) + ' → ' + (dPatrulla1 || 0).toFixed(1));
t('los patrulleros le pegan (vida del intruso baja)', intruso2.vida < vidaIntruso0, vidaIntruso0 + ' → ' + intruso2.vida);
E.enemigos = E.enemigos.filter(e => e !== intruso2); // intruso eliminado / fuera
U.ZonasSeguras.tick(0.5);
const patsTras = E.enemigos.filter(e => e.esPatrullaZona).length;
console.log('   sin intrusos, patrulleros restantes: ' + patsTras);
t('sin intrusos la patrulla se retira', patsTras === 0, patsTras + ' restantes');

console.log('— (8) esSalvaje usa el círculo —');
limpiar();
j.x = 150.5; j.y = 246.5;
const salvajeDentro = U.Reliquias.esSalvaje(E);
j.x = 165; j.y = 246.5; // dentro del RECTÁNGULO viejo de la zona 'aldea' (138-176), fuera del círculo
const salvajeBorde = U.Reliquias.esSalvaje(E);
j.x = 100; j.y = 200;
const salvajeFuera = U.Reliquias.esSalvaje(E);
console.log('   centro Bruma: salvaje=' + salvajeDentro + ' | borde (165,246.5): salvaje=' + salvajeBorde + ' | fuera (100,200): salvaje=' + salvajeFuera);
t('dentro del círculo NO es salvaje', salvajeDentro === false);
t('fuera del círculo SÍ es salvaje (aunque caiga en el rectángulo viejo)', salvajeBorde === true);
t('lejos fuera SÍ es salvaje', salvajeFuera === true);

console.log('\n' + pass + ' PASS, ' + fail + ' FAIL' + (fallos.length ? ' — ' + fallos.join(' | ') : ''));
process.exit(fail ? 1 : 0);
