require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');
const config = require('./config/config');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Log port info for Railway debugging
console.log('Railway PORT env:', process.env.PORT);
console.log('Railway HOST env:', process.env.HOST);
console.log('Will listen on:', HOST + ':' + PORT);

// Middleware - Allow all origins for now
app.use(cors());
app.use(express.json());

// Root route for Railway health check
app.get('/', (req, res) => {
    res.json({ 
        message: 'Chatbot Backend API', 
        status: 'running',
        timestamp: new Date().toISOString(),
        provider: config.currentProvider 
    });
});

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

app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
    console.log(`Current LLM provider: ${config.currentProvider}`);
    console.log('Server ready to accept connections');
    console.log('Environment:', process.env.NODE_ENV);
});