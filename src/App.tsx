import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider, ProtectedRoute } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Achievements from "./pages/Achievements";
import Planner from "./pages/Planner";
import Todos from "./pages/Todos";
import Reminders from "./pages/Reminders";
import Workflows from "./pages/Workflows";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" richColors />
            <Routes>
              {/* Public route */}
              <Route path="/auth" element={<Auth />} />

              {/* Protected routes — redirects to /auth if not logged in */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
              <Route path="/todos" element={<ProtectedRoute><Todos /></ProtectedRoute>} />
              <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
              <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
