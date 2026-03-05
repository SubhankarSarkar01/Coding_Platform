import React from "react";

export default function IODetailsPanel({ active }) {
  return (
    <div className="io-body scroll">
      <h2 className="algo-title">{active.name}</h2>
      <p className="desc">{active.description}</p>

      <div className="card">
        <h4>Input Array</h4>
        <div className="mono array">[{active.input.array.join(",")}]</div>
      </div>

      <div className="card">
        <h4>Target</h4>
        <div className="mono target">{active.input.target}</div>
      </div>

      <div className="card">
        <h4>Expected Output</h4>
        <div className="mono expected">{active.input.expected}</div>
      </div>
    </div>
  );
}
