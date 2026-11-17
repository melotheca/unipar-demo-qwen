/* === js/sistemas/portal.js === */
/* Unipar — portal, pasaporte y mundo espiritual: PRÓXIMAMENTE. Aquí vive la capa meta del USUARIO (recuerda todas las partidas). */
window.U = window.U || {};

U.Portal = {
  activo: false, // Recompensa de final de juego: aún no se gana en el juego completo.
  // Pasaporte = archivo meta del usuario (JSON local, sin cuentas ni internet). El guardián del portal es la excepción con memoria completa entre mundos.
  pasaporte: null,
  guardian: { nombre: 'Guardián del Umbral', memoriaCompleta: true },
  // Regla: solo el USUARIO y UNA cosa cruzan. Lo físico se queda, lo espiritual viaja. La criatura que viaja es la de la partida ACTUAL.
  // Cada mundo es soberano (JSON por mundo). Contrato por jugador-por-mundo, no por usuario.
  // Eco: el personaje de un amigo (o de otra partida) existe como NPC en piloto automático con sus estadísticas al MÁXIMO: poderoso por inteligencia, nunca inflado.
  entreMundos: { nombre: 'Entre-Mundos', compartido: true, tecnicas: ['Teletransportación', 'Intangible'], nota: 'La Invisibilidad NO es de Entre-Mundos ni aprendible por el jugador: es de hechiceros (Arte Místico / Mente), como los del Escuadrón Gamma.' },
  // Eco / Puerta / Sentido / Prisión / Intercambio / Memoria-Regresión: EN CONSIDERACIÓN, no programadas.
  guardarMundo() { if (U.Guardado) U.Guardado.guardarAuto(); }, // implementado: guardado automático en el navegador + descarga de respaldo en Opciones (ver U.Guardado)
  guardarPasaporte() { /* próximamente: JSON aparte del usuario */ },
  proximas() { return ['Portal (final de juego)', 'Pasaporte del usuario', 'Entre-Mundos compartido', 'Eco de otras partidas', 'Guardián del portal']; }
};
