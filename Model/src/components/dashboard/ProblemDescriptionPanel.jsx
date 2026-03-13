import React, { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Clock, HardDrive, TestTube2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProblemDescriptionPanel({ active, frameIndex = 0 }) {
    const [isLogicExpanded, setIsLogicExpanded] = useState(false);
    const frame = active.frames ? active.frames[frameIndex] : null;

    return (
        <div className="flex h-full flex-col gap-4 overflow-y-auto p-4 scroll">
            {/* Title & Difficulty */}
            <div>
                <h2 className="text-2xl font-bold text-text-main mb-2">{active.title}</h2>
                <div className="flex items-center gap-3 text-xs mb-4">
                    <span className={`rounded-md border px-2 py-1 font-semibold ${
                        active.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        active.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    }`}>
                        {active.difficulty || 'Medium'}
                    </span>
                    <span className="text-text-muted font-medium">{active.category}</span>
                </div>
            </div>

            {/* Description Body */}
            <div className="text-sm leading-relaxed text-text-main">
                <p className="mb-4">{active.description || "Implement the algorithm to solve the problem efficiently."}</p>

                <h3 className="text-sm font-semibold text-text-main mt-6 mb-2">Example 1:</h3>
                <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3 text-sm font-mono space-y-1">
                    <div><span className="text-text-muted">Input:</span> <span className="text-emerald-500">[{active.input?.array?.join(", ")}]</span>, target = <span className="text-amber-500">{active.input?.target}</span></div>
                    <div><span className="text-text-muted">Output:</span> <span className="text-blue-500">{active.input?.expected}</span></div>
                </div>

                {active.constraints && (
                    <>
                        <h3 className="text-sm font-semibold text-text-main mt-6 mb-2 flex items-center gap-1.5">
                            <BookOpen size={16} className="text-primary" /> Constraints:
                        </h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-text-muted marker:text-border-subtle">
                            {active.constraints.map((c, i) => (
                                <li key={i}><code className="px-1.5 py-0.5 rounded-md bg-white/5 font-mono text-xs">{c}</code></li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

        </div>
    );
}
