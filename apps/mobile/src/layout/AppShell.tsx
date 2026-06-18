import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/write", label: "Write", icon: "write" },
  { to: "/library", label: "Mine", icon: "library" },
  { to: "/matches", label: "Matches", icon: "matches" },
  { to: "/settings", label: "Me", icon: "me" },
] as const;

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "var(--shell-brand)" : "currentColor";
  if (name === "write") {
    return (
      <svg className="app-shell-tab__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 20h7M15.5 4.5l4 4M5 20l9.5-9.5a2.12 2.12 0 0 0 0-3L16 3a2.12 2.12 0 0 0-3 0L3.5 12.5V20H5z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "library") {
    return (
      <svg className="app-shell-tab__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "matches") {
    return (
      <svg className="app-shell-tab__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.2l5-.7L12 3z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg className="app-shell-tab__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke={stroke} strokeWidth="1.8" />
      <path
        d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppShell() {
  return (
    <div className="app-root">
      <div className="app-shell-phone">
        <div className="app-shell-body app-shell-body--tabs">
          <div className="shell-scroll-y">
            <Outlet />
          </div>
        </div>
        <div className="app-shell-tabbar-outer">
          <nav className="app-shell-tabbar" aria-label="Main">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) => (isActive ? "app-shell-tab active" : "app-shell-tab")}
              >
                {({ isActive }) => (
                  <>
                    <TabIcon name={tab.icon} active={isActive} />
                    <span>{tab.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
