import { useNavigate } from 'react-router-dom';
import '../assets/styles/Header.css';
import logo from '../assets/img/CoraLogo.png';
import adminIcon from '../assets/img/icons/file.svg';

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

const Header = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isAdmin = user?.rol === 2;

  return (
    <header className="main-header">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo-img" />
      </div>

      {isAdmin && (
        <button
          type="button"
          className="admin-header-btn"
          onClick={() => navigate('/admin')}
          aria-label="Ir al panel de administración"
        >
          <img src={adminIcon} alt="" className="admin-header-icon" />
          <span>Admin</span>
        </button>
      )}
    </header>
  );
};

export default Header;