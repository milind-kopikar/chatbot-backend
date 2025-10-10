# LLM Testing Scripts

This directory contains scripts for generating test cases and validating LLM responses against the Konkani dictionary database.

## Overview

The testing workflow consists of two main scripts:

1. **generate-test-cases.js** - Fetches dictionary entries and generates test cases
2. **validate-llm-responses.js** - Tests LLM responses against the generated test cases

## Prerequisites

1. Ensure the database is set up and populated with dictionary entries
2. Configure environment variables in `.env`:
   ```bash
   # Database Configuration
   DB_HOST=your_database_host
   DB_PORT=5432
   DB_NAME=konkani_dictionary
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # Dictionary API URL (if using Railway)
   DICTIONARY_API_URL=https://konkani-dictionary-production.up.railway.app/api/dictionary
   
   # LLM Configuration
   ENABLE_LLM=true
   LLM_PROVIDER=openai
   OPENAI_API_KEY=your_api_key
   ```

## Usage

### 1. Generate Test Cases

Fetch dictionary entries from the database and create test cases:

```bash
# Generate 50 test cases (default)
node scripts/generate-test-cases.js

# Generate custom number of test cases
node scripts/generate-test-cases.js --limit=100
```

**Output:** `test-data/llm-test-cases.json`

This file contains:
- Input queries (Konkani words or English translations)
- Expected outputs (Devanagari, English alphabet, meanings, context)
- Validation criteria

### 2. Validate LLM Responses

Test the LLM against the generated test cases:

```bash
# Validate all test cases
node scripts/validate-llm-responses.js

# Validate only first 10 test cases (useful for quick testing)
node scripts/validate-llm-responses.js --max=10
```

**Output:** `test-data/validation-results.json`

This file contains:
- Pass/fail status for each test
- Detailed check results (word match, meaning match, Devanagari match)
- Overall pass rate and statistics

## Toggle LLM Functionality

You can enable or disable LLM-based responses using the `ENABLE_LLM` environment variable:

```bash
# Enable LLM (default)
ENABLE_LLM=true

# Disable LLM
ENABLE_LLM=false
```

When LLM is disabled, the `/api/chat` endpoint will return an error indicating LLM functionality is disabled.

You can check LLM status using:

```bash
curl http://localhost:3000/api/chat/status
```

## Test Case Structure

Each test case includes:

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
    "context_usage_sentence": "Example sentence"
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

The validation script checks:

1. **Word Match**: Does the LLM response include the correct Konkani word?
2. **Meaning Match**: Does the LLM response include the correct English meaning (50% word overlap threshold)?
3. **Devanagari Match**: Does the LLM response include the correct Devanagari script?

A test passes if either the word or meaning check passes.

## Example Workflow

```bash
# 1. Start the server
npm start

# 2. Generate test cases from database
node scripts/generate-test-cases.js --limit=20

# 3. Run validation
node scripts/validate-llm-responses.js --max=10

# 4. Review results
cat test-data/validation-results.json
```

## API Endpoints

The scripts use these API endpoints:

- `GET /api/dictionary` - Fetch dictionary entries
- `GET /api/chat/status` - Check LLM status
- `POST /api/chat` - Query the LLM

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:
- Check your `.env` configuration
- Ensure the database is running
- Verify network connectivity

### LLM Disabled Error

If you get "LLM functionality is currently disabled":
- Set `ENABLE_LLM=true` in `.env`
- Restart the server

### API Not Responding

If the API endpoints don't respond:
- Ensure the server is running (`npm start`)
- Check the correct port is configured
- Verify firewall settings

## Notes

- Test cases are saved to `test-data/` which is gitignored to avoid committing large data files
- The validation script includes a 1-second delay between tests to avoid rate limiting
- Lower temperature (0.3) is used for validation to get more factual responses
- Pass rate threshold is 50% for meaning match to allow for paraphrasing
