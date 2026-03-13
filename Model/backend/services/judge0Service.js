const axios = require('axios');

// Judge0 API Configuration
// You can use the free RapidAPI Judge0 or self-host Judge0
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '';

// Language IDs for Judge0
const LANGUAGE_IDS = {
  javascript: 63,  // Node.js
  python: 71,      // Python 3
  java: 62,        // Java
  cpp: 54,         // C++ (GCC 9.2.0)
  c: 50,           // C (GCC 9.2.0)
  typescript: 74,  // TypeScript
  go: 60,          // Go
  rust: 73,        // Rust
};

/**
 * Submit code to Judge0 for execution
 * @param {string} code - Source code to execute
 * @param {string} language - Programming language
 * @param {string} stdin - Standard input (optional)
 * @returns {Promise<Object>} Execution result
 */
async function executeCode(code, language, stdin = '') {
  try {
    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // For local Judge0 (no API key needed)
    if (!JUDGE0_API_KEY) {
      const response = await axios.post(`${JUDGE0_API_URL}/submissions?wait=true`, {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: stdin ? Buffer.from(stdin).toString('base64') : '',
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return formatResult(response.data);
    }

    // For RapidAPI Judge0 (requires API key)
    const response = await axios.post(`${JUDGE0_API_URL}/submissions?wait=true`, {
      source_code: Buffer.from(code).toString('base64'),
      language_id: languageId,
      stdin: stdin ? Buffer.from(stdin).toString('base64') : '',
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
    });

    return formatResult(response.data);
  } catch (error) {
    console.error('Judge0 execution error:', error.response?.data || error.message);
    throw new Error('Code execution failed: ' + (error.response?.data?.message || error.message));
  }
}

/**
 * Format Judge0 response
 */
function formatResult(data) {
  const stdout = data.stdout ? Buffer.from(data.stdout, 'base64').toString() : '';
  const stderr = data.stderr ? Buffer.from(data.stderr, 'base64').toString() : '';
  const compile_output = data.compile_output ? Buffer.from(data.compile_output, 'base64').toString() : '';

  return {
    status: data.status.description,
    statusId: data.status.id,
    output: stdout,
    error: stderr || compile_output,
    time: data.time,
    memory: data.memory,
    exitCode: data.exit_code,
  };
}

/**
 * Run test cases against submitted code
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {Array} testCases - Array of {input, expected} objects
 * @returns {Promise<Object>} Test results
 */
async function runTestCases(code, language, testCases) {
  const results = [];
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    try {
      const result = await executeCode(code, language, testCase.input);
      
      const actualOutput = result.output.trim();
      const expectedOutput = testCase.expected.toString().trim();
      const isPass = actualOutput === expectedOutput;

      if (isPass) passed++;
      else failed++;

      results.push({
        testCase: i + 1,
        input: testCase.input,
        expected: expectedOutput,
        actual: actualOutput,
        passed: isPass,
        time: result.time,
        memory: result.memory,
        error: result.error,
      });
    } catch (error) {
      failed++;
      results.push({
        testCase: i + 1,
        input: testCase.input,
        expected: testCase.expected,
        actual: null,
        passed: false,
        error: error.message,
      });
    }
  }

  return {
    totalTests: testCases.length,
    passed,
    failed,
    results,
  };
}

module.exports = {
  executeCode,
  runTestCases,
  LANGUAGE_IDS,
};
