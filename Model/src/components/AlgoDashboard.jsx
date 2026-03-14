import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CodeEditorPanel from "./dashboard/CodeEditorPanel";
import LogicVisualizerPanel from "./dashboard/LogicVisualizerPanel";
import ProblemDescriptionPanel from "./dashboard/ProblemDescriptionPanel";
import LogicPanel from "./dashboard/LogicPanel";
import { ALGORITHMS, CATEGORIES, slugify } from "./dashboard/data";
import { ChevronDown, Terminal, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import "./dashboard/dashboard.css";

// Minimal panel wrapper without bold heavy borders or loud headers
function GridPanel({ title, children, className = "", noPadding = false }) {
  return (
    <article className={`flex flex-col bg-bg-surface rounded-xl flex-1 shadow-sm ${className}`} style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
      <header className="flex shrink-0 items-center gap-3 px-4 py-3">
        {/* Blue accent bar */}
        <div style={{ width: "4px", height: "18px", borderRadius: "4px", background: "linear-gradient(180deg, #3b82f6, #60a5fa)", flexShrink: 0 }} />
        <span className="text-[15px] font-semibold text-text-main">{title}</span>
      </header>
      <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${noPadding ? "" : "p-2"}`}>
        {children}
      </div>
    </article>
  );
}

export default function AlgoDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [logs, setLogs] = useState(["> System initialized. Ready to execute."]);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isDraggingTerminal, setIsDraggingTerminal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    fetch(`http://localhost:5000/api/question/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Fetched problem data:", data);
        const p = data.problem;
        if (!p) throw new Error("Problem not found");

        // Parse JSON fields safely
        const parsedProblem = {
          ...p,
          input: p.input_json ? JSON.parse(p.input_json) : { array: [], target: 0, expected: null },
          frames: p.frames_json ? JSON.parse(p.frames_json) : [{ array: [], pointers: {}, message: "No visualization data available." }],
          steps: p.algorithm_steps ? p.algorithm_steps.split('\n').filter(s => s.trim()) : [],
          constraints: p.constraints ? p.constraints.split('\n').filter(s => s.trim()) : [],
          code: p.starter_code || "// Let's get started!",
          category_slug: p.category // Map category to category_slug for compatibility
        };

        console.log("Parsed problem:", parsedProblem);
        setActive(parsedProblem);
        setCode(parsedProblem.code);
        setLogs([`> Loaded ${parsedProblem.title}`]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading problem:", err);
        setLogs([`> Error: ${err.message}`]);
        setLoading(false);
      });
  }, [id, navigate]);

  useEffect(() => {
    setFrameIndex(0);
    setIsPlaying(false);
    setIsTerminalOpen(false);
    setLanguage("javascript");
  }, [id]);

  const LANG_TEMPLATES = useMemo(() => {
    if (!active) return {};
    return {
      javascript: active.code,
      python: `# ${active.title} - Python\ndef solve(arr, target):\n    # Your solution here\n    pass\n`,
      java: `// ${active.title} - Java\npublic class Solution {\n    public int solve(int[] arr, int target) {\n        // Your solution here\n        return -1;\n    }\n}\n`,
      cpp: `// ${active.title} - C++\n#include <vector>\nusing namespace std;\nint solve(vector<int>& arr, int target) {\n    // Your solution here\n    return -1;\n}\n`,
      c: `/* ${active.title} - C */\nint solve(int arr[], int n, int target) {\n    /* Your solution here */\n    return -1;\n}\n`,
    };
  }, [active]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(LANG_TEMPLATES[lang] || (active ? active.code : ""));
  };

  useEffect(() => {
    if (!active) return;
    clearInterval(timerRef.current);
    if (!isPlaying) return undefined;

    timerRef.current = setInterval(() => {
      setFrameIndex((prev) => {
        if (prev >= active.frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200 / speed);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, active?.frames?.length, speed]);

  const getRunnerCode = (lang, userCode, funcName) => {
    if (lang === "python") {
      return `${userCode}

import json
import sys

if __name__ == '__main__':
    input_data = sys.stdin.read().strip()
    if input_data:
        try:
            data = json.loads(input_data)
            arr = data.get('array', [])
            target = data.get('target', None)
            
            # Determine function to call
            funcParams = (arr, target)
            if 'solve' in globals():
                result = solve(*funcParams)
            elif '${funcName}' in globals():
                result = globals()['${funcName}'](*funcParams)
            else:
                raise Exception("Neither solve() nor ${funcName}() is defined.")
                
            print(json.dumps(result).replace(' ', ''))
        except Exception as e:
            print(f"Execution Error: {str(e)}", file=sys.stderr)
`;
    }
    return userCode;
  };

  const saveSubmission = () => {
    setLogs(prev => [...prev, "> Recording your solution..."]);
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        problem_slug: active.slug,
        problem_title: active.title,
        category_slug: active.category_slug,
        status: "Solved",
        code: code,  // Save the actual code
        language: language  // Save the language used
      })
    }).then(res => res.json())
      .then(data => setLogs(prev => [...prev, `> ${data.message || "Progress saved!"}`]))
      .catch(e => setLogs(prev => [...prev, `> Error saving progress: ${e.message}`]));
  };

  const runCode = async () => {
    setIsTerminalOpen(true);
    setFrameIndex(0);
    setIsPlaying(false);
    setLogs([`> Executing ${active.title} [${language.toUpperCase()}]...`]);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/runner/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          language,
          problemSlug: active.slug,
        }),
      });

      const data = await response.json();

      if (data.status === 'error') {
        setLogs(prev => [...prev, `> Error: ${data.message}`]);
        setIsPlaying(false);
        return;
      }

      // Display test results
      setLogs(prev => [
        ...prev,
        `> Function detected: ${data.functionName}()`,
        `> Running ${data.totalTests} test cases...`,
        `> `,
      ]);

      // Show each test result
      data.results.forEach((result, idx) => {
        const status = result.passed ? '✓ PASS' : '✗ FAIL';
        
        setLogs(prev => [
          ...prev,
          `> Test ${result.testNumber}: ${status}`,
          `>   Input: ${JSON.stringify(result.input)}`,
          `>   Expected: ${JSON.stringify(result.expected)}`,
          `>   Your Output: ${JSON.stringify(result.actual)}`,
          `>   Runtime: ${result.runtime_ms}ms`,
          result.error ? `>   Error: ${result.error}` : '',
          `> `,
        ].filter(Boolean));
      });

      // Summary
      setLogs(prev => [
        ...prev,
        `> ═══════════════════════════════════════`,
        `> Test Results: ${data.passedTests}/${data.totalTests} Passed`,
        data.allPassed ? `> Status: ✓ ALL TESTS PASSED!` : `> Status: ✗ Some tests failed`,
        `> ═══════════════════════════════════════`,
      ]);

      // If all passed, save submission
      if (data.allPassed) {
        saveSubmission();
      }

    } catch (error) {
      setIsPlaying(false);
      setLogs(prev => [...prev, `> Runtime Error: ${error.message}`]);
    }
  };

  // Terminal Drag logic
  const containerRef = useRef(null);
  const onDragTerminal = useCallback((e) => {
    if (!isDraggingTerminal) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newHeight = rect.bottom - e.clientY;
    const maxHeight = rect.height * 0.6;
    if (newHeight >= 120 && newHeight <= maxHeight) {
      setTerminalHeight(newHeight);
    }
  }, [isDraggingTerminal]);

  useEffect(() => {
    if (isDraggingTerminal) {
      window.addEventListener("mousemove", onDragTerminal);
      window.addEventListener("mouseup", () => setIsDraggingTerminal(false));
    } else {
      window.removeEventListener("mousemove", onDragTerminal);
    }
    return () => window.removeEventListener("mousemove", onDragTerminal);
  }, [isDraggingTerminal, onDragTerminal]);

  const dropdownRef = useRef(null);

  if (loading || !active) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-bg-base text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="font-semibold">Loading Algorithm Details...</p>
        </div>
      </div>
    );
  }

  // Handle siblings/category logic if available, otherwise just use empty list
  const activeCategory = { name: active.category_slug, items: [] };
  const siblings = [];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex flex-col bg-bg-base text-text-main transition-colors duration-300 relative overflow-y-auto custom-scrollbar">

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 px-4 pt-6 pb-4 overflow-hidden min-h-0">

        {/* Left Sidebar: Problem Description */}
        <GridPanel title="Problem Statement" className="lg:col-span-3 border-transparent shadow-none bg-transparent">
          <ProblemDescriptionPanel active={active} frameIndex={frameIndex} />
        </GridPanel>

        {/* Center Column: Video Visualization (Top) & Clean Logic (Bottom) */}
        <GridPanel title="Visualization" className="lg:col-span-5 border-transparent bg-transparent shadow-none" noPadding>
          <div className="flex flex-col h-full gap-4">

            {/* Visualization - Responsive, not clipped */}
            <div className="bg-[#0A0F1C] rounded-xl shadow-sm flex-none" style={{ minHeight: "280px", height: "auto", border: "1px solid rgba(255,255,255,0.04)" }}>
              <LogicVisualizerPanel
                active={active}
                frameIndex={frameIndex}
                isPlaying={isPlaying}
                onFrameIndexChange={(nextIndex) => {
                  setFrameIndex(nextIndex);
                  setIsPlaying(false);
                }}
                onTogglePlay={() => setIsPlaying((prev) => !prev)}
                onPrev={() => { setIsPlaying(false); setFrameIndex((prev) => Math.max(0, prev - 1)); }}
                onNext={() => { setIsPlaying(false); setFrameIndex((prev) => Math.min(active.frames.length - 1, prev + 1)); }}
              />
            </div>

            {/* Clean Text-Based Logic section */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width: "4px", height: "18px", borderRadius: "4px", background: "linear-gradient(180deg, #3b82f6, #60a5fa)", flexShrink: 0 }} />
                <h4 className="text-[15px] font-semibold text-text-main">Execution Logic</h4>
              </div>
              <div className="flex flex-col gap-2">
                {active.steps?.map((step, idx) => {
                  const isActive = idx === Math.floor((frameIndex / active.frames.length) * active.steps.length);
                  return (
                    <div key={idx} className={`text-sm ${isActive ? "text-primary font-medium" : "text-text-muted"}`}>
                      Step {idx + 1} – {step}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-6 mt-6 pt-4 text-xs">
                <div><strong className="text-text-main">Time Complexity:</strong> <span className="text-text-muted font-mono ml-1">O(log n)</span></div>
                <div><strong className="text-text-main">Space Complexity:</strong> <span className="text-text-muted font-mono ml-1">O(1)</span></div>
              </div>
            </div>

          </div>
        </GridPanel>

        {/* Right Sidebar: Editor */}
        <GridPanel title="Code Editor" className="lg:col-span-4" noPadding>
          <div className="flex-1 flex flex-col w-full h-full relative overflow-hidden" ref={containerRef}>
            <CodeEditorPanel
              code={code}
              language={language}
              onLanguageChange={handleLanguageChange}
              onCodeChange={setCode}
              onRunCode={runCode}
            />

            {/* Local Slide-Up Terminal (Instead of Global) */}
            <div
              className="absolute bottom-0 left-0 w-full flex flex-col z-50"
              style={{
                height: isTerminalOpen ? terminalHeight : 200, // keep consistent base height when close
                background: "#020617",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "0 0 16px 16px",
                transform: isTerminalOpen ? "translateY(0%)" : "translateY(100%)",
                transition: "transform 0.35s ease"
              }}
            >
              {/* Resize Handle Drag */}
              <div
                className="w-full cursor-ns-resize absolute top-0 z-10"
                style={{ height: "6px", background: "rgba(255,255,255,0.08)" }}
                onMouseDown={() => setIsDraggingTerminal(true)}
              />

              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-white/5 shrink-0 border-b border-white/5 mt-[6px]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider">
                  <Terminal size={14} className="text-slate-300" />
                  CONSOLE OUTPUT
                </div>
                <button
                  onClick={() => setIsTerminalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar font-mono text-sm leading-relaxed tracking-wide text-slate-300 selection:bg-slate-700">
                {logs.map((line, i) => {
                  let textColor = "text-slate-300";
                  if (line.includes("Executing") || line.includes("Initializing")) textColor = "text-primary";
                  if (line.includes("PASS")) textColor = "text-emerald-400 font-bold";
                  if (line.includes("FAIL") || line.includes("Error") || line.includes("throw")) textColor = "text-rose-400 font-bold";

                  return (
                    <div className={`mb-1.5 ${textColor}`} key={`log-${i}`}>
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </GridPanel>
      </div>

    </div>
  );
}
