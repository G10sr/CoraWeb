import express from "express";
import cors from "cors";
import "dotenv/config";
import sql from "./db.js";
import { createClient } from "pexels";

const app = express();
const pexels = createClient(process.env.PEXELS_KEY);

app.use(cors());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// =====================================================
// CACHE DIARIO PEXELS (1 request por día)
// =====================================================

let dailyImage = null;
let dailyDate = null;

async function getDailyImage() {
  const today = new Date().toISOString().split("T")[0];

  // Si ya tenemos imagen del día, la reutilizamos
  if (dailyImage && dailyDate === today) {
    return dailyImage;
  }

  const page = Math.floor(Math.random() * 100) + 1;

  const result = await pexels.photos.search({
    query: "nature",
    orientation: "landscape",
    per_page: 1,
    page,
  });

  if (!result.photos?.length) {
    throw new Error("No se encontraron imágenes en Pexels");
  }

  dailyImage = result.photos[0].src.large2x;
  dailyDate = today;

  console.log(`[PEXELS] Nueva imagen diaria cargada: ${today}`);

  return dailyImage;
}

// =====================================================
// ENDPOINT IMAGEN DIARIA
// =====================================================

app.get("/api/nature-image", async (req, res) => {
  try {
    const image = await getDailyImage();

    return res.status(200).json({
      ok: true,
      image,
    });
  } catch (err) {
    console.error("PEXELS ERROR:", err);

    return res.status(500).json({
      ok: false,
      message: "Error obteniendo imagen",
    });
  }
});

// =====================================================
// PERFIL USUARIO
// =====================================================

app.post("/api/load-perfil", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: "ID de usuario requerido",
      });
    }

    const usuario = await sql`
      SELECT *
      FROM usuarios
      WHERE id = ${id}
      LIMIT 1
    `;

    if (usuario.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      perfil: usuario[0],
    });
  } catch (err) {
    console.error("Error interno:", err);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
});

// =====================================================
// AGREGAR PUNTO
// =====================================================

app.post("/api/agregar-punto", async (req, res) => {
  try {
    const { id, puntoId } = req.body;

    if (!id || !puntoId) {
      return res.status(400).json({
        ok: false,
        message: "id y puntoId son requeridos",
      });
    }

    const usuario = await sql`
      UPDATE usuarios
      SET puntos_registrados = puntos_registrados || ARRAY[${puntoId}]
      WHERE id = ${id}
      RETURNING *
    `;

    if (usuario.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      perfil: usuario[0],
      message: "Punto agregado correctamente",
    });
  } catch (err) {
    console.error("Error interno:", err);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
});

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});