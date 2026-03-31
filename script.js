// Estado global de la aplicación
let pruebas = [];
let pruebaActual = null;
let pistasRecolectadas = [];

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    cargarProgreso();
});

// Cargar datos desde el JSON
async function cargarDatos() {
    try {
        const response = await fetch('data.json');
        pruebas = await response.json();
        renderizarPruebas();
        actualizarProgreso();
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        alert('Error al cargar las pruebas. Por favor, recarga la página.');
    }
}

// Renderizar lista de pruebas
function renderizarPruebas() {
    const pruebasList = document.getElementById('pruebasList');
    pruebasList.innerHTML = '';

    pruebas.forEach(prueba => {
        const pruebaElement = document.createElement('div');
        pruebaElement.className = 'prueba-item';
        
        if (prueba.completada) {
            pruebaElement.classList.add('completada');
        }

        pruebaElement.innerHTML = `
            <div class="prueba-numero">${prueba.numero}</div>
        `;

        pruebaElement.addEventListener('click', () => seleccionarPrueba(prueba.numero));
        pruebasList.appendChild(pruebaElement);
    });
}

// Seleccionar una prueba
function seleccionarPrueba(numero) {
    pruebaActual = pruebas.find(p => p.numero === numero);
    
    if (!pruebaActual) {
        alert('Prueba no encontrada');
        return;
    }

    document.getElementById('pruebaTitle').textContent = `Prueba #${pruebaActual.numero}`;
    document.getElementById('pruebaDescripcion').textContent = pruebaActual.descripcion;
    document.getElementById('respuestaInput').value = '';
    
    // Mostrar imagen de descripción si existe
    const descripcionImg = document.getElementById('descripcionImagen');
    if (pruebaActual.descripcionImagen) {
        descripcionImg.src = pruebaActual.descripcionImagen;
        descripcionImg.style.display = 'block';
    } else {
        descripcionImg.style.display = 'none';
    }
    
    // Limpiar feedback
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('show', 'error', 'success');
    
    cambiarVista('formularioView');
}

// Normalizar texto para comparación (quitar tildes, espacios extra, convertir a minúsculas)
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD") // Descomponer caracteres acentuados
        .replace(/[\u0300-\u036f]/g, "") // Eliminar diacríticos (tildes)
        .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
        .trim(); // Quitar espacios al inicio y final
}

// Comprobar respuesta
document.getElementById('respuestaForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const respuestaInput = document.getElementById('respuestaInput').value;
    const feedback = document.getElementById('feedback');
    
    // Normalizar tanto la respuesta del usuario como la respuesta correcta
    const respuestaNormalizada = normalizarTexto(respuestaInput);
    const respuestaCorrectaNormalizada = normalizarTexto(pruebaActual.respuesta);
    
    // Comprobar si la respuesta es correcta
    if (respuestaNormalizada === respuestaCorrectaNormalizada) {
        // Respuesta correcta
        pruebaActual.completada = true;
        
        // Guardar pista
        if (!pistasRecolectadas.some(p => p.numero === pruebaActual.numero)) {
            pistasRecolectadas.push({
                numero: pruebaActual.numero,
                pista: pruebaActual.pista,
                pistaImagen: pruebaActual.pistaImagen
            });
        }
        
        // Guardar progreso
        guardarProgreso();
        
        // Mostrar pista
        document.getElementById('pistaTexto').textContent = pruebaActual.pista;
        
        // Mostrar imagen de pista si existe
        const pistaImg = document.getElementById('pistaImagen');
        if (pruebaActual.pistaImagen) {
            pistaImg.src = pruebaActual.pistaImagen;
            pistaImg.style.display = 'block';
        } else {
            pistaImg.style.display = 'none';
        }
        
        cambiarVista('pistaView');
        
        // Actualizar vista de pruebas
        renderizarPruebas();
        actualizarProgreso();
    } else {
        // Respuesta incorrecta
        feedback.textContent = '❌ Respuesta incorrecta. Inténtalo de nuevo.';
        feedback.className = 'feedback error show';
        
        // Limpiar feedback después de 3 segundos
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 3000);
    }
});

// Cambiar de vista
function cambiarVista(vistaId) {
    const vistas = document.querySelectorAll('.view');
    vistas.forEach(vista => vista.classList.remove('active'));
    
    document.getElementById(vistaId).classList.add('active');
    
    // Scroll al inicio
    window.scrollTo(0, 0);
}

// Volver a la vista de pruebas
function volverAPruebas() {
    cambiarVista('pruebasView');
}

// Ver pistas recolectadas
function verPistasRecolectadas() {
    const pistasListElement = document.getElementById('pistasRecolectadasList');
    pistasListElement.innerHTML = '';
    
    if (pistasRecolectadas.length === 0) {
        pistasListElement.innerHTML = '<div class="no-pistas">📭 Aún no has recolectado ninguna pista. ¡Resuelve las pruebas para obtenerlas!</div>';
    } else {
        pistasRecolectadas.forEach(pista => {
            const pistaElement = document.createElement('div');
            pistaElement.className = 'pista-recolectada';
            
            let imagenHTML = '';
            if (pista.pistaImagen) {
                imagenHTML = `<img src="${pista.pistaImagen}" class="prueba-imagen" alt="Imagen de pista ${pista.numero}">`;
            }
            
            pistaElement.innerHTML = `
                <div class="pista-recolectada-header">
                    <span class="pista-badge">Prueba ${pista.numero}</span>
                </div>
                ${imagenHTML}
                <p>${pista.pista}</p>
            `;
            pistasListElement.appendChild(pistaElement);
        });
    }
    
    cambiarVista('pistasRecolectadasView');
}

// Actualizar contador de progreso
function actualizarProgreso() {
    const pruebasCompletadas = pruebas.filter(p => p.completada).length;
    const totalPruebas = pruebas.length;
    
    document.getElementById('pruebasResueltas').textContent = pruebasCompletadas;
    document.getElementById('totalPruebas').textContent = totalPruebas;
    
    // Actualizar lista de pruebas resueltas
    renderizarPruebasResueltas();
}

// Renderizar lista de pruebas resueltas
function renderizarPruebasResueltas() {
    const pruebasResueltasList = document.getElementById('pruebasResueltasList');
    const pruebasCompletadas = pruebas.filter(p => p.completada);
    
    if (pruebasCompletadas.length === 0) {
        pruebasResueltasList.innerHTML = '<p class="sin-pruebas">Aún no has resuelto ninguna prueba</p>';
    } else {
        pruebasResueltasList.innerHTML = '';
        pruebasCompletadas.forEach(prueba => {
            const badge = document.createElement('div');
            badge.className = 'prueba-resuelta-badge';
            badge.textContent = prueba.numero;
            badge.title = `Ver pista de la prueba ${prueba.numero}`;
            badge.addEventListener('click', () => mostrarPistaRapida(prueba.numero));
            pruebasResueltasList.appendChild(badge);
        });
    }
}

// Mostrar pista rápida desde la lista de resueltas
function mostrarPistaRapida(numero) {
    const prueba = pruebas.find(p => p.numero === numero);
    
    if (!prueba || !prueba.completada) {
        return;
    }
    
    // Configurar vista de pista
    document.getElementById('pistaTexto').textContent = prueba.pista;
    
    // Mostrar imagen de pista si existe
    const pistaImg = document.getElementById('pistaImagen');
    if (prueba.pistaImagen) {
        pistaImg.src = prueba.pistaImagen;
        pistaImg.style.display = 'block';
    } else {
        pistaImg.style.display = 'none';
    }
    
    cambiarVista('pistaView');
}

// Guardar progreso en localStorage
function guardarProgreso() {
    const progreso = {
        pruebas: pruebas.map(p => ({
            numero: p.numero,
            completada: p.completada || false
        })),
        pistas: pistasRecolectadas
    };
    
    localStorage.setItem('murderPartyProgreso', JSON.stringify(progreso));
}

// Cargar progreso desde localStorage
function cargarProgreso() {
    const progresoGuardado = localStorage.getItem('murderPartyProgreso');
    
    if (progresoGuardado) {
        try {
            const progreso = JSON.parse(progresoGuardado);
            
            // Restaurar estado de pruebas completadas
            if (progreso.pruebas && Array.isArray(progreso.pruebas)) {
                progreso.pruebas.forEach(pruebaGuardada => {
                    const prueba = pruebas.find(p => p.numero === pruebaGuardada.numero);
                    if (prueba) {
                        prueba.completada = pruebaGuardada.completada;
                    }
                });
            }
            
            // Restaurar pistas recolectadas
            if (progreso.pistas && Array.isArray(progreso.pistas)) {
                pistasRecolectadas = progreso.pistas;
            }
            
            renderizarPruebas();
            actualizarProgreso();
        } catch (error) {
            console.error('Error al cargar el progreso:', error);
        }
    }
}

// Función para reiniciar el juego (útil para desarrollo)
function reiniciarJuego() {
    if (confirm('¿Estás seguro de que quieres reiniciar el juego? Se perderá todo tu progreso.')) {
        localStorage.removeItem('murderPartyProgreso');
        pruebas.forEach(p => p.completada = false);
        pistasRecolectadas = [];
        renderizarPruebas();
        actualizarProgreso();
        volverAPruebas();
    }
}

// Exportar función para usar en consola si es necesario
window.reiniciarJuego = reiniciarJuego;
