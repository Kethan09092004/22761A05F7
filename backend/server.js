const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const app = express();
const port = 5000;
const cache = new NodeCache({ stdTTL: 60 });

const TEST_SERVER_URL = 'http://20.244.56.144/test';
let AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzMTU2NTExLCJpYXQiOjE3NDMxNTYyMTEsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6Ijk4Y2Q0OTAwLTQyMjAtNGQwNy1iZGM5LTcwOGU1NzAzMzViMSIsInN1YiI6ImtldGhhbjA5MDkyMDA0QGdtYWlsLmNvbSJ9LCJjb21wYW55TmFtZSI6ImFmZm9yZC1MQlJDRSIsImNsaWVudElEIjoiOThjZDQ5MDAtNDIyMC00ZDA3LWJkYzktNzA4ZTU3MDMzNWIxIiwiY2xpZW50U2VjcmV0IjoiV0VqeUlOd0RiWWlTRUlmaSIsIm93bmVyTmFtZSI6IkthbW1hIEtldGhhbiBTYWkgQ2hhbGFwYXRoaSIsIm93bmVyRW1haWwiOiJrZXRoYW4wOTA5MjAwNEBnbWFpbC5jb20iLCJyb2xsTm8iOiIyMjc2MUEwNUY3In0.EH2mNDNtwy3GWR3qFfsWei3HLgUH9h6ry5jlefS7I4Y';

// Middleware to enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Axios instance with dynamic token
const axiosInstance = axios.create({
  baseURL: TEST_SERVER_URL,
  timeout: 5000,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
  },
});

// Log headers before each request
axiosInstance.interceptors.request.use((config) => {
  console.log('Request headers:', config.headers);
  return config;
});

// Function to refresh the token
async function refreshToken() {
  try {
    const response = await axios.post(`${TEST_SERVER_URL}/auth`, {
      companyName: 'afford-LBRCE',
      clientID: '98cd4900-4220-4d07-bdc9-708e570335b1',
      clientSecret: 'WEjyINwDbYiSEIfi',
      ownerName: 'Kamma Kethan Sai Chalapathi',
      ownerEmail: 'kethan09092004@gmail.com',
      rollNo: '22761A05F7',
    });

    AUTH_TOKEN = response.data.access_token; // Adjusted to common 'access_token' field
    if (!AUTH_TOKEN) {
      throw new Error('No token found in auth response');
    }
    axiosInstance.defaults.headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    console.error('Auth response (if any):', error.response?.data);
  }
}

// Refresh token every 4 minutes (240,000 ms)
setInterval(refreshToken, 240000);

// Initial token refresh on server start
(async () => {
  await refreshToken();
})();

// Helper functions (unchanged)
async function fetchUsers() {
  const cacheKey = 'users';
  let users = cache.get(cacheKey);
  if (!users) {
    try {
      const response = await axiosInstance.get('/users');
      if (!response.data.users || typeof response.data.users !== 'object') {
        throw new Error('Invalid users data from test server');
      }
      users = response.data.users;
      cache.set(cacheKey, users);
    } catch (error) {
      const errorMsg = error.response
        ? `Test server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`
        : error.message.includes('timeout')
        ? 'Request to test server timed out'
        : `Failed to connect to test server: ${error.message}`;
      console.error('Error fetching users:', errorMsg);
      throw new Error(errorMsg);
    }
  }
  return users;
}

async function fetchUserPosts(userId) {
  const cacheKey = `posts_${userId}`;
  let posts = cache.get(cacheKey);
  if (!posts) {
    try {
      const response = await axiosInstance.get(`/users/${userId}/posts`);
      posts = Array.isArray(response.data.posts) ? response.data.posts : [];
      cache.set(cacheKey, posts);
    } catch (error) {
      const errorMsg = error.response
        ? `Test server responded with status ${error.response.status}`
        : `Failed to fetch posts for user ${userId}: ${error.message}`;
      console.error(`Error fetching posts for user ${userId}:`, errorMsg);
      throw new Error(errorMsg);
    }
  }
  return posts;
}

async function fetchPostComments(postId) {
  const cacheKey = `comments_${postId}`;
  let comments = cache.get(cacheKey);
  if (!comments) {
    try {
      const response = await axiosInstance.get(`/posts/${postId}/comments`);
      comments = Array.isArray(response.data.comments) ? response.data.comments : [];
      cache.set(cacheKey, comments);
    } catch (error) {
      const errorMsg = error.response
        ? `Test server responded with status ${error.response.status}`
        : `Failed to fetch comments for post ${postId}: ${error.message}`;
      console.error(`Error fetching comments for post ${postId}:`, errorMsg);
      throw new Error(errorMsg);
    }
  }
  return comments;
}

// API endpoints (unchanged)
app.get('/users', async (req, res) => {
  try {
    const users = await fetchUsers();
    const userIds = Object.keys(users);

    const userPostCounts = await Promise.all(
      userIds.map(async (userId) => {
        const posts = await fetchUserPosts(userId);
        return { userId, name: users[userId], postCount: posts.length };
      })
    );

    const topUsers = userPostCounts
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5);

    res.json(topUsers);
  } catch (error) {
    console.error('Error in /users endpoint:', error.message);
    res.status(500).json({ error: 'Failed to fetch top users', details: error.message });
  }
});

app.get('/posts', async (req, res) => {
  try {
    const type = req.query.type || 'latest';
    const users = await fetchUsers();
    const userIds = Object.keys(users);

    const allPosts = [];
    for (const userId of userIds) {
      const posts = await fetchUserPosts(userId);
      posts.forEach((post) => {
        post.userId = userId;
        post.username = users[userId];
        allPosts.push(post);
      });
    }

    if (type === 'popular') {
      const postsWithComments = await Promise.all(
        allPosts.map(async (post) => {
          const comments = await fetchPostComments(post.id);
          return { ...post, commentCount: comments.length };
        })
      );

      const maxComments = Math.max(...postsWithComments.map((p) => p.commentCount));
      const topPosts = postsWithComments.filter((p) => p.commentCount === maxComments);
      res.json(topPosts);
    } else if (type === 'latest') {
      const latestPosts = allPosts
        .sort((a, b) => {
          const aTime = a.timestamp || a.id || 0;
          const bTime = b.timestamp || b.id || 0;
          return bTime - aTime;
        })
        .slice(0, 5);
      res.json(latestPosts);
    } else {
      res.status(400).json({ error: 'Invalid type parameter' });
    }
  } catch (error) {
    console.error('Error in /posts endpoint:', error.message);
    res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});