import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function AppPageShell({ children, className = "" }: Props) {
  const cls = ["app-shell-phone", className].filter(Boolean).join(" ");
  return <div className={cls}>{children}</div>;
}
