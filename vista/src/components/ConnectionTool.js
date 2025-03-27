import React from "react";

export function ConnectionTool({ sourceId, targets, onSelectTarget, onClose }) {
  return (
    <div
      className={
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      }
    >
      <div className={"bg-white p-4 rounded-lg"}>
        <h3 className="font-bold mb-4">Connect annotation {sourceId}</h3>
        <ul className="space-y-2">
          {targets.map((target) => (
            <li key={target.id} className="flex items-center justify-between">
              <span>{target.body}</span>
              <button
                className="rounded bg-coop-indigo px-2 py-1 text-white"
                onClick={() => onSelectTarget(target.id)}
              >
                Connect
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
