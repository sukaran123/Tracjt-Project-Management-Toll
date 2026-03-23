import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { USERS } from '../data/generator';
import { CollaborationUser } from '../types';

const COLLAB_USERS = USERS.slice(0, 4);

export function useCollaboration(taskIds: string[]) {
  const setCollaborators = useStore((s) => s.setCollaborators);
  const taskIdsRef = useRef(taskIds);
  taskIdsRef.current = taskIds;

  useEffect(() => {
    const getRandomTaskId = () => {
      const ids = taskIdsRef.current;
      if (!ids.length) return null;
      return ids[Math.floor(Math.random() * Math.min(ids.length, 30))];
    };

    // Init collaborators
    const initial: CollaborationUser[] = COLLAB_USERS.map((user) => ({
      user,
      currentTaskId: getRandomTaskId(),
      action: Math.random() > 0.5 ? 'viewing' : 'editing',
    }));
    setCollaborators(initial);

    // Simulate movement
    const interval = setInterval(() => {
      setCollaborators((prev: CollaborationUser[]) => {
        // Move 1-2 random collaborators
        const updated = [...prev];
        const count = Math.random() > 0.5 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * updated.length);
          updated[idx] = {
            ...updated[idx],
            currentTaskId: getRandomTaskId(),
            action: Math.random() > 0.3 ? 'viewing' : 'editing',
          };
        }
        return updated;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line
}
