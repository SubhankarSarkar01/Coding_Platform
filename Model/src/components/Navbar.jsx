import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogIn, Trophy } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { NAV_LEADERBOARD_OPTIONS } from "../hooks/useLeaderboard";
import { ALGORITHMS, CATEGORIES } from "./dashboard/data";

export default function Navbar({ onSelectLeaderboard }) {
  const [isLeaderboardMenuOpen, setIsLeaderboardMenuOpen] = useState(false);
  const [isProblemDropdownOpen, setIsProblemDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);
  const problemMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isWorkspace = location.pathname.startsWith("/problem");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const onMouseDown = (event) => {
      if (isLeaderboardMenuOpen && !menuRef.current?.contains(event.target)) {
        setIsLeaderboardMenuOpen(false);
      }
      if (isProblemDropdownOpen && !problemMenuRef.current?.contains(event.target)) {
        setIsProblemDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [isLeaderboardMenuOpen, isProblemDropdownOpen]);

  return (
    <header className="relative z-40 h-16 bg-bg-base/80 px-4 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-[1800px] items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-200 transition-colors hover:bg-blue-500/20"
            onClick={() => navigate("/")}
          >
            <span className="text-base">AlgoMaster</span>
            <span className="hidden text-xs text-blue-300/80 sm:inline">DSA IDE</span>
          </button>

          {isWorkspace && (() => {
            const problemSlug = location.pathname.split("/")[2];
            const [localProblem, setLocalProblem] = useState(null);
            const [siblings, setSiblings] = useState([]);

            useEffect(() => {
              if (!problemSlug) return;
              fetch(`http://localhost:5000/api/question/${problemSlug}`)
                .then(res => res.json())
                .then(data => {
                  if (data.problem) {
                    setLocalProblem(data.problem);
                    // Fetch siblings
                    fetch(`http://localhost:5000/api/questions/${data.problem.category}`)
                      .then(r => r.json())
                      .then(d => setSiblings(d.problems || []));
                  }
                });
            }, [problemSlug]);

            if (!localProblem) return null;

            const formatCat = localProblem.category.charAt(0).toUpperCase() + localProblem.category.slice(1).toLowerCase();

            return (
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.85)",
                  marginLeft: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                className="hidden sm:flex"
              >
                <span className="text-white/40">|</span>

                {/* Dropdown Container */}
                <div className="relative" ref={problemMenuRef}>
                  <button
                    onClick={() => setIsProblemDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 transition-colors hover:text-white"
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#60A5FA",
                    }}
                  >
                    {localProblem.title}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isProblemDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isProblemDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-56 custom-scrollbar z-[9999]"
                        style={{
                          background: "#020617",
                          borderRadius: "10px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          padding: "6px",
                          overflow: "hidden",
                        }}
                      >
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                          {siblings.map(sib => (
                            <button
                              key={sib.slug}
                              onClick={() => {
                                navigate(`/problem/${sib.slug}`);
                                setIsProblemDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-150"
                              style={{
                                color: problemSlug === sib.slug ? "#60a5fa" : "rgba(255,255,255,0.7)",
                                background: problemSlug === sib.slug ? "rgba(96,165,250,0.12)" : "transparent",
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(96,165,250,0.12)";
                                e.currentTarget.style.color = "#60a5fa";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = problemSlug === sib.slug ? "rgba(96,165,250,0.12)" : "transparent";
                                e.currentTarget.style.color = problemSlug === sib.slug ? "#60a5fa" : "rgba(255,255,255,0.7)";
                              }}
                            >
                              {sib.title}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <span className="text-white/40">/</span>
                <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate(`/explore/${localProblem.category}`)}>{formatCat}</span>
              </div>
            );
          })()}
        </div>

        <nav className="flex items-center gap-2 text-sm">
          {/* Explore */}
          <button
            type="button"
            className={`rounded-lg px-3 py-2 font-medium transition ${location.pathname.startsWith("/explore")
              ? "bg-bg-elevated text-text-main shadow-sm"
              : "text-text-muted hover:bg-bg-elevated/60 hover:text-text-main"
              }`}
            onClick={() => navigate("/explore")}
          >
            Explore
          </button>

          {/* Leaderboard — always visible, polished dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium text-text-muted transition hover:bg-bg-elevated/60 hover:text-text-main"
              onClick={() => setIsLeaderboardMenuOpen((prev) => !prev)}
            >
              <Trophy size={14} />
              <span>Leaderboard</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${isLeaderboardMenuOpen ? "rotate-180" : "rotate-0"}`}
              />
            </button>

            <AnimatePresence>
              {isLeaderboardMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-0 mt-2 z-[9999]"
                  style={{
                    width: "260px",
                    background: "#0f172a",
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    padding: "14px 0",
                  }}
                >
                  {NAV_LEADERBOARD_OPTIONS.map((option, idx) => (
                    <React.Fragment key={option.id}>
                      <button
                        type="button"
                        className="w-full text-left transition-colors duration-200"
                        style={{ padding: "12px 18px" }}
                        onClick={() => {
                          onSelectLeaderboard(option.id);
                          setIsLeaderboardMenuOpen(false);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(59,130,246,0.15)";
                          e.currentTarget.querySelector(".item-title").style.color = "#60a5fa";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.querySelector(".item-title").style.color = "#f8fafc";
                        }}
                      >
                        <div className="item-title text-sm font-semibold" style={{ color: "#f8fafc", transition: "color 0.2s" }}>
                          {option.title}
                        </div>
                        <div className="mt-0.5 text-xs" style={{ color: "#64748b" }}>
                          {option.subtitle}
                        </div>
                      </button>
                      {/* subtle divider between items (not after last) */}
                      {idx < NAV_LEADERBOARD_OPTIONS.length - 1 && (
                        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 18px" }} />
                      )}
                    </React.Fragment>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Workspace — only shown on /problem pages, with active underline */}
          {isWorkspace && (
            <div className="relative">
              <button
                type="button"
                className="rounded-lg px-3 py-2 font-semibold text-white transition"
                style={{ color: "#60a5fa" }}
                onClick={() => navigate("/problem/binary-search")}
              >
                Workspace
              </button>
              {/* Gradient underline indicator */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "8px",
                  right: "8px",
                  height: "3px",
                  borderRadius: "9999px",
                  background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                }}
              />
            </div>
          )}

          {/* Auth Section */}
          <div className="ml-2 pl-4">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition ${location.pathname === "/dashboard"
                    ? "bg-blue-600/20 text-blue-500 ring-1 ring-blue-500/50"
                    : "bg-bg-elevated text-text-muted hover:text-text-main"
                    }`}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-500">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setUser(null);
                    navigate("/");
                  }}
                  className="rounded-full bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-500 transition hover:bg-red-500/20"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 rounded-full bg-bg-elevated px-4 py-1.5 text-sm font-medium text-text-muted hover:text-text-main transition"
                >
                  <LogIn size={14} />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white transition hover:bg-primary/90 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
