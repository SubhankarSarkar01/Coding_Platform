import React, { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, BookOpen, Tag, Users, LogOut, Menu, X, ChevronRight, Plus, Pencil, Trash2, Eye, EyeOff, Shield, ShieldOff, Search, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

const API = "http://localhost:5000/api/admin";

// ──────────────── Utilities ────────────────
function getToken() { return localStorage.getItem("adminToken") || localStorage.getItem("token"); }
function authHeaders() { return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }; }

async function apiFetch(url, opts = {}) {
    const res = await fetch(url, { headers: authHeaders(), ...opts });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API error");
    return data;
}

// ──────────────── Toast ────────────────
function Toast({ msg, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
            {type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {msg}
            <button onClick={onClose}><X size={16} /></button>
        </div>
    );
}

// ──────────────── Sidebar ────────────────
const NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "problems", label: "Problems", icon: BookOpen },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "users", label: "Users", icon: Users },
];

function Sidebar({ active, onNav, onLogout, collapsed, onToggle }) {
    return (
        <aside className={`h-screen flex flex-col bg-slate-900 border-r border-slate-700/50 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
            <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700/50">
                {!collapsed && <span className="text-lg font-black text-white tracking-tight">⚡ AlgoAdmin</span>}
                <button onClick={onToggle} className="text-slate-400 hover:text-white transition-colors ml-auto">
                    {collapsed ? <Menu size={20} /> : <X size={20} />}
                </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
                {NAV.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => onNav(id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active === id ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                    >
                        <Icon size={18} className="flex-shrink-0" />
                        {!collapsed && <span>{label}</span>}
                    </button>
                ))}
            </nav>
            <div className="p-3 border-t border-slate-700/50">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={18} className="flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}

// ──────────────── Dashboard ────────────────
function DashboardPage({ toast }) {
    const [stats, setStats] = useState(null);
    useEffect(() => {
        apiFetch(`${API}/stats`).then(setStats).catch(e => toast(e.message, "error"));
    }, []);

    const cards = stats ? [
        { label: "Total Users", value: stats.users, color: "from-blue-500 to-blue-700", icon: Users },
        { label: "Problems", value: stats.problems, color: "from-violet-500 to-violet-700", icon: BookOpen },
        { label: "Categories", value: stats.categories, color: "from-emerald-500 to-emerald-700", icon: Tag },
        { label: "Submissions", value: stats.submissions, color: "from-amber-500 to-amber-700", icon: LayoutDashboard },
    ] : [];

    return (
        <div>
            <h1 className="text-2xl font-black text-white mb-6">Dashboard Overview</h1>
            {!stats ? (
                <div className="flex items-center gap-2 text-slate-400"><RefreshCw size={16} className="animate-spin" /> Loading stats...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {cards.map(({ label, value, color, icon: Icon }) => (
                        <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-6 shadow-lg`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                                    <p className="text-4xl font-black text-white">{value}</p>
                                </div>
                                <Icon size={36} className="text-white/30" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ──────────────── Problem Form Modal ────────────────
function ProblemForm({ categories, initial, onSave, onClose }) {
    const [form, setForm] = useState({
        slug: "", title: "", category_slug: "", difficulty: "Medium",
        description: "", constraints_text: "", steps_text: "",
        starter_code: "", solution_code: "", youtube_link: "",
        input_json: "", frames_json: "",
        ...(initial || {})
    });
    const [saving, setSaving] = useState(false);

    const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        try { await onSave(form); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
                    <h2 className="text-lg font-bold text-white">{initial?.id ? "Edit Problem" : "Add New Problem"}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1 font-semibold">Title *</label>
                            <input required value={form.title} onChange={e => { set('title')(e); if (!initial?.id) setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })); }} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none" placeholder="e.g. Binary Search" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1 font-semibold">Slug *</label>
                            <input required value={form.slug} onChange={set('slug')} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none font-mono" placeholder="e.g. binary-search" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1 font-semibold">Category *</label>
                            <select required value={form.category_slug} onChange={set('category_slug')} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none">
                                <option value="">Select category...</option>
                                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1 font-semibold">Difficulty</label>
                            <select value={form.difficulty} onChange={set('difficulty')} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none">
                                <option>Easy</option><option>Medium</option><option>Hard</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1 font-semibold">Description</label>
                        <textarea rows={3} value={form.description} onChange={set('description')} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none resize-none" placeholder="Problem description..." />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 font-semibold">Constraints (one per line)</label>
                        <textarea rows={3} value={form.constraints_text} onChange={set('constraints_text')} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none resize-none font-mono text-xs" placeholder="1 ≤ n ≤ 10^4&#10;arr is sorted" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 font-semibold">Algorithm Steps (one per line)</label>
                        <textarea rows={3} value={form.steps_text} onChange={set('steps_text')} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none resize-none font-mono text-xs" placeholder="Set L=0, R=n-1&#10;While L ≤ R..." />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 font-semibold">Starter Code</label>
                        <textarea rows={4} value={form.starter_code} onChange={set('starter_code')} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none resize-none font-mono text-xs" placeholder="function solve(arr, target) &#123;&#10;  // your code here&#10;&#125;" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 font-semibold">Solution Code</label>
                        <textarea rows={4} value={form.solution_code} onChange={set('solution_code')} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none resize-none font-mono text-xs" placeholder="Complete solution..." />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1 font-semibold">Input JSON (e.g. &#123;"array":[1,2],"target":5&#125;)</label>
                            <textarea rows={2} value={form.input_json} onChange={set('input_json')} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none font-mono text-xs" placeholder='&#123;"array": [10, 20, 30], "target": 20, "expected": 1&#125;' />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1 font-semibold">YouTube Link</label>
                            <input value={form.youtube_link} onChange={set('youtube_link')} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none" placeholder="https://youtube.com/..." />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1 font-semibold">Visualization Frames JSON (Array of objects)</label>
                        <textarea rows={6} value={form.frames_json} onChange={set('frames_json')} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none resize-none font-mono text-xs" placeholder='[&#123;"array": [10, 20], "pointers": &#123;"L": 0&#125;, "message": "Starting..."&#125;]' />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-800">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-60">
                            {saving ? "Saving..." : initial?.id ? "Update Problem" : "Create Problem"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ──────────────── Problems Manager ────────────────
function ProblemsPage({ toast }) {
    const [problems, setProblems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(null); // null = closed, {} = new, {id...} = edit
    const [search, setSearch] = useState("");
    const [filterCat, setFilterCat] = useState("");
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [p, c] = await Promise.all([
                apiFetch(`${API}/problems${filterCat ? `?category=${filterCat}` : ""}`),
                apiFetch(`${API}/categories`),
            ]);
            setProblems(p.problems);
            setCategories(c.categories);
        } catch (e) { toast(e.message, "error"); }
        finally { setLoading(false); }
    }, [filterCat]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (data) => {
        try {
            if (data.id) {
                await apiFetch(`${API}/problems/${data.id}`, { method: "PUT", body: JSON.stringify(data) });
                toast("Problem updated!", "success");
            } else {
                await apiFetch(`${API}/add-question`, { method: "POST", body: JSON.stringify(data) });
                toast("Problem created!", "success");
            }
            setForm(null);
            load();
        } catch (e) { toast(e.message, "error"); }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        try {
            await apiFetch(`${API}/problems/${id}`, { method: "DELETE" });
            toast("Problem deleted", "success");
            load();
        } catch (e) { toast(e.message, "error"); }
    };

    const filtered = problems.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
    );

    const diffColor = { Easy: "text-green-400 bg-green-400/10", Medium: "text-yellow-400 bg-yellow-400/10", Hard: "text-red-400 bg-red-400/10" };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-white">Problems</h1>
                <button onClick={() => setForm({})} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors">
                    <Plus size={16} /> Add Problem
                </button>
            </div>

            <div className="flex gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-3 text-slate-500 pointer-events-none" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems..." className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 outline-none" />
                </div>
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-slate-400"><RefreshCw size={16} className="animate-spin" /> Loading...</div>
            ) : (
                <div className="space-y-2">
                    {filtered.length === 0 && <p className="text-slate-500 text-sm text-center py-10">No problems found. Add one!</p>}
                    {filtered.map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-xl px-5 py-4 hover:bg-slate-800 transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="font-bold text-white text-sm">{p.title}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${diffColor[p.difficulty] || "text-slate-400 bg-slate-400/10"}`}>{p.difficulty}</span>
                                    <span className="text-xs text-slate-500 bg-slate-700/60 px-2 py-0.5 rounded-full">{p.category}</span>
                                    {!p.is_active && <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">Hidden</span>}
                                </div>
                                <p className="text-xs text-slate-500 mt-1 font-mono">{p.slug}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <button onClick={() => setForm(p)} className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"><Pencil size={15} /></button>
                                <button onClick={() => handleDelete(p.id, p.title)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 size={15} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {form !== null && (
                <ProblemForm categories={categories} initial={form} onSave={handleSave} onClose={() => setForm(null)} />
            )}
        </div>
    );
}

// ──────────────── Categories Manager ────────────────
function CategoriesPage({ toast }) {
    const [cats, setCats] = useState([]);
    const [form, setForm] = useState({ name: "", slug: "", description: "" });
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try { const d = await apiFetch(`${API}/categories`); setCats(d.categories); }
        catch (e) { toast(e.message, "error"); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (editing) {
                await apiFetch(`${API}/categories/${editing}`, { method: "PUT", body: JSON.stringify(form) });
                toast("Category updated!", "success");
            } else {
                await apiFetch(`${API}/categories`, { method: "POST", body: JSON.stringify(form) });
                toast("Category created!", "success");
            }
            setForm({ name: "", slug: "", description: "" });
            setEditing(null);
            load();
        } catch (e) { toast(e.message, "error"); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete category "${name}"?`)) return;
        try { await apiFetch(`${API}/categories/${id}`, { method: "DELETE" }); toast("Deleted", "success"); load(); }
        catch (e) { toast(e.message, "error"); }
    };

    const startEdit = (c) => { setForm({ name: c.name, slug: c.slug, description: c.description || "" }); setEditing(c.id); };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <h1 className="text-2xl font-black text-white mb-6">Categories</h1>
                {loading ? <div className="flex items-center gap-2 text-slate-400"><RefreshCw size={16} className="animate-spin" /> Loading...</div> : (
                    <div className="space-y-3">
                        {cats.map(c => (
                            <div key={c.id} className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-5 py-4">
                                <div>
                                    <p className="font-bold text-white text-sm">{c.name}</p>
                                    <p className="text-xs text-slate-500 font-mono">{c.slug}</p>
                                    {c.description && <p className="text-xs text-slate-400 mt-1">{c.description}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => startEdit(c)} className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-400/10"><Pencil size={15} /></button>
                                    <button onClick={() => handleDelete(c.id, c.name)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10"><Trash2 size={15} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-lg font-bold text-white mb-4">{editing ? "Edit Category" : "Add Category"}</h2>
                <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 font-semibold">Name *</label>
                        <input required value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value, slug: f.slug || e.target.value.toLowerCase().replace(/\s+/g, '-') })); }} className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none" placeholder="e.g. Sorting" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 font-semibold">Slug *</label>
                        <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase() }))} className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none font-mono" placeholder="e.g. sorting" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 font-semibold">Description</label>
                        <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none resize-none" />
                    </div>
                    <div className="flex gap-3">
                        {editing && <button type="button" onClick={() => { setForm({ name: "", slug: "", description: "" }); setEditing(null); }} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-700">Cancel</button>}
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500">
                            {editing ? "Update" : "Add Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ──────────────── Users Manager ────────────────
function UsersPage({ toast, currentUser }) {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try { const d = await apiFetch(`${API}/users`); setUsers(d.users); }
        catch (e) { toast(e.message, "error"); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleToggleAdmin = async (id, name) => {
        if (!window.confirm(`Toggle admin status for "${name}"?`)) return;
        try { await apiFetch(`${API}/users/${id}/toggle-admin`, { method: "PUT" }); toast("Admin status toggled", "success"); load(); }
        catch (e) { toast(e.message, "error"); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete user "${name}" and all their data?`)) return;
        try { await apiFetch(`${API}/users/${id}`, { method: "DELETE" }); toast("User deleted", "success"); load(); }
        catch (e) { toast(e.message, "error"); }
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-white">Users</h1>
                <span className="text-sm text-slate-400">{users.length} total users</span>
            </div>

            <div className="relative mb-5">
                <Search size={15} className="absolute left-3 top-3 text-slate-500 pointer-events-none" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 outline-none" />
            </div>

            {loading ? <div className="flex items-center gap-2 text-slate-400"><RefreshCw size={16} className="animate-spin" /> Loading...</div> : (
                <div className="space-y-2">
                    {filtered.map(u => (
                        <div key={u.id} className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-xl px-5 py-4 hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-sm">{u.name}</span>
                                        {u.is_admin ? <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full font-semibold">Admin</span> : null}
                                        {u.id === currentUser?.id && <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">You</span>}
                                    </div>
                                    <p className="text-xs text-slate-400">{u.email}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">XP: {u.xp} · Solved: {u.problems_solved} · Joined: {new Date(u.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <button title={u.is_admin ? "Remove Admin" : "Make Admin"} onClick={() => handleToggleAdmin(u.id, u.name)} className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors">
                                    {u.is_admin ? <ShieldOff size={15} /> : <Shield size={15} />}
                                </button>
                                {u.id !== currentUser?.id && (
                                    <button onClick={() => handleDelete(u.id, u.name)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 size={15} /></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ──────────────── Admin Login ────────────────
function AdminLogin({ onLogin }) {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setLoading(true);
        // Clean start
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        try {
            // 1. Login
            const loginRes = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await loginRes.json();

            if (!loginRes.ok) throw new Error(data.message || "Login failed");

            // 2. Profile
            const profileRes = await fetch("http://localhost:5000/api/profile", {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.token}` },
            });
            const profileData = await profileRes.json();

            // ──────────────── DEBUG & BYPASS ────────────────
            const dbAdmin = Number(profileData?.user?.is_admin) === 1 || Number(data.user?.is_admin) === 1;
            const isEmailBypass = form.email.toLowerCase().trim() === 'official.payalkangsabanik@gmail.com';

            if (!dbAdmin && !isEmailBypass) {
                console.error("Access Denied Details:", { dbUser: data.user, profileUser: profileData?.user });
                throw new Error("You do not have admin access. (Error Code: ADMIN_FLAG_MISSING)");
            }

            // 3. Success
            const finalUser = { ...(data.user || {}), is_admin: 1 };
            localStorage.setItem("adminToken", data.token);
            localStorage.setItem("user", JSON.stringify(finalUser));
            localStorage.setItem("token", data.token);

            // Give a tiny moment for localStorage to settle
            setTimeout(() => {
                onLogin(finalUser, data.token);
            }, 100);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 mb-4">
                        <span className="text-3xl">⚡</span>
                    </div>
                    <h1 className="text-2xl font-black text-white">AlgoMaster Admin</h1>
                    <p className="text-slate-400 text-sm mt-1">Sign in with your admin account</p>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <div className="text-red-400 text-sm font-medium">{error}</div>
                            {error.includes("ADMIN_FLAG_MISSING") && (
                                <div className="text-[10px] text-red-400/50 mt-1 uppercase tracking-tighter">Please contact system architect</div>
                            )}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Email</label>
                            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" placeholder="admin@example.com" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Password</label>
                            <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full mt-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60">
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ──────────────── Main App Shell ────────────────
export default function AdminApp() {
    const [page, setPage] = useState("dashboard");
    const [user, setUser] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

    useEffect(() => {
        const token = getToken();
        const storedUser = localStorage.getItem("user");
        if (token && storedUser) {
            const u = JSON.parse(storedUser);
            if (u.is_admin) setUser(u);
        }
    }, []);

    const handleLogin = (u) => setUser(u);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        setUser(null);
    };

    if (!user) return <AdminLogin onLogin={handleLogin} />;

    const PAGE_MAP = {
        dashboard: <DashboardPage toast={showToast} />,
        problems: <ProblemsPage toast={showToast} />,
        categories: <CategoriesPage toast={showToast} />,
        users: <UsersPage toast={showToast} currentUser={user} />,
    };

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            <Sidebar active={page} onNav={setPage} onLogout={handleLogout} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    {PAGE_MAP[page]}
                </div>
            </main>
        </div>
    );
}
