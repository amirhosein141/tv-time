import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Discover.css';
import Footer from '../Profile/Footer';
import logo from '../Discover/logo.png';

const Discover = () => {
    const [shows, setShows] = useState([]);
    const [movies, setMovies] = useState([]);
    const [search, setSearch] = useState('');
    const [addedShows, setAddedShows] = useState([]);
    const [addedMovies, setAddedMovies] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios.get('http://127.0.0.1:8000/api/shows/')
            .then(response => setShows(response.data))
            .catch(error => console.error('Error fetching shows:', error));

        axios.get('http://127.0.0.1:8000/api/movies/')
            .then(response => setMovies(response.data))
            .catch(error => console.error('Error fetching movies:', error));
        
        axios.get('http://127.0.0.1:8000/api/user_shows/', {
            headers: { 'Authorization': `Token ${token}` }
        })
        .then(response => setAddedShows(response.data))
        .catch(error => console.error('Error fetching user shows:', error));
        
        axios.get('http://127.0.0.1:8000/api/user_movies/', {
            headers: { 'Authorization': `Token ${token}` }
        })
        .then(response => setAddedMovies(response.data))
        .catch(error => console.error('Error fetching user movies:', error));
    }, []);

    const filteredShows = shows.filter(show => show.title.toLowerCase().includes(search.toLowerCase()));
    const filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(search.toLowerCase()));

    const sortedShows = filteredShows.sort((a, b) => {
        const aInList = addedShows.some(show => show.show === a.id);
        const bInList = addedShows.some(show => show.show === b.id);
        return aInList - bInList;
    }).slice(0, 6);

    const sortedMovies = filteredMovies.sort((a, b) => {
        const aInList = addedMovies.some(movie => movie.movie === a.id);
        const bInList = addedMovies.some(movie => movie.movie === b.id);
        return aInList - bInList;
    }).slice(0, 6);

    const handleAddClick = (id, type) => {
        const token = localStorage.getItem('token');
        const url = type === 'show' ? 'http://127.0.0.1:8000/api/user_shows/add/' : 'http://127.0.0.1:8000/api/user_movies/';
        const data = type === 'show' ? { show: id } : { movie: id };
    
        if (type === 'show') {
            const addedShow = addedShows.find(show => show.show === id);
            if (addedShow) {
                axios.delete(`http://127.0.0.1:8000/api/user_shows/${addedShow.id}/`, {
                    headers: { 'Authorization': `Token ${token}` }
                })
                .then(() => {
                    setAddedShows(addedShows.filter(show => show.id !== addedShow.id));
                    setAddedEpisodes(addedEpisodes.filter(ep => ep.show !== id));  // Remove episodes of the show
                })
                .catch(error => console.error('Error removing show:', error.response?.data || error.message));
            } else {
                axios.post(url, data, {
                    headers: { 
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (response && response.data) {
                        const { user_show, user_episodes } = response.data;
                        setAddedShows([...addedShows, user_show]);
                        setAddedEpisodes([...addedEpisodes, ...user_episodes]);  // Add episodes of the show
                    } else {
                        console.error('Unexpected response structure:', response);
                    }
                })
                .catch(error => console.error('Error adding show:', error.response?.data || error.message));
            }
        } else {
            const addedMovie = addedMovies.find(movie => movie.movie === id);
            if (addedMovie) {
                axios.delete(`http://127.0.0.1:8000/api/user_movies/${addedMovie.id}/`, {
                    headers: { 'Authorization': `Token ${token}` }
                })
                .then(() => {
                    setAddedMovies(addedMovies.filter(movie => movie.id !== addedMovie.id));
                })
                .catch(error => console.error('Error removing movie:', error.response?.data || error.message));
            } else {
                axios.post(url, data, {
                    headers: { 
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (response && response.data) {
                        setAddedMovies([...addedMovies, response.data]);
                    } else {
                        console.error('Unexpected response structure:', response);
                    }
                })
                .catch(error => console.error('Error adding movie:', error.response?.data || error.message));
            }
        }
    };
    

    const handleShowClick = (id) => {
        navigate(`/singleshow/${id}`);
    };

    const handleMovieClick = (id) => {
        navigate(`/singlemovie/${id}`);
    };

    return (
        <div className="discover-container">
            <div className="search-bar-container">
                <img src={logo} alt="Logo" className="logo" />
                <input
                    type="text"
                    placeholder="Search shows and movies"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="search-bar"
                />
            </div>
            <div className="discover-section">
                <h2 className="discover-h2">Top shows for you</h2>
                <div className="row discover-shows-grid">
                    {sortedShows.map(show => (
                        <div key={show.id} className="col-6 col-sm-4 col-md-3 col-lg-2 mb-4 discover-show-item" onClick={() => handleShowClick(show.id)}>
                            <button
                                className="add-button"
                                onClick={(e) => { e.stopPropagation(); handleAddClick(show.id, 'show'); }}
                            >
                                {addedShows.some(addedShow => addedShow.show === show.id) ? '✔' : '+'}
                            </button>
                            <img src={show.image} alt={show.title} />
                            <div className="item-details">
                                <h3>{show.title}</h3>
                                <div className="rating">
                                    <span className="star">★</span>
                                    <p>Rate: {show.imdb_rating}</p>  
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="discover-section">
                <h2 className="discover-h2">Trending movies</h2>
                <div className="row discover-movies-grid">
                    {sortedMovies.map(movie => (
                        <div key={movie.id} className="col-6 col-sm-4 col-md-3 col-lg-2 mb-4 discover-movie-item" onClick={() => handleMovieClick(movie.id)}>
                            <button
                                className="add-button"
                                onClick={(e) => { e.stopPropagation(); handleAddClick(movie.id, 'movie'); }}
                            >
                                {addedMovies.some(addedMovie => addedMovie.movie === movie.id) ? '✔' : '+'}
                            </button>
                            <img src={movie.image} alt={movie.title} />
                            <div className="item-details">
                                <h3>{movie.title}</h3>
                                <div className="rating">
                                    <span className="star">★</span>
                                    <p>Rate: {movie.imdb_rating}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Discover;
