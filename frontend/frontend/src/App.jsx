import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import TopUsers from './components/TopUsers';
import TrendingPosts from './components/TrendingPosts';
import Feed from './components/Feed';
import './components/styles.css';

function App() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="bg-dark-nav p-4 text-white">
        <ul className="flex justify-center space-x-6 md:space-x-6 flex-col md:flex-row gap-4 md:gap-0">
          <li>
            <Link to="/" className="text-text-primary hover:text-hover-blue hover:underline">
              Top Users
            </Link>
          </li>
          <li>
            <Link to="/trending" className="text-text-primary hover:text-hover-blue hover:underline">
              Trending Posts
            </Link>
          </li>
          <li>
            <Link to="/feed" className="text-text-primary hover:text-hover-blue hover:underline">
              Feed
            </Link>
          </li>
        </ul>
      </nav>
      <div className="max-w-4xl mx-auto p-4">
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