const PostCard = ({
  post,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onVerify,
}) => {
  return (
    <article className="post-card">

      {/* Post Image */}

      <div
        className="post-image-container"
        onClick={() => onView(post)}
      >
        <img
          src={post.image_url}
          alt={post.title}
          className="post-image"
        />

        {post.verified && (
          <div className="post-verified-badge">
            ✓ Verified
          </div>
        )}
      </div>

      {/* Post Information */}

      <div className="post-info">

        <h3>{post.title}</h3>

        <p>
          {post.description.length > 80
            ? `${post.description.substring(
                0,
                80
              )}...`
            : post.description}
        </p>

      </div>

      {/* Admin Controls */}

      {isAdmin && (
        <div className="post-admin-controls">

          <button
            className="edit-btn"
            onClick={() => onEdit(post)}
          >
            Edit
          </button>

          <button
            className="delete-btn"
            onClick={() => onDelete(post.id)}
          >
            Delete
          </button>

          <button
            className="verify-btn"
            onClick={() => onVerify(post.id)}
          >
            {post.verified
              ? "Unverify"
              : "Verify"}
          </button>

        </div>
      )}

    </article>
  );
};

export default PostCard;