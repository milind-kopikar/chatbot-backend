require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');
const config = require('./config/config');

const app = express();
const PORT = process.env.PORT || 3001;

// Log port info for Railway debugging
console.log('Railway PORT env:', process.env.PORT);
console.log('Will listen on port:', PORT);

// Middleware - Allow all origins for now
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Current LLM provider: ${config.currentProvider}`);
    console.log('Server ready to accept connections');
});