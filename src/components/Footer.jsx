import React from 'react';
import '../assets/styles/Footer.css'; 
import HomeIcon from '../assets/img/icons/house-solid-full.svg';
import ArchiveIcon from '../assets/img/icons/box-archive-solid-full.svg'
import WebIcon from '../assets/img/icons/globe-solid-full.svg'
import UsrIcon from '../assets/img/icons/circle-user-solid-full.svg'

const Footer = ({ style }) => {
  return (
    <footer className="footer" data-tour="footer">
      <nav className="footer-content">
        <a className="footer-item" href="/">
          <span className="footer-icon"><img src={HomeIcon} /></span>
          <span className="footer-label">Home</span>
        </a>
        <a className="footer-item" href="/archivero">
          <span className="footer-icon"><img src={ArchiveIcon} /></span>
          <span className="footer-label">Archivero</span>
        </a>
        <a className="footer-item" href="#">
          <span className="footer-icon"><img src={WebIcon} /></span>
          <span className="footer-label">Web informativa</span>
        </a>
        <a className="footer-item" href="/perfil">
          <span className="footer-icon"><img src={UsrIcon} /></span>
          <span className="footer-label">Perfil</span>
        </a>
      </nav>
    </footer>
  );
};

export default Footer;
