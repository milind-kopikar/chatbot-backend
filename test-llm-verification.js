#!/usr/bin/env node

/**
 * Test script for LLM verification
 * 
 * Usage:
 *   node test-llm-verification.js [options]
 * 
 * Options:
 *   --production    Test against production API data
 *   --count=N       Number of test cases (default: 5)
 *   --url=URL       API base URL (default: http://localhost:3000)
 */

require('dotenv').config();
const { runVerificationTests, verifyAgainstProduction } = require('./utils/llm-verification');

async function main() {
    const args = process.argv.slice(2);
    
    // Parse arguments
    const useProduction = args.includes('--production');
    const countArg = args.find(arg => arg.startsWith('--count='));
    const urlArg = args.find(arg => arg.startsWith('--url='));
    
    const testCaseCount = countArg ? parseInt(countArg.split('=')[1]) : 5;
    const apiBaseUrl = urlArg ? urlArg.split('=')[1] : 'http://localhost:3000';
    
    console.log('🚀 LLM Verification Test Suite\n');
    console.log('Configuration:');
    console.log(`  Test Count: ${testCaseCount}`);
    console.log(`  API URL: ${apiBaseUrl}`);
    console.log(`  Mode: ${useProduction ? 'Production Data' : 'Local Database'}`);
    console.log(`  LLM Provider: ${process.env.LLM_PROVIDER || 'openai'}`);
    console.log(`  LLM Enabled: ${process.env.ENABLE_LLM !== 'false'}`);
    console.log('');
    
    // Run tests
    let results;
    if (useProduction) {
        results = await verifyAgainstProduction({
            testCaseCount,
            apiBaseUrl,
            verbose: true
        });
    } else {
        results = await runVerificationTests({
            testCaseCount,
            apiBaseUrl,
            verbose: true
        });
    }
    
    // Exit with appropriate code
    if (results.success) {
        console.log('\n✅ Tests completed successfully');
        process.exit(0);
    } else {
        console.log('\n❌ Tests failed:', results.error);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
