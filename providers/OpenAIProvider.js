const axios = require('axios');
const LLMProvider = require('./LLMProvider');

class OpenAIProvider extends LLMProvider {
    constructor(config) {
        super(config);
        this.apiKey = config.apiKey;
        this.baseURL = config.baseURL;
        this.defaultModel = config.defaultModel;
        
        if (!this.apiKey) {
            throw new Error('OpenAI API key is required');
        }
    }

    getName() {
        return 'OpenAI';
    }

    async generateResponse(messages, options = {}) {
        try {
            // Debug: Log which model we're using
            console.log("Using model:", options.model || this.defaultModel);
            
            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: options.model || this.defaultModel,
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 1000,
                    stream: false
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                message: response.data.choices[0].message.content,
                usage: response.data.usage,
                model: response.data.model,
                provider: 'openai'
            };
        } catch (error) {
            console.error('OpenAI API Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message,
                provider: 'openai'
            };
        }
    }

    async validateConnection() {
        try {
            const response = await axios.get(`${this.baseURL}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return { success: true, modelsCount: response.data.data.length };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error?.message || error.message 
            };
        }
    }
}

module.exports = OpenAIProvider;