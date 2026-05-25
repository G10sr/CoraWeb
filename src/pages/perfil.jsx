import React from "react";
import "../assets/styles/perfil.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Profile() {
  let verifiedPosts = 0;

  // Crear 80 posts con verified en false por defecto
  const posts = Array.from({ length: 80 }, () => ({
    verified: false
  }));

  // Marcar algunos como true
  posts[3].verified = true;
  posts[9].verified = true;
  posts[10].verified = true;
  posts[25].verified = true;
  posts[47].verified = true;
  posts[79].verified = true;

  // Contar los verificados
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].verified === true) {
      verifiedPosts++;
    }
  }

  console.log("Posts verificados:", verifiedPosts);
  return (
    <div className="profile-container">
      <Header />
      <div className="header">
        <div className="avatar"></div>

        <div className="stats">
          <div>
            <strong>{posts.length}</strong>
            <span>Posts</span>
          </div>
          <div>
            <strong>{verifiedPosts}</strong>
            <span>Verificados</span>
          </div>
        </div>
      </div>

      <div className="content">
        <h1>Francella</h1>

        <section>
          <h2>Sobre Mí</h2>
          <p>Ahorita me :D de esto</p>
        </section>

        <section>
          <h2>Publicados</h2>
          <div className="posts-grid">
            {posts.map((_, index) => (
              <div className="post-card" key={index}>
                <div className="post-actions">
                  <span>✎</span>
                  <span>🗑</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
      }} />
    </div>
  );
};

export default Profile;