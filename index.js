const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());  // Middleware to parse JSON bodies

// Store users in memory (you can switch to a database later)
let users = [];

// Route to serve the home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Route to create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required" });

  const newUser = { username, _id: new Date().toISOString() };
  users.push(newUser);
  res.json(newUser);
});

// Route to log an exercise for a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const exercise = {
    description,
    duration,
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  if (!user.exercises) user.exercises = [];
  user.exercises.push(exercise);

  res.json({
    username: user.username,
    _id: user._id,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
});

// Route to retrieve a user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  let log = user.exercises || [];
  
  // Filter logs based on date range
  if (from || to) {
    log = log.filter(exercise => {
      const exerciseDate = new Date(exercise.date);
      if (from && exerciseDate < new Date(from)) return false;
      if (to && exerciseDate > new Date(to)) return false;
      return true;
    });
  }

  // Limit the number of logs returned
  if (limit) log = log.slice(0, limit);

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log
  });
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

