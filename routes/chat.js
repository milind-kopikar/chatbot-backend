const express = require('express');
const config = require('../config/config');
// Add this import
const GeminiProvider = require('../providers/GeminiProvider');
const OpenAIProvider = require('../providers/OpenAIProvider');
const AnthropicProvider = require('../providers/AnthropicProvider');

const router = express.Router();

// Initialize providers
const providers = {};

function initializeProvider(providerName) {
    const providerConfig = config.providers[providerName];
    if (!providerConfig) {
        throw new Error(`Provider ${providerName} not configured`);
    }

    switch (providerName) {
        case 'openai':
            return new OpenAIProvider(providerConfig);
        case 'anthropic':
            return new AnthropicProvider(providerConfig);
        case 'gemini':
            return new GeminiProvider(providerConfig);
        default:
            throw new Error(`Unsupported provider: ${providerName}`);
    }
}

// Get current provider
function getCurrentProvider() {
    const currentProviderName = config.currentProvider;
    
    if (!providers[currentProviderName]) {
        providers[currentProviderName] = initializeProvider(currentProviderName);
    }
    
    return providers[currentProviderName];
}

// POST /api/chat - Send message to LLM
router.post('/', async (req, res) => {
    try {
        const { message, conversation = [], options = {} } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Build conversation history
        const messages = [
            { role: 'system', content: options.systemPrompt || config.defaultSettings.systemPrompt },
            ...conversation,
            { role: 'user', content: message }
        ];

        const provider = getCurrentProvider();
        const response = await provider.generateResponse(messages, {
            model: options.model,
            temperature: options.temperature || config.defaultSettings.temperature,
            maxTokens: options.maxTokens || config.defaultSettings.maxTokens
        });

        if (response.success) {
            res.json({
                message: response.message,
                provider: response.provider,
                model: response.model,
                usage: response.usage
            });
        } else {
            res.status(500).json({
                error: 'Failed to generate response',
                details: response.error,
                provider: response.provider
            });
        }
    } catch (error) {
        console.error('Chat route error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/chat/providers - Get available providers
router.get('/providers', (req, res) => {
    const availableProviders = Object.keys(config.providers).map(name => ({
        name,
        current: name === config.currentProvider,
        models: config.providers[name].models || []
    }));
    
    res.json({ providers: availableProviders });
});

// POST /api/chat/provider - Switch provider
router.post('/provider', (req, res) => {
    try {
        const { provider } = req.body;
        
        if (!provider) {
            return res.status(400).json({ error: 'Provider name is required' });
        }
        
        if (!config.providers[provider]) {
            return res.status(400).json({ 
                error: 'Invalid provider', 
                availableProviders: Object.keys(config.providers) 
            });
        }
        
        config.currentProvider = provider;
        
        res.json({ 
            message: `Switched to ${provider}`, 
            currentProvider: provider 
        });
    } catch (error) {
        console.error('Provider switch error:', error);
        res.status(500).json({ error: 'Failed to switch provider' });
    }
});

// GET /api/chat/health - Check provider health
router.get('/health', async (req, res) => {
    try {
        const provider = getCurrentProvider();
        const healthCheck = await provider.validateConnection();
        
        res.json({
            provider: provider.getName(),
            healthy: healthCheck.success,
            details: healthCheck
        });
    } catch (error) {
        res.status(500).json({
            provider: config.currentProvider,
            healthy: false,
            error: error.message
        });
    }
});

module.exports = router;