/* === test-eleccion-directa.js === */
/* Elección directa · Test de simulación en Node (archivos REALES + stubs mínimos).
   Uso: node test-eleccion-directa.js   (sale con código 0 si todo pasa, 1 si algo falla)
   Carga los archivos reales js/datos/{elementos,atributos,estadisticas}.js,
   js/sistemas/economia.js y js/ui/eleccion-directa.js, y verifica el perfil
   que devuelve U.EleccionDirecta.crearPerfil (la misma lógica pura que usa
   la UI del juego; la UI solo pinta botones y llama a crearPerfil).
   NO toca el DOM ni el navegador.
   Verifica:
     (a) Fuego + Pesado + Yang + 10/10/10/10 → Fuerza 12, Resistencia 9,
         Mente 10, Velocidad 9, Vida 118, Esencia 114; otros elementos 0,
         sin afinidad, sin bonus puro, sin bono +2 del test.
     (b) Agua + Frágil + Yin + 10/10/10/10 → Fuerza 9, Resistencia 10,
         Mente 12, Velocidad 13, Vida 110, Esencia 86.
     (c) 10/10/10/0 → 30 gastados, permitido, con aviso al confirmar
         (puntosSinGastar = 10 en el perfil).
     (d) Límites: no más de 40 puntos en total ni más de 10 por stat
         (validarPuntos recorta y reporta los errores; crearPerfil con
         valores imposibles no pasa de los topes).
     (e) Vida/Esencia 100 + bonos (casos a y b, y un tercer combo).
     (f) nivelStat todo 1, xpStat todo 0, estiloNatural correcto,
         tieneYang en el jugador (comenzarMundo lo pone siempre true),
         estilos Yin/Yang en nivel 1, maestria principal 1% y resto 0,
         metaDespertar 150/300 como el test.
   Además: el test NO se tocó (el banco, la distribución 8/6/6 y el bono +2
   siguen intactos en js/ui/test-ui.js — se comprueba por texto). */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

global.window = global; // los archivos hacen `window.U = window.U || {}`
global.U = global.U || {};
const cargar = rel => vm.runInThisContext(fs.readFileSync(path.join(__dirname, rel), 'utf8'), { filename: rel });
['js/datos/elementos.js', 'js/datos/atributos.js', 'js/datos/estadisticas.js',
 'js/sistemas/economia.js', 'js/ui/eleccion-directa.js'].forEach(cargar);

let pass = 0, fail = 0; const fallos = [];
function t(nombre, cond, detalle) {
  if (cond) { pass++; console.log('  PASS ' + nombre); }
  else { fail++; fallos.push(nombre); console.log('  FAIL ' + nombre + (detalle ? ' — ' + detalle : '')); }
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const DIEZ = { ataque: 10, defensa: 10, mente: 10, velocidad: 10 };

console.log('== (a) Fuego + Pesado + Yang + 10/10/10/10 ==');
const pa = U.EleccionDirecta.crearPerfil('fuego', 'pesado', 'yang', DIEZ);
console.log('   stats:', JSON.stringify(pa.stats));
t('Fuerza (ataque) 12 = 10+2 elem+0 atr', pa.stats.ataque === 12, 'salió ' + pa.stats.ataque);
t('Resistencia (defensa) 9 = 10-1+0', pa.stats.defensa === 9, 'salió ' + pa.stats.defensa);
t('Mente 10 = 10+0+0', pa.stats.mente === 10, 'salió ' + pa.stats.mente);
t('Velocidad 9 = 10+1-2', pa.stats.velocidad === 9, 'salió ' + pa.stats.velocidad);
t('Vida 118 = 100+0+18', pa.stats.vida === 118, 'salió ' + pa.stats.vida);
t('Esencia 114 = 100+0+14', pa.stats.esencia === 114, 'salió ' + pa.stats.esencia);
t('Sin afinidad: xpElemento todo 0', eq(pa.xpElemento, { fuego: 0, agua: 0, tierra: 0, viento: 0, rayo: 0 }), JSON.stringify(pa.xpElemento));
t('Sin bonus puro: puro=false, bonoPuro=null', pa.puro === false && pa.bonoPuro === null);
t('Sin bono +2 del test (ataque 12, no 14)', pa.stats.ataque === 12);
t('Sin segundo elemento', pa.elemento2 === null);
t('estiloNatural yang, yangAfin true', pa.estiloNatural === 'yang' && pa.yangAfin === true);
t('Maestría: fuego 1%, resto 0', pa.maestria.fuego === 1 && pa.maestria.agua === 0 && pa.maestria.tierra === 0 && pa.maestria.viento === 0 && pa.maestria.rayo === 0, JSON.stringify(pa.maestria));
t('metaDespertar: contrarios de fuego (agua,tierra) 300, resto 150', pa.metaDespertar.agua === 300 && pa.metaDespertar.tierra === 300 && pa.metaDespertar.fuego === 150 && pa.metaDespertar.viento === 150 && pa.metaDespertar.rayo === 150, JSON.stringify(pa.metaDespertar));

console.log('== (b) Agua + Frágil + Yin + 10/10/10/10 ==');
const pb = U.EleccionDirecta.crearPerfil('agua', 'fragil', 'yin', DIEZ);
console.log('   stats:', JSON.stringify(pb.stats));
t('Fuerza 9 = 10-1+0', pb.stats.ataque === 9, 'salió ' + pb.stats.ataque);
t('Resistencia 10 = 10+0+0', pb.stats.defensa === 10, 'salió ' + pb.stats.defensa);
t('Mente 12 = 10+2+0', pb.stats.mente === 12, 'salió ' + pb.stats.mente);
t('Velocidad 13 = 10+0+3', pb.stats.velocidad === 13, 'salió ' + pb.stats.velocidad);
t('Vida 110 = 100+10+0', pb.stats.vida === 110, 'salió ' + pb.stats.vida);
t('Esencia 86 = 100+0-14', pb.stats.esencia === 86, 'salió ' + pb.stats.esencia);
t('estiloNatural yin, yangAfin false', pb.estiloNatural === 'yin' && pb.yangAfin === false);
t('metaDespertar: contrarios de agua (viento,rayo) 300', pb.metaDespertar.viento === 300 && pb.metaDespertar.rayo === 300 && pb.metaDespertar.agua === 150 && pb.metaDespertar.fuego === 150 && pb.metaDespertar.tierra === 150, JSON.stringify(pb.metaDespertar));

console.log('== (c) 10/10/10/0 → 30 gastados, permitido ==');
const vc = U.EleccionDirecta.validarPuntos({ ataque: 10, defensa: 10, mente: 10, velocidad: 0 });
t('30 gastados, 10 restantes, válido', vc.gastados === 30 && vc.restantes === 10 && vc.valido === true, JSON.stringify(vc));
const pc = U.EleccionDirecta.crearPerfil('tierra', 'tenaz', 'yin', { ataque: 10, defensa: 10, mente: 10, velocidad: 0 });
t('Perfil creado con 30 puntos; puntosSinGastar=10 (aviso en UI)', pc.puntosSinGastar === 10 && eq(pc.puntosReparto, { ataque: 10, defensa: 10, mente: 10, velocidad: 0 }), JSON.stringify(pc.puntosReparto) + ' sin gastar=' + pc.puntosSinGastar);
console.log('   stats tierra+tenaz 10/10/10/0:', JSON.stringify(pc.stats));
t('Tierra+Tenaz: ataque 8 (10+0-2)', pc.stats.ataque === 8, 'salió ' + pc.stats.ataque);
t('Tierra+Tenaz: defensa 14 (10+2+2)', pc.stats.defensa === 14, 'salió ' + pc.stats.defensa);

console.log('== (d) Límites: tope 10 por stat y 40 en total ==');
const vd1 = U.EleccionDirecta.validarPuntos({ ataque: 15, defensa: 10, mente: 10, velocidad: 10 });
t('15 en un stat → recortado a 10, con error', vd1.puntos.ataque === 10 && vd1.errores.length > 0, JSON.stringify(vd1));
const vd2 = U.EleccionDirecta.validarPuntos({ ataque: 10, defensa: 10, mente: 10, velocidad: 10 });
t('10/10/10/10 → 40 gastados, 0 restantes', vd2.gastados === 40 && vd2.restantes === 0 && vd2.valido === true, JSON.stringify(vd2));
const vd3 = U.EleccionDirecta.validarPuntos({ ataque: -3, defensa: 10, mente: 10, velocidad: 10 });
t('Negativo → recortado a 0, con error', vd3.puntos.ataque === 0 && vd3.errores.length > 0, JSON.stringify(vd3));
const pd = U.EleccionDirecta.crearPerfil('rayo', 'duro', 'yang', { ataque: 12, defensa: 12, mente: 12, velocidad: 12 });
t('crearPerfil con 12 en todo no pasa de 10 por stat (ataque saneado a 10+0+2=12)', pd.puntosReparto.ataque === 10 && pd.stats.ataque === 12, JSON.stringify(pd.puntosReparto) + ' ataque=' + pd.stats.ataque);
let tiroError = false; try { U.EleccionDirecta.crearPerfil('hielo', 'pesado', 'yang', DIEZ); } catch (e) { tiroError = true; }
t('Elemento inválido → error', tiroError);
tiroError = false; try { U.EleccionDirecta.crearPerfil('fuego', 'pesado', 'fuego', DIEZ); } catch (e) { tiroError = true; }
t('Estilo inválido → error', tiroError);

console.log('== (e) Vida/Esencia 100 + bonos (tercer combo) ==');
const pe = U.EleccionDirecta.crearPerfil('viento', 'inestable', 'yang', DIEZ);
console.log('   stats viento+inestable:', JSON.stringify(pe.stats));
t('Viento+Inestable: Vida 100, Esencia 115 (100+5+10)', pe.stats.vida === 100 && pe.stats.esencia === 115, 'vida=' + pe.stats.vida + ' esencia=' + pe.stats.esencia);
const pf = U.EleccionDirecta.crearPerfil('rayo', 'sabio', 'yin', DIEZ);
t('Rayo+Sabio: Vida 80 (100-5-15), Esencia 100', pf.stats.vida === 80 && pf.stats.esencia === 100, 'vida=' + pf.stats.vida + ' esencia=' + pf.stats.esencia);
t('Rayo+Sabio: Mente 15 (10+2+3)', pf.stats.mente === 15, 'salió ' + pf.stats.mente);

console.log('== (f) Sistema nuevo: niveles, XP, estilos ==');
[pa, pb, pc, pe, pf].forEach((p, i) => {
  t('Perfil ' + (i + 1) + ': nivelStat todo 1', eq(p.nivelStat, { vida: 1, esencia: 1, ataque: 1, defensa: 1, mente: 1, velocidad: 1 }), JSON.stringify(p.nivelStat));
  t('Perfil ' + (i + 1) + ': xpStat todo 0', eq(p.xpStat, { vida: 0, esencia: 0, ataque: 0, defensa: 0, mente: 0, velocidad: 0 }), JSON.stringify(p.xpStat));
  t('Perfil ' + (i + 1) + ': estilos yin 1 / yang 1', p.estilos.yin === 1 && p.estilos.yang === 1, JSON.stringify(p.estilos));
  t('Perfil ' + (i + 1) + ': estiloNatural correcto (' + p.estiloNatural + ')', p.estiloNatural === p.estilo);
});
// tieneYang lo pone comenzarMundo (main.js: tieneYang: true, siempre en
// partidas nuevas); aquí se comprueba por texto en el archivo real.
const mainSrc = fs.readFileSync(path.join(__dirname, 'js/main.js'), 'utf8');
t('main.js: comenzarMundo pone tieneYang: true', /tieneYang:\s*true/.test(mainSrc));
// El atributo SÍ aplica su barra de XP (favorita/penalizada) del sistema
// nuevo: factorXP es el mismo que usa el test (332103b).
t('Pesado: Vida/Esencia favoritas ×0.5, Velocidad penalizada ×5/3',
  U.Estadisticas.factorXP('pesado', 'vida') === 0.5 && U.Estadisticas.factorXP('pesado', 'esencia') === 0.5 && Math.abs(U.Estadisticas.factorXP('pesado', 'velocidad') - 5 / 3) < 1e-9);
t('Frágil: Velocidad favorita ×0.5, Esencia penalizada ×5/3',
  U.Estadisticas.factorXP('fragil', 'velocidad') === 0.5 && Math.abs(U.Estadisticas.factorXP('fragil', 'esencia') - 5 / 3) < 1e-9);
// Clamp mínimo 1 en combate: 0 puntos + bonos negativos no baja de 1.
const pmin = U.EleccionDirecta.crearPerfil('agua', 'tenaz', 'yin', { ataque: 0, defensa: 0, mente: 0, velocidad: 0 });
t('0 puntos + bonos negativos → combate mínimo 1 (ataque 1, no -3)', pmin.stats.ataque === 1, 'salió ' + pmin.stats.ataque);

console.log('== El test NO se tocó ==');
const testSrc = fs.readFileSync(path.join(__dirname, 'js/ui/test-ui.js'), 'utf8');
t('Test: distribución 8/6/6 intacta', /slice\(0, 8\)/.test(testSrc) && /slice\(0, 6\)/.test(testSrc));
t('Test: bono +2 por completar intacto', /BONO_TEST = 2/.test(testSrc));
t('Test: banco sin tocar (archivo presente y con contenido)', fs.readFileSync(path.join(__dirname, 'js/datos/test-banco.js'), 'utf8').length > 1000);
const bancoSrc = fs.readFileSync(path.join(__dirname, 'js/datos/test-banco.js'), 'utf8');
t('Test: banco tiene preguntas de los 3 tipos', bancoSrc.indexOf("'elemento'") >= 0 && bancoSrc.indexOf("'atributo'") >= 0 && bancoSrc.indexOf("'stats'") >= 0);

console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
if (fail) { console.log('Fallos: ' + fallos.join(' | ')); process.exit(1); }
console.log('TODO OK');
