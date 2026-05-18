import MyMapComponent from '../components/myMapComponent';
import '../assets/styles/MapaHome.css';
import Header from "../components/Header";
import Footer from "../components/Footer";

function MapaHome() {
    return (
        <div className="app">
            <Header />
            <div className="map-container">
                <MyMapComponent />
            </div>
            <Footer />
        </div>
    );
}

export default MapaHome;
