import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [bio, setBio] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/user/', {
                    headers: {
                        'Authorization': `Token ${localStorage.getItem('token')}`
                    }
                });
                setUser(response.data);
                setBio(response.data.userprofile.bio);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('userprofile.bio', bio);
        if (profilePicture) {
            formData.append('userprofile.profile_picture', profilePicture);
        }
        try {
            const response = await axios.patch('http://127.0.0.1:8000/api/user/', formData, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUser(response.data);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div>
            {user && (
                <div>
                    <h1>{user.username}</h1>
                    <img src={user.userprofile.profile_picture} alt="Profile" />
                    <form onSubmit={handleUpdateProfile}>
                        <input
                            type="file"
                            onChange={(e) => setProfilePicture(e.target.files[0])}
                        />
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                        <button type="submit">Update Profile</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Profile;
