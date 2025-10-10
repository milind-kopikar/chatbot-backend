# LLM Verification System

This document explains the LLM verification system for the Konkani Dictionary application.

## Overview

The LLM verification system allows you to:
1. Test LLM responses against actual database entries
2. Toggle LLM functionality on/off globally
3. Verify accuracy of LLM-based dictionary searches
4. Run automated test suites

## Features

### 1. LLM Toggle Functionality

You can enable or disable LLM functionality globally using an environment variable:

```bash
# Enable LLM (default)
ENABLE_LLM=true

# Disable LLM
ENABLE_LLM=false
```

When disabled, all LLM-related endpoints will return a 503 error, and the dictionary search will only use database queries.

### 2. Dictionary API with Optional LLM Enhancement

The dictionary API provides traditional database search with optional LLM enhancement:

#### Endpoints

**GET /api/dictionary**
- Search dictionary entries
- Query params:
  - `query` - Search term (optional)
  - `limit` - Number of results (default: 10)
  - `offset` - Pagination offset (default: 0)
  - `use_llm` - Enable LLM enhancement ('true' or 'false', default: 'false')

Example:
```bash
# Basic search
curl "http://localhost:3000/api/dictionary?query=hello&limit=5"

# Search with LLM enhancement
curl "http://localhost:3000/api/dictionary?query=hello&limit=5&use_llm=true"
```

**GET /api/dictionary/:id**
- Get specific dictionary entry by ID

**GET /api/dictionary/config/llm-status**
- Check LLM configuration status

Example response:
```json
{
  "llm_enabled": true,
  "current_provider": "openai",
  "available_providers": ["openai", "anthropic", "gemini", "ollama"]
}
```

### 3. LLM Verification Utility

The verification utility (`utils/llm-verification.js`) provides functions to:
- Fetch test cases from the database
- Query the LLM API
- Verify LLM responses against actual data
- Calculate accuracy metrics

#### Functions

- `fetchTestCases(limit)` - Fetch entries from database for testing
- `queryLLM(word, apiBaseUrl)` - Query LLM for a word's meaning
- `verifyResponse(databaseEntry, llmResponse)` - Compare LLM response with database entry
- `runVerificationTests(options)` - Run full verification test suite
- `verifyAgainstProduction(options)` - Test against production API data

### 4. Test Script

Run automated verification tests using the test script:

```bash
# Test with local database (requires database setup)
node test-llm-verification.js

# Test with production API data
node test-llm-verification.js --production

# Specify number of test cases
node test-llm-verification.js --production --count=10

# Use custom API URL
node test-llm-verification.js --url=http://localhost:3001
```

## Setup

1. **Environment Variables**

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Enable/disable LLM
ENABLE_LLM=true

# Choose provider
LLM_PROVIDER=openai

# Provider API keys
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Database (if using local database)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=konkani_dictionary
DB_USER=konkani_dev
DB_PASSWORD=dev_password_2024
```

2. **Install Dependencies**

```bash
npm install
```

3. **Start Server**

```bash
npm start
# or for development
npm run dev
```

## Usage Examples

### Example 1: Dictionary Search Without LLM

```bash
curl "http://localhost:3000/api/dictionary?query=namaskara&limit=5"
```

Response:
```json
{
  "entries": [
    {
      "id": "...",
      "word_konkani_english_alphabet": "namaskara",
      "english_meaning": "hello, greeting",
      "word_konkani_devanagari": "नमस्कार"
    }
  ],
  "count": 1,
  "llm_used": false
}
```

### Example 2: Dictionary Search With LLM Enhancement

```bash
curl "http://localhost:3000/api/dictionary?query=namaskara&limit=5&use_llm=true"
```

Response:
```json
{
  "entries": [...],
  "count": 1,
  "llm_used": true,
  "llm_summary": "The word 'namaskara' is a common Konkani greeting meaning 'hello' or 'greeting'.",
  "llm_suggestions": "You might also be interested in: 'dev borem korum' (good morning), 'boro rati' (good night)"
}
```

### Example 3: Running Verification Tests

```bash
# Test against production API
node test-llm-verification.js --production --count=5
```

Output:
```
🚀 LLM Verification Test Suite

Configuration:
  Test Count: 5
  API URL: http://localhost:3000
  Mode: Production Data
  LLM Provider: openai
  LLM Enabled: true

🌐 Starting Production Data Verification...

📚 Fetching entries from production API...
✅ Loaded 5 entries

📝 Test 1/5: namaskara
   Expected: hello, greeting
   LLM Response: The Konkani word "namaskara" means "hello" or "greeting" in English...
   Match: 100%
   Accurate: ✅

...

============================================================
📊 PRODUCTION VERIFICATION SUMMARY
============================================================
Total Tests: 5
Accurate Responses: 4
Overall Accuracy: 80%
============================================================
```

## Testing Workflow

### Basic Testing Flow

1. **Start the server**
   ```bash
   npm start
   ```

2. **Check LLM status**
   ```bash
   curl http://localhost:3000/api/dictionary/config/llm-status
   ```

3. **Test basic dictionary search**
   ```bash
   curl "http://localhost:3000/api/dictionary?query=hello"
   ```

4. **Run verification tests**
   ```bash
   node test-llm-verification.js --production
   ```

### Disabling LLM

To test with LLM disabled:

1. Set environment variable:
   ```bash
   ENABLE_LLM=false npm start
   ```

2. Verify status:
   ```bash
   curl http://localhost:3000/api/dictionary/config/llm-status
   ```
   
   Response:
   ```json
   {
     "llm_enabled": false,
     "current_provider": null,
     "available_providers": []
   }
   ```

3. Test chat endpoint (should fail):
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello"}'
   ```
   
   Response:
   ```json
   {
     "error": "LLM functionality is currently disabled",
     "llm_enabled": false
   }
   ```

## Architecture

### Components

1. **Config Layer** (`config/config.js`)
   - Global LLM toggle
   - Provider configurations
   - Default settings

2. **Routes Layer** (`routes/`)
   - `chat.js` - LLM chat endpoints
   - `dictionary.js` - Dictionary search with optional LLM

3. **Utils Layer** (`utils/`)
   - `llm-verification.js` - Verification and testing utilities

4. **Test Layer**
   - `test-llm-verification.js` - Automated test script

### Data Flow

```
User Request
    ↓
Dictionary Route (checks config.llmEnabled)
    ↓
Database Query (always executed)
    ↓
[Optional] LLM Enhancement (if enabled and requested)
    ↓
Response with results
```

## Verification Algorithm

The verification system uses a simple but effective algorithm:

1. **Fetch database entry** with actual meaning
2. **Query LLM** for the same word
3. **Extract key words** from actual meaning (words > 3 chars)
4. **Check matches** between LLM response and key words
5. **Calculate match percentage**
6. **Determine accuracy** (>=50% match = accurate)

Example:
```
Database: "hello, greeting, salutation"
LLM: "The word means 'hello' or 'greeting' in English"
Key words: [hello, greeting, salutation]
Matched: [hello, greeting]
Match %: 66%
Accurate: ✅ Yes
```

## Best Practices

1. **Always test against production data first** to validate real-world scenarios
2. **Start with LLM disabled** and verify basic functionality works
3. **Enable LLM gradually** and monitor performance
4. **Run verification tests regularly** to ensure accuracy
5. **Use appropriate test counts** (5-10 for quick tests, 50+ for comprehensive)

## Troubleshooting

### Issue: LLM not working

**Check:**
1. Is `ENABLE_LLM=true` in your `.env`?
2. Is the API key configured correctly?
3. Is the provider supported and initialized?

**Verify:**
```bash
curl http://localhost:3000/api/dictionary/config/llm-status
curl http://localhost:3000/api/chat/health
```

### Issue: Verification tests failing

**Possible causes:**
1. Server not running
2. Database not accessible
3. API keys missing or invalid
4. Network connectivity issues

**Debug:**
```bash
# Check server status
curl http://localhost:3000/health

# Check LLM provider health
curl http://localhost:3000/api/chat/health

# Check database connection (if using local DB)
psql -h localhost -U konkani_dev -d konkani_dictionary -c "SELECT COUNT(*) FROM dictionary_entries;"
```

## API Reference

### Chat Endpoints

**POST /api/chat**
- Send message to LLM
- Returns 503 if LLM disabled

**GET /api/chat/providers**
- List available LLM providers

**POST /api/chat/provider**
- Switch LLM provider

**GET /api/chat/health**
- Check LLM provider health

### Dictionary Endpoints

**GET /api/dictionary**
- Search dictionary
- Optional LLM enhancement via `use_llm` param

**GET /api/dictionary/:id**
- Get specific entry

**GET /api/dictionary/config/llm-status**
- Check LLM configuration

## Future Enhancements

Potential improvements:
1. More sophisticated matching algorithms (semantic similarity)
2. Performance metrics and analytics
3. Automated regression testing
4. A/B testing framework for different LLM providers
5. Caching layer for common queries
6. Rate limiting for LLM calls
7. Cost tracking for API usage

## Contributing

When adding new features:
1. Update this README
2. Add tests to verification utility
3. Update `.env.example` with new variables
4. Document API changes

## License

[Your License Here]
