import express from "express";
import { createClient } from "pexels";

const router = express.Router();

const pexels = process.env.PEXELS_KEY ? createClient(process.env.PEXELS_KEY) : null;

let dailyImage = null;
let dailyDate = null;

async function getDailyImage() {
  const today = new Date().toISOString().split("T")[0];

  if (dailyImage && dailyDate === today) {
    return dailyImage;
  }

  if (!pexels) {
    throw new Error("PEXELS_KEY no configurada");
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

  return dailyImage;
}

router.get("/nature-image", async (req, res) => {
  try {
    const image = await getDailyImage();

    return res.status(200).json({ ok: true, image });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Error obteniendo imagen",
    });
  }
});

export default router;
