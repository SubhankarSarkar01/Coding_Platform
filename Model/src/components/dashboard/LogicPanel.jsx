import React from "react";
import { Clock, HardDrive, TestTube2, CheckCircle2, CircleDashed } from "lucide-react";
import { motion } from "framer-motion";

export default function LogicPanel({ active, frameIndex = 0 }) {
    const frame = active.frames ? active.frames[frameIndex] : null;

    return (
        <div className="flex flex-col h-full gap-4 overflow-y-auto p-4 custom-scrollbar bg-bg-surface/30">

            {/* Live Tracked Message */}
            {frame && (
                <motion.div
                    key={frameIndex}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 shadow-inner"
                >
                    <TestTube2 size={20} className="text-primary mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-bold text-primary text-sm mb-1">
                            Current Step Logic
                        </h4>
                        <p className="leading-relaxed font-mono text-sm font-medium text-text-main">
                            {frame.message}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Step-by-Step Breakdown */}
            <div className="flex flex-col gap-3 mt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Algorithm Steps</h4>
                {active.steps?.map((step, idx) => {
                    // A rough heuristic to highlight active step if precise mapping isn't available.
                    // For a true app, active.frames should contain the step id it relates to.
                    // Here we just mock highlight early steps.
                    const isActive = idx === Math.floor((frameIndex / active.frames.length) * active.steps.length);
                    const isPast = idx < Math.floor((frameIndex / active.frames.length) * active.steps.length);

                    return (
                        <div
                            key={idx}
                            className={`flex items-start gap-3 p-3 rounded-2xl transition-all duration-300 border ${isActive
                                ? "bg-bg-elevated border-primary/30 shadow-[0_4px_12px_rgba(59,130,246,0.1)]"
                                : "bg-bg-surface/30 border-white/5"
                                }`}
                        >
                            <div className={`mt-0.5 shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold leading-none ${isActive ? "bg-primary text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/5 text-slate-500"}`}>
                                {idx + 1}
                            </div>
                            <span className={`text-sm mt-0.5 ${isActive ? "text-text-main font-semibold" : "text-text-muted"}`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Complexities */}
            <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
                <div className="rounded-2xl border border-border-subtle bg-bg-surface p-3 transition-colors hover:border-amber-500/30">
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        <Clock size={12} className="text-amber-500" /> Time
                    </div>
                    <div className="font-mono text-sm font-bold text-text-main outline-none">O(log n)</div>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-bg-surface p-3 transition-colors hover:border-blue-500/30">
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        <HardDrive size={12} className="text-blue-500" /> Space
                    </div>
                    <div className="font-mono text-sm font-bold text-text-main">O(1)</div>
                </div>
            </div>

        </div>
    );
}
