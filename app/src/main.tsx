import { createRoot } from "react-dom/client";
import "@fontsource/orbitron/400.css";
import "@fontsource/orbitron/700.css";
import App from "./App.tsx";
import "./index.css";

document.documentElement.classList.remove("theme-1", "theme-2", "theme-3");
document.documentElement.classList.add("theme-1");

createRoot(document.getElementById("root")!).render(<App />);
