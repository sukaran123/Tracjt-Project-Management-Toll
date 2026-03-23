import React from 'react';
import { CollaborationUser } from '../../types';

interface CollabAvatarsProps {
  collabs: CollaborationUser[];
  small?: boolean;
}

export default function CollabAvatars({ collabs, small }: CollabAvatarsProps) {
  const visible = collabs.slice(0, 2);
  const overflow = collabs.length - 2;

  return (
    <div className={`collab-avatars ${small ? 'small' : ''}`}>
      {visible.map((c, i) => (
        <div
          key={c.user.id}
          className={`collab-dot ${c.action === 'editing' ? 'editing' : 'viewing'}`}
          style={{ background: c.user.color, zIndex: 10 - i }}
          title={`${c.user.name} is ${c.action}`}
        >
          {c.user.initials}
          <span className={`pulse-ring ${c.action === 'editing' ? 'editing' : ''}`}
            style={{ borderColor: c.user.color }}
          />
        </div>
      ))}
      {overflow > 0 && (
        <div className="collab-overflow">+{overflow}</div>
      )}
    </div>
  );
}
