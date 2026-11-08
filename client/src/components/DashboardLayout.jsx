import { NavLink } from 'react-router-dom';

function NavItem({ label, to }) {
  if (to) {
    return (
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          `block rounded-control px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${
            isActive
              ? 'bg-accent font-semibold text-accent-ink'
              : 'text-muted hover:text-text'
          }`
        }
      >
        {label}
      </NavLink>
    );
  }

  return (
    <span
      className="block rounded-control px-3 py-2 text-sm text-faint select-none cursor-default"
      aria-disabled="true"
    >
      {label}
    </span>
  );
}

function DashboardLayout({ navItems, planLabel, onLogout, children }) {
  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-60 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="p-5 border-b border-border">
          <span className="text-lg font-bold text-text">
            DropMy<span className="text-accent">Machine</span>
          </span>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem key={item.label} label={item.label} to={item.to} />
          ))}
        </nav>

        <div className="p-3 border-t border-border flex flex-col gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="group flex w-full items-center gap-3 rounded-card border border-danger/25 bg-danger-surface px-3 py-2.5 text-left text-sm text-muted transition-colors hover:border-danger/50 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <span className="flex-1 group-hover:text-text">Log out</span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-danger-surface text-accent-ink">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </span>
          </button>

          {planLabel && (
            <div className="rounded-card border border-border bg-surface-raised p-3 text-xs text-muted">
              <div className="font-semibold text-text mb-1">Free plan</div>
              <div>{planLabel}</div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}

export default DashboardLayout;
