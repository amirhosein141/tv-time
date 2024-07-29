import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './allmovies.css';
import showImage from '../Profile/assets/background.jpg';

const AllShows = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserMovies();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, movies]);

  const fetchUserMovies = async () => {
    try {
      const response = await axios.get('http://amirghost14.pythonanywhere.com/api/user_movies/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });
      const userMovies = response.data;

      const movieRequests = userMovies.map(userMovie =>
        axios.get(`http://amirghost14.pythonanywhere.com/api/movies/${userMovie.movie}/`)
      );

      const moviesResponses = await Promise.all(movieRequests);
      const moviesData = moviesResponses.map(response => response.data);

      setMovies(moviesData);
    } catch (error) {
      console.error('Error fetching user movies:', error);
    }
  };

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredMovies(movies);
    } else {
      setFilteredMovies(movies.filter(movie => movie.status === filter));
    }
  };

  const handleMovieClick = (id) => {
    navigate(`/singlemovie/${id}`, { state: { from: 'allmovies' } });
  };

  const handleBackClick = () => {
    navigate(-1); // هدایت به صفحه قبلی
  };

  return (
    <div className="allmovies-container">
      <div className='show-list0'>
        <button className="allmovies-back-button" onClick={handleBackClick}>{'<'}</button>
        <h2 className='allmovies-back-title'>Movies</h2>
      </div>
      <div className="allmovies-filter-container">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setFilter('watched')} className={filter === 'watched' ? 'active' : ''}>Watched</button>
        <button onClick={() => setFilter('not_watched')} className={filter === 'not_watched' ? 'active' : ''}>Not Watched</button>
      </div>
      <div className="allmovies-grid">
        {filteredMovies.map(movie => (
          <div key={movie.id} className="allmovies-item" onClick={() => handleMovieClick(movie.id)}>
            <img src={movie.image || showImage} alt={movie.title} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllShows;

