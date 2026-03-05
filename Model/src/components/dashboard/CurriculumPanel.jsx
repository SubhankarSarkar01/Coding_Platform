import React from "react";
import { ChevronRight } from "lucide-react";

export default function CurriculumPanel({
  categories,
  expanded,
  activeId,
  onToggleCategory,
  onSelectTopic,
  slugify,
}) {
  return (
    <div className="curriculum scroll">
      {categories.map((cat) => (
        <div key={cat.name}>
          <div className="cat-title" onClick={() => onToggleCategory(cat.name)}>
            {cat.name}
          </div>
          {expanded[cat.name] &&
            cat.items.map((topic) => {
              const id = slugify(topic);
              const isActive = id === activeId;
              return (
                <div
                  key={topic}
                  className={`topic ${isActive ? "active" : ""}`}
                  onClick={() => onSelectTopic(id)}
                >
                  <ChevronRight size={13} />
                  <span>{topic}</span>
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}
