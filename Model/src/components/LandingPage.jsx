import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full overflow-y-auto bg-[#060912] text-white selection:bg-primary/30">
      <style>{`
        @keyframes starMovement {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
      {/* Deep Space Background */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(80,120,255,0.12), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(120,80,255,0.12), transparent 40%),
            #020617
          `
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[200vh] opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(1.5px 1.5px at 15% 25%, rgba(255,255,255,0.8) 0%, transparent 100%),
              radial-gradient(1px 1px at 78% 12%, rgba(255,255,255,0.8) 0%, transparent 100%),
              radial-gradient(2px 2px at 42% 78%, rgba(255,255,255,0.7) 0%, transparent 100%),
              radial-gradient(1px 1px at 63% 48%, rgba(255,255,255,0.6) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 8% 68%, rgba(255,255,255,0.8) 0%, transparent 100%),
              radial-gradient(2.5px 2.5px at 88% 62%, rgba(255,255,255,0.7) 0%, transparent 100%),
              radial-gradient(1px 1px at 72% 22%, rgba(255,255,255,0.9) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 32% 58%, rgba(255,255,255,0.6) 0%, transparent 100%),
              radial-gradient(2px 2px at 55% 88%, rgba(255,255,255,0.7) 0%, transparent 100%),
              radial-gradient(1px 1px at 22% 42%, rgba(255,255,255,0.8) 0%, transparent 100%)
            `,
            backgroundSize: "100% 50%",
            animation: "starMovement 40s linear infinite"
          }}
        />
      </div>

      {/* Hero Section — Perfectly Centered */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="mx-auto max-w-4xl flex flex-col items-center"
        >


          {/* Hero Heading */}
          <h1 className="mb-6 text-6xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl drop-shadow-sm text-center">
            Master Algorithms. <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              Visually.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-10 max-w-2xl text-lg text-slate-400 sm:text-xl leading-relaxed text-center">
            The premier interactive, responsive, and beautiful environment to learn Data Structures and Algorithms. Jump right into code and see exactly how it works under the hood.
          </p>

          {/* Buttons */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/explore")}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-white transition-all shadow-glow hover:bg-primary/90 hover:scale-105 sm:w-auto"
            >
              Explore Problems
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] sm:w-auto"
            >
              Sign In
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-sm text-slate-600">
        <p>© 2026 AlgoMaster. Elevating CS education.</p>
      </footer>
    </div>
  );
}
