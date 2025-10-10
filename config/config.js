require('dotenv').config();

const config = {
    // Current active provider - change this to switch between LLMs
    currentProvider: process.env.LLM_PROVIDER || 'openai',
    
    // Toggle LLM functionality on/off
    llmEnabled: process.env.ENABLE_LLM !== 'false', // Default to true unless explicitly disabled
    
    // Provider configurations
    providers: {
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: 'https://api.openai.com/v1',
            defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini', // Use env var or fallback
            models: [
                'gpt-4o-mini',      // Cheapest & latest (recommended for your use case)
                'gpt-4o',           // Latest GPT-4 class (more expensive)
                'gpt-3.5-turbo',    // Older but still available
                'gpt-4-turbo',      // Previous generation
                'gpt-4'             // Original GPT-4
            ]
        },
        anthropic: {
            apiKey: process.env.ANTHROPIC_API_KEY,
            baseURL: 'https://api.anthropic.com/v1',
            defaultModel: 'claude-3-sonnet-20240229',
            models: ['claude-3-sonnet-20240229', 'claude-3-opus-20240229', 'claude-3-haiku-20240307']
        },
        ollama: {
            baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
            defaultModel: 'llama2',
            models: ['llama2', 'codellama', 'mistral']
        },
        // Add this to the providers object:
        gemini: {
            apiKey: process.env.GEMINI_API_KEY,
            baseURL: 'https://generativelanguage.googleapis.com/v1beta',
            defaultModel: process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.5-flash',
            models: [
                'gemini-2.5-flash',          // Latest 2.5 Flash model (recommended)
                'gemini-2.5-pro',            // Latest 2.5 Pro model
                'gemini-2.0-flash',          // 2.0 Flash model
                'gemini-1.5-flash',          // Legacy 1.5 Flash
                'gemini-1.5-pro',            // Legacy 1.5 Pro
            ]
        }
    },
    
    // Default chat settings
    defaultSettings: {
        temperature: 0.7,
        maxTokens: 1000,
        systemPrompt: "You are a helpful AI assistant."
    }
};

module.exports = config;