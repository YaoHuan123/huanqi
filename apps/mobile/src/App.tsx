import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { authTokenStore } from "./lib/authToken";
import { AppShell } from "./layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { WritePage } from "./pages/WritePage";
import { LibraryPage } from "./pages/LibraryPage";
import { MatchesPage } from "./pages/MatchesPage";
import { MatchDetailPage } from "./pages/MatchDetailPage";
import { SettingsPage } from "./pages/SettingsPage";

function RequireAuth({ children }: { children: ReactNode }) {
  if (!authTokenStore.get()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/write" replace />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/matches/:id" element={<MatchDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/write" replace />} />
    </Routes>
  );
}
