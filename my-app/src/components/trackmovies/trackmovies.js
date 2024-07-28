import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './trackmovies.css';
import showImage from '../Profile/assets/background.jpg';
import Footer from '../Profile/Footer';

const TrackMovies = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [filter, setFilter] = useState('watch_list');
  const today = new Date();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserMovies();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, movies]);

  const fetchUserMovies = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/user_movies/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });
      const userMovies = response.data;

      const movieRequests = userMovies.map(userMovie =>
        axios.get(`http://127.0.0.1:8000/api/movies/${userMovie.movie}/`)
      );

      const moviesResponses = await Promise.all(movieRequests);
      const moviesData = moviesResponses.map(response => response.data);

      setMovies(moviesData);
    } catch (error) {
      console.error('Error fetching user movies:', error);
    }
  };

  const applyFilter = () => {
    if (filter === 'watch_list') {
      setFilteredMovies(movies.filter(movie => movie.status === 'not_watched' && new Date(movie.air_date) <= today));
    } else if (filter === 'upcoming') {
      setFilteredMovies(movies.filter(movie => new Date(movie.air_date) > today));
    }
  };

  const handleMovieClick = (id) => {
    navigate(`/singlemovie/${id}`, { state: { from: 'track-movies' } });
  };

  const handleBackClick = () => {
    navigate(-1); // بازگشت به صفحه قبلی
  };

  const handleDiscoverClick = () => {
    navigate('/discover'); // هدایت به صفحه Discover
  };

  return (
    <div className="trackmovies-container">
      <div className='trackmovies-list0'>
        <button className="trackmovies-back-button" onClick={handleBackClick}>{'<'}</button>
        <h2 className='trackmovies-back-title'>Track Movies</h2>
      </div>
      <div className="trackmovies-filter-container">
        <button onClick={() => setFilter('watch_list')} className={filter === 'watch_list' ? 'active' : ''}>Watch List</button>
        <button onClick={() => setFilter('upcoming')} className={filter === 'upcoming' ? 'active' : ''}>Upcoming</button>
      </div>
      <div className="trackmovies-grid">
        {filteredMovies.map(movie => (
          <div key={movie.id} className={`trackmovies-item ${filter === 'upcoming' ? 'upcoming' : 'watch-list'}`} onClick={() => handleMovieClick(movie.id)}>
            <img src={movie.image || showImage} alt={movie.title} />
            {filter === 'upcoming' && (
              <p className='trackmovies-itemp'>{Math.ceil((new Date(movie.air_date) - today) / (1000 * 60 * 60 * 24))} days</p>
            )}
          </div>
        ))}
      </div>
      <div className="discover-more-container">
        <button className="discover-more-button" onClick={handleDiscoverClick}>Discover More Movies</button>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default TrackMovies;
