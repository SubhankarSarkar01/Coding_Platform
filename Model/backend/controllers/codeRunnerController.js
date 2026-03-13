const pool = require('../config/db');
const testRunner = require('../services/testRunner');

/**
 * Execute code against problem test cases
 */
exports.runCode = async (req, res) => {
  try {
    const { code, language, problemSlug } = req.body;

    if (!code || !language || !problemSlug) {
      return res.status(400).json({ 
        message: 'Code, language, and problemSlug are required' 
      });
    }

    // Fetch problem and test cases
    const [problems] = await pool.query(
      'SELECT * FROM questions WHERE slug = ?',
      [problemSlug]
    );

    if (problems.length === 0) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const problem = problems[0];

    // Parse test cases from problem
    const testCases = parseTestCases(problem);

    if (testCases.length === 0) {
      return res.status(400).json({ 
        message: 'No test cases found for this problem' 
      });
    }

    // Run code against test cases
    const result = await testRunner.runTestCases(code, language, testCases);

    res.json(result);
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

/**
 * Parse test cases from problem data
 */
function parseTestCases(problem) {
  const testCases = [];

  // Parse input_json and frames_json if they exist
  if (problem.input_json) {
    try {
      const input = JSON.parse(problem.input_json);
      testCases.push({
        input: [input.array, input.target],
        expected: input.expected,
      });
    } catch (err) {
      console.error('Error parsing input_json:', err);
    }
  }

  // If no test cases, create default ones
  if (testCases.length === 0) {
    testCases.push(
      {
        input: [[1, 2, 3, 4, 5], 3],
        expected: 2,
      },
      {
        input: [[1, 2, 3, 4, 5], 6],
        expected: -1,
      }
    );
  }

  return testCases;
}
