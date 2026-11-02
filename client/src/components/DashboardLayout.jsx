function NavItem({ label, active }) {
  if (active) {
    return (
      <span className="block rounded-control bg-accent px-3 py-2 text-sm font-semibold text-accent-ink">
        {label}
      </span>
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
            <NavItem key={item.label} label={item.label} active={item.active} />
          ))}
        </nav>

        <div className="p-3 border-t border-border flex flex-col gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="text-left text-sm text-muted hover:text-text focus:outline-none focus:ring-2 focus:ring-accent rounded-control px-3 py-1.5"
          >
            Log out
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
