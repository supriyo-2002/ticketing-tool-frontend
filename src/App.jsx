
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/loginPage.jsx";
import Register from "./pages/registerPage.jsx";
import ThankYouPage from "./pages/thankYouPage";
import Dashboard from "./pages/dashboardPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import Projects from "./pages/projectsPage.jsx";
import Tickets from "./pages/ticketsPage.jsx";
import Preferences from "./pages/preferencesPage.jsx";
import AcceptInvite from "./pages/acceptInvitePage.jsx";
import InvitesPage from "./pages/invitesPage";
import ProfilePage from "./pages/profilePage.jsx";
import ForgotPasswordPage from "./pages/forgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/resetPasswordPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Thank You must be PUBLIC */}
        <Route path="/thank-you" element={<ThankYouPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/invites" element={<InvitesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/reset-password" element={<ResetPasswordPage />}/>
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
