# Test Cases for LLM Integration Validation

This document describes the test case generation and validation system for the Konkani Dictionary LLM integration.

## Overview

The test case system helps ensure that the LLM returns accurate information from the Konkani dictionary database rather than hallucinating responses. It provides:

1. **Automated test case generation** from dictionary database entries
2. **LLM response validation** against known database entries
3. **Toggle functionality** to enable/disable LLM-based responses
4. **Comprehensive reporting** of test results and accuracy metrics

## Quick Start

### 1. Configuration

Add these environment variables to your `.env` file:

```bash
# Database Configuration (PostgreSQL - Railway)
DB_HOST=postgres.railway.internal
DB_PORT=5432
DB_NAME=konkani_dictionary
DB_USER=postgres
DB_PASSWORD=your_database_password

# Dictionary API URL (if using Railway deployment)
DICTIONARY_API_URL=https://konkani-dictionary-production.up.railway.app/api/dictionary

# LLM Toggle - set to 'false' to disable LLM-based responses
ENABLE_LLM=true

# LLM Provider Configuration
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
```

### 2. Start the Server

```bash
npm install
npm start
```

The server will start on port 3000 (or the port specified in your `.env`).

### 3. Generate Test Cases

Fetch dictionary entries and create test cases:

```bash
# Generate 50 test cases (default)
node scripts/generate-test-cases.js

# Generate custom number of test cases
node scripts/generate-test-cases.js --limit=100
```

This creates `test-data/llm-test-cases.json` with structured test cases.

### 4. Validate LLM Responses

Test the LLM against generated test cases:

```bash
# Validate all test cases
node scripts/validate-llm-responses.js

# Validate first 10 test cases (for quick testing)
node scripts/validate-llm-responses.js --max=10
```

This creates `test-data/validation-results.json` with detailed results.

## Features

### LLM Toggle Functionality

You can enable or disable LLM-based responses at any time:

**Enable LLM:**
```bash
# In .env file
ENABLE_LLM=true
```

**Disable LLM:**
```bash
# In .env file
ENABLE_LLM=false
```

**Check Current Status:**
```bash
curl http://localhost:3000/api/chat/status
```

Response when enabled:
```json
{
  "enableLLM": true,
  "currentProvider": "openai",
  "availableProviders": ["openai", "anthropic", "ollama", "gemini"]
}
```

**When LLM is disabled:**
- The `/api/chat` endpoint returns a 503 error with a helpful message
- The `/api/dictionary` endpoint continues to work normally
- Test generation continues to work (fetches from database)
- You can still generate test cases for future use

### API Endpoints

#### Dictionary Endpoints

**GET /api/dictionary**
- Fetches dictionary entries from the database
- Query parameters:
  - `limit` (default: 10, max: 100) - Number of entries to fetch
  - `offset` (default: 0) - Pagination offset
  - `search` - Optional search term
- Returns: JSON with entries and pagination info

**GET /api/dictionary/:id**
- Fetch a specific dictionary entry by ID
- Returns: Single dictionary entry with full details

#### Chat/LLM Endpoints

**GET /api/chat/status**
- Check if LLM is enabled and which provider is active
- Returns: Current LLM configuration

**POST /api/chat**
- Send a message to the LLM
- Requires: `ENABLE_LLM=true`
- Body: `{ "message": "your question", "options": {...} }`
- Returns: LLM response or error if disabled

**GET /api/chat/providers**
- List available LLM providers
- Returns: Array of provider configurations

## Test Case Structure

Each generated test case follows this structure:

```json
{
  "id": "test-1",
  "entry_number": 1,
  "input": {
    "search_query": "konkani_word",
    "language": "konkani"
  },
  "expected_output": {
    "word_konkani_devanagari": "कोंकणी शब्द",
    "word_konkani_english_alphabet": "konkani_word",
    "english_meaning": "English translation",
    "context_usage_sentence": "Example sentence using the word"
  },
  "validation_criteria": {
    "should_match_word": true,
    "should_match_meaning": true,
    "should_not_hallucinate": true,
    "must_be_from_database": true
  }
}
```

## Validation Criteria

The validation script checks three main criteria:

1. **Word Match**: Does the LLM response include the correct Konkani word?
2. **Meaning Match**: Does the LLM response include the correct English meaning?
   - Uses 50% word overlap threshold to allow for paraphrasing
3. **Devanagari Match**: Does the LLM response include the correct Devanagari script?

**Pass Condition**: A test passes if either the word match OR meaning match criteria is met.

## Example Workflow

### Complete Testing Workflow

```bash
# 1. Start the server
npm start

# 2. In another terminal, check LLM status
curl http://localhost:3000/api/chat/status

# 3. Generate test cases from database
node scripts/generate-test-cases.js --limit=20

# 4. Run validation (test a subset first)
node scripts/validate-llm-responses.js --max=5

# 5. Review results
cat test-data/validation-results.json | jq '.summary'

# 6. If results are good, run full validation
node scripts/validate-llm-responses.js
```

### Testing with LLM Disabled

```bash
# 1. Disable LLM
echo "ENABLE_LLM=false" >> .env

# 2. Restart server
npm start

# 3. Try to use chat endpoint (should return 503)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# 4. Dictionary endpoint still works
curl http://localhost:3000/api/dictionary?limit=5
```

## Validation Results

The validation script generates a detailed report:

```json
{
  "generated_at": "2024-10-10T23:33:48.857Z",
  "summary": {
    "total_tests": 20,
    "passed": 18,
    "failed": 2,
    "pass_rate": "90.00%"
  },
  "results": [
    {
      "test_id": "test-1",
      "entry_number": 1,
      "input_query": "ghar",
      "passed": true,
      "checks": {
        "word_match": {
          "passed": true,
          "expected": "ghar",
          "found": true
        },
        "meaning_match": {
          "passed": true,
          "expected": "house",
          "match_ratio": "1/1"
        },
        "devanagari_match": {
          "passed": true,
          "expected": "घर",
          "found": true
        }
      },
      "llm_response": "The Konkani word 'ghar' (घर) means house...",
      "provider": "openai",
      "model": "gpt-4o-mini"
    }
  ]
}
```

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to database
**Solution**:
- Verify `.env` configuration
- Check if database is accessible
- Test database connection: `psql -h $DB_HOST -U $DB_USER -d $DB_NAME`

### LLM Disabled Error

**Problem**: Getting "LLM functionality is currently disabled"
**Solution**:
- Check `.env` file: `ENABLE_LLM=true`
- Restart the server after changing `.env`
- Verify with: `curl http://localhost:3000/api/chat/status`

### Test Generation Fails

**Problem**: Cannot fetch dictionary entries
**Solution**:
- Ensure server is running
- Check `DICTIONARY_API_URL` in `.env`
- Test manually: `curl http://localhost:3000/api/dictionary?limit=1`
- If using Railway URL, ensure it's accessible

### Rate Limiting

**Problem**: Getting rate limit errors during validation
**Solution**:
- Reduce number of tests: `--max=5`
- Increase delay between tests (edit validation script)
- Use a different LLM provider with higher limits

## Advanced Usage

### Custom System Prompts

When validating, you can customize the system prompt for more accurate responses:

Edit `scripts/validate-llm-responses.js` and modify the `systemPrompt` in the `queryLLM` function.

### Different LLM Providers

Switch between providers:

```bash
# Use Gemini
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key

# Use Anthropic
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_key
```

### Continuous Integration

Add to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Generate and Validate Test Cases
  run: |
    npm start &
    sleep 5
    node scripts/generate-test-cases.js --limit=10
    node scripts/validate-llm-responses.js --max=5
```

## Files and Directories

```
chatbot-backend/
├── config/
│   └── config.js              # Configuration with LLM toggle
├── routes/
│   ├── chat.js                # Chat endpoint with LLM toggle check
│   └── dictionary.js          # Dictionary API endpoints
├── scripts/
│   ├── generate-test-cases.js # Test case generator
│   ├── validate-llm-responses.js # LLM validator
│   └── README.md              # Scripts documentation
├── utils/
│   └── db.js                  # Database connection utility
├── test-data/                 # Generated test data (gitignored)
│   ├── llm-test-cases.json    # Generated test cases
│   └── validation-results.json # Validation results
└── .env.example               # Environment variables template
```

## Contributing

When adding new features:

1. Update test cases to cover new functionality
2. Run validation before committing
3. Document configuration changes in `.env.example`
4. Update this README with new features

## License

Same as the main project.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review `scripts/README.md` for detailed script documentation
3. Open an issue on GitHub
