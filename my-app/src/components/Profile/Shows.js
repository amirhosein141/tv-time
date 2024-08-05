import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Shows.css';

const Shows = () => {
  const [userShows, setUserShows] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserShows();
  }, []);

  useEffect(() => {
    if (userShows.length > 0) {
      fetchShowsData();
    }
  }, [userShows]);

  const fetchUserShows = async () => {
    try {
      const response = await fetch('https://amirghost14.pythonanywhere.com/api/user_shows/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error fetching user shows');
      }
      const data = await response.json();
      console.log("User shows data received:", data);
      setUserShows(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchShowsData = async () => {
    try {
      const showRequests = userShows.map(userShow =>
        fetch(`https://amirghost14.pythonanywhere.com/api/shows/${userShow.show}/`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Error fetching show details');
            }
            return response.json();
          })
          .then(show => ({
            ...show,
            status: userShow.status, 
          }))
      );

      const showData = await Promise.all(showRequests);
      console.log("All show data processed:", showData);

      const sortedShows = showData.sort((a, b) => {
        const statusOrder = {
          'watching': 1,
          'not_watched': 2,
          'completed': 3,
        };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      
      console.log("Sorted shows:", sortedShows);
      setShows(sortedShows);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowClick = (id) => {
    navigate(`/singleshow/${id}`);
  };

  const handleBackClick = () => {
    navigate('/allshows');
  };



  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <section className="shows">
      <h2>My Shows</h2>
      <div className='allmovies-button-container'>
        <button className="allmovies-button" onClick={handleBackClick}>&gt;</button>
      </div>
      <div className="show-list">
        {shows.slice(0, 6).map(show => (
          <div key={show.id} className="show-item" onClick={() => handleShowClick(show.id)}>
            <img src={show.image} alt={show.title} />
          </div>
        ))}
        {shows.length === 0 && (
          <div className="no-shows-message"></div>
        )}
      </div>
    </section>
  );
}

export default Shows;
