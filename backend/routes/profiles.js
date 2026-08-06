import express from "express";
import sql from "../db.js";

const router = express.Router();

router.post("/load-perfil", async (req, res) => {
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
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
});

router.put("/perfil", async (req, res) => {
  try {
    const { id, nombre, aboutme, perfil_img } = req.body;

    if (!id) {
      return res.status(400).json({ ok: false, message: "ID de usuario requerido" });
    }

    const updated = await sql`
      UPDATE usuarios
      SET
        nombre = COALESCE(${nombre}, nombre),
        aboutme = COALESCE(${aboutme}, aboutme),
        perfil_img = COALESCE(${perfil_img}, perfil_img)
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    }

    return res.status(200).json({ ok: true, perfil: updated[0] });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
});

router.post("/agregar-punto", async (req, res) => {
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
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
});

export default router;
