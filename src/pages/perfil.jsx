import React from "react";
import "../assets/styles/perfil.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";

function Profile() {
  let verifiedPosts = 0;



  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  async function cargarPerfil() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/load-perfil",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: "fad9312f-7005-41ad-89b4-bada3e8deba6",
          }),
        }
      );

      const data = await response.json();

      console.log("Perfil cargado:", data);

      setPerfil(data.perfil); // 👈 AQUÍ está la clave

    } catch (error) {
      console.error(error);
    }
  }


    // Crear 80 posts con verified en false por defecto
const posts = (perfil?.puntos_registrados ?? []).map((punto, i) => ({
  ...punto,
  index: i,
  verified: false,
}));


  // Contar los verificados
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].verified === true) {
      verifiedPosts++;
    }
  }

  console.log("Posts verificados:", verifiedPosts);
  return (
    <div className="profile-container page-transition">
      <div className="header">
        <div className="avatar">
          <img src={perfil ? perfil.perfil_img : "https://via.placeholder.com/150"} alt="Avatar" />
        </div>

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
        <h1 className="nature-title">{perfil ? perfil.nombre : "Cargando..."}</h1>

        <section>
          <h2>Sobre Mí</h2>
          <p>{perfil ? perfil.descripcion : "Cargando..."}</p>
        </section>

        <section>
          <h2 className="nature-title">Publicados</h2>
          <div className="posts-grid">
            {posts.map((post, index) => (
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