import { useEffect, useState } from "react";

const PostModal = ({
  isOpen,
  onClose,
  mode,
  post,
  onSave,
  isAdmin,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [imagePreview, setImagePreview] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  useEffect(() => {
    if (!post) return;

    setTitle(post.title || "");
    setDescription(post.description || "");
    setImagePreview(post.image_url || "");
  }, [post]);

  if (!isOpen) return null;

  const handleImageSelect = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedFile(file);

    const preview =
      URL.createObjectURL(file);

    setImagePreview(preview);
  };

  const handleSubmit = () => {
    const postData = {
      ...post,
      title,
      description,
      image_url: imagePreview,
      imageFile: selectedFile,
    };

    onSave(postData);
  };

  const isViewMode = mode === "view";

  return (
    <div className="modal-overlay">

      <div className="post-modal">

        <button
          className="close-modal-btn"
          onClick={onClose}
        >
          ×
        </button>

        {/* IMAGE */}

        <div className="modal-image-container">

          {imagePreview ? (
            <img
              src={imagePreview}
              alt={title}
              className="modal-image"
            />
          ) : (
            <div className="image-placeholder">
              No Image Selected
            </div>
          )}

        </div>

        {/* CONTENT */}

        <div className="modal-content">

          {isViewMode ? (
            <>
              <h2>{title}</h2>

              <p>{description}</p>

              {post?.verified && (
                <span className="verified-badge">
                  ✓ Verified
                </span>
              )}
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Post Title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                maxLength={100}
              />

              <textarea
                placeholder="Post Description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                maxLength={1000}
              />

              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
              />

              <div className="modal-actions">

                <button
                  className="save-btn"
                  onClick={handleSubmit}
                >
                  Save Post
                </button>

                <button
                  className="cancel-btn"
                  onClick={onClose}
                >
                  Cancel
                </button>

              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
};

export default PostModal;