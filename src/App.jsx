import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/loginPage.jsx";
import Register from "./pages/registerPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;