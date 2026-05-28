import PostCard from "./PostCard";

const PostGrid = ({
  posts,
  editingPostId,
  setEditingPostId,
  onSavePost,
}) => {
  if (!posts.length) {
    return (
      <div
        className="
          flex
          min-h-[300px]
          items-center
          justify-center
          rounded-3xl
          border
          border-dashed
          border-[#d8d3c3]
          bg-white
          text-[#135D66]
        "
      >
        No posts available yet.
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-6
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isEditing={editingPostId === post.id}
          setEditingPostId={setEditingPostId}
          onSavePost={onSavePost}
        />
      ))}
    </div>
  );
};

export default PostGrid;
