const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json()); // Untuk JSON
app.use(express.urlencoded({ extended: false })); // Untuk form-urlencoded

// In-memory database
let users = [];

// Home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required" });

  const newUser = {
    username,
    _id: Date.now().toString(),
    exercises: []
  };

  users.push(newUser);
  res.json({ username: newUser.username, _id: newUser._id });
});

// Get all users
app.get('/api/users', (req, res) => {
  const userList = users.map(user => ({
    _id: user._id,
    username: user.username
  }));
  res.json(userList);
});

// Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  let { description, duration, date } = req.body;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!description || !duration) {
    return res.status(400).json({ error: "Description and duration are required" });
  }

  duration = parseInt(duration);
  if (isNaN(duration)) {
    return res.status(400).json({ error: "Duration must be a number" });
  }

  const exercise = {
    description,
    duration,
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  user.exercises.push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
});

// Get exercise logs
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  let log = [...user.exercises];

  // Filter by date
  if (from) {
    const fromDate = new Date(from);
    log = log.filter(ex => new Date(ex.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    log = log.filter(ex => new Date(ex.date) <= toDate);
  }

  // Limit
  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log
  });
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
