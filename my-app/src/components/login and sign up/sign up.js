import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // نسخه جدید React Router
import './signup.css'
const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // برای هدایت

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://amirghost14.pythonanywhere.com/api/register/', {
                username,
                email,
                password
            });
            console.log(response.data);
            navigate('/profile'); // هدایت به صفحه پروفایل پس از ثبت‌نام موفقیت‌آمیز
        } catch (error) {
            console.error('Error registering user:', error);
        }
    };

    return (
        <div className='login-container0'>
        <div className="login-container">
          <h2>Sign Up</h2>
          <form onSubmit={handleSignUp}>
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
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Sign Up</button>
          </form>
          <h2 onClick={() => navigate('/login')} className="switch-button">Already have an account? Login</h2>
        </div>
        </div>
      );
};

export default SignUp;

