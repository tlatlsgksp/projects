const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Import route modules
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const postsRoutes = require('./routes/postsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const marketRoutes = require('./routes/marketRoutes');
const followRoutes = require('./routes/followRoutes');

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/posts', postsRoutes);
app.use('/chat', chatRoutes);
app.use('/market', marketRoutes);
app.use('/follow', followRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});