import { useState } from "react";

const abtme = ({
  profile,
  setProfile,
  isAdmin,
}) => {
  const [editing, setEditing] = useState(false);
  const [abtText, setAbtText] = useState(
    profile.abtme
  );

  const handleSave = () => {
    setProfile((prev) => ({
      ...prev,
      abtme: abtText,
    }));

    setEditing(false);

    /*
      Later:
      updateProfile({
        abt_me: abtText
      });
    */
  };

  const handleCancel = () => {
    setAbtText(profile.abtme);
    setEditing(false);
  };

  return (
    <section className="abt-section">

      <div className="section-header">
        <h2>Sobre Mi</h2>

        {isAdmin && !editing && (
          <button
            className="edit-btn"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        )}
      </div>

      {!editing ? (
        <p className="abt-text">
          {profile.abtme}
        </p>
      ) : (
        <div className="abt-editor">

          <textarea
            value={abtText}
            onChange={(e) =>
              setAbtText(e.target.value)
            }
            maxLength={500}
            placeholder="Hola! Estoy usando Cora, patrocinado por Aemonia."
          />

          <div className="editor-actions">

            <button
              className="save-btn"
              onClick={handleSave}
            >
              Save
            </button>

            <button
              className="cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>

          </div>

          <p className="character-counter">
            {abtText.length}/500
          </p>

        </div>
      )}

    </section>
  );
};

export default abtme;