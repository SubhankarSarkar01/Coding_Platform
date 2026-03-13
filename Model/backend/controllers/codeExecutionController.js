const executionService = require('../services/codeExecutionService');

// Execute code
exports.executeCode = async (req, res) => {
  try {
    const { code, language, stdin } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }

    const result = await executionService.executeCode(code, language, stdin);
    res.json(result);
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Run test cases
exports.runTests = async (req, res) => {
  try {
    const { code, language, testCases } = req.body;

    if (!code || !language || !testCases) {
      return res.status(400).json({ message: 'Code, language, and test cases are required' });
    }

    const results = await executionService.runTestCases(code, language, testCases);
    res.json(results);
  } catch (error) {
    console.error('Test execution error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get supported languages
exports.getSupportedLanguages = (req, res) => {
  const languages = Object.keys(executionService.LANGUAGE_IDS).map(lang => ({
    name: lang,
    id: executionService.LANGUAGE_IDS[lang],
  }));
  res.json({ languages });
};
