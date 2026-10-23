
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/loginPage.jsx";
import Register from "./pages/registerPage.jsx";
import Dashboard from "./pages/dashboardPage.jsx";

import DashboardLayout from "./components/DashboardLayout.jsx";
import Projects from "./pages/projectsPage.jsx";
import Tickets from "./pages/ticketsPage.jsx";
import Teams from "./pages/teamsPage.jsx";
import Preferences from "./pages/preferencesPage.jsx";
import AcceptInvite from "./pages/acceptInvitePage.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Existing Overview / Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Pages sharing the sidebar layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/projects" element={<Projects />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
