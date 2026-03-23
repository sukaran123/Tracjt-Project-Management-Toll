import React from 'react';
import { useStore } from '../../store';

export default function CollabBar() {
  const collaborators = useStore((s) => s.collaborators);

  // ✅ SAFE: ensure array before filtering
  const active = (Array.isArray(collaborators) ? collaborators : [])
    .filter((c) => c?.currentTaskId !== null);

  if (!active.length) return null;

  return (
    <div className="collab-bar">
      <div className="collab-users">
        {active.map((c, i) => (
          <div
            key={c?.user?.id || i}
            className="collab-bar-avatar"
            style={{
              background: c?.user?.color || "#ccc",
              marginLeft: i > 0 ? -8 : 0,
            }}
            title={`${c?.user?.name || "User"} — ${c?.action || ""}`}
          >
            {c?.user?.initials || "U"}

            <span
              className={`pulse-ring sm ${
                c?.action === 'editing' ? 'editing' : ''
              }`}
              style={{ borderColor: c?.user?.color || "#ccc" }}
            />
          </div>
        ))}
      </div>

      <span className="collab-text">
        <span className="collab-count">{active.length}</span>
        {' '}
        {active.length === 1 ? 'person is' : 'people are'} viewing this board
      </span>
    </div>
  );
}