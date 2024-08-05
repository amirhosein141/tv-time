
import React from 'react';
import Header from '../Profile/Header';
import Stats from '../Profile/Stats';
import Footer from '../Profile/Footer';
import Movies from '../Profile/Movies';
import Shows from '../Profile/Shows';
import './profile-contianer.css'
const ProfileContainer = () => {
  return (
    <div className="profile-container">
      <Header />
      <Stats />
      <div className="content">
        <Shows />
        <Movies />
      </div>
      <Footer />
    </div>
  );
}

export default ProfileContainer;
