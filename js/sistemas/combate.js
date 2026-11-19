/* === js/sistemas/combate.js === */
/* Unipar — combate: Yin/Yang/técnicas sobre grid, fórmula de daño, enemigos con IA y telegrafía, oleadas de la arena, efectos y recompensas. */
window.U = window.U || {};

U.Combate = {
  CLASES: {
    bandido:  { nombre: 'Bandido', elemento: 'tierra', stats: { vida: 70, esencia: 30, ataque: 11, defensa: 9, mente: 6, velocidad: 9 }, forma: 'cono', alcance: 2, radio: 1, power: 1.0, tele: 0.45, cd: 1.5, rango: 1.4 },
    chaman:   { nombre: 'Chamán de brisa', elemento: 'viento', stats: { vida: 45, esencia: 60, ataque: 12, defensa: 6, mente: 10, velocidad: 11 }, forma: 'linea', alcance: 7, radio: 0, power: 1.1, tele: 0.6, cd: 2.2, rango: 5.5 },
    brasa:    { nombre: 'Brasa viva', elemento: 'fuego', stats: { vida: 40, esencia: 40, ataque: 13, defensa: 5, mente: 5, velocidad: 14 }, forma: 'cono', alcance: 3, radio: 1, power: 1.2, tele: 0.5, cd: 1.2, rango: 1.6, efecto: { dot: { dmg: 1.5, t: 2 } } },
    veterano: { nombre: 'Veterano de la arena', elemento: 'tierra', stats: { vida: 140, esencia: 50, ataque: 15, defensa: 14, mente: 8, velocidad: 8 }, forma: 'circulo', alcance: 2, radio: 2, power: 1.6, tele: 0.8, cd: 2.6, rango: 1.9 },
    ilusionista: { nombre: 'Ilusionista', elemento: 'viento', stats: { vida: 55, esencia: 70, ataque: 11, defensa: 7, mente: 13, velocidad: 10 }, forma: 'linea', alcance: 6, radio: 0, power: 1.0, tele: 0.7, cd: 2.6, rango: 5, efecto: { invertir: 6 } }
  },
  // ---------- SETS DE TÉCNICAS POR PERSONA (cada uno usa un subconjunto) ----------
  // Cada clase usa un subconjunto de su elemento (2-4 técnicas); cada persona con
  // nombre tiene el suyo propio, distinto. El set queda en e.setTec (otros sistemas
  // pueden ponerle su propio set: e.setTec = [...] + e.setTecManual = true).
  // Los ids son del catálogo de su elemento (U.Habilidades.elementos[elemento]).
  SETS: {
    bandido: ['roca', 'muroPiedra', 'temblor'],
    chaman: ['rafaga', 'hojaVendaval', 'torbellino'],
    brasa: ['llamarada', 'colmilloBrasa', 'bolafuego'],
    veterano: ['roca', 'garraMontana', 'avalancha', 'temblor'],
    ilusionista: ['rafaga', 'vendavalCortante', 'cuchilla']
  },
  SETS_NOMBRE: {
    // Torneo de Bruma
    'Bruno el Leñador': ['roca', 'muroPiedra', 'garraMontana'],
    'Sibila del Viento': ['rafaga', 'hojaVendaval', 'torbellino', 'vendavalCortante'],
    'Corazón de Brasa': ['llamarada', 'colmilloBrasa', 'bolafuego', 'serpienteFuego'],
    'El Campeón Velado': ['roca', 'avalancha', 'garraMontana', 'temblor'],
    'El Otro Semifinalista': ['rafaga', 'torbellino', 'cuchilla'],
    // Líderes de gimnasio (salas)
    'Bruno, líder de la sala de Bruma': ['roca', 'temblor', 'muroPiedra'],
    'Nami, líder de la sala del Puerto': ['rafaga', 'torbellino', 'hojaVendaval'],
    'Varek, líder de la sala de Ceniza': ['llamarada', 'bolafuego', 'serpienteFuego', 'colmilloBrasa'],
    'Toruk, líder de la sala de Raíz': ['roca', 'avalancha', 'terremoto', 'garraMontana'],
    'Lira, líder de la sala de Vuelo': ['rafaga', 'vendavalCortante', 'cuchilla', 'torbellino'],
    'Vek, líder de la sala de Chispa': ['rafaga', 'cuchilla', 'vendavalCortante'],
    // Sparring (círculo del bosque)
    'Kaelen': ['roca', 'avalancha', 'garraMontana'],
    'Torin': ['roca', 'temblor', 'muroPiedra'],
    'Breno': ['roca', 'muroPiedra'],
    'Marco': ['rafaga', 'hojaVendaval', 'torbellino'],
    // Jefes de guarida
    'Cazador Mayor de la Red': ['roca', 'avalancha', 'temblor'],
    'Guardabosques de la Red': ['roca', 'muroPiedra', 'temblor'],
    'Vigía de la Cumbre': ['rafaga', 'torbellino', 'hojaVendaval'],
    'Tasador de las Ruinas': ['roca', 'garraMontana', 'avalancha'],
    'Contrabandista del Puerto': ['roca', 'avalancha', 'garraMontana'],
    'Custodio del Tesoro': ['roca', 'terremoto', 'avalancha', 'temblor'],
    'Drenador de la Cámara': ['llamarada', 'bolafuego', 'lluviaBrasas', 'colmilloBrasa'],
    'Señor de la Niebla': ['rafaga', 'vendavalCortante', 'cuchilla', 'torbellino'],
    'Centinela de la Torre': ['roca', 'avalancha', 'terremoto'],
    'Oficiante del Sello': ['rafaga', 'cuchilla', 'vendavalCortante'],
    'Vacío sin Nombre': ['rafaga', 'vendavalCortante', 'torbellino', 'cuchilla'],
    // Organizaciones y duelos
    'Dario': ['roca', 'garraMontana', 'avalancha'],
    'Sana': ['rafaga', 'torbellino', 'hojaVendaval'],
    'Líder de la Patrulla': ['roca', 'avalancha', 'garraMontana', 'terremoto'],
    'Élite del guante negro': ['roca', 'temblor', 'garraMontana'],
    'Cazador de la Red de Jade': ['roca', 'muroPiedra', 'temblor'],
    'Cazadora de la Red de Jade': ['rafaga', 'torbellino', 'hojaVendaval'],
    'Coleccionista': ['roca', 'avalancha', 'garraMontana'],
    'Agente sin nombre': ['rafaga', 'vendavalCortante', 'cuchilla'],
    'Guardia examinador del Cuartel': ['roca', 'temblor', 'muroPiedra'],
    'Finalista de la Metrópolis': ['roca', 'avalancha', 'garraMontana'],
    'Semifinalista de la Metrópolis': ['rafaga', 'torbellino', 'cuchilla']
  },
  // Set efectivo de un enemigo. Precedencia: set manual (e.setTecManual) > set por
  // nombre > e.setTec > set de su clase. Se resuelve en vivo (no solo al crear):
  // si otro sistema le cambia el nombre después, el set por nombre se aplica solo.
  setDe(e) {
    if (e.setTecManual && Array.isArray(e.setTec) && e.setTec.length) return e.setTec;
    if (e.nombre) {
      const keys = Object.keys(this.SETS_NOMBRE || {});
      for (let i = 0; i < keys.length; i++) if (e.nombre === keys[i]) { if (!e.setTecManual) e.setTec = this.SETS_NOMBRE[keys[i]].slice(); return this.SETS_NOMBRE[keys[i]]; }
      for (let i = 0; i < keys.length; i++) if (e.nombre.indexOf(keys[i]) === 0) { if (!e.setTecManual) e.setTec = this.SETS_NOMBRE[keys[i]].slice(); return this.SETS_NOMBRE[keys[i]]; }
    }
    if (Array.isArray(e.setTec) && e.setTec.length) return e.setTec;
    return (this.SETS[e.clase] || []).slice();
  },
  // Una técnica del catálogo, por id, dentro del elemento del enemigo.
  tecEnemiga(e, tecId) { const lista = (U.Habilidades.elementos[e.elemento] || []); for (let i = 0; i < lista.length; i++) if (lista[i].id === tecId) return lista[i]; return null; },
  // Elige el ataque del set según la distancia: prefiere técnicas que alcancen
  // desde donde está; si ninguna alcanza, cualquiera del set (y se acerca andando).
  elegirTec(e, d) {
    const set = this.setDe(e); if (!set || !set.length) return null;
    const lista = set.map(id => this.tecEnemiga(e, id)).filter(Boolean);
    if (!lista.length) return null;
    const lejos = ['linea', 'proyectil', 'alterna', 'cadena'];
    const encajan = lista.filter(t => lejos.indexOf(t.forma) >= 0 ? d <= (t.alcance || 99) : d <= (t.alcance || 2) + 1);
    const cands = encajan.length ? encajan : lista;
    return cands[Math.floor(Math.random() * cands.length)];
  },
  OLEADAS: [['bandido', 'bandido'], ['bandido', 'chaman'], ['brasa', 'brasa', 'veterano']],

  // ---------- utilidades de efectos ----------
  texto(e, txt, color, escala) { U.Juego.estado.efectos.textos.push({ x: e.x, y: e.y, txt, color: color || '#fff', escala: escala || 1, vida: 0.9, max: 0.9 }); },
  particulas(x, y, n, color, tipo) {
    const P = U.Juego.estado.efectos.particulas; for (let i = 0; i < n; i++) { if (P.length > 420) P.shift(); const a = Math.random() * Math.PI * 2, sp = tipo === 'cura' ? 0.4 + Math.random() * 0.6 : 1 + Math.random() * 3;
      P.push({ x, y, dx: Math.cos(a) * sp, dy: tipo === 'cura' || tipo === 'brasa' || tipo === 'humo' ? -Math.abs(Math.sin(a) * sp) - 0.5 : Math.sin(a) * sp, vida: 0.4 + Math.random() * 0.5, max: 0.9, color, tam: Math.random() < 0.3 ? 2 : 1, grav: tipo === 'agua' || tipo === 'chispa' ? 4 : (tipo === 'cura' || tipo === 'humo' || tipo === 'brasa' ? -0.5 : 1) }); }
  },
  sacudir(v) { U.Juego.estado.camara.shake = Math.min(3, U.Juego.estado.camara.shake + v); },
  vivos() { return U.Juego.estado.enemigos.filter(e => e.vida > 0); },
  // Desafío relativo de un enemigo (delegado: la fórmula vive en Crecimiento). Sin esto, el primer golpe conectado lanzaba un error y congelaba el bucle.
  desafio(e) { return U.Crecimiento.desafio(e); },

  golpearObjetos(celdas, dmg) {
    const E = U.Juego.estado, m = E.mapa; if (!m || !celdas) return [];
    const set = {}; celdas.forEach(c => set[c.x + ',' + c.y] = 1);
    const golpeados = [];
    m.objetos.slice().forEach(o => { if (!U.Grid.esDestructible(o)) return; for (let y = o.y; y < o.y + (o.h || 1); y++) for (let x = o.x; x < o.x + (o.w || 1); x++) if (set[x + ',' + y]) { U.Grid.danarObjeto(m, o, dmg); golpeados.push(o); return; } });
    return golpeados;
  },
  // Los objetos destructibles (árbol, roca, cactus) ocupan celdas enteras, pero el puño sale de
  // una posición continua: con la pura celda redondeada, a veces el puño se veía sobre el cactus
  // y no lo dañaba. Este pase usa el arco continuo contra el CENTRO del objeto y salta los que
  // golpearObjetos ya dañó en este mismo golpe (nada de daño doble).
  golpearObjetosArco(j, alcance, dmg, ya) {
    const E = U.Juego.estado, m = E.mapa; if (!m) return 0;
    let n = 0;
    m.objetos.slice().forEach(o => { if (!U.Grid.esDestructible(o) || (ya && ya.indexOf(o) >= 0)) return; const cx = o.x + (o.w || 1) / 2, cy = o.y + (o.h || 1) / 2; if (U.Grid.enArco(j.x, j.y, j.dir, alcance + 0.45, { x: cx, y: cy })) { U.Grid.danarObjeto(m, o, dmg); n++; } });
    return n; // cuántos objetos dañó en el arco (0 si ninguno)
  },
  golpearObjetoEn(x, y, dmg) { const E = U.Juego.estado; const o = U.Grid.objetoEn(E.mapa, x, y); if (o && U.Grid.esDestructible(o)) { U.Grid.danarObjeto(E.mapa, o, dmg); return true; } return false; },
  // Rompe el obstáculo destructible (roca/árbol/cactus) que el enemigo tiene enfrente, en la dirección en que intenta moverse.
  // Devuelve true si dañó algo. NO completa el objetivo del jugador (rompioObjeto): se guarda y se restaura el flag.
  romperObstaculoFrente(e, mx, my) {
    const E = U.Juego.estado;
    const dirs = [];
    if (mx || my) { const l = Math.hypot(mx, my) || 1; dirs.push({ x: mx / l, y: my / l }); }
    if (e.dir && (e.dir.x || e.dir.y)) dirs.push({ x: e.dir.x, y: e.dir.y });
    for (const d of dirs) {
      for (const dist of [0.7, 1.4]) {
        const px = e.x + d.x * dist, py = e.y + d.y * dist;
        const o = U.Grid.objetoEn(E.mapa, px, py);
        if (o && U.Grid.esDestructible(o)) {
          const yaRompio = E.flags ? E.flags.rompioObjeto : false;
          this.golpearObjetoEn(px, py, Math.max(10, (e.stats.ataque || 10) * 2));
          if (E.flags) E.flags.rompioObjeto = yaRompio; // el enemigo no completa el objetivo del jugador
          this.particulas(e.x + d.x * 0.7, e.y - 0.5 + d.y * 0.7, 4, '#8b93a3', 'chispa');
          this.texto(e, '¡ROMPE!', '#ffd08a', 1);
          // Sonido con distancia (el trabajador A define sfxCerca en audio.js;
          // si aún no existe en runtime, sfx normal: no se rompe Node).
          if (U.Audio && typeof U.Audio.sfxCerca === 'function') U.Audio.sfxCerca('tierra', e.x, e.y, 2);
          else if (U.Audio) U.Audio.sfx('tierra');
          return true;
        }
      }
    }
    return false;
  },
  // Reposiciona a un enemigo a distancia/mago: se mueve de lado (perpendicular al objetivo) para rodear el obstáculo / recuperar línea de visión.
  // Devuelve la dirección de lado {x, y} y la deja activa 0.8 s (e.reposicion) para que siga de lado en los siguientes frames.
  reposicionar(e, dx, dy, d) {
    const l = Math.hypot(dx, dy) || 1;
    const lado = Math.random() < 0.5 ? 1 : -1;
    const dir = { x: (-dy / l) * lado, y: (dx / l) * lado };
    e.reposicion = { t: 0.8, dx: dir.x, dy: dir.y };
    return dir;
  },
  // ---------- ESCUDO (técnica aprendida de un Guía) ----------
  // La naturaleza del escudo del jugador: su elemento activo. Si despertó el Yang y su
  // inclinación de vida es Yang, su escudo es de ENERGÍA (bloquea todo). Los hechiceros
  // enemigos usan escudo MÁGICO (el suyo, temporizado, se queda como estaba).
  escudoTipo(j) {
    if (j.tieneYang && j.perfil && j.perfil.estilo === 'yang') return 'yang';
    return j.elementoActivo;
  },
  escudoColor(j) { const t = this.escudoTipo(j); return t === 'yang' ? '#f8fafc' : U.Elementos.color(t); },
  escudoNombre(j) { const t = this.escudoTipo(j); return t === 'yang' ? 'Escudo de energía (Yang)' : 'Escudo de ' + U.Elementos.nombre(t).toLowerCase(); },
  escudoMax(j) { const nv = U.Habilidades.escudo.niveles[j.escudoNv || 1]; return nv ? nv.integridad : 34; },
  aprenderEscudo() {
    const j = U.Juego.estado.jugador;
    if (j.escudoAprendido) return false;
    j.escudoAprendido = true; j.escudoNv = 1; j.escudoExp = 0; j.escudoVida = this.escudoMax(j);
    if (U.Habilidades && U.Habilidades.equipar) U.Habilidades.equipar(j, 'escudo'); // al aprenderlo entra al equipo si hay hueco: B funciona desde el primer momento
    U.HUD.banner('🛡 ¡ESCUDO APRENDIDO! · NIVEL 1 · SOLO DE FRENTE', 2.4); U.Audio.sfx('unlock');
    return true;
  },
  // ¿El ataque viene de una dirección que el escudo cubre a este nivel?
  // dot = coseno entre tu mirada y la dirección al atacante: 1 = de frente, −1 = a tu espalda.
  escudoCubre(j, ox, oy) {
    const nv = U.Habilidades.escudo.niveles[j.escudoNv || 1]; if (!nv) return false;
    if (nv.cobertura <= -1.5) return true; // Nv.3: los cuatro lados
    const dx = ox - j.x, dy = oy - j.y, d = Math.hypot(dx, dy);
    if (d < 0.01) return true;
    const dl = Math.hypot(j.dir.x, j.dir.y) || 1;
    const dot = (dx / d) * (j.dir.x / dl) + (dy / d) * (j.dir.y / dl);
    return dot >= nv.cobertura;
  },
  escudoBloqueo(j, ganado) {
    const nv = U.Habilidades.escudo.niveles[j.escudoNv || 1];
    this.texto(j, 'ESCUDO', this.escudoColor(j), 1); this.particulas(j.x, j.y - 0.6, 5, this.escudoColor(j), 'chispa'); U.Audio.sfx('esquiva');
    if (ganado) {
      j.escudoExp = (j.escudoExp || 0) + 1;
      const sig = U.Habilidades.escudo.niveles[(j.escudoNv || 1) + 1];
      if (sig && j.escudoExp >= nv.bloquesParaSubir) {
        j.escudoNv++; j.escudoExp = 0; j.escudoVida = this.escudoMax(j);
        const cob = j.escudoNv >= 3 ? 'AHORA TE PROTEGE DE LOS CUATRO LADOS' : 'AHORA TE PROTEGE DE FRENTE Y DE LOS LADOS';
        U.HUD.banner('🛡 ¡ESCUDO NIVEL ' + j.escudoNv + '! · ' + cob, 2.4); U.Audio.sfx('unlock');
        U.HUD.toast('Tu escudo subió al nivel ' + j.escudoNv + ' (' + U.Habilidades.escudo.niveles[j.escudoNv].nombre + '). Sigue bloqueando para dominarlo.', 'exito');
      }
    }
  },
  // Resuelve un golpe contra el escudo activo. Devuelve el daño que SÍ pasa al jugador
  // (0 = bloqueado/absorbido). info: {elemento (null = físico), proyectil, ox, oy, atacante}.
  // La tabla de ventajas le aplica al escudo como si fuera el jugador.
  resolverEscudo(base, info) {
    const E = U.Juego.estado, j = E.jugador;
    const tipo = this.escudoTipo(j), col = this.escudoColor(j);
    const ox = info.ox != null ? info.ox : j.x + j.dir.x, oy = info.oy != null ? info.oy : j.y - 1;
    if (!this.escudoCubre(j, ox, oy)) { this.texto(j, '¡POR LA ESPALDA!', '#ff4d4d', 1); this.particulas(j.x, j.y - 0.6, 4, '#ff4d4d', 'chispa'); return base; }
    const atk = info.elemento || null, fisico = !atk;
    const melee = !info.proyectil;
    // Yang (energía) y Mágico: bloquean todo lo que cubren.
    if (tipo === 'yang') { j.escudoVida -= base * 0.5; this.escudoBloqueo(j, true); if (j.escudoVida <= 0) this.romperEscudo('Tu escudo de energía se disipó: bloqueó demasiado.'); return 0; }
    // Mismo elemento: el escudo lo ABSORBE y devuelve un poco de Esencia.
    if (atk && atk === tipo) { U.Recuperacion.restaurar(2); this.texto(j, 'ABSORBIDO +2 ESE', col, 1); this.escudoBloqueo(j, true); return 0; }
    // Naturalezas por elemento (lo que cada escudo hace distinto):
    if (tipo === 'viento' && info.proyectil) { this.texto(j, 'DESVIADO', col, 1); this.escudoBloqueo(j, true); return 0; } // el viento desvía proyectiles
    if (tipo === 'rayo' && melee && info.atacante && info.atacante.vida > 0) { const castigo = Math.max(2, Math.round(base * 0.35)); info.atacante.vida -= castigo; this.texto(info.atacante, '-' + castigo + ' ⚡', '#ffe14d', 1); this.particulas(info.atacante.x, info.atacante.y - 0.6, 6, '#ffe14d', 'chispa'); if (info.atacante.vida <= 0 && !info.atacante.esSparring) this.morir(info.atacante); } // el campo de rayo castiga al que lo toca
    if (atk) {
      const m = U.Elementos.multiplica(atk, tipo);
      if (m > 1) { // el ataque le GANA al escudo: casos con nombre propio primero
        if (atk === 'agua' && tipo === 'fuego') { this.escudoBloqueo(j, false); this.romperEscudo('¡El agua APAGÓ tu escudo de fuego! Tu Esencia se queda: vuelve a levantarlo.'); return 0; }
        if (atk === 'rayo' && tipo === 'agua') { this.texto(j, '¡EL RAYO PASA POR EL AGUA!', '#ffe14d', 1); return Math.round(base * 1.5); } // pasa con ventaja; el escudo NO se rompe
        if (atk === 'agua' && tipo === 'tierra') { j.escudoVida -= base * 1.6; this.texto(j, '¡SE VUELVE LODO!', '#d9a441', 1); this.escudoBloqueo(j, true); if (j.escudoVida <= 0) this.romperEscudo('El agua erosionó tu capa de roca hasta volverla lodo: escudo roto.'); return 0; }
        j.escudoVida -= base * 1.5; this.escudoBloqueo(j, true); if (j.escudoVida <= 0) { this.romperEscudo('Un ataque con ventaja deshizo tu escudo de ' + U.Elementos.nombre(tipo).toLowerCase() + '.'); return Math.round(base * 0.5); } return 0;
      }
      if (m < 1) { j.escudoVida -= base * 0.4; this.escudoBloqueo(j, true); if (j.escudoVida <= 0) this.romperEscudo('Tu escudo aguantó todo lo que pudo y cayó.'); return 0; } // tu elemento le gana al ataque: aguanta bien (p. ej. Tierra contra escudo de Agua lo amortigua)
      j.escudoVida -= base * 0.8; this.escudoBloqueo(j, true); if (j.escudoVida <= 0) this.romperEscudo('Tu escudo se rompió de tanto aguantar.'); return 0;
    }
    // Físico (Yin / cuerpo a cuerpo / área): cada naturaleza amortigua distinto.
    const pasa = { fuego: 0.7, agua: 0.25, tierra: 0.15, viento: 0.7, rayo: 0.45 }[tipo];
    const p = pasa != null ? pasa : 0.4;
    j.escudoVida -= base * (1 - p) * 0.9 + 2;
    this.escudoBloqueo(j, p <= 0.3);
    if (j.escudoVida <= 0) { this.romperEscudo('Tu escudo cayó bajo los golpes.'); return Math.round(base * p); }
    if (p > 0) this.texto(j, 'EL ESCUDO CEDE', '#ffb347', 1);
    return Math.round(base * p);
  },
  romperEscudo(msg) {
    const j = U.Juego.estado.jugador; j.escudo = false; j.escudoVida = 0;
    if (msg) U.HUD.toast(msg, 'peligro'); U.Audio.sfx('fail');
  },
  toggleEscudo() {
    const E = U.Juego.estado, j = E.jugador;
    if (j.escudo) { j.escudo = false; U.HUD.toast('Escudo desactivado.', ''); U.Audio.sfx('click'); return; }
    if (!j.escudoAprendido) { U.HUD.toast('Aún no conoces el Escudo: es una TÉCNICA y se aprende de un Guía. Kaelen, el guardia de la aldea, puede enseñártela (habla con él).', 'aviso'); U.Audio.sfx('fail'); return; }
    if (U.Habilidades && U.Habilidades.podarEquipo(j).indexOf('escudo') < 0) { U.HUD.toast('El Escudo no está en tu EQUIPO: equípalo en Pausa → Ajustes → Equipo (máx. 5 técnicas).', 'aviso'); U.Audio.sfx('fail'); return; }
    if (j.agotado || j.esencia < 10) { U.HUD.toast('Escudo: necesitas al menos 10 de Esencia.', 'aviso'); U.Audio.sfx('fail'); return; }
    j.escudo = true; j.escudoVida = this.escudoMax(j); j.cargando = false; j.descansando = false; U.Audio.sfx('yang');
    const nv = U.Habilidades.escudo.niveles[j.escudoNv || 1];
    U.HUD.toast(this.escudoNombre(j) + ' ACTIVO · Nv.' + (j.escudoNv || 1) + ' (' + nv.nombre + '): NO puedes moverte y drena Esencia/s. Pulsa B para bajarlo.', 'exito');
  },
  // ---------- acciones del jugador ----------
  // Puño libre de Sobrecarga: con la Sobrecarga ACTIVA y la Esencia en 0, el golpe Yin SÍ funciona
  // (la Sobrecarga ya está drenando tu Vida: ese es el costo). Todo lo demás sigue bloqueado por Agotado.
  puñoSobre(j) { return j.buffs.sobrecarga > 0 && j.esencia <= 0.01; },
  puedeYin() { const j = U.Juego.estado.jugador; return j.cdYin <= 0 && ((!j.agotado && j.esencia >= 2) || this.puñoSobre(j)); },
  iniciarCarga() { const j = U.Juego.estado.jugador; if (j.cdYin > 0) { U.Audio.sfx('fail'); return; } if (!this.puñoSobre(j)) { if (j.agotado) { U.Audio.sfx('fail'); return; } if (j.esencia < 2) { U.HUD.toast('Sin Esencia para Yin.', 'aviso'); U.Audio.sfx('fail'); return; } } j.cargando = true; j.carga = 0; j.descansando = false; U.Audio.sfx('cargando'); },
  soltarYin() { const j = U.Juego.estado.jugador; if (!j.cargando) return; const carga = j.carga; j.cargando = false; this.yin(carga); },
  yin(carga) {
    // La carga es 0..1.2 (tope del update loop); si llega un booleano viejo, se traduce a 0 o 1.2.
    if (typeof carga === 'boolean') carga = carga ? 1.2 : 0;
    if (typeof carga !== 'number' || !isFinite(carga)) carga = 0;
    const cargado = carga >= 0.35;
    const hn = U.Habilidades.yin.normal, hc = U.Habilidades.yin.cargado;
    // Potencia PROPORCIONAL a la carga: en el umbral (0.35) es la normal; con la carga llena (1.2) es la máxima cargada.
    const t = cargado ? Math.min(1, Math.max(0, (carga - 0.35) / (1.2 - 0.35))) : 0;
    const h = { costo: Math.round(hn.costo + t * (hc.costo - hn.costo)), power: hn.power + t * (hc.power - hn.power), forma: cargado ? hc.forma : hn.forma, alcance: hn.alcance + t * (hc.alcance - hn.alcance), restaura: Math.round(hn.restaura + t * (hc.restaura - hn.restaura)) };
    const E = U.Juego.estado, j = E.jugador;
    if (j.cdYin > 0) return; if (!this.puñoSobre(j) && !U.Recuperacion.gastar(h.costo)) return; // con Sobrecarga activa y Esencia en 0, el puño no cobra Esencia: ya estás pagando con Vida
    j.cdYin = (cargado ? 0.6 : Math.max(0.18, 0.42 - (U.Reliquias ? U.Reliquias.statEf(j, 'velocidad') : j.stats.velocidad) * 0.012)) * (j.buffs.sobrecarga > 0 ? 0.5 : 1); j.ataqueAnim = 0.2; j.descansando = false;
    const atk = (U.Reliquias ? U.Reliquias.statEf(j, 'ataque') : j.stats.ataque) * (j.buffs.sobrecarga > 0 ? 2 : 1);
    const celdas = U.Grid.forma('cono', j.x, j.y, j.dir, h.alcance, 1); const el = U.Elementos.datos[j.elementoActivo];
    E.efectos.cortes.push({ x: j.x, y: j.y, dir: j.dir, color: cargado ? el.claro : '#f8fafc', t: 0.18, max: 0.18 });
    U.Audio.sfx(cargado ? 'cargado' : 'yin'); this.sacudir(cargado ? 0.6 : 0.2);
    // El golpe conecta por celda EXACTA o por el arco continuo (enArco): el arco tapa los casos
    // en que el redondeo a celdas dejaba fuera a un enemigo que el puño sí estaba tocando.
    const golpeadosObj = this.golpearObjetos(celdas, atk * h.power * 0.95); this.golpearObjetosArco(j, h.alcance, atk * h.power * 0.95, golpeadosObj); this.golpearInocentes(celdas, { x: j.x, y: j.y, dir: j.dir, alcance: h.alcance + 0.45 });
    let golpes = 0; this.vivos().forEach(e => { if (U.Grid.enCeldas(celdas, e) || U.Grid.enArco(j.x, j.y, j.dir, h.alcance + 0.45, e)) { golpes++; this.dañoEnemigo(e, atk * h.power, null, { desafio: this.desafio(e), cargado }); U.Recuperacion.restaurar(h.restaura); this.texto(j, '+' + h.restaura + ' ESE', '#4da3ff', 1); } });
    if (U.Criaturas) golpes += U.Criaturas.impactoJugador(celdas, { arco: { x: j.x, y: j.y, dir: j.dir, alcance: h.alcance + 0.45 }, dmg: atk * h.power, elemento: null });
    U.Crecimiento.estilo('yin', cargado ? 0.4 : 0.15, E.enCombate ? 1 : 0.2); if (golpes && U.Juego.progresoEntreno) U.Juego.progresoEntreno('golpes', golpes);
    if (golpes) { U.Crecimiento.stat('ataque', 0.05 * golpes, this.desafio(this.vivos()[0] || j)); E.resumen.golpes += golpes; if (cargado) E.hitstop = 0.05; }
    // Canalizar: sin técnica desbloqueada, el Yin enseña el elemento (llegar a 15% desbloquea la primera)
    if ((j.maestria[j.elementoActivo] || 0) < 15 && E.enCombate) U.Crecimiento.maestria(j.elementoActivo, 0.45, golpes ? this.desafio(this.vivos()[0] || j) : 0.5);
  },
  // Dispatcher del EQUIPO: un id de registro ('tec:<elem>:<id>' | 'yang:<forma>' |
  // 'escudo') lanza esa técnica. Solo funciona si está dominada Y equipada.
  usarEquipo(id) {
    const j = U.Juego.estado.jugador; const tec = U.Habilidades.porId(j, id);
    if (!tec) { U.HUD.toast('Técnica desconocida.', 'aviso'); return; }
    if (!U.Habilidades.aprendida(j, tec)) { U.HUD.toast(tec.nombre + ': aún no la dominas.', 'aviso'); U.Audio.sfx('fail'); return; }
    if (U.Habilidades.podarEquipo(j).indexOf(id) < 0) { U.HUD.toast(tec.nombre + ' no está en tu EQUIPO: equípala en Pausa → Ajustes → Equipo.', 'aviso'); U.Audio.sfx('fail'); return; }
    if (tec.kind === 'elemento' || tec.kind === 'alma') this.tecnica(id);
    else if (tec.kind === 'yang') this.yang(tec.tecId);
    else if (tec.kind === 'mistico') this.tecnica(id);
    else if (tec.kind === 'yin') { if (tec.tecId === 'acero') this.toggleAcero(); else if (tec.tecId === 'sobrecarga') this.sobrecarga(); else this.yinTec(id); }
    else if (tec.kind === 'escudo') this.toggleEscudo();
  },
  // Técnicas de YIN equipables (Puño de la Montaña, Lluvia de Puños, Palma del
  // Sueño): físico cuerpo a cuerpo en cono, como el Golpe Veloz de Yang. El puño
  // normal NO pasa por aquí: es universal y no es técnica. El Golpe Rompe-Todo
  // tampoco: es el puño cargado (mantener presionado el botón de puño).
  yinTec(id) {
    const E = U.Juego.estado, j = E.jugador;
    const tec = U.Habilidades.porId(j, id);
    if (!tec || tec.kind !== 'yin') return;
    if (!U.Habilidades.aprendida(j, tec)) { U.HUD.toast(tec.nombre + ': aún no la dominas.', 'aviso'); U.Audio.sfx('fail'); return; }
    if (U.Habilidades.podarEquipo(j).indexOf(tec.id) < 0) { U.HUD.toast(tec.nombre + ' no está en tu EQUIPO: equípala en Pausa → Ajustes → Equipo.', 'aviso'); U.Audio.sfx('fail'); return; }
    if ((j.cdTec[tec.id] || 0) > 0) return;
    if (typeof tec.costo !== 'number' || !U.Recuperacion.gastar(tec.costo)) return;
    j.cdTec[tec.id] = tec.cd; j.ataqueAnim = 0.25; j.descansando = false;
    const atk = (U.Reliquias ? U.Reliquias.statEf(j, 'ataque') : j.stats.ataque) * (j.buffs.sobrecarga > 0 ? 2 : 1);
    const celdas = U.Grid.forma('cono', j.x, j.y, j.dir, tec.alcance, 1);
    E.efectos.cortes.push({ x: j.x, y: j.y, dir: j.dir, color: '#ffd08a', t: 0.18, max: 0.18 });
    U.Audio.sfx('yin'); this.sacudir(0.3);
    const gObj = this.golpearObjetos(celdas, atk * tec.power * 0.95); this.golpearObjetosArco(j, tec.alcance, atk * tec.power * 0.95, gObj); this.golpearInocentes(celdas, { x: j.x, y: j.y, dir: j.dir, alcance: tec.alcance + 0.45 });
    let golpes = 0; this.vivos().forEach(e => { if (U.Grid.enCeldas(celdas, e) || U.Grid.enArco(j.x, j.y, j.dir, tec.alcance + 0.45, e)) { golpes++; this.dañoEnemigo(e, atk * tec.power, null, Object.assign({ desafio: this.desafio(e) }, tec.efecto || {})); U.Recuperacion.restaurar(6); } });
    if (U.Criaturas) golpes += U.Criaturas.impactoJugador(celdas, { arco: { x: j.x, y: j.y, dir: j.dir, alcance: tec.alcance + 0.45 }, dmg: atk * tec.power, elemento: null });
    U.Crecimiento.estilo('yin', 0.35, 1); if (golpes) E.resumen.golpes += golpes;
  },
  // Ataque BÁSICO del elemento principal: línea corta, coste 4, sin aprender nada.
  // Es lo que hay al inicio (puño + básico) y lo que dispara el botón TÉC.
  ataqueBasico() {
    const E = U.Juego.estado, j = E.jugador; const b = U.Habilidades.BASICO;
    if ((j.cdBasico || 0) > 0) return; if (!U.Recuperacion.gastar(b.costo)) return;
    j.cdBasico = b.cd; j.ataqueAnim = 0.25; j.descansando = false;
    const el = U.Elementos.datos[j.elementoActivo]; const atk = (U.Reliquias ? U.Reliquias.statEf(j, 'ataque') : j.stats.ataque) * (j.buffs.sobrecarga > 0 ? 2 : 1);
    const alcEf = Math.max(1, Math.min(b.alcanceMax, this.alcanceElemental(j)));
    const celdas = U.Grid.forma('linea', j.x, j.y, j.dir, alcEf, 0);
    E.efectos.haces.push({ celdas, color: el.color, t: 0.2, max: 0.2 });
    // El básico nunca dio XP por uso (ni al aire ni a enemigo, como antes): solo
    // la pizca de entrenamiento de mundo si impacta un árbol/roca/cactus.
    if (this.golpearObjetos(celdas, atk * b.power * 0.85).length) this.otorgarXpTecnica(j.elementoActivo, 'mundo', 1); this.golpearInocentes(celdas);
    this.vivos().forEach(e => { if (U.Grid.enCeldas(celdas, e)) this.dañoEnemigo(e, atk * b.power, j.elementoActivo, { desafio: this.desafio(e), alcance: alcEf }); });
    if (U.Criaturas) U.Criaturas.impactoJugador(celdas, { dmg: atk * b.power, elemento: j.elementoActivo });
    this.particulas(j.x + j.dir.x, j.y + j.dir.y - 0.5, 5, el.claro, 'chispa');
    U.Audio.sfx(j.elementoActivo); E.resumen.tecnicas++;
  },
  yang(forma) {
    const E = U.Juego.estado, j = E.jugador;
    if (!j.tieneYang) { U.HUD.toast('Tu Yang aún no despierta: sin afinidad empiezas en 0, pero se alcanza entrenando hasta ' + U.Habilidades.yangDespertar + ' (medita al descansar o entrena con Torin). Como dominar otro elemento: lleva su entrenamiento.', 'aviso'); U.Audio.sfx('fail'); return; }
    // Sin forma pedida: la seleccionada si está equipada, si no la primera forma Yang equipada (Tiempo Lento no: es un interruptor, no se lanza con K).
    if (!forma) { const eq = U.Habilidades.equipoDetalles(j).filter(t => t.kind === 'yang' && t.tecId !== 'tiempoLento'); const sel = eq.find(t => t.tecId === j.yangForma); forma = sel ? sel.tecId : (eq[0] ? eq[0].tecId : null); }
    if (!forma) { U.HUD.toast('No llevas ninguna forma Yang EQUIPADA: elige una en Pausa → Ajustes → Equipo.', 'aviso'); U.Audio.sfx('fail'); return; }
    const h = U.Habilidades.yang[forma];
    if (!h) return;
    // Tiempo Lento no es una forma lanzable: es un interruptor (no usa yangForma ni cdYang).
    if (forma === 'tiempoLento') { this.toggleTiempoLento(); return; }
    if (j.estilos.yang < h.umbral) { U.HUD.toast(h.nombre + ' requiere Yang ' + h.umbral + '.', 'aviso'); return; }
    if (U.Habilidades.podarEquipo(j).indexOf('yang:' + forma) < 0) { U.HUD.toast(h.nombre + ' no está en tu EQUIPO: equípala en Pausa → Ajustes → Equipo.', 'aviso'); U.Audio.sfx('fail'); return; }
    j.yangForma = forma;
    if (j.cdYang > 0) return; if (!U.Recuperacion.gastar(h.costo)) return;
    j.cdYang = h.cd; j.ataqueAnim = 0.25; j.descansando = false; const atk = (U.Reliquias ? U.Reliquias.statEf(j, 'ataque') : j.stats.ataque) * (j.buffs.sobrecarga > 0 ? 2 : 1);
    U.Audio.sfx('yang'); this.sacudir(0.3);
    let impactoEnemigo = false, impactoMundo = false; // XP DE YANG SOLO AL IMPACTAR (nada al aire): igual que las técnicas elementales
    if (h.forma === 'cono') { // GOLPE VELOZ: puño Yang cuerpo a cuerpo, instantáneo y sin carga (cancela la carga del puño Yin). No devuelve Esencia al golpear: eso es Yin.
      j.cargando = false;
      const celdas = U.Grid.forma('cono', j.x, j.y, j.dir, h.alcance, 1);
      E.efectos.cortes.push({ x: j.x, y: j.y, dir: j.dir, color: '#f8fafc', t: 0.18, max: 0.18 });
      const gObj = this.golpearObjetos(celdas, atk * h.power * 0.95); if (gObj.length) impactoMundo = true; if (this.golpearObjetosArco(j, h.alcance, atk * h.power * 0.95, gObj) > 0) impactoMundo = true; if (this.golpearInocentes(celdas, { x: j.x, y: j.y, dir: j.dir, alcance: h.alcance + 0.45 })) impactoEnemigo = true;
      let golpes = 0; this.vivos().forEach(e => { if (U.Grid.enCeldas(celdas, e) || U.Grid.enArco(j.x, j.y, j.dir, h.alcance + 0.45, e)) { golpes++; this.dañoEnemigo(e, atk * h.power, null, { desafio: this.desafio(e), yang: true }); } });
      if (U.Criaturas) golpes += U.Criaturas.impactoJugador(celdas, { arco: { x: j.x, y: j.y, dir: j.dir, alcance: h.alcance + 0.45 }, dmg: atk * h.power, elemento: null });
      if (golpes) { E.resumen.golpes += golpes; impactoEnemigo = true; }
      this.particulas(j.x + j.dir.x, j.y + j.dir.y - 0.5, 10, '#f8fafc', 'chispa');
    }
    else if (h.forma === 'linea') { const celdas = U.Grid.forma('linea', j.x, j.y, j.dir, h.alcance, 0); if (this.golpearObjetos(celdas, atk * h.power * 0.85).length) impactoMundo = true; E.efectos.haces.push({ celdas, color: '#f8fafc', t: 0.25, max: 0.25 }); let golpes = 0; this.vivos().forEach(e => { if (U.Grid.enCeldas(celdas, e)) { golpes++; this.dañoEnemigo(e, atk * h.power, null, { desafio: this.desafio(e), yang: true }); } }); if (U.Criaturas) golpes += U.Criaturas.impactoJugador(celdas, { dmg: atk * h.power, elemento: null }); if (golpes) impactoEnemigo = true; this.particulas(j.x + j.dir.x * 2, j.y + j.dir.y * 2 - 0.5, 8, '#f8fafc', 'chispa'); }
    else this.proyectil(j, Object.assign({}, h, { xpYang: true }), atk * h.power, null, '#f8fafc', 'jugador');
    // XP solo al impactar: enemigo = normal, árbol/roca = una pizca de estilo
    // y 0 Mente, aire = nada. El proyectil otorga su XP al impactar
    // (actualizarProyectiles), no al lanzar.
    if (h.forma !== 'proyectil') { if (impactoEnemigo) this.otorgarXpYang('enemigo'); else if (impactoMundo) this.otorgarXpYang('mundo'); }
    U.Crecimiento.regenCap(0.02); E.resumen.yang++;
  },
  // ALCANCE ELEMENTAL (en celdas): crece con la MAESTRÍA del elemento activo: +1 celda por
  // cada 5% → 0–5% = 1 celda, 6–10% = 2, 11–15% = 3, … 96–100% = 20 celdas. Es el alcance
  // MÁXIMO de tus ataques elementales: cada técnica llega hasta donde su forma permita,
  // sin pasar de este alcance (a baja maestría todo es de cerca; dominando, llega lejos).
  alcanceElemental(j) { return this.alcanceDe(j, j.elementoActivo); },
  // Alcance de UN elemento concreto (el equipo MEZCLA elementos: cada técnica usa
  // la maestría de SU elemento, no la del principal).
  alcanceDe(j, elem) { const m = (j && j.maestria && j.maestria[elem]) || 0; return Math.max(1, Math.min(20, Math.ceil(m / 5))); },
  // CAÍDA DE DAÑO POR DISTANCIA (ataques elementales): a 1 celda = 100% del daño; en la
  // ÚLTIMA celda del alcance = 80%; entre ambas baja LINEAL: daño% = 100% − (dist−1) ×
  // (20% / (alcance−1)). Ej.: alcance 5 → −5% por celda; alcance 10 → −2.2% por celda;
  // alcance 20 → ≈−1% por celda. Nunca baja del 80% ni sube del 100%.
  factorDistancia(dist, alcance) { if (!alcance || alcance <= 1) return 1; const dd = Math.max(1, dist || 1); const f = 1 - (dd - 1) * (0.20 / (alcance - 1)); return Math.max(0.8, Math.min(1, f)); },
  // ATAQUES RADIALES (área alrededor del jugador, en todas las direcciones): su radio
  // es la MITAD del alcance lineal, redondeado hacia abajo y con mínimo 1:
  // lineal 1→radial 1 · 2→1 · 3→1 · 4→2 · 5→2 · 6→3 · 10→5 · 20→10.
  // Como golpean a muchos enemigos a la vez, cuestan MÁS Esencia (×1.5) y hacen
  // un poco menos de daño por enemigo (×0.9).
  COSTO_RADIAL: 1.5, DANO_RADIAL: 0.9,
  radioRadial(j) { return this.radioRadialDe(j, j.elementoActivo); },
  radioRadialDe(j, elem) { return Math.max(1, Math.floor(this.alcanceDe(j, elem) / 2)); },
  esRadial(h) { return !!h && h.forma === 'circulo' && !h.centro; },
  conCostoRadial(h) { return this.esRadial(h) ? Object.assign({}, h, { costo: Math.round(h.costo * this.COSTO_RADIAL * 100) / 100, radial: true }) : h },
  // XP DE TÉCNICA SOLO AL IMPACTAR (nada al aire): lanzar al aire sin tocar
  // nada no sube nada — si no, se farmea parado lanzando energía. Enemigo /
  // criatura / inocente = ganancia NORMAL (como antes). Árbol, roca o cactus =
  // una PIZCA de maestría (entrenamiento de mundo: ayuda en niveles muy bajos,
  // ~0.06% por golpe a maestría 0; no despierta el elemento por sí solo).
  // Místico no tiene maestría: contra un árbol no gana nada (lo mental no se
  // entrena con un árbol). El coste de Esencia se paga igual al lanzar.
  otorgarXpTecnica(elem, tipo, desafio) {
    if (!elem) return;
    if (tipo === 'enemigo') {
      const d = desafio == null ? 0.5 : desafio;
      if (elem === 'mistico') U.Crecimiento.stat('mente', 0.1, d); else U.Crecimiento.maestria(elem, 0.5, d);
      U.Crecimiento.stat('mente', 0.06, 1); U.Crecimiento.stat('ataque', 0.03, d);
    } else if (tipo === 'mundo') {
      if (elem === 'mistico') return;
      U.Crecimiento.maestria(elem, 0.1, 1); // pizca: base 0.1 (1/5 de lo normal)
    }
  },
  // XP DE YANG SOLO AL IMPACTAR (nada al aire): la misma regla que las
  // técnicas elementales. Enemigo / criatura / inocente = NORMAL (estilo
  // 0.35 + Mente 0.08, como antes). Árbol, roca o cactus = una PIZCA de
  // estilo (0.07, 1/5 de lo normal) y 0 Mente. El coste de Esencia se
  // paga igual al lanzar.
  otorgarXpYang(tipo) {
    if (tipo === 'enemigo') { U.Crecimiento.estilo('yang', 0.35, 1); U.Crecimiento.stat('mente', 0.08, 1); }
    else if (tipo === 'mundo') { U.Crecimiento.estilo('yang', 0.07, 1); } // pizca: 1/5 de lo normal
  },
  // Técnica ELEMENTAL del equipo. id = id de registro ('tec:<elem>:<id>'); sin id,
  // la primera técnica elemental EQUIPADA; sin ninguna equipada, el ataque básico.
  // Cada técnica usa SU elemento (color, coste ambiental, maestría, alcance).
  tecnica(id) {
    const E = U.Juego.estado, j = E.jugador;
    let tec = id ? U.Habilidades.porId(j, id) : null;
    if (id && (!tec || (tec.kind !== 'elemento' && tec.kind !== 'mistico' && tec.kind !== 'alma'))) { U.HUD.toast('Técnica desconocida.', 'aviso'); return; }
    if (!tec) { const eq = U.Habilidades.equipoDetalles(j).filter(t => t.kind === 'elemento' || t.kind === 'alma'); if (!eq.length) { this.ataqueBasico(); return; } tec = eq[0]; }
    const h = tec;
    if (!U.Habilidades.aprendida(j, tec)) { U.HUD.toast(h.nombre + ' requiere maestría mínima de ' + h.umbral + '% y aprenderla de un Guía, por tarea. Canaliza con Yin: la maestría sube con curva multiplicativa, cada tramo cuesta más.', 'aviso'); U.Audio.sfx('fail'); return; }
    if (U.Habilidades.podarEquipo(j).indexOf(tec.id) < 0) { U.HUD.toast(h.nombre + ' no está en tu EQUIPO: equípala en Pausa → Ajustes → Equipo.', 'aviso'); U.Audio.sfx('fail'); return; }
    // Compatibilidad: tecnicaIdx sigue apuntando a la técnica usada dentro de su elemento.
    const idxTec = (U.Habilidades.elementos[h.elemento] || []).findIndex(x => x.id === h.tecId);
    if (idxTec >= 0) j.tecnicaIdx = idxTec;
    if ((j.cdTec[h.id] || 0) > 0) return;
    const z = U.Ambiente.zonaEn(j.x, j.y); const c = h.elemento === 'mistico' ? { costo: h.costo } : U.Ambiente.costo(this.conCostoRadial(h), h.elemento, z, j.atributo); // radial (círculo a tu alrededor): +50% de Esencia; Místico: costo plano, sin ambiente
    if (!U.Recuperacion.gastar(c.costo, { ajustado: !c.inestable })) return;
    j.cdTec[h.id] = h.cd; j.ataqueAnim = 0.3; j.descansando = false; const el = U.Elementos.datos[h.elemento] || { color: '#e8a2e0', claro: '#f3c6f1' }; const atk = (U.Reliquias ? U.Reliquias.statEf(j, 'ataque') : j.stats.ataque) * (j.buffs.sobrecarga > 0 ? 2 : 1); const base = atk * h.power * ((j.reliquias && j.reliquias.artefactos && j.reliquias.artefactos.indexOf('espada') >= 0) ? 1.25 : 1); // ✦ Espada de Orión: +25% de daño elemental
    const alcEf = (tec.kind === 'alma' || h.elemento === 'mistico') ? (h.alcance || h.radio || 3) : Math.max(1, Math.min(h.alcance || h.radio || 99, this.alcanceDe(j, h.elemento))); // alcance efectivo: lo que la forma de la técnica permita, topado por tu maestría (1 celda a 0–5% … 20 a 100%); Místico y Alma no usan maestría: su alcance es el de la técnica (la heredada no se topa: no es dominada, es heredada)
    U.Audio.sfx(h.elemento); this.sacudir(0.4); E.resumen.tecnicas++;
    let objetivo = this.vivos()[0]; let desafio = 0.5;
    let impactoEnemigo = false, impactoMundo = false; // solo al impactar hay XP (nada al aire)
    const golpear = (celdas, opts, baseUsada) => { const b = baseUsada != null ? baseUsada : base; if (this.golpearObjetos(celdas, b * 0.85).length) impactoMundo = true; if (this.golpearInocentes(celdas)) impactoEnemigo = true; if (U.Criaturas && U.Criaturas.impactoJugador(celdas, { dmg: b, elemento: h.elemento })) impactoEnemigo = true; this.vivos().forEach(e => { if (U.Grid.enCeldas(celdas, e)) { this.dañoEnemigo(e, b, h.elemento, Object.assign({ desafio: this.desafio(e), alcance: alcEf }, opts || {}, h.efecto || {})); desafio = Math.max(desafio, this.desafio(e)); objetivo = e; impactoEnemigo = true; } }); };
    switch (h.forma) {
      case 'linea': case 'rect': { const celdas = U.Grid.forma(h.forma, j.x, j.y, j.dir, alcEf, h.radio || 0); E.efectos.haces.push({ celdas, color: el.color, t: 0.3, max: 0.3 }); golpear(celdas); this.particulas(j.x + j.dir.x * 2, j.y + j.dir.y * 2 - 0.5, 10, el.claro, h.elemento === 'agua' ? 'agua' : 'chispa'); break; }
      case 'cono': { const celdas = U.Grid.forma('cono', j.x, j.y, j.dir, alcEf, 0); E.efectos.haces.push({ celdas, color: el.color, t: 0.35, max: 0.35 }); golpear(celdas); this.particulas(j.x + j.dir.x * 1.5, j.y + j.dir.y * 1.5 - 0.5, 16, el.claro, 'brasa'); break; }
      case 'alterna': { const celdas = U.Grid.forma('alterna', j.x, j.y, j.dir, alcEf, 0); E.efectos.haces.push({ celdas, color: el.color, t: 0.35, max: 0.35 }); golpear(celdas, null, base * 1.2); this.particulas(j.x + j.dir.x * 2, j.y + j.dir.y * 2 - 0.5, 14, el.claro, 'brasa'); break; }
      case 'circulo': { const esRad = !h.centro; const radioEf = esRad ? ((tec.kind === 'alma' || h.elemento === 'mistico') ? (h.radio || 1) : this.radioRadialDe(j, h.elemento)) : h.radio; const cx = h.centro === 'frente4' ? j.x + j.dir.x * Math.min(4, alcEf) : j.x, cy = h.centro === 'frente4' ? j.y + j.dir.y * Math.min(4, alcEf) : j.y; const celdas = U.Grid.forma('circulo', cx, cy, j.dir, 0, radioEf); E.efectos.haces.push({ celdas, color: el.color, t: 0.35, max: 0.35 }); E.efectos.anillos.push({ x: cx, y: cy, radio: radioEf, color: el.claro, t: 0.4, max: 0.4 }); golpear(celdas, null, esRad ? base * this.DANO_RADIAL : base); this.particulas(cx, cy - 0.5, 20, el.claro, 'chispa'); this.sacudir(0.8); break; }
      case 'proyectil': this.proyectil(j, Object.assign({}, h, { alcance: alcEf, xpTec: true }), base, h.elemento, el.color, 'jugador'); break;
      case 'cadena': { const vivos = this.vivos().map(e => ({ e, d: U.Grid.dist(e, j) })).filter(o => o.d <= alcEf).sort((a, b) => a.d - b.d).slice(0, h.saltos); const puntos = [{ x: j.x, y: j.y }]; vivos.forEach(o => { puntos.push({ x: o.e.x, y: o.e.y }); this.dañoEnemigo(o.e, base, h.elemento, Object.assign({ desafio: this.desafio(o.e), alcance: alcEf }, h.efecto || {})); desafio = Math.max(desafio, this.desafio(o.e)); }); if (puntos.length > 1) { impactoEnemigo = true; E.efectos.cadenas.push({ puntos, t: 0.25, max: 0.25 }); } else { U.HUD.toast('Ningún enemigo al alcance de la cadena.', ''); } break; }
      case 'destello': { // DESTELLO (Rayo): flash blanco SUAVE y gradual + ceguera en área. Sin daño directo grande: su poder es dejarlos ciegos.
        this.flashPantalla = { t: 0, max: 1.6 }; // lo pinta U.HUD: sube suave a su pico y decae poco a poco (nunca un estrobo); el ajuste de destellos puede reducirlo o apagarlo
        let ceg = 0; this.vivos().forEach(e => { if (U.Grid.dist(e, j) <= (h.radio || 4)) { e.efectos.cegado = Math.max(e.efectos.cegado || 0, (h.efecto && h.efecto.cegar) || 3); this.dañoEnemigo(e, base, h.elemento, { desafio: this.desafio(e), alcance: h.radio || 4 }); this.texto(e, '👁 CEGADO', '#fff7c2', 1); ceg++; desafio = Math.max(desafio, this.desafio(e)); } }); if (ceg) impactoEnemigo = true;
        E.efectos.anillos.push({ x: j.x, y: j.y, radio: h.radio || 4, color: '#fff7c2', t: 0.5, max: 0.5 }); this.particulas(j.x, j.y - 0.6, 26, '#fff7c2', 'chispa'); U.Audio.sfx('rayo');
        U.HUD.toast(ceg ? '✦ DESTELLO: ' + ceg + ' enemigo(s) CEGADOS unos segundos: no te ven y sus ataques fallan.' : '✦ DESTELLO: luz lanzada, sin enemigos cerca que cegar.', ceg ? 'exito' : 'aviso'); break; }
    }
    // XP SOLO AL IMPACTAR (nada al aire): enemigo/criatura/inocente = normal;
    // árbol/roca/cactus = una pizca de maestría (entrenamiento de mundo). El
    // proyectil otorga su XP al impactar (actualizarProyectiles), no al lanzar.
    if (h.forma !== 'proyectil') { if (impactoEnemigo) this.otorgarXpTecnica(h.elemento, 'enemigo', desafio); else if (impactoMundo) this.otorgarXpTecnica(h.elemento, 'mundo', 1); }
  },
  proyectil(origen, h, base, elemento, color, dueño) {
    const d = U.Grid.dir8(origen.dir.x, origen.dir.y); const vel = h.vel || 7;
    U.Juego.estado.proyectiles.push({ x: origen.x + d.x * 0.6, y: origen.y + d.y * 0.6, dx: d.x, dy: d.y, vel, vida: (h.alcance || 9) / vel, dueño, base, elemento, color, alcance: h.alcance || 9, ox: origen.x, oy: origen.y, forma: h.id === 'roca' ? 'roca' : 'esfera', explora: h.explora || null, efecto: h.efecto || null, cometa: !!h.cometa, golpeados: [], xpTec: !!h.xpTec, xpYang: !!h.xpYang }); // xpTec/xpYang: proyectil de TÉCNICA o de YANG — su XP se otorga al impactar, no al lanzar
  },
  dash() {
    const E = U.Juego.estado, j = E.jugador; if (j.dash.cd > 0 || j.dash.t > 0) return; if (!U.Recuperacion.gastar(U.Habilidades.costoDash(j))) return;
    const I = U.Juego.input; const d = (I && I.mag > 0.1) ? U.Grid.dir8(I.vx, I.vy) : j.dir; const dist = (2.2 + (U.Reliquias ? U.Reliquias.statEf(j, 'velocidad') : j.stats.velocidad) * 0.06 * (j.buffs.sobrecarga > 0 ? 1.5 : 1)) * (j.elementoActivo === 'rayo' ? 1.6 : 1) * (j.tiempoLento ? 1.5 : 1); // Rayo: paso relámpago · SINERGIA con Tiempo Lento: el mundo lento hace el dash aún más efectivo (alcance ×1.5; el daño ×1.25 va en golpeDash)
    j.dash = { t: 0.16, cd: 0.6, dx: d.x * dist / 0.16, dy: d.y * dist / 0.16, golpeados: [] }; j.invuln = Math.max(j.invuln, 0.24); j.dir = d; j.descansando = false; j.cargando = false;
    U.Audio.sfx('dash'); this.particulas(j.x, j.y - 0.3, 8, '#7ef0c0', 'polvo'); if (E.enCombate) { U.Crecimiento.stat('velocidad', 0.1, 1); U.Crecimiento.estilo('yang', 0.05, 1); } // SIN farmeo: fuera de combate el dash NO da experiencia; en combate, poquito Yang (0.05: un tercio de lo que da un golpe Yin que conecta, 0.15). El dash es Yang, así que su poquito es de Yang, no de Yin.
    E.resumen.dashes++; if (U.Juego.progresoEntreno) U.Juego.progresoEntreno('esquiva', 1);
  },
  sobrecarga() {
    const j = U.Juego.estado.jugador; const s = U.Habilidades.yin.sobrecarga;
    // INTERRUPTOR: si ya está activa, este mismo botón la APAGA (se detiene el drenaje y el ×2).
    if (j.buffs.sobrecarga > 0) { j.buffs.sobrecarga = 0; j.cargando = false; U.Audio.sfx('click'); U.HUD.toast('Sobrecarga DESACTIVADA: el drenaje se detiene y el aumento de fuerza termina.', 'exito'); return; }
    if (j.estilos.yin < s.umbral) { U.HUD.toast('Sobrecarga requiere Yin ' + s.umbral + '.', 'aviso'); return; }
    j.buffs.sobrecarga = 1; U.Audio.sfx('sobrecarga'); this.sacudir(1); this.particulas(j.x, j.y - 0.6, 30, '#ff5470', 'brasa'); U.HUD.banner('SOBRECARGA', 1.2); U.HUD.toast('Sobrecarga ACTIVA: Ataque y Velocidad ×2. Drena SOLO Esencia (5%/s); si la Esencia llega a 0, drena VIDA a la misma tasa y solo podrás golpear. Pulsa X otra vez para desactivarla cuando quieras.', 'peligro');
  },
  // ---------- TIEMPO LENTO (Yang avanzado, interruptor) ----------
  // Escala del mundo y dreno según el nivel de Yang (25–100). Nivel 25
  // (desbloqueo): mundo a 0.75×, dreno 20 Esencia/s. Nivel 50: ~0.58×, 16/s.
  // Nivel 75: ~0.42×, 12/s. Nivel 100: mundo a 0.25×, dreno 8/s. La práctica
  // lo hace más eficiente: más lento el mundo, menos dreno.
  escalaTiempoLento(nivel) { const f = Math.max(0, Math.min(1, ((nivel || 0) - 25) / 75)); return 0.75 - 0.5 * f; },
  drenoTiempoLento(nivel) { const f = Math.max(0, Math.min(1, ((nivel || 0) - 25) / 75)); return 20 - 12 * f; },
  // Escala del mundo AHORA (1 = normal; <1 = Tiempo Lento activo).
  escalaMundo() { const E = U.Juego.estado, j = E && E.jugador; return (j && j.tiempoLento) ? this.escalaTiempoLento(j.estilos.yang || 0) : 1; },
  toggleTiempoLento() {
    const E = U.Juego.estado, j = E.jugador;
    if (!j || !j.tieneYang) return;
    const tl = U.Habilidades.yang.tiempoLento;
    if (j.tiempoLento) { j.tiempoLento = false; U.HUD.toast('El mundo vuelve a su velocidad.', 'info'); U.Audio.sfx('click'); U.HUD.refrescarEquipo(); return; }
    if ((j.estilos.yang || 0) < tl.umbral) { U.HUD.toast('Tiempo Lento requiere Yang ' + tl.umbral + ' (tienes ' + Math.floor(j.estilos.yang || 0) + ').', 'info'); U.Audio.sfx('fail'); return; }
    if (U.Habilidades.podarEquipo(j).indexOf('yang:tiempoLento') < 0) { U.HUD.toast('Tiempo Lento no está en tu equipo (Pausa → Ajustes → Equipo).', 'info'); U.Audio.sfx('fail'); return; }
    if (j.esencia <= 0 || j.agotado) { U.HUD.toast('Sin Esencia: no puedes entrar en Tiempo Lento.', 'info'); U.Audio.sfx('fail'); return; }
    j.tiempoLento = true;
    U.HUD.banner('TIEMPO LENTO', 1.6);
    U.HUD.toast('El mundo se pone lento. Drena Esencia rápido (' + Math.round(this.drenoTiempoLento(j.estilos.yang || 0)) + '/s). El reloj del día sigue a su ritmo.', 'info');
    U.Audio.sfx('unlock');
    U.HUD.refrescarEquipo();
  },
  // ---------- RESISTENCIA DE ACERO (Yin, interruptor defensivo) ----------
  toggleAcero() {
    const E = U.Juego.estado, j = E.jugador;
    const a = U.Habilidades.yin.acero;
    if (j.acero) { j.acero = false; U.HUD.toast('Resistencia de Acero desactivada: tu cuerpo vuelve a ser normal.', 'info'); U.Audio.sfx('click'); U.HUD.refrescarEquipo(); return; }
    if ((j.estilos.yin || 0) < a.umbral) { U.HUD.toast('Resistencia de Acero requiere Yin ' + a.umbral + ' (tienes ' + Math.floor(j.estilos.yin || 0) + ').', 'info'); U.Audio.sfx('fail'); return; }
    if (U.Habilidades.podarEquipo(j).indexOf('yin:acero') < 0) { U.HUD.toast('Resistencia de Acero no está en tu equipo (Pausa → Ajustes → Equipo).', 'info'); U.Audio.sfx('fail'); return; }
    if (j.agotado || j.esencia < a.costoActivar) { U.HUD.toast('Resistencia de Acero: necesitas al menos ' + a.costoActivar + ' de Esencia.', 'info'); U.Audio.sfx('fail'); return; }
    if (!U.Recuperacion.gastar(a.costoActivar)) return;
    j.acero = true; j.descansando = false; U.Audio.sfx('yang');
    U.HUD.banner('RESISTENCIA DE ACERO', 1.4);
    U.HUD.toast('Resistencia de Acero ACTIVA: el daño que recibes se reduce a la mitad. Drena ' + a.drain + ' Esencia/s. No te pone lento (a diferencia de la Armadura de Metal). Pulsa de nuevo para soltarla.', 'exito');
    U.HUD.refrescarEquipo();
  },
  // ---------- VELOCIDAD EXTREMA: el dash GOLPEA al pasar ----------
  // Al pasar por enfrente de un enemigo lo golpea (una sola vez por enemigo y
  // por dash). Daño base = Ataque ×1.0. SINERGIA con Tiempo Lento: con el mundo
  // lento el dash es aún más efectivo: daño ×1.25 (el alcance ×1.5 va en dash()).
  golpeDash() {
    const E = U.Juego.estado, j = E.jugador; if (!j.dash || !j.dash.golpeados) return;
    const atk = (U.Reliquias ? U.Reliquias.statEf(j, 'ataque') : j.stats.ataque) * (j.buffs.sobrecarga > 0 ? 2 : 1);
    const mult = j.tiempoLento ? 1.25 : 1;
    this.vivos().forEach(e => { if (j.dash.golpeados.indexOf(e) >= 0) return; if (U.Grid.dist(e, j) < 0.9) { j.dash.golpeados.push(e); this.dañoEnemigo(e, atk * 1.0 * mult, null, { desafio: this.desafio(e), yang: true }); if (j.tiempoLento) this.texto(e, 'SINERGIA ×1.25', '#f8fafc', 1); } });
  },
  // El elemento ya NO cambia: queda el del test (el principal) toda la vida. Esta
  // función queda como guarda legacy (la tecla Tab de main.js la sigue llamando):
  // no toca j.elementoActivo en ningún sitio.
  cambiarElemento(id) { const j = U.Juego.estado.jugador; U.HUD.toast('Tu elemento es ' + U.Elementos.nombre(j.elementoActivo) + ', el del test: no cambia en esta vida. Lo que cambia es tu EQUIPO (Pausa → Ajustes → Equipo), que puede mezclar técnicas de todos tus elementos.', ''); },
  // Teclas 1-5: USAN la técnica del equipo en ese hueco (1 = primera equipada…).
  seleccionarTec(i) { const j = U.Juego.estado.jugador; const eq = U.Habilidades.equipoDetalles(j); const tec = eq[i]; if (!tec) { if (i === 0) this.ataqueBasico(); return; } this.usarEquipo(tec.id); },
  seleccionarYang(f) { const j = U.Juego.estado.jugador; if (f === 'tiempoLento') return; if (!j.tieneYang) { U.HUD.toast('Yang sin despertar: entrénalo hasta ' + U.Habilidades.yangDespertar + ' (meditar al descansar, sesiones con Torin) y despertará.', 'aviso'); return; } const h = U.Habilidades.yang[f]; if (!h) return; if (j.estilos.yang < h.umbral) { U.HUD.toast(h.nombre + ': estilo Yang ' + h.umbral + ' requerido.', 'aviso'); U.Audio.sfx('fail'); return; } if (U.Habilidades.podarEquipo(j).indexOf('yang:' + f) < 0) { U.HUD.toast(h.nombre + ' no está en tu EQUIPO: equípala en Pausa → Ajustes → Equipo.', 'aviso'); U.Audio.sfx('fail'); return; } j.yangForma = f; U.Audio.sfx('click'); U.HUD.refrescarChips(); },

  // Devuelve cuántos inocentes golpeó (0 si ninguno): una técnica que conecta
  // con un ser vivo (aunque sea inocente, con su castigo de karma) sí impactó.
  golpearInocentes(celdas, arco) {
    const E = U.Juego.estado; if (!celdas || !E.npcs) return 0;
    let n = 0;
    E.npcs.forEach(npc => { if (npc.enCasa || npc.ocultoSparring) return; if (U.Grid.enCeldas(celdas, npc) || (arco && U.Grid.enArco(arco.x, arco.y, arco.dir, arco.alcance, npc))) { n++; U.Economia.karmaAdd(-10, U.Economia.puebloDeMapa(npc.mapa)); U.Economia.confianza(npc, -15); this.texto(npc, '¡A UN INOCENTE!', '#ff4d4d', 1); if (!npc.hechos) npc.hechos = []; npc.hechos.push('le pegaste sin razón'); U.HUD.toast('Pegaste a ' + npc.nombre + ', un inocente: karma −10 en este pueblo y su confianza cae.', 'peligro'); if (U.Progresion) U.Progresion.sumarRecompensa(1, 'pegar a un inocente'); } });
    return n;
  },
  // ---------- daño ----------
  dañoEnemigo(e, base, elemento, o) {
    o = o || {}; const E = U.Juego.estado;
    if (e.escudoT > 0) { this.texto(e, 'ESCUDO', '#e8a2e0', 1); this.particulas(e.x, e.y - 0.6, 4, '#e05bd0', 'chispa'); U.Audio.sfx('esquiva'); return; }
    let d = U.Estadisticas.formulaDaño(base, e.stats.defensa); const m = U.Elementos.multiplica(elemento, e.elemento); d = Math.max(1, Math.round(d * m));
    // CAÍDA POR DISTANCIA (solo ataques elementales, que traen o.alcance): 100% a 1 celda → 80% en la última celda del alcance, lineal entre ambas.
    if (elemento && o.alcance) { const distF = o.dist != null ? o.dist : U.Grid.dist(e, E.jugador); const fD = this.factorDistancia(distF, o.alcance); if (fD < 1) { d = Math.max(1, Math.round(d * fD)); if (fD <= 0.95) this.texto({ x: e.x, y: e.y - 1.35 }, '📉 LEJOS −' + Math.round((1 - fD) * 100) + '%', '#9fb3d9', 1); } }
    e.vida -= d; e.flash = 0.12; E.resumen.daño += d;
    const col = elemento ? U.Elementos.color(elemento) : (o.yang ? '#f8fafc' : '#ffd08a');
    this.texto(e, '-' + d, m > 1 ? '#ffe14d' : m < 1 ? '#9fb3d9' : col, m > 1 || o.cargado ? 2 : 1);
    if (m > 1) this.texto({ x: e.x, y: e.y - 0.9 }, 'VENTAJA', '#ffe14d', 1); else if (m < 1) this.texto({ x: e.x, y: e.y - 0.9 }, 'RESISTE', '#9fb3d9', 1);
    this.particulas(e.x, e.y - 0.6, o.cargado ? 14 : 7, col, 'chispa'); U.Audio.sfx('golpe'); this.sacudir(o.cargado ? 0.5 : 0.25);
    if (o.empuje) { const dx = e.x - E.jugador.x, dy = e.y - E.jugador.y, dd = Math.hypot(dx, dy) || 1; U.Grid.mover(E.mapa, e, dx / dd * o.empuje * 0.5, dy / dd * o.empuje * 0.5); }
    if (o.stun) e.efectos.stun = Math.max(e.efectos.stun, o.stun); if (o.slow) e.efectos.slow = Math.max(e.efectos.slow, o.slow); if (o.cegar) e.efectos.cegado = Math.max(e.efectos.cegado || 0, o.cegar); if (o.dot) e.efectos.dot = { dmg: o.dot.dmg, t: o.dot.t, tick: 0 };
    if (o.desafio) U.Crecimiento.stat('ataque', 0.02, o.desafio);
    if (e.esSparring) { const minS = Math.max(1, Math.ceil(e.stats.vida * 0.10)); if (e.vida <= minS) { e.vida = minS; e.retirarSparring = true; } }
    else if (e.vida <= 0) this.morir(e);
  },
  dañoJugador(base, atacante, efecto, info) {
    const E = U.Juego.estado, j = E.jugador;
    if (j.escudo) {
      info = info || {};
      const resuelto = this.resolverEscudo(base, { elemento: info.elemento != null ? info.elemento : null, proyectil: !!info.proyectil, ox: info.ox != null ? info.ox : (atacante ? atacante.x : null), oy: info.oy != null ? info.oy : (atacante ? atacante.y : null), atacante: atacante || null });
      if (resuelto <= 0) return;
      base = resuelto; // lo que el escudo dejó pasar sigue su curso normal (defensa, etc.)
    }
    if (j.invuln > 0) { this.texto(j, 'ESQUIVA', '#7ef0c0', 1); U.Audio.sfx('esquiva'); U.Crecimiento.stat('velocidad', 0.15, atacante ? this.desafio(atacante) : 1); E.resumen.esquives++; return; }
    let d = Math.max(1, Math.round(U.Estadisticas.formulaDaño(base, U.Reliquias ? U.Reliquias.statEf(j, 'defensa') : j.stats.defensa)));
    // RESISTENCIA DE ACERO (Yin): el cuerpo endurecido reduce el daño a la mitad (no a 0: eso es la Armadura de Metal).
    if (j.acero) { d = Math.max(1, Math.round(d * U.Habilidades.yin.acero.reduccion)); this.texto(j, 'ACERO −50%', '#94a3b8', 1); this.particulas(j.x, j.y - 0.6, 4, '#94a3b8', 'chispa'); }
    j.vida -= d; j.flash = 0.15; j.descansando = false; E.resumen.recibido += d;
    this.texto(j, '-' + d, '#ff5470', d > j.stats.vida * 0.1 ? 2 : 1); this.particulas(j.x, j.y - 0.6, 8, '#ff5470', 'chispa'); U.Audio.sfx('daño'); this.sacudir(0.9); E.hitstop = 0.03;
    if (atacante) { const ds = this.desafio(atacante); U.Crecimiento.stat('defensa', 0.04, ds); if (d >= j.stats.vida * 0.08) { U.Crecimiento.stat('vida', 0.4, ds); j.flags.peleaDura = true; } }
    if (efecto && efecto.dot) j.dot = { dmg: efecto.dot.dmg, t: efecto.dot.t, tick: 0 };
    if (efecto && efecto.invertir && j.vida > 0) { const durInv = Math.max(1, Math.round(efecto.invertir * (U.Reliquias ? U.Reliquias.resistMental(j) : 1) * 10) / 10); j.invertido = Math.max(j.invertido || 0, durInv); j.invTotal = Math.max(j.invTotal || 0, durInv); j.invMapa = U.Inversion ? U.Inversion.generar() : null; U.HUD.banner('🌀 ¡HECHIZO DE INVERSIÓN! · TU MOVIMIENTO SE REMAPEA ' + durInv + 's · DESCÚBRELO PROBANDO' + (U.Reliquias && U.Reliquias.puestaDe(j) === 'mente' ? ' · 🎭 TU MÁSCARA DE LA MENTE LO ACORTÓ' : ''), 1.8); U.Audio.sfx('viento'); }
    if (E.sparring && E.sparring.fase === 'peleando' && j.vida <= j.stats.vida * 0.10) { j.vida = Math.max(1, Math.ceil(j.stats.vida * 0.10)); E.sparringJugadorDebil = true; }
    else if (j.vida <= 0) { j.vida = 0; U.Juego.fin('derrota'); }
  },
  morir(e) {
    if (e.esRival && U.Rival) U.Rival.alDerrotaRival(e); // IDEA 1: si cae Ren, el duelo se resuelve al instante (el sondeo de U.Rival es el respaldo)
    if (e.esSparring) { e.vida = Math.max(1, Math.ceil(e.stats.vida * 0.10)); e.retirarSparring = true; return; }
    const E = U.Juego.estado; e.vida = 0; e.estado = 'muerto'; E.resumen.bajas++; if (U.Audio && typeof U.Audio.sfxCerca === 'function') U.Audio.sfxCerca('muerte', e.x, e.y, 2); else U.Audio.sfx('muerte'); this.particulas(e.x, e.y - 0.6, 24, U.Elementos.color(e.elemento), 'chispa'); this.particulas(e.x, e.y - 0.6, 8, '#9fb3d9', 'humo'); this.sacudir(0.6); E.hitstop = 0.06;
    E.orbes.push({ x: e.x, y: e.y, t: 12 });
    { const premio = { bandido: 6, brasa: 7, chaman: 10, ilusionista: 12, veterano: 16 }[e.clase] || 5; E.jugador.monedas = (E.jugador.monedas || 0) + premio; this.texto(e, '+' + premio + ' 🪙', '#ffe14d', 1);
      if (e.esOrg && U.Orgs) U.Orgs.enemigoDerrotado(e);
      if (e.esBestia && U.Juego.progresoMision) U.Juego.progresoMision('cazar', 1);
      if (e.esRescate && U.Juego.progresoMision) U.Juego.progresoMision('rescatar', 1);
      if (e.esEscolta && E.escolta) E.escolta.bandidosFuera = (E.escolta.bandidosFuera || 0) + 1; }
    const ds = this.desafio(e); U.Crecimiento.stat('ataque', 0.2, ds); U.Crecimiento.stat('mente', 0.12, ds); U.Crecimiento.maestria(e.elemento === E.jugador.elementoActivo ? e.elemento : E.jugador.elementoActivo, 0.6, ds);
    this.texto(e, 'CAÍDO', '#e8dcc8', 1);
  },

  // ---------- CANVAS / TOLERANCIA (Tarea 3) ----------
  // ZONA VISIBLE = el canvas. distAlCanvas(x,y) = celdas más allá del borde
  // del canvas (0 = dentro). Tolerancia = 10 celdas más allá del borde: ahí
  // el enemigo SIGUE EXISTIENDO (se mueve, se le puede perseguir) pero NO
  // puede atacar ni dar XP defensiva. Más allá (>10) desaparece, salvo
  // exentos. La cámara (estado.camara, px) sigue al jugador cada cuadro
  // (render.js), así que el rect se calcula desde ella en vivo.
  TOLERANCIA: 10,        // celdas más allá del borde del canvas
  HUIDA_UMBRAL: 0.25,    // ≤25% de vida máx: el débil huye (alineado con Banter.UMBRAL)
  HUIDA_VEL: 3.4,        // celdas/s alejándose del jugador
  HUIDA_MAX_T: 6,        // s huyendo antes de desaparecer
  SPAWN_CERCA: 12,       // un spawn a ≤12 celdas del jugador es "cercano": se sujeta al canvas
  // Rect visible en celdas: x0..x1, y0..y1. Sin cámara/render (Node/tests),
  // se estima centrado en el jugador (±8 en X, ±6 en Y). Sin jugador, null.
  rectCanvas() {
    const E = U.Juego && U.Juego.estado;
    const j = E && E.jugador;
    const R = U.Render;
    if (E && E.camara && R && isFinite(R.viewW) && isFinite(R.viewH) && R.viewW > 0 && R.viewH > 0) {
      const TS = 16;
      return { x0: E.camara.x / TS, x1: (E.camara.x + R.viewW) / TS, y0: E.camara.y / TS, y1: (E.camara.y + R.viewH) / TS };
    }
    if (j && isFinite(j.x) && isFinite(j.y)) return { x0: j.x - 8, x1: j.x + 8, y0: j.y - 6, y1: j.y + 6 };
    return null;
  },
  // Distancia en celdas más allá del borde del canvas (0 = dentro). Acepta
  // (x, y) o un objeto {x, y}. Si el runtime ya trae U.Render.distAlCanvas
  // (trabajador A) se prefiere, con una comprobación de cordura: el jugador
  // SIEMPRE está dentro del canvas, así que si ese helper no lo ve a
  // distancia 0 (otra definición u otras unidades), se ignora y se usa el
  // cálculo propio. Sin rect conocido, 0 (dentro: no se despawnea a ciegas).
  distAlCanvas(x, y) {
    if (x && typeof x === 'object') { y = x.y; x = x.x; }
    const R = U.Render;
    if (R && typeof R.distAlCanvas === 'function') {
      try {
        const d = R.distAlCanvas(x, y);
        const E = U.Juego && U.Juego.estado, j = E && E.jugador;
        const dj = j ? R.distAlCanvas(j.x, j.y) : 0;
        if (typeof d === 'number' && isFinite(d) && dj === 0) return Math.max(0, d);
      } catch (err) { /* cae al cálculo propio */ }
    }
    const r = this.rectCanvas();
    if (!r) return 0;
    const dx = x < r.x0 ? r.x0 - x : (x > r.x1 ? x - r.x1 : 0);
    const dy = y < r.y0 ? r.y0 - y : (y > r.y1 ? y - r.y1 : 0);
    return Math.hypot(dx, dy);
  },
  // ¿Este enemigo puede despawnear por lejanía? NO: nocturnos (tienen su
  // ciclo noche/amanecer; si no se eximen, el spawn nocturno entraría en
  // bucle spawn→despawn), ni los de evento/misión (arena, torneo, reto,
  // sparring, jefe de guarida, rival, protección, escolta, rescate, bestia,
  // patrulla de zona), ni los de organizaciones (esOrg: guardias de
  // escondite con s.spawned=true que no re-spawnean si despawnean), ni la
  // población fija del mundo (esPoblacion: spawns fijos lejanos que existen
  // donde están hasta que el jugador llega; ver crearEnemigo). El GATE DE
  // ATAQUE sí aplica a todos, exentos incluidos.
  puedeDespawn(e) {
    return !e.nocturno && !e.esArena && !e.esTorneo && !e.esReto && !e.esSparring && !e.esJefeGuarida && !e.esRival && !e.esProteccion && !e.esEscolta && !e.esRescate && !e.esBestia && !e.esPatrullaZona && !e.esPoblacion && !e.esOrg;
  },
  // Sujeta un punto de spawn al borde INTERIOR del canvas (margen celdas
  // dentro del borde), en la dirección en que cae: el enemigo aparece
  // dentro y entra caminando, nunca en tolerancia ni más allá. Sin rect
  // conocido, lo deja como está. También lo sujeta a los límites del mapa.
  sujetarAlCanvas(x, y, margen) {
    const r = this.rectCanvas();
    if (!r) return { x, y };
    const m = (margen == null ? 1 : margen);
    let nx = Math.max(r.x0 + m, Math.min(r.x1 - m, x));
    let ny = Math.max(r.y0 + m, Math.min(r.y1 - m, y));
    const E = U.Juego && U.Juego.estado, mp = E && E.mapa;
    if (mp && isFinite(mp.ancho) && isFinite(mp.alto)) {
      nx = Math.max(0.5, Math.min(mp.ancho - 0.5, nx));
      ny = Math.max(0.5, Math.min(mp.alto - 0.5, ny));
    }
    return { x: nx, y: ny };
  },
  // Desaparición silenciosa: SIN XP, SIN monedas, SIN orbe, SIN banner.
  // morir() NO se llama: no hay recompensas. Sus telegrafías se limpian
  // solas: actualizarEfectos filtra por vivos() (que lee E.enemigos).
  desaparecer(e) {
    const E = U.Juego.estado;
    if (E.efectos) E.efectos.telegrafos = E.efectos.telegrafos.filter(t => t.owner !== e);
    const i = E.enemigos.indexOf(e);
    if (i >= 0) E.enemigos.splice(i, 1);
  },
  // ¿Este enemigo puede HUIR al quedar débil? Solo enemigos del mundo. Se
  // excluyen sparring, arena, torneo, reto, jefe de guarida, rival,
  // protección, patrulla de zona, defensores y los de misión (escolta,
  // rescate, bestia) y de organización (emboscadas, cazadores, guardias de
  // guarida): si huyeran y desaparecieran, su misión/evento quedaría
  // bloqueado sin forma de completarlo (la bestia que huye no se puede
  // cazar, los guardias que huyen no dejan entrar a la guarida). Los
  // nocturnos SÍ pueden huir: son bandidos del mundo y su ciclo
  // noche/amanecer no depende de ellos.
  puedeHuir(e) {
    if (!e || e.huyendo) return false;
    if (e.esSparring || e.esArena || e.esTorneo || e.esReto || e.esJefeGuarida || e.esRival || e.esProteccion || e.esPatrullaZona || e.esDefensor) return false;
    if (e.esEscolta || e.esRescate || e.esBestia) return false;
    if (e.esOrg) return false;
    return true;
  },
  // Cruce a ≤25%: empieza la huida (una sola vez por enemigo, marca
  // e.huyendo). Limpia la telegrafía en curso: el débil deja de
  // telegrafiar/atacar en el acto.
  iniciarHuida(e) {
    e.huyendo = true; e.huyendoT = 0;
    if (e.estado === 'telegrafia') { e.estado = 'persigue'; e.t = 0; e.tele = null; e.tecActual = null; }
    const E = U.Juego.estado;
    if (E.efectos) E.efectos.telegrafos = E.efectos.telegrafos.filter(t => t.owner !== e);
  },

  // ---------- enemigos ----------
  crearEnemigo(clase, x, y, mult) {
    const c = this.CLASES[clase]; const s = {}; for (const k in c.stats) s[k] = Math.round(c.stats[k] * mult * (k === 'vida' || k === 'esencia' ? 1 : 1));
    // SPAWN DENTRO DEL CANVAS: un spawn CERCANO (a ≤12 celdas del jugador:
    // ladrones de zonasSeguras, patrullas, retos, emboscadas, duelos, arena)
    // se sujeta al borde interior del canvas (1 celda dentro), nunca en
    // tolerancia ni más allá. Un spawn LEJANO (puntos fijos del mundo a más
    // de 12 celdas: spawnsAbiertos, bandidos nocturnos lejanos) se deja
    // DONDE ESTÁ y se marca esPoblacion: es población fija del mundo, existe
    // en su punto hasta que el jugador llega (el gate de ataque la mantiene
    // inactiva fuera del canvas) y no despawnea por lejanía. Sin esta
    // distinción, sujetar TODOS los puntos fijos los teletransportaría junto
    // al jugador al cambiar de mapa (10 spawnsAbiertos del mapa continuo de
    // la aldea, a 14–150 celdas del inicio: una emboscada de 10 enemigos
    // cada vez que se entra a la aldea) o los borraría en el primer tick.
    const E = U.Juego && U.Juego.estado, j = E && E.jugador;
    let px = x, py = y, esPoblacion = false;
    if (j && isFinite(j.x) && isFinite(j.y) && isFinite(x) && isFinite(y)) {
      if (Math.hypot(x - j.x, y - j.y) <= this.SPAWN_CERCA) { const sp = this.sujetarAlCanvas(x, y, 1); px = sp.x; py = sp.y; }
      else esPoblacion = true;
    }
    return { tipo: 'enemigo', clase, nombre: c.nombre, elemento: c.elemento, x: px, y: py, dir: { x: 0, y: 1 }, stats: s, vida: s.vida, estado: 'persigue', t: 0, cd: 1 + Math.random(), anim: Math.random(), moviendo: false, flash: 0, efectos: { stun: 0, slow: 0, dot: null, invertido: 0, invMapa: null, cegado: 0 }, tele: null, esReto: false, nocturno: false, escudoT: 0, escudoCd: 2 + Math.random() * 3, esTorneo: false, esProteccion: false, esPoblacion, setTec: (this.SETS[clase] || []).slice(), setTecManual: false, tecActual: null };
  },
  actualizarEnemigos(dt) {
    const E = U.Juego.estado, j = E.jugador; const vivos = this.vivos();
    vivos.forEach(e => {
      // DESPAWN POR LEJANÍA (canvas + tolerancia 10): fuera de la tolerancia
      // desaparece silencioso (sin XP, sin monedas, sin orbe, sin banner),
      // salvo exentos (puedeDespawn). Sin temporizador: la tolerancia de 10
      // celdas YA es el margen; más allá, fuera.
      if (this.puedeDespawn(e) && this.distAlCanvas(e.x, e.y) > this.TOLERANCIA) { this.desaparecer(e); return; }
      // HUIDA DEL DÉBIL: al CRUZAR ≤25% de vida máx (una sola vez por
      // enemigo, marca e.huyendo; alineado con Banter.UMBRAL para que la
      // línea 'casiPierde' y la huida coincidan en el mismo cuadro).
      if (!e.huyendo && this.puedeHuir(e) && e.vida > 0 && e.vida <= (e.stats.vida || 1) * this.HUIDA_UMBRAL) this.iniciarHuida(e);
      if (e.huyendo) {
        e.huyendoT = (e.huyendoT || 0) + dt;
        // Desaparición por huida: fuera de la tolerancia O ≥6 s huyendo.
        // Sin XP, sin monedas, sin orbe, sin banner. Si lo matan antes
        // (jugador o patrullero), morir() normal con recompensas.
        if (this.distAlCanvas(e.x, e.y) > this.TOLERANCIA || e.huyendoT >= this.HUIDA_MAX_T) { this.desaparecer(e); return; }
      }
      e.flash = Math.max(0, e.flash - dt); e.cd -= dt;
      // ESCUDO MÁGICO de hechiceros (chamán e ilusionista): se protegen, NO se mueven ni atacan mientras dura.
      e.escudoCd = Math.max(0, (e.escudoCd || 0) - dt);
      if (e.escudoT > 0) { e.escudoT -= dt; e.moviendo = false; if (Math.random() < dt * 6) this.particulas(e.x, e.y - 0.8, 1, '#e05bd0', 'chispa'); return; }
      if ((e.clase === 'chaman' || e.clase === 'ilusionista') && e.escudoCd <= 0 && e.vida < e.stats.vida * 0.75 && Math.random() < dt * 0.55) { e.escudoT = 2.4; e.escudoCd = 9; this.texto(e, '¡ESCUDO MÁGICO!', '#e8a2e0', 1); if (U.Audio && typeof U.Audio.sfxCerca === 'function') U.Audio.sfxCerca('yang', e.x, e.y, 2); else U.Audio.sfx('yang'); return; }
      if (e.efectos.stun > 0) { e.efectos.stun -= dt; e.moviendo = false; return; }
      if (e.efectos.slow > 0) e.efectos.slow -= dt;
      if (e.efectos.dot) { const d = e.efectos.dot; d.t -= dt; d.tick += dt; if (d.tick >= 0.5) { d.tick = 0; const dd = Math.max(1, Math.round(d.dmg)); e.vida -= dd; E.resumen.daño += dd; this.texto(e, '-' + dd, '#ff7a2f', 1); this.particulas(e.x, e.y - 0.8, 2, '#ff7a2f', 'brasa'); if (e.vida <= 0) { this.morir(e); return; } } if (d.t <= 0) e.efectos.dot = null; }
      const c = this.CLASES[e.clase]; const tgt = (e.esEscolta && E.escolta && E.escolta.activa) ? E.escolta.npc : j; const dx = tgt.x - e.x, dy = tgt.y - e.y, d = Math.hypot(dx, dy) || 0.001; e.dir = U.Grid.dir8(dx, dy); e.tgtEscolta = tgt !== j;
      const vel = (2.4 + e.stats.velocidad * 0.06) * (e.efectos.slow > 0 ? 0.45 : 1);
      if (e.estado === 'telegrafia') { e.t -= dt; e.moviendo = false; if (e.t <= 0) { this.ataqueEnemigo(e, c); e.estado = 'recupera'; e.t = 0.25; e.cd = c.cd / E.dificultad; E.efectos.telegrafos = E.efectos.telegrafos.filter(t => t.owner !== e); } return; }
      if (e.tgtEscolta) { /* su movimiento ya va hacia el escoltado por dx/dy */ }
      if (e.estado === 'recupera') { e.t -= dt; if (e.t <= 0) e.estado = 'persigue'; e.moviendo = false; return; }
      if (e.efectos.invertido > 0) e.efectos.invertido -= dt;
      if (e.efectos.cegado > 0) { e.efectos.cegado -= dt; e.moviendo = false; if (Math.random() < dt * 5) this.particulas(e.x, e.y - 0.9, 1, '#fff7c2', 'chispa'); return; } // CEGADO por Destello: no te ve, no se mueve a ti y no ataca (sus ataques fallan)
      if ((e.efectos.controlado || 0) > 0) { // CONTROL MENTAL (técnica prohibida): obedece al jugador y pelea contra los suyos
        e.efectos.controlado -= dt; e.moviendo = false;
        if (Math.random() < dt * 5) this.particulas(e.x, e.y - 0.9, 1, '#e05bd0', 'chispa');
        const objetivoC = this.vivos().filter(o => o !== e).sort((a, b) => U.Grid.dist(a, e) - U.Grid.dist(b, e))[0];
        if (objetivoC) { const dxc = objetivoC.x - e.x, dyc = objetivoC.y - e.y, dc = Math.hypot(dxc, dyc) || 0.001; e.dir = U.Grid.dir8(dxc, dyc);
          if (dc < 1.4) { if (e.cd <= 0) { e.cd = 1.3; this.dañoEnemigo(objetivoC, e.stats.ataque * 1.6, null, { desafio: this.desafio(objetivoC) }); this.texto(e, '🧠 OBEDECE', '#e05bd0', 1); } }
          else { U.Grid.mover(E.mapa, e, dxc / dc * 2.6 * dt, dyc / dc * 2.6 * dt); e.moviendo = true; e.anim += dt; } }
        return;
      }
      // movimiento
      let mx = 0, my = 0;
      if (e.huyendo) { mx = -dx / d; my = -dy / d; } // HUYE: corre ALEJÁNDOSE del jugador (U.Grid.mover desliza por ejes)
      else {
      if (e.clase === 'chaman') { if (d < 3.5) { mx = -dx / d; my = -dy / d; } else if (d > c.rango + 1) { mx = dx / d; my = dy / d; } }
      else if (d > c.rango) { mx = dx / d; my = dy / d; }
      if (e.efectos.invertido > 0 && (mx || my)) { if (!e.efectos.invMapa && U.Inversion) e.efectos.invMapa = U.Inversion.generar(); const mv = U.Inversion ? U.Inversion.aplicar(e.efectos.invMapa, mx, my) : { x: -mx, y: -my }; mx = mv.x; my = mv.y; }
      // Reposición activa (mago): sigue de lado mientras dure
      if (e.reposicion && e.reposicion.t > 0) { mx = e.reposicion.dx; my = e.reposicion.dy; e.reposicion.t -= dt; if (e.reposicion.t <= 0) e.reposicion = null; }
      // ATORADO (solo si NO huye: el que huye no se para a romper rocas ni a
      // rodear; si queda acorralado, el temporizador de 6 s lo hace
      // desaparecer igual): intenta moverse pero su posición casi no cambia
      // durante ~1.5 s (una roca/árbol le bloquea el paso)
      if (mx || my) {
        if (e._atoradoX == null) { e._atoradoX = e.x; e._atoradoY = e.y; e._atoradoT = 0; }
        else {
          const mov = Math.hypot(e.x - e._atoradoX, e.y - e._atoradoY);
          if (mov > 0.25) { e._atoradoT = 0; e._atoradoX = e.x; e._atoradoY = e.y; }
          else {
            e._atoradoT = (e._atoradoT || 0) + dt;
            if (e._atoradoT >= 1.5) {
              const esMago = (c.forma === 'linea'); // chamán, ilusionista: a distancia, no rompen
              if (!esMago) {
                const roto = this.romperObstaculoFrente(e, mx, my);
                if (roto) { e._atoradoT = 1.0; } // vuelve a golpear en 0.5 s si sigue ahí
                else { const lado = this.reposicionar(e, dx, dy, d); mx = lado.x; my = lado.y; e._atoradoT = 0; e._atoradoX = e.x; e._atoradoY = e.y; }
              } else {
                const lado = this.reposicionar(e, dx, dy, d); mx = lado.x; my = lado.y; e._atoradoT = 0; e._atoradoX = e.x; e._atoradoY = e.y;
              }
            }
          }
        }
      } else { e._atoradoT = 0; e._atoradoX = e.x; e._atoradoY = e.y; }
      } // fin del else (no huye)
      const velEf = e.huyendo ? this.HUIDA_VEL * (e.efectos.slow > 0 ? 0.45 : 1) : vel;
      if (mx || my) { U.Grid.mover(E.mapa, e, mx * velEf * dt, my * velEf * dt); e.moviendo = true; e.anim += dt; } else e.moviendo = false;
      // separación
      vivos.forEach(o => { if (o !== e) { const sx = e.x - o.x, sy = e.y - o.y, sd = Math.hypot(sx, sy); if (sd < 0.8 && sd > 0.001) { U.Grid.mover(E.mapa, e, sx / sd * dt * 1.5, sy / sd * dt * 1.5); } } });
      // ataque con telegrafía: el enemigo elige UNA técnica de su set según la
      // distancia (no un solo ataque fijo). La telegrafía marca la forma elegida.
      const tecE = this.elegirTec(e, d);
      const enRango = tecE ? (['linea', 'proyectil', 'alterna', 'cadena'].indexOf(tecE.forma) >= 0 ? d <= (tecE.alcance || c.alcance) : d <= (tecE.alcance || c.rango) + 0.4) : (e.clase === 'chaman' ? d <= c.alcance : d <= c.rango + 0.4);
      // GATE DE ATAQUE (canvas): un enemigo SOLO puede telegrafiar/atacar si
      // está DENTRO del canvas (distAlCanvas === 0). Fuera, en tolerancia,
      // sigue existiendo y moviéndose (huye o se acerca) pero NO ataca: esto
      // cierra la XP defensiva fantasma (dañoJugador solo se alcanza desde
      // ataques enemigos). El que huye tampoco telegrafía nunca.
      if (!e.huyendo && enRango && e.cd <= 0 && this.distAlCanvas(e.x, e.y) === 0) { e.estado = 'telegrafia'; e.t = c.tele / Math.sqrt(E.dificultad); e.tecActual = tecE; const fE = tecE || c; e.tele = fE.forma === 'proyectil' ? U.Grid.forma('linea', e.x, e.y, e.dir, Math.min(3, fE.alcance || 3), 0) : U.Grid.forma(fE.forma, e.x, e.y, e.dir, fE.alcance || c.alcance, fE.radio || c.radio || 0); E.efectos.telegrafos.push({ celdas: e.tele, owner: e, t: e.t }); U.Audio.sfx(e.clase === 'brasa' ? 'fuego' : e.clase === 'chaman' ? 'viento' : 'cargando'); }
    });
    E.enemigos = E.enemigos.filter(e => e.vida > 0 || e.t < 1);
  },
  // Ataque del enemigo: ejecuta la técnica elegida de su set (e.tecActual, puesta
  // en la telegrafía). Sin set, usa el ataque fijo de su clase (compatibilidad).
  // Proyectil y cadena tienen su propia resolución; el resto usa las celdas
  // telegrafiadas. El efecto de la CLASE se suma al de la técnica (p. ej. el
  // ilusionista siempre invierte, use la técnica que use).
  ataqueEnemigo(e, c) {
    // DEFENSA EN PROFUNDIDAD (canvas): fuera del canvas el ataque NO se
    // ejecuta, aunque la telegrafía se hubiera iniciado dentro (el jugador
    // puede haber corrido y sacado al enemigo del canvas a mitad de
    // telegrafía). Los proyectiles YA en vuelo siguen su curso normal y su
    // impacto se resuelve normal (actualizarProyectiles no se toca).
    if (this.distAlCanvas(e.x, e.y) > 0) return;
    const E = U.Juego.estado, j = E.jugador; const el = U.Elementos.datos[e.elemento];
    if (e.efectos.cegado > 0) { this.texto(e, '👁 ¡FALLA! (CEGADO)', '#fff7c2', 1); U.Audio.sfx('esquiva'); return; } // cegado por Destello: ataca a ciegas y falla
    const tec = e.tecActual || this.elegirTec(e, U.Grid.dist(e, j)) || c;
    const forma = tec.forma || c.forma, alc = tec.alcance || c.alcance, rad = tec.radio || c.radio || 0;
    const base = e.stats.ataque * (tec.power || c.power || 1);
    const efecto = Object.assign({}, tec.efecto || {}, c.efecto || {});
    if (forma === 'proyectil') { this.proyectil(e, Object.assign({}, tec, { alcance: alc }), base, e.elemento, el.color, 'enemigo'); this.particulas(e.x + e.dir.x, e.y + e.dir.y - 0.5, 8, el.claro, 'chispa'); e.ataqueAnim = 0.2; return; }
    if (forma === 'cadena') { E.efectos.cadenas.push({ puntos: [{ x: e.x, y: e.y }, { x: j.x, y: j.y }], t: 0.25, max: 0.25 }); U.Audio.sfx(e.elemento); this.particulas(e.x + e.dir.x, e.y + e.dir.y - 0.5, 8, el.claro, 'chispa'); if (U.Grid.dist(e, j) <= alc) this.dañoJugador(base, e, efecto, { elemento: e.elemento, proyectil: false, ox: e.x, oy: e.y }); e.ataqueAnim = 0.2; return; }
    if (forma === 'circulo') { E.efectos.anillos.push({ x: e.x, y: e.y, radio: rad, color: el.color, t: 0.4, max: 0.4 }); this.sacudir(0.8); U.Audio.sfx('tierra'); }
    else { E.efectos.haces.push({ celdas: e.tele, color: el.color, t: 0.25, max: 0.25 }); U.Audio.sfx(forma === 'linea' ? 'viento' : e.elemento); }
    this.particulas(e.x + e.dir.x, e.y + e.dir.y - 0.5, 8, el.claro, 'chispa');
    if (e.esEscolta && E.escolta && E.escolta.activa && U.Grid.enCeldas(e.tele, E.escolta.npc)) { U.Juego.escoltaDanada(E.escolta.npc, Math.max(1, Math.round(U.Estadisticas.formulaDaño(base, 6)))); return; }
    if (U.Grid.enCeldas(e.tele, j)) { const esFisico = forma === 'cono' || forma === 'circulo'; this.dañoJugador(base, e, efecto, { elemento: esFisico ? null : e.elemento, proyectil: false, ox: e.x, oy: e.y }); }
    e.ataqueAnim = 0.2;
  },
  actualizarProyectiles(dt) {
    const E = U.Juego.estado, j = E.jugador;
    E.proyectiles.forEach(p => {
      p.vida -= dt; p.x += p.dx * p.vel * dt; p.y += p.dy * p.vel * dt;
      if (Math.random() < dt * 30) this.particulas(p.x, p.y - 0.5, 1, p.color, p.cometa ? 'chispa' : 'polvo');
      const estallar = () => { let hit = null; if (p.explora) { const celdas = U.Grid.forma('circulo', p.x, p.y, { x: 1, y: 0 }, 0, p.explora.radio); E.efectos.haces.push({ celdas, color: p.color, t: 0.3, max: 0.3 }); E.efectos.anillos.push({ x: p.x, y: p.y, radio: p.explora.radio, color: p.color, t: 0.4, max: 0.4 }); this.sacudir(0.6); if (U.Audio && typeof U.Audio.sfxCerca === 'function') U.Audio.sfxCerca(p.elemento || 'yang', p.x, p.y, 2); else U.Audio.sfx(p.elemento || 'yang'); if (p.dueño === 'jugador') { let ds = 0.5, n = 0; this.vivos().forEach(e => { if (U.Grid.enCeldas(celdas, e)) { ds = Math.max(ds, this.desafio(e)); n++; this.dañoEnemigo(e, p.base * (p.explora.power / 1.4), p.elemento, Object.assign({ desafio: this.desafio(e), alcance: p.alcance, dist: (p.ox != null ? Math.hypot(e.x - p.ox, e.y - p.oy) : null) }, p.efecto || {})); } }); if (n) hit = { enemigo: true, desafio: ds }; } else if (U.Grid.enCeldas(celdas, j)) this.dañoJugador(p.base, null, p.efecto, { elemento: p.elemento || null, proyectil: true, ox: p.x - p.dx, oy: p.y - p.dy }); } p.vida = 0; return hit; };
      if (U.Grid.solidoEn(E.mapa, p.x, p.y)) { let mundo = false; if (p.dueño === 'jugador') mundo = this.golpearObjetoEn(p.x, p.y, p.base * 0.9); const exp = estallar(); if (p.dueño === 'jugador' && p.xpTec) { p.xpTec = false; if (exp && exp.enemigo) this.otorgarXpTecnica(p.elemento, 'enemigo', exp.desafio); else if (mundo) this.otorgarXpTecnica(p.elemento, 'mundo', 1); } if (p.dueño === 'jugador' && p.xpYang) { p.xpYang = false; if (exp && exp.enemigo) this.otorgarXpYang('enemigo'); else if (mundo) this.otorgarXpYang('mundo'); } return; }
      if (p.dueño === 'jugador') { for (const e of this.vivos()) { if (p.golpeados.indexOf(e) >= 0) continue; if (Math.hypot(e.x - p.x, e.y - p.y) < 0.65) { p.golpeados.push(e); this.dañoEnemigo(e, p.base, p.elemento, Object.assign({ desafio: this.desafio(e), alcance: p.alcance, dist: (p.ox != null ? Math.hypot(e.x - p.ox, e.y - p.oy) : null) }, p.efecto || {})); if (p.xpTec) { p.xpTec = false; this.otorgarXpTecnica(p.elemento, 'enemigo', this.desafio(e)); } if (p.xpYang) { p.xpYang = false; this.otorgarXpYang('enemigo'); } if (p.explora) estallar(); else if (!p.cometa) p.vida = 0; else { /* la onda perfora y empuja */ } break; } }
        if (p.vida > 0 && U.Criaturas && E.criaturas) { for (const c of E.criaturas) { if (c.vida <= 0 || c.invocada || p.golpeados.indexOf(c) >= 0) continue; if (Math.hypot(c.x - p.x, c.y - p.y) < 0.65) { p.golpeados.push(c); U.Criaturas.danar(c, p.base, p.elemento, {}); if (p.xpTec) { p.xpTec = false; this.otorgarXpTecnica(p.elemento, 'enemigo', 0.5); } if (p.xpYang) { p.xpYang = false; this.otorgarXpYang('enemigo'); } if (!p.cometa) p.vida = 0; break; } } } }
      else if (Math.hypot(j.x - p.x, j.y - p.y) < 0.65) { this.dañoJugador(p.base, null, p.efecto, { elemento: p.elemento || null, proyectil: true, ox: p.x - p.dx, oy: p.y - p.dy }); estallar(); }
    });
    E.proyectiles = E.proyectiles.filter(p => p.vida > 0);
  },
  actualizarEfectos(dt) {
    const F = U.Juego.estado.efectos;
    F.particulas.forEach(p => { p.vida -= dt; p.x += p.dx * dt; p.y += p.dy * dt; p.dy += p.grav * dt; p.dx *= 0.98; }); F.particulas = F.particulas.filter(p => p.vida > 0);
    F.textos.forEach(t => { t.vida -= dt; }); F.textos = F.textos.filter(t => t.vida > 0);
    ['haces', 'anillos', 'cadenas', 'cortes', 'telegrafos'].forEach(k => { F[k].forEach(h => { if (h.t != null && k !== 'telegrafos') h.t -= dt; }); F[k] = F[k].filter(h => k === 'telegrafos' ? this.vivos().indexOf(h.owner) >= 0 : h.t > 0); });
  },

  // ---------- arena por oleadas ----------
  iniciarArena() {
    const E = U.Juego.estado, j = E.jugador; if (E.arena.activa) return;
    if (U.Economia.permisoVigente()) { j.permisoUsos = (j.permisoUsos || 0) + 1; U.HUD.toast('Entrada a la arena cubierta por tu permiso de viajero.', 'exito'); }
    else if ((j.monedas || 0) >= 10) { j.monedas -= 10; U.HUD.toast('Entrada a la arena: −10 🪙. Solo cobras si completas TODA la ronda: 50 🪙.', 'aviso'); }
    else { U.HUD.toast('La arena cuesta 10 🪙 de entrada y tienes ' + Math.floor(j.monedas || 0) + '. Sin monedas no hay ronda: gana con misiones del tablón.', 'peligro'); U.Audio.sfx('fail'); return; }
    E.arena = { activa: true, ronda: E.arena.ronda || 1, oleada: 1, total: 3, entre: 0, spawned: false, cuenta: 0 };
    E.resumen = { daño: 0, recibido: 0, golpes: 0, tecnicas: 0, yang: 0, bajas: 0, esquives: 0, dashes: 0, crecimiento: {}, maestria: {} };
    j.descansando = false; U.Audio.musica('arena'); U.Audio.sfx('oleada'); U.HUD.banner('RONDA ' + E.arena.ronda + ' · OLEADA 1', 1.8); U.HUD.toast('Sobrevive 3 oleadas. Sal del círculo para abandonar.', '');
    this.spawnOleada(); E.objetivos[2].estado = 'actual';
  },
  spawnOleada() {
    const E = U.Juego.estado, A = E.arena; const def = this.OLEADAS[Math.min(2, A.oleada - 1)]; const mult = E.dificultad * (1 + 0.2 * (A.ronda - 1));
    const lista = def.slice(); if (A.ronda > 1 && A.oleada < 3) lista.push(A.ronda % 2 ? 'brasa' : 'chaman'); if (A.ronda > 2 && A.oleada === 3) lista.push('veterano');
    const puntos = E.mapa.spawns.slice().sort(() => Math.random() - 0.5);
    lista.forEach((clase, i) => { const p = puntos[i % puntos.length]; const e = this.crearEnemigo(clase, p[0] + 0.5 + (Math.random() - 0.5) * 0.6, p[1] + 0.5 + (Math.random() - 0.5) * 0.6, mult); e.esArena = true; E.enemigos.push(e); this.particulas(e.x, e.y - 0.5, 12, U.Elementos.color(e.elemento), 'humo'); });
    A.spawned = true; A.entre = 0; U.Audio.sfx('oleada');
  },
  actualizarArena(dt) {
    const E = U.Juego.estado, A = E.arena, j = E.jugador; if (!A.activa) return;
    if (U.Grid.dist(j, { x: E.mapa.arena.x + 0.5, y: E.mapa.arena.y + 0.5 }) > E.mapa.arena.r + 2.5) { this.cancelarArena('Saliste de la arena. La ronda queda pendiente.'); return; }
    const vivos = this.vivos().filter(e => e.esArena).length; // solo cuentan los DE LA ARENA: un enemigo del mundo (perseguidor, bandido) fuera del círculo no bloquea el avance de oleada
    if (A.entre > 0) { A.entre -= dt; A.cuenta += dt; if (A.cuenta >= 1) { A.cuenta = 0; if (A.entre > 0.5) U.HUD.banner('OLEADA ' + A.oleada + ' EN ' + Math.ceil(A.entre), 0.9); } if (A.entre <= 0) this.spawnOleada(); return; }
    if (A.spawned && vivos === 0) {
      if (A.oleada >= A.total) { A.activa = false; const premioArena = 50; E.jugador.monedas = (E.jugador.monedas || 0) + premioArena; E.flags.ultimoPremio = premioArena; E.flags.victoria = true; E.objetivos[2].estado = 'hecho'; U.Audio.musica('aldea'); U.Audio.sfx('victoria'); U.HUD.toast('Ronda completa: +50 🪙. (Nada por oleada: solo se cobra al terminar toda la ronda.)', 'exito'); U.Juego.fin('victoria'); }
      else { A.oleada++; A.spawned = false; A.entre = 4; A.cuenta = 0; U.HUD.toast('Oleada ' + (A.oleada - 1) + ' superada. Respira: sin enemigos la Esencia se recarga más rápido… pero sigues en la arena.', 'exito'); U.Recuperacion.restaurar(j.stats.esencia * 0.15); }
    }
  },
  cancelarArena(msg) { const E = U.Juego.estado; E.arena.activa = false; E.enemigos = E.enemigos.filter(e => !e.esArena); E.proyectiles = []; E.efectos.telegrafos = []; U.Audio.musica('aldea'); if (msg) U.HUD.toast(msg, 'aviso'); },
  limpiar() { const E = U.Juego.estado; E.enemigos = []; E.proyectiles = []; E.orbes = []; E.efectos = { particulas: [], textos: [], haces: [], anillos: [], cadenas: [], cortes: [], telegrafos: [] }; E.arena.activa = false; },

  // ---------- TORNEO DE BRUMA: octavos → cuartos → semifinal → final (1 contra 1) ----------
  TORNEO: [
    { fase: 'OCTAVOS DE FINAL', nombre: 'Bruno el Leñador', clase: 'bandido', mult: 0.9 },
    { fase: 'CUARTOS DE FINAL', nombre: 'Sibila del Viento', clase: 'chaman', mult: 1.05 },
    { fase: 'SEMIFINAL', nombre: 'Corazón de Brasa', clase: 'brasa', mult: 1.2 },
    { fase: 'FINAL', nombre: 'El Campeón Velado', clase: 'veterano', mult: 1.45 }
  ],
  iniciarTorneo() {
    const E = U.Juego.estado, j = E.jugador; if (E.torneo || E.arena.activa || E.reto) { U.HUD.toast('Ya hay un combate organizado en curso.', 'aviso'); return; }
    if ((j.monedas || 0) < 50) { U.HUD.toast('El torneo cuesta 50 🪙 de entrada (el permiso NO lo cubre) y tienes ' + Math.floor(j.monedas || 0) + '. Solo cobra el podio: 1º 300 · 2º 150 · 3º 80.', 'peligro'); U.Audio.sfx('fail'); return; }
    j.monedas -= 50; U.HUD.toast('Entrada al torneo: −50 🪙. Nada por ronda: solo cobra el podio (300 / 150 / 80).', 'aviso');
    if (U.Grid.dist(j, { x: E.mapa.arena.x + 0.5, y: E.mapa.arena.y + 0.5 }) > E.mapa.arena.r + 3 && E.mapaId !== 'aldea') { /* se puede inscribir desde Kaelen/Aldric y pelear en la arena */ }
    E.torneo = { idx: 0, entre: 2.5, spawned: false, activo: true, fase: 'bracket' };
    j.vida = j.stats.vida; j.esencia = U.Reliquias ? U.Reliquias.esenciaMax(j) : j.stats.esencia; j.agotado = false; j.escudo = false; j.cansancio = U.Recuperacion.condicionMax(j); j.gastoFatiga = 0;
    U.HUD.banner('🏆 TORNEO DE BRUMA · OCTAVOS DE FINAL', 2.4); U.Audio.sfx('oleada'); U.Audio.musica('arena');
    U.HUD.toast('Torneo: octavos, cuartos, semifinal y final, 1 contra 1. Entre rondas te recuperas AL COMPLETO. Solo cobra el podio: 1º 300 🪙 · 2º 150 · 3º 80 (los que pierden la semifinal juegan por el 3º lugar). Ve a la Arena de Ecos (sureste) para pelear.', 'exito');
  },
  TORNEO_TERCERO: { fase: 'PARTIDO POR EL 3º LUGAR', nombre: 'El Otro Semifinalista', clase: 'chaman', mult: 1.15 },
  spawnTorneo() {
    const E = U.Juego.estado, T = E.torneo; if (!T) return; const def = T.fase === 'tercero' ? this.TORNEO_TERCERO : this.TORNEO[T.idx]; if (!def) return;
    // IDEA 1: la FINAL del torneo ES Ren, el Vendaval (su duelo de torneo).
    if (T.fase !== 'tercero' && T.idx === 3 && U.Rival) { U.Rival.iniciarDueloTorneo(); return; }
    const j = E.jugador; const cx = E.mapaId === 'aldea' ? E.mapa.arena.x + 0.5 : j.x + 3, cy = E.mapaId === 'aldea' ? E.mapa.arena.y + 0.5 : j.y;
    const e = this.crearEnemigo(def.clase, cx + 2.5, cy, def.mult * E.dificultad); e.nombre = def.nombre; e.esTorneo = true; E.enemigos.push(e); T.spawned = true;
    this.particulas(e.x, e.y - 0.5, 18, '#ffe14d', 'humo'); U.HUD.banner('🏆 ' + def.fase + ' · ' + def.nombre.toUpperCase(), 2); U.Audio.sfx('oleada');
  },
  actualizarTorneo(dt) {
    const E = U.Juego.estado, T = E.torneo; if (!T || !T.activo) return; const j = E.jugador;
    if (T.entre > 0) { T.entre -= dt; if (T.entre <= 0) this.spawnTorneo(); return; }
    if (T.spawned && this.vivos().filter(e => e.esTorneo).length === 0) {
      T.spawned = false;
      j.vida = j.stats.vida; j.esencia = U.Reliquias ? U.Reliquias.esenciaMax(j) : j.stats.esencia; j.agotado = false; j.cansancio = U.Recuperacion.condicionMax(j); j.gastoFatiga = 0; // recuperación total entre rondas (también la Condición, al 100% de su máximo)
      if (T.fase === 'tercero') { E.torneo = null; j.monedas = (j.monedas || 0) + 80; U.HUD.banner('🥉 ¡TERCER LUGAR DEL TORNEO! · +80 🪙', 3); U.Audio.sfx('victoria'); U.Audio.musica('aldea'); U.HUD.toast('Tercer lugar: cobras 80 🪙 (neto +30 tras la entrada de 50).', 'exito'); return; }
      T.idx++;
      if (T.idx >= this.TORNEO.length) { E.torneo = null; E.historial.torneos = (E.historial.torneos || 0) + 1; j.monedas = (j.monedas || 0) + 300; U.HUD.banner('🏆 ¡CAMPEÓN DEL TORNEO DE BRUMA! · +300 🪙', 3); U.Audio.sfx('victoria'); U.Audio.musica('aldea'); U.HUD.toast('Campeón: 300 🪙 (neto +250 tras la entrada). Nada por ronda: solo cobró el podio.', 'exito'); }
      else { T.entre = 3; U.HUD.banner('✅ RONDA SUPERADA · TE RECUPERAS AL 100% · SIGUE: ' + this.TORNEO[T.idx].fase, 2.2); U.Audio.sfx('cura'); this.particulas(j.x, j.y - 1, 16, '#67e08a', 'cura'); }
    }
  },
  // Derrota en el torneo: la colocación manda. Semifinal → partido por el 3º lugar; final → 2º (150); antes → 0.
  derrotaTorneo() {
    const E = U.Juego.estado, T = E.torneo, j = E.jugador; if (!T) return false;
    E.enemigos = E.enemigos.filter(e => !e.esTorneo); E.proyectiles = []; U.Audio.musica('aldea');
    if (T.fase !== 'tercero' && T.idx === 2) { T.fase = 'tercero'; T.spawned = false; T.entre = 3; j.vida = j.stats.vida; j.esencia = U.Reliquias ? U.Reliquias.esenciaMax(j) : j.stats.esencia; j.agotado = false; j.escudo = false; j.cansancio = U.Recuperacion.condicionMax(j); U.HUD.banner('🏆 PERDISTE LA SEMIFINAL · JUEGAS POR EL 3º LUGAR (80 🪙)', 2.6); U.Audio.sfx('cura'); return true; }
    let premio = 0, txt = '';
    if (T.fase === 'tercero') { txt = 'Cuarto lugar: no cobras nada (la entrada de 50 se perdió).'; }
    else if (T.idx >= 3) { premio = 150; txt = 'Segundo lugar: cobras 150 🪙 (neto +100 tras la entrada).'; }
    else { txt = 'Eliminado antes del podio: no cobras nada (la entrada de 50 se perdió).'; }
    E.torneo = null;
    if (premio) j.monedas = (j.monedas || 0) + premio;
    U.HUD.banner(premio ? '🥈 ¡SEGUNDO LUGAR! · +150 🪙' : '🏆 TORNEO TERMINADO SIN PODIO', 2.6); U.Audio.sfx(premio ? 'victoria' : 'derrota');
    setTimeout(() => U.HUD.toast(txt, premio ? 'exito' : 'aviso'), 300);
    U.Juego.despertar();
    return true;
  },
  cancelarTorneo() { const E = U.Juego.estado; if (E.torneo) { E.enemigos = E.enemigos.filter(e => !e.esTorneo); E.torneo = null; } },
  // HECHIZO DE INVERSIÓN del jugador (se aprende en el obelisco de la Montaña, tecla V):
  // los enemigos cercanos caminan y se orientan al revés unos segundos. Cuesta Esencia.
  hechizoInversion() {
    const E = U.Juego.estado, j = E.jugador;
    if (!E.flags.hechizoInversion) { U.HUD.toast('Aún no conoces el Hechizo de Inversión: el obelisco de la cima de la Montaña Brumosa lo enseña.', 'aviso'); U.Audio.sfx('fail'); return; }
    if (!U.Recuperacion.gastar(12)) return;
    let n = 0; this.vivos().forEach(e => { if (U.Grid.dist(e, j) <= 6) { e.efectos.invertido = (j.reliquias && j.reliquias.puesta === 'mente') ? 9 : 6; e.efectos.invMapa = U.Inversion ? U.Inversion.generar() : null; n++; this.texto(e, '🌀 INVERTIDO', '#e8a2e0', 1); } });
    E.efectos.anillos.push({ x: j.x, y: j.y, radio: 6, color: '#e05bd0', t: 0.5, max: 0.5 }); this.particulas(j.x, j.y - 0.6, 22, '#e05bd0', 'chispa'); U.Audio.sfx('viento'); this.sacudir(0.4);
    U.Crecimiento.stat('mente', 0.1, 1); U.Crecimiento.estilo('yang', 0.1, 1);
    U.HUD.toast(n ? 'Inversión lanzada: ' + n + ' enemigo(s) con el movimiento remapeado al azar ' + ((j.reliquias && j.reliquias.puesta === 'mente') ? 9 : 6) + ' s (ninguna dirección queda igual).' : 'Inversión lanzada, pero no había enemigos cerca.', n ? 'exito' : 'aviso');
  },
  // RETOS DE COMBATE de los guías: un duelo con tiempo límite junto al guía que lo propone.
  iniciarReto(guia) {
    const E = U.Juego.estado, j = E.jugador; if (E.reto || E.arena.activa) return;
    const defs = { kaelen: { nombre: 'Reto de Kaelen · El muro', clases: ['veterano'], t: 60, mult: 1.05 }, torin: { nombre: 'Reto de Torin · Puño y brasa', clases: ['bandido', 'brasa'], t: 60, mult: 1.0 }, taro: { nombre: 'Reto de Taro · El aprendiz', clases: ['bandido'], t: 60, mult: 0.95 } };
    const d = defs[guia] || defs.kaelen;
    E.reto = { guia, nombre: d.nombre, t: d.t, total: d.t };
    d.clases.forEach((cl, i) => { const a = (i / Math.max(1, d.clases.length)) * Math.PI * 2 + 0.6; const e = this.crearEnemigo(cl, j.x + Math.cos(a) * 3, j.y + Math.sin(a) * 3, d.mult * E.dificultad); e.esReto = true; E.enemigos.push(e); this.particulas(e.x, e.y - 0.5, 14, '#e05bd0', 'humo'); });
    U.HUD.banner('⚔ ' + d.nombre.toUpperCase(), 2); U.Audio.sfx('oleada'); U.Audio.musica('arena');
  },
  actualizarReto(dt) {
    const E = U.Juego.estado; if (!E.reto) return;
    E.reto.t -= dt;
    const quedan = this.vivos().filter(e => e.esReto).length;
    if (quedan === 0) { const guia = E.reto.guia; E.reto = null; E.historial.retos++; const j = E.jugador; if ((j.bolsaPociones || []).length < 3) { j.bolsaPociones.push({ tipo: 'vida', unidades: 50, precio: 0 }); U.Recuperacion.sincronizar(j); } U.Crecimiento.stat('ataque', 0.4, 1); U.Crecimiento.stat('defensa', 0.3, 1); U.HUD.banner('🏆 ¡RETO SUPERADO! · +1 POCIÓN', 2.2); U.Audio.sfx('victoria'); if (!E.arena.activa) U.Audio.musica(E.mapaId === 'bosque' ? 'bosque' : 'aldea'); const n = E.npcs.find(x => x.id === guia); if (n) { U.Emociones.evento(n, { realidad: 88, energia: 18, etiqueta: 'reto superado' }); n.hechos.push('superaste su reto de combate'); } return; }
    if (E.reto.t <= 0) { E.enemigos.forEach(e => { if (e.esReto) e.vida = 0; }); E.reto = null; U.HUD.banner('RETO ACABADO · SE TE ACABÓ EL TIEMPO', 1.8); U.Audio.sfx('derrota'); if (!E.arena.activa) U.Audio.musica('aldea'); }
  },
  actualizar(dt, dtM) {
    const E = U.Juego.estado, j = E.jugador;
    if (dtM == null) dtM = dt; // compatibilidad: sin escala, el mundo corre a tiempo real
    if (j.escudo) { // Drenaje del escudo: base 9/s × ambiente × clima de SU elemento (en decimales:
      // con el clima a favor drena poquito a poquito). También cuenta como gasto para la Condición.
      const tipoE = this.escudoTipo(j); const fE = tipoE === 'yang' ? { m: 1, flat: null } : U.Ambiente.factorNumerico(tipoE, E.zonaActual, j.atributo);
      const dren = fE.flat != null ? Math.min(9, fE.flat) : 9 * fE.m * (fE.atrib || 1);
      j.esencia -= dren * dt; U.Recuperacion.registrarGasto(dren * dt);
      if (j.esencia <= 0) { j.esencia = 0; j.escudo = false; j.agotado = true; U.HUD.toast('Escudo caído: te quedaste sin Esencia y estás Agotado.', 'peligro'); U.Audio.sfx('fail'); } else if (Math.random() < dt * 8) this.particulas(j.x, j.y - 0.8, 1, this.escudoColor(j), 'chispa'); }
    if (this.actualizarTorneo) this.actualizarTorneo(dt);
    j.cdYin = Math.max(0, j.cdYin - dt); j.cdYang = Math.max(0, j.cdYang - dt); j.cdBasico = Math.max(0, (j.cdBasico || 0) - dt); for (const k in j.cdTec) j.cdTec[k] = Math.max(0, j.cdTec[k] - dt);
    j.dash.cd = Math.max(0, j.dash.cd - dt); j.invuln = Math.max(0, j.invuln - dt); j.flash = Math.max(0, j.flash - dt); j.ataqueAnim = Math.max(0, j.ataqueAnim - dt);
    if (j.cargando) { j.carga = Math.min(1.2, j.carga + dt); if (Math.random() < dt * 12) this.particulas(j.x + (Math.random() - 0.5) * 1.2, j.y - 0.6 + (Math.random() - 0.5), 1, U.Elementos.datos[j.elementoActivo].claro, 'cura'); }
    if (j.dash.t > 0) { j.dash.t -= dt; U.Grid.mover(E.mapa, j, j.dash.dx * dt, j.dash.dy * dt); j.rastro.push({ x: j.x, y: j.y, t: 0.5 }); this.golpeDash(); }
    j.rastro.forEach(r => r.t -= dt); j.rastro = j.rastro.filter(r => r.t > 0);
    if (j.buffs.sobrecarga > 0) { // SOBRECARGA (interruptor, sin duración): drena SOLO Esencia a drain×máx./s.
      // Al llegar la Esencia a 0, el drenaje pasa a VIDA a la MISMA tasa (el costo/s no cambia, cambia la fuente)
      // y quedas Agotado: las técnicas (gastar) quedan bloqueadas y solo el puño Yin funciona (ver yin()).
      // Si la Vida llega a 0, es derrota normal: despiertas en la fogata. Se apaga solo con el botón (X).
      const sS = U.Habilidades.yin.sobrecarga;
      if (Math.random() < dt * 10) this.particulas(j.x, j.y - 0.8, 1, '#ff5470', 'brasa');
      if (j.esencia > 0) { const dS = Math.min(j.esencia, j.stats.esencia * sS.drain * dt); j.esencia -= dS; U.Recuperacion.registrarGasto(dS);
        if (j.esencia <= 0.01) { j.esencia = 0; if (!j.agotado) { j.agotado = true; U.HUD.toast('Sobrecarga: Esencia agotada — ahora drena tu VIDA a la misma tasa (5%/s) y solo puedes GOLPEAR (puños). Las técnicas cuestan Esencia: bloqueadas. Desactívala con X cuando quieras.', 'peligro'); U.Audio.sfx('fail'); } } }
      else { j.vida -= j.stats.vida * sS.drain * dt; if (j.vida <= 0) { j.vida = 0; j.buffs.sobrecarga = 0; U.Juego.fin('derrota'); } }
    }
    // TIEMPO LENTO: drena Esencia rápido por segundo (según el nivel de Yang) y la
    // práctica lo va puliendo (el estilo Yang crece mientras está activo). Cuando la
    // Esencia se acaba, el mundo vuelve a velocidad normal.
    if (j.tiempoLento) { const dren = this.drenoTiempoLento(j.estilos.yang || 0); j.esencia -= dren * dt; U.Recuperacion.registrarGasto(dren * dt); U.Crecimiento.estilo('yang', 0.12 * dt, 1); if (j.esencia <= 0) { j.esencia = 0; j.tiempoLento = false; j.agotado = true; U.HUD.toast('Sin Esencia: el mundo vuelve a su velocidad.', 'peligro'); U.HUD.refrescarEquipo(); } }
    // RESISTENCIA DE ACERO: dreno pequeño (2/s) mientras está activa.
    if (j.acero) { const drenA = U.Habilidades.yin.acero.drain; j.esencia -= drenA * dt; U.Recuperacion.registrarGasto(drenA * dt); if (j.esencia <= 0) { j.esencia = 0; j.acero = false; j.agotado = true; U.HUD.toast('Sin Esencia: tu Resistencia de Acero se suelta.', 'peligro'); U.HUD.refrescarEquipo(); } }
    j.buffs.sobrecargaCd = Math.max(0, j.buffs.sobrecargaCd - dt);
    if (j.invertido > 0) { j.invertido = Math.max(0, j.invertido - dt); if (j.invertido === 0) { j.invMapa = null; j.invTotal = 0; U.HUD.toast('Tus controles vuelven a la normalidad.', 'exito'); } }
    this.actualizarReto(dt);
    if (j.dot) { j.dot.t -= dt; j.dot.tick += dt; if (j.dot.tick >= 0.5) { j.dot.tick = 0; const d = Math.max(1, Math.round(j.dot.dmg * (j.acero ? U.Habilidades.yin.acero.reduccion : 1))); j.vida -= d; this.texto(j, '-' + d, '#ff7a2f', 1); if (j.vida <= 0) { j.vida = 0; U.Juego.fin('derrota'); } } if (j.dot.t <= 0) j.dot = null; }
    const vivosN = this.vivos(); E.enCombate = (vivosN.length > 0 && (E.arena.activa || vivosN.some(e => U.Grid.dist(e, j) < 11))) || (U.Criaturas ? U.Criaturas.hayHostilCerca(j, 6) : false);
    this.actualizarEnemigos(dtM); this.actualizarProyectiles(dtM); this.actualizarEfectos(dtM); this.actualizarArena(dt); // enemigos/proyectiles/efectos van a la escala del mundo (Tiempo Lento); la arena es un temporizador de evento (tiempo real)
    // orbes de esencia
    E.orbes.forEach(o => { o.t -= dtM; if (U.Grid.dist(o, j) < 0.9) { o.t = 0; U.Recuperacion.restaurar(10); this.texto(j, '+10 ESE', '#4da3ff', 1); U.Audio.sfx('orb'); this.particulas(o.x, o.y - 0.5, 6, '#4da3ff', 'cura'); } }); E.orbes = E.orbes.filter(o => o.t > 0);
    if (U.Banter) U.Banter.actualizar(dt); // banter de combate: dt real (el Tiempo Lento no ralentiza sus temporizadores)
  }
};
