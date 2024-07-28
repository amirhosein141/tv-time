import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Shows.css';

const Shows = () => {
  const [userShows, setUserShows] = useState([]);
  const [shows, setShows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserShows();
  }, []);

  useEffect(() => {
    if (userShows.length > 0) {
      fetchShowsData();
    }
  }, [userShows]);

  const fetchUserShows = () => {
    fetch('http://127.0.0.1:8000/api/user_shows/', {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        setUserShows(data);
      })
      .catch(error => console.error('Error fetching user shows:', error));
  };

  const fetchShowsData = () => {
    const showRequests = userShows.map(userShow => 
      fetch(`http://127.0.0.1:8000/api/shows/${userShow.show}/`)
        .then(response => response.json())
        .then(show => 
          fetch(`http://127.0.0.1:8000/api/shows/${userShow.show}/episodes/`, {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`,
            },
          })
          .then(response => response.json())
          .then(episodes => {
            const lastWatchedEpisode = episodes
              .filter(episode => episode.last_watched)
              .sort((a, b) => new Date(b.last_watched) - new Date(a.last_watched))[0];
            return { ...show, lastWatched: lastWatchedEpisode ? lastWatchedEpisode.last_watched : null };
          })
        )
    );

    Promise.all(showRequests)
      .then(showData => {
        const sortedShows = showData.sort((a, b) => {
          if (a.lastWatched && b.lastWatched) {
            return new Date(b.lastWatched) - new Date(a.lastWatched);
          } else if (a.lastWatched) {
            return -1;
          } else if (b.lastWatched) {
            return 1;
          } else {
            return 0;
          }
        });
        setShows(sortedShows);
      })
      .catch(error => console.error('Error fetching shows:', error));
  };

  const handleShowClick = (id) => {
    navigate(`/singleshow/${id}`);
  };

  const handleBackClick = () => {
    navigate('/allshows');
  };

  const handleEpisodeWatched = (showId, episodeId) => {
    fetch(`http://127.0.0.1:8000/api/episodes/${episodeId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'watched' }),
    })
    .then(response => response.json())
    .then(() => {
      // Refetch the show data after updating the episode status
      fetchShowsData();
    })
    .catch(error => console.error('Error updating episode status:', error));
  };

  return (
    <section className="shows">
      <h2>My Shows</h2>
      <div className='allmovies-button-container'>
        <button className="allmovies-button" onClick={handleBackClick}>&gt;</button>
      </div>
      <div className="show-list">
        {shows.slice(0, 6).map(show => ( // فقط ۶ آیتم اول را نمایش دهید
          <div key={show.id} className="show-item" onClick={() => handleShowClick(show.id)}>
            <img src={show.image} alt={show.title} />
          </div>
        ))}
        {shows.length === 0 && (
          <div className="no-shows-message">
            <p>No shows found in this category.</p>
            <button onClick={() => navigate('/discover')}>Discover More Shows</button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Shows;
