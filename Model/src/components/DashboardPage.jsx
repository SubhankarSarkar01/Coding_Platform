import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Flame, Trophy, Zap, Code, LayoutGrid } from "lucide-react";
import useLeaderboard from "../hooks/useLeaderboard";

const API = "http://localhost:5000/api";

export default function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ xp: 0, problems_solved: 0, streak_days: 0, global_rank: "—" });
    const [weeklyActivity, setWeeklyActivity] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [categories, setCategories] = useState([
        { name: "Searching", color: "bg-primary", val: 0 },
        { name: "Sorting", color: "bg-emerald-500", val: 0 },
        { name: "Trees", color: "bg-amber-500", val: 0 },
        { name: "Graphs", color: "bg-secondary", val: 0 },
    ]);
    const { rankedUsers } = useLeaderboard();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (!storedUser || !token) {
            navigate("/login");
            return;
        }
        setUser(JSON.parse(storedUser));

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch stats
        fetch(`${API}/stats`, { headers })
            .then(r => r.json())
            .then(data => {
                if (data.stats) setStats(prev => ({ ...prev, ...data.stats }));
            })
            .catch(console.error);

        // Fetch profile (for rank and more)
        fetch(`${API}/profile`, { headers })
            .then(r => r.json())
            .then(data => {
                if (data.global_rank) setStats(prev => ({ ...prev, global_rank: data.global_rank }));
            })
            .catch(console.error);

        // Fetch weekly activity
        fetch(`${API}/stats/weekly`, { headers })
            .then(r => r.json())
            .then(data => {
                if (data.weekly) {
                    const activity = new Array(7).fill(0);
                    const today = new Date();
                    data.weekly.forEach(row => {
                        const d = new Date(row.date);
                        const dayDiff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
                        if (dayDiff >= 0 && dayDiff < 7) {
                            activity[6 - dayDiff] = row.count;
                        }
                    });
                    setWeeklyActivity(activity);
                }
            })
            .catch(console.error);

        // Fetch category progress
        fetch(`${API}/stats/categories`, { headers })
            .then(r => r.json())
            .then(data => {
                if (data.categories) {
                    const colorMap = { searching: "bg-primary", sorting: "bg-emerald-500", trees: "bg-amber-500", graphs: "bg-secondary" };
                    const nameMap = { searching: "Searching", sorting: "Sorting", trees: "Trees", graphs: "Graphs" };
                    setCategories(data.categories.map(c => ({
                        name: nameMap[c.category_slug] || c.category_slug,
                        color: colorMap[c.category_slug] || "bg-primary",
                        val: Math.min(Math.round((c.solved_count / 10) * 100), 100) // Assuming 10 problems per cat for mock progress
                    })));
                }
            })
            .catch(console.error);
    }, [navigate]);

    if (!user) return null;

    const maxActivity = Math.max(...weeklyActivity, 1);

    return (
        <div className="min-h-[calc(100vh-4rem)] overflow-y-auto bg-bg-base px-4 py-8 custom-scrollbar">
            <div className="mx-auto max-w-6xl space-y-4">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
                    <div>
                        <h1 className="text-3xl font-extrabold text-text-main">Welcome back, {user.name.split(' ')[0]}!</h1>
                        <p className="text-text-muted mt-1">Here is a summary of your algorithm mastery journey.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total XP</span>
                            <span className="text-2xl font-black text-amber-400 drop-shadow-md flex items-center gap-1">
                                <Zap size={20} className="fill-amber-400" /> {stats.xp.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Top Stat Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-bg-surface p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-text-muted uppercase mb-1">Total Solved</p>
                            <p className="text-3xl font-black text-text-main">{stats.problems_solved}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Code size={24} />
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5 shadow-glass flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-text-muted uppercase mb-1">Daily Streak</p>
                            <p className="text-3xl font-black text-text-main">{stats.streak_days} <span className="text-lg text-text-muted font-medium">days</span></p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                            <Flame size={24} className="fill-rose-500" />
                        </div>
                    </div>
                    <div className="rounded-2xl bg-bg-surface p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-text-muted uppercase mb-1">Global Rank</p>
                            <p className="text-3xl font-black text-text-main">#{stats.global_rank?.toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Trophy size={24} className="fill-amber-500" />
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Weekly Activity Graph */}
                        <div className="rounded-2xl bg-bg-surface p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-text-main text-lg flex items-center gap-2">
                                    <Activity size={18} className="text-primary" /> Weekly Performance
                                </h3>
                            </div>

                            <div className="h-48 flex items-end justify-between gap-2 px-2">
                                {weeklyActivity.map((val, idx) => {
                                    const heightPercent = (val / maxActivity) * 100;
                                    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div className="w-full relative flex items-end justify-center h-full rounded-t-md overflow-hidden bg-bg-elevated/50">
                                                <div
                                                    className="w-full bg-gradient-to-t from-primary to-blue-400 rounded-t-md transition-all duration-500 group-hover:brightness-125 group-hover:shadow-glow"
                                                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                                />
                                                <span className="absolute -top-6 text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity font-bold">{val}</span>
                                            </div>
                                            <span className="text-xs text-text-muted font-medium">{days[idx]}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Category Progress */}
                        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-transparent">
                            <h3 className="font-bold text-slate-100 text-lg mb-6 flex items-center gap-2">
                                <LayoutGrid size={18} className="text-secondary" /> Category Progress
                            </h3>
                            <div className="space-y-5">
                                {categories.map((cat, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1.5 font-semibold">
                                            <span className="text-slate-200">{cat.name}</span>
                                            <span className="text-slate-400">{cat.val}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden">
                                            <div className={`h-full ${cat.color} rounded-full transition-all duration-1000`} style={{ width: `${cat.val}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Leaderboard Preview) */}
                    <div className="lg:col-span-1">
                        <div className="h-full rounded-2xl bg-bg-surface p-5 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-text-main text-lg flex items-center gap-2">
                                    <Trophy size={18} className="text-amber-500" /> Top Coders
                                </h3>
                                <button className="text-xs text-primary font-bold hover:underline" onClick={() => navigate('/leaderboard')}>View All</button>
                            </div>

                            <div className="flex flex-col gap-1 flex-1">
                                {rankedUsers.slice(0, 8).map((coder, idx) => (
                                    <div key={coder.username} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${idx === 0 ? "bg-amber-500/10 border border-amber-500/20" : "hover:bg-bg-elevated"}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-black w-4 text-center ${idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-700" : "text-text-muted"}`}>
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-text-main">{coder.username}</p>
                                                <p className="text-xs text-text-muted font-medium">{coder.score.toLocaleString()} pts</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
