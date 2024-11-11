import { Route, MemoryRouter as Router, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import MainPage from "./pages/home";

import "./css/extention.css";
import PromptsManager from "~pages/prompts";
import { useLocation } from "react-router-dom";

function ContentWrapper() {
  const location = useLocation();

  // Apply different classes based on the route
  const containerClass =
    location.pathname === "/prompts" ? "w-[800px] h-[600px]" : "w-[350px]";

  return (
    <div className={containerClass}>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/prompts" element={<PromptsManager />} />
      </Routes>
    </div>
  );
}

function IndexPopup() {
  return (
    <ThemeProvider>
      <Router>
        <ContentWrapper />
      </Router>
    </ThemeProvider>
  );
}

export default IndexPopup;
