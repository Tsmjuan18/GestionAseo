// ==============================================
// MÓDULO: aplicacion.js — Controlador Principal
// Principio DIP: depende de abstracciones (módulos)
// Principio SRP: cada función tiene una sola responsabilidad
// Paradigma funcional: arrow functions exclusivamente
// ==============================================

const Aplicacion = (() => {

  const generarId = () => `int_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  let estado = {
    integrantes: [],
    asignaciones: {},
    claveSemana: '',
    diasSemana: [],
    reemplazosPendiente: null,
  };

  const ASIGNACION_FIJA = {
    lunes: [
      'Alisson Paola Jaramillo Echeverry',
      'Carlos Andrés Zuluaga Atehortua',
      'Daniela Zapata López',
      'David Antonio Pescador Durán',
      'David Buendia Ruiz',
    ],
    martes: [
      'Eric Daniel Barreto Chavez',
      'Jhoan Steven Murillo García',
      'Jhon Alejandro Patiño Agudelo',
      'Juan Camilo Valencia Rey',
      'Juan Carlos Combita Sandoval',
    ],
    miercoles: [
      'Juan David Ferrer Castillo',
      'Juan José Santamaria Muñoz',
      'Julián David Flórez Vera',
      'Maria Fernanda Huertas Montes',
      'Nelson Fabián Gallego Sánchez',
    ],
    jueves: [
      'Santiago Moreno Piedrahita',
      'Santiago Palacio Tovar',
      'Santiago Tovar Zambrano',
      'Sebastian Ortega Barrero',
      'Stiven Andrés Robles Galán',
    ],
    viernes: [
      'Valeria Arcila Hernández',
      'Valeria Becerra Giraldo',
      'Jhoan Steven Murillo García',
      'Juan Camilo Valencia Rey',
      'Daniela Zapata López',
    ],
  };

  const cargarIntegrantesIniciales = () => {
    localStorage.clear();

    const integrantes = Object.entries(ASIGNACION_FIJA).flatMap(([dia, nombres]) =>
      nombres.map(nombre => ({
        id: generarId(),
        nombre,
        activo: true,
        diaFijo: dia,
      }))
    );

    Almacenamiento.guardarIntegrantes(integrantes);
  };

  const construirAsignacionesSemana = (integrantes) =>
    Asignacion.CONFIGURACION_DIAS.reduce((acc, dia) => {
      acc[dia.clave] = integrantes
        .filter(m => m.diaFijo === dia.clave)
        .map(m => m.id);
      return acc;
    }, {});

  const iniciar = () => {
    cargarIntegrantesIniciales();
    estado.integrantes  = Almacenamiento.obtenerIntegrantes();
    estado.asignaciones = Almacenamiento.obtenerAsignaciones();
    estado.claveSemana  = Asignacion.obtenerClaveSemana();
    estado.diasSemana   = Asignacion.obtenerFechasSemana();

    if (!estado.asignaciones[estado.claveSemana]) {
      estado.asignaciones[estado.claveSemana] = construirAsignacionesSemana(estado.integrantes);
      Almacenamiento.guardarAsignaciones(estado.asignaciones);
    }

    vincularEventos();
    renderizar();
  };

  const renderizar = () => {
    const semanaActual = estado.asignaciones[estado.claveSemana] || {};
    Interfaz.renderizarCuadriculaSemana(
      estado.diasSemana,
      semanaActual,
      estado.integrantes,
      manejarReemplazo
    );
    Interfaz.renderizarListaIntegrantes(
      estado.integrantes,
      manejarEdicion,
      manejarEliminacion,
      manejarCambioEstado
    );
  };

  const persistir = () => {
    Almacenamiento.guardarIntegrantes(estado.integrantes);
    Almacenamiento.guardarAsignaciones(estado.asignaciones);
    renderizar();
  };

  const manejarGuardado = () => {
    const nombre = document.getElementById('inputNombre').value.trim();
    if (!nombre) {
      document.getElementById('inputNombre').focus();
      return;
    }

    const estaActivo = document.getElementById('toggleActivo').classList.contains('activo');
    const idEdicion  = document.getElementById('fondoModal').dataset.idEdicion;

    if (idEdicion) {
      estado.integrantes = estado.integrantes.map(m =>
        m.id === idEdicion ? { ...m, nombre, activo: estaActivo } : m
      );
    } else {
      const conteo = Asignacion.CONFIGURACION_DIAS.map(d => ({
        dia: d.clave,
        total: estado.integrantes.filter(m => m.diaFijo === d.clave).length,
      }));
      const diaMinimo = conteo.sort((a, b) => a.total - b.total)[0].dia;
      const nuevoIntegrante = { id: generarId(), nombre, activo: estaActivo, diaFijo: diaMinimo };
      estado.integrantes = [...estado.integrantes, nuevoIntegrante];
      const semana = estado.asignaciones[estado.claveSemana];
      semana[diaMinimo] = [...(semana[diaMinimo] || []), nuevoIntegrante.id];
    }

    Interfaz.cerrarModal();
    persistir();
  };

  const manejarEdicion = (id) => {
    const integrante = Asignacion.obtenerIntegrantePorId(estado.integrantes, id);
    if (integrante) Interfaz.abrirModal(integrante);
  };

  const manejarEliminacion = (id) => {
    if (!confirm('¿Eliminar este integrante?')) return;
    estado.integrantes = estado.integrantes.filter(m => m.id !== id);
    Object.keys(estado.asignaciones).forEach(semana => {
      Object.keys(estado.asignaciones[semana]).forEach(dia => {
        estado.asignaciones[semana][dia] =
          estado.asignaciones[semana][dia].filter(i => i !== id);
      });
    });
    persistir();
  };

  const manejarCambioEstado = (id) => {
    estado.integrantes = estado.integrantes.map(m =>
      m.id === id ? { ...m, activo: !m.activo } : m
    );
    persistir();
  };

  const manejarReemplazo = (clave, idActual) => {
    const integranteActual = Asignacion.obtenerIntegrantePorId(estado.integrantes, idActual);
    const asignadosHoy     = estado.asignaciones[estado.claveSemana][clave] || [];

    const candidatos = estado.integrantes.filter(m =>
      m.activo &&
      m.id !== idActual &&
      !asignadosHoy.includes(m.id)
    );

    const reemplazo = candidatos.length > 0
      ? candidatos[Math.floor(Math.random() * candidatos.length)]
      : null;

    estado.reemplazosPendiente = reemplazo
      ? { dia: clave, idOriginal: idActual, idNuevoIntegrante: reemplazo.id }
      : null;

    const configDia = Asignacion.CONFIGURACION_DIAS.find(d => d.clave === clave);
    Interfaz.abrirModalReemplazo(configDia?.etiqueta || clave, integranteActual, reemplazo);
  };

  const manejarConfirmacionReemplazo = () => {
    if (!estado.reemplazosPendiente) return;
    const { dia, idOriginal, idNuevoIntegrante } = estado.reemplazosPendiente;
    const semana = estado.asignaciones[estado.claveSemana];
    semana[dia] = semana[dia].map(id => id === idOriginal ? idNuevoIntegrante : id);
    estado.reemplazosPendiente = null;
    Interfaz.cerrarModalReemplazo();
    persistir();
  };

  const vincularEventos = () => {
    document.getElementById('btnAgregarIntegrante').addEventListener('click', () => Interfaz.abrirModal());
    document.getElementById('cerrarModal').addEventListener('click', Interfaz.cerrarModal);
    document.getElementById('btnCancelar').addEventListener('click', Interfaz.cerrarModal);
    document.getElementById('btnGuardar').addEventListener('click', manejarGuardado);

    document.getElementById('inputNombre').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') manejarGuardado();
    });

    document.getElementById('toggleActivo').addEventListener('click', () => {
      document.getElementById('toggleActivo').classList.add('activo');
      document.getElementById('toggleInactivo').classList.remove('activo');
    });

    document.getElementById('toggleInactivo').addEventListener('click', () => {
      document.getElementById('toggleInactivo').classList.add('activo');
      document.getElementById('toggleActivo').classList.remove('activo');
    });

    document.getElementById('fondoModal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) Interfaz.cerrarModal();
    });

    document.getElementById('cerrarReemplazo').addEventListener('click', Interfaz.cerrarModalReemplazo);
    document.getElementById('confirmarReemplazo').addEventListener('click', manejarConfirmacionReemplazo);
    document.getElementById('fondoReemplazo').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) Interfaz.cerrarModalReemplazo();
    });
  };

  return { iniciar };

})();

document.addEventListener('DOMContentLoaded', Aplicacion.iniciar);