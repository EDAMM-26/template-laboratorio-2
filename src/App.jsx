import { useRef, useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);

  // ─── Actividad 1 — Catálogo y vídeo activo ───────────────────────────────
  // TODO 1.1: declara los estados para el catálogo y el src del vídeo.
  //   const [catalog,  setCatalog]  = useState([]);
  //   const [videoSrc, setVideoSrc] = useState('/wingit.mp4');
  //
  // TODO 1.2: añade un useEffect que cargue /media-data.json y filtre
  //           solo los items con type === 'video'.

  // ─── Actividad 2 — Filtros simples ───────────────────────────────────────
  const [grayscale,  setGrayscale]  = useState(false);
  const [brightness, setBrightness] = useState(1); // 1 = sin cambio

  // ─── Actividad 3 — Umbralización ─────────────────────────────────────────
  const [binarize,   setBinarize]   = useState(false);
  const [threshold,  setThreshold]  = useState(128); // 0 – 255

  // ─── Actividad 4 — Flips ─────────────────────────────────────────────────
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // ─── Actividad 5 — Eliminar canal de color ────────────────────────────────
  // TODO 5: declara noRed, noGreen, noBlue (useState(false) para cada uno).

  // ─── Actividad 6 — Filtros con ctx.filter ────────────────────────────────
  // TODO 6: declara blur (useState(0)).

  // ─── Actividad 7 — Reset ─────────────────────────────────────────────────
  function handleReset() {
    // TODO 7: restaura todos los estados a su valor por defecto.
    setGrayscale(false);
    setBrightness(1);
    setBinarize(false);
    setThreshold(128);
    setFlipH(false);
    setFlipV(false);
    // setNoRed(false); setNoGreen(false); setNoBlue(false);
    // setBlur(0);
  }

  // ─── Bucle de renderizado ─────────────────────────────────────────────────
  useEffect(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // TODO Actividad 0: añade { willReadFrequently: true } aquí.
    // Esto mantiene el buffer de píxeles en RAM (CPU) y evita copias
    // costosas de VRAM → RAM en cada getImageData a 60 fps.
    const ctx = canvas.getContext('2d');
    let rafId;

    function render() {
      if (video.readyState < 2) {
        rafId = requestAnimationFrame(render);
        return;
      }

      // ── Paso 1: ctx.filter (Actividad 6) antes de drawImage ─────────────
      // TODO Actividad 6: aplica ctx.filter con la cantidad de blur.
      // ctx.filter = blur > 0 ? `blur(${blur}px)` : 'none';

      // ── Paso 2: Transformaciones geométricas (Actividad 4) ─────────────
      ctx.save();

      // TODO Actividad 4 — Flip horizontal:
      // if (flipH) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }

      // TODO Actividad 4 — Flip vertical:
      // if (flipV) { ctx.translate(0, canvas.height); ctx.scale(1, -1); }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Restaura el filtro de contexto tras drawImage
      ctx.filter = 'none';

      // ── Paso 3: Procesado de píxeles ─────────────────────────────────────
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data  = frame.data; // Uint8ClampedArray: [R,G,B,A, R,G,B,A, ...]

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        // data[i + 3] es Alpha — no se modifica

        // TODO Actividad 2 — Brillo:
        // Multiplica cada canal por el factor. >1 aclara, <1 oscurece.
        // Uint8ClampedArray recorta automáticamente a [0, 255].
        //
        // r = r * brightness;
        // g = g * brightness;
        // b = b * brightness;

        // TODO Actividad 2 — Escala de grises (B/N):
        // Luminancia perceptual ITU-R BT.601. Aplica tras el brillo.
        //
        // if (grayscale) {
        //   const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        //   r = lum; g = lum; b = lum;
        // }

        // TODO Actividad 3 — Umbralización:
        // Si binarize está activo, convierte el píxel a blanco (255)
        // o negro (0) según supere o no el umbral.
        //
        // if (binarize) {
        //   const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        //   const val = lum >= threshold ? 255 : 0;
        //   r = val; g = val; b = val;
        // }

        // TODO Actividad 5 — Eliminar canal de color:
        // Pone a 0 el canal seleccionado. Ejemplo: sin rojo → sólo G+B.
        //
        // if (noRed)   r = 0;
        // if (noGreen) g = 0;
        // if (noBlue)  b = 0;
        
        data[i]     = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }

      ctx.putImageData(frame, 0, 0);
      rafId = requestAnimationFrame(render);
    }

    function onLoadedMetadata() {
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    function onPlay()  { cancelAnimationFrame(rafId); render(); }
    function onPause() { cancelAnimationFrame(rafId); }

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play',           onPlay);
    video.addEventListener('pause',          onPause);

    if (!video.paused && video.readyState >= 2) render();

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play',           onPlay);
      video.removeEventListener('pause',          onPause);
    };
  // Añade aquí los estados de filtro que vayas declarando
  }, [grayscale, brightness, binarize, threshold, flipH, flipV]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>EDAMM — P2 — Aplicaciones Web de Manipulación Multimedia</h1>
      </header>

      {/* ── Actividad 1: selector de vídeo ─────────────────────────────── */}
      {/* TODO 1.2: <select> controlado con el catálogo.
               onChange → setVideoSrc + videoRef.current.load() */}

      <main className="panels">
        <div className="panel">
          <h2>Original</h2>
          <video
            ref={videoRef}
            src="/wingit.mp4"
            controls muted loop playsInline
            className="media-box"
          />
        </div>

        <div className="panel">
          <h2>Procesado</h2>
          <canvas ref={canvasRef} className="media-box" />
        </div>
      </main>

      <div className="controls">

        {/* Actividad 2 — Brillo */}
        <label className="control-row">
          <span className="control-label">Brillo</span>
          <input type="range" min="0" max="3" step="0.05"
            value={brightness} onChange={e => setBrightness(+e.target.value)} />
          <span className="control-value">{brightness.toFixed(2)}</span>
        </label>

        {/* Actividad 3 — Umbral de binarización */}
        {/* TODO 3: añade slider de threshold (0–255) — sólo visible si binarize activo */}

        {/* TODO Actividad 6: slider de blur (0–20 px) */}

        <div className="toggle-row">
          {/* Actividad 2 — Toggle B&N */}
          <button
            className={`btn-toggle${grayscale ? ' active' : ''}`}
            onClick={() => setGrayscale(v => !v)}
          >B/N</button>

          {/* Actividad 3 — Toggle umbralización */}
          <button
            className={`btn-toggle${binarize ? ' active' : ''}`}
            onClick={() => setBinarize(v => !v)}
          >Umbral</button>

          {/* TODO Actividad 4: botones Flip H y Flip V */}

          {/* TODO Actividad 5: botones Sin rojo / Sin verde / Sin azul */}
          
          {/* Actividad 7 — Reset */}
          <button className="btn-reset" onClick={handleReset}>Reset</button>
        </div>
      </div>
    </div>
  );
}
