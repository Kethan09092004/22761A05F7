import React from 'react';

function PostCard({ post }) {
  return (
    <div className="bg-dark-card p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-3">
        <img
          src={`https://picsum.photos/50?random=${post.userId}`}
          alt={post.username}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <p className="font-semibold text-white">{post.username}</p>
          <p className="text-text-secondary text-sm">Post ID: {post.id}</p>
        </div>
      </div>
      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
      )}
      <p className="text-text-primary">{post.content}</p>
      {post.commentCount !== undefined && (
        <p className="text-text-secondary text-sm mt-2">Comments: {post.commentCount}</p>
      )}
    </div>
  );
}

export default PostCard;