#!/usr/bin/env node
/**
 * LLM Response Validation Script
 * 
 * This script tests LLM responses against generated test cases to ensure
 * the LLM returns actual words from the database rather than hallucinated responses.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const CHAT_API_URL = process.env.CHAT_API_URL || 'http://localhost:3000/api/chat';
const TEST_CASES_FILE = path.join(__dirname, '../test-data/llm-test-cases.json');
const RESULTS_FILE = path.join(__dirname, '../test-data/validation-results.json');

/**
 * Load test cases from file
 */
function loadTestCases() {
    try {
        if (!fs.existsSync(TEST_CASES_FILE)) {
            throw new Error(`Test cases file not found: ${TEST_CASES_FILE}`);
        }

        const data = fs.readFileSync(TEST_CASES_FILE, 'utf-8');
        const testData = JSON.parse(data);
        
        console.log(`✅ Loaded ${testData.test_cases.length} test cases from ${TEST_CASES_FILE}`);
        return testData.test_cases;
    } catch (error) {
        console.error('❌ Error loading test cases:', error.message);
        throw error;
    }
}

/**
 * Query LLM with a test case
 */
async function queryLLM(testCase) {
    try {
        const systemPrompt = `You are a Konkani-English dictionary assistant. When asked about a Konkani word or English translation, provide accurate information from the dictionary. Do not make up or hallucinate words. If you don't know a word, say so.`;
        
        const message = `What is the meaning of the Konkani word "${testCase.input.search_query}"? Please provide: 1) Devanagari script, 2) English alphabet spelling, 3) English meaning, 4) Usage example.`;

        const response = await axios.post(CHAT_API_URL, {
            message,
            options: {
                systemPrompt,
                temperature: 0.3 // Lower temperature for more factual responses
            }
        });

        return {
            success: true,
            response: response.data.message,
            provider: response.data.provider,
            model: response.data.model
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
}

/**
 * Validate LLM response against expected output
 */
function validateResponse(testCase, llmResponse) {
    const validation = {
        test_id: testCase.id,
        entry_number: testCase.entry_number,
        input_query: testCase.input.search_query,
        passed: false,
        checks: {}
    };

    if (!llmResponse.success) {
        validation.error = llmResponse.error;
        return validation;
    }

    const response = llmResponse.response.toLowerCase();
    const expected = testCase.expected_output;

    // Check 1: Word appears in response
    if (expected.word_konkani_english_alphabet) {
        const wordInResponse = response.includes(expected.word_konkani_english_alphabet.toLowerCase());
        validation.checks.word_match = {
            passed: wordInResponse,
            expected: expected.word_konkani_english_alphabet,
            found: wordInResponse
        };
    }

    // Check 2: Meaning appears in response
    if (expected.english_meaning) {
        const meaningWords = expected.english_meaning.toLowerCase().split(/\s+/);
        const meaningMatchCount = meaningWords.filter(word => response.includes(word)).length;
        const meaningMatch = meaningMatchCount >= Math.ceil(meaningWords.length * 0.5); // 50% match threshold
        
        validation.checks.meaning_match = {
            passed: meaningMatch,
            expected: expected.english_meaning,
            match_ratio: `${meaningMatchCount}/${meaningWords.length}`
        };
    }

    // Check 3: Devanagari appears in response (if available)
    if (expected.word_konkani_devanagari) {
        const devanagariInResponse = llmResponse.response.includes(expected.word_konkani_devanagari);
        validation.checks.devanagari_match = {
            passed: devanagariInResponse,
            expected: expected.word_konkani_devanagari,
            found: devanagariInResponse
        };
    }

    // Overall pass: word or meaning must match
    validation.passed = (validation.checks.word_match?.passed || validation.checks.meaning_match?.passed);
    validation.llm_response = llmResponse.response;
    validation.provider = llmResponse.provider;
    validation.model = llmResponse.model;

    return validation;
}

/**
 * Run validation on all test cases
 */
async function runValidation(testCases, maxTests = null) {
    console.log(`\n🧪 Running validation on ${maxTests || testCases.length} test cases...\n`);
    
    const results = [];
    const casesToTest = maxTests ? testCases.slice(0, maxTests) : testCases;
    
    for (let i = 0; i < casesToTest.length; i++) {
        const testCase = casesToTest[i];
        console.log(`[${i + 1}/${casesToTest.length}] Testing: ${testCase.input.search_query}`);
        
        try {
            const llmResponse = await queryLLM(testCase);
            const validation = validateResponse(testCase, llmResponse);
            results.push(validation);
            
            if (validation.passed) {
                console.log(`  ✅ PASSED`);
            } else {
                console.log(`  ❌ FAILED`);
            }
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.log(`  ❌ ERROR: ${error.message}`);
            results.push({
                test_id: testCase.id,
                entry_number: testCase.entry_number,
                passed: false,
                error: error.message
            });
        }
    }
    
    return results;
}

/**
 * Generate validation report
 */
function generateReport(results) {
    const totalTests = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = totalTests - passed;
    const passRate = ((passed / totalTests) * 100).toFixed(2);

    const report = {
        generated_at: new Date().toISOString(),
        summary: {
            total_tests: totalTests,
            passed,
            failed,
            pass_rate: `${passRate}%`
        },
        results
    };

    return report;
}

/**
 * Save validation results
 */
function saveResults(report) {
    try {
        const dir = path.dirname(RESULTS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(RESULTS_FILE, JSON.stringify(report, null, 2), 'utf-8');
        console.log(`\n💾 Results saved to: ${RESULTS_FILE}`);
    } catch (error) {
        console.error('❌ Error saving results:', error.message);
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        console.log('🚀 Starting LLM response validation...\n');
        
        // Check if LLM is enabled
        try {
            const statusResponse = await axios.get(`${CHAT_API_URL}/status`);
            if (!statusResponse.data.enableLLM) {
                console.log('⚠️  Warning: LLM is currently disabled in configuration');
                console.log('   Set ENABLE_LLM=true in .env to enable LLM functionality');
                return;
            }
            console.log(`✅ LLM is enabled (Provider: ${statusResponse.data.currentProvider})\n`);
        } catch (error) {
            console.log('⚠️  Could not check LLM status, continuing anyway...\n');
        }

        // Parse command line arguments
        const args = process.argv.slice(2);
        const maxTestsArg = args.find(arg => arg.startsWith('--max='));
        const maxTests = maxTestsArg ? parseInt(maxTestsArg.split('=')[1]) : null;

        // Load test cases
        const testCases = loadTestCases();
        
        // Run validation
        const results = await runValidation(testCases, maxTests);
        
        // Generate and save report
        const report = generateReport(results);
        saveResults(report);
        
        // Print summary
        console.log('\n📊 Validation Summary:');
        console.log(`   Total Tests: ${report.summary.total_tests}`);
        console.log(`   Passed: ${report.summary.passed}`);
        console.log(`   Failed: ${report.summary.failed}`);
        console.log(`   Pass Rate: ${report.summary.pass_rate}`);
        
        console.log('\n✨ Validation completed!');
        
    } catch (error) {
        console.error('\n❌ Validation failed:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { loadTestCases, queryLLM, validateResponse, runValidation };
