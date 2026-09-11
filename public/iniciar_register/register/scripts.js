const form = document.getElementById("loginForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const correo = document.getElementById("email").value.trim();
  const nombres = document.getElementById("nombre").value.trim();
  const apellidos = document.getElementById("apellido").value.trim();
  const password = document.getElementById("password").value;
  const cpassword = document.getElementById("cpassword").value;

  if (!correo || !nombres || !apellidos || !password || !cpassword) {
    alert("Completa todos los campos");
    return;
  }

  if (password !== cpassword) {
    alert("Las contraseñas no coinciden");
    return;
  }

  const data = {
    accion: "crear",
    correo,
    nombres,
    apellidos,
    password
  };

  fetch("/accion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(res => res.json()).then(res => {
    if (!res.ok) {
      alert(res.error);
    } else {
      alert("Cuenta creada correctamente");
      window.location.href = "https://iniciar-sesion-109.netlify.app";
    }
  }).catch(err => console.error(err));
});

document.getElementById("Iniciar").onclick = () => {
  window.location.href = "https://iniciar-sesion-109.netlify.app";
};

const EYE_OPEN = `M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z`;
const EYE_CLOSED = `M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512 791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5zm-63.57-320.64L836 122.88a8 8 0 00-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 000 11.31L155.17 889a8 8 0 0011.31 0l712.15-712.12a8 8 0 000-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 00-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 01146.2-106.69L401.31 546.2A112 112 0 01396 512z`;

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const path = btn.querySelector(".eye-path");

  if (input.type === "password") {
    input.type = "text";
    path.setAttribute("d", EYE_OPEN);
    
  } else {
    input.type = "password";
    path.setAttribute("d", EYE_CLOSED);
  }
}
