const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { extractFunctionName } = require('./functionExtractor');

const TIMEOUT_MS = 5000;
const TEMP_DIR = path.join(__dirname, '../temp');

// Ensure temp directory exists
(async () => {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (err) {}
})();

/**
 * Run code against multiple test cases
 */
async function runTestCases(code, language, testCases) {
  const functionName = extractFunctionName(code, language);
  
  if (!functionName) {
    return {
      status: 'error',
      message: 'Error: No function definition found. Please define a function.',
      results: [],
    };
  }

  const results = [];
  let passedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    try {
      const result = await executeTestCase(code, language, functionName, testCase, i + 1);
      results.push(result);
      if (result.passed) passedCount++;
    } catch (error) {
      results.push({
        testNumber: i + 1,
        input: testCase.input,
        expected: testCase.expected,
        actual: null,
        passed: false,
        error: error.message,
        runtime_ms: 0,
      });
    }
  }

  return {
    status: 'success',
    functionName,
    results,
    totalTests: testCases.length,
    passedTests: passedCount,
    allPassed: passedCount === testCases.length,
  };
}

/**
 * Execute a single test case
 */
async function executeTestCase(code, language, functionName, testCase, testNumber) {
  const sessionId = crypto.randomBytes(16).toString('hex');
  const startTime = Date.now();

  try {
    let wrappedCode;
    let result;

    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        wrappedCode = wrapJavaScriptCode(code, functionName, testCase);
        result = await executeJavaScript(wrappedCode, sessionId);
        break;
      
      case 'python':
      case 'python3':
        wrappedCode = wrapPythonCode(code, functionName, testCase);
        result = await executePython(wrappedCode, sessionId);
        break;
      
      default:
        throw new Error(`Language ${language} not supported yet`);
    }

    const runtime = Date.now() - startTime;
    const actualOutput = result.output.trim();
    const expectedOutput = JSON.stringify(testCase.expected);
    
    // Try to parse actual output as JSON for comparison
    let actual;
    try {
      actual = JSON.parse(actualOutput);
    } catch {
      actual = actualOutput;
    }

    const passed = JSON.stringify(actual) === expectedOutput;

    return {
      testNumber,
      input: testCase.input,
      expected: testCase.expected,
      actual,
      passed,
      runtime_ms: runtime,
      error: result.error || null,
    };
  } catch (error) {
    return {
      testNumber,
      input: testCase.input,
      expected: testCase.expected,
      actual: null,
      passed: false,
      runtime_ms: Date.now() - startTime,
      error: error.message,
    };
  } finally {
    await cleanupSession(sessionId);
  }
}

/**
 * Wrap JavaScript code with test execution logic
 */
function wrapJavaScriptCode(userCode, functionName, testCase) {
  return `
${userCode}

// Test execution
try {
  const testInput = ${JSON.stringify(testCase.input)};
  const result = ${functionName}(...testInput);
  console.log(JSON.stringify(result));
} catch (error) {
  console.error('Runtime Error: ' + error.message);
  process.exit(1);
}
`;
}

/**
 * Wrap Python code with test execution logic
 */
function wrapPythonCode(userCode, functionName, testCase) {
  return `
import json
import sys

${userCode}

# Test execution
try:
    test_input = ${JSON.stringify(testCase.input)}
    result = ${functionName}(*test_input)
    print(json.dumps(result))
except Exception as error:
    print(f'Runtime Error: {str(error)}', file=sys.stderr)
    sys.exit(1)
`;
}

/**
 * Execute JavaScript code
 */
async function executeJavaScript(code, sessionId) {
  const filename = path.join(TEMP_DIR, `${sessionId}.js`);
  await fs.writeFile(filename, code);

  return new Promise((resolve, reject) => {
    exec(
      `node "${filename}"`,
      { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            reject(new Error('Time limit exceeded'));
          } else {
            resolve({ output: '', error: stderr || error.message });
          }
        } else {
          resolve({ output: stdout, error: stderr || null });
        }
      }
    );
  });
}

/**
 * Execute Python code
 */
async function executePython(code, sessionId) {
  const filename = path.join(TEMP_DIR, `${sessionId}.py`);
  await fs.writeFile(filename, code);

  // Try python first (Windows), then python3 (Linux/Mac)
  const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

  return new Promise((resolve, reject) => {
    exec(
      `${pythonCommand} "${filename}"`,
      { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            reject(new Error('Time limit exceeded'));
          } else {
            // Check if Python is not installed
            if (error.message.includes('not found') || error.message.includes('not recognized')) {
              resolve({ 
                output: '', 
                error: 'Python is not installed. Please install Python from python.org or use JavaScript instead.' 
              });
            } else {
              resolve({ output: '', error: stderr || error.message });
            }
          }
        } else {
          resolve({ output: stdout, error: stderr || null });
        }
      }
    );
  });
}

/**
 * Cleanup session files
 */
async function cleanupSession(sessionId) {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const sessionFiles = files.filter(f => f.includes(sessionId));
    await Promise.all(sessionFiles.map(f => fs.unlink(path.join(TEMP_DIR, f)).catch(() => {})));
  } catch (err) {}
}

module.exports = {
  runTestCases,
};
