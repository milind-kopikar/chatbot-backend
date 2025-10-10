const { Pool } = require('pg');
const axios = require('axios');

/**
 * LLM Verification Utility
 * 
 * This utility verifies LLM responses against actual database entries
 * for the Konkani dictionary application.
 */

// Database connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'konkani_dictionary',
    user: process.env.DB_USER || 'konkani_dev',
    password: process.env.DB_PASSWORD || 'dev_password_2024',
});

/**
 * Fetch test cases from database
 * @param {number} limit - Number of test cases to fetch
 * @returns {Promise<Array>} Array of dictionary entries to use as test cases
 */
async function fetchTestCases(limit = 5) {
    try {
        const result = await pool.query(
            `SELECT 
                id,
                entry_number,
                word_konkani_devanagari,
                word_konkani_english_alphabet,
                english_meaning,
                context_usage_sentence
            FROM dictionary_entries 
            WHERE status = 'published' 
            AND word_konkani_english_alphabet IS NOT NULL 
            AND english_meaning IS NOT NULL
            ORDER BY entry_number 
            LIMIT $1`,
            [limit]
        );
        
        return result.rows;
    } catch (error) {
        console.error('Error fetching test cases:', error);
        throw error;
    }
}

/**
 * Query LLM for a word meaning
 * @param {string} word - Konkani word to query
 * @param {string} apiBaseUrl - Base URL of the API
 * @returns {Promise<Object>} LLM response
 */
async function queryLLM(word, apiBaseUrl = 'http://localhost:3000') {
    try {
        const response = await axios.post(`${apiBaseUrl}/api/chat`, {
            message: `What is the meaning of the Konkani word "${word}" in English?`,
            options: {
                systemPrompt: 'You are a Konkani language expert. Provide concise, accurate translations and meanings.',
                temperature: 0.3,
                maxTokens: 150
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
 * Verify LLM response against database entry
 * @param {Object} databaseEntry - Actual database entry
 * @param {string} llmResponse - LLM's response
 * @returns {Object} Verification result
 */
function verifyResponse(databaseEntry, llmResponse) {
    const actualMeaning = databaseEntry.english_meaning.toLowerCase();
    const llmMeaningLower = llmResponse.toLowerCase();
    
    // Check if LLM response contains key words from actual meaning
    const meaningWords = actualMeaning.split(/\s+/).filter(word => word.length > 3);
    const matchedWords = meaningWords.filter(word => 
        llmMeaningLower.includes(word.toLowerCase())
    );
    
    const matchPercentage = meaningWords.length > 0 
        ? (matchedWords.length / meaningWords.length) * 100 
        : 0;
    
    return {
        word: databaseEntry.word_konkani_english_alphabet,
        actual_meaning: databaseEntry.english_meaning,
        llm_response: llmResponse,
        match_percentage: Math.round(matchPercentage),
        matched_words: matchedWords,
        is_accurate: matchPercentage >= 50 // Consider 50% word match as accurate
    };
}

/**
 * Run verification test suite
 * @param {Object} options - Test options
 * @returns {Promise<Object>} Test results
 */
async function runVerificationTests(options = {}) {
    const {
        testCaseCount = 5,
        apiBaseUrl = 'http://localhost:3000',
        verbose = true
    } = options;
    
    console.log('🧪 Starting LLM Verification Tests...\n');
    
    try {
        // Fetch test cases from database
        if (verbose) console.log('📚 Fetching test cases from database...');
        const testCases = await fetchTestCases(testCaseCount);
        
        if (testCases.length === 0) {
            console.log('⚠️  No test cases found in database');
            return { success: false, error: 'No test cases available' };
        }
        
        if (verbose) console.log(`✅ Loaded ${testCases.length} test cases\n`);
        
        // Run tests
        const results = [];
        let successCount = 0;
        
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const word = testCase.word_konkani_english_alphabet;
            
            if (verbose) {
                console.log(`\n📝 Test ${i + 1}/${testCases.length}: ${word}`);
                console.log(`   Expected: ${testCase.english_meaning}`);
            }
            
            // Query LLM
            const llmResult = await queryLLM(word, apiBaseUrl);
            
            if (!llmResult.success) {
                if (verbose) console.log(`   ❌ LLM Error: ${llmResult.error}`);
                results.push({
                    test_number: i + 1,
                    word,
                    success: false,
                    error: llmResult.error
                });
                continue;
            }
            
            if (verbose) {
                console.log(`   LLM Response: ${llmResult.response}`);
                console.log(`   Provider: ${llmResult.provider}`);
            }
            
            // Verify response
            const verification = verifyResponse(testCase, llmResult.response);
            
            if (verbose) {
                console.log(`   Match: ${verification.match_percentage}%`);
                console.log(`   Accurate: ${verification.is_accurate ? '✅' : '❌'}`);
            }
            
            if (verification.is_accurate) {
                successCount++;
            }
            
            results.push({
                test_number: i + 1,
                ...verification,
                provider: llmResult.provider,
                model: llmResult.model
            });
        }
        
        // Summary
        const accuracy = Math.round((successCount / testCases.length) * 100);
        
        console.log('\n\n' + '='.repeat(60));
        console.log('📊 VERIFICATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${testCases.length}`);
        console.log(`Accurate Responses: ${successCount}`);
        console.log(`Failed/Inaccurate: ${testCases.length - successCount}`);
        console.log(`Overall Accuracy: ${accuracy}%`);
        console.log('='.repeat(60));
        
        return {
            success: true,
            total_tests: testCases.length,
            accurate_responses: successCount,
            accuracy_percentage: accuracy,
            results
        };
        
    } catch (error) {
        console.error('❌ Verification tests failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Fetch entries from production API for verification
 * @param {number} limit - Number of entries to fetch
 * @returns {Promise<Array>} Array of dictionary entries
 */
async function fetchProductionEntries(limit = 5) {
    try {
        const response = await axios.get(
            `https://konkani-dictionary-production.up.railway.app/api/dictionary?limit=${limit}`
        );
        return response.data.entries || response.data;
    } catch (error) {
        console.error('Error fetching production entries:', error.message);
        throw error;
    }
}

/**
 * Run verification against production data
 * @param {Object} options - Test options
 * @returns {Promise<Object>} Test results
 */
async function verifyAgainstProduction(options = {}) {
    const {
        testCaseCount = 5,
        apiBaseUrl = 'http://localhost:3000',
        verbose = true
    } = options;
    
    console.log('🌐 Starting Production Data Verification...\n');
    
    try {
        if (verbose) console.log('📚 Fetching entries from production API...');
        const entries = await fetchProductionEntries(testCaseCount);
        
        if (entries.length === 0) {
            console.log('⚠️  No entries found in production');
            return { success: false, error: 'No production entries available' };
        }
        
        if (verbose) console.log(`✅ Loaded ${entries.length} entries\n`);
        
        const results = [];
        let successCount = 0;
        
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const word = entry.word_konkani_english_alphabet;
            
            if (!word || !entry.english_meaning) continue;
            
            if (verbose) {
                console.log(`\n📝 Test ${i + 1}/${entries.length}: ${word}`);
                console.log(`   Expected: ${entry.english_meaning}`);
            }
            
            const llmResult = await queryLLM(word, apiBaseUrl);
            
            if (!llmResult.success) {
                if (verbose) console.log(`   ❌ LLM Error: ${llmResult.error}`);
                continue;
            }
            
            if (verbose) console.log(`   LLM Response: ${llmResult.response}`);
            
            const verification = verifyResponse(entry, llmResult.response);
            
            if (verbose) {
                console.log(`   Match: ${verification.match_percentage}%`);
                console.log(`   Accurate: ${verification.is_accurate ? '✅' : '❌'}`);
            }
            
            if (verification.is_accurate) {
                successCount++;
            }
            
            results.push({
                test_number: i + 1,
                ...verification
            });
        }
        
        const accuracy = results.length > 0 
            ? Math.round((successCount / results.length) * 100) 
            : 0;
        
        console.log('\n\n' + '='.repeat(60));
        console.log('📊 PRODUCTION VERIFICATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${results.length}`);
        console.log(`Accurate Responses: ${successCount}`);
        console.log(`Overall Accuracy: ${accuracy}%`);
        console.log('='.repeat(60));
        
        return {
            success: true,
            total_tests: results.length,
            accurate_responses: successCount,
            accuracy_percentage: accuracy,
            results
        };
        
    } catch (error) {
        console.error('❌ Production verification failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    fetchTestCases,
    queryLLM,
    verifyResponse,
    runVerificationTests,
    verifyAgainstProduction,
    fetchProductionEntries
};
