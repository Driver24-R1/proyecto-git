document.addEventListener("DOMContentLoaded", () => {

  // ======================
  // 🔘 ELEMENTOS UI
  // ======================
  const btnSi = document.getElementById("btnSi");
  const btnNo = document.getElementById("btnNo");
  const textoNo = document.getElementById("texto-no");
  const audio = document.getElementById("audio");

  // ======================
  // 💔 MENSAJES NO
  // ======================
  const mensajesNo = [
    { msg: "Solo tu amor puede iluminar mis días ❤️", m: "Solo_Tu_Remastered_2011" },
    { msg: "Regresa cuando quieras 😽", m: "Afrodisiaco_-_Donde_esta_el_amor" },
    { msg: "Tal vez este poema aún no encontró tu corazón... 🌙", m: "Nuvole Bianche - Ludovico Einaudi" },
    { msg: "No pasa nada, las estrellas también tardan en brillar ✨", m: "Golden Hour - JVKE" },
    { msg: "Cada verso espera ser comprendido 📖", m: "River Flows In You - Yiruma" },
    { msg: "Quizás mañana estas palabras signifiquen algo más 💭", m: "Until I Found You - Stephen Sanchez" },
    { msg: "El viento se lleva mis versos 🍃", m: "Let Her Go - Passenger" },
    { msg: "A veces el amor también se escribe con silencios 🤍", m: "Experience - Ludovico Einaudi" },
    { msg: "Este poema seguirá aquí, esperándote 🌹", m: "A Thousand Years - Christina Perri" },
    { msg: "Las páginas no lloran, pero esta casi lo hace 💔", m: "Someone You Loved - Lewis Capaldi" },
    { msg: "Quizás aún no era el capítulo correcto 📚", m: "Photograph - Ed Sheeran" },
    { msg: "Aunque digas no, gracias por leer ✍️", m: "Perfect - Ed Sheeran" }
  ];

  // ======================
  // 🔘 BOTÓN SÍ
  // ======================
  btnSi.onclick = () => {
    audio.pause();
    window.location.href = "list/list.html";
  };

  // ======================
  // 🔘 BOTÓN NO
  // ======================
  btnNo.onclick = () => {
    const random = Math.floor(Math.random() * mensajesNo.length);
    const { msg, m } = mensajesNo[random];

    textoNo.textContent = msg;

    audio.pause();
    audio.currentTime = 0;
    audio.src = `./musicas/${m}.mp3`;

    audio.play().catch(err => console.log("Audio error:", err));
  };

  // ======================
  // 🟢 SUPABASE (CORRECTO)
  // ======================
  const supabaseUrl = "https://cgbwdcwfjrtjqmmstnrr.supabase.co";
  const supabaseKey = "sb_publishable_9q1kZWMdx-brKCUtUIZ5Cg_SRcno31d";

  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // ======================
  // 🧪 TEST CONEXIÓN (opcional)
  // ======================
  async function test() {
    const { data, error } = await supabase.from("poemas").select("*");

    if (error) {
      console.log("Supabase error:", error.message);
    } else {
      console.log("Conectado a Supabase:", data);
    }
  }

  test();

});
console.log(import.meta.env);
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);