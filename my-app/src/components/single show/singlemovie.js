import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './singlemovie.css';

const MovieDetail = () => {
    const [movie, setMovie] = useState(null);
    const [userMovie, setUserMovie] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/movies/${id}/`)
            .then(response => {
                setMovie(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the movie!', error);
            });

        axios.get(`http://127.0.0.1:8000/api/user_movies/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
            },
        })
        .then(response => {
            const userMovies = response.data;
            const userMovie = userMovies.find(userMovie => userMovie.movie === parseInt(id));
            setUserMovie(userMovie || null);
        })
        .catch(error => console.error('Error fetching user movies:', error));
    }, [id]);

    const handleStatusToggle = () => {
        if (!userMovie) return;

        const newStatus = userMovie.status === 'watched' ? 'not_watched' : 'watched';

        axios.patch(`http://127.0.0.1:8000/api/user_movies/${userMovie.id}/status/`, { status: newStatus }, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            setUserMovie(prevState => ({
                ...prevState,
                status: response.data.status, // Ensure the correct field is updated
            }));
        })
        .catch(error => console.error('Error updating movie status:', error));
    };

    const handleUserListToggle = () => {
        const url = `http://127.0.0.1:8000/api/user_movies/`;
        const data = { movie: id };
        const headers = {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        };

        if (userMovie) {
            axios.delete(`${url}${userMovie.id}/`, { headers })
                .then(() => {
                    setUserMovie(null);
                })
                .catch(error => console.error('Error removing movie from user list:', error));
        } else {
            axios.post(url, data, { headers })
                .then(response => {
                    setUserMovie(response.data);
                })
                .catch(error => console.error('Error adding movie to user list:', error));
        }
    };

    if (!movie) {
        return <div>Loading...</div>;
    }

    return (
        <div className="singlemovie-container">
            <button className="back-button" onClick={() => navigate(-1)}>←</button>
            <div className="single-movie-card">
                <div className="movie-info-container">
                    <img className="single-movie-image" src={movie.image} alt={movie.title} />
                    <div className='single-movie-content'>
                        <h2 className="single-movie-title">{movie.title}</h2>
                        <div className="single-movie-info">Release Year: {movie.release_year}</div>
                        <div className="single-movie-info">Genres: {movie.genres}</div>
                        <div className="single-movie-info">Movie time: {movie.runtime} </div>
                        <div className="single-movie-info">Director: {movie.director_name} </div>
                        <div className="single-movie-info">
                            Actors:
                            <ul>
                                {movie.actors.map(actor => (
                                    <li key={actor.id}>{actor.name}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="single-movie-info">IMDB Rating: {movie.imdb_rating} </div>
                    </div>
                </div>
                <div className='single-movie-description'>
                    <p className='single-movie-description1'>{movie.description}</p>
                </div>
                {userMovie && (
                    <button 
                        className={`status-toggle-button ${userMovie.status === 'watched' ? 'watched' : 'not-watched'}`} 
                        onClick={handleStatusToggle}
                    >
                        {userMovie.status === 'watched' ? '✔ Watched' : 'Not Watched'}
                    </button>
                )}
                <button 
                    className={`user-list-toggle-button ${userMovie ? 'remove' : 'add'}`} 
                    onClick={handleUserListToggle}
                >
                    {userMovie ? 'Remove Movie' : 'Add Movie'}
                </button>
                <div className="movie-buttons-container">
                    
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;
