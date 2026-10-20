import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider, ProtectedRoute } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Settings from "./pages/Settings";
import Achievements from "./pages/Achievements";
import Planner from "./pages/Planner";
import Todos from "./pages/Todos";
import Journal from "./pages/Journal";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const protectedRoutes = [
  { path: "/", element: <Dashboard /> },
  { path: "/habits", element: <Habits /> },
  { path: "/planner", element: <Planner /> },
  { path: "/todos", element: <Todos /> },
  { path: "/journal", element: <Journal /> },
  { path: "/achievements", element: <Achievements /> },
  { path: "/settings", element: <Settings /> },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" richColors />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              {protectedRoutes.map((r) => (
                <Route
                  key={r.path}
                  path={r.path}
                  element={<ProtectedRoute>{r.element}</ProtectedRoute>}
                />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
