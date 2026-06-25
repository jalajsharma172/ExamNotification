import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import ApiKeys from "./pages/ApiKeys";
import "./globals.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/frontend/history" element={<History />} />
        <Route path="/frontend/api-keys" element={<ApiKeys />} />
      </Routes>
    </Router>
  );
}
