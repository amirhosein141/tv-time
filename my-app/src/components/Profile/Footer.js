import React from 'react';
import './Footer.css';
import {Link} from "react-router-dom"
import {Route,Routes} from "react-router-dom"
import Discover from '../Discover/Discover';
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-item">
      <Link to="/trackshows">
              Shows
      </Link>
      </div>
      <div className="footer-item">
      <Link to="/trackmovies">
              Movies
      </Link>
      </div>
      <div className="footer-item">
      <Link to="/discover">
              Discover
      </Link>
      </div>
      <div className="footer-item">
      <Link to="/profile">
              Profile
      </Link>
      </div>
    </footer>
  );
}

export default Footer;
