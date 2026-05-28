import { useState } from "react";

const PostEditForm = ({
  post,
  onCancel,
  onSave,
}) => {
  const [draftPost, setDraftPost] = useState(post);

  /*
  |--------------------------------------------------------------------------
  | FIELD UPDATE
  |--------------------------------------------------------------------------
  */

  const handleChange = (field, value) => {
    setDraftPost((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const handleSubmit = () => {
    onSave(post.id, draftPost);
  };

  return (
    <div
      className="
        mt-2
        flex
        flex-col
        gap-4
        rounded-2xl
        border
        border-[#d8d3c3]
        bg-[#F6F4EA]
        p-4
      "
    >
      {/* TITLE */}

      <div className="flex flex-col gap-2">
        <label
          className="
            text-sm
            font-semibold
            text-[#003C43]
          "
        >
          Title
        </label>

        <input
          type="text"
          value={draftPost.title}
          onChange={(e) =>
            handleChange("title", e.target.value)
          }
          className="
            rounded-xl
            border
            border-[#d8d3c3]
            bg-white
            px-4
            py-3
            outline-none
            transition-all
            focus:ring-2
            focus:ring-[#77B0AA]/40
          "
        />
      </div>

      {/* DESCRIPTION */}

      <div className="flex flex-col gap-2">
        <label
          className="
            text-sm
            font-semibold
            text-[#003C43]
          "
        >
          Description
        </label>

        <textarea
          rows="4"
          value={draftPost.description}
          onChange={(e) =>
            handleChange("description", e.target.value)
          }
          className="
            resize-none
            rounded-xl
            border
            border-[#d8d3c3]
            bg-white
            px-4
            py-3
            outline-none
            transition-all
            focus:ring-2
            focus:ring-[#77B0AA]/40
          "
        />
      </div>

      {/* IMAGE URL */}

      <div className="flex flex-col gap-2">
        <label
          className="
            text-sm
            font-semibold
            text-[#003C43]
          "
        >
          Image URL
        </label>

        <input
          type="text"
          value={draftPost.image}
          onChange={(e) =>
            handleChange("image", e.target.value)
          }
          className="
            rounded-xl
            border
            border-[#d8d3c3]
            bg-white
            px-4
            py-3
            outline-none
            transition-all
            focus:ring-2
            focus:ring-[#77B0AA]/40
          "
        />
      </div>

      {/* URGENCY */}

      <div className="flex flex-col gap-3">
        <span
          className="
            text-sm
            font-semibold
            text-[#003C43]
          "
        >
          Urgency
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              handleChange("urgency", "urgent")
            }
            className={`
              rounded-full
              border
              px-4
              py-2
              text-lg
              transition-all
              ${
                draftPost.urgency === "urgent"
                  ? "border-red-500 bg-red-100"
                  : "border-[#d8d3c3] bg-white"
              }
            `}
          >
            🔴
          </button>

          <button
            type="button"
            onClick={() =>
              handleChange("urgency", "normal")
            }
            className={`
              rounded-full
              border
              px-4
              py-2
              text-lg
              transition-all
              ${
                draftPost.urgency === "normal"
                  ? "border-yellow-500 bg-yellow-100"
                  : "border-[#d8d3c3] bg-white"
              }
            `}
          >
            🟡
          </button>

          <button
            type="button"
            onClick={() =>
              handleChange("urgency", "solved")
            }
            className={`
              rounded-full
              border
              px-4
              py-2
              text-lg
              transition-all
              ${
                draftPost.urgency === "solved"
                  ? "border-green-500 bg-green-100"
                  : "border-[#d8d3c3] bg-white"
              }
            `}
          >
            🟢
          </button>
        </div>
      </div>

      {/* ACTIONS */}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="
            rounded-xl
            border
            border-[#d8d3c3]
            px-4
            py-2
            font-medium
            transition-all
            hover:bg-white
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="
            rounded-xl
            bg-[#003C43]
            px-4
            py-2
            font-semibold
            text-white
            transition-all
            hover:bg-[#135D66]
          "
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default PostEditForm;