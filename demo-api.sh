#!/bin/bash

# Demo script for LLM Verification System
# Shows API endpoints and functionality

echo "🎬 LLM Verification System - API Demo"
echo "======================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "❌ Server is not running!"
    echo "Please start the server first: npm start"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test 1: Health check
echo "📍 Test 1: Health Check"
echo "URL: GET http://localhost:3000/"
echo "Response:"
curl -s http://localhost:3000/ | jq .
echo ""

# Test 2: LLM Status
echo "📍 Test 2: LLM Configuration Status"
echo "URL: GET http://localhost:3000/api/dictionary/config/llm-status"
echo "Response:"
curl -s http://localhost:3000/api/dictionary/config/llm-status | jq .
echo ""

# Test 3: Available Providers
echo "📍 Test 3: Available LLM Providers"
echo "URL: GET http://localhost:3000/api/chat/providers"
echo "Response:"
curl -s http://localhost:3000/api/chat/providers | jq .
echo ""

# Test 4: Chat Endpoint (will fail without API key)
echo "📍 Test 4: Chat Endpoint (LLM Required)"
echo "URL: POST http://localhost:3000/api/chat"
echo "Request: {\"message\": \"Hello\"}"
echo "Response:"
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}' | jq .
echo ""
echo "Note: This requires an API key configured in .env file"
echo ""

# Test 5: Dictionary Search (without LLM)
echo "📍 Test 5: Dictionary Search (Database Only)"
echo "URL: GET http://localhost:3000/api/dictionary?query=test&limit=5"
echo "Response:"
curl -s "http://localhost:3000/api/dictionary?query=test&limit=5" | jq .
echo ""
echo "Note: This works without LLM and without database (returns empty results)"
echo ""

echo "======================================"
echo "✅ API Demo Complete!"
echo ""
echo "Key Endpoints:"
echo "  GET  / - Health check"
echo "  GET  /api/dictionary/config/llm-status - LLM status"
echo "  GET  /api/chat/providers - List providers"
echo "  POST /api/chat - Send message to LLM"
echo "  GET  /api/dictionary - Search dictionary"
echo ""
echo "Documentation:"
echo "  - QUICK_START.md - Quick start guide"
echo "  - LLM_VERIFICATION_README.md - Full documentation"
echo ""
echo "To test with LLM disabled:"
echo "  ENABLE_LLM=false npm start"
