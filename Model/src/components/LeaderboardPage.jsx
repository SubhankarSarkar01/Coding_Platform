import React from "react";
import { motion } from "framer-motion";
import { Filter, Search } from "lucide-react";
import useLeaderboard from "../hooks/useLeaderboard";
import LeaderboardTable from "./LeaderboardTable";
import UserCard from "./UserCard";

const TIMEFRAME_OPTIONS = [
  { id: "allTime", label: "All-Time" },
  { id: "weekly", label: "Weekly" },
  { id: "daily", label: "Daily" },
];

export default function LeaderboardPage() {
  const {
    modeLabel,
    timeframe,
    country,
    countries,
    searchTerm,
    users,
    selectedUser,
    currentUsername,
    rankChanges,
    setTimeframe,
    setCountry,
    setSearchTerm,
    setSelectedUser,
  } = useLeaderboard();

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="h-full overflow-hidden bg-slate-950 px-4 py-4"
    >
      <div className="mx-auto grid h-full w-full max-w-[1800px] grid-cols-12 gap-4">
        <aside className="col-span-12 h-full overflow-auto rounded-2xl border border-slate-700/50 bg-slate-900/80 p-4 shadow-glass lg:col-span-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.09em] text-slate-300">Filters</h2>
            <p className="mt-1 text-xs text-slate-500">Refine ranking view by range, country, and user.</p>
          </div>

          <div className="mt-4 space-y-2">
            {TIMEFRAME_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
                  timeframe === option.id
                    ? "border-blue-400/60 bg-blue-500/20 text-blue-100"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800/80"
                }`}
                onClick={() => setTimeframe(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-xs uppercase tracking-[0.08em] text-slate-400">Country</label>
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-400/70"
            >
              {countries.map((countryName) => (
                <option key={countryName} value={countryName}>
                  {countryName}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-xs uppercase tracking-[0.08em] text-slate-400">Search User</label>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-2.5 text-slate-500" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="username..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-400/70"
              />
            </div>
          </div>
        </aside>

        <main className="col-span-12 h-full min-h-0 overflow-hidden lg:col-span-7">
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-700/50 bg-slate-900/80 px-4 py-3 shadow-glass">
            <div>
              <h1 className="text-xl font-bold text-slate-100">{modeLabel}</h1>
              <p className="text-sm text-slate-400">Production-grade ranking board with live movement indicators.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-300">
              <Filter size={12} />
              {timeframe}
            </span>
          </div>

          <div className="h-[calc(100%-84px)] min-h-0">
            <LeaderboardTable
              users={users}
              currentUsername={currentUsername}
              rankChanges={rankChanges}
              onUserSelect={setSelectedUser}
            />
          </div>
        </main>

        <div className="col-span-12 h-full min-h-0 lg:col-span-3">
          <UserCard user={selectedUser} />
        </div>
      </div>
    </motion.section>
  );
}
