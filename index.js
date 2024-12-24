const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

let users = [];
let exercises = {};

// Helper function to generate a unique ID
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

// Create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).send('Username is required');
  }

  const userId = generateUniqueId();
  users.push({ _id: userId, username });
  exercises[userId] = [];
  
  res.json({ username, _id: userId });
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add an exercise to a user's log
app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration } = req.body;
  let date = new Date(req.body.date || Date.now());

  if (!description || !duration) {
    return res.status(400).send('Description and Duration are required');
  }

  const userId = req.params._id;
  const user = users.find(u => u._id === userId);
  
  if (!user) {
    return res.status(404).send('User not found');
  }
  
  const exerciseEntry = {
    description,
    duration: parseInt(duration),
    date: date.toDateString()
  };

  exercises[userId].push(exerciseEntry);

  res.json({
    _id: userId,
    username: user.username,
    ...exerciseEntry
  });
});

// Get a user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const user = users.find(u => u._id === userId);
  
  if (!user) {
    return res.status(404).send('User not found');
  }

  let userExercises = exercises[userId] || [];
  let { from, to, limit } = req.query;

  if (from) {
    from = new Date(from);
    userExercises = userExercises.filter(ex => new Date(ex.date) >= from);
  }

  if (to) {
    to = new Date(to);
    userExercises = userExercises.filter(ex => new Date(ex.date) <= to);
  }

  if (limit) {
    limit = parseInt(limit);
    userExercises = userExercises.slice(0, limit);
  }

  res.json({
    _id: userId,
    username: user.username,
    count: userExercises.length,
    log: userExercises
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
