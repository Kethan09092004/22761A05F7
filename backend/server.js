const express = require('express');
const NodeCache = require('node-cache');
const app = express();
const port = 5000;
const cache = new NodeCache({ stdTTL: 60 });

// Sample data
const sampleData = {
  users: {
    "user1": "John Doe",
    "user2": "Jane Smith",
    "user3": "Alex Johnson",
    "user4": "Emily Brown",
    "user5": "Michael Lee",
    "user6": "Sarah Davis"
  },
  posts: [
    { id: "p1", userId: "user1", content: "Loving the sunny weather today!", timestamp: 1711699200 },
    { id: "p2", userId: "user2", content: "Just finished a great book.", timestamp: 1711684800 },
    { id: "p3", userId: "user3", content: "New recipe turned out amazing!", timestamp: 1711670400 },
    { id: "p4", userId: "user4", content: "Hiking this weekend, so excited!", timestamp: 1711656000 },
    { id: "p5", userId: "user5", content: "Work hard, play hard!", timestamp: 1711641600 },
    { id: "p6", userId: "user1", content: "Second post of the day!", timestamp: 1711695600 }
  ],
  comments: {
    "p1": [
      { id: "c1", content: "Looks fun!", userId: "user2" },
      { id: "c2", content: "Wish I was there!", userId: "user3" }
    ],
    "p2": [{ id: "c3", content: "What book?", userId: "user4" }],
    "p3": [
      { id: "c4", content: "Share the recipe!", userId: "user5" },
      { id: "c5", content: "Yum!", userId: "user6" },
      { id: "c6", content: "Looks delicious!", userId: "user1" }
    ],
    "p4": [],
    "p5": [{ id: "c7", content: "Inspiring!", userId: "user2" }],
    "p6": [{ id: "c8", content: "Keep it up!", userId: "user3" }]
  }
};

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Helper functions using sample data
async function fetchUsers() {
  const cacheKey = 'users';
  let users = cache.get(cacheKey);
  if (!users) {
    users = sampleData.users;
    cache.set(cacheKey, users);
  }
  return users;
}

async function fetchUserPosts(userId) {
  const cacheKey = `posts_${userId}`;
  let posts = cache.get(cacheKey);
  if (!posts) {
    posts = sampleData.posts.filter(post => post.userId === userId);
    cache.set(cacheKey, posts);
  }
  return posts;
}

async function fetchPostComments(postId) {
  const cacheKey = `comments_${postId}`;
  let comments = cache.get(cacheKey);
  if (!comments) {
    comments = sampleData.comments[postId] || [];
    cache.set(cacheKey, comments);
  }
  return comments;
}

// API endpoints
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
        .sort((a, b) => b.timestamp - a.timestamp)
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