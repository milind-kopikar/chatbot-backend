# Quick Start Guide - LLM Verification System

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your API keys:
```env
# Enable or disable LLM
ENABLE_LLM=true

# Choose your provider
LLM_PROVIDER=openai

# Add your API key
OPENAI_API_KEY=your_key_here
# OR
GEMINI_API_KEY=your_key_here
# OR
ANTHROPIC_API_KEY=your_key_here
```

## Running Tests

### 1. Integration Test (No server needed)
Tests configuration and module loading:
```bash
node test-integration.js
```

### 2. Verification Demo (No server needed)
Demonstrates how verification works with sample data:
```bash
node test-verification-demo.js
```

### 3. Full Server Test
Start the server and test endpoints:
```bash
# Start server
npm start

# In another terminal, test endpoints:
# Check LLM status
curl http://localhost:3000/api/dictionary/config/llm-status

# Check LLM health
curl http://localhost:3000/api/chat/health

# Test chat (requires API key configured)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

## Testing with LLM Disabled

```bash
# Run with LLM disabled
ENABLE_LLM=false npm start

# Or set in .env:
# ENABLE_LLM=false

# Chat endpoint will return 503
# Dictionary search will work but without LLM enhancement
```

## Key Features

### 1. LLM Toggle
- Set `ENABLE_LLM=false` to disable all LLM features
- Graceful degradation - basic features still work
- No code changes needed, just environment variable

### 2. Dictionary Search
```bash
# Basic search (no LLM)
curl "http://localhost:3000/api/dictionary?query=hello"

# With LLM enhancement
curl "http://localhost:3000/api/dictionary?query=hello&use_llm=true"
```

### 3. Verification System
- Compares LLM responses with database entries
- Calculates accuracy percentage
- Identifies matched keywords
- Can test against production data

## File Structure

```
chatbot-backend/
├── config/
│   └── config.js           # LLM configuration with toggle
├── routes/
│   ├── chat.js            # Chat endpoints (respects toggle)
│   └── dictionary.js      # Dictionary with optional LLM
├── utils/
│   └── llm-verification.js # Verification utilities
├── providers/             # LLM provider implementations
├── test-integration.js    # Config & module tests
├── test-verification-demo.js # Verification demo
└── test-llm-verification.js  # Full verification tests
```

## Documentation

- **Full Documentation**: See `LLM_VERIFICATION_README.md`
- **API Reference**: See `LLM_VERIFICATION_README.md` → API Reference section
- **Troubleshooting**: See `LLM_VERIFICATION_README.md` → Troubleshooting section

## Common Commands

```bash
# Run integration test
node test-integration.js

# Run verification demo
node test-verification-demo.js

# Start server
npm start

# Start with LLM disabled
ENABLE_LLM=false npm start

# Development mode with auto-reload
npm run dev
```

## Next Steps

1. ✅ Run integration test to verify setup
2. ✅ Run verification demo to understand the system
3. Configure your API keys in `.env`
4. Start the server: `npm start`
5. Test endpoints with curl or Postman
6. Read full documentation in `LLM_VERIFICATION_README.md`

## Support

For detailed information, see:
- `LLM_VERIFICATION_README.md` - Complete documentation
- `.env.example` - All available configuration options
- Database setup: `database/SETUP_README.md`
