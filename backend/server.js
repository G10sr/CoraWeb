import express from "express";
import cors from "cors";
import postgres from "postgres";
import "dotenv/config";

const sql = postgres(process.env.DATABASE_URL);
const app = express();

app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));


/* ─────────────────────────────────────────────
   LOGIN ADMIN
───────────────────────────────────────────── */

app.post("/api/admin-login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña requeridos" });
  }

  try {
    const admin = await sql`
      SELECT "ID", "name_admin", "correo", "password"
      FROM "adminAccount"
      WHERE "correo" = ${email}
    `;

    if (!admin.length) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = admin[0];

    if (user.password !== password) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      success: true,
      admin: {
        id: user.ID,
        name: user.name_admin,
        email: user.correo,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});
