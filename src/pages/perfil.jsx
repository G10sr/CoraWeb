import React from "react";
import "../assets/styles/Perfil.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import usr_img from "../assets/img/usr_unk.jpeg";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import ArchiveIcon from "../assets/img/box-archive-solid-full.svg";

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
      style={{
        height: "120px",
        width: "100%",
        borderRadius: "10px",
        overflow: "hidden",
        cursor: "pointer"
      }}
    >
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
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
  const navigate = useNavigate();

  let verifiedPosts = 0;


  const [posts, setPosts] = useState([]);
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
            id: "edd33b43-0cb5-477a-b574-8ae8949cd5bf",
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
      <div className="header">
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
      </div>

      <div className="content">
        <h1 className="nature-title">{perfil ? perfil.nombre : "Cargando..."}</h1>

        <section>
          <h2 className="nature-title">Sobre Mí</h2>
          <p>{perfil ? perfil.descripcion : "Cargando..."}</p>
        </section>

        <section>
          <h2 className="nature-title">Publicados</h2>
          <div className="posts-grid">
            {posts.map((post, index) => (
              <div className="post-card" key={index}>
                <div className={`verification-status ${post.verified ? 'verified' : 'unverified'}`}>
                  {post.verified ? 'Verificado' : 'No verificado'}
                </div>
                <div className="mini-map-wrapper">
                  <MiniMap position={post.position} />
                </div>
                <div className="post-info">
                  <p><strong>Región:</strong> {post.region}</p>
                  <p><strong>Tipo de Residuo:</strong> {post.wasteType}</p>
                  <p><strong>Cantidad:</strong> {post.amount}</p>
                  <p><strong>Pendiente:</strong> {post.slope}</p>
                  <p><strong>Cercanía al Agua:</strong> {post.waterProximity}</p>
                  <p><strong>Nivel de Riesgo:</strong> {post.riskLevel}</p>
                  <p><strong>Tipo de Material:</strong> {post.materialType}</p>
                  <p><strong>Reportado por:</strong> {post.name}</p>
                  <p><strong>Fecha:</strong> {post.timestamp}</p>
                </div>
                <div className="post-actions">
                  <span>✎</span>
                  <span>🗑</span>
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
                    style={{ width: "inherit", filter: "invert(0.02)" }}
                    src={ArchiveIcon}
                    alt="Archivar"
                  />
                </div>              </div>
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