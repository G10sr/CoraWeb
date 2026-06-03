import { useState, useRef, useEffect} from "react";

import pfStats from "..perfil-components/perfil-stats";
import Abtme from "..perfil-components/abtme";
import PostsGrid from "../components/PostsGrid";
import AdminLogin from "../components/AdminLogin";

const Perfil = () => {
  /*
    Temporary data.
    Later this will come from Supabase.
  */

  const [perfil, setPerfil, setPf] = useState({
    name: "Alan Brito",
    aboutMe:
      "Welcome to my profile. Here you'll find projects, achievements, and verified posts.",
    profileImage:
      "https://placehold.co/250x250/png",
  });

  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "My First Post",
      description: "Example description",
      image_url: "https://placehold.co/600x600/png",
      verified: true,
    },
    {
      id: 2,
      title: "Another Post",
      description: "Another example description",
      image_url: "https://placehold.co/600x600/png",
      verified: false,
    },
  ]);

  const [isAdmin, setIsAdmin] = useState(false);

  const verifiedCount = posts.filter(
    (post) => post.verified
  ).length;

  const totalPosts = posts.length;

  return (
    <main className="perfil-page">

      {/* Admin Login */}
      <AdminLogin
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      {/* info del perfil */}
      <perfil-stats
        perfil={perfil}
        setPerfil={setPerfil}
        isAdmin={isAdmin}
      />

      {/* stats */}
      <section className="stats">

        <div className="stat-card verified">
          <h2>{verifiedCount}</h2>
          <p>Verified</p>
        </div>

        <div className="stat-card connections">
          <h2>{totalPosts}</h2>
          <p>Connections</p>
        </div>

      </section>

      {/* About Me */}
      <AboutMe
        perfil={perfil}
        setPerfil={setPerfil}
        isAdmin={isAdmin}
      />

      {/* Posts */}
      <PostsGrid
        posts={posts}
        setPosts={setPosts}
        isAdmin={isAdmin}
      />

    </main>
  );
};

export default Perfil;