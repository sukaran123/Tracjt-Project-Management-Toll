import { Task, User, Priority, Status } from '../types';

export const USERS: User[] = [
  { id: 'u1', name: 'Alex Morgan', color: '#6366f1', initials: 'AM' },
  { id: 'u2', name: 'Sam Chen', color: '#ec4899', initials: 'SC' },
  { id: 'u3', name: 'Jordan Lee', color: '#f59e0b', initials: 'JL' },
  { id: 'u4', name: 'Taylor Kim', color: '#10b981', initials: 'TK' },
  { id: 'u5', name: 'Riley Park', color: '#3b82f6', initials: 'RP' },
  { id: 'u6', name: 'Casey Wu', color: '#ef4444', initials: 'CW' },
];

const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];
const STATUSES: Status[] = ['todo', 'in-progress', 'in-review', 'done'];

const TASK_TITLES = [
  'Implement authentication flow', 'Design landing page', 'Fix navigation bug',
  'Write unit tests', 'Update API documentation', 'Refactor database schema',
  'Add dark mode support', 'Optimize image loading', 'Set up CI/CD pipeline',
  'Create onboarding flow', 'Migrate to TypeScript', 'Implement search feature',
  'Add export functionality', 'Review security vulnerabilities', 'Deploy to staging',
  'Update dependencies', 'Create email templates', 'Build notification system',
  'Add pagination', 'Implement caching', 'Design mobile layout', 'Code review sprint 4',
  'Write integration tests', 'Fix memory leak', 'Add logging service',
  'Create admin dashboard', 'Implement file upload', 'Build analytics charts',
  'Add rate limiting', 'Setup error monitoring', 'Performance audit',
  'Accessibility improvements', 'SEO optimization', 'Add keyboard shortcuts',
  'Implement undo/redo', 'Build drag and drop', 'Create data visualization',
  'API versioning strategy', 'Database indexing', 'Load testing',
  'Security audit', 'GDPR compliance', 'Internationalization', 'A/B testing setup',
  'Feature flag implementation', 'Webhook integration', 'OAuth setup',
  'Two-factor authentication', 'Session management', 'Password reset flow',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

export function generateTasks(count: number = 500): Task[] {
  const tasks: Task[] = [];
  const now = new Date();
  const pastMonth = new Date(now); pastMonth.setMonth(now.getMonth() - 2);
  const nextMonth = new Date(now); nextMonth.setMonth(now.getMonth() + 2);
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14);

  for (let i = 0; i < count; i++) {
    const titleBase = randomFrom(TASK_TITLES);
    const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const hasStartDate = Math.random() > 0.15; // 15% no start date

    let startDate: string | undefined;
    let dueDate: string;

    const rand = Math.random();
    if (rand < 0.2) {
      // Overdue tasks
      dueDate = randomDate(twoWeeksAgo, yesterday);
      startDate = hasStartDate ? randomDate(pastMonth, new Date(dueDate)) : undefined;
    } else if (rand < 0.25) {
      // Due today
      dueDate = now.toISOString().split('T')[0];
      startDate = hasStartDate ? randomDate(weekAgo, now) : undefined;
    } else {
      dueDate = randomDate(now, nextMonth);
      startDate = hasStartDate ? randomDate(pastMonth, new Date(dueDate)) : undefined;
    }

    tasks.push({
      id: `task-${i + 1}`,
      title: `${titleBase} ${i > 49 ? `(${Math.floor(i / 50) + 1})` : ''}`.trim(),
      status,
      priority,
      assigneeId: USERS[Math.floor(Math.random() * USERS.length)].id,
      startDate,
      dueDate,
      createdAt: randomDate(pastMonth, now),
    });
  }
  return tasks;
}

export const INITIAL_TASKS = generateTasks(520);
