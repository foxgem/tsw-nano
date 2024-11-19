import {
  Route,
  MemoryRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import CommandManager from "./pages/commands";
import MainPage from "./pages/home";

import "./css/extention.css";

function ContentWrapper() {
  const location = useLocation();

  const containerClass =
    location.pathname === "/" ? "w-[350px]" : "w-[750px] h-[600px]";

  return (
    <div className={containerClass}>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route
          path="/system-prompts"
          element={<CommandManager category="system-prompts" />}
        />
        <Route
          path="/quick-actions"
          element={<CommandManager category="quick-actions" />}
        />
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
