/* === test-correccion2.js === */
/* CORRECCIÓN 2 · Test de simulación en Node (archivos REALES + stubs mínimos).
   Uso: node test-correccion2.js   (sale con código 0 si todo pasa, 1 si algo falla)
   Carga los archivos reales js/datos/{elementos,atributos,estadisticas,habilidades}.js,
   js/sistemas/economia.js y js/ui/test-ui.js, y simula partidas nuevas con el
   perfil que devuelve el test REAL (U.TestUI.calcular con puntuaciones forzadas).
   NO toca el DOM ni el navegador: U.Juego es un stub con el jugador actual.
   Verifica:
     (1) partida nueva NO tiene Resistencia de Acero ni ninguna técnica avanzada
         dominada/equipada (solo el básico de su elemento);
     (2) el básico correcto para los 5 elementos (y que el básico de un segundo
         elemento NO viene regalado);
     (3) al aprender/entrenar una técnica nueva aparece su botón (auto-equipo);
     (4) Opciones permite elegir qué técnicas aparecen como botones (quitar/poner,
         tope de 5, no se puede equipar lo no aprendido);
     (5) partidas VIEJAS (sin marca desdeCero) conservan la regla de antes. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

global.window = global; // los archivos hacen `window.U = window.U || {}`
global.U = global.U || {};
const cargar = rel => vm.runInThisContext(fs.readFileSync(path.join(__dirname, rel), 'utf8'), { filename: rel });
['js/datos/elementos.js', 'js/datos/atributos.js', 'js/datos/estadisticas.js',
 'js/datos/habilidades.js', 'js/sistemas/economia.js', 'js/ui/test-ui.js'].forEach(cargar);

const H = U.Habilidades;
const BASICO_ESPERADO = { fuego: 'tec:fuego:llamarada', agua: 'tec:agua:chorro', tierra: 'tec:tierra:roca', viento: 'tec:viento:rafaga', rayo: 'tec:rayo:chispa' };

let pass = 0, fail = 0; const fallos = [];
function t(nombre, cond, detalle) {
  if (cond) { pass++; console.log('  PASS ' + nombre); }
  else { fail++; fallos.push(nombre); console.log('  FAIL ' + nombre + (detalle ? ' — ' + detalle : '')); }
}
const ids = lista => lista.map(x => typeof x === 'string' ? x : x.id);

// Perfil REAL del test: puntuaciones forzadas para que el elemento pedido salga primero.
function perfilPara(el, opts) {
  opts = opts || {};
  const p = { fuego: 0, agua: 0, tierra: 0, viento: 0, rayo: 0 };
  p[el] = 10;
  if (opts.segundo) { p[opts.segundo] = 8; p[{ fuego: 'agua', agua: 'fuego', tierra: 'rayo', viento: 'tierra', rayo: 'viento' }[el]] = 6; }
  U.TestUI.ordenSabores = ['dulce', 'salado', 'picante', 'ácido', 'amargo'];
  U.TestUI.scores = { p, s: opts.s || {}, a: { tenaz: 5 }, e: { yin: 0, yang: opts.yangAfin ? 5 : 0 } };
  return U.TestUI.calcular();
}
// Jugador nuevo tal como lo construye U.Juego.comenzarMundo (mismos campos que importan).
function jugadorDesdePerfil(perfil) {
  const j = { elemento: perfil.elemento, elemento2: perfil.elemento2,
    elementos: perfil.elemento2 ? [perfil.elemento, perfil.elemento2] : [perfil.elemento],
    elementoActivo: perfil.elemento,
    maestria: Object.assign({}, perfil.maestria), estilos: Object.assign({}, perfil.estilos),
    tieneYang: !!perfil.yangAfin,
    hechicero: { potencial: !!perfil.hechiceroPotencial, basicos: 0, basicas: [], despertado: false },
    escudoAprendido: false, equipo: [], tecnicasAprendidas: [], _equipoVisto: {} };
  Object.assign(j, H.nuevoJugador(perfil));
  U.Juego = { estado: { jugador: j, contratos: { sangre: [], alma: null } } }; // stub para aprenderTecnica
  return j;
}

console.log('== (1)+(2) Partida nueva: solo el básico, para los 5 elementos ==');
['fuego', 'agua', 'tierra', 'viento', 'rayo'].forEach(el => {
  const perfil = perfilPara(el);
  t('maestría inicial de ' + el + ' es 5% (principiante)', perfil.maestria[el] === 5, 'maestria=' + perfil.maestria[el]);
  const j = jugadorDesdePerfil(perfil);
  const dom = ids(H.dominadas(j));
  t(el + ': dominadas == solo su básico', dom.length === 1 && dom[0] === BASICO_ESPERADO[el], 'dominadas=' + JSON.stringify(dom));
  t(el + ': equipo == solo su básico', j.equipo.length === 1 && j.equipo[0] === BASICO_ESPERADO[el], 'equipo=' + JSON.stringify(j.equipo));
  t(el + ': sin Resistencia de Acero dominada', dom.indexOf('yin:acero') < 0);
  t(el + ': sin Yang dominado', dom.every(id => id.indexOf('yang:') !== 0), 'dominadas=' + JSON.stringify(dom));
  t(el + ': sin Místico dominado', dom.every(id => id.indexOf('mistico:') !== 0));
  t(el + ': sin Escudo ni especiales ni fusiones', dom.every(id => ['escudo'].indexOf(id) < 0 && id.indexOf('especial:') !== 0 && id.indexOf('fusion:') !== 0));
  t(el + ': equipoDetalles muestra 1 botón', H.equipoDetalles(j).length === 1);
});

console.log('== (2b) Segundo elemento: su básico NO viene regalado ==');
{
  const perfil = perfilPara('tierra', { segundo: 'fuego' });
  t('tierra+fuego: elemento2 es fuego', perfil.elemento2 === 'fuego', 'elemento2=' + perfil.elemento2);
  const j = jugadorDesdePerfil(perfil);
  const dom = ids(H.dominadas(j));
  t('tierra+fuego: dominadas == solo Roca (básico principal)', dom.length === 1 && dom[0] === 'tec:tierra:roca', 'dominadas=' + JSON.stringify(dom));
  t('tierra+fuego: Llamarada (básico del 2º) NO dominada', dom.indexOf('tec:fuego:llamarada') < 0);
}

console.log('== (3) Al aprender/entrenar aparece el botón ==');
{
  const j = jugadorDesdePerfil(perfilPara('tierra'));
  j.maestria.tierra = 25; // entrenar de 5% a 25%: supera el umbral de Muro de Piedra
  t('tierra 25%: Muro de Piedra dominado', H.aprendida(j, H.porId(j, 'tec:tierra:muroPiedra')));
  H.asegurarEquipo(j);
  t('tierra 25%: Muro de Piedra aparece en el equipo (botón)', j.equipo.indexOf('tec:tierra:muroPiedra') >= 0, 'equipo=' + JSON.stringify(j.equipo));
  j.estilos.yin = 20; // entrenar Yin de 0 a 20: umbral de Resistencia de Acero
  t('Yin 20: Resistencia de Acero dominada', H.aprendida(j, H.porId(j, 'yin:acero')));
  H.asegurarEquipo(j);
  t('Yin 20: Acero aparece en el equipo (botón)', j.equipo.indexOf('yin:acero') >= 0, 'equipo=' + JSON.stringify(j.equipo));
}
{
  // Especial por Guía (minijuego → aprenderTecnica): entra a tecnicasAprendidas y al equipo.
  const j = jugadorDesdePerfil(perfilPara('agua'));
  const ok = H.aprenderTecnica('especial:dragonLago');
  t('especial Dragón del Lago: aprenderTecnica la concede', ok === true);
  t('especial Dragón del Lago: aparece en el equipo (botón)', j.equipo.indexOf('especial:dragonLago') >= 0, 'equipo=' + JSON.stringify(j.equipo));
}
{
  // Yang con afinidad: al nacer despierto pero SIN formas; con un poco de entreno aparece el Haz.
  const j = jugadorDesdePerfil(perfilPara('fuego', { yangAfin: true }));
  t('Yang afinidad: al nacer NO hay formas Yang dominadas', ids(H.dominadas(j)).every(id => id.indexOf('yang:') !== 0));
  j.estilos.yang = 6;
  t('Yang 6: Haz dominado tras entrenar un poco', H.aprendida(j, H.porId(j, 'yang:haz')));
  H.asegurarEquipo(j);
  t('Yang 6: Haz aparece en el equipo (botón)', j.equipo.indexOf('yang:haz') >= 0, 'equipo=' + JSON.stringify(j.equipo));
}
{
  // Místico con potencial: sin básicas, nada; con la 1ª básica (Arcana) se abren Velo y Eco.
  const j = jugadorDesdePerfil(perfilPara('agua', { s: { mente: 3 } }));
  t('Místico potencial revelado en el test', j.hechicero.potencial === true);
  t('Místico: sin básicas, nada dominado', ids(H.dominadas(j)).every(id => id.indexOf('mistico:') !== 0));
  j.hechicero.basicos = 1; j.hechicero.basicas = ['sentido'];
  t('Místico: con 1 básica, Velo de Niebla dominado', H.aprendida(j, H.porId(j, 'mistico:veloNiebla')));
  t('Místico: con 1 básica, Eco Mental dominado', H.aprendida(j, H.porId(j, 'mistico:ecoMental')));
}

console.log('== (4) Opciones: el jugador elige qué botones ve ==');
{
  const j = jugadorDesdePerfil(perfilPara('tierra'));
  j.maestria.tierra = 70; j.estilos.yin = 20; // muchas aprendidas: Roca, Temblor, Avalancha, Muro, Garra + Sobrecarga y Acero
  H.asegurarEquipo(j);
  t('equipo lleno a 5 con lo aprendido', j.equipo.length === 5, 'equipo=' + JSON.stringify(j.equipo));
  t('equipo lleno: Sobrecarga aprendida pero SIN hueco (no entra sola)', j.equipo.indexOf('yin:sobrecarga') < 0);
  const r1 = H.desequipar(j, 'tec:tierra:roca');
  t('QUITAR: el básico sale del equipo (el botón se esconde)', r1.indexOf('tec:tierra:roca') < 0);
  t('QUITAR: la técnica sigue dominada (no se olvida)', H.aprendida(j, H.porId(j, 'tec:tierra:roca')));
  const r2 = H.equipar(j, 'yin:sobrecarga');
  t('EQUIPAR: Sobrecarga (aprendida) entra con hueco libre', r2.ok === true, 'r=' + JSON.stringify(r2));
  t('EQUIPAR: Sobrecarga aparece en el equipo', j.equipo.indexOf('yin:sobrecarga') >= 0);
  const r3 = H.equipar(j, 'tec:tierra:terremoto');
  t('EQUIPAR: Terremoto (NO aprendida, 85%) se rechaza', r3.ok === false, 'r=' + JSON.stringify(r3));
  const r4 = H.equipar(j, 'yin:acero');
  t('EQUIPAR: con equipo lleno (5) se rechaza aunque esté aprendida', r4.ok === false, 'r=' + JSON.stringify(r4));
  H.desequipar(j, 'tec:tierra:temblor');
  const r5 = H.equipar(j, 'yin:acero');
  t('EQUIPAR: tras quitar una, Acero sí entra', r5.ok === true);
  const antes = j.equipo.slice();
  H.moverEquipo(j, 'yin:acero', -1);
  t('ORDEN: mover una técnica cambia el orden de los botones', j.equipo.join('|') !== antes.join('|') && j.equipo.indexOf('yin:acero') >= 0);
}

console.log('== (5) Partidas VIEJAS: la regla de antes, sin tocar ==');
{
  // Sin marca desdeCero y sin snapshots: maestría 20% = primera técnica dominada, Yin 20 = Acero.
  const j = { elemento: 'tierra', elemento2: null, elementos: ['tierra'], elementoActivo: 'tierra',
    maestria: { fuego: 0, agua: 0, tierra: 20, viento: 0, rayo: 0 }, estilos: { yin: 20, yang: 0 },
    tieneYang: false, hechicero: { potencial: false, basicos: 0, basicas: [] },
    escudoAprendido: false, equipo: [], tecnicasAprendidas: [], _equipoVisto: {} };
  const dom = ids(H.dominadas(j));
  t('vieja: Roca dominada por maestría 20% (regla antigua)', dom.indexOf('tec:tierra:roca') >= 0, 'dominadas=' + JSON.stringify(dom));
  t('vieja: Acero dominado por Yin 20 (regla antigua)', dom.indexOf('yin:acero') >= 0);
  H.asegurarEquipo(j);
  t('vieja: el equipo conserva lo dominado', j.equipo.indexOf('tec:tierra:roca') >= 0 && j.equipo.indexOf('yin:acero') >= 0, 'equipo=' + JSON.stringify(j.equipo));
}

console.log('\nCORRECCIÓN 2 · tests: ' + pass + ' PASS, ' + fail + ' FAIL' + (fail ? ' — fallos: ' + fallos.join(' | ') : ''));
process.exit(fail ? 1 : 0);
