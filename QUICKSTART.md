# Quick Start Guide - LLM Test Cases

Get up and running with test case generation and LLM validation in 5 minutes.

## Prerequisites

- Node.js installed
- PostgreSQL database with Konkani dictionary data (or access to Railway API)
- OpenAI API key (or other LLM provider key)

## 1. Install

```bash
npm install
```

## 2. Configure

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Minimum required configuration:**

```env
# LLM Configuration
ENABLE_LLM=true
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here

# Database (if using local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=konkani_dictionary
DB_USER=postgres
DB_PASSWORD=your_password

# Or use Railway API
DICTIONARY_API_URL=https://konkani-dictionary-production.up.railway.app/api/dictionary
```

## 3. Run

### Start Server

```bash
npm start
```

Server starts on http://localhost:3000

### Check Status

```bash
# View configuration demo
npm run demo

# Run integration tests
npm test
```

## 4. Generate Test Cases

```bash
# Generate 20 test cases from database
npm run test:generate -- --limit=20
```

Creates: `test-data/llm-test-cases.json`

## 5. Validate LLM

```bash
# Test first 5 cases
node scripts/validate-llm-responses.js --max=5
```

Creates: `test-data/validation-results.json`

## 6. Review Results

```bash
# View summary
cat test-data/validation-results.json | grep -A 4 "summary"

# Or with jq
cat test-data/validation-results.json | jq '.summary'
```

## Common Commands

```bash
# Check LLM status via API
curl http://localhost:3000/api/chat/status

# Fetch dictionary entries
curl http://localhost:3000/api/dictionary?limit=5

# Toggle LLM off (in .env)
ENABLE_LLM=false

# Toggle LLM on (in .env)
ENABLE_LLM=true
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/status` | GET | Check if LLM is enabled |
| `/api/chat` | POST | Send message to LLM |
| `/api/dictionary` | GET | Fetch dictionary entries |
| `/api/dictionary/:id` | GET | Get specific entry |

## NPM Scripts

```bash
npm start              # Start server
npm test               # Run integration tests
npm run demo           # Show configuration demo
npm run test:generate  # Generate test cases
npm run test:validate  # Validate LLM responses
```

## File Structure

```
chatbot-backend/
├── config/config.js           # LLM toggle configuration
├── routes/
│   ├── chat.js                # Chat/LLM endpoints
│   └── dictionary.js          # Dictionary API
├── scripts/
│   ├── generate-test-cases.js # Test case generator
│   ├── validate-llm-responses.js # LLM validator
│   └── README.md              # Script docs
├── utils/db.js                # Database connection
├── test-data/                 # Generated test data (gitignored)
│   ├── llm-test-cases.json    # Test cases
│   └── validation-results.json # Results
└── TEST_CASES_README.md       # Full documentation
```

## Typical Workflow

1. **Start server** → `npm start`
2. **Generate test cases** → `npm run test:generate`
3. **Validate responses** → `node scripts/validate-llm-responses.js --max=10`
4. **Review results** → Check `test-data/validation-results.json`
5. **Adjust if needed** → Modify prompts, test more cases
6. **Deploy** → Push to production with confidence

## Troubleshooting

### Can't connect to database?
- Check `.env` configuration
- Verify database is running
- Use Railway API URL instead

### LLM disabled error?
- Set `ENABLE_LLM=true` in `.env`
- Restart server

### No test cases generated?
- Ensure server is running
- Check `DICTIONARY_API_URL` in `.env`
- Verify database has data

## Next Steps

- Read `TEST_CASES_README.md` for detailed documentation
- See `USAGE_EXAMPLES.md` for 10+ practical examples
- Check `scripts/README.md` for script-specific docs

## Need Help?

1. Run the demo: `npm run demo`
2. Run tests: `npm test`
3. Check documentation files
4. Open an issue on GitHub

---

**Key Points:**
- ✅ LLM toggle: `ENABLE_LLM=true/false`
- ✅ Test generation: `npm run test:generate`
- ✅ Validation: `npm run test:validate`
- ✅ No hallucinations: Tests ensure accuracy
