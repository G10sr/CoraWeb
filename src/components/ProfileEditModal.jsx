import React, { useState, useEffect } from "react";
import "../assets/styles/ProfileEditModal.css";

export default function ProfileEditModal({ open, onClose, initialName, initialAbout, initialImage, onSave }) {
  const [name, setName] = useState(initialName || "");
  const [about, setAbout] = useState(initialAbout || "");
  const [preview, setPreview] = useState(initialImage || null);
  const [fileData, setFileData] = useState(null);

  useEffect(() => {
    setName(initialName || "");
    setAbout(initialAbout || "");
    setPreview(initialImage || null);
    setFileData(null);
  }, [initialName, initialAbout, initialImage, open]);

  if (!open) return null;

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setFileData(reader.result);
    };
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    onSave(name, about, fileData || preview);
  };

  return (
    <div className="pem-modal-overlay">
      <div className="pem-modal">
 <h3>Editar perfil</h3>

<div className="pem-content">

    <div className="pem-left">

        <div className="pem-avatar-preview">
            {preview ? (
                <img src={preview} alt="preview" />
            ) : (
                <div className="pem-avatar-placeholder">
                    Sin imagen
                </div>
            )}
        </div>

        <input
            type="file"
            accept="image/*"
            onChange={handleFile}
        />

    </div>

    <div className="pem-right">

        <div className="pem-row">
            <label>Nombre</label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
        </div>

        <div className="pem-row">
            <label>Sobre mí</label>
            <textarea
                rows={8}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
            />
        </div>

    </div>

</div>

<div className="pem-actions">
    <button
        className="pem-btn pem-cancel"
        onClick={onClose}
    >
        Cancelar
    </button>

    <button
        className="pem-btn pem-save"
        onClick={handleSave}
    >
        Guardar cambios
    </button>
</div>
    </div>
        </div>
  );
}
