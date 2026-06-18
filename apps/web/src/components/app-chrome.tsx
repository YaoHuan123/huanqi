"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppPageShell } from "./app-page-shell";
import { AppTabBar } from "./app-tab-bar";

const TAB_ROUTES = ["/write", "/library", "/matches", "/settings"];

function isTabRoute(pathname: string) {
  return TAB_ROUTES.some((route) => pathname === route);
}

function isSubpageRoute(pathname: string) {
  return /^\/matches\/[^/]+$/.test(pathname);
}

type Props = {
  children: ReactNode;
};

export function AppChrome({ children }: Props) {
  const pathname = usePathname();
  const withTabs = isTabRoute(pathname);
  const isSubpage = isSubpageRoute(pathname);

  if (withTabs) {
    return (
      <AppPageShell withTabBar>
        <div className="shell-scroll-y">{children}</div>
        <AppTabBar />
      </AppPageShell>
    );
  }

  if (isSubpage) {
    return (
      <AppPageShell>
        <div className="app-subpage">
          <div className="app-subpage-body shell-scroll-y">{children}</div>
        </div>
      </AppPageShell>
    );
  }

  return (
    <AppPageShell>
      <div className="shell-scroll-y">{children}</div>
    </AppPageShell>
  );
}
