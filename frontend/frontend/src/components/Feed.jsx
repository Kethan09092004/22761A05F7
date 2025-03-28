import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import PostCard from './PostCard';

const fetchPosts = async () => {
  const response = await axios.get('http://localhost:5000/posts?type=latest');
  return response.data;
};

function Feed() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['feedPosts'],
    queryFn: fetchPosts,
    refetchInterval: 5000,
  });

  if (isLoading) return <p className="text-center text-text-secondary text-lg">Loading...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-5">Latest Feed</h1>
      <div className="space-y-5">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default Feed;