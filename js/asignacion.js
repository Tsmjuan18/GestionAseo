// ==============================================
// MÓDULO: asignacion.js — Lógica de Asignación
// Paradigma funcional: solo arrow functions
// Principio SRP: lógica pura, sin efectos secundarios
// ==============================================

const Asignacion = (() => {

  const CONFIGURACION_DIAS = [
    { clave: 'lunes',     etiqueta: 'Lunes',      claseCss: 'dia-lunes' },
    { clave: 'martes',    etiqueta: 'Martes',      claseCss: 'dia-martes' },
    { clave: 'miercoles', etiqueta: 'Miércoles',   claseCss: 'dia-miercoles' },
    { clave: 'jueves',    etiqueta: 'Jueves',      claseCss: 'dia-jueves' },
    { clave: 'viernes',   etiqueta: 'Viernes',     claseCss: 'dia-viernes' },
  ];

  const obtenerDiaHoy = () => {
    const indiceDia = new Date().getDay();
    const mapa = { 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes' };
    return mapa[indiceDia] || null;
  };

  const obtenerClaveSemana = () => {
    const ahora = new Date();
    const inicioCienio = new Date(ahora.getFullYear(), 0, 1);
    const numSemana = Math.ceil(((ahora - inicioCienio) / 86400000 + inicioCienio.getDay() + 1) / 7);
    return `${ahora.getFullYear()}-S${String(numSemana).padStart(2, '0')}`;
  };

  const obtenerFechasSemana = () => {
    const ahora = new Date();
    const dia = ahora.getDay();
    const lunes = new Date(ahora);

    if (dia === 0) lunes.setDate(ahora.getDate() + 1);
    else if (dia === 6) lunes.setDate(ahora.getDate() + 2);
    else lunes.setDate(ahora.getDate() - (dia - 1));

    return CONFIGURACION_DIAS.map((d, i) => {
      const fecha = new Date(lunes);
      fecha.setDate(lunes.getDate() + i);
      return {
        ...d,
        fecha,
        fechaTexto: fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
      };
    });
  };

  const obtenerIntegrantePorId = (integrantes, id) =>
    integrantes.find(m => m.id === id) || null;

  return {
    CONFIGURACION_DIAS,
    obtenerDiaHoy,
    obtenerClaveSemana,
    obtenerFechasSemana,
    obtenerIntegrantePorId,
  };

})();