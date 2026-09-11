const grid1 = document.getElementById('grid-poemas');
const grid2 = document.getElementById('lis-mis-poemas');
const inputBuscar = document.getElementById("buscar");
const sugerenciasBox = document.getElementById("sugerencias");

// ───────────── CARGAR POEMAS ─────────────
async function cargarPoemas() {
  try {
    if (!grid1) return;

    if (!window.client) {
      console.error("Supabase no inicializado");
      return;
    }

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
      .order("fecha_creacion", { ascending: false });

    if (error) {
      console.error("Error obteniendo poemas de Supabase:", error);
      return;
    }

    grid1.innerHTML = "";

    data.forEach((p) => {
      const card = document.createElement("div");
      card.className = "poema-card";
      console.log(p.id)

      const nombreAutor = p.usuarios
        ? (p.usuarios.apodo || p.usuarios.nombre || "Autor desconocido")
        : "Autor desconocido";

      card.textContent = `${p.titulo}\n${nombreAutor}`;

      card.onclick = () => {
        const poemaData = {
          id: p.id
        };

        const datosEncriptados = encodeURIComponent(
          JSON.stringify(poemaData)
        );
        
        window.location.href = `https://poema-p.netlify.app/index?data=${datosEncriptados}`;
      };

      grid1.appendChild(card);
    });
  } catch (err) {
    console.error("Error cargando poemas:", err);
  }
}

async function cargarUsuario() {
    try {
        if (!window.client) {
            console.error("Supabase no inicializado (client no existe)");
            return;
        }

        // ============================
        // RECIBIR SESIÓN DESDE LA URL
        // ============================
        const params = new URLSearchParams(window.location.search);

        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
            const { error } = await window.client.auth.setSession({
                access_token,
                refresh_token
            });

            if (error) {
                console.error("Error restaurando sesión:", error);
            } else {
                // Limpia la URL
                window.history.replaceState({}, "", window.location.pathname);
            }
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
            usuarioLogueado = session.user;

            let { data, error } = await window.client
                .from("usuarios")
                .select("nombre, apellidos")
                .eq("id", session.user.id)
                .maybeSingle();

            if (!data && !error) {
                await new Promise(resolve => setTimeout(resolve, 800));

                const { data: reintento } = await window.client
                    .from("usuarios")
                    .select("nombre, apellidos")
                    .eq("id", session.user.id)
                    .maybeSingle();

                if (reintento) {
                    data = reintento;
                } else {
                    console.warn("La cuenta no existe en la base de datos.");

                    await window.client.auth.signOut();

                    window.location.reload();
                    return;
                }
            }

            let iniciales = "U";

            if (data) {
                const inicialNombre = data.nombre
                    ? data.nombre.charAt(0).toUpperCase()
                    : "";

                const inicialApellido = data.apellidos
                    ? data.apellidos.charAt(0).toUpperCase()
                    : "";

                iniciales = (inicialNombre) || "U";

            } else if (session.user.email) {
                iniciales = session.user.email.charAt(0).toUpperCase();
            }

            userBtn.textContent = iniciales;

            userBtn.onclick = () => {
                window.location.href = "../perfil/perfil.html";
            };

            const crearBtn = document.getElementById("crear");
            crearBtn.onclick = () => {
              window.location.href = "https://crear-poemas.netlify.app";
            };

        } else {

            usuarioLogueado = null;

            userBtn.textContent = "Acceder";

            userBtn.onclick = () => {
                window.location.href = "https://iniciar-sesion-109.netlify.app/";
            };
        }

    } catch (err) {
        console.error("Error cargando usuario:", err);
    }
}
/*
// ───────────── SESIÓN / MENÚ USUARIO ─────────────
fetch("/session").then(res => res.json()).then(data => {
  const userBtn = document.getElementById("user-btn");
  const crearBtn = document.getElementById("crear");
  const wrapper = userBtn.closest(".user-wrapper");
 
  if (data.logueado) {
    userBtn.textContent = data.iniciales;
    userBtn.title = "Mi cuenta";
    wrapper.classList.add("logueado");

    crearBtn.onclick = () => {
      window.location.href = "/crear/albun.html";
    };
  } else {
    userBtn.textContent = "Acceder";
    userBtn.onclick = () => {
      window.location.href = "/iniciar_register/iniciar/index.html";
    };
  }

  if (data.logueado) {
    localStorage.setItem("UserCorreo", data.correo);
  }
});*/

cargarUsuario()
cargarPoemas();


/*
async function cargarPoemas() {
  const respuesta = await fetch("/info");
  const data = await respuesta.json();
  if (!grid1) return; // 👈 clave

  POEMAS = [];
  grid1.innerHTML = "";

  Object.keys(data).forEach(correo => {
    const { nombres, Poemas } = data[correo];
    if (!Poemas || Poemas.length === 0) return;

    Poemas.forEach(d => {
      POEMAS.push({
        d,         // poema completo
        nombres    // autor
      });
    });
  });

  pintarPoemas(POEMAS, grid1);
}

// ───────────── PINTAR POEMAS EN EL GRID ─────────────
function pintarPoemas(lista, grid) {
  console.log(lista)
  if (!grid) return; // 👈 clave

  grid.innerHTML = "";

  if (lista.length === 0) {
    grid.innerHTML = "<p>No se encontraron poemas</p>";
    return;
  }

  lista.forEach(item => {
    const { d, nombres } = item;

    const card = document.createElement('div');
    card.className = 'poema-card';
    card.id = d.name;

    card.innerHTML = `
      <h3>${d.name}</h3>
      <p><strong>${nombres}</strong></p>
      <p><small>${d.fecha}</small></p>
    `;

    card.onclick = () => {
      localStorage.setItem(
        "poemaSeleccionado",
        JSON.stringify({ d, nombres })
      );
      window.location.href = "/poema/poema.html";
    };

    grid.appendChild(card);
  });
}

// ───────────── BUSCADOR TIPO YOUTUBE ─────────────
inputBuscar.addEventListener("input", () => {
  const texto = inputBuscar.value.toLowerCase().trim();
  sugerenciasBox.innerHTML = "";

  if (texto === "") {
    sugerenciasBox.style.display = "none";
    pintarPoemas(POEMAS, 'poema-card');
    return;
  }

  const resultados = POEMAS.filter(item =>
    item.d.name.toLowerCase().includes(texto) ||
    item.nombres.toLowerCase().includes(texto)
  ).slice(0, 6); // máximo 6 sugerencias como YouTube

  if (resultados.length === 0) {
    sugerenciasBox.style.display = "none";
    return;
  }

  resultados.forEach(item => {
    const div = document.createElement("div");
    div.className = "sugerencia";

    div.innerHTML = `
      <strong>${item.d.name} - ${item.nombres}</strong><br>
    `;

    div.onclick = () => {
      localStorage.setItem(
        "poemaSeleccionado",
        JSON.stringify({ d: item.d, nombres: item.nombres })
      );
      window.location.href = "/poema/poema.html";
    };

    document.getElementById("shear-btn").onclick = () => {
      
      if (resultados.length === 0) {
        sugerenciasBox.style.display = "none";
        return;
      }

      pintarPoemas(resultados)
    }

    sugerenciasBox.appendChild(div);
  });

  sugerenciasBox.style.display = "block";
});

// ocultar sugerencias al hacer click fuera
document.addEventListener("click", (e) => {
  if (!e.target.closest(".center")) {
    sugerenciasBox.style.display = "none";
  }
});



// ───────────── SESIÓN / MENÚ USUARIO ─────────────
fetch("/session").then(res => res.json()).then(data => {
  const userBtn = document.getElementById("user-btn");
  const crearBtn = document.getElementById("crear");
  const wrapper = userBtn.closest(".user-wrapper");
 
  if (data.logueado) {
    userBtn.textContent = data.iniciales;
    userBtn.title = "Mi cuenta";
    wrapper.classList.add("logueado");

    crearBtn.onclick = () => {
      window.location.href = "/crear/albun.html";
    };
  } else {
    userBtn.textContent = "Acceder";
    userBtn.onclick = () => {
      window.location.href = "/iniciar_register/iniciar/index.html";
    };
  }

  if (data.logueado) {
    localStorage.setItem("UserCorreo", data.correo);
  }
});

// ───────────── LOGOUT ─────────────
document.getElementById("cerrar").onclick = () => {
  fetch("/logout", { method: "POST" })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        window.location.href = "/index.html";
      } else {
        alert("Error al cerrar sesión");
      }
    });
};




// ───────────── POEMAS USER ─────────────
async function infoUser() {
  const respuesta = await fetch("/info-user");
  return await respuesta.json();
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("mis-poemas");
  if (!btn) return; // 👈 no estamos en index.html

  btn.onclick = () => {
    window.location.href = "/mi_poemas/index.html";
  };
});

document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("lis-mis-poemas");
  if (!contenedor) return;

  const user = await infoUser();

  POEMAS = [];
  
  POEMAS = user.Poemas.map(p => ({ 
    d: p,                 // 👈 EXACTO lo que pintarPoemas espera
    nombres: user.nombres // 👈 autor
  }));

  pintarPoemas(POEMAS, grid2);
});*/