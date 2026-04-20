// ==============================================
// MÓDULO: almacenamiento.js — Capa de Persistencia
// Principio SRP: solo gestiona localStorage
// ==============================================

const Almacenamiento = (() => {

  const CLAVES = {
    INTEGRANTES: 'aseo_integrantes',
    ASIGNACIONES: 'aseo_asignaciones',
  };

  const guardar = (clave, datos) => {
    try {
      localStorage.setItem(clave, JSON.stringify(datos));
      return true;
    } catch (e) {
      console.error('[Almacenamiento] Error al guardar:', e);
      return false;
    }
  };

  const cargar = (clave, valorPorDefecto = null) => {
    try {
      const raw = localStorage.getItem(clave);
      return raw !== null ? JSON.parse(raw) : valorPorDefecto;
    } catch (e) {
      console.error('[Almacenamiento] Error al leer:', e);
      return valorPorDefecto;
    }
  };

  const obtenerIntegrantes  = () => cargar(CLAVES.INTEGRANTES, []);
  const guardarIntegrantes  = (integrantes) => guardar(CLAVES.INTEGRANTES, integrantes);

  const obtenerAsignaciones = () => cargar(CLAVES.ASIGNACIONES, {});
  const guardarAsignaciones = (asignaciones) => guardar(CLAVES.ASIGNACIONES, asignaciones);

  return { obtenerIntegrantes, guardarIntegrantes, obtenerAsignaciones, guardarAsignaciones };

})();