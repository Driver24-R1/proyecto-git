import yt_dlp
import os

CARPETA = "web/musicas"

if not os.path.exists(CARPETA):
    os.makedirs(CARPETA)

url = input("Pega el link de YouTube: ")

opciones = {
    'format': 'bestaudio/best',
    'outtmpl': f'{CARPETA}/%(title)s.%(ext)s',
    'noplaylist': True,

    # 🔥 esto evita duplicados por link/video
    'download_archive': f'{CARPETA}/descargados.txt',

    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],

    'restrictfilenames': True,
}

with yt_dlp.YoutubeDL(opciones) as ydl:
    # 🔍 obtener info del video
    info = ydl.extract_info(url, download=False)
    video_id = info.get("id")

    # 📂 archivo de registro
    archivo_ids = f"{CARPETA}/descargados.txt"

    # comprobar si ya existe
    if os.path.exists(archivo_ids):
        with open(archivo_ids, "r") as f:
            if video_id in f.read():
                print("⚠️ Esa música ya fue descargada anteriormente.")
                exit()

    # si no existe → descargar
    ydl.download([url])
    print("\n✅ Música descargada correctamente 🎵")