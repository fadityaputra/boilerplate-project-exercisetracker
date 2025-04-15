const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for users
let users = [];

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required" });

  const newUser = {
    username,
    _id: Date.now().toString(),
    exercises: [] // Ensure the user has an empty array for exercises
  };

  users.push(newUser);
  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  const userList = users.map(u => ({ username: u.username, _id: u._id }));
  res.json(userList);
});

// Add an exercise for a specific user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const exercise = {
    description,
    duration: parseInt(duration), // Ensure duration is a number
    date: date ? new Date(date).toDateString() : new Date().toDateString() // Proper date format
  };

  // Add the exercise to the user's exercise array
  user.exercises.push(exercise);

  // Return the response in the proper format
  res.json({
    username: user.username,
    _id: user._id,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
});

// Get exercise log for a specific user
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  let log = user.exercises || [];

  // Filter log by 'from' and 'to' dates
  if (from || to) {
    log = log.filter(ex => {
      const exerciseDate = new Date(ex.date);
      if (from && exerciseDate < new Date(from)) return false;
      if (to && exerciseDate > new Date(to)) return false;
      return true;
    });
  }

  // Apply limit to the number of log entries returned
  if (limit) log = log.slice(0, Number(limit));

  // Ensure each log item has a description, duration, and date in the correct format
  log = log.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration, // Ensure duration is a number
    date: new Date(exercise.date).toDateString() // Correctly formatted date string
  }));

  // Return the response with the count and log
  res.json({
    username: user.username,
    _id: user._id,
    count: log.length,  // Include the count of exercises
    log  // Include the log with the filtered and formatted exercises
  });
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
