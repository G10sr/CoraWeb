import React from "react";
import "../assets/styles/Perfil.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import usr_img from "../assets/img/usr_unk.jpeg";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import ArchiveIcon from "../assets/img/icons/box-archive-solid-full.svg";




function MiniMap({ position }) {
  const navigate = useNavigate();

  if (!position) return null;

  const handleClick = () => {
    navigate("/", {
      state: { focus: position }
    });
  };

  return (
    <div
      onClick={handleClick}
      className="mini-map-wrapper"
    >
      <MapContainer
        center={position}
        zoom={15}
        className="leaflet-map"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} />
      </MapContainer>
    </div>
  );
}

function Profile() {
  const USER_ID = "edd33b43-0cb5-477a-b574-8ae8949cd5bf";
  const navigate = useNavigate();

  let verifiedPosts = 0;


  const [posts, setPosts] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [BannerImage, setBannerImage] = useState("");

  useEffect(() => {
    cargarPerfil();
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/api/nature-image")
      .then((r) => r.json())
      .then((data) => setBannerImage(data.image));
  }, []);

  const eliminarPost = async (postId) => {
    const confirmar = window.confirm(
      "¿Deseas eliminar este reporte?"
    );

    if (!confirmar) return;

    try {
      // Eliminar de Firebase
      await deleteDoc(doc(db, "reportes", postId));

      // Eliminar referencia del perfil
      await fetch("http://localhost:3000/api/eliminar-punto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: USER_ID,
          puntoId: postId,
        }),
      });

      // Actualizar la UI
      setPosts((prev) =>
        prev.filter((post) => post.id !== postId)
      );

      alert("Reporte eliminado correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el reporte");
    }
  };
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
            id: USER_ID,
          }),
        }
      );

      const data = await response.json();

      console.log("Perfil cargado:", data);

      setPerfil(data.perfil);

    } catch (error) {
      console.error(error);
    }
  }


  useEffect(() => {
    if (perfil?.puntos_registrados?.length > 0) {
      cargarPostsFirebase();
    }
  }, [perfil]);

  async function cargarPostsFirebase() {
    try {
      const postsFirebase = await Promise.all(
        perfil.puntos_registrados.map(async (postId, index) => {
          const docRef = doc(db, "reportes", postId);
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            console.warn(`No existe el reporte ${postId}`);
            return null;
          }

          const data = docSnap.data();

          return {
            id: docSnap.id,
            index,
            verified: data.verified || false,
            position: [data.latitud, data.longitud],
            name: data.reportado_por || "Anónimo",
            region: data.region,
            wasteType: data.tipo_residuo,
            amount: data.cantidad,
            slope: data.pendiente,
            waterProximity: data.cercania_agua,
            riskLevel: data.riesgo_contaminacion,
            materialType: data.clasificacion_material,
            timestamp: data.fecha_creacion
              ? new Date(data.fecha_creacion.seconds * 1000).toLocaleTimeString()
              : new Date().toLocaleTimeString(),
          };
        })
      );

      setPosts(postsFirebase.filter(post => post !== null));
    } catch (error) {
      console.error("Error cargando posts:", error);
    }
  }


  // Contar los verificados
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].verified === true) {
      verifiedPosts++;
    }
  }

  console.log("Posts verificados:", verifiedPosts);
  return (
    <div className="profile-container page-transition">
      <div className="header" style={{ backgroundImage: `url(${BannerImage})` }}>
        <div className="avatar">
          <img
            src={perfil?.perfil_img ?? usr_img}
            alt="Avatar"
          />
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

      <div className="content">
        <h1 className="nature-title">{perfil ? perfil.nombre : "Cargando..."}</h1>

        <section>
          <h2 className="aboutme">Sobre Mí</h2>
          <p>{perfil ? perfil.descripcion : "Cargando..."}</p>
        </section>

        <section>
          <h2 className="nature-title">Publicados</h2>
          <div className="posts-grid">
            {perfil && posts.length === 0 ? (
              <div className="no-posts-message">
                Tu cuenta no tiene posts asociados.
              </div>
            ) : (
              posts.map((post, index) => (
                <div className="post-card" key={index}>
                  <div className={`verification-status ${post.verified ? 'verified' : 'unverified'}`}>
                    {post.verified ? 'Verificado' : 'No verificado'}
                  </div>

                  <div className="mini-map-wrapper">
                    <MiniMap position={post.position} />
                  </div>

                  <div className="post-info">
                    <h3 className="post-title">
                      Reporte de {post.wasteType} en {post.region}
                    </h3>

                    <p className="post-description">
                      Se detectó una acumulación de <strong>{post.amount}</strong> de residuos
                      clasificados como <strong>{post.materialType}</strong>. El área presenta una
                      pendiente <strong>{post.slope}</strong> y una cercanía al agua de nivel{" "}
                      <strong>{post.waterProximity}</strong>, lo que genera un riesgo de
                      contaminación <strong>{post.riskLevel}</strong>.
                    </p>

                    <div className="post-footer">
                      <span>👤 {post.name}</span>
                      <span>📅 {post.timestamp}</span>
                    </div>
                  </div>

                  <div className="post-actions">
                    <span>✎</span>

                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => eliminarPost(post.id)}
                    >
                      🗑
                    </span>
                  </div>

                  <div
                    className="post-archive"
                    onClick={() =>
                      navigate("/archivero", {
                        state: {
                          pointId: post.id,
                        },
                      })
                    }
                  >
                    <img
                      className="archive-icon"
                      src={ArchiveIcon}
                      alt="Archivar"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Perfil;