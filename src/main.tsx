import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GlobalPreloader } from "./components/GlobalPreloader";

createRoot(document.getElementById("root")!).render(
  <GlobalPreloader>
    <App />
  </GlobalPreloader>
);
