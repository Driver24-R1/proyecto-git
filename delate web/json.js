//para editar el poema
await fetch("/editar-poema", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    correo: "correo1@gmail.com",
    poemaId: 1,
    nuevoTitulo: "Título editado",
    nuevoTexto: "Texto editado del poema"
  })
});
