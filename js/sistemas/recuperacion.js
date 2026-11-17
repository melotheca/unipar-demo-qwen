/* === js/sistemas/recuperacion.js === */
/* Unipar — recuperación: Vida AUTOMÁTICA solo bajo el 25% con TOPE exacto en el 25% (en campo abierto),
   Esencia por segundo según capacidad (siempre, a ritmo constante), Agotado al llegar a 0, poción +50%.
   Excepción: DORMIR en la fogata (interactuar con ella) restaura Vida y Esencia al 100% y adelanta el reloj. */
window.U = window.U || {};

U.Recuperacion = {
  capacidad() { const j = U.Juego.estado.jugador; const a = U.Atributos.de(j.atributo); let c = a.regen + (j.regenBonus || 0); if (j.reliquias && j.reliquias.puesta === 'esencia') c *= 1.6; return c; }, // 🎭 Máscara de la Esencia: regeneras un 60% más rápido
  velDescanso() { return U.Atributos.de(U.Juego.estado.jugador.atributo).descanso; },
  techoVida() { const j = U.Juego.estado.jugador; return j.stats.vida * 0.25; },
  // CONDICIÓN (la barra fina verde bajo la Esencia; antes se llamaba Cansancio, pero
  // "Cansancio 100%" se leía al revés: 100% cansado. Condición 100% = perfecta forma).
  // Cada 10 de Esencia GASTADA en total baja 1 de Condición. La recarga de Esencia se
  // multiplica por ESCALONES según la Condición, medidos del máximo ACTUAL (no es
  // gradual: al cruzar un límite el multiplicador salta de un escalón al otro, sin
  // valores intermedios): desde el máximo hasta la mitad (50% o más) = ×1.0 sin
  // castigo; de la mitad a un cuarto (25% a menos de 50%) = ×0.5; por debajo de un
  // cuarto (menos de 25%) = ×0.1, nunca cero. La Condición NUNCA bloquea lanzar
  // poderes: solo hace la recarga más lenta. El atributo Fluido gasta más Esencia
  // por técnica (×1.18), así que se cansa más rápido.
  // RECUPERACIÓN: mucho más lenta que la Esencia y SEGÚN EL ATRIBUTO — la misma capacidad
  // que la Esencia (base 5, Sabio 10, Duro 2) pero POR HORA DE JUEGO, no por segundo, y
  // SOLO fuera de combate (en combate no se recupera, solo baja). Dormir en la fogata o
  // en la cama la pone al 100% DEL MÁXIMO actual.
  // MÁXIMO: empieza en 100. Crece +5 CADA VEZ QUE LA CONDICIÓN CRUZA POR DEBAJO DE 25
  // (de verdad te cansaste; el valor actual también sube +5), hasta +100 por estrés
  // (máximo 200 sin Yin). Además, dominar el estilo YIN da más barra: cada nivel de Yin
  // (cada 20 puntos de estilo, Nv.0–5) suma +20 al máximo → hasta 300 en total.
  nivelYin(j) { j = j || U.Juego.estado.jugador; return Math.max(0, Math.min(5, Math.floor(((j.estilos && j.estilos.yin) || 0) / 20))); },
  condicionMax(j) { j = j || U.Juego.estado.jugador; if (j.condicionExtra == null) j.condicionExtra = 0; return 100 + Math.max(0, Math.min(100, j.condicionExtra)) + this.nivelYin(j) * 20; },
  multCansancio() { const j = U.Juego.estado.jugador; const max = this.condicionMax(j); const c = j.cansancio != null ? j.cansancio : max; if (c >= max * 0.5) return 1; if (c >= max * 0.25) return 0.5; return 0.1; },
  registrarGasto(c) {
    const j = U.Juego.estado.jugador; if (!j || !(c > 0)) return;
    if (j.cansancio == null) j.cansancio = this.condicionMax(j);
    const antes = j.cansancio;
    j.gastoFatiga = (j.gastoFatiga || 0) + c;
    while (j.gastoFatiga >= 10) { j.gastoFatiga -= 10; j.cansancio = Math.max(0, j.cansancio - 1); }
    // Subida por estrés real: solo al CRUZAR por debajo de 25 (no por gastar en general).
    if (antes >= 25 && j.cansancio < 25 && (j.condicionExtra || 0) < 100) {
      j.condicionExtra = Math.min(100, (j.condicionExtra || 0) + 5); j.cansancio += 5;
      const max = this.condicionMax(j);
      if (U.HUD) U.HUD.banner('💪 CONDICIÓN ENDURECIDA · MÁXIMO ' + max, 2);
      if (U.Combate) U.Combate.texto(j, 'CONDICIÓN MÁX. +' + 5 + ' → ' + max, '#a9c795', 1.4);
      if (U.Audio) U.Audio.sfx('unlock');
    }
  },
  // Gastar Esencia. 'ajustado' = el costo ya incluye ambiente y atributo (técnicas).
  // Los costos viven en DECIMALES: ya no se redondea a enteros (mínimo 0.1).
  gastar(cantidad, opts) {
    const j = U.Juego.estado.jugador; opts = opts || {};
    if (j.agotado) { U.HUD.toast('Agotado: recupera el 25% de Esencia antes de gastar.', 'aviso'); U.Audio.sfx('fail'); return false; }
    let c = cantidad; if (!opts.ajustado) c *= U.Atributos.multCosto(j.atributo); c = Math.max(0.1, Math.round(c * 100) / 100);
    if (j.esencia < c) { U.HUD.toast('Esencia insuficiente (' + c + ').', 'aviso'); U.Audio.sfx('fail'); return false; }
    const antes = j.esencia; j.esencia -= c; this.registrarGasto(c);
    if (j.esencia <= 0.01) { j.esencia = 0; j.agotado = true; U.Crecimiento.stat('esencia', 0.8, 1); U.HUD.toast('¡AGOTADO! Sin Esencia hasta recuperar 25%.', 'peligro'); U.Audio.sfx('derrota'); j.cargando = false; }
    else if (j.esencia < j.stats.esencia * 0.1 && antes >= j.stats.esencia * 0.1) U.Crecimiento.stat('esencia', 0.4, 1); // vaciar el tanque hace crecer el tanque
    return true;
  },
  restaurar(c) { const j = U.Juego.estado.jugador; j.esencia = Math.min(U.Reliquias ? U.Reliquias.esenciaMax(j) : j.stats.esencia, j.esencia + c); },
  sincronizar(j) { j.bolsaPociones = j.bolsaPociones || []; j.pociones = j.bolsaPociones.length; },
  // Botón rápido (Q / frasco): toma la poción de VIDA MÁS CHICA, para no desperdiciar una grande.
  pocion() {
    const j = U.Juego.estado.jugador; this.sincronizar(j);
    let idx = -1, menor = Infinity;
    j.bolsaPociones.forEach((p, i) => { if (p.tipo === 'vida' && p.unidades < menor) { menor = p.unidades; idx = i; } });
    if (idx < 0) { U.HUD.toast('No tienes poción de Vida en la mochila. Marisol te prepara una a medida en la tienda (tú eliges las unidades).', 'aviso'); U.Audio.sfx('fail'); return; }
    this.usarPocion(idx);
  },
  usarPocion(idx) {
    const E = U.Juego.estado, j = E.jugador; this.sincronizar(j);
    const p = j.bolsaPociones[idx]; if (!p) return;
    if (p.tipo === 'vida' && j.vida >= j.stats.vida) { U.HUD.toast('Tu Vida ya está llena: no desperdicies la poción (lo que sobra al tomarla se pierde).', 'aviso'); return; }
    if (p.tipo === 'esencia' && j.esencia >= (U.Reliquias ? U.Reliquias.esenciaMax(j) : j.stats.esencia)) { U.HUD.toast('Tu Esencia ya está llena.', 'aviso'); return; }
    if (p.tipo === 'condicion' && (j.cansancio || 0) >= this.condicionMax(j)) { U.HUD.toast('Tu Condición ya está al máximo.', 'aviso'); return; }
    j.bolsaPociones.splice(idx, 1); this.sincronizar(j);
    if (p.tipo === 'vida') { const antes = j.vida; j.vida = Math.min(j.stats.vida, j.vida + p.unidades); U.Combate.texto(j, '+' + Math.round(j.vida - antes) + ' VIDA', '#67e08a', 2); U.HUD.toast('Poción +' + p.unidades + ': curó ' + Math.round(j.vida - antes) + (p.unidades > j.vida - antes ? ' (el exceso se perdió, como debe ser)' : '') + '.', 'exito'); }
    else if (p.tipo === 'esencia') { const antes = j.esencia; j.esencia = Math.min(U.Reliquias ? U.Reliquias.esenciaMax(j) : j.stats.esencia, j.esencia + p.unidades); j.agotado = false; U.Combate.texto(j, '+' + Math.round(j.esencia - antes) + ' ESE', '#4da3ff', 2); U.HUD.toast('Tónico +' + p.unidades + ' de Esencia.', 'exito'); }
    else { const maxC = this.condicionMax(j); const antes = j.cansancio != null ? j.cansancio : maxC; j.cansancio = Math.min(maxC, antes + p.unidades); U.Combate.texto(j, '+' + Math.round(j.cansancio - antes) + ' CONDICIÓN', '#a9c795', 2); U.HUD.toast('Poción de Condición +' + p.unidades + '.', 'exito'); }
    U.Combate.particulas(j.x, j.y - 0.6, 14, '#67e08a', 'cura'); U.Audio.sfx('cura');
  },
  // COMER desde la mochila: máx 3 al día, solo fuera de combate, sube PORCENTAJE según TU ranking de sabores. No restaura Condición.
  comer(idx) {
    const E = U.Juego.estado, j = E.jugador;
    if (E.enCombate) { U.HUD.toast('No puedes comer en combate.', 'aviso'); U.Audio.sfx('fail'); return; }
    if ((j.comidasHoy || 0) >= 3) { U.HUD.toast('Ya comiste 3 veces hoy. Mañana, más.', 'aviso'); return; }
    const sabor = (j.bolsaComida || [])[idx]; if (!sabor) return;
    j.bolsaComida.splice(idx, 1); j.comidasHoy = (j.comidasHoy || 0) + 1;
    const ranking = j.sabores || U.Economia.SABORES; const puesto = Math.max(0, ranking.indexOf(sabor));
    const ef = U.Economia.COMER[puesto] || U.Economia.COMER[4];
    const dv = Math.round(j.stats.vida * ef.vida / 100), de = Math.round(j.stats.esencia * ef.esencia / 100);
    j.vida = Math.min(j.stats.vida, j.vida + dv); j.esencia = Math.min(j.stats.esencia, j.esencia + de); if (j.esencia > 0) j.agotado = j.esencia < j.stats.esencia * 0.25 ? j.agotado : false;
    U.Combate.particulas(j.x, j.y - 0.6, 10, '#ffb347', 'cura'); U.Audio.sfx('cura');
    U.HUD.toast('Comida ' + sabor + ' (tu sabor nº ' + (puesto + 1) + '): ' + (dv ? '+' + dv + ' Vida · ' : '') + (de ? '+' + de + ' Esencia' : puesto === 4 ? 'solo te llena: es tu sabor menos querido' : '') + ' · Comidas de hoy: ' + j.comidasHoy + '/3. (La comida no restaura Condición.)', 'exito');
  },
  toggleDescanso() {
    const E = U.Juego.estado, j = E.jugador;
    if (j.descansando) { j.descansando = false; return; }
    if (E.enCombate) { U.HUD.toast('No puedes descansar en combate.', 'aviso'); U.Audio.sfx('fail'); return; }
    if (j.vida >= this.techoVida()) { U.HUD.toast('Ya estás en o sobre el 25%: la recuperación automática de Vida no sube más. Para despertar al 100%: duerme en la fogata (tócala para dormir) o usa una poción.', 'aviso'); }
    j.descansando = true; U.Audio.sfx('descanso');
  },
  // Dormir en la FOGATA (solo por interacción, no con la tecla R): fundido a negro (~0.8 s),
  // en negro se cura al 100% y el reloj avanza UNA fase (6 h de juego = un cuarto de día),
  // y se vuelve (~0.8 s). Sin espera real: la secuencia completa dura ~2 s y el mundo
  // queda congelado mientras tanto. El aviso al despertar nombra la fase resultante,
  // que no siempre es la mañana: depende de la hora a la que descanses.
  // Dormir en la CAMA de tu casa hasta la ALARMA: misma secuencia de fundido que la fogata,
  // pero el reloj salta a la hora fijada (hoy si aun no paso; si ya paso, manana) y el calendario suma los dias dormidos.
  dormirEnCama() {
    const E = U.Juego.estado, j = E.jugador, r = E.reloj;
    if (!r || r.durmiendo) return;
    if (E.enCombate) { U.HUD.toast('No puedes dormir en combate.', 'aviso'); U.Audio.sfx('fail'); return; }
    const target = E.alarmaMin != null ? E.alarmaMin : 420;
    r.salto = { minutos: target, dias: target <= Math.floor(r.minutos) ? 1 : 0 };
    r.modoCama = true;
    r.durmiendo = true; r.fase = 1; r.t = 0; j.descansando = true; j.cargando = false;
    const velo = document.getElementById('veloDescanso'); if (velo) velo.style.opacity = '1';
    U.Audio.sfx('descanso');
  },
  descansarFogata() {
    const E = U.Juego.estado, j = E.jugador, r = E.reloj;
    if (!r || r.durmiendo) return;
    if (E.enCombate) { U.HUD.toast('No puedes descansar en combate.', 'aviso'); U.Audio.sfx('fail'); return; }
    r.durmiendo = true; r.fase = 1; r.t = 0; j.descansando = true; j.cargando = false;
    const velo = document.getElementById('veloDescanso'); if (velo) velo.style.opacity = '1';
    U.Audio.sfx('descanso');
  },
  actualizarFogata(dt) {
    const E = U.Juego.estado, j = E.jugador, r = E.reloj; if (!r || !r.durmiendo) return;
    r.t += dt;
    if (r.fase === 1 && r.t >= 0.8) {
      // Pantalla en negro: curación completa + avance del reloj + el entreno de meditación de siempre.
      j.vida = j.stats.vida; j.esencia = U.Reliquias ? U.Reliquias.esenciaMax(j) : j.stats.esencia; j.agotado = false; j.dot = null; j.cansancio = this.condicionMax(j); j.gastoFatiga = 0;
      if (j.estilos.yang < 100) U.Crecimiento.estilo('yang', 0.8, 1);
      if (j.flags.peleaDura) { j.flags.peleaDura = false; U.Crecimiento.stat('vida', 0.8, 1); }
      U.Tiempo.aplicarSalto(r);
      r.faseAlDespertar = U.Tiempo.faseDe(r.minutos / 60);
      U.Combate.particulas(j.x, j.y - 1, 10, '#67e08a', 'cura');
      r.fase = 2; r.t = 0;
    } else if (r.fase === 2 && r.t >= 0.4) {
      const velo = document.getElementById('veloDescanso'); if (velo) velo.style.opacity = '0';
      r.fase = 3; r.t = 0;
    } else if (r.fase === 3 && r.t >= 0.8) {
      r.durmiendo = false; r.fase = 0; r.t = 0; j.descansando = false;
      const f = r.faseAlDespertar || U.Tiempo.faseDe(r.minutos / 60);
      if (r.modoCama) { r.modoCama = false; E.flags.casaDormida = true; U.HUD.banner('⏰ ALARMA ' + U.Tiempo.formato(r.minutos) + ' · ' + U.Tiempo.diaTexto(r) + ' · VIDA AL 100%', 2.2); U.Audio.sfx('unlock'); }
      else { U.HUD.banner(f.banner + ' · ' + U.Tiempo.formato(r.minutos) + ' · VIDA AL 100%', 1.8); U.Audio.sfx('cura'); }
    }
  },
  actualizar(dt) {
    const E = U.Juego.estado, j = E.jugador;
    if (j.agotado && j.esencia >= j.stats.esencia * 0.25) { j.agotado = false; U.HUD.toast('Esencia recuperada: ya puedes gastar.', 'exito'); U.Audio.sfx('orb'); }
    // Esencia: se recarga SIEMPRE a ritmo constante, el de la capacidad del atributo (5/s; Sabio 10/s, Duro 2/s).
    // Antes el ritmo era proporcional a la Esencia actual y en combate era 0: al bajar de ~15 la recarga se
    // desplomaba y parecía detenerse, y un jugador Agotado cerca de un enemigo no tenía forma de recuperarla.
    // Ahora: fuera de combate ritmo completo, en combate 40% (nunca cero), descansar triplica.
    // Encima de eso se aplica el escalón de Condición (multCansancio: ×1.0 / ×0.5 / ×0.1).
    // Golpear con Yin sigue devolviendo Esencia extra, como siempre.
    // Con la SOBRECARGA activa la recarga se PAUSA: su drenaje (5% del máx./s) tiene que ser real;
    // si la recarga siguiera corriendo, fuera de combate la compensaría y la Esencia nunca bajaría.
    { const cap = this.capacidad(); let r = E.enCombate ? cap * 0.4 : cap; if (j.descansando) r *= 3; r *= this.multCansancio(); if (!(j.buffs && j.buffs.sobrecarga > 0)) j.esencia = Math.min(U.Reliquias ? U.Reliquias.esenciaMax(j) : j.stats.esencia, j.esencia + r * dt); }
    // Condición: se recupera MUCHO más lento que la Esencia y según el atributo — la misma
    // capacidad de la Esencia (base 5, Sabio 10, Duro 2) pero POR HORA DE JUEGO, no por
    // segundo — y SOLO fuera de combate (en combate no se recupera, solo baja).
    // 1 día de juego = 1200 s reales = 24 h → 1 s real = 0.02 h de juego.
    // Dormir (fogata o cama) la pone al 100% del máximo (ver actualizarFogata).
    { const maxC = this.condicionMax(j); if (j.cansancio == null) j.cansancio = maxC;
      if (!E.enCombate && j.cansancio < maxC) j.cansancio = Math.min(maxC, j.cansancio + this.capacidad() * 0.02 * dt); }
    // Vida: recuperación AUTOMÁTICA, sin necesidad de descansar. Sube SOLO cuando está debajo del 25%
    // y el 25% es el TOPE exacto: Math.min(techo, …) garantiza que la recuperación natural nunca pase
    // de ahí. Si la Vida ya está en o sobre el 25% (p. ej. tras una poción), esta vía no suma nada.
    { const techo = this.techoVida(); if (j.vida < techo) { j.vida = Math.min(techo, j.vida + j.stats.vida * this.velDescanso() * ((j.reliquias && j.reliquias.puesta === 'vida') ? 3 : 1) * dt); if (Math.random() < dt * 2) U.Combate.particulas(j.x, j.y - 1, 1, '#67e08a', 'cura'); } }
    if (j.descansando) {
      if (E.enCombate || j.moviendo) { j.descansando = false; }
      else {
        // Meditar al descansar entrena el Yang poco a poco: es la ruta de quien no nació con afinidad (despierta al llegar a 5).
        if (U.Juego.progresoEntreno) U.Juego.progresoEntreno('meditacion', dt);
        if (j.estilos.yang < 100) { U.Crecimiento.estilo('yang', 0.15 * dt, 1); if (Math.random() < dt * 1.5) U.Combate.particulas(j.x, j.y - 1, 1, '#f8fafc', 'cura'); }
        if (j.flags.peleaDura) { j.flags.peleaDura = false; U.Crecimiento.stat('vida', 0.8, 1); U.HUD.toast('Descansar tras una pelea dura fortalece tu Vida.', 'crec'); } }
    }
  }
};
