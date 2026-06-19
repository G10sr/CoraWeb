// --- IMPORTACIONES ---
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents, Circle, CircleMarker, Pane } from 'react-leaflet';

import { supabase } from '../lib/supabaseClient';

// AgenteCora: analisis de riesgo del formulario
import { analyzeReport } from '../agent/agenteCora';
import '../assets/styles/AgenteCora.css';


// Rectangulo de calificacion que AgenteCora coloca junto al punto
function RiskCard({ analysis }) {
    if (!analysis?.valid) return null;
    return (
        <div className="cora-risk-card" style={{ '--risk-hex': analysis.hex }}>
            <div className="cora-risk-card-head">
                <span className="cora-risk-dot" />
                AgenteCora: Riesgo {analysis.nivel}
            </div>
            <div className="cora-risk-card-body">
                <span className="cora-risk-score">{analysis.score}/100</span> &middot; {analysis.recomendacion}
            </div>
        </div>
    );
}

function mapReporteToMarker(reporte) {
    return {
        id: reporte.id,
        position: [reporte.latitud, reporte.longitud],
        name: reporte.reportado_por ? String(reporte.reportado_por) : 'Anónimo',
        region: reporte.region_name || 'Sin región',
        verified: reporte.verificado || false,
        wasteType: reporte.tipo_residuo,
        amount: reporte.cantidad,
        slope: reporte.pendiente,
        waterProximity: reporte.cercania_agua,
        riskLevel: reporte.riesgo_contaminacion,
        materialType: reporte.clasificacion_material,
        timestamp: reporte.fecha_creacion ? new Date(reporte.fecha_creacion).toLocaleTimeString() : new Date().toLocaleTimeString(),
    };
}

function getRealtimeReportPayload(payload) {
    return payload?.new ?? payload?.record ?? payload?.payload?.new ?? payload;
}

// Importación de activos para los marcadores
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configuración de iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// --- SUB-COMPONENTES LÓGICOS ---
function MapEventsHandler({ onMapClick, isActive }) {
    useMapEvents({
        click: (e) => {
            if (isActive) onMapClick(e.latlng);
        },
    });
    return null;
}

function RecenterMap({ position, disabled }) {
    const map = useMap();

    useEffect(() => {
        if (position && !disabled) {
            map.flyTo(position, 16);
        }
    }, [position, map, disabled]);

    return null;
}

function FocusMap({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 16);
        }
    }, [position, map]);

    return null;
}

// --- COMPONENTE PRINCIPAL ---
function MyMapComponent() {
    const USER_ID = JSON.parse(localStorage.getItem("user")).id;
const location = useLocation();
const navigate = useNavigate();
    const focusPoint = location.state?.focus;
    const skipLocationFly = location.state?.skipLocationFly;
    const [focusPosition, setFocusPosition] = useState(null);
    const [userPosition, setUserPosition] = useState(null);
    const [customMarkers, setCustomMarkers] = useState([]);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [regionOptions, setRegionOptions] = useState([]);
    const [perfil, setPerfil] = useState(null);
    const [locationEnabled, setLocationEnabled] = useState(() => {
        return localStorage.getItem("locationEnabled") === "true";
    });


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

            console.log("Respuesta completa:", data);
            console.log("Perfil:", data.perfil);
            console.log("Nombre:", data.perfil?.nombre);

            setPerfil(data.perfil);

        } catch (error) {
            console.error(error);
        }
    }
    const [tempMarker, setTempMarker] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        region: '',
        wasteType: 'organico',
        amount: '',
        slope: 'plano',
        waterProximity: '˂50m',
        riskLevel: 'bajo',
        materialType: 'reciclable'
    });

    useEffect(() => {
        if (perfil) {
            setFormData(prev => ({
                ...prev,
                name: perfil.nombre || ''
            }));
        }
    }, [perfil]);

    useEffect(() => {
        if (tempMarker) {
            cargarPerfil();
        }
    }, [tempMarker]);

    useEffect(() => {
        const cargarRegiones = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/regiones");
                const data = await response.json();
                if (!data.ok) {
                    throw new Error(data.message || "Error al cargar regiones");
                }
                const opciones = data.regiones.map((region) => region.region_name);
                setRegionOptions(opciones);
                setFormData((prev) => ({
                    ...prev,
                    region: prev.region || opciones[0] || ''
                }));
            } catch (error) {
                console.error("Error al cargar regiones:", error);
            }
        };
        cargarRegiones();
    }, []);

useEffect(() => {
    if (!focusPoint) return;

    setFocusPosition(focusPoint);

    window.history.replaceState({}, document.title);
}, [focusPoint]);

    useEffect(() => {
        if (locationEnabled && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserPosition([
                        pos.coords.latitude,
                        pos.coords.longitude
                    ]);
                },
                (error) => {
                    console.error(error);
                },
                { enableHighAccuracy: true }
            );
        }
    }, [locationEnabled]);

    async function cargarReportes() {
        try {
            const response = await fetch("http://localhost:3000/api/reportes");
            const data = await response.json();

            if (!data.ok) {
                throw new Error(data.message || "Error al cargar reportes");
            }

            const puntos = data.reportes.map((reporte) => ({
                id: reporte.id,
                position: [reporte.latitud, reporte.longitud],
                name: reporte.reportado_por || 'Anónimo',
                region: reporte.region_name || 'Sin región',
                verified: reporte.verificado || false,
                wasteType: reporte.tipo_residuo,
                amount: reporte.cantidad,
                slope: reporte.pendiente,
                waterProximity: reporte.cercania_agua,
                riskLevel: reporte.riesgo_contaminacion,
                materialType: reporte.clasificacion_material,
                timestamp: reporte.fecha_creacion ? new Date(reporte.fecha_creacion).toLocaleTimeString() : new Date().toLocaleTimeString()
            }));

            console.log("Reportes cargados:", puntos.length, puntos);
            setCustomMarkers(puntos);
        } catch (error) {
            console.error("Error al cargar reportes:", error);
        }
    }

    useEffect(() => {
        cargarReportes();

        const channel = supabase
            .channel('reportes-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes' }, (payload) => {
                console.debug('Realtime reportes payload:', payload);
                const eventType = payload.eventType || payload.event || payload.type;
                const registro = payload.record || payload.new || null;
                const oldRegistro = payload.old_record || payload.old || null;

                if (eventType === 'INSERT' && registro?.id) {
                    setCustomMarkers((current) => {
                        const nuevo = mapReporteToMarker(registro);
                        return [nuevo, ...current.filter((item) => item.id !== registro.id)];
                    });
                }
                if (eventType === 'UPDATE' && registro?.id) {
                    setCustomMarkers((current) => current.map((item) => (item.id === registro.id ? mapReporteToMarker(registro) : item)));
                }
                if (eventType === 'DELETE' && oldRegistro?.id) {
                    setCustomMarkers((current) => current.filter((item) => item.id !== oldRegistro.id));
                }
            });

        channel.subscribe((status) => console.debug('MyMapComponent realtime status:', status));

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, []);

    const activateLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
                (error) => alert("Error al obtener ubicación: " + error.message),
                { enableHighAccuracy: true }
            );
        }
    };

    const handleMapClick = (latlng) => {
        setFormData({
            name: '',
            region: regionOptions[0] || '',
            wasteType: 'organico',
            amount: '',
            slope: 'plano',
            waterProximity: '˂50m',
            riskLevel: 'bajo',
            materialType: 'reciclable'
        });
        setTempMarker({
            position: [latlng.lat, latlng.lng],
            timestamp: new Date().toLocaleTimeString()
        });
    };

    const toggleLocation = () => {
        if (locationEnabled) {
            // Desactivar ubicación
            setUserPosition(null);
            setLocationEnabled(false);
            localStorage.setItem("locationEnabled", "false");
            return;
        }

        // Activar ubicación
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserPosition([
                        pos.coords.latitude,
                        pos.coords.longitude
                    ]);

                    setLocationEnabled(true);
                    localStorage.setItem("locationEnabled", "true");
                },
                (error) => {
                    alert("Error al obtener ubicación: " + error.message);
                },
                { enableHighAccuracy: true }
            );
        }
    };
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount) {
            alert("Por favor completa los campos obligatorios antes de guardar.");
            return;
        }

        setCargando(true);

        try {
            const response = await fetch("http://localhost:3000/api/reportes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    usuarioId: USER_ID,
                    regionName: formData.region,
                    wasteType: formData.wasteType,
                    amount: Number(formData.amount),
                    slope: formData.slope,
                    waterProximity: formData.waterProximity,
                    riskLevel: formData.riskLevel,
                    materialType: formData.materialType,
                    latitud: tempMarker.position[0],
                    longitud: tempMarker.position[1],
                }),
            });

            const data = await response.json();

            if (!data.ok) {
                throw new Error(data.message || "Error al guardar el reporte");
            }

            await cargarPerfil();
            await cargarReportes();

            alert("Punto registrado correctamente");
            setTempMarker(null);

        } catch (error) {
            console.error("Error al guardar el reporte:", error);
            alert("Hubo un error al guardar el reporte. " + error.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>

            {/* Cuadro Flotante - UI */}
            <div style={{
                position: 'fixed',
                top: '80px',
                left: '20px',
                zIndex: 1000,
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                minWidth: '220px'
            }}>
                <h2 className="nature-title" style={{ margin: '0', fontSize: '1.3rem' }}>Cora Web</h2>

                <button
                    data-tour="location"
                    onClick={toggleLocation}
                    style={btnStyle(locationEnabled ? '#4dcec5' : '#00978D')}
                >
                    {locationEnabled
                        ? 'Desactivar ubicación'
                        : 'Activar mi ubicación'}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button data-tour="register" onClick={() => setIsAddingMode(true)} style={btnStyle(isAddingMode ? '#A7BD8A' : '#688f35')}>
                        Registrar punto de localización de residuos
                    </button>
                    {isAddingMode && (
                        <button onClick={() => { setIsAddingMode(false); setTempMarker(null); }} style={btnStyle('#a1303c')}>
                            Cancelar / Terminar
                        </button>
                    )}
                </div>
            </div>

            <MapContainer center={[9.9772, -84.1833]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FocusMap position={focusPosition} />

                <RecenterMap
                    position={userPosition}
                    disabled={skipLocationFly}
                />
                <MapEventsHandler onMapClick={handleMapClick} isActive={isAddingMode} />

                {/* precisión */}
                {userPosition && (
                    <Pane name="user-layer" style={{ zIndex: 1000 }}>
                        <Circle
                            center={userPosition}
                            radius={50}
                            pathOptions={{
                                color: "#2A93EE",
                                fillColor: "#2A93EE",
                                fillOpacity: 0.15,
                                weight: 1,
                            }}
                        />

                        <CircleMarker
                            center={userPosition}
                            radius={8}
                            pathOptions={{
                                color: "#fff",
                                weight: 2,
                                fillColor: "#2A93EE",
                                fillOpacity: 1,
                            }}
                        >
                            <Popup>Ubicación actual</Popup>
                        </CircleMarker>
                    </Pane>
                )}

                {/* Marcador temporal con el Formulario */}
                {tempMarker && (
                    <Marker position={tempMarker.position}>
                        <Popup onClose={() => setTempMarker(null)}>

                            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                                <strong style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Detalles del Reporte</strong>

                                <label style={{ fontSize: '0.8rem' }}>Reportado por:</label>
                                <input
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ padding: '5px' }}
                                />

                                <label style={{ fontSize: '0.8rem' }}>Región:</label>
                                <select
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    style={{ padding: '5px' }}
                                >
                                    {regionOptions.length > 0 ? (
                                        regionOptions.map((region) => (
                                            <option value={region} key={region}>{region}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Cargando regiones...</option>
                                    )}
                                </select>

                                {/* Tipo de Residuo */}
                                <label style={{ fontSize: '0.8rem' }}>Tipo de residuo:</label>
                                <select value={formData.wasteType} onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })} style={{ padding: '5px' }}>
                                    <option value="organico">Orgánico</option>
                                    <option value="plastico">Plástico</option>
                                    <option value="vidrio">Vidrio</option>
                                    <option value="metal">Envases metálicos</option>
                                    <option value="carton">Cartón</option>
                                    <option value="papel">Papel</option>
                                </select>

                                {/* Cantidad de Residuos */}
                                <label style={{ fontSize: '0.8rem' }}>Cantidad de residuos:</label>
                                <input
                                    type="number"
                                    placeholder="Cantidad"
                                    min="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    style={{ padding: '5px' }}
                                />

                                {/* Pendiente */}
                                <label style={{ fontSize: '0.8rem' }}>Pendiente:</label>
                                <select value={formData.slope} onChange={(e) => setFormData({ ...formData, slope: e.target.value })} style={{ padding: '5px' }}>
                                    <option value="plano">Plano</option>
                                    <option value="leve">Leve</option>
                                    <option value="pronunciada">Pronunciada</option>
                                    <option value="intensa">Intensa</option>
                                </select>

                                {/* Cercania a Cuerpos de agua */}
                                <label style={{ fontSize: '0.8rem' }}>Cercanía al cuerpo de agua:</label>
                                <select value={formData.waterProximity} onChange={(e) => setFormData({ ...formData, waterProximity: e.target.value })} style={{ padding: '5px' }}>
                                    <option value="˂50m">˂50m</option>
                                    <option value="≥100m">≥100m</option>
                                    <option value="≥500m">≥500m</option>
                                </select>

                                {/* Riesgo de contaminación */}
                                <label style={{ fontSize: '0.8rem' }}>Riesgo de contaminación:</label>
                                <select value={formData.riskLevel} onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })} style={{ padding: '5px' }}>
                                    <option value="bajo">Bajo</option>
                                    <option value="medio">Medio</option>
                                    <option value="alto">Alto</option>
                                </select>

                                {/* Tipo de Material */}
                                <label style={{ fontSize: '0.8rem' }}>El material clasifica como:</label>
                                <select value={formData.materialType} onChange={(e) => setFormData({ ...formData, materialType: e.target.value })} style={{ padding: '5px' }}>
                                    <option value="reciclable">Reciclable</option>
                                    <option value="no reciclable">No reciclable</option>
                                </select>

                                {(() => {
                                    const preview = analyzeReport(formData);
                                    if (!preview.valid) return null;
                                    return (
                                        <div className="cora-form-risk" style={{ '--risk-hex': preview.hex }}>
                                            <strong>AgenteCora: Riesgo {preview.nivel} ({preview.score}/100)</strong>
                                            {preview.recomendacion}
                                        </div>
                                    );
                                })()}

                                <button type="submit" disabled={cargando} style={btnStyle(cargando ? '#ccc' : '#00978D')}>
                                    {cargando ? 'Guardando...' : 'Guardar Punto'}
                                </button>
                            </form>
                        </Popup>
                    </Marker>
                )}

                {/* Marcadores */}
                {customMarkers.map((marker) => {
                    const analysis = analyzeReport(marker);
                    return (
                        <Marker key={marker.id} position={marker.position}>
                            {analysis.valid && (
                                <Tooltip permanent direction="right" offset={[12, 0]} className="cora-risk-tooltip">
                                    <RiskCard analysis={analysis} />
                                </Tooltip>
                            )}
                            <Popup>
                                <strong>Reporte: {marker.id}</strong><br />
                                <b>Por:</b> {marker.name}<br />
                                <b>Región:</b> {marker.region}<br />
                                <b>Tipo:</b> {marker.wasteType}<br />
                                <b>Cantidad:</b> {marker.amount}<br />
                                <b>Riesgo declarado:</b> {marker.riskLevel}<br />
                                <b>Estado:</b> {marker.verified ? "Verificado" : "No verificado"}<br />
                                {analysis.valid && (
                                    <>
                                        <hr style={{ margin: '6px 0' }} />
                                        <b style={{ color: analysis.hex }}>
                                            AgenteCora: Riesgo {analysis.nivel} ({analysis.score}/100)
                                        </b><br />
                                        <span style={{ fontSize: '0.8rem' }}>{analysis.recomendacion}</span><br />
                                    </>
                                )}
                                <small style={{ color: '#888' }}>{marker.timestamp}</small>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

const btnStyle = (color) => ({
    padding: '10px', backgroundColor: color, color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
});

export default MyMapComponent;