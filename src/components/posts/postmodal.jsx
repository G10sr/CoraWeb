```jsx id="g4ecmo"
// src/components/Posts/PostModal.jsx

import { useEffect } from "react";

import PostUrgency from "./PostUrgency";

const PostModal = ({ post, onClose }) => {
  /*
  |--------------------------------------------------------------------------
  | ESC CLOSE
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
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose]);

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
      "
    >
      {/* MODAL CARD */}

      <div
        className="
          relative
          flex
          max-h-[90vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-3xl
          bg-white
          shadow-2xl
          lg:flex-row
        "
      >
        {/* CLOSE BUTTON */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close post"
          className="
            absolute
            right-4
            top-4
            z-10
            rounded-full
            bg-white/90
            p-2
            shadow-md
            transition-all
            hover:scale-105
          "
        >
          ✕
        </button>

        {/* IMAGE */}

        <div className="lg:w-1/2">
          <img
            src={post.image}
            alt={post.title}
            className="
              h-full
              max-h-[500px]
              w-full
              object-cover
            "
          />
        </div>

        {/* CONTENT */}

        <div
          className="
            flex
            flex-1
            flex-col
            gap-6
            overflow-y-auto
            p-8
          "
        >
          <div className="flex items-center justify-between">
            <h2
              className="
                text-3xl
                font-black
                text-[#003C43]
              "
            >
              {post.title}
            </h2>

            <PostUrgency urgency={post.urgency} />
          </div>

          <p
            className="
              text-base
              leading-relaxed
              text-[#135D66]
            "
          >
            {post.description}
          </p>

          {/* FUTURE VERIFICATION */}

          <div
            className="
              mt-auto
              rounded-2xl
              border
              border-dashed
              border-[#d8d3c3]
              bg-[#F6F4EA]
              p-4
              text-sm
              text-[#135D66]
            "
          >
            Admin verification system ready for
            future integration.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
```
