import React, { useMemo } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

export default function LogicVisualizerPanel({
  active,
  frameIndex,
  isPlaying,
  onFrameIndexChange,
  onTogglePlay,
  onPrev,
  onNext,
}) {
  const frame = active.frames[frameIndex] ?? active.frames[0];
  const maxValue = useMemo(() => Math.max(...frame.array), [frame.array]);

  const handleBarClick = (idx) => {
    // Intentionally kept plain for clean video visualization
  };

  return (
    <div className="flex h-full flex-col">
      {/* Visualizer Canvas Area */}
      <div className="flex-1 min-h-[260px] p-4 flex flex-col items-center justify-end relative">

        {/* Array Bars */}
        <div className="w-full max-w-[780px] h-full min-h-[160px] max-h-[240px] rounded-2xl border border-white/5 bg-white/5 p-4 pb-8 flex items-end gap-1.5 relative shadow-inner">
          {frame.array.map((value, idx) => {
            const h = Math.max(10, (value / maxValue) * 100);
            const p = frame.pointers || {};
            const hl = frame.highlights || {};

            const outOfBounds =
              hl.leftBound !== undefined &&
              hl.rightBound !== undefined &&
              (idx < hl.leftBound || idx > hl.rightBound);

            let bgClass = "bg-gradient-to-t from-primary/80 to-blue-400";
            let opacityClass = outOfBounds ? "opacity-20" : "opacity-100";

            if (hl.found === idx) bgClass = "bg-gradient-to-t from-emerald-500 to-emerald-300 shadow-glow";
            else if (hl.mid === idx || hl.current === idx) bgClass = "bg-gradient-to-t from-amber-500 to-amber-300";

            const labels = [];
            if (p.L === idx) labels.push("L");
            if (p.R === idx) labels.push("R");
            if (p.M === idx) labels.push("M");
            if (p.i === idx) labels.push("i");

            return (
              <div
                className={`flex-1 min-w-[20px] relative h-full flex items-end justify-center transition-all`}
                key={`${value}-${idx}`}
              >
                <div className={`w-full rounded-t-md transition-all duration-300 ease-out ${bgClass} ${opacityClass}`} style={{ height: `${h}%` }}>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-text-main text-xs font-bold drop-shadow-md">
                    {value}
                  </span>
                </div>
                {labels.length > 0 && (
                  <div className="absolute -bottom-6 flex gap-1 text-[10px] font-bold text-amber-400 font-mono">
                    {labels.join(" ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-bg-elevated/80 border-t border-border-subtle p-3 shrink-0 backdrop-blur-md">
        <div className="text-center font-mono text-xs text-amber-400 mb-3 min-h-[16px]">
          {frame.message}
        </div>

        <div className="flex items-center gap-3 text-text-muted font-mono text-xs mb-3">
          <span>0</span>
          <input
            type="range"
            className="flex-1 accent-primary h-1.5 bg-border-subtle rounded-full appearance-none outline-none"
            min="0"
            max={active.frames.length - 1}
            value={frameIndex}
            onChange={(e) => onFrameIndexChange(Number(e.target.value))}
          />
          <span>{active.frames.length - 1}</span>
        </div>

        <div className="flex justify-center items-center gap-4">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface text-text-main hover:bg-border-subtle transition-colors disabled:opacity-50"
            onClick={onPrev}
          >
            <SkipBack size={14} />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-primary to-blue-600 border border-primary/50 text-white shadow-glow hover:scale-105 transition-all disabled:opacity-50 disabled:filter-grayscale"
            onClick={onTogglePlay}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface text-text-main hover:bg-border-subtle transition-colors disabled:opacity-50"
            onClick={onNext}
          >
            <SkipForward size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
