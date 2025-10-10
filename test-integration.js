/**
 * Basic integration test to verify the implementation
 * Tests LLM toggle and dictionary route structure
 */

const config = require('./config/config');
const assert = require('assert');

console.log('🧪 Running integration tests...\n');

// Test 1: Check LLM toggle exists in config
console.log('Test 1: LLM toggle configuration');
try {
    assert(typeof config.enableLLM !== 'undefined', 'enableLLM should be defined in config');
    assert(typeof config.enableLLM === 'boolean', 'enableLLM should be a boolean');
    console.log('✅ PASSED - LLM toggle exists and is boolean:', config.enableLLM);
} catch (error) {
    console.log('❌ FAILED -', error.message);
    process.exit(1);
}

// Test 2: Check config structure
console.log('\nTest 2: Config structure');
try {
    assert(config.currentProvider, 'currentProvider should be defined');
    assert(config.providers, 'providers should be defined');
    assert(config.defaultSettings, 'defaultSettings should be defined');
    console.log('✅ PASSED - Config structure is valid');
} catch (error) {
    console.log('❌ FAILED -', error.message);
    process.exit(1);
}

// Test 3: Check database utility structure
console.log('\nTest 3: Database utility');
try {
    const db = require('./utils/db');
    assert(typeof db.getPool === 'function', 'getPool should be a function');
    assert(typeof db.query === 'function', 'query should be a function');
    assert(typeof db.closePool === 'function', 'closePool should be a function');
    console.log('✅ PASSED - Database utility exports correct functions');
} catch (error) {
    console.log('❌ FAILED -', error.message);
    process.exit(1);
}

// Test 4: Check dictionary route structure
console.log('\nTest 4: Dictionary route');
try {
    const dictionaryRoute = require('./routes/dictionary');
    assert(typeof dictionaryRoute === 'function', 'Dictionary route should be a router function');
    console.log('✅ PASSED - Dictionary route is properly structured');
} catch (error) {
    console.log('❌ FAILED -', error.message);
    process.exit(1);
}

// Test 5: Check scripts exist and have required exports
console.log('\nTest 5: Test generation script');
try {
    const generateScript = require('./scripts/generate-test-cases');
    assert(typeof generateScript.fetchDictionaryEntries === 'function', 'fetchDictionaryEntries should be exported');
    assert(typeof generateScript.generateTestCases === 'function', 'generateTestCases should be exported');
    assert(typeof generateScript.saveTestCases === 'function', 'saveTestCases should be exported');
    console.log('✅ PASSED - Test generation script has correct exports');
} catch (error) {
    console.log('❌ FAILED -', error.message);
    process.exit(1);
}

// Test 6: Check validation script
console.log('\nTest 6: Validation script');
try {
    const validateScript = require('./scripts/validate-llm-responses');
    assert(typeof validateScript.loadTestCases === 'function', 'loadTestCases should be exported');
    assert(typeof validateScript.queryLLM === 'function', 'queryLLM should be exported');
    assert(typeof validateScript.validateResponse === 'function', 'validateResponse should be exported');
    assert(typeof validateScript.runValidation === 'function', 'runValidation should be exported');
    console.log('✅ PASSED - Validation script has correct exports');
} catch (error) {
    console.log('❌ FAILED -', error.message);
    process.exit(1);
}

// Test 7: Test generateTestCases function with sample data
console.log('\nTest 7: generateTestCases function');
try {
    const { generateTestCases } = require('./scripts/generate-test-cases');
    const sampleEntries = [
        {
            entry_number: 1,
            word_konkani_devanagari: 'घर',
            word_konkani_english_alphabet: 'ghar',
            english_meaning: 'house',
            context_usage_sentence: 'This is my house'
        },
        {
            entry_number: 2,
            word_konkani_devanagari: 'पाणी',
            word_konkani_english_alphabet: 'pani',
            english_meaning: 'water',
            context_usage_sentence: 'I drink water'
        }
    ];
    
    const testCases = generateTestCases(sampleEntries);
    assert(Array.isArray(testCases), 'Should return an array');
    assert(testCases.length === 2, 'Should have 2 test cases');
    assert(testCases[0].id, 'Test case should have an id');
    assert(testCases[0].input, 'Test case should have input');
    assert(testCases[0].expected_output, 'Test case should have expected_output');
    assert(testCases[0].validation_criteria, 'Test case should have validation_criteria');
    console.log('✅ PASSED - generateTestCases produces correct structure');
} catch (error) {
    console.log('❌ FAILED -', error.message);
    process.exit(1);
}

// Test 8: Test validateResponse function
console.log('\nTest 8: validateResponse function');
try {
    const { validateResponse } = require('./scripts/validate-llm-responses');
    const testCase = {
        id: 'test-1',
        entry_number: 1,
        input: {
            search_query: 'ghar',
            language: 'konkani'
        },
        expected_output: {
            word_konkani_devanagari: 'घर',
            word_konkani_english_alphabet: 'ghar',
            english_meaning: 'house',
            context_usage_sentence: 'This is my house'
        }
    };
    
    const llmResponse = {
        success: true,
        response: 'The Konkani word "ghar" (घर) means house in English. Example: This is my house.',
        provider: 'openai',
        model: 'gpt-4o-mini'
    };
    
    const validation = validateResponse(testCase, llmResponse);
    assert(validation.test_id === 'test-1', 'Should preserve test_id');
    assert(typeof validation.passed === 'boolean', 'Should have passed status');
    assert(validation.checks, 'Should have checks object');
    console.log('✅ PASSED - validateResponse produces correct validation structure');
} catch (error) {
    console.log('❌ FAILED -', error.message);
    process.exit(1);
}

console.log('\n✨ All integration tests passed!\n');
console.log('Summary:');
console.log('  - LLM toggle: ENABLED =', config.enableLLM);
console.log('  - Current provider:', config.currentProvider);
console.log('  - Database utility: OK');
console.log('  - Dictionary route: OK');
console.log('  - Test generation script: OK');
console.log('  - Validation script: OK');
console.log('  - Function tests: OK');
