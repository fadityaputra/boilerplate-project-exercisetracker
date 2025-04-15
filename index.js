const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage untuk users
let users = [];

// Membuat user baru
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required" });

  const newUser = {
    username,
    _id: Date.now().toString(),
    exercises: [] // Memastikan user memiliki array exercises
  };

  users.push(newUser);
  res.json(newUser);
});

// Mendapatkan daftar semua user
app.get('/api/users', (req, res) => {
  const userList = users.map(u => ({ username: u.username, _id: u._id }));
  res.json(userList);
});

// Menambahkan exercise untuk user tertentu
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const exercise = {
    description,
    duration: parseInt(duration), // Pastikan duration adalah angka
    date: date ? new Date(date).toDateString() : new Date().toDateString() // Format tanggal yang benar
  };

  // Menambahkan exercise ke user
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

// Mendapatkan log exercise untuk user tertentu
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  let log = user.exercises || [];

  // Memfilter log berdasarkan parameter from dan to
  if (from || to) {
    log = log.filter(ex => {
      const exerciseDate = new Date(ex.date);
      if (from && exerciseDate < new Date(from)) return false;
      if (to && exerciseDate > new Date(to)) return false;
      return true;
    });
  }

  // Menggunakan limit untuk membatasi jumlah log yang dikirim
  if (limit) log = log.slice(0, Number(limit));

  // Memastikan setiap item log memiliki deskripsi, durasi, dan tanggal yang benar
  log = log.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration, // Pastikan durasi adalah angka
    date: new Date(exercise.date).toDateString() // Format tanggal yang benar
  }));

  // Mengembalikan response dengan count dan log
  res.json({
    username: user.username,
    _id: user._id,
    count: log.length,  // Menambahkan count yang berisi jumlah latihan
    log  // Mengembalikan log yang sudah difilter dan diformat
  });
});

// Menjalankan server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
