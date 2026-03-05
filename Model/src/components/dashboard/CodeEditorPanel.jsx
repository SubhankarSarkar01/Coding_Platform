import React, { useRef } from "react";
import { Play, Send } from "lucide-react";

export default function CodeEditorPanel({
  code,
  language,
  onLanguageChange,
  onCodeChange,
  onRunCode,
}) {
  const linesRef = useRef(null);

  const syncLineScroll = (event) => {
    if (linesRef.current) {
      linesRef.current.scrollTop = event.target.scrollTop;
    }
  };

  return (
    <div className="flex h-full flex-col bg-bg-surface">
      {/* Editor Header Tools */}
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <select
            className="rounded-md px-2 py-1 text-sm font-medium outline-none cursor-pointer transition-colors"
            style={{
              background: "#0f172a",
              color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "4px 10px",
            }}
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
          >
            <option value="javascript" style={{ background: "#0f172a" }}>JavaScript</option>
            <option value="python" style={{ background: "#0f172a" }}>Python</option>
            <option value="java" style={{ background: "#0f172a" }}>Java</option>
            <option value="cpp" style={{ background: "#0f172a" }}>C++</option>
            <option value="c" style={{ background: "#0f172a" }}>C</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-text-main hover:bg-white/5 transition-colors"
            onClick={onRunCode}
          >
            <Play size={14} className="text-primary fill-primary" /> Run
          </button>
          <button
            className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <Send size={14} /> Submit
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex w-12 shrink-0 flex-col items-end overflow-hidden border-r border-border-subtle/30 bg-bg-elevated/10 py-4 pr-3 font-mono text-sm text-text-muted/50 select-none custom-scrollbar" ref={linesRef}>
          {code.split("\n").map((_, i) => (
            <div key={`ln-${i}`} className="leading-relaxed">{i + 1}</div>
          ))}
        </div>
        <textarea
          className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-text-main outline-none custom-scrollbar"
          spellCheck={false}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          onScroll={syncLineScroll}
        />
      </div>
    </div>
  );
}
