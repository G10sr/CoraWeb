import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../assets/styles/AdminPanel.css";
import { getStoredUser } from "../lib/authSession";

function getCurrentUser() {
  return getStoredUser();
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState("reports");
  const [editingReport, setEditingReport] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "user" });
  const [imageInput, setImageInput] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [userMessage, setUserMessage] = useState("");
  const [userError, setUserError] = useState("");

  const user = getCurrentUser();

  useEffect(() => {
    if (!user?.id) {
      navigate("/login", { replace: true });
      return;
    }

    loadData();
  }, [navigate, user?.id]);

  async function loadData() {
    setLoading(true);
    setError("");
    setAuthorized(false);

    try {
      const verifyResponse = await fetch(`/api/admin/verify?usuarioId=${user.id}`);
      const verifyData = await verifyResponse.json();

      if (!verifyData.ok) throw new Error(verifyData.message || "No autorizado");

      setAuthorized(true);

      const [reportResponse, usersResponse] = await Promise.all([
        fetch(`/api/admin/reportes?usuarioId=${user.id}`),
        fetch(`/api/admin/usuarios?usuarioId=${user.id}`),
      ]);

      const reportData = await reportResponse.json();
      const userData = await usersResponse.json();

      if (!reportData.ok) throw new Error(reportData.message || "No se pudieron cargar los reportes");
      if (!userData.ok) throw new Error(userData.message || "No se pudieron cargar los usuarios");

      setReports(reportData.reportes || []);
      setUsers(userData.usuarios || []);
    } catch (err) {
      setError(err.message || "Error al cargar la administración");
      setReports([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(report) {
    setEditingReport(report);
    setEditForm({
      region_name: report.region_name || "",
      tipo_residuo: report.tipo_residuo || "organico",
      cantidad: report.cantidad || "",
      pendiente: report.pendiente || "plano",
      cercania_agua: report.cercania_agua || "˂50m",
      riesgo_contaminacion: report.riesgo_contaminacion || "bajo",
      clasificacion_material: report.clasificacion_material || "reciclable",
      latitud: report.latitud || "",
      longitud: report.longitud || "",
    });
  }

  async function saveEdit(reportId) {
    try {
      const response = await fetch(`/api/admin/reportes/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: user.id,
          ...editForm,
          latitud: Number(editForm.latitud),
          longitud: Number(editForm.longitud),
        }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.message || "No se pudo actualizar el reporte");
      setEditingReport(null);
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el reporte");
    }
  }

  async function toggleReportVerification(reportId, verified) {
    try {
      const response = await fetch(`/api/admin/reportes/${reportId}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: user.id, verificado: !verified }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.message || "No se pudo cambiar el estado");
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo cambiar el estado");
    }
  }

  async function deleteReport(reportId) {
    if (!window.confirm("¿Deseas eliminar este registro?")) return;

    try {
      const response = await fetch(`/api/admin/reportes/${reportId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: user.id }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.message || "No se pudo eliminar");
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo eliminar");
    }
  }

  async function addReportImage(reportId) {
    try {
      let imageUrl = imageInput.trim();

      if (!imageUrl && selectedImageFile) {
        const fileReader = new FileReader();
        imageUrl = await new Promise((resolve, reject) => {
          fileReader.onload = () => resolve(fileReader.result);
          fileReader.onerror = () => reject(new Error("No se pudo leer la imagen"));
          fileReader.readAsDataURL(selectedImageFile);
        });
      }

      if (!imageUrl) {
        throw new Error("Selecciona una imagen o pega una URL");
      }

      const response = await fetch(`/api/admin/reportes/${reportId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: user.id, imageUrl }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.message || "No se pudo agregar la imagen");
      setImageInput("");
      setSelectedImageFile(null);
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo agregar la imagen");
    }
  }

  async function removeReportImage(reportId, index) {
    try {
      const response = await fetch(`/api/admin/reportes/${reportId}/images/${index}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: user.id }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.message || "No se pudo eliminar la imagen");
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo eliminar la imagen");
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    setUserError("");
    setUserMessage("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUser.username.trim(),
          email: newUser.email.trim(),
          password: newUser.password,
          usuarioId: user.id,
          createdByAdmin: true,
          role: newUser.role === "admin" ? 2 : 1,
        }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.message || "No se pudo crear el usuario");

      setUserMessage("Usuario creado correctamente");
      setNewUser({ username: "", email: "", password: "", role: "user" });
      await loadData();
    } catch (err) {
      setUserError(err.message || "No se pudo crear el usuario");
    }
  }

  async function toggleUserRole(userId, currentRole) {
    try {
      const response = await fetch(`/api/admin/usuarios/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: user.id, rol_id: currentRole === 2 ? 1 : 2 }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.message || "No se pudo cambiar el rol");
      await loadData();
    } catch (err) {
      setUserError(err.message || "No se pudo cambiar el rol");
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm("¿Deseas eliminar este usuario?")) return;

    try {
      const response = await fetch(`/api/admin/usuarios/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: user.id }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.message || "No se pudo eliminar el usuario");
      await loadData();
    } catch (err) {
      setUserError(err.message || "No se pudo eliminar el usuario");
    }
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <div className="admin-hero">
          <div>
            <p className="admin-eyebrow">Panel exclusivo</p>
            <h1>Administración de registros y usuarios</h1>
            <p>Gestiona reportes, valida contenido y administra cuentas desde una sola vista.</p>
          </div>
          <div className="admin-hero-actions">
            <button className={tab === "reports" ? "admin-tab active" : "admin-tab"} onClick={() => setTab("reports")}>Reportes</button>
            <button className={tab === "users" ? "admin-tab active" : "admin-tab"} onClick={() => setTab("users")}>Usuarios</button>
          </div>
        </div>

        {error && <div className="admin-alert danger">{error}</div>}

        {!loading && !authorized && !error ? (
          <div className="admin-alert danger">No tienes permisos para administrar este sitio.</div>
        ) : null}

        {tab === "reports" ? (
          <section className="admin-card">
            <div className="admin-card-header">
              <h2>Registros</h2>
              <span>{reports.length} en total</span>
            </div>

            {loading ? (
              <p className="admin-empty">Cargando registros...</p>
            ) : reports.length === 0 ? (
              <p className="admin-empty">No hay registros para administrar.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th>Imágenes</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td>#{report.id}</td>
                        <td>{report.reportado_por || "Sin usuario"}</td>
                        <td>{report.tipo_residuo || "Sin tipo"}</td>
                        <td>
                          <span className={report.verificado ? "pill success" : "pill pending"}>
                            {report.verificado ? "Verificado" : "Pendiente"}
                          </span>
                        </td>
                        <td>
                          <div className="image-stack">
                            {(report.imagenes || []).length > 0 ? (
                              (report.imagenes || []).map((img, index) => (
                                <div className="image-card" key={`${report.id}-${index}`}>
                                  {img ? (
                                    <img className="image-preview" src={img} alt={`Imagen ${index + 1}`} />
                                  ) : (
                                    <div className="image-preview empty">Sin vista previa</div>
                                  )}
                                  <div className="image-card-footer">
                                    <span>Imagen {index + 1}</span>
                                    <button type="button" onClick={() => removeReportImage(report.id, index)} title="Eliminar imagen">×</button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="image-empty">Sin imágenes</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button type="button" className="secondary-btn" onClick={() => openEdit(report)}>Editar</button>
                            <button type="button" className="secondary-btn" onClick={() => toggleReportVerification(report.id, report.verificado)}>{report.verificado ? "Desverificar" : "Verificar"}</button>
                            <button type="button" className="danger-btn" onClick={() => deleteReport(report.id)}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {editingReport && (
              <div className="admin-modal-backdrop" onClick={() => setEditingReport(null)} role="presentation">
                <div className="admin-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Editar reporte ${editingReport.id}`}>
                  <div className="admin-modal-header">
                    <div>
                      <p className="admin-eyebrow">Editar reporte</p>
                      <h3>#{editingReport.id}</h3>
                    </div>
                    <button type="button" className="ghost-btn" onClick={() => setEditingReport(null)}>Cerrar</button>
                  </div>

                  <div className="edit-grid">
                    <label>
                      Reportado por
                      <input value={editingReport.reportado_por || ""} readOnly />
                    </label>
                    <label>
                      Región
                      <input value={editForm.region_name || ""} onChange={(event) => setEditForm({ ...editForm, region_name: event.target.value })} placeholder="Ej. Colegio CTP CIT" />
                    </label>
                    <label>
                      Tipo de residuo
                      <select value={editForm.tipo_residuo || "organico"} onChange={(event) => setEditForm({ ...editForm, tipo_residuo: event.target.value })}>
                        <option value="organico">Orgánico</option>
                        <option value="plastico">Plástico</option>
                        <option value="vidrio">Vidrio</option>
                        <option value="metal">Envases metálicos</option>
                        <option value="carton">Cartón</option>
                        <option value="papel">Papel</option>
                      </select>
                    </label>
                    <label>
                      Cantidad de residuos
                      <input type="number" min="0" value={editForm.cantidad || ""} onChange={(event) => setEditForm({ ...editForm, cantidad: event.target.value })} />
                    </label>
                    <label>
                      Pendiente
                      <select value={editForm.pendiente || "plano"} onChange={(event) => setEditForm({ ...editForm, pendiente: event.target.value })}>
                        <option value="plano">Plano</option>
                        <option value="leve">Leve</option>
                        <option value="pronunciada">Pronunciada</option>
                        <option value="intensa">Intensa</option>
                      </select>
                    </label>
                    <label>
                      Cercanía al cuerpo de agua
                      <select value={editForm.cercania_agua || "˂50m"} onChange={(event) => setEditForm({ ...editForm, cercania_agua: event.target.value })}>
                        <option value="˂50m">˂50m</option>
                        <option value="≥100m">≥100m</option>
                        <option value="≥500m">≥500m</option>
                      </select>
                    </label>
                    <label>
                      Riesgo de contaminación
                      <select value={editForm.riesgo_contaminacion || "bajo"} onChange={(event) => setEditForm({ ...editForm, riesgo_contaminacion: event.target.value })}>
                        <option value="bajo">Bajo</option>
                        <option value="medio">Medio</option>
                        <option value="alto">Alto</option>
                      </select>
                    </label>
                    <label>
                      El material clasifica como
                      <select value={editForm.clasificacion_material || "reciclable"} onChange={(event) => setEditForm({ ...editForm, clasificacion_material: event.target.value })}>
                        <option value="reciclable">Reciclable</option>
                        <option value="no reciclable">No reciclable</option>
                      </select>
                    </label>
                    <label>
                      Latitud
                      <input type="number" value={editForm.latitud || ""} onChange={(event) => setEditForm({ ...editForm, latitud: event.target.value })} />
                    </label>
                    <label>
                      Longitud
                      <input type="number" value={editForm.longitud || ""} onChange={(event) => setEditForm({ ...editForm, longitud: event.target.value })} />
                    </label>
                  </div>

                  <div className="edit-actions">
                    <input value={imageInput} onChange={(event) => setImageInput(event.target.value)} placeholder="Pegar URL de imagen o dejar vacía para usar archivo" />
                    <label className="admin-file-picker">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setSelectedImageFile(file);
                          if (file) {
                            setImageInput("");
                          }
                        }}
                      />
                      <span>Subir archivo</span>
                    </label>
                    <button type="button" className="secondary-btn" onClick={() => addReportImage(editingReport.id)}>Agregar imagen</button>
                    <button type="button" className="primary-btn" onClick={() => saveEdit(editingReport.id)}>Guardar cambios</button>
                  </div>
                  <p className="admin-hint">Puedes usar una URL o subir un archivo; la imagen se guardará como datos en el reporte.</p>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="admin-card">
            <div className="admin-card-header">
              <h2>Usuarios</h2>
              <span>{users.length} registrados</span>
            </div>

            <form className="user-form" onSubmit={handleCreateUser}>
              <h3>Crear nuevo usuario</h3>
              {userMessage && <div className="admin-alert success">{userMessage}</div>}
              {userError && <div className="admin-alert danger">{userError}</div>}
              <div className="edit-grid">
                <label>
                  Usuario
                  <input required value={newUser.username} onChange={(event) => setNewUser({ ...newUser, username: event.target.value })} />
                </label>
                <label>
                  Correo
                  <input required type="email" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} />
                </label>
                <label>
                  Contraseña
                  <input required type="password" value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} />
                </label>
                <label>
                  Rol
                  <select value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </label>
              </div>
              <button type="submit" className="primary-btn">Crear usuario</button>
            </form>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((account) => (
                    <tr key={account.id}>
                      <td>{account.nombre || account.username || "Sin nombre"}</td>
                      <td>{account.correo || "Sin correo"}</td>
                      <td>{account.rol_id === 2 ? "Admin" : "Usuario"}</td>
                      <td>
                        <div className="action-buttons">
                          <button type="button" className="secondary-btn" onClick={() => toggleUserRole(account.id, account.rol_id)}>{account.rol_id === 2 ? "Quitar admin" : "Hacer admin"}</button>
                          <button type="button" className="danger-btn" onClick={() => deleteUser(account.id)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
