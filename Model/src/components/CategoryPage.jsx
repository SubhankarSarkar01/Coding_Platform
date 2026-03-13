import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";

const DIFFICULTY_COLORS = {
    Easy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    Hard: "text-rose-500 bg-rose-500/10 border-rose-500/20",
};

export default function CategoryPage() {
    const { topic: categorySlug } = useParams();
    const navigate = useNavigate();
    const [filter, setFilter] = useState("All");
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    const titleMap = {
        arrays: "Array",
        searching: "Searching",
        sorting: "Sorting",
        graphs: "Graph",
        trees: "Tree"
    };

    const slugLower = (categorySlug || "searching").toLowerCase();
    const title = titleMap[slugLower] || slugLower.charAt(0).toUpperCase() + slugLower.slice(1);

    const descriptions = {
        arrays: "Learn array traversal, prefix sums, and sliding window techniques.",
        searching: "Master searching algorithms like Linear Search and Binary Search.",
        sorting: "Learn sorting algorithms like Bubble, Merge and Quick Sort.",
        graphs: "Explore graph algorithms like BFS, DFS and shortest paths.",
        trees: "Understand tree structures and traversal techniques."
    };

    const categoryDescription = descriptions[(categorySlug || "searching").toLowerCase()] || `Master foundational ${title.toLowerCase()} concepts through interactive visualizations.`;

    useEffect(() => {
        setLoading(true);
        const slug = (categorySlug || "searching").toLowerCase();
        fetch(`http://localhost:5000/api/problems?category=${slug}`)
            .then(res => res.json())
            .then(data => {
                setProblems(data.problems || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [categorySlug]);

    const handleProblemClick = (id) => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        } else {
            navigate(`/problem/${id}`);
        }
    };

    // Map DB problems to UI format
    const allProblems = problems.map((p) => {
        const hashStr = p.title.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
        return {
            id: p.slug,
            title: p.title,
            category: p.category,
            difficulty: p.difficulty || "Medium",
            isSolved: hashStr % 2 === 0, // Mock solved state until submissions are wired
            timeLimit: 1.5,
            memoryLimit: 256,
        };
    });

    const filteredProblems = filter === "All" ? allProblems : allProblems.filter(p => p.difficulty === filter);
    const solvedCount = allProblems.filter(p => p.isSolved).length;
    const progressPercent = allProblems.length > 0 ? Math.round((solvedCount / allProblems.length) * 100) : 0;

    return (
        <div className="min-h-[calc(100vh-4rem)] w-full overflow-y-auto bg-bg-base text-text-main py-8 sm:py-12 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />

            <div className="mx-auto max-w-[1200px] px-6 sm:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10">
                    {/* LEFT COLUMN */}
                    <div className="flex flex-col gap-6">
                        {/* Card 1: Title & Description */}
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-3xl font-bold md:text-4xl text-slate-800 dark:text-slate-100"
                            >
                                {title} Algorithms
                            </motion.h1>
                            <p className="mt-2 text-sm text-text-muted">
                                {categoryDescription}
                            </p>
                        </div>

                        {/* Card 2: Short descriptive text */}
                        <div
                            className="rounded-2xl p-5"
                            style={{ background: "#0f172a" }}
                        >
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Explore optimal problem-solving techniques and algorithmic strategies step-by-step.
                            </p>
                        </div>

                        {/* Card 3: Progress Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                background: "linear-gradient(135deg, #0f172a, #111827)",
                                borderRadius: "18px",
                                padding: "20px",
                                boxShadow: "0 0 20px rgba(0,0,0,0.4)",
                                border: "1px solid rgba(255,255,255,0.04)",
                            }}
                            className="flex w-full flex-col"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-semibold text-slate-300">Category Progress</span>
                                <span className="text-xl font-bold text-blue-400">
                                    {solvedCount}
                                    <span className="text-sm text-slate-500 font-medium">/{allProblems.length}</span>
                                </span>
                            </div>
                            {/* Animated Progress Bar */}
                            <div className="h-[6px] w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    style={{
                                        height: "100%",
                                        borderRadius: "9999px",
                                        background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                                    }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-slate-500 text-right">{progressPercent}% Completed</p>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="flex flex-col">
                        {/* Filters */}
                        <div className="mb-6 flex justify-end">
                            <div className="flex gap-2">
                                {["All", "Easy", "Medium", "Hard"].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setFilter(lvl)}
                                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${filter === lvl
                                            ? "bg-primary text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                            : "bg-[#0f172a] text-slate-400 hover:text-white border border-slate-800"
                                            }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Problem List */}
                        <div className="flex flex-col gap-4">
                            {filteredProblems.map((problem, i) => (
                                <motion.div
                                    key={problem.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => handleProblemClick(problem.id)}
                                    className="group flex cursor-pointer items-center justify-between rounded-xl bg-black/5 p-4 transition-all duration-200 ease-in-out hover:bg-black/10 dark:bg-[rgba(255,255,255,0.03)] dark:hover:bg-[rgba(59,130,246,0.08)]"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                                            {problem.isSolved ? (
                                                <CheckCircle2 size={24} className="text-emerald-500" />
                                            ) : (
                                                <Circle size={24} className="text-text-muted opacity-30 transition-opacity group-hover:opacity-60" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-primary dark:text-slate-200">
                                                {problem.title}
                                            </h3>
                                            <div className="mt-1 flex items-center gap-3 text-xs">
                                                <span className={`rounded-md border px-2 py-0.5 font-semibold ${DIFFICULTY_COLORS[problem.difficulty]}`}>
                                                    {problem.difficulty}
                                                </span>
                                                <span className="flex items-center gap-1 text-text-muted">
                                                    <Clock size={12} /> Limit {problem.timeLimit}s
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="hidden text-sm font-semibold text-primary opacity-0 transition-all group-hover:block group-hover:-translate-x-2 group-hover:opacity-100 sm:block">
                                            Solve Challenge
                                        </span>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-elevated text-text-muted transition-colors group-hover:bg-primary group-hover:text-white">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {filteredProblems.length === 0 && (
                                <div className="rounded-2xl p-12 text-center text-text-muted transition-opacity opacity-70">
                                    No problems available yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
