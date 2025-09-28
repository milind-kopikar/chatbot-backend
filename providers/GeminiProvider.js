const axios = require('axios');
const LLMProvider = require('./LLMProvider');

class GeminiProvider extends LLMProvider {
    constructor(config) {
        super(config);
        this.apiKey = config.apiKey;
        this.baseURL = config.baseURL || 'https://generativelanguage.googleapis.com/v1beta';
        this.defaultModel = config.defaultModel;
        
        if (!this.apiKey) {
            throw new Error('Gemini API key is required');
        }
    }

    getName() {
        return 'Gemini';
    }

    async generateResponse(messages, options = {}) {
        try {
            const modelName = options.model || this.defaultModel;
            // Debug: Log which model we're using
            console.log("Using Gemini model:", modelName);
            console.log("Full API URL:", `${this.baseURL}/models/${modelName}:generateContent`);
            
            // Convert OpenAI format to Gemini format
            const geminiMessages = this.convertToGeminiFormat(messages);
            console.log("Sending to Gemini:", JSON.stringify({
                contents: geminiMessages,
                generationConfig: {
                    temperature: options.temperature || 0.7,
                    maxOutputTokens: options.maxTokens || 1000,
                }
            }, null, 2));
            
            const response = await axios.post(
                `${this.baseURL}/models/${modelName}:generateContent?key=${this.apiKey}`,
                {
                    contents: geminiMessages,
                    generationConfig: {
                        temperature: options.temperature || 0.7,
                        maxOutputTokens: options.maxTokens || 1000,
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Extract response from Gemini format
            const content = response.data.candidates[0].content.parts[0].text;

            return {
                success: true,
                message: content,
                usage: {
                    prompt_tokens: response.data.usageMetadata?.promptTokenCount || 0,
                    completion_tokens: response.data.usageMetadata?.candidatesTokenCount || 0,
                    total_tokens: response.data.usageMetadata?.totalTokenCount || 0
                },
                model: options.model || this.defaultModel,
                provider: 'gemini'
            };
        } catch (error) {
            console.error('Gemini API Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message,
                provider: 'gemini'
            };
        }
    }

    // Convert OpenAI message format to Gemini format
    convertToGeminiFormat(messages) {
        return messages
            .filter(msg => msg.role !== 'system') // Gemini doesn't use system messages the same way
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
    }

    async validateConnection() {
        try {
            // Test with a simple request
            const response = await axios.get(
                `${this.baseURL}/models?key=${this.apiKey}`
            );
            return { 
                success: true, 
                modelsCount: response.data.models?.length || 0 
            };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error?.message || error.message 
            };
        }
    }
}

module.exports = GeminiProvider;