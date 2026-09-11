const txtPoema = document.querySelector(".contenido textarea");
const CrearForm = document.getElementById("CrearForm");

if (txtPoema) {
  txtPoema.addEventListener("input", function () {
    // 1. Resetea la altura a cero para obligar a recalcular si el usuario borra texto
    this.style.height = "auto"; 
        
    // 2. Le asigna los píxeles exactos que ocupa el texto de los versos hacia abajo
    this.style.height = this.scrollHeight + "px"; 
  });
}

// 🔥 GUARDAR POEMA CON DETECTOR TÉCNICO DE ERRORES
CrearForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        if (!window.client) {
            alert("Error: El cliente de Supabase no está inicializado.");
            return;
        }

        // 1. Validar sesión activa
        const { data: sessionData, error: errorSesion } = await window.client.auth.getSession();

        if (errorSesion || !sessionData || !sessionData.session) {
            alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente para publicar.");
            window.location.href = "../acces/acces.html";
            return;
        }

        const usuarioLogueadoId = sessionData.session.user.id;

        // 2. Capturar elementos de forma segura para saber si existen en tu HTML
        const elTitulo = document.getElementById("title-crear");
        const elContenido = document.getElementById("contenido-crear");
        const elMusica = document.getElementById("musica-crear");

        // 🔥 Alerta de diagnóstico: Te avisa si te falta configurar algún ID en tu HTML
        if (!elTitulo) { alert("Error técnico: No existe ningún elemento con id='poema-titulo' en tu HTML."); return; }
        if (!elContenido) { alert("Error técnico: No existe ningún elemento con id='poema-contenido' en tu HTML."); return; }

        const tituloInput = elTitulo.value.trim();
        const contenidoInput = elContenido.value.trim();
        const musicaInput = elMusica ? elMusica.value.trim() : "";

        if (!tituloInput || !contenidoInput) {
            alert("Por favor, escribe un título y el contenido de tu poema.");
            return;
        }

        // 3. Insertar el poema en Supabase
        const { error: errorInsert } = await window.client
            .from("poemas")
            .insert([
                {
                    titulo: tituloInput,
                    contenido: contenidoInput,
                    musica: musicaInput || null,
                    autor_id: usuarioLogueadoId
                }
            ]);

        if (errorInsert) {
            alert("No se pudo publicar el poema: " + errorInsert.message);
            return;
        }

        alert("¡Tu poema ha sido publicado con éxito!");
        CrearForm.reset();
        window.location.href = "../list/list.html";

    } catch (err) {
        // 🔥 Ahora te dirá el error exacto del navegador (ej. "Cannot read properties of null (reading 'value')")
        alert("Error del sistema: " + err.message);
        console.error("Detalle completo:", err);
    }
});

