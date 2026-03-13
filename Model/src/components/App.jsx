import React from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AlgoDashboard from "./AlgoDashboard";
import LeaderboardPage from "./LeaderboardPage";
import Navbar from "./Navbar";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import DashboardPage from "./DashboardPage";
import CategoryPage from "./CategoryPage";
import ExplorePage from "./ExplorePage";
import AdminApp from "./admin/AdminApp";
import LeetCodeProblem from "./LeetCodeProblem";
import useLeaderboard, { LeaderboardProvider } from "../hooks/useLeaderboard";
import { ThemeProvider } from "../hooks/useTheme";

function AppShell() {
  const navigate = useNavigate();
  const { setMode } = useLeaderboard();

  // Clean up any stale mock user sessions (no token = not a real DB user)
  React.useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && !token) {
      // Remove old mock-data user (e.g. "Demo User") left from before MySQL integration
      localStorage.removeItem("user");
    }
  }, []);

  const handleSelectLeaderboard = (mode) => {
    setMode(mode);
    navigate("/leaderboard");
  };

  return (
    <div className="min-h-[100vh] flex flex-col w-full bg-transparent text-text-main transition-colors duration-300">
      <Navbar onSelectLeaderboard={handleSelectLeaderboard} />
      <main className="flex-1 w-full relative">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/:topic" element={<CategoryPage />} />
          <Route path="/problem/:id" element={<AlgoDashboard />} />
          <Route path="/leetcode/:slug" element={<LeetCodeProblem />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          {/* Admin panel — standalone, no Navbar */}
          <Route path="/admin/*" element={<AdminApp />} />
          {/* Main app */}
          <Route path="/*" element={
            <LeaderboardProvider>
              <AppShell />
            </LeaderboardProvider>
          } />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}
