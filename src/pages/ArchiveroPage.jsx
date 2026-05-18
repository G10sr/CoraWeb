import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import logo from "../assets/img/CoraLogo.png";
import "../assets/styles/ArchiveroPage.css";
import basura1 from "../assets/img/basura1.jpg";
import basura2 from "../assets/img/basura2.jpg";
import basura3 from "../assets/img/basura3.webp";

const imagePool = [basura1, basura2, basura3];
const allowedRegions = ["Colegio CTP CIT", "Soda armonia"];

const defaultDescription = (name, region) =>
  `${name} es un punto de recoleccion en ${region}. Reporte verificado por la comunidad Cora.`;

const allPoints = [
  { id: 1, name: "Punto Central", image: logo, region: "Colegio CTP CIT", description: "Punto principal de referencia en el campus. Ideal para depositos organicos y reciclables." },
  { id: 2, name: "Punto Norte", image: basura1, region: "Colegio CTP CIT", description: "Zona norte del colegio con alta afluencia estudiantil. Se recomienda separar plastico y carton." },
  { id: 3, name: "Punto Sur", image: basura2, region: "Soda armonia", description: "Ubicado cerca de la soda. Punto frecuente para residuos de consumo diario." },
  { id: 4, name: "Punto Este", image: basura3, region: "Colegio CTP CIT", description: "Area este con buena visibilidad. Punto activo para reportes de la comunidad." },
  { id: 5, name: "Punto Oeste", image: basura2, region: "Soda armonia", description: "Punto oeste con acceso rapido desde la entrada lateral." },
  { id: 6, name: "Punto Plaza", image: basura1, region: "Soda armonia", description: "En la plaza central. Espacio abierto para recoleccion mixta controlada." },
  { id: 7, name: "Punto Parque", image: basura3, region: "Colegio CTP CIT", description: "Junto al area verde. Prioridad en residuos organicos y material reciclable." },
  { id: 8, name: "Punto Colegio", image: basura1, region: "Soda armonia", description: "Frente al edificio principal. Punto de facil acceso para estudiantes." },
  { id: 9, name: "Punto Mercado", image: basura2, region: "Soda armonia", description: "Cerca del mercado escolar. Alto volumen de envases y empaques." },
];

const commentsStorageKey = (pointId) => `archiveroComments_${pointId}`;

const loadComments = (pointId) => {
  try {
    const raw = localStorage.getItem(commentsStorageKey(pointId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveComments = (pointId, comments) => {
  localStorage.setItem(commentsStorageKey(pointId), JSON.stringify(comments));
};

const carouselSections = ["Carrusel principal", "Puntos frecuentes", "Agregados recientemente"];
const regionOptions = allowedRegions;
const storageKey = "archiveroPoints";
const getItemsPerView = () => {
  if (window.innerWidth <= 640) {
    return 1;
  }
  if (window.innerWidth <= 900) {
    return 2;
  }
  return 3;
};

function PointDetailModal({ point, onClose }) {
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(() => loadComments(point.id));

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSubmitComment = (event) => {
    event.preventDefault();
    const text = commentText.trim();
    const author = commentAuthor.trim() || "Anonimo";
    if (!text) return;

    const newComment = {
      id: Date.now(),
      author,
      text,
      createdAt: new Date().toISOString(),
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    saveComments(point.id, updated);
    setCommentText("");
  };

  return (
    <div className="archivero-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="archivero-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="archivero-modal-title"
      >
        <button type="button" className="archivero-modal-close" onClick={onClose} aria-label="Cerrar">
          <span aria-hidden="true">&times;</span>
        </button>

        <div className="archivero-modal-hero">
          <img className="archivero-modal-image" src={point.image} alt={point.name} />
          <div className="archivero-modal-hero-overlay" />
          <span className="archivero-modal-region-badge">{point.region}</span>
        </div>

        <div className="archivero-modal-body">
          <header className="archivero-modal-header">
            <h2 id="archivero-modal-title" className="archivero-modal-title">
              {point.name}
            </h2>
            <p className="archivero-modal-description">
              {point.description || defaultDescription(point.name, point.region)}
            </p>
          </header>

          <section className="archivero-comments">
            <h3 className="archivero-comments-title">
              Comentarios
              <span className="archivero-comments-count">{comments.length}</span>
            </h3>
            <form className="archivero-comment-form" onSubmit={handleSubmitComment}>
              <input
                type="text"
                className="archivero-comment-input"
                placeholder="Tu nombre (opcional)"
                value={commentAuthor}
                onChange={(event) => setCommentAuthor(event.target.value)}
              />
              <textarea
                className="archivero-comment-textarea"
                placeholder="Escribe tu opinion sobre este punto..."
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                rows={3}
                required
              />
              <button type="submit" className="archivero-comment-submit">
                Publicar comentario
              </button>
            </form>
            <ul className="archivero-comments-list">
              {comments.length === 0 ? (
                <li className="archivero-comments-empty">Se el primero en comentar este punto.</li>
              ) : (
                comments.map((comment) => (
                  <li className="archivero-comment-item" key={comment.id}>
                    <div className="archivero-comment-header">
                      <strong>{comment.author}</strong>
                      <time dateTime={comment.createdAt}>
                        {new Date(comment.createdAt).toLocaleString("es-CR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </time>
                    </div>
                    <p>{comment.text}</p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function ArchiveroPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [itemsPerView, setItemsPerView] = useState(getItemsPerView);
  const [carouselIndexes, setCarouselIndexes] = useState(() =>
    Object.fromEntries(carouselSections.map((sectionTitle) => [sectionTitle, 0])),
  );
  const [savedPoints] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map((point) => {
        const region = allowedRegions.includes(point.region) ? point.region : "Colegio CTP CIT";
        return {
          id: point.id,
          name: point.name,
          region,
          image: imagePool[Math.abs(Number(point.id) || 0) % imagePool.length],
          description: point.description || defaultDescription(point.name, region),
        };
      });
    } catch {
      return [];
    }
  });

  const mergedPoints = useMemo(() => [...savedPoints, ...allPoints], [savedPoints]);

  const filteredPoints = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    return mergedPoints.filter((point) => {
      const matchesSearch = !normalizedTerm || point.name.toLowerCase().includes(normalizedTerm);
      const matchesRegion = selectedRegion === "all" || point.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, selectedRegion, mergedPoints]);

  useEffect(() => {
    const handleResize = () => setItemsPerView(getItemsPerView());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const maxStartIndex = Math.max(0, filteredPoints.length - itemsPerView);
    setCarouselIndexes((current) =>
      Object.fromEntries(
        carouselSections.map((sectionTitle) => [sectionTitle, Math.min(current[sectionTitle] || 0, maxStartIndex)]),
      ),
    );
  }, [filteredPoints.length, itemsPerView]);

  const maxStartIndex = Math.max(0, filteredPoints.length - itemsPerView);
  const moveCarousel = (sectionTitle, direction) => {
    setCarouselIndexes((current) => {
      const currentIndex = current[sectionTitle] || 0;
      const nextIndex = Math.min(maxStartIndex, Math.max(0, currentIndex + direction));
      return { ...current, [sectionTitle]: nextIndex };
    });
  };

  return (
    <div className="archivero-page">
      <Header />
      <div className="archivero-page-content">
        <div className="archivero-search-wrap">
          <input
            className="archivero-search"
            type="search"
            placeholder="Buscar punto..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select
            className="archivero-region-filter"
            value={selectedRegion}
            onChange={(event) => setSelectedRegion(event.target.value)}
          >
            <option value="all">Todas las regiones</option>
            {regionOptions.map((region) => (
              <option value={region} key={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <h1 className="archivero-page-title" contentEditable suppressContentEditableWarning>
          Archivero-Cora
        </h1>

        {carouselSections.map((sectionTitle) => (
          <section className="archivero-section" key={sectionTitle}>
            <h2 className="archivero-section-title">{sectionTitle}</h2>
            <div className="archivero-carousel-base">
              <button
                className="archivero-carousel-btn"
                type="button"
                aria-label="Anterior"
                onClick={() => moveCarousel(sectionTitle, -1)}
                disabled={carouselIndexes[sectionTitle] === 0}
              >
                {"<"}
              </button>
              <div className="archivero-carousel-track">
                <div
                  className="archivero-carousel-slider"
                  style={{
                    transform: `translateX(-${(carouselIndexes[sectionTitle] * 100) / itemsPerView}%)`,
                    "--items-per-view": itemsPerView,
                  }}
                >
                  {filteredPoints.map((point) => (
                    <button
                      type="button"
                      className="archivero-carousel-item"
                      key={`${sectionTitle}-${point.id}`}
                      onClick={() => setSelectedPoint(point)}
                    >
                      <img className="archivero-carousel-image" src={point.image} alt={point.name} />
                      <span>{point.name}</span>
                      <small className="archivero-item-region">{point.region}</small>
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="archivero-carousel-btn"
                type="button"
                aria-label="Siguiente"
                onClick={() => moveCarousel(sectionTitle, 1)}
                disabled={carouselIndexes[sectionTitle] >= maxStartIndex}
              >
                {">"}
              </button>
            </div>
          </section>
        ))}

        <h2 className="archivero-all-title">Todos los puntos</h2>
        <div className="archivero-list">
          {filteredPoints.map((point) => (
            <button
              type="button"
              className="archivero-list-item"
              key={point.id}
              onClick={() => setSelectedPoint(point)}
            >
              <img className="archivero-list-image" src={point.image} alt={point.name} />
              <div className="archivero-list-text">
                <span className="archivero-list-name">{point.name}</span>
                <small className="archivero-item-region">{point.region}</small>
              </div>
            </button>
          ))}
        </div>
      </div>
      {selectedPoint && (
        <PointDetailModal point={selectedPoint} onClose={() => setSelectedPoint(null)} />
      )}
      <Footer />
    </div>
  );
}

export default ArchiveroPage;
