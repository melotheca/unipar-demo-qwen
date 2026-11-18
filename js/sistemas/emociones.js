/* === js/sistemas/emociones.js === */
/* Unipar — motor de emociones de NPC: UNA emoción visible (cara+tono), VARIOS estados 0-100 por dentro. Motor invisible, razón visible. */
window.U = window.U || {};

U.Emociones = {
  // Los 8 NPC del diseño; este juego completo instancia Kaelen, Sora y Torin.
  catalogo: {
    kaelen: { nombre: 'Kaelen', rol: 'Guardia de la aldea' }, sora: { nombre: 'Sora', rol: 'Curandera del pozo' }, torin: { nombre: 'Torin', rol: 'Herrero y Guía de Yin' },
    marisol: { nombre: 'Marisol', rol: 'Tendera de Bruma' }, breno: { nombre: 'Breno', rol: 'Leñador' }, elena: { nombre: 'Elena', rol: 'Granjera' }, marco: { nombre: 'Marco', rol: 'Explorador' }, pipo: { nombre: 'Pipo', rol: 'Niño de la plaza' }, aldric: { nombre: 'Aldric', rol: 'Guardián de Bruma (líder de la aldea)' }, lia: { nombre: 'Lía', rol: 'Secretaria del Guardián · misiones' },
    lyra: { nombre: 'Lyra', rol: 'Próximamente' }, varek: { nombre: 'Varek', rol: 'Herrero de Aldea Ceniza Viva' }, nami: { nombre: 'Nami', rol: 'Pescadora de Puerto Brisa Azul' }, orin: { nombre: 'Orin', rol: 'Guardián de la orilla del Lago Brisa Azul' }, zara: { nombre: 'Zara', rol: 'Guardiana de las Brasas de Ceniza Viva' },
    vera: { nombre: 'Vera', rol: 'Investigadora de la Metrópolis' }, bram: { nombre: 'Bram', rol: 'Dominador de Tierra… o lo era' }, dario: { nombre: 'Dario', rol: 'Viajero de guante negro' }, sana: { nombre: 'Sana', rol: 'Cazadora de criaturas raras' }, milo: { nombre: 'Milo', rol: 'Corredor de encargos de la Metrópolis' }, petra: { nombre: 'Petra', rol: 'Anticuaria de Arcana' },
    ines: { nombre: 'Inés', rol: 'Panadera de Bruma' }, ramiro: { nombre: 'Ramiro', rol: 'Carpintero de Bruma' }, carmen: { nombre: 'Carmen', rol: 'Tejedora de Bruma' }, felipe: { nombre: 'Felipe', rol: 'Granjero de Bruma' }, lucia: { nombre: 'Lucía', rol: 'Herbolaria de Bruma' }, tomas: { nombre: 'Tomás', rol: 'Aprendiz de guardia de Bruma' },
    elvira: { nombre: 'Elvira', rol: 'Herbolaria de la Metrópolis' }, rodrigo: { nombre: 'Rodrigo', rol: 'Herrero de la Metrópolis' }, camila: { nombre: 'Camila', rol: 'Sastre de la Metrópolis' }, andres: { nombre: 'Andrés', rol: 'Panadero de la Metrópolis' }, valeria: { nombre: 'Valeria', rol: 'Maestra de la academia' }, jorge: { nombre: 'Jorge', rol: 'Guardia de la puerta oeste' }, sofia: { nombre: 'Sofía', rol: 'Trovadora de la Metrópolis' }, diego: { nombre: 'Diego', rol: 'Comerciante de especias' }, paola: { nombre: 'Paola', rol: 'Alquimista de la Metrópolis' },
    ariel: { nombre: 'Ariel', rol: 'Vigía de Vuelo Alto' }, nora: { nombre: 'Nora', rol: 'Tejedora de Vuelo Alto' },
    ivan: { nombre: 'Iván', rol: 'Herrero de Chispa Alta' }, lena: { nombre: 'Lena', rol: 'Cantante de Chispa Alta' },
    omar: { nombre: 'Omar', rol: 'Pescador de Puerto Brisa Azul' }, rosa: { nombre: 'Rosa', rol: 'Cocinera de Puerto Brisa Azul' },
    hugo: { nombre: 'Hugo', rol: 'Carbonero de Ceniza Viva' }, emma: { nombre: 'Emma', rol: 'Alfarera de Ceniza Viva' },
    pablo: { nombre: 'Pablo', rol: 'Cantero de Raíz de Piedra' }, ana: { nombre: 'Ana', rol: 'Herbolaria de Raíz de Piedra' },
    esteban: { nombre: 'Esteban', rol: 'Bibliotecario de Arcana' }, miriam: { nombre: 'Miriam', rol: 'Astróloga de Arcana' }, vesper: { nombre: 'Vesper', rol: 'Maestro hechicero de Arcana' }
  },
  tonos: {
    alegre: { color: '#ffe14d', suf: '!', vel: 34 }, sereno: { color: '#7ef0c0', suf: '.', vel: 28 }, neutral: { color: '#9fb3d9', suf: '.', vel: 30 },
    triste: { color: '#35c6f4', suf: '…', vel: 18 }, enojado: { color: '#ff5470', suf: '.', vel: 40 }, asustado: { color: '#e05bd0', suf: '…!', vel: 44 }
  },
  crear(id, rng, pos) {
    const c = this.catalogo[id]; const confBase = 35 + Math.round(rng() * 30);
    return { id, nombre: c.nombre, rol: c.rol, x: pos.x, y: pos.y, home: { x: pos.x, y: pos.y }, dir: { x: 0, y: 1 }, anim: 0, moviendo: false, fase: rng() * 6,
      casaPos: ({ kaelen: { x: 144.5, y: 242.5 }, sora: { x: 152.5, y: 241.5 }, torin: { x: 144.5, y: 252.5 }, marisol: { x: 155.5, y: 259.5 }, breno: { x: 159.5, y: 242.5 }, elena: { x: 140.5, y: 261.5 }, marco: { x: 161.5, y: 253.5 }, pipo: { x: 144.5, y: 252.5 } })[id] || { x: pos.x, y: pos.y }, enCasa: false,
      rasgos: { perdon: 0.2 + rng() * 0.6, sensibilidad: 0.7 + rng() * 0.6, confianzaBase: confBase },
      estados: { animo: 50, energia: 30, confianza: confBase, expectativa: 50 }, emocion: 'neutral', memoria: [], objetivo: null, tObj: 2 + rng() * 4, bumpCd: 0, stockPociones: id === 'sora' ? 2 : 0, entreno: false, saludado: false, hechos: [], veces: 0, mapa: (id === 'aldric' || id === 'lia') ? 'oficina' : 'aldea', ruta: [], rutaKey: '', rutaT: 0, viaje: null, destinoActual: null, vidaSim: 100, atacando: 0, ocultoSparring: false, enCirculo: false, sparringCansado: 0, idleT: 0, microPunto: null, microT: 0 };
  },
  // error = realidad − expectativa; ánimo += error×0.7; energía += |error|×0.2 + situación×0.5; confianza gana ×0.04 / pierde ×0.2 (5:1); expectativa += error×0.3
  evento(n, ev) {
    const s = n.estados, r = n.rasgos; const error = ev.realidad - s.expectativa;
    s.animo += error * 0.7 * r.sensibilidad;
    s.energia += Math.abs(error) * 0.2 + (ev.energia || 0) * 0.5;
    const apego = 1 + (s.confianza / 100) * 0.5;
    const dConf = error > 0 ? error * 0.04 * apego : error * 0.2 * (1.2 - r.perdon * 0.5);
    s.confianza += dConf; s.expectativa += error * 0.3;
    this.clamp(s); n.emocion = this.emocion(n); n.memoria.push({ t: U.Juego.estado.tiempo, ev: ev.etiqueta || '', error });
    if (n.memoria.length > 12) n.memoria.shift();
    return { delta: dConf, emocion: n.emocion };
  },
  clamp(s) { ['animo', 'energia', 'confianza', 'expectativa'].forEach(k => { s[k] = Math.max(0, Math.min(100, s[k])); }); },
  emocion(n) {
    const s = n.estados;
    if (s.confianza < 30 && s.animo < 45) return 'enojado';
    if (s.animo < 32) return 'triste';
    if (s.energia > 75 && s.animo < 55) return 'asustado';
    if (s.animo > 62 && s.energia > 40) return 'alegre';
    if (s.animo > 55) return 'sereno';
    return 'neutral';
  },
  actualizar(n, dt, j) {
    const s = n.estados;
    s.animo += (50 - s.animo) * Math.min(1, dt * 0.08); s.energia += (30 - s.energia) * Math.min(1, dt * 0.25); s.expectativa += (50 - s.expectativa) * Math.min(1, dt * 0.03);
    s.confianza += (s.confianzaBase - s.confianza) * Math.min(1, dt * 0.01 * n.rasgos.perdon);
    n.emocion = this.emocion(n); n.bumpCd = Math.max(0, n.bumpCd - dt);
    n.atacando = Math.max(0, (n.atacando || 0) - dt);
    if (n.ocultoSparring) { n.moviendo = false; return; }
    // La VIDA DIARIA (rutinas, viajes entre mapas, casa de noche) la mueve U.Vida.
    if (U.Vida) U.Vida.mover(n, dt, j);
  }
};
