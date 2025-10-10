/**
 * Demo script to showcase LLM toggle functionality
 */

require('dotenv').config();
const config = require('./config/config');

console.log('='.repeat(60));
console.log('LLM Toggle Configuration Demo');
console.log('='.repeat(60));

console.log('\n📋 Current Configuration:');
console.log('  • LLM Enabled:', config.enableLLM);
console.log('  • Current Provider:', config.currentProvider);
console.log('  • Available Providers:', Object.keys(config.providers).join(', '));

console.log('\n💡 How to Toggle LLM:');
console.log('  1. Set ENABLE_LLM=true in .env to enable LLM');
console.log('  2. Set ENABLE_LLM=false in .env to disable LLM');
console.log('  3. Default value is true if not specified');

console.log('\n🔧 Current Environment Variables:');
console.log('  • ENABLE_LLM:', process.env.ENABLE_LLM || '(not set, defaults to true)');
console.log('  • LLM_PROVIDER:', process.env.LLM_PROVIDER || '(not set, defaults to openai)');

console.log('\n🌐 API Endpoints:');
console.log('  • GET  /api/chat/status - Check LLM status');
console.log('  • POST /api/chat - Send message to LLM (requires LLM enabled)');
console.log('  • GET  /api/dictionary - Fetch dictionary entries');
console.log('  • GET  /api/chat/providers - List available LLM providers');

console.log('\n📝 Example API Calls:');
console.log('\n  # Check LLM status');
console.log('  curl http://localhost:3000/api/chat/status');
console.log('\n  # Fetch dictionary entries');
console.log('  curl http://localhost:3000/api/dictionary?limit=5');
console.log('\n  # Send message to LLM (when enabled)');
console.log('  curl -X POST http://localhost:3000/api/chat \\');
console.log('    -H "Content-Type: application/json" \\');
console.log('    -d \'{"message": "Hello, what is the Konkani word for house?"}\'');

console.log('\n📚 Testing Workflow:');
console.log('  1. Generate test cases:');
console.log('     node scripts/generate-test-cases.js --limit=20');
console.log('\n  2. Validate LLM responses:');
console.log('     node scripts/validate-llm-responses.js --max=5');
console.log('\n  3. Review results:');
console.log('     cat test-data/validation-results.json');

console.log('\n' + '='.repeat(60));
console.log('For detailed documentation, see scripts/README.md');
console.log('='.repeat(60) + '\n');
