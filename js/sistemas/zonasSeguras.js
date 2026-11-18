/* === js/sistemas/zonasSeguras.js === */
/* Unipar — ZONAS SEGURAS: cada pueblo/aldea tiene una zona segura CIRCULAR de
   ~10 casillas de radio (distancia euclidiana desde el centro del pueblo, la
   fogata de su plaza). Reglas:
   · DE DÍA dentro de la zona segura NO salen enemigos (spawn ambiental a 0).
   · DE NOCHE dentro sí salen bandidos, pocos (como los del bosque).
   · FUERA de la zona segura (zonas de transición: bosque, desierto, campos
     entre pueblos) salen MUCHOS más enemigos — ladrones/rateros — mientras
     caminas, de día y de noche.
   · Un enemigo que te persigue TE SIGUE dentro de la zona segura: cruza el
     límite contigo y no desaparece en él (nada lo borra al entrar al pueblo;
     solo la retirada al amanecer de los nocturnos sigue vigente, como antes).
   · Si un enemigo entra en el pueblo, la gente HUYE de él (los NPCs corren
     en dirección contraria hasta que el peligro se aleja).
   · Y llegan los PATRULLEROS del pueblo a ayudarte a atacar y acabar con él.
   Los patrulleros de aquí son propios (esPatrullaZona, NO esDefensor): la
   patrulla de servicio de U.Orgs sigue siendo la que responde a los
   perseguidores por máscara/artefacto, sin tocarse. */
window.U = window.U || {};

U.ZonasSeguras = {
  RADIO: 10, // casillas, euclidiano desde el centro; 'más o menos', no exacto
  // Centros = la fogata de la plaza de cada asentamiento (coordenadas del mapa
  // continuo 440×400; la fogata ocupa 1×1, su centro es x+0.5, y+0.5).
  // Bruma: fogata del submapa (16,24) + OFF aldea (134,222). Metrópolis,
  // Puerto, Ceniza, Vuelo, Chispa, Raíz y Arcana: fogata puesta en el mapa
  // continuo. Los 6 pueblitos: fogata en (cx,cy) de pueblo().
  PUEBLOS: [
    { id: 'bruma', nombre: 'Aldea de Bruma', x: 150.5, y: 246.5 },
    { id: 'metropolis', nombre: 'La Metrópolis', x: 219.5, y: 207.5 },
    { id: 'puerto', nombre: 'Puerto Brisa Azul', x: 374.5, y: 202.5 },
    { id: 'ceniza', nombre: 'Aldea Ceniza Viva', x: 325.5, y: 301.5 },
    { id: 'vuelo', nombre: 'Aldea Vuelo Alto', x: 217.5, y: 44.5 },
    { id: 'chispa', nombre: 'Aldea Chispa Alta', x: 354.5, y: 130.5 },
    { id: 'raiz', nombre: 'Aldea Raíz de Piedra', x: 148.5, y: 326.5 },
    { id: 'arcana', nombre: 'Arcana', x: 64.5, y: 158.5 },
    { id: 'altoPino', nombre: 'Pueblo Alto Pino', x: 140.5, y: 120.5 },
    { id: 'rocafirme', nombre: 'Pueblo Rocafirme', x: 252.5, y: 116.5 },
    { id: 'tresCruces', nombre: 'Pueblo Tres Cruces', x: 300.5, y: 168.5 },
    { id: 'salina', nombre: 'Pueblo Salina', x: 88.5, y: 206.5 },
    { id: 'vegaBaja', nombre: 'Pueblo Vega Baja', x: 246.5, y: 268.5 },
    { id: 'brasaChica', nombre: 'Pueblo Brasa Chica', x: 292.5, y: 262.5 }
  ],
  // Densidades del spawn ambiental (segundos entre intentos, con ±20% aleatorio).
  FUERA_INTERVALO_DIA: 30, FUERA_INTERVALO_NOCHE: 22, FUERA_MAX: 4,
  DENTRO_NOCHE_INTERVALO: 120, DENTRO_NOCHE_MAX: 2,
  HUIR_RADIO: 8, HUIR_VELOCIDAD: 2.6, // los aldeanos huyen si el intruso está a ≤8
  PATRULLA_MAX: 2, PATRULLA_VEL: 2.6, PATRULLA_CD: 1.4, PATRULLA_ALCANCE: 1.6,

  distPueblo(p, x, y) { return Math.hypot(x - p.x, y - p.y); },
  // El pueblo cuya zona segura cubre el punto (el más cercano dentro del radio).
  puebloEn(x, y) {
    let mejor = null, bd = this.RADIO + 0.0001;
    for (let i = 0; i < this.PUEBLOS.length; i++) { const p = this.PUEBLOS[i]; const d = this.distPueblo(p, x, y); if (d <= this.RADIO && d < bd) { bd = d; mejor = p; } }
    return mejor;
  },
  enZonaSegura(x, y) { return !!this.puebloEn(x, y); },
  // INTRUSO: enemigo vivo del mundo que puede entrar en un pueblo. No cuentan
  // los de la arena, torneo, reto, sparring ni los propios defensores: ni la
  // patrulla de servicio de las organizaciones (esos los lleva U.Orgs) ni los
  // patrulleros de zona de aquí.
  esIntruso(e) { return !!e && e.vida > 0 && !e.esArena && !e.esTorneo && !e.esReto && !e.esSparring && !e.esDefensor && !e.esPatrullaZona; },
  asegurarT(E) {
    if (!E.zonasSegurasT) E.zonasSegurasT = { cd: 8, cdNoche: 30, ultimoX: null, ultimoY: null, puebloId: null, avisoHuidaCd: 0 };
    const T = E.zonasSegurasT;
    if (T.cd == null) T.cd = 8; if (T.cdNoche == null) T.cdNoche = 30; if (T.avisoHuidaCd == null) T.avisoHuidaCd = 0;
    return T;
  },
  esNoche(E) { return U.Tiempo ? U.Tiempo.esNoche(U.Tiempo.hora(E)) : false; },
  // Celda libre cerca de (x,y) para aparecer sin quedar dentro de un sólido ni
  // en el agua: anillos crecientes, como U.Reliquias.celdaLibre.
  celdaLibre(m, x, y) {
    const T = U.Grid.T;
    const libre = (cx, cy) => { if (cx < 1 || cy < 1 || cx >= m.ancho - 1 || cy >= m.alto - 1) return false; if (m.tiles[cy * m.ancho + cx] === T.AGUA) return false; if (m.solidos[cy * m.ancho + cx]) return false; return true; };
    if (libre(x, y)) return { x, y };
    for (let r = 1; r <= 8; r++) for (let cy = y - r; cy <= y + r; cy++) for (let cx = x - r; cx <= x + r; cx++) if (Math.max(Math.abs(cx - x), Math.abs(cy - y)) === r && libre(cx, cy)) return { x: cx, y: cy };
    return { x, y };
  },
  aviso(txt, tipo) { if (U.HUD && U.HUD.toast) U.HUD.toast(txt, tipo || ''); },
  banner(txt, t) { if (U.HUD && U.HUD.banner) U.HUD.banner(txt, t || 2); },

  tick(dt) {
    const E = U.Juego.estado; if (!E || !E.jugador || E.mapaId !== 'aldea' || E.ui !== 'mundo' || !E.mapa) return;
    const j = E.jugador, T = this.asegurarT(E);
    const noche = this.esNoche(E);
    const pueblo = this.puebloEn(j.x, j.y);
    // Aviso al cruzar el límite (una vez por cruce, no cada cuadro).
    const pid = pueblo ? pueblo.id : null;
    if (pid !== T.puebloId) {
      if (pueblo) this.aviso('🛡 Zona segura: ' + pueblo.nombre + ' — de día no salen enemigos aquí. De noche, cuidado: salen bandidos.', 'exito');
      else if (T.puebloId) this.aviso('Sales de la zona segura: en el camino entre pueblos hay ladrones. Camina atento.', 'aviso');
      T.puebloId = pid;
    }
    this.tickSpawn(dt, E, j, T, pueblo, noche);
    this.tickPersecucion(E, pueblo);
    this.tickHuida(dt, E, T);
    this.tickPatrulleros(dt, E);
  },
  // ---------- (1)(2)(3) SPAWN AMBIENTAL: día/dentro 0 · noche/dentro pocos ·
  // fuera muchos (mientras caminas: parado no se acumula el temporizador). ----
  tickSpawn(dt, E, j, T, pueblo, noche) {
    const ocupado = (E.arena && E.arena.activa) || E.torneo || E.reto;
    if (ocupado) return;
    // ¿Camina? Solo acumulamos mientras el jugador se mueve: los ladrones
    // salen mientras caminas por la zona de transición, no por estar parado.
    const seMueve = T.ultimoX != null && Math.hypot(j.x - T.ultimoX, j.y - T.ultimoY) > 0.05;
    T.ultimoX = j.x; T.ultimoY = j.y;
    if (!seMueve) return;
    const vivosLadrones = E.enemigos.filter(e => e.vida > 0 && e.esLadron).length;
    const intervalo = (base) => base * (0.8 + Math.random() * 0.4);
    if (!pueblo) {
      // FUERA: ladrones/rateros, de día y de noche, con más densidad de noche.
      T.cd -= dt;
      if (T.cd <= 0 && vivosLadrones < this.FUERA_MAX) {
        T.cd = intervalo(noche ? this.FUERA_INTERVALO_NOCHE : this.FUERA_INTERVALO_DIA);
        this.spawnLadron(E, j, noche);
      }
    } else if (noche) {
      // DENTRO DE NOCHE: bandidos, pocos, como en el bosque.
      T.cdNoche -= dt;
      const nocturnos = E.enemigos.filter(e => e.vida > 0 && e.nocturno).length;
      if (T.cdNoche <= 0 && nocturnos < this.DENTRO_NOCHE_MAX) {
        T.cdNoche = intervalo(this.DENTRO_NOCHE_INTERVALO);
        this.spawnLadron(E, j, true, true);
      }
    } else {
      // DENTRO DE DÍA: no sale nadie. Y al salir del pueblo, el primer ladrón
      // no tarda mucho: el temporizador de fuera queda a 10 s como mucho.
      if (T.cd > 10) T.cd = 10;
    }
  },
  spawnLadron(E, j, noche, dentro) {
    const ang = Math.random() * Math.PI * 2, d = 6 + Math.random() * 3;
    const c = this.celdaLibre(E.mapa, Math.floor(j.x + Math.cos(ang) * d), Math.floor(j.y + Math.sin(ang) * d));
    let clase = 'bandido', nombre = 'Ladrón del camino';
    if (noche) { clase = Math.random() < 0.7 ? 'bandido' : 'chaman'; nombre = 'Bandido del camino'; }
    else if (Math.random() < 0.5) nombre = 'Ratero del camino';
    const e = U.Combate.crearEnemigo(clase, c.x + 0.5, c.y + 0.5, E.dificultad);
    e.nombre = nombre; e.esLadron = true;
    if (noche) e.nocturno = true; // como los del bosque: se retiran al amanecer
    E.enemigos.push(e);
    if (U.Combate.particulas) U.Combate.particulas(e.x, e.y - 0.5, 10, '#8b93a3', 'humo');
    if (dentro) { this.banner('🌙 NOCHE · UN BANDIDO ENTRA EN EL PUEBLO', 2); if (U.Audio) U.Audio.sfx('oleada'); }
    else if (noche) this.aviso('🌙 Un bandido te sale al paso en el camino.', 'peligro');
    else this.aviso('¡Un ladrón te sale al paso en el camino!', 'peligro');
    return e;
  },
  // ---------- (4) PERSECUCIÓN A TRAVÉS DEL LÍMITE ----------
  // Nada borra a un enemigo por entrar en la zona segura: aquí solo se MARCA
  // (persigueEnPueblo) para que el juego —y los tests— lo vean. Los que te
  // persiguen (esPerseguidor, esLadron que te sigue, bandidos) te siguen
  // adentro con el movimiento normal de U.Combate.actualizarEnemigos, que no
  // sabe de zonas seguras; la única retirada que existe es la de los
  // nocturnos al amanecer (gestionarBandidos, como antes).
  tickPersecucion(E, pueblo) {
    const j = E.jugador;
    let n = 0;
    E.enemigos.forEach(e => {
      if (!e || e.vida <= 0) { if (e) e.persigueEnPueblo = false; return; }
      const esCazador = e.esPerseguidor || e.esLadron || e.nocturno;
      const cerca = U.Grid.dist(e, j) < 14;
      e.persigueEnPueblo = !!(pueblo && esCazador && cerca);
      if (e.persigueEnPueblo) n++;
    });
    return n;
  },
  // ---------- (5) HUIDA DE ALDEANOS ----------
  // Si un intruso está dentro de una zona segura y a ≤8 casillas de un aldeano,
  // el aldeano huye: se le pone n.huyendo (posición de la amenaza, 1 s) y
  // U.Vida.mover lo corre en dirección contraria mientras dure. Al alejarse
  // el peligro, huyendo se agota solo y el NPC vuelve a su rutina.
  tickHuida(dt, E, T) {
    T.avisoHuidaCd = Math.max(0, (T.avisoHuidaCd || 0) - dt);
    let empezoAlguno = false;
    (E.npcs || []).forEach(n => {
      if (!n || n.enCasa || n.enEscolta || n.ocultoSparring) return;
      let amenaza = null, bd = this.HUIR_RADIO + 0.0001;
      E.enemigos.forEach(e => {
        if (!this.esIntruso(e)) return;
        if (!this.puebloEn(e.x, e.y)) return; // solo si el enemigo ENTRÓ en el pueblo
        const d = U.Grid.dist(e, n);
        if (d <= this.HUIR_RADIO && d < bd) { bd = d; amenaza = e; }
      });
      if (amenaza) {
        if (!n.huyendo) empezoAlguno = true;
        n.huyendo = { x: amenaza.x, y: amenaza.y, t: 1 };
      }
    });
    if (empezoAlguno && T.avisoHuidaCd <= 0) {
      T.avisoHuidaCd = 10;
      this.aviso('¡La gente del pueblo huye del intruso!', 'peligro');
      if (U.Audio) U.Audio.sfx('oleada');
    }
  },
  // ---------- (6) PATRULLEROS: convergen al intruso dentro del pueblo ----------
  // Patrulleros propios (esPatrullaZona, no esDefensor: no chocan con la
  // patrulla de servicio de U.Orgs). Salen de la plaza del pueblo (2 como
  // mucho: novato + patrullero), corren hacia el intruso más cercano y le
  // pegan cuerpo a cuerpo. Cuando ya no hay intrusos dentro de ningún pueblo,
  // se retiran: defienden el pueblo, no persiguen campo afuera.
  tickPatrulleros(dt, E) {
    const intrusos = E.enemigos.filter(e => this.esIntruso(e) && this.puebloEn(e.x, e.y));
    let mios = E.enemigos.filter(e => e.vida > 0 && e.esPatrullaZona);
    if (!intrusos.length) {
      if (mios.length) {
        mios.forEach(d => { if (U.Combate.particulas) U.Combate.particulas(d.x, d.y - 0.5, 8, '#7cc4ff', 'humo'); });
        E.enemigos = E.enemigos.filter(e => !e.esPatrullaZona);
        this.aviso('La patrulla se retira: ya no hay intrusos en el pueblo.');
      }
      return;
    }
    const pueblo = this.puebloEn(intrusos[0].x, intrusos[0].y);
    const rangos = ['novato', 'patrullero'];
    rangos.forEach((rango, i) => {
      if (mios.length >= this.PATRULLA_MAX) return;
      if (mios.some(d => d.rangoPatrulla === rango)) return;
      const c = this.celdaLibre(E.mapa, Math.floor(pueblo.x) + (i % 2 ? 3 : -3), Math.floor(pueblo.y) + (i < 1 ? 2 : -2));
      const e = U.Combate.crearEnemigo('veterano', c.x + 0.5, c.y + 0.5, E.dificultad * (rango === 'patrullero' ? 1.25 : 1.05));
      e.nombre = 'Patrullero · ' + rango[0].toUpperCase() + rango.slice(1) + ' de servicio';
      e.esPatrullaZona = true; e.rangoPatrulla = rango; e.esOrg = 'patrullaZona';
      E.enemigos.push(e);
      if (U.Combate.particulas) U.Combate.particulas(e.x, e.y - 0.5, 10, '#7cc4ff', 'humo');
      mios.push(e);
      this.aviso('🛡 La patrulla de ' + pueblo.nombre + ' sale a defender el pueblo: un ' + rango + ' se planta contra el intruso.', 'aviso');
    });
    mios.forEach(d => {
      // Como los defensores de U.Orgs: stun refrescado cada cuadro para que
      // actualizarEnemigos no los mueva como enemigos; los muevo yo aquí.
      d.efectos.stun = 0.5;
      let presa = null, bd = 1e9;
      intrusos.forEach(o => { const dd = U.Grid.dist(o, d); if (dd < bd) { bd = dd; presa = o; } });
      if (!presa) { d.moviendo = false; return; }
      const distP = U.Grid.dist(presa, d);
      if (distP > this.PATRULLA_ALCANCE) {
        const dx = presa.x - d.x, dy = presa.y - d.y, dd = distP || 0.001;
        U.Grid.mover(E.mapa, d, dx / dd * this.PATRULLA_VEL * dt, dy / dd * this.PATRULLA_VEL * dt);
        d.moviendo = true; d.dir = U.Grid.dir8(dx, dy);
      } else {
        d.moviendo = false; d.cd = Math.max(0, (d.cd || 0) - dt);
        if (d.cd <= 0) {
          d.cd = this.PATRULLA_CD;
          U.Combate.dañoEnemigo(presa, Math.max(4, d.stats.ataque), null, { desafio: 0.5 });
          if (U.Combate.particulas) U.Combate.particulas(presa.x, presa.y - 0.6, 6, '#7cc4ff', 'chispa');
        }
      }
    });
  }
};
