import { useEffect, useState } from "react";

import ProfileHeader from "../components/Profile/ProfileHeader";
import PostGrid from "../components/Posts/PostGrid";
import Skeleton from "../components/UI/Skeleton";

import {
  fetchProfile,
  fetchPosts,
  updateProfile,
  updatePost,
} from "../services/fakeApi";

const ProfilePage = () => {
  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [profile, setProfile] = useState(null);

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [editingProfile, setEditingProfile] = useState(false);

  const [editingPostId, setEditingPostId] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, postsData] = await Promise.all([
          fetchProfile(),
          fetchPosts(),
        ]);

        setProfile(profileData);

        setPosts(postsData);
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | PROFILE HANDLERS
  |--------------------------------------------------------------------------
  */

  const handleProfileSave = async (updatedProfile) => {
    try {
      const savedProfile = await updateProfile(updatedProfile);

      setProfile(savedProfile);

      setEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | POST HANDLERS
  |--------------------------------------------------------------------------
  */

  const handlePostSave = async (postId, updatedPost) => {
    try {
      const savedPost = await updatePost(postId, updatedPost);

      const updatedPosts = posts.map((post) =>
        post.id === postId ? savedPost : post
      );

      setPosts(updatedPosts);

      setEditingPostId(null);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F4EA] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <Skeleton type="profile" />

          <div className="mt-10">
            <Skeleton type="posts" count={6} />
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#F6F4EA] px-4 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* PROFILE HEADER */}

        <ProfileHeader
          profile={profile}
          editingProfile={editingProfile}
          setEditingProfile={setEditingProfile}
          onSave={handleProfileSave}
        />

        {/* POSTS SECTION */}

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#003C43]">
              Community Posts
            </h2>

            <span className="text-sm text-[#135D66]">
              {posts.length} total posts
            </span>
          </div>

          <PostGrid
            posts={posts}
            editingPostId={editingPostId}
            setEditingPostId={setEditingPostId}
            onSavePost={handlePostSave}
          />
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
