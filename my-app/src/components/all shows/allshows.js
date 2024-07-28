import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './allshows.css';
import showImage from '../Profile/assets/background.jpg';

const AllShows = () => {
  const [shows, setShows] = useState([]);
  const [filteredShows, setFilteredShows] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserShows();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, shows]);

  const fetchUserShows = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/user_shows/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });
      const userShows = response.data;

      const showRequests = userShows.map(userShow =>
        axios.get(`http://127.0.0.1:8000/api/shows/${userShow.show}/`)
      );

      const showsResponses = await Promise.all(showRequests);
      const showsData = showsResponses.map(response => response.data);

      setShows(showsData);
    } catch (error) {
      console.error('Error fetching user shows:', error);
    }
  };

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredShows(shows);
    } else {
      setFilteredShows(shows.filter(show => show.status === filter));
    }
  };

  const handleShowClick = (id) => {
    navigate(`/singleshow/${id}`, { state: { from: 'allshows' } });
  };

  const handleBackClick = () => {
    navigate(-1); // هدایت به صفحه قبلی
  };

  return (
    <div className="allshows-container">
      <div className='show-list0'>
        <button className="allshows-back-button" onClick={handleBackClick}>{'<'}</button>
        <h2 className='allshows-back-title'>Shows</h2>
      </div>
      <div className="allshows-filter-container">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setFilter('watching')} className={filter === 'watching' ? 'active' : ''}>Watching</button>
        <button onClick={() => setFilter('not_watched')} className={filter === 'not_watched' ? 'active' : ''}>Not Watched</button>
        <button onClick={() => setFilter('watched')} className={filter === 'watched' ? 'active' : ''}>Watched</button>
      </div>
      <div className="allshows-grid">
        {filteredShows.map(show => (
          <div key={show.id} className="allshows-item" onClick={() => handleShowClick(show.id)}>
            <img src={show.image || showImage} alt={show.title} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllShows;
