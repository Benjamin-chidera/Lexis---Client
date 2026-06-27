import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import BriefingPage from "./page/briefing/page";
import ChatRoomPage from "./page/chat-room/page";
import CasesPage from "./page/cases/page";
import LoginPage from "./page/login/page";
import "./App.css";
import { BottomNav } from "./components/bottomNav/Bottom-Nav";
import { BellDropdown } from "./components/notifications/BellDropdown";
import { InAppNotification } from "./components/notifications/InAppNotification";
import { CaseAlertPage } from "./page/CaseAlert/page";
// import { MeetingHistoryPage } from "./page/meetingHistory/page";
import { CaseHistoryPage } from "./page/caseHistory/page";
import ErrorPage from "./page/error/page";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAlertStore } from "./store/alertStore";
import { useAuthStore } from "./store/authStore";
import { useCasesStore } from "./store/casesStore";
import socket from "./lib/socket";
import { playNotificationSound } from "./components/notifications/useNotificationSound";
import type { AlertItem } from "./store/alertStore";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

const LogoutButton = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="fixed top-5 right-18 z-[100] w-10 h-10 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all duration-200 shadow-xl cursor-pointer"
      title="Log out"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
};

// Renders chrome (nav bar, bell) only when not on the login page
const AppChrome = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="container mx-auto">
      {!isLoginPage && (
        <>
          <LogoutButton />
          <BellDropdown />
        </>
      )}
      {!isLoginPage && <InAppNotification />}
      {children}
      {!isLoginPage && <BottomNav />}
    </div>
  );
};

const App = () => {
  const fetchAlerts = useAlertStore((state) => state.fetchAlerts);
  const addIncomingAlert = useAlertStore((state) => state.addIncomingAlert);
  const checkSession = useAuthStore((state) => state.checkSession);
  const user = useAuthStore((state) => state.user);
  const fetchCases = useCasesStore((state) => state.fetchCases);

  // Verify the cookie on every page load
  useEffect(() => {
    checkSession();
    fetchAlerts();
  }, [checkSession, fetchAlerts]);

  // Connect/disconnect socket based on auth state.
  // Re-runs whenever user changes (login → connect, logout → disconnect).
  useEffect(() => {
    if (!user) {
      if (socket.connected) socket.disconnect();
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    const handleNewAlert = (data: { alert: AlertItem }) => {
      addIncomingAlert(data.alert);
      playNotificationSound();
      fetchCases();
      fetchAlerts();
    };

    const handleError = (data: { case_name: string; message: string }) => {
      toast.error(`Research Error: ${data.case_name}`, {
        description: data.message,
      });
      fetchCases();
    };

    socket.on("new_alert", handleNewAlert);
    socket.on("research_error", handleError);

    return () => {
      socket.off("new_alert", handleNewAlert);
      socket.off("research_error", handleError);
    };
  }, [user, addIncomingAlert, fetchCases, fetchAlerts]);

  return (
    <main className="w-full min-h-screen bg-black">
      <BrowserRouter>
        <AppChrome>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route path="/" element={<ProtectedRoute><BriefingPage /></ProtectedRoute>} />
            <Route path="/cases" element={<ProtectedRoute><CasesPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatRoomPage /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><CaseAlertPage /></ProtectedRoute>} />
            {/* <Route path="/archive" element={<ProtectedRoute><MeetingHistoryPage /></ProtectedRoute>} /> */}
            <Route path="/history" element={<ProtectedRoute><CaseHistoryPage /></ProtectedRoute>} />

            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </AppChrome>
      </BrowserRouter>
      <Toaster position="top-right" />
    </main>
  );
};

export default App;
