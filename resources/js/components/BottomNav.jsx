import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', icon: '📅', label: 'Тренировки' },
  { to: '/measurements', icon: '📏', label: 'Замеры' },
  { to: '/notes', icon: '📝', label: 'Заметки' },
  { to: '/profile', icon: '👤', label: 'Профиль' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 safe-area-pb z-50 md:hidden">
      <div className="flex justify-around py-2">
        {tabs.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`
            }
          >
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
