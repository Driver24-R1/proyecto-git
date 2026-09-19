const florInteractiva = document.getElementById('flor-interactiva');
const contenedorInicial = document.getElementById('contenedor-inicial');
const pantallaFlores = document.getElementById('pantalla-flores');
const contenedorCartaAbierta = document.getElementById('contenedor-carta-abierta');
const contenidoCarta = document.getElementById('contenido-carta');
const btnVolver = document.getElementById('btn-volver');

// Audio y Música
const musica = document.getElementById('musica-fondo');
const btnMusica = document.getElementById('btn-musica');

// CONFIGURACIÓN DE TU BASE DE DATOS
const URL_BASE_DATOS = 'flores.json';

// Escáner QR / Barras
const btnEscanear = document.getElementById('btn-escanear');
const modalEscaner = document.getElementById('modal-escaner');
const btnCerrarEscaner = document.getElementById('btn-cerrar-escaner');
let html5QrcodeScanner = null;

// Control de Música
btnMusica.addEventListener('click', () => {
    if (musica.paused) {
        musica.play().catch(() => {});
        btnMusica.innerText = "⏸️ Pausar";
    } else {
        musica.pause();
        btnMusica.innerText = "🎵 Música";
    }
});

// Evento Inicial: Explota la flor del centro
florInteractiva.addEventListener('click', () => {
    florInteractiva.classList.add('dispersar');
    musica.play().then(() => btnMusica.innerText = "⏸️ Pausar").catch(() => {});

    setTimeout(() => {
        contenedorInicial.style.opacity = '0';
        contenedorInicial.style.visibility = 'hidden';
        pantallaFlores.classList.add('activa');
        cargarMosaicoFlores();
    }, 800);
}, { once: true });

// Carga las flores desde la Base de Datos
async function cargarMosaicoFlores() {
  try {
    const { data, error } = await window.client
      .from("flores")
      .select(`
        id,
        contenido,
        titulo,
        codigo,
        imagen,
        musica,
        fecha,
        activo
      `)
      .order('fecha', { ascending: false }); // Los más recientes primero

    // 1. Validar si hubo un error en la consulta a la base de datos
    if (error) {
      console.error("Error de Supabase:", error.message);
      return;
    }

    // 2. Verificar si la base de datos devolvió datos
    if (!data || data.length <= 0) {
      console.warn("No se encontraron flores en la base de datos.");
      return;
    }

    data.forEach((f) => {
      // 3. Si quieres ignorar los que no están activos, descomenta esta línea:
      if (!f.activo) return;

      const elementoFlor = document.createElement('div');
      elementoFlor.classList.add('flor-pantalla');
      
      // CORRECCIÓN: Usar 'f.imagen' en lugar de 'flor.imagen'
      elementoFlor.innerText = f.imagen || "🌼"; 
      elementoFlor.style.animationDelay = `${1 * 0.03}s`;

      elementoFlor.addEventListener('click', () => {
        pantallaFlores.classList.remove('activa');
        contenidoCarta.innerHTML = `<h2>${f.imagen || "🌸"}</h2><p>${f.contenido}</p>`;
        contenedorCartaAbierta.classList.add('mostrar');
      });

      pantallaFlores.appendChild(elementoFlor);
    });

  } catch (err) {
    console.error("Error cargando poemas:", err);
  }
}


btnVolver.addEventListener('click', () => {
    contenedorCartaAbierta.classList.remove('mostrar');
    pantallaFlores.classList.add('activa');
});




async function cambiarEstadoActivo(idFlor, nuevoEstado) {
  try {
    const { data, error } = await window.client
      .from("flores")
      .update({ activo: nuevoEstado }) // Modifica solo la columna 'activo' (puede ser true o false)
      .eq("id", idFlor)                // Filtra para que afecte únicamente a este ID específico
      .select();                       // (Opcional) Devuelve el registro modificado

    if (error) {
      console.error("Error al actualizar Supabase:", error.message);
      return;
    }

    console.log("¡Estado modificado con éxito!", data);
  } catch (err) {
    console.error("Error en la petición:", err);
  }
}
// --- EL NUEVO JEFE DEL ESCÁNER LOCAL REPARADO ---
btnEscanear.addEventListener('click', async () => {
    modalEscaner.style.display = "flex";

    try {
        // Evitar crear otra instancia si ya existe
        if (html5QrcodeScanner) {
            try { await html5QrcodeScanner.stop(); } catch (e) {}
            try { html5QrcodeScanner.clear(); } catch (e) {}
            html5QrcodeScanner = null;
        }

        // Comprobar que la librería exista
        if (typeof Html5Qrcode === "undefined") {
            throw new Error("La librería Html5Qrcode no está cargada.");
        }

        html5QrcodeScanner = new Html5Qrcode("lector-camara");

        const configEscaneo = {
            fps: 10,
            qrbox: { width: 300, height: 150 },
            aspectRatio: 1.777778,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.ITF
            ]
        };

        // CORRECCIÓN 1: Desestructurar como 'data' (nombre correcto de Supabase)
        const { data: listaFlores, error: errorSupabase } = await window.client
            .from("flores")
            .select(`id, codigo, activo`);

        if (errorSupabase) {
            throw new Error("Error obteniendo códigos de Supabase: " + errorSupabase.message);
        }

        // Variable de control interna para evitar múltiples lecturas del mismo código a la vez
        let procesandoEscaneo = false;

        // Definir la función que se ejecutará al detectar un código
        const alEscanearExito = async (decodedText, decodedResult) => {
            // Si ya se está procesando un código previo, ignoramos las ráfagas consecutivas de la cámara
            if (procesandoEscaneo) return;
            procesandoEscaneo = true;

            console.log("Código escaneado:", decodedText);

            // CORRECCIÓN 2: Buscar en la lista qué flor coincide con el código escaneado
            const florEncontrada = listaFlores.find(flor => flor.codigo === decodedText.trim());

            // Si el código escaneado no coincide con ninguna flor de la BD, ignorar y rehabilitar
            if (!florEncontrada) {
                console.log("El código no coincide con ninguna flor registrada.");
                procesandoEscaneo = false;
                return; 
            }

            console.log("¡Flor encontrada! Actualizando estado...", florEncontrada);

            try {
                // CORRECCIÓN 3: Usar el ID de la flor que encontramos en la lista
                const { error: errorUpdate } = await window.client
                    .from("flores")
                    .update({ activo: true }) 
                    .eq("id", florEncontrada.id)
                    .select(); 

                console.log("ID de flor activada:", florEncontrada.id);

                if (errorUpdate) {
                    console.error("No se pudo activar la flor:", errorUpdate.message);
                    procesandoEscaneo = false;
                    return;
                }

                alert("¡Excelente! Has activado una nueva flor 🌻");
                
                // FIX CRÍTICO: Comprobar explícitamente si el objeto scanner sigue vivo antes de detenerlo
                if (html5QrcodeScanner) {
                    try {
                        await html5QrcodeScanner.stop();
                        html5QrcodeScanner.clear();
                    } catch (stopError) {
                        console.warn("La cámara ya se estaba deteniendo en otra ráfaga:", stopError);
                    }
                    html5QrcodeScanner = null;
                }
                
                modalEscaner.style.display = "none";
                
                // Recargar el mosaico para ver los cambios
                if (typeof cargarMosaicoFlores === "function") {
                    cargarMosaicoFlores();
                }

            } catch (err) {
                console.error("Error al actualizar la flor en el escaneo:", err);
                procesandoEscaneo = false; // Permitir reintentar si ocurre un fallo de red
            }
        };

        // Obtener las cámaras disponibles
        const camaras = await Html5Qrcode.getCameras();

        if (!camaras || camaras.length === 0) {
            throw new Error("No se encontró ninguna cámara.");
        }

        console.log("Cámaras encontradas:", camaras);

        // Buscar preferentemente la cámara trasera
        let camaraSeleccionada = camaras.find(camara =>
            /back|rear|environment|trasera|posterior/i.test(camara.label)
        );

        if (!camaraSeleccionada) {
            camaraSeleccionada = camaras[camaras.length - 1];
        }

        console.log("Cámara seleccionada:", camaraSeleccionada);

        await html5QrcodeScanner.start(
            camaraSeleccionada.id,
            configEscaneo,
            alEscanearExito,
            (errorMessage) => {
                // No mostrar errores mientras está buscando el código
            }
        );

    } catch (error) {
        console.error("Error al abrir la cámara o procesar datos:", error);

        try {
            if (html5QrcodeScanner) {
                await html5QrcodeScanner.stop();
                html5QrcodeScanner.clear();
            }
        } catch (e) {}

        html5QrcodeScanner = null;
        modalEscaner.style.display = "none";

        alert(
            "No se pudo abrir la cámara.\n\n" +
            "Comprueba que:\n" +
            "• El navegador tenga permiso para usar la cámara.\n" +
            "• La página esté usando HTTPS.\n" +
            "• Ninguna otra aplicación esté usando la cámara."
        );
    }
});






function apagarCamara() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            modalEscaner.style.display = "none";
            html5QrcodeScanner = null;
        }).catch(() => {
            modalEscaner.style.display = "none";
            html5QrcodeScanner = null;
        });
    } else {
        modalEscaner.style.display = "none";
    }
}

btnCerrarEscaner.addEventListener('click', apagarCamara);
