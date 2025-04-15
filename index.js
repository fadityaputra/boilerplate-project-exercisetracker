const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Penting untuk form data

// In-memory database sementara
let users = [];

// Route halaman utama
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Membuat user baru
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required" });

  const newUser = {
    username,
    _id: Date.now().toString() // ID unik sederhana
  };

  users.push(newUser);
  res.json(newUser);
});

// Mendapatkan semua user
app.get('/api/users', (req, res) => {
  const userList = users.map(u => ({ username: u.username, _id: u._id }));
  res.json(userList);
});

// Menambahkan exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const exercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString() // Memastikan format tanggal yang benar
  };

  // Menambahkan exercise ke user
  if (!user.exercises) user.exercises = [];
  user.exercises.push(exercise);

  // Mengembalikan response sesuai format yang benar
  res.json({
    username: user.username,
    _id: user._id,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
});

// Mendapatkan log exercise
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  let log = user.exercises || [];

  if (from || to) {
    log = log.filter(ex => {
      const d = new Date(ex.date);
      if (from && d < new Date(from)) return false;
      if (to && d > new Date(to)) return false;
      return true;
    });
  }

  if (limit) log = log.slice(0, Number(limit));

  // Memastikan setiap log menggunakan format tanggal yang benar (dateString)
  log = log.map(exercise => {
    return {
      ...exercise,
      date: new Date(exercise.date).toDateString() // Mengonversi ke format string yang benar
    };
  });

  res.json({
    username: user.username,
    _id: user._id,
    count: log.length,
    log
  });
});

// Menjalankan server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
