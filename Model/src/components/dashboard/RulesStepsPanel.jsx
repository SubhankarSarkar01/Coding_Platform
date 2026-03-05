import React from "react";

export default function RulesStepsPanel({ active }) {
  const youtubeLink = active.youtubeLink?.trim();
  const pptLink = active.pptLink?.trim();

  return (
    <div className="rules-body scroll">
      <h3 className="steps-title">Logic</h3>
      <div className="logic-label">Steps:</div>
      <ol className="steps">
        {active.steps.map((step, i) => (
          <li key={`${step}-${i}`}>{step}</li>
        ))}
      </ol>
      <div className="resource-links">
        <div className="resource-item">
          <span className="resource-label">YouTube Video:</span>
          {youtubeLink ? (
            <a href={youtubeLink} target="_blank" rel="noreferrer">
              Open Video
            </a>
          ) : (
            <span className="resource-placeholder">Add link later</span>
          )}
        </div>
        <div className="resource-item">
          <span className="resource-label">PPT Link:</span>
          {pptLink ? (
            <a href={pptLink} target="_blank" rel="noreferrer">
              Open Slides
            </a>
          ) : (
            <span className="resource-placeholder">Add link later</span>
          )}
        </div>
      </div>
    </div>
  );
}
