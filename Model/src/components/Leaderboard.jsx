import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Crown, Flame, Trophy } from "lucide-react";

const FILTERS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "allTime", label: "All-Time" },
];

const LEADERBOARD_DATA = {
  daily: [
    { username: "byteNinja", solved: 16, score: 1420, streak: 11 },
    { username: "graphQueen", solved: 15, score: 1395, streak: 9 },
    { username: "heapMaster", solved: 14, score: 1348, streak: 7 },
    { username: "you_dev", solved: 13, score: 1310, streak: 8 },
    { username: "dpWizard", solved: 13, score: 1270, streak: 6 },
    { username: "treePilot", solved: 12, score: 1208, streak: 10 },
    { username: "arrayPro", solved: 11, score: 1174, streak: 4 },
    { username: "codePulse", solved: 10, score: 1110, streak: 5 },
    { username: "algoNomad", solved: 10, score: 1084, streak: 6 },
    { username: "stackKnight", solved: 9, score: 1031, streak: 3 },
  ],
  weekly: [
    { username: "graphQueen", solved: 62, score: 5812, streak: 25 },
    { username: "byteNinja", solved: 59, score: 5620, streak: 21 },
    { username: "you_dev", solved: 57, score: 5444, streak: 20 },
    { username: "dpWizard", solved: 55, score: 5325, streak: 18 },
    { username: "treePilot", solved: 53, score: 5208, streak: 19 },
    { username: "heapMaster", solved: 52, score: 5090, streak: 17 },
    { username: "arrayPro", solved: 49, score: 4860, streak: 16 },
    { username: "algoNomad", solved: 47, score: 4701, streak: 15 },
    { username: "codePulse", solved: 44, score: 4518, streak: 12 },
    { username: "stackKnight", solved: 42, score: 4390, streak: 14 },
  ],
  allTime: [
    { username: "heapMaster", solved: 1024, score: 97220, streak: 101 },
    { username: "dpWizard", solved: 1003, score: 96310, streak: 95 },
    { username: "treePilot", solved: 998, score: 95514, streak: 90 },
    { username: "graphQueen", solved: 987, score: 94700, streak: 88 },
    { username: "byteNinja", solved: 965, score: 93184, streak: 87 },
    { username: "you_dev", solved: 950, score: 92500, streak: 82 },
    { username: "arrayPro", solved: 912, score: 89941, streak: 78 },
    { username: "codePulse", solved: 901, score: 89105, streak: 74 },
    { username: "stackKnight", solved: 884, score: 87620, streak: 70 },
    { username: "algoNomad", solved: 870, score: 86590, streak: 69 },
  ],
};

function crownTone(rank) {
  if (rank === 1) return "crown-gold";
  if (rank === 2) return "crown-silver";
  return "crown-bronze";
}

export default function Leaderboard({ currentUsername = "you_dev" }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState("daily");
  const [movedUsers, setMovedUsers] = useState(new Set());
  const previousRanks = useRef({});

  const entries = useMemo(
    () =>
      (LEADERBOARD_DATA[activeFilter] ?? []).slice(0, 10).map((entry, index) => ({
        ...entry,
        rank: index + 1,
      })),
    [activeFilter],
  );

  useEffect(() => {
    const changed = new Set();
    entries.forEach((entry) => {
      const prevRank = previousRanks.current[entry.username];
      if (prevRank && prevRank !== entry.rank) {
        changed.add(entry.username);
      }
    });

    setMovedUsers(changed);
    previousRanks.current = entries.reduce((acc, entry) => {
      acc[entry.username] = entry.rank;
      return acc;
    }, {});

    if (changed.size === 0) return undefined;

    const timer = window.setTimeout(() => setMovedUsers(new Set()), 650);
    return () => window.clearTimeout(timer);
  }, [entries]);

  return (
    <aside className={`leaderboard${isCollapsed ? " collapsed" : ""}`}>
      <button
        type="button"
        className="leaderboard-toggle"
        onClick={() => setIsCollapsed((prev) => !prev)}
        aria-label={isCollapsed ? "Expand leaderboard" : "Collapse leaderboard"}
      >
        {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {isCollapsed ? (
        <div className="leaderboard-collapsed">
          <Trophy size={18} />
          <span>Leaderboard</span>
        </div>
      ) : (
        <div className="leaderboard-inner">
          <div className="leaderboard-header">
            <h3>
              <Trophy size={16} />
              <span>Leaderboard</span>
            </h3>
            <div className="leaderboard-filters">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`leaderboard-filter${activeFilter === filter.id ? " active" : ""}`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="leaderboard-table-wrap scroll">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Solved</th>
                  <th>Score</th>
                  <th>Streak</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isCurrentUser = entry.username === currentUsername;
                  const hasMoved = movedUsers.has(entry.username);

                  return (
                    <tr
                      key={entry.username}
                      className={[
                        "leaderboard-row",
                        isCurrentUser ? "current-user" : "",
                        hasMoved ? "rank-shift" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td>
                        <div className="rank-cell">
                          {entry.rank <= 3 ? <Crown size={12} className={crownTone(entry.rank)} /> : null}
                          <span>{entry.rank}</span>
                        </div>
                      </td>
                      <td>{entry.username}</td>
                      <td>{entry.solved}</td>
                      <td>{entry.score}</td>
                      <td>
                        <span className="streak-cell">
                          <Flame size={11} />
                          {entry.streak}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </aside>
  );
}
