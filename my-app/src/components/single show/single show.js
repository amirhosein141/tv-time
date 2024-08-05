import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './singleshow.css';

const ShowList = () => {
    const [show, setShow] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const { id } = useParams();
    const [showEpisodes, setShowEpisodes] = useState(false);
    const [isInUserList, setIsInUserList] = useState(false);
    const [userShowId, setUserShowId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`https://amirghost14.pythonanywhere.com/api/shows/${id}/`)
            .then(response => {
                setShow(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the show!', error);
            });

        axios.get(`https://amirghost14.pythonanywhere.com/api/user_shows/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
            },
        })
        .then(response => {
            const userShows = response.data;
            const userShow = userShows.find(userShow => userShow.show === parseInt(id));
            if (userShow) {
                setIsInUserList(true);
                setUserShowId(userShow.id);
            } else {
                setIsInUserList(false);
            }
        })
        .catch(error => console.error('Error fetching user shows:', error));
    }, [id]);

    const fetchEpisodes = () => {
        if (showEpisodes) {
            setShowEpisodes(false);
        } else {
            axios.get(`https://amirghost14.pythonanywhere.com/api/shows/${id}/episodes/`)
                .then(response => {
                    setEpisodes(response.data);
    

                    axios.get(`https://amirghost14.pythonanywhere.com/api/user_episodes/`, {
                        headers: {
                            'Authorization': `Token ${localStorage.getItem('token')}`,
                        },
                        params: {
                            show_id: id,
                        },
                    })
                    .then(userEpisodeResponse => {
                        const userEpisodes = userEpisodeResponse.data;
                        const updatedEpisodes = response.data.map(episode => {
                            const userEpisode = userEpisodes.find(ue => ue.episode === episode.id);
                            if (userEpisode) {
                                return { ...episode, user_status: userEpisode.status };
                            }
                            return { ...episode, user_status: 'not_watched' };
                        });
                        setEpisodes(updatedEpisodes);
                        setShowEpisodes(true);
                    })
                    .catch(error => {
                        console.error('Error fetching user episodes:', error);
                    });
                })
                .catch(error => {
                    console.error('There was an error fetching the episodes!', error);
                });
        }
    };
    

    const updateShowStatus = (newStatus) => {
        console.log(`Updating show status to ${newStatus}`);
        axios.patch(`https://amirghost14.pythonanywhere.com/api/user_shows/${userShowId}/status/`, 
            { status: newStatus }, 
            {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                },
            }
        )
        .then(response => {
            setShow(prevShow => ({ ...prevShow, status: newStatus }));
        })
        .catch(error => {
            console.error('Error updating show status:', error);
        });
    };

    const toggleEpisodeStatus = (episodeId, currentStatus) => {
        const newStatus = currentStatus === 'watched' ? 'not_watched' : 'watched';
        const todayDate = new Date().toISOString().split('T')[0];
    
        console.log(`Toggling episode status to ${newStatus} for episode ${episodeId}`);
        axios.patch(`https://amirghost14.pythonanywhere.com/api/user_episodes/${episodeId}/status/`, 
            { 
                status: newStatus, 
                last_watched: newStatus === 'watched' ? todayDate : null 
            },
            {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            }
        )
        .then(response => {
           
            setEpisodes(prevEpisodes =>
                prevEpisodes.map(ep => 
                    ep.id === episodeId ? { ...ep, user_status: newStatus, last_watched: newStatus === 'watched' ? todayDate : null } : ep
                )
            );
    
            
            const updatedEpisodes = episodes.map(ep =>
                ep.id === episodeId ? { ...ep, user_status: newStatus, last_watched: newStatus === 'watched' ? todayDate : null } : ep
            );
    
            const anyWatched = updatedEpisodes.some(ep => ep.user_status === 'watched');
            const allWatched = updatedEpisodes.every(ep => ep.user_status === 'watched');
    
            if (allWatched) {
                updateShowStatus('watched');
            } else if (anyWatched) {
                updateShowStatus('watching');
            } else {
                updateShowStatus('not_watched');
            }
        })
        .catch(error => {
            console.error('Error updating episode status:', error);
        });
    };
    

    const handleUserListToggle = () => {
        const url = `https://amirghost14.pythonanywhere.com/api/user_shows/add/`;
        const data = { show: id };
        const headers = {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        };

        if (isInUserList) {
            console.log(`Removing show with ID ${userShowId} from user's list`);
            axios.delete(`https://amirghost14.pythonanywhere.com/api/user_shows/${userShowId}/`, { headers })
                .then(() => {
                    setIsInUserList(false);
                    setUserShowId(null);
                    setEpisodes([]); 
                })
                .catch(error => console.error('Error removing show from user list:', error));
        } else {
            console.log(`Adding show with ID ${id} to user's list`);
            axios.post(url, data, { headers })
                .then(response => {
                    const { user_show, user_episodes } = response.data;
                    setIsInUserList(true);
                    setUserShowId(user_show.id);
                    setEpisodes(user_episodes); 
                })
                .catch(error => console.error('Error adding show to user list:', error));
        }
    };

    const calculateDaysLeft = (airDate) => {
        const airDateTime = new Date(airDate).getTime();
        const now = new Date().getTime();
        const daysLeft = Math.ceil((airDateTime - now) / (1000 * 60 * 60 * 24));
        return daysLeft;
    };

    if (!show) {
        return <div>Loading...</div>;
    }

    return (
        <div className="single-container">
            <button className="singleshow-back-button" onClick={() => navigate(-1)}>←</button>
            <div className="single-show-card">
                <div className="show-info-container">
                    <img className="single-show-image" src={show.image} alt={show.title} />
                    <div className='single-show-content'>
                        <h2 className="single-show-title">{show.title}</h2>
                        <div className="single-show-info">Start Year: {show.start_year}</div>
                        <div className="single-show-info">Genres: {show.genres}</div>
                        <div className="single-show-info">Seasons: {show.seasons}</div>
                        <div className="single-show-info">Platform: {show.platform}</div>
                        <div className="single-show-info">Imdb-rating: {show.imdb_rating}</div>
                        <div className="single-show-info">Avg time: {show.average_episode_duration} minutes</div>
                        <div className="single-show-info">
                            Actors:
                            <ul>
                                {show.actors.map(actor => (
                                    <li key={actor.id}>{actor.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className='single-show-description'>
                    <p className='single-show-description1'>{show.description}</p>
                </div>
                <button className="show-list-button" onClick={fetchEpisodes}>EPISODES</button>
                {showEpisodes && (
                    <div className="episode-list">
                        <h3>Episodes</h3>
                       <ul>
    {episodes.map(episode => {
        const daysLeft = calculateDaysLeft(episode.air_date);
        const airDate = new Date(episode.air_date);
        const now = new Date();
        return (
            <li key={episode.id}>
                S{episode.season_number}E{episode.episode_number}: {episode.title}
                {airDate > now ? (
                    <span className="days-left">{daysLeft} Days</span>
                ) : (
                    <button
                        className={episode.user_status === 'watched' ? 'watched' : 'not-watched'}
                        onClick={() => toggleEpisodeStatus(episode.id, episode.user_status)}
                    >
                        {episode.user_status === 'watched' ? '✔' : ''}
                    </button>
                )}
            </li>
        );
    })}
</ul>

                    </div>
                )}
                <button 
                    className={`show-list-toggle-button ${isInUserList ? 'remove' : 'add'}`} 
                    onClick={handleUserListToggle}
                >
                    {isInUserList ? 'Remove Show' : 'Add Show'}
                </button>
            </div>
        </div>
    );
};

export default ShowList;
