import React, { useState, useEffect } from 'react';
import './Header.css';
import profileImage1 from '../Profile/assets/background.jpg';
import profileImage2 from '../Profile/assets/back3.jpg';
import profileImage3 from '../Profile/assets/back2.jpg';
import profileImage4 from '../Profile/assets/background.jpg';

const Header = () => {
  const [user, setUser] = useState(null);
  const profileImages = [profileImage1, profileImage2, profileImage3, profileImage4];

  const getRandomProfileImage = () => {
    const randomIndex = Math.floor(Math.random() * profileImages.length);
    return profileImages[randomIndex];
  };

  useEffect(() => {
    fetch('https://amirghost14.pythonanywhere.com/api/user/profile/', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        data.profile_image = data.profile_image || getRandomProfileImage();
        setUser(data);
      })
      .catch(error => console.error('Error fetching user profile:', error));
  }, []);

  return (
    <header className="header">
      <img src={user ? user.profile_image : getRandomProfileImage()} alt="Profile" key={user ? user.profile_image : 'default-profile'} />
      <h1>{user ? user.username : 'Loading...'}</h1>
    </header>
  );
};

export default Header;

