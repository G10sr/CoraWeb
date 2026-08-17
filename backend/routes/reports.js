import express from "express";
import sql from "../db.js";

const router = express.Router();

router.get("/reportes", async (req, res) => {
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
        ON u.id = r.reportado_por
      LEFT JOIN regiones reg
        ON reg.id = r.region_id
      ${usuarioId ? sql`WHERE r.reportado_por = ${usuarioId}` : sql``}
      ORDER BY r.fecha_creacion DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM reportes r
      ${usuarioId ? sql`WHERE r.reportado_por = ${usuarioId}` : sql``}
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

router.post("/reportes", async (req, res) => {
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
    // Verificar que el usuario no tenga más de 3 reportes
const [{ totalreportes }] = await sql`
  SELECT COUNT(*)::int AS totalReportes
  FROM reportes
  WHERE reportado_por = ${usuarioId}
    AND verificado = false
`;

    if (totalreportes > 2) {
      return res.status(400).json({
        ok: false,
        message: "Solo puedes tener un máximo de 3 reportes activos.",
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

router.delete("/reportes/:id", async (req, res) => {
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
      WHERE id = ${id} AND reportado_por = ${usuarioId}
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

export default router;
