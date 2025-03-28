import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchTopUsers = async () => {
  const response = await axios.get('http://localhost:5000/users');
  return response.data;
};

function TopUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['topUsers'],
    queryFn: fetchTopUsers,
  });

  if (isLoading) return <p className="text-center text-text-secondary text-lg">Loading...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-5">Top 5 Users by Post Count</h1>
      <ul className="space-y-5">
        {users?.map((user) => (
          <li key={user.userId} className="bg-dark-card p-4 rounded-lg shadow-md">
            <div className="flex items-center">
              <img
                src={`https://picsum.photos/50?random=${user.userId}`}
                alt={user.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-text-secondary text-sm">Posts: {user.postCount}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TopUsers;