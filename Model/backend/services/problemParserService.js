/**
 * Problem Parser Service
 * Parses problem files and extracts structured information
 */

/**
 * Parse problem text and extract structured data
 * @param {string} problemText - Raw problem text
 * @returns {Object} Parsed problem data
 */
function parseProblem(problemText) {
  const problem = {
    title: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    examples: [],
    difficulty: 'Medium',
  };

  // Extract title (first line or heading)
  const titleMatch = problemText.match(/^#\s*(.+)|^Title:\s*(.+)|^Problem:\s*(.+)/im);
  if (titleMatch) {
    problem.title = (titleMatch[1] || titleMatch[2] || titleMatch[3]).trim();
  } else {
    // Use first non-empty line as title
    const firstLine = problemText.split('\n').find(line => line.trim());
    problem.title = firstLine ? firstLine.trim().substring(0, 100) : 'Untitled Problem';
  }

  // Extract description
  const descMatch = problemText.match(/(?:Description|Problem Description|Problem Statement)[:\s]*\n([\s\S]+?)(?=\n(?:Input|Output|Constraints|Example|$))/i);
  if (descMatch) {
    problem.description = descMatch[1].trim();
  } else {
    // Use text before first "Input" or "Example" as description
    const beforeInput = problemText.split(/\n(?:Input|Example)/i)[0];
    problem.description = beforeInput.replace(/^#.*\n/, '').trim();
  }

  // Extract input format
  const inputMatch = problemText.match(/Input\s*(?:Format)?[:\s]*\n([\s\S]+?)(?=\n(?:Output|Constraints|Example|$))/i);
  if (inputMatch) {
    problem.inputFormat = inputMatch[1].trim();
  }

  // Extract output format
  const outputMatch = problemText.match(/Output\s*(?:Format)?[:\s]*\n([\s\S]+?)(?=\n(?:Constraints|Example|$))/i);
  if (outputMatch) {
    problem.outputFormat = outputMatch[1].trim();
  }

  // Extract constraints
  const constraintsMatch = problemText.match(/Constraints[:\s]*\n([\s\S]+?)(?=\n(?:Example|$))/i);
  if (constraintsMatch) {
    problem.constraints = constraintsMatch[1].trim();
  }

  // Extract examples
  const exampleRegex = /Example\s*(\d+)?[:\s]*\n(?:Input[:\s]*(.+?)\n)?(?:Output[:\s]*(.+?)(?:\n|$))/gi;
  let exampleMatch;
  while ((exampleMatch = exampleRegex.exec(problemText)) !== null) {
    problem.examples.push({
      input: (exampleMatch[2] || '').trim(),
      output: (exampleMatch[3] || '').trim(),
    });
  }

  // Detect difficulty
  if (/\b(?:easy|simple|basic)\b/i.test(problemText)) {
    problem.difficulty = 'Easy';
  } else if (/\b(?:hard|difficult|complex)\b/i.test(problemText)) {
    problem.difficulty = 'Hard';
  }

  return problem;
}

/**
 * Generate test cases from parsed problem
 * @param {Object} problem - Parsed problem data
 * @returns {Array} Generated test cases
 */
function generateTestCases(problem) {
  const testCases = [];
  let id = 1;

  // Add example test cases as basic tests
  if (problem.examples && problem.examples.length > 0) {
    problem.examples.forEach((example, index) => {
      if (example.input && example.output) {
        testCases.push({
          id: id++,
          input: example.input,
          expected_output: example.output,
          label: 'basic',
        });
      }
    });
  }

  // Generate edge cases based on problem type
  const edgeCases = generateEdgeCases(problem);
  edgeCases.forEach(testCase => {
    testCases.push({
      id: id++,
      ...testCase,
    });
  });

  // Ensure minimum 5 test cases
  while (testCases.length < 5) {
    testCases.push({
      id: id++,
      input: generateRandomInput(problem),
      expected_output: 'TBD',
      label: 'stress',
    });
  }

  return testCases;
}

/**
 * Generate edge cases based on problem characteristics
 */
function generateEdgeCases(problem) {
  const edgeCases = [];
  const text = (problem.description + ' ' + problem.constraints).toLowerCase();

  // Array/List problems
  if (/array|list|sequence/i.test(text)) {
    edgeCases.push(
      { input: '[]', expected_output: 'TBD', label: 'null' },
      { input: '[1]', expected_output: 'TBD', label: 'edge' },
      { input: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]', expected_output: 'TBD', label: 'basic' }
    );
  }

  // String problems
  if (/string|text|word/i.test(text)) {
    edgeCases.push(
      { input: '""', expected_output: 'TBD', label: 'null' },
      { input: '"a"', expected_output: 'TBD', label: 'edge' },
      { input: '"abcdefghijklmnopqrstuvwxyz"', expected_output: 'TBD', label: 'stress' }
    );
  }

  // Number problems
  if (/number|integer|digit/i.test(text)) {
    edgeCases.push(
      { input: '0', expected_output: 'TBD', label: 'edge' },
      { input: '-1', expected_output: 'TBD', label: 'negative' },
      { input: '1000000', expected_output: 'TBD', label: 'stress' }
    );
  }

  // Tree/Graph problems
  if (/tree|graph|node/i.test(text)) {
    edgeCases.push(
      { input: 'null', expected_output: 'TBD', label: 'null' },
      { input: '{"val": 1, "left": null, "right": null}', expected_output: 'TBD', label: 'edge' }
    );
  }

  return edgeCases;
}

/**
 * Generate random input based on problem type
 */
function generateRandomInput(problem) {
  const text = (problem.description + ' ' + problem.constraints).toLowerCase();
  
  if (/array|list/i.test(text)) {
    const size = Math.floor(Math.random() * 10) + 1;
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    return JSON.stringify(arr);
  }
  
  if (/string/i.test(text)) {
    const length = Math.floor(Math.random() * 20) + 1;
    return '"' + Array.from({ length }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('') + '"';
  }
  
  return String(Math.floor(Math.random() * 1000));
}

/**
 * Create slug from title
 */
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

module.exports = {
  parseProblem,
  generateTestCases,
  createSlug,
};
