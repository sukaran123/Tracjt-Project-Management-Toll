import React, { useMemo, useEffect } from 'react';
import { useStore } from './store';
import { useURLSync } from './hooks/useURLSync';
import { useCollaboration } from './hooks/useCollaboration';
import KanbanBoard from './components/kanban/KanbanBoard';
import ListView from './components/list/ListView';
import TimelineView from './components/timeline/TimelineView';
import FilterBar from './components/filters/FilterBar';
import CollabBar from './components/collaboration/CollabBar';
import './styles.css';

export default function App() {
  const { view, setView, getFilteredTasks } = useStore((s) => ({
    view: s.view,
    setView: s.setView,
    getFilteredTasks: s.getFilteredTasks,
  }));

  useURLSync();
  const filteredTasks = getFilteredTasks();

  // Get all task IDs for collaboration simulation
  const allTaskIds = useMemo(() => filteredTasks.map((t) => t.id), [filteredTasks]);
  useCollaboration(allTaskIds);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">Trackt</span>
          </div>
          <CollabBar />
        </div>
        <div className="header-right">
          <div className="view-switcher">
            {(['kanban', 'list', 'timeline'] as const).map((v) => (
              <button
                key={v}
                className={`view-btn ${view === v ? 'active' : ''}`}
                onClick={() => setView(v)}
              >
                {v === 'kanban' && <span>⊞</span>}
                {v === 'list' && <span>☰</span>}
                {v === 'timeline' && <span>⊟</span>}
                <span className="view-label">{v.charAt(0).toUpperCase() + v.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <FilterBar />

      {/* Main content */}
      <main className="app-main">
        <div className={`view-container ${view === 'kanban' ? 'active' : 'hidden'}`}>
          <KanbanBoard tasks={filteredTasks} />
        </div>
        <div className={`view-container ${view === 'list' ? 'active' : 'hidden'}`}>
          <ListView tasks={filteredTasks} />
        </div>
        <div className={`view-container ${view === 'timeline' ? 'active' : 'hidden'}`}>
          <TimelineView tasks={filteredTasks} />
        </div>
      </main>
    </div>
  );
}
