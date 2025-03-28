import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import TopUsers from './components/TopUsers';
import TrendingPosts from './components/TrendingPosts';
import Feed from './components/Feed';
import './components/styles.css';

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <ul className="nav-list">
          <li><Link to="/" className="nav-link">Top Users</Link></li>
          <li><Link to="/trending" className="nav-link">Trending Posts</Link></li>
          <li><Link to="/feed" className="nav-link">Feed</Link></li>
        </ul>
      </nav>
      <div className="content-container">
        <Routes>
          <Route path="/" element={<TopUsers />} />
          <Route path="/trending" element={<TrendingPosts />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;