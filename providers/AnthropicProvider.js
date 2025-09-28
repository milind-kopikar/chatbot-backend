const axios = require('axios');
const LLMProvider = require('./LLMProvider');

class AnthropicProvider extends LLMProvider {
    constructor(config) {
        super(config);
        this.apiKey = config.apiKey;
        this.baseURL = config.baseURL;
        this.defaultModel = config.defaultModel;
        
        if (!this.apiKey) {
            throw new Error('Anthropic API key is required');
        }
    }

    getName() {
        return 'Anthropic';
    }

    async generateResponse(messages, options = {}) {
        try {
            // Convert OpenAI format messages to Anthropic format
            const systemMessage = messages.find(msg => msg.role === 'system');
            const conversationMessages = messages.filter(msg => msg.role !== 'system');

            const response = await axios.post(
                `${this.baseURL}/messages`,
                {
                    model: options.model || this.defaultModel,
                    max_tokens: options.maxTokens || 1000,
                    temperature: options.temperature || 0.7,
                    system: systemMessage?.content || "You are a helpful AI assistant.",
                    messages: conversationMessages
                },
                {
                    headers: {
                        'x-api-key': this.apiKey,
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01'
                    }
                }
            );

            return {
                success: true,
                message: response.data.content[0].text,
                usage: response.data.usage,
                model: response.data.model,
                provider: 'anthropic'
            };
        } catch (error) {
            console.error('Anthropic API Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message,
                provider: 'anthropic'
            };
        }
    }

    async validateConnection() {
        try {
            // Anthropic doesn't have a models endpoint, so we'll try a simple message
            const testResponse = await axios.post(
                `${this.baseURL}/messages`,
                {
                    model: this.defaultModel,
                    max_tokens: 10,
                    messages: [{ role: 'user', content: 'Hi' }]
                },
                {
                    headers: {
                        'x-api-key': this.apiKey,
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01'
                    }
                }
            );
            return { success: true, model: testResponse.data.model };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error?.message || error.message 
            };
        }
    }
}

module.exports = AnthropicProvider;