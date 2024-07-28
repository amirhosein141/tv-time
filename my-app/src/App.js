import React from 'react';
import {Route,Routes} from "react-router-dom"
import './App.css'
import Profile_contianer from './components/Profile/Profile_contianer';
import Allshows from './components/all shows/allshows';
import Allmovie from './components/all shows/allmovies';
import Discover from './components/Discover/Discover';
import SignUp from './components/login and sign up/sign up';
import Login from './components/login and sign up/login';
import Profile_details from './components/login and sign up/profile_details';
import Singleshow from './components/single show/single show';
import Singlemovie from './components/single show/singlemovie';
import TrackMovies from './components/trackmovies/trackmovies';
import TrackShow from './components/trackmovies/trackshows';
function App  ()  {
  return (
    <Routes>
      <Route path='profile/' element={<Profile_contianer/>}/>
      <Route path='allshows/' element={<Allshows/>}/>
      <Route path='allmovies/' element={<Allmovie/>}/>
      <Route path='discover/' element={<Discover/>}/>
      <Route path='/' element={<SignUp/>}/>
      <Route path='login/' element={<Login/>}/>
      <Route path='profile_details/' element={<Profile_details/>}/>
      <Route path='singleshow/:id/' element={<Singleshow/>}/>
      <Route path='singlemovie/:id/' element={<Singlemovie/>}/>
      <Route path='trackmovies/' element={<TrackMovies/>}/>
      <Route path='trackshows/' element={<TrackShow/>}/>
    </Routes>
  )
}

export default App;