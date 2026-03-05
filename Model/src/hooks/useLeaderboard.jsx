import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const LeaderboardContext = createContext(null);

export const NAV_LEADERBOARD_OPTIONS = [
    { id: "allTime", title: "Global Ranking", subtitle: "Worldwide top coders" },
    { id: "weekly", title: "Weekly Contest", subtitle: "Live weekly leaderboard" },
    { id: "daily", title: "Daily Challenge", subtitle: "Daily sprint performers" },
    { id: "friends", title: "Friends Ranking", subtitle: "Compare with your network" },
];

const RATING_TIERS = [
    { name: "Beginner", min: 0, max: 200, textClass: "text-slate-300", badgeClass: "border-slate-500/60 bg-slate-700/40 text-slate-200" },
    { name: "Specialist", min: 201, max: 500, textClass: "text-emerald-300", badgeClass: "border-emerald-500/60 bg-emerald-600/20 text-emerald-200" },
    { name: "Expert", min: 501, max: 1000, textClass: "text-sky-300", badgeClass: "border-sky-500/60 bg-sky-600/20 text-sky-200" },
    { name: "Master", min: 1001, max: 999999, textClass: "text-rose-300", badgeClass: "border-rose-500/60 bg-rose-600/20 text-rose-200" },
];

function getRatingTier(score) {
    return RATING_TIERS.find((tier) => score >= tier.min && score <= tier.max) ?? RATING_TIERS[0];
}

function getLevelFromXp(xp) {
    const xpPerLevel = 500;
    const level = Math.floor(xp / xpPerLevel) + 1;
    const currentLevelXp = xp % xpPerLevel;
    const progress = Math.round((currentLevelXp / xpPerLevel) * 100);
    return { level, progress, currentLevelXp, xpPerLevel };
}

export function LeaderboardProvider({ children }) {
    const [rankedUsers, setRankedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [country, setCountry] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/leaderboard?country=${country}`);
            const data = await res.json();
            if (data.leaderboard) {
                const processed = data.leaderboard.map((u, i) => {
                    const score = u.xp || 0;
                    return {
                        username: u.name,
                        country: u.country || "Unknown",
                        xp: u.xp || 0,
                        score: score,
                        rating: score, // Simple rating = score
                        rank: i + 1,
                        solved: u.problems_solved || 0,
                        streak: 0, // Mock for now
                        tier: getRatingTier(score),
                        levelInfo: getLevelFromXp(u.xp || 0),
                        ratingHistory: [
                            { label: "Day 1", rating: Math.round(score * 0.8) },
                            { label: "Today", rating: score }
                        ],
                        recentSolved: u.problems_solved || 0,
                        successRate: 100,
                        contests: 0,
                        xpBonus: 0
                    };
                });
                setRankedUsers(processed);
                if (processed.length > 0 && !selectedUser) {
                    setSelectedUser(processed[0].username);
                }
            }
        } catch (err) {
            console.error("Leaderboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [country, selectedUser]);

    useEffect(() => {
        fetchLeaderboard();
    }, [country, fetchLeaderboard]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return rankedUsers;
        return rankedUsers.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [rankedUsers, searchTerm]);

    const selectedUserData = useMemo(() => {
        return rankedUsers.find(u => u.username === selectedUser) || rankedUsers[0] || null;
    }, [rankedUsers, selectedUser]);

    const value = {
        modeLabel: "Global Ranking",
        timeframe: "allTime",
        countries: ["All", "India", "USA", "UK"],
        country,
        setCountry,
        searchTerm,
        setSearchTerm,
        users: filteredUsers,
        rankedUsers,
        selectedUser: selectedUserData,
        currentUsername: JSON.parse(localStorage.getItem("user") || "{}").name,
        rankChanges: {},
        setTimeframe: () => { },
        setSelectedUser,
        refresh: fetchLeaderboard
    };

    return <LeaderboardContext.Provider value={value}>{children}</LeaderboardContext.Provider>;
}

export default function useLeaderboard() {
    const context = useContext(LeaderboardContext);
    if (!context) throw new Error("useLeaderboard must be used within a LeaderboardProvider.");
    return context;
}
