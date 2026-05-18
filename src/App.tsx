import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import BriefingPage from "./page/briefing/page";
import ChatRoomPage from "./page/chat-room/page";
import CasesPage from "./page/cases/page";
import LoginPage from "./page/login/page";
import "./App.css";
import { BottomNav } from "./components/bottomNav/Bottom-Nav";
import { BellDropdown } from "./components/notifications/BellDropdown";
import { InAppNotification } from "./components/notifications/InAppNotification";
import { CallPage } from "./page/call/page";
import { CaseAlertPage } from "./page/CaseAlert/page";
// import { MeetingHistoryPage } from "./page/meetingHistory/page";
import { CaseHistoryPage } from "./page/caseHistory/page";
import ErrorPage from "./page/error/page";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAlertStore } from "./store/alertStore";
import { useAuthStore } from "./store/authStore";
import socket from "./lib/socket";
import { playNotificationSound } from "./components/notifications/useNotificationSound";
import type { AlertItem } from "./store/alertStore";

// Renders chrome (nav bar, bell) only when not on the login page
const AppChrome = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="container mx-auto">
      {!isLoginPage && <BellDropdown />}
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
    };

    socket.on("new_alert", handleNewAlert);

    return () => {
      socket.off("new_alert", handleNewAlert);
    };
  }, [user, addIncomingAlert]);

  return (
    <main className="w-full min-h-screen bg-black">
      <BrowserRouter>
        <AppChrome>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route path="/" element={<ProtectedRoute><BriefingPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatRoomPage /></ProtectedRoute>} />
            <Route path="/cases" element={<ProtectedRoute><CasesPage /></ProtectedRoute>} />
            <Route path="/call" element={<ProtectedRoute><CallPage /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><CaseAlertPage /></ProtectedRoute>} />
            {/* <Route path="/archive" element={<ProtectedRoute><MeetingHistoryPage /></ProtectedRoute>} /> */}
            <Route path="/history" element={<ProtectedRoute><CaseHistoryPage /></ProtectedRoute>} />

            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </AppChrome>
      </BrowserRouter>
    </main>
  );
};

export default App;
