// Base LLM Provider Interface
class LLMProvider {
    constructor(config) {
        this.config = config;
    }

    async generateResponse(messages, options = {}) {
        throw new Error('generateResponse method must be implemented by subclass');
    }

    async validateConnection() {
        throw new Error('validateConnection method must be implemented by subclass');
    }

    getAvailableModels() {
        return this.config.models || [];
    }

    getName() {
        throw new Error('getName method must be implemented by subclass');
    }
}

module.exports = LLMProvider;