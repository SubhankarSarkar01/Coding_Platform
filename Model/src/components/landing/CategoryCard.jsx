import React from "react";
import { motion } from "framer-motion";

const TOPIC_GRADIENTS = {
    Searching: { from: "#1e3a8a", to: "#0ea5e9" },
    Sorting: { from: "#6d28d9", to: "#9333ea" },
    Trees: { from: "#047857", to: "#10b981" },
    Graphs: { from: "#b45309", to: "#f97316" },
};

export default function CategoryCard({ title, icon, tagline, delay, onClick }) {
    const grad = TOPIC_GRADIENTS[title] || { from: "#1e3a8a", to: "#3b82f6" };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay }}
            whileHover={{ scale: 1.03 }}
            onClick={onClick}
            className="cursor-pointer rounded-[20px] overflow-hidden"
            style={{
                background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                padding: "32px",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                boxShadow: `0 8px 32px ${grad.to}33`,
            }}
        >
            {/* Icon */}
            <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 shadow-inner text-white">
                {icon}
            </div>

            {/* Title */}
            <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight leading-tight">
                {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-white/70 font-medium leading-relaxed mb-6">
                {tagline}
            </p>

            {/* CTA Text */}
            <span className="inline-flex items-center gap-2 text-sm font-bold text-white/90 transition-all group-hover:gap-3">
                Start Learning →
            </span>
        </motion.div>
    );
}
