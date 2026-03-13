const pool = require('../config/db');
const problemParser = require('../services/problemParserService');
const codeExecutor = require('../services/codeExecutionService');

/**
 * Upload and parse problem file
 */
exports.uploadProblem = async (req, res) => {
  try {
    const { fileContent } = req.body;

    if (!fileContent) {
      return res.status(400).json({ message: 'File content is required' });
    }

    // Parse problem file
    const parsedProblem = problemParser.parseProblemFile(fileContent);
    const slug = problemParser.createSlug(parsedProblem.title);

    // Generate test cases
    const testCases = problemParser.generateTestCases(parsedProblem);

    // Insert problem into database
    const [result] = await pool.query(
      `INSERT INTO problems (title, slug, description, input_format, output_format, 
       constraints, difficulty, category, examples) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parsedProblem.title,
        slug,
        parsedProblem.description,
        parsedProblem.inputFormat,
        parsedProblem.outputFormat,
        JSON.stringify(parsedProblem.constraints),
        parsedProblem.difficulty,
        parsedProblem.category,
        JSON.stringify(parsedProblem.examples),
      ]
    );

    const problemId = result.insertId;

    // Insert test cases
    for (const testCase of testCases) {
      await pool.query(
        `INSERT INTO test_cases (problem_id, input, expected_output, label, is_hidden) 
         VALUES (?, ?, ?, ?, ?)`,
        [problemId, testCase.input, testCase.expected_output, testCase.label, testCase.is_hidden]
      );
    }

    res.json({
      message: 'Problem uploaded successfully',
      problem: {
        id: problemId,
        slug,
        ...parsedProblem,
      },
      testCases: testCases.map(tc => ({
        ...tc,
        is_hidden: tc.is_hidden ? true : false,
      })),
    });
  } catch (error) {
    console.error('Upload problem error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get problem by slug with test cases
 */
exports.getProblem = async (req, res) => {
  try {
    const { slug } = req.params;

    const [problems] = await pool.query(
      'SELECT * FROM problems WHERE slug = ?',
      [slug]
    );

    if (problems.length === 0) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const problem = problems[0];

    // Get visible test cases only
    const [testCases] = await pool.query(
      'SELECT id, input, expected_output, label FROM test_cases WHERE problem_id = ? AND is_hidden = 0',
      [problem.id]
    );

    res.json({
      problem: {
        ...problem,
        constraints: JSON.parse(problem.constraints || '[]'),
        examples: JSON.parse(problem.examples || '[]'),
      },
      testCases,
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Run code against test cases (before submission)
 */
exports.runTests = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user.id;

    if (!problemId || !code || !language) {
      return res.status(400).json({ message: 'Problem ID, code, and language are required' });
    }

    // Get all test cases (including hidden ones)
    const [testCases] = await pool.query(
      'SELECT * FROM test_cases WHERE problem_id = ? ORDER BY id',
      [problemId]
    );

    if (testCases.length === 0) {
      return res.status(404).json({ message: 'No test cases found for this problem' });
    }

    // Execute code against all test cases
    const testResults = await codeExecutor.runAllTests(code, language, testCases);

    // Save test run session
    await pool.query(
      `INSERT INTO test_run_sessions (user_id, problem_id, language, code, test_results, all_passed) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, problemId, language, code, JSON.stringify(testResults), testResults.allPassed]
    );

    // Return only visible test results to user
    const visibleResults = testResults.results.filter((_, index) => !testCases[index].is_hidden);

    res.json({
      totalTests: testResults.totalTests,
      passed: testResults.passed,
      failed: testResults.failed,
      allPassed: testResults.allPassed,
      status: testResults.status,
      avgRuntime: testResults.avgRuntime,
      results: visibleResults,
      canSubmit: testResults.allPassed,
    });
  } catch (error) {
    console.error('Run tests error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Submit code (only allowed if all tests pass)
 */
exports.submitCode = async (req, res) => {
  try {
    const { problemId, code, language, testResults } = req.body;
    const userId = req.user.id;

    if (!problemId || !code || !language) {
      return res.status(400).json({ message: 'Problem ID, code, and language are required' });
    }

    // Verify all tests passed
    if (!testResults || !testResults.allPassed) {
      return res.status(400).json({ 
        message: 'Cannot submit: All test cases must pass before submission',
        canSubmit: false,
      });
    }

    // Insert submission
    const [result] = await pool.query(
      `INSERT INTO code_submissions 
       (user_id, problem_id, language, code, status, runtime_ms, memory_kb, test_results) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        problemId,
        language,
        code,
        testResults.status,
        testResults.avgRuntime,
        0, // Memory tracking not implemented yet
        JSON.stringify(testResults),
      ]
    );

    const submissionId = result.insertId;

    // Get problem details for response
    const [problems] = await pool.query('SELECT title, difficulty FROM problems WHERE id = ?', [problemId]);
    const problem = problems[0];

    res.json({
      message: 'Code submitted successfully!',
      submission: {
        id: submissionId,
        problemTitle: problem.title,
        difficulty: problem.difficulty,
        status: testResults.status,
        runtime: testResults.avgRuntime,
        language,
        totalTests: testResults.totalTests,
        passed: testResults.passed,
        submittedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user submissions for a problem
 */
exports.getSubmissions = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;

    const [submissions] = await pool.query(
      `SELECT id, language, status, runtime_ms, submitted_at 
       FROM code_submissions 
       WHERE user_id = ? AND problem_id = ? 
       ORDER BY submitted_at DESC 
       LIMIT 20`,
      [userId, problemId]
    );

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all problems list
 */
exports.getAllProblems = async (req, res) => {
  try {
    const [problems] = await pool.query(
      `SELECT id, title, slug, difficulty, category, created_at 
       FROM problems 
       ORDER BY created_at DESC`
    );

    res.json({ problems });
  } catch (error) {
    console.error('Get all problems error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;
