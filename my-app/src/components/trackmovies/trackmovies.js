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
      const response = await axios.get('https://amirghost14.pythonanywhere.com/api/user_movies/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });
      console.log('User movies response:', response.data);

      const userMovies = response.data;

      const movieRequests = userMovies.map(userMovie =>
        axios.get(`https://amirghost14.pythonanywhere.com/api/movies/${userMovie.movie}/`)
          .then(response => ({
            ...response.data,
            status: userMovie.status,
            air_date: userMovie.air_date || response.data.air_date 
          }))
      );

      const moviesData = await Promise.all(movieRequests);
      console.log('Movies data:', moviesData);

      setMovies(moviesData);
    } catch (error) {
      console.error('Error fetching user movies:', error);
    }
  };

  const applyFilter = () => {
    console.log('Applying filter:', filter);
    let filtered = [];
    if (filter === 'watch_list') {
      filtered = movies.filter(movie => {
        const movieAirDate = new Date(movie.air_date);
        console.log(`Movie: ${movie.title}, Status: ${movie.status}, Air Date: ${movieAirDate}`);
        return movie.status === 'not_watched' && movieAirDate <= today;
      });
    } else if (filter === 'upcoming') {
      filtered = movies.filter(movie => {
        const movieAirDate = new Date(movie.air_date);
        console.log(`Movie: ${movie.title}, Status: ${movie.status}, Air Date: ${movieAirDate}`);
        return movieAirDate > today;
      });
    }
    setFilteredMovies(filtered);
    console.log('Filtered movies:', filtered);
  };

  const handleMovieClick = (id) => {
    navigate(`/singlemovie/${id}`, { state: { from: 'track-movies' } });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDiscoverClick = () => {
    navigate('/discover');
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
        {filteredMovies.length === 0 ? (
          <p>No movies to display</p>
        ) : (
          filteredMovies.map(movie => (
            <div key={movie.id} className={`trackmovies-item ${filter === 'upcoming' ? 'upcoming' : 'watch-list'}`} onClick={() => handleMovieClick(movie.id)}>
              <img src={movie.image || showImage} alt={movie.title} />
              {filter === 'upcoming' && (
                <p className='trackmovies-itemp'>{Math.ceil((new Date(movie.air_date) - today) / (1000 * 60 * 60 * 24))} days</p>
              )}
            </div>
          ))
        )}
      </div>
      <div className="discover-more-container">
        <button className="discover-more-button" onClick={handleDiscoverClick}>Discover More Movies</button>
      </div>
      <Footer />
    </div>
  );
};

export default TrackMovies;
