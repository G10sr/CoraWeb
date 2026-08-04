import express from "express";
import sql from "../db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email y contraseña requeridos",
      });
    }

    const usuario = await sql`
      SELECT id, rol_id
      FROM usuarios
      WHERE correo = ${email} AND password = ${password}
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
      id: usuario[0].id,
      rol: usuario[0].rol_id,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
});

export default router;
