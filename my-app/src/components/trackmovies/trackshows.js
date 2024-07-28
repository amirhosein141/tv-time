import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './trackshows.css';
import Footer from '../Profile/Footer';

const TrackShow = () => {
  const [shows, setShows] = useState([]);
  const [filter, setFilter] = useState('watchlist');
  const [animatingEpisode, setAnimatingEpisode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserShows();
  }, []);

  const fetchUserShows = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/user_shows/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });

      const showsData = await Promise.all(
        response.data.map(async (userShow) => {
          const showResponse = await axios.get(`http://127.0.0.1:8000/api/shows/${userShow.show}/`, {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`,
            },
          });
          const episodesResponse = await axios.get(`http://127.0.0.1:8000/api/shows/${userShow.show}/episodes/`, {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`,
            },
          });

          return {
            ...showResponse.data,
            episodes: episodesResponse.data,
          };
        })
      );

      setShows(showsData);
    } catch (error) {
      console.error('Error fetching shows data:', error);
    }
  };

  const toggleEpisodeStatus = async (episodeId, currentStatus, showId) => {
    const newStatus = currentStatus === 'watched' ? 'not_watched' : 'watched';
    try {
      await axios.patch(`http://127.0.0.1:8000/api/episodes/${episodeId}/status/`, { status: newStatus }, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });

      const updatedShows = shows.map(show => {
        if (show.id === showId) {
          const updatedEpisodes = show.episodes.map(ep =>
            ep.id === episodeId ? { ...ep, status: newStatus } : ep
          );

          // Update show status based on episodes statuses
          const allEpisodesWatched = updatedEpisodes.every(ep => ep.status === 'watched');
          const anyEpisodeWatched = updatedEpisodes.some(ep => ep.status === 'watched');
          const newShowStatus = allEpisodesWatched ? 'watched' : (anyEpisodeWatched ? 'watching' : 'not_watched');

          if (show.status !== newShowStatus) {
            axios.patch(`http://127.0.0.1:8000/api/shows/${showId}/status/`, { status: newShowStatus }, {
              headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
              },
            });
          }

          return { ...show, episodes: updatedEpisodes, status: newShowStatus };
        }
        return show;
      });

      setShows(updatedShows);
      setAnimatingEpisode(episodeId);

      // Remove animation class after 2 seconds
      setTimeout(() => {
        setAnimatingEpisode(null);
      }, 2000);
    } catch (error) {
      console.error('Error updating episode status:', error);
    }
  };

  const getUpcomingEpisodes = () => {
    const upcoming = [];
    shows.forEach(show => {
      if (Array.isArray(show.episodes)) {
        show.episodes.forEach(episode => {
          const airDate = new Date(episode.air_date);
          const now = new Date();
          if (airDate > now) {
            const daysLeft = Math.ceil((airDate - now) / (1000 * 60 * 60 * 24));
            upcoming.push({ ...episode, daysLeft, show_title: show.title, show_image: show.image, show_id: show.id });
          }
        });
      }
    });
    return upcoming.sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const getWatchingEpisodes = () => {
    const watching = [];
    shows.forEach(show => {
      if (show.status === 'watching' && Array.isArray(show.episodes)) {
        const now = new Date();
        const notWatched = show.episodes.find(episode => episode.status === 'not_watched' && new Date(episode.air_date) <= now);
        if (notWatched) {
          const notWatchedCount = show.episodes.filter(ep => ep.status === 'not_watched' && new Date(ep.air_date) <= now).length - 1;
          watching.push({ ...notWatched, show_title: show.title, show_image: show.image, show_id: show.id, notWatchedCount });
        }
      }
    });
    return watching;
  };

  const getNotWatchedEpisodes = () => {
    const notWatched = [];
    shows.forEach(show => {
      if (show.status === 'not_watched' && Array.isArray(show.episodes)) {
        const now = new Date();
        const firstNotWatchedEpisode = show.episodes.find(episode => episode.status === 'not_watched' && new Date(episode.air_date) <= now);
        if (firstNotWatchedEpisode) {
          const notWatchedCount = show.episodes.filter(ep => ep.status === 'not_watched' && new Date(ep.air_date) <= now).length - 1;
          notWatched.push({ ...firstNotWatchedEpisode, show_title: show.title, show_image: show.image, show_id: show.id, notWatchedCount }); // اصلاح این خط
        }
      }
    });
    return notWatched;
  };
  

  const handleShowClick = (showId) => {
    navigate(`/singleshow/${showId}`);
  };

  const handleDiscoverMoreClick = () => {
    navigate('/discover');
  };

  const renderEpisodes = (episodes) => {
    return episodes.length > 0 ? (
      <ul>
        {episodes.map(episode => (
          <li
            key={episode.id}
            className={animatingEpisode === episode.id ? 'animating' : ''}
          >
            <img src={episode.show_image} alt={episode.show_title} className="episode-image" onClick={() => handleShowClick(episode.show_id)} />
            <div className="episode-info">
              <h4>{episode.show_title}</h4>
              <div className="episode-details">
                <p>S{episode.season_number} | E{episode.episode_number} 
                  {episode.notWatchedCount > 0 && <span className="not-watched-count">+{episode.notWatchedCount}</span>}
                </p>
              </div>
              <p>{episode.title}</p>
              {episode.daysLeft !== undefined && <p className="days-left">{episode.daysLeft} Days</p>}
            </div>
            {filter === 'watchlist' && (
              <button
                className={episode.status === 'watched' ? 'watched' : 'not-watched'}
                onClick={() => toggleEpisodeStatus(episode.id, episode.status, episode.show_id)}
              >
                {episode.status === 'watched' ? '✔' : ''}
              </button>
            )}
          </li>
        ))}
      </ul>
    ) : null;
  };

  return (
    <div className="trackshow-container">
      <button className="trackshow-back-button" onClick={() => navigate(-1)}>{'<'}</button>
      <div className="trackshow-buttons">
        <button onClick={() => setFilter('watchlist')} className={filter === 'watchlist' ? 'active' : ''}>Watch List</button>
        <button onClick={() => setFilter('upcoming')} className={filter === 'upcoming' ? 'active' : ''}>Upcoming</button>
      </div>
      <div className="episode-list">
        {shows.length === 0 && <p>No shows available</p>}
        {filter === 'watchlist' ? (
          <div className="episode-list1" >
            <div className="filter-section">
              <h4>Next to watch</h4>
            </div>
            {renderEpisodes(getWatchingEpisodes())}
            <div className="filter-section">
              <h4>Haven't Started</h4>
            </div>
            {renderEpisodes(getNotWatchedEpisodes())}
          </div>
        ) : (
          renderEpisodes(getUpcomingEpisodes())
        )}
        <button className="discover-more-button" onClick={handleDiscoverMoreClick}>
          Discover More Shows
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default TrackShow;
