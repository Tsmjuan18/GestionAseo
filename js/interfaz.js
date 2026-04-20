// ==============================================
// MÓDULO: interfaz.js — Capa de Renderizado UI
// Principio SRP: solo renderizado, sin lógica de negocio
// Paradigma funcional: arrow functions
// ==============================================

const Interfaz = (() => {

  const COLORES_AVATAR = [
    '#4a6fa5', '#5a9a74', '#9b6b8a', '#8a8a9a',
    '#c4a44a', '#e07b54', '#5b8db8', '#7a9e6a',
  ];

  const obtenerColorAvatar = (id) => {
    const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return COLORES_AVATAR[hash % COLORES_AVATAR.length];
  };

  const obtenerIniciales = (nombre) => {
    const partes = nombre.trim().split(' ');
    return partes.length >= 2
      ? (partes[0][0] + partes[1][0]).toUpperCase()
      : nombre.slice(0, 2).toUpperCase();
  };

  const renderizarCuadriculaSemana = (diasSemana, asignaciones, integrantes, alReemplazar) => {
    const cuadricula = document.getElementById('cuadriculaSemana');
    if (!cuadricula) return;

    const claveHoy = Asignacion.obtenerDiaHoy();

    cuadricula.innerHTML = diasSemana.map(dia => {
      const idsAsignados   = asignaciones[dia.clave] || [];
      const miembrosDelDia = idsAsignados
        .map(id => Asignacion.obtenerIntegrantePorId(integrantes, id))
        .filter(Boolean);

      const esHoy = dia.clave === claveHoy;

      const filasIntegrantes = miembrosDelDia.length > 0
        ? miembrosDelDia.map(m => `
            <div class="fila-asignado${m.activo ? '' : ' ausente'}">
              <div class="mini-avatar" style="background:${obtenerColorAvatar(m.id)}">
                ${obtenerIniciales(m.nombre)}
              </div>
              <span class="nombre-asignado">${m.nombre}</span>
              <button class="btn-reemplazar-mini"
                data-dia="${dia.clave}"
                data-id="${m.id}"
                title="Reemplazar">↺</button>
            </div>
          `).join('')
        : `<p class="sin-asignados">Sin asignados</p>`;

      return `
        <div class="tarjeta-dia ${dia.claseCss}${esHoy ? ' hoy' : ''}">
          <div class="encabezado-dia">
            <span class="nombre-dia">${dia.etiqueta}</span>
            <span class="fecha-dia">${dia.fechaTexto}</span>
            <span class="contador-dia">${miembrosDelDia.length} persona${miembrosDelDia.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="cuerpo-dia">
            ${filasIntegrantes}
          </div>
        </div>
      `;
    }).join('');

    cuadricula.querySelectorAll('.btn-reemplazar-mini').forEach(btn => {
      btn.addEventListener('click', () => alReemplazar(btn.dataset.dia, btn.dataset.id));
    });
  };

  const renderizarListaIntegrantes = (integrantes, alEditar, alEliminar, alCambiarEstado) => {
    const lista    = document.getElementById('listaIntegrantes');
    const vacio    = document.getElementById('estadoVacio');
    const contador = document.getElementById('contadorIntegrantes');
    if (!lista) return;

    contador.textContent = `${integrantes.length} integrante${integrantes.length !== 1 ? 's' : ''}`;

    if (integrantes.length === 0) {
      lista.innerHTML = '';
      vacio.classList.add('visible');
      return;
    }

    vacio.classList.remove('visible');

    lista.innerHTML = integrantes.map(m => `
      <div class="tarjeta-integrante${m.activo ? '' : ' inactivo'}" data-id="${m.id}">
        <div class="info-integrante">
          <div class="avatar-integrante" style="background:${obtenerColorAvatar(m.id)}">
            ${obtenerIniciales(m.nombre)}
          </div>
          <div>
            <div class="nombre-integrante">${m.nombre}</div>
            <div class="estado-integrante">${m.activo ? '✅ activo' : '⛔ inactivo'} · ${m.diaFijo}</div>
          </div>
        </div>
        <div class="acciones-integrante">
          <button class="btn-icono cambiar-estado" title="${m.activo ? 'Desactivar' : 'Activar'}" data-id="${m.id}">
            ${m.activo ? '⛔' : '✅'}
          </button>
          <button class="btn-icono editar-integrante" title="Editar" data-id="${m.id}">✏️</button>
          <button class="btn-icono peligro eliminar-integrante" title="Eliminar" data-id="${m.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    lista.querySelectorAll('.editar-integrante').forEach(btn =>
      btn.addEventListener('click', () => alEditar(btn.dataset.id)));

    lista.querySelectorAll('.eliminar-integrante').forEach(btn =>
      btn.addEventListener('click', () => alEliminar(btn.dataset.id)));

    lista.querySelectorAll('.cambiar-estado').forEach(btn =>
      btn.addEventListener('click', () => alCambiarEstado(btn.dataset.id)));
  };

  const abrirModal = (integrante = null) => {
    const fondo          = document.getElementById('fondoModal');
    const titulo         = document.getElementById('tituloModal');
    const inputNombre    = document.getElementById('inputNombre');
    const toggleActivo   = document.getElementById('toggleActivo');
    const toggleInactivo = document.getElementById('toggleInactivo');

    titulo.textContent = integrante ? 'Editar Integrante' : 'Nuevo Integrante';
    inputNombre.value  = integrante ? integrante.nombre : '';

    const estaActivo = integrante ? integrante.activo : true;
    toggleActivo.classList.toggle('activo', estaActivo);
    toggleInactivo.classList.toggle('activo', !estaActivo);

    fondo.dataset.idEdicion = integrante ? integrante.id : '';
    fondo.classList.add('abierto');
    setTimeout(() => inputNombre.focus(), 150);
  };

  const cerrarModal = () => {
    document.getElementById('fondoModal').classList.remove('abierto');
  };

  const abrirModalReemplazo = (etiquetaDia, integranteActual, reemplazo) => {
    const fondo        = document.getElementById('fondoReemplazo');
    const cuerpo       = document.getElementById('cuerpoReemplazo');
    const btnConfirmar = document.getElementById('confirmarReemplazo');

    if (!reemplazo) {
      cuerpo.innerHTML = `<p class="sin-reemplazo">No hay integrantes disponibles para reemplazar.</p>`;
      btnConfirmar.style.display = 'none';
    } else {
      cuerpo.innerHTML = `
        <div class="info-reemplazo">
          <div class="fila-reemplazo">
            <span class="etiqueta-reemplazo">Día</span>
            <strong>${etiquetaDia}</strong>
          </div>
          <div class="flecha-reemplazo">↓</div>
          <div class="fila-reemplazo">
            <span class="etiqueta-reemplazo">Faltó</span>
            <span style="text-decoration:line-through;color:var(--texto-atenuado)">
              ${integranteActual?.nombre || '—'}
            </span>
          </div>
          <div class="fila-reemplazo">
            <span class="etiqueta-reemplazo">Reemplazo</span>
            <strong style="color:var(--acento)">${reemplazo.nombre}</strong>
          </div>
        </div>
      `;
      btnConfirmar.style.display = '';
    }

    fondo.classList.add('abierto');
  };

  const cerrarModalReemplazo = () => {
    document.getElementById('fondoReemplazo').classList.remove('abierto');
  };

  return {
    renderizarCuadriculaSemana,
    renderizarListaIntegrantes,
    abrirModal,
    cerrarModal,
    abrirModalReemplazo,
    cerrarModalReemplazo,
  };

})();