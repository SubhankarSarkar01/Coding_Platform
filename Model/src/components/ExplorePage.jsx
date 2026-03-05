import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, BarChart2, GitFork, Network } from "lucide-react";
import CategoryCard from "./landing/CategoryCard";

export default function ExplorePage() {
    const navigate = useNavigate();
    const [categories, setCategories] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch("http://localhost:5000/api/categories")
            .then(res => res.json())
            .then(data => {
                setCategories(data.categories || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes("search")) return <Search size={28} />;
        if (n.includes("sort")) return <BarChart2 size={28} />;
        if (n.includes("tree")) return <GitFork size={28} />;
        if (n.includes("graph")) return <Network size={28} />;
        return <Search size={28} />;
    };

    return (
        <div className="min-h-[100vh] w-full bg-bg-base text-text-main overflow-y-auto">
            <section className="px-6 py-12 sm:py-16 max-w-[1100px] mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white"
                    >
                        Explore Topics
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Master everything from foundational arrays to complex dynamic programming with our interactive curriculum.
                    </motion.p>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20 text-slate-500">Loading categories...</div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: "32px",
                        }}
                        className="grid-cols-1"
                    >
                        {categories.map((cat, i) => (
                            <CategoryCard
                                key={cat.id}
                                title={cat.name}
                                icon={getIcon(cat.name)}
                                tagline={cat.description || "Learn algorithms and data structures through interactive visualizations."}
                                delay={i * 0.1}
                                onClick={() => navigate(`/explore/${cat.slug}`)}
                            />
                        ))}
                        {categories.length === 0 && (
                            <div className="col-span-full text-center py-20 text-slate-500">No categories found.</div>
                        )}
                    </div>
                )}

            </section>
        </div>
    );
}
