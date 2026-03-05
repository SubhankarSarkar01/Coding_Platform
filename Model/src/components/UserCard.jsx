import React from "react";
import { motion } from "framer-motion";
import { Activity, Award, CalendarCheck, Flame } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function UserCard({ user }) {
  if (!user) {
    return (
      <aside className="rounded-2xl border border-slate-700/50 bg-slate-900/80 p-4 text-sm text-slate-400 shadow-glass">
        No user data available.
      </aside>
    );
  }

  return (
    <aside className="h-full overflow-auto rounded-2xl border border-slate-700/50 bg-slate-900/80 p-4 shadow-glass">
      <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Current User</p>
            <h3 className="mt-1 text-lg font-bold text-slate-100">{user.username}</h3>
            <p className="mt-1 text-sm text-slate-400">{user.country}</p>
          </div>
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${user.tier.badgeClass}`}
            title="Rating Tier"
          >
            {user.tier.name}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Award size={12} />
              Level {user.levelInfo.level}
            </span>
            <span>{user.levelInfo.progress}% to next level</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${user.levelInfo.progress}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {user.levelInfo.currentLevelXp} / {user.levelInfo.xpPerLevel} XP
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-700/70 bg-slate-950/60 p-3">
        <p className="mb-3 text-xs uppercase tracking-[0.08em] text-slate-400">Rating Trend</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={user.ratingHistory} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="rating" stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 p-3">
          <p className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Activity size={12} />
            Recent Solved
          </p>
          <p className="mt-1 text-lg font-bold text-slate-100">{user.recentSolved}</p>
        </div>
        <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 p-3">
          <p className="inline-flex items-center gap-1 text-xs text-slate-400">
            <CalendarCheck size={12} />
            Success Rate
          </p>
          <p className="mt-1 text-lg font-bold text-slate-100">{user.successRate}%</p>
        </div>
        <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 p-3">
          <p className="text-xs text-slate-400">Contests</p>
          <p className="mt-1 text-lg font-bold text-slate-100">{user.contests}</p>
        </div>
        <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 p-3">
          <p className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Flame size={12} />
            Streak Bonus
          </p>
          <p className="mt-1 text-lg font-bold text-orange-300">+{user.xpBonus}</p>
        </div>
      </div>
    </aside>
  );
}
