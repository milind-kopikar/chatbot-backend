#!/usr/bin/env node
/**
 * Test Case Generator for LLM Integration Validation
 * 
 * This script fetches Konkani dictionary entries from the Railway database
 * and generates test cases in JSON format. These test cases can be used to
 * validate that LLM responses match actual database entries.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const DICTIONARY_API_URL = process.env.DICTIONARY_API_URL || 'http://localhost:3000/api/dictionary';
const OUTPUT_DIR = path.join(__dirname, '../test-data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'llm-test-cases.json');

/**
 * Fetch dictionary entries from the API
 */
async function fetchDictionaryEntries(limit = 50) {
    try {
        console.log(`Fetching ${limit} dictionary entries from ${DICTIONARY_API_URL}...`);
        
        const response = await axios.get(DICTIONARY_API_URL, {
            params: { limit }
        });

        if (!response.data || !response.data.entries) {
            throw new Error('Invalid response format from dictionary API');
        }

        console.log(`✅ Successfully fetched ${response.data.entries.length} entries`);
        return response.data.entries;
    } catch (error) {
        console.error('❌ Error fetching dictionary entries:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}

/**
 * Transform dictionary entries into test cases
 */
function generateTestCases(entries) {
    console.log('Generating test cases...');
    
    const testCases = entries.map((entry, index) => ({
        id: `test-${index + 1}`,
        entry_number: entry.entry_number,
        input: {
            search_query: entry.word_konkani_english_alphabet || entry.english_meaning,
            language: entry.word_konkani_english_alphabet ? 'konkani' : 'english'
        },
        expected_output: {
            word_konkani_devanagari: entry.word_konkani_devanagari,
            word_konkani_english_alphabet: entry.word_konkani_english_alphabet,
            english_meaning: entry.english_meaning,
            context_usage_sentence: entry.context_usage_sentence
        },
        validation_criteria: {
            should_match_word: true,
            should_match_meaning: true,
            should_not_hallucinate: true,
            must_be_from_database: true
        }
    }));

    console.log(`✅ Generated ${testCases.length} test cases`);
    return testCases;
}

/**
 * Save test cases to file
 */
function saveTestCases(testCases) {
    try {
        // Create output directory if it doesn't exist
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
            console.log(`Created output directory: ${OUTPUT_DIR}`);
        }

        const output = {
            generated_at: new Date().toISOString(),
            total_test_cases: testCases.length,
            description: 'Test cases for validating LLM responses against Konkani dictionary database entries',
            test_cases: testCases
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
        console.log(`✅ Test cases saved to: ${OUTPUT_FILE}`);
        
        return OUTPUT_FILE;
    } catch (error) {
        console.error('❌ Error saving test cases:', error.message);
        throw error;
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        console.log('🚀 Starting test case generation...\n');
        
        // Parse command line arguments
        const args = process.argv.slice(2);
        const limitArg = args.find(arg => arg.startsWith('--limit='));
        const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 50;

        // Fetch entries from database/API
        const entries = await fetchDictionaryEntries(limit);
        
        // Generate test cases
        const testCases = generateTestCases(entries);
        
        // Save to file
        const outputPath = saveTestCases(testCases);
        
        console.log('\n✨ Test case generation completed successfully!');
        console.log(`📄 Output file: ${outputPath}`);
        console.log(`📊 Total test cases: ${testCases.length}`);
        console.log('\nUsage:');
        console.log('  - Use these test cases to validate LLM responses');
        console.log('  - Run validation script: node scripts/validate-llm-responses.js');
        
    } catch (error) {
        console.error('\n❌ Test case generation failed:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { fetchDictionaryEntries, generateTestCases, saveTestCases };
