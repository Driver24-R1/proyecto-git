const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.static("public"));

app.use(session({
  secret: "poemas-secret-key",
  resave: false,
  saveUninitialized: false
}));

const RUTA_INFO = path.join(__dirname, "info.json");

function leerData() {
  if (!fs.existsSync(RUTA_INFO)) return {};
  return JSON.parse(fs.readFileSync(RUTA_INFO, "utf8"));
}

function guardarData(data) {
  fs.writeFileSync(RUTA_INFO, JSON.stringify(data, null, 2));
}

app.get("/info", (req, res) => {
  if (!fs.existsSync(RUTA_INFO)) {
    return res.json({});
  }

  const data = JSON.parse(fs.readFileSync(RUTA_INFO, "utf8"));
  res.json(data);
});

// ───── ACCIONES ─────
app.post("/accion", (req, res) => {
  const data = leerData();
  const { accion } = req.body;
  const hoy = new Date().toISOString().split("T")[0];

  // ───── REGISTRO ─────
  if (accion === "crear") {
    const { correo, nombres, apellidos, password } = req.body;

    if (!correo || !nombres || !apellidos || !password)
      return res.json({ ok: false, error: "Datos incompletos" });

    if (data[correo])
      return res.json({ ok: false, error: "Usuario ya existe" });

    const iniciales =
      nombres.charAt(0).toUpperCase() +
      apellidos.charAt(0).toUpperCase();

    data[correo] = {
      nombres,
      apellidos,
      password,
      iniciales,
      fechaRegistro: hoy,
      Poemas: []
    };

    guardarData(data);
    return res.json({ ok: true });
  }

  // ───── LOGIN ─────
  if (accion === "login") {
    const { correo, password } = req.body;

    if (!data[correo])
      return res.json({ ok: false, error: "Usuario no existe" });

    if (data[correo].password !== password)
      return res.json({ ok: false, error: "Contraseña incorrecta" });

    req.session.user = {
      correo,
      iniciales: data[correo].iniciales
    };

    return res.json({ ok: true });
  }

  // ───── POEMA ─────
  if (accion === "poema") {
    if (!req.session.user)
      return res.json({ ok: false, error: "No autenticado" });

    const { name, text } = req.body;
    const correo = req.session.user.correo;

    if (!name || !text)
      return res.json({ ok: false, error: "Poema incompleto" });

    data[correo].Poemas.push({ name, text, fecha: hoy });
    guardarData(data);

    return res.json({ ok: true });
  }

  res.json({ ok: false, error: "Acción inválida" });
});

// ───── SESIÓN ─────
app.get("/session", (req, res) => {
  if (!req.session.user)
    return res.json({ logueado: false });

  res.json({
    logueado: true,
    iniciales: req.session.user.iniciales
  });
});

// ───── LOGOUT ─────
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log("Servidor activo en http://localhost:" + PORT);
});
// ───── INFO USER ─────
app.get("/info-user", (req, res) => {
  if (!req.session.user)
    return res.json({ ok: false, error: "No autenticado" });

  const data = leerData();
  const correo = req.session.user.correo;

  if (!data[correo])
    return res.json({ ok: false, error: "Usuario no encontrado" });

  res.json({
    correo,
    nombres: data[correo].nombres,
    apellidos: data[correo].apellidos,
    fechaRegistro: data[correo].fechaRegistro,
    Poemas: data[correo].Poemas
  });
});

app.put("/editar-poema", (req, res) => {
  const { correo, poemaId, nuevoTitulo, nuevoTexto } = req.body;

  if (!data[correo]) {
    return res.status(404).json({ error: "Usuario no existe" });
  }

  const poema = data[correo].Poemas.find(p => p.id === poemaId);

  if (!poema) {
    return res.status(404).json({ error: "Poema no encontrado" });
  }

  if (nuevoTitulo !== undefined) poema.titulo = nuevoTitulo;
  if (nuevoTexto !== undefined) poema.texto = nuevoTexto;

  res.json({ ok: true, poema });
});


app.put("/editar-usuario", (req, res) => {
  const { correo, nuevosNombres, nuevo } = req.body;

  if (!data[correo]) {
    return res.status(404).json({ error: "Usuario no existe" });
  }

  if (nuevosNombres !== undefined) {
    data[correo].nombres = nuevosNombres;
  }

  res.json({ ok: true, usuario: data[correo] });
});

