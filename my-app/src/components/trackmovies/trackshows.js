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

          const userEpisodesResponse = await axios.get('http://127.0.0.1:8000/api/user_episodes/', {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`,
            },
            params: {
              show_id: userShow.show,
            },
          });

          const userEpisodesMap = userEpisodesResponse.data.reduce((acc, ep) => {
            acc[ep.episode] = ep;
            return acc;
          }, {});

          const episodes = episodesResponse.data.map(ep => ({
            ...ep,
            user_status: userEpisodesMap[ep.id]?.status || 'not_watched',
            last_watched: userEpisodesMap[ep.id]?.last_watched || null,
          }));

          return {
            ...showResponse.data,
            episodes,
            userEpisodes: episodes,
            userShowId: userShow.id,
            status: userShow.status,
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
    const todayDate = new Date().toISOString().split('T')[0];

    try {
        // 1. اعمال انیمیشن برای اپیزود
        setAnimatingEpisode(episodeId);

        // 2. منتظر ماندن به مدت 2 ثانیه
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 3. آپدیت وضعیت اپیزود
        await axios.patch(`http://127.0.0.1:8000/api/user_episodes/${episodeId}/status/`, 
        {
            status: newStatus,
            last_watched: newStatus === 'watched' ? todayDate : null
        }, 
        {
            headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            },
        });

        // 4. به‌روزرسانی وضعیت اپیزودها در state
        setShows(prevShows => {
            return prevShows.map(show => {
                if (show.id === showId) {
                    const updatedUserEpisodes = show.userEpisodes.map(ep =>
                        ep.id === episodeId ? { ...ep, user_status: newStatus, last_watched: newStatus === 'watched' ? todayDate : null } : ep
                    );

                    // بررسی وضعیت جدید سریال
                    const allEpisodesWatched = updatedUserEpisodes.every(ep => ep.user_status === 'watched');
                    const anyEpisodeWatched = updatedUserEpisodes.some(ep => ep.user_status === 'watched');
                    const newShowStatus = allEpisodesWatched ? 'watched' : (anyEpisodeWatched ? 'watching' : 'not_watched');

                    // اگر وضعیت سریال تغییر کرده باشد، آن را به‌روزرسانی کن
                    if (show.status !== newShowStatus) {
                        axios.patch(`http://127.0.0.1:8000/api/user_shows/${show.userShowId}/status/`, 
                        { status: newShowStatus }, 
                        {
                            headers: {
                            'Authorization': `Token ${localStorage.getItem('token')}`,
                            },
                        }).then(response => {
                            console.log('Show status updated successfully:', response.data);
                        }).catch(error => {
                            console.error('Error updating show status:', error);
                        });
                    }

                    return { ...show, userEpisodes: updatedUserEpisodes, status: newShowStatus };
                }
                return show;
            });
        });

        // 5. غیر فعال کردن انیمیشن
        setAnimatingEpisode(null);

    } catch (error) {
        console.error('Error updating episode status:', error);
    }
};


  
  const getWatchingEpisodes = () => {
    const watching = [];
    const now = new Date();
    shows.forEach(show => {
      if (show.status === 'watching' && Array.isArray(show.userEpisodes)) {
        const notWatched = show.userEpisodes.find(episode => episode.user_status === 'not_watched' && new Date(episode.air_date) <= now);
        if (notWatched) {
          const notWatchedCount = show.userEpisodes.filter(ep => ep.user_status === 'not_watched' && new Date(ep.air_date) <= now).length - 1;
          watching.push({ ...notWatched, show_title: show.title, show_image: show.image, show_id: show.id, notWatchedCount });
        }
      }
    });
    
    return watching;
  };

  const getNotWatchedEpisodes = () => {
    const notWatched = [];
    const now = new Date();
    shows.forEach(show => {
      if (show.status === 'not_watched' && Array.isArray(show.userEpisodes)) {
        const firstNotWatchedEpisode = show.userEpisodes.find(episode => episode.user_status === 'not_watched' && new Date(episode.air_date) <= now);
        if (firstNotWatchedEpisode) {
          const notWatchedCount = show.userEpisodes.filter(ep => ep.user_status === 'not_watched' && new Date(ep.air_date) <= now).length - 1;
          notWatched.push({ ...firstNotWatchedEpisode, show_title: show.title, show_image: show.image, show_id: show.id, notWatchedCount });
        }
      }
    });
    
    return notWatched;
  };

  const getUpcomingEpisodes = () => {
    const upcoming = [];
    shows.forEach(show => {
      if (Array.isArray(show.userEpisodes)) {
        show.userEpisodes.forEach(episode => {
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

  const handleShowClick = (showId) => {
    navigate(`/singleshow/${showId}`);
  };

  const handleDiscoverMoreClick = () => {
    navigate('/discover');
  };

  const renderEpisodes = (episodes) => {
    return episodes.length > 0 ? (
      <ul>
        {episodes.map((episode, index) => (
          <li
            key={`${episode.id}-${index}`}
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
                className={episode.user_status === 'watched' ? 'watched' : 'not-watched'}
                onClick={() => toggleEpisodeStatus(episode.id, episode.user_status, episode.show_id)}
              >
                {episode.user_status === 'watched' ? '✔' : ''}
              </button>
            )}
          </li>
        ))}
      </ul>
    ) : <p></p>;
  };

  return (
    <div className="trackshow-container">
      <div className="trackshow-buttons">
        <button onClick={() => setFilter('watchlist')} className={filter === 'watchlist' ? 'active' : ''}>Watchlist</button>
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
