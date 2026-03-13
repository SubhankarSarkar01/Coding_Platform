import React, { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Send, Download, Upload } from "lucide-react";

export default function MonacoCodeEditor({
  code,
  language,
  onLanguageChange,
  onCodeChange,
  onRunCode,
}) {
  const editorRef = useRef(null);
  const [fontSize, setFontSize] = useState(14);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Define custom theme
    monaco.editor.defineTheme('algomaster-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#0A0F1C',
        'editor.foreground': '#E4E7EB',
        'editorLineNumber.foreground': '#4B5563',
        'editor.selectionBackground': '#3B82F620',
        'editor.lineHighlightBackground': '#1E293B20',
        'editorCursor.foreground': '#3B82F6',
        'editor.selectionHighlightBackground': '#3B82F610',
      }
    });
    monaco.editor.setTheme('algomaster-dark');
  };

  const downloadCode = () => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
    };
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solution.${extensions[language] || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadCode = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".js,.py,.java,.cpp,.c,.txt";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onCodeChange(event.target.result);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex h-full flex-col bg-[#0A0F1C]">
      {/* Editor Header Tools */}
      <div className="flex h-12 shrink-0 items-center justify-between px-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            className="rounded-md px-3 py-1.5 text-sm font-medium outline-none cursor-pointer transition-all hover:bg-slate-700"
            style={{
              background: "#0f172a",
              color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>

          {/* Font Size Controls */}
          <div className="flex items-center gap-1 text-xs text-slate-400 border-l border-white/5 pl-3">
            <button
              onClick={() => setFontSize(Math.max(10, fontSize - 2))}
              className="px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              title="Decrease font size"
            >
              A-
            </button>
            <span className="px-2 text-slate-500">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 2))}
              className="px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              title="Increase font size"
            >
              A+
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Upload/Download Buttons */}
          <button
            onClick={uploadCode}
            className="p-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
            title="Upload code file"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={downloadCode}
            className="p-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
            title="Download code"
          >
            <Download size={16} />
          </button>

          {/* Run Button */}
          <button
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 transition-all hover:scale-105 shadow-lg"
            onClick={onRunCode}
          >
            <Play size={14} className="fill-white" /> Run
          </button>

          {/* Submit Button */}
          <button
            className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <Send size={14} /> Submit
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={onCodeChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: fontSize,
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
            fontLigatures: true,
            minimap: { enabled: true, scale: 1 },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false
            },
            parameterHints: { enabled: true },
            folding: true,
            lineNumbers: "on",
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
        />
      </div>
    </div>
  );
}
