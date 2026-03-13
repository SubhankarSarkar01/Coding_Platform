import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Play, Send, CheckCircle, XCircle, Clock, AlertCircle, Loader } from "lucide-react";
import { motion } from "framer-motion";

export default function LeetCodeProblem() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetchProblem();
  }, [slug]);

  const fetchProblem = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/leetcode/problems/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      setProblem(data.problem);
      setTestCases(data.testCases);
      setCode(getStarterCode(language));
    } catch (error) {
      console.error('Error fetching problem:', error);
    }
  };

  const getStarterCode = (lang) => {
    const templates = {
      javascript: `function solution(input) {\n  // Your code here\n  return result;\n}\n\n// Read input\nconst input = require('fs').readFileSync(0, 'utf-8').trim();\nconsole.log(solution(input));`,
      python: `def solution(input_data):\n    # Your code here\n    return result\n\nif __name__ == "__main__":\n    import sys\n    input_data = sys.stdin.read().strip()\n    print(solution(input_data))`,
      java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n    }\n}`,
      c: `#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
    };
    return templates[lang] || templates.javascript;
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(getStarterCode(newLang));
    setTestResults([]);
    setCanSubmit(false);
  };

  const runCode = async () => {
    if (!problem) return;
    
    setIsRunning(true);
    setTestResults([]);
    setCanSubmit(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/leetcode/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          language,
          problemId: problem.id,
        }),
      });

      const data = await response.json();
      setTestResults(data.results);
      setCanSubmit(data.canSubmit);
      setActiveTab('testcases');
    } catch (error) {
      console.error('Error running code:', error);
      alert('Error running code: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!canSubmit) {
      alert('Please run all test cases successfully before submitting!');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/leetcode/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          language,
          problemId: problem.id,
          testResults,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Submission Accepted!\n\nRuntime: ${data.runtime_ms}ms\nTest Cases: ${data.testCasesPassed}/${data.testCasesTotal}`);
      } else {
        alert('Submission failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      alert('Error submitting code: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-base">
        <Loader className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg-base text-text-main">
      {/* Header */}
      <div className="h-14 border-b border-border-subtle flex items-center justify-between px-6 bg-bg-surface">
        <h1 className="text-xl font-bold">{problem.title}</h1>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-500' :
            problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
            'bg-red-500/20 text-red-500'
          }`}>
            {problem.difficulty}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-border-subtle overflow-y-auto p-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-border-subtle">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-2 px-1 font-medium transition-colors ${
                activeTab === 'description'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('testcases')}
              className={`pb-2 px-1 font-medium transition-colors ${
                activeTab === 'testcases'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Test Cases {testResults.length > 0 && `(${testResults.filter(r => r.passed).length}/${testResults.length})`}
            </button>
          </div>

          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Problem Description</h3>
                <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{problem.description}</p>
              </div>

              {problem.input_format && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Input Format</h3>
                  <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{problem.input_format}</p>
                </div>
              )}

              {problem.output_format && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Output Format</h3>
                  <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{problem.output_format}</p>
                </div>
              )}

              {problem.constraints && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Constraints</h3>
                  <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{problem.constraints}</p>
                </div>
              )}

              {problem.examples && problem.examples.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Examples</h3>
                  {problem.examples.map((example, idx) => (
                    <div key={idx} className="mb-4 p-4 bg-bg-elevated rounded-lg">
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-text-muted">Input:</span>
                        <pre className="mt-1 text-sm text-text-main">{example.input}</pre>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-text-muted">Output:</span>
                        <pre className="mt-1 text-sm text-text-main">{example.output}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Test Cases Tab */}
          {activeTab === 'testcases' && (
            <div className="space-y-4">
              {testResults.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Run your code to see test results</p>
                </div>
              ) : (
                testResults.map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 rounded-lg border ${
                      result.passed
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {result.passed ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <XCircle size={20} className="text-red-500" />
                        )}
                        <span className="font-semibold">
                          Test Case {idx + 1} ({result.label})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Clock size={14} />
                        <span>{result.runtime_ms}ms</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-text-muted">Input:</span>
                        <pre className="mt-1 p-2 bg-bg-base rounded text-xs overflow-x-auto">{result.input}</pre>
                      </div>
                      <div>
                        <span className="text-text-muted">Expected:</span>
                        <pre className="mt-1 p-2 bg-bg-base rounded text-xs overflow-x-auto">{result.expectedOutput}</pre>
                      </div>
                      <div>
                        <span className="text-text-muted">Actual:</span>
                        <pre className={`mt-1 p-2 bg-bg-base rounded text-xs overflow-x-auto ${
                          result.passed ? 'text-green-500' : 'text-red-500'
                        }`}>{result.actualOutput || 'No output'}</pre>
                      </div>
                      {result.error && (
                        <div>
                          <span className="text-red-500">Error:</span>
                          <pre className="mt-1 p-2 bg-bg-base rounded text-xs overflow-x-auto text-red-500">{result.error}</pre>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Editor Toolbar */}
          <div className="h-14 border-b border-border-subtle flex items-center justify-between px-4 bg-bg-surface">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-bg-elevated text-text-main border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Run Code
                  </>
                )}
              </button>

              <button
                onClick={submitCode}
                disabled={!canSubmit || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={setCode}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
