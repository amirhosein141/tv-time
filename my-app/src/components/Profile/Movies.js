import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Movies.css';

const Movies = () => {
  const [userMovies, setUserMovies] = useState([]);
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://amirghost14.pythonanywhere.com/api/user_movies/', {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUserMovies(data);
      })
      .catch(error => console.error('Error fetching user movies:', error));
  }, []);

  useEffect(() => {
    if (userMovies.length > 0) {
      const movieRequests = userMovies.map(userMovie => 
        fetch(`https://amirghost14.pythonanywhere.com/api/movies/${userMovie.movie}/`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
      );

      Promise.all(movieRequests)
        .then(movieData => {
          movieData.sort((a, b) => new Date(b.last_watched) - new Date(a.last_watched));
          setMovies(movieData.slice(0, 6)); // محدود کردن تعداد فیلم‌ها به 6 تا
        })
        .catch(error => console.error('Error fetching movies:', error));
    }
  }, [userMovies]);

  const handleMovieClick = (id) => {
    navigate(`/singlemovie/${id}`);
  };

  const handleBackClick = () => {
    navigate('/allmovies');
  };

  return (
    <section className="movies">
      <h2>My Movies</h2>
      <div className='allmovies-button-container'>
        <button className="allmovies-button" onClick={handleBackClick}>&gt;</button> {/* دکمه بازگشت */}
      </div>
      <div className="movie-list">
        {movies.map(movie => (
          <div key={movie.id} className="movie-item" onClick={() => handleMovieClick(movie.id)}>
            <img src={movie.image} alt={movie.title} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default Movies;
