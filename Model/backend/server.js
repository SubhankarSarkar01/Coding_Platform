const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/content'));
app.use('/api/content', require('./routes/content'));
app.use('/api/code', require('./routes/codeExecution'));
app.use('/api/leetcode', require('./routes/leetcode'));
app.use('/api/runner', require('./routes/codeRunner'));
app.use('/api/problems', require('./routes/problems'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
