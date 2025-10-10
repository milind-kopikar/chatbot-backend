# Usage Examples

This document provides practical examples for using the test case generation and LLM validation features.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure `.env` (copy from `.env.example`)
4. Start the server: `npm start`

## Example 1: Generate Test Cases from Local Server

If you have a local database running:

```bash
# Start server
npm start

# In another terminal, generate test cases
npm run test:generate

# Or with custom limit
node scripts/generate-test-cases.js --limit=100
```

**Output:**
```
🚀 Starting test case generation...

Fetching 50 dictionary entries from http://localhost:3000/api/dictionary...
✅ Successfully fetched 50 entries
Generating test cases...
✅ Generated 50 test cases
Created output directory: /path/to/test-data
✅ Test cases saved to: /path/to/test-data/llm-test-cases.json

✨ Test case generation completed successfully!
📄 Output file: /path/to/test-data/llm-test-cases.json
📊 Total test cases: 50

Usage:
  - Use these test cases to validate LLM responses
  - Run validation script: node scripts/validate-llm-responses.js
```

## Example 2: Generate Test Cases from Railway API

If using Railway deployment without local database:

```bash
# Set the Railway API URL in .env
echo "DICTIONARY_API_URL=https://konkani-dictionary-production.up.railway.app/api/dictionary" >> .env

# Generate test cases
npm run test:generate
```

## Example 3: Validate LLM Responses

Test a small subset first:

```bash
# Ensure LLM is enabled
curl http://localhost:3000/api/chat/status

# Validate first 5 test cases
node scripts/validate-llm-responses.js --max=5
```

**Output:**
```
🚀 Starting LLM response validation...

✅ LLM is enabled (Provider: openai)

✅ Loaded 50 test cases from /path/to/test-data/llm-test-cases.json

🧪 Running validation on 5 test cases...

[1/5] Testing: ghar
  ✅ PASSED
[2/5] Testing: pani
  ✅ PASSED
[3/5] Testing: udok
  ❌ FAILED
[4/5] Testing: dukh
  ✅ PASSED
[5/5] Testing: sukh
  ✅ PASSED

💾 Results saved to: /path/to/test-data/validation-results.json

📊 Validation Summary:
   Total Tests: 5
   Passed: 4
   Failed: 1
   Pass Rate: 80.00%

✨ Validation completed!
```

## Example 4: Toggle LLM On and Off

### Check Current Status

```bash
curl http://localhost:3000/api/chat/status
```

**Response:**
```json
{
  "enableLLM": true,
  "currentProvider": "openai",
  "availableProviders": ["openai", "anthropic", "ollama", "gemini"]
}
```

### Disable LLM

```bash
# Edit .env file
echo "ENABLE_LLM=false" > .env

# Restart server
npm start
```

### Test with LLM Disabled

```bash
# Try to send a chat message (should fail)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the meaning of ghar?"}'
```

**Response (503):**
```json
{
  "error": "LLM functionality is currently disabled",
  "message": "Please enable LLM in configuration to use this feature",
  "enableLLM": false
}
```

### Dictionary Still Works

```bash
# Dictionary endpoint works even when LLM is disabled
curl http://localhost:3000/api/dictionary?limit=3
```

**Response (200):**
```json
{
  "entries": [
    {
      "id": "uuid-1",
      "entry_number": 1,
      "word_konkani_devanagari": "घर",
      "word_konkani_english_alphabet": "ghar",
      "english_meaning": "house",
      "context_usage_sentence": "My house is near the beach"
    }
  ],
  "pagination": {
    "limit": 3,
    "offset": 0,
    "total": 1000,
    "hasMore": true
  }
}
```

## Example 5: Search Dictionary Entries

### Search by Konkani Word

```bash
curl "http://localhost:3000/api/dictionary?search=ghar&limit=5"
```

### Search by English Meaning

```bash
curl "http://localhost:3000/api/dictionary?search=house&limit=5"
```

### Pagination

```bash
# Get first page
curl "http://localhost:3000/api/dictionary?limit=10&offset=0"

# Get second page
curl "http://localhost:3000/api/dictionary?limit=10&offset=10"
```

## Example 6: Query LLM with Validation

### Send Query to LLM

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the Konkani word for water?",
    "options": {
      "temperature": 0.3,
      "maxTokens": 500
    }
  }'
```

**Response:**
```json
{
  "message": "The Konkani word for water is 'pani' (पाणी in Devanagari). Example usage: 'Maka pani zai' means 'I need water'.",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 32,
    "total_tokens": 77
  }
}
```

## Example 7: Complete Testing Workflow

### Full Workflow Script

```bash
#!/bin/bash

# 1. Start server in background
npm start &
SERVER_PID=$!
sleep 5

# 2. Check LLM status
echo "Checking LLM status..."
curl -s http://localhost:3000/api/chat/status | jq .

# 3. Generate test cases
echo "Generating test cases..."
node scripts/generate-test-cases.js --limit=20

# 4. Run quick validation
echo "Running validation on 5 test cases..."
node scripts/validate-llm-responses.js --max=5

# 5. Check results
echo "Validation results:"
cat test-data/validation-results.json | jq '.summary'

# 6. Cleanup
kill $SERVER_PID
```

## Example 8: Test with Different LLM Providers

### Switch to Gemini

```bash
# Update .env
echo "LLM_PROVIDER=gemini" >> .env
echo "GEMINI_API_KEY=your_key_here" >> .env

# Restart server
npm start

# Validate
node scripts/validate-llm-responses.js --max=3
```

### Switch to Anthropic

```bash
# Update .env
echo "LLM_PROVIDER=anthropic" >> .env
echo "ANTHROPIC_API_KEY=your_key_here" >> .env

# Restart server
npm start

# Validate
node scripts/validate-llm-responses.js --max=3
```

## Example 9: Programmatic Usage

### Generate Test Cases in Node.js

```javascript
const { fetchDictionaryEntries, generateTestCases, saveTestCases } = require('./scripts/generate-test-cases');

async function customTestGeneration() {
  // Fetch entries
  const entries = await fetchDictionaryEntries(30);
  
  // Filter entries (e.g., only entries with Devanagari)
  const filteredEntries = entries.filter(e => e.word_konkani_devanagari);
  
  // Generate test cases
  const testCases = generateTestCases(filteredEntries);
  
  // Save to custom location
  saveTestCases(testCases);
  
  console.log(`Generated ${testCases.length} test cases`);
}

customTestGeneration();
```

### Validate Responses Programmatically

```javascript
const { loadTestCases, runValidation } = require('./scripts/validate-llm-responses');

async function customValidation() {
  // Load test cases
  const testCases = loadTestCases();
  
  // Run validation on specific subset
  const subsetTests = testCases.filter(tc => tc.input.language === 'konkani');
  const results = await runValidation(subsetTests, 10);
  
  // Custom analysis
  const passedTests = results.filter(r => r.passed);
  console.log(`Pass rate: ${(passedTests.length / results.length * 100).toFixed(2)}%`);
}

customValidation();
```

## Example 10: Integration with CI/CD

### GitHub Actions

```yaml
name: LLM Validation

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run integration tests
        run: npm test
      
      - name: Start server
        run: npm start &
        
      - name: Wait for server
        run: sleep 5
      
      - name: Generate test cases
        run: npm run test:generate -- --limit=10
        env:
          DICTIONARY_API_URL: ${{ secrets.DICTIONARY_API_URL }}
      
      - name: Validate LLM responses
        run: npm run test:validate -- --max=5
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ENABLE_LLM: true
      
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: validation-results
          path: test-data/validation-results.json
```

## Tips and Best Practices

1. **Start Small**: Always test with `--max=5` or `--max=10` first
2. **Rate Limiting**: Add delays between API calls to avoid rate limits
3. **Monitor Costs**: LLM API calls cost money; be mindful of test volume
4. **Cache Results**: Save validation results for comparison over time
5. **Version Control**: Don't commit `test-data/` - it's gitignored for a reason
6. **Database Updates**: Regenerate test cases when dictionary is updated
7. **Multiple Runs**: Run validation multiple times to check consistency
8. **Temperature**: Use low temperature (0.3) for validation, higher for creative tasks
9. **Provider Comparison**: Test with different providers to compare accuracy
10. **Baseline**: Establish a baseline pass rate for your use case

## Troubleshooting

See `TEST_CASES_README.md` for detailed troubleshooting information.

## More Examples

For more examples and detailed documentation:
- See `scripts/README.md` for script-specific documentation
- See `TEST_CASES_README.md` for comprehensive feature documentation
- Run `npm run demo` for a quick feature overview
