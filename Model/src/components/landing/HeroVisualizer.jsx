import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function HeroVisualizer() {
    return (
        <div className="relative mt-12 flex h-[320px] w-full max-w-md items-center justify-center overflow-hidden rounded-3xl border border-white/5 bg-[#0a0514] p-6 shadow-[0_0_50px_rgba(139,92,246,0.15)] sm:mt-0">
            {/* Core Deep Space Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-purple-900/10 to-[#0a0514] z-0" />
            <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/30 blur-[60px] z-0" />

            {/* Abstract Floating Orb 1 */}
            <motion.div
                className="absolute top-[20%] left-[20%] h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-500/10 blur-xl z-10"
                animate={{
                    y: [0, -20, 0],
                    x: [0, 15, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Abstract Floating Orb 2 */}
            <motion.div
                className="absolute bottom-[20%] right-[15%] h-32 w-32 rounded-full bg-gradient-to-tl from-fuchsia-500/30 to-violet-500/10 blur-xl z-10"
                animate={{
                    y: [0, 25, 0],
                    x: [0, -15, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            />

            {/* Floating Geometric Shape - Glassmorphism Ring */}
            <motion.div
                className="absolute h-40 w-40 rounded-full border border-white/10 z-20"
                style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 70%)"
                }}
                animate={{
                    rotateZ: [0, 360],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    rotateZ: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
            />

            {/* Floating Diamond Shape */}
            <motion.div
                className="absolute h-16 w-16 rotate-45 rounded-2xl border border-violet-400/20 bg-violet-500/5 backdrop-blur-md z-30 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                animate={{
                    y: [0, -15, 0],
                    rotateZ: [45, 90, 45],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
}
