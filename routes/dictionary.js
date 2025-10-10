const express = require('express');
const { Pool } = require('pg');
const config = require('../config/config');

const router = express.Router();

// Database connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'konkani_dictionary',
    user: process.env.DB_USER || 'konkani_dev',
    password: process.env.DB_PASSWORD || 'dev_password_2024',
});

// Helper function to get LLM provider for dictionary search enhancement
function getDictionaryProvider() {
    if (!config.llmEnabled) {
        return null;
    }
    
    try {
        const providerName = config.currentProvider;
        const providerConfig = config.providers[providerName];
        
        if (!providerConfig || !providerConfig.apiKey) {
            return null;
        }
        
        switch (providerName) {
            case 'openai':
                const OpenAIProvider = require('../providers/OpenAIProvider');
                return new OpenAIProvider(providerConfig);
            case 'anthropic':
                const AnthropicProvider = require('../providers/AnthropicProvider');
                return new AnthropicProvider(providerConfig);
            case 'gemini':
                const GeminiProvider = require('../providers/GeminiProvider');
                return new GeminiProvider(providerConfig);
            default:
                return null;
        }
    } catch (error) {
        console.error('Error initializing LLM provider:', error.message);
        return null;
    }
}

// GET /api/dictionary - Search dictionary entries
router.get('/', async (req, res) => {
    try {
        const { 
            query, 
            limit = 10, 
            offset = 0,
            use_llm = 'false' // Default to not using LLM
        } = req.query;

        // Basic database search
        let dbQuery = 'SELECT * FROM dictionary_entries WHERE status = $1';
        let queryParams = ['published'];
        let paramIndex = 2;

        if (query) {
            dbQuery += ` AND (
                word_konkani_english_alphabet ILIKE $${paramIndex} OR 
                english_meaning ILIKE $${paramIndex} OR 
                word_konkani_devanagari ILIKE $${paramIndex}
            )`;
            queryParams.push(`%${query}%`);
            paramIndex++;
        }

        dbQuery += ` ORDER BY entry_number LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);

        const result = await pool.query(dbQuery, queryParams);
        
        let response = {
            entries: result.rows,
            count: result.rows.length,
            llm_used: false
        };

        // If LLM is enabled and requested, enhance the response
        if (config.llmEnabled && use_llm === 'true' && query) {
            const provider = getDictionaryProvider();
            if (provider) {
                try {
                    const llmResponse = await enhanceSearchWithLLM(provider, query, result.rows);
                    response = {
                        ...response,
                        llm_used: true,
                        llm_summary: llmResponse.summary,
                        llm_suggestions: llmResponse.suggestions
                    };
                } catch (error) {
                    console.error('LLM enhancement failed:', error.message);
                    // Continue with database results only
                }
            }
        }

        res.json(response);
    } catch (error) {
        console.error('Dictionary search error:', error);
        res.status(500).json({ error: 'Failed to search dictionary' });
    }
});

// Helper function to enhance search with LLM
async function enhanceSearchWithLLM(provider, query, entries) {
    const entriesText = entries.map(e => 
        `${e.word_konkani_english_alphabet}: ${e.english_meaning}`
    ).join('\n');

    const messages = [
        {
            role: 'system',
            content: 'You are a Konkani language expert helping users search a Konkani-English dictionary. Provide helpful summaries and suggestions based on search results.'
        },
        {
            role: 'user',
            content: `User searched for: "${query}"\n\nDatabase results:\n${entriesText}\n\nProvide a brief summary of these results and suggest related words they might be interested in.`
        }
    ];

    const response = await provider.generateResponse(messages, {
        temperature: 0.3,
        maxTokens: 300
    });

    if (response.success) {
        return {
            summary: response.message.split('\n')[0],
            suggestions: response.message
        };
    }

    throw new Error('LLM response failed');
}

// GET /api/dictionary/:id - Get specific dictionary entry
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM dictionary_entries WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Dictionary entry fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch dictionary entry' });
    }
});

// GET /api/dictionary/config/llm-status - Check if LLM is enabled
router.get('/config/llm-status', (req, res) => {
    res.json({
        llm_enabled: config.llmEnabled,
        current_provider: config.llmEnabled ? config.currentProvider : null,
        available_providers: config.llmEnabled ? Object.keys(config.providers) : []
    });
});

module.exports = router;
