import { useState } from "react";

import PostModal from "./PostModal";
import PostEditForm from "./PostEditForm";
import PostUrgency from "./PostUrgency";

const PostCard = ({
  post,
  isEditing,
  setEditingPostId,
  onSavePost,
}) => {
  const [openModal, setOpenModal] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | EDIT HANDLERS
  |--------------------------------------------------------------------------
  */

  const handleEdit = () => {
    setEditingPostId(post.id);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
  };

  /*
  |--------------------------------------------------------------------------
  | CARD
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <article
        className="
          group
          overflow-hidden
          rounded-3xl
          border
          border-[#d8d3c3]
          bg-white
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-xl
        "
      >
        {/* IMAGE */}

        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="relative w-full overflow-hidden"
        >
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="
              h-72
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />

          {/* VERIFIED BADGE */}

          {post.verified && (
            <div
              className="
                absolute
                left-4
                top-4
                rounded-full
                bg-blue-500
                px-3
                py-1
                text-xs
                font-semibold
                text-white
              "
            >
              Verified
            </div>
          )}
        </button>

        {/* CONTENT */}

        <div className="flex flex-col gap-4 p-5">
          {/* HEADER */}

          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h3
                className="
                  text-xl
                  font-bold
                  text-[#003C43]
                "
              >
                {post.title}
              </h3>

              <PostUrgency urgency={post.urgency} />
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={handleEdit}
                aria-label="Edit post"
                className="
                  rounded-full
                  p-2
                  text-[#135D66]
                  transition-all
                  hover:bg-[#F6F4EA]
                "
              >
                ✎
              </button>
            )}
          </div>

          {/* DESCRIPTION */}

          <p
            className="
              line-clamp-3
              text-sm
              leading-relaxed
              text-[#135D66]
            "
          >
            {post.description}
          </p>

          {/* EDIT MODE */}

          {isEditing && (
            <PostEditForm
              post={post}
              onCancel={handleCancelEdit}
              onSave={onSavePost}
            />
          )}
        </div>
      </article>

      {/* MODAL */}

      {openModal && (
        <PostModal
          post={post}
          onClose={() => setOpenModal(false)}
        />
      )}
    </>
  );
};

export default PostCard;