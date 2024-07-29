
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css'
const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://amirghost14.pythonanywhere.com/api/login/', {
                username,
                password
            });
            localStorage.setItem('token', response.data.token);
            console.log(response.data);
            navigate('/profile'); 
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    return (
      <div className='login-container0'>
        <div className="login-container">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
          <h2 onClick={() => navigate('/')} className="switch-button">Don't have an account? Sign Up</h2>
        </div></div>
      );
};

export default Login;
