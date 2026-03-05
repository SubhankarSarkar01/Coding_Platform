import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Award, LogOut, Settings, Star, User } from "lucide-react";

const API = "http://localhost:5000/api";

export default function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [globalRank, setGlobalRank] = useState("—");
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (!storedUser || !token) {
            navigate("/login");
            return;
        }

        // Fetch full profile from API
        fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                    setStats(data.stats);
                    setGlobalRank(data.global_rank);
                    setRecentActivity(data.recent_submissions || []);
                    // Sync localStorage with latest name
                    localStorage.setItem("user", JSON.stringify(data.user));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
    };

    if (loading) return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950">
            <div className="text-slate-400">Loading profile...</div>
        </div>
    );

    if (!user) return null;

    const formatDate = (ts) => {
        if (!ts) return "";
        const d = new Date(ts);
        const diff = Date.now() - d.getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return "just now";
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? "s" : ""} ago`;
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] overflow-y-auto bg-slate-950 px-4 py-8">
            <div className="mx-auto max-w-5xl">
                <h1 className="mb-8 text-3xl font-bold text-slate-100">My Profile</h1>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Left Column: User Card */}
                    <div className="col-span-1 space-y-6">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-md">
                            <div className="flex flex-col items-center">
                                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-500/20 text-4xl font-bold text-blue-500 ring-4 ring-slate-800">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-xl font-bold text-slate-100">{user.name}</h2>
                                <p className="mb-1 text-sm text-slate-400">{user.email}</p>
                                <p className="mb-6 text-xs text-slate-500">Member since {new Date(user.created_at).toLocaleDateString()}</p>

                                <div className="w-full space-y-3 border-t border-slate-800 pt-6">
                                    <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
                                        <User size={16} /> Edit Profile
                                    </button>
                                    <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
                                        <Settings size={16} /> Account Settings
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                                    >
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-md">
                            <h3 className="mb-4 font-semibold text-slate-200">Community Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-slate-400"><Award size={14} className="text-yellow-500" /> Global Rank</span>
                                    <span className="font-semibold text-slate-200">#{globalRank?.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-slate-400"><Star size={14} className="text-blue-500" /> Total XP</span>
                                    <span className="font-semibold text-slate-200">{stats?.xp?.toLocaleString() || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Progress */}
                    <div className="col-span-1 space-y-6 md:col-span-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
                                <p className="mb-1 text-sm text-slate-400">Algorithms Solved</p>
                                <div className="text-3xl font-bold text-slate-100">{stats?.problems_solved || 0}<span className="text-lg text-slate-500">/50</span></div>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
                                <p className="mb-1 text-sm text-slate-400">Current Streak</p>
                                <div className="text-3xl font-bold text-slate-100">{stats?.streak_days || 0}<span className="text-lg text-orange-400"> 🔥</span></div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-md">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-200">Recent Activity</h3>
                                <Activity size={16} className="text-slate-400" />
                            </div>

                            <div className="space-y-6">
                                {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-slate-800/50 pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <div className="font-medium text-slate-200">{item.problem_title}</div>
                                            <div className="text-xs text-slate-500">{item.category_slug} · {formatDate(item.submitted_at)}</div>
                                        </div>
                                        <div className={`rounded-full px-3 py-1 text-xs font-medium ${item.status === 'Solved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                            {item.status}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-500 text-center py-4">No activity yet. Start solving problems!</p>
                                )}
                            </div>

                            <button
                                onClick={() => navigate("/explore")}
                                className="mt-6 w-full rounded-xl bg-blue-600/10 py-3 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-600/20"
                            >
                                Continue Learning
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
