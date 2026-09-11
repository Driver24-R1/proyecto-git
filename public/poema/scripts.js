const params = new URLSearchParams(window.location.search);
const data = params.get("data");
const poema = JSON.parse(decodeURIComponent(data));

async function mostrarPoema(poemaSeleccionado) {

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


  const titulo = document.getElementById("titulo-poema");
  const fecha = document.getElementById("fecha-poema");
  const texto = document.getElementById("texto-poema");
  const autor = document.getElementById("autor-poema")

  data.forEach((p) =>{
    if (poemaSeleccionado.id !== p.id) return;
    
    titulo.textContent = p.titulo;
    texto.textContent = p.contenido;
    autor.textContent = p.autor

    if (!p) {
      document.body.innerHTML =
        "<h2 style='color:white;text-align:center;margin-top:50px;'>No se seleccionó ningún poema</h2>";
      return;
    }

    if (p.fecha) {
      fecha.textContent = new Date(p.fecha).toLocaleDateString(
        "es-ES",
        {
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      );
    }
  })
}

mostrarPoema(poema);