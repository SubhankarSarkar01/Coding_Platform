const pool = require('../config/db');
const problemParser = require('../services/problemParserService');
const codeExecution = require('../services/codeExecutionService');

/**
 * Upload and parse problem file
 */
exports.uploadProblem = async (req, res) => {
  try {
    const { problemText } = req.body;

    if (!problemText) {
      return res.status(400).json({ message: 'Problem text is required' });
    }

    // Parse problem
    const parsed = problemParser.parseProblem(problemText);
    const slug = problemParser.createSlug(parsed.title);

    // Insert problem into database
    const [result] = await pool.query(
      `INSERT INTO problems (title, slug, description, input_format, output_format, constraints, difficulty, examples)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parsed.title,
        slug,
        parsed.description,
        parsed.inputFormat,
        parsed.outputFormat,
        parsed.constraints,
        parsed.difficulty,
        JSON.stringify(parsed.examples),
      ]
    );

    const problemId = result.insertId;

    // Generate and insert test cases
    const testCases = problemParser.generateTestCases(parsed);
    for (const testCase of testCases) {
      await pool.query(
        `INSERT INTO test_cases (problem_id, input, expected_output, label)
         VALUES (?, ?, ?, ?)`,
        [problemId, testCase.input, testCase.expected_output, testCase.label]
      );
    }

    res.json({
      message: 'Problem uploaded successfully',
      problemId,
      slug,
      parsed,
      testCases,
    });
  } catch (error) {
    console.error('Upload problem error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get problem by slug
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
    problem.examples = JSON.parse(problem.examples || '[]');

    // Get visible test cases (not hidden)
    const [testCases] = await pool.query(
      'SELECT id, input, expected_output, label FROM test_cases WHERE problem_id = ? AND is_hidden = 0',
      [problem.id]
    );

    res.json({ problem, testCases });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Run code against test cases
 */
exports.runCode = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;

    if (!code || !language || !problemId) {
      return res.status(400).json({ message: 'Code, language, and problemId are required' });
    }

    // Get all test cases for the problem
    const [testCases] = await pool.query(
      'SELECT id, input, expected_output, label FROM test_cases WHERE problem_id = ?',
      [problemId]
    );

    if (testCases.length === 0) {
      return res.status(404).json({ message: 'No test cases found for this problem' });
    }

    // Execute code against all test cases
    const results = [];
    let passed = 0;
    let totalRuntime = 0;

    for (const testCase of testCases) {
      const result = await codeExecution.executeTestCase(
        code,
        language,
        testCase.input,
        testCase.expected_output
      );

      results.push({
        testCaseId: testCase.id,
        label: testCase.label,
        input: testCase.input,
        expectedOutput: result.expectedOutput,
        actualOutput: result.actualOutput,
        passed: result.passed,
        runtime_ms: result.runtime_ms,
        error: result.error,
        status: result.status,
      });

      if (result.passed) passed++;
      totalRuntime += result.runtime_ms;
    }

    const allPassed = passed === testCases.length;

    res.json({
      allPassed,
      passed,
      total: testCases.length,
      totalRuntime,
      results,
      canSubmit: allPassed,
    });
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Submit code (only if all tests pass)
 */
exports.submitCode = async (req, res) => {
  try {
    const { code, language, problemId, testResults } = req.body;
    const userId = req.user.id;

    if (!code || !language || !problemId) {
      return res.status(400).json({ message: 'Code, language, and problemId are required' });
    }

    // Verify all tests passed
    const allPassed = testResults && testResults.every(r => r.passed);
    if (!allPassed) {
      return res.status(400).json({ message: 'Cannot submit: Not all test cases passed' });
    }

    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;
    const totalRuntime = testResults.reduce((sum, r) => sum + (r.runtime_ms || 0), 0);
    const avgRuntime = Math.round(totalRuntime / total);

    // Insert submission
    const [result] = await pool.query(
      `INSERT INTO code_submissions 
       (user_id, problem_id, language, code, status, runtime_ms, test_cases_passed, test_cases_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, problemId, language, code, 'accepted', avgRuntime, passed, total]
    );

    const submissionId = result.insertId;

    // Store individual test results
    for (const testResult of testResults) {
      await pool.query(
        `INSERT INTO test_results 
         (submission_id, test_case_id, passed, actual_output, runtime_ms, error_message)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          submissionId,
          testResult.testCaseId,
          testResult.passed ? 1 : 0,
          testResult.actualOutput,
          testResult.runtime_ms,
          testResult.error,
        ]
      );
    }

    res.json({
      message: 'Submission accepted!',
      submissionId,
      status: 'accepted',
      runtime_ms: avgRuntime,
      testCasesPassed: passed,
      testCasesTotal: total,
      submittedAt: new Date(),
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
      `SELECT id, language, status, runtime_ms, test_cases_passed, test_cases_total, submitted_at
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
 * Get all problems
 */
exports.getAllProblems = async (req, res) => {
  try {
    const [problems] = await pool.query(
      'SELECT id, title, slug, difficulty, category FROM problems ORDER BY id DESC'
    );

    res.json({ problems });
  } catch (error) {
    console.error('Get all problems error:', error);
    res.status(500).json({ message: error.message });
  }
};
