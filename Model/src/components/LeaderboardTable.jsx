import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Crown, Flame, Medal } from "lucide-react";

function RankIcon({ rank }) {
  if (rank === 1) {
    return <Crown size={14} className="text-amber-300" title="Rank 1 Crown" />;
  }
  if (rank === 2) {
    return <Medal size={14} className="text-slate-300" title="Rank 2 Silver Medal" />;
  }
  if (rank === 3) {
    return <Medal size={14} className="text-orange-300" title="Rank 3 Bronze Medal" />;
  }
  return null;
}

export default function LeaderboardTable({ users, currentUsername, rankChanges, onUserSelect }) {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 shadow-glass">
      <div className="h-full overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-900/95 text-xs uppercase tracking-[0.08em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Problems Solved</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Streak</th>
              <th className="px-4 py-3">XP</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {users.map((user) => {
                const movement = rankChanges[user.username];
                const isCurrentUser = user.username === currentUsername;

                return (
                  <motion.tr
                    key={user.username}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className={[
                      "cursor-pointer border-b border-slate-800/80 transition-colors",
                      "hover:bg-slate-800/70",
                      isCurrentUser ? "bg-blue-500/10" : "",
                      movement === "up" ? "bg-emerald-500/10" : "",
                      movement === "down" ? "bg-rose-500/10" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => onUserSelect(user.username)}
                  >
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2">
                        <RankIcon rank={user.rank} />
                        <span className="font-semibold text-slate-100">{user.rank}</span>
                        {movement === "up" ? (
                          <motion.span
                            key={`${user.username}-up`}
                            initial={{ y: 5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="inline-flex items-center text-emerald-300"
                            title="Rank improved"
                          >
                            <ArrowUpRight size={13} />
                          </motion.span>
                        ) : null}
                        {movement === "down" ? (
                          <motion.span
                            key={`${user.username}-down`}
                            initial={{ y: -5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="inline-flex items-center text-rose-300"
                            title="Rank dropped"
                          >
                            <ArrowDownRight size={13} />
                          </motion.span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-100">{user.username}</span>
                        <span className="text-xs text-slate-500">{user.country}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className={`font-semibold ${user.tier.textClass}`}>{user.rating}</div>
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${user.tier.badgeClass}`}
                        >
                          {user.tier.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-200">{user.solved}</td>
                    <td className="px-4 py-3 font-medium text-blue-200">{user.score}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-200"
                        title="Consecutive active coding days"
                      >
                        <Flame size={12} />
                        {user.streak}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-cyan-200">{user.xp}</td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
