import express from "express";
import cors from "cors";
import "dotenv/config";
import sql from "./db.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

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

    console.log(
      `[LOAD-PERFIL] Usuario: ${usuario[0].nombre} (${usuario[0].id})`
    );

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

    console.log(
      `[AGREGAR-PUNTO] Usuario: ${usuario[0].nombre} - Punto: ${puntoId}`
    );

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});