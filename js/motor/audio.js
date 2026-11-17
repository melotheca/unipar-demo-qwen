/* === js/motor/audio.js === */
/* Unipar — audio 100% sintetizado (WebAudio): SFX por acción visible, ambiente por zona y música chiptune. Sin archivos externos. */
window.U = window.U || {};

U.Audio = {
  ctx: null, master: null, silenciado: false, escena: null, ruido: null, amb: null, ambGain: null,
  nextNota: 0, paso: 0, listo: false,
  patrones: {
    test:  { bpm: 72,  bajo: [110, 0, 110, 0, 98, 0, 98, 0], mel: [440, 0, 523, 0, 659, 587, 0, 523, 0, 440, 0, 392, 0, 0, 440, 0], tipo: 'triangle', g: 0.05 },
    aldea: { bpm: 96,  bajo: [131, 0, 131, 0, 165, 0, 165, 0, 147, 0, 147, 0, 196, 0, 196, 0], mel: [523, 0, 659, 784, 0, 659, 0, 523, 587, 0, 698, 0, 784, 0, 659, 0], tipo: 'square', g: 0.035 },
    bosque: { bpm: 72, bajo: [98, 0, 0, 98, 0, 0, 87, 0, 0, 0, 110, 0, 0, 0, 0, 0], mel: [392, 0, 0, 440, 0, 0, 494, 0, 440, 0, 0, 392, 0, 330, 0, 0], tipo: 'triangle', g: 0.04 },
    arena: { bpm: 140, bajo: [98, 98, 0, 98, 117, 0, 98, 0, 87, 87, 0, 87, 117, 0, 131, 0], mel: [392, 0, 466, 392, 0, 587, 0, 523, 392, 0, 466, 0, 698, 622, 0, 587], tipo: 'sawtooth', g: 0.03 },
    // PERSECUCIÓN: tensa y rápida como la arena, pero DISTINTA: 152 bpm (más rápida),
    // onda 'square' (no sawtooth), bajo en semicorcheas ascendentes y melodía en modo
    // menor con saltos cortos; suena solo fuera de la arena, cuando un enemigo hostil
    // está cerca o te persigue. La arena (140 bpm, sawtooth) sigue siendo SOLO para
    // arena / torneo / reto.
    persecucion: { bpm: 152, bajo: [110, 110, 131, 110, 98, 98, 117, 98, 110, 110, 131, 110, 147, 131, 117, 98], mel: [523, 0, 494, 0, 523, 0, 622, 0, 587, 0, 523, 0, 466, 0, 494, 0], tipo: 'square', g: 0.035 },
    desierto: { bpm: 84, bajo: [110, 0, 0, 110, 0, 0, 98, 0, 0, 0, 87, 0, 0, 0, 0, 0], mel: [440, 0, 0, 466, 0, 440, 0, 0, 415, 0, 0, 392, 0, 0, 0, 0], tipo: 'triangle', g: 0.04 },
    montana: { bpm: 64, bajo: [87, 0, 0, 0, 110, 0, 0, 0, 98, 0, 0, 0, 131, 0, 0, 0], mel: [523, 0, 0, 0, 587, 0, 659, 0, 0, 587, 0, 523, 0, 0, 440, 0], tipo: 'sine', g: 0.045 }
  },
  init() {
    if (this.listo) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = this.silenciado ? 0 : 0.8; this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 1; this.ruido = this.ctx.createBuffer(1, len, this.ctx.sampleRate); const d = this.ruido.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      // Ambiente continuo (río/viento) whose volumen depende de la zona visible
      const src = this.ctx.createBufferSource(); src.buffer = this.ruido; src.loop = true; const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600; this.ambGain = this.ctx.createGain(); this.ambGain.gain.value = 0; src.connect(f); f.connect(this.ambGain); this.ambGain.connect(this.master); src.start(); this.amb = src;
      this.listo = true; this.nextNota = this.ctx.currentTime + 0.1;
    } catch (e) { this.listo = false; }
  },
  reanudar() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); },
  toggleSilencio() { this.silenciado = !this.silenciado; if (this.master) this.master.gain.value = this.silenciado ? 0 : 0.8; return this.silenciado; },
  tono(freq, dur, tipo, g, slide) {
    if (!this.listo || this.silenciado) return; const c = this.ctx, t = c.currentTime; const o = c.createOscillator(), gn = c.createGain();
    o.type = tipo || 'square'; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    gn.gain.setValueAtTime(g || 0.1, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(gn); gn.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  },
  burst(dur, g, freq, tipo) {
    if (!this.listo || this.silenciado) return; const c = this.ctx, t = c.currentTime; const s = c.createBufferSource(); s.buffer = this.ruido; const f = c.createBiquadFilter(); f.type = tipo || 'bandpass'; f.frequency.value = freq || 1200; f.Q.value = 0.8; const gn = c.createGain(); gn.gain.setValueAtTime(g || 0.15, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(gn); gn.connect(this.master); s.start(t); s.stop(t + dur + 0.02);
  },
  sfx(n) {
    if (!this.listo) return;
    switch (n) {
      case 'click': this.tono(880, 0.05, 'square', 0.05); break;
      case 'yin': this.burst(0.08, 0.18, 900); this.tono(180, 0.08, 'square', 0.08, 90); break;
      case 'cargado': this.burst(0.16, 0.25, 500); this.tono(120, 0.2, 'sawtooth', 0.12, 40); break;
      case 'cargando': this.tono(300, 0.1, 'triangle', 0.04, 600); break;
      case 'dash': this.burst(0.18, 0.14, 2400, 'highpass'); break;
      case 'agua': this.tono(500, 0.22, 'sine', 0.12, 220); this.burst(0.2, 0.08, 1800); break;
      case 'fuego': this.burst(0.3, 0.2, 700, 'lowpass'); this.tono(140, 0.2, 'sawtooth', 0.06, 60); break;
      case 'tierra': this.tono(70, 0.3, 'square', 0.16, 35); this.burst(0.2, 0.15, 300, 'lowpass'); break;
      case 'viento': this.burst(0.3, 0.14, 3000, 'highpass'); break;
      case 'rayo': this.tono(1800, 0.08, 'square', 0.1, 200); this.burst(0.1, 0.18, 4000, 'highpass'); break;
      case 'yang': this.tono(1046, 0.18, 'sine', 0.1, 1568); this.tono(1568, 0.25, 'triangle', 0.06); break;
      case 'golpe': this.burst(0.06, 0.2, 1500); this.tono(220, 0.06, 'square', 0.08, 120); break;
      case 'daño': this.tono(200, 0.2, 'square', 0.12, 60); this.burst(0.1, 0.15, 600, 'lowpass'); break;
      case 'esquiva': this.tono(1200, 0.08, 'triangle', 0.06, 1800); break;
      case 'muerte': this.burst(0.3, 0.2, 400, 'lowpass'); this.tono(160, 0.3, 'sawtooth', 0.1, 40); break;
      case 'fail': this.tono(160, 0.12, 'square', 0.06, 110); break;
      case 'unlock': [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tono(f, 0.16, 'square', 0.07), i * 80)); break;
      case 'oleada': this.tono(98, 0.3, 'sawtooth', 0.14); this.burst(0.25, 0.2, 250, 'lowpass'); break;
      case 'victoria': [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => this.tono(f, 0.25, 'triangle', 0.09), i * 110)); break;
      case 'derrota': [392, 349, 311, 233].forEach((f, i) => setTimeout(() => this.tono(f, 0.35, 'sawtooth', 0.08), i * 180)); break;
      case 'cura': this.tono(660, 0.2, 'sine', 0.08, 990); this.tono(990, 0.3, 'sine', 0.05); break;
      case 'orb': this.tono(1400, 0.08, 'triangle', 0.05, 2000); break;
      case 'dialogo': this.tono(600, 0.04, 'square', 0.03); break;
      case 'descanso': this.tono(330, 0.5, 'sine', 0.05, 440); break;
      case 'sobrecarga': this.tono(80, 0.5, 'sawtooth', 0.15, 400); this.burst(0.4, 0.2, 900); break;
      case 'zona': this.tono(440, 0.12, 'triangle', 0.05, 660); break;
      case 'pajaro': this.tono(2200, 0.06, 'sine', 0.03, 2800); setTimeout(() => this.tono(2500, 0.05, 'sine', 0.025, 2000), 90); break;
    }
  },
  musica(escena) { if (this.escena === escena) return; this.escena = escena; this.paso = 0; if (this.ctx) this.nextNota = this.ctx.currentTime + 0.1; },
  // MÚSICA ADAPTATIVA: elige el patrón según el estado del juego. La arena sigue
  // siendo SOLO para arena / torneo / reto; fuera de ahí, si hay un enemigo hostil
  // cerca o persiguiéndote (E.enCombate, que combate.js pone en true con enemigos
  // a menos de 11 celdas), suena 'persecucion'; a salvo vuelve la música de la zona.
  // Llamarla cada cuadro es barato: musica() solo cambia cuando cambia la escena.
  // PARCHE (main.js, bucle, tras `U.Audio.actualizar();`):
  //   if (U.Audio.actualizarMusica) U.Audio.actualizarMusica(E);
  actualizarMusica(E) {
    if (!E) return;
    if (E.arena && E.arena.activa) { this.musica('arena'); return; }
    if (E.torneo && E.torneo.activo) { this.musica('arena'); return; }
    if (E.reto) { this.musica('arena'); return; }
    if (E.enCombate) { this.musica('persecucion'); return; }
    const z = E.zonaActual;
    this.musica(z && z.id === 'bosque' ? 'bosque' : z && z.id === 'desierto' ? 'desierto' : z && z.id === 'montana' ? 'montana' : 'aldea');
  },
  ambiente(zona) { if (!this.ambGain) return; let g = 0; if (zona) { if (zona.id === 'ribera') g = 0.05; else if (zona.id === 'bosque') g = 0.02; else if (zona.id === 'cenizar') g = 0.025; else if (zona.id === 'arena') g = 0.015; } this.ambGain.gain.setTargetAtTime(g, this.ctx.currentTime, 0.5); },
  actualizar() {
    if (!this.listo || this.silenciado || !this.escena) return; const p = this.patrones[this.escena]; if (!p) return; const c = this.ctx; const dur = 60 / p.bpm / 2;
    while (this.nextNota < c.currentTime + 0.25) {
      const i = this.paso % 16; const b = p.bajo[i % p.bajo.length], m = p.mel[i];
      if (b) this.notaProg(b, dur * 0.9, 'triangle', p.g * 1.2, this.nextNota);
      if (m) this.notaProg(m, dur * 0.8, p.tipo, p.g, this.nextNota);
      if (this.escena === 'arena' && i % 4 === 0) this.burstProg(0.06, 0.08, 200, this.nextNota);
      if (this.escena === 'persecucion' && i % 2 === 0) this.burstProg(0.04, 0.06, 320, this.nextNota); // persecución: pulso el doble de rápido que la arena
      this.nextNota += dur; this.paso++;
    }
  },
  notaProg(f, d, tipo, g, t) { const c = this.ctx, o = c.createOscillator(), gn = c.createGain(); o.type = tipo; o.frequency.value = f; gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(g, t + 0.01); gn.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(gn); gn.connect(this.master); o.start(t); o.stop(t + d + 0.02); },
  burstProg(d, g, f, t) { const c = this.ctx, s = c.createBufferSource(); s.buffer = this.ruido; const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = f; const gn = c.createGain(); gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(fl); fl.connect(gn); gn.connect(this.master); s.start(t); s.stop(t + d + 0.02); }
};
