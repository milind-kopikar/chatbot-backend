#!/usr/bin/env node

/**
 * Demo script showing LLM verification functionality
 * This demonstrates the verification logic without requiring external APIs
 */

const { verifyResponse } = require('./utils/llm-verification');

console.log('🧪 LLM Verification Demo\n');
console.log('This demonstrates how the verification system works.\n');

// Sample test cases
const testCases = [
    {
        word_konkani_english_alphabet: 'namaskara',
        english_meaning: 'hello, greeting, salutation',
        llmResponse: 'The Konkani word "namaskara" means "hello" or "greeting" in English. It is commonly used as a respectful greeting.'
    },
    {
        word_konkani_english_alphabet: 'dev borem korum',
        english_meaning: 'good morning, morning greeting',
        llmResponse: 'This Konkani phrase translates to "good morning" in English.'
    },
    {
        word_konkani_english_alphabet: 'dhanyavaad',
        english_meaning: 'thank you, thanks, gratitude',
        llmResponse: 'In Konkani, "dhanyavaad" means "thank you" or expresses gratitude.'
    },
    {
        word_konkani_english_alphabet: 'koso',
        english_meaning: 'how, how are you',
        llmResponse: 'The word "koso" is used to ask "how" or "how are you" in Konkani.'
    },
    {
        word_konkani_english_alphabet: 'mhaka',
        english_meaning: 'to me, for me',
        llmResponse: 'This is a preposition meaning "to me" or "for me" in English.'
    }
];

console.log('Running verification tests on sample data...\n');
console.log('='.repeat(70));

let totalTests = testCases.length;
let accurateCount = 0;

testCases.forEach((testCase, index) => {
    console.log(`\n📝 Test ${index + 1}/${totalTests}: ${testCase.word_konkani_english_alphabet}`);
    console.log(`   Database Meaning: ${testCase.english_meaning}`);
    console.log(`   LLM Response: ${testCase.llmResponse}`);
    
    const result = verifyResponse(testCase, testCase.llmResponse);
    
    console.log(`   Match Percentage: ${result.match_percentage}%`);
    console.log(`   Matched Words: [${result.matched_words.join(', ')}]`);
    console.log(`   Accurate: ${result.is_accurate ? '✅ Yes' : '❌ No'}`);
    
    if (result.is_accurate) {
        accurateCount++;
    }
});

const accuracy = Math.round((accurateCount / totalTests) * 100);

console.log('\n' + '='.repeat(70));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(70));
console.log(`Total Tests: ${totalTests}`);
console.log(`Accurate Responses: ${accurateCount}`);
console.log(`Failed/Inaccurate: ${totalTests - accurateCount}`);
console.log(`Overall Accuracy: ${accuracy}%`);
console.log('='.repeat(70));

console.log('\n✅ Demo completed successfully!');
console.log('\nHow the verification works:');
console.log('1. Extracts key words from the database meaning (words > 3 characters)');
console.log('2. Checks which key words appear in the LLM response');
console.log('3. Calculates match percentage');
console.log('4. Considers response accurate if match >= 50%');
console.log('\nThis ensures LLM responses contain the essential meaning from the database.');
