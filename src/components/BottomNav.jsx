import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '首页', icon: '⌂' },
  { to: '/log', label: '记录', icon: '+' },
  { to: '/ai', label: 'AI', icon: '✦' },
  { to: '/calendar', label: '日历', icon: '◷' },
  { to: '/cloud', label: '云遛宠', icon: '☁' },
  { to: '/profile', label: '档案', icon: '◉' },
];

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-paw-border bg-paw-card">
      <div className="mx-auto grid max-w-app grid-cols-6 px-1 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-control px-1 py-2 text-[11px] font-medium transition ${
                isActive ? 'bg-paw-primary text-white' : 'text-paw-muted'
              }`
            }
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
