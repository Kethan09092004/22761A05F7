import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import PostCard from './PostCard';

const fetchTrendingPosts = async () => {
  const response = await axios.get('http://localhost:5000/posts?type=popular');
  return response.data;
};

function TrendingPosts() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['trendingPosts'],
    queryFn: fetchTrendingPosts,
  });

  if (isLoading) return <p className="text-center text-text-secondary text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500 text-lg">Error loading trending posts: {error.message}</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-5">Trending Posts</h1>
      <div className="space-y-5">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default TrendingPosts;