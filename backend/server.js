import express from "express";
import cors from "cors";
import "dotenv/config";
import sql from "./db.js";
import { createClient } from "pexels";

const app = express();
const pexels = createClient(process.env.PEXELS_KEY);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

async function getAuthenticatedAdmin(req, res) {
  const usuarioId = req.query?.usuarioId ?? req.body?.usuarioId ?? req.body?.id ?? null;

  if (!usuarioId) {
    res.status(401).json({ ok: false, message: "Se requiere usuario autenticado" });
    return null;
  }

  const [adminUser] = await sql`
    SELECT id, rol_id, nombre, correo
    FROM usuarios
    WHERE id::text = ${String(usuarioId)}
    LIMIT 1
  `;

  if (!adminUser) {
    res.status(401).json({ ok: false, message: "Usuario no encontrado" });
    return null;
  }

  if (adminUser.rol_id !== 2) {
    res.status(403).json({ ok: false, message: "Solo administradores pueden realizar esta acción" });
    return null;
  }

  return adminUser;
}

async function usuariosTableHasVerifiedColumn() {
  try {
    const result = await sql`
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'usuarios'
        AND column_name = 'verificado'
      LIMIT 1
    `;

    return result.length > 0;
  } catch {
    return false;
  }
}

function normalizeAdminUser(user, fallbackVerified = true) {
  return {
    ...user,
    verificado: typeof user?.verificado === "boolean" ? user.verificado : fallbackVerified,
  };
}

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
      WHERE id::text = ${String(id)}
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

// =====================================================
// ACTUALIZAR PERFIL (nombre, aboutme, perfil_img)
// =====================================================

app.put("/api/perfil", async (req, res) => {
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
      WHERE id::text = ${String(id)}
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
      WHERE id::text = ${String(id)}
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

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, usuarioId, createdByAdmin, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Usuario, correo y contraseña requeridos",
      });
    }

    if (createdByAdmin) {
      const adminUser = await sql`
        SELECT id
        FROM usuarios
        WHERE id = ${usuarioId} AND rol_id = 2
        LIMIT 1
      `;

      if (adminUser.length === 0) {
        return res.status(403).json({ ok: false, message: "Solo administradores pueden crear usuarios" });
      }
    }

    const existingUser = await sql`
      SELECT id
      FROM usuarios
      WHERE correo = ${email}
      LIMIT 1
    `;

    if (existingUser.length > 0) {
      return res.status(409).json({
        ok: false,
        message: "Ya existe una cuenta con ese correo",
      });
    }

    const existingName = await sql`
      SELECT id
      FROM usuarios
      WHERE nombre = ${username}
      LIMIT 1
    `;

    if (existingName.length > 0) {
      return res.status(409).json({
        ok: false,
        message: "Ese nombre de usuario ya está en uso",
      });
    }

    const roleId = createdByAdmin ? (role === 2 ? 2 : 1) : 1;

    const inserted = await sql`
      INSERT INTO usuarios (nombre, correo, password, rol_id, aboutme, perfil_img)
      VALUES (${username}, ${email}, ${password}, ${roleId}, '', NULL)
      RETURNING id, rol_id
    `;

    return res.status(201).json({
      ok: true,
      id: inserted[0].id,
      rol: inserted[0].rol_id,
    });
  } catch (err) {
    console.error("Error creando usuario:", err);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
});

app.post("/api/login", async (req, res) => {
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



app.get("/api/reportes", async (req, res) => {
  try {
    const { usuarioId, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(10, parseInt(limit) || 50));
    const offset = (pageNum - 1) * limitNum;

    const reportesRaw = await sql`
      SELECT
        r.id,
        r.cantidad,
        r.cercania_agua,
        r.clasificacion_material,
        r.fecha_creacion,
        r.latitud,
        r.longitud,
        r.pendiente,
        r.region_id,
        r.reportado_por,
        r.riesgo_contaminacion,
        r.tipo_residuo,
        r.imagenes,
        r.verificado,
        u.nombre AS reportado_por_nombre,
        reg.region_name
      FROM reportes r
      INNER JOIN usuarios u
        ON u.id::text = r.reportado_por::text
      LEFT JOIN regiones reg
        ON reg.id = r.region_id
      ${usuarioId ? sql`WHERE r.reportado_por::text = ${String(usuarioId)}` : sql``}
      ORDER BY r.fecha_creacion DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM reportes r
      ${usuarioId ? sql`WHERE r.reportado_por::text = ${String(usuarioId)}` : sql``}
    `;
    const total = countResult[0]?.total || 0;

    const reportes = reportesRaw.map((reporte) => ({
      id: reporte.id,
      cantidad: reporte.cantidad,
      cercania_agua: reporte.cercania_agua,
      clasificacion_material: reporte.clasificacion_material,
      fecha_creacion: reporte.fecha_creacion ? new Date(reporte.fecha_creacion).toISOString() : null,
      latitud: reporte.latitud,
      longitud: reporte.longitud,
      pendiente: reporte.pendiente,
      region_id: reporte.region_id != null ? reporte.region_id.toString() : null,
      reportado_por: reporte.reportado_por_nombre || reporte.reportado_por,
      riesgo_contaminacion: reporte.riesgo_contaminacion,
      tipo_residuo: reporte.tipo_residuo,
      imagenes: reporte.imagenes || [],
      verificado: reporte.verificado,
      region_name: reporte.region_name,
    }));

    const totalPages = Math.ceil(total / limitNum);
    return res.json({
      ok: true,
      reportes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages,
        hasMore: pageNum < totalPages,
      },
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
});
app.post("/api/reportes", async (req, res) => {
  try {
    const {
      usuarioId,
      regionName,
      wasteType,
      amount,
      slope,
      waterProximity,
      riskLevel,
      materialType,
      latitud,
      longitud,
      imagenes = [],
    } = req.body;

    if (!usuarioId || !amount || latitud == null || longitud == null) {
      return res.status(400).json({
        ok: false,
        message: "usuarioId, amount, latitud y longitud son requeridos",
      });
    }

    if (!Array.isArray(imagenes)) {
      return res.status(400).json({ ok: false, message: "imagenes debe ser un arreglo" });
    }

    if (imagenes.length > 3) {
      return res.status(400).json({ ok: false, message: "Solo se permiten hasta 3 imágenes." });
    }

    let regionId = null;
    if (regionName) {
      const region = await sql`
        SELECT id
        FROM regiones
        WHERE region_name = ${regionName}
        LIMIT 1
      `;

      if (region.length > 0) {
        regionId = region[0].id;
      } else {
        const insertedRegion = await sql`
          INSERT INTO regiones (region_name)
          VALUES (${regionName})
          RETURNING id
        `;
        regionId = insertedRegion[0]?.id;
      }
    }

    const nuevoReporte = await sql`
      INSERT INTO reportes (
        cantidad,
        cercania_agua,
        clasificacion_material,
        latitud,
        longitud,
        pendiente,
        region_id,
        reportado_por,
        riesgo_contaminacion,
        tipo_residuo,
        imagenes
      ) VALUES (
        ${amount},
        ${waterProximity},
        ${materialType},
        ${latitud},
        ${longitud},
        ${slope},
        ${regionId},
        ${usuarioId},
        ${riskLevel},
        ${wasteType},
        ${imagenes}
      )
      RETURNING *
    `;

    return res.status(201).json({
      ok: true,
      reporte: nuevoReporte[0],
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
});

app.delete("/api/reportes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.body;

    if (!id || !usuarioId) {
      return res.status(400).json({
        ok: false,
        message: "id y usuarioId son requeridos",
      });
    }

    const deleted = await sql`
      DELETE FROM reportes
      WHERE id::text = ${String(id)} AND reportado_por::text = ${String(usuarioId)}
      RETURNING *
    `;

    if (deleted.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Reporte no encontrado o no autorizado",
      });
    }

    return res.status(200).json({
      ok: true,
      reporte: deleted[0],
    });
  } catch (error) {
    console.error("Error eliminando reporte:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
});

app.get("/api/admin/verify", async (req, res) => {
  try {
    const adminUser = await getAuthenticatedAdmin(req, res);
    if (!adminUser) return;

    return res.json({
      ok: true,
      admin: true,
      user: {
        id: adminUser.id,
        rol_id: adminUser.rol_id,
        nombre: adminUser.nombre,
        correo: adminUser.correo,
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
});

app.get("/api/admin/reportes", async (req, res) => {
  try {
    const adminUser = await getAuthenticatedAdmin(req, res);
    if (!adminUser) return;

    const reportesRaw = await sql`
      SELECT r.*, u.nombre AS reportado_por_nombre, reg.region_name
      FROM reportes r
      LEFT JOIN usuarios u ON u.id = r.reportado_por
      LEFT JOIN regiones reg ON reg.id = r.region_id
      ORDER BY r.fecha_creacion DESC
    `;

    return res.json({
      ok: true,
      reportes: reportesRaw.map((reporte) => ({
        ...reporte,
        reportado_por: reporte.reportado_por_nombre || reporte.reportado_por,
        imagenes: reporte.imagenes || [],
      })),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
});

app.put("/api/admin/reportes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, tipo_residuo, pendiente, cercania_agua, riesgo_contaminacion, clasificacion_material, region_name, latitud, longitud } = req.body;

    const adminUser = await getAuthenticatedAdmin(req, res);
    if (!adminUser) return;

    let regionId = null;
    if (region_name) {
      const region = await sql`
        SELECT id FROM regiones WHERE region_name = ${region_name} LIMIT 1
      `;

      if (region.length > 0) {
        regionId = region[0].id;
      } else {
        const insertedRegion = await sql`
          INSERT INTO regiones (region_name) VALUES (${region_name}) RETURNING id
        `;
        regionId = insertedRegion[0]?.id;
      }
    }

    const updated = await sql`
      UPDATE reportes
      SET
        cantidad = COALESCE(${cantidad}, cantidad),
        tipo_residuo = COALESCE(${tipo_residuo}, tipo_residuo),
        pendiente = COALESCE(${pendiente}, pendiente),
        cercania_agua = COALESCE(${cercania_agua}, cercania_agua),
        riesgo_contaminacion = COALESCE(${riesgo_contaminacion}, riesgo_contaminacion),
        clasificacion_material = COALESCE(${clasificacion_material}, clasificacion_material),
        region_id = COALESCE(${regionId}, region_id),
        latitud = COALESCE(${latitud}, latitud),
        longitud = COALESCE(${longitud}, longitud)
      WHERE id::text = ${String(id)}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ ok: false, message: "Reporte no encontrado" });
    }

    return res.json({ ok: true, reporte: updated[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
});

app.put("/api/admin/reportes/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;
    const { verificado } = req.body;

    const adminUser = await getAuthenticatedAdmin(req, res);
    if (!adminUser) return;

    const updated = await sql`
      UPDATE reportes
      SET verificado = ${verificado}
      WHERE id::text = ${String(id)}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ ok: false, message: "Reporte no encontrado" });
    }

    return res.json({ ok: true, reporte: updated[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
});

app.delete("/api/admin/reportes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const adminUser = await getAuthenticatedAdmin(req, res);
    if (!adminUser) return;

    const deleted = await sql`
      DELETE FROM reportes WHERE id::text = ${String(id)} RETURNING *
    `;

    if (deleted.length === 0) {
      return res.status(404).json({ ok: false, message: "Reporte no encontrado" });
    }

    return res.json({ ok: true, reporte: deleted[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
});

app.post("/api/admin/reportes/:id/images", async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    const adminUser = await getAuthenticatedAdmin(req, res);
    if (!adminUser) return;

    const existing = await sql`
      SELECT imagenes FROM reportes WHERE id = ${id} LIMIT 1
    `;

    if (existing.length === 0) {
      return res.status(404).json({ ok: false, message: "Reporte no encontrado" });
    }

    const images = existing[0].imagenes || [];
    if (images.length >= 3) {
      return res.status(400).json({ ok: false, message: "Solo se permiten hasta 3 imágenes" });
    }

    const updated = await sql`
      UPDATE reportes
      SET imagenes = ${[...images, imageUrl]}
      WHERE id::text = ${String(id)}
      RETURNING *
    `;

    return res.json({ ok: true, reporte: updated[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
});

app.delete("/api/admin/reportes/:id/images/:index", async (req, res) => {
  try {
    const { id, index } = req.params;

    const adminUser = await getAuthenticatedAdmin(req, res);
    if (!adminUser) return;

    const existing = await sql`
      SELECT imagenes FROM reportes WHERE id = ${id} LIMIT 1
    `;

    if (existing.length === 0) {
      return res.status(404).json({ ok: false, message: "Reporte no encontrado" });
    }

    const images = (existing[0].imagenes || []).filter((_, i) => i !== Number(index));
    const updated = await sql`
      UPDATE reportes SET imagenes = ${images} WHERE id::text = ${String(id)} RETURNING *
    `;

    return res.json({ ok: true, reporte: updated[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
});

app.get("/api/admin/usuarios", async (req, res) => {
  try {
    const adminUser = await getAuthenticatedAdmin(req, res);
    if (!adminUser) return;

    const hasVerifiedColumn = await usuariosTableHasVerifiedColumn();
    const usuariosRaw = hasVerifiedColumn
      ? await sql`
          SELECT id, nombre, correo, rol_id, verificado
          FROM usuarios
          ORDER BY nombre
        `
      : await sql`
          SELECT id, nombre, correo, rol_id
          FROM usuarios
          ORDER BY nombre
        `;

    const usuarios = usuariosRaw.map((usuario) => normalizeAdminUser(usuario, true));

    return res.json({ ok: true, usuarios });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
});

app.put("/api/admin/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { verificado, rol_id } = req.body;

    const adminUser = await getAuthenticatedAdmin(req, res);
    if (!adminUser) return;

    const hasVerifiedColumn = await usuariosTableHasVerifiedColumn();

    const updated = hasVerifiedColumn
      ? await sql`
          UPDATE usuarios
          SET
            verificado = COALESCE(${verificado}, verificado),
            rol_id = COALESCE(${rol_id}, rol_id)
          WHERE id::text = ${String(id)}
          RETURNING id, nombre, correo, rol_id, verificado
        `
      : await sql`
          UPDATE usuarios
          SET rol_id = COALESCE(${rol_id}, rol_id)
          WHERE id::text = ${String(id)}
          RETURNING id, nombre, correo, rol_id
        `;

    if (updated.length === 0) {
      return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    }

    const usuario = updated[0];
    return res.json({ ok: true, usuario: normalizeAdminUser(usuario, typeof verificado === "boolean" ? verificado : true) });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
});

app.delete("/api/admin/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const adminUser = await getAuthenticatedAdmin(req, res);
    if (!adminUser) return;

    const existingUser = await sql`
      SELECT id
      FROM usuarios
      WHERE id::text = ${String(id)}
      LIMIT 1
    `;

    if (existingUser.length === 0) {
      return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    }

    const userReports = await sql`
      SELECT id
      FROM reportes
      WHERE reportado_por::text = ${String(id)}
    `;

    if (userReports.length > 0) {
      const reportIds = userReports.map((report) => String(report.id));
      await sql`
        DELETE FROM comentarios
        WHERE reporte_id::text = ANY(${reportIds})
      `;

      await sql`
        DELETE FROM reportes
        WHERE reportado_por::text = ${String(id)}
      `;
    }

    await sql`
      DELETE FROM comentarios
      WHERE usuario_id::text = ${String(id)}
    `;

    const deleted = await sql`
      DELETE FROM usuarios
      WHERE id::text = ${String(id)}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    return res.status(500).json({ ok: false, message: error.message });
  }
});
app.get("/api/regiones", async (req, res) => {

  const regiones = await sql`
    SELECT *
    FROM regiones
    ORDER BY region_name
  `;

  res.json({
    ok: true,
    regiones
  });

});
// =====================================================
// COMENTARIOS
// =====================================================

app.get('/api/reportes/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ ok: false, message: 'reporte id requerido' });
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
    console.error('GET comentarios error:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

app.post('/api/reportes/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params; // reporte id
    const { usuarioId, comentario } = req.body;

    if (!id || !usuarioId || !comentario) {
      return res.status(400).json({ ok: false, message: 'reporte id, usuarioId y comentario son requeridos' });
    }

    // validar que el usuario exista para evitar violaciones de FK
    const usuarioExist = await sql`
      SELECT id, nombre FROM usuarios WHERE id::text = ${String(usuarioId)} LIMIT 1
    `;
    if (usuarioExist.length === 0) {
      return res.status(400).json({ ok: false, message: 'Usuario no encontrado. Verifica usuarioId.' });
    }

    const inserted = await sql`
      INSERT INTO comentarios (reporte_id, usuario_id, comentario)
      VALUES (${id}, ${usuarioId}, ${comentario})
      RETURNING *
    `;

    const usuario = await sql`
      SELECT nombre FROM usuarios WHERE id::text = ${String(usuarioId)} LIMIT 1
    `;

    const nuevo = inserted[0];
    const usuario_nombre = usuario[0]?.nombre || 'Anonimo';

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
    console.error('POST comentarios error:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});
// =====================================================
// SERVER
// =====================================================





const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
});