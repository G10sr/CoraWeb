```jsx
// src/components/Profile/EditProfileModal.jsx

import { useEffect } from "react";

const EditProfileModal = ({
  draftProfile,
  setDraftProfile,
  onClose,
  onSave,
}) => {
  /*
  |--------------------------------------------------------------------------
  | ESC CLOSE ACCESSIBILITY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  /*
  |--------------------------------------------------------------------------
  | FIELD HANDLER
  |--------------------------------------------------------------------------
  */

  const handleChange = (field, value) => {
    setDraftProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        px-4
        backdrop-blur-sm
      "
    >
      {/* MODAL CARD */}

      <div
        className="
          w-full
          max-w-2xl
          rounded-3xl
          bg-white
          p-6
          shadow-2xl
          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
      >
        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">
          <h2
            className="
              text-2xl
              font-bold
              text-[#003C43]
            "
          >
            Edit Profile
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="
              rounded-full
              p-2
              text-[#135D66]
              transition-colors
              hover:bg-[#F6F4EA]
            "
          >
            ✕
          </button>
        </div>

        {/* FORM */}

        <div className="flex flex-col gap-5">
          {/* NAME */}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="
                text-sm
                font-semibold
                text-[#003C43]
              "
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              value={draftProfile.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              className="
                rounded-2xl
                border
                border-[#d8d3c3]
                bg-[#F6F4EA]
                px-4
                py-3
                text-[#003C43]
                outline-none
                transition-all
                focus:border-[#77B0AA]
                focus:ring-2
                focus:ring-[#77B0AA]/30
              "
            />
          </div>

          {/* BIO */}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="bio"
              className="
                text-sm
                font-semibold
                text-[#003C43]
              "
            >
              Bio
            </label>

            <textarea
              id="bio"
              rows="4"
              value={draftProfile.bio}
              onChange={(e) =>
                handleChange("bio", e.target.value)
              }
              className="
                resize-none
                rounded-2xl
                border
                border-[#d8d3c3]
                bg-[#F6F4EA]
                px-4
                py-3
                text-[#003C43]
                outline-none
                transition-all
                focus:border-[#77B0AA]
                focus:ring-2
                focus:ring-[#77B0AA]/30
              "
            />
          </div>

          {/* AVATAR URL PLACEHOLDER */}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="avatar"
              className="
                text-sm
                font-semibold
                text-[#003C43]
              "
            >
              Profile Image URL
            </label>

            <input
              id="avatar"
              type="text"
              value={draftProfile.avatar}
              onChange={(e) =>
                handleChange("avatar", e.target.value)
              }
              className="
                rounded-2xl
                border
                border-[#d8d3c3]
                bg-[#F6F4EA]
                px-4
                py-3
                text-[#003C43]
                outline-none
                transition-all
                focus:border-[#77B0AA]
                focus:ring-2
                focus:ring-[#77B0AA]/30
              "
            />
          </div>
        </div>

        {/* ACTIONS */}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-2xl
              border
              border-[#d8d3c3]
              px-5
              py-3
              font-medium
              text-[#003C43]
              transition-all
              hover:bg-[#F6F4EA]
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="
              rounded-2xl
              bg-[#003C43]
              px-5
              py-3
              font-semibold
              text-white
              transition-all
              hover:bg-[#135D66]
            "
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
```
