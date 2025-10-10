# Konkani Dictionary - Chatbot Backend

A Node.js/Express backend for a Konkani-English dictionary application with AI-powered features using multiple LLM providers.

## ✨ Features

- 🤖 **Multi-LLM Support** - Works with OpenAI, Anthropic Claude, Google Gemini, and Ollama
- 🔄 **LLM Toggle** - Enable/disable AI features globally with a single environment variable
- 📚 **Dictionary API** - Search Konkani dictionary with optional AI enhancement
- ✅ **Verification System** - Test AI accuracy against actual database entries
- 🧪 **Comprehensive Tests** - Multiple test suites for different scenarios
- 📖 **Full Documentation** - Detailed guides and API reference

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env
```

### Configuration

Edit `.env`:
```env
# Enable/disable LLM features
ENABLE_LLM=true

# Choose provider: openai, anthropic, gemini, ollama
LLM_PROVIDER=openai

# Add your API key
OPENAI_API_KEY=your_key_here
```

### Running

```bash
# Start server
npm start

# Development mode with auto-reload
npm run dev

# Run tests
npm test
```

## 📋 API Endpoints

### Health & Status
- `GET /` - API health check
- `GET /health` - Server health check

### LLM Chat
- `POST /api/chat` - Send message to LLM
- `GET /api/chat/providers` - List available LLM providers
- `POST /api/chat/provider` - Switch LLM provider
- `GET /api/chat/health` - Check LLM provider health

### Dictionary
- `GET /api/dictionary` - Search dictionary entries
  - Query params: `query`, `limit`, `offset`, `use_llm`
- `GET /api/dictionary/:id` - Get specific entry
- `GET /api/dictionary/config/llm-status` - Check LLM configuration

## 🧪 Testing

```bash
# Run all tests
npm test

# Integration tests only
npm run test:integration

# Verification demo
npm run test:verification

# Full LLM verification
npm run test:llm

# API demo (requires running server)
./demo-api.sh
```

## 📖 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Quick setup and usage guide
- **[LLM_VERIFICATION_README.md](LLM_VERIFICATION_README.md)** - Complete system documentation
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## 🔧 LLM Toggle

Enable or disable AI features without code changes:

```bash
# Enable LLM (default)
ENABLE_LLM=true npm start

# Disable LLM (basic features still work)
ENABLE_LLM=false npm start
```

When disabled:
- ❌ Chat endpoint returns 503
- ❌ LLM dictionary enhancement skipped
- ✅ Basic dictionary search still works
- ✅ API remains available

## 🎯 Key Features

### 1. Multi-Provider LLM Support
Switch between different AI providers:
- **OpenAI** (GPT-4, GPT-3.5)
- **Anthropic** (Claude 3)
- **Google Gemini** (Gemini 2.5, 1.5)
- **Ollama** (Local models)

### 2. Dictionary API
Search Konkani words with optional AI enhancement:
```bash
# Basic search
curl "http://localhost:3000/api/dictionary?query=hello"

# With AI enhancement
curl "http://localhost:3000/api/dictionary?query=hello&use_llm=true"
```

### 3. Verification System
Test AI accuracy automatically:
```bash
node test-verification-demo.js
# Output: 100% accuracy on 5 test cases
```

## 🏗️ Architecture

```
chatbot-backend/
├── config/          # Configuration files
├── routes/          # API route handlers
├── providers/       # LLM provider implementations
├── utils/           # Utility functions
├── database/        # Database schema and scripts
└── tests/           # Test scripts
```

## 📊 Test Results

✅ **Integration Tests**: All configuration tests passed  
✅ **Verification Demo**: 100% accuracy on sample data  
✅ **API Tests**: All endpoints responding correctly  
✅ **Syntax Check**: All files valid  

## 🔐 Environment Variables

See `.env.example` for all available options:

```env
# LLM Configuration
ENABLE_LLM=true
LLM_PROVIDER=openai

# API Keys
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GEMINI_API_KEY=your_key

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=konkani_dictionary
DB_USER=konkani_dev
DB_PASSWORD=your_password

# Server
PORT=3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📝 License

[Your License Here]

## 🆘 Troubleshooting

### Issue: LLM not working
Check:
1. Is `ENABLE_LLM=true` in `.env`?
2. Is API key configured?
3. Is provider valid?

**Verify:**
```bash
curl http://localhost:3000/api/dictionary/config/llm-status
curl http://localhost:3000/api/chat/health
```

### Issue: Tests failing
Possible causes:
1. Server not running (for API tests)
2. Database not accessible
3. Network issues

**Debug:**
```bash
# Check server
curl http://localhost:3000/health

# Run integration tests (no server needed)
npm run test:integration
```

## 📞 Support

For detailed information:
- Read the documentation in the `docs/` folder
- Check the troubleshooting guide in `LLM_VERIFICATION_README.md`
- Review test examples in `test-*.js` files

## 🎉 Acknowledgments

Built for the Konkani Dictionary project to enable AI-powered language learning and translation features.
