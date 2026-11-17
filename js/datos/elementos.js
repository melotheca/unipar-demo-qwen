/* === js/datos/elementos.js === */
/* Unipar — los 5 elementos y su tabla de ventajas (cada uno gana a 2 y pierde contra 2; NO es un ciclo). */
window.U = window.U || {};

U.Elementos = {
  ids: ['fuego', 'agua', 'tierra', 'viento', 'rayo'],
  datos: {
    fuego:  { nombre: 'Fuego',  color: '#ff7a2f', claro: '#ffd08a', oscuro: '#a33b12', temperamento: 'Impulsivo y directo',
      personalidad: 'Actúas antes de dudar. Lo directo te parece honesto y la espera una pérdida. Tu poder crece cuando te comprometes sin reservas: la llama no pide permiso.' },
    agua:   { nombre: 'Agua',   color: '#35c6f4', claro: '#bfefff', oscuro: '#1a6b94', temperamento: 'Calmado y adaptable',
      personalidad: 'Te adaptas sin romperte. Prefieres rodear el obstáculo a chocarlo. Tu fuerza es la constancia suave: siempre encuentras por dónde, y el tiempo trabaja para ti.' },
    tierra: { nombre: 'Tierra', color: '#d9a441', claro: '#f3d9a0', oscuro: '#7a5320', temperamento: 'Firme y constante',
      personalidad: 'No te impresiona el ruido: terminas lo que empiezas. Tu poder es acumulativo, cada golpe tuyo pesa más que el anterior. Eres el muro que no se mueve.' },
    viento: { nombre: 'Viento', color: '#7ef0c0', claro: '#dbfff0', oscuro: '#2a7f5c', temperamento: 'Libre y curioso',
      personalidad: 'Necesitas espacio y opciones abiertas. Te mueves antes de que te alcancen y aprendes tocando el mundo. Tu fuerza está en no estar donde te esperan.' },
    rayo:   { nombre: 'Rayo',   color: '#ffe14d', claro: '#fff7c2', oscuro: '#9c8410', temperamento: 'Preciso y decidido',
      personalidad: 'Ves el punto exacto y vas a él. Lo tuyo es el instante bien elegido: preciso, instantáneo, aturdidor. Un movimiento tuyo vale más que diez de otros.' }
  },
  // Tabla oficial (sección 4 del diseño)
  gana: {
    agua:   ['fuego', 'tierra'],
    fuego:  ['viento', 'rayo'],
    viento: ['tierra', 'agua'],
    tierra: ['fuego', 'rayo'],
    rayo:   ['agua', 'viento']
  },
  VENTAJA: 1.5, DESVENTAJA: 0.75,
  multiplica(a, d) {
    if (!a || !d || a === d) return 1;
    if (this.gana[a] && this.gana[a].indexOf(d) >= 0) return this.VENTAJA;
    if (this.gana[d] && this.gana[d].indexOf(a) >= 0) return this.DESVENTAJA;
    return 1;
  },
  nombre(id) { return this.datos[id] ? this.datos[id].nombre : id; },
  color(id) { return this.datos[id] ? this.datos[id].color : '#f8fafc'; },
  // Etapa de maestría (visible en el HUD)
  etapa(p) { return p >= 100 ? 'DOMINACIÓN' : p >= 70 ? 'DOMINACIÓN' : p >= 40 ? 'CONTROL' : p >= 15 ? 'MANIPULACIÓN' : 'MANEJO'; }
};
