import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  withTabBar?: boolean;
};

export function AppPageShell({ children, withTabBar = false }: Props) {
  return (
    <div className="app-root">
      <div className="app-shell-phone">
        <div className={`app-shell-body${withTabBar ? " app-shell-body--tabs" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
