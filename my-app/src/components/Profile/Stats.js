import React, { useState, useEffect } from 'react';
import './Stats.css';

const Stats = () => {
  const [moviesWatched, setMoviesWatched] = useState(0);
  const [moviesTime, setMoviesTime] = useState({ months: 0, days: 0, hours: 0 });
  const [episodesWatched, setEpisodesWatched] = useState(0);
  const [tvTime, setTvTime] = useState({ months: 0, days: 0, hours: 0 });

  useEffect(() => {
    fetch('https://amirghost14.pythonanywhere.com/api/user_movies/', {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log('Movies data:', data);  // چاپ داده‌های کامل فیلم

        let totalMovieTime = 0;
        let watchedMoviesCount = 0;

        data.forEach(userMovie => {
          console.log('UserMovie:', userMovie);  // چاپ داده‌های هر فیلم به صورت جداگانه

          if (userMovie.movie_status === 'watched') {
            watchedMoviesCount += 1;
            totalMovieTime += userMovie.movie_runtime; // فرض می‌کنیم runtime به دقیقه است
          }
        });

        const movieHours = Math.floor(totalMovieTime / 60);
        const movieDays = Math.floor(movieHours / 24);
        const movieMonths = Math.floor(movieDays / 30);

        setMoviesWatched(watchedMoviesCount);
        setMoviesTime({
          months: movieMonths,
          days: movieDays % 30,
          hours: movieHours % 24,
        });
      })
      .catch(error => console.error('Error fetching movies:', error));

    fetch('https://amirghost14.pythonanywhere.com/api/user_shows/', {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log('Shows data:', data);
        let totalEpisodes = 0;
        let totalTvTime = 0;
        const avgEpisodeTime = 50; // فرض می‌کنیم متوسط زمان هر اپیزود 50 دقیقه است

        // دریافت اپیزودها برای هر سریال
        const fetchEpisodesPromises = data.map(show =>
          fetch(`https://amirghost14.pythonanywhere.com/api/shows/${show.show}/episodes/`, {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`,
            },
          })
            .then(response => response.json())
            .then(episodes => {
              console.log('Episodes for show:', show.show, episodes);
              episodes.forEach(episode => {
                if (episode.status === 'watched') {
                  totalEpisodes += 1;
                  totalTvTime += avgEpisodeTime;
                }
              });
            })
        );

        Promise.all(fetchEpisodesPromises).then(() => {
          const tvHours = Math.floor(totalTvTime / 60);
          const tvDays = Math.floor(tvHours / 24);
          const tvMonths = Math.floor(tvDays / 30);

          setEpisodesWatched(totalEpisodes);
          setTvTime({
            months: tvMonths,
            days: tvDays % 30,
            hours: tvHours % 24,
          });
        });
      })
      .catch(error => console.error('Error fetching shows:', error));
  }, []);

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
