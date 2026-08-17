import express from "express";
import sql from "../db.js";

const router = express.Router();

router.get("/reportes/:id/comentarios", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ ok: false, message: "reporte id requerido" });
    }

    const comentarios = await sql`
      SELECT c.id, c.reporte_id, c.usuario_id, c.comentario, c.fecha_creacion, u.nombre AS usuario_nombre
      FROM comentarios c
      LEFT JOIN usuarios u ON u.id = c.usuario_id
      WHERE c.reporte_id = ${id}
      ORDER BY c.fecha_creacion DESC
    `;

    return res.status(200).json({ ok: true, comentarios });
  } catch (error) {
    console.error("GET comentarios error:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
});

router.post("/reportes/:id/comentarios", async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId, comentario } = req.body;

    if (!id || !usuarioId || !comentario) {
      return res.status(400).json({ ok: false, message: "reporte id, usuarioId y comentario son requeridos" });
    }

    const usuarioExist = await sql`
      SELECT id, nombre FROM usuarios WHERE id = ${usuarioId} LIMIT 1
    `;
    if (usuarioExist.length === 0) {
      return res.status(400).json({ ok: false, message: "Usuario no encontrado. Verifica usuarioId." });
    }

    const inserted = await sql`
      INSERT INTO comentarios (reporte_id, usuario_id, comentario)
      VALUES (${id}, ${usuarioId}, ${comentario})
      RETURNING *
    `;

    const usuario = await sql`
      SELECT nombre FROM usuarios WHERE id = ${usuarioId} LIMIT 1
    `;

    const nuevo = inserted[0];
    const usuario_nombre = usuario[0]?.nombre || "Anonimo";

    const responseObj = {
      id: nuevo.id,
      reporte_id: nuevo.reporte_id,
      usuario_id: nuevo.usuario_id,
      comentario: nuevo.comentario,
      fecha_creacion: nuevo.fecha_creacion,
      usuario_nombre,
    };

    return res.status(201).json({ ok: true, comentario: responseObj });
  } catch (error) {
    console.error("POST comentarios error:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
});

export default router;
