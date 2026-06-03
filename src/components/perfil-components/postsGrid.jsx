import { useState } from "react";

import PostCard from "./PostCard";
import PostModal from "./PostModal";

const PostsGrid = ({
  posts,
  setPosts,
  isAdmin,
}) => {
  const [selectedPost, setSelectedPost] =
    useState(null);

  const [modalMode, setModalMode] =
    useState("view");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  /* =========================
     VIEW POST
  ========================= */

  const handleViewPost = (post) => {
    setSelectedPost(post);
    setModalMode("view");
    setIsModalOpen(true);
  };

  /* =========================
     CREATE POST
  ========================= */

  const handleCreatePost = () => {
    setSelectedPost({
      id: Date.now(),
      title: "",
      description: "",
      image_url: "",
      verified: false,
    });

    setModalMode("create");
    setIsModalOpen(true);
  };

  /* =========================
     EDIT POST
  ========================= */

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  /* =========================
     DELETE POST
  ========================= */

  const handleDeletePost = (id) => {
    const confirmed =
      window.confirm(
        "Delete this post?"
      );

    if (!confirmed) return;

    setPosts((prevPosts) =>
      prevPosts.filter(
        (post) => post.id !== id
      )
    );

    /*
      Later:
      deletePost(id)
    */
  };

  /* =========================
     VERIFY POST
  ========================= */

  const handleVerifyPost = (id) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id
          ? {
              ...post,
              verified:
                !post.verified,
            }
          : post
      )
    );

    /*
      Later:
      update verified status
    */
  };

  /* =========================
     SAVE POST
  ========================= */

  const handleSavePost = (
    updatedPost
  ) => {
    if (modalMode === "create") {
      setPosts((prevPosts) => [
        updatedPost,
        ...prevPosts,
      ]);
    }

    if (modalMode === "edit") {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === updatedPost.id
            ? updatedPost
            : post
        )
      );
    }

    setIsModalOpen(false);
  };

  return (
    <section className="posts-section">

      <div className="posts-header">

        <h2>Posts</h2>

        {isAdmin && (
          <button
            className="create-post-btn"
            onClick={
              handleCreatePost
            }
          >
            + New Post
          </button>
        )}

      </div>

      {/* Grid */}

      {posts.length === 0 ? (
        <div className="empty-posts">

          <p>
            No posts available.
          </p>

        </div>
      ) : (
        <div className="posts-grid">

          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              onView={
                handleViewPost
              }
              onEdit={
                handleEditPost
              }
              onDelete={
                handleDeletePost
              }
              onVerify={
                handleVerifyPost
              }
            />
          ))}

        </div>
      )}

      {/* Modal */}

      <PostModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        mode={modalMode}
        post={selectedPost}
        onSave={handleSavePost}
        isAdmin={isAdmin}
      />

    </section>
  );
};

export default PostsGrid;