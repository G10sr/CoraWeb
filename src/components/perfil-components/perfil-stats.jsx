import { useRef, useState } from "react";

const pfStats = ({ perfil, isAdmin, setPerfil }) => {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(pf.name);

  const fileInputRef = useRef(null);

  const handleNameSave = () => {
    setPerfil((prev) => ({
      ...prev,
      name: newName,
    }));

    setEditingName(false);

    /*
      Later:
      updateProfileName(newName)
    */
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setPerfil((prev) => ({
      ...prev,
      pfImage: imageUrl,
    }));

    /*
      Later:
      uploadProfileImage(file)
    */
  };

  return (
    <section className="pf-stats">

      <div className="pf-image-container">

        <img
          src={perfil.pfImage}
          alt={perfil.name}
          className="pf-image"
        />

        {isAdmin && (
          <>
            <button
              className="change-image-btn"
              onClick={() => fileInputRef.current.click()}
            >
              Cambiar foto de perfil
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              hidden
              onChange={handleImageChange}
            />
          </>
        )}

      </div>

      <div className="pf-name-section">

        {!editingName ? (
          <>
            <h1>{pf.name}</h1>

            {isAdmin && (
              <button
                className="edit-btn"
                onClick={() => setEditingName(true)}
              >
                Editar nombre
              </button>
            )}
          </>
        ) : (
          <div className="edit-name-container">

            <input
              type="text"
              value={newName}
              onChange={(e) =>
                setNewName(e.target.value)
              }
              maxLength={50}
            />

            <button
              className="save-btn"
              onClick={handleNameSave}
            >
              Guardar
            </button>

            <button
              className="cancel-btn"
              onClick={() => {
                setNewName(pf.name);
                setEditingName(false);
              }}
            >
              Cancelar
            </button>

          </div>
        )}

      </div>

    </section>
  );
};

export default pfStats;





/*import { useRef, useState } from "react";

const perfilStats = ({ perfil, isAdmin, setPerfil}) => {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(pf.name);

  const fileInputRef = useRef(null);

  const handleNameSave = () => {
    setPf((prev) => ({
      ...prev,
      name: newName,
    }));

    setEditingName(false);

    /*
      Later:
      updateProfileName(newName)
    */
/*  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setPerfil((prev) => ({
      ...prev,
      pfp: imageUrl,
    }));

    /*
      Later:
      uploaPfpfile)
    */
  /*};

  return (
    <section className="pf-stats">

      <div className="pfp-container">

        <img
          src={pfp}
          alt={pf.name}
          className="pfp"
        />

        {isAdmin && (
          <>
            <button
              className="change-image-btn"
              onClick={() => fileInputRef.current.click()}
            >
              Cambiar foto
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              hidden
              onChange={handleImageChange}
            />
          </>
        )}

      </div>

      <div className="pf-name-section">

        {!editingName ? (
          <>
            <h1>{pf.name}</h1>

            {isAdmin && (
              <button
                className="edit-btn"
                onClick={() => setEditingName(true)}
              >
                Cambiar nombre
              </button>
            )}
          </>
        ) : (
          <div className="edit-name-container">

            <input
              type="text"
              value={newName}
              onChange={(e) =>
                setNewName(e.target.value)
              }
              maxLength={50}
            />

            <button
              className="save-btn"
              onClick={handleNameSave}
            >
              Guardar
            </button>

            <button
              className="cancel-btn"
              onClick={() => {
                setNewName(pf.name);
                setEditingName(false);
              }}
            >
              Cancel
            </button>

          </div>
        )}

      </div>

    </section>
  );
};

export default perfilStats; */