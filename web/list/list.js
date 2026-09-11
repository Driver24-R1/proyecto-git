const contenedor = document.getElementById("contenedor-poemas");
const btnCrear = document.getElementById("crear");

let poemas = [];
let usuarioLogueado = null; // Guarda el estado del usuario globalmente


async function cargarPoemas() {
  try {
    if (!contenedor) return; // Evita errores si no se encuentra el contenedor
    if (!window.client) {
      console.error("Supabase no inicializado");
      return;
    }

    // Consultamos la tabla poemas y traemos el nombre/apellidos de su autor
    const { data, error } = await window.client
      .from("poemas")
      .select(`
        id,
        titulo,
        contenido,
        musica,
        fecha_creacion,
        usuarios (
          nombre,
          apellidos,
          apodo
        )
      `)
            .order('fecha_creacion', { ascending: false }); // Los más recientes primero

        if (error) {
            console.error("Error obteniendo poemas de Supabase:", error);
            return;
        }

        poemas = data;
        contenedor.innerHTML = ""; // Evita duplicados

        poemas.forEach((p) => {
            const card = document.createElement("div");
            card.className = "card";
            
            // Construimos el nombre del autor desde la relación de Supabase
            const nombreAutor = p.usuarios 
                ? `${p.usuarios.apodo || (p.usuarios.nombre)}`.trim() 
                : "Autor desconocido";

            card.textContent = `${p.titulo}\n${nombreAutor}`;

            card.onclick = () => {
                // Estructuramos el objeto para que tu archivo text.html siga funcionando igual
                const poemaData = {
                    id: p.id,
                    titulo: p.titulo,
                    contenido: p.contenido,
                    musica: p.musica,
                    fecha: p.fecha_creacion,
                    autor: nombreAutor
                };

                localStorage.setItem(
                    "poemaSeleccionado",
                    JSON.stringify(poemaData)
                );

                window.location.href = "../text/text.html";
            };

            contenedor.appendChild(card);
        });

    } catch (err) {
        console.error("Error cargando poemas:", err);
    }
}

/* -----------------------------
    CARGAR USUARIO (SUPABASE)
------------------------------*/
async function cargarUsuario() {
    try {
        if (!window.client) {
            console.error("Supabase no inicializado (client no existe)");
            return;
        }

        const userBtn = document.getElementById("user-btn");
        if (!userBtn) {
            console.error("No se encontró el elemento con ID 'user-btn'");
            return;
        }

        const { data: sessionData, error: sessionError } =
            await window.client.auth.getSession();

        if (sessionError) {
            console.error(sessionError);
            return;
        }

        const session = sessionData.session;

        /* ---------------- LOGUEADO ---------------- */
        if (session) {
            usuarioLogueado = session.user; // Guardamos la sesión activa globalmente

            // 1. Intentamos buscar al usuario en la tabla pública
            let { data, error } = await window.client
                .from("usuarios")
                .select("nombre, apellidos")
                .eq("id", session.user.id)
                .maybeSingle(); // evita que falle si devuelve cero filas

            // 2. 🔥 RESPALDO AUTOMÁTICO CONTROLADO (UBICACIÓN CORREGIDA)
            if (!data && !error) {
                // Esperamos un momento por si la base de datos está procesando el registro real
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Volvemos a preguntar si ya existen sus datos reales
                const { data: reintento } = await window.client
                    .from("usuarios")
                    .select("nombre, apellidos")
                    .eq("id", session.user.id)
                    .maybeSingle();

                if (reintento) {
                    data = reintento;
                } else {
                    // 🔥 SI EL USUARIO NO EXISTE (FUE BORRADO), LO EXPULSAMOS Y LIMPIAMOS EL DISPOSITIVO
                    console.warn("La cuenta no existe en la base de datos. Cerrando sesión en el dispositivo...");
                    
                    // Borra el token local guardado en el celular/computadora del usuario
                    await window.client.auth.signOut(); 
                    
                    // Refresca la página para limpiar la interfaz por completo
                    window.location.reload(); 
                    return;
                }
            }

            // 3. Calculamos las iniciales con los datos que tengamos
            let iniciales = "U";
            if (data) {
                const inicialNombre = data.nombre ? data.nombre.charAt(0).toUpperCase() : "";
                const inicialApellido = data.apellidos ? data.apellidos.charAt(0).toUpperCase() : "";
                iniciales = (inicialNombre + inicialApellido) || "U";
            } else if (session.user.email) {
                iniciales = session.user.email.charAt(0).toUpperCase();
            }
            
            // Cambiamos el texto de "Acceder" por las iniciales reales del perfil
            userBtn.textContent = iniciales;

            userBtn.onclick = () => {
                window.location.href = "../perfil/perfil.html";
            };

        }

        /* ---------------- NO LOGUEADO ---------------- */
        else {
            usuarioLogueado = null;
            userBtn.textContent = "Acceder";

            userBtn.onclick = () => {
                window.location.href = "../acces/acces.html";
            };
        }

    } catch (err) {
        console.error("Error cargando usuario:", err);
    }
}

if (btnCrear) {
  btnCrear.onclick = () => {
    if (usuarioLogueado) {
      window.location.href = "../crear/crear.html"; 
    } else {
      alert("Debes iniciar sesión para poder crear un poema.");
      window.location.href = "../acces/acces.html";
    }
  };
}

/*INICIO*/
cargarPoemas();
cargarUsuario();
