import express from "express";
import sql from "../db.js";

const router = express.Router();

router.get("/regiones", async (req, res) => {
  const regiones = await sql`
    SELECT *
    FROM regiones
    ORDER BY region_name
  `;

  res.json({
    ok: true,
    regiones,
  });
});

export default router;
