const poema = JSON.parse(localStorage.getItem("poemaSeleccionado"));

const audio = document.getElementById("audio");
const cerrar = document.getElementById("cerrar");
const ytContenedor = document.getElementById("contenedor-youtube");

// ============================
// BOTÓN CERRAR
// ============================
if (cerrar) {
  cerrar.onclick = () => {
    if (audio) audio.pause();

    if (ytContenedor) {
      ytContenedor.innerHTML = "";
    }

    window.history.back();
  };
}

// ============================
// OBTENER ID DE YOUTUBE
// ============================
function obtenerVideoId(url) {
  try {
    const u = new URL(url);

    // youtu.be
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.substring(1);
    }

    // youtube.com/watch?v=
    if (u.searchParams.has("v")) {
      return u.searchParams.get("v");
    }

    // youtube.com/shorts/
    if (u.pathname.startsWith("/shorts/")) {
      return u.pathname.split("/shorts/")[1];
    }

    // youtube.com/embed/
    if (u.pathname.startsWith("/embed/")) {
      return u.pathname.split("/embed/")[1];
    }

    return "";
  } catch (e) {
    return "";
  }
}

// ============================
// MOSTRAR POEMA
// ============================
async function mostrarPoema(poemaSeleccionado) {

  if (!poemaSeleccionado) {
    document.body.innerHTML =
      "<h2 style='color:white;text-align:center;margin-top:50px;'>No se seleccionó ningún poema</h2>";
    return;
  }

  const titulo = document.getElementById("titulo-poema");
  const fecha = document.getElementById("fecha-poema");
  const texto = document.getElementById("texto-poema");
  const autor = document.getElementById("autor-poema")

  titulo.textContent = poemaSeleccionado.titulo;
  texto.textContent = poemaSeleccionado.contenido;
  autor.textContent = poemaSeleccionado.autor

  if (poemaSeleccionado.fecha) {
    fecha.textContent = new Date(poemaSeleccionado.fecha).toLocaleDateString(
      "es-ES",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );
  }

  // ============================
  // MÚSICA
  // ============================

  if (!poemaSeleccionado.musica) return;

  const ruta = poemaSeleccionado.musica.trim();

  // Detener lo anterior
  if (audio) audio.pause();
  if (ytContenedor) ytContenedor.innerHTML = "";

  // ---------------------------------
  // ES YOUTUBE
  // ---------------------------------

  // ---------------------------------
// ES YOUTUBE
// ---------------------------------

if (ruta.includes("youtube.com") || ruta.includes("youtu.be")) {

    const videoId = obtenerVideoId(ruta);

    if (!videoId) {
        console.error("No se pudo obtener el ID del video.");
        return;
    }

    console.log("Video detectado:", videoId);

    ytContenedor.innerHTML = "";

    const iframe = document.createElement("iframe");

    iframe.width = "1";
    iframe.height = "1";
    iframe.allow = "autoplay; encrypted-media";
    iframe.allowFullscreen = true;

    iframe.src =
        `https://www.youtube.com/embed/${videoId}?` +
        `autoplay=1` +
        `&mute=0` +
        `&loop=1` +
        `&playlist=${videoId}` +
        `&playsinline=1` +
        `&rel=0` +
        `&enablejsapi=1`;

    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.border = "0";
    iframe.style.width = "1px";
    iframe.style.height = "1px";

    ytContenedor.appendChild(iframe);

    const iniciar = () => {
        iframe.contentWindow.postMessage(
            JSON.stringify({
                event: "command",
                func: "playVideo",
                args: []
            }),
            "*"
        );

        document.removeEventListener("click", iniciar);
    };

    document.addEventListener("click", iniciar);

    return;
}

  // ---------------------------------
  // MP3 ONLINE
  // ---------------------------------

  if (
    ruta.startsWith("http://") ||
    ruta.startsWith("https://")
  ) {

    audio.src = ruta;
  }

  // ---------------------------------
  // ARCHIVO LOCAL
  // ---------------------------------

  else {

    const rutaLimpia = ruta.replace(/^(\.\.\/|\.\/|\/)/, "");

    audio.src = "../" + rutaLimpia;
  }

  audio.loop = true;

  audio.load();

  audio.play().catch(() => {

    console.log("Esperando interacción del usuario...");

    const iniciar = () => {
      audio.play();
      document.removeEventListener("click", iniciar);
    };

    document.addEventListener("click", iniciar);
  });

}

mostrarPoema(poema);