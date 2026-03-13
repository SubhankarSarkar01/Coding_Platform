const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const TIMEOUT_MS = 5000; // 5 seconds
const TEMP_DIR = path.join(__dirname, '../temp');

// Ensure temp directory exists
(async () => {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create temp directory:', err);
  }
})();

/**
 * Execute code against a single test case
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {string} input - Test input
 * @param {string} expectedOutput - Expected output
 * @returns {Promise<Object>} Execution result
 */
async function executeTestCase(code, language, input, expectedOutput) {
  const sessionId = crypto.randomBytes(16).toString('hex');
  const startTime = Date.now();

  try {
    const result = await executeCode(code, language, input, sessionId);
    const runtime = Date.now() - startTime;

    const actualOutput = result.output.trim();
    const expected = expectedOutput.trim();
    const passed = actualOutput === expected;

    return {
      passed,
      actualOutput,
      expectedOutput: expected,
      runtime_ms: runtime,
      memory_kb: result.memory || 0,
      error: result.error || null,
      status: result.error ? 'runtime_error' : (passed ? 'accepted' : 'wrong_answer'),
    };
  } catch (error) {
    return {
      passed: false,
      actualOutput: null,
      expectedOutput: expectedOutput.trim(),
      runtime_ms: Date.now() - startTime,
      memory_kb: 0,
      error: error.message,
      status: error.message.includes('timeout') ? 'time_limit_exceeded' : 'runtime_error',
    };
  } finally {
    // Cleanup temp files
    await cleanupSession(sessionId);
  }
}

/**
 * Execute code in specified language
 */
async function executeCode(code, language, input, sessionId) {
  switch (language.toLowerCase()) {
    case 'python':
    case 'python3':
      return await executePython(code, input, sessionId);
    case 'javascript':
    case 'node':
      return await executeJavaScript(code, input, sessionId);
    case 'java':
      return await executeJava(code, input, sessionId);
    case 'c':
      return await executeC(code, input, sessionId);
    case 'cpp':
    case 'c++':
      return await executeCpp(code, input, sessionId);
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

/**
 * Execute Python code
 */
async function executePython(code, input, sessionId) {
  const filename = path.join(TEMP_DIR, `${sessionId}.py`);
  await fs.writeFile(filename, code);

  return new Promise((resolve, reject) => {
    const process = exec(
      `python "${filename}"`,
      { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            reject(new Error('Time limit exceeded'));
          } else {
            resolve({ output: '', error: stderr || error.message, memory: 0 });
          }
        } else {
          resolve({ output: stdout, error: stderr, memory: 0 });
        }
      }
    );

    // Write input to stdin
    if (input) {
      process.stdin.write(input);
      process.stdin.end();
    }
  });
}

/**
 * Execute JavaScript code
 */
async function executeJavaScript(code, input, sessionId) {
  const filename = path.join(TEMP_DIR, `${sessionId}.js`);
  
  // Wrap code to handle input
  const wrappedCode = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let inputLines = [];
rl.on('line', (line) => {
  inputLines.push(line);
});

rl.on('close', () => {
  ${code}
});
`;

  await fs.writeFile(filename, wrappedCode);

  return new Promise((resolve, reject) => {
    const process = exec(
      `node "${filename}"`,
      { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            reject(new Error('Time limit exceeded'));
          } else {
            resolve({ output: '', error: stderr || error.message, memory: 0 });
          }
        } else {
          resolve({ output: stdout, error: stderr, memory: 0 });
        }
      }
    );

    if (input) {
      process.stdin.write(input);
      process.stdin.end();
    }
  });
}

/**
 * Execute Java code
 */
async function executeJava(code, input, sessionId) {
  const className = extractJavaClassName(code) || 'Solution';
  const filename = path.join(TEMP_DIR, `${className}.java`);
  await fs.writeFile(filename, code);

  // Compile
  try {
    await execPromise(`javac "${filename}"`, TIMEOUT_MS);
  } catch (error) {
    return { output: '', error: `Compilation error: ${error.message}`, memory: 0 };
  }

  // Execute
  return new Promise((resolve, reject) => {
    const process = exec(
      `java -cp "${TEMP_DIR}" ${className}`,
      { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            reject(new Error('Time limit exceeded'));
          } else {
            resolve({ output: '', error: stderr || error.message, memory: 0 });
          }
        } else {
          resolve({ output: stdout, error: stderr, memory: 0 });
        }
      }
    );

    if (input) {
      process.stdin.write(input);
      process.stdin.end();
    }
  });
}

/**
 * Execute C code
 */
async function executeC(code, input, sessionId) {
  const sourceFile = path.join(TEMP_DIR, `${sessionId}.c`);
  const outputFile = path.join(TEMP_DIR, `${sessionId}.out`);
  await fs.writeFile(sourceFile, code);

  // Compile
  try {
    await execPromise(`gcc "${sourceFile}" -o "${outputFile}"`, TIMEOUT_MS);
  } catch (error) {
    return { output: '', error: `Compilation error: ${error.message}`, memory: 0 };
  }

  // Execute
  return new Promise((resolve, reject) => {
    const process = exec(
      `"${outputFile}"`,
      { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            reject(new Error('Time limit exceeded'));
          } else {
            resolve({ output: '', error: stderr || error.message, memory: 0 });
          }
        } else {
          resolve({ output: stdout, error: stderr, memory: 0 });
        }
      }
    );

    if (input) {
      process.stdin.write(input);
      process.stdin.end();
    }
  });
}

/**
 * Execute C++ code
 */
async function executeCpp(code, input, sessionId) {
  const sourceFile = path.join(TEMP_DIR, `${sessionId}.cpp`);
  const outputFile = path.join(TEMP_DIR, `${sessionId}.out`);
  await fs.writeFile(sourceFile, code);

  // Compile
  try {
    await execPromise(`g++ "${sourceFile}" -o "${outputFile}"`, TIMEOUT_MS);
  } catch (error) {
    return { output: '', error: `Compilation error: ${error.message}`, memory: 0 };
  }

  // Execute
  return new Promise((resolve, reject) => {
    const process = exec(
      `"${outputFile}"`,
      { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            reject(new Error('Time limit exceeded'));
          } else {
            resolve({ output: '', error: stderr || error.message, memory: 0 });
          }
        } else {
          resolve({ output: stdout, error: stderr, memory: 0 });
        }
      }
    );

    if (input) {
      process.stdin.write(input);
      process.stdin.end();
    }
  });
}

/**
 * Helper: Execute command as promise
 */
function execPromise(command, timeout) {
  return new Promise((resolve, reject) => {
    exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve({ stdout, stderr });
    });
  });
}

/**
 * Extract Java class name from code
 */
function extractJavaClassName(code) {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : null;
}

/**
 * Cleanup session files
 */
async function cleanupSession(sessionId) {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const sessionFiles = files.filter(f => f.includes(sessionId));
    await Promise.all(sessionFiles.map(f => fs.unlink(path.join(TEMP_DIR, f)).catch(() => {})));
  } catch (err) {
    // Ignore cleanup errors
  }
}

async function runTestCases(code, language, testCases) {
  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    try {
      const result = await executeTestCase(code, language, testCase.input, testCase.expected);
      if (result.passed) passedCount++;
      else failedCount++;

      results.push({
        testCase: i + 1,
        input: testCase.input,
        expected: result.expectedOutput,
        actual: result.actualOutput,
        passed: result.passed,
        time: result.runtime_ms,
        memory: result.memory_kb,
        error: result.error,
      });
    } catch (error) {
      failedCount++;
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
    passed: passedCount,
    failed: failedCount,
    results,
  };
}

module.exports = {
  executeTestCase,
  executeCode,
  runTestCases,
  LANGUAGE_IDS: { javascript: 63, python: 71, java: 62, cpp: 54, c: 50 },
};
