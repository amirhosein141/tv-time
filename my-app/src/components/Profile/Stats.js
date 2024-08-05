import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Stats.css';

const Stats = () => {
  const [moviesWatched, setMoviesWatched] = useState(0);
  const [moviesTime, setMoviesTime] = useState({ months: 0, days: 0, hours: 0 });
  const [episodesWatched, setEpisodesWatched] = useState(0);
  const [tvTime, setTvTime] = useState({ months: 0, days: 0, hours: 0 });

  useEffect(() => {
    fetchUserMovies();
    fetchUserShows();
  }, []);

  const fetchUserMovies = async () => {
    try {
      const response = await axios.get('https://amirghost14.pythonanywhere.com/api/user_movies/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });
      console.log('Movies data:', response.data);

      let totalMovieTime = 0;
      let watchedMoviesCount = 0;

      response.data.forEach(userMovie => {
        if (userMovie.status === 'watched') {
          watchedMoviesCount += 1;
          if (userMovie.movie_runtime) {
            totalMovieTime += userMovie.movie_runtime; 
          }
        }
      });

      const movieHours = Math.floor(totalMovieTime / 60);
      const movieDays = Math.floor(movieHours / 24);
      const movieMonths = Math.floor(movieDays / 30);

      console.log('Total Movie Time:', totalMovieTime);
      console.log('Movie Hours:', movieHours);
      console.log('Movie Days:', movieDays);
      console.log('Movie Months:', movieMonths);

      setMoviesWatched(watchedMoviesCount);
      setMoviesTime({
        months: movieMonths,
        days: movieDays % 30,
        hours: movieHours % 24,
      });
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchUserShows = async () => {
    try {
        const response = await axios.get('https://amirghost14.pythonanywhere.com/api/user_episodes/', {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
            },
        });
        console.log('User Episodes data:', response.data);

        let totalEpisodes = 0;
        let totalTvTime = 0;
        const avgEpisodeTime = 50; 

        response.data.forEach(userEpisode => {
            if (userEpisode.status === 'watched') {
                totalEpisodes += 1;
                totalTvTime += avgEpisodeTime; 
            }
        });

        const tvHours = Math.floor(totalTvTime / 60); 
        const tvDays = Math.floor(tvHours / 24); 
        const tvMonths = Math.floor(tvDays / 30); 

        setEpisodesWatched(totalEpisodes);
        setTvTime({
            months: tvMonths,
            days: tvDays % 30,
            hours: tvHours % 24,
        });
    } catch (error) {
        console.error('Error fetching user episodes:', error);
    }
};


  return (
    <div className="stats">
      <div className="stat-item">
        <h3>TV time</h3>
        <p>{`${tvTime.months} Months ${tvTime.days} Days ${tvTime.hours} Hours`}</p>
      </div>
      <div className="stat-item">
        <h3>Episodes watched</h3>
        <p>{episodesWatched}</p>
      </div>
      <div className="stat-item">
        <h3>Movie time</h3>
        <p>{`${moviesTime.months} Months ${moviesTime.days} Days ${moviesTime.hours} Hours`}</p>
      </div>
      <div className="stat-item">
        <h3>Movies watched</h3>
        <p>{moviesWatched}</p>
      </div>
    </div>
  );
};

export default Stats;
