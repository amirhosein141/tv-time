import React, { useState, useEffect } from 'react';
import './Header.css';
import profileImage from '../Profile/assets/background.jpg';

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/user/profile/', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}` // assuming you're storing the token in localStorage
      }
    })
      .then(response => response.json())
      .then(data => setUser(data))
      .catch(error => console.error('Error fetching user profile:', error));
  }, []);

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('profile_image', file);

    fetch('http://127.0.0.1:8000/api/user/profile/upload/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      },
      body: formData
    })
      .then(response => {
        console.log(response); // Log the response object
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('New profile image URL:', data.profile_image); // Check the response

        // Generate a random query parameter to avoid browser caching issues
        const newProfileImage = `${data.profile_image}?${new Date().getTime()}`;
        setUser(prevUser => ({
          ...prevUser,
          profile_image: newProfileImage // assuming the response contains the new profile image URL
        }));
      })
      .catch(error => console.error('Error uploading profile image:', error));
  };

  return (
    <header className="header">
      <img src={user ? user.profile_image || profileImage : profileImage} alt="Profile" key={user ? user.profile_image : 'default-profile'} />
      <h1>{user ? user.username : 'Loading...'}</h1>
      <input type="file" onChange={handleProfileImageUpload} />
    </header>
  );
};

export default Header;
